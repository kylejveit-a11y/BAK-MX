"""Print the upsert for public.trail_lines from docs/research/riding-areas/trail-lines.json (run it in the MX database).
Lines are encoded polylines (stored as a JSON string); re-running replaces lines by id."""
import json
rows = json.load(open('docs/research/riding-areas/trail-lines.json'))
for r in rows: r.pop('vehicles', None)
body = json.dumps(rows, separators=(',', ':')).replace("'", "''")
print("insert into public.trail_lines(id,track_id,source,source_id,name,number,width,dates_open,miles,line,map_date) "
      "select id,track_id,'usfs_mvum',source_id,name,number,width,dates_open,miles,to_jsonb(line),map_date::date from jsonb_to_recordset('" + body + "'::jsonb) "
      "as x(id text,track_id text,source_id text,name text,number text,width text,dates_open text,miles numeric,line text,map_date text) "
      "on conflict (id) do update set name=excluded.name,number=excluded.number,width=excluded.width,dates_open=excluded.dates_open,"
      "miles=excluded.miles,line=excluded.line,map_date=excluded.map_date,loaded_at=now();")
