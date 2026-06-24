# abiogenesis 4.1.0-rc.9 Release Candidate Note

This checkpoint is the ninth TypeScript ABG `4.1.0` release candidate. It
follows `4.1.0-rc.8` and adds the ABG-owned semantic compiler F_P review
producer/admission contract required by odd_sdlc T-204.

It is an RC candidate, not the final tapped `4.1.0` release.

## Release Claim

RC9 keeps the RC8 process-actor progress lease repair, then adds one compiler
gate repair:

- `constructAbgSemanticCompilerFpReviewGraphFunction()` publishes the ABG-owned
  semantic compiler F_P review graph-function carrier.
- `constructAbgSemanticCompilerFpReviewResult(...)` and
  `admitAbgSemanticCompilerFpReviewResult(...)` bind a review result to the
  reviewed package digest, ABG review graph-function digest, runtime ref, and
  admission ref.
- GTL program conformance semantic review gates now reject passed/zero-finding
  rows that do not carry the ABG producer/admission provenance.

These repairs preserve the governing split: ABG owns traversal, replay,
continuation, runtime events, and consequence transition. Product tenants expose
domain graph functions, policies, prompt surfaces, prompt review packages, and
plugin outputs as data.

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
- RC identity: `4.1.0-rc.9`
- Candidate package version: `4.1.0-rc.9`
- Candidate tag: `v4.1.0-rc.9`

## Verification

Required evidence for accepting this RC:

```text
ABG semantic build and focused compiler gate lane:
  npm run build:semantic
  node --test test_env/tests/test_t150_gtl_program_conformance_tool.test.mjs

ABG release gate after the version bump:
  npm run lint:semantic
  npm run lint:test-harness
  npm run test:semantic
  npm run test:t141
  git diff --check
  npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run

odd_sdlc substrate proof over RC9:
  npm run build:semantic
  focused T-204/T-192/T-194/T-197 substrate gates
```

The release checkpoint recorded the ABI deterministic gates as passing before
snapshot creation:

- `npm run build:semantic`
- `node --test test_env/tests/test_t150_gtl_program_conformance_tool.test.mjs`

The remaining release-gate commands must pass before the RC9 snapshot is
accepted as a downstream substrate.

## RC Decision

RC9 is the semantic compiler F_P review producer/admission candidate. It is
releaseable after the ABI deterministic release checks pass, the release
snapshot is written from the source commit, and odd_sdlc consumes the RC9
snapshot without substrate-binding regressions.
