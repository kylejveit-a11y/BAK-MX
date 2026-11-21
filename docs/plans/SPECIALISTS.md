# Specialists under one BAK: design and test plan for Kyle's approval (2026-11-21)

Kyle's idea (2026-11-20): a Suspension specialist, an Engine specialist and maybe a Bike set-up specialist, each "holy
shit good", all under the one BAK the rider talks to.

## How it works (the rider still sees one BAK)

1. **Sorting.** Every question is sorted into Suspension, Engine, Bike set-up, or General. BAK already plans each answer
   before writing it; the sorting rides on that step, so it adds no waiting.
2. **Knowledge pack.** Each specialty has its own pack that is loaded only for its questions:
   - the facts on file for the rider's exact bike in that area (already in the database),
   - a rulebook for the specialty: how one change affects another, the order to try things in, what to measure first,
     what a shop would check, and the mistakes to warn about,
   - step-by-step jobs (rebuilds, teardown order, checks) with the bike's own torques, clearances and volumes filled in.
3. **Honesty rule stays.** Where a number is not on file (most valve shim stacks, tuner-only settings, porting
   dimensions), the specialist says it is not confirmed and explains the method instead. It never makes one up.

## Order

1. **Suspension first.** It has the most data already: spring rates, clicker ranges and factory settings, sag, oil
   levels, aftermarket springs, maker setup notes.
2. **Engine second** (top end, bottom end, valve checks, clutch, jetting and mapping, teardown and rebuild order).
3. **Bike set-up third** (gearing, bars and controls, tyres and pressures for the dirt, race-day set-up).

## Test plan (nothing ships unless it scores better)

- Write a 100-question exam per specialty, the kind a shop tech or fast local rider would ask, across the bikes in the
  app. Each question has a marking sheet: the facts that must appear (from the data on file), the reasoning that must
  appear, and things that must not be said.
- Score today's BAK on the exam. That is the baseline.
- Build the pack, score again. Ship only if: the score goes up clearly, no factory value is lost, nothing invented
  appears, and answers are not slower by more than about 2 seconds.
- Re-run the exam on every later change so the specialist can never quietly get worse.

## What limits it

Data, not plumbing. Shim stacks, piston and valve part dimensions beyond the manuals, and porting numbers are mostly in
paid service manuals or belong to tuners. The pack gets deeper every time a manual or a tuner's sheet is added.

## Decisions needed from Kyle

1. Start with Suspension: yes or no.
2. Riders see nothing new at first (BAK just gets better at suspension), and the "specialist" name is only used in
   marketing once the exam scores prove it. Yes, or name it in the app from day one.
3. Whether this has to be finished before 1.0.12 goes to review. It lives on the server, so it can ship any day without a
   new app build; it does not need to hold the build.

## Kyle's answers (2026-11-21)

Start with Suspension, then Engine and Bike set-up. All three are finished before the next app build (1.0.12). Server-side only and invisible to riders: no specialist name in the app.
