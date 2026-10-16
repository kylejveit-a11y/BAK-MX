/** Headless original-asset export. node --experimental-strip-types scripts/export-bike-blockout.mjs output.glb */
import {writeFile,mkdir} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {Mesh,InstancedMesh} from 'three';
import {createBikeModel,disposeBikeModel} from '../src/bike3d/model.ts';

// GLTFExporter uses the browser FileReader API only to encode Blob buffers.
class NodeFileReader {
 result=null;onloadend=null;onerror=null;
 async readAsArrayBuffer(blob){try{this.result=await blob.arrayBuffer();this.onloadend?.();}catch(e){this.onerror?.(e);}}
 async readAsDataURL(blob){try{this.result=`data:${blob.type};base64,${Buffer.from(await blob.arrayBuffer()).toString('base64')}`;this.onloadend?.();}catch(e){this.onerror?.(e);}}
}
globalThis.FileReader=NodeFileReader;
const output=resolve(process.argv[2]??'artifacts/bike-builder/ktm-450-sxf-2025-blockout.glb');
const model=createBikeModel();
try{
 const bytes=await new GLTFExporter().parseAsync(model,{binary:true});
 await mkdir(dirname(output),{recursive:true});await writeFile(output,Buffer.from(bytes));
 let meshes=0,triangles=0;model.traverse(o=>{if(o instanceof Mesh){meshes++;triangles+=(o.geometry.index?.count??o.geometry.getAttribute('position').count)/3*(o instanceof InstancedMesh?o.count:1);}});
 console.log(JSON.stringify({output,bytes:bytes.byteLength,groups:model.children.map(g=>g.name),meshes,triangles,status:model.userData.accuracy},null,2));
}finally{disposeBikeModel(model);}
