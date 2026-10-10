-- Riders accept the community rules before a profile exists.
alter table public.profiles add column if not exists accepted_rules_at timestamptz;
alter policy profiles_insert on public.profiles with check((select auth.uid())=user_id and accepted_rules_at is not null);
