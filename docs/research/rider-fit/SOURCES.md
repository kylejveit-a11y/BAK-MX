# Rider-fit sources (`shared/rider-fit.ts`, version `mx-fit-1`)

One research pass on 2026-11-07, building on the per-bike fit records (`docs/research/knowledge/fit_*.json`, research
ids `rfit`). Public pages and maker documents only; nothing behind a paywall, login or bot check was worked around
(pages that answered with a bot check, a 403 or an unanswered permission prompt are listed under "Not reached"). All
facts in the module are in BAK's own words. Rider-facing text names bike makers, bar and grip makers and their products
only. Testers, magazines, retailers and riders are named **here only**, never in what the rider sees. Each source id
below matches `FIT_SOURCES` in the module, and `tests/rider-fit.test.ts` checks that every id and URL appears in this file.

Accessed date for every row: **2026-11-07**. "Published" is given where the page or document shows one.

## Bike makers (owner's manuals, handbooks, spec pages)

| id | Publisher | URL | Published | What was taken |
|---|---|---|---|---|
| `honda-2020-fit` | Honda, 2020 CRF450R/RX/RWE Owner's Manual & Competition Handbook (Personal Fit Adjustments) | https://cdn.powersports.honda.com/documentum/MWOM/ml.remawmom.2020_31mke630_crf450r_rx_rwe.pdf | 2019 | Position chart: +26 mm (front holes), +16 mm (front holes, holders turned), standard, -10 mm (holders turned). Controls usable seated and standing; shift and brake pedals close to the boot but not pressed seated or standing; lever clamps torqued so they rotate in a fall, or Teflon tape under them; bar width trimmed equally from both ends a little at a time, chamfered; alternate rise/sweep bends; stock ergonomics built around an average-size rider. Rear brake pedal about level with the right footpeg. |
| `honda-handbooks` | Honda, CRF250R/CRF450R competition handbooks 2021-2027 (sample: 2026 CRF450R) | https://cdn.powersports.honda.com/documentum/MWOM/ml.remawmom.amker2626chen.pdf | 2025 | Lower holders offset 5 mm from centre, turned = 10 mm behind standard; optional top-bridge holes 26 mm ahead; four positions; brake lever position adjuster with lock nut; brake pedal push rod standard length 78.6-80.6 mm; CRF250R cable clutch 10-20 mm free play; CRF450R clutch lever position adjuster. Paint mark on the bar aligned with the holders. Every year's handbook is listed per bike in `fit_honda_kawasaki_triumph_minis.json` (rfit-h-010 to rfit-h-024). |
| `honda-om` | Honda, CRF250R/CRF450R owner's manuals 2023-2026 (sample: 2025 CRF250R) | https://cdn.powersports.honda.com/documentum/MWOM/ml.remawmom.ak952525omen.pdf | 2024 | Seat heights: CRF250R 955 mm (2025), 961 mm (2023); CRF450R 965 mm (2023), 961 mm (2025-2026). 2020 CRF250R 957 mm from the 2020 handbook. |
| `honda-crf150r` | Honda, 2026 CRF150R/RB competition handbook | https://cdn.powersports.honda.com/documentum/MWOM/ml.remawmom.akse2626chen.pdf | 2025 | Brake lever adjusting bolt; clutch free play 10-20 mm; pedal height by push rod; no bar positions given. |
| `yamaha-osm-2020` | Yamaha, 2020 YZ250/YZ250X Owner's Service Manual (B9U-28199-11) | https://library.ymcapps.net/library/om/contents/pdf/10/B9U-28199-11_02.pdf | 2019 | Brake lever position 100 mm, range 86-105 mm; brake pedal height 0.0 mm above footrest top; clutch free play 7.0-12.0 mm; lower holders reversible to change fore-aft offset. Same in the 2020 YZ125 manual (B0V-28199-11). |
| `yamaha-osm` | Yamaha, YZ owner's service manuals 2021-2027 (sample: 2022 YZ125, B4X-2819U-10) | https://library.ymcapps.net/library/om/contents/pdf/10/B4X-2819U-10_02.pdf | 2021 | Same lever figures; no free play at brake lever end; pedal height by adjusting nut, bolt end at least 2.0 mm from the pedal; holder reversal changes fore-aft offset; manuals do not print the offset size. |
| `yamaha-yz450f-2023` | Yamaha Motor USA, 2023 YZ450F features | https://yamahamotorsports.com/models/23-yz450f/features | not shown | Four-position, rubber-mounted bar clamp; more seat-to-peg room. |
| `yamaha-tall-seat` | Yamaha Motor USA accessories, Yamaha Tall Seat | https://yamaha-motor.com/p/yamaha-tall-seat | not shown | About 3/4 in (19 mm) taller than stock, model list by year. |
| `yamaha-yz65-spec` | Yamaha Motor USA, 2025 YZ65 specifications | https://yamahamotorsports.com/models/25-yz65/specs | not shown | Seat height 29.7 in (754 mm). |
| `yamaha-yz85-spec` | Yamaha Motor USA, 2025 YZ85 specifications | https://www.yamahamotorsports.com/models/25-yz85/specs | not shown | Seat height 33.1 in (841 mm). |
| `ktm-om` | KTM, Husqvarna and GasGas owner's manuals 2020-2027 (sample: 2026 KTM 450 SX-F, art. no. 3240236) | https://azwecdnepstoragewebsiteuploads.azureedge.net/26_3240236_en_BA.pdf | 2025 | Bar-mount holes 3.5 mm from centre, two positions, rigid or rubber; hand-turned reach screws on clutch and front brake (limited range, no force, not while riding); front brake free travel at least 3 mm; brake pedal stop screw then push rod for 3-5 mm free travel; shift lever by spline and must not touch the boot at rest (constant contact loads the transmission); bent or straightened bars must be replaced. Every manual is listed per bike in `fit_ktm_group.json`. |
| `ktm-85sx-om` | KTM, 2027 85 SX owner's manual (art. no. 3240375) | https://azwecdnepstoragewebsiteuploads.azureedge.net/27_3240375_en_BA.pdf | 2026 | Top clamp holes 15 mm apart plus 3.5 mm offset mounts: four bar positions; brake pedal tip in two hole positions. |
| `ktm-50sx-spec` | KTM USA, 2025 50 SX technical specifications | https://www.ktm.com/en-us/models/motocross/2-stroke/2025-ktm-50-sx/technical-specifications.html | not shown | Seat height 653 mm. |
| `ktm-65sx-spec` | KTM USA, 2025 65 SX technical specifications | https://www.ktm.com/en-us/models/motocross/2-stroke/2025-ktm-65-sx/technical-specifications.html | not shown | Seat height 730 mm. |
| `kawasaki-om` | Kawasaki, KX250/KX450 owner's manuals 2020-2027, Adjustable Ergonomics (sample: 2025 KX250, part 99814-0061, KTIVS public manual portal) | https://pws.ktivs.net/proxy/manuals/99814-0061-o5kx252esf-us-en_ebook-1caab68fb1b6f0bd0aca70be564f27dd/index.html | 2024 | Holder position changeable and holders turned 180 degrees (near/far); footpegs in one of two positions; gauge marks equal each side of the clamps; brake lever position adjustment. No millimetre figures. Every manual is listed per bike in `fit_honda_kawasaki_triumph_minis.json` (rfit-w-010 to rfit-w-028). |
| `kawasaki-2021-press` | Kawasaki, 2021 KX250 Model Information (press kit PDF, hosted by a German enduro site) | https://www.enduro.de/wp-content/uploads/2020/07/21_KX250_Model-Information.pdf | 2020-07 | Bar positions 25 and 15 mm forward, stock, 10 mm back; footpegs 5 mm lower (already in record kx-092). |
| `kawasaki-kx-page` | Kawasaki (Latin America), KX250 and KX450 model pages | https://guatemala.kawasaki-la.com/en-la/motorcycle/kx/full-size-mx/kx-250 | not shown | ERGO-FIT: 4 handlebar positions and 2 footpeg positions; medium-compound ODI lock-on grips. |
| `kawasaki-kx65-spec` | Kawasaki USA, 2025 KX65 spec sheet | https://www.kawasaki.com/en-us/products/ProductSpecSheetPDF/2025-kx65 | not shown | Seat height 29.9 in (759 mm). |
| `kawasaki-kx85-spec` | Kawasaki USA, 2025 KX85 spec sheet | https://www.kawasaki.com/en-us/products/ProductSpecSheetPDF/2025-kx85 | not shown | Seat height 32.7 in (831 mm). |
| `kawasaki-kx112` | Kawasaki USA, 2025 KX112 model page | https://kawasaki.com/en-us/motorcycle/kx/kx-youth-mx/kx-112/2025-kx112 | not shown | Seat height 34.3 in (871 mm). |
| `triumph-handbook` | Triumph, Owner's Handbook TF 250-X / TF 450-X / TF 450-RC Edition (3850672-US-EN) | https://api.triumphtechnicalinformation.com/handbooks/documents/697b0a68aa5a3d37f2aa2ef0/pdf | not shown | Bar ships in the rear position, lower clamps turned 180 degrees = 9 mm forward; rotation by degree marks on the bar; span adjusters; pedal height screw then 6-9 mm free play at the tip; shift pedal by spline. |
| `triumph-tf250x` | Triumph Motorcycles Australia, TF 250-X | https://www.triumphmotorcycles.com.au/motorcycles/off-road/motocross/tf-250-x-2024 | not shown | ProTaper ACF bar, ODI half-waffle lock-on grips, seat height 960 mm. |

## Part makers

| id | Publisher | URL | Published | What was taken |
|---|---|---|---|---|
| `renthal-2021-recs` | Renthal, selecting handlebar bends for modern motocross bikes | https://www.renthal.com/moto/2021-recommendations | not shown | Sweep, height and width matter most; taller or long-legged riders more height; long arms/wide shoulders wider; KTM-group width trimmed to 800-808 mm; rolling back adds sweep, forward takes it away; brand table (Fatbar36/Twinwall/Fatbar): KTM, Husqvarna, GasGas 934/999/821, tall 933/996/827; Honda, Kawasaki 933/996/827, tall 930/997/604; Yamaha 933/996/827, tall 931/998/603; Suzuki 933/996/839, tall 933/994/826. Honda moved to 839 from 2019 models, Kawasaki in 2021; KTM/GasGas stock bend matches 821; Husqvarna stock bar low but wide. |
| `renthal-fatbar36-bends` | Renthal, Fatbar36 bends and dimensions | https://renthal.com/moto/fatbar36-bends | not shown | Bm/Bv height definitions; Fatbar36 4 mm lower than Twinwall/Fatbar at Bm. |
| `renthal-839` | Renthal, 839 Fatbar | https://www.renthal.com/moto/839-01-HA | not shown | 802 / 91 / 51 / 131 / 51 / 200 mm (width, height, rise, clamp width, sweep, control length); "HON CRF 2018+". |
| `renthal-827` | Renthal, 827 Fatbar (Villopoto/Stewart) | https://www.renthal.com/moto/827-01-HA | not shown | 811 / 92 / 52 / 117 / 52 / 222 mm. |
| `renthal-604` | Renthal, 604 Fatbar (RC / Honda CRF 04-18 / Kawasaki KX/KXF 06-21) | https://www.renthal.com/moto/604-01-HA | not shown | 804 / 104 / 64 / 105 / 54 / 188 mm. |
| `venhill-controls` | Venhill (control cable and lever maker), lever and pedal adjustment article | https://www.venhill.co.uk/news/post/lever-and-pedal-adjustment-how-it-can-help-you-ride-further-and-faster | not shown | Road-riding article: seated lever angle as a straight line shoulder to fingertips with no wrist bend; reach under the first joint of index, middle and ring fingers, pulled without moving the hand; pedal just under the boot sole without bending the ankle, set in riding boots; constant arm tension when covering the lever. |
| `guts-foam` | GUTS Racing seat foam description, as published by a retailer (Mojo Motosport) | https://gb.mojomotosport.com/products/guts-suzuki-rmz450-phantom-ultra-light-weight-seat-foam-stock-height-8601-ph | not shown | Tall foam 1 in taller than stock, low foam 10 mm lower. |
| `ktm-low-seat` | KTM PowerParts low seat 79107940200, dealer catalogue listing (KTM Direct UK) | https://ktmdirect.co.uk/products/ktm-low-seat-15mm | not shown | About 15 mm lower, 2019-2022 SX/SX-F list. |
| `ktm-50sx-lowering` | KTM PowerParts 50 SX lowering kit 45412955044S, dealer catalogue listing (KTM Direct UK) | https://ktmdirect.co.uk/collections/ktm-50-sx-powerparts-accessories/products/lowering-kit-68mm-45412955044s | not shown | 68 mm lower, 2020-2023 50 SX. |

## Rider safety, medical, testers

| id | Publisher | URL | Published | What was taken |
|---|---|---|---|---|
| `msf-parents` | Motorcycle Safety Foundation, *Parents, Youngsters and Off-Highway Motorcycles* (copy hosted by the City of Porterville OHV park) | https://cms9files.revize.com/PortervilleCA/Document_Center/Department/Parks%20&%20Leisure/Parks%20&%20Facilities/OHV%20Park/Parents.Youngsters.Dirt_Bikes.pdf | 2003 | Fit checklist: both feet on the ground seated; standing with knees slightly bent and a few inches above the seat; turn bars fully; fingers around grips and levers, also with bars turned; throttle and brake while holding grips; feet firmly on pegs; brake pedal and shifter easily; if not, not physically ready. Strength to squeeze controls. No size-up thresholds published. |
| `ama-kids` | American Motorcyclist Association, Getting Started: Riding With Kids | https://americanmotorcyclist.com/riding/riding-101/getting-started-riding-with-kids/ | modified 2024-04-29 | Both feet touching the ground to hold the bike up; reach and operate all controls comfortably. No size-up thresholds. |
| `odowd-2021` | O'Dowd D.P. et al., Forearm compartment pressures and grip strength in elite motorbike racers with chronic exertional compartment syndrome, J Orthop Surg Res 16:603 | https://josr-online.biomedcentral.com/articles/10.1186/s13018-021-02765-z | 2021-10 | Forearm CECS in racers; gripping through acceleration and braking and brake-lever force named as the load; mean pressure 11.7 to 30.5 mmHg and grip strength down about 30% after a 2-minute brake-lever task (10 British Superbike riders). No setup interventions studied. |
| `lever-setup-mag` | Australasian Dirt Bike magazine, lever adjustment tech article (issue 522) | https://adbmag.com.au/editorial/lever-adjustment/ | 2023-06-21 | Lever bend matched to the extended first finger; final angle a straight line elbow-wrist-fingers standing in the attack position; unusual styles may go up or down; lever under the first knuckle of the first finger; leave some free play; tape under the perch so it rotates in a crash. Rider-facing text never names the magazine. |
| `bak-reasoning` | BAK reasoning | (none) | - | Steps worked out from the geometry with no numbers of their own: fit order, fore-aft effect of the bar, foam vs suspension lowering, grip position vs lever reach, the outgrown-bike read. |

## Not reached or not used

- ProTaper bend chart (https://www.protaper.com/bend-chart): permission prompt not answered; search results were spam
  copies. Retail listings with unnamed ProTaper bends were not used. **Gap: ProTaper, Neken and ODI bend dimensions.**
- MSF Dirt Bike School Tips & Practice Guide (Oregon Parks copy): permission prompt not answered.
- Yamaha owner's manual library (YZ65 / YZ85 owner's service manuals): 502 bot-protection response; not worked around.
- Honda US documentum CDN: 403 to automated download; the 2020-2027 CRF handbooks were read from copies of the same
  public PDFs already on file for the Honda manual pass (URLs above are Honda's).
- No maker publishes a rider-height-to-bar-height table, an inseam-to-seat-height table, or an age/height threshold for
  moving a child up a size; the module says so instead of inventing one.
