// Where to Ride: every track and riding area in one place (docs/plans/riding-areas-plan.md). Shared by the server, the phone
// and the website so the words and rules are the same everywhere. Riding-area facts come from official pages
// (docs/research/riding-areas); anything we could not confirm is null and shows as "Not confirmed", never a guess.
import {matchTracks} from './track-match.ts';

export type PlaceKind='track'|'riding_area';
export type TrailWidth='single_track'|'atv'|'full_width';
export type AreaVehicles={single_track:boolean|null;atv:boolean|null;full_width:boolean|null};
export type AreaPass={day:string|null;year:string|null;how:string|null};
export type AreaSource={url:string;title:string;accessed?:string};
export type RidingArea={land:string|null;managed_by:string|null;near:string|null;name_detail?:string|null;address?:string|null;
 vehicles:AreaVehicles;width_limit_in:number|null;trail_miles:number|null;pass:AreaPass|null;season:string|null;hours:string|null;
 rules:string[];closures:string|null;official_url:string|null;phone:string|null;trailheads?:{name:string;lat:number;lng:number}[];
 mvum?:{forest:string}|null;sources:AreaSource[];verified:string|null;
 /** The middle of the area's Forest Service trail lines (worked out by the loader). For "near me" and the weather only:
  *  it can sit deep in the woods, so directions never use it. */
 center?:{lat:number;lng:number}|null};

/** One row in the Where to Ride list. */
export type PlaceRow={id:string;name:string;kind:PlaceKind;city:string|null;state:string;lat:number|null;lng:number|null;
 status:string;access:string;has_trails:boolean;trail_miles:number|null;widths:TrailWidth[];trail_map:boolean;
 /** lat/lng is the middle of the trail map, not an entrance: fine for distance and weather, never for directions. */
 approx?:boolean};

/** A riding area or track page. */
export type PlaceDetail=PlaceRow&{area:RidingArea|null;tracks_on_site:string[];website:string|null;phone:string|null;
 trail_lines:number;map_date:string|null;layout_notes:string|null};

/** Today's and tomorrow's forecast for a place (US National Weather Service), from /api/place-weather. */
export type DayForecast={available:true;date:string;day:string|null;night:string|null;high_f:number|null;low_f:number|null;rain_chance_pct:number|null;wind:string|null;rain_days_before:string[]}|{available:false;reason:string};
export type PlaceWeather={today:DayForecast;tomorrow:DayForecast};
/** "Sunny · 64° / 41° · 20% rain" */
export function forecastLine(f:DayForecast):string{
 if(!f.available)return f.reason;
 const t=f.high_f!=null||f.low_f!=null?`${f.high_f??'–'}° / ${f.low_f??'–'}°`:'';
 return [f.day??f.night,t,f.rain_chance_pct!=null?`${f.rain_chance_pct}% rain`:'',f.wind?`wind ${f.wind}`:''].filter(Boolean).join(' · ');
}

export type TrailLine={id:string;name:string;number:string;width:TrailWidth|'unknown';vehicles:Record<string,string>;dates_open:string;miles:number|null;line:[number,number][]};

/** A trail's name for people: the map's name, else its number ("Trail 450D"). */
export const trailName=(l:{name:string;number:string})=>{const n=l.name.trim();if(/^\d+[a-z]{0,2}$/i.test(n))return `Trail ${n}`;return n||(l.number?`Trail ${l.number}`:'Unnamed trail');};

export const WIDTHS:{id:TrailWidth;label:string;short:string;detail:string;color:string}[]=[
 {id:'single_track',label:'Single-track',short:'Single-track',detail:'Motorcycle-only trails',color:'#f0a03c'},
 {id:'atv',label:'ATV trail',short:'ATV',detail:'Bikes and ATVs, 50 in and under',color:'#7fb2ff'},
 {id:'full_width',label:'Full-width',short:'Full-width',detail:'Side-by-sides and 4x4s',color:'#9ad08a'},
];
const WIDTH_LABEL=new Map(WIDTHS.map(w=>[w.id,w]));
export const widthLabel=(w:string)=>WIDTH_LABEL.get(w as TrailWidth)?.label??'Not confirmed';
export const widthColor=(w:string)=>WIDTH_LABEL.get(w as TrailWidth)?.color??'#8b93a0';

export const WHERE_COPY={
 title:'Where to Ride',
 intro:'Tracks and riding areas BAK knows, with what you can ride, passes and rules, and how riders say it’s riding today.',
 filters:{all:'All',track:'Tracks',riding_area:'Riding areas'} as Record<'all'|PlaceKind,string>,
 search:'Search by name or town',
 none:'Nothing matches. Try another name, or All states.',
 allStates:'All states',
 notConfirmed:'Not confirmed: check the official page.',
 knowBefore:'Know before you go',
 whatYouCanRide:'What you can ride',
 checkedOn:(d:string)=>`Checked against official pages on ${fmtDay(d)}. Rules and closures change: check before you drive.`,
 trailMap:'Trail map',
 mapNote:(d:string|null)=>`${d?`Forest Service map of ${fmtDay(d)}. `:''}Closures change: check the official page before you ride.`,
 noLines:'The Forest Service hasn’t published trail lines for this area. Use the official map.',
 official:'Official page',directions:'Directions',onx:'Open in onX',call:'Call',
 rideToday:'Ride here today',rideTodayDetail:'Starts a practice day here: Ride Day mode, check-ins and Ride safety.',
 ask:'Ask BAK about riding here',
 privateLand:'Private park: rules, fees and hours are set by the owner. Check their page before you go.',
 saved:'Saved',save:'Save',unsave:'Saved',savedNone:'Nothing saved yet. Tap Save on a place to keep it here.',
 partialMap:(drawn:number,total:number)=>`The Forest Service map file draws about ${fmtMiles(Math.round(drawn))} of the ${fmtMiles(total)} miles here. Use the official map for the rest.`,
 weather:'Weather',weatherNote:'US National Weather Service forecast.',weatherNoteApprox:'US National Weather Service forecast for the middle of the trail map.',
 eventsHere:'Events here',
} as const;

/** "Riding area · 125 mi of trail · Single-track, ATV" */
export function placeSummary(p:Pick<PlaceRow,'kind'|'trail_miles'|'widths'|'has_trails'>):string{
 const bits=[p.kind==='riding_area'?'Riding area':p.has_trails?'Track with trails':'Track'];
 if(p.trail_miles!=null)bits.push(`${fmtMiles(p.trail_miles)} mi of trail`);
 if(p.widths.length)bits.push(p.widths.map(w=>WIDTH_LABEL.get(w)?.short??w).join(', '));
 return bits.join(' · ');
}
/** 2026-11-15 → Nov 15, 2026 */
export function fmtDay(d:string):string{const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(d);if(!m)return d;return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(m[2])-1]} ${Number(m[3])}, ${m[1]}`;}
/** A trail's season as the map gives it. */
export const mapSeason=(d:string)=>d==='Yearlong'?'Yearlong on the map':d?`Map season ${d.replace('-','–')}`:'';
export const fmtMiles=(m:number)=>Number.isInteger(m)?String(m):m.toFixed(1);

/** The widths an area allows, widest last. null (not confirmed) is left out. */
export function areaWidths(v:AreaVehicles|null|undefined):TrailWidth[]{
 if(!v)return [];return WIDTHS.map(w=>w.id).filter(id=>v[id]===true);
}

/** Decode a Google encoded polyline (precision 5) to [lng, lat] pairs. Trail lines are stored this way to stay small. */
export function decodePolyline(s:string):[number,number][]{
 const out:[number,number][]=[];let i=0,lat=0,lng=0;
 const next=()=>{let shift=0,result=0,b:number;do{b=s.charCodeAt(i++)-63;result|=(b&0x1f)<<shift;shift+=5;}while(b>=0x20&&i<=s.length);return result&1?~(result>>1):result>>1;};
 while(i<s.length){lat+=next();lng+=next();out.push([lng/1e5,lat/1e5]);}
 return out;
}

/** Search and filter the list: name, town and state. */
export function filterPlaces(rows:PlaceRow[],{query='',kind='all',state=''}:{query?:string;kind?:'all'|PlaceKind;state?:string}):PlaceRow[]{
 const q=query.trim().toLowerCase();
 return rows.filter(r=>(kind==='all'||r.kind===kind)&&(!state||r.state===state)&&(!q||`${r.name} ${r.city??''} ${r.state}`.toLowerCase().includes(q)));
}
export const statesOf=(rows:PlaceRow[])=>[...new Set(rows.map(r=>r.state))].sort();

/** Miles between two points (great circle), for "near me". */
export function milesBetween(a:{lat:number;lng:number},b:{lat:number;lng:number}):number{
 const R=3958.8,rad=(d:number)=>d*Math.PI/180;const dLat=rad(b.lat-a.lat),dLng=rad(b.lng-a.lng);
 const h=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLng/2)**2;
 return 2*R*Math.asin(Math.min(1,Math.sqrt(h)));
}
/** Nearest first when a location is known; places with no location keep name order at the end. */
export function byDistance(rows:PlaceRow[],from:{lat:number;lng:number}|null):(PlaceRow&{miles:number|null})[]{
 const withMiles=rows.map(r=>({...r,miles:from&&r.lat!=null&&r.lng!=null?milesBetween(from,{lat:r.lat,lng:r.lng}):null}));
 if(!from)return withMiles;
 return withMiles.sort((a,b)=>(a.miles??Infinity)-(b.miles??Infinity)||a.name.localeCompare(b.name));
}

const STATE_NAMES:Record<string,string>={AL:'alabama',AK:'alaska',AZ:'arizona',AR:'arkansas',CA:'california',CO:'colorado',CT:'connecticut',DE:'delaware',FL:'florida',GA:'georgia',HI:'hawaii',ID:'idaho',IL:'illinois',IN:'indiana',IA:'iowa',KS:'kansas',KY:'kentucky',LA:'louisiana',ME:'maine',MD:'maryland',MA:'massachusetts',MI:'michigan',MN:'minnesota',MS:'mississippi',MO:'missouri',MT:'montana',NE:'nebraska',NV:'nevada',NH:'new-hampshire',NJ:'new-jersey',NM:'new-mexico',NY:'new-york',NC:'north-carolina',ND:'north-dakota',OH:'ohio',OK:'oklahoma',OR:'oregon',PA:'pennsylvania',RI:'rhode-island',SC:'south-carolina',SD:'south-dakota',TN:'tennessee',TX:'texas',UT:'utah',VT:'vermont',VA:'virginia',WA:'washington',WV:'west-virginia',WI:'wisconsin',WY:'wyoming'};
/** A plain link to onX's public trail pages for the state (no partnership, no logo). */
export const onxLink=(state:string)=>STATE_NAMES[state]?`https://www.onxmaps.com/offroad/trails/us/${STATE_NAMES[state]}`:'https://www.onxmaps.com/offroad';

/** Directions in the phone's map app: to the first trailhead or the place's location, else by name. */
export function directionsLink(p:{name:string;city:string|null;state:string;lat:number|null;lng:number|null;approx?:boolean;area?:RidingArea|null},platform:'ios'|'android'|'web'):string{
 const th=p.area?.trailheads?.[0];const at=th?{lat:th.lat,lng:th.lng}:!p.approx&&p.lat!=null&&p.lng!=null?{lat:p.lat,lng:p.lng}:null;
 const q=at?`${at.lat},${at.lng}`:encodeURIComponent(p.area?.address??`${p.name}, ${p.city?p.city+', ':''}${p.state}`);
 return platform==='ios'?`https://maps.apple.com/?daddr=${q}`:`https://www.google.com/maps/dir/?api=1&destination=${q}`;
}

/** The widest width open on a Forest Service Motor Vehicle Use Map trail. The map's own legend line (MVUM_SYMBO in the
 *  national download, e.g. 'Trails open to vehicles 50" or less in width, Seasonal') decides; "Special Designation" trails
 *  fall back to the MOTORCYCLE and ATV columns (the two the metadata defines: "open" when open). Nothing open is unknown. */
export function mvumWidth(symbol:string,attrs:Record<string,unknown>={}):TrailWidth|'unknown'{
 const s=symbol.toLowerCase();
 if(s.includes('all vehicles'))return 'full_width';
 if(s.includes('50" or less')||s.includes('ohv <50'))return 'atv';
 if(s.includes('motorcycles'))return 'single_track';
 const open=(k:string)=>{const v=attrs[k];return typeof v==='string'&&v.trim().toLowerCase()==='open';};
 if(open('ATV'))return 'atv';
 if(open('MOTORCYCLE'))return 'single_track';
 return 'unknown';
}

/** Riding-area knowledge for Ask BAK: the confirmed facts only, in one compact object. */
export function areaForAsk(a:RidingArea|null|undefined):Record<string,unknown>|null{
 if(!a)return null;
 const out:Record<string,unknown>={land:a.land,vehicles:areaWidths(a.vehicles).map(widthLabel),width_limit_in:a.width_limit_in,trail_miles:a.trail_miles,season:a.season,hours:a.hours,rules:a.rules,closures:a.closures,checked_on:a.verified};
 for(const k of Object.keys(out))if(out[k]==null||(Array.isArray(out[k])&&!(out[k] as unknown[]).length))delete out[k];
 return out;
}

/** Miles of trail drawn on the map (each Forest Service trail counted once). */
export function drawnMiles(lines:Pick<TrailLine,'number'|'miles'>[]):number{
 return lines.reduce((n,l)=>n+(l.miles??0),0);
}
/** The note under a map that draws well under the area's published miles (under 80%), else null. */
export function partialNote(lines:Pick<TrailLine,'number'|'miles'>[],total:number|null|undefined):string|null{
 if(!total)return null;const drawn=drawnMiles(lines);
 return drawn>0&&drawn<total*0.8?WHERE_COPY.partialMap(drawn,total):null;
}

/** Saved places: ids kept on the phone, newest first, no repeats. */
export function toggleSaved(saved:readonly string[],id:string):string[]{
 return saved.includes(id)?saved.filter(x=>x!==id):[id,...saved].slice(0,100);
}

/** Upcoming events that name this place in their location ("Practice day at Croom"). Uses the same matching as the rest
 *  of the app, so "Croom" matches Croom Motorcycle Area but "Orlando" alone matches nothing. */
export function eventsAt<E extends {location_name:string;title:string;canceled_at?:string|null}>(events:E[],place:{id:string;name:string;city?:string|null},all:{id:string;name:string;aliases:string[];city?:string|null}[]):E[]{
 return events.filter(e=>!e.canceled_at&&matchTracks(`${e.location_name} ${e.title}`,all,3).some(t=>t.id===place.id));
}
