"""Append bounded, visually transcribed frame-table rows; never infer procedure steps.

Usage: python extract_honda_2005_chassis_torques.py /path/to/original/pdfs
Run after the base 2005 Honda extractors. Idempotent for this torque batch.
Rows encode diagram item | joint | N.m | table remark codes. Each model's
table is transcribed independently; shared mini manual explicitly covers R/RB.
"""
import hashlib
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).parent
TABLES = {
    'cr125r': (129, 125, '''
1|Steering stem nut|108|
2|Fork bridge upper pinch bolts|22|
3|Fork bridge lower pinch bolts|20|
4|Handlebar upper holders|22|
5|Handlebar lower holder nut|44|
6|Front axle nut|88|
7|Front axle pinch bolts|20|
8|Rear axle nut|128|U
9|Chain adjust lock nut|27|UBS
10|Engine mounting bolts|54|
11|Engine hanger plate bolts|34|
12|Shock absorber upper|44|U
12|Shock absorber lower|44|U
13|Swingarm pivot nut|88|U
14|Fork cap|30|
15|Rear shock arm swingarm side|53|O,U
15|Rear shock arm shock link side|53|O,U
16|Rear shock link nuts frame side|53|O,U
17|Shock spring lock nut|29|
18|Kickstarter arm bolt|38|
19|Front brake master cylinder holder|9.9|
20|Brake hose bolts|34|
'''),
    'cr250r': (129, 125, '''
1|Steering stem nut|108|
2|Fork bridge upper pinch bolts|22|
3|Fork bridge lower pinch bolts|20|
4|Handlebar upper holders|22|
5|Handlebar lower holder nut|44|
6|Front axle nut|88|
7|Front axle pinch bolts|20|
8|Rear axle nut|128|U
9|Chain adjust lock nut|27|UBS
10|Engine mounting bolts|54|
11|Engine hanger plate bolt engine side|54|
12|Engine hanger plate bolts frame side|34|
13|Shock absorber upper|44|U
13|Shock absorber lower|44|U
14|Swingarm pivot nut|88|U
15|Fork damper|34|
15|Fork cap|30|
16|Rear shock arm swingarm side|53|O,U
16|Rear shock arm shock link side|53|O,U
17|Rear shock link nuts frame side|53|O,U
18|Shock spring lock nut|44|
19|Kickstarter arm bolt|38|
20|Front brake master cylinder holder|9.9|
21|Brake hose bolts|34|
'''),
    'crf250r': (145, 141, '''
1|Steering stem nut|108|
2|Fork bridge upper pinch bolts|22|
3|Fork bridge lower pinch bolts|20|
4|Handlebar upper holder bolts|22|
5|Handlebar holder nuts|44|
6|Front axle nut|88|
7|Front axle pinch bolts|20|
8|Rear axle nut|128|U
9|Chain adjuster lock nuts|27|UBS
10|Engine mounting bolts|64|
11|Front engine hanger bracket bolts|64|
12|Mid engine hanger bracket bolt|64|
13|Upper engine hanger plate bolts engine side|54|
14|Shock absorber upper|44|U
14|Shock absorber lower|44|U
15|Swingarm pivot nut|88|U
16|Fork damper|34|
16|Fork cap|30|
17|Rear shock arm nuts swingarm side|52|U,O
17|Rear shock arm nuts shock link side|52|U,O
18|Rear shock link nuts frame side|53|U,O
19|Shock spring lock nut|44|
20|Kickstarter arm bolt|38|
'''),
    'crf450r': (149, 145, '''
1|Steering stem nut|108|
2|Fork bridge upper pinch bolts|22|
3|Fork bridge lower pinch bolts|20|
4|Handlebar upper holder bolts|22|
5|Handlebar holder nuts|44|
6|Front axle nut|88|
7|Front axle pinch bolts|20|
8|Rear axle nut|128|U
9|Chain adjuster lock nuts|27|UBS
10|Front engine mounting bolt|59|
11|Engine mounting bolt|59|
12|Upper engine hanger plate bolts engine side|59|
12|Upper engine hanger plate bolts frame side|26|
13|Shock absorber upper|44|U
13|Shock absorber lower|44|U
14|Swingarm pivot nut|88|U
15|Fork damper|34|
15|Fork cap|30|
16|Rear shock arm nuts swingarm side|53|U,O
16|Rear shock arm nuts shock link side|53|U,O
17|Rear shock link nuts frame side|53|U,O
18|Shock spring lock nut|44|
19|Kickstarter arm bolt|38|
'''),
    'cr85r_rb': (113, 109, '''
1|Steering stem nut|128|
2|Top thread nut|5.9|
3|Fork bridge upper pinch bolts|22|
4|Fork bridge lower pinch bolts|22|
5|Handlebar upper holders|22|
6|Throttle holder|10|
7|Brake lever pivot|5.9|
8|Clutch lever pivot|1|
9|Clutch lever pivot nut|5.9|
10|Front brake master cylinder holder|12|
11|Brake hose guide bolt|5.2|
12|Front axle nut|62|U
13|Rear axle nut|88|U
14|Engine hanger bolts|32|
15|Shock absorber upper|44|U
15|Shock absorber lower|44|
16|Swingarm pivot nut|78|
17|Fork cap|34|
18|Rear shock arm swingarm side|59|U
18|Rear shock arm shock link side|59|U
19|Rear shock link nuts frame side|59|U
20|Shock spring lock nut|88|
'''),
}
NOTES = {'U': 'Table remark: U-nut.', 'UBS': 'Table remark: UBS nut.',
         'O': 'Table remark: apply oil to the threads and flange surface.',
         'L': 'Table remark: apply Honda Thread Lock or equivalent to the threads.',
         'A': 'Table remark: Alock bolt.', 'SH': 'Table remark: SH bolt.'}
TABLES.update({
    'cr125r_second': (130, 126, '''
21|Caliper mount bolts|30|L
22|Front brake disc nuts|16|U
23|Rear brake disc nuts|16|U
24|Brake pedal pivot bolt|36|
25|Front spokes|3.68|
25|Rear spokes|3.7|
26|Rim locks|12|
27|Subframe bolt upper|30|
27|Subframe bolt lower|30|
28|Fork center bolt|54|
29|Fork piston rod lock nut|28|
30|Disc cover bolt|13|
31|Fork protector bolts|7|L
32|Expansion chamber mounting bolt front stay|12|
33|Sprocket nuts|32|U
34|Seat mounting bolts|27|
35|Front brake reservoir cap screw|1|
36|Rear brake reservoir cap bolt|1|
37|Fork air plug|1.2|
38|Upper chain roller|12|SH
39|Lower chain roller|12|U
'''),
    'cr250r_second': (130, 126, '''
22|Caliper mount bolts|30|L
23|Front brake disc nuts|16|U
24|Rear brake disc nuts|16|U
25|Brake pedal pivot bolt|36|
26|Front spokes|3.68|
26|Rear spokes|3.7|
27|Rim locks|12|
28|Subframe bolt upper|30|
28|Subframe bolt lower|30|
29|Fork center bolt|69|
30|Fork center lock nut|22|
31|Disc cover bolt|13|
32|Fork protector bolts|7|L
33|Sprocket nuts|32|U
34|Seat mounting bolts|27|
35|Front brake reservoir cap screw|1.0|
36|Rear brake reservoir cap bolt|1|
37|Fork air plug|1.2|
38|Upper chain roller|12|SH
39|Lower chain roller|12|U
'''),
    'crf250r_second': (146, 142, '''
21|Front brake master cylinder holder bolts|9.9|
22|Brake hose bolts|34|
23|Caliper mounting bolts|30|A
24|Front brake disc nuts|16|U
25|Rear brake disc nuts|16|U
26|Brake pedal pivot bolt|31|
27|Front spoke|3.68|
28|Rear spoke|3.7|
29|Rim locks|13|
30|Subframe bolts upper|30|
30|Subframe bolts lower|49|
31|Fork center bolt|69|
32|Fork center lock nut|22|
33|Disc cover bolts|13|
34|Fork protector bolts|7|A
35|Muffler mounting bolts front|26|
35|Muffler mounting bolts rear|26|
36|Muffler clamp bolt|21|
37|Sprocket nuts|32|U
38|Seat mounting bolts|26|
39|Front brake reservoir cap screws|1.0|
40|Rear brake reservoir cap bolts|1.0|
41|Fork air pressure release screw|1.2|
'''),
    'crf450r_second': (150, 146, '''
20|Front brake master cylinder holder bolts|9.9|
21|Brake hose bolts|34|
22|Front brake caliper mounting bolts|30|A
23|Front brake disc nuts|16|U
24|Rear brake disc nuts|16|U
25|Brake pedal pivot bolt|31|
26|Front spoke|3.68|
26|Rear spoke|3.7|
27|Rim locks|12|
28|Drive chain roller upper|12|SH
28|Drive chain roller lower|12|U
29|Subframe bolts upper|30|
29|Subframe bolts lower|49|
30|Fork center bolt|69|
31|Fork center lock nut|22|
32|Disc cover bolts|13|
33|Fork protector bolts|7|A
34|Muffler mounting bolts front|21|
34|Muffler mounting bolts rear|21|
35|Muffler clamp bolt|21|
36|Sprocket nuts|32|U
37|Seat mounting bolts|26|
38|Front brake reservoir cap screws|1.0|
39|Rear brake reservoir cap bolts|1.0|
40|Fork air pressure release screw|1.2|
'''),
    'cr85r_rb_second': (114, 110, '''
21|Caliper mount bolts front|30|
21|Caliper mount bolts rear|15|
22|Front brake disc nuts|20|U
23|Rear brake disc nuts|20|U
24|Brake pedal pivot bolt|32|
25|Shift lever|16|
26|Spokes|3.7|
27|Rim locks|12.4|
28|Subframe bolt upper|22|
28|Subframe bolt lower|22|
29|Fork piston rod lock nut|19.7|
30|Fork protector bolts|7|L
31|Expansion chamber mounting bolt front stay|8.8|
32|Sprocket nuts drive|13|U
32|Sprocket nuts driven|32|
33|Seat mounting bolts|26|
34|Fork air plug|1.3|
'''),
})


def main():
    source_dir = pathlib.Path(sys.argv[1])
    for table_key, (pdf_page, printed_page, rows) in TABLES.items():
        source_name = table_key.removesuffix('_second')
        models = ['cr85r', 'cr85rb'] if source_name == 'cr85r_rb' else [source_name]
        digest = hashlib.sha256((source_dir / f'2005_{source_name}.pdf').read_bytes()).hexdigest()
        for model in models:
            path = ROOT / f'2005-{model}-candidates.json'
            data = json.loads(path.read_text())
            base = data['facts'][0]
            assert digest == base['document_sha256']
            prefix = f'honda-2005-{model}-chassis-torque-'
            if not table_key.endswith('_second'):
                data['facts'] = [f for f in data['facts'] if not f['id'].startswith(prefix)]
            for row in rows.strip().splitlines():
                item, joint, value, codes = row.split('|')
                conditions = [
                    'Exact 2005 US stock model only; no cross-year or aftermarket inheritance.',
                    f'Frame torque table and diagram item {item}; follow the matching manufacturer service procedure.',
                    'Table-only candidate: tightening sequence, replacement requirements and procedure-specific preparation remain to be reconciled. A blank remark is not a dry-thread instruction.',
                ] + [NOTES[c] for c in codes.split(',') if c]
                data['facts'].append(dict(base,
                    id=prefix + re.sub(r'[^a-z0-9]+', '-', joint.lower()).strip('-'),
                    property='torque', joint='Chassis torque / ' + joint,
                    value=value, unit='N·m', conditions=conditions,
                    locator=f'PDF page {pdf_page}; printed page {printed_page}',
                    review_note='Frame table, diagram item and remark alignment visually inspected. Independent review and procedure reconciliation pending.'))
            path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n')
            print(model, len(data['facts']))


if __name__ == '__main__':
    main()
