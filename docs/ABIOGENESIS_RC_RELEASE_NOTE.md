# abiogenesis 3.4.0-rc.2 Release Note

This checkpoint advances the `v3.4.0` RC line with the TypeScript tenant after
the ODD-native substrate clarity wave.

The cut publishes the current TypeScript realization as a package-first
GTL/ABG carrier. It keeps the release identity explicit: this is an RC
checkpoint, not the final tapped `3.4.0` release.

## What Shipped

- TypeScript package identity bumped to `3.4.0-rc.2`.
- GTL/ABG intent and product definition clarified around GTL as an LLM-first
  graph algebra and ABG as the governed admission, traversal, event, projection,
  and proof runtime.
- M03 generic single-hop investigation proof for `Fg_1`, showing that an
  untyped one-edge graph function exposes structural graph truth but does not
  choose `F_D`, `F_P`, `F_H`, identity, no-op, transform, evaluation, or
  completion semantics by itself.
- M03 minimum typed traversal investigation proof for `A_1 -> A_2`, showing
  that typed interface authority is visible without becoming hidden compute
  authority.
- M03 deterministic traversal-structure probe over undefined traversal,
  minimum typed traversal, and minimum defined traversal.
- M05 SDLC bootstrap-lineage proof for `BootstrapInputSet -> Project`,
  including source-input lineage, project-element lookup, and ABG runtime
  provenance visibility.
- M05 data-mapper real ingress sandbox proof over
  `data_mapper.template`, `data_mapper.test41`, `data_mapper.test42`, and
  `data_mapper.test43`, with Python SDLC normalization evidence compared as
  external proof context.
- Backlog ticket `T-060` records the deferred cleanup for explicit bare-edge
  compute-basis failure taxonomy.

## Framework Position

This RC proves the TypeScript tenant as a lawful realization of the current
GTL/ABG surface, not a rival product definition.

The key release claim is:

1. GTL graph functions remain the constructive program carrier.
2. Edge shape and typed interface truth do not create implicit compute law.
3. Runtime policy must explicitly select the applicable `F_D`, `F_P`, or `F_H`
   interpretation basis.
4. Missing compute basis fails closed.
5. ABG traversal and projection remain event/replay-derived runtime truth.
6. M05 qualification can derive SDLC bootstrap project lineage from admitted
   input carriers without copying Python SDLC orchestration into TypeScript.

`M06` trigger law remains explicitly deferred and has no executable obligation
in this RC.

## Versioned Artifacts

- RC branch: `rc/3.4.0`
- RC tag: `v3.4.0-rc.2`
- TypeScript package version: `3.4.0-rc.2`
- Prior immutable RC tag: `v3.4.0-rc.1`

## Verification

Qualification performed for this cut:

- `npm run test:semantic`
  - result: `214 passed`
  - elapsed: `3263.36175 ms`
- `npm run test:t064`
  - result: `3 passed`
  - elapsed: `144.970958 ms`
- `npm run lint:semantic`
  - result: `passed`
- `CODEX_LIVE_FP=1 npm run test:live`
  - result: `1 passed`
  - portfolio: `5` live scenario families, `12` external-live stages
  - elapsed: `130070.942583 ms`
  - archive:
    `build_tenants/abiogenesis/typescript/test_env/test_runs/typescript_rc_live_portfolio/2026-04-25T184212471Z/portfolio_report.json`
- `CODEX_LIVE_FP=1 npm run test:live:uat`
  - result: `1 passed`, `0 skipped`
  - elapsed: `15435.907 ms`
  - archive:
    `build_tenants/abiogenesis/typescript/test_env/test_runs/typescript_rc_live/requirements_to_uat/2026-04-25T184432699Z`
- `git diff --check`
  - result: `passed`

## Release Qualification Note

This RC checkpoint closes the TypeScript tenant source boundary for the current
completed ticket set through `T-064`:

- `T-059`
- `T-061`
- `T-062`
- `T-063`
- `T-064`

`T-060` remains backlog-only and is not implemented in this cut.
