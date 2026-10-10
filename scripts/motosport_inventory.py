"""Parse public MotoSport DOM captures without third-party dependencies.

Acquisition: navigate only observed index links using an ordinary supported browser,
save {url,title,html: document.querySelector('main').outerHTML,captured_at} per page.
Do not bypass a challenge. This parser is offline, resumable, and never writes a DB.
Run: python scripts/motosport_inventory.py --directory <capture-directory>
Expected index.json: {target, url, captured_at, assemblies:[{name,url}]}.
"""
import argparse
import hashlib
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote


class Node:
    def __init__(self, tag='', attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []

    def text(self):
        return ' '.join(''.join(c if isinstance(c, str) else c.text() + ' ' for c in self.children).split())

    def find(self, tag=None, cls=None):
        found = []
        for child in self.children:
            if isinstance(child, Node):
                if (tag is None or child.tag == tag) and (cls is None or cls in child.attrs.get('class', '').split()):
                    found.append(child)
                found.extend(child.find(tag, cls))
        return found


class Tree(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.root = Node()
        self.stack = [self.root]
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs)
        self.stack[-1].children.append(n)
        if tag not in {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}:
            self.stack.append(n)

    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1, 0, -1):
            if self.stack[i].tag == tag:
                self.stack = self.stack[:i]
                break

    def handle_data(self, data):
        self.stack[-1].children.append(data)


def first_text(node, cls):
    nodes = node.find(cls=cls)
    return nodes[0].text() if nodes else None


def parse_capture(capture, group, target):
    expected = f"{target['year']} {target['manufacturer']} {target.get('catalog_model_label', target['model'])}"
    if not capture.get('title', '').lower().startswith(expected.lower() + ' '):
        raise ValueError('Catalog title does not match exact target: ' + capture.get('title', ''))
    if unquote(urlsplit(capture['url']).path).rstrip('/') != unquote(urlsplit(group['url']).path).rstrip('/'):
        raise ValueError('Capture URL does not match indexed assembly')
    tree = Tree(capture['html']).root
    rows = []
    for row in tree.find('li'):
        if not row.find(cls='oem-count') or first_text(row, 'oem-count') == '#':
            continue
        links = [a for a in row.find('a') if '/part-number/' in a.attrs.get('href', '')]
        link = links[0] if links else None
        label = link.attrs.get('aria-label', '') if link else ''
        explicit = re.search(r'manufacturer recommends a quantity of\s+(\d+)', label, re.I)
        description_nodes = row.find(cls='oem-description')
        description = description_nodes[0].attrs.get('data-label') if description_nodes else None
        supersession = first_text(row, 'oem-supersedes')
        inputs = row.find('input')
        pn = row.attrs.get('sku')
        if not pn and link:
            pn = unquote(urlsplit(link.attrs['href']).path.split('/part-number/', 1)[1])
        rows.append({
            'occurrence_index': len(rows) + 1,
            'callout': first_text(row, 'oem-count'),
            'part_number': pn,
            'description': description or first_text(row, 'oem-description'),
            'context': first_text(row, 'oem-context'),
            'catalog_quantity': int(explicit.group(1)) if explicit else None,
            'quantity_basis': 'retailer_explicit_manufacturer_recommendation' if explicit else 'UNKNOWN',
            'quantity_evidence': label or None,
            'purchase_input_default': inputs[0].attrs.get('value') if inputs else None,
            'installed_whole_bike_quantity': None,
            'supersedes_raw': supersession,
            'supersedes_part_number': re.search(r'Supersedes:\s*([^\s(]+)', supersession).group(1) if supersession and re.search(r'Supersedes:\s*([^\s(]+)', supersession) else None,
            'part_url': link.attrs.get('href') if link else None,
            'availability': first_text(row, 'oem-msg'),
        })
    diagram = [n.attrs.get('src') for n in tree.find('img') if 'PGImage' in n.attrs.get('class', '').split()]
    if not diagram:
        raise ValueError('No diagram found; incomplete/challenged capture')
    return {'name': group['name'], 'url': group['url'], 'title': capture['title'],
            'captured_at': capture['captured_at'], 'diagram_urls': diagram,
            'status': 'CAPTURED_ROWS' if rows else 'CAPTURED_NO_PART_ROWS',
            'rows': rows}


def build(directory):
    index = json.loads((directory / 'index.json').read_text(encoding='utf-8'))
    if not index.get('assemblies') or len({g['url'] for g in index['assemblies']}) != len(index['assemblies']):
        raise ValueError('Assembly index is empty or contains duplicate URLs')
    groups, missing, errors = [], [], []
    for group in index['assemblies']:
        filename = urlsplit(group['url']).path.rstrip('/').split('/')[-1] + '.json'
        path = directory / 'captures' / filename
        if not path.exists():
            missing.append(group)
            continue
        try:
            captured = parse_capture(json.loads(path.read_text(encoding='utf-8')), group, index['target'])
            captured['evidence_file'] = str(path.relative_to(directory)).replace('\\', '/')
            captured['evidence_sha256'] = hashlib.sha256(path.read_bytes()).hexdigest()
            groups.append(captured)
        except (ValueError, KeyError) as error:
            errors.append({'url': group['url'], 'error': str(error)})
    rows = [row for group in groups for row in group['rows']]
    result = {'schema_version': 1, 'target': index['target'], 'source': 'MotoSport public OEM catalog',
              'index_url': index['url'], 'index_sha256': hashlib.sha256((directory/'index.json').read_bytes()).hexdigest(),
              'scope': 'Retail catalog occurrence inventory; not mechanical instructions or whole-bike BOM quantities.',
              'status': 'ALL_INDEXED_PAGES_CAPTURED' if not missing and not errors else 'PARTIAL',
              'counts': {'indexed_assemblies': len(index['assemblies']), 'captured_assemblies': len(groups),
                         'occurrences': len(rows), 'unique_part_numbers': len({r['part_number'] for r in rows if r['part_number']}),
                         'explicit_catalog_quantities': sum(r['catalog_quantity'] is not None for r in rows),
                         'supersession_rows': sum(bool(r['supersedes_raw']) for r in rows)},
              'missing': missing, 'errors': errors, 'assemblies': groups}
    (directory/'inventory.json').write_text(json.dumps(result, indent=2, ensure_ascii=False)+'\n', encoding='utf-8')
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--directory', type=Path, required=True)
    args = parser.parse_args()
    result = build(args.directory)
    print(json.dumps({'status': result['status'], **result['counts'], 'errors': result['errors']}))
    raise SystemExit(1 if result['errors'] else 0)
