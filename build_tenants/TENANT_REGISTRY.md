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
| `abiogenesis/python` | variant | `build_tenants/abiogenesis/python/` | Paused | Released reference line retained for history, comparison, and compatibility evidence only; do not update Python docs, bootloaders, tests, or installer surfaces for current GTL/ABG product changes unless this tenant is explicitly reactivated |
| `abiogenesis/codex` | variant | `build_tenants/abiogenesis/codex/` | Paused | Partial alternate realization retained for migration and comparison; not part of the 1.0 publish gate |

## Maintenance Rule

Current GTL/ABG product and installer-facing repairs are owned by the
`abiogenesis/typescript` primary release line plus shared `specification/` and
`build_tenants/common/` authority surfaces. Paused tenant trees remain historical
reference evidence. Do not use a paused tenant as the source of current
installer, bootstrap, or public operator truth unless its status is changed here
first.
