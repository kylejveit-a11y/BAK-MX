# Evidence ingestion

This implementation validates local candidate evidence and imports **STAGED** claims only. It never downloads arbitrary URLs, scrapes manuals, or promotes a claim. The accompanying `oem-sources.json` contains discovery leads, including explicitly failed candidate endpoints. It is not importable evidence and does not establish model-year support.

## Input and dry run

Use a JSON array whose entries contain `candidate` and a relative `document_file`. The candidate schema in `shared/evidence.ts` is authoritative. Each candidate requires:

- A UUID and exact manufacturer, model, one model year, variant and region.
- Domain, statement, HTTPS source URL, page/section locator, document revision, retrieval timestamp, SHA-256 and reviewed content.
- Explicit rights basis and reference, with commercial-use review status.
- A review record containing reviewer identity, review date, content/scope/conflict checks, decision, approval reference, reviewed document hash and exact approved applicability.
- A conflict flag consistent with conflict references; optional full engineering relation.

A year range is represented by separately reviewed exact-year records. Standard and special editions are not interchangeable. The engineering relation type supports system → component → physical state → failure mechanism → observable symptom → measurement → verification test → corrective action.

```sh
node --experimental-strip-types scripts/ingest-evidence.ts ./candidate-batch.json
```

The default is dry-run, requires no database credentials and performs no network calls. Document paths must resolve inside the candidate file's directory, including symlink resolution. The source bytes must match the recorded SHA-256. Input is limited to 500 candidates, 5 MB JSON and 100 MB per source document. The output lists promotion blockers and STAGED status without printing source content or keys.

## Explicit staging import

For an authorized BAK MX project with the evidence_record schema migration installed, configure server-side `SUPABASE_URL`, `BAK_MX_SUPABASE_PROJECT_REF` and `SUPABASE_SERVICE_ROLE_KEY`, then add `--apply` to the same command. The target must exactly match the specified hosted project; EMOTO is explicitly rejected. Redirects are disabled on database requests. Never expose the service key through frontend environment variables.

Insertion uses one batch and never overwrites existing IDs. Database errors fail the command. Candidate metadata is retained in `claims.evidence_record` alongside the indexed applicability columns. Even approved content is imported as STAGED. Conflicted candidates can be retained as STAGED for investigation but are never runtime eligible.

## Promotion is separate

Reviewed individual US factual extracts can now use `rights.basis=factual_extraction` with mandatory `usage_scope=facts_only_no_source_distribution`. This distinguishes facts from permission to copy the source publication; it is not a public-domain designation or a blanket legal approval. Source/content/scope/hash/conflict and named reviewer gates still apply. See research/HONDA_APPROVAL.md for the first actual 30-record promotion and its verification. Older statements below that no live import or specifications exist describe the initial implementation checkpoint.

`promotionBlockers` checks readiness only. It does not confer authority, authenticate a reviewer, or change status. An authorized reviewer must verify actual source content, document identity, applicability, commercial-use basis and conflicts before a separate governed promotion. Self-asserted JSON approval does not prove that review occurred. The database gate should independently enforce required evidence fields and exact row scope before allowing VERIFIED.

Landing pages, unresolved rights, unresolved conflicts, incomplete review, changed hashes and mismatched scope block readiness. Claims must not be served merely because this script validated JSON. Existing runtime retrieval must retain VERIFIED/no-conflict gating.

## Verification and remaining gaps

`tests/evidence.test.ts` covers invalid scope, cross-year/hash mismatch, direct status escalation, unresolved governance, dangerous destination configuration, default dry-run and tampered source bytes. Live import was not executed. No technical specifications were added. OEM document acquisition, rights resolution, substantive review and production promotion remain work to complete before selling evidence-backed bike coverage.
