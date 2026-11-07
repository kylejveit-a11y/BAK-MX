// Tuning notes: a BAK answer saved to the rider's bike (the question, the answer, the setup changes, the bike and the day),
// or a note the rider wrote themselves. Saved to the rider's account (public.tuning_notes), so a note is on every device.
// Also the clean setup sheet a rider shares: plain text, no internal ids, no source or file names. Pure and tested; the
// website, the phone app and the server all build notes and sheets from here.
import type {Bike,EngineeringResponse} from './types.ts';
import {splitFact,settingName} from './specs-view.ts';
import {plainName} from './plain-facts.ts';

export const NOTE_LIMITS={title:120,question:8000,answer:20000,riderNote:4000,changes:6,setting:200,change:400,stock:120,bikeLabel:160} as const;

export type NoteChange={setting:string;change:string;stock:string|null};
export type TuningNote={id:string;bike_id:string;title:string;question:string;answer:string;setup_changes:NoteChange[];rider_note:string;bike_label:string;noted_at:string;conversation_id:string|null;source_message_id:string|null;created_at:string;updated_at:string};
/** What a new note holds before the account saves it. */
export type NoteDraft=Pick<TuningNote,'title'|'question'|'answer'|'setup_changes'|'rider_note'|'bike_label'|'noted_at'|'conversation_id'|'source_message_id'>&{bike_id:string};

const clip=(text:string,max:number)=>{const t=text.trim();return t.length>max?t.slice(0,max-1).trimEnd()+'…':t;};

/** "2025 KTM 450 SX-F “Blue”". */
export function bikeLabel(bike:Pick<Bike,'model_year'|'manufacturer'|'model'>&{nickname?:string|null}):string{
 return clip([bike.model_year,bike.manufacturer,bike.model].filter(Boolean).join(' ')+(bike.nickname?.trim()?` “${bike.nickname.trim()}”`:''),NOTE_LIMITS.bikeLabel);
}

/** A short name for the note from the rider's question: its first sentence, at most 80 characters. */
export function noteTitle(question:string,fallback='Tuning note'):string{
 const first=question.replace(/\s+/g,' ').trim().split(/(?<=[.?!])\s/)[0]??'';
 const t=first.replace(/[.?!]+$/,'').trim();
 if(!t)return fallback;
 return t.length>80?t.slice(0,79).trimEnd()+'…':t;
}

// ------------------------------------------------------------------ stock values
const ADJUSTERS=['compression','rebound','preload','sag','pressure','spring','height','air','oil level','gearing','sprocket','idle','mixture','needle','jet','clip','map'] as const;
const words=(s:string)=>s.toLowerCase().replace(/[^a-z0-9.\s-]/g,' ');
function adjusterOf(s:string){const w=words(s);return ADJUSTERS.find(a=>new RegExp(`\\b${a}`).test(w))??null;}
function endOf(s:string):'front'|'rear'|null{const w=words(s);if(/\b(fork|front)\b/.test(w))return 'front';if(/\b(shock|rear|swingarm)\b/.test(w))return 'rear';return null;}
function speedOf(s:string):'high'|'low'|null{const w=words(s);if(/\bhigh[- ]?speed\b|\bhsc\b/.test(w))return 'high';if(/\blow[- ]?speed\b|\blsc\b/.test(w))return 'low';return null;}

/** The bike's stock value for a setting, from the published values the answer used ("Fork compression" → "12 clicks out"),
 *  or null when no published value clearly matches. Same adjuster, same end (fork/front, shock/rear), same speed. */
export function stockFor(setting:string,specifications:{value:string}[]|undefined):string|null{
 const adjuster=adjusterOf(setting);if(!adjuster||!specifications?.length)return null;
 const end=endOf(setting),speed=speedOf(setting);
 // A value that names no end ("Riding sag") fits either end. The stock/standard row wins; otherwise only a single match counts.
 const rows=specifications.map(s=>{const f=splitFact(s.value);return {name:settingName(plainName(f.name)),value:f.value};}).filter(r=>r.value);
 const fits=rows.filter(r=>{const e=endOf(r.name);return adjusterOf(r.name)===adjuster&&(!end||!e||e===end)&&speedOf(r.name)===speed;});
 const pick=fits.find(r=>/\(stock\)|\bstandard\b/i.test(r.name))??(fits.length===1?fits[0]:null);
 return pick?clip(pick.value,NOTE_LIMITS.stock):null;
}

// ------------------------------------------------------------------ plain text
const UUID=/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;
const FILE=/\b[\w.-]+\.(pdf|json|csv|tsv|txt|md|ts|tsx|js|mjs|sql|xlsx?|docx?|html?)\b/gi;
const URL_RX=/\bhttps?:\/\/\S+/gi;
// Internal context keys and evidence markers ("verified_claims", "[E12]", "(claim c_123)") never reach a shared sheet.
const SNAKE=/\b[a-z]+(?:_[a-z0-9]+)+\b/g;
const MARKERS=/\s*[[(](?:evidence|claim|source|ref|id|e)\s*[:#]?\s*[\w-]*\d[\w-]*[\])]/gi;
/** Removes ids, links, file names and internal field names from text a rider will share. */
export function scrubInternal(text:string):string{
 return text.replace(MARKERS,'').replace(UUID,'').replace(URL_RX,'').replace(FILE,'').replace(SNAKE,'')
  .replace(/\(\s*\)|\[\s*\]/g,'').replace(/[ \t]{2,}/g,' ').replace(/ +([.,;:])/g,'$1').split('\n').map(l=>l.trimEnd()).join('\n').trim();
}
/** BAK's answer in plain text: Markdown headings, bold and tables turned into lines a text message shows cleanly. */
export function plainAnswer(answer:string):string{
 const lines=answer.replace(/\r/g,'').split('\n'),out:string[]=[];
 const cells=(l:string)=>l.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim());
 for(let i=0;i<lines.length;i++){
  const line=lines[i];
  if(/^\s*\|.*\|\s*$/.test(line)&&i+1<lines.length&&/^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i+1])&&lines[i+1].includes('-')){
   const head=cells(line);i+=2;
   while(i<lines.length&&/^\s*\|.*\|\s*$/.test(lines[i])){const r=cells(lines[i]);out.push('• '+head.map((h,m)=>r[m]?`${h}: ${r[m]}`:'').filter(Boolean).join(' · '));i++;}
   i--;continue;
  }
  const heading=line.match(/^\s{0,3}#{1,4}\s+(.*?)\s*#*\s*$/);
  if(heading){if(out.length&&out[out.length-1]!=='')out.push('');out.push(heading[1].toUpperCase());continue;}
  out.push(line.replace(/^\s*[-*]\s+/,'• '));
 }
 const text=out.join('\n').replace(/\*\*([^*\n]+)\*\*/g,'$1').replace(/(^|\s)\*([^*\n]+)\*(?=\s|[.,;:!?]|$)/g,'$1$2').replace(/\n{3,}/g,'\n\n');
 return scrubInternal(text);
}

// ------------------------------------------------------------------ building a note
/** A note from one BAK answer: the question before it, the answer, up to six setup changes with stock values where a
 *  published value matches, the bike and the day. The answer's own text is kept as written (Markdown and all) for the app;
 *  the shared sheet is the plain version. */
export function noteFromAnswer({bike,question,response,messageId,conversationId,at}:{bike:(Pick<Bike,'id'|'model_year'|'manufacturer'|'model'>&{nickname?:string|null})|null;question:string;response:EngineeringResponse;messageId:string|null;conversationId:string|null;at:string}):NoteDraft{
 const answer=(response.answer||response.summary||'').trim();
 const changes=(response.setup_changes??[]).slice(0,NOTE_LIMITS.changes).map(c=>({setting:clip(c.setting,NOTE_LIMITS.setting),change:clip(c.change,NOTE_LIMITS.change),stock:stockFor(c.setting,response.specifications)}));
 return {bike_id:bike?.id??'',title:noteTitle(question,noteTitle(response.summary??'')),question:clip(question,NOTE_LIMITS.question),answer:clip(answer,NOTE_LIMITS.answer),setup_changes:changes,rider_note:'',bike_label:bike?bikeLabel(bike):'General question',noted_at:at,conversation_id:conversationId,source_message_id:messageId};
}
/** A note the rider wrote (or one saved on a device before notes moved to the account). */
export function riderNote({bike,text,at,conversationId=null}:{bike:Pick<Bike,'id'|'model_year'|'manufacturer'|'model'>&{nickname?:string|null};text:string;at:string;conversationId?:string|null}):NoteDraft{
 const body=clip(text,NOTE_LIMITS.riderNote);
 return {bike_id:bike.id,title:noteTitle(body,'My note'),question:'',answer:'',setup_changes:[],rider_note:body,bike_label:bikeLabel(bike),noted_at:at,conversation_id:conversationId,source_message_id:null};
}

// ------------------------------------------------------------------ moving device notes to the account
export type LocalNote={id:string;at:string;text:string;conversation?:string};
const UUID_ONE=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** The notes saved on this device that still need to reach the account, as uploads. The device note's own id is reused as
 *  the account row's id, so sending one twice (a retry, a second launch) saves it once. Unreadable rows are skipped. */
export function localNoteUploads(local:unknown,bike:Pick<Bike,'id'|'model_year'|'manufacturer'|'model'>&{nickname?:string|null},done:readonly string[]=[]):{id:string;body:{id:string;bike_id:string;rider_note:string;noted_at:string;conversation_id:string|null}}[]{
 if(!Array.isArray(local))return [];
 return local.flatMap(raw=>{
  const n=raw as Partial<LocalNote>;
  if(!n||typeof n.id!=='string'||!UUID_ONE.test(n.id)||typeof n.text!=='string'||!n.text.trim()||done.includes(n.id))return [];
  const at=typeof n.at==='string'&&Number.isFinite(Date.parse(n.at))?new Date(n.at).toISOString():new Date(0).toISOString();
  const conversation=typeof n.conversation==='string'&&UUID_ONE.test(n.conversation)?n.conversation:null;
  return [{id:n.id,body:{id:n.id,bike_id:bike.id,rider_note:clip(n.text,NOTE_LIMITS.riderNote),noted_at:at,conversation_id:conversation}}];
 });
}

/** What goes in the Ask BAK box from "Ask BAK about this note": the note in a few lines, then the rider's follow-up. */
export function askAboutNote(note:Pick<TuningNote,'title'|'question'|'setup_changes'|'rider_note'|'noted_at'>):string{
 const lines=[`About my saved tuning note “${note.title}” (${day(note.noted_at)}):`];
 if(note.question.trim())lines.push(`I asked: ${clip(note.question.replace(/\s+/g,' '),300)}`);
 if(note.setup_changes.length)lines.push(`Changes: ${note.setup_changes.map(c=>`${c.setting}: ${c.change}`).join('; ')}`);
 if(note.rider_note.trim())lines.push(`My note: ${clip(note.rider_note.replace(/\s+/g,' '),600)}`);
 return lines.join('\n')+'\n\n';
}

// ------------------------------------------------------------------ the shared setup sheet
const day=(iso:string)=>{const d=new Date(iso);return Number.isFinite(d.getTime())?d.toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}):'';};
/** The setup changes as a short table: header and rows of [setting, change, stock]. The stock column is left out when no
 *  change has a stock value. */
export function changeTable(changes:NoteChange[]):{head:string[];rows:string[][]}{
 const stock=changes.some(c=>c.stock);
 return {head:stock?['Setting','Change','Stock']:['Setting','Change'],rows:changes.map(c=>stock?[c.setting,c.change,c.stock??'—']:[c.setting,c.change])};
}
function textTable({head,rows}:{head:string[];rows:string[][]}):string[]{
 const width=head.map((h,i)=>Math.min(28,Math.max(h.length,...rows.map(r=>(r[i]??'').length))));
 const line=(r:string[])=>r.map((c,i)=>i===r.length-1?c:c.padEnd(width[i])).join('  ').trimEnd();
 return [line(head),line(head.map((_,i)=>'-'.repeat(width[i]))),...rows.map(line)];
}
/** The clean setup sheet in plain text: bike, date, the question, BAK's answer, the changes table, the rider's note. */
export function shareText(note:Pick<TuningNote,'title'|'question'|'answer'|'setup_changes'|'rider_note'|'bike_label'|'noted_at'>):string{
 const parts:string[]=[`BAK MX setup sheet`,[note.bike_label,day(note.noted_at)].filter(Boolean).join(' · ')];
 if(note.title&&note.title!==noteTitle(note.question))parts.push('',scrubInternal(note.title));
 if(note.question.trim())parts.push('','QUESTION',scrubInternal(note.question.trim()));
 if(note.answer.trim())parts.push('','BAK’S ANSWER',plainAnswer(note.answer));
 if(note.setup_changes.length)parts.push('','SETUP CHANGES (one at a time, in this order)',...textTable(changeTable(note.setup_changes.map(c=>({setting:scrubInternal(c.setting),change:scrubInternal(c.change),stock:c.stock?scrubInternal(c.stock):null})))));
 if(note.rider_note.trim())parts.push('','MY NOTE',scrubInternal(note.rider_note.trim()));
 parts.push('','Check torque values and anything safety-critical against your manual before you ride.');
 return parts.join('\n').replace(/\n{3,}/g,'\n\n').trim()+'\n';
}
/** "bakmx-setup-2025-ktm-450-sx-f-2026-11-07.txt": bike and day only, never an id. */
export function shareFileName(note:Pick<TuningNote,'bike_label'|'noted_at'>):string{
 const bike=note.bike_label.toLowerCase().replace(/[“”"]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60)||'bike';
 const d=new Date(note.noted_at),date=Number.isFinite(d.getTime())?`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`:'note';
 return `bakmx-setup-${bike}-${date}.txt`;
}

// ------------------------------------------------------------------ photo checks
export const PHOTO_CHECKS=[
 {id:'spark_plug',label:'Spark plug',prompt:'Read my spark plug.',tip:'Plug out, firing end close up in daylight: the insulator tip, the ground strap and the threads.'},
 {id:'tire_wear',label:'Tire wear',prompt:'Check my tire wear.',tip:'Shoot the knobs side-on so their edges show, then the center and the shoulder of the tread.'},
 {id:'chain_sprockets',label:'Chain and sprockets',prompt:'Check my chain and sprockets.',tip:'Rear sprocket square-on so the tooth shape shows, with the chain on it, in good light.'},
 {id:'fork_seal',label:'Fork seal / leak',prompt:'Is my fork seal leaking?',tip:'Wipe the tube clean, pump the fork a few times, then shoot the seal and the tube just below it.'},
 {id:'air_filter',label:'Air filter',prompt:'Check my air filter.',tip:'Filter out: the dirty outside, the clean inside, and the airbox boot it seals against.'},
 {id:'brake_pads',label:'Brake pads',prompt:'Check my brake pads.',tip:'Look into the caliper from the edge with a flashlight so the pad material and backing plate both show.'},
] as const;
export type PhotoCheckId=typeof PHOTO_CHECKS[number]['id'];
export const photoCheck=(id:string)=>PHOTO_CHECKS.find(c=>c.id===id)??null;
