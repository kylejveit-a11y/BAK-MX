"""Payloads for private.stage_manual_rows from the carburetor tuning charts read by jetting.py.
usage: build_jetting.py <jet.jsonl> <docs.tsv> <out dir>
One row per chart cell: path "Carburetor tuning[ (chart)] / <elevation band> / <temperature band>", value = the settings
printed in that cell. Cells the maker leaves empty are not stored."""
import sys,json,hashlib,os,re,collections
def h(s): return hashlib.sha256(s.encode()).hexdigest()
LABEL={'ASO':'idle air screw {} turns open','PS':'pilot screw {} turns out','IJ':'idling jet {}','PJ':'pilot jet {}','SJ':'slow jet {}','NDL':'jet needle {}','JN':'jet needle {}','POS':'needle clip position {} from top','CLIP':'needle clip position {} from top','MJ':'main jet {}'}
ORDER=['ASO','PS','IJ','PJ','SJ','NDL','JN','POS','CLIP','MJ']
def clean(v): return re.sub(r'^(\d+),(\d)$',r'\1.\2',v.replace('‑','-').strip())   # "1,5" / "32,5" printed with a decimal comma
def g(x): return f'{x:,.0f}' if float(x).is_integer() else f'{x:g}'
def chart_for(name,model):
    n=name.lower()
    if n in ('standard',): return ''
    if n.startswith('optional'): return f' ({n})'
    m=re.fullmatch(r'(?:all )?(125|150|250|300)(?: sx| models)',n)
    if m: return '' if model.startswith(m.group(1)+' SX') or (n.startswith('all') and model.startswith(m.group(1)+' ')) else None
    if re.fullmatch(r'\d+ xc.*',n): return None
    n=re.sub(r'^option:\s*','',n).replace('seating','seat')
    return f' ({n})'
def main():
    jets=[json.loads(l) for l in open(sys.argv[1])]; bikes=collections.defaultdict(list)
    for l in open(sys.argv[2]):
        if l.startswith('#') or not l.strip(): continue
        d,make,model,yr=l.rstrip('\n').split('\t'); bikes[d].append((make,model,int(yr)))
    out=sys.argv[3]; os.makedirs(out,exist_ok=True); i=0; summary=[]
    for j in jets:
        if not j.get('charts'): continue
        for make,model,yr in bikes[j['doc']]:
            rows=[]
            for name,bands in j['charts'].items():
                lab=chart_for(name,model)
                if lab is None: continue
                for b in bands:
                    for c in b['cells']:
                        s=c['settings']
                        if not s: continue
                        t=c['temp']
                        path=(f"Carburetor tuning{lab} / {g(b['m'][0])} to {g(b['m'][1])} m ({g(b['ft'][0])} to {g(b['ft'][1])} ft) / "
                              f"{g(t['c'][0])} to {g(t['c'][1])} °C ({g(t['f'][0])} to {g(t['f'][1])} °F)")
                        val='; '.join(LABEL.get(k,k+' {}').format(clean(s[k])) for k in sorted(s,key=lambda k:ORDER.index(k) if k in ORDER else 99))
                        rows.append((b['pdf'],b['printed'],path,val))
            if not rows: summary.append({'doc':j['doc'],'make':make,'model':model,'yr':yr,'skipped':'no chart for this model'}); continue
            assert len({r[2] for r in rows})==len(rows),(j['doc'],model)
            lines=[f'{a}|{p}|{q}|{v}|' for a,p,q,v in sorted(rows,key=lambda r:h(r[2]))]
            i+=1
            if j.get('url'): url,rev,ref=j['url'],j['rev'],j['ref']
            else:
                art=j['doc'].split('_')[1]; url=f"https://azwecdnepstoragewebsiteuploads.azureedge.net/{j['doc']}.pdf"
                rev=f"{make} Owner's Manual {yr}; Art. no. {art}{j['doc'].split('_')[2]}"
                ref=f"docs/research/expansion/ktm-group/jetting/REVIEW_2026-11-03.md; {j['doc']}; carburetor tuning chart read from the text layer by column position; every main jet, idling jet and idle air screw row matched a second read with pdftotext."
            rec={'make':make,'model':model,'yr':yr,'doc':j['doc'],'sha':j['sha'],'url':url,'rev':rev,'ref':ref,
                 'want':h('\n'.join(lines)),'delta':'\n'.join('+|'+l for l in lines),'n':len(rows)}
            json.dump(rec,open(f'{out}/{i}.json','w'),ensure_ascii=False)
            summary.append({'i':i,'doc':j['doc'],'make':make,'model':model,'yr':yr,'n':len(rows),'charts':sorted({r[2].split(' / ')[0] for r in rows})})
    json.dump(summary,open(out+'/summary.json','w'),ensure_ascii=False,indent=1)
    print(i,'payloads',sum(s.get('n',0) for s in summary),'rows; skipped',[(s['model'],s['yr']) for s in summary if 'skipped' in s])
if __name__=='__main__': main()
