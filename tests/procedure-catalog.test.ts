import test from 'node:test';
import assert from 'node:assert/strict';
import {procedureCatalog} from '../shared/procedure-catalog.ts';
import {proceduresForBike} from '../shared/procedures.ts';
const bike:any={id:'catalog-test',user_id:'test-owner',manufacturer:'Yamaha',model:'YZ450F',model_year:2026,variant:'standard',region:'US',configuration:{}};

test('catalog partitions eligible guides and separates bike routes from prepared-engine modules',()=>{
 const catalog=procedureCatalog(bike);
 const ids=catalog.groups.flatMap(group=>group.procedures.map(p=>p.id));
 assert.deepEqual(new Set(ids),new Set(proceduresForBike(bike).map(p=>p.id)));
 assert.equal(ids.length,new Set(ids).size);
 assert.ok(catalog.featured.some(p=>p.id==='yamaha-2026-yz450f-top-end-guide-valve-renew-v1'));
 assert.ok(catalog.featured.some(p=>p.id==='yamaha-2026-yz450f-frame-strip-reassemble-v1'));
 assert.ok(catalog.featured.every(p=>!p.id.includes('-bench-')));
 const bench=catalog.groups.find(group=>group.id==='bench')!.procedures;
 assert.ok(bench.some(p=>p.id.includes('guides-valves-renew-bench')));
 assert.ok(bench.every(p=>p.id.includes('-bench-')));
 assert.match(catalog.coverage.find(item=>item.system==='Engine')!.available,/Stock top-end/);
 assert.match(catalog.coverage.find(item=>item.system==='Rear shock')!.remaining,/not covered/);
});
test('coverage cannot transfer to neighboring years or bypass modified hardware exclusions',()=>{
 const previous=procedureCatalog({...bike,model_year:2025});
 assert.ok(previous.available.length>0);
 assert.ok(previous.available.every(p=>p.target.model_year===2025));
 assert.ok(previous.available.every(p=>!proceduresForBike(bike).some(current=>current.id===p.id)));
 const earlier=procedureCatalog({...bike,model_year:2024});
 assert.ok(earlier.available.length>0);
 assert.ok(earlier.available.every(p=>p.target.model_year===2024));
 assert.ok(earlier.available.every(p=>!previous.available.some(other=>other.id===p.id)));
 const modified=procedureCatalog({...bike,configuration:{engine:'aftermarket'}});
 assert.ok(!modified.featured.some(p=>p.component==='engine'||p.component==='frame'));
 assert.ok(!modified.coverage.find(item=>item.system==='Engine')!.available.includes('Stock top-end'));
 const husqvarna=procedureCatalog({...bike,manufacturer:'Husqvarna',model:'FC 450',model_year:2025});
 assert.equal(husqvarna.available.length,4);
 assert.equal(husqvarna.featured.length,0);
 assert.deepEqual(new Set(husqvarna.groups.map(group=>group.id)),new Set(['engine','suspension']));
 for(const fork of ['WP XACT PRO 6500','WP Cone Valve','Race Tech FSCS','spring-converted']){
  const converted=procedureCatalog({...bike,manufacturer:'Husqvarna',model:'FC 450',model_year:2025,configuration:{fork}});
  assert.ok(converted.available.every(p=>p.component!=='fork'),fork);
 }
});


test('2025 rebuild routes stay bound to their source and stock hardware',()=>{
 const target={...bike,model_year:2025},catalog=procedureCatalog(target);
 const frame=catalog.featured.find(p=>p.id==='yamaha-yz450f-2025-frame-bearing-renewal-reassembly-v1');
 assert.ok(frame);
 assert.ok(catalog.featured.some(p=>p.component==='fork'));
 assert.ok(catalog.available.every(p=>p.source.source_url.includes('D02-2819U-10_02.pdf')));
 assert.ok(!procedureCatalog({...target,configuration:{engine:'modified'}}).available.some(p=>p.id===frame.id));
 assert.ok(!procedureCatalog({...target,configuration:{fork:'aftermarket'}}).available.some(p=>p.id===frame.id));
 assert.ok(!procedureCatalog(bike).available.some(p=>p.id===frame.id));
});


test('Yamaha expansion keeps bench work separate and exact hardware scope intact',()=>{
 const yz250=procedureCatalog({...bike,model:'YZ250',model_year:2027});
 const top=yz250.groups.find(g=>g.id==='bench')?.procedures.find(p=>p.id==='yamaha-2027-yz250-top-end-power-valve-bench-v1');
 assert.ok(top);assert.equal(yz250.featured.length,0);
 assert.ok(top.required_parts.some(p=>p.name.includes('piston-pin clips')));
 assert.ok(top.required_parts.every(p=>typeof p.name==='string'&&p.name.trim()));
 assert.ok(!procedureCatalog({...bike,model:'YZ250X',model_year:2027}).available.some(p=>p.id===top.id));
 assert.ok(!procedureCatalog({...bike,model:'YZ250',model_year:2027,configuration:{piston:'aftermarket'}}).available.some(p=>p.id===top.id));
 const yz250f=procedureCatalog({...bike,model:'YZ250F'});
 assert.ok(yz250f.groups.find(g=>g.id==='bench')?.procedures.some(p=>p.id.endsWith('-top-end-teardown-inspection-v1')));
 assert.ok(yz250f.groups.find(g=>g.id==='bench')?.procedures.some(p=>p.id.endsWith('-original-head-valve-reassembly-v1')));
 assert.equal(yz250f.featured.length,0);
 assert.match(yz250f.coverage.find(c=>c.system==='Engine')!.remaining,/not available/);
 const wr=procedureCatalog({...bike,model:'WR450F',model_year:2025});
 assert.ok(wr.available.length>0);assert.ok(wr.available.every(p=>p.target.model==='WR450F'&&p.target.model_year===2025));
 assert.ok(!procedureCatalog({...bike,model:'WR450F',model_year:2025,configuration:{shock:'aftermarket'}}).available.some(p=>p.component==='shock'));
});
