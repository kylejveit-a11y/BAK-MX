"""Run a specialist exam against the live Ask BAK and score it (docs/plans/SPECIALISTS.md).
Usage: python3 scripts/specialists/run_exam.py <exam.json> <out.json> [workers]
Needs BAK_EVAL_TOKEN_FILE (path to the eval token). Answers are scored on everything the rider would see."""
import json,os,re,sys,time,urllib.request,concurrent.futures as cf
exam=json.load(open(sys.argv[1]));out=sys.argv[2];workers=int(sys.argv[3]) if len(sys.argv)>3 else 4
token=open(os.environ['BAK_EVAL_TOKEN_FILE']).read().strip()
done={}
if os.path.exists(out):
    done={r['id']:r for r in json.load(open(out))['results'] if r.get('ok')}
def shown(resp):
    r=resp.get('response',resp) if isinstance(resp,dict) else {}
    if not isinstance(r,dict):return ''
    parts=[r.get('answer') or '',r.get('summary') or '']
    for k in ('setup_changes','specifications','hypotheses','unknowns','next_step','safety'):
        if r.get(k):parts.append(json.dumps(r[k]))
    return '\n'.join(parts)
def ask(q):
    if q['id'] in done:return done[q['id']]
    body=json.dumps({'bike':q['bike'],'message':q['q']}).encode()
    for attempt in range(2):
        try:
            t=time.time()
            req=urllib.request.Request('https://bakmx.com/api/eval/ask',data=body,headers={'Authorization':'Bearer '+token,'Content-Type':'application/json','User-Agent':'BAKMX-exam/1.0'})
            d=json.loads(urllib.request.urlopen(req,timeout=200).read())
            text=shown(d)
            if not text.strip():raise RuntimeError('empty answer: '+json.dumps(d)[:200])
            hit=[bool(re.search(p,text,re.I|re.S)) for p in q['must']]
            bad=[p for p in q['never'] if re.search(p,text,re.I|re.S)]
            return {'id':q['id'],'ok':True,'score':sum(hit)/len(hit),'hit':hit,'bad':bad,'seconds':round(time.time()-t,1),'prompt_version':d.get('prompt_version'),'specs':len((d.get('response') or {}).get('specifications') or []),'text':text}
        except Exception as e:
            err=str(e)[:200];time.sleep(3)
    return {'id':q['id'],'ok':False,'error':err}
results=[]
with cf.ThreadPoolExecutor(workers) as ex:
    for r in ex.map(ask,exam['questions']):
        results.append(r)
        if len(results)%10==0:
            json.dump({'results':results},open(out,'w'));print(len(results),flush=True)
ok=[r for r in results if r.get('ok')]
summary={'asked':len(results),'answered':len(ok),'score':round(100*sum(r['score'] for r in ok)/max(1,len(ok)),1),'full_marks':sum(r['score']==1 for r in ok),'said_something_wrong':sum(bool(r['bad']) for r in ok),'median_seconds':sorted(r['seconds'] for r in ok)[len(ok)//2] if ok else None,'prompt_version':sorted({str(r.get('prompt_version')) for r in ok})}
json.dump({'summary':summary,'results':results},open(out,'w'),indent=1)
print(json.dumps(summary))
