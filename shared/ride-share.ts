// Safety share link: the words and rules shared by the phone, the server and the public page.
export const SHARE_HOURS=[2,4,8,12] as const;
export const SHARE_LIMITS={minHours:1,maxHours:12,perDay:10,stalePositionMin:20} as const;
export const SHARE_COPY={
 start:'Share my location',startSub:'A link for someone at the truck or at home',
 how:'How long?',
 explain:'Anyone with the link sees where you were last seen and when, in any browser, with no app or account. It ends on its own, and ending it clears your location. Only your last spot is kept, never a trail.',
 always:'To keep updating with the phone in your pocket, choose “Allow while using the app”, then “Change to Always Allow” when iPhone asks. You can stop sharing any time.',
 sharing:'Sharing your location',stop:'Stop sharing',send:'Send the link',
 ended:'Sharing stopped. Your location was cleared from the link.',
 noPermission:'Location is off for BAK MX. Turn it on in Settings › BAK MX › Location to share.',
 message:(name:string,url:string,until:string)=>`${name?name+' is':'I’m'} riding. See where ${name?'they were':'I was'} last seen until ${until}: ${url}`,
} as const;
/** "last seen 4 min ago" for the public page. */
export function lastSeen(at:string|null,now:number):string{
 if(!at)return 'No location yet';
 const m=Math.max(0,Math.round((now-Date.parse(at))/60e3));
 return m<2?'Last seen just now':m<60?`Last seen ${m} min ago`:`Last seen ${Math.floor(m/60)} h ${m%60} min ago`;
}
/** Public view of a share: nothing about the rider beyond the first name they chose and the last point. */
export type PublicShare={rider_name:string;state:'active'|'ended'|'expired';expires_at:string;last:{lat:number;lng:number;accuracy_m:number|null;at:string}|null};
export function publicView(row:{rider_name:string;expires_at:string;ended_at:string|null;last_lat:number|null;last_lng:number|null;last_accuracy_m:number|null;last_at:string|null},now:number):PublicShare{
 const state=row.ended_at?'ended':Date.parse(row.expires_at)<=now?'expired':'active';
 return {rider_name:row.rider_name,state,expires_at:row.expires_at,last:state==='active'&&row.last_lat!=null&&row.last_lng!=null&&row.last_at?{lat:row.last_lat,lng:row.last_lng,accuracy_m:row.last_accuracy_m,at:row.last_at}:null};
}
