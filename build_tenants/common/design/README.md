# Common Tenant Design

This directory is reserved for shared tenant-local design law.

At the current migration stage, most active design authority still lives either in:

- `specification/` for constitutional language and engine law, or
- the concrete tenant design surfaces under `build_tenants/abiogenesis/<variant>/design/`

Promote material into `build_tenants/common/design/` only when it has become true shared realization law across multiple tenants.


## Shared Module Surfaces

The shared module schedule for abiogenesis lives in:

- `build_tenants/common/design/module_decomp.md`
- `build_tenants/common/design/modules/`

These surfaces make the module layer explicit between requirements and concrete tenant code without changing runtime behavior.
