-- Talk to BAK (docs/plans/VOICE.md). Server-only tables: the service role reads and writes, riders never touch them.
-- No audio and no transcript is stored here: only that a session ran and for how long, to count the monthly allowance.
create table if not exists public.voice_sessions(
 id text primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 started_at timestamptz not null default now(),
 ended_at timestamptz,
 seconds integer check (seconds is null or seconds>=0)
);
create index if not exists voice_sessions_user_month on public.voice_sessions(user_id,started_at);
alter table public.voice_sessions enable row level security;
-- Who may use voice while it is a proof. Emptying this list switches voice off for everyone.
create table if not exists public.voice_testers(
 user_id uuid primary key references auth.users(id) on delete cascade,
 added_at timestamptz not null default now()
);
alter table public.voice_testers enable row level security;
