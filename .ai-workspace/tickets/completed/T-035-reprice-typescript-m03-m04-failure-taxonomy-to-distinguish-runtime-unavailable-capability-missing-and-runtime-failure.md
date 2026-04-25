# T-035 Reprice TypeScript `M03`/`M04` failure taxonomy to distinguish runtime-unavailable, capability-missing, and runtime-failure

- id: T-035
- title: Reprice TypeScript `M03`/`M04` failure taxonomy to distinguish runtime-unavailable, capability-missing, and runtime-failure
- type: feature
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- source_ticket: B-030-TS
- build_tenant: typescript
- goal: typescript-tenant-runtime-failure-taxonomy-clarity
- change_intent: Close the current TypeScript classification gap where public/runtime failure meaning is still too coarse for the stop taxonomy required by `B-030`. In the current cut that taxonomy must explain the primary operator UX over agentic coder CLI transports (`claude`, `codex`, `gemini`), not only generic transport failure.
- change_class: design_reframe
- re_entry_point: design_surface
- priority: high
- dependencies:
  - T-043 completed
  - T-026 completed
  - T-018 completed
- intake_source: `B-030-TS` application to TypeScript exposed that current transport/result/public stop truth does not yet separate runtime-unavailable, capability-missing, and true runtime failure clearly enough for one stable operator stop taxonomy
- affected_boundary: `build_tenants/abiogenesis/typescript/design/`, `build_tenants/abiogenesis/typescript/code/src/abg/m03/**`, `build_tenants/abiogenesis/typescript/code/src/app/m04/**`, `build_tenants/abiogenesis/typescript/test_env/**`
- triaged_at: 2026-04-24
- created_at: 2026-04-24
- updated_at: 2026-04-25
- library_usage: none
- library_rationale: this is a module-owned runtime/public taxonomy repricing, not a reusable tenant-local library concern
- authoritative_contract: before code opens, the tenant must declare one derivation asset, one first-slice IACS, one structural carrier diagram, and one proof lane set that show how runtime-unavailable, capability-missing, and true runtime-failure are distinguished through canonical `M03` and `M04` truth
- governing_design:
  - build_tenants/abiogenesis/typescript/design/M03_TRANSPORT_PROTOCOL_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M04_LIVE_STATUS_DERIVATION.md
  - build_tenants/abiogenesis/python/code/genesis/subwork.py
  - .ai-workspace/tickets/completed/B-030-TS-realize-typescript-m04-complete-start-callable-surface-and-stop-taxonomy-over-canonical-public-control-truth.md
- constitutional_requirements:
  - specification/requirements/abg/REQ-R-ABG3-RUN.md
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
- target_truth: TypeScript runtime/public truth now distinguishes runtime-unavailable, capability-missing, and true runtime failure as explicit canonical classes rather than collapsing them into coarse transport or rejection buckets
- superseded_truth: TypeScript currently exposes `transport_failure | no_output | contract_failure`, public `rejected`, and coarse live-status attention states that are not yet sufficient for the operator stop taxonomy required by `B-030`
- closure_law: this ticket closes only when the runtime/public taxonomy split is explicit, canonical, and consumable by higher-level operator projection without downstream re-interpretation
- walkthrough_gate: `T-043` confirmed the governing requirements and found no missing requirement ticket blocking this taxonomy reprice.

## Python Source Asset Inventory

- `build_tenants/abiogenesis/python/code/genesis/subwork.py`
- `build_tenants/abiogenesis/python/code/genesis/transport.py`
- `build_tenants/abiogenesis/python/code/genesis/live_status.py`
- `build_tenants/abiogenesis/python/design/adrs/ADR-022-subprocess-transport-with-env-sanitization.md`
- `build_tenants/abiogenesis/python/test_env/tests/test_abg3_runtime_envelope.py`

## Completion

It completes only when:

- the TypeScript line has one explicit design/module pack for this taxonomy
- `M03` and `M04` expose the split canonically
- higher-level operator/status projection can consume the split without local reinterpretation
- negative proof shows the classes are not reconstructed in downstream wrappers

## Closure Evidence

Completed on 2026-04-25.

Design/module pack:

- `build_tenants/abiogenesis/typescript/design/M03_M04_RUNTIME_FAILURE_TAXONOMY_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M03_M04_RUNTIME_FAILURE_TAXONOMY_FIRST_SLICE_IACS.md`
- `build_tenants/abiogenesis/typescript/design/M03_M04_RUNTIME_FAILURE_TAXONOMY_STRUCTURAL_CARRIER_DIAGRAM.md`
- `build_tenants/abiogenesis/typescript/design/ABG_3_MODULE_DESIGN.md`
- `build_tenants/abiogenesis/typescript/design/README.md`

Canonical realization:

- `M03` now exposes `RuntimeFailureClass`:
  `runtime_unavailable | capability_missing | runtime_failure | payload_contract_failure`.
- `ResultArtifact` carries `runtimeFailure`, and `ResultIngestOutcome` exposes
  `kind: "runtime_failure"` with the canonical class.
- `M04` result assessment carries `ingestKind: "runtime_failure"` and
  `failureClass` without parsing reason text.
- `M04` live status exposes `ProjectionResultAssessmentRef.failureClass` and
  uses the canonical class as attention `runStatus`.

Proof:

- `npm run build:semantic`
- `npm run test:t026`
- `npm run test:t017`
- `npm run test:t018`
- `npm run test:t021`
