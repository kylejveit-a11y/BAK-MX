import type {Bike} from './types.ts';
import {garageModels as known} from './garage-models.ts';
export function canonicalManufacturer(value:string){return Object.keys(known).find(k=>k.toLowerCase()===value.trim().toLowerCase())??value.trim();}
export function canonicalModel(make:string,value:string){return known[canonicalManufacturer(make)]?.find(m=>m.toLowerCase()===value.trim().toLowerCase())??value.trim();}
export function canonicalVariant(value:string){const v=value.trim();return /^(standard|stock|base)$/i.test(v)?'standard':v;}
export function canonicalRegion(value:string){const v=value.trim();return /^(us|usa|united states)$/i.test(v)?'US':v;}
export function exactBikeScope(bike:Pick<Bike,'manufacturer'|'model'|'model_year'|'variant'|'region'>){return {manufacturer:canonicalManufacturer(bike.manufacturer),model:canonicalModel(bike.manufacturer,bike.model),model_year:bike.model_year,variant:canonicalVariant(bike.variant),region:canonicalRegion(bike.region)};}
export function sameBikeScope(a:Pick<Bike,'manufacturer'|'model'|'model_year'|'variant'|'region'>,b:Pick<Bike,'manufacturer'|'model'|'model_year'|'variant'|'region'>){return JSON.stringify(exactBikeScope(a))===JSON.stringify(exactBikeScope(b));}
const stable=(value:unknown):unknown=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([key,v])=>[key,stable(v)])):value;
/** Hours and nickname changes do not invalidate hardware; actual configuration changes do. */
export function buildIdentity(bike:Bike){return JSON.stringify([bike.user_id,bike.id,exactBikeScope(bike),stable(bike.configuration)]);}
