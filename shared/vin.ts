// Optional VIN on a Garage bike. Used only to check the bike the rider picked against the frame: the model-year character
// (10th) and, for makers whose world-manufacturer code is well known, the maker. Never sent to the AI provider.
const YEAR:Record<string,number>={L:2020,M:2021,N:2022,P:2023,R:2024,S:2025,T:2026,V:2027,W:2028,X:2029,Y:2030,
 A:2010,B:2011,C:2012,D:2013,E:2014,F:2015,G:2016,H:2017,J:2018,K:2019};
const MAKER:[RegExp,string][]=[[/^JYA/,'Yamaha'],[/^JH2/,'Honda'],[/^JK[AB]/,'Kawasaki'],[/^JS1/,'Suzuki'],[/^SMT/,'Triumph']];
const VALUES:Record<string,number>={A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,J:1,K:2,L:3,M:4,N:5,P:7,R:9,S:2,T:3,U:4,V:5,W:6,X:7,Y:8,Z:9};
const WEIGHTS=[8,7,6,5,4,3,2,10,0,9,8,7,6,5,4,3,2];

export const cleanVin=(v:string)=>v.toUpperCase().replace(/[^A-Z0-9]/g,'');
/** North American VINs carry a check digit in position 9; others may not, so a mismatch is only mentioned, never blocking. */
function checkDigitOk(vin:string){const sum=[...vin].reduce((n,c,i)=>n+(/\d/.test(c)?Number(c):VALUES[c]??0)*WEIGHTS[i],0),r=sum%11;return vin[8]===(r===10?'X':String(r));}

export type VinCheck={level:'ok'|'check'|'error';text:string};
export function checkVin(raw:string,bike:{manufacturer:string;model_year:number}):VinCheck|null{
 const vin=cleanVin(raw);if(!vin)return null;
 if(vin.length!==17)return {level:'error',text:`A VIN has 17 characters; this one has ${vin.length}.`};
 if(/[IOQ]/.test(vin))return {level:'error',text:'VINs never use the letters I, O or Q. Check for a 1 or 0.'};
 const notes:string[]=[],year=YEAR[vin[9]],maker=MAKER.find(([re])=>re.test(vin))?.[1];
 if(maker&&maker!==bike.manufacturer)notes.push(`This VIN reads as a ${maker}, but the bike is saved as a ${bike.manufacturer}.`);
 if(year&&year!==bike.model_year)notes.push(`This VIN reads as a ${year} model year, but the bike is saved as a ${bike.model_year}. Check the year you picked.`);
 if(notes.length)return {level:'check',text:notes.join(' ')};
 // US-market Japanese and North American VINs use the check character; European-built bikes may not, so they are not checked.
 if(/^[J1-5]/.test(vin)&&!checkDigitOk(vin))return {level:'check',text:'The check character in this VIN doesn’t add up. It may have a typo.'};
 return {level:'ok',text:year?`VIN matches: ${year}${maker?' '+maker:''} model year.`:'VIN saved.'};
}
