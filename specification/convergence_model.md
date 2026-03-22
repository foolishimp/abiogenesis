# Genesis V1 — Convergence Model

**Traces to**: INT-001 criterion 7 (spec authority)
**Status**: Approved
**Date**: 2026-03-20

This document specifies how the engine computes convergence: the delta function, gate ordering, state machine, projection algorithm, prompt contract, and hash functions. Any conformant implementation must produce equivalent convergence behaviour.

---

## 1. Delta Computation

Delta measures the fraction of failing evaluators for a job.

```
delta(job, stream, workspace_root, spec_hash, wv, carry_forward) → float

  if no evaluators: return 0.0

  source_name = job.edge.source.name  (first element if list)
  current = project(stream, source_name, "current")

  failing = 0
  for ev in job.evaluators:
    if ev.category is F_D:
      passes = run_fd_evaluator(ev, current, workspace_root)
      if not passes: failing += 1

    elif ev.category is F_H:
      if not holdsAt(operative(job.edge, wv), now): failing += 1

    elif ev.category is F_P:
      if not holdsAt(certified(job.edge, ev, spec_hash, wv), now): failing += 1

  return failing / len(job.evaluators)
```

**Range**: `[0.0, 1.0]` where 0.0 = converged, 1.0 = all failing.

**F_D evaluators** are always re-run (live checks — stateless).
**F_P and F_H evaluators** are resolved from the event stream (historical — stateful via fluent projection).

---

## 2. Gate Ordering Invariant

The engine enforces a strict gate ordering: **F_D → F_P → F_H**. Each phase must pass before the next is dispatched.

```
Evaluator State             Engine Action
────────────────────────────────────────────────
F_D failing                 → emit found{fd_gap}; STOP
                              (F_P is NOT dispatched)

F_D passing, F_P failing    → emit fp_dispatched; STOP
                              (F_H is NOT evaluated)

F_D+F_P passing, F_H failing → emit fh_gate_pending; STOP
                              (human judgment required)

All passing                 → delta = 0; converged
```

Rationale: dispatching agent work (F_P) against a broken deterministic state wastes budget. Requesting human review (F_H) of a candidate with unresolved agent work wastes attention.

---

## 3. State Machine

### 3.1 gen_start — Entry Point

```
gen_start(scope, stream, auto) → result

  state = derive_state(scope, stream)

  if state == converged:
    // methodology layer may perform cleanup (e.g. close feature vectors)
    return {status: converged}

  if state == nothing_to_do:
    return {status: nothing_to_do}

  if not auto:
    return gen_iterate(scope, stream)    // single call

  // AUTO LOOP
  for i in 1..MAX_AUTO:
    result = gen_iterate(scope, stream)
    if result == converged or nothing_to_do: return result
    inspect new events since last iteration:
      fp_dispatched  → return {stopped_by: fp_dispatch}
      fh_gate_pending → return {stopped_by: fh_gate}
      found{fd_gap}  → return {stopped_by: fd_gap}
  return {stopped_by: max_iterations}
```

**MAX_AUTO** = 50 iterations.

### 3.2 derive_state

```
derive_state(scope, stream) → {converged | nothing_to_do | in_progress}

  jobs = scoped_jobs(scope, worker)
  if no jobs: return nothing_to_do

  total_delta = sum(bind_fd(job).delta for job in jobs)
  if total_delta == 0: return converged
  return in_progress
```

### 3.3 gen_iterate — Single Iteration

```
gen_iterate(scope, stream) → result

  jobs = scoped_jobs(scope, worker)

  // Select first unconverged job in topological order
  for job in jobs:
    pre = bind_fd(job, stream, ...)
    if pre.has_gap: select this job; break

  if no gap found: return {status: converged}

  // Gate check: F_D blocks F_P
  if fd_failing AND fp_failing:
    emit found{kind: fd_gap}
    return {stopped_by: fd_gap}

  // Bind and iterate
  bound = bind_fp(pre, job, result_path)
  emit edge_started{edge, build, target}
  surface = iterate(bound)

  // Surface produces events based on gate ordering (§2)
  emit all surface events to stream

  return {status: iterated, edge, delta_before, failing, events_emitted}
```

### 3.4 gen_gaps — Full Delta Report

```
gen_gaps(scope, stream) → result

  jobs = scoped_jobs(scope, worker)
  certified = {(edge, feature) from existing edge_converged events}

  for each job:
    pre = bind_fd(job, stream, ...)
    record {edge, delta, failing, passing, delta_summary}

    // Emit certificate on fresh convergence (idempotent)
    if delta == 0 AND (edge, feature) not in certified:
      emit edge_converged{edge, target, feature, delta: 0, certified_by: "gen_gaps"}

  return {scope, jobs_considered, total_delta, converged, gaps[]}
```

---

## 4. Exit Code Semantics

| Code | Meaning | Caller action |
|------|---------|---------------|
| 0 | Converged or nothing_to_do | Loop complete |
| 1 | Error | Investigate |
| 2 | F_P actor required | Read manifest, dispatch LLM |
| 3 | F_H evaluation required | Present criteria to human |
| 4 | F_D tests still failing | Fix code, re-run |
| 5 | Auto-loop limit (MAX_AUTO) | Investigate stall |

---

## 5. Event Calculus — Fluent Evaluation

### 5.1 holdsAt(operative(edge, wv), now)

Determines whether human approval is current for a given edge.

```
Initiating events:
  approved{kind: "fh_review", edge: E}  → initiates operative(E, wv)
  approved{kind: "fh_intent", edge: E}  → initiates operative(E, wv)

Terminating events:
  revoked{kind: "fh_approval", edge: E} → terminates operative(E, wv)
  revoked{kind: "fh_approval", edge: "*"} → terminates operative(*, wv)  [wildcard]

holdsAt(operative(edge, wv), now) iff:
  ∃ approved event that initiates it AND
  ¬∃ revoked event that terminates it postdating the approval
```

### 5.2 Workflow version matching

```
When wv == "unknown":
  Accept any approved matching edge name alone (no provenance check)

When wv != "unknown":
  Condition A: event.data.workflow_version == wv (exact match)
  Condition B: edge in carry_forward AND
               event.data.workflow_version == carry_forward[edge].from_version

Revocation scoping:
  When wv != "unknown": revocation must match wv to terminate the fluent
  When wv == "unknown": revocation matches by edge alone
```

### 5.3 holdsAt(certified(edge, evaluator, spec_hash, wv), now)

Determines whether an F_P assessment is current.

```
Initiated by:
  assessed{kind: "fp", edge: E, evaluator: V, result: "pass", spec_hash: H}

Terminated by:
  spec_hash mismatch (implicit — new spec produces different hash)

holdsAt iff:
  ∃ assessed{kind: fp, edge, evaluator, result: pass}
  AND (spec_hash is null OR event.spec_hash == spec_hash)
```

---

## 6. Spec Hash Functions

Two hash functions provide snapshot identity for convergence tracking.

### 6.1 req_hash (fallback)

```
req_hash(requirements: list[string]) → string[16]

  Sort the requirements list
  JSON-encode the sorted list
  SHA-256 hash
  Return first 16 hex characters
```

Used when `workflow_version == "unknown"` (no active-workflow.json present).

### 6.2 job_evaluator_hash (primary)

```
job_evaluator_hash(job: Job) → string[16]

  For each evaluator in job.evaluators:
    line = "{name}:{category_name}:{command}:{description}"
  Sort all lines
  Normalise: collapse multiple whitespace to single space, trim each line
  Join with newlines
  SHA-256 hash
  Return first 16 hex characters
```

Used when `workflow_version != "unknown"`. Changing any evaluator field changes the hash, invalidating prior F_P assessments.

### 6.3 Selection logic

```
if workflow_version == "unknown":
  spec_hash = req_hash(package.requirements)
else:
  spec_hash = job_evaluator_hash(job)
```

---

## 7. Prompt Section Contract

The F_P prompt is assembled with a fixed section structure:

```
[INVARIANTS]
  Standing constraints on the formal system (event stream model,
  V1 scope limits, traceability requirements, module boundary)

[CURRENT STATE]
  Edge: {name}
  Source asset: {name}  (joined with " × " for product arrows)
  Target asset: {name}
  Status: {projected status from event stream}
  Edges converged: {list}

[GAP] — {N} evaluator(s) failing:
  {ev.name} ({ev.category}): {ev.description}
    F_D result: {detail}    (only for F_D evaluators with results)

[RELEVANT CONTEXT]:           (only when F_P evaluators are failing)
  --- {context.name} ---
  {content, capped per implementation}

[OUTPUT CONTRACT]
  Produce: {target.name} asset
  Satisfying markov conditions: {target.markov}
  Evaluators to pass: [{failing evaluator names}]
  Assessment output path and schema (when F_P + result_path)
```

**Assessment output schema** (written by F_P actor):
```json
{
  "edge": "{edge_name}",
  "assessments": [
    {"evaluator": "{name}", "result": "pass|fail", "evidence": "..."}
  ]
}
```

The F_P actor writes to a designated result path. The F_D skill layer reads it and emits assessed events. F_P never calls the event logger directly.

---

## 8. Asset Projection (project)

```
project(stream, asset_type, instance_id) → dict

  Initial state:
    {asset_type, instance_id, status: "not_started", edges_converged: [], event_count: 0}

  For each event in stream:
    Relevance test (any match):
      event.data.instance_id == instance_id
      event.data.feature == instance_id
      instance_id == "current" AND asset_type matches event.data.target or event.data.asset_type
      instance_id == "current" AND event_type == "edge_started" AND event.data.target == asset_type

    If relevant:
      event_count++
      edge_started    → status = "in_progress" (if was "not_started")
      edge_converged  → append edge to edges_converged; status = "converged" (if target matches)
      project_init    → state.initialized = true
```

**Invariants**:
- **Determinism**: `project(S, T, I) = project(S, T, I)` — always same result for same stream
- **Completeness**: Every prior state reconstructable
- **Isolation**: Projecting instance I never reads events of instance J

---

## 9. Context Resolution

### 9.1 Scheme dispatch

| Scheme | V1 status | Resolution |
|--------|-----------|------------|
| `workspace://` | Implemented | Filesystem path relative to workspace root |
| `git://` | Not implemented | Graceful degradation |
| `event://` | Not implemented | Graceful degradation |
| `registry://` | Not implemented | Graceful degradation |
| Unknown | — | Fatal error |

### 9.2 workspace:// resolution

```
If path resolves to a directory:
  Recursively collect: *.md, *.py, *.txt, *.yml (sorted)
  For each file: prefix with "# {relative_path}", then content
  Concatenate with newlines
  Empty directory → sentinel message

If path resolves to a file:
  Return file content

If not found:
  Return sentinel "[context not found: {path}]"
```

### 9.3 Digest verification

```
PENDING = "sha256:" + "0" × 64

If ctx.digest == PENDING: skip verification
Else: compute SHA-256 of content; mismatch → fatal error
```

### 9.4 Context selection for prompt

```
If no failing evaluators: no contexts needed
If no F_P evaluators among failing: no contexts needed
Otherwise: all edge contexts loaded (F_D and F_H don't need prompt context)
```

---

## 10. Workflow Version Resolution

```
read_workflow_version(workspace, active_workflow_path?) → string

  Discovery:
    1. If active_workflow_path set: {workspace}/{active_workflow_path}
    2. {workspace}/.ai-workspace/runtime/active-workflow.json

  File format: { "workflow": "genesis_sdlc.standard", "version": "0.3.0" }
  Success → "genesis_sdlc.standard@0.3.0"
  Any failure → "unknown"
```

### Carry-forward resolution

```
read_carry_forward(scope) → list[{edge, from_version}]

  Parse workflow_version: "{pkg}.{variant}@{version}"
  Version dir: "v" + version with dots replaced by underscores
  Path: {workflow_root}/{pkg}/{variant}/{version_dir}/manifest.json
        (workflow_root defaults to {workspace}/.genesis/workflows)
  Read: data.approved_carry_forward (must be a list)
  Any failure → []
```

---

## 11. Job Selection (Scoping)

```
scoped_jobs(scope, worker) → list[Job]

  Start with: worker.can_execute

  Feature override (scope.feature):
    Validate feature_id is known (methodology layer defines how)
    Unknown feature → empty list (fail closed)
    V1: does NOT narrow jobs (per-job feature routing is V2)

  Edge override (scope.edge):
    Filter to jobs where job.edge.name matches
    No match → empty list
```

---

## 12. Worker Scheduling

```
schedule(workers) → list[list[Worker]]

  Greedy batch partitioning:
    While workers remain:
      Start new batch with first unassigned worker
      For each remaining: add to batch if no conflict with any member
      Else: defer to next batch

  Conflict: overlapping writable_types (target asset names)

  Batch execution: batch i completes before batch i+1 starts
```

---

## 13. Edge Convergence Certification

```
Deduplication key: (edge, feature)
  where feature = scope.feature (the feature being iterated; null if unscoped)

Pre-compute certified set from existing edge_converged events (must have target field)

After bind_fd for each job:
  if delta == 0 AND (edge, feature) not in certified:
    emit edge_converged{edge, target, feature, delta: 0, certified_by: "gen_gaps"}
    add to certified set

Repeated gen_gaps calls over a converged workspace do not append duplicates.
```

---

## 14. Event Emission Invariants

All event writes must satisfy:

1. `event_time` is system-assigned at append — never caller-provided
2. `workflow_version` is injected automatically when not "unknown" (set-default — never overwrites explicit value)
3. Append-only — never modify or delete existing events
4. Corrupted lines fail visibly — never silently skipped

### Validation on prime operators

| Event type | Kind | Required fields |
|-----------|------|----------------|
| `assessed` | `fp` | `spec_hash` |
| `approved` | any | `kind` |
| `revoked` | any | `kind` |

### CLI governance (additional)

| Event type | Required fields |
|-----------|----------------|
| `approved` | `kind`, `edge`, `actor`; human-proxy also requires `proxy_log` |
| `assessed{fp}` | `kind`, `edge`, `result` ∈ {pass,fail}, `evaluator`, `spec_hash` |
| `assessed{fh_review}` | `kind`, `edge`, `result` = reject, `actor`, `reason` |
| `revoked` | `kind`, `edge`, `actor`, `reason` |
