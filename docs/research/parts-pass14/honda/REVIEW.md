# Honda catalog checkpoint

Capture stopped at the user-requested wrap-up. All 28 exact year/model selectors and all assembly indexes were observed through ordinary Edge navigation. No catalog name or assembly URL was guessed. Source captures contain only main-element catalog DOM, excluding account/header details.

{
  "indexed_targets": 28,
  "complete_targets": 4,
  "partially_captured_targets": 1,
  "index_only_targets": 23,
  "indexed_assemblies": 1421,
  "captured_assemblies": 208,
  "occurrences": 4075,
  "explicit_catalog_quantities": 4019,
  "remaining_assemblies": 1213,
  "parse_errors": 0
}

CAPTURE_STATE.json is authoritative; resume-queue.json contains every missing observed assembly. Inventory files distinguish ALL_INDEXED_PAGES_CAPTURED from PARTIAL, including index-only targets. Full indexed capture is not full mechanical coverage or verified whole-bike BOM.

Parser retained unavailable rows, explicit supersession direction, diagram URLs, evidence hashes, and retailer-attributed recommended quantities. Missing quantities remain unknown; purchase input defaults are separate. No deduplication of repeated catalog occurrences. All parsed saved pages passed exact target/assembly identity and diagram checks. No database/runtime/guide writes.
