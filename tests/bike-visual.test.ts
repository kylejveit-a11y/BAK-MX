import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveBikeVisual,parseBikeDimensions,defaultBikeDimensions} from '../shared/bike-visual.ts';
const bike={manufacturer:'KTM',model:'450 SX-F',model_year:2025,variant:'standard',region:'US'};
test('visual selection never substitutes neighboring year or Factory Edition',()=>{
 assert.equal(resolveBikeVisual(bike),'ktm-450-sxf-2025-us-prototype');
 for(const override of [{model_year:2024},{variant:'Factory Edition'},{region:'EU'},{model:'350 SX-F'},{manufacturer:'Honda'}])assert.equal(resolveBikeVisual({...bike,...override}),null);
});
test('visual input rejects nonfinite and unreasonable parameters',()=>{
 for(const wheelbase of [NaN,Infinity,0,-1,100])assert.throws(()=>parseBikeDimensions({...defaultBikeDimensions,wheelbase}));
 assert.deepEqual(parseBikeDimensions(defaultBikeDimensions),defaultBikeDimensions);
});
