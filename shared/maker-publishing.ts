/** What a maker's own manual does not print, for bikes whose manual BAK has read end to end.
 *
 * Some "missing" values are not missing: the manufacturer never publishes them. Ask BAK should say so plainly, give what
 * the manual prints instead, and add general guidance labelled as general, instead of calling the value unconfirmed and
 * logging a data gap that can never be filled.
 *
 * An entry is added only after every manual in its scope was searched for the term, never from memory:
 * - Kawasaki sag: the text layer of all 48 US KX owner's manuals 2014-2027 (KX65, KX85, KX112, KX250/KX250F, KX250X,
 *   KX450/KX450F, KX450X) was searched on 2026-11-18; none prints the word "sag". Kawasaki sets the rear spring by the
 *   spring preload adjusting nut position and lists standard and optional spring rates.
 * - Yamaha YZ65 and YZ85 sag: the owner's manuals for YZ65 2020-2025 and 2027 and YZ85 2020-2021 were searched on
 *   2026-11-18; none prints "sag" or "sunken length" (these are owner's manuals without the service and tuning chapters).
 * - Honda free sag: the 2013 CRF450R and the 2014-2019 CRF250R / CRF450R / RX and 2019 CRF450X owner's manuals were read
 *   in full on 2026-11-18, and the 2022-2026 CRF250R/RX and CRF450R/RX competition handbooks and owner's manuals too;
 *   they print the standard race sag but no free (static) sag figure (the 2010-2013 era manuals do,
 *   and that figure is on file for those bikes). The 2021 CRF250R/RX and CRF450R/RX and 2027 CRF450R/RX competition
 *   handbooks were searched the same way on 2026-11-20.
 * - Honda rider weight for springs: the 2021-2026 CRF250R/RX and 2021-2027 CRF450R/RX competition handbooks (13 documents)
 *   were searched on 2026-11-20 for a rider-weight range or chart; none prints one. The 2020 CRF250R/RX manual does
 *   ("between 170 lb (77 kg) and 200 lb (91 kg) (less riding gear)" for the fork springs) and that is on file for 2020.
 * - KTM group, no US table: the 2026 Husqvarna FC 250 and FC 450 owner's manuals (3402884en, 3402886en) and the 2023
 *   KTM 125 SX / 125 XC owner's manual (3214638en) were read on 2026-11-19. Their suspension tables are labelled for the
 *   EU model and the Factory Edition (Husqvarna) or for "125 SX EU" and "125 XC US" (KTM); none is labelled for the US
 *   standard model, so those figures are not loaded as verified US facts. The printed figures are quoted here with the
 *   table they come from. See docs/research/expansion/gaps/ktm-group-sag/REPORT.md.
 *   See docs/research/expansion/gaps/maker-publishing/REPORT.md.
 */
export type PublishingNote={topic:string;not_printed:string;printed_instead:string;checked:string};
/** `years`: [first,last] inclusive, or an explicit list when a year in between was not checked. */
type Scope={manufacturer:string;years:Record<string,[number,number]|{only:number[]}>;notes:PublishingNote[]};

const scopes:Scope[]=[
 {manufacturer:'Kawasaki',
  years:{KX65:[2020,2027],KX85:[2020,2026],KX112:[2022,2026],KX250:[2014,2026],KX250X:[2021,2026],KX450:[2014,2026],KX450X:[2021,2026]},
  notes:[{topic:'sag',
   not_printed:'Kawasaki’s owner’s manual for this bike prints no sag figure at all: no race (rider) sag and no static (free) sag.',
   printed_instead:'It sets the rear spring by the spring preload adjusting nut position (a standard length and an adjustable range, measured as the manual describes) and lists the standard and optional spring rates. Those figures come from verified_claims when they were retrieved.',
   checked:'Full text of the US owner’s manual searched, 2026-11-18.'}]},
 {manufacturer:'Yamaha',
  years:{YZ65:{only:[2020,2021,2022,2023,2024,2025,2027]},YZ85:[2020,2021]},
  notes:[{topic:'sag',
   not_printed:'Yamaha’s owner’s manual for this bike prints no sag (sunken length) figure. Unlike the full-size YZ manuals, it has no tuning chapter.',
   printed_instead:'Use the suspension adjuster settings from verified_claims when they were retrieved.',
   checked:'Full text of the US owner’s manual searched, 2026-11-18.'}]},
 {manufacturer:'Honda',
  years:{CRF250R:{only:[2014,2015,2016,2017,2018,2019,2021,2022,2023,2024,2025,2026]},CRF450R:{only:[2013,2014,2015,2016,2017,2018,2019,2021,2022,2023,2024,2025,2026,2027]},
   CRF450RX:{only:[2017,2019,2021,2022,2023,2024,2025,2026,2027]},CRF250RX:{only:[2019,2021,2022,2023,2024,2025,2026]},CRF450X:{only:[2019]}},
  notes:[{topic:'free sag',
   not_printed:'Honda’s owner’s manual for this bike prints the standard race sag but no free (static) sag figure.',
   printed_instead:'The standard race sag and the standard and optional spring rates, from verified_claims when they were retrieved.',
   checked:'Full text of the US owner’s manual read, 2026-11-18.'}]},
 {manufacturer:'Honda',
  years:{CRF250R:[2021,2026],CRF250RX:[2021,2026],CRF450R:[2021,2027],CRF450RX:[2021,2027]},
  notes:[{topic:'spring rate for rider weight',
   not_printed:'Honda’s competition handbook for this bike prints no rider-weight range for the standard springs and no chart of spring rate by rider weight. (The 2020 manual said the standard fork springs suit riders of about 170 to 200 lb without gear; from 2021 that line is gone.)',
   printed_instead:'The standard and optional soft and stiff spring rates for the fork and shock, and the standard race sag, from verified_claims when they were retrieved. Choose between them from the rider’s race sag and free sag, not from a Honda weight figure.',
   checked:'Full text of the US competition handbook searched, 2026-11-20.'}]},
 {manufacturer:'Husqvarna',
  years:{'FC 250':{only:[2026]},'FC 450':{only:[2026]}},
  notes:[{topic:'sag and shock settings',
   not_printed:'Husqvarna’s 2026 owner’s manual for this bike has no suspension table labelled for the US standard model. It prints one table for the model it labels EU and one for the Factory Edition.',
   printed_instead:'Rider sag 105 mm in both tables. Static sag 35 mm in the EU-labelled table and 38 mm in the Factory Edition table. Give these figures and say which table each comes from; do not present them as a US-labelled figure.',
   checked:'Full text of the owner’s manual read, 2026-11-19.'}]},
 {manufacturer:'KTM',
  years:{'125 SX':{only:[2023]}},
  notes:[{topic:'sag and shock settings',
   not_printed:'KTM’s 2023 owner’s manual for this bike has no suspension table labelled for a US 125 SX. It prints one table labelled 125 SX EU and one labelled 125 XC US.',
   printed_instead:'Riding sag 105 mm (4.13 in) and static sag 35 mm (1.38 in) in both tables. Give these figures and say which table they come from; do not present them as a US-labelled 125 SX figure.',
   checked:'Full text of the owner’s manual read, 2026-11-19.'}]},
];

/** Notes for this exact bike, or null when its manual has not been checked this way. */
export function makerPublishingNotes(bike:{manufacturer:string;model:string;model_year:number}|null){
 if(!bike)return null;
 const notes=scopes.filter(x=>{const range=x.manufacturer===bike.manufacturer?x.years[bike.model]:undefined;
  return !!range&&(Array.isArray(range)?bike.model_year>=range[0]&&bike.model_year<=range[1]:range.only.includes(bike.model_year));}).flatMap(x=>x.notes);
 if(!notes.length)return null;
 return {boundary:'What this maker’s own manual for this exact bike does not print. This is settled: the value is not missing from BAK, the maker does not publish it for this model as labelled.',notes};
}
