# Correction: T-074 F_P Re-Entry And B-016 Overclaim

Source review:

- `.ai-workspace/comments/codex/20260426T114125Z_REVIEW_t071_t073_abg_ts_readiness_under_stdo.md`

## Decision

The review findings were valid.

T-072 proved an engine-owned runner, but it did not prove preserved F_P result
re-entry. `assessed` events were visible in projection but did not close the
matching vector, so a resumed F_P run could redispatch the same edge.

B-016 was also overclaimed. The TypeScript plugin inventory classified broader
hook families, but the runner only consumes runtime event sink, F_D evaluator,
F_P dispatch, and F_H admission seams.

## Fix

- `RuntimeAggregateProjection` now derives closure from admitted `assessed`
  events by matching the assessed edge to exactly one graph vector.
- duplicate assessed obligations for the same edge are idempotent.
- assessed edges outside graph truth fail closed.
- out-of-order assessed closure fails closed.
- `runEngineIterate(...)` emits `fp_dispatch_requested` before invoking the F_P
  dispatch plugin.
- `EnginePluginInventoryEntry` now carries `runtimeBindingStatus` and
  `proofScope`.
- B-016 moved back to backlog. T-072 remains a completed runner-slice proof,
  not full hook-standardization closure.

## Verification

```text
npm run test:t072
tests 14
pass 14
fail 0

npm run test:t044
tests 9
pass 9
fail 0

npm run test:b016
tests 13
pass 13
fail 0

npm run test:t066
tests 1
pass 1
fail 0

npm run test:semantic
tests 239
pass 239
fail 0

npm run lint:semantic
pass

odd_sdlc B-068/B-069 focused sandbox
tests 4
pass 4
fail 0

odd_sdlc npm run test:sandbox
tests 5
pass 5
fail 0

CODEX_LIVE_FP=1 npm run test:live:uat
tests 2
pass 2
fail 0
duration_ms 53448.786

CODEX_LIVE_FP=1 npm run test:live
tests 1
pass 1
fail 0
duration_ms 153622.118375

git diff --check
pass
```

## Current State

The emergent outcome-iteration tests pass with the corrected ABG tenant.

The TypeScript ABG runner slice is stronger than the prior T-073 record, but
the next RC statement must cite T-074 and rerun the chosen RC gates. B-016 is
open until the remaining classified hook families are either migrated through
runtime consumer contracts or explicitly retired as non-executable/read-only
surfaces.
