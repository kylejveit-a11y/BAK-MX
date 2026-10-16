-- Free plan trial (Kyle, 2026-10-16): a new account gets 7 sets of 20 Ask BAK questions. The first set is ready on day one;
-- when a set is used up the rider can start the next one whenever they choose (we suggest spacing them across a week). After
-- the 7th set, Free riders buy credit packs or a plan. Trial questions are ledger grants, so they are spent exactly like
-- credits and a set can never be granted twice (reference 'trial:<user>:<n>' is unique).

-- Returns the set number just started, 0 when every set is used, or -1 when the current set still has questions left.
create or replace function public.start_trial_block(p_user_id uuid,p_blocks integer,p_size integer) returns integer language plpgsql security invoker set search_path='' as $$
declare started integer; bal integer;
begin
 if p_blocks<1 or p_blocks>30 or p_size<1 or p_size>500 then raise exception 'invalid trial configuration'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_user_id::text,0));
 select count(*) into started from public.ai_credit_ledger where user_id=p_user_id and reference like 'trial:'||p_user_id::text||':%';
 if started>=p_blocks then return 0; end if;
 if started>0 then
  select coalesce(sum(delta),0) into bal from public.ai_credit_ledger where user_id=p_user_id;
  if bal>0 then return -1; end if;
 end if;
 insert into public.ai_credit_ledger(user_id,delta,reason,reference,product) values(p_user_id,p_size,'grant','trial:'||p_user_id::text||':'||(started+1)::text,'free_trial');
 return started+1;
end $$;

create or replace function public.trial_blocks_started(p_user_id uuid) returns integer language sql stable security invoker set search_path='' as $$
 select count(*)::integer from public.ai_credit_ledger where user_id=p_user_id and reference like 'trial:'||p_user_id::text||':%';
$$;

revoke all on function public.start_trial_block(uuid,integer,integer) from public,anon,authenticated;
revoke all on function public.trial_blocks_started(uuid) from public,anon,authenticated;
grant execute on function public.start_trial_block(uuid,integer,integer) to service_role;
grant execute on function public.trial_blocks_started(uuid) to service_role;
