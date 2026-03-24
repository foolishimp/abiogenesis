# Test Architecture (REQ-F-TEST-*)

**Traces to**: INT-001

### REQ-F-TEST-001 — Integration-primary test surface

The primary test surface is command-level integration scenarios. Unit tests supplement these for complex internal modules.

**Acceptance Criteria**:
- AC-1: Each integration test exercises the full F_D→F_P→F_H evaluator chain against an isolated temporary workspace
- AC-2: Required integration scenarios: cold start → convergence, resume mid-lifecycle, F_D escalates to F_P (ADR-021), spec change invalidates F_P, F_P revocation cascades delta through downstream edges, proxy rejection halts edge, full convergence closes features, replay determinism
- AC-3: Unit tests cover write-primitive invariants (emit, project, EventStream) and complex internal modules (bind, schedule, commands) where integration tests alone are insufficient to exercise edge cases

### REQ-F-TEST-002 — Property invariant tests

Property-based tests verify structural invariants that must hold regardless of event sequence.

**Acceptance Criteria**:
- AC-1: Replay determinism: `project(S, T, I) = project(S, T, I)` always
- AC-2: gen_gaps idempotence: running gen_gaps twice with no intervening events produces identical output
- AC-3: No duplicate `edge_converged` certificates for the same (edge, feature) pair
- AC-4: Stale spec_hash never satisfies F_P convergence
