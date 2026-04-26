# M03 Graph Application Instance Semantics Derivation

**Status**: Active
**Date**: 2026-04-26
**Purpose**: Distinguish graph topology, graph-function program, ABG execution
instance, and downstream domain asset instance.

## Source Material

- `specification/requirements/gtl/REQ-L-GTL3-GRAPH.md`
- `specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md`
- `specification/requirements/abg/REQ-R-ABG3-GRAPHCALL.md`
- `specification/requirements/abg/REQ-R-ABG3-RUN.md`
- `M03_GRAPH_FUNCTION_ITERATION_DERIVATION.md`
- `M05_SDLC_BOOTSTRAP_LINEAGE_DERIVATION.md`

## Vocabulary

| Surface | Owner | Meaning |
| --- | --- | --- |
| `Graph` | GTL | structural topology and internal vector shape |
| `GraphFunction` | GTL | published reusable program and callable outer contract |
| `ExecutionBasis` | ABG | admitted runtime basis for one start/resume request |
| `GraphCall` | ABG | runtime execution instance over one graph-function boundary |
| `Frame` | ABG | runtime frame for internal graph-vector traversal |
| `Run` | ABG | execution attempt scoped by run identity and work key |
| domain asset instance | downstream product | typed product artifact such as `Project` |

## Idempotency Claim

Idempotency is not path sameness and is not mutable workspace sameness.

The same published graph function and materialized graph may be used by many
runtime instances. The same admitted runtime basis replays to the same graph
call and frame identity. A different run identity is a different execution
attempt even when the graph function and materialized graph are unchanged.

Downstream domain asset identity remains downstream-owned. ABG can preserve
lineage and provenance evidence, but it does not decide whether two projects,
requirements sets, or generated artifacts are semantically the same product
asset.

## Required Proof

The TypeScript proof lane must show:

- graph-function identity remains stable across repeated runs
- materialized graph identity remains stable for the same graph function
- execution-basis and graph-call identities change when run identity changes
- replay of the same run/work basis produces the same runtime instance truth
- domain asset semantics are not embedded in ABG runtime carriers
