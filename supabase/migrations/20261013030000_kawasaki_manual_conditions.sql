-- Kawasaki KX owner's-manual rows: the periodic maintenance chart has its own legend, and the standard damper
-- settings are counted from the adjuster fully seated.
create or replace function private.manual_conditions(p_make text, path text, unit text)
returns text[] language sql immutable set search_path to '' as $$
 select case
  when p_make='Yamaha' and path ~ '^Service schedule' then array[
    'From the maintenance-interval table of the US Owner''s Service Manual. Intervals are per race with the approximate hours as printed. The same table says the life of parts varies with the environment the machine runs in (rain, dirt) and earlier inspection is then required, and that items marked for a Yamaha dealer need special tools, data and technical skills. After a break-in or before each race, also check the torque-check points in the same manual.']
  when p_make='Yamaha' then private.yamaha_spec_conditions(path,unit)
  when p_make='Kawasaki' and path ~ '^Service schedule' then array[
    'From the Periodic Maintenance Chart of the US owner''s manual: the race count with the approximate hours as printed. The chart''s own legend: "†" means replace, add, adjust, clean or torque if necessary; "K" means the item should be serviced by referring to the service manual or an authorized Kawasaki dealer.']
  when p_make='Kawasaki' and path ~ 'Standard setting' then array[
    'Factory standard adjuster setting from the US owner''s manual, counted counterclockwise from the adjuster fully seated (turned fully clockwise). Use the adjuster within the usable range the same manual prints; turning beyond it changes nothing and can damage the mechanism. Stock OEM suspension only.']
  when p_make='Kawasaki' then array_remove(array[
    'Applies to the US model named, stock OEM configuration; the owner''s manual says specifications are subject to change without notice.',
    case when path ~ 'Gear Ratio|Reduction Ratio' then 'Ratio with the tooth count as printed.' end,
    case when path ~ 'Fork Oil' then 'Fork oil type and amount as specified for the stock fork; follow the oil-change procedure in the same manual.' end
   ],null)
  else array_remove(array[
 case when path ~ '^Service schedule' then 'From the manufacturer service schedule for the US standard model. "once" marks a one-time interval; the other entries repeat. The same manual says harsh conditions can call for shorter intervals.'
      else 'Applies to the US standard model named; other regions and special editions covered by the same manual can differ. Stock OEM parts only.' end,
 case when path ~ '(damping) / (Comfort|Standard|Sport)$' then 'Counted counterclockwise (softer) from the adjuster turned clockwise to its stop or last click, as the adjustment section of the same manual describes.' end,
 case when path ~ 'Static sag|Riding sag' then 'Static sag is the unloaded-to-standing difference with no rider; riding sag is measured with the rider aboard in full gear, per the procedure in the same manual.' end,
 case when path ~ 'wear limit' then 'Service or wear limit, not a nominal target.' end,
 case when path ~ '^(Carburetor|Carburetor tuning)' then 'Factory carburetor setting for the stock engine and exhaust named in this manual.' end
 ],null) end $$;
