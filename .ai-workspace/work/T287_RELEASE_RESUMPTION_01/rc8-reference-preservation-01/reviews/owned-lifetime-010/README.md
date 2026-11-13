**Product Frame.** ABIogenesis 5.0, fixed fifteen families F01–F07/F09–F11/F13–F17, GOAL-035/T-287/RC8 REF-01, STDO 3.0.4 and empty composition. Existing owners retain realization authority; ABG alone owns runtime admission. This review covers one frozen test-only delta. Root owns acceptance and continuation.

**Source review: satisfied, no findings. Whole-file proof: failed, 16 passed / 2 failed / 0 skipped.** These are separate results.

The A10 overlay contains exactly one changed file across 1,339 rows; both predecessor and successor source digests were independently recomputed. The actual materialized test matches the immutable overlay. All eighteen test declarations and twenty-seven timeout/grace/skip expressions are unchanged. Six emitted runtime owners and the existing Product archive remain hash-identical to their retained pins.

The private `runProcess` fixture now creates unique real stdout/stderr archive files before the owner opens stdout, and verifies lifetime setup before synthetic events. Its original twelve combinations and exact Error/final-facts assertions are preserved. Test 6 now passes with no asynchronous-activity/unhandled-rejection diagnostic.

The physical fixtures emit existing owner results/errors and bounded PID/readiness observations before their original assertions. The source retains all five HTTP modes and three capture legs. The one whole-file run provides this narrower actual coverage:

| Case | Actual retained result |
|---|---|
| Test 15 response | `port_file_timeout`; missing PID; no request/response; empty streams; SIGTERM; owner confirms termination. The four later HTTP modes were not reached. |
| Test 16 worker | Passed leg: 14-byte leader output, no late result output, descendant absent, complete process facts and stream archive diagnostics. |
| Test 16 command | Passed leg: 14-byte leader output, no late output, descendant absent, termination confirmed. |
| Test 16 HTTP | `port_file_timeout`; missing ready file; empty output; SIGTERM and confirmed termination; preserved leader-output assertion fails. |

Both remaining A10 failures now expose the HTTP port-wait frontier. `process.timedOut=false` does not contradict that evidence: the unchanged helper sets it only when the launch timer expires without a port-file issue. Both HTTP fixtures still have the 300 ms request/port gate; HTTP capture retains its separate 1000 ms launch bound. No host or disk cause, nor Product timeout-contract violation, is inferred.

Broad013 remains historical red: 15 passes / 3 failures, including its **first worker-leg** capture failure. A10’s later HTTP-leg failure does not replace that attribution. The A10 recipe recorded a genuine failure and `autoRetry=false`; there was no timeout extension, assertion relaxation, new skip or Product repair.

**Multi-frame triage.** The current local readiness/output expectations are falsified. The unchanged helper reached its port-deadline branch and reported cleanup; that is not independent HTTP PID/group proof, because readiness/PID observations are missing. Product authority, reference-preservation behavior and runtime bytes remain unchanged. No Product/category violation or proof that the selected lawful REF-01 sunny-day path is unconstructable is established. This run also does not prove the ordinary installed HTTP response path. Host/startup causes remain unmeasured.

An explicit physical-proof residual is defensible **only for unqualified REF-01 source/cut use**. Root can assess the archive-premise and diagnostic increment separately from 18/18, preserving both current reds and the four unexecuted HTTP modes. The proposed residual activates before dependent physical-owner, broad or release qualification, or on a new ordinary-path/cleanup/authority counterexample. It is not a waiver of any applicable gate and is not registered by this review.

If Root later selects closure, the smallest supported re-entry is the existing test’s finite readiness/time-budget relation, with all semantic, capture and cleanup assertions preserved. A Product timeout or lifetime redesign is unsupported. One current whole-file invocation cost 26.683 s; its 600 s limit is a bound, not a forecast, and native preparation cost is separate. A one-file test correction has lower implementation/regression cost than runtime redesign. No automatic A11, repeat run or deadline change is recommended.

Return the source-conformant diagnostic discriminator and its failed execution to Root. The frozen activation stops here. This report accepts neither the source nor RC8 and supplies no installed ABG/replay claim.

Exact subject: source `6c8d900caa803df6e662f8cb5b40f199f773d2f464b17f9a05f39e0c34310ed8`; freeze `e2db4c2e9356da0d97d6277567504650078a8bf1d5b7085dfaee63a4dbae5007`; overlay `59fa9dc768b052149ee036577a23d60a55c1747b75337aebdce61027c20a6918`. Whole-file RESULT `f8d24a21181d6ae8fbe0c6568503f562982ab250da7c81ca58fc3127daf3d2ef`; stdout `69e1e251a60110bb7e5e52de3eb4e88c57f5ec37c84d3ac11806adf921b8f883`. Host wall time 26.683 s; exit 1, no outer timeout or truncation, complete event end.

[REVIEW.json](REVIEW.json) retains control/evidence pins, distinct claim results and limits. Reviewer effects were confined to these two new review artifacts; no tests, Product processes, providers, cleanup, Git or candidate edits were performed. Native closure/readbacks remain separately Root-owned.
