# Fuel plan: sources

Used by `shared/fuel-plan.ts` (the rider's race-day and practice-day plan) and `shared/fuel-plan-knowledge.ts` (Ask BAK).
The id in backticks is the `FuelSourceId` each plan item and fact carries. The app shows the short label; the model gets
the short label only, never a URL.

General sports-nutrition education, not medical advice. Authored 2026-11-08, pending review by Kyle.

**Accessed:** every source below was listed on 2026-11-08 from the brief Kyle approved. The citations are the published
versions; the full texts were **not** re-read in this pass, so the numbers are as the brief states them. Re-read each
source before calling this reviewed.

| id | Source | Published | Used for |
|---|---|---|---|
| `joint2016` | Thomas DT, Erdman KA, Burke LM. Position of the Academy of Nutrition and Dietetics, Dietitians of Canada, and the American College of Sports Medicine: Nutrition and Athletic Performance. *J Acad Nutr Diet* 2016;116(3):501–528 (also *Med Sci Sports Exerc* 2016;48(3):543–568). doi:10.1016/j.jand.2015.12.006 | March 2016 | No carb-loading for efforts under 90 min; 7–12 g/kg/day reference; pre-event meal 1–4 g/kg 1–4 h before (BAK uses 1–2 g/kg at 3–4 h, toward 1 g/kg when closer); recovery 1.0–1.2 g/kg/h for the first hours when the next session is under 8 h away; protein 0.3 g/kg (20–30 g) after; familiar low-fat, low-fiber food. |
| `burke2011` | Burke LM, Hawley JA, Wong SHS, Jeukendrup AE. Carbohydrates for training and competition. *J Sports Sci* 2011;29(sup1):S17–S27. doi:10.1080/02640414.2011.585473 | 2011 | Carb-loading (10–12 g/kg/day for 36–48 h) only for events over 90 min; no carbohydrate needed during efforts under ~45 min. |
| `acsm2007` | American College of Sports Medicine; Sawka MN, Burke LM, Eichner ER, Maughan RJ, Montain SJ, Stachenfeld NS. Exercise and fluid replacement (position stand). *Med Sci Sports Exerc* 2007;39(2):377–390. doi:10.1249/mss.0b013e31802ca597 | February 2007 | 5–7 mL/kg at least 4 h before; extra 3–5 mL/kg about 2 h before if urine is dark or scant; sodium 20–50 mEq/L (460–1,150 mg/L); avoid >2% body-mass loss; after exercise 1.25–1.5 L per kg lost; never gain weight; urine colour. |
| `nata2017` | McDermott BP, Anderson SA, Armstrong LE, et al. National Athletic Trainers' Association position statement: fluid replacement for the physically active. *J Athl Train* 2017;52(9):877–895. doi:10.4085/1062-6050-52.9.02 | September 2017 | Individual sweat testing; drink to replace losses without exceeding them; refuel within 2 h; hyponatremia signs. |
| `nata2015` | Casa DJ, DeMartini JK, Bergeron MF, et al. National Athletic Trainers' Association position statement: exertional heat illnesses. *J Athl Train* 2015;50(9):986–1000. doi:10.4085/1062-6050-50.9.07 | September 2015 | Heat red flags; "cool first, transport second" for suspected heat stroke. |
| `baker2017` | Baker LB. Sweating rate and sweat sodium concentration in athletes: a review of methodology and intra/interindividual variability. *Sports Med* 2017;47(Suppl 1):111–128. doi:10.1007/s40279-017-0691-5 (Gatorade Sports Science Institute) | March 2017 | Sweat-rate formula (pre − post + fluid in − urine out) ÷ time, minimal clothing, dried off; several-fold variation between athletes, which is why BAK uses no default. |
| `issn2021` | Guest NS, VanDusseldorp TA, Nelson MT, et al. International Society of Sports Nutrition position stand: caffeine and exercise performance. *J Int Soc Sports Nutr* 2021;18(1):1. doi:10.1186/s12970-020-00383-4 | January 2021 | 3–6 mg/kg about 60 min before is effective; BAK uses 2–3 mg/kg (the conservative low end, a BAK choice), adults only, opt-in, only for riders who already use caffeine. |
| `aap2011` | Committee on Nutrition and the Council on Sports Medicine and Fitness. Sports drinks and energy drinks for children and adolescents: are they appropriate? *Pediatrics* 2011;127(6):1182–1189. doi:10.1542/peds.2011-0965 | June 2011 | No energy drinks (caffeine and stimulants) for children and adolescents; water as the main drink; sports drinks only for prolonged, vigorous activity. |
| `aapHeat` | Council on Sports Medicine and Fitness and Council on School Health; Bergeron MF, Devore C, Rice SG. Policy statement: climatic heat stress and exercising children and adolescents. *Pediatrics* 2011;128(3):e741–e747. doi:10.1542/peds.2011-1664 | September 2011 | Scheduled drinking for young athletes in heat. The brief's figure, about 120–240 mL (½–1 cup) every 15–20 min during activity periods, is used as given; the policy's own examples are weight-based (roughly 5 oz for a 40 kg child and 9 oz for a 60 kg adolescent every 20 min, from memory, to re-check). |
| `jeuk2017` | Jeukendrup AE. Training the gut for athletes. *Sports Med* 2017;47(Suppl 1):101–110. doi:10.1007/s40279-017-0690-6 | March 2017 | Rehearsing race-day foods and timing on practice days reduces gut trouble; nervous-stomach adjustments. |
| `usda` | U.S. Department of Agriculture, Agricultural Research Service. FoodData Central. https://fdc.nal.usda.gov/ | Ongoing (SR Legacy 2018) | Approximate carbohydrate per portion (table below). |
| `practice` | Practitioner convention (sports dietitians' common practice, not a position-stand number) | — | Snack 15–30 g 30–60 min before; gate-shift rules; last solid food 60–90 min before a gate. |
| `bak` | BAK convention | — | Anchoring every item to "time to the next gate drop"; reading 80 °F (27 °C), or 75 °F with 60%+ humidity, from a forecast as "hot or humid". |

## What the app never does

- No calorie counting, no weight goals, no "ideal weight". Weight scales portions and the sweat test only and is never
  shown on the plan ("Fluid to replace: 700 mL", never a body weight). Height is stored and not used.
- Under 18 (youth mode, enforced in code and tests): portions and cups only, no grams or calories, no caffeine, no energy
  drinks or supplements suggested, water as the main drink.
- No fixed motocross sweat rate: none is published. The plan asks for a personal sweat test and uses it once logged.
- Refer out before use: diabetes (especially insulin), kidney, heart or blood-pressure conditions, sickle cell trait,
  previous heat illness, current illness/vomiting/diarrhea (blocks the plan outright), medications affecting heat or
  fluids, pregnancy, a history of disordered eating (also switches off every gram figure).

## Foods: approximate carbohydrate per portion

Labelled "approximate" in the app. Values are the brief's figures; the plan uses the number in the last column.

**USDA check status (2026-11-08):** the FoodData Central API returned `OVER_RATE_LIMIT` on the shared `DEMO_KEY`
after one result, and the fdc.nal.usda.gov page fetch was not approved in this session. Only jam was checked live.
The rest still need checking against FDC before review: get a free API key at https://fdc.nal.usda.gov/api-key-signup
and search SR Legacy for each food.

| Portion (as shown) | Brief | Used | FDC check |
|---|---|---|---|
| 1 plain bagel | ~50 g | 50 g | Not yet checked (SR Legacy "Bagels, plain, enriched") |
| 1 tbsp jam | 13 g | 13 g | **Checked:** FDC 169641 "Jams and preserves", 68.9 g carbohydrate per 100 g; 1 tbsp ≈ 20 g → ≈ 13.8 g |
| 1 tbsp honey | 17 g | 17 g | Not yet checked (SR Legacy "Honey", per tbsp 21 g) |
| 1 banana | ~27 g | 27 g | Not yet checked (SR Legacy "Bananas, raw", medium) |
| 1 cup cooked white rice | ~45 g | 45 g | Not yet checked (SR Legacy "Rice, white, long-grain, regular, enriched, cooked") |
| 1 packet instant oatmeal | ~27–30 g | 28 g | Not yet checked (varies by brand; plain packet) |
| 1 PB&J sandwich | ~40–45 g | 42 g | Composite; not an FDC item. Only 2 h or more before a gate |
| 1 oz pretzels | ~23 g | 23 g | Not yet checked (SR Legacy "Snacks, pretzels, hard, plain, salted"); sodium ~350 mg per oz is approximate |
| 2 fig bars | ~20–22 g | 21 g | Not yet checked (SR Legacy "Cookies, fig bars") |
| 1 applesauce pouch | ~12–15 g | 13 g | Varies by brand (unsweetened ~90 g pouch); label check |
| 1 rice cake | ~7 g | 7 g | Not yet checked (SR Legacy "Snacks, rice cakes, brown rice, plain") |
| 20 oz sports drink | ~36 g, ~270 mg sodium | 36 g, 270 mg | Product label (Gatorade Thirst Quencher 20 fl oz); 270 mg in 591 mL ≈ 457 mg/L, the low end of ACSM's range |
| 10 oz sports drink | half of the above | 18 g, 135 mg | Derived |
| 8 oz chocolate milk | ~25 g + 8 g protein | 25 g, 8 g protein | Not yet checked (SR Legacy "Milk, chocolate, lowfat") |

## Formulas as implemented (tests: `tests/fuel-plan.test.ts`)

- Pre-race meal: 1–2 g/kg 3–4 h before the first gate (nervous: 4 h, 1–1.5 g/kg); 2–3 h: 1–1.5 g/kg; 1–2 h: 0.5–1 g/kg as a
  snack-style meal; under 1 h: no meal.
- Fluids: 5–7 mL/kg at least 4 h before; 3–5 mL/kg at 2 h only if urine is dark or scant.
- Between motos (gap of 2 h or more): (1.0–1.2 g/kg/h) × hours from 15 min after the moto until solid food stops
  (75 min before the gate, 90 with a nervous stomach), capped at 4 h; split 60/40 or 50/30/20, bulk first; protein
  20–30 g (~0.3 g/kg) with the first feed only. Gap 1–2 h: one 15–30 g easy snack, no protein. Under 1 h: sips only.
- Sweat rate (L/h) = (pre kg − post kg + fluid drunk L − urine L) ÷ hours. Per moto = rate × moto minutes ÷ 60. Between
  motos: 80–100% of that, ceiling 100%. After the last moto: 1.25–1.5 × that.
- Caffeine (adults, opt-in): 2–3 mg/kg about 60 min before the first gate.
- Gate shifts: delayed ≥ 60 min → 15–30 g top-up 45 min before the new time; moved earlier with the last meal under 2 h ago
  → sips only; ≥ 4 h until the gate → a full meal.
