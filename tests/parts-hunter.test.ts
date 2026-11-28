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
 const list=[part('Galfer','Rear brake pads','FD-A1'),part('Galfer','Front brake pads','FD-B2'),part('Renthal','Rear sprocket','RS-C3'),part('Galfer','Rear brake pads','FD-A1')];
 assert.deepEqual(findAftermarket(list,'rear brake pads').map(p=>p.part_number),['FD-A1']);
 assert.deepEqual(findAftermarket(list,'brake pads').map(p=>p.part_number).sort(),['FD-A1','FD-B2']);
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

import {positionOf} from '../shared/parts-hunter.ts';
test('find a part: one card per product with all its numbers, and front or rear read from the name',()=>{
 const list=[part('KTM PowerParts','Brake pad','54813990100'),part('KTM PowerParts','Brake pad','54813990200'),part('All Balls','Sintered Brake Pads','18-8001, 18-8002, 18-8003, 18-'),part('BILT','FA368R Sintered Rear Brake Pads','YL-F152')];
 const found=findAftermarket(list,'brake pads');
 assert.equal(found.length,3);
 assert.deepEqual(found.find(p=>p.brand==='KTM PowerParts')!.numbers,['54813990100','54813990200']);
 assert.deepEqual(found.find(p=>p.brand==='All Balls')!.numbers,['18-8001','18-8002','18-8003'],'the cut-off number is dropped');
 assert.equal(found.find(p=>p.brand==='BILT')!.position,'rear');
 assert.equal(positionOf('PAD SET, RR.'),'rear');assert.equal(positionOf('Front and rear pads'),undefined);assert.equal(positionOf('Brake pad'),undefined);
});

import {browseSystem,isPartSystem} from '../shared/parts-hunter.ts';
test('browse by system: every product in the system, grouped by kind of part',()=>{
 const mk=(brand:string,name:string,system:string,pn='X-100')=>({...part(brand,name,pn),system:system as never});
 const list=[mk('Rekluse','RadiusCX auto clutch','clutch','RMS-1'),mk('Rekluse','TorqDrive clutch pack','clutch','RMS-2'),mk('Hinson','Billetproof clutch basket','clutch','H-3'),mk('Galfer','Rear brake pads','brakes','G-4'),mk('Rekluse','RadiusCX auto clutch','clutch','RMS-9')];
 const b=browseSystem(list,'clutch' as never);
 assert.deepEqual(b.parts.map(p=>p.type),['Auto clutch','Plates','Basket or hub']);
 assert.deepEqual(b.parts[0].numbers,['RMS-1','RMS-9']);
 assert.deepEqual(b.types,[{label:'Auto clutch',count:1},{label:'Plates',count:1},{label:'Basket or hub',count:1}]);
 assert.equal(isPartSystem('clutch'),true);assert.equal(isPartSystem('nope'),false);
});

import {shopSystem,partsOverview,usd,shopSystemOf} from '../shared/parts-hunter.ts';
test('shop view: prices, filters and sorting run on the whole list',()=>{
 const mk=(brand:string,name:string,system:string,price:string,pn='X1')=>({brand,name,system,pn,verified:false,what:'',caution:'',testers:[],service:false,links:[{seller:'MotoSport',url:'https://www.motosport.com/x',price}]}) as never;
 const list=[mk('EBC','Sintered Front Brake Pads','brakes','32.50 USD'),mk('Galfer','Rear Brake Pads','brakes','27.00 USD'),mk('Galfer','Wave Rotor Front','brakes','129.99 USD'),mk('Renthal','SX Crossbar Pad','brakes','24.26 USD'),mk('EBC','Brake Pads [Open Box]','brakes','9.00 USD'),mk('ODI','Grips','controls','12.00 USD')];
 assert.equal(usd('429.00 USD'),429);assert.equal(usd('call'),undefined);
 assert.equal(shopSystemOf({system:'brakes',name:'SX Crossbar Pad'} as never),'controls');
 const all=shopSystem(list,'brakes' as never,{sort:'price_low'});
 assert.equal(all.total,3);assert.deepEqual(all.parts.map(p=>p.price_from),[27,32.5,129.99]);
 assert.equal(all.parts[0].stores[0].price,27);
 const front=shopSystem(list,'brakes' as never,{position:'front',brand:'EBC'});assert.equal(front.total,1);
 const over=partsOverview(list);assert.deepEqual(over.map(s=>[s.key,s.count]),[['brakes',3],['controls',2]]);
});

import {partGuide,kindOf} from '../shared/part-plain.ts';
import {partTypes as allTypes} from '../shared/part-types.ts';
test('plain words: every kind of part has a guide, and versions are read from the name',()=>{
 for(const [system,types] of Object.entries(allTypes))for(const t of types!)assert.ok(partGuide(system,t.label),`${system} / ${t.label} has no plain-words guide`);
 assert.equal(kindOf('brakes','Pads','FA368R Sintered Rear Brake Pads')?.name,'Sintered (metal)');
 assert.equal(kindOf('brakes','Pads','SM1 Semi-Metallic Brake Pads')?.name,'Semi-metallic');
 assert.equal(kindOf('gearing','Chain','520 ERV7 X-Ring Chain')?.name,'Sealed (O-ring or X-ring)');
 assert.equal(kindOf('brakes','Pads','Brake Pads'),undefined);
 for(const g of [partGuide('brakes','Pads')!,partGuide('exhaust','Slip-on muffler')!])for(const text of [g.what,...g.kinds.map(k=>k.plain)])assert.ok(!/—|\d{3,}/.test(text));
});
