---
id: T-135
title: Resolve vector-local runtime regimes for mixed construction traversal
type: feature
ticket_category: abg_runtime_regime_resolution
status: completed
review_status: completed_semantic_proof
priority: critical
owner: codex
created_at: 2026-05-16T13:58:40+10:00
activated_at: 2026-05-16T13:58:40+10:00
updated_at: 2026-05-16T14:55:15+10:00
completed_at: 2026-05-16T14:55:15+10:00
change_class: realization_refactor
re_entry_point: implementation
goal: mixed-regime-construction-substrate
release_scope: post-3.7.1 construction substrate
build_tenant: typescript
owning_repo: abiogenesis
governance_scope: STDO Method
intake_source:
  - 2026-05-16 review of odd_sdlc test35 behavior and TypeScript substrate gap
  - current ABG runner advances vectors from basis.resolvedPolicy.defaultRegime rather than an effective vector-local regime
  - mixed SDLC-like graphs require F_P construction edges and deterministic follow-up/projection edges in one replay-owned runner
superseded_premise_note: >
  The intake claim that ABG advanced every vector from
  basis.resolvedPolicy.defaultRegime is historical. T-135 superseded it by
  adding `deriveEffectiveVectorRegime`, selected-regime transition binding, and
  replay-visible selected regime fields on `vector_traversal_planned`. Future
  work should consume that surface rather than re-exploring the old basis-wide
  premise.
requirement_refs:
  - specification/PRODUCT.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md
  - specification/requirements/gtl/REQ-L-GTL3-EVALUATOR.md
  - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
  - specification/requirements/abg/REQ-R-ABG3-INTERPRET.md
  - specification/requirements/abg/REQ-R-ABG3-FP-CONSCIOUSNESS.md
design_refs:
  - build_tenants/abiogenesis/typescript/design/M03_VECTOR_RUNTIME_REGIME_RESOLUTION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_VECTOR_RUNTIME_REGIME_RESOLUTION_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M03_VECTOR_RUNTIME_REGIME_RESOLUTION_STRUCTURAL_CARRIER_DIAGRAM.md
  - build_tenants/abiogenesis/typescript/design/M03_FP_CONSCIOUSNESS_LOOP_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_TRAVERSAL_MODULATION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_M04_PLUGIN_CONTRACT_MODEL_DERIVATION.md
dependencies:
  - .ai-workspace/tickets/completed/T-134-define-abg-fn-composition-grammar.md
related_tickets:
  - .ai-workspace/tickets/completed/T-128-realize-fp-consciousness-runner-over-admitted-construction-intent.md
  - .ai-workspace/tickets/completed/T-134-define-abg-fn-composition-grammar.md
affected_boundary:
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/regime_resolution.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/iteration.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/event_factories.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/event_admission.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/carriers.ts
  - build_tenants/abiogenesis/typescript/code/src/gtl/m01/contracts/
  - build_tenants/abiogenesis/typescript/code/src/gtl/m02/contracts/
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/admission/
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/iteration.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts
  - build_tenants/abiogenesis/typescript/test_env/tests/
closure_evidence:
  - T-134 supplied the completed ABG.Fn grammar requirement/design authority; T-135 implemented the vector-local regime resolution slice against that grammar.
  - build_tenants/abiogenesis/typescript/design/M03_VECTOR_RUNTIME_REGIME_RESOLUTION_DERIVATION.md defines the vector-local regime resolution contract and closure rules.
  - build_tenants/abiogenesis/typescript/design/M03_VECTOR_RUNTIME_REGIME_RESOLUTION_FIRST_SLICE_IACS.md declares the irreducible carrier set and subordinate payload split.
  - build_tenants/abiogenesis/typescript/design/M03_VECTOR_RUNTIME_REGIME_RESOLUTION_STRUCTURAL_CARRIER_DIAGRAM.md provides the required structural carrier diagram.
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/regime_resolution.ts implements pure `deriveEffectiveVectorRegime` over admitted basis/vector truth.
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/iteration.ts selects `fd_advance`, `fp_dispatch`, or `fh_escalation` from the effective vector regime instead of `resolvedPolicy.defaultRegime`.
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/event_factories.ts records selected regime, source, source ref, and diagnostics on `vector_traversal_planned`.
  - build_tenants/abiogenesis/typescript/test_env/tests/test_t135_vector_local_runtime_regime.test.mjs proves basis-default override rejection, mixed F_P then F_D runner drain, explicit F_H routing, missing authority rejection, contradictory declaration rejection, and replay advance.
  - 2026-05-16 `npm run test:t135` passed: 6 tests, 0 failures.
  - 2026-05-16 `npm run test:t072` passed: 14 tests, 0 failures.
  - 2026-05-16 `npm run test:t084` passed: 4 tests, 0 failures.
  - 2026-05-16 `npm run test:t063` passed: 3 tests, 0 failures.
  - 2026-05-16 `npm run lint:semantic` passed.
  - 2026-05-16 `npm run lint:test-harness` passed.
  - 2026-05-16 `npm run test:semantic` passed: 537 tests, 0 failures, 4 skipped.
target_truth: ABG derives an effective runtime regime for each graph vector from GTL vector-local operators, evaluators, hook/policy declarations, and resolved policy, with the basis default regime used only as an explicit fallback. A single graph can lawfully dispatch an F_P construction vector, drain an F_D deterministic follow-up vector, or hold for F_H without downstream controller code switching regimes.
closure_law: Close only when tests prove mixed F_P/F_D/F_H graphs advance by vector-local effective regime, replay projects the same selected regimes, malformed or contradictory regime declarations fail closed with typed diagnostics, and basis-wide defaultRegime can no longer silently override vector-local regime truth.
non_closure_conditions:
  - ABG still selects every vector from basis.resolvedPolicy.defaultRegime
  - downstream product code has to manually drain deterministic edges after F_P work
  - regime selection is inferred from prompt text, edge name, or current config rather than admitted GTL/runtime policy
  - deterministic tests prove only all-F_D or all-F_P graphs
---

# T-135: Resolve Vector-Local Runtime Regimes For Mixed Construction Traversal

## Entry

The current runner has graph-vector replay, but regime selection is too coarse
for construction episodes that mix F_P work with deterministic follow-up edges.
This ticket makes regime selection an admitted, replay-visible vector-local
runtime decision.

## Design Module Method Notes

Governing standard:
`/Users/jim/src/apps/specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md`.

ODD alignment: effective regime resolution is a deterministic realization inside
declared GTL graph-vector traversal. It must not infer graph function identity,
semantic target movement, or closure from controller code, edge names, prompt
text, or ambient runtime state.

Module roles:

- carrier module for vector-local regime declaration and selected regime truth;
- semantic kernel for pure regime resolution from admitted GTL/runtime inputs;
- projection module for replay-visible selected regime identity.

Irreducible Architectural Carrier Set for this ticket:

- `GraphVectorRegimeDeclaration`;
- `EffectiveVectorRegime`;
- `RegimeResolutionInput`;
- `RegimeResolutionOutcome`;
- `RegimeResolutionDiagnostic`.

Subordinate payloads: operator/evaluator hook config fragments, basis fallback
detail, and malformed-declaration evidence remain subordinate to the resolution
outcome unless independently admitted as public runtime truth.

Design assets required before design-method closure:

- structural carrier diagram for regime declaration, resolution input, outcome,
  and diagnostics;
- precedence rule showing vector-local truth versus basis fallback;
- negative proof for basis default overriding vector truth, prompt-name
  inference, and malformed declarations;
- module-derived unit tests over the declared carrier set.

## Acceptance

- [x] Define an effective regime resolution contract for a graph vector.
- [x] Attach or update the structural carrier diagram for vector-local regime
  resolution.
- [x] Declare the final IACS and subordinate payload split before code closure.
- [x] Preserve GTL authority: vector operators/evaluators/policy hooks are the
  primary source; basis default is fallback only.
- [x] Emit or project selected regime identity so replay observes the same
  decision.
- [x] Prove mixed graph traversal: F_P construction edge followed by F_D
  deterministic follow-up under one ABG runner.
- [x] Prove F_H vector routing remains explicit and cannot be inferred by
  absent dispatch alone.
- [x] Add negative tests for conflicting vector declarations, missing dispatch
  for F_P, missing approval subject for F_H, and basis default overriding vector
  truth.
