# Migrated TypeScript Design Source Audit

**Status**: Active
**Date**: 2026-04-24
**Purpose**: Audit the TypeScript design and ADR assets migrated through
`T-014` against the released Python reference line so later derivation and
implementation waves can start from one explicit source-reconciliation
baseline.

## 1. Scope

This audit covers the TypeScript tenant design and ADR assets landed through:

- `T-009`
- `T-010`
- `T-011`
- `T-012`
- `T-013`
- `T-014`

It does not audit later implementation waves because none are open yet.

## 2. Classification Legend

- `covered`: the Python source is already carried into one or more current
  TypeScript design assets
- `tenant_local_new`: the TypeScript asset is a target-only design surface and
  is not expected to exist one-for-one in Python
- `shared_binding`: the TypeScript asset binds shared module law plus Python
  reference evidence to the tenant
- `future_follow_up`: the Python source matters but is not yet migrated and
  needs an explicit later ticket
- `repriced`: the Python source is intentionally not carried one-for-one
  because the TypeScript line chose a different lawful realization
- `redundant`: the Python source is historical or explanatory for the released
  line but not needed as active authority for the TypeScript line

## 3. TypeScript Asset To Source Matrix

| TypeScript asset | Source inputs | Classification |
| --- | --- | --- |
| `PYTHON_TO_TYPESCRIPT_DESIGN_DERIVATION.md` | `python/design/README.md`, `python/design/GTL_3_MODULE_DESIGN.md`, `python/design/ABG_3_MODULE_DESIGN.md`, `ADR-033`, `ADR-034`, `ADR-035`, `ADR-036`, shared `module_decomp.md`, shared `M04-app-bootstrap.yml` | `shared_binding` |
| `TYPESCRIPT_REALIZATION_GUARDRAILS.md` | shared method, completed precedent, tenant-local lessons from `T-009` to `T-014` | `tenant_local_new` |
| `TYPESCRIPT_STRICT_LANE.md` | Python strict-line intent plus TypeScript compiler/lint realization | `repriced` |
| `GTL_3_MODULE_DESIGN.md` | `python/design/GTL_3_MODULE_DESIGN.md`, `python/design/GTL_3_INTERFACE_CONTRACTS.md` | `covered` |
| `GTL_3_FIRST_SLICE_IACS.md` | `python/design/GTL_3_MODULE_DESIGN.md`, `python/design/GTL_3_INTERFACE_CONTRACTS.md` | `tenant_local_new` |
| `GTL_3_INTERFACE_CONTRACTS.md` | `python/design/GTL_3_INTERFACE_CONTRACTS.md`, `ADR-024`, `ADR-032` | `covered` |
| `GTL_3_M02_WORK_PUBLICATION_IACS.md` | `python/design/GTL_3_MODULE_DESIGN.md`, `ADR-030`, `python/code/genesis/binding.py` | `tenant_local_new` |
| `GTL_3_STRUCTURAL_CARRIER_DIAGRAM.md` | GTL Python design plus TypeScript IACS surfaces | `tenant_local_new` |
| `GTL_3_IMPLEMENTATION_PLAN.md` | tenant-local TypeScript sequencing over GTL Python reference | `repriced` |
| `ABG_3_MODULE_DESIGN.md` | `python/design/ABG_3_MODULE_DESIGN.md`, `ADR-034`, `ADR-035`, `ADR-036`, shared `M04-app-bootstrap.yml` | `covered` |
| `ABG_3_FIRST_SLICE_IACS.md` | `python/design/ABG_3_MODULE_DESIGN.md`, `ADR-034`, `ADR-036` | `tenant_local_new` |
| `ABG_3_M03_STRUCTURAL_CARRIER_DIAGRAM.md` | Python ABG runtime design and TypeScript `M03` IACS | `tenant_local_new` |
| `M04_PUBLIC_START_DERIVATION.md` | `ADR-031`, `ADR-033`, `python/code/genesis/cli_adapter.py`, shared `M04-app-bootstrap.yml` | `covered` |
| `M04_FIRST_SLICE_IACS.md` | `ADR-031`, `ADR-033`, `python/code/genesis/cli_adapter.py` | `tenant_local_new` |
| `M04_PUBLIC_START_STRUCTURAL_CARRIER_DIAGRAM.md` | Python public-start evidence and TypeScript `M04` IACS | `tenant_local_new` |
| `M04_CONTROL_LOOP_DERIVATION.md` | `python/code/genesis/cli_adapter.py`, `python/design/ABG_3_MODULE_DESIGN.md`, shared `M04-app-bootstrap.yml` | `covered` |
| `M04_CONTROL_LOOP_FIRST_SLICE_IACS.md` | Python control-loop reference evidence and completed `T-012` public-start law | `tenant_local_new` |
| `M04_CONTROL_LOOP_STRUCTURAL_CARRIER_DIAGRAM.md` | Python control-loop reference evidence and TypeScript `M04` control IACS | `tenant_local_new` |
| `M02_M03_LOOKUP_AUTHORITY_DERIVATION.md` | `ADR-030`, `python/code/genesis/binding.py`, `python/design/ABG_3_MODULE_DESIGN.md` | `covered` |
| `M02_M03_LOOKUP_AUTHORITY_IACS.md` | `ADR-030`, `python/code/genesis/binding.py` | `tenant_local_new` |
| `M02_M03_LOOKUP_AUTHORITY_STRUCTURAL_CARRIER_DIAGRAM.md` | Python binding/runtime evidence and TypeScript lookup IACS | `tenant_local_new` |
| `ADR-040` | package-first TypeScript tenant stance over Python release reality | `tenant_local_new` |
| `ADR-041` | `ADR-034` | `covered` |
| `ADR-042` | `ADR-035` | `covered` |
| `ADR-043` | `ADR-036` | `covered` |

## 4. Python Source Coverage Table

| Python source asset | Current status | Notes |
| --- | --- | --- |
| `python/design/README.md` | `covered` | reflected in tenant design root and derivation order |
| `python/design/GTL_3_MODULE_DESIGN.md` | `covered` | carried into GTL module design and first-slice GTL assets |
| `python/design/GTL_3_IMPLEMENTATION_PLAN.md` | `repriced` | TypeScript implementation sequencing is tenant-local and not a direct carry-across |
| `python/design/GTL_3_INTERFACE_CONTRACTS.md` | `covered` | carried into TypeScript GTL contract law |
| `python/design/ABG_3_MODULE_DESIGN.md` | `covered` | carried into ABG module design and later `M04` derivation |
| `python/design/OPERATOR_ASSET_REGISTRY_AND_OWNERSHIP_SURFACE.md` | `future_follow_up` | no current TS module wave; follow-up required in `T-025` |
| `python/design/GTL_ABG_LLM_GUIDE_DOMAIN_WORKFLOWS.md` | `redundant` | explanatory/domain workflow guidance, not needed as active design authority for current migrated TS assets |
| `python/design/GSDLC_LITE_QUALIFICATION_LADDER.md` | `future_follow_up` | deferred into `T-021` / `T-022` |
| `python/design/SCENARIO_INTENT_TO_TAGGED_REQUIREMENTS.md` | `future_follow_up` | deferred into `T-021` / `T-022` |
| `python/design/SCENARIO_REQUIREMENTS_TO_UAT.md` | `future_follow_up` | deferred into `T-021` / `T-022` |
| `python/design/SCENARIO_GSDLC_LITE_REQUIREMENTS_DESIGN_CODE.md` | `future_follow_up` | deferred into `T-021` / `T-022` |
| `ADR-022-subprocess-transport-with-env-sanitization.md` | `future_follow_up` | no current explicit TS late-`M03` transport wave; follow-up required in `T-026` |
| `ADR-023-graph-identity-uuid.md` | `repriced` | TypeScript line intentionally uses deterministic content-derived ids instead of Python UUID law |
| `ADR-024-markov-first-class-node-field.md` | `covered` | carried into TypeScript GTL node/interface law |
| `ADR-030-job-role-worker-run-binding.md` | `covered` | carried into `M02` publication and `M02 -> M03` lookup authority design |
| `ADR-031-runtime-identity-and-configured-worker.md` | `covered` | carried into `M04` public-start design |
| `ADR-032-cumulative-environment-and-disjoint-write-scheduling.md` | `covered` | reflected in TypeScript GTL algebra/environment law |
| `ADR-033-primary-public-gen-start-execution-chain-proof.md` | `covered` | carried into `M04` public-start derivation |
| `ADR-034-runtime-execution-law-is-carrier-and-event-owned.md` | `covered` | carried into TypeScript ADR-041 and ABG runtime design |
| `ADR-035-deterministic-handling-must-not-structurally-block-governed-fp.md` | `covered` | carried into TypeScript ADR-042 |
| `ADR-036-abg-runtime-advancement-uses-execution-basis-and-advancement-transition.md` | `covered` | carried into TypeScript ADR-043 |
| `python/code/genesis/binding.py` | `covered` | used by lookup-authority derivation; later asset-targeting follow-up remains in `T-025` |
| `python/code/genesis/cli_adapter.py` | `covered` | used by `M04` public-start/control derivation |
| `python/code/genesis/transport.py` | `future_follow_up` | late `M03` transport protocol still missing; tracked in `T-026` |
| `python/code/genesis/result_ingest.py` | `future_follow_up` | result-assessment/transport protocol still missing; tracked in `T-017` and `T-026` |
| `python/code/genesis/live_status.py` | `future_follow_up` | future live-status projection in `T-018` |
| `python/code/gen-install.py` | `future_follow_up` | future install/bootstrap in `T-019` |
| `python/code/gtl_spec/GTL_BOOTLOADER.md` | `future_follow_up` | future bootloader work in `T-020` |
| `python/test_env/test_surface_map.md` | `future_follow_up` | future `M05` qualification/test-surface expansion in `T-021` / `T-022` |

## 5. Audit Outcome

The migrated TypeScript design line through `T-014` is broadly traceable to the
released Python reference line. Two still-relevant source families were not yet
explicitly represented in the backlog before this audit:

- public operator asset-addressing and asset registry ownership
- governed transport and result-artifact protocol

Those are now explicit future follow-up families and should not be treated as
silent omissions.

## 6. Required Follow-Up

- `T-025` for public asset-addressing through a published operator asset
  registry
- `T-026` for late `M03` governed transport and result-artifact protocol
- `T-021` / `T-022` remain the qualification/scenario follow-up path

## 7. Baseline Consequence

Later TypeScript derivation and implementation waves should use this audit as
the baseline source-reconciliation surface.

If a later wave cites Python reference evidence not classified here, it should:

1. extend this audit, or
2. create a smaller audit addendum inside the owning ticket before code opens
