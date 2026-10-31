# Recovery 001: identity assertion stopped

The fresh-process continuation provider returned `fixture_consumed` with payload `preserved producer` and reported $0.035116. The installed Public receipt reported `result` / `completed` and no receipt failure, but its `resources.run` and returned `value.run` both identify `run://abiogenesis/2b6d94428e86aa9d0b3160d45960a63ed1569c5ef597c6da80fe4d2157ad1d0f`; the original prepared checkpoint names `run://abiogenesis/660918a5008533d404273249582ea4a43bc02ae3ea5d5e9fc66629477ccd27ae`. The operator command stopped at `continue.mjs:32` on its required run-coordinate equality assertion, with exit 1 as reported by Root.

Fresh `run_result`/`run_replay`, the consumed-continuation negative and subsequent same-Run event-join assertions were not reached. The [observation receipt](RECOVERY_OBSERVATION_01.json) pins the actual checkpoint, Public receipt, provider stream and returned event prefix. Provider success and a completed Public disposition do not establish recovery of the original Run. The cause is under independent triage; no retry or qualification is claimed.

Cumulative reported native cost is $89.1941966; the separate $8 reserve for B03's unknown charge yields $97.1941966 for comparison, without treating the reserve as a known charge. The prior spending limit was removed by the owner; other charges remain unknown.
