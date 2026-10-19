-- Manual Drive: riders help BAK find the factory service/repair manuals it is missing.
-- Uploaded files stay private (service role only). The first verified upload for a wanted bike-year earns a reward code.

create table if not exists public.manual_wanted(
 id text primary key,                         -- "<make>|<model>|<year>"
 manufacturer text not null,
 model text not null,
 model_year int not null,
 manual_name text not null,
 publication text,
 status text not null default 'WANTED' check (status in ('WANTED','RECEIVED','HAVE')),
 buy jsonb not null default '[]'::jsonb,      -- [{seller,url,price,kind}]
 received_contribution uuid,
 received_at timestamptz,
 updated_at timestamptz not null default now()
);
create index if not exists manual_wanted_status on public.manual_wanted(status,manufacturer,model,model_year);
alter table public.manual_wanted enable row level security;
do $$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='manual_wanted' and policyname='manual_wanted_read') then create policy manual_wanted_read on public.manual_wanted for select to anon,authenticated using (true); end if; end $$;

create table if not exists public.manual_contributions(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 wanted_id text references public.manual_wanted(id),
 storage_path text not null,
 file_name text not null default '',
 file_sha256 text,
 bytes bigint,
 pages int,
 status text not null default 'UPLOADING' check (status in ('UPLOADING','CHECKING','ACCEPTED','REJECTED','ALREADY_RECEIVED','PRIVATE')),
 verdict jsonb,
 reason text,
 attested boolean not null default false,
 created_at timestamptz not null default now(),
 checked_at timestamptz
);
create index if not exists manual_contributions_user on public.manual_contributions(user_id,created_at desc);
create unique index if not exists manual_contributions_sha on public.manual_contributions(file_sha256) where status='ACCEPTED';
alter table public.manual_contributions enable row level security;
do $$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='manual_contributions' and policyname='manual_contributions_own') then create policy manual_contributions_own on public.manual_contributions for select to authenticated using (user_id=auth.uid()); end if; end $$;

create table if not exists public.reward_codes(
 code text primary key,
 issued_to uuid not null references auth.users(id) on delete cascade,
 contribution_id uuid references public.manual_contributions(id),
 tier text not null default 'premium' check (tier in ('premium','pro')),
 days int not null default 365 check (days between 1 and 730),
 redeemed_by uuid references auth.users(id) on delete set null,
 redeemed_at timestamptz,
 created_at timestamptz not null default now()
);
alter table public.reward_codes enable row level security;
do $$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='reward_codes' and policyname='reward_codes_own') then create policy reward_codes_own on public.reward_codes for select to authenticated using (issued_to=auth.uid() or redeemed_by=auth.uid()); end if; end $$;

create table if not exists public.reward_grants(
 user_id uuid primary key references auth.users(id) on delete cascade,
 tier text not null check (tier in ('premium','pro')),
 ends_at timestamptz not null,
 updated_at timestamptz not null default now()
);
alter table public.reward_grants enable row level security;
do $$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='reward_grants' and policyname='reward_grants_own') then create policy reward_grants_own on public.reward_grants for select to authenticated using (user_id=auth.uid()); end if; end $$;

-- Atomic: first verified upload wins; a second verified copy of the same bike-year is thanked but not rewarded.
create or replace function public.accept_manual_contribution(p_contribution uuid,p_wanted text[],p_code text)
returns text language plpgsql security definer set search_path=public as $$
declare v_user uuid; v_rows int;
begin
 select user_id into v_user from manual_contributions where id=p_contribution and status='CHECKING' for update;
 if v_user is null then return 'NOT_CHECKING'; end if;
 update manual_wanted set status='RECEIVED',received_contribution=p_contribution,received_at=now(),updated_at=now() where id=any(p_wanted) and status='WANTED';
 get diagnostics v_rows=row_count;
 if v_rows=0 then
  update manual_contributions set status='ALREADY_RECEIVED',checked_at=now() where id=p_contribution;
  return 'ALREADY_RECEIVED';
 end if;
 update manual_contributions set status='ACCEPTED',checked_at=now() where id=p_contribution;
 insert into reward_codes(code,issued_to,contribution_id,tier,days) values(p_code,v_user,p_contribution,'premium',365);
 return 'ACCEPTED';
end $$;
revoke all on function public.accept_manual_contribution(uuid,text[],text) from public,anon,authenticated;

-- Redeeming extends any running reward by the code's days.
create or replace function public.redeem_reward_code(p_code text,p_user uuid)
returns timestamptz language plpgsql security definer set search_path=public as $$
declare v reward_codes; v_end timestamptz;
begin
 select * into v from reward_codes where code=upper(trim(p_code)) for update;
 if v.code is null then raise exception 'CODE_NOT_FOUND'; end if;
 if v.redeemed_at is not null then raise exception 'CODE_USED'; end if;
 update reward_codes set redeemed_by=p_user,redeemed_at=now() where code=v.code;
 insert into reward_grants(user_id,tier,ends_at) values(p_user,v.tier,now()+make_interval(days=>v.days))
 on conflict(user_id) do update set ends_at=greatest(reward_grants.ends_at,now())+make_interval(days=>v.days),
  tier=case when reward_grants.tier='pro' or excluded.tier='pro' then 'pro' else 'premium' end,updated_at=now()
 returning ends_at into v_end;
 return v_end;
end $$;
revoke all on function public.redeem_reward_code(text,uuid) from public,anon,authenticated;

do $$ begin
 if to_regclass('storage.buckets') is not null then
  insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
  values('manual-contributions','manual-contributions',false,209715200,array['application/pdf'])
  on conflict (id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
 end if;
end $$;
