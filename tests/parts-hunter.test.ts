import test from 'node:test';
import assert from 'node:assert/strict';
import {termPatterns,storeLinks,findAftermarket,partOffer} from '../shared/parts-hunter.ts';
import type {CatalogPart} from '../shared/parts-picker.ts';
const part=(brand:string,name:string,pn='',links:CatalogPart['links']=[]):CatalogPart=>({brand,name,system:'brakes' as never,pn,verified:false,what:'',caution:'',testers:[],service:false,links});
test('find a part: rider words become patterns that match factory short forms',()=>{
 assert.deepEqual(termPatterns('rear brake pads for my bike'),['(rear|rr)','brakes?','pads?']);
 assert.deepEqual(termPatterns('the new set'),[]);
 const re=(p:string)=>new RegExp(`(^|[^a-z0-9])${p}($|[^a-z0-9])`,'i');
 assert.ok(termPatterns('rear brake pads').every(p=>re(p).test('PAD SET, RR. BRAKE')));
 assert.ok(!termPatterns('front brake pads').every(p=>re(p).test('PAD SET, RR. BRAKE')));
 assert.equal(termPatterns('a.*b); drop table').join(' ').includes('*'),false);
});
test('find a part: where to buy only points at stores that can look the part up',()=>{
 const am=storeLinks({kind:'aftermarket',brand:'Galfer',name:'Brake pads',part_number:'FD326G1054',links:[{seller:'MotoSport',url:'https://www.motosport.com/galfer-pads'},{seller:'s7d1.scene7.com',url:'https://s7d1.scene7.com/is/image/x'}]});
 assert.deepEqual(am.map(l=>[l.store,l.how]),[['MotoSport','listing']]);
 const honda=storeLinks({kind:'factory',brand:'Honda',name:'PAD SET, RR.',part_number:'06435-MKE-AA1'});
 assert.deepEqual(honda.map(l=>l.url),['https://www.motosport.com/oem-parts/part-number/06435-MKE-AA1','https://www.partzilla.com/search?q=06435-MKE-AA1']);
 assert.deepEqual(storeLinks({kind:'factory',brand:'KTM',name:'Brake pad rear',part_number:'79013090100'}).map(l=>l.store),['MotoSport']);
 assert.deepEqual(storeLinks({kind:'factory',brand:'GasGas',name:'Air filter',part_number:'A46006015000'}).map(l=>l.store),['MotoSport']);
 assert.deepEqual(storeLinks({kind:'factory',brand:'Triumph',name:'Pad',part_number:'A9610139'}),[]);
 assert.deepEqual(storeLinks({kind:'factory',brand:'Honda',name:'BOLT',part_number:''}),[]);
 assert.ok(honda.every(l=>!/rockymountain/.test(l.url)));
 const bare=storeLinks({kind:'aftermarket',brand:'Pro Taper',name:'Pillow Top grips',part_number:''});
 assert.equal(bare.length,1);assert.equal(bare[0].how,'search');assert.ok(bare[0].url.endsWith('textsearch=Pro%20Taper%20Pillow%20Top%20grips'));
});
test('find a part: only parts on the bike list that match every word, no duplicates',()=>{
 const list=[part('Galfer','Rear brake pads','A'),part('Galfer','Front brake pads','B'),part('Renthal','Rear sprocket','C'),part('Galfer','Rear brake pads','A')];
 assert.deepEqual(findAftermarket(list,'rear brake pads').map(p=>p.part_number),['A']);
 assert.deepEqual(findAftermarket(list,'brake pads').map(p=>p.part_number).sort(),['A','B']);
 assert.deepEqual(findAftermarket(list,'for my bike'),[]);
});
test('ask bak offer: only when the answer says a wear part needs replacing; rare by design',()=>{
 const on={offeredAlready:false,enabled:true};
 const yes='Your rear pads are down to the backing plate, so the grinding is metal on the rotor. Replace the rear brake pads before the next ride and check the rotor for scoring.';
 assert.deepEqual(partOffer(yes,on),{query:'brake pads'});
 assert.equal(partOffer(yes,{offeredAlready:true,enabled:true}),null);assert.equal(partOffer(yes,{offeredAlready:false,enabled:false}),null);
 assert.equal(partOffer('It could be the pads or air in the line. How does the lever feel, firm or spongy? Do you replace the brake pads often?',on),null,'still diagnosing');
 assert.equal(partOffer('Do not ride it. Fuel leaking on a hot pipe can start a fire. Replace the fuel line and the spark plug before you start it again, and check every clamp.',on),null,'safety stop');
 assert.equal(partOffer('Set the sag to 105 mm and go two clicks stiffer on rebound. That should settle the rear over braking bumps without making it harsh on the small chop.',on),null);
 assert.equal(partOffer('Clean and oil the air filter after every ride in sand. You do not need to replace the air filter unless the foam is torn or the seams are coming apart.',on),null,'told not to replace');
 assert.deepEqual(partOffer('The chain is past its wear limit at 275 mm over 18 pins. A stretched chain eats sprockets, so order a new chain and sprockets together and fit them as a set.',on),{query:'sprocket'});
});
