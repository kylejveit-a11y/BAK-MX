# Ask BAK: Triumph MX evaluation (2026-11-08)

Same 40 questions as 2026-11-06 across TF 450-X 2026/27, TF 450-RC Edition 2025, TF 250-X 2024-27, TF 250-C and TF 450-E 2026
(Q01-Q04 on mx-engineering-81, Q05-Q40 on mx-engineering-82). Graded per GRADING_RUBRIC_V2 against public.claims (VERIFIED first)
and public.bike_knowledge, read-only.

Score: good 33, weak 2, wrong 1, missing data 4 (2026-11-06: good 29, weak 6, wrong 2, missing 3). Letters A 18, B 15, C 7, D 0, F 0.
Every stock number checked against claims was right (clickers, sag, springs, torques, oil, tire pressure, gearing).

## Wrong
- Q34 (2027 TF 250-X, what changed): said the 2027 hardware list was not confirmed. The release-note rows tf-008 and tg-020 were
  filed under model_year 2026 only. FIXED 2026-11-08: also filed under 2027 (database and triumph_tf.json / triumph_gapfill.json).
  Re-asked on mx-engineering-84: lists valve guides, selector drum, clutch pack, mapping, Neken clamps, tool-free clickers, chain
  guide, start-stop switch, and the map table.

## Data corrected
- tf-045 said Map 1 is the stronger map on every TF. Triumph US handbooks: 2024-2026 MAP 1 standard, MAP 2 full power; 2027
  swapped (MAP 1 full power, MAP 2 softened). Corrected (7 rows + triumph_tf.json). Re-asked on a 2027 TF 250-X: "Light off =
  MAP 1, full power".
- tf-057 said 13/49 stock on the 450-X; handbook is 13/48. Corrected (5 rows + triumph_tf.json).

## Weak
- Q20: suggested 105 mm riding sag for the 2027 450-X with no source (2026 handbook: 102 mm; no 2027 riding-sag row).
- Q35: named the 60 N/mm shock spring but no fork spring (4.8 / 4.9 N/mm options) and no sag target. Covered by the v84 rule that
  spring questions answer both ends.

## Missing data (still open)
- Valve clearances, triple-clamp and linkage torques, fork-oil grade, air-filter oil, cam specs (all TF); 2027 riding sag;
  10W/50 for the 450 as a claims row; where the VIN is stamped.

## Answer quality
- Q19 missed the 2027 map swap (fixed by the tf-045 correction). Q04 showed a visible self-correction. Q10/Q31 gearing without the
  % change. Recall line appeared only once (Q01) across fresh TF 450 conversations: to check.

## Versus 2026-11-06
- Fixed: 2027 450-X clicker table, RC vs X gearing (no 13/49), structured pro SX plan, VIN ranges named, quickshifter details,
  45 h piston labelled as a press figure, VIN-conditional recall line, numbers in the answer text, TF 250-X spring rates VERIFIED.
