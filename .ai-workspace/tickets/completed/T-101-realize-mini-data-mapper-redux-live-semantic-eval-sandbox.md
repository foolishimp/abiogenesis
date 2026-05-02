---
id: T-101
title: Realize mini data-mapper redux live semantic eval sandbox
type: feature
ticket_category: sandbox_capability_eval
status: completed
review_status: closure_accepted_for_live_semantic_sandbox
goal: repeatable-abg-building-block-for-workspace-visible-asset-traversal-assurance
change_intent: Provide a small data-mapper-shaped sandbox where graph-function edges can be run one at a time or as a full sequence, with F_D limited to mechanical envelope checks and F_P owning semantic per-obligation judgment.
change_class: design_reframe
re_entry_point: design
affected_boundary: TypeScript test_env sandbox, F_P/F_D evaluator boundary, workspace-visible per-edge ledgers, operator manual tuning loop
priority: high
triaged_at: 2026-05-02T17:25:59+10:00
created_at: 2026-05-02T17:25:59+10:00
updated_at: 2026-05-02T17:25:59+10:00
closed_at: 2026-05-02T21:40:26+10:00
dependencies:
  - T-082 active ABG output instance allocation
  - T-100 active workspace zoom foldback building block
  - T-102 completed eval-suite projection artifacts
related_design:
  - build_tenants/abiogenesis/typescript/design/M03_OUTPUT_ALLOCATION_AND_WORKSPACE_ZOOM_FOLDBACK_DERIVATION.md
governance_scope: STDO Method
intake_source: Operator requested a live sandbox implementation under test_runs with a mini data_mapper_template-shaped lifecycle so the eval loop can be iterated independently of the full downstream SDLC product.
target_truth: The TypeScript tenant exposes a small, operator-runnable data-mapper sandbox whose edges write inspectable runtime assets, ledgers, schedules, assessments, foldback projections, and gaps surfaces under test_runs; semantic quality is evaluated per obligation by F_P, while F_D only checks mechanical envelopes.
superseded_truth: Sandbox proof is only a monolithic node test or F_D lexical check that can report green without product/domain semantic assessment.
closure_law: close only when the mini sandbox has a durable ticket, operator-facing commands, per-edge and full-run modes, fixture and live worker paths, runtime artifacts under test_runs, and proof that F_D does not replace F_P semantic evaluation.
non_closure_conditions:
  - F_D checks judge semantic content beyond mechanical envelope validity
  - the sandbox cannot be manually rerun over a chosen workspace
  - per-edge ledger/foldback artifacts are not inspectable between runs
  - live-worker failure overwrites admitted semantic evidence
  - Codex live dispatch is not pinned to gpt-5.3-codex
---

# T-101: Mini Data-Mapper Redux Sandbox

## STDO Triage

First missing layer: design.

T-082 and T-100 define the ABG building blocks. The missing test-environment
surface is an operator-runnable mini product that exercises those blocks at an
edge grain without the full downstream `odd_sdlc` traversal.

## Current Implementation Surface

The current TypeScript sandbox surface is:

- `build_tenants/abiogenesis/typescript/test_env/sandbox/mini_dm_redux/module.mjs`
- `build_tenants/abiogenesis/typescript/test_env/sandbox/mini_dm_redux/fp_worker.mjs`
- `build_tenants/abiogenesis/typescript/test_env/sandbox/mini_dm_redux/fp_evaluator.mjs`
- `build_tenants/abiogenesis/typescript/test_env/sandbox/mini_dm_redux/fd_envelope.mjs`
- `build_tenants/abiogenesis/typescript/test_env/sandbox/mini_dm_redux/run.mjs`
- `build_tenants/abiogenesis/typescript/test_env/sandbox/test_t101_mini_dm_redux_live.test.mjs`

## Acceptance Criteria

- `npm run test:t101` exercises the three-edge fixture lane.
- `npm run test:t101:edge1`, `test:t101:edge2`, and `test:t101:edge3` expose
  manual per-edge runs over a caller-supplied workspace.
- `npm run test:t101:full` runs all edges in order.
- `npm run test:t101:gaps` projects a readable gaps surface.
- F_D remains a mechanical envelope check.
- F_P evaluates requirement-by-requirement semantic content.
- Runtime evidence stays under the sandbox workspace and `test_runs`.
- Codex live dispatch uses the shared `contractForKnownAgent("codex")` carrier
  and pins the model to `gpt-5.3-codex`.

## Status

Implementation exists in the active worktree. Closure still needs a final STDO
review after T-102 lands the generic eval-suite projection layer.

Observed verification on 2026-05-02:

- `npm run test:t101` passed, 1/1.

Correction/proof on 2026-05-02:

- The first live sandbox run used the Claude lane because `CODEX_LIVE_FP=1`
  defaulted to `claude`. That was not acceptable for Codex-live proof.
- The shared Codex transport contract now dispatches
  `codex exec --model gpt-5.3-codex --full-auto --skip-git-repo-check`.
- The T-101 live worker now defaults to `codex`; alternate agents require
  explicit `ABG_TS_LIVE_AGENT=<agent>`.
- Focused verification passed:
  - `npm run build:semantic`
  - `node --test test_env/tests/test_m03_transport_protocol_unit.test.mjs`
  - `npm run test:t101`
  - `npm run lint:test-harness`
- Live Codex proof workspace:
  `/tmp/abg_t101_codex_live_gpt53_20260502T182800`
- Live Codex proof result:
  - `derive_field_spec`: `foldback=close`, 3/3 fulfilled
  - `derive_implementation`: `foldback=close`, 4/4 fulfilled including
    `REQ-IMPL-COMPILES`
  - `derive_validation`: `foldback=close`, 3/3 fulfilled through empirical
    execution of `mapRecord`
- Transport logs for all three edges record `agentKey: codex` and args
  containing `--model`, `gpt-5.3-codex`.

## Closure Disposition: 2026-05-02

T-101 is closed for the ABIogenesis TypeScript source scope.

Closure evidence:

- `mini_dm_redux` exposes a three-edge data-mapper-shaped sandbox with per-edge
  and full-run commands.
- F_D remains mechanical envelope validation. F_P performs requirement-by-
  requirement semantic evaluation over materialized artifacts.
- The Codex live worker path is pinned through the shared transport contract to
  `gpt-5.3-codex`; alternate agents require explicit operator selection.
- Runtime state, per-edge ledger/schedule/foldback artifacts, gaps projection,
  stdout/stderr, and eval artifacts remain inspectable under the selected
  workspace and `test_runs`.

Verification rerun:

- `npm run test:t101` passed, 2/2.
- `npm run test:t102` passed, 7/7.
- `npm run test:semantic` passed, 349/349.
- `npm run lint:semantic` passed.
