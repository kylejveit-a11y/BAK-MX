-- "Tried it?" under a coaching answer: the rider says whether the fix or drill helped. One row per coaching request,
-- updated if they change their answer. Written and read only by the server (service role), always scoped to the rider.
create table if not exists public.coaching_results(
 request_id uuid primary key references public.ai_requests(request_id) on delete cascade,
 user_id uuid not null references auth.users on delete cascade,
 result text not null check(result in ('better','no_change','worse')),
 note text not null default '' check(length(note)<=1000),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now());
create index if not exists coaching_results_owner on public.coaching_results(user_id,updated_at desc);
alter table public.coaching_results enable row level security;
revoke all on public.coaching_results from anon,authenticated;
