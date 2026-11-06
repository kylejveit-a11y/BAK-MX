# What to fix next (from the 2026-11-06 audits)

Sources: DATA_COVERAGE.md, PARTS_AUDIT.md, PRODUCT_AUDIT.md, CODE_REVIEW_NEW_FEATURES.md (all in this folder).

## Fixed the same day
- Drafted posts with Ask BAK photos could not be saved (photo owner check); a post's clip must be the poster's own.
- App actions: hours/nickname changes read the bike fresh; actions trimmed to 8; dates use the rider's time zone.
- Photo edits: retries after a dropped connection do not charge twice; stuck edits are handed back; phone waits long enough.
- Account deletion removes clips; removing an Ask BAK photo from a draft keeps it in the conversation.
- Phone build sheet saved spring rate / tire size / chain length options in the colour field (BAK read "color: 5.4 kg").

## 1. Before the next App Store build (1.0.1)
1. Phone: report and block on comments (web has it). Apple guideline 1.2.
2. Remove "BETA" / "during the beta" from the plan card (web and phone). Guideline 2.2.
3. Photo-edit packs: show the store price on the button; hide the buy area until packs exist instead of "coming soon".
4. Phone: Messages, Workshop, Specs, Setup log reachable even with Home shortcuts turned off; unread message badge.
5. Phone: "Add your motorcycle" dead ends get a button to Garage (Chat, Service log, Setup log, Specs, Workshop).
6. Specs: stop showing source text like "PDF page 24 (one-based)" to riders.
7. Phone: one "Delete this bike" control, not two with different wording.
8. AI consent: cover photo edits, name the AI provider, label edited photos ("Edited").

## 2. Data (biggest rider-facing gaps)
1. KTM / Husqvarna / GasGas enduro bikes (XC-W, TE, FE/XCF-W, EC; 150s): no verified data at all (77 bike-years).
   Their owner's manuals are not indexed yet; same pipeline as the MX bikes.
2. Guided jobs: 65% of bike-years have none. KTM-group two-strokes and all brands' oil change / valve check / air filter
   jobs first (most-used maintenance), then Honda CRF150R and 2020 models, Suzuki.
3. MX gaps: KTM 125 SX 2023 suspension, Husqvarna FC 2026 / FC 450 2023 suspension (manuals partly read), 2020 Yamaha
   two-stroke sag, Kawasaki mini jetting (waiting on Kyle's screenshots), KTM 85 SX / TC 85 2020-21 jetting (picture).
4. Suzuki: almost everything is in the paid service manuals (Kyle's call whether to buy, $55-80 each).
5. KX85/KX112 2027: 48 spec rows staged but not promoted.

## 3. Parts and build sheet
1. A structured spec slot on parts (spring rate + unit, sprocket teeth, chain pitch/links/type, tire size/compound,
   tube/mousse/Tubliss, clamp offset, bar bend) and feed it into BAK's spring and gearing math.
2. Type rules: "ring" sends O-ring/X-ring chains and Dual Ring sprockets to "Something else" (40% of rows untyped).
3. Tires: proper MX tire list (Dunlop MX34/MX14, Michelin Starcross 6, Pirelli MX32 etc.), drop adventure/trials tires
   from MX bikes, add Tubliss and Nitro Mousse. Needs research.
4. Web picker up to the phone's: size/option, front/rear, on/off the bike.
5. "Everything else is stock" button, and show what stock is (from verified claims).
6. CRF150R shows no fuel parts (treated as fuel injected); confirm it is carbureted, then fix.
7. Split suspension into Fork / Shock / Linkage; revalve records; hours at install for wear parts.

## 4. Product gaps
1. Notifications: service due, event reminders, new messages, replies (the "remind me" switch sends nothing today).
2. Messages refresh while a conversation is open.
3. Save or share a BAK answer; tuning notes and job notes saved to the account, not one device.
4. Events: edit, add to calendar, directions.
5. Moderation: suspend a rider, admin alert on new reports.
6. Same names and order on web and phone (Community vs "In The Pits", Chat vs Ask BAK); password minimum 12 on both.
7. Clips: resumable upload on the phone for big files; a delete route for clips; clean up orphaned uploads.
