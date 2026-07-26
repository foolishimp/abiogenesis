# Abiogenesis Module Decomposition

**Status**: Prior-basis evidence; held under T-284 pending vector classification
**Date**: 2026-03-29
**Derived from**: [INTENT.md](../../../specification/INTENT.md), [PRODUCT.md](../../../specification/PRODUCT.md), [specification/requirements/](../../../specification/requirements/)

> **T-283 authority boundary (2026-07-20):** This decomposition was derived on
> the superseded execution basis and is not current 5.0 design authority. It is
> retained for the X-to-5 census. A successor decomposition must derive the
> non-lowering GTL validator, direct HoG traversal, ABG runtime admission, and
> thin public shells from the closed T-283 constitution.

## Position

This was the explicit module schedule surface for ABIogenesis on the prior
basis.

It does not replace the deeper tenant design documents.
It extracts the shared module ownership shape from the active GTL 3 / ABG 3 requirement families so the project has a navigable `design/modules/` layer between requirements and code.
When re-derived and accepted, modules will again own:

- detailed public interfaces
- composition boundaries
- capability ownership
- decoupling rules
- unit-test derivation targets

## Design Rules

- `specification/` remains constitutional truth.
- `build_tenants/common/design/` holds shared capability law that is genuinely common across realizations.
- Module decomposition is structural guidance for derivation and ownership; it does not create new runtime behavior.
- The implementation target is functional-design discipline across realizations:
  immutable value carriers, symbolic publication, functional core, and explicit
  effect interpreters at the shell.
- Recursive graph-function zoom/materialize/fold-back must remain lawful value transformation with explicit lineage and provenance, not interpreter-side mutation.
- `design/modules/` is the common derivation layer for code and unit tests. If module specs are too weak to derive tests without invention, the module layer is not complete.

## Module Schedule

| Module | Owns | Primary requirement families |
| --- | --- | --- |
| `M01-gtl-core` | GTL language identity, declaration carriers, graph/operator/algebra semantics, graph-function law, and transition-governance surfaces | `REQ-L-GTL3-LANGUAGE`, `REQ-L-GTL3-ATTRS`, `REQ-L-GTL3-CONTEXT`, `REQ-L-GTL3-GRAPH`, `REQ-L-GTL3-NODE`, `REQ-L-GTL3-GRAPHVECTOR`, `REQ-L-GTL3-INTERFACE`, `REQ-L-GTL3-OPERATOR`, `REQ-L-GTL3-EVALUATOR`, `REQ-L-GTL3-RULE`, `REQ-L-GTL3-GRAPHFUNCTION`, `REQ-L-GTL3-HOOKS`, `REQ-L-GTL3-COMPOSE`, `REQ-L-GTL3-SUBSTITUTE`, `REQ-L-GTL3-RECURSE`, `REQ-L-GTL3-HOF`, `REQ-L-GTL3-LAWS`, `REQ-L-GTL3-SUBWORK`, `REQ-L-GTL3-SYNTHESIS`, `REQ-L-GTL3-SELECTION-BOUNDARY`, `REQ-L-GTL3-IDENTITY` |
| `M02-work-publication` | GTL job/role/module publication boundary, graph-function discoverability, and authored package surface | `REQ-L-GTL3-JOB`, `REQ-L-GTL3-ROLE`, `REQ-L-GTL3-IDENTITY`, `REQ-L-GTL3-MODULE`, `REQ-L-GTL3-GRAPHFUNCTION`, `REQ-L-GTL3-SELECTION-BOUNDARY` |
| `M03-engine-kernel` | ABG event, projection, binding, worker/runtime separation, lineage, run, graph-call, frame, continuation, convergence, policy resolution, selection, canonical graph-function materialization, provenance, correction, retry/repair, subwork, transport, interpret, selfhosting | `REQ-R-ABG3-EVENTS`, `REQ-R-ABG3-PROJECTION`, `REQ-R-ABG3-BINDING`, `REQ-R-ABG3-WORKER`, `REQ-R-ABG3-JOB-WORKER`, `REQ-R-ABG3-RUN`, `REQ-R-ABG3-GRAPHCALL`, `REQ-R-ABG3-FRAME`, `REQ-R-ABG3-CONTINUATION`, `REQ-R-ABG3-LINEAGE`, `REQ-R-ABG3-CONVERGENCE`, `REQ-R-ABG3-POLICY`, `REQ-R-ABG3-SELECTION-APPLICATION`, `REQ-R-ABG3-PROVENANCE`, `REQ-R-ABG3-CORRECTION`, `REQ-R-ABG3-RETRY`, `REQ-R-ABG3-LEAFTASK`, `REQ-R-ABG3-TRANSPORT`, `REQ-R-ABG3-INTERPRET`, `REQ-R-ABG3-SELFHOSTING`, `REQ-M-GTL3-MAPPING`, `REQ-M-GTL3-PROVENANCE` |
| `M04-app-bootstrap` | services, CLI, installer, bootloader carrier, runtime bootstrap, project-facing operations, hook-driven auto/proxy loop | `REQ-P-POLICY`, `REQ-P-QUAL` |
| `M05-qualification-scenarios` | sandbox qualification ladder, scenario harnesses, archive proof, scenario validation surfaces | `REQ-P-SCENARIOS`, `REQ-P-QUAL`, `REQ-R-ABG3-SELFHOSTING` |
| `M06-mapping-deferred` | deferred capability and alternate-runtime mapping bridge for non-ABG runtime families | `REQ-M-GTL3-CAPABILITY` |

## Prior-Basis Notes

- `M03-engine-kernel` owns canonical ABG graph-function materialization and graph-derived bundle provenance.
- `M03-engine-kernel` owns generic retry/repair governance, including fresh
  attempt identity, current-state prompt/manifest regeneration, bounded retry
  budgets, stationary-failure stop/escalation, and continuation repair linkage.
- `M03-engine-kernel` also owns recursive zoom/materialize/fold-back protocol, including evaluator-bundle derivation from refined structure when the refined boundary declares deterministic proof surfaces.
- `M01-gtl-core`, `M02-work-publication`, and `M03-engine-kernel` are the prime derivation modules for the current code wave. Their interfaces, invariants, and test obligations must be explicit enough that implementation does not invent semantics.
- `M06-mapping-deferred` applies only to alternate runtime families and is not part of the canonical engine kernel.
- `M04-app-bootstrap` owns app-level orchestration above one-step engine
  progression. The shared law is structural: the app layer may own iterative
  auto/proxy control flow, but it must not absorb kernel semantics or become a
  rival semantic center.
- `M04-app-bootstrap` also owns runtime identity projection and configured worker resolution from the runtime contract. Worker, build, backend, and authority provenance must stay explicit rather than collapsing into one default build label.
- `M01-gtl-core` owns `GraphVector.declarations` as the transition-governance declaration surface. ABG runtime policy resolution remains outside this module.
- `M02-work-publication` owns symbolic graph-function publication. Published graph-function truth must be inspectable and replayable without depending on anonymous closures or ambient module state.
