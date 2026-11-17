# Where to Ride: riding areas and trails (plan, 2026-11-17)

Kyle, 2026-11-17: build Level 1 (riding areas) and Level 2 (trail map) now, to the same standard as the rest of the app.
Level 3 (offline maps, recorded ride lines, buddy positions, any onX partnership) waits until riders use this and ask.
Name: "Where to Ride" (Claude's suggestion, Kyle said go ahead), with Tracks and Riding areas inside it.

## What a rider gets
- **Where to Ride** (Home › More, and from the practice-day / race-day start sheet): every track and riding area in one list.
  Search by name or town; filter All · Tracks · Riding areas; pick a state. Each row says what it is
  ("Riding area · 125 mi of trail · Single-track, ATV") and, when riders checked in today, how it's riding.
- **Riding area page**:
  - What you can ride: single-track (motorcycle only), ATV trail (50 in and under), full-width (side-by-sides, 4x4).
  - Know before you go: who runs it, pass or day fee, hours and season, plate/registration and OHV decal rules,
    spark arrestor and sound limits, kids' area. Anything we could not confirm says "Not confirmed: check the official page".
  - Right now (today's check-ins), What I ran here, events here, riding here today, Ride safety, Ask BAK about riding here.
  - Official page, official map, directions, and "Open in onX" (a plain link; no partnership, no onX logo).
- **Trail map** (Level 2): the area's trail lines, coloured by the widest vehicle allowed, with names, numbers, miles and
  open dates where the Forest Service publishes them. Always shows the map's date and "Closures change: check the official
  page before you ride". Needs signal. Places without published lines show the official map link instead of a blank map.

## Data
- Riding areas are rows in `tracks` (so check-ins, race days, ride days, What I ran here and events work unchanged) with a
  new `kind` (`track` | `riding_area`) and an `area` record (fields above, each with a source). Tracks that also have
  woods trails stay `track` and show "Has trails".
- Research lives in `docs/research/riding-areas/<state>.json`; facts in our own words with sources and an access date;
  unknown is `null`, never a guess. Southeast first (FL, GA, AL, TN, SC, NC), then state by state.
- **Trail lines**: Forest Service Motor Vehicle Use Map (MVUM) trails, public data. Loaded by a script into `trail_lines`
  (area, name, number, allowed vehicles, dates open, miles, simplified line, the map's date). Re-run to refresh.
  Only for areas on National Forest land; state forests and private parks link their own maps.
- Nothing about a rider's location is stored by this feature. "Near me" uses the phone's location on the phone only.

## Plans
Free for everyone: riding areas, trail maps, check-ins. (Riders are tired of paying for maps the government gives away.)
Pro value stays Ask BAK: trail setup for the area (sand, roots, rocks, elevation), gearing, tire pressure.

## Apple / Google
- Location text updated to cover "tracks and riding areas near you" (when-in-use only; Ride safety keeps its own wording).
- Map: Apple Maps on iPhone (no key). Android uses Google Maps, which needs a Google Maps API key in the build
  (Kyle pastes it in; until then Android and the website draw the trail lines on a plain dark background).
- Accuracy disclaimer on every map; we never show private land as rideable; reference-only places stay hidden.

## Order
1. Schema + research for Southeast riding areas (Level 1 data).
2. Server: `/api/where-to-ride`, `/api/riding-areas/:id`, `/api/riding-areas/:id/trails`; tests.
3. App: Where to Ride list, riding area page, trail map; Home › More entry; start sheet shows riding areas.
4. Trail line loader (MVUM) and first load for Southeast National Forest areas.
5. Check on the cloud iPhone and Android; ship in 1.0.12.

## Later (Level 3, not now)
Offline area download, record your ride line, buddy positions, onX partnership or a paid map provider.
