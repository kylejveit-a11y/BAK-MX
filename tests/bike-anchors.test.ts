import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pilotGeometryAnchors} from '../shared/bike-geometry-anchors.ts';
test('geometry anchors retain exact pilot part identity and unit conversion',()=>{
 const ledger=JSON.parse(readFileSync(new URL('../public/bike-builder/vendor-dimensions.json',import.meta.url),'utf8'));
 const manifest=JSON.parse(readFileSync(new URL('../public/bike-builder/ktm-450-sxf-2025.references.json',import.meta.url),'utf8'));
 assert.deepEqual(ledger.target,manifest.target);
 for(const anchor of ledger.accepted_anchors){
  const component=manifest.components.find((c:{id:string})=>c.id===anchor.component);
  assert.ok(component.reference_parts.some((r:{part_number:string;occurrence_id:string})=>r.part_number===anchor.part_number&&r.occurrence_id===anchor.occurrence_id));
  const value=Array.isArray(anchor.value)?anchor.value[0]:anchor.value;
  assert.ok(Math.abs(pilotGeometryAnchors[anchor.used_by as keyof typeof pilotGeometryAnchors]-value*(anchor.unit==='inch'?.0254:.001))<1e-10);
 }
 assert.ok(ledger.candidates.every((c:{status:string})=>c.status!=='EXACT_PILOT_CATALOG_NOMINAL'));
});
