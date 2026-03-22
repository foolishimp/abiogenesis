# Genesis V1 — Requirements

**Derived from**: The GTL Package `abiogenesis.py` (the Package IS the requirement registry — concrete path is build-specific)
**Traces to**: INT-001
**Status**: Approved
**Date**: 2026-03-20

These REQ keys are the traceability thread. Every design ADR, every code file, every test must tag back to these keys. The GTL Package (`abiogenesis.py`) is the authoritative key registry — this document provides human-readable descriptions and acceptance criteria for each registered key.

---

## Bootstrap (REQ-F-BOOT-*)

### REQ-F-BOOT-001 — gen-install bootstraps .genesis/ into target project

The installer copies the engine into a target project so it can run without an installed package.

**Acceptance Criteria**:
- AC-1: `gen-install --target <dir> --project-slug <slug>` creates `.genesis/genesis/` with engine modules
- AC-2: Creates `.genesis/genesis.yml` pointing to `gtl_spec.packages.<slug>:package`
- AC-3: Creates `.genesis/gtl_spec/packages/<slug>.py` starter spec if absent — never overwrites existing
- AC-4: Idempotent — re-running updates engine files, preserves workspace state

### REQ-F-BOOT-002 — .genesis/genesis.yml config resolves Package/Worker

The engine reads its Package and Worker from a config file at startup.

**Acceptance Criteria**:
- AC-1: `genesis.yml` contains `package:` and `worker:` fields as resolvable symbol references
- AC-2: Missing `genesis.yml` → informative error, not a crash
- AC-3: Engine resolves Package and Worker dynamically from the import path

### REQ-F-PKG-001 — Starter spec generated for new projects

gen-install creates a starter GTL Package spec so new projects have a working baseline.

**Acceptance Criteria**:
- AC-1: `gen-install --project-slug <slug>` generates a starter Package definition under `.genesis/gtl_spec/packages/<slug>`
- AC-2: Starter spec includes: two assets (spec, output), one edge, one evaluator, one worker
- AC-3: Never overwrites existing spec — only created if absent

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
- AC-3: Executes all F_D evaluators via their command specification; evaluates F_H via fluent projection; evaluates F_P via assessed event matching
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
- AC-1: `check-tags --type implements` scans source files for `Implements: REQ-*` traceability markers
- AC-2: Exit 0 if every source module (excluding package init files) has ≥1 tag; exit 1 otherwise
- AC-3: Output is machine-readable (file list with tag status)

### REQ-F-TAG-002 — Validates: tags enforced on all test files

Every test file must trace to at least one REQ key.

**Acceptance Criteria**:
- AC-1: `check-tags --type validates` scans test files for `Validates: REQ-*` traceability markers
- AC-2: Exit 0 if every test module has ≥1 tag; exit 1 otherwise

### REQ-F-COV-001 — REQ key coverage enforced by check-req-coverage

Every REQ key in the Package must appear in at least one feature vector.

**Acceptance Criteria**:
- AC-1: `check-req-coverage` loads Package.requirements and scans feature vector `satisfies:` lists
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
- AC-2: Command must not invoke orchestration subcommands (`start`, `iterate`, `gaps`, `emit-event`) — no control-loop re-entry. Deterministic `check-*` leaf predicates are permitted.
- AC-3: Test-runner commands must exclude long-running or end-to-end suites to prevent unbounded execution

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
- AC-1: `check-impl-coverage` verifies every REQ key appears in ≥1 source file as an `Implements: {key}` traceability marker
- AC-2: `check-validates-coverage` verifies every REQ key appears in ≥1 test file as a `Validates: {key}` traceability marker
- AC-3: Both exit 0 on full coverage, exit 1 with gap list

### REQ-F-EVAL-004 — emit-event rejects assessed{kind: fp} without spec_hash

The event emission governance layer validates prime operator payloads before appending.

**Acceptance Criteria**:
- AC-1: `emit-event --type assessed` with `kind: fp` and missing `spec_hash` → rejected with error
- AC-2: `emit-event --type assessed` with `kind: fp` and `result` not in `{pass, fail}` → rejected
- AC-3: `emit-event --type approved` without `kind` field → rejected
- AC-4: `gen emit-event --type revoked` without `kind`, `edge`, `actor`, or `reason` → rejected
- AC-6: `gen emit-event --type revoked` with `kind` not in `{fh_approval, fp_assessment}` → rejected
- AC-5: `gen emit-event --type assessed` with `kind: fh_review` requires `actor` and `reason`

### REQ-F-EVAL-005 — EventStream append validates prime operator payloads

The event stream write primitive enforces the same prime operator validation as the CLI.

**Acceptance Criteria**:
- AC-1: Appending `assessed{kind: fp}` without `spec_hash` → error
- AC-2: Appending `approved` without `kind` → error
- AC-3: Appending `revoked` without `kind` → error
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

## Workspace (REQ-F-WKSP-*)

### REQ-F-WKSP-001 — Workspace bootstrap creates event stream path

The engine initialises the workspace on first use.

**Acceptance Criteria**:
- AC-1: Creates the event stream storage path if absent (idempotent)
- AC-2: Binds the module-level event stream so `emit()` becomes available
- AC-3: Returns a bound EventStream ready for append/read operations
- AC-4: Safe to call on an existing workspace — never destroys existing events

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

### REQ-F-CORE-002 — Projection determinism invariant

The projection function is a pure function of the event stream.

**Acceptance Criteria**:
- AC-1: `project(S, T, I) = project(S, T, I)` — same stream, same type, same instance always produces identical output
- AC-2: No hidden state, caching, or side effects in the projection path
- AC-3: Property tests verify determinism across randomised event sequences

### REQ-F-CORE-003 — Event stream completeness

All prior asset states are reconstructable from the event stream.

**Acceptance Criteria**:
- AC-1: Every state-changing operation produces at least one event
- AC-2: `project(stream[0..k])` reconstructs the asset state at any point k in the stream
- AC-3: Corrupted event log lines fail visibly — never silently skipped

### REQ-F-CORE-004 — F_D pre-computation produces PrecomputedManifest

The binding phase computes everything possible without an LLM.

**Acceptance Criteria**:
- AC-1: `bind_fd()` produces a PrecomputedManifest containing: job, current asset state, failing/passing evaluators, F_D results, resolved contexts, and delta summary
- AC-2: Passing evaluators are excluded from the F_P prompt — they are provably outside the ambiguity bounds
- AC-3: `bind_fp()` assembles the F_P prompt from the PrecomputedManifest — template assembly only, no LLM invocation

### REQ-F-CORE-005 — ContextResolver loads and verifies context documents

Context documents are loaded by scheme and verified by digest.

**Acceptance Criteria**:
- AC-1: Supports `workspace://` scheme (resolves relative to workspace root)
- AC-2: Directory locators recursively collect readable files, prefix each with relative path
- AC-3: SHA-256 digest verification — mismatch halts execution
- AC-4: Pending digest (`sha256:0*64`) skips verification
- AC-5: Unimplemented schemes (V1) degrade gracefully without halting

### REQ-F-CORE-006 — Worker scheduling partitions by write territory

Workers with overlapping write territory must not execute concurrently.

**Acceptance Criteria**:
- AC-1: `schedule(workers)` returns batches of non-conflicting workers
- AC-2: Conflict detection is based on `Worker.writable_types` (target asset names)
- AC-3: Batch i completes before batch i+1 starts
- AC-4: V1: single worker is trivially `[[worker]]`

---

## Test Architecture (REQ-F-TEST-*)

### REQ-F-TEST-001 — Integration-primary test surface

The primary test surface is command-level integration scenarios. Unit tests supplement these for complex internal modules.

**Acceptance Criteria**:
- AC-1: Each integration test exercises the full F_D→F_P→F_H evaluator chain against an isolated temporary workspace
- AC-2: Required integration scenarios: cold start → convergence, resume mid-lifecycle, F_D blocks F_P, spec change invalidates F_P, F_P revocation cascades delta through downstream edges, proxy rejection halts edge, full convergence closes features, replay determinism
- AC-3: Unit tests cover write-primitive invariants (emit, project, EventStream) and complex internal modules (bind, schedule, commands) where integration tests alone are insufficient to exercise edge cases

### REQ-F-TEST-002 — Property invariant tests

Property-based tests verify structural invariants that must hold regardless of event sequence.

**Acceptance Criteria**:
- AC-1: Replay determinism: `project(S, T, I) = project(S, T, I)` always
- AC-2: gen_gaps idempotence: running gen_gaps twice with no intervening events produces identical output
- AC-3: No duplicate `edge_converged` certificates for the same (edge, feature) pair
- AC-4: Stale spec_hash never satisfies F_P convergence

---

## Workflow Provenance (REQ-F-PROV-*)

### REQ-F-PROV-001 — Workflow version read from active-workflow.json

The engine tracks which workflow version is active for provenance binding.

**Acceptance Criteria**:
- AC-1: Reads `active-workflow.json` at Scope construction via 3-tier discovery: (1) explicit `active_workflow_path` from genesis.yml, (2) `.ai-workspace/runtime/active-workflow.json`, (3) `.genesis/active-workflow.json` (legacy fallback)
- AC-2: Returns `"{workflow}@{version}"` when file is valid (e.g., `"genesis_sdlc.standard@0.3.0"`)
- AC-3: Returns `"unknown"` on any failure (missing file, invalid JSON, non-string values)
- AC-4: Engine never fails to start due to this file's state

### REQ-F-PROV-002 — Events annotated with workflow_version

Every event carries provenance metadata linking it to the active workflow version.

**Acceptance Criteria**:
- AC-1: `EventStream.append()` injects `workflow_version` into event data when not `"unknown"`
- AC-2: Injection uses set-default — never overwrites an explicit value from the caller
- AC-3: The `emit-event` CLI path also annotates workflow_version independently (pre-stack, no Scope)
- AC-4: Events emitted when workflow_version is `"unknown"` carry no version annotation

### REQ-F-PROV-003 — job_evaluator_hash replaces req_hash when provenance is present

Spec hash computation is version-aware.

**Acceptance Criteria**:
- AC-1: When `workflow_version != "unknown"`: `spec_hash = job_evaluator_hash(job)` — hash of all evaluator definitions (name, category, command, description)
- AC-2: When `workflow_version == "unknown"`: `spec_hash = req_hash(Package.requirements)` — hash of sorted requirement keys (fallback)
- AC-3: Changing any evaluator definition changes the hash, invalidating prior F_P assessments
- AC-4: Whitespace differences in evaluator descriptions do not change the hash (normalisation applied)

### REQ-F-PROV-004 — Carry-forward preserves approvals across version upgrades

When a workflow version changes, explicitly listed approvals carry forward without re-approval.

**Acceptance Criteria**:
- AC-1: Carry-forward list read from `{workflow_root}/{pkg}/{variant}/{version_dir}/manifest.json` (workflow_root defaults to `.genesis/workflows`, configurable via genesis.yml)
- AC-2: Each entry specifies `{edge, from_version}` — the approval from `from_version` is accepted under the current version
- AC-3: Revocations are scoped by workflow_version — a revocation from one version cannot cancel approvals from another
- AC-4: When `workflow_version == "unknown"`: no carry-forward (approvals match by edge alone)

### REQ-F-PROV-005 — Orphan tolerance for graph evolution

Events referencing edges not in the current graph are silently ignored, enabling graph evolution without event stream migration.

**Acceptance Criteria**:
- AC-1: `bind_fh()` and `delta()` skip events referencing edges not in the current job set
- AC-2: No error or warning emitted for orphan events
- AC-3: Adding or removing edges from the Package does not require event stream modification

---

## Event Calculus Foundation (REQ-F-EC-*)

### REQ-F-EC-001 — Five prime operators as the basis set

The engine uses exactly five prime event types. All other events are derived.

**Acceptance Criteria**:
- AC-1: Exactly five prime types: `found`, `approved`, `assessed`, `revoked`, `intent_raised`
- AC-2: All other event types (`edge_started`, `fp_dispatched`, `fh_gate_pending`, `edge_converged`) are control events — they do not participate in fluent projection
- AC-3: Each prime type has a `kind` discriminator that determines its EC role

| Prime | Kind discriminator | EC role |
|-------|-------------------|---------|
| `found` | `fd_gap` | `happensAt` only — observational record |
| `approved` | `fh_review`, `fh_intent` | `initiates operative(edge, wv)` |
| `assessed` | `fp` (pass/fail), `fh_review` (reject) | `initiates certified(edge, ev, spec_hash, wv)` or `happensAt` |
| `revoked` | `fh_approval`, `fp_assessment` | `terminates operative(edge, wv)` or `terminates certified(edge, ev, spec_hash, wv)` |
| `intent_raised` | — | `happensAt` only — homeostatic signal |

### REQ-F-EC-002 — Two fluents: operative and certified

Convergence state is modelled as two Event Calculus fluents. Both fluents have symmetric initiation and termination operations.

**Acceptance Criteria**:
- AC-1: `operative(edge, wv)` — initiated by `approved{fh_review|fh_intent}`, terminated by `revoked{fh_approval}`
- AC-2: `certified(edge, evaluator, spec_hash, wv)` — initiated by `assessed{fp, result: pass}`, terminated by `revoked{fp_assessment}` or spec_hash mismatch
- AC-3: Both fluents are parameterised by workflow_version — approvals from one version do not satisfy another (unless carry-forward, REQ-F-PROV-004)
- AC-4: Both fluents support explicit event-calculus termination — the F_ algebra requires symmetric `{initiate, terminate, query}` operations across all functor types

### REQ-F-EC-003 — Three convergence models

Each evaluator type has a distinct convergence test.

**Acceptance Criteria**:
- AC-1: F_D: live execution — re-runs every iteration, stateless
- AC-2: F_H: fluent projection — `holdsAt(operative(edge, wv), now)`
- AC-3: F_P: fluent projection — `holdsAt(certified(edge, evaluator, spec_hash, wv), now)`

### REQ-F-EC-004 — Revocation terminates fluents symmetrically

Revocation withdraws prior convergence authority. Both fluents (`operative` and `certified`) support explicit termination via `revoked` events, preserving the F_ algebra symmetry.

**Acceptance Criteria**:
- AC-1: `revoked{kind: fh_approval}` terminates the `operative` fluent — does not reference a specific `approved` event
- AC-2: `revoked{kind: fp_assessment}` terminates the `certified` fluent — does not reference a specific `assessed` event
- AC-3: Both are scoped by `edge` and `workflow_version`
- AC-4: Wildcard edge (`"*"`) terminates the target fluent for all edges under the matching workflow_version
- AC-5: When `workflow_version == "unknown"`, revocations match by edge alone
- AC-6: A revocation that predates all initiating events for its edge has no effect
- AC-7: `revoked{kind: fh_approval}` and `revoked{kind: fp_assessment}` are independent — revoking one does not affect the other

### REQ-F-EC-005 — Rejection is judgment, not revocation

Rejection and revocation are distinct operations with different EC semantics.

**Acceptance Criteria**:
- AC-1: Rejection (`assessed{kind: fh_review, result: reject}`) is `happensAt` only — no fluent terminated
- AC-2: Proxy rejection halts the auto-loop for that edge in the current session
- AC-3: Revocation (`revoked{kind: fh_approval}`) terminates `operative(edge, wv)` — the gate reopens

### REQ-F-EC-006 — assessed{kind: fp} result values

F_P assessment results have defined semantics.

**Acceptance Criteria**:
- AC-1: `result: "pass"` — evaluator satisfied, `certified` fluent initiated
- AC-2: `result: "fail"` — evaluator not satisfied, no fluent change, F_P may be re-dispatched
- AC-3: For `assessed{kind: fh_review}`: `result: "reject"` — human judgment that work is insufficient (see REQ-F-EC-005)

---

## Bootloader as Graph Asset (REQ-F-BOOTDOC-*)

### REQ-F-BOOTDOC-001 — bootloader_doc is a graph asset with design lineage

The bootloader document (GTL_BOOTLOADER.md) becomes a convergence-tracked asset in the graph, not a hand-maintained file.

**Acceptance Criteria**:
- AC-1: `bootloader_doc` asset exists in the Package with `lineage=[design]`
- AC-2: Asset has markov conditions: `type_names_consistent`, `axiom_references_correct`
- AC-3: Asset id_format is `BOOTDOC-{SEQ}`

### REQ-F-BOOTDOC-002 — F_D evaluator checks GTL type consistency

A deterministic evaluator parses type names from the GTL core module and checks they appear correctly in the GTL bootloader document.

**Acceptance Criteria**:
- AC-1: `gtl_type_consistency` F_D evaluator exists on the `design→bootloader_doc` edge
- AC-2: Evaluator extracts exported type names from the GTL core module (Asset, Edge, Evaluator, Job, Operator, Package, Worker, F_D, F_P, F_H, etc.)
- AC-3: Evaluator checks that each exported type appears in the GTL bootloader document
- AC-4: Exit 0 if all types present; exit 1 with gap list if any missing
- AC-5: Changing a type name in the GTL core module without updating the bootloader causes failure

### REQ-F-BOOTDOC-003 — Bootloader converges before downstream install gates

The bootloader must be consistent before any downstream gate that installs it into dependent projects.

**Acceptance Criteria**:
- AC-1: `bootloader_doc` convergence is checked before `code↔unit_tests` edge proceeds (since tests exercise the bootloader-installed workspace)
- AC-2: `gen-gaps` reports `bootloader_doc` with delta > 0 when consistency check fails
- AC-3: After bootloader is updated and F_P assesses it, delta returns to 0

---

## Key Counts

| Category | REQ Keys | Count |
|----------|----------|-------|
| Bootstrap | REQ-F-BOOT-001, REQ-F-BOOT-002, REQ-F-PKG-001 | 3 |
| SDLC Graph | REQ-F-GRAPH-001, REQ-F-GRAPH-002 | 2 |
| Commands | REQ-F-CMD-001 through REQ-F-CMD-004 | 4 |
| Human Gates | REQ-F-GATE-001, REQ-F-GATE-002 | 2 |
| Traceability | REQ-F-TAG-001, REQ-F-TAG-002, REQ-F-COV-001 | 3 |
| Documentation | REQ-F-DOCS-001 | 1 |
| Evaluator Safety | REQ-F-EVAL-001 through REQ-F-EVAL-005 | 5 |
| Feature Lifecycle | REQ-F-VIS-001 | 1 |
| Workspace | REQ-F-WKSP-001 | 1 |
| Engine Correctness | REQ-F-BIND-001, REQ-F-CORE-001 through REQ-F-CORE-006 | 7 |
| Test Architecture | REQ-F-TEST-001, REQ-F-TEST-002 | 2 |
| Workflow Provenance | REQ-F-PROV-001 through REQ-F-PROV-005 | 5 |
| Event Calculus | REQ-F-EC-001 through REQ-F-EC-006 | 6 |
| Bootloader Doc | REQ-F-BOOTDOC-001 through REQ-F-BOOTDOC-003 | 3 |
| **Total** | | **45** |
