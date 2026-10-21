import type {IncomingMessage,ServerResponse} from 'node:http';
import {nodeAdapter} from '../server/http.ts';
import {handleRequest} from '../server/app.ts';
const FILE='catchall';
export default async function handler(req:IncomingMessage,res:ServerResponse){if(req.headers['x-bak-route-probe']==='1'){const h:Record<string,unknown>={};for(const k of ['x-now-route-matches','x-matched-path','x-vercel-original-path','x-forwarded-uri','x-invoke-path','x-invoke-query'])h[k]=req.headers[k];res.setHeader('Content-Type','application/json');res.end(JSON.stringify({file:FILE,url:req.url,h}));return;}await nodeAdapter(req,res,handleRequest);}
export const config={api:{bodyParser:false}};
