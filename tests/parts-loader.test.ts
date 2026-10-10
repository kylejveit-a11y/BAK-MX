import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeInventory,partCount} from '../scripts/load-parts-catalogs.ts';
const target={manufacturer:'KTM',model:'450 SX-F',model_year:2025,variant:'standard',region:'US'};
const selected=(path:string,source:string)=>({target,path,source,complete:true,assemblies:1,occurrences:2,sha256:'abc'});
test('official catalog captures keep published quantities and never invent a part number',()=>{
 const capture={target,source_url:'https://sparepartsfinder.ktm.com/',assemblies:[{id:'72523',name:'FRONT FORK',source_url:'https://sparepartsfinder.ktm.com/x',diagram_url:'http://insecure.example/d.png'}],parts:[{assembly_id:'72523',callout:'1',part_number:null,description:'Non orderable part',catalog_quantity:1,additional_text:''},{assembly_id:'72523',callout:'2',part_number:'0770035020',description:'O-RING',catalog_quantity:null,quantity:null}]};
 const c=normalizeInventory(selected('captures/ktm.json','Official KTM US catalog'),()=>capture);
 assert.equal(partCount(c),2);assert.equal(c.assemblies[0].parts[0].part_number,null);assert.equal(c.assemblies[0].parts[1].quantity_raw,'');
 assert.equal(c.assemblies[0].diagram_url,'','only https diagram links are kept');
});
test('nested-row catalogs keep raw quantities such as AR, and supersessions stay visible',()=>{
 const capture={target:{...target,model_year:undefined,year:2025},index_url:'https://www.motosport.com/oem-parts/x',assemblies:[{name:'AIR CLEANER',url:'https://www.motosport.com/oem-parts/x/air-cleaner',diagram_urls:['https://www.motosport.com/api/oem/image?x=1'],rows:[{occurrence_index:1,callout:'1',part_number:'15771-551-000',description:'CLIP',catalog_quantity_raw:'AR',catalog_quantity:null,supersedes_part_number:'15771-000-000'},{occurrence_index:2,callout:'2',part_number:'17211',description:'ELEMENT',catalog_quantity:1}]}]};
 const c=normalizeInventory(selected('honda/2025/inventory.json','MotoSport public OEM catalog'),()=>capture);
 assert.equal(c.assemblies[0].parts[0].quantity_raw,'AR');assert.match(c.assemblies[0].parts[0].remarks,/Supersedes 15771-000-000/);assert.equal(c.assemblies[0].parts[1].quantity_raw,'1');
});
test('a capture for a different bike or an unknown format is refused',()=>{
 const other={target:{...target,model_year:2024},assemblies:[{id:'1',name:'X'}],parts:[]};
 assert.throws(()=>normalizeInventory(selected('captures/ktm.json','Official KTM US catalog'),()=>other),/target mismatch/);
 assert.throws(()=>normalizeInventory(selected('captures/odd.json','Unknown'),()=>({target,rows:[]})),/Unrecognized/);
 const legacy={assemblies:[{id:'a',target:{...target,model_year:2024},name:'X'}],parts:[]};
 assert.throws(()=>normalizeInventory(selected('docs/research/parts/inventory.json','Legacy reviewed inventory'),()=>legacy),/No assemblies/);
});
