-- Ride tracking and lap timing (shared/ride-track.ts). One row per recorded ride: the numbers, the laps, and a thinned
-- route for the map. The raw GPS points are not kept. Riders read and delete their own; the server writes.
create table if not exists public.rides(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 bike_id uuid,
 track_id uuid,
 place text not null default '' check (length(place)<=160),
 kind text not null check (kind in ('track','trail')),
 started_at timestamptz not null,
 ended_at timestamptz not null,
 seconds integer not null check (seconds>=0),
 moving_seconds integer not null check (moving_seconds>=0),
 distance_m integer not null check (distance_m>=0),
 top_speed_ms numeric not null check (top_speed_ms>=0),
 laps jsonb not null default '[]'::jsonb,
 best_ms integer check (best_ms is null or best_ms>0),
 average_ms integer check (average_ms is null or average_ms>0),
 gate jsonb,
 route jsonb not null default '[]'::jsonb,
 created_at timestamptz not null default now(),
 foreign key(bike_id,user_id) references public.bikes(id,user_id) on delete set null (bike_id),
 check (ended_at>=started_at),
 check (pg_column_size(route)<=200000 and pg_column_size(laps)<=60000)
);
create index if not exists rides_owner on public.rides(user_id,started_at desc);
create unique index if not exists rides_once on public.rides(user_id,started_at);
alter table public.rides enable row level security;
revoke all on public.rides from anon,authenticated;
grant all on public.rides to service_role;
grant select,delete on public.rides to authenticated;
create policy owner_select on public.rides for select to authenticated using ((select auth.uid())=user_id);
create policy owner_delete on public.rides for delete to authenticated using ((select auth.uid())=user_id);
