# BAK MX

Native iPhone and Android engineering workshop for gas-powered motocross motorcycles. The React web application is a fallback client. Both use the same independently deployed BAK MX backend and Supabase database.

**Development checkpoint — not qualified for paid launch.** See [build plan](docs/BUILD_PLAN.md), [mobile release gates](docs/MOBILE_RELEASE.md), [evaluation](docs/EVALUATION.md), and [evidence ingestion](docs/EVIDENCE_PIPELINE.md). A separate development web deployment is online; it has no live service credentials. No verified OEM spec corpus, signed native binary or store approval is claimed. See [current build report](docs/BUILD_REPORT.md).

## Local development

Requires Node 24. Run `npm ci`, then `npm run check`. Run `npm run dev:api` and `npm run dev` in separate terminals. Environment values are described in `.env.example`; load them into the shell for the API (or Node's `--env-file` option). Vite reads the local environment for its client.

Native client lives in `apps/mobile`; run `npm ci` and follow its README. Native store purchases need development/store builds and configured store products. A JavaScript export does not establish signed binary or device compatibility.

## Infrastructure

Create **separate** BAK MX GitHub, Supabase, Vercel, Expo and RevenueCat project identities. Never supply EMOTO production credentials. Apply SQL migrations only to the verified MX project. Configure API/web public and server variables. Register native auth redirects `bakmx://...` per app config plus the web URL. Configure email delivery and recovery.

Store purchases: configure Apple and Google products, RevenueCat entitlement `bakmx_pro`, project-scoped secret, webhook authorization `Bearer <REVENUECAT_WEBHOOK_SECRET>` (32+ random characters), and exact comma-separated `MOBILE_PRODUCT_IDS`. `APP_ENV=production` and `ALLOW_SANDBOX_PURCHASES=false` for production. Route webhook to `/api/mobile/webhook`. Native clients call `/api/mobile/sync-entitlement` after purchase/restore; server never trusts client access flags.

Web purchases: set server-owned Stripe recurring `STRIPE_PRICE_ID`, secret and webhook signing secret, configure portal and webhook `/api/billing/webhook`. Web checkout success does not grant access; server rechecks subscription state. Store membership also grants API access across clients.

AI: configure a supported structured-output OpenAI model and a dedicated key. No default model/pricing is invented. Run independent held-out evaluations against actual retained outputs before launch. Current numeric-spec validator checks the structured specifications field; semantic correctness and unsupported specifications in prose still need broader validation and live review.

## Verification and release

`npm run check` runs TypeScript, Node tests, PostgreSQL/PGlite migration/RLS checks, held-out evaluator contracts, and web production build. `npm run check:mobile` checks native types. CI adds both-platform JavaScript bundle exports. Live Supabase auth/RLS tests, live model grading, Stripe/Apple/Google purchase lifecycles, account deletion, backup restore, and physical-device checks remain separate required gates.

The migration enables RLS and service-only billing/AI writes. No admin role comes from user metadata. Provision administrators manually in `admin_memberships`; `/api/admin/requests` is read-only and audited. A response receipt indicates client acknowledgement, not screenshot-level proof of display.

Account deletion cancels web subscriptions and deletes the Stripe customer, then revokes sessions and deletes the Supabase user. Native store subscriptions are managed separately by the subscriber; the app must explain this before deletion. Associated records cascade. Production recovery and accounting retention policy still require final business approval.

## Architecture provenance

Inspected EMOTO source at `f0f657d194fdcd910b014201ec5f8004fd2984f4`: React/Vite stack, auth guard, evidence governance, diagnostic state transitions, audit envelope and logging. Reused architectural patterns; production databases, hardware claims and app identities are isolated. See reuse map for implementation boundaries.
