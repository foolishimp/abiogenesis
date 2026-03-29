# Common Build-Tenant Surfaces

`build_tenants/common/` is the shared realization root for tenant-local material that is genuinely common across more than one tenant.

It is intentionally narrow.

Use this surface only when a realization rule, design surface, or supporting asset is actually shared across multiple tenants.
Do not promote tenant-specific implementation detail into `common/` just because two tenants look similar today.

Current shared roots:

- `build_tenants/common/design/`
- `build_tenants/common/qualification/`
