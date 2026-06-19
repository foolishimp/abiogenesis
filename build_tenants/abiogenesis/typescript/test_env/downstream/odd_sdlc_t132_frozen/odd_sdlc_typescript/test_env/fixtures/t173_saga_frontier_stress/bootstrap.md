# T-173 Saga Frontier Stress Bootstrap

This bootstrap document is the scenario contract for a synthetic parallelism
stress proof that still runs through an installed `odd_sdlc` sandbox.

The product intent is not to build a large application. The intent is to prove
that the SDLC stack can carry a large admitted dependency frontier and hand the
bounded parallel realization to ABG as runtime authority.

## Product Definition

Product name: `t173_saga_frontier_stress`

Active tenant: `saga_frontier_stress`

Selected output root:

```text
build_tenants/saga_frontier_stress
```

The scenario fixture carries one proof script:

```text
tools/run_t141_saga_frontier_stress.mjs
```

The proof script must run inside the installed sandbox, import the installed
SDLC and ABG TypeScript packages, publish an SDLC dependency map with 65 nodes,
select parallel traversal from that map, and execute ABG's event-sourced saga
frontier over a 50 root, 10 reducer, 5 leaf dependency graph.

## Requirements

### REQ-T173-STRESS-001 SDLC Dependency Topology

The proof shall construct an `sdlc_module_dependency_map` with 65 nodes:
50 root nodes, 10 reducer nodes, and 5 leaf nodes.

### REQ-T173-STRESS-002 Parallel Traversal Selection

The proof shall ask SDLC traversal selection to choose the `parallel` method
from admitted partition refs rather than selecting each stage in the harness.

### REQ-T173-STRESS-003 ABG Event-Sourced Realization

The proof shall pass the selected branch declarations to ABG's event-sourced
saga frontier and observe three dependency-gated batches of sizes 50, 10, and
5.

### REQ-T173-STRESS-004 Runtime Event Audit

The proof shall verify 65 branch lease acquisitions, 65 admitted payloads, 65
lease releases, three fan-in projections, no failed branches, and no active
leases after replay.

## Boundary

This is a synthetic stress proof. It does not require an `F_P` worker and it
does not materialize product source files. The full sandbox still provisions
ABG, installs `odd_sdlc`, runs the bootstrap traversal, and executes the proof
against installed package surfaces.
