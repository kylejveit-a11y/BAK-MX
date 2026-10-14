/** Manufacturer-published suspension symptom guidance, by make.
 *
 * Yamaha prints the same "Suspension setting" tables (front fork and rear shock absorber: symptom, where on the track,
 * what to check, which way to adjust) in the Tuning chapter of every YZ / YZ-X / YZ-FX Owner's Service Manual from 2020 to
 * 2027 that BAK holds; the 2020-2023, 2024 and 2025-on editions differ only in layout and hyphenation (compared word by
 * word, docs/research/suspension-knowledge/OEM_SETUP_GUIDANCE_2026-10-14.md). The rows below restate that guidance in
 * BAK's own words. They carry no numbers: the manual's step sizes and its sag figure are bike-specific and come only from
 * verified claims for the exact bike. Sent to Ask BAK only for a bike whose manual was checked (`sources`).
 */
/** `models`: the check applies only to these models (a manual shared across a range can print a check for some of them). */
export type GuidanceCheck={item:string;direction:string;models?:string[]};
export type GuidanceRow={id:string;end:'front fork'|'rear shock'|'front and rear';symptom:string;rider_says:string[];where:string[];cause?:string;checks:GuidanceCheck[];note?:string};
export type GuidanceSet={manufacturer:string;document_title:string;how_the_manual_says_to_use_it:string[];sources:GuidanceSource[];rows:GuidanceRow[]};
export type GuidanceSource={model:string;model_year:number;document:string;pdf_pages:number[]};
export const MANUFACTURER_GUIDANCE_VERSION='oem-setup-2';

const firmer='Firmer: more damping (adjuster turned in, clockwise on this bike).';
const softer='Softer: less damping (adjuster turned out, counterclockwise on this bike).';

export const yamahaGuidance:GuidanceSet={
 manufacturer:'Yamaha',
 document_title:'Yamaha Owner’s Service Manual, Tuning chapter: Suspension setting (front fork) and Suspension setting (rear shock absorber)',
 how_the_manual_says_to_use_it:[
  'Start from the standard settings, and change one item at a time in the small steps the table gives.',
  'Set the rear sunken length (rider sag) to the standard figure before changing anything on the fork.',
  'The check column lists the items to look at for that symptom, not changes to make all at once.',
 ],
 sources:[
 {model:'YZ125X',model_year:2021,document:'B1B-2819U-10',pdf_pages:[264,265,266]},
 {model:'YZ125X',model_year:2022,document:'B1B-2819U-11',pdf_pages:[264,265,266]},
 {model:'YZ125X',model_year:2023,document:'BRX-2819U-10',pdf_pages:[273,274,275]},
 {model:'YZ125X',model_year:2024,document:'BRX-2819U-11',pdf_pages:[273,274,275]},
 {model:'YZ125X',model_year:2025,document:'DF3-2819U-10',pdf_pages:[294,295,296]},
 {model:'YZ125X',model_year:2026,document:'DF3-2819U-11',pdf_pages:[294,295,296]},
 {model:'YZ125X',model_year:2027,document:'DF3-2819U-12',pdf_pages:[294,295,296]},
 {model:'YZ125',model_year:2021,document:'B0V-2819U-10',pdf_pages:[264,265,266]},
 {model:'YZ125',model_year:2022,document:'B4X-2819U-10',pdf_pages:[273,274,275]},
 {model:'YZ125',model_year:2023,document:'B4X-2819U-11',pdf_pages:[273,274,275]},
 {model:'YZ125',model_year:2024,document:'B4X-2819U-12',pdf_pages:[271,272,273]},
 {model:'YZ125',model_year:2025,document:'D68-2819U-10',pdf_pages:[292,293,294]},
 {model:'YZ125',model_year:2026,document:'D68-2819U-11',pdf_pages:[292,293,294]},
 {model:'YZ125',model_year:2027,document:'D68-2819U-12',pdf_pages:[292,293,294]},
 {model:'YZ250FX',model_year:2021,document:'BAJ-2819U-11',pdf_pages:[369,370,371]},
 {model:'YZ250FX',model_year:2022,document:'BAJ-2819U-12',pdf_pages:[369,370,371]},
 {model:'YZ250FX',model_year:2023,document:'BAJ-2819U-13',pdf_pages:[369,370,371]},
 {model:'YZ250FX',model_year:2024,document:'BAJ-2819U-14',pdf_pages:[369,370,371]},
 {model:'YZ250FX',model_year:2025,document:'BXA-2819U-10',pdf_pages:[401,402,403]},
 {model:'YZ250FX',model_year:2026,document:'DP3-2819U-10',pdf_pages:[403,404,405]},
 {model:'YZ250FX',model_year:2027,document:'DP3-2819U-11',pdf_pages:[403,404,405]},
 {model:'YZ250F',model_year:2020,document:'B7B-28199-11',pdf_pages:[355,356,357]},
 {model:'YZ250F',model_year:2021,document:'B7B-2819U-12',pdf_pages:[359,360,361]},
 {model:'YZ250F',model_year:2022,document:'B7B-2819U-13',pdf_pages:[359,360,361]},
 {model:'YZ250F',model_year:2023,document:'BSB-2819U-10',pdf_pages:[357,358,359]},
 {model:'YZ250F',model_year:2024,document:'BMF-2819U-10',pdf_pages:[380,381,382]},
 {model:'YZ250F',model_year:2025,document:'D01-2819U-10',pdf_pages:[391,392,393]},
 {model:'YZ250F',model_year:2026,document:'DR8-2819U-10',pdf_pages:[392,393,394]},
 {model:'YZ250F',model_year:2027,document:'D05-2819U-10',pdf_pages:[414,415,416]},
 {model:'YZ250X',model_year:2022,document:'BF1-2819U-11',pdf_pages:[271,272,273]},
 {model:'YZ250X',model_year:2023,document:'BRY-2819U-10',pdf_pages:[272,273,274]},
 {model:'YZ250X',model_year:2024,document:'BRY-2819U-11',pdf_pages:[272,273,274]},
 {model:'YZ250X',model_year:2025,document:'DF4-2819U-10',pdf_pages:[290,291,292]},
 {model:'YZ250X',model_year:2026,document:'DF4-2819U-11',pdf_pages:[290,291,292]},
 {model:'YZ250X',model_year:2027,document:'DF4-2819U-12',pdf_pages:[290,291,292]},
 {model:'YZ250',model_year:2022,document:'BCR-2819U-10',pdf_pages:[270,271,272]},
 {model:'YZ250',model_year:2023,document:'BCR-2819U-11',pdf_pages:[270,271,272]},
 {model:'YZ250',model_year:2024,document:'BCR-2819U-12',pdf_pages:[270,271,272]},
 {model:'YZ250',model_year:2025,document:'D69-2819U-10',pdf_pages:[288,289,290]},
 {model:'YZ250',model_year:2026,document:'D69-2819U-11',pdf_pages:[288,289,290]},
 {model:'YZ250',model_year:2027,document:'D69-2819U-12',pdf_pages:[288,289,290]},
 {model:'YZ450FX',model_year:2021,document:'BEX-2819U-10',pdf_pages:[365,366,367]},
 {model:'YZ450FX',model_year:2022,document:'BEX-2819U-11',pdf_pages:[365,366,367]},
 {model:'YZ450FX',model_year:2023,document:'BEX-2819U-12',pdf_pages:[367,368,369]},
 {model:'YZ450FX',model_year:2024,document:'BNL-2819U-10',pdf_pages:[395,396,397]},
 {model:'YZ450FX',model_year:2025,document:'BNL-2819U-11',pdf_pages:[393,394,395]},
 {model:'YZ450FX',model_year:2026,document:'DP1-2819U-10',pdf_pages:[395,396,397]},
 {model:'YZ450FX',model_year:2027,document:'DP5-2819U-10',pdf_pages:[405,406,407]},
 {model:'YZ450F',model_year:2020,document:'B2W-28199-10',pdf_pages:[355,356,357]},
 {model:'YZ450F',model_year:2021,document:'B2W-2819U-11',pdf_pages:[359,360,361]},
 {model:'YZ450F',model_year:2022,document:'B2W-2819U-12',pdf_pages:[357,358,359]},
 {model:'YZ450F',model_year:2023,document:'BHR-2819U-10',pdf_pages:[379,380,381]},
 {model:'YZ450F',model_year:2024,document:'BHR-2819U-11',pdf_pages:[378,379,380]},
 {model:'YZ450F',model_year:2025,document:'D02-2819U-10',pdf_pages:[387,388,389]},
 {model:'YZ450F',model_year:2026,document:'D03-2819U-10',pdf_pages:[398,399,400]},
 {model:'YZ450F',model_year:2027,document:'D03-2819U-11',pdf_pages:[399,400,401]},
 ],
 rows:[
  {id:'yf-stiff-entire',end:'front fork',symptom:'Stiff through the whole stroke',rider_says:['fork is harsh everywhere','front feels stiff','beats up my hands'],where:['jumps','large bumps','medium bumps'],
   checks:[{item:'Fork compression damping',direction:softer},{item:'Fork oil amount (air spring)',direction:'Less oil.'},{item:'Fork spring',direction:'Softer spring.'}]},
  {id:'yf-unsmooth',end:'front fork',symptom:'Movement not smooth anywhere in the stroke',rider_says:['fork feels sticky','notchy fork','fork binds'],where:['jumps','large bumps','medium bumps','small bumps'],
   checks:[{item:'Outer and inner tubes',direction:'Look for bends, dents or scoring; replace damaged parts.'},{item:'Fork bushings (slide metals)',direction:'Replace if worn past use.'},{item:'Damper piston band (piston metal)',direction:'Replace if worn past use.'},{item:'Lower bracket (bottom clamp) bolts',direction:'Retighten to the published torque.'}]},
  {id:'yf-poor-initial',end:'front fork',symptom:'Poor initial movement on small bumps',rider_says:['fork doesn’t move on small stuff','no small-bump compliance','top of the stroke is stiff'],where:['small bumps'],
   checks:[{item:'Fork rebound damping',direction:'Less rebound damping (faster return).'},{item:'Oil seals',direction:'Grease the oil seal lip.'}]},
  {id:'yf-soft-bottoms',end:'front fork',symptom:'Soft through the whole stroke and bottoms',rider_says:['fork is too soft','front bottoms','dives and bottoms'],where:['jumps','large bumps'],
   checks:[{item:'Fork compression damping',direction:firmer},{item:'Fork oil amount (air spring)',direction:'More oil.'},{item:'Fork spring',direction:'Stiffer spring.'}]},
  {id:'yf-stiff-end',end:'front fork',symptom:'Stiff near the end of the stroke',rider_says:['harsh at the bottom of the stroke','doesn’t use all the travel','stiff on big landings'],where:['jumps'],
   checks:[{item:'Fork oil amount (air spring)',direction:'Less oil.'}]},
  {id:'yf-soft-end',end:'front fork',symptom:'Soft near the end of the stroke and bottoms',rider_says:['bottoms on landings','clanks on big hits'],where:['jumps'],
   checks:[{item:'Fork oil amount (air spring)',direction:'More oil.'}]},
  {id:'yf-stiff-initial',end:'front fork',symptom:'Stiff at the start of the stroke',rider_says:['harsh on initial hits','deflects off small bumps'],where:['jumps','large bumps','medium bumps','small bumps'],
   checks:[{item:'Fork compression damping',direction:softer}]},
  {id:'yf-low-front',end:'front fork',symptom:'Front rides low (front-down posture)',rider_says:['front sits low','front tucks','front dives'],where:['medium bumps','small bumps'],
   checks:[{item:'Fork compression damping',direction:firmer},{item:'Fork rebound damping',direction:'Less rebound damping (faster return).'},{item:'Balance with the rear',direction:'Rider sag toward the upper end of the standard figure (more sag), so the rear sits lower.'},{item:'Fork oil amount (air spring)',direction:'More oil.'}]},
  {id:'yf-high-front',end:'front fork',symptom:'Front rides high (front-up posture)',rider_says:['front rides high','front won’t settle','front pushes'],where:['medium bumps','small bumps'],
   checks:[{item:'Fork compression damping',direction:softer},{item:'Balance with the rear',direction:'Rider sag toward the lower end of the standard figure (less sag), so the rear sits higher.'},{item:'Fork spring',direction:'Softer spring.'},{item:'Fork oil amount (air spring)',direction:'Less oil.'}]},
  {id:'yr-stiff-sinks',end:'rear shock',symptom:'Stiff and sinking (rear rides low and harsh)',rider_says:['rear packs','rear sits down and gets harsh','rear rides low'],where:['medium bumps','small bumps'],
   checks:[{item:'Shock rebound damping',direction:'Less rebound damping (faster return).'},{item:'Spring set length (rider sag)',direction:'Set within the standard figure.'}]},
  {id:'yr-spongy',end:'rear shock',symptom:'Spongy and unstable',rider_says:['rear feels soft and vague','wallows','rear moves around'],where:['medium bumps','small bumps'],
   checks:[{item:'Shock rebound damping',direction:'More rebound damping (slower return).'},{item:'Shock low-speed compression',direction:firmer},{item:'Shock spring',direction:'Stiffer spring.'}]},
  {id:'yr-heavy',end:'rear shock',symptom:'Heavy and dragging',rider_says:['rear feels dead','rear drags','rear is slow to come back'],where:['medium bumps','small bumps'],
   checks:[{item:'Shock rebound damping',direction:'Less rebound damping (faster return).'},{item:'Shock spring',direction:'Softer spring.'}]},
  {id:'yr-poor-grip',end:'rear shock',symptom:'Poor rear grip on small bumps',rider_says:['rear won’t hook up','no rear traction','rear skips on chop'],where:['small bumps'],
   checks:[{item:'Shock rebound damping',direction:'Less rebound damping (faster return).'},{item:'Shock low-speed compression',direction:firmer},{item:'Shock high-speed compression',direction:firmer},{item:'Spring set length (rider sag)',direction:'Set within the standard figure.'},{item:'Shock spring',direction:'Softer spring.'}]},
  {id:'yr-bottoms',end:'rear shock',symptom:'Rear bottoms',rider_says:['rear bottoms','clanks on landings','uses all the rear travel'],where:['jumps','large bumps'],
   checks:[{item:'Shock high-speed compression',direction:firmer},{item:'Spring set length (rider sag)',direction:'Set within the standard figure.'},{item:'Shock spring',direction:'Stiffer spring.'}]},
  {id:'yr-bouncing',end:'rear shock',symptom:'Rear bounces',rider_says:['rear bucks','rear kicks up after landings','rear pogos'],where:['jumps','large bumps'],
   checks:[{item:'Shock rebound damping',direction:'More rebound damping (slower return).'},{item:'Shock spring',direction:'Softer spring.'}]},
  {id:'yr-stiff-travel',end:'rear shock',symptom:'Stiff through the travel on big hits',rider_says:['rear is harsh on big hits','rear kicks off square edges','rear doesn’t use its travel'],where:['jumps','large bumps'],
   checks:[{item:'Shock high-speed compression',direction:softer},{item:'Spring set length (rider sag)',direction:'Set within the standard figure.'},{item:'Shock spring',direction:'Softer spring.'}]},
 ],
};


const more='More damping (adjuster turned in, clockwise).',less='Less damping (adjuster turned out, counterclockwise).';
/** Kawasaki prints the same Tuning chapter (Suspension: introduction, front fork oil amount, troubleshooting improper
 *  settings, basic readjustment, front and rear compatibility inspection, front and rear suspension troubleshooting) in every
 *  KX owner's manual 2020-2026 that BAK holds; the KX250 / KX250X manuals leave out the fork spring preload items. */
export const kawasakiGuidance:GuidanceSet={
 manufacturer:'Kawasaki',
 document_title:'Kawasaki KX Owner’s Manual, Tuning chapter: Suspension (troubleshooting improper settings; front and rear suspension troubleshooting)',
 how_the_manual_says_to_use_it:[
  'Break the suspension in with riding before judging or changing it.',
  'Rider weight, ability and track conditions decide the setup; riding style and position also matter, so test a change of riding position before changing the suspension.',
  'Make changes in small steps, keep the front and rear balanced (a change at one end may need one at the other), ride consistently when judging, and write down the settings that work for each track.',
  'Keep the swingarm and linkage bearings lubricated so friction does not mask the setting.',
  'Fork oil amount mostly changes the end of the fork stroke: more oil makes the air spring more progressive and the bottom of the stroke firmer; less oil does the opposite.',
  'Standard settings suit a medium-weight rider of intermediate ability: heavier or experienced riders generally need a harder spring, lighter riders or beginners a softer spring (beginners also lighter rebound damping).',
  'Course type: many corners, lower the front slightly (raise the fork tubes in the clamps) for quicker steering; fast course, deep dips or sand, raise the front slightly for stability.',
  'Front and rear compatibility: with the bike upright, push down hard on the footpeg; if the bike stays level the spring rates are balanced. Seated in riding position, if one end drops noticeably more than the other, readjust for better balance.',
 ],
 sources:[
 {model:'KX250',model_year:2020,document:'99803-0080',pdf_pages:[178,179,180,181,182,183]},
 {model:'KX450',model_year:2020,document:'99803-0044',pdf_pages:[185,186,187,188,189,190]},
 {model:'KX250X',model_year:2021,document:'99803-0184',pdf_pages:[192,193,194,195,196,197]},
 {model:'KX450',model_year:2021,document:'99803-0181',pdf_pages:[185,186,187,188,189,190]},
 {model:'KX450X',model_year:2021,document:'99803-0182',pdf_pages:[191,192,193,194,195,196]},
 {model:'KX250',model_year:2022,document:'99803-0214',pdf_pages:[196,197,198,199,200,201]},
 {model:'KX250X',model_year:2022,document:'99803-0214',pdf_pages:[196,197,198,199,200,201]},
 {model:'KX450',model_year:2022,document:'99803-0216',pdf_pages:[194,195,196,197,198,199]},
 {model:'KX450X',model_year:2022,document:'99803-0216',pdf_pages:[194,195,196,197,198,199]},
 {model:'KX250',model_year:2023,document:'99803-0306',pdf_pages:[195,196,197,198,199,200]},
 {model:'KX250X',model_year:2023,document:'99803-0306',pdf_pages:[195,196,197,198,199,200]},
 {model:'KX450',model_year:2023,document:'99803-0308',pdf_pages:[194,195,196,197,198,199]},
 {model:'KX450X',model_year:2023,document:'99803-0308',pdf_pages:[194,195,196,197,198,199]},
 {model:'KX250',model_year:2024,document:'99803-0400',pdf_pages:[193,194,195,196,197,198]},
 {model:'KX250X',model_year:2024,document:'99803-0400',pdf_pages:[193,194,195,196,197,198]},
 {model:'KX450',model_year:2024,document:'99803-0401',pdf_pages:[193,194,195,196,197,198]},
 {model:'KX450X',model_year:2024,document:'99803-0402',pdf_pages:[194,195,196,197,198,199]},
 {model:'KX250',model_year:2025,document:'99814-0061',pdf_pages:[193,194,195,196,197,198]},
 {model:'KX250X',model_year:2025,document:'99814-0062',pdf_pages:[194,195,196,197,198,199]},
 {model:'KX450',model_year:2025,document:'99814-0003',pdf_pages:[205,206,207,208,209,210]},
 {model:'KX450X',model_year:2025,document:'99814-0003',pdf_pages:[205,206,207,208,209,210]},
 {model:'KX250',model_year:2026,document:'99814-0119',pdf_pages:[199,200,201,202,203,204]},
 {model:'KX250X',model_year:2026,document:'99814-0119',pdf_pages:[199,200,201,202,203,204]},
 {model:'KX450',model_year:2026,document:'99814-0121',pdf_pages:[209,210,211,212,213,214]},
 {model:'KX450X',model_year:2026,document:'99814-0121',pdf_pages:[209,210,211,212,213,214]},
 ],
 rows:[
  {id:'kf-hard-spring',end:'front fork',symptom:'Front too hard (spring too stiff)',rider_says:['fork is too stiff','front is harsh','fork feels hard'],where:['anywhere'],
   checks:[{item:'Fork rebound and compression damping',direction:'Check they are set correctly.'},{item:'Fork spring',direction:'May be too hard.'},{item:'Fork oil amount',direction:'May be too high.'}]},
  {id:'kf-hard-end',end:'front fork',symptom:'Fork stiffens at the end of the stroke',rider_says:['fork gets harsh at the bottom','doesn’t use all the fork travel','stiff on landings'],where:['jumps','big hits'],
   checks:[{item:'Fork oil amount',direction:'May be too high.'},{item:'Air in the fork',direction:'Pressure may have built up: bleed it.'},{item:'Fork spring preload',direction:'May be too high.',models:['KX450','KX450X']}]},
  {id:'kf-hard-ok-spring',end:'front fork',symptom:'Spring right but fork still too hard',rider_says:['fork is harsh even with the right spring','fork got harsh over time'],where:['anywhere'],
   checks:[{item:'Fork oil',direction:'May be worn out: service it.'},{item:'Air in the fork',direction:'Pressure may have built up: bleed it.'},{item:'Fork spring preload',direction:'May be too high.',models:['KX450','KX450X']}]},
  {id:'kf-dives',end:'front fork',symptom:'Fork dives too much under braking and deceleration',rider_says:['front dives','fork dives under braking','front is too soft'],where:['braking'],
   checks:[{item:'Fork oil amount',direction:'May be too low.'},{item:'Fork springs',direction:'May be too soft.'},{item:'Fork oil',direction:'May be worn out.'},{item:'Fork rebound and compression damping',direction:'Check they are set correctly.'},{item:'Fork spring preload',direction:'May be too low.',models:['KX450','KX450X']}]},
  {id:'kr-stiff',end:'rear shock',symptom:'Rear too stiff',rider_says:['shock is harsh','rear is too stiff'],where:['anywhere'],
   checks:[{item:'Shock compression damping',direction:'May be too high.'},{item:'Shock spring',direction:'May be too hard.'}]},
  {id:'kr-hard-ok-spring',end:'rear shock',symptom:'Spring right but rear still too hard',rider_says:['rear is harsh even with the right spring','rear feels tight'],where:['anywhere'],
   checks:[{item:'Shock rebound damping',direction:'May be too high for the spring (unbalanced): less rebound damping.'},{item:'Shock spring preload',direction:'May be too high.'}]},
  {id:'kr-bottoms-high-jump',end:'rear shock',symptom:'Rear bottoms landing a high jump, otherwise fine',rider_says:['rear bottoms on big jumps','shock bottoms on landings'],where:['jumps'],
   checks:[{item:'Shock spring preload or compression damping',direction:'May be too low.'},{item:'Shock spring',direction:'May be too soft.'},{item:'Shock oil',direction:'May be worn out.'}]},
  {id:'kt-surge',end:'front fork',symptom:'Front surges downhill or when accelerating out of a corner',rider_says:['front surges','front wallows downhill','front pitches on the gas'],where:['downhills','corner exit'],cause:'Front suspension too soft.',
   checks:[{item:'Fork compression or rebound damping',direction:more},{item:'Fork oil amount',direction:'More oil.'},{item:'Fork spring',direction:'Optional harder spring.'},{item:'Fork spring preload',direction:'More preload.',models:['KX450','KX450X']}]},
  {id:'kt-knifes',end:'front fork',symptom:'Front knifes or oversteers in turns (turns in too much)',rider_says:['front knifes','front tucks','oversteers','falls into the corner'],where:['corners'],cause:'Front suspension too soft.',
   checks:[{item:'Fork compression or rebound damping',direction:more},{item:'Fork oil amount',direction:'More oil.'}],note:'Heavier or expert riders may need a harder fork spring, or more fork spring preload where this bike’s manual lists it.'},
  {id:'kt-pushes',end:'front fork',symptom:'Front pushes or washes out in turns',rider_says:['front pushes','front washes out','won’t bite','runs wide'],where:['corners'],cause:'Front suspension too stiff.',
   checks:[{item:'Fork compression or rebound damping',direction:less},{item:'Air in the fork',direction:'Bleed the fork.'},{item:'Fork oil amount',direction:'Less oil.'},{item:'Fork spring',direction:'Softer spring.'},{item:'Fork spring preload',direction:'Less preload.',models:['KX450','KX450X']}],note:'Lighter or less experienced riders may need a softer fork spring.'},
  {id:'kt-small-bumps',end:'front fork',symptom:'Front does not respond to small bumps in sweeping turns',rider_says:['fork doesn’t soak up small bumps','front chatters in sweepers','harsh on small stuff'],where:['sweeping turns','small bumps'],cause:'Front suspension too hard.',
   checks:[{item:'Fork compression or rebound damping',direction:less},{item:'Fork oil amount',direction:'Less oil.'},{item:'Fork spring',direction:'Softer spring.'},{item:'Fork spring preload',direction:'Less preload.',models:['KX450','KX450X']}]},
  {id:'kt-rear-kicks-braking',end:'rear shock',symptom:'Rear kicks when braking over bumps',rider_says:['rear kicks in braking bumps','rear end bucks on the brakes'],where:['braking bumps'],cause:'Shock rebound damping may be too low.',
   checks:[{item:'Shock rebound damping',direction:'More rebound damping (slower return).'}]},
  {id:'kt-no-hookup',end:'rear shock',symptom:'Rear tire does not hook up out of corners',rider_says:['rear won’t hook up','no traction out of turns','rear spins on exit'],where:['corner exit'],cause:'Shock may be too stiff.',
   checks:[{item:'Shock spring preload',direction:'Less preload.'},{item:'Shock high-speed and low-speed compression',direction:less},{item:'Shock spring',direction:'Softer spring, for a lightweight rider only.'}]},
  {id:'kt-fork-bottoms-jump',end:'front and rear',symptom:'Bike bottoms off a high-speed jump (the manual heads it “fork bottoms”; may be riding posture)',rider_says:['bottoms off a fast jump','front bottoms off the big jump'],where:['jumps'],cause:'Rebound damping too low or spring too hard.',
   checks:[{item:'Rebound damping',direction:'More rebound damping.'},{item:'Shock spring preload',direction:'Less preload.'},{item:'Compression damping',direction:less}]},
  {id:'kt-both-bottom',end:'front and rear',symptom:'Both ends bottom harshly off a high-speed jump once or twice a lap',rider_says:['both ends bottom','bottoms hard on the big jump'],where:['jumps'],cause:'Front and rear both too soft.',
   checks:[{item:'Fork oil amount',direction:'More oil.'},{item:'Fork spring',direction:'Harder spring.'},{item:'Fork spring preload',direction:'More preload.',models:['KX450','KX450X']},{item:'Shock spring preload',direction:'More preload, or a harder spring.'},{item:'Shock high-speed compression',direction:more}],note:'Check front and rear compatibility after any change.'},
  {id:'kt-rear-soft-small-jump',end:'rear shock',symptom:'Rear feels soft on small jumps',rider_says:['rear soft on small jumps','rear squats on jump faces'],where:['small jumps'],
   checks:[{item:'Shock spring preload',direction:'More preload, up to the maximum.'},{item:'Shock low-speed compression',direction:more}]},
  {id:'kt-rear-soft-large-jump',end:'rear shock',symptom:'Rear feels soft on large jumps',rider_says:['rear soft on big jumps','rear bottoms on big jumps'],where:['large jumps'],
   checks:[{item:'Shock spring preload',direction:'More preload, up to the maximum.'},{item:'Shock high-speed compression',direction:more}]},
  {id:'kt-rear-bottoms-series',end:'rear shock',symptom:'Rear bottoms after three or four jumps in a row',rider_says:['rear bottoms in a rhythm section','rear packs through jumps'],where:['successive jumps'],cause:'Rear packing down.',
   checks:[{item:'Shock rebound damping',direction:'Less rebound damping (faster return).'}],note:'A bottoming feeling can come from a spring or damping that is too stiff for the bike and rider; watch the rear on jumps, and if it does not come near bottoming, try less preload and damping.'},
 ],
};

const guidanceByMake:GuidanceSet[]=[yamahaGuidance,kawasakiGuidance];

/** The manufacturer's guidance for this exact bike, or null when BAK has not checked that bike's manual. */
export function manufacturerSetupGuidance(bike:{manufacturer:string;model:string;model_year:number}|null){
 if(!bike)return null;
 const g=guidanceByMake.find(x=>x.manufacturer===bike.manufacturer);
 const src=g?.sources.find(s=>s.model===bike.model&&s.model_year===bike.model_year);
 if(!g||!src)return null;
 return {version:MANUFACTURER_GUIDANCE_VERSION,
  boundary:`${g.manufacturer}'s own published suspension symptom tables for this exact bike (${src.document}), restated in BAK's words. Cite as "${g.manufacturer}'s owner's service manual (suspension setting table)", never as a verified claim id. Step sizes and the standard sag figure come only from verified_claims. Stock suspension only.`,
  document:g.document_title,how_to_use:g.how_the_manual_says_to_use_it,
  rows:g.rows.map(r=>({...r,checks:r.checks.filter(c=>!c.models||c.models.includes(bike.model)).map(({models,...c})=>c)}))};
}
