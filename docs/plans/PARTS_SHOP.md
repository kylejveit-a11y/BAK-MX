# Parts shop: the overhaul (started 2026-11-28)

Kyle, 2026-11-28: four riders called the Parts section "dumb" and "useless". Long lists, general names and part numbers,
no pictures, and a where-to-buy option buried several taps deep. "We don't stop till it's something real like any other
site market has."

## What was actually wrong (audit)

The data was never the problem. For a 2025 KTM 450 SX-F the list holds about 3,300 aftermarket products from 266 brands;
nearly every one has the store page it was found on, and about 95% have the price that store showed. The screen hid all
of it: the brand was a two-letter tile, the title was the bare product name, the part number was the biggest thing on
the card, factory parts (printed in the maker's shorthand, "BRAKE PAD SET RR.") came first, the stores sat behind a
"Where to buy" tap on each card, and prices were never shown. There were no filters and no sorting.
One real gap: there are no product pictures on file.

## What buyers like and hate (research, 2026-11-28)

- Baymard's 2026 benchmark of ten auto-parts sites: picking the vehicle first and only showing parts that fit is the
  part stores get right. Where they fall short is helping people choose between parts: clear specs, a picture of how
  the part sits, and ways to compare. No site scored "good".
- Riders on Vital MX (two threads): what they talk about is whether the part is really in stock, how fast it ships and
  price. Rocky Mountain is praised most; one rider calls its site hard to search. Stores showing "in stock" for parts
  they do not have is the top complaint.
- Partzilla reviews: praise is for finding the right part and easy ordering; complaints are shipping time and stock.
  One complaint was not being able to copy a part number.
- KTM Twins' own help page tells customers to start with year, make and model, use diagrams for factory parts and
  "shop by bike" for aftermarket, and admits parts can be hard to locate.

What that means for BAK: we already do the part stores are best at (fit to the exact bike). The work is everything
after that: real names, prices, pictures, filters, comparing, and never implying stock we cannot see.

## Stage 1: done 2026-11-28 (website live; app in the next build)

- Shop by area of the bike: 13 areas, each with what is inside and a count.
- Kind-of-part buttons with counts (Rotor 71, Pads 57...), brand filter, front or rear, sort by price or brand.
- Cards lead with the brand and the product's real name, what it is, the colours or sizes it comes in, the price, and a
  button for each store with that store's price on it. One tap from the card to the store page.
- Search by part or brand, same cards.
- Factory parts sit in their own section under the products, with tidied names and the diagram they come from.
- Second-hand listings (open box, blemished, previously installed) are left out. Handlebar pads no longer show under brakes.
- Prices are labelled as "when BAK last checked". Stock is never claimed.
- Server: `/api/parts/overview`, and `/api/parts/find?shop=1` with type, brand, position, sort and offset. Older app
  builds keep getting the old response.

## Stage 2: next

1. The same shop on the phone (FindPart.tsx in the app), in build 1.0.15.
2. Product pictures. The only clean source is a store's affiliate product feed (MotoSport application is in review).
   Until then no pictures are used: store and maker photos are theirs. The card layout has room for the picture.
3. Factory parts in plain words with the diagram picture beside them, so a rider can see where the part sits.
4. Product page: all sizes and colours with their part numbers, every store side by side, "riders also fit", and what
   BAK knows about the part (what it changes, cautions).
5. Fix the lists at the source: kinds of part for the items now under "Small parts and accessories", duplicate
   products listed under two brand spellings (KTM / KTM PowerParts), and a price refresh with the date shown.
6. "Fits my other bike too" and a compare view for two or three parts.

## Rules that stay

Never push sales. Rank by fit and the rider's chosen sort, never by payout. Nothing shown that is not on file for the
bike. When affiliate links start, one line says so.
