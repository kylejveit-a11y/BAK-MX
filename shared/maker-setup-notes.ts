/** Setup facts a parts maker publishes for its own kit (install guide or owner's manual), attached to a part on the rider's
 *  build sheet so Ask BAK can answer "how do I set this up" for a modified bike with the maker's numbers instead of the
 *  stock bike's. Facts only, in our words; each entry names the document it was read from. Added only after reading the
 *  maker's document, never from memory. `makes` limits an entry to the bikes the document covers. */
export type MakerSetup={title:string;facts:string[];source:string;read:string};
const KTM_GROUP=['KTM','Husqvarna','GasGas'];
const entries:{match:RegExp;makes?:string[];setup:MakerSetup}[]=[
 {match:/rekluse.*radius\s?cx/i,makes:KTM_GROUP,setup:{title:'Rekluse RadiusCX on KTM / Husqvarna / GasGas hydraulic (DDS) clutches',read:'2026-11-20',
  source:'Rekluse RadiusCX Install Guide, KTM DDS (document 191-7901A)',
  facts:[
   'Free play gain is the one check that matters, before every ride: in neutral, engine warmed 2-3 minutes, rev to about 5,000-7,000 rpm and let it return to idle; the lever should move in about 3 mm (1/8 in) at the ball end.',
   'Adjust at the slave cylinder adjuster screw (4 mm hex), one tick mark at a time, final adjustment with the bike warm: lever moves more than 3 mm, turn clockwise 1-2 marks; less than 3 mm, turn counterclockwise 1-2 marks.',
   'First installed-gap setting: from the point where resistance first rises, turn clockwise 1 full turn plus 2 tick marks, then set free play gain.',
   'Break-in after install or after new friction disks, EXP bases, pads or wedges: 10 revs in neutral back to idle each time, 10 roll-on starts in first gear to about 5,000 rpm and stop, 10 in second gear, then recheck free play gain.',
   'Too little free play gain (lever barely moves): the clutch slips, the bike feels down on power and the clutch can burn up. Too much (lever moves far in): drag, stalling and hard shifting.',
   'Idle: set so there is slight drag in gear when warm; the bike should not creep at closed throttle but should move with a small throttle opening.',
   'Oil: clean JASO MA or MA2 oil; soak new friction disks and the EXP disk in fresh oil at least 5 minutes before fitting. Centre clutch nut 68 N·m (50 lbf-ft).',
   'Do not ride with the gap unset, and do not make third-gear starts. To bump start, back the slave cylinder adjuster out (counterclockwise) until there is no resistance, start it, then reset the installed gap.',
   'A squeal or chatter at low rpm is generally harmless and gap adjustment does not change it; fresh oil can reduce it. Friction-disk wear limits are on the kit\'s own setup sheet.']}},
 {match:/xact\s?pro\s?7548/i,makes:KTM_GROUP,setup:{title:'WP XACT PRO 7548 Cone Valve fork (KTM / Husqvarna / GasGas motocross models)',read:'2026-11-20',
  source:'WP XACT PRO 7548 Owner\'s Manual (art. no. 53000285en, 07/2023)',
  facts:[
   'Counting: turn each adjuster clockwise to the last click you can feel, then back out the listed number of clicks. Clockwise adds damping. Compression is on top of the legs, rebound at the bottom under the protection caps.',
   'Compression, clicks out (comfort / standard / sport): 125 SX, TC 125, MC 125: 17 / 14 / 11. 250 SX, 350 and 450 SX-F, TC 250, FC 350 and 450, MC 250, MC 350F and 450F: 15 / 12 / 9. 250 SX-F, FC 250, MC 250F: 16 / 13 / 10.',
   'Rebound, clicks out (comfort / standard / sport): 125 SX, 250 and 450 SX-F, TC 125, FC 250 and 450, MC 125, MC 250F and 450F: 23 / 20 / 17. 250 SX, TC 250, MC 250: 21 / 18 / 15. 350 SX-F, FC 350, MC 350F: 24 / 21 / 18.',
   'Spring preload adjuster: counted clockwise from fully out, one turn is two clicks, and it only holds at a click; the listed setting is 0 turns.',
   'The standard springs are for a rider of 75-85 kg (165-187 lb). Small differences are taken up with preload; larger ones need different springs from a WP Authorized Center. The manual gives no spring rates and says no exact riding sag can be set for the fork.',
   'Service: fork service every 40 hours (WP also recommends one after the first 10 hours); before every ride clean the dust boots and bleed the air from both legs.',
   'Fork oil SAE 4. Fork length 950 mm on KTM and GasGas, 940 mm on Husqvarna. Axle and clamp torques follow the bike maker\'s figures.']}},
];
/** The maker's setup notes for a fitted part, by the name it is listed under. Null when BAK has not read that maker's document. */
export function makerSetupFor(listedAs:string,make?:string):MakerSetup|null{
 const e=entries.find(x=>x.match.test(listedAs)&&(!x.makes||!make||x.makes.includes(make)));
 return e?e.setup:null;
}
