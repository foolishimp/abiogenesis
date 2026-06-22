# abiogenesis 4.1.0-rc.5 Release Candidate Note

This checkpoint is the fifth TypeScript ABG `4.1.0` release candidate. It
follows `4.1.0-rc.4` and repairs the ABG-owned consequence-bind closure boundary
exposed by odd_sdlc T-204/T-205 hello-world traversal.

It is an RC candidate, not the final tapped `4.1.0` release.

## Release Claim

RC5 keeps the RC4 replay and graph-function identity repairs, then adds one
runtime-law repair:

- ABG emits `vector_closed` only after consequence projection admits and any
  consequence traversal action has been consumed. A blocked consequence bind or
  traversal-action continuation can no longer leave a closed-vector fact beside
  a terminal gap-stop result.

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

RC5 does not move downstream product meaning into ABG. The change is an ABG
runtime-control repair for traversal-unit bind closure: vector closure is a
post-consequence fact, not a pre-consequence optimistic fact.

## Versioned Artifacts

- RC branch: `main`
- RC identity: `4.1.0-rc.5`
- Candidate package version: `4.1.0-rc.5`
- Candidate tag: `v4.1.0-rc.5`

## Verification

Required evidence for accepting this RC:

```text
ABG semantic build and focused traversal/replay lane:
  npm run build:semantic
  node --test test_env/tests/test_m03_engine_kernel_integration.test.mjs \
    test_env/tests/test_t152_consequence_traversal_action_bridge.test.mjs \
    test_env/tests/test_t084_attached_fp_worker_loop.test.mjs \
    test_env/tests/test_t156_consequence_allowed_traversal_catalog.test.mjs \
    test_env/tests/test_t156_consequence_ticket_traversal_bridge.test.mjs

odd_sdlc substrate proof over RC5:
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
