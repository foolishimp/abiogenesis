# Tenant Registry

This is an optional human-readable companion to the canonical
`how.build_tenants` bindings in the Product's `stdo_<label>.json` definition.

The Product Definition Overlay owns build-tenant identity and location. Keep
this table consistent with that JSON or generate it from the definition. This
file must not become a second tenant registry.

`build_tenants/` is the default project-owned realization root beneath the
shared project specification. An existing project may bind another layout.

Use build tenancy for one-to-many independent implementations of the same
constitutional `WHAT`.

The bound `WHAT` is singleton Product truth. The bound build tenants are
many-valued realization structure beneath it.

## Structure

- `common/` is the default location for shared realization/design law adopted
  across more than one tenant.
- `<family>/<variant>/` is the recommended default location for one concrete
  tenant realization. Single-label paths such as `<variant>/` and other
  definition-bound layouts are also lawful.

## Shared Surface

When `how.common` is non-empty, list those shared realization references here
for readers. `common` is not itself a build tenant and must not appear as a
tenant identity.

## Registry

Suggested lifecycle states include:

- `Planned`
- `In Development`
- `Paused`
- `Released`
- `Deprecated`

| Entry | Kind | Path | Status | Notes |
| --- | --- | --- | --- | --- |
| `<tenant-id-uri>` | `<family>/<variant>` | `build_tenants/<family>/<variant>/` | Planned | Replace with the current tenant candidates for this project |

Record the currently active realization focus explicitly in the table notes or
an adjacent short section when more than one tenant exists. The entry identity
must match the corresponding `how.build_tenants[].id`.
