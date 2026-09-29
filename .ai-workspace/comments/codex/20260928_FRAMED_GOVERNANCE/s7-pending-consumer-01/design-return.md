# S7 pending-consumer HOW — closed design return

2026-09-29; `T287_S7_PENDING_CONSUMER_HOW_01`; Astra/xhigh. Product/Owner,
Continuation and End-To-End Interface Integration; selected STDO2.5.1-rc.1.
Proposal only; implementation and positive installed qualification remain open.

[Proposed owning HOW](../../../../../build_tenants/abiogenesis/typescript/design/T287_PENDING_CONSUMER_CONTINUATION_DESIGN.md)
is 13,288 bytes, SHA-256
`7dacc73e6e5abc7ef0e7e026c549d36aef295cea89e3ae0e8ee09513f93f67b5`.
The new file leaves the frozen S6 HOWs untouched.

The missing installed `continue.current_intent` member is the first symptom of
a framework capability/composition defect. It is not a provider-quality,
optimisation or task-complexity diagnosis. The existing Continuation projection
and public admission only handle F_H; failed Run activity cannot be resumed by
passing a cursor; and generic replacement use of retained producer evidence is
not established by the library's current same-invocation/Run guards. The HOW
therefore rejects an export-only increment and identifies the full causal join.

Selected proposal: use the existing Public family and exact-prefix resource
owner; derive the non-F_H pending obligation and progressed input from admitted
frontier/cursor/origin facts; admit its single consumption; restore active
execution or, after failure, admit a causally linked replacement Run with the
exact pending position and retained input; refresh mutable dependencies; and
return through HoG's current consumer, workflow/recursion folds and normal
closure/readback. The missing admitted reentry binding belongs to the existing
invocation/execution/Continuation owners. Old producer Result/call/actor and
assessment status remain historic facts, never copied replacement execution.

This requires corresponding generic projection/admission and retained-source
applicability work, not merely reuse of F_H, a retry helper or `sourceResultBasis`.
The existing gap-specific `InvocationReentryBasis` is the extension seam; it is
not already a pending-consumer carrier. HoG's parent rehydration validates held
frames today; the pending case also needs exact parent derivation from admitted
relations and replacement-scope correspondence. The proposal names these limits
instead of presenting APIs as available. No new Product outcome, external
controller, event ledger, graph generator or F_D semantic selector is proposed.

The finite discriminator is one same-candidate producer success followed by a
real pending preparation refusal for an absent declared mutable assessment
input; supply only that input, then cold Public current-intent, no producer
repeat, actual independent assessment/parent evaluation, and both fresh reads.
Reuse prior valid source-origin/currentness/independence and authority negatives.
Changed-authority recovery of earlier Runs still needs exact covering reprice
and binding; native-human continuation remains separate. Neither is credited by
this proposal. Stop on the first unexpected execution failure, after retaining
its first cause; another paid attempt is not a diagnosis.

## Exact subject and read boundary

Core archive (previously verified by S7 entry review):
`1722953b7391e593079e3436b729b13c55457c734fb441d5e08b604edf9c462d`.
Selected source checkpoint: `9ba8b2dd`; current read-only HEAD observation:
`dfab9013fefae754202b7c3adc1d8562b57dcb18`. No Git mutation occurred.
This intake did not repeat archive extraction, installation or qualification.

Authority / prior closed input | SHA-256
---|---
`specification/PRODUCT.md` | `179ee0e82b4617e4bb40bba0fb91200ada684e94592bf9dc61812fab365aa7a1`
`REQ-R-ABG3-CONTINUATION.md` | `c062ea26440b23e71101ae8f1161634972b67ad1324d90cd295e2bc302773b97`
`s7-recovery-readiness.md` | `64619353ec5042719988ead507506c0d53707ae352a063d5a26e84ab48a56a96`
`s7-recovery-coverage.md` | `edb70086fa0098adcb1a0665f53d2769ca607e7f3c803a6621c81657b4e01010`
S6 `source-generated.json` | `616407f6e297e02d3bf2babd7f9623ba942c4f665143e964cc8afc26fcf67600`

Selected current source under `code/src/` | SHA-256
---|---
`product/run_operation_contracts.ts` | `50d61dc0dbccd2959ea0f4e333ae188b52a18aad3399e2bda2f94e6f411c126a`
`owner_bindings/run_invocation.ts` | `18ba4565d164c92eb5f2801849cb15f8cd2674b0fe46767981c7f15df62ec804`
`abg/continuation.ts` | `d3632e0fc06119e938c9e514d517cb72a40ad66b3771ce10dc1f249b32207acb`
`abg/fh_continuation_projection.ts` | `baa540f0d22c6eddfb3a6542f9fbbdf3f3bb754c06fb857563ca36b183ca1a42`
`abg/invocation_admission.ts` | `4f47f3084d8079d0dd04989e4aa35c7beeb56ed59cd92d05046b555b8d440cba`
`abg/execution_basis.ts` | `c690981e21731982b4dabe7c6551d5a73e3c0edac1c3c7f57999d40daa86ac41`
`abg/open_call.ts` | `feaac74dad32b3f83e28d420321dce164c2474ed6b9e23bdf649eb7da0ca319d`
`abg/traversal_cursor.ts` | `84952e40e6689afac9a1471c92eb3385e60eefa5ce5cf8d305269d2d395d9b90`
`abg/event_calculus.ts` | `354dde450eda3c986c25ec4919f2884ef54a13d4bebde8647693a6af97f2ed0e`
`abg/event_store.ts` | `8073f5340046a5709cef86c27f2bb51f8e006fb473db4969c5fe7707c4772e99`
`abg/runtime_failure.ts` | `0d40af8644685795280b19ea26e7a4baed210abad7c24319957e2db6eb25f994`
`abg/default_library.ts` | `1b57d6a434f10027c024d558f01d34c038bb61e62e4dd205f62646ae9a94bc24`
`hog/entry.ts` | `b8678ce530049637dc71eb010483e4910c83d9ce9584c480443c95eb993293f9`
`hog/parent_rehydration.ts` | `6c324439dd134b2dac0ca4202b0b622f200bfe5a066838e11533236292c4338a`
`hog/graph_execute.ts` | `b15acbbc0280833b7e7e5f0e367fbc7ebffee4e3ecf503d11253d8bd0f01bb55`
`hog/retry_lifecycle.ts` | `c1b2a20e993f3f644d372f4fa3604f373bef35aa7b965477ce74e22e574a1b55`
`public/continuation_authority.ts` | `85368e8cbac3f546d6473c962edaf20873d692a6322b5b243efb714677529966`

Only causal owner slices and directly relevant prior HOWs were inspected. The
old F_H/vector and runtime-transition HOWs supply applicable conservation law,
not permission to restore retired orchestration. All 26 members named by the
S6 source/generated manifest were hash/length checked unchanged. This is a
preservation check, not a fresh regression or a claim of implemented recovery.

Only the new HOW and this return were written. No core/test/fixture/authority,
existing HOW, frozen S6 proof, build, install, provider, runtime or Git effects.
Return closed for Executive disposition and independent design review; Worker
stops before implementation.
