import test from 'node:test';
import assert from 'node:assert/strict';
import {planSpecLookups,generateAnswer} from '../server/engineering.ts';
import {searchBikeClaims} from '../server/claims.ts';
const bike:any={id:'bike',user_id:'owner',manufacturer:'KTM',model:'450 SX-F',model_year:2025,region:'US',variant:'standard',configuration:{}};
const claim=(id:string,over:any={})=>({id,manufacturer:'KTM',model:'450 SX-F',model_year:2025,variant:'standard',region:'US',domain:'chassis',statement:'Rear axle nut (M22x1.5): 80 Nm.',source_url:'https://example.com/om.pdf',source_locator:'p. 157',status:'VERIFIED',has_conflict:false,...over});
const ok=(body:unknown)=>new Response(JSON.stringify({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(body)}]}]}),{status:200});
async function withProvider(handler:(sent:any)=>Response,run:()=>Promise<void>){
 const original=globalThis.fetch,key=process.env.OPENAI_API_KEY,model=process.env.OPENAI_MODEL;
 try{process.env.OPENAI_API_KEY='test-only-never-sent';process.env.OPENAI_MODEL='test-only-model';globalThis.fetch=async(_url,options)=>handler(JSON.parse(String(options?.body)));await run();}
 finally{globalThis.fetch=original;if(key===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=key;if(model===undefined)delete process.env.OPENAI_MODEL;else process.env.OPENAI_MODEL=model;}
}
test('lookup planning sends no evidence and returns deduplicated search terms',async()=>{
 let sent:any;
 await withProvider(s=>{sent=s;return ok({queries:['rear axle nut torque',' rear axle nut torque ','chain slack']});},async()=>{
  const queries=await planSpecLookups(bike,[],'what do I torque the back axle to');
  assert.deepEqual(queries,['rear axle nut torque','chain slack']);
  const input=JSON.parse(sent.input);
  assert.equal(sent.text.format.name,'mx_spec_lookup');assert.equal(sent.store,false);
  assert.equal(input.verified_claims,undefined);assert.equal(input.bike.model_year,2025);
 });
});
test('a failed or malformed lookup plan falls back to the rider\'s own words instead of costing them an answer',async()=>{
 await withProvider(()=>ok({queries:'rear axle'}),async()=>{assert.deepEqual(await planSpecLookups(bike,[],'  axle torque  '),['axle torque']);});
 await withProvider(()=>new Response('upstream down',{status:500}),async()=>{assert.deepEqual(await planSpecLookups(bike,[],'what do I torque the back axle to'),['what do I torque the back axle to']);});
});
test('retrieval is exact-bike scoped, deduplicated and drops out-of-scope or conflicted rows',async()=>{
 const calls:any[]=[];
 const db:any={rpc(name:string,args:any){calls.push({name,args});return Promise.resolve({error:null,data:[claim('a'),claim('b',{model_year:2024}),claim('c',{has_conflict:true}),claim('d',{status:'STAGED'})]});}};
 const found=await searchBikeClaims(db,{...bike,variant:'Stock',region:'usa'},['rear axle nut torque','rear axle nut torque','chain slack']);
 assert.deepEqual(found.map(c=>c.id),['a']);
 assert.equal(calls.length,2);assert.equal(calls[0].name,'search_bike_evidence');
 assert.deepEqual(calls[0].args,{p_manufacturer:'KTM',p_model:'450 SX-F',p_model_year:2025,p_variant:'standard',p_region:'US',p_query:'rear axle nut torque',p_limit:12});
});
test('no lookups means no database search; a search failure is surfaced',async()=>{
 const db:any={rpc(){throw new Error('must not be called');}};
 assert.deepEqual(await searchBikeClaims(db,bike,[]),[]);
 const failing:any={rpc(){return Promise.resolve({error:{message:'x'},data:null});}};
 await assert.rejects(searchBikeClaims(failing,bike,['axle']),/could not be searched/);
});
test('the answer sees only retrieved evidence and may cite only that evidence',async()=>{
 const retrieved=[claim('11111111-1111-4111-8111-111111111111')];
 const base={claims:[],data_gaps:[],kind:'answer',answer:'Use the published rear axle nut torque below.',setup_changes:[],summary:'Torque the rear axle nut to the published value.',observations:[],systems:['chassis'],hypotheses:[],unknowns:[],next_step:{action:'Torque the nut',purpose:'Secure the wheel',stop_conditions:[]},confidence:'SUPPORTED'};
 let sent:any;
 await withProvider(s=>{sent=s;return ok({...base,evidence_ids:[retrieved[0].id],specifications:[{claim_id:retrieved[0].id,value:retrieved[0].statement}]});},async()=>{
  const result=await generateAnswer(bike,[],retrieved as any,'rear axle torque?',['rear axle nut torque']);
  const input=JSON.parse(sent.input);
  assert.equal(input.verified_claims.length,1);assert.deepEqual(input.spec_lookups_performed,['rear axle nut torque']);
  assert.match(input.evidence_boundary,/not on file for this answer/);
  assert.deepEqual(result.raw.bakmx_spec_lookups,['rear axle nut torque']);
  assert.equal(result.response.specifications[0].value,retrieved[0].statement);
 });
 await withProvider(()=>ok({...base,evidence_ids:['22222222-2222-4222-8222-222222222222'],specifications:[]}),async()=>{
  await assert.rejects(generateAnswer(bike,[],retrieved as any,'rear axle torque?',['rear axle nut torque']),/unavailable evidence/);
 });
 await withProvider(()=>ok({...base,evidence_ids:[retrieved[0].id],specifications:[{claim_id:retrieved[0].id,value:'Rear axle nut: 90 Nm.'}]}),async()=>{
  await assert.rejects(generateAnswer(bike,[],retrieved as any,'rear axle torque?',['rear axle nut torque']),/exact verified claim/);
 });
});
test('answer kinds: a healthy question needs no next step; a diagnosis must have one; an empty answer is refused',async()=>{
 const {validateResponse}=await import('../server/engineering.ts');
 const shape={claims:[],data_gaps:[],summary:'High-speed compression controls sharp, fast shaft movement.',observations:[],systems:['suspension'],hypotheses:[],unknowns:[],evidence_ids:[],specifications:[],confidence:'LIMITED'};
 const education=validateResponse({...shape,kind:'answer',answer:'It meters oil when the shock shaft moves fast, such as square-edge hits and landings.',setup_changes:[],next_step:null},[]);
 assert.equal(education.next_step,null);assert.equal(education.kind,'answer');
 const setup=validateResponse({...shape,kind:'setup',answer:'The front is riding high and not biting.',setup_changes:[{setting:'Fork compression',change:'2 clicks softer from where you are now',expect:'More front grip on corner entry',go_back_if:'It dives and bottoms under braking'}],next_step:{action:'Go 2 clicks softer on fork compression and ride the same corner',purpose:'One change so the result is readable',stop_conditions:[]}},[]);
 assert.equal(setup.setup_changes?.length,1);
 assert.throws(()=>validateResponse({...shape,kind:'diagnosis',answer:'',setup_changes:[],next_step:null},[]),/one next step/);
 assert.throws(()=>validateResponse({...shape,kind:'answer',answer:'  ',setup_changes:[],next_step:null},[]),/empty/);
 assert.throws(()=>validateResponse({...shape,kind:'chat',answer:'x',setup_changes:[],next_step:null},[]));
});
test('confidence tiers: published needs retrieved evidence, general guidance does not, and one repair is attempted',async()=>{
 const retrieved=[claim('11111111-1111-4111-8111-111111111111',{statement:'Riding sag: 105 mm. OEM US stock setup reference.',property:'rider_sag'})];
 const {responseViolations,responseSchema}=await import('../server/engineering.ts');
 const shape={kind:'answer',summary:'Sag guidance.',answer:'Published rider sag for this bike is 105 mm.',setup_changes:[],observations:[],systems:['suspension'],hypotheses:[],unknowns:[],next_step:null,evidence_ids:[retrieved[0].id],specifications:[{claim_id:retrieved[0].id,value:retrieved[0].statement}],data_gaps:[],confidence:'SUPPORTED'};
 const good=responseSchema.parse({...shape,claims:[{claim:'Rider sag 105 mm',tier:'PUBLISHED',evidence_ids:[retrieved[0].id]},{claim:'More sag slows steering',tier:'GENERAL',evidence_ids:[]}]});
 assert.deepEqual(responseViolations(good,retrieved as any),[]);
 const overclaimed=responseSchema.parse({...shape,claims:[{claim:'Fork compression is 12 clicks stock',tier:'PUBLISHED',evidence_ids:[]}]});
 assert.match(responseViolations(overclaimed,retrieved as any)[0],/PUBLISHED without retrieved evidence/);
 const leaked=responseSchema.parse({...shape,answer:'See 11111111-1111-4111-8111-111111111111 for sag.',claims:[]});
 assert.match(responseViolations(leaked,retrieved as any)[0],/internal identifier/);
 // First draft overclaims; the repair call fixes it and the repaired reply is the one returned.
 let calls=0;
 await withProvider(sent=>{calls++;return ok(calls===1?{...shape,claims:[{claim:'Fork compression is 12 clicks stock',tier:'PUBLISHED',evidence_ids:[]}]}:(assert.match(sent.instructions,/previous draft broke these rules/),{...shape,data_gaps:['Stock fork clicker settings'],claims:[{claim:'Rider sag 105 mm',tier:'PUBLISHED',evidence_ids:[retrieved[0].id]}]}));},async()=>{
  const result=await generateAnswer(bike,[],retrieved as any,'what sag and clickers',['rider sag']);
  assert.equal(calls,2);assert.equal(result.raw.bakmx_repaired,true);assert.deepEqual(result.response.data_gaps,['Stock fork clicker settings']);
 });
});
test('a provider failure is retried on the configured backup model',async()=>{
 const previous=process.env.OPENAI_BACKUP_MODEL;process.env.OPENAI_BACKUP_MODEL='test-backup-model';
 const models:string[]=[];
 try{
  await withProvider(sent=>{models.push(sent.model);return sent.model==='test-backup-model'?ok({claims:[],data_gaps:[],kind:'answer',summary:'Backup answered.',answer:'High-speed compression meters fast shaft movement.',setup_changes:[],observations:[],systems:[],hypotheses:[],unknowns:[],next_step:null,evidence_ids:[],specifications:[],confidence:'LIMITED'}):new Response('down',{status:503});},async()=>{
   const result=await generateAnswer(bike,[],[],'what does high speed compression do');
   assert.deepEqual(models,['test-only-model','test-backup-model']);assert.equal(result.raw.bakmx_model,'test-backup-model');
  });
 }finally{if(previous===undefined)delete process.env.OPENAI_BACKUP_MODEL;else process.env.OPENAI_BACKUP_MODEL=previous;}
});
test('the prompt separates setup feel, where a labelled range is allowed, from mechanical specifications, where it is not',async()=>{
 const {instructions}=await import('../server/engineering.ts');
 assert.match(instructions,/SETUP FEEL \(sag, clicker positions, tire pressure, gearing/);
 assert.match(instructions,/MECHANICAL SPECIFICATIONS \(torque, valve clearance, jet and needle sizes[^.]*\): never give a general or remembered number/);
});
