-- BAK MX isolated schema. No EMOTO identifiers or data.
create table public.bikes (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users on delete cascade,
 manufacturer text not null, model text not null, model_year integer not null check(model_year between 2022 and 2026),
 variant text not null, region text not null, nickname text not null default '', engine_hours numeric check(engine_hours>=0),
 configuration jsonb not null default '{}', created_at timestamptz not null default now(),updated_at timestamptz not null default now(), unique(id,user_id)
);
create table public.service_events (
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users on delete cascade,bike_id uuid not null,
 category text not null,performed_at timestamptz not null,engine_hours numeric check(engine_hours>=0),notes text not null default '',
 next_due_hours numeric check(next_due_hours>=0),interval_source text not null default '',created_at timestamptz not null default now(),
 foreign key(bike_id,user_id) references public.bikes(id,user_id) on delete cascade,
 check(next_due_hours is null or length(trim(interval_source))>0)
);
create table public.conversations (
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users on delete cascade,bike_id uuid not null,
 title text not null,mode text not null check(mode in ('ask','diagnose','setup')),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 foreign key(bike_id,user_id) references public.bikes(id,user_id) on delete cascade,unique(id,user_id)
);
create table public.messages (
 id uuid primary key default gen_random_uuid(),conversation_id uuid not null,user_id uuid not null references auth.users on delete cascade,
 role text not null check(role in ('user','assistant')), content text not null,response jsonb,created_at timestamptz not null default now(),
 foreign key(conversation_id,user_id) references public.conversations(id,user_id) on delete cascade
);
create table public.claims (
 id uuid primary key default gen_random_uuid(),manufacturer text not null,model text not null,model_year integer not null,variant text not null,region text not null,
 domain text not null,statement text not null,source_url text not null,source_locator text not null,
 status text not null check(status in ('VERIFIED','REVIEWED','LIMITED','STAGED','CONFLICTED','UNKNOWN')),has_conflict boolean not null default false,
 created_at timestamptz not null default now(), check(status<>'VERIFIED' or (length(source_url)>0 and length(source_locator)>0))
);
create table public.subscriptions (
 user_id uuid primary key references auth.users on delete cascade,stripe_customer_id text unique,stripe_subscription_id text unique,
 status text not null default 'none',current_period_end timestamptz,cancel_at_period_end boolean not null default false,updated_at timestamptz not null default now()
);
-- These public tables have NO client grants/policies: reachable only by trusted service role.
create table public.ai_requests (
 request_id uuid primary key,user_id uuid not null references auth.users on delete cascade,conversation_id uuid not null,
 assistant_message_id uuid, input text not null, state text not null check(state in ('processing','complete','failed')), response jsonb,raw_output jsonb,
 bike_snapshot jsonb,claims_snapshot jsonb,model text,prompt_version text, error_code text,received_at timestamptz,
 created_at timestamptz not null default now(),completed_at timestamptz,
 foreign key(conversation_id,user_id) references public.conversations(id,user_id) on delete cascade
);
create unique index one_active_request_per_conversation on public.ai_requests(conversation_id) where state='processing';
create table public.ai_usage(request_id uuid primary key,user_id uuid not null references auth.users on delete cascade,created_at timestamptz not null default now());
create table public.admin_memberships(user_id uuid primary key references auth.users on delete cascade,created_at timestamptz not null default now());
create table public.admin_access_log(id bigint generated always as identity primary key,user_id uuid references auth.users on delete set null,action text not null,created_at timestamptz not null default now());
create table public.stripe_webhook_events(event_id text primary key,processed_at timestamptz not null default now());
create index bikes_owner on public.bikes(user_id);
create index service_owner on public.service_events(user_id,bike_id);
create index conversations_owner on public.conversations(user_id,bike_id);
create index messages_owner on public.messages(user_id,conversation_id,created_at);
create index claims_applicability on public.claims(manufacturer,model,model_year,variant,region);
create index ai_requests_owner on public.ai_requests(user_id,created_at);
create index ai_usage_owner_day on public.ai_usage(user_id,created_at);

do $$ declare t text; begin
 foreach t in array array['bikes','service_events','conversations','messages','claims','subscriptions','ai_requests','ai_usage','admin_memberships','admin_access_log','stripe_webhook_events'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon,authenticated',t);
 execute format('grant all on public.%I to service_role',t);
 end loop;
 foreach t in array array['bikes','service_events','conversations'] loop
 execute format('grant select,insert,delete on public.%I to authenticated',t);
 execute format('create policy owner_select on public.%I for select to authenticated using ((select auth.uid())=user_id)',t);
 execute format('create policy owner_insert on public.%I for insert to authenticated with check ((select auth.uid())=user_id)',t);
 execute format('create policy owner_delete on public.%I for delete to authenticated using ((select auth.uid())=user_id)',t);
 end loop;
end $$;
grant update(manufacturer,model,model_year,variant,region,nickname,engine_hours,configuration,updated_at) on public.bikes to authenticated;
create policy owner_update on public.bikes for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
grant select on public.messages,public.subscriptions,public.claims to authenticated;
create policy owner_select on public.messages for select to authenticated using((select auth.uid())=user_id);
create policy owner_select on public.subscriptions for select to authenticated using((select auth.uid())=user_id);
create policy verified_claims on public.claims for select to authenticated using(status='VERIFIED' and not has_conflict);
grant usage,select on all sequences in schema public to service_role;

create function public.reserve_ai_request(p_user_id uuid,p_request_id uuid,p_max_daily integer) returns boolean language plpgsql security invoker set search_path='' as $$
begin
 if p_max_daily<1 then return false; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_user_id::text,0));
 if exists(select 1 from public.ai_usage where request_id=p_request_id) then return false; end if;
 if (select count(*) from public.ai_usage where user_id=p_user_id and created_at>=date_trunc('day',now() at time zone 'UTC') at time zone 'UTC')>=p_max_daily then return false; end if;
 insert into public.ai_usage(request_id,user_id) values(p_request_id,p_user_id);return true;
end $$;
revoke all on function public.reserve_ai_request(uuid,uuid,integer) from public,anon,authenticated;
grant execute on function public.reserve_ai_request(uuid,uuid,integer) to service_role;

-- Messages and final response are committed together; the rider cannot forge an assistant message.
create function public.complete_ai_request(p_user_id uuid,p_request_id uuid,p_response jsonb,p_raw_output jsonb) returns void language plpgsql security invoker set search_path='' as $$
declare r public.ai_requests; assistant_id uuid := gen_random_uuid();
begin
 select * into r from public.ai_requests where request_id=p_request_id and user_id=p_user_id for update;
 if not found or r.state<>'processing' then raise exception 'Request not processing';end if;
 insert into public.messages(id,conversation_id,user_id,role,content,response) values
 (gen_random_uuid(),r.conversation_id,p_user_id,'user',r.input,null),
 (assistant_id,r.conversation_id,p_user_id,'assistant',p_response->>'summary',p_response);
 update public.ai_requests set assistant_message_id=assistant_id,state='complete',response=p_response,raw_output=p_raw_output,completed_at=now() where request_id=p_request_id;
 update public.conversations set updated_at=now() where id=r.conversation_id;
end $$;
revoke all on function public.complete_ai_request(uuid,uuid,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.complete_ai_request(uuid,uuid,jsonb,jsonb) to service_role;
alter table public.subscriptions add column last_event_created bigint not null default 0;
create function public.sync_subscription(p_user_id uuid,p_customer_id text,p_subscription_id text,p_status text,p_period_end timestamptz,p_cancel boolean,p_event_created bigint) returns void language sql security invoker set search_path='' as $$
 update public.subscriptions set stripe_subscription_id=p_subscription_id,status=p_status,current_period_end=p_period_end,cancel_at_period_end=p_cancel,updated_at=now(),last_event_created=p_event_created
 where user_id=p_user_id and stripe_customer_id=p_customer_id and last_event_created<=p_event_created;
$$;
revoke all on function public.sync_subscription(uuid,text,text,text,timestamptz,boolean,bigint) from public,anon,authenticated;
grant execute on function public.sync_subscription(uuid,text,text,text,timestamptz,boolean,bigint) to service_role;

alter table public.claims add column evidence_record jsonb not null default '{}';
-- VERIFIED is a controlled promotion, never an import default. Fail closed on missing JSON fields.
create function public.evidence_approved(e jsonb,scope jsonb) returns boolean language sql immutable security invoker set search_path='' as $$
 select coalesce(
 e->'applicability'=scope and e#>'{review,approved_applicability}'=scope
 and e->>'has_conflict'='false' and e->'conflict_references'='[]'::jsonb
 and e#>>'{source,kind}' in ('document','measurement')
 and e#>>'{source,document_sha256}' ~ '^[a-f0-9]{64}$'
 and e#>>'{review,approved_document_sha256}'=e#>>'{source,document_sha256}'
 and length(trim(e#>>'{source,url}'))>0 and length(trim(e#>>'{source,locator}'))>0
 and length(trim(e#>>'{source,reviewed_content}'))>0
 and e#>>'{rights,basis}' in ('permission','license','public_domain','internal_measurement')
 and e#>>'{rights,commercial_use_approved}'='true' and length(trim(e#>>'{rights,reference}'))>0
 and e#>>'{review,decision}'='approved' and e#>>'{review,content_checked}'='true'
 and e#>>'{review,scope_checked}'='true' and e#>>'{review,conflicts_checked}'='true'
 and length(trim(e#>>'{review,reviewer_id}'))>0 and length(trim(e#>>'{review,reviewed_at}'))>0
 and length(trim(e#>>'{review,approval_reference}'))>0,false);
$$;
revoke all on function public.evidence_approved(jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.evidence_approved(jsonb,jsonb) to service_role;
alter table public.claims add constraint verified_evidence_required check(status<>'VERIFIED' or (
 not has_conflict and statement=evidence_record->>'statement' and source_url=evidence_record#>>'{source,url}' and source_locator=evidence_record#>>'{source,locator}'
 and public.evidence_approved(evidence_record,jsonb_build_object('manufacturer',manufacturer,'model',model,'model_year',model_year,'variant',variant,'region',region))));

-- Data API clients receive the same identity and size boundaries as the application API.
alter table public.bikes add constraint supported_model_family check (
 (manufacturer='Yamaha' and model in ('YZ250F','YZ450F')) or
 (manufacturer='Honda' and model in ('CRF250R','CRF450R')) or
 (manufacturer='Kawasaki' and model in ('KX250','KX450')) or
 (manufacturer='KTM' and model in ('250 SX-F','450 SX-F')) or
 (manufacturer='Husqvarna' and model in ('FC 250','FC 450')) or
 (manufacturer='GasGas' and model in ('MC 250F','MC 450F')));
alter table public.bikes add constraint bounded_bike_data check (
 length(trim(variant)) between 1 and 100 and length(trim(region)) between 1 and 80
 and length(nickname)<=80 and (engine_hours is null or engine_hours between 0 and 100000)
 and jsonb_typeof(configuration)='object' and octet_length(configuration::text)<=24000);
alter table public.service_events add constraint bounded_service_data check (
 length(trim(category)) between 1 and 100 and length(notes)<=4000 and length(interval_source)<=1000
 and (engine_hours is null or engine_hours between 0 and 100000)
 and (next_due_hours is null or next_due_hours between 0 and 100000));
alter table public.conversations add constraint bounded_conversation_data check(length(trim(title)) between 1 and 120);
