# Abiogenesis Tenant Family

This family groups concrete realizations of the abiogenesis project under one shared constitutional `specification/`.

## Current Variants

- `typescript/` — primary package-first TypeScript release realization of GTL + ABG
- `python/` — paused released reference realization retained for history,
  comparison, and compatibility evidence
- `codex/` — paused partial alternate realization retained for comparison and migration

## Boundaries

- shared cross-tenant material belongs in `build_tenants/common/`
- tenant-specific realization detail belongs in the relevant variant root
- constitutional truth remains in `specification/`

## Current Posture

At this stage of migration, `typescript/` is the primary release line.
`python/` is paused and no longer part of the active RC gate.
`codex/` is informative and comparative, but is not part of the release gate.
