# HANDOFF: T-266 Repaired, Renewed Review Pending

- ticket: T-266
- branch: `codex/t266-stage`
- repair_commit: `39727f9`
- prior_checkpoint: `2e070d8`
- origin_main_basis: `9340725`
- state: repair complete; ticket active; renewed closure review pending

## Review Outcome

The first external review blocked the checkpoint on branded-term widening,
open variadic tuple cardinality, and an internal raw fan-in helper. The reviewer
then corrected the ranking under the trusted-desktop threat model: only the
variadic tuple was a proportionate blocker. The user directed that completed
repairs not be unwound and that no further algebra or constructor redesign be
derived from them.

The branch therefore retains all three completed repairs while explicitly
recording that low-probability, downstream-fail-closed findings must be ranked
against repair churn and delivery delay before becoming closure blockers.

## Retained Repair

1. Ordinary and Node-backed native C terms have disjoint, non-enumerable
   `nativeMode` literals. Node-backed terms still require private constructor
   authority. Canonical C bytes are unchanged.
2. Open variadic TypedNode tuples are refused at `typedInterface` construction
   and independently at C/GraphVector exact-tuple boundaries.
3. Product fan-in construction is private to the witnessed HOF path. The core
   module no longer exports a `(GraphFunction, Node)` fan-in shortcut; malformed
   M03 fixtures author ordinary declaration data directly.

## Final Evidence

- focused T-266: 125/125
- standing GTL law: 82/82
- full semantic: 1559/1559
- T-223 packed/publication differential: 70/70
- T-250 version/documentation integrity: 13/13
- Mermaid design gate: 5/5
- origin/main-relative diff witness: 798 executable changed lines witnessed,
  724 changed lines non-executable, zero violations
- strict TypeScript, semantic lint, seven-constructor authority guard: pass
- 63 public schemas and 33 generated publication assets from 1017 immutable
  payload files: exact
- packed dry run, packed public containment, zero-Consensus scan, and
  `git diff --check`: pass

Repair review:
`.ai-workspace/comments/codex/20260713T012503Z_REPAIR_REVIEW_t266_proportional_findings.md`.

## Review Focus

1. Confirm `nativeMode` is native-only and non-enumerable, and no ordinary C
   bytes changed.
2. Confirm inferred Node-backed terms cannot assign to ordinary
   `CProgramTerm`, while explicit type erasure remains outside the guaranteed
   proof boundary.
3. Confirm both open variadic construction and predeclared open interface entry
   are compile-negative.
4. Confirm `core.ts` exports no raw fan-in constructor and the packed public
   witnessed API remains unchanged.
5. Confirm the proportionality correction prevents these retained repairs from
   expanding into further substrate work.

## Stop Condition

Do not move T-266 to `completed/` from this handoff alone. Closure still
requires the renewed user/independent verdict. No successor realization is
lawfully unblocked until that ruling.
