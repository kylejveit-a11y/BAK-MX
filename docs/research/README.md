# Evidence acquisition checkpoint

Latest approval update: 30 Honda records are VERIFIED in the live MX database; 55 of the 85 collected OEM/OEM-authored records remain unapproved. Original research/staging files remain historical snapshots; see HONDA_APPROVAL.md and honda-approved-facts.json for the actual approval record. The publication itself is not licensed for redistribution. The counts below describe acquisition and the prior staging checkpoint, not current database status.

These files contain source-specific research, not production specifications. They are deliberately outside application imports. Original research inventories are not ingestion payloads. The two Honda staging JSON files are normalized to the actual candidate schema, with approval still pending; see STAGING_CHECKPOINT.md.

| Workstream | Candidate records | Important scope |
|---|---:|---|
| Honda/Yamaha | 10 | 2026 US Honda CRF450R manual facts and Yamaha app capabilities |
| KTM/Husqvarna/GasGas | 12 | Exact 2026 AU/NZ scopes plus a US Factory Edition; not US standard inheritance |
| Kawasaki | 8 | Australian 2025 KX450 and 2026 KX250; US compression discrepancy excluded |
| Older US Honda/Yamaha | 14 | 2025 CRF250R, 2024 YZ250F, 2025 YZ250F/YZ450F; review pending |
| Honda historical manual pass | 24 | 2022 and 2024 US-standard CRF250R specification tables, visually checked |
| European manual/connectivity pass | 17 | US Husqvarna CUO, region-unresolved KTM CUO, dealer-hosted KTM-authored 2025 450 SX-F manual |
| Aftermarket | 10 leads | 8 manufacturer-page in-scope records, 1 index-only lead, 1 excluded older fitment |
| Aftermarket follow-up | 6 leads | 3 product candidates, 3 component-only leads; conflicts and component prerequisites retained |

Total: 85 OEM/OEM-authored candidate facts, 11 aftermarket product records, and 5 other aftermarket leads. This includes seven facts from a dealer-hosted KTM-authored manual whose publisher corroboration remains pending. No runtime promotions. Three Honda PDFs were downloaded for temporary local inspection and hashed; none is redistributed in the source archive. Honda 2022, 2024 and 2025 table reviews passed. Thirty Honda records are now STAGED in the live dedicated MX database; these are copies of existing research facts, not additional candidates. Rider-role SQL verification returned zero visible staged rows. See STAGING_CHECKPOINT.md.

The generated COVERAGE.md and coverage-ledger.json track all 60 model-year targets. Current research touches 27 targets; 11 have at least one exact US-standard candidate. A candidate count does not establish service, diagnostic or launch coverage. Aftermarket year charts do not override installed-component requirements.

## Next acquisition steps

1. Fill missing 2022–2025 and US-standard applicability from official owner manuals and technical archives. Use manufacturer publication stores for legally available service manuals; obtain approval for any purchase.
2. Retain permitted source snapshots, revision and content hashes; short factual extraction does not authorize redistribution of whole publications.
3. Independently check technical facts, conditions, exact fitment, revisions and conflicts. Resolve rights/usage basis without inventing permission.
4. Normalize approved records into the ingestion schema, stage them, then explicitly review promotion. Do not weaken runtime gating to inflate coverage.

No torque/service interval/valve/fitment value should be served from this directory directly. Source-linked candidate notes may help reviewers acquire the right publication; they are not rider instructions.
