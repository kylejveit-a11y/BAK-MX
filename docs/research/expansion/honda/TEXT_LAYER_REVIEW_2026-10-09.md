# Honda competition handbooks — setup facts, text-layer review, 2026-10-09

Scope: the ten Honda Competition Handbooks already cited by this project (CRF250R and CRF450R, 2022–2026), served from
`cdn.powersports.honda.com`. Facts only, each with URL, SHA-256, PDF page and printed page.

## What was added

177 verified facts, 15–19 per bike, for the standard R model:

- Fork compression and rebound standard positions (clicks from stiffest)
- Shock high-speed compression (turns from stiffest), low-speed compression and rebound standard positions
- Race sag for the standard, optional soft and optional stiff spring
- Shock spring install length with the standard spring
- Intake and exhaust valve clearance, idle speed, oil viscosity, oil capacities, coolant concentration
- Drive chain slack, and standard chain links where the page clearly belongs to the R model

## Method and checks

1. Each handbook was fetched in a browser from Honda's CDN and hashed before reading. Nine hashes equal the hashes recorded in September.
2. Values were read from the document text layer on the line labelled for the R model (`CRF450R: 10 clicks`). The handbooks also cover RX and RWE, which differ.
3. After the rows were written, all 192 page / printed-page / value combinations were checked back against the page text: 192 of 192 found.
4. A row was not added when the same fact was already on file for that bike (idle speed, oil capacity on some years).

## Left out on purpose

- CRF250R oil capacity "at oil filter change": the handbook prints "at draining" on two different quantities, so the middle figure is ambiguous in the source.
- Standard chain links for CRF450R 2022–2024: the page could belong to either the R or the RX section.
- Fork oil capacity: the handbook does not say on the same line which chamber the figure is for.
- Maintenance schedule: the interval marks lose their column in the text layer.

## One handbook changed on Honda's server

The 2025 CRF250R handbook now hashes to `648251e7…be857b`; September's facts cite `0f7db013…2efac0`. New rows cite the hash actually read.
