#!/usr/bin/env python3
"""mk.py <name> <recording.mov> <start_s> <dur_s> "<headline>" "<subline>"  -> out/<name>.mp4 (1080x1920, 30 fps)
Scene 1: the screen recording in a rounded frame under a caption. Scene 2: end card with the BAK MX wordmark."""
import sys,os,subprocess
from PIL import Image,ImageDraw,ImageFilter,ImageFont
W,H=1080,1920;ACC=(0x6A,0xA4,0xFF);DEEP=(0x2F,0x74,0xE8)
FW=730;FH=round(FW*2622/1206);FX=(W-FW)//2;FY=296;R=100
def font(size,wght=600):
    f=ImageFont.truetype('/System/Library/Fonts/SFNS.ttf',size)
    axes=f.get_variation_axes();want={b'Width':100,b'Optical Size':min(96,max(17,size)),b'GRAD':400,b'Weight':wght}
    f.set_variation_by_axes([want.get(a['name'],a['default']) for a in axes]);return f
def bg():
    im=Image.new('RGB',(W,H),(6,6,9));px=im.load()
    g=Image.new('L',(W,H),0);d=ImageDraw.Draw(g);d.ellipse((W*0.05,H*0.30,W*0.95,H*0.95),fill=70);g=g.filter(ImageFilter.GaussianBlur(220))
    glow=Image.new('RGB',(W,H),DEEP);im=Image.composite(glow,im,g.point(lambda v:int(v*0.55)))
    top=Image.new('L',(W,H),0);d=ImageDraw.Draw(top)
    for y in range(H):d.line((0,y,W,y),fill=int(26*max(0,1-y/(H*0.5))))
    return Image.composite(Image.new('RGB',(W,H),(40,44,52)),im,top)
def text(d,xy,s,f,fill,track=-0.015):
    x,y=xy
    for ch in s:
        d.text((x,y),ch,font=f,fill=fill);x+=d.textlength(ch,font=f)+f.size*track
def tw(d,s,f,track=-0.015):return sum(d.textlength(ch,font=f)+f.size*track for ch in s)
def wrap(d,s,f,maxw):
    out=[];cur=''
    for w in s.split():
        t=(cur+' '+w).strip()
        if tw(d,t,f)<=maxw:cur=t
        else:out.append(cur);cur=w
    if cur:out.append(cur)
    return out
def scene_bg(head,sub,path):
    im=bg();d=ImageDraw.Draw(im);f=font(66,640);fs=font(34,480)
    y=96
    for line in wrap(d,head,f,W-2*72)[:2]:text(d,(72,y),line,f,(246,247,249));y+=78
    y+=6;
    for i in range(64):d.line((72+i,y,72+i,y+5),fill=tuple(int(ACC[k]+(DEEP[k]-ACC[k])*i/64) for k in range(3)))
    d.rounded_rectangle((72,y,136,y+5),radius=3,outline=None)
    y+=26
    for line in wrap(d,sub,fs,W-2*72)[:1]:text(d,(72,y),line,fs,(173,181,193),-0.005);y+=44
    # frame: shadow, then a dark bezel the recording sits in
    sh=Image.new('L',(W,H),0);ImageDraw.Draw(sh).rounded_rectangle((FX-6,FY+18,FX+FW+6,FY+FH+40),radius=R+8,fill=200);sh=sh.filter(ImageFilter.GaussianBlur(40))
    im=Image.composite(Image.new('RGB',(W,H),(0,0,0)),im,sh);d=ImageDraw.Draw(im)
    d.rounded_rectangle((FX-7,FY-7,FX+FW+7,FY+FH+7),radius=R+7,fill=(22,24,29),outline=(58,63,74),width=2)
    d.rounded_rectangle((FX,FY,FX+FW,FY+FH),radius=R,fill=(6,6,9))
    im.save(path)
def mask(path):
    m=Image.new('L',(FW*2,FH*2),0);ImageDraw.Draw(m).rounded_rectangle((0,0,FW*2-1,FH*2-1),radius=R*2,fill=255);m.resize((FW,FH),Image.LANCZOS).save(path)
def endcard(path):
    im=bg();d=ImageDraw.Draw(im);logo=Image.open(os.path.expanduser('~/w/logo.png')).convert('RGBA')
    lw=760;lh=round(logo.height*lw/logo.width);logo=logo.resize((lw,lh),Image.LANCZOS);im.paste(logo,((W-lw)//2,800),logo)
    f=font(44,560);s='Tell BAK what the bike is doing.';text(d,((W-tw(d,s,f))/2,800+lh+70),s,f,(246,247,249))
    f2=font(34,500);s2='bakmx.com';text(d,((W-tw(d,s2,f2,0))/2,800+lh+150),s2,f2,ACC,0)
    im.save(path)
def run(a):
    r=subprocess.run(a,capture_output=True,text=True)
    if r.returncode:print(r.stderr[-800:]);sys.exit(1)
ENC=['-c:v','libx264','-crf','18','-preset','veryfast','-pix_fmt','yuv420p','-r','30','-an']
if __name__=='__main__':
    name,rec,ss,dur,head,sub=sys.argv[1:7];dur=float(dur);os.makedirs('out',exist_ok=True);os.makedirs('tmp',exist_ok=True)
    scene_bg(head,sub,f'tmp/{name}-bg.png');mask('tmp/mask.png')
    if not os.path.exists('tmp/end.mp4'):
        endcard('tmp/end.png')
        run(['ffmpeg','-y','-loglevel','error','-framerate','30','-i','tmp/end.png','-vf','format=yuv420p,loop=-1:1,trim=duration=2.2,fade=in:0:9,fade=out:st=1.9:d=0.3',*ENC,'tmp/end.tmp.mp4']);os.rename('tmp/end.tmp.mp4','tmp/end.mp4')
    if len(sys.argv)>7 and sys.argv[7]=='still':  # frame check only
        run(['ffmpeg','-y','-loglevel','error','-i',f'tmp/{name}-bg.png','-ss',str(float(ss)+dur/2),'-i',rec,'-i','tmp/mask.png','-filter_complex',f'[1:v]scale={FW}:{FH}[v];[v][2:v]alphamerge[vm];[0:v][vm]overlay={FX}:{FY}','-frames:v','1',f'tmp/{name}-check.png']);print('still');sys.exit(0)
    # The simulator records at a variable rate; cut the window to a constant 30 fps clip first so time is exact.
    run(['ffmpeg','-y','-loglevel','error','-i',rec,'-ss',str(ss),'-t',str(dur),'-vf',f'fps=30,scale={FW}:{FH//2*2}','-c:v','libx264','-crf','14','-preset','veryfast','-pix_fmt','yuv420p','-an',f'tmp/{name}-clip.mp4'])
    rec=f'tmp/{name}-clip.mp4';ss=0
    run(['ffmpeg','-y','-loglevel','error','-loop','1','-framerate','30','-t',str(dur),'-i',f'tmp/{name}-bg.png','-i',rec,'-loop','1','-t',str(dur),'-i','tmp/mask.png','-filter_complex',
         f'[1:v]fps=30,scale={FW}:{FH},setpts=PTS-STARTPTS[v];[v][2:v]alphamerge[vm];[0:v][vm]overlay={FX}:{FY}:shortest=1,fade=in:0:8,fade=out:st={dur-0.3}:d=0.3,format=yuv420p','-t',str(dur),*ENC,f'tmp/{name}-s1.tmp.mp4']);os.rename(f'tmp/{name}-s1.tmp.mp4',f'tmp/{name}-s1.mp4')
    open(f'tmp/{name}.txt','w').write(f"file '{name}-s1.mp4'\nfile 'end.mp4'\n")
    run(['ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i',f'tmp/{name}.txt','-c','copy','-movflags','+faststart',f'out/{name}.tmp.mp4']);os.rename(f'out/{name}.tmp.mp4',f'out/{name}.mp4');print('ok',name)
