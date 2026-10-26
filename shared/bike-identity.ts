import type {Bike} from './types.ts';
import {garageModels as known} from './garage-models.ts';
export function canonicalManufacturer(value:string){return Object.keys(known).find(k=>k.toLowerCase()===value.trim().toLowerCase())??value.trim();}
const squash=(v:string)=>v.toLowerCase().replace(/[^a-z0-9]/g,'');
/** "rmz450", "RM Z450" and "RM-Z450" are the same model. */
export function canonicalModel(make:string,value:string){const list=known[canonicalManufacturer(make)];return list?.find(m=>m.toLowerCase()===value.trim().toLowerCase())??list?.find(m=>squash(m)===squash(value))??value.trim();}
/** Honda's Works Edition is stored as variant "RWE" whatever the rider calls it ("Works Edition", "CRF450RWE", "HRC WE"). */
export function canonicalVariant(value:string){const v=value.trim();if(/^(standard|stock|base)$/i.test(v))return 'standard';if(/^(crf\s?\d{3}\s?)?(rwe|r[\s-]?we|works(\s|-)?edition|hrc(\s|-)?(we|works(\s|-)?edition))$/i.test(v))return 'RWE';return v;}
export function canonicalRegion(value:string){const v=value.trim();return /^(us|usa|united states)$/i.test(v)?'US':v;}
export function exactBikeScope(bike:Pick<Bike,'manufacturer'|'model'|'model_year'|'variant'|'region'>){return {manufacturer:canonicalManufacturer(bike.manufacturer),model:canonicalModel(bike.manufacturer,bike.model),model_year:bike.model_year,variant:canonicalVariant(bike.variant),region:canonicalRegion(bike.region)};}
export function sameBikeScope(a:Pick<Bike,'manufacturer'|'model'|'model_year'|'variant'|'region'>,b:Pick<Bike,'manufacturer'|'model'|'model_year'|'variant'|'region'>){return JSON.stringify(exactBikeScope(a))===JSON.stringify(exactBikeScope(b));}
const stable=(value:unknown):unknown=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([key,v])=>[key,stable(v)])):value;
/** Hours and nickname changes do not invalidate hardware; actual configuration changes do. */
export function buildIdentity(bike:Bike){return JSON.stringify([bike.user_id,bike.id,exactBikeScope(bike),stable(bike.configuration)]);}
