-- Store entitlement authority is server-only; native client state cannot grant access.
create table public.mobile_entitlements (
 user_id uuid primary key references auth.users on delete cascade,
 status text not null default 'none', current_period_end timestamptz,
 product_identifier text, store text, is_sandbox boolean not null default false,
 checked_at timestamptz not null default now(), provider_request_at bigint not null default 0
);
alter table public.mobile_entitlements enable row level security;
revoke all on public.mobile_entitlements from anon,authenticated;
grant select on public.mobile_entitlements to authenticated;
grant all on public.mobile_entitlements to service_role;
create policy owner_select on public.mobile_entitlements for select to authenticated using((select auth.uid())=user_id);
create function public.sync_mobile_entitlement(p_user_id uuid,p_status text,p_period_end timestamptz,p_product text,p_store text,p_sandbox boolean,p_request_at bigint) returns void language sql security invoker set search_path='' as $$
 insert into public.mobile_entitlements(user_id,status,current_period_end,product_identifier,store,is_sandbox,checked_at,provider_request_at)
 values(p_user_id,p_status,p_period_end,p_product,p_store,p_sandbox,now(),p_request_at)
 on conflict(user_id) do update set status=excluded.status,current_period_end=excluded.current_period_end,product_identifier=excluded.product_identifier,store=excluded.store,is_sandbox=excluded.is_sandbox,checked_at=now(),provider_request_at=excluded.provider_request_at
 where public.mobile_entitlements.provider_request_at<=excluded.provider_request_at;
$$;
revoke all on function public.sync_mobile_entitlement(uuid,text,timestamptz,text,text,boolean,bigint) from public,anon,authenticated;
grant execute on function public.sync_mobile_entitlement(uuid,text,timestamptz,text,text,boolean,bigint) to service_role;
