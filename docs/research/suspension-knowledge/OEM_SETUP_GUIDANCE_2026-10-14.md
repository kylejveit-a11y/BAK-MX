# Manufacturer suspension guidance (Yamaha) and cross-check of BAK's setup rules, 2026-10-14

## What was added

`shared/manufacturer-setup-guidance.ts`: Yamaha's "Suspension setting (front fork)" and "Suspension setting (rear shock
absorber)" tables, restated in BAK's own words (16 symptom rows: 9 fork, 7 shock; symptom, where on the track, what to check,
which way to adjust). Ask BAK receives it only when the rider's bike is one of the 56 Yamaha bike-years whose manual was
checked (YZ125, YZ125X, YZ250, YZ250X, YZ250F, YZ250FX, YZ450F, YZ450FX, 2020-2027 as held), with the manual code in the
boundary. The prompt (mx-engineering-14) tells the model to prefer the manufacturer's direction for stock suspension where it
covers the symptom, say it comes from the owner's service manual, and mention the other possibility where BAK's own rules differ.
No numbers are carried: the manual's step sizes and standard sag figure come only from verified claims. WR250F / WR450F and the
2020 two-stroke manuals were not checked and get nothing.

## How the tables were checked

- Located in each manual's Tuning chapter (PDF pages recorded per bike-year in the module).
- Compared word by word after removing numbers: 2020-2023 manuals share one text, 2025-2027 another, 2024 a third; the
  differences are hyphenation, column wrapping and a missing "TIP" heading, not content.
- Rows read from the rendered 2025 YZ450F pages 10-6 to 10-8 (D02-2819U-10), cell by cell.

## Cross-check against `shared/setup-knowledge.ts` (for Kyle's review)

Agrees with Yamaha:
- front-push (front high): fork compression softer, less rider sag.
- front-tuck (front low): fork compression firmer, fork rebound faster, more rider sag.
- packing / rear stiff and sinking: rebound faster at that end.
- bottoming: fork compression or shock high-speed compression firmer; check spring for rider weight.
- deflect / rear-kick: shock high-speed compression softer for stiff big hits; rebound slower for bouncing.
- wallow-squat: shock low-speed compression firmer (Yamaha also lists slower rebound and a stiffer spring).
- arm pump / harsh small bumps: fork compression softer; fork rebound faster for poor initial movement.

Differs:
1. Poor rear grip on small bumps (`no-drive`). BAK's first change is shock low-speed compression softer. Yamaha lists rebound
   faster first, then low-speed and high-speed compression firmer, sag within standard, and a softer spring. Both views exist
   among tuners (a rear that skips across chop vs one that wallows and loses drive). Decide which tell-tale picks which; the
   model is now told to follow Yamaha for a stock Yamaha and mention the alternative.

Missing from BAK's rules, present in Yamaha's:
2. Fork oil level as an adjustment of the air spring near the end of the stroke (less oil for stiff at the end, more for
   bottoming at the end) on coil-spring forks. Not applicable to air forks.
3. "Movement not smooth anywhere in the stroke" as a mechanical check (tube damage, worn bushings and piston band, bottom clamp
   torque) before any clicker change.
4. Poor initial movement: grease the fork oil seal lip.

Suggested: add an `oil_level` adjuster (coil forks only, direction only) and an `unsmooth-fork` symptom guide to
setup-knowledge.ts after review; not done here because that file is marked as authored and pending Kyle's review.

## Next sources of the same kind (owner's manuals already in hand or public)

- Kawasaki owner's manuals: "Basic Readjustment of the Suspension", "Front and Rear Suspension Compatibility Inspection" and
  "Front and Rear Suspension Troubleshooting" (viewer pages after the Suspension tuning entry; not yet fetched).
- Honda owner's manuals: "Adjustments for Competition" (needs the PDFs; Honda's CDN refuses this environment).
- KTM / Husqvarna / GasGas owner's manuals: chassis setting and air-fork pressure guidance. KTM's manual restricts
  reproduction even in part: paraphrase and cite only, and get sign-off before showing any table.
