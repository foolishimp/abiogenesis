---
id: T-092-PY
title: Realize Python ABG total assurance projection and closure fold
type: feature
ticket_category: implementation_migration
status: backlog
review_status: suspended_by_tenant_registry
backlog_reason: Python tenant paused by T-096 and TENANT_REGISTRY; retained as reactivation authority, not a TS-primary RC gate.
closure_candidate_at: 2026-04-29T08:58:14Z
goal: abg-total-assurance-calculus
goal_status: active
build_tenant: python
activation_requires: T-089 completed, T-090 active/awaiting_external_agent_review, and T-091 proof plan accepted
change_intent: Implement the ratified ABG total assurance projection and closure fold in the Python tenant, with tenant-local proof and no reliance on TypeScript proof closure.
change_class: realization_refactor
re_entry_point: realized_surface
affected_boundary: Python ABG event/projection/closure surfaces, stale-input invalidation, report projections, plugin contracts, qualification tests
priority: high
triaged_at: 2026-04-29T07:24:15Z
created_at: 2026-04-29T07:24:15Z
updated_at: 2026-04-30T12:48:50+10:00
dependencies:
  - T-088 completed
  - T-089 completed
  - T-090 active/awaiting_external_agent_review
  - T-091 active/proof plan accepted
  - T-096 active/ts_primary_release_scope
source_ticket: T-090
migration_strategy: inside_out_core_interface_migration
library_usage: consume
governing_library: build_tenants/abiogenesis/typescript/design/M03_TOTAL_ASSURANCE_PROJECTION_DERIVATION.md
governance_scope: STDO Method
intake_source: T-088 audit found total assurance requires tenant implementation once requirement/design/proof authority is ratified. Python has precedent for stale analysis reset behavior, but not a generic ABG assurance projection over all ambiguity rows.
target_truth: If Python is reactivated, Python ABG must implement the accepted total assurance carriers, projection, closure fold, stale-input invalidation, plugin authority limits, and report read models under tenant-local proof before any Python parity or no-gap claim.
superseded_truth: Python-specific closure reset behavior or SDLC-local ledgers are enough to claim generic ABG assurance.
non_goal:
  - Do not start before T-089/T-090/T-091 authority exists.
  - Do not use Python proof as TypeScript closure.
  - Do not hard-code odd_sdlc semantics into ABG.
closure_law: Do not close while paused. If Python is reactivated, close only after Python implementation and Python-local proof satisfy the accepted requirement/design/proof surfaces. TypeScript remains independent and is now the primary release gate.
evaluation_criteria:
  - Python implementation consumes ratified ABG assurance requirement/design.
  - Python tests cover every ambiguity status required by T-091.
  - Python tests prove stale-input invalidation after prior closure.
  - Python tests prove plugin output cannot close work or append runtime truth.
  - Python reports are read models over event/projection truth.
proof_surface:
  - `build_tenants/abiogenesis/python/code/genesis/assurance.py`
  - `build_tenants/abiogenesis/python/test_env/tests/test_t092_total_assurance_projection.py`
  - stale-input runtime regression proof in `test_m03_engine_kernel_integration.py` and `test_provenance_integration.py`
  - Python test surface map trace in `build_tenants/abiogenesis/python/test_env/test_surface_map.md`
non_closure_conditions:
  - implementation starts before upstream authority is accepted
  - proof is only a downstream odd_sdlc scenario
  - a Python-specific shortcut becomes the generic law
  - TypeScript proof is claimed by implication
---

# T-092-PY: Python ABG Total Assurance

This is a tenant-local implementation ticket created by the T-088 audit. The
upstream requirement, design, and proof plan are now accepted, but Python work
is suspended by the tenant registry. The ticket remains as retained evidence and
reactivation authority, not as a TS-primary RC gate.

## Tenant Pause Disposition

The tenant registry now marks `abiogenesis/typescript` as the primary release
line and `abiogenesis/python` as paused. This ticket therefore does not block
the TS-primary RC cut and must not be used to claim Python parity, Python
closure, or Python no-gap sufficiency.

If Python is reactivated, this ticket re-enters before any Python assurance
projection claim can close.

## Closure Candidate Evidence

Status is now `paused`; this ticket is not closed and is not an active RC gate
while the tenant registry keeps Python paused.

Implemented surfaces:

- `build_tenants/abiogenesis/python/code/genesis/assurance.py` adds Python
  total assurance carriers, projection, closure fold, stale-input invalidation,
  provider-output authority rejection, and report read model.
- `build_tenants/abiogenesis/python/test_env/tests/test_t092_total_assurance_projection.py`
  proves every T-091 ambiguity row, stale-input priority, superseded closure
  register demotion, provider authority limits, determinism, and report
  read-model behavior.
- `build_tenants/abiogenesis/python/code/genesis/interpret.py` no longer lets
  replayed `edge_converged` keys bypass current spec-hash/workflow-version
  evaluation before `bind_fd`.
- Python trace surfaces were updated so the new test and local authority links
  remain visible to `test_spec_method_trace.py`.

Verification:

- `./run_tests file tests/test_t092_total_assurance_projection.py` passed 14
  tests.
- `./run_tests file tests/test_spec_method_trace.py` passed 16 tests.
- targeted stale-input/runtime regression tests passed 3 tests.
- targeted local transport-contract regression passed 1 test.
- `./run_tests` passed 349 tests with 19 deselected after adding the T-095-PY
  forensic payload-ledger parity audit validator.

The 2026-04-30 external review trace blockers were resolved before the pause.
That evidence remains useful reference material. It is not an active release
gate while Python is paused.
