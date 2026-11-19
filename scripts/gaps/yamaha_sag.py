"""Standard sunken length (rider sag) from a Yamaha Owner's Service Manual text layer.
Takes only the sentence 'set the rear shock absorber sunken length to the standard figure A–B mm (a–b in)'.
Fail closed: every occurrence must agree, mm must match the printed inches, no market tag in the sentence."""
import re,sys,subprocess,hashlib
PAT=re.compile(r'set\s+the\s+rear\s+shock\s+absorber\s+sunken\s+length\s+to\s+the\s+standard\s+figure\s+(\d{2,3})\s*[–-]\s*(\d{2,3})\s*mm\s*\(\s*([\d.]+)\s*[–-]\s*([\d.]+)\s*in\)([^.]{0,40})',re.I)
def printed(pg):
    tail=[l.strip() for l in pg.strip().split('\n')[-6:]]+[l.strip() for l in pg.strip().split('\n')[:3]]
    for l in tail:
        m=re.fullmatch(r'(\d{1,2}-\d{1,3})',l) or re.search(r'(?:^|\s{3,})(\d{1,2}-\d{1,3})$',l)
        if m:return m.group(1)
    return None
def read(txt):
    pages=open(txt,errors='replace').read().split('\f');found=[]
    for i,pg in enumerate(pages):
        flat=re.sub(r'-\n\s*','',pg);flat=re.sub(r'\s+',' ',flat)
        for m in PAT.finditer(flat):
            a,b,x,y,rest=int(m[1]),int(m[2]),float(m[3]),float(m[4]),m[5]
            ok=abs(a/25.4-x)<0.06 and abs(b/25.4-y)<0.06 and a<b and 60<=a<=130
            tag=bool(re.search(r'USA|CAN|EUR|AUS|JPN|ZAF|NZL|Except|\*',rest))
            found.append({'pdf':i+1,'printed':printed(pg),'val':f'{a}–{b}','ok':ok,'tag':tag,'ctx':m[0][:150]})
    return found
if __name__=='__main__':
    for f in sys.argv[1:]:
        r=read(f);print(f,[(x['pdf'],x['printed'],x['val'],x['ok'],x['tag']) for x in r])
