// Small hand-offs between the menu and the screens it opens, so a feature that lives inside a page (Race day on Home,
// a tab inside Parts) can be reached in one tap from the menu.
export type PartsTab='find'|'specs'|'diagrams'|'list';
let partsTab:PartsTab|''='';const partsHearers=new Set<(t:PartsTab)=>void>();
/** Ask the Parts page to show a tab; works whether or not the page is already open. */
export function openPartsTab(tab:PartsTab){partsTab=tab;partsHearers.forEach(f=>f(tab));}
export function takePartsTab():PartsTab|''{const t=partsTab;partsTab='';return t;}
export function onPartsTab(f:(t:PartsTab)=>void){partsHearers.add(f);return()=>{partsHearers.delete(f);};}

export type HomeStart='race'|'practice';
let homeStart:HomeStart|''='';const homeHearers=new Set<(k:HomeStart)=>void>();
/** Ask Home to open Race day or Practice day set-up. */
export function requestHomeStart(kind:HomeStart){homeStart=kind;homeHearers.forEach(f=>f(kind));}
export function takeHomeStart():HomeStart|''{const k=homeStart;homeStart='';return k;}
export function onHomeStart(f:(k:HomeStart)=>void){homeHearers.add(f);return()=>{homeHearers.delete(f);};}

let accountPage='';const accountHearers=new Set<(p:string)=>void>();
/** Ask the Account page to open one of its sub-pages (Invite a friend from the menu). */
export function requestAccountPage(page:string){accountPage=page;accountHearers.forEach(f=>f(page));}
export function takeAccountPage():string{const p=accountPage;accountPage='';return p;}
export function onAccountPage(f:(p:string)=>void){accountHearers.add(f);return()=>{accountHearers.delete(f);};}
