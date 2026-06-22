# abiogenesis 4.1.0-rc.6 Release Candidate Note

This checkpoint is the sixth TypeScript ABG `4.1.0` release candidate. It
follows `4.1.0-rc.5` and repairs the ABG-owned evaluation-set retry boundary
exposed by odd_sdlc T-204 hello-world traversal.

It is an RC candidate, not the final tapped `4.1.0` release.

## Release Claim

RC6 keeps the RC5 consequence-bind closure repair, then adds one runtime-law
repair:

- A blocked required `plugin.evaluate.C.rule[*]` result can drive ABG same-edge
  retry when the admitted `EvaluationRuleOutcome` carries explicit
  continuation refs. Missing required rules and blocked rules without
  continuation refs still fail fast as `evaluation_set_incomplete`.

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

RC6 does not move downstream product meaning into ABG. The change is an ABG
runtime-control repair for evaluation-set retry: retryable evaluator/runtime
failures are consumed through ABG retry repair events instead of being reduced
to terminal gap-stop truth before consequence or continuation can run.

## Versioned Artifacts

- RC branch: `main`
- RC identity: `4.1.0-rc.6`
- Candidate package version: `4.1.0-rc.6`
- Candidate tag: `v4.1.0-rc.6`

## Verification

Required evidence for accepting this RC:

```text
ABG semantic build and focused traversal/replay lane:
  npm run build:semantic
  node --test test_env/tests/test_t145_evaluation_set_phase.test.mjs \
    test_env/tests/test_t084_attached_fp_worker_loop.test.mjs \
    test_env/tests/test_t152_consequence_traversal_action_bridge.test.mjs

odd_sdlc substrate proof over RC6:
  npm run test:t132:hello-world-live

odd_sdlc data-mapper target continuation:
  genesis-ts start --workspace . --scope workspace \
    --target graph_function:lite_design_module_implementation --until converged
```

The final release checkpoint must record the concrete passing archives before
this RC is pushed as accepted.

## RC Decision

RC5 is the consequence-bind closure repair candidate. It is releaseable only
after the odd_sdlc hello-world and data-mapper proof lanes run against the RC5
tarball and converge without root-boundary regressions.
