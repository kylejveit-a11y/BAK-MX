Load batches for `public.bike_knowledge`: research records already expanded and anonymised by
`scripts/knowledge/build_rows.py`, grouped per record with their bike-year targets (`t`). The database pulls each file at a
pinned commit with the `http` extension and upserts one row per target (id `<research id>|<make>|<model>|<year>`).
