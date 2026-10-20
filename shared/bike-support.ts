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
