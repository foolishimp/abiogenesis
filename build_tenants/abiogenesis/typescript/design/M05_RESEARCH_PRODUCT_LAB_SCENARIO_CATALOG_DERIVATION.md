# M05 Research Product Lab Scenario Catalog Derivation

**Status**: Active
**Date**: 2026-04-26
**Purpose**: Bind the research scenario catalog to TypeScript qualification and
future SDLC.TS proof lanes.

## Source Material

- `specification/requirements/product/REQ-P-SCENARIOS.md`
- `specification/scenarios/09-research-product-lab-scenario-catalog.md`
- `M05_QUALIFICATION_DERIVATION.md`
- `M05_SDLC_BOOTSTRAP_LINEAGE_DERIVATION.md`
- `M05_DATA_MAPPER_REAL_INGRESS_PROOF_DERIVATION.md`
- `odd_sdlc.python` source material:
  - `software_domain_catalog.py`
  - `function_catalog.py`
  - `program_catalog.py`
  - `constructor.py`
  - `triage.py`
  - `gap_dossier.py`
  - `work_item_routing.py`

## Position

ABIogenesis is the research product lab when it can prove downstream product
families as GTL program overlays/compositions that bind reusable graph
functions over typed assets.

The catalog therefore tests whether the substrate can express:

- extraction
- synthesis
- transform
- fan-out
- ambiguity harvesting
- gap evaluation and triage handoff

Python SDLC recent iterations contain needed behavior, especially gap
dossiering, domain catalogs, route contracts, derived-element lineage, and
bootstrap ingestion. The TypeScript line should translate that behavior into
GTL/ABG/ODD carriers, not into a second imperative framework.

## Required Mapping

| Scenario | GTL/ABG carrier | Proof expectation |
| --- | --- | --- |
| Extract | `GraphFunction(Source, Pattern) -> Vector[Item]` | source-input lineage for every extracted item |
| Synthesis | `GraphFunction(Evidence, InferenceRules) -> Vector[InferredItem]` | inference-rule authority and ambiguity preservation |
| Transform | `GraphFunction(A) -> A_t` | declared transform and evaluator surfaces |
| Fan-out | `fan_out(GraphFunction(A_i -> A_t_i), over=Vector[A], into=Vector[A_t])` | per-item traversal/projection evidence |
| Ambiguity | evaluator-result or candidate-result vector | no hidden merge or LLM-only choice |
| Gap evaluation | `GraphFunction(GapProjection, ProductPolicy) -> TriageDecision` | ABG read-only gap truth plus downstream work decision |

## Existing Coverage

Current TypeScript proof already covers:

- generic one-hop graph function semantics
- minimum typed traversal semantics
- replay-derived three-stage graph-function iteration
- deterministic traversal-structure probing
- bootstrap lineage over `BootstrapInputSet -> Project`
- real data-mapper ingress as a sandbox proof

## Missing Proof Families

The catalog still needs future proof lanes for:

- extraction over a declared pattern surface
- synthesis over declared inference rules
- fan-out transform over a typed vector
- ambiguity harvesting without hidden merge
- graph-function triage over a real gap projection

Those are downstream SDLC.TS PoC candidates unless ABIogenesis substrate gaps
are discovered while implementing them.
