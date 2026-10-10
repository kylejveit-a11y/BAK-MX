import {defineConfig,loadEnv} from 'vite';
// The browser needs the Supabase URL and publishable key. They are read from the VITE_ names when present and
// otherwise from the plain names the server already uses, so a host only has to hold one copy.
// Only these two public values are exposed; no other variable is passed to the client.
export default defineConfig(({mode})=>{
 const env={...loadEnv(mode,process.cwd(),''),...process.env};
 const pick=(a:string,b:string)=>JSON.stringify(env[a]||env[b]||'');
 return {server:{host:'0.0.0.0',proxy:{'/api':'http://127.0.0.1:3001'}},build:{outDir:'dist'},
  define:{'import.meta.env.VITE_SUPABASE_URL':pick('VITE_SUPABASE_URL','SUPABASE_URL'),'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY':pick('VITE_SUPABASE_PUBLISHABLE_KEY','SUPABASE_PUBLISHABLE_KEY')}};
});
