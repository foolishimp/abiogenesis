# T-014 Reprice TypeScript `M02` publication lookup and `M03` execution resolution under explicit lookup authority

- id: T-014
- title: Reprice TypeScript `M02` publication lookup and `M03` execution resolution under explicit lookup authority
- type: feature
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- goal: typescript-tenant-m02-m03-lookup-authority-wave
- change_intent: Replace repeated linear-scan publication lookup during TypeScript `M03` execution-basis admission with one explicit lookup authority derived from `M02` publication truth, without repricing public GTL or ABG carriers and without introducing hidden cache doctrine in runtime helpers.
- change_class: design_reframe
- re_entry_point: design_surface
- priority: medium
- dependencies:
  - T-010 completed
  - T-011 completed
  - T-013 review identified the cross-boundary lookup opportunity on 2026-04-24
- intake_source: `T-013` design-method review on 2026-04-24; current `M03` execution-basis admission still linearly scans `Module.graphFunctions` and `Module.jobs` for every start request
- affected_boundary: `build_tenants/abiogenesis/typescript/design/`, `build_tenants/abiogenesis/typescript/code/src/gtl/m02/**`, `build_tenants/abiogenesis/typescript/code/src/abg/m03/**`, and the boundary between published callable work and execution-basis derivation
- triaged_at: 2026-04-24
- created_at: 2026-04-24
- updated_at: 2026-04-24
- authoritative_contract: before any lookup/index code begins, the TypeScript tenant must declare one explicit `M02` to `M03` lookup authority surface that preserves current callable publication truth, preserves fail-closed ambiguity handling, and keeps lookup ownership in carrier-bound publication law rather than ad hoc runtime caching; only then may `M03` stop linearly scanning module publications during execution-basis admission
- governing_design:
  - build_tenants/abiogenesis/typescript/design/README.md
  - build_tenants/abiogenesis/typescript/design/TYPESCRIPT_REALIZATION_GUARDRAILS.md
  - build_tenants/abiogenesis/typescript/design/TYPESCRIPT_STRICT_LANE.md
  - build_tenants/abiogenesis/typescript/design/GTL_3_MODULE_DESIGN.md
  - build_tenants/abiogenesis/typescript/design/GTL_3_M02_WORK_PUBLICATION_IACS.md
  - build_tenants/abiogenesis/typescript/design/ABG_3_MODULE_DESIGN.md
  - build_tenants/abiogenesis/typescript/design/ABG_3_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M02_M03_LOOKUP_AUTHORITY_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M02_M03_LOOKUP_AUTHORITY_IACS.md
  - build_tenants/abiogenesis/typescript/design/M02_M03_LOOKUP_AUTHORITY_STRUCTURAL_CARRIER_DIAGRAM.md
  - build_tenants/common/design/modules/M02-work-publication.yml
  - build_tenants/common/design/modules/M03-engine-kernel.yml
- constitutional_requirements:
  - specification/GTL_3_CONSTITUTIONAL_DESIGN.md
  - specification/ABG_3_CONSTITUTIONAL_DESIGN.md
  - specification/requirements/gtl/README.md
  - specification/requirements/abg/README.md
- links:
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-010-realize-typescript-gtl-m02-work-publication-under-explicit-publication-carrier-law.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-011-realize-typescript-abg-first-runtime-slice-under-explicit-execution-event-carrier-law.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-013-realize-typescript-m04-control-modes-over-closed-public-start-outcome-law.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/TICKET_METHOD.md
- target_truth: TypeScript `M02` and `M03` share one explicit lookup authority for published graph-function and semantic-job resolution so execution-basis admission consumes admitted publication truth through that authority rather than repeated array scans, while current public carriers, ambiguity failure, and package-facing semantics stay unchanged
- superseded_truth: current `M03` execution-basis construction resolves graph functions and jobs by repeated linear scans inside `code/src/abg/m03/contracts/constructors.ts`, leaving lookup policy implicit inside runtime helpers instead of explicit in `M02` publication law
- closure_law: this ticket closes when the TypeScript tenant declares and lands the `M02` to `M03` lookup authority boundary, removes repeated linear-scan publication lookup from canonical execution-basis admission, preserves fail-closed ambiguity and absence behavior, keeps public GTL and ABG carrier truth unchanged unless explicitly repriced, and proves the new path through bounded strict-lane and integration evidence
- evaluation_criteria:
  - the active wave is explicitly the `M02` to `M03` lookup-authority boundary only
  - the lookup surface is declared before code through tenant-local design/module assets
  - lookup ownership remains carrier-owned publication law rather than hidden runtime caching
  - execution-basis admission no longer linearly scans `module.graphFunctions` and `module.jobs` in the canonical path
  - graph-function and job ambiguity still fail closed
  - no TypeScript-only performance pressure reprices `specification/` truth instead of resolving the issue inside the build tenant
- non_closure_conditions:
  - lookup/index code starts before a tenant-local lookup authority boundary exists
  - runtime helpers gain ad hoc caches or lookup side state without explicit design authority
  - public GTL or ABG carriers are widened or repriced merely to support indexing
  - ambiguity or absence behavior stops failing closed
  - the work is absorbed into unrelated active tickets instead of standing as its own cross-boundary migration
- proof_surface:
  - tenant-local derivation asset for the `M02` to `M03` lookup boundary
  - tenant-local lookup authority IACS or equivalent carrier inventory
  - tenant-local lookup authority structural carrier diagram
  - bounded strict-lane expansion for the active lookup files
  - module-derived `M02 -> M03` lookup unit or integration lane
  - integration proof for execution-basis resolution through explicit lookup authority
  - negative-proof fixture for ambiguous or missing published callable work

## Context

`T-013` reviewed the active `M04` control-loop slice against the shared design
method and found one real cross-boundary optimization opportunity:

- `M03` execution-basis admission still resolves published graph functions and
  semantic jobs through repeated scans of `Module.graphFunctions` and
  `Module.jobs`

That is not a lawful opportunistic cleanup for `T-013` because it crosses
module boundaries and changes where lookup authority lives.

## Current Implementation Snapshot

The current canonical lookup path lives in:

- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/constructors.ts`

Current repeated scans:

- `requireGraphFunction(...)`
- `requireJobForGraphFunction(...)`

Both operate by scanning admitted `Module` publication carriers directly during
every execution-basis construction.

## Required Direction

Before code changes open, the TypeScript tenant must explicitly declare:

1. the lookup authority boundary between published `M02` callable truth and
   `M03` execution-basis admission
2. whether lookup authority remains nested inside `Module` or is promoted into
   a distinct subordinate/index surface
3. how ambiguity and absence remain fail-closed
4. the lookup authority structural carrier diagram in Mermaid UML
5. the bounded strict lane for the active lookup files
6. one module-derived proof lane for lookup resolution
7. one negative-proof fixture for ambiguous or missing callable resolution

Only then should lookup/index code start.

## Expected Build Output

This wave is expected to produce approximately:

- one tenant-local derivation asset for the `M02` to `M03` lookup boundary
- one tenant-local lookup authority IACS or equivalent design asset
- one tenant-local lookup authority structural carrier diagram
- one bounded lookup implementation slice inside `M02` and `M03`
- one module-derived lookup proof lane
- one integration proof for execution-basis resolution
- one negative-proof fixture for ambiguous or missing callable publication

## Current Implementation State

The `T-014` design/module assets are now landed at:

- `build_tenants/abiogenesis/typescript/design/M02_M03_LOOKUP_AUTHORITY_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M02_M03_LOOKUP_AUTHORITY_IACS.md`
- `build_tenants/abiogenesis/typescript/design/M02_M03_LOOKUP_AUTHORITY_STRUCTURAL_CARRIER_DIAGRAM.md`

The bounded implementation slice is now landed at:

- `build_tenants/abiogenesis/typescript/code/src/gtl/m02/contracts/lookup.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/constructors.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/admission/carriers.ts`

The first proof lanes are now landed at:

- `build_tenants/abiogenesis/typescript/test_env/tests/test_m02_m03_lookup_authority_integration.test.mjs`
- `build_tenants/abiogenesis/typescript/test_env/tests/t014-lookup-authority-negative.test.mjs`

The tenant package surface remains intentionally unchanged for lookup detail:

- no new root-package lookup export
- no new `./gtl/m02` lookup export
- `M03` consumes internal `M02` lookup authority by source path only

## Completion

It completes only when:

- the lookup authority boundary is declared before code
- the canonical execution-basis path no longer linearly scans publication
  arrays
- ambiguity and absence still fail closed
- the active strict lane is green
- the named integration and negative proofs are green

## Current Verification Result

- `npm run build:semantic`
- `npm run lint:semantic`
- `npm run test:t014`
- `npm run test:semantic`
- `git diff --check`

All are green on 2026-04-24.

## Closure Note

`T-014` closed on 2026-04-24 after the TypeScript tenant:

- declared the `M02 -> M03` lookup-authority derivation, IACS, and structural
  carrier diagram before code
- landed one bounded internal lookup-authority surface under
  `code/src/gtl/m02/contracts/lookup.ts`
- removed repeated linear-scan callable and job resolution from canonical
  `M03` execution-basis construction
- preserved fail-closed ambiguity, absence, and module-authority mismatch
  behavior
- kept public GTL and ABG carriers unchanged
- kept tenant package exports closed over lookup detail
