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
