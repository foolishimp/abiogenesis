# build_tenants/abiogenesis/typescript — Design

TypeScript build — in-development alternate realization of abiogenesis.

## Status

This tenant is not the canonical released line.

`build_tenants/abiogenesis/python/` remains the released realization.
This TypeScript tenant starts as a design-first line so packaging, runtime, and
carrier law can be repriced before code is ported.

## Governing Truth

Constitutional authority lives in:

- `build_tenants/common/design/design_surface_map.md`
- `build_tenants/common/design/module_decomp.md`
- `build_tenants/common/design/modules/M04-app-bootstrap.yml`
- `specification/INTENT.md`
- `specification/PRODUCT.md`
- `specification/GTL_3_CONSTITUTIONAL_DESIGN.md`
- `specification/ABG_3_CONSTITUTIONAL_DESIGN.md`
- `specification/requirements/`

Tenant-local authority for this line lives here.

Python remains the released reference implementation.
It is source material for comparison and migration, not the authority that this
tenant is required to mimic file-for-file.

## Governing Runtime Law

For the current TypeScript line, the governing runtime design decisions are:

- [TYPESCRIPT_REALIZATION_GUARDRAILS.md](./TYPESCRIPT_REALIZATION_GUARDRAILS.md)
- [ADR-040](./adrs/ADR-040-typescript-tenant-as-package-first-realization.md)
- [ADR-041](./adrs/ADR-041-runtime-execution-law-is-carrier-and-event-owned.md)
- [ADR-042](./adrs/ADR-042-deterministic-handling-must-not-structurally-block-governed-fp.md)
- [ADR-043](./adrs/ADR-043-runtime-advancement-uses-execution-basis-and-advancement-transition.md)

Read those ADRs first when judging:

- upfront carrier, typing, and governance guardrails
- package artifact versus binary artifact assumptions
- controller versus carrier ownership
- event truth versus controller-local reconstruction
- deterministic-first but F_P-biased fallback law
- whether a seam is lawful delivery binding or an illicit semantic center

For app/bootstrap boundaries, the shared structural baseline is
`build_tenants/common/design/modules/M04-app-bootstrap.yml`.
This tenant may bind that common law to package-first delivery, runtime
shells, and TypeScript entrypoints, but it must not restate a rival bootstrap
doctrine in tenant-local design.

## Design Index

Current tenant-local design truth lives in:

- `PYTHON_TO_TYPESCRIPT_DESIGN_DERIVATION.md`
- `TYPESCRIPT_REALIZATION_GUARDRAILS.md`
- `TYPESCRIPT_STRICT_LANE.md`
- `GTL_3_MODULE_DESIGN.md`
- `GTL_3_FIRST_SLICE_IACS.md`
- `GTL_3_M02_WORK_PUBLICATION_IACS.md`
- `GTL_3_INTERFACE_CONTRACTS.md`
- `GTL_3_STRUCTURAL_CARRIER_DIAGRAM.md`
- `GTL_3_IMPLEMENTATION_PLAN.md`
- `ABG_3_MODULE_DESIGN.md`
- `ABG_3_FIRST_SLICE_IACS.md`
- `ABG_3_M03_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M04_PUBLIC_START_DERIVATION.md`
- `M04_FIRST_SLICE_IACS.md`
- `M04_PUBLIC_START_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M04_CONTROL_LOOP_DERIVATION.md`
- `M04_CONTROL_LOOP_FIRST_SLICE_IACS.md`
- `M04_CONTROL_LOOP_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M02_M03_LOOKUP_AUTHORITY_DERIVATION.md`
- `M02_M03_LOOKUP_AUTHORITY_IACS.md`
- `M02_M03_LOOKUP_AUTHORITY_STRUCTURAL_CARRIER_DIAGRAM.md`
- `adrs/`

The first implementation wave was completed by:

- `.ai-workspace/tickets/completed/T-009-build-the-typescript-tenant-first-slice-under-explicit-carrier-law.md`

`T-009` closed at GTL `M01` only.
The second implementation wave was completed by:

- `.ai-workspace/tickets/completed/T-010-realize-typescript-gtl-m02-work-publication-under-explicit-publication-carrier-law.md`

`T-010` closed at GTL `M02-work-publication` only.
The third implementation wave was completed by:

- `.ai-workspace/tickets/completed/T-011-realize-typescript-abg-first-runtime-slice-under-explicit-execution-event-carrier-law.md`

`T-011` closed at the first ABG runtime steel thread only.
The completed public-start implementation wave is:

- `.ai-workspace/tickets/completed/T-012-realize-typescript-m04-public-start-steel-thread-over-kernel-owned-runtime-law.md`

`T-012` completed the first `M04` public-start implementation wave.
That completed code wave remains intentionally narrow:

- one public start request carrier
- one closed public start outcome family
- one explicit configured runtime or worker identity projection path
- one canonical route into completed `M03` kernel carriers

It does not authorize later `M04` auto/proxy/install/bootstrap widening.

The completed next `M04` control-loop wave is:

- `.ai-workspace/tickets/completed/T-013-realize-typescript-m04-control-modes-over-closed-public-start-outcome-law.md`

`T-013` completed the first bounded `M04` control-loop slice.
Its derivation, first-slice IACS, structural carrier diagram, strict lane, and
module-derived proof lanes are now declared and landed for that completed
control-loop slice.
It still does not authorize event-ingress, result-assessment,
install/bootstrap, bootloader, or sandbox/scenario widening.

No later implementation wave is active yet.
The latest completed cross-boundary cleanup wave is:

- `.ai-workspace/tickets/completed/T-014-reprice-typescript-m02-publication-lookup-and-m03-execution-resolution-under-explicit-lookup-authority.md`

`T-014` owns only the `M02 -> M03` lookup-authority boundary.
Its module-bounded design assets are:

- `M02_M03_LOOKUP_AUTHORITY_DERIVATION.md`
- `M02_M03_LOOKUP_AUTHORITY_IACS.md`
- `M02_M03_LOOKUP_AUTHORITY_STRUCTURAL_CARRIER_DIAGRAM.md`

The TypeScript line will later add qualification and scenario design only when
those surfaces become tenant-local rather than shared or still governed by the
released Python proof line.

For module ownership, shared `M01` to `M06` law remains upstream in
`build_tenants/common/design/`.
This tenant-local design root exists to bind those shared modules to
TypeScript-specific carrier, runtime, and packaging choices without rewriting
their shared structural authority.

## Design Derivation Order

The TypeScript tenant does not build from code-first porting.

The required order is:

1. constitutional `WHAT` in `specification/`
2. released Python design as reference `HOW`
3. TypeScript design mapping in `PYTHON_TO_TYPESCRIPT_DESIGN_DERIVATION.md`
4. module-bounded carrier assets such as IACS documents and structural carrier
   diagrams
5. implementation tickets
6. code

If a proposed TypeScript change cannot point to that chain, it is not yet ready
for implementation.

## Functional Design Stance

The implementation target is TypeScript with hard carrier law:

- discriminated unions for prime runtime and public carrier families
- readonly data carriers at the semantic center
- functional core with explicit effect shells
- parse or validate once at ingress, then carry typed truth inward
- no `any`, no unchecked `as`, and no open JSON trusted past ingress
- package-first distribution, with compiled executable delivery optional rather
  than primary

If a proposed implementation shape depends on mutable service objects, ambient
JSON bags, or controller-owned runtime meaning, it is probably the wrong shape
for this line.

## Current Tenant Consequence

This tenant is intentionally narrow in its first wave:

- establish tenant-local TypeScript design law
- front-load the Python and odd_sdlc failure lessons before code exists
- port the key runtime ADR chain from the Python line
- port the GTL and ABG design surfaces that are truly tenant-local
- delay code until the runtime, packaging, and typing posture are explicit

That keeps the migration inside one lawful re-entry point: `design_reframe`.
