# Invite rewards (decided by Kyle, Nov 14 2026; build later)

- Each rider gets a short invite code (e.g. KYLE-7Q2). The invite link opens a bakmx.com page with the code and both store buttons; the friend enters the code at sign-up (auto-filled when the link is tapped after install).
- Friend joins with a confirmed email and adds a bike: inviter gets **10 Ask BAK questions** (credit ledger, one grant per friend, never expires).
- Every **3 invited friends who become paying subscribers** (counted after 2 weeks paid, so refunds don't count): inviter earns **1 free month of their current plan** (Pro riders get Pro, everyone else Premium). Stackable, no cap.
- How the month is given:
  - Free riders: BAK unlocks the plan for 30 days server-side (bonus days added in plans.ts tier resolution).
  - Riders already paying through Apple/Google: **store offer code** (option 1). Kyle creates code batches in App Store Connect (Offer Codes) and Play Console (promo codes); BAK hands out one unused code per earned month and records it.
- Cheat guards: new account only, confirmed email, one reward per friend, no self-invites, paid status checked from RevenueCat MX.

## Built 2026-11-21

- Database (MX project, migration `20261121100000_invites.sql`): `invite_codes`, `invites`, `invite_months`, `invite_offer_codes`. Server-only.
- Server `server/invites.ts`: `GET /api/invite` (code, link, counts, months), `POST /api/invite/redeem`. Join reward fires when the friend adds a bike and again from the hourly sweep (covers a late email confirmation). The hourly sweep (runs after the notifications cron) tracks paying friends, counts them after 14 days, and creates free months.
- Free inviter: Premium opens on the account for 30 days (`resolveTier` reads `invite_months`). Paying inviter: a row with `how='offer_code'`; the code is filled from `invite_offer_codes` when one for their store and plan is free. Empty pool = "on its way" in the app.
- App: Account > Invite a friend; friend's code field on the first setup screen. Web: Account > Invite a friend; public page `bakmx.com/invite/CODE`.
- Kyle's part before paying riders can be rewarded: create offer codes in App Store Connect (and Play later) and hand them over to be loaded into `invite_offer_codes`. A paying rider on the web (card) plan has no store, so their month stays "owed" for Kyle to credit by hand.
