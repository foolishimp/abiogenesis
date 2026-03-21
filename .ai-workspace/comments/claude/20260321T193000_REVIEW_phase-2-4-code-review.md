# REVIEW: Phase 2 + Phase 4 Code Review — Kernel Hardening and Completeness

**Author**: Claude Code
**Date**: 2026-03-21T19:30:00Z
**Addresses**: Tasks 2.1 (EC3), 2.2a+b (EC1), 2.3 (A1), 4.4, 4.5 from the ABG 1.0 MVP definitive task plan
**For**: all

## Summary

Exhaustive code review of all Phase 2 (kernel hardening) and Phase 4 (completeness verification) code changes. One critical structural finding: engine and build copies have diverged into two separate development lines. Individual changes are correct. 344 tests pass against the engine copies.

---

## Finding 1: ENGINE/BUILD DIVERGENCE — Critical

**Severity**: Critical — blocks release
**Type**: Structural integrity

`.genesis/genesis/` (engine source) and `builds/claude_code/code/genesis/` (build-layer copy) are **two separate forks** with non-overlapping changes.

| File | Engine (`.genesis/`) | Build (`builds/claude_code/code/`) |
|------|---------------------|-----------------------------------|
| `bind.py` | Has EC3 (context digest in `job_evaluator_hash`). Missing F_P revocation support. | Has F_P revocation (`bind_fp_certified`, `REQ-F-EC-004`). Missing EC3. |
| `core.py` | Has A1 (`init_snapshot`, `_WORK_EVENT_TYPES`, carrier enforcement in `emit()`). | Missing A1 entirely. |
| `commands.py` | Has EC1 (`manifest_id`, `_find_pending_dispatch()`, pending status). | Missing EC1 entirely. |
| `schedule.py` | Has `manifest_id` propagation in `fp_dispatched` event data. | Missing propagation. |
| `manifest.py` | Has `manifest_id: str = ""` field on `BoundJob`. | Missing field. |
| `__main__.py` | Has `init_snapshot()` call at line 630. Missing revocation kind validation. | Has revocation kind validation for `emit-event` CLI. Missing `init_snapshot()`. |
| `gtl/core.py` | Has unreachable asset warning (4.4). | Has unreachable asset warning (4.4). **In sync.** |

**Root cause**: Three Phase 2 agents applied changes to `.genesis/genesis/` (the engine). Codex's development pass applied revocation support to `builds/claude_code/code/genesis/`. Neither was propagated to the other.

**Impact**: Tests pass because `PYTHONPATH=.genesis` resolves imports to the engine copies. But the build copies are what get installed to dependents via cascade. A cascade install from this state would ship the build copies — which lack EC3, EC1, and A1.

**Required action**: Reconcile before any release. Options:
1. Engine is canonical — propagate all engine changes to build, merge Codex's revocation support into engine
2. Build is canonical — propagate all build changes to engine, add Phase 2 changes to build
3. Eliminate duplication — single source of truth with symlinks or build step

---

## Finding 2: EC3 — Context Digest in spec_hash — CORRECT

**File**: `.genesis/genesis/bind.py:48-71`
**Task**: 2.1

```python
ctx_lines = sorted(
    f"ctx:{ctx.name}:{ctx.digest}"
    for ctx in (job.edge.context or [])
)
raw = "\n".join(re.sub(r'\s+', ' ', line.strip()) for line in lines + ctx_lines)
```

**Assessment**: Correct.
- Sorted context lines ensure deterministic hash regardless of context declaration order
- `or []` guards against `None` context — backward-compatible with edges that have no context
- Whitespace normalization (`re.sub(r'\s+', ' ', ...)`) applied uniformly to evaluator and context lines
- Empty context list = empty `ctx_lines` = hash identical to pre-change behavior
- Truncation to 16 hex chars (`[:16]`) consistent with prior `req_hash` convention

**The fix addresses EC3 correctly**: changing a context document's content changes its `sha256` digest, which changes the `ctx:{name}:{digest}` line, which changes the hash, which invalidates all `assessed{kind: fp, result: pass, spec_hash: H}` events for edges binding that context.

---

## Finding 3: EC1 — Manifest ID + Pending Fluent — CORRECT

**Files**: `.genesis/genesis/commands.py:286-503`, `manifest.py:63`, `schedule.py:131-140`
**Tasks**: 2.2a, 2.2b

### 2.2a: manifest_id schema

- `manifest_id = f"{edge_slug}_{ts}"` at `commands.py:289` — unique per dispatch, deterministic from existing variables
- `BoundJob.manifest_id: str = ""` at `manifest.py:63` — carrier field, empty string default preserves backward compatibility
- `bound.manifest_id = manifest_id` at `commands.py:311` — set after `bind_fp()` returns
- `"manifest_id": manifest_id` at `commands.py:342` — included in manifest JSON written to disk
- `schedule.py:136-137` — conditional inclusion in `fp_dispatched` event data: `if bound_job.manifest_id:` guard prevents empty strings in event payload

### 2.2b: pending fluent

`_find_pending_dispatch()` at `commands.py:465-503`:
- Event Calculus semantics: `fp_dispatched{manifest_id: M}` initiates, `assessed{manifest_id: M}` terminates
- Two-pass scan: first collect all dispatched manifest_ids for the edge, then remove any with matching assessed events
- Returns first remaining pending ID, or `None`

Pending check at `commands.py:294-299`:
- Checked BEFORE manifest creation — no wasted file I/O
- Returns `{"status": "pending", "pending_manifest_id": ..., "edge": ...}` — terminal status, no dispatch

Auto-loop halt at `commands.py:406`:
- `"pending"` added to halt conditions — prevents infinite re-attempts against in-flight dispatch

**Minor note**: `next(iter(dispatched_ids))` on a `set` is non-deterministic ordering. If multiple dispatches are somehow pending for the same edge (shouldn't happen in practice — each dispatch replaces the prior), the returned `manifest_id` is arbitrary. Not a bug — the important thing is that ANY pending dispatch blocks re-dispatch — but worth noting for future debugging.

---

## Finding 4: A1 — PackageSnapshot Carrier Enforcement — CORRECT

**Files**: `.genesis/genesis/core.py:105-163`, `__main__.py:627-630`
**Task**: 2.3

### Module-level state (`core.py`)

```python
_active_snapshot_id: Optional[str] = None

_WORK_EVENT_TYPES = frozenset({
    "edge_started", "edge_converged", "assessed", "approved", "revoked",
})
```

- `frozenset` is correct — immutable, O(1) lookup
- The five work event types match the bootloader's definition of events that carry constitutional binding
- `_active_snapshot_id` follows the same module-level pattern as `_stream`

### Injection (`core.py:159-162`)

```python
if event_type in _WORK_EVENT_TYPES and _active_snapshot_id is not None:
    data.setdefault("package_snapshot_id", _active_snapshot_id)
```

- `data.setdefault()` — does not overwrite if caller already set it. Good defensive pattern — allows tests or special cases to provide explicit snapshot IDs
- Double guard: event type check AND snapshot initialized. Non-work events (trace events like `found`, `fp_dispatched`) are untouched
- Injection happens BEFORE `_stream.append()` — the snapshot ID is part of the persisted record

### Activation (`__main__.py:627-630`)

```python
from .core import init_snapshot
snapshot_id = f"snap-{package.name}-{scope.workflow_version}"
init_snapshot(snapshot_id)
```

- Runs after Scope construction (which reads `workflow_version`) and before any command dispatch
- Deterministic: same package + workflow version = same snapshot ID
- Format `snap-abiogenesis-genesis_sdlc.standard@0.5.1` is human-readable and grep-friendly

**Note**: The snapshot ID is a computed string, not a `PackageSnapshot` GTL type instance. The type's `to_dict()` and `work_binding()` methods are never called. This is sufficient for A1 (carrier enforcement) but means the full `PackageSnapshot` type remains partially exercised.

---

## Finding 5: Task 4.4 — Unreachable Asset Detection — CORRECT

**File**: `.genesis/gtl/core.py:484-506`
**Task**: 4.4

```python
targets: set[str] = set()
sources: set[str] = set()
for edge in self.edges:
    targets.add(edge.target.name)
    if isinstance(edge.source, list):
        sources.update(a.name for a in edge.source)
    else:
        sources.add(edge.source.name)

for asset in self.assets:
    if asset.name not in targets and asset.name not in sources:
        warnings.warn(...)
```

**Assessment**: Correct.
- Handles both single-source and multi-source edges (`isinstance(edge.source, list)`)
- Graph roots (source of edges but never a target) are NOT warned about — correct
- Only assets appearing in NO edge at all are flagged
- Uses `warnings.warn()` with `stacklevel=2` — warning points to the caller, not the internal method
- Runs after validation errors (which raise) — warnings are additive, not blocking
- 5 tests cover: normal graph, orphan, graph root, message content, multiple orphans

**Minor imprecision**: Comment says "no inbound edge and is not a graph root" but the actual check is broader — "appears in no edge at all." An asset that is a target-only (inbound edges but no outbound) would NOT be warned about. An asset that is source-only (graph root) would NOT be warned about. Only truly disconnected assets are caught. The behavior is correct; the comment could be more precise.

---

## Finding 6: Task 4.5 — Path Independence Tests — CORRECT

**File**: `builds/claude_code/tests/test_schedule.py` (199 new lines)
**Task**: 4.5

6 tests in `TestDeltaPathIndependence`:

| Test | Evaluators | Orderings tested | Expected delta |
|------|-----------|-----------------|---------------|
| `test_two_fp_evaluators_reversed` | 2 F_P (1 resolved) | 2 | 0.5 |
| `test_mixed_fd_fp_fh_all_failing` | F_D + F_P + F_H (all failing) | 6 (all permutations) | 1.0 |
| `test_mixed_fd_fp_fh_partial_convergence` | F_D + F_P + F_H (F_P resolved) | 4 | 2/3 |
| `test_mixed_with_fh_approved` | F_D + F_P + F_H (F_P + F_H resolved) | 3 | 1/3 |
| `test_all_converged_any_order` | F_P + F_H (both resolved) | 2 | 0.0 |
| `test_multiple_fp_evaluators_shuffled` | 4 F_P (2 resolved) | 24 (exhaustive) | 0.5 |

**Assessment**: Thorough. The exhaustive 24-permutation test on 4 evaluators is the strongest proof — if ordering mattered, at least one permutation would diverge. Delta values are exact fractions, validated with `abs(d - expected) < 1e-9` for float comparisons.

---

## Finding 7: Codex Build-Layer Development — Unmerged

**Files**: `builds/claude_code/code/genesis/bind.py`, `builds/claude_code/code/genesis/__main__.py`
**Not part of Phase 2/4 — pre-existing changes from Codex development pass**

The build-layer `bind.py` contains `bind_fp_certified()` — a full F_P revocation implementation with Event Calculus semantics symmetric to `bind_fh()`. This is referenced by `REQ-F-EC-004` and tested by:
- `test_bind.py`: 10 tests for F_P revocation (symmetric initiation/termination, wildcard, cross-version scoping)
- `test_integration_workflows.py`: 3 tests for revocation cascade through `gen_gaps`

The build-layer `__main__.py` validates `revoked` event `kind` field at the CLI layer (must be `fh_approval` or `fp_assessment`).

**Assessment**: This is legitimate work that should be reviewed and merged into the engine. It implements the symmetric revocation principle (F_P certifications can be explicitly revoked, not just implicitly invalidated by spec_hash change). However, it currently only exists in the build copy and is not exercised by the engine.

---

## Recommended Action

1. **Resolve engine/build divergence** (Critical, blocks release):
   - Determine canonical source (recommendation: engine at `.genesis/genesis/`)
   - Merge Codex's revocation support (`bind_fp_certified`, CLI validation) into engine
   - Propagate all Phase 2 changes (EC3, EC1, A1) into build copies
   - Consider eliminating duplication long-term

2. **Backfill requirements** for shipped changes:
   - EC3: needs a REQ key for context-aware certification invalidation
   - EC1: needs a REQ key for pending dispatch detection
   - A1: needs a REQ key for PackageSnapshot carrier enforcement
   - 4.4: needs a REQ key for unreachable asset detection
   - 4.5: path-independence is already a bootloader invariant (§XI) — link to existing REQ

3. **Address completeness verification gaps** (from Task 4.2):
   - `context_consumed` not persisted — decide if this is V1 or V2
   - Pending dispatch has no timeout — `stale_after_ms` was in the plan but not implemented
   - `assessed` manifest_id not cross-validated — add validation in `emit()` or accept as V2

4. **Run tests against BOTH paths** to catch divergence:
   ```bash
   PYTHONPATH=.genesis python -m pytest builds/claude_code/tests/ -x -q
   PYTHONPATH=builds/claude_code/code python -m pytest builds/claude_code/tests/ -x -q
   ```
