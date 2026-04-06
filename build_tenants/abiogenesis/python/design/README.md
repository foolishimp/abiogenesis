# build_tenants/abiogenesis/python — Design

Claude Code build — shipping design surface.

## ADRs

Current governing truth lives in:

- `build_tenants/common/design/design_surface_map.md` — current shared-vs-tenant design classification
- `build_tenants/common/design/module_decomp.md` — shared module schedule and ownership surface
- `specification/GTL_3_CONSTITUTIONAL_DESIGN.md` — GTL 3 language + engine boundary
- `specification/ABG_3_CONSTITUTIONAL_DESIGN.md` — ABG 3 runtime ontology, event law, and GTL/ABG boundary
- `specification/requirements/` — 4-layer requirement surface (gtl/abg/mapping/product)
- `specification/scenarios/` — GTL 3 / ABG 3 testcase authority and proving lanes
- `GTL_3_MODULE_DESIGN.md` — module ownership and runtime/language split
- `GTL_3_INTERFACE_CONTRACTS.md` — concrete interfaces for tests and code derivation
- `GTL_3_IMPLEMENTATION_PLAN.md` — implementation target, rejected shapes, and delivery order
- `ABG_3_MODULE_DESIGN.md` — ABG 3 engine design and runtime module impact
- `GTL_ABG_LLM_GUIDE_DOMAIN_WORKFLOWS.md` — agent-facing guide for authoring domain workflows like GSDLC

For the current line, published `GraphFunction` surfaces, canonical graph-function materialization, graph-derived companion bundles, recursive invocation frames, and their provenance are explicit design responsibilities rather than deferred or hidden inside traversal helpers.

## Functional Design Stance

The implementation target is Python with Scala-style discipline:

- immutable value types for prime GTL and ABG kernel surfaces
- functional core, explicit-effect shell
- symbolic publication and replayable materialization rather than ambient closures
- graph functions operate over explicit immutable cumulative environment contracts rather than immediate output piping
- explicit lineage and provenance on every zoom/materialize/fold-back step
- recursive refinement as invocation-local frame execution over stable outer contracts
- algebraic substitution reserved for graph/projection/export truth, not default runtime module mutation

If a proposed implementation shape would feel natural only in a mutable service object, it is probably the wrong shape for this line.

### Current ADRs

| ADR | Decision | Why it exists |
|-----|----------|----------------|
| ADR-022 | Subprocess transport with env sanitization | Shipping transport surface for governed F_P dispatch |
| ADR-023 | Graph and vector identity via opaque ids | Operational identity is distinct from labels |
| ADR-024 | Markov as a first-class node field | Node-owned declared conditions remain in the GTL surface |
| ADR-030 | Semantic Job/Role in GTL, ExecutableJob/Binding in ABG | Governs GF-first public job entry and internal vector-based execution binding |
| ADR-031 | Runtime identity and configured worker resolution | Keeps engine/build/worker/backend provenance explicit and distinct from reporting metadata |
| ADR-032 | Cumulative environment graph functions and disjoint-write scheduling | Governs cumulative composition, public carrier publication, and conservative parallel batching |

New ADRs will implement active `REQ-L-GTL3-*` and `REQ-R-ABG3-*` keys.

## Traceability

Traceability derives from the active GTL 3 / ABG 3 requirement surface plus the
live testcase-authority surfaces under `specification/scenarios/`.
Live requirement headers carry `Status` and `Category` metadata per [/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md).
The shipping verification harness is downstream of this design surface in `build_tenants/abiogenesis/python/test_env/`.

## App Bootstrap Assumption

ABG keeps a clean split between:

- one-step engine progression in `services.gen_start()`
- app-level auto orchestration in `genesis/cli_adapter.py`

That means `start --auto` is not a hidden engine mode. It is a CLI-owned loop that may:

- continue through repeated `fp_dispatch`
- proxy `fh_gate` approvals when `--human-proxy` is selected
- invoke optional runtime hooks exported by the installed module surface for project-specific `F_P` dispatch or `F_H` approval behavior

This keeps the engine core smaller and makes the app bootstrap seam explicit in module ownership.

## Runtime Identity Assumption

ABG treats runtime identity as a structured surface rather than collapsing it to one build string.

- `Worker` remains the concrete execution actor
- runtime identity may also declare engine, build, worker, backend, authority,
  assignment, and resolved-runtime provenance
- `Scope` and `TraversalRuntime` preserve that structured identity
- CLI/runtime bootstrap resolves the configured `worker:` from the runtime contract instead of silently manufacturing one from a default build name

## Baseline Scenarios

The canonical toy scenarios for rebuilding and pressure-testing the engine are:

- [SCENARIO_INTENT_TO_TAGGED_REQUIREMENTS.md](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/design/SCENARIO_INTENT_TO_TAGGED_REQUIREMENTS.md)
- [SCENARIO_REQUIREMENTS_TO_UAT.md](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/design/SCENARIO_REQUIREMENTS_TO_UAT.md)
- [SCENARIO_GSDLC_LITE_REQUIREMENTS_DESIGN_CODE.md](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/design/SCENARIO_GSDLC_LITE_REQUIREMENTS_DESIGN_CODE.md)
- [GSDLC_LITE_QUALIFICATION_LADDER.md](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/design/GSDLC_LITE_QUALIFICATION_LADDER.md)

Together they define the current sandbox qualification ladder for:

- single-shot `intent -> requirements`
- single-shot `requirements -> uat_tests`
- chained `requirements -> design -> code`
- deterministic standards checking at each boundary
- fake-lane versus live-lane parity
- stepwise scenario growth without changing the underlying engine contract
- one explicit sunny-day ladder for `gsdlc_lite`

## Postmortem Archive Direction

Persistent sandbox archives are part of the live qualification and scenario surface, not a disposable test convenience.

The archive shape is:

- `test_runs/<usecase_id>/<timestamp_testname>/workspace`
- `run.json`
- `summary.json`
- `stdout.log`
- `stderr.log`
- `artifacts/`

The governing authority for restoring that behavior is now:

- [REQ-P-QUAL.md](/Users/jim/src/apps/abiogenesis/specification/requirements/product/REQ-P-QUAL.md)

Implementation should preserve the durable postmortem properties of that archive shape.
