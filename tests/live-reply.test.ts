import test from 'node:test';
import assert from 'node:assert/strict';
import {generateAnswer,partialJsonString} from '../server/engineering.ts';
// The reply is shown while it is written. These tests pin the two things that must hold: the draft text is read correctly
// out of unfinished JSON, and the finished reply still goes through the same checks as a non-streamed one.
const bike:any={id:'bike',user_id:'owner',manufacturer:'KTM',model:'450 SX-F',model_year:2025,region:'US',variant:'standard',configuration:{}};
const id='11111111-1111-4111-8111-111111111111';
const claim={id,manufacturer:'KTM',model:'450 SX-F',model_year:2025,variant:'standard',region:'US',domain:'chassis',statement:'Rear axle nut (M22x1.5): 80 Nm.',source_url:'https://example.com/om.pdf',source_locator:'p. 157',status:'VERIFIED',has_conflict:false};
const reply=(cite:string)=>({kind:'answer',summary:'80 Nm.',answer:'Rear axle nut: **80 Nm**.\nPer the owner’s "manual".',setup_changes:[],observations:[],systems:[],hypotheses:[],unknowns:[],next_step:null,evidence_ids:[cite],specifications:[{claim_id:cite}],claims:[{claim:'Rear axle nut torque',tier:'PUBLISHED',evidence_ids:[cite]}],data_gaps:[],confidence:'SUPPORTED'});
function sse(body:unknown,pieces=7){
 const text=JSON.stringify(body),size=Math.ceil(text.length/pieces),events:string[]=[];
 for(let i=0;i<text.length;i+=size)events.push('event: response.output_text.delta\ndata: '+JSON.stringify({type:'response.output_text.delta',delta:text.slice(i,i+size)})+'\n\n');
 events.push('event: response.completed\ndata: '+JSON.stringify({type:'response.completed',response:{status:'completed',output:[{content:[{type:'output_text',text}]}]}})+'\n\n');
 const all=events.join(''),bytes=new TextEncoder().encode(all);
 // Deliver in awkward chunks so event boundaries fall mid-chunk.
 return new Response(new ReadableStream({start(c){for(let i=0;i<bytes.length;i+=53)c.enqueue(bytes.slice(i,i+53));c.close();}}),{status:200,headers:{'content-type':'text/event-stream'}});
}
async function withProvider(handler:(sent:any)=>Response,run:()=>Promise<void>){
 const original=globalThis.fetch,key=process.env.OPENAI_API_KEY,model=process.env.OPENAI_MODEL;
 try{process.env.OPENAI_API_KEY='test-only-never-sent';process.env.OPENAI_MODEL='test-only-model';globalThis.fetch=async(_url,options)=>handler(JSON.parse(String(options?.body)));await run();}
 finally{globalThis.fetch=original;if(key===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=key;if(model===undefined)delete process.env.OPENAI_MODEL;else process.env.OPENAI_MODEL=model;}
}
test('a field is read out of JSON that is still being written',()=>{
 const full=JSON.stringify({kind:'answer',summary:'Short.',answer:'Line one\nSay "hi" \\ done — é'});
 assert.equal(partialJsonString(full,'answer'),'Line one\nSay "hi" \\ done — é');
 assert.equal(partialJsonString(full,'summary'),'Short.');
 assert.equal(partialJsonString(full.slice(0,20),'answer'),'');
 for(let n=1;n<full.length;n++){const part=partialJsonString(full.slice(0,n),'answer');assert.ok('Line one\nSay "hi" \\ done — é'.startsWith(part),`prefix at ${n}`);}
 assert.equal(partialJsonString('{"answer":"caf\\u00e9 \\u00','answer'),'café ');
});
test('a streamed reply shows a growing draft and saves the same checked result',async()=>{
 const drafts:{summary:string;answer:string}[]=[];let sent:any;
 await withProvider(body=>{sent=body;return sse(reply('c1'));},async()=>{
  const {response}=await generateAnswer(bike,[],[claim] as any,'rear axle torque?',[],d=>drafts.push(d));
  assert.equal(sent.stream,true);
  assert.ok(drafts.length>2);
  for(let i=1;i<drafts.length;i++)assert.ok(drafts[i].answer.startsWith(drafts[i-1].answer));
  assert.equal(drafts[drafts.length-1].answer,reply('c1').answer);
  assert.equal(response.answer,reply('c1').answer);
  assert.deepEqual(response.specifications,[{claim_id:id,value:claim.statement}]);
 });
});
test('a streamed reply that cites evidence it was never given is refused',async()=>{
 await withProvider(()=>sse(reply('c9')),async()=>{await assert.rejects(generateAnswer(bike,[],[claim] as any,'rear axle torque?',[],()=>{}));});
});
test('without a draft listener the call is not streamed',async()=>{
 let sent:any;
 await withProvider(body=>{sent=body;return new Response(JSON.stringify({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(reply('c1'))}]}]}),{status:200});},async()=>{
  await generateAnswer(bike,[],[claim] as any,'rear axle torque?',[]);assert.equal(sent.stream,undefined);
 });
});
test('live draft is read from pretty-printed JSON as well as compact JSON',()=>{
 const pretty='{\n  "kind": "setup",\n  "summary": "A sharp rear kick points to compression.",\n  "answer": "**If the rear';
 assert.equal(partialJsonString(pretty,'summary'),'A sharp rear kick points to compression.');
 assert.equal(partialJsonString(pretty,'answer'),'**If the rear');
 assert.equal(partialJsonString('{"kind":"answer","summary":"Short","answer":"35 Nm','answer'),'35 Nm');
 assert.equal(partialJsonString('{\n  "kind": "setup",\n  "summ','summary'),'');
});
