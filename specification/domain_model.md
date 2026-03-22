# Genesis V1 — Domain Model

**Traces to**: INT-001 criterion 7 (spec authority)
**Status**: Approved
**Date**: 2026-03-20

This document defines the complete domain model: every type, its fields, defaults, constraints, and relationships. Any conformant implementation — regardless of language or platform — must realise structurally equivalent types.

---

## 1. GTL Type System

The GTL type system is the constitutional language. All types are immutable value objects unless noted.

### 1.1 Functor Categories

Three marker types, no fields. Used as `category` discriminator on Evaluator and Operator.

| Type | Regime |
|------|--------|
| `F_D` | Deterministic — zero ambiguity |
| `F_P` | Agent — bounded ambiguity |
| `F_H` | Human — persistent ambiguity |

### 1.2 Asset

A typed node in the graph.

| Field | Type | Default | Constraint |
|-------|------|---------|------------|
| `name` | `string` | required | Unique within Package |
| `id_format` | `string` | required | Template with `{SEQ}` placeholder |
| `lineage` | `list[Asset]` | `[]` | Upstream dependencies |
| `markov` | `list[string]` | `[]` | Stability conditions (named predicates) |
| `operability` | `Operative?` | `null` | Operability condition (not the EC fluent — see convergence_model.md §5.1) |

### 1.3 Edge

A typed transition between assets.

| Field | Type | Default | Constraint |
|-------|------|---------|------------|
| `name` | `string` | required | Unique within Package |
| `source` | `Asset | list[Asset]` | required | Single or product arrow |
| `target` | `Asset` | required | |
| `using` | `list[Operator]` | `[]` | Operators applied |
| `confirm` | `string` | `"markov"` | One of: `"question"`, `"markov"`, `"hypothesis"` |
| `rule` | `Rule?` | `null` | Governance rule |
| `context` | `list[Context]` | `[]` | Standing constraint documents |
| `co_evolve` | `boolean` | `false` | Both assets mutable in same iterate() |

### 1.4 Evaluator

A convergence predicate on an edge.

| Field | Type | Default | Constraint |
|-------|------|---------|------------|
| `name` | `string` | required | Unique within Job |
| `category` | `F_D | F_P | F_H` | required | Functor type |
| `description` | `string` | required | Assessment criteria |
| `command` | `string` | `""` | F_D shell command; empty for F_P/F_H |

### 1.5 Operator

| Field | Type | Default | Constraint |
|-------|------|---------|------------|
| `name` | `string` | required | |
| `category` | `F_D | F_P | F_H` | required | Functor type |
| `uri` | `string` | required | Scheme: `agent://`, `exec://`, `check://`, `metric://`, `fh://` |

### 1.6 Context

A snapshot-bound constraint document.

| Field | Type | Default | Constraint |
|-------|------|---------|------------|
| `name` | `string` | required | |
| `locator` | `string` | required | Scheme: `workspace://`, `git://`, `event://`, `registry://` |
| `digest` | `string` | required | Must start with `"sha256:"` |

Digest `sha256:0000...` (64 zeros) = pending — content not yet stabilised; verification skipped.

### 1.7 Job

The unit of work: a typed transform over an edge.

| Field | Type | Default | Constraint |
|-------|------|---------|------------|
| `edge` | `Edge` | required | |
| `evaluators` | `list[Evaluator]` | `[]` | Must be non-empty (post-construction validation) |

Derived properties: `source_type` → edge.source, `target_type` → edge.target.

### 1.8 Worker

An actor defined by which Jobs it can execute.

| Field | Type | Default | Constraint |
|-------|------|---------|------------|
| `id` | `string` | required | |
| `can_execute` | `list[Job]` | `[]` | Must be non-empty (post-construction validation) |

Derived properties: `writable_types` (target asset names), `readable_types` (source asset names).
Method: `conflicts_with(other: Worker) → boolean` — true if overlapping write territory.

### 1.9 Package

The bounded constitutional world.

| Field | Type | Default |
|-------|------|---------|
| `name` | `string` | required |
| `assets` | `list[Asset]` | `[]` |
| `edges` | `list[Edge]` | `[]` |
| `operators` | `list[Operator]` | `[]` |
| `rules` | `list[Rule]` | `[]` |
| `contexts` | `list[Context]` | `[]` |
| `overlays` | `list[Overlay]` | `[]` |
| `requirements` | `list[string]` | `[]` |

Post-construction: validates operator declarations and edge consistency.

### 1.10 Supporting Types

- **Consensus**: `n: int, m: int` — required approvers / total. Immutable.
- **Operative**: `approved: boolean = true, not_superseded: boolean = false` — operability condition. Immutable.
- **Rule**: `name: string, approve: Consensus, dissent: string = "none", provisional: boolean = false`.
- **Overlay**: Package extension/restriction (add_assets, add_edges, restrict_to — mutually exclusive with additions).
- **PackageSnapshot**: Runtime projection — `snapshot_id, package_name, version, activated_at, activated_by`.

---

## 2. Engine Types

### 2.1 EventStream

The append-only event log. A logical abstraction — any ordered, append-only, replayable store satisfies the contract (file, Kafka, database WAL, event store).

| Field | Type | Default |
|-------|------|---------|
| `workflow_version` | `string` | `"unknown"` |

Required operations:
- `append(event_type, data) → record` — system-assigns `event_time` from clock, appends record. Injects `workflow_version` into data via set-default (never overwrites explicit value).
- `all_events() → list[record]` — returns all events in append order; fails visibly on corruption (never silently skips)
- `replay(asset_type, instance_id) → dict` — convenience for `project()`

How the stream is opened, addressed, and persisted is a design choice (see ADR-019 for the claude_code build's JSONL file implementation).

### 2.2 ContextResolver

| Field | Type |
|-------|------|
| `workspace_root` | `filepath` |

Operations:
- `load(ctx: Context) → string` — loads by scheme, verifies digest

Scheme dispatch:
- `workspace://` — resolves relative to workspace root
- `git://`, `event://`, `registry://` — V1: not implemented (degrade gracefully)
- Unknown scheme — fatal error

**Directory handling**: When the locator resolves to a directory, recursively collect `*.md`, `*.py`, `*.txt`, `*.yml` (sorted), prefix each with `# {relative_path}`, concatenate. Empty directory returns a sentinel message.

**Digest verification**: SHA-256 of loaded content compared against `ctx.digest`. Mismatch halts execution. Pending digest (`sha256:0*64`) skips verification.

### 2.3 Scope

The explicit scope for every command invocation.

| Field | Type | Default | Caller-provided |
|-------|------|---------|-----------------|
| `package` | `Package` | required | yes |
| `workspace_root` | `filepath` | required | yes |
| `feature` | `string?` | `null` | yes |
| `edge` | `string?` | `null` | yes |
| `build` | `string` | required | yes |
| `worker` | `Worker?` | `null` | yes |
| `workflow_version` | `string` | `"unknown"` | **no** — set at construction |

`workflow_version` is populated at construction via 3-tier discovery, never from the caller:
1. Explicit `active_workflow_path` from `genesis.yml` (if configured)
2. `.ai-workspace/runtime/active-workflow.json` (preferred mutable location)
3. `.genesis/active-workflow.json` (legacy fallback)

Format: `"{workflow}@{version}"`. Returns `"unknown"` on any error.

### 2.4 PrecomputedManifest

The F_D pre-computation output — everything computable before the LLM sees anything.

| Field | Type | Default |
|-------|------|---------|
| `job` | `Job` | required |
| `current_asset` | `dict` | required |
| `failing_evaluators` | `list[Evaluator]` | required |
| `passing_evaluators` | `list[Evaluator]` | required |
| `fd_results` | `map[string, any]` | required |
| `relevant_contexts` | `map[string, string]` | required |
| `delta_summary` | `string` | required |

Derived: `has_gap: boolean` (any failing), `delta: float` (failing / total evaluators, range [0.0, 1.0]).

### 2.5 BoundJob

A Job with resolved contexts and assembled prompt.

| Field | Type | Default |
|-------|------|---------|
| `job` | `Job` | required |
| `precomputed` | `PrecomputedManifest` | required |
| `prompt` | `string` | required |
| `result_path` | `string` | `""` |

### 2.6 WorkingSurface

The product of a single iterate() call.

| Field | Type | Default |
|-------|------|---------|
| `events` | `list[record]` | `[]` |
| `artifacts` | `list[string]` | `[]` |
| `context_consumed` | `list[Context]` | `[]` |

Derived: `is_auditable() → boolean` — true if events or artifacts present.

---

## 3. Relationship Diagram

```
Package ──1:N──▶ Asset
Package ──1:N──▶ Edge ──1:1──▶ source: Asset
                       ──1:1──▶ target: Asset
                       ──0:N──▶ Context
Edge ◀──1:1── Job ──1:N──▶ Evaluator
Worker ──1:N──▶ Job

EventStream ◀── append() ──▶ event log (backend-specific)
                                  │
                        project() │ replay
                                  ▼
                             Asset state (dict)

ContextResolver ──load()──▶ Context ──digest──▶ content verification

Scope ──references──▶ Package, Worker
      ──reads──▶ active-workflow.json → workflow_version
                 (3-tier: genesis.yml path → .ai-workspace/runtime/ → .genesis/ fallback)

PrecomputedManifest ◀── bind_fd() ── Job + EventStream + ContextResolver
BoundJob ◀── bind_fp() ── PrecomputedManifest
WorkingSurface ◀── iterate() ── BoundJob
```

---

## 4. Event Schema (V1)

Every event record:

```json
{
  "event_time": "ISO8601",
  "event_type": "prime|control|lifecycle",
  "data": { ... }
}
```

`event_time` is system-assigned at append — no caller can provide it.

### Prime operators (Tier 1 — participate in EC fluent projection)

| Type | Required data fields |
|------|---------------------|
| `found` | `kind: "fd_gap"`, `edge`, `failing[]`, `delta_summary` |
| `approved` | `kind: "fh_review"|"fh_intent"`, `edge`, `actor: "human"|"human-proxy"` |
| `assessed` | `kind: "fp"|"fh_review"`, `edge`, `evaluator` (if fp), `result: "pass"|"fail"|"reject"`, `spec_hash` (if fp) |
| `revoked` | `kind: "fh_approval"`, `edge`, `actor`, `reason` |
| `intent_raised` | `signal_source`, `description` |

### Control events (Tier 2 — scheduler bookkeeping)

| Type | Key data fields |
|------|----------------|
| `edge_started` | `edge`, `build`, `target` |
| `fp_dispatched` | `edge`, `failing_evaluators[]`, `prompt_length` |
| `fh_gate_pending` | `edge`, `evaluators[]`, `criteria[]` |
| `edge_converged` | `edge`, `feature`, `target`, `delta`, `certified_by` |

### Lifecycle events (Tier 3 — infrastructure)

`genesis_installed`, `genesis_sdlc_installed`, `workflow_activated`, `bug_fixed`, etc.

---

## 5. Engine-Owned Resources

The engine owns exactly two concerns:

**Event stream**: An append-only, ordered, replayable event log. The storage backend is a design choice — file, message broker, database, event store. The spec requires only the operations defined in §2.1.

**Install target**: `.genesis/` — engine modules, GTL type system, config, gtl_spec. Written by gen-install, read-only at runtime.

All other workspace structure (`features/`, `comments/`, `reviews/`, `context/`, `agents/`) is owned by the methodology layer (e.g. genesis_sdlc), not the engine. The engine resolves `workspace://` context locators relative to the workspace root but does not create or depend on any specific directory layout beyond the event stream.
