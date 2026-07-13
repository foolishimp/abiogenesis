# T-261 - Realize C.retry Runtime And Policy Join

- id: T-261
- status: completed
- phase_status: closed_after_self_review
- implementation_status: realized_and_verified
- proof_status: verified
- closed_at: 2026-07-13
- delivery_phase: DS-3
- change_class: design_reframe
- owner: abiogenesis
- priority: critical
- source_ticket: T-252
- dependency: T-260
- design_ref: >-
    build_tenants/abiogenesis/typescript/design/
    M03_C_RETRY_RUNTIME_BEHAVIOR_DESIGN.md
- design_decision: >-
    .ai-workspace/comments/codex/
    20260713T192500Z_DECISION_delegated_fh_accept_t261_design.md
- self_review_ref: >-
    .ai-workspace/comments/codex/
    20260713T195800Z_SELF_REVIEW_t261_c_retry_runtime.md
- final_decision_ref: >-
    .ai-workspace/comments/codex/
    20260713T195900Z_DECISION_delegated_fh_accept_and_close_t261.md
- review_status: accepted_by_delegated_fh
- implementation_commit: 848a0b81
- updated_at: 2026-07-13

## Boundary

Close `c_retry_runtime_and_policy_join`: one C.retry term repeats the same C
contract only for its declared positive budget and admitted retryable-failure
allowlist.

## T-252 Census Gap Ownership

- gap_family: c_retry_runtime_and_policy_join

## Entry And Exit

Accept a three-view generic design before code. The unchanged T-252 reviewer
term must retain budget 2 and exactly `transport_failure | no_output |
contract_failure`; semantic dispute never retries the C call. Prove a
non-Consensus correction/retry fixture.

## Non-Closure

Engine-attempt inference, retry on semantic disagreement, unbounded retry,
ambient allowlists, or Consensus-specific branches.

## Current Disposition

`closed_as_designed`. One direct root retry lowers to a closed normalized
variant and binds the exact selected Module, program, vector, composition,
stage, carriers, positive maximum-attempt budget, and shared retry policy.
Replay owns attempt identity, budget consumption, dangling-spine resume,
historical transition validity, and stationarity. Each attempt closes through
one engine-owned C-call spine.

Only `transport_failure`, `no_output`, and `contract_failure` can produce a
retry judgment. Semantic disagreement, held work, non-allowlisted failure,
exhaustion, and stationary repetition do not retry. Nested and mixed retry
expressions remain typed gaps. Recursion, traversal conservation, and tenant
conformance remain owned by T-262, T-267, and T-268.

## Closure Evidence

- implementation checkpoint: `848a0b81`
- full semantic suite: 1669/1669
- focused T-261 lane: 44/44; packed public API proof 1/1; GTL law 82/82
- source-blind T-223 suite: 70/70
- T-250 version-basis and documentation drift: 13/13
- T-252 body/probe: 11/11; unchanged body digest and three successor gaps
- post-closure T-252 ownership manifest:
  `sha256:abbee54abc804e9741ace33ad6c7bf1d9bdb233a9abd7bc9e4f761ec0cb26175`;
  zero unowned, duplicate, or active-owned-but-unobserved families
- semantic lint and `git diff --check`: passed
- Mermaid design gate: 36 diagrams across 12 files
- public-contract schemas: 82 verified
- generated publication assets: 40 verified from 1103 immutable payload files
