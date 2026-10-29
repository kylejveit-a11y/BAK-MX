// Race-prep checklist: the items racers keep repeating on forums and in mechanics' routines, by when they're done. The rider
// starts from this list (filtered to their kind of riding), then adds their own items, removes what they don't use and
// reorders. Their list is saved to the account; checks are kept on the phone and cleared when they start fresh.
export type RacePhase='week'|'night'|'track'|'motos'|'after';
export const RACE_PHASES:{id:RacePhase;label:string;short:string}[]=[
 {id:'week',label:'The week before',short:'Week before'},
 {id:'night',label:'Night before · load up',short:'Night before'},
 {id:'track',label:'At the track',short:'At the track'},
 {id:'motos',label:'Between motos',short:'Between motos'},
 {id:'after',label:'After the race',short:'After'},
];
export type PrepItem={id:string;label:string;phase:RacePhase;why?:string;discipline?:'mx'|'offroad'|'both';custom?:boolean};
/** Filled from the research pass (docs/research/race-prep/checklist.json). */
export const PREP_ITEMS:PrepItem[]=[];

/** BAK's list for this kind of riding. */
export function defaultPrepList(discipline:'mx'|'offroad'):PrepItem[]{return PREP_ITEMS.filter(i=>!i.discipline||i.discipline==='both'||i.discipline===discipline);}
/** The rider's saved list (labels and order), with BAK's "why" put back on the items that came from BAK's list. */
export function hydratePrepList(saved:{id:string;label:string;phase:RacePhase;custom?:boolean}[]|null,discipline:'mx'|'offroad'):PrepItem[]{
 if(!saved)return defaultPrepList(discipline);
 return saved.map(s=>{const base=PREP_ITEMS.find(i=>i.id===s.id);return {...s,...(base&&!s.custom?{why:base.why}:{})};});
}
export const toSaved=(list:PrepItem[])=>list.map(({id,label,phase,custom})=>({id,label,phase,...(custom?{custom:true}:{})}));
