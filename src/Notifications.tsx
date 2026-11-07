// The bell in the web header: the same notification records the phone gets as pushes (new messages, comments on your
// posts, event reminders, service due), with an unread count. No web push; the list refreshes while the tab is open.
// Also Account › Notifications: the on/off for each kind, shared with the phone.
import {useCallback,useEffect,useRef,useState} from 'react';
import {Bell,CalendarDays,MessageCircle,MessagesSquare,Wrench} from 'lucide-react';
import {api} from './client';
import {parseNotificationLink,type NotificationLink} from '../shared/notification-links';
import type {NotificationKind,NotificationRecord,NotificationSettings} from '../shared/notifications';
import './notifications.css';

const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';
const browserZone=()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone||'';}catch{return '';}};
const ago=(iso:string)=>{const s=(Date.now()-Date.parse(iso))/1000;if(!Number.isFinite(s))return '';if(s<60)return 'now';if(s<3600)return `${Math.floor(s/60)} min`;if(s<86400)return `${Math.floor(s/3600)} h`;const d=new Date(iso);return d.toLocaleDateString(undefined,{month:'short',day:'numeric'});};
const ICONS:Record<NotificationKind,typeof Bell>={message:MessageCircle,reply:MessagesSquare,event_reminder:CalendarDays,service_due:Wrench};
type List={items:NotificationRecord[];unread:number;time_zone:string|null};

/** The bell and its list. onOpen takes the notification's link (see shared/notification-links.ts) to the right page. */
export function NotificationBell({onOpen}:{onOpen:(link:NotificationLink)=>void}){
 const [list,setList]=useState<List|null>(null),[open,setOpen]=useState(false),[error,setError]=useState('');
 const box=useRef<HTMLDivElement>(null),zoneSent=useRef(false);
 const load=useCallback(async()=>{try{const data=await api<List>('/notifications');setList(data);setError('');
  // Event reminders go out in the rider's own time zone; the first load tells the server this browser's zone if it has none.
  const tz=browserZone();if(!zoneSent.current&&tz&&!data.time_zone){zoneSent.current=true;void api('/notification-settings','PUT',{time_zone:tz}).catch(()=>{});}
 }catch(e){setError(errorText(e));}},[]);
 useEffect(()=>{void load();const t=setInterval(()=>{if(document.visibilityState==='visible')void load();},60_000);const f=()=>{if(document.visibilityState==='visible')void load();};document.addEventListener('visibilitychange',f);return()=>{clearInterval(t);document.removeEventListener('visibilitychange',f);};},[load]);
 useEffect(()=>{if(!open)return;const close=(e:MouseEvent|KeyboardEvent)=>{if(e instanceof KeyboardEvent?e.key==='Escape':!box.current?.contains(e.target as Node))setOpen(false);};document.addEventListener('mousedown',close);document.addEventListener('keydown',close);return()=>{document.removeEventListener('mousedown',close);document.removeEventListener('keydown',close);};},[open]);
 async function markRead(ids?:string[]){
  setList(l=>l&&{...l,unread:ids?Math.max(0,l.unread-l.items.filter(i=>ids.includes(i.id)&&!i.read_at).length):0,items:l.items.map(i=>!ids||ids.includes(i.id)?{...i,read_at:i.read_at??new Date().toISOString()}:i)});
  try{await api('/notifications','PATCH',ids?{ids}:{all:true});}catch(e){setError(errorText(e));}
 }
 function pick(n:NotificationRecord){if(!n.read_at)void markRead([n.id]);setOpen(false);const link=parseNotificationLink(n.link);if(link)onOpen(link);}
 const unread=list?.unread??0;
 return <div className="nb" ref={box}>
  <button type="button" className="nb-bell" aria-label={unread?`Notifications, ${unread} unread`:'Notifications'} aria-expanded={open} aria-haspopup="true" onClick={()=>{setOpen(!open);if(!open)void load();}}>
   <Bell size={18}/>{unread>0&&<span className="nb-count" aria-hidden="true">{unread>99?'99+':unread}</span>}
  </button>
  {open&&<div className="nb-panel" role="region" aria-label="Notifications">
   <div className="nb-head"><b>Notifications</b>{unread>0&&<button type="button" className="nb-mark" onClick={()=>void markRead()}>Mark all read</button>}</div>
   {error&&<p className="nb-empty" role="alert">{error}</p>}
   {!error&&list===null&&<p className="nb-empty" role="status">Loading…</p>}
   {list&&!list.items.length&&<p className="nb-empty">Nothing yet. New messages, comments on your posts, event reminders and service due show here.</p>}
   {list&&list.items.length>0&&<ul className="nb-list">{list.items.map(n=>{const Icon=ICONS[n.kind]??Bell;return <li key={n.id}>
    <button type="button" className={'nb-item'+(n.read_at?'':' unread')} onClick={()=>pick(n)}>
     <span className="nb-icon"><Icon size={16}/></span>
     <span className="nb-text"><b>{n.title}</b>{n.body&&<span>{n.body}</span>}</span>
     <time dateTime={n.created_at}>{ago(n.created_at)}</time>
    </button></li>;})}</ul>}
  </div>}
 </div>;
}

type Settings=NotificationSettings&{service_due_follows_reminders:boolean;time_zone:string|null};
const ROWS:[keyof NotificationSettings,string,string][]=[
 ['messages','New messages','When a rider sends you a direct message'],
 ['replies','Comments on your posts','When someone comments on something you posted'],
 ['events','Event reminders','The evening before and the morning of events you’re going to or interested in'],
 ['service_due','Service due','When a job is due within 3 hours or overdue, by the hours on your bike. At most once a week per job'],
];
/** Account › Notifications. The same switches as on the phone; changes apply to both. */
export function NotificationSettingsPanel(){
 const [s,setS]=useState<Settings|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{api<Settings>('/notification-settings').then(setS).catch(e=>setError(errorText(e)));},[]);
 async function save(key:keyof NotificationSettings,value:boolean){
  if(!s||busy)return;const before=s;setS({...s,[key]:value});setBusy(true);setError('');
  const tz=browserZone();
  try{setS(await api<Settings>('/notification-settings','PUT',{[key]:value,...(tz&&!s.time_zone?{time_zone:tz}:{})}));}catch(e){setS(before);setError(errorText(e));}finally{setBusy(false);}
 }
 return <section className="panel"><span className="eyebrow">NOTIFICATIONS</span>
  <p className="subtle">Sent to the BAK MX app on your phone and listed under the bell here.</p>
  {!s&&!error&&<p className="subtle" role="status">Loading…</p>}
  {s&&<div className="nb-settings">{ROWS.map(([key,title,detail])=><label key={key} className="nb-setting">
   <span><b>{title}</b><small>{detail}{key==='service_due'&&s.service_due_follows_reminders?'. Turns on when you set “Remind me when it’s due next” on a service.':''}</small></span>
   <input type="checkbox" role="switch" checked={s[key]} disabled={busy} onChange={e=>void save(key,e.target.checked)} aria-label={title}/>
  </label>)}</div>}
  {error&&<div className="error" role="alert">{error}</div>}
 </section>;
}
