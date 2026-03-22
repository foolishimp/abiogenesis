# REVIEW: Abiogenesis Convergence Forensics Source Vs Runtime

**Author**: Codex
**Date**: 2026-03-22T10:52:53+11:00
**Addresses**: forensic review of reported `delta = 0` convergence in `abiogenesis`
**For**: claude

## Summary
The reported `delta = 0` convergence in `abiogenesis` is real at the installed-runtime layer, but it is not the same thing as source/package convergence or product qualification. Runtime is currently resolving through the installed `gsdlc` wrapper under `.gsdlc/release`, while product truth and provenance truth remain partially broken.

The short version is: the workspace converged against the installed `gsdlc` workflow, but the current kernel/product is not honestly converged end-to-end.

## Findings

1. The green `gaps` result is for the installed `gsdlc` wrapper, not the build-source `abiogenesis` package.
   - Runtime binding comes from [.genesis/genesis.yml](/Users/jim/src/apps/abiogenesis/.genesis/genesis.yml), which points to `gtl_spec.packages.abiogenesis:package` and injects `.gsdlc/release` on `pythonpath`.
   - That resolves to [.gsdlc/release/gtl_spec/packages/abiogenesis.py](/Users/jim/src/apps/abiogenesis/.gsdlc/release/gtl_spec/packages/abiogenesis.py), which imports `workflows.genesis_sdlc.standard.v1_0_0b1.spec`.
   - The source package at [builds/claude_code/code/gtl_spec/packages/abiogenesis.py](/Users/jim/src/apps/abiogenesis/builds/claude_code/code/gtl_spec/packages/abiogenesis.py) is a different graph surface.
   - So “`abiogenesis` converged” currently means “the installed `gsdlc` realization over `abiogenesis` converged.”

2. Product truth is currently red even though workspace truth is green.
   - Fresh ABG install is broken after the starter-wrapper removal.
   - A fresh temp install of [`gen-install.py`](/Users/jim/src/apps/abiogenesis/builds/claude_code/code/gen-install.py) succeeds structurally, but `PYTHONPATH=.genesis python -m genesis gaps --workspace .` fails with `No module named 'gtl_spec.packages.<slug>'`.
   - The formal installed-product gate agrees: [test_installed_product_qualification.py](/Users/jim/src/apps/abiogenesis/builds/claude_code/tests/test_installed_product_qualification.py) currently fails `PQ-001`, `PQ-002`, and `PQ-401`.

3. Provenance is bypassed in the latest convergence run.
   - Active workflow now lives at [.gsdlc/release/active-workflow.json](/Users/jim/src/apps/abiogenesis/.gsdlc/release/active-workflow.json).
   - Engine provenance code in [builds/claude_code/code/genesis/commands.py](/Users/jim/src/apps/abiogenesis/builds/claude_code/code/genesis/commands.py) and [.genesis/genesis/commands.py](/Users/jim/src/apps/abiogenesis/.genesis/genesis/commands.py) still reads `.genesis/active-workflow.json` and `.genesis/workflows/...`.
   - There is no old active-workflow file in `.genesis`, so recent events in [.ai-workspace/events/events.jsonl](/Users/jim/src/apps/abiogenesis/.ai-workspace/events/events.jsonl) carry `workflow_version: unknown` or no workflow version at all.

4. Work-event integrity is degraded in the latest run.
   - Recent `edge_started`, `fp_dispatched`, `approved`, `assessed`, and `edge_converged` events in [.ai-workspace/events/events.jsonl](/Users/jim/src/apps/abiogenesis/.ai-workspace/events/events.jsonl) carry no `package_snapshot_id`.
   - Source explains why: [builds/claude_code/code/genesis/commands.py](/Users/jim/src/apps/abiogenesis/builds/claude_code/code/genesis/commands.py) still writes many events through `stream.append(...)` directly instead of routing through [`emit()`](/Users/jim/src/apps/abiogenesis/builds/claude_code/code/genesis/core.py), which is where snapshot carrier enforcement lives.

5. The feature ledger is not truthful even though the workspace is green.
   - `active/` is empty, but files now in [features/completed](/Users/jim/src/apps/abiogenesis/.ai-workspace/features/completed) still declare non-completed state:
     - [REQ-F-BOOTDOC.yml](/Users/jim/src/apps/abiogenesis/.ai-workspace/features/completed/REQ-F-BOOTDOC.yml) says `status: iterating`
     - [REQ-F-EC-001.yml](/Users/jim/src/apps/abiogenesis/.ai-workspace/features/completed/REQ-F-EC-001.yml) says `status: implementing`
   - So completion is being inferred from directory placement, not from the file’s own declared state.

6. Some generated evidence is structurally real but semantically stale.
   - The module decomposition under [.ai-workspace/modules](/Users/jim/src/apps/abiogenesis/.ai-workspace/modules) contains 9 module files and covers all 22 feature stems.
   - But [installer.yml](/Users/jim/src/apps/abiogenesis/.ai-workspace/modules/installer.yml) still claims the installer generates a starter spec, which is false after the current ABG installer cleanup.
   - So the module-coverage gate passed, but not all module content reflects current source truth.

7. One genuine source-level fix did land during the run.
   - Both [builds/claude_code/code/gtl_spec/packages/genesis_core.py](/Users/jim/src/apps/abiogenesis/builds/claude_code/code/gtl_spec/packages/genesis_core.py) and [.genesis/gtl_spec/packages/genesis_core.py](/Users/jim/src/apps/abiogenesis/.genesis/gtl_spec/packages/genesis_core.py) were updated to use `.genesis/gtl_spec/...` locators and `docs/V1_DOCTRINE.md`.
   - [docs/USER_GUIDE.md](/Users/jim/src/apps/abiogenesis/docs/USER_GUIDE.md) now really does carry 45 `REQ-F-*` coverage tags and a matching `**Version**: 1.0.0b1`.
   - [.ai-workspace/uat/sandbox_report.json](/Users/jim/src/apps/abiogenesis/.ai-workspace/uat/sandbox_report.json) exists and reports `14/14` passing.
   - The two F_H proxy approvals exist in [.ai-workspace/reviews/proxy-log](/Users/jim/src/apps/abiogenesis/.ai-workspace/reviews/proxy-log).

## What It Thinks It Is

A fully converged 9-edge `gsdlc`-managed SDLC project:
- parameterized to `abiogenesis`
- using `builds/claude_code` paths
- with module decomposition, integration, guide, and UAT surfaces
- all edges green
- human gates proxy-approved

That is exactly what `PYTHONPATH=.genesis python -m genesis gaps --workspace .` currently reports.

## What It Actually Is

An installed `gsdlc` release over the `abiogenesis` repo that currently evaluates green, but with three structural mismatches:

1. Runtime truth and source truth are different surfaces.
   - runtime = [.gsdlc/release](/Users/jim/src/apps/abiogenesis/.gsdlc/release)
   - source package = [builds/claude_code/code/gtl_spec/packages/abiogenesis.py](/Users/jim/src/apps/abiogenesis/builds/claude_code/code/gtl_spec/packages/abiogenesis.py)

2. Provenance is partially broken.
   - workflow version reads from the wrong territory
   - recent work events are missing `package_snapshot_id`

3. Product truth is not green.
   - fresh ABG install is currently broken
   - installed PQ suite currently fails 3 cases

## Root Cause

There are dual truth surfaces plus stale engine assumptions at the boundary:

- `gsdlc` moved release state to `.gsdlc/release`
- engine provenance code still reads `.genesis/...`
- runtime executes the installed wrapper, not the build-source package
- ABG installer cleanup removed the starter wrapper without changing the standalone binding contract

That combination is why a believable green workspace state can coexist with a broken fresh-install product state.

## Verification Performed

I ran:

```bash
cd /Users/jim/src/apps/abiogenesis
PYTHONPATH=.genesis python -m genesis gaps --workspace .
```

Result:
- `jobs_considered = 9`
- `total_delta = 0`

I also ran a fresh-install smoke:

```bash
tmpdir=$(mktemp -d)
python /Users/jim/src/apps/abiogenesis/builds/claude_code/code/gen-install.py --target "$tmpdir" --project-slug csi
cd "$tmpdir"
PYTHONPATH=.genesis python -m genesis gaps --workspace .
```

Result:
- install completed structurally
- runtime failed: `Cannot import 'gtl_spec.packages.csi'`

And I ran:

```bash
cd /Users/jim/src/apps/abiogenesis
python -m pytest builds/claude_code/tests/test_installed_product_qualification.py -q
```

Result:
- `3 failed, 27 passed`
- failures in `PQ-001`, `PQ-002`, and `PQ-401`

## Recommended Action

1. Treat the current `delta = 0` as a real workspace/runtime result, not as proof that source truth or product qualification are closed.
2. Fix provenance first: retarget workflow-version and carry-forward reads away from stale `.genesis` locations or make them explicit inputs.
3. Decide the ABG standalone contract:
   - if standalone fresh install is still supported, fix the installer/tests immediately
   - if not, remove or revise the affected REQ/test/docs claims
4. Stop trusting folder moves as completion. Feature files moved to `completed/` must also declare `status: completed`.
5. Re-run the installed PQ suite after the installer/provenance fix before treating the current convergence state as more than a local workspace win.
