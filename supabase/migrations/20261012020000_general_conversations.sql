-- A conversation may now have no build: general questions answered from background knowledge only.
-- A general conversation has no bike row to lock and must carry no bike snapshot; a build conversation is checked exactly as before.
alter table public.conversations alter column bike_id drop not null;
alter table public.conversations add constraint general_conversation_is_ask check(bike_id is not null or mode='ask');
create or replace function public.complete_ai_request(p_user_id uuid,p_request_id uuid,p_response jsonb,p_raw_output jsonb) returns void language plpgsql security invoker set search_path='' as $$
declare r public.ai_requests; b public.bikes; c public.conversations; assistant_id uuid := gen_random_uuid(); expected_context jsonb;
begin
 select * into r from public.ai_requests where request_id=p_request_id and user_id=p_user_id;
 if not found or r.state<>'processing' then raise exception 'Request not processing';end if;
 select * into c from public.conversations where id=r.conversation_id and user_id=p_user_id;
 if not found then raise exception 'BAK_MX_CONTEXT_CHANGED';end if;
 if c.bike_id is not null then
  select bikes.* into b from public.bikes bikes where bikes.id=c.bike_id and bikes.user_id=p_user_id for share of bikes;
  if not found then raise exception 'BAK_MX_CONTEXT_CHANGED';end if;
 end if;
 -- Follow parent-to-child order used by Garage/conversation deletion cascades.
 perform 1 from public.conversations where id=r.conversation_id and user_id=p_user_id and bike_id is not distinct from c.bike_id for update;
 if not found then raise exception 'BAK_MX_CONTEXT_CHANGED';end if;
 select * into r from public.ai_requests where request_id=p_request_id and user_id=p_user_id for update;
 if not found or r.state<>'processing' then raise exception 'Request not processing';end if;
 if c.bike_id is null then
  if r.bike_snapshot is not null and r.bike_snapshot<>'null'::jsonb then raise exception 'BAK_MX_CONTEXT_CHANGED';end if;
 else
  expected_context:=jsonb_build_object('id',b.id,'user_id',b.user_id,'manufacturer',b.manufacturer,'model',b.model,'model_year',b.model_year,'variant',b.variant,'region',b.region,'engine_hours',b.engine_hours,'configuration',b.configuration);
  if r.bike_snapshot is null or not (r.bike_snapshot @> expected_context) then raise exception 'BAK_MX_CONTEXT_CHANGED';end if;
 end if;
 insert into public.messages(id,conversation_id,user_id,role,content,response) values
 (gen_random_uuid(),r.conversation_id,p_user_id,'user',r.input,null),
 (assistant_id,r.conversation_id,p_user_id,'assistant',p_response->>'summary',p_response);
 update public.ai_requests set assistant_message_id=assistant_id,state='complete',response=p_response,raw_output=p_raw_output,completed_at=now() where request_id=p_request_id;
 update public.conversations set updated_at=now() where id=r.conversation_id;
end $$;
revoke all on function public.complete_ai_request(uuid,uuid,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.complete_ai_request(uuid,uuid,jsonb,jsonb) to service_role;
