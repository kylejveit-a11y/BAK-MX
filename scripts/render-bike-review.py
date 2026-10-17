"""CPU orthographic contact sheet of actual mesh; no textures or fabricated product photography.
node --experimental-strip-types scripts/render-bike-review.mjs | python scripts/render-bike-review.py output.png
"""
import json, sys
import numpy as np
from PIL import Image, ImageDraw
faces=json.load(sys.stdin)
vertices=np.array([f['v'] for f in faces])
colors=np.array([[int(f['c'][i:i+2],16) for i in (1,3,5)] for f in faces])
canvas=Image.new('RGB',(1600,1200),'#172027')
for cell,(label,direction) in enumerate([('RIGHT',(0,0,1)),('FRONT',(1,0,0)),('TOP',(0,1,0)),('THREE-QUARTER',(1,.65,1))]):
 direction=np.array(direction,dtype=float);direction/=np.linalg.norm(direction)
 up=np.array((1,0,0) if label=='TOP' else (0,1,0),dtype=float)
 right=np.cross(up,direction);right/=np.linalg.norm(right);up=np.cross(direction,right)
 projected=np.stack([vertices@right,vertices@up],axis=-1)
 lo=projected.min(axis=(0,1));hi=projected.max(axis=(0,1));scale=min(720/(hi[0]-lo[0]),490/(hi[1]-lo[1]))
 xy=(projected-(lo+hi)/2)*scale;xy[:,:,1]*=-1
 xy+=np.array((400+(cell%2)*800,320+(cell//2)*600))
 normal=np.cross(vertices[:,1]-vertices[:,0],vertices[:,2]-vertices[:,0]);normal/=np.maximum(np.linalg.norm(normal,axis=1)[:,None],1e-12)
 light=np.array((.4,.8,.7));light/=np.linalg.norm(light)
 shade=.52+.48*np.abs(normal@light)
 # Per-pixel depth, so long intersecting triangles are not painted out of order.
 pixels=np.array(canvas);depth=np.full((1200,1600),-np.inf);z=vertices@direction
 for i,triangle in enumerate(xy):
  xmin=max(0,int(np.floor(triangle[:,0].min())));xmax=min(1599,int(np.ceil(triangle[:,0].max())))
  ymin=max(0,int(np.floor(triangle[:,1].min())));ymax=min(1199,int(np.ceil(triangle[:,1].max())))
  if xmax<xmin or ymax<ymin:continue
  a,b,c=triangle;den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1])
  if abs(den)<1e-9:continue
  yy,xx=np.mgrid[ymin:ymax+1,xmin:xmax+1];xx=xx+.5;yy=yy+.5
  w0=((b[1]-c[1])*(xx-c[0])+(c[0]-b[0])*(yy-c[1]))/den
  w1=((c[1]-a[1])*(xx-c[0])+(a[0]-c[0])*(yy-c[1]))/den;w2=1-w0-w1
  zz=w0*z[i,0]+w1*z[i,1]+w2*z[i,2];region=depth[ymin:ymax+1,xmin:xmax+1]
  mask=(w0>=0)&(w1>=0)&(w2>=0)&(zz>region)
  region[mask]=zz[mask];pixels[ymin:ymax+1,xmin:xmax+1][mask]=(colors[i]*shade[i]).astype(np.uint8)
 canvas=Image.fromarray(pixels);draw=ImageDraw.Draw(canvas)
 draw.text((30+(cell%2)*800,28+(cell//2)*600),label+' | KTM 450 SX-F 2025 exterior study',fill='#ffffff')
draw.text((30,1170),'Actual procedural mesh • Estimated contours • Geometry review, not a WebGL lighting/performance test',fill='#b9c3c9')
canvas.save(sys.argv[1])
