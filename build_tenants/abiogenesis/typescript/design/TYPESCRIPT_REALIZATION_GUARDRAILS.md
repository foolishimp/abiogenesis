# TypeScript Realization Guardrails

**Status**: Active
**Date**: 2026-04-23
**Derived from**: `/Users/jim/src/apps/specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md`, `/Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/completed/B-040-close-half-typed-public-start-carrier-family-under-python-typing-and-carrier-set-law.md`, `/Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/completed/B-042-stop-governance-surfaces-from-drifting-into-builder-strategy-law.md`, [README.md](./README.md), [ABG_3_MODULE_DESIGN.md](./ABG_3_MODULE_DESIGN.md), [GTL_3_IMPLEMENTATION_PLAN.md](./GTL_3_IMPLEMENTATION_PLAN.md)

## Purpose

This document exists to force the TypeScript tenant to start with the lessons
already paid for in the Python and odd_sdlc lines.

It is a pre-code design guardrail surface.
The TypeScript line is not allowed to rediscover these failures by shipping a
half-typed carrier family, a controller-owned semantic center, or a
framework-owned builder strategy layer.

## Governing Position

The TypeScript tenant must satisfy all of the following from the start:

- design law from `DESIGN_MODULE_METHOD.md`
- carrier-closure law learned in `B-040`
- governance-versus-builder-boundary law learned in `B-042`

This document is binding tenant-local design law for the TypeScript line.

## Overriding Evaluators

These evaluators are closure-gating for every TypeScript design and code slice.

If a change improves type-checker output or runtime ergonomics but fails any
evaluator below, it does not count as real progress.

### 1. Authority Seam Closure

Every changed line must reduce the number of truth surfaces.

For the TypeScript line, that means:

- one authoritative carrier at each semantic boundary
- no controller-side reconstruction
- no raw JSON or open object being trusted past ingress
- no package entrypoint, CLI wrapper, or runtime adapter acting as a rival
  semantic center

### 2. Essential Carrier Consolidation

The realization must collapse each slice down to the few real
identity-bearing carrier families.

For the TypeScript line, that means:

- declare the irreducible architectural carrier set first
- keep subordinate payloads subordinate
- do not create fragment interfaces or helper result types just to satisfy the
  checker
- do not mirror one carrier with many branch-local peer types without a real
  authority boundary

### 3. Typed Enforcement After Proof

Strong typing is there to lock in a seam that has already been made real.

For the TypeScript line, that means:

- parse or validate first
- narrow unions explicitly
- use types to enforce the proved shape
- do not use `any`, unchecked `as`, dynamic object mutation, or
  object-with-optional-fields shells as fake closure

## Irreducible Architectural Carrier Set Law

Before a TypeScript code slice starts, that slice must declare:

1. the **Irreducible Architectural Carrier Set**
2. which carriers are authoritative and which are downstream
3. which shapes remain **Subordinate Payloads**
4. which Subordinate Payloads, if any, are promoted and why

The TypeScript tenant must not start from:

- one interface per payload fragment
- one discriminated union per local convenience
- one public result family whose payload is still an open object

The minimum acceptable sequence is:

1. declare the Python-to-TypeScript derivation asset for the active boundary
2. declare the carrier set
3. declare the role matrix
4. declare the subordinate payload register
5. declare the structural carrier diagram
6. declare the strict typing lane
7. derive implementation and unit tests from that module boundary
8. only then implement and close

## TypeScript Typing Law

The TypeScript line must be fully typed at the semantic center.

That means:

- `strict` mode is mandatory
- semantic carriers are closed and typed
- runtime facts, public projections, admitted execution carriers, and persisted
  contracts are not open object bags
- `unknown` is allowed only at ingress
- ingress payloads must be parsed or validated once, then collapsed into local
  typed carriers

The following do **not** count as typed semantic design:

- `any`
- unchecked `as`
- `Record<string, unknown>` or index-signature bags used as authoritative
  carrier truth
- optional-field shells that stand in for a closed discriminated family
- open JSON passed through multiple layers and interpreted by property checks,
  fallback access, or controller-local repair

The preferred shape is:

- discriminated unions for public outcome and transition families
- readonly carrier objects
- explicit parser/normalizer functions at ingress
- exhaustive `never` checking at union decision points
- `satisfies` for shape verification where it preserves narrowness

## Authority And Role Matrix Requirement

Every prime carrier family in the TypeScript line must declare:

- carrier name
- owning module
- role: authoritative or downstream
- ingress boundary
- effect boundary
- projection consumers

If a role matrix is absent, the carrier family is not design-complete.

## Subordinate Payload Register Requirement

Every non-prime shape must end in one of three states:

- subordinate and nested/private
- promoted with explicit Promotion Test justification
- deferred explicitly to a successor wave

The TypeScript line must not silently promote row fragments, field groups, or
branch-local payload detail into peer top-level interfaces.

## Strict Typing Lane Requirement

Before claiming the first code slice is healthy, the TypeScript tenant must
define one bounded strict typing lane covering the active semantic slice.

That lane must prove:

- no semantic `any`
- no semantic open-object carrier truth
- no unchecked `as` in the semantic center
- no local suppression comments as the normal path to green
- exhaustiveness checking on discriminated unions

Green by wrapper or cast does not count.

The current lane definition must be ratified in
`TYPESCRIPT_STRICT_LANE.md` before implementation starts.

## Governance And Observability Boundary

The TypeScript line is a GTL + ABG realization.
It is not a replacement agentic builder.

It may publish:

- runtime facts
- route eligibility
- preservation pressure
- unmet requirement or gap pressure
- lawful edit frontier
- lawful proof frontier
- prior-turn or prior-run continuity
- admitted policy identity and provenance

It must not publish:

- imperative builder strategy
- “inspect shallow work first”
- “prefer deepening”
- “widen only when”
- retry budgets
- turn counters
- gain rules
- depth scores
- any equivalent framework-owned replacement for builder judgment

If the TypeScript line needs to preserve a preference such as deepening versus
expansion, it must publish that as governance/read-model truth or route
eligibility, not as imperative builder instruction.

## Package And Runtime Boundary

The TypeScript line is package-first.

That means:

- package entrypoints are delivery bindings
- runtime choice is shell/binding detail
- Node, Bun, and Deno are below the semantic center

Package code may:

- parse input
- normalize runtime bindings
- invoke lawful engine entry surfaces
- publish projections

Package code may not:

- own runtime meaning
- repair open payload truth procedurally
- become the hidden owner of convergence or closure

## Banned Failure Shapes

The TypeScript line must reject these shapes immediately:

- typed envelope over open payload
- object round-trip ceremony (`fromObject(...).toObject()`) that leaves the
  same open truth authoritative
- controller-side reconstruction from raw runtime output
- one fragment interface per JSON branch
- entrypoint-owned convergence or closure law
- strategy-bearing runtime contexts that tell the builder how to repair
- a second local adapter path beside the declared authoritative ingress path

## Structural Sign-Off Requirement

Every active TypeScript module boundary must publish one Mermaid UML structural
carrier diagram before implementation starts.

That diagram must show:

- prime carriers
- subordinate payloads
- effect-edge-only payloads
- deferred families
- authoritative versus downstream role
- public versus module-local visibility

The TypeScript line may not use code or tests as the first place where that
structure becomes visible.

## Module-Derived Unit Test Requirement

Unit tests in this tenant must derive from module authority, not from code
shape.

That means the canonical unit-test lane for an active boundary must derive
from:

- the governing module design
- the active IACS
- the active structural carrier diagram
- the requirement families owned by the module

It must not derive primarily from:

- helper names
- private implementation decomposition
- branch-local convenience seams
- mocks that hide the active module contract

Helper-level tests may still exist.
They are not the authoritative proof surface for a module boundary.

## Pre-Code Gate

No initial TypeScript code wave is lawful until all of the following are true:

- [ ] the TypeScript slice names its Python-to-TypeScript derivation asset
- [ ] the TypeScript slice names its irreducible architectural carrier set
- [ ] the TypeScript slice names its authoritative/downstream role matrix
- [ ] the TypeScript slice names its subordinate payload register
- [ ] the TypeScript slice names one module-bounded structural carrier diagram
- [ ] the TypeScript slice names one bounded strict typing lane
- [ ] the TypeScript slice names one module-derived unit-test lane
- [ ] the TypeScript slice names its governance-versus-builder boundary
- [ ] the TypeScript slice names its package/runtime boundary
- [ ] the TypeScript slice names one negative-proof fixture that constructs an
      open payload outside the carrier family and proves fail-closed ingress

## Review Questions

1. Did this change reduce the number of truth surfaces?
2. Did this change derive the target boundary from Python design to
   TypeScript design to module assets before code?
3. Did this change keep the carrier family prime, or did it inflate the
   boundary?
4. Did this change validate first and type second, or type first and trust
   later?
5. Did this change publish a structural carrier diagram that still matches the
   live IACS and visibility split?
6. Did this change derive the canonical unit-test lane from module ownership
   rather than code shape?
7. Did this change keep package and adapter code below the semantic center?
8. Did this change preserve governance and observability without drifting into
   builder strategy law?
