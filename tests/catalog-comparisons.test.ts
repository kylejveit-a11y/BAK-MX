import test from 'node:test';
import assert from 'node:assert/strict';
import {compareCatalogYears} from '../scripts/compare-catalog-years.ts';
const target=(year:number)=>({manufacturer:'Yamaha',model:'YZ450F',model_year:year,variant:'standard',region:'US'});
const assembly=(year:number)=>({id:`a${year}`,target:target(year),scope_status:'CONFIRMED',name:'CAMSHAFT',expected_occurrences:1,enumeration_checked:true,catalog_evidence:{url:'https://example.test',locator:'fixture'}});
const part=(year:number)=>({id:`p${year}`,target:target(year),scope_status:'CONFIRMED',assembly_id:`a${year}`,part_number:'ABC',quantity:1,catalog_quantity:1});
test('catalog commonality is bounded by full enumerations and preserves quantity changes',()=>{
 const a=[assembly(2025),assembly(2026)],p=[part(2025),part(2026)];
 const equal=compareCatalogYears({assemblies:a,parts:p})[0];assert.equal(equal.status,'IDENTICAL_CAPTURED_ORDERABLE_PART_MULTISET');assert.equal(equal.runtime_inheritance_authorized,false);
 assert.equal(compareCatalogYears({assemblies:a,parts:[p[0],{...p[1],catalog_quantity:2}]})[0].matched_occurrences,0);
 assert.equal(compareCatalogYears({assemblies:[a[0],{...a[1],expected_occurrences:2}],parts:p})[0].status,'PARTIAL_COMPARISON_ONLY');
 assert.notEqual(compareCatalogYears({assemblies:a,parts:[p[0],{...p[1],part_number:null}]})[0].status,'IDENTICAL_CAPTURED_ORDERABLE_PART_MULTISET');
});
test('different market, model or unconfirmed scope cannot produce an equivalence candidate',()=>{
 for(const patch of [{region:'EU'},{model:'YZ450FX'},{variant:'special'}])assert.equal(compareCatalogYears({assemblies:[assembly(2025),{...assembly(2026),target:{...target(2026),...patch}}],parts:[part(2025),part(2026)]}).length,0);
 assert.equal(compareCatalogYears({assemblies:[assembly(2025),{...assembly(2026),scope_status:'UNCONFIRMED'}],parts:[part(2025),part(2026)]}).length,0);
 const c=compareCatalogYears({assemblies:[assembly(2025),assembly(2026)],parts:[part(2025),{...part(2026),scope_status:'UNCONFIRMED'}]})[0];assert.equal(c.enumeration_complete,false);
});
