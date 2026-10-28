/** BAK-authored setup knowledge for gas motocross bikes.
 *
 * Direction-only relationships: what each adjustment does, what too much of it feels like,
 * and how rider language maps to likely causes. It deliberately contains NO bike-specific
 * numbers — stock clicker positions, sag targets, spring rates, pressures and jet sizes come
 * only from verified claims for the exact bike.
 *
 * Status: AUTHORED, pending review by Kyle. Edit here; the runtime reads this file.
 */
export type Adjuster={
 id:string;name:string;controls:string;
 firmer_or_more:string;too_much:string;
 softer_or_less:string;too_little:string;
 notes:string;
};
export type SymptomGuide={
 id:string;rider_says:string[];where:string;
 check_first:string[];
 likely:{cause:string;tell:string;first_change:string}[];
 /** The question that separates the likely causes, when one does. */
 ask?:string;
 /** A common wrong first move for this symptom, when there is one. */
 note?:string;
};
export const SETUP_KNOWLEDGE_VERSION='mx-setup-2';

export const adjusters:Adjuster[]=[
 {id:'fork_compression',name:'Fork compression',controls:'How easily the fork compresses: brake dive, how the front holds up into corners and on landings.',
  firmer_or_more:'Front holds up under braking and on landings, resists dive and bottoming.',too_much:'Harsh in the hands, deflects off small bumps, front rides high and will not settle or bite on corner entry, pushes.',
  softer_or_less:'More compliance and front grip on turn-in, follows small bumps.',too_little:'Dives hard, bottoms, front rides low and feels twitchy or tucks on entry.',
  notes:'Count clicks out from lightly seated. Never force an adjuster against its stop.'},
 {id:'fork_rebound',name:'Fork rebound',controls:'How fast the fork extends after it compresses.',
  firmer_or_more:'Slower return: front stays down and calm after a hit, holds a line on entry.',too_much:'Packs down through a series of bumps, rides lower and gets harsher with each hit, front tucks in braking bumps.',
  softer_or_less:'Faster return: front recovers for the next bump.',too_little:'Front springs back, feels loose or pogos, pushes or washes on corner exit as the front unloads.',
  notes:'Change rebound after compression is close; the two interact.'},
 {id:'fork_height',name:'Fork height in the clamps',controls:'Front ride height and steering geometry.',
  firmer_or_more:'Forks raised through the clamps (more tube showing above): lower front, more weight on the front tire, quicker turn-in.',too_much:'Nervous at speed, headshake, front tucks.',
  softer_or_less:'Forks lowered toward flush: taller front, more stability in fast rough sections.',too_little:'Slow steering, front pushes, hard to hold an inside line.',
  notes:'Move in small steps and keep both legs identical. Re-torque the clamp bolts to the published value for the exact bike.'},
 {id:'shock_low_speed_compression',name:'Shock low-speed compression',controls:'Slow shaft movement: squat under power, G-outs, rolling bumps, body movement.',
  firmer_or_more:'Rear holds up under acceleration and in G-outs, less wallow.',too_much:'Rear skips over acceleration chop, poor drive, harsh.',
  softer_or_less:'More traction and comfort, rear settles and hooks up.',too_little:'Wallows, squats, pushes wide on exit, bottoms in G-outs.',
  notes:'Usually the clicker in the centre of the shock compression adjuster.'},
 {id:'shock_high_speed_compression',name:'Shock high-speed compression',controls:'Fast shaft movement: square edges, sharp braking bumps, hard landings. Also influences how high the rear rides.',
  firmer_or_more:'Resists bottoming on hard landings, rear rides higher.',too_much:'Kicks on square edges, harsh, transfers hits to the rider.',
  softer_or_less:'Absorbs sharp hits, rear rides lower and feels more settled.',too_little:'Bottoms on landings, rear sits low and steering gets slow.',
  notes:'Usually the outer nut, adjusted in turns or fractions of a turn rather than clicks.'},
 {id:'shock_rebound',name:'Shock rebound',controls:'How fast the rear extends after it compresses.',
  firmer_or_more:'Slower return: rear stays planted, less kick off jump faces and bumps.',too_much:'Packs through braking bumps and whoops, rear gets lower and harsher with each hit, loses traction.',
  softer_or_less:'Faster return: rear follows the ground, better drive over acceleration chop.',too_little:'Rear kicks or bucks, feels loose and springy, swaps side to side.',
  notes:'A buck straight up after a single big hit, G-out or landing points to too fast; getting lower and harsher through a series points to too slow. A sharp deflection off square edges is usually compression, not rebound.'},
 {id:'rider_sag',name:'Rider sag (shock spring preload)',controls:'Rear ride height with the rider aboard, and so the balance of the whole bike.',
  firmer_or_more:'More sag (less preload): lower rear, more stability, lighter front.',too_much:'Front pushes and will not turn, rear feels dead and bottoms.',
  softer_or_less:'Less sag (more preload): higher rear, more front weight, quicker turn-in.',too_little:'Headshake, nervous at speed, rear kicks, poor rear traction.',
  notes:'Set sag with the rider in full gear before touching clickers. Then check static sag: very little static sag with correct rider sag means the spring is too soft for the rider; a lot means it is too stiff. The target numbers are bike-specific.'},
 {id:'fork_air_pressure',name:'Fork air pressure (air forks)',controls:'The spring of an air fork: ride height in the stroke, support and bottoming.',
  firmer_or_more:'More pressure: fork rides higher, more support, resists bottoming and dive.',too_much:'Stiff and deflecting, front rides high and pushes, harsh in the hands.',
  softer_or_less:'Less pressure: fork rides deeper, more compliant early on.',too_little:'Hangs down in the stroke, dives, bottoms, feels harsh deep in the travel.',
  notes:'A small pressure change is a large spring change. Check cold with the front wheel off the ground, and bleed the outer chambers. Clickers cannot make up for the wrong pressure.'},
 {id:'fork_oil_level',name:'Fork oil level or volume',controls:'The air spring at the end of a coil fork’s stroke; on some air forks, the volume in the air side.',
  firmer_or_more:'More oil: more resistance near the end of the stroke, less bottoming.',too_much:'Harsh from the middle to the end of the stroke, will not use full travel.',
  softer_or_less:'Less oil: freer near the end of the stroke.',too_little:'Bottoms on big hits although the early stroke feels fine.',
  notes:'It barely changes the first part of the stroke. Change both legs equally in small steps, with the fork serviced and the published level as the start.'},
 {id:'tire_pressure',name:'Tire pressure',controls:'Carcass stiffness and contact patch.',
  firmer_or_more:'Higher pressure: firmer, protects the rim, more precise on hard pack.',too_much:'Deflects, less grip, harsh.',
  softer_or_less:'Lower pressure: more grip and compliance in soft or slick conditions.',too_little:'Pinch flats, rim damage, vague and squirmy.',
  notes:'Check cold, before every ride. A pressure problem is often mistaken for a suspension problem. Start from the maker’s cold figure for the bike and move it in small steps for conditions, testing each one. Mousse inserts have no pressure to set.'},
 {id:'gearing',name:'Final-drive gearing',controls:'How engine speed is matched to wheel speed.',
  firmer_or_more:'More rear teeth or fewer front teeth (shorter): stronger pull, gears come sooner, less top speed.',too_much:'Busy shifting, runs out of gear on straights, harder to carry a gear through a corner.',
  softer_or_less:'Fewer rear teeth or more front teeth (taller): longer gears, more top speed.',too_little:'Lazy out of corners, needs clutch to stay in the power.',
  notes:'One tooth on the front is a much larger change than one on the rear. A gearing change also moves the rear axle and chain length, which changes wheelbase.'},
 {id:'two_stroke_jetting',name:'Two-stroke carburetor jetting',controls:'Fuel mixture by throttle position: pilot circuit and air screw from closed to about a quarter, needle and clip position through the middle, main jet from about three quarters to wide open.',
  firmer_or_more:'Richer: more fuel. Lowering the needle clip raises the needle and richens the midrange.',too_much:'Blubbery, smoky, sluggish, spooge from the pipe, fouls plugs.',
  softer_or_less:'Leaner: less fuel. Raising the needle clip lowers the needle and leans the midrange.',too_little:'Pinging or detonation, hanging idle, surging, runs hot. Lean on the main jet can seize the engine.',
  notes:'Colder, denser air or lower altitude needs richer; hotter air or higher altitude needs leaner. Diagnose by the throttle position where it happens. Jet sizes come only from the published chart for the exact bike. Stop riding if it pings or detonates.'},
 {id:'four_stroke_map',name:'Four-stroke EFI map selection',controls:'Fuel and ignition delivery by the selected map, coupler or handlebar switch.',
  firmer_or_more:'More aggressive map: harder hit and quicker response.',too_much:'Wheelspin, tiring, hard to put power down on slick or hard pack.',
  softer_or_less:'Milder map or traction control: smoother delivery, easier to find grip.',too_little:'Feels flat or slow to respond in deep or loamy conditions.',
  notes:'Which maps exist and how they are selected is bike- and year-specific. A map choice never fixes a bog, hard starting or misfire; those are faults to diagnose.'},
];

/** Checks that must be right before clicker changes mean anything. Mechanical faults feel like setup problems. */
export const beforeYouTune:string[]=[
 'The right spring or air setting for the rider’s weight, then rider sag in full gear, then static sag as a check on the spring.',
 'Tire pressures checked cold, and again after a few laps if it is hot.',
 'Fork air bled at the bleed screws, forks cool and the front wheel off the ground. On an air fork, main pressure checked cold with the wheel off the ground.',
 'Front axle and fork legs aligned so nothing binds: axle tightened into its nut first, pinch bolts after, legs free to settle.',
 'Steering-head bearing neither loose nor notchy, and linkage, shock and swingarm bearings free, greased and without play.',
 'Chain slack set to the published figure; a tight chain stiffens the rear and feels like packing.',
 'Fork seals dry, and fork and shock service not overdue for the hours on the bike. New or freshly serviced suspension needs breaking in before it is judged.',
 'Every clicker, fork height, sag, air and tire pressure written down, so each change can be undone.',
];

/** The order specialist tuners work in. Skipping a step makes the later steps meaningless. */
export const workOrder:string[]=[
 'Spring or air rate for the rider’s weight and speed: clickers cannot fix the wrong spring.',
 'Rider sag, then static sag to confirm the spring.',
 'Front-to-rear balance: fork height and sag together set the attitude of the bike.',
 'Clickers last, one adjuster at a time, a small step at a time, ridden over the same section for a few laps and compared back to the baseline.',
 'When the clickers run out, or one adjuster cannot fix the early and the middle of the stroke together, the answer is springs, oil volume or valving, not more clicks.',
];

/** Questions that separate causes which feel the same. Ask the one that decides the answer; never all of them. */
export const triageQuestions:{question:string;why:string}[]=[
 {question:'Is it on the gas or off the gas (braking, rolling off)?',why:'On the gas the weight is on the rear and the front is light; off the gas the fork is loaded and the rear is light. The same word points to different ends and circuits.'},
 {question:'Where in the corner: braking in, the middle, or driving out?',why:'Entry is fork and braking load; the middle is balance and fork height; the exit is shock and rear ride height.'},
 {question:'Do you feel it through the bars, the pegs or the seat?',why:'It says which end is doing it, which riders often get wrong.'},
 {question:'Is it the first bump, or does it build through a run of bumps?',why:'Trouble on the first hit points to compression or spring; trouble that builds through a series points to rebound too slow (packing).'},
 {question:'Does it hit and bounce off, or hit and sink?',why:'Bouncing off is too firm or rebound too fast; sinking is too soft.'},
 {question:'Which way does the rear kick: straight up, or sideways?',why:'Straight up after a single big hit, jump face or G-out is rebound too fast; sideways off square edges, rocks and roots is compression too firm.'},
 {question:'Does the rear sit high or low, at rest and when moving?',why:'Ride height decides whether sag or high-speed compression is the fix, and riders say "sag too high" for both directions.'},
 {question:'Is it harsh because it is stiff and barely moves, or because it rides deep in the stroke?',why:'Harsh has opposite fixes. A band or o-ring on the fork tube shows how much travel was used.'},
 {question:'Is it worse late in the moto or on hot days?',why:'Hot oil fades, air forks and tires gain pressure; that is not a clicker problem.'},
 {question:'Did it start after a crash, a service, a wheel change or a gearing change?',why:'Binding, bent parts, trapped air and a moved axle all feel like setup problems.'},
];

/** Faults that feel like tuning problems. Check these before any clicker change. */
export const mechanicalMimics:{fault:string;feels_like:string;check:string}[]=[
 {fault:'Loose or notchy steering-head bearing',feels_like:'Headshake, nervous front, a front that wanders or will not settle.',check:'Front wheel off the ground, turn the bars partway and let go: bars that flop to the stop and bounce are loose; bars that stop in steps are notchy.'},
 {fault:'Fork legs bound by axle or clamp tightening',feels_like:'Harsh fork that does not improve with clickers, often after a wheel change.',check:'Loosen the pinch bolts, tighten the axle into its nut, pump the fork, then tighten the pinch bolts. Clamp bolts to the published torque, not past it.'},
 {fault:'Bent fork tube or axle after a crash',feels_like:'Fork moves freely on the bench but sticks once clamped; harsh.',check:'Suspect it if a leg moved in the clamps in the crash; a shop checks runout.'},
 {fault:'Air built up in a coil fork, or pressure creep in an air fork',feels_like:'Fork gets harsher as the ride goes on.',check:'Bleed with the forks cool and the wheel off the ground; check air fork pressure cold.'},
 {fault:'Dry, worn or notchy linkage and shock bearings',feels_like:'Harsh on small bumps, sideways kick over chop, poor rear traction, sticky return.',check:'Look for play and notchiness with the shock unloaded. A big difference between pushing the rear down and lifting it up when measuring sag means friction.'},
 {fault:'Seal drag',feels_like:'Harsh on the smallest bumps and light loads.',check:'Clean and lubricate the seal lips; replace leaking or tired seals.'},
 {fault:'Old or overheated oil, low shock nitrogen, worn internals',feels_like:'Damping fades late in the moto, more bottoming or kicking over time without a setting change.',check:'Compare with service hours; worn suspension needs a service, not clicks.'},
 {fault:'Tire pressure wrong or rising with heat',feels_like:'Too low: wallowy, vague front, squirming. Too high: deflection, wheelspin, little grip.',check:'Set cold before every ride and recheck after a few laps on hot days.'},
 {fault:'Chain too tight',feels_like:'Stiff rear under power with a packing feel.',check:'Set slack to the published figure, measured where the manual says.'},
 {fault:'Rear axle moved (gearing or chain change)',feels_like:'Axle forward: quicker steering, stiffer-feeling rear. Axle back: more stable, slower turning, more squat.',check:'Note the axle position with every setup change.'},
 {fault:'New suspension not broken in',feels_like:'Stiff or harsh, rear sits high, sag drifts.',check:'Ride the break-in before judging or sending it for a revalve, and recheck sag afterwards.'},
];

/** How air forks differ from coil forks, as specialists describe it. */
export const airForkRules:string[]=[
 'Air pressure is the spring. A small pressure change is a big spring change, so move it in small steps and stay near the maker’s setting unless the rider is much lighter or heavier than average.',
 'Set pressure for weight, speed and track, then tune with the clickers, fork height and balance. Clickers cannot make up for wrong pressure: too much makes it stiff, too little lets it hang down in the stroke.',
 'Check pressure cold, with the front wheel off the ground, using a gauge, and disconnect quickly. It rises as the fork heats, so a fork that stiffens late in the moto may be pressure, not damping.',
 'Bleed the outer chambers after riding. A travel indicator on the fork tube shows whether the pressure suits the rider.',
 'Air forks are stiff until broken in; judge them after the break-in.',
 'Specialists disagree on how much pressure to use as a tuning tool: some set it once and tune with damping, some change it with track and pace.',
];

/** Signs that clickers have run out and the fix is springs, oil volume or valving. */
export const whenClickersRunOut:string[]=[
 'The adjuster is at the end of its range and the bike still is not right.',
 'Going softer to fix a firm middle of the stroke only loses control early in the stroke, or the reverse.',
 'Static sag says the spring is wrong for the rider.',
 'The fork is fine early but bottoms at the end: oil volume or air, not compression clicks.',
 'Air pressure cannot make the fork both comfortable and supportive.',
 'A revalve usually needs a follow-up session with the tuner; judge it from a known baseline, after break-in.',
];

/** How track and conditions shift a setup. Directions only; the starting point is the rider’s own baseline. */
export const conditions:{condition:string;change:string}[]=[
 {condition:'Deep sand and fast whoops',change:'Stiffer and more support: more compression, often slower rebound, sometimes more sag and forks lower in the clamps for stability.'},
 {condition:'Hard pack and slick',change:'Softer and freer: less compression, faster rebound so the tires follow the ground, and tire pressure checked first.'},
 {condition:'Soft loam',change:'More compression for support; widely spaced big bumps can want slower rebound.'},
 {condition:'Rocks and roots',change:'Softer compression for the rear in particular, and enough tire pressure to protect the rims.'},
 {condition:'Ruts',change:'Front rebound decides it: too fast climbs out of ruts, too slow packs and loses front contact.'},
 {condition:'Mud',change:'The bike gets heavier: a little more compression; lower tire pressure if the track slows down.'},
 {condition:'Tight, slow tracks',change:'A little less sag and the forks a little higher in the clamps for quicker steering.'},
 {condition:'Fast, open tracks',change:'More sag and the forks lower in the clamps for stability; faster riders run stiffer.'},
 {condition:'Heat and long motos',change:'Expect shock fade, air fork and tire pressure rise late in the moto; set pressures cold and allow for it.'},
 {condition:'Rider weight and pace',change:'Match springs or air to weight first. Faster, more aggressive riders want firmer settings; slower or lighter riders softer ones.'},
];

/** Rider words and what to ask before acting on them. */
export const vocabulary:{term:string;riders_mean:string;ask:string}[]=[
 {term:'harsh',riders_mean:'A jarring hit through bars, pegs or seat.',ask:'Does it barely move, or ride deep in the stroke? The fixes are opposite.'},
 {term:'packing',riders_mean:'Rides lower and stiffer through a run of bumps.',ask:'Is the first bump fine? If it is bad on the first hit it is compression, not packing.'},
 {term:'kick, buck',riders_mean:'The rear throws up or sideways.',ask:'Straight up or sideways, on the first hit or through a series, on or off the gas?'},
 {term:'plush',riders_mean:'Comfortable over bumps.',ask:'Which bumps should it absorb better? Asking a tuner for plush often gets a setup that is too soft.'},
 {term:'dead, empty, no hold-up, blows through',riders_mean:'Falls through the stroke with little resistance.',ask:'Where: jump faces, G-outs, braking? It usually wants more damping or spring at that end.'},
 {term:'wallow, pitching, see-saw',riders_mean:'Rocks front to back on and off the gas, floats over rollers.',ask:'Which end moves most?'},
 {term:'squat',riders_mean:'The rear sinks on the gas out of corners.',ask:'Is the rear low at rest too, or only under power?'},
 {term:'dive',riders_mean:'The front drops on the brakes.',ask:'Does it bottom too, or tuck in the corner?'},
 {term:'stinkbug, sag too high',riders_mean:'Usually the rear sits high and the bike feels nose-down; some riders mean the opposite.',ask:'Does the rear feel high or low?'},
 {term:'headshake, chopper, bar swap',riders_mean:'The bars oscillate, from a light jitter to lock-to-lock.',ask:'On the gas or on the brakes? Light jitter or full swapping?'},
 {term:'push, wash, vague',riders_mean:'The front will not hold the line or slides wide.',ask:'At entry off the gas, or driving through the turn?'},
 {term:'tuck, knife',riders_mean:'The front falls into the turn.',ask:'Does the fork dive on the brakes before it happens?'},
 {term:'deflect, ping off',riders_mean:'Bounces off edges instead of absorbing them.',ask:'Front or rear, on the gas or on the brakes?'},
 {term:'hook up, bite',riders_mean:'Drive from the rear tire.',ask:'Does the rear spin on smooth ground too (power) or only on chop (suspension)?'},
 {term:'crust',riders_mean:'A stiff first part of an air fork stroke before it gets compliant.',ask:'Is the pressure right, and is the fork broken in?'},
];

/** How a rider gets the best from a suspension tuner, as tuners and testers describe it. */
export const talkingToYourTuner:string[]=[
 'Say what the bike does and where, not the setting you think it needs.',
 'Give the place on the track, on or off the gas, which end, and where you feel it.',
 'Say whether it is the first bump or builds through a series, and whether it bounces off or sinks.',
 'Be honest about weight, speed and skill; tuners set springs and valving from them.',
 'Say what you want: firm support for speed, or comfort and bump absorption.',
 'Tell them the bike’s history: stock, ridden, serviced, revalved and by whom.',
 'Check sag, springs, fork height, tire pressure, bearings and binding before blaming the valving.',
 'After a revalve, start at the tuner’s settings, change one thing a little at a time, and report back exactly what changed and what did not.',
 'If a change made no difference, say so.',
];

/** Where specialists disagree, and how BAK handles it: ask the question that decides, then say there is another view.
 *  The rear-kick and rear-grip readings were confirmed by Kyle on 2026-10-15. */
export const openQuestions:{topic:string;sides:string;bak:string}[]=[
 {topic:'Rear kick over braking bumps',sides:'One maker table says rebound too fast; many tuners find high-speed compression too firm more often; others name packing or too-soft compression.',bak:'Ask which way it kicks and whether it builds through the bumps. Straight up after one big hit: slower rebound. Sideways off the edges: softer compression. Building through the series: faster rebound. Also bottoming: more compression.'},
 {topic:'Poor rear grip',sides:'One maker says the shock is too stiff and should go softer; another says faster rebound and firmer compression.',bak:'Ask whether the rear skips and chatters across the bumps (too stiff or riding high: softer, or more sag) or squats and wallows as traction fades (too soft or riding low: firmer compression), and whether grip fades through a series (rebound faster).'},
 {topic:'A bike that feels too stiff',sides:'Some say it is often too soft and riding deep; others say it is probably too stiff.',bak:'Ask how much travel it uses. Deep travel and diving: firmer. Little travel and deflection: softer.'},
 {topic:'Which bumps are high-speed',sides:'Testers disagree on whether jump faces, G-outs and stutter bumps are high- or low-speed events.',bak:'Judge by how sharp the hit is, not the bump’s name: a sharp edge is fast shaft speed, a rolling load is slow.'},
 {topic:'Rebound and headshake',sides:'Some blame fork rebound that is too fast, others too slow.',bak:'Ask whether the front is busy and skips (too fast) or gets lower and harsher through the bumps (too slow).'},
 {topic:'Sag targets',sides:'Testers run different race sag; some rules of thumb conflict with maker settings for sand.',bak:'Use the maker’s figure for the exact bike as the start; move it for balance and conditions, not as a fixed rule.'},
 {topic:'Step size',sides:'Some testers move one click, others two or more, and brands respond differently.',bak:'Small steps from the rider’s current setting, one adjuster at a time.'},
];

export const symptomGuides:SymptomGuide[]=[
 {id:'front-push',rider_says:['front pushes','front washes','won’t bite','won’t turn','runs wide','plows in flat turns','front feels vague'],where:'Flat and off-camber corners, entry to the middle of the turn, and driving through it.',
  check_first:['Rider sag: too much sag lowers the rear and takes weight off the front.','Front tire pressure and wear.','Fork air pressure cold, on an air fork.'],
  ask:'Does it push off the gas at entry, or on the gas driving through the turn?',
  likely:[
   {cause:'Rear riding low (soft shock high-speed compression or too much sag), which lightens the front.',tell:'Pushes on the gas or driving through the turn; rear feels low or squats out of corners; stable but lazy to turn.',first_change:'Shock high-speed compression firmer by a small step; if not enough, a little less sag.'},
   {cause:'Fork too firm (compression or air), riding high and not settling into the turn.',tell:'Pushes off the gas at entry; the fork also feels harsh and deflects.',first_change:'Fork compression softer by a small step, or a little less air on an air fork.'},
   {cause:'Forks low in the clamps, slowing the steering.',tell:'Stable at speed but slow side to side.',first_change:'Raise the fork tubes slightly in the clamps, keeping both legs equal and the total change small.'},
   {cause:'Fork rebound too fast, so the front unloads and climbs out of ruts.',tell:'Front busy, climbs out of ruts, pushes as the throttle opens.',first_change:'Fork rebound slower by a small step.'}],
  note:'Big fork-height moves are the common wrong fix; specialists keep fork-height changes small and try the shock first when the rear is low.'},
 {id:'front-tuck',rider_says:['front tucks','knifes','oversteers','falls into the corner','front digs in'],where:'Corner entry, on the brakes or just after, in ruts and soft dirt.',
  check_first:['Too little rider sag puts the rear high and the front low.','Forks raised too far through the clamps.','Fork air pressure below the setting, on an air fork.'],
  ask:'Does the fork dive on the brakes just before it tucks?',
  likely:[
   {cause:'Fork too soft (compression or air), diving under braking.',tell:'Happens on the brakes at entry; front feels low; may also bottom.',first_change:'Fork compression firmer by a small step, or a little more air; lower the forks in the clamps only if it still feels low.'},
   {cause:'Rear riding high (too little sag or shock high-speed compression too firm), a nose-down attitude.',tell:'Nose-down even on straights; rear harsh on square edges; lands front-heavy.',first_change:'A little more sag, or shock high-speed compression softer.'},
   {cause:'Shock low-speed compression too soft, so the rear unloads sharply when the throttle closes.',tell:'Pitches forward when the rider chops the throttle.',first_change:'Shock low-speed compression firmer by a small step.'},
   {cause:'Fork rebound too slow, packing down through braking bumps.',tell:'Worse after a run of bumps into the corner than on a smooth entry.',first_change:'Fork rebound faster by a small step.'}],
  note:'A fork that feels harsh while it dives is usually too soft and riding deep; softening it makes the tuck worse.'},
 {id:'front-dive',rider_says:['front dives','front feels low','no front hold-up','dives on the brakes'],where:'Braking zones and braking bumps, slap-down landings.',
  check_first:['Fork air pressure cold, on an air fork.','Rider sag: a rear riding high pushes the front down.'],
  ask:'Is it soft all the way through, or fine early and weak only at the end of the stroke?',
  likely:[
   {cause:'Fork compression or air too soft.',tell:'Dives and may bottom; travel indicator shows deep use.',first_change:'Fork compression firmer by a small step, or a little more air.'},
   {cause:'Forks too high through the clamps.',tell:'Front still feels low after the compression change; quick steering, less stable.',first_change:'Lower the fork tubes slightly in the clamps.'},
   {cause:'Fork oil volume low for the rider.',tell:'Fine early, weak and bottoming at the end of the stroke; clickers do not fix it.',first_change:'Service-level change: raise the oil level in small equal steps.'}]},
 {id:'headshake',rider_says:['headshake','twitchy','nervous at speed','bars shake','tank slapper','chopper'],where:'Fast rough straights, on the gas out of corners, or decelerating into rough corners.',
  check_first:['Steering-head bearing for play or notches.','Front tire pressure, wheel true and spoke tension.','Too little rider sag.'],
  ask:'Does it shake on the gas or on the brakes, and is it a light jitter or full bar swapping?',
  likely:[
   {cause:'On the gas: fork too firm or rebound off, with a light front skipping then shaking.',tell:'Front skips over bumps and then dances under power.',first_change:'Fork compression softer, or fork rebound adjusted toward the feel: slower if the front is busy, faster if it packs.'},
   {cause:'On the gas: rear riding low, making the front light.',tell:'Rear feels low or squats; fork changes did not help.',first_change:'Raise the rear a little: less sag, or more shock high-speed compression.'},
   {cause:'On the brakes: fork diving and staying down in the firm part of the stroke.',tell:'Shake starts when the throttle closes.',first_change:'Fork compression firmer by a small step.'},
   {cause:'At speed: rear riding high, too much weight on the front.',tell:'Nose-down, stinkbug feel at speed.',first_change:'A little more sag, or forks slightly lower in the clamps.'}],
  note:'Tightening the steering-head bearing to damp shake hides the cause; find out first whether it is an on-throttle or braking problem.'},
 {id:'rear-kick',rider_says:['rear kicks','bucks','rear end comes up','kicks sideways','back end steps out over bumps'],where:'Braking bumps, jump faces, G-outs, square edges, rocks and roots.',
  check_first:['Rider sag: too little sag makes the rear kick.','Linkage and shock bearings, and shock service hours.','Fork: a fork diving on the brakes lets the rear kick on braking bumps.'],
  ask:'Does it kick straight up or sideways, and on the first bump or building through the series?',
  likely:[
   {cause:'Shock compression too firm, most often high-speed.',tell:'Kicks sideways or tracks poorly off square edges, rocks, roots and sharp braking bumps; harsh through the feet.',first_change:'Shock high-speed compression softer by a small step.'},
   {cause:'Shock rebound too fast.',tell:'Kicks straight up after one big hit, a G-out or a jump face; feels springy.',first_change:'Shock rebound slower by a small step.'},
   {cause:'Shock rebound too slow, packing.',tell:'Fine on the first bump, lower and harsher with each one, then kicks.',first_change:'Shock rebound faster by a small step.'},
   {cause:'Compression too soft, blowing through and bouncing off the bottom.',tell:'Uses all its travel on the hit and also bottoms.',first_change:'Shock compression firmer by a small step.'}],
  note:'Riders often slow the rebound for any kick. Slow rebound kicks as much as fast rebound, and on repeated square-edged braking bumps slowing it usually makes things worse. A bike maker’s table may list only one cause; the tell decides.'},
 {id:'packing',rider_says:['packs','packs up','gets harsh in the whoops','rides low in the stroke','gets worse through the bumps','gets lower and lower'],where:'Braking bumps, whoops, acceleration chop: any series of bumps.',
  check_first:['Chain slack: a tight chain feels like packing at the rear.','Suspension service hours: worn oil fades as it heats.'],
  ask:'Is the first bump fine?',
  likely:[
   {cause:'Rebound too slow for the bump spacing at the end that packs.',tell:'First hits fine, then lower and stiffer through the section; recovers on smooth ground.',first_change:'Rebound faster by a small step at that end.'},
   {cause:'Compression too soft, letting the wheel go deep and recover late.',tell:'Bad from the first hit; also bottoms, squats or dives.',first_change:'Compression firmer by a small step at that end.'}],
  note:'Slowing rebound to stop a kick in a bump series makes packing worse.'},
 {id:'harsh-and-bottoms',rider_says:['harsh on small bumps but bottoms','harsh and bottoms','beats me up but still bottoms','no matter how soft I go it’s harsh','harsh mid-stroke'],where:'Small chop and big landings on the same lap.',
  check_first:['Static sag after setting rider sag: a spring too soft for the rider is the usual cause.','Fork air bled, legs aligned and not binding.','Travel used, from a band or o-ring on the fork tube.'],
  ask:'Does it get harsher as you click softer?',
  likely:[
   {cause:'Too soft overall (spring, air or compression), riding deep in the firm part of the stroke.',tell:'Harsher as the clickers go softer; dives; uses most of the travel all the time.',first_change:'Firmer compression as a test; confirm the spring or air for the rider’s weight.'},
   {cause:'Oil level or air-side volume wrong.',tell:'Clickers do not change the deep-stroke feel: harsh from the middle down if too high, bottoming at the end if too low.',first_change:'Service-level change to the oil level in small equal steps.'},
   {cause:'Packing from rebound that is too slow.',tell:'Harshness builds through a series of bumps.',first_change:'Rebound faster by a small step.'},
   {cause:'Binding, trapped air or a leaking seal.',tell:'Started after a service, crash or wheel change; sticky rather than damped.',first_change:'Bleed and realign the fork before touching clickers.'}],
  note:'Backing compression out on a fork that is already riding deep makes it harsher.'},
 {id:'harsh-small-chop',rider_says:['harsh on small stuff','chatter','beat up on chop','fine on big hits but harsh on small bumps','no plushness'],where:'Small chop, stutter bumps, acceleration chop, rocks.',
  check_first:['Seal drag and dry or notchy bearings: friction feels like damping.','Tire pressure.','Fork air bled.'],
  ask:'Do clicker changes make any difference, and does it get worse through a run of chop?',
  likely:[
   {cause:'Low-speed compression too firm.',tell:'Harsh on small bumps; less grip at lean; big hits fine.',first_change:'Low-speed compression softer by a small step at that end.'},
   {cause:'Rebound too slow.',tell:'Worse through a run of chop.',first_change:'Rebound faster by a small step.'},
   {cause:'Friction from seals or bearings.',tell:'Clicker changes do little; notchy or sticky by hand.',first_change:'Service the seals or bearings.'}]},
 {id:'wallow-squat',rider_says:['wallows','squats','rear sits down','pushes wide on exit','feels soft in the rear','pitches','see-saws'],where:'Corner exit under power, G-outs, rollers.',
  check_first:['Rider sag: too much sag gives the same feel.','Rear axle position after a gearing change.'],
  ask:'Is the rear low at rest too, or only once it is loaded?',
  likely:[
   {cause:'Shock high-speed compression too soft, so it sits low in motion.',tell:'Low rear once moving, wallows through rollers, front pushes on exits.',first_change:'Shock high-speed compression firmer by a small step.'},
   {cause:'Shock low-speed compression too soft.',tell:'Pitches on and off the throttle; settles deep as soon as the throttle opens.',first_change:'Shock low-speed compression firmer by a small step.'},
   {cause:'Too much sag, or a spring too soft for the rider.',tell:'Rear low even at walking speed; little static sag.',first_change:'Check static sag before adding preload; if the spring is right, a little less sag.'}],
  note:'Adding preload to stop squat that only happens under load raises the bike everywhere; specialists use high-speed compression for ride height in motion.'},
 {id:'stinkbug',rider_says:['stinkbug','rear rides high','nose down','unstable at speed','rear feels tall'],where:'Fast straights, braking zones, landings.',
  check_first:['Rider sag, measured the same way every time.','New or freshly serviced shock not yet broken in.'],
  ask:'Does sag measure correct even though the rear feels high when moving?',
  likely:[
   {cause:'Too little sag.',tell:'Rear high at rest and seated; harsh or deflecting on square edges; oversteers.',first_change:'A little more sag.'},
   {cause:'Shock high-speed compression too firm.',tell:'Sag measures right but the rear rides high once moving; kicks on deceleration.',first_change:'Shock high-speed compression softer by a small step.'},
   {cause:'The fork is the end that is low.',tell:'Front dives on the brakes; nose-down even though the rear is right.',first_change:'Fork firmer, or forks slightly lower in the clamps.'}],
  note:'Fixing only the rear when the front is the end that is low trades one imbalance for another.'},
 {id:'no-drive',rider_says:['won’t hook up','spins','no traction','rear skips','skates across the bumps','poor rear grip'],where:'Acceleration bumps and chop on corner exit, hard pack, at lean.',
  check_first:['Rear tire pressure and wear.','Chain slack: a tight chain stops the rear moving freely.','Whether it spins on smooth ground too: that is power delivery, not suspension.'],
  ask:'Does the rear skip and chatter across the bumps, or squat and wallow as the grip fades?',
  likely:[
   {cause:'Rear too firm or riding high (low-speed or high-speed compression, or too little sag).',tell:'Rear rides high and chatters across chop; rigid seat feel; worst at lean.',first_change:'Shock compression softer by a small step (high-speed first if the rear rides high); then a little more sag.'},
   {cause:'Shock rebound too slow, packing.',tell:'Loses drive more with each bump of acceleration chop.',first_change:'Shock rebound faster by a small step.'},
   {cause:'Rear too soft or riding low under load.',tell:'Squats and wallows; traction fades as it sits down out of the corner.',first_change:'Shock compression firmer by a small step.'},
   {cause:'Power delivery too abrupt for the conditions.',tell:'Spins on smooth slick ground too.',first_change:'A milder map, or a taller gear through the section.'}],
  note:'Bike makers disagree on this one; the tell decides the direction.'},
 {id:'bottoming',rider_says:['bottoms','bottoms out','clanks on landings','uses all the travel','bottoms in G-outs'],where:'Jump landings, G-outs, big braking hits.',
  check_first:['Spring or air for the rider’s weight, from sag and static sag.','Fork oil level and service hours: service items, not clicker fixes.'],
  ask:'Is the rest of the stroke comfortable, and has it got worse over time or late in the moto?',
  likely:[
   {cause:'Compression too soft at the end that bottoms.',tell:'Bottoms on landings, comfortable elsewhere.',first_change:'Compression firmer by a small step at that end (high-speed on the shock).'},
   {cause:'End-of-stroke support too low: spring, air or fork oil volume.',tell:'The middle of the stroke feels fine but the end is weak; clickers do not fix it.',first_change:'Check air or spring; raise the fork oil level in small equal steps.'},
   {cause:'Worn internals, leaking seals or hot oil.',tell:'Gets worse over time or late in the moto with no setting change.',first_change:'Service the suspension.'}],
  note:'A hard bottom once or twice a lap on the biggest hits is normal for many riders; clicking compression all the way in to stop it ruins the rest of the track.'},
 {id:'blows-through',rider_says:['blows through the stroke','no hold-up','dead','empty','stuck down','loose on jump faces'],where:'Jump faces, G-outs, corner exits.',
  check_first:['Spring or air for the rider’s weight.'],
  ask:'Does it fall through on the hit, or stay down afterwards?',
  likely:[
   {cause:'Shock high-speed compression too soft.',tell:'No hold-up in G-outs or up jump faces; rear low on the gas.',first_change:'Shock high-speed compression firmer by a small step.'},
   {cause:'Rebound too fast, unsettled.',tell:'Loose, springy feel off jumps.',first_change:'Rebound slower by a small step.'},
   {cause:'Rebound too slow, staying down.',tell:'Feels stuck down through a series of hits.',first_change:'Rebound faster by a small step.'}]},
 {id:'deflect',rider_says:['deflects','pings off','bounces off everything','won’t stay in the rut','skates off rocks'],where:'Square edges, roots, rocks, hard-pack chop.',
  check_first:['Tire pressures too high.','Fork air bled.'],
  ask:'Front or rear, and on the gas or on the brakes?',
  likely:[
   {cause:'Compression too firm at that end.',tell:'Uses little of the travel; sharp feel through bars or pegs.',first_change:'Compression softer by a small step at that end.'},
   {cause:'Front deflecting on the gas because the rear sits low and lifts the front.',tell:'Rear feels low; front light on acceleration.',first_change:'Raise the rear a little before softening the fork.'},
   {cause:'Rebound too fast.',tell:'Springs back off the bump rather than absorbing it.',first_change:'Rebound slower by a small step at that end.'}]},
 {id:'arm-pump-harsh-hands',rider_says:['arm pump','harsh in my hands','beats up my wrists','front feels stiff','fork is hard on my hands'],where:'Braking bumps and small chop, worse late in the moto.',
  check_first:['Fork air bled.','Fork binding from a misaligned axle or clamps.','Bar position, lever angle and grip pressure.'],
  ask:'Does the fork ride high, or dive and sit deep under braking?',
  likely:[
   {cause:'Fork compression or air too firm.',tell:'Front rides high, transmits small bumps, deflects.',first_change:'Fork compression softer by a small step.'},
   {cause:'Fork too soft, riding deep under braking.',tell:'Harsh off the throttle in braking bumps; front dives.',first_change:'Fork firmer as a test: if comfort improves, it was too soft.'},
   {cause:'Fork rebound too slow, packing.',tell:'Fine early in a section, harsh by the end of it.',first_change:'Fork rebound faster by a small step.'},
   {cause:'Fork rebound too fast, a busy front the rider grips harder against.',tell:'Front busy and nervous.',first_change:'Fork rebound slower by a small step.'}]},
 {id:'rear-swapping',rider_says:['rear swaps side to side','moves around under power','rear steps out on the gas'],where:'On the gas at slight lean, acceleration bumps.',
  check_first:['Rear tire pressure.','Rider sag.'],
  ask:'Does the rear feel high (stinkbug) or low (harsh out of corners)?',
  likely:[
   {cause:'Rear ride height wrong.',tell:'High: stinkbug while seated. Low: harsh and squatting out of corners.',first_change:'Move sag or shock high-speed compression toward the correct ride height.'},
   {cause:'Shock rebound too fast.',tell:'Side to side on the throttle at slight lean.',first_change:'Shock rebound slower by a small step.'}]},
];

/** Compact form supplied to the model with every question. */
export function setupKnowledge(){
 return {version:SETUP_KNOWLEDGE_VERSION,
  boundary:'BAK-authored general relationships for gas motocross setup, distilled from specialist suspension tuners, testers and suspension makers. Direction only. Not specifications for any bike, not a diagnosis, and never cited as verified evidence. Use them to reason about the rider’s own description; where the rider’s observations disagree with a guide, the observations win. Do not turn "a small step" into a clicker count unless the rider asks, and then keep it to one or two clicks from their current setting. Speak of this as what suspension tuners and testers commonly find, never as a named person’s or company’s advice.',
  work_order:workOrder,before_you_tune:beforeYouTune,triage_questions:triageQuestions,adjusters,symptom_guides:symptomGuides,
  mechanical_mimics:mechanicalMimics,air_fork_rules:airForkRules,when_clickers_run_out:whenClickersRunOut,conditions,vocabulary,open_questions:openQuestions};
}
