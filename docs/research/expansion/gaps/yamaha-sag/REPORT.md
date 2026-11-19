# Yamaha standard sag (sunken length), older WR and YZ — 18 November 2026

Reader: `scripts/gaps/yamaha_sag.py`. It takes only the Tuning-chapter sentence "set the rear shock absorber sunken length to
the standard figure A–B mm (a–b in)", requires every occurrence in the document to agree, checks millimetres against the
printed inches, and refuses a sentence with a market tag.

65 Owner's Service Manuals 2010–2020 were downloaded from Yamaha's library and read; all 65 print 90–100 mm (3.5–3.9 in).
64 of the 65 files matched the SHA-256 recorded when their specification tables were loaded (the 65th had no earlier hash).
Two pages were checked by eye (WR250F 2016, PDF page 145, printed 4-6; YZ125 2015, PDF page 233, printed 7-14).

Loaded through `private.stage_manual_rows` (hash-guarded), path
`Rear suspension setting / Choosing set length / Standard figure (sunken length, rider seated)`, then verified:
WR250F 2010–2013 and 2015–2017, WR450F 2010–2018, YZ250FX 2018 (17 bike-years). The other 48 bike-years already had the
row; the load left them untouched.

Correction to the first audit of this date: it counted 82 Yamaha bike-years without sag because its pattern did not
recognise "sunken length". The real number was 17 plus the YZ65 / YZ85, whose owner's manuals print no sag figure
(see ../maker-publishing/REPORT.md). Yamaha now has a sag figure, or a recorded "not published", for every roster bike-year
except YZ65 2026 and YZ85 2022–2027 (no manual read).
