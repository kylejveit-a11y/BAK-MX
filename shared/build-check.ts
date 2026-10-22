/** Checks a build sheet against itself and the bike: parts made for a component the bike no longer has (a preload adjuster for
 *  an Öhlins shock on a bike running the stock WP, or a stock-shock adjuster once an aftermarket shock is fitted), two parts
 *  filling one slot while both are marked on the bike, and a sprocket size that disagrees with the saved gearing.
 *  Only parts on the bike are checked; parts the rider has off the bike are spares. Shared by the app, the web and Ask BAK. */
import {readInstalled,type InstalledPart} from './installed-parts.ts';
import {typeOf} from './part-types.ts';
import {canonBrand} from './parts-picker.ts';

export type BuildCheck={level:'conflict'|'check';text:string;parts:InstalledPart[]};
type Bike={manufacturer:string;model:string;model_year:number;configuration?:Record<string,unknown>|null};

const SUSPENSION_BRANDS:[RegExp,string][]=[[/(?:^|[^a-z])[öo]hlins\b/i,'Öhlins'],[/\bkyb\b/i,'KYB'],[/\bshowa\b/i,'Showa'],[/\bwp\b/i,'WP'],[/\btfx\b/i,'TFX'],[/\bfox\b/i,'Fox'],[/\bk-?tech\b/i,'K-Tech']];
/** Factory suspension maker for the supported makes; null when the bike isn't one BAK knows. */
export function stockSuspension(make:string):{fork:string;shock:string}|null{
 if(['KTM','Husqvarna','GasGas'].includes(make))return {fork:'WP',shock:'WP'};
 if(make==='Yamaha')return {fork:'KYB',shock:'KYB'};
 if(make==='Honda'||make==='Kawasaki')return {fork:'Showa',shock:'Showa'};
 if(make==='Triumph')return {fork:'KYB',shock:'Öhlins'};
 return null;
}
const brandIn=(text:string)=>SUSPENSION_BRANDS.filter(([re])=>re.test(text)).map(([,b])=>b);
/** Brands a part says it is made for ("for Öhlins reverse-threaded shock", "for KYB/Showa 48mm forks"). */
function madeFor(p:InstalledPart){const m=p.n.match(/\bfor\b(.*)$/i);return m?brandIn(m[1]):brandIn(p.n).filter(b=>!brandIn(canonBrand(p.b)).includes(b));}
/** Work done (serviced, revalved, flashed) is not a part and fills no slot. */
const WORK_DONE=/\b(serviced|service|revalved?|rebuilt|ported|flashed|remapped|tuned)\b/i;
export const typeOfPart=(p:InstalledPart)=>WORK_DONE.test(p.n)?null:typeOf(p.s,p.n)??(p.s==='suspension'&&/\bpre-?load\b/i.test(p.n)?'Preload adjuster':null);
const label=(p:InstalledPart)=>[canonBrand(p.b),p.n].filter(Boolean).join(' ');
/** One of these on the bike at a time. */
export const SINGLE=new Set(['Fork (cartridge, conversion, kit)','Shock','Linkage','Triple clamps','Steering damper','Holeshot device','Rear sprocket','Front sprocket','Chain','Handlebar','Bar mounts or clamps','Grips','Footpegs','Seat','Plastics','Skid plate','Auto clutch','Air filter','Gas tank','Preload adjuster']);

export function checkBuild(bike:Bike):BuildCheck[]{
 const {parts}=readInstalled(bike.configuration);
 const on=parts.filter(p=>!p.o),out:BuildCheck[]=[],stock=stockSuspension(bike.manufacturer);
 const typed=on.map(p=>({p,t:typeOfPart(p)}));
 // what is fitted now: an aftermarket shock or fork on the bike, else the factory one
 const shockPart=typed.find(x=>x.t==='Shock'&&brandIn(canonBrand(x.p.b)+' '+x.p.n).length)?.p;
 const forkPart=typed.find(x=>x.t==='Fork (cartridge, conversion, kit)'&&!/\b(cartridge|conversion|kit)\b/i.test(x.p.n)&&brandIn(canonBrand(x.p.b)+' '+x.p.n).length)?.p;
 const shock=shockPart?brandIn(canonBrand(shockPart.b)+' '+shockPart.n)[0]:stock?.shock;
 const fork=forkPart?brandIn(canonBrand(forkPart.b)+' '+forkPart.n)[0]:stock?.fork;
 const shockName=shockPart?`your ${label(shockPart)}`:`the stock ${shock} shock`,forkName=forkPart?`your ${label(forkPart)}`:`the stock ${fork} fork`;
 for(const {p,t} of typed){
  if(p.s!=='suspension'||p===shockPart||p===forkPart)continue;
  const forShock=t==='Preload adjuster'||t==='Shock spring'||/\bshock\b/i.test(p.n),forFork=!forShock&&(t==='Fork springs'||/\bfork\b/i.test(p.n));
  if(!forShock&&!forFork)continue;
  const want=madeFor(p),have=forShock?shock:fork,name=forShock?shockName:forkName;
  if(want.length&&have&&!want.includes(have)){out.push({level:'conflict',parts:[p],text:`${label(p)} is made for a${/^[aeiouö]/i.test(want[0])?'n':''} ${want.join('/')} ${forShock?'shock':'fork'}, but ${name} is on the bike.`});continue;}
  // picked for this bike from the list, so it was made for the factory part; an aftermarket replacement changes that
  const replaced=forShock?shockPart:forkPart;
  if(!want.length&&!p.x&&replaced&&(t==='Preload adjuster'||t==='Shock spring'||t==='Fork springs'))out.push({level:'conflict',parts:[p],text:`${label(p)} is listed for the stock ${forShock?'shock':'fork'}. With ${label(replaced)} on the bike, check it fits before using it, or mark it off the bike.`});
 }
 // two parts filling one slot
 const bySlot=new Map<string,InstalledPart[]>();
 for(const {p,t} of typed){if(!t)continue;let slot=SINGLE.has(t)?t:t==='Tires'?(/\bfront\b/i.test(p.n)?'Front tire':/\brear\b/i.test(p.n)?'Rear tire':''):'';
  if(t==='Full exhaust system'||t==='Slip-on muffler')slot='Exhaust';if(!slot)continue;bySlot.set(slot,[...(bySlot.get(slot)??[]),p]);}
 for(const [slot,list] of bySlot)if(list.length>1)
  out.push({level:'conflict',parts:list,text:`${list.length===2?'Both of these are':'These are all'} marked on the bike as your ${slot==='Exhaust'?'exhaust':slot.toLowerCase()}: ${list.map(label).join(list.length===2?' and ':', ')}. Mark the one you’re not running as off the bike.`});
 // sprocket size against saved gearing
 const cfg=bike.configuration??{};
 for(const [t,key,word] of [['Rear sprocket','rear_sprocket','rear'],['Front sprocket','front_sprocket','front']] as const){
  const saved=Number(cfg[key]);if(!Number.isFinite(saved)||saved<=0)continue;
  for(const {p} of typed.filter(x=>x.t===t)){const size=Number((p.v??'').replace(/\D/g,'')||NaN);
   if(Number.isFinite(size)&&size!==saved)out.push({level:'check',parts:[p],text:`Your ${word} sprocket is saved as ${size} teeth, but your gearing says ${saved}. Count the teeth and fix whichever is wrong.`});
   else if(!p.v&&p.p&&!p.p.split(/[^0-9]+/).includes(String(saved)))out.push({level:'check',parts:[p],text:`The part number saved for your ${word} sprocket (${p.p}) doesn’t match ${saved} teeth. Re-pick it with the right size.`});
  }
 }
 return out;
}
/** The slot a part fills when only one can be on the bike (front and rear tires are separate slots), or null. */
export function slotOf(p:InstalledPart):string|null{const t=typeOfPart(p);if(!t)return null;if(t==='Full exhaust system'||t==='Slip-on muffler')return 'Exhaust';
 if(t==='Tires')return /\bfront\b/i.test(p.n)?'Front tire':/\brear\b/i.test(p.n)?'Rear tire':null;return SINGLE.has(t)?t:null;}
