"""Offline regression: cached assembly381raw/380normalized must retain its duplicate."""
import pathlib,json,tempfile
B=pathlib.Path(__file__).resolve().parent
source=(B/'capture_official.py').read_text();ns={'__file__':str(B/'capture_official.py')};exec(compile(source[:source.index('index=json.loads')],'capture-setup','exec'),ns)
p=B/'captures/ktm/250-sx-f-2024-1003029304.json';d=json.loads(p.read_text());expected=[x for x in d['raw_duplicate_rows'] if x['assembly_id']=='4668'];assert len(expected)==1
with tempfile.TemporaryDirectory(prefix='bakmx-resume-regression-') as tmp:
 out=pathlib.Path(tmp);(out/p.name).write_text(json.dumps(d));scope={'__file__':str(B/'capture_official.py'),'PersistentPublicSession':lambda:None};exec(compile(ns['base'],'public-parser','exec'),scope)
 def fake_fetch(op,url,data=None):
  assert '/Result/ExecuteSearch?' in url,'Cached assembly must not request a source again'
  return (('<a href="/ComponentGroupTemplate/Index/4668?modelidentifier=1003029304&isEngine=False">WP SHIMS FOR SETTING</a>' if url.endswith('False') else '')).encode()
 scope.update(OUT=out,BASE='https://sparepartsfinder.ktm.com',MANUFACTURER='KTM',fetch=fake_fetch)
 scope['acquire']({'id':'1003029304','year':2024,'label':d['catalog_label']});actual=json.loads((out/p.name).read_text());assert actual['raw_duplicate_rows']==expected and len(actual['parts'])==380 and actual['catalog_complete']
 print('PASS: cached381raw=380normalized+1duplicate; zero network access')
