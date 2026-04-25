# T-036 Port Python archived sandbox behavior portfolio to TypeScript installed package lane

- id: T-036
- title: Port Python archived sandbox behavior portfolio to TypeScript installed package lane
- type: feature
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- goal: typescript-tenant-rc-behavior-qualification
- change_intent: Represent and execute the full Python archived sandbox scenario corpus as an explicit TypeScript installed-package behavior portfolio.
- change_class: design_reframe
- re_entry_point: design_surface
- triaged_at: 2026-04-24
- created_at: 2026-04-24
- updated_at: 2026-04-24
- completed_at: 2026-04-24
- priority: high
- build_tenant: abiogenesis/typescript
- dependencies:
  - T-030 completed
  - T-031 completed
  - T-032 completed
  - T-033 completed
- intake_source: review found that TypeScript had the five Python live scenario families and one real RC live edge, but not the full 34-scenario archived sandbox behavior portfolio as a cumulative TypeScript lane.
- affected_boundary: `build_tenants/abiogenesis/typescript/design/**`, `build_tenants/abiogenesis/typescript/code/src/qualification/m05/**`, and `build_tenants/abiogenesis/typescript/test_env/**`
- authoritative_contract: the Python sandbox scenario corpus must be carried into TypeScript as reusable scenario obligations and executed through the installed package surface. This is a harnessed cumulative sandbox behavior portfolio, not a claim that all five Python live scenarios have now run against real external F_P workers in TypeScript.
- governing_design:
  - `build_tenants/abiogenesis/typescript/design/M05_PYTHON_SANDBOX_BEHAVIOR_PORTFOLIO_DERIVATION.md`
  - `build_tenants/abiogenesis/typescript/design/M05_PYTHON_SANDBOX_PROOF_EQUIVALENCE_AUDIT.md`
  - `build_tenants/abiogenesis/typescript/design/M05_ARCHIVE_FINALIZATION_DERIVATION.md`
  - `build_tenants/abiogenesis/typescript/design/M05_RC_LIVE_UAT_DERIVATION.md`
  - `specification/requirements/product/REQ-P-QUAL.md`
  - `specification/requirements/product/REQ-P-SCENARIOS.md`
- proof_surface:
  - `npm run test:t036`
  - `npm run test:semantic`
- target_truth: TypeScript has an explicit 34-scenario installed-package sandbox behavior portfolio derived from the Python archived sandbox corpus.
- superseded_truth: TypeScript behavior parity could be inferred from the five-scenario installed live portfolio plus selected translated tests.
- closure_law: this ticket closes only when all 34 Python archived sandbox behavior scenarios are represented, executed through the installed TypeScript package surface, qualified as a complete portfolio, and reported with lane counts.

## Scenario Corpus

The ported corpus contains:

- 15 install/runtime sandbox scenarios
- 14 fake or harnessed sandbox scenarios
- 5 Python live scenario obligations represented as installed behavior
  scenarios
- 34 scenario obligations total

`test_run_archive.py` remains archive framework proof under `T-030`, not a
product behavior scenario.

## Build Output

- `M05_PYTHON_SANDBOX_BEHAVIOR_PORTFOLIO_DERIVATION.md`
- `sandbox_behavior_portfolio_carriers.ts`
- `sandbox_behavior_portfolio_constructors.ts`
- `sandbox_behavior_portfolio.ts`
- `test_m05_python_sandbox_behavior_portfolio_integration.test.mjs`
- `npm run test:t036`
- post-run report under `.ai-workspace/comments/codex/`

## Closure Evidence

- `npm run test:t036` passed `1/1`.
- `npm run test:semantic` passed `157/157`.
- Portfolio report:
  `build_tenants/abiogenesis/typescript/test_env/test_runs/typescript_sandbox_behavior_portfolio/2026-04-24T123235680Z/portfolio_report.json`
- The TypeScript installed package lane executed 34/34 ported scenario
  obligations.
- Qualified lane counts:
  - install: 15
  - fake: 14
  - live-lineage obligations: 5
- Every scenario emitted:
  `basis_admitted -> fp_dispatch_requested -> assessed`.

## Non-Claim

This ticket does not claim five external-live TypeScript runs. External-live
proof remains owned by the RC live lane from `T-033`.
