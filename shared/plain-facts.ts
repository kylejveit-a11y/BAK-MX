// Manual wording turned into rider wording, for lists a rider scans (Specs, service plans). Pure and tested.
// Nothing is changed in meaning: only names are re-worded and intervals are summarised to the one a rider follows.

/** Maker words that riders don't use, in the words they do. Applied to names only, never to values. */
const WORDS:[RegExp,string][]=[
 // KTM, Husqvarna and GasGas call the swingarm the "link fork"; their "fork bearing" is the swingarm pivot bearing.
 [/\b(link fork|fork) bearings?\b/gi,'swingarm pivot bearing'],
 [/\blink fork\b/gi,'swingarm'],
 [/\bshock absorber heim joint\b/gi,'shock top and bottom bearings (heim joint)'],
 [/\bheim joint\b/gi,'heim joint (shock end bearing)'],
 [/\bbrake linings?\b/gi,'brake pads'],
 [/\bfoot brake lever\b/gi,'rear brake pedal'],
 [/\bhand brake lever\b/gi,'front brake lever'],
 [/\bshock absorber\b/gi,'shock'],
 [/\bperform the shock service\b/gi,'Service the shock'],
 [/\boperating hours?\b/gi,'h'],
];
/** "Screw, front brake caliper (M8)" → "Front brake caliper screw (M8)". */
const FASTENER=/^(remaining screws|remaining nuts|screw plug|hose clamp|banjo bolt|screws?|nuts?|bolts?|plugs?|collar screw|collar nut),\s*(.+?)(\s*\([^)]*\))?$/i;

const cap=(s:string)=>s.charAt(0).toUpperCase()+s.slice(1);
export function plainName(name:string):string{
 let t=name.trim().replace(/\.$/,'');
 const f=t.match(FASTENER);
 if(f)t=`${f[2]} ${f[1].toLowerCase()}${f[3]??''}`;
 for(const [rx,to] of WORDS)t=t.replace(rx,to);
 t=t.replace(/^Perform the (.+) service$/i,'Service the $1').replace(/^SX-F fork service$/i,'Fork service');
 return cap(t.replace(/\s{2,}/g,' ').trim());
}

/** A service interval as printed ("once after 1 operating hour; every 15 operating hours; every 45 operating hours;
 *  every 90 operating hours; every 24 months", or "Every45h; included90h") summarised to what a rider follows:
 *  the shortest repeat in hours, the time limit, and the one-time first check. Longer hour figures in the same
 *  line are the manual's later inspection columns that the shorter one already covers. */
export function plainInterval(value:string):string{
 const v=value.toLowerCase();
 const hours=[...v.matchAll(/every\s*(\d+(?:\.\d+)?)\s*(?:operating\s*)?(?:hours?|h)\b/g)].map(m=>Number(m[1]));
 const months=[...v.matchAll(/every\s*(\d+)\s*months?/g)].map(m=>Number(m[1]));
 const races=v.match(/every\s+(race|(\w+)\s+races?)/);
 const first=v.match(/(?:once\s+)?after\s+(?:the\s+)?(\d+(?:\.\d+)?|one|first)\s*(?:operating\s*)?(?:hours?|h)\b/);
 const parts:string[]=[];
 if(hours.length)parts.push(`Every ${Math.min(...hours)} h`);
 else if(races)parts.push(cap(races[0]));
 if(months.length)parts.push(`${parts.length?'or ':'Every '}${Math.min(...months)} months`);
 if(first)parts.push(`first at ${/one|first/.test(first[1])?1:first[1]} h`);
 if(!parts.length){if(/as required|as needed/.test(v))return 'When needed';return cap(value.trim());}
 return parts.join(' · ');
}

/** Rows that say the same job twice ("Service the fork" and "Service the fork.") collapse to one. */
export function sameJob(a:string,b:string){const n=(s:string)=>plainName(s).toLowerCase().replace(/[^a-z0-9]/g,'');return n(a)===n(b);}
