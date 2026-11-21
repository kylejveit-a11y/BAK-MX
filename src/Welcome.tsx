// First sign-in on the website: a short welcome that makes sure the rider either adds their bike or says they are still
// shopping, and takes a friend's invite code. The rest of setup already lives on the site: the 60-second rider setup
// opens once a bike is added, and answers, look and reminders are in Account. Mirrors the app's first-login setup.
import {useState} from 'react';
import {api} from './client';
import {Sheet,errorText} from './HomeBlocks';

const key=(userId:string)=>`bak.welcome-v1.${userId}`;
export const welcomeDone=(userId:string)=>{try{return !!localStorage.getItem(key(userId));}catch{return true;}};
const finish=(userId:string,how:string)=>{try{localStorage.setItem(key(userId),how);}catch{}};

export function WelcomeSheet({userId,onAddBike,onClose}:{userId:string;onAddBike:()=>void;onClose:()=>void}){
 const [code,setCode]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[saved,setSaved]=useState(false);
 async function saveCode(){
  if(!code.trim()||saved)return true;setBusy(true);setNotice('');
  try{await api('/invite/redeem','POST',{code:code.trim()});setSaved(true);return true;}catch(e){setNotice(errorText(e));return false;}finally{setBusy(false);}
 }
 async function leave(how:'bike'|'shopping'|'skipped'){
  if(how!=='skipped'&&!(await saveCode()))return;
  finish(userId,how);if(how==='bike')onAddBike();onClose();
 }
 return <Sheet title="Welcome to BAK MX" onClose={()=>void leave('skipped')} closeLabel="Skip">
  <p className="subtle" style={{marginTop:0}}>BAK answers for your exact bike, so the first step is telling it what you ride.</p>
  <div style={{display:'grid',gap:10}}>
   <button type="button" className="primary" disabled={busy} onClick={()=>void leave('bike')}>Add my bike</button>
   <button type="button" disabled={busy} onClick={()=>void leave('shopping')}>I’m still shopping for one</button>
  </div>
  <label className="field" style={{marginTop:16}}><span>Did a friend invite you? Enter their code (optional)</span>
   <input value={code} disabled={saved} onChange={e=>setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g,'').slice(0,13))} placeholder="Friend’s code" autoCapitalize="characters" autoCorrect="off" spellCheck={false}/></label>
  <small className="subtle">{saved?'Code saved. Your friend gets 10 free questions once your bike is in the Garage.':'They get 10 free Ask BAK questions once you add your bike.'}</small>
  {notice&&<div className="error" role="alert">{notice} You can clear the box and carry on.</div>}
  <p className="subtle" style={{marginBottom:0}}>After your bike is in, BAK asks four quick things about you and writes a starting setup. Answer style, colours and reminders are under Account whenever you want them.</p>
 </Sheet>;
}
