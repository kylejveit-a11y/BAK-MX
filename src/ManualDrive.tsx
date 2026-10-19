import {useEffect,useMemo,useRef,useState} from 'react';
import {ArrowUpRight,CheckCircle2,FileUp,Gift,Search,ShieldCheck,XCircle,Loader2} from 'lucide-react';
import {api,supabase} from './client';

type Buy={seller:string;url:string;price?:string|null;kind?:string};
type Group={key:string;manufacturer:string;model:string;manual_name:string;publication:string|null;years:number[];buy:Buy[]|unknown};
type Wanted={wanted:Group[];counts:{wanted_bike_years:number;received_bike_years:number;have_bike_years:number}};
type Result={id:string;status:string;reason:string|null;pages:number|null;file_name:string;code:string|null;code_redeemed:boolean};
type Mine={contributions:{id:string;file_name:string;status:string;reason:string|null;created_at:string}[];codes:{code:string;redeemed_at:string|null}[];grant:{tier:string;ends_at:string}|null};

const years=(y:number[])=>{const out:string[]=[];let s=y[0],p=y[0];for(const v of y.slice(1)){if(v===p+1){p=v;continue;}out.push(s===p?`${s}`:`${s}–${p}`);s=p=v;}if(y.length)out.push(s===p?`${s}`:`${s}–${p}`);return out.join(', ');};
const safeUrl=(u:string)=>/^https:\/\//.test(u)?u:'';

export function ManualDrive({signedIn,onSignIn}:{signedIn:boolean;onSignIn:()=>void}){
 const [data,setData]=useState<Wanted|null>(null),[error,setError]=useState(''),[query,setQuery]=useState(''),[make,setMake]=useState('');
 const [picked,setPicked]=useState<Group|null>(null),[mine,setMine]=useState<Mine|null>(null);
 const load=()=>fetch('/api/manuals/wanted').then(r=>r.ok?r.json():Promise.reject()).then(setData).catch(()=>setError('The list could not be loaded. Refresh to try again.'));
 const loadMine=()=>{if(signedIn)api<Mine>('/manuals/mine').then(setMine).catch(()=>{});};
 useEffect(()=>{void load();},[]);useEffect(loadMine,[signedIn]);
 const makes=useMemo(()=>[...new Set((data?.wanted??[]).map(g=>g.manufacturer))].sort(),[data]);
 const shown=(data?.wanted??[]).filter(g=>(!make||g.manufacturer===make)&&(!query.trim()||`${g.manufacturer} ${g.model} ${g.manual_name} ${g.years.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase())));
 return <div className="manual-drive">
  <section className="panel drive-hero">
   <span className="eyebrow">MANUAL DRIVE</span>
   <h2>Help BAK learn every bike. Earn a free year.</h2>
   <p>BAK walks riders through full rebuilds step by step. To do that for every bike we need the factory <b>service or repair manual</b> (the one that covers splitting the cases and rebuilding the suspension, not the owner's manual). Upload one we're missing and, once BAK verifies it, you get a code for <b>one free year of Premium</b>.</p>
   <div className="drive-stats">{data&&<><span><b>{data.counts.wanted_bike_years}</b> bike-years still needed</span><span><b>{data.counts.received_bike_years}</b> sent in by riders</span></>}</div>
   <p className="subtle"><ShieldCheck size={14}/> Manuals you upload stay private. BAK never shows, shares or lets anyone download them; it uses them only to check facts while writing its own guides. The first verified copy of each manual earns the reward.</p>
  </section>
  {signedIn&&<RedeemBox mine={mine} onDone={loadMine}/>}
  {picked&&<UploadPanel group={picked} signedIn={signedIn} onSignIn={onSignIn} onClose={()=>setPicked(null)} onDone={()=>{void load();loadMine();}}/>}
  <section className="panel">
   <div className="panel-title"><h2>Manuals we need</h2></div>
   <div className="drive-filters"><label className="field"><span>Search</span><span className="search-input"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="CRF450R, 2023, KX…"/></span></label><label className="field"><span>Make</span><select value={make} onChange={e=>setMake(e.target.value)}><option value="">All makes</option>{makes.map(m=><option key={m}>{m}</option>)}</select></label></div>
   {error&&<p className="error" role="alert">{error}</p>}
   {!data&&!error&&<p className="subtle" role="status">Loading the list…</p>}
   {data&&!shown.length&&<p className="subtle">{data.wanted.length?'Nothing matches that search.':data.counts.received_bike_years?'Every manual on the list has been sent in. Thank you!':'The list is being prepared. Check back soon.'}</p>}
   <div className="drive-list">{shown.map(g=>{const buys=(Array.isArray(g.buy)?g.buy as Buy[]:[]).filter(b=>safeUrl(b.url));return <article key={g.key} className="drive-row">
    <div><strong>{g.manufacturer} {g.model}</strong><span className="drive-years">{years(g.years)}</span><p className="subtle">{g.manual_name}{g.publication?` · ${g.publication}`:''}</p></div>
    <div className="drive-actions">{buys.slice(0,2).map((b,i)=><a key={i} className="chat-action" href={safeUrl(b.url)} target="_blank" rel="noreferrer nofollow">Buy{b.price?` · ${b.price}`:''}{b.kind==='aftermarket'?' (aftermarket)':''} <ArrowUpRight size={13}/><small>{b.seller}</small></a>)}{!buys.length&&<span className="subtle">No seller found yet</span>}<button className="button" onClick={()=>{if(!signedIn){onSignIn();return;}setPicked(g);window.scrollTo({top:0,behavior:'smooth'});}}><FileUp size={16}/>Upload</button></div>
   </article>;})}</div>
  </section>
  {signedIn&&!!mine?.contributions.length&&<section className="panel"><h2>Your uploads</h2>{mine.contributions.map(c=><p key={c.id} className="drive-mine"><StatusIcon status={c.status}/><span><b>{c.file_name}</b> · {new Date(c.created_at).toLocaleDateString()}<br/><span className="subtle">{c.reason??label(c.status)}</span></span></p>)}</section>}
 </div>;
}
const label=(s:string)=>s==='UPLOADING'?'Upload not finished':s==='CHECKING'?'Being checked':s==='ACCEPTED'?'Verified':s==='REJECTED'?'Not accepted':s==='ALREADY_RECEIVED'?'Already on file':'Saved privately';
function StatusIcon({status}:{status:string}){return status==='ACCEPTED'?<CheckCircle2 size={17} className="ok"/>:status==='REJECTED'?<XCircle size={17} className="bad"/>:<FileUp size={17}/>;}

function UploadPanel({group,signedIn,onSignIn,onClose,onDone}:{group:Group;signedIn:boolean;onSignIn:()=>void;onClose:()=>void;onDone:()=>void}){
 const [file,setFile]=useState<File|null>(null),[attest,setAttest]=useState(false),[stage,setStage]=useState<'idle'|'uploading'|'checking'|'done'>('idle'),[error,setError]=useState(''),[result,setResult]=useState<Result|null>(null),[uploadId,setUploadId]=useState('');
 const input=useRef<HTMLInputElement>(null);
 async function check(id:string){setStage('checking');setError('');try{const r=await api<Result>('/manuals/check','POST',{id});setResult(r);setStage('done');onDone();}catch(e){setError((e as Error).message);setStage('idle');}}
 async function start(){
  if(!signedIn){onSignIn();return;}
  if(!file||!attest||!supabase)return;
  if(file.type&&file.type!=='application/pdf'){setError('Choose a PDF file.');return;}
  if(file.size>200*1024*1024){setError('That file is over 200 MB. Upload a smaller copy of the PDF.');return;}
  setError('');setStage('uploading');
  try{
   const u=await api<{id:string;path:string;token:string}>('/manuals/upload','POST',{group:group.key,file_name:file.name.slice(0,200),bytes:file.size,attested:true});
   setUploadId(u.id);
   const up=await supabase.storage.from('manual-contributions').uploadToSignedUrl(u.path,u.token,file,{contentType:'application/pdf'});
   if(up.error)throw new Error('The upload did not finish. Check your connection and try again.');
   await check(u.id);
  }catch(e){setError((e as Error).message);setStage('idle');}
 }
 return <section className="panel drive-upload" aria-label="Upload a manual">
  <div className="panel-title"><div><span className="eyebrow">UPLOAD</span><h2>{group.manufacturer} {group.model} · {years(group.years)}</h2><p className="subtle">{group.manual_name}</p></div><button className="chat-action" onClick={onClose}>Close</button></div>
  {stage==='done'&&result?<div className={'drive-result '+result.status.toLowerCase()}>
   <h3><StatusIcon status={result.status}/>{result.status==='ACCEPTED'?'Verified. Thank you!':result.status==='REJECTED'?'Not the manual we need':result.status==='ALREADY_RECEIVED'?'Already on file':'Saved'}</h3>
   <p>{result.reason}</p>
   {result.code&&<div className="reward-code"><Gift size={18}/><div><span className="eyebrow">YOUR FREE YEAR OF PREMIUM</span><code>{result.code}</code><p className="subtle">Redeem it below on this page (or give it to a riding buddy). Codes are redeemed on the website; your Premium year then works in the BAK MX app too.</p></div></div>}
   {result.status==='REJECTED'&&<button className="button secondary" onClick={()=>{setStage('idle');setResult(null);setFile(null);}}>Try a different file</button>}
  </div>:<>
   <p>Upload the complete PDF. BAK checks the cover, contents and pages inside to make sure it's the full service or repair manual for this bike and these years.</p>
   <input ref={input} type="file" accept="application/pdf,.pdf" onChange={e=>setFile(e.target.files?.[0]??null)} disabled={stage!=='idle'}/>
   <label className="procedure-confirm"><input type="checkbox" checked={attest} onChange={e=>setAttest(e.target.checked)} disabled={stage!=='idle'}/><span>I own this copy of the manual and I'm allowed to share it with BAK MX. I understand BAK keeps it private and uses it only to check facts for its own guides.</span></label>
   {error&&<p className="error" role="alert">{error}{uploadId&&stage==='idle'&&<button className="chat-action" onClick={()=>void check(uploadId)}>Check again</button>}</p>}
   <button className="button" disabled={!file||!attest||stage!=='idle'} onClick={()=>void start()}>{stage==='uploading'?<><Loader2 size={16} className="spin"/>Uploading…</>:stage==='checking'?<><Loader2 size={16} className="spin"/>Checking the manual…</>:<><FileUp size={16}/>{signedIn?'Upload and check':'Sign in to upload'}</>}</button>
   {stage==='checking'&&<p className="subtle" role="status">Reading the cover, contents and sample pages. This can take up to a minute for a large manual.</p>}
  </>}
 </section>;
}

function RedeemBox({mine,onDone}:{mine:Mine|null;onDone:()=>void}){
 const [code,setCode]=useState(''),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false);
 const unused=(mine?.codes??[]).filter(c=>!c.redeemed_at);
 async function redeem(value:string){setBusy(true);setMsg('');try{const r=await api<{ends_at:string}>('/rewards/redeem','POST',{code:value});setMsg(`Premium is active until ${new Date(r.ends_at).toLocaleDateString()}.`);setCode('');onDone();}catch(e){setMsg((e as Error).message);}finally{setBusy(false);}}
 return <section className="panel redeem">
  <div><span className="eyebrow">REWARD CODES</span><h3>{mine?.grant&&Date.parse(mine.grant.ends_at)>Date.now()?`Premium through ${new Date(mine.grant.ends_at).toLocaleDateString()}`:'Have a code?'}</h3>{unused.map(c=><p key={c.code} className="subtle">Unused code: <code>{c.code}</code> <button className="chat-action" disabled={busy} onClick={()=>void redeem(c.code)}>Redeem on my account</button></p>)}</div>
  <form onSubmit={e=>{e.preventDefault();if(code.trim())void redeem(code.trim());}}><input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="BAK-XXXX-XXXX-XXXX" aria-label="Reward code" maxLength={40}/><button className="button secondary" disabled={busy||code.trim().length<8}>Redeem</button></form>
  {msg&&<p role="status" className="subtle">{msg}</p>}
 </section>;
}
