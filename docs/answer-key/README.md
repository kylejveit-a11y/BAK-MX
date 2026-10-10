# BAK MX answer key

The fixed set of rider questions BAK MX is scored against. Same questions every run, so a score change means the product changed.

Kyle owns this file. An agent may propose questions; only Kyle writes or approves what a correct answer must contain.

## How to write an entry

Add entries to `questions.json`. Each one:

| Field | What goes in it |
|---|---|
| `id` | Short, stable, never reused (`susp-014`). |
| `bike` | Exact year, make, model the question is asked about. Use bikes that have data (see `../TUNING_COVERAGE.md`) and a few that do not. |
| `build` | Anything about the rider or bike that should change the answer: weight, level, revalve, springs, exhaust, map. Leave empty for stock. |
| `ask` | The question exactly as a rider would type it. Slang, typos and half-information are the point. |
| `kind` | What a good answer is: `answer`, `setup` or `diagnosis`. |
| `must` | Things a correct answer has to say or do. Plain sentences. Three to six. |
| `must_not` | Things that make the answer wrong or unsafe. |
| `numbers` | `published` if it should quote the bike's verified value, `none` if no number should appear, `unknown` if it should say BAK does not have that value for this bike. |
| `why` | One line on what this question is testing. |

## What makes a good set

- About 150–200 questions. Roughly half setup and handling, a quarter engine and drivability, the rest service, parts lookups, buying and riding questions.
- Every question is one you have actually been asked, or asked yourself, at the track.
- Include questions where the right answer is "that is a fault, stop tuning" and ones where the right answer is "that is normal".
- Include bikes with no data, to check BAK says so instead of guessing.
- Do not write the answer you expect word for word. Write what it has to get right.

## Scoring

Each answer is graded per entry: every `must` met, no `must_not` hit, and the `numbers` rule followed. Pass or fail, no partial credit. The release gate and the pass rate it needs are Kyle's call once the first full run exists; do not set a number before seeing one.
