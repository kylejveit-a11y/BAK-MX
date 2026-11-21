# Parts hunter: design for Kyle's approval (2026-11-21)

Kyle's rules (2026-11-19): never push sales. Offer only when a part is actually needed. Too little is better than too much.
Rank by fit, never by payout. Commission, once there is any, is disclosed.

## What the rider sees

1. **Find a part (the rider opens it on purpose).** A button on the bike's Parts screen and in the Garage. The rider's bike is
   already chosen. They type what they need ("rear brake pads", "clutch cable", "fork seals") or pick a category.
   The list shows only parts on file as fitting that exact bike and year: brand, part name, part number, the years it fits,
   and "Factory part" or "Aftermarket". Each part has two buttons: **Save to my parts list** and **Where to buy**.
2. **Where to buy.** A short list of stores, each opening that store's own search for the part number. No prices and no
   stock are shown, because BAK has no live price feed; the store's page is the source. Stage 1 links earn nothing.
   When affiliate programs are approved (after the Google launch), the same links carry the affiliate tag and the screen
   says so in one line: "BAK may earn a small commission. It never changes which parts are shown."
3. **Inside Ask BAK.** When an answer ends with "replace X" and a matching part for the rider's bike is on file, one quiet
   line appears under the answer: **"See parts that fit your bike"**. Tapping it opens Find a part already filtered.
   BAK does not write a sales pitch in the answer text.

## Limits that keep it from feeling like a store

- At most one offer line per conversation. If the rider ignores it, it does not come back in that conversation.
- Never on safety answers (brakes failing, fuel leak, crash checks) until the safety part of the answer is finished,
  and never while BAK is still asking questions to find the fault.
- Never when no part on file fits the bike: BAK says nothing rather than pointing at a generic search.
- The order of parts is: factory part first, then aftermarket by how well it matches the request. Payout is never an input.
- A rider can switch the offer line off in Preferences ("Suggest parts in Ask BAK").

## What is already built and what is new

Already there: the parts lists per bike (factory and aftermarket, with part numbers), the bike Parts screen, the saved
parts list, and the part matching Ask BAK already uses for springs and installed parts.
New: the Find a part search screen (app and web), the Where to buy sheet, the offer line under answers and its rules,
the Preferences switch, and a small table of stores with their search links.

## Not in this stage

Live prices, stock, ordering and order tracking. These need agreements with stores and are not confirmed possible.

## Decisions needed from Kyle

1. Which stores to list in "Where to buy" before any affiliate deal exists (suggestion: Rocky Mountain ATV/MC, MotoSport,
   Partzilla for factory parts, and the part maker's own site).
2. Whether the offer line under Ask BAK answers ships in 1.0.12, or only the Find a part screen first.
