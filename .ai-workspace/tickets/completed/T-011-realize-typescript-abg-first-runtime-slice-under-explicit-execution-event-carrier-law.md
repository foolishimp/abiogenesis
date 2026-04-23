# T-011 Realize the TypeScript ABG first runtime slice under explicit execution/event carrier law

- id: T-011
- title: Realize the TypeScript ABG first runtime slice under explicit execution/event carrier law
- type: feature
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- goal: typescript-tenant-abg-runtime-wave
- change_intent: Build the first TypeScript ABG runtime slice only after GTL declaration and publication carriers are closed, preserving one admitted request carrier, one admitted execution basis, one closed advancement-transition family, and one closed runtime-event family without letting package entrypoints, controller loops, or effect edges become rival semantic centers.
- change_class: design_reframe
- re_entry_point: design_surface
- priority: high
- dependencies:
  - T-009 completed
  - T-010 completed
- intake_source: `T-009` successor declaration 2026-04-23; ABG first-slice IACS review; runtime execution/event-law transplant from Python ADR-034/035/036 into the TypeScript tenant
- affected_boundary: `build_tenants/abiogenesis/typescript/design/`, future `build_tenants/abiogenesis/typescript/code/`, ABG first runtime slice, public runtime ingress, execution basis admission, advancement transition derivation, runtime event emission, and the first runtime effect edges
- triaged_at: 2026-04-23
- created_at: 2026-04-23
- updated_at: 2026-04-23
- authoritative_contract: this ticket does not activate until `T-009` and `T-010` close; once active, the ABG first-slice runtime code must be realized only from `ABG_3_FIRST_SLICE_IACS.md`, `ABG_3_MODULE_DESIGN.md`, `TYPESCRIPT_STRICT_LANE.md`, `TYPESCRIPT_REALIZATION_GUARDRAILS.md`, and the runtime ADR chain; package/bootstrap code remains delivery binding only and the effect shell must not erase carrier truth
- old_path_classification: controller-owned runtime helpers and package-entrypoint doctrine=`replace`; open-object runtime/event edges=`replace`; GTL publication semantics reinterpreted procedurally inside runtime code=`replace`
- governing_design:
  - build_tenants/abiogenesis/typescript/design/README.md
  - build_tenants/abiogenesis/typescript/design/TYPESCRIPT_REALIZATION_GUARDRAILS.md
  - build_tenants/abiogenesis/typescript/design/TYPESCRIPT_STRICT_LANE.md
  - build_tenants/abiogenesis/typescript/design/ABG_3_MODULE_DESIGN.md
  - build_tenants/abiogenesis/typescript/design/ABG_3_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/adrs/ADR-040-typescript-tenant-as-package-first-realization.md
  - build_tenants/abiogenesis/typescript/design/adrs/ADR-041-runtime-execution-law-is-carrier-and-event-owned.md
  - build_tenants/abiogenesis/typescript/design/adrs/ADR-042-deterministic-handling-must-not-structurally-block-governed-fp.md
  - build_tenants/abiogenesis/typescript/design/adrs/ADR-043-runtime-advancement-uses-execution-basis-and-advancement-transition.md
- constitutional_requirements:
  - specification/ABG_3_CONSTITUTIONAL_DESIGN.md
  - specification/requirements/abg/
  - specification/requirements/product/REQ-P-QUAL.md
  - specification/scenarios/TESTCASE_AUTHORITY.md
- links:
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-009-build-the-typescript-tenant-first-slice-under-explicit-carrier-law.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-010-realize-typescript-gtl-m02-work-publication-under-explicit-publication-carrier-law.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/TICKET_METHOD.md
- target_truth: the first TypeScript ABG runtime wave realizes one admitted public request carrier, one admitted execution basis, one closed advancement-transition family, and one closed runtime-event family; event truth remains carrier-owned, effect edges consume only closed carriers, and package/bootstrap code stays below runtime meaning
- superseded_truth: before this ticket, the TypeScript tenant has ABG runtime design law and a first-slice carrier inventory, but no runtime code, no runtime proof lane, and no active effect-boundary proof that `emit(...)` and dispatch edges preserve closed carrier truth
- closure_law: this ticket closes when the first TypeScript ABG runtime slice lands under the declared runtime carrier law, the active strict lane for that slice is green, public runtime ingress admits one request carrier into one execution-basis path, advancement derives through the closed transition family, the effect shell accepts only the closed runtime-event family and closed dispatch request carriers, and no controller or package layer acts as runtime authority
- evaluation_criteria:
  - the active code wave is explicitly the first ABG runtime slice only
  - `StartIntent`, `ExecutionBasis`, `AdvancementTransition`, and `RuntimeEvent` are the only prime runtime carriers in the active slice
  - `ExecutionBasis` and `AdvancementTransition` are the only lawful runtime advancement authorities
  - `emit(...)` accepts only `RuntimeEvent` or `readonly RuntimeEvent[]`
  - dispatch and transport effect edges accept only closed request carriers derived from the transition family
  - package/bootstrap code parses ingress but does not derive runtime meaning
  - no TypeScript-only realization pressure reprices `specification/` truth instead of resolving the slice inside the build tenant
- non_closure_conditions:
  - runtime code starts before `T-009` and `T-010` are complete
  - controller loops, package entrypoints, or adapters derive runtime meaning outside the declared carrier family
  - `emit(...)` or dispatch edges accept `unknown`, `Record<string, unknown>`, or generic object bags as normal semantic input
  - downstream stop/status/proof-hold projections are introduced before the first runtime core is green
  - runtime closure depends on reconstructive wrappers rather than admitted carriers and emitted events
  - TypeScript-only realization pressure is used to reprice constitutional ABG truth
- proof_surface:
  - ABG first-runtime-slice semantic strict lane
  - public ingress admission tests for the request carrier
  - execution-basis and advancement-transition derivation tests
  - runtime-event emission tests proving the canonical effect shell does not erase carrier truth
  - negative-proof fixture for open-object runtime/event ingress bypass

## Context

The TypeScript tenant already declares the ABG first-slice runtime carrier law.
But runtime code is intentionally blocked until GTL declaration and publication
truth is closed first.

That sequencing is load-bearing.
The runtime wave must consume published GTL truth.
It must not backfill missing GTL publication semantics procedurally inside ABG.

So this ticket is a successor wave, not a parallel buildout.

## Triage Position

This is not a requirement reprice and not a whole-runtime port ticket.

The constitutional ABG runtime truth already exists.
The lawful re-entry is the TypeScript runtime design surface, now that GTL
declaration and publication truth is sufficiently closed for runtime
consumption.

The runtime issue is:

- the TypeScript tenant already names the right runtime carrier law
- but runtime closure still needs the same execution-contract depth that
  prevented GTL drift in `T-009` and `T-010`
- the first ABG slice must stay a steel thread rather than silently widening
  into app/bootstrap doctrine, downstream projections, or package-owned loops

So this ticket is an implementation migration over the runtime carrier
boundary:

- from no TypeScript ABG runtime code and no typed effect shell
- to one admitted request carrier, one admitted runtime basis, one closed
  transition family, one closed runtime-event family, and typed effect edges

## Migration Declaration

- old_truth_path: no TypeScript ABG runtime carrier path exists yet, so any
  first implementation would otherwise tend to recover runtime meaning in
  controllers, package entrypoints, helpers, or open-object event payloads
- new_truth_path: TypeScript ABG runtime meaning enters through admitted
  `StartIntent`, is admitted into `ExecutionBasis`, advances only through the
  closed `AdvancementTransition` family, and reaches the effect edge only as
  `RuntimeEvent` and typed dispatch request carriers
- producers_old:
  - package/bootstrap doctrine inferred from delivery needs
  - open-object runtime/event payload handling
  - procedural GTL target resolution inside runtime helpers
- producers_new:
  - `ABG_3_FIRST_SLICE_IACS.md`
  - `ABG_3_MODULE_DESIGN.md`
  - `TYPESCRIPT_STRICT_LANE.md`
  - `TYPESCRIPT_REALIZATION_GUARDRAILS.md`
  - ADR-041 / ADR-042 / ADR-043
  - `code/src/abg/m03/contracts/**`
  - `code/src/abg/m03/admission/**`
  - `code/src/abg/m03/events/**`
- consumers_old:
  - any future TypeScript runtime entrypoint or helper that would otherwise
    derive runtime meaning procedurally
- consumers_new:
  - TypeScript runtime kernel code
  - typed event emission and dispatch edges
  - later projection and app/bootstrap waves
- derived_surfaces:
  - typed runtime package exports
  - ABG strict lane
  - M03 module-owned integration tests
  - fail-closed runtime/event negative proofs

## Migration Checklist

- [x] old truth path is named explicitly
- [x] new truth path is named explicitly
- [x] producer set for the new truth is listed
- [x] consumer set for the new truth is listed
- [x] projection/read-model surfaces are listed
- [x] old truth path is removed or explicitly demoted from authority
- [x] mixed-state behavior is no longer accepted as closure evidence
- [x] tests proving mixed old/new behavior are removed or repriced
- [x] ticket wording, design wording, and proof claims are reconciled before closure

## Required Direction

When this ticket becomes active, the TypeScript runtime wave must:

1. admit one public runtime ingress carrier
2. derive one execution basis from that admitted ingress
3. derive one closed advancement-transition family from the admitted basis
4. emit only one closed runtime-event family
5. keep package/bootstrap and adapter code below the runtime semantic center

This ticket must not widen into:

- downstream stop/status/proof-hold projections
- package-owned control doctrine
- open-object runtime payload handling
- public read-model families that outrank emitted event truth

## Expected Build Output

The first ABG runtime wave is expected to produce approximately:

- `build_tenants/abiogenesis/typescript/code/src/abg/m03/index.ts` and tenant
  root export wiring for the bounded runtime surface only
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/`:
  TypeScript declarations for `StartIntent`, `ExecutionBasis`,
  `AdvancementTransition`, `RuntimeEvent`, and the named subordinate runtime
  payloads
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/admission/`:
  one admit/parse path for public runtime ingress and basis-owned subordinate
  payloads
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/events/`:
  the canonical typed event shell and typed dispatch/transport effect edges for
  the active slice
- tenant-root package exports for `./abg/m03`
- one module-owned `M03` integration lane derived from runtime/module
  authority rather than ticket-local names
- one negative-proof fixture proving fail-closed rejection of open-object
  runtime/event bypass

## Current Implementation Snapshot

Active runtime steel-thread code now exists under the TypeScript tenant:

- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/**`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/admission/**`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/events/**`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/index.ts`
- tenant-root package export wiring for `./abg/m03`
- `build_tenants/abiogenesis/typescript/test_env/tests/test_m03_engine_kernel_integration.test.mjs`
- `build_tenants/abiogenesis/typescript/test_env/tests/t011-abg-negative-ingress.test.mjs`

Current verification snapshot:

- `npm run build:semantic` green
- `npm run lint:semantic` green
- `npm run test:t011` green
- current result: `36 passed`

## Closure Note

`T-011` closed on 2026-04-23 after the TypeScript tenant landed the bounded
first ABG runtime steel thread under explicit execution/event carrier law.

Closure evidence:

- public runtime ingress now admits one `StartIntent` carrier only
- runtime meaning now advances through one admitted `ExecutionBasis` family and
  one closed `AdvancementTransition` family
- the canonical effect shell accepts only `RuntimeEvent` and typed
  `FpDispatchRequest` carriers rather than open object bags
- package exports now expose the bounded `./abg/m03` runtime surface
- fail-closed negative proofs now exist for:
  - invalid public runtime target kind
  - open-object runtime-event bypass at the canonical effect edge
  - open-object dispatch-request bypass at the canonical dispatch edge

Successor work remains outside this ticket:

- later runtime projections
- app/bootstrap runtime ownership
- sandbox/scenario qualification

## Functional Realization Review Checklist

Review this ticket as a runtime-carrier migration, not as package-first glue.

- [ ] Does the change preserve the constitutional `WHAT` from `specification/`
      and keep TypeScript work inside build-tenant `HOW` surfaces only?
- [ ] Is the active TypeScript runtime line functionally equivalent to the
      Python runtime reference at the semantic boundary, without copying
      Python-specific implementation drift?
- [ ] Does the active code wave use only the declared prime runtime carriers
      for the first ABG slice?
- [ ] Are subordinate runtime payloads still subordinate, or did the change
      inflate the runtime boundary with fragment interfaces?
- [ ] Does each runtime truth surface still have one clear authoritative owner?
- [ ] Do semantic functions consume admitted carriers only?
- [ ] Are runtime derivation functions pure for the same admitted inputs?
- [ ] Are time, randomness, process state, filesystem, network, and global
      registries absent from the semantic center?
- [ ] Are carriers immutable and returned as new values rather than mutated in
      place?
- [ ] Is shared mutable state absent from the semantic center?
- [ ] Does runtime derivation operate directly on admitted GTL/M02 truth rather
      than reconstructing or reparsing local open payloads?
- [ ] Does the active semantic lane validate first and type second?
- [ ] Is invalid or incomplete runtime truth rejected at ingress instead of
      repaired procedurally inside runtime code?
- [ ] Does each function keep one clear owner and responsibility rather than
      mixing admission, semantics, and effects?
- [ ] Is coupling low by dependency shape:
      runtime derivation depends on GTL publication carriers, not package
      shells; effect code stays at the edge
- [ ] Does no function both decide runtime meaning and perform effects?
- [ ] Does the canonical effect shell preserve carrier truth rather than
      erasing it to an open object sink?
- [ ] Do dispatch and transport edges accept only closed request carriers
      derived from the transition family?
- [ ] Does package/bootstrap code stay below the semantic center?
- [ ] Is the change staying inside build-tenant `HOW` surfaces, or is it trying
      to change constitutional `WHAT` without a separate lawful re-entry?
- [ ] Is there a negative proof showing that open-object runtime/event bypasses
      fail closed?

Passing tests do not satisfy this section by themselves if the runtime meaning
still lives in package helpers, controller loops, or effect-edge object bags.

## Impacted Interface Review Checklist

- [x] `ABG_3_FIRST_SLICE_IACS.md` names the first ABG prime carrier set,
      authoritative role matrix, subordinate payload register, and effect-boundary rule
- [x] `ABG_3_MODULE_DESIGN.md` names package/bootstrap as delivery-only and
      runtime/event law as kernel-owned
- [x] `TYPESCRIPT_STRICT_LANE.md` names the bounded ABG semantic lane
- [x] governance and package/runtime boundaries stay declared in design before
      runtime code claims closure
- [x] `code/src/abg/m03/contracts/**` realizes only the named runtime carriers
      and subordinate payloads
- [x] `code/src/abg/m03/admission/**` admits one request carrier and one basis
      path without open payload truth surviving normal execution
- [x] `code/src/abg/m03/events/**` exposes the canonical typed `emit(...)` path
      and typed dispatch/transport edges
- [x] `test_env/tests/test_m03_engine_kernel_integration.test.mjs` proves the
      module-owned runtime steel thread
- [x] `test_env/tests/t011-abg-negative-ingress.test.mjs` proves fail-closed
      rejection of open-object runtime/event bypasses
- [x] package exports expose the bounded `./abg/m03` surface only

## Required Break Order

1. activate the ABG first-slice ticket and strict lane without widening into
   downstream projections or app/bootstrap doctrine
2. publish/admit the new runtime source carriers:
   `StartIntent -> ExecutionBasis -> AdvancementTransition -> RuntimeEvent`
3. deliberately sever one old seam at the effect boundary by making
   `emit(...)` and dispatch edges typed-only
4. rebind the deepest runtime steel thread to those carriers
5. land the negative-proof fixture for open-object runtime/event bypass
6. only then open later runtime projections or app/bootstrap waves

## Break Contract

### Break 1

- seam severed: runtime meaning inferred from package/bootstrap or helper-local
  state
- expected negative proof: runtime closure is blocked while the ticket/design
  surfaces do not yet name the prime runtime carriers and typed effect shell

### Break 2

- seam severed: public ingress and runtime basis living as open payloads or
  helper-local reconstruction
- expected negative proof: the active lane admits one request carrier into one
  basis path and rejects open-object ingress bypass

### Break 3

- seam severed: event emission and dispatch edges erasing carrier truth into
  generic object bags
- expected negative proof: `emit(...)` and dispatch/transport edges reject
  open-object input and accept only the closed carrier family

## Completion

It completes only when:

- the first ABG TypeScript runtime code slice exists
- the active ABG strict lane is green
- ingress, basis, transition, and event emission are proved through the named
  runtime carrier family
- the named negative-proof fixture is green
- no code in the active runtime slice depends on controller-owned or
  effect-erased truth
