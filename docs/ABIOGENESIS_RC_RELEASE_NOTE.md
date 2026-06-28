# abiogenesis 4.1.0-rc.12 Release Candidate Note

This checkpoint is the twelfth TypeScript ABG `4.1.0` release candidate. It
follows `4.1.0-rc.11` and adds the downstream-consumable GTL/ABG
requirements-algebra route needed by lifecycle consumers such as `odd_glc`.

It is an RC candidate, not the final tapped `4.1.0` release.

## Release Claim

RC12 keeps the RC11 start-target runtime-binding repair, then adds one
requirements-route substrate:

- GTL publishes a `gtl.requirements` declaration facade for requirement terms,
  traversal spans, and lifecycle-composition refs without importing ABG runtime
  modules.
- ABG publishes an `abg.requirements` read/query facade while keeping
  declaration admission, evidence binding, assurance-fold projection, residual
  projection, and lifecycle-disposition emission internal to the runtime path.
- The runner can start from a GTL requirement declaration bundle, admit
  requirement truth, emit requirement route facts through `emit()`, replay fold,
  residual, and disposition truth, and project lifecycle state without
  downstream local ledgers.
- The public export side door is closed: downstream package surfaces cannot
  construct requirement fold, residual, or disposition truth.
- A gated live Hello World F_P proof now carries admitted requirement source
  refs, source digests, and active requirement context into the worker prompt
  without supplying the exact program source or a prefilled success answer.

These repairs preserve the governing split: ABG owns traversal, replay,
continuation, runtime events, and consequence transition. Product tenants expose
domain graph functions, policies, prompt surfaces, prompt review packages, and
plugin outputs as data. Downstream lifecycle frameworks may interpret admitted
requirements-route truth, but must not republish generic ABG requirement
functions under product-local namespaces or mint peer ledgers.

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

RC12 does not move downstream product meaning into ABG. Downstream products
still own the artifact predicate and product interpretation. ABG owns the
generic requirement declaration admission, evidence binding, assurance fold,
residual, disposition, replay, and query mechanics.

## Versioned Artifacts

- RC branch: `main`
- RC identity: `4.1.0-rc.12`
- Candidate package version: `4.1.0-rc.12`
- Candidate tag: `v4.1.0-rc.12`

## Verification

Required evidence for accepting this RC:

```text
ABG semantic build and requirements-route lane:
  npm run build:semantic
  npm run test:t164
  npm run test:t165:hello-world-live

ABG release gate after the version bump:
  npm run lint:semantic
  npm run lint:test-harness
  npm run test:semantic
  git diff --check
  npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run

Downstream substrate readiness:
  odd_glc may consume `gtl.requirements` declarations and `abg.requirements`
  read/query surfaces for route-1 lifecycle proof. Requirement graph derivation
  and goal refinement remain deferred and are not claimed by this RC.
```

The release checkpoint recorded the ABI requirements-route gates as passing
before snapshot preparation:

- `npm run build:semantic`
- `npm run test:t164`
- `npm run test:t165:hello-world-live`
- `npm run lint:semantic`
- `npm run lint:test-harness`
- `npm run test:semantic`
- `git diff --check`
- `npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run`

The live proof artifact for the requirements-carrying Hello World run is under
`build_tenants/abiogenesis/typescript/test_env/test_runs/t165_hello_world_requirements_route_live/`.
The RC12 snapshot is accepted only when written from the clean source commit
that produced those gates.

## RC Decision

RC12 is the ABG requirements-route downstream substrate candidate. It is
releaseable after the ABI release checks pass, the release snapshot is written
from the source commit, and downstream lifecycle consumers treat the route as
GTL/ABG-owned substrate rather than rebuilding requirement ledgers locally.
