// Jumping: how a bike flies, how jumps are built and read, freestyle ramps, and the rules for talking about them.
// BAK's own words from standard physics and common motocross practice. Sent only when the rider's words are about jumping.
// Nothing here is a speed, gear or distance to clear a jump: those depend on the exact jump, bike and rider, and a wrong one
// puts a rider on the flat or the face of the landing.

const rules=[
 'Answer jumping, jump-building and freestyle ramp questions fully from what the rider already said. Never hold an answer back waiting for measurements or photos.',
 'Ask about a specific jump only when the answer really changes with it, at most one short question, and say it is optional. Take "I don\'t know", a guess or "it\'s at a public track" as a full answer and carry on.',
 'At most once in a conversation, and only when it would help, say that a side-on photo or rough numbers (lip angle, lip height, gap length) make the answer more specific. Do not repeat it, and never send a rider to measure a jump at a public track or while riding.',
 'Never give a speed, gear, rpm or throttle point to clear a gap, double, step-up or ramp, and never say a rider will make a jump, even when they give measurements. Explain what changes the outcome and how riders dial a jump in safely (roll it, tabletop it, follow someone of similar speed, build up a little at a time).',
 'The physics is for understanding, not a launch number. Real bikes leave the lip differently from the ideal: suspension compression and rebound, throttle at the lip, lip shape, rider input, ruts and wind all move the result. Say so when using it.',
 'Bike setup for jumping comes from this rider\'s own bike: use its verified clicker, sag and spring values and the normal setup rules. Do not invent stock values.',
 'Keep safety short and practical (spotter or riding buddy, gear, clear landing, no riding alone on big jumps). No lectures, and no refusal to talk about freestyle or big jumps.',
];

const physics={
 basics:[
  'Once the bike leaves the lip it is a thrown object: it keeps its speed along the ground and gravity pulls it down. Air drag is small at jump speeds but not zero.',
  'Distance grows with the square of speed: about 10% more speed gives about 20% more distance, and 20% more speed about 45% more. Small speed differences matter a lot, which is why consistency on the approach matters more than anything.',
  'On flat ground the ideal-projectile distance is speed² × sin(2 × lip angle) / g and the peak height is speed² × sin²(lip angle) / (2g). For the same speed, a steeper lip throws higher; up to 45° it also goes farther, past 45° it goes higher but shorter. Real jumps land on a raised landing, so the numbers only show the shape of the change, never a launch speed.',
  'The bike comes down at about the same angle it left the lip if the landing is at takeoff height. A landing ramp that matches that angle turns the fall into a forward roll; a flat or too-short landing makes the suspension and the rider absorb the whole drop.',
 ],
 real_world:[
  'Lip kick: as the bike climbs the face the rear shock compresses, then rebounds at the top. Rebound that pushes the rear up throws the nose down (nose-heavy, endo risk). Rebound that is slow or a rider who stays loose lets the bike stay level. A kink near the top of the face makes this much worse.',
  'Throttle and brake in the air: speeding up the rear wheel (throttle) lifts the front; tapping the rear brake drops the front. Throttle on the face also squats the rear and helps lift the front. Chopping the throttle on the face drops the nose.',
  'Preloading (pushing the bike into the face with the legs) adds height; absorbing or scrubbing the lip takes it away. Two riders at the same speed can fly very differently.',
  'Ruts in a face steer the front wheel and can pitch the bike sideways. A lip that has worn steeper or chopped up during the day throws differently than it did in the morning.',
  'Headwind shortens a jump, tailwind lengthens it, crosswind drifts the bike. Freestyle riders check wind before every session.',
 ],
 casing_vs_overjumping:[
  'Casing (landing short, on the deck or the landing face edge) usually means too little speed or a soft lip. On a tabletop it is a hard but survivable hit; on a gap it is a crash.',
  'Overjumping (landing past the landing ramp, to flat) is often the worse injury: the full drop goes into the bike and rider.',
  'The target is the downslope of the landing, near the top of it.',
 ],
};

const building=[
 'Tabletops before gaps: a table forgives coming up short. Build and ride a table, and only open a gap once the jump is cleared easily every time.',
 'Build the landing first and make it long: a landing that is too short or too steep for the takeoff is the most common backyard mistake. A landing ramp that is longer than the takeoff face gives room for being long or short.',
 'Make the takeoff a smooth curve that steepens gradually, with no kink near the top. The face should be long enough that the whole bike is on it as the front leaves the lip; a short, steep kicker throws the bike.',
 'Moist dirt packed in layers holds its shape; clay-heavy soil holds best, sand washes out and ruts fast. Re-pack and re-shape lips as they wear.',
 'Leave a long, straight approach so speed is set before the face, with no shifting on the face. Leave clear run-out past the landing: no trees, posts, fences, rocks or equipment.',
 'Make the lip and landing wide enough for a small mistake left or right.',
 'Start small and change one thing at a time: a little more lip height or a little more gap, then ride it until it is easy.',
];

const freestyle={
 ramps:[
  'Freestyle ramps are usually steel or aluminum ramps with a fixed angle and shape, landing onto a built dirt landing or a deck. Ramp makers publish their own guidance for their ramps; follow the maker\'s guidance for the ramp in use.',
  'Riders make speed repeatable with a marked start point, the same gear and a known throttle or rpm reference, and they adjust in small steps from a distance they already clear.',
  'A steeper ramp throws higher and gives more time for tricks but lands steeper; a mellower ramp is faster and flatter. Changing ramps means starting the distance over.',
  'Progression for tricks is a foam pit or an airbag landing first, then a dirt landing. Big gaps get a spotter and someone ready to help.',
  'Wind, ramp grip (wet or dusty steel) and the landing\'s condition are checked before every session.',
 ],
 setup:[
  'Freestyle bikes usually run stiffer springs and more compression than a racing setup, to hold up on big, flat-ish impacts, and many riders change bars, seat and grab handles. These are rider and team choices; there is no single published number.',
 ],
};

const bikeSetup=[
 'Kicks at the lip (rear rises, nose drops): first check sag; then slow the rear rebound a little; a too-soft rear spring or a fork diving on the face also make it worse.',
 'Bottoming on landings: correct spring for the rider weight first, then more compression (high-speed for big hits), and for the fork, oil level or air pressure where the bike has it.',
 'Bike dives or feels nose-heavy on take-off and landing: fork too soft or too little fork compression, or the rider\'s weight too far forward.',
 'Harsh on landings: too much compression or too stiff a spring; check that sag and springs match the rider before going stiffer.',
 'Change one clicker at a time in small steps and ride the same jump to compare.',
];

const reading={
 at_public_tracks:[
  'Walk the track first (where allowed) and look at each jump\'s face, lip and landing; watch faster riders and where they leave the ground and land.',
  'Roll the jump, then jump it partially or tabletop it, and follow a rider of similar speed before trying a gap.',
  'Rough size without tools: pace it off (a walking step is roughly 2-3 ft, a rough guide only), or compare with a bike parked next to it.',
 ],
 measuring_if_they_can:[
  'Lip angle: a phone level laid flat on the face near the top (the iPhone Measure app has a Level; Android phones need a level app). Good to about a degree.',
  'Lip height and gap length: a tape measure. Only on the rider\'s own jump or when the track allows it.',
 ],
 photos:[
  'A side-on photo, phone held level, at the same height as the jump, shows the shape: a smooth face or a kink, ruts and chop on the lip, a landing too short or flat for the takeoff, run-out room and dirt condition. Say what is seen and how confident the reading is.',
  'From a photo, an angle is a rough estimate only (often off by 5-10 degrees from camera tilt, lens and viewing angle): give it as a range and say it is rough. Never give heights or distances from a photo unless something of known size is next to the jump; if this rider\'s bike is in the frame, its published overall length can give a rough scale.',
  'A photo never turns into a speed or a promise that a jump can be cleared.',
 ],
};

const WORDS=/\b(jump(s|ed|ing)?|lip|lips|take ?off|tabletop|table top|step[- ]?(up|down)|double|triple|kicker|kicky|kicks? (me|up|the rear)|cas(e|ed|ing)|over ?jump(ed|ing)?|gap(s|ped)?|landing|whip|scrub|freestyle|fmx|ramp|backyard track|trajectory|air ?time|in the air|nose (dive|dives|heavy|high|down)|endo|loop(ed)? out|flip)\b/i;

/** The jumping module when the rider's words are about jumping, else null. */
export function jumpingKnowledgeFor(text:string){
 if(!WORDS.test(text))return null;
 return {rules,physics,building,freestyle,bike_setup_for_jumping:bikeSetup,reading_a_jump:reading};
}
