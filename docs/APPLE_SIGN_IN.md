# Sign in with Apple

Face ID sign-in on the phone, no password. The phone asks Apple for an identity token and hands it to Supabase
(`signInWithIdToken`), which signs the rider in or creates the account. Email/password still works as before.

## What is in the repo

- `apps/mobile/src/AppleSignIn.tsx` — the Apple button (sign-in and sign-up screens, iPhone only) and the flow.
- `apps/mobile/app.config.ts` — `ios.usesAppleSignIn: true` and the `expo-apple-authentication` plugin. EAS adds the
  capability to the App ID and provisioning profile on the next production build; nothing to click in the Apple
  developer site for that.
- `server/apple-sign-in.ts` + `POST /api/auth/apple/exchange` — keeps Apple's refresh token so that deleting a BAK
  account also revokes the Apple sign-in (App Review Guideline 5.1.1(v)). `DELETE /api/account` calls the revoke.
- `supabase/migrations/20261111230000_apple_sign_in_tokens.sql` — the token table (service role only). Applied to MX.
- Ask BAK can explain the sign-in screen (shared/app-guide.ts).

## One-time setup (Kyle)

1. **Supabase dashboard** (MX project `yzvrujffiktfserrgkcb`): Authentication → Sign In / Providers → Apple →
   turn **Enable Sign in with Apple** on → in **Client IDs** enter `com.bakmx.app` → Save.
   The *Secret Key* field can stay empty: it is only for the website flow, which is not turned on.
   Without this step the Apple button shows an error after Face ID.

2. **Apple revocation key** (needed before App Review; the sign-in itself works without it):
   Apple Developer → Certificates, Identifiers & Profiles → **Keys** → + → name `BAK MX Sign in with Apple`
   → tick **Sign in with Apple** → Configure → primary App ID `com.bakmx.app` → Save → Continue → Register →
   **Download** the `.p8` file (Apple gives it once) and note the **Key ID** on that page.

3. **Vercel** (project `bakmx`, Production + Preview): add
   - `APPLE_SIGN_IN_KEY_ID` = the Key ID from step 2
   - `APPLE_SIGN_IN_PRIVATE_KEY` = the whole contents of the `.p8` file (open it in a text editor, copy everything
     including the BEGIN/END lines; Vercel keeps the line breaks)
   - optional: `APPLE_SIGN_IN_TEAM_ID` (defaults to PT6ZAQV9GY), `APPLE_SIGN_IN_CLIENT_ID` (defaults to com.bakmx.app)
   Then redeploy. Never paste the key into chat or the repo.

## Account matching

Supabase joins an Apple sign-in to an existing email/password account when the Apple ID's email is the same
verified email. A rider who picks **Hide My Email** gets a relay address and therefore a new, empty BAK account;
the button says so. The rider's name from Apple arrives once, on the first sign-in, and is kept on the phone to
start the rider profile's display name.

## Checks

- `npm run check` includes `tests/apple-sign-in.test.ts` (client-secret JWT shape and signature).
- Manual: fresh install → Create your account → Sign in with Apple → Face ID → Garage opens; Account → Delete account
  removes the row in `apple_sign_in_tokens` (cascade) after the revoke call.
