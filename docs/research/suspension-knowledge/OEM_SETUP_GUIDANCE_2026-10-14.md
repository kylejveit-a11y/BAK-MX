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

## Kawasaki (added 2026-10-14)

`kawasakiGuidance` in the same module: 18 rows from the Tuning chapter of the KX owner's manuals (front fork and rear shock
"improper adjustment symptoms", and "Front and Rear Suspension Troubleshooting"), plus the chapter's general method (break-in,
small steps, front-rear balance, fork oil amount and the end of the stroke, spring by rider weight and ability, fork height by
course type, the front-rear compatibility push test). Given to Ask BAK for the 25 KX bike-years 2020-2026 whose manual BAK holds
(not the 2021 KX250, which has no manual).

Checked: the chapter pages of all 17 manuals were fetched from Kawasaki's viewer and OCR'd; the troubleshooting text was compared
word for word with the 2024 KX450 manual (99803-0401, pages read on the page images). The KX450 / KX450X manuals match it. The
KX250 / KX250X manuals (KYB to 2024, Showa from 2025) print the same text without the fork spring preload items, which are
therefore attached to the KX450 / KX450X only. The 2025-2026 manuals index the chapter's sub-sections; the text is the same.

## Where the two manufacturers and BAK's rules differ

| Symptom | BAK setup-knowledge.ts | Yamaha | Kawasaki |
|---|---|---|---|
| Rear will not hook up / poor rear grip | Shock low-speed compression softer first | Rebound faster; then low-speed and high-speed compression firmer; softer spring | Shock too stiff: less preload, high- and low-speed compression softer, softer spring for a light rider |
| Rear kicks over braking bumps | High-speed compression too firm is the more common cause; warns that slowing rebound often makes it worse | Not a row (bouncing: slower rebound) | Rebound too fast: slower rebound |
| Front pushes / washes | Fork compression softer; check sag; raise forks in the clamps | Front high: compression softer, less sag, softer spring, less oil | Front too stiff: compression or rebound softer, bleed air, less oil, softer spring |
| Front knifes / tucks | Fork compression firmer, rebound faster | Front low: compression firmer, rebound faster, more sag, more oil | Front too soft: compression or rebound firmer, more oil |

Ask BAK now follows the bike maker's table for that maker's stock suspension and mentions the other possibility. The rear-grip
and braking-bump rows are where BAK's own rules most need a decision, because the two manufacturers disagree with each other on
rear grip and Kawasaki disagrees with BAK's note on braking bumps.

## Next sources of the same kind (owner's manuals already in hand or public)

- Honda owner's manuals: "Adjustments for Competition" (needs the PDFs; Honda's CDN refuses this environment).
- KTM / Husqvarna / GasGas owner's manuals: chassis setting and air-fork pressure guidance. KTM's manual restricts
  reproduction even in part: paraphrase and cite only, and get sign-off before showing any table.
