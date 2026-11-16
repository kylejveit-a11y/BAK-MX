// Ride safety: the words, times and rules shared by the phone, the server and the public page.
// A ride has a "back by" time the rider picks. Nothing is ever sent to their contacts before back by + a 30-minute cushion
// (alert_at); before that the phone reminds them three times. After alert_at the server emails the contacts once, and an
// all-clear follows as soon as the rider checks in. The live link shows the last spot while the ride is on.

/** Back-by choices on the start screen, in minutes from now. A custom time is allowed up to MAX_BACK_BY_MIN. */
export const BACK_BY_CHOICES=[60,120,180,240,360] as const;
export const SAFETY={graceMin:30,minBackByMin:15,maxBackByMin:480,watchAfterAlertMin:240,extendChoicesMin:[30,60] as const,
 maxExtendMin:240,maxContacts:2,perDay:10,stalePositionMin:20} as const;
/** Phone reminders, in minutes after back by: "Back yet?", a second nudge, and the last warning 5 minutes before the alert. */
export const REMINDERS_AFTER_BACK_BY=[0,15,25] as const;

/** The times of a ride started now that should be back by `backByMin` from now. The link stays viewable 4 hours past the
 *  alert so contacts can still see the last spot; it never runs past 13 hours (the table's limit). */
export function rideTimes(now:number,backByMin:number){
 const backBy=now+backByMin*60e3,alertAt=backBy+SAFETY.graceMin*60e3;
 const expires=Math.min(now+13*3600e3-60e3,alertAt+SAFETY.watchAfterAlertMin*60e3);
 return {back_by:new Date(backBy).toISOString(),alert_at:new Date(alertAt).toISOString(),expires_at:new Date(expires).toISOString()};
}
/** Adding time: from the later of now and the current back-by. Bounded so a ride never runs past the link's limit. */
export function extendedTimes(createdAt:number,backBy:number,now:number,addMin:number){
 const base=Math.max(backBy,now),nb=Math.min(base+addMin*60e3,createdAt+(SAFETY.maxBackByMin+60)*60e3);
 const alertAt=nb+SAFETY.graceMin*60e3,expires=Math.min(createdAt+13*3600e3-60e3,alertAt+SAFETY.watchAfterAlertMin*60e3);
 return {back_by:new Date(nb).toISOString(),alert_at:new Date(alertAt).toISOString(),expires_at:new Date(expires).toISOString()};
}

/** Clock time in the rider's own time zone (the server runs in UTC; the phone sends its zone when a ride starts). */
export const time=(iso:string,tz?:string)=>{try{return new Date(iso).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',timeZone:tz||undefined,timeZoneName:tz?'short':undefined});}catch{return new Date(iso).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});}};
export const SHARE_COPY={
 start:'Ride safety',startSub:'Back-by timer and a live link',
 title:'Ride safety',
 explain:'Pick when you’ll be back. Your contacts get a link to where you were last seen. If you don’t check in, BAK emails them, but only after a 30-minute cushion and three reminders to you.',
 when:'When will you be back?',
 roomTip:'Rides run long. Pick a time with room to spare. You can add time any time.',
 pickTime:'Pick a time',
 always:'To keep your spot updating with the phone in your pocket, choose “Allow while using the app”, then “Change to Always Allow” when iPhone asks.',
 sharing:'Ride safety is on',stop:'I’m back',send:'Send the link again',
 ended:'Welcome back. Ride safety is off and your location was cleared from the link.',
 noPermission:'Location is off for BAK MX. Ride safety still works (the back-by timer and alert), but the link can’t show where you are. Turn it on in Settings › BAK MX › Location.',
 noContacts:'Add who should get your ride link and, if you don’t check in, the alert.',
 offer:'Start ride safety for this ride?',offerSub:'A back-by timer, and a link for someone at the truck or at home.',
 summary:(backBy:string,alertAt:string)=>`Back by ${time(backBy)}. Nothing is sent before ${time(alertAt)}.`,
 message:(name:string,url:string,backBy:string,track:string)=>`${name?name+' is':'I’m'} riding${track?' at '+track:''}, back by ${time(backBy)}. See where ${name?'they are':'I am'}: ${url}`,
} as const;
export const REMINDER_COPY=[
 {title:'Back from your ride?',body:'Tap I’m back, or add time. Your contacts haven’t been told anything.'},
 {title:'Still riding?',body:'Tap I’m back or add time. The alert to your contacts goes out in 15 minutes.'},
 {title:'Alert in 5 minutes',body:'If you’re OK, tap I’m back or add time so your contacts don’t worry.'},
] as const;

/** "last seen 4 min ago" for the public page. */
export function lastSeen(at:string|null,now:number):string{
 if(!at)return 'No location yet';
 const m=Math.max(0,Math.round((now-Date.parse(at))/60e3));
 return m<2?'Last seen just now':m<60?`Last seen ${m} min ago`:`Last seen ${Math.floor(m/60)} h ${m%60} min ago`;
}
/** Public view of a share: nothing about the rider beyond the first name they chose, the back-by time and the last point. */
export type PublicShare={rider_name:string;state:'active'|'ended'|'expired';expires_at:string;back_by:string|null;overdue:boolean;last:{lat:number;lng:number;accuracy_m:number|null;at:string}|null};
export function publicView(row:{rider_name:string;expires_at:string;ended_at:string|null;back_by?:string|null;alerted_at?:string|null;last_lat:number|null;last_lng:number|null;last_accuracy_m:number|null;last_at:string|null},now:number):PublicShare{
 const state=row.ended_at?'ended':Date.parse(row.expires_at)<=now?'expired':'active';
 return {rider_name:row.rider_name,state,expires_at:row.expires_at,back_by:row.back_by??null,overdue:state==='active'&&!!row.alerted_at,
  last:state==='active'&&row.last_lat!=null&&row.last_lng!=null&&row.last_at?{lat:row.last_lat,lng:row.last_lng,accuracy_m:row.last_accuracy_m,at:row.last_at}:null};
}

/** The emails. Calm and plain: an overdue alert says the rider may just be running late and to call them first. */
export type SafetyEmail={subject:string;text:string};
const who=(n:string)=>n||'Your rider';
export function introEmail(rider:string,contact:string):SafetyEmail{
 return {subject:`${who(rider)} added you as a ride safety contact`,text:`Hi ${contact},\n\n${who(rider)} added you as a ride safety contact in BAK MX.\n\nWhen they start a ride, you'll get a link to see where they were last seen. If they don't check in by the time they set (plus a 30-minute cushion), you'll get one email from BAK MX letting you know.\n\nTo make sure that email isn't missed, please add safety@bakmx.com to your contacts.\n\nIf you don't want these emails, reply to this one and we'll stop them.\n\nBAK MX`};
}
export function startEmail(rider:string,url:string,backBy:string,track:string,tz?:string):SafetyEmail{
 return {subject:`${who(rider)} is out riding${track?' at '+track:''}`,text:`${who(rider)} started a ride${track?' at '+track:''} and plans to be back by ${time(backBy,tz)}.\n\nSee where they were last seen: ${url}\n\nYou don't need to do anything. If they don't check in by ${time(backBy,tz)} plus a 30-minute cushion, BAK MX will email you.\n\nBAK MX`};
}
export function alertEmail(rider:string,url:string,backBy:string,lastAt:string|null,track:string,tz?:string):SafetyEmail{
 return {subject:`${who(rider)} hasn't checked in from their ride`,text:`${who(rider)} planned to be back from riding${track?' at '+track:''} by ${time(backBy,tz)} and hasn't checked in yet.\n\nThey may just be running late or out of signal. Try calling or texting them first.\n\nWhere they were last seen${lastAt?' ('+time(lastAt,tz)+')':''}: ${url}\n\nIf you can't reach them and you're worried, call 911 and give them this location.\n\nWe'll email you again as soon as they check in.\n\nBAK MX`};
}
export function allClearEmail(rider:string,at:string,tz?:string):SafetyEmail{
 return {subject:`All good: ${who(rider)} checked in`,text:`${who(rider)} checked in from their ride at ${time(at,tz)}. No need to worry.\n\nBAK MX`};
}

/** Words that mean the rider is about to head out (used by chat to offer ride safety once). */
export const HEADING_OUT=/\b(head(ing)? out|about to (go )?(ride|hit the track|go out)|before (we|i) (head out|ride|go out|hit the track)|going (riding|to ride|out riding)|gate drop|first moto|first session|about to ride|leaving for the track|on (my|our) way to the track|pre[- ]?ride check)\b/i;
