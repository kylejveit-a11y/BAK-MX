-- Ride safety: the rider's own name as their contacts know them ("Kyle"), used in the emails and on the ride link instead of a
-- community display name ("God Father 817"). Private: it lives with the rider's other preferences, never on the public profile.
alter table public.rider_preferences add column if not exists safety_name text not null default '' check (length(safety_name)<=40);
