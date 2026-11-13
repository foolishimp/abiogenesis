# R2 executed-evidence conjunction

Under the unchanged Product/Owner/Effect/Proof frame, **R2 is now confirmed by the paired actual-owner discriminator: pre-A passes; native03 fails.** The source finding and its exact native03 subject remain unchanged. R1's source-satisfied entry-count/stale-result relation remains separately pending external proof.

I reacquired the fixture, driver, input relation, returns, raw stderr and both observations; 61 referenced pins match, including the actual baseline and candidate modules. Campaign RETURN SHA256 `3bc4e31bb66280bda49c7987b62eeacf96967bef423a403d4a355e19c1a4e188` records one baseline and one candidate command, 0.877680375 seconds, no halt or retry. Both postguards retain sourceDigest `9ef03c33…`, 1,345 source rows and 582 compiled rows.

The same fixture calls immediate termination with grace100, emits exit-only from the first probe, and returns present from every probe. It records the immediate cut at clock zero before advancing any timer.

| Actual immediate-cut fact | Pre-A | Native03 |
|---|---|---|
| Controlled host signals before return | TERM, KILL | TERM |
| Cleanup deadline | 200ms | 300ms |
| Host probe entries / recorded count | 6 / 6 | 4 / 4 |
| Command result | exit0, assertions passed | exit1, first KILL assertion failed |

Candidate stderr fails “KILL requested before the outer immediate call returns.” Its subsequent deadline and timer assertions were not reached: 300ms is retained observation, not an assertion pass. Cleanup had already run and been recorded before this oracle. Candidate KILL occurs at controlled100ms and completion at300ms; baseline KILL is at0 and completion at200ms. Each disposes three streams, settles frozen completion and leaves no controlled timers. Both runner groups are recorded absent without external cleanup, signals or limit breach. Later bounded completion does not repair the lost immediate obligation.

This turns the source-predicted A regression into executed controlled evidence and refutes the author's claim of unchanged pre-A behavior for this path. Preserve the red candidate, passing baseline, original source review and older R1 reds. Repair still must preserve stronger cleanup intent independently of stale-result rejection without resurrecting already completed work. This test uses the real imported owner with synthetic child/probe/clock/signal; it establishes no OS process absence, installed qualification, full Phase2 acceptance or reliability result. No reviewer execution, repair or source/Git effect occurred.
