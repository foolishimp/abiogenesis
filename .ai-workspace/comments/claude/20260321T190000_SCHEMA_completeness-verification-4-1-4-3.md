# SCHEMA: Completeness Verification — Tasks 4.1, 4.2, 4.3

**Author**: Claude Code
**Date**: 2026-03-21T19:00:00Z
**Purpose**: ABG 1.0 kernel completeness verification against Codex's 7 criteria
**For**: all

---

## Task 4.1 — Constitutional Type Census

Every type defined in `gtl/core.py` is listed below with its usage status across the four runtime modules (`core.py`, `schedule.py`, `bind.py`, `commands.py`) plus `manifest.py`.

| GTL Type | Imported by runtime? | Exercised in runtime logic? | Notes |
|----------|---------------------|----------------------------|-------|
| **F_D** | schedule, bind, commands | Yes — evaluator dispatch, category checks | Core discriminator |
| **F_P** | schedule, bind, commands | Yes — evaluator dispatch, assessment matching | Core discriminator |
| **F_H** | schedule, bind | Yes — `bind_fh()` Event Calculus evaluation | Core discriminator |
| **Consensus** | Never imported | **NOT EXERCISED** | Constructed inside Package definitions (spec files), validated at `Rule.__post_init__`. The kernel never inspects `Rule.approve.n/m` at runtime — no quorum logic exists. |
| **Operative** | Never imported | **NOT EXERCISED** | Declared on Assets in spec files. The kernel never reads `Asset.operative` to gate any decision. |
| **Context** | core, bind | Yes — `ContextResolver.load()`, digest verification, `select_relevant_contexts()` | Fully exercised |
| **Rule** | Never imported | **NOT EXERCISED** | Carried on Edges but the kernel never reads `Edge.rule` to enforce governance. `Package._validate()` and `to_mermaid()` reference it for display only. |
| **Operator** | Never imported | **NOT EXERCISED** | Carried on Edges via `edge.using`. The kernel never dispatches by Operator URI — `Evaluator.command` is the actual dispatch mechanism. |
| **Asset** | Never imported by runtime | **PARTIALLY EXERCISED** | `Asset.name` is used for write-territory conflict detection (`Worker.writable_types`). `Asset.markov` appears in prompt text only. `Asset.lineage`, `Asset.operative`, `Asset.governing_snapshots` are never read. |
| **Edge** | Never imported directly | **PARTIALLY EXERCISED** | Accessed via `Job.edge`. `Edge.name`, `Edge.source`, `Edge.target`, `Edge.context`, `Edge.co_evolve` are read. `Edge.confirm` and `Edge.rule` are never evaluated. |
| **Evaluator** | schedule, bind, manifest | Yes — category dispatch, `run_fd_evaluator()`, failing/passing partitioning | Fully exercised |
| **Job** | schedule, bind, commands, manifest | Yes — central unit of work, `Job.evaluators` enforced non-empty | Fully exercised |
| **Worker** | schedule, commands | Yes — `can_execute`, `writable_types`, `conflicts_with()`, `schedule()` | Fully exercised |
| **WorkingSurface** | schedule | Yes — constructed by `iterate()`, events and artifacts populated | Exercised; `context_consumed` populated but never read downstream |
| **Overlay** | Never imported | **NOT EXERCISED** | Defined in `gtl/core.py`, used in `Package.to_mermaid()` for rendering. Never activated at runtime — no overlay application logic exists. |
| **PackageSnapshot** | Never imported directly | **PARTIALLY EXERCISED** | The `_active_snapshot_id` mechanism in `core.py` is activated by `init_snapshot()` called from `__main__.py:630` at engine startup. Work events carry `package_snapshot_id` via `emit()`. However, `PackageSnapshot` as a GTL type is not instantiated — the snapshot ID is computed as a string (`snap-{name}-{wv}`) without constructing the type. `PackageSnapshot.to_dict()` and `work_binding()` are not called. |
| **IterateProtocol** | Never imported | **NOT EXERCISED** | Protocol class declaring the constitutional contract. `schedule.iterate()` satisfies its signature but does not formally implement or register against it. |

### Summary

- **Fully exercised** (7): F_D, F_P, F_H, Context, Evaluator, Job, Worker
- **Partially exercised** (4): Asset, Edge, WorkingSurface, PackageSnapshot
- **Not exercised** (4): Consensus, Operative, Rule, Operator, Overlay, IterateProtocol

The unexercised types fall into two categories:
1. **Governance types** (Consensus, Rule, Operative, Overlay) — the kernel defines them but has no quorum evaluation, no rule enforcement, and no overlay activation logic. These are V2 concerns per the code comments.
2. **Provenance types** (PackageSnapshot, IterateProtocol) — PackageSnapshot has partial plumbing (`_active_snapshot_id`, `_WORK_EVENT_TYPES`) but the activation path is never called. IterateProtocol is a typing declaration with no runtime binding.

---

## Task 4.2 — Seven Completeness Criteria Assessment

### Criterion 1: Every concept modeled — all constitutional types present in code

**Assessment: SATISFIED**

All 15 constitutional types from the GTL ontology are present as dataclasses/classes in `gtl/core.py`. The type definitions include validation (`__post_init__` checks), documented invariants, and correct field typing. No type from the bootloader specification is missing from the code.

### Criterion 2: Every legal transition explicit — all state machine transitions covered

**Assessment: PARTIAL**

Legal transitions that ARE explicit:
- `edge_started` — emitted by `gen_iterate` before `iterate()` call
- `fp_dispatched` — emitted by `iterate()` when F_P evaluators are failing and F_D passes
- `fh_gate_pending` — emitted by `iterate()` when F_H evaluators are failing and F_D+F_P pass
- `found{kind: fd_gap}` — emitted by `iterate()` when F_D evaluators fail
- `edge_converged` — emitted by `gen_gaps` when delta=0 for a job
- `assessed{kind: fp}` — consumed by `bind_fd`/`delta` but emitted externally (via CLI `emit-event`)
- `approved{kind: fh_review|fh_intent}` — consumed by `bind_fh` but emitted externally
- `revoked{kind: fh_approval}` — consumed by `bind_fh` but emitted externally

GAP: The `Edge.confirm` field ("question", "markov", "hypothesis") is validated at construction but never consulted at runtime. The kernel treats all edges identically regardless of confirmation mode. This is a modeled-but-not-enforced transition property.

GAP: `Operator.uri` dispatch is never executed. The edge `using` list is carried but operators are not invoked — `Evaluator.command` is the actual execution path. The relationship between Operators and Evaluators is implicit.

### Criterion 3: Every illegal transition forbidden — invalid transitions rejected

**Assessment: PARTIAL**

Forbidden transitions that ARE enforced:
- `Job` with empty evaluators raises `ValueError` at construction
- `Worker` with empty `can_execute` raises `ValueError` at construction
- `emit()` before `workspace_bootstrap()` raises `RuntimeError`
- `emit("assessed", {kind: "fp"})` without `spec_hash` raises `ValueError`
- `emit("approved"|"revoked")` without `kind` raises `ValueError`
- `Package._validate()` rejects edges referencing undeclared operators
- `Edge` with invalid `confirm` value raises `ValueError`
- `Context` with invalid scheme or digest format raises `ValueError`
- `bind_fp()` with missing contexts raises `FileNotFoundError`
- `ContextResolver` with digest mismatch raises `ValueError` (replay integrity)
- F_D timeout enforcement (`FD_TIMEOUT_SECONDS`) prevents unbounded evaluator execution

GAP: No transition ordering enforcement beyond the F_D > F_P > F_H gate sequence in `iterate()`. There is nothing preventing `edge_converged` from being emitted before `edge_started` via direct `stream.append()` calls (though the runtime code path does not do this). The event stream has no schema-level transition validation.

GAP: `Worker.conflicts_with()` is defined and `schedule()` partitions correctly, but no runtime path actually calls `schedule()` — `gen_start` processes one worker sequentially. Write-territory violations are structurally impossible in V1 (single worker) but not enforced.

### Criterion 4: Every terminal distinguishable — terminal states clearly identifiable

**Assessment: SATISFIED**

Terminal states are distinguishable:
- `gen_start` returns `status: "converged"` when all jobs have delta=0
- `gen_start` returns `status: "nothing_to_do"` when no jobs are in scope
- `gen_iterate` returns `status: "converged"` when no unconverged job exists
- `gen_iterate` returns `status: "pending"` when F_P dispatch is in flight
- `gen_start --auto` terminates on: `converged`, `nothing_to_do`, `pending`, `fp_dispatch`, `fh_gate`, `fd_gap`, or `max_iterations`
- `delta()` returns `0.0` for convergence, `> 0.0` for work needed

Each terminal is distinguishable by its `status` and/or `stopped_by` field. The auto-loop has a hard ceiling (`MAX_AUTO = 50`) preventing unbounded iteration.

### Criterion 5: Every decision has evidence — all decisions traceable to events

**Assessment: PARTIAL**

Decisions WITH evidence:
- F_D evaluation: `run_fd_evaluator()` returns `(passes, detail)` with stdout/stderr/returncode
- F_P assessment: `assessed{kind: fp}` events carry `result`, `evidence`, `spec_hash`
- F_H approval: `approved{kind: fh_review}` events carry `edge`, `workflow_version`, `actor`
- F_H revocation: `revoked{kind: fh_approval}` events carry `edge`, `workflow_version`
- Convergence: `edge_converged` events carry `edge`, `target`, `delta`, `certified_by`
- Pending dispatch: `fp_dispatched` events carry `manifest_id`, `edge`, `failing_evaluators`

GAP: `WorkingSurface.context_consumed` is populated by `iterate()` but never persisted to the event stream. The provenance of which contexts were actually used in an iteration is lost. This breaks the "exact historical replay under the same law" requirement stated in the `WorkingSurface` docstring.

GAP: `_derive_state()` computes total delta but does not emit any event. The decision of "converged vs in_progress" has no event-stream evidence — it is computed ephemerally.

### Criterion 6: Every event = state change — no events without corresponding state changes

**Assessment: SATISFIED**

Every event type emitted by the kernel corresponds to a state change observable via `project()`:
- `edge_started` transitions status from `not_started` to `in_progress`
- `edge_converged` transitions status to `converged` and appends to `edges_converged`
- `project_initialized` sets `initialized: True`
- `fp_dispatched` creates a pending fluent (tracked by `_find_pending_dispatch`)
- `assessed` terminates the pending fluent
- `approved`/`revoked` initiate/terminate the `operative(edge, wv)` fluent in `bind_fh`

No event is emitted purely for logging — each drives a downstream state derivation. The `found{kind: fd_gap}` event is consumed by the auto-loop to determine stop condition, which is itself a state change in the workflow state machine.

### Criterion 7: Every path traceable from constraint to outcome — full traceability chain

**Assessment: PARTIAL**

Traceability that EXISTS:
- `spec_hash` on `assessed` events links F_P certification to the constraint surface
- `job_evaluator_hash()` creates a composite hash of evaluator definitions + context digests
- `PackageSnapshot` carrier enforcement in `emit()` tags work events with `package_snapshot_id`
- `ContextResolver` verifies digest integrity — changed constraints invalidate prior certifications
- `workflow_version` on approvals enables carry-forward provenance across graph evolution

GAPS:
- ~~`init_snapshot()` is never called~~ **CORRECTED**: `init_snapshot()` IS called at `__main__.py:630` with `snapshot_id = f"snap-{package.name}-{scope.workflow_version}"`. Work events carry `package_snapshot_id` via `emit()`. However, the `PackageSnapshot` GTL type itself is not instantiated — the ID is a computed string, not a proper type instance.
- `WorkingSurface.context_consumed` is populated but not persisted — the constraint-to-outcome chain is broken at the "which contexts were loaded" step.
- `Asset.lineage` is defined but never populated — there is no mechanism to trace which upstream assets contributed to a downstream asset.
- `Edge.rule` governance (Consensus quorum) is never evaluated — the approval path is a simple boolean (`bind_fh` returns True/False), not a `n/m` quorum check.

---

## Task 4.3 — State Machine Verification

### State Machine 1: Iterator (`schedule.py` `iterate()`)

```
Entry: BoundJob received
  ├─ F_D failing? → emit found{kind: fd_gap} → EXIT
  ├─ F_P failing (F_D pass)? → emit fp_dispatched → call on_fp_dispatch → EXIT
  ├─ F_H failing (F_D+F_P pass)? → emit fh_gate_pending → EXIT
  └─ All pass? → EXIT (empty surface)
Return: WorkingSurface
```

**Transitions are total**: Every combination of failing evaluator categories produces exactly one path. The F_D > F_P > F_H ordering is enforced by the conditional chain (`fd_failing`, `fp_failing and not fd_failing`, `fh_failing and not fd_failing and not fp_failing`).

**Well-governed**: Yes. The gate sequence prevents F_P dispatch against broken F_D state (REQ-F-GATE-002). The function does not call `emit()` — it returns a `WorkingSurface` and the caller decides what to persist.

**Issue**: The function computes `fd_failing` twice (lines 126 and 158). The second computation is redundant but harmless — both produce the same list from the same `pre.failing_evaluators`.

### State Machine 2: Workflow (`commands.py` `gen_start` auto loop)

```
Entry: Scope + EventStream
  ├─ _derive_state() = "converged" → close features → RETURN converged
  ├─ _derive_state() = "nothing_to_do" → RETURN nothing_to_do
  └─ _derive_state() = "in_progress" →
       ├─ auto=False → gen_iterate() once → RETURN
       └─ auto=True → LOOP (max 50):
            gen_iterate() →
              ├─ status ∈ {converged, nothing_to_do, pending} → RETURN
              ├─ new events contain fp_dispatched → RETURN stopped_by=fp_dispatch
              ├─ new events contain fh_gate_pending → RETURN stopped_by=fh_gate
              ├─ new events contain found → RETURN stopped_by=fd_gap
              └─ none of above → CONTINUE (next iteration)
            After 50 → RETURN stopped_by=max_iterations
```

**Transitions are total**: Every `gen_iterate()` result maps to a defined outcome. The auto-loop has five exit conditions plus the ceiling.

**Well-governed**: Yes. The loop reads new events after each iteration to detect stop conditions. The `MAX_AUTO = 50` ceiling prevents unbounded execution.

**Issue — potential infinite non-progress**: If `gen_iterate()` returns `status: "iterated"` but emits no events of the stop-condition types (fp_dispatched, fh_gate_pending, found), the loop continues. This could happen if `iterate()` produces a `WorkingSurface` with empty events (all evaluators pass at iterate-time but `_derive_state` still shows delta > 0 due to eventual consistency). In practice this would hit the MAX_AUTO ceiling, but the loop would waste 50 cycles before stopping.

### State Machine 3: Manifest lifecycle (fp_dispatched -> assessed -> converged)

```
fp_dispatched{manifest_id: M, edge: E}
  ├─ PENDING — _find_pending_dispatch() returns M
  │    └─ gen_iterate() returns status: "pending" (no duplicate dispatch)
  │
  assessed{manifest_id: M, kind: fp, result: pass|fail}
  ├─ result=pass → F_P evaluator certified (holdsAt in delta/bind_fd)
  │    └─ Next gen_gaps/gen_iterate finds delta=0 for that evaluator
  ├─ result=fail → F_P evaluator still failing
  │    └─ Next gen_iterate re-dispatches (new manifest_id)
  │
  edge_converged{edge: E, target: T, delta: 0}
  └─ TERMINAL — certified in event stream, deduplication prevents re-emission
```

**Transitions are total**: The `_find_pending_dispatch()` function uses Event Calculus semantics — `fp_dispatched` initiates pending, `assessed` terminates it. Any manifest_id is either pending or resolved.

**Well-governed**: Yes, with one caveat.

**Issue — no timeout on pending dispatch**: If `fp_dispatched` is emitted but the F_P actor never responds (crash, network failure, abandoned session), the pending fluent persists indefinitely. `gen_iterate()` will return `status: "pending"` forever for that edge. There is no stale-dispatch detection or timeout mechanism. The only recovery is manual event emission (`assessed{manifest_id: M, result: fail}`).

**Issue — assessed events are emitted externally**: The `assessed` event is written by the CLI `emit-event` command (in `__main__.py`), not by the kernel runtime. The kernel validates `spec_hash` presence in `emit()` but does not validate that the `manifest_id` in the `assessed` event actually corresponds to a prior `fp_dispatched` event. A malformed `assessed` event with a fabricated `manifest_id` would be accepted.

---

## Summary of Findings

### Strengths
1. The kernel's four-function architecture (emit, project, bind, iterate) is clean and well-separated.
2. F_D > F_P > F_H gate ordering is correctly enforced.
3. Event Calculus semantics for fluents (approved/revoked, dispatched/assessed) are correctly implemented.
4. Fail-closed behavior is consistent: missing worker, unknown feature, empty evaluators, missing contexts all produce errors rather than silent degradation.
5. The event stream is append-only with system-assigned timestamps — the constitutional invariant holds.

### Gaps Requiring Attention for 1.0

| Priority | Gap | Impact |
|----------|-----|--------|
| ~~High~~ | ~~`PackageSnapshot` activation path (`init_snapshot()`) never called~~ | **CORRECTED**: `init_snapshot()` IS called at `__main__.py:630`. Work events carry `package_snapshot_id`. |
| **High** | `WorkingSurface.context_consumed` populated but never persisted | Breaks replay-under-same-law requirement |
| **Medium** | Pending F_P dispatch has no timeout/staleness detection | Can block an edge indefinitely |
| **Medium** | `assessed` event `manifest_id` not validated against prior `fp_dispatched` | Accepts fabricated assessments |
| **Low** | 5 governance types (Consensus, Rule, Operative, Overlay, PackageSnapshot) defined but not runtime-exercised | Acceptable for V1 per code comments; should be documented as V2 scope |
| **Low** | `Edge.confirm` validated but never evaluated | Modeled concept with no runtime effect |
| **Low** | `Asset.lineage` never populated | No upstream-to-downstream traceability |

### Verdict

The kernel is **structurally complete** for a V1 single-worker, single-trajectory system. The four-primitive architecture is faithfully implemented. The primary gaps are in provenance depth (PackageSnapshot, context consumption, asset lineage) and governance enforcement (Consensus quorum, Rule policies). These are documented as V2 scope in the codebase and do not block V1 correctness, but they should be explicitly scoped out in the 1.0 release notes to set expectations.
