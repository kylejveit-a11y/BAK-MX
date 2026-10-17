import {readFileSync} from 'node:fs';
import {decodeFamily,pickerChoices} from '../shared/parts-picker.ts';
import {partSystems} from '../shared/installed-parts.ts';
import {catalogColors} from '../shared/build-visual.ts';
const catalog=decodeFamily(JSON.parse(readFileSync('public/parts-catalog/ktm-family.json','utf8')),'KTM','450 SX-F',2025);
console.log('Pilot: KTM 450 SX-F 2025; unique picker choices, not global inventory coverage.');
console.log('| Part type | Choices with color data | Total choices |');
console.log('|---|---:|---:|');
for(const system of partSystems){
 const choices=pickerChoices(catalog,system.key,'injected');
 const types=[...new Set(choices.map(c=>c.type).filter(Boolean))];
 for(const type of types){const rows=choices.filter(c=>c.type===type);console.log(`| ${type} | ${rows.filter(c=>catalogColors(c.brand,c.name).length).length} | ${rows.length} |`);}
}
