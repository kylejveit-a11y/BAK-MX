import test from 'node:test';
import assert from 'node:assert/strict';
import {recallsForBike} from '../shared/recalls.ts';
const bike={manufacturer:'Honda',model:'CRF250R',model_year:2025,region:'US'};
test('Honda clamp notice covers only sourced US model/year identities and remains VIN-qualified',()=>{
 for(const model of ['CRF250R','CRF250RX','CRF250RWE','CRF450R','CRF450RX','CRF450RWE'])for(const model_year of [2025,2026]){
  const notices=recallsForBike({...bike,model,model_year});assert.equal(notices.length,1);assert.match(notices[0].summary,/Check your VIN/);assert.match(notices[0].summary,/dealer inspection/);assert.match(notices[0].summary,/Retightening alone/);
 }
 for(const model of ['CRF250F','CRF450RL','CRF450X','YZ450F'])assert.equal(recallsForBike({...bike,model}).length,0);
 for(const model_year of [2022,2023,2024,2027])assert.equal(recallsForBike({...bike,model_year}).length,0);
 assert.equal(recallsForBike({...bike,manufacturer:'Yamaha'}).length,0);
 assert.equal(recallsForBike({...bike,region:'EU'}).length,0);
 assert.equal(recallsForBike({...bike,region:'USA'}).length,1);
});
