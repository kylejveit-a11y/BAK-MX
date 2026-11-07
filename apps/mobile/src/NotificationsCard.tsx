// Account › Notifications: on/off for each kind, saved to the account (the web shows the same switches). Turning one on
// is the moment BAK asks the phone for permission, never at first launch.
import {useEffect,useState} from 'react';
import {ActivityIndicator,Linking,Switch,Text,View} from 'react-native';
import {api} from './api';
import {colors,Notice} from './ui';
import {enablePushAfterReminder} from './push';
import type {NotificationSettings} from '../../../shared/notifications';

type Settings=NotificationSettings&{service_due_follows_reminders:boolean;time_zone:string|null};
const ROWS:[keyof NotificationSettings,string,string][]=[
 ['messages','New messages','When a rider sends you a message'],
 ['replies','Comments on your posts','When someone comments on your post'],
 ['events','Event reminders','The evening before and the morning of events you’re going to or interested in'],
 ['service_due','Service due','Within 3 hours or overdue, by the hours on your bike. Once a week per job at most'],
];
const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';
const zone=()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone||undefined;}catch{return undefined;}};

export function NotificationsCard(){
 const [s,setS]=useState<Settings|null>(null),[notice,setNotice]=useState(''),[off,setOff]=useState(false),[busy,setBusy]=useState(false);
 useEffect(()=>{api<Settings>('/api/notification-settings').then(setS).catch(e=>setNotice(errorText(e)));},[]);
 async function save(key:keyof NotificationSettings,value:boolean){
  if(!s||busy)return;const before=s;setS({...s,[key]:value});setBusy(true);setNotice('');
  try{setS(await api<Settings>('/api/notification-settings','PUT',{[key]:value,...(!s.time_zone&&zone()?{time_zone:zone()}:{})}));}
  catch(e){setS(before);setNotice(errorText(e));setBusy(false);return;}
  setBusy(false);
  if(value)setOff(!(await enablePushAfterReminder()));
 }
 return <View style={{gap:14}}>
  {!s&&!notice&&<ActivityIndicator color={colors.accent}/>}
  {s&&ROWS.map(([key,title,detail])=><View key={key} style={{flexDirection:'row',alignItems:'center',gap:12}}>
   <View style={{flex:1,gap:2}}><Text style={{color:colors.text,fontSize:15.5,fontWeight:'600'}}>{title}</Text><Text style={{color:colors.muted,fontSize:13}}>{detail}{key==='service_due'&&s.service_due_follows_reminders?'. Turns on when you set “Remind me when it’s due next” on a service.':''}</Text></View>
   <Switch value={s[key]} disabled={busy} onValueChange={v=>void save(key,v)} trackColor={{true:colors.primary,false:'#2a2f39'}} accessibilityLabel={title}/>
  </View>)}
  {off&&<View style={{gap:6}}><Text style={{color:colors.muted,fontSize:13,lineHeight:18}}>Notifications are off for BAK MX on this phone. Turn them on in Settings to get these.</Text><Text accessibilityRole="button" onPress={()=>void Linking.openSettings().catch(()=>{})} style={{color:colors.text,fontWeight:'700',fontSize:14}}>Open Settings</Text></View>}
  <Notice text={notice}/>
 </View>;
}
