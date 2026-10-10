import fitz,json
from pathlib import Path
from PIL import Image,ImageDraw
B=Path(__file__).resolve().parent;T=Path('C:/Users/kylej/AppData/Local/Temp/yz250f-setup-renders');T.mkdir(exist_ok=True)
rows=json.loads((B/'source-index.json').read_text())
for r in rows:
 y=r['target']['model_year'];book=fitz.open(r['local_pdf_path'])
 pp=r['setup_pages'];pages=sorted(set(pp+([103] if y==2020 else [])))
 for n in pages:
  p=book[n-1].get_pixmap(matrix=fitz.Matrix(1.3,1.3));p.save(str(T/f'{y}-{n}.png'))
 # Two pages per contact sheet at native render size, original images also retained.
 for k in range(0,len(pages),2):
  ims=[Image.open(T/f'{y}-{n}.png').convert('RGB') for n in pages[k:k+2]]
  out=Image.new('RGB',(sum(i.width for i in ims),max(i.height for i in ims)+30),'white');d=ImageDraw.Draw(out);x=0
  for n,im in zip(pages[k:k+2],ims):out.paste(im,(x,30));d.text((x+10,5),f'Exact US {y} YZ250F PDF {n}',fill='black');x+=im.width
  out.save(T/f'{y}-pair{k//2}.png')
print(T)
