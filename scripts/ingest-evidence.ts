import { readFile, stat, realpath } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, dirname, relative, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { z } from 'zod';
import { candidateSchema, stagedClaim, promotionBlockers, validateImportTarget } from '../shared/evidence.ts';

export async function ingest(args:string[]) {
 const apply=args.includes('--apply');
 const paths=args.filter(a=>!a.startsWith('--'));
 if(paths.length!==1||args.some(a=>a.startsWith('--')&&a!=='--apply'))throw new Error('Usage: node --experimental-strip-types scripts/ingest-evidence.ts candidates.json [--apply]');
 const path=await realpath(resolve(paths[0]));
 if((await stat(path)).size>5_000_000)throw new Error('Candidate file exceeds 5 MB');
 const rows=z.array(z.object({candidate:candidateSchema,document_file:z.string().min(1)}).strict()).min(1).max(500).parse(JSON.parse(await readFile(path,'utf8')));
 if(new Set(rows.map(r=>r.candidate.id)).size!==rows.length)throw new Error('Duplicate claim IDs');
 for(const r of rows){
  const file=await realpath(resolve(dirname(path),r.document_file));const rel=relative(dirname(path),file);
  if(isAbsolute(r.document_file)||rel.startsWith('..'))throw new Error('Document file must be inside candidate directory');
  if((await stat(file)).size>100_000_000)throw new Error('Document exceeds 100 MB');
  const hash=createHash('sha256').update(await readFile(file)).digest('hex');
  if(hash!==r.candidate.source.document_sha256)throw new Error(`Document hash mismatch for ${r.candidate.id}`);
 }
 const report=rows.map(r=>({id:r.candidate.id,status:'STAGED',promotion_blockers:promotionBlockers(r.candidate)}));
 if(apply){
  const url=validateImportTarget(process.env.SUPABASE_URL,process.env.BAK_MX_SUPABASE_PROJECT_REF);
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!key)throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  const {createClient}=await import('@supabase/supabase-js');
  const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>fetch(input,{...init,redirect:'error'})}});
  const {error}=await db.from('claims').insert(rows.map(r=>stagedClaim(r.candidate)));
  if(error)throw new Error(`STAGED import failed (${error.code}); no promotion attempted`);
 }
 return {mode:apply?'applied':'dry-run',count:rows.length,claims:report};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 ingest(process.argv.slice(2)).then(report=>console.log(JSON.stringify(report,null,2))).catch(error=>{console.error(error instanceof Error?error.message:'Evidence import failed');process.exitCode=1;});
}
