import type {IncomingMessage,ServerResponse} from 'node:http';
import {nodeAdapter} from '../server/http.ts';
import {handleRequest} from '../server/app.ts';
/** Entry for API paths with more than one segment (for example /api/parts/catalog), which the single-segment
 *  route file does not receive. The rewrite passes the original path in __p; restore it before routing. */
export default async function handler(req:IncomingMessage,res:ServerResponse){
 const url=new URL(req.url||'/','http://localhost'),original=url.searchParams.get('__p');
 if(original!==null){url.searchParams.delete('__p');const query=url.searchParams.toString();req.url='/api/'+original.replace(/^\/+/,'')+(query?'?'+query:'');}
 await nodeAdapter(req,res,handleRequest);
}
export const config={api:{bodyParser:false}};
