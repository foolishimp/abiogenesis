# Tenant Registry

`build_tenants/` is the project-owned realization root beneath the shared project specification.

Use it for one-to-many independent implementations of the same constitutional `specification/`.

This file is the canonical registry surface for the project's build tenants.

## Structure

- `common/` holds shared realization/design law adopted across more than one tenant.
- `<family>/<variant>/` holds one concrete tenant realization.

## Registry

Suggested lifecycle states include:

- `In Development`
- `Paused`
- `Released`
- `Deprecated`

| Entry | Kind | Path | Status | Notes |
| --- | --- | --- | --- | --- |
| `common` | shared root | `build_tenants/common/` | Active | Shared realization law across tenants |
| `abiogenesis/python` | variant | `build_tenants/abiogenesis/python/` | Released | Canonical released Python realization of GTL + ABG |
| `abiogenesis/typescript` | variant | `build_tenants/abiogenesis/typescript/` | In Development | Design-first TypeScript realization for package-first enterprise deployment and alternate runtime evaluation; Python remains the released line |
| `abiogenesis/codex` | variant | `build_tenants/abiogenesis/codex/` | Paused | Partial alternate realization retained for migration and comparison; not part of the 1.0 publish gate |
v