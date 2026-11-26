import subprocess,re,sys,json
COL=r'^(Bl|Y|Bu|G|R|W|Br|O|Lb|Lg|P|Gr)(/(Bl|Y|Bu|G|R|W|Br|O|Lb|Lg|P|Gr))?$'
def words(f,page):
    x=subprocess.run(['pdftotext','-bbox','-f',str(page),'-l',str(page),f,'-'],capture_output=True,text=True).stdout
    return [(float(a),float(b),float(c),float(d),w) for a,b,c,d,w in re.findall(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)</word>',x)]
def pinout(f,page):
    W=words(f,page)
    pins=[w for w in W if re.match(r'^A-\d{1,2}$',w[4])]
    if len(pins)<20: return None
    # pins are stacked along one axis: find which coordinate varies
    xs=[(p[0]+p[2])/2 for p in pins];ys=[(p[1]+p[3])/2 for p in pins]
    along_y=(max(ys)-min(ys))>(max(xs)-min(xs))
    pos=lambda w:((w[1]+w[3])/2 if along_y else (w[0]+w[2])/2)
    perp=lambda w:((w[0]+w[2])/2 if along_y else (w[1]+w[3])/2)
    step=sorted(abs(a-b) for a,b in zip(sorted(pos(p) for p in pins),sorted(pos(p) for p in pins)[1:]))[len(pins)//2]
    base=sum(perp(p) for p in pins)/len(pins)
    out={}
    for p in pins:
        row=[w for w in W if abs(pos(w)-pos(p))<step*0.45 and w is not p and abs(perp(w)-base)<140]
        sig=[w for w in row if not re.match(COL,w[4]) and not re.match(r'^A-\d',w[4]) and w[4] not in ('ECM','-','33P')]
        col=[w for w in row if re.match(COL,w[4])]
        sig.sort(key=lambda w:abs(perp(w)-base));col.sort(key=lambda w:abs(perp(w)-base))
        # signal words lie on one side (label side), colour on the wire side: take nearest colour, all signal words on label side
        out[p[4]]={'signal':' '.join(w[4] for w in sorted(sig,key=lambda w:(w[1] if not along_y else w[0]))[:4]) ,'colour':col[0][4] if col else None}
    return out
if __name__=='__main__':
    o=pinout(sys.argv[1],int(sys.argv[2]))
    for k in sorted(o,key=lambda x:int(x[2:])): print(k,o[k])
