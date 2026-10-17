import test from 'node:test';
import assert from 'node:assert/strict';
import {readInstalled,writeInstalled} from '../shared/installed-parts.ts';
import {resolveVisualBuild,visualMappingFor} from '../shared/build-visual.ts';
import {cleanName} from '../shared/parts-picker.ts';
test('picker-cleaned names retain their visual mapping',()=>{
 const name=cleanName('Renthal','Fatbar Handlebars 1-1/8"');
 assert.ok(visualMappingFor({b:'Renthal',n:name}));
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
