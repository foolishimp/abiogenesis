# T-267 Direct F_H Closure Decision

Date: 2026-07-14
Decision: accept the repaired T-267 checkpoint and close T-267
Checkpoint: `ce354ea7`

## Authority Basis

The owner explicitly approved the remaining 5.0 execution plan and delegated
F_H authority to continue through bounded sections while absent. This decision
uses that direct authority. It does not claim that Codex is an independent
reviewer of its own work.

The prior independent review supplied five concrete rejection findings. This
closure traces each finding to the repaired implementation and its negative
proof, then admits the checkpoint under the owner's direct F_H delegation.

## Re-Review Result

The current tree preserves the accepted design boundaries:

1. declared execution-context authority is recomputed and joined to the
   current T-255 handoff, source basis, and selected stage term;
2. intermediate loci retain their own output contracts rather than inheriting
   the graph-final result contract;
3. direct application identity remains distinct from compiled-plan identity;
4. result authorities are canonicalized into source-locus order before
   compilation and admission hashing; and
5. the negative matrix covers stale authority, contract substitution,
   ordering, authored-node/frontier drift, application drift, and all recurse
   relation components.

The focused gate was rerun from the checkpointed tree: GTL `82/82`, T-267
`54/54`, packed API `1/1`, and the canonical T-252 probe passed. All 35
Consensus traversal sources statically admit, the body digest remains
`sha256:e1344106d4e90c8883f72c6e1490742b98a839433b89855315fec4b571ca8695`,
and the only observed active product gap is T-268 manifest coverage.

## Prime And Assurance Boundary

T-267 does not self-certify runtime correctness. It publishes static
conservation evidence; every admitted outcome still has
`effectsPermitted: false`. The separate T-270 public-routing authority remains
the required runtime-start admission boundary. No Consensus branch, new C
constructor, runtime controller, or duplicate authority was introduced.

## Decision

Accept checkpoint `ce354ea7` and close T-267. T-270 is unblocked for
implementation. T-268 remains a separate product-capability gate.
