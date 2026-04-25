# T-033 Realize TypeScript RC live qualification lane over real F_P transport execution

- id: T-033
- title: Realize TypeScript RC live qualification lane over real F_P transport execution
- type: feature
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- goal: typescript-tenant-rc-live-qualification
- change_intent: Add an authoritative TypeScript RC live qualification lane so `build_tenants/abiogenesis/typescript` can only claim RC live-green after real F_P transport execution, real result-artifact ingestion, live-status projection, and durable forensic evidence.
- change_class: design_reframe
- re_entry_point: design_surface
- triaged_at: 2026-04-24
- created_at: 2026-04-24
- updated_at: 2026-04-24
- completed_at: 2026-04-24
- priority: high
- build_tenant: abiogenesis/typescript
- dependencies:
  - T-026 completed
  - T-031 completed
  - T-032 completed
- intake_source: 2026-04-24 RC review found that the TypeScript semantic suite and installed package-surface live lanes are green, but no authoritative TypeScript lane proves real external F_P worker execution for RC closure.
- affected_boundary: `build_tenants/abiogenesis/typescript/design/**`, `build_tenants/abiogenesis/typescript/code/src/abg/m03/transport/**`, `build_tenants/abiogenesis/typescript/code/src/qualification/m05/**`, `build_tenants/abiogenesis/typescript/test_env/**`, and RC live evidence surfaces
- library_usage: consume
- governing_library:
  - `build_tenants/abiogenesis/typescript/design/ABG_COMMON_REALIZATION_LIBRARY_FIRST_SLICE_IACS.md`
  - `build_tenants/abiogenesis/typescript/design/ABG_COMMON_DELIVERY_LIBRARY_FIRST_SLICE_IACS.md`
- authoritative_contract: before the TypeScript tenant can be closed for RC, the tenant must satisfy the `SPEC_METHOD.md` testing strategy taxonomy by providing one explicit live sandbox UAT qualification command that executes at least one real F_P backend through the TypeScript transport contract, ingests the real result artifact, projects final live status from that artifact, and captures enough durable evidence for postmortem review. The archive/postmortem framework is inherited from the Python sandbox and repriced into TypeScript by `T-030`; this ticket consumes that lineage rather than creating new archive law. Python reference tests may identify requirement and scenario obligations, but RC live execution proof must be reusable independently from the Python harness and must stand on a packaged TypeScript tenant installed into the sandbox package surface.
- governing_design:
  - build_tenants/abiogenesis/typescript/design/M03_TRANSPORT_PROTOCOL_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_TRANSPORT_PROTOCOL_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M03_TRANSPORT_PROTOCOL_STRUCTURAL_CARRIER_DIAGRAM.md
  - build_tenants/abiogenesis/typescript/design/M05_INSTALLED_SANDBOX_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M05_INSTALLED_LIVE_PORTFOLIO_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M05_ARCHIVE_FINALIZATION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M05_PYTHON_SANDBOX_PROOF_EQUIVALENCE_AUDIT.md
  - specification/requirements/product/REQ-P-QUAL.md
  - specification_methodology/specification/standards/SPEC_METHOD.md
  - specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md
  - specification_methodology/specification/standards/TICKET_METHOD.md
- proof_surface:
  - `npm run test:semantic`
  - one new authoritative TypeScript RC live command, for example `npm run test:live` or `npm run rc:live`
  - durable RC live evidence archive under the tenant qualification evidence surface
- target_truth: TypeScript RC closure requires real live F_P transport evidence in addition to semantic and installed package-surface proof.
- superseded_truth: TypeScript RC closure could be inferred from `npm run test:semantic`, `test:t026`, and installed live-portfolio tests even though those lanes do not execute a real external F_P worker.
- closure_law: this ticket closes only when TypeScript RC live-green is backed by an explicit command, real backend execution, real result-artifact ingestion, final projection, and durable forensic evidence capture; semantic green and installed-package simulation remain required but insufficient.

## Context

The current TypeScript tenant is green for its declared semantic surface:

- `npm run test:semantic` passes
- `npm run test:t026` passes
- installed package-surface live and portfolio lanes pass

Those lanes prove carrier law, package exports, deterministic installed
execution, synthetic result artifacts, result assessment, projection, and
portfolio breadth. They do not prove that a real agentic worker was invoked
through the TypeScript transport contract.

For an RC, that distinction matters. RC live-green must demonstrate the
operational boundary that REQ-P-QUAL treats as gold-standard live F_P
qualification.

Python remains reference evidence, not a runtime dependency or proof authority
for the TypeScript RC. Any Python-tested behavior that still matters must be
carried forward as a reusable requirement/scenario obligation and then proved by
the TypeScript tenant itself, or explicitly repriced as not applicable to the
package-first TypeScript line.

## Migration Declaration

- old_truth_path: TypeScript RC readiness inferred from semantic green plus installed package-surface live proof
- new_truth_path: TypeScript RC readiness requires semantic green plus one explicit live qualification lane over real F_P transport execution and durable evidence capture
- producers_old: `npm run test:semantic`, `npm run test:t026`, `test_m05_sandbox_live_integration.test.mjs`, `test_m05_installed_live_portfolio_integration.test.mjs`
- producers_new: RC live design assets, TypeScript live transport runner or harness, live result-artifact ingestion, live-status projection, and durable RC evidence writer
- consumers_old: RC reviewers, release-cut gate, postmortem review, and TypeScript tenant closure claims
- consumers_new: RC reviewers, release-cut gate, postmortem review, and any downstream product relying on TypeScript tenant live qualification
- derived_surfaces:
  - TypeScript RC live command
  - TypeScript live qualification evidence archive
  - TypeScript test surface map
  - release/RC closure evidence
  - any ticket closure summary that claims `AGB.ts` is RC live-green
- closure_law: migration closes only when the old installed-simulation-only proof path is explicitly demoted from RC live authority and the new live lane is the named gate for RC live-green

## Migration Checklist

- [x] old truth path is named explicitly
- [x] new truth path is named explicitly
- [x] producer set for the new truth is listed
- [x] consumer set for the new truth is listed
- [x] projection/read-model surfaces are listed
- [x] old truth path is removed or explicitly demoted from RC live authority
- [x] mixed-state behavior is no longer accepted as closure evidence
- [x] tests proving mixed old/new behavior are removed or repriced
- [x] ticket wording, product wording, and proof claims are reconciled before closure

## Expected Build Output

- one TypeScript RC live qualification derivation or design addendum
- one explicit TypeScript RC live command in `package.json`
- one live harness that invokes a real configured F_P backend through the TypeScript transport contract
- one reusable requirement/scenario obligation shape independent of Python test
  mechanics
- one package materialization step that uses TypeScript package output rather
  than source-tree imports as the RC acceptance surface
- one result-artifact ingestion path fed by the real backend output
- one live-status projection from the real result path
- one persistent run evidence archive, following the Python-sandbox-derived
  archive/postmortem convention repriced by `T-030`, containing at minimum:
  - source commit and package/build identity
  - backend and worker identity
  - invoked command and environment sanitization policy
  - manifest or dispatch request
  - prompt or equivalent transport payload
  - raw stdout/stderr or transport response
  - result artifact
  - result assessment
  - final live-status projection
- updated `test_env/README.md` and `test_env/test_surface_map.md` explaining the difference between semantic, installed-surface, and RC live evidence

## Current Implementation State

The first RC live UAT lane has landed:

- `build_tenants/abiogenesis/typescript/design/M05_RC_LIVE_UAT_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/test_env/live/test_m05_rc_live_uat.test.mjs`
- `npm run test:live`
- packaged sandbox installation now materializes `npm pack` output into the
  sandbox package surface before the installed proof script imports
  `@abiogenesis/typescript-tenant`

The lane is opt-in and separate from `npm run test:semantic`.

Archive framework ownership:

- the archive/postmortem framework originates in the Python sandbox
  `run_archive.py` and `test_run_archive.py` line
- TypeScript archive-finalization parity is owned by completed `T-030`
- this ticket owns the RC live execution gate and durable evidence capture, not
  a new archive framework

Current verified behavior:

- without live enablement, `npm run test:live` skips instead of creating a false
  live-green claim
- with live enablement but an unavailable backend, `npm run test:live` skips
  with a diagnostic archive
- with live enablement and the configured `codex` backend available,
  `CODEX_LIVE_FP=1 npm run test:live` passes the RC live sandbox UAT lane

Closure evidence:

- semantic regression: `npm run test:semantic` passed `156/156`
- RC live command: `CODEX_LIVE_FP=1 npm run test:live` passed `1/1`
- live evidence archive:
  `build_tenants/abiogenesis/typescript/test_env/test_runs/typescript_rc_live/requirements_to_uat/2026-04-24T115931327Z`
- postmortem:
  `.ai-workspace/comments/codex/20260424T114419Z_POSTMORTEM_typescript-rc-live-uat.md`
- archived result:
  - backend: `backend://codex`
  - worker: `worker://rc-live-codex`
  - edge: `requirements→uat_tests`
  - fulfillment id: `uat_tests_complete`
  - event sequence:
    `basis_admitted -> fp_dispatch_requested -> assessed`
  - assessment outcome: `accepted`
  - live-status projection: `ready`, `assessed`

## Evaluation Criteria

- `npm run test:semantic` remains green.
- The new RC live command skips with a clear diagnostic when no configured backend is ready, and fails closed on malformed live output.
- At least one configured real F_P backend can complete the live lane through the TypeScript transport contract.
- The live result artifact is ingested through the TypeScript result-artifact boundary, not manually certified by the harness.
- The final projection is derived from admitted runtime/result truth.
- Evidence artifacts are written before any assertion can fail.

## Non-Closure Conditions

- Existing `live`-named deterministic tests are presented as sufficient RC live evidence.
- The live harness fabricates the result artifact instead of consuming real backend output.
- A backend readiness failure is reported as product failure without diagnostic separation.
- A malformed or missing result artifact is accepted because subprocess output exists.
- Evidence artifacts are temporary, overwritten, or unavailable after test cleanup.
- The RC command only tests source-tree imports and not an installed/package artifact or explicit RC build identity.

## Completion

This ticket completes only when:

- the design surface names RC live qualification separately from installed package-surface proof
- the authoritative RC live command exists
- real F_P transport execution is proven or explicitly skipped as environment-not-ready with REQ-P-QUAL diagnostics
- live result ingestion and projection are carrier-owned, and live evidence
  capture follows the Python-sandbox-derived archive/postmortem framework
  already repriced into TypeScript by `T-030`
- `test_surface_map.md` distinguishes semantic green, installed-surface green, and RC live-green without ambiguity
