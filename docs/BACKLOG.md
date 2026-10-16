# BAK MX backlog

Items Kyle asked to keep on the list. Not started unless marked.

## Ask BAK can update the Garage (requested 2026-10-15; built 2026-10-16 for web: BAK proposes, rider taps Save. iPhone app added the same day)
- The rider tells the chat what is on the bike instead of filling the build sheet: "add an FMF 4.1 slip-on to my 25 KTM 450",
  "my clickers are 12 comp, 14 rebound on the fork".
- BAK confirms and writes it to the selected bike (build sheet parts, clicker settings) after the rider taps to accept.
- If the Garage has no value, or a different one from what the rider just said, BAK notices and asks
  "Your Garage says X. Want me to update it to Y?" before answering on the new value.
- Guardrails: never write without the rider's tap; only the selected bike; show what changed.

## Aftermarket data
- Still missing after the 2026-10-15 passes: see docs/research/aftermarket/README.md (Specialty pass sections).

## Test access to Ask BAK (built 2026-10-15)
- POST /api/eval/ask with `Authorization: Bearer <token>`; body {bike, message, history?, setup_history?}. Runs the real
  answer pipeline on the test bike in the request; never reads or writes rider accounts, chats or AI allowance.
- Tokens: SHA-256 hashes in eval_access_tokens (30-day expiry, 200 runs/day). Every run is logged in eval_runs.
- Shut it off: `update eval_access_tokens set revoked_at=now()` (one token or all). Runs bill the OpenAI account.

## Plans and credits (built 2026-10-16; goes live when AI_ACCESS_MODE=subscription)
- Free: one-time 7 sets of 20 questions (first set ready on day one, rider starts each next set). Premium 100/day. Pro unlimited (fair use 300/day). Credit packs never expire, used after included questions.
- Proposed prices (awaiting Kyle): Premium $7.99/mo or $59.99/yr; Pro $14.99/mo or $119.99/yr; credits 25 for $2.99, 100 for $9.99.
- Owner setup before launch: App Store Connect subscriptions (Premium, Pro; monthly and yearly) and consumables (credit packs); RevenueCat entitlements `bakmx_premium`, `bakmx_pro` and an offering with all packages; Stripe prices; env vars per .env.example.
- Known gap: deleting an account and signing up again gets a new free trial (one trial per account, not per person).
