import {useState} from 'react';
import {Check,Sparkles} from 'lucide-react';
import {describeAppAction,runAppAction,type AppAction,type AppActionHost} from '../shared/app-actions';

const doneKey=(id:string)=>'bak.actions-done.'+id;
const wasDone=(id:string)=>{try{return localStorage.getItem(doneKey(id))==='1';}catch{return false;}};

/** Under a BAK reply: what the rider asked BAK to do in the app, spelled out. Nothing runs until they tap Apply; each
 *  action runs with their own session, one at a time, and the card says what happened to each. */
export function AppActions({messageId,actions,host}:{messageId:string;actions:AppAction[]|undefined;host:AppActionHost}){
 const [off,setOff]=useState<Set<number>>(new Set()),[busy,setBusy]=useState(false),[results,setResults]=useState<(string|{error:string})[]>([]),[dismissed,setDismissed]=useState(()=>wasDone(messageId));
 if(!actions?.length||dismissed&&!results.length)return null;
 const lines=actions.map(a=>describeAppAction(a,host.bikes));
 const finished=results.length>0&&!busy;
 async function apply(){
  setBusy(true);const out:(string|{error:string})[]=[];
  for(const [i,a] of actions!.entries()){if(off.has(i)){out.push('Skipped');continue;}
   try{out.push(await runAppAction(a,host));}catch(e){out.push({error:(e as Error).message});}
   setResults([...out]);}
  try{localStorage.setItem(doneKey(messageId),'1');}catch{/* the card simply shows again next visit */}
  setBusy(false);
 }
 const chosen=actions.length-off.size;
 return <section className={'garage-updates app-actions'+(finished?' done':'')} aria-label="Do this in the app">
  <h4>{finished?<Check size={16}/>:<Sparkles size={16}/>}{finished?'Done':'Want BAK to do this?'}</h4>
  <ul>{actions.map((_,i)=>{const r=results[i];return <li key={i}><label>
   {!results.length&&<input type="checkbox" checked={!off.has(i)} disabled={busy} onChange={()=>{const n=new Set(off);n.has(i)?n.delete(i):n.add(i);setOff(n)}}/>}
   <span className="gu-text"><b>{lines[i].title}</b>{lines[i].detail&&<span>{lines[i].detail}</span>}{r&&<span className={typeof r==='string'?'aa-ok':'aa-error'} role={typeof r==='string'?undefined:'alert'}>{typeof r==='string'?r:r.error}</span>}</span></label></li>;})}</ul>
  {!results.length&&<div className="aa-buttons"><button className="button" disabled={busy||!chosen} onClick={apply}>{busy?'Working…':chosen===actions.length?(actions.length===1?'Apply':'Apply all'):`Apply ${chosen}`}</button><button className="button secondary" disabled={busy} onClick={()=>{setDismissed(true);try{localStorage.setItem(doneKey(messageId),'1');}catch{/* fine */}}}>Not now</button></div>}
 </section>;
}
