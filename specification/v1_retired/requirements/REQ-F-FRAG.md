# Compositional Graphs (REQ-F-FRAG-*)

**Traces to**: INT-004

### REQ-F-FRAG-001 — Fragment is a GTL type representing a reusable subgraph

A Fragment is a compositional unit smaller than a Package — a reusable subgraph with defined input/output contracts.

**Acceptance Criteria**:
- AC-1: `Fragment` is a GTL dataclass with fields: `name`, `inputs` (list of Assets), `outputs` (list of Assets), `assets` (internal), `edges` (internal), `contexts` (internal)
- AC-2: Fragment inputs are the assets that must be provided by the outer graph
- AC-3: Fragment outputs are the assets that the outer graph can consume
- AC-4: Internal assets and edges are encapsulated — not visible to the outer graph except through outputs

### REQ-F-FRAG-002 — Fragments compose into Packages

Fragments can be assembled into larger structures lawfully.

**Acceptance Criteria**:
- AC-1: A Package can include Fragments — the Fragment's internal assets and edges are incorporated into the Package topology
- AC-2: Fragment input/output contracts are verified at composition time — inputs must be provided, outputs must be consumed or declared terminal
- AC-3: Two Fragments can be composed sequentially when one's outputs match the other's inputs
- AC-4: The composed graph is a valid DAG — fragment composition cannot introduce cycles

### REQ-F-FRAG-003 — Zoom expands an edge into a Fragment

A coarse edge can be replaced by a richer subgraph while preserving the outer contract.

**Acceptance Criteria**:
- AC-1: `zoom(edge, fragment)` replaces the edge with the fragment's internal structure
- AC-2: The fragment's inputs must be compatible with the edge's source assets
- AC-3: The fragment's outputs must be compatible with the edge's target assets
- AC-4: While zoom is active, the outer edge's convergence is **replaced** by aggregation over the fragment's internal edges. The outer edge's own evaluators are suspended — convergence is determined entirely by the internal edges and their evaluators. `delta(outer_edge)` = aggregate of `delta(internal_edge)` for all internal edges. The outer edge is converged when all internal edges are converged
- AC-5: The zoom operation is recorded in the event stream as a `zoomed` Tier 2 control event (REQ-F-REFINE-001). The effective graph topology at any event N is derivable by replaying `zoomed` events against the base Package (REQ-F-REFINE-003 AC-3)

### REQ-F-FRAG-004 — Spawn creates child work_keys; fold-back projects results to parent

Recursive refinement creates descendant work and collapses results back.

**Acceptance Criteria**:
- AC-1: Spawn creates a child `work_key` by appending a segment to the parent key
- AC-2: Child work traverses edges independently under its own `work_key`
- AC-3: Fold-back: parent `work_key` convergence is a projection over all descendant `work_key` convergence
- AC-4: A parent is converged only when all its descendants are converged
- AC-5: Spawn and fold-back are event-sourced — no hidden imperative state
