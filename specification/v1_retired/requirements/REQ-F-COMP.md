# Compositional Graph Functions (REQ-F-COMP-*)

**Traces to**: INT-004
**Derived from**: V2 Roadmap — GTL §B/§C (Fragment as ordinary structure, graph functions and interfaces)

Fragments must become ordinary reusable structural units — not exotic one-offs. Graph-valued functions with explicit input/output interfaces are the mechanism for reusable topology, late binding, and local refinement without monolithic graph rewrite.

### REQ-F-COMP-001 — Named graph functions are reusable GTL compositions

A graph function is a named, reusable, graph-valued function that produces a Fragment when applied. Graph functions are the primary unit of topology reuse.

**Acceptance Criteria**:
- AC-1: A graph function is a callable that returns a `Fragment` — it is parameterised by input/output asset types
- AC-2: Graph functions have stable names (e.g., `requirements_to_design`, `code_to_test_evidence`) and are registered in the Package or a library
- AC-3: The same graph function can be applied at multiple points in a graph, producing distinct Fragment instances with shared structure
- AC-4: Graph functions compose: the output interface of one can feed the input interface of another

### REQ-F-COMP-002 — Graph functions have explicit input/output interfaces

Every graph function declares typed interfaces that are validated at composition time.

**Acceptance Criteria**:
- AC-1: A graph function's input interface declares the asset types it requires from the outer graph
- AC-2: A graph function's output interface declares the asset types it produces for the outer graph
- AC-3: Composition validation verifies interface satisfaction: inputs are provided, outputs are consumed or declared terminal
- AC-4: Interface mismatch is a spec-load-time error — not a runtime failure
- AC-5: Interfaces are the basis for interchangeability: two graph functions with compatible interfaces are substitutable

### REQ-F-COMP-003 — Fragment libraries are ordinary reusable structural assets

Fragments are not exotic or one-off — they are ordinary reusable assets that can be catalogued, versioned, and shared across Packages.

**Acceptance Criteria**:
- AC-1: A collection of Fragments can be defined as a library — a named, versioned set of reusable graph functions
- AC-2: Packages can import Fragments from libraries — composition validation applies across the import boundary
- AC-3: Fragment libraries follow the same territory rules as other installed assets — they are authored in builds/ and installed into release territory
- AC-4: **Degenerate case:** Packages with no fragment imports continue to work unchanged
