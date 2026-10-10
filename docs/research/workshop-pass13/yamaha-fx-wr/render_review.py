import fitz,json,hashlib
from pathlib import Path
B=Path(__file__).resolve().parent;T=Path('C:/Users/kylej/AppData/Local/Temp/bakmx-pass13/fx-review');T.mkdir(exist_ok=True)
groups={}
for r in json.loads((B/'all-manual-inventory.json').read_text(encoding='utf8')):
 d=fitz.open(r['local_path']);a=r['fork_page'];g=r['sag_page']
 for n in [a,a+1,a+2,a+3,g]:
  pix=d[n-1].get_pixmap(matrix=fitz.Matrix(1,1));h=hashlib.sha256(pix.samples).hexdigest()
  groups.setdefault(h,[]).append(dict(code=r['code'],year=r['year'],model=r['model'],pdf_page=n))
  if len(groups[h])==1:pix.save(T/(h+'.png'))
(B/'render-equivalence-inventory.json').write_text(json.dumps([dict(pixel_sha256=h,local_image=str(T/(h+'.png')),exact_pages=rs,visual_review='PENDING') for h,rs in groups.items()],indent=2)+'\n')
print('Unique full-page renders',len(groups),'of',sum(map(len,groups.values())))
