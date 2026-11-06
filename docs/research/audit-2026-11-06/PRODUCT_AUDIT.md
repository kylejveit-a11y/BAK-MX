# BAK MX product and layout audit (2026-11-06)

Read-only audit of the web app (`src/`) and the phone app (`apps/mobile/src/`). Line numbers are from the files as they stood on 2026-11-06. Many source lines are very long, so a line number points at the line, not the exact column.

What this audit could not check: the live site (https://bakmx.com and /support) could not be fetched from the audit environment because of a fetch-permission block. Nothing below is based on the live site. Signed-in screens were reviewed from source, not run.

---

## Top 20 fixes, ranked

| # | Platform | Where | What the rider sees | Fix |
|---|---|---|---|---|
| 1 | Phone | `apps/mobile/src/App.tsx` L142 (Messages, Workshop, Specs, Learn, Setup, Bikes are hidden tabs), L166 (only entry is the Home "Shortcuts" grid); `apps/mobile/src/HomeBlocks.tsx` L39 (Shortcuts can be switched off in Edit Home) | The only way to open the Messages inbox, Workshop, Specs & parts, Know-how, Setup log and Supported bikes is the Shortcuts tiles on Home. If a rider turns Shortcuts off in Edit Home, those screens can no longer be reached. There is no unread badge anywhere, so a rider never knows a DM arrived. | Add a fixed way in: a Messages icon with an unread count in the header next to Account, and a "More" tab or sheet that lists every hidden screen. Do not let Shortcuts be switched off, or keep a "More" row that always shows. |
| 2 | Phone + Web (App Store 2.2) | `apps/mobile/src/PlansCard.tsx` L29–30; `src/Plans.tsx` L37 | The plan card shows a **BETA** tag and "Everyone gets N questions a day during the beta." App Review rejects apps that present themselves as beta, demo or trial builds. | Remove the beta wording from the release build. Call it a "Launch allowance" or just show the daily limit. Keep `access_mode` server-side only. |
| 3 | Phone (App Store 1.2) | `apps/mobile/src/RiderScreens.tsx` L268 (comments only offer Like and, on your own comment, Delete) | A rider can report or block from a post, event, profile or DM, but **not from a comment**. The web has "Report comment" (`src/Rider.tsx` L301). App Review checks that every type of user content can be reported. | Add the same "More" menu to each comment as the post menu: Report comment, Block rider, View profile. |
| 4 | Phone + Web (App Store 3.1.1 / 3.1.2) | `apps/mobile/src/PostMedia.tsx` L78; `src/PhotoEditor.tsx` L40 | Buttons say "Buy 10 edits" with **no price**. When the store has no packs, the rider sees "Edit packs are coming soon." | Load the `StoreProduct` and put its `priceString` on the button ("10 edits · $2.99"). If there are no packs, hide the row and point to Pro instead of "coming soon". |
| 5 | Server + Web admin (App Store 1.2) | `server/moderation.ts` L32 (messages and profiles "cannot be hidden from here"); `src/Rider.tsx` L609 (`ReportQueue` is only on the web Account page, and nothing alerts an admin) | Reports against a DM or a profile can only be dismissed, and nobody is alerted when a report comes in. Apple expects reported content to be acted on within 24 hours and abusive users to be removable. | Add an admin "Suspend rider" action that hides their profile, posts and DMs. Send an email or push to admins on each new report. Add an auto-hide once a post gets N reports. |
| 6 | Phone + Web | `apps/mobile/src/SpecsScreen.tsx` L24; `src/SpecsPage.tsx` L33 | Each spec shows the raw `source_locator`, e.g. "Printed 2-4; PDF page 24 (one-based), torque table". This exposes how sources are processed internally and reads as unfinished. | Show "Service manual, page 2-4" (printed page only). Drop "PDF page" and "(one-based)". Also delete the unused `Specs`/`SpecsForBike` in `src/App.tsx` L319–334, which still shows "· VERIFIED" and "Checking verified evidence…". |
| 7 | Phone | `apps/mobile/src/App.tsx` L333 (Chat), L85 (`BikeSelect`, used on Service log, Setup log and Specs); `apps/mobile/src/WorkshopScreen.tsx` L12 | With no bike yet, Chat, Service log, Setup log, Specs and Workshop show "Add your motorcycle in Garage to begin." **with no button**. On Chat the composer is also hidden, so the screen is a dead end. The web has a button for this (`src/App.tsx` L313). | Replace the notice with a card that has an "Add your bike" button which opens the Garage add form. Use it on all five screens. |
| 8 | Phone + Web | No `expo-notifications` anywhere. `apps/mobile/src/App.tsx` L378 "Remind me when it's due next" | Nothing ever notifies the rider: no new DM, comment reply, event cancellation or change, race-day morning or service due. The service form says "Remind me", but no reminder is ever sent. | Add push notifications for DMs, replies, cancelled events you RSVP'd to and service due by hours. Until then, rename the service field to "Next due at (hours)". |
| 9 | Phone + Web | `apps/mobile/src/RiderScreens.tsx` L348–351; `src/Rider.tsx` L390–395 | An open DM thread never updates. A reply only shows after leaving and coming back. There is no pull-to-refresh. | Use Supabase Realtime on the thread, or poll every 10 s while it is open. Add pull-to-refresh to the thread list. |
| 10 | Phone + Web | Tuning notes: `apps/mobile/src/App.tsx` L358 ("Saved on this phone"), `src/HomeBlocks.tsx` L213 ("Saved on this device"). Job notes: `apps/mobile/src/WorkshopScreen.tsx` L23. No chat delete on phone (web has it at `src/App.tsx` L308). | Notes written on the phone are not on the website, and a new phone loses them. A rider cannot save, pin or share a BAK answer they liked, and cannot delete a chat on the phone. | Store tuning notes and job notes in the account. Add "Save to Garage" and "Share" on each BAK answer card. Add "Delete chat" to the phone's chat picker. |
| 11 | Phone + Web (App Store 5.1.2(i)) | Consent is kept per device: `apps/mobile/src/App.tsx` L250, `src/App.tsx` L202. Photo "Action edit" has no consent check: `apps/mobile/src/PostMedia.tsx` L44–60. Text: `shared/ai-consent.ts` | Consent is asked again on every device. "Action edit" sends the rider's photo to an AI service without asking. The consent text says "a third-party AI service" without naming it. Edited photos are posted with no "edited" label. | Save consent on the account (server) and check it before photo edits and clip coaching too. Name the provider. Add a small "Edited" tag to posts that use an edited photo. |
| 12 | Phone + Web | `apps/mobile/src/RiderScreens.tsx` L322–337; `src/Rider.tsx` L309–380 | An event cannot be edited after posting (only cancelled or deleted). There is no Add to calendar, no directions and no reminder. "Going" does nothing else. | Add Edit for the host, "Add to calendar" (.ics or `expo-calendar`), a Directions link that opens Maps, and a reminder the evening before for riders who said they are going. |
| 13 | Phone | `apps/mobile/src/App.tsx` L232 and L239–243 | Edit bike details has **two** "Delete this bike" controls: one inside "More details" and one at the bottom. They describe what gets deleted differently ("conversations and service history" vs "build sheet, chats, photos and service log"). | Keep the one at the bottom and remove the one at L232. Use one accurate description of what is deleted. |
| 14 | Phone + Web | `apps/mobile/src/RiderScreens.tsx` L97; `src/Rider.tsx` L132 | Blocked riders shows "Blocked Nov 3 · Unblock" without saying **who** was blocked. | Return the handle and avatar from `/api/blocks` and show "@handle · blocked Nov 3". |
| 15 | Web vs Phone | `src/App.tsx` L105 ("In The Pits" heading), L156 (tab order Home/Chat/Garage); `apps/mobile/src/App.tsx` L142 (Home/Garage/Chat); L461 vs L470 ("APP COLOR" vs "App colour"); `src/App.tsx` L150 (Preferences summary says "race number") | The same screen has different names: Community vs "In The Pits", Chat vs Ask BAK, Service log vs Maintenance, Know-how vs Learn. The tab order differs between web and phone. US and UK spelling are mixed on one screen. Web Preferences says it holds the race number, but the race number is in Profile. | Make one shared label list in `shared/` and use it for nav and headings on both platforms. Pick US spelling. Use the same tab order on both. Fix the Preferences summary. |
| 16 | Web vs Phone | `src/App.tsx` L173 (12-character minimum); `apps/mobile/src/App.tsx` L122/L130 (8-character minimum) | A rider who signs up on the phone with an 8-character password is told to use 12 when resetting on the web. | Put one rule in `shared/` and use it on both platforms. |
| 17 | Phone | `src/App.tsx` L130 (`RiderManual` upload is web only); `apps/mobile/src/RiderScreens.tsx` L489 (back link always says "Community") | The phone cannot upload a rider's own PDF manual, even though the AI consent text mentions it. Opening a rider from Events and going back shows a "Community" back link but returns to Events. | Add manual upload to phone Garage (document picker). Pass the right back label (Events, Community or Messages) into `RiderProfileView`. |
| 18 | Phone | `apps/mobile/src/App.tsx` L157–175; `apps/mobile/src/WhatsNew.tsx` L11–30 | Home stacks a two-line hero, a "NEW · Widgets, Siri and Lock Screen" banner (shown to brand-new 1.0 installs), a race countdown, up to 7 blocks and a 9-tile grid. It is too long for a quick look at the track. | Hide What's New for accounts created after the feature shipped. Shrink the hero to one line after the first week. Show 4 Shortcuts plus a "More" row. |
| 19 | Phone + Web | `apps/mobile/src/WorkshopScreen.tsx` L25 | Workshop phase text says "Job plan · Follow the exact installed-component service procedure for this phase. A specification list does not establish the removal or assembly sequence." and "Completion records what you reported; it does not certify the bike ready to ride." This reads like an internal engineering note, not rider guidance. | Rewrite in rider language, e.g. "Follow your service manual for the order of steps. The numbers here don't replace it." Show the safety disclaimer once per job, not on every phase. |
| 20 | Web | `src/styles.css` (35 rules set font-size 7–9px, e.g. `.bike-metrics small` 7px, `.context-tag` 7px, `.message-label time` 8px, `.history-item small` 9px); `src/App.tsx` L55 (Workshop and Maintenance share the wrench icon, Bikes and Garage share the garage icon) | Small labels are hard to read in sun on a phone, and the "More" menu has repeated icons. | Set a minimum of 11px for labels and 12px for body text. Give each tool its own icon. |

---

## 1. Dead ends and broken flows

- **Hidden screens on the phone** (fix 1). The Messages tab is `tabBarButton:()=>null` (`apps/mobile/src/App.tsx` L142). If a rider opens a thread from a post, the "All messages" back link is the only way to reach the inbox.
- **No-bike states with no button** on phone Chat, Service log, Setup log, Specs and Workshop (fix 7).
- **The service "Remind me" field** never sends a reminder (fix 8).
- **The phone cannot delete a chat**, but the web can (fix 10).
- **Events cannot be edited** (fix 12).
- **The rider profile back link** says "Community" when opened from Events or the going list (`RiderScreens.tsx` L489).
- **Blocked list without names** (fix 14).
- **Account › Data and legal tile** (`apps/mobile/src/App.tsx` L473) has a "…is not configured in this build" branch that can never run, because `mxPage` always returns a URL. Not visible to riders; remove it.

## 2. Placeholders and unfinished bits

- "Edit packs are coming soon." on the phone and the web (fix 4).
- **BETA** tag and "during the beta" on the plan card (fix 2).
- Raw `source_locator` text such as "PDF page 24 (one-based)" on Specs (fix 6).
- Unused web `SpecsForBike` (`src/App.tsx` L319–334) with "· VERIFIED" and "Checking verified evidence…" (fix 6).
- "BAK has general knowledge for this bike; exact specs are still being added." (`apps/mobile/src/App.tsx` L186, `src/App.tsx` L170). This is acceptable as an honest status. Add a "Tell us your bike" feedback link next to it.
- Feedback confirmation says "this goes straight to the build list" (`RiderScreens.tsx` L102). This is internal wording; use "Thanks, we read every one."
- The web preview banner (`src/App.tsx` L104) only shows when Supabase is not configured, so riders will not see it. Sample mode is behind `__DEV__` (`apps/mobile/src/sample/sampleMode.ts`), so riders will not see it either. Both are fine.

## 3. Layout and consistency

- **Navigation is not the same.** The web has 5 primary items plus a 13-item "More" menu. The phone has 5 tabs with Home, Garage and Chat in a different order, and everything else sits behind Home Shortcuts (fixes 1 and 15).
- **Names are not the same:** Community / "In The Pits", Chat / Ask BAK, Service log / Maintenance, Know-how / Learn, Setup / Setup log, App colour / APP COLOR (fix 15).
- **Phone Home is too long** (fix 18).
- **Web Setup page** (`src/App.tsx` L139–142) shows the setup log, then a "Not sure what to change? Ask BAK" panel, then the calculators, then another "Work through a setup change · Ask BAK" panel (L335). That is two identical prompts on one page.
- **The phone Garage has three ways to add a bike** (the select's "+ Add a bike", the "Add another bike" tile and the Home card). That is acceptable. The duplicate delete control in the edit form is not (fix 13).
- **Tiny type on the web** (fix 20).

## 4. Product gaps against the promise

- **Notifications:** none (fix 8).
- **Saved answers:** answers cannot be saved, pinned or shared. Tuning notes stay on one device (fix 10).
- **Search:** Community, Messages and chat history cannot be searched. Only Specs and the parts catalog have search.
- **Event reminders, calendar and directions:** missing (fix 12).
- **Garage completeness:** PDF manual upload is web only (fix 17). The phone has the build sheet, photos, coaching, VIN check and recall check. The web shows the coverage line, but nothing tells the rider what is missing for their exact year.
- **Onboarding:** the phone has Welcome, a bike check before sign-up and a 60-second first setup. The web has no first-run walkthrough after sign-up. It drops the rider on Home with "Add your bike". Carry the web's SupportPicker choice into the add-bike form, as the phone does with `pending-bike`.
- **Real-time DMs:** missing (fix 9).

## 5. Apple App Store review risks

| Risk | Status | Where |
|---|---|---|
| Account deletion in the app | Present: type DELETE, then confirm | `apps/mobile/src/App.tsx` L474. Add a "Manage subscription" link inside that section, since the copy tells riders to cancel in the store first. |
| Sign in with Apple | Not required today, because sign-in is email and password only with no third-party login (Guideline 4.8). Adding Google or Facebook later would make SIWA required. | `apps/mobile/src/App.tsx` L122 |
| UGC reporting and blocking | Partial: comments have no report on the phone (fix 3). Reported DMs and profiles cannot be actioned, and admins get no alerts (fix 5). Community rules are accepted when the profile is created (`RiderScreens.tsx` L82). | |
| Purchases | Restore, Manage, EULA and Privacy links are present (`PlansCard.tsx` L47–48). Edit-pack buttons have no price (fix 4). The BETA wording risks a 2.2 rejection (fix 2). | |
| AI and data sharing (5.1.2(i)) | A consent screen exists before Ask BAK. It is kept per device, does not cover photo edits, and does not name the provider (fix 11). | |
| Generated or edited images | "Action edit" changes rider photos with AI. The copy promises only light, colour and sharpness change. Posts show no "edited" label (fix 11). | `PostMedia.tsx` L46–83 |
| Privacy strings | There is no `apps/mobile/app.json`; the config is `apps/mobile/app.config.ts`. It sets photo library, camera, microphone and speech recognition strings, and they are specific and accurate. No location API is used, so no location string is needed. | `apps/mobile/app.config.ts` |
| Age rating | Sign-up says "13 or older", and riders can DM any other rider. In App Store Connect, answer the age-rating questions for user-generated content and messaging truthfully. Consider limiting DMs to riders who follow each other or have attended the same event. | `apps/mobile/src/App.tsx` L135 |

---

## Not checked

- Live https://bakmx.com pages (fetch blocked in this environment).
- Runtime behaviour on a device or simulator. Everything here comes from reading the source.
- Server-side behaviour beyond the moderation and profile handlers.
