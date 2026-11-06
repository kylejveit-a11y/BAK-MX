-- Kyle, 2026-11-06: every account on the bakmx.com domain gets full, unrestricted access (team and riders he sets up).
-- Granted only once the address is confirmed, so nobody can claim it by typing a bakmx.com address they do not own.
alter table public.complimentary_access add column if not exists unlimited boolean not null default false;

create or replace function private.grant_bakmx_team_access() returns trigger
language plpgsql security definer set search_path to '' as $f$
begin
 if new.email_confirmed_at is not null and lower(split_part(new.email,'@',2))='bakmx.com' then
  insert into public.complimentary_access(user_id,tier,reason,unlimited)
  values (new.id,'pro','bakmx.com team account (automatic)',true)
  on conflict (user_id) do update set tier='pro',unlimited=true;
 end if;
 return new;
end $f$;
revoke all on function private.grant_bakmx_team_access() from public, anon, authenticated;

do $d$ begin
 if (select count(*) from information_schema.columns where table_schema='auth' and table_name='users' and column_name in ('email','email_confirmed_at'))=2 and not exists (select 1 from pg_trigger where tgname='bakmx_team_access') then
  create trigger bakmx_team_access after insert or update of email, email_confirmed_at on auth.users
  for each row execute function private.grant_bakmx_team_access();
  -- Accounts already on the domain.
  insert into public.complimentary_access(user_id,tier,reason,unlimited)
  select id,'pro','bakmx.com team account (automatic)',true from auth.users
  where email_confirmed_at is not null and lower(split_part(email,'@',2))='bakmx.com'
  on conflict (user_id) do update set tier='pro',unlimited=true;
 end if;
end $d$;
