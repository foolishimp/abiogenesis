# SDLC Graph (REQ-F-GRAPH-*)

**Traces to**: INT-001

### REQ-F-GRAPH-001 — GTL Package defines a typed asset graph

The Package declares a typed asset graph with admissible transitions. The base authored graph is a fixed topology; Fragments (REQ-F-FRAG) and domain packages extend it lawfully without changing this requirement.

**Acceptance Criteria**:
- AC-1: Base authored graph: six core assets (`intent`, `requirements`, `feature_decomp`, `design`, `code`, `unit_tests`) plus any domain-added assets (e.g., `bootloader_doc` per REQ-F-BOOTDOC-001)
- AC-2: Base authored edges: `intent→requirements`, `requirements→feature_decomp`, `feature_decomp→design`, `design→code`, `code↔unit_tests`, plus domain-added edges
- AC-3: Each edge has at least one evaluator
- AC-4: The `code↔unit_tests` edge is co-evolving (`co_evolve=True`)
- AC-5: **Degenerate case:** the base authored graph is a Package with no Fragments — all edges are authored directly, no zoom or refinement

### REQ-F-GRAPH-002 — Asset.markov conditions are acceptance criteria

Each asset type defines its own stability conditions.

**Acceptance Criteria**:
- AC-1: `Asset.markov` is a list of named conditions (e.g., `["all_pass", "validates_tags_present"]`)
- AC-2: Markov conditions are surfaced in the F_P manifest as part of the output contract
- AC-3: An asset is stable when all markov conditions are met and all edge evaluators pass
