# Grading rubric v2 (2026-11-04)

What changed from v1, after checking how the first 100 were graded:
- **Grade only what BAK was given.** In run 1 the graders could see `rider_context` (details from the forum thread that were
  never sent to BAK) and marked answers down for "ignoring" them (a lowering link, the rider's age, 135 hours, jetting
  already tried, valves already measured). From set 2 the rider's details are sent with the question, and the grader sees
  exactly the message BAK received, the bike and the saved weight. Nothing else.
- **Check numbers against the source, not memory.** Each answer comes with the published facts BAK cited (`cited_facts`,
  from the maker's manuals). A number that matches a cited fact is correct even if it differs from what you remember (run 1
  flagged the YZ450F valve clearances, which match Yamaha's manual). A number with no cited fact behind it that you believe
  is wrong goes in `numbers_to_verify` with what you think it should be; it is only `wrong_fact` after it is checked.
- **Write your own answer first.** Before reading BAK's answer, write in one or two lines what a top MX mechanic would tell
  this rider (`expert_take`). Then grade BAK against it. This stops the answer you are reading from setting the bar.
- **Two graders per answer, blind to each other.** Every answer is graded twice; where the overall letters differ by two or
  more, or one grader flags safety or a wrong fact, the answer is reviewed again before the report.
- **Anchors** (from run 1, agreed): a rider at 6 mm fork height asking "how much should I go?" who is told to go to 4 mm
  without being asked why = **D** (picked a direction with no goal); the same question answered with what each direction
  does, the step size and "what are you trying to fix?" = **A**. Gearing answers with the exact % change and what it feels
  like = **A**. "Fitment not confirmed, ask for a dyno chart" with no pick = **C**. "I don't have firsthand experience" = at
  most **C**.

Scores 1-5: **correct, useful, safe, rider_words, bike_specific, concise** (as in v1). Overall **A-F**:
A = a pro mechanic would say exactly this; B = good, one small gap; C = okay but generic, hedged or slightly off;
D = misleading, picks the wrong direction, or doesn't answer; F = wrong or unsafe.

Flags: `wrong_fact` (only when checked against a source or certain), `wrong_direction`, `missed_question`,
`asked_instead_of_answered` (asked for something the message or bike already gave, or that wasn't needed to answer),
`ignored_given_detail`, `made_up_number`, `leaked_internals` (talks about its notes, files, evidence ids, "our research"; an
in-app line like "save this with the button below" is NOT a leak), `chatbot_voice`, `too_long`, `unsafe`.
