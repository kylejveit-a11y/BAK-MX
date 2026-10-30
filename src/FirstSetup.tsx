// The 60-second first setup on the website: four taps about the rider (weight in gear, level, kind of riding, usual dirt),
// saved to the bike with the same configuration keys the phone writes, then BAK writes a starting setup. Same sheet
// reopens from Home for a fresh starting point any time. Mirrors apps/mobile/src/FirstSetup.tsx.
import {useState} from 'react';
import {Check} from 'lucide-react';
import type {Bike} from '../shared/types';
import {RIDING_TYPES} from '../shared/garage-fields';
import {needsFirstSetup,firstSetupQuestion} from '../shared/first-setup';
import {api} from './client';
import {Chip,Sheet,errorText} from './HomeBlocks';
export {needsFirstSetup};

const LEVELS=['Beginner','Novice','Intermediate','Expert','Pro','Vet'];
const DIRT=['Sand','Loam','Hard-pack','Clay','Mixed','Mud / wet'];
const str=(v:unknown)=>v==null?'':String(v);

export function FirstSetupSheet({bike,onClose,onSaved,onAsk}:{bike:Bike;onClose:()=>void;onSaved:()=>void;onAsk:(question:string)=>void}){
 const c=bike.configuration??{};
 const [weight,setWeight]=useState(str(c.geared_weight_lb)),[level,setLevel]=useState(str(c.skill_level)),[discipline,setDiscipline]=useState(str(c.discipline)),[dirt,setDirt]=useState(str(c.usual_dirt)),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 const w=Number(weight);const ready=w>=60&&w<=400&&!!level&&!!discipline;
 async function go(){
  if(busy||!ready)return;setBusy(true);setNotice('');
  const configuration={...c,geared_weight_lb:weight.trim(),skill_level:level,discipline,...(dirt?{usual_dirt:dirt}:{})};
  try{
   await api(`/bikes?id=${bike.id}`,'PATCH',{manufacturer:bike.manufacturer,model:bike.model,model_year:bike.model_year,variant:bike.variant,region:bike.region,nickname:bike.nickname??'',engine_hours:bike.engine_hours??null,configuration});
   onSaved();onClose();onAsk(firstSetupQuestion({...bike,configuration},{weight:weight.trim(),level,discipline,dirt}));
  }catch(e){setNotice('Your answers could not be saved: '+errorText(e));}finally{setBusy(false);}
 }
 const chips=(items:string[],value:string,set:(v:string)=>void,clearable=false)=><div className="hb-chips" role="radiogroup">{items.map(i=>{const on=i===value;return <Chip key={i} role="radio" square on={on} onClick={()=>set(on&&clearable?'':i)}>{on&&<Check size={14} strokeWidth={2.4}/>}{i}</Chip>;})}</div>;
 const label=(t:string,sub?:string)=><div><p className="hb-strong" style={{fontSize:17}}>{t}</p>{sub&&<p className="hb-note">{sub}</p>}</div>;
 return <Sheet title="Starting setup" onClose={onClose}>
  <p className="hb-copy">Four quick answers about you. BAK sets the {bike.model_year} {bike.manufacturer} {bike.model} up from its published settings for your weight, level and the kind of riding you do. About a minute.</p>
  <div className="hb-stack" style={{gap:10}}>{label('Weight in riding gear','Boots, helmet, the lot. Springs and sag come from this.')}
   <div className="hb-row" style={{alignItems:'flex-end'}}><input className="hb-input line big" value={weight} inputMode="numeric" autoComplete="off" onChange={e=>setWeight(e.target.value.replace(/[^0-9]/g,'').slice(0,3))} placeholder="185" aria-label="Weight in riding gear, pounds"/><span className="hb-unit">lb</span></div>
  </div>
  <div className="hb-stack" style={{gap:10}}>{label('Riding level')}{chips(LEVELS,level,setLevel)}</div>
  <div className="hb-stack" style={{gap:10}}>{label('Main kind of riding')}{chips(RIDING_TYPES,discipline,setDiscipline)}</div>
  <div className="hb-stack" style={{gap:10}}>{label('Usual dirt','Optional. Tap again to clear.')}{chips(DIRT,dirt,setDirt,true)}</div>
  {notice&&<p className="hb-error" role="alert">{notice}</p>}
  <button type="button" className="button" disabled={busy||!ready} onClick={()=>void go()}>{busy?'Saving…':'Save and get my setup'}</button>
  <p className="hb-note">These go on the bike in Garage, where you can change them any time. BAK’s answer uses the bike’s own published settings and says what it doesn’t have.</p>
 </Sheet>;
}
