# Project Requirements

This directory already contains the live abiogenesis requirement surface.

The active requirement families are grouped by constitutional domain:

- `gtl/` — GTL 3 language and graph law
- `abg/` — Abiogenesis engine/runtime law
- `mapping/` — GTL-to-runtime mapping and provenance law
- `product/` — product policy, qualification, and scenario law

Use [SPEC_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/SPEC_METHOD.md) as the process constitution when writing or revising these files.

## Rules

- Keep live requirement families as separate `*.md` files under the appropriate domain folder.
- Use deterministic REQ headers inside each family file.
- Preserve the split between constitutional truth in `specification/` and realization detail in `build_tenants/`.
- Treat `build_tenants/abiogenesis/typescript/` as the primary release
  realization, `build_tenants/abiogenesis/python/` as a paused released
  reference line, and `build_tenants/abiogenesis/codex/` as a paused partial
  alternate realization unless explicitly repriced.

## Active Requirement Domains

| Domain | Path | Scope |
| --- | --- | --- |
| GTL | `specification/requirements/gtl/` | language semantics, graph law, jobs, roles, operators, identity, epistemic notation over ratified ontology |
| ABG | `specification/requirements/abg/` | engine transport, binding, run model, projection, provenance, convergence |
| Mapping | `specification/requirements/mapping/` | bridge law between GTL constitutional surfaces and runtime realization |
| Product | `specification/requirements/product/` | policy, qualification, and end-to-end scenario obligations |
