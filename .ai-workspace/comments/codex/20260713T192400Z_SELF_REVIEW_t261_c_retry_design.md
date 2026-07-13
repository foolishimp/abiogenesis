# T-261 `C.retry` Runtime Design Self-Review

**Date**: 2026-07-13
**Subject**: `M03_C_RETRY_RUNTIME_BEHAVIOR_DESIGN.md`
**Disposition**: pass after bounded repair; recommend delegated F_H acceptance

## Authority Checked

- `REQ-L-GTL3-C-ALGEBRA-008/-016`
- `REQ-L-GTL3-LAWS` one-allowlist amendment
- `REQ-R-ABG3-CCALL-004/-008/-009/-014`
- `REQ-R-ABG3-RETRY-001..-009`
- T-261 boundary, exit conditions, and non-closure
- Design Module three-view and transition-owner rules

## Findings And Repairs

| Finding | Severity | Repair |
|---|---:|---|
| the first draft let the attempt adapter return fresh run, call, manifest, and state refs, so malformed output could erase identity before truthful closure | P1 | ABG now prepares deterministic attempt identity from the selected plan, replay-derived ordinal, exact locus, and admitted input basis before dispatch; the adapter only echoes it |
| stationarity initially hashed general evidence, but fresh invocation refs would make an unchanged failure appear nonstationary | P1 | every runtime failure now carries one admitted `failureSignalRef`; replay obtains exact failure class from `c_call_result_admitted.outcomeStatus` and signal from `c_call_judged.reasonRef` |
| a separate attempt call ref risked duplicating the existing C-call identity | P1 | `cCallRef` is the sole local call identity and satisfies fresh-call law; no second call namespace remains |
| local retry and graph-level repair responsibilities were easy to conflate | P1 | local `C.retry` repeats the same admitted A input and stage contract; changed workspace/input truth re-enters through the existing graph retry-repair authority as a fresh invocation |
| the registry gate retained the prior fixed design count | P2 | update the exact register, gate, and mutation expectation from 11/33 to 12/36 and correct the test title |

## Cross-View Result

- exactly three ordered Mermaid views are present;
- every participant and lifecycle carrier has an owner;
- every state transition names compiler, admission, binder, handoff, gate,
  replay, resolver, adapter, or event authority;
- retry eligibility derives from replay, positive budget, one shared allowlist,
  and a nonstationary typed failure signal;
- semantic disagreement has no transition to retry;
- the adapter cannot mint attempt identity, budget, eligibility, C-call truth,
  or closure;
- selected catalog authority narrows to one digest-bound Module before any
  attempt; and
- T-267 remains before all canonical product effects.

## Proportionality

The accepted slice is one direct root `C.retry` around one `C.of` leaf. Budget
is maximum invoking attempts including the first. Arbitrary nested or mixed
retry, backoff, scheduling, concurrency, product policy, and a duplicate graph
repair planner remain outside scope. The design adds no retry event family and
does not change the base GTL algebra.

## Evidence

- Mermaid structural/render gate: 12 files, 36 diagrams, passed;
- Mermaid renderer: 11.3.0;
- Mermaid source-set digest:
  `sha256:70432d6fb74246461c33292d90b2178c3790ea4ad6baf84165111bde39c2a814`;
- Mermaid mutation suite: 5/5 passed;
- `git diff --check`: passed.

## Verdict

`pass`. The repaired design is implementation-ready within the direct-root
boundary. No blocking finding remains.
