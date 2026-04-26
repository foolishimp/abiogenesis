# TypeScript ABG RC Requalification After Engine-Owned Iterate Repair

## Decision

TypeScript ABG RC is green again for the current `v3.4.0-rc.2` package-first
claim.

The earlier RC evidence was overclaimed. T-066 proved replay-derived
projection/decision/event primitives, but the test harness owned the loop. That
is useful substrate evidence, not release evidence that ABG owns
`start -> iterate`.

T-072 repairs the release blocker:

- M03 exposes `runEngineIterate(...)`
- M04 exposes `start(...)` as a thin public wrapper over the M03 runner
- `publicControlLoop(...)` is now a public control projection, not the runtime
  engine
- runner-facing seams use the admitted `EnginePluginContract` /
  `EnginePluginInput` / `EnginePluginOutcome` family
- malicious plugin contracts or outcomes cannot select vectors, emit runtime
  truth, close traversal, override graph-call/frame identity, return
  transitions, or own an iteration loop

## Repriced Evidence

T-066 remains historical proof of replay-derived iteration primitives. It no
longer carries RC authority for engine-owned graph-function execution.

T-071 remains green only under the repaired evidence chain:

```text
T-072 engine-owned runner
-> T-073 RC requalification
-> SDLC.TS PoC may start as a research product lab consumer
```

No downstream `odd_sdlc` or SDLC.TS proof is used to backfill ABG engine
authority.

## Verification

Observed on 2026-04-26:

```text
npm run test:t072
tests 11
pass 11
fail 0

npm run test:t072:plugins
tests 6
pass 6
fail 0

npm run test:semantic
tests 230
pass 230
fail 0

npm run test:t064
tests 3
pass 3
fail 0

CODEX_LIVE_FP=1 npm run test:live:uat
tests 1
pass 1
fail 0
duration_ms 21808.469459

CODEX_LIVE_FP=1 npm run test:live
tests 1
pass 1
fail 0
duration_ms 147970.3835

npm run lint:semantic
pass

git diff --check
pass
```

## RC Boundary

Green means the current TypeScript ABG package-first RC can be used as the ABG
substrate for SDLC.TS PoC entry.

It does not mean:

- SDLC.TS is already built
- every ABG hook in B-016 has been globally migrated
- future retry/deepening/product-domain behavior may bypass M03 runner
  authority

B-016 remains open for the broader hook inventory. T-072 closes only the
runner-facing plugin slice.
