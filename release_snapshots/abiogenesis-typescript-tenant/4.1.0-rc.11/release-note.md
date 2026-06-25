# abiogenesis 4.1.0-rc.11 Release Candidate Note

This checkpoint is the eleventh TypeScript ABG `4.1.0` release candidate. It
follows `4.1.0-rc.10` and adds ABG CLI `--target next` runtime-binding
resolution for downstream products that publish product-specific start
selection.

It is an RC candidate, not the final tapped `4.1.0` release.

## Release Claim

RC11 keeps the RC10 semantic compiler producer/admission contract, then adds one
runtime command/control repair:

- `abiogenesis start --target next` may now delegate next-target selection to a
  product-published `runtimeBinding.resolveNextTarget(...)` hook before the
  generic single-semantic-job fallback.
- The hook receives workspace root, parsed start command, and replay events, so
  downstream bindings can select the first executable graph function from
  product public-start law without creating a product-local command loop.
- ABI validates the hook result against the published graph-function authority
  and still fails closed when no hook exists and workspace scope has ambiguous
  semantic jobs.

These repairs preserve the governing split: ABG owns traversal, replay,
continuation, runtime events, and consequence transition. Product tenants expose
domain graph functions, policies, prompt surfaces, prompt review packages, and
plugin outputs as data.

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

RC11 does not move downstream product meaning into ABG. Downstream products still
own the artifact predicate. ABG owns the generic process lease, timeout outcome,
runtime interruption event, and terminal-session shutdown.

## Versioned Artifacts

- RC branch: `main`
- RC identity: `4.1.0-rc.11`
- Candidate package version: `4.1.0-rc.11`
- Candidate tag: `v4.1.0-rc.11`

## Verification

Required evidence for accepting this RC:

```text
ABG semantic build and focused next-target lane:
  npm run build:semantic
  node --test test_env/tests/t057-m04-cli-binary-negative.test.mjs
  node --test --test-name-pattern "target next lowers|asset target resolves|runtime binding plugin factory" test_env/tests/test_m04_cli_binary_integration.test.mjs

ABG release gate after the version bump:
  npm run lint:semantic
  npm run lint:test-harness
  npm run test:semantic
  npm run test:t141
  git diff --check
  npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run

odd_sdlc substrate proof over RC11:
  npm run build:semantic
  focused T-204/T-132/T-164/T-192 substrate gates and live JS/Rust proofs
```

The release checkpoint recorded the ABI deterministic gates as passing before
snapshot creation:

- `npm run build:semantic`
- `node --test test_env/tests/t057-m04-cli-binary-negative.test.mjs`
- `node --test --test-name-pattern "target next lowers|asset target resolves|runtime binding plugin factory" test_env/tests/test_m04_cli_binary_integration.test.mjs`

The remaining release-gate commands must pass before the RC11 snapshot is
accepted as a downstream substrate.

## RC Decision

RC11 is the ABG CLI next-target binding candidate. It is releaseable after the
ABI deterministic release checks pass, the release snapshot is written from the
source commit, and odd_sdlc consumes the RC11 snapshot without
substrate-binding regressions.
