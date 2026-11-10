#!/usr/bin/env python3
"""Composes App Store screenshots from raw simulator captures. Deterministic: the same inputs give the same pixels.

  python3 scripts/store-shots/compose.py --manifest scripts/store-shots/manifest.json --raw <raw dir> --out <final dir> --size 1206x2622

The manifest lists the eight shots in order: [{"file":"01-chat.png","raw":"chat.png","caption":"Tell it what the bike's doing.
Get one change to try."}, ...]. Each raw capture is a full-screen PNG straight from `xcrun simctl io screenshot`; it is only
ever scaled down. Layout, in the manner of Apple's own listings: a calm graphite background with a faint brushed grain and a
very soft BAK-blue glow, a left-aligned two-line caption in SF Pro Display Semibold (upright, sentence case, slightly tight
tracking), one thin BAK-blue dash under it, and the capture in a plain rounded dark frame with a soft shadow. No prices, no
bike art. Every measure scales from the canvas width, so the 6.3", 6.5" and 6.9" canvases share one layout.
Needs Pillow and numpy. Font: the system San Francisco on macOS (SF Pro Display Semibold, from SFNS.ttf's variable axes or
/Library/Fonts/SF-Pro-Display-Semibold.otf), else Helvetica Neue Medium; never an italic or display face.
"""
import argparse, json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

# BAK blue from shared/brand-theme.ts (BAK_THEME): accent #6AA4FF, deep #2F74E8. The glow uses deep; the dash runs accent→deep.
ACCENT=(0x6A,0xA4,0xFF); DEEP=(0x2F,0x74,0xE8)
TRACKING=-0.015   # em, slightly tight, as in Apple's store captions

def font(size):
 """SF Pro Display Semibold, upright. Returns (font, name) so the run can report what was used."""
 p='/Library/Fonts/SF-Pro-Display-Semibold.otf'
 if os.path.exists(p):return ImageFont.truetype(p,size),os.path.basename(p)
 p='/System/Library/Fonts/SFNS.ttf'
 if os.path.exists(p):
  f=ImageFont.truetype(p,size)
  try:
   axes=[a['name'] for a in f.get_variation_axes()]   # Width, Optical Size, GRAD, Weight
   want={b'Width':100,b'Optical Size':96,b'GRAD':400,b'Weight':600}
   f.set_variation_by_axes([want.get(n,a['default']) for n,a in zip(axes,f.get_variation_axes())])
   return f,'SFNS.ttf (SF Pro Display Semibold: wght 600, opsz 96)'
  except Exception:
   return f,'SFNS.ttf (default instance)'
 for p,idx in [('/System/Library/Fonts/HelveticaNeue.ttc',None),('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',None)]:
  if os.path.exists(p):
   f=ImageFont.truetype(p,size)
   if 'HelveticaNeue' in p:
    for i in range(20):
     try:
      g=ImageFont.truetype(p,size,index=i)
      if g.getname()[1]=='Medium':return g,'HelveticaNeue.ttc Medium (SF not installed)'
     except Exception:break
   return f,os.path.basename(p)+' (SF not installed)'
 return ImageFont.load_default(),'PIL default'

def background(W,H,seed=7):
 """Graphite vertical gradient, a faint brushed grain and a very soft BAK-blue glow where the phone sits."""
 y=np.linspace(0,1,H)[:,None]
 top=np.array([0x11,0x13,0x18],float);mid=np.array([0x0b,0x0c,0x10],float);bot=np.array([0x05,0x05,0x07],float)
 g=np.where(y<0.45,top+(mid-top)*(y/0.45),mid+(bot-mid)*((y-0.45)/0.55))
 img=np.repeat(g[:,None,:],W,axis=1)
 rng=np.random.default_rng(seed)
 grain=rng.normal(0,1,(H,1))*1.2+rng.normal(0,1,(H,W))*0.6
 img+=grain[:,:,None]
 xx=np.linspace(-1,1,W)[None,:];yy=((np.arange(H)-H*0.46)/(H*0.5))[:,None]
 glow=np.exp(-(xx**2*1.5+yy**2*2.0))*0.075
 img+=glow[:,:,None]*np.array(DEEP,float)
 return Image.fromarray(np.clip(img,0,255).astype(np.uint8),'RGB')

def width(d,text,f,size):
 """Advance of a run with tracking applied between characters (pair kerning kept)."""
 if not text:return 0
 t=size*TRACKING
 return sum(d.textlength(text[i:i+2],font=f)-d.textlength(text[i+1],font=f) for i in range(len(text)-1))+d.textlength(text[-1],font=f)+t*(len(text)-1)

def draw_tracked(d,x,y,text,f,size,fill):
 t=size*TRACKING
 for i,ch in enumerate(text):
  d.text((x,y),ch,font=f,fill=fill)
  if i<len(text)-1:x+=d.textlength(text[i:i+2],font=f)-d.textlength(text[i+1],font=f)+t

def wrap(d,text,f,size,maxw):
 words=text.split();lines=[];cur=''
 for w in words:
  t=(cur+' '+w).strip()
  if width(d,t,f,size)<=maxw:cur=t
  else:lines.append(cur);cur=w
 if cur:lines.append(cur)
 return lines

def caption(img,text,x,top,maxw,size):
 """Two lines at most, left-aligned; the size steps down until it fits. Returns the y below the dash and the font name."""
 d=ImageDraw.Draw(img)
 while True:
  f,name=font(size);lines=wrap(d,text,f,size,maxw)
  if len(lines)<=2 and all(width(d,l,f,size)<=maxw for l in lines):break
  size-=3
 y=top;lh=int(size*1.12)
 for l in lines:
  draw_tracked(d,x,y,l,f,size,(255,255,255));y+=lh
 y+=int(size*0.34)
 h=max(5,round(size*0.075));dash(img,x+int(size*0.04),y,int(size*0.95),h)
 return y+h,name

def dash(img,x,y,w,h):
 """One thin BAK-blue mark, the app's skewed bar: accent at the top to deep at the base, no sheen."""
 bar=Image.new('RGBA',(w+h,h),(0,0,0,0));px=bar.load()
 for j in range(h):
  t=j/max(1,h-1);c=[int(ACCENT[i]+(DEEP[i]-ACCENT[i])*t) for i in range(3)]
  for i in range(w+h):
   sx=i-(h-j)*0.45
   if 0<=sx<w:px[i,j]=(c[0],c[1],c[2],255)
 img.paste(bar,(x,y),bar)

def frame(img,shot,W,top,bottom_margin,screen_radius):
 """Scale the capture down to fit under the caption, round its corners, sit it in a dark bezel with a soft shadow."""
 H=img.height;avail_h=H-top-bottom_margin;bezel=max(12,int(W*0.013))
 sw,sh=shot.size;scale=min((avail_h-2*bezel)/sh,(W-2*int(W*0.085)-2*bezel)/sw)
 if scale>1:scale=1   # never upscale a smaller capture
 tw,th=int(sw*scale),int(sh*scale);shot=shot.convert('RGB').resize((tw,th),Image.LANCZOS)
 r=int(screen_radius*scale)
 mask=Image.new('L',(tw,th),0);ImageDraw.Draw(mask).rounded_rectangle((0,0,tw-1,th-1),radius=r,fill=255)
 fx=(W-tw)//2-bezel;fy=top
 sh_img=Image.new('RGBA',(W,H),(0,0,0,0));ImageDraw.Draw(sh_img).rounded_rectangle((fx-6,fy+26,fx+tw+2*bezel+6,fy+th+2*bezel+32),radius=r+bezel,fill=(0,0,0,160))
 sh_img=sh_img.filter(ImageFilter.GaussianBlur(int(W*0.03)));img.paste(sh_img,(0,0),sh_img)
 d=ImageDraw.Draw(img)
 d.rounded_rectangle((fx,fy,fx+tw+2*bezel,fy+th+2*bezel),radius=r+bezel,fill=(0x16,0x18,0x1d),outline=(0x30,0x34,0x3c),width=2)
 d.rounded_rectangle((fx+1,fy+1,fx+tw+2*bezel-1,fy+1+bezel//2),radius=r+bezel,fill=None,outline=(0x45,0x49,0x52),width=1)
 img.paste(shot,(fx+bezel,fy+bezel),mask)
 return scale

def compose(raw_path,text,W,H,screen_radius):
 img=background(W,H);shot=Image.open(raw_path)
 x=int(W*0.085);top=int(H*0.066);size=round(W*0.0667)   # 88 px on the 6.9" canvas, 80 px on 6.3"
 y,name=caption(img,text,x,top,W-2*x,size)
 scale=frame(img,shot,W,y+int(H*0.042),int(H*0.028),screen_radius)
 return img,name,scale

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--manifest',required=True);ap.add_argument('--raw',required=True);ap.add_argument('--out',required=True)
 ap.add_argument('--size',required=True,help='WxH, e.g. 1206x2622');ap.add_argument('--screen-radius',type=int,default=165,help='corner radius of the captured screen, px at capture scale')
 ap.add_argument('--contact',help='also write a one-row contact sheet (jpg) of all shots here')
 a=ap.parse_args();W,H=map(int,a.size.lower().split('x'))
 shots=json.load(open(a.manifest));os.makedirs(a.out,exist_ok=True);outs=[]
 for s in shots:
  raw=os.path.join(a.raw,s['raw'])
  if not os.path.exists(raw):print('missing raw capture',raw,file=sys.stderr);sys.exit(1)
  img,name,scale=compose(raw,s['caption'],W,H,a.screen_radius);p=os.path.join(a.out,s['file']);img.save(p,'PNG',optimize=True);outs.append(img)
  print('wrote',p,img.size,'font:',name,'capture scale: %.3f'%scale)
 if a.contact:
  tw=360;th=int(tw*H/W);sheet=Image.new('RGB',(tw*len(outs)+20*(len(outs)+1),th+40),(30,30,34))
  for i,o in enumerate(outs):sheet.paste(o.resize((tw,th),Image.LANCZOS),(20+i*(tw+20),20))
  sheet.save(a.contact,'JPEG',quality=88);print('wrote',a.contact)

if __name__=='__main__':main()
