// Links from Siri, Shortcuts, Spotlight and the Action button (bakmx://ask, snap, setup, service).
// The native actions leave the link in UserDefaults; Settings reads it here so a cold start doesn't lose it.
import {Platform,Settings} from 'react-native';

import {pendingFrom,PENDING_LINK_KEY as KEY} from './appLinkParse';
export {parseAppLink,pendingFrom,type AppLink} from './appLinkParse';

type SettingsApi={get(key:string):unknown;set(v:Record<string,unknown>):void;watchKeys(k:string,cb:()=>void):number;clearWatch(id:number):void};
function settings():SettingsApi|null{
 if(Platform.OS!=='ios')return null;
 return Settings as unknown as SettingsApi;
}
/** Takes the pending link (once) and clears it. */
export function takePendingLink():string|null{
 const s=settings();if(!s)return null;
 let value:unknown;try{value=s.get(KEY);}catch{return null;}
 if(value==null)return null;
 try{s.set({[KEY]:null});}catch{}
 return pendingFrom(value);
}
/** Calls back whenever a new pending link arrives while the app is running. */
export function watchPendingLinks(cb:()=>void):()=>void{
 const s=settings();if(!s)return()=>{};
 try{const id=s.watchKeys(KEY,cb);return()=>{try{s.clearWatch(id);}catch{}};}catch{return()=>{};}
}
/** Tokens of links already acted on, so a screen revisit or remount never repeats one. */
export const usedLinkTokens=new Set<string>();
