# Abiogenesis Common Design Surface Map

**Status**: Active
**Date**: 2026-03-31
**Derived from**: [GTL_2_CONSTITUTIONAL_DESIGN.md](../../../specification/GTL_2_CONSTITUTIONAL_DESIGN.md), [specification/requirements/](../../../specification/requirements/), [build_tenants/common/design/module_decomp.md](./module_decomp.md)

## Purpose

Define the authority boundary for common design surfaces.

This document is structural only.
It does not change runtime behavior or product semantics.

## Classification Rules

- `specification/` remains constitutional truth.
- `build_tenants/common/design/` holds shared capability law that is written generically enough to govern more than one realization.
- `build_tenants/common/design/modules/` is the common source of truth for module interfaces, composition boundaries, capability ownership, and unit-test derivation targets.
- Common design surfaces may reference constitutional truth upward, but they must not depend on downstream tenant realization details.
- Promote a surface into `common` only when its authority no longer depends on one tenant's local implementation wording.

## Active Common Design Law

| Surface | Status | Authority |
| --- | --- | --- |
| `build_tenants/common/design/module_decomp.md` | Active | Shared module ownership, composition, and derivation rules |
| `build_tenants/common/design/modules/` | Active | Shared module-level interfaces, invariants, composition boundaries, and test obligations |
| `build_tenants/common/design/README.md` | Active | Common-design placement and boundary guidance |

These surfaces are the common derivation layer for:

- code ownership
- unit-test obligations
- capability review above realization-specific implementation detail

They currently govern shared design truth for:

- `REQ-L-GTL2-MODULE`
- `REQ-L-GTL2-ENGINE-INDEPENDENCE`
- `REQ-R-ABG2-SELFHOSTING`
- `REQ-P-QUAL`
- `REQ-M-GTL2-MAPPING`

## Placement Rule

Keep a design surface in a realization-specific root when:

- it binds abstract module law to concrete implementation files, or
- it records realization-specific ADRs, scenarios, or qualification detail

Promote a design surface to `common` when:

- it can be stated without tenant-specific implementation references, and
- the same wording remains authoritative across realizations
