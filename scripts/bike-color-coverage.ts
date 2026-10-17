import {readFileSync,readdirSync} from 'node:fs';
import {decodeFamily,pickerChoices,type CatalogPart,type FamilyFile} from '../shared/parts-picker.ts';
import {partSystems} from '../shared/installed-parts.ts';
import {catalogColors} from '../shared/build-visual.ts';
function report(catalog:CatalogPart[]|null,pilot:boolean){
console.log('| Part type | Choices with color data | Total choices |');
console.log('|---|---:|---:|');
for(const system of partSystems){
 const choices=pickerChoices(catalog,system.key,pilot?'injected':null);
 const types=[...new Set(choices.map(c=>c.type).filter(Boolean))];
 for(const type of types){const rows=choices.filter(c=>c.type===type);console.log(`| ${type} | ${rows.filter(c=>catalogColors(c.brand,c.name).length).length} | ${rows.length} |`);}
}
}
if(process.argv.includes('--all')){
 console.log('All-family color research, not OEM model coverage or fitment certification. Unique picker names per system/family; services excluded. Repeated families are not global unique products.');
 for(const file of readdirSync('public/parts-catalog').filter(f=>f.endsWith('.json')).sort()){
  const f=JSON.parse(readFileSync('public/parts-catalog/'+file,'utf8')) as FamilyFile;
  // Decode every inventory row once; synthetic key is report-only, never saved as fitment.
  const all={...f,bikes:{'Inventory|All|0':f.items.map((_,i)=>i===0?0:1)}};
  console.log('\nInventory: '+file);report(decodeFamily(all,'Inventory','All',0),false);
 }
}else{
 console.log('Pilot: KTM 450 SX-F 2025; unique picker choices, not global inventory coverage.');
 report(decodeFamily(JSON.parse(readFileSync('public/parts-catalog/ktm-family.json','utf8')),'KTM','450 SX-F',2025),true);
}
