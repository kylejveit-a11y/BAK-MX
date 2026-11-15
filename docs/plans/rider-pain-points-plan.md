# Rider pain points: plan (2026-11-15)

Source: a community pain-point report Kyle pasted on 2026-11-15 (summary below). Status: for discussion; nothing approved to build.

## The report, in short
- Pain: app fragmentation (group chats, spreadsheets, social feeds, several map apps for one ride day); apps that fail with gloves,
  sweat, bumps, screen dimming/locking, overheating; no cell service at riding areas and stale closures/gates; subscription fatigue
  for GPS and public-land maps that are free from the government (USFS Motor Vehicle Use Maps); no moto-specific context (Strava logs
  rides as mountain biking).
- Wants: screen lock / clean mode and voice zoom; live buddy tracking that works on low signal; a share link a spouse at the truck
  can open with no app or account; an all-in-one garage (engine hours, oil, top end, clicker settings tied to track and weather);
  live crowdsourced track and trail conditions; a moto-only feed and crew finder (who is riding where, filter by skill and bike
  size); trail maps coloured by vehicle width (single-track / 50-inch / full-width) with street-legal rules.

## Where BAK MX already stands
| Want | BAK MX today |
|---|---|
| Digital garage, hours, service, clicker settings | Have: Garage, service reminders, setup log, tuning notes saved from answers, build sheet, garage sharing |
| Settings tied to track and weather | Partly: track reports link a setup log entry, tire and pressures; race forecast. Not yet one view of "what I ran here, in what weather" |
| Crowdsourced track conditions | Partly: "How did it ride?" reports with tags, shown as counts. Not live "today" check-ins |
| Moto-only feed and crew finder | Partly: community posts, ride plans and events with RSVP. No skill / bike-size / discipline filters, no "who's riding here today" |
| Glove use | Partly: glove-sized pickers and controls in places. No ride-day mode, no keep-awake, no tap lock |
| Voice | Partly: voice questions to BAK. No voice control of the app |
| Moto-specific ride logging | Not yet |
| Offline | Not yet (needs signal for most screens) |
| Safety share link, buddy tracking | Not yet |
| Trail maps, vehicle-width, MVUM | Not in scope today |

## Recommendation
Win the track-and-ride-day side that BAK already owns (garage + setup + conditions + crew), make it work with gloves and no signal,
and add the one safety feature riders ask for most (the share link). Do not build a full trail-navigation map app: onX Offroad and
Gaia have years of map data, and doing it badly would hurt the brand. Revisit public-land map layers later as their own decision.
Keep the basics free (garage, service, conditions, crew, share link) to answer subscription fatigue; Pro stays the AI and deep data.

## Phases
### Phase 1: ride-day ready (mostly app work, one build)
1. Ride Day mode: big glove-sized buttons for the few things needed trackside (setup sheet, clicker changes, tire pressure, note,
   conditions check-in), screen kept awake, and a tap lock (hold to unlock) so bumps and sweat don't press anything.
2. "What I ran here": per track, the setup, tires and pressures used each time, with that day's weather and how it rode.
3. Live conditions: one-tap "today" check-in (muddy, dusty, rough, watered, closed, busy) shown on the track with how long ago,
   fading after the day. Built on the existing track reports and their privacy rules.
4. Crew finder: filters on ride plans and events for skill level, bike size, discipline and distance; "riding here today" (opt-in only).

### Phase 2: no signal, and safety
5. Offline: the active bike's garage, setup sheet, specs, service list and saved tuning notes stored on the phone; changes made with
   no signal sync when back in range.
6. Safety share link: the rider starts a ride and sends a link; a spouse or friend opens it in any browser (no app, no account) and
   sees the last known location and time. Ends automatically, rider can stop it any time, nothing kept after. Needs background
   location (Apple asks for a clear reason) and care for battery; last-known position is honest about low signal.
7. Ride log: start/stop a ride, time and distance, adds engine hours to the Garage and fills service reminders. Moto-specific; no
   leaderboards to start.

### Phase 3: decide later
8. Public-land layers: USFS Motor Vehicle Use Maps and similar free government data, coloured by vehicle width, with a clear date
   and "check local closures". Only if riders ask for it in BAK; large data and accuracy burden.
9. Buddy tracking with no signal: needs Bluetooth-range or radio hardware; partner or skip.
10. Voice control of the app (beyond asking BAK).

## Open questions for Kyle
- Phase 1 order: Ride Day mode first, or live conditions + crew finder first?
- Share link: free for everyone (recommended), or Pro?
- Any interest in trail riding maps at all, or keep BAK MX track-first?
