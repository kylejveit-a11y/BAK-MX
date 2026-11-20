"""Turn saved maker product pages into specialty research files (X-Trig, Ride Engineering, P3 Carbon, FCP Racing).

usage: maker_pages_convert.py <dir holding pages/<site>/index.json and the saved .html> <research root>
The pages are read once on the owner's computer by a polite reader (one request a second, honest client name, robots.txt
respected) and are not kept in the repo. Fitment comes only from what the maker wrote on its own page, read by
fitment_text.parse; a product whose fitment line cannot be read with confidence is written to the file's `unread` list
and is not given to any bike.
"""
import sys,os,json,re,html,collections
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from fitment_text import parse
src,root=sys.argv[1],sys.argv[2]
roster={tuple(r) for r in json.load(open(os.path.join(root,'roster-all.json')))}
def text(b):
    b=re.sub(r'(?is)<(script|style|noscript)[^>]*>.*?</\1>',' ',b); b=re.sub(r'(?is)<!--.*?-->',' ',b); b=re.sub(r'(?s)<[^>]+>','\n',b); b=html.unescape(b)
    return '\n'.join(l.strip() for l in re.sub(r'[ \t\r\xa0]+',' ',b).split('\n') if l.strip())
def pages(key):
    idx=json.load(open(os.path.join(src,'pages',key,'index.json')))
    for u,v in idx.items():
        if v.get('f'): yield u,v.get('retrieved',''),open(os.path.join(src,'pages',key,v['f']+'.html'),encoding='utf8',errors='replace').read()
def h1(b):
    m=re.search(r'(?is)<h1[^>]*>(.*?)</h1>',b); return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>','',m.group(1)))).strip() if m else ''
def fits_of(parsed): return [{'make':mk,'model':model,'years':ys,'notes':''} for mk,model,ys in parsed]
def rec(pid,cat,sub,brand,product,pns,parsed,url,price,line,colors=None,conf='medium'):
    r={'id':pid,'category':cat,'subcategory':sub,'brand':brand,'product':product,'part_numbers':pns,'variants':[],'fits':fits_of(parsed),
       'fitment_source_url':url,'fitment_line':line[:600],'what_it_changes':'','supporting_parts':'','price':price,'confidence':conf}
    if colors: r['colors']=colors
    return r
def write(name,slice_,source,retrieved,recs,unread,notes):
    out=os.path.join(root,'specialty',name)
    json.dump({'slice':slice_,'source':source,'retrieved':retrieved,'notes':notes,'products':recs,'unread':unread},open(out,'w'),indent=1,ensure_ascii=False)
    print(name,len(recs),'products given to bikes;',len(unread),'not read into bikes;',sum(len(f['years']) for r in recs for f in r['fits']),'bike-year fits')
_MK=r"(?:KTM|HUSQVARNA|HUSKY|HUSQ|HUS|HSQV|HQV|GAS ?GAS|GAS|TRIUMPH|TRI|HONDA|HON|KAWASAKI|KAWI|KAW|SUZUKI|SUZ|YAMAHA|YAM|BETA|SHERCO|FANTIC|RIEJU|STARK|DUCATI|TM)"
_MD=r"(?:CRF|CRX|CR|KXF|KLX|KX|YZF|YZ|WRF|WR|RMZ|RM-Z|RMX|RM|TF|SX-?F|XC-?F|XCF-?W|XC-?W|EXC-?F|EXC|SX|XC|FC|TC|FE|TE|FX|TX|FS|MC-?F|MC|EX-?F|EX|EC-?F|EC|RR|RX|XXF|XX)"
def product_name(title):
    """The part's own name with the bikes and years taken out ("2024+ KX450 & Yamaha Braided Steel Rear Brake Line Black"
    -> "Braided Steel Rear Brake Line Black"). Fitment lives in `fits`; a bike left in the name would hide the part on the
    other bikes it fits."""
    t=' '+re.sub(r'\s+',' ',title)+' '
    t=re.sub(r"(?i)\(?\b(?:MY\s*)?(?:19|20)\d\d(?:\.5)?\s*(?:[-–]\s*(?:(?:19|20)?\d\d(?:\.5)?)?|\+)?\)?",' ',t)
    t=re.sub(r"(?<![\w.])'?\d\d(?:\.5)?\s*(?:-\s*'?\d\d(?:\.5)?|\+)(?![\w.])",' ',t)
    tok=r"(?:"+_MK+r"|"+_MD+r"\s?-?\d{2,3}\s?[A-Z]{0,3}(?:\([A-Z/]+\))*|\d{2,3}\s?"+_MD+r"|"+_MD+r"|\d{2,3}[A-Z]{0,3}i?)"
    t=re.sub(r"(?i)(?<![\w-])"+tok+r"(?:\s*(?:[/,&+|]|and|\s)\s*"+tok+r")*(?![\w-])(?=\s*(?:[/,&+|;]|and\b|[A-Z(]|$|-))",lambda m:' ' if re.search(r'(?i)^(?:'+_MK+r'\b|'+_MD+r'\s?-?\d|\d{2,3}\s?'+_MD+r'|(?:CRF|CRX|CR|KXF|KLX|KX|YZF|YZ|WRF|WR|RMZ|RM-Z|RM)\b)',m.group(0).strip()) else m.group(0),t)
    t=re.sub(r'\(\s*\)|\|\s*(?=\||$)',' ',t); t=re.sub(r'\s+',' ',t)
    t=re.sub(r'^(?:\s|[/,&+|:;-]|\band\b|\bfor\b)+|(?:\s|[/,&+|:;-]|\band\b|\bfor\b)+$','',t)
    t=re.sub(r'\s*([/|&])\s*(?:[/|&]\s*)+',r' \1 ',t)
    return t.strip() or title.strip()
COLORS=['black','blue','orange','red','green','gold','silver','white','brown','titan','yellow','clear','magnesium']
def color_of(t):
    c=[x for x in COLORS if re.search(r'\b'+x+r'\b',t.lower())]; return c[:1]

def xname(title):
    off=(re.search(r'(?i)offs(?:et)?\s*([\d,.]+(?:\s?-\s?[\d,.]+)?)',title) or [None,''])[1].replace(',','.')
    col=(color_of(title) or [''])[0]; tail=(f', offset {off} mm' if off else '')+(f', {col}' if col else '')
    m=re.match(r'(?i)\s*ROCS (tech|pro)',title)
    if m: return f'ROCS {m.group(1).lower()} triple clamps'+tail
    if re.match(r'(?i)\s*top triple clamp',title): return 'Top triple clamp'+tail
    if re.match(r'(?i)\s*preload adjuster',title): return 'Shock preload adjuster'
    return re.sub(r'\s+',' ',re.sub(r'\s*/\s*',' ',product_name(title))).strip()
# ---- X-Trig (xtrig-shop.com): the product page's own "fits on:" lines ----
recs=[];unread=[];day=''
for u,d,b in pages('xtrigp'):
    t=text(b); title=h1(b); day=max(day,d)
    pn=(re.search(r'Product no\.:\s*(\S+)',t) or [None,''])[1]
    m=re.search(r'fits on:\n(.*?)(?:\nAccessories\n|\nSpare parts\n|\nBrowse these|\n•)',t,re.S)
    line=(re.sub(r';\s*MY',' & ',m.group(1)).replace('\n','; ') if m else '')
    parsed=parse(line,roster,'auto',bare_crf_r=True) if line else []
    if not parsed: parsed=parse(title,roster,'auto',bare_crf_r=True); line=line or title
    low=title.lower()
    cat,sub=(('suspension','shock preload adjuster') if 'preload' in low else ('chassis','holeshot device') if 'holeshot' in low else
             ('controls','bar mount') if re.search(r'phds|flexfix|fix system|handlebar',low) else ('chassis','triple clamps') if re.search(r'rocs|triple clamp',low) else ('chassis','hardware'))
    if not pn: continue
    if parsed: recs.append(rec('xtrig-'+pn,cat,sub,'Xtrig','Xtrig '+xname(title),[pn],parsed,u,'',line,color_of(title),'high'))
    elif cat!='chassis' or sub!='hardware': unread.append({'product':title,'part_number':pn,'url':u,'line':line[:300]})
write('xtrig.json',"X-Trig: the maker's own shop pages (triple clamps, preload adjusters, holeshot kits, bar mounts) with the bikes each page lists",
      'https://www.xtrig-shop.com (product pages; "fits on" lines)',day,recs,unread,'Prices are not shown to the public on the maker shop. Open-ended years are read no later than 2026.')

# ---- Ride Engineering: the Application line, or the Application Info tab when the line says "see below" ----
recs=[];unread=[];day=''
def re_cat(t):
    l=t.lower()
    for pat,c in ((r'triple clamp',('chassis','triple clamps')),(r'bar mount|handlebar',('controls','bar mount')),(r'\blink\b|linkage|pull rod',('suspension','linkage')),
                  (r'brake line',('brakes','brake line')),(r'caliper|hanger bracket|rotor|brake',('brakes','brake parts')),(r'engine mount|head stay|motor mount',('chassis','engine mounts')),
                  (r'axle block|axle adjuster',('chassis','axle blocks')),(r'starting device|holeshot|launch',('chassis','holeshot device')),(r'steering damper|stabilizer',('chassis','steering damper')),
                  (r'footpeg|foot peg',('controls','footpegs')),(r'clutch',('clutch','clutch')),(r'plug|cap|cover|guard|nut|bolt|spacer|washer',('chassis','hardware'))):
        if re.search(pat,l): return c
    return ('chassis','hardware')
for u,d,b in pages('re'):
    t=text(b); title=h1(b); day=max(day,d)
    pn=(re.search(r'Part Number:\n\s*(\S+)',t) or [None,''])[1]
    app=(re.search(r'Application:\n(.*?)\n',t) or [None,''])[1].strip()
    price=(re.search(r'Your Price:\n\s*(\$[\d,.]+)',t) or [None,''])[1]
    if not pn or re.search(r'shirt|hat\b|sticker|decal|banner|gift',title.lower()): continue
    line=app
    if not app or re.search(r'\bsee\b',app.lower()):
        m=re.search(r'(?is)id="tab-6"[^>]*>(.*?)</div>',b); line=text(m.group(1)).replace('\n','; ') if m else ''   # the Application Info tab only, never the description
    parsed=parse(line,roster,'auto')
    cat,sub=re_cat(title)
    if parsed: recs.append(rec('ride-'+pn,cat,sub,'Ride Engineering','Ride Engineering '+product_name(re.sub(r'(?i)^Ride Eng\.?(?:ineering)?\s+','',title)),[pn],parsed,u,f'{price} (Ride Engineering, {d})' if price else '',line,color_of(title)))
    else: unread.append({'product':title,'part_number':pn,'url':u,'line':line[:300]})
write('ride-engineering.json',"Ride Engineering: the maker's own catalogue with each product's Application line",
      'https://ride-engineering.com (product pages; Application and Application Info)',day,recs,unread,'Where a line names a brand family without sizes or a GasGas line without the four-stroke names, only the bikes written out are given the part.')

p3tidy=lambda n:re.sub(r'\s+',' ',re.sub(r'(?:\s*[|/]\s*(?:F|X|SR|RX|RWE|FX|R|S|\d{2,3}))+(?=\s|$)|\s*\|\s*$','',n)).strip(' |/')
# ---- P3 Carbon: the product title carries make, model and years ----
recs=[];unread=[];day=''
P3CAT={'skid-plates':('protection','skid plate'),'pipe-guards':('protection','pipe guard'),'heat-shields':('protection','heat shield'),'brake-guards':('protection','brake disc guard'),
       'fuel-tank-covers':('protection','fuel tank cover'),'frame-guards':('protection','frame guards')}
for u,d,b in pages('p3'):
    title=h1(b); day=max(day,d)
    if not title or 'BLEMISHED' in title.upper(): continue
    sku=(re.search(r'"sku":"([^"]+)"',b) or [None,''])[1]
    catslug=(re.search(r'Category:\s*([a-z0-9-]+)',b) or [None,''])[1]
    price=(re.search(r'Price:\s*(\$[\d,.]+)',b) or [None,''])[1]
    parsed=parse(title,roster,'auto')
    cat,sub=P3CAT.get(catslug,('protection',catslug.replace('-',' ') or 'carbon guard'))
    pid='p3-'+(re.sub(r'[^A-Za-z0-9]+','-',sku).strip('-') or re.sub(r'.*/products/','',u).strip('/')[:60])
    if parsed: recs.append(rec(pid,cat,sub,'P3 Carbon','P3 Carbon '+p3tidy(product_name(re.sub(r'(?i)^P3 Carbon( Fiber)?\s+|\(See [^)]*\)|PLEASE READ[^|]*','',title))),[sku] if sku else [],parsed,u,f'{price} (P3 Carbon, {d})' if price else '',title))
    else: unread.append({'product':title,'part_number':sku,'url':u,'line':title[:300]})
seen=set(); recs=[r for r in recs if not (r['id'] in seen or seen.add(r['id']))]
write('p3-carbon.json',"P3 Carbon: the maker's own catalogue; bikes and years as written in each product title",
      'https://p3carbon.com (product pages)',day,recs,unread,'Titles that say only "see fitment tab" or name a brand without models are not given to any bike. Blemished (grade B) listings are left out.')

# ---- FCP Racing: one page per bike and product family ----
recs=[];unread=[];day=''
for u,d,b in pages('fcp'):
    t=text(b); title=h1(b); day=max(day,d)
    cats=(re.search(r'Categor(?:y|ies):\s*\n(.*?)\nDescription',t,re.S) or [None,''])[1]
    cats=[c.strip() for c in re.split(r'\n|,',cats) if c.strip() and c.strip()!=',']
    kind=next((c for c in cats if c in ('Engine Mounts','Race Cups','Foot Peg Pins','Pivot Performance Kit')),None)
    if not kind or 'REPLACEMENT' in title.upper(): continue
    price=(re.search(r'\$\n?\s*([\d,]+\.\d\d)',t) or [None,''])[1]
    mks=[c for c in cats if c in ('KTM','Husqvarna','GasGas','Honda','Yamaha','Kawasaki','Suzuki','Triumph')]
    line=(mks[0]+' '+title) if len(mks)==1 and not re.search(r'KTM|HUSQ|GAS|HONDA|YAMAHA|KAWASAKI|SUZUKI|TRIUMPH',title.upper()) else title
    parsed=parse(line,roster,'auto')
    cat,sub={'Engine Mounts':('chassis','engine mounts'),'Race Cups':('suspension','fork race cups'),'Foot Peg Pins':('controls','footpeg pins'),'Pivot Performance Kit':('chassis','swingarm pivot kit')}[kind]
    pid='fcp-'+re.sub(r'.*/product/','',u).strip('/')[:70]
    name=f'FCP Racing {kind}'
    if parsed: recs.append(rec(pid,cat,sub,'FCP Racing',name,[],parsed,u,f'${price} (FCP Racing, {d})' if price else '',line,None,'high'))
    else: unread.append({'product':name,'part_number':'','url':u,'line':line[:300]})
write('fcp-racing.json',"FCP Racing: engine mounts, race cups, footpeg pins and pivot kits, one maker page per bike",
      'https://fcpracing.com (product pages)',day,recs,unread,'The maker sells by bike, not by part number. Spare single mounts ("replacement parts" pages) are left out.')
