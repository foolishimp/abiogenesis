# Delegated F_H Decision: Accept And Close T-261

Date: 2026-07-13
Decision: accepted and closed
Implementation checkpoint: `848a0b81`
Authority: the human owner delegated F_H authority to continue section by
section, self-review, remediate proportionately, and proceed until return

T-261 is accepted after three-view design, implementation, adversarial
self-review, bounded replay remediation, and fresh proof against the local
checkpoint.

The accepted boundary is one generic direct root `C.retry` over one direct
result-bearing `C.of` stage. The selected Module, GraphFunction, GraphVector,
program, composition, carriers, stage, budget, and shared policy rederive
before effects. Replay owns attempt ordinal and budget consumption. Every
attempt uses one engine-owned C-call spine, and only `transport_failure`,
`no_output`, or `contract_failure` can produce a retry judgment. Semantic
disagreement, held work, non-allowlisted failures, exhausted budget, and
stationary repeated failures stop truthfully.

The canonical T-252 body remains unchanged at
`sha256:e4555c21cdb4292b64f7f4d5a625c2a520195aa8d6e9c759498eed4bf28d0ea0`.
The ownership census now reports exactly three active gaps: recurse under
T-262, traversal conservation under T-267, and tenant-conformance coverage
under T-268. Its post-closure manifest is
`sha256:abbee54abc804e9741ace33ad6c7bf1d9bdb233a9abd7bc9e4f761ec0cb26175`
and reports zero unowned, duplicate, or active-owned-but-unobserved families.

This decision does not accept nested or mixed retry expressions, scheduler or
backoff policy, graph-state mutation inside local retry, typed recursion,
canonical Consensus startup, traversal conservation, tenant-conformance
coverage, or a Consensus-specific runtime controller.

Evidence is recorded in
`.ai-workspace/comments/codex/20260713T195800Z_SELF_REVIEW_t261_c_retry_runtime.md`.
T-262 is the next dependency-ordered runtime ticket and is not accepted by
this decision.
