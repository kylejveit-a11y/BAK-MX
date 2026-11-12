// The app guide: every screen, card, button and setting in BAK MX, in rider words, with the labels exactly as they appear on
// screen. Ask BAK reads the matching sections when a rider asks what something is for or how to work it; the Help screen and
// the website show the whole thing under "Full guide". Nothing here is invented: each entry describes the phone app's own UI.
// bak_can_change is true only where an action in shared/app-actions.ts really changes that thing for the rider.
import {DEFAULT_DAILY,TIER_LABEL,TRIAL_BLOCKS,TRIAL_BLOCK_SIZE} from './plans.ts';
import {editAllowance} from './photo-edit.ts';
const EDITS={free:editAllowance('free').included,premium:editAllowance('premium').included,pro:editAllowance('pro').included};

export type GuideOption={label:string;effect:string};
export type GuideSetting={name:string;what_it_does:string;options?:GuideOption[];bak_can_change?:boolean};
export type AppGuideEntry={screen:string;path:string;purpose:string;how:string[];settings?:GuideSetting[];bak_can_change?:boolean;
 /** words a rider might use for this screen; never shown */
 words:RegExp};

export const APP_GUIDE:AppGuideEntry[]=[
 {screen:'Home',path:'Home tab',purpose:'The question bar, your bike and the one thing coming up.',how:[
  'Type in the bar, or tap the camera to snap a part. “Something’s wrong?” under the bar starts a fault diagnosis.',
  'Your bike card: photo, hours, the chips You · Clickers & sag · Build sheet, and “Finish setup · about 2 minutes” for whatever is missing. “Switch bike” lists your other bikes.',
  'Up next: a service that is due, else the next event you’re going to, else your last setup change.',
  'Bottom: Race day · Practice day · Edit Home. More: Setup log · Workshop · Specs & parts · Service log · Know-how · Messages. New messages show as a count on the envelope at the top right of every screen.'],
  words:/\bhome (screen|tab|page)\b|\bon home\b|\bup next\b|\bsomething.s wrong\b|\bfinish setup\b|\bmore row\b|\bswitch bike\b/i},
 {screen:'Edit Home',path:'Home → Edit Home',purpose:'Turn Home blocks on or off and reorder them. Saved on this phone.',how:['A switch and Move up / Move down per block, Done to finish, “Reset to the standard layout” to go back.'],
  settings:[{name:'Blocks',what_it_does:'Shown or hidden, in your order.',options:[{label:'Ask BAK',effect:'the question bar'},{label:'Your bike',effect:'photo, hours and setup checklist'},{label:'Up next',effect:'service due, next event or last setup change'},{label:'Race prep',effect:'your checklist, week before to after (off to start)'},{label:'Last coaching',effect:'your latest fix and drill (off to start)'}]}],
  words:/\bedit home\b|\bhome (layout|blocks?)\b|\b(reorder|rearrange|hide|remove|turn off) .*\b(block|card)s?\b/i},
 {screen:'Race day',path:'Home → Race day',purpose:'Set a race: Home counts down with your prep list, and on the day becomes your track screen.',how:[
  'Pick the bike (Change), the Track (one-tap picks, or search BAK’s tracks) and the Race day date. “Countdown on the widget” puts days to go on the BAK MX home screen widget (iPhone and Android). Tap “Set up this race” (or “Start race day” for today).',
  'Before: NEXT RACE with days to go and “Prep · phase” progress; BAK’S SETUP FOR the track (Get BAK’s setup · Refresh · Ask about it) works from the track, the forecast and your bike. “Cancel this race” clears it.',
  'On the day: NEXT UP (set the moto time; on iPhone the Lock Screen counts down, on Android a pinned notification shows it and a heads-up comes 10 minutes before), BAK’s setup, FUEL PLAN, ON YOUR BIKE NOW, QUICK ASK chips (one tap, race-mode answer), BETWEEN MOTOS checklist, LOG A CHANGE (moto · what changed · detail · How did it ride? · Save to setup log), TODAY with “Ask BAK what to try next”, How did the track ride?, then “End race day”. Ends by itself the day after.'],
  words:/\brace ?day\b|\bset (up )?a race\b|\bcountdown\b|\bnext race\b|\bquick ask\b|\blog a change\b|\bend race day\b|\bnext up\b|\bmoto time\b|\bbak.s setup\b/i},
 {screen:'Practice day',path:'Home → Practice day',purpose:'A day of laps, today: session log, short checklist, fuel plan, “Ask BAK about today”. Ends tonight by itself.',how:[
  'Pick the bike and track, “Start practice day”. NEXT UP sets the next session time (iPhone: Lock Screen countdown; Android: pinned notification and a heads-up 10 minutes before).',
  'LOG A SESSION: Time on track (chips or type minutes), How it went, the setup change with detail and How did it ride? (goes into your setup log). SESSIONS lists today. “End practice day” closes it.'],
  words:/\bpractice ?day\b|\bsession log\b|\blog (a )?session\b|\bstart practice\b/i},
 {screen:'Race prep',path:'Home → Race prep block, the race countdown, or race day → Full prep list',purpose:'Your own checklist from the week before to after the race, started from BAK’s list for your kind of riding. Saved to your account.',how:[
  'Tabs: Week before · Night before · At the track · Between motos · After. Tap an item to check it; “Uncheck this list” clears the phase.',
  '“Edit list”: remove (−), Move up / Move down; “Add your own item” (marked YOURS); “Restore BAK’s list”. On race day the BETWEEN MOTOS card has “Clear for the next moto” and Hide / Show prep list.'],
  words:/\brace prep\b|\bprep list\b|\bchecklist\b|\bcheck ?list\b|\bpacking list\b/i},
 {screen:'Fuel plan',path:'Home on race day or practice day → FUEL PLAN',purpose:'What to eat and drink and when, timed to your gate drops.',how:[
  '“Set up the fuel plan”: Me or Another rider (like my kid), weight, height, age, Sex (optional), “Nervous stomach on race day”, caffeine (adults only), the health screen, “Save to my account”. Under 18 gets a parent view, no caffeine.',
  'On the card: Rider switches profiles; “Gate times and today’s settings” holds each moto’s name and time (Moved? shifts the plan), Moto length, Hot or humid today, Nervous stomach, Caffeine today. Items show the time, what, and why; “Grams behind this” shows the numbers. “Do the sweat test” saves a sweat rate. Heat warnings always show.'],
  words:/\bfuel plan\b|\b(what|when) (to|should i) (eat|drink)\b|\bhydrat|\bsweat test\b|\bgate times?\b|\bnervous stomach\b|\bcaffeine\b/i},
 {screen:'Starting setup',path:'Home → “Starting setup in 60 seconds”, or Garage → Settings → “Fresh starting setup”',purpose:'Four answers about you, then BAK writes a starting setup from the bike’s published settings.',how:['Weight in riding gear (lb), Riding level, Main kind of riding, Usual dirt (optional). “Save and get my setup” saves them to the bike and opens the setup in Ask BAK.'],
  words:/\bstarting setup\b|\b60 seconds\b|\bfirst setup\b|\bfresh (starting )?setup\b/i},
 {screen:'Garage',path:'Garage tab',purpose:'Your bikes, you as a rider, and where your clickers, sag, gearing and tires are now.',how:[
  '“Your bikes” picks the active bike or “+ Add a bike”. Tabs: Overview · Build sheet · Photos · Coaching · Notes. Overview: cover photo, hours, readiness chips, Ask BAK, Settings, “Edit bike details”, tiles for Build sheet, Photos, Service log, Add another bike, then a SHARING card: show the bike on your profile and make its build sheet public.',
  'Add or edit: tap Bike to pick make, model and year (“My bike isn’t listed” lets you type it: Motocross / Cross-country / Enduro), Hours on the bike, VIN (optional); “More details”: Nickname, Version, Market. Save. “Delete this bike” is at the bottom of Edit bike details and removes its build sheet, chats, photos and service log.',
  'Settings: the cards below. Blank means stock; “More” opens the optional fields.'],
  settings:[
   {name:'You',what_it_does:'Weight in riding gear, Riding level, Main kind of riding, Also ride; More: Usual dirt, Height, Years riding, Race class, What you ride for, Anything that limits how you ride. Sets spring and clicker direction.'},
   {name:'Bike fit',what_it_does:'Bar height and position, Lever angle and reach.'},
   {name:'Clickers & sag',what_it_does:'Fork compression, Fork rebound, Shock compression, Shock rebound, Race sag (mm), Free sag (mm), Fork springs, Shock spring; More: Fork tubes above top clamp. Where your settings are now.'},
   {name:'Gearing, tires & map',what_it_does:'Front sprocket, Rear sprocket, Tire pressure, Map you run; More (carburetor): Main jet, Pilot / idle jet, Needle and clip, Air / pilot screw, Jetted for.'},
   {name:'Hours on the bike',what_it_does:'Engine hours; service reminders count from this.',bak_can_change:true},
   {name:'Nickname',what_it_does:'The name shown for the bike.',bak_can_change:true}],
  bak_can_change:true,
  words:/\bgarage\b|\badd (a |another |my |the )?(second |new |other )?bike\b|\bswitch(ing)? bikes?\b|\bactive bike\b|\bnickname\b|\bengine hours\b|\bhours on (the|my) bike\b|\bdelete (a |my |the |this )?bike\b|\bvin\b|\bedit bike\b|\bbike details\b|\bclickers? (&|and) sag\b|\bfree sag\b/i},
 {screen:'Build sheet',path:'Garage → Build sheet',purpose:'What’s stock and what’s changed, section by section, so BAK answers for your build.',how:[
  '“Edit build sheet”, then a section: Suspension · Chassis · Engine & cooling · Air intake · Exhaust · Fuel & tuning · Clutch · Gearing & chain · Brakes · Wheels & tires · Bars & controls · Guards & skid plate · Plastics & seat.',
  'In a section: Stock, Changed or Not sure. Tap a kind of part, pick the brand and model listed for your bike (size and Color where they matter), “Add to my bike”; “Not listed?” adds your own. WORK DONE records a revalve or tune and who did it.',
  'Each part: On / Off the bike (spares stay listed), Details, “Remove from my bike”. “Anything else BAK should know?” is a note per section. Changes save as you go; Done closes. THINGS TO CHECK flags parts that don’t add up. “Ask BAK about this build”.'],
  words:/\bbuild sheet\b|\baftermarket\b|\bwhat.s (fitted|on the bike)\b|\binstalled parts\b|\boff the bike\b|\bspare parts\b|\bwork done\b/i},
 {screen:'Photos',path:'Garage → Photos',purpose:'Your pictures of the bike, private unless you show the bike on your profile.',how:['Plus adds up to 10 at a time; tap a photo to view or delete. The PROFILE card below has the same two switches as Sharing on the Overview, plus which photos to show.'],
  settings:[{name:'Show this bike on my profile',what_it_does:'Off: only you see the bike and its photos. On: riders see it and the photos you tick (up to 8).'},{name:'Public build sheet',what_it_does:'On: anyone who sees the bike can read its parts list. Never your settings, notes, hours or rider details.'}],
  words:/\bphotos? of (my|the) bike\b|\bbike photos?\b|\bcover photo\b|\bshow (this|my) bike on my profile\b|\bpublic (build sheet|garage)\b|\bshare (my )?(garage|build)\b|\bprofile photos\b/i},
 {screen:'Notes',path:'Garage → Notes, or “Tuning notes” under the chat',purpose:'BAK answers you saved to the bike and notes you wrote. Saved to your account, on every device.',how:['Under any answer: “Save to bike” keeps it, “Share” sends the setup sheet out. “Tuning notes” under the chat: New note, Save note. In Garage → Notes each note has Ask BAK about this note · Share · Rename · Delete.'],
  words:/\btuning notes?\b|\bsave to bike\b|\bsaved answers?\b|\bnotes? tab\b|\bmy notes\b/i},
 {screen:'Coaching',path:'Garage → Coaching',purpose:'Every riding clip or photo BAK coached, newest first, with the fix and drill.',how:['“Coach me from a clip” opens Ask BAK to pick a clip (Pro plan). Chips: What are you showing BAK?, Slow motion, Where was this?, “Compare with an earlier clip?”. Under the answer, “Tried it? Did it help?”: Helped / No change / Worse. “Frames and full coaching” opens the detail.'],
  words:/\bcoach(ing)?\b|\b(riding|video|a|the|my|your) clips?\b|\bslow motion\b|\bdrill\b/i},
 {screen:'Ask BAK',path:'Chat tab',purpose:'Say what the bike is doing the way you’d tell a buddy; BAK answers for your exact bike and build.',how:[
  'A new chat shows “Dial it in.” and four starters; tap the phrase to start typing, or a starter to put it in the message box to finish and send.',
  'The message box: type on top; under it the camera (up to 4 photos or a clip), New chat (the pencil), the bike chip (tap to change bike), the clock for your earlier chats, Race (race mode: short answers, one change at a time; on by itself on race day) and Send.',
  '“Handling problem?” asks a few taps (what the bike is doing, on or off the gas, where, the dirt) and writes the question. “Working on the bike?” starts a guided job in the chat.',
  'Under an answer: “Try in this order”, “Tried it? How did it ride?” (Better / Worse / No change → setup log), “Save to your Garage?”, “Want BAK to do this?” (Apply / Not now), Save to bike, Share, and Possible causes · What BAK still needs to know · Published values used · Sources · How sure is this.',
  'Free accounts start with '+TRIAL_BLOCKS+' sets of '+TRIAL_BLOCK_SIZE+' questions; “Start next free set” appears when one runs out.'],
  settings:[{name:'Race',what_it_does:'Race mode on the message box.',options:[{label:'Race on',effect:'the one change to make, short and fast'},{label:'off',effect:'full-depth answers'}]}],
  words:/\bask bak\b|\bchat (tab|screen|bar)\b|\bnew chat\b|\brace mode\b|\bhandling problem\b|\bfew taps\b|\btriage\b|\bcamera button\b|\battach (a )?photo\b|\bsend (a )?photo\b|\bhow sure\b|\bpossible causes\b|\bwant bak to do this\b|\bfree set\b|\bworking on the bike\b/i},
 {screen:'Setup log',path:'Home → More → Setup log',purpose:'One change and how it rode, so next time at that track you know what worked. BAK reads it.',how:[
  '“Log a setup”: What did you change?, How was it? (Better / Worse / No change / Not tested yet), Track, Notes; “Conditions, date, hours and full settings” opens the Fork, Shock, Chassis and Engine fields. Save. Then How did the track ride? offers a track report. Each entry: “Ask BAK about this”, Delete.',
  '“Not sure what to change?” opens Ask BAK; Know-how opens the setup guide. “Calculators: gearing, chain, sag, air, engine”: Final-drive ratio, Gearing change, Sag percentage, Speed versus RPM, Displacement, Spring rate, Compression ratio and more; fill the inputs, Calculate.'],
  bak_can_change:true,
  words:/\bsetup log\b|\blog (a |my )?(setup|change)\b|\btrack report\b|\bhow did (the track|it) ride\b|\bcalculators?\b/i},
 {screen:'Know-how',path:'Home → More → Know-how',purpose:'What each clicker, spring and setting does, and where to start for what you feel.',how:['“By what you feel”: rider complaints with CHECK FIRST, LIKELY CAUSES, a first change and “Ask BAK about this on my bike”. “By adjustment”: each adjuster, FIRMER / MORE and SOFTER / LESS, too much, too little. BEFORE YOU TOUCH A CLICKER at the bottom.'],
  words:/\bknow.?how\b|\bsetup guide\b|\blearn (screen|page|tab)\b|\bby what you feel\b|\bby adjustment\b/i},
 {screen:'Workshop',path:'Home → More → Workshop',purpose:'Step-by-step jobs for your exact bike, hands-free, plus your own job notes.',how:[
  '“Guided jobs”: pick a system, then a job. Each step: the instruction, CHECK BEFORE YOU MOVE ON, a notes box (some steps need a measurement), “Done — next step”; “All steps” shows progress, “Share the record” at the end. Progress saves on this phone.',
  'Hands-free (from “Working on the bike?” in Ask BAK): Turn on, then say “next”, “back”, “repeat”, “where am I”, “record” and the number, or “Hey BAK” and a question; “stop listening” pauses. On iPhone the Lock Screen shows your step; on Android a pinned notification does.',
  '“Check it with a photo”: Spark plug · Tire wear · Chain and sprockets · Fork seal / leak · Air filter · Brake pads. Job notes keep measurements, parts and a job recap for jobs without a guide.'],
  words:/\bworkshop\b|\bguided jobs?\b|\bhands.?free\b|\bvoice (mode|control)\b|\bsay .?next\b|\bhey bak\b|\bstep.by.step\b|\bcheck it with a photo\b|\bjob notes\b/i},
 {screen:'Specs and parts',path:'Home → More → Specs & parts',purpose:'The maker’s published figures for your exact bike, your settings beside stock, and the parts catalog.',how:[
  'Tiles: ENGINE OIL and the values riders look up most. YOUR SETTINGS NOW: your clickers, sag and tire pressure beside stock (Add yours / Update opens Garage).',
  '“Everything published for this bike”: Search, then All · Torques · Settings · Service · Specs; tap a value for its conditions and source. A value not listed is unknown, not zero. Parts catalog: find an assembly, open it for the exploded diagram (tap to zoom) and the numbered parts with part numbers.'],
  words:/\bspecs?( (&|and) parts)?\b|\btorques?\b|\bpart numbers?\b|\bparts catalog\b|\bexploded diagram\b|\boil capacity\b|\bpublished (figures?|values?)\b/i},
 {screen:'Service log',path:'Home → More → Service log',purpose:'Log oil, filters and top ends with the hours; BAK works out what’s next from the maker’s intervals.',how:[
  '“Log service”: tap what you did (Engine oil · Oil filter · Air filter · Spark plug · Valve check · Top end · Fork service · Shock service · Chain & sprockets · Brake pads · Coolant · Clutch) or type it, Hours, Date, Notes. “Remind me when it’s due next”: Next due at hours, why. Save service.',
  'COMING UP lists what’s due soon. The maker’s SCHEDULE FOR THIS BIKE shows each job against its interval with “Log it”; a job never logged is never called due. History rows open for notes and Delete entry.'],
  words:/\bservice log\b|\bmaintenance\b|\boil change\b|\bservice (due|history|reminder)\b|\bwhat.s due\b|\blog (a )?service\b|\bhours? (since|until)\b/i},
 {screen:'Community',path:'Community tab',purpose:'Riders’ builds, setup questions and ride plans.',how:[
  'Needs a rider profile (Handle, Display name, agree to the community rules). Filters: All · Builds · Setup questions · Ride plans · General.',
  '“What’s on the bike?” starts a post: Build, Setup question, Ride plan or General, tag your bike, write, up to 4 photos or a Clip, Post. On a post: heart, comment, share; the ⋯ menu has Message, View profile, Report post, Block (your own: Delete post). Comments: Report, Block.'],
  bak_can_change:true,
  words:/\bcommunity\b|\bposts?\b|\bfeed\b|\bcomments?\b|\blikes?\b|\bblock(ing)? (a |someone|this |that |the )?(rider|user|them|him|her|someone)\b|\bunblock\b|\breport(ing)? (a |this |that |the )?(post|comment|rider|user|someone)\b|\bshare (a )?post\b/i},
 {screen:'Events',path:'Events tab',purpose:'Ride days, races, practice nights, clinics and meetups posted by riders.',how:[
  'Upcoming / Past. “Post an event”: Event name, Type (Ride day · Race · Practice · Clinic · Meetup), Starts, Ends, Track or location, Details, Publish event.',
  '“I’m going” asks Show me or Keep me private on the going list; Interested marks interest. Both turn on that event’s reminders. Your own event: Cancel event / Restore event, Delete. Tap the going row to see who’s going.'],
  bak_can_change:true,
  words:/\bevents?\b|\brsvp\b|\bi.m going\b|\bmark(ed)? going\b|\binterested\b|\bride day\b|\bpost an event\b|\bcreate (an )?event\b/i},
 {screen:'Messages',path:'The envelope at the top right of any screen (left of Account), Home → More → Messages, or Message on a post or event',purpose:'Private messages between you and one rider.',how:['Start one from Message on a post, event or profile. The inbox lists threads; the envelope at the top shows a count when a message is new. In a thread: type, send; Report or Block from the ⋯ under it.'],
  words:/\bmessages?\b|\bmessage (a |another |the )?rider\b|\bdm\b|\binbox\b/i},
 {screen:'Rider profile',path:'Account → top card',purpose:'What other riders see: handle, name, photo, home area, class, race number, about.',how:['Tap the photo to change it. Edit: Handle, Display name, Home area, Class / riding, Race number, About; Save profile. Blocked riders with Unblock. Your race number shows on your race plate in Garage.'],
  bak_can_change:true,
  words:/\bprofile\b|\bhandle\b|\bdisplay name\b|\brace number\b|\bavatar\b|\bunblock\b|\bblocked riders\b/i},
 {screen:'Ask BAK plan',path:'Account → Ask BAK plan',purpose:'Your plan, what’s left today, free sets, plans and credit packs.',how:[
  'The row itself says where you stand (“Free · 3 of 7 sets left”, “Premium · renews Dec 10”, “Pro · Unlimited questions”). Open it for Used today, Extra questions or Credits, Free sets left, and “Start next free set” when one is ready. “See plans and credit packs” loads the store offers: Subscribe, or tap a credit pack. Also See BAK Pro · Restore purchases · Manage subscription · Terms of Use (EULA) · Privacy Policy.',
  TIER_LABEL.free+': '+TRIAL_BLOCKS+' sets of '+TRIAL_BLOCK_SIZE+' Ask BAK questions to start, '+EDITS.free+' Action photo edits to try, plus the Garage, logs, race day, community and events. '+TIER_LABEL.premium+' adds '+DEFAULT_DAILY.premium+' questions a day and '+EDITS.premium+' photo edits a month. '+TIER_LABEL.pro+' adds unlimited questions (fair use), coaching from riding clips and '+EDITS.pro+' photo edits a month. Nothing is charged unless you choose a plan.'],
  words:/\bplan\b|\bsubscription\b|\bsubscribe\b|\bpremium\b|\bpro (plan|tier|feature)\b|\bupgrade\b|\bcredits?\b|\bcredit packs?\b|\brestore purchases?\b|\bquestions? (left|a day|today)\b|\bbilling\b|\bcancel (my )?subscription\b/i},
 {screen:'BAK Pro',path:'Account → Go Pro (also from the plan row, the chat when your questions are used up, and the line under the chat starters)',purpose:'What Pro adds, the plans side by side, and the store buttons with the store’s own prices.',how:[
  '“Unlimited answers. Every moto.” Three things Pro adds: unlimited Ask BAK questions (fair use), coaching from your riding clips, '+EDITS.pro+' Action photo edits a month. Under that, what each plan gives: Free, Premium and Pro side by side.',
  'The buttons show the store’s price and period (yearly or monthly); Premium sits under Pro as the smaller option; question packs are listed when the store has them. If the store cannot be reached it says “Price shown in the App Store” with a Retry; no price is ever guessed. Subscriptions renew automatically unless cancelled at least 24 hours before the period ends. Restore purchases · Manage subscription · Terms of Use (EULA) · Privacy Policy are on the same screen.',
  'When your free questions (or today’s Premium questions) are used up, the chat shows a card where the answer would be: what ran out, when it resets, “Start next free set” when one is waiting, “See BAK Pro”, and “Buy a question pack” when packs exist. Your typed question stays in the box. The Garage, specs, logs and notes keep working on every plan.'],
  words:/\bgo pro\b|\bbak pro\b|\bwhat does pro (add|include|give)\b|\bwhy pro\b|\bworth (it|upgrading)\b|\bfair use\b|\bused (up )?(my|all my|today.s) (free )?questions\b|\bout of questions\b|\bquestion packs?\b/i},
 {screen:'App colour',path:'Account → App colour',purpose:'Whether the app follows your bike’s maker colour or stays BAK blue.',how:['Tap one option; it changes at once on this phone.'],
  settings:[{name:'App colour',what_it_does:'The accent colour of the app.',bak_can_change:true,options:[{label:'Match my bike',effect:'the maker colour for the selected bike; changes when you switch bikes'},{label:'BAK blue',effect:'the same blue on every bike'}]}],
  bak_can_change:true,
  words:/\bapp colou?r\b|\bcolou?r (of the app|scheme|theme)\b|\bchange the colou?r\b|\baccent colou?r\b|\btheme\b|\bdark mode\b|\blight mode\b|\bbak blue\b|\bmatch my bike\b/i},
 {screen:'Preferences',path:'Account → Preferences',purpose:'How BAK answers (saved to your account) and how this phone feels.',how:['Tap a segment; it saves at once. The two switches at the bottom are for this phone only.'],
  settings:[
   {name:'Units in BAK’s answers',what_it_does:'The units in every answer.',bak_can_change:true,options:[{label:'lb · psi · in',effect:'US units'},{label:'kg · bar · mm',effect:'metric units'}]},
   {name:'Answer length',what_it_does:'How much BAK says.',bak_can_change:true,options:[{label:'Quick',effect:'the fix and the number first, the why in a line'},{label:'Full',effect:'the fix, why it works, the trade-offs and what to try next'}]},
   {name:'How BAK talks',what_it_does:'The tone.',bak_can_change:true,options:[{label:'Straight shooter',effect:'direct and plain, no padding'},{label:'Encouraging',effect:'warmer and more patient, names what you’re doing right before the change; safety warnings never soften'}]},
   {name:'Vibration',what_it_does:'A light tap when you press things. This phone only.'},
   {name:'Reduce motion',what_it_does:'Fewer animations and pulses: loading shimmers and fades stop. This phone only; the phone’s own Reduce Motion is respected too.'}],
  bak_can_change:true,
  words:/\bpreferences?\b|\bunits?\b|\bmetric\b|\bimperial\b|\bpsi\b|\bbar\b|\bkg\b|\banswer length\b|\bquick (answers?|and full)\b|\bfull answers?\b|\bshort(er)? answers?\b|\blong(er)? answers?\b|\bhow bak talks\b|\btone of (the |bak.s )?answers?\b|\bstraight shooter\b|\bencouraging\b|\bvibrat(e|ion)\b|\bhaptics?\b|\breduce motion\b|\banimations?\b/i},
 {screen:'Notifications',path:'Account → Notifications',purpose:'Which notifications BAK sends. Saved to your account; turning one on is when the phone asks permission.',how:['Flip a switch. If notifications are off for BAK MX on the phone, “Open Settings” takes you there.'],
  settings:[
   {name:'New messages',what_it_does:'When a rider sends you a message.'},
   {name:'Comments on your posts',what_it_does:'When someone comments on your post.'},
   {name:'Event reminders',what_it_does:'The evening before and the morning of events you’re going to or interested in.'},
   {name:'Service due',what_it_does:'Within 3 hours or overdue, by the hours on your bike; once a week per job at most. Turns on when you set “Remind me when it’s due next” on a service.'}],
  words:/\bnotifications?\b|\breminders?\b|\bpush notifications?\b|\balerts?\b|\bservice due\b|\bevent reminders?\b/i},
 {screen:'Feedback',path:'Account → Feedback',purpose:'A wrong answer, missing data, a bug or an idea.',how:['Pick About (An answer · Missing data · Something broken · An idea · Other), write Details, Send feedback.'],
  words:/\bfeedback\b|\breport (a )?(bug|problem|wrong answer)\b|\bsuggest(ion)?\b|\bidea\b/i},
 {screen:'How BAK works and Supported bikes',path:'Account → How BAK works · Account → Supported bikes',purpose:'The one-minute guide to the app (with this Full guide under it), the 30-second tour, and which bikes BAK covers by year.',how:['Tap the row to open it.','“Take the 30-second tour” walks Home, Garage, Ask BAK and race day with a short card on each; Skip ends it any time. Home offers the tour once after your first bike; “No thanks” hides that for good.'],
  words:/\bhow bak works\b|\bsupported bikes?\b|\bwhich bikes\b|\bdoes bak (cover|support)\b|\bhelp (screen|page)\b|\bfull guide\b|\btour\b|\btutorial\b|\bwalk ?through\b/i},
 {screen:'Your data and legal',path:'Account → Your data and legal',purpose:'Export, privacy, terms and support.',how:['“Export my data” shares a file with your Garage, chats and logs. Privacy policy, Terms of service and Contact support open in your browser.'],
  words:/\bexport\b|\bmy data\b|\bprivacy\b|\bterms of (service|use)\b|\bcontact support\b|\bcustomer support\b|\bsupport (page|link|email)\b|\bgdpr\b/i},
 {screen:'Sign in, Sign in with Apple, Delete account and Sign out',path:'Sign-in screen · Account → Delete account · Account → Sign out',purpose:'Get into your account, leave for good, or just sign this phone out.',how:['Sign in with email and password, or on iPhone tap “Sign in with Apple” for Face ID and no password. Apple sign-in uses the email on your Apple ID: if a BAK account already exists under that email it signs you into it; choosing Hide My Email makes a new, empty BAK account instead, so riders with an existing account should use the same email or sign in with email. Forgot password sends a reset link to your email.','Delete account: cancel any subscription in the App Store first, type DELETE, tap “Permanently delete account”, confirm. It removes your Garage, conversations and service history and can’t be undone; export first for a copy. Sign out keeps your account.'],
  words:/\bdelete (my )?account\b|\bclose (my )?account\b|\bremove (my )?account\b|\bsign out\b|\blog ?out\b|\bsign.?in\b|\bpassword\b|\bapple (id|sign.?in|login)\b|\bface ?id\b|\bhide my email\b/i},
 {screen:'Widgets',path:'iPhone: Home Screen or Lock Screen → add widget → BAK MX · Android: Account → Home screen widget, or long-press the home screen → Widgets → BAK MX',purpose:'Your bike and your next event at a glance. iPhone also has live Lock Screen updates; Android shows race day and guided jobs as a pinned notification.',how:[
  '“Your bike”: hours, what service is next, your last setup change; with a race set, days to go and prep progress (when “Countdown on the widget” is on). Small, medium, Lock Screen rectangle and inline.',
  '“Next event”: the next event you’re going to, days until it, today’s race-day status. Small, medium, Lock Screen rectangle.',
  'Live on the Lock Screen and Dynamic Island: on race or practice day the next moto or session countdown, next checklist item and last thing logged; in a guided job, the step you’re on.'],
  words:/\bwidgets?\b|\block ?screen\b|\bdynamic island\b|\blive activit/i},
 {screen:'Siri and Shortcuts',path:'iPhone: say it to Siri, or add it in Shortcuts or the Action button · Android: long-press the BAK MX app icon',purpose:'Ask BAK and log things without opening the app first. Android has no Siri: long-press the BAK MX icon for Ask BAK, Snap a part, Log a change and Service log (drag one onto the home screen to keep it there).',how:[
  '“Ask BAK MX” / “Ask BAK MX a question” / “Ask BAK MX about my bike”: Siri asks “What do you want to ask BAK?” and the answer opens in Ask BAK.',
  '“Snap a part for BAK MX” / “Show BAK MX a part” / “Take a photo for BAK MX”: opens the camera into Ask BAK.',
  '“Log a setup change in BAK MX” / “Log a change in BAK MX” / “Add to my setup log in BAK MX”: asks “What did you change?” and opens a new setup log entry.',
  '“What’s due on my bike in BAK MX” / “Open my service log in BAK MX” / “Show my BAK MX service log”: opens the Service log.',
  '“Log how the track rode in BAK MX” / “Tell BAK MX how the track rode” / “Add a track report in BAK MX”: opens How did the track ride?. Siri also knows “Back MX” and “BAK”.'],
  words:/\bsiri\b|\bshortcuts?\b|\baction button\b|\bhey siri\b|\bvoice assistant\b|\blong.?press\b|\bapp icon\b/i},
];

/** One entry as compact text for Ask BAK's input. */
function entryText(e:AppGuideEntry):string{
 const settings=(e.settings??[]).map(s=>`${s.name}: ${s.what_it_does}${s.options?' '+s.options.map(o=>`${o.label} = ${o.effect}`).join('; ')+'.':''}${s.bak_can_change?' [BAK can switch this]':''}`).join('\n  ');
 return `## ${e.screen} (${e.path})${e.bak_can_change?' [BAK can change this for the rider]':''}\n${e.purpose}\n${e.how.join('\n')}${settings?'\nSettings:\n  '+settings:''}`;
}
/** The whole guide, or the given entries, as compact text. */
export function appGuideText(entries:AppGuideEntry[]=APP_GUIDE):string{return entries.map(entryText).join('\n\n');}
/** The index: screen names and one-line purposes, so BAK can point the rider to the right place. */
export function appGuideIndex():string{return APP_GUIDE.map(e=>`${e.screen} (${e.path}): ${e.purpose}`).join('\n');}

const ASKING=/\b(how (do|can|would|should|could) (i|you|we|bak)|how to|where('s| is| are| do| can| would)|what('s| is| are| does| do| did)|whats|which|explain|tell me (about|how|what)|difference between|turn(ing)? (it |them |this |that )?(on|off)|switch(ing)? (it |them |this |that )?(on|off)|can (you|bak|i)|is there (a|an|any)|do (you|i) have|does (the app|bak|it) have|what for|mean)\b/i;
/** Words that only make sense about the app itself: screens, settings, options and their everyday names. */
const APP_WORDS=/\b(app|tour|tutorial|walk ?through|garage|account|sign.?in|log ?in|password|face ?id|apple id|settings (screen|page|tab|card|button)|garage settings|app settings|phone settings|in settings|widgets?|siri|shortcuts?|action button|notifications?|reminders?|push notifications?|plans?|subscription|subscribe|premium|pro (plan|tier|feature)|upgrade (my )?plan|credits?|credit packs?|restore purchases?|profile|handle|posts?|comments?|events?|rsvp|messages?|inbox|dm|feedback|home (screen|tab|page)|edit home|on home|up next|chat|ask bak|build sheet|add (a |some )?photos?|bike photos?|photos? (tab|of (my|the) bike)|attach(ing)? (a )?photos?|send (a |you )?photos?|upload (a )?photos?|public (garage|build sheet)|show (this|my) bike on my profile|block(ing)? (a |someone|this |that |the )?(rider|user|them|him|her|someone)|unblock|report(ing)? (a |this |that |the )?(post|comment|rider|user|someone|event)|tuning notes?|save to bike|setup log|service log|maintenance|workshop|guided jobs?|hands.?free|voice|hey bak|specs?|parts catalog|know.?how|setup guide|race mode|practice ?day|race ?day|race prep|checklist|fuel plan|sweat test|starting setup|coaching|(riding|video|a|the|my|your) clips?|units?|metric|imperial|answer length|quick (answers?|and full)|full answers?|short(er)? answers?|long(er)? answers?|how bak talks|tone of (the |bak.s )?answers?|straight shooter|encouraging|vibrat(e|ion)|haptics?|reduce motion|animations?|dark mode|light mode|app colou?r|colou?r (of the app|scheme|theme)|change the colou?r|accent colou?r|theme|bak blue|match my bike|delete (my )?account|close (my )?account|sign out|log ?out|export|my data|privacy|terms of (service|use)|contact support|customer support|support (page|link|email)|supported bikes|how bak works|full guide|lock ?screen|dynamic island|calculators?|track report|camera|something.s wrong|handling problem|switch bikes?|add (a |another |my |second )?bike|nickname|engine hours|hours on (the|my) bike|vin|delete (a |my |the |this )?bike)\b/i;
/** Pure bike talk: a question with one of these and no app word is about the machine, not the app. */
const BIKE_ONLY=/\b(rebound|compression|clickers?|sag|air screw|jet(ting|s)?|needle|springs?|fork|shock|tire|tyre|psi|valves?|torque|oil|chain|gearing|sprockets?|map|clutch|brakes?|engine|carb|bog|headshake|ruts?|whoops|corners?|turns?|the bike|my bike|front end|rear end)\b/i;

/** True when the rider is asking about the app itself (a screen, a button, a setting), not about the motorcycle. */
export function isAppQuestion(message:string):boolean{
 const m=(message??'').trim();if(!m)return false;
 if(!ASKING.test(m))return false;
 if(!APP_WORDS.test(m))return false;
 // "how do I set my sag" has a bike word and no app word; it never gets here. A bike word beside an app word is an app question.
 return true;
}
/** The guide sections for a question about the app, or the index when it is an app question nothing matches. Null when it
 *  is not an app question at all (a bike question never gets the guide). */
export function appGuideFor(message:string):{sections:AppGuideEntry[];index:boolean}|null{
 if(!isAppQuestion(message))return null;
 const m=message.trim();
 const hits=APP_GUIDE.filter(e=>e.words.test(m));
 if(hits.length)return {sections:hits.slice(0,4),index:false};
 return {sections:[],index:true};
}
/** Text for Ask BAK's input: the matching sections, or the index. */
export function appGuideTextFor(message:string):string|null{
 const r=appGuideFor(message);if(!r)return null;
 return r.index?'No single screen matches. The index of screens:\n'+appGuideIndex():appGuideText(r.sections);
}
// BIKE_ONLY is exported for tests and for the chat gate; a message that matches it and not APP_WORDS is a bike question.
export const isBikeOnly=(message:string)=>BIKE_ONLY.test(message)&&!APP_WORDS.test(message);
