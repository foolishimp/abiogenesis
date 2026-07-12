# REVIEW: Consensus GTL Free-Construction Design (00e74f5)

**Type:** REVIEW (monitoring seat; three-view gate review of the Phase-2
design, T-252).
**Author:** claude · 2026-07-13

## Verdict

**Recommend F_H accept the target architecture and its routing decision** —
exactly as the design's own pre-code verdict frames it: acceptance routes the
generic HOF prerequisite first; body authorship waits for T-252 re-entry.
This is the anti-`945b5a2` in every dimension that failed before.

## What the review verified

- **It is a real graph.** The canonical topology declares every edge with a
  named owner: F_D C-programs for seed/expand/project, F_P leaves selected by
  profile-scoped bindings (`SemanticReducerBinding`, `SubmitterTurnBinding`)
  whose raw output crosses **standard result admission** (no local parser),
  routing evaluators/rules that cannot skip the submitter turn on dispute,
  recursion via `recurse(consensus.round)` with declared termination and
  foldback, and **F_H as a pending-interaction vector producing a runtime
  held stop** — the human gate is a state, not a label. Fan-out/fan-in are
  higher-order applications lifted by `workflow.C`.
- **Both pre-emptive flags absorbed, 18 minutes after posting:** F2 verbatim
  ("the ordered diagnostic set is a **frontier census**, not a monotone gap
  count"); F1 structurally (one shared agent contract is *unrepresentable* —
  CLI cannot inject one, GTL cannot select one; the per-profile→per-task join
  is declared as a target and routed to generic DS-2 spine work, "never
  Consensus-specific dispatch").
- **The discovery mechanism worked at design time:** the review exposed that
  the current `fan_out` is a same-node facade — a **generic typed HOF carrier
  gap** sits BEFORE `workflow.C` in the census order. The design refuses to
  author the body over the facade and routes the prerequisite to its own
  singular generic leaf. T-252's closure condition 2 encodes it ("a
  declaration nameplate is insufficient... the generic typed HOF relation
  must close first").
- **Boundary discipline:** the reserved `gtl://abg/review/*` declarations are
  NOT published as a generic Review product; no ticket mutation anywhere;
  25-row axiom matrix passes; three views present and **focused-gate
  verified** (renderer 11.3.0, 3 diagrams, digest) plus the registered-9
  regression and the 5/5 gate mutation tests — the render process question
  from my earlier reviews is closed by tooling, not attestation.
- Code freeze holds; the commit is design+ticket+self-review only.

## One guard to carry forward (not blocking)

The new generic HOF prerequisite leaf inherits the same A3 guard as the
C-atoms: cite at least one non-Consensus consumer (scenario 09's fan-out
family is the natural one) so the first generic relation isn't shaped around
its first customer.

## Board effect

Phase 3 refines into: **3a** design→F_H acceptance (this review supports it),
**3b** generic typed HOF relation (new singular leaf, discovered by the
probe), **3c** body authorship + no-effects compile + persisted digest and
diagnostic census. The census order gains a step before `workflow.C` — which
is the discovery working, not scope creep: the alternative was finding the
facade mid-Phase-4 with a half-built body on top of it.
