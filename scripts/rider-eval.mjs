// Runs the 100 real rider questions (docs/research/eval/rider-questions-100.json) through Ask BAK's evaluation route and
// saves every full answer for grading. Usage: node scripts/rider-eval.mjs <token file> <out dir> [question ids...]
// The route never touches a rider's account: the bike comes in the request (see server/eval-access.ts).
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
const [tokenFile,outDir,...only]=process.argv.slice(2);
if(!tokenFile||!outDir){console.error('usage: node scripts/rider-eval.mjs <token file> <out dir> [ids...]');process.exit(2);}
const token=readFileSync(tokenFile,'utf8').trim(),base=process.env.BAKMX_URL??'https://bakmx.com';
const {questions}=JSON.parse(readFileSync(new URL('../docs/research/eval/rider-questions-100.json',import.meta.url),'utf8'));
mkdirSync(outDir,{recursive:true});
const out=outDir+'/answers.json',done=existsSync(out)?JSON.parse(readFileSync(out,'utf8')):[];
const have=new Set(done.filter(r=>r.ok).map(r=>r.id));
// Rider questions without a year are asked on the newest year the app lists for that bike; without a bike, as a general question.
const bikeFor=q=>q.make&&q.model?{manufacturer:q.make,model:q.model,model_year:q.year??2025,engine_hours:null,configuration:{}}:null;
const run=async q=>{
 const t0=Date.now();
 try{
  const r=await fetch(base+'/api/eval/ask',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({bike:bikeFor(q),message:q.question}),signal:AbortSignal.timeout(180000)});
  if(!r.ok)return {id:q.id,ok:false,error:`HTTP ${r.status} ${(await r.text()).slice(0,200)}`,ms:Date.now()-t0};
  const j=await r.json();
  return {id:q.id,ok:true,topic:q.topic,bike:bikeFor(q),question:q.question,rider_context:q.rider_context,prompt_version:j.prompt_version,ms:j.ms??Date.now()-t0,response:j.response};
 }catch(e){return {id:q.id,ok:false,error:String(e.message??e),ms:Date.now()-t0};}
};
const picked=questions.filter(q=>(!only.length||only.includes(q.id))&&!have.has(q.id)),results=done.filter(r=>r.ok);
for(let i=0;i<picked.length;i+=4){
 results.push(...await Promise.all(picked.slice(i,i+4).map(run)));
 writeFileSync(out,JSON.stringify(results,null,1));
 console.log(`${Math.min(i+4,picked.length)}/${picked.length}`,results.slice(-4).map(r=>r.ok?r.id:r.id+' FAIL '+r.error).join(' '));
}
console.log(`${results.filter(r=>r.ok).length} answered, ${results.filter(r=>!r.ok).length} failed`);
