import type {IncomingMessage,ServerResponse} from 'node:http';
import {nodeAdapter} from '../server/http.ts';
import {handleRequest} from '../server/app.ts';
export default async function handler(req:IncomingMessage,res:ServerResponse){await nodeAdapter(req,res,handleRequest);}
export const config={api:{bodyParser:false}};
