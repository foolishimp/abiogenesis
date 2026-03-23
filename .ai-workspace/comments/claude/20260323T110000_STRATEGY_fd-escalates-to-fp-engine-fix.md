# STRATEGY: Fix ABG Engine Escalation — F_D Failure Escalates to F_P

**Author**: Claude
**Date**: 2026-03-23T11:00:00+11:00
**For**: Jim + Codex review
**Supersedes**: GSDLC topology work (paused — engine semantics must be right first)

---

## Problem

The engine currently treats F_D failure as a gate that **blocks** F_P dispatch (REQ-F-GATE-002, ADR-014). The correct law: F_D failure is the **trigger** for F_P escalation. F_D findings become part of the problem surface that F_P must address.

Without this fix, every domain graph gets distorted to work around the wrong engine law. The GSDLC topology redesign is paused until this is resolved.

User's directive: *"i just need F_D on failure -> F_P"*

---

## Current Gate Sites (3 locations, 2 builds)

| Build | File | Line | Gate |
|-------|------|------|------|
| claude_code | `schedule.py` | 130 | `if fp_failing and not fd_failing:` — F_P only when F_D clean |
| claude_code | `commands.py` | 299 | `if fd_failing and fp_failing: return` — early return, no manifest |
| codex | `schedule.py` | 23 | `if fd_failing: return surface` — hard stop |

The codex build has the same semantics via different structure: `commands.py:149` also guards with `if fp_needed and not fd_blocked:`.

---

## What Already Works (no changes needed)

- `bind_fd()` computes ALL evaluator status unconditionally (F_D, F_P, F_H)
- F_P manifest JSON already includes `fd_results` (commands.py:407)
- `_assemble_prompt()` already includes F_D findings in the GAP section of the F_P prompt
- `bind_fp()` does NOT check F_D status — only checks for missing contexts
- F_D re-runs every iterate() call (stateless, live execution)

These mean: the plumbing for passing F_D findings to F_P is already in place. The only change is removing the gate.

---

## New Escalation Model

```
F_D runs → findings recorded as found{kind: fd_gap}
  → F_P dispatched WITH F_D findings in manifest
    → F_P produces/repairs
      → next iterate() re-runs F_D to certify
        → F_D passes: check F_H
        → F_D still fails: F_P re-dispatched
```

**Edge case preserved**: F_D failing + F_P already certified = `fd_gap` (construction quality problem — F_P's work didn't satisfy deterministic checks). Auto-loop stops here.

**F_H gate unchanged**: still requires both F_D and F_P to pass.

---

## Phase 1: Specification (spec leads, code follows)

**File**: `specification/requirements.md`

### REQ-F-GATE-002 (lines 129-138) — Rewrite

**Old title**: *"F_D must all pass before F_P dispatch; F_D+F_P before F_H"*
**New title**: *"F_D failure escalates to F_P; F_D+F_P must pass before F_H"*

New ACs:
- **AC-1**: When F_D failing AND F_P not certified → emit both `found{kind: fd_gap}` AND `fp_dispatched` in the same iteration. F_D findings included in F_P manifest via `fd_results`.
- **AC-2**: All F_D and F_P must pass before `fh_gate_pending` (unchanged)
- **AC-3**: F_P certified but F_D still failing → `fd_gap` exit code 4 (unchanged — construction quality)
- **AC-4**: Escalation chain: F_D failure → F_P dispatch → F_D certifies → F_H gates

### REQ-F-CMD-002 AC-4 (line 88)

**Old**: *"On F_D failure: emits found{kind: fd_gap}, exits code 4"*
**New**: *"On F_D failure with F_P not certified: emits both found and fp_dispatched, writes manifest. On F_D failure with F_P certified: fd_gap exit code 4."*

### REQ-F-CMD-003 AC-4 (line 101)

Update auto-loop stop list: `fp_dispatched` now covers the escalation case. `found{kind: fd_gap}` only stops the loop when `fp_dispatched` is NOT also present (construction quality edge case).

---

## Phase 2: ADR

**New file**: `builds/claude_code/design/adrs/ADR-021-fd-escalates-to-fp.md`

Supersedes ADR-014. Key points:
- F_D failure escalates to F_P, not gates it
- F_D failures (missing tags, missing files) are often part of the construction task F_P must complete
- Gating F_P forces unnecessary human intervention on cold start
- The F_P manifest already carries `fd_results` — the mechanism exists, only the gate needs removal

---

## Phase 3: Code — claude_code build

### 3A. `builds/claude_code/code/genesis/schedule.py` iterate()

1. Move F_D `found` event emission **before** F_P dispatch block (currently lines 163-174, after F_P block)
2. Change line 130: `if fp_failing and not fd_failing:` → `if fp_failing:`
3. Result: both `found` and `fp_dispatched` emitted in same surface when both F_D and F_P failing
4. F_H gate condition unchanged: `if fh_failing and not fd_failing and not fp_failing:`

### 3B. `builds/claude_code/code/genesis/commands.py` gen_iterate()

**Remove lines 293-313**: the `if fd_failing and fp_failing: return` early return block.

Code falls through to normal path: bind_fp → iterate → manifest creation. The manifest already includes `fd_results` at line 407.

### 3C. `builds/claude_code/code/genesis/commands.py` gen_start() auto-loop

Line 489: Change `found` stop condition to only fire when `fp_dispatched` is NOT also present:
```python
if "found" in new_types and "fp_dispatched" not in new_types:
    result["stopped_by"] = "fd_gap"
    return result
```

This ensures:
- F_D fails + F_P dispatched (escalation): stops with `fp_dispatch`
- F_D fails + F_P certified (construction quality): stops with `fd_gap`

---

## Phase 4: Code — codex build

### 4A. `builds/codex/code/genesis/schedule.py`

Replace `if fd_failing: return surface` (lines 23-35) with: emit `found`, then fall through to `if fp_failing:` check. Both events emitted when both are failing.

### 4B. `builds/codex/code/genesis/commands.py`

- Line 149: `if fp_needed and not fd_blocked:` → `if fp_needed:`
- Lines 187-193: Reorder status checks — `fp_dispatched` before `found`

---

## Phase 5: Tests

### 5A. `builds/claude_code/tests/test_commands.py` — TestFdGateNoManifest (lines 353-413)

Rename class to `TestFdEscalatesToFp`. Invert all assertions:

| Old test | New test | Key assertion |
|----------|----------|--------------|
| `test_no_manifest_when_fd_failing` | `test_manifest_produced_when_fd_and_fp_both_failing` | `fp_manifest_path` IS in result |
| `test_no_edge_started_when_fd_blocking_fp` | `test_edge_started_emitted_when_fd_escalates` | `edge_started` IS in events |
| `test_found_emitted_when_fd_blocking_fp` | `test_both_found_and_fp_dispatched_emitted` | Both events in stream |
| `test_gen_start_auto_stops_at_fd_gap` | `test_auto_stops_at_fp_dispatch_with_mixed` | `stopped_by == "fp_dispatch"` |

**New test**: `test_fd_gap_when_fp_certified` — F_D fails + F_P certified via assessed event → `stopped_by == "fd_gap"` (construction quality edge case preserved)

### 5B. `builds/claude_code/tests/test_integration_workflows.py`

- Line 162: `test_fd_fails_initially_no_fp_dispatch` → assert `fp_dispatched` IS in events
- Line 265: `test_auto_loop_stops_on_fd_gap_mixed_evaluators` → assert `stopped_by == "fp_dispatch"`

---

## Phase 6: Verification

```bash
cd /Users/jim/src/apps/abiogenesis
PYTHONPATH=builds/claude_code/code pytest builds/claude_code/tests/ -v
PYTHONPATH=builds/codex/code pytest builds/codex/tests/ -v
```

Verify:
1. All tests pass (after updates)
2. Cold start: F_D fails → F_P dispatched (not blocked)
3. Construction quality: F_D fails + F_P certified → fd_gap (preserved)
4. F_H gate unchanged: requires F_D + F_P to pass
5. Auto-loop stops correctly for both escalation and construction quality cases

---

## Decision Points for Review

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | F_D failure escalates to F_P (not gates) | User directive; fixes cold-start blocking |
| 2 | Both `found` and `fp_dispatched` emitted in same iteration | Preserves audit trail while enabling dispatch |
| 3 | F_D + F_P certified = fd_gap preserved | Construction quality signal still needed |
| 4 | F_H gate unchanged (requires F_D + F_P pass) | Don't review broken builds |
| 5 | Both builds updated consistently | claude_code and codex must have same semantics |
| 6 | ADR-021 supersedes ADR-014 | Clean decision record trail |
