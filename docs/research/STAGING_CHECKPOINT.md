# Honda evidence staging — 13 September 2026

Thirty real records were inserted into `public.claims` in BAK MX project `yzvrujffiktfserrgkcb`, all with status STAGED. No schema, policy or EMOTO data was changed. The six 2025 records and twenty-four 2022/2024 records are existing research candidates normalized to the actual evidence schema; do not count them as new discoveries.

The retained `honda-2025-staging.json` and `honda-2022-2024-staging.json` contain actual UUIDs, exact model/year/region, short factual extracts, conditions, source URL and locator, original document SHA-256, and pending review records. Root inspected rendered source tables, including oil fill conditions and battery differences. The acquisition and root checks are recorded honestly; they do not confer specialist approval. `has_conflict=false` means none recorded for these claims; `conflicts_checked=false` preserves the outstanding review.

Validation used `candidateSchema`, original downloaded PDF bytes and `promotionBlockers`. All thirty passed schema/hash checks and all remained blocked from promotion by pending conflict/content approval and usage-rights review. Database insertion used the authorized SQL connection because application service credentials remain unavailable. Readback confirmed the STAGED count; an authenticated-role transaction confirmed staged rows are invisible. No full publications or page images are distributed in this repository.

## Reproduce the review

1. Retrieve the original HTTPS document identified by each source record into a private review directory; preserve retrieval time and compute SHA-256. Stop if bytes differ from the recorded hash.
2. Inspect the referenced page and model/market applicability, installed component, service conditions and current publication revision. Complete independent technical/conflict and usage-rights review.
3. To use the existing ingestion CLI for a new batch, wrap each candidate with `document_file` relative to that private review directory. Run the documented dry run first. These UUIDs already exist remotely; do not reinsert or silently overwrite them.
4. Promotion remains a separate authorized action. Do not mark JSON approved merely to make the database accept VERIFIED. A source citation is evidence for a bounded fact, not a complete repair procedure.

Full manufacturer documents are not included in the downloadable source checkpoint. Their hashes and public source locations allow later verification; the local inspection copies are temporary, not a durable licensed corpus.
