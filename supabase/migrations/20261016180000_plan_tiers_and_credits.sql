-- Ask BAK plans (Free / Premium / Pro) and credit packs (approved by Kyle 2026-10-16).
-- Each plan has a daily allowance of questions; Pro is unlimited with a fair-use ceiling. Credits are bought in packs, never
-- expire, and are spent only after the day's included questions are used. Every purchase and every use is a ledger row whose
-- reference is unique, so a repeated store or Stripe notification can never grant twice.

alter table public.subscriptions add column if not exists price_id text;
alter table public.ai_usage add column if not exists funded_by text not null default 'included';
do $$ begin
 if not exists(select 1 from pg_constraint where conname='ai_usage_funded_by_check') then
  alter table public.ai_usage add constraint ai_usage_funded_by_check check (funded_by in ('included','credit'));
 end if;
end $$;

create table if not exists public.ai_credit_ledger(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users on delete cascade,
 delta integer not null check (delta<>0),
 reason text not null check (reason in ('purchase','use','refund','grant')),
 reference text not null unique,
 product text,
 created_at timestamptz not null default now()
);
create index if not exists ai_credit_ledger_user on public.ai_credit_ledger(user_id,created_at);
alter table public.ai_credit_ledger enable row level security;
revoke all on public.ai_credit_ledger from anon,authenticated;
grant select on public.ai_credit_ledger to authenticated;
grant all on public.ai_credit_ledger to service_role;
do $$ begin
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='ai_credit_ledger' and policyname='owner_select') then
  create policy owner_select on public.ai_credit_ledger for select to authenticated using((select auth.uid())=user_id);
 end if;
end $$;

create or replace function public.ai_credit_balance(p_user_id uuid) returns integer language sql stable security invoker set search_path='' as $$
 select coalesce(sum(delta),0)::integer from public.ai_credit_ledger where user_id=p_user_id;
$$;

-- 'included' (within today's allowance), 'credit' (allowance used, one credit spent), 'limit' (neither), 'duplicate'
-- (this request id was already counted: a retry of the same question).
create or replace function public.reserve_ai_request_v2(p_user_id uuid,p_request_id uuid,p_daily_limit integer) returns text language plpgsql security invoker set search_path='' as $$
declare used integer; bal integer;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user_id::text,0));
 if exists(select 1 from public.ai_usage where request_id=p_request_id) then return 'duplicate'; end if;
 select count(*) into used from public.ai_usage where user_id=p_user_id and funded_by='included'
  and created_at>=date_trunc('day',now() at time zone 'UTC') at time zone 'UTC';
 if p_daily_limit>0 and used<p_daily_limit then
  insert into public.ai_usage(request_id,user_id,funded_by) values(p_request_id,p_user_id,'included');return 'included';
 end if;
 select coalesce(sum(delta),0) into bal from public.ai_credit_ledger where user_id=p_user_id;
 if bal>0 then
  insert into public.ai_usage(request_id,user_id,funded_by) values(p_request_id,p_user_id,'credit');
  insert into public.ai_credit_ledger(user_id,delta,reason,reference) values(p_user_id,-1,'use','use:'||p_request_id::text);
  return 'credit';
 end if;
 return 'limit';
end $$;

-- Grants once per reference (store transaction or Stripe Checkout session). Returns true when newly granted.
create or replace function public.grant_ai_credits(p_user_id uuid,p_credits integer,p_reference text,p_reason text,p_product text) returns boolean language plpgsql security invoker set search_path='' as $$
begin
 if p_credits<=0 or p_credits>10000 then raise exception 'invalid credit amount'; end if;
 insert into public.ai_credit_ledger(user_id,delta,reason,reference,product) values(p_user_id,p_credits,p_reason,p_reference,p_product)
 on conflict (reference) do nothing;
 return found;
end $$;

create or replace function public.sync_subscription_v2(p_user_id uuid,p_customer_id text,p_subscription_id text,p_status text,p_period_end timestamptz,p_cancel boolean,p_event_created bigint,p_price_id text) returns void language sql security invoker set search_path='' as $$
 update public.subscriptions set stripe_subscription_id=p_subscription_id,status=p_status,current_period_end=p_period_end,cancel_at_period_end=p_cancel,price_id=p_price_id,updated_at=now(),last_event_created=p_event_created
 where user_id=p_user_id and stripe_customer_id=p_customer_id and last_event_created<=p_event_created;
$$;

revoke all on function public.ai_credit_balance(uuid) from public,anon,authenticated;
revoke all on function public.reserve_ai_request_v2(uuid,uuid,integer) from public,anon,authenticated;
revoke all on function public.grant_ai_credits(uuid,integer,text,text,text) from public,anon,authenticated;
revoke all on function public.sync_subscription_v2(uuid,text,text,text,timestamptz,boolean,bigint,text) from public,anon,authenticated;
grant execute on function public.ai_credit_balance(uuid) to service_role;
grant execute on function public.reserve_ai_request_v2(uuid,uuid,integer) to service_role;
grant execute on function public.grant_ai_credits(uuid,integer,text,text,text) to service_role;
grant execute on function public.sync_subscription_v2(uuid,text,text,text,timestamptz,boolean,bigint,text) to service_role;
