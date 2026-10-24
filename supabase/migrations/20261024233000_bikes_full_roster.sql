-- The first database rule allowed only the 12 launch models (250/450 four-strokes from six makes). The app now offers
-- the full supported roster (85s, 125s, two-strokes, cross-country, Triumph and more) plus rider-declared off-road bikes,
-- so saving any other bike failed at the database. The server already checks every bike against that roster
-- (server/validation.ts bikeSchema: isRosterBike or an explicit rider-declared off-road identity), so the narrow list goes.
alter table public.bikes drop constraint if exists supported_model_family;
