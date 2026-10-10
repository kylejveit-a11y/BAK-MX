"""Offline only: normalize already captured DOM documents for shared parser."""
import json,re,pathlib,html,urllib.parse
B=pathlib.Path(__file__).resolve().parent/'motosport/gasgas-2022-mc-250f';C=B/'captures';C.mkdir(exist_ok=True)
p=B/'index.json';d=json.loads(p.read_text());d['target']['year']=d['target'].pop('model_year',2022);d['target']['catalog_model_label']='GASGAS MC 250F';p.write_text(json.dumps(d,indent=2)+'\n')
for p in B.glob('[0-9]*.json'):
 d=json.loads(p.read_text());heading=re.search(r'<h1[^>]*>(.*?)</h1>',d['html'],re.S);assert heading
 d['document_title']=d['title'];d['title']=' '.join(html.unescape(re.sub('<[^>]+>','',heading[1])).split());d['title_basis']='Visible h1 extracted from the same captured DOM; original browser title retained.'
 name=urllib.parse.urlsplit(d['url']).path.rstrip('/').split('/')[-1]+'.json';out=C/name;assert out.parent==C and not out.exists();out.write_text(json.dumps(d,indent=2)+'\n');p.unlink()
