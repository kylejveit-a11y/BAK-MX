# Used-bike buying knowledge: sources

Pass of 2026-11-07, pending review by Kyle. Runtime data: `shared/used-bike.ts` (`USED_BIKE_VERSION` mx-used-1).
Per-bike records: `docs/research/knowledge/used_ktm_group.json` and `docs/research/knowledge/used_japanese.json`
(research ids `used-*`, loaded by `scripts/knowledge/build_rows.py`).

Rules followed: maker and regulator documents first; buying guides and owner reports only where two or more agree;
own words throughout; no paywall or bot workarounds; rider-facing text names no magazine, tester, retailer or forum.
Each id below is the `src` id used in `shared/used-bike.ts` (stripped before anything reaches the model). Accessed
2026-11-07 unless stated.

## Regulators and states

| id | Publisher | URL | Published | What it supports |
|---|---|---|---|---|
| cfr-565 | US eCFR, 49 CFR 565.15 | https://www.ecfr.gov/current/title-49/subtitle-B/chapter-V/part-565/subpart-B/section-565.15 | current | VIN positions, check digit, model-year letters (F 2015 ... V 2027, W 2028) |
| nhtsa-offroad | NHTSA interpretation letter | https://www.nhtsa.gov/interpretations/bbrmotorsports1 | 2003-07-17 | NHTSA does not regulate off-road vehicles; VIN for off-road vehicles is a state-law matter |
| cpsc-22-746 | CPSC recall 22-746, 2022 YZ125 | https://www.cpsc.gov/Recalls/2022/Yamaha-Recalls-Competition-Off-Road-Motorcycles-Due-to-Crash-Hazard-Recall-Alert | 2022 | Yamaha VIN on the frame steering head, model label on both sides; partial VIN ranges in notices |
| cpsc-recalls | CPSC recalls | https://www.cpsc.gov/Recalls | current | US off-road motorcycle recalls are published here (the bike recall rows hold the specific notices) |
| flhsmv-tl44 | Florida HSMV procedure TL-44 | https://www.flhsmv.gov/pdf/proc/tl/tl-44.pdf | current | Florida titles OHVs bought on/after 2002-07-01; MCO for new; bill of sale rules for used; no plate |
| fl-317-0017 | Florida Statutes 317.0017 | https://m.flsenate.gov/Statutes/317.0017 | 2024 statutes | Knowingly possessing or selling an OHV with an altered VIN or motor number is a third-degree felony; vehicle can be seized |
| nicb | NICB VINCheck | https://nicb.org/vincheck | current | Free theft/salvage lookup, participating insurers only, five searches a day, not to be relied on alone |

## Makers

| id | Publisher | URL | Published | What it supports |
|---|---|---|---|---|
| ktm-vin | KTM North America VIN filing (NHTSA vPIC) | https://vpic.nhtsa.dot.gov/mid/home/displayfile/e221d4fc-fbbd-4590-bdda-e5bc5dbb2792 | 2025-09-09 | VBK for KTM AG; HQV/GG brand prefixes; positions 4-17 (record used-ktm-001) |
| ktm-om-2025 | KTM 2025 250 SX / 300 SX owner's manual 25_3240042en | https://azwecdnepstoragewebsiteuploads.azureedge.net/25_3240042_en_OM.pdf | 2025 | VIN on the right of the steering head; engine number left side above the engine sprocket (repo record p6k-0084 and its siblings 2020-2026) |
| ktm-eps | KTM 2025 450 SX-F owner's manual 25_3240045_en_OM | https://azwecdnepstoragewebsiteuploads.azureedge.net/25_3240045_en_OM.pdf | 2025 | Service schedule line "enter electronic proof of service in the dealer portal" (records used-ktm-002, used-ktm-003; 2026 example https://azwecdnepstoragewebsiteuploads.azureedge.net/26_3240232_en_BA.pdf) |
| honda-om | Honda 2020 CRF450R/RX/RWE owner's manual 31MKE630 | https://2rom-prd-data.hondamotopub.com/om/AHM/CRF450RX-R-RWE/2020/CRF450R.RX.RWE_31MKE630_0.pdf | 2019-04 | VIN right side of steering head; engine number right crankcase (repo record p6h-017) |
| honda-om-old | Honda CRF450R owner's manual, older edition | https://www.manualslib.com/manual/1201988/Honda-Crf450r.html?page=157 | about 2013 | Same VIN place; engine number on the left crankcase: kept as a conflict, not a row |
| honda-recall | Honda Powersports recall lookup | https://powersports.honda.com/recalls | current | VIN recall lookup |
| yamaha-osm | Yamaha 2016 YZ450F owner's service manual | https://www.manualslib.com/manual/1161595/Yamaha-Yz450f.html?page=19 | 2016 | VIN right side of the frame; engine serial on the raised right side of the engine |
| kawasaki-vin | Kawasaki parts site VIN finder | https://kpp.kawasaki.com/Vin-Finder | current | VIN stamped on the steering head below the handlebars (record used-kaw-001) |
| triumph-hb | Triumph TF 250-C / TF 450-C handbook 3850699-US-EN | https://api.triumphtechnicalinformation.com/handbooks/documents/697b1c4ec47604be99a352a4/pdf | 2025-04 | VIN in the steering head and on a left frame label; engine number above the clutch cover (repo record p6h-101) |
| yamaha-hour | Yamaha Motor Canada, hour meter accessory | https://www.yamaha-motor.ca/en/accessories/motorcycles/handlebars-controls-/hour-meter-and-tachometer/ENG-HR806-12-00 | current | Accessory hour meter, 0.1 h resolution, not resettable (so motocross bikes often have no factory meter) |
| yamaha-blog | Yamaha Motor Canada blog | https://www.yamaha-motor.ca/en/blog/maintenance-technical/are-you-getting-the-most-out-of-your-yz/Article67 | 2021-04-20 | Power Tuner maintenance log of running time |
| yamaha-app | Yamaha Power Tuner app listing | https://apps.apple.com/us/app/id1235945328 | current | App reads data recorded by the bike's unit; ECU lock |

Also used for records: Kawasaki 2019 VIN filing (JKA/JKB prefixes, on-road models)
https://vpic.nhtsa.dot.gov/mid/home/displayfile/39cbd4aa-de4b-4320-b68a-6994c6512ec7.

## Buying guides and how-to pages (general inspection; two or more agree on every point used)

| id | Publisher (kept out of rider text) | URL | Published |
|---|---|---|---|
| guide-dr2009 | Dirt Rider, "Buying a used dirt bike" | https://www.dirtrider.com/misc/141_0504_10_things_when_buying_a_used_dirtbike | 2009-02-24 |
| guide-maciag | Maciag Offroad, buying used motocross and enduro bikes | https://www.maciag-offroad.com/how-to/mx-buying-used.html | undated |
| guide-amsoil | AMSOIL blog, what to look for when buying a used dirt bike | https://blog.amsoil.com/what-to-look-for-when-buying-a-used-dirt-bike/ | 2020-08-21 |
| guide-dirtlegal | Dirt Legal blog, dirt bike title status | https://dirtlegal.squarespace.com/blog/2018/9/4/this-is-why-a-dirt-bikes-title-status-is-important | 2018-09 (URL) |
| leakdown | Partzilla, four-stroke leak-down testing | https://www.partzilla.com/blog/motorcycle-engine-leak-down-test-how-to | undated |
| compression | MotoSport, dirt bike compression test | https://www.motosport.com/blog/how-to-do-a-compression-test-on-a-dirt-bike-or-atv | undated |
| valves-tight | Motocross Hideout, tight four-stroke valves | https://motocrosshideout.com/4-stroke-valves-adjusted | 2023-08-18 (updated 2026-09-02) |

The dollar figures in the 2009 guide are not used; only its relative order of costs (bearings and chain kits below shock
rebuilds, clutches and top ends; gearbox work highest) is kept, and the module says so.

## Owner forums (COMMUNITY tier, only where several posters or threads agree)

| id | Thread | URL | Dates |
|---|---|---|---|
| forum-wear-2017 | Wear spots to look for in used bikes | https://www.vitalmx.com/forums/Moto-Related,20/Wear-spots-to-look-for-in-used-bikes,1322622 | 2017-07-06 |
| forum-hours-2024 | How do you judge hours on a bike? | https://www.vitalmx.com/comment/6261116 | 2024-03-05/06 |
| forum-4t-2023 | When buying a used 4 stroke what do you check? | https://www.vitalmx.com/forums/moto-related/when-buying-used-4-stroke-what-do-you-check | 2023-11-28 |
| forum-app-hours | Engine time tracked through app reliable for buying used? | https://www.vitalmx.com/comment/4459341 | 2022-10-21/22 (posters disagree; used only as "treat app hours as one clue") |

Model-specific records:

- used-hq-001 / used-hq-002 (Husqvarna composite subframe): https://www.vitalmx.com/comment/3833801 (2017 and 2020),
  https://www.cafehusky.com/threads/cracked-my-subframe-do-they-sell-aluminum-ones.91277 (2020-2021),
  https://www.cafehusky.com/threads/my-subframe-is-coming-apart-better-check-yours.81998/page-2 (2015-2017).
- used-rmz-001 (RM-Z450 shifting): https://www.vitalmx.com/forums/Moto-Related,20/Whats-wrong-with-a-2018-RMZ450,1357811 (2019-04),
  https://vitalmx.com/forums/Tech-Help-Race-Shop,42/14-and-newer-RMZ450-shifting,1314043 (2017-02/03).

## Read and not used

- MotoSport "Common issues on the <year> <model>" pages (RM-Z450 2019, RM-Z250 2021, CRF250R 2018 and others): the
  same generic list for every bike, and the 2021 RM-Z250 page describes a carburetor on a fuel-injected bike.
- Engine Patrol "most common problems" pages, vincheck.info, motoryk.com: no sourcing; not used.
- Vital MX 2018 CRF450R valve-tick thread (https://www.vitalmx.com/comment/3545837): one confirmed cause (exhaust rocker
  roller bearing) on 2017-2018 bikes, outside the roster years; not recorded.
- Vital MX 2021 KX450 clutch and 2022 KX250 reliability threads: no consensus beyond what kx-109 / cd6-101 already hold.
- Vital MX "2018 YZ450F skipped timing" page 2: no cam-timing reports on the page read.
- Kawasaki 2015 KX450F owner's manual PDF (cyclechaos): identification page not in the text; Suzuki RM-Z owner's service
  manual listings (manualslib, manuals.online): serial-number page text not readable.
- Blocked: the CPSC 2026 Honda handlebar clamp notice could not be fetched in this pass (not needed: it is already in
  shared/recalls.ts and honda250.json).

## Gaps

- Suzuki: VIN and engine-number locations not confirmed from a Suzuki document; no RM-Z250 weak spots with two agreeing
  sources.
- Kawasaki: engine-number location; KX VIN filings for off-road models.
- Engine-number decoding to a model for any maker.
- Current dated prices for wear items (the module gives relative costs only).
- Title rules for states other than Florida.
- Model-specific weak spots for 2015-2019 bikes (outside the roster, so not loaded) and for most 2026-2027 bikes.
