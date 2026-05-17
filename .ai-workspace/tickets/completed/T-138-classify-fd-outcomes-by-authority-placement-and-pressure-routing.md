---
id: T-138
title: Classify F_D outcomes by authority placement and pressure routing
type: feature
ticket_category: abg_fd_authority_placement
status: completed
review_status: passed
priority: high
owner: codex
created_at: 2026-05-16T13:58:40+10:00
activated_at: 2026-05-16T13:58:40+10:00
updated_at: 2026-05-16T15:40:00+10:00
completed_at: 2026-05-16T15:40:00+10:00
change_class: requirement_reprice
re_entry_point: requirement
goal: fd-supports-construction-without-owning-content-closure
release_scope: post-3.7.1 construction substrate
build_tenant: typescript
owning_repo: abiogenesis
governance_scope: STDO Method
intake_source:
  - 2026-05-16 authority-placement strategy review
  - current F_D evaluator outcome is effectively accepted or blocked
  - downstream SDLC failure showed deterministic shape checks can block or clear content pressure in the wrong layer
requirement_refs:
  - specification/PRODUCT.md
  - specification/requirements/gtl/REQ-L-GTL3-EVALUATOR.md
  - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
  - specification/requirements/abg/REQ-R-ABG3-FP-CONSCIOUSNESS.md
  - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
design_refs:
  - build_tenants/abiogenesis/typescript/design/M03_FD_FP_FH_ABSENTIA_GRAPH.md
  - build_tenants/abiogenesis/typescript/design/M03_EDGE_ASSURANCE_CONTRACT_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_FP_CONSCIOUSNESS_LOOP_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_FD_AUTHORITY_PLACEMENT_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_FD_AUTHORITY_PLACEMENT_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M03_FD_AUTHORITY_PLACEMENT_STRUCTURAL_CARRIER_DIAGRAM.md
dependencies:
  - .ai-workspace/tickets/completed/T-134-define-abg-fn-composition-grammar.md
related_tickets:
  - .ai-workspace/tickets/completed/T-128-realize-fp-consciousness-runner-over-admitted-construction-intent.md
  - .ai-workspace/tickets/completed/T-134-define-abg-fn-composition-grammar.md
affected_boundary:
  - specification/PRODUCT.md
  - specification/requirements/gtl/REQ-L-GTL3-EVALUATOR.md
  - specification/requirements/abg/REQ-R-ABG3-FP-CONSCIOUSNESS.md
  - build_tenants/abiogenesis/typescript/code/src/gtl/m01/contracts/carriers.ts
  - build_tenants/abiogenesis/typescript/code/src/gtl/m01/admission/carriers.ts
  - build_tenants/abiogenesis/typescript/code/src/gtl/m01/contracts/constructors.ts
  - build_tenants/abiogenesis/typescript/code/src/gtl/m01/serialization/carriers.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/carriers.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/event_admission.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/event_calculus.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/event_factories.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/index.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/plugins.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/projection.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/retry_frontier.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts
  - build_tenants/abiogenesis/typescript/code/src/qualification/m05/sdlc_bootstrap_lineage.ts
  - build_tenants/abiogenesis/typescript/package.json
  - build_tenants/abiogenesis/typescript/test_env/tests/
target_truth: F_D outcomes carry typed authority placement rather than only accepted or blocked. The substrate distinguishes protocol_invalid, construction_context_invalid, diagnostic_shape_invalid, and content_unproven. ABG blocks only when the failed deterministic fact is necessary for admission, routing, execution-command construction, or closure law; otherwise ABG records residual pressure and routes construction to F_P or execution evidence. The downstream-read set is derived from evaluator-declared consumed field refs in the admitted composition/evaluator contract; schema annotations may document those refs, and runtime read-graph traces may audit them, but operator judgement is not an authority source.
closure_law: Close only when requirements, design, carriers, runner behavior, and tests prove the four severity classes route differently, diagnostic_shape_invalid cannot block lawful F_P construction when its field is not read by downstream routing or closure, content_unproven becomes construction pressure rather than deterministic failure, and protocol/context defects still fail closed.
non_closure_conditions:
  - F_D outcome remains only accepted or blocked
  - diagnostic shape drift blocks all construction regardless of downstream-read use
  - content_unproven is treated as deterministic closure failure
  - severity classification is a prompt convention rather than an admitted carrier
  - tests omit negative cases for each severity class
---

# T-138: Classify F_D Outcomes By Authority Placement And Pressure Routing

## Entry

F_D should narrow, admit, preserve, route, and diagnose. It should not own
ambiguous product content closure. This ticket makes that placement executable
as ABG substrate law.

The decidability rule is evaluator-declared consumption: a field can block as
`construction_context_invalid` only when an admitted evaluator, routing rule,
execution-construction rule, or closure predicate declares that it consumes that
field. A malformed field not in the declared consumed-field set is
`diagnostic_shape_invalid` and preserves pressure without blocking lawful F_P
construction.

## Design Module Method Notes

Governing standard:
`/Users/jim/src/apps/specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md`.

ODD alignment: F_D severity classification is admission and routing support for
GTL/ABG traversal. It must not become deterministic product-content closure or a
controller-owned strategy surface telling F_P how to solve content.

Module roles:

- carrier module for F_D outcome authority placement;
- semantic kernel for pure severity routing from admitted evaluator contracts
  and consumed-field refs;
- projection module for pressure-routing visibility;
- effect shell only for publishing admitted outcome events.

Irreducible Architectural Carrier Set for this ticket:

- `FdAuthorityOutcome`;
- `FdSeverityClass`;
- `ConsumedFieldSet`;
- `FdPressureRoutingDecision`;
- `FdAuthorityDiagnostic`.

Subordinate payloads: raw validator errors, per-field parse notes, display
messages, and worker-facing explanation text remain subordinate to the authority
outcome and routing decision.

Design assets required before design-method closure:

- structural carrier diagram for outcome, severity, consumed-field set, routing
  decision, and diagnostics;
- explicit Promotion Test for any top-level error or diagnostic type;
- negative proof that `diagnostic_shape_invalid` cannot block when the field is
  outside the consumed-field set;
- module-derived unit tests for all four severity classes and open-payload
  bypass rejection.

## Implementation Closure

Implemented surfaces:

- GTL evaluator carriers now declare `consumedFieldRefs` so downstream-read
  authority is admitted graph truth rather than operator judgement.
- ABG F_D outcomes now carry `severityClass`, `routingDecision`,
  `affectedFieldRefs`, `consumedFieldRefs`, `pressureRefs`, and
  `diagnosticRefs`.
- ABG emits replay-visible `fd_authority_outcome_admitted` events before
  `vector_evaluated`.
- The engine runner routes `continue`, `block`, `preserve_pressure`, and
  `route_to_fp` according to admitted severity and consumed-field intersection.
- Adjacent public-start and M04 proofs now include the admitted F_D authority
  event in the expected event stream.

Closure evidence:

- `npm run test:t138` passed: 5 tests, 0 failures.
- `npm run test:t135` passed: 6 tests, 0 failures.
- `npm run test:t136` passed: 8 tests, 0 failures.
- `npm run test:t072` passed: 14 tests, 0 failures.
- `npm run test:t063` passed: 3 tests, 0 failures.
- `npm run lint:semantic` passed.
- `npm run lint:test-harness` passed.
- `git diff --check` passed.
- `npm run test:semantic` passed: 550 tests, 0 failures.

## Acceptance

- [x] Ratify four F_D authority-placement classes in requirements/design.
- [x] Attach or update the structural carrier diagram for F_D authority
  placement.
- [x] Declare the final IACS and subordinate payload split before code closure.
- [x] Extend F_D outcome/admission carriers with severity and routing fields.
- [x] Define and implement the downstream-read field set from
  evaluator-declared consumed field refs in the admitted
  composition/evaluator contract.
- [x] Teach the runner to block, continue, route to F_P, or preserve pressure
  according to class.
- [x] Prove protocol/context defects fail closed.
- [x] Prove diagnostic_shape_invalid preserves pressure without blocking when
  the malformed field is not read by downstream routing or closure.
- [x] Prove content_unproven routes to F_P/content pressure.
