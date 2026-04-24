# ABG Common Realization Library First Slice IACS

**Status**: Active
**Date**: 2026-04-24
**Derived from**: [ABG_COMMON_REALIZATION_LIBRARY_DERIVATION.md](./ABG_COMMON_REALIZATION_LIBRARY_DERIVATION.md), [M03_TRANSPORT_PROTOCOL_FIRST_SLICE_IACS.md](./M03_TRANSPORT_PROTOCOL_FIRST_SLICE_IACS.md), [M04_CONTROL_LOOP_FIRST_SLICE_IACS.md](./M04_CONTROL_LOOP_FIRST_SLICE_IACS.md), [ABG_3_MODULE_DESIGN.md](./ABG_3_MODULE_DESIGN.md), [TYPESCRIPT_REALIZATION_GUARDRAILS.md](./TYPESCRIPT_REALIZATION_GUARDRAILS.md)

## Purpose

Declare the first tenant-local ABG common realization library slice as an
explicit reusable carrier inventory so expectation derivation, nested
contract/policy shaping, and proof-helper profiles stop being rebuilt locally
inside every `M03` or `M04` wave.

## First Slice Boundary

The first library slice is:

- one reusable `DispatchExpectation` family derived from admitted upstream
  carrier truth
- one reusable `AgentTransportContract` family with nested explicit
  `SanitizedEnvironmentPolicy`
- one reusable `ProofFixtureProfile` family for module-derived published-work
  and runtime-context setup

This slice does **not** include:

- public product carriers
- runtime event or transition truth
- app/bootstrap public outcome families
- shared/common propagation
- generic code-generation templates

## Irreducible Architectural Carrier Set

The first library slice is allowed exactly these prime carrier families:

1. `DispatchExpectation`
2. `AgentTransportContract`
3. `ProofFixtureProfile`

No other top-level carrier is prime in this slice.

## Authority And Role Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
| --- | --- | --- | --- | --- | --- |
| `DispatchExpectation` | `shared/abg_library` | authoritative reusable expectation family | module-owned adapters deriving from closed upstream carriers | none | `M03` transport, later `M04` consumers that need dispatch expectation truth |
| `AgentTransportContract` | `shared/abg_library` | authoritative reusable nested contract/policy family | module-owned adapters selecting transport policy from closed runtime truth | transport shells execute only consuming module carriers that embed this family | `M03` transport, later event-ingress or installed-runtime transport adapters |
| `ProofFixtureProfile` | `shared/abg_library` | authoritative reusable proof-helper profile family | named module-derived fixture builders only | none | `M03` and `M04` module-owned tests |

## Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
| --- | --- | --- | --- |
| `SanitizedEnvironmentPolicy` | subordinate | nested policy detail of `AgentTransportContract` | admitted only inside the transport contract family |
| `DispatchAssessmentExpectation` | subordinate | nested detail of expected fulfillment identities | carried only inside `DispatchExpectation` |
| `PublishedWorkFixture` | subordinate | nested profile detail describing published work setup | carried only inside `ProofFixtureProfile` |
| `RuntimeFixtureContext` | subordinate | nested profile detail describing runtime and policy setup | carried only inside `ProofFixtureProfile` |
| module-owned adapters | subordinate | consuming module detail, not library-owned truth | realized once per consumer module |
| shared/common propagation hooks | deferred | wider propagation boundary outside this tenant-local first slice | later ticket only |
| generic cross-language fixture schema | deferred | would widen beyond the first TypeScript tenant-local library slice | later ticket only |

## First Slice Rules

- Library carriers are pure realization carriers. They are not public product
  truth and may not become rival runtime or app authority.
- `DispatchExpectation` is derived only from closed upstream carriers admitted
  by the consuming module.
- `AgentTransportContract` keeps contract/policy detail explicit and nested;
  ambient shell conventions are not lawful substitutes.
- `ProofFixtureProfile` exists to reduce duplication in module-derived tests.
  It must not make tests derive from code shape instead of module authority.
- Consuming modules retain ownership of their semantic truth and expose only
  their own public carriers.
- The library remains tenant-local and must not silently propagate into
  `build_tenants/common/`.

## Promotion Rule

No subordinate payload may be promoted during the first library wave unless:

1. it acquires independent public or persisted authority,
2. it crosses more than one module boundary unchanged, and
3. the promotion is recorded here and in `T-027` before code lands.
