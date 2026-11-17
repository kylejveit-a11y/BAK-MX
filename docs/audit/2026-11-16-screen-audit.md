# BAK MX screen audit (1.0.11, 2026-11-16)

Every page, sheet and panel in the app, checked on the cloud iPhone (iOS sample build) and the cloud Android phone
(Android sample build), sample data. Each page is **Good** or lists what needs correcting. Fixes are marked ✅ when done.

Checks on every page: words accurate and plain; same names for the same thing everywhere; buttons in the app's finishes
(blue metal for the one main action, raised graphite for choices, accent edge for a picked choice); chips and pills one style;
spacing and type sizes consistent; every tap goes somewhere; Back / Done / Cancel present and in the same place;
nothing cut off on a small phone; Android matches iPhone.

## Code-wide findings (before the screen pass)
- Pick chips are built eight different ways (Practice day, Track report, Right now, Fuel plan, Home editor, Start sheet
  track picks, Community filters and post categories, Service log quick picks, Build sheet, Chat choices). Sizes, borders,
  selected colors and press feedback differ. → One shared chip everywhere.
- "Send check-in" on the Right now card is a flat orange box, not the blue main button.

## Pages
(filled in as the pass goes)

### Home (iPhone)
- H1 Needs correction: the bike switcher under the bike name repeats the name ("2025 KTM 450 SX-F ⌄") right under the title.
  Garage shows the same control as "… ⌄  2 bikes". → Home switcher reads "Switch bike · 2 bikes".
- H2 Needs correction: section labels are inconsistent: "UP NEXT" has the accent dash, "YOUR BIKE" and "MORE" don't.
  → Same label style (with dash) for every Home section.
- H3 Needs correction: setup checklist item "You" is unclear. → "Rider" (your weight and level).
- H4 Needs correction: the "New" card still announces 1.0.9's Widgets, Siri and Lock Screen. → 1.0.11 edition: Ride Day,
  Ride safety, Right now, What I ran here.
- Edit Home sheet: Good. Bike picker sheet: Good. Bottom of page clears the tab bar: Good.

### Tour (iPhone)
- T1 Needs correction: stop 1 says "Ask BAK from the bar at the top" — the bar is below the welcome cards. → "from the Ask BAK bar".
- T2 Needs correction: last stop doesn't mention practice days, Ride Day or Ride safety. → Add them.
- Stops 2–3, Back / Next / Skip tour: Good.

### Ask BAK consent (iPhone)
- C1 Needs correction: "A photo you choose to Action edit" → "A photo you ask BAK to edit".

### Chat (iPhone)
- Empty state, starters, chats list, bike chip: Good.
- C2 Needs correction (sample data, also used for marketing recordings): any question gets one canned thread whose question
  is replaced by "What does high-speed compression actually do?", and the answer mixes high-speed and low-speed compression
  and turns with clicks. → Sample chat keeps the rider's question and answers each starter on topic, with consistent units.
- C3 Needs correction: picked chips in the "Handling problem?" questions turn blue metal; everywhere else a picked chip has
  the bike-color edge. → One picked style app-wide: bike-color edge and tint. Blue metal is only for the main action.
- C4 Needs correction: on the optional questions the main button says "Skip" on one step and "Next" on the next, with
  nothing picked on either. → "Skip" while nothing is picked, "Next" once something is, on every step.
- C5 Needs correction: "Here's what BAK will get" repeats itself ("Front pushes. It pushes off the gas at corner entry.
  Where: corner entry."). → One clean sentence. Button "Use this" → "Ask BAK".
- C6 Needs correction: guided job picker has a large empty gap above the list, and its "Choose" button is flat orange.
  → List starts under the search; "Choose" in blue metal.
- C7 Needs correction: a guided step shows two near-identical buttons, "Record it — next step" and "Done — next step".
  → One button: "Record it and go on" (or "Next step" when nothing needs recording).
- C8 Needs correction: during a guided job the "Ask about your 450 SX-F … Add a photo if it helps" intro still shows above
  the step. → Hidden while a job is open.
- Handling-problem questions, progress bar, Back, Type it myself, Close job: Good.

### Garage (iPhone)
- G1 Needs correction: the Garage button "Settings" opens rider info, clickers, sag and gearing, while Ride Day's "My setup" tells riders to
  use "Garage › Edit details" (which is the bike's make/model/VIN page). → Button and page title "Setup" (Your setup:
  you, clickers, sag, gearing); Ride Day text points to "Garage › Setup".
- G2 Needs correction: the Setup and Edit bike details forms have no Back at the top, only Save / Cancel at the very bottom
  of a 4-screen form. → "‹ Garage" back link at the top of both.
- G3 Needs correction: "Also ride" offers the same discipline already chosen as "Main kind of riding". → Hide the main one.
- G4 Needs correction (accuracy): "Shock compression" is one box with a hidden hint (low-speed clicks / high-speed turns),
  while Ride Day and the setup log split low-speed and high-speed. → Label "Shock compression (low-speed / high-speed)"
  with the hint shown under it.
- Overview, active bike plate, readiness chips, sharing switch, bike picker: Good.
- G5 Needs correction: Build sheet, Photos and Coaching repeat the tab name as a label right under the tab ("BUILD SHEET",
  "PHOTOS", "COACHING"); Notes doesn't. → Drop the repeated labels.
- G6 Needs correction: the same "Show this bike on my profile" switch is labeled "SHARING" on Overview and "PROFILE" on
  Photos. → "Sharing" on both.
- G7 Needs correction: the last Garage tab ("Notes") is cut off at the screen edge. → Tabs fit the width.

### Build sheet (web pass, same code)
- B1 Needs correction (accuracy): Fuel & tuning says "carburetor and jetting parts are hidden" for a fuel-injected bike,
  then lists "Carburetor and jetting". → Actually hide it for fuel-injected bikes.
- B2 Needs correction: "Add it yourself" shows "e.g. Öhlins" as the brand example for every part, including an ECU.
  → Example that fits the section.
- B3 Needs correction: the "‹ Back" link has an orange arrow and blue text; every other back link is orange arrow + white.

### Pages opened from Home › More (Setup log, Workshop, Specs & parts, Service log, Know-how)
- M1 Needs correction: none of these has a way back on iPhone (Android has the system back). → "‹ Home" link at the top.
- M2 Needs correction: Workshop says "saved on this phone" in two paragraphs back to back. → One short paragraph.
- M3 Needs correction: sag is "RIDING SAG" on the Specs card and "Race sag" in the list below and in Garage. → "Race sag".
- M4 Needs correction (app-wide): section labels sometimes have the accent dash ("KTM'S SCHEDULE", "UP NEXT") and sometimes
  not ("COMING UP", "YOUR BIKE", "BEFORE YOU TOUCH A CLICKER"). → Every section label gets the dash.
- Specs values, service-due math (64 h now, oil next at 73 h = "in 9 hours"), Know-how content: Good.

### Account
- A1 Needs correction: "Supported bikes" uses the same shield icon as "Your data and legal". → Bike icon.
- A2 Needs correction: "Tell a friend" and "Sign out" rows use bare icons while every row above uses the boxed icon.
  → Same boxed rows.
- A3 Needs correction: Preferences shows no selected option in Units / Answer length / How BAK talks when the account has
  no saved choice (seen in the sample; real accounts get defaults from the server). → App falls back to US units, Full,
  Straight shooter so a choice is always shown; sample returns them too.
- A4 Needs correction: Edit profile has "Done" at the top and "Save profile" at the bottom; "Done" doesn't save. → "Cancel".
- A5 Needs correction: Feedback "About" chips use a fourth picked style (check on gray). → Shared picked style.
- Plan, App color, Notifications, Ride safety, Your data and legal, Email and password, Delete account: Good.

### Messages
- MS1 Needs correction: in a thread the "‹ All messages" link sits under the big name title; everywhere else Back sits
  above the title. → Back above the title.
- Thread list, View profile, send box: Good.

### Community
- CM1 Needs correction: the page title has no accent underline (every other page title has it). → Same title style.
- CM2 Needs correction (sample data): "View all 2 comments" opens with no comments. → Sample returns the comments.
- CM3 Needs correction (sample data): any rider's profile opens Cole M. → Sample returns the rider tapped.
- Feed cards, filters, likes, composer: Good.

### Events
- E1 Needs correction: "12 going" is indented and on its own line. → "12 going · 4 interested" on the host line.
- E2 Needs correction: the picked RSVP ("Going") uses the blue main-action button. → Picked style (bike-color edge + check).
- E3 Needs correction: the event form's Type chips use another picked style (check on gray). → Shared picked style.
- Filters ("Find your crew"), Post an event form, Publish bar, Message / More: Good.

### Practice day
- P1 Needs correction: session time picks are 10/15/20/30 min here, 10/15/20/25/30/40 in Ride Day. → Same picks.
- P2 Needs correction: "NEXT UP" here, "UP NEXT" on Home. → "Up next" everywhere.
- P3 Needs correction: the "Set" under the session time reads like a label. → A real button: "Set reminder".
- Start sheet, Ride Day mode card, Ask BAK about today, Fuel plan card, checklist, How did it ride?: Good.

### Race day start sheet
- Good.

### Supported bikes
- Good.

### How BAK works
- HW1 Needs correction: nothing about Ride Day, Ride safety, Right now, crew finder or What I ran here. → Add a section.
- HW2 Needs correction (accuracy): "Pick the bike at the top" — the bike picker is in the chat box at the bottom now.
