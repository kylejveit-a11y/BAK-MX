/** Build a self-contained offline viewer. No model, script, font or texture CDN requests. */
import {build} from 'vite';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
const result=await build({configFile:false,logLevel:'warn',build:{write:false,minify:true,lib:{entry:'src/bike3d/native-entry.ts',name:'BAKBikePreview',formats:['iife']}}});
const output=(Array.isArray(result)?result[0]:result).output;
const js=output.find(item=>item.type==='chunk').code;
const notices=(await Promise.all(['three','zod'].map(name=>readFile(`node_modules/${name}/LICENSE`,'utf8')))).join('\n\n');
const html=`<!doctype html><!-- ${notices.replace(/-->/g,'-- >')} --><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'"><style>html,body{margin:0;height:100%;background:#12191e;color:#fff;font:14px system-ui}body{display:flex;flex-direction:column}#bike{flex:1;min-height:180px;overflow:hidden}nav{display:flex;gap:6px;padding:10px;flex-wrap:wrap}button{background:#26343b;color:white;border:1px solid #53606a;padding:12px;border-radius:8px}p{margin:4px 12px 12px;color:#c2c9ce}#status{color:#ffb880}</style></head><body><div id="bike" aria-label="Interactive bike exterior"></div><nav aria-label="Camera views">${['perspective','right','left','front','rear','top'].map(view=>`<button data-view="${view}">${view==='perspective'?'Reset':view}</button>`).join('')}<button id="retry">Restart 3D</button></nav><p>Drag to orbit · Pinch to zoom · OEM prototype, shapes under review</p><p id="status" role="alert"></p><script>${js.replace(/<\/script/gi,'<\\/script')}</script></body></html>`;
const generated=JSON.stringify({html});
if(process.argv.includes('--check')){if(await readFile('apps/mobile/src/generated/bike-preview.json','utf8')!==generated)throw new Error('Native bike preview is stale. Run npm run build:bike-native');console.log('Native preview matches current sources');process.exit(0);}
await mkdir('apps/mobile/src/generated',{recursive:true});
await writeFile('apps/mobile/src/generated/bike-preview.json',generated);
await mkdir('artifacts/bike-builder',{recursive:true});
await writeFile('artifacts/bike-builder/offline-preview.html',html);
console.log(`Offline bike viewer: ${Buffer.byteLength(html)} bytes`);
