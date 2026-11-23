# What an Ask BAK answer costs, and bringing it down (started 2026-11-23)

Kyle's brief: cut the cost drastically while keeping accuracy and the feel of the answers.

## Measured before any change (30 answers, last 7 days, all Kyle's testing, model gpt-6.1-sol)
- Every answer sends about 45,700 tokens that never change (the rules and the reference library) plus about 23,000
  that do (the rider's bike, parts, retrieved facts, workshop steps, the conversation).
- The fixed block is reused from the provider's cache at 5% of the normal price, but the cache lapses after 30 minutes
  without a question. 9 of the 30 answers arrived cold and paid to store it again: about $0.16 each instead of $0.065.
- The changing part was also being stored in the cache on every answer (a 25% surcharge) and almost never reused.
- Blended: about $0.09 an answer. Not counted: the small planning call before each answer.

## Done 2026-11-23 (no change to what the model reads, so no change to answers)
1. Keep-warm: every 20 minutes, unless a rider's answer just did it, a tiny request re-reads the fixed block so it never
   lapses. Confirmed in the logs: 45,737 tokens in, 45,723 from cache, nothing stored. About $0.005 each, at most
   about $10 a month, and answers no longer start cold.
2. Pinned prefix: the fixed block is marked as the only part to cache; the changing part is billed as ordinary input
   with no storage surcharge. If the provider rejects the shape the request is re-sent the old way.
Expected cost per answer after these two: about $0.058 (45.7k cached = $0.005, 23k fresh = $0.046, answer = $0.007).
Not yet confirmed on a real rider answer.

## Next: shrink the 23,000 tokens that change (this can affect answers, so it is tested first)
Largest parts when present (characters): rider knowledge notes for the bike 30,700; workshop steps 24,600; the rider's
installed parts 13,700; retrieved published facts 10,300; bike overview 5,400.
Plan: tighten each to what the question needs, run the three 100-question exams before and after, ship only if scores
hold and nothing invented appears. Needs the private test key, which expired 2026-11-23 00:56 UTC.
