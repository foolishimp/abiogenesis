# builds/claude_code — Design

Claude Code build — shipping design surface.

## ADRs

Current governing truth lives in:

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

New ADRs will be numbered from ADR-031 and implement REQ-L-GTL2-* / REQ-R-ABG2-* keys.

## Traceability

Traceability derives from the active 2.x requirement surface.
Live requirement headers carry `Status` and `Category` metadata per `specification/SPEC_METHOD.md`.
The shipping verification harness is downstream of this design surface in `builds/claude_code/test_env/`.

## Baseline Scenarios

The canonical toy scenarios for rebuilding and pressure-testing the engine are:

- [SCENARIO_V2_INTENT_TO_TAGGED_REQUIREMENTS.md](/Users/jim/src/apps/abiogenesis/builds/claude_code/design/SCENARIO_V2_INTENT_TO_TAGGED_REQUIREMENTS.md)
- [SCENARIO_V2_REQUIREMENTS_TO_UAT.md](/Users/jim/src/apps/abiogenesis/builds/claude_code/design/SCENARIO_V2_REQUIREMENTS_TO_UAT.md)
- [SCENARIO_V2_GSDLC_LITE_REQUIREMENTS_DESIGN_CODE.md](/Users/jim/src/apps/abiogenesis/builds/claude_code/design/SCENARIO_V2_GSDLC_LITE_REQUIREMENTS_DESIGN_CODE.md)
- [GSDLC_LITE_ABG_1_0_QUALIFICATION_LADDER.md](/Users/jim/src/apps/abiogenesis/builds/claude_code/design/GSDLC_LITE_ABG_1_0_QUALIFICATION_LADDER.md)

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
