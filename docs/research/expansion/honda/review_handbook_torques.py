"""Apply the bounded September 13 visual review; no cross-year inheritance."""
from pathlib import Path
import json,re,hashlib
OUT=Path(__file__).parent
EXPECTED={'2022-crf250r':61,'2023-crf250r':61,'2024-crf250r':61,'2025-crf250r':63,'2026-crf250r':63,'2022-crf450r':58,'2023-crf450r':58,'2024-crf450r':58,'2025-crf450r':58,'2026-crf450r':58}
REVIEWED_HASHES={'2022-crf250r': '6bb82e92779c1a6dab33314b6dcb8b02cf2baf14f43edd13bac088447a7b060d', '2025-crf450r': '81d5baf97ec65b2828bfb0251ecac60bb180d49d1f43a878cf3e9bb1b66b09d0', '2023-crf250r': '9572b4ee71a7029b9a78146c4a207bd6ecb763643b9a8ea6cab3584e03757b59', '2025-crf250r': '648251e727fadcf3c0a297462f026f75f315f754b7897ebf0b3194b222be857b', '2026-crf250r': '93db2951a84fcd973c5f9cf87ece0a05452df8d24ddc86ee2cc3ef14001d64ad', '2024-crf450r': '15551ba9b237cffff0c3b2052335f55ac959bde733daa9d237475f484e8030cd', '2026-crf450r': '676df763129d63c4bb76e28624158b1d310c71499ab736a7c544c898f69e3819', '2024-crf250r': '3388e50048f0a99edffda9653f9457bcba8d51ba6529e2c9d4f8352ac19017e8', '2022-crf450r': '24cf776173f95eab9ea06826dd43562acc1c81680a14abcd292c467c68e79d8a', '2023-crf450r': '29bd02fc18fd2ff07737ab3b93412dd1f00cc3b8567502a602bbfd51682e0df4'}
for name,count in EXPECTED.items():
 p=OUT/(name+'.json');d=json.loads(p.read_text());assert len(d['facts'])==count
 assert d['source_document']['sha256']==REVIEWED_HASHES[name], 'Changed source requires fresh review'
 model=d['target']['model'];year=d['target']['model_year'];pdf=Path(f'/tmp/{year}-{model}-ch.pdf');assert hashlib.sha256(pdf.read_bytes()).hexdigest()==d['source_document']['sha256']
 for f in d['facts']:
  assert f['value']>0 and f['unit']=='N·m'
  assert not ('RX' in f['joint'] or 'RWE' in f['joint'])
  # Manual review removes neighboring non-torque row pointer attached by extraction.
  if f['joint'] in ('Exhaust pipe joint nut','ECM cover bolt','ECM cover socket bolt'):
   f['conditions']=[x for x in f['conditions'] if not x.startswith('')]
  f['review_status']='APPROVED'
  f['review_note']='OEM exact-year US competition handbook; all torque table pages rendered and visually checked on 2026-09-13. Numeric N·m, named joint, standard-model scope and row remarks checked; RX/Works-only rows excluded. Approval applies to the named torque fact, not to every catalog occurrence or a complete repair procedure.'
  f['reviewer_id']='bakmx-honda-source-review-20260913'
  f['approval_reference']='docs/research/expansion/honda/REVIEW.md'
  if 'Cylinder head' in f['joint'] and f['value'] in [48,50]:
   f['conditions'].append('Final torque only; follow OEM gradual tightening pattern and sequence. Do not apply final torque in a single uncontrolled step.')
  f['id']=f'honda-{year}-{model.lower()}-torque-'+re.sub(r'[^a-z0-9]+','-',f['joint'].lower()).strip('-')
 assert len({f['id'] for f in d['facts']})==len(d['facts'])
 d['gaps']=[x for x in d['gaps'] if 'visual review' not in x]
 d['gaps'].append('Standard torque fallback rules not assigned to parts by thread diameter alone; precise fastener identity and exceptions must be established.')
 d['review']={'reviewer':'bakmx-honda-source-review-20260913','decision':'APPROVED_NAMED_TORQUE_FACTS','reviewed_pdf_pages':d['source_document']['torque_pdf_pages'],'approval_reference':'docs/research/expansion/honda/REVIEW.md'}
 p.write_text(json.dumps(d,indent=2)+'\n')
print('Approved',sum(EXPECTED.values()),'named torque facts in',len(EXPECTED),'exact model-years. Catalogs remain incomplete.')
