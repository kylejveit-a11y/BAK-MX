# Latest field reconciliation

Full published labels now cover all 1,167 occurrences, with 71 torque assignments, 691 dimensional assignments and 376 specific torque N/A reviews. There are 1,298 KTM evidence claims in the database, including non-applicability conclusions. Every-field coverage remains incomplete. See KTM_FIELD_REVIEW.md, TORQUE_GAPS.md and the current BUILD_REPORT.md for counts, corrections, procedural gaps and paid manual access needs. Earlier checkpoint notes below are historical.

---

# 2025 KTM 450 SX-F — catalog inventory reconciliation

Date: 13 September 2026. Exact official scope: standard US F8475Y5, KTM model identifier 1003417574. Source: KTM SparePartsFinder, 23 chassis groups and 19 engine groups.

## Completed inventory work

All 42 official catalog groups were opened and their complete rendered parts tables captured. There are 1,168 source rows, representing 1,167 distinct assembly/callout/part-number entries. All diagram hotspot part numbers are accounted for in their corresponding tables. The repeated WP entry at callout 8, S64080000100000, has identical description, dimensions and quantity; it is retained in duplicate_source_rows and counted once in the normalized inventory.

The total includes 787 entries outside the shared WP assortment and 380 distinct WP assortment entries (381 source rows). This is a catalog inventory, not 1,167 individual pieces installed on a motorcycle. Nested assemblies, service kits, selectable springs and shims remain separate. Of the distinct rows, 457 have OEM catalog quantity zero; these retain catalog_quantity=0 but quantity=null, avoiding a false installed count. Positive quantities remain the manufacturer's assembly-table quantities, not summed whole-bike totals.

The non-orderable fork entry retains KTM's SPNO designation and its actual catalog reference A460C159Y406000. It is not represented as an orderable part number. Abbreviated labels identify rows; they are not complete dimensional specifications. Exact source links, callouts, reference numbers and quantities remain attached.

## Evidence and validation

The official selector and first group breadcrumb explicitly identified US F8475Y5. Every acquired group URL binds modelidentifier=1003417574 and the appropriate engine/chassis category. Acquisition was split across three lanes on this same motorcycle. All 42 expected links were reconciled against captured groups, source table counts and diagram-linked references. An initially empty starter grid was recognized as not loaded, then captured successfully; it was not accepted as an empty assembly.

The merge rejects missing groups, wrong source links, incomplete tables, missing diagram references, invalid quantities and conflicting duplicate records. The existing duplicate-occurrence gate caught the repeated shim row; the source duplicate was documented explicitly rather than weakening the gate. TypeScript checking and four focused inventory tests passed during this checkpoint. Existing full suite last passed 54 tests; no new deployment or database mutation occurred.

Rebuild: run `node --experimental-strip-types scripts/merge-ktm-official.ts`, then `npm run research:parts`. The merge uses the three official acquisition files and the observed official-link manifest. Retailer captures are retained as separate comparison evidence; they cannot silently replace official entries or establish supersession applicability.

## Still incomplete

Full engineering specification coverage is not complete. Torque, lubrication/thread-locking conditions, angle/sequence requirements, replacement rules, wear limits and applicability reviews still need exact part-to-manual mapping. Update: 128 KTM torque facts (59 engine, 69 chassis) are now VERIFIED in the MX database, with 28 initial exact occurrence mappings. Remaining normalized slots stay UNKNOWN. See KTM_TORQUE_REVIEW.md and the engine ambiguity list. Existing 130 Honda/Yamaha claims remain unchanged.

Automatic approval review rejected opening Yamaha because the user's sequential completion requirement was interpreted to include unfinished KTM specifications. No retry or alternate-agent workaround followed. KTM remains the active bike. Other existing bike inventories were not expanded during this pass. The successful Yamaha source search before that rejection did not change its inventory.

The next work is the KTM service-specification reconciliation. Do not reopen or recollect the completed 42-group inventory. Do not advance the sequential queue while the active completion gate remains unmet.
