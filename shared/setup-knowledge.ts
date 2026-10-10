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
};
export const SETUP_KNOWLEDGE_VERSION='mx-setup-1';

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
  notes:'A kick on a single hit points to too fast; getting worse through a series points to too slow.'},
 {id:'rider_sag',name:'Rider sag (shock spring preload)',controls:'Rear ride height with the rider aboard, and so the balance of the whole bike.',
  firmer_or_more:'More sag (less preload): lower rear, more stability, lighter front.',too_much:'Front pushes and will not turn, rear feels dead and bottoms.',
  softer_or_less:'Less sag (more preload): higher rear, more front weight, quicker turn-in.',too_little:'Headshake, nervous at speed, rear kicks, poor rear traction.',
  notes:'Set sag with the rider in full gear before touching clickers. Then check static sag: very little static sag with correct rider sag means the spring is too soft for the rider; a lot means it is too stiff. The target numbers are bike-specific.'},
 {id:'tire_pressure',name:'Tire pressure',controls:'Carcass stiffness and contact patch.',
  firmer_or_more:'Higher pressure: firmer, protects the rim, more precise on hard pack.',too_much:'Deflects, less grip, harsh.',
  softer_or_less:'Lower pressure: more grip and compliance in soft or slick conditions.',too_little:'Pinch flats, rim damage, vague and squirmy.',
  notes:'Check cold, before every ride. A pressure problem is often mistaken for a suspension problem.'},
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

/** Baseline checks that must be right before clicker changes mean anything. */
export const beforeYouTune:string[]=[
 'Rider sag set with the rider in full gear, and static sag checked afterwards.',
 'Tire pressures checked cold.',
 'Fork air bled at the bleed screws with the front wheel unloaded.',
 'Front axle and fork legs aligned so the fork is not binding after the wheel was last fitted.',
 'Linkage, swingarm and steering-head bearings free of play and not notchy.',
 'Fork seals dry, and fork and shock service not overdue for the hours on the bike.',
 'Clicker positions counted and written down, so every change can be undone.',
];

export const symptomGuides:SymptomGuide[]=[
 {id:'front-push',rider_says:['front pushes','front washes','won’t bite','won’t turn','runs wide on entry','front feels vague'],where:'Flat or off-camber corners, turn-in to mid-corner.',
  check_first:['Rider sag: too much sag takes weight off the front.','Front tire pressure and tire condition.'],
  likely:[
   {cause:'Front riding high because fork compression is too firm.',tell:'Also harsh in the hands and does not dive much on the brakes.',first_change:'Fork compression softer by a small step.'},
   {cause:'Chassis balance too far rearward.',tell:'Stable in a straight line but slow to turn everywhere.',first_change:'Recheck sag; if correct, raise the forks through the clamps a small step.'},
   {cause:'Fork rebound too fast, front unloading.',tell:'Pushes more on exit as the throttle opens.',first_change:'Fork rebound slower by a small step.'}]},
 {id:'front-tuck',rider_says:['front tucks','knifes','oversteers','falls into the corner','front digs in'],where:'Corner entry, especially in ruts and soft dirt.',
  check_first:['Too little rider sag puts too much weight on the front.','Forks set too high through the clamps.'],
  likely:[
   {cause:'Front riding low because fork compression is too soft.',tell:'Dives hard under braking.',first_change:'Fork compression firmer by a small step.'},
   {cause:'Fork rebound too slow, packing down in braking bumps.',tell:'Worse after a series of bumps into the corner than on a smooth entry.',first_change:'Fork rebound faster by a small step.'}]},
 {id:'headshake',rider_says:['headshake','twitchy','nervous at speed','bars shake','unstable'],where:'Fast straights, decelerating into rough corners.',
  check_first:['Steering-head bearings for play or notches.','Front tire pressure, wheel true and spoke tension.','Too little rider sag.'],
  likely:[
   {cause:'Front low relative to the rear.',tell:'Turns very quickly but will not settle at speed.',first_change:'Add a little rider sag, or lower the forks toward flush in the clamps.'},
   {cause:'Fork diving and staying down under braking.',tell:'Shake starts when the throttle closes.',first_change:'Fork compression firmer by a small step.'}]},
 {id:'rear-kick',rider_says:['rear kicks','bucks','rear end comes up','kicks sideways','swaps'],where:'Braking bumps, jump faces, square edges.',
  check_first:['Rider sag: too little sag makes the rear kick.','Linkage and shock bearings.'],
  likely:[
   {cause:'Shock rebound too fast.',tell:'Kicks on the first or a single hit.',first_change:'Shock rebound slower by a small step.'},
   {cause:'Shock rebound too slow, packing.',tell:'Fine on the first bump, lower and harsher with each one, then kicks.',first_change:'Shock rebound faster by a small step.'},
   {cause:'Shock high-speed compression too firm.',tell:'A sharp jolt on square edges even at an easy pace.',first_change:'High-speed compression softer by a small step.'}]},
 {id:'packing',rider_says:['packs','packs up','gets harsh in the whoops','rides low in the stroke','gets worse through the bumps'],where:'Braking bumps, whoops, any repeated hits.',
  check_first:['Suspension service hours: worn oil makes damping fade as it heats.'],
  likely:[
   {cause:'Rebound too slow at the end that is packing.',tell:'That end gets lower and stiffer through the section, then recovers on smooth ground.',first_change:'Rebound faster by a small step at that end.'}]},
 {id:'harsh-and-bottoms',rider_says:['harsh on small bumps but bottoms','harsh and bottoms','beats me up but still bottoms','no plushness'],where:'Small chop and big hits on the same lap.',
  check_first:['Static sag after setting rider sag: a spring that is too soft for the rider is the usual cause.','Fork air bled; fork not binding at the axle.','Suspension service hours.'],
  likely:[
   {cause:'Spring too soft, with compression damping turned up to compensate.',tell:'Rides low, uses most of the travel all the time.',first_change:'Confirm spring rate for rider weight from the published chart before changing clickers.'},
   {cause:'Packing from rebound that is too slow.',tell:'Harshness builds through a series of bumps.',first_change:'Rebound faster by a small step.'}]},
 {id:'wallow-squat',rider_says:['wallows','squats','rear sits down','pushes wide on exit','feels soft in the rear'],where:'Corner exit under power, G-outs, rolling whoops.',
  check_first:['Rider sag: too much sag gives the same feel.'],
  likely:[
   {cause:'Shock low-speed compression too soft.',tell:'Rear settles deep as soon as the throttle opens.',first_change:'Low-speed compression firmer by a small step.'},
   {cause:'Shock spring too soft for the rider.',tell:'Needs a lot of preload to reach sag; little static sag.',first_change:'Check static sag before adding more damping.'}]},
 {id:'no-drive',rider_says:['won’t hook up','spins','no traction','rear skips','skates across the bumps'],where:'Acceleration bumps and chop on corner exit.',
  check_first:['Rear tire pressure and tire wear.','Chain adjustment: a tight chain stops the rear moving freely.'],
  likely:[
   {cause:'Shock low-speed compression too firm.',tell:'Rear rides high and chatters across chop.',first_change:'Low-speed compression softer by a small step.'},
   {cause:'Shock rebound too slow, packing.',tell:'Loses drive more with each bump.',first_change:'Shock rebound faster by a small step.'},
   {cause:'Power delivery too abrupt for the conditions.',tell:'Spins on smooth slick ground too.',first_change:'Try a milder map, or a taller gear through the corner.'}]},
 {id:'bottoming',rider_says:['bottoms','bottoms out','clanks on landings','uses all the travel'],where:'Jump landings, G-outs, big braking hits.',
  check_first:['Rider sag and static sag: spring rate for rider weight.','Fork oil level and service hours are service items, not clicker fixes.'],
  likely:[
   {cause:'Compression too soft at the end that bottoms.',tell:'Bottoms on landings but is comfortable elsewhere.',first_change:'Fork compression, or shock high-speed compression, firmer by a small step.'}]},
 {id:'deflect',rider_says:['deflects','pings off','pogo','bounces off everything','won’t stay in the rut'],where:'Square edges, roots, rocks, hard-pack chop.',
  check_first:['Tire pressures too high.','Fork air bled.'],
  likely:[
   {cause:'Compression too firm.',tell:'Uses little of the travel; sharp feel through bars or pegs.',first_change:'Compression softer by a small step at the end that deflects.'},
   {cause:'Rebound too fast.',tell:'Springs back off the bump rather than absorbing it.',first_change:'Rebound slower by a small step at that end.'}]},
 {id:'arm-pump-harsh-hands',rider_says:['arm pump','harsh in my hands','beats up my wrists','front feels stiff'],where:'Braking bumps and small chop, worse late in a moto.',
  check_first:['Fork air bled.','Fork binding from a misaligned axle or clamps.','Bar position, lever angle and grip pressure.'],
  likely:[
   {cause:'Fork compression too firm.',tell:'Front rides high and transmits small bumps.',first_change:'Fork compression softer by a small step.'},
   {cause:'Fork rebound too slow, packing.',tell:'Fine early in a section, harsh by the end of it.',first_change:'Fork rebound faster by a small step.'}]},
];

/** Compact form supplied to the model with every question. */
export function setupKnowledge(){
 return {version:SETUP_KNOWLEDGE_VERSION,
  boundary:'BAK-authored general relationships for gas motocross setup. Direction only. Not specifications for any bike, not a diagnosis, and never cited as verified evidence. Use them to reason about the rider’s own description; where the rider’s observations disagree with a guide, the observations win. Do not turn "a small step" into a clicker count unless the rider asks, and then keep it to one or two clicks from their current setting.',
  before_you_tune:beforeYouTune,adjusters,symptom_guides:symptomGuides};
}
