# Current non-KTM expansion checkpoint

Kyle lifted the prior KTM-only sequencing restriction and put its paid manual purchase on hold. Latest raw manufacturer files are under ../expansion/. Read the repository HANDOFF.md and expansion/RECOVERY_STATE.json: some reviewed files are newer than normalized inventory. Do not use historical counts below as current completion claims. No complete engineering-specification inventory exists.

---

# BAK MX part-by-part inventory

## Latest sequential checkpoint

2025 KTM 450 SX-F US F8475Y5 now has all 42 official groups enumerated: 1,168 source rows / 1,167 distinct entries, including 380 distinct WP assortment entries. All diagram-linked references are accounted for. Total normalized inventory across existing bikes is now 1,357 rows. One complete OEM catalog enumeration; zero complete engineering-specification inventories. KTM remains active because its specification mapping is unfinished; other bikes are paused. See KTM_COMPLETION.md. Older initial-batch counts below are historical.

Current checkpoint: 60 model/year targets tracked, 237 catalog-group entries and 235 captured parts-table rows. Six targets have some catalog research; five have actual part rows. All 60 remain incomplete. Group counts include source navigation categories (for example Yamaha title pages), not certified physical assemblies. No whole-bike part count or completeness percentage is known yet.

| Target | Catalog groups captured | Part rows captured |
|---|---:|---:|
| 2025 KTM 450 SX-F | 42 | 45 |
| 2024 Yamaha YZ250F | 45 | 93 |
| 2025 Honda CRF250R | 50 | 61 |
| 2025 Kawasaki KX450 | 56 | 24 |
| 2025 Husqvarna FC 450 | 2 | 12 |
| 2025 GasGas MC 450F | 42 | 0 |

## Structure and acceptance

Every row represents a catalog callout occurrence within an exact target and assembly. Part number is not the primary key: the same number can occur in several joints, and a callout can offer alternative parts. Nested assemblies and alternatives are retained without summing them into a false installed bill of materials. Supersession evidence remains in acquisition records; a replacement is not proof that all service instructions are unchanged.

Each normalized row has seven initial specification-review slots: torque, dimensions, material/grade, clearance/wear limit, installation, replacement rule and service interval. These are review requirements, not claims that every property applies to every part. NOT_APPLICABLE requires documented evidence and review. UNKNOWN contains no guessed value. Further component-specific properties can be added. The current 1,645 open slots are a checklist count, not a count of published specifications missing from manuals.

Completeness requires an independently reconciled assembly/callout denominator and source-backed review. No assembly is certified complete simply because a retailer table was read. US is the requested inventory target; scope_status remains PENDING until exact manufacturer market/configuration and revision are reconciled. Current research is not runtime engineering truth.

## Evidence distinctions

MotoSport and RevZilla expose useful OEM fiche data, but retailer availability, cart quantities and model selectors need separate handling. Suggested order quantities remain in raw research, not normalized installed quantities. Twenty-four Kawasaki quantities were captured from indexed manufacturer assembly tables and are still pending live-source review. The Kawasaki oil-filter O-ring replacement discrepancy is retained as a CONFLICTED identity row.

Honda acquisition proposed four links to two already-approved torque claims. They remain candidate installation mappings in its raw file; normalized specifications remain UNKNOWN until exact fastener/installation review. Neither generic nuts nor all members of a spoke set inherit a torque automatically. The live approved claim count remains 130; this pass did not mutate the database or deploy application changes.

Public owner manuals remain an acquisition priority, including KTM. Prior manual work is retained in ../MANUAL_ACQUISITION_REPORT.md. Having a public manual link does not establish that all technical tables have been extracted. Diagrams generally identify parts; exact service specifications and prerequisites still require matching manuals, bulletins and component documentation. No generic bolt-size torque substitution is allowed.

## Files and reproducibility

- PARTS.md: readable row-by-row captured register with source links.
- COVERAGE.md: all 60 model/year targets and outstanding coverage.
- inventory.json: normalized target, group, part and specification-slot records.
- Manufacturer acquisition JSON/Markdown: original source details, access limitations, alternatives and proposed mappings.
- `npm run research:parts`: normalize acquisition records, validate scope/duplicates and rebuild reports.

Verification: 54 root tests passed and TypeScript checking passed. New gates exercise partial-diagram completeness, same-part/different-assembly handling, duplicate callouts, wrong-year mapping, unsupported quantities and unknown/not-applicable misuse. No new native build, deployment, database promotion or live rider retrieval is claimed.

## Remaining work

1. Finish every listed assembly on the first six targets, with independent diagram/callout reconciliation, alternatives and nested assemblies.
2. Acquire catalogs for the remaining 54 exact targets without year inheritance.
3. Corroborate market/model codes, installed quantities and supersessions with manufacturer catalogs.
4. Match each relevant owner/service-manual fact to the exact installation, keeping lubricant, locking compound, sequence, angle and replacement conditions.
5. Review and promote valid mappings through the existing evidence workflow; then qualify retrieval in the app.

This is a completed inventory foundation and initial acquisition batch, not completion of the exhaustive every-part/every-spec goal.
