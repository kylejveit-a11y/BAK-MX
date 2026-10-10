"""2023 source authoring. Frozen 2024 workflow is a template, not mechanical authority."""
import json,re,hashlib,copy,sys
from pathlib import Path
import fitz
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
def rd(p):return json.loads(p.read_text(encoding="utf8"))
def wr(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+"\n",encoding="utf8",newline="\n")
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
SOURCE=Path("C:/Users/kylej/AppData/Local/Temp/BHR-2819U-10_02.pdf")
assert sha(SOURCE)=="9a8605e26301ba1d0d1d21e93d23cca721bdcdbece6188775626a8819332aa9f"
URL="https://library.ymcapps.net/library/om/contents/pdf/10/BHR-2819U-10_02.pdf"
pdf=fitz.open(SOURCE)
# Explicit reviewed locators, not numeric guessing. Chapter2 onward retains pagination.
PAGES={23:22,36:35,37:36,38:37}
BASE=ROOT/"docs/research/workshop-pass10/yamaha-2024-frame"
NAMES={"engine-removal-refit-v1.procedure.json":"86fb9b99d1efeb08101a68f7f8b232cc0267ccc8e67465e41eec2750f181be96","frame-bearing-renewal-reassembly-v1.procedure.json":"b6628acf8ba83422ab2eba567569599bdcf953d01d05e419aa4358a04c554604"}
def text_map(v):
 if isinstance(v,str):
  if v.startswith("http") and "ymcapps" not in v:return v
  v=v.replace("2024","2023").replace("BHR-2819U-11_02.pdf","BHR-2819U-10_02.pdf").replace("90890-03273","90890-03264")
  return re.sub(r"PDF ?(\d+(?:/\d+)*)",lambda m:"PDF"+"/".join(str(PAGES.get(int(n),int(n))) for n in m[1].split("/")),v)
 if isinstance(v,list):return [text_map(x) for x in v]
 if isinstance(v,dict):return {k:text_map(x) for k,x in v.items()}
 return v
names=[list(NAMES)[1]] if "--frame" in sys.argv else [next(iter(NAMES))]
for name in names:
 out=HERE/name
 if out.exists() and rd(out)["source"]["review_status"]=="APPROVED":raise SystemExit("Frozen approved source: new revision required.")
 base=BASE/name;assert sha(base)==NAMES[name]
 original=rd(base);d=text_map(original);d["target"]["model_year"]=2023
 d["supplemental_sources"]=copy.deepcopy(original["supplemental_sources"])
 d.update(status="SOURCE_REVIEWED_CANDIDATE",publication_status="NOT_IMPORTED",integration_status="CANDIDATE_PENDING_INDEPENDENT_REVIEW")
 d["source"].update(source_url=URL,document_sha256=sha(SOURCE),document_revision="BHR-2819U-10 / LIT-11626-36-32; First edition July2022",review_status="PENDING_INDEPENDENT_REVIEW",review_note="Exact2023 source text and diagrams reviewed; independent review pending. No blanket year inheritance or physical validation claim.")
 d["editorial_template"]={"path":base.relative_to(ROOT).as_posix(),"sha256":sha(base),"scope":"Ordered workflow scaffold only; exact2023 BHR-2819U-10 text and diagrams control claims."}
 for s in d["steps"]:
  s["source_pdf_pages"]=sorted(set(PAGES.get(n,n) for n in s["source_pdf_pages"]))
  if s["id"] in ["engine-cooling-fill","engine-cooling-recheck"]:
   s["source_pdf_pages"]=sorted(set(s["source_pdf_pages"]+[99]))
   s["instruction"]=s["instruction"].replace("illustrated in PDF100","illustrated in PDF99")
  if s["id"]=="engine-cooling-seal":s["source_pdf_pages"]=[100]
  if s["id"]=="engine-access-body-install":
   s["source_pdf_pages"]=sorted(set(s["source_pdf_pages"]+[96]))
   s["instruction"]+=" Restore the fuel-tank breather hose: protected end in the steering-shaft hole, other end on the fuel-cap projection, hose through the cover guide and seated in its groove as shown in PDF96."
  if s["id"]=="rear-brake-refit":s["instruction"]=s["instruction"].replace("with paint mark UP, no excessive twist", "with the exact illustrated route, no excessive twist")
  if s["id"]=="loom-control-refit":s["source_pdf_pages"]=sorted(set(s["source_pdf_pages"]+[57]))
  if s["id"]=="front-master-refit":s["source_pdf_pages"]=sorted(set(s["source_pdf_pages"]+[160,161]))
  s["source_links"]=[{"title":"Yamaha2023 owner/service manual, PDF"+str(n),"url":URL+"#page="+str(n)} for n in s["source_pdf_pages"]]+[x for x in s["source_links"] if "ymcapps" not in (x["url"] if isinstance(x,dict) else x)]
 for part in d["required_parts"]:
  if "purpose" in part:part["purpose"]=part["purpose"].replace("OEM23 new circlip","OEM22 new circlip")
 for tool in d["required_tools"]:
  if isinstance(tool,dict) and "source_pdf_page" in tool:tool["source_pdf_page"]=PAGES.get(tool["source_pdf_page"],tool["source_pdf_page"])
 d["source"]["pdf_pages"]=sorted(set(n for s in d["steps"] for n in s["source_pdf_pages"]))
 d["source"]["printed_pages"]=list(dict.fromkeys(label for n in d["source"]["pdf_pages"] for b in pdf[n-1].get_text("blocks") if b[1]>pdf[n-1].rect.height-75 for label in re.findall(r"^\d{1,2}-\d{1,3}$",b[4],re.M)))
 wr(out,d);print(name,len(d["steps"]),sha(out))
m=rd(BASE/"source-review-manifest.json");m.update(id="yamaha-2023-frame-pass11",status="PENDING_INDEPENDENT_REVIEW");m.pop("independent_review",None)
m["sources"][0].update(id="yamaha-2023-bhr",url=URL,local_pdf_path=SOURCE.as_posix(),sha256=sha(SOURCE))
m["artifacts"]=[]
for name in NAMES:
 p=HERE/name
 if not p.exists():continue
 d=rd(p);m["artifacts"].append({"path":name,"kind":"procedure","sha256":sha(p),"source_id":"yamaha-2023-bhr","target":d["target"],"step_count":len(d["steps"])})
wr(HERE/"source-review-manifest.json",m)
