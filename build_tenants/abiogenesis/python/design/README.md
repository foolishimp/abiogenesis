# build_tenants/abiogenesis/python — Design

Claude Code build — shipping design surface.

## ADRs

Current governing truth lives in:

- `build_tenants/common/design/design_surface_map.md` — current shared-vs-tenant design classification
- `build_tenants/common/design/module_decomp.md` — shared module schedule and ownership surface
- `specification/GTL_2_CONSTITUTIONAL_DESIGN.md` — language + engine boundary
- `specification/requirements/` — 4-layer requirement surface (gtl/abg/mapping/product)
- `GTL_2_MODULE_DESIGN.md` — module ownership and runtime/language split
- `GTL_2_INTERFACE_CONTRACTS.md` — concrete interfaces for tests and code derivation
- `GTL_2_IMPLEMENTATION_PLAN.md` — implementation target, rejected shapes, and delivery order

### Current ADRs

| ADR | Decision | Why it exists |
|-----|----------|----------------|
| ADR-022 | Subprocess transport with env sanitization | Shipping transport surface for F_P dispatch |
| ADR-023 | Graph and vector identity via opaque ids | Operational identity is distinct from labels |
| ADR-024 | Markov as a first-class node field | Node-owned declared conditions remain in the GTL surface |
| ADR-030 | Semantic Job/Role in GTL, ExecutableJob/Binding in ABG | Shipping work-model split for the Claude build |
| ADR-031 | Runtime identity and configured worker resolution | Keep engine/build/worker/backend provenance explicit and stop collapsing worker truth into a stale build default |

New ADRs will be numbered from ADR-032 and implement REQ-L-GTL2-* / REQ-R-ABG2-* keys.

## Traceability

Traceability derives from the active 2.x requirement surface.
Live requirement headers carry `Status` and `Category` metadata per `specification/SPEC_METHOD.md`.
The shipping verification harness is downstream of this design surface in `build_tenants/abiogenesis/python/test_env/`.

## App Bootstrap Assumption

`ABG 1.1` keeps a clean split between:

- one-step engine progression in `services.gen_start()`
- app-level auto orchestration in `genesis/cli_adapter.py`

That means `start --auto` is not a hidden engine mode. It is a CLI-owned loop that may:

- continue through repeated `fp_dispatch`
- proxy `fh_gate` approvals when `--human-proxy` is selected
- invoke optional runtime hooks exported by the installed module surface for project-specific `F_P` dispatch or `F_H` approval behavior

This keeps the engine core smaller and makes the app bootstrap seam explicit in module ownership.

## Runtime Identity Assumption

`ABG 1.1` no longer treats one build string as the whole runtime identity.

- `Worker` remains the concrete execution actor
- runtime identity may also declare engine, build, backend, and authority provenance
- `Scope` and `TraversalRuntime` preserve that structured identity
- CLI/runtime bootstrap resolves the configured `worker:` from the runtime contract instead of silently manufacturing one from a default build name

## Baseline Scenarios

The canonical toy scenarios for rebuilding and pressure-testing the engine are:

- [SCENARIO_V2_INTENT_TO_TAGGED_REQUIREMENTS.md](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/design/SCENARIO_V2_INTENT_TO_TAGGED_REQUIREMENTS.md)
- [SCENARIO_V2_REQUIREMENTS_TO_UAT.md](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/design/SCENARIO_V2_REQUIREMENTS_TO_UAT.md)
- [SCENARIO_V2_GSDLC_LITE_REQUIREMENTS_DESIGN_CODE.md](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/design/SCENARIO_V2_GSDLC_LITE_REQUIREMENTS_DESIGN_CODE.md)
- [GSDLC_LITE_ABG_1_0_QUALIFICATION_LADDER.md](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/design/GSDLC_LITE_ABG_1_0_QUALIFICATION_LADDER.md)

Together they define the current sandbox qualification ladder for:

- single-shot `intent -> requirements`
- single-shot `requirements -> uat_tests`
- chained `requirements -> design -> code`
- deterministic standards checking at each boundary
- fake-lane versus live-lane parity
- stepwise scenario growth without changing the underlying engine contract
- one explicit `ABG 1.0` sunny-day ladder for `gsdlc_lite`

## Postmortem Archive Direction

Persistent sandbox archives are part of the live qualification and scenario surface, not a disposable test convenience.

The old deleted scenario harness proved a useful archive shape:

- `test_runs/<usecase_id>/<timestamp_testname>/workspace`
- `run.json`
- `summary.json`
- `stdout.log`
- `stderr.log`
- `artifacts/`

The governing authority for restoring that behavior is now:

- [REQ-P-QUAL.md](/Users/jim/src/apps/abiogenesis/specification/requirements/product/REQ-P-QUAL.md)

Implementation should recover the durable postmortem properties of that archive shape without reviving unrelated legacy scenario helpers wholesale.
