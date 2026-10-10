# Mobile verification — 12 September 2026

## Continuity hardening checkpoint

- PASS: 3 focused request-generation/identity-scope tests (`npm test`). These test pure guards, not native device interaction.
- Chat, service history and specifications remount when bike identity/configuration revision changes; account changes already remount the workshop. Drafts and request IDs do not follow the selection.
- Chat refreshes are ordered; selection changes and sends invalidate in-flight refreshes. Conversation, mode and draft edits are locked while sending. Late completion cannot overwrite another bike's screen.
- Garage mutations are serialized and its form is locked while saving/deleting. Reload responses are ordered and ignored after account unmount.
- Structured observations, systems, confidence and cited specification statements are now visible in native answers.
- Device-level rapid selection/background/resume/account-switch scenarios remain NOT VERIFIED until a connected native build is available.

- PASS: `npm run typecheck` after final source changes.
- PASS: Expo SDK 57 native compatibility check (`EXPO_OFFLINE=1 npx expo install --check`), using installed SDK's bundled version metadata; live Expo metadata endpoint timed out.
- PASS: `EXPO_OFFLINE=1 npm run export`: iOS 950 modules, Android 946 modules, each ~4.3 MB Hermes bundle.
- FIXED during verification: Metro needed explicit shared-source watch folder and local dependency resolution; Supabase SDK 2.92.0 imported Node `node:module` in ESM. Mobile now pins 2.116.0 and bundles on both platforms.
- CONTRACT CHECK: inspected current root server handlers and matched raw-array list responses, raw bike/conversation mutation responses, raw entitlement response, `/api/chat` response envelope, and aliases.
- NOT VERIFIED: native compiled binaries, simulator/physical-device rendering or interaction, EAS signing, store registration/review, live Supabase auth/deep links/RLS, live AI, RevenueCat store offerings/purchases/restore, account export/deletion on device, privacy/support URLs.

No credentials, native builds, store submissions, or charges were created by this lane. `com.baktech.bakmx` remains provisional. The app is implementation-complete for its current screens, not qualified for a paid release.

## BAK family identity correction — 13 September 2026

- Reused the original EMOTO metallic BAK mark without changing its bitmap; native layout clips the E-MOTO suffix and places MX beside the BAK mark.
- Matched BAK near-black surfaces, silver primary controls, cool blue accent, rounded chat launcher and BAK STRONG brand line.
- Reworked native Home and sign-in with trackside positioning, Garage-linked chat action and descriptive routes to diagnostics, setup, service history and exact-bike evidence.
- PASS: native TypeScript, all 3 continuity guard tests and both Hermes JavaScript exports. iOS 932 modules; Android 948 modules; ~4.3 MB each. Brand asset included in both exports.
- Reviewed React hook/async/accessibility patterns; this pass changes presentation only and retains the existing request guards, native store billing and auth flows.
- NOT VERIFIED: physical-device visual inspection and signed binaries. This is a brand correction, not a completed paid-release gate.
