# Decision - Accept S05, Select S06, Park S04

## Authority

Direct F_H instruction on 2026-07-28 accepted the reviewed S05 subject by
moving the Product frontier to S06:

> park [S04] ... implement S06 which is next in sequence

This is direct human acceptance, not delegated acceptance or a worker review.

## Accepted S05 Subject

- candidate:
  `1ddc802d3003a3d0782398f7ec7c74cfa81ab127`
- tree:
  `b50684077f95867a079b8f5435db10d61384b881`
- package:
  `7f5bbad797b85c5aff678aba225f409bfd168639a7c34a167af8fa08e1162376`
- evidence:
  `.ai-workspace/comments/codex/20260727T151414Z_HANDOFF_t270_s05_direct_exit_timeout_candidate.md`

The acceptance includes the already-required same-Run F_H hold, response, and
continuation topology. It does not authorize a direct support invocation,
second Run, second result authority, or later S05 repair.

## Selection

`ABG5-S06` is the sole selected implementation outcome under T-281 and parent
T-270. Its boundary is:

```text
one installed public contract
  -> native SDK
  -> native CLI
  -> bounded Codex CLI delegate
  -> independent flavored Product
  -> existing catalog publish -> apply -> invoke
  -> one HoG/ABG path and replay-derived result
```

The Codex surface is only a convenience shell. It owns no alternate Product,
Program, catalog, traversal, worker, event, continuation, retry, result, or
closure functionality.

The bounded pre-S06 Prime gate is the first realization step. It may commonize
only the four recurrence families already named by GOALS and T-270.

## Parked Subject

S04 design candidate `4897ead13d4d43bdd7538f74e3ce83888b03f5c6`
remains immutable review material. S04 design repair and realization are
parked until S06 closes and direct F_H selects that outcome again.
