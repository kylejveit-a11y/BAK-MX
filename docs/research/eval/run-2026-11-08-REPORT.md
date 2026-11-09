# Ask BAK full evaluation, 2026-11-08

Live /api/eval/ask, blind graders per GRADING_RUBRIC_V2 (two per answer for the rider sets).

| Set | Version | A | B | C | D | F | A+B |
|---|---|---|---|---|---|---|---|
| 100 rider questions (2026-11-04 baseline) | earlier | 16 | 45 | 37 | 2 | 0 | 61% |
| 100 rider questions | mx-engineering-81 | 80 | 87 | 32 | 1 | 0 | 83.5% (of 200 grades) |
| Set 2, 100 questions (2026-11-04 baseline) | earlier | 81 | 85 | 34 | 0 | 0 | 83% |
| Set 2, 100 questions | mx-engineering-81 | 88 | 86 | 25 | 1 | 0 | 87% (of 200 grades) |
| Triumph, 40 questions | 81/82 | 18 | 15 | 7 | 0 | 0 | good 33 / weak 2 / wrong 1 / missing 4 |

No answer was graded unsafe. Every number checked against a cited maker fact matched.
Two grader "wrong fact" calls were checked and BAK was right: the 2025 KTM 125 SX is fuel-injected (KTM manual lists the fuel pump
and fuel-pressure checks), and CPSC 25-283 is the May 2025 GasGas/Husqvarna front-caliper recall (bike_knowledge ki6-001).

## Fixes shipped
- v82: "isn't confirmed here" at most once per reply; a default first change before any question; fitment answers lean with a
  reason and one check. Blind before/after on the 25 weakest: new better 13, old better 5, same 7.
- v83: rebuild hours: v82's race-shop windows ran past the makers' schedules (four-stroke piston: Yamaha every fifth race about
  12.5 h; Honda and Kawasaki every 6 races about 15 h). The maker's schedule is now the ceiling.
- v84: rider units read the obvious way (.006/.002 clearances as inches, judged); spring answers cover fork and shock; no
  "reviewed procedure" / "supplied geometry" source wording.
- Data: Husqvarna FX 350 2023 (283 maker rows, was empty). Triumph map order and 450-X gearing corrected; 2027 TF 250-X release
  notes filed under 2027.
- Not sold in the US (no data needed): Husqvarna FC 350 / FX 450 / TC 300 2026, KTM 150 SX 2023-2024.
- Blocked: Suzuki RM-Z 2023 specs and all RM-Z valve clearances (only in paid/dealer manuals).
