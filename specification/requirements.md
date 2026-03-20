# Genesis V1 — Requirements

**Derived from**: `gtl_spec/packages/abiogenesis.py` (the GTL Package IS the requirement registry)
**Traces to**: INT-001
**Status**: Approved
**Date**: 2026-03-20

These REQ keys are the traceability thread. Every design ADR, every code file, every test must tag back to these keys. The GTL Package in `abiogenesis.py` is the authoritative key registry — this document provides human-readable descriptions and acceptance criteria for each registered key.

---

## Bootstrap (REQ-F-BOOT-*)

### REQ-F-BOOT-001 — gen-install bootstraps .genesis/ into target project

`gen-install.py` copies the engine into a target project so it can run without an installed package.

**Acceptance Criteria**:
- AC-1: `gen-install --target <dir> --project-slug <slug>` creates `.genesis/genesis/` with engine modules
- AC-2: Creates `.genesis/genesis.yml` pointing to `gtl_spec/packages/<slug>:package`
- AC-3: Creates `gtl_spec/packages/<slug>.py` starter spec if absent — never overwrites existing
- AC-4: Idempotent — re-running updates engine files, preserves workspace state

### REQ-F-BOOT-002 — .genesis/genesis.yml config resolves Package/Worker

The engine reads its Package and Worker from a config file at startup.

**Acceptance Criteria**:
- AC-1: `genesis.yml` contains `package:` and `worker:` fields as Python import paths (`module:var`)
- AC-2: Missing `genesis.yml` → informative error, not a crash
- AC-3: Engine resolves Package and Worker via `importlib` from the path

---

## SDLC Graph (REQ-F-GRAPH-*)

### REQ-F-GRAPH-001 — GTL Package defines 6-asset SDLC graph

The Package declares a typed asset graph with admissible transitions.

**Acceptance Criteria**:
- AC-1: Six assets: `intent`, `requirements`, `feature_decomp`, `design`, `code`, `unit_tests`
- AC-2: Five edges: `intent→requirements`, `requirements→feature_decomp`, `feature_decomp→design`, `design→code`, `code↔unit_tests`
- AC-3: Each edge has at least one evaluator
- AC-4: The `code↔unit_tests` edge is co-evolving (`co_evolve=True`)

### REQ-F-GRAPH-002 — Asset.markov conditions are acceptance criteria

Each asset type defines its own stability conditions.

**Acceptance Criteria**:
- AC-1: `Asset.markov` is a list of named conditions (e.g., `["all_pass", "validates_tags_present"]`)
- AC-2: Markov conditions are surfaced in the F_P manifest as part of the output contract
- AC-3: An asset is stable when all markov conditions are met and all edge evaluators pass

---

## Commands (REQ-F-CMD-*)

### REQ-F-CMD-001 — gen gaps reports delta per edge

`gen-gaps` computes the convergence state of the workspace by running `bind_fd` over all jobs.

**Acceptance Criteria**:
- AC-1: Returns JSON with `total_delta`, `converged`, `jobs_considered`, and per-job `gaps[]`
- AC-2: Each gap entry contains: `edge`, `delta`, `failing` (evaluator names), `passing`, `delta_summary`
- AC-3: Runs all F_D evaluators as subprocesses; evaluates F_H via fluent projection; evaluates F_P via assessed event matching
- AC-4: `converged: true` iff `total_delta == 0.0`
- AC-5: Emits `edge_converged` certificate when a job reaches delta=0 and no certificate exists for that (edge, feature) pair

### REQ-F-CMD-002 — gen iterate runs one bind-and-iterate pass

`gen-iterate` selects the first unconverged job and executes one F_D→F_P→F_H cycle.

**Acceptance Criteria**:
- AC-1: Selects first unconverged job in topological edge order
- AC-2: Calls `bind_fd()` to pre-compute all F_D results, F_H gates, and F_P assessments
- AC-3: Calls `iterate()` which enforces F_D→F_P→F_H ordering (REQ-F-GATE-002)
- AC-4: On F_D failure: emits `found{kind: fd_gap}` with failing evaluator details, exits code 4
- AC-5: On F_P needed: emits `fp_dispatched` with failing evaluators and prompt length, writes manifest to `.ai-workspace/fp_manifests/`, exits code 2
- AC-6: On F_H needed: emits `fh_gate_pending` with evaluator criteria, exits code 3
- AC-7: Emits `edge_started{edge, build, target}` before iteration

### REQ-F-CMD-003 — gen start --auto loops until blocked

`gen-start` is the state-machine entry point that loops `gen-iterate` until convergence or a blocking condition.

**Acceptance Criteria**:
- AC-1: Calls `_derive_state()` to determine workspace convergence
- AC-2: If converged: closes completed features (REQ-F-VIS-001), exits code 0
- AC-3: If not converged: dispatches `gen_iterate()` for the next job
- AC-4: `--auto` flag loops up to MAX_AUTO (50) iterations, stopping on: convergence, `fp_dispatched`, `fh_gate_pending`, `found{kind: fd_gap}`, or max iterations
- AC-5: `--human-proxy` requires `--auto`; performs F_H evaluation per proxy protocol (§XIX of bootloader)
- AC-6: Exit codes: 0 (converged), 2 (fp_dispatched), 3 (fh_gate_pending), 4 (fd_gap), 5 (max_iterations)

### REQ-F-CMD-004 — edge_converged certificate includes feature field

Convergence certificates are scoped to (edge, feature) pairs, not edge alone.

**Acceptance Criteria**:
- AC-1: `edge_converged` event data includes `feature` field from scope
- AC-2: Deduplication key is `(edge, feature)` — same edge can converge separately for different features
- AC-3: Feature-specific projections observe only certificates matching their feature ID

---

## Human Gates (REQ-F-GATE-*)

### REQ-F-GATE-001 — F_H evaluators gate spec/design boundaries

Human approval is required at spec and design boundaries before downstream work proceeds.

**Acceptance Criteria**:
- AC-1: F_H evaluators detected at `bind_fd()` time by projecting the event stream for `approved{kind: fh_review}` events
- AC-2: If no operative approval exists, the evaluator is in the `failing` set
- AC-3: `iterate()` emits `fh_gate_pending` with evaluator criteria and exits code 3
- AC-4: F_H gate criteria surfaced verbatim from `Evaluator.description`
- AC-5: `actor` field mandatory on all `approved` events: `"human"` or `"human-proxy"` — never absent

### REQ-F-GATE-002 — F_D must all pass before F_P dispatch; F_D+F_P before F_H

The evaluator ordering invariant prevents wasted work.

**Acceptance Criteria**:
- AC-1: All F_D evaluators must return delta=0 before any `fp_dispatched` event is emitted
- AC-2: All F_D and F_P evaluators must pass before any `fh_gate_pending` event is emitted
- AC-3: If F_P has assessed pass but F_D is still failing → exit code 4 (`fd_gap`) — construction quality problem
- AC-4: Escalation chain enforced: η: F_D → F_P → F_H

---

## Traceability (REQ-F-TAG-*)

### REQ-F-TAG-001 — Implements: tags enforced on all source files

Every engine source file must trace to at least one REQ key.

**Acceptance Criteria**:
- AC-1: `gen check-tags --type implements --path <src/>` scans for `# Implements: REQ-*` comments
- AC-2: Exit 0 if every `.py` file (excluding `__init__.py`) has ≥1 tag; exit 1 otherwise
- AC-3: Output is machine-readable (file list with tag status)

### REQ-F-TAG-002 — Validates: tags enforced on all test files

Every test file must trace to at least one REQ key.

**Acceptance Criteria**:
- AC-1: `gen check-tags --type validates --path <tests/>` scans for `# Validates: REQ-*` comments
- AC-2: Exit 0 if every test file has ≥1 tag; exit 1 otherwise

### REQ-F-COV-001 — REQ key coverage enforced by check-req-coverage

Every REQ key in the Package must appear in at least one feature vector.

**Acceptance Criteria**:
- AC-1: `gen check-req-coverage --package <pkg:var> --features <dir/>` loads Package.requirements and scans YAML `satisfies:` lists
- AC-2: Exit 0 if every REQ key appears in ≥1 feature vector; exit 1 with gap list otherwise
- AC-3: Coverage computable without LLM invocation — pure F_D check

---

## Documentation (REQ-F-DOCS-*)

### REQ-F-DOCS-001 — User guide covers install, first session, operating loop

**Acceptance Criteria**:
- AC-1: `docs/USER_GUIDE.md` exists with sections: Installation, First Session, Operating Loop
- AC-2: Covers all core commands: `gen-start`, `gen-iterate`, `gen-gaps`
- AC-3: Documents evaluator types (F_D, F_P, F_H), event stream, and delta semantics

---

## Evaluator Safety (REQ-F-EVAL-*)

### REQ-F-EVAL-001 — F_D evaluator commands validated at spec load

F_D evaluators with `command` fields are validated for safety before execution.

**Acceptance Criteria**:
- AC-1: Non-empty command string required
- AC-2: Command must not invoke genesis subcommands (acyclic — no engine calling itself)
- AC-3: pytest commands must include `-m 'not e2e'` to prevent unbounded test runs

### REQ-F-EVAL-002 — assessed{kind: fp} events are snapshot-bound via spec_hash

F_P assessments carry a hash of the evaluator specification at the time of assessment. When the spec changes, prior assessments are invalidated.

**Acceptance Criteria**:
- AC-1: `assessed{kind: fp}` events carry a `spec_hash` field (16-char hex SHA-256)
- AC-2: `bind_fd()` computes the current spec_hash and compares it against assessed events in the stream
- AC-3: An assessed event with a non-matching spec_hash does not satisfy F_P convergence
- AC-4: When `scope.workflow_version == "unknown"`: `spec_hash = req_hash(Package.requirements)` — SHA-256 of sorted requirement keys
- AC-5: When `scope.workflow_version != "unknown"`: `spec_hash = job_evaluator_hash(job)` — SHA-256 of sorted evaluator definitions (name, category, command, description)
- AC-6: Changing any evaluator definition invalidates all prior F_P assessments for that job

### REQ-F-EVAL-003 — impl_coverage and validates_coverage enforce per-REQ-key presence

Per-REQ-key traceability from spec through code to tests.

**Acceptance Criteria**:
- AC-1: `gen check-impl-coverage --package <pkg:var> --path <src/>` verifies every REQ key appears in ≥1 source file as `# Implements: {key}`
- AC-2: `gen check-validates-coverage --package <pkg:var> --path <tests/>` verifies every REQ key appears in ≥1 test file as `# Validates: {key}`
- AC-3: Both exit 0 on full coverage, exit 1 with gap list

### REQ-F-EVAL-004 — emit-event CLI rejects assessed{kind: fp} without spec_hash

The CLI governance layer validates prime operator payloads before appending.

**Acceptance Criteria**:
- AC-1: `gen emit-event --type assessed` with `kind: fp` and missing `spec_hash` → rejected with error
- AC-2: `gen emit-event --type assessed` with `kind: fp` and `result` not in `{pass, fail}` → rejected
- AC-3: `gen emit-event --type approved` without `kind` field → rejected
- AC-4: `gen emit-event --type revoked` without `kind`, `edge`, `actor`, or `reason` → rejected
- AC-5: `gen emit-event --type assessed` with `kind: fh_review` requires `actor` and `reason`

### REQ-F-EVAL-005 — emit() write primitive validates prime operator payloads

The Python `emit()` function enforces the same prime operator validation as the CLI.

**Acceptance Criteria**:
- AC-1: `emit("assessed", {"kind": "fp", ...})` without `spec_hash` → raises `ValueError`
- AC-2: `emit("approved", {...})` without `kind` → raises `ValueError`
- AC-3: `emit("revoked", {...})` without `kind` → raises `ValueError`
- AC-4: Valid payloads pass through without error

---

## Feature Lifecycle (REQ-F-VIS-*)

### REQ-F-VIS-001 — gen-start marks completed features and moves them

When all edges converge for a feature, the feature vector is closed.

**Acceptance Criteria**:
- AC-1: `gen-start` calls `_close_completed_features()` when `_derive_state()` returns converged
- AC-2: Feature YAML moved from `.ai-workspace/features/active/` to `.ai-workspace/features/completed/`
- AC-3: `status` field updated to `completed`
- AC-4: Called only when total delta=0 across all edges

---

## Engine Correctness (REQ-F-BIND-*, REQ-F-CORE-*)

### REQ-F-BIND-001 — ContextResolver digest mismatch halts execution

Context integrity is enforced — the engine must not substitute fallback content for corrupted contexts.

**Acceptance Criteria**:
- AC-1: `ContextResolver` loads context by scheme (`workspace://` resolves to filesystem path)
- AC-2: If a context has a non-pending SHA-256 digest and the loaded content does not match → halt with exit code 1
- AC-3: Engine must not substitute `[context unavailable]` or empty string for integrity failures
- AC-4: Pending digests (`sha256:0*64`) bypass verification (content not yet stabilised)

### REQ-F-CORE-001 — project() "current" projection observes edge_started events

The asset projection function derives current state from the event stream.

**Acceptance Criteria**:
- AC-1: `project(stream, asset_type, instance_id)` returns the current asset state
- AC-2: "current" projection filters `edge_started` events by target asset type
- AC-3: Projection is deterministic: same stream + same args = same result
- AC-4: Projection for instance I never reads events of instance J (isolation)
- AC-5: Current state is not stale during active iteration — `edge_started` events update the projection

---

## Test Architecture (REQ-F-TEST-*)

### REQ-F-TEST-001 — Integration-primary test surface

The primary test surface is command-level integration scenarios. Unit tests supplement these for complex internal modules.

**Acceptance Criteria**:
- AC-1: Each integration test exercises the full F_D→F_P→F_H evaluator chain against a real workspace (tmp_path)
- AC-2: Required integration scenarios: cold start → convergence, resume mid-lifecycle, F_D blocks F_P, spec change invalidates F_P, proxy rejection halts edge, full convergence closes features, replay determinism
- AC-3: Unit tests cover write-primitive invariants (emit, project, EventStream) and complex internal modules (bind, schedule, commands) where integration tests alone are insufficient to exercise edge cases

### REQ-F-TEST-002 — Property invariant tests

Property-based tests verify structural invariants that must hold regardless of event sequence.

**Acceptance Criteria**:
- AC-1: Replay determinism: `project(S, T, I) = project(S, T, I)` always
- AC-2: gen_gaps idempotence: running gen_gaps twice with no intervening events produces identical output
- AC-3: No duplicate `edge_converged` certificates for the same (edge, feature) pair
- AC-4: Stale spec_hash never satisfies F_P convergence

---

## Event Calculus Foundation (REQ-F-EC-*)

### Five Prime Operators

The engine uses exactly five prime event types. All other events (edge_started, fp_dispatched, fh_gate_pending, edge_converged) are derived control events, not primes.

| Prime | Kind discriminator | EC role |
|-------|-------------------|---------|
| `found` | `fd_gap` | `happensAt` only — observational record |
| `approved` | `fh_review`, `fh_intent` | `initiates operative(edge, wv)` |
| `assessed` | `fp` (pass/fail), `fh_review` (reject) | `initiates certified(edge, ev, spec_hash, wv)` or `happensAt` |
| `revoked` | `fh_approval` | `terminates operative(edge, wv)` |
| `intent_raised` | — | `happensAt` only — homeostatic signal |

### Two Fluents

| Fluent | Initiated by | Terminated by |
|--------|-------------|---------------|
| `operative(edge, wv)` | `approved{kind: fh_review\|fh_intent}` | `revoked{kind: fh_approval}` |
| `certified(edge, evaluator, spec_hash, wv)` | `assessed{kind: fp, result: pass}` | spec_hash mismatch (implicit) |

### Three Convergence Models

| Evaluator type | Convergence test | Stateful? |
|---------------|-----------------|-----------|
| F_D | Live execution: `run_fd_evaluator(ev) → passes` | No — re-runs every iteration |
| F_H | Fluent projection: `holdsAt(operative(edge, wv), now)` | Yes — initiated by `approved`, terminated by `revoked` |
| F_P | Fluent projection: `holdsAt(certified(edge, ev, spec_hash, wv), now)` | Yes — initiated by `assessed{kind: fp, result: pass}`, invalidated by spec_hash mismatch |

### Revocation Contract

- `revoked{kind: fh_approval}` terminates the `operative` fluent — it does not reference a specific `approved` event
- Scoped by `edge` and `workflow_version`
- When `workflow_version == "unknown"`, revocations match by edge alone
- A revocation that predates all approvals for its edge has no effect

### Rejection vs Revocation

- **Rejection** (`assessed{kind: fh_review, result: reject}`): judgment on current work. `happensAt` only — no fluent terminated. Proxy rejection halts the auto-loop for that edge in the current session.
- **Revocation** (`revoked{kind: fh_approval}`): withdrawal of prior authority. `terminates operative(edge, wv)` — the gate reopens and downstream work is blocked until re-approval.

---

## Key Counts

| Category | REQ Keys |
|----------|----------|
| Bootstrap | REQ-F-BOOT-001, REQ-F-BOOT-002 (2) |
| SDLC Graph | REQ-F-GRAPH-001, REQ-F-GRAPH-002 (2) |
| Commands | REQ-F-CMD-001 through REQ-F-CMD-004 (4) |
| Human Gates | REQ-F-GATE-001, REQ-F-GATE-002 (2) |
| Traceability | REQ-F-TAG-001, REQ-F-TAG-002, REQ-F-COV-001 (3) |
| Documentation | REQ-F-DOCS-001 (1) |
| Evaluator Safety | REQ-F-EVAL-001 through REQ-F-EVAL-005 (5) |
| Feature Lifecycle | REQ-F-VIS-001 (1) |
| Engine Correctness | REQ-F-BIND-001, REQ-F-CORE-001 (2) |
| Test Architecture | REQ-F-TEST-001, REQ-F-TEST-002 (2) |
| Event Calculus | REQ-F-EC-001 through REQ-F-EC-006 (6) |
| **Total** | **30 keys** |
