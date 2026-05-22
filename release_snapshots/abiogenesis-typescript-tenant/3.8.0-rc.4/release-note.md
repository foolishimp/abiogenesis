# abiogenesis 3.8.0-rc.4 Release Candidate Note

This checkpoint is the current TypeScript ABG release-candidate source state.
It advances the release line from `3.8.0-rc.3` to `3.8.0-rc.4` because T-144
now makes the ABG event-sourced monad framing explicit over selected GTL
composition without introducing a new GTL carrier or runtime execution target.

It is an RC candidate, not the final tapped `3.8.0` release. The release
identity remains explicit until the cut is committed, tagged, pushed, and
accepted.

## Release Claim

The TypeScript tenant remains the package-first GTL/ABG RC candidate. This cut
preserves the accepted evaluator substrate, runtime liveness observer,
edge-assurance runtime path, GTL type-boundary correction, target-carrier
binding path, saga-frontier substrate, release snapshot builder, and T-143
compute notation typing.

RC4 for `3.8.0` adds:

- product, requirement, design, and docs language for ABG as an opinionated
  probabilistic eventual-consistency monad over selected GTL composition;
- explicit notation that `C` means selected `abg.fn_composition` identity at
  an owning GTL boundary, not a new public compute unit;
- strong plugin-stage category typing for `transform.C`, `evaluate.C`, and
  `consequence.C`;
- `EnginePluginInput` propagation of selected composition ref, selected
  composition digest, selected composition selection ref, and selected regime
  binding ref;
- stage-purpose metadata that separates transform value production, evaluation
  finding production, and consequence projection over ABG-admitted facts;
- `F_H` clarification as an external human-callout regime whose callout and
  response carriers are admitted by ABG rather than executed inside the
  runtime;
- plugin traversal and hook surfaces using `evaluate` instead of legacy `eval`
  as the stage name where the surface is about computation category, while
  historical Eval-named payload carriers remain ordinary code names where they
  do not create a second authority surface;
- deterministic tests that reject non-`F_D` closure authority, ambiguous
  plugin purpose, missing selected-composition identity, plugin-side runtime
  ownership, and legacy `eval` stage-category leakage.

## Boundary

The governing execution framing is:

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

Purely deterministic event-sourced execution is a valid reduction of this
shape. It is not the whole ABG product claim. The public claim remains a
probabilistic eventual-consistency runtime with deterministic, probabilistic,
and human-callout regimes bound through typed plugin stages and ABG-owned side
effects.

## Non-Claims

This cut does not claim a new GTL ontology object, a public `ComputeUnit`
aggregate, a public `Vector` execution target, or product-owned ABG system
effects. GTL names authored graph/function/job/composition surfaces. ABG owns
runtime events, ledgers, projections, assurance folds, traversal transitions,
continuation, replay, and admission. Products own domain meaning and plugin
behavior inside declared boundaries.

This cut does not complete downstream ODD_SDLC migration. It creates the
downstream active migration ticket:

```text
/Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/active/T-180-align-sdlc-plugin-stages-with-abg-t144-boundary.md
```

## Versioned Artifacts

- RC branch: `rc/3.8.0`
- RC identity: `3.8.0-rc.4`
- Candidate package version: `3.8.0-rc.4`
- Candidate tag: `v3.8.0-rc.4`

## Verification

Current qualification evidence for this cut:

```text
npm run test:t132
passed

npm run test:semantic
606 passed

npm run lint:semantic
passed

git diff --check
passed
```

The release snapshot command rebuilds the semantic package, runs `npm pack`,
copies this release note, and writes manifest plus checksum evidence into the
immutable local snapshot directory.

## RC Decision

The release operator preserves the existing `3.8.0-rc.3` snapshot as immutable
source history and cuts `3.8.0-rc.4` as the next release-candidate checkpoint
after closing T-144. This is not the final tapped `3.8.0` release.
