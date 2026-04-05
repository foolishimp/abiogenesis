# Abiogenesis Module Decomposition

**Status**: Active
**Date**: 2026-03-29
**Derived from**: [GTL_3_CONSTITUTIONAL_DESIGN.md](/Users/jim/src/apps/abiogenesis/specification/GTL_3_CONSTITUTIONAL_DESIGN.md), [specification/requirements/](/Users/jim/src/apps/abiogenesis/specification/requirements/)

## Position

This is the explicit module schedule surface for abiogenesis under the gsdlc method.

It does not replace the deeper tenant design documents.
It extracts the shared module ownership shape from the current GTL 3 / ABG design so the project has a navigable `design/modules/` layer between requirements and code.
At this level, modules are the common source of truth for:

- detailed public interfaces
- composition boundaries
- capability ownership
- decoupling rules
- unit-test derivation targets

## Design Rules

- `specification/` remains constitutional truth.
- `build_tenants/common/design/` holds shared capability law that is genuinely common across realizations.
- Module decomposition is structural guidance for derivation and ownership; it does not create new runtime behavior.
- The implementation target is Python with Scala-style discipline: immutable value types, symbolic publication, functional core, and explicit effect interpreters at the shell.
- Recursive graph-function zoom/materialize/fold-back must remain lawful value transformation with explicit lineage and provenance, not interpreter-side mutation.
- `design/modules/` is the common derivation layer for code and unit tests. If module specs are too weak to derive tests without invention, the module layer is not complete.

## Module Schedule

| Module | Owns | Primary requirement families |
| --- | --- | --- |
| `M01-gtl-core` | GTL language identity, declaration carriers, graph/operator/algebra semantics, graph-function law, and transition-governance surfaces | `REQ-L-GTL3-LANGUAGE`, `REQ-L-GTL3-ATTRS`, `REQ-L-GTL3-CONTEXT`, `REQ-L-GTL3-GRAPH`, `REQ-L-GTL3-NODE`, `REQ-L-GTL3-GRAPHVECTOR`, `REQ-L-GTL3-INTERFACE`, `REQ-L-GTL3-OPERATOR`, `REQ-L-GTL3-EVALUATOR`, `REQ-L-GTL3-RULE`, `REQ-L-GTL3-GRAPHFUNCTION`, `REQ-L-GTL3-HOOKS`, `REQ-L-GTL3-COMPOSE`, `REQ-L-GTL3-SUBSTITUTE`, `REQ-L-GTL3-RECURSE`, `REQ-L-GTL3-HOF`, `REQ-L-GTL3-LAWS`, `REQ-L-GTL3-SUBWORK`, `REQ-L-GTL3-SYNTHESIS`, `REQ-L-GTL3-SELECTION-BOUNDARY`, `REQ-L-GTL3-IDENTITY` |
| `M02-work-publication` | GTL job/role/module publication boundary, graph-function discoverability, and authored package surface | `REQ-L-GTL3-JOB`, `REQ-L-GTL3-ROLE`, `REQ-L-GTL3-IDENTITY`, `REQ-L-GTL3-MODULE`, `REQ-L-GTL3-GRAPHFUNCTION`, `REQ-L-GTL3-SELECTION-BOUNDARY` |
| `M03-engine-kernel` | ABG event, projection, binding, lineage, run, convergence, selection, canonical graph-function materialization, companion-bundle derivation, provenance, correction, subwork, transport, interpret, selfhosting | `REQ-R-ABG2-EVENTS`, `REQ-R-ABG2-PROJECTION`, `REQ-R-ABG2-BINDING`, `REQ-R-ABG2-WORKER`, `REQ-R-ABG2-RUN`, `REQ-R-ABG2-LINEAGE`, `REQ-R-ABG2-CONVERGENCE`, `REQ-R-ABG2-SELECTION-APPLICATION`, `REQ-R-ABG2-PROVENANCE`, `REQ-R-ABG2-CORRECTION`, `REQ-R-ABG2-LEAFTASK`, `REQ-R-ABG2-TRANSPORT`, `REQ-R-ABG2-INTERPRET`, `REQ-R-ABG2-SELFHOSTING`, `REQ-M-GTL2-MAPPING`, `REQ-M-GTL2-PROVENANCE` |
| `M04-app-bootstrap` | services, CLI, installer, bootloader carrier, runtime bootstrap, project-facing operations, hook-driven auto/proxy loop | `REQ-P-POLICY`, `REQ-P-QUAL` |
| `M05-qualification-scenarios` | sandbox qualification ladder, scenario harnesses, archive proof, scenario validation surfaces | `REQ-P-SCENARIOS`, `REQ-P-QUAL` |
| `M06-mapping-deferred` | deferred capability and alternate-runtime mapping bridge for non-ABG runtime families | `REQ-M-GTL2-CAPABILITY` |

## Current Notes

- `M03-engine-kernel` owns canonical ABG graph-function materialization and graph-derived bundle provenance.
- `M03-engine-kernel` also owns recursive zoom/materialize/fold-back protocol, including evaluator-bundle derivation from refined structure when the refined boundary declares deterministic proof surfaces.
- `M01-gtl-core`, `M02-work-publication`, and `M03-engine-kernel` are the prime derivation modules for the current code wave. Their interfaces, invariants, and test obligations must be explicit enough that implementation does not invent semantics.
- `M06-mapping-deferred` applies only to alternate runtime families and is not part of the canonical engine kernel.
- `M04-app-bootstrap` owns the app-level auto loop. The design assumption is that `gen_start()` remains one-step engine progression, while `cli_adapter` owns the iterative `--auto` orchestration, optional runtime hook dispatch for `F_P`, and proxy approval handling for `F_H`.
- `M04-app-bootstrap` also owns runtime identity projection and configured worker resolution from the runtime contract. Worker, build, backend, and authority provenance must stay explicit rather than collapsing into one default build label.
- `M01-gtl-core` owns `GraphVector.declarations` as the transition-governance declaration surface. ABG runtime policy resolution remains outside this module.
- `M02-work-publication` owns symbolic graph-function publication. Published graph-function truth must be inspectable and replayable without depending on anonymous closures or ambient module state.
