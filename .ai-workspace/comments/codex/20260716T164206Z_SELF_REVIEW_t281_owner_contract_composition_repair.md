# T-281 Owner-Contract Composition Repair Self-Review

- ticket: T-281
- change_class: design_reframe
- candidate_digest: `77d413ec253958d61c15a32c23bd66a235aed5ab4115cb460ca30f9f81cb711c`
- verdict: candidate ready for independent review; P1 implementation remains blocked

## Corrections

1. `run.continue(selected_action)` now matches the accepted T-272 owner
   contract: callers supply continuation and next-action projection identity,
   while selected action remains projection-owned.
2. `interaction.respond` exposes only the `responded` non-terminal outcome.
   The containing run remains held through its separate continuation state; the
   operation does not author a second `held` outcome.
3. T-274A owns only the case-specific `TicketConsensusProjection` result
   coordinate. T-281 owns one generic `project.read` request/refusal wrapper
   and explicit absent non-terminal truth for all 27 cases.

## Conservation

- no ontology atom, composition, feature, capability, or public identity was
  added or removed;
- the Prime census remains 19 public identities, 35 non-read variant keys, 27
  read cases, and 62 definition keys;
- M03 remains independent of M04;
- T-274A does not gain a hidden operation or wrapper authority;
- P1 remains all-or-nothing and emits a typed non-empty gap set until every
  owner slot resolves.

## Verification

- `npm run check:design-mermaid`: passed;
- `npm run check:prime-contraction`: passed, 9 accepted designs;
- `git diff --check`: passed.

Runtime and publication tests were not run because this checkpoint changes no
runtime or published product surface. Independent design review remains the
next gate before the repaired P1 design can govern implementation.
