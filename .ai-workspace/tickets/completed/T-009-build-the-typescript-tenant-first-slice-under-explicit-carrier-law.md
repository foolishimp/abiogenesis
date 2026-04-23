# T-009 Build the TypeScript tenant first slice under explicit carrier law

- id: T-009
- title: Build the TypeScript tenant first slice under explicit carrier law
- type: feature
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- goal: typescript-tenant-design-first-buildout
- change_intent: Realize the new `abiogenesis/typescript` tenant as a design-first, package-first TypeScript line without reproducing the Python and odd_sdlc drift families: half-typed carriers, controller-owned semantic centers, erased effect boundaries, or governance surfaces that drift into builder strategy.
- change_class: design_reframe
- re_entry_point: design_surface
- priority: high
- dependencies:
  - T-008 completed
- intake_source: TypeScript tenant design bootstrapping 2026-04-23; review against Python design/ADR line; B-040 and B-042 lesson transplant; shared `build_tenants/common/design/` cleanup completed 2026-04-23; follow-on no-go review requiring first-slice IACS, strict lane, and anti-erasure effect boundary before code buildout
- affected_boundary: `build_tenants/abiogenesis/typescript/design/`, future `build_tenants/abiogenesis/typescript/code/`, the first GTL `M01` carrier/admission/algebra/serialization slice, and the shared `M04` bootstrap boundary as consumed by the TypeScript tenant
- triaged_at: 2026-04-23
- created_at: 2026-04-23
- updated_at: 2026-04-23
- authoritative_contract: the TypeScript tenant must build the first GTL `M01` code wave from one explicit carrier story: `GTL_3_FIRST_SLICE_IACS.md`, `TYPESCRIPT_STRICT_LANE.md`, `TYPESCRIPT_REALIZATION_GUARDRAILS.md`, `GTL_3_INTERFACE_CONTRACTS.md`, `GTL_3_MODULE_DESIGN.md`, and `GTL_3_IMPLEMENTATION_PLAN.md` together become the authoritative buildout law for `T-009`; later `M02` and ABG runtime waves are successor work and do not close this ticket
- old_path_classification: code-first TypeScript buildout with illustrative open-object contract sketches=`replace`; inferred carrier inflation during implementation=`replace`; tenant-local bootstrap doctrine parallel to shared `M04`=`replace`; effect boundaries that erase typed carriers=`replace`
- governing_design:
  - build_tenants/abiogenesis/typescript/design/README.md
  - build_tenants/abiogenesis/typescript/design/TYPESCRIPT_REALIZATION_GUARDRAILS.md
  - build_tenants/abiogenesis/typescript/design/TYPESCRIPT_STRICT_LANE.md
  - build_tenants/abiogenesis/typescript/design/GTL_3_MODULE_DESIGN.md
  - build_tenants/abiogenesis/typescript/design/GTL_3_INTERFACE_CONTRACTS.md
  - build_tenants/abiogenesis/typescript/design/GTL_3_IMPLEMENTATION_PLAN.md
  - build_tenants/abiogenesis/typescript/design/GTL_3_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/ABG_3_MODULE_DESIGN.md
  - build_tenants/abiogenesis/typescript/design/adrs/ADR-040-typescript-tenant-as-package-first-realization.md
- constitutional_requirements:
  - specification/GTL_3_CONSTITUTIONAL_DESIGN.md
  - specification/ABG_3_CONSTITUTIONAL_DESIGN.md
  - specification/requirements/gtl/README.md
  - specification/requirements/abg/
  - specification/requirements/product/REQ-P-QUAL.md
  - specification/scenarios/TESTCASE_AUTHORITY.md
- links:
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-008-tighten-abg-design-surface-around-one-runtime-execution-law.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-010-realize-typescript-gtl-m02-work-publication-under-explicit-publication-carrier-law.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-011-realize-typescript-abg-first-runtime-slice-under-explicit-execution-event-carrier-law.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/TICKET_METHOD.md
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/completed/B-040-close-half-typed-public-start-carrier-family-under-python-typing-and-carrier-set-law.md
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/active/B-042-stop-governance-surfaces-from-drifting-into-builder-strategy-law.md
- target_truth: the TypeScript tenant builds from explicit first-slice carrier authority, admitted serialized ingress, pinned strict typing/lint/validator law, shared `M04` structural bootstrap law, and closed effect-boundary signatures; code no longer has to guess the carrier boundary, typing lane, or bootstrap doctrine
- superseded_truth: before this ticket, the TypeScript line had strong guardrails and ADRs but still left code-critical questions implicit: first-slice IACS was unnamed, strict lane was unpinned, GTL illustrative shapes still carried open-object and optional-shell drift, negative-proof obligation was absent, and effect-boundary anti-erasure was not explicit
- closure_law: this ticket closes at the first GTL `M01` TypeScript code slice only, when that slice lands under the declared first-slice carrier law, the active strict lane for that slice is green, at least one negative proof demonstrates fail-closed ingress on an open payload bypass, the effect boundary for the active slice does not erase carrier truth, and the old code-first or open-shape buildout path no longer stands as an acceptable implementation route; later `M02` and ABG runtime waves are out of scope for `T-009` and require successor tickets
- evaluation_criteria:
  - the first active code wave is explicitly `M01-gtl-core` only
  - GTL `M01` code uses only the prime carriers named in `GTL_3_FIRST_SLICE_IACS.md`
  - subordinate payloads remain subordinate unless this ticket updates their classification first
  - the bounded strict lane defined in `TYPESCRIPT_STRICT_LANE.md` is green for the active modules
  - a named negative-proof fixture proves open payload ingress fails closed before semantic consumption
  - no effect boundary in the active slice accepts `any`, `unknown`, or open object bags as normal semantic input
  - shared `M04` structural law remains upstream; the TypeScript tenant binds it but does not recreate a rival bootstrap doctrine
  - tenant-local HOW work stays inside `build_tenants/abiogenesis/typescript/` and tenant-neutral shared build-tenant surfaces unless a real constitutional ambiguity is discovered
- non_closure_conditions:
  - code begins in `M02`, `M03`, or bootstrap/runtime-shell layers before the first `M01` lane is green
  - prime carriers in the active slice still carry `Record<string, unknown>`, `unknown`, or optional-shell truth as semantic authority
  - a helper, entrypoint, or effect shell erases typed carriers to open object truth in normal execution
  - the negative-proof fixture is absent or only proves local helper behavior rather than canonical ingress failure
  - the TypeScript tenant reintroduces a tenant-local bootstrap doctrine beside shared `M04` structural law
  - code starts by guessing carrier boundaries that are not declared in the IACS docs
  - TypeScript-only realization pressure is used to reprice `specification/` or constitutional requirement truth instead of being resolved inside the build tenant
- proof_surface:
  - first GTL `M01` semantic strict lane
  - first GTL `M01` module-owned integration lane
  - first GTL `M01` admission and serialization tests
  - fail-closed negative ingress fixture for open payload bypass
  - module-local proof that publication/replay preserves admitted declaration truth

## Triage Position

This is not a requirement reprice and not a direct port ticket.

The constitutional GTL and ABG truth already exists.
The lawful re-entry is the design surface of a new tenant realization.

The design issue is:

- the TypeScript tenant was correctly biased by the right lessons
- but it still needed the code-shaping artifacts that keep Codex from guessing
  the carrier boundary during buildout

So this ticket is an implementation migration over the realization boundary:

- from implicit or illustrative buildout law
- to explicit first-slice carrier, strict-lane, and effect-boundary law

## Migration Declaration

- old_truth_path: TypeScript tenant design allowed buildout to infer the first
  carrier boundary from illustrative contract shapes and local tool defaults
- new_truth_path: TypeScript tenant code starts only from named first-slice
  carriers, role matrices, subordinate-payload registers, strict typing law,
  shared-vs-tenant bootstrap authority, and fail-closed ingress proof
- producers_old:
  - illustrative contract sketches in `GTL_3_INTERFACE_CONTRACTS.md`
  - ad hoc code-first `tsconfig` / ESLint / validator selection
  - tenant-local bootstrap interpretation not explicitly anchored in shared `M04`
- producers_new:
  - `GTL_3_FIRST_SLICE_IACS.md`
  - `TYPESCRIPT_STRICT_LANE.md`
  - tightened `GTL_3_INTERFACE_CONTRACTS.md`
  - `ABG_3_MODULE_DESIGN.md` effect-boundary rule
  - `TYPESCRIPT_REALIZATION_GUARDRAILS.md`
- consumers_old:
  - future TypeScript code generation/buildout acting from illustrative shapes
  - local runtime/bundler defaults chosen under delivery pressure
- consumers_new:
  - future `build_tenants/abiogenesis/typescript/code/` GTL `M01` buildout
  - review and closure on the TypeScript tenant
- derived_surfaces:
  - TypeScript tenant code layout and first-source files
  - first semantic strict lane
  - first GTL publication/replay proof lane

## Migration Checklist

- [x] old truth path is named explicitly
- [x] new truth path is named explicitly
- [x] producer set for the new truth is listed
- [x] consumer set for the new truth is listed
- [x] projection and read-model surfaces are listed
- [x] old truth path is removed or explicitly demoted from authority at design level
- [x] mixed-state behavior is no longer accepted as closure evidence at design level
- [x] tests proving mixed old and new behavior are blocked until repriced as TypeScript proof lanes
- [x] ticket wording, design wording, and proof claims are reconciled at code closure

## Context

The TypeScript tenant started better than the Python line started:

- the design root already carried B-040 and B-042 lessons
- the runtime ADR chain was ported before code existed
- package-first delivery was explicit without trying to rewrite product truth

But review found a predictable failure mode:

- the strongest concrete signals were still the illustrative GTL contract
  shapes, and those shapes still carried open-object and optional-shell drift
- the pre-code gates named the right artifacts but those artifacts were not yet
  present

That meant a code generator could still build to the wrong signal.

This ticket is the durable work record for building the first TypeScript tenant
slice only after the signal hierarchy is correct.

This ticket is bounded to GTL `M01` only.
It does not absorb later GTL `M02` publication work or ABG runtime buildout.

## Expected Build Output

The first code wave is expected to produce approximately:

- `build_tenants/abiogenesis/typescript/code/src/index.ts` and
  `build_tenants/abiogenesis/typescript/code/src/gtl/m01/index.ts`:
  stable tenant-facing package exports for the bounded `M01` surface only
- `build_tenants/abiogenesis/typescript/code/src/gtl/m01/contracts/`:
  TypeScript declarations for the five GTL prime carriers named in
  `GTL_3_FIRST_SLICE_IACS.md` plus the named subordinate payloads that remain
  subordinate
- `build_tenants/abiogenesis/typescript/code/src/gtl/m01/admission/`:
  one admit/parse path per serialized ingress family named in the active
  subordinate payload register
- `build_tenants/abiogenesis/typescript/code/src/gtl/m01/algebra/`:
  pure GTL algebra helpers over the admitted first-slice carrier family only
- `build_tenants/abiogenesis/typescript/code/src/gtl/m01/serialization/`:
  publication/replay encode-decode for the active GTL `M01` carrier family
- `build_tenants/abiogenesis/typescript/code/src/shared/validation/`:
  the bounded ingress validation surfaces named by `TYPESCRIPT_STRICT_LANE.md`
- tenant-root semantic strict configuration and lint configuration matching
  `TYPESCRIPT_STRICT_LANE.md`
- `build_tenants/abiogenesis/typescript/test_env/test_surface_map.md` tracing
  the active test corpus back to requirements and design
- one module-owned GTL `M01` integration lane derived from design/module
  authority rather than ticket-local fixture names
- one negative-proof fixture under the TypeScript tenant test surface proving
  fail-closed ingress on an open-object bypass

## Current Implementation State

The first GTL `M01` code wave now exists under the TypeScript tenant:

- `build_tenants/abiogenesis/typescript/code/src/index.ts`
- `build_tenants/abiogenesis/typescript/code/src/gtl/m01/contracts/`
- `build_tenants/abiogenesis/typescript/code/src/gtl/m01/index.ts`
- `build_tenants/abiogenesis/typescript/code/src/gtl/m01/admission/`
- `build_tenants/abiogenesis/typescript/code/src/gtl/m01/algebra/`
- `build_tenants/abiogenesis/typescript/code/src/gtl/m01/serialization/`
- `build_tenants/abiogenesis/typescript/code/src/shared/validation/`
- tenant-root `package.json`, `tsconfig.semantic-strict.json`, and `eslint.config.mjs`
- `build_tenants/abiogenesis/typescript/test_env/test_surface_map.md`
- proof fixtures:
  - `build_tenants/abiogenesis/typescript/test_env/tests/test_m01_gtl_core_integration.test.mjs`
  - `build_tenants/abiogenesis/typescript/test_env/tests/t009-m01-negative-ingress.test.mjs`
  - `build_tenants/abiogenesis/typescript/test_env/tests/t009-m01-roundtrip.test.mjs`

Bounded verification on the current line:

- `npm run build:semantic` = green
- `npm run lint:semantic` = green
- `npm run test:t009` = green
- module-owned `M01` integration lane result: `20` pass
- negative-proof fixture result: `4` pass
- roundtrip/publication-replay fixture result: `1` pass
- total active test count under `test:t009`: `25` pass

The active `M01` line now also derives deterministic carrier identity for
omitted ids and keeps semantic algebra on pure carrier constructors rather than
re-entering admission on local truth.
It now exposes explicit pure materialization helpers for `TemplateRef` and
`GraphFunction` instead of requiring consumers to reach through `template.graph`
directly.
It now exposes a stable package-first tenant entrypoint at the root package and
the bounded `./gtl/m01` subpath, both backed by the same closed `M01` carrier
surface.
It now includes the `GraphFunction`-only higher-order algebra surface for
`recurse`, `fan_out`, `fan_in`, `gate`, and `promote` while still deferring
`CandidateFamily` and `RefinementBoundary` to successor work outside `T-009`.
The module-owned law lane now also proves stable equality over separate
admission, composition associativity at the semantic boundary, and frozen
immutable carrier surfaces.
It also proves replayable governance-hook visibility on
`GraphFunction.declarations` and cumulative environment preservation for
recursive composed chains.

## Functional Realization Review Checklist

Review this ticket as a realization buildout migration, not a language port.

- [ ] Does the change preserve the constitutional `WHAT` from `specification/`
      and keep TypeScript work inside build-tenant `HOW` surfaces only?
- [ ] Is the active TypeScript line functionally equivalent to the Python
      reference at the semantic boundary, without copying Python-specific
      implementation drift?
- [ ] Does the active code wave use only the declared prime carriers for the
      first GTL `M01` slice?
- [ ] Are subordinate payloads still subordinate, or did the change inflate the
      boundary with fragment interfaces?
- [ ] Does each semantic truth surface still have one clear authoritative
      owner?
- [ ] Does the change reduce duplicated truth, controller reconstruction, and
      rival local authority paths?
- [ ] Do semantic functions consume admitted carriers only?
- [ ] Are semantic functions pure for the same admitted inputs?
- [ ] Are time, randomness, UUID minting, environment reads, process state,
      filesystem, network, and global registries absent from the semantic
      center?
- [ ] If identity is introduced, is identity creation explicitly owned by a
      declared ingress or effect boundary rather than hidden inside semantic
      helpers?
- [ ] Are carriers immutable and returned as new values rather than mutated in
      place?
- [ ] Is shared mutable state absent from the semantic center?
- [ ] Do semantic transforms operate directly on local admitted carriers rather
      than re-entering parsers, validators, or loaders on locally assembled
      truth?
- [ ] Does the active semantic lane validate first and type second?
- [ ] Is invalid or incomplete truth rejected at ingress instead of being
      repaired procedurally inside semantic code?
- [ ] Are defaults explicit, ratified, and carrier-owned rather than
      helper-owned?
- [ ] Does each function have one clear owner and one clear responsibility
      rather than mixing admission, semantics, and effects?
- [ ] Is coupling low by dependency shape:
      semantic algebra depends on carrier contracts, not runtime shells;
      admission depends on validation, not semantic orchestration; effect code
      stays at the edge
- [ ] Does no function both decide semantic meaning and perform effects?
- [ ] Does the effect shell preserve carrier truth rather than erasing it to an
      open object sink?
- [ ] Are effect boundaries explicit, typed, and unable to erase carrier truth
      into open objects?
- [ ] Does package/bootstrap code stay below the semantic center?
- [ ] Is governance/observability still separate from builder strategy law?
- [ ] Is the change staying inside build-tenant `HOW` surfaces, or is it trying
      to change constitutional `WHAT` without a separate lawful re-entry?
- [ ] Is there a negative proof showing that an imperative bypass, open-payload
      bypass, or effect-edge erasure fails closed?

Passing a compiler or linter is not enough if the active slice still recreates
an open payload seam, hidden runtime authority, or a controller-owned semantic
center.

## Impacted Interface Review Checklist

- [x] `GTL_3_INTERFACE_CONTRACTS.md` no longer presents `Record<string, unknown>`,
      `unknown`, or optional-field shells as the primary concrete carrier shapes
- [x] `GTL_3_FIRST_SLICE_IACS.md` names the first GTL prime carrier set,
      authoritative role matrix, and subordinate payload register
- [x] `TYPESCRIPT_STRICT_LANE.md` pins compiler, lint, validator, module
      boundary, and negative-proof obligation
- [x] `TYPESCRIPT_REALIZATION_GUARDRAILS.md` blocks code until the negative-proof
      fixture is named
- [x] `build_tenants/abiogenesis/typescript/test_env/test_surface_map.md`
      exists and maps active tests back to live requirements and design
- [x] governance-versus-builder boundary is declared in
      `TYPESCRIPT_REALIZATION_GUARDRAILS.md` and remains non-rival across the
      active slice
- [x] package/runtime boundary is declared in `ADR-040` and
      `ABG_3_MODULE_DESIGN.md` and remains below the semantic center
- [x] shared `M04` bootstrap law remains upstream and the TypeScript tenant
      design root points to it explicitly
- [x] first GTL `M01` module-owned integration lane exists beside the
      ticket-local slice gates
- [x] first GTL `M01` code slice consumes only the named first-slice GTL carriers
- [x] first GTL `M01` code slice proves fail-closed ingress against the named
      negative-proof fixture
- [x] first GTL `M01` effect boundaries preserve carrier truth and do not accept
      open semantic input

## Required Break Order

1. make the TypeScript tenant design surfaces explicit enough that code does
   not guess the first-slice carrier law
2. build the first GTL `M01` code slice only
3. make the active strict lane green for that GTL slice
4. land the negative-proof fixture for fail-closed ingress
5. prove publication/replay and admitted declaration preservation for the GTL
   slice
6. only then pull the successor tickets for the later `M02` publication wave
   and the first ABG runtime wave into the active wave (`T-010` and `T-011`)

## Break Contract

### Break 1

- seam severed: buildout by illustrative shape, open payload, or tool-default
  guesswork
- expected negative proof: code cannot start lawfully until the named IACS,
  strict lane, and negative-proof surfaces exist and are cited

### Break 2

- seam severed: GTL `M01` code depending on undeclared peer carriers or
  bootstrap/runtime layers
- expected negative proof: the bounded strict lane covers only the `M01` and
  shared validation modules in the first active phase

### Break 3

- seam severed: typed carrier truth erasing at the effect boundary
- expected negative proof: active effect/admission boundaries reject open
  payload bypass and accept only the closed carrier family or named ingress
  parsers

## Completion

Completed on 2026-04-23 by:

- landing the first GTL `M01` TypeScript code slice under the declared
  first-slice carrier law
- making the active bounded strict lane green across contracts, admission,
  algebra, serialization, and shared validation
- proving fail-closed negative ingress on the named open-payload bypasses
- proving module-owned `M01` integration law for composition, substitution,
  recursion, higher-order operators, immutable carrier surfaces, replayable
  governance-hook visibility, and explicit materialization
- exposing stable package-first tenant entrypoints for the bounded root export
  and `./gtl/m01` subpath
- leaving later `M02` publication and ABG runtime waves to successor tickets
  `T-010` and `T-011`
