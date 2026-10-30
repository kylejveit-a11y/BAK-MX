// Race day on the website, the phone app's way: set the track and the day, Home counts down and BAK works out a starting
// setup for that track and the forecast; on the day Home becomes the track-day screen with quick asks, a change log that
// goes into the setup log, and today's entries. The race itself is saved on this browser, per rider and bike, in the same
// shape as the phone's (shared/race-day.ts holds the rules both follow). Mirrors apps/mobile/src/HomeBlocks.tsx.
import {useEffect,useState} from 'react';
import {Flag,Zap} from 'lucide-react';
import type {Bike,Conversation,EngineeringResponse,Message} from '../shared/types';
import {SETUP_RESULT_LABELS,type RideEvent,type SetupLog,type SetupResult} from '../shared/rider-types';
import {RACE_PHASES,phaseForDaysOut} from '../shared/race-prep';
import {aiConsentKey} from '../shared/ai-consent';
import {OFF_RACE,today,dayOf,activeRace,daysToGo,longDay,QUICK,CHANGES,MOTOS,quickAskText,tryNextText,raceSetupTitle,raceSetupQuestion,raceSetupField,raceSetupKey,raceSetupStale,plain,knownTrack,trackSuggestions,trackPicks,type RaceDay,type KnownTrack} from '../shared/race-day';
import {api,apiStream} from './client';
import {createSubmission,finishCreate} from './createSubmission';
import {RichText} from './RichText';
import {BlockHead,Chip,Progress,Sheet,errorText,readLocal,writeLocal,timeOf,useRacePrepList} from './HomeBlocks';

// ------------------------------------------------------------------ the race itself
/** The rider's race for this bike, today or ahead, saved on this browser. A race that has passed reads as none. */
export function useRaceDay(account:string,bikeId:string|undefined){
 const key=`race-day:${bikeId??'none'}`;
 const [race,setRace]=useState<RaceDay>(()=>activeRace(readLocal<RaceDay|null>(account,key,null))??OFF_RACE),[error,setError]=useState('');
 useEffect(()=>{setRace(activeRace(readLocal<RaceDay|null>(account,key,null))??OFF_RACE);},[account,key]);
 // Coming back to the tab the next morning: a race that was tomorrow is now today, or one that passed is over.
 useEffect(()=>{const check=()=>{if(document.visibilityState!=='visible')return;const r=activeRace(readLocal<RaceDay|null>(account,key,null))??OFF_RACE;setRace(old=>old.on===r.on&&old.day===r.day&&old.track===r.track?old:r);};document.addEventListener('visibilitychange',check);return()=>document.removeEventListener('visibilitychange',check);},[account,key]);
 const save=(r:RaceDay)=>{setRace(r);setError(writeLocal(account,key,r.on?r:null)?'':'Race day could not be saved on this browser. It stays until you leave the page.');};
 return {race,error,isToday:race.on&&race.day===today(),upcoming:race.on&&race.day>today(),start:(track:string,day:string=today())=>save({on:true,track:track.trim(),day}),end:()=>save(OFF_RACE)};
}

// ------------------------------------------------------------------ BAK's starting setup for the race
type RaceSetup={key:string;at:string;summary:string;answer:string;changes:{setting:string;change:string;expect:string;go_back_if:string}[];next:string;conversation:string};
/** BAK works out a starting setup for this track, date and forecast from what is on the bike now. Saved on this browser. */
export function RaceSetupCard({account,bike,track,day,onOpenChat}:{account:string;bike:Bike;track:string;day:string;onOpenChat:(conversation:string)=>void}){
 const key=raceSetupKey(bike.id,track,day);
 const [saved,setSaved]=useState<RaceSetup|null>(()=>{const r=readLocal<RaceSetup|null>(account,'race-setup',null);return r&&r.key===key?r:null;});
 const [live,setLive]=useState<{summary:string;answer:string}|null>(null),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 useEffect(()=>{const r=readLocal<RaceSetup|null>(account,'race-setup',null);setSaved(r&&r.key===key?r:null);},[account,key]);
 const consent=(()=>{try{return localStorage.getItem(aiConsentKey(account))==='yes';}catch{return false;}})();
 const stale=!!saved&&raceSetupStale(day,saved.at);
 async function get(){
  if(busy)return;if(!consent){setNotice('Open Ask BAK once and agree to the AI terms, then come back.');return;}
  setBusy(true);setNotice('');setLive({summary:'',answer:''});
  const kind=`conversation-race-setup-${bike.id}`;
  try{
   const conv=await api<Conversation>('/conversations','POST',createSubmission(account,kind,{bike_id:bike.id,title:raceSetupTitle(track,day),mode:'setup'}));finishCreate(account,kind);
   const r=await apiStream<{response:EngineeringResponse;message:Message}>('/chat',{conversation_id:conv.id,request_id:crypto.randomUUID(),message:raceSetupQuestion(track,day),race:raceSetupField(track,day)},ev=>{if(ev.type==='draft')setLive({summary:String(ev.summary||''),answer:String(ev.answer||'')});});
   const next:RaceSetup={key,at:new Date().toISOString(),summary:r.response.summary,answer:r.response.answer??'',changes:r.response.setup_changes??[],next:r.response.next_step?.action??'',conversation:conv.id};
   setSaved(next);if(!writeLocal(account,'race-setup',next))setNotice('The setup is here, but it could not be saved on this browser. You can find it again under Ask BAK › Chats.');
  }catch(e){setNotice('BAK could not work out the setup: '+errorText(e));}finally{setBusy(false);setLive(null);}
 }
 return <section className="panel hb-block">
  <BlockHead title={`BAK’S SETUP FOR ${track?track.toUpperCase():'THIS RACE'}`}/>
  {!saved&&!live&&<p className="hb-copy">BAK works out where to start for this track and day: the dirt and layout, the weather forecast once it’s within a week, and what’s on your bike now. {track?'':'Add the track for track info and weather. '}It may say your setup is already right.</p>}
  {live&&<div className="hb-stack" style={{gap:6}}>{!!live.summary&&<p className="hb-strong">{plain(live.summary)}</p>}{!!live.answer&&<RichText text={live.answer}/>}<p className="hb-note" role="status">{live.summary||live.answer?'Writing… final checks run before it’s saved.':'Reading the track, the forecast and your bike…'}</p></div>}
  {saved&&!live&&<div className="hb-stack" style={{gap:10}}>
   <p className="hb-strong">{plain(saved.summary)}</p>
   {saved.changes.length>0?saved.changes.map((c,i)=><div key={i} className="hb-change"><em>{c.setting}</em><strong>{plain(c.change)}</strong>{!!c.expect&&<span>{plain(c.expect)}</span>}</div>):<p className="hb-line hb-good" style={{fontWeight:700}}>Keep what’s on the bike.</p>}
   {!!saved.answer&&<RichText text={saved.answer}/>}
   {!!saved.next&&<p className="hb-copy" style={{color:'#eef1f6'}}><b>First practice: </b>{plain(saved.next)}</p>}
   <p className="hb-note">Worked out {new Date(saved.at).toLocaleDateString('en-US',{month:'short',day:'numeric'})} at {timeOf(saved.at)} · saved on this device{stale?' · the forecast is out now, refresh it':''}</p>
  </div>}
  {notice&&<p className="hb-error" role="alert">{notice}</p>}
  <div className="hb-row" style={{gap:18}}>
   <button type="button" className="hb-link" disabled={busy} onClick={()=>void get()}>{busy?'Working it out…':saved?'Refresh':'Get BAK’s setup'}</button>
   {saved&&!busy&&<button type="button" className="hb-link muted" onClick={()=>onOpenChat(saved.conversation)}>Ask about it</button>}
  </div>
 </section>;
}

// ------------------------------------------------------------------ before the race
/** Home before the race: the countdown, BAK's setup for it and the prep list for the phase that matters now. */
export function RaceCountdown({account,bike,race,onEnd,onOpenChat}:{account:string;bike:Bike;race:RaceDay;onEnd:()=>void;onOpenChat:(c:string)=>void}){
 const {list}=useRacePrepList(bike);
 const phase=phaseForDaysOut(daysToGo(race.day)),before=(list??[]).filter(i=>i.phase===phase),phaseName=RACE_PHASES.find(p=>p.id===phase)?.short??'Prep';
 const n=daysToGo(race.day);
 return <>
  <section className="panel hb-block">
   <div className="hb-block-head"><span className="eyebrow"><Flag size={15} style={{color:'var(--bike-accent)'}}/>NEXT RACE</span></div>
   <div className="hb-count"><div className="hb-days"><b>{n}</b><span>{n===1?'DAY':'DAYS'}</span></div><div className="hb-track"><strong>{race.track||'Race day'}</strong><span>{longDay(race.day)}</span></div></div>
   {before.length>0&&<div className="hb-stack" style={{gap:5}}><div className="hb-row between"><span className="hb-line" style={{color:'#eef1f6',fontWeight:600}}>Prep · {phaseName}</span><span className="hb-line">{before.length} items · checked off in the phone app</span></div><Progress done={0} total={before.length}/></div>}
  </section>
  <RaceSetupCard account={account} bike={bike} track={race.track} day={race.day} onOpenChat={onOpenChat}/>
  <button type="button" className="hb-link muted" style={{alignSelf:'flex-start'}} onClick={onEnd}>Cancel this race</button>
 </>;
}

// ------------------------------------------------------------------ the day itself
const config=(b:Bike,k:string)=>{const v=b.configuration?.[k];return v==null||v===''?'':String(v);};
/** The race-day Home: today's setup, what is on the bike, quick asks, a fast change log and today's entries. */
export function RaceDayHome({bike,account,track,onEnd,onAsk,onQuick,onOpenChat}:{bike:Bike;account:string;track:string;onEnd:()=>void;onAsk:(text:string)=>void;onQuick:(text:string)=>void;onOpenChat:(c:string)=>void}){
 const [logs,setLogs]=useState<SetupLog[]>([]),[moto,setMoto]=useState('Moto 1'),[what,setWhat]=useState(''),[detail,setDetail]=useState(''),[result,setResult]=useState<SetupResult>('not_tested'),[note,setNote]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[loadError,setLoadError]=useState('');
 async function load(){try{const all=await api<SetupLog[]>(`/setup-logs?bike_id=${bike.id}`);setLogs(all.filter(l=>dayOf(new Date(l.recorded_at))===today()));setLoadError('');}catch(e){setLoadError('Today’s entries could not load: '+errorText(e));}}
 useEffect(()=>{void load();},[bike.id]);
 const setup:[string,string][]=[['Fork comp',config(bike,'fork_compression')],['Fork reb',config(bike,'fork_rebound')],['Shock comp',config(bike,'shock_compression')],['Shock reb',config(bike,'shock_rebound')],['Race sag',config(bike,'rider_sag_mm')?config(bike,'rider_sag_mm')+' mm':''],['Tires',config(bike,'tire_pressures')]];
 const known=setup.filter(([,v])=>v);
 async function log(){
  if(busy)return;if(!what){setNotice('Pick what you changed.');return;}
  setBusy(true);setNotice('');
  try{
   const settings:Record<string,string>={};for(const k of ['fork_compression','fork_rebound','shock_rebound','rider_sag_mm','fork_height_mm']){const v=config(bike,k);if(v)settings[k]=v.slice(0,200);}
   const body={bike_id:bike.id,recorded_at:new Date().toISOString(),track:track.slice(0,120),conditions:`Race day · ${moto}`.slice(0,200),engine_hours:bike.engine_hours??null,settings,change_made:`${what}${detail.trim()?': '+detail.trim():''}`.slice(0,1000),result,notes:note.trim().slice(0,4000)};
   await api<SetupLog>('/setup-logs','POST',body);
   setWhat('');setDetail('');setNote('');setResult('not_tested');await load();
  }catch(e){setNotice('The change could not be saved: '+errorText(e));}finally{setBusy(false);}
 }
 const tone=(r:SetupResult)=>r==='better'?' hb-good':r==='worse'?' hb-bad':'';
 return <>
  <div className="hb-race-head">
   <span className="eyebrow"><i className="hb-mark" aria-hidden="true" style={{width:22}}/>RACE DAY · {new Date().toLocaleDateString([],{weekday:'long',month:'short',day:'numeric'})}</span>
   <h2 className="hb-title big">{track||'Track day'}</h2>
   <p className="hb-line">{bike.model_year} {bike.manufacturer} {bike.model}{bike.engine_hours!=null?` · ${bike.engine_hours} h`:''}</p>
  </div>
  <RaceSetupCard account={account} bike={bike} track={track} day={today()} onOpenChat={onOpenChat}/>
  <section className="panel hb-block"><BlockHead title="ON YOUR BIKE NOW"/>
   {known.length?<div className="hb-now">{known.map(([k,v])=><div key={k}><span>{k}</span><b>{v}</b></div>)}</div>:<p className="hb-copy">Your clickers, sag and tire pressures show here once they’re in Garage › Edit.</p>}
  </section>
  <section className="panel hb-block"><div className="hb-block-head"><span className="eyebrow"><Zap size={15} style={{color:'var(--bike-accent)'}}/>QUICK ASK</span></div>
   <p className="hb-copy" style={{fontSize:13.5}}>Tap what the bike did. BAK answers in race mode: the one change to make, short and fast.</p>
   <div className="hb-chips">{QUICK.map(q=><Chip key={q} onClick={()=>onQuick(quickAskText(track,q))}>{q}</Chip>)}</div>
  </section>
  <section className="panel hb-block"><BlockHead title="LOG A CHANGE"/>
   <div className="hb-chips">{MOTOS.map(m=><Chip key={m} on={moto===m} onClick={()=>setMoto(m)}>{m}</Chip>)}</div>
   <p className="hb-field-label">What did you change?</p>
   <div className="hb-chips">{CHANGES.map(c=><Chip key={c} on={what===c} onClick={()=>setWhat(what===c?'':c)}>{c}</Chip>)}</div>
   <input className="hb-input" value={detail} maxLength={200} onChange={e=>setDetail(e.target.value)} placeholder="e.g. 2 clicks softer, or 13 psi" aria-label="Detail of the change"/>
   <p className="hb-field-label">How did it ride?</p>
   <div className="hb-chips">{(['better','no_change','worse','not_tested'] as SetupResult[]).map(r=><Chip key={r} on={result===r} onClick={()=>setResult(r)}>{SETUP_RESULT_LABELS[r]}</Chip>)}</div>
   <textarea className="hb-input" value={note} maxLength={500} onChange={e=>setNote(e.target.value)} placeholder="Note (optional): ruts got deeper, front pushed in turn 3…" aria-label="Note"/>
   {notice&&<p className="hb-error" role="alert">{notice}</p>}
   <button type="button" className="button" disabled={busy} onClick={()=>void log()}>{busy?'Saving…':'Save to setup log'}</button>
  </section>
  {loadError&&<p className="hb-error" role="alert">{loadError}</p>}
  {logs.length>0&&<section className="panel hb-block"><BlockHead title="TODAY"/>
   {logs.map(l=><div key={l.id} className="hb-today-entry"><strong>{l.change_made}</strong><span>{timeOf(l.recorded_at)} · {l.conditions.replace('Race day · ','')} · <b className={tone(l.result)}>{SETUP_RESULT_LABELS[l.result]}</b>{l.notes?` · ${l.notes}`:''}</span></div>)}
   <button type="button" className="hb-link" onClick={()=>onAsk(tryNextText(track,logs))}>Ask BAK what to try next</button>
  </section>}
  <button type="button" className="hb-link muted hb-center" onClick={onEnd}>End race day</button>
 </>;
}

// ------------------------------------------------------------------ starting a race
/** Starts race day: shows the bike it's for (switchable) and asks which track, with one-tap picks from the events the rider
 *  is going to and their recent setup-log tracks, and a search over BAK's tracks (kept on this browser for the next time). */
export function RaceDayStart({bike,bikes,onSwitch,onStart,onClose}:{bike:Bike;bikes:Bike[];onSwitch:(id:string)=>void;onStart:(track:string,day:string)=>void;onClose:()=>void}){
 const [day,setDay]=useState(today()),[dir,setDir]=useState<KnownTrack[]>(()=>readLocal<KnownTrack[]>('device','track-directory',[])),[track,setTrack]=useState(''),[picks,setPicks]=useState<string[]>([]),[choosing,setChoosing]=useState(false),[notice,setNotice]=useState(''),[picksNote,setPicksNote]=useState('');
 useEffect(()=>{let live=true;
  let failed='';const miss=(e:unknown)=>{failed=errorText(e);};
  Promise.all([api<SetupLog[]>(`/setup-logs?bike_id=${bike.id}`).catch(e=>{miss(e);return [] as SetupLog[];}),api<RideEvent[]>('/events?scope=upcoming').catch(e=>{miss(e);return [] as RideEvent[];})]).then(([logs,events])=>{
   if(live&&failed)setPicksNote('Your recent tracks could not load: '+failed);
   const soon=events.filter(e=>!e.canceled_at&&(e.my_rsvp==='going'||e.mine)&&Date.parse(e.starts_at)-Date.now()<30*864e5).map(e=>e.location_name);
   if(live)setPicks(trackPicks(soon,logs.map(l=>l.track)));});
  return()=>{live=false;};},[bike.id]);
 useEffect(()=>{let live=true;api<KnownTrack[]>('/tracks').then(r=>{if(live&&Array.isArray(r)&&r.length){setDir(r);writeLocal('device','track-directory',r);}}).catch(e=>{if(live&&!dir.length)setNotice('BAK’s track list could not load: '+errorText(e)+' You can still type the track’s name.');});return()=>{live=false;};},[]);
 const known=knownTrack(dir,track),suggestions=trackSuggestions(dir,track);
 const name=(b:Bike)=>b.nickname||`${b.model_year} ${b.manufacturer} ${b.model}`;
 const minDay=today();
 return <Sheet title="Race day" onClose={onClose} closeLabel="Cancel">
  <p className="hb-copy">Pick the track and the day. BAK works out a starting setup for that track and the forecast, and Home counts down to it. On the day, Home becomes your track-day screen: quick ask, a change log and today’s entries. It ends by itself the day after.</p>
  <div className="hb-stack" style={{gap:8}}>
   <p className="hb-field-label">Bike</p>
   <div className="hb-row"><span className="hb-grow hb-strong" style={{fontSize:18}}>{name(bike)}</span>{bikes.length>1&&<button type="button" className="hb-link" onClick={()=>setChoosing(!choosing)}>{choosing?'Close':'Change'}</button>}</div>
   {choosing&&<div className="hb-suggest">{bikes.filter(b=>b.id!==bike.id).map(b=><button type="button" key={b.id} onClick={()=>{onSwitch(b.id);setChoosing(false);}}><span>{name(b)}</span></button>)}</div>}
  </div>
  <div className="hb-stack" style={{gap:8}}>
   <p className="hb-field-label">Track</p>
   {picks.length>0&&<div className="hb-chips">{picks.map(t=><Chip key={t} on={track===t} onClick={()=>setTrack(track===t?'':t)}>{t}</Chip>)}</div>}
   <input className="hb-input line" value={track} maxLength={120} autoComplete="off" autoCapitalize="words" onChange={e=>setTrack(e.target.value)} placeholder={picks.length?'Or search BAK’s tracks':'Search tracks, e.g. Dade City'} aria-label="Track"/>
   {suggestions.length>0&&<div className="hb-suggest">{suggestions.map(t=><button type="button" key={t.name} onClick={()=>setTrack(t.name)} aria-label={`${t.name}${t.weather?', forecast available':''}`}><span>{t.name}<small>{[t.city,t.state].filter(Boolean).join(', ')}</small></span>{t.weather&&<em>Forecast</em>}</button>)}</div>}
   <p className={'hb-note'+(known?.weather?' ok':'')}>{known?(known.weather?'BAK knows this track and can use the forecast for it.':'BAK knows this track. No forecast for it yet.'):track.trim()?'Not one of BAK’s tracks yet: the setup works from your bike and what you tell it, without a forecast.':'Optional. Pick one of BAK’s tracks for its dirt, layout and the forecast. It also goes on each change you log.'}</p>
   {(notice||picksNote)&&<p className="hb-error" role="alert">{[picksNote,notice].filter(Boolean).join(' ')}</p>}
  </div>
  <label className="hb-field"><span className="hb-field-label">Race day</span><input className="hb-input" type="date" value={day} min={minDay} onChange={e=>setDay(e.target.value&&e.target.value>=minDay?e.target.value:minDay)}/></label>
  <button type="button" className="button" onClick={()=>{onStart(track,day);setTrack('');}}>{day===today()?'Start race day':'Set up this race'}</button>
  <p className="hb-note">Race day is saved on this device, not your account. The changes you log go to your setup log.</p>
 </Sheet>;
}
