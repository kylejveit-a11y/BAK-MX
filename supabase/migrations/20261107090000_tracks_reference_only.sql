-- Kyle, 2026-11-07: some tracks are reference knowledge only (a pro's private training facility): Ask BAK can use their
-- conditions when a rider names them, but they never appear in the track list, pickers or anywhere a rider could choose
-- to ride there.
alter table public.tracks add column if not exists listed boolean not null default true;
