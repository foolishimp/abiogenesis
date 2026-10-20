# build_tenants/abiogenesis/typescript

TypeScript build tenant for abiogenesis.

## Status

This tenant is the primary release line.

It is the package-first realization of the GTL + ABG product line.
`build_tenants/abiogenesis/python/` is retained as a paused released reference
line, not as an active RC gate.

## Position

This tenant realizes the current primary release under the same constitutional
specification and shared module law, while taking advantage of:

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
`T-023` completed the dormant `M06` trigger boundary.

The latest completed audit wave is:

- `.ai-workspace/tickets/completed/T-029-audit-typescript-installed-sandbox-and-live-lane-proof-against-the-python-reference-tests-at-equivalent-feature-coverage.md`

`T-029` completed the feature-equivalence audit over the completed `M05`
installed sandbox, live-lane, and archive proof surfaces.
It did not open a new implementation boundary.
Its follow-up parity waves are now all completed:

- `T-030` archive writer/finalizer parity
- `T-031` installed live scenario portfolio parity
- `T-032` installed reset/postmortem parity

The latest completed implementation follow-up wave is:

- `.ai-workspace/tickets/completed/T-030-realize-typescript-m05-installed-run-archive-writer-and-postmortem-finalization-proof-under-explicit-archive-finalization-law.md`

`T-030` completed the bounded `M05` archive-finalization slice over the
completed delivery library and installed qualification line.
That completed slice now gives the tenant:

- one canonical archive writer/finalizer
- one downstream builder from finalized archive output into archive
  qualification
- one real-output archive-proof integration lane
- one fail-closed archive-finalization negative lane

The latest completed implementation follow-up wave is:

- `.ai-workspace/tickets/completed/T-031-realize-typescript-m05-installed-live-scenario-portfolio-parity-against-the-python-sandbox-live-reference-line.md`

`T-031` completed the bounded `M05` installed live-portfolio slice over the
completed installed qualification line.
That completed slice now gives the tenant:

- one explicit installed live scenario portfolio over the five Python live
  scenario families
- one portfolio qualification boundary over scenario mode, stage breadth,
  authority refs, event evidence, and final run status
- one installed portfolio integration lane
- one fail-closed installed portfolio negative lane

The latest completed implementation follow-up wave is:

- `.ai-workspace/tickets/completed/T-032-realize-typescript-m05-installed-reset-postmortem-parity-over-canonical-reset-and-continuation-law.md`

`T-032` completed the bounded `M05` installed reset-postmortem slice over the
completed installed qualification line.
That completed slice now gives the tenant:

- one explicit installed reset-postmortem qualification boundary
- one repriced parity proof for `run_superseded` over accepted reset and live
  run truth
- one repriced parity proof for `continuation_abandoned` over accepted reset
  and non-fulfilled assessment provenance
- one installed reset-postmortem integration lane
- one fail-closed installed reset-postmortem negative lane

## Governing Truth

Read these first:

- `specification/INTENT.md`
- `specification/PRODUCT.md`
- `specification/requirements/`
- `build_tenants/common/design/design_surface_map.md`
- `build_tenants/common/design/module_decomp.md`
- `build_tenants/abiogenesis/typescript/design/README.md`

Python remains paused reference evidence.
It is source material for comparison and migration, not constitutional authority
over this tenant and not an active release gate while paused.
