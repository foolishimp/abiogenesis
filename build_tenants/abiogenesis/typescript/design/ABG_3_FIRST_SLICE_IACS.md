# ABG 3 First Slice IACS

**Status**: Active
**Date**: 2026-04-23
**Derived from**: [TYPESCRIPT_REALIZATION_GUARDRAILS.md](./TYPESCRIPT_REALIZATION_GUARDRAILS.md), [ABG_3_MODULE_DESIGN.md](./ABG_3_MODULE_DESIGN.md), [adrs/ADR-041-runtime-execution-law-is-carrier-and-event-owned.md](./adrs/ADR-041-runtime-execution-law-is-carrier-and-event-owned.md), [adrs/ADR-043-runtime-advancement-uses-execution-basis-and-advancement-transition.md](./adrs/ADR-043-runtime-advancement-uses-execution-basis-and-advancement-transition.md)

## Purpose

Declare the first ABG TypeScript implementation slice as an explicit carrier
inventory so runtime buildout does not recreate controller-owned or effect-edge
semantic centers.

## First Slice Boundary

The first ABG TypeScript code wave is:

- public runtime ingress through one admitted request carrier
- runtime advancement through one admitted basis plus one closed transition
  family
- event emission through one closed runtime event family

This wave does **not** include:

- package/bootstrap orchestration loops
- proxy approval UI/control flow
- downstream stop/status/proof-hold projection families
- qualification harnesses

## Irreducible Architectural Carrier Set

The first ABG code wave is allowed exactly these prime carriers:

1. `StartIntent`
2. `ExecutionBasis`
3. `AdvancementTransition`
4. `RuntimeEvent`

No other top-level carrier is prime in this wave.

## Authority And Role Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
| --- | --- | --- | --- | --- | --- |
| `StartIntent` | `M04-app-bootstrap` | authoritative public ingress | public operator parser | none | `ExecutionBasis` admission |
| `ExecutionBasis` | `M03-engine-kernel` | authoritative admitted runtime basis | `admitExecutionBasis(...)` | none | `AdvancementTransition` derivation |
| `AdvancementTransition` | `M03-engine-kernel` | authoritative runtime step family | `deriveAdvancementTransition(...)` | dispatch / escalation / terminal execution edges | `RuntimeEvent` emission, later projection families |
| `RuntimeEvent` | `M03-engine-kernel` | authoritative runtime fact family | `emit(...)` accepts only this family | canonical event write path | replay, projection, audit |

The first ABG wave has no prime downstream projection carrier. Stop/status/proof
hold/live-status surfaces remain explicitly deferred.

## Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
| --- | --- | --- | --- |
| resolved runtime identity | subordinate | nested basis payload | admitted once into `ExecutionBasis` |
| resolved policy identity | subordinate | nested basis payload | admitted once into `ExecutionBasis` |
| worker / backend refs | subordinate | nested transition payload detail | carried only inside the transition family |
| result artifact refs | subordinate | nested event payload detail | carried only inside `RuntimeEvent` |
| proof observations | subordinate | nested event or transition detail | carried only inside closed event/transition variants |
| retry scheduling detail | subordinate | nested runtime detail, not a prime boundary | carried only inside event/transition variants |
| stop/status/proof-hold projections | deferred | downstream read-model family | later ABG wave |
| yielded continuation projection | deferred | downstream public-runtime family | later ABG wave |

## Effect Boundary Rule

The effect shell does not erase carrier truth.

That means:

- `emit(...)` accepts only `RuntimeEvent` or `readonly RuntimeEvent[]`
- dispatch/transport effect boundaries accept only closed request carriers
  derived from `AdvancementTransition`
- no effect boundary may accept `unknown`, `Record<string, unknown>`, or a
  generic object bag as its normal semantic input
- foreign substrate output may appear as `unknown` only at ingress to a named
  parser/normalizer, never as the argument type of the canonical effect shell

## First Slice Rules

- `ExecutionBasis` and `AdvancementTransition` are the only lawful runtime
  advancement authorities in the first ABG wave.
- Package/bootstrap code may parse `StartIntent`, but it must not derive or
  reinterpret runtime meaning outside the declared carrier family.
- Event truth is carried by `RuntimeEvent`; the effect shell is not an `Any`
  sink.
- A later projection wave may consume these carriers, but it must not recreate
  them procedurally.
