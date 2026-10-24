// Plain-language support levels for the "Is your bike supported?" picker (web and phone).
export type SupportRow={make:string;model:string;year:number;type:string;knowledge:number;setup:number;specs:number;troubleshooting:number;guides:number;full_rebuild:boolean};
export type SupportData={generated:string;guide_total:number;bikes:SupportRow[]};
export type Level={id:'full'|'strong'|'good'|'basic';label:string;short:string;line:string};
export function level(r:Pick<SupportRow,'full_rebuild'|'knowledge'>):Level{
 if(r.full_rebuild)return {id:'full',label:'Full support',short:'Full',line:'Setup, specs, troubleshooting and step-by-step rebuilds, engine to suspension.'};
 if(r.knowledge>=80)return {id:'strong',label:'Strong support',short:'Strong',line:'Setup, specs and troubleshooting are well covered. Rebuild guides are still coming.'};
 if(r.knowledge>=60)return {id:'good',label:'Good support',short:'Good',line:'Solid setup and troubleshooting help. Some exact numbers are still being added.'};
 return {id:'basic',label:'Basic support',short:'Basic',line:'General setup and troubleshooting help. Few bike-specific numbers yet.'};
}
export const areaLabel=(n:number)=>n>=80?'Strong':n>=50?'Partial':n>0?'Limited':'Not yet';
export function supportAreas(r:SupportRow,total:number):[string,string,boolean][]{
 return [['Setup & tuning',areaLabel(r.setup),r.setup>=50],['Specs & torques',areaLabel(r.specs),r.specs>=50],['Troubleshooting',areaLabel(r.troubleshooting),r.troubleshooting>=50],['Step-by-step rebuilds',r.guides?`${r.guides} of ${total} jobs`:'Not yet',r.full_rebuild]];
}

export type SupportModel={model:string;rows:SupportRow[];from:number;to:number};
export type SupportMake={make:string;models:SupportModel[];from:number;to:number;years:number};
/** Supported bikes grouped make → model, newest year first, filtered by a search like "kx450 2024" (every word must match). */
export function groupSupport(bikes:SupportRow[],query=''):SupportMake[]{
 const words=query.toLowerCase().split(/\s+/).filter(Boolean),makes=new Map<string,Map<string,SupportRow[]>>();
 for(const b of bikes){
  const hay=`${b.make} ${b.model} ${b.year}`.toLowerCase();
  if(words.some(w=>!hay.includes(w)))continue;
  const models=makes.get(b.make)??makes.set(b.make,new Map()).get(b.make)!;
  (models.get(b.model)??models.set(b.model,[]).get(b.model)!).push(b);
 }
 return [...makes.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([make,models])=>{
  const list=[...models.entries()].map(([model,rows])=>{const r=[...rows].sort((a,b)=>b.year-a.year);return {model,rows:r,from:r[r.length-1].year,to:r[0].year};});
  return {make,models:list,from:Math.min(...list.map(m=>m.from)),to:Math.max(...list.map(m=>m.to)),years:list.reduce((n,m)=>n+m.rows.length,0)};
 });
}
export const yearRange=(from:number,to:number)=>from===to?String(from):`${from}–${to}`;
