import type {IncomingMessage,ServerResponse} from 'node:http';
export async function nodeAdapter(req:IncomingMessage,res:ServerResponse,handle:(request:Request)=>Promise<Response>){
  try {
    const chunks:Buffer[]=[];let size=0;
    for await (const chunk of req){size+=chunk.length;if(size>1_048_576){res.writeHead(413,{'Content-Type':'application/json'});res.end('{"error":"Request too large"}');return;}chunks.push(Buffer.from(chunk));}
    const headers=new Headers();for(const [key,value] of Object.entries(req.headers)){if(value!==undefined)headers.set(key,Array.isArray(value)?value.join(','):value);}
    // Routing uses only the path. Never derive checkout redirects from this host header.
    const request=new Request(new URL(req.url||'/', 'http://localhost'),{method:req.method,headers,body:['GET','HEAD'].includes(req.method||'GET')?undefined:Buffer.concat(chunks)});
    const response=await handle(request);res.writeHead(response.status,Object.fromEntries(response.headers));
    if(response.body&&(response.headers.get('Content-Type')||'').startsWith('application/x-ndjson')){
      // A live reply: forward each line the moment it is produced instead of waiting for the whole body.
      (res as ServerResponse&{flushHeaders?:()=>void}).flushHeaders?.();
      const reader=response.body.getReader();
      try{for(;;){const {done,value}=await reader.read();if(done)break;res.write(Buffer.from(value));}}catch{/* the handler reports its own failures in-band */}
      res.end();return;
    }
    res.end(Buffer.from(await response.arrayBuffer()));
  }catch{res.writeHead(500,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end('{"error":"Request could not be completed"}');}
}
