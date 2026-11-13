# RC11-CAUSE-01 assessment

## Product Frame

Fixed fifteen ABIogenesis 5.0 families F01–F07/F09–F11/F13–F17 remain under active GOAL-035/T-287. This slice concerns transport/lifetime **Proof**, informed by Product/Design/Owner/Effect boundaries: GTL defines meaning, HoG traverses, ABG alone admits runtime truth. Diagnostic observations cannot become runtime authority, reset clocks or grant acknowledgements. TRANSPORT-002/003/008/016/018/027/030 and the local Design atlas §5.3 apply.

Exact accepted subject: commit `e2ba05da572f4a7e68d0629ecc83b9153a15e7c4`, frozen source `cfd7ead1bf29c9c1eed0c97ff9e8e30fccb170d89f1f11cc2bfe4f9c90067b6c`, compiled inventory `16497c6763f0cb07a2227cb0ce6de2445e14044b94c6542d0523adbd1ad18d7c`. Fresh installed STDO verification returned valid, no failures: 3.0.4 manifest `102817a3f4bea4dca1d6fa0fc634b94404dd2ba82ba6d8c38b273402dda9f95b`; unchanged Definition, empty composition, accepted project frame `2c2a3295928b4a40cd423623145c029b08f0f79576a086df7506f002627a1f10`. Executive-baseline §11 Proof governs evidence congruence.

Reviewer reused disclosed prior context and advised diagnostic design; no clean-context or independent acceptance of an authored repair is claimed. No candidate/source edits, Product execution, Git or tracking mutation occurred. Only these two granted reports are written.

## Conclusion and certainty

**Test-owner repair is justified; a production patch is not presently justified.** Demonstrated findings are missing fixture premises, a chunk-dependent oracle, a vacuous post-exit sample and an asynchronous publication-observation race. Their responsible relations are known. The unique host/scheduling/capture causes of the original failures remain indeterminate because cleanup erased their actor facts.

Stage1 completed 6/6 in 5.254 seconds. Stage2A deliberately delayed six fixture bodies by 600 ms and reproduced all six original failure predicates in 4.033 seconds, with unchanged owner deadlines/assertions. Both closed without residue. This establishes a sufficient failure mechanism, not historical equivalence. Fresh TMPDIR/compile cache, synchronous sidecar fsync and instrumentation are explicit covariates.

## Six-case causal assessment

| Case | Established relation and remaining uncertainty |
| --- | --- |
| Resistant worker | Stage1 installed the TERM handler, captured acknowledged progress, reached absolute timeout and SIGKILL. Stage2A prevented handler/progress execution; inactivity at203.108ms caused ordinary SIGTERM exit. The test assumes readiness before its200ms lease. Original285.991ms failure lacks the result needed to identify which prerequisite failed. |
| Progress lease | Stage1 produced complete86bytes in8true-ack callbacks. Stage2A produced no progress and timed out at121.327ms. Original212.3245/168.895166ms durations are below the nominal six40ms completion intervals, favoring early termination over completed-output/coalescing alone; exact original cause remains unknown. The>=7chunk oracle is independently defective. |
| Unacknowledged output | Stage1 captured44bytes through4false acknowledgements, then inactivity at153.778ms. Stage2A and diagnostic-01 had no capture/callback, so their intended nonempty false-ack premise was unestablished. Neither proves incorrect renewal. |
| Owned groups | Stage1 reached all six worker/command/HTTP normal/TERM modes. Stage2A HTTP-normal returned `port_file_timeout`, SIGTERM, exit128 and `timedOut:false`, then identity-file ENOENT; HTTP-TERM was unexecuted. The500ms request/readiness budget includes startup. Original ENOENT hid the complete probe result and cannot establish a cleanup defect. |
| Post-timeout output | Stage1 installed/invoked the handler and captured111late raw bytes while semantic output stayed empty. Stage2A timed out before handler installation; empty stdout reproduced the failure. Original absent output cannot distinguish that mechanism from capture ordering. |
| Post-exit output | Stage1 leader exited47; group TERM followed at120.400ms. Descendant recorded its225ms timer installation but no firing/write, and scope closed. This actual green sample did not exercise late emission. Stage2A prevented original body/exit47, yielding inactivity/SIGTERM/statusnull. Original null-status cause remains unknown. |

Causal cone: test preparation → OS/Node startup → fixture handlers/timers/publications → stream emission → parent capture/archive → acknowledgement/lease → owned-process exit/cleanup → result → assertion → scratch deletion. HTTP adds port publication/polling. Changed RC11 resolver/leaf fixtures are outside these failing paths.

## Proof defects and why checks missed them

**M5 Proof, S2; runtime severity indeterminate.** Exact extracted oracle accepts8or86callbacks and rejects1,6or4 for identical ordered86bytes. The four-capture schedule has80ms gaps and240ms duration against120ms inactivity: arithmetic feasibility only, not executed runtime evidence. Counts cannot represent transport-record completeness. Stage1 also demonstrates the post-exit emission premise can be absent despite green assertions. Early assertions discarded returned owner facts, cleanup removed evidence, and prior green checks did not require readiness/emission predicates. No host-load or flakiness attribution follows.

**Publication observer, retained S3.** The outer guard is not rechecked after `await probe()`. Exact-source controlled cases credit values after stop, start the next probe after stop, and report complete at10and11ms for a10ms cutoff. A constructed never-resolving probe leaves stop unsettled during26.419ms observation and has no resolution path. This is a proven observation/handback defect, not a Product-clock defect. Earlier18-case evidence had individually timely rows and did not exercise these interleavings.

## Minimal plan, owner and closure

1. **Existing m5 test owner; realization_refactor.** Retain raw results/errors, actor records and artifact bytes before assertions/cleanup. Replace chunk-count proof with complete ordered content. Add deterministic exact-owner checks for true/false acknowledgements, original deadline boundaries, segmentation and late capture. Physical fixtures need a prospective finite startup envelope and explicit readiness/emission premises. Genuine progress must last beyond the initial lease; merely raising120ms above the240ms workload destroys renewal proof. Keep clocks anchored at their existing boundary, with no artificial acknowledgements. Post-exit proof must witness an actual late emission attempt and its exclusion/closed-pipe outcome; deterministic capture checks must exercise the late-data branch. Missing readiness remains a failed prerequisite, not a pass.
2. **Existing lifetime test owner; realization_refactor.** Check active/deadline before each probe and after each await. At stop/deadline return an immutable snapshot without awaiting an unbounded read; prevent late completion from mutating it or starting another probe. Snapshot completion is not file-read cancellation. Preserve strict cutoff semantics, original owner result/error and explicit missing/late classification.

Reproof: controlled split/coalesced delivery and deadline/ack cases; stop/deadline/exact-boundary/unresolved-probe schedules including snapshot nonmutation; then complete affected m5 and lifetime populations on one frozen successor, with nonvacuous physical premises and retained cleanup facts. Required unit/qualification gates remain with their owners; no blind repeats or green substitution. Two test files have a bounded repair cone; deterministic checks are cheap, real-process verification dominates cost. Avoid weakening oracles while improving setup robustness. Any demonstrated runtime violation returns to its owning Design/realization relation.

Original95/84pass/5fail/6skip and32/29pass/3fail remain historical red. Both debts remain open until successor proof and Root disposition; RC11 remains local/unqualified. Root owns activation, priority and acceptance.

## Evidence

Full pins are in the compact companion JSON; raw records/manifests remain at their original owners.

- [Frozen Stage1 and per-actor joins](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-qualification-01/root-cause-01/operator/STAGE1_RETURN.json) — `cd1efd942a0d48d922f0ffe7817267f45fdf1910f611445f45556f9f1675c5d1`.
- [Controlled600ms body-delay result](/private/tmp/abg-rc11-root-cause-20261110-01/stage2-a/run-01/six-case-delay-counterfactual/RETURN.json) — `dbe46edf3f4c9ca033077c8cb51dd9a528008f1ec678acad78707085acebfbc3`.
- [Exact-source oracle and observer counterexamples](/private/tmp/abg-rc11-root-cause-20261110-01/stage2-b/RESULT.json) — `9a04c2b0d3e28308efa0abb11de95e07a583c47fddbbdfb959bbf706ce208b3a`.
- [Source extraction identities](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-qualification-01/root-cause-01/operator/stage2-b/SOURCE_EXTRACTIONS.json) — `d07e669f45e6bd57a4a161bdb474d350af306d525b0416ccb7d82aff8cdef953`.
- [Actual admitted Stage2B script](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-qualification-01/root-cause-01/operator/stage2-b/counterexamples.ready.mjs) — `d4a2b3e7808eb1ae6a13e5ab8528f4c42e7c25754377b9db276305b07af3e8e1`.
- [Registered debts](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-qualification-01/ROOT_DEBT_REGISTRATION.json) — `1e386dfd1a0858a4ae17e6d6ff0220fb68fe827709bda1fc8565a5e819f8cea1`.
- [Original unit triage](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-qualification-01/reviews/source-assurance-001/UNIT_TRIAGE_01.md) — `43c28cefc8b3f0485f30bd21df8bd5a03c1af0179d4f95b146fdd9c3b87be141`.
- [Prior bounded source/proof conjunction](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-qualification-01/reviews/source-assurance-001/DIAGNOSTIC_ADDENDUM_01.md) — `900a5b5f0348fa42a0576be49bfc5f210a0a8ef54b4fcf0fef896b54c69e412f`.
