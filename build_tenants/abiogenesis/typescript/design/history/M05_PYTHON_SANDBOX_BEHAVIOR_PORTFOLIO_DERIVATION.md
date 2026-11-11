# M05 Python Sandbox Behavior Portfolio Derivation

**Status**: Active
**Date**: 2026-04-24
**Purpose**: Port the Python archived sandbox scenario corpus into one explicit
TypeScript installed-package behavior portfolio.

## Source

The source corpus is the Python sandbox test environment:

- `build_tenants/abiogenesis/python/test_env/tests/test_sandbox_install.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_sandbox_usecases_fake.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_sandbox_usecases_live.py`
- `build_tenants/abiogenesis/python/test_env/tests/run_archive.py`

The counted corpus contains:

- `15` install/runtime sandbox scenarios
- `14` fake or harnessed sandbox scenarios
- `5` live F_P sandbox scenarios
- `34` archived sandbox behavior scenarios total

`test_run_archive.py` is archive framework proof, not a product behavior
scenario. Its contract remains represented by `T-030`.

## Position

The Python sandbox line is a cumulative behavior observation framework. Each
scenario creates an isolated sandbox workspace, installs the product, drives one
workflow edge or chain, and leaves postmortem evidence under `test_runs/`.

The TypeScript port must preserve that observation shape without pretending
that every Python helper detail is still authoritative. The reusable obligation
is:

- scenario identity
- usecase grouping
- sandbox lane
- minimum traversal breadth
- event sequence evidence
- durable archive evidence reference

## TypeScript Boundary

The TypeScript boundary is:

- `M05_PYTHON_SANDBOX_BEHAVIOR_SCENARIO_OBLIGATIONS`
- `qualifyInstalledSandboxBehaviorPortfolio(...)`
- `test_m05_python_sandbox_behavior_portfolio_integration.test.mjs`

The integration lane materializes the TypeScript package through `npm pack`,
imports the installed package surface, and executes all 34 ported obligations
through public graph-function traversal, dispatch request derivation, result
assessment, and live-status projection.

## Non-Claim

This lane is not a replacement for external-live worker execution. The five
Python live scenarios are represented here as installed-package behavior
obligations. The separate RC live lane remains responsible for proving a real
configured F_P backend.

## Closure Evidence

The lane closes only when:

- all `34` Python archived sandbox scenario obligations are represented
- all represented scenarios execute through the installed TypeScript package
  surface
- every scenario emits `basis_admitted`, `fp_dispatch_requested`, and
  `assessed`
- the portfolio qualifier reports `15 install`, `14 fake`, and `5 live`
  scenario obligations
- a durable portfolio report is written under `test_env/test_runs/`
