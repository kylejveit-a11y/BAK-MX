import test from 'node:test';
import assert from 'node:assert/strict';
import {checkBuild,slotOf} from '../shared/build-check.ts';
import {partNumbers,partNumberFor,chosenPartNumber,forOtherBike,sizesFor} from '../shared/parts-picker.ts';
import {readInstalled,systemsRecorded} from '../shared/installed-parts.ts';

const ktm=(parts:unknown[],extra:Record<string,unknown>={})=>({manufacturer:'KTM',model:'450 SX-F',model_year:2025,configuration:{installed_parts:parts,...extra}});

test('a part made for another maker\'s shock is flagged against the shock actually on the bike',()=>{
 const c=checkBuild(ktm([{s:'suspension',b:'Xtrig',n:'Pre-Load Adjuster For Ohlins Reverse Threaded Shock'}]));
 assert.equal(c.length,1);assert.match(c[0].text,/Öhlins shock, but the stock WP shock is on the bike/);
 // fitting the Öhlins shock makes it fit
 assert.equal(checkBuild(ktm([{s:'suspension',b:'Xtrig',n:'Pre-Load Adjuster For Ohlins Reverse Threaded Shock'},{s:'suspension',b:'Öhlins',n:'TTX Flow Shock'}])).length,0);
});

test('a stock-shock accessory no longer fits once an aftermarket shock is on the bike, unless it is off the bike',()=>{
 const parts=[{s:'suspension',b:'KTM PowerParts',n:'Preload adjuster'},{s:'suspension',b:'Öhlins',n:'TTX Flow Shock'}];
 assert.match(checkBuild(ktm(parts))[0].text,/listed for the stock shock/);
 assert.equal(checkBuild(ktm([{...parts[0],o:true},parts[1]])).length,0);
});

test('two parts in one slot are flagged only while both are on the bike; work done fills no slot',()=>{
 const mounts=[{s:'controls',b:'Xtrig',n:'OEM PHDS Bar Mounts'},{s:'controls',b:'ODI',n:'Universal Bar Mounts 1 1/8'}];
 assert.match(checkBuild(ktm(mounts))[0].text,/Both of these are marked on the bike/);
 assert.equal(checkBuild(ktm([mounts[0],{...mounts[1],o:true}])).length,0);
 assert.equal(checkBuild(ktm([{s:'suspension',b:'WP',n:'XACT PRO 6500 Fork Cartridge Kit (KTM)'},{s:'suspension',b:'REP Suspension',n:'Fork serviced'}])).length,0);
 assert.equal(slotOf({s:'wheels',b:'Dunlop',n:'Geomax MX34 Front Tire'}),'Front tire');
});

test('sprocket size is checked against saved gearing',()=>{
 assert.match(checkBuild(ktm([{s:'gearing',b:'Renthal',n:'Twinring Rear Sprocket',v:'48T'}],{rear_sprocket:52}))[0].text,/48 teeth, but your gearing says 52/);
 assert.match(checkBuild(ktm([{s:'gearing',b:'Renthal',n:'Twinring Rear Sprocket',p:'2240-520-47GPSI'}],{rear_sprocket:52}))[0].text,/doesn’t match 52 teeth/);
 assert.equal(checkBuild(ktm([{s:'gearing',b:'Renthal',n:'Twinring Rear Sprocket',v:'52T',p:'2240-520-52GPSI'}],{rear_sprocket:52})).length,0);
});

test('size picks the matching part number; a multi-size listing without a size saves none',()=>{
 const pns=partNumbers('2240-520-47GPSI 2240-520-48GPBK 2240-520-52GPSI');
 assert.equal(partNumberFor(pns,'52T'),'2240-520-52GPSI');
 assert.equal(chosenPartNumber({pns},undefined),'');
 assert.equal(chosenPartNumber({pns:['154224FRX']},undefined),'154224FRX');
 assert.equal(partNumberFor(['RAL-990-52-BLK','RAL-990-52-ORG'],'52T'),'');
 assert.deepEqual(sizesFor('Rear sprocket')?.options.slice(0,2),['38T','39T']);
});

test('listings for road or other-stroke bikes are kept out of a 450 SX-F list',()=>{
 assert.ok(forOtherBike('Rear Sprocket (42T-52T) /Duke/SM/SMC','450 SX-F'));
 assert.ok(forOtherBike('Stock ECU remap (two-stroke TBI)','450 SX-F'));
 assert.ok(!forOtherBike('Twinring Rear Sprocket','450 SX-F'));
 assert.ok(!forOtherBike('Stock ECU remap (two-stroke TBI)','300 SX'));
});

test('off-the-bike parts are kept but do not count as the section being set',()=>{
 const cfg={installed_parts:[{s:'wheels',b:'Dunlop',n:'Geomax MX14 Rear Tire',o:true,v:''}]};
 assert.equal(readInstalled(cfg).parts[0].o,true);assert.equal(systemsRecorded(cfg),0);
});
