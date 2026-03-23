# STRATEGY v3: Fix ABG Engine Escalation — F_D Findings Escalate to F_P

**Author**: Claude
**Date**: 2026-03-23T12:00:00+11:00
**For**: Jim + Codex review
**Supersedes**: v1 + v2
**Incorporates**: Codex findings from v1 review + v2 review

---

## Problem

The engine treats F_D evaluator failure as a gate that **blocks** F_P dispatch (REQ-F-GATE-002, ADR-014, commits `40d1209` + `3ee4e7e` from 2026-03-16). The correct law: on edges with unresolved F_P evaluators, F_D evaluator findings escalate to F_P as problem surface.

**Scope**: Evaluator findings on edges that have unresolved F_P evaluators — not engine/runtime failures, not F_D-only edges.

**Fatal errors** that halt the engine (exceptions, not evaluator escalation):
- Context integrity violations (digest mismatch — REQ-F-BIND-001)
- Malformed runtime/config state (missing genesis.yml, invalid JSON)
- Impossible command/runtime failures (import errors, permission denied)

These already propagate as exceptions before reaching iterate(). Missing upstream artifacts (e.g., no `code/` directory on cold start) are **not** fatal — they are ordinary unconverged graph state that F_D reports and F_P addresses.

---

## Current Gate Sites (claude_code build — primary scope)

| File | Line | Gate |
|------|------|------|
| `schedule.py` | 130 | `if fp_failing and not fd_failing:` — F_P only when F_D clean |
| `commands.py` | 299 | `if fd_failing and fp_failing: return` — early return, no manifest |

Codex build cascade is a follow-up.

---

## What Already Works (no changes needed)

- `bind_fd()` computes ALL evaluator status unconditionally (F_D, F_P, F_H)
- F_P manifest JSON already includes `fd_results` (commands.py:407)
- `_assemble_prompt()` already includes F_D findings in the GAP section
- `bind_fp()` does NOT check F_D status — only checks for missing contexts
- F_D re-runs every iterate() call (stateless, live execution)
- **Pending dispatch detection** at commands.py:319 — `_find_pending_dispatch()` returns `status: "pending"` when an fp_dispatched event exists without a matching assessed event

---

## Event Kind Split

Split `found{kind: fd_gap}` into two distinct event kinds:

| Event kind | Meaning | When emitted |
|-----------|---------|-------------|
| `found{kind: fd_findings}` | F_D evaluator findings, escalating to F_P | Same iteration as `fp_dispatched` — observational record carried into escalation |
| `found{kind: fd_gap}` | Terminal F_D gap — no F_P on this edge, or F_P certified but F_D still red | Auto-loop stop condition |

---

## New Escalation Model

Three paths depending on F_P state:

### Path 1: F_D fails + F_P unresolved + no pending dispatch
```
F_D runs → found{kind: fd_findings}
  → fp_dispatched (manifest written with fd_results)
    → auto-loop stops at fp_dispatch
      → F_P actor addresses findings
        → next iterate() re-runs F_D to certify
```

### Path 2: F_D fails + F_P unresolved + dispatch already in flight
```
F_D runs → found{kind: fd_findings}
  → _find_pending_dispatch() returns manifest_id
    → return status: "pending" (no duplicate dispatch)
```
Existing path at commands.py:319-329. Preserved unchanged.

### Path 3: F_D fails + F_P certified (or no F_P on edge)
```
F_D runs → found{kind: fd_gap}
  → auto-loop stops at fd_gap (construction quality / terminal)
```

**F_H gate unchanged**: requires both F_D and F_P to pass.

---

## Phase 1: Specification (spec leads, code follows)

**File**: `specification/requirements.md`

### REQ-F-GATE-002 (lines 129-138) — Rewrite

**Old title**: *"F_D must all pass before F_P dispatch; F_D+F_P before F_H"*

**New title**: *"F_D evaluator findings escalate to F_P on edges with unresolved F_P; F_D+F_P must pass before F_H"*

New ACs:
- **AC-1**: On edges with unresolved F_P evaluators and no pending dispatch: F_D evaluator findings emit `found{kind: fd_findings}` and `fp_dispatched` in the same iteration. F_D findings included in F_P manifest via `fd_results`.
- **AC-2**: On edges with unresolved F_P evaluators and an existing pending dispatch: return `status: "pending"` without duplicate dispatch (unchanged behavior from `_find_pending_dispatch()`).
- **AC-3**: All F_D and F_P must pass before `fh_gate_pending` (unchanged).
- **AC-4**: F_P certified but F_D still failing → `found{kind: fd_gap}`, exit code 4 — construction quality problem (unchanged).
- **AC-5**: On edges without F_P evaluators: F_D failure → `found{kind: fd_gap}`, terminal (unchanged).
- **AC-6**: Fatal engine errors (context integrity, malformed config, runtime failures) propagate as exceptions — not evaluator escalation.

### REQ-F-CMD-002 AC-4 (line 88)

**New**: *"On F_D failure with unresolved F_P and no pending dispatch: emits found{kind: fd_findings} and fp_dispatched, writes manifest. On F_D failure with pending dispatch: returns pending. On F_D failure without F_P or with F_P certified: emits found{kind: fd_gap}, exit code 4."*

### REQ-F-CMD-003 AC-4 (line 101)

Update auto-loop stop list: `fp_dispatched` covers escalation. `found{kind: fd_gap}` stops the loop (terminal). `pending` stops the loop (dispatch in flight).

### REQ-F-EC-001 (line 427)

Add `fd_findings` as a kind discriminator for the `found` prime operator:

| Kind | EC role |
|------|---------|
| `fd_gap` | `happensAt` — terminal deterministic gap |
| `fd_findings` | `happensAt` — observational, carried into F_P escalation |

---

## Phase 2: ADR

**New file**: `builds/claude_code/design/adrs/ADR-021-fd-escalates-to-fp.md`

**Status**: Accepted (supersedes ADR-014)

**One-liner** (from Codex): *"F_D runs first; unresolved deterministic deficits escalate to F_P; unresolved judgment escalates to F_H."*

**Decision**:

1. F_D is first-pass capability. It resolves what deterministic machinery can resolve cheaply and safely.

2. F_D evaluator failure on edges with unresolved F_P is an escalation trigger, not a stop condition. Deterministic findings describe the problem surface to F_P.

3. F_P is the constructive layer. It may build, repair, synthesize, and review where deterministic capability is insufficient.

4. F_H is the judgment layer. It handles policy, tradeoffs, acceptance, and ambiguity that remains after F_P.

5. Only fatal engine/runtime failures halt escalation. Fatal means: context integrity violations, malformed runtime/config state, impossible command/runtime failures. Missing upstream artifacts (e.g., no `code/` on cold start) are ordinary unconverged state — not fatal.

**What this replaces**: ADR-014's rule that "F_P is invoked only when F_D is exhausted" is wrong for the capability model. F_D may be insufficient even when it can execute. F_P's value is discovery, repair, synthesis, and navigation of ambiguity — not post-processing of already-valid state.

**What is preserved**: F_H still requires both F_D and F_P to pass. The pending dispatch deduplication path is unchanged. The construction quality signal (F_D fails after F_P certified) is preserved as `fd_gap`.

---

## Phase 3: Code — claude_code build

### 3A. `builds/claude_code/code/genesis/schedule.py` iterate()

1. Move F_D event emission **before** F_P dispatch block
2. F_D event kind: `fd_findings` when `fp_failing` is non-empty, `fd_gap` when `fp_failing` is empty
3. Change line 130: `if fp_failing and not fd_failing:` → `if fp_failing:`
4. F_H gate condition unchanged

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

Code falls through to:
- Line 319: pending dispatch check (`_find_pending_dispatch()`) — **preserved unchanged**
- Line 338: `bind_fp()` → iterate() → manifest creation

### 3C. `builds/claude_code/code/genesis/commands.py` gen_start() auto-loop

Line 489: Replace broad `found` check with kind-specific check:
```python
if any(e["event_type"] == "found" and e.get("data", {}).get("kind") == "fd_gap"
       for e in new_events):
    result["stopped_by"] = "fd_gap"
    return result
```

`fd_findings` events do NOT stop the auto-loop — they accompany `fp_dispatched` which does.

---

## Phase 4: Tests — claude_code build

### 4A. `builds/claude_code/tests/test_commands.py` — TestFdGateNoManifest (lines 353-413)

Rename to `TestFdEscalatesToFp`. Invert assertions:

| Old test | New test | Key assertion |
|----------|----------|--------------|
| `test_no_manifest_when_fd_failing` | `test_manifest_produced_when_fd_and_fp_failing` | `fp_manifest_path` IS in result |
| `test_no_edge_started_when_fd_blocking_fp` | `test_edge_started_when_fd_escalates` | `edge_started` IS in events |
| `test_found_emitted_when_fd_blocking_fp` | `test_fd_findings_and_fp_dispatched_emitted` | `found{kind: fd_findings}` AND `fp_dispatched` both in stream |
| `test_gen_start_auto_stops_at_fd_gap` | `test_auto_stops_at_fp_dispatch_with_mixed` | `stopped_by == "fp_dispatch"` |

**New tests**:
- `test_fd_gap_when_fp_certified` — F_D fails + F_P certified → event kind is `fd_gap`, `stopped_by == "fd_gap"`
- `test_fd_gap_on_fd_only_edge` — edge with only F_D, no F_P → `fd_gap` terminal
- `test_pending_preserved_when_fd_failing` — F_D fails + pending dispatch in flight → `status == "pending"`, no duplicate dispatch

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
2. Cold start (F_D fails + F_P unresolved): `fd_findings` + `fp_dispatched` → stops at `fp_dispatch`
3. Pending dispatch (F_D fails + dispatch in flight): `pending` → no duplicate
4. Construction quality (F_D fails + F_P certified): `fd_gap` → stops at `fd_gap`
5. F_D-only edge (no F_P): `fd_gap` → terminal
6. F_H gate unchanged

---

## Follow-up (not this change)

- Cascade to codex build
- GSDLC topology redesign (resumes after engine fix verified)

---

## Decision Points

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Escalation scoped to evaluator findings on edges with unresolved F_P | Prevents overcorrection on F_D-only edges or fatal errors |
| 2 | `fd_findings` vs `fd_gap` event kind split | Unambiguous audit trail |
| 3 | Pending dispatch path preserved unchanged | No duplicate dispatches |
| 4 | Fatal = context integrity, malformed config, runtime failures only | Missing artifacts are ordinary unconverged state, not fatal |
| 5 | F_H gate unchanged | Don't review broken builds |
| 6 | ADR-021 supersedes ADR-014 with precise scoping | Prevents future overcorrection |
