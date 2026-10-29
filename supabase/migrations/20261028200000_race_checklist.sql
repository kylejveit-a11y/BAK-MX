-- The rider's own race-prep checklist: BAK's researched items they kept, their own items, their order. Null until they edit
-- it (the app then shows BAK's list for their kind of riding). Private, like the rest of rider_preferences.
alter table public.rider_preferences add column if not exists race_checklist jsonb;
do $$ begin
 if not exists (select 1 from pg_constraint where conname='race_checklist_size') then
  alter table public.rider_preferences add constraint race_checklist_size check (race_checklist is null or (jsonb_typeof(race_checklist)='array' and jsonb_array_length(race_checklist)<=200 and pg_column_size(race_checklist)<=40000));
 end if;
end $$;
