// Picks the drivetrain, air and engine numbers worth handing to Ask BAK for this question (shared/engine-physics.ts),
// from the rider's own Garage gearing, the bike's published engine values, the track's elevation and the race forecast.
import {airChange,airDensity,chainChange,chainPitch,gearingChangeFromText,gearingOptions,meanPistonSpeed,portTiming,blowdownDeg,tunedPipeLength,exhaustWaveSpeed,usualChainSize} from './engine-physics.ts';

export const GEAR_ABOUT=/\b(sprockets?|gearing|gear(ed|ing)? (it )?(up|down)|teeth|tooth|chain|final drive|wheelbase|axle position|\d{2}\s*\/\s*\d{2}|too tall|too short|between gears|revs out|top speed|pulls? (harder|longer))\b/i;
export const AIR_ABOUT=/\b(altitude|elevation|feet up|mountains?|jet(s|ting|ted)?|carb(uretor|uettor)?|main jet|needle|pilot|runs? (rich|lean|fat)|too (rich|lean)|lean(er)? (it|out)|richen\w*|ping(s|ing)?|detonat\w*|humid(ity)?|thin air|air density|density altitude|maps?|mapping|hot day|cold day|cold morning|bog(s|gy|ging)?|blubber\w*|loading up|power loss|lost power|down on power|feels? flat|flat (on|off) (the )?(bottom|top|power))\b/i;
export const PORT_ABOUT=/\b(ports?|porting|ported|exhaust port|transfers?|blowdown|port timing|pipe|expansion chamber|compression ratio|squish|piston speed|rod length|head work|cut the head|decked|base gasket)\b/i;
export const ENGINE_ABOUT=new RegExp(`${GEAR_ABOUT.source}|${AIR_ABOUT.source}|${PORT_ABOUT.source}`,'i');

const num=(v:unknown)=>{if(v==null||v==='')return undefined;const x=Number(String(v).replace(/[^\d.]/g,''));return Number.isFinite(x)&&x>0?x:undefined;};
export const isFourStroke=(model:string)=>/(SX-F|XC-F|\d+F\b|\bF[CX]\b|^F[CX]|CRF|RM-?Z|^KX\s?(250|450)\b|^TF\s|\bMC \d+F\b)/i.test(model.trim());
const classCc=(model:string)=>{const m=model.match(/(\d{2,3})/);return m?Number(m[1]):undefined;};

export type EngineEnv={model:string;configuration:Record<string,unknown>;statements:string[];track:{name:string;elevationFt:number}|null;forecastHighF:number|null;raceMode:boolean;
 /** The maker's carburetor tuning chart rows for this bike ("Carburetor tuning / 301 to 750 m (...) / 16 to 24 °C (...): ..."). */
 jetting?:{id:string;statement:string}[];
 /** The rider's latest message on its own (text holds it plus the last turns). */
 current?:string;earlier?:string};

type JetCell={id:string;chart:string;ft:[number,number];f:[number,number];band:string;air:string;settings:string};
const fnum=(x:string)=>Number(x.replace(/,/g,''));
const RANGE=(unit:string,alt:string)=>new RegExp(`^(?:at )?(?:(-?[\\d,.]+) to )?(-?[\\d,.]+) ${unit} \\((?:(-?[\\d,.]+) to )?(-?[\\d,.]+) ${alt}\\)$`);
const ELEV=RANGE('m','ft'),TEMP=RANGE('°C','°F');
/** Chart rows: "Carburetor tuning[ (chart)] / <a to b m (c to d ft) | at a m (c ft)> / <a to b °C (c to d °F) | at a °C (c °F)>: settings." */
export function jettingCells(rows:{id:string;statement:string}[]):JetCell[]{
 const out:JetCell[]=[];
 for(const r of rows){
  const m=r.statement.match(/^Carburetor tuning(?: \(([^)]+)\))? \/ (.+?) \/ (.+?): (.+?)\.(?= [A-Z]|$)/);if(!m)continue;
  const e=m[2].match(ELEV),t=m[3].match(TEMP);if(!e||!t)continue;
  out.push({id:r.id,chart:m[1]??'standard',ft:[fnum(e[3]??e[4]),fnum(e[4])],f:[fnum(t[3]??t[4]),fnum(t[4])],band:m[2],air:m[3],settings:m[4]});}
 return out;
}
/** The chart cell for this elevation and air temperature, per chart. A value between two printed bands goes to the nearer one. */
export function jettingFor(cells:JetCell[],elevationFt:number,tempF:number){
 const near=(x:number,[a,b]:[number,number])=>x<a?a-x:x>b?x-b:0;
 const byChart=new Map<string,JetCell[]>();for(const c of cells){const l=byChart.get(c.chart)??[];l.push(c);byChart.set(c.chart,l);}
 const res:{chart:string;evidence_id:string;elevation_band:string;air_band:string;settings:string;note?:string}[]=[];
 for(const [chart,list] of byChart){
  const top=Math.max(...list.map(c=>c.ft[1])),coldest=Math.min(...list.map(c=>c.f[0])),hottest=Math.max(...list.map(c=>c.f[1]));
  const bandDist=Math.min(...list.map(c=>near(elevationFt,c.ft)));
  const inBand=list.filter(c=>near(elevationFt,c.ft)===bandDist);
  const tDist=Math.min(...inBand.map(c=>near(tempF,c.f)));
  const cell=inBand.find(c=>near(tempF,c.f)===tDist);if(!cell)continue;
  const notes:string[]=[];
  if(elevationFt>top+50)notes.push(`the chart stops at ${top.toLocaleString('en-US')} ft; this is above it`);
  if(tempF<coldest-2||tempF>hottest+2)notes.push('the air is outside the chart\'s temperature range');
  const points=list.every(c=>c.f[0]===c.f[1]&&c.ft[0]===c.ft[1]);
  if(points&&(bandDist>0||tDist>0))notes.push('the chart is printed at set elevations and temperatures; the nearest printed one is shown');
  else if(tDist>2)notes.push('the maker prints no setting for exactly this air in that band; the nearest printed column is shown');
  // Between two printed temperature bands (e.g. 60 °F between 43-59 and 61-75): give both, so neither is guessed.
  const other=points?undefined:inBand.find(c=>c.id!==cell.id&&near(tempF,c.f)>0&&near(tempF,c.f)<=4&&tDist>0);
  if(other)notes.push(`the air falls between two printed columns; ${other.air} is also shown`);
  res.push({chart,evidence_id:cell.id,elevation_band:cell.band,air_band:cell.air,settings:cell.settings,...(other?{also:{evidence_id:other.id,air_band:other.air,settings:other.settings}}:{}),...(notes.length?{note:notes.join('; ')}:{})});
 }
 return res;
}

function chainFromStatements(statements:string[]):string|undefined{
 for(const s of statements){if(!/chain/i.test(s))continue;const m=s.match(/\b(420|428|520|525|530)\b/);if(m)return m[1];}
 return undefined;
}
function fuelSystem(statements:string[]):'carburetor'|'fuel injection'|'unknown'{
 const t=statements.join(' ');
 if(/fuel injection|throttle body|\bEFI\b|injector|TPI\b|TBI\b/i.test(t))return 'fuel injection';
 if(/carbu?ret|\bPWK\b|\bTMX\b|Mikuni|Keihin PW|\bcarb\b/i.test(t))return 'carburetor';
 return 'unknown';
}
function boreStroke(statements:string[]):{bore:number;stroke:number}|undefined{
 for(const s of statements){const m=s.match(/bore\s*(?:x|×|and|\/)\s*stroke[^\d]{0,30}([\d.]+)\s*(?:mm)?\s*(?:x|×|by)\s*([\d.]+)/i);if(m){const bore=Number(m[1]),stroke=Number(m[2]);if(bore>30&&bore<120&&stroke>30&&stroke<120)return {bore,stroke};}}
 return undefined;
}
function compression(statements:string[]):number|undefined{
 for(const s of statements){const m=s.match(/compression ratio[^\d]{0,30}([\d.]+)\s*(?::|to)\s*1/i);if(m&&Number(m[1])>5&&Number(m[1])<20)return Number(m[1]);}
 return undefined;
}

/** Elevation, temperature and humidity the rider wrote ("we're at 6,000 ft", "95 degrees", "80% humidity"). */
export function airFromText(text:string){
 const e=text.match(/\b(\d{1,2},\d{3}|\d{1,5})\s*(?:ft|feet|foot)\b/i)??text.match(/\b(\d{1,2},?\d{3}|\d{3,4})\s*'(?!\w)/)??(/\bsea[ -]?level\b/i.test(text)?['','0']:null);
 const t=text.match(/\b(\d{2,3})\s*(?:°\s*f?|degrees?(?:\s*f(?:ahrenheit)?)?|deg\b)/i);
 const h=text.match(/\b(\d{1,3})\s*%\s*(?:humidity|humid|rh)\b/i);
 const elevationFt=e?Number(e[1].replace(',','')):undefined,tempF=t?Number(t[1]):undefined,humidity=h?Number(h[1]):undefined;
 return {elevationFt:elevationFt!=null&&elevationFt<=14000?elevationFt:undefined,tempF:tempF!=null&&tempF>=-20&&tempF<=125?tempF:undefined,humidity:humidity!=null&&humidity<=100?humidity:undefined};
}

/** What the rider wrote about their ports and pipe: port heights, rod length, durations and rpm. */
function portsFromText(text:string){
 const mm=(re:RegExp)=>{const m=text.match(re);return m?Number(m[1]):undefined;};
 return {exhaustTop:mm(/exhaust(?: port)?[^.?!\d]{0,40}?([\d.]+)\s*mm/i),transferTop:mm(/transfers?(?: ports?)?[^.?!\d]{0,40}?([\d.]+)\s*mm/i),rod:mm(/\brod(?: length)?[^.?!\d]{0,30}?([\d.]+)\s*mm/i),
  stroke:mm(/\bstroke[^.?!\d]{0,20}?([\d.]+)\s*mm/i),duration:mm(/exhaust[^.?!\d]{0,40}?([\d.]{3,5})\s*(?:°|deg)/i),rpm:(()=>{const m=text.match(/\b(\d{1,2}[,.]?\d{3})\s*(?:rpm|revs)\b/i);return m?Number(m[1].replace(/[,.]/g,'')):undefined;})()};
}

export function engineContext(text:string,env:EngineEnv):Record<string,unknown>|null{
 const out:Record<string,unknown>={};
 const cfg=env.configuration,front=num(cfg.front_sprocket),rear=num(cfg.rear_sprocket);
 // Gearing and chain
 if(GEAR_ABOUT.test(text)){
  const published=chainFromStatements(env.statements),usual=published?null:usualChainSize(classCc(env.model));
  const size=published??usual?.size;
  if(size){
   const pitch=chainPitch(size),proposed=gearingChangeFromText(text,front,rear);
   const from=proposed&&!(front&&rear)?text.match(/\b(\d{2})\s*[/x-]\s*(\d{2})\b/):null;
   const curF=front??(from?Number(from[1]):undefined),curR=rear??(from?Number(from[2]):undefined);
   const d:Record<string,unknown>={chain_size:size,chain_size_source:published?'published for this bike':'the usual size for this class of bike; ask the rider to check before quoting millimetres'};
   if(curF&&curR&&Number.isInteger(curF)&&Number.isInteger(curR)){
    d.current_gearing=`${curF}/${curR}${front&&rear?' (rider\'s Garage)':' (rider\'s message)'}`;
    try{if(proposed&&(proposed.front!==curF||proposed.rear!==curR)&&proposed.front>=9&&proposed.rear>=30)d.proposed={gearing:`${proposed.front}/${proposed.rear}`,...chainChange(pitch,curF,curR,proposed.front,proposed.rear)};}catch{}
    try{d.one_and_two_tooth_options=gearingOptions(pitch,curF,curR);}catch{}
   }else d.missing='The rider\'s current sprockets are not in the Garage; ask for them (front/rear teeth) before giving percentages.';
   d.rule_of_thumb=`One tooth on the front changes the gearing about as much as ${Math.round(((rear??50)/(front??13))*10)/10} teeth on the rear. Each rear tooth moves the axle about ${Math.round(pitch/4*10)/10} mm; two chain links move it about ${pitch} mm.`;
   out.drivetrain=d;
  }
 }
 // Air density and jetting
 // A message about where the bike runs right now ("I'm jetted for home, 500 ft and 80 degrees, running a 470 main") is the
 // reference, not the destination: the destination then comes from the earlier turns or the track.
 const current=env.current??text,earlier=env.earlier??'';
 const homeRef=/\b(jetted (for|at)|at home|home (is|track)|runs? (right|good|great|perfect)|where (it|i) (runs|ride)|currently (jetted|running))\b/i.test(current)&&airFromText(current).elevationFt!=null;
 const said=homeRef?airFromText(earlier):airFromText(current+' '+earlier);
 const refFromText=homeRef?airFromText(current):null;
 const elevation=said.elevationFt??env.track?.elevationFt,temp=said.tempF??env.forecastHighF??undefined;
 if((AIR_ABOUT.test(text)||env.raceMode)&&elevation!=null){
  const where=said.elevationFt!=null?'the elevation the rider gave':`${env.track!.name} (track elevation on file)`;
  const temps=temp!=null?[temp]:[60,90];
  const a:Record<string,unknown>={where,elevation_ft:elevation,temperature_source:said.tempF!=null?'the rider\'s message':env.forecastHighF!=null?'race-day forecast high':'no temperature given: shown at 60 °F and 90 °F',
   humidity_source:said.humidity!=null?'the rider\'s message':'not given; 50% assumed (humidity moves power about 1-2%)',
   fuel_system:fuelSystem(env.statements)==='unknown'?'not in this bike\'s published values; if unsure, ask whether it has a carburetor or fuel injection':fuelSystem(env.statements),
   days:temps.map(t=>airDensity(elevation,t,said.humidity??null)),
   versus_sea_level_60F:temps.map(t=>({temp_f:t,...pick(airChange({elevationFt:0,tempF:60},{elevationFt:elevation,tempF:t,humidityPct:said.humidity??null}))}))};
  const cells=jettingCells(env.jetting??[]);
  if(cells.length){
   const t0=temps[0];a.published_jetting=jettingFor(cells,elevation,t0);
   if(temps.length>1)a.published_jetting_hot=jettingFor(cells,elevation,temps[1]);
   a.fuel_system='carburetor';
   // Jets the rider wrote in the conversation count the same as Garage ones ("running a 470 main", "clip in the 3rd groove").
   const all=current+' '+earlier,mj=all.match(/\b(?:#\s*)?(\d{2,3}(?:\.\d)?)\s*(?:main(?: jet)?)\b|\bmain(?: jet)?\s*(?:is|of|at|=)?\s*#?\s*(\d{2,3}(?:\.\d)?)\b/i),
    pj=all.match(/\b(?:#\s*)?(\d{2}(?:\.\d)?)\s*(?:pilot|slow|idle|idling)(?: jet)?\b|\b(?:pilot|slow|idle|idling)(?: jet)?\s*(?:is|of|at|=)?\s*#?\s*(\d{2}(?:\.\d)?)\b/i),
    clip=all.match(/\bclip\D{0,20}?(\d)(?:st|nd|rd|th)?\b|\b(\d)(?:st|nd|rd|th)\s*(?:clip|groove|position)\b/i);
   const jetCfg={...cfg,...(cfg.main_jet==null&&mj?{main_jet:mj[1]??mj[2]}:{}),...(cfg.pilot_jet==null&&pj?{pilot_jet:pj[1]??pj[2]}:{}),...(cfg.needle_clip==null&&clip?{needle_clip:`clip ${clip[1]??clip[2]}`}:{}),
    ...(refFromText&&refFromText.tempF!=null?{jetted_for:`${refFromText.elevationFt} ft, ${refFromText.tempF} degrees`}:{})};
   const rel=riderJetting(cells,jetCfg,elevation,t0);
   if(rel)a.from_rider_jetting=rel;
  }
  out.air=a;
 }else if(AIR_ABOUT.test(text)&&elevation==null&&/\b(altitude|elevation|jet|carb|density|mountain)/i.test(text))out.air={missing:'No elevation for this question: ask where they ride (track or town) or the elevation in feet before sizing a jetting change.'};
 // Engine geometry and two-stroke ports
 if(PORT_ABOUT.test(text)){
  const bs=boreStroke(env.statements),cr=compression(env.statements),p=portsFromText(text),stroke=p.stroke??bs?.stroke,two=!isFourStroke(env.model);
  const e:Record<string,unknown>={engine_type:two?'two-stroke':'four-stroke',...(bs?{bore_mm:bs.bore,stroke_mm:bs.stroke}:{}),...(cr?{published_compression_ratio:`${cr}:1`}:{})};
  if(stroke&&p.rpm)e.mean_piston_speed={rpm:p.rpm,...meanPistonSpeed(stroke,p.rpm)};
  if(two){
   let ed=p.duration;
   if(stroke&&p.rod&&p.exhaustTop){try{const ex=portTiming(stroke,p.rod,p.exhaustTop);ed=ex.duration_deg;e.exhaust_port=ex;
    if(p.transferTop){const tr=portTiming(stroke,p.rod,p.transferTop);e.transfer_ports=tr;e.blowdown_deg=blowdownDeg(ex.duration_deg,tr.duration_deg);}
    if(bs)e.trapped_compression_note='Needs the measured clearance volume (cc) to work out; ask for it if the rider is chasing compression.';}catch{}}
   else if(p.exhaustTop)e.missing='Port timing needs the stroke and the rod length (centre to centre) as well as the port height from the deck.';
   if(ed&&p.rpm){const l=tunedPipeLength(ed,p.rpm,exhaustWaveSpeed(500));e.pipe={exhaust_duration_deg:ed,rpm:p.rpm,rough_tuned_length:l,note:'Port to middle of the rear cone, gas about 500 °C. A cooler pipe (cold day, short motos) peaks lower in the rpm; a hotter one peaks higher.'};}
  }
  out.engine=e;
 }
 return Object.keys(out).length?out:null;
}
/** Turns written the way riders write them: "2", "1.5", "1 1/2", "1-3/4", "2 1/4 turns out". */
export function turns(v:unknown):number|undefined{
 const t=String(v??'').trim();const m=t.match(/(\d+(?:\.\d+)?)(?:[\s-]+(\d)\/(\d))?/);if(!m)return undefined;
 const x=Number(m[1])+(m[2]?Number(m[2])/Number(m[3]):0);return Number.isFinite(x)&&x>=0&&x<10?x:undefined;
}
const jetNo=(v:unknown,label:RegExp)=>{const m=String(v??'').match(label);return m?Number(m[1]):undefined;};
const cellNums=(s:string)=>({mj:jetNo(s,/main jet #?(\d+(?:\.\d+)?)/i),ij:jetNo(s,/(?:idling|idle|pilot|slow) jet #?(\d+(?:\.\d+)?)/i),clip:jetNo(s,/clip position (\d)/i),aso:turns((s.match(/screw ([\d.\/ -]+?) turns?/i)??[])[1])});
/**
 * The rider's own jets moved by the same steps the maker's chart takes between where the bike runs right now and the day's
 * air. A rider who needed a bigger main jet at home keeps that difference: the chart's change is applied to their jets, not
 * the chart's numbers. Main and pilot jets scale by the chart's ratio (the way makers' correction factors work); clip
 * position and air-screw turns move by the chart's difference.
 */
export function riderJetting(cells:JetCell[],cfg:Record<string,unknown>,elevationFt:number,tempF:number){
 const mine={mj:jetNo(cfg.main_jet,/#?\s*(\d+(?:\.\d+)?)/),ij:jetNo(cfg.pilot_jet,/#?\s*(\d+(?:\.\d+)?)/),clip:jetNo(cfg.needle_clip,/(?:clip|position|groove)\D{0,12}(\d)/i),aso:turns(cfg.air_screw)};
 if(mine.mj==null&&mine.ij==null)return null;
 const ref=airFromText(String(cfg.jetted_for??''));
 const now={main_jet:cfg.main_jet??null,pilot_jet:cfg.pilot_jet??null,needle_clip:cfg.needle_clip??null,air_screw:cfg.air_screw??null,jetted_for:cfg.jetted_for??null};
 if(ref.elevationFt==null||ref.tempF==null)return {rider_now:now,missing:'To carry the rider\'s own jetting to today\'s air, ask where and in what weather it runs right now (elevation or town, and about how hot). Then the maker\'s chart change can be applied to their jets.'};
 const charts=[...new Set(cells.map(c=>c.chart))].sort((a,b)=>(a==='standard'||a==='standard mode'?-1:0)-(b==='standard'||b==='standard mode'?-1:0));
 const chart=charts[0],list=cells.filter(c=>c.chart===chart);
 const from=jettingFor(list,ref.elevationFt,ref.tempF)[0],to=jettingFor(list,elevationFt,tempF)[0];
 if(!from||!to)return null;
 const a=cellNums(from.settings),b=cellNums(to.settings),out:Record<string,string>={};
 if(mine.mj!=null&&a.mj&&b.mj)out.main_jet=`about #${Math.round(mine.mj*b.mj/a.mj)} (chart goes #${a.mj} → #${b.mj}; yours is #${mine.mj})`;
 if(mine.ij!=null&&a.ij&&b.ij)out.pilot_jet=`about #${Math.round(mine.ij*b.ij/a.ij*10)/10} (chart goes #${a.ij} → #${b.ij}; yours is #${mine.ij})`;
 if(mine.clip!=null&&a.clip!=null&&b.clip!=null)out.needle_clip=b.clip===a.clip?`stay at clip ${mine.clip}`:`clip ${Math.min(5,Math.max(1,mine.clip+(b.clip-a.clip)))} (chart moves ${b.clip>a.clip?'down':'up'} ${Math.abs(b.clip-a.clip)})`;
 if(mine.aso!=null&&a.aso!=null&&b.aso!=null)out.air_screw=b.aso===a.aso?`stay at ${mine.aso} turns`:`about ${Math.round((mine.aso+(b.aso-a.aso))*4)/4} turns (chart moves ${b.aso>a.aso?'out':'in'} ${Math.abs(b.aso-a.aso)})`;
 if(!Object.keys(out).length)return null;
 return {chart,rider_now:now,chart_where_it_runs_right_now:{evidence_id:from.evidence_id,elevation_band:from.elevation_band,air_band:from.air_band,settings:from.settings},
  chart_for_today:{evidence_id:to.evidence_id,elevation_band:to.elevation_band,air_band:to.air_band,settings:to.settings},
  suggested_start:out,
  method:'The maker\'s chart change between the two airs applied to the rider\'s own jets (jets by ratio, clip and screw by difference). Use the nearest jet size the rider has; confirm by plug and feel.',
  ...(from.evidence_id===to.evidence_id?{note:'Both airs fall in the same chart box: no change needed from the air alone.'}:{})};
}
function pick(c:ReturnType<typeof airChange>){return {power_change_pct:c.power_change_pct,carb_mixture_change_pct:c.carb_mixture_change_pct,direction:c.direction};}
