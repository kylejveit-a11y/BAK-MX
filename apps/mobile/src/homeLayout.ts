// Home's blocks and the saved-layout migration, pure so it can be tested. The screens live in HomeBlocks.tsx.
// Home is short on purpose: the question bar, the bike, and one "Up next" card. Race prep and the last coaching are there for
// riders who want them, off by default. Older ids (service, setup, events, tools) are folded into Up next and the More row.
export type HomeBlock='ask'|'bike'|'next'|'prep'|'coaching';
export const HOME_BLOCKS:{id:HomeBlock;label:string;detail:string;defaultOn:boolean}[]=[
 {id:'ask',label:'Ask BAK',detail:'The question bar',defaultOn:true},
 {id:'bike',label:'Your bike',detail:'Photo, hours and setup checklist',defaultOn:true},
 {id:'next',label:'Up next',detail:'Service due, your next event or your last setup change',defaultOn:true},
 {id:'prep',label:'Race prep',detail:'Your own checklist, week before to after',defaultOn:false},
 {id:'coaching',label:'Last coaching',detail:'Your latest fix and drill',defaultOn:false},
];
export type Layout={id:HomeBlock;on:boolean}[];
export const DEFAULT_LAYOUT:Layout=HOME_BLOCKS.map(b=>({id:b.id,on:b.defaultOn}));
const isBlock=(id:string):id is HomeBlock=>HOME_BLOCKS.some(h=>h.id===id);
/** A saved layout from any version: unknown ids are dropped, blocks added since are slotted in at their standard place. */
export function migrateLayout(saved:{id:string;on:boolean}[]|null|undefined):Layout{
 if(!Array.isArray(saved))return DEFAULT_LAYOUT;
 const out:Layout=[];for(const b of saved)if(b&&typeof b.id==='string'&&isBlock(b.id)&&!out.some(k=>k.id===b.id))out.push({id:b.id,on:!!b.on});
 DEFAULT_LAYOUT.forEach((d,i)=>{if(out.some(k=>k.id===d.id))return;const prev=DEFAULT_LAYOUT[i-1],at=prev?out.findIndex(k=>k.id===prev.id):-1;out.splice(at+1,0,d);});
 return out;
}
