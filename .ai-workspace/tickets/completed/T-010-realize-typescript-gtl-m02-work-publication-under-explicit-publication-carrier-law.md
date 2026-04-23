# T-010 Realize the TypeScript GTL `M02` work/publication slice under explicit publication carrier law

- id: T-010
- title: Realize the TypeScript GTL `M02` work/publication slice under explicit publication carrier law
- type: feature
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- goal: typescript-tenant-glt-publication-wave
- change_intent: Build the TypeScript GTL `M02-work-publication` slice only after `T-009` closes, preserving graph-function-first callable publication truth, replayable discoverability, and explicit work/publication carriers without letting package glue, open payloads, or public wrappers become rival semantic centers.
- change_class: design_reframe
- re_entry_point: design_surface
- priority: high
- dependencies:
  - T-009 completed
- intake_source: `T-009` successor declaration 2026-04-23; TypeScript GTL module schedule; graph-function-first publication and work-binding contract review 2026-04-23
- affected_boundary: `build_tenants/abiogenesis/typescript/design/`, future `build_tenants/abiogenesis/typescript/code/`, GTL `M02-work-publication`, graph-function publication, semantic job binding, module publication, selection-boundary publication, and replayable discoverability
- triaged_at: 2026-04-23
- created_at: 2026-04-23
- updated_at: 2026-04-23
- authoritative_contract: this ticket does not activate until `T-009` closes; before `M02` code begins, the TypeScript tenant must declare the `M02` irreducible publication/work carrier set, its authoritative/downstream role matrix, subordinate payload register, and the bounded strict lane for `M02`; only then may the TypeScript line realize graph-function-first publication and semantic work carriers
- governing_design:
  - build_tenants/abiogenesis/typescript/design/README.md
  - build_tenants/abiogenesis/typescript/design/TYPESCRIPT_REALIZATION_GUARDRAILS.md
  - build_tenants/abiogenesis/typescript/design/TYPESCRIPT_STRICT_LANE.md
  - build_tenants/abiogenesis/typescript/design/GTL_3_MODULE_DESIGN.md
  - build_tenants/abiogenesis/typescript/design/GTL_3_INTERFACE_CONTRACTS.md
  - build_tenants/abiogenesis/typescript/design/GTL_3_IMPLEMENTATION_PLAN.md
  - build_tenants/abiogenesis/typescript/design/GTL_3_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/GTL_3_M02_WORK_PUBLICATION_IACS.md
- constitutional_requirements:
  - specification/GTL_3_CONSTITUTIONAL_DESIGN.md
  - specification/requirements/gtl/README.md
  - specification/scenarios/TESTCASE_AUTHORITY.md
- links:
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-009-build-the-typescript-tenant-first-slice-under-explicit-carrier-law.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/TICKET_METHOD.md
- target_truth: GTL `M02` publication/work code builds from one explicit publication carrier story, keeps `GraphFunction` as the public callable carrier, keeps `GraphVector` internal, preserves replayable discoverability through explicit `Module`/`Job`/`Role`/selection-boundary publication, and does not let package/bootstrap or open payloads decide callable truth
- superseded_truth: before this ticket, the TypeScript tenant names `M02` in design but has no explicit `M02` carrier inventory, no `M02` strict-lane expansion, and no active code or proof lane for graph-function publication and semantic work binding
- closure_law: this ticket closes when the GTL `M02-work-publication` TypeScript slice lands under its declared publication/work carrier law, the active strict lane for that slice is green, publication/replay preserves admitted GTL truth without reconstructive wrappers, semantic jobs bind published graph functions through explicit work/publication carriers, and no package/bootstrap or open-object path acts as rival publication authority
- evaluation_criteria:
  - the active code wave is explicitly `M02-work-publication` only
  - `GraphFunction` remains the sole public named callable carrier
  - `GraphVector` remains internal realized structure and does not reappear as a public work-entry surface
  - `ContractRef`, `Role`, `Job`, `Module`, and published selection-boundary carriers are realized only through the declared `M02` carrier set
  - the bounded strict lane for `M02` is green
  - publication/replay preserves ids and admitted declaration truth from upstream GTL carriers
  - no TypeScript-only realization pressure reprices `specification/` truth instead of resolving the slice inside the build tenant
- non_closure_conditions:
  - `M02` code starts before `T-009` is complete
  - a `Job` targets internal vectors or open payload truth instead of published graph-function carriers
  - `GraphFunction` publication or replay reconstructs source truth from open objects or controller helpers
  - package/bootstrap code becomes callable-work doctrine
  - new top-level publication carriers are guessed by code before the `M02` IACS surface is declared
  - TypeScript-only realization pressure is used to reprice constitutional GTL truth
- proof_surface:
  - GTL `M02` semantic strict lane
  - graph-function publication and replay tests
  - semantic job binding tests through `ContractRef(kind=\"graph_function\", targetId=...)`
  - negative-proof fixture for open-object publication/work payload bypass
  - proof that published discoverability remains carrier-owned and replay-derived

## Context

`T-009` intentionally closes at `M01-gtl-core` only.
That gives the TypeScript tenant a declaration-carrier base before public work
and publication carriers are introduced.

The next GTL wave is not a continuation of `M01`.
It is a new boundary:

- graph-function-first callable publication
- semantic job binding
- module publication and replayable discoverability
- published selection boundaries

That boundary needs its own carrier inventory and proof lane.
Without that separation, the TypeScript line would risk recreating the same
drift family at the public carrier boundary that `T-009` prevents at the
declaration boundary.

## Required Direction

Before `M02` code starts, the TypeScript tenant must explicitly declare:

1. the `M02` irreducible architectural carrier set
2. the authoritative/downstream matrix for publication/work carriers
3. the subordinate payload register for publication/work payloads
4. the bounded strict lane for `M02`
5. one fail-closed negative-proof fixture for open-object publication/work
   ingress bypass

Only then should `M02` code start.

## Completion

It completes only when:

- the GTL `M02` TypeScript code slice exists
- the active `M02` strict lane is green
- graph-function publication, semantic job binding, and replayable
  discoverability are proved through the declared carrier family
- the named negative-proof fixture is green
- no code in the `M02` slice depends on implicit or reconstructive publication
  authority

## Current Implementation Snapshot

Current landed `M02` scope is bounded to:

- `code/src/gtl/m02/contracts/**`
- `code/src/gtl/m02/admission/**`
- `code/src/gtl/m02/serialization/**`
- tenant root and `./gtl/m02` package exports

Current bounded proof lanes are:

- `test_env/tests/test_m02_work_publication_integration.test.mjs`
- `test_env/tests/t010-m02-negative-ingress.test.mjs`

Current verification command set is:

- `npm run build:semantic`
- `npm run lint:semantic`
- `npm run test:t010`

Current verification result on closure:

- `npm run build:semantic` green
- `npm run lint:semantic` green
- `npm run test:t010` green
- semantic proof count: `30 passed`

## Closure Note

`T-010` closed on 2026-04-23 after the TypeScript tenant landed the bounded
`M02-work-publication` slice under explicit publication carrier law.

Closure evidence:

- `GraphFunction` remains the sole public callable carrier
- semantic work binds published graph functions through
  `ContractRef(kind="graph_function", targetId=...)`
- `Module`, `Job`, `Role`, `RefinementBoundary`, and `CandidateFamily` replay
  through explicit publication/work carriers rather than package or
  controller-owned reconstruction
- fail-closed negative proofs now exist for:
  - invalid semantic work contract kind
  - unpublished graph-function target ids
  - open-object hook-config bypass at canonical ingress

Successor work remains outside this ticket:

- `T-011` for the first ABG runtime slice
