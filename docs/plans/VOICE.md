# Talk to BAK (voice): research notes, not yet a design (2026-11-22)

Kyle wants BAK to talk with the rider, using OpenAI's GPT-Live-1.1. Planned as the next feature after 1.0.12.

## Confirmed from the provider's model page (read 2026-11-22)
- Billed by time, not by words: $0.05 per minute while talking or listening actively, $0.02 per minute on standby.
  Standby applies to WebRTC sessions while inference is paused. "Backend model and tool usage is billed separately."
- Audio and text in, audio and text out. No images or video.
- Function calling supported: the voice model can hand a question to our own server, which is how it would use
  BAK's bike data and rules instead of answering from general knowledge.
- Endpoints named on the page: Live (`v1/live/sessions`) and Realtime (`v1/realtime`).
- Concurrent-session limits exist per organisation; the numbers are on the account's limits page.

## Not confirmed yet
- Session length limit, number and names of voices, context size (the model page does not say; an article headline
  says 38 voices, unverified).
- The exact connection steps for a phone app (the WebRTC guide page did not load). Expected shape: our server
  creates a short-lived client secret, the app connects with it, the real key never reaches the phone.
- Whether the Expo/React Native WebRTC library works with it in our build, and on Android.

## Questions to settle in the design
1. Cost per rider: 10 minutes of talking is about $0.50 plus the normal answer cost. Needs a monthly minute
   allowance per plan, and a hard stop.
2. Which plan gets it (Kyle's earlier pattern: costly AI features are Pro, with a cap).
3. Hands-free Workshop mode with the phone in the toolbox is the standby case: about $1.20 an hour idle.
4. The provider is never named to riders.
5. Every spoken answer must go through the same bike data, safety rules and "not on file" honesty as typed answers.

## Kyle's decision (2026-11-22): voice is Pro only

## More confirmed (2026-11-22)
- Phone connection, from the provider's WebRTC guide: our server asks for a short-lived client secret
  (`POST /v1/realtime/client_secrets`, with our real key, server side only); the app opens a WebRTC call with that
  secret, sends the microphone, plays the returned audio, and exchanges events on a data channel. The real key never
  reaches the phone. The guide's example uses the older realtime model; GPT-Live-1.1 is listed under
  `v1/live/sessions`, so the exact session-creation call for it still has to be read from its own guide.
- Standby (second-hand, from a pricing write-up, to be checked against the provider's guide): WebRTC only; set a
  speech wake policy and an idle timeout of 5 to 60 seconds at session creation; muting the microphone does not
  trigger standby; time spent waiting on our server's answer is billed as active.
- In the app this needs a native WebRTC module (react-native-webrtc with its Expo config plugin) and microphone
  permission text. That means a new store build; it cannot be switched on from the server.

## Proposed design (for Kyle's approval, nothing built)
1. Where: a "Talk to BAK" button in Ask BAK, and "hands-free" inside a Workshop guided job. Pro only; others see it
   with a quiet "Pro" tag, never a hard wall mid-task.
2. Brain: the voice model only listens and speaks. Every bike question is handed to BAK's existing answer engine on
   our server, so spoken answers use the same bike data, safety rules and "not on file" honesty as typed ones.
   Spoken answers are shorter than typed ones; the full answer is saved to the chat to read later.
3. Cost control: a monthly minute allowance on Pro, shown to the rider, with a hard stop; standby after 30 seconds
   of silence; the session ends by itself after 10 minutes with nothing said; a per-day ceiling per rider as a
   backstop. Extra minutes could be sold later, the way photo edits are.
4. Privacy: audio is not stored by BAK; the transcript is saved in the chat like any other. Stated in the Privacy
   Policy. Provider not named to riders.
5. Proof first: a hidden test screen in a TestFlight-only build, on Kyle's phone, before any rider sees it.

## Still needs Kyle
- Minutes per month included on Pro (rough cost: 60 min of active talk is about $3 plus answer costs).
- Version: ships in the build after 1.0.12.

## Kyle approved the plan (2026-11-22)
60 minutes a month included on Pro to start; 1.0.12 goes to Apple first; then the hidden proof on Kyle's phone.

## Live API connection, from the provider's Live WebRTC guide (read 2026-11-22)
- The app makes a WebRTC offer and posts it to OUR server. Our server calls `POST /v1/live/sessions` with our key and a
  body of `session` (model `gpt-live-1.1`, `instructions`, `delegation`) and `transport` (`type: "webrtc"`, `sdp`).
  It answers 201 with `session.id` and `transport.sdp`, which we pass back to the app. No client secret is involved
  for Live; the key and the session settings stay on our server.
- Data channel label `oai-events`, created before the offer. Wait for `session.started`. To end: send
  `{"type":"session.close"}`, wait for `session.closed` (it carries final `usage`), then close.
- Delegation and tool event names are in a separate guide, not read yet. `voice`, `wake_policy` and
  `idle_timeout_s` were not on this page; still to confirm against the Create session reference.

## First test on Kyle's phone (2026-11-23, build 1.0.13 (195)): it works
Connects, hears him, speaks answers from the Ask BAK engine. Findings and what changed for the next build:
- Default voice (`marin`) is a woman's voice; Kyle wants a voice that fits BAK. The session reference lists 23 built-in
  voices (no descriptions). Default is now `cedar`; the test screen has a picker so Kyle can audition all 23. The voice
  cannot change mid-session.
- Leaving the app mid-answer lost the reply (also in typed chat). The server keeps working after the phone stops
  listening, so the app now asks again under the same request id and gets the finished answer; no resend, no error.
- A "why that one?" follow-up was answered from the voice model's own head ("the way you ride"). Instructions now say
  follow-ups and pushback are handed off too.
- Voice now shows the same confirm cards as typed chat for Garage and settings changes; BAK says a change is waiting
  and the rider taps Save. Saying "yes" out loud to confirm is not built.
- Background audio mode added so a conversation survives the screen locking. Needs a line in the App Review notes.
- Standby pricing fields are not in the session reference; every minute is billed at the active rate for now.

## Second test (2026-11-23, build 196)
- Kyle picked the voice: `echo`. It is now the default for everyone; the picker stays on the test screen only.
- Voice settings that exist in the provider's session reference: the voice name (fixed for the session) and the
  written instructions. No speed, pitch or style setting is documented. Character and tone are set in the
  instructions; they now ask for pit-lane rider talk while staying the experienced race mechanic.
- Settings changes by voice work. Kyle says the conversation is "kind of glitchy"; specifics not yet collected.
- Typed chat kept the question in the box while the answer was written; it now clears on send and returns only if
  the send fails.
