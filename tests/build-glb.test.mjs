import test from 'node:test';
import assert from 'node:assert/strict';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createBikeModel,disposeBikeModel} from '../src/bike3d/model.ts';
import {applyVisualBuild} from '../src/bike3d/apply-build.ts';
import {resolveVisualBuild} from '../shared/build-visual.ts';
class NodeFileReader {
 async readAsArrayBuffer(blob){try{this.result=await blob.arrayBuffer();this.onloadend?.();}catch(e){this.onerror?.(e);}}
 async readAsDataURL(blob){try{this.result=`data:${blob.type};base64,${Buffer.from(await blob.arrayBuffer()).toString('base64')}`;this.onloadend?.();}catch(e){this.onerror?.(e);}}
}
globalThis.FileReader=NodeFileReader;
test('fitted GLBs round-trip without replaced stock exhaust geometry',async()=>{
 for(const [name,asset,headerPresent] of [
  ['Factory 4.1 RCT Titanium Anodized Full System w/ Carbon End Cap','generic-full-exhaust',false],
  ['Factory 4.1 RCT Titanium Anodized SL (Slip-On) w/ Carbon Cap','generic-slip-on',true],
 ]){
  const root=createBikeModel();let loaded;
  try{
   applyVisualBuild(root,resolveVisualBuild({installed_parts:[{s:'exhaust',b:'FMF',n:name,color:'blue-anodized'}]}));
   const buffer=await new GLTFExporter().parseAsync(root,{binary:true,onlyVisible:true});
   loaded=(await new GLTFLoader().parseAsync(buffer,'')).scene;
   assert.ok(loaded.getObjectByName(asset));assert.equal(!!loaded.getObjectByName('stock-muffler'),false);
   assert.equal(!!loaded.getObjectByName('stock-header'),headerPresent);
   assert.ok(loaded.getObjectByName('front-wheel'));assert.ok(loaded.getObjectByName('fork-guards'));
  }finally{disposeBikeModel(root);if(loaded)disposeBikeModel(loaded);}
 }
});
