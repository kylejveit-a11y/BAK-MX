# Honda factual approval — 13 September 2026

User explicitly delegated technical evidence approval to the assistant. Thirty existing records were approved and promoted in BAK MX `yzvrujffiktfserrgkcb`: 12 for US standard CRF250R 2022, 12 for 2024 and six for 2025. Zero records were rejected in this reviewed subset. The remaining 55 collected OEM/OEM-authored candidates are not included in this approval.

## Review performed

Root previously inspected the original rendered specification and maintenance tables. A separate review agent independently inspected all six page renders, recomputed all three PDF SHA-256 hashes, checked covers/model years and US context, and compared the existing scoped Honda corpus. No same-model/year/variant/region contradiction was found. This is assistant technical review, not external mechanic certification. It does not establish absence of every unpublished or undiscovered bulletin.

Approved IDs are ad731925-0250-4500-8000-000000000001 through 000006, and ad731925-2224-4500-8000-000000000001 through 000024. Exact values and applicability remain unchanged. Conditions such as cold valves, drain-only versus filter replacement, and drain versus disassembly remain attached to the statement. The API oil classification and battery identity differences between 2022 and 2024 were confirmed, not merged. No 2023, 2026, RX, RWE, other-region or modified-component inheritance was approved.

## Corrected usage rule

The initial schema omitted an appropriate basis for individual factual specifications. It required a source reproduction license even for factual extracts. The US Copyright Office distinguishes facts from protected expression: https://www.copyright.gov/help/faq/faq-protect.html and https://www.copyright.gov/circs/circ33.pdf .

The new `factual_extraction` basis is limited to reviewed US document facts with `facts_only_no_source_distribution` scope. The reviewed use here is individual technical facts with brief original wording and citations. It neither declares the publication public domain nor grants permission to redistribute manuals, diagrams, source prose or protected compilations. Access/licensing restrictions, where present, still require their own review; this category is not automatic permission for arbitrary scraped material. Content, source hash, exact scope, named review and conflict checks remain mandatory in TypeScript and SQL. Existing permission/license categories are retained.

## Execution and verification

Migration 20260913080758_factual_evidence_usage was applied to MX only. Promotion ran atomically and required all 30 prior STAGED evidence records to match the reviewed originals; any mismatch would roll back the batch. Approved snapshot: honda-approved-facts.json. Original staging snapshots are retained as history. The evidence envelope keeps its ingestion status STAGED; database row status is VERIFIED, changed only by this explicit promotion.

Authenticated-role database readback returned 12 VERIFIED records for 2022, 12 for 2024 and six for 2025. All 50 root tests, typecheck and build passed. Tests preserve rejection of missing usage scope, mismatched year, unresolved review and conflicts. Security advisor showed the existing five informational service-only no-policy notices, no warnings/errors; see https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy .

Live app-to-AI retrieval remains unqualified because service configuration is incomplete. Database eligibility does not establish paid-launch readiness. No native binary or Vercel deployment was produced in this approval pass.
