export const MX_PROJECT_REF='yzvrujffiktfserrgkcb';
export function isMxProjectUrl(value:string|undefined){if(!value)return false;try{const u=new URL(value);return u.origin===`https://${MX_PROJECT_REF}.supabase.co`&&u.pathname==='/'&&!u.username&&!u.password&&!u.search&&!u.hash;}catch{return false;}}
