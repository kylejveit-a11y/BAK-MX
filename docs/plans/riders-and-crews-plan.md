# Riders and crews: plan (2026-11-16)

Kyle's asks: open a rider's profile from anywhere their name shows, look riders up, a way to connect that isn't a
Facebook/Instagram copy, and maybe groups.

## Already done (server live now, app in the next build)
- Tapping a commenter's photo or name, an event host ("Hosted by …"), or "View profile" in a message thread opens their
  profile. Post authors, "Liked by" and "Going" already did.
- Ride safety emails use the rider's own name ("Kyle"), set privately on the Ride safety card, not the community name.

## What's there today
- Every signed-in rider can see every profile (photo, name, @handle, location, class, bio, race number, public garage,
  last 20 posts). Blocking hides both ways. Report and block exist on posts, comments, profiles and messages.
- No profile search, no visibility setting, no connections, no groups.

## Phase A: find riders, and choose who sees your profile (small)
- Search riders on the Community tab: by name, @handle, location or bike ("KTM 250", "Dade City"). Blocked riders never show.
- Profile visibility in Account › Profile, two choices:
  - Everyone on BAK (default): shows in search, full profile.
  - Only riders I ride with: hidden from search. Others see your name, photo and posts in the feed (those were posted
    publicly), but not your bio, location or garage.
- "Riders near you" row in search (same location text), so search isn't empty on day one.

## Phase B: "Ride with" (our own word for following)
- Button on a profile: **Ride with**. Once tapped: **Riding with ✓**. One-way: no request needed for an Everyone profile;
  an "Only riders I ride with" profile gets a request to approve.
- Two riders who ride with each other are **Riding buddies** (shown with a small two-helmet mark).
- What it gives you:
  - Community feed filter: **All · Riders I ride with · Local**
  - A heads-up when a rider you ride with posts an event or is riding at a track today (uses "I'm riding here today").
  - Profile counts: "Rides with 14 · 22 ride with them" (tap to see the lists).
- Ride safety stays separate: contacts are people you choose by phone/email, not BAK connections.

## Phase C: Crews (groups)
Worth it, because riders already ride in crews: a practice-day group, a race team, a family, a track's regulars, a
dealer's group. Kept focused so it doesn't turn into a second Facebook:
- **Crew page**: name, photo, home track, About, members, and the crew's own posts and events.
- **Kinds**: Open (anyone can join, shows in search), Ask to join (leader approves), Invite only (hidden; invite link).
- **Crew events**: post a ride day just to the crew; RSVPs and the "who's going" list work as they do now.
- **Crew ride day board** (the BAK part no other app has): on a day the crew is at a track, members see each other's
  check-ins and, if they choose, setup changes ("Jake went 2 clicks softer on rebound, said better").
- **Roles**: leader, helpers (can approve and remove), members. Report and block work in crews like everywhere else.
- Later, only if crews get used: a crew chat. (Chat is the hardest part to keep clean; start with posts and events.)

## Names (to pick)
- Following → "Ride with" / "Riding with", mutual → "Riding buddies". Alternatives: "Line up with", "Pit with".
- Groups → "Crews". The event filter now called "Find your crew" would become "Find your ride" so "crew" means one thing.
  Alternatives for groups: "Pits", "Squads", "Teams".

## Apple and safety notes
- Search, Ride with and Crews are all user-generated content: report, block and filtering must reach them (rule 1.2).
- Nothing about a rider's location is shared through Ride with or Crews except what they already chose to show
  ("I'm riding here today", events).
- Minors: no change to sign-up age rules; crews are visible to members only unless Open.

## Order and size
A (search + visibility) → B (Ride with + feed filter) → C (Crews). A and B fit one build; C is its own build.
