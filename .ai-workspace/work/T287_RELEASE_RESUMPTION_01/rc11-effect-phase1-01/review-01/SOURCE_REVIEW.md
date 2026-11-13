# Product Frame

Fixed ABIogenesis 5.0 families F01–F07/F09–F11/F13–F17 remain under T-287; F08/F12 are deferred. This phase1A/1B slice repairs test Proof. GTL owns topology, HoG directly traverses, and ABG owns runtime admission, currentness, events and replay. Exact Effect 3.22.1 implements declared mechanics without semantic authority. Observation cannot renew owner clocks, manufacture acknowledgements, or establish OS absence from fiber interruption.

Expectations were acquired before candidate exposure from immutable `db9cf974a3f6263a7000d7b132c784b4e0b7a4d6`, the approved functional plan (`3da4e193dc63c958602a5a900677bd5f7602953ce3666da9a9d8fa062f88e969`), ROOT_SCOPE (`b7339f2b7304b9fb8bc75ecc945ed1aff6091b4e02b56a75f5bfda53647ad1bd`), TRANSPORT-002/003/008/016/018/027/030, preserved diagnosis and Stage2B (`9a04c2b0d3e28308efa0abb11de95e07a583c47fddbbdfb959bbf706ce208b3a`). The selected basis remains verified STDO 3.0.4, manifest `102817a3f4bea4dca1d6fa0fc634b94404dd2ba82ba6d8c38b273402dda9f95b`, empty composition, project frame `2c2a3295928b4a40cd423623145c029b08f0f79576a086df7506f002627a1f10` and installed stdo-review.

# Verdict and exact subject

**Source result: falsified.** One S2 partition-dependent Proof oracle remains, and one S3 controlled-failure evidence gap remains. Root has selected both for a single narrow m5 successor. No production regression is established. External affected-file and original-unit proof is held for the corrected freeze; this report earns no qualification or native workflow success.

Subject root: `native-02/frozen-source` under this phase packet. I independently verified all 1,344 inventory rows and recomputed source digest `5eb4b82b5861c25a4df23b6d42444b0ad9240d4fb76e7ac93851d5bbd9074fea`. Freeze: 295,015 bytes, SHA256 `73fa9681d7153644a5c1ca76bfb23c0282afa8005fc79cfb1e2339711a606bf2`. Custody: 20,993 bytes, SHA256 `86f70fcc34bf1643dc316f26ba0548c9a09596c3967313697d62f551114c5f73`.

| Frozen path below test_env | Bytes | SHA256 |
|---|---:|---|
| support/t287-publication-observer.mjs | 8589 | `9cbe06469224c20e3f58792a1791b9886b72b3876812787330be098ddd878d9e` |
| tests/t287-publication-observer.test.mjs | 9781 | `44733710fd85aa4b6bc3ed2decc875e7334e7778a1358e3564a0ab39da4f0c61` |
| tests/t287-owned-process-lifetime.test.mjs | 52787 | `4db80cc8cf535099e138138720dc0ffb196e81ed35a8c9fe3b3037fee9a1ab91` |
| tests/m5-worker-transport.test.mjs | 138655 | `38f201421431f21120ceabe75babf54ceda8c43639d87bcfa38e8cc03c610999` |

Comparison with the pinned pre-author inventory independently finds only these four source paths plus the two declared operator tracking changes. The production owned_process_lifetime, worker_transport, worksite_command_helper and privateOwner harness bytes equal the immutable baseline. The reviewed source does not acquire a production mutation grant.

I resumed prior context, authored neither source nor functional plan, and claim no clean-context review. Root independently reported the same S2 timestamp counterexample after I had reached that source relation; neither notice substitutes for the source reasoning below.

# Findings

## PHASE1-PROOF-001 — S2: physical completion age remains chunk-dependent

**Origin:** m5-worker-transport.test.mjs lines 1003–1007 and 1021. Complete acknowledged bytes are concatenated, but `completeAt` is selected with `captures.find(row => row.chunk.includes("complete\n"))?.at ?? null`. The mandatory `spawnToCompleteCaptureMs > leaseMs` assertion consumes that value.

**Exact counterexample:** Preserve the same ordered transcript, callback times, real acknowledgements and workload duration, but split its final record across callbacks as `comple` and `te\n`. The concatenated byte and record assertions at 1012–1018 succeed. No individual chunk contains `complete\n`, so `completeAt` and the age are null; the mandatory renewal-age assertion fails. This repeats the originating chunk-sensitive-oracle class through a derived timing witness.

**Impact and causal boundary:** A lawful actual-owner execution can be rejected by the selected physical Proof. It is not evidence of failed lease renewal or lost transport output. The new controlled partitions at 865–883 exercise the actual owner and content oracle, but never consume this physical timing derivation, so their success cannot falsify the counterexample. Observer-only selfchecks likewise cannot cover it. Historical erased-run causes remain unproved.

**Bounded repair and cost:** Correct only the completion-observation relation and its exact discriminator inside the authorized m5 test cone. A completion witness must come from the ordered complete byte/record prefix and retain the capture time at which the required completion became available; splitting or coalescing callbacks must not remove or re-time that fact incorrectly. Keep the original spawn anchor, true acknowledgements, initial lease and requirement that the workload outlast that lease. Expected construction cost is a small oracle edit plus finite controlled cases, not a production refactor or larger timeout.

**Successor acceptance:** The same timing relation used by the physical test must consume a final completion record split at every relevant boundary, an intact/coalesced completion, and an incomplete/missing completion. Equal byte/time facts yield the same completion witness; missing completion remains a failure. The timing proof must still require actual completion after the initial lease and must not use a default timestamp or whole-owner duration to manufacture that witness.

Severity S2 is a material Proof defect with a bounded repair. Root owns priority and acceptance.

## PHASE1-PROOF-002 — S3: controlled assertion failure bypasses trace retention

**Origin:** m5ControlledRun lines 800–804 awaits `drive` before its only `retainEvidence` call. The supplied drivers assert at 812–814, 829–830, 841–842 and 853–855. A counterexample assertion there rejects the driver and exits before the accumulated captures, acknowledgements, timeouts, signal facts and operation log are persisted. The registered scratch cleanup then removes local artifacts.

**Impact:** This does not create a false green or establish a runtime failure. It weakens the selected repair's failure diagnosability by losing causal facts precisely when an actual-owner law check disagrees. Existing successful traces do not cover this branch; all retention currently follows driver success.

**Bounded repair and cost:** Add a narrow failure-path evidence return around the existing controlled drive. Preserve and rethrow the original thrown value after retaining the available trace. Do not await an owner that the failed schedule can no longer finish, synthesize an owner result, fabricate physical close, or add a second supervisor. Cost is one bounded test-owner error path and its discriminator.

**Successor acceptance:** A controlled driver rejection must preserve its exact error identity and available trace before rethrow, return without hanging on an unresolved owner, and label unavailable result/closure facts honestly. Normal completion keeps its present actual-owner proof relation. Root has selected this S3 alongside PHASE1-PROOF-001 rather than treating it as a separate broad repair.

# Properties supported by source inspection

The observer support replaces the old stopped/wake/done coordination with Ref state, one sealing transition, Deferred completion and scoped fibers. It checks eligibility before probing and at read settlement; at/after-cutoff values are not credited; stop seals before joining the owned scope. External reads resolve through ordinary Promise callbacks, while owned fibers wait on interruptible Deferred/sleep effects, so no finalizer is written to await the unresolved read. A sealed state is not rewritten by a late callback. The terminal snapshot is cloned and deeply frozen for the actual file JSON/text contract. The support uses parent performance.now consistently and chunks long deadline waits; it does not substitute wall-clock epoch time. I found no additional selected observer counterexample in this finite source review.

Eight declared observer tests cover pending-read stop, deadline while pending, post-cutoff/exact-boundary settlement before deadline wake, error/null, timely completion, huge finite cutoff, original owner result/thrown-value preservation, and real-host unresolved-read handback. They include snapshot nonmutation, idempotent stop and owned-fiber/timer checks. These are source coverage observations; execution standing is stated separately below.

The new controlled m5 checks load the real worker transport via the unchanged privateOwner harness and substitute spawn plus declared lifetime host seams. They call the real createMonotonicDeadline/createOwnedProcessLifetime rather than a copied timeout algorithm. The source schedules true acknowledgement renewal, false acknowledgement non-renewal, absolute non-renewal and late-data after direct exit, including the actual closed-capture branch. Their evidence-on-failure gap is PHASE1-PROOF-002.

Physical startup allowances are explicit and finite. The progress workload is 111 intervals of 50ms (5,550ms), exceeding its 5,000ms initial lease; the larger startup envelope does not itself erase renewal proof. Ordered acknowledged bytes/records replace the callback-count criterion, subject to PHASE1-PROOF-001's remaining derived timestamp defect. False-ack and timeout fixtures require observed premises. The post-exit fixture records actual TERM-triggered write attempt and outcome rather than relying on a timer that may never fire; the controlled late-data case separately exercises exclusion. Group/leader identity and actual absence checks remain. The new post-exit physical Windows skip is explicit and tied to its POSIX group fixture; the controlled exclusion case remains unskipped. No general platform/qualification claim follows.

The two lifetime call sites preserve owner result/error and settlement time before later artifact reads. Added evidence records retain actual physical observations and archives before their primary assertions. These improvements do not replace required external runs or prove every hypothetical failure input; arbitrary non-fixture probe values are outside this review.

# Execution standing and successor boundary

The native author reached its 900s limit with actual SDK `runtime_failed` and null terminalResult, as bound by Root's activation. The closed native return/FINAL receipts record actual close and fresh readbacks; FINAL SHA256 is `7d15cd62957b364458a03836afb490306e4566610efc22e259e2d0db3d6e38d2`. A null orchestration exception in FINAL is not native workflow success. Useful frozen source survives that failed Run without rewriting it.

Root reports four native Node syntax checks and the eight new observer tests passed. This review does not promote those author selfchecks into independent exact-freeze execution proof. No external m5, lifetime or original nine-file unit result has been admitted to this report. No reviewer test, build, Product import, runtime process, install, network operation, Git mutation or source repair was performed. Only this report and receipt are written.

Root's selected successor is confined to the two m5 Proof relations above. Reacquire its exact freeze, review the changed relations and their finite discriminators, then conjoin actual external observer/affected m5/lifetime/original-unit receipts from the same tested subject. No repeated-until-green evidence, timeout rebasing, extra acknowledgement, hidden skip or unexecuted assertion closes either defect. Original native failure, previous reds, both debts and full-5.0/native/qualification limits remain preserved. Root owns source acceptance, proof scheduling and final disposition.
