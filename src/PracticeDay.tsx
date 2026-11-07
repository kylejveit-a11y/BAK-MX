// Practice day on the website, inside race mode: today's bike and setup, what's up next, a short practice checklist (BAK's
// race-prep items that fit a practice day; edited like race prep), a session log (number, time on track, notes, the setup
// change, which goes into the setup log), "How did it ride?" and Ask BAK about today. Sessions are kept on this browser;
// a setup change goes to the account's setup log. Mirrors apps/mobile/src/PracticeDay.tsx; the rules are in
// shared/practice-day.ts.
import {useEffect,useState} from 'react';
import {Zap} from 'lucide-react';
import type {Bike} from '../shared/types';
import {SETUP_RESULT_LABELS,type SetupLog,type SetupResult} from '../shared/rider-types';
import {CHANGES,today,type NextUp,type RaceDay} from '../shared/race-day';
import {PRACTICE_COPY as COPY,SESSION_MINUTES,advanceNextUp,emptySession,makeSession,nextSessionNumber,practiceAskText,sessionChange,sessionLabel,sessionLogBody,sessionsFor,sessionsSummary,type PracticeSession,type SessionDraft,type StoredPractice} from '../shared/practice-day';
import {api} from './client';
import {BlockHead,Chip,errorText,readLocal,writeLocal,timeOf} from './HomeBlocks';
import {BikeNowCard,NextUpCard,bikeSetup} from './RaceDay';
import {RacePrepCard,RacePrepSheet} from './RacePrep';
import {TrackReportCard} from './TrackReport';

const storeKey=(bikeId:string)=>`practice-sessions:${bikeId}`;
/** Today's sessions for this bike, kept on this browser. */
function usePracticeSessions(account:string,bikeId:string){
 const day=today();
 const read=()=>sessionsFor(readLocal<StoredPractice|null>(account,storeKey(bikeId),null),day);
 const [sessions,setSessions]=useState<PracticeSession[]>(read);
 useEffect(()=>{setSessions(read());},[account,bikeId,day]);
 const save=(next:PracticeSession[])=>{setSessions(next);return writeLocal(account,storeKey(bikeId),{day,sessions:next});};
 return {sessions,save};
}
const tone=(r:SetupResult)=>r==='better'?' hb-good':r==='worse'?' hb-bad':'';

export function PracticeDayHome({bike,account,race,onEnd,onAsk,onNext}:{bike:Bike;account:string;race:RaceDay;onEnd:()=>void;onAsk:(text:string)=>void;onNext:(next:NextUp|null)=>void}){
 const {sessions,save}=usePracticeSessions(account,bike.id);
 const [draft,setDraft]=useState<SessionDraft>(emptySession),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[prepOpen,setPrepOpen]=useState(false);
 const set=(p:Partial<SessionDraft>)=>setDraft(d=>({...d,...p}));
 const track=race.track,n=nextSessionNumber(sessions),bikeName=`${bike.model_year} ${bike.manufacturer} ${bike.model}`;
 async function log(){
  if(busy)return;const made=makeSession(sessions,draft);if(!made.session){setNotice(made.problem);return;}
  const s=made.session;setBusy(true);setNotice('');
  let list=[...sessions,s];if(!save(list)){setNotice('This browser could not save the session.');setBusy(false);return;}
  setDraft(emptySession());onNext(advanceNextUp(race.next,`Session ${s.n}`));
  const body=sessionLogBody(s,bike,track);
  if(body){try{const saved=await api<SetupLog>('/setup-logs','POST',body);list=list.map(x=>x.id===s.id?{...x,logId:saved.id}:x);save(list);}
   catch(e){setNotice(`Session saved on this browser, but the setup change could not go to your setup log: ${errorText(e)}`);}}
  setBusy(false);
 }
 const ordered=[...sessions].sort((a,b)=>b.n-a.n),linked=ordered.find(x=>x.logId);
 return <>
  <div className="hb-race-head">
   <span className="eyebrow"><i className="hb-mark" aria-hidden="true" style={{width:22}}/>PRACTICE DAY · {new Date().toLocaleDateString([],{weekday:'long',month:'short',day:'numeric'})}</span>
   <h2 className="hb-title big">{track||'Practice day'}</h2>
   <p className="hb-line">{bikeName}{bike.engine_hours!=null?` · ${bike.engine_hours} h`:''}{sessions.length?` · ${sessionsSummary(sessions)}`:''}</p>
  </div>
  <NextUpCard race={race} labels={[`Session ${n}`,`Session ${n+1}`]} onSet={onNext}/>
  <BikeNowCard bike={bike}/>
  <section className="panel hb-block"><div className="hb-block-head"><span className="eyebrow"><Zap size={15} style={{color:'var(--bike-accent)'}}/>{COPY.ask.toUpperCase()}</span></div>
   <p className="hb-copy" style={{fontSize:13.5}}>{COPY.askDetail}</p>
   <button type="button" className="button" onClick={()=>onAsk(practiceAskText({track,bike:bikeName,setup:bikeSetup(bike),sessions}))}>{COPY.ask}</button>
  </section>
  <RacePrepCard kind="practice" bike={bike} phase={sessions.length?'motos':'track'} onOpen={()=>setPrepOpen(true)}/>
  <RacePrepSheet kind="practice" open={prepOpen} onClose={()=>setPrepOpen(false)} bike={bike} startPhase={sessions.length?'motos':'track'}/>
  <section className="panel hb-block"><BlockHead title={`${COPY.logSession} · SESSION ${n}`}/>
   <p className="hb-field-label">{COPY.timeOnTrack}</p>
   <div className="hb-chips">{SESSION_MINUTES.map(m=><Chip key={m} on={draft.minutes===String(m)} onClick={()=>set({minutes:draft.minutes===String(m)?'':String(m)})}>{`${m} min`}</Chip>)}</div>
   <input className="hb-input" value={draft.minutes} maxLength={6} inputMode="numeric" onChange={e=>set({minutes:e.target.value})} placeholder="Or type minutes, e.g. 25" aria-label={COPY.timeOnTrack}/>
   <p className="hb-field-label">{COPY.notesLabel}</p>
   <textarea className="hb-input" value={draft.notes} maxLength={500} onChange={e=>set({notes:e.target.value})} placeholder={COPY.notesPlaceholder} aria-label={COPY.notesLabel}/>
   <p className="hb-field-label">{COPY.changeLabel}</p>
   <div className="hb-chips">{CHANGES.map(c=><Chip key={c} on={draft.change===c} onClick={()=>set({change:draft.change===c?'':c})}>{c}</Chip>)}</div>
   {!!draft.change&&<>
    <input className="hb-input" value={draft.detail} maxLength={200} onChange={e=>set({detail:e.target.value})} placeholder="e.g. 2 clicks softer, or 13 psi" aria-label="Detail of the change"/>
    <p className="hb-field-label">How did it ride?</p>
    <div className="hb-chips">{(['better','no_change','worse','not_tested'] as SetupResult[]).map(r=><Chip key={r} on={draft.result===r} onClick={()=>set({result:r})}>{SETUP_RESULT_LABELS[r]}</Chip>)}</div>
    <p className="hb-note">Goes into your setup log with this session.</p>
   </>}
   {notice&&<p className="hb-error" role="alert">{notice}</p>}
   <button type="button" className="button" disabled={busy} onClick={()=>void log()}>{busy?COPY.saving:COPY.save}</button>
  </section>
  <section className="panel hb-block"><BlockHead title={`${COPY.sessions}${sessions.length?` · ${sessionsSummary(sessions).toUpperCase()}`:''}`}/>
   {!sessions.length&&<p className="hb-copy">{COPY.none}</p>}
   {ordered.map(x=><div key={x.id} className="hb-today-entry"><strong>{sessionLabel(x)}{x.change?` · ${sessionChange(x)}`:''}</strong><span>{timeOf(x.at)}{x.change&&<> · <b className={tone(x.result)}>{SETUP_RESULT_LABELS[x.result]}</b></>}{x.logId?' · in setup log':''}{x.notes?` · ${x.notes}`:''}</span></div>)}
  </section>
  <TrackReportCard track={track} day={today()} setupLogId={linked?.logId??null} setupLabel={linked?sessionChange(linked):undefined} showOthers/>
  <button type="button" className="hb-link muted hb-center" onClick={onEnd}>{COPY.end}</button>
 </>;
}
