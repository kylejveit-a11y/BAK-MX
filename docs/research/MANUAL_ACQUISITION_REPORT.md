# Service-manual acquisition and extraction — 13 September 2026

## Completed

Acquired and inspected selected sections of twelve full OEM PDFs: Honda CRF250R and CRF450R competition handbooks for every year 2022–2026, plus Yamaha 2024 YZ250F and 2023 YZ450F Owner's Service Manuals (388 pages each). Ten Honda selector results include both owner and competition links, twenty links total. Exact original bytes were hashed; original covers and extracted numerical tables were visually checked.

Extracted 100 new bounded facts from these twelve sources: 78 Honda fastener specifications and 22 Yamaha lubrication, cooling, ignition and valve specifications. Separate acquisition/review workstreams checked values and scope. Thirteen lubricant descriptions were corrected to explicitly retain engine oil. All 100 passed schema/promotion gates and were atomically inserted STAGED then promoted VERIFIED in the dedicated MX database. Authenticated-role readback confirmed 130 total VERIFIED facts across 12 exact US-standard model/year targets. Thirty existing Honda facts were preserved. The approved snapshot is manual-approved-facts.json; individual review reports record scope and limitations.

Five further KTM owner-manual extracts remain research-only, pending publisher/source review; they are not factory repair-manual extracts. The existing compression-ratio conflict remains unresolved. Total research inventory is now 190 candidate records, of which 130 have approved live counterparts and 60 remain unapproved. Research snapshots retain their original non-runtime labels; snapshots alone cannot promote records. There are 34/60 targets with some research and 19/60 with an exact US-standard candidate. These counts measure presence, not adequate coverage.

## Coverage and gaps

| Family | Documents actually read this pass | Main remaining acquisition gap |
|---|---|---|
| Honda CRF250R / CRF450R | Ten competition handbooks, all 2022–2026 targets | Separate factory service manuals for advanced repairs and diagnostic procedures |
| Yamaha YZ250F | 2024 US Owner's Service Manual | 2022, 2023, 2025, 2026 exact US service manuals |
| Yamaha YZ450F | 2023 US Owner's Service Manual | 2022, 2024, 2025, 2026 exact US service manuals |
| Kawasaki KX250 / KX450 | No full service-manual body acquired | All ten targets; indexed purchase listings are not inspected manuals |
| KTM 250 / 450 SX-F | Further 2025 450 owner-manual sections; official repair preview opening material | Full repair body; other exact target products still need checking |
| Husqvarna FC 250 / FC 450 | No full service-manual body acquired | All ten targets |
| GasGas MC 250F / MC 450F | No full service-manual body acquired | All ten targets |

No target has complete extraction. Next section passes must cover condition-specific maintenance matrices and severity notes; valve inspection prerequisites and adjustment boundaries; remaining fastener conditions and assembly sequences; fuel-pressure and electrical tests; fault codes and wiring; fork/shock identities, stock settings and service prerequisites; clutch and transmission inspection limits. A contents pointer is not a verified procedure. Individual specifications cannot be offered as complete repair instructions. Manuals also do not establish aftermarket fitment, revised ECU firmware, later bulletins or a rider's installed configuration; those require their own evidence.

## Concrete purchase inventory

Honda authorized Helm pages identify 61K9550 (2022–2025 CRF250R family), 61K9561 (2025–2027 CRF250R family), 61MKE92 (2021–2024 CRF450R family), and 61MKE80 (2025–2026 CRF450R family), each listed at $50 excluding shipping/tax. Four manuals total $200 before those additions. The overlapping 2025 CRF250R applicability needs publisher confirmation before ordering. Two listings are print-on-demand. Pages and exact URLs are retained in japan-service-pass.json. No purchase placed.

Kawasaki indexed discovery includes several older KX250 listings, 2025/26 KX250 99830-0180-04, and 2025 KX450 99830-0153-05. These remain catalog leads; indexed stock/price information is not a checkout quote. KX450 2022/2023/2024/2026 SKU mappings remain unresolved.

Official KTM shop preview confirms 2025 standard 450 SX-F repair manual 3206600en, revision 6 June 2025, US model F8475Y5. Digital listing is €27.45 in Austria VAT context, not a US final quote. Only opening preview pages were inspected; no repair procedures or full repair bytes were acquired. The other European target products still require exact catalog verification. See europe-service-pass.md.

## Validation and limits

Original hashes matched for all twelve promoted sources. All 100 evidence envelopes passed the current TypeScript gate; the existing SQL approval constraint accepted the batch. Ten focused evidence/coverage tests passed. Rebuilt 60-target coverage ledger. No application runtime changes, new deployment or native binary were made in this data pass. Live app-to-AI retrieval and paid-launch readiness remain unqualified.

Source PDFs and full extracted text are temporary inspection material outside the repository and source checkpoint. Only bounded factual extracts, source references, review decisions and section indexes are included. Full manual distribution is not authorized. This report supersedes earlier counts in BUILD_REPORT.md without rewriting their historical checkpoints.
