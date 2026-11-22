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
