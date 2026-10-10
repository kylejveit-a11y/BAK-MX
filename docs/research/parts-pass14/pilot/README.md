# MotoSport catalog acquisition pilot

Exact target: standard US 2025 Yamaha YZ250F. Public catalog index: https://www.motosport.com/dirtbike/oem-parts/yamaha/2025/yz250f

All 45 observed assembly pages captured September 21, 2026 using ordinary Edge navigation. The index includes one title-only page. Parsed inventory contains 958 catalog occurrences and 787 distinct part numbers; alternatives, kits and repeated assembly appearances remain separate. This is a retail catalog inventory, not an assertion that all items belong simultaneously on one bike.

931 rows explicitly say “manufacturer recommends a quantity of N” in the part link accessibility label. The parser records that retailer-attributed statement separately from the purchase input value. The other 27 unavailable-part rows have UNKNOWN quantity. No purchase default is promoted to a required quantity, and installed whole-bike quantities remain unknown. There are 148 explicit supersession rows; direction is current part supersedes named old part.

`inventory.json` includes each diagram image URL, part URL where available, callout, description, source timestamp and evidence SHA-256. `captures/` holds the main-element DOM for every observed page; no account or header data was saved. A header ride preference can differ from the actual catalog: identity checks use catalog H1 and exact assembly URL. Diagrams were referenced by URL, not individually visually reconciled; diagram callout completeness beyond displayed catalog rows remains unverified.

## Reuse and recovery

`python scripts/motosport_inventory.py --directory docs/research/parts-pass14/pilot`

The stdlib-only parser is offline and resumable. Missing pages produce PARTIAL status and a missing list. Identity errors or missing diagrams reject the page. Capture `index.json` with `{target:{manufacturer,year,model,region,variant},url,captured_at,assemblies:[{name,url}]}`. For each observed assembly href save `captures/<last URL path component>.json` with `{url,title,html,captured_at}`; percent-encoded filename components are retained.

Browser acquisition uses supported CUA Edge APIs. First read the model index and extract actual assembly links from the DOM. Navigate those observed URLs and verify the exact H1 before saving. DOM capture: `tab.playwright.evaluate(() => ({url:location.href,title:document.querySelector('h1')?.textContent.trim(),html:document.querySelector('main')?.outerHTML}))`. Save returned data with local fs; this is artifact writing, not a second browser driver. Reuse saved captures after interruption. Stop on a challenge/identity failure. Do not fetch private endpoints or bypass blocks. Direct urllib returned HTTP 202 with an empty body; supported Edge loaded normally. Edge content.export is unsupported, so DOM-backed capture was used.

`python docs/research/parts-pass14/pilot/test_parser.py` checks real four-row oil-cleaner output, header exclusion, supersession direction, absence of quantity inference from cart input, wrong-year/wrong-assembly rejection and full-index reconciliation.

No database, runtime library, frozen procedure or original source files were changed. Catalog capture does not imply rebuild coverage, fitment interchangeability, or launch readiness.
