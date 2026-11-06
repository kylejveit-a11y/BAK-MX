# Parts audit: Garage build sheet and Ask BAK (2026-11-06)

Read-only audit. No code or data was changed. Every count below was measured from the repo on 2026-11-06 (the files named
in each section). Where a fix needs real-world fitment or spec data, it says **needs research**. No specs or fitments were
invented for this audit.

Files looked at: `shared/installed-parts.ts`, `shared/part-types.ts`, `shared/parts-picker.ts`, `shared/parts-inventory.ts`,
`shared/part-field-mappings.ts`, `shared/part-specification-mappings.ts`, `shared/aftermarket-research.ts` (generated, 2.5 MB),
`shared/garage-fields.ts`, `shared/build-check.ts`, `shared/work-providers.ts`, `shared/fuel-system.ts`,
`shared/garage-updates.ts`, `public/parts-catalog/*.json`, `src/BikeParts.tsx`, `src/BuildSheetDoc.tsx`, `src/partsCatalog.ts`,
`src/App.tsx`, `apps/mobile/src/BuildSheet.tsx`, `server/installed-parts-context.ts`, `server/part-options.ts`,
`server/engineering.ts`, `server/physics-context.ts`, `shared/engine-physics-context.ts`, `docs/research/aftermarket/**`.

---

## 1. What the parts system covers today

### 1.1 The build sheet model

- A bike's build is stored in `bike.configuration` as `installed_parts`, `stock_systems` and `parts_notes`
  (`shared/installed-parts.ts`). Max 40 parts per bike.
- **13 systems**, in this order: Suspension, Chassis, Engine & cooling, Air intake, Exhaust, Fuel & tuning, Clutch,
  Gearing & chain, Brakes, Wheels & tires, Bars & controls, Guards & skid plate, Plastics & seat.
- Each system is one of three states: **Stock**, **Changed** (has parts), or **Not sure** (unknown; BAK must not assume stock).
- One recorded part (`InstalledPart`) holds only text:
  `s` system, `b` brand, `n` name, `p` part number, `r` research id, `x` typed by rider, `d` rider detail (120 chars),
  `k` colour, `o` off the bike (spare), `v` size/variant (20 chars).
  **There are no numeric or typed spec fields** (no spring rate, teeth, chain pitch/length, tire size, compound, pressure,
  offset, bar bend, map name as a field).
- One free-text note per system (280 chars), with hints that tell riders to type spring rates, sprocket sizes, tire model and
  pressures there (`NOTE_HINT` in `shared/parts-picker.ts`).
- **Part types** (`shared/part-types.ts`): 59 types across 13 systems, matched by regex on the product name
  (e.g. Exhaust: Full system / Two-stroke pipe / Slip-on / Head pipe / Insert; Suspension: Bearings and seals / Oil /
  Fork springs / Shock spring / Valving kit / Preload adjuster / Clickers / Linkage / Fork / Shock; Wheels: Wheel bearings /
  Wheels / Tires / Mousse or tube / Rim locks).
- **Work done** (not a boxed part): Fork revalved, Shock revalved, Fork serviced, Shock serviced, ECU flashed, Head ported,
  Top end rebuilt, Bottom end rebuilt, Clutch rebuilt. Free-text detail (120 chars).
- **Work providers** (`shared/work-providers.ts`, generated): 35 rows. Suspension shops: Race Tech, Pro Circuit, Enzo Racing,
  REP Suspension, Factory Connection, Ride JBI, Stillwell, AHM Factory Services, Precision Concepts. ECU tuners: Twisted
  Development, XPR, WMR, Pro Circuit, TokyoMods, BT Moto, R1 Industries, TZR, Honda.

### 1.2 What riders can pick from (the per-bike catalog)

`public/parts-catalog/<family>.json`, loaded whole by web and phone:

| Family file | Size | Listings | Brands | Bike-years | Listings with research (`r`) | Listings with sizes/options (`vr`) | With colours |
|---|---|---|---|---|---|---|---|
| ktm-family | 4.2 MB | 7,704 | 303 | 285 | 2,571 | 2,683 | 15 |
| yamaha | 2.2 MB | 4,844 | 256 | 80 | 2,128 | 2,256 | 6 |
| honda | 1.6 MB | 3,919 | 258 | 39 | 954 | 1,991 | 4 |
| kawasaki | 1.5 MB | 3,937 | 244 | 48 | 587 | 1,946 | 4 |
| triumph | 0.8 MB | 2,295 | 202 | 9 | 162 | 1,277 | 0 |
| suzuki | 0.5 MB | 1,346 | 127 | 16 | 125 | 660 | 0 |

About 24,000 listings, ~350 distinct brand names. A typical big bike sees 1,800 to 2,700 pickable rows after filtering
(2024 YZ250F: 1,874; 2025 450 SX-F: 2,741; 2025 CRF450R: 1,821). Thin bikes: GasGas MC 50 2021 (27 listings),
KTM 50 SX 2020/2023 (33/35), Suzuki RM-Z450 2027 (28), Kawasaki KX85 2021 (77), RM-Z250 2023 (73), Yamaha YZ65 2022 (60).

### 1.3 Researched parts (what BAK "knows" about a part)

`shared/aftermarket-research.ts`: **6,424 researched entries, 251 brand names**.
By system: controls 1,034, exhaust 809, engine 770, body 532, suspension 522, chassis 505, gearing 458, brakes 369,
intake 352, clutch 346, protection 320, wheels 274, tuning 133.
Confidence: high 2,223, medium 3,937, unverified 179, low 33, none 52.

Each entry is four strings: `what_it_changes`, `caveats`, `tester_notes[]`, `confidence`. Fill rate:
`what_it_changes` 3,438 of 6,424 (820 of those are cut off mid-sentence with "…", max 220 chars);
caveats 2,026 (514 cut off); tester notes on only **268** entries. 520 "what it changes" texts are just the maker's
marketing description. 2,561 entries duplicate another entry's brand + product name (same product, different bikes/sources).

Brands with good depth (researched entries): KTM PowerParts 530, Husqvarna TA 491, GasGas TA 376, Moose 336, FMF 268,
Pro Circuit 236, Acerbis 214, RFX 139, Renthal 129, Polisport 116, Cycra 112, Zeta 110+16, Pro-X 101, Pro Taper 99,
Rekluse 95, Works Connection 92, Vertex 89, Factory Links 85, Hinson 78, Boyesen 71, Yoshimura 58, Twin Air 56,
JT 51, Wiseco 41, WP 41, Xtrig 43+3, Öhlins 33, KYB 27, Race Tech 20, Factory Connection 20, Akrapovič 17+8, GET 14,
Vortex 12+14, Enzo 3.

### 1.4 Fitment and spec data actually attached

- **Fitment**: by bike-year list membership only (`bikes["Make|Model|Year"]`). `verified` = research confidence "high"
  (maker lists the fit); otherwise "dealer or retailer listing". A name filter (`forOtherBike`) drops listings that name a road
  bike, the other stroke, or another maker's model family (phone only, see 3.2).
- **Sizes/variants**: seller option lists (`vr`), e.g. Factory Connection Shock Spring "3.8kg … 4.4kg" with part numbers,
  REP fork springs QS31 3.8–5.8, Renthal R1 chain by link count, tire sizes "110/90-19". These are labels, not parsed values.
- **Sprocket teeth**: the only structured size. Fixed chip lists in `sizesFor`: rear 38T–54T, front 11T–15T, for every bike.
- **Spring rates, pipe RPM shift, clutch type, bar bend, clamp offset, compound, tire size**: **none are structured fields**.
  Where they exist they are inside free text (e.g. FMF "broadens the power curve…", Rekluse "auto-clutch function…",
  Vertex "Compression Ratio 14.4:1", REP "Rates offered: 3.8 … 5.8 N/mm").
- `shared/parts-inventory.ts`, `part-field-mappings.ts`, `part-specification-mappings.ts` are the **OEM catalog evidence
  pipeline** (diagram occurrences, torque, dimensions, wear limits with claim-level provenance). They are not connected to
  the Garage build sheet or to aftermarket parts at all.

### 1.5 How a recorded part changes BAK's answer

1. `server/installed-parts-context.ts` sends `installed_parts` to the answer model: fitted parts, off-the-bike spares,
   confirmed-stock systems, not-recorded systems, rider notes, and `build_checks` text. Each part carries its name, size,
   colour, part number, rider detail, whether it was typed or picked, and — only when it was picked from the list with a
   research id — the research `what_it_changes`, `caveats`, `tester_notes` and a fit-confidence phrase.
2. Prompt rules in `server/engineering.ts` (INSTALLED PARTS): answer for what is on the bike; say when an answer depends on a
   fitted part; stock maps, jetting, clicker baselines and spring advice may not apply to a modified system; a modified
   suspension means "the tuner's baseline beats stock"; never present claimed gains as measured.
3. `shared/build-check.ts` flags: a preload adjuster or spring made for a different shock/fork brand than the one fitted; two
   parts in one slot (single-slot types such as shock, rear sprocket, handlebar, exhaust); a sprocket size that disagrees
   with the Garage gearing.
4. `fuel_system` (`shared/fuel-system.ts`) hides carb parts on injected bikes and vice versa, and tells BAK not to give
   jetting advice to an injected bike.
5. `server/part-options.ts`: when the message looks like shopping ("X vs Y", "best pipe"), up to 12 matching listings for
   this exact bike plus up to 4 named-but-not-listed items are sent as `part_options`.

**What does not happen:** none of the numbers BAK computes read the build sheet. Spring math
(`server/physics-context.ts`) reads only the free-text Garage settings `fork_spring_rate` / `shock_spring_rate`, and only
when written as "N/mm", "kg/mm" or "lb". Gearing math (`shared/engine-physics-context.ts`) reads only the Garage settings
`front_sprocket` / `rear_sprocket`, and uses a published or "usual for the class" chain size, never the chain on the sheet.
A rider who picks "Factory Connection Shock Spring, 5.4 kg" or a "50T rear sprocket" on the build sheet gets no spring
check or gearing numbers from it.

---

## 2. Gaps riders will hit

### 2.1 Brand and product coverage, against the list in the brief

| Area | In the picker (catalog listings) | Researched (BAK has notes) | Gap |
|---|---|---|---|
| Exhaust: FMF, Pro Circuit, Yoshimura, Akrapovič | Yes, all four | FMF 268, PC 236, Yoshi 58, Akra 25 | Notes are maker claims; no structured "where it gains" (bottom/mid/top) or required map/insert. Akrapovič appears under two spellings in research (Akrapovič / Akrapovic). |
| Clutch: Rekluse, Hinson | Yes | Rekluse 95, Hinson 78 | No "clutch type" field (manual / auto / auto-on-manual / hydraulic) — BAK has to read it from the name. |
| Suspension work: WP, Race Tech, Enzo, Factory Connection | Yes | WP 41, RT 20, FC 20, Enzo 3 | Enzo nearly absent. Revalve providers list has 9 shops; MX-Tech, Smart Performance, TBD and other common US shops are missing (**needs research** which ones have published offerings per bike). WP Cone Valve / Trax / XACT PRO coverage is partial (gaps listed in `docs/research/aftermarket/specialty/susp-sets-ktm-group.json`). |
| Springs | Factory Connection, Race Tech, REP, Eibach listings with rate options | Only 2 researched entries carry a rate in the name | **Rate cannot be recorded as a value** (see 2.3). |
| ECU / map switch: Vortex, GET | Yes (Vortex 71, GET 24 listings) | Vortex 26, GET 14, map switches 6 | Map switches for Japanese bikes (Yamaha Power Tuner app, Honda/Kawasaki/Suzuki couplers and switches) are thin; **needs research** per model. No "which map is selected" link between the part and the `active_map` setting. |
| Bars: Renthal, ProTaper | Yes | Renthal 129, Pro Taper 99 | **No bend field.** Bend is what riders compare (and what BAK needs for fit advice); options sometimes carry it as a label only. |
| Sprockets and chains | Yes (JT, Renthal, Supersprox, Talon, DID, RK, EK, Regina missing) | DID 14, RK 32, EK 21, Regina 0 | Chain pitch and link count are labels only. Many real chains are hidden in "Something else" (bug in 2.4). |
| **Tires**: Dunlop MX34/MX14, Michelin Starcross 6, Pirelli MX32, Bridgestone | Listed for KTM-family/Honda/Kawasaki/Yamaha/Triumph (~240 tire listings, same list on every bike) | **0 researched tires** (the only "tire" research rows are KTM tire levers) | No tires at all for **Suzuki** (1 listing, a balance-bead kit) and only 1 for the **CRF150R**. About 50 of ~173 tires shown on a YZ250F are adventure, trials, dual-sport or rally tires (Anakee, Karoo 4, TKC70, MT43, Trailmax). No compound/terrain, no size field, no front/rear on the web. |
| Mousse / tube / Tubliss | 3 mousse-like listings per family, 0 Tubliss, 0 Nitro Mousse | 0 | A rider on mousse or Tubliss cannot record it from a list; "Mousse or tube" only appears as a type where 1 item happens to be listed. |
| Triple clamps | Yes (Xtrig, Luxon, Ride Engineering, factory clamps) | ~81 entries | **No offset field** (22 / 23 / 24 mm etc.), though the prompt asks BAK to compare offset and the geometry math could use it. |
| Linkages | Yes (Ride Engineering, Factory Links, KoubaLink, REP) | ~149 matches, many are bearing kits/guards | No "ratio change / lowering amount" field. |
| Air filters | Twin Air, No Toil, Uni, K&N | Twin Air 56, No Toil 32, Uni 9 | Fine for recording; nothing needed beyond type. |
| Big-bore kits | Cylinder Works, Athena, Vertex | 34 entries | No displacement field; displacement change matters for jetting/mapping advice. |
| Carb parts | Keihin, Mikuni, JD Jetting listings on carb bikes | ~116 jet/reed/carb entries | Jets are picked as products ("EBC main jet") rather than recorded as a jet size; the jet sizes live in separate free-text Garage settings. |

### 2.2 Fuel system errors that hide parts

- `fuelSystem()` treats every model starting `CRF` as fuel-injected, so the **Honda CRF150R** is treated as injected and its
  Fuel & tuning section shows **0 choices** (with the filter off it has jets, Dynojet kit, carb rebuild kits, Keihin FCR
  parts). The CRF150R appears to be carbureted; **verify against Honda's spec page** before changing the rule.
- Kawasaki KX65/85/112, Yamaha YZ65/85, and older two-strokes return "not on file" (nothing hidden, BAK asks). That is safe
  but means jetting help is generic; **needs research** per model to fill.

### 2.3 Things a part cannot express (missing fields)

| What a rider needs to say | Where it goes today | Problem |
|---|---|---|
| Spring rate after a spring swap (fork pair, shock) | Phone: seller option label stored in **`k`, the colour field**. Web: not at all. Or free text in Garage "Fork springs" | BAK receives it as `color: "5.4 kg"`; spring math never sees it; units vary (kg, kg/mm, N/mm). |
| Sprocket teeth | `v` on phone (chips); web cannot set it | Web picks store no size and may store the wrong part number (see 3.2). Teeth do not feed gearing math. |
| Chain pitch, links, type (non-sealed / O / X-ring) | Option label in `k` (colour) | Not usable for axle-position or wear advice. |
| Tire model, size, front/rear, compound, pressure | Size option in `k`; front/rear only on phone; pressure in one free-text Garage field "13 / 13 psi"; NOTE_HINT says to type the rest | BAK cannot tell what tire is on which wheel or what pressure goes with it. |
| Tube / heavy-duty tube / mousse / Tubliss per wheel | Nothing structured | Pressure advice depends on this (mousse has no pressure). |
| Triple clamp offset | Name text only | Geometry math cannot use it. |
| Bar bend and height, risers | Name text; Garage "Bar height and position" free text | Fit advice can't compare bends. |
| Exhaust: insert in/out, spark arrester, packing age | Note text | Map/jetting and noise advice. |
| ECU: which map file / maps loaded, map on the switch | Work detail text or `active_map` setting | No link between the ECU part and the map setting. |
| Clutch type and springs | Name text | Auto clutch changes start and tuning advice. |
| Revalve: who, when, what (spring rates, oil height, valving direction) | One 120-char text field | Rates should be numbers; date/hours should be a field so service intervals work. |
| Big bore / high comp: displacement, compression, fuel required | Name text | Fuel and timing advice. |
| Install date or engine hours at fit | Nothing | Wear parts (chain, sprockets, tires, clutch, piston) can't drive maintenance reminders. |

### 2.4 Places the picker makes riders type or hides real parts

- About **40% of pickable rows have no type** and fall into "Something else" (YZ250F: 751 of 1,874; 450 SX-F: 1,073 of 2,741).
  Much of that is service bits (gaskets, heat wrap, bar pads) which is fine, but real parts land there too:
  - **Sealed chains are untyped**: the "small part" filter in `part-types.ts` matches `rings?`, so "D.I.D 520VX3 X-Ring Chain",
    "ProTaper 520 Forged O-Ring Chain", "Turner 520 VZO O-Ring Chain" and "Moto-Master … Dual Ring Rear Sprocket" never
    show under Chain or Rear sprocket.
  - "Supersprox Counter Shaft Sprocket" is untyped (rule expects "countershaft" as one word or "front").
  - "Slip-on muffler" catches silencer repair kits and Yoshimura mini-bike muffler kits; real slip-ons share the list with them.
  - 530-pitch "Universal" chains are listed on 520-chain bikes (e.g. YZ250F) — **verify chain pitch per model** before filtering.
- Types with zero listings are hidden (`typesWithCounts`), so "Rim locks", "Mousse or tube", "Shock" etc. disappear on bikes
  where nothing happens to be listed; the rider must find "Something else" and type it.
- "Not listed?" / "Another brand" opens a free-text form (brand, name, part number). Typed parts get no research notes and no
  type, so build checks and slot logic can't use them.
- Work detail ("Valving, springs, oil height") is a single 120-char text box.

---

## 3. Layout and UX problems

### 3.1 Both apps

- **13 sections, all required to be opened one by one.** There is no "everything else is stock" action; the progress check
  wants 7 of 13 sections accounted for. A rider with a pipe and bars must still open 5 more sections to tap Stock.
- **"Stock" says nothing.** A stock section shows "As it came from the factory". BAK and the rider never see what stock is
  (stock tire model and size, gearing, chain, bar, spring rates) even where verified claims for the bike hold those values.
  **Needs a check of which stock values are already in verified claims per bike.**
- **Two places for the same thing.** Springs, sprockets, tire pressure, map and jets live in Garage settings
  (`garage-fields.ts`: "Clickers & sag", "Gearing, tires & map") while spring/sprocket/tire parts live on the build sheet.
  `build-check.ts` has to cross-check sprockets between them, and spring math only reads the settings copy.
- **Progress can lie.** The "Spring rates or revalve" check counts as done when *any* suspension part is on the sheet
  (e.g. fork seals or a holeshot bearing kit).
- **Long, unsorted lists.** Controls shows ~500–830 rows on a big bike; a brand step helps, but types like "Levers and perches"
  or "Footpegs" still return dozens of near-duplicate listings; Tires shows ~170–200 with adventure and trials tyres mixed in.
- **Grouping drifts between screens**: the editor lists 13 systems in one order; the build-sheet document groups them into
  4 headings (Suspension & chassis / Engine / Drive, brakes & wheels / Cockpit & protection); Garage settings use a third
  grouping. Radiators sit under "Engine & cooling" but radiator guards under "Guards"; chain guides under "Chassis" but chains
  under "Gearing".
- Research text shown to riders is often cut off mid-sentence ("…") because the generator clips at ~220 chars.
- The full family catalog (up to 4.2 MB for KTM/Husqvarna/GasGas) is downloaded to open any section.

### 3.2 Web (`src/BikeParts.tsx`, `src/App.tsx`)

- **The Build sheet tab shows the parts twice**: the finished document (`BuildSheetDoc`) and then the 13-row editor list under
  it. `BuildSheetDoc` supports an "Edit build sheet" button but `App.tsx` does not pass `onEdit`.
- The web picker is a **step behind the phone**: no size chips (sprocket teeth), no option picker (spring rate, tire size,
  chain length), no front/rear step, no multi-select, no on/off-the-bike toggle (spares can't be managed on web), no colour
  editing after the fact, and the wrong-bike name filter is not applied (`pickerChoices` is called without the model,
  ~50–70 extra rows per bike).
- **Wrong part number risk**: the web stores the *first* part number of a listing (`c.pn`), even when the listing covers
  several sizes. The phone deliberately stores none in that case. A web-picked rear sprocket can then trip the "part number
  doesn't match your gearing" check, or tell BAK the wrong size.
- Changes only save on "Save"; closing the sheet (Escape, backdrop) discards picks with no warning. The phone saves as you go.
- The "Changed · n" badge counts off-the-bike spares as changes.

### 3.3 Phone (`apps/mobile/src/BuildSheet.tsx`)

- **Option labels are saved as the colour** (`k`): spring rate, tire size, chain length, sprocket-kit size all go into the
  colour field. The build sheet then shows them fine, but Ask BAK is told `color: "110/90-19"`.
- A section home lists every type plus "Something else" plus work rows: Suspension is 10 types + 1 + 4 work rows = 15 rows
  before anything is picked. Fork and shock items are interleaved (Fork springs, Shock spring, Valving, Preload, Clickers,
  Linkage, Fork, Shock); splitting into Fork / Shock / Linkage would read the way riders think.
- Type rows are shown even when the section is set to Stock or Not sure; tapping one silently switches the section to
  Changed. Marking Stock while parts are listed keeps the parts and drops the Stock flag.
- Sprocket chips are fixed (38–54T rear, 11–15T front) for every bike, from a 50 SX to a 450. **Needs research** for the
  real ranges per class (minis especially).
- The free-text note box sits under everything and its hint asks riders to type the very values that should be fields.

---

## 4. Top 15 improvements, ranked

Size: S = under a day, M = a few days, L = a week or more. "Research" means real-world data must be gathered first.

| # | Improvement | Why it matters to a rider | Size |
|---|---|---|---|
| 1 | **Add a structured spec slot to `InstalledPart`** (e.g. `spec: {rate_nmm?, teeth?, chain?:{pitch,links,type}, tire?:{size,position,compound}, offset_mm?, bend?, displacement_cc?}`) and stop writing option labels into `k`. Migrate existing `k` values that look like sizes/rates. | Today a spring rate or tire size is saved as a "colour"; BAK can't use it. One slot fixes springs, gearing, tires, clamps at once. | M |
| 2 | **Feed the build sheet into the numbers**: spring check reads the fitted fork/shock spring rate; gearing reads fitted sprocket teeth and chain pitch; keep the Garage settings as a fallback, then retire the duplicate fields. | Picking a 5.4 shock spring or a 50T sprocket should change BAK's spring and gearing advice, which is what riders record parts for. | M |
| 3 | **Bring the web picker to parity with the phone** (size chips, options, front/rear, multi-pick, on/off toggle, model filter) by moving the shared picking logic into `shared/parts-picker.ts`, and fix the first-part-number bug. | Web riders currently record less, and can record the wrong part number for multi-size listings. | M |
| 4 | **Fix the type rules**: chains with O/X/XW-ring, "Counter Shaft", "Dual Ring" sprockets; keep silencer repair kits out of Slip-on; always show core types (Rim locks, Mousse or tube, Shock, Fork) even with zero listings, with "add your own". | Real chains and sprockets are hidden in "Something else" right now. | S |
| 5 | **Tires done properly**: a front/rear tire slot with size, compound/terrain and tube type (tube, HD tube, mousse, Tubliss), and per-tire pressure on the same row; filter adventure/trials/street tyres off MX bikes; add Suzuki and CRF150R tire lists; research MX tires (Dunlop MX34/MX14/MX33, Michelin Starcross 6, Pirelli MX32, Bridgestone X-series, Maxxis) and mousse/Tubliss. **Research** for fitment and what they change. | Tires and pressure are among the first things riders change and ask about; BAK has nothing on them. | M + Research |
| 6 | **"Everything else is stock" button** on the sheet, plus a short first-run checklist (Exhaust, Suspension, Gearing, Tires, Bars, ECU/map) instead of 13 sections. | Gets a rider to a usable build in under a minute; fewer "unknown" systems in answers. | S |
| 7 | **Show what "stock" is** under each Stock section from verified claims (tire sizes/models, gearing, chain, bars, spring rates, map). **Research/check** which stock values exist per bike first. | Riders see the baseline they changed from; BAK can compare "your 50T vs stock 49T". | M |
| 8 | **Springs: structured rate + unit picker** (N/mm, kg/mm, lb/in, or air psi for air forks), offered when a spring part or a revalve is added; read REP/Factory Connection/Race Tech option labels into it. | Spring rate is the first thing a tuner asks; BAK's spring check is built but starved of input. | S |
| 9 | **Fix `fuelSystem` for the CRF150R** (verify carb first) and fill the "not on file" two-strokes (KX65/85/112, YZ65/85). **Research.** | CRF150R riders see zero jetting/carb parts and could get fuel-injection advice. | S + Research |
| 10 | **One web Build sheet view**: show the document with an Edit button (or the editor alone), not both stacked; warn before discarding unsaved picks or autosave like the phone. | The web tab is long and confusing, and picks can be lost on close. | S |
| 11 | **Revalve / service record**: who, date and hours, spring rates (numbers), oil height, and a valving direction picker (softer / firmer / custom) instead of one 120-char box; add MX-Tech, Smart Performance and other common shops. **Research** for which shops publish per-bike offerings. | "Revalved by X with 0.50s" is the most important suspension fact; it also drives service-due reminders. | M + Research |
| 12 | **Install hours on wear parts** (chain, sprockets, tires, clutch plates, piston, air filter): record engine hours at fit. | Lets BAK and Maintenance say "your chain has 30 hours" instead of guessing. | M |
| 13 | **Clean the research text**: stop clipping at 220 chars mid-sentence, dedupe the 2,561 repeated brand+product rows, merge brand spellings (Akrapovič/Akrapovic, ZETA/Zeta, XTrig/Xtrig, SuperSprox/Supersprox, Pro Taper/ProTaper, DID/D.I.D), and add tester notes beyond the 268 that have them. Some is **Research**. | Riders read half sentences today; brand pickers show the same maker twice. | M |
| 14 | **Split Suspension into Fork / Shock / Linkage groups** (and similarly Exhaust: system vs insert), and align the build-sheet document groups, editor order and Garage settings groups to one scheme. | Riders think "fork" and "shock", not ten interleaved types; one grouping everywhere is easier to find things in. | S |
| 15 | **Per-bike sprocket ranges and chain pitch** (minis vs big bikes) and filter wrong-pitch chains (530 on 520 bikes). **Research** per model. | Avoids offering impossible sizes and parts that don't fit. | S + Research |

Also worth doing when convenient (not ranked): load the catalog per system or per bike instead of the 4.2 MB family file;
don't count spares in "Changed · n"; keep the OEM evidence pipeline (`parts-inventory.ts` etc.) in mind as the place where
verified stock part numbers for item 7 would come from.
