// Phone notifications (expo-notifications, a native module: it ships with the next store build).
// The rider is never asked at first launch. BAK asks the first time they turn a reminder on: a "Remind me when it's due
// next" hour on a service, going or interested on an event, or a switch in Account › Notifications. Once allowed, the
// phone's Expo push token is saved to the account (one row per phone) with the phone's time zone, on every start.
// Tapping a notification opens its screen through the same bakmx:// links Siri uses (appLinks.ts).
import {Platform} from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import {api} from './api';

let lastToken:string|null=null;
const zone=()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone||undefined;}catch{return undefined;}};
const projectId=()=>(Constants.expoConfig?.extra as {eas?:{projectId?:string}}|undefined)?.eas?.projectId??Constants.easConfig?.projectId;

/** Shown while the app is open, too (a banner and the list), with the sound. */
export function configureNotifications(){
 try{
  Notifications.setNotificationHandler({handleNotification:async()=>({shouldShowBanner:true,shouldShowList:true,shouldPlaySound:true,shouldSetBadge:false})});
  if(Platform.OS==='android')void Notifications.setNotificationChannelAsync('default',{name:'BAK MX',importance:Notifications.AndroidImportance.HIGH}).catch(()=>{});
 }catch{/* a build without the native module: notifications stay off */}
}

async function register():Promise<boolean>{
 const id=projectId();if(!id)return false;
 const {data:token}=await Notifications.getExpoPushTokenAsync({projectId:id});
 if(!token)return false;
 await api('/api/push-devices','PUT',{token,platform:Platform.OS==='android'?'android':'ios',time_zone:zone(),app_version:Constants.expoConfig?.version});
 lastToken=token;return true;
}
/** On start: if the rider already allowed notifications, keep this phone's token and time zone current. Never asks. */
export async function registerIfAllowed():Promise<void>{
 try{const p=await Notifications.getPermissionsAsync();if(p.granted)await register();}catch{/* simulator, no network or no native module */}
}
/** After the rider turns a reminder on. Asks once (the system only shows its prompt while undecided), then registers.
 *  Returns false when notifications are off for this phone, so the caller can say where to turn them on. */
export async function enablePushAfterReminder():Promise<boolean>{
 try{
  let p=await Notifications.getPermissionsAsync();
  if(!p.granted&&p.canAskAgain)p=await Notifications.requestPermissionsAsync();
  if(!p.granted)return false;
  return await register();
 }catch{return false;}
}
/** On sign out: this phone stops getting the account's notifications (marked inactive on the server). */
export async function unregisterPush():Promise<void>{
 const token=lastToken;lastToken=null;if(!token)return;
 try{await api('/api/push-devices?token='+encodeURIComponent(token),'DELETE');}catch{/* signed out already; the server stops on DeviceNotRegistered */}
}
/** Calls back with the bakmx:// link of a tapped notification, including the one that opened the app. */
export function watchNotificationTaps(open:(url:string)=>void):()=>void{
 const seen=new Set<string>();
 const handle=(r:Notifications.NotificationResponse|null|undefined)=>{
  if(!r)return;const id=r.notification.request.identifier;if(seen.has(id))return;seen.add(id);
  const data=r.notification.request.content.data as {url?:unknown;notification_id?:unknown}|undefined;
  if(typeof data?.url==='string')open(data.url);
  if(typeof data?.notification_id==='string')void api('/api/notifications','PATCH',{ids:[data.notification_id]}).catch(()=>{});
 };
 try{
  handle(Notifications.getLastNotificationResponse());
  const sub=Notifications.addNotificationResponseReceivedListener(handle);
  return()=>sub.remove();
 }catch{return()=>{};}
}
