# abiogenesis 3.9.0-rc.4 Release Candidate Note

This checkpoint is the fourth TypeScript ABG `3.9.0` release candidate.
It follows `3.9.0-rc.3` with runner and PTY fixes found while exercising the
ODD SDLC live lanes.

It is an RC candidate, not the final tapped `3.9.0` release.

## Release Claim

The TypeScript tenant remains the package-first GTL/ABG RC candidate. RC4
preserves the staged compute runtime law introduced in RC1, the proof-harness
alignment from RC2, and the evaluation-rule provenance fix from RC3. It then
adds two downstream-critical corrections:

RC4 adds:

- fail-closed handling for blocked evaluation-set admission before F_D vector
  advance/close in the runner;
- PTY terminal liveness handling that gives terminal-backed workers a short
  grace window and process-table confirmation before declaring `lost_terminal`;
- T-111 regression coverage for PTY terminal liveness behavior;
- T-145 regression coverage for evaluation-set blocking before F_D advance;
- package version advancement to `3.9.0-rc.4` for downstream consumers that need
  the corrected runner and PTY behavior.

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

RC4 does not introduce a new GTL ontology object, a public `ComputeUnit`
aggregate, a public `Vector` execution target, or product-owned ABG system
effects.

## Versioned Artifacts

- RC branch: `rc/3.9.0`
- RC identity: `3.9.0-rc.4`
- Candidate package version: `3.9.0-rc.4`
- Candidate tag: `v3.9.0-rc.4`

## Verification

Current qualification evidence for this cut:

```text
npm run build:semantic
passed

npm run test:t111
5 passed

npm run test:t145
16 passed

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
candidate, `3.9.0-rc.2` as the live-proof harness alignment candidate, and
`3.9.0-rc.3` as the ABG-owned actor invocation provenance candidate. RC4 is the
follow-up release candidate for downstream live-lane runner and PTY stability.
