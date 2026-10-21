# M04 Bootloader First Slice IACS

**Status**: Completed
**Date**: 2026-04-24
**Derived from**: [M04_BOOTLOADER_DERIVATION.md](./M04_BOOTLOADER_DERIVATION.md), [ABG_COMMON_DELIVERY_LIBRARY_FIRST_SLICE_IACS.md](./ABG_COMMON_DELIVERY_LIBRARY_FIRST_SLICE_IACS.md), [M04_INSTALL_BOOTSTRAP_FIRST_SLICE_IACS.md](./M04_INSTALL_BOOTSTRAP_FIRST_SLICE_IACS.md), [T-020](../../.ai-workspace/tickets/completed/T-020-realize-typescript-m04-bootloader-and-project-facing-delivery-operations-under-explicit-bootloader-law.md)

## Purpose

Declare the next TypeScript `M04-app-bootstrap` slice as an explicit
bootloader/project-facing delivery carrier inventory so bootloader document
output and instruction-file injection stay explicit, idempotent, and below
kernel semantics.

## M04 Bootloader First Slice Boundary

The first TypeScript bootloader wave is:

- one admitted public bootloader delivery request carrier
- one bounded delivery plan for the bootloader document
- one bounded instruction-file injection route
- one closed public bootloader delivery outcome family

This wave does **not** include:

- install root planning
- package-manager execution
- runtime execution
- live sandbox/archive proof
- public asset-addressing

## Irreducible Architectural Carrier Set

The first TypeScript bootloader wave is allowed exactly these prime carrier
families:

1. `PublicBootloaderRequest`
2. `PublicBootloaderOutcome`

## Authority And Role Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
| --- | --- | --- | --- | --- | --- |
| `PublicBootloaderRequest` | `M04-app-bootstrap` | authoritative public bootloader ingress | package/bootloader parser | none | bootloader delivery route |
| `PublicBootloaderOutcome` | `M04-app-bootstrap` | authoritative public bootloader delivery outcome family | derived from admitted request plus explicit delivery/injection verification | delivery writer only | later installed sandbox and project-facing delivery checks |

## Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
| --- | --- | --- | --- |
| `BootloaderDocumentContract` | subordinate | nested bootloader document truth, not a prime carrier | admitted once into `PublicBootloaderRequest` |
| `InstructionTargetRef` | subordinate | nested instruction-file target detail | admitted once into `PublicBootloaderRequest` |
| `DeliveryPlan` | subordinate shared carrier | reusable delivery library carrier, not an `M04` prime carrier | derived once from admitted request |
| `InstructionInjectionContract` | subordinate shared carrier | reusable injection carrier, not an `M04` prime carrier | derived once from admitted request |
| `BootloaderVerification` | subordinate | nested verification detail, not a separate public carrier family | derived from delivery + injection truth only |
| `PublicBootloaderInstalled` | prime family variant | explicit public outcome variant, not a separate outer carrier family | pattern-matched as part of `PublicBootloaderOutcome` |
| `PublicBootloaderRejected` | prime family variant | explicit public outcome variant, not a separate outer carrier family | pattern-matched as part of `PublicBootloaderOutcome` |

## First Slice Rules

- `PublicBootloaderRequest` is the only lawful public ingress carrier for the
  first bootloader slice
- bootloader content is explicit input truth and is not read implicitly from
  the workspace
- instruction-file injection is explicit, marker-bound, and idempotent
- bootloader delivery remains verification-only over upstream truth and does
  not restate kernel or constitutional meaning

## Promotion Rule

No subordinate payload may be promoted during the first bootloader wave unless:

1. it acquires independent public authority,
2. it crosses more than one module boundary unchanged, and
3. the promotion is recorded here and in `T-020` before code lands.
