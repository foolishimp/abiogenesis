# build_tenants/abiogenesis/codex — Design

Codex build — paused partial alternate realization of abiogenesis.

## Status

This tenant is not the canonical released line.
It is retained as a paused comparison and migration surface while `build_tenants/abiogenesis/python/` remains the released realization.

## Governing Truth

Constitutional authority lives in:

- `specification/INTENT.md`
- `specification/GTL_2_CONSTITUTIONAL_DESIGN.md`
- `specification/requirements/`
- `specification/SPEC_METHOD.md`

## Local Design Surface

This tenant keeps local design material only where it materially diverges from the released Python realization or preserves useful comparison history.

`GTL_2_MODULE_DESIGN.md` remains here as a codex-local working copy for comparison and migration, not as shared tenant law.
If a design surface becomes genuinely shared across multiple tenants, it should be promoted into `build_tenants/common/design/`.

## Traceability

Traceability derives from the active 2.x requirement surface.
Live requirement headers carry `Status` and `Category` metadata per `specification/SPEC_METHOD.md`.
ADR-002 refines `REQ-L-GTL2-JOB`, `REQ-L-GTL2-ROLE`, `REQ-L-GTL2-IDENTITY`, `REQ-R-ABG2-WORKER`, `REQ-R-ABG2-BINDING`, and `REQ-R-ABG2-RUN` for the codex realization.
