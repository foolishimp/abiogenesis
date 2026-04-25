# T-037 Port Python live scenario portfolio to TypeScript RC external-live lane

- id: T-037
- title: Port Python live scenario portfolio to TypeScript RC external-live lane
- type: feature
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- goal: typescript-tenant-rc-live-portfolio-qualification
- change_intent: Extend the TypeScript RC live qualification command from one external-live edge to the full five-scenario Python live portfolio.
- change_class: design_reframe
- re_entry_point: design_surface
- triaged_at: 2026-04-24
- created_at: 2026-04-24
- updated_at: 2026-04-25
- completed_at: 2026-04-24
- priority: high
- build_tenant: abiogenesis/typescript
- dependencies:
  - T-031 completed
  - T-033 completed
  - T-036 completed
- intake_source: user request to port all Python live tests after RC review showed TypeScript had only one external-live edge despite carrying the five-family portfolio in harnessed installed-package form.
- affected_boundary: `build_tenants/abiogenesis/typescript/design/**`, `build_tenants/abiogenesis/typescript/test_env/live/**`, `build_tenants/abiogenesis/typescript/test_env/test_surface_map.md`, and RC live evidence archives
- authoritative_contract: the TypeScript RC live command must execute all five Python live scenario families through the installed TypeScript package surface and a real configured F_P transport, then ingest each returned result artifact through TypeScript result assessment and projection. This ports the scenario-family and stage-breadth obligations; it does not reinstate Python's file-mutating sandbox harness mechanics as TypeScript product law.
- governing_design:
  - `build_tenants/abiogenesis/typescript/design/M05_RC_LIVE_PORTFOLIO_DERIVATION.md`
  - `build_tenants/abiogenesis/typescript/design/M05_RC_LIVE_UAT_DERIVATION.md`
  - `build_tenants/abiogenesis/typescript/design/M05_INSTALLED_LIVE_PORTFOLIO_DERIVATION.md`
  - `build_tenants/abiogenesis/typescript/design/M05_INSTALLED_LIVE_PORTFOLIO_FIRST_SLICE_IACS.md`
  - `build_tenants/abiogenesis/typescript/design/M05_INSTALLED_LIVE_PORTFOLIO_STRUCTURAL_CARRIER_DIAGRAM.md`
  - `build_tenants/abiogenesis/typescript/design/M05_PYTHON_SANDBOX_PROOF_EQUIVALENCE_AUDIT.md`
  - `specification/requirements/product/REQ-P-QUAL.md`
  - `specification/requirements/product/REQ-P-SCENARIOS.md`
- proof_surface:
  - `npm run test:semantic`
  - `CODEX_LIVE_FP=1 npm run test:live`
- target_truth: TypeScript RC live-green now covers the five Python live scenario families through twelve real external F_P stage dispatches.
- superseded_truth: TypeScript RC live-green covered only the single `requirements_to_uat` external-live edge, with the remaining Python live families covered only by harnessed installed-package evidence.
- closure_law: this ticket closes only when the live portfolio command passes against a configured real backend and writes durable per-stage archive evidence.
- design_method_boundary: `T-037` adds an RC external-live proof lane over the existing `M05` installed live-portfolio module boundary. It does not introduce a new typed module boundary. The active IACS and structural carrier diagram are the installed live-portfolio assets listed above.
- live_gate_law: `npm run test:live` is a required RC live gate. Missing live environment or backend readiness is a failure, not a skip.
- scenario_truth_source: exact scenario, stage, edge, asset-handle, and assessment-id truth is carried by `M05_REFERENCE_LIVE_SCENARIO_OBLIGATIONS`.

## Scenario Portfolio

The ported external-live portfolio contains:

- `requirements_to_uat`: one asset-addressed stage
- `intent_to_requirements`: one graph-function stage
- `gsdlc_lite_requirements_design_code`: two staged-chain stages
- `gsdlc_lite_design_review`: three review-chain stages
- `gsdlc_lite_zoom_design`: five zoom-chain stages

Total external-live stage count: `12`.

## Build Output

- `M05_RC_LIVE_PORTFOLIO_DERIVATION.md`
- `test_env/live/test_m05_rc_live_portfolio.test.mjs`
- `npm run test:live` now runs the portfolio
- `npm run test:live:uat` preserves the previous single-edge UAT lane
- installed and external-live portfolio lanes now consume the same exported
  scenario obligation catalog
- updated test-surface documentation and RC live report

## Design-Method Review Result

The 2026-04-25 review found three cleanup defects before this ticket could make
a strict design-method closure claim:

- `npm run test:live` could skip without real live execution
- scenario/stage truth was duplicated between installed and RC live lanes
- this ticket did not explicitly bind itself to the active `M05` IACS and
  structural carrier diagram

The cleanup outcome is:

- `npm run test:live` now fails when the live environment or backend readiness is
  unavailable
- `M05_REFERENCE_LIVE_SCENARIO_OBLIGATIONS` is the single scenario/stage truth
  surface for the installed and external-live portfolio lanes
- the existing installed live-portfolio IACS and structural carrier diagram now
  include the reference-obligation and stage-result carrier truth consumed by
  this RC lane
- docs now state that `T-037` proves TypeScript result-artifact boundary
  external-live parity, not Python file-mutating sandbox harness parity

## Closure Evidence

- `npm run test:semantic` passed `158/158`.
- `CODEX_LIVE_FP=1 npm run test:live` passed `1/1`.
- Live run duration: `179,526.780083 ms`.
- Live archive:
  `build_tenants/abiogenesis/typescript/test_env/test_runs/typescript_rc_live_portfolio/2026-04-24T143741462Z`
- Portfolio report:
  `build_tenants/abiogenesis/typescript/test_env/test_runs/typescript_rc_live_portfolio/2026-04-24T143741462Z/portfolio_report.json`
- Backend: `backend://codex`
- Worker: `worker://rc-live-codex`
- Scenarios passed: `5/5`
- Stages passed: `12/12`
- Assessment events accepted: `14`
- Evidence files in archive: `124`

## Non-Claim

This ticket does not claim a file-for-file clone of Python's sandbox harness.
It claims the current TypeScript RC external-live product boundary: installed
package, governed dispatch, real worker result artifact, result assessment,
projection, and durable evidence for every Python live scenario family.
