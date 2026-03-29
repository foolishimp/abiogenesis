# build_tenants/abiogenesis/codex — Design

Codex build — duplicated V2 design surface.

## ADRs

Governing truth lives in:

- `specification/GTL_2_CONSTITUTIONAL_DESIGN.md` — language + engine boundary
- `specification/requirements/` — 4-layer requirement surface (gtl/abg/mapping/product)

### Local build ADRs

| ADR | Decision | Why it survives |
|-----|----------|----------------|
| ADR-002 | Job / Role / Worker split with immutable WorkSurface | Codex-local realization of the V2 work-model correction |

## Shared duplication

`GTL_2_MODULE_DESIGN.md` is temporarily duplicated here from the Claude build so both stacks can work from the same current V2 target shape until `build_tenants/common/design/` exists.

Where a codex-local ADR conflicts with the duplicated shared design, the codex ADR controls for the codex build.

## Traceability

Traceability derives from the active 2.x requirement surface.
Live requirement headers carry `Status` and `Category` metadata per `specification/SPEC_METHOD.md`.
ADR-002 refines `REQ-L-GTL2-JOB`, `REQ-L-GTL2-ROLE`, `REQ-L-GTL2-IDENTITY`, `REQ-R-ABG2-WORKER`, `REQ-R-ABG2-BINDING`, and `REQ-R-ABG2-RUN` for the codex build.
