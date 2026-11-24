#!/usr/bin/env python3
"""play_shots.py <raw_dir> <out_dir> : Google Play graphics from the same raw screens as the App Store set.
Phone screenshots 1080x2160 (Google's 2:1 limit) with the iPhone status bar cropped off, and the 1024x500 feature graphic."""
import os,sys
from PIL import Image,ImageDraw,ImageFilter,ImageFont
RAW,OUT=sys.argv[1],sys.argv[2];ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..')
ACC=(0x6A,0xA4,0xFF);DEEP=(0x2F,0x74,0xE8);F='/usr/share/fonts/opentype/inter/InterDisplay-SemiBold.otf'
W,H=1080,2160;CROP=168;SW=800;SH=round(SW*(2622-CROP)/1206);SX=(W-SW)//2;SY=H-SH-64;R=70
SHOTS=[('01-chat','chat','Tell it what the bike’s doing.','Get one change to try.'),('02-voice','voice','Talk to BAK.','Ask it out loud.'),
 ('03-garage','garage','Your exact bike.','Every part and setting.'),('04-parts','parts','Find the part.','Real part numbers.'),
 ('05-specs','specs','Published specs','in rider words.'),('06-service','service','Know what’s due','before it costs you a moto.'),
 ('07-raceday','raceday','Race day,','planned around your motos.'),('08-ride','ride','Tracks and trails,','nearest first.')]
def bg(w,h):
    im=Image.new('RGB',(w,h),(6,6,9))
    g=Image.new('L',(w,h),0);ImageDraw.Draw(g).ellipse((0,h*0.25,w,h*0.95),fill=70);g=g.filter(ImageFilter.GaussianBlur(max(40,w//5)))
    im=Image.composite(Image.new('RGB',(w,h),DEEP),im,g.point(lambda v:int(v*0.55)))
    top=Image.new('L',(w,h),0);d=ImageDraw.Draw(top)
    for y in range(h):d.line((0,y,w,y),fill=int(26*max(0,1-y/(h*0.45))))
    return Image.composite(Image.new('RGB',(w,h),(40,44,52)),im,top)
os.makedirs(OUT,exist_ok=True)
for out,raw,l1,l2 in SHOTS:
    im=bg(W,H);d=ImageDraw.Draw(im);size=76;f=ImageFont.truetype(F,size)
    while max(d.textlength(l1,font=f),d.textlength(l2,font=f))>W-140 and size>54:size-=2;f=ImageFont.truetype(F,size)
    d.text((70,96),l1,font=f,fill=(246,247,249));d.text((70,96+88),l2,font=f,fill=(173,181,193))
    y=96+88*2+14
    for i in range(72):d.line((70+i,y,70+i,y+5),fill=tuple(int(ACC[k]+(DEEP[k]-ACC[k])*i/72) for k in range(3)))
    sh=Image.new('L',(W,H),0);ImageDraw.Draw(sh).rounded_rectangle((SX-8,SY+22,SX+SW+8,SY+SH+44),radius=R+8,fill=210);sh=sh.filter(ImageFilter.GaussianBlur(40))
    im=Image.composite(Image.new('RGB',(W,H),(0,0,0)),im,sh);d=ImageDraw.Draw(im)
    d.rounded_rectangle((SX-8,SY-8,SX+SW+8,SY+SH+8),radius=R+8,fill=(22,24,29),outline=(58,63,74),width=2)
    cap=Image.open(f'{RAW}/{raw}.png').convert('RGB');cap=cap.crop((0,CROP,cap.width,cap.height)).resize((SW,SH),Image.LANCZOS)
    m=Image.new('L',(SW*2,SH*2),0);ImageDraw.Draw(m).rounded_rectangle((0,0,SW*2-1,SH*2-1),radius=R*2,fill=255);m=m.resize((SW,SH),Image.LANCZOS)
    im.paste(cap,(SX,SY),m);im.save(f'{OUT}/{out}.png');print('ok',out,im.size)
# Feature graphic: wordmark on the dark BAK background, the line in BAK blue. No alpha (Google rejects transparency).
w,h=1024,500;im=bg(w,h)
d=ImageDraw.Draw(im)
logo=Image.open(os.path.join(ROOT,'public/bak-mx-logo.png')).convert('RGBA');lw=560;lh=round(logo.height*lw/logo.width);logo=logo.resize((lw,lh),Image.LANCZOS)
im.paste(logo,((w-lw)//2,150),logo)
f=ImageFont.truetype(F,46);t='Dial it in.';d.text(((w-d.textlength(t,font=f))/2,150+lh+44),t,font=f,fill=ACC)
f=ImageFont.truetype('/usr/share/fonts/opentype/inter/InterDisplay-Medium.otf',25);t='Setup and tuning for your exact dirt bike';d.text(((w-d.textlength(t,font=f))/2,150+lh+110),t,font=f,fill=(173,181,193))
im.save(f'{OUT}/feature-graphic-1024x500.png');print('ok feature',im.size)
Image.open(os.path.join(ROOT,'public/icon-512.png')).convert('RGB').save(f'{OUT}/icon-512.png')
