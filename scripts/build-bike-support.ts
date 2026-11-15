// "Is my bike supported?" data for the public home page and the Supported bikes page.
// Inputs: docs/research/knowledge/coverage-export.json (approved bike_knowledge counts per bike-year and domain, from the
// export query in scripts/knowledge/coverage.py) and the reviewed/BAK-written guide library.
// Output: shared/bike-support.json — small, so the signed-out home page can load it without the guide library.
// Run: node --experimental-strip-types scripts/build-bike-support.ts
import {readFileSync,writeFileSync} from 'node:fs';
import {garageModels,garageModelYears,garageModelInfo} from '../shared/garage-models.ts';
import {rebuildStandard} from '../shared/rebuild-standard.ts';

type Row={manufacturer:string;model:string;model_year:number;domain:string;n:number;strong:number};
const rows=JSON.parse(readFileSync('docs/research/knowledge/coverage-export.json','utf8')) as Row[];
const cell=new Map<string,{n:number;strong:number}>();
for(const r of rows){const strong=r.domain==='drivetrain'?Math.max(Number(r.strong),Number(r.n)?1:0):Number(r.strong);cell.set(`${r.manufacturer}|${r.model}|${r.model_year}|${r.domain}`,{n:Number(r.n),strong});}
const score=(c?:{n:number;strong:number})=>!c||!c.n?0:c.strong&&c.n>=3?100:c.strong||c.n>=3?60:30;
const avg=(xs:number[])=>Math.round(xs.reduce((a,b)=>a+b,0)/xs.length);
const AREAS={setup:['setups','suspension','chassis'],specs:['maintenance','engine_architecture','drivetrain','identity'],troubleshooting:['known_issues','power_feel','ecu_electronics','engine_mods']} as const;
const DOMAINS=['identity','engine_architecture','power_feel','ecu_electronics','engine_mods','chassis','suspension','drivetrain','maintenance','known_issues','setups'];

// 2010-2019 bikes: owner's-manual facts on file (docs/research/older/manual-coverage.json, built from the loaded payloads) count as
// partial setup and spec coverage until curated knowledge exists for them; troubleshooting stays at zero.
const manual=new Map((JSON.parse(readFileSync('docs/research/older/manual-coverage.json','utf8')) as {manufacturer:string;model:string;model_year:number;n:number;suspension:number;torques:number}[]).map(m=>[`${m.manufacturer}|${m.model}|${m.model_year}`,m]));
const bikes:unknown[]=[];
for(const [make,models] of Object.entries(garageModels))for(const model of models)for(const year of garageModelYears(make,model)){
 const d=(dom:string)=>score(cell.get(`${make}|${model}|${year}|${dom}`));
 const std=rebuildStandard({manufacturer:make,model,model_year:year,variant:'standard',region:'US'});
 const guidesMet=std.items.filter(i=>i.met).length;
 const m=manual.get(`${make}|${model}|${year}`);
 const setup=Math.max(avg(AREAS.setup.map(d)),m&&m.suspension>=20?60:0),specs=Math.max(avg(AREAS.specs.map(d)),m&&m.n>=100&&m.torques>=40?60:0);
 const knowledge=Math.max(avg(DOMAINS.map(d)),m&&setup>=60&&specs>=60?60:0);   // maker's numbers on file: "Good", troubleshooting shown separately
 bikes.push({make,model,year,type:garageModelInfo[`${make}|${model}`]?.discipline??'',
  knowledge,setup,specs,troubleshooting:avg(AREAS.troubleshooting.map(d)),
  guides:guidesMet,full_rebuild:std.met});
}
writeFileSync('shared/bike-support.json',JSON.stringify({generated:new Date().toISOString().slice(0,10),guide_total:9,bikes}));
console.log(bikes.length,'bike-years');
