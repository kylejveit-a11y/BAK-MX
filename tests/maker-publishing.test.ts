import test from 'node:test';
import assert from 'node:assert/strict';
import {makerPublishingNotes} from '../shared/maker-publishing.ts';
import {buildEngineeringInput} from '../server/engineering.ts';

const bike=(manufacturer:string,model:string,model_year:number)=>({manufacturer,model,model_year});
test('Kawasaki bikes whose manual was searched carry the no-sag-figure note; others carry nothing',()=>{
 for(const [m,y] of [['KX450',2014],['KX450',2026],['KX250X',2021],['KX65',2027],['KX112',2022]] as const)
  assert.match(makerPublishingNotes(bike('Kawasaki',m,y))!.notes[0].not_printed,/no sag figure/);
 // outside the searched manuals: no claim either way
 for(const [mk,m,y] of [['Kawasaki','KX85',2027],['Kawasaki','KX112',2027],['Kawasaki','KX450',2013],['Kawasaki','KX250X',2020],['Honda','CRF450R',2021],['Honda','CRF250R',2020],['Honda','CRF450R',2012],['Honda','CRF450RX',2018],['Yamaha','YZ450F',2024]] as const)
  assert.equal(makerPublishingNotes(bike(mk,m,y)),null);
 assert.ok(makerPublishingNotes(bike('Yamaha','YZ65',2027)));assert.ok(makerPublishingNotes(bike('Yamaha','YZ85',2021)));
 assert.equal(makerPublishingNotes(bike('Yamaha','YZ65',2026)),null);assert.equal(makerPublishingNotes(bike('Yamaha','YZ85',2022)),null);
 assert.match(makerPublishingNotes(bike('Honda','CRF450R',2015))!.notes[0].not_printed,/no free/);
 assert.ok(makerPublishingNotes(bike('Honda','CRF250R',2024)));
 assert.match(makerPublishingNotes(bike('Husqvarna','FC 450',2026))!.notes[0].printed_instead,/105 mm/);
 assert.match(makerPublishingNotes(bike('KTM','125 SX',2023))!.notes[0].printed_instead,/105 mm/);
 assert.equal(makerPublishingNotes(bike('Husqvarna','FC 450',2025)),null);assert.equal(makerPublishingNotes(bike('KTM','125 SX',2024)),null);
 assert.equal(makerPublishingNotes(null),null);
});
test('Ask BAK receives maker_publishing only for a covered bike',()=>{
 const b=(model:string,model_year:number,manufacturer='Kawasaki')=>({id:'b',manufacturer,model,model_year,variant:'standard',region:'US'} as never);
 assert.ok('maker_publishing' in buildEngineeringInput(b('KX450',2024),[],[],'what should my sag be'));
 assert.equal('maker_publishing' in buildEngineeringInput(b('450 SX-F',2025,'KTM'),[],[],'what should my sag be'),false);
});
