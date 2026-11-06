# Ask BAK: Triumph MX evaluation (2026-11-06)

Live POST /api/eval/ask, 40 questions (38 single, 2 follow-ups) across TF 450-X 2026/27, TF 450-RC Edition 2025, TF 250-X 2024-27,
TF 250-C and TF 450-E 2026. Graded against public.claims (VERIFIED first) and the Triumph knowledge files. Raw answers: answers.json.

Score: good 29, weak 6, wrong 2, missing data 3. Stock numbers (clickers, sag, springs, torques, oil, tire pressure, gearing) were all right.

## Wrong
- Q34 / Q19: "what changed for 2027" said changes were not confirmed. Verified clickers differ (250-X: fork C 10→12, shock LSC 11→13,
  R 11→13, HSC ⅞→1½; 450-X: fork C 14→13, R 12→11, LSC 14→12) and the 2027 release notes list the hardware changes.
- Q22: TF 450-X gearing given as 13/49 (magazine record tf-005); the US handbook says 13/48 (3.69:1) for 2026 X and 2025 RC.

## Missing data
- Triple-clamp and linkage/shock-mount torques (all TF); intake/exhaust valve clearances (all TF); 2027 TF 450-X rider sag;
  2025 TF 250-X shock clickers by VIN range; stock spring rates only REVIEWED for 2024-26; 10W/50 not in the 450 claims;
  fork oil grade and air-filter oil spec.

## Answer quality
- False "not confirmed" when the other year's or model's data exists (Q19, Q21, Q34, Q37): load the compared bike's claims.
- Magazine figures stated as Triumph's (Q33 "45 h piston", Q22): handbook must win; magazine values labelled as press reports.
- Pro supercross setup too generic (Q04): no factory SX setup is published; still give a structured plan incl. fork outer-tube oil
  range 290-365 cc.
- VIN-split answer does not name the VIN ranges or where the VIN is (Q28).
- Recall banner repeated in 8 TF 450 answers regardless of VIN: once per conversation, VIN-scoped.
- Numbers only in the setup card (Q04, Q08): keep a one-line summary of each change in the text.

## Rerun on mx-engineering-73 (same 40 questions, answers-v73.json)
- Q34 / Q19 (2027 changes): now a side-by-side table of the changed clickers. Still says the 2026 spring rates are not confirmed
  (those rows are REVIEWED, being verified) and Q34 does not yet list the 2027 release-note hardware changes.
- Q22 (RC vs X): 13/48 for both, launch-test figure flagged; full spec table. Fixed.
- Q04 (pro SX): structured five-part plan with springs from the chart, fork outer oil 315 → 320 cc within 290–365 cc, compression,
  rebound, sag; says plainly Triumph publishes no factory SX setup. Fixed.
- Q28 (VIN unknown): names both VIN ranges with each column. Fixed.
- Q21 (quickshifter): gives the 2,500 rpm threshold and racing use; still misses the on/off button and clutch-for-1st→2nd details.
- Recalls: now a conditional, VIN-range line ("check your VIN; if it falls within ...") instead of "your bike is covered";
  shown once per conversation (12 of the 40 fresh single-question conversations).
