# B-030-TS Realize TypeScript `M04` complete `gen-start` callable surface and stop taxonomy over canonical public-control truth

- id: B-030-TS
- title: Realize TypeScript `M04` complete `gen-start` callable surface and stop taxonomy over canonical public-control truth
- type: feature
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: backlog
- source_ticket: B-030
- build_tenant: typescript
- goal: typescript-tenant-complete-start-surface-and-stop-taxonomy
- change_intent: Apply upstream `B-030` to the TypeScript tenant by publishing one wrapper-facing complete callable `start` surface and one small stop taxonomy over the already completed TypeScript `M04` public-control surfaces, so CLI and MCP wrappers can call complete substrate truth instead of reconstructing folklore control bundles. In the current cut, the primary operator UX is through agentic coder interfaces over CLIs (`claude`, `codex`, or `gemini`) and later MCP bindings, so the interface and taxonomy must explain stops over that concrete transport reality rather than an abstract generic runtime shell. Raw command-line complexity is acceptable if the callable substrate is complete and truthful; convenience/autonomy bundles are agent guidance, not product-owned substrate truth.
- change_class: design_reframe
- re_entry_point: design_surface
- priority: critical
- dependencies:
  - B-030 completed
  - T-013 completed
  - T-016 completed
  - T-017 completed
  - T-018 completed
  - T-034 backlog
  - T-035 backlog
- intake_source: design-module-method application of upstream `B-030` against the completed TypeScript `M04` public-start, control-loop, event-ingress, result-assessment, and live-status surfaces
- affected_boundary: `build_tenants/abiogenesis/typescript/design/`, `build_tenants/abiogenesis/typescript/code/src/app/m04/**`, `build_tenants/abiogenesis/typescript/test_env/**`
- triaged_at: 2026-04-24
- created_at: 2026-04-24
- updated_at: 2026-04-24
- library_usage: consume
- governing_library: `build_tenants/abiogenesis/typescript/design/ABG_COMMON_REALIZATION_LIBRARY_FIRST_SLICE_IACS.md`
- authoritative_contract: before TypeScript code opens, the tenant must declare one explicit complete-start derivation asset, one first-slice IACS, one Mermaid structural carrier diagram, one bounded strict lane, and one module-derived proof lane set; the first slice is bounded to one wrapper-facing complete callable `start` surface and one stop-taxonomy projection over already completed `M04` public truth, while the lower-level explicit request grammar remains lawful beneath it
- governing_design:
  - build_tenants/abiogenesis/typescript/design/ABG_3_MODULE_DESIGN.md
  - build_tenants/abiogenesis/typescript/design/M04_PUBLIC_START_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M04_CONTROL_LOOP_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M04_LIVE_STATUS_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/ABG_COMMON_REALIZATION_LIBRARY_FIRST_SLICE_IACS.md
  - build_tenants/common/design/modules/M04-app-bootstrap.yml
  - build_tenants/abiogenesis/python/design/ABG_3_MODULE_DESIGN.md
  - .ai-workspace/tickets/completed/B-030-publish-one-complete-gen-start-interface-and-clear-stop-taxonomy.md
- constitutional_requirements:
  - specification/PRODUCT.md
  - specification/requirements/product/REQ-P-POLICY.md
  - specification/requirements/abg/REQ-R-ABG3-RUN.md
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
- links:
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/B-030-publish-one-complete-gen-start-interface-and-clear-stop-taxonomy.md
  - /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/cli_adapter.py
  - /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/live_status.py
  - /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/proof_hold.py
  - /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/subwork.py
  - /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/design/adrs/ADR-022-subprocess-transport-with-env-sanitization.md
- target_truth: TypeScript `M04` publishes one complete callable `start` surface and one small stop taxonomy that distinguishes convergence, human-decision-required, worker/runtime-unavailable, capability-missing, proof-hold, and true runtime failure over existing public/runtime truth rather than downstream folklore bundles; CLI and MCP wrappers consume that substrate truth without local runtime reconstruction
- superseded_truth: the completed TypeScript line still encourages consumers to rely on remembered convenience bundles or lower-level routing knowledge, and it still exposes low-level stop or status detail such as `dispatch_required`, `yielded`, `transport_failure`, or `rejected` without one substrate-owned stop-class projection
- closure_law: this ticket closes only when TypeScript `M04` publishes one admitted complete callable `start` surface and one stop-taxonomy projection over canonical public/runtime truth, proof shows both positive autonomous advance and negative terminal classes, and downstream CLI/MCP/package surfaces can bind that substrate truth without inventing a second control loop or local stop taxonomy

## First Slice Boundary

Included in `B-030-TS` first slice:

- one wrapper-facing complete callable `start` surface
- one deterministic lowering from that surface to the existing lower-level
  TypeScript control request surface
- one closed stop-taxonomy projection over completed public control/live-status
  truth
- one bounded proof lane showing downstream bare-start binding to substrate
  truth rather than folklore control flags

Explicitly deferred from `B-030-TS` first slice:

- a second operator command story beside `gen-start`
- replacement of the lower-level explicit `scope + target + until` public
  contract
- installed CLI spellings or exit-code doctrine as the source of truth
- new kernel runtime doctrine below canonical `M03`/`M04` boundaries

## Interface-Mediated UX Position

For this TypeScript wave, design authority optimizes for complete callable
substrate truth, not minimal human-typed command grammar.

The primary operator UX is mediated by interfaces:

- agentic coder CLI surfaces
- MCP wrappers
- later website or service bindings if needed

So this wave must prioritize:

- complete callable `start` truth
- truthful typed stop-class carriers
- wrapper-friendly admitted inputs and closed outcomes

It must not optimize for:

- raw CLI brevity as a design center
- command spelling simplicity as product authority
- wrapper-local reconstruction of missing start or stop meaning

The operator concept is still `start`.

TypeScript wrappers are allowed to lower that concept into a multi-parameter
call on the actual callable surface. The design obligation is complete
callable substrate truth with admitted inputs and closed outcomes, not a
single-argument operator call shape.

Convenience/autonomy bundles belong in agent guidance and may evolve without
becoming a product-owned public carrier family.

## Migration Declaration

- old_truth_path: TypeScript consumers must still bind explicit lower-level control bundles and infer stop meaning from raw public-start/control/live-status detail
- new_truth_path: TypeScript publishes one wrapper-facing complete callable `start` surface and one stop-taxonomy projection over canonical public/runtime truth
- producers_old:
  - completed TypeScript `M04` public-start/control/live-status families
  - downstream wrapper memory
- producers_new:
  - one TypeScript callable-start admission/binding surface
  - one TypeScript stop-taxonomy projection over completed public truth
- consumers_old:
  - downstream package/bootstrap surfaces
  - operator bindings that remember the folklore bundle
- consumers_new:
  - downstream bare-start CLI wrappers bound to the callable surface
  - MCP bindings over the same callable surface
  - operator/read-model surfaces consuming one stable stop taxonomy
- derived_surfaces:
  - callable-surface admission
  - callable-surface lowering
  - stop taxonomy projection
  - later install/downstream qualification proof

## Migration Checklist

- [ ] old truth path is named explicitly
- [ ] new truth path is named explicitly
- [ ] producer set for the new truth is listed
- [ ] consumer set for the new truth is listed
- [ ] projection/read-model surfaces are listed
- [ ] old truth path is removed or explicitly demoted from authority
- [ ] mixed-state behavior is no longer accepted as closure evidence
- [ ] tests proving mixed old/new behavior are removed or repriced
- [ ] recurring realization patterns are checked against existing library/commonization surfaces
- [ ] library usage is declared and the governing library or rationale is named
- [ ] ticket wording, product wording, and proof claims are reconciled before closure

## Recurring Realization And Library Declaration

- library_usage: consume
- governing_library:
  - `build_tenants/abiogenesis/typescript/design/ABG_COMMON_REALIZATION_LIBRARY_FIRST_SLICE_IACS.md`
  - `build_tenants/abiogenesis/typescript/design/ABG_COMMON_REALIZATION_LIBRARY_STRUCTURAL_CARRIER_DIAGRAM.md`
  - `build_tenants/abiogenesis/typescript/code/src/shared/abg_library/**`
- recurring_patterns:
  - callable-surface lowering over admitted carriers
  - closed stop-class projection over existing carrier families
  - module-derived proof-helper fixtures
- library_extension_scope: none unless this wave discovers a new tenant-local reusable projection pattern beyond current library law

## Expected Build Output

- `M04_MAXIMUM_AUTONOMY_GEN_START_DERIVATION.md`
- `M04_MAXIMUM_AUTONOMY_GEN_START_FIRST_SLICE_IACS.md`
- `M04_MAXIMUM_AUTONOMY_GEN_START_STRUCTURAL_CARRIER_DIAGRAM.md`
- one bounded `code/src/app/m04/max_autonomy/**` slice or equivalent module-owned surface
- `test_m04_complete_start_surface_unit.test.mjs`
- `test_m04_complete_start_surface_integration.test.mjs`
- `b030-ts-m04-complete-start-negative.test.mjs`

## Python Source Asset Inventory

- `build_tenants/abiogenesis/python/design/ABG_3_MODULE_DESIGN.md`
- `build_tenants/abiogenesis/python/code/genesis/cli_adapter.py`
- `build_tenants/abiogenesis/python/code/genesis/live_status.py`
- `build_tenants/abiogenesis/python/code/genesis/proof_hold.py`
- `build_tenants/abiogenesis/python/code/genesis/subwork.py`
- `build_tenants/abiogenesis/python/design/adrs/ADR-022-subprocess-transport-with-env-sanitization.md`
- `build_tenants/abiogenesis/python/test_env/tests/test_cli_adapter_auto.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_sandbox_install.py`

## Current TypeScript Source Asset Inventory

- `build_tenants/abiogenesis/typescript/design/M04_PUBLIC_START_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M04_CONTROL_LOOP_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M04_LIVE_STATUS_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/code/src/app/m04/public_start.ts`
- `build_tenants/abiogenesis/typescript/code/src/app/m04/contracts/**`
- `build_tenants/abiogenesis/typescript/code/src/app/m04/control/**`
- `build_tenants/abiogenesis/typescript/code/src/app/m04/live_status/**`
- `build_tenants/abiogenesis/typescript/code/src/app/m04/event_ingress/**`
- `build_tenants/abiogenesis/typescript/code/src/app/m04/result_assessment/**`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/transport/**`
- `build_tenants/abiogenesis/typescript/code/src/shared/abg_library/transport_contracts.ts`

## Python Source Reconciliation Checklist

- [ ] `python/design/ABG_3_MODULE_DESIGN.md` reconciled for complete start interface ownership
- [ ] `python/code/genesis/cli_adapter.py` reconciled for public callable start surface and stop-class projection
- [ ] `python/code/genesis/live_status.py` reconciled for operator-grade stop/read-model meaning
- [ ] `python/code/genesis/proof_hold.py` reconciled for proof-hold stop truth
- [ ] `python/code/genesis/subwork.py` reconciled where capability/failure taxonomy constrains stop-class meaning
- [ ] `python/design/adrs/ADR-022-subprocess-transport-with-env-sanitization.md` reconciled for primary agentic coder CLI transport reality (`claude`, `codex`, `gemini`)
- [ ] `python/test_env/tests/test_cli_adapter_auto.py` reconciled into TypeScript callable-surface and stop-taxonomy proof
- [ ] `python/test_env/tests/test_sandbox_install.py` reconciled where downstream bare-start binding is proven

## Functional Realization Review Checklist

- [ ] the complete callable `start` surface is substrate-owned and not a downstream folklore bundle
- [ ] the lower-level explicit `scope + target + until` request grammar remains lawful beneath the callable surface
- [ ] the stop taxonomy is projected from canonical public/runtime truth rather than downstream wrappers
- [ ] the stop taxonomy distinguishes convergence, human-decision-required, worker/runtime-unavailable, capability-missing, proof-hold, and true runtime failure
- [ ] the taxonomy is stated against the actual primary UX transport line: agentic coder CLI backends `claude`, `codex`, and `gemini`
- [ ] no new rival operator story is introduced beside `gen-start`
- [ ] local cleanup is absorbed only inside the owned first slice; cross-boundary blockers or opportunities create triage tickets

## Impacted Interface Review Checklist

- [ ] downstream package/bootstrap/CLI/MCP bindings can consume the callable surface without inventing a second control loop
- [ ] completed `publicStart(...)`, `publicControlLoop(...)`, and `projectLiveStatus(...)` remain upstream authoritative surfaces rather than being silently replaced
- [ ] advanced callers can still use lower-level explicit control families lawfully
- [ ] negative proof shows downstream wrappers no longer need the folklore control bundle to bind bare start

## Required Break Order

1. ratify the complete callable `start` surface and stop-taxonomy law in TypeScript design/module assets
2. lower the callable surface into existing public-control truth without replacing the lower-level explicit contract
3. land the stop taxonomy as one closed projection over canonical public/runtime truth
4. reprice downstream bare-start consumers to the new substrate truth
5. only then widen install or downstream qualification surfaces

## Break Contract

- Break 1 seam severed: folklore control-bundle memory in downstream bare-start bindings
  - expected negative proof: bare-start binding can consume the callable surface without wrapper-local folklore
- Break 2 seam severed: low-level stop detail is interpreted independently by downstream wrappers
  - expected negative proof: stop-class meaning derives from one substrate-owned projection
- Break 3 seam severed: a new rival operator surface is introduced beside `gen-start`
  - expected negative proof: the callable surface remains inside the one `gen-start` operator story, not a second command story

## Non-Closure Conditions

- closure is claimed while TypeScript still lacks proof-hold projection (`T-034`)
- closure is claimed while TypeScript still collapses runtime-unavailable, capability-missing, and runtime-failure into a coarser transport or rejection taxonomy (`T-035`)
- closure is claimed while downstream bindings still need the explicit folklore flag bundle
- closure is claimed with a convenience helper but no substrate-owned stop-taxonomy projection
