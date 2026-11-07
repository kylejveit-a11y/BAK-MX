-- Kyle approved (2026-11-07): track-report notes can be reported and removed like other rider content. The allowed
-- target types live in one check constraint, so it is replaced with the same list plus 'track_report'. No data changes.
alter table public.content_reports drop constraint if exists content_reports_target_type_check;
alter table public.content_reports add constraint content_reports_target_type_check
 check (target_type = any (array['post','comment','event','message','profile','track_report']::text[]));
