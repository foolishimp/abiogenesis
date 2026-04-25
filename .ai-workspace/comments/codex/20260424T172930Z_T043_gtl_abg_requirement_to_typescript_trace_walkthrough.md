# T-043 GTL/ABG Requirement To TypeScript Trace Walkthrough

**Status**: Completed walkthrough
**Ticket**: `T-043-walk-through-gtl-abg-requirement-to-typescript-design-module-code-test-trace`
**Date**: 2026-04-25

## Executive Result

No missing constitutional GTL/ABG requirement was found.

The live requirement layer already contains the law needed for the current
TypeScript RC blockers:

- graph functions are the reusable GTL program abstraction
- public `start` is an ignition/resume boundary, not the internal iterate
  engine
- ABG must plan and advance internal graph vectors from replay-derived
  graph-call/frame/vector/evaluation/proof/closure truth
- retry/repair must mint fresh runtime truth over current prompt and manifest
  state
- leaf tasks are bounded subordinate runtime work, not a rival workflow
  ontology

The remaining gaps are downstream realization gaps:

- `T-041`: TypeScript `M03` design for replay-derived graph-function
  iteration, GraphCall/Frame lifecycle, next-edge planning, and aggregate
  projection
- `T-042`: TypeScript/common `M03` design for generic retry/repair and
  bounded leaf-task governance
- `T-035`: TypeScript `M03`/`M04` runtime/capability/failure taxonomy split
- `B-030-TS`: TypeScript `M04` complete callable `start` surface and stop
  taxonomy over canonical public-control truth

## Walkthrough Path

The admitted authority graph is:

1. `specification/requirements/gtl/REQ-L-GTL3-*.md`
2. `specification/requirements/abg/REQ-R-ABG3-*.md`
3. `specification/scenarios/TESTCASE_AUTHORITY.md`
4. scenario bundle files under `specification/scenarios/`
5. `build_tenants/common/design/module_decomp.md`
6. module specs under `build_tenants/common/design/modules/`
7. tenant design under `build_tenants/abiogenesis/typescript/design/`
8. tenant code under `build_tenants/abiogenesis/typescript/code/`
9. tenant tests under `build_tenants/abiogenesis/typescript/test_env/`
10. successor tickets for any missing link

## Scenario To TypeScript Test Mapping

| Scenario bundle | Requirement families | Current TypeScript proof | Walkthrough result |
| --- | --- | --- | --- |
| `01-language-primitives-and-traversal.md` | `REQ-L-GTL3-LANGUAGE`, `ATTRS`, `CONTEXT`, `GRAPH`, `NODE`, `GRAPHVECTOR`, `INTERFACE`, `IDENTITY` | `test_m01_gtl_core_integration.test.mjs`, `t009-m01-roundtrip.test.mjs`, `t009-m01-negative-ingress.test.mjs` | Covered by `M01-gtl-core` design/code/tests. |
| `02-governed-transition-surfaces.md` | `REQ-L-GTL3-OPERATOR`, `EVALUATOR`, `RULE`, `HOOKS`, `SUBWORK` | `test_m01_gtl_core_integration.test.mjs`, `t009-m01-negative-ingress.test.mjs` | GTL declaration law covered. ABG leaf-task realization remains `T-042`, not a missing GTL requirement. |
| `03-graph-function-algebra.md` | `REQ-L-GTL3-GRAPHFUNCTION`, `COMPOSE`, `SUBSTITUTE`, `RECURSE`, `HOF`, `LAWS`, `SELECTION-BOUNDARY`, `SYNTHESIS` | `test_m01_gtl_core_integration.test.mjs`, `test_m05_three_stage_graph_function_sandbox_integration.test.mjs` | GTL algebra covered. ABG replay-derived execution across composed graph boundaries remains `T-041`. |
| `04-publication-and-semantic-work.md` | `REQ-L-GTL3-MODULE`, `ROLE`, `JOB` | `test_m02_work_publication_integration.test.mjs`, `test_m02_m03_lookup_authority_integration.test.mjs`, `t010-m02-negative-ingress.test.mjs` | Covered by `M02-work-publication` design/code/tests. |
| `05-runtime-aggregates-and-event-truth.md` | `REQ-R-ABG3-EVENTS`, `BINDING`, `WORKER`, `JOB-WORKER`, `RUN`, `GRAPHCALL`, `FRAME`, `CONTINUATION` | `test_m03_engine_kernel_integration.test.mjs`, `test_m02_m03_lookup_authority_integration.test.mjs`, `test_m04_app_bootstrap_integration.test.mjs`, `test_m04_event_ingress_*` | Partially covered. `GraphCall`, `Frame`, next-edge, and continuation aggregate design needs `T-041`/`T-042`. |
| `06-replay-lineage-and-correction.md` | `REQ-R-ABG3-PROJECTION`, `LINEAGE`, `PROVENANCE`, `CORRECTION`, `RETRY` | `test_m05_installed_reset_postmortem_*`, `test_m05_run_archive_integration.test.mjs`, reset/archive proof lanes | Partially covered. Replay projection over graph-call/frame/continuation is `T-041`; retry/correction repair law is `T-042`. |
| `07-governed-probabilistic-runtime.md` | `REQ-R-ABG3-INTERPRET`, `CONVERGENCE`, `POLICY`, `SELECTION-APPLICATION`, `LEAFTASK`, `TRANSPORT` plus mapping families | `test_m03_transport_protocol_*`, `test_m03_engine_kernel_integration.test.mjs`, live/sandbox portfolio lanes | Partially covered. Transport is bounded; failure taxonomy is `T-035`; leaf-task governance is `T-042`; replay-derived iteration is `T-041`. Mapping families remain outside this GTL/ABG walkthrough except where scenario authority names them. |
| `08-derived-artifact-governance.md` | `REQ-R-ABG3-SELFHOSTING` | `test_m05_method_trace_unit.test.mjs`, bootloader/archive/qualification proof surfaces | Covered by `M05-qualification-scenarios` and completed qualification lanes. |

## Requirement Family Walkthrough

### GTL Families

The GTL requirement families are traceable through common module ownership,
TypeScript design, code, and tests:

- `REQ-L-GTL3-LANGUAGE`, `ATTRS`, `CONTEXT`, `GRAPH`, `NODE`, `GRAPHVECTOR`,
  `INTERFACE`, `IDENTITY`: owned by `M01-gtl-core`, realized by
  `code/src/gtl/m01/**`, validated by `test_m01_gtl_core_integration.test.mjs`
  and `t009-*`.
- `REQ-L-GTL3-OPERATOR`, `EVALUATOR`, `RULE`, `HOOKS`: owned by
  `M01-gtl-core`, realized by `code/src/gtl/m01/**`, validated by the same
  `M01` lane.
- `REQ-L-GTL3-GRAPHFUNCTION`, `COMPOSE`, `SUBSTITUTE`, `RECURSE`, `HOF`,
  `LAWS`, `SELECTION-BOUNDARY`, `SYNTHESIS`: owned by `M01-gtl-core`, realized
  in `gtl/m01/contracts` and `gtl/m01/algebra`, validated by `M01` tests and
  the installed three-stage graph-function sandbox lane.
- `REQ-L-GTL3-MODULE`, `ROLE`, `JOB`: owned by `M02-work-publication`,
  realized by `code/src/gtl/m02/**`, validated by `test_m02_*`, lookup
  authority tests, and `t010-*`.
- `REQ-L-GTL3-SUBWORK`: GTL declaration capability is covered by `M01`; ABG
  runtime leaf-task realization is separately governed by `REQ-R-ABG3-LEAFTASK`
  and remains `T-042`.

No GTL family requires a new requirement ticket.

### ABG Families

The ABG families have requirement authority and common module ownership through
`M03-engine-kernel`. TypeScript realization is uneven:

- Covered enough for current TS line: `REQ-R-ABG3-WORKER`,
  `REQ-R-ABG3-JOB-WORKER`, `REQ-R-ABG3-SELFHOSTING`.
- Partially covered but blocked by replay-derived iteration design:
  `REQ-R-ABG3-EVENTS`, `PROJECTION`, `BINDING`, `RUN`, `GRAPHCALL`, `FRAME`,
  `LINEAGE`, `SELECTION-APPLICATION`, `PROVENANCE`, `INTERPRET`.
  Successor: `T-041`.
- Partially covered but blocked by retry/repair and leaf-task design:
  `REQ-R-ABG3-CONTINUATION`, `CORRECTION`, `RETRY`, `LEAFTASK`.
  Successor: `T-042`.
- Partially covered but blocked by runtime/capability/failure taxonomy:
  `REQ-R-ABG3-CONVERGENCE`, `POLICY`, `TRANSPORT`, and the public-facing parts
  of `RUN`/`EVENTS`.
  Successor: `T-035`, then `B-030-TS`.

No ABG family requires a new requirement ticket.

## Code/Test Evidence

Current TypeScript code proves a steel thread, not full graph-function
execution parity:

- `code/src/gtl/m01/**` carries GTL declaration, algebra, and serialization
  law.
- `code/src/gtl/m02/**` carries publication, job, role, module, and lookup
  law.
- `code/src/abg/m03/contracts/**` carries `StartIntent`, `ExecutionBasis`,
  `AdvancementTransition`, and first-slice runtime event truth.
- `code/src/abg/m03/transport/**` carries the late transport/result protocol.
- `code/src/app/m04/**` carries public-start, control, event-ingress,
  result-assessment, live-status, install/bootstrap, bootloader, and asset
  addressing surfaces.
- `code/src/qualification/m05/**` carries qualification, installed sandbox,
  live portfolio, archive, reset/postmortem, and Python behavior portfolio
  proof surfaces.

The missing code surface is not a missing constitutional requirement. It is
TypeScript `M03` carrier/code/proof work that follows design:

- replay-derived graph-call/frame/next-edge projection carriers
- retry/repair carriers over fresh attempt identity and current prompt/manifest
  truth
- bounded parent-owned leaf-task carriers
- failure-class taxonomy consumed by `M04` stop projection

## Missing Requirement Register

Empty.

The walkthrough found no requirement that must be created before downstream
design work opens. Existing requirements are sufficient:

- `REQ-R-ABG3-INTERPRET-009..012` directly govern internal iteration.
- `REQ-R-ABG3-GRAPHCALL`, `FRAME`, and `PROJECTION` govern aggregate truth.
- `REQ-R-ABG3-RETRY` and `CORRECTION` govern fresh repair/reopen truth.
- `REQ-R-ABG3-LEAFTASK` governs bounded subordinate work.
- `REQ-R-ABG3-TRANSPORT`, `CONVERGENCE`, `POLICY`, `RUN`, and `EVENTS` govern
  failure taxonomy and public stop projection inputs.

## Successor Ticket Disposition

- `T-041`: confirmed. Keep as design-only ordinary ticket. It should produce
  the TypeScript `M03` derivation, IACS, structural carrier diagram, and
  successor implementation/proof tickets for replay-derived graph-function
  iteration.
- `T-042`: confirmed. Keep as design-only ordinary ticket. It should produce
  the common/TypeScript retry/repair and leaf-task design authority and name
  successor implementation/proof tickets.
- `T-035`: confirmed. It is not a duplicate of `B-030-TS`. It is the upstream
  taxonomy reprice that `B-030-TS` must consume.
- `B-030-TS`: confirmed after `T-035`. It should not own downstream product
  abbreviations such as `proof_hold`; it should publish substrate-owned callable
  start and stop-class truth.

## Proof Commands

Executed during walkthrough:

```bash
rg -n "REQ-L-GTL3-|REQ-R-ABG3-" build_tenants/common/design build_tenants/abiogenesis/typescript/design build_tenants/abiogenesis/typescript/code build_tenants/abiogenesis/typescript/test_env --glob '!test_runs/**'
rg -n "REQ-R-ABG3-(RETRY|LEAFTASK|GRAPHCALL|FRAME|PROJECTION|BINDING|LINEAGE|INTERPRET|TRANSPORT|CONVERGENCE|POLICY)|GraphCall|Frame|Continuation|retry|leaf|next-edge|first-vector|graph-function iteration|IterationAdvance" build_tenants/common/design build_tenants/abiogenesis/typescript/design build_tenants/abiogenesis/typescript/code build_tenants/abiogenesis/typescript/test_env --glob '!test_runs/**'
rg -n "REQ-L-GTL3-|REQ-R-ABG3-" specification/scenarios specification/requirements/gtl specification/requirements/abg
```

The second command confirms the practical repair shape: common design names the
`M03` obligations, TypeScript design states the graph-function iteration law,
but TypeScript code/test evidence does not yet carry full graph-call/frame
projection, retry/repair, or leaf-task carrier truth.
