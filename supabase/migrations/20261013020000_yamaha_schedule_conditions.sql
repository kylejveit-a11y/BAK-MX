-- Yamaha Owner's Service Manual "MAINTENANCE INTERVALS" rows get a schedule condition instead of the
-- specification-table conditions (which assume a measured value).
create or replace function private.manual_conditions(p_make text, path text, unit text)
returns text[] language sql immutable set search_path to '' as $$
 select case
  when p_make='Yamaha' and path ~ '^Service schedule' then array[
    'From the maintenance-interval table of the US Owner''s Service Manual. Intervals are per race with the approximate hours as printed. The same table says the life of parts varies with the environment the machine runs in (rain, dirt) and earlier inspection is then required, and that items marked for a Yamaha dealer need special tools, data and technical skills. After a break-in or before each race, also check the torque-check points in the same manual.']
  when p_make='Yamaha' then private.yamaha_spec_conditions(path,unit)
  else array_remove(array[
 case when path ~ '^Service schedule' then 'From the manufacturer service schedule for the US standard model. "once" marks a one-time interval; the other entries repeat. The same manual says harsh conditions can call for shorter intervals.'
      else 'Applies to the US standard model named; other regions and special editions covered by the same manual can differ. Stock OEM parts only.' end,
 case when path ~ '(damping) / (Comfort|Standard|Sport)$' then 'Counted counterclockwise (softer) from the adjuster turned clockwise to its stop or last click, as the adjustment section of the same manual describes.' end,
 case when path ~ 'Static sag|Riding sag' then 'Static sag is the unloaded-to-standing difference with no rider; riding sag is measured with the rider aboard in full gear, per the procedure in the same manual.' end,
 case when path ~ 'wear limit' then 'Service or wear limit, not a nominal target.' end,
 case when path ~ '^(Carburetor|Carburetor tuning)' then 'Factory carburetor setting for the stock engine and exhaust named in this manual.' end
 ],null) end $$;
