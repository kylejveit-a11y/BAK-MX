-- "What I ran here": the weather at the track when a rider logged the day. Written only by the server (service role) from the
-- nearest US National Weather Service observation; riders cannot write it.
alter table public.track_reports add column if not exists weather jsonb;
alter table public.setup_logs add column if not exists weather jsonb;
