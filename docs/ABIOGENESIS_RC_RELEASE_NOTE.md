# abiogenesis 4.1.0-rc.3 Release Candidate Note

This checkpoint is the third TypeScript ABG `4.1.0` release candidate. It
follows `4.1.0-rc.2` with the ABG-owned retry-attempt lever and the T-109
traced-process guard repair needed to keep the ABI-owned frozen `odd_sdlc`
T-132 hello-world proof lane on the ABG substrate.

It is an RC candidate, not the final tapped `4.1.0` release.

## Release Claim

The TypeScript tenant remains the package-first GTL/ABG RC candidate. RC3 keeps
the `4.1.0-rc.2` traversal-unit and consequence-boundary surface, then adds the
ABG lever override path for bounded retry attempts and repairs the live
`odd_sdlc` harness so spawned downstream commands are traced through the ABG
process substrate rather than direct `child_process` calls.

RC3 carries forward the RC2 bind-boundary hardening and adds:

- `abg.runner.retry.max_attempts` as an admitted lever identity, registry entry,
  default config value, and consumed override event;
- typed override admission for max-attempt values, including invalid payload
  rejection and consumption evidence;
- `start(...)` wiring that resolves the retry-attempt lever through the shared
  lever registry before executing the engine-owned iteration runner;
- T-109 live-harness compliance for the frozen `odd_sdlc` proof by routing
  package install/build commands through `runTracedProcess`;
- a clean ABI-owned frozen `odd_sdlc` T-132 JavaScript hello-world live proof
  over the current source package, including code, tests, UAT source, execution
  preparation, and execution-result surfaces;
- package version advancement to `4.1.0-rc.3` for downstream consumers that need
  the corrected lever path and traced live proof harness.

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

RC3 does not introduce a new GTL ontology object or move downstream product
meaning into ABG. The change is an ABG runtime-control and proof-harness update:
retry-attempt bounds are resolved through the ABG lever registry, and live
proof subprocesses are admitted through the traced process substrate.

## Versioned Artifacts

- RC branch: `main`
- RC identity: `4.1.0-rc.3`
- Candidate package version: `4.1.0-rc.3`
- Candidate tag: `v4.1.0-rc.3`

## Verification

Current qualification evidence for this cut:

```text
ABI release gate:
  npm run test:semantic
  passed, 876 tests, 0 failures

  npm run test:b016
  passed, 14 tests, 0 failures

  npm run test:t072
  passed, 15 tests, 0 failures

  npm run lint:semantic
  passed

Focused lever proof:
  npm run build:semantic && node --test \
    test_env/tests/test_t118_lever_overrides.test.mjs \
    test_env/tests/test_t118_override_consumption.test.mjs
  passed, 14 tests, 0 failures

T-109 direct callout guard:
  npm run build:semantic && node --test \
    test_env/tests/test_t109_agent_callout_guard.test.mjs
  passed, 1 test, 0 failures

ABI-owned frozen odd_sdlc T-132 live proof:
  npm run test:t159:odd-sdlc-t132-live
  passed, 1 test, 0 failures
  runRoot:
    build_tenants/abiogenesis/typescript/test_env/test_runs/t159_odd_sdlc_t132_frozen_live/20260621T143110113Z
```

The live proof converged through:

- `derive_lite_design_adr_surface`
- `derive_lite_component_code_surface`
- `derive_lite_test_design_surface`
- `derive_lite_component_test_surface`
- `derive_lite_uat_test_source_surface`
- `prepare_test_execution_surface`
- `derive_test_execution_result_surface`

The generated tenant test also passes directly:

```text
node --test test/hello.test.js
Hello, world!
pass 1, fail 0
```

The release snapshot command rebuilds the semantic package, runs `npm pack`,
copies this release note, and writes manifest plus checksum evidence into the
immutable local snapshot directory.

## RC Decision

RC3 is the bounded-retry lever and traced live-proof candidate. It preserves the
RC2 bind-boundary behavior and treats direct subprocess callouts in ABG-owned
live harnesses as substrate violations. A clean frozen `odd_sdlc` hello-world
run is required evidence for this cut.
