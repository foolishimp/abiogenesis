# abiogenesis 3.9.0-rc.3 Release Candidate Note

This checkpoint is the third TypeScript ABG `3.9.0` release candidate.
It follows `3.9.0-rc.2` with a runner provenance fix for composed
`evaluate.C/F_P` evaluation-rule work.

It is an RC candidate, not the final tapped `3.9.0` release.

## Release Claim

The TypeScript tenant remains the package-first GTL/ABG RC candidate. RC3
preserves the staged compute runtime law introduced in RC1 and the proof-harness
alignment from RC2, then fixes the ABG-owned provenance supplied to
evaluation-rule plugins.

RC3 adds:

- `actorInvocationRef` propagation into planned evaluation-rule plugin inputs;
- replay-visible linkage between F_P evaluation-rule execution and the ABG actor
  invocation that produced it;
- a T-145 regression proving F_P evaluation rules receive actor invocation
  provenance and that payload events record the same actor invocation id;
- package version advancement to `3.9.0-rc.3` for downstream consumers that need
  the corrected `evaluate.C/F_P` evaluation-rule provenance boundary;
- updated LLM builder guidance for the current ABG/GTL ontology and epistemology
  handoff.

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
  .bind(system.planConsequenceSet)
  .bind(plugin.consequence.C.task[*])
  .bind(system.admitConsequenceTaskResult[*])
  .bind(system.collectConsequenceSet)
  .bind(system.admitConsequenceProjection)
  .bind(system.traversalTransition)
  .bind(system.replayContinuation)
```

RC3 does not introduce a new GTL ontology object, a public `ComputeUnit`
aggregate, a public `Vector` execution target, or product-owned ABG system
effects.

## Versioned Artifacts

- RC branch: `rc/3.9.0`
- RC identity: `3.9.0-rc.3`
- Candidate package version: `3.9.0-rc.3`
- Candidate tag: `v3.9.0-rc.3`

## Verification

Current qualification evidence for this cut:

```text
npm run build:semantic
passed

npm run test:t145
15 passed

npm run lint:semantic
passed

git diff --check
passed
```

The release snapshot command rebuilds the semantic package, runs `npm pack`,
copies this release note, and writes manifest plus checksum evidence into the
immutable local snapshot directory.

## RC Decision

The release operator preserves `3.9.0-rc.1` as the first staged-compute runtime
candidate and `3.9.0-rc.2` as the live-proof harness alignment candidate. RC3
is the follow-up release candidate for ABG-owned actor invocation provenance in
runner-consumed `evaluate.C/F_P` evaluation-rule plugins.
