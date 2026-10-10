import {createServer} from 'node:http';
import {handleRequest} from '../server/app.ts';
import {nodeAdapter} from '../server/http.ts';
const port=Number(process.env.API_PORT||3001);
createServer((req,res)=>void nodeAdapter(req,res,handleRequest)).listen(port,'127.0.0.1',()=>console.log(`BAK MX API http://127.0.0.1:${port}`));
