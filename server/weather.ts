// Race-day weather from the US National Weather Service (api.weather.gov): public, free for any use, no key.
// Best effort only: no location, a date out of range or a slow reply returns a plain reason and the answer goes on without it.

export type RaceForecast=
 {available:true;source:'US National Weather Service forecast';issued:string;date:string;day:string|null;night:string|null;high_f:number|null;low_f:number|null;rain_chance_pct:number|null;wind:string|null;rain_days_before:string[]}
 |{available:false;reason:string};

const UA='BAK MX (support@bakmx.com)';
const points=new Map<string,{at:number;url:string}>();
async function get(url:string,ms:number):Promise<unknown>{
 const c=new AbortController(),t=setTimeout(()=>c.abort(),ms);
 try{const r=await fetch(url,{signal:c.signal,headers:{'User-Agent':UA,Accept:'application/geo+json'}});if(!r.ok)throw new Error('weather_'+r.status);return await r.json();}
 finally{clearTimeout(t);}
}
type Period={name:string;startTime:string;isDaytime:boolean;temperature:number;temperatureUnit:string;windSpeed:string;windDirection:string;shortForecast:string;probabilityOfPrecipitation?:{value:number|null}};

/** Days from today (the rider's calendar) to the race date; both YYYY-MM-DD. */
export const daysUntil=(date:string,today:string)=>Math.round((Date.parse(date+'T12:00:00Z')-Date.parse(today+'T12:00:00Z'))/86400_000);

/** Picks the race date's day and night periods and any rain in the two days before it out of an NWS 7-day forecast. */
export function forecastFromPeriods(periods:Period[],date:string,issued:string):RaceForecast{
 const on=periods.filter(p=>p.startTime.slice(0,10)===date);
 if(!on.length)return {available:false,reason:'The forecast does not reach the race date yet.'};
 const day=on.find(p=>p.isDaytime)??null,night=on.find(p=>!p.isDaytime)??null;
 const f=(p:Period|null)=>p?(p.temperatureUnit==='C'?Math.round(p.temperature*9/5+32):p.temperature):null;
 const chance=Math.max(-1,...on.map(p=>p.probabilityOfPrecipitation?.value??-1));
 const before=new Set([1,2].map(n=>new Date(Date.parse(date+'T12:00:00Z')-n*86400_000).toISOString().slice(0,10)));
 const rainBefore=periods.filter(p=>before.has(p.startTime.slice(0,10))&&/rain|shower|storm|drizzle/i.test(p.shortForecast)).map(p=>`${p.name}: ${p.shortForecast}${p.probabilityOfPrecipitation?.value!=null?` (${p.probabilityOfPrecipitation.value}%)`:''}`);
 return {available:true,source:'US National Weather Service forecast',issued,date,day:day?.shortForecast??null,night:night?.shortForecast??null,high_f:f(day),low_f:f(night),rain_chance_pct:chance>=0?chance:null,wind:day?`${day.windDirection} ${day.windSpeed}`:null,rain_days_before:rainBefore};
}

export async function raceForecast(lat:number|null|undefined,lng:number|null|undefined,date:string,today:string):Promise<RaceForecast>{
 if(lat==null||lng==null)return {available:false,reason:'This track has no location on file yet.'};
 const away=daysUntil(date,today);
 if(away<0)return {available:false,reason:'The race date has passed.'};
 if(away>6)return {available:false,reason:`Too far out for a forecast; it becomes available about a week before (${away} days to go).`};
 try{
  const key=`${lat.toFixed(4)},${lng.toFixed(4)}`;let hit=points.get(key);
  if(!hit||Date.now()-hit.at>86400_000){const p=await get(`https://api.weather.gov/points/${key}`,3500) as {properties?:{forecast?:string}};if(!p.properties?.forecast)return {available:false,reason:'No forecast for this location.'};hit={at:Date.now(),url:p.properties.forecast};points.set(key,hit);}
  const fc=await get(hit.url,4000) as {properties?:{periods?:Period[];updateTime?:string;generatedAt?:string}};
  const periods=fc.properties?.periods;if(!Array.isArray(periods))return {available:false,reason:'The forecast could not be read.'};
  return forecastFromPeriods(periods,date,fc.properties?.updateTime??fc.properties?.generatedAt??'');
 }catch{return {available:false,reason:'The weather service did not answer in time.'};}
}

/** The location of the race's track among the matched tracks: the one with the rider's track name, else the first matched. */
export function raceTrackAt(tracks:{name:string;lat?:number|null;lng?:number|null}[],name:string):[number|null,number|null]{
 const n=name.trim().toLowerCase(),t=tracks.find(x=>x.name.toLowerCase()===n)??tracks[0];
 return [t?.lat??null,t?.lng??null];
}
