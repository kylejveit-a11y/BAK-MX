"""Turn a parts workbook the owner supplied (a third-party catalog review of one bike) into a specialty research file.

usage: python3 scripts/aftermarket/owner_sheet_convert.py WORKBOOK.xlsx
Only what BAK does not already hold is taken: the "Gap review" rows (engine internals, electrical, fuelling) and products
from brands missing from the family catalog. Colour and tooth-count versions of one product become one product with all its
numbers. Nothing was re-checked on the maker's page here, so a maker's own application reads as medium and a retailer label
as unverified. The workbook itself is not kept in the repository."""
import json,os,re,sys,collections,openpyxl
root=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BIKE=('KTM','450 SX-F',2025);AS_OF='2026-11-26'
have=json.load(open(os.path.join(root,'public','parts-catalog','ktm-family.json')))
canon=lambda b:re.sub(r'[^a-z0-9]','',re.sub(r'\b(racing|offroad|performance|engineering|products|motorcycle hardware)\b','',str(b).lower()))
known={canon(b) for b in have['brands']}|{canon('Bolt'),canon('Scotts')}
SYS={'Brakes':'brakes','Chassis & protection':'protection','Clutch':'clutch','Cooling':'engine','Electrical & electronics':'engine','Engine & lubrication':'engine',
     'Exhaust':'exhaust','Fasteners & hardware':'chassis','Final drive':'gearing','Graphics & bodywork':'body','Intake & fueling':'intake','Other components':'chassis',
     'Rider controls':'controls','Seat':'body','Suspension & steering':'suspension','Tires':'wheels','Wheels':'wheels'}
COLOR=r'\b(black|orange|white|blue|red|green|gr[ae]y|yellow|silver|gold|pink|purple|fluo|neon|titanium|magnesium|bronze|flo|kt[m]? orange)\b'
rows=list(openpyxl.load_workbook(sys.argv[1],read_only=True,data_only=True)['Parts'].iter_rows(values_only=True))[1:]
groups=collections.OrderedDict()
for system,brand,name,pn,_sku,price,cur,supplier,evidence,_stock,check,fit_url,prod_url,pas in rows:
    if 'shim' in str(evidence).lower() or brand in ('BRP','Rocky Mountain ATV/MC'): continue
    if pas!='Gap review' and canon(brand) in known: continue
    name=re.sub(r'^'+re.escape(str(brand))+r'\s+','',str(name)).strip()
    if name.isupper(): name=name.capitalize()
    fam=re.sub(r'\s+',' ',re.sub(r'\b\d{2} tooth\b','',re.sub(COLOR,'',name,flags=re.I),flags=re.I)).strip(' -/,')
    g=groups.setdefault((brand,fam.lower()),{'brand':brand,'product':fam,'system':SYS.get(system,'chassis'),'pns':[],'ev':evidence,'check':[],'fit':fit_url,'buy':[]})
    if pn and str(pn) not in g['pns']: g['pns'].append(str(pn))
    if check and str(check) not in g['check']: g['check'].append(str(check))
    url=prod_url or fit_url
    if url and not any(b['url']==url for b in g['buy']) and len(g['buy'])<3:
        g['buy'].append({'seller':supplier,'url':url,**({'price_if_stated':price,'currency':cur} if price and cur=='USD' else {})})
products=[]
for i,g in enumerate(groups.values(),1):
    products.append({'id':f'ow1-{i:03d}','category':g['system'],'brand':g['brand'],'product':g['product'],'part_numbers':g['pns'],'variants':[],
        'fits':[{'make':BIKE[0],'model':BIKE[1],'years':[BIKE[2]],'notes':g['ev']}],'fitment_source_url':g['fit'],
        'what_it_changes':'','supporting_parts':' '.join(g['check']),'where_to_buy':g['buy'],
        'confidence':'medium' if str(g['ev']).startswith('Manufacturer') else 'unverified',
        'notes':f"From a parts workbook the owner supplied {AS_OF}; fitment evidence as that review recorded it, not re-checked on the maker's page."})
out=os.path.join(root,'docs','research','aftermarket','specialty','owner-ktm450-2026-11.json')
json.dump({'slice':f'owner-supplied catalog review, {BIKE[2]} {BIKE[0]} {BIKE[1]}','products':products,'gaps':[],'not_done':['Re-check each fitment on the maker page before raising confidence.']},open(out,'w'),ensure_ascii=False,indent=1)
print(len(products),'products',collections.Counter(p['confidence'] for p in products),collections.Counter(p['brand'] for p in products).most_common(8))
