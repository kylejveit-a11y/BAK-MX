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
