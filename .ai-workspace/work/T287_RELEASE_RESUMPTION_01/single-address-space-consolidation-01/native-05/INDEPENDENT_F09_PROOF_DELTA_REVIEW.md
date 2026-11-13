**Product Frame.** ABIogenesis5 / GOAL-035 / T-287 / exact STDO3.0.4; original R1–R7/C1–C5 and fixed fifteen families unchanged. Source Definition and immutable installed RC5 builder/runtime remain3.0.4, manifest `102817a3f4bea4dca1d6fa0fc634b94404dd2ba82ba6d8c38b273402dda9f95b`. This nonauthor same-family review is limited to the late F09 proof/module/fault delta; Root owns final acceptance.

**Satisfied for this bounded delta; no material finding.** Exact subject SHA256 `84b3622a0701460b0b8838e2ad2a5c81921600247501ff82063c99a2f8d5732d`, worker SHA256 `4ec5ecc1aba27aaba522dffef69776c8fd8afcb79fda17cc6ce7245e30a448d3` (128216bytes), versus previously reviewed worker `ea7ec41f4aa4d58aafdf139ff5e93c42507014846810c68946ff8215582de01d`. Fixture/oracle/author-feedback subject SHA256 `1e710c87d3f482e8a7b8bbe5967a9311153b6c5a0d24a77c984c665c5857be88`. All declared pins were verified, including the frozen author's returned worker hash. No final native Result/after-observation is claimed.

The late delta adds only the scoped configuredDurableLogPath override and restoration at worker1325–1329/1342. The prior module-family correction remains sound:1069–1095 imports replay/retry/CCall/EventStore from the actual environment.installedRoot;1227–1243 borrows the direct replay owner's authorityPrefix for that same installed retry owner. It introduces neither fabricated nominal ownership nor a complete-body wrapper.

The null override is a deliberate query fault, and preserves the intended F09 semantic discriminator:

| Boundary | Actual relation retained |
|---|---|
| Fault scope | Only this store while admitRoute is on the stack reports null. event_prefix76–78 then uses its existing snapshot branch, whose readAll fault returns empty rows. Other stores/call stacks delegate normally. |
| Failure point | Actual traversal_route5016–5024/5136 stages the real route event, then invokes observeNativeFrameLiveness. runtime_liveness89–92 sees no admitted producer in the faulted read and throws. The route owner is not stubbed to return a refusal. |
| Durable owner | Null changes the public accessor, not EventStoreState.durableLogPath/history/descriptor. The frozen unchanged Event Store's appendDurablyBatch2309–2311/2343–2349 reads private durable state. The physical transaction/writer is not converted into an in-memory store. |
| Atomic conservation | Existing HoG retry_lifecycle442–489 checks the genuine durable predecessor before admission and again after the exception, then maps rollback to retry_route_refused. Worker1343–1348 requires exact refusal, unchanged rows, digest and physical bytes. |
| Distinct attempt fault and success | Both overrides restore before1352–1371's separate attempt-admission failure/rollback and1372–1388's ordinary successful durable resume/stale-prefix refusal. A disabled route or retained staged route cannot satisfy these subsequent assertions. |

The selected F09 contract here is retry-owner failure/rollback under a failed lower liveness observation. It does not require preserving the old production readAll implementation hook. The injected branch intentionally exercises the supported snapshot reader; this case alone does not prove every durable-owned-selector failure mode. Ordinary successful resume and restarted consumer still use the actual durable path with the override removed.

Unchanged runtime-f09.mjs287–328 requires both routeFailureRolledBack and attemptFailureRolledBackRoute alongside authentic attempts/progress/failure identity;329–337 retains complete durable-prefix inspection. The two unchanged test entrypoints preserve F09 frontier/restart and A-B-A immediately-preceding-failure assertions. Frozen author TAP3 and4 each record1pass/0fail/0skip,exit0. They remain author feedback, not actual C2.

No Product/test/control edits, tests/builds/providers, moving candidate reads or git mutations were performed. Only this report pair was written. The omitted actual-C2 test/helper scope is being reviewed separately and is not repeated here. Prior N5-CODE-01/N5-PROOF-01 remain unchanged. Final native identity and actual C2/UAT remain Root-owned conjunction work; reuse only unchanged final hashes.
