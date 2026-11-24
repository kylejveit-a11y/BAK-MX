#!/usr/bin/env python3
"""store.py : App Store screenshots 1206x2622 from ../raw/<name>.png, in the same look as the feature videos."""
import os,sys
from PIL import Image,ImageDraw,ImageFilter
import feature_video as mk
W,H=1206,2622;SW=980;SH=round(SW*2622/1206);SX=(W-SW)//2;SY=H-SH-70;R=134
SHOTS=[('01-chat','chat','Tell it what the bike’s doing.','Get one change to try.'),
 ('02-voice','voice','Talk to BAK.','Ask it out loud.'),
 ('03-garage','garage','Your exact bike.','Every part and setting.'),
 ('04-parts','parts','Find the part.','Real part numbers.'),
 ('05-specs','specs','Published specs','in rider words.'),
 ('06-service','service','Know what’s due','before it costs you a moto.'),
 ('07-raceday','raceday','Race day,','planned around your motos.'),
 ('08-ride','ride','Tracks and trails,','nearest first.'),
 ('09-events','events','Ride days, races','and riders near you.')]
def bg():
    im=Image.new('RGB',(W,H),(6,6,9))
    g=Image.new('L',(W,H),0);ImageDraw.Draw(g).ellipse((W*0.0,H*0.25,W*1.0,H*0.95),fill=70);g=g.filter(ImageFilter.GaussianBlur(260))
    im=Image.composite(Image.new('RGB',(W,H),mk.DEEP),im,g.point(lambda v:int(v*0.55)))
    top=Image.new('L',(W,H),0);d=ImageDraw.Draw(top)
    for y in range(H):d.line((0,y,W,y),fill=int(26*max(0,1-y/(H*0.45))))
    return Image.composite(Image.new('RGB',(W,H),(40,44,52)),im,top)
os.makedirs('store',exist_ok=True)
for out,raw,l1,l2 in SHOTS:
    p=f'../raw/{raw}.png'
    if not os.path.exists(p):print('missing',p);continue
    im=bg();d=ImageDraw.Draw(im);f=mk.font(92,640)
    size=92
    while max(mk.tw(d,l1,f),mk.tw(d,l2,f))>W-168 and size>70:size-=2;f=mk.font(size,640)
    mk.text(d,(84,150),l1,f,(246,247,249));mk.text(d,(84,150+108),l2,f,(173,181,193))
    y=150+108*2+18
    for i in range(80):d.line((84+i,y,84+i,y+6),fill=tuple(int(mk.ACC[k]+(mk.DEEP[k]-mk.ACC[k])*i/80) for k in range(3)))
    sh=Image.new('L',(W,H),0);ImageDraw.Draw(sh).rounded_rectangle((SX-8,SY+24,SX+SW+8,SY+SH+50),radius=R+8,fill=210);sh=sh.filter(ImageFilter.GaussianBlur(46))
    im=Image.composite(Image.new('RGB',(W,H),(0,0,0)),im,sh);d=ImageDraw.Draw(im)
    d.rounded_rectangle((SX-9,SY-9,SX+SW+9,SY+SH+9),radius=R+9,fill=(22,24,29),outline=(58,63,74),width=2)
    cap=Image.open(p).convert('RGB').resize((SW,SH),Image.LANCZOS)
    m=Image.new('L',(SW*2,SH*2),0);ImageDraw.Draw(m).rounded_rectangle((0,0,SW*2-1,SH*2-1),radius=R*2,fill=255);m=m.resize((SW,SH),Image.LANCZOS)
    im.paste(cap,(SX,SY),m);im.save(f'store/{out}.png');print('ok',out,im.size)
