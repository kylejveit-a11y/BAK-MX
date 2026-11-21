-- Invite a friend (docs/plans/INVITE_REWARDS.md). Server-only tables: RLS on, no policies; the API uses the service role.
create table if not exists public.invite_codes(
 user_id uuid primary key references auth.users(id) on delete cascade,
 code text not null unique check (code ~ '^[A-Z0-9]{2,8}-[A-Z0-9]{3,4}$'),
 created_at timestamptz not null default now());
create table if not exists public.invites(
 friend_id uuid primary key references auth.users(id) on delete cascade,
 inviter_id uuid not null references auth.users(id) on delete cascade,
 code text not null,
 created_at timestamptz not null default now(),
 joined_rewarded_at timestamptz,          -- friend confirmed their email and added a bike: inviter got 10 questions
 paid_since timestamptz,                   -- first time the friend was seen on a paid plan (cleared if they stop before it counts)
 paid_counted_at timestamptz,              -- still paid two weeks later: counts toward the inviter's free months
 check (friend_id<>inviter_id));
create index if not exists invites_inviter_idx on public.invites(inviter_id);
create table if not exists public.invite_months(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 seq int not null,                          -- 1st, 2nd, ... free month this rider earned (one per 3 paying friends)
 tier text not null check (tier in ('premium','pro')),
 how text not null check (how in ('unlock','offer_code')),
 starts_at timestamptz, ends_at timestamptz, -- unlock: the 30 days BAK opens the plan
 offer_code text,                            -- offer_code: the store code handed out (null until one is available)
 earned_at timestamptz not null default now(),
 unique (user_id,seq));
create table if not exists public.invite_offer_codes(
 code text primary key,
 store text not null check (store in ('apple','google')),
 tier text not null check (tier in ('premium','pro')),
 given_to uuid references auth.users(id) on delete set null,
 given_at timestamptz,
 added_at timestamptz not null default now());
alter table public.invite_codes enable row level security;
alter table public.invites enable row level security;
alter table public.invite_months enable row level security;
alter table public.invite_offer_codes enable row level security;
revoke all on public.invite_codes, public.invites, public.invite_months, public.invite_offer_codes from anon, authenticated;
