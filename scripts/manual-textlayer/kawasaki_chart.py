"""Kawasaki Owner's Manual "Periodic Maintenance Chart", read from the page images Kawasaki publishes in its online
manual viewer (900 x 635 px, no text layer).

The chart is a ruled grid: the first column is the operation ("Exhaust system - inspect †"), the next five are the
frequency columns ("After each race (or 2.5 hours)", "Every 3 races (or 7.5 hours)", "Every 6 races (or 15 hours)",
"Every 12 races (or 30 hours)", "As required"), the last is a page reference. A filled dot marks the interval. The chart's
own legend: "†: Replace, add, adjust, clean or torque if necessary", "K: Should be serviced by referring to the Service
Manual or an authorized Kawasaki dealer". Each grid is headed by its section ("1. Periodic Inspection (Engine Related Item)").

Grid lines are found from dark-pixel runs, the dots from the ink in the middle of each cell, and the operation text by
OCR (tesseract) of the first cell at 3x. usage: kawasaki_chart.py page.jpg [page.jpg ...]"""
import re,subprocess,sys
from PIL import Image,ImageOps
def page(path):
    """Page image as greyscale at the viewer's base width of 900 px (some manuals are served at 1247 px)."""
    im=Image.open(path).convert('L')
    return im if im.width==900 else im.resize((900,round(im.height*900/im.width)),Image.LANCZOS)
import numpy as np
def grid(a):
    dark=a<170                                  # rules are grey (about 110-140) in these JPEGs
    def collapse(xs):
        o=[]
        for x in xs:
            if o and x-o[-1]<=3: continue
            o.append(x)
        return o
    h=collapse([y for y in range(a.shape[0]) if dark[y,110:830].mean()>0.75])
    if len(h)<3: return h,[]
    v=collapse([x for x in range(a.shape[1]) if dark[h[0]:h[1],x].mean()>0.8])    # the header band has every column rule
    return h,v
import tempfile,os
def ocr(im,psm=7):
    im=im.resize((im.width*3,im.height*3),Image.LANCZOS)
    with tempfile.NamedTemporaryFile(suffix='.png',delete=False) as f: im.save(f.name); n=f.name
    r=subprocess.run(['tesseract',n,'-','--psm',str(psm)],capture_output=True,text=True); os.remove(n)
    return re.sub(r'\s+',' ',r.stdout).strip()
def parse(path,prev_section=None):
    im=page(path); a=np.array(im)
    h,v=grid(a)
    if len(v)<6 or len(h)<3: return [],[('no grid',path,len(h),len(v))]
    # header: the band between the first two horizontal rules; every frequency column must be named
    header=[ocr(im.crop((v[k]+1,h[0]+1,v[k+1]-1,h[1]-1)),6) for k in range(1,len(v)-2)]
    names={'After each':'after each race (or 2.5 hours)','Every 3':'every 3 races (or 7.5 hours)','Every 6':'every 6 races (or 15 hours)','Every 12':'every 12 races (or 30 hours)','As re':'as required'}
    cols=[]
    for hd in header:
        k=[n for n in names if re.search(n,hd)]
        if len(k)!=1: return [],[('header',path,header)]
        cols.append(names[k[0]])
    if not re.search('See',ocr(im.crop((v[-2]+1,h[0]+1,v[-1]-1,h[1]-1)),6)): return [],[('header',path,header)]
    out=[]; problems=[]
    section=ocr(im.crop((v[0],max(0,h[0]-22),v[-1],h[0]-2)),7)
    section=re.sub(r'^\d+\.\s*','',section).strip()
    if not re.search(r'Periodic|Replacement|Item|Parts',section): section=prev_section   # a grid continued from the previous page
    for t1,t2 in zip(h[1:],h[2:]):
        if t2-t1<14: continue
        op=ocr(im.crop((v[0]+1,t1+1,v[1]+1,t2-1)),6)
        if not op: continue
        if re.match(r'^\d+\.\s',op):                                   # a second grid on the page: its section title sits between the grids
            section=re.sub(r'^\d+\.\s*','',ocr(im.crop((v[0],t1+1,v[-1],t2-1)),7)).strip(); continue
        if re.search(r'FREQUENCY|OPERATION',op): continue              # the second grid's header row
        marks=[]; texty=False
        for k,name in enumerate(cols):
            x1,x2=v[1+k],v[2+k]
            cell=a[t1+3:t2-3,x1+3:x2-3]<128
            cell=cell[cell.mean(axis=1)<0.6]                     # drop a rule drawn inside a split cell
            n=cell.sum()
            if n<25: continue
            ys,xs=np.nonzero(cell)
            if xs.max()-xs.min()<=14 and ys.max()-ys.min()<=14 and n<=120: marks.append(name)   # a dot: one compact blob
            else: texty=True                                                                     # words in the cell
        if texty:
            span=ocr(im.crop((v[1]+2,t1+2,v[-2]-2,t2-2)),7)
            m=re.search(r'Every\s+(\d+)\s+years?',span)
            if m: marks.append(f'every {m.group(1)} years')
            elif re.fullmatch(r'[A-Za-z ,]{3,40}',span): marks.append(span[0].lower()+span[1:])   # "If damaged"
            elif span.strip(): problems.append(('text in frequency columns',span))
        notes=[]
        op=re.sub(r'[\s|]+$','',op)                                   # the cell's right rule reads as "|"
        op=re.sub(r'(\w)- (\w)',r'\1\2',op)                            # a word wrapped inside the cell ("piv- ots")
        if re.search(r'\s[†+tTfF]{1,2}$',op): notes.append('†: replace, add, adjust, clean or torque if necessary'); op=re.sub(r'\s[†+tTfF]{1,2}$','',op)
        if re.match(r'^K\s',op): notes.append('K: serviced by referring to the service manual or an authorized Kawasaki dealer'); op=op[2:]
        op=op.strip()
        if not marks: problems.append(('no mark',op)); continue
        out.append((section,op,'; '.join(marks+notes)))
    return out,problems
if __name__=='__main__':
    sec=None
    for p in sys.argv[1:]:
        o,pr=parse(p,sec); print(p,len(o),pr)
        for r in o: print('  ',r)
        if o: sec=o[-1][0]
