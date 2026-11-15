// "What I ran here": a rider's own visits to one track, newest first: the setup and changes they logged, the tires and
// pressures and how it rode from their report, and the weather when they logged it. Only the rider's own rows.
import {normTrack} from './race-day.ts';

export type HistoryLog={id:string;recorded_at:string;bike_id:string;settings:Record<string,unknown>;change_made:string;result:string;notes:string;conditions:string;weather:HistoryWeather|null};
export type HistoryReport={ridden_on:string;tags:string[];tire:string;front_psi:number|null;rear_psi:number|null;setup_text:string;note:string;weather:HistoryWeather|null};
export type HistoryWeather={temp_f:number|null;conditions:string|null;wind_mph:number|null;humidity_pct:number|null;observed_at:string};
export type Visit={day:string;report:HistoryReport|null;logs:HistoryLog[];weather:HistoryWeather|null};

/** Does a setup log's free-text track name mean this track? Same rule as everywhere: the name or an alias, normalized. */
export const logAtTrack=(logTrack:string,t:{name:string;aliases?:string[]|null})=>{const n=normTrack(logTrack);return !!n&&(n===normTrack(t.name)||(t.aliases??[]).some(a=>normTrack(a)===n));};

/** Groups logs and reports by day (the log's local day is taken from recorded_at's date). The weather shown for a day is the
 *  report's, else the first log's that has one. At most `limit` days. */
export function visitsFrom(logs:HistoryLog[],reports:HistoryReport[],dayOf:(iso:string)=>string,limit=20):Visit[]{
 const days=new Map<string,Visit>();
 const at=(d:string)=>{let v=days.get(d);if(!v){v={day:d,report:null,logs:[],weather:null};days.set(d,v);}return v;};
 for(const r of reports)at(r.ridden_on).report=r;
 for(const l of [...logs].sort((a,b)=>a.recorded_at.localeCompare(b.recorded_at)))at(dayOf(l.recorded_at)).logs.push(l);
 for(const v of days.values())v.weather=v.report?.weather??v.logs.find(l=>l.weather)?.weather??null;
 return [...days.values()].sort((a,b)=>b.day.localeCompare(a.day)).slice(0,limit);
}

const LABEL:Record<string,string>={fork_compression:'Fork comp',fork_rebound:'Fork reb',shock_compression:'Shock comp',shock_rebound:'Shock reb',rider_sag_mm:'Sag',fork_height_mm:'Fork height',tire_pressures:'Tires'};
/** "Fork comp 12 · Shock reb 10 · Sag 105": the settings a log saved, short. */
export function settingsLine(settings:Record<string,unknown>):string{
 return Object.entries(LABEL).map(([k,l])=>{const v=settings?.[k];return v==null||v===''?'':`${l} ${k==='rider_sag_mm'?v+' mm':k==='fork_height_mm'?v+' mm':v}`;}).filter(Boolean).join(' · ');
}
/** "72°F, Partly Cloudy, wind 8 mph". */
export function weatherLine(w:HistoryWeather|null):string{
 if(!w)return '';
 return [w.temp_f!=null?`${w.temp_f}°F`:'',w.conditions??'',w.wind_mph!=null?`wind ${w.wind_mph} mph`:''].filter(Boolean).join(', ');
}
