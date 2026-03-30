# Common Tenant Design

This directory is reserved for shared capability design law.

Most active design authority lives either in:

- `specification/` for constitutional language and engine law, or
- realization-specific design roots outside `common`

Promote material into `build_tenants/common/design/` only when it has become true shared realization law across multiple realizations.

## Shared Design Surface Map

The current shared-vs-tenant classification lives in:

- `build_tenants/common/design/design_surface_map.md`

Use that surface to decide whether a design artifact belongs in:

- `build_tenants/common/design/` as shared capability law, or
- a realization-specific design root as local implementation detail


## Shared Module Surfaces

The shared module schedule for abiogenesis lives in:

- `build_tenants/common/design/module_decomp.md`
- `build_tenants/common/design/modules/`

These surfaces make the module layer explicit between requirements and concrete tenant code without changing runtime behavior.
