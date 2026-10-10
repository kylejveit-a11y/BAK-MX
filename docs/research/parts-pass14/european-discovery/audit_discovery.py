import pathlib,json,re,hashlib
B=pathlib.Path(__file__).resolve().parent;T=pathlib.Path('C:/Users/kylej/AppData/Local/Temp/parts-pass14-europe');out=[]
for brand in ['ktm','husqvarna','gasgas']:
 raw=(T/(brand+'-home.html')).read_bytes();tree=json.loads(re.search(r'var treeSettings = (.*);',raw.decode())[1]);stack=tree['TreeElements'][:];ns=[]
 while stack:
  n=stack.pop()
  if n.get('children'):stack.extend(n['children']);continue
  label=n['text'];y=re.search(r'<(20\d\d)>',label)
  if y and 2020<=int(y[1])<=2027 and re.match(r'(?:\d+\s+(?:SX|XC|EXC)|(?:FC|TC|FX|TX|FE|TE|MC|EC|EX)\s*\d+)',label):ns.append(n)
 out.append({'brand':brand,'source_sha256':hashlib.sha256(raw).hexdigest(),'all_region_leaves':ns})
(B/'all-region-identity-audit.json').write_text(json.dumps(out,indent=2)+'\n')
for g in out:
 for n in g['all_region_leaves']:
  if ('TC 250' in n['text'] or 'FC 250 ' in n['text'] or 'MC 250F ' in n['text']) and '2026' in n['text']:print(n['text'])
