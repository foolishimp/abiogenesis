# GTL 3 Module Design

**Status**: Active
**Date**: 2026-04-05
**Derived from**: [README.md](../../../../specification/requirements/gtl/README.md), [TESTCASE_AUTHORITY.md](../../../../specification/scenarios/TESTCASE_AUTHORITY.md), [module_decomp.md](../../../common/design/module_decomp.md)

## Purpose

Define the current GTL 3 module ownership split, derivation boundary, and
tenant-facing design law for the shipping python line.

This document is design authority.

It does not replace the requirement families or shared design surfaces.

## Governing Requirement Surfaces

The GTL 3 design line is derived from the live GTL 3 families under
`specification/requirements/gtl/`, in particular:

- `REQ-L-GTL3-LANGUAGE`
- `REQ-L-GTL3-ATTRS`
- `REQ-L-GTL3-CONTEXT`
- `REQ-L-GTL3-GRAPH`
- `REQ-L-GTL3-NODE`
- `REQ-L-GTL3-GRAPHVECTOR`
- `REQ-L-GTL3-GRAPHFUNCTION`
- `REQ-L-GTL3-HOOKS`
- `REQ-L-GTL3-ROLE`
- `REQ-L-GTL3-JOB`
- `REQ-L-GTL3-MODULE`
- `REQ-L-GTL3-COMPOSE`
- `REQ-L-GTL3-SUBSTITUTE`
- `REQ-L-GTL3-RECURSE`
- `REQ-L-GTL3-HOF`
- `REQ-L-GTL3-LAWS`
- `REQ-L-GTL3-SELECTION-BOUNDARY`
- `REQ-L-GTL3-SUBWORK`
- `REQ-L-GTL3-SYNTHESIS`

## Design Rules

- `specification/` remains constitutional truth
- `specification/scenarios/` carries testcase authority and proving lanes for
  the GTL 3 line
- `build_tenants/common/design/` holds genuinely shared module and
  qualification law
- `build_tenants/abiogenesis/python/design/` binds that shared law to the
  shipping python realization
- GTL owns declaration law; ABG owns runtime enforcement and fact truth

## Module Schedule

| Module | Owns | Primary requirement families |
| --- | --- | --- |
| `M01-gtl-core` | GTL 3 declaration carriers, graph structure, invariant traversal, operators, evaluators, rules, graph functions, algebra, higher-order operators, and hook attachment surfaces | `REQ-L-GTL3-LANGUAGE`, `REQ-L-GTL3-ATTRS`, `REQ-L-GTL3-CONTEXT`, `REQ-L-GTL3-GRAPH`, `REQ-L-GTL3-NODE`, `REQ-L-GTL3-GRAPHVECTOR`, `REQ-L-GTL3-INTERFACE`, `REQ-L-GTL3-OPERATOR`, `REQ-L-GTL3-EVALUATOR`, `REQ-L-GTL3-RULE`, `REQ-L-GTL3-GRAPHFUNCTION`, `REQ-L-GTL3-HOOKS`, `REQ-L-GTL3-COMPOSE`, `REQ-L-GTL3-SUBSTITUTE`, `REQ-L-GTL3-RECURSE`, `REQ-L-GTL3-HOF`, `REQ-L-GTL3-LAWS`, `REQ-L-GTL3-SELECTION-BOUNDARY`, `REQ-L-GTL3-SUBWORK`, `REQ-L-GTL3-SYNTHESIS`, `REQ-L-GTL3-IDENTITY` |
| `M02-work-publication` | semantic work declarations, graph-function-first callable publication boundaries, authored package publication truth, and replayable discoverability | `REQ-L-GTL3-MODULE`, `REQ-L-GTL3-ROLE`, `REQ-L-GTL3-JOB`, `REQ-L-GTL3-GRAPHFUNCTION`, `REQ-L-GTL3-SELECTION-BOUNDARY`, `REQ-L-GTL3-IDENTITY` |
| `M03-engine-kernel` | ABG runtime interpretation, binding, convergence, provenance, lineage, replay, correction, transport, and self-hosting | `specification/requirements/abg/`, `REQ-M-GTL3-MAPPING`, `REQ-M-GTL3-PROVENANCE` |
| `M04-app-bootstrap` | app-facing orchestration, installer/bootstrap, runtime identity projection, and CLI-owned loops above the kernel | `REQ-P-POLICY`, `REQ-P-QUAL` |
| `M05-qualification-scenarios` | testcase authority, qualification ladders, sandbox/archive proof, and method trace | `REQ-P-SCENARIOS`, `REQ-P-QUAL`, `REQ-R-ABG3-SELFHOSTING` |
| `M06-mapping-deferred` | alternate-runtime mapping surfaces outside the canonical ABG line | `REQ-M-GTL3-CAPABILITY` |

## GTL 3 Clarifications

- `GraphVector.declarations` is a real GTL 3 transition-governance surface
  owned by `M01-gtl-core`
- `GraphVector` remains internal realized structure; it is not the public
  callable carrier or semantic work-entry target
- `GraphFunction` is the sole public named callable carrier and the semantic
  work-entry surface owned jointly by `M01-gtl-core` and `M02-work-publication`
- governance hooks are attachment points only; hook semantics and policy
  resolution remain engine-owned
- graph-function publication truth stays replayable and inspectable; anonymous
  runtime closures are not the published contract
- stage 6 ABG work may consume GTL 3 hook surfaces, but it must not redefine
  the GTL 3 language
