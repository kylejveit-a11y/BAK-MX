"""Suspension baselines from the e-book text layer (search.xml) of Kawasaki KX250F / KX450F owner's manuals 2014-2019.

Kawasaki serves these manuals only in its viewer (pws.ktivs.net). The viewer's search text layer has the words run together
("20clicksormore.StandardReboundDampingAdjusterSetting ... 10clicks**:Counterclockwisefromthefullyseatedposition"), so only
patterns that cannot be misread are taken, each from one e-book page:
- a standard damper / preload setting: the page must carry exactly one "Standard <X> Adjuster Setting" box (usable range "<n> clicks or more / or less" when printed once on the page) and exactly one
  "<n> clicks|turns ** : (Counter)clockwise from the fully seated position" value; the usable range ("<n> clicks or more") is kept
  when printed on the same page, and the standard must lie inside it;
- the standard spring rate: the starred "K=<n> N/mm* (K=<m> kgf/mm)" with "*: Standard" on the page, N/mm checked against kgf/mm.
Front or rear comes from the page's own words (rear shock / high or low speed vs. front fork); a page naming both is skipped.
usage: kawasaki_textlayer_older.py <list.tsv: year model code file folder> <xml dir> <out dir>"""
import re,sys,os,json,hashlib
h=lambda s:hashlib.sha256(s.encode()).hexdigest()
BOX=re.compile(r'Standard((?:[A-Z][a-z]+)+?)AdjusterSetting')
RNG=re.compile(r'(\d+)(clicks|turns)or(more|less)\.')
STD=re.compile(r'(?<![\d/])(\d+(?:-\d+/\d+)?|\d+/\d+)(clicks|turnsout|turns)\*\*:(Counterclockwise|Clockwise)fromthefullyseatedposition')
SPR=re.compile(r'K=(\d+(?:\.\d+)?)N/mm\*\(K=(\d+(?:\.\d+)?)kgf/mm\)')
NAME={'ReboundDamping':'Rebound damping','CompressionDamping':'Compression damping','HighSpeedCompressionDamping':'Compression damping, high-speed',
      'LowSpeedCompressionDamping':'Compression damping, low-speed','SpringPreload':'Spring preload'}
def side(t):
    l=t.lower(); rear=bool(re.search(r'rearshock|rearsuspension|highspeed|lowspeed',l)); front='fork' in l
    return None if rear==front else ('Shock absorber' if rear else 'Fork')
def printed(t):
    m=re.search(r'MAINTENANCEANDADJUSTMENT(\d{2,3})(?!\d)',t) or re.search(r'(?<!\d)(\d{2,3})MAINTENANCEANDADJUSTMENT',t)
    return m.group(1) if m else '?'
def rows(xml):
    out=[];notes=[]
    for p,t in re.findall(r'<text page="(\d+)"[^>]*><!\[CDATA\[(.*?)\]\]></text>',xml,re.S):
        boxes=BOX.findall(t); stds=STD.findall(t)
        if boxes or stds:
            s=side(t)
            if len(boxes)!=1 or len(stds)!=1 or not s: notes.append(('setting skipped',p,len(boxes),len(stds),s))
            else:
                name=boxes[0]; v,u,dirn=stds[0]; label=NAME.get(name); rr=RNG.findall(t)
                if u!='clicks' and re.fullmatch(r'\d\d/\d',v): v=v[0]+' '+v[1:]      # "1 3/4 turns" loses its space in the text layer
                elif '/' in v: notes.append(('fraction not read',p,v)); continue
                rng,ru,rw=rr[0] if len(rr)==1 else ('','','')
                unit='clicks' if u=='clicks' else 'turns'
                if not label: notes.append(('unknown adjuster',p,name))
                elif rng and (ru!=u.replace('out','') or (int(v.split()[0])+eval(v.split()[1]) if ' ' in v else float(v))>float(rng)): notes.append(('range check',p,name,v,rng))
                else:
                    out.append((int(p),printed(t),f'{s} / {label} / Standard setting',f'{v} {unit} {"counterclockwise" if dirn=="Counterclockwise" else "clockwise"} from the fully seated position'))
                    if rng: out.append((int(p),printed(t),f'{s} / {label} / Usable range',f'{rng} {unit} or {rw}'))
        sp=SPR.findall(t)
        if sp and '*:Standard' in t:
            s=side(t)
            if len(sp)!=1 or not s: notes.append(('spring skipped',p,sp,s))
            else:
                n,k=map(float,sp[0])
                if abs(n/9.80665-k)>0.06: notes.append(('spring conversion',p,sp))
                else: out.append((int(p),printed(t),f'{s} / Spring rate (standard)',f'{sp[0][0]} N/mm ({sp[0][1]} kgf/mm)'))
    paths=[o[2] for o in out]; dup={x for x in paths if paths.count(x)>1}
    if dup: notes.append(('duplicate paths dropped',sorted(dup)))
    return [o for o in out if o[2] not in dup],notes
if __name__=='__main__':
    lst,xd,od=sys.argv[1:4]; os.makedirs(od,exist_ok=True); i=0
    for l in open(lst):
        y,m,code,f,folder=l.rstrip('\n').split('\t')[:5]
        if not folder: continue
        raw=open(f'{xd}/{y}-{m}.xml','rb').read(); r,notes=rows(raw.decode('utf-8'))
        model={'KX250F':'KX250','KX450F':'KX450'}.get(m,m)
        lines=sorted((f'{p}|{pr}|{a}|{v}|' for p,pr,a,v in r),key=lambda x:h(x.split('|')[2]))
        print(y,m,len(r),notes)
        if not r: continue
        i+=1
        json.dump({'make':'Kawasaki','model':model,'yr':int(y),'doc':f,'sha':hashlib.sha256(raw).hexdigest(),
                   'url':f'https://pws.ktivs.net/dispeBook?file={f}&lang_code=EN',
                   'rev':f"Kawasaki {m} owner's manual {f} (US English e-book); text layer https://pws.ktivs.net/assets/{folder}/search.xml",
                   'ref':f'docs/research/older/kawasaki-2014-2019/REVIEW.md; {f}; e-book text layer, one setting box per page, range and conversion checked, fail-closed.',
                   'want':h('\n'.join(lines)),'n':len(lines),'delta':'\n'.join('+|'+x for x in lines)},open(f'{od}/{i}.json','w'),ensure_ascii=False)
