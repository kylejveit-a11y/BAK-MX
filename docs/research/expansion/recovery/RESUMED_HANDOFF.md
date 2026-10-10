# BAK MX resumed recovery — 13 September 2026

Continue this standalone repository, based on checkpoint 099a264a3b6cc0bf86afc992324f95dcbd1a628f. Only MX Supabase yzvrujffiktfserrgkcb was accessed for import. EMOTO was not changed. Paid KTM manual purchase remains ON HOLD.

## Completed database recovery

All 87 frozen wave-one delta batches replayed sequentially. Exact-ID promotion covered 8,649 records. Authenticated-role readback verified all 9,574 wave-one IDs, zero missing. Total became 11,002 VERIFIED.

Wave two contains 3,106 additional reviewed claims and no overlap with wave one. All ten required OEM PDFs were reacquired with matching original hashes; 160 catalog source bindings matched. All 32 staging batches succeeded with full-column evidence comparison, followed by exact-ID promotion. Authenticated-role readback verified all 3,106 IDs, zero missing. Final database status: 14,108 VERIFIED, zero STAGED. Published expansion ledger: 12,680 records. Never globally promote STAGED rows.

Frozen wave-one and wave-two bundles remain separate, with exact hashes in bundle-manifest.json. Cumulative inventory rejects changed hashes, wrong project identity, conflicting duplicate claims and conflicting occurrence mappings. The original prepare-expansion-promotion.ts is historical wave-one tooling; use explicit recovery-publication.ts bundle/output arguments for a future reviewed wave, then run SQL against the MX project only.

## Catalog and research progress

The four pending finalized catalogs are integrated. Missing-only GasGas acquisition completed MC450F2024 (42 groups / 1,166 occurrences) and MC450F2026 (42 / 1,164), adding 401 occurrences. 2024 US applicability remains pending; 2026 exact F0301Z5 scope binding is documented separately. No new torque values were inferred.

Cumulative inventory: 23,357 occurrences, 943 groups, 14 complete catalogs including KTM (13 non-KTM). Counts include pending-scope captures and alternatives; they do not mean installed-part totals or complete engineering specifications. The KTM benchmark remains only 2025 450 SX-F US, and it is still incomplete.

New source acquired: exact US 2026 YZ450F service manual D03-2819U-10 / LIT-11626-39-20, 406 pages; cover/copyright checked on PDF pages 1 and 3. SHA256 b5cbf756d688c8516251e456d4255da4ab607c8e1206e1408f254a79f74a6fbd. See yamaha/2026-yz450f-discovery-20260913.json for both owner/service sources, hashes and temporary paths. Zero new facts approved. Torque table leads: PDF56–63.

Next research priorities: review the newly acquired 2026 YZ450F US service manual, remaining Yamaha non-torque extraction, Kawasaki lawful manual/catalog acquisition, Honda/Yamaha catalog completion, exact joint mapping, internal engine/suspension tolerances and service procedures. Preserve all existing conflicts and source applicability.

## Standalone mobile product

Existing native code retains metallic BAK branding, dark/silver/cool-blue palette, and Chat/Garage navigation. MX package identity is com.baktech.bakmx on both platforms; scheme bakmx. This pass preserves that design baseline rather than restarting it. Reference-source parity is documented in docs/BAK_IDENTITY.md; current device visual parity has not been verified.

Release gaps: no configured EAS project in this environment, no app icon configured, no verified remote iOS build number above 103, no signed native build or store lifecycle testing. Encryption declaration is present; production EAS profile uses auto-increment and remote versions. Runtime auth/AI/payment configuration and actual authenticated answer quality remain unqualified. Mobile dependency audit reports 17 moderate findings; do not apply its suggested Expo downgrade blindly.

## Checks and manual QA

Passed: npm run check (typecheck, 67 tests, web production build); npm run check:mobile (typecheck, 3 continuity tests); Expo public configuration from apps/mobile. Web build retains index-BZaZg5in.js. Native iOS and Android exports both passed; outcomes are recorded in execution-audit.json.

Pending manual QA: Garage create/select/edit and active-bike continuity; authenticated AI retrieval over expanded corpus and conflict handling; sign-in/sign-out/recovery; physical iOS/Android navigation and logo rendering; app restart persistence; photo flows where implemented. Community, Events, Profile, Messages and Feedback need explicit MX scope/implementation review and must not be represented as working from the EMOTO instructions alone. Purchase/restore, account deletion and offline/retry behavior require real device/backend tests.

No new UI deployment, live AI grading or launch-readiness claim was made. Database visibility tests are not end-to-end rider tests.
