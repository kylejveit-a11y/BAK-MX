import {useCallback,useEffect,useRef,useState} from 'react';
import {ChevronLeft,ChevronRight,Mic,MicOff,RotateCcw,Volume2,X,Wrench} from 'lucide-react';
import type {Bike} from '../shared/types';
import {buildIdentity} from '../shared/bike-identity';
import {procedureCatalog} from '../shared/procedure-catalog';
import {createProcedureRun,validateProcedureRun,recordProcedureStep,followProcedureBranch,procedureStepRecorded,type ProcedureRun,type ReviewedProcedure} from '../shared/procedures';
import {parseGuidedInput,stepSpeech,guidedHelp,riderText,type GuidedCommand} from '../shared/guided-job';

/** Same key as the Workshop guide panel, so a job started in either place continues in the other. */
export function procedureRunKey(bike:Bike,p:ReviewedProcedure){return `bakmx:procedure:v1:${bike.user_id}:${bike.id}:${buildIdentity(bike)}:${p.id}:${p.source.document_sha256}:${p.content_sha256}`;}
const activeKey=(bike:Bike)=>`bakmx:guided-active:v1:${bike.user_id}:${bike.id}`;
const read=(k:string)=>{try{return localStorage.getItem(k)}catch{return null}};
const write=(k:string,v:string|null)=>{try{if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v);return true}catch{return false}};

function loadRun(bike:Bike,p:ReviewedProcedure){
 const raw=read(procedureRunKey(bike,p));if(!raw)return null;
 try{const parsed=JSON.parse(raw);return validateProcedureRun(parsed.run,bike,p);}catch{return null}
}

export type GuidedJob=ReturnType<typeof useGuidedJob>;
export function useGuidedJob(bike?:Bike){
 const {available,groups}=bike?procedureCatalog(bike):{available:[] as ReviewedProcedure[],groups:[] as {id:string;title:string;procedures:ReviewedProcedure[]}[]};
 const [procedureId,setProcedureId]=useState(()=>bike?read(activeKey(bike))??'':'');
 const procedure=available.find(p=>p.id===procedureId)??null;
 const [run,setRun]=useState<ProcedureRun|null>(()=>bike&&procedure?loadRun(bike,procedure):null);
 const [notice,setNotice]=useState('');
 useEffect(()=>{if(!bike)return;const id=read(activeKey(bike))??'';setProcedureId(id);const p=available.find(x=>x.id===id);setRun(p?loadRun(bike,p):null);setNotice('');},[bike?.id]);
 const save=useCallback((next:ProcedureRun)=>{if(!bike||!procedure)return false;const ok=write(procedureRunKey(bike,procedure),JSON.stringify({run:next,notes:''}));if(ok){setRun(next);setNotice('')}else setNotice('Progress could not be saved on this browser. Your step has not moved.');return ok;},[bike,procedure]);
 function start(id:string){
  if(!bike)return '';const p=available.find(x=>x.id===id);if(!p)return '';
  write(activeKey(bike),id);setProcedureId(id);
  const existing=loadRun(bike,p);
  if(existing){setRun(existing);return `Picking up ${p.title}. ${stepSpeech(p,existing.step_index)}`;}
  const fresh=createProcedureRun(bike,p,true);
  if(!write(procedureRunKey(bike,p),JSON.stringify({run:fresh,notes:''}))){setNotice('Progress could not be saved on this browser.');}
  setRun(fresh);
  return `Starting ${p.title}. ${p.steps.length} steps. ${stepSpeech(p,0)}`;
 }
 function end(){if(bike)write(activeKey(bike),null);setProcedureId('');setRun(null);return 'Job closed. Your progress is saved; start it again any time to pick up where you left off.';}
 const finished=!!run&&!!procedure&&procedure.steps.every(s=>procedureStepRecorded(run,s.id));
 const step=run&&procedure?procedure.steps[run.step_index]:null;
 /** Runs a command and returns what BAK says back. Questions are not handled here. */
 function handle(cmd:GuidedCommand,pendingRecord=''):string{
  if(!procedure||!run||!step)return '';
  try{
   if(cmd.kind==='repeat')return stepSpeech(procedure,run.step_index);
   if(cmd.kind==='where')return finished?`All ${procedure.steps.length} steps are recorded for ${procedure.title}.`:`You're on step ${run.step_index+1} of ${procedure.steps.length}: ${riderText(step.title)}.`;
   if(cmd.kind==='end')return end();
   if(cmd.kind==='record'){
    const next=recordProcedureStep(run,procedure,`${step.verification.join(' ')}\nRecorded: ${cmd.text}`);
    if(!save(next))return 'That could not be saved. Try again.';
    return `Recorded ${cmd.text}. ${next.step_index===run.step_index?'That was the last step.':stepSpeech(procedure,next.step_index)}`;
   }
   if(cmd.kind==='next'){
    if(step.branches?.length)return 'This step has more than one way forward. Pick the option that matches what you found on the screen.';
    if(step.record_required&&!pendingRecord)return 'This step needs a measurement first. Say "record" and the number, for example "record point one two".';
    const already=procedureStepRecorded(run,step.id)&&run.step_index===procedure.steps.length-1;
    if(already)return `That's the last step. ${procedure.title} is fully recorded.`;
    const next=recordProcedureStep(run,procedure,step.verification.join(' ')+(pendingRecord?`\nRecorded: ${pendingRecord}`:'')||'Checked');
    if(!save(next))return 'That could not be saved. Try again.';
    if(next.step_index===run.step_index)return `Last step checked. ${procedure.title} is complete. Nice work.`;
    return stepSpeech(procedure,next.step_index);
   }
   if(cmd.kind==='back'){
    let i=run.step_index-1;while(i>=0&&run.bypassed?.[procedure.steps[i].id])i--;
    if(i<0)return 'You are on the first step.';
    const back={...run,step_index:i};
    if(!validateProcedureRun(back,bike!,procedure))return 'That step cannot be reopened from here.';
    if(!save(back))return 'That could not be saved.';
    return stepSpeech(procedure,i);
   }
  }catch(e){return (e as Error).message;}
  return '';
 }
 function branch(id:string,notes:string){
  if(!procedure||!run)return '';
  try{const next=followProcedureBranch(run,procedure,id,notes);if(!save(next))return 'That could not be saved.';return stepSpeech(procedure,next.step_index);}catch(e){return (e as Error).message;}
 }
 const guided=procedure&&run?{procedure_id:procedure.id,step_index:run.step_index}:null;
 return {available,groups,procedure,run,step,finished,notice,start,end,handle,branch,guided};
}

type Recognition={continuous:boolean;interimResults:boolean;lang:string;start():void;stop():void;abort():void;onresult:((e:any)=>void)|null;onend:(()=>void)|null;onerror:((e:any)=>void)|null};
/** Hands-free workshop listening: keeps the screen awake, pauses while BAK talks, restarts when the browser stops it. */
export function useWorkshopVoice(onUtterance:(text:string)=>void){
 const Ctor=typeof window!=='undefined'?((window as any).SpeechRecognition||(window as any).webkitSpeechRecognition):null;
 const supported=!!Ctor&&typeof window!=='undefined'&&'speechSynthesis' in window;
 const [on,setOn]=useState(false),[heard,setHeard]=useState(''),[speaking,setSpeaking]=useState(false),[problem,setProblem]=useState('');
 const rec=useRef<Recognition|null>(null),wanted=useRef(false),talking=useRef(false),lock=useRef<any>(null),cb=useRef(onUtterance);
 cb.current=onUtterance;
 const listen=useCallback(()=>{if(!wanted.current||talking.current||!rec.current)return;try{rec.current.start()}catch{/* already running */}},[]);
 const enable=useCallback(async()=>{
  if(!Ctor){setProblem('Voice needs Chrome, Edge or Safari on this device.');return;}
  if(!rec.current){const r:Recognition=new Ctor();r.continuous=true;r.interimResults=false;r.lang='en-US';
   r.onresult=(e:any)=>{for(let i=e.resultIndex;i<e.results.length;i++)if(e.results[i].isFinal){const t=String(e.results[i][0].transcript||'').trim();if(t){setHeard(t);cb.current(t);}}};
   r.onend=()=>{if(wanted.current&&!talking.current)setTimeout(listen,250)};
   r.onerror=(e:any)=>{if(e?.error==='not-allowed'||e?.error==='service-not-allowed'){wanted.current=false;setOn(false);setProblem('Microphone access was blocked. Allow the microphone for this site to use workshop mode.');}};
   rec.current=r;}
  wanted.current=true;setOn(true);setProblem('');listen();
  try{lock.current=await (navigator as any).wakeLock?.request('screen')}catch{/* screen may sleep */}
 },[Ctor,listen]);
 const disable=useCallback(()=>{wanted.current=false;setOn(false);try{rec.current?.abort()}catch{}try{window.speechSynthesis.cancel()}catch{}talking.current=false;setSpeaking(false);try{lock.current?.release()}catch{}lock.current=null;},[]);
 const speak=useCallback((text:string)=>{
  if(!supported||!text)return;
  try{window.speechSynthesis.cancel();}catch{}
  const u=new SpeechSynthesisUtterance(text);u.rate=1.02;u.lang='en-US';
  talking.current=true;setSpeaking(true);try{rec.current?.abort()}catch{}
  const done=()=>{talking.current=false;setSpeaking(false);setTimeout(listen,300)};
  u.onend=done;u.onerror=done;
  window.speechSynthesis.speak(u);
 },[supported,listen]);
 const hush=useCallback(()=>{try{window.speechSynthesis.cancel()}catch{}talking.current=false;setSpeaking(false);setTimeout(listen,200);},[listen]);
 // The screen lock is released when the tab is hidden; take it back when the rider returns.
 useEffect(()=>{const back=async()=>{if(document.visibilityState==='visible'&&wanted.current){try{lock.current=await (navigator as any).wakeLock?.request('screen')}catch{}listen();}};document.addEventListener('visibilitychange',back);return()=>{document.removeEventListener('visibilitychange',back);};},[listen]);
 useEffect(()=>()=>{wanted.current=false;try{rec.current?.abort()}catch{}try{window.speechSynthesis.cancel()}catch{}},[]);
 return {supported,on,heard,speaking,problem,enable,disable,speak,hush};
}

export function GuidedJobCard({job,voice,onSay,busy}:{job:GuidedJob;voice:ReturnType<typeof useWorkshopVoice>;onSay:(text:string)=>void;busy:boolean}){
 const [picking,setPicking]=useState(false),[record,setRecord]=useState(''),[branchNotes,setBranchNotes]=useState('');
 const {procedure,run,step,finished}=job;
 const say=(text:string)=>{if(text)onSay(text)};
 if(!job.available.length)return null;
 if(!procedure||!run)return <div className="guided-launch">{picking?<div className="guided-pick"><label className="field"><span>Guided job for this bike</span><select defaultValue="" onChange={e=>{if(e.target.value){say(job.start(e.target.value));setPicking(false);}}}><option value="">Choose a job</option>{job.groups.map(g=><optgroup key={g.id} label={g.title}>{g.procedures.map(p=><option key={p.id} value={p.id}>{p.title} · {p.steps.length} steps</option>)}</optgroup>)}</select></label><button type="button" className="chat-action" onClick={()=>setPicking(false)}>Cancel</button></div>:<button type="button" className="triage-launch" onClick={()=>setPicking(true)}><span><b>Working on the bike?</b> Start a guided job and BAK walks you through it one step at a time. Hands-free with workshop mode.</span><Wrench size={16}/></button>}</div>;
 const done=procedure.steps.filter(s=>procedureStepRecorded(run,s.id)).length;
 return <section className="guided-card" aria-label="Guided job">
  <div className="guided-head"><div><span className="eyebrow">{finished?'JOB COMPLETE':`STEP ${run.step_index+1} OF ${procedure.steps.length}`}</span><strong>{procedure.title}</strong></div><button type="button" className="icon-button" aria-label="Close guided job" title="Close guided job (progress is kept)" onClick={()=>say(job.end())}><X size={17}/></button></div>
  <progress aria-label="Steps recorded" value={done} max={procedure.steps.length}/>
  {step&&<><h3>{riderText(step.title)}</h3><p>{riderText(step.instruction)}</p>{step.verification.length>0&&<ul className="guided-checks">{step.verification.map((v,i)=><li key={i}>{riderText(v)}</li>)}</ul>}{step.diagram_reference_required&&step.source_links.some(l=>/^https?:\/\//.test(l))&&<a className="chat-action" href={step.source_links.find(l=>/^https?:\/\//.test(l))} target="_blank" rel="noreferrer">Show the picture for this step</a>}</>}
  {step?.record_required&&!finished&&<form className="guided-record" onSubmit={e=>{e.preventDefault();if(record.trim()){say(job.handle({kind:'record',text:record.trim()}));setRecord('');}}}><input value={record} onChange={e=>setRecord(e.target.value)} maxLength={2000} placeholder="Measurement or finding" aria-label="Record a measurement"/><button className="button secondary" type="submit" disabled={!record.trim()}>Record</button></form>}
  {step?.branches?.length?<div className="guided-branches"><input value={branchNotes} onChange={e=>setBranchNotes(e.target.value)} placeholder="What you measured or found" aria-label="Finding for this choice"/>{step.branches.map(b=><button type="button" key={b.id} className="button secondary" disabled={!branchNotes.trim()} title={b.condition} onClick={()=>{say(job.branch(b.id,branchNotes));setBranchNotes('');}}>{b.label}</button>)}</div>:null}
  {job.notice&&<p className="error" role="alert">{job.notice}</p>}
  <div className="guided-controls">
   <button type="button" className="button secondary" disabled={run.step_index===0} onClick={()=>say(job.handle({kind:'back'}))}><ChevronLeft size={16}/>Back</button>
   <button type="button" className="button secondary" onClick={()=>say(job.handle({kind:'repeat'}))}><RotateCcw size={15}/>Repeat</button>
   <button type="button" className="button" disabled={finished||(!!step?.record_required)||!!step?.branches?.length} onClick={()=>say(job.handle({kind:'next'}))}>Done · next<ChevronRight size={16}/></button>
  </div>
  {voice.supported?<div className={'workshop-mode'+(voice.on?' on':'')}>
   <button type="button" className={voice.on?'button':'button secondary'} onClick={()=>{if(voice.on)voice.disable();else{void voice.enable();if(step)voice.speak(`Workshop mode on. ${guidedHelp} ${stepSpeech(procedure,run.step_index)}`);}}}>{voice.on?<><Mic size={16}/>Workshop mode on</>:<><MicOff size={16}/>Workshop mode</>}</button>
   {voice.on&&<span className="subtle" role="status">{voice.speaking?<><Volume2 size={14}/> Speaking… <button type="button" className="chat-action" onClick={voice.hush}>Quiet</button></>:busy?'Thinking…':voice.heard?`Heard: “${voice.heard}”`:'Listening. Say “next”, “repeat”, or “Hey BAK” and your question.'}</span>}
   {voice.problem&&<span className="error" role="alert">{voice.problem}</span>}
  </div>:<p className="subtle">Hands-free workshop mode needs Chrome, Edge or Safari, or the BAK MX phone app.</p>}
 </section>;
}

export {parseGuidedInput};
