# ABG Common Delivery Library First Slice IACS

**Status**: Completed
**Date**: 2026-04-24
**Derived from**: [ABG_COMMON_DELIVERY_LIBRARY_DERIVATION.md](./ABG_COMMON_DELIVERY_LIBRARY_DERIVATION.md), [ABG_3_MODULE_DESIGN.md](./ABG_3_MODULE_DESIGN.md), [M04_INSTALL_BOOTSTRAP_FIRST_SLICE_IACS.md](./M04_INSTALL_BOOTSTRAP_FIRST_SLICE_IACS.md), [T-028](../../.ai-workspace/tickets/completed/T-028-realize-a-tenant-local-abg-common-delivery-library-for-installed-root-plans-verification-and-instruction-file-injection.md)

## Purpose

Declare the first tenant-local ABG common delivery library as an explicit
shared delivery carrier inventory so delivery-boundary mechanics can be reused
without promoting them into a rival product/runtime boundary.

## Common Delivery Library First Slice Boundary

The first common delivery-library wave is:

- one reusable delivery plan family
- one reusable delivery verification family
- one reusable delivery writer interface
- one reusable instruction-file injection contract/result family
- one reusable materialize/verify helper surface

This wave does **not** include:

- bootloader content doctrine
- installed package identity doctrine
- runtime semantic carriers
- package-manager execution

## Irreducible Architectural Carrier Set

The first common delivery-library wave is allowed exactly these prime carrier
families:

1. `DeliveryPlan`
2. `DeliveryVerification`
3. `InstructionInjectionContract`
4. `InstructionInjectionResult`

## Authority And Role Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
| --- | --- | --- | --- | --- | --- |
| `DeliveryPlan` | common delivery library | authoritative reusable delivery-plan family | derived from admitted delivery carriers in the owning module | delivery writer only | `T-019`, later `T-020` |
| `DeliveryVerification` | common delivery library | authoritative reusable delivery verification family | derived from materialized delivery truth only | none | `T-019`, later `T-020` |
| `InstructionInjectionContract` | common delivery library | authoritative reusable instruction-file injection carrier | admitted once at the owning delivery boundary | none | later `T-020` |
| `InstructionInjectionResult` | common delivery library | authoritative reusable injection result family | derived from admitted contract plus file content | delivery writer only | later `T-020` |

## Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
| --- | --- | --- | --- |
| `DeliveryDirectoryRef` | subordinate | nested delivery artifact detail | constructed only as part of `DeliveryPlan` |
| `DeliveryFileRef` | subordinate | nested delivery artifact detail | constructed only as part of `DeliveryPlan` |
| `DeliveryWriter` | subordinate effect-edge | reusable effect interface, not a semantic carrier family | supplied explicitly by the owning module |
| `InjectionMarkers` | subordinate | nested marker pair detail, not a prime carrier | admitted only as part of `InstructionInjectionContract` |
| `InstructionFileRef` | subordinate | nested file target detail | admitted only as part of `InstructionInjectionContract` |

## First Slice Rules

- the common delivery library remains delivery-only and cannot restate runtime
  or constitutional meaning
- owning module tickets admit product-specific delivery truth before calling
  the library
- the library may materialize and verify only the delivery plan it is given
- instruction-file injection must be explicit, idempotent, and marker-bound

## Promotion Rule

No subordinate payload may be promoted during the first delivery-library wave
unless:

1. it acquires independent public authority,
2. it crosses more than one consumer boundary unchanged, and
3. the promotion is recorded here and in `T-028` before code lands.
