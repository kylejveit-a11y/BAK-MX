import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {decodeFamily,pickerChoices,optionsFor,type FamilyFile,type Choice} from '../shared/parts-picker.ts';
import {wheelsFor} from '../shared/tire-knowledge.ts';
// The parts catalog offers tires and tire inserts only in sizes that fit the bike's rims (scripts/aftermarket/build_catalog.py,
// same wheel rule as wheelsFor). These checks run on the built public/parts-catalog files.
const FAMILIES=['ktm-family','yamaha','honda','kawasaki','suzuki','triumph'];
const files=Object.fromEntries(FAMILIES.map(f=>[f,JSON.parse(readFileSync(new URL(`../public/parts-catalog/${f}.json`,import.meta.url),'utf8')) as FamilyFile]));
/** Rims named in an option label: 110/90-19, 120/80R19, 2.50-10, 19in, "21 inch". */
const rims=(t:string)=>[...t.matchAll(/(?<![\d.])\d{2,3}\/\d{2,3}[A-Z]{0,2}-?(\d{1,2})(?!\d)|(?<![\d.])\d\.\d{1,2}\s*-\s*(\d{1,2})(?!\d)|(?<![\d./])(\d{2})\s*(?:in\b|"|-?inch)/gi)].map(m=>String(Number(m[1]??m[2]??m[3])));
const posOf=(name:string)=>/\bfront\b/i.test(name)&&!/\brear\b/i.test(name)?'front':/\brear\b/i.test(name)&&!/\bfront\b/i.test(name)?'rear':null;
const sized=(c:Choice)=>c.type==='Tires'||c.type==='Mousse or tube';
function wheelChoices(make:string,model:string,year:number){
 const fam=Object.values(files).find(f=>f.bikes[`${make}|${model}|${year}`]);
 return pickerChoices(decodeFamily(fam??null,make,model,year),'wheels',null,model);
}
test('every tire and insert size offered on every bike fits that bike\'s rims',()=>{
 let checked=0;const bad:string[]=[];
 for(const f of Object.values(files))for(const key of Object.keys(f.bikes)){
  const [make,model,y]=key.split('|');const w=wheelsFor({manufacturer:make,model})!;
  for(const c of wheelChoices(make,model,Number(y)).filter(sized)){
   const pos=c.type==='Tires'?posOf(c.name):null,ok=new Set(pos==='front'?w.front:pos==='rear'?w.rear:[...w.front,...w.rear]);
   for(const o of c.opts??[]){const r=rims(o.label);checked++;if(r.length&&!r.some(x=>ok.has(x)))bad.push(`${key}: ${c.brand} ${c.name} -> ${o.label}`);}
  }
 }
 assert.ok(checked>1000,`checked ${checked} options`);
 assert.deepEqual(bad.slice(0,10),[]);
});
test('a full-size motocross bike sees 21-inch fronts and 19-inch rears only',()=>{
 for(const [make,model] of [['Yamaha','YZ250F'],['KTM','450 SX-F'],['Suzuki','RM-Z250']]){
  const tires=wheelChoices(make,model,2025).filter(c=>c.type==='Tires');
  assert.ok(tires.length>20,`${model} has tires`);
  const labels=tires.flatMap(c=>(c.opts??[]).map(o=>o.label));
  assert.ok(labels.length>=tires.length/2,`${model} tires show their size`);
  assert.deepEqual([...new Set(labels.flatMap(rims))].sort(),['19','21'],model);
  for(const c of tires.filter(c=>posOf(c.name)==='front'))for(const o of c.opts??[])assert.match(o.label,/-21\b|21/,`${c.name} ${o.label}`);
 }
});
test('wheel sizes for cross-country, 85 and 65 models',()=>{
 const rimSet=(make:string,model:string)=>[...new Set(wheelChoices(make,model,2025).filter(c=>c.type==='Tires').flatMap(c=>(c.opts??[]).flatMap(o=>rims(o.label))))].sort();
 assert.deepEqual(rimSet('KTM','450 XC-F'),['18','21']);
 assert.deepEqual(rimSet('KTM','85 SX 19/16'),['16','19']);
 assert.deepEqual(rimSet('KTM','65 SX'),['12','14']);
});
test('inserts show the sizes behind each code and only codes that fit',()=>{
 const ins=wheelChoices('Yamaha','YZ250F',2025).filter(c=>c.type==='Mousse or tube');
 const bib=ins.find(c=>/Bib Mousse/.test(c.name));
 assert.deepEqual(bib?.opts?.map(o=>o.label),['M15 (80/100-21)','M16 (90/100-21)','M22 (100/90-19)','M199 (110/90-19, 120/80-19)']);
 assert.ok(bib?.opts?.every(o=>!o.pn),'a size is never saved as a part number');
 const xc=wheelChoices('KTM','450 XC-F',2025).find(c=>/Bib Mousse/.test(c.name));
 assert.ok(xc?.opts?.some(o=>/^M18 /.test(o.label))&&!xc.opts.some(o=>/^M22 /.test(o.label)),'18-inch codes on an 18-inch rear');
 const mini=wheelChoices('KTM','65 SX',2025).filter(c=>c.type==='Mousse or tube');
 for(const c of mini)for(const o of c.opts??[])assert.ok(rims(o.label).every(r=>['14','12'].includes(r)),`${c.name} ${o.label}`);
});
test('a tire that comes in one size still shows and saves that size',()=>{
 const one=wheelChoices('Yamaha','YZ250F',2025).find(c=>c.type==='Tires'&&c.opts?.length===1);
 assert.ok(one,'a single-size tire row');
 assert.deepEqual(optionsFor(one!,one!.type)?.label,'Size');
 assert.equal(optionsFor({opts:[{label:'Black',pn:''}],type:'Grips'},'Grips'),null,'one colour is not a choice');
});
