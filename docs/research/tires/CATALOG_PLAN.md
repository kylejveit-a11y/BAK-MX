# Tire catalog load plan (SQL-free)

Made 2026-11-07 with tire knowledge `mx-tires-2`. **Nothing has been changed yet**: not the database, not
`public/parts-catalog/`, not `docs/research/aftermarket/`. This file says exactly what to add and hide, and how.

## Where the parts catalog lives

- The Garage build sheet ("What's on your bike") and Ask BAK's part options read **static JSON**:
  `public/parts-catalog/<family>.json` (families: `ktm-family`, `yamaha`, `honda`, `kawasaki`, `suzuki`, `triumph`).
  The browser loads it per family (`shared/parts-picker.ts` `decodeFamily`), and the server fetches the same file
  (`server/part-options.ts` `loadFamily`). There is **no database table for aftermarket listings**.
- Those files are **generated** by `python3 scripts/aftermarket/build_app_data.py`, which runs
  `scripts/aftermarket/build_catalog.py` for each family. Inputs: every `docs/research/aftermarket/<family>/*.json`
  file plus every `docs/research/aftermarket/specialty/*.json` file. Each input has a `products` list
  (`id, brand, product, category, subcategory, part_numbers, variants, fits[{make, model, years}], confidence,
  what_it_changes, caveats, where_to_buy, fitment_source_url`) and optional `updates` (a later file can replace fields of
  a product by id). A product shows on a bike when one of its `fits` lines maps to that roster bike-year
  (`docs/research/aftermarket/roster-2020-2027.json`); enduro models (XC-W, XCF-W, TE, FE, EC, WR) are outside the
  catalog's scope.
- Part types come from the name (`shared/part-types.ts`): "Tires" (`tire|tyre`), "Mousse or tube"
  (`mousse|tube|tubliss|foam`), "Rim locks". Options (sizes) come from `variants` and are saved with their part number.
- The **database** tables `part_catalogs`, `part_assemblies` and `parts` hold OEM parts diagrams only
  (`scripts/load-parts-catalogs.ts`); this plan does not touch them. A rider's saved pick stores brand, name, part
  number and research id in the bike's build (`shared/installed-parts.ts`), so hiding a listing never deletes a rider's
  record; it only stops it being offered.

## Today (counted 2026-11-07 from the MotoSport feed files `docs/research/aftermarket/<family>/ms-<family>.json`)

| Family | Tire rows on MX bikes | Adventure/trials/street/rally/enduro (hide on MX) | MX, unresearched (review) | MX, keep |
|---|---|---|---|---|
| ktm-family | 268 | 127 | 58 | 77 |
| yamaha | 246 | 126 | 42 | 73 |
| honda | 246 | 126 | 42 | 73 |
| kawasaki | 246 | 126 | 42 | 73 |
| triumph | 246 | 126 | 42 | 73 |
| suzuki | 0 tires (one balance-bead kit) | – | – | – |

Every one of those rows carries the same list of 2020–2027 bikes, so a YZ250F shows ~170–200 tires, about 50 of them
adventure, trials, dual-sport or rally tires, all sizes mixed together in one option list.

## Step 1. Add the researched tire rows

1. Copy `docs/research/tires/catalog-add-rows.json` `products` into a new file
   `docs/research/aftermarket/specialty/tires-mx.json` as `{"products": [...]}` (keep only the keys the builder reads;
   `research_ids`, `position`, `rim_inch` and `fit_rule` are notes and can stay — the builder ignores unknown keys).
2. What is in it: **198 tire rows and 7 insert rows** for 47 current tire lines. Each tire row is one line × one end ×
   one rim diameter (e.g. "Geomax MX34 Rear Tire 19-inch"), with `variants` = only that maker's sizes for that rim, and
   Dunlop part numbers where Dunlop's table gives them (MX34, MX14, MX53, Factory Spec, MX33, MX3S). `fits` lists every
   roster model whose wheel on that end takes that rim (rule: `shared/tire-knowledge.ts` `wheelsFor()`: 21/19 on
   motocross models, 21/18 on XC, XC-F, FX, TX, EX, RX, KX-X and YZ-X models, 17/14 and 19/16 on 85s, 14/12 on 65s,
   10–12/10 on 50s).
3. Result per bike (2025 examples): YZ450F, 450 SX-F, RM-Z250 66 tire rows; 450 XC-F 55; CRF150R 56; KX112 and
   85 SX 19/16 30; 65 SX and 50 SX 26. Each row offers only sizes that fit the bike.
4. **Suzuki** gets tires for the first time this way (the builder reads specialty files for every family, and the rows'
   `fits` include RM-Z250 and RM-Z450). Honda CRF150R gets mini/85-size rows.
5. Mousse, tube and TUbliss rows (`insert-*` ids, 7 rows: Bib Mousse, Pirelli mousse, Plews Ultra Mousse,
   Nitromousse, Bridgestone TR-4 tubes, Pirelli tubes, TUbliss) fit a bike when any of their sizes is a front size on the
   bike's front rim or a rear size on its rear rim (the same rule `tireKnowledge()` uses). Their `variants` are code:
   size rows (e.g. "M199: 110/90-19, 120/80-19"); a later builder change could trim variants per bike, until then the
   rider sees every row of that maker's chart.

## Step 2. Hide the rows that are not motocross tires

1. The exact rows are listed in `docs/research/tires/parts-proposal.json`:
   `drop_from_mx_bikes[].catalog_rows` (family + product id, 131 names, ~631 rows across five families) and
   `not_tires_in_tire_rows` (balancing beads, tire studs, MaxTrax: not tires; leave them listed under Wheels but make
   sure they do not get the "Tires" type).
2. The builder has no hide list today, so pick one of:
   - **A (recommended): a hide file plus a five-line builder change.** Add
     `docs/research/aftermarket/hidden-listings.json` = `{"<product id>": "<reason>", ...}` from `drop_from_mx_bikes`;
     in `scripts/aftermarket/build_catalog.py`, load it next to the roster and, in the app-catalog loop (where
     `other_maker` and `outside_years` already skip rows), skip a hidden id when the bike is a motocross model
     (model not matching `XC(?!-F)|XC-F|FX|TX|EX|RX|X$`). Rows marked enduro, cross-country or desert in
     `drop_from_mx_bikes[].why` then stay on XC/off-road models.
   - **B: data only.** Add an `updates` entry per product id in a new file
     `docs/research/aftermarket/<family>/tires-hide.json` that replaces `fits` with only the XC/off-road models (for
     enduro-type tires) or with a non-roster model (for adventure/trials/street tires). Works without a code change but
     is harder to read later.
3. `review_before_listing[].catalog_rows` (50 names: Pro Taper MXT/SMX 04, Shinko 216/504/505/524/R520DC, IRC VX-10,
   IX-05H, IX-09, Artrax, Sedona, combos) stay as they are until each is checked on its maker's page.
   `already_mx_in_catalog` (85 names, now including the Bridgestone M-series minis and Maxxis Maxxcross SI) stay.

## Step 3. Type rules (one-line regex changes in `shared/part-types.ts`, not server code)

- "Mousse or tube" today also matches "Vent Tube Cap", "Long Vent Tube" and "Twister Tube Insert": add
  `vent|twister|throttle` to the `wheels` entry of `NOT_THE_PART` (or put those parts in their own system) so only tire
  tubes, mousses and TUbliss get the type.
- Always show the core wheel types (Tires, Mousse or tube, Rim locks) even with zero listings (PARTS_AUDIT item 4).

## Step 4. Rebuild and check (no SQL, no Supabase)

1. `python3 scripts/aftermarket/build_app_data.py` — rewrites `public/parts-catalog/*.json` and
   `shared/aftermarket-research.ts`.
2. Count tires per bike with the catalog decoder (e.g. a 10-line Node script over `public/parts-catalog/*.json` using
   `decodeFamily` and `typeOf`): expect the per-bike numbers in Step 1.3 plus the kept MotoSport MX rows, and **zero**
   rows whose name matches `Anakee|Karoo|TKC|Trailmax|MT ?43|MT ?21|Rally|Trial|AT8[12]|D606|Sahara|Tourance|Scorcher`
   on motocross models.
3. `npm run check`.
4. Deploy as usual; the catalog is served from `public/`, so the change goes live with the next web deploy (the server
   caches a family file for 30 minutes).

## Later (needs the structured spec slot, PARTS_AUDIT 2.3)

When `InstalledPart` gets a `spec.tire` slot, save `position`, `size`, `terrain` and the insert type from the picked row
instead of the colour field; the rows above already carry `position` and `rim_inch`, and the size is the picked option.
