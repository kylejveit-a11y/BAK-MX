# Kawasaki KX250F / KX450F 2014-2019: specifications and tightening torques from the owner's manual text layer (12 bike-years, 1,272 rows)

Same manuals and text layer as `REVIEW.md` (damper settings). Before this pass these twelve bike-years held 3-12 facts each and no torque.
Reader: `scripts/older/kawasaki_textlayer_specs.py`. Payloads: `specs/1.json` .. `specs/12.json` (2014 KX250F first, 2019 KX450 last).

What is taken, and the check that has to pass (the text layer has every space removed, so nothing is taken on shape alone):
- Specification tables (dimensions, engine, transmission, frame, tyres, rims, travel, fork oil type and amounts, brakes): label list in the
  expected order on the page, value block matched exactly once, every metric/imperial pair converts, every gear ratio equals its
  tooth counts, overall ratio equals primary x final x top gear.
- Torque table (23-24 fasteners per manual): names split only at known fastener words and matched against a fixed list; the N.m and
  kgf.m digit strings split jointly so each pair converts, and the split has to be unique.
- Procedure torques ("Tightening Torque <fastener>: n N.m (k kgf.m, x in.lb|ft.lb)"): all three units agree.

Skipped by the checks (not loaded):
- Overall length, KX250F 2018 and KX250 2019: printed "2172 mm (85.63 in.)", which does not convert.
- Side Cover Bolt, KX450 2019: printed "7 N.m (0.71 kgf.m, 52 in.lb)", units disagree.
- Handlebar Clamp Bolts (procedure) 2014 KX450F, 2015-2016 KX250F, 2015 KX450F; Front Fork Top Plug 2014 KX450F; Rear Axle Nut (procedure)
  2016-2017 KX450F; Front Fork Clamp Bolts (Upper) (procedure) 2018-2019; Left Front Fork Adjuster Assembly Locknut 2018-2019 KX250:
  two labels printed ahead of two values, pairing lost in the text layer. The torque-table rows for the same fasteners are loaded.

Review before promotion, 2026-11-25:
- every fastener that appears in both the torque table and a procedure in the same manual carries the same N.m (0 mismatches after the pairing rule);
- every fastener's value was listed across the six years of each model: changes fall only on the generation breaks
  (KX250F 2016->2017, KX450F 2015->2016, KX450 2018->2019) plus the documented 2014->2015 axle clamp change;
- the 2019 KX450 values equal the 2020 KX450 rows already on file from the page-image pass (same generation) for every shared fastener and specification.
