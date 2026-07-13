# T-259 `workflow.C` Runtime Design Self-Review

**Date**: 2026-07-13
**Subject**: `M03_WORKFLOW_C_RUNTIME_BEHAVIOR_DESIGN.md`
**Disposition**: pass after bounded repair; recommend delegated F_H acceptance

## Authority Checked

- `REQ-L-GTL3-C-ALGEBRA-001/-004/-006/-009/-013/-014/-016`
- `REQ-R-ABG3-CCALL-001..-006/-008/-013/-014`
- `REQ-M-GTL3-PROGRAM-TRAVERSAL-001..-016`
- accepted T-255 compiled handoff and T-267 startup-fence design boundary
- T-259 ticket boundary, exit conditions, and non-closure
- Design Module three-view and transition-owner rules

## Findings And Repairs

| Finding | Severity | Repair |
|---|---:|---|
| governed child hold was mapped to `blocked`, contradicting the canonical awaiting-external-actor judgment | P1 | map `held` to `pending`; retain non-advancing truth |
| proposed sub-traversal evidence named GraphCall/frame but omitted child basis/run refs required by CCALL-013 | P1 | require child basis and run refs and include them in parent evidence |
| internal Node-interface continuity could be read as certification of an absent published outer wire contract | P1 | separate internal continuity from optional admitted outer-contract identity and record absence without inference |
| parent C-call role/fibre/arm source was under-specified | P1 | join the exact T-255 composition role/regime/ref, use authored child ref as arm, and selected program as programRef |

All four repairs are design-local. None widens the base algebra, adds a public
helper entry, removes the T-267 fence, or introduces product vocabulary.

## Cross-View Result

- exactly three ordered Mermaid views are present;
- every participant and lifecycle carrier has a domain owner;
- every state transition names an admission, compiler, resolver, spine,
  traversal, or gate owner;
- no child callback can directly create parent success;
- blocked and pending child outcomes have no advance transition;
- selected-entry authority narrows to one digest-bound Module before contained
  child resolution;
- child meaning remains a separate GraphFunction traversal and is not flattened
  into HoG stages or a handler interior.

The local renderer passed 3/3 diagrams with Mermaid 11.3.0.

## Proportionality

The accepted scope is one direct `workflow.C` term, matching all five current
T-252 handoff rows and the ticket's one-boundary language. Arbitrary mixed
expressions containing workflow terms remain an explicit typed gap. Closing
that unexercised generalization now would require a broader normalized
sequencing carrier and would front-run T-260/T-261. The direct variant is the
smallest lawful runtime relation.

## Implementation Boundary

The implementation may change only:

1. normalized C/HoG admission and direct-workflow lowering;
2. one exact static workflow binding joined inside T-255 handoff compilation;
3. one generic M03 `resolveWorkflowC` atom using the existing C-spine builders;
4. focused non-Consensus and T-252 census tests;
5. generated T-252 evidence and the design-stage register after proof.

It must not add a Consensus branch, child public catalog entry, product loop,
direct vector invocation, synthetic flat stage, or product startup bypass.

## Verdict

`pass`. The design is implementable against existing compiler, module,
composition, catalog-binding, and C-spine surfaces. Delegated F_H acceptance is
recommended for this bounded design.
