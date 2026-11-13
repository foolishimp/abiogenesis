# Closed RC4 workflow timing and red flags

Read-only max reviewer `/root/rc5_scope_review` independently verified the exact closed log; this is Root's attributed report. It measures RC4 executing the RC5 workload, not RC5 runtime performance. [Machine-readable detail](PERFORMANCE_DETAIL.json), [nonoverlapping lifecycle](PERFORMANCE_LIFECYCLE.csv), [detailed coding-to-C2 handoff](PERFORMANCE_HANDOFF.csv).

The successful workflow took64m27.732s including fresh result/replay. SDK setup27.8495s and standalone artifact verification18.8977s are separate. Lifecycle dispatch through receipt was59m43.522s by monotonic timing. Actor process windows total38m08.799s; UTC endpoint accounting leaves21m34.743s outside actor windows, with20.139ms clock/endpoint residual.

| Red flag | Observed evidence | Existing owner and next causal discriminator |
|---|---|---|
| Long internal transitions | Coding Result to C2 launch14m25.340s, of which11m34.261s outside the selector actor. Largest foldback-to-reentry silence110.095s. C2 fibre-to-transport58.503s. | Prefix/history/liveness and recursion owners. Measure materialization, validation, hash, replay, append/fsync separately; event silence alone does not assign CPU cause. |
| Large admitted context | Initial preparation Result66,632,659B,50.68% of this Run interval.807 files contain49,638,930 decodedB. Archive + prior C2 event/helper + captured sample contribute38,271,982 entry-JSONB. | Governance worksite observation and C2 selected-input owners. Text roles were narrowed while read roots retained full observation. Each large body occurs physically once; audit actual consumers before removing required input. |
| Broad UAT search | Shell tool containing recursive grep spans417.586s,56.31% of UAT actor;13 progress reports up to390s. | Operator preparation: exact producer/proof routes were available. Use pinned paths; this is a shell-tool envelope, not grep-only CPU attribution. |
| Probe processing |1,907 probes /8,087,566B;1,555 from stdout and989 during coding. The long grep accounts for only13 stdout probes. | Existing liveness/process owner. Preserve observable meaning and measure duplicate work. Same-time probe bursts inherit producer timestamps; they are not parallel-execution or timing proof. |
| Cold reads and wrapper gaps | Fresh result56.849s, replay56.719s; receipt-to-first-read98.775s and between-read non-CLI71.097s. | Keep cold authentication, wrapper work and owned in-process reuse separate in the next measurement. |

The seven longest adjacent-event silences are110.095s (23634→23635 foldback),82.132s (23689→23690 selector stdout),58.503s (23800→23801 transport),51.435s (24254→24255 UAT basis),50.604s (23792→23793 C2 basis),38.203s (21550→21551 native basis),33.432s (24992→24993 final foldback). Across28 calls, Result-to-judgment gaps total223.298s. Referenced Results around2.4KB still have13–20s gaps.

The concrete static lead is repeated `selectValidatedRuntimeEventPrefix(store.readAll())` in liveness. `readAll()` materializes history and allocates a new derivation snapshot. The common library already has an owned-history path. This is a measured-location/static-caller finding, not yet proof of its CPU share.

The source authority, exact log coordinates, full caller/deletion mapping and remaining work now live in the [single-address-space causal map](../single-address-space-consolidation-01/CONTEXT_AND_CAUSAL_MAP.md). Historical failures and the frozen WORKFLOW_PERFORMANCE record remain unchanged.
