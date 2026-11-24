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

## Third test and Workshop (2026-11-23)
- Build 199: Kyle says tone and pause are right ("super fast") with the short spoken-answer path and Echo.
- Entry points: the send button in Ask BAK becomes Talk to BAK while the box is empty; the Home ask bar's blue button
  opens chat with the voice sheet up. Rule from Kyle: voice goes where there is a text box to ask BAK, not on plain
  "Ask BAK" buttons, and not in the Garage.
- Workshop: Talk to BAK opened during a guided job knows the job and the step. "Next", "repeat", "go back", "where am
  I" run the job's own step logic and BAK reads the step as written; questions go to the engine with the step attached.
  Workshop's free on-device listening pauses while the conversation is open and resumes when it closes. The free
  on-device hands-free mode stays for long jobs: a whole job on live voice would use the month's minutes in one sitting
  until a cheaper standby rate is confirmed.
- Testers are not held to the 60 minutes during the proof.
- 1.0.12 (194) was submitted to Apple on 2026-11-23.

## Spoken confirm, final wording, and a higher tier (2026-11-23)
- A waiting change can be confirmed out loud. Only a plain yes ("yes", "save it", "go ahead"…) or no counts, matched
  on the whole utterance; anything else is treated as a new question. Yes runs the same saves as the confirm cards.
  Actions that only open a screen or a draft still need a tap.
- "Test version" text, the voice picker and the Account test row are gone. Voice was limited to the tester list
  on the server until 2026-11-24 (see the end of this file).
- Kyle wants a roughly $100 a month tier with far more voice, sized so it earns at least the same dollars as Pro.
  Arithmetic (voice at $0.05 a minute; Pro is $14.99 with 60 minutes = $3 of voice):
    store keeps 15%: $99.99 nets $84.99, Pro nets $12.74. Extra to spend on voice = 84.99 - 12.74 + 3.00 = $75.25 = 1,505 minutes (about 25 hours).
    store keeps 30%: $99.99 nets $69.99, Pro nets $10.49. Extra = 69.99 - 10.49 + 3.00 = $62.50 = 1,250 minutes (about 21 hours).
  Not in that arithmetic: the answer engine's cost for each spoken question, which is billed separately and has not
  been measured. A cap near 1,000 minutes leaves $12 to $25 a month of room for it. Not built; needs the real
  per-answer cost and which store cut applies before a number is fixed.

## What an answer costs, measured (2026-11-23)
From the saved usage of the last 7 days of finished answers (30 answers, all Kyle's own testing, model gpt-6.1-sol):
average 67,439 input tokens of which 31,901 cached, 714 output tokens. At the provider's listed prices ($2.00 per
million input, $0.10 cached input, $10.00 output): 35,538 x 2.00 + 31,901 x 0.10 + 714 x 10.00 per million
= $0.071 + $0.003 + $0.007 = about $0.081 per answer. Not included: the separate planning call made before each
answer (its usage is not saved). Small sample, one rider.
- Consequence for plans: after a 15% store cut Pro ($14.99) nets $12.74, which pays for about 156 answers a month;
  Premium ($7.99) nets $6.79, about 83 answers. Input size is the cost: 88% of each answer's cost is uncached input.
- Voice: $0.05 a minute plus about one answer per minute of conversation (an assumption, not measured) is roughly
  $0.13 a minute all-in. The $100 tier's extra $75.25 (15% cut) or $62.50 (30% cut) then buys about 580 or 480 minutes,
  not the 1,250 to 1,505 the voice-only arithmetic gave.

## Open to every Pro rider (2026-11-24)
Kyle switched voice on for all Pro riders. The server no longer checks the tester list to decide who gets voice; the list now only means "has it without Pro and is not held to the 60 minutes". Free and Premium riders see the blue button and the voice screen tells them it is part of Pro.
