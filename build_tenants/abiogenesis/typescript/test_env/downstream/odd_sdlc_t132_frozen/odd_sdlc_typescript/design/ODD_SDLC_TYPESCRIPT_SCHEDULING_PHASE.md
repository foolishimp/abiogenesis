# ODD SDLC TypeScript Scheduling Phase

**Status**: Active
**Ticket**: `T-093`
**Implements**: `REQ-F-ODDSDLC-057`, `REQ-F-ODDSDLC-059`,
`REQ-F-ODDSDLC-060`
**Derives From**:
- `specification/PRODUCT.md`
- `specification/requirements/15-odd-sdlc-scheduling-phase.md`
- `.ai-workspace/comments/codex/20260428T224944Z_STRATEGY_managed_traversal_architecture_current_state_and_path.md`

## Design Claim

The TypeScript executive graph carries schedule/work-plan rows inside composite
implementation and test design carriers before materialization and execution
edges.

```text
implementation_design_surface
  -> derive_component_code_surface
  -> qualify_component_realization_surface
  -> derive_code_surface
  -> code_surface

test_design_surface
  -> derive_component_test_surface
  -> derive_uat_test_source_surface
  -> prepare_test_execution_surface
  -> derive_test_execution_result_surface
  -> derive_test_run_archive_surface
  -> test_run_archive_surface
```

`derive_component_code_surface`, `derive_component_test_surface`, and
`derive_uat_test_source_surface` are sibling `Fg_graph_code_builder`
materialization targets over common requirement/design authority when admitted
dependency maps select a parallel traversal. The linear display above is the
full-breadth fallback/read order; it is not a law that completed component
source is a blanket precondition for test-source generation. Source/test
consistency closes at qualification and execution fan-in.

The schedule is graph state. It is not a ticket, not a manual checklist, and
not an operator-local loop.

The reduced lite overlay is a proportional projection of this same graph law.
For hello-world-class traversals it still includes the execution spine:

```text
derive_component_code_surface
-> prepare_test_execution_surface
-> derive_test_execution_result_surface
```

The lite overlay may reduce breadth, but it may not replace execution proof
with component-code materialization. `derive_test_execution_result_surface`
must produce graph-owned `sdlc_worker_execution_evidence` before a lite live
proof can claim product behavior. The overlay re-entry route for failed test
execution is declarative selection policy consumed by the installed runtime;
it is not a harness retry loop.

## Module Boundary

Scheduling belongs to the `odd_sdlc` domain graph because it names the planned
work packages and dependency order for a software-domain traversal.

ABG remains responsible for runtime truth, vector closure, retry, and replay.
The schedule does not select the next vector outside ABG.

## Carrier Content

Schedule rows may represent:

- planned work packages
- dependency order
- module dependency graph
- realization and qualification tranches
- tranche obligation ledger
- tranche gap ledger
- next-tranche selector
- phase gates
- expected output surfaces
- worker lanes
- acceptance and evidence checkpoints
- current open, done, and blocked state
- same-edge re-entry conditions

## Graph Integration

`derive_implementation_design_surface` carries implementation work-plan rows
before component code and code aggregation. `derive_component_code_surface`,
`qualify_component_realization_surface`, and `derive_code_surface` consume the
composite implementation design carrier.

`derive_test_design_surface` carries test execution schedule rows before
component tests, command execution, qualification, and the run archive.

The hook contract catalog derives the new contracts from the graph catalog and
the declared target policies. Worker handoff manifests therefore cite the
composite design carrier through `inputAssetTypes` and traversal obligations.

## Local Optimization

This slice publishes schedule rows as typed carrier content and requires them
to name dependency graphs and tranche ledgers when the implementation,
test, or evidence graph is decomposable. It does not introduce a hidden
imperative execution planner.

Prompt-bearing worker handoffs carry two pressure forms:

- complete archived authority in `handoff_manifest.json` and
  `traversal_intent_package.json`
- compact prompt pressure projection containing authority index, tranche keys,
  targeted inline obligations, and retrieval hints

The compact prompt projection is not a second authority source. It keeps large
outside builds from turning every edge into one giant prompt while preserving
complete audit truth by reference.

## Global Optimization

The schedule surfaces are the product-side expression of managed traversal
prestep planning for prompt-bearing edges:

```text
prestep: graph-owned schedule/work-plan asset
prompt opening: make a plan from governing authority and rank work by contextual closure priority
execute: F_P worker handoff over the selected edge
postprocess: postflight + assurance ledgers + satisfaction fold
```

This keeps the data_mapper/test35 lesson in the graph while avoiding a Python
controller shape.

## Prompt Pressure Projection

The worker prompt shall not be the only authority carrier. It shall point to the
canonical `worker_construction_brief.json`, then inline only the local pressure
needed to start the edge:

- a first-line SPEC_METHOD planning invariant requiring the worker to make a
  plan from governing authority, rank work by contextual closure priority, and
  work through that priority order: critical behavior, highest-dependency
  modules, and shared/common-library foundations first
- retry-facing gap prompts rank repair rows by critical behavior,
  highest-dependency modules, common-library foundations, and repeated/common
  failure rows before editing
- authority index entries with digest-backed refs
- tranche keys derived from source assets, target asset, declared modules, and
  schedule/tranche roles
- compact obligation summaries for target, evaluator, source/module, prior-gap,
  and bounded requirement obligations
- retrieval hints that map authority refs back to obligation ids

The full handoff manifest, traversal intent package, invocation package, and
ledgers remain archive/evaluator surfaces. They are not ordinary worker
first-read inputs unless current gap evidence explicitly cites them.

The worker may open referenced authority documents when the local slice is
insufficient. The evaluator still judges the worker report against the complete
manifest obligation context.

## Phase 1 Compute Subworkstreams

Prompt-bearing workers may use agent-internal subagents or parallel
workstreams as local compute strategy when the construction brief exposes
admitted schedule, dependency, tranche, target-carrier, and authority pressure.
That is a parent-agent optimization only. It does not replace the schedule
surface, ABG frontier execution, vector closure, retry, replay, or
continuation truth.

The observable carrier is `SdlcComputeSubworkstreamManifest`. Each row cites
the dependency and authority refs that justified the split, plus predecessor,
read, write-territory, output-allocation, idempotency, and fan-in fields where
known. `transform.C` rows may name changed/proposed files inside the active
edge write roots. `evaluate.C` rows are read-only and leave write/output fields
empty.

This carrier does not replace `SdlcFeatureDependencyDag` or the T-173/T-174
compiled frontier. The DAG remains admitted schedule truth. The subworkstream
manifest is parent-result observation over one compute turn; its fields are
named so a later ABG Phase 2 can promote rows into branch declarations without
letting Phase 1 back-author schedule, lease, replay, or fan-in authority. It
cannot back-author schedule truth.
