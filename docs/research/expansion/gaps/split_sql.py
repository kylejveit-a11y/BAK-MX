"""Split a build_claims.py claims_N.sql into parts under ~80 KB (the database fetches each part with http_get from a pinned commit).
usage: python3 split_sql.py <folder>  -> <folder>/claims_partK.sql"""
import glob,os,sys
HERE=os.path.join(os.path.dirname(os.path.abspath(__file__)),sys.argv[1]); LIMIT=80_000
for f in glob.glob(os.path.join(HERE,'claims_part*.sql')): os.remove(f)
k=0
for src in sorted(glob.glob(os.path.join(HERE,'claims_[0-9]*.sql'))):
    s=open(src).read(); head,rest=s.split(' values\n',1); body,tail=rest.rsplit('\non conflict',1)
    rows=body.split(',\n('); rows=[rows[0]]+['('+r for r in rows[1:]]
    part=[];size=0
    def flush():
        global k
        if part: open(os.path.join(HERE,f'claims_part{k}.sql'),'w').write(head+' values\n'+',\n'.join(part)+'\non conflict'+tail); k+=1
    for r in rows:
        if size+len(r)>LIMIT and part: flush(); part=[];size=0
        part.append(r); size+=len(r)+2
    flush()
print(k,'parts')
