# B-012 Align ABG Default Identity Creation And Detection With IDENTITY_METHOD

- id: B-012
- title: Tighten ABG identity compliance around constitutional truth, optimistic construction, and deterministic assurance
- type: bug
- status: completed
- goal: identity-foundation
- change_intent: Preserve all current live identities as lawful current truth while tightening ABG identity compliance around explicit constitutional identity law, optimistic semantic-asset construction, deterministic identity assurance, foundational tests, and lawful starter defaults.
- change_class: realization_refactor
- re_entry_point: realized_surface
- priority: high
- intake_source: IDENTITY_METHOD.md ratified 2026-04-17; odd_sdlc B-014 regression investigation 2026-04-17; operator direction 2026-04-17
- affected_boundary: ABG default identity generators, identity readers/detectors, ABG default identity helpers, foundational qualification tests
- governing_protocol: T-007
- triaged_at: 2026-04-17
- created_at: 2026-04-17
- updated_at: 2026-04-18
- completed_at: 2026-04-18

## Closeout Authority

`B-012` is complete for the ABIogenesis-owned identity surface.

This ticket closes the ABG-side identity foundation as a realized-surface
refactor over the identity interfaces that ABIogenesis actually owns:

- runtime / engine / worker / backend identity
- runtime-contract identity input parsing
- provenance-bound executable/spec identity
- conflict detection between explicit identity truth and reporting projection

### Delivered And Accepted Here

1. ABIogenesis runtime identity is explicit and structured through
   `RuntimeIdentity` rather than inferred from loose text or mixed reporting
   fields.
2. Runtime-contract identity reading is explicit and prefixed; unprefixed
   convenience keys do not silently become identity authority.
3. Scope/runtime projection preserves declared identity without reinjecting
   implicit defaults that would overwrite current truth.
4. Explicit build truth conflicts fail closed instead of silently merging.
5. Provenance hashing remains deterministic and separate from semantic domain
   identity construction.

Code anchors:

- [identity.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/identity.py:1)
- [cli_adapter.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/cli_adapter.py:595)
- [services.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/services.py:109)
- [interpret.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/interpret.py:208)
- [provenance.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/provenance.py:74)

### Explicit Non-Claims

This ticket does **not** claim that ABIogenesis owns or should detect every
domain-semantic identity kind.

In particular, the following are not part of ABIogenesis runtime identity
authority and therefore are not blockers for closing this ticket:

- downstream `requirement_family` readers
- downstream `acceptance_criterion` readers
- domain-semantic id extraction from authored artifacts

Those remain domain-owned surfaces and should be handled in the owning domain
rather than in ABIogenesis runtime.

### Proof

Green for the ABIogenesis-owned identity surface:

- `test_cli_adapter_auto.py`: `20 passed`
- `test_m03_engine_kernel_integration.py`: `109 passed`

These tests cover:

- runtime identity binding and projection
- prefixed runtime-contract identity parsing
- ignoring unprefixed identity fields
- conflict rejection for explicit build truth
- preservation of router vs selected execution identity through traversal

## Governing Protocol

This ticket is governed by
[T-007](/Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/active/T-007-govern-core-interface-migrations-with-inside-out-no-bridge-protocol.md)
for any scope that changes a core identity interface family.

`B-012` remains explicitly not a renaming wave, but if identity creation,
detection, admission, or identity-reading contracts change at core ABIogenesis
boundaries, this ticket must follow the same inside-out no-bridge migration
rule.

## Context

`IDENTITY_METHOD.md` now makes the shared law explicit:

- identity is scoped, typed, and made unique by hierarchy
- existing readable ids are lawful if they are already unique in scope
- ABG may publish default identity formats for its own runtime and starter
  helper surfaces
- derived domains may override those defaults
- regex extraction from prose is not a complete identity model

Late review also exposed three higher-risk gaps that this refactor must now
cover at implementation level:

- recursive/self-hosting scope must not collapse authored source truth,
  installed builder substrate, and development-product instances into one
  implicit authority bucket
- ABG defaults for domain-semantic surface kinds must remain inert starter
  helpers until a domain explicitly adopts them
- baseline identity work should use method-neutral language rather than
  graph/runtime shorthand

The point of this refactor is not allocator centralization.

The exercise is to:

- establish disambiguated constitutional truth for identity
- review current implementation against that truth
- identify non-compliant or weak paths
- add foundational compliance tests
- install correct default helper behavior

For semantic domain assets, optimistic construction remains the intended model:

- `F_P` may construct candidate semantic identities during asset creation
- `F_D` must deterministically assure their conformance before admission
- engine-owned allocation remains appropriate for runtime/system identities such
  as events, runs, graph calls, and continuations

The immediate regression in odd_sdlc (`B-014`) exposed the deeper problem:
identity detection is still being inferred ad hoc from broad text matching,
which lets grouping labels and concrete executable identities bleed into each
other.

This ticket is **not** a migration or renaming wave.

The rule for this refactor is:

1. all current live identities remain accepted as lawful current truth
2. new identity creation must be conformant
3. identity detection must be conformant

The work starts in abiogenesis because ABG starter helper surfaces and their
qualification tests are the foundation that downstream domains inherit or
override.

## Why This Is A Realization Refactor

This ticket does not intend to reprice current project goals, intent, product,
or requirement truth.

It asserts:

- no current live ids are being invalidated
- no current constitutional object set is being renamed
- the change is in how ABG creates, validates, and detects identity by default
- the change must prove no upstream drift while removing implementation-level
  ambiguity

So the lawful re-entry is the realized surface: default identity readers,
normalizers, generators, and qualification tests.

## Problem Statement

Current implementation patterns still allow identity law to drift into:

- broad regex extraction
- implicit string-shape assumptions
- scope collapse between recursive product contexts such as:
  - authored source project
  - installed builder substrate
  - development product or workspace instance
- conflation between identity kinds such as:
  - `requirement`
  - `requirement_family`
  - `acceptance_criterion`

They also leave ABG without a clear compliance boundary between:

- optimistic semantic identity construction
- deterministic identity detection
- deterministic identity admission
- lawful starter defaults vs domain-adopted identity law

That is non-conformant with the new method even if existing ids themselves are
already unique and therefore lawful current truth.

## Required Direction

Abiogenesis must publish and prove a default identity foundation that:

- accepts existing lawful ids without forced migration
- allows optimistic semantic identity construction for domain assets
- detects existing ids using explicit kind-aware readers or validators
- admits newly-constructed semantic identities only after deterministic
  conformance checks pass
- makes recursive scope explicit where the same readable value can exist in:
  - source project truth
  - install truth
  - development-product truth
- keeps default ABG identity conventions overrideable by derived domains
- treats ABG starter defaults for domain-semantic identities as convenience
  helpers until a domain explicitly adopts them
- makes identity qualification tests foundational rather than incidental
- clearly separates:
  - engine-owned runtime/system identity
  - domain-semantic identity created during construction
  - identity assurance and admission

## Acceptance

- no current live ABG, GTL, or downstream test identities are renamed or
  invalidated solely by this refactor
- ABG identity law is explicit enough to audit creation, detection, and
  admission separately
- runtime/system identity creation remains engine-owned where appropriate
- semantic identity construction is allowed to remain optimistic for domain
  assets
- ABG default identity detection does not rely on broad regex mining as the
  full identity model
- deterministic identity assurance exists for new semantic identities before
  they are admitted as lawful current truth
- recursive/self-hosting identity detection distinguishes at least:
  - source project scope
  - install scope
  - development-product or workspace scope
- grouping identities and concrete executable identities are distinguishable by
  default, including at least:
  - `requirement`
  - `requirement_family`
  - `acceptance_criterion`
- ABG starter defaults for domain-semantic identities are implemented as
  adoptable helpers, not substrate-imposed identity law
- baseline identity tests exist and are treated as foundational coverage for
  identity creation, detection, and admission
- the tests prove that:
  - existing lawful ids still pass
  - newly-constructed semantic ids can be admitted lawfully when conformant
  - non-conformant semantic ids fail closed at deterministic assurance
  - detection does not collapse source/install/development-product scopes
  - detection does not collapse family ids into concrete ids
  - detection does not collapse acceptance criteria into requirement ids
- derived-domain override points remain possible without patching engine
  runtime truth

## Non-Goals

- renaming the current requirement, ADR, scenario, or runtime id populations
- enforcing one global human-readable string format across all domains
- preventing derived domains from publishing their own identity overrides
- treating provisional regex extraction as permanently lawful identity
  authority
- smuggling graph/runtime shorthand into the baseline identity method as if it
  were method-neutral constitutional terminology
- forcing engine allocation of semantic identities that are lawfully
  constructed by probabilistic asset-building lanes

## Suggested Work Plan

1. Inventory current ABG identity paths and classify them as:
   - engine-owned runtime/system identity
   - semantic identity construction
   - semantic identity detection
   - semantic identity admission
2. Review each path against `IDENTITY_METHOD.md` and mark it as:
   - compliant
   - tolerated current truth
   - non-compliant or under-specified
3. Make recursive-product scope explicit in the identity model for any surface
   where the same readable value may appear in source, install, and
   development-product contexts.
4. Publish explicit default identity kinds and their readers/validators for
   the starter surfaces ABG owns directly, and keep those defaults inert until
   adopted by a domain.
5. Replace broad regex-owned detection where it currently acts as the real
   identity model.
6. Define deterministic assurance checks for newly-constructed semantic
   identities so conformant candidates are admitted and non-conformant
   candidates fail closed.
7. Add or tighten foundational identity qualification tests so compliance is
   proved before downstream domain tests.
8. Confirm that downstream domains can still override defaults lawfully.

## Links

- `/Users/jim/src/apps/specification_methodology/specification/standards/IDENTITY_METHOD.md`
- `/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md`
- `/Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/active/B-014-stop-requirement-closure-register-from-emitting-family-header-ids.md`
