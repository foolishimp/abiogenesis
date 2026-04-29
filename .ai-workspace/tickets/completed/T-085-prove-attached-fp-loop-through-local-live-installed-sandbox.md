---
id: T-085
title: Prove attached F_P loop through local live installed sandbox
type: qualification
ticket_category: rc_assurance
status: completed
goal: prove-t084-engine-capability-through-installed-sandbox-runtime
change_intent: Add a local live sandbox proof that consumes the installed TypeScript ABG package and runs an attached F_P worker loop through public start without a caller-owned iteration loop.
change_class: design_reframe
re_entry_point: design
affected_boundary: M05 installed sandbox qualification, M03 attached F_P loop proof, TypeScript package export/runtime surface
priority: high
triaged_at: 2026-04-27T12:53:35Z
created_at: 2026-04-27T12:53:35Z
updated_at: 2026-04-27T12:59:17Z
dependencies:
  - T-084 completed
governance_scope: STDO Method
governance_scope_expansion:
  - S: SPEC_METHOD.md
  - T: TICKET_METHOD.md
  - D: DESIGN_MODULE_METHOD.md
  - O: ODD_METHOD.md
requirement_authority:
  - specification/PRODUCT.md installed substrate and ABG runtime ownership
  - specification/requirements/product/REQ-P-QUAL.md
  - specification/requirements/product/REQ-P-SCENARIOS.md
  - specification/requirements/abg/REQ-R-ABG3-RUN.md
  - specification/requirements/abg/REQ-R-ABG3-RETRY.md
  - specification/requirements/abg/REQ-R-ABG3-CONVERGENCE.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
design_authority:
  - build_tenants/abiogenesis/typescript/design/M03_ATTACHED_FP_WORKER_LOOP_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_ATTACHED_FP_WORKER_LOOP_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M03_ATTACHED_FP_WORKER_LOOP_STRUCTURAL_CARRIER_DIAGRAM.md
  - build_tenants/abiogenesis/typescript/design/M05_INSTALLED_SANDBOX_DERIVATION.md
target_truth: A local installed sandbox proves the T-084 attached F_P loop through the package surface: installed package import, public start, attached worker plugin, blocked result, ABG retry/continuation/progress events, replay-fed retry input, accepted result, next-vector continuation, convergence, and durable archive.
superseded_truth: Engine unit tests alone are enough to prove the attached F_P loop is usable by installed downstream sandboxes.
closure_law: This ticket closes only when the proof runs from an installed package root, writes a persistent sandbox archive under `test_env/test_runs/`, and asserts that retry/re-entry is driven by replay-visible prior state rather than a hidden local attempt counter.
evaluation_criteria:
  - installed package is populated before the sandbox script runs
  - sandbox imports `@abiogenesis/typescript-tenant` from the installed target
  - public start runs a composed graph function under F_P policy with an attached worker plugin
  - first attempt blocks and emits retry/continuation/progress facts from ABG
  - second attempt receives retry attempts and progress refs from `EnginePluginInput`
  - accepted result emits assessed truth and advances to remaining graph vectors
  - final result converges without a caller-owned public-start loop
  - archive captures payload, event sequence, retry evidence, installed package root, and postmortem
non_closure_conditions:
  - proof imports directly from the source package instead of the installed target
  - proof only calls `runEngineIterate` in-process from source tests
  - proof requires manual assessed-event injection to advance
  - retry is simulated only by hidden attempt counter and does not assert replay-fed state
  - no durable archive is written
---

## Design Method Notes

This is a qualification proof over T-084, not a new engine feature.

The sandbox may use a local scripted attached worker because the point is to
prove ABG-owned control truth through an installed runtime surface. It must not
claim real probabilistic model quality or data_mapper RC readiness.

## Closure Evidence

Closed at: 2026-04-27T12:59:17Z

Design surfaces:

- `build_tenants/abiogenesis/typescript/design/M05_ATTACHED_FP_LOCAL_LIVE_SANDBOX_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M05_ATTACHED_FP_LOCAL_LIVE_SANDBOX_FIRST_SLICE_IACS.md`
- `build_tenants/abiogenesis/typescript/design/M05_ATTACHED_FP_LOCAL_LIVE_SANDBOX_STRUCTURAL_CARRIER_DIAGRAM.md`

Implementation/proof surfaces:

- `build_tenants/abiogenesis/typescript/test_env/sandbox/test_t085_attached_fp_local_live_sandbox.test.mjs`
- `build_tenants/abiogenesis/typescript/package.json`
- `build_tenants/abiogenesis/typescript/test_env/test_surface_map.md`
- `build_tenants/abiogenesis/typescript/test_env/test_runs/t085_attached_fp_local_live/20260427T125822789Z/payload.json`
- `build_tenants/abiogenesis/typescript/test_env/test_runs/t085_attached_fp_local_live/20260427T125822789Z/postmortem.md`

Proof result:

- `npm run test:t085`: 1 passed
- `npm run test:t084`: 4 passed
- `npm run lint:semantic`: passed
- `npm run test:semantic`: 248 passed

Closure claim:

The installed local live sandbox provisions an installed target, installs the
packed TypeScript tenant, imports `@abiogenesis/typescript-tenant` from that
target, runs `publicStart(...)` over a composed three-stage F_P graph function,
blocks the first attached worker result, receives replay-fed retry/progress
truth on re-entry, emits ABG-owned retry/continuation/progress and assessed
events, advances to remaining vectors, and converges without a caller-owned
public-start loop.

Non-claim:

This is a local installed-runtime proof using a scripted attached worker. It is
not external LLM quality evidence and does not close data_mapper RC
qualification.
