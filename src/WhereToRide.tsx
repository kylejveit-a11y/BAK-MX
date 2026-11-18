// Where to Ride on the website: the same list, place page and trail map as the app, from the same data and the same
// words (shared/where-to-ride.ts). The trail map draws the Forest Service lines on a plain background; tap a line or a
// trail to pick it out. Saved places stay in this browser. Riders start a practice day from the app or the Home page.
import {useEffect,useMemo,useState} from 'react';
import {ArrowLeft,ArrowUpRight,CalendarDays,ChevronRight,Heart,LocateFixed,MapPin,MessageSquare,Phone,Search,X} from 'lucide-react';
import {api} from './client';
import {WHERE_COPY as W,WIDTHS,byDistance,directionsLink,eventsAt,filterPlaces,fmtDay,fmtMiles,forecastLine,mapSeason,onxLink,partialNote,placeSummary,statesOf,toggleSaved,trailName,widthColor,widthLabel,type DayForecast,type PlaceDetail,type PlaceKind,type PlaceRow,type PlaceWeather,type TrailLine} from '../shared/where-to-ride';
import './where.css';

const SAVED_KEY='bakmx:where-saved';
const readSaved=():string[]=>{try{const v=JSON.parse(localStorage.getItem(SAVED_KEY)||'[]');return Array.isArray(v)?v.filter(x=>typeof x==='string'):[];}catch{return [];}};
function useSaved():[string[],(id:string)=>void]{
 const [saved,setSaved]=useState<string[]>(readSaved);
 return [saved,id=>setSaved(s=>{const next=toggleSaved(s,id);try{localStorage.setItem(SAVED_KEY,JSON.stringify(next));}catch{}return next;})];
}
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const errorText=(e:unknown)=>e instanceof Error?e.message:'Could not load this. Try again.';

export function WhereToRide({signedIn,onSignIn,onAsk}:{signedIn:boolean;onSignIn:()=>void;onAsk:(text:string)=>void}){
 const [view,setView]=useState<{id:string;map:boolean;miles:number|null}|null>(null);
 useEffect(()=>{window.scrollTo({top:0});},[view?.id,view?.map]);
 if(!signedIn)return <section className="panel"><div className="empty"><div className="empty-icon"><MapPin size={27}/></div><h3>Tracks and trails, in one list.</h3><p>Sign in to see what you can ride at each place, the forecast and Forest Service trail maps.</p><button type="button" className="button" onClick={onSignIn}>Sign in or create an account</button></div></section>;
 if(view?.map)return <TrailMapView id={view.id} totalMiles={view.miles} onBack={()=>setView({...view,map:false})}/>;
 if(view)return <PlaceView id={view.id} onBack={()=>setView(null)} onMap={miles=>setView({id:view.id,map:true,miles})} onAsk={onAsk}/>;
 return <PlaceList onOpen={id=>setView({id,map:false,miles:null})}/>;
}

function PlaceList({onOpen}:{onOpen:(id:string)=>void}){
 const [rows,setRows]=useState<PlaceRow[]|null>(null),[error,setError]=useState(''),[saved]=useSaved();
 const [query,setQuery]=useState(''),[kind,setKind]=useState<'all'|PlaceKind|'saved'>('all'),[state,setState]=useState('');
 const [from,setFrom]=useState<{lat:number;lng:number}|null>(null),[locNote,setLocNote]=useState('');
 useEffect(()=>{let live=true;api<PlaceRow[]>('/where-to-ride').then(r=>{if(live)setRows(r);}).catch(e=>{if(live)setError(errorText(e));});return()=>{live=false;};},[]);
 const shown=useMemo(()=>{if(!rows)return [];
  const base=kind==='saved'?filterPlaces(rows.filter(r=>saved.includes(r.id)),{query,state}):filterPlaces(rows,{query,kind,state});
  return byDistance(base,from);},[rows,query,kind,state,from,saved]);
 function nearMe(){
  if(from){setFrom(null);setLocNote('');return;}
  if(!navigator.geolocation){setLocNote('This browser can’t share a location.');return;}
  navigator.geolocation.getCurrentPosition(p=>{setFrom({lat:p.coords.latitude,lng:p.coords.longitude});setLocNote('');},()=>setLocNote('Location is off for this site. Allow it in your browser to sort by distance.'),{maximumAge:600000,timeout:15000});
 }
 const chips:[typeof kind,string][]=[['all',W.filters.all],['track',W.filters.track],['riding_area',W.filters.riding_area],['saved',saved.length?`${W.saved} (${saved.length})`:W.saved]];
 return <div className="wr">
  <div className="wr-tools">
   <label className="wr-search"><Search size={16} aria-hidden="true"/><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={W.search} aria-label={W.search}/></label>
   <select value={state} onChange={e=>setState(e.target.value)} aria-label="State"><option value="">{W.allStates}</option>{statesOf(rows??[]).map(s=><option key={s} value={s}>{s}</option>)}</select>
   <button type="button" className={'wr-chip'+(from?' on':'')} aria-pressed={!!from} onClick={nearMe}><LocateFixed size={15}/>Near me</button>
  </div>
  <div className="wr-chips" role="group" aria-label="Show">{chips.map(([id,label])=><button key={id} type="button" className={'wr-chip'+(kind===id?' on':'')} aria-pressed={kind===id} onClick={()=>setKind(id)}>{label}</button>)}</div>
  {locNote&&<p className="subtle" role="status">{locNote}</p>}
  {error&&<div className="error" role="alert">{error}</div>}
  {!rows&&!error&&<p className="subtle" role="status">Loading places…</p>}
  {rows&&!shown.length&&<p className="subtle">{kind==='saved'&&!saved.length?W.savedNone:W.none}</p>}
  {!!shown.length&&<ul className="wr-list">{shown.map(p=><li key={p.id}><button type="button" onClick={()=>onOpen(p.id)}>
   <span className="wr-row-main"><b>{p.name}{saved.includes(p.id)&&<Heart size={13} className="wr-heart" aria-label="Saved"/>}</b>
    <small>{placeSummary(p)}</small>
    <small className="wr-where">{[p.city?`${p.city}, ${p.state}`:p.state,p.miles!=null?`${Math.round(p.miles)} mi away`:''].filter(Boolean).join(' · ')}</small></span>
   {!!p.widths.length&&<span className="wr-bars" aria-hidden="true">{p.widths.map(w=><i key={w} style={{background:widthColor(w)}}/>)}</span>}
   <ChevronRight size={17} aria-hidden="true"/></button></li>)}</ul>}
 </div>;
}

function Fact({k,v}:{k:string;v:string|null|undefined}){return <div className="wr-fact"><span>{k}</span><p className={v?'':'unknown'}>{v||W.notConfirmed}</p></div>;}
const Back=({label,onClick}:{label:string;onClick:()=>void})=><button type="button" className="wr-back" onClick={onClick}><ArrowLeft size={16}/>{label}</button>;

function PlaceView({id,onBack,onMap,onAsk}:{id:string;onBack:()=>void;onMap:(miles:number|null)=>void;onAsk:(text:string)=>void}){
 const [p,setP]=useState<PlaceDetail|null>(null),[error,setError]=useState(''),[saved,toggleSave]=useSaved();
 useEffect(()=>{let live=true;setP(null);setError('');api<PlaceDetail>('/riding-area?id='+encodeURIComponent(id)).then(r=>{if(live)setP(r);}).catch(e=>{if(live)setError(errorText(e));});return()=>{live=false;};},[id]);
 if(!p)return <div className="wr"><Back label={W.title} onClick={onBack}/>{error?<div className="error" role="alert">{error}</div>:<p className="subtle" role="status">Loading…</p>}</div>;
 const a=p.area,ride=p.kind==='riding_area',privateLand=a?a.land==='private':p.access==='members'||p.access==='private',isSaved=saved.includes(p.id);
 const place=[a?.near??(p.city?`${p.city}, ${p.state}`:p.state),a?.managed_by].filter(Boolean).join(' · ');
 const askText=ride?`I’m riding the trails at ${p.name}. How should I set up my bike for them?`:`I’m riding ${p.name}. How should I set up my bike for this track?`;
 const official=a?.official_url??p.website,phone=a?.phone??p.phone;
 const pass=a?.pass?[a.pass.day&&`Visit: ${a.pass.day}`,a.pass.year&&`Annual: ${a.pass.year}`,a.pass.how].filter(Boolean).join('\n')||null:null;
 return <div className="wr">
  <Back label={W.title} onClick={onBack}/>
  <header className="wr-head">
   <div><h2>{p.name}</h2>{!!a?.name_detail&&<p className="wr-detail">{a.name_detail}</p>}<p className="wr-summary">{placeSummary(p)}</p>{!!place&&<p className="subtle">{place}</p>}</div>
   <button type="button" className={'wr-chip'+(isSaved?' on':'')} aria-pressed={isSaved} aria-label={isSaved?`Remove ${p.name} from saved`:`Save ${p.name}`} onClick={()=>toggleSave(p.id)}><Heart size={15} fill={isSaved?'currentColor':'none'}/>{isSaved?W.unsave:W.save}</button>
  </header>
  {p.status==='closed'&&<div className="notice warn">BAK has this place listed as closed. Check the official page before you go.</div>}
  {!!a?.closures&&<div className="notice warn">{a.closures}</div>}
  <div className="wr-actions">
   {p.trail_map&&<button type="button" className="button" onClick={()=>onMap(a?.trail_miles??null)}>{W.trailMap}</button>}
   <button type="button" className="button secondary" onClick={()=>onAsk(askText)}><MessageSquare size={15}/>{W.ask}</button>
  </div>
  <div className="wr-grid">
   <Weather id={p.id} has={p.lat!=null} approx={!!p.approx}/>
   {ride&&<section className="panel"><span className="eyebrow">{W.whatYouCanRide}</span>
    <ul className="wr-widths">{WIDTHS.map(w=>{const v=a?.vehicles?.[w.id];return <li key={w.id} className={v===false?'no':''}><i style={{background:w.color}} aria-hidden="true"/><span><b>{w.label}</b> <small>{w.detail}</small></span><em className={v===true?'yes':''}>{v===true?'Yes':v===false?'No':'Not confirmed'}</em></li>;})}</ul>
    <div className="wr-facts-row"><Fact k="Width limit" v={a?.width_limit_in!=null?`${a.width_limit_in} in`:null}/><Fact k="Trail" v={a?.trail_miles!=null?`${fmtMiles(a.trail_miles)} mi`:null}/></div>
   </section>}
   {!ride&&!!p.tracks_on_site.length&&<section className="panel"><span className="eyebrow">On site</span><ul className="wr-plain">{p.tracks_on_site.map(t=><li key={t}>{t}</li>)}</ul>{!!p.layout_notes&&<p className="wr-copy">{p.layout_notes}</p>}</section>}
   {(ride||a)&&<section className="panel"><span className="eyebrow">{W.knowBefore}</span>
    {privateLand&&<p className="wr-copy">{W.privateLand}</p>}
    <Fact k="Pass or fee" v={pass}/><Fact k="Season" v={a?.season}/><Fact k="Hours" v={a?.hours}/>
    {!!a?.rules?.length&&<div className="wr-fact"><span>Rules</span><ul className="wr-plain">{a.rules.map(r=><li key={r}>{r}</li>)}</ul></div>}
    {!!a?.address&&<Fact k="Address" v={a.address}/>}
   </section>}
   <EventsHere place={p}/>
  </div>
  <nav className="wr-links" aria-label="Links for this place">
   <a href={directionsLink(p,'web')} target="_blank" rel="noreferrer"><MapPin size={17}/>{W.directions}<ArrowUpRight size={15}/></a>
   {!!official&&<a href={official} target="_blank" rel="noreferrer"><ArrowUpRight size={17}/>{W.official}<ArrowUpRight size={15}/></a>}
   {!!phone&&<a href={'tel:'+phone.replace(/[^\d+]/g,'')}><Phone size={17}/>{W.call} {phone}</a>}
   {ride&&<a href={onxLink(p.state)} target="_blank" rel="noreferrer"><ArrowUpRight size={17}/>{W.onx}<ArrowUpRight size={15}/></a>}
  </nav>
  {!!a?.verified&&<footer className="wr-sources"><p>{W.checkedOn(a.verified)}</p>{a.sources.map(s=><a key={s.url} href={s.url} target="_blank" rel="noreferrer">{s.title}</a>)}</footer>}
 </div>;
}

/** Today and tomorrow from the Weather Service. Hidden with no location on file; quiet when the service doesn't answer. */
function Weather({id,has,approx}:{id:string;has:boolean;approx:boolean}){
 const [w,setW]=useState<PlaceWeather|null>(null);
 useEffect(()=>{let live=true;setW(null);if(has)api<PlaceWeather>(`/place-weather?id=${encodeURIComponent(id)}&day=${today()}`).then(r=>{if(live)setW(r);}).catch(()=>{});return()=>{live=false;};},[id,has]);
 if(!has||!w||(!w.today.available&&!w.tomorrow.available))return null;
 const Day=({label,f}:{label:string;f:DayForecast})=><div className="wr-fact"><span>{label}</span><p className={f.available?'':'unknown'}>{forecastLine(f)}</p>{f.available&&!!f.rain_days_before.length&&<small>Rain before: {f.rain_days_before.join('; ')}</small>}</div>;
 return <section className="panel"><span className="eyebrow">{W.weather}</span><Day label="Today" f={w.today}/><Day label="Tomorrow" f={w.tomorrow}/><p className="wr-note">{approx?W.weatherNoteApprox:W.weatherNote}</p></section>;
}

type EventRow={id:string;title:string;location_name:string;starts_at:string;going_count:number;canceled_at?:string|null};
/** Upcoming community events that name this place. Hidden when there are none. */
function EventsHere({place}:{place:PlaceDetail}){
 const [here,setHere]=useState<EventRow[]>([]);
 useEffect(()=>{let live=true;setHere([]);
  Promise.all([api<EventRow[]>('/events?scope=upcoming'),api<PlaceRow[]>('/where-to-ride')]).then(([ev,all])=>{if(live&&Array.isArray(ev))setHere(eventsAt(ev,place,all.map(t=>({id:t.id,name:t.name,aliases:[],city:t.city}))).slice(0,4));}).catch(()=>{});
  return()=>{live=false;};},[place.id]);
 if(!here.length)return null;
 return <section className="panel"><span className="eyebrow">{W.eventsHere}</span><ul className="wr-events">{here.map(e=><li key={e.id}><CalendarDays size={17} aria-hidden="true"/><span><b>{e.title}</b><small>{fmtDay(e.starts_at.slice(0,10))} · {e.going_count} going</small></span></li>)}</ul><p className="wr-note">RSVP in Events.</p></section>;
}

function boundsOf(lines:TrailLine[]){let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
 for(const l of lines)for(const [x,y] of l.line){if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;}return {minX,minY,maxX,maxY};}

/** The trail lines on a plain dark background, coloured by width. Each line has a wide invisible twin so it is easy to tap. */
function TrailDiagram({lines,selected,onSelect}:{lines:TrailLine[];selected:string|null;onSelect:(name:string)=>void}){
 const Wd=1000,H=640,pad=24,b=boundsOf(lines),k=Math.cos(((b.minY+b.maxY)/2)*Math.PI/180);
 const spanX=Math.max((b.maxX-b.minX)*k,1e-6),spanY=Math.max(b.maxY-b.minY,1e-6),scale=Math.min((Wd-pad*2)/spanX,(H-pad*2)/spanY);
 const ox=(Wd-spanX*scale)/2,oy=(H-spanY*scale)/2;
 const pts=(l:TrailLine)=>l.line.map(([x,y])=>`${(ox+(x-b.minX)*k*scale).toFixed(1)},${(oy+(b.maxY-y)*scale).toFixed(1)}`).join(' ');
 return <svg className="wr-map" viewBox={`0 0 ${Wd} ${H}`} role="img" aria-label="Trail map: lines coloured by trail width">
  {lines.map(l=>{const n=trailName(l),on=selected===n,p=pts(l);return <g key={l.id} onClick={()=>onSelect(n)}>
   <polyline points={p} fill="none" stroke={widthColor(l.width)} strokeOpacity={selected&&!on?0.3:1} strokeWidth={on?6:3.5} strokeLinejoin="round" strokeLinecap="round"/>
   <polyline points={p} fill="none" stroke="transparent" strokeWidth={22} style={{cursor:'pointer'}}><title>{n}</title></polyline></g>;})}
 </svg>;
}

function TrailMapView({id,totalMiles,onBack}:{id:string;totalMiles:number|null;onBack:()=>void}){
 const [data,setData]=useState<{lines:TrailLine[];map_date:string|null}|null>(null),[error,setError]=useState(''),[selected,setSelected]=useState<string|null>(null);
 useEffect(()=>{let live=true;api<{lines:TrailLine[];map_date:string|null}>('/trail-lines?id='+encodeURIComponent(id)).then(r=>{if(live)setData(r);}).catch(e=>{if(live)setError(errorText(e));});return()=>{live=false;};},[id]);
 const trails=useMemo(()=>{const m=new Map<string,{key:string;name:string;width:string;dates:string;miles:number}>();
  // one row per trail name and width (a long trail can change width by section)
  for(const l of data?.lines??[]){const name=trailName(l),key=`${name}|${l.width}`;const t=m.get(key)??{key,name,width:l.width,dates:l.dates_open,miles:0};t.miles+=l.miles??0;m.set(key,t);}
  return [...m.values()].sort((x,y)=>y.miles-x.miles);},[data]);
 const used=new Set((data?.lines??[]).map(l=>l.width));
 const pick=(n:string)=>setSelected(s=>s===n?null:n);
 const partial=data?partialNote(data.lines,totalMiles):null;
 const sel=trails.find(t=>t.name===selected);
 const meta=(t:{width:string;dates:string;miles:number})=>[widthLabel(t.width),mapSeason(t.dates),t.miles?`${fmtMiles(Math.round(t.miles*10)/10)} mi`:''].filter(Boolean).join(' · ');
 return <div className="wr">
  <Back label="Back" onClick={onBack}/>
  <h2>{W.trailMap}</h2>
  {error&&<div className="error" role="alert">{error}</div>}
  {!data&&!error&&<p className="subtle" role="status">Loading…</p>}
  {data&&!data.lines.length&&<p className="subtle">{W.noLines}</p>}
  {!!data?.lines.length&&<div className="wr-map-layout">
   <div>
    <TrailDiagram lines={data.lines} selected={selected} onSelect={pick}/>
    {sel?<p className="wr-picked"><i style={{background:widthColor(sel.width)}} aria-hidden="true"/><span><b>{sel.name}</b> <small>{meta(sel)}</small></span><button type="button" aria-label="Clear the picked trail" onClick={()=>setSelected(null)}><X size={16}/></button></p>
    :<p className="wr-note">Tap a line or a trail in the list to pick it out.</p>}
    <ul className="wr-legend">{WIDTHS.filter(w=>used.has(w.id)).map(w=><li key={w.id}><i style={{background:w.color}} aria-hidden="true"/>{w.label}</li>)}</ul>
    {!!partial&&<div className="notice">{partial}</div>}
    <p className="wr-note">{W.mapNote(data.map_date)} Lines only, no base map. Forest roads that also allow OHVs aren’t drawn.</p>
   </div>
   <section className="panel wr-trails"><span className="eyebrow">Trails</span>
    <ul>{trails.map(t=><li key={t.key}><button type="button" aria-pressed={selected===t.name} className={selected===t.name?'on':''} onClick={()=>pick(t.name)}><i style={{background:widthColor(t.width)}} aria-hidden="true"/><span><b>{t.name}</b><small>{meta(t)}</small></span></button></li>)}</ul>
   </section>
  </div>}
 </div>;
}
