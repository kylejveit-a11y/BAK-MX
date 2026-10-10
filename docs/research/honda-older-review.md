# Independent review: Honda 2022–2024 torque candidates

Root disposition: APPROVED after all nine engine-oil wording normalizations. Live database readback contains only the prior 30 Honda facts; none contradict these torque rows. US bounded factual use is approved under HONDA_APPROVAL.md, facts only with no source redistribution. Database promotion is recorded separately.

Reviewed 2026-09-13 by `codex-europe_service`, independently of acquisition. Input: `japan-service-pass.json`, 30 candidates from six OEM-hosted competition handbooks.

**Decision: approve the factual values and exact scope of all 30 candidates, with nine lubricant-wording normalizations before promotion. No candidate requires a numerical correction.** This is a factual review, not a rights decision or database mutation. Competition-handbook table values are not complete workshop procedures.

I recomputed all six PDF byte hashes, extracted each cover and colophon, and independently rendered and visually inspected the exact torque page in every PDF. Model-year titles and publication identifiers match the source records. Each URL has an exact model/year entry in `honda-official-manual-catalog.json` under the US selector. Printing location alone was not used to assign market. Scope is standard CRF250R or CRF450R, respective year, US, stock specified fasteners; no inheritance to RX, RWE, other years or modified components.

| Source | Publication | Independently inspected torque page | Hash match |
|---|---|---|---|
| CRF250R 2024 | 61K95X30 | PDF 22; printed 2-4 | Yes |
| CRF250R 2023 | 61K95X20 | PDF 22; printed 2-4 | Yes |
| CRF250R 2022 | 61K95X10 | PDF 22; printed 2-4 | Yes |
| CRF450R 2024 | 61MKEX30 | PDF 23; printed 2-3 | Yes |
| CRF450R 2023 | 61MKEX20 | PDF 23; printed 2-3 | Yes |
| CRF450R 2022 | 61MKEX10 | PDF 23; printed 2-3 | Yes |

The CRF250R oil-drain, rear-axle, fork-protector, front-caliper and clutch-spring rows match all three originals, including oil application, self-locking designation, new protector bolts, thread-locking compound and fastener quantities/diameters. CRF450R drain, holder, cap, seat and terminal rows likewise match. Engine-oil drain thread diameter is 14 mm on these 250s and 30 mm on these 450s; the latter is not a transcription error. Blank table remarks for seat, battery and clutch do not establish a blanket dry-assembly procedure.

Required normalization for each year's oil-drain candidate and each CRF450R camshaft-holder candidate: replace the leading generic “Oil threads” with **“Apply engine oil to threads”**, preserving seating-surface wording. This keeps the source's specified lubricant explicit. Values and other conditions can be retained.

| Candidate ID | Independent result |
|---|---|
| `honda-us-crf250r-2024-competition-oil-drain-torque` | APPROVE after engine-oil wording normalization |
| `honda-us-crf250r-2024-competition-rear-axle-torque` | APPROVE as scoped |
| `honda-us-crf250r-2024-competition-fork-protector-torque` | APPROVE as scoped |
| `honda-us-crf250r-2024-competition-front-caliper-torque` | APPROVE as scoped |
| `honda-us-crf250r-2024-competition-clutch-spring-torque` | APPROVE as scoped |
| `honda-us-crf250r-2023-competition-oil-drain-torque` | APPROVE after engine-oil wording normalization |
| `honda-us-crf250r-2023-competition-rear-axle-torque` | APPROVE as scoped |
| `honda-us-crf250r-2023-competition-fork-protector-torque` | APPROVE as scoped |
| `honda-us-crf250r-2023-competition-front-caliper-torque` | APPROVE as scoped |
| `honda-us-crf250r-2023-competition-clutch-spring-torque` | APPROVE as scoped |
| `honda-us-crf250r-2022-competition-oil-drain-torque` | APPROVE after engine-oil wording normalization |
| `honda-us-crf250r-2022-competition-rear-axle-torque` | APPROVE as scoped |
| `honda-us-crf250r-2022-competition-fork-protector-torque` | APPROVE as scoped |
| `honda-us-crf250r-2022-competition-front-caliper-torque` | APPROVE as scoped |
| `honda-us-crf250r-2022-competition-clutch-spring-torque` | APPROVE as scoped |
| `honda-us-crf450r-2024-competition-oil-drain-torque` | APPROVE after engine-oil wording normalization |
| `honda-us-crf450r-2024-competition-camshaft-holder-torque` | APPROVE after engine-oil wording normalization |
| `honda-us-crf450r-2024-competition-crankshaft-cap-torque` | APPROVE as scoped |
| `honda-us-crf450r-2024-competition-seat-bolt-torque` | APPROVE as scoped |
| `honda-us-crf450r-2024-competition-battery-terminal-torque` | APPROVE as scoped |
| `honda-us-crf450r-2023-competition-oil-drain-torque` | APPROVE after engine-oil wording normalization |
| `honda-us-crf450r-2023-competition-camshaft-holder-torque` | APPROVE after engine-oil wording normalization |
| `honda-us-crf450r-2023-competition-crankshaft-cap-torque` | APPROVE as scoped |
| `honda-us-crf450r-2023-competition-seat-bolt-torque` | APPROVE as scoped |
| `honda-us-crf450r-2023-competition-battery-terminal-torque` | APPROVE as scoped |
| `honda-us-crf450r-2022-competition-oil-drain-torque` | APPROVE after engine-oil wording normalization |
| `honda-us-crf450r-2022-competition-camshaft-holder-torque` | APPROVE after engine-oil wording normalization |
| `honda-us-crf450r-2022-competition-crankshaft-cap-torque` | APPROVE as scoped |
| `honda-us-crf450r-2022-competition-seat-bolt-torque` | APPROVE as scoped |
| `honda-us-crf450r-2022-competition-battery-terminal-torque` | APPROVE as scoped |

Conflict review covered the existing `honda-approved-facts.json` snapshot, older Honda staging files, repo-wide matching fastener searches, and the coverage ledger. No existing contradictory same-model/year/variant/region claim was found. Existing approved 2022/2024 CRF250R records describe valve clearances, fluid fills, ignition and electrical specifications, not these torque rows. Coverage-ledger duplicates are the same research candidates and are not independent corroboration. The 2025/2026 handbook extraction is different-year scope, so it was not used to validate older values. This review did not query live database state; root must handle any live conflict gate during promotion.

Evidence PDFs remain the acquisition agent's temporary copies, and no full document, page image or extracted source text was added to the repository by this review. Only this concise review was written. All source hashes are recorded in the acquisition JSON and were checked against original bytes, not assumed from metadata.
