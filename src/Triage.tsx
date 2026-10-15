import {useState} from 'react';
import {ArrowLeft,ArrowRight,PenLine,X} from 'lucide-react';
import {complaintGroups,complaintLabel,deciderAnswers,throttleAnswers,whereAnswers,trackAnswers,triageSteps,composeTriage,type TriageAnswers} from '../shared/triage';

type Step='complaint'|'decider'|'throttle'|'where'|'track'|'review';
/** Step-by-step handling-problem intake for Ask BAK. Every step has its own "type it" escape; the result lands in the
 *  composer so the rider can edit it before sending. */
export function Triage({onDone,onCancel}:{onDone:(text:string)=>void;onCancel:()=>void}){
 const [a,setA]=useState<TriageAnswers>({complaint:'',where:[],track:[]}),[step,setStep]=useState<Step>('complaint'),[typing,setTyping]=useState(false),[draft,setDraft]=useState('');
 const steps=():Step[]=>{const s=a.complaint&&a.complaint!=='other'?triageSteps(a.complaint):{decider:null,throttle:true};return ['complaint',...(s.decider?['decider' as Step]:[]),...(s.throttle?['throttle' as Step]:[]),'where','track','review'];};
 const order=steps(),i=order.indexOf(step);
 const go=(d:number)=>{setTyping(false);setDraft('');setStep(order[Math.max(0,Math.min(order.length-1,i+d))])};
 const pick=(patch:Partial<TriageAnswers>,next?:Step[])=>{const na={...a,...patch};setA(na);setTyping(false);setDraft('');
  const ord=next??order;setStep(ord[Math.min(ord.length-1,ord.indexOf(step)+1)]);};
 const toggle=(k:'where'|'track',v:string)=>setA({...a,[k]:a[k].includes(v)?a[k].filter(x=>x!==v):[...a[k],v]});
 const own=(label:string,onSave:(t:string)=>void)=>typing?<div className="triage-own"><input autoFocus value={draft} onChange={e=>setDraft(e.target.value)} placeholder={label} maxLength={200} onKeyDown={e=>{if(e.key==='Enter'&&draft.trim())onSave(draft.trim())}}/><button className="button" disabled={!draft.trim()} onClick={()=>onSave(draft.trim())}>Next</button></div>
  :<button className="triage-chip own" onClick={()=>setTyping(true)}><PenLine size={14}/>Type it myself</button>;
 const question=step==='complaint'?'What is the bike doing?':step==='decider'?triageSteps(a.complaint).decider:step==='throttle'?'On the gas or off the gas?':step==='where'?'Where on the track?':step==='track'?'What’s the dirt like?':'Here’s what BAK will get';
 return <section className="triage" aria-label="Describe a handling problem">
  <header className="triage-head">
   <div className="triage-progress" aria-hidden="true">{order.map((s,k)=><i key={s} className={k<=i?'on':''}/>)}</div>
   <button className="icon-button" onClick={onCancel} aria-label="Close guided questions"><X size={18}/></button>
  </header>
  <h3>{question}</h3>
  {step==='complaint'&&<>{complaintGroups.map(g=><div key={g.label} className="triage-group"><span className="eyebrow">{g.label.toUpperCase()}</span><div className="triage-chips">{g.ids.map(id=><button key={id} className={'triage-chip'+(a.complaint===id?' on':'')} onClick={()=>{const na={...a,complaint:id,complaintText:undefined,decider:undefined,throttle:undefined};setA(na);const s=triageSteps(id);setStep(s.decider?'decider':s.throttle?'throttle':'where');}}>{complaintLabel(id)}</button>)}</div></div>)}
   <div className="triage-group"><span className="eyebrow">NOT LISTED?</span>{own('Describe it in your words, e.g. “front end feels vague in sand”',t=>{setA({...a,complaint:'other',complaintText:t,decider:undefined});setStep('throttle')})}</div></>}
  {step==='decider'&&<div className="triage-chips column">{(deciderAnswers[a.complaint]??[]).map(o=><button key={o} className={'triage-chip'+(a.decider===o?' on':'')} onClick={()=>pick({decider:o})}>{o}</button>)}<button className="triage-chip quiet" onClick={()=>pick({decider:'Not sure'})}>Not sure</button>{own('Tell it your way',t=>pick({decider:t}))}</div>}
  {step==='throttle'&&<div className="triage-chips">{throttleAnswers.map(o=><button key={o} className={'triage-chip'+(a.throttle===o?' on':'')} onClick={()=>pick({throttle:o})}>{o}</button>)}<button className="triage-chip quiet" onClick={()=>pick({throttle:undefined})}>Not sure</button>{own('Tell it your way',t=>pick({throttle:t}))}</div>}
  {(step==='where'||step==='track')&&<>
   <p className="subtle">{step==='where'?'Pick all that apply.':'Optional. Pick all that apply.'}</p>
   <div className="triage-chips">{(step==='where'?whereAnswers:trackAnswers).map(o=><button key={o} aria-pressed={a[step].includes(o)} className={'triage-chip'+(a[step].includes(o)?' on':'')} onClick={()=>toggle(step,o)}>{o}</button>)}
    {a[step].filter(v=>!(step==='where'?whereAnswers:trackAnswers).includes(v)).map(v=><button key={v} className="triage-chip on" onClick={()=>toggle(step,v)}>{v}</button>)}
    {own(step==='where'?'Somewhere else, e.g. “off-camber downhill”':'Something else, e.g. “wet clay”',t=>{toggle(step,t);setTyping(false);setDraft('')})}</div>
   <div className="triage-nav"><button className="button secondary" onClick={()=>go(-1)}><ArrowLeft size={15}/>Back</button><button className="button" onClick={()=>go(1)}>{a[step].length||step==='track'?'Next':'Skip'}<ArrowRight size={15}/></button></div></>}
  {step==='review'&&<>
   <blockquote className="triage-preview">{composeTriage(a)}</blockquote>
   <label className="field"><span>Anything else? (optional)</span><textarea rows={2} value={a.notes??''} maxLength={400} onChange={e=>setA({...a,notes:e.target.value})} placeholder="What you’ve already tried, recent changes, how it felt before"/></label>
   <div className="triage-nav"><button className="button secondary" onClick={()=>go(-1)}><ArrowLeft size={15}/>Back</button><button className="button" onClick={()=>onDone(composeTriage(a))}>Use this<ArrowRight size={15}/></button></div></>}
  {step!=='complaint'&&step!=='review'&&step!=='where'&&step!=='track'&&<div className="triage-nav"><button className="button secondary" onClick={()=>go(-1)}><ArrowLeft size={15}/>Back</button></div>}
 </section>;
}
