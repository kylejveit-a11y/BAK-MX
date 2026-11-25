// Readable copies of a bike's service log and setup log, as spreadsheet files (.csv) the rider keeps: for a mechanic, a buyer,
// or their own records if they ever leave BAK MX. Riders asked for this by name after losing records to apps that shut down.
// Pure functions; the phone writes the text to a file and opens the share sheet.
import {SETUP_FIELDS,SETUP_RESULT_LABELS,type SetupLog} from './rider-types.ts';
import type {ServiceEvent} from './types.ts';

/** One CSV cell. Quotes when needed, and a leading = + - @ gets an apostrophe so a spreadsheet never runs a note as a formula. */
export function csvCell(v:string|number|null|undefined):string{
 if(v==null)return '';
 let s=typeof v==='number'?String(v):v.replace(/\r\n?/g,'\n');
 if(typeof v!=='number'&&/^[=+\-@\t]/.test(s))s="'"+s;
 return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;
}
const rows=(lines:(string|number|null|undefined)[][])=>lines.map(l=>l.map(csvCell).join(',')).join('\r\n')+'\r\n';
const day=(iso:string)=>/^\d{4}-\d{2}-\d{2}/.test(iso)?iso.slice(0,10):'';
const newestFirst=<T,>(list:T[],at:(x:T)=>string)=>[...list].sort((a,b)=>at(b).localeCompare(at(a)));

/** The service history: one row per job, newest first, with a heading that names the bike and the date it was made. */
export function serviceLogCsv(bike:string,events:ServiceEvent[],made:string):string{
 return rows([['BAK MX service history',bike],['Exported',day(made)],[],
  ['Date','Job','Engine hours','Next due at (hours)','Notes'],
  ...newestFirst(events,e=>e.performed_at).map(e=>[day(e.performed_at),e.category,e.engine_hours,e.next_due_hours,e.notes])]);
}
/** The setup log: one row per entry, newest first, every setting in its own column so two days can be compared side by side. */
export function setupLogCsv(bike:string,logs:SetupLog[],made:string):string{
 const used=SETUP_FIELDS.filter(f=>logs.some(l=>l.settings?.[f.key]!=null&&l.settings[f.key]!==''));
 return rows([['BAK MX setup log',bike],['Exported',day(made)],[],
  ['Date','Track','Conditions','Engine hours','Change made','Result','Notes',...used.map(f=>`${f.group}: ${f.label}`)],
  ...newestFirst(logs,l=>l.recorded_at).map(l=>[day(l.recorded_at),l.track,l.conditions,l.engine_hours,l.change_made,SETUP_RESULT_LABELS[l.result]??l.result,l.notes,...used.map(f=>l.settings?.[f.key]??'')])]);
}
/** bakmx-service-2024-ktm-450-sx-f-2026-11-25.csv */
export function logFileName(kind:'service'|'setup',bike:string,made:string):string{
 const b=bike.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60)||'bike';
 return `bakmx-${kind}-${b}-${day(made)||'log'}.csv`;
}
