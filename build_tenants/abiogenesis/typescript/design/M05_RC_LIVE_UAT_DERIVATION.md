# M05 RC Live UAT Derivation

**Status**: Active
**Date**: 2026-04-24
**Derived from**: `SPEC_METHOD.md` testing strategy taxonomy, `REQ-P-QUAL.md`,
`REQ-P-SCENARIOS.md`, `M03_TRANSPORT_PROTOCOL_DERIVATION.md`,
`M05_INSTALLED_SANDBOX_DERIVATION.md`,
`M05_ARCHIVE_FINALIZATION_DERIVATION.md`,
`M05_INSTALLED_LIVE_PORTFOLIO_DERIVATION.md`, and `T-033`.
**Purpose**: Define the TypeScript RC live UAT lane as a sandbox acceptance
proof over real F_P transport execution, distinct from module/design tests and
deterministic installed-surface proofs.

## Position

The TypeScript tenant already has green design/module conformance proof and
harnessed installed-surface scenario proof.

That is not enough for RC live closure.

Under the `SPEC_METHOD.md` testing taxonomy, UAT must derive from
requirements/scenarios and execute the composed product path through a sandbox
or equivalent isolated product lane. Live sandbox UAT additionally crosses a
real configured worker or transport boundary.

Python reference tests are admissible discovery evidence for relevant
requirements and scenarios. They are not the reusable proof artifact for this
tenant. The reusable artifact is the requirement/scenario obligation set, plus
portable fixtures that can be executed by the TypeScript installed package
surface without depending on Python harness behavior.

For RC review, a Python-tested obligation has only three lawful states:

- proved by the TypeScript tenant
- explicitly repriced into a TypeScript module/package boundary
- explicitly not applicable to the TypeScript product shape

## Current Reprice

The existing TypeScript files named `live` prove deterministic installed
package-surface behavior. They are harnessed sandbox or installed-surface
evidence, not live sandbox UAT.

The first RC live lane added one separate opt-in proof command:

- `npm run test:live:uat`

The portfolio RC live lane now owns the authoritative RC live command:

- `npm run test:live`

This command must not be part of `npm run test:semantic`.
When it runs, it must materialize the TypeScript package into the sandbox from
package output before importing `@abiogenesis/typescript-tenant`.

## First Live UAT Boundary

The first TypeScript RC live UAT lane proves one requirements-sourced scenario
over the installed package surface:

- scenario: `requirements_to_uat`
- traversal: `requirements->uat_tests`
- public path: package materialization into sandbox `node_modules`, installed
  package import, public start, F_P dispatch request, real transport return,
  result artifact admission, result assessment, live status projection

This first boundary remains directly runnable as `npm run test:live:uat`.
`M05_RC_LIVE_PORTFOLIO_DERIVATION.md` extends the RC live gate to all five
Python live scenario families and owns `npm run test:live`.

## Archive Framework Authority

The durable archive framework is inherited from the Python sandbox line:

- `build_tenants/abiogenesis/python/test_env/tests/run_archive.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_run_archive.py`

The TypeScript archive framework is the `T-030` repricing of that Python
sandbox contract into explicit `M05` archive-finalization carriers.

This RC live lane does not create new archive law. It must produce durable
live-run evidence under `test_env/test_runs/` and keep that evidence compatible
with the Python-sandbox-derived postmortem expectation. Canonical archive
writer/finalizer parity remains owned by `T-030`.

The lane must capture:

- run metadata
- package root and package tarball evidence
- dispatch request
- prompt
- readiness result
- transport result
- raw worker response
- result artifact
- final assessment/projection

## Non-Closure

The lane is not closed by:

- semantic tests alone
- module integration tests
- installed package scripts using synthetic result artifacts
- status projections that are named `live` but do not invoke a real external
  worker or transport
- copying Python test code without extracting a portable requirement/scenario
  obligation

Those proofs remain required, but they do not satisfy RC live UAT.
