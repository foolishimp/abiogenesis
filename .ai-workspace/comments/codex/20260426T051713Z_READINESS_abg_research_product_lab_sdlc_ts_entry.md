# ABG Research Product Lab Readiness For SDLC.TS PoC Entry

**Date**: 2026-04-26
**Author**: Codex
**Status**: Current readiness decision

## Decision

Go for SDLC.TS PoC entry, with a narrow claim.

The TypeScript GTL/ABG substrate is ready to be used as the research product
lab for an ODD-native SDLC.TS PoC. It is not evidence that SDLC.TS is already
complete, and it is not permission to recreate Python SDLC's imperative
framework in TypeScript.

The PoC should start from graph functions, typed assets, ABG replay truth, and
the research scenario catalog.

## Evidence Matrix

| Concern | Current evidence | Status |
| --- | --- | --- |
| Bare or typed traversal does not imply hidden compute law | `REQ-R-ABG3-INTERPRET-013`, `test_m03_no_compute_basis_taxonomy.test.mjs`, T-060 | Green |
| Traversal is inspectable for deterministic forensic review | `TraversalStructureProbe`, `test_m03_forensic_traversal_probe_completeness.test.mjs`, T-065 | Green |
| ABG can internally iterate a graph function beyond vector zero | `test_m03_internal_control_loop_sufficiency.test.mjs`, existing T-044 integration proof, T-066 | Green |
| Gap observation and gap triage ownership are separated | `REQ-P-POLICY-018`, `M04_GAP_TRIAGE_GRAPH_FUNCTION_DERIVATION.md`, T-067 | Design green |
| Research scenarios are defined as product qualification obligations | `REQ-P-SCENARIOS-004..007`, `09-research-product-lab-scenario-catalog.md`, `M05_RESEARCH_PRODUCT_LAB_SCENARIO_CATALOG_DERIVATION.md`, T-068 | Design green |
| Graph, graph function, graph call, run, and asset instance semantics are distinct | `REQ-L-GTL3-GRAPHFUNCTION-019`, `REQ-R-ABG3-GRAPHCALL-006`, `REQ-R-ABG3-RUN-009`, `test_m03_graph_application_instance_semantics.test.mjs`, T-069 | Green |
| Zoom in/out/fold do not authorize new hidden mechanics | `REQ-L-GTL3-HOF-008`, `GTL_ODD_ZOOM_FOLD_ALGEBRA_DECISION.md`, T-070 | Decision green |

## Odd SDLC Python Material To Translate

The recent Python SDLC iterations contain functionality that matters:

- `triage.py`: current-edge gap triage artifacts and observation enrichment
- `gap_dossier.py`: published gap dossier and next-start blocking context
- `homeostatic_loop.py`: proposal application, loopback, and gap retirement
- `work_item_routing.py`: ticket/work-item routing contracts
- `software_domain_catalog.py`: domain asset families and edge contracts
- `function_catalog.py`: graph-function catalog for SDLC work
- `program_catalog.py`: higher-level operational programs

These are source material for ODD-native SDLC.TS. They should be translated
into graph functions, typed assets, policy surfaces, and proof lanes rather
than copied as imperative service scaffolding.

## Open Proof Work For The PoC

The first SDLC.TS PoC wave should implement scenario proofs for:

- extraction: `Pattern/Rexp.X -> List[XItem]`
- synthesis: `InferenceRules -> List[InferredItem]`
- transform: `A -> A_t`
- fan-out transform over an explicit vector boundary
- ambiguity harvesting without hidden merge
- gap evaluation through `GF_TRIAGE_GAP`

If any of these cannot be expressed with current GTL/ABG carriers, the result
is an ABIogenesis substrate gap and must become a ticket before hidden
framework code is added downstream.

## Recommendation

Start SDLC.TS as an ODD-native product PoC. Use the ABIogenesis TypeScript
tenant as the substrate, and treat the scenario catalog as the first acceptance
surface. Keep Python SDLC as comparison evidence only.
