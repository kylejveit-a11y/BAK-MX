# Riding areas (Where to Ride)

One record per riding area, keyed to its row in `tracks` (`id`). Loaded into `tracks.area` with `kind='riding_area'` by
`scripts/riding-areas/areas-sql.py` (prints SQL to run in the MX database). `new-places.json` lists riding areas that
had no row in `tracks` yet; the loader inserts them once. `center` is never typed in: the loader works it out from the trail lines. Official pages first (Forest Service, state forest, the park's own site). Facts in our own words.
Unknown is `null` and shows in the app as "Not confirmed: check the official page". Never guessed. Every record has `verified`
(the date the sources were read) and `sources`.

Fields: land (national_forest | state_forest | state_park | county | private), managed_by, near, address, vehicles
{single_track, atv, full_width} (true / false / null), width_limit_in, trail_miles, pass {day, year, how}, season, hours,
rules[], closures, official_url, phone, trailheads[{name, lat, lng}], mvum {forest} (National Forest areas: trail lines come
from the Forest Service Motor Vehicle Use Map), sources[], verified.
