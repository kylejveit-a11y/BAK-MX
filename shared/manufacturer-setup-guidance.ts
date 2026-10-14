/** Manufacturer-published suspension symptom guidance, by make.
 *
 * Yamaha prints the same "Suspension setting" tables (front fork and rear shock absorber: symptom, where on the track,
 * what to check, which way to adjust) in the Tuning chapter of every YZ / YZ-X / YZ-FX Owner's Service Manual from 2020 to
 * 2027 that BAK holds; the 2020-2023, 2024 and 2025-on editions differ only in layout and hyphenation (compared word by
 * word, docs/research/suspension-knowledge/OEM_SETUP_GUIDANCE_2026-10-14.md). The rows below restate that guidance in
 * BAK's own words. They carry no numbers: the manual's step sizes and its sag figure are bike-specific and come only from
 * verified claims for the exact bike. Sent to Ask BAK only for a bike whose manual was checked (`sources`).
 */
export type GuidanceCheck={item:string;direction:string};
export type GuidanceRow={id:string;end:'front fork'|'rear shock';symptom:string;rider_says:string[];where:string[];checks:GuidanceCheck[]};
export type GuidanceSource={model:string;model_year:number;document:string;pdf_pages:number[]};
export const MANUFACTURER_GUIDANCE_VERSION='oem-setup-1';

const firmer='Firmer: more damping (adjuster turned in, clockwise on this bike).';
const softer='Softer: less damping (adjuster turned out, counterclockwise on this bike).';

export const yamahaGuidance={
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
 ] as GuidanceSource[],
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
 ] as GuidanceRow[],
};

const guidanceByMake=[yamahaGuidance];

/** The manufacturer's guidance for this exact bike, or null when BAK has not checked that bike's manual. */
export function manufacturerSetupGuidance(bike:{manufacturer:string;model:string;model_year:number}|null){
 if(!bike)return null;
 const g=guidanceByMake.find(x=>x.manufacturer===bike.manufacturer);
 const src=g?.sources.find(s=>s.model===bike.model&&s.model_year===bike.model_year);
 if(!g||!src)return null;
 return {version:MANUFACTURER_GUIDANCE_VERSION,
  boundary:`${g.manufacturer}'s own published suspension symptom tables for this exact bike (${src.document}), restated in BAK's words. Cite as "${g.manufacturer}'s owner's service manual (suspension setting table)", never as a verified claim id. Step sizes and the standard sag figure come only from verified_claims. Stock suspension only.`,
  document:g.document_title,how_to_use:g.how_the_manual_says_to_use_it,rows:g.rows};
}
