-- Owner-declared off-road identities are Garage records, not verified specifications.
-- Evidence applicability, RLS and entitlements are unchanged.
alter table public.bikes drop constraint bikes_model_year_check;
alter table public.bikes add constraint bikes_model_year_check check(model_year between 1970 and 2027);
