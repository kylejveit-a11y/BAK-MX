import {useState} from 'react';
import {Check,Minus,ThumbsDown,ThumbsUp} from 'lucide-react';
import type {Bike} from '../shared/types';
import type {SetupLog,SetupResult} from '../shared/rider-types';
import {api} from './client';

type Change={setting:string;change:string};
const RESULTS:{key:Exclude<SetupResult,'not_tested'>;label:string;icon:typeof ThumbsUp}[]=[{key:'better',label:'Better',icon:ThumbsUp},{key:'no_change',label:'No change',icon:Minus},{key:'worse',label:'Worse',icon:ThumbsDown}];
const said:Record<string,string>={better:'better',no_change:'no different',worse:'worse'};

/** After BAK suggests setup changes: the rider rides, then taps how it went. Saved to the bike's setup log, which BAK
 *  reads on the next question, so the next suggestion builds on the result. */
export function RideCheck({bike,messageId,changes,logged,onLogged,onAsk}:{bike:Bike;messageId:string;changes:Change[];logged?:SetupLog;onLogged:(log:SetupLog)=>void;onAsk:(text:string)=>void}){
 const [which,setWhich]=useState(0),[result,setResult]=useState<Exclude<SetupResult,'not_tested'>|null>(null),[track,setTrack]=useState(''),[notes,setNotes]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const text=(c:Change)=>`${c.setting}: ${c.change}`;
 if(logged){const r=logged.result;return <section className="ride-check done">
  <p><Check size={16}/><span>You said <b>{logged.change_made}</b> rode <b>{said[r]??'untested'}</b>{logged.track?` at ${logged.track}`:''}. It’s in your setup log and BAK will use it.</span></p>
  <button className="text-button" onClick={()=>onAsk(`I tried ${logged.change_made}. It rode ${said[r]??'no different'}${logged.track?` at ${logged.track}`:''}.${logged.notes?' '+logged.notes:''} What should I try next?`)}>Ask BAK what’s next</button>
 </section>;}
 async function save(){
  if(!result)return;setBusy(true);setError('');
  try{const log=await api<SetupLog>('/setup-logs','POST',{bike_id:bike.id,recorded_at:new Date().toISOString(),track:track.trim(),conditions:'',engine_hours:bike.engine_hours,settings:{bak_suggestion:messageId},change_made:text(changes[which]).slice(0,1000),result,notes:notes.trim()});onLogged(log);}
  catch(e){setError((e as Error).message)}finally{setBusy(false)}
 }
 return <section className="ride-check" aria-label="How did it ride?">
  <h4>Tried it? How did it ride?</h4>
  {changes.length>1&&<div className="rc-which" role="radiogroup" aria-label="Which change did you try?">{changes.map((c,i)=><button key={i} role="radio" aria-checked={which===i} className={which===i?'on':''} onClick={()=>setWhich(i)}>{c.setting}</button>)}</div>}
  <div className="rc-results">{RESULTS.map(({key,label,icon:Icon})=><button key={key} className={'rc-result '+key+(result===key?' on':'')} aria-pressed={result===key} onClick={()=>setResult(key)}><Icon size={18}/>{label}</button>)}</div>
  {result&&<div className="rc-more">
   <input value={track} onChange={e=>setTrack(e.target.value)} maxLength={120} placeholder="Track (optional)" aria-label="Track"/>
   <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} maxLength={1000} placeholder={result==='better'?'What improved? (optional)':result==='worse'?'What got worse? (optional)':'Anything you noticed? (optional)'} aria-label="Notes"/>
   {error&&<div className="error" role="alert">{error}</div>}
   <button className="button" disabled={busy} onClick={save}>{busy?'Saving…':'Save to my setup log'}</button>
  </div>}
 </section>;
}
