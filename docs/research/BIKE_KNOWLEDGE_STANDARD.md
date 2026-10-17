# BAK MX bike knowledge standard

Set 2026-10-17 after Kyle's direction: BAK MX is meant to be the place every gas race-bike rider and racer goes for
anything about their bike. A bike is COMPLETE only when BAK can answer every question below for it. Before this date
"complete" meant spec sheet + owner's-manual settings + parts catalog. That was too narrow and is retired.

Knowledge is kept per **platform generation** (e.g. Yamaha YZ450F 2023-2026) with year-specific overrides, so one research
effort covers every year that shares the engine or chassis.

## Source tiers (every fact carries one)

| Tier | What it is | How BAK says it |
|---|---|---|
| OEM | Manufacturer manuals, spec sheets, press kits, parts diagrams, OEM apps | "Yamaha publishes..." |
| MEASURED | Independent measurement: magazine and tuner dynos, scale weights, measured port timing | "On a magazine dyno..." with the number |
| TUNER | What engine/suspension builders and race teams report (maps, porting, setups) | "Engine tuners commonly..." with the number |
| DERIVED | BAK engineering calculation from published inputs, with the working shown (piston speed, bore/stroke ratio, speed per gear, port-time-area estimates) | "Worked out from Yamaha's bore and stroke..." |
| COMMUNITY | Repeated rider reports (forums, owner groups) when several agree | "Many owners report..." |

Rules: never present a lower tier as a higher one; second-hand numbers are allowed and given with their tier (Kyle,
2026-10-17); individual testers, tuners and magazines stay unnamed in rider-facing answers; conflicting sources are
kept side by side with the spread, never averaged into a fake single value.

## Domains (what COMPLETE requires)

1. **Identity and generations**: platform generation, what changed each year (engine, chassis, suspension, electronics),
   US vs other markets, special editions, recalls and service bulletins.
2. **Engine architecture**: bore, stroke, ratio, displacement, compression, rev limit, valve sizes and material, cam
   lift/duration where published or measured, rod length, throttle body / carb size, injector, airbox.
   Two-strokes: port layout, exhaust/transfer port timing and duration, power valve type and how it operates, reed
   block, crankcase, pipe and silencer design, head volume and squish.
3. **Power and feel**: dyno curves (peak and shape, several sources), power and torque by rpm band, how it pulls
   (bottom, mid, top, over-rev), hit vs linearity, engine braking, vibration, how it compares with rivals, why it
   behaves that way (architecture to feel), measured weight, gear ratios and speed per gear.
4. **ECU and electronics**: maps and switches, apps (Yamaha Power Tuner, etc.), every adjustable parameter, traction
   control, launch control, quickshifter, published maps (OEM and tester), aftermarket ECUs and flash services, what
   each change does to the feel.
5. **Engine modifications**: exhaust, cams, head and porting (four-stroke and two-stroke), compression, fuel, gearing,
   clutch; measured before/after effects where they exist; what each does to the curve and rideability; reliability cost.
6. **Chassis**: rake, trail, offset, wheelbase, seat height, ground clearance, weight distribution, frame character,
   linkage ratio, triple clamp options, ergonomics.
7. **Suspension**: stock settings and ranges, spring charts, oil types and levels, internal components, valving
   character, conversion options (e.g. air to coil), tuner baselines by rider weight and discipline.
8. **Drivetrain**: primary and final ratios, gear ratios, clutch plates/springs specs, chain and sprocket stock sizes.
9. **Maintenance**: full service schedule, capacities, full torque table, valve clearances, wear limits, consumable
   part numbers, fuel and oil specs.
10. **Known issues and reliability**: common failures, early-warning signs, fixes, bulletins, part supersessions.
11. **Setups that work**: tester and racer setups per discipline and rider size (suspension, maps, gearing, tires).
12. **Parts and fitment**: aftermarket catalog with colours (exists).
13. **Racing**: discipline knowledge (exists), class eligibility notes.

## How coverage is scored

`scripts/knowledge/coverage.py` scores every roster bike-year 0-100 per domain and writes
`docs/research/knowledge/COVERAGE.md`. A domain counts only when its required fields are present at OEM or MEASURED
tier, or at TUNER/DERIVED tier with a source. "Not published anywhere" is recorded explicitly so a gap is never
mistaken for missing work.

## Order of work

1. Pilot to full depth: Yamaha YZ450F 2023-2026 and KTM 450 SX-F 2023-2026 (engine, power, ECU, mods first).
2. Two-stroke porting and power-valve knowledge base (KTM/Husqvarna/GasGas TBI 125-300, Yamaha YZ125/YZ250).
3. Scale domain by domain across every platform generation in the roster, most-owned bikes first.
4. Fill the hard gaps found by the coverage report (Honda RX models, torque tables, off-road models).
