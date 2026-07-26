# T-267 Self-Review: Traversal Result And Bind Conservation Design

Date: 2026-07-13
Reviewer: Codex
Disposition: repaired design is eligible for delegated F_H acceptance

## Boundary Reviewed

The design introduces one static compiler and gate over existing T-255/T-260
source carriers and existing GTL conformance rows. It does not introduce a new
`TraversalUnit` carrier, runtime controller, event family, plugin, manifest,
result parser, or Consensus-specific execution path.

The implementation boundary remains static:

```text
exact source + admitted result-interface authority
  -> existing composition/stage/result/conservation rows
  -> existing typecheckGtlProgram judge
  -> program-blocked or capability-blocked static truth, or runtime-addressable-not-closed truth
```

## Findings And Repairs

| Finding | Repair | Result |
|---|---|---|
| A locally coherent T-255/T-260 carrier could otherwise be copied from a different Module or owner | Made selected Module, exact execution subject, declaration owner, and GraphVector mandatory and required source recompilation before admission | repaired in D1 and proof matrix |
| A gate that filtered only unit-local issue rows could permit runtime effects despite unrelated whole-program invalidity | Static unit closure now preserves unrelated submitted-structure issues in a program-blocked outcome; runtime addressability still requires `report.passed === true`, zero issue count, exact inventory digests, and exact projected unit identity | repaired in D7-D8 and the post-acceptance amendment |
| A compiler-derived deterministic consequence row could be misread as an extra product-declared composition regime | Scoped it to constitutional ABG system-bind authority with empty plugin/hook sets, target/closure selectors, F_D projection admission, and explicit non-claim of a product regime | repaired in D4 |
| The selector-free HOF fan-out wrapper could bypass capability checks because T-255 returns `structural_only` before manifest admission | Kept structural fan-out capability-unresolved until T-268 supplies exact canonical coverage | repaired in D1/D8 |
| Static result-interface authority could be mistaken for an admitted F_P or F_H payload | Kept source authority and runtime payload admission separate; T-257 and T-258 remain the only raw-result/response admissions | repaired in D2 and lifecycle |
| A later T-268 manifest could accidentally change the structural contract basis | Required pre/post-manifest structural source and bundle digest equality; only capability disposition may change | repaired in D1/D9 |
| The old startup-blocked request could be treated as effect-ready after a separate static report passed | Required canonical runtime entry to consume the exact T-267 admission ref/digest with the original request or handoff | repaired in D8 and proof matrix |
| Selected work plus consequence did not satisfy the existing mandatory transform/evaluate/consequence composition law | Derived authority-denied ABG transform/evaluate boundary rows around the exact selected work authority; no runtime action or product regime is added | repaired in D3-D4 and the mandatory-stage amendment |

## Cross-View Judgment

- All sequence participants exist in the domain model or are the external
  caller.
- Every sequence decision is owned by source projection, result admission,
  contract compilation, the existing conformance judge, T-267 admission, T-268
  capability authority, or the existing ABG runtime.
- Every state transition names its owner.
- No raw probabilistic output reaches accepted or closed truth.
- No static state discharges an obligation or records runtime closure.
- The structural fan-out source remains visible and does not gain a local C
  selector.
- Capability admission and traversal conservation remain independent gates.
- The existing conformance report is the only final static judge.

## Proportionality Judgment

The design adds no base-algebra concept and does not rework T-255 or T-260
runtime machinery. The new public surface is limited to source/result
admission, a bundle over existing row types, and a closed gate outcome. The
larger alternatives are rejected:

- adding result/conservation fields to every GTL body would change the
  canonical T-252 body and duplicate existing conformance inputs;
- embedding conservation in T-255 would fabricate T-257 result authority;
- moving capability into T-267 would create a second manifest authority; and
- wiring stage execution here would duplicate T-259 through T-262.

## Gate Evidence

- three ordered Mermaid views are present;
- all three render under Mermaid CLI 11.3.0;
- standing design census is 14 files and 42 diagrams;
- cross-view and axiom matrices are complete;
- `git diff --check` remains required before checkpoint;
- no implementation file has been added or changed for T-267.

## Decision Recommendation

Accept the repaired T-267 three-view design under the delegated F_H authority
and authorize only the bounded static compiler, admissions, gate, focused
fixtures, T-252 probe integration, and generated publication updates described
by the design. Implementation must stop and re-enter design if it requires a
new topology type, product regime, event family, runtime controller, local C
selector, second conformance validator, or capability authority.
