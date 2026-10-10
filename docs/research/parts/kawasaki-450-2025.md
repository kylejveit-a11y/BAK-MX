# 2025 Kawasaki KX450 US parts research — incomplete

Reviewed 2026-09-13. Standard **KX450MSFNN** only. No database promotion.

The JSON contains **56 dealer assembly labels and 24 manufacturer-indexed part rows across four assemblies**. Three manufacturer tables were captured in full as exposed by search; only one fork fastener was captured. This is not a complete bike inventory or an independently verified purchasing list.

The [RevZilla fiche](https://www.revzilla.com/oem/kawasaki/2025-kawasaki-kx450/owners-tools) exposes the model-specific assembly navigation and identifies the fitment as KX450MSFNN. Its 56 labels are enumerated once in the JSON. The official [model index](https://www.kawasaki.com/en-us/owner-center/parts/2025/KX450MSFNN) was found but direct retrieval looped, so the dealer list has not been reconciled against the manufacturer index. Crankcase and valve secondary diagrams remain separate.

| Captured assembly | Rows | Evidence |
| --- | ---: | --- |
| Oil Filter | 10 | [Official table](https://www.kawasaki.com/en-us/owner-center/parts/356627/2025/KX450MSFNN), search-index full table |
| Engine Shrouds | 9 | [Official table](https://www.kawasaki.com/en-us/owner-center/parts/356633/2025/KX450MSFNN), search-index full table |
| Owner's Tools | 4 | [Official table](https://www.kawasaki.com/en-us/owner-center/parts/356658/2025/KX450MSFNN), search-index full table |
| Front Fork | 1 | [Official PDF](https://www.kawasaki.com/en-us/OwnerCenter/DownloadDiagramPdf/327041?modelcode=KX450MSFNN&modelyear=2025), indexed snippet only |

Each row retains assembly, callout, part number, description, source quantity, source URL, and evidence status. Fasteners include five distinct oil-filter/shroud bolt rows plus one fork bolt. Two shroud alternatives are explicitly marked OPTION. Quantities are assembly-table values: do not sum options, service materials, or nested assemblies into a whole-bike count. Diagram images were not retrieved.

The [official manual listing](https://www.kawasaki.com/en-us/owner-center/service-manuals/2025/KX450MSFNN) identifies **Owner's Manual, KX450M/N (2025), item 99814-0003** and advertises VIEW MANUAL. Direct access looped; the viewer destination and manual contents were not recovered. No maintenance intervals, torque, clearances, or other manual facts were extracted.

An unresolved supersession appears at oil-filter callout 92055A: the manufacturer index shows 92055-1011 while the [dealer fiche](https://www.rpmcyclesnc.com/Parts/Parts-Finder/kawasaki/motorcycles/2025/kx450-kx450msfnn/oil-filter/6d0730b5-1072-4a63-ad19-51f774aae574) reports 92055-1021 as its replacement. The JSON preserves the manufacturer-indexed number and records the discrepancy separately.

[MotoSport's oil-filter fiche](https://www.motosport.com/dirtbike/oem-parts/kawasaki/2025/kx450/oil-filter) returned a JavaScript robot check. Official PDF and manual direct reads returned redirect loops. No access control was bypassed. Remaining work: obtain live exact-market source tables, reconcile assembly list and revisions, resolve supersession, inspect all diagrams, and extract the remaining parts. Public visibility alone does not establish redistribution permission; no diagrams or full manuals are bundled.
