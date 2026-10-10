import {z} from 'zod';
import {adminDb,checked} from './database.ts';
import {HttpError,readJson,uuid} from './validation.ts';
/** Report queue for administrators. Uses the service role after an explicit membership check;
 * every read and action is written to the admin access log. Removal hides content, it does not delete it. */
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const TABLE={post:'posts',comment:'post_comments',event:'events'} as const;
export const resolveSchema=z.object({report_id:uuid,action:z.enum(['dismiss','remove_content']),note:z.string().trim().max(500).default('')}).strict();
export async function handleModeration(req:Request,path:string,method:string,owner:string):Promise<Response|null>{
 if(path!=='/api/admin/reports')return null;
 const admin=adminDb();
 const member=checked(await admin.from('admin_memberships').select('user_id').eq('user_id',owner).maybeSingle());
 if(!member)throw new HttpError(403,'Administrator access required');
 if(method==='GET'){
  checked(await admin.from('admin_access_log').insert({user_id:owner,action:'read_content_reports'}));
  const reports=(checked(await admin.from('content_reports').select('*').is('resolved_at',null).order('created_at',{ascending:true}).limit(100))??[]) as Record<string,any>[];
  const withContent=await Promise.all(reports.map(async r=>{
   const table=TABLE[r.target_type as keyof typeof TABLE];
   if(table){const row=checked(await admin.from(table).select('*').eq('id',r.target_id).maybeSingle());return {...r,content:row};}
   if(r.target_type==='message'){const row=checked(await admin.from('direct_messages').select('id,sender_id,recipient_id,body,created_at').eq('id',r.target_id).maybeSingle());return {...r,content:row};}
   const row=checked(await admin.from('profiles').select('user_id,handle,display_name,bio,location').eq('user_id',r.target_id).maybeSingle());return {...r,content:row};
  }));
  return json({reports:withContent});
 }
 if(method==='POST'){
  const data=resolveSchema.parse(await readJson(req));
  const report=checked(await admin.from('content_reports').select('*').eq('id',data.report_id).maybeSingle()) as Record<string,any>|null;
  if(!report)throw new HttpError(404,'Report not found');
  if(report.resolved_at)throw new HttpError(409,'This report is already resolved');
  if(data.action==='remove_content'){
   const table=TABLE[report.target_type as keyof typeof TABLE];
   if(!table)throw new HttpError(422,'Messages and profiles cannot be hidden from here. Dismiss the report and handle the account directly.');
   const rows=checked(await admin.from(table).update({removed_at:new Date().toISOString()}).eq('id',report.target_id).select('id'));
   if(!rows?.length)throw new HttpError(404,'The reported content no longer exists');
  }
  checked(await admin.from('content_reports').update({resolved_at:new Date().toISOString(),resolution:`${data.action}${data.note?': '+data.note:''}`}).eq('id',data.report_id));
  checked(await admin.from('admin_access_log').insert({user_id:owner,action:`resolve_report:${data.action}:${data.report_id}`}));
  return json({resolved:true,action:data.action});
 }
 return null;
}
