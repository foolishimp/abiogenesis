# Self-Review: T-277 PC-006 Capability Disposition

**Scope**: live capability-authority audit and T-268 prospective design

**Closure claim**: PC-006 needs no new commonization code; independent review
of the disposition and design remains pending

## Finding

The original census assumed static capability assets were hand-authored and a
future tenant manifest would introduce another roster. The live source does
not support the first half of that claim:

- `DS1_CAPABILITY_CONTRACT_REGISTER` owns current capability IDs and required
  contract edges
- `buildDs1PublicationFoundation` derives capability asset bytes and catalog
  rows from that register
- product verification derives its capability ID roster and required-contract
  rows from the same register
- the checked-in capability assets and public catalog are generated outputs

Creating a new capability graph would duplicate the existing Prime carrier.
PC-006 is therefore corrected from `migrate_authority` to `consume_existing`.

## Prospective Constraint

T-268 must extend the existing register with the smallest typed dependency,
effect-binding, and manifest-projection fields it needs. It may not author a
manifest-only capability roster. Public catalog admission, tenant-manifest
admission, and T-255 coverage judgment remain separate authorities.

The current `abg.capability.fh.interact@5` identity is outside the mandatory
16-row requirement roster. The design stops rather than silently retaining it
as row 17 or relabeling it.

## Proportionality

| Measure | Result |
|---|---:|
| New runtime or commonization modules | 0 |
| Current capability authoring graphs | 1 |
| Target capability authoring graphs | 1 |
| Required public capability identities | 16 |

This is a debt-prevention design, not a code-growth checkpoint.
