-- Deep bike knowledge beyond published specifications (docs/research/BIKE_KNOWLEDGE_STANDARD.md): power and feel, dynos,
-- ECU maps, engine architecture, porting, mods, known issues, setups. Every row carries its source tier: OEM, MEASURED
-- (independent dyno or scale), TUNER, DERIVED (BAK calculation with working) or COMMUNITY. One row per bike-year so the
-- answer path can select by exact bike; research files keep the platform-generation form.
create table if not exists public.bike_knowledge(
 id text primary key,
 manufacturer text not null, model text not null, model_year integer not null,
 domain text not null check (domain in ('identity','engine_architecture','power_feel','ecu_electronics','engine_mods','chassis','suspension','drivetrain','maintenance','known_issues','setups')),
 topic text not null, statement text not null, vals jsonb not null default '{}'::jsonb,
 tier text not null check (tier in ('OEM','MEASURED','TUNER','DERIVED','COMMUNITY')),
 source jsonb not null default '{}'::jsonb, confidence text not null check (confidence in ('high','medium','low')),
 notes text not null default '', status text not null default 'APPROVED' check (status in ('APPROVED','HELD')),
 research_id text not null, created_at timestamptz not null default now(),
 search tsvector generated always as (to_tsvector('english', topic||' '||statement||' '||domain)) stored
);
create index if not exists bike_knowledge_bike on public.bike_knowledge(manufacturer,model,model_year);
create index if not exists bike_knowledge_search on public.bike_knowledge using gin(search);
alter table public.bike_knowledge enable row level security;
revoke all on public.bike_knowledge from anon,authenticated;
grant select on public.bike_knowledge to authenticated;
grant all on public.bike_knowledge to service_role;
do $$ begin
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='bike_knowledge' and policyname='approved_knowledge') then
  create policy approved_knowledge on public.bike_knowledge for select to authenticated using (status='APPROVED');
 end if;
end $$;
