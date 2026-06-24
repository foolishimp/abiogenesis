# abiogenesis 4.1.0-rc.8 Release Candidate Note

This checkpoint is the eighth TypeScript ABG `4.1.0` release candidate. It
follows `4.1.0-rc.7` and adds a process-actor progress lease required by
odd_sdlc T-204/Data Mapper design-depth evaluator proof.

It is an RC candidate, not the final tapped `4.1.0` release.

## Release Claim

RC8 keeps the RC7 source-authority and semantic-review compiler gates, then
adds one runtime progress repair:

- `runTracedProcess(...)` and `invokeSupervisedProcessActor(...)` now accept an
  external progress predicate with `externalProgressTimeoutMs`. Active stdout no
  longer keeps a process alive when the declared artifact progress predicate
  never becomes true.
- The traced process outcome now distinguishes `external_progress_timeout` from
  hard timeout and stdout inactivity timeout.
- PTY execution uses the existing screen-session shutdown path for external
  progress timeouts, so terminal-backed agent runs do not leave detached
  sessions alive after a progress-lease breach.

These repairs preserve the governing split: ABG owns traversal, replay,
continuation, runtime events, and consequence transition. Product tenants expose
domain graph functions, policies, prompt surfaces, and plugin outputs as data.

## Boundary

The governing execution framing remains:

```text
ABG.start(fn<A, B>.C)
  .bind(system.openGraphCall)
  .bind(system.openFrame)
  .bind(system.planTransformSet)
  .bind(plugin.transform.C.task[*])
  .bind(system.admitTransformTaskResult[*])
  .bind(system.writeTransformEventsAndLedgers)
  .bind(system.collectTransformSet)
  .bind(system.planEvaluationSet)
  .bind(plugin.evaluate.C.rule[*])
  .bind(system.admitEvaluationRuleResult[*])
  .bind(system.writeEvaluationLedgers)
  .bind(system.collectEvaluationSet)
  .bind(system.assuranceFold)
  .bind(plugin.consequence.C)
  .bind(system.admitConsequenceProjection)
  .bind(system.traversalTransition)
  .bind(system.replayContinuation)
```

RC8 does not move downstream product meaning into ABG. Downstream products still
own the artifact predicate. ABG owns the generic process lease, timeout outcome,
runtime interruption event, and terminal-session shutdown.

## Versioned Artifacts

- RC branch: `main`
- RC identity: `4.1.0-rc.8`
- Candidate package version: `4.1.0-rc.8`
- Candidate tag: `v4.1.0-rc.8`

## Verification

Required evidence for accepting this RC:

```text
ABG semantic build and focused process-actor lane:
  npm run build:semantic
  node --test test_env/tests/test_t097_supervised_process_actor.test.mjs

ABG release gate after the version bump:
  npm run lint:semantic
  npm run lint:test-harness
  npm run test:semantic
  npm run test:t141
  git diff --check
  npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run

odd_sdlc substrate proof over RC8:
  npm run build:semantic
  focused T-204/T-192/T-194/T-197 substrate gates
```

The release checkpoint recorded the ABI deterministic gates as passing before
snapshot creation:

- `npm run build:semantic`
- `node --test test_env/tests/test_t097_supervised_process_actor.test.mjs`
- `npm run lint:semantic && npm run lint:test-harness && npm run test:semantic`
- `npm run test:t141`
- `git diff --check`
- `npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run`

`npm run test:t141:live` was attempted as live-transport evidence, but the
Claude PTY executor returned intermittent `transport_failure` outcomes with
Claude API `500 Internal server error` responses. Those failures were isolated
to the external live transport; the deterministic T-141 saga-frontier lane
passed.

## RC Decision

RC8 is the process-actor external progress timeout candidate. It is releaseable
after the ABI deterministic release checks pass, the release snapshot is written
from a clean source commit, and odd_sdlc consumes the RC8 snapshot without
substrate-binding regressions.
