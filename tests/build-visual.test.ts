import test from 'node:test';
import assert from 'node:assert/strict';
import {readInstalled,writeInstalled} from '../shared/installed-parts.ts';
import {resolveVisualBuild,visualMappingFor,plasticsColors,catalogColors} from '../shared/build-visual.ts';
test('expanded manufacturer choices include grips and platform plastics',()=>{
 assert.equal(catalogColors('ODI','Rogue Single Ply MX Grips').length,5);
 assert.ok(plasticsColors.find(c=>c.id==='black'));
 assert.ok(plasticsColors.find(c=>c.id==='nardo-grey'));
 assert.equal(resolveVisualBuild({installed_parts:[{s:'gearing',b:'RK',n:'GB520 MXU Chain',color:'gold'}]}).parts[0]?.color?.name,'Gold');
});
test('saving a legacy parts-only update does not erase plastics',()=>{
 assert.equal(writeInstalled({plastics_color:'white'},{parts:[],stock:[],notes:{}}).plastics_color,'white');
 assert.equal(writeInstalled({plastics_color:'white'},{parts:[],stock:[],notes:{},plastics:undefined}).plastics_color,null);
});
test('conflicting full and slip-on selections leave the exhaust stock',()=>{
 const parts=[{s:'exhaust',b:'FMF',n:'Factory 4.1 RCT Titanium Anodized SL (Slip-On) w/ Carbon Cap'},{s:'exhaust',b:'FMF',n:'Factory 4.1 RCT Titanium Anodized Full System w/ Carbon End Cap'}];
 assert.equal(resolveVisualBuild({installed_parts:parts}).parts.length,0);
});
test('unmapped full systems participate in exhaust conflict detection but inserts do not',()=>{
 const slip={s:'exhaust',b:'FMF',n:'Factory 4.1 RCT Titanium Anodized SL (Slip-On) w/ Carbon Cap'};
 assert.equal(resolveVisualBuild({installed_parts:[slip,{s:'exhaust',b:'Pro Circuit',n:'Ti-6 Titanium Exhaust System'}]}).parts.length,0);
 assert.equal(resolveVisualBuild({installed_parts:[slip,{s:'exhaust',b:'FMF',n:'Factory 4.1 RCT Spark Arrestor Quiet Core Insert'}]}).parts.length,1);
});
test('typed lookalikes and wrong-system entries do not acquire a catalog visual',()=>{
 const p={s:'controls',b:'ODI',n:'Rogue Single Ply MX Grips',color:'blue'};
 assert.equal(resolveVisualBuild({installed_parts:[{...p,x:true}]}).parts.length,0);
 assert.equal(resolveVisualBuild({installed_parts:[{...p,s:'engine'}]}).parts.length,0);
 assert.equal(resolveVisualBuild({installed_parts:[p]}).parts[0].target,'grips');
});
import {cleanName,typeOf} from '../shared/parts-picker.ts';
test('complete slip-on with included cap remains selectable as a muffler',()=>{
 assert.equal(typeOf('exhaust','Factory 4.1 RCT Titanium Anodized SL (Slip-On) w/ Carbon Cap'),'Slip-on muffler');
 assert.equal(typeOf('exhaust','Factory 4.1 Replacement Carbon End Cap Kit'),null);
});
test('picker-cleaned names retain their visual mapping',()=>{
 const name=cleanName('Renthal','Fatbar Handlebars 1-1/8"');
 assert.ok(visualMappingFor({b:'Renthal',n:name}));
 assert.equal(visualMappingFor({b:'Renthal',n:name})?.asset,'generic-fatbar');
});
test('saved fitted finish and plastics choice survive serialization',()=>{
 const value=readInstalled({installed_parts:[{s:'controls',b:'Renthal',n:'Fatbar Handlebars 1-1/8"',color:'blue'}],plastics_color:'white'});
 const copy=readInstalled(JSON.parse(JSON.stringify(writeInstalled({unrelated:1},value))));
 assert.equal(copy.parts[0].color,'blue');assert.equal(copy.plastics,'white');
});
test('unmapped items and unsupported colors never invent a visual',()=>{
 assert.equal(resolveVisualBuild({installed_parts:[{s:'controls',b:'Unknown',n:'bar',color:'blue'}]}).parts.length,0);
 const p={s:'controls' as const,b:'Renthal',n:'Fatbar Handlebars 1-1/8"',color:'invented'};
 assert.ok(visualMappingFor(p));assert.equal(resolveVisualBuild({installed_parts:[p]}).parts[0].color,undefined);
});
test('mapped full exhaust is generic and removing it returns an empty visual plan',()=>{
 const p={s:'exhaust',b:'FMF',n:'Factory 4.1 RCT Titanium Anodized Full System w/ Carbon End Cap',r:'fmf-41rct-450-2023'};
 const plan=resolveVisualBuild({installed_parts:[p]});assert.equal(plan.parts[0].asset,'generic-full-exhaust');assert.match(plan.parts[0].label,/shown as: full exhaust/);
 assert.deepEqual(resolveVisualBuild({installed_parts:[]}).parts,[]);
});
