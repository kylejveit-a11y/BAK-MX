// "How did it ride?" on the website: pick the track (recent and nearby first, or search BAK's tracks), the day, tap the
// chips, save. Shown after a setup log entry, on the race-day screen and under an Ask BAK reply when the rider says they
// rode a track today or yesterday. Mirrors apps/mobile/src/TrackReport.tsx; the words and rules are in shared/track-reports.ts.
import {useEffect,useMemo,useState} from 'react';
import {Check,MapPin} from 'lucide-react';
import {today,dayOf,knownTrack,trackSuggestions} from '../shared/race-day';
import {REPORT_COPY,REPORT_GROUPS,addDays,dayWord,emptyDraft,reportBody,reportSummaryLine,reportTrackPicks,rodeTrackMention,mayMentionRide,toggleTag,type RecentRiderReports,type ReportDraft,type ReportTrack} from '../shared/track-reports';
import {api} from './client';
import {BlockHead,Chip,errorText,readLocal,writeLocal} from './HomeBlocks';

type DirTrack=ReportTrack&{id:string};
/** BAK's listed tracks (cached on this browser, refreshed once per page load). Only entries with an id can be reported on. */
let dirLoad:Promise<DirTrack[]>|null=null;
export function useTrackDirectory(){
 const [dir,setDir]=useState<DirTrack[]>(()=>readLocal<DirTrack[]>('device','track-directory',[]).filter(t=>!!t.id));
 useEffect(()=>{let live=true;
  dirLoad??=api<DirTrack[]>('/tracks').then(r=>{if(Array.isArray(r)&&r.length){writeLocal('device','track-directory',r);return r.filter(t=>!!t.id);}return [];}).catch(()=>{dirLoad=null;return [];});
  void dirLoad.then(r=>{if(live&&r.length)setDir(r);});return()=>{live=false;};},[]);
 return dir;
}
/** Under an Ask BAK reply: when the rider's message said they rode one of BAK's tracks that day or the day before
 *  ("rode Dade City today"), a one-line offer that opens the card for that track and day. `at` is when they said it. */
export function RodeTrackOffer({text,at}:{text:string|undefined;at:string}){
 if(!text||!mayMentionRide(text))return null;
 return <RodeTrackOfferInner text={text} at={at}/>;
}
function RodeTrackOfferInner({text,at}:{text:string;at:string}){
 const dir=useTrackDirectory(),said=dayOf(new Date(at));
 const hit=useMemo(()=>rodeTrackMention(text,dir,said),[text,dir,said]);
 if(!hit||hit.day<addDays(today(),-30))return null;
 return <TrackReportCard compact track={hit.track.name} day={hit.day}/>;
}

type OwnReport={id:string;track_id:string;ridden_on:string};
export function TrackReportCard({track,day,setupLogId,setupLabel,recent=[],compact=false,showOthers=false,onClose}:{track?:string;day?:string;setupLogId?:string|null;setupLabel?:string;recent?:string[];compact?:boolean;showOthers?:boolean;onClose?:()=>void}){
 const dir=useTrackDirectory(),now=today();
 const [open,setOpen]=useState(!compact),[draft,setDraft]=useState<ReportDraft>(()=>({...emptyDraft(day&&day<=now?day:now),setupLogId:setupLogId??null})),[search,setSearch]=useState(''),[more,setMore]=useState(false);
 const [mine,setMine]=useState<OwnReport[]>([]),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[done,setDone]=useState(false),[others,setOthers]=useState<RecentRiderReports|null>(null);
 const set=(p:Partial<ReportDraft>)=>setDraft(d=>({...d,...p}));
 // The prefilled track, once BAK's list is here.
 useEffect(()=>{if(!track||draft.trackId)return;const k=knownTrack(dir,track) as DirTrack|undefined;if(k)set({trackId:k.id});},[track,dir]);
 useEffect(()=>{set({setupLogId:setupLogId??null});},[setupLogId]);
 useEffect(()=>{if(!open)return;let live=true;api<OwnReport[]>('/track-reports').then(r=>{if(live&&Array.isArray(r))setMine(r);}).catch(()=>{});return()=>{live=false;};},[open]);
 useEffect(()=>{if(!showOthers||!draft.trackId){setOthers(null);return;}let live=true;api<RecentRiderReports|null>('/track-reports/summary?track_id='+encodeURIComponent(draft.trackId)).then(r=>{if(live)setOthers(r);}).catch(()=>{if(live)setOthers(null);});return()=>{live=false;};},[showOthers,draft.trackId,done]);
 const byId=(id:string)=>dir.find(t=>t.id===id);
 const chosen=draft.trackId?byId(draft.trackId):undefined;
 const picks=reportTrackPicks(dir,[...mine.map(r=>byId(r.track_id)?.name??''),...(track?[track]:[]),...recent].filter(Boolean)) as DirTrack[];
 const suggestions=trackSuggestions(dir,search) as DirTrack[];
 async function save(){
  if(busy)return;const r=reportBody(draft,now);if(r.problem){setNotice(r.problem);return;}
  setBusy(true);setNotice('');
  try{await api('/track-reports','POST',r.body);setDone(true);}catch(e){setNotice(errorText(e));}finally{setBusy(false);}
 }
 if(compact&&!open&&!done)return <button type="button" className="tr-ask" onClick={()=>setOpen(true)}><MapPin size={15}/>{REPORT_COPY.askPrompt(chosen?.name??track??'the track',dayWord(draft.day,now).toLowerCase())}</button>;
 return <section className="panel hb-block tr-card" aria-label={REPORT_COPY.title}>
  <BlockHead title={REPORT_COPY.title.toUpperCase()} action={onClose?'Close':undefined} onAction={onClose}/>
  {done?<>
   <p className="hb-note ok" role="status"><Check size={14}/> {REPORT_COPY.saved}</p>
   {others&&<p className="hb-copy">{reportSummaryLine(others)}</p>}
   <button type="button" className="hb-link muted" onClick={()=>{setDone(false);setDraft(d=>({...emptyDraft(d.day),trackId:d.trackId,setupLogId:d.setupLogId}));}}>Change it</button>
  </>:<>
   <p className="hb-copy">{REPORT_COPY.intro}</p>
   <div className="hb-stack" style={{gap:8}}>
    <p className="hb-field-label">{REPORT_COPY.track}</p>
    {chosen?<div className="hb-row between"><span className="hb-strong">{chosen.name}<small className="tr-place">{[chosen.city,chosen.state].filter(Boolean).join(', ')}</small></span><button type="button" className="hb-link muted" onClick={()=>{set({trackId:''});setSearch('');}}>Change</button></div>:<>
     {picks.length>0&&<div className="hb-chips">{picks.map(t=><Chip key={t.id} onClick={()=>set({trackId:t.id})}>{t.name}</Chip>)}</div>}
     <input className="hb-input line" value={search} maxLength={120} autoComplete="off" onChange={e=>setSearch(e.target.value)} placeholder={REPORT_COPY.search} aria-label={REPORT_COPY.track}/>
     {suggestions.length>0&&<div className="hb-suggest">{suggestions.map(t=><button type="button" key={t.id} onClick={()=>{set({trackId:t.id});setSearch('');}}><span>{t.name}<small>{[t.city,t.state].filter(Boolean).join(', ')}</small></span></button>)}</div>}
     {(()=>{const k=knownTrack(dir,search) as DirTrack|undefined;return k?<button type="button" className="hb-link" onClick={()=>{set({trackId:k.id});setSearch('');}}>Use {k.name}</button>:null;})()}
    </>}
    {others&&<p className="hb-note">{REPORT_COPY.others}: {reportSummaryLine(others)}</p>}
   </div>
   <div className="hb-stack" style={{gap:8}}>
    <p className="hb-field-label">{REPORT_COPY.day}</p>
    <div className="hb-row wrap">
     {[now,addDays(now,-1)].map(d=><Chip key={d} on={draft.day===d} onClick={()=>set({day:d})}>{dayWord(d,now)}</Chip>)}
     <input className="hb-input tr-date" type="date" value={draft.day} min={addDays(now,-30)} max={now} onChange={e=>e.target.value&&set({day:e.target.value})} aria-label={REPORT_COPY.day}/>
    </div>
   </div>
   {REPORT_GROUPS.map(g=><div key={g.id} className="hb-stack" style={{gap:8}}>
    <p className="hb-field-label">{g.label}</p>
    <div className="hb-chips" role={g.one?'radiogroup':'group'} aria-label={g.label}>{g.tags.map(t=><Chip key={t.id} role={g.one?'radio':'button'} on={draft.tags.includes(t.id)} onClick={()=>set({tags:toggleTag(draft.tags,t.id)})}>{t.label}</Chip>)}</div>
   </div>)}
   <button type="button" className="hb-link" onClick={()=>setMore(!more)} aria-expanded={more}>{more?REPORT_COPY.less:REPORT_COPY.more}</button>
   {more&&<div className="hb-stack" style={{gap:10}}>
    <label className="hb-field"><span className="hb-field-label">{REPORT_COPY.tire}</span><input className="hb-input" value={draft.tire} maxLength={80} onChange={e=>set({tire:e.target.value})} placeholder={REPORT_COPY.tirePlaceholder}/></label>
    <div className="hb-row">
     <label className="hb-field hb-grow"><span className="hb-field-label">{REPORT_COPY.front}</span><input className="hb-input" inputMode="decimal" value={draft.front} maxLength={5} onChange={e=>set({front:e.target.value})} placeholder="13"/></label>
     <label className="hb-field hb-grow"><span className="hb-field-label">{REPORT_COPY.rear}</span><input className="hb-input" inputMode="decimal" value={draft.rear} maxLength={5} onChange={e=>set({rear:e.target.value})} placeholder="12"/></label>
    </div>
    {draft.setupLogId?<div className="hb-stack" style={{gap:4}}><p className="hb-field-label">{REPORT_COPY.setup}</p><div className="hb-row between"><span className="hb-copy">{REPORT_COPY.setupLinked}{setupLabel?`: ${setupLabel}`:''}</span><button type="button" className="hb-link muted" onClick={()=>set({setupLogId:null})}>{REPORT_COPY.unlink}</button></div></div>
     :<label className="hb-field"><span className="hb-field-label">{REPORT_COPY.setup}</span><input className="hb-input" value={draft.setupText} maxLength={200} onChange={e=>set({setupText:e.target.value})} placeholder={REPORT_COPY.setupPlaceholder}/></label>}
    <label className="hb-field"><span className="hb-field-label">{REPORT_COPY.note}</span><textarea className="hb-input" value={draft.note} maxLength={500} rows={2} onChange={e=>set({note:e.target.value})} placeholder={REPORT_COPY.notePlaceholder}/></label>
   </div>}
   {notice&&<p className="hb-error" role="alert">{notice}</p>}
   <button type="button" className="button" disabled={busy} onClick={()=>void save()}>{busy?REPORT_COPY.saving:REPORT_COPY.save}</button>
  </>}
 </section>;
}
