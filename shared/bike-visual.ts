import {z} from 'zod';
import {exactBikeScope} from './bike-identity.ts';
import type {Bike} from './types.ts';
export const bikeDimensionsSchema=z.object({
 wheelbase:z.number().finite().min(1.3).max(1.7),
 seatHeight:z.number().finite().min(.85).max(1.1),
}).strict();
export type BikeDimensions=z.infer<typeof bikeDimensionsSchema>;
// Owner-manual extraction, printed p153. Not a guarantee of mesh accuracy.
export const defaultBikeDimensions:BikeDimensions={wheelbase:1.493,seatHeight:.958};
export const parseBikeDimensions=(value:unknown)=>bikeDimensionsSchema.parse(value);
export function resolveBikeVisual(bike:Pick<Bike,'manufacturer'|'model'|'model_year'|'variant'|'region'>){
 const s=exactBikeScope(bike);
 return s.manufacturer==='KTM'&&s.model==='450 SX-F'&&s.model_year===2025&&s.variant==='standard'&&s.region==='US'?'ktm-450-sxf-2025-us-prototype':null;
}
export const visualComponents=[
 ['frame','Frame / subframe'],['engine','Engine exterior'],['front-wheel','Front wheel'],['rear-wheel','Rear wheel'],
 ['fork','Fork / clamps'],['shock','Shock'],['swingarm','Swingarm'],['exhaust','Exhaust'],['plastics','Bodywork'],['seat','Seat'],['controls','Bars / controls'],['cooling','Radiators / hoses'],['drivetrain','Chain / sprocket']
] as const;
