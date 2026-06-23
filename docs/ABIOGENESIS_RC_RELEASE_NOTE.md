# abiogenesis 4.1.0-rc.7 Release Candidate Note

This checkpoint is the seventh TypeScript ABG `4.1.0` release candidate. It
follows `4.1.0-rc.6` and promotes the source-authority and semantic-review
compiler gates required by odd_sdlc T-204.

It is an RC candidate, not the final tapped `4.1.0` release.

## Release Claim

RC7 keeps the RC6 evaluation-set retry repair, then adds two compiler/runtime
boundary repairs:

- `typecheckGtlProgram(...)` now admits source-authority policy rows and
  rejects declared source-authority regressions such as product-local command
  routing, raw archive authority, local retry/control ownership, read-model
  truth substitution, and stale requirement-marker caching.
- `typecheckGtlProgram(...)` now admits semantic review gates and fails closed
  when a semantic compiler review is stale, failed, blocked, or bound to the
  wrong subject.
- Consequence traversal action handling has an async construction-runner path
  so admitted construction re-entry can flow through async F_P dispatch without
  reducing the re-entry proposal to local engine authority.

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

RC7 does not move downstream product meaning into ABG. The compiler rows are
generic ABG inventory gates over source identity and review evidence; downstream
products declare their own policies and reviews. The runner change keeps
construction re-entry in ABG-owned traversal/replay machinery while preserving
plugin proposals as data.

## Versioned Artifacts

- RC branch: `main`
- RC identity: `4.1.0-rc.7`
- Candidate package version: `4.1.0-rc.7`
- Candidate tag: `v4.1.0-rc.7`

## Verification

Required evidence for accepting this RC:

```text
ABG semantic build and focused conformance/traversal lane:
  npm run build:semantic
  npm run test:t156

ABG release gate after the version bump:
  npm run lint:semantic
  npm run lint:test-harness
  npm run test:semantic
  npm run test:t141
  git diff --check
  npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run

odd_sdlc substrate proof over RC7:
  npm run build:semantic
  focused T-204/T-192/T-194/T-197 substrate gates
```

The release checkpoint recorded the ABI deterministic gates as passing before
snapshot creation:

- `npm run build:semantic && npm run test:t156`
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

RC7 is the source-authority and semantic-review compiler gate candidate. It is
releaseable after the ABI deterministic release checks pass, the release
snapshot is written from a clean source commit, and odd_sdlc consumes the RC7
snapshot without substrate-binding regressions. The live Claude T-141 transport
failure remains external evidence, not an ABI semantic failure.
