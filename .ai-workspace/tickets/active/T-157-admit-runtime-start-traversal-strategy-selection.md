---
id: T-157
title: Admit runtime start traversal strategy selection
status: active
change_class: design_reframe
re_entry_point: design
owner: abiogenesis
created: 2026-06-16
source: odd_sdlc steel-thread dependency-slice correction
related_tickets:
  - .ai-workspace/tickets/completed/T-107-define-abg-traversal-modulation-profiles-for-agentic-fp-attempts.md
  - .ai-workspace/tickets/completed/T-112-carry-per-edge-traversal-strategy-through-gtl-config.md
  - .ai-workspace/tickets/active/T-156-admit-consequence-allowed-traversal-catalog.md
governance_scope: STDO Method, ODD_METHOD, DESIGN_MODULE_METHOD
---

# T-157: Runtime Start Traversal Strategy Selection

## Intake

The existing traversal modulation surface admits `TraversalStrategySelection`
and `TraversalAttemptEnvelope`, but the primary selection path is static GTL
qualifier truth on graph vectors, graph functions, or role policy hooks. That
was a useful compromise for first proof, but it is not enough for downstream
products that need to decide at runtime to run a bounded dependency slice such
as "implement `req-04` plus N dependent requirement rows."

## Target Truth

ABG admits a run-scoped traversal strategy selection on `StartIntent`. The
selection is matched to the current graph vector by vector index or edge ref,
then lowered into the existing
`TraversalStrategySelection -> TraversalModulationProfile ->
TraversalAttemptEnvelope` chain with source `runtime_start`.

Static GTL graph/vector/role traversal qualifiers remain default policy. A
matching runtime-start selection outranks those defaults for the current run
because it is explicit admitted start truth. Absence of a matching runtime
selection preserves the existing GTL qualifier precedence.

ABG does not interpret downstream dependency semantics. Downstream products may
derive selected schedule refs from requirement/module/test dependency maps, but
ABG only admits and carries the selected refs, generic scheduling primitives,
batch/continuation constraints, and replay-visible runtime events.

## Superseded Truth

- Steel-thread behavior is chosen only by module construction or environment
  profile.
- Downstream products mutate GTL graph/vector declarations to choose a runtime
  slice.
- ABG infers product dependency meaning from strategy labels.

## Implementation Checklist

- [x] Add `StartRuntimeTraversalStrategySelection` on `StartIntent`.
- [x] Admit the runtime selection through `admitStartIntent(...)` and public
      start request admission.
- [x] Add `runtime_start` as a traversal strategy selection source.
- [x] Let runner traversal modulation prefer a matching runtime-start
      selection over static GTL qualifier defaults.
- [x] Preserve the existing traversal modulation envelope/event path.
- [x] Prove a runtime-start selection can choose N dependency refs and that the
      runner passes those refs through `TraversalAttemptEnvelope`.
- [x] Prove start admission accepts the runtime selection carrier.

## Closure Criteria

- Runtime-start selection is admitted only as start/run truth and does not
  become GTL module topology.
- Matching is explicit by vector index or edge/vector ref; ambiguous matches
  fail closed.
- Selected schedule refs are carried through the same ABG envelope and event
  surfaces as GTL-derived traversal strategy.
- Static GTL qualifiers remain the fallback when no runtime-start selection
  matches.
- ABG does not branch on downstream strategy labels such as `steel_thread`.
- Focused traversal modulation tests and semantic build pass.

## Current Proof

- `npm run build:semantic` passed.
- `node --test test_env/tests/test_t107_traversal_modulation_unit.test.mjs
  test_env/tests/test_t112_traversal_strategy_selection.test.mjs` passed 26/26.
- `test_t107_traversal_modulation_unit` proves a runtime-start selection with
  three dependency refs outranks a static vector qualifier and reaches
  `EnginePluginInput.traversalAttemptEnvelope.selectedScheduleItemRefs` with
  `strategySelectionSource = runtime_start`.
- `test_t112_traversal_strategy_selection` proves `admitStartIntent(...)`
  admits the runtime selection carrier and derives a runtime-start
  `TraversalStrategySelection`.

## Non-Closure Conditions

- Runtime selection is implemented as prompt text or environment profile only.
- A downstream product-local loop selects schedule rows without ABG runtime
  envelope truth.
- Ambiguous runtime-start selections silently choose one match.
- ABG hard-codes downstream dependency semantics or strategy-label meaning.
