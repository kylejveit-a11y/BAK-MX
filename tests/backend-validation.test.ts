import test from 'node:test';
import assert from 'node:assert/strict';
import {bikeSchema,serviceSchema,chatSchema} from '../server/validation.ts';
import {applicableClaims,validateResponse,buildEngineeringInput,PROMPT_VERSION} from '../server/engineering.ts';
import {handleRequest} from '../server/app.ts';
import {checked} from '../server/database.ts';
import type {Bike,Claim} from '../shared/types.ts';
const bike={id:'00000000-0000-4000-8000-000000000001',user_id:'00000000-0000-4000-8000-000000000002',manufacturer:'KTM',model:'450 SX-F',model_year:2025,variant:'standard',region:'US',nickname:'Race bike',engine_hours:null,configuration:{},created_at:'',updated_at:''} satisfies Bike;
const claim={id:'00000000-0000-4000-8000-000000000003',manufacturer:'KTM',model:'450 SX-F',model_year:2025,variant:'standard',region:'US',domain:'test',statement:'Fixture only: test value 1 unit',source_url:'https://example.test/manual',source_locator:'p1',status:'VERIFIED',has_conflict:false} satisfies Claim;
const response={claims:[],data_gaps:[],kind:'diagnosis' as const,answer:'',setup_changes:[],summary:'An inspection is needed',observations:['Noise reported'],systems:['engine'],hypotheses:[],unknowns:['Cause'],next_step:{action:'Stop engine',purpose:'Avoid further damage',stop_conditions:['Do not ride']},evidence_ids:[],specifications:[],confidence:'LIMITED'};
test('runtime input separates authored mechanisms from exact-applicability evidence',()=>{const input=buildEngineeringInput(bike,[],[claim,{...claim,model_year:2024}],'hypothetically cuts out');assert.equal(PROMPT_VERSION,'mx-engineering-50');assert.equal(input.verified_claims.length,1);assert.equal(input.authored_hypotheses.length,12);assert.ok(input.authored_hypotheses.every(m=>m.status==='LIMITED'));assert.match(input.hypothesis_boundary,/Hypothetical tests are not performed/);assert.equal(input.message,'hypothetically cuts out');});
test('changed bike context produces actionable retry error without leaking database detail',()=>{assert.throws(()=>checked({data:null,error:{message:'BAK_MX_CONTEXT_CHANGED'}}),{status:409});assert.throws(()=>checked({data:null,error:{message:'private database details'}}),{message:'Database operation failed'});});
test('bike input rejects ownership injection and unsupported model-year',()=>{const {id,user_id,created_at,updated_at,...input}=bike;assert.equal(bikeSchema.safeParse(input).success,true);assert.equal(bikeSchema.safeParse({...input,user_id}).success,false);assert.equal(bikeSchema.safeParse({...input,model_year:2019}).success,false);assert.equal(bikeSchema.safeParse({...input,model:'85 SX'}).success,false);});
test('service intervals require source; calendar dates normalize',()=>{const input={bike_id:bike.id,category:'Oil',performed_at:'2026-09-12',engine_hours:4,notes:'',next_due_hours:null,interval_source:''};assert.equal(serviceSchema.parse(input).performed_at,'2026-09-12T00:00:00.000Z');assert.equal(serviceSchema.safeParse({...input,next_due_hours:9}).success,false);assert.equal(serviceSchema.safeParse({...input,performed_at:'2026-02-30'}).success,false);});
test('chat requires retry identity and prevents arbitrary fields',()=>{assert.equal(chatSchema.safeParse({conversation_id:bike.id,message:'Help',request_id:claim.id}).success,true);assert.equal(chatSchema.safeParse({conversation_id:bike.id,message:'Help',request_id:claim.id,bike}).success,false);});
test('claim applicability rejects year, region, variant, conflict and staging',()=>{assert.equal(applicableClaims([claim],bike).length,1);for(const patch of [{model_year:2024},{region:'EU'},{variant:'Factory Edition'},{has_conflict:true},{status:'STAGED'}])assert.equal(applicableClaims([{...claim,...patch} as Claim],bike).length,0);});
test('response requires exact verified claim for specification and rejects missing citations',()=>{assert.doesNotThrow(()=>validateResponse(response,[]));assert.throws(()=>validateResponse({...response,confidence:'SUPPORTED'},[]));assert.throws(()=>validateResponse({...response,evidence_ids:[claim.id]},[]));assert.throws(()=>validateResponse({...response,evidence_ids:[claim.id],specifications:[{claim_id:claim.id,value:'invented 99 Nm'}]},[claim]));assert.doesNotThrow(()=>validateResponse({...response,evidence_ids:[claim.id],specifications:[{claim_id:claim.id,value:claim.statement}]},[claim]));});
test('retrieved but uncited evidence cannot justify supported confidence',()=>{assert.throws(()=>validateResponse({...response,confidence:'SUPPORTED'},[claim]));assert.doesNotThrow(()=>validateResponse({...response,evidence_ids:[claim.id],confidence:'SUPPORTED'},[claim]));});
test('answer boundary rejects staged, conflicted or unlocated evidence',()=>{for(const patch of [{status:'STAGED'},{has_conflict:true},{source_url:''},{source_locator:''}])assert.throws(()=>validateResponse({...response,evidence_ids:[claim.id],confidence:'SUPPORTED'},[{...claim,...patch} as Claim]));});
test('unconfigured backend cannot report ready or grant unauthenticated access',async()=>{const keys=['SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','SUPABASE_SERVICE_ROLE_KEY'];const saved=keys.map(k=>process.env[k]);keys.forEach(k=>delete process.env[k]);try{const health=await handleRequest(new Request('http://localhost/api/health'));assert.equal(health.status,503);assert.equal((await health.json()).ready,false);const bikes=await handleRequest(new Request('http://localhost/api/bikes'));assert.equal(bikes.status,503);}finally{keys.forEach((k,i)=>{if(saved[i]===undefined)delete process.env[k];else process.env[k]=saved[i];});}});

test('chat takes up to 4 photos, or the frames of one clip with matching times',()=>{
 const base={conversation_id:'3b8c3f9e-1c2d-4e5f-8a9b-0c1d2e3f4a5b',request_id:'4b8c3f9e-1c2d-4e5f-8a9b-0c1d2e3f4a5b',message:'coach me'};
 const ids=(n:number)=>Array.from({length:n},(_,i)=>`5b8c3f9e-1c2d-4e5f-8a9b-0c1d2e3f4a${String(i).padStart(2,'0')}`);
 assert.equal(chatSchema.safeParse({...base,photo_ids:ids(4)}).success,true);
 assert.equal(chatSchema.safeParse({...base,photo_ids:ids(6)}).success,false);
 assert.equal(chatSchema.safeParse({...base,photo_ids:ids(6),media:{kind:'clip',duration:8,frames:[0,1.5,3,4.5,6,7.5]}}).success,true);
 assert.equal(chatSchema.safeParse({...base,photo_ids:ids(5),media:{kind:'clip',duration:8,frames:[0,1.5,3,4.5,6,7.5]}}).success,false);
 const twelve=Array.from({length:12},(_,i)=>i*0.5);
 assert.equal(chatSchema.safeParse({...base,photo_ids:ids(12),media:{kind:'clip',duration:6,frames:twelve,focus:'jump',slowmo:true}}).success,true);
 assert.equal(chatSchema.safeParse({...base,photo_ids:ids(13),media:{kind:'clip',duration:6,frames:[...twelve,6]}}).success,false);
 assert.equal(chatSchema.safeParse({...base,photo_ids:ids(2),media:{kind:'photos',focus:'track'}}).success,true);
 assert.equal(chatSchema.safeParse({...base,media:{kind:'photos',focus:'track'}}).success,false);
 assert.equal(chatSchema.safeParse({...base,photo_ids:ids(2),media:{kind:'photos',focus:'wheelie'}}).success,false);
});

test('evidence search shares the fact budget across every search',async()=>{
 const {mergeSearchResults}=await import('../server/claims.ts');
 const mk=(p:string,n:number)=>Array.from({length:n},(_,i)=>({id:p+i}) as never);
 const out=mergeSearchResults([mk('a',12),mk('b',12),mk('c',12),mk('d',12),mk('e',12),mk('f',12)],60) as {id:string}[];
 assert.equal(out.length,60);for(const p of 'abcdef')assert.ok(out.filter(c=>c.id.startsWith(p)).length>=10,p);
 assert.deepEqual((mergeSearchResults([[{id:'x'} as never,{id:'y'} as never],[{id:'x'} as never]],60) as {id:string}[]).map(c=>c.id),['x','y']);
});

test('Works Edition is recognised whatever the rider calls it, and keeps its own tester picture',async()=>{
 const {canonicalVariant,canonicalModel}=await import('../shared/bike-identity.ts');
 for(const v of ['RWE','Works Edition','CRF450RWE','HRC WE'])assert.equal(canonicalVariant(v),'RWE',v);
 assert.equal(canonicalVariant('Factory Edition'),'Factory Edition');assert.equal(canonicalModel('Suzuki','rmz450'),'RM-Z450');
 const {bikeOverviewFor}=await import('../server/engineering.ts');
 const we=bikeOverviewFor({manufacturer:'Honda',model:'CRF450R',model_year:2025,variant:'RWE'}),std=bikeOverviewFor({manufacturer:'Honda',model:'CRF450R',model_year:2025,variant:'standard'});
 assert.match(we!.generation,/Works Edition/);assert.doesNotMatch(std!.generation,/Works Edition/);
});

test('garage sharing input: at most 8 own photos, no unknown fields',async()=>{
 const {garageSharingSchema}=await import('../server/rider-surfaces.ts');
 const id='00000000-0000-4000-8000-000000000001';
 assert.ok(garageSharingSchema.safeParse({bike_id:id,show_on_profile:true,photo_ids:[id]}).success);
 assert.ok(!garageSharingSchema.safeParse({bike_id:id,show_on_profile:true,photo_ids:Array(9).fill(id)}).success);
 assert.ok(!garageSharingSchema.safeParse({bike_id:id,show_on_profile:true,owner:'x'}).success);
 assert.equal(garageSharingSchema.parse({bike_id:id,show_on_profile:true}).build_sheet_public,false);
});

test('validation errors reach the rider in plain words',async()=>{
 const {friendlyIssue}=await import('../server/app.ts');
 const {eventSchema}=await import('../server/rider-surfaces.ts');
 const r=eventSchema.safeParse({title:'Practice',event_type:'practice',starts_at:'2026-11-01T16:00:00Z',ends_at:'2026-10-27T07:00:00Z',location_name:'BAK MX',description:''});
 assert.ok(!r.success);assert.equal(friendlyIssue(r.error),'An event cannot end before it starts');
 const r2=eventSchema.safeParse({});assert.ok(!r2.success);assert.match(friendlyIssue(r2.error),/Check the form/);
});

test('preferences: only known choices, race number 1-3 digits',async()=>{
 const {preferencesSchema,profileSchema}=await import('../server/rider-surfaces.ts');
 assert.ok(preferencesSchema.safeParse({units:'metric',answer_length:'quick',tone:'encouraging'}).success);
 assert.ok(!preferencesSchema.safeParse({units:'imperial',answer_length:'quick',tone:'straight'}).success);
 assert.ok(profileSchema.safeParse({handle:'rider_one',race_number:'36'}).success);
 assert.ok(!profileSchema.safeParse({handle:'rider_one',race_number:'1234'}).success);
 assert.ok(!profileSchema.safeParse({handle:'rider_one',race_number:'3a'}).success);
});
