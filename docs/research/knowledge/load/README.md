Load batches for `public.bike_knowledge`: research records already expanded and anonymised by
`scripts/knowledge/build_rows.py`, grouped per record with their bike-year targets (`t`). The database pulls each file at a
pinned commit with the `http` extension and upserts one row per target (id `<research id>|<make>|<model>|<year>`).

Make batches with `python3 scripts/knowledge/pack_load.py <id prefix> <name>`, commit and push, then run (MX project only):

```sql
with src as (select (extensions.http_get('https://raw.githubusercontent.com/kylejveit-a11y/BAK-MX/<sha>/docs/research/knowledge/load/<name>-'||f||'.json')).content::jsonb j from generate_series(0,<n-1>) f)
insert into bike_knowledge(id,manufacturer,model,model_year,domain,topic,statement,vals,tier,source,confidence,notes,status,research_id)
select r.research_id||'|'||(e.v->>0)||'|'||(e.v->>1)||'|'||(e.v->>2),e.v->>0,e.v->>1,(e.v->>2)::int,r.domain,r.topic,r.statement,coalesce(r.vals,'{}'),r.tier,r.source,r.confidence,r.notes,r.status,r.research_id
from src cross join jsonb_to_recordset(src.j) r(research_id text,domain text,topic text,statement text,vals jsonb,tier text,confidence text,notes text,source jsonb,status text,t jsonb) cross join lateral jsonb_array_elements(r.t) e(v)
on conflict(id) do update set domain=excluded.domain,topic=excluded.topic,statement=excluded.statement,vals=excluded.vals,tier=excluded.tier,source=excluded.source,confidence=excluded.confidence,notes=excluded.notes,status=excluded.status;
```
