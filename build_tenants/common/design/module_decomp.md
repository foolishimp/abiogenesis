# Abiogenesis Module Decomposition

**Status**: Active
**Date**: 2026-03-29
**Derived from**: [GTL_2_CONSTITUTIONAL_DESIGN.md](/Users/jim/src/apps/abiogenesis/specification/GTL_2_CONSTITUTIONAL_DESIGN.md), [specification/requirements/](/Users/jim/src/apps/abiogenesis/specification/requirements/), [build_tenants/abiogenesis/python/design/GTL_2_MODULE_DESIGN.md](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/design/GTL_2_MODULE_DESIGN.md)

## Position

This is the explicit module schedule surface for abiogenesis under the gsdlc method.

It does not replace the deeper tenant design documents.
It extracts the shared module ownership shape from the current GTL 2.x / ABG design so the project has a navigable `design/modules/` layer between requirements and code.

## Design Rules

- `specification/` remains constitutional truth.
- `build_tenants/common/design/` may hold shared tenant-local design law when it is genuinely common across realizations.
- `build_tenants/abiogenesis/python/` remains the canonical released realization.
- `build_tenants/abiogenesis/codex/` remains a paused comparison realization.
- Module decomposition is structural guidance for derivation and ownership; it does not create new runtime behavior.

## Module Schedule

| Module | Owns | Primary requirement families |
| --- | --- | --- |
| `M01-gtl-core` | GTL graph, operator, algebra, and graph-function language semantics | `REQ-L-GTL2-GRAPH`, `REQ-L-GTL2-NODE`, `REQ-L-GTL2-INTERFACE`, `REQ-L-GTL2-OPERATOR`, `REQ-L-GTL2-EVALUATOR`, `REQ-L-GTL2-RULE`, `REQ-L-GTL2-GRAPHFUNCTION`, `REQ-L-GTL2-COMPOSE`, `REQ-L-GTL2-SUBSTITUTE`, `REQ-L-GTL2-RECURSE`, `REQ-L-GTL2-HOF`, `REQ-L-GTL2-LAWS`, `REQ-L-GTL2-SUBWORK`, `REQ-L-GTL2-SYNTHESIS` |
| `M02-work-publication` | GTL job/role/module publication boundary and authored package surface | `REQ-L-GTL2-JOB`, `REQ-L-GTL2-ROLE`, `REQ-L-GTL2-IDENTITY`, `REQ-L-GTL2-MODULE`, `REQ-L-GTL2-SELECTION-BOUNDARY`, `REQ-L-GTL2-ENGINE-INDEPENDENCE` |
| `M03-engine-kernel` | ABG event, projection, binding, lineage, run, convergence, selection, provenance, correction, subwork, transport, interpret, selfhosting | `REQ-R-ABG2-EVENTS`, `REQ-R-ABG2-PROJECTION`, `REQ-R-ABG2-BINDING`, `REQ-R-ABG2-WORKER`, `REQ-R-ABG2-RUN`, `REQ-R-ABG2-LINEAGE`, `REQ-R-ABG2-CONVERGENCE`, `REQ-R-ABG2-SELECTION-APPLICATION`, `REQ-R-ABG2-PROVENANCE`, `REQ-R-ABG2-CORRECTION`, `REQ-R-ABG2-LEAFTASK`, `REQ-R-ABG2-TRANSPORT`, `REQ-R-ABG2-INTERPRET`, `REQ-R-ABG2-SELFHOSTING` |
| `M04-app-bootstrap` | services, CLI, installer, bootloader carrier, runtime bootstrap, project-facing operations, hook-driven auto/proxy loop | `REQ-P-POLICY`, `REQ-P-QUAL` |
| `M05-qualification-scenarios` | sandbox qualification ladder, scenario harnesses, archive proof, scenario validation surfaces | `REQ-P-SCENARIOS`, `REQ-P-QUAL` |
| `M06-mapping-deferred` | deferred capability/mapping/provenance bridge for alternate runtime families | `REQ-M-GTL2-CAPABILITY`, `REQ-M-GTL2-MAPPING`, `REQ-M-GTL2-PROVENANCE` |

## Current Notes

- `M06-mapping-deferred` is not part of the released `abg 1.0` shipping surface.
- The module schedule is shared tenant-local design law because the same conceptual stack currently governs both the canonical Python realization and the paused Codex comparison line.
- Tenant-specific divergence remains documented in the concrete tenant design roots.
- `M04-app-bootstrap` owns the app-level auto loop. The design assumption is that `gen_start()` remains one-step engine progression, while `cli_adapter` owns the iterative `--auto` orchestration, optional runtime hook dispatch for `F_P`, and proxy approval handling for `F_H`.
