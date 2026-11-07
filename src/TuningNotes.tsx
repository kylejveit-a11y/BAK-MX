// Tuning notes on the website: "Save to bike" and "Share" under a BAK answer, the quick note under the chat, the Garage
// "Tuning notes" list, and "Check it with a photo". Notes are saved to the rider's account (shared/tuning-notes.ts); notes
// this browser kept before that move up to the account once, the first time the rider is signed in after the update.
import {useEffect,useRef,useState} from 'react';
import {BookmarkCheck,BookmarkPlus,Camera,ChevronDown,ChevronUp,Copy,Download,MessageSquare,NotebookPen,Pencil,Share2,Trash2,X} from 'lucide-react';
import type {Bike,Message} from '../shared/types';
import {PHOTO_CHECKS,askAboutNote,changeTable,localNoteUploads,noteFromAnswer,shareFileName,shareText,photoCheck,type NoteDraft,type PhotoCheckId,type TuningNote} from '../shared/tuning-notes';
import {api} from './client';
import {RichText} from './RichText';
import {readLocal,writeLocal,errorText} from './HomeBlocks';
import './tuning-notes.css';

// ------------------------------------------------------------------ the bike's notes
export function useBikeNotes(bike:Bike|undefined,signedIn:boolean){
 const [notes,setNotes]=useState<TuningNote[]|null>(null),[error,setError]=useState('');
 const reload=async()=>{if(!bike||!signedIn){setNotes([]);return;}try{setNotes(await api<TuningNote[]>('/tuning-notes?bike_id='+bike.id));setError('');}catch(e){setError(errorText(e));setNotes(n=>n??[]);}};
 useEffect(()=>{setNotes(null);void reload();},[bike?.id,signedIn]);
 const put=(n:TuningNote)=>setNotes(list=>[n,...(list??[]).filter(x=>x.id!==n.id)].sort((a,b)=>b.noted_at.localeCompare(a.noted_at)));
 const drop=(id:string)=>setNotes(list=>(list??[]).filter(x=>x.id!==id));
 return {notes,error,reload,put,drop};
}
export type BikeNotes=ReturnType<typeof useBikeNotes>;

/** Notes this browser kept per bike move to the account once. The browser's copy stays as a backup; a flag stops a re-send. */
export async function moveBrowserNotes(account:string,bikes:Bike[]):Promise<void>{
 for(const bike of bikes){
  const doneKey=`tuning-notes-moved-${bike.id}`,done=readLocal<string[]>(account,doneKey,[]);
  if(done.includes('*'))continue;
  const uploads=localNoteUploads(readLocal<unknown>(account,`tuning-notes-${bike.id}`,[]),bike,done);
  const moved=[...done];let failed=false;
  for(const u of uploads){try{await api('/tuning-notes','POST',u.body);moved.push(u.id);}catch{failed=true;}}
  writeLocal(account,doneKey,failed?moved:['*']);
 }
}

// ------------------------------------------------------------------ share
async function shareNote(note:Pick<TuningNote,'title'|'question'|'answer'|'setup_changes'|'rider_note'|'bike_label'|'noted_at'>):Promise<'shared'|'fallback'|'cancelled'>{
 const text=shareText(note);
 if(typeof navigator!=='undefined'&&'share' in navigator){try{await navigator.share({title:`BAK MX setup · ${note.bike_label}`,text});return 'shared';}catch(e){if((e as Error).name==='AbortError')return 'cancelled';}}
 return 'fallback';
}
function download(note:Parameters<typeof shareNote>[0]){const url=URL.createObjectURL(new Blob([shareText(note)],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=shareFileName(note);a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
/** Share: the system share sheet where the browser has one, otherwise copy or download the plain-text sheet. */
export function ShareNote({note,label='Share'}:{note:Parameters<typeof shareNote>[0];label?:string}){
 const [fallback,setFallback]=useState(false),[status,setStatus]=useState('');
 return <>
  <button type="button" className="tn-action" onClick={async()=>{setStatus('');const r=await shareNote(note);if(r==='fallback')setFallback(true);}}><Share2 size={15}/>{label}</button>
  {fallback&&<span className="tn-fallback" role="group" aria-label="Share options">
   <button type="button" className="tn-action" onClick={async()=>{try{await navigator.clipboard.writeText(shareText(note));setStatus('Copied. Paste it anywhere.');}catch{setStatus('This browser would not copy. Use Download instead.');}}}><Copy size={15}/>Copy</button>
   <button type="button" className="tn-action" onClick={()=>{download(note);setStatus('Downloaded.');}}><Download size={15}/>Download</button>
   <button type="button" className="tn-action quiet" aria-label="Close share options" onClick={()=>{setFallback(false);setStatus('');}}><X size={14}/></button>
  </span>}
  {status&&<span className="tn-status" role="status">{status}</span>}
 </>;
}

// ------------------------------------------------------------------ under a BAK answer
export function AnswerNoteBar({bike,message,question,notes}:{bike?:Bike;message:Message;question:string;notes?:BikeNotes}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');const id=useRef(crypto.randomUUID());
 if(!message.response)return null;
 const saved=notes?.notes?.find(n=>n.source_message_id===message.id);
 const draft:NoteDraft=noteFromAnswer({bike:bike??null,question,response:message.response,messageId:message.id,conversationId:message.conversation_id,at:message.created_at});
 async function save(){if(!bike||busy)return;setBusy(true);setError('');try{const n=await api<TuningNote>('/tuning-notes','POST',{id:id.current,message_id:message.id});notes?.put(n);}catch(e){setError(errorText(e));}finally{setBusy(false);}}
 return <div className="tn-bar">
  {bike&&notes&&(saved?<span className="tn-action done"><BookmarkCheck size={15}/>Saved to {bike.nickname||bike.model}</span>:<button type="button" className="tn-action" disabled={busy} onClick={()=>void save()}><BookmarkPlus size={15}/>{busy?'Saving…':'Save to bike'}</button>)}
  <ShareNote note={saved??draft}/>
  {error&&<span className="tn-error" role="alert">{error}</span>}
 </div>;
}

// ------------------------------------------------------------------ the quick note under the chat
export function ChatNoteBox({bike,conversation,notes,onOpenGarage}:{bike:Bike;conversation:string;notes:BikeNotes;onOpenGarage?:()=>void}){
 const [open,setOpen]=useState(false),[draft,setDraft]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const list=notes.notes??[];
 async function save(){const text=draft.trim();if(!text||busy)return;setBusy(true);setError('');try{const n=await api<TuningNote>('/tuning-notes','POST',{id:crypto.randomUUID(),bike_id:bike.id,rider_note:text,...(conversation?{conversation_id:conversation}:{})});notes.put(n);setDraft('');}catch(e){setError(errorText(e));}finally{setBusy(false);}}
 return <div className="hb-notes">
  <button type="button" className="hb-notes-toggle" aria-expanded={open} onClick={()=>setOpen(!open)}><NotebookPen size={21}/><span className="hb-grow"><b>Tuning notes{list.length?` · ${list.length}`:''}</b><small>What you changed, how it felt, what’s next. Saved to your account.</small></span>{open?<ChevronUp size={17}/>:<ChevronDown size={17}/>}</button>
  {open&&<div className="hb-notes-body">
   <label className="hb-field"><span className="hb-field-label">New note</span><textarea className="hb-input" value={draft} maxLength={4000} onChange={e=>setDraft(e.target.value)} placeholder="Rebound 2 slower. Rear stayed down in the braking bumps."/></label>
   {(error||notes.error)&&<p className="hb-error" role="alert">{error||notes.error}</p>}
   <button type="button" className="button" disabled={!draft.trim()||busy} onClick={()=>void save()}>{busy?'Saving…':'Save note'}</button>
   {list.slice(0,3).map(n=><div key={n.id} className="hb-note-item"><small>{new Date(n.noted_at).toLocaleString()}</small><p>{n.rider_note||n.title}</p></div>)}
   {onOpenGarage&&list.length>0&&<button type="button" className="hb-link muted" style={{alignSelf:'flex-start'}} onClick={onOpenGarage}>All notes for this bike</button>}
  </div>}
 </div>;
}

// ------------------------------------------------------------------ Garage › Tuning notes
export function NotesPanel({bike,signedIn,onSignIn,onAsk}:{bike:Bike;signedIn:boolean;onSignIn:()=>void;onAsk:(text:string)=>void}){
 const notes=useBikeNotes(bike,signedIn),[open,setOpen]=useState(''),[renaming,setRenaming]=useState(''),[name,setName]=useState(''),[confirm,setConfirm]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 if(!signedIn)return <section className="panel"><p className="subtle">Sign in to keep tuning notes for this bike.</p><button type="button" className="button" onClick={onSignIn}>Sign in</button></section>;
 async function rename(n:TuningNote){const t=name.trim();if(!t||busy)return;setBusy(true);setError('');try{notes.put(await api<TuningNote>('/tuning-notes?id='+n.id,'PATCH',{title:t}));setRenaming('');}catch(e){setError(errorText(e));}finally{setBusy(false);}}
 async function remove(n:TuningNote){if(busy)return;setBusy(true);setError('');try{await api('/tuning-notes?id='+n.id,'DELETE');notes.drop(n.id);setConfirm('');if(open===n.id)setOpen('');}catch(e){setError(errorText(e));}finally{setBusy(false);}}
 const list=notes.notes;
 return <section className="panel tn-panel">
  <div className="panel-title"><div><span className="eyebrow">YOUR NOTEBOOK</span><h2>Tuning notes</h2></div></div>
  <p className="subtle">BAK answers you saved to this bike and notes you wrote. Saved to your account, on every device.</p>
  {(error||notes.error)&&<div className="error" role="alert">{error||notes.error}</div>}
  {list===null&&<p className="subtle" role="status">Loading notes…</p>}
  {list&&!list.length&&<div className="empty"><h3>No notes yet.</h3><p>Tap “Save to bike” under any BAK answer, or write a note under the chat.</p></div>}
  {list&&list.map(n=>{const table=changeTable(n.setup_changes),isOpen=open===n.id;return <article key={n.id} className={'tn-note'+(isOpen?' open':'')}>
   <button type="button" className="tn-note-head" aria-expanded={isOpen} onClick={()=>setOpen(isOpen?'':n.id)}><span><b>{n.title}</b><small>{new Date(n.noted_at).toLocaleDateString([],{year:'numeric',month:'short',day:'numeric'})}{n.setup_changes.length?` · ${n.setup_changes.length} change${n.setup_changes.length>1?'s':''}`:''}{!n.answer?' · your note':''}</small></span>{isOpen?<ChevronUp size={17}/>:<ChevronDown size={17}/>}</button>
   {isOpen&&<div className="tn-note-body">
    {renaming===n.id?<form className="tn-rename" onSubmit={e=>{e.preventDefault();void rename(n);}}><input aria-label="Note name" value={name} maxLength={120} onChange={e=>setName(e.target.value)} autoFocus/><button className="button" type="submit" disabled={busy||!name.trim()}>Save</button><button className="button secondary" type="button" onClick={()=>setRenaming('')}>Cancel</button></form>:null}
    {!!n.question&&<><span className="eyebrow">YOU ASKED</span><p className="tn-question">{n.question}</p></>}
    {!!n.answer&&<><span className="eyebrow">BAK</span><RichText className="response-answer" text={n.answer}/></>}
    {table.rows.length>0&&<div className="rich-table tn-table"><table><thead><tr>{table.head.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{table.rows.map((r,i)=><tr key={i}>{r.map((c,j)=><td key={j}>{c}</td>)}</tr>)}</tbody></table></div>}
    {!!n.rider_note&&<><span className="eyebrow">YOUR NOTE</span><p className="tn-question">{n.rider_note}</p></>}
    <div className="tn-bar">
     <button type="button" className="tn-action" onClick={()=>onAsk(askAboutNote(n))}><MessageSquare size={15}/>Ask BAK about this note</button>
     <ShareNote note={n}/>
     <button type="button" className="tn-action" onClick={()=>{setRenaming(n.id);setName(n.title);}}><Pencil size={15}/>Rename</button>
     {confirm===n.id?<><button type="button" className="tn-action danger" disabled={busy} onClick={()=>void remove(n)}>Delete this note?</button><button type="button" className="tn-action" onClick={()=>setConfirm('')}>Keep</button></>:<button type="button" className="tn-action quiet" onClick={()=>setConfirm(n.id)}><Trash2 size={15}/>Delete</button>}
    </div>
   </div>}
  </article>;})}
 </section>;
}

// ------------------------------------------------------------------ check it with a photo
export function PhotoCheckChips({disabled,onPick}:{disabled?:boolean;onPick:(id:PhotoCheckId)=>void}){
 return <div className="tn-checks" role="group" aria-label="Check it with a photo"><span className="tn-checks-label"><Camera size={14}/>Check it with a photo</span>{PHOTO_CHECKS.map(c=><button key={c.id} type="button" className="hb-cchip" disabled={disabled} onClick={()=>onPick(c.id)}>{c.label}</button>)}</div>;
}
/** The one-line shot tip, then the camera (on a phone browser) or the file picker. The picker needs this tap to open. */
export function PhotoCheckPrompt({check,busy,onTake,onCancel}:{check:PhotoCheckId;busy:boolean;onTake:()=>void;onCancel:()=>void}){
 const c=photoCheck(check);if(!c)return null;
 return <div className="tn-check-prompt" role="dialog" aria-label={`Check it with a photo: ${c.label}`}>
  <p><b>{c.label}.</b> {c.tip}</p>
  <div className="tn-bar"><button type="button" className="button" disabled={busy} onClick={onTake}><Camera size={15}/>{busy?'Uploading…':'Take or choose a photo'}</button><button type="button" className="button secondary" disabled={busy} onClick={onCancel}>Cancel</button></div>
 </div>;
}
