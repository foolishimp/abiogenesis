# abiogenesis 4.1.0-rc.4 Release Candidate Note

This checkpoint is the fourth TypeScript ABG `4.1.0` release candidate. It
follows `4.1.0-rc.3` and repairs the ABG-owned traversal/replay boundary exposed
by odd_sdlc T-204 live data-mapper continuation.

It is an RC candidate, not the final tapped `4.1.0` release.

## Release Claim

RC4 keeps the RC3 lever and traced-process surface, then adds two runtime-law
repairs:

- consequence traversal bind accepts graph-function name aliases when they
  resolve to the current execution basis graph function identity;
- resumed CLI starts seed canonical runtime-event admission ordinals from replay
  before appending new events, so a continued workspace cannot append ordinal
  zero into an existing event stream.

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

RC4 does not move downstream product meaning into ABG. The change is an ABG
runtime-control repair for replayed continuation and typed graph-function
identity at bind boundaries.

## Versioned Artifacts

- RC branch: `main`
- RC identity: `4.1.0-rc.4`
- Candidate package version: `4.1.0-rc.4`
- Candidate tag: `v4.1.0-rc.4`

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

odd_sdlc substrate proof over RC4:
  npm run test:t132:hello-world-live

odd_sdlc data-mapper target continuation:
  genesis-ts start --workspace . --scope workspace \
    --target graph_function:lite_design_module_implementation --until converged
```

The final release checkpoint must record the concrete passing archives before
this RC is pushed as accepted.

## RC Decision

RC4 is the traversal replay and graph-function identity repair candidate. It is
releaseable only after the odd_sdlc hello-world and data-mapper proof lanes run
against the RC4 tarball and converge without root-boundary regressions.
