#!/usr/bin/env python3
"""Composes App Store screenshots from raw simulator captures. Deterministic: the same inputs give the same pixels.

  python3 scripts/store-shots/compose.py --manifest scripts/store-shots/manifest.json --raw <raw dir> --out <final dir> --size 1320x2868

The manifest lists the eight shots in order: [{"file":"01-chat.png","raw":"chat-answer.png","caption":"Tell it what the bike's
doing. Get one change to try."}, ...]. Each raw capture is a full-screen PNG straight from `xcrun simctl io screenshot`; it is
only ever scaled down. Layout: dark graphite gradient with a faint brushed grain, a two-line heavy italic caption, the app's
metal dash under it, and the capture in a plain rounded dark frame with a soft shadow. No prices, no bike art.
Needs Pillow and numpy. Fonts: Inter Display Black Italic when installed, else Inter Black Italic, else DejaVu Sans Bold Oblique.
"""
import argparse, json, os, random, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ACCENT=(0xF0,0x8C,0x42); DEEP=(0xB8,0x5A,0x1C); HILITE=(0xF6,0xBF,0x97)   # KTM orange from shared/brand-theme.ts, highlight = accent toward white
FONTS=['/usr/share/fonts/opentype/inter/InterDisplay-BlackItalic.otf','/usr/share/fonts/opentype/inter/Inter-BlackItalic.otf',
 '/usr/share/fonts/truetype/dejavu/DejaVuSans-BoldOblique.ttf','/Library/Fonts/Inter-BlackItalic.otf','/System/Library/Fonts/Supplemental/Arial Bold Italic.ttf']

def font(size):
 for p in FONTS:
  if os.path.exists(p):return ImageFont.truetype(p,size)
 return ImageFont.load_default()

def background(W,H,seed=7):
 """Graphite vertical gradient, a faint horizontal brushed grain and a very soft warm glow where the phone sits."""
 y=np.linspace(0,1,H)[:,None]
 top=np.array([0x12,0x14,0x19],float);mid=np.array([0x0c,0x0d,0x11],float);bot=np.array([0x05,0x05,0x07],float)
 g=np.where(y<0.45,top+(mid-top)*(y/0.45),mid+(bot-mid)*((y-0.45)/0.55))
 img=np.repeat(g[:,None,:],W,axis=1)
 rng=np.random.default_rng(seed)
 grain=rng.normal(0,1,(H,1))*1.6+rng.normal(0,1,(H,W))*0.8   # brushed: mostly per-row, a little per-pixel
 img+=grain[:,:,None]
 # soft warm glow behind the top of the phone, low enough to read as metal catching light, not neon
 xx=np.linspace(-1,1,W)[None,:];yy=((np.arange(H)-H*0.42)/(H*0.5))[:,None]
 glow=np.exp(-(xx**2*1.6+yy**2*2.2))*0.10
 img+=glow[:,:,None]*np.array(ACCENT,float)
 return Image.fromarray(np.clip(img,0,255).astype(np.uint8),'RGB')

def wrap(draw,text,f,maxw):
 words=text.split();lines=[];cur=''
 for w in words:
  t=(cur+' '+w).strip()
  if draw.textlength(t,font=f)<=maxw:cur=t
  else:lines.append(cur);cur=w
 if cur:lines.append(cur)
 return lines

def caption(img,text,W,top,maxw,size):
 """Two lines at most; the size steps down until it fits. Returns the y below the dash."""
 d=ImageDraw.Draw(img)
 while True:
  f=font(size);lines=wrap(d,text,f,maxw)
  if len(lines)<=2 and all(d.textlength(l,font=f)<=maxw for l in lines):break
  size-=4
 x=(W-maxw)//2;y=top;lh=int(size*1.08)
 for l in lines:
  d.text((x,y),l,font=f,fill=(255,255,255));y+=lh
 y+=int(size*0.28)
 dash(img,x+int(size*0.08),y,int(size*1.4),max(8,size//9));dash(img,x+int(size*0.08)+int(size*1.4)+int(size*0.16),y,int(size*0.42),max(8,size//9),dim=True)
 return y+max(8,size//9)

def dash(img,x,y,w,h,dim=False):
 """The app's MetalMark: a skewed bar, highlight on top, accent through the middle, deep at the base, a soft sheen."""
 bar=Image.new('RGBA',(w+h,h),(0,0,0,0))
 px=bar.load()
 for j in range(h):
  t=j/max(1,h-1);c=[HILITE[i]+(ACCENT[i]-HILITE[i])*min(1,t*2) if t<0.5 else ACCENT[i]+(DEEP[i]-ACCENT[i])*(t-0.5)*2 for i in range(3)]
  for i in range(w+h):
   sx=i-(h-j)*0.45   # skewX(-24deg)
   if 0<=sx<w:
    sheen=0.35*max(0,1-abs(sx/w-0.42)/0.2)
    px[i,j]=(int(min(255,c[0]+(255-c[0])*sheen)),int(min(255,c[1]+(255-c[1])*sheen)),int(min(255,c[2]+(255-c[2])*sheen)),int(255*(0.45 if dim else 1)))
 img.paste(bar,(x,y),bar)

def frame(img,shot,W,top,bottom_margin,screen_radius):
 """Scale the capture down to fit under the caption, round its corners, sit it in a dark bezel with a soft shadow."""
 H=img.height;avail_h=H-top-bottom_margin;bezel=max(14,int(W*0.014))
 sw,sh=shot.size;scale=min((avail_h-2*bezel)/sh,(W-2*int(W*0.09)-2*bezel)/sw)
 if scale>1:scale=1   # never upscale a smaller capture
 tw,th=int(sw*scale),int(sh*scale);shot=shot.convert('RGB').resize((tw,th),Image.LANCZOS)
 r=int(screen_radius*scale)
 mask=Image.new('L',(tw,th),0);ImageDraw.Draw(mask).rounded_rectangle((0,0,tw-1,th-1),radius=r,fill=255)
 fx=(W-tw)//2-bezel;fy=top+(avail_h-th-2*bezel)//2
 # shadow
 sh_img=Image.new('RGBA',(W,H),(0,0,0,0));ImageDraw.Draw(sh_img).rounded_rectangle((fx-6,fy+28,fx+tw+2*bezel+6,fy+th+2*bezel+34),radius=r+bezel,fill=(0,0,0,170))
 sh_img=sh_img.filter(ImageFilter.GaussianBlur(int(W*0.03)));img.paste(sh_img,(0,0),sh_img)
 d=ImageDraw.Draw(img)
 d.rounded_rectangle((fx,fy,fx+tw+2*bezel,fy+th+2*bezel),radius=r+bezel,fill=(0x17,0x19,0x1e),outline=(0x33,0x37,0x3f),width=2)
 d.rounded_rectangle((fx+1,fy+1,fx+tw+2*bezel-1,fy+1+bezel//2),radius=r+bezel,fill=None,outline=(0x4a,0x4e,0x57),width=1)   # a thin light edge on top
 img.paste(shot,(fx+bezel,fy+bezel),mask)

def compose(raw_path,text,W,H,screen_radius):
 img=background(W,H);shot=Image.open(raw_path)
 if shot.width>W or shot.height>H:pass   # scaled down inside frame(); a capture larger than the canvas is fine
 top=int(H*0.052);size=int(W*0.088)
 y=caption(img,text,W,top,W-2*int(W*0.085),size)
 frame(img,shot,W,y+int(H*0.026),int(H*0.03),screen_radius)
 return img

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--manifest',required=True);ap.add_argument('--raw',required=True);ap.add_argument('--out',required=True)
 ap.add_argument('--size',required=True,help='WxH, e.g. 1320x2868');ap.add_argument('--screen-radius',type=int,default=150,help='corner radius of the captured screen, px at capture scale')
 ap.add_argument('--contact',help='also write a one-row contact sheet (jpg) of all shots here')
 a=ap.parse_args();W,H=map(int,a.size.lower().split('x'))
 shots=json.load(open(a.manifest));os.makedirs(a.out,exist_ok=True);outs=[]
 for s in shots:
  raw=os.path.join(a.raw,s['raw'])
  if not os.path.exists(raw):print('missing raw capture',raw,file=sys.stderr);sys.exit(1)
  img=compose(raw,s['caption'],W,H,a.screen_radius);p=os.path.join(a.out,s['file']);img.save(p,'PNG',optimize=True);outs.append(img);print('wrote',p,img.size)
 if a.contact:
  tw=360;th=int(tw*H/W);sheet=Image.new('RGB',(tw*len(outs)+20*(len(outs)+1),th+40),(30,30,34))
  for i,o in enumerate(outs):sheet.paste(o.resize((tw,th),Image.LANCZOS),(20+i*(tw+20),20))
  sheet.save(a.contact,'JPEG',quality=88);print('wrote',a.contact)

if __name__=='__main__':main()
