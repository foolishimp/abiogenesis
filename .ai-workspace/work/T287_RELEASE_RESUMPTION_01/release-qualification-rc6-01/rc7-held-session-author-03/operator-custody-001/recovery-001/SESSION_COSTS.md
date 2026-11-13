H03 timing is consolidated from held receipts. Source custody remains closed and proof remains partial.

Cost record: [SESSION_COSTS.json](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/rc7-held-session-author-03/operator-custody-001/recovery-001/SESSION_COSTS.json) — `7ebfd0cb10c9f4bef5e0274514bd47a14d9055717d1cd3a0f35f152d09fc3641`.

| Category | Interval | Duration | Meaning |
|---|---|---:|---|
| Between tasks | H02 close summary → first H03 host | 50m 20.003s | Operator/proof/review interval |
| Failed preparation | Request → host | 8.847s | UTC landmarks |
| Failed preparation | Identity / acquisition / environment | 11.396s / 293.235s / 121.341s | Owner phase marks |
| Failed preparation | Environment → failure, cleanup and close | 21.881s | Composite; construction completion absent |
| Failed preparation | Host / outer command total | 7m 27.853s / 7m 37.898s | No SDK invocation or actor |
| Between attempts | Failed host close summary → recovery host | 12m 56.296s | Operator recovery interval |
| Recovery setup | Request → host | 5.071s | UTC landmarks |
| Recovery setup | Identity | 8.178s | Owner monotonic phase |
| Recovery setup | Acquisition after identity | 5m 40.489s | Owner monotonic phase |
| Recovery setup | Environment after acquisition | 5m 16.965s | Owner monotonic phase |
| Recovery setup | Call construction | 2.759s | Owner monotonic phase |
| Recovery launch | Prepared → actor | 22.324s | Derived UTC/monotonic landmarks |
| Recovery launch | Host → actor | 11m 30.714s | 16:47:42.126 → 16:59:12.840 UTC |
| Native + return/close | Actor → host completion summary | 34m 52.619s | Composite; exact SDK return instant absent |
| Stage within actor interval | Setup / compile / generation | 40.841s / 116.576s / 180.074s | Compile passed; generation timed out at 180s; lifecycle unrun |
| Return observation | First authored-return observation → host summary | 2m 47.841s | Observation interval, not actual SDK-return latency |
| Close observation | First close-receipt observation → host summary | 3.650s | Observation interval, not exact close duration |
| Recovery total | Host / outer command total | 46m 23.320s / 46m 30.131s | SDK result/completed; host exit0 |

The authored return appeared between 17:31:05.128 and 17:31:17.618 UTC; the close receipt appeared between 17:33:23.006 and 17:34:01.809 UTC. Actual SDK-return and physical-close instants were not separately timestamped. Receipt appearance to appearance is bounded at 2m 05.388s–2m 56.680s, not an exact runtime interval.

The author’s `2026-11-07T00:00:00Z` progress timestamp and `2026-11-07T04:31:00Z` return timestamp remain preserved but are excluded from chronology. Build phases sit within the actor interval; rows must not be summed as disjoint costs. No speedup, timeout-cause, acceptance or qualification claim.
