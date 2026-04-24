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

The latest completed implementation wave is:

- `.ai-workspace/tickets/completed/T-026-realize-typescript-m03-governed-fp-transport-and-result-artifact-protocol-under-explicit-transport-law.md`

That completed wave is bounded to late `M03` transport/result protocol law
under `code/src/abg/m03/transport/**`.
The completed common-library wave is:

- `.ai-workspace/tickets/completed/T-027-realize-a-tenant-local-abg-common-realization-library-for-expectation-derivation-contract-carriers-and-module-derived-proof-helpers.md`

That completed wave is bounded to `code/src/shared/abg_library/**` and exists so
later waves can consume reusable realization carriers and proof helpers rather
than rebuilding them locally.
The latest completed cross-boundary cleanup wave is:

- `.ai-workspace/tickets/completed/T-014-reprice-typescript-m02-publication-lookup-and-m03-execution-resolution-under-explicit-lookup-authority.md`

That completed wave was bounded to `M02 -> M03` lookup authority only.
The completed next product-facing TypeScript waves are:

- `.ai-workspace/tickets/completed/T-016-realize-typescript-m04-event-ingress-over-the-canonical-kernel-emission-surface.md`
- `.ai-workspace/tickets/completed/T-017-realize-typescript-m04-result-assessment-ingress-over-canonical-result-ingest-law.md`
- `.ai-workspace/tickets/completed/T-018-realize-typescript-m04-live-status-projection-over-explicit-runtime-projection-law.md`
- `.ai-workspace/tickets/completed/T-019-realize-typescript-m04-install-bootstrap-under-package-first-installed-runtime-law.md`
- `.ai-workspace/tickets/completed/T-020-realize-typescript-m04-bootloader-and-project-facing-delivery-operations-under-explicit-bootloader-law.md`
- `.ai-workspace/tickets/completed/T-025-realize-typescript-m04-public-asset-addressing-through-a-published-operator-asset-registry.md`

Those completed waves now cover:

- bounded event-ingress for app-owned `approved`, `revoked`, and `reset`
  command ingress over canonical kernel emission
- bounded result-assessment ingress for `assessed{kind: fp}` over canonical
  ingest truth
- bounded live-status projection over admitted public/runtime carriers only
- bounded install/bootstrap delivery over explicit installed-runtime plans and
  verification
- bounded bootloader and instruction-file delivery over explicit marker-bound
  project-facing delivery law
- bounded public asset-addressing over one published operator asset registry
  and governing graph-function owner

The completed common-delivery-library wave is:

- `.ai-workspace/tickets/completed/T-028-realize-a-tenant-local-abg-common-delivery-library-for-installed-root-plans-verification-and-instruction-file-injection.md`

That completed wave is bounded to `code/src/shared/abg_delivery_library/**`
and exists so later delivery-facing waves consume reusable plan, verification,
writer, and instruction-injection carriers instead of rebuilding them locally.

`T-022` completed the installed-sandbox, live-lane, and archive-proof
qualification wave.
`T-023` completed the dormant `M06` trigger boundary, so no later TypeScript
implementation wave is active.

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
