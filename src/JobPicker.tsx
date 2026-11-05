import {useState} from 'react';
import {ChevronDown,ChevronRight} from 'lucide-react';
import type {ReviewedProcedure} from '../shared/procedures';

/** Jobs grouped by system, closed until the rider opens one, so the list is three short rows instead of every job at once. */
export function JobPicker({groups,selected,onPick,showSteps=true}:{groups:{id:string;title:string;procedures:ReviewedProcedure[]}[];selected?:string;onPick:(id:string)=>void;showSteps?:boolean}){
 const [open,setOpen]=useState<string|null>(()=>groups.find(g=>g.procedures.some(p=>p.id===selected))?.id??null);
 return <div className="job-picker" role="list">{groups.map(g=>{const isOpen=open===g.id;return <div key={g.id} className={'job-group'+(isOpen?' open':'')} role="listitem">
  <button type="button" className="job-group-head" aria-expanded={isOpen} onClick={()=>setOpen(isOpen?null:g.id)}>{isOpen?<ChevronDown size={16}/>:<ChevronRight size={16}/>}<span>{g.title}</span><small>{g.procedures.length} {g.procedures.length===1?'job':'jobs'}</small></button>
  {isOpen&&<div className="job-group-list">{g.procedures.map(p=><button type="button" key={p.id} className={'job-option'+(p.id===selected?' selected':'')} aria-pressed={p.id===selected} onClick={()=>onPick(p.id)}><span>{p.title}</span>{showSteps&&<small>{p.steps.length} steps</small>}</button>)}</div>}
 </div>;})}</div>;
}
