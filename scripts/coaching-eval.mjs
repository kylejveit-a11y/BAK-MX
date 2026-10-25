// Runs the riding-coaching test set (tests/evaluation/coaching/cases.mjs) against Ask BAK through the evaluation route and
// writes report.json and report.md. Usage: node scripts/coaching-eval.mjs <token file> <out dir> [case ids...]
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {cases,check} from '../tests/evaluation/coaching/cases.mjs';
const [tokenFile,outDir,...only]=process.argv.slice(2);
if(!tokenFile||!outDir){console.error('usage: node scripts/coaching-eval.mjs <token file> <out dir> [case ids...]');process.exit(2);}
const token=readFileSync(tokenFile,'utf8').trim(),base=process.env.BAKMX_URL??'https://bakmx.com';
const bike=(level,discipline)=>({manufacturer:'KTM',model:'450 SX-F',model_year:2025,engine_hours:40,configuration:{skill_level:level,discipline}});
mkdirSync(outDir,{recursive:true});
const run=async c=>{
 const t0=Date.now();
 try{
  const r=await fetch(base+'/api/eval/ask',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({bike:bike(c.level,c.discipline),message:c.q}),signal:AbortSignal.timeout(170000)});
  if(!r.ok)return {id:c.id,ok:false,failures:[`HTTP ${r.status}`],ms:Date.now()-t0};
  const j=await r.json(),answer=[j.response.answer??j.response.summary??'',j.response.next_step?.action??''].join('\n'),failures=check(c,answer);
  return {id:c.id,level:c.level,q:c.q,ok:!failures.length,failures,ms:j.ms,prompt_version:j.prompt_version,answer};
 }catch(e){return {id:c.id,ok:false,failures:[String(e.message??e)],ms:Date.now()-t0};}
};
const picked=cases.filter(c=>!only.length||only.includes(c.id)),results=[];
for(let i=0;i<picked.length;i+=4)results.push(...await Promise.all(picked.slice(i,i+4).map(run)));
writeFileSync(outDir+'/report.json',JSON.stringify(results,null,1));
writeFileSync(outDir+'/report.md',results.map(r=>`## ${r.ok?'PASS':'FAIL'} ${r.id} (${r.level??''})\n${r.q??''}\n${r.failures.map(f=>'- '+f).join('\n')}\n\n${r.answer??''}\n`).join('\n'));
console.log(`${results.filter(r=>r.ok).length}/${results.length} passed`);for(const r of results.filter(r=>!r.ok))console.log(r.id,r.failures.join(' | '));
