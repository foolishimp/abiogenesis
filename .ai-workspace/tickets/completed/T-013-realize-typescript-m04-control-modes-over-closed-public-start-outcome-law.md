# T-013 Realize the TypeScript `M04` control-mode slice over closed public-start outcome law

- id: T-013
- title: Realize the TypeScript `M04` control-mode slice over closed public-start outcome law
- type: feature
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- goal: typescript-tenant-m04-control-modes-wave
- change_intent: Realize the next TypeScript `M04-app-bootstrap` slice above completed `T-012`, preserving `fh_mode` and `root_mode` as orthogonal product-policy control modes over `PublicStartRequest` and `PublicStartOutcome`, adding one bounded control-loop outcome family and one canonical orchestration route without letting proxy or supervision helpers become rival semantic centers.
- change_class: design_reframe
- re_entry_point: design_surface
- priority: high
- dependencies:
  - T-012 completed
- intake_source: `T-012` closure on 2026-04-23; shared `M04-app-bootstrap` module law; Python `gen_start` convergence and proxy control review repriced for a TypeScript package-first control-loop boundary
- affected_boundary: `build_tenants/abiogenesis/typescript/design/`, future `build_tenants/abiogenesis/typescript/code/src/app/m04/control/**`, tenant-root package control-loop entry surfaces, and the first bounded supervision/proxy route over completed `publicStart(...)`
- triaged_at: 2026-04-23
- created_at: 2026-04-23
- updated_at: 2026-04-24
- authoritative_contract: completed `T-012` public-start carriers remain authoritative upstream truth; before control-loop code begins, the TypeScript tenant must declare a tenant-local `M04` control-loop derivation asset, first-slice IACS, authority matrix, subordinate payload register, bounded strict lane expansion, and module-bounded structural carrier diagram for the next public control boundary; only then may the TypeScript line realize one bounded supervision/proxy route that consumes closed `PublicStartOutcome` truth instead of reconstructing runtime meaning in package helpers, and the canonical control-loop unit-test lane must derive from those same module assets rather than from helper layout
- governing_design:
  - build_tenants/abiogenesis/typescript/design/README.md
  - build_tenants/abiogenesis/typescript/design/TYPESCRIPT_REALIZATION_GUARDRAILS.md
  - build_tenants/abiogenesis/typescript/design/TYPESCRIPT_STRICT_LANE.md
  - build_tenants/abiogenesis/typescript/design/ABG_3_MODULE_DESIGN.md
  - build_tenants/abiogenesis/typescript/design/M04_PUBLIC_START_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M04_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M04_PUBLIC_START_STRUCTURAL_CARRIER_DIAGRAM.md
  - build_tenants/abiogenesis/typescript/design/M04_CONTROL_LOOP_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M04_CONTROL_LOOP_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M04_CONTROL_LOOP_STRUCTURAL_CARRIER_DIAGRAM.md
  - build_tenants/common/design/modules/M04-app-bootstrap.yml
- constitutional_requirements:
  - specification/ABG_3_CONSTITUTIONAL_DESIGN.md
  - specification/requirements/abg/REQ-R-ABG3-POLICY.md
  - specification/requirements/product/REQ-P-POLICY.md
  - specification/requirements/product/REQ-P-QUAL.md
  - specification/scenarios/TESTCASE_AUTHORITY.md
- links:
- /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-012-realize-typescript-m04-public-start-steel-thread-over-kernel-owned-runtime-law.md
- /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-014-reprice-typescript-m02-publication-lookup-and-m03-execution-resolution-under-explicit-lookup-authority.md
- /Users/jim/src/apps/specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md
- /Users/jim/src/apps/specification_methodology/specification/standards/TICKET_METHOD.md
- target_truth: the next TypeScript `M04` slice owns one bounded control-loop carrier boundary above completed `PublicStartRequest` and `PublicStartOutcome`, preserves `fh_mode` and `root_mode` as orthogonal product-policy control modes, routes through repeated canonical `publicStart(...)` invocation rather than raw kernel reconstruction, and returns one closed public control-loop outcome family without direct event append
- superseded_truth: before this ticket, the TypeScript tenant has only the one-step `T-012` public start boundary; there is no tenant-local control-loop carrier inventory, no bounded supervision/proxy route, and no proof lane for `fh_mode` / `root_mode` behavior over closed public outcomes
- closure_law: this ticket closes when the TypeScript tenant declares the tenant-local `M04` control-loop carrier boundary, lands one bounded control-mode slice under that design, expands the strict lane to the active control-loop files, proves `root_mode=supervised` and `fh_mode=human-proxy` consume closed `PublicStartOutcome` truth instead of reconstructing runtime meaning, and proves yielded, dispatch-required, and human-gate-required seams remain explicit while no control-loop path appends events directly
- evaluation_criteria:
  - the active code wave is explicitly the next `M04-app-bootstrap` control-loop slice only
  - the active control-loop boundary is derived explicitly from Python design to TypeScript design to `M04` module assets before code
  - the active control-loop boundary is declared before code via a tenant-local control-loop IACS
  - the active control-loop boundary has a module-bounded structural carrier diagram
- the active control-loop unit-test lane derives from `M04` module ownership and module assets rather than from code shape
- control-loop code consumes completed `PublicStartRequest` and `PublicStartOutcome` as upstream authoritative truth
- the control-loop result family is closed and pattern-matchable
- `fh_mode` and `root_mode` remain orthogonal product-policy control modes and do not collapse back into traversal grammar
- the control loop routes through canonical `publicStart(...)` and the completed `M03` event shell rather than appending runtime truth directly
- any cleanup absorbed by this ticket stays local to the active `M04` boundary and does not silently reprice upstream `M02` or `M03` module law
- no TypeScript-only realization pressure reprices `specification/` truth instead of resolving the slice inside the build tenant
- non_closure_conditions:
  - control-loop code starts before a tenant-local derivation asset or structural carrier diagram exists
  - control-loop code starts before a tenant-local control-loop first-slice IACS exists
- supervision or proxy behavior reads raw kernel payloads instead of closed `PublicStartOutcome` truth
- `fh_mode` or `root_mode` collapses back into target grammar or package-local mutable state
- helper code appends runtime events directly instead of routing through completed public-start/kernel truth
- yielded, dispatch-required, or human-gate-required seams are flattened into silent success or generic open result bags
- cross-module lookup or indexing changes in `M02` or `M03` are folded into this ticket without their own design/module authority
- event-ingress, result-assessment, install/bootstrap, bootloader, or sandbox/scenario families are widened into this slice
- proof_surface:
  - `M04` control-loop derivation asset from Python design to TypeScript module boundary
  - `M04` control-loop structural carrier diagram
  - `M04` strict-lane expansion for control-loop files
  - module-derived `M04` control-loop unit-test lane
  - module-owned `M04` control-loop integration lane
  - negative-proof fixture for control-loop bypass or open-object outcome injection
  - proof that `root_mode=supervised` preserves yielded/dispatch/human-gate seams as explicit control truth
  - proof that `human-proxy` consumes explicit stop detail without direct event append

## Context

`T-012` closed the first bounded TypeScript `M04` public-start steel thread.

That leaves the next lawful `M04` wave as control-mode orchestration above
completed public-start truth, not deeper kernel widening.

The TypeScript tenant now needs a separate execution contract because `M04`
still owns:

- root-level supervision
- human-proxy approval handling
- later observation and assessment ingress above kernel truth

Without a separate control-loop migration, the TypeScript line would risk
recreating Python controller drift inside package helpers above the newly
closed public-start boundary.

## Triage Position

This is not a requirement reprice and not a whole-app port ticket.

The constitutional product truth, completed `M03` kernel truth, and completed
`T-012` public-start boundary already exist.
The lawful re-entry is the next TypeScript `M04` design surface above that
bounded public-start slice.

The next `M04` issue is:

- `fh_mode` and `root_mode` are admitted but not yet realized as bounded
  control-plane behavior in the TypeScript line
- the control loop must stay above completed `publicStart(...)` truth rather
  than rediscovering runtime law in package helpers
- yielded, dispatch, and human-gate seams must remain explicit and operator-visible

Bounded realization cleanup is lawful inside this ticket only when it stays
inside the active `M04` control-loop boundary and reduces drift without
changing the boundary's carrier inventory.

This ticket may absorb:

- local route consolidation inside `code/src/app/m04/**`
- admission/constructor split cleanup that removes parser re-entry on local
  truth
- module-derived test-fixture consolidation for the active `M04` proof lanes

This ticket must not absorb:

- `M02` publication indexing or lookup repricing
- `M03` execution-basis lookup or indexing redesign
- cross-module performance work that changes upstream module authority
- generalized runtime caching policy

The cross-boundary lookup/indexing opportunity identified during `T-013`
review is captured separately in `T-014`.

## Migration Declaration

- old_truth_path: TypeScript currently has only one-step public-start behavior, so future supervision/proxy work would otherwise accrete in package helpers, root exports, or open result bags around `publicStart(...)`
- new_truth_path: one bounded control-loop request path consumes completed `PublicStartRequest` and `PublicStartOutcome` truth, realizes orthogonal `fh_mode` and `root_mode` behavior, and returns one closed control-loop outcome family over canonical public-start/kernel truth
- producers_old:
  - completed one-step `publicStart(...)`
  - no tenant-local TypeScript control-loop boundary
  - future temptation to reconstruct stop/retry/proxy state in package helpers
- producers_new:
  - tenant-local `M04` control-loop first-slice IACS
  - `build_tenants/common/design/modules/M04-app-bootstrap.yml`
  - TypeScript control-loop code under `code/src/app/m04/control/**`
- consumers_old:
  - any future TypeScript package entry that would otherwise infer supervision/proxy meaning ad hoc
- consumers_new:
  - root package public control entry
  - later event/assessment ingress waves
  - later sandbox/qualification harnesses that consume the public control boundary
- derived_surfaces:
  - tenant-root package export for the public control-loop boundary
  - `M04` strict lane expansion
  - module-owned `M04` control-loop integration tests
  - fail-closed control-loop negative proofs

## Migration Checklist

- [x] old truth path is named explicitly
- [x] new truth path is named explicitly
- [x] producer set for the new truth is listed
- [x] consumer set for the new truth is listed
- [x] projection/read-model surfaces are listed
- [x] old truth path is explicitly demoted from authority
- [x] mixed-state behavior is not acceptable as closure evidence
- [x] tests proving mixed old/new behavior are removed or repriced
- [x] this ticket declares that design must lead module and implementation for the next `M04` control-loop slice
- [x] tenant-local control-loop design wording, proof claims, and implementation state are reconciled before closure

## Required Direction

Before control-loop code starts, the TypeScript tenant must explicitly declare:

1. the control-loop first-slice irreducible architectural carrier set
2. the authoritative/downstream role matrix for the control-loop boundary
3. the subordinate payload register for control-loop payload detail
4. the Python-to-TypeScript derivation asset for the control-loop boundary
5. the control-loop structural carrier diagram in Mermaid UML
6. the bounded strict lane for the active control-loop files
7. one module-derived control-loop unit-test lane
8. one fail-closed negative-proof fixture for control-loop bypass or open-object outcome injection

Only then should control-loop code start.

## Expected Build Output

The next `M04` wave is expected to produce approximately:

- one tenant-local `M04` control-loop first-slice IACS design asset
- one tenant-local `M04` control-loop derivation asset
- one tenant-local `M04` control-loop structural carrier diagram
- `build_tenants/abiogenesis/typescript/code/src/app/m04/control/**`
- one bounded root-package control-loop entry exported from the tenant package surface
- one module-derived `M04` control-loop unit-test lane
- one module-owned `M04` control-loop integration lane
- one fail-closed negative-proof fixture for control-loop bypass

Local consolidation inside `code/src/app/m04/**` and the active `M04` proof
lanes is allowed when it reduces duplication or parser re-entry without
changing the declared carrier boundary.

Cross-module algorithmic repricing remains outside this ticket.

## Current Implementation State

The completed `T-012` public-start code slice is now landed under:

- `build_tenants/abiogenesis/typescript/code/src/app/m04/contracts/**`
- `build_tenants/abiogenesis/typescript/code/src/app/m04/admission/**`
- `build_tenants/abiogenesis/typescript/code/src/app/m04/public_start.ts`
- `build_tenants/abiogenesis/typescript/code/src/app/m04/index.ts`

The completed surfaces beneath it are:

- completed GTL `M01`
- completed GTL `M02`
- completed ABG `M03`
- completed `M04` first public-start steel thread

The declared design/module surfaces now landed for this ticket are:

- `build_tenants/abiogenesis/typescript/design/M04_CONTROL_LOOP_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M04_CONTROL_LOOP_FIRST_SLICE_IACS.md`
- `build_tenants/abiogenesis/typescript/design/M04_CONTROL_LOOP_STRUCTURAL_CARRIER_DIAGRAM.md`

The first control-loop code slice is now landed under:

- `build_tenants/abiogenesis/typescript/code/src/app/m04/control/**`

The first control-loop proof lanes are now landed under:

- `build_tenants/abiogenesis/typescript/test_env/tests/test_m04_control_loop_unit.test.mjs`
- `build_tenants/abiogenesis/typescript/test_env/tests/test_m04_control_loop_integration.test.mjs`
- `build_tenants/abiogenesis/typescript/test_env/tests/t013-m04-control-negative.test.mjs`

## Functional Realization Review Checklist

Review this ticket as an app-bootstrap control-loop migration, not as an excuse
to move kernel law upward or flatten explicit public-start seams.

- [ ] Does the change preserve the constitutional `WHAT` from `specification/` and keep TypeScript work inside build-tenant `HOW` surfaces only?
- [ ] Is the active TypeScript control-loop line functionally equivalent to the Python reference at the semantic boundary, without copying Python controller drift?
- [ ] Does the control-loop boundary derive explicitly from Python design to TypeScript design to `M04` module assets before code?
- [ ] Does the active code wave use only the declared prime control-loop carriers for this slice?
- [ ] Are subordinate control-loop payloads still subordinate?
- [ ] Does each truth surface still have one clear authoritative owner?
- [ ] Does control-loop code consume admitted carriers only?
- [ ] Are control-loop semantic functions pure for the same admitted inputs?
- [ ] Are time, randomness, filesystem, network, and global registries absent from the semantic center?
- [ ] Are carriers immutable and returned as new values rather than mutated in place?
- [ ] Does no package entry both decide kernel meaning and perform effect append directly?
- [ ] Does the control loop route through completed `publicStart(...)` truth rather than reconstructing kernel meaning?
- [ ] Are `fh_mode` and `root_mode` still explicit orthogonal control modes rather than helper-owned flags?
- [ ] Does the active boundary have a control-loop structural carrier diagram that matches the current IACS, visibility, ownership, and deferred-family split?
- [ ] Does the canonical control-loop unit-test lane derive from module ownership, IACS, and structural carrier assets rather than from code layout?
- [ ] Is there a negative proof showing that control-loop bypass or open-object outcome injection fails closed?

## Impacted Interface Review Checklist

- [x] tenant-local control-loop derivation asset exists before code starts
- [x] tenant-local control-loop first-slice IACS exists before code starts
- [x] tenant-local control-loop structural carrier diagram exists before code starts
- [x] canonical control-loop unit-test lane is declared before code starts
- [x] `code/src/app/m04/control/**` realizes only the named control-loop carriers and subordinate payloads
- [x] control-loop code consumes only closed `PublicStartRequest` / `PublicStartOutcome` truth from `T-012`
- [x] bounded package exports expose the control-loop entry intentionally
- [x] control-loop integration lane proves the module-owned supervision/proxy steel thread
- [x] negative-proof lane proves fail-closed rejection of bypassed or open-object control truth
- [x] event-ingress command surface remains explicitly deferred from this slice
- [x] result-assessment ingress surface remains explicitly deferred from this slice
- [x] install/bootstrap surface remains explicitly deferred from this slice
- [x] bootloader surface remains explicitly deferred from this slice
- [x] sandbox/scenario qualification remains explicitly deferred from this slice

## Required Break Order

1. declare the tenant-local control-loop carrier boundary before code
2. derive the canonical control-loop unit-test lane from that module boundary
3. publish and admit the control-loop source carriers
4. deliberately sever one old seam by making supervision/proxy code route through completed `publicStart(...)` truth only
5. land the negative-proof fixture for control-loop bypass
6. only then open later ingress/install/qualification waves

## Break Contract

### Break 1

- seam severed: control-loop behavior inferred from delivery needs alone
- expected negative proof: closure is blocked while no tenant-local derivation asset, structural carrier diagram, or carrier inventory exists

### Break 1A

- seam severed: tests derived from code layout rather than module authority
- expected negative proof: closure is blocked while no canonical module-derived unit-test lane exists

### Break 2

- seam severed: supervision/proxy truth reconstructed procedurally from open inputs or raw kernel payloads
- expected negative proof: canonical control-loop ingress rejects open-object bypass or direct outcome injection

### Break 3

- seam severed: app/bootstrap loop appends runtime truth directly or derives kernel meaning locally
- expected negative proof: control-loop code routes through completed `publicStart(...)` and canonical kernel event truth only

## Completion

It completes only when:

- the tenant-local control-loop derivation asset exists
- the tenant-local control-loop design boundary exists
- the tenant-local control-loop structural carrier diagram exists
- the first TypeScript control-loop code slice exists
- the canonical module-derived control-loop unit-test lane exists
- the active control-loop strict lane is green
- supervision/proxy invocation is proved through the declared carrier family
- `fh_mode` and `root_mode` remain explicit across the boundary
- the named negative-proof fixture is green
- no code in the control-loop slice depends on direct event append or package-owned kernel reconstruction

## Current Verification Result

Current verification command set on closure:

- `npm run build:semantic`
- `npm run lint:semantic`
- `npm run test:t013`
- `npm run test:semantic`

Current verification result on closure:

- `npm run build:semantic` green
- `npm run lint:semantic` green
- `npm run test:t013` green
- `npm run test:semantic` green
- semantic proof count: `55 passed`

## Closure Note

`T-013` closed on 2026-04-24 after the TypeScript tenant landed the bounded
`M04` control-mode slice over completed public-start truth.

Closure evidence:

- `fh_mode` and `root_mode` remain explicit orthogonal public control modes
- the control loop consumes completed `PublicStartRequest` and
  `PublicStartOutcome` truth through canonical `publicStart(...)`
- supervision and proxy behavior preserve explicit yielded, dispatch-required,
  human-gate-required, and rejected seams as closed control truth
- no control-loop path appends runtime events directly
- subordinate route-owned detail no longer leaks through the public package
  surface
- upstream `gap_stop` truth remains explicit inside rejected control stop
  detail rather than being relabeled as yielded truth
- the cross-boundary `M02`/`M03` lookup-indexing opportunity identified during
  review is captured separately in `T-014`

Successor work remains outside this ticket:

- event-ingress
- result-assessment ingress
- install/bootstrap
- bootloader
- sandbox/scenario qualification
- cross-boundary `M02`/`M03` lookup authority repricing in `T-014`
