# STRATEGY v2: Fix ABG Engine Escalation — F_D Findings Escalate to F_P

**Author**: Claude
**Date**: 2026-03-23T11:30:00+11:00
**For**: Jim + Codex review
**Supersedes**: v1 at `20260323T110000_STRATEGY_fd-escalates-to-fp-engine-fix.md`
**Incorporates**: Codex findings from `20260323T104212_ADR014-rewrite-capability-escalation.md`

---

## Problem

The engine treats F_D evaluator failure as a gate that **blocks** F_P dispatch (REQ-F-GATE-002, ADR-014, commits `40d1209` + `3ee4e7e` from 2026-03-16). The correct law: on edges with unresolved F_P evaluators, F_D evaluator findings escalate to F_P as problem surface.

This is scoped to:
- **Evaluator findings** on edges that have F_P evaluators — not fatal engine/runtime errors
- Fatal errors (context integrity failure, missing upstream source) already propagate as exceptions before reaching iterate()
- F_D-only edges (no F_P evaluators) are unaffected — `fd_gap` remains terminal there

---

## Current Gate Sites (claude_code build — primary scope)

| File | Line | Gate |
|------|------|------|
| `schedule.py` | 130 | `if fp_failing and not fd_failing:` — F_P only when F_D clean |
| `commands.py` | 299 | `if fd_failing and fp_failing: return` — early return, no manifest |

Codex build has equivalent gates. Cascade to codex is a follow-up, not part of this immediate fix.

---

## What Already Works (no changes needed)

- `bind_fd()` computes ALL evaluator status unconditionally (F_D, F_P, F_H)
- F_P manifest JSON already includes `fd_results` (commands.py:407)
- `_assemble_prompt()` already includes F_D findings in the GAP section of the F_P prompt
- `bind_fp()` does NOT check F_D status — only checks for missing contexts
- F_D re-runs every iterate() call (stateless, live execution)

The plumbing for passing F_D findings to F_P is already in place. The only change is removing the gate.

---

## Event Kind Split (Codex finding #2)

The current `found{kind: fd_gap}` carries two meanings. Split into distinct event kinds:

| Event kind | Meaning | When emitted |
|-----------|---------|-------------|
| `found{kind: fd_findings}` | F_D found issues, escalating to F_P | Same iteration as `fp_dispatched` — observational record carried into escalation |
| `found{kind: fd_gap}` | Terminal F_D gap — no F_P to escalate to, or F_P certified but F_D still red | Auto-loop stop condition |

This makes the event stream unambiguous for audit consumers. One string change in code.

---

## New Escalation Model

```
F_D runs → evaluator findings recorded as found{kind: fd_findings}
  → F_P dispatched WITH F_D findings in manifest (fd_results)
    → F_P produces/repairs
      → next iterate() re-runs F_D to certify
        → F_D passes: check F_H
        → F_D still fails + F_P not certified: re-dispatch F_P
        → F_D still fails + F_P certified: fd_gap (construction quality)
```

**Scoping rules**:
- Escalation only on edges with F_P evaluators and unresolved F_P
- F_D-only edges: `fd_gap` remains terminal (no F_P to escalate to)
- Fatal engine errors: halt via exception, never reach iterate()
- F_H gate unchanged: requires both F_D and F_P to pass

---

## Phase 1: Specification (spec leads, code follows)

**File**: `specification/requirements.md`

### REQ-F-GATE-002 (lines 129-138) — Rewrite

**Old title**: *"F_D must all pass before F_P dispatch; F_D+F_P before F_H"*
**New title**: *"F_D evaluator findings escalate to F_P on edges with unresolved F_P; F_D+F_P must pass before F_H"*

New ACs:
- **AC-1**: On edges with unresolved F_P evaluators: F_D evaluator findings emit `found{kind: fd_findings}` and `fp_dispatched` in the same iteration. F_D findings included in F_P manifest via `fd_results`.
- **AC-2**: All F_D and F_P must pass before `fh_gate_pending` (unchanged)
- **AC-3**: F_P certified but F_D still failing → `found{kind: fd_gap}`, exit code 4 — construction quality problem (unchanged)
- **AC-4**: On edges without F_P evaluators: F_D failure → `found{kind: fd_gap}`, terminal (unchanged)
- **AC-5**: Fatal engine errors (context integrity, missing upstream) propagate as exceptions — not evaluator escalation

### REQ-F-CMD-002 AC-4 (line 88)

**Old**: *"On F_D failure: emits found{kind: fd_gap}, exits code 4"*
**New**: *"On F_D failure with unresolved F_P: emits found{kind: fd_findings} and fp_dispatched, writes manifest. On F_D failure without F_P or with F_P certified: emits found{kind: fd_gap}, exit code 4."*

### REQ-F-CMD-003 AC-4 (line 101)

Update auto-loop stop list: `fp_dispatched` covers the escalation case. `found{kind: fd_gap}` stops the loop (terminal gap — no escalation path available).

### REQ-F-EC-001 (line 427)

Add `fd_findings` as a kind discriminator for the `found` prime operator:

| Kind | EC role |
|------|---------|
| `fd_gap` | `happensAt` — terminal deterministic gap (no F_P path or F_P certified) |
| `fd_findings` | `happensAt` — observational, carried into F_P escalation |

---

## Phase 2: ADR

**New file**: `builds/claude_code/design/adrs/ADR-021-fd-escalates-to-fp.md`

Supersedes ADR-014. One-liner (from Codex): *"F_D runs first; unresolved deterministic deficits escalate to F_P; unresolved judgment escalates to F_H."*

Key points:
- Scoped to evaluator findings on edges with F_P — not universal
- Fatal engine errors remain fatal (context integrity, missing upstream)
- F_D-only edges unaffected
- The F_P manifest already carries `fd_results` — mechanism exists, only gate removed

---

## Phase 3: Code — claude_code build

### 3A. `builds/claude_code/code/genesis/schedule.py` iterate()

1. Move F_D event emission **before** F_P dispatch block
2. Change F_D event kind: `fd_gap` → `fd_findings` when `fp_failing` is non-empty, keep `fd_gap` when `fp_failing` is empty
3. Change line 130: `if fp_failing and not fd_failing:` → `if fp_failing:`
4. F_H gate condition unchanged: `if fh_failing and not fd_failing and not fp_failing:`

New iterate() flow:
```python
fd_failing = [ev for ev in pre.failing_evaluators if ev.category is F_D]
fp_failing = [ev for ev in pre.failing_evaluators if ev.category is F_P]
fh_failing = [ev for ev in pre.failing_evaluators if ev.category is F_H]

# Record F_D findings — kind depends on whether F_P escalation is available
if fd_failing:
    kind = "fd_findings" if fp_failing else "fd_gap"
    surface.events.append({
        "event_type": "found",
        "data": {
            "kind": kind,
            "edge": job.edge.name,
            "failing": [ev.name for ev in fd_failing],
            "delta_summary": pre.delta_summary,
        },
    })

# Dispatch F_P — escalation from F_D, not gated by F_D
if fp_failing:
    # ... emit fp_dispatched (unchanged structure)

# F_H gate — requires both F_D and F_P to pass (unchanged)
if fh_failing and not fd_failing and not fp_failing:
    # ... emit fh_gate_pending (unchanged)
```

### 3B. `builds/claude_code/code/genesis/commands.py` gen_iterate()

**Remove lines 293-313**: the `if fd_failing and fp_failing: return` early return block.

Code falls through to normal path: bind_fp → iterate → manifest creation.

### 3C. `builds/claude_code/code/genesis/commands.py` gen_start() auto-loop

Line 489: The `found` stop condition now only matches `fd_gap` (terminal), not `fd_findings` (escalation). Update:
```python
# Check for terminal fd_gap (no F_P path)
if any(e["event_type"] == "found" and e.get("data", {}).get("kind") == "fd_gap"
       for e in new_events):
    result["stopped_by"] = "fd_gap"
    return result
```

This is cleaner than the v1 approach of checking `"found" in new_types and "fp_dispatched" not in new_types` — the event kind itself carries the distinction.

---

## Phase 4: Tests — claude_code build

### 4A. `builds/claude_code/tests/test_commands.py` — TestFdGateNoManifest (lines 353-413)

Rename class to `TestFdEscalatesToFp`. Invert assertions:

| Old test | New test | Key assertion |
|----------|----------|--------------|
| `test_no_manifest_when_fd_failing` | `test_manifest_produced_when_fd_and_fp_both_failing` | `fp_manifest_path` IS in result |
| `test_no_edge_started_when_fd_blocking_fp` | `test_edge_started_emitted_when_fd_escalates` | `edge_started` IS in events |
| `test_found_emitted_when_fd_blocking_fp` | `test_fd_findings_and_fp_dispatched_both_emitted` | Both `found{kind: fd_findings}` and `fp_dispatched` in stream |
| `test_gen_start_auto_stops_at_fd_gap` | `test_auto_stops_at_fp_dispatch_with_mixed` | `stopped_by == "fp_dispatch"` |

**New tests**:
- `test_fd_gap_when_fp_certified` — F_D fails + F_P certified → `stopped_by == "fd_gap"`, event kind is `fd_gap`
- `test_fd_gap_on_fd_only_edge` — edge with only F_D evaluators, no F_P → `fd_gap` terminal

### 4B. `builds/claude_code/tests/test_integration_workflows.py`

- Line 162: `test_fd_fails_initially_no_fp_dispatch` → assert `fp_dispatched` IS in events, `found{kind: fd_findings}` also present
- Line 265: `test_auto_loop_stops_on_fd_gap_mixed_evaluators` → assert `stopped_by == "fp_dispatch"`

---

## Phase 5: Verification

```bash
cd /Users/jim/src/apps/abiogenesis
PYTHONPATH=builds/claude_code/code pytest builds/claude_code/tests/ -v
```

Verify:
1. All tests pass
2. Cold start (F_D fails + F_P unresolved): `fd_findings` + `fp_dispatched` → auto-loop stops at `fp_dispatch`
3. Construction quality (F_D fails + F_P certified): `fd_gap` → auto-loop stops at `fd_gap`
4. F_D-only edge (no F_P): `fd_gap` → terminal
5. F_H gate unchanged: requires F_D + F_P to pass

---

## Follow-up (not this change)

- Cascade to codex build (same semantics, different structure)
- GSDLC topology redesign (resumes after engine fix is verified)

---

## Decision Points for Review

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Escalation scoped to evaluator findings on edges with unresolved F_P | Codex finding #1 — prevents overcorrection on F_D-only edges or fatal errors |
| 2 | Event kind split: `fd_findings` (escalation) vs `fd_gap` (terminal) | Codex finding #2 — unambiguous audit trail |
| 3 | claude_code build first, codex cascades later | Codex finding #3 — reduces immediate scope |
| 4 | F_D + F_P certified = fd_gap preserved | Construction quality signal still needed |
| 5 | F_H gate unchanged (requires F_D + F_P pass) | Don't review broken builds |
| 6 | ADR-021 supersedes ADR-014 | Clean decision record trail |
