# abiogenesis 3.9.0-rc.6 Release Candidate Note

This checkpoint is the sixth TypeScript ABG `3.9.0` release candidate. It
follows `3.9.0-rc.5` with runtime-authority wiring for replay-stable retry
context, admitted output authority projection, and target-carrier output
admission before closure.

It is an RC candidate, not the final tapped `3.9.0` release.

## Release Claim

The TypeScript tenant remains the package-first GTL/ABG RC candidate. RC6
preserves the staged compute runtime law introduced in RC1, the proof-harness
alignment from RC2, the evaluation-rule provenance fix from RC3, the runner/PTY
corrections from RC4, and the canonical runtime event identity boundary from
RC5. It then realizes the T-147 runtime-authority invariants inside ABG rather
than leaving them as downstream adapter precedent.

RC6 adds:

- replay-derived `EnginePluginInput.retryContext`, so plugin workers receive
  ABG current retry frontier truth rather than a caller-local alias;
- stale supplied `FpTransformRequest.retryFrontierRef` rejection in attached
  and no-artifact retry decision paths;
- replay-derived `EnginePluginInput.outputAuthorityProjections` for current
  and closed vector outputs;
- accepted attached F_P result target-carrier `payload_observed` and
  `payload_validated` events before assurance fold and traversal transition;
- a current-vector assurance fold block when the selected target-carrier output
  authority is not admitted;
- focused T-147 runtime proof that the new projections are consumed by the
  runner, not just exported as pure helpers;
- package version advancement to `3.9.0-rc.6` for downstream consumers that
  need the corrected ABG runtime-authority boundary.

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

RC6 does not introduce a new GTL ontology object, a public `ComputeUnit`
aggregate, a public `Vector` execution target, or product-owned ABG system
effects. The new surfaces are ABG runtime projections and admission/fold
mechanics over existing retry frontier, payload ledger, and target-carrier
authority law.

## Versioned Artifacts

- RC branch: `main`
- RC identity: `3.9.0-rc.6`
- Candidate package version: `3.9.0-rc.6`
- Candidate tag: `v3.9.0-rc.6`

## Verification

Current qualification evidence for this cut:

```text
npm run build:semantic
passed

npm run lint:semantic
passed

npm run lint:test-harness
passed

npm run test:t147
7 passed

node --test test_env/tests/test_t099_fp_stage_carriers.test.mjs test_env/tests/test_t128_construction_runner.test.mjs
8 passed

npm run test:semantic
654 passed

npm pack --dry-run
passed

git diff --check
passed
```

The release snapshot command rebuilds the semantic package, runs `npm pack`,
copies this release note, and writes manifest plus checksum evidence into the
immutable local snapshot directory.

## RC Decision

The release operator preserves `3.9.0-rc.1` as the first staged-compute runtime
candidate, `3.9.0-rc.2` as the live-proof harness alignment candidate,
`3.9.0-rc.3` as the ABG-owned actor invocation provenance candidate, RC4 as the
downstream live-lane runner and PTY stability candidate, and RC5 as the
event-source identity and millisecond timestamp boundary candidate. RC6 is the
runtime-authority wiring candidate for retry freshness, output authority, and
projection-output admission before closure.
