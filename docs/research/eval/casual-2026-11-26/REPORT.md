# Casual-talk run, 2026-11-26

154 conversational, educational questions (no troubleshooting) through the evaluation route, each aimed at one knowledge
record loaded in the November pre-2020 push. Files: `questions.json` (question, bike, target record), `scored.json`
(answer text, rows handed to the answer, number matches), `gen.py` (how the set was drawn).

## Result (live behaviour, commit 69b4a90f)
- 154 of 154 answered, all as plain answers (no diagnostic hypotheses on any). Median 16.3 s, 90th percentile 21.3 s.
- Target record handed to the answer: 135 of 154. Target record cited in the answer's claims: 116.
- Share of the record's own numbers that appear in the answer: 0.62 on average; 0.91 for tester suspension settings.
- Failure found: 12 of 20 "how did my bike stack up against the competition / what did the magazines think" questions were
  handed zero knowledge rows, because the word ranking needs a subject word shared with a row. The answers were honest
  ("I can't confirm the 2018 magazine tests here") but the shootout rows were on file.

## Fix, test-only (commit 5c1f48d8, `trial.overview`)
`withOverview` in `server/knowledge.ts`: when the ranking returns fewer than four rows and the question reads as a
reputation or rundown question, fill to six with the bike's core rows. Re-run of 74 questions with the flag:
shootout questions 8 of 20 -> 20 of 20 found, number share 0.56 -> 0.73, median time unchanged (17.4 s -> 17.1 s).
Other categories unchanged within noise. Not live: the live route does not pass the flag.

## Smaller findings
- A row whose topic shares one subject word with the question but whose domain is not hinted scores 2 and is dropped
  (example: "Is the stock gearing right?" against a setups-domain row titled "2013-2016 gearing").
- The anonymiser hid a model name ("FE 501" became "a tester") because the source name contained it; source renamed and
  the row reloaded. A scan of every load file found no other case in the November push.
