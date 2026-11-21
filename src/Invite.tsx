// Invite a friend: the Account panel (your code, what you earned, enter a friend's code) and the public page a shared
// link opens (bakmx.com/invite/CODE): the code, how to use it, where to get the app. No sign-in on the public page.
import React,{useEffect,useState} from 'react';
import {api} from './client';
import {INVITE,INVITE_CODE,normalizeInviteCode,type InviteSummary} from '../shared/invites';

const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';
const day=(iso:string|null)=>iso?new Date(iso).toLocaleDateString(undefined,{month:'short',day:'numeric'}):'';
const plan=(t:'premium'|'pro')=>t==='pro'?'Pro':'Premium';
const APP_STORE='https://apps.apple.com/app/id6825128988';

export function InvitePanel(){
 const [s,setS]=useState<InviteSummary|null>(null),[error,setError]=useState(''),[code,setCode]=useState(''),[busy,setBusy]=useState(false),[note,setNote]=useState('');
 useEffect(()=>{api<InviteSummary>('/invite').then(setS).catch(e=>setError(errorText(e)));},[]);
 async function share(){
  if(!s)return;setNote('');
  try{if(navigator.share){await navigator.share({text:s.message});return;}await navigator.clipboard.writeText(s.message);setNote('Copied. Paste it in a text or message to your friend.');}catch{/* closed the share sheet */}
 }
 async function enter(e:React.FormEvent){
  e.preventDefault();if(busy||!code.trim())return;setBusy(true);setError('');setNote('');
  try{setS(await api<InviteSummary>('/invite/redeem','POST',{code:code.trim()}));setCode('');setNote('Code saved. Your friend gets their questions once your bike is in the Garage.');}catch(x){setError(errorText(x));}finally{setBusy(false);}
 }
 if(!s)return <section className="panel">{!error&&<p className="subtle" role="status">Loading…</p>}{error&&<div className="error" role="alert">{error}</div>}</section>;
 const toNext=INVITE.friendsPerMonth-(s.paying%INVITE.friendsPerMonth);
 return <section className="panel" style={{display:'grid',gap:14}}>
  <div style={{textAlign:'center',padding:'14px 12px',border:'1px solid #2a2f38',borderRadius:14,background:'#12151b'}}>
   <small className="subtle">Your invite code</small>
   <div style={{fontSize:28,fontWeight:800,letterSpacing:2,userSelect:'all'}}>{s.code}</div>
  </div>
  <button type="button" className="primary" onClick={()=>void share()}>Share my code</button>
  <div><b>What you get</b>
   <p className="subtle" style={{margin:'6px 0 0'}}>{INVITE.joinQuestions} free Ask BAK questions each time a friend signs up with your code and adds their bike.</p>
   <p className="subtle" style={{margin:'6px 0 0'}}>A free month of your plan for every {INVITE.friendsPerMonth} friends who go on a paid plan and stay {INVITE.paidDaysBeforeCounting} days.</p></div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
   {[[s.joined,'joined'],[s.questions_earned,'questions earned'],[s.paying,'on a paid plan']].map(([n,l])=><div key={l} style={{padding:'12px 6px',border:'1px solid #2a2f38',borderRadius:12,background:'#12151b',textAlign:'center'}}><div style={{fontSize:20,fontWeight:800}}>{n}</div><small className="subtle">{l}</small></div>)}
  </div>
  {s.waiting>0&&<p className="subtle" style={{margin:0}}>{s.waiting} {s.waiting===1?'friend has':'friends have'} entered your code and still {s.waiting===1?'needs':'need'} to confirm their email or add a bike.</p>}
  {s.joined>0&&<p className="subtle" style={{margin:0}}>{toNext} more paying {toNext===1?'friend':'friends'} until your next free month.</p>}
  {s.months.map(m=><div key={m.seq} style={{padding:12,border:'1px solid #2a2f38',borderRadius:12}}><b>Free month of {plan(m.tier)}</b>
   <p className="subtle" style={{margin:'4px 0 0'}}>{m.how==='unlock'?(m.ends_at&&Date.parse(m.ends_at)>Date.now()?`${plan(m.tier)} is open on your account until ${day(m.ends_at)}.`:`Used. It ended ${day(m.ends_at)}.`):m.offer_code?<>Redeem <b style={{userSelect:'all'}}>{m.offer_code}</b> in your phone’s store to get the month free.</>:'Earned. Your store code is on its way and will show here.'}</p></div>)}
  {s.can_enter&&<form onSubmit={enter} style={{display:'grid',gap:8}}>
   <label><span>Have a friend’s code?</span><input value={code} onChange={e=>setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g,'').slice(0,13))} placeholder="Their code" autoCapitalize="characters" autoCorrect="off" spellCheck={false}/></label>
   <button type="submit" disabled={busy||!code.trim()}>Save their code</button></form>}
  {note&&<p className="subtle" role="status" style={{margin:0}}>{note}</p>}
  {error&&<div className="error" role="alert">{error}</div>}
 </section>;
}

const box:React.CSSProperties={maxWidth:520,margin:'0 auto',padding:'40px 20px',color:'#f6f7f9',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif'};
const btn:React.CSSProperties={display:'block',padding:'14px 16px',borderRadius:12,background:'#1e6fff',color:'#fff',textDecoration:'none',fontWeight:700,textAlign:'center',border:0,fontSize:16,width:'100%',cursor:'pointer'};
const quiet:React.CSSProperties={...btn,background:'transparent',border:'1px solid #2a2f38',color:'#f6f7f9'};

export function InvitePage({raw}:{raw:string}){
 const code=normalizeInviteCode(raw),valid=INVITE_CODE.test(code);const [copied,setCopied]=useState(false);
 useEffect(()=>{document.title='You’re invited to BAK MX';},[]);
 return <div style={{background:'#060609',minHeight:'100vh'}}><main style={box}>
  <div style={{fontSize:13,color:'#9aa2ae',fontWeight:700}}>BAK MX</div>
  <h1 style={{fontSize:30,lineHeight:1.15,margin:'10px 0 12px'}}>A friend invited you to BAK MX</h1>
  <p style={{color:'#bcc3cd',fontSize:17,lineHeight:1.5,margin:'0 0 24px'}}>Specs, setup and straight answers for your exact dirt bike. Add your bike once and ask anything about it.</p>
  {valid?<div style={{border:'1px solid #2a2f38',borderRadius:16,background:'#121418',padding:20,display:'grid',gap:12,textAlign:'center'}}>
   <div style={{color:'#9aa2ae',fontSize:14}}>Your friend’s code</div>
   <div style={{fontSize:34,fontWeight:800,letterSpacing:3,userSelect:'all'}}>{code}</div>
   <button type="button" style={quiet} onClick={()=>{void navigator.clipboard?.writeText(code).then(()=>setCopied(true)).catch(()=>{});}}>{copied?'Copied':'Copy the code'}</button>
   <div style={{color:'#bcc3cd',fontSize:15,lineHeight:1.5}}>Enter it on the first screen after you sign up. Your friend gets {INVITE.joinQuestions} free questions once your bike is in.</div>
  </div>:<div style={{border:'1px solid #2a2f38',borderRadius:16,background:'#121418',padding:20,color:'#bcc3cd'}}>This invite link is missing its code. Ask your friend to send it again, or just get the app below.</div>}
  <div style={{display:'grid',gap:10,marginTop:20}}>
   <a style={btn} href={APP_STORE}>Get BAK MX for iPhone</a>
   <a style={quiet} href="/">Use BAK MX on the web</a>
  </div>
  <p style={{color:'#8b93a0',fontSize:13,marginTop:16}}>On Android? The app is on its way to Google Play. Until then, bakmx.com works in your phone’s browser.</p>
 </main></div>;
}
