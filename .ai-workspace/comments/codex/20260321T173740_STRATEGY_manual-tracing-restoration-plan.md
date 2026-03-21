---
title: Manual Tracing Restoration Plan
author: codex
date: 2026-03-21
status: proposed
---

# Problem

The engine is currently not trustworthy as the sole tracing mechanism. We need a
manual recovery pass that reconstructs the full assurance chain in both
directions:

- forward: `intent -> requirements -> features -> design -> code -> tests -> UAT-like evidence`
- backward: `failure/evidence -> tests -> code -> design -> features -> requirements -> intent`

This is not optional cleanup. Until the chain is reconstructed manually, any
convergence signal is suspect.

# Scope

This plan is for `abiogenesis` first.

Important constraint: the `abiogenesis` GTL package does **not** currently have
separate `integration_tests` or `uat_tests` graph assets. Its graph ends at:

- `intent`
- `requirements`
- `feature_decomp`
- `design`
- `code`
- `unit_tests`
- `bootloader_doc`

So the manual restoration must distinguish:

- **graph-native trace**: through `unit_tests`
- **extra-graph assurance surfaces**: integration-primary tests, sandbox
  self-hosting, and human/UAT-like judgment

# Canonical Artifact Surfaces

The manual walk should treat these as the authoritative surfaces, in this order:

1. Intent
   - `specification/INTENT.md`
2. Requirement registry
   - `specification/requirements.md`
3. Feature grouping / decomposition
   - `specification/feature_decomposition.md`
   - `.ai-workspace/features/completed/*.yml`
4. Design
   - `builds/claude_code/design/adrs/*.md`
5. Executable graph contract
   - `builds/claude_code/code/gtl_spec/packages/abiogenesis.py`
6. Code
   - `builds/claude_code/code/genesis/*.py`
   - `builds/claude_code/code/gtl/core.py`
   - `builds/claude_code/code/gen-install.py`
7. Tests
   - `builds/claude_code/tests/*.py`
8. UAT-like / operational evidence
   - `builds/claude_code/tests/test_integration_workflows.py`
   - `builds/claude_code/tests/test_e2e_sandbox.py`
   - self-hosting workspace results

# Forward Walk

## 1. Intent -> Requirement Families

Start at `INTENT.md` and enumerate each declared outcome. Map each one to the
requirement families in `requirements.md`.

For `abiogenesis`, the first-pass families are:

- `REQ-F-BOOT-*`
- `REQ-F-GRAPH-*`
- `REQ-F-CMD-*`
- `REQ-F-GATE-*`
- `REQ-F-TAG-*`
- `REQ-F-COV-*`
- `REQ-F-DOCS-*`
- `REQ-F-EVAL-*`
- `REQ-F-VIS-*`
- `REQ-F-WKSP-*`
- `REQ-F-BIND-*`
- `REQ-F-CORE-*`
- `REQ-F-TEST-*`
- `REQ-F-PROV-*`
- `REQ-F-EC-*`
- `REQ-F-BOOTDOC-*`

Output of this step:

- an `Intent -> REQ family` ledger

## 2. Requirement Families -> Feature Vectors

Map each REQ family to the completed feature YAMLs under
`.ai-workspace/features/completed/`.

Known feature surfaces already present:

- `REQ-F-GRAPH.yml`
- `REQ-F-BOOT.yml`
- `REQ-F-CMD-GAPS.yml`
- `REQ-F-CMD-ITER.yml`
- `REQ-F-CMD-START.yml`
- `REQ-F-GATE.yml`
- `REQ-F-TRACE.yml`
- `REQ-F-DOCS.yml`
- `REQ-F-EVAL.yml`
- `REQ-F-EVAL-COV.yml`
- `REQ-F-EVAL-SNAP.yml`
- `REQ-F-EVAL-005.yml`
- `REQ-F-WKSP.yml`
- `REQ-F-BIND.yml`
- `REQ-F-CORE.yml`
- `REQ-F-ENGINE-CORRECTNESS.yml`
- `REQ-F-TEST.yml`
- `REQ-F-PROV-001.yml`
- `REQ-F-EC-001.yml`
- `REQ-F-BOOTDOC.yml`
- `REQ-F-VIS.yml`

Output of this step:

- a `REQ family -> feature YAML` ledger
- explicit identification of REQ keys with no feature carrier

## 3. Features -> Design

For each feature, map to the ADRs and design surfaces that define the behavior.

Core design surfaces likely to dominate this pass:

- `ADR-001-gtl-as-spec.md`
- `ADR-002-bind-fd-fp-split.md`
- `ADR-003-precomputed-manifest.md`
- `ADR-009-traceability-commands.md`
- `ADR-011-spec-snapshot-binding.md`
- `ADR-014-fd-gates-fp-and-fh.md`
- `ADR-015-integration-primary-test-architecture.md`
- `ADR-016-prime-operators-event-calculus.md`
- `ADR-017-domain-model.md`
- `ADR-018-runtime-flow.md`
- `ADR-019-algorithms.md`

Output of this step:

- `feature -> ADR/design surface` map

## 4. Design -> Executable Graph / Code

Map design to:

- the GTL package in `gtl_spec/packages/abiogenesis.py`
- concrete runtime modules:
  - `core.py`
  - `bind.py`
  - `commands.py`
  - `schedule.py`
  - `manifest.py`
  - `__main__.py`
  - `gtl/core.py`
  - `gen-install.py`

This is the point where each requirement/design claim must have a concrete code
owner.

Output of this step:

- `ADR/REQ -> code module/function` map

## 5. Code -> Tests

Map each code/module responsibility to the test evidence that exercises it.

The test families that matter now are:

- unit-seam tests
  - `test_core.py`
  - `test_bind.py`
  - `test_commands.py`
  - `test_schedule.py`
  - `test_manifest.py`
  - `test_cli_config.py`
- property / invariant tests
  - `test_property_invariants.py`
- integration-primary tests
  - `test_integration_workflows.py`
- sandbox / self-hosting / UAT-like evidence
  - `test_e2e_sandbox.py`

Output of this step:

- `code module -> test file/test case` map
- explicit statement of untested claims

## 6. Tests -> UAT-like Evidence

Because `abiogenesis` has no `uat_tests` graph asset, this step must be explicit
about what counts as the operational / UAT-like layer:

- integration-primary command workflows
- sandbox self-hosting
- human review of whether the engine solves the intended kernel problem

This is where the current known failing evidence sits:

- `test_e2e_sandbox.py::TestSelfHosting::test_engine_evaluates_own_workspace`

Output of this step:

- `test evidence -> operational/UAT-like assurance claim` map

# Backward Walk

Start from failures or weak evidence and walk back to intent.

## 1. Evidence / Failure -> Test Surface

Current seed failure:

- self-hosting sandbox failure with `total_delta=5`
- failing F_P evaluators:
  - `decomp_complete`
  - `design_coherent`
  - `synthesize_bootloader`
  - `code_complete`
  - `coverage_complete`

Map each failure to the exact test or runtime evidence surface that exposed it.

## 2. Test Surface -> Code Owner

For each failed evaluator/test, identify the owning runtime/module path.

Examples:

- evaluator binding / certification -> `bind.py`
- workflow projection / gap derivation -> `commands.py`, `schedule.py`
- graph and package loading -> `core.py`, `gtl_spec/packages/abiogenesis.py`
- bootloader synthesis / doc lineage -> `abiogenesis.py`, bootloader surfaces

## 3. Code Owner -> Design / ADR

Walk each code owner back to the ADR/design claim it is supposed to realize.

This is where we distinguish:

- implementation bug
- design not actually implemented
- design itself ambiguous

## 4. Design -> Feature / REQ

Map each broken design/code area back to:

- feature YAML
- REQ key(s)

This step must produce a gap register with:

- `missing implementation`
- `broken implementation`
- `broken trace`
- `spec/design ambiguity`
- `false green evidence`

## 5. REQ / Feature -> Intent

Finally, state which intent clause is not currently being satisfied.

This keeps the exercise honest: the endpoint is not “which code is broken,” but
“which part of the intended kernel behavior is unsatisfied.”

# Deliverables

The manual restoration pass should produce four explicit artifacts:

1. `Forward Trace Matrix`
   - `Intent -> REQ -> Feature -> Design -> Code -> Tests -> UAT-like evidence`
2. `Backward Failure Matrix`
   - `Failure -> Tests -> Code -> Design -> Feature -> REQ -> Intent`
3. `Trace Gap Register`
   - every missing or ambiguous handoff in the chain
4. `Temporary Manual Assurance Statement`
   - what is actually supported by the reconstructed evidence
   - what is still unproven

# Decision Rules

Use these rules during the walk:

- If a REQ key has no feature carrier: trace gap
- If a feature has no ADR/design owner: design gap
- If a design claim has no code owner: implementation gap
- If code has no exercising test: assurance gap
- If tests pass but no backward path reaches intent: false-green gap
- If evidence exists only at unit level for a system claim: not UAT-grade

# Immediate Priority

Do this first for the currently hot path:

1. `INT-001`
2. `REQ-F-GRAPH-*`
3. `REQ-F-CMD-*`
4. `REQ-F-EVAL-*`
5. `REQ-F-CORE-*`
6. `REQ-F-TEST-*`
7. `REQ-F-PROV-*`
8. `REQ-F-EC-*`
9. `REQ-F-BOOTDOC-*`

That subset is enough to reconstruct the real assurance story around the current
ABG 1.0 work and the self-hosting failure.

# Bottom Line

Until the engine is trustworthy again, tracing must be treated as a manual
discipline, not an automatic projection. The goal of this pass is not just to
find broken code. It is to restore a truthful chain from intent to evidence and
back again, so that future convergence claims mean something.
