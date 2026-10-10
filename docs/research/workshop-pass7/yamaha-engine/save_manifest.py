import json,hashlib
from pathlib import Path
P=Path(__file__).parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
paths=sorted(P.glob('*.procedure.json'))
source=Path('C:/Users/kylej/AppData/Local/Temp/D03-2819U-10_02.pdf')
m=dict(schema_version=1,status='APPROVED',sources=[dict(id='yamaha26',url='https://library.ymcapps.net/library/om/contents/pdf/10/D03-2819U-10_02.pdf',local_pdf_path=str(source),sha256=sha(source))],artifacts=[dict(path=p.name,kind='procedure',sha256=sha(p),source_id='yamaha26',target=json.loads(p.read_text(encoding='utf-8'))['target']) for p in paths])
m['independent_review']=dict(reviewer='year_groups_research',decision='APPROVED',visual_pdf_pages=[96,161,165,230,231,232,233,234],corrections='Explicit stem OD rejection, old reuse wording removed, actual dependency SHA verification.',physical_execution=False)
(P/'source-review-manifest.json').write_text(json.dumps(m,indent=2)+'\n')
