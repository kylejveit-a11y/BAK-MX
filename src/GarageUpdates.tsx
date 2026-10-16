import {useState} from 'react';
import {Check,Warehouse} from 'lucide-react';
import type {Bike} from '../shared/types';
import {pendingGarageUpdates,applyGarageUpdates,garageFieldLabel,type GarageUpdate} from '../shared/garage-updates';
import {systemLabel} from '../shared/installed-parts';
import {api} from './client';

/** Under a BAK reply: what the rider told BAK that isn't in their Garage yet, with one tap to save it. Nothing is saved
 *  until they tap. Proposals already matching the Garage are not shown, so a saved card quietly disappears on reload. */
export function GarageUpdates({bike,updates,onSaved}:{bike:Bike;updates:GarageUpdate[]|undefined;onSaved:(b:Bike)=>void}){
 const pending=pendingGarageUpdates(bike.configuration,updates);
 const [off,setOff]=useState<Set<number>>(new Set()),[busy,setBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState(0);
 if(saved)return <section className="garage-updates done" role="status"><Check size={16}/><span>Saved to your Garage. BAK will use it from your next question.</span></section>;
 if(!pending.length)return null;
 const chosen=pending.filter((_,i)=>!off.has(i));
 async function save(){
  setBusy(true);setError('');
  try{const configuration=applyGarageUpdates(bike.configuration,chosen);
   const b=await api<Bike>('/bikes?id='+bike.id,'PATCH',{manufacturer:bike.manufacturer,model:bike.model,model_year:bike.model_year,variant:bike.variant,region:bike.region,nickname:bike.nickname??'',engine_hours:bike.engine_hours,configuration});
   setSaved(chosen.length);onSaved(b);}
  catch(e){setError((e as Error).message)}finally{setBusy(false)}
 }
 const row=(u:GarageUpdate)=>u.type==='setting'
  ?<><b>{garageFieldLabel(u.field)}</b><span>{u.current?<><s>{u.current}</s> → </>:null}{u.value}</span></>
  :<><b>{[u.brand,u.name].filter(Boolean).join(' ')}</b><span>Add under {systemLabel(u.system)}{u.value?` · ${u.value}`:''}</span></>;
 return <section className="garage-updates" aria-label="Save to your Garage">
  <h4><Warehouse size={16}/>Save to your {bike.model} Garage?</h4>
  <ul>{pending.map((u,i)=><li key={i}><label><input type="checkbox" checked={!off.has(i)} onChange={()=>{const n=new Set(off);n.has(i)?n.delete(i):n.add(i);setOff(n)}}/><span className="gu-text">{row(u)}</span></label></li>)}</ul>
  {error&&<div className="error" role="alert">{error}</div>}
  <button className="button" disabled={busy||!chosen.length} onClick={save}>{busy?'Saving…':chosen.length===pending.length?'Save to Garage':`Save ${chosen.length} to Garage`}</button>
 </section>;
}
