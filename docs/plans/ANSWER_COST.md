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

## Model comparison (2026-11-23)

60 mixed exam questions (20 suspension, 20 engine, 20 setup), one run each, through the private test route. Raw results in `docs/research/models/`.

| Model | Score | Full marks | Wrong | Median time | Cost per answer (warm) |
|---|---|---|---|---|---|
| gpt-6.1-sol (live) | 96.9 | 53/60 | 0 | 26.2 s | ~4.8 cents |
| gpt-6.2-sol | 95.6 | 50/60 | 0 | 18.1 s | ~5.0 cents |
| gpt-6.1-terra | 93.2 | 45/60 | 0 | 13.4 s | ~2.5 cents |
| gpt-6-luna | 90.2 | 44/60 | 0 | 14.2 s | ~0.3 cents |

By subject (sol 6.1 / sol 6.2 / terra / luna): suspension 98.8 / 97.5 / 97.5 / 93.3, engine 96.2 / 95.0 / 90.2 / 85.0, setup 95.7 / 94.3 / 92.0 / 92.2.

Caveats: single run, run-to-run noise is about 1 to 2 points. Cached-input prices for terra and luna were assumed at 0.05x of input (not listed). No model switch has been made.

## Trimmed the changing part (live 2026-11-23)

What changed:
1. Bike knowledge notes: 12 rows ranked by the rider's subject words within 16,000 characters, was 28 rows within 36,000. The old ranking let filler words ("the", "what") and a broad domain match fill the block: "What should it idle at?" carried dyno charts, sprocket part numbers and clutch plate interchange.
2. Workshop job list: titles only, was id + title + scope for every job. A selected job still arrives in full.

Checked on the private test route before going live (results in `docs/research/answer-cost/`):

| Run | Questions | Score | Full marks | Wrong | Input tokens | Cost per answer |
|---|---|---|---|---|---|---|
| Baseline, first run | 60 mixed | 96.9 | 53 | 0 | 63,482 | 4.8 cents |
| Baseline, second run (same settings) | 60 mixed | 94.9 | 49 | 0 | 64,228 | 4.9 cents |
| Trimmed knowledge | 60 mixed | 95.3 | 51 | 0 | 58,710 | 3.8 cents |
| Trimmed knowledge + short job list | 60 mixed | 95.2 | 50 | 0 | 57,560 | 3.6 cents |
| Stored baselines (11-21/22) | 120 other | 96.5 | 106 | 0 | n/a | n/a |
| Trimmed knowledge + short job list | same 120 | 96.1 | 105 | 0 | 58,676 | 3.9 cents |

Reading: the same settings run twice differ by 2 points, so the trimmed runs sit inside normal wobble. No run said anything wrong. The lower-scoring answers were read side by side: same facts, different wording. About 25% off the cost of an exam answer.

This also means the model comparison above is weaker than it looked: gpt-6.2-sol (95.6) ties the live model, and only gpt-6-luna is clearly lower.

Not yet touched: the rider's installed parts (13,700 characters when a full build sheet is saved), bike overview (5,300), published facts (8,300). The test route is capped at 600 questions a day, which is why this was 180 questions and not all 300.
