---
id: T-148
title: Realize runtime continuation transition projection in ABG
type: bug
ticket_category: implementation_migration
status: completed
proof_status: passed
goal: make ABG expose and consume one replay-derived continuation transition projection so typed runtime facts outrank terminal fallback retry pressure
change_class: design_reframe
re_entry_point: design
created_at: 2026-06-04
updated_at: 2026-06-04
completed_at: 2026-06-04
owning_repo: abiogenesis
governance_scope: STDO Method
priority: critical
build_tenant: typescript
source_documents:
  - specification/PRODUCT.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md
  - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
  - specification/requirements/abg/REQ-R-ABG3-RETRY.md
  - build_tenants/abiogenesis/typescript/design/M03_RUNTIME_CONTINUATION_TRANSITION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_RUNTIME_CONTINUATION_TRANSITION_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M03_RUNTIME_CONTINUATION_TRANSITION_STRUCTURAL_CARRIER_DIAGRAM.md
related_tickets:
  - T-106
  - T-129
  - T-147
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/active/T-188-force-fp-depth-through-iteration-and-prompt-control.md
affected_boundary:
  requirements:
    - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  design:
    - build_tenants/abiogenesis/typescript/design/M03_RUNTIME_CONTINUATION_TRANSITION_DERIVATION.md
    - build_tenants/abiogenesis/typescript/design/M03_RUNTIME_CONTINUATION_TRANSITION_FIRST_SLICE_IACS.md
    - build_tenants/abiogenesis/typescript/design/M03_RUNTIME_CONTINUATION_TRANSITION_STRUCTURAL_CARRIER_DIAGRAM.md
  realization:
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/continuation_transition.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts
  proof:
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t148_runtime_continuation_transition.test.mjs
target_truth: ABG derives one runtime continuation transition from replay-derived runtime facts, assurance fold outcomes, continuation actions, liveness/policy refs, and terminal fallback refs. Typed admitted facts outrank terminal fallback. Downstream products consume this projection or map domain labels over it; they do not own a parallel retry/block/yield state machine.
superseded_truth: Downstream products or runner branches derive retry from terminal fallback strings after typed block, reprice, yield, or evaluator/process facts have already been admitted.
closure_law: This ticket closes only when the requirement clause, design/IACS/diagram, TypeScript projection, runner consumption, and focused tests all prove typed facts outrank terminal fallback and the no-artifact F_P runtime path consumes the projection before retry or terminal selection.
non_closure_conditions:
  - terminal retry fallback can outrank typed runtime facts
  - runner code recomputes the transition after the projection has selected a disposition
  - ABG imports odd_sdlc, data_mapper, worker-model, or stack-specific vocabulary
  - proof is limited to helper I/O without a runner-path regression
---

# T-148: Realize Runtime Continuation Transition Projection In ABG

## Intake Triage

The governing law already exists in ABG product and requirements:

- ABG owns traversal transition and replay continuation.
- Projection truth is replay-derived.
- Assurance fold emits one closure decision.
- Non-progress continuation emits one action projection.
- Retry control is substrate-owned.

The missing layer is a design/realization boundary that composes those existing
facts into one total runtime continuation transition. Therefore this ticket
enters at `design_reframe`, then implements a local TypeScript
`realization_refactor`.

## Required Work

1. Ratify `REQ-R-ABG3-PROJECTION-019`.
2. Add M03 design, IACS, and structural carrier diagram.
3. Implement `RuntimeContinuationTransitionProjection`.
4. Wire the supervised F_P no-artifact path through the projection.
5. Add focused tests:
   - transition table and fallback demotion
   - terminal conversion
   - runner-path no-artifact regression

## Boundary

This is ABG kernel-layer work. It must remain domain-neutral. SDLC may later
remove or shrink its local policy adapter after consuming this ABG projection.

## Implementation

- Added `REQ-R-ABG3-PROJECTION-019` for one replay-derived continuation
  transition projection.
- Added the M03 runtime continuation transition design, IACS, and structural
  carrier diagram.
- Implemented `RuntimeContinuationTransitionProjection` with a total,
  fail-closed priority table:
  - typed block/reprice/yield facts outrank terminal retry fallback
  - traversal no-progress actions are folded before retry/terminal selection
  - assurance closure decisions feed the same projection
  - terminal retry refs are fallback evidence only
- Wired the supervised F_P no-artifact runner branch through the projection
  before deriving retry events or terminal transition.

## Proof

- `npm run build:semantic`
- `npm run test:t148` - 5/5 passed.
- `npm run test:t106` - 14/14 passed.
- `npm run test:t147` - 7/7 passed.
- `npm run test:semantic` - 664/664 passed.
- `git diff --check` - clean.
