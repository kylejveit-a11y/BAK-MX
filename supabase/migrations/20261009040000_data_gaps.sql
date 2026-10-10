-- Published data a rider's question needed and BAK did not have. Drives data work by real demand.
-- Service-only: written by the API after an answer; no rider reads or writes it.
create table public.data_gaps(
 id bigint generated always as identity primary key,
 request_id uuid,user_id uuid references auth.users on delete set null,
 manufacturer text not null,model text not null,model_year integer not null,variant text not null,region text not null,
 gap text not null check(length(gap) between 1 and 300),
 created_at timestamptz not null default now());
create index data_gaps_bike on public.data_gaps(manufacturer,model,model_year);
create index data_gaps_user on public.data_gaps(user_id);
alter table public.data_gaps enable row level security;
revoke all on public.data_gaps from anon,authenticated;
grant all on public.data_gaps to service_role;
grant usage,select on all sequences in schema public to service_role;
