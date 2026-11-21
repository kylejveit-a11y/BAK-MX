import test from 'node:test';
import assert from 'node:assert/strict';
import {suspensionWorkshop} from '../shared/specialists.ts';
const topics=(m:string,h:string[]=[])=>suspensionWorkshop(m,h)?.sections.map(s=>s.topic)??null;
test('suspension workshop: only for suspension questions, only the sections the question touches',()=>{
 assert.equal(topics('What jet should I run at 3000 ft?'),null);
 assert.equal(topics('How often do I change the engine oil?'),null);
 assert.deepEqual(topics('How do I measure race sag?'),['Measuring and reading sag']);
 assert.ok(topics('Walk me through replacing fork seals')!.includes('Fork seals'));
 assert.ok(topics('Can I recharge the shock nitrogen myself?')!.includes('Shock service, nitrogen and fade'));
 assert.ok(topics('What is the difference between the base valve and the mid valve in a fork?')!.includes('How the damping works inside'));
 assert.ok((topics('fork bottoms on big landings, should I add oil?')??[]).includes('Fork oil amount and bottoming'));
 assert.ok(topics('The rear kicks on braking bumps')===null||topics('The rear kicks on braking bumps')!.length<=4);
});
test('suspension workshop: a short follow-up inherits the topic; another system does not',()=>{
 assert.ok(topics('how often?',['How do I service my shock?'])!.includes('Shock service, nitrogen and fade'));
 assert.equal(topics('and the clutch?',['How do I service my shock?']),null);
});
test('suspension workshop: carries method, never a bike number',()=>{
 const all=suspensionWorkshop('sag spring air fork psi oil level seal fork oil rebuild bleed nitrogen linkage alignment shim ran out of clicks tie down')!;
 assert.ok(all.sections.length<=4);
 const everything=JSON.stringify(['sag','springs lbs','air fork psi','oil level cc','fork seals leak','fork oil rebuild','bleed','shock service nitrogen','linkage','stiction axle','shim stack','ran out of clicks','tie downs'].map(m=>suspensionWorkshop('fork '+m)));
 assert.doesNotMatch(everything,/\b\d+(\.\d+)? ?(psi|bar|N\/mm|kg\/mm|Nm|ft.?lb|cc|ml|mm)\b/i);
 assert.match(suspensionWorkshop('shim stack for my shock')!.boundary,/NO numbers/);
});
import {engineWorkshop,setupWorkshop} from '../shared/specialists.ts';
const names=(p:ReturnType<typeof engineWorkshop>)=>p?.sections.map(s=>s.topic)??null;
test('engine and set-up workshops: the right sections, at most three, nothing for unrelated questions',()=>{
 assert.ok(names(engineWorkshop('Walk me through checking valve clearances'))!.some(t=>/Valve clearance/.test(t)));
 assert.ok(names(engineWorkshop('Bike revs to the moon by itself'))!.some(t=>/Two-stroke/.test(t)));
 assert.ok(names(engineWorkshop('bogs at full throttle, main jet?'))!.includes('Carburettor jetting'));
 assert.equal(engineWorkshop('How do I measure race sag?'),null);
 assert.ok(names(setupWorkshop('What happens if I add two teeth to the rear sprocket?'))!.includes('Gearing'));
 assert.ok(names(setupWorkshop('front brake feels spongy'))!.includes('Brakes'));
 assert.equal(setupWorkshop('What are the valve clearances?'),null);
 for(const m of ['engine piston valves jet clutch crank coolant start efi two-stroke','gearing chain bars steering tires spokes brakes race day'])for(const f of [engineWorkshop,setupWorkshop])assert.ok((f(m)?.sections.length??0)<=3);
});
test('workshops never carry a porting dimension or a shim stack',()=>{
 const text=JSON.stringify([engineWorkshop('is porting worth it on my two-stroke'),suspensionWorkshop('shim stack for my shock')]);
 assert.match(text,/Never give grinding dimensions/);assert.match(text,/not on file unless verified_claims/);
});
test('engine workshop: sections that cannot apply to the bike are left out',()=>{
 assert.equal(engineWorkshop('piston seized, what now?',[],{engine:'4-stroke',fuel:'injected'})?.sections.some(s=>/Two-stroke/.test(s.topic))??false,false);
 assert.equal(engineWorkshop('valve clearance',[],{engine:'2-stroke',fuel:'carburetor'}),null);
 assert.equal(engineWorkshop('runs lean and pops',[],{engine:'4-stroke',fuel:'injected'})?.sections.some(s=>s.topic==='Carburettor jetting')??false,false);
});
