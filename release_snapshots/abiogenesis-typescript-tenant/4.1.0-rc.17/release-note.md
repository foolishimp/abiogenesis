# abiogenesis 4.1.0-rc.17 Release Candidate Note

This checkpoint is the seventeenth TypeScript ABG `4.1.0` release candidate.
It follows `4.1.0-rc.16` and publishes the GOAL-016 proof prerequisites needed
by downstream lifecycle consumers such as `odd_glc`.

It is an RC candidate, not the final tapped `4.1.0` release.

## Release Claim

RC17 preserves the earned rc16 recursive requirements substrate and adds the
generic runtime mechanics that were still missing from the odd_glc Hello World
ladder:

- `T-173` proves generic multi-role proof evidence. ABI admits separate
  subject-artifact, verifier-artifact, verifier-execution, semantic
  interpretation, requirement evidence binding, fold, residual, and disposition
  truth through the runtime route.
- `T-171` proves generic non-default command execution. ABI records declared
  command, cwd, environment, stdout/stderr, exit status, admitted evidence,
  requirement evidence binding, fold, residual, and disposition truth for a
  non-default executable.
- `T-172` proves generic long-running process plus request execution. ABI
  records process start, endpoint/environment binding, client request, response
  evidence, cleanup, admitted evidence, requirement evidence binding, fold,
  residual, and disposition truth.

JavaScript, Rust/rustc, service process, and HTTP request details are proof
scenario bindings only. ABI owns no language, toolchain, protocol, test,
service, release, readiness, or acceptability policy. Those meanings remain
plugin, GTL declaration, or downstream product policy. ABI owns only generic
actor/operator execution, admission, evidence-role projection, replay, fold,
residual, disposition, and query mechanics.

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

RC17 does not move downstream product meaning into ABI. Downstream products own
domain interpretation, policy overlays, prompts, plugin semantics, and
product-specific proof reading. ABI owns generic runtime facts, replay,
requirements-route truth, evidence admission, fold/residual/disposition
projection, continuation, and query mechanics.

## Versioned Artifacts

- RC branch: `main`
- RC identity: `4.1.0-rc.17`
- Candidate package version: `4.1.0-rc.17`
- Candidate tag: `v4.1.0-rc.17`

## Verification

Required evidence for accepting this RC:

```text
ABG semantic gate:
  npm run test:semantic

Focused GOAL-016 gate:
  npm run test:t173

Live F_P proof gates:
  npm run test:t171:live
  npm run test:t172:live
  npm run test:t173:live

Boundary and packaging gates:
  node --test test_env/tests/test_t109_agent_callout_guard.test.mjs
  git diff --check
  npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run
```

The release checkpoint recorded these gates as passing before snapshot
preparation. The current live proof artifacts are:

```text
T-171 non-default command execution:
build_tenants/abiogenesis/typescript/test_env/test_runs/t171_non_js_toolchain_execution_live/20260629T134455708Z_pid97032/non-js-toolchain-replay-manifest.json
artifact sha256:30ffdeda4968bcf49ffacad785ac70ab78474420b07ab4ca5b2779f3d9315235
route event count: 20

T-172 process/request execution:
build_tenants/abiogenesis/typescript/test_env/test_runs/t172_service_process_request_live/20260629T140453156Z_pid14978/service-process-request-replay-manifest.json
artifact sha256:0f817cd642667bf042fcb408884fbac5130eb83650ec4a5da9a166b105369c87
route event count: 26

T-173 multi-role proof evidence:
build_tenants/abiogenesis/typescript/test_env/test_runs/t173_generic_proof_evidence_live/20260629T131855445Z_pid76289/generic-proof-evidence-replay-manifest.json
artifact sha256:4c825ba13dd250d114f33f1d417d2d7470a5d62b3c3e917478e55c7e79d43206
route event count: 19
```

The final semantic gate before this release note update passed:

```text
tests 952
pass 952
fail 0
skipped 0
```

## RC Decision

RC17 is the ABI/GTL publication candidate for the odd_glc Hello World ladder
prerequisites beyond rc16. It is releaseable after the release packaging checks
pass, the release snapshot is written from the source commit, and downstream
lifecycle consumers pin this RC as GTL/ABI-owned substrate rather than
rebuilding execution, service supervision, request admission, evidence binding,
fold, residual, disposition, or controller authority locally.
