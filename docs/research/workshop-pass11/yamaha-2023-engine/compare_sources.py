import json,hashlib,re,difflib
from pathlib import Path
from pypdf import PdfReader
out=Path(__file__).parent
pdf=Path('C:/Users/kylej/AppData/Local/Temp/BHR-2819U-10_02.pdf')
assert hashlib.sha256(pdf.read_bytes()).hexdigest()=='9a8605e26301ba1d0d1d21e93d23cca721bdcdbece6188775626a8819332aa9f'
a=PdfReader(pdf);b=PdfReader('C:/Users/kylej/AppData/Local/Temp/BHR-2819U-11_02.pdf')
norm=lambda s:re.sub(r'\s+',' ',s).strip()
at=[norm(p.extract_text()) for p in a.pages];bt=[norm(p.extract_text()) for p in b.pages]
rows=[]
for p in list(range(206,278))+[8,23,47,48,85,86,87,88,89,90,91,92,93]:
 scores=[difflib.SequenceMatcher(None,bt[p-1],t,autojunk=True).ratio() for t in at]
 i=max(range(len(scores)),key=scores.__getitem__)
 rows.append(dict(template_2024_pdf_page=p,candidate_2023_pdf_page=i+1,text_similarity=round(scores[i],5),text_exact=at[i]==bt[p-1],review_status='CANDIDATE_LOCATOR_ONLY_NOT_REVIEWED'))
(out/'candidate-section-map.json').write_text(json.dumps(dict(source_sha256=hashlib.sha256(pdf.read_bytes()).hexdigest(),pdf_pages=len(a.pages),notice='Text alignment is discovery only, not applicability or visual approval.',pages=rows),indent=2)+'\n')
print(len(a.pages),'pages');print('\n'.join(str(x) for x in rows if not x['text_exact']))

