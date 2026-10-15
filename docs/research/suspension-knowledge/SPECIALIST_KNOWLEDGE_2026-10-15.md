# Specialist suspension knowledge, 2026-10-15

Request: build BAK MX into the best suspension tuning assistant by learning from the suspension companies and, above all, from the
specialists (tuners and testers) whose articles and descriptions carry the real working knowledge; bike makers are vague. The owner
named Keefer, JBI, Race Tech, Technical Touch, REP and "Suspension 4 Play", and Keefer's pieces on talking to your suspension tuner.

## What was done

Four research passes read public pages only (no paywalls bypassed), paraphrased in our own words with at most one short quote per record:

| Slice | File | Records |
|---|---|---|
| Suspension makers' own documentation | `specialist/makers.json` | 47 |
| Tuners and testers | `specialist/tuners.json` | 119 |
| Differential diagnosis and test method | `specialist/diagnosis.json` | 70 |
| Rider-to-tuner communication, vocabulary, intake forms, test logs | `specialist/communication.json` | 86 |

115 distinct sources. Most-used: Motocross Action (15), Motocross Action Magazine (12), Vital MX forum (12), Keefer Inc Testing (10), Race Tech (8), WP Suspension (7), Keefer, Inc. Tested (5), Teknik Motorsport (4), PulpMX (4), Vital MX (4), Keefer Inc. Testing (4), Dirt Bike Test (3).

## What BAK now knows (shared/setup-knowledge.ts, mx-setup-2)

All of it is written in BAK's own words, as direction only, with no numbers (bike-specific figures still come only from verified evidence),
and is presented to riders as "what suspension tuners and testers commonly find", never as a named person's or company's advice.

| Block | Built from |
|---|---|
| `workOrder`: spring or air for weight, sag and static sag, balance, clickers last; when to stop clicking | Tuners (Keefer, MXA, German race tuners), Öhlins fork manual setup order |
| `triageQuestions`: on/off the gas, corner area, bars or pegs, first hit or series, bounce off or sink, kick direction, rear high or low, stiff or deep, hot, after a change | Keefer "On or Off Throttle?" (2025), Bones Bacon (Pro Circuit) questions, Slavens kick direction, MXA packing |
| `symptomGuides`: 17 complaints, each with the competing causes, the tell that separates them, the first change, the question that decides, and the common wrong move | Diagnosis slice (38 sources), tuner records, the existing BAK rules |
| `mechanicalMimics`: 11 faults that feel like setup problems, with how to check | Race Tech installation/binding notes, MXA, Keefer, linkage and seal maintenance records |
| `airForkRules`, new adjusters `fork_air_pressure` and `fork_oil_level` | Keefer, MXA, WP product material, Factory Connection customer reports, Yamaha and Kawasaki manuals (oil level) |
| `whenClickersRunOut`: signs the fix is springs, oil volume or valving | Keefer (2026 YZ450F), Enzo, Pro Circuit, REP revalve stories |
| `conditions`: sand, hard pack, loam, rocks, ruts, mud, tight, fast, heat, rider weight and pace | WP via Transmoto, Ping, Slavens, Keefer, MXA |
| `vocabulary`: 15 rider terms, what they mean and what to ask | Keefer "Suspension Terms Explained" (2020-2024), communication slice glossary |
| `talkingToYourTuner` | Keefer, Enzo work form, Pro Circuit, Bones Bacon |
| `openQuestions`: where specialists disagree and how BAK handles it | Disagreement lists of all four slices and the OEM cross-check |

Ask BAK (prompt mx-engineering-16) is told to reason the way a tuner does: map the words, use the tells, ask the one separating question
when causes point opposite ways (or give both branches), follow the work order, flag mechanical mimics first, one small change at a time with a
test method, say when clickers have run out, and use the bike maker's table as the starting direction for stock suspension unless the rider's
tells point to another cause. The Setup guide page shows the deciding question and the common wrong move per symptom, plus two new tabs:
"Not a setting" (mechanical mimics) and "Your tuner" (work order and how to talk to a tuner).

## The two open setup-rule decisions

Both are now handled as differential diagnosis rather than a single winner, as the owner described ("different adjustments get the same
result for different reasons"):

- **Rear kick over braking bumps** (Kawasaki: rebound too fast; BAK: high-speed compression too firm). Specialists split it by the kick:
  straight up after one big hit = rebound too fast (slower); sideways off square edges, rocks, roots = compression too firm (softer HSC);
  building through the series = packing (faster rebound); also bottoming = too soft (more compression).
- **Poor rear grip** (Yamaha: faster rebound, firmer compression; Kawasaki: shock too stiff, softer). Split by what the rear does: skips and
  chatters, riding high = too firm (softer, high-speed first if it rides high, then sag); squats and wallows as grip fades = too soft
  (firmer); grip fading through a series = rebound too slow (faster); spins on smooth ground too = power delivery.

Confirmed by Kyle on 2026-10-15.

## Tester baselines (private reasoning context), 2026-10-15

`specialist/baselines.json`: 156 published tester baseline settings (fork and shock spring or air, clickers, fork height, sag, with rider
weight, pace and conditions where given) for 122 bike-years, mostly Keefer Inc Testing and MXA, with sources. Kyle's direction: use them for
knowledge and logic, not rider-facing. `scripts/suspension/build_tester_baselines.py` writes `server/tester-baselines.ts` without source
names; Ask BAK receives the exact bike's entries (or the nearest model year, marked) as `tester_baselines_private`, is told never to state
the numbers or attribute them, and a reply that names a tester or magazine is treated as a rule break and repaired. Gaps: 250/300 XC,
250 XC-F, FC 350, FX 350, MC 125, MC 350F, CRF450RX, KX250X, TF 450-RC, and most 2027 bikes.

## Guided handling-problem intake, 2026-10-15

Ask BAK's start screen offers "Handling problem?": tap the complaint (front end, rear end, over bumps), the deciding question from that
symptom guide, on or off the gas, where on the track and the dirt, then an optional note. Every step has "Type it myself"; the result is
written into the message box in plain rider language for the rider to edit and send (`shared/triage.ts`, `src/Triage.tsx`).

## Disagreements kept (selection)

- (makers) **Linkage/fork stiction threshold in sag readings**: src-rt-sag: More than 4-5 mm difference means the linkage needs attention; src-rt-sag-1995: Rear under ~3 mm good, over ~10 mm bad; forks under 15 mm good
- (makers) **Rear rider sag on full-size MX bikes**: src-rt-springs-pdf: 95-110 mm (30-33% of travel); src-teknik-offroad: 100 mm +8/-3; KTM PDS 110 mm (start 105, range 90-110); src-transmoto-clickers: about 30% of total travel
- (makers) **Interpreting static (free) sag**: src-teknik-offroad: Lists both 'static sag below minimum' and 'static sag above maximum' (with rider sag correct) as spring too soft, which looks internally inc; src-ohlins-rxf48s: If free sag is near recommended limits at nominal sag, change spring rate (no direction given in extraction)
- (makers) **How to fix front bottoming**: src-teknik-offroad: Raise fork oil level in 5 mm steps (and increase compression); src-ohlins-rxf48s: Add fork fluid in 10 ml steps, and also look at rear spring/weight balance first
- (makers) **Fork coil preload amount**: src-teknik-offroad: Normally 3-14 mm; src-rt-aer48-scs: 3-5 mm for its AER48 coil conversion; src-ohlins-rxf48s: Example 10 mm; below 0 mm is wrong
- (makers) **WP air-fork weight saving and chamber layout claims vary between releases**: src-wp-aer48-2015: AER 48 saves about 3 lb; single 34 mm chamber with bypass; src-wp-procomp-2019: XACT PRO AER saves up to 1 kg; two separate chambers; src-wp-xplor7448-2021: Air spring saves 2.2 lb vs steel spring; src-mxa-xact-2019: XACT Air about 3.6 lb lighter than XACT Spring (magazine figure)
- (makers) **Does Cone Valve eliminate or reduce shims**: src-wp-procomp-2019: Shims are eliminated; src-wp-xplor7448-2021: Reduces the number of damping shims; src-mxa-xact-2019: Replaces the mid-valve shim stack with a tapered cone held by a coil spring; three optional cones
- (tuners) **Which events are 'high-speed' compression**: src-mxa-10things-2015: Jump faces, landings, medium bumps and rollers are low-speed events; small quick stutter bumps are high-speed.; src-keefer-dummies-2024: HSC governs g-outs and jump faces and ride height; LSC governs rolling whoops and acceleration bumps.; src-mxa-10things-2020: High speed means shaft speed; HSC is the tool for g-outs and square edges.
- (tuners) **How big a clicker step to take**: src-mxa-10things-2015: One click is often too small to feel; go big, then narrow down.; src-keefer-tips-2025: 1-2 clicks at a time, one circuit at a time; KYB may need 2 clicks to feel.; src-vital-maeda-2016a: Learn the bike well enough to know whether 2 clicks or 10 are needed.
- (tuners) **Bike feels too stiff: go softer or stiffer?**: src-mxa-10things-2020: Often it is too soft and riding in the harsh part of the stroke; add compression.; src-mxa-finetune-2022: 'Softer is stiffer': stiff-feeling forks often need to be stiffer.; src-vital-robbrown-2024: If the bike feels too stiff it probably needs to be softer; if rebound seems to need slowing, it probably needs speeding up.
- (tuners) **First move for a kicking rear end**: src-mxa-10things-2015: Try more compression before more rebound.; src-keefer-tips-2025: Usually compression too stiff; try 1-2 clicks softer compression first, then body position or faster rebound.; src-slavens-2019: Depends on direction: sideways kick = too much (HS) compression; straight-up kick after big hits = too little rebound.; src-vital-rmz-rebound: Forum view: kick off jump faces often too little HSC; others blame dry linkage or nitrogen.
- (tuners) **Role of air pressure in tuning air forks**: src-mxa-airapparent-2021: Set and forget; pressure is the spring; tune with damping.; src-keefer-adjguide-2021: Stay within ~1 psi of stock (2025 text: 0.2-0.4 bar); clickers are easier.; src-mxa-ktm450-advice-2024: Find the right pressure first using the sag ring, adjust a couple of psi; MXA publishes pressures well spread by skill (138-158 psi).; src-vital-fc-aer-2018: FC customers run much lower pressure with more oil to make the fork ride deeper like a coil fork.
- (tuners) **Air forks vs coil forks**: src-mxa-bones-air-2018: Good concept but too complex and inconsistent for average riders; consumers revolted back to coil.; src-vital-maeda-2016a: Personally likes KYB PSF air for tunability, but air forks don't belong on production bikes because the public won't do what's needed.; src-vital-robbrown-2024: A trade-off: some riders hate checking pressure, heavy riders like not buying springs.; src-mxa-ktm450-2021: The newer WP XACT air fork tracks like a coil fork with little lift-off.; src-keefe
- (tuners) **Bottoming: which compression circuit**: src-keefer-tips-2025: More than 1-2 bottoms a lap: stiffen (low-speed) compression.; src-mxa-ktm450-advice-2024: When unsure, MXA testers adjust high-speed compression rather than low-speed.; src-keefer-kreft-2020: Used fork oil volume (+15 ml) instead of more damping to keep initial plushness.
- (tuners) **Race sag target**: src-mxa-spring-2016: About 100mm as a starting point.; src-mxa-10things-2020: Typically 100-105mm; MXA doesn't go below 105mm; >110mm hurts geometry.; src-keefer-250-2026: 105mm on Japanese 250s, 102-103mm on WP-equipped 250s.; src-transmoto-sand-2019: WP: 112-116mm for fast sandy tracks.; src-dbt-yz450fx-2025: 100mm best with the shortened FX shock, equivalent to 106-108mm on a standard shock.
- (tuners) **How long break-in takes**: src-mxa-breakin-2018: At least two hours for any fork and shock.; src-keefer-250-2026: 6-7 engine hours for 2026 WP AER forks.
- (tuners) **Rider speed and stiffness**: src-keefer-tips-2025: Faster riders prefer stiffer, slower riders softer.; src-vital-maeda-2016a: Sensitivity to suspension doesn't track speed; he works out each rider individually.
- (tuners) **Brand click sensitivity (Keefer vs Keefer)**: src-keefer-tips-2025: Showa and WP: one compression click is enough; KYB needs two.; src-keefer-fork-ar-2021: Showa one click; WP and KYB two clicks.
- (diagnosis) **Kicking: rebound or compression first?**: src-mxa-20steps-2013: Kicking comes from incorrect rebound, not compression; src-mxa-setup-2015: Four possible causes; rule of thumb is to try more compression before more rebound; src-keefer-tips-2025: Bucking is often from compression that is too stiff, so try softer compression first; kicking on jump tops is hard to diagnose, so test both; src-slavens: Straight-up kick means rebound too fast; sideways kick means too much compression or packing
- (diagnosis) **What is a high-speed vs low-speed event**: src-keefer-guide-2021: LSC handles slow movement such as rollers and acceleration bumps; HSC handles fast hits such as G-outs and jump faces, and sets ride height; src-mxa-setup-2015: Jump faces, landings, medium bumps and rollers are low-speed shock movement; small stutter bumps drive high-speed movement
- (diagnosis) **Clicker step size**: src-keefer-tips-2025: 1-2 clicks, one adjuster at a time; src-mxa-setup-2015: Go big enough to feel; one click is hard to notice; fine-tune later; src-racerx-ping-2017: Make large changes to find the direction; src-redbull-2023: 2-3 clicks; src-slavens: 2 clicks; HSC 1/4 to 1/2 turn
- (diagnosis) **Which end to tune first**: src-mxa-20steps-2013: Shock first, then forks; src-redbull-2023: Front first; src-racerx-ping-2017: Whichever end bothers you most
- (diagnosis) **Free or static sag spring check range**: src-mxa-20steps-2013: More than 35mm suggests the spring is too stiff; none suggests too soft; src-mxa-finetune-2022: 30-40mm on big bikes; over 40 too stiff, under 30 too soft; src-racetech-sag: Uses 'static sag' to mean sag with the rider on board and 'free sag' for bike only, which conflicts with MXA's use of 'static sag' for bike-
- (diagnosis) **Maximum useful rider sag**: src-mxa-dialing-2020: Sag above 110mm alters geometry undesirably; MXA does not go below 105mm; src-transmoto-sand-2019: WP: 112-116mm for fast sandy tracks; src-mxa-10sag: Typical 97-105mm; a sandy, open track might run 110mm
- (diagnosis) **How to measure sag**: src-racetech-sag: Rider stands on the pegs, no helper holding the bike, no bouncing; average the push and lift readings; src-mxa-10sag: Rider in riding position with a helper steadying the bike; bounce to settle; src-mxa-finetune-2022: Measure standing; bounce first; be consistent; src-redbull-2023: Rider sits in riding position and bounces
- (diagnosis) **Measure sag warm or cold**: src-mxa-20steps-2013: Set race sag after practice when possible, because hot and cold read differently; src-redbull-2023: Let the engine cool before measuring sag
- (diagnosis) **Steering head bearing preload**: src-mxa-headshake-2025: Loosest acceptable setting; tighter as a steering damper is not required; src-mxa-finetune-2022: Set it so the front needs a slight push to fall, using it as a mild damper
- (diagnosis) **Air fork pressure handling**: src-keefer-guide-2021: Stay within about 1 psi of factory unless very light or heavy; check cold; src-keefer-tips-2025: Work in bar; stay within about 0.2-0.4 bar of factory; about 2 psi is one spring step; check cold; src-mxa-airheat-2022: Set about 4 psi below target cold so it reaches target hot, or start slightly under-sprung
- (diagnosis) **Does fork height help turning?**: src-racetech-forkinstall: Lowering the front end usually does not improve turning; src-mxa-dialing-2020: Raising the fork tubes steepens the head angle and quickens turning; a few mm is noticeable; src-vital-ruts-2018: Forum poster KurtJ99: fork height makes little difference
- (diagnosis) **Rear axle position and front weight**: src-vital-tuck-2020: Forum split: one poster says a shorter wheelbase moves weight forward and makes the fork feel softer; another says moving the wheel forward ; src-keefer-chain-2021: A shorter swingarm length improved front traction out of corners and reduced squat; src-mxa-finetune-2022: Axle forward makes the shock feel stiffer; back makes it feel softer

## Who JBI and Suspension 4Play are

- JBI is Ride JBI (J.B. Covington): Pro Perch spring seats with pressure-sensitive shims for twin-chamber KYB, Showa and WP forks, and a DIY
  kit for the WP XACT air fork. Its own site did not load from here.
- "Suspension 4 Play" was not found under that name (four searches). Kyle: a link, town or social handle is needed.

## Gaps and work not done

- (makers) No official WP XACT air fork pressure-by-rider-weight table found on WP's own site (wp-suspension.com redirects to wp-group.com, which was blocked); such tables appear to live only in KTM/Husqvarna/GasGas owner's manuals (already held) and WP authorized-center data.
- (makers) No maker statement found on air-pressure change with temperature for XACT/TAC/PSF forks; only magazine and forum content.
- (makers) No WP-published service-interval hours for XACT forks/shocks.
- (makers) KYB: no public KYB America/Europe MX tuning guide; KYB Europe site has only corporate/history and service-parts pages. Enzo Racing site content not reached.
- (makers) Showa: no Showa-published MX tuning guide, A-kit setup doc, or BFRC MX info found; Pro Circuit Showa flyer PDF failed to download.
- (makers) Öhlins: TTX Flow MX owner's manual and mounting-instruction PDFs are listed on product pages but their URLs were not exposed; spring-rate-by-rider-weight tables not obtained. RXF48S content came via a third-party text extraction, service-interval-to-task mapping unreliable.
- (makers) Factory Connection, Pro Circuit, MX-Tech, Smart Performance, Technical Touch: no official tech-tip pages surfaced in search.
- (makers) Xtrig ROCS/PHDS and preload adjuster, Luxon MX preload/bleeders, Works Connection/Ride Engineering holeshot instructions: no maker setup instructions found; only retailer listings.
- (makers) No maker description of worn-oil, worn-bushing or low-nitrogen 'feel' found beyond Race Tech bumper/bladder notes.
- (makers) Race Tech DVS setup sheets (where actual clicker/preload numbers live) require an access code.
- (tuners) 'Suspension 4Play / 4Play' could not be identified after four targeted searches; no shop of that name surfaced. Ask the owner for a URL, location or social handle.
- (tuners) JBI identified as Ride JBI (ridejbi.com, J.B. Covington) but its own site could not be fetched, so its current XACT air-fork DIY kit claims are only known second-hand from forum posts.
- (tuners) Race Tech primary tech articles (Paul Thede columns) not retrieved; the Vital seminar write-up has almost no tuning specifics, and old.racetech.com 'Shocking' is a 1994 road-bike piece (not recorded).
- (tuners) No first-party tech pages found for Factory Connection, Pro Circuit (beyond Bones columns), Technical Touch USA, Smart Performance, Cannon Racecraft, GPR, AEO (other than shop background), MX-Tech, PEP.
- (tuners) Keefer's 'Action And Reaction (Shock)' companion article not found.
- (tuners) Swapmoto Live (Ross Maeda) and This Week in MXA (Bones Bacon) are video-only; no transcripts read.
- (tuners) Dirt Bike magazine (dirtbikemagazine.com) setup columns, Dirt Action and Racer X tech pieces were not reached.
- (tuners) Little second-hand material on ruts specifically, on Showa coil (Honda/Kawasaki 2021+) internals, or on Triumph TF KYB behaviour beyond Keefer baselines.
- (tuners) Few tuner statements on temperature effects on shock damping beyond Keefer's shock-fade tell and air-pressure heat rise.
- (diagnosis) No motocross-specific source found on checking shock nitrogen pressure or what a low charge feels like (search hits were car and mountain-bike sources).
- (diagnosis) No source found on spoke tension or wheel bearing condition as a mimic of suspension faults.
- (diagnosis) No step-by-step check for fork bushing wear (play test) from a specialist source.
- (diagnosis) No source gives a numeric threshold for when to stop clicking and revalve; only qualitative signals.
- (diagnosis) There is little on cold-weather effects (thicker oil) for motocross; heat effects are better covered.
- (diagnosis) Triumph TF and Yamaha/Honda/Kawasaki-specific air or coil fork differences were not covered beyond brand click sensitivity (Showa vs WP/KYB).
- (diagnosis) Terminology risk: 'static sag' means rider sag at Race Tech but bike-only sag at MXA. 'Sag too high/low' in Keefer and MXA refers to rear ride height, not the mm number. The app should normalize terms.
- (diagnosis) Linkage-bearing symptom claims come from a bearing vendor (Factory Links), which has a commercial interest. The Transmoto linkage diagnosis article body was not accessible.
- (diagnosis) src-pulpmx-mechanics-2024 duplicates Keefer's framework; do not count it as independent agreement.
- (diagnosis) Several Keefer tables (on/off throttle and action/reaction) dominate the symptom mapping. More independent tuner sources (Enzo, GPR, Stillwell, Factory Connection technical staff, Race Tech book) would strengthen it.
- (diagnosis) Mud setup is thin: only Ping's compression advice and MXA's tire pressures.
- (communication) No source gave a number of rides/hours before judging a revalve, or a standard tuner re-valve policy beyond Race Tech's stated guarantee.
- (communication) No MX tuner source defined 'buck', 'pogo', 'spiky', 'chopper', 'dead', 'settle', 'wheel tracking' or 'front-end feel' explicitly.
- (communication) Only one full MX tuner intake form obtained (Enzo); Pro Circuit model-specific form PDFs not opened.
- (communication) First-hit vs series distinction is covered by packing articles but no source framed it as an explicit question to ask.
- (communication) Bylines on MXA 'Bare Bones' pages conflict with page metadata (Bones Bacon vs Jody Weisel/Tom Hinz).
- (makers) Fetch wp-group.com pages (blocked by permission timeout) for WP knowledge/FAQ/service content.
- (makers) Retrieve Öhlins TTX Flow MX owner's manual and mounting-instruction PDFs (need direct download URLs; try ohlins.eu product page 'Documents' links in a browser).
- (makers) Read Teknik 'Free Suspension Setup Tips' and 'Using Your Clickers' web articles (page bodies did not render via fetch).
- (makers) Search Enzo Racing, Factory Connection, MX-Tech, Smart Performance and Technical Touch sites directly (WebFetch of their domains not attempted).
- (makers) Find Showa A-kit/SFF coil fork technical bulletins and KYB A-kit setting manuals.
- (makers) Find Xtrig, Luxon, Works Connection, Ride Engineering official instruction sheets (likely PDFs on their own domains).
- (makers) Race Tech 'Motorcycle Suspension Bible' is a paid book (paywalled) and was not consulted.
- (makers) Beta's '2023 KYB Fork Set Up' PDF (betausa.com) surfaced but is a bike-maker document, so out of scope; may still be useful for KYB SSS hardware.
- (tuners) Fetch ridejbi.com (blocked in this session) for JBI's own air-fork kit explanation.
- (tuners) Find Suspension 4Play with owner-supplied details.
- (tuners) Race Tech: racetech.com tech articles / Suspension Bible excerpts; Paul Thede Dirt Rider / Racer X columns.
- (tuners) Factory Connection, Technical Touch, Smart Performance, Cannon Racecraft, GPR, MX-Tech, PEP Suspension own blogs/FAQs.
- (tuners) Keefer 'Action And Reaction (Shock)', more Keefer revalve tests (Factory Connection, Pro Circuit, Technical Touch).
- (tuners) MXA 'Ask the MXperts' items on Showa coil forks (2021+ CRF450R/KX450) and on rear kick diagnosis.
- (tuners) Transcripts of Swapmoto Live / Bones Bacon video lessons.
- (diagnosis) Race Tech's Motorcycle Suspension Bible (paid book) was not read; it likely holds the deepest symptom tables.
- (diagnosis) Bones Bacon's MXA video lesson (This Week in MXA ep. 47) was not transcribed; the page has no text content.
- (diagnosis) Transmoto 'How-To: Diagnose & Grease Linkage Bearings' full text not retrieved (intro only).
- (diagnosis) Vital MX threads not read: 'Help w/ Washing the Front End', 'SFF Tuning tips', 'Twitchy front end solutions', 'Whats the deal with fork sag'.
- (diagnosis) The WP suspension troubleshooting guide referenced on ukgser (adventure-bike context) was not read.
- (diagnosis) Penske nitrogen charging blog (road racing) was not read.
- (diagnosis) MXA 'Suspension Tech' index, 'Bathroom faucet principles', 'Head-shake & the poor man's steering damper' and 'Fork oil height is the magic bullet' were not read.
- (diagnosis) No ThumperTalk, Enzo, GPR, Stillwell, Pro Circuit or Factory Connection technical pages were found; searches for those tuners returned no relevant pages.
- (diagnosis) Search budget used: about 44 web searches plus 40 page fetches.
- (communication) Keefer podcast 'RMATVMC Show #333: Dissecting Your Suspension And Relaying That To Your Suspension Tuner' (2023-05-31) - fetch blocked: https://www.keeferinctesting.com/rmatvmc-show-333-dissecting-your-suspension-and-relaying-that-to-your-suspension-tuner/
- (communication) Keefer 'Helpful Suspension Set Up Tips' 2021 version - fetch blocked (2025 version read instead)
- (communication) MX-Tech site - fetch blocked; Factory Connection site - fetch error
- (communication) REP Suspension, Race Tech, Smart Performance, Technical Touch intake forms or tips pages - not found via search
- (communication) Swapmoto, Transmoto, Dirt Bike magazine pieces on talking to a tuner - not found
- (communication) Pro Circuit model-specific service form PDFs - not opened
- (communication) Search budget (about 34 searches) used

## Use and rights

Records are paraphrases with source, URL and date, for building and checking BAK's own rules. They are not loaded as evidence and the model
never sees source names. Quotes stay at one short line per record. Keefer's baseline settings and MXA's pressure tables are bike- and
rider-specific numbers: they stay in the research files and are not given to riders until reviewed and attributed properly.

## Sources

| Organisation | Author | Title | Date | Type | Slices |
|---|---|---|---|---|---|
| ADAC MX Masters | ADAC (unnamed) | [The Suspension Whisperers: In Search Of The Perfect Set-Up](https://www.adac-motorsport.de/en/adac-mx-masters/news/2026/the-suspension-whisperers-in-search-of-the-perfect-set-up/) | 2026-07-29 | magazine | tuners |
| ASV Inventions | ASV Inventions | [Using a Hole Shot Device for Your Dirt Bike](https://asvinventions.com/asv-news/using-a-hole-shot-device-for-your-dirt-bike/) | 2023-06-28 | aftermarket_maker | makers |
| Australasian Dirt Bike | ADB (tech ed Mat Boyd) | [How To Set Air Fork Pressure](https://adbmag.com.au/editorial/how-to-set-air-fork-pressure/) | 2020-10-09 | magazine | diagnosis, tuners |
| Bikerumor | Tyler Benedict | [Suspension Tech: How Much Air Do You Lose Disconnecting a Shock Pump?](https://bikerumor.com/2018/10/11/suspension-tech-how-much-air-do-you-lose-disconnecting-a-shock-pump/) | 2018-10-11 | magazine | diagnosis |
| Bikesport NZ | Bikesportnz editor (interview with Richi | [The Dark Science](https://www.bikesportnz.com/?p=26309) | 2015-01-16 | tuner | tuners |
| Dirt Bike Test | Trevor Hunter | [2024-2025 YZ450FX Chassis Setup Tips](https://dirtbiketest.com/fresh-dirt/2024-2025-yz450fx-chassis-setup-tips/) | 2025-03-27 | tester | tuners |
| Dirt Bike Test | Jimmy Lewis | [Motion Pro Micro Bleeders](https://dirtbiketest.com/product-tests/motion-pro-micro-bleeders/) | 2021-10-11 (last modified) | tester | diagnosis |
| Dirt Bike Test | Trevor Hunter | [Pro Circuit Suspension Mod for YZ250FX](https://dirtbiketest.com/product-tests/pro-circuit-suspension-mod-for-yz250fx/) | 2017 (photos June 2017; page modified 2021-10-11) | tester | tuners |
| Dirt Rider | Jimmy Lewis with Jim 'Bones' Bacon (Pro  | [Dirt Bike Suspension Tuning Tips](https://www.dirtrider.com/features/protips/riding/141_0702_suspension_tuning) | 2009-02-24 | magazine | communication, tuners |
| DirtBikeTest.com | Brent Farrell | [AHM Factory Services Suspension Revalve](https://dirtbiketest.com/product-tests/ahm-factory-services-suspension-revalve/) | 2021-09-30 (last-modified; no publish date shown) | magazine | communication |
| Electric Dirt Riders forum |  | [Suspension - JBI? Enzo?](https://electricdirtriders.com/posts/55072/) |  | forum | tuners |
| Enzo Racing | Enzo Racing | [Customer Work Form 2025](https://www.enzoracing.com/wp-content/uploads/2025/07/CUSTOMER-WORK-FORM-2025-1-1.pdf) | 2025-07 (upload path) | tuner | communication |
| Factory Links (linkage parts maker) | Factory Links | [Your Shock May Not Be the Problem. It Could Be Your Linkage Bearings.](https://shopfactorylinks.com/blogs/tech-articles/when-rear-suspension-performance-feels-off-check-the-linkage-bearings) | 2026-05-18 | tuner | diagnosis, tuners |
| Keefer Inc Testing | Kris Keefer | [2020 Honda CRF450R Start Up/Baseline Settings/Tips/Tricks](https://www.keeferinctesting.com/2019-9-16-2020-honda-crf450r-start-upbaseline-settingstipstricks/) | 2019-09-16 | tester | tuners |
| Keefer Inc Testing | Kris Keefer | [2026 250 MX Baseline Suspension Settings](https://www.keeferinctesting.com/?p=29823) | 2026-06-10 | tester | tuners |
| Keefer Inc Testing | Kris Keefer | [2026 Yamaha YZ450F Baseline Suspension Settings](https://www.keeferinctesting.com/2026-yamaha-yz450f-baseline-suspension-settings/) | 2025-09-29 | tester | tuners |
| Keefer Inc Testing | Kris Keefer | [Action And Reaction (Fork)](https://www.keeferinctesting.com/?p=13141) | 2021-06-22 | tester | communication, tuners |
| Keefer Inc Testing | Kris Keefer | [Enzo Racing 2022 Yamaha YZ450F Re-Valved Suspension](https://www.keeferinctesting.com/?p=17321) | 2022-01-31 | tester | communication, tuners |
| Keefer Inc Testing | Kris Keefer | [Helpful Suspension Set Up Tips](https://www.keeferinctesting.com/helpful-suspension-set-up-tips/) | 2025-02-13 | tester | communication, diagnosis, tuners |
| Keefer Inc Testing | Kris Keefer | [Helpful Suspension Set Up Tips (2021 version)](https://www.keeferinctesting.com/?p=194) | 2021-10-07 | tester | tuners |
| Keefer Inc Testing | Michael Allen | [Kreft Suspension For Husqvarna TE300i (XPlor fork)](https://www.keeferinctesting.com/?p=13271) | 2020-05-29 | tester | tuners |
| Keefer Inc Testing | Kris Keefer | [Suspension Guide For Dummies](https://www.keeferinctesting.com/?p=27940) | 2024-04-22 | tester | tuners |
| Keefer Inc Testing | Kris Keefer | [The Makings Of A Great WP Pro Component Settings On The KTM 450 SX-F (With REP Suspension)](https://keeferinctesting.com/?p=146) | 2021-02-03 | tester | tuners |
| Keefer Inc Testing / PulpMX | Kris Keefer | [Suspension Adjustment Guide](https://www.keeferinctesting.com/?p=13314) | 2021-04-30 | tester | diagnosis, tuners |
| Keefer Inc. Testing | Kris Keefer | [Action And Reaction (Shock)](https://www.keeferinctesting.com/?p=183) | 2021-07-22 | tester | diagnosis |
| Keefer Inc. Testing | Kris Keefer | [KTM 450 SX-F Chain And Axle Position Tips](https://keeferinctesting.com/?p=13328) | 2021-09-18 | tester | diagnosis |
| Keefer Inc. Testing | Kris Keefer | [The Affect Of Change (Suspension)](https://www.keeferinctesting.com/?p=28041) | 2024-06-01 | tester | diagnosis |
| Keefer Inc. Testing | Kris Keefer | [Tire Pressure Settings Bible 2025](https://www.keeferinctesting.com/tire-pressure-settings-bible-2025/) | 2025-04-16 | tester | diagnosis |
| Keefer, Inc. Tested | Kris Keefer | [Action And Reaction (Shock)](https://www.keeferinctesting.com/2021-7-21-action-and-reaction-shock/) | 2021-07-22 | tester | communication |
| Keefer, Inc. Tested | Kris Keefer | [Suspension Terms Explained (Helping Your Suspension Tuner)](https://www.keeferinctesting.com/?p=27054) | 2024-01-22 | tester | communication |
| Keefer, Inc. Tested | Kris Keefer | [Testing Terms Explained (Suspension/Chassis)](https://www.keeferinctesting.com/?p=13265) | 2020-03-31 | tester | communication |
| Keefer, Inc. Tested | Kris Keefer | [Testing Terms: Engine/Suspension *Updated*](https://www.keeferinctesting.com/?p=205) | 2021-12-13 | tester | communication |
| Keefer, Inc. Tested | Kris Keefer | [The Weekend Race Set Up (4/25/21)](https://www.keeferinctesting.com/?p=13313) | 2021-04-27 | tester | communication |
| Keefer, Inc. Tested / PulpMX | Kris Keefer | [On Or Off Throttle? Cheat Code To Setting Up Your Suspension (also on PulpMX as 'A Cheat C](https://www.keeferinctesting.com/?p=28964) | 2025-06-02 | tester | communication |
| Motocross Action | MXA staff | [10 Things About Fine Tuning Your Suspension](https://motocrossactionmag.com/10-things-about-fine-tuning-your-suspension/) | 2022-10-26 | magazine | diagnosis, tuners |
| Motocross Action | Jody Weisel (MXA) | [Ask the MXperts: 2023 KTM 450SXF Suspension Advice](https://motocrossactionmag.com/ask-the-mxperts-2023-ktm-450sxf-suspension-advice) | 2024-07-25 | magazine | tuners |
| Motocross Action | Jody Weisel (MXA) | [Ask the MXperts: My Friend's Identical Forks Are Better Than Mine. Why?](https://motocrossactionmag.com/ask-the-mxperts-my-friends-identical-forks-are-better-than-mine-why) | 2018-12-02 | magazine | tuners |
| Motocross Action | Jody Weisel (MXA) | [Ask the MXperts: The Air Apparent Is So Apparent To Everyone](https://motocrossactionmag.com/ask-the-mxperts-the-air-apparent-is-so-apparent-to-everyone) | 2021-07-14 | magazine | tuners |
| Motocross Action | Jody Weisel (MXA) | [Ask the MXperts: The Realities of Clickers](https://motocrossactionmag.com/ask-the-mxperts-the-realities-of-clickers/) | 2023-11-16 | magazine | diagnosis, tuners |
| Motocross Action | MXA staff | [MX Education: How To Select The Correct Rear Shock Spring](https://motocrossactionmag.com/mx-education-how-to-select-the-correct-rear-shock-spring) | 2016-11-02 | magazine | tuners |
| Motocross Action | MXA staff | [MXA Product Test: Pro Circuit KX450F Linkage and Revalve](https://motocrossactionmag.com/mxa-product-test-pro-circuit-kx450f-linkage-and-revalve/) | 2006-06-27 | magazine | tuners |
| Motocross Action | MXA staff | [MXA Race Test: The Real Test Of The 2021 KTM 450SXF](https://motocrossactionmag.com/mxa-race-test-the-real-test-of-the-2021-ktm-450sxf) | 2021-03-12 | magazine | tuners |
| Motocross Action | Tom Hinz | [MXA Team Tested: Ride JBI Pro Perch Fork Mod](https://motocrossactionmag.com/mxa-team-tested-ride-jbi-pro-perch) | 2014-11-05 | magazine | tuners |
| Motocross Action | Tom Hinz | [Ten Things About Dialing In Your Bike's Suspension](https://motocrossactionmag.com/ten-things-about-dialing-in-your-suspension) | 2020-06-27 | magazine | diagnosis, tuners |
| Motocross Action | MXA staff | [Ten Things You Need To Know About Setting Up Your Suspension](https://motocrossactionmag.com/10-things-you-need-to-know-about-setting-up-your-suspension) | 2015-03-10 | magazine | diagnosis, tuners |
| Motocross Action | MXA team | [This Week in MXA: A Lesson in Suspension with Pro Circuit's Bones Bacon](https://motocrossactionmag.com/amp/this-week-in-mxa-a-lesson-in-suspension-with-pro-circuits-bones-bacon/) | 2021-11-19 | magazine | tuners |
| Motocross Action (Bare Bones column) | Jim 'Bones' Bacon (Pro Circuit) | [Bare Bones: Air Forks Or Spring Forks? Make Up Your Mind](https://motocrossactionmag.com/bare-bones-air-forks-or-spring-forks-make-up-your-mind) | 2018-03-19 | tuner | tuners |
| Motocross Action (Bare Bones column) | Jim 'Bones' Bacon (Pro Circuit) | [Bare Bones: How Static Sag Can Help You Choose The Right Spring Rate](https://motocrossactionmag.com/bare-bones-how-static-sag-can-help-you-choose-the-right-spring-rate) | 2021-11-20 | tuner | tuners |
| Motocross Action (MXA) | Bones Bacon (byline; page metadata lists | [Bare Bones: How To Test Your Bike's Suspension](https://motocrossactionmag.com/bare-bones-how-to-test-your-bikes-suspension) | 2019-02-28 | magazine | communication |
| Motocross Action Magazine | MXA staff | [10 Things You Need To Know About Heat Buildup](https://motocrossactionmag.com/10-things-you-need-to-know-about-heat-buildup) | 2025-08-20 | magazine | diagnosis |
| Motocross Action Magazine | MXA staff | [10 Things You Need To Know About Tire Air Pressure](https://motocrossactionmag.com/10-things-you-need-to-know-about-tire-air-pressure) | 2012-01-26 (updated 2019-02-14) | magazine | diagnosis |
| Motocross Action Magazine | Bones Bacon; page metadata lists Jody We | [Bare Bones: I Am An Expert (Or I Used To Be)](https://motocrossactionmag.com/bare-bones-i-am-an-expert-or-i-used-to-be) | 2024-09-04 | tuner | diagnosis |
| Motocross Action Magazine | Bones Bacon; page metadata lists Jody We | [Bones Bacon On How To Deal With The Evils Of Head Shake](https://motocrossactionmag.com/bones-bacon-on-how-to-deal-with-the-evils-of-head-shake) | 2025-10-22 | tuner | communication, diagnosis |
| Motocross Action Magazine | MXA staff | [How To Fix Your Forks With Fork Oil Height Tricks](https://motocrossactionmag.com/how-to-fix-your-forks-with-fork-oil-height-tricks) | 2018-10-12 | magazine | diagnosis |
| Motocross Action Magazine | MXA wrecking crew | [MXA Wrench Tech: How To Dial In Your Shock In 20 Easy Steps](https://motocrossactionmag.com/mxa-wrench-tech-how-to-dial-in-your-shock-in-20-easy-steps) | 2013-05-14 | magazine | diagnosis |
| Motocross Action Magazine | Jody Weisel | [Team Tested: SKF Fork Seals/Dust Wipers](https://motocrossactionmag.com/mxa-team-tested-skf-fork-sealsdust-wipers/) | 2015-05-10 (updated 2017-05-10) | magazine | diagnosis |
| Motocross Action Magazine | MXA staff | [Ten Things About Motocross Forks](https://motocrossactionmag.com/ten-things-about-motocross-forks) | 2020-12-17 | magazine | diagnosis |
| Motocross Action Magazine | not stated | [Ten Things About Setting Race And Free Sag](https://motocrossactionmag.com/ten-things-about-race-and-free-sag) | undated (photo captions reference 2019 and 2023) | magazine | diagnosis |
| Motocross Action Magazine (Ask the MXperts) | Jody Weisel | [Ask The MXperts: Air Forks & Shocks Get Stiffer When Heat Is Applied](https://motocrossactionmag.com/ask-the-mxperts-air-forks-shocks-get-stiffer-when-heat-is-applied) | 2022-08-11 | magazine | diagnosis |
| Motocross Action Magazine (Bare Bones column) | Bones Bacon (Pro Circuit suspension); pa | [Bare Bones: Why Your Suspension Is Packing & What To Do About It](https://motocrossactionmag.com/bare-bones-why-your-suspension-is-is-packing-what-to-do-about-it) | 2021-03-01 | tuner | communication, diagnosis |
| Motocross Action Magazine (secondary, not a maker) | MXA Staff | [Ten things about the new generation of WP XACT forks](https://motocrossactionmag.com/ten-things-about-the-new-generation-of-wp-xact-forks) | 2019-07-13 | press_secondary | makers, tuners |
| Pro Circuit | Pro Circuit | [Suspension Services](https://www.procircuit.com/suspension-services) | undated (fetched 2026-10-15) | tuner | communication |
| PulpMX | Kris Keefer | [FXR Racing: How To Properly Test (Want to get your bike working better? Read this)](https://pulpmx.com/2016/09/15/fxr-racing-how-to-properly-test/) | 2016-09-15 | tester | communication |
| PulpMX | Byline 'Steve' (content mirrors Keefer's | [The Mechanics Of Suspension Setting Changes](https://pulpmx.com/?p=172059) | 2024-06-03 | tester | diagnosis |
| PulpMX (Keefer Tested) | Kris Keefer | [On or Off Throttle? A Cheat Code To Diagnosing Suspension Issues](https://pulpmx.com/2025/06/02/on-or-off-throttle-a-cheat-code-to-diagnosing-suspension-issues/) | 2025-06-02 | tester | diagnosis |
| PulpMX (Keefer Tested) | Kris Keefer | [REP WP Pro Components Re-Valve (KTM 450 SX-F)](https://pulpmx.com/2020/04/09/rep-wp-pro-components-re-valve-ktm-450-sx-f/) | 2020-04-09 | tester | tuners |
| Race Tech | not named | [Fork Installation](https://racetech.com/fork-installation/) | 2024-02-03 (last modified); older copy at https://old.racetech.com/page/title/Fork Installation | tuner | diagnosis |
| Race Tech | Race Tech | [IP FMGV 323202C Rebuild 2015 KYB Air](https://racetech.com/ip-fmgv-323202c-rebuild-2015-kyb-air) | modified 2024-02-02 | aftermarket_maker | makers |
| Race Tech | Race Tech | [IP FMGV bolt type (Gold Valve compression install)](https://racetech.com/ip-fmgv-bolt-type) | modified 2024-02-02 | aftermarket_maker | makers |
| Race Tech | Race Tech | [IP FSCS fork spring conversion WP 16 AER48](https://racetech.com/ip-fscs-fk-spr-conv-wp-16-aer48/) | modified 2024-02-02 | aftermarket_maker | makers |
| Race Tech | Race Tech | [Setting Sag the Race Tech Way](https://racetech.com/sag) | modified 2024-01-20 | aftermarket_maker | diagnosis, makers |
| Race Tech | Race Tech | [Setup Builder / parts catalog (old site)](https://old.racetech.com/page/id/71) |  | aftermarket_maker | makers |
| Race Tech | Race Tech | [Spring installation instructions (SRSP series P)](https://racetech.com/wp-content/uploads/ip-srsp-sk-springs-all.pdf) | 2013-04-07 | aftermarket_maker | makers |
| Race Tech | Paul Thede (Sport Rider, Aug 1995, hoste | [Suspension and Springs - Sag](https://old.racetech.com/articles/SuspensionAndSprings.htm) | 1995-08 | aftermarket_maker | makers |
| Racer X | Kris Keefer | [Between the Motos: Keefer's Suspension/Chassis Terms](https://racerxonline.com/2020/04/13/between-the-motos-keefers-suspension-chassis-terms) | 2020-04-13 | magazine | communication |
| Racer X Online (Ask Ping) | Steve Matthes | [Ask Ping (clickers)](https://racerxonline.com/2017/07/07/ask-ping) | 2017-07-07 | magazine | diagnosis |
| Racer X Online (Ask Ping) | Steve Matthes | [Ask Ping (sag, mud)](https://racerxonline.com/2019/08/27/ask-ping) | 2019-08-27 | magazine | diagnosis |
| Red Bull | Natalie Hamingson | [Motocross suspension setup guide](https://redbull.com/us-en/motocross-suspension-setup-guide) | 2023-11-07 | magazine | diagnosis |
| Ride JBI |  | [ridejbi.com home page](https://ridejbi.com) |  | tuner | tuners |
| Risk Racing | Risk Racing (no individual) | [How to Dial in Motocross Suspension](https://riskracing.com/blogs/news/how-to-dial-in-motocross-suspension) | 2021-01-11 (updated 2021-06-08) | magazine | communication |
| Slavens Racing | Slavens Racing (shop) | [Handling Trouble Shooting](https://slavensracing.com/help/handling-trouble-shooting/) | 2019-04-10 (last modified) | tuner | diagnosis, tuners |
| Teknik Motorsport | Teknik Motorsport | [Balance springs PSF](https://www.teknikmotorsport.com/balance-springs-psf/) |  | aftermarket_maker | makers |
| Teknik Motorsport (KYB distributor) | Teknik Motorsport | [KYB Factory Suspension Kits](https://teknikmotorsport.com/KYB-Factory-Suspension-Kits) |  | aftermarket_maker | makers |
| Teknik Motorsport (KroozR / Tractive) | Teknik Motorsport | [Offroad Setup Guide](https://www.teknikmotorsport.com/assets/brochures/Offroad_Setup_Guide.pdf) |  | aftermarket_maker | communication, makers |
| Teknik Motorsport (from Transmoto) |  | [Suspension DIY: Using Your Clickers](https://www.teknikmotorsport.com/suspension-diy-using-your-clickers) |  | magazine | tuners |
| Touratech (adventure/road; adjacent, not MX) | Touratech GmbH / Touratech Australia | [Suspension Check (suspension checklist)](https://www.touratech.com.au/wp-content/uploads/2022/01/Suspension-checklist.pdf) | 2022-01 (upload path) | tuner | communication |
| Transmoto (with WP Suspension) | Transmoto / WP Suspension | [How-To: Set-Up Suspension For Sand](https://transmoto.com.au/how-to-set-up-suspension-for-sand) | 2019-06-17 | magazine | diagnosis, tuners |
| Transmoto magazine (hosted by Teknik Motorsport) | Martin Child / Nick Dole | [Your guide to clickers](https://www.teknikmotorsport.com/assets/brochures/Transmoto-Using_Your_Clickers.pdf) |  | aftermarket_maker | makers |
| Vital MX | Jamie Guida (interview with Rob Brown, R | [Industry Insights ft. Rob Brown](https://www.vitalmx.com/features/industry-insights-ft-rob-brown) | 2024-07-03 | tuner | tuners |
| Vital MX | Jamie Guida | [Paul Thede's Race Tech Suspension Seminar](https://vitalmx.com/features/paul-thedes-race-tech-suspension-seminar-vital-mx-editorial) | 2023-11-21 | magazine | tuners |
| Vital MX | GuyB | [Ride Tested: Factory Connection Suspension Tuneup](https://www.vitalmx.com/features/Ride-Tested-Factory-Connection-Suspension-Tuneup,2955) | 2009-04-24 | magazine | communication |
| Vital MX (feature on Factory Connection) | Mark Rodgers, Factory Connection West Co | [Vital MX Insider: Factory Connection West](https://www.vitalmx.com/features/Vital-MX-Insider-Factory-Connection-West,1487) | 2007-06-07 | tuner | diagnosis |
| Vital MX forum | various users incl. a self-declared AEO/ | [AEO/REP suspension](https://www.vitalmx.com/forums/bike-builds/aeo-rep-suspension) | 2022-12 | forum | tuners |
| Vital MX forum | lumpy790, Braaaphole, jbonemalone, other | [Any ever get their suspension done and notice no difference?](https://www.vitalmx.com/comment/5234946) | 2023-05-18 to 2023-05-23 | forum | communication |
| Vital MX forum | Braaaphole (OP), SoCalMX70, jchek779, Sk | [Bike climbs out of ruts](https://www.vitalmx.com/forums/Moto-Related,20/Bike-climbs-out-of-ruts,1338496) | 2018-04-24 | forum | diagnosis |
| Vital MX forum | various users (FC customers) | [Factory Connection AER 48](https://www.vitalmx.com/forums/Moto-Related,20/Factory-connection-Aer-48,1333855) | 2018 | forum | tuners |
| Vital MX forum | lucas51 (OP), CarlinoJoeVideo, theycallm | [Front end tuck](https://www.vitalmx.com/comment/3835500) | 2020-09-05 to 2020-09-20 | forum | diagnosis |
| Vital MX forum | lucas51, CarlinoJoeVideo, theycallmeebry | [Front end tuck](https://www.vitalmx.com/comment/3836864) | 2020-09-05 to 2020-09-20 | forum | communication |
| Vital MX forum | various users | [Front suspension tuning](https://www.vitalmx.com/forums/Tech-Help-Race-Shop,42/Front-suspension-tuning,1361030) | 2019-06-11 | forum | tuners |
| Vital MX forum | DrSweden (OP), nytsmaC, CamP, onenastyno | [I went from loving to hating my forks (Showa 47mm)](https://www.vitalmx.com/forums/Race-Shop,42/I-went-from-loving-to-hating-my-forks-How-do-I-make-them-good-again-Showa-47-mm,1052202) | 2010-09-04 to 2010-09-27 | forum | diagnosis |
| Vital MX forum | various users | [JBI DIY vs. Race Tech Spring Conversion for KTM](https://www.vitalmx.com/comment/8117826) | 2025-07-30 | forum | tuners |
| Vital MX forum | OwenJakes, Preston412, Riesenberg448 (Ra | [Race Tech suspension - riding rough after revalve?](https://www.vitalmx.com/comment/7659951) | 2025-03-30 to 2025-03-31 | forum | communication |
| Vital MX forum | various users | [Shock rebound help](https://www.vitalmx.com/comment/3862735) | c. 2020 (posts dated 11/4 and 11/6; 2020-model bike) | forum | tuners |
| Vital MX forum | bmelzRM250, pete24, colson973, FWYT, Pir | [suspension not what i thought it was](https://www.vitalmx.com/forums/Race-Shop,42/suspension-not-what-i-thought-it-was,1296639) | 2016-01-14 to 2016-01-16 | forum | communication |
| Vital MX forum Q&A | Ross Maeda (Enzo Racing, ex-KYB test rid | [Vital MX Forum QNA: Ross Maeda](https://www.vitalmx.com/forums/Moto-Related,20/Vital-MX-Forum-QNA-Ross-Maeda,1301328) | 2016-04-19 | tuner | tuners |
| Vital MX forum Q&A | Ross Maeda (Enzo Racing) | [Vital MX Forum QNA: Ross Maeda (later answers)](https://www.vitalmx.com/comment/2555199) | 2016-04-20 | tuner | tuners |
| WP Suspension | WP Suspension | [The new XACT PRO components for the 2023 KTM motocross range](https://www.wp-suspension.com/news/the-new-xact-pro-components-for-the-2023-ktm-motocross-range) | 2022-05-12 | maker | makers |
| WP Suspension | WP Suspension | [XACT PRO 7448 (product page)](https://www.wp-suspension.com/?p=20723) |  | maker | makers |
| WP Suspension | WP Suspension | [XACT PRO 7750 (shock product page)](https://www.wp-suspension.com/?p=20733) |  | maker | makers |
| WP Suspension | WP Suspension | [XACT PRO 8950 Shock (product pages)](https://www.wp-suspension.com/?p=62440) |  | maker | makers |
| WP Suspension (press release via Motorcycle.com) | WP / Motorcycle.com | [WP Suspension Pro Components: Off-road Innovation](https://www.motorcycle.com/2019/05/03/motorcycle-news/wp-suspension-pro-components-off-road-innovation/) | 2019-05-03 | maker | makers |
| WP Suspension (press release via Ultimate Motorcyc | WP / Ultimate Motorcycling | [WP Announces New AER 48 Air Forks](https://ultimatemotorcycling.com/2015/10/26/wp-announces-new-aer-48-air-forks) | 2015-10-26 | maker | makers |
| WP Suspension (statements via Ultimate Motorcyclin | Don Williams | [WP Xplor Pro 7448 Air Fork First Look](https://ultimatemotorcycling.com/2021/03/08/wp-xplor-pro-7448-air-fork-first-look-high-end-off-road-motorcycle-suspension/) | 2021-03-08 | maker | makers |
| Öhlins | Öhlins (text extraction hosted by manual | [Öhlins RXF48S Owner's Manual](https://manualsnet.com/ohlins/rxf48s) | 2021 (per host listing) | maker | makers |
| Öhlins | Öhlins Europe | [Öhlins TTX Flow MX & Enduro Shock Absorber (product pages/PDFs YA 1892, HO 2093, KT 1984, ](https://www.ohlins.eu/en/products/motorcycle/ya-1892--6250/) |  | maker | makers |
