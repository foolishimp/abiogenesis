# REVIEW: Cross-Usecase Bug Audit — Kernel & Archive Infrastructure

**Author**: Claude
**Date**: 2026-03-22T19:00:00Z
**Addresses**: REQ-F-CORE-004, REQ-F-TEST-001, REQ-F-TRACE
**For**: all

## Summary

Systematic audit of 135 archived test runs across all 6 usecases. Found 9 bugs — 2 HIGH, 3 MEDIUM, 4 LOW. The two HIGH bugs violate the core archive premise: "the archive proves what happened and why."

Cross-referenced with Gemini's `requirements_to_uat` review (20260322T143000) — their "legal but incorrect" finding is a 10th concern at the spec design level, not the kernel level, and is tracked separately below.

## Audit Scope

- **Usecases**: brief_to_article, design_to_schema, intent_to_requirements, kernel_safety, multi_input_to_code, requirements_to_uat
- **Runs**: 135 archived runs across 3 pytest invocation batches
- **Artifacts examined**: summary.json, run.json, stdout.log, events.jsonl, fp_manifests/*.json, fp_results/

---

## HIGH Severity

### BUG-01: `replay_determinism` archive is blind — `converged=null, events=0`

**Category**: Postmortem truth failure
**Usecase**: kernel_safety / test_replay_determinism (all 3 runs)

The test installs into `workspace/sandbox_0/` and `workspace/sandbox_1/` subdirectories. `finalize()._build_summary()` reads events from `workspace/.ai-workspace/events/events.jsonl` (the root), which has 0 lines. Actual events (1 per sandbox) live in the subdirectory workspaces.

**Evidence**:
```
workspace/.ai-workspace/events/events.jsonl           → 0 lines
workspace/sandbox_0/.ai-workspace/events/events.jsonl → 1 line (genesis_installed)
workspace/sandbox_1/.ai-workspace/events/events.jsonl → 1 line (genesis_installed)
```

`run.json` logs 4 commands (2 installs + 2 gaps), proving work occurred. Summary contradicts it.

**Fix options**:
- A) `finalize()` walks subdirectories to aggregate events
- B) test creates a single workspace, installs twice into it (but that changes the test semantics)
- C) summary.json gains a `sub_workspaces` array with per-sandbox summaries

### BUG-04: `result_path` is dead protocol — 0 files written across 60 manifests

**Category**: Contract violation / asset truth failure
**Usecase**: ALL usecases with manifests

60 `fp_results/` directories exist across all runs. Zero files in any of them. The manifest's OUTPUT CONTRACT tells the F_P agent:

> "Write assessment JSON to: [result_path] ... The skill reads this file and emits assessed events — do NOT call emit-event yourself."

But every test fixture calls `emit_event` directly — the exact opposite of what the manifest instructs. No consumer reads `result_path`. The iterate command doesn't poll it.

**Evidence**: `find builds/claude_code/tests/runs -path "*/fp_results/*" -type f | wc -l` → 0

**Fix options**:
- A) Remove result_path from the manifest contract if the real protocol is emit-event
- B) Implement result_path consumption in iterate, making the manifest truthful
- C) Both — decide which is the canonical assessment protocol and kill the other

---

## MEDIUM Severity

### BUG-02: `install_creates_minimal_sandbox` summary shows delta=12 without context

**Category**: Misleading archive
**Usecase**: kernel_safety / test_install_creates_minimal_sandbox (all 3 runs)

Test only runs `install_sandbox()` (1 command). `finalize()` runs `genesis gaps` against the `genesis_core` default package, which has 12 evaluators — all failing because nothing has converged in a fresh kernel. Delta=12 is *correct baseline behavior*, but the archive looks like a massive failure.

**Fix options**:
- A) summary.json gains a `package` field so the reader knows which spec was evaluated
- B) install test skips gaps in finalize (but loses postmortem data)

### BUG-03: `finalize()` runs unlogged `genesis gaps` subprocess

**Category**: Audit trail integrity
**Usecase**: ALL usecases

`_build_summary()` at `scenario_helpers.py:127` calls `run_genesis_json(self.workspace, "gaps")` without passing `archive=`. This subprocess doesn't appear in `run.json` commands or `stdout.log`.

**Evidence**: `run.json` reports N commands; N+1 actually ran. Forensic replay of `run.json` won't reproduce the summary.

**Fix**: Pass `archive=self` to the `run_genesis_json` call in `_build_summary()`, or explicitly log it as a `finalize_gaps` labeled command.

### BUG-05: Absolute host paths in 100% of manifests — non-portable

**Category**: Portability
**Usecase**: ALL usecases with manifests (60/60 manifests affected)

Both `prompt` and `result_path` fields contain `/Users/jim/src/apps/abiogenesis/builds/claude_code/tests/runs/...`. Moving the archive to another machine or sharing with another developer breaks all path references.

**Fix options**:
- A) Manifest uses workspace-relative paths (`workspace://.ai-workspace/fp_results/...`)
- B) Post-processing in archive copies rewrites paths to relative
- C) Accept this as a known limitation for local-only test runs

---

## LOW Severity

### BUG-06: `current_asset.status` always `not_started` / `event_count: 0`

**Category**: Stale metadata in manifests
**Usecase**: ALL manifests (60/60)

Manifest is computed *before* `edge_started` is emitted, so the "current state" snapshot is always the pre-edge state. An F_P agent receiving this manifest can't understand incremental progress.

### BUG-07: `workflow_version` always `"unknown"` in assessed events

**Category**: Provenance gap
**Usecase**: ALL assessed events (33/33)

No mechanism populates workflow_version. For release audits, you can't trace which engine version certified an edge.

### BUG-08: Event type `"found"` is semantically opaque

**Category**: Observability
**Usecase**: 30 events across all usecases (fd_gates_fp + fd_gap_event_on_gate tests)

Other event types are self-describing: `genesis_installed`, `edge_started`, `fp_dispatched`, `assessed`, `edge_converged`. But F_D gate detection uses generic `"found"` with the real meaning buried in `data.kind: "fd_gap"`. Makes log filtering and dashboards harder.

**Source**: `schedule.py:161`, `commands.py:296`

### BUG-09: No archive pruning — 52MB and growing unbounded

**Category**: Operational
**Evidence**: 135 runs at 52MB after 3 pytest invocations. Each run creates ~45 new archives. `.gitignore` prevents git bloat but local/CI disk usage is unbounded.

---

## Cross-Reference: Gemini "Legal but Incorrect" Finding

Gemini's review (20260322T143000) identified that the `requirements_to_uat` convergence succeeds despite incomplete requirement coverage, because the test package relies solely on F_P judgment without F_D backup. This is a **spec design concern**, not a kernel bug — the kernel correctly followed its rules. But it validates that production specs must include F_D coverage evaluators as a safety invariant. This is already addressed by `REQ-F-COV-001` in the production `abiogenesis.py` spec.

---

## Recommended Triage

| Priority | Bugs | Rationale |
|----------|------|-----------|
| Fix before release | BUG-04 | Dead protocol in the manifest contract is a credibility problem for any consumer |
| Fix before release | BUG-03 | Unlogged subprocess is a one-line fix with high audit value |
| Fix next sprint | BUG-01 | Archive blind spot, but only affects kernel_safety multi-workspace test |
| Fix next sprint | BUG-05 | Portability matters for team sharing and CI |
| Design review | BUG-06 | Requires deciding when current_asset snapshot should be taken |
| Design review | BUG-08 | Requires event schema versioning discussion |
| Backlog | BUG-02, BUG-07, BUG-09 | Low impact, easy fixes when convenient |
