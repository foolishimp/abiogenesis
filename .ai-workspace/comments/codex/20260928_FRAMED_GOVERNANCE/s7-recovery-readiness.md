# S7 recovery lookup — incomplete readiness

Root's bounded read-only lookup under `T287_S7_RECOVERY_READINESS_01` preserves
the [closed applicability judgment](s7-recovery-coverage.md). No installed proof
or implementation is selected here. The current correction candidate is core
`1722953b7391e593079e3436b729b13c55457c734fb441d5e08b604edf9c462d`;
its independent readiness review is pending.

The needed relation is a successful producer followed by failed preparation of
its pending consumer, then cold recovery of that consumer with the actual
progressed input, conserved completed work and refreshed mutable observations.
The following existing owners establish narrower relations:

- `product/run_invocation_operation.ts` owns initial invoke/start preparation
  and source-result assertion. It does not itself expose the pending cursor join.
- `abg/continuation.ts:1227` prepares public continuation by reconstructing
  `projectFhContinuations`; the supplied continuation must match that projection.
  `public/continuation_authority.ts` carries the held graph and durable close
  basis. A failed F_D consumer preparation is not established as an F_H hold.
- `hog/retry_lifecycle.ts:192` resumes an admitted declared retry through its
  exact reconstructed frontier. Presence of this owner alone does not prove
  recovery of the required pending consumer through a supported installed entry.
- `t287-interrupted-event-resource-recovery.test.mjs` proves event-resource
  recovery with explicit lower-owner premises; it does not resume traversal.
  The owner-continuation cost test compares warm/cold projections. The old
  `m5-installed-retry` fixture uses a retired scenario constructor. None is
  promoted to this positive qualification claim.

The supported cold entry connecting the required pending consumer to those
owners remains **unestablished by this lookup**, not proved absent from the
Product. That exact join is the next discriminator. Do not add a caller-side
recovery loop, salvage a retired public envelope, import old Results, repeat a
paid producer, or expand this into another whole-code review. No tests, native
calls, installs, source/design changes or recovery proof ran. This note is a
Writer projection of the Executive lookup, not an accepted recovery design.

## Independent entry check — closed

Product frame: retained recovery must carry the successful producer's admitted output into its actual pending consumer without repeating that producer. This is the bounded `T287_S7_RECOVERY_READINESS_01` return, GPT-6 Astra / max, Product/Owner and Continuation frames under the accepted exact STDO v2.5.1-rc.1 basis. The earlier [applicability judgment](s7-recovery-coverage.md) remains valid; this inspection resolves the first entry uncertainty, without reopening S6.

**Not ready for a positive installed pending-consumer proof: the declared Public continuation entry has no installed owner callable.** This is a concrete capability/composition gap at the entry boundary, in addition to the still-open qualification obligation. It is not evidence that every lower recovery mechanism is absent.

**S7-R01 — retained continuation declaration does not reach its owner.** The actual path is:

1. [run_operation_contracts.ts:228](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/product/run_operation_contracts.ts:228) declares `abg.operation.run.continue#current_intent`, with `Product.RunContinuation` and member path `["continue", "current_intent"]`. [owner_contract_source_set.ts:175](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/shared/owner_contract_source_set.ts:175) assigns that contract root to `./product` / `RUN_DEFINITION_BINDINGS`; its execution-binding construction at line 445 preserves the declared member path. The packaged continuation operation contract contains that exact callable locator. This is an admitted declaration-family route, not an inferred helper name.
2. [product/index.ts:390](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/product/index.ts:390) re-exports the owner binding. Its actual definition at [owner_bindings/run_invocation.ts:1762](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/owner_bindings/run_invocation.ts:1762) is exactly `Object.freeze({ invoke: Object.freeze({ invoke, start }) })`. There is no `continue` member.
3. [installed_definition_call_transport.ts:217](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/public/installed_definition_call_transport.ts:217) walks that locator and explicitly returns `installed_binding_unavailable` when a member is absent. Dispatch at line 366 requires this resolution before running the definition. Consequently an otherwise admissible call reaches a missing `continue` member before any continuation owner can restore the pending consumer. This refusal is established by the actual source/package dispatch, not claimed as an executed runtime observation.

The frozen core `1722953b7391e593079e3436b729b13c55457c734fb441d5e08b604edf9c462d` was hash-checked. Six selected archive members were read directly and matched the corresponding emitted files byte for byte: `product/index.js`, `product/run_operation_contracts.js`, `owner_bindings/run_invocation.js`, `shared/owner_contract_source_set.js`, `public/installed_definition_call_transport.js`, and `contracts/public-operations/run/continue/operation-contract.json`. The archived binding and contract exhibit the same missing join. No new install or inventory campaign ran.

The existing start paths do not supply a hidden substitute. [run_invocation.ts:1465](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/owner_bindings/run_invocation.ts:1465) admits the invocation's input, line 1512 opens a root scope, and line 1576 executes with that input; it passes neither a projected pending cursor nor the retry/interaction-resume carrier. Optional `sourceResultBasis` is a source assertion, not that restoration. The local `recoverAndFinish` at line 1683 records/projects failure and finishes; it does not resume the failed consumer. Physically reopening an event resource does not change this semantic dispatch. The narrower F_H and declared-retry owners already recorded above remain useful existing machinery, but connecting an F_H-only helper would not establish the failed F_D preparation case by itself.

[Product:1169](/Users/jim/src/apps/abiogenesis/specification/PRODUCT.md:1169) retains automatic current-intent continuation, and [CONTINUATION-015/-016](/Users/jim/src/apps/abiogenesis/specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md:61) retains this producer/pending-consumer relation. The same-authority case is not excused by a lawful cross-authority `basis_fork_detected` refusal or by native-human deferral. The smallest necessary disposition is an owner-level implementation re-entry for the missing retained continuation composition, followed by the finite positive discriminator already specified in the applicability review. This return supplies neither a replacement design nor an assumption that adding an export alone completes the downstream join.

There is no supported positive setup to launch through this declared entry on the inspected candidate. Once its owner relation is established, the decisive case remains one successful producer, an actual pending-consumer preparation failure, cold entry on unchanged authority, and that consumer's execution with distinguishable progressed input, no producer repeat, required observation refresh, and coherent fresh reads. No full lifecycle rerun or paid producer recreation is implied. S6 preparation/execution and its accepted review remain unaffected. No tests, build, install, provider call, runtime probe, source/design/tracking/Git change or waiver occurred. The original 2,294-byte Executive note is preserved verbatim above.
