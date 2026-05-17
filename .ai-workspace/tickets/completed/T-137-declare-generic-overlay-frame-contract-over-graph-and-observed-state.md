---
id: T-137
title: Declare generic overlay frame contract over graph and observed state
type: feature
ticket_category: abg_overlay_frame_contract
status: completed
review_status: passed
priority: high
owner: codex
created_at: 2026-05-16T13:58:40+10:00
activated_at: 2026-05-16T13:58:40+10:00
updated_at: 2026-05-16T18:30:00+10:00
completed_at: 2026-05-16T18:30:00+10:00
change_class: design_reframe
re_entry_point: design
goal: generic-overlay-frame-substrate
release_scope: post-3.7.1 construction substrate
build_tenant: typescript
owning_repo: abiogenesis
governance_scope: STDO Method
dependencies:
  - .ai-workspace/tickets/completed/T-134-define-abg-fn-composition-grammar.md
  - .ai-workspace/tickets/completed/T-135-resolve-vector-local-runtime-regimes-for-mixed-construction-traversal.md
  - .ai-workspace/tickets/completed/T-136-define-observed-state-register-admission-for-construction-replay.md
related_tickets:
  - .ai-workspace/tickets/completed/T-103-define-abg-graph-span-foldback-and-reentry-frontier.md
  - .ai-workspace/tickets/completed/T-128-realize-fp-consciousness-runner-over-admitted-construction-intent.md
  - .ai-workspace/tickets/completed/T-134-define-abg-fn-composition-grammar.md
requirement_refs:
  - specification/PRODUCT.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md
  - specification/requirements/gtl/REQ-L-GTL3-RULE.md
  - specification/requirements/abg/REQ-R-ABG3-INTERPRET.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
design_refs:
  - build_tenants/abiogenesis/typescript/design/M03_GRAPH_SPAN_FOLDBACK_REENTRY_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_FP_CONSCIOUSNESS_LOOP_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_TRAVERSAL_MODULATION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_OVERLAY_FRAME_CONTRACT_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_OVERLAY_FRAME_CONTRACT_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M03_OVERLAY_FRAME_CONTRACT_STRUCTURAL_CARRIER_DIAGRAM.md
affected_boundary:
  - specification/requirements/gtl/
  - specification/requirements/abg/
  - build_tenants/abiogenesis/typescript/design/
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/
  - build_tenants/abiogenesis/typescript/test_env/tests/
target_truth: ABG provides a generic overlay-frame contract for frame-like traversal over GTL anchors and admitted observed state. Overlay terms remain downstream vocabulary unless bound to GTL GraphFunction, GraphVector, GraphSpan, Job, Module, or Rule surfaces. Once bound, ABG can project overlay frame state, evaluate fire and terminate predicates, carry pressure, fold back to a parent frame, and select lawful re-entry without a product-local controller loop.
closure_law: Close only when tests prove overlay-frame decisions are derived from GTL-bound scope refs and admitted observed-state refs, ABG owns frame advancement and replay, pressure cannot be cleared by overlay completion without declared clearing evidence or no-close policy, and downstream product code no longer owns an overlay loop for the proof slice.
non_closure_conditions:
  - overlay remains a product-local selector with no ABG frame state
  - fire_when or terminate_when reads private state outside admitted observed-state refs
  - overlay completion clears pressure by boolean productConverged without clearing evidence
  - ABG treats overlay as a new canonical GTL topology type rather than a runtime/frame contract bound to GTL anchors
---

# T-137: Declare Generic Overlay Frame Contract Over Graph And Observed State

## Closure

Closed on 2026-05-16.

Implementation landed:

- `OverlayFrameContract`, scope rows, predicate bindings, foldback outcome,
  pressure decision, and replay projection carriers;
- `overlay_frame_declared` and `overlay_frame_evaluated` runtime events;
- `RuntimeAggregateProjection.overlayFrame`;
- replay check that predicate `satisfied` and `missingObservedStateRefs` derive
  from admitted `ObservedStateProjection`;
- focused T-137 proof covering pressure carry, clearing evidence, no-close
  policy, observed-state replay rejection, and rival topology kind rejection.

Verification:

- `npm run test:t137`
- `npm run lint:semantic`

## Entry

Graph overlays are useful only if the iteration rules become readable substrate
truth. This ticket defines the generic ABG frame contract that lets downstream
products declare overlay-like scopes without owning another loop engine.

## Design Module Method Notes

Governing standard:
`/Users/jim/src/apps/specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md`.

ODD alignment: overlay frames are runtime/frame contracts bound to GTL anchors,
not a rival GTL topology type and not a product-local controller loop. They may
select lawful re-entry only from declared scope refs and admitted observed state.

Module roles:

- carrier module for overlay-frame declaration and frame state;
- semantic kernel for fire/terminate/fold-back decision over admitted truth;
- projection module for overlay-frame replay state;
- effect shell only for publishing frame events.

Irreducible Architectural Carrier Set for this ticket:

- `OverlayFrameContract`;
- `OverlayFrameScopeRef`;
- `OverlayFramePredicateBinding`;
- `OverlayFrameState`;
- `OverlayFrameFoldbackOutcome`;
- `OverlayFramePressureDecision`.

Subordinate payloads: predicate expression internals, lane labels, product-local
overlay vocabulary, and UI/report rows remain subordinate unless independently
published as GTL/ABG contracts.

Design assets required before design-method closure:

- structural carrier diagram for overlay contract, scope refs, predicates,
  frame state, pressure decision, and foldback outcome;
- proof that fire_when and terminate_when consume only admitted observed-state
  refs;
- negative proof that overlay completion cannot clear pressure without declared
  clearing evidence or no-close policy;
- module-derived unit tests for frame replay and bypass rejection.

## Acceptance

- [x] Define overlay-frame scope refs over GTL anchors and graph spans.
- [x] Attach or update the structural carrier diagram for overlay-frame state.
- [x] Declare the final IACS and subordinate payload split before code closure.
- [x] Define observed-state refs consumed by fire and terminate predicates.
- [x] Define pressure carry, clearing, fold-back, and re-entry fields.
- [x] Project overlay-frame state from events and admitted observations.
- [x] Prove overlay frame replay with positive and negative pressure-clearing
  cases.
- [x] Prove the contract does not create a rival canonical GTL topology type.
