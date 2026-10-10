"""Resume only the two interrupted catalogs; never replace captured groups."""
import hashlib, html, http.cookiejar, json, pathlib, re, urllib.parse, urllib.request

OUT = pathlib.Path(__file__).parent
BASE = 'https://sparepartsfinder.gasgas.com'

def resume(year):
    path = OUT / f'mc-450f-{year}.json'
    obj = json.loads(path.read_text(encoding='utf-8'))
    ident = obj['catalog_model_identifier']
    op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
    def fetch(url, data=None):
        req = urllib.request.Request(url, data=data, headers={'X-Requested-With': 'XMLHttpRequest'} if data else {})
        return op.open(req, timeout=45).read()
    def save():
        path.write_text(json.dumps(obj, indent=2, ensure_ascii=False)+'\n', encoding='utf-8')
    links = {}
    for engine in ['False', 'True']:
        url = BASE+'/Result/ExecuteSearch?modelIdentification='+ident+'&isEngine='+engine
        source = html.unescape(html.unescape(fetch(url).decode()))
        for match in re.finditer(r'<a\s+href="(/ComponentGroupTemplate/Index/\d+\?modelidentifier='+ident+r'&isEngine='+engine+r')"[^>]*>(.*?)</a>', source, re.S):
            title = re.search(r'title="([^"]+)"', match[0])
            gid = re.search(r'/Index/(\d+)', match[1])[1]
            links[gid] = {'id': gid, 'name': title[1] if title else re.sub('<[^>]+>', '', match[2]).strip(), 'source_url': BASE+match[1]}
    if len(links) != obj['expected_assembly_count']:
        raise ValueError(f'Catalog denominator changed: {len(links)} vs {obj["expected_assembly_count"]}')
    existing = {a['id']: a for a in obj['assemblies']}
    if set(existing)-set(links):
        raise ValueError('Previously captured group missing from live index')
    for gid, a in links.items():
        if gid in existing:
            if existing[gid].get('source_response_sha256') and not existing[gid].get('error'):
                continue
            raise ValueError('Existing incomplete group requires explicit reconciliation: '+gid)
        source = fetch(a['source_url']).decode()
        route = re.search(r'"read":\{"url":"([^"]+)"', source)
        if not route:
            raise ValueError('No observed public read route on group '+gid)
        endpoint = json.loads('"'+route[1]+'"')
        raw = fetch(BASE+endpoint, urllib.parse.urlencode({'id': gid, 'partType': 1, 'sort': 'SequenceNumber-asc'}).encode())
        response = json.loads(raw)
        rows = response['Data']
        if len(rows) != response['Total']:
            raise ValueError('Incomplete response '+gid)
        digest = hashlib.sha256(raw).hexdigest()
        (OUT/'source-captures'/f'{digest}.json').write_bytes(raw)
        seen, pn, parts, duplicates = set(), set(), [], []
        for row in rows:
            key = (row['SequenceNumber'], row['ArticleNumber'])
            pn.add(row['ArticleNumber'])
            if key in seen:
                duplicates.append({'assembly_id': gid, 'row': row})
                continue
            seen.add(key)
            q = row['Quantity']
            parts.append({'assembly_id': gid, 'callout': str(row['SequenceNumber']), 'part_number': row['ArticleNumber'], 'description': row['ArticleDescription'], 'additional_text': row['ArticleAdditionalText'], 'quantity': q if q > 0 else None, 'catalog_quantity': q, 'source_url': a['source_url'], 'quantity_basis': 'OEM_CATALOG'})
        diagram = set(html.unescape(x) for x in re.findall(r'data-article-number="([^"]+)"', source))
        a.update(expected_occurrences=response['Total'], enumeration_checked=False, source_response_sha256=digest, diagram_part_count=len(diagram), diagram_missing_part_numbers=sorted(diagram-pn), captured_occurrences=len(seen))
        obj['assemblies'].append(a)
        obj['parts'].extend(parts)
        obj['raw_duplicate_rows'].extend(duplicates)
        save()
        print(year, gid, len(parts), 'added; total', len(obj['parts']), flush=True)
    obj['catalog_manifest'] = {'source_url': BASE+'/Result/ExecuteSearch?modelIdentification='+ident+'&isEngine=False', 'engine_source_url': BASE+'/Result/ExecuteSearch?modelIdentification='+ident+'&isEngine=True', 'expected_assembly_ids': list(links), 'review_note': 'Resumed only missing groups. OEM Total reconciled against unique occurrence rows plus separately retained duplicate rows; literal JS template placeholders and case-only diagram aliases excluded.'}
    for a in obj['assemblies']:
        placeholders = [x for x in a.get('diagram_missing_part_numbers', []) if x.startswith('${')]
        missing = [x for x in a.get('diagram_missing_part_numbers', []) if not x.startswith('${')]
        a['diagram_part_count'] -= len(placeholders)
        rows = [r for r in obj['parts'] if r['assembly_id'] == a['id']]
        dups = [r for r in obj['raw_duplicate_rows'] if r['assembly_id'] == a['id']]
        known = {r['part_number'].upper() for r in rows}
        a['case_only_diagram_aliases'] = [x for x in missing if x.upper() in known]
        a['diagram_missing_part_numbers'] = [x for x in missing if x.upper() not in known]
        a.setdefault('source_expected_occurrences', a['expected_occurrences'])
        a['raw_row_count'] = len(rows)+len(dups)
        a['enumeration_checked'] = not a.get('error') and a['raw_row_count'] == a['source_expected_occurrences'] and not a['diagram_missing_part_numbers']
        if a['enumeration_checked']:
            a['expected_occurrences'] = len(rows)
        a['enumeration_review_note'] = 'OEM Total includes duplicate table rows, retained separately; expected_occurrences is unique assembly/callout/PN count.'
    for part in obj['parts']:
        part['quantity_basis'] = 'OEM_CATALOG'
    obj['catalog_complete'] = set(links) == {a['id'] for a in obj['assemblies']} and all(a['enumeration_checked'] for a in obj['assemblies'])
    # Scope is deliberately unchanged: enumeration does not establish US applicability.
    save()
    print('FINAL', year, len(obj['assemblies']), len(obj['parts']), obj['catalog_complete'], obj['scope_confirmed'], flush=True)

if __name__ == '__main__':
    import sys
    resume(int(sys.argv[1]))
