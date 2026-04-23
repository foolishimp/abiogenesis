# GTL 3 Module Design

**Status**: Active
**Date**: 2026-04-23
**Derived from**: [GTL_3_CONSTITUTIONAL_DESIGN.md](../../../../specification/GTL_3_CONSTITUTIONAL_DESIGN.md), [README.md](../../../../specification/requirements/gtl/README.md), [TESTCASE_AUTHORITY.md](../../../../specification/scenarios/TESTCASE_AUTHORITY.md), [module_decomp.md](../../../common/design/module_decomp.md)

## Purpose

Define the current GTL 3 module ownership split, derivation boundary, and
tenant-facing design law for the TypeScript realization line.

This document is design authority for this tenant.
It does not replace the constitution or requirement families.

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
- `REQ-L-GTL3-INTERFACE`
- `REQ-L-GTL3-HOOKS`
- `REQ-L-GTL3-OPERATOR`
- `REQ-L-GTL3-EVALUATOR`
- `REQ-L-GTL3-RULE`
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
- `REQ-L-GTL3-IDENTITY`

## Design Rules

- `specification/` remains constitutional truth
- `specification/scenarios/` carries testcase authority and proving lanes for
  the GTL 3 line
- `build_tenants/common/design/` holds genuinely shared module and
  qualification law
- `build_tenants/abiogenesis/typescript/design/` binds that shared law to the
  TypeScript realization
- GTL owns declaration law; ABG owns runtime enforcement and fact truth
- the published GTL surface remains data-first and runtime-agnostic

## Reference Derivation Rule

The TypeScript GTL line derives from the released Python GTL design through:

- `PYTHON_TO_TYPESCRIPT_DESIGN_DERIVATION.md`
- `GTL_3_FIRST_SLICE_IACS.md`
- `GTL_3_M02_WORK_PUBLICATION_IACS.md`
- `GTL_3_STRUCTURAL_CARRIER_DIAGRAM.md`

That means the TypeScript line is informed by the Python design boundary and
requirement mapping, not by file-for-file porting of Python code shape.

The implementation order for GTL is:

1. TypeScript GTL design
2. GTL module-bounded carrier assets
3. GTL implementation ticket
4. GTL code

If code cannot point back to that chain, it is not a lawful GTL realization
under this tenant.

## Module Schedule

| Module | Owns | Primary requirement families |
| --- | --- | --- |
| `M01-gtl-core` | GTL 3 declaration carriers, graph structure, invariant traversal, operators, evaluators, rules, graph functions, algebra, higher-order operators, and hook attachment surfaces | `REQ-L-GTL3-LANGUAGE`, `REQ-L-GTL3-ATTRS`, `REQ-L-GTL3-CONTEXT`, `REQ-L-GTL3-GRAPH`, `REQ-L-GTL3-NODE`, `REQ-L-GTL3-GRAPHVECTOR`, `REQ-L-GTL3-INTERFACE`, `REQ-L-GTL3-OPERATOR`, `REQ-L-GTL3-EVALUATOR`, `REQ-L-GTL3-RULE`, `REQ-L-GTL3-GRAPHFUNCTION`, `REQ-L-GTL3-HOOKS`, `REQ-L-GTL3-COMPOSE`, `REQ-L-GTL3-SUBSTITUTE`, `REQ-L-GTL3-RECURSE`, `REQ-L-GTL3-HOF`, `REQ-L-GTL3-LAWS`, `REQ-L-GTL3-SELECTION-BOUNDARY`, `REQ-L-GTL3-SUBWORK`, `REQ-L-GTL3-SYNTHESIS`, `REQ-L-GTL3-IDENTITY` |
| `M02-work-publication` | semantic work declarations, graph-function-first callable publication boundaries, authored package publication truth, and replayable discoverability | `REQ-L-GTL3-MODULE`, `REQ-L-GTL3-ROLE`, `REQ-L-GTL3-JOB`, `REQ-L-GTL3-GRAPHFUNCTION`, `REQ-L-GTL3-SELECTION-BOUNDARY`, `REQ-L-GTL3-IDENTITY` |
| `M03-engine-kernel` | ABG runtime interpretation, binding, convergence, provenance, lineage, replay, correction, transport, and self-hosting | `specification/requirements/abg/`, `REQ-M-GTL3-MAPPING`, `REQ-M-GTL3-PROVENANCE` |
| `M04-app-bootstrap` | app-facing orchestration, package entrypoints, runtime identity projection, install/bind surfaces, and operator adapters above the kernel | `REQ-P-POLICY`, `REQ-P-QUAL` |
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
- TypeScript implementation detail must not leak back into GTL publication law

## TypeScript Tenant Consequence

The first GTL code wave is constrained by
[GTL_3_FIRST_SLICE_IACS.md](./GTL_3_FIRST_SLICE_IACS.md).
The completed GTL structural sign-off asset is
[GTL_3_STRUCTURAL_CARRIER_DIAGRAM.md](./GTL_3_STRUCTURAL_CARRIER_DIAGRAM.md).
That first wave is `M01-gtl-core` only. `M02-work-publication` and later GTL
families remain explicitly deferred until the first-slice carrier set is
implemented and the bounded strict lane is green.

The TypeScript line should prefer:

- readonly structural carriers
- stable symbolic ids over object identity
- plain data publication and replay
- runtime-independent serialized shapes

It should reject:

- published hook semantics expressed as raw functions
- controller-local closures as publication truth
- object graphs whose meaning depends on live runtime references
