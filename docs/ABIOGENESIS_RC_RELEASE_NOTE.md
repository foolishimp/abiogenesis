# abiogenesis 3.4.0-rc.1 Release Note

This release candidate advances the `v3.4.0` line with the TypeScript tenant
as an RC-qualified GTL/ABG carrier.

The cut publishes the current TypeScript realization as a package-first runtime
with public GTL, ABG, M04 operator, and M05 qualification surfaces. It keeps
the release identity explicit: this is an RC cut, not the final tapped release.

## What Shipped

- TypeScript GTL `M01` core graph algebra and carrier admission.
- TypeScript GTL `M02` module publication and semantic job lookup.
- TypeScript ABG `M03` replay-derived runtime carriers, event admission,
  graph-function iteration, retry/repair, leaf-task, transport, and runtime
  failure taxonomy.
- TypeScript `M04` public operator surface:
  - `start`
  - `gaps`
  - `assess-result`
  - public asset addressing
  - live-status projection
  - control-loop and complete-start callable surfaces
  - install/bootstrap and bootloader surfaces
- TypeScript CLI binary bindings:
  - `abiogenesis-ts`
  - `genesis-ts`
- TypeScript `gen-gaps` support over replay-derived runtime truth. The command
  is read-only and no longer returns an unsupported placeholder.
- TypeScript `M05` qualification line:
  - installed sandbox proof
  - run archive and finalization proof
  - reset/postmortem proof
  - Python archived sandbox behavior portfolio parity
  - RC external-live portfolio proof

## Framework Position

This RC proves the TypeScript tenant as a lawful realization of the current
GTL/ABG surface, not a rival product definition.

The key release claim is:

1. GTL graph functions remain the constructive carrier.
2. ABG traversal and projection remain event/replay-derived runtime truth.
3. Public operator commands are product grammar bindings over that truth.
4. The TypeScript package can be installed and exercised through the same
   public command grammar and package import surfaces.
5. External-live F_P traversal is qualified through real configured transport,
   not only deterministic source tests.

`M06` trigger law remains explicitly deferred and has no executable obligation
in this RC.

## Versioned Artifacts

- RC branch: `rc/3.4.0`
- RC tag: `v3.4.0-rc.1`
- TypeScript package version: `3.4.0-rc.1`

## Verification

Qualification performed for this cut:

- `npm run test:semantic`
  - result: `202 passed`
- `npm run lint:semantic`
  - result: `passed`
- `CODEX_LIVE_FP=1 npm run test:live`
  - result: `1 passed`
  - portfolio: `5` live scenario families, `12` external-live stages
  - elapsed: `128.4s`
  - archive:
    `build_tenants/abiogenesis/typescript/test_env/test_runs/typescript_rc_live_portfolio/2026-04-25T095121549Z/portfolio_report.json`
- `CODEX_LIVE_FP=1 npm run test:live:uat`
  - result: `1 passed`, `0 skipped`
  - elapsed: `14.1s`
  - archive:
    `build_tenants/abiogenesis/typescript/test_env/test_runs/typescript_rc_live/requirements_to_uat/2026-04-25T095336463Z`
- `git diff --check`
  - result: `passed`

## Release Qualification Note

This RC closes the TypeScript tenant source boundary for the current completed
ticket set through `T-058`.

The RC does not tap the final `3.4.0` release. Further bounded fixes during the
RC window must publish a new immutable RC tag, such as `v3.4.0-rc.2`.
