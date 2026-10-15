import {symptomGuides} from './setup-knowledge.ts';
/** Guided handling-problem intake: tap answers instead of typing, with a type-your-own option at every step.
 *  The choices for the deciding question come from each symptom guide, so the rider's answer is the tell BAK needs. */
export const deciderAnswers:Record<string,string[]>={
 'front-push':['It pushes off the gas at corner entry','It pushes on the gas, driving through the turn','It pushes both ways'],
 'front-tuck':['Yes, the fork dives first','No, it doesn’t dive'],
 'front-dive':['It’s soft all the way through','It’s fine early, weak at the end of the stroke'],
 'headshake':['A light jitter on the gas','Full bar swapping on the gas','It shakes on the brakes','It shakes at speed on rough straights'],
 'rear-kick':['It kicks straight up after one big hit','It kicks sideways off edges, rocks or roots','The kicking builds through a run of bumps','It kicks and also bottoms'],
 'packing':['The first bump is fine, then it gets worse','It’s bad from the first hit'],
 'harsh-and-bottoms':['Clicking softer makes it harsher','Clicking softer helps a little','I haven’t tried changing it'],
 'harsh-small-chop':['Clicker changes barely do anything','It gets worse through a run of chop','Neither of those'],
 'wallow-squat':['The rear sits low at rest too','Only once it’s loaded'],
 'stinkbug':['Sag measures right but it rides high once moving','Sag measures low, so the rear sits high at rest','I haven’t measured sag'],
 'no-drive':['It skips and chatters across the bumps','It squats and wallows as grip fades','Grip fades through a run of bumps','It spins on smooth ground too'],
 'bottoming':['The rest of the stroke feels fine','It’s got worse over time','Worse late in the moto'],
 'blows-through':['It falls through on the hit','It stays down afterwards'],
 'deflect':['The front deflects on the gas','The front deflects on the brakes','The rear deflects'],
 'arm-pump-harsh-hands':['The fork rides high and stiff','The fork dives and sits deep'],
 'rear-swapping':['The rear feels high','The rear feels low'],
};
/** Guides whose deciding question already says on or off the gas. */
const asksThrottle=new Set(['front-push','headshake','deflect']);
export const throttleAnswers=['On the gas','Braking or off the gas','Both'];
export const whereAnswers=['Braking bumps','Corner entry','Middle of the corner','Corner exit','Jump faces','Landings','Whoops','Acceleration chop','Square edges, rocks, roots','Fast straights','Everywhere'];
export const trackAnswers=['Hard pack','Loam','Sand','Mud','Rocky or rooty','Deep ruts'];
export const complaintLabel=(id:string)=>{const g=symptomGuides.find(x=>x.id===id);const s=g?.rider_says[0]??id;return s.charAt(0).toUpperCase()+s.slice(1);};
/** Complaints in the order a rider scans them: front, rear, whole bike. */
export const complaintGroups:{label:string;ids:string[]}[]=[
 {label:'Front end',ids:['front-push','front-tuck','front-dive','headshake','arm-pump-harsh-hands']},
 {label:'Rear end',ids:['rear-kick','no-drive','wallow-squat','stinkbug','rear-swapping']},
 {label:'Over bumps',ids:['packing','harsh-small-chop','harsh-and-bottoms','bottoming','blows-through','deflect']},
];
export type TriageAnswers={complaint:string;complaintText?:string;decider?:string;throttle?:string;where:string[];track:string[];notes?:string};
export const triageSteps=(complaint:string)=>({decider:symptomGuides.find(g=>g.id===complaint)?.ask??null,throttle:!asksThrottle.has(complaint)});
/** The message the rider sends: plain, in their words, with every tell BAK uses. */
export function composeTriage(a:TriageAnswers):string{
 const g=symptomGuides.find(x=>x.id===a.complaint),parts:string[]=[];
 parts.push((a.complaintText||(g?complaintLabel(g.id):a.complaint)).replace(/\.$/,'')+'.');
 if(g?.ask&&a.decider)parts.push(a.decider==='Not sure'?`Not sure: ${g.ask.charAt(0).toLowerCase()+g.ask.slice(1)}`:a.decider.replace(/\.$/,'')+'.');
 if(a.throttle)parts.push(`It happens: ${a.throttle.toLowerCase()}.`);
 if(a.where.length)parts.push(`Where: ${a.where.join(', ').toLowerCase()}.`);
 if(a.track.length)parts.push(`Track: ${a.track.join(', ').toLowerCase()}.`);
 if(a.notes?.trim())parts.push(a.notes.trim());
 return parts.join(' ').replace(/\.\./g,'.');
}
