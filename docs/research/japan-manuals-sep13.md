# Japanese OEM manual acquisition — September 13

**24 new research candidates, two newly read official manuals, zero runtime promotions.** Existing research was inspected first. These records add 2022 and 2024 standard US CRF250R service/spec coverage without copying the adjacent-year records.

| Exact target | Actual document | Inspection |
|---|---|---|
| 2022 Honda CRF250R, US standard | [31K95640 owner manual](https://cdn.powersports.honda.com/documentum/MWOM/ml.remawmom.2022_crf250r_rx_owner_s_manual.pdf) | Downloaded original OEM PDF; printed specification pages 70–71 visually checked locally; SHA-256 recorded. |
| 2024 Honda CRF250R, US standard | [31K95660 owner manual](https://cdn.powersports.honda.com/documentum/MWOM/ml.remawmom.ak952424omen.pdf) | Downloaded original OEM PDF; printed specification pages 70–71 visually checked locally; SHA-256 recorded. |
| 2023 Kawasaki KX250, US standard | [OEM manual index](https://www.kawasaki.com/en-us/owner-center/service-manuals/2023/KX252CPFNN) | Search discovery only; direct fetch redirects in a loop. Indexed item 99803-0306 is a lead, not a read manual. |
| Yamaha YZ250F, year/region unresolved | [BMF-2819U-10_02 manual lead](https://library.ymcapps.net/library/om/contents/pdf/10/BMF-2819U-10_02.pdf) | Discovered genuine OEM URL; direct fetch failed. No model-year assigned and no numerical facts extracted. |

The two Honda sources each contribute twelve concise candidates covering valve clearances, condition-specific oil/coolant fills, idle, lubricant classification, battery, plug, plug gap and fuse. The JSON contains the values and exact page locators. Publication cover/year and US/Canada statements establish scope; RX is excluded from automatic candidate applicability.

## A concrete reason year gating matters

The [2022 publication](https://cdn.powersports.honda.com/documentum/MWOM/ml.remawmom.2022_crf250r_rx_owner_s_manual.pdf) and [2024 publication](https://cdn.powersports.honda.com/documentum/MWOM/ml.remawmom.ak952424omen.pdf) differ in their API oil classification and battery listing. That is a documented publication difference, not evidence of universal battery interchange or a claim about 2023. Both year records remain separate.

## Verification and capture limits

The web screenshot tool returned references without visible images. The original public PDFs downloaded successfully through ordinary HTTPS; Poppler rendered the two specification pages in each, and the rendered images were inspected. No restriction bypass was used. Original-byte SHA-256 hashes are genuine and appear in the JSON. Full PDFs and page images remain temporary inspection material outside the repository; they are not distributed or claimed as a durable licensed archive.

These are short factual paraphrases, not copied procedures. No complete torque table, maintenance schedule or repair procedure was transcribed. Source-derived summaries and candidate wording remain below 200 words per Honda publication. Visual checking by the acquisition agent does not replace independent review, source conflict review or a commercial-use decision. No candidate was written to runtime tables.

## Remaining acquisition gaps

- Honda: 2023 CRF250R and 2022–2025 CRF450R exact US manuals still unresolved by this pass. Detailed competition/service manuals are needed for complete procedures, fault tests, suspension baselines and component identities. The earlier 2025/2026 sources remain separate existing work.
- Yamaha: no readable exact 2022–2023 US YZ250F/YZ450F manual recovered here. Current product pages and third-party uploaded manuals were not substituted for confirmed OEM model-year evidence.
- Kawasaki: no US manual body read here. The newly resolved 2023 KX250 index narrows authorized acquisition; it does not close the specification gap. Earlier Australian facts must remain region-limited.
- All: complete service procedures, torque conditions, wiring/fault codes, component revisions and stock-versus-aftermarket fitment remain incomplete. Owner-manual specification tables alone do not establish full diagnostic or maintenance coverage.
