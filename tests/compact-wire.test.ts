import test from 'node:test';
import assert from 'node:assert/strict';
import {generateAnswer} from '../server/engineering.ts';
import {factSystem} from '../shared/fact-system.ts';
// The model reads and cites short aliases and never re-types a claim statement; the saved reply must still carry the real
// claim id and the exact verified statement, and an alias that was never offered must still be refused.
const bike:any={id:'bike',user_id:'owner',manufacturer:'KTM',model:'450 SX-F',model_year:2025,region:'US',variant:'standard',configuration:{}};
const id='11111111-1111-4111-8111-111111111111';
const claim={id,manufacturer:'KTM',model:'450 SX-F',model_year:2025,variant:'standard',region:'US',domain:'chassis',statement:'Rear axle nut (M22x1.5): 80 Nm.',source_url:'https://example.com/om.pdf',source_locator:'p. 157',status:'VERIFIED',has_conflict:false};
const reply=(cite:string)=>({kind:'answer',summary:'80 Nm.',answer:'Rear axle nut: **80 Nm**, per the owner’s manual.',setup_changes:[],observations:[],systems:[],hypotheses:[],unknowns:[],next_step:null,evidence_ids:[cite],specifications:[{claim_id:cite}],claims:[{claim:'Rear axle nut torque',tier:'PUBLISHED',evidence_ids:[cite]}],data_gaps:[],confidence:'SUPPORTED'});
const ok=(body:unknown)=>new Response(JSON.stringify({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(body)}]}]}),{status:200});
async function withProvider(handler:(sent:any)=>Response,run:()=>Promise<void>){
 const original=globalThis.fetch,key=process.env.OPENAI_API_KEY,model=process.env.OPENAI_MODEL;
 try{process.env.OPENAI_API_KEY='test-only-never-sent';process.env.OPENAI_MODEL='test-only-model';globalThis.fetch=async(_url,options)=>handler(JSON.parse(String(options?.body)));await run();}
 finally{globalThis.fetch=original;if(key===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=key;if(model===undefined)delete process.env.OPENAI_MODEL;else process.env.OPENAI_MODEL=model;}
}
test('model sees aliases and slim claims; saved reply carries the real id and exact statement',async()=>{
 let sent:any;
 await withProvider(body=>{sent=JSON.parse(body.input);return ok(reply('c1'));},async()=>{
  const {response}=await generateAnswer(bike,[],[claim] as any,'rear axle torque?',['rear axle nut torque']);
  assert.deepEqual(sent.verified_claims,[{id:'c1',domain:'chassis',system:factSystem(claim),statement:claim.statement,source_locator:'p. 157'}]);
  assert.ok(!JSON.stringify(sent.verified_claims).includes(id));
  assert.deepEqual(response.evidence_ids,[id]);
  assert.deepEqual(response.specifications,[{claim_id:id,value:claim.statement}]);
  assert.deepEqual(response.claims?.[0].evidence_ids,[id]);
 });
});
test('an alias that was never offered is refused, not saved',async()=>{
 await withProvider(()=>ok(reply('c9')),async()=>{await assert.rejects(generateAnswer(bike,[],[claim] as any,'rear axle torque?',[]));});
});
test('earlier replies are sent as context without audit lists or identifiers',async()=>{
 let sent:any;const earlier={...reply(id),specifications:[{claim_id:id,value:claim.statement}]};
 const history:any=[{id:'m1',conversation_id:'c',user_id:'owner',role:'user',content:'rear axle torque?',response:null,created_at:''},{id:'m2',conversation_id:'c',user_id:'owner',role:'assistant',content:'',response:earlier,created_at:''}];
 await withProvider(body=>{sent=JSON.parse(body.input);return ok(reply('c1'));},async()=>{
  await generateAnswer(bike,history,[claim] as any,'and the front?',[]);
  assert.equal(sent.conversation[1].content.answer,earlier.answer);
  assert.ok(!JSON.stringify(sent.conversation).includes(id));
  assert.equal(sent.conversation[1].content.claims,undefined);
 });
});
