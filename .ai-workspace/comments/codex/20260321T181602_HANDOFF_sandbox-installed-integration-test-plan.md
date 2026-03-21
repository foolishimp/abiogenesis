# HANDOFF: Sandbox-Installed Integration Test Plan For ABG

**Author**: Codex
**Date**: 2026-03-21T18:16:02+11:00
**For**: claude
**Purpose**: Publish the concrete integration test cases for an installed-sandbox
ABG test surface, so they can be implemented in the Claude build.

## Goal

Add an integration test surface that proves `abiogenesis` works when installed
into a fresh sandbox via `gen-install.py`, not just when imported from the build
tree.

This is the right proof surface for `abg` as a standalone kernel:

1. install into sandbox using the installer
2. run the installed engine through subprocess CLI calls
3. exercise core functions through the command surface
4. prove edge conditions and failure modes through the installed runtime

## Why A New Surface Is Needed

Current test coverage is split:

- `test_cli_config.py`
  - proves installer/config basics
- `test_integration_workflows.py`
  - proves command-level workflow scenarios
- `test_e2e_sandbox.py`
  - proves sandbox lifecycle behavior

What is still missing is one joined-up surface that says:

> a fresh target project, installed only by `gen-install.py`, can execute the
> engine correctly through the installed `.genesis` runtime, including failure
> modes

That is the integration proof the kernel needs.

## Recommended Test File

Create one new file:

- `builds/claude_code/tests/test_installed_sandbox_integration.py`

Keep it `pytest.mark.e2e`.

Use subprocesses against the installed runtime, not direct imports from the
build tree except where test setup requires the installer path.

## Environment Contract

Each scenario should:

1. create a fresh `tmp_path` workspace
2. invoke `builds/claude_code/code/gen-install.py --target <tmp>`
3. run installed commands with:

```text
PYTHONPATH=<tmp>/.genesis:<tmp>
python -m genesis ...
```

4. use the installed `.genesis/genesis.yml`
5. avoid importing `genesis` from `builds/claude_code/code` during execution

That is the important distinction from current tests.

## Test Matrix

### Group A: Installer Bootstrap Integrity

These prove the sandbox is a valid runtime after install.

#### A1. Fresh install creates self-contained runtime

Assertions:

- `.genesis/genesis/` exists
- `.genesis/gtl/` exists
- `.genesis/gtl_spec/` exists
- `.genesis/genesis.yml` exists
- starter package exists under `.genesis/gtl_spec/packages/`
- installed runtime imports via `PYTHONPATH=.genesis`

Suggested subprocess:

```text
python -m genesis gaps --workspace <tmp>
```

Expected:

- process runs
- it does not fail with import errors for `genesis`, `gtl`, or `gtl_spec`

#### A2. Installer is idempotent on reinstall

Assertions:

- second install succeeds
- existing starter package is not overwritten if already customized
- engine/runtime files remain present
- `genesis.yml` remains valid

#### A3. `--verify` succeeds on a valid install

Assertions:

- `gen-install.py --target <tmp> --verify` exits success
- returned JSON reports no errors

### Group B: Installed Command Surface

These prove the installed command surface works in a sandbox.

#### B1. `gen-gaps` reports a cold-start gap on starter package

Setup:

- fresh install only

Assertions:

- `genesis gaps --workspace <tmp>` returns JSON
- `converged` is `false`
- `total_delta > 0`
- output includes the starter edge gap

#### B2. `gen-iterate` dispatches F_P on starter package

Setup:

- install fresh sandbox
- use starter package from installed `.genesis/gtl_spec/packages/project_package.py`

Assertions:

- `genesis iterate --workspace <tmp>` returns an iteration result
- result contains manifest/prompt handoff for F_P or equivalent dispatch evidence
- event stream records `edge_started` and `fp_dispatched`

#### B3. `gen-start --auto` blocks correctly on unresolved F_P/F_H

Assertions:

- command exits non-converged or blocked
- does not falsely report convergence when no F_P/F_H evidence exists

### Group C: Installed Single-Hop Lifecycle

These are the most important functional tests.

#### C1. F_D failure blocks F_P dispatch

Setup:

- install sandbox
- replace starter package with a minimal test package under installed
  `.genesis/gtl_spec/packages/`
- package has one edge with:
  - F_D tag check
  - F_P completion evaluator

Assertions:

- with no code artifact, `genesis iterate` does not dispatch F_P
- event stream contains deterministic failure record only

This is the installed-runtime version of the existing gate test.

#### C2. F_P dispatch occurs after F_D passes

Setup:

- same package
- create the required code file with valid `# Implements:` tag

Assertions:

- `genesis iterate` now dispatches F_P
- prompt/manifest written
- event stream records `fp_dispatched`

#### C3. Full F_D -> F_P -> F_H chain converges through installed engine

Setup:

- sandbox package with F_D + F_P + F_H
- test acts as F_P and F_H actor by writing events through the CLI

Assertions:

- cold `genesis gaps` shows delta > 0
- after deterministic artifact creation + `assessed{kind: fp}` + `approved{kind: fh_review}`,
  `genesis gaps` reports `converged=true`, `total_delta=0`

This is the kernel’s most important installed-runtime proof.

### Group D: Edge Conditions / Failure Modes

These are the release-grade edge conditions the installed runtime must prove.

#### D1. Missing required context fails closed before F_P dispatch

Setup:

- package context points to missing `workspace://` file

Assertions:

- `genesis iterate` exits non-zero or reports failure
- no `fp_dispatched`
- error message identifies missing context

#### D2. Digest mismatch fails closed

Setup:

- package context digest intentionally mismatched to real file content

Assertions:

- command fails
- no sentinel-substitution success path
- no F_P dispatch

#### D3. Stale `spec_hash` does not satisfy current F_P evaluator

Setup:

- package with one F_P evaluator
- emit `assessed{kind: fp}` with stale or incorrect `spec_hash`

Assertions:

- `genesis gaps` still reports gap
- stale assessment is ignored by binding logic

#### D4. Missing `spec_hash` on `assessed{kind: fp}` is rejected by CLI

Assertions:

- `python -m genesis emit-event assessed ...` without `spec_hash` exits non-zero

#### D5. Wrong package/worker resolution fails cleanly

Assertions:

- bad `package:` or `worker:` module in installed `genesis.yml` exits non-zero
- stderr explains import/type failure

#### D6. Orphan events are tolerated

Setup:

- append event for an edge not in the installed package

Assertions:

- `genesis gaps` still runs
- orphan event does not crash projection or create false convergence

### Group E: Provenance / Hardening

Only include these if the code is meant to ship in the same release.

#### E1. Workflow-version mismatch does not satisfy approval/certification

Assertions:

- approval or assessment from one workflow version does not satisfy another

#### E2. Carry-forward admits only allowed approvals

Assertions:

- matching carry-forward entry preserves allowed approval
- non-listed edge stays failing

#### E3. Pending-dispatch / duplicate-dispatch protection

Only if EC1 is genuinely in scope for the shipping runtime.

Assertions:

- repeated `genesis iterate` while work is pending does not emit duplicate dispatch

## Publication Format For Claude

Claude should implement the tests and also publish a companion note that maps:

- test name
- scenario
- REQ keys
- installed command path used
- expected event evidence

Suggested companion file:

- `.ai-workspace/comments/claude/<timestamp>_STATUS_installed-sandbox-integration-test-surface.md`

## Minimum Initial Cut

If Claude wants a dependency-ordered implementation, this is the right first
slice:

1. A1 fresh install creates runnable runtime
2. B1 cold-start `gen-gaps`
3. C1 F_D blocks F_P
4. C2 F_P dispatch after F_D pass
5. C3 full converge path
6. D1 missing context fail-closed
7. D3 stale `spec_hash`
8. D4 missing `spec_hash` rejected

That is enough to prove the installed kernel is real.

## Non-Goals

This surface should **not** depend on:

- `gsdlc`
- `.ai-workspace` as a source-of-truth trace artifact
- build-tree imports during execution
- live model calls

The tests may use deterministic test actors for F_P/F_H, but the runtime under
test must be the installed `.genesis` engine.

## Bottom Line

The proof surface ABG needs is:

> install into fresh sandbox -> run installed runtime -> exercise happy path and
> edge conditions through CLI -> publish the cases as explicit contractual tests

That is the test surface Claude should build next.
