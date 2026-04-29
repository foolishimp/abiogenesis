# build_tenants/abiogenesis/python - Design

Claude Code build - paused released-reference design surface.

TypeScript is the primary release line for the current abiogenesis cut. This
Python design root is retained as historical/reference evidence while the
Python tenant is paused.

## Governing Runtime Law

For the current Python line, the governing runtime design decisions are:

- [ADR-034](./adrs/ADR-034-runtime-execution-law-is-carrier-and-event-owned.md)
- [ADR-036](./adrs/ADR-036-abg-runtime-advancement-uses-execution-basis-and-advancement-transition.md)

Read that ADR first when judging:

- controller versus carrier ownership
- event truth versus controller-local reconstruction
- whether a seam is lawful delivery binding or an illicit semantic center
- whether `runtime_config` is acting as ingress or as rival runtime authority

Read ADR-036 when judging:

- the concrete upstream runtime carrier shape
- whether a refactor is introducing a typed carrier or another dict shim
- whether regime truth is readable from one carrier family
- whether config-backed operator/asset contracts are admitted once at the
  boundary and then carried as typed ingress, rather than re-read as raw
  config in the runtime core

This README is an index. ADR-034 is the primary runtime-law source for the
paused Python reference line.

## Design Index

Current governing truth lives in:

- `build_tenants/common/design/design_surface_map.md` — current shared-vs-tenant design classification
- `build_tenants/common/design/module_decomp.md` — shared module schedule and ownership surface
- `specification/INTENT.md` — current intent authority
- `specification/PRODUCT.md` — current product-definition authority
- `specification/requirements/gtl/` — GTL 3 language, graph, and publication law
- `specification/requirements/abg/` — ABG 3 runtime, event, projection, and traversal law
- `specification/requirements/mapping/` — GTL-to-ABG bridge law
- `specification/requirements/product/` — product-level qualification and policy law
- `specification/scenarios/` — GTL 3 / ABG 3 testcase authority and proving lanes
- `GTL_3_MODULE_DESIGN.md` — module ownership and runtime/language split
- `GTL_3_INTERFACE_CONTRACTS.md` — concrete interfaces for tests and code derivation
- `GTL_3_IMPLEMENTATION_PLAN.md` — implementation target, rejected shapes, and delivery order
- `ABG_3_MODULE_DESIGN.md` — ABG 3 engine design and runtime module impact
- `OPERATOR_ASSET_REGISTRY_AND_OWNERSHIP_SURFACE.md` — published operator asset-addressing contract over one governing callable boundary
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
| ADR-034 | Runtime execution law is carrier-and-event owned | Governs controller-versus-carrier ownership, event-first runtime truth, and demotes controller orchestration as runtime law |
| ADR-035 | Deterministic handling must not structurally block governed F_P | Governs deterministic-first but F_P-biased fallback law and prevents F_D helper structure from becoming an accidental hard stop |
| ADR-036 | Runtime advancement uses `ExecutionBasis` and `AdvancementTransition` | Names the upstream typed carrier family that replaces controller-owned runtime law during `B-027` |
| ADR-022 | Subprocess transport with env sanitization | Shipping transport surface for governed F_P dispatch |
| ADR-023 | Graph and vector identity via opaque ids | Operational identity is distinct from labels |
| ADR-024 | Markov as a first-class node field | Node-owned declared conditions remain in the GTL surface |
| ADR-030 | Semantic Job/Role in GTL, ExecutableJob/Binding in ABG | Governs GF-first public job entry and internal vector-based execution binding |
| ADR-031 | Runtime identity and configured worker resolution | Keeps engine/build/worker/backend provenance explicit and distinct from reporting metadata |
| ADR-032 | Cumulative environment graph functions and disjoint-write scheduling | Governs cumulative composition, public carrier publication, and conservative parallel batching |
| ADR-033 | Primary public `gen-start` execution-chain proof | Governs the proof categories for installed non-live public operator chain tests |

New ADRs will implement active `REQ-L-GTL3-*` and `REQ-R-ABG3-*` keys.

## Traceability

Traceability derives from the active GTL 3 / ABG 3 requirement surface plus the
live testcase-authority surfaces under `specification/scenarios/`.
Live requirement headers carry `Status` and `Category` metadata per [SPEC_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/SPEC_METHOD.md).
The paused reference verification harness is downstream of this design surface
in `build_tenants/abiogenesis/python/test_env/`.

## Delivery Binding Boundary

The Python build still has CLI/bootstrap/install delivery surfaces, but they do
not own runtime law.

Read [ADR-034](./adrs/ADR-034-runtime-execution-law-is-carrier-and-event-owned.md)
as the governing interpretation for:

- `genesis/cli_adapter.py`
- `app_bootstrap.py`
- `gen-install.py`
- temporary controller helpers in `genesis/services.py`

Those seams may normalize input, invoke the lawful runtime path, and present
projections. They are not allowed to become a rival semantic center for
advancement, admission, or closure.

## Runtime Identity Assumption

ABG treats runtime identity as a structured surface rather than collapsing it to one build string.

- `Worker` remains the concrete execution actor
- runtime identity may also declare engine, build, worker, backend, authority,
  assignment, and resolved-runtime provenance
- `Scope` and `TraversalRuntime` preserve that structured identity
- CLI/runtime bootstrap resolves the configured `worker:` from the runtime contract instead of silently manufacturing one from a default build name

## Baseline Scenarios

The canonical toy scenarios for rebuilding and pressure-testing the engine are:

- [SCENARIO_INTENT_TO_TAGGED_REQUIREMENTS.md](https://github.com/foolishimp/abiogenesis/blob/main/build_tenants/abiogenesis/python/design/SCENARIO_INTENT_TO_TAGGED_REQUIREMENTS.md)
- [SCENARIO_REQUIREMENTS_TO_UAT.md](https://github.com/foolishimp/abiogenesis/blob/main/build_tenants/abiogenesis/python/design/SCENARIO_REQUIREMENTS_TO_UAT.md)
- [SCENARIO_GSDLC_LITE_REQUIREMENTS_DESIGN_CODE.md](https://github.com/foolishimp/abiogenesis/blob/main/build_tenants/abiogenesis/python/design/SCENARIO_GSDLC_LITE_REQUIREMENTS_DESIGN_CODE.md)
- [GSDLC_LITE_QUALIFICATION_LADDER.md](https://github.com/foolishimp/abiogenesis/blob/main/build_tenants/abiogenesis/python/design/GSDLC_LITE_QUALIFICATION_LADDER.md)

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

- [REQ-P-QUAL.md](https://github.com/foolishimp/abiogenesis/blob/main/specification/requirements/product/REQ-P-QUAL.md)

Implementation should preserve the durable postmortem properties of that archive shape.
