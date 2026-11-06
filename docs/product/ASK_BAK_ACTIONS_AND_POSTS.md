# Ask BAK actions, post maker and photo edits (plan, 2026-11-06)

Kyle's direction: the rider can tell Ask BAK to do anything in the app except privacy, always with a confirm first; give
it a photo or video and it makes a high-quality post; share to Facebook / Instagram; later an action-sports photo editor.

## Phase 1: app actions (shipped to web 2026-11-06; phone in 1.0.1)
- `shared/app-actions.ts`: the action list, the checks (real bike ids, real upcoming event ids, supported models, field
  limits that match the server) and the runner. Each client gives the runner its own signed-in API call, so every
  server check (ownership, profanity screen, community rules) still applies.
- Actions: add bike, switch bike, engine hours, nickname, app colour, answer preferences, rider profile fields, RSVP
  (private unless the rider says public), create event, draft post (opens the composer; the rider taps Post), log a
  setup change, open a screen. Build sheet and setup values stay in Garage updates (also when the rider asks BAK to save
  its baseline).
- Never: privacy and sharing settings, blocks, reports, account, billing, sign-in, sending messages, deleting anything.
  BAK says the rider does that and offers to open the screen.
- Confirm card under the reply: every action in plain words, a switch per action, Apply / Not now, a result per action.

## Phase 2: post maker + Share button (next)
- Rider attaches a photo or short clip in Ask BAK and says "post this": BAK writes the caption in the rider's voice from
  the photo and their build, draft_post carries the attached photo ids, the composer opens with photo and caption.
- After posting (or from any post of their own): Share opens the phone's share sheet with the photo and the caption copied,
  so Instagram, Facebook, TikTok and Messages work with no Meta approval. Direct posting through Meta is a later option.

## Phase 3: action-sports photo edit (Pro)
- Rider gives a photo; an image model returns a magazine-style motorsports edit (grade, crop, motion, no changes to the
  rider or bike that misrepresent them). The original is kept.
- Cost covered by the rider (Kyle, 2026-11-06): about 5 to 20 cents per image to make, so 3 free edits to try it, then
  15 a month on Pro (Kyle said 10 to 20), and extra edits sold at 25 cents each.
- Needs: a usage counter per rider (like the AI question allowance), a credit purchase (RevenueCat consumable on iOS,
  Stripe on web), and the App Store review notes for generated images.
