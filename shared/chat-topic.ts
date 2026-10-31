// A short label for a saved chat, so a rider can tell chats apart in a list before opening one: "Suspension",
// "Engine", "Wheels & tires"... worked out from the chat's title (the rider's first question) and its mode. Pure.
const TOPICS:[string,RegExp][]=[
 ['Torque spec',/\btorque|\bnm\b|ft[- ]?lb|\bbolt|\bnut\b/i],
 ['Maintenance',/\bservice|maintenance|oil change|change (the )?oil|air filter|oil filter|\bhours? (on|until)|top end|rebuild|valve (check|clearance)|coolant|\bgrease|\bclean/i],
 ['Suspension',/\bsag\b|clicker|compression|rebound|\bfork|\bshock|spring|suspension|linkage|preload|bottom(s|ing)? out|harsh|kicks?|headshake|wallow|pushes|tucks|dive/i],
 ['Wheels & tires',/\btire|\btyre|\bwheel|\brim\b|\bpsi\b|tire pressure|\b1[89] ?(in|inch|")|mousse|tube/i],
 ['Brakes',/\bbrake|\bpads?\b|rotor|caliper/i],
 ['Gearing & chain',/\bchain|sprocket|gearing|gear ratio|\bteeth/i],
 ['Clutch',/\bclutch/i],
 ['Engine & fuel',/backfire|\bbog|\bjet|carb|\bfuel|\bmap\b|\becu|idle|won.?t start|hard to start|stall|power|engine|piston|\bvalve|overheat|pinging|detonat|throttle|exhaust|airbox/i],
 ['Riding',/\brace\b|\btrack\b|\bmoto\b|corner|\bjump|whoop|rut|technique|body position|\bstart(s|ing)? (gate|line)|line choice|speed/i],
];
export function chatTopic(title:string|null|undefined,mode?:string|null):string{
 const t=(title??'').trim();const found=TOPICS.find(([,rx])=>rx.test(t))?.[0];
 if(found)return found;
 if(mode==='diagnose')return 'Problem';
 if(mode==='setup')return 'Setup';
 return 'General';
}
