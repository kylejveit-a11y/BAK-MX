import {useEffect,useState} from 'react';
import {FileText,Loader2,Lock,Trash2,Upload} from 'lucide-react';
import type {Bike} from '../shared/types';
import {api,supabase} from './client';

type Manual={id:string;file_name:string;pages:number|null;status:string;reason:string|null;created_at:string};

/** The rider's own manual for this bike: private to them, used only in their chats about this bike. */
export function RiderManual({bike}:{bike:Bike}){
 const [list,setList]=useState<Manual[]>([]),[file,setFile]=useState<File|null>(null),[busy,setBusy]=useState(''),[error,setError]=useState(''),[confirm,setConfirm]=useState('');
 const load=()=>api<Manual[]>('/rider-manuals?bike_id='+bike.id).then(setList).catch(()=>{});
 useEffect(()=>{void load();},[bike.id]);
 async function upload(){
  if(!file||!supabase)return;
  if(file.size>200*1024*1024){setError('That file is over 200 MB.');return;}
  setError('');setBusy('Uploading…');
  try{
   const u=await api<{id:string;path:string;token:string}>('/rider-manuals/upload','POST',{bike_id:bike.id,file_name:file.name.slice(0,200),bytes:file.size});
   const up=await supabase.storage.from('rider-manuals').uploadToSignedUrl(u.path,u.token,file,{contentType:'application/pdf'});
   if(up.error)throw new Error('The upload did not finish. Check your connection and try again.');
   setBusy('Reading your manual… (up to a minute for a big one)');
   const r=await api<{status:string;reason?:string}>('/rider-manuals/process','POST',{id:u.id});
   if(r.status==='FAILED')setError(r.reason??'Your manual could not be read.');
   setFile(null);await load();
  }catch(e){setError((e as Error).message);}finally{setBusy('');}
 }
 async function remove(id:string){setBusy('Deleting…');try{await api('/rider-manuals?id='+id,'DELETE');setConfirm('');await load();}catch(e){setError((e as Error).message);}finally{setBusy('');}}
 return <section className="panel rider-manual">
  <div className="panel-title"><div><span className="eyebrow">YOUR MANUAL</span><h2>Add your own manual</h2></div><Lock size={20}/></div>
  <p className="subtle">Have the service or owner's manual for this bike as a PDF? Add it and BAK can look things up in it when you ask about this bike. It stays private to your account: no one else sees it and BAK doesn't use it for anyone else. Delete it any time.</p>
  {list.map(m=><div key={m.id} className="rider-manual-row"><FileText size={17}/><span><b>{m.file_name}</b><small>{m.status==='READY'?`${m.pages} pages · ready`:m.status==='FAILED'?(m.reason??'Could not be read'):m.status==='READING'?'Reading…':'Upload not finished'}</small></span>{confirm===m.id?<><button className="chat-action danger" disabled={!!busy} onClick={()=>void remove(m.id)}>Delete it</button><button className="chat-action" onClick={()=>setConfirm('')}>Keep</button></>:<button className="icon-button" aria-label={`Delete ${m.file_name}`} title="Delete" onClick={()=>setConfirm(m.id)}><Trash2 size={16}/></button>}</div>)}
  <div className="rider-manual-add"><input type="file" accept="application/pdf,.pdf" disabled={!!busy} onChange={e=>setFile(e.target.files?.[0]??null)}/><button className="button secondary" disabled={!file||!!busy} onClick={()=>void upload()}>{busy?<><Loader2 size={16} className="spin"/>{busy}</>:<><Upload size={16}/>Add manual</>}</button></div>
  {error&&<p className="error" role="alert">{error}</p>}
 </section>;
}
