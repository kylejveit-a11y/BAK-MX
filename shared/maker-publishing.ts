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
 *   See docs/research/expansion/gaps/maker-publishing/REPORT.md.
 */
export type PublishingNote={topic:string;not_printed:string;printed_instead:string;checked:string};
type Scope={manufacturer:string;years:Record<string,[number,number]>;notes:PublishingNote[]};

const scopes:Scope[]=[
 {manufacturer:'Kawasaki',
  years:{KX65:[2020,2027],KX85:[2020,2026],KX112:[2022,2026],KX250:[2014,2026],KX250X:[2021,2026],KX450:[2014,2026],KX450X:[2021,2026]},
  notes:[{topic:'sag',
   not_printed:'Kawasaki’s owner’s manual for this bike prints no sag figure at all: no race (rider) sag and no static (free) sag.',
   printed_instead:'It sets the rear spring by the spring preload adjusting nut position (a standard length and an adjustable range, measured as the manual describes) and lists the standard and optional spring rates. Those figures come from verified_claims when they were retrieved.',
   checked:'Full text of the US owner’s manual searched, 2026-11-18.'}]},
];

/** Notes for this exact bike, or null when its manual has not been checked this way. */
export function makerPublishingNotes(bike:{manufacturer:string;model:string;model_year:number}|null){
 if(!bike)return null;
 const s=scopes.find(x=>x.manufacturer===bike.manufacturer),range=s?.years[bike.model];
 if(!s||!range||bike.model_year<range[0]||bike.model_year>range[1])return null;
 return {boundary:'What this maker’s own manual for this exact bike does not print. This is settled: the value is not missing from BAK, the maker does not publish it.',notes:s.notes};
}
