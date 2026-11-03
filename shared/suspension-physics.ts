// Chassis and suspension physics for Ask BAK, worked out in code so the numbers are real math, never the model's estimate.
// Inputs are the bike's published values (verified claims) and the rider's own Garage settings; every result says what it
// was worked out from and its limits. First-order models: linear spring and linkage around sag, small-angle geometry.
// The answer presents these as ENGINEERING ("worked out from"), never as a published or tested figure.

export type PublishedChassis={
 rakeDeg?:number;            // steering axis from vertical (caster); converted when the maker prints it from horizontal
 trailMm?:number; wheelbaseMm?:number; clampOffsetMm?:number;
 frontTravelMm?:number; rearTravelMm?:number;
 raceSagMm?:number; staticSagMm?:number;
 shockSpringNmm?:number; forkSpringNmm?:number;
 shockSpringByRiderKg?:{min:number;max:number;rate:number}[];
 frontTire?:{width:number;aspect:number;rim:number};
};
export type RiderSettings={gearedWeightLb?:number;raceSagMm?:number;freeSagMm?:number;shockSpringNmm?:number;forkSpringNmm?:number;forkHeightMm?:number};

const num=(s:string)=>Number(s.replace(/,/g,''));
/** Reads the chassis values a bike's verified claims print, in any of the makers' wordings. Unknown stays undefined. */
export function chassisFromStatements(statements:string[]):PublishedChassis{
 const c:PublishedChassis={},by:{min:number;max:number;rate:number}[]=[];
 for(const raw of statements){const s=raw.replace(/\s+/g,' ');let m;
  if(c.rakeDeg==null&&(m=s.match(/\bcaster(?: angle)?[^:]*:\s*([\d.]+)\s*°?/i)))c.rakeDeg=num(m[1]);
  else if(c.rakeDeg==null&&(m=s.match(/\b(?:steering )?head angle[^:]*:\s*([\d.]+)/i))){const v=num(m[1]);c.rakeDeg=v>45?90-v:v;}
  if(c.trailMm==null&&(m=s.match(/(?:^|\/ |\b)trail[^:]*:[^;]*?(\d{2,3}(?:\.\d+)?)\s*mm/i)))c.trailMm=num(m[1]);
  if(c.wheelbaseMm==null&&(m=s.match(/\bwheelbase[^:]*:\s*([\d,.]+)\s*(?:\+\/-\s*\d+\s*)?mm/i)))c.wheelbaseMm=num(m[1]);
  if(c.clampOffsetMm==null&&(m=s.match(/\b(?:fork|triple clamp|clamp) offset[^:]*:\s*([\d.]+)\s*mm/i)))c.clampOffsetMm=num(m[1]);
  if(c.frontTravelMm==null&&(m=s.match(/\b(?:front|fork)[^:]{0,30}travel[^:]*:\s*([\d.]+)\s*mm/i)))c.frontTravelMm=num(m[1]);
  if(c.rearTravelMm==null&&(m=s.match(/\b(?:rear|shock|wheel)[^:]{0,30}travel[^:]*:\s*([\d.]+)\s*mm/i)))c.rearTravelMm=num(m[1]);
  if(c.raceSagMm==null&&(m=s.match(/\b(?:riding|race|rider) sag[^:]*:\s*([\d.]+)\s*mm/i)))c.raceSagMm=num(m[1]);
  if(c.staticSagMm==null&&(m=s.match(/\b(?:static|free) sag[^:]*:\s*([\d.]+)\s*mm/i)))c.staticSagMm=num(m[1]);
  if((m=s.match(/recommended shock spring rate[^:]*:\s*([\d.]+)\s*N\/mm\.?\s*Rider mass\s*([\d.]+)\s*[–-]\s*([\d.]+)\s*kg/i)))by.push({rate:num(m[1]),min:num(m[2]),max:num(m[3])});
  else if(c.shockSpringNmm==null&&!/optional/i.test(s.split(':')[0])&&(m=s.match(/\bshock[^:]{0,40}(?:standard|stock)[^:]{0,20}spring rate[^:]*:\s*(?:K\s*=\s*)?([\d.]+)\s*N\/mm/i)||s.match(/\bshock[^:]*spring rate[^:]*\((?:standard|stock)\)[^:]*:\s*(?:K\s*=\s*)?([\d.]+)\s*N\/mm/i)))c.shockSpringNmm=num(m[1]);
  if(c.forkSpringNmm==null&&!/optional/i.test(s.split(':')[0])&&(m=s.match(/\bfork[^:]{0,40}(?:standard|stock)[^:]{0,20}spring rate[^:]*:\s*(?:K\s*=\s*)?([\d.]+)\s*N\/mm/i)||s.match(/\bfork[^:]*spring rate[^:]*\((?:standard|stock)\)[^:]*:\s*(?:K\s*=\s*)?([\d.]+)\s*N\/mm/i)))c.forkSpringNmm=num(m[1]);
  if(!c.frontTire&&/\b(tire|tyre)/i.test(s)&&/\bfront\b/i.test(s.split(/:\s/)[0])&&(m=s.match(/:\s*(\d{2,3})\/(\d{2,3})-(\d{2})\b/)))c.frontTire={width:num(m[1]),aspect:num(m[2]),rim:num(m[3])};
 }
 if(by.length)c.shockSpringByRiderKg=by.sort((a,b)=>a.min-b.min);
 return c;
}

const r1=(x:number)=>Math.round(x*10)/10,r0=(x:number)=>Math.round(x);

/** Spring check from sag. Race sag alone can be set with any spring by winding preload; free sag (bike on its own weight)
 *  shows whether the spring suits the rider. Rider sag = race sag − free sag is set by the spring rate. */
export function springCheck(p:PublishedChassis,r:RiderSettings){
 const out:{verdict:string;worked_out_from:string[];suggested_shock_spring_nmm?:number;suggested_fork_spring_nmm?:number;by_maker_table?:string;limits:string[]}={verdict:'',worked_out_from:[],limits:['First-order: assumes the linkage is close to linear around sag; progressive linkages change the exact rate.','Free sag must be measured with the rider off and the bike on its wheels, after bouncing it.']};
 const target=p.raceSagMm,targetFree=p.staticSagMm;
 if(r.gearedWeightLb&&p.shockSpringByRiderKg?.length){const kg=r.gearedWeightLb*0.45359237;const row=p.shockSpringByRiderKg.find(x=>kg>=x.min&&kg<=x.max)??(kg<p.shockSpringByRiderKg[0].min?p.shockSpringByRiderKg[0]:p.shockSpringByRiderKg[p.shockSpringByRiderKg.length-1]);
  out.by_maker_table=`Maker's table: ${row.rate} N/mm for ${row.min}-${row.max} kg rider mass; the rider is ${r0(kg)} kg in gear (the maker's table may mean without gear, about 8-10 kg less).`;}
 if(r.raceSagMm==null||target==null){out.verdict=r.raceSagMm==null?'Race sag not recorded: measure it (rider on in gear, standing in the attack position) to check the spring.':'No published race sag for this bike on file.';return out;}
 out.worked_out_from.push(`race sag ${r.raceSagMm} mm against the maker's ${target} mm`);
 if(r.freeSagMm==null){out.verdict=Math.abs(r.raceSagMm-target)<=5?'Race sag is on target. Measure free sag to know whether the spring rate itself suits you.':`Race sag is ${r.raceSagMm>target?'deeper':'shallower'} than the maker's ${target} mm by ${Math.abs(r.raceSagMm-target)} mm. Set it with preload first, then measure free sag to check the spring.`;return out;}
 out.worked_out_from.push(`free sag ${r.freeSagMm} mm`+(targetFree!=null?` against the maker's static sag ${targetFree} mm`:''));
 const lo=(targetFree??35)-7,hi=(targetFree??35)+7,riderSag=r.raceSagMm-r.freeSagMm,targetRider=target-(targetFree??35);
 const k=r.shockSpringNmm??p.shockSpringNmm;
 if(r.freeSagMm<lo)out.verdict=`Free sag ${r.freeSagMm} mm is small for ${r.raceSagMm} mm race sag: the preload is wound in to hold the rider up, so the spring is too soft for this rider.`;
 else if(r.freeSagMm>hi)out.verdict=`Free sag ${r.freeSagMm} mm is large: preload is backed off to get race sag, so the spring is too stiff for this rider.`;
 else out.verdict=`Free sag ${r.freeSagMm} mm with ${r.raceSagMm} mm race sag: the spring rate suits this rider${Math.abs(r.raceSagMm-target)>5?'; set race sag back toward '+target+' mm with preload':''}.`;
 if(k&&riderSag>0&&targetRider>0&&(r.freeSagMm<lo||r.freeSagMm>hi)){
  const ratio=riderSag/targetRider,ks=Math.round(k*ratio*2)/2;out.suggested_shock_spring_nmm=ks;
  out.worked_out_from.push(`${k} N/mm shock spring${r.shockSpringNmm?' (rider\'s)':' (stock)'}; rider sag ${riderSag} mm vs ${targetRider} mm at the maker's numbers`);
  const kf=r.forkSpringNmm??p.forkSpringNmm;if(kf){out.suggested_fork_spring_nmm=Math.round(kf*Math.sqrt(ratio)*10)/10;out.limits.push('Fork rate is scaled to keep the front and rear in balance with the shock change; confirm with fork sag and how the front holds up under braking.');}
 }
 return out;
}

/** Steering geometry changes. Published caster and trail give the effective offset (clamp plus axle lug), so changes are
 *  worked out from the bike's own numbers. Angles from vertical. */
export function geometry(p:PublishedChassis){
 if(p.rakeDeg==null||!p.frontTire)return null;
 const R=p.frontTire.rim*25.4/2+p.frontTire.width*p.frontTire.aspect/100,th=p.rakeDeg*Math.PI/180;
 // Effective offset (clamp plus axle lug) implied by the published trail. Without a published trail, the clamp offset alone
 // is used: the size of each change is still close (it hardly depends on offset), but the trail figure itself is not known.
 const estimated=p.trailMm==null;if(estimated&&p.clampOffsetMm==null)return null;
 const d=estimated?p.clampOffsetMm!:R*Math.sin(th)-p.trailMm!*Math.cos(th);
 const base=estimated?(R*Math.sin(th)-d)/Math.cos(th):p.trailMm!;
 const trailAt=(t:number,off:number)=>(R*Math.sin(t)-off)/Math.cos(t);
 const wb=p.wheelbaseMm;
 const forkHeight=(mm:number)=>{if(!wb)return null;const t=th-mm/wb;return {head_angle_change_deg:r1(-(mm/wb)*180/Math.PI),trail_change_mm:r1(trailAt(t,d)-base)};};
 const rearSag=(mm:number)=>{if(!wb)return null;const t=th+mm/wb;return {head_angle_change_deg:r1((mm/wb)*180/Math.PI),trail_change_mm:r1(trailAt(t,d)-base)};};
 const offset=(mm:number)=>({trail_change_mm:r1(trailAt(th,d+mm)-base)});
 return {
  worked_out_from:[estimated?`head angle ${r1(90-p.rakeDeg)}° and ${p.clampOffsetMm} mm clamp offset (maker's); trail itself isn't published for this bike, so only the size of each change is worked out`:`caster ${p.rakeDeg}° and trail ${p.trailMm} mm (maker's)`,`front tire ${p.frontTire.width}/${p.frontTire.aspect}-${p.frontTire.rim} (unloaded radius ${r0(R)} mm)`,...(wb?[`wheelbase ${wb} mm`]:[])],
  ...(estimated?{}:{effective_offset_mm:r1(d)}),
  fork_tubes_up_5mm:forkHeight(5), fork_tubes_up_10mm:forkHeight(10),
  rear_sag_plus_5mm:rearSag(5), rear_sag_plus_10mm:rearSag(10),
  clamp_offset_plus_2mm:offset(2), clamp_offset_minus_2mm:offset(-2), clamp_offset_plus_3mm:offset(3), clamp_offset_minus_3mm:offset(-3),
  how_to_read:'Less trail and a steeper head angle turn in quicker and feel lighter but less stable at speed; more trail is calmer and holds a line but turns in slower. Fork tubes up in the clamps and less rear sag steepen it; more rear sag or tubes down slacken it. More clamp offset cuts trail.',
  limits:['Static geometry with the tire unloaded; under sag and braking the real numbers move, but the direction and size of a change hold.'],
 };
}

/** How much thinner suspension oil gets as it warms, from a typical 5W suspension oil (about 16 cSt at 40 °C, 6 cSt at
 *  100 °C, Walther/ASTM D341). Low-speed damping through bleeds and clickers follows viscosity closely; high-speed (shim)
 *  damping changes less. Relative to the reference temperature. */
export function oilThinning(fromF:number,toF:number){
 const T=(f:number)=>(f-32)*5/9+273.15,A=Math.log10(Math.log10(16+0.7)),B=Math.log10(Math.log10(6+0.7));
 const slope=(B-A)/(Math.log10(373.15)-Math.log10(313.15));
 const nu=(f:number)=>10**(10**(A+slope*(Math.log10(T(f))-Math.log10(313.15))))-0.7;
 const ratio=nu(toF)/nu(fromF);
 return {from_f:fromF,to_f:toF,viscosity_change_pct:r0((ratio-1)*100),low_speed_damping_change_pct:r0((ratio-1)*100),
  worked_out_from:['a typical 5W suspension oil viscosity curve; your oil brand and grade shift the exact figure'],
  how_to_read:'Negative means the oil is thinner, so low-speed damping is weaker: the bike feels softer and quicker to rebound as it heats up. Oil inside a working shock runs well above air temperature, so the real change through a moto is larger than the air-temperature change alone.'};
}

/** Everything the physics can say for this bike and rider, for Ask BAK. Null when there's nothing to work from. */
export function physicsContext(statements:string[],r:RiderSettings,temps?:{morningF?:number;afternoonF?:number}){
 const p=chassisFromStatements(statements);
 const spring=springCheck(p,r),geo=geometry(p);
 const heat=temps?.morningF!=null&&temps?.afternoonF!=null?oilThinning(temps.morningF,temps.afternoonF):oilThinning(60,95);
 if(!spring.worked_out_from.length&&!geo&&!spring.by_maker_table)return {published:p,oil_heat_example:heat};
 return {published:p,spring_check:spring,geometry:geo,oil_heat_example:heat};
}
