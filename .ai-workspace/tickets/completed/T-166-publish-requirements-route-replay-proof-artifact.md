---
id: T-166
title: Publish requirements-route replay proof artifact for downstream consumers
type: proof
ticket_category: downstream_proof_artifact
status: completed
goal: >-
  Publish a downstream-consumable proof artifact from the T-165 Hello World
  requirements-route live proof, or a successor equivalent proof, containing
  serialized ABG requirement-route replay events and lifecycle state. The
  artifact shall let downstream products such as odd_glc prove consumption of
  real ABG route truth without calling ABG runtime-internal emitters,
  admission commands, fold builders, residual projectors, or disposition
  resolvers.
change_intent: >-
  T-165 proves the live requirements route in memory and records transport,
  prompt, execution, and stdout artifacts, but the existing run directories do
  not serialize the route replay/runtime-event truth that downstream products
  need for Phase 5 consumption proof. This ticket adds the proof-publication
  surface only. It does not change the GTL/ABG route, expose internal emitters,
  or make odd_glc an authority over ABG truth.
change_class: realization_refactor
re_entry_point: proof
owner: abiogenesis
priority: high
triaged_at: 2026-06-29
created_at: 2026-06-29
updated_at: 2026-06-29
closed_at: 2026-06-29
governance_scope: STDO Method, ABG requirements route, downstream proof artifact
build_tenant: typescript
downstream_consumers:
  - /Users/jim/src/apps/odd_glc/.ai-workspace/tickets/active/T-005-prove-odd-glc-consumes-real-t165-route-replay.md
source_documents:
  - specification/GOALS.md
  - .ai-workspace/tickets/completed/T-164-realize-gtl-abg-requirements-algebra-route-for-downstream-lifecycle-consumers.md
  - .ai-workspace/tickets/completed/T-165-prove-hello-world-live-requirements-route.md
  - build_tenants/abiogenesis/typescript/test_env/live/test_t165_hello_world_requirements_route_live.test.mjs
  - /Users/jim/src/apps/odd_glc/.ai-workspace/tickets/active/T-005-prove-odd-glc-consumes-real-t165-route-replay.md
affected_boundary:
  goals:
    - specification/GOALS.md
  proof:
    - build_tenants/abiogenesis/typescript/test_env/tests/support/requirements-route-replay-artifact.mjs
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t166_requirements_route_replay_artifact.test.mjs
    - build_tenants/abiogenesis/typescript/test_env/live/test_t165_hello_world_requirements_route_live.test.mjs
  package_scripts:
    - build_tenants/abiogenesis/typescript/package.json
target_truth: >-
  ABIogenesis writes a digest-pinned requirements-route replay artifact and
  manifest from a live or equivalent proof run. The artifact contains serialized
  `requirement_route_fact_projected` runtime events for admitted terms,
  projections, evidence binding, requirement fold, and lifecycle disposition,
  plus the replay-derived lifecycle state. Downstream products may consume the
  artifact as read-only proof input; they still cannot emit, mint, admit, bind,
  fold, residualize, or resolve disposition truth.
superseded_truth: >-
  Prompt files, stdout logs, transport traces, execution traces, or in-memory
  test assertions are enough for downstream products to prove they consume real
  ABIogenesis requirement-route replay truth.
closure_law: >-
  Close only when a non-live contract test locks the proof-artifact schema and
  a T-165 live or successor proof run writes a manifest plus route replay
  artifact containing serialized route runtime events and lifecycle state.
  Closure must prove the artifact is produced by ABIogenesis proof/runtime
  output, not by odd_glc, and that it does not expose downstream-public emitter
  APIs or require caller-supplied route truth.
non_closure_conditions:
  - The artifact contains only prompt, stdout, transport, or execution trace
    files and no serialized route replay/runtime events.
  - The artifact is hand-built by a downstream consumer.
  - The artifact omits any required route payload kind:
    `requirement_term_admitted`, `requirement_projection_admitted`,
    `requirement_evidence_bound`, `requirement_fold_projected`, or
    `requirement_lifecycle_disposition`.
  - The artifact omits replay-derived lifecycle state.
  - The implementation exposes ABG runtime-internal route emitters through a
    downstream-public package surface.
required_work:
  - Add a reusable proof-artifact writer for requirement-route replay events.
  - Add a synthetic T-166 test that validates artifact schema, required route
    payload kinds, manifest digest, and fail-closed behavior for incomplete
    route truth.
  - Wire the T-165 live proof to write the artifact and manifest into its run
    directory after lifecycle-state replay succeeds.
  - Run the non-live T-166 contract test.
  - Run the live T-165/T-166 proof lane to produce a concrete downstream
    artifact, or keep this ticket active until the live lane is run.
proof_commands:
  - cd build_tenants/abiogenesis/typescript && npm run test:t166
  - cd build_tenants/abiogenesis/typescript && npm run test:t166:live
  - cd build_tenants/abiogenesis/typescript && npm run lint:test-harness
  - git diff --check
---

# T-166: Publish Requirements-Route Replay Proof Artifact

## STDO Triage

### First Missing Layer

Proof artifact.

T-164 and T-165 prove the route and live Hello World steel thread, but the
published run directory does not yet carry a downstream-readable replay
artifact. The missing layer is not requirement law or route design; it is proof
publication.

### Lawful Re-Entry

`realization_refactor`.

The route semantics remain stable. This ticket only records route replay facts
that ABI already emits during proof execution.

## Acceptance Checklist

- [x] T-166 is opened under the ABIogenesis STDO ticket surface.
- [x] GOAL-013 names the downstream proof-publication wave.
- [x] Proof-artifact writer records replay events, emitted events, sink events,
      route events, route payload refs, lifecycle state, and source metadata.
- [x] Manifest records artifact digest and required route payload kinds.
- [x] Non-live T-166 test validates artifact schema and fail-closed behavior.
- [x] T-165 live proof is wired to write the replay artifact after lifecycle
      state projection succeeds.
- [x] `npm run test:t166` passes.
- [x] `npm run test:t166:live` passes and produces a concrete artifact path.
- [x] `npm run lint:test-harness` passes.
- [x] `git diff --check` passes.
- [x] Downstream odd_glc T-005 records the artifact path before it claims
      Phase 5 closure.

## Closure Evidence

Closed on 2026-06-29.

Concrete artifact:

- artifact:
  `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/test_runs/t165_hello_world_requirements_route_live/20260628T175945864Z_pid34852/requirements-route-replay-artifact.json`
- manifest:
  `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/test_runs/t165_hello_world_requirements_route_live/20260628T175945864Z_pid34852/requirements-route-replay-manifest.json`
- artifact digest:
  `sha256:4ba42598bbf309b4568d5d167dc395f31799d32bd5b8fd7b78f76131494fd10e`
- replay event count: `47`
- route event count: `11`
- route payload kinds:
  `requirement_term_admitted`,
  `requirement_projection_admitted`,
  `requirement_evidence_bound`,
  `requirement_fold_projected`,
  `requirement_lifecycle_disposition`,
  `authority_context_fragment_admitted`,
  `traversal_span_admitted`

Proof commands:

```bash
cd build_tenants/abiogenesis/typescript && npm run test:t166
cd build_tenants/abiogenesis/typescript && npm run lint:test-harness
cd build_tenants/abiogenesis/typescript && npm run test:t166:live
git diff --check
```

`npm run test:t166` passed two tests. `npm run test:t166:live` passed the
T-165 prompt-carry guard and the live Hello World route proof, then wrote the
route replay artifact and manifest. The artifact is live run state under
`test_env/test_runs/` and remains gitignored; the ticket records its identity
for downstream consumption.
