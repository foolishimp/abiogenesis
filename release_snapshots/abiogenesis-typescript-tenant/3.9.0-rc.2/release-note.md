# abiogenesis 3.9.0-rc.2 Release Candidate Note

This checkpoint is the second TypeScript ABG `3.9.0` release candidate.
It follows `3.9.0-rc.1` with live-proof harness alignment for the staged compute
runtime boundary:

```text
transform.C -> evaluate.C -> consequence.C
```

RC1 contained the runtime law and package substrate. RC2 makes the live and
sandbox proof surfaces reproduce that law from the tagged release source.

It is an RC candidate, not the final tapped `3.9.0` release.

## Release Claim

The TypeScript tenant remains the package-first GTL/ABG RC candidate. RC2
preserves the staged compute runtime law introduced in RC1 and aligns live proof
fixtures with the same source-of-truth rules:

- GTL graph vectors in live/sandbox proof fixtures carry explicit
  `abg.fn_composition` declarations;
- composed proof graph functions no longer duplicate incompatible
  `abg.fn_composition` attrs across intermediate composition surfaces;
- installed live proofs provide explicit product `fpEvaluator` plugins where
  the selected `evaluate.C/F_P` regime requires product judgment;
- live event-chain assertions now reflect RC1's staged transform/evaluate/
  consequence event spine, including payload ledger events, ambiguity
  observations, closure-input publication, and assessed vector closure;
- the package version advances to `3.9.0-rc.2` so downstream consumers can pin
  a release candidate whose tag includes the live proof harness corrections.

## Boundary

The governing execution framing remains:

```text
ABG.start(fn<A, B>.C)
  .bind(system.openGraphCall)
  .bind(system.openFrame)
  .bind(plugin.transform.C)
  .bind(system.admitTransform)
  .bind(system.writeTransformEventsAndLedgers)
  .bind(plugin.evaluate.C)
  .bind(system.admitEvaluation)
  .bind(system.writeEvaluationLedgers)
  .bind(system.assuranceFold)
  .bind(plugin.consequence.C)
  .bind(system.admitConsequenceProjection)
  .bind(system.traversalTransition)
  .bind(system.replayContinuation)
```

RC2 does not introduce a new GTL ontology object, a public `ComputeUnit`
aggregate, a public `Vector` execution target, or product-owned ABG system
effects.

## Versioned Artifacts

- RC branch: `rc/3.9.0`
- RC identity: `3.9.0-rc.2`
- Candidate package version: `3.9.0-rc.2`
- Candidate tag: `v3.9.0-rc.2`
- Source commit for snapshot: `05da497ecc46bc07c434f96e284d3e482756435d`

## Verification

Current qualification evidence for this cut:

```text
npm run test:semantic
644 passed

npm run test:t144
14 passed

npm run test:t145
14 passed

npm run test:t146
14 passed

npm run build:semantic
passed

npm run lint:semantic
passed

npm run lint:test-harness
passed

git diff --check
passed
```

Live and sandbox proof evidence gathered before the RC2 source commit:

```text
ABG_TS_LIVE_PORTFOLIO=1 npm run test:live
passed

ABG_TS_LIVE_UAT=1 npm run test:live:uat
passed

ABG_TS_T087_LIVE=1 npm run test:t087:live
passed

CODEX_LIVE_FP=1 npm run test:t100:five-rule
passed

npm run test:t107:data-mapper-live
passed

npm run test:t119:live
passed

npm run test:t125:live
passed

npm run test:t127:live
passed

npm run test:t064
passed

npm run test:t085
passed

npm run test:t100:sandbox
passed

npm run test:t101
passed

npm run test:t104:sandbox
passed

npm run test:t112:sandbox
passed

npm run test:t119:sandbox
passed

npm run test:t127:sandbox
passed
```

Claude-specific live lanes were attempted and blocked by external account
quota, not by ABG runtime assertions:

```text
npm run test:t094:live
blocked by Claude 429 seven_day weekly quota

npm run test:t132:live
blocked by Claude 429 seven_day weekly quota

npm run test:t113:live
blocked by Claude 429 seven_day weekly quota

npm run test:t141:live
Claude-backed branches blocked by Claude 429 seven_day weekly quota
```

The release snapshot command rebuilds the semantic package, runs `npm pack`,
copies this release note, and writes manifest plus checksum evidence into the
immutable local snapshot directory.

## RC Decision

The release operator preserves `3.9.0-rc.1` as the first staged-compute runtime
candidate and cuts `3.9.0-rc.2` as the follow-up release candidate whose tag
contains the live proof harness alignment required to reproduce the current
proof surface.
