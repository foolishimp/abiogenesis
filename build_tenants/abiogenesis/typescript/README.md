# build_tenants/abiogenesis/typescript

TypeScript build tenant for abiogenesis.

## Status

This tenant is in development.

It is a design-first alternate realization of the GTL + ABG product line.
`build_tenants/abiogenesis/python/` remains the canonical released realization.

## Position

This tenant exists to evaluate a TypeScript realization under the same
constitutional specification and shared module law as the released Python line,
while taking advantage of:

- package-first enterprise deployment
- strong discriminated-union carrier design
- runtime portability across Node, Bun, and Deno
- MCP and agent ecosystem alignment

This tenant does not have authority to change constitutional product truth by
itself. It is one realization under the existing `specification/` surface.

## Layout

- `design/` — tenant-local TypeScript design and ADR surface
- `code/` — completed GTL `M01`, completed GTL `M02`, completed ABG `M03`
  steel-thread realization, and future successor waves
- `test_env/` — module-owned `M01`/`M02`/`M03` proof surface and future
  qualification harness

## Latest Completed Waves

The completed public-start wave is:

- `.ai-workspace/tickets/completed/T-012-realize-typescript-m04-public-start-steel-thread-over-kernel-owned-runtime-law.md`

The completed control-loop wave is:

- `.ai-workspace/tickets/completed/T-013-realize-typescript-m04-control-modes-over-closed-public-start-outcome-law.md`

Current landed `M04` public-start scope is still bounded to the first
public-start steel thread only:

- `code/src/app/m04/**`
- one bounded root-package export plus `./app/m04`
- one canonical module-derived unit lane
- one canonical module-owned integration lane
- one fail-closed negative-proof lane

The completed `T-013` code wave is still intentionally narrow:

- `code/src/app/m04/control/**`
- one bounded root-package control-loop export plus `./app/m04/control`
- one canonical module-derived unit lane
- one canonical module-owned integration lane
- one fail-closed negative-proof lane

It still does not authorize event-ingress, result-assessment,
install/bootstrap, bootloader, or sandbox/scenario widening.

No later implementation wave is active yet.
The latest completed cross-boundary cleanup wave is:

- `.ai-workspace/tickets/completed/T-014-reprice-typescript-m02-publication-lookup-and-m03-execution-resolution-under-explicit-lookup-authority.md`

That completed wave was bounded to `M02 -> M03` lookup authority only.
No later TypeScript implementation wave is open yet.

## Governing Truth

Read these first:

- `specification/INTENT.md`
- `specification/PRODUCT.md`
- `specification/requirements/`
- `build_tenants/common/design/design_surface_map.md`
- `build_tenants/common/design/module_decomp.md`
- `build_tenants/abiogenesis/typescript/design/README.md`

Python remains the released reference implementation.
It is source material for this tenant, not constitutional authority over it.
