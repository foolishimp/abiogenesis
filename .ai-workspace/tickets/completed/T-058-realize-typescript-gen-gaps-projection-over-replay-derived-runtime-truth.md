# T-058 Realize TypeScript Gen-Gaps Projection Over Replay-Derived Runtime Truth

- id: T-058
- title: Realize TypeScript gen-gaps projection over replay-derived runtime truth
- type: feature
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- build_tenant: typescript
- goal: typescript-rc-authority-closure
- change_intent: replace the TypeScript CLI `gaps` fail-closed placeholder with a real `gen-gaps` observation projection that reaches Python command behavior parity through TypeScript-owned M03/M04 replay truth
- change_class: design_reframe
- re_entry_point: typescript_m04_public_gaps_projection
- triaged_at: 2026-04-25
- priority: high
- created_at: 2026-04-25
- updated_at: 2026-04-25
- completed_at: 2026-04-25
- dependencies:
  - REQ-P-POLICY-008 active
  - REQ-P-POLICY-016 active
  - REQ-P-POLICY-017 active
  - T-041 completed
  - T-044 completed
  - T-046 completed
  - T-051 completed
  - T-057 completed
- intake_source: operator asked whether TypeScript is at Python parity after T-057; identified `gaps` as the remaining explicit CLI behavior gap
- affected_boundary: `build_tenants/abiogenesis/typescript/code/src/app/m04/**`, `build_tenants/abiogenesis/typescript/code/src/cli/command.ts`, `build_tenants/abiogenesis/typescript/design/**`, `build_tenants/abiogenesis/typescript/test_env/**`, `docs/`
- library_usage: extend
- governing_library: `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/**`, `build_tenants/abiogenesis/typescript/code/src/app/m04/**`
- target_truth: TypeScript `gen-gaps` projects current workspace observation from admitted module scope, replayed runtime events, canonical dispatch/human/terminal transition truth, and semantic job/vector closure state without re-entering execution or importing downstream presentation labels
- superseded_truth: TypeScript `gaps --workspace . --scope workspace` accepts the shared command suffix but returns a fail-closed unsupported-placeholder error
- closure_law: close only when the TypeScript binary returns a real `gaps` JSON projection for installed runtime workspaces and no longer treats `gaps` as unsupported
- evaluation_criteria:
  - design surface exists for the TypeScript public gaps projection and names its M03/M04 authority inputs
  - `gaps --workspace . --scope workspace` loads the same app-owned runtime binding used by `start`
  - projection is read-only and does not emit or append runtime events
  - projection derives open/closed vector state from replayed runtime events and admitted module graph-function/job truth
  - projection reports convergence/no-work, open work, dispatch/human blockers, and next lawful action in a stable public JSON shape
  - projection does not reintroduce product-specific labels such as `proof_hold` as TypeScript `M04` substrate taxonomy
  - output grammar and exit classification align with the shared product command contract
  - installed-package tests prove `genesis-ts gaps --workspace . --scope workspace` on open, partially closed, converged, and fail-closed replay states
  - the T-057 `gaps` fail-closed assertion is replaced with behavior parity proof
- non_closure_conditions:
  - `gaps` remains a placeholder or delegates to Python
  - projection depends on controller-local mutable state instead of replay/event/module truth
  - command-line flags differ from the shared product grammar
  - tests prove source imports only and do not prove installed binary behavior
  - projection mutates event logs or starts traversal work

## Acceptance

- TypeScript gaps design/review surface exists and traces to active product requirements
- installed-package gaps tests pass
- T-057 CLI test expectations are updated from fail-closed placeholder to real projection behavior
- relevant M03/M04 projection tests pass
- docs describe TypeScript `gaps` as supported rather than fail-closed
- `git diff --check` passes

## Closure Evidence

Completed on 2026-04-25.

- Added `M04` public gaps carriers, admission, constructors, and projection.
- Bound the TypeScript CLI `gaps` command to `publicGaps` instead of the fail-closed placeholder.
- Kept `gaps` read-only: it loads replay events but does not append or emit runtime events.
- Projected per-job vector delta, next edge, evaluator obligations, stop predicate, and next lawful action from `M03` execution basis plus replay projection.
- Added package export coverage for `@abiogenesis/typescript-tenant/app/m04/gaps`.
- Added design assets:
  - `M04_PUBLIC_GAPS_PROJECTION_DERIVATION.md`
  - `M04_PUBLIC_GAPS_PROJECTION_FIRST_SLICE_IACS.md`
  - `M04_PUBLIC_GAPS_PROJECTION_STRUCTURAL_CARRIER_DIAGRAM.md`
- Updated docs to describe supported TypeScript `gaps` output.
- Updated T-057 CLI proof from fail-closed placeholder behavior to real projection behavior.
- Proof: `npm run test:t058`, `npm run test:t057`, `git diff --check`.
