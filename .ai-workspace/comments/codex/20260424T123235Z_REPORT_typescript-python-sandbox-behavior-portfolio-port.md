# Report: TypeScript Port Of Python Sandbox Behavior Portfolio

**Date**: 2026-04-24
**Tenant**: `build_tenants/abiogenesis/typescript`
**Ticket**: `T-036`
**Run archive**:
`build_tenants/abiogenesis/typescript/test_env/test_runs/typescript_sandbox_behavior_portfolio/2026-04-24T123235680Z`
**Run report**:
`build_tenants/abiogenesis/typescript/test_env/test_runs/typescript_sandbox_behavior_portfolio/2026-04-24T123235680Z/portfolio_report.json`

## Finding

The Python archived sandbox behavior portfolio has been ported into TypeScript
as a 34-scenario installed-package qualification lane.

The lane passed.

## What Was Ported

The Python source corpus was:

- `python/test_env/tests/test_sandbox_install.py`
- `python/test_env/tests/test_sandbox_usecases_fake.py`
- `python/test_env/tests/test_sandbox_usecases_live.py`
- `python/test_env/tests/run_archive.py`

The ported TypeScript boundary is:

- `code/src/qualification/m05/sandbox_behavior_portfolio_carriers.ts`
- `code/src/qualification/m05/sandbox_behavior_portfolio_constructors.ts`
- `code/src/qualification/m05/sandbox_behavior_portfolio.ts`
- `test_env/tests/test_m05_python_sandbox_behavior_portfolio_integration.test.mjs`
- `design/M05_PYTHON_SANDBOX_BEHAVIOR_PORTFOLIO_DERIVATION.md`

## Run Result

- command: `npm run test:t036`
- result: passed `1/1`
- duration: `1,850.643208 ms`
- installed package root:
  `/var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-ts-install-9rgfSi/node_modules/@abiogenesis/typescript-tenant`
- package tarball:
  `/var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-ts-install-9rgfSi/.abiogenesis/package-pack/pack-pwTJ8d/abiogenesis-typescript-tenant-0.0.0-test.tgz`

The full semantic suite also passed:

- command: `npm run test:semantic`
- result: passed `157/157`
- duration: `2,325.641125 ms`

## Scenario Counts

- total scenarios: `34`
- install/runtime sandbox scenarios: `15`
- fake or harnessed sandbox scenarios: `14`
- live-lineage scenario obligations: `5`

Every scenario emitted the required event family:

- `basis_admitted`
- `fp_dispatch_requested`
- `assessed`

Every scenario ended with:

- `finalRunStatus`: `assessed`

## Interpretation

This is now a cumulative TypeScript behavior portfolio over the Python sandbox
corpus. It creates an installed TypeScript package sandbox, runs all ported
scenario obligations through public graph-function traversal, derives dispatch
requests, admits result artifacts, assesses them, projects live status, and
writes a durable report.

It is not five new external-live worker runs. The five Python live scenarios are
represented here as installed-package behavior obligations. External-live proof
remains the separate `T-033` RC live lane.

## Closure Judgment

`T-036` is closed correctly for harnessed cumulative sandbox behavior parity:
the TypeScript tenant now has explicit, executable coverage for all 34 Python
archived sandbox behavior scenarios.
