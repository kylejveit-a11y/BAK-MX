-- Run only on the dedicated BAK MX project. Every fixture is rolled back.
begin;
select set_config('bakmx.test_owner',gen_random_uuid()::text,true);
select set_config('bakmx.test_other',gen_random_uuid()::text,true);
select set_config('bakmx.test_bike',gen_random_uuid()::text,true);
insert into auth.users(id) values(current_setting('bakmx.test_owner')::uuid),(current_setting('bakmx.test_other')::uuid);
insert into public.bikes(id,user_id,manufacturer,model,model_year,variant,region)
values(current_setting('bakmx.test_bike')::uuid,current_setting('bakmx.test_owner')::uuid,'KTM','450 SX-F',2025,'standard','US');
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('bakmx.test_other'),true);
do $$ begin
 if exists(select 1 from public.bikes where id=current_setting('bakmx.test_bike')::uuid) then raise exception 'Cross-owner bike disclosure';end if;
 if has_table_privilege('authenticated','public.subscriptions','INSERT') or has_table_privilege('authenticated','public.mobile_entitlements','INSERT') then raise exception 'Client billing authority';end if;
 if has_table_privilege('authenticated','public.messages','INSERT') then raise exception 'Client can forge assistant messages';end if;
 if has_table_privilege('authenticated','public.ai_requests','SELECT') then raise exception 'Client can read private audits';end if;
 if has_function_privilege('authenticated','public.reserve_ai_request(uuid,uuid,integer)','EXECUTE') then raise exception 'Client quota authority';end if;
 if has_function_privilege('authenticated','public.sync_mobile_entitlement(uuid,text,timestamp with time zone,text,text,boolean,bigint)','EXECUTE') then raise exception 'Client store authority';end if;
end $$;
select set_config('request.jwt.claim.sub',current_setting('bakmx.test_owner'),true);
do $$ begin
 if not exists(select 1 from public.bikes where id=current_setting('bakmx.test_bike')::uuid) then raise exception 'Owner cannot read bike';end if;
end $$;
reset role;
-- Verify completion refuses a changed bike, without leaving any test data.
select set_config('bakmx.test_conversation',gen_random_uuid()::text,true);
select set_config('bakmx.test_request',gen_random_uuid()::text,true);
insert into public.conversations(id,user_id,bike_id,title,mode) values(current_setting('bakmx.test_conversation')::uuid,current_setting('bakmx.test_owner')::uuid,current_setting('bakmx.test_bike')::uuid,'Rollback-only verification','diagnose');
insert into public.ai_requests(request_id,user_id,conversation_id,input,state,bike_snapshot)
select current_setting('bakmx.test_request')::uuid,b.user_id,current_setting('bakmx.test_conversation')::uuid,'Rollback-only question','processing',to_jsonb(b) from public.bikes b where id=current_setting('bakmx.test_bike')::uuid;
update public.bikes set configuration='{"exhaust":"changed"}' where id=current_setting('bakmx.test_bike')::uuid;
do $$ begin
 begin
  perform public.complete_ai_request(current_setting('bakmx.test_owner')::uuid,current_setting('bakmx.test_request')::uuid,'{"summary":"Test only"}','{}');
  raise exception 'Old bike snapshot was accepted';
 exception when raise_exception then
  if sqlerrm<>'BAK_MX_CONTEXT_CHANGED' then raise;end if;
 end;
 if exists(select 1 from public.messages where conversation_id=current_setting('bakmx.test_conversation')::uuid) then raise exception 'Rejected answer left messages';end if;
end $$;
update public.bikes set configuration='{}' where id=current_setting('bakmx.test_bike')::uuid;
select public.complete_ai_request(current_setting('bakmx.test_owner')::uuid,current_setting('bakmx.test_request')::uuid,'{"summary":"Test only"}','{}');
do $$ begin
 if (select count(*) from public.messages where conversation_id=current_setting('bakmx.test_conversation')::uuid)<>2 then raise exception 'Completion was not atomic';end if;
end $$;
do $$ begin
 if has_table_privilege('anon','public.bikes','SELECT') then raise exception 'Anonymous bike access';end if;
 if exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and not c.relrowsecurity) then raise exception 'Public table without RLS';end if;
end $$;
rollback;
select 'PASS: owner isolation, billing/message/audit privileges, RLS and bike-snapshot binding; fixtures rolled back' as result;
