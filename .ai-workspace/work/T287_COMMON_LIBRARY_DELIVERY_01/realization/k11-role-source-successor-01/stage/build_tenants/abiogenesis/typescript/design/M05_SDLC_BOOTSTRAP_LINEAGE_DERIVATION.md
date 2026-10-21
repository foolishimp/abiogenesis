# M05 SDLC Bootstrap Lineage Derivation

**Status**: Active
**Date**: 2026-04-26
**Purpose**: Derive an idealized TypeScript `M05-qualification-scenarios`
proof for the foundational SDLC primitive:
`BootstrapInputSet -> Project`, with derived-element lineage joined to ABG
runtime provenance.

## 1. Source Material

This boundary derives from:

- `specification/INTENT.md`
- `specification/PRODUCT.md`
- `specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md`
- `specification/requirements/gtl/REQ-L-GTL3-OPERATOR.md`
- `specification/requirements/gtl/REQ-L-GTL3-COMPOSE.md`
- `specification/requirements/abg/`
- `build_tenants/abiogenesis/typescript/design/M03_GRAPH_FUNCTION_ITERATION_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M03_GRAPH_FUNCTION_ITERATION_FIRST_SLICE_IACS.md`
- `build_tenants/abiogenesis/typescript/design/M03_GRAPH_FUNCTION_ITERATION_STRUCTURAL_CARRIER_DIAGRAM.md`
- `build_tenants/abiogenesis/typescript/design/M05_QUALIFICATION_DERIVATION.md`
- `odd_sdlc/.ai-workspace/comments/codex/20260425T213136Z_STRATEGY_odd_sdlc_abg_boundary_and_module_topology.md`
- `odd_sdlc/build_tenants/python/code/odd_sdlc/software_domain_catalog.py`
- `odd_sdlc/build_tenants/python/code/odd_sdlc/normalization.py`
- `odd_sdlc/build_tenants/python/code/odd_sdlc/project_profile.py`
- `odd_sdlc/build_tenants/python/code/odd_sdlc/constructor.py`
- `T-063`

## 2. Position

This slice is not an SDLC.TS tenant and not a Python SDLC port.

It is a bounded TypeScript proof that the lower SDLC bootstrap primitive can be
expressed without imperative workspace reconstruction:

```text
GF_BOOTSTRAP_PROJECT:
  BootstrapInputSet -> Project
```

`BootstrapInputSet` is typed ingress over weak source material. It may carry
unstructured, loosely structured, and structured inputs. The type states that
the payload is a governed ingress envelope; it does not pretend the source data
is already a well-formed project.

`Project` is the typed target entity. It carries project identity, authority
candidate elements, ambiguity observations, and a derivation ledger.

## 3. Authority Split

GTL owns:

- the graph-function carrier
- the typed source and target nodes
- the declared operator/evaluator bindings

ABG owns:

- execution basis admission
- vector traversal and transition truth
- event/projection provenance
- deterministic traversal-structure probing

SDLC owns:

- what a project means
- what a derived project element means
- how source material maps to semantic project elements
- asset-level and element-level derivation lineage

This proof must not add SDLC semantics to ABG runtime carriers.

## 4. Required Proof

The proof must show:

- one closed ingress carrier for bootstrap source material
- one graph function with the outer contract `BootstrapInputSet -> Project`
- one runtime provenance reference derived from ABG traversal truth
- one typed project derived from the admitted input set
- asset-level lineage from input set to project asset
- element-level lineage from source input refs to derived project elements
- ambiguity entries for insufficiently anchored source material

The proof must answer two questions:

```text
Why does this Project element exist?
Which source input produced this Project element?
```

## 5. Non-Goals

This slice does not implement:

- filesystem inventory
- workspace normalization
- Python constructor behavior
- SDLC ticket creation
- Gap/Triage workflow
- live F_P dispatch
- SDLC.TS public app surfaces

Those remain successor work after the bootstrap-lineage primitive is proved.

## 6. Required Next Assets

Before implementation closure, this derivation must be followed by:

- `M05_SDLC_BOOTSTRAP_LINEAGE_FIRST_SLICE_IACS.md`
- `M05_SDLC_BOOTSTRAP_LINEAGE_STRUCTURAL_CARRIER_DIAGRAM.md`
- one module-owned unit test lane in `test_surface_map.md`
