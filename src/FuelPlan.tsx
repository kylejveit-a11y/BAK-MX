// Fuel plan on the website, inside race mode: what to eat and drink and when, for the rider (or a rider on this account,
// like a parent's child) on race day and practice day, anchored to the next gate drop. The profile (weight, height, age)
// is saved to the account; today's gate times and toggles are kept on this browser. The rules are in shared/fuel-plan.ts;
// apps/mobile/src/FuelPlan.tsx is the phone's version.
import {useEffect,useMemo,useState} from 'react';
import {AlertTriangle,Droplet,Utensils} from 'lucide-react';
import {buildFuelPlan,draftBody,draftFrom,EVIDENCE_TEXT,MOTO_LENGTHS,nextGate,nextUpLine,offsetText,profileName,readFuelDay,riderOf,SAFETY_TITLE,SCREEN_ITEMS,shiftGate,sourceText,splitByNow,sweatRateText,sweatTest,untilText,withSweatRate,clockLabel,gatesOf,isYouth,type DayInput,type FuelDay,type FuelPlan,type FuelProfileRow,type PlanItem,type ProfileDraft} from '../shared/fuel-plan';
import {today,type RaceDay} from '../shared/race-day';
import {api} from './client';
import {BlockHead,Chip,Disclosure,Sheet,Switch,errorText,readLocal,writeLocal} from './HomeBlocks';
import './fuel-plan.css';

const nowClock=()=>{const d=new Date();return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;};
const newId=()=>crypto.randomUUID();
const listeners=new Set<()=>void>();
const changed=()=>{for(const l of listeners)l();};

/** The account's fuel profiles, cached on this browser so the card shows at a track with weak signal. */
export function useFuelProfiles(account:string){
 const [rows,setRows]=useState<FuelProfileRow[]>(()=>readLocal<FuelProfileRow[]>(account,'fuel-profiles',[]));
 const [error,setError]=useState('');
 const load=()=>api<FuelProfileRow[]>('/fuel-profiles').then(r=>{setRows(r);writeLocal(account,'fuel-profiles',r);setError('');}).catch(e=>setError(errorText(e)));
 useEffect(()=>{void load();const l=()=>setRows(readLocal<FuelProfileRow[]>(account,'fuel-profiles',[]));listeners.add(l);return()=>{listeners.delete(l);};},[account]);
 const put=async(body:Record<string,unknown>)=>{const saved=await api<FuelProfileRow>('/fuel-profiles','PUT',body);const next=[...rows.filter(r=>r.id!==saved.id),saved];setRows(next);writeLocal(account,'fuel-profiles',next);changed();return saved;};
 const remove=async(id:string)=>{await api('/fuel-profiles?id='+id,'DELETE');const next=rows.filter(r=>r.id!==id);setRows(next);writeLocal(account,'fuel-profiles',next);changed();};
 return {rows,error,put,remove,reload:load};
}

function useNow(){const [now,setNow]=useState(nowClock);useEffect(()=>{const t=setInterval(()=>setNow(nowClock()),30000);return()=>clearInterval(t);},[]);return now;}

function Item({item,plan,gates,past}:{item:PlanItem;plan:FuelPlan;gates:{label:string;at:string}[];past?:boolean}){
 const off=offsetText(item,gates);
 return <li className={'fp-item'+(past?' past':'')+(item.optional?' optional':'')}>
  <div className="fp-when"><strong>{item.at?clockLabel(item.at):''}</strong>{off&&<small>{off}</small>}</div>
  <div className="fp-body">
   <p className="fp-title">{item.title}{item.optional&&<span className="fp-tag">optional</span>}</p>
   {item.eat&&<p className="fp-line"><Utensils size={14} aria-hidden="true"/>{item.eat.foods.join(' · ')}</p>}
   {item.drink&&<p className="fp-line"><Droplet size={14} aria-hidden="true"/>{item.drink.what}: <b>{item.drink.text}</b>{item.drink.only_if?` · ${item.drink.only_if}`:''}</p>}
   {item.drink?.ceiling&&<p className="fp-ceiling">{item.drink.ceiling}</p>}
   <p className="fp-why">{item.why}</p>
   {!plan.portionsOnly&&item.eat?.detail&&<Disclosure title="Grams behind this" className="fp-detail">
    <p className="hb-note">{item.eat.detail.basis}. Target {item.eat.detail.carb_g[0]}–{item.eat.detail.carb_g[1]} g carbohydrate{item.eat.detail.foods_carb_g?`; these foods ≈ ${item.eat.detail.foods_carb_g} g`:''}{item.eat.detail.protein_g?`; protein ${item.eat.detail.protein_g[0]}–${item.eat.detail.protein_g[1]} g`:''}.</p>
    {item.eat.detail.per_food.length>0&&<p className="hb-note">{item.eat.detail.per_food.map(f=>`${f.food} ≈ ${f.carb_g} g`).join(' · ')} (approximate)</p>}
   </Disclosure>}
   <p className="fp-evidence"><span className={'fp-badge '+(item.evidence==='evidence-based'?'ev':'xp')}>{EVIDENCE_TEXT[item.evidence]}</span><span>{sourceText(item.sources)}</span></p>
  </div>
 </li>;
}

/** Always shown on race day and practice day, even when the plan is blocked. */
export function HeatRedFlags({plan}:{plan:FuelPlan}){
 const s=plan.safety;
 return <div className="fp-safety" role="note">
  <p className="fp-safety-head"><AlertTriangle size={16} aria-hidden="true"/>{SAFETY_TITLE}</p>
  <p className="fp-flags">{s.stop.join(' · ')}</p>
  <p className="fp-safety-911"><b>Call 911:</b> {s.call911.join(' · ')}. Cool first, transport second.</p>
  <p className="fp-safety-911">{s.lowSodium}</p>
  <p className="hb-note">{s.note} ({sourceText(s.sources)})</p>
 </div>;
}

/** Race day and practice day: the fuel plan card. */
export function FuelPlanCard({account,race,kind}:{account:string;race:RaceDay;kind:'race'|'practice'}){
 const {rows,error}=useFuelProfiles(account);
 const now=useNow(),day=today();
 const key=`fuel-day:${kind}`;
 const [saved,setSaved]=useState<FuelDay>(()=>readFuelDay(readLocal(account,key,null),day,kind,race.next?.at||null));
 const [setup,setSetup]=useState(false),[sweat,setSweat]=useState(false),[shift,setShift]=useState<number|null>(null),[showPast,setShowPast]=useState(false),[notice,setNotice]=useState('');
 useEffect(()=>{setSaved(readFuelDay(readLocal(account,key,null),day,kind,race.next?.at||null));},[account,key,day]);
 const save=(next:FuelDay)=>{setSaved(next);if(!writeLocal(account,key,next))setNotice('This browser could not save today’s times. They stay until you leave the page.');};
 const setInput=(p:Partial<DayInput>)=>save({...saved,input:{...saved.input,...p}});
 const row=rows.find(r=>r.id===saved.profileId)??rows.find(r=>r.kind==='self')??rows[0]??null;
 const plan=useMemo(()=>row?buildFuelPlan(riderOf(row),{...saved.input,motoMinutes:saved.input.motoMinutes??row.moto_minutes??20}):null,[row,saved]);
 const gates=gatesOf(saved.input),next=nextGate(saved.input,now);
 const youth=row?isYouth(row.age):false;
 const word=kind==='practice'?'Session':'Moto';

 if(!row)return <section className="panel hb-block fp-card">
  <BlockHead title="FUEL PLAN"/>
  <p className="hb-strong">What to eat and drink, and when</p>
  <p className="hb-copy">Worried food will make you feel bad on the bike? Enter weight, height and age once and BAK lays out the day before, race morning, between motos and after, timed to your gate drops. Parents can set one up for a child rider.</p>
  {error&&<p className="hb-error" role="alert">{error}</p>}
  <button type="button" className="button" onClick={()=>setSetup(true)}>Set up the fuel plan</button>
  {setup&&<FuelProfileSheet account={account} onClose={()=>setSetup(false)} onSaved={id=>save({...saved,profileId:id})}/>}
 </section>;

 return <section className="panel hb-block fp-card">
  <BlockHead title={`FUEL PLAN · ${profileName(row).toUpperCase()}${youth?' · PARENT VIEW':''}`} action="Rider" onAction={()=>setSetup(true)}/>
  {rows.length>1&&<div className="hb-chips" role="radiogroup" aria-label="Whose plan">{rows.map(r=><Chip key={r.id} role="radio" on={r.id===row.id} onClick={()=>save({...saved,profileId:r.id})}>{profileName(r)}</Chip>)}</div>}
  {plan&&<p className="hb-strong" aria-live="polite">{next?`Next gate: ${next.label} ${untilText(next.minutes)}`:gates.length?'All gates done today':'Add your gate times'} · <span className="fp-next">{nextUpLine(plan,now)}</span></p>}

  <div className="fp-gates">
   {saved.input.gates.map((g,i)=><div key={i} className="fp-gate">
    <input className="hb-input" value={g.label} maxLength={30} aria-label={`${word} ${i+1} name`} onChange={e=>{const gs=[...saved.input.gates];gs[i]={...g,label:e.target.value};setInput({gates:gs});}}/>
    <input className="hb-input" type="time" value={g.at} aria-label={`${g.label||word+' '+(i+1)} gate time`} onChange={e=>{const gs=[...saved.input.gates];gs[i]={...g,at:e.target.value};setInput({gates:gs});}}/>
    {g.at&&<button type="button" className="hb-link" onClick={()=>{const one=gatesOf({kind,gates:[g]})[0];setShift(gates.findIndex(x=>x.at===one?.at&&x.label===one?.label));}}>Moved?</button>}
    <button type="button" className="hb-link muted" aria-label={`Remove ${g.label}`} onClick={()=>setInput({gates:saved.input.gates.filter((_,j)=>j!==i)})}>Remove</button>
   </div>)}
   <button type="button" className="hb-link" onClick={()=>setInput({gates:[...saved.input.gates,{label:`${word} ${saved.input.gates.length+1}`,at:''}]})}>+ Add {word.toLowerCase()} time</button>
  </div>
  <p className="hb-field-label">{word} length</p>
  <div className="hb-chips">{MOTO_LENGTHS.map(m=><Chip key={m} on={(saved.input.motoMinutes??20)===m} onClick={()=>setInput({motoMinutes:m})}>{`${m} min`}</Chip>)}</div>
  <div className="fp-toggles">
   <label className="fp-toggle"><Switch on={!!saved.input.hot} onChange={v=>setInput({hot:v})} label="Hot or humid today"/>Hot or humid today</label>
   <label className="fp-toggle"><Switch on={saved.input.nervous??!!row.nervous_stomach} onChange={v=>setInput({nervous:v})} label="Nervous stomach"/>Nervous stomach</label>
   {!youth&&row.caffeine&&<label className="fp-toggle"><Switch on={saved.input.caffeine??true} onChange={v=>setInput({caffeine:v})} label="Caffeine today"/>Caffeine today</label>}
  </div>
  {notice&&<p className="hb-error" role="alert">{notice}</p>}

  {plan&&<FuelPlanBody plan={plan} gates={gates} now={now} showPast={showPast} onShowPast={()=>setShowPast(!showPast)} onSweat={()=>setSweat(true)} row={row}/>}
  {setup&&<FuelProfileSheet account={account} current={row} onClose={()=>setSetup(false)} onSaved={id=>save({...saved,profileId:id})}/>}
  {sweat&&<SweatTestSheet account={account} row={row} onClose={()=>setSweat(false)}/>}
  {shift!=null&&shift>=0&&<GateShiftSheet input={saved.input} index={shift} now={now} youth={youth} mealAt={plan?.items.find(i=>i.id==='meal')?.at??null} onClose={()=>setShift(null)} onApply={(input,notes)=>{setInput(input);setNotice(notes.join(' '));setShift(null);}}/>}
 </section>;
}

function FuelPlanBody({plan,gates,now,showPast,onShowPast,onSweat,row}:{plan:FuelPlan;gates:{label:string;at:string}[];now:string;showPast:boolean;onShowPast:()=>void;onSweat:()=>void;row:FuelProfileRow}){
 const {ahead,past}=splitByNow(plan.items,now);
 return <>
  {plan.blocked&&<p className="hb-error" role="alert">{plan.blocked.reason}</p>}
  {plan.problems.map(p=><p key={p} className="hb-note">{p}</p>)}
  {!plan.blocked&&<>
   {past.length>0&&<button type="button" className="hb-link muted" onClick={onShowPast}>{showPast?'Hide':'Show'} {past.length} earlier</button>}
   <ol className="fp-list">{showPast&&past.map(i=><Item key={i.id} item={i} plan={plan} gates={gates} past/>)}{ahead.map(i=><Item key={i.id} item={i} plan={plan} gates={gates}/>)}</ol>
   <p className="fp-ceiling strong">{plan.ceiling.text}</p>
   <div className="fp-sweat">
    {plan.sweat.rate_lph?<p className="hb-note ok">Sweat test: {sweatRateText(plan.sweat.rate_lph,row.moto_minutes??20,plan.youth)}{row.sweat_test_at?` · ${new Date(row.sweat_test_at).toLocaleDateString('en-US',{month:'short',day:'numeric'})}`:''}</p>:<p className="hb-note">{plan.sweat.prompt}</p>}
    <button type="button" className="hb-link" onClick={onSweat}>{plan.sweat.rate_lph?'Redo the sweat test':'Do the sweat test'}</button>
   </div>
   {plan.notes.map(n=><p key={n} className="hb-copy small">{n}</p>)}
   {plan.dayBefore.length>0&&<Disclosure title="The day before" className="fp-daybefore"><ol className="fp-list">{plan.dayBefore.map(i=><Item key={i.id} item={i} plan={plan} gates={gates}/>)}</ol></Disclosure>}
  </>}
  <HeatRedFlags plan={plan}/>
  <p className="hb-note">{plan.disclaimer}</p>
 </>;
}

// ------------------------------------------------------------------ the rider profile
export function FuelProfileSheet({account,current,onClose,onSaved}:{account:string;current?:FuelProfileRow|null;onClose:()=>void;onSaved:(id:string)=>void}){
 const {rows,put,remove}=useFuelProfiles(account);
 const hasSelf=rows.some(r=>r.kind==='self');
 const start=(row:FuelProfileRow|null)=>draftFrom(row,{id:row?.id??newId(),kind:row?.kind??(hasSelf?'rider':'self')});
 const [d,setD]=useState<ProfileDraft>(()=>start(current??null));
 const [busy,setBusy]=useState(false),[problem,setProblem]=useState('');
 const set=(p:Partial<ProfileDraft>)=>setD(x=>({...x,...p}));
 const row=rows.find(r=>r.id===d.id)??null;
 const age=Number(d.age),adult=Number.isFinite(age)&&age>=18;
 const screened=d.screen.filter(s=>s!=='ill_now').length>0;
 async function submit(){
  const b=draftBody(d,row);if('problem' in b){setProblem(b.problem);return;}
  setBusy(true);setProblem('');
  try{const saved=await put(b.body);onSaved(saved.id);onClose();}catch(e){setProblem(errorText(e));}finally{setBusy(false);}
 }
 async function del(){if(!row||!confirm(`Remove ${profileName(row)}’s fuel profile?`))return;setBusy(true);try{await remove(row.id);onClose();}catch(e){setProblem(errorText(e));}finally{setBusy(false);}}
 return <Sheet title="Fuel plan rider" onClose={onClose}>
  <div className="hb-stack fp-form">
   {rows.length>0&&<div className="hb-chips">{rows.map(r=><Chip key={r.id} on={r.id===d.id} onClick={()=>setD(start(r))}>{profileName(r)}</Chip>)}<Chip on={!row} onClick={()=>setD(start(null))}>+ New rider</Chip></div>}
   {!row&&<div className="hb-chips" role="radiogroup" aria-label="Who is this for">
    <Chip role="radio" on={d.kind==='self'} disabled={hasSelf} onClick={()=>set({kind:'self'})}>Me</Chip>
    <Chip role="radio" on={d.kind==='rider'} onClick={()=>set({kind:'rider'})}>Another rider (like my kid)</Chip>
   </div>}
   {d.kind==='rider'&&<label className="hb-field"><span className="hb-field-label">Name</span><input className="hb-input" value={d.name} maxLength={40} onChange={e=>set({name:e.target.value})} placeholder="First name or number"/></label>}
   <div className="hb-chips" role="radiogroup" aria-label="Units"><Chip role="radio" on={d.unit==='lb'} onClick={()=>set({unit:'lb'})}>lb · ft/in</Chip><Chip role="radio" on={d.unit==='kg'} onClick={()=>set({unit:'kg'})}>kg · cm</Chip></div>
   <div className="fp-row">
    <label className="hb-field"><span className="hb-field-label">Weight ({d.unit})</span><input className="hb-input" inputMode="decimal" value={d.weight} onChange={e=>set({weight:e.target.value})}/></label>
    <label className="hb-field"><span className="hb-field-label">Age</span><input className="hb-input" inputMode="numeric" value={d.age} onChange={e=>set({age:e.target.value})}/></label>
   </div>
   {d.unit==='lb'?<div className="fp-row">
    <label className="hb-field"><span className="hb-field-label">Height (ft)</span><input className="hb-input" inputMode="numeric" value={d.ft} onChange={e=>set({ft:e.target.value})}/></label>
    <label className="hb-field"><span className="hb-field-label">(in)</span><input className="hb-input" inputMode="numeric" value={d.inch} onChange={e=>set({inch:e.target.value})}/></label>
   </div>:<label className="hb-field"><span className="hb-field-label">Height (cm)</span><input className="hb-input" inputMode="decimal" value={d.cm} onChange={e=>set({cm:e.target.value})}/></label>}
   <p className="hb-note">Weight only scales portions and the sweat test. It never shows on the plan, and BAK never sets a weight goal. Height is just stored.</p>
   <p className="hb-field-label">Sex (optional)</p>
   <div className="hb-chips"><Chip on={d.sex===''} onClick={()=>set({sex:''})}>Skip</Chip><Chip on={d.sex==='female'} onClick={()=>set({sex:'female'})}>Female</Chip><Chip on={d.sex==='male'} onClick={()=>set({sex:'male'})}>Male</Chip></div>
   <label className="fp-toggle"><Switch on={d.nervous} onChange={v=>set({nervous:v})} label="Nervous stomach on race day"/>Nervous stomach on race day</label>
   {adult&&<label className="fp-toggle"><Switch on={d.caffeine} onChange={v=>set({caffeine:v})} label="I already use caffeine and want it in the plan"/>I already use caffeine and want it in the plan</label>}
   {!adult&&d.age.trim()!==''&&<p className="hb-note">Under 18: the plan is a parent view in portions and cups, water first, no caffeine or energy drinks.</p>}
   <p className="hb-field-label">Before using the plan, does any of this apply?</p>
   <div className="fp-screen">{SCREEN_ITEMS.map(s=><label key={s.id} className="fp-check"><input type="checkbox" checked={d.screen.includes(s.id)} onChange={e=>set({screen:e.target.checked?[...d.screen,s.id]:d.screen.filter(x=>x!==s.id)})}/>{s.label}</label>)}</div>
   {screened&&<><p className="hb-note">Talk to your doctor or a registered dietitian first: your needs can differ from this general plan.</p>
    <label className="fp-toggle"><Switch on={d.cleared} onChange={v=>set({cleared:v})} label="My doctor or dietitian cleared me"/>My doctor or dietitian cleared me</label></>}
   {problem&&<p className="hb-error" role="alert">{problem}</p>}
   <button type="button" className="button" disabled={busy} onClick={()=>void submit()}>{busy?'Saving…':'Save to my account'}</button>
   {row&&<button type="button" className="hb-link muted hb-center" disabled={busy} onClick={()=>void del()}>Remove this rider</button>}
  </div>
 </Sheet>;
}

// ------------------------------------------------------------------ sweat test
export function SweatTestSheet({account,row,onClose}:{account:string;row:FuelProfileRow;onClose:()=>void}){
 const {put}=useFuelProfiles(account);
 const youth=isYouth(row.age);
 const [unit,setUnit]=useState<'kg'|'lb'>(row.weight_unit),[pre,setPre]=useState(''),[post,setPost]=useState(''),[minutes,setMinutes]=useState('30'),[drank,setDrank]=useState(''),[urine,setUrine]=useState(''),[hot,setHot]=useState(false);
 const [busy,setBusy]=useState(false),[problem,setProblem]=useState(''),[done,setDone]=useState(false);
 const fl=unit==='lb'?'oz':'mL',toMl=(v:string)=>(Number(v)||0)*(unit==='lb'?29.5735:1);
 const result=pre&&post&&minutes?sweatTest({pre:Number(pre),post:Number(post),unit,minutes:Number(minutes),drankMl:toMl(drank),urineMl:toMl(urine)},{youth}):null;
 async function keep(){if(!result?.ok)return;setBusy(true);setProblem('');try{await put(withSweatRate(row,result.rate_lph,hot,new Date().toISOString()));setDone(true);}catch(e){setProblem(errorText(e));}finally{setBusy(false);}}
 return <Sheet title="Sweat test" onClose={onClose}>
  <div className="hb-stack fp-form">
   <p className="hb-copy">On a practice day: weigh {youth?'the rider':'yourself'} in minimal clothing right before riding, ride, dry off, and weigh again on the same scale before drinking or peeing. Note what was drunk while riding.</p>
   <div className="hb-chips"><Chip role="radio" on={unit==='lb'} onClick={()=>setUnit('lb')}>lb · oz</Chip><Chip role="radio" on={unit==='kg'} onClick={()=>setUnit('kg')}>kg · mL</Chip></div>
   <div className="fp-row">
    <label className="hb-field"><span className="hb-field-label">Before ({unit})</span><input className="hb-input" inputMode="decimal" value={pre} onChange={e=>setPre(e.target.value)}/></label>
    <label className="hb-field"><span className="hb-field-label">After ({unit})</span><input className="hb-input" inputMode="decimal" value={post} onChange={e=>setPost(e.target.value)}/></label>
   </div>
   <div className="fp-row">
    <label className="hb-field"><span className="hb-field-label">Minutes riding</span><input className="hb-input" inputMode="numeric" value={minutes} onChange={e=>setMinutes(e.target.value)}/></label>
    <label className="hb-field"><span className="hb-field-label">Drank ({fl})</span><input className="hb-input" inputMode="decimal" value={drank} onChange={e=>setDrank(e.target.value)}/></label>
    <label className="hb-field"><span className="hb-field-label">Peed ({fl}, if any)</span><input className="hb-input" inputMode="decimal" value={urine} onChange={e=>setUrine(e.target.value)}/></label>
   </div>
   <label className="fp-toggle"><Switch on={hot} onChange={setHot} label="It was hot or humid"/>It was hot or humid</label>
   <p className="hb-note">Weights stay on this screen; only the sweat rate is saved.</p>
   {result&&!result.ok&&<p className="hb-error" role="alert">{result.problem}</p>}
   {result?.ok&&<div className="fp-result">
    <p className="hb-strong">{sweatRateText(result.rate_lph,row.moto_minutes??20,youth)}</p>
    <p className="hb-copy">{result.replaceText}</p>
    {result.flags.map(f=><p key={f} className="hb-note">{f}</p>)}
   </div>}
   {problem&&<p className="hb-error" role="alert">{problem}</p>}
   {done?<p className="hb-note ok" role="status">Saved. The plan now uses this sweat rate.</p>
    :<button type="button" className="button" disabled={busy||!result?.ok} onClick={()=>void keep()}>{busy?'Saving…':'Save sweat rate'}</button>}
  </div>
 </Sheet>;
}

// ------------------------------------------------------------------ the gate moved
function GateShiftSheet({input,index,now,youth,mealAt,onClose,onApply}:{input:DayInput;index:number;now:string;youth:boolean;mealAt:string|null;onClose:()=>void;onApply:(input:DayInput,notes:string[])=>void}){
 const g=gatesOf(input)[index];
 const [at,setAt]=useState(g?.at??''),[ate,setAte]=useState(mealAt&&mealAt<=now?mealAt:''),[cascade,setCascade]=useState(true);
 if(!g)return null;
 const apply=()=>{const r=shiftGate({...input,gates:gatesOf(input)},index,at,{now,lastAteAt:ate||null,cascade,youth});onApply(r.day,[...r.notes,...r.added.map(a=>a.title)]);};
 return <Sheet title={`${g.label} moved`} onClose={onClose}>
  <div className="hb-stack fp-form">
   <label className="hb-field"><span className="hb-field-label">New gate time</span><input className="hb-input" type="time" value={at} onChange={e=>setAt(e.target.value)}/></label>
   <label className="hb-field"><span className="hb-field-label">Last ate at (optional)</span><input className="hb-input" type="time" value={ate} onChange={e=>setAte(e.target.value)}/></label>
   <label className="fp-toggle"><Switch on={cascade} onChange={setCascade} label="Move the later gates by the same amount"/>Move the later gates by the same amount</label>
   <p className="hb-note">Delayed an hour or more adds a small top-up; moved up soon after eating means sips only; four hours or more away adds a full meal.</p>
   <button type="button" className="button" disabled={!at} onClick={apply}>Update the plan</button>
  </div>
 </Sheet>;
}
