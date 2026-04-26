# Abiogenesis Tenant Family

This family groups concrete realizations of the abiogenesis project under one shared constitutional `specification/`.

## Current Variants

- `python/` — canonical released realization of GTL + ABG
- `typescript/` — active package-first TypeScript RC candidate and research-lab
  proving line
- `codex/` — paused partial alternate realization retained for comparison and migration

## Boundaries

- shared cross-tenant material belongs in `build_tenants/common/`
- tenant-specific realization detail belongs in the relevant variant root
- constitutional truth remains in `specification/`

## Current Posture

At this stage of migration, `python/` remains the released reference line.
`typescript/` is the active RC candidate line.
`codex/` is informative and comparative, but is not part of the release gate.
