import type {AttributedReference,Bike} from '../shared/types.ts';
import {referenceLibrary} from '../shared/reference-library.ts';
import {canonicalVariant} from '../shared/bike-identity.ts';
/** Related reading is not a specification or an instruction for an unidentified component. */
export function relatedReferences(bike:Bike,message:string):AttributedReference[]{
 if(!/\b(fork|shock|suspension|clicker|rebound|compression|sag|packing|harsh|revalve)\b/i.test(message))return [];
 const components=JSON.stringify(bike.configuration).toLowerCase();
 return referenceLibrary.filter(r=>{
  const scope:any=r.scope;
  if(scope.manufacturer)return scope.manufacturer===bike.manufacturer&&scope.model===bike.model&&scope.model_year===bike.model_year&&canonicalVariant(bike.variant)===scope.variant;
  if(r.id==='fc-fork-binding')return true;
  // Explicit saved installed-component name / part number, never inferred from bike brand.
  if(scope.part_number)return components.includes(scope.part_number.toLowerCase());
  return components.includes(scope.component.toLowerCase());
 }).slice(0,5).map(({title,url,attribution,kind,limitations})=>({title,url,attribution,kind,limitations}));
}
