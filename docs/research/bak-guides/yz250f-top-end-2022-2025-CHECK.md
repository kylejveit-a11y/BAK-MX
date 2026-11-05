# YZ250F top end, 2022 and 2025 (US): check log

Entries added to `yz250f-engine.json`: `bak-yamaha-yz250f-top-end-v1`, one targeting 2022 and one targeting 2025, 47 steps each.
Template: the 2019 entry (same engine family: buckets on all four valves, no intake rocker arms, M6 nuts on the head). The 2027 entry was not used because it covers the intake rocker-arm engine.

Sources: 2022 = B7B-2819U-13 (YZ250FN), 2025 = D01-2819U-10 (YZ250FS). Page numbers are the printed ones. Diagrams were checked on the rendered pages where the text layer could not show them (ring gap layout, head cover parts, access screw lubricants and New marks).

Page offset: chapter 5 top-end pages are +4 in 2025 (camshaft section 5-14 → 5-18, and so on); chapter 3 valve clearance is +1 (3-6 → 3-7). Chapter 2 spec and torque pages match.

## Why there are two entries
2022 and 2025 match on every value except:
- Intake valve guide installed height: 2022 10.8–11.2 mm (0.43–0.44 in) (5-28); 2025 11.8–12.2 mm (0.46–0.48 in) (5-30 diagram, 5-32). Exhaust is 11.2–11.6 mm (0.44–0.46 in) in both.
- Spark plug hole seal under the head cover: 2025 diagram gives a fitted depth of 0–1.0 mm (0–0.04 in) (5-18). The 2022 diagram shows the seal as New but gives no depth (5-14).

## Step-by-step check (2022 page / 2025 page)

| Step | Values used | 2022 | 2025 |
|---|---|---|---|
| clean | none | n/a | n/a |
| cover-off | breather hose, plug, 2 cover bolts, top chain guide, gasket | 5-14 | 5-18 |
| access | timing mark screw, crank end screw, O-rings | 5-15, 5-16 | 5-19, 5-20 |
| tdc | crank counterclockwise; rotor TDC mark to cover mark; both sprocket marks level with head edge | 5-16, 3-6 | 5-20, 3-7 |
| clearance-before | cold; IN 0.12–0.19 mm, EX 0.17–0.24 mm | 2-2, 2-3, 3-6 | 2-2, 2-3, 3-7 |
| tensioner-off | cap bolt, tensioner, gasket | 5-16 | 5-20 |
| caps-off | 8 bolts crisscross outside-in, evenly; 2 caps, 2 clips | 5-15, 5-16, 2-10 | 5-19, 5-20, 2-10 |
| cams-out | exhaust then intake; wire on chain | 5-16 | 5-20 |
| head-bolts | nuts [1],[2] then bolts, 1/2 turn at a time, remove after all loose; M9 × 135 mm (5.31 in) ×3 [4][5][6], M9 × 145 mm (5.71 in) ×1 [3] | 5-21, 5-23 | 5-26, 5-27 |
| head-off | intake chain guide, dowels, gasket | 5-21, 5-22 | 5-26 |
| cylinder-off | cylinder bolt, gasket, 2 dowels | 5-33 | 5-37 |
| piston-off | cloth over case; no hammer; deburr; pin puller set 90890-01304 / YU-01304; rings off over crown | 5-34 | 5-38 |
| valve-seal-test | solvent into ports, check seats | 5-27 | 5-31 |
| lifters-out | cloth in chain tunnel; valve lapper 90890-04101 / YM-A8998; note positions | 5-27, 3-7 | 5-31, 3-8 |
| valves-out | compressor 90890-04200 / YM-04019, attachment 90890-04108 / YM-04108; cotters ×8, parts ×4 | 5-26, 5-27 | 5-30, 5-31 |
| clean-head | rounded scraper; coolant passage deposits; damage → replace head, and replace valves with a new head | 5-23 | 5-27 |
| head-warp | limit 0.05 mm (0.0020 in); 400–600 grit, figure-eight, turn head | 2-2, 5-23 | 2-2, 5-27 |
| cam-lobes | IN limit 32.130 mm (1.2650 in), EX limit 33.460 mm (1.3173 in); decompressor cam moves, lever pin projects | 2-2, 5-17, 5-18 | 2-2, 5-21, 5-22 |
| cam-clearance | Plastigauge; caps 10 Nm (7.4 lb-ft) innermost to outer; spec 0.028–0.062 mm, limit 0.080 mm (0.0032 in) | 2-2, 5-17 | 2-2, 5-21 |
| cam-journal | journal 21.959–21.972 mm; cap ID 22.000–22.021 mm; journal OK → head and caps as a set | 2-2, 5-17 | 2-2, 5-21 |
| chain-check | damage/stiffness → chain and camshaft as a set; >1/4 tooth wear → camshaft and chain; intake guide wear | 5-18, 5-23 | 5-22, 5-27 |
| tensioner-check | wind fully clockwise, release, rod must come out smoothly | 5-18 | 5-22 |
| guides | guide ID IN 5.000–5.012, EX 4.500–4.512 mm; stem limit IN 4.945, EX 4.430 mm; clearance limit IN 0.080, EX 0.100 mm; 100 °C (212 °F); installed height (see differences); reface seat after | 2-3, 5-28, 5-29 | 2-3, 5-32, 5-33 |
| valves | face pitting/wear → grind; mushroomed stem end → replace; stem runout 0.020 mm (0.0008 in); new valve → new guide | 2-3, 5-29 | 2-3, 5-33 |
| seats | contact width limit IN 1.6 mm, EX 1.6 mm; pitting/wear → replace head; titanium valves, lapping valve must not be reused; coarse then fine compound | 2-3, 5-29, 5-30 | 2-3, 5-33, 5-34 |
| springs | free length limit IN 34.94 mm (1.38 in), EX 33.82 mm (1.33 in) | 2-3, 5-30, 5-31 | 2-3, 5-34, 5-35 |
| lifters-check | damage/scratches → lifters and head | 5-31 | 5-35 |
| bore | vertical scratches → cylinder, piston, rings as set; 6 readings, take max; bore 77.000–77.010 mm, limit 77.060 mm | 2-3, 5-34 | 2-3, 5-38 |
| piston | measuring point 4.0 mm (0.16 in); diameter 76.955–76.970 mm; clearance 0.030–0.055 mm; out → cylinder/piston/rings as set or rebore | 2-3, 5-34, 5-35 | 2-3, 5-38, 5-39 |
| rings | side clearance 0.030–0.065 mm, limit 0.115 mm; end gap measured near bottom of bore; end gap limit 0.50 mm (0.0197 in); oil ring expander not measurable | 2-3, 5-35 | 2-3, 5-39 |
| pin | pin OD limit 15.971 mm (0.6288 in); pin bore limit 16.043 mm (0.6316 in); pin-to-bore clearance 0.002–0.022 mm (0.0001–0.0009 in) | 2-3, 5-35, 5-36 | 2-3, 5-39, 5-40 |
| decide-bottom | none | n/a | n/a |
| valves-in | moly oil on stem and stem seal; seal New; larger pitch up; soft-face hammer | 5-31, 5-32 | 5-35, 5-36 |
| lifters-in | engine oil on pads and lifters; original positions; turns by finger; numbers up; no forcing | 5-32, 3-7, 3-8 | 5-36, 3-8, 3-9 |
| rings-on | expander, lower rail, upper rail, top ring; marks up; gap layout: expander at piston mark, rails 15° either side, top ring opposite side 15° off centre line | 5-36, 5-37 (diagram) | 5-40, 5-41 (diagram) |
| piston-on | engine oil on pin; mark to exhaust (rear); clips New; clip end not at cut-out; cloth over case | 5-36 | 5-40 |
| cylinder-on | gasket New, dowels; oil piston, rings, bore; cylinder bolt 10 Nm (7.4 lb-ft); chain and exhaust guide through | 5-37, 2-10 | 5-41, 2-10 |
| head-on | intake chain guide, dowels, head gasket New; pull chain up | 5-23 | 5-27 |
| head-torque | wash; moly grease on threads, seats, both washer faces; [1]–[4] 30 Nm (22 lb-ft) in 2–3 steps; one at a time remove, re-grease, 15 Nm (11 lb-ft), mark, +60°; final +60° all in order, total 120°; nuts [5][6] 10 Nm (7.4 lb-ft) last | 5-24, 5-25, 2-12 | 5-28, 5-29, 2-12 |
| cams-in | moly oil on cams; engine oil on decompressor; oil to lifter tops; crank counterclockwise to TDC; sprocket marks to head edge; cloth over head before clips; engine oil on cap bolt threads and seats; 10 Nm (7.4 lb-ft) in 2–3 steps in sequence 1–8 (inner first); do not turn crank | 5-19, 2-10 | 5-23, 2-10 |
| tensioner-on | wind fully clockwise; UP mark up; gasket New; bolts 10 Nm (7.4 lb-ft); release, rod comes out; cap bolt gasket New, 6 Nm (4.4 lb-ft) | 5-15, 5-19, 5-20, 2-10 | 5-19, 5-23, 5-24, 2-10 |
| turn-check | crank counterclockwise several turns; rotor TDC mark and cam match marks realign | 5-20 | 5-24 |
| clearance-after | IN 0.12–0.19 mm, EX 0.17–0.24 mm | 2-2, 2-3, 3-6 | 2-2, 2-3, 3-7 |
| shims | last-digit rounding 0/1/2 → 0, 4/5/6 → 5, 8/9 → 10 (148 → 150); 25 pads 1.20–2.40 mm in 0.05 mm steps; moly oil on stem ends, engine oil on lifters, numbers up | 3-7, 3-8 | 3-8, 3-9 |
| cover-on | top chain guide; cover gasket New with Yamaha Bond No. 1215 (90890-85505); spark plug hole seal New (2025: 0–1.0 mm fitted depth); cover bolts 10 Nm (7.4 lb-ft); breather hose | 5-14, 5-20 | 5-18, 5-24 |
| plugs | O-rings: lithium-soap grease (crank end O-ring New); threads: engine oil; timing mark screw 6 Nm (4.4 lb-ft), crank end screw 10 Nm (7.4 lb-ft); spark plug 13 Nm (9.6 lb-ft) | 5-15, 2-9 to 2-11 | 5-19, 2-9 to 2-11 |
| final | none | n/a | n/a |

## Differences between the 2019 template and 2022/2025
Values:
- Exhaust cam lobe limit: 2019 template 33.750 mm (1.3287 in); 2022/2025 33.460 mm (1.3173 in).
- Valve stem runout limit: template 0.010 mm (0.0004 in); 2022/2025 0.020 mm (0.0008 in).
- Valve spring compressor: template 90890-04019; 2022/2025 90890-04200 (US YM-04019).
- Intake valve guide installed height: template 10.8–11.2 mm; 2022 same; 2025 11.8–12.2 mm (0.46–0.48 in).

Removed because these years give no figure (only limits are listed):
- New cam lobe heights and camshaft runout limit (0.030 mm).
- New valve seat contact width (0.90–1.10 mm).
- New valve spring free lengths (36.78 mm and 35.60 mm).
- New top ring end gap (0.15–0.25 mm).
- New piston pin and pin bore sizes (15.991–16.000 mm and 16.002–16.013 mm).

Added from these years:
- Camshaft journal clearance limit 0.080 mm and cap inside diameter 22.000–22.021 mm.
- Valve guide inside diameters and valve stem diameter limits.
- Piston pin to pin bore clearance 0.002–0.022 mm.
- A cloth in the chain tunnel before the shims come out; cloth over the head before the clips go in.
- Engine oil on the shims/buckets and cam cap bolts, moly oil on the valve stem seals and valve stem ends (during the shim swap).
- Spark plug hole seal renewed with the cover gasket; Yamaha Bond on the gasket's half-moon sections.
- Access screws: lithium-soap grease on the O-rings, engine oil on the threads; only the crankshaft end O-ring is marked New.
- Rejection rules: a worn valve face is reground; a damaged head is replaced with new valves; scratched bore means cylinder, piston and rings as a set.
- US tool numbers alongside the Yamaha numbers.

Unchanged and confirmed: head bolt method and numbers, cam cap torque and order, tensioner torques, cylinder bolt, cover bolts, spark plug, access screws, bore, piston size and measuring point, piston clearance, ring side clearance, ring end gap limit 0.50 mm, pin limits, seat limits, spring limits, guide clearance limits, warpage, valve clearance, shim range (25 pads, 1.20–2.40 mm).

## Points that could not be fully confirmed
- Head bolt lubricant: the chapter 5 procedure says molybdenum disulfide grease; the chapter 2 torque table note says molybdenum disulfide oil (2-12, both years). The guide follows the chapter 5 procedure (grease), the same as the template.
- Ring gap layout comes from the diagram (5-37 / 5-41): expander at the piston mark, which points to the exhaust; rails 15° either side; top ring on the opposite side, 15° off the centre line. Read from the drawing, not from text.
- 2025 spark plug hole seal depth 0–1.0 mm is shown only in a section drawing (5-18). The guide words it as the flange sitting 0–1.0 mm from the cover face it seats against. Exactly which faces the drawing measures between was read from the picture.
- Where the Yamaha Bond goes on the cover gasket (the half-moon sections) is read from the diagram arrows (5-14 / 5-18).
- The shim formula (rounded old shim + measured − target) is BAK's simplified version of the selection chart (3-9 to 3-10 / 3-10 to 3-11), carried over from the template.
- Oil passage plug (head, 10 Nm) and the exhaust pipe studs (7 Nm; 2025 adds "tighten until they bottom") appear in the head removal list. They are not needed for a top-end rebuild, so the guide leaves them out.

## Head bolt order (added 2026-11-05)
Read from the printed tightening-order picture (2022: 5-24, 2025: 5-28; same layout both years): viewed from above, front at the top: [1] rear left, [2] front right, [3] front left, [4] rear right; nuts [5] front left, [6] rear left. The 2-12 torque-table note says moly oil, the 5-24/5-28 steps say moly grease; the guide now names both.
