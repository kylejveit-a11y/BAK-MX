import {decodeFamily,familyOf,type CatalogPart,type FamilyFile} from '../shared/parts-picker';
export type {CatalogPart};
const cache=new Map<string,Promise<FamilyFile|null>>();
function family(name:string){
 if(!cache.has(name))cache.set(name,fetch(`/parts-catalog/${name}.json`).then(r=>r.ok?r.json() as Promise<FamilyFile>:null).catch(()=>{cache.delete(name);return null;}));
 return cache.get(name)!;
}
/** Every listed part for this exact bike, or null when no parts list exists for it (other makes, enduro models, unlisted years). */
export async function partsForBike(make:string,model:string,year:number):Promise<CatalogPart[]|null>{
 const name=familyOf(make);if(!name)return null;
 return decodeFamily(await family(name),make,model,year);
}
