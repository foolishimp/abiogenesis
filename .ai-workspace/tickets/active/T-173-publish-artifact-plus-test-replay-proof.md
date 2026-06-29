---
id: T-173
title: Publish artifact-plus-test replay proof
type: implementation
ticket_category: odd_glc_ladder_prerequisite
status: active
goal: >-
  Prove and publish a downstream-consumable ABI requirements-route replay
  artifact for the odd_glc JavaScript tenant/test ladder rung. The proof must
  distinguish subject artifact evidence from independent proof artifact and
  test execution evidence, then bind, fold, residualize, dispose, and replay
  that truth through ABI runtime events.
change_class: realization_refactor
re_entry_point: proof_publication
owner: abiogenesis
priority: high
created_at: 2026-06-29
updated_at: 2026-06-29
governance_scope: STDO Method, DESIGN_MODULE_METHOD, GTL, ABG Runtime, Actor/Operator, Requirements Algebra
build_tenant: typescript
downstream_consumers:
  - /Users/jim/src/apps/odd_glc
source_documents:
  - specification/GOALS.md
  - specification/PRODUCT.md
  - specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md
  - specification/requirements/abg/REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md
  - .ai-workspace/tickets/completed/T-162-realize-abg-requirements-algebra-strategy.md
  - .ai-workspace/tickets/completed/T-165-prove-hello-world-live-requirements-route.md
  - .ai-workspace/tickets/completed/T-166-publish-requirements-route-replay-proof-artifact.md
  - /Users/jim/src/apps/odd_glc/specification/scenarios/SCN-GLC-HELLO-WORLD-JS-TENANT-TEST.md
affected_boundary:
  goals:
    - specification/GOALS.md
  realization:
    - build_tenants/abiogenesis/typescript/test_env/live/
    - build_tenants/abiogenesis/typescript/test_env/tests/support/
    - build_tenants/abiogenesis/typescript/package.json
  proof:
    - build_tenants/abiogenesis/typescript/test_env/test_runs/
target_truth: >-
  ABI publishes a digest-pinned replay artifact proving a JavaScript Hello
  World subject artifact, independent test source artifact, and test execution
  evidence are admitted and bound to the active requirement route without
  downstream product-local materialization or test ledgers.
superseded_truth: >-
  The T-166 single-artifact replay artifact is enough for the odd_glc
  artifact-plus-test ladder rung, or odd_glc may infer test evidence from
  generic asset evidence.
closure_law: >-
  Close only after a live proof starts from GTL declarations and admitted
  requirement pressure, produces a subject JavaScript artifact and an
  independent test artifact, executes the test through ABG actor/operator
  authority, emits admitted evidence and requirement route truth through the
  runtime event stream, and writes a digest-pinned replay artifact whose
  bindings include distinct `asset`, `test_source`, and `test_execution`
  evidence roles.
non_closure_conditions:
  - The artifact contains only generic `asset` evidence bindings.
  - The test artifact or test execution is inferred by odd_glc or a harness log
    instead of appearing as admitted ABI replay truth.
  - The proof constructs route events by hand instead of using ABI route
    emission/admission/projected replay truth.
  - The live prompt carries the complete subject source, complete test source,
    or a prefilled pass/fail answer.
  - The test command is executed outside ABG actor/operator evidence truth.
  - The published replay artifact does not preserve subject artifact, test
    source, test execution, fold, residual, and disposition refs.
  - No live proof is run before closure.
required_work:
  - Resolve the declaration-to-projection gap: GTL test-relation declarations
    currently name asset/test-source/test-execution projection refs, but the
    route builder derives only obligation projections from declarations.
    Closure requires either deriving those projection slots from test relations
    or ratifying a projection declaration surface.
  - Add a T-173 live proof lane for JavaScript subject artifact plus test
    artifact evidence.
  - Use GTL requirement declarations plus test-relation declarations where
    required.
  - Preserve ABI evidence roles `asset`, `test_source`, and `test_execution` in
    route replay truth.
  - Publish a digest-pinned replay artifact and manifest.
  - Leave downstream consumption to odd_glc T-010 after this upstream artifact
    exists.
proof_commands:
  - cd build_tenants/abiogenesis/typescript && npm run build:semantic
  - cd build_tenants/abiogenesis/typescript && npm run test:t173
  - cd build_tenants/abiogenesis/typescript && CODEX_LIVE_FP=1 npm run test:t173:live
  - cd build_tenants/abiogenesis/typescript && npm run test:semantic
  - git diff --check
---

# T-173: Artifact-Plus-Test Replay Proof

## STDO Triage

### First Missing Layer

Proof publication.

The route already supports requirement evidence roles, and T-162 proves
`test_source` and `test_execution` semantics in lower-level tests. The missing
piece is a downstream-consumable replay artifact that carries those roles for a
real JavaScript Hello World subject artifact plus independent test proof.

### Lawful Re-Entry

`realization_refactor`.

This does not change the ABI product boundary. It publishes a proof artifact
over existing GTL/ABG requirements-route authority.

## Acceptance Checklist

- [ ] T-173 live proof lane exists.
- [ ] Declaration-to-projection gap is resolved without caller-supplied route
      projection refs.
- [ ] Live proof produces subject artifact and independent test artifact.
- [ ] Test execution runs through ABI actor/operator evidence truth.
- [ ] Replay artifact includes `asset`, `test_source`, and `test_execution`
      evidence bindings.
- [ ] Replay artifact includes fold, residual, and disposition route truth.
- [ ] Manifest digest pins the artifact.
- [ ] Proof commands pass, including live.

## Closure Evidence

Open.

## Execution Start Note

2026-06-29 start pass found the first implementation gate:

- ABI lower-level requirements algebra supports `test_source` and
  `test_execution` evidence roles.
- GTL declaration bundles can carry `GtlRequirementTestRelationDeclaration`.
- `buildRequirementRouteRuntimeContextFromDeclarations(...)` currently derives
  only default obligation projections from declarations.
- Therefore a downstream-consumable artifact with distinct `asset`,
  `test_source`, and `test_execution` evidence roles cannot be honestly
  produced as an odd_glc-ready proof until the declaration-to-projection bridge
  is implemented or ratified.

This is upstream ABI work. odd_glc shall not compensate by classifying generic
`asset` bindings as test evidence.
