# Ride tracking and lap timing

Kyle asked for this on 2026-11-25 after the market analysis showed lap timing is the one rider-app category with a real
following. Decisions he made: recording and lap times are **free on every plan**; **phone only** for the first version
(no Apple Watch); **no leaderboards or challenges** yet. Comparing sessions and tying laps to the setup log come next and
go on the paid plans (Kyle: everything in Pro is also in Premium, Pro only raises the limits).

## What is built (code, 2026-11-25; not yet run on a phone)
- `shared/ride-track.ts`: cleans GPS points, finds the start point by itself (the place the rider came back to most often
  and most evenly in the first four minutes), times laps by closest approach, marks slow laps, sums distance, riding time
  and top speed, thins the route. Tested against made-up rides in `tests/ride-track.test.ts`.
- `supabase/migrations/20261125150000_rides.sql`: the `rides` table (applied to the MX project). Totals, laps, thinned
  route. Raw points are never stored.
- `server/rides.ts` and `/api/rides` in `server/app.ts`: save (server does the maths), list, open, delete. In the account export.
- `apps/mobile/src/rideRecorder.ts`: background recording to a file, stop and save, rides that wait for signal.
- `apps/mobile/src/RideRecorder.tsx`: the card on practice day and race day, the rides list, the ride page.

## Known limits, said in the app
- A phone fixes position about once a second to a few metres, so a lap is good to about a second.
- Recording uses battery. Not measured yet on a real phone.

## To do before release
- Run it on a real phone at a real track: laps found, screen-off recording, battery over a 20 minute moto.
- Android: recording in a pocket needs a foreground service (now switched on in app.config.ts). Google Play asks for a
  declaration and a short video of the feature for that permission. Not done.
- Privacy policy: say that a recorded ride's route is saved to the rider's account and how to delete it.
- App Store Connect privacy page: Location already listed; the purpose now includes ride recording.
- Next: laps beside the setup log, session comparison, and BAK reading the rider's lap history.
