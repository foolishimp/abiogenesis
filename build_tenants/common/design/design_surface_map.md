# Abiogenesis Common Design Surface Map

**Status**: Prior-basis evidence; held under T-283
**Date**: 2026-03-31
**Derived from**: [INTENT.md](../../../specification/INTENT.md), [PRODUCT.md](../../../specification/PRODUCT.md), [specification/requirements/](../../../specification/requirements/), [build_tenants/common/design/module_decomp.md](./module_decomp.md)

> **T-283 authority boundary (2026-07-20):** This map and every common module
> design it indexes were derived on the superseded 5.0 basis. None is current
> ABIogenesis 5.0 realization authority. They remain structural evidence for
> the post-closure X-to-5 vector. Current design authority resumes only after a
> replacement direct-GTL design is independently reviewed and accepted.

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

## Prior Common Design Inputs

| Surface | Status | Authority |
| --- | --- | --- |
| `build_tenants/common/design/module_decomp.md` | Held | Prior shared module ownership, composition, and derivation rules |
| `build_tenants/common/design/modules/` | Held | Prior shared module-level interfaces, invariants, composition boundaries, and test obligations |
| `build_tenants/common/design/README.md` | Held | Common-design placement and boundary guidance |

After re-derivation and acceptance, successor surfaces may again become the
common derivation layer for:

- code ownership
- unit-test obligations
- capability review above realization-specific implementation detail

The prior surfaces covered:

- `REQ-L-GTL3-LANGUAGE`
- `REQ-L-GTL3-MODULE`
- `REQ-R-ABG3-RETRY`
- `REQ-R-ABG3-LEAFTASK`
- `REQ-R-ABG3-SELFHOSTING`
- `REQ-P-QUAL`
- `REQ-M-GTL3-MAPPING`

## Placement Rule

Keep a design surface in a realization-specific root when:

- it binds abstract module law to concrete implementation files, or
- it records realization-specific ADRs, scenarios, or qualification detail

Promote a design surface to `common` when:

- it can be stated without tenant-specific implementation references, and
- the same wording remains authoritative across realizations
