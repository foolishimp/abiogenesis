# Tenant Registry

`build_tenants/` is the project-owned realization root beneath the shared project specification.

Use it for one-to-many independent implementations of the same constitutional `specification/`.

This file is the canonical registry surface for the project's build tenants.

## Structure

- `common/` holds shared realization/design law adopted across more than one tenant.
- `<family>/<variant>/` holds one concrete tenant realization.

## Registry

Suggested lifecycle states include:

- `Active`
- `Primary Release`
- `In Development`
- `Paused`
- `Released Reference`
- `Deprecated`

| Entry | Kind | Path | Status | Notes |
| --- | --- | --- | --- | --- |
| `common` | shared root | `build_tenants/common/` | Active | Shared realization law across tenants |
| `abiogenesis/typescript` | variant | `build_tenants/abiogenesis/typescript/` | Primary Release | Package-first TypeScript realization is the primary release line for GTL + ABG going forward |
| `abiogenesis/python` | variant | `build_tenants/abiogenesis/python/` | Paused | Released reference line retained for history, comparison, and compatibility evidence; Python work is suspended and is not part of the TS-primary RC gate unless explicitly reactivated |
| `abiogenesis/codex` | variant | `build_tenants/abiogenesis/codex/` | Paused | Partial alternate realization retained for migration and comparison; not part of the 1.0 publish gate |
