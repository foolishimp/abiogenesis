# abiogenesis 4.1.0-rc.15 Release Candidate Note

This checkpoint is the fifteenth TypeScript ABG `4.1.0` release candidate. It
follows `4.1.0-rc.14` and corrects the GOAL-014 ABI/GTL substrate closure for
downstream lifecycle consumers such as `odd_glc`.

It is an RC candidate, not the final tapped `4.1.0` release.

## Release Claim

RC15 keeps the downstream-consumable requirements route, then earns the
remaining closure conditions that were not proved by the previous checkpoint:

- ABI emits blocked and re-entry requirements-route dispositions through the
  real runner path.
- GTL requirement graph and refinement declarations remain inert declarations;
  ABG admits, projects, folds, residualizes, and queries the resulting
  multi-requirement structure over existing `RequirementTerm` and
  `RequirementRelation` truth.
- Requirement span identity is enforced across frame, zoom, recursion,
  foldback, continuation, and re-entry lineage. Runtime edges with recursive
  lineage fail closed unless the admitted requirement span declares matching
  lineage refs; ordinary vector-local route spans remain valid.
- ABG wires the recursive executive observer into the engine runner and emits
  executive pressure facts into the runtime event stream, replay-visible and
  admitted by the canonical runtime event ingress.
- F_P `retry` and `no_close` findings with continuation refs are projected into
  admitted runtime continuation transition truth for the requirements route,
  so lifecycle disposition is derived from F_P continuation judgment instead
  of collapsing to an assurance-only block.
- The public `abg/executive` facade exposes projection helpers only. It still
  does not expose runtime event emission, workspace mutation, continuation
  control, closure authority, or product semantic compilers.
- Closed-route dispositions retain admitted terminal transition provenance, but
  only retry/yield transitions can produce `continuation_available`; reprice
  transitions produce requirements re-entry truth.

These repairs preserve the governing split: GTL declares inert graph,
requirement, span, and composition truth; ABG admits, runs, emits, replays,
folds, residualizes, projects, and routes continuation; downstream lifecycle
frameworks interpret admitted read models and policy overlays only.

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

RC15 does not move downstream product meaning into ABG. Downstream products own
domain interpretation, policy overlays, prompts, and product-specific proof
reading. ABG owns generic requirements-route truth, multi-requirement
projection, span lineage, recursive executive observation, runtime events,
replay, continuation, and query mechanics.

## Versioned Artifacts

- RC branch: `main`
- RC identity: `4.1.0-rc.15`
- Candidate package version: `4.1.0-rc.15`
- Candidate tag: `v4.1.0-rc.15`

## Verification

Required evidence for accepting this RC:

```text
ABG semantic build and focused GOAL-014 gates:
  npm run lint:semantic
  npm run lint:test-harness
  npm run test:semantic
  npm run test:t160
  npm run test:t167
  npm run test:t168
  npm run test:t169
  npm run test:t162
  npm run test:t164

Live F_P proof gates:
  npm run test:t160:live
  npm run test:t165:hello-world-live
  npm run test:t168:live
  npm run test:t169:live

Release packaging gate:
  git diff --check
  npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run
```

The release checkpoint recorded these gates as passing before snapshot
preparation. The current live proof artifacts are:

```text
T-160 executive observer:
build_tenants/abiogenesis/typescript/test_env/test_runs/t160_recursive_executive_observer_live/20260629T055722124Z_pid11636/executive-observer-manifest.json

T-165 Hello World route:
build_tenants/abiogenesis/typescript/test_env/test_runs/t165_hello_world_requirements_route_live/20260629T055806207Z_pid12245/requirements-route-replay-manifest.json

T-168 requirement graph refinement:
build_tenants/abiogenesis/typescript/test_env/test_runs/t168_requirement_graph_refinement_live/20260629T055749469Z_pid11999/requirements-route-replay-manifest.json

T-169 recursive span lineage:
build_tenants/abiogenesis/typescript/test_env/test_runs/t169_requirement_span_identity_recursion_live/20260629T055528558Z_pid10476/requirements-route-replay-manifest.json
```

## RC Decision

RC15 is the ABI/GTL completion candidate for downstream generic lifecycle work.
It is releaseable after the release packaging checks pass, the release snapshot
is written from the source commit, and downstream lifecycle consumers pin this
RC as GTL/ABG-owned substrate rather than rebuilding requirement graphs, span
lineage, residual pressure, executive observation, or continuation controllers
locally.
