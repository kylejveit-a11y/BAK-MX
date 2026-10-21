import type {IncomingMessage,ServerResponse} from 'node:http';
import {nodeAdapter} from '../server/http.ts';
import {handleRequest} from '../server/app.ts';
/** Entry for API paths with more than one segment (for example /api/parts/catalog), which the single-segment route file does
 *  not receive. vercel.json rewrites /api/:a/:rest+ here. The original path is recovered from, in order: the __p query value
 *  (with any trailing "+" a repeat parameter leaves), the a/rest route parameters the host adds to the query, or the
 *  x-now-route-matches header. Before this, unauthenticated multi-segment routes (/api/billing/price, the billing and store
 *  webhooks, test access) fell through to the sign-in check. */
export function originalPath(rawUrl:string,routeMatches?:string|string[]):string|null{
 const url=new URL(rawUrl||'/','http://localhost'),q=url.searchParams;
 let p=q.get('__p');
 if(!p&&q.get('a')&&q.get('rest'))p=q.get('a')+'/'+q.get('rest');
 if(!p&&routeMatches){const m=new URLSearchParams(Array.isArray(routeMatches)?routeMatches[0]:routeMatches);if(m.get('a')&&m.get('rest'))p=m.get('a')+'/'+m.get('rest');}
 if(!p)return null;
 p=decodeURIComponent(p).replace(/^\/+/,'').replace(/\+$/,'').replace(/^api\//,'');
 for(const k of ['__p','a','rest'])q.delete(k);
 const query=q.toString();return '/api/'+p+(query?'?'+query:'');
}
const FILE='index';
export default async function handler(req:IncomingMessage,res:ServerResponse){if(req.headers['x-bak-route-probe']==='1'){const h:Record<string,unknown>={};for(const k of ['x-now-route-matches','x-matched-path','x-vercel-original-path','x-forwarded-uri','x-invoke-path','x-invoke-query'])h[k]=req.headers[k];res.setHeader('Content-Type','application/json');res.end(JSON.stringify({file:FILE,url:req.url,h}));return;}
 const p=originalPath(req.url||'/',req.headers['x-now-route-matches']);if(p)req.url=p;
 await nodeAdapter(req,res,handleRequest);
}
export const config={api:{bodyParser:false}};
