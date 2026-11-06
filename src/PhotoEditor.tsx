import {useEffect,useState} from 'react';
import {Sparkles,X} from 'lucide-react';
import {api} from './client';
import type {Photo} from './photos';
import {EDIT_STYLES,EDIT_STYLE_LABELS,type EditStyle,type EditUsage} from '../shared/photo-edit';
import {aiConsentKey,aiConsentPoints,aiConsentAgree} from '../shared/ai-consent';

const errorText=(e:unknown)=>e instanceof Error&&e.message?e.message:'Something went wrong. Try again.';

/** What is left, in plain words: "2 of 3 free edits left", "12 of 15 left this month", "+ 10 bought". */
export function editsLeftText(u:EditUsage){
 const base=u.period==='lifetime'?`${u.left} of ${u.included} free edits left`:`${u.left} of ${u.included} edits left this month`;
 return u.credits>0?`${base} · ${u.credits} bought`:base;
}

/** Action-sports edit for one of the rider's own photos. The look only changes light, colour and sharpness; the rider
 *  keeps the original and chooses whether the post uses the edit. */
export function PhotoEditor({photo,owner,onUse,onClose}:{photo:Photo;owner:string;onUse:(p:Photo)=>void;onClose:()=>void}){
 // The photo goes to the AI service, so the same permission as Ask BAK comes first.
 const [agreed,setAgreed]=useState(()=>{try{return localStorage.getItem(aiConsentKey(owner))==='yes';}catch{return false;}});
 const [usage,setUsage]=useState<EditUsage|null>(null),[style,setStyle]=useState<EditStyle>('magazine'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[result,setResult]=useState<Photo|null>(null),[request,setRequest]=useState(()=>crypto.randomUUID());
 useEffect(()=>{api<EditUsage>('/photo-edits/usage').then(setUsage).catch(e=>setError(errorText(e)));},[]);
 const out=!!usage&&usage.left+usage.credits<1;
 async function run(){
  setBusy(true);setError('');
  try{const r=await api<{photo:Photo;usage:EditUsage}>('/photo-edits','POST',{photo_id:photo.id,style,request_id:request});setResult(r.photo);setUsage(r.usage);setRequest(crypto.randomUUID());}
  // A dropped connection keeps the same request, so asking again returns that edit instead of paying for a second one.
  catch(e){setError(errorText(e));const st=(e as {status?:number}).status;if(st&&st!==504)setRequest(crypto.randomUUID());api<EditUsage>('/photo-edits/usage').then(setUsage).catch(()=>{});}
  finally{setBusy(false);}
 }
 async function buy(price:string){setError('');try{const r=await api<{url:string}>('/billing/credits','POST',{price_id:price});location.href=r.url;}catch(e){setError(errorText(e));}}
 return <div className="pe-backdrop" role="dialog" aria-modal="true" aria-label="Action edit" onClick={e=>{if(e.target===e.currentTarget&&!busy)onClose();}}>
  <section className="panel pe-sheet">
   <div className="pe-head"><h3><Sparkles size={18}/>Action edit</h3><button type="button" className="icon-button" aria-label="Close" disabled={busy} onClick={onClose}><X size={18}/></button></div>
   <div className={'pe-compare'+(result?' two':'')}>
    <figure><img src={photo.url} alt="Your photo"/>{result&&<figcaption>Original</figcaption>}</figure>
    {result&&<figure><img src={result.url} alt={`${EDIT_STYLE_LABELS[style].title} edit`}/><figcaption>{EDIT_STYLE_LABELS[style].title}</figcaption></figure>}
    {busy&&<div className="pe-working"><span className="rd-spin"/>Editing… about 20 to 40 seconds</div>}
   </div>
   {!agreed&&<div className="pe-consent"><p><strong>Before your first edit</strong></p>{aiConsentPoints.map(t=><p key={t} className="subtle">{t}</p>)}<button type="button" className="button" onClick={()=>{try{localStorage.setItem(aiConsentKey(owner),'yes');}catch{/* this tab only */}setAgreed(true);}}>{aiConsentAgree}</button></div>}
   {!result&&<div className="pe-styles" role="radiogroup" aria-label="Look">{EDIT_STYLES.map(s=><button type="button" role="radio" aria-checked={style===s} key={s} className={'pe-style'+(style===s?' on':'')} disabled={busy} onClick={()=>setStyle(s)}><b>{EDIT_STYLE_LABELS[s].title}</b><span>{EDIT_STYLE_LABELS[s].blurb}</span></button>)}</div>}
   <p className="subtle pe-note">Only the light, colour and sharpness change. You, your bike, your numbers and the track stay exactly as shot.{usage&&<> <strong>{editsLeftText(usage)}.</strong></>}</p>
   {error&&<div className="error" role="alert">{error}</div>}
   {out&&!result&&<div className="pe-buy">{usage!.packs.length?<><p>{usage!.period==='lifetime'?'Your free edits are used. Pro includes 15 a month, or buy a pack:':'This month’s edits are used. Buy a pack to keep going:'}</p>
    <div className="pe-packs">{usage!.packs.map(p=><button type="button" key={p.id} className="button secondary" onClick={()=>void buy(p.id)}>{p.edits} edits{p.price?` · ${p.price}`:''}</button>)}</div></>
    :<p>{usage!.period==='lifetime'?'Your free edits are used. Pro includes 15 edits a month.':'This month’s edits are used. They refill on the 1st.'}</p>}</div>}
   <div className="pe-actions">
    {result?<><button type="button" className="button" onClick={()=>onUse(result)}>Use the edit</button><button type="button" className="button secondary" onClick={()=>setResult(null)}>Try another look</button><button type="button" className="button secondary" onClick={onClose}>Keep the original</button></>
     :<button type="button" className="button" disabled={busy||!usage||out||!agreed} onClick={()=>void run()}>{busy?'Editing…':`Make it ${EDIT_STYLE_LABELS[style].title}`}</button>}
   </div>
  </section>
 </div>;
}
