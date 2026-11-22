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

## Built and first scores (2026-11-21)

- Packs: `shared/specialists.ts` (suspension 14 sections, engine 9, bike set-up 8). Only the sections a question touches are sent. Method only, no bike numbers. Two-stroke sections are not sent for four-strokes, jetting is not sent for injected bikes.
- Exams: `docs/research/specialists/{suspension,engine,setup}-exam.json`, 100 questions each, written by `scripts/specialists/*_exam.py`, run and scored by `scripts/specialists/run_exam.py`.
- Today's BAK before any pack (prompt 93): suspension 97.6, engine 94.2, bike set-up 95.9 out of 100. Median answer time 15.8 s, 18.5 s, 17.2 s. Nothing invented in any answer.
- Suspension with the pack: 96.1 (3 answers better, 5 worse, the rest the same) and 1.8 s slower. That is no real change, so by the rule above the suspension pack stays OFF for riders.
- Engine and bike set-up with their packs: not measured yet. The daily test allowance (600 questions) ran out 19 questions into the engine re-run. Both packs stay OFF for riders until measured.
- Switch: `WORKSHOPS_LIVE` in `shared/specialists.ts`. The exam route can ask with the packs on (`trial.workshops`), so they are measured without riders seeing them.
- What the first result says: on shop-level questions BAK is already near the top of what a marking sheet can measure. Where it loses marks is two-stroke rebuild detail and general engine care (89 to 91), which is where the engine pack has the best chance. The gap to "pro shops envy it" is data BAK does not have (shim stacks, port maps, tuner settings), as said in "What limits it".

## Engine and bike set-up packs measured (2026-11-22, prompt 95)

- Engine, no pack: 95.0 (same-day re-run on prompt 95; the 2026-11-21 baseline of 94.2 was on prompt 93). With the pack: 95.9. Question by question: 7 better, 4 worse, 89 the same. Median answer time 18.3 s without, 18.4 s with. Nothing invented.
- Bike set-up, no pack: 95.9. With the pack: 96.2. 7 better, 5 worse, 88 the same. 17.2 s without, 17.1 s with. Nothing invented.
- Decision: neither is a clear gain (under one point on the same prompt, about as many answers worse as better), so by the rule above all three packs stay OFF in `WORKSHOPS_LIVE`. They cost no speed and did no harm, so they stay in the code for re-testing.
- What this says: method rulebooks do not move the score because BAK already reasons at this level. The next real gain is data (shim stacks, port and tuner settings, more service-manual facts), not more instructions. Re-run the three exams whenever a batch of that data is added.
