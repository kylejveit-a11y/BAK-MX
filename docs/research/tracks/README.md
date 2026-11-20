# Track knowledge bank

Per-state research files: `<state>-<region>.json`, each an array of track records. One record per facility.

## Record
```json
{
  "id": "dade-city-mx",                       // lowercase slug, unique
  "name": "Dade City Motocross",
  "aliases": ["Dade City", "DCMX"],          // names riders actually use
  "state": "FL", "city": "Dade City", "county": "Pasco",
  "address": "street address or null",
  "lat": 28.3647, "lng": -82.1959,           // null if not found; never guessed
  "types": ["motocross"],                    // motocross | supercross | arenacross | offroad | enduro | training | pit_bike | flat_track
  "access": "public",                        // public | members | private | appointment | unknown
  "status": "open",                          // open | closed | seasonal | unknown
  "website": null, "phone": null, "facebook": null, "instagram": null,   // business contacts only
  "tracks_on_site": ["main MX", "vet track", "pee-wee"],
  "soil": {"primary": "clay", "secondary": "sand", "notes": "own words", "confidence": "high|medium|low"},
  "layout": {"speed": "fast|medium|tight|unknown", "jumps": "big|medium|small|unknown", "elevation_change": "flat|rolling|hilly|unknown", "traits": ["ruts", "braking bumps", "whoops", "off-camber"], "notes": "own words"},
  "conditions": {"dry": "", "wet": "", "late_day": "", "watering_prep": "", "seasonal": ""},
  "rider_reports": [{"says": "own-words summary", "source_url": "", "source_type": "forum|article|video|review|track", "date": "YYYY-MM or null"}],
  "sources": [{"url": "", "title": "", "accessed": "2026-10-24"}],
  "confidence": "high|medium|low",           // overall
  "gaps": ["what we could not confirm"]
}
```

## Rules
- Facts in our own words with a source link. Never paste text from a page.
- Business contacts only (track website, phone, email, social). No private individuals' details.
- Unknown is `null` or `"unknown"`, never a guess. Rider opinion goes in `rider_reports` with a date, not in `soil`/`layout` unless several sources agree.
- Prefer what riders say (forums, race reports, reviews, videos) over promotional copy.

## Map and visit-info pass (2026-11-20)

- Coordinates: `<state>-update-zy-geo-2026-11.json` (named `-update-geo-` for the first pass). 40 places that had a street
  address but no position were placed with the US Census Bureau geocoder (35) or OpenStreetMap where it names the place
  or the exact house (5). Road-only and "area" addresses were left without a position. Never typed in by hand.
- Elevation: `elevation_ft` for every place with a position, from the USGS Elevation Point Query Service. Ask BAK uses it
  for air-density (jetting and power) advice.
- Tracks' own websites: read once on the owner's computer with a polite reader (robots.txt respected, one request a
  second, at most 8 pages a site, honest client name; six sites that answered 403 were left alone). Results:
  - `visit-info-2026-11.json`: hours, fees and house rules for 41 places, in our own words, with the page and the date.
    `scripts/tracks/visit_info_sql.py` loads them into `tracks.area`, which the place page already shows as "Know before
    you go" with a "checked on" line. It never overwrites a riding area's researched record.
  - `<state>-update-zz-official-2026-11.json`: phone numbers, addresses, access, soil where the track states it, and
    social links. The `zz` keeps these last, so an older pass cannot undo them.
  - Six website links were removed (`"clear": ["website"]`) because the address now belongs to a gambling site, a domain
    broker, or no longer exists. Re-check links on every pass: a hijacked address sends riders somewhere unsafe.
- Not read (site answered 403, do not work around): danwoodleyracing.com, millcreekmx.com, tvmx.net, wwmotox.com,
  durhamtown.com, scrubndirt.com. Pages drawn only in the browser gave nothing: silverdollarmp.com, hardrockoffroadpark.net.
