/** Carbureted or fuel injected, for the bikes in the Garage roster (2010 on).
 *  Four-strokes from 2020 are all fuel injected. Before 2020 only the changeovers we are sure of are answered; the rest
 *  return null so the app shows "not on file" and BAK asks instead of guessing:
 *  - Honda CRF250R / CRF450R injected from 2010; CRF150R, CRF250X and CRF450X carbureted.
 *  - Yamaha YZ450F injected from 2010; YZ250F carbureted to 2013, injected from 2014.
 *  - Kawasaki KX250 / KX450 (2014 on in the roster) and Husqvarna FC / FE (2014 on) injected.
 *  Two-strokes changed over model by model:
 *  - KTM SX and Husqvarna TC two-strokes: throttle-body injection from 2023 (KTM spec pages; the 2022 SX ran a Mikuni carb).
 *  - GasGas MC two-strokes: throttle-body injection from 2024 (GasGas: every 2024 two-stroke uses a Keihin throttle body).
 *  - KTM XC / XC-W, Husqvarna TX / TE, GasGas EX / EC two-strokes: transfer-port injection, then throttle body. Injected.
 *  - KTM 85 SX and Yamaha YZ two-strokes: carburetor (Yamaha's 2026 YZ250 spec lists a Keihin PWK38S).
 *  Null when not known: the app then hides nothing and BAK asks. */
export type FuelSystem='injected'|'carburetor';
export function fuelSystem(make:string,model:string,year:number):FuelSystem|null{
 const m=model.toUpperCase().replace(/\s+/g,' ').trim();
 const four=/SX-F|XC-F|XCF-W|EXC-F|^F[CXE] |\d{3}F\b|^CRF|^KX(250|450)X?$|^TF |^WR|^YZ\d{3}FX?$/.test(m);
 if(four){
  if(make==='Honda'&&/^CRF(150R|250X|450X)$/.test(m))return 'carburetor';
  if(year>=2020)return 'injected';
  if(make==='Honda'&&/^CRF(250|450)R$/.test(m))return 'injected';
  if(make==='Yamaha'&&m==='YZ450F')return 'injected';
  if(make==='Yamaha'&&m==='YZ250F')return year>=2014?'injected':'carburetor';
  if(make==='Kawasaki'&&/^KX(250|450)$/.test(m)&&year>=2014)return 'injected';
  if(make==='Husqvarna'&&/^F[CE] /.test(m)&&year>=2014)return 'injected';
  return null;
 }
 if(make==='KTM'){
  if(/^85 SX/.test(m))return 'carburetor';
  if(/^(125|150|250|300) SX$/.test(m))return year>=2023?'injected':'carburetor';
  if(/^(250|300) XC(-W)?$/.test(m)&&year>=2020)return 'injected';
  if(/^(125|150) XC(-W)?$/.test(m)&&year>=2023)return 'injected';
  return null;
 }
 if(make==='Husqvarna'){
  if(/^TC (125|150|250|300)$/.test(m))return year>=2023?'injected':'carburetor';
  if(/^(TX|TE) (250|300)$/.test(m)&&year>=2020)return 'injected';
  return null;
 }
 if(make==='GasGas'){
  if(/^MC (125|250)$/.test(m))return year>=2024?'injected':'carburetor';
  if(/^(EX|EC) (250|300)$/.test(m))return 'injected';
  return null;
 }
 if(make==='Yamaha'&&/^YZ(125|250)X?$/.test(m)&&year<=2026)return 'carburetor';
 return null;
}
export const fuelSystemLabel=(f:FuelSystem|null)=>f==='injected'?'fuel injected':f==='carburetor'?'carbureted':'not on file';
