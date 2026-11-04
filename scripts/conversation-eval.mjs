// Runs the multi-turn conversation tests (docs/research/eval/conversations-set1.json) through Ask BAK's evaluation route.
// Each rider turn is sent with BAK's actual earlier replies, as the app's conversation does.
// Usage: node scripts/conversation-eval.mjs <token file> <out dir> [conversation ids...]
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
const [tokenFile,outDir,...only]=process.argv.slice(2);
if(!tokenFile||!outDir){console.error('usage: node scripts/conversation-eval.mjs <token file> <out dir> [ids...]');process.exit(2);}
const token=readFileSync(tokenFile,'utf8').trim(),base=process.env.BAKMX_URL??'https://bakmx.com';
const {conversations}=JSON.parse(readFileSync(process.env.CONVERSATIONS??new URL('../docs/research/eval/conversations-set1.json',import.meta.url),'utf8'));
mkdirSync(outDir,{recursive:true});
const out=outDir+'/conversations.json',done=existsSync(out)?JSON.parse(readFileSync(out,'utf8')):[];
const have=new Set(done.filter(r=>r.ok).map(r=>r.id));
async function ask(body){
 for(let attempt=0;attempt<2;attempt++){
  try{const r=await fetch(base+'/api/eval/ask',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(180000)});
   if(r.ok)return await r.json();if(attempt)throw new Error(`HTTP ${r.status} ${(await r.text()).slice(0,200)}`);}
  catch(e){if(attempt)throw e;}
 }
}
async function run(c){
 const bike={...c.bike,engine_hours:null,configuration:c.bike.configuration??{}},history=[],turns=[];
 try{
  for(const message of c.turns){
   const j=await ask({bike,message,history,...(c.setup_history?{setup_history:c.setup_history}:{}),...(c.race?{race:c.race}:{})});
   turns.push({rider:message,reply:{summary:j.response.summary,answer:j.response.answer,next_step:j.response.next_step,setup_changes:j.response.setup_changes},cited_facts:(j.response.specifications??[]).map(s=>s.value),ms:j.ms,prompt_version:j.prompt_version});
   history.push({role:'user',content:message},{role:'assistant',content:j.response.summary??'',response:j.response});
  }
  return {id:c.id,ok:true,bike:c.bike,setup_history:c.setup_history??null,race:c.race??null,checks:c.checks,turns};
 }catch(e){return {id:c.id,ok:false,error:String(e.message??e),turns};}
}
const picked=conversations.filter(c=>(!only.length||only.includes(c.id))&&!have.has(c.id)),results=done.filter(r=>r.ok);
for(let i=0;i<picked.length;i+=3){
 results.push(...await Promise.all(picked.slice(i,i+3).map(run)));
 writeFileSync(out,JSON.stringify(results,null,1));
 console.log(`${Math.min(i+3,picked.length)}/${picked.length}`,results.slice(-3).map(r=>r.ok?r.id:r.id+' FAIL '+r.error).join(' '));
}
console.log(`${results.filter(r=>r.ok).length} conversations done, ${results.filter(r=>!r.ok).length} failed`);
