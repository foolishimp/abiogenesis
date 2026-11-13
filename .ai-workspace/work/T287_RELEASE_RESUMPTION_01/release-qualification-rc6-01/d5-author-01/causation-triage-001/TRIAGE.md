# Product Frame

This is the F10 D5 lifecycle-copy-retirement slice under GOAL-035/T-287 and the unchanged fifteen ABIogenesis5 families. Product and requirements own the outcome; ABG owns causal admission and replay truth. Test counters are derived measurement tools. This diagnosis creates no store, lifecycle authority, replay algebra or requirement change.

**Closed diagnosis: the128 count is an attribution error in the test, fully explained by128 existing durable-encoding map writes. It does not establish128 extra or unowned causation lookups or a D5 runtime regression.** Technical severity: **S3**; Root owns priority. This is intermediate-stage technical triage, not the final D5 review.

## Exact cause

The [test classifier](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/d5-author-01/causation-triage-001/files/build_tenants/abiogenesis/typescript/test_env/tests/m5-event-store-reopen.test.mjs:418) patches both `Map.get` and `Map.set`. It recognizes history-ordinal insertion, then labels only the first two other live map identities `stagedBodyEntries` and `stagedEventEntries`. Every later map identity falls into `unattributed`.

The measured action includes the whole transaction, including durable commit:

1. [Admission](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/d5-author-01/causation-triage-001/files/build_tenants/abiogenesis/typescript/code/src/abg/event_store.ts:2460) checks each causal reference through the history selection.
2. [History insertion](/Users/jim/src/apps/abiogenesis-rc6-local-cut/qualification-scratch/d5-author-01/tmp/d5a-s3/build_tenants/abiogenesis/typescript/code/src/abg/runtime_history.ts:128) checks the location’s causal edge and inserts its ordinal.
3. [stageRuntimeEvent](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/d5-author-01/causation-triage-001/files/build_tenants/abiogenesis/typescript/code/src/abg/event_store.ts:2306) inserts into the tentative-body map and `state.eventsById`—the two classified staging maps.
4. The [transaction commit](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/d5-author-01/causation-triage-001/files/build_tenants/abiogenesis/typescript/code/src/abg/event_store.ts:4313) invokes `appendDurablyBatch`, which creates its own `batchEvents` map and [inserts each event once](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/d5-author-01/causation-triage-001/files/build_tenants/abiogenesis/typescript/code/src/abg/event_store.ts:2344). That map supplies this batch’s earlier events to the existing body encoder, with committed-prefix fallback. Insertion follows encoding so a row cannot cite itself as an earlier source.

For the128-event chain, the [retained TAP](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/d5-author-01/causation-triage-001/evidence/d5-lifecycle-profile.stdout.tap:45) reports:

| Operation | Expected by source | Observed/classified |
| --- | --- | --- |
| Admission causal lookups |127|127|
| Location causal lookups |127|127|
| History ordinal entries |128|128|
| Tentative body entries |128|128|
| Staged event entries |128|128|
| Durable encoding batch entries |128|128 in `unattributed`|

The identified batch writes account for the entire unknown count; the counters are nonnegative. No additional unknown get/set is needed to explain the failure. The writes are real existing O(N) work, not imaginary operations. Their omission from the classifier is the defect. This says nothing about total transaction latency or array-copy complexity.

## Predecessor and coverage

`stageRuntimeEvent` and `appendDurablyBatch` are byte-identical to frozen F6. Their compared-block SHA256 values are respectively `d80bb804307006cbaeaff35712edbe0358e2ce2b64309e003127fc567b7a9ac2` and `b3de649073cc02f8d176faebbd39faa2340ad6acdd3a1b54c2ac8c7807e51da1`. `runtime_history.ts` and `event_body_encoding.ts` also match their exact F6 file hashes. The intermediate event-store delta changes only lifecycle-copy payload-key declarations/use; it does not change the measured owner functions.

The supplied F6 manifest **does not contain this test file**. Therefore this diagnosis confirms the map predates D5, but does not claim the prior classifier bytes were unchanged or identify when the incomplete classifier arose. No guessed or moving preimage was substituted.

The prior [Q23 six-module population](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/q23-author-06/review-subject-001/files/qualification-inputs/q23-author-06/C2_INPUTS.json) excludes `m5-event-store-reopen.test.mjs`; its63 passes cannot establish this measurement. In s3, the D5 lane reports47/48 passing, while the other lanes report27 and36 passing. The failure occurs at the first live-count assertion for128 events. Cold decoding at128 returned, but its count/equality assertions, the staging-map cardinality assertion and the256-event growth checks were not reached. Root reports recurrence in three stages; only the retained s3 failure was independently inspected.

## Smallest lawful re-entry

Correct the **test’s source attribution**, in the already selected test file. Give the durable encoding map its own exact owner/phase-bound category and expectedN entries; retain exact map-population accounting and `unattributed=0`. There are three non-ordinal live maps here, plus the ordinal index. Do not change the unknown expectation toN, ignore new writes, loosen equality/growth checks or remove the runtime map to fit the old measurement.

Meaningful reproof is the existing128/256 measurement with explicit counts, zero unknown operations, unchanged causal slopes, canonical-byte/cold-event equality and per-prefix projection checks, plus the adjacent rollback/reappend/refusal-precedence case. Root then conjoins the already selected affected D5 proof. No general performance, constructor, fold or replay redesign follows.

**Cost and harm:** The trigger is deterministic when this measurement runs. Realized harm is a red proof lane and repeated author work; no causal corruption, data loss or performance regression is established. The unknown-operation guard fails closed, and the adjacent rollback/refusal test reports pass. A test-only attribution correction is small and low-risk if the strict guard remains. Runtime redesign would add disproportionate churn.

## Pins and limits

Intermediate [SUBJECT.json](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/d5-author-01/causation-triage-001/SUBJECT.json): `d98aacf9449794e2268b44cee3da485d474d222d5a40a7915621a9f74168f476`. Its six source/evidence files verified without mismatch. Additional HOW/runtime-history/body-encoding reads came only from the retained s3 stage after matching `evidence/d5a-s3-stage.json`. Frozen F6 predecessor: `676931d181dff38febc508ddf1f6da00cb414a9db7cb4902d284217f9af91dd5`.

[TRIAGE.json](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/d5-author-01/causation-triage-001/TRIAGE.json) contains exact authority, source, evidence and comparison pins, confidence, reproof and invalidators. No tests, builds, providers, ABI runtime calls, private logs, Git or source mutation occurred. The live author’s later candidate, M2 digest coupling and recovery-fixture residuals are outside this diagnosis.

This same-OpenAI-family-to-Root diagnosis is separate from the Claude author. It is not formal independent acceptance, native J, final D5 readiness or release proof. Root owns conjunction after the actual completed author return; this diagnosis is closed.
