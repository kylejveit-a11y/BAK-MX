import type {Bike,Claim,Message} from '../shared/types.ts';
import {cleanVin} from '../shared/vin.ts';
import type {Knowledge} from './knowledge.ts';

/** Answer-quality guards that run in code before the model writes (what it is shown) and after (what the rider reads).
 *  None of them adds a value: they label, scope or drop rows that would mislead, so unknowns stay unknown. */

// ---------- Maker documents beat press reports ----------
/** Front/rear sprocket pairs in a text ("13/49", "48/13", "13T front, 48T rear"), normalised to "front/rear". */
export function gearPairs(text:string):Set<string>{
 const out=new Set<string>(),add=(a:number,b:number)=>{const f=Math.min(a,b),r=Math.max(a,b);if(f>=9&&f<=18&&r>=36&&r<=60)out.add(f+'/'+r);};
 for(const m of text.matchAll(/(?<![\d.])(\d{2})\s*T?\s*[/:]\s*(\d{2})(?![\d.])/g))add(Number(m[1]),Number(m[2]));
 for(const m of text.matchAll(/(?<![\d.])(\d{2})\s*T?\s*front\b[^.;]{0,40}?(?<![\d.])(\d{2})\s*T?\s*rear\b/gi))add(Number(m[1]),Number(m[2]));
 return out;
}
const GEARING=/final (?:drive|reduction)|secondary reduction|sprocket|gearing/i,NOT_STOCK=/optional|available|alternative|option\b|go(?:es|ing)? (?:up|down)|went|from \d{2}\/\d{2} to|instead|swap/i;
/** The stock gearing the maker's verified facts give for this exact bike. */
function verifiedGearing(claims:Claim[]):Set<string>{
 const out=new Set<string>();
 for(const c of claims)if(GEARING.test(c.statement)&&!NOT_STOCK.test(c.statement))for(const p of gearPairs(c.statement))out.add(p);
 return out;
}
/** Where an OEM-tier knowledge row states stock gearing that the maker's verified facts for the same bike contradict, the
 *  verified fact wins: the conflicting value is taken out of the row's values and the row is marked, so the model either drops
 *  the figure or gives it only as a press report. Rows that agree, or bikes without verified gearing, are left alone. */
export function makerPrecedence(rows:Knowledge[],claims:Claim[]):Knowledge[]{
 const maker=verifiedGearing(claims);if(!maker.size)return rows;
 return rows.map(k=>{
  if(k.tier!=='OEM'&&!k.reported_by)return k;
  const sentences=k.statement.split(/(?<=[.;])\s+/).filter(s=>GEARING.test(s)&&!NOT_STOCK.test(s));
  const fromValues=Object.entries(k.values).filter(([key,v])=>/final_?drive|gearing|sprocket/i.test(key)&&typeof v==='string'&&!NOT_STOCK.test(key+' '+v));
  const stated=new Set<string>([...sentences.flatMap(s=>[...gearPairs(s)]),...fromValues.flatMap(([,v])=>[...gearPairs(String(v))])]);
  const wrong=[...stated].filter(p=>!maker.has(p));if(!wrong.length)return k;
  const values=Object.fromEntries(Object.entries(k.values).filter(([key,v])=>!(/final_?drive|gearing|sprocket/i.test(key)&&wrong.some(p=>gearPairs(String(v)).has(p)))));
  return {...k,values,maker_conflict:`Gearing ${wrong.join(', ')} in this row disagrees with the maker's verified figure for this exact bike (${[...maker].join(', ')}). Use the verified figure; ${wrong.join(', ')} may be given only as a press or launch-test report, never as the maker's spec.`};
 });
}

// ---------- Rider VIN (never sent to the model; only what it matches is) ----------
/** The rider's VIN or the tail they typed ("my VIN ends in CF4102"): saved on the bike first, else the latest one they wrote. */
export function riderVin(bike:Pick<Bike,'configuration'>|null,history:Message[],message:string):string|null{
 const saved=typeof bike?.configuration?.vin==='string'?cleanVin(bike.configuration.vin as string):'';if(saved.length>=6)return saved;
 const said=[message,...history.filter(m=>m.role==='user').map(m=>String(m.content??'')).reverse()];
 for(const text of said)for(const m of text.matchAll(/\b(?:VIN|frame (?:no\.?|number)|serial)\b[^\n.?!]{0,40}/gi)){
  const tok=m[0].toUpperCase().match(/(?<![A-Z0-9])(?=[A-Z0-9]*\d)[A-HJ-NPR-Z0-9]{6,17}(?![A-Z0-9])/);if(tok)return tok[0];
 }
 return null;
}
type Range={lo:string;hi:string|null};
/** VIN ranges written in a text: "BS4847 to CC7868", "...CD4981 to ...CP1597", "BP6028-CC7868", "CF3825 onward". */
export function vinRanges(text:string):Range[]{
 const out:Range[]=[],tok='(?:\\.{3}|…)?\\b([A-Z0-9]{5,17})\\b',ok=(s:string)=>/\d/.test(s)&&/[A-Z]/.test(s)||/^\d{6,}$/.test(s);
 for(const m of text.matchAll(new RegExp(tok+'\\s*(?:to|through|-|–)\\s*'+tok,'g')))if(m[1].length===m[2].length&&ok(m[1])&&ok(m[2]))out.push({lo:m[1],hi:m[2]});
 for(const m of text.matchAll(new RegExp(tok+'\\s*(?:onwards?|and later|and on|\\+)','gi')))if(ok(m[1]))out.push({lo:m[1],hi:null});
 return out;
}
const shape=(s:string)=>s.replace(/[A-Z]/g,'A').replace(/\d/g,'9');
/** true/false when the VIN (or its tail) can be placed against the range; null when the formats cannot be compared. */
export function vinInRange(vin:string,r:Range):boolean|null{
 let v=cleanVin(vin),lo=r.lo,hi=r.hi;
 if(v.length<lo.length){const cut=lo.length-v.length;if(hi&&lo.slice(0,cut)!==hi.slice(0,cut))return null;lo=lo.slice(cut);hi=hi?hi.slice(cut):null;}
 else v=v.slice(-lo.length);
 if(shape(v)!==shape(lo)||(hi&&shape(v)!==shape(hi)))return null;
 return v>=lo&&(!hi||v<=hi);
}

// ---------- Recalls ----------
export function isRecallRow(k:Knowledge){return /recall/i.test(Object.keys(k.values).join(' '))||/\brecalled\b|\brecall (?:covers|notice|no\.?|number|\d)|\bCPSC\s*\d|\bPRA \d{4}\//i.test(k.statement);}
const RECALL_ASKED=/\b(recalls?|recalled|cpsc|campaign|safety notice|service bulletin|rocker|cylinder[- ]head (?:fix|replacement|recall)|switch cube)\b/i;
const replyText=(m:Message)=>{const r=m.response as {answer?:string;summary?:string}|null;return [r?.answer,r?.summary,typeof m.content==='string'?m.content:''].filter(Boolean).join(' ');};
export function recallMentioned(history:Message[]){return history.some(m=>m.role==='assistant'&&/\brecall/i.test(replyText(m)));}
/** At most once per conversation, scoped to the VIN. Rows already raised in an earlier reply are dropped unless the rider asks
 *  about recalls; the rest say whether the recall is VIN-scoped and where the rider's VIN falls, without the VIN itself. */
export function scopeRecalls(rows:Knowledge[],history:Message[],message:string,vin:string|null){
 const recalls=rows.filter(isRecallRow);if(!recalls.length)return {rows,notice:null};
 const asked=RECALL_ASKED.test(message);
 if(recallMentioned(history)&&!asked)return {rows:rows.filter(k=>!isRecallRow(k)),notice:{status:'already_mentioned'}};
 return {rows:rows.map(k=>{
  if(!isRecallRow(k))return k;
  const text=[k.statement,...Object.entries(k.values).filter(([key])=>/vin|serial|frame/i.test(key)).map(([,v])=>String(v))].join(' ');
  const ranges=vinRanges(text),checks=vin?ranges.map(r=>vinInRange(vin,r)):[];
  const rider_vin=!ranges.length?'no_vin_range':!vin?'vin_unknown':checks.includes(true)?'in_range':checks.length&&checks.every(c=>c===false)?'outside_range':'check_vin';
  return {...k,recall:{vin_range:ranges.length>0,rider_vin}};
 }),notice:{status:asked?'rider_asked':'first_mention'}};
}

// ---------- Specs split by VIN ----------
const VIN_LOCATION=/\bVIN\b[^.;]{0,120}?\b(stamped|located|label|steering head|frame)\b/i;
/** Verified facts that differ by VIN range (two handbooks for one model year): the ranges, which one the rider's VIN falls in
 *  (when it is known; the VIN itself is not passed on) and where the maker says the VIN is, only when a maker fact says so. */
export function vinSplit(claims:Claim[],rows:Knowledge[],vin:string|null){
 const segments=new Set<string>();
 for(const c of claims){const m=c.statement.match(/split by VIN\s*\(([^)]*)\)/i);if(m)for(const s of m[1].split(';'))if(s.trim())segments.add(s.trim());}
 if(!segments.size)return null;
 const ranges=[...segments],place=vin?ranges.map(s=>({s,in:vinRanges(s).map(r=>vinInRange(vin,r))})):[];
 const match=place.find(p=>p.in.includes(true))?.s??null;
 const where=claims.find(c=>VIN_LOCATION.test(c.statement))?.statement
  ??rows.filter(k=>k.tier==='OEM'&&!k.reported_by&&!k.bike).map(k=>{const v=Object.entries(k.values).find(([key])=>/^vin(_location)?$/i.test(key));return v?String(v[1]):VIN_LOCATION.test(k.statement)?k.statement:null;}).find(Boolean)??null;
 return {ranges,rider_vin:!vin?'not given':match?'given':'given but outside every listed range',...(match?{matching_range:match}:{}),vin_location:where?where.slice(0,220):'not in the maker facts here: ask for the VIN without saying where it is'};
}

// ---------- Pro supercross / whoops ----------
const SX=/\b(supercross|sx|whoops|arenacross)\b/i,PRO=/\b(pro|pro-level|professional|factory|a\/?pro|expert|national|nationals)\b/i;
export function proSupercross(message:string,bike:Pick<Bike,'configuration'>|null){
 const level=String(bike?.configuration?.skill_level??'').toLowerCase();
 return SX.test(message)&&(PRO.test(message)||/pro|expert/.test(level));
}
/** Extra published-fact searches a pro supercross plan needs beyond what the planner asked for. */
export function supplementalLookups(message:string,bike:Pick<Bike,'configuration'>|null):string[]{
 return proSupercross(message,bike)?['fork oil level outer tube adjustment range','optional fork spring shock spring rider weight','shock high speed compression rebound standard setting']:[];
}

// ---------- Setup card and prose ----------
const nums=(s:string)=>(s.match(/\d+(?:[.,/]\d+)?\s?[¼½¾⅛⅜⅝⅞]?|[¼½¾⅛⅜⅝⅞]/g)??[]).map(x=>x.replace(/\s/g,''));
const words=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,' ').split(' ').filter(w=>w.length>2);
/** A screenshot or plain-text copy of the answer must hold every setup change: any change the prose does not state (its setting
 *  together with its target number, "to 12", in one line or sentence) is added as one short line at the end. A line that only
 *  quotes the stock position does not count. */
export function withChangeLines(answer:string,changes:{setting:string;change:string}[]):string{
 if(!changes.length)return answer;
 const lines=answer.split(/\n|(?<=[.!?])\s+/);
 const has=(l:string,x:string)=>new RegExp('(^|[^0-9])'+x.replace(/[.,/]/g,'\\$&')+'(?![0-9¼½¾⅛⅜⅝⅞])').test(l);
 const stated=(c:{setting:string;change:string})=>{
  const key=words(c.setting),to=c.change.match(/(?:\bto\b|→|->)\s*(\d+(?:[.,/]\d+)?\s*[¼½¾⅛⅜⅝⅞]?|[¼½¾⅛⅜⅝⅞])/i),target=to?nums(to[1]):[],n=nums(c.change);
  return lines.some(l=>{const t=l.toLowerCase();return key.every(w=>t.includes(w))&&(target.length?target.every(x=>has(l,x)):!n.length||n.some(x=>has(l,x)));});
 };
 const missing=changes.filter(c=>!stated(c));if(!missing.length)return answer;
 const short=(s:string)=>{const one=s.replace(/\s+/g,' ').trim();return one.length<=160?one:(one.slice(0,157).replace(/\s+\S*$/,'')+'…');};
 return answer.trimEnd()+'\n\n**Changes to try, one at a time:**\n'+missing.map(c=>`- **${c.setting.trim()}:** ${short(c.change)}`).join('\n');
}
