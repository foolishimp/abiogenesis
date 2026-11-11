# M06 Mapping Deferred Trigger IACS

**Status**: Completed
**Date**: 2026-04-24
**Derived from**: [M06_MAPPING_DEFERRED_DERIVATION.md](./M06_MAPPING_DEFERRED_DERIVATION.md), [REMAINING_TYPESCRIPT_FORWARD_DERIVATION_PLAN.md](./REMAINING_TYPESCRIPT_FORWARD_DERIVATION_PLAN.md), [T-023](../../.ai-workspace/tickets/completed/T-023-adjudicate-typescript-m06-mapping-deferred-trigger-boundary-under-explicit-deferred-only-law.md)

## Purpose

Declare the dormant TypeScript `M06-mapping-deferred` boundary as an explicit
trigger inventory so alternate-runtime mapping cannot appear without a lawful
design and ticket re-entry.

## M06 Dormant Boundary

The current TypeScript `M06` line is:

- one dormancy record
- one activation trigger family
- no executable runtime or proof lane

This wave does **not** include:

- alternate runtime implementations
- mapping adapters
- transport bridges
- shipping-line tests

## Irreducible Architectural Carrier Set

The deferred `M06` line is allowed exactly these prime design carriers:

1. `M06DormancyRecord`
2. `M06ActivationTrigger`

These are design-owned boundary carriers only.
They do not authorize code.

## Authority And Role Matrix

| Carrier | Owning surface | Role | Ingress boundary | Effect boundary | Downstream consumers |
| --- | --- | --- | --- | --- | --- |
| `M06DormancyRecord` | TypeScript design root | authoritative dormant-boundary statement | design adjudication only | none | future ticket authors, reviewers |
| `M06ActivationTrigger` | TypeScript design root | authoritative activation condition family | design adjudication only | none | future ticket authors, reviewers |

## Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
| --- | --- | --- | --- |
| `AlternateRuntimeCandidate` | subordinate | candidate naming detail nested under the trigger family | appears only inside `M06ActivationTrigger` |
| `CanonicalBlockerRef` | subordinate | explains why canonical `M03`/`M04`/`M05` cannot absorb the need | appears only inside `M06ActivationTrigger` |
| `RequiredFutureAssetRef` | subordinate | future derivation/IACS/proof asset checklist only | appears only inside `M06ActivationTrigger` |
| executable mapping carriers | deferred | no alternate runtime family is active | successor ticket only |
| `test_m06*` proof lanes | deferred | shared law says no shipping-line tests while dormant | successor ticket only |

## Dormancy Rules

- `M06DormancyRecord` is the only lawful current truth for the TypeScript
  tenant while the canonical ABG line remains sufficient.
- `M06ActivationTrigger` is the only lawful way to move beyond dormancy.
- no executable `M06` code or tests may open until a successor ticket
  supersedes `T-023`.
- activation is unlawful unless the successor explicitly names:
  - one alternate runtime family,
  - the canonical blocker that prevents absorption into `M03`/`M04`/`M05`,
  - one derivation asset,
  - one structural carrier diagram, and
  - one module-derived proof lane set.

## Explicit Activation Trigger Statement

`M06` activates only when one named alternate runtime family is intentionally
opened and the TypeScript tenant can show that the need cannot be lawfully
absorbed by canonical `M03`, `M04`, or `M05`.

## Promotion Rule

No subordinate payload may be promoted during the dormant `M06` wave unless a
successor ticket first supersedes this deferred-only adjudication and records
the promotion in a new `M06` design pack.
