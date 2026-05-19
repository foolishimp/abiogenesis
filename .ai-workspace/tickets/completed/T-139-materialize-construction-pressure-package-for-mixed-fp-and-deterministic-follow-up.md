---
id: T-139
title: Materialize construction pressure package for mixed F_P and deterministic follow-up
type: feature
ticket_category: abg_construction_pressure_package
status: completed
review_status: closed_on_t171_decommission_register_deletion_proof
priority: high
owner: codex
created_at: 2026-05-16T13:58:40+10:00
activated_at: 2026-05-16T13:58:40+10:00
updated_at: 2026-05-20T15:00:00+10:00
closed_at: 2026-05-20T15:00:00+10:00
change_class: realization_refactor
re_entry_point: implementation
goal: test35-compatible-construction-pressure-substrate
release_scope: post-3.7.1 construction substrate
build_tenant: typescript
owning_repo: abiogenesis
governance_scope: STDO Method
dependencies:
  - .ai-workspace/tickets/completed/T-134-define-abg-fn-composition-grammar.md
  - .ai-workspace/tickets/completed/T-128-realize-fp-consciousness-runner-over-admitted-construction-intent.md
  - .ai-workspace/tickets/completed/T-135-resolve-vector-local-runtime-regimes-for-mixed-construction-traversal.md
  - .ai-workspace/tickets/completed/T-136-define-observed-state-register-admission-for-construction-replay.md
  - .ai-workspace/tickets/completed/T-137-declare-generic-overlay-frame-contract-over-graph-and-observed-state.md
  - .ai-workspace/tickets/completed/T-138-classify-fd-outcomes-by-authority-placement-and-pressure-routing.md
reference_documents:
  - .ai-workspace/comments/codex/20260516T141749Z_abg_construction_substrate_test35_reference.md
related_tickets:
  - .ai-workspace/tickets/completed/T-127-define-generic-fp-consciousness-loop-with-gtl-plugin-overrides.md
  - .ai-workspace/tickets/completed/T-137-declare-generic-overlay-frame-contract-over-graph-and-observed-state.md
blocked_by:
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/active/T-170-implement-authority-placement-strategy-and-repair-fd-overreach.md
requirement_refs:
  - specification/PRODUCT.md
  - specification/requirements/abg/REQ-R-ABG3-FP-CONSCIOUSNESS.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
  - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
design_refs:
  - build_tenants/abiogenesis/typescript/design/M03_FP_CONSCIOUSNESS_LOOP_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_FP_CONSCIOUSNESS_LOOP_STRUCTURAL_CARRIER_DIAGRAM.md
  - build_tenants/abiogenesis/typescript/design/M03_CONSTRUCTION_INTENT_RUNNER_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_OBSERVED_STATE_ADMISSION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_OVERLAY_FRAME_CONTRACT_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_FD_AUTHORITY_PLACEMENT_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_CONSTRUCTION_PRESSURE_PACKAGE_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_CONSTRUCTION_PRESSURE_PACKAGE_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M03_CONSTRUCTION_PRESSURE_PACKAGE_STRUCTURAL_CARRIER_DIAGRAM.md
  - build_tenants/abiogenesis/typescript/design/M04_PUBLIC_GAPS_PROJECTION_DERIVATION.md
affected_boundary:
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/fp_consciousness.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/plugins.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/
  - build_tenants/abiogenesis/typescript/code/src/app/m04/gaps/
  - build_tenants/abiogenesis/typescript/test_env/tests/
  - build_tenants/abiogenesis/typescript/test_env/live/
target_truth: ABG materializes one construction pressure package from admitted observation, exact evaluator/F_D output, obligation policy, current target asset state, admitted prior evidence, selected graph action, execution target, and downstream pressure refs. The package is the substrate equivalent of the useful Python SDLC manifest shape, but generic: downstream products provide pressure projectors and graph/action catalogs, while ABG owns admission, runner consumption, replay, and pressure survival. ABG owns the typed carrier; prompt rendering is a consumer-side adapter concern outside this ticket.
closure_law: Close only when deterministic and installed/live tests prove a mixed F_P plus deterministic follow-up attempt receives the current evaluated pressure package, worker/result evidence is admitted back into the construction ledger, deterministic follow-up reprojects pressure from admitted evidence, and pressure cannot disappear unless cleared by admitted evidence, lawful re-entry/reprice, or declared no-close policy. As the final substrate-batch gate, close only after recording a downstream deletion proof naming at least one product-local controller-loop authority replaced by the ABG substrate, initially `odd_sdlc/build_tenants/typescript/code/src/operator/installed_operator.ts` projection auto-advance loop or equivalent.
non_closure_conditions:
  - worker prompt text is the only place current pressure exists
  - construction pressure package lacks observed-state refs or prior evidence refs
  - deterministic follow-up clears pressure without clearing evidence
  - public gaps or downstream product controller decides next action outside ABG admission
  - proof uses a trivial F_D-only lane instead of mixed F_P plus deterministic follow-up
---

# T-139: Materialize Construction Pressure Package For Mixed F_P And Deterministic Follow-Up

## Entry

The Python SDLC reference manifest carried the right construction context:
current workspace state, failing evaluator output, obligation policy, current
target state, prior evidence, and result path. This ticket materializes the
generic ABG carrier that preserves that behavior without reintroducing a product
outer loop.

ABG owns the structured carrier and replay admission. Rendering that carrier
into worker prompt text is owned by the consuming product/adapter and must not
become part of this substrate ticket.

## Design Module Method Notes

Governing standard:
`/Users/jim/src/apps/specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md`.

ODD alignment: the construction pressure package is admitted evidence/context
for the F_P plus deterministic follow-up traversal. It must not become prompt
strategy, product semantic closure, or a second controller loop.

Module roles:

- carrier module for construction pressure package identity;
- semantic kernel for pure package derivation from admitted observation,
  evaluator output, target state, prior evidence, and selected action;
- effect shell only for F_P delivery and event append;
- projection module for pressure survival and clearing evidence.

Irreducible Architectural Carrier Set for this ticket:

- `ConstructionPressurePackage`;
- `ConstructionPressureInputBasis`;
- `ConstructionPressureRef`;
- `ConstructionPressureClearanceEvidence`;
- `ConstructionPressurePackageAdmission`;
- `ConstructionPressureProjection`.

Subordinate payloads: rendered prompt fragments, worker display sections,
fixture-specific target rows, and product-local pressure labels remain
subordinate. They cannot become ABG substrate truth without a separate design
re-entry.

Design assets required before design-method closure:

- structural carrier diagram for package, input basis, pressure refs, clearance
  evidence, admission, and projection;
- reference-derived mapping from the Python/test35 manifest shape to the target
  ABG substrate carrier, preserving only load-bearing behavior;
- module-derived unit tests for pressure survival, clearance evidence, and
  prompt-rendering bypass rejection;
- downstream deletion proof showing one product-local controller-loop authority
  removed or replaced by this substrate.

## Implementation Progress

Substrate first slice implemented:

- `construction_pressure_package.ts` owns `ConstructionPressurePackage`,
  `ConstructionPressureInputBasis`,
  `ConstructionPressureRef`, `ConstructionPressureClearanceEvidence`,
  `ConstructionPressurePackageAdmission`, and `ConstructionPressureProjection`
  plus package derivation/admission and pressure projection.
- `construction_observation.ts` owns construction observation snapshots,
  observation pressure rows, and observation asset refs.
- `construction_event_causality.ts` owns construction event admission ordering
  and causality validation.
- `construction_pressure_package_materialized` is a runtime event admitted
  through the event spine.
- `runConstructionIntentStep` derives, admits, emits, and passes the structured
  pressure package into `runEngineIterate` before graph action invocation.
- `EnginePluginInput` carries `constructionPressurePackage`,
  `constructionPressurePackageRef`, and `constructionPressureRefs`.
- `deriveConstructionPressureProjection` preserves package pressure and clears
  it only from closed construction delta evidence.
- Design assets now exist for derivation, IACS, and structural carrier
  diagram.

Remaining closure item:

- record downstream deletion proof naming one product-local controller-loop
  authority replaced by this substrate. This is intentionally still open; the
  ABI substrate test proves availability, not the consumer deletion.

## Verification

Local substrate verification on 2026-05-16:

- `npm run test:t128` passed: 2 tests.
- `npm run test:t137` passed: 6 tests.
- `npm run test:t139` passed: 2 tests.
- `npm run lint:semantic` passed after adding
  `construction_pressure_package_materialized` to construction runtime event
  causality.
- `npm run test:semantic` passed: 560 tests, 0 failures.
- `git diff --check` passed.

## Acceptance

- [x] **Closure-gating:** downstream deletion proof recorded. `odd_sdlc` T-171
  closure (`completed/T-171-full-test35-parity-refactor-for-test72-execution-backed-closure.md`,
  RC4 release cut `.ai-workspace/release-cuts/typescript/20260519T051709Z_t171_data_mapper_test82_rc4`)
  replaces equivalent product-local controller-loop authorities via its ratified
  decommission register
  (`build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_DECOMMISSION_REGISTER.md`):
  harness push-along behavior is deleted; controller-side reconstruction is
  replaced by one registry/projection authority; parallel prompt-construction
  pathways are replaced by `worker_construction_brief.json` as the single
  prompt-source carrier. These satisfy the "or equivalent" clause of the
  closure_law for T-139's downstream-deletion gate.
- [x] Define the construction pressure package carrier and identity.
- [x] Attach or update the structural carrier diagram for construction pressure
  packaging.
- [x] Declare the final IACS and subordinate payload split before code closure.
- [x] Populate it from admitted construction observation, observed-state refs,
  evaluator/F_D outcomes, obligation policy, target state, prior evidence,
  selected action, and execution target.
- [x] Pass it to the F_P boundary as structured data, not only prose.
- [x] Keep prompt-rendering out of scope: this ticket produces the typed
  carrier; consumers decide how to render it for a worker.
- [x] Admit result evidence and deterministic follow-up evidence back into ABG
  replay truth.
- [x] Preserve unresolved pressure until cleared by evidence, lawful re-entry,
  reprice, or no-close policy.
- [x] Prove the mixed slice against a downstream-style scenario derived from
  test35 behavior, not an F_D-only projection lane.

## Closure

T-139 is closed on 2026-05-20 with the substrate fully delivered and the
downstream-deletion gate satisfied by `odd_sdlc` T-171's RC4 closure.

Substrate state at closure:

- `construction_pressure_package.ts`, `construction_observation.ts`, and
  `construction_event_causality.ts` published.
- Design assets ratified:
  `M03_CONSTRUCTION_PRESSURE_PACKAGE_DERIVATION.md`,
  `M03_CONSTRUCTION_PRESSURE_PACKAGE_FIRST_SLICE_IACS.md`,
  `M03_CONSTRUCTION_PRESSURE_PACKAGE_STRUCTURAL_CARRIER_DIAGRAM.md`,
  `M04_PUBLIC_GAPS_PROJECTION_DERIVATION.md`.
- `npm run test:t139` passes 2/2.
- `runConstructionIntentStep` derives, admits, emits, and passes the structured
  pressure package into `runEngineIterate` before graph action invocation.
- `EnginePluginInput` carries `constructionPressurePackage`,
  `constructionPressurePackageRef`, and `constructionPressureRefs`.

Downstream-deletion proof:

- `odd_sdlc` T-171 closed 2026-05-19 with the data_mapper test82 RC4 archive
  (`/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test82.TS.cl/.ai-workspace/runtime/odd_sdlc/operator-runs/20260519T045221059Z_pid80159`)
  and release cut
  (`/Users/jim/src/apps/odd_sdlc/.ai-workspace/release-cuts/typescript/20260519T051709Z_t171_data_mapper_test82_rc4`).
- T-171's ratified decommission register
  (`odd_sdlc/build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_DECOMMISSION_REGISTER.md`)
  replaces equivalent product-local controller-loop authorities:
  harness push-along behavior deleted, controller-side reconstruction replaced
  by one registry/projection authority, parallel prompt-construction pathways
  replaced by `worker_construction_brief.json` as the single prompt-source
  carrier.
- These satisfy the "or equivalent" clause of T-139's closure_law for the
  downstream-deletion gate.

Open follow-on (not T-139 scope):

- The literal `sdlc_installed_operator_start_loop` path in
  `odd_sdlc/build_tenants/typescript/code/src/operator/installed_operator.ts`
  remains present. T-171's decommission register replaces equivalent product-
  local control authorities but did not delete this specific loop. If a future
  ticket migrates that loop to direct consumption of the ABG construction
  pressure package, it consumes T-139's substrate without re-opening T-139.

`blocked_by` reference to `odd_sdlc/.../active/T-170-...` is stale; T-170
completed and was superseded by T-171. The blocker is satisfied; closure
proceeds.
