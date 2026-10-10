"""Bind newly recovered exact US identities without granting service equivalence."""
import json,hashlib,re,urllib.request,copy
from pathlib import Path
B=Path(__file__).resolve().parent;R=B.parents[3]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def wr(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
p=B/'yamaha-model-year-matrix.json';d=json.loads(p.read_text(encoding='utf8'))
inventory=json.loads((B.parent/'yamaha-fx-wr/all-manual-inventory.json').read_text(encoding='utf8'))
for x in d['rows']:
 match=next((r for r in inventory if (r['model'],r['year'])==(x['model'],x['model_year'])),None)
 if match:
  e={'url':match['url'],'document_sha256':match['sha256'],'pdf_pages':[1,match['copyright_page']],'scope':'Exact model/year cover plus Yamaha Motor Corporation U.S.A. copyright; service equivalence not inferred.'}
  if e not in x['identity_evidence']:x['identity_evidence'].append(e)
  x['identity_status']='CONFIRMED_EXACT_US_MANUAL_IDENTITY'
  x['gaps']=[g for g in x['gaps'] if not g.startswith('Exact US year/')]
new=[]
for model,pid in [('WR450F',482),('WR250F',483)]:
 url=f'https://www.yamahamotorsports.com/models.php?action=productPage&product={pid}'
 raw=urllib.request.urlopen(url).read();title=re.search(r'<title>(.*?)</title>',raw.decode(),re.S)[1].strip();assert title.startswith('2027 '+model)
 e={'url':url,'title':title,'response_sha256':hashlib.sha256(raw).hexdigest(),'scope':'Individual official US2027 marketed identity only; service manual not recovered.'}
 new.append(e)
 if not any(x['model']==model and x['model_year']==2027 for x in d['rows']):
  x=copy.deepcopy(next(x for x in d['rows'] if x['model']==model and x['model_year']==2026));x.update(model_year=2027,identity_status='CONFIRMED_EXACT_US_PRODUCT_IDENTITY',identity_evidence=[e],source_approved_artifacts=[],gaps=['Exact2027 US service manual and operational procedures remain unrecovered/unreviewed. No2026 specification inheritance.']);x.pop('failed_lookup',None);d['rows'].append(x)
 for f in d['families']:
  if f['model']==model:f['latest_confirmed_us_model_year']=2027
d['model_years_beyond_latest']=[]
d['summary']={'rows':len(d['rows']),'confirmed':sum(x['identity_status'].startswith('CONFIRMED') for x in d['rows']),'unknown':sum(x['identity_status'].startswith('UNKNOWN') for x in d['rows']),'full_rebuild_qualified':0}
wr(p,d);wr(B/'wr-2027-current-identity-update.json',{'status':'RESOLVED_NEW_PRODUCT_IDS','observed_at':'2026-09-14','homepage':'https://www.yamahamotorsports.com/','new_sources':new,'explanation':'Earlier individually inspected IDs395/396 are2026 pages. Current homepage points to new IDs482/483 with exact2027 titles, so2027 identities are confirmed without treating historical2026 pages as conflicting specifications.','manual_status':'UNRECOVERED_NO_YEAR_INHERITANCE'})
print(d['summary'])
