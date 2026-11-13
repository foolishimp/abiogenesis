# RC11 unit failure triage 01

## Product Frame

ABIogenesis retains the fixed fifteen 5.0 families F01–F07, F09–F11 and F13–F17 under GOAL-035/T-287. This bounded triage concerns the actual five worker/process component failures exposed by the selected RC11 unit proof. F03/F04/F10 and their transport, lifecycle, effect and Proof relations apply. It does not select new Product behavior or widen the three chosen RC11 capsules.

The retained basis is `stdo://releases/v3.0.4/`, manifest `102817a3f4bea4dca1d6fa0fc634b94404dd2ba82ba6d8c38b273402dda9f95b`, with definition `urn:stdo:product-definition:abiogenesis`, empty companion composition and Project Reference-Frame Basis SHA-256 `2c2a3295928b4a40cd423623145c029b08f0f79576a086df7506f002627a1f10`. Product and requirements were acquired before source assessment; their exact prior frame remains applicable. TRANSPORT-002/003/008/016/018/027/030 and EVENTS/PROJECTION owner boundaries preserve typed failure, acknowledged progress, physical facts and ABG admission as distinct relations. The common computational library design process family and stdout-window/raw-chunk relation locate the existing owners.

These tests exercise physical transport components directly. Their observations are evidence, not admitted runtime truth or Product closure. A successful process, passing component, failed assertion, physical group observation and completed native workflow remain distinct. No private event writer, alternate clock authority, fabricated physical state or qualification inference is permitted.

## Activation and closed standing

Root first activated `/root/rc11_source_assurance` for read-only independent triage, with no report mutation. This report preserves that closed return under Root's later exact report-only Writer grant for these two create-once files. It makes no implementation recommendation into work authority, no repair, no retry and no runtime effect. The original source and six-case component assurance reports remain unchanged.

**Observed whole-unit success is falsified:** the complete run has 95 tests, 84 passes, five failures and six explicit skips, exit 1; zero cancelled or todo. **The causal evaluation is indeterminate.** Supported causal localization and a structural proof-oracle weakness are recorded below; none establishes host load, flakiness, a new RC11 runtime regression or a cleanup defect as the cause of these failures. Priority and disposition remain Root's.

## Exact independently acquired evidence

`P11` is `/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-qualification-01`; `Q` is `/private/tmp/abg-rc11-proof-20261109-01`; source reads used `P11/native-02/frozen-source`, compared with fixed RC10 `/private/tmp/abg-rc10-retention-20261109` and `Q/work`.

| Evidence | Bytes | SHA-256 |
|---|---:|---|
| `P11/proof-01/reentry-03/UNIT_FAILURES.json` | 7471 | `c12e111e936a5142b096ad64e071ce1bcb85279cce536950cf584851b62591b5` |
| `Q/continuation-03/unit/RETURN.json` | 2621 | `46d3a6b984a1d08a8b7405c3c47f7a014630d3bad3ffa41ceb59ef943171be4d` |
| `Q/continuation-03/unit/stdout.log` | 42457 | `0849a76507db09f99e6de444ec0e7f20f194753a151a7b15e4c2936b6d581992` |
| `test_env/tests/m5-worker-transport.test.mjs` | 114763 | `5ed4fea4b2cc53d27cd913c307a54371b391a6fcab7d2dd2e8320a772f2121f8` |
| `code/src/abg/worker_transport.ts` | 50429 | `c6c0bddf101a0b89184e7eec75a53e1c54494df8f3dc42296c185a4a3316b067` |
| `code/src/shared/owned_process_lifetime.ts` | 12633 | `77feebf69af3c6df487d0d2954544fd6588f84a7c68fb00b03eda60b425756cd` |
| `code/src/implementation/worksite_command_helper.ts` | 68872 | `9f87e7315b815d1b5028ab1e8e146e7c5ccc04d84956b25a0ac9b365f1d626df` |

The four source files in the table independently compare byte-equal across RC10, frozen RC11 and proof work. Source remains freeze `45ad2d4e789d898b8af158f1b8ff11d8da5c817803d3a6930c53eb92913df621`, sourceDigest `cfd7ead1bf29c9c1eed0c97ff9e8e30fccb170d89f1f11cc2bfe4f9c90067b6c`. The receipt reports the retained compiled inventoryDigest `16497c6763f0cb07a2227cb0ce6de2445e14044b94c6542d0523adbd1ad18d7c`; its 996 listed members were independently verified in the preceding proof addendum. The same two known generated manifest/capability differences are retained. No new inventory-wide semantic comparison is claimed in this triage.

Actual argv already uses pinned Node24.7.0, `--experimental-vm-modules --test --test-concurrency=1 --test-reporter=tap`, followed by the nine unit files. There is no m5 per-test concurrency override. The whole process ended in 859.699928750284 seconds below the 900-second outer cap, with no timeout, output cap or controller signals; group absent, no cleanup needed, empty stderr. Therefore the five test assertions, not an outer timeout or parser failure, determine this unit failure. Unrelated host activity is unknown. The current retained environment has empty `NODE_OPTIONS`/`NODE_PATH` and no selected-action source/physical overrides, as independently acquired in the prior addendum.

## Source-to-failure localization

The changed `test_env/support/root-installed-environment.mjs` and `test_env/fixtures/language-structural/leaf.mjs` are not imported or reached by these five cases. Four cases invoke raw `runWorkerTransport` with synthetic local scripts. The owned-group case invokes that transport and the unchanged compiled private command/HTTP owners in its existing VM harness. No call goes through the changed installed-root resolver helper or prepared structural leaf. This excludes those direct changed paths as the immediate implementation cause; it does not exonerate all unchanged runtime behavior or establish equivalence of execution environments.

`worker_transport.ts:488–503` spawns, then binds the owned lifetime. Lines 543–546 renew only the inactivity deadline. Lines 647–659 deliver captured stream chunks and renew when the observer acknowledges them. Lines 663–664 arm initial inactivity and absolute deadlines immediately after spawn, before any child application readiness is established. These raw callers declare no native supervision wakeup or separate startup grace. `owned_process_lifetime.ts:139–297` records direct exit and group absence separately, supplies bounded TERM/KILL cleanup and returns facts. It does not infer successful fixture startup.

| Failed case and first failing assertion | Supported implication and unresolved alternatives |
|---|---|
| 51, force-termination, test lines701–755; line743 expected absolute, observed inactivity; duration285.991375ms | Inactivity200ms starts immediately; absolute350ms is reached only if acknowledged stdout arrives and renews in time. The script emits immediately once executing and then every20ms; callback always acknowledges. The observation establishes that the expected progress/absolute premise did not hold at the owner boundary, or that capture/renewal malfunctioned. The receipt contains neither first-capture timing nor output/ack sequence, so startup delay, later observation gap, and owner defect remain alternatives. Later SIGKILL/exit/absence assertions were not reached. |
| 52, progress lease, lines757–807; line802 `progressObservations >= 7` false; duration212.3245ms | Initial inactivity120ms, absolute600ms; script writes initially then every40ms through ordinal6. The first failing assertion counts data callbacks, not successful completion. Actual count and result are not printed. A structural weakness exists: multiple writes may coalesce into one stdout data chunk, so seven writes need not yield seven callbacks even when the owner renews correctly. The short observed duration also supports pre-completion interruption as an alternative; coalescing is not established as this run's cause. Later disposition/timeout/final-output assertions were not reached. |
| 53, unacknowledged output, lines809–848; line843 `rawObservations > 0` false; duration218.870583ms | Counter initialized zero and increments on each callback, so no stdout callback was observed. Initial inactivity150ms, absolute600ms; script first writes after20ms once executing. The intended nonempty-but-unacknowledged premise was not established. Later inactivity/disposition/output assertions were not reached. Startup/capture/early failure remain unresolved; this result does not show incorrect renewal from unacknowledged output. |
| 55, owned group loop, lines892–969; line954 missing `http-normal-leader.json`; duration3798.467625ms | The awaited serial loop completed worker-normal, worker-TERM, command-normal and command-TERM assertions before entering HTTP-normal. HTTP-TERM was not reached. `runHttpProbe` arms readiness/request at min(launch700ms, request500ms)=500ms from launch, and can terminate on missing port. The leader should synchronously write identity before spawning its descendant, but no identity file exists when the test reads it. No-child launch failure, termination before script-body execution, or early script failure remain possible. The returned probe's port/process/stderr facts are not printed before `readFile` throws. Missing identity cannot establish a cleanup defect or successful launch. |
| 56, post-direct-exit output, lines971–1034; line1023 status null rather than47; duration222.309791ms | Failure disposition and transport_failure assertions passed; later timeout/direct-exit/signal/output assertions did not run. Initial inactivity150ms includes child import, descendant spawn and a50ms timer before intended exit47. Status derives from `facts.directExit?.status ?? null`; null can represent signal exit, no observed direct exit or launch failure. Without processFacts, signal and timeout observations, the receipt does not decide whether the intended direct-exit boundary was reached or mishandled. |

The HTTP owner at `worksite_command_helper.ts:1196–1214` makes its500ms request interval part of port readiness; at1224 it requests termination when a port issue exists. It returns a typed observation on no-child/early-exit paths. The test's unconditional identity-file read masks that primary returned observation in the failure log. This is an evidence-loss boundary, not proof that HTTP launch or cleanup is defective.

Each failing test registers scratch cleanup through `context.after`/`t.after`, including its archives and identity files. The failure log therefore lacks the per-actor physical results needed for a unique causal judgment. No surviving actor-level archive or timestamp was acquired by this reviewer. Neighboring physical case durations are only contextual observations, not measurements of the failed actors' startup or evidence of host load.

## Attributed operator provenance

Root supplied the following independently closed operator facts. They are preserved as **attributed evidence**, not reacquired judgments of this reviewer:

- All580 compiled code members equal installed RC10 except version-only `contracts.js` and two declarations.
- Prior actual RC10 unit proof had95 tests,89 passes,6 skips in179.572 seconds.
- Prior execution used npm/spec plus structured reporters and `NODE_OPTIONS` heap8192; current proof uses direct Node/TAP and empty `NODE_OPTIONS`.

Those facts narrow source drift and show that a prior unit sample passed; the changed invocation/reporting/heap context prevents treating it as a controlled same-environment comparison. They do not identify the cause of this run or permit calling the failures flaky.

## Next discriminator, sufficiency and lawful re-entry

Root has authorized one unchanged complete m5-file run in the same retained work/build/environment with a300-second outer cap, then the still-unrun R6 and F04A files with900seconds each, sequentially stopping on failure. This report records the authorization; it supplies no execution result and launches nothing.

That single whole-file m5 sample is a proportionate next discriminator of persistence/context dependence. It preserves test order, original budgets, oracles, source and compiled identity. A pass supports that exact complete-file sample only. It cannot erase the original whole-unit red, identify its cause, prove host load, close the callback-count weakness, or count as another complete unit run. A repeated failure localizes a reproducible boundary but still requires actual returned owner facts plus startup/capture/acknowledgment/deadline observations before attributing it to readiness, renewal or cleanup. No automatic repeated attempts, deadline enlargement or semantic-oracle weakening follows.

R6 and F04A independently exercise the actual changed resolver/prepared-leaf cone; neither substitutes for failed m5 coverage. No result from those unexecuted files is assigned here.

The lawful next entry is bounded Proof execution admission under unchanged law. If later selected, evidence instrumentation or correction of the chunk-count oracle requires a separate exact Proof/realization-refactor Worker activation, preserving the original result and production policies. A runtime defect established from owner facts returns to its owning Design/realization relation. A Product, requirement or authority change requires its upstream re-entry. Root alone conjoins results and owns scope, priority, disposition and continuation.

## Residuals and invalidation

The observed failure result is exact; technical attribution remains indeterminate. No current Product/category violation or false physical-closure claim is established. The callback-count assumption is a supported bounded Proof weakness, independently of whether it caused case52 here. Its smallest repair scope, if selected after triage, is the one component observation/oracle with its affected proof; no runtime change is justified by that weakness alone. Unknown actual counts and missing actor results prevent a stronger severity claim about this run.

Changed source/build/environment, new material process facts, a repeated/passing exact discriminator, or another declared revising observation updates only the affected judgment. A subsequent pass does not invalidate the fact that this original complete unit failed. Existing source and six-case results retain their exact bounds unless new evidence crosses their dependencies. No whole5.0, native-workflow, installed-RC qualification, release or acceptance claim is made.
