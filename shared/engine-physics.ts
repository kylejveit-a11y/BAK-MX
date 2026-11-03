// Engineering math for the drivetrain and engine, batch 2: chain and sprockets (gearing and where the axle ends up), air
// density (what the day's air does to power and jetting), two-stroke port timing and pipe length, trapped compression
// and piston speed. Plain physics with the assumptions said out loud; nothing here is a published spec for a bike.

const fin=(...v:number[])=>{if(v.some(x=>!Number.isFinite(x)))throw new RangeError('Enter every value as a number.');};
const pos=(...v:number[])=>{fin(...v);if(v.some(x=>x<=0))throw new RangeError('Enter values greater than zero.');};
const whole=(...v:number[])=>{pos(...v);if(v.some(x=>!Number.isInteger(x)))throw new RangeError('Sprocket teeth and chain links must be whole numbers.');};
const r1=(x:number)=>Math.round(x*10)/10, r2=(x:number)=>Math.round(x*100)/100;

// ---------- Chain and sprockets ----------

/** Chain pitch in mm by chain size. 420 and 428 share a pitch (428 is wider); 520, 525 and 530 share 5/8 in. */
export const CHAIN_PITCH_MM:Record<string,number>={'415':12.7,'420':12.7,'428':12.7,'520':15.875,'525':15.875,'530':15.875};
export function chainPitch(size:string|number):number{const p=CHAIN_PITCH_MM[String(size).replace(/\D/g,'')];if(!p)throw new RangeError('Chain size must be 420, 428, 520, 525 or 530.');return p;}

/** Usual chain size by class. Bikes differ, so whatever uses this says it is the usual size and asks the rider to check. */
export function usualChainSize(displacementCc:number|undefined|null):{size:string;usual:true}|null{
 if(!displacementCc||!Number.isFinite(displacementCc))return null;
 return {size:displacementCc<=70?'420':displacementCc<=160?'428':'520',usual:true};
}

export type ChainChange={final_drive_old:number;final_drive_new:number;final_drive_change_pct:number;
 /** + means the rear axle has to move back (longer wheelbase); − forward. mm. */
 axle_moves_mm:number;wheelbase_change_mm:number;links_change:number;
 /** Top speed per gear at the same rpm, and the pull in every gear, both in %. */
 speed_change_pct:number;pull_change_pct:number;feel:string;note:string};

/**
 * What a sprocket or chain change does. Each tooth added at the rear wraps about half a pitch more chain, shared between the
 * top and bottom runs, so the axle comes forward about a quarter of a pitch; two links added let it go back one pitch.
 * Small-angle approximation: good to a fraction of a millimetre for the 1-3 tooth changes riders make.
 */
export function chainChange(pitchMm:number,oldFront:number,oldRear:number,newFront:number,newRear:number,linksChange=0):ChainChange{
 pos(pitchMm);whole(oldFront,oldRear,newFront,newRear);fin(linksChange);
 if(!Number.isInteger(linksChange)||linksChange%2!==0)throw new RangeError('A chain is changed two links at a time (an even number).');
 const fdOld=oldRear/oldFront,fdNew=newRear/newFront;
 const axle=pitchMm*(linksChange/2-((newFront-oldFront)+(newRear-oldRear))/4);
 const change=(fdNew/fdOld-1)*100;
 const feel=Math.abs(change)<0.5?'Same gearing to the rider.':change>0?'Shorter gearing: pulls harder in every gear, revs out sooner, lower top speed in each gear.':'Taller gearing: more speed in each gear, softer pull, the bike can feel lazy out of slow corners.';
 const wb=Math.abs(axle)<0.5?'The axle stays about where it is.':axle<0?`The axle comes forward about ${r1(-axle)} mm: a slightly shorter wheelbase turns a touch quicker and is a touch less settled at speed.`:`The axle goes back about ${r1(axle)} mm: a slightly longer wheelbase is a touch more stable and a touch slower to turn.`;
 return {final_drive_old:Math.round(fdOld*1000)/1000,final_drive_new:Math.round(fdNew*1000)/1000,final_drive_change_pct:r2(change),
  axle_moves_mm:r1(axle),wheelbase_change_mm:r1(axle),links_change:linksChange,speed_change_pct:r2((fdOld/fdNew-1)*100),pull_change_pct:r2(change),
  feel:`${feel} ${wb}`,note:'Check the axle still sits inside the adjuster marks; if it runs out, change the chain two links at a time (each two links moves the axle about one pitch). The bike\'s adjuster range is not listed here.'};
}

/** The usual gearing questions for the rider's current sprockets: one tooth either way, front and rear. */
export function gearingOptions(pitchMm:number,front:number,rear:number){
 const opt=(label:string,f:number,r:number)=>{const c=chainChange(pitchMm,front,rear,f,r);return {change:label,gearing:`${f}/${r}`,final_drive_change_pct:c.final_drive_change_pct,axle_moves_mm:c.axle_moves_mm};};
 return [opt('rear +1',front,rear+1),opt('rear +2',front,rear+2),opt('rear -1',front,rear-1),opt('rear -2',front,rear-2),opt('front -1',front-1,rear),opt('front +1',front+1,rear)];
}

/** Reads a gearing change from what the rider wrote: "13/50 to 13/52", "two teeth on the rear", "down one up front". */
export function gearingChangeFromText(text:string,front?:number,rear?:number):{front:number;rear:number}|null{
 const t=text.toLowerCase();
 const pair=t.match(/\b(\d{2})\s*[/x-]\s*(\d{2})\b[^.?!]{0,30}?\b(?:to|->|→|into|for)\s*(?:a\s*)?(\d{2})\s*[/x-]\s*(\d{2})\b/);
 if(pair)return {front:Number(pair[3]),rear:Number(pair[4])};
 if(!front||!rear)return null;
 const numWord:Record<string,number>={a:1,an:1,one:1,two:2,three:3,'1':1,'2':2,'3':3};
 const m=t.match(/\b(go(?:ing)?|went|drop(?:ping)?|add(?:ing)?|up|down|plus|minus|\+|-)?\s*(a|an|one|two|three|[123])\s*(?:tooth|teeth|t)\b[^.?!]{0,25}?\b(rear|back|front|countershaft|c\/s)\b/);
 const m2=m??t.match(/\b(rear|back|front|countershaft)\b[^.?!]{0,20}?\b(up|down|bigger|smaller|larger|\+|-)\s*(a|an|one|two|three|[123])\b/);
 if(!m2)return null;
 let n:number,where:string,dir:number;
 if(m){n=numWord[m[2]];where=m[3];const w=m[1]??'',ctx=t.slice(Math.max(0,(m.index??0)-25),(m.index??0)+m[0].length+15);
  dir=/\b(down|drop|dropping|minus|smaller|less)\b|-\s*\d/.test(w+' '+ctx)?-1:1;}
 else{where=m2[1];dir=/down|smaller|-/.test(m2[2])?-1:1;n=numWord[m2[3]];}
 const atFront=/front|counter|c\/s/.test(where);
 return atFront?{front:front+dir*n,rear}:{front,rear:rear+dir*n};
}

// ---------- Air density ----------

export type AirDay={elevation_ft:number;temp_f:number;humidity_pct:number;humidity_assumed:boolean;
 air_density_pct:number;density_altitude_ft:number;power_pct:number;carb_mixture:string;efi:string};

/** Station pressure in Pa from elevation on a standard day (weather can move it a couple of percent either way). */
const stationPa=(elevationM:number)=>101325*Math.pow(1-2.25577e-5*elevationM,5.25588);
/** Water vapour pressure in Pa at saturation (Tetens). */
const saturationPa=(tempC:number)=>610.78*Math.pow(10,7.5*tempC/(tempC+237.3));

/**
 * Air on the day versus standard sea-level air (59 °F, dry): how much air the engine gets, the elevation that air
 * "feels" like, and the direction it moves jetting. Power is taken as following the dry air (oxygen) density, the usual
 * first approximation for a naturally aspirated engine.
 */
export function airDensity(elevationFt:number,tempF:number,humidityPct?:number|null):AirDay{
 fin(elevationFt,tempF);if(elevationFt<-1500||elevationFt>15000)throw new RangeError('Elevation must be between -1,500 and 15,000 ft.');
 if(tempF<-40||tempF>130)throw new RangeError('Temperature must be between -40 and 130 °F.');
 const assumed=humidityPct==null||!Number.isFinite(humidityPct);const rh=assumed?50:Math.min(100,Math.max(0,humidityPct as number));
 const tc=(tempF-32)*5/9,tk=tc+273.15,p=stationPa(elevationFt*0.3048),pv=rh/100*saturationPa(tc),pd=p-pv;
 const rho=pd/(287.058*tk)+pv/(461.495*tk),dry=pd/(287.058*tk),std=1.225;
 const densityAlt=145442.16*(1-Math.pow(rho/std,0.234969));
 const ratio=dry/std;
 // A carburettor meters fuel by the pressure drop, so the air-fuel ratio moves with the square root of air density.
 const richer=(1/Math.sqrt(ratio)-1)*100;
 const carb=Math.abs(richer)<1?'About standard air: no jetting change from the air alone.':richer>0?`Thinner air than standard: a carb runs about ${r1(richer)}% richer than it would at sea level on a 59 °F day, so the usual direction is leaner (smaller main jet, needle clip up a position) versus a sea-level baseline.`:`Denser air than standard: a carb runs about ${r1(-richer)}% leaner than at sea level on a 59 °F day, so the usual direction is richer versus a sea-level baseline.`;
 return {elevation_ft:Math.round(elevationFt),temp_f:Math.round(tempF),humidity_pct:Math.round(rh),humidity_assumed:assumed,
  air_density_pct:r1(rho/std*100),density_altitude_ft:Math.round(densityAlt/10)*10,power_pct:r1(ratio*100),carb_mixture:carb,
  efi:'Fuel injection reads air temperature and pressure and corrects the fuel on its own; the power loss from thin air still happens. Map choice is about how the power feels, not a fix for the air.'};
}

/** How much the mixture and power move from where the rider jetted (or mapped) to the race: the useful comparison. */
export function airChange(from:{elevationFt:number;tempF:number;humidityPct?:number|null},to:{elevationFt:number;tempF:number;humidityPct?:number|null}){
 const a=airDensity(from.elevationFt,from.tempF,from.humidityPct),b=airDensity(to.elevationFt,to.tempF,to.humidityPct);
 const ratio=b.power_pct/a.power_pct,richer=(1/Math.sqrt(ratio)-1)*100;
 return {from:a,to:b,power_change_pct:r1((ratio-1)*100),carb_mixture_change_pct:r1(richer),
  direction:Math.abs(richer)<1?'Close enough that jetting set for the first conditions should still be right.':richer>0?`The air is thinner, so a carb jetted for the first conditions runs about ${r1(richer)}% richer: lean it a step if it feels fat or blubbers.`:`The air is denser, so a carb jetted for the first conditions runs about ${r1(-richer)}% leaner: richen it a step if it pings, surges or runs hot.`};
}

// ---------- Engine: piston motion, two-stroke ports, pipe, compression ----------

/** Piston distance below its TDC position (mm) at crank angle θ (degrees after TDC). */
export function pistonDrop(strokeMm:number,rodMm:number,crankDeg:number):number{
 pos(strokeMm,rodMm);fin(crankDeg);const r=strokeMm/2;if(rodMm<=r)throw new RangeError('Rod length must be longer than half the stroke.');
 const t=crankDeg*Math.PI/180;return r*(1-Math.cos(t))+rodMm-Math.sqrt(rodMm*rodMm-r*r*Math.sin(t)*Math.sin(t));
}

/**
 * Port timing from a port's top edge. portTopMm is measured from the top of the cylinder (the deck) down to the top of the
 * port; deckMm is how far the piston crown sits below the deck at TDC (0 when flush, negative when it pokes out).
 * Returns the crank angle the port opens at and its total open duration, in degrees.
 */
export function portTiming(strokeMm:number,rodMm:number,portTopMm:number,deckMm=0){
 pos(strokeMm,rodMm,portTopMm);fin(deckMm);
 const drop=portTopMm-deckMm;if(drop<=0||drop>=strokeMm)throw new RangeError('The port top must be between the piston crown at TDC and the bottom of the stroke.');
 let lo=0,hi=180;for(let i=0;i<60;i++){const mid=(lo+hi)/2;if(pistonDrop(strokeMm,rodMm,mid)<drop)lo=mid;else hi=mid;}
 const opens=(lo+hi)/2;return {opens_atdc_deg:r1(opens),duration_deg:r1(2*(180-opens))};
}

/** Exhaust-before-transfer lead each side of BDC: what lets the cylinder pressure drop before the transfers open. */
export const blowdownDeg=(exhaustDurationDeg:number,transferDurationDeg:number)=>{pos(exhaustDurationDeg,transferDurationDeg);if(transferDurationDeg>=exhaustDurationDeg)throw new RangeError('Exhaust duration must be longer than transfer duration.');return r1((exhaustDurationDeg-transferDurationDeg)/2);};

/** Speed of sound in hot exhaust gas, m/s, from its temperature (γ≈1.35, R≈287). */
export const exhaustWaveSpeed=(gasTempC:number)=>{fin(gasTempC);if(gasTempC<0||gasTempC>1100)throw new RangeError('Gas temperature must be between 0 and 1,100 °C.');return Math.sqrt(1.35*287*(gasTempC+273.15));};

/**
 * Rough tuned length from the exhaust port to the middle of the reflecting (rear) cone: the pressure wave has to go there
 * and back while the port is open. L = a·ED / (12·N). Teaching math, not a pipe design: real pipes are built from the full
 * wave picture and tested on a dyno.
 */
export function tunedPipeLength(exhaustDurationDeg:number,rpm:number,waveSpeedMs=500){
 pos(exhaustDurationDeg,rpm,waveSpeedMs);const m=waveSpeedMs*exhaustDurationDeg/(12*rpm);return {length_mm:Math.round(m*1000),length_in:r1(m*1000/25.4)};
}
/** Tuned rpm moves with wave speed, which moves with the square root of gas temperature: a cold pipe peaks lower. */
export const pipeRpmShiftPct=(fromGasC:number,toGasC:number)=>r1((exhaustWaveSpeed(toGasC)/exhaustWaveSpeed(fromGasC)-1)*100);

/** Two-stroke trapped compression: only the volume above the exhaust port top is compressed. */
export function trappedCompression(boreMm:number,exhaustTopFromTdcMm:number,clearanceCc:number){
 pos(boreMm,exhaustTopFromTdcMm,clearanceCc);const trapped=Math.PI/4*boreMm*boreMm*exhaustTopFromTdcMm/1000;
 return {trapped_cc:r2(trapped),ratio:r2((trapped+clearanceCc)/clearanceCc)};
}

/** Mean piston speed: 2 × stroke × rpm. About 20-25 m/s is the working range for modern race engines. */
export function meanPistonSpeed(strokeMm:number,rpm:number){pos(strokeMm,rpm);const ms=2*strokeMm/1000*rpm/60;return {m_s:r1(ms),ft_min:Math.round(ms*196.85)};}

// ---------- Shared workshop calculators (web Setup and the app's Setup tab) ----------

export type WorkshopCalc={key:string;title:string;fields:[string,string][];run:(v:Record<string,number>)=>string};
export const ENGINE_CALCULATORS:WorkshopCalc[]=[
 {key:'chain',title:'Chain & wheelbase',fields:[['pitch','Chain size (420, 428 or 520)'],['oldFront','Current front sprocket (teeth)'],['oldRear','Current rear sprocket (teeth)'],['front','New front sprocket (teeth)'],['rear','New rear sprocket (teeth)'],['links','Links added (+2) or removed (-2), or 0']],
  run:v=>{const c=chainChange(chainPitch(v.pitch),v.oldFront,v.oldRear,v.front,v.rear,v.links||0);return `Final drive ${c.final_drive_old} → ${c.final_drive_new} (${c.final_drive_change_pct>0?'+':''}${c.final_drive_change_pct}%). Rear axle moves ${c.axle_moves_mm>0?'back':'forward'} about ${Math.abs(c.axle_moves_mm)} mm. ${c.feel} ${c.note}`;}},
 {key:'air',title:'Air & jetting',fields:[['elevation','Track elevation (ft)'],['temp','Air temperature (°F)'],['humidity','Humidity (%)']],
  run:v=>{const a=airDensity(v.elevation,v.temp,Number.isFinite(v.humidity)?v.humidity:null);return `Air density ${a.air_density_pct}% of standard sea-level air; it rides like ${a.density_altitude_ft.toLocaleString('en-US')} ft. Expect about ${a.power_pct}% of sea-level power. ${a.carb_mixture} ${a.efi}`;}},
 {key:'ports',title:'Two-stroke ports',fields:[['stroke','Stroke (mm)'],['rod','Rod length, centre to centre (mm)'],['exhaust','Deck to top of exhaust port (mm)'],['transfer','Deck to top of transfer ports (mm)'],['deck','Piston crown below deck at TDC (mm, 0 if flush)']],
  run:v=>{const e=portTiming(v.stroke,v.rod,v.exhaust,v.deck||0),t=portTiming(v.stroke,v.rod,v.transfer,v.deck||0);return `Exhaust opens ${e.opens_atdc_deg}° after TDC, open ${e.duration_deg}°. Transfers open ${t.opens_atdc_deg}° after TDC, open ${t.duration_deg}°. Blowdown ${blowdownDeg(e.duration_deg,t.duration_deg)}° each side of BDC. Measured numbers only; port timing work is for an engine builder.`;}},
 {key:'pipe',title:'Pipe length',fields:[['duration','Exhaust duration (degrees)'],['rpm','RPM the pipe should work at'],['gas','Exhaust gas temperature (°C, 500 if unsure)']],
  run:v=>{const a=exhaustWaveSpeed(Number.isFinite(v.gas)&&v.gas>0?v.gas:500),l=tunedPipeLength(v.duration,v.rpm,a);return `About ${l.length_mm} mm (${l.length_in} in) from the port to the middle of the rear cone, with a wave speed of ${Math.round(a)} m/s. A rough guide for understanding, not a pipe design. A cooler pipe peaks lower: 100 °C cooler moves the peak about ${Math.abs(pipeRpmShiftPct(Number.isFinite(v.gas)&&v.gas>0?v.gas:500,(Number.isFinite(v.gas)&&v.gas>0?v.gas:500)-100))}% lower.`;}},
 {key:'piston',title:'Compression & piston speed',fields:[['bore','Bore (mm)'],['stroke','Stroke (mm)'],['clearance','Measured clearance volume (cc)'],['exhaustTop','Two-stroke: TDC to exhaust port top (mm, 0 for a four-stroke)'],['rpm','RPM']],
  run:v=>{const swept=Math.PI/4*v.bore*v.bore*v.stroke/1000;pos(v.clearance);const geo=(swept+v.clearance)/v.clearance,s=meanPistonSpeed(v.stroke,v.rpm);
   const tr=v.exhaustTop>0?trappedCompression(v.bore,v.exhaustTop,v.clearance):null;
   return `Swept ${r1(swept)} cc, geometric compression ${r2(geo)}:1${tr?`, trapped compression ${tr.ratio}:1 (what the engine really squeezes once the exhaust port closes)`:''}. Mean piston speed at ${Math.round(v.rpm).toLocaleString('en-US')} rpm: ${s.m_s} m/s (${s.ft_min.toLocaleString('en-US')} ft/min).`;}},
];
