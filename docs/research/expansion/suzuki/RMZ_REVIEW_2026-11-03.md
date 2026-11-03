# Suzuki RM-Z250 / RM-Z450 2020–2027 — owner's-manual pass, 2026-11-03

Scope: US standard RM-Z250 and RM-Z450, model years 2020–2027. Goal: load specifications, torques, maintenance schedule and
suspension settings from Suzuki's own owner's / setup manuals with the CRF150R method
(`docs/research/expansion/honda/CRF150R_REVIEW_2026-11-03.md`, `private.stage_manual_rows`, promotion through `public.evidence_approved`).

Result: **no rows loaded or promoted.** Suzuki publishes no free RM-Z owner's, race-preparation or setup manual. Nothing was
downloaded or hashed, and no PDF or manual text is in the repository or the scratchpad.

## Where we looked (all reached with curl; nothing was blocked)

| Source | Finding |
|---|---|
| `suzukicycles.com/owners` | The "Manuals" panel links only to `genuinesuzukimanuals.com` ("Get Yours"). No download links. |
| `suzukicycles.com/motocross/{2024..2027}/rm-z250`, `rm-z450` | No PDF links. The only manual link is the same store. `2024/rm-z450` and every 2020–2023 page redirect to `/motocross` (`2021/rm-z450` returns 404). |
| `suzukicycles.com/sitemaps/sitemap-cycles-en.xml` (827 URLs) | No manual, setup or owner-document URL. RM-Z pages exist for 2024 (RM-Z250 only) and 2025–2027. |
| `genuinesuzukimanuals.com` (Suzuki's manual store) | Reachable over `https://genuinesuzukimanuals.com/`. (`https://www.` redirects to plain `http://`, which the proxy cannot resolve.) The page says: buy factory owner's manuals from an authorized Suzuki dealer; printed service manuals can be ordered on the site. The RM-Z250 "Owner's Race Preparation Manual" ships with a new bike. Only generic sample PDFs (`/samples/om.pdf` etc.) are free. |
| `suzuki.ca` owner's / service manuals | Paid products. Not US. |
| Web search | Only third-party copies (manualslib, manua.ls, manualzz and others). Not official, so not used. |

This matches `docs/research/expansion/gaps/DATA_HUNT_2026-10-30.md`. Clickers, sag, spring rates, fork oil, torques, capacities and
the service schedule appear only in the paid factory service manuals (RM-Z250 2019–2026 #99500-46K00-01E; RM-Z450 2018–2026
#99500-37K00-01E) and in the dealer-only owner's manuals.

## Rows in `public.claims` (read back 2026-11-03, unchanged by this pass)

| Year | RM-Z250 VERIFIED | RM-Z450 VERIFIED | Main sources |
|---|---|---|---|
| 2020 | 5 | 5 | MX-Tuner press release (2020-11) |
| 2021 | 2 | 2 | 2021 model-line press release |
| 2022 | 4 | 2 | 2022 model press release |
| 2023 | 0 | 0 | no official 2023 RM-Z page or document found |
| 2024 | 36 | 8 | 2024 RM-Z250 spec page; 2024 launch press release (the 2024 RM-Z450 spec page no longer exists) |
| 2025 | 38 | 37 | spec page and brochure |
| 2026 | 37 | 36 | spec page and brochure |
| 2027 | 38 | 35 | spec page and brochure |

No VERIFIED rows are in the maintenance or suspension domains. The 23 REVIEWED rows for each of 2025–2027 are the 2026-10-30
brochure duplicates. They were left unpromoted on purpose because they repeat VERIFIED statements. Nothing is STAGED.

## Options (Kyle's call)

1. Buy the two factory service manuals (printed, from genuinesuzukimanuals.com). Pages would have to be scanned or photographed
   and read by OCR, as was done for Kawasaki. Then the hash would be of the scan, not of a Suzuki-published file, and the source URL
   would be a purchase record. The evidence fields need a decision before loading.
2. Ask a Suzuki dealer for owner's manuals (dealer-only). Same scan caveat.
3. For the 2024 RM-Z450 and the 2020–2023 spec sheets, archived copies of the old suzukicycles.com spec pages (Wayback Machine)
   are Suzuki's own wording. But they are not served by Suzuki today, and this pass did not use them.

## Community and archived sources (2026-11-03, later pass)

Second-hand values went into `public.bike_knowledge` only, as tier **COMMUNITY** (never OEM, never `public.claims`).
Rule: a value is loaded only when two or more independent sources agree. Disagreements are stored as a spread with
`low` confidence, or left out. Rows and sources are kept in `rmz-community-knowledge.json` (ids `rmzc-*`, 120 rows; 
inserted with `on conflict (id) do nothing`).

| Model | Years | Rows | What |
|---|---|---|---|
| RM-Z250 | 2020-2026 | 7 per year (49) | fork compression 11 / rebound 13 clicks; shock LSC 14, HSC 14, LSR 14, HSR 16; springs 5.0 N/mm fork, 52 N/mm shock; sag 110 mm; fork oil 360 ml |
| RM-Z450 | 2020-2021 | 4 per year (8) | shock 1-1/2 turns compression, 3 turns rebound; shock spring 54 N/mm; fork compression 6-8 clicks and sag 105-108 mm (spreads, low) |
| RM-Z450 | 2020-2026 | 9 per year (63) | fork spring 5.0 N/mm; fork rebound 11 clicks; fork oil 365 ml (297-398); engine oil 1050/1100 ml 10W-40 JASO MA; coolant 1100 ml; plug gap 0.9-1.0 mm; filter cap 11 N·m; chain slack 35-45 mm; gearing 13/50 |

Sources: third-party copies of Suzuki owner's manuals (RM-Z250 2019+ edition, ManualsLib 3557200; RM-Z450 2021 edition,
ManualsLib 2581633; RM-Z450 later US/Canada edition, ManualsLib 3539725, PDF created 2023-02, model year not printed);
magazine test bikes (Motocross Action, Dirt Rider, Cycle News); Vital MX forum threads; an NGK plug listing; an OEM-spec
sprocket kit listing. Only facts were used. No manual text is stored.

Not applied to 2027. Suzuki moved the 2027 RM-Z450 to KYB suspension and re-tuned the 2027 RM-Z250 KYB suspension.

Conflicts (left out or stored as a spread):
- RM-Z450 suspension changed between manual editions. The 2021 edition gives fork compression 8, shock 1-1/2 / 3 turns,
  sag 105 mm and a 54 N/mm standard spring. The later edition gives fork 9, shock 2 turns compression / 1 turn rebound,
  sag 110 mm and a 56 N/mm spring. Magazine stock boxes repeat 6 clicks, 1.5 / 3 turns, 108 mm and 54 N/mm every year,
  including 2023. A separate 2023 test lists 56 N/mm, and the 2023 press launch ran 110 mm sag. 2022-2026 clickers,
  sag and shock spring are not loaded until the year of the later edition is known.

Archived pages: web.archive.org could not be reached (the connection reset through the agent proxy), so no archived
suzukicycles.com spec page was read and there are no OEM-tier rows. AMSOIL and K&N fitment lookups refused the request.
ManualsLib served the same page for every page number after about 15 views, so the RM-Z250 maintenance pages could not be read.

Still missing (single source only, or not found): RM-Z450 axle, drain-plug and strainer torques, idle speed, tire
pressure and maintenance chart (later edition only); all RM-Z250 maintenance (oil 950/1000 ml, coolant 1100 ml; one copy
only); RM-Z250 gearing; triple-clamp, brake caliper/rotor, sprocket and linkage torques; valve clearances; shock oil;
fork height; 2027 settings for both models.
