import test from 'node:test';
import assert from 'node:assert/strict';
import {generateAnswer} from '../server/engineering.ts';
const bike:any={id:'bike',user_id:'owner',manufacturer:'Yamaha',model:'YZ450F',model_year:2026,region:'US',variant:'standard',configuration:{engine:'stock'}};
test('provider transport and audit retain the same reviewed operation snapshot',async()=>{
 const original=globalThis.fetch,key=process.env.OPENAI_API_KEY,model=process.env.OPENAI_MODEL;
 const response={claims:[],data_gaps:[],kind:'diagnosis',answer:'',setup_changes:[],summary:'Transport fixture only.',observations:[],systems:[],hypotheses:[],unknowns:[],next_step:{action:'Fixture',purpose:'Transport test',stop_conditions:[]},evidence_ids:[],specifications:[],confidence:'LIMITED'};
 let sent:any;
 try{
  process.env.OPENAI_API_KEY='test-only-never-sent';process.env.OPENAI_MODEL='test-only-model';
  globalThis.fetch=async(url,options)=>{assert.equal(url,'https://api.openai.com/v1/responses');sent=JSON.parse(String(options?.body));return new Response(JSON.stringify({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(response)}]}]}),{status:200});};
  const result=await generateAnswer(bike,[],[],'Help with valve inspection');
  assert.equal(sent.store,false);
  const input=JSON.parse(sent.input);
  assert.ok(input.reviewed_workshop.relevant_operations.length);
  assert.deepEqual(result.raw.bakmx_reviewed_workshop,input.reviewed_workshop);
  assert.ok(result.response.references?.some(r=>r.kind==='SOURCE_REVIEWED_OPERATION'));
  assert.equal(result.response.confidence,'LIMITED');
 }finally{globalThis.fetch=original;if(key===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=key;if(model===undefined)delete process.env.OPENAI_MODEL;else process.env.OPENAI_MODEL=model;}
});
