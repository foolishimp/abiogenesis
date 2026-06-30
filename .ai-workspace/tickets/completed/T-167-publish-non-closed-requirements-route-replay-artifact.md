---
id: T-167
title: Publish non-closed requirements-route replay artifact
type: proof
ticket_category: downstream_proof_artifact
status: completed
qualified_by: T-175
qualification_resolved_by: T-175
goal: >-
  Publish a downstream-consumable requirements-route replay artifact for a
  non-closed route. The proof shall start from GTL requirement declarations,
  execute through ABG-owned traversal, emit requirement evidence, partial or
  blocked fold, residual pressure, and continuation or re-entry disposition
  through the runtime event stream, then serialize the replay artifact and
  manifest for downstream consumers such as odd_glc.
change_intent: >-
  T-165/T-166 prove the closed Hello World route and publish a closed replay
  artifact. odd_glc can now consume closed route truth, artifact/evidence
  truth, and satisfied fold truth. It still cannot honestly prove cyclic
  lifecycle or residual/re-entry consumption because ABIogenesis has not
  published a real non-closed route artifact carrying residual and continuation
  or re-entry truth. This ticket supplies that missing ABI proof artifact
  without exposing ABG runtime-internal emitters.
change_class: realization_refactor
re_entry_point: proof
owner: abiogenesis
priority: critical
triaged_at: 2026-06-29
created_at: 2026-06-29
updated_at: 2026-06-29
governance_scope: STDO Method, GTL, ABG, Requirements Algebra, Residual/Re-entry Proof, Downstream ODD Consumers
build_tenant: typescript
downstream_consumers:
  - /Users/jim/src/apps/odd_glc/.ai-workspace/tickets/active/T-007-interpret-assurance-fold-and-residual-pressure.md
source_documents:
  - specification/GOALS.md
  - specification/requirements/gtl/REQ-L-GTL3-REQUIREMENTS-ALGEBRA.md
  - specification/requirements/abg/REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md
  - specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - .ai-workspace/tickets/completed/T-164-realize-gtl-abg-requirements-algebra-route-for-downstream-lifecycle-consumers.md
  - .ai-workspace/tickets/completed/T-165-prove-hello-world-live-requirements-route.md
  - .ai-workspace/tickets/completed/T-166-publish-requirements-route-replay-proof-artifact.md
affected_boundary:
  proof:
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t167_non_closed_requirements_route_replay_artifact.test.mjs
    - build_tenants/abiogenesis/typescript/test_env/tests/support/requirements-route-replay-artifact.mjs
  runtime:
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts
  package_scripts:
    - build_tenants/abiogenesis/typescript/package.json
target_truth: >-
  ABIogenesis publishes a digest-pinned replay artifact for a non-closed
  requirements route. The artifact contains serialized
  `requirement_route_fact_projected` events for admitted terms, projections,
  evidence binding, partial/blocked requirement fold, residual projection, and
  lifecycle disposition joined over ABG continuation or re-entry truth.
  Downstream consumers can prove read-only residual/re-entry interpretation
  without calling admission, fold, residual, or disposition emitters.
superseded_truth: >-
  A closed-path Hello World replay artifact plus synthetic residual-shaped
  events are enough for downstream lifecycle consumers to claim real residual,
  continuation, or re-entry proof.
closure_law: >-
  Close only when a live or installed proof run writes a manifest plus replay
  artifact containing at minimum `requirement_term_admitted`,
  `requirement_projection_admitted`, `requirement_evidence_bound`,
  `requirement_fold_projected`, `requirement_residual_projected`, and
  `requirement_lifecycle_disposition`, with the disposition joined over
  admitted ABG continuation or graph re-entry truth. Closure must prove no
  caller-supplied route context, no downstream-public emitters, no query-first
  residual/disposition invention, and no product-local retry/re-entry
  controller.
non_closure_conditions:
  - The artifact omits `requirement_residual_projected`.
  - The artifact computes disposition without admitted ABG continuation or
    graph re-entry truth.
  - The proof uses a hand-built route context or hand-built residual refs.
  - The artifact is produced by downstream consumer code instead of ABI proof
    output.
  - A query constructs residual or disposition truth that was not emitted on
    the traversal path.
required_work:
  - Add a non-closed route proof scenario using GTL requirement declarations.
  - Drive ABG traversal so requirement fold is partial, blocked, or otherwise
    non-closed for an admitted reason.
  - Emit residual projection and lifecycle disposition through the route event
    path.
  - Serialize replay artifact and manifest using the T-166 artifact contract or
    a versioned extension of it.
  - Add negative proof that closed-only artifacts cannot satisfy this ticket.
proof_commands:
  - cd build_tenants/abiogenesis/typescript && npm run test:t167
  - cd build_tenants/abiogenesis/typescript && npm run test:t166
  - cd build_tenants/abiogenesis/typescript && npm run lint:semantic
  - cd build_tenants/abiogenesis/typescript && npm run lint:test-harness
  - git diff --check
---

# T-167: Non-Closed Requirements Route Replay Artifact

## STDO Triage

### First Missing Layer

Proof artifact.

The route law and closed-route artifact exist. The missing substrate is a real
ABI replay artifact for residual pressure and continuation/re-entry
disposition.

### Lawful Re-Entry

`realization_refactor`.

This ticket does not change product identity or route ownership. It extends the
proof surface so downstream lifecycle consumers can prove non-closed route
interpretation from ABG replay truth.

## GTL Check

This ticket uses existing GTL requirement declarations and lifecycle route refs.
It does not yet solve requirement decomposition/refinement. If the proof needs
multi-requirement derivation, it must defer that part to T-168 rather than
inventing a local test-only GTL shape.

## Acceptance Checklist

- [x] T-167 proof scenario starts from GTL requirement declarations.
- [x] Proof does not pass caller-supplied `RequirementRouteRuntimeContext`.
- [x] ABG emits a non-closed requirement fold.
- [x] ABG emits requirement residual projection.
- [x] ABG emits lifecycle disposition joined over continuation or re-entry
      truth.
- [x] Replay artifact and manifest are digest-pinned.
- [x] Negative proof rejects closed-only artifact as T-167 closure.
- [x] `npm run test:t167` passes.
- [x] Installed proof command produces a concrete artifact path.
- [x] `git diff --check` passes.

## Closure Evidence

Closed on 2026-06-29.

2026-06-30 qualification: this closure is valid for installed route mechanics
only. It is not valid as live execution-grounded proof-of-record for downstream
non-closed lifecycle parity. The producing test uses an in-test evaluator stub
that defaults `closeDisposition` to `no_close`, and the requirement source
carries the intended non-closure answer. T-175 replaces this proof class.

2026-06-30 resolution: T-175 published the live proof-of-record for downstream
non-closed lifecycle consumption. T-167 remains valid as installed
engine-mechanics regression coverage and is no longer the proof artifact that
downstream consumers should pin for live non-closed parity.

Implementation note:

- The route already emitted requirement facts for closed assurance decisions.
  T-167 exposed that non-close assurance branches returned through retry or
  terminal handling before route emission. The fix routes retry/block/reprice/
  defer assurance decisions through the same `emitRequirementRouteForEdgeClose`
  path before ABG records retry or terminal continuation.

Concrete artifact:

- artifact:
  `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/test_runs/t167_non_closed_requirements_route_replay_artifact/20260628T192010906Z_pid82713/requirements-route-replay-artifact.json`
- manifest:
  `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/test_runs/t167_non_closed_requirements_route_replay_artifact/20260628T192010906Z_pid82713/requirements-route-replay-manifest.json`
- artifact digest:
  `sha256:de29305cf46ed0fca3d8d2661b62d24cb8a0f88b4af32c5252b82d8ee62f5df5`
- replay event count: `163`
- route event count: `46`
- lifecycle disposition count: `4`
- residual ref count: `4`
- route payload kinds:
  `requirement_term_admitted`,
  `requirement_projection_admitted`,
  `requirement_evidence_bound`,
  `requirement_fold_projected`,
  `requirement_residual_projected`,
  `requirement_lifecycle_disposition`,
  `authority_context_fragment_admitted`,
  `traversal_span_admitted`

Proof commands:

```bash
cd build_tenants/abiogenesis/typescript && npm run test:t167
cd build_tenants/abiogenesis/typescript && npm run test:t166
cd build_tenants/abiogenesis/typescript && npm run lint:semantic
cd build_tenants/abiogenesis/typescript && npm run lint:test-harness
git diff --check
```

The installed proof starts from GTL requirement declarations, passes only the
declaration bundle into `runEngineIterateAsync`, and does not pass a
caller-supplied `RequirementRouteRuntimeContext`. The proof produces a partial
requirement fold, residual projection, and lifecycle disposition over admitted
ABG continuation truth. The artifact is generated run state under
`test_env/test_runs/` and remains gitignored; this ticket records its identity
for downstream consumption.
