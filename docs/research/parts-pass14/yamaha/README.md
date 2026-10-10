# Yamaha inventory checkpoint

Paused at the user's request after finishing the active 2027 YZ250F catalog. No additional catalogs started after that instruction.

The planned roster has 80 exact model-year targets. Public MotoSport year indexes list 77, containing 3,366 observed assembly links. Two catalogs are fully captured and parsed: 2025 YZ250F (45 pages, 958 occurrences) and 2027 YZ250F (46 pages, 969 occurrences). Total: 91 pages, 1,927 occurrences, 1,872 retailer-explicit recommended quantities. The remaining 55 occurrence quantities are UNKNOWN, not inferred from purchase defaults. These are occurrence inventories with alternatives/kits, not deduplicated complete-bike bills of materials.

The 2025 pilot is copied into this normalized model-year tree. Count it once, not again from `../pilot/`. All 77 inventory files were parsed with zero validation errors. The other 75 are explicitly PARTIAL with all their assembly links in `missing`; they are indexed, not captured inventories.

Missing from the observed public year indexes: 2024 YZ250FX, 2027 WR250F, 2027 WR450F. This is catalog absence on this source, not evidence that the bikes did not exist. Independent OEM/other public catalog fallback remains undone.

`RECOVERY.json` gives exact target totals and remaining links. `queue.json` preserves the original 3,366 observed URLs; resume by skipping existing valid capture files, not by trusting a cursor. `target-discovery.json`, `years.json`, and `models-YYYY.json` preserve discovery. Each target index and capture includes exact URL identity; parsed inventory binds capture SHA-256. The ordinary browser captured only public main content; no database writes occurred.

Use `python scripts/motosport_inventory.py --directory docs/research/parts-pass14/yamaha/<year-model>` to rebuild one target offline. The pilot README documents browser capture. Direct urllib was 202 empty (plain request) or 403 (ordinary CookieJar homepage); no challenge bypass attempted. Edge ordinary navigation worked. Brief multi-tab command timeouts left no invalid captures and were recovered with sequential, disk-based resume.

Diagram image URLs are preserved. Diagram image visual/callout reconciliation beyond displayed rows is not yet performed, and cross-year compatibility is not inferred. No rebuild guidance or runtime fact promotion was part of this inventory task.
