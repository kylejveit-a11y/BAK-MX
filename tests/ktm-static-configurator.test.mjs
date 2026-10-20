import test from 'node:test';
import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import {clampZoom,cycleView,resolvePartAnchor} from '../src/bike3d/static-configurator.ts';

const manifestUrl=new URL('../public/bike-builder/ktm-static-configurator/manifest.json',import.meta.url);

async function loadManifest(){
 return JSON.parse(await readFile(manifestUrl,'utf8'));
}

test('fixed KTM configurator exposes the five requested photographic views',async()=>{
 const manifest=await loadManifest();
 assert.deepEqual(manifest.views.map(view=>view.id),[
  'three-quarter-left','left','top','right','three-quarter-right'
 ]);
 for(const view of manifest.views){
  assert.match(view.label,/\S/);
  await access(new URL(`../public${view.src}`,import.meta.url));
 }
});

test('fifteen component zones can be selected without implying verified geometry',async()=>{
 const manifest=await loadManifest();
 assert.equal(manifest.identity,'KTM|450 SX-F|2025|standard|US');
 assert.equal(manifest.accuracy,'BLOCKOUT_NOT_OEM_VERIFIED');
 assert.equal(manifest.parts.length,15);
 for(const part of manifest.parts){
  assert.match(part.label,/\S/);
  assert.ok(Object.keys(part.anchors).length>=1,`${part.id} has no visible view`);
  for(const [viewId,anchor] of Object.entries(part.anchors)){
   assert.ok(manifest.views.some(view=>view.id===viewId),`${part.id} uses unknown view ${viewId}`);
   assert.ok(anchor.x>=0&&anchor.x<=1,`${part.id} x is outside the image`);
   assert.ok(anchor.y>=0&&anchor.y<=1,`${part.id} y is outside the image`);
  }
 }
});

test('arrow navigation wraps through the five-view turntable',()=>{
 const ids=['three-quarter-left','left','top','right','three-quarter-right'];
 assert.equal(cycleView(ids,'three-quarter-left',-1),'three-quarter-right');
 assert.equal(cycleView(ids,'three-quarter-right',1),'three-quarter-left');
 assert.equal(cycleView(ids,'left',1),'top');
});

test('part focus uses the active view anchor and remains absent when hidden',()=>{
 const part={anchors:{left:{x:.4,y:.5},right:{x:.6,y:.5}}};
 assert.deepEqual(resolvePartAnchor(part,'right'),{x:.6,y:.5});
 assert.equal(resolvePartAnchor(part,'top'),null);
});

test('image zoom stays inside the readable inspection range',()=>{
 assert.equal(clampZoom(.4),1);
 assert.equal(clampZoom(1.75),1.75);
 assert.equal(clampZoom(5),2.4);
});

test('mobile handoff embeds the same five offline views and fifteen selectors',async()=>{
 const payload=JSON.parse(await readFile(new URL('../apps/mobile/src/generated/bike-preview.json',import.meta.url),'utf8'));
 assert.equal((payload.html.match(/data:image\/jpeg;base64,/g)??[]).length,5);
 assert.equal((payload.html.match(/data-part=/g)??[]).length,15);
 assert.match(payload.html,/BLOCKOUT_NOT_OEM_VERIFIED/);
 assert.doesNotMatch(payload.html,/Restart 3D|Drag to orbit/);
});
