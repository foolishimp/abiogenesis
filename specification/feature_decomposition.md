# Genesis V1 — Feature Decomposition

**Traces to**: INT-001, INT-002
**Requirements**: specification/requirements.md
**REQ key registry**: builds/claude_code/code/gtl_spec/packages/abiogenesis.py
**Status**: Approved
**Date**: 2026-03-20

---

## Feature Map

| Feature | Title | Satisfies | Depends On | MVP |
|---------|-------|-----------|------------|-----|
| REQ-F-GRAPH | SDLC Graph Definition | GRAPH-001, GRAPH-002 | — | ✓ |
| REQ-F-BOOT | Bootstrap Installation | BOOT-001, BOOT-002 | GRAPH | ✓ |
| REQ-F-ENGINE | Engine Core (emit, project, context) | CORE-001, BIND-001 | GRAPH | ✓ |
| REQ-F-EVAL | Evaluator Safety & Spec Binding | EVAL-001..005 | ENGINE | ✓ |
| REQ-F-GATE | Human Gate Protocol | GATE-001, GATE-002 | ENGINE | ✓ |
| REQ-F-CMD | Commands (gaps, iterate, start) | CMD-001..004, VIS-001 | EVAL, GATE | ✓ |
| REQ-F-TAG | Traceability Enforcement | TAG-001, TAG-002, COV-001 | GRAPH | ✓ |
| REQ-F-DOCS | Documentation | DOCS-001 | CMD | ✓ |
| REQ-F-TEST | Test Architecture | TEST-001, TEST-002 | CMD | ✓ |
| REQ-F-EC | Event Calculus Foundation | EC-001..006 | ENGINE, GATE | ✓ |
| REQ-F-PROV | Workflow Provenance | PROV-001..005 | EC | ✓ |
| REQ-F-BOOTDOC | Bootloader as Graph Asset | BOOTDOC-001..003 | GRAPH, ENGINE | ✓ |

---

## Dependency DAG

```
REQ-F-GRAPH
    ├── REQ-F-BOOT         (needs Package definition)
    ├── REQ-F-TAG           (needs REQ keys from Package)
    └── REQ-F-ENGINE        (needs asset/edge types)
         ├── REQ-F-EVAL     (needs emit, bind_fd, spec_hash)
         ├── REQ-F-GATE     (needs event stream, fluent projection)
         │    └── REQ-F-EC  (needs gate protocol to ground in EC)
         │         └── REQ-F-PROV  (needs EC fluents for version binding)
         └── REQ-F-CMD      (needs EVAL + GATE)
              ├── REQ-F-DOCS    (needs commands to document)
              └── REQ-F-TEST    (needs commands to test)

REQ-F-BOOTDOC                     (depends on GRAPH + ENGINE — new graph asset)
```

**Build order** (topological sort):
1. REQ-F-GRAPH
2. REQ-F-BOOT, REQ-F-TAG, REQ-F-ENGINE (parallel — no mutual dependencies)
3. REQ-F-EVAL, REQ-F-GATE (parallel — both depend on ENGINE)
4. REQ-F-EC (depends on ENGINE + GATE)
5. REQ-F-PROV (depends on EC)
6. REQ-F-CMD (depends on EVAL + GATE)
7. REQ-F-DOCS, REQ-F-TEST (parallel — depend on CMD)
8. REQ-F-BOOTDOC (depends on GRAPH + ENGINE)

---

## MVP Scope

All 12 features are MVP. This is the minimum engine that can run the full asset graph for any project with provenance-aware convergence.

**Deferred** (V2+):
- Consensus engine (multi-agent quorum)
- Spawn/fold-back (parallel feature execution)
- Release workflow (gen-release command)
- Observer stack (dispatch_monitor, intent observer)
- Multi-tenant scheduling (multiple workers with conflict detection)
- Per-job feature routing (V1 validates existence only)
- Bedrock / Gemini / Codex builds

---

## Module Mapping

The engine consists of 6 modules. Features map to modules as follows:

| Module | Primary features | Key functions |
|--------|-----------------|---------------|
| `core.py` | ENGINE | `emit()`, `project()`, `EventStream`, `ContextResolver`, `workspace_bootstrap()` |
| `bind.py` | EVAL, EC, PROV | `bind_fd()`, `bind_fp()`, `bind_fh()`, `req_hash()`, `job_evaluator_hash()`, `run_fd_evaluator()` |
| `schedule.py` | GATE | `delta()`, `iterate()`, `schedule()` |
| `commands.py` | CMD, VIS | `gen_gaps()`, `gen_iterate()`, `gen_start()`, `Scope`, `_close_completed_features()` |
| `manifest.py` | EVAL | `PrecomputedManifest`, `BoundJob` dataclasses |
| `__main__.py` | CMD, EVAL, BOOTDOC | CLI entry point, `_emit_event_cmd()` governance, `check-tags`, `check-*-coverage`, `check-bootloader-consistency` |

**Supplementary**:
- `gen-install.py` — BOOT feature (standalone installer script)

All modules are under `builds/claude_code/code/genesis/`.

---

## Feature Details

### REQ-F-GRAPH — SDLC Graph Definition

The GTL Package at `builds/claude_code/code/gtl_spec/packages/abiogenesis.py` defines the typed asset graph. This is the constitutional source — all other features implement or enforce what the Package declares.

**Key artifacts**: 6 assets with markov conditions, 5 edges with evaluators, 5 operators (1 F_P, 1 F_H, 3 F_D), 4 contexts.

### REQ-F-ENGINE — Engine Core

The event stream substrate and projection functions. `emit()` is the only write path (system-assigned `event_time`, atomic append). `project()` derives asset state deterministically from the stream. `ContextResolver` loads and verifies context documents by scheme and SHA-256 digest.

**Key invariants**: emit-only writes, system-assigned timestamps, deterministic projection, context integrity.

### REQ-F-EVAL — Evaluator Safety & Spec Binding

Ensures evaluators are safe to run and that F_P assessments are bound to the spec version that produced them. `spec_hash` invalidation prevents stale assessments from satisfying convergence after spec changes. CLI and `emit()` both validate prime operator payloads.

### REQ-F-GATE — Human Gate Protocol

F_H evaluators block at spec/design boundaries until human approval. The ordering invariant (F_D→F_P→F_H) prevents reviewing candidates with deterministic failures. Proxy mode substitutes the LLM as F_H actor with audit trail.

### REQ-F-EC — Event Calculus Foundation

Grounds the convergence model in Event Calculus. Five prime operators as the basis set. Two fluents (`operative`, `certified`) with explicit initiation and termination semantics. Three convergence models (F_D live, F_H holdsAt, F_P holdsAt). Revocation terminates fluents; rejection is judgment without fluent effect.

**Design record**: ADR-016

### REQ-F-PROV — Workflow Provenance

Binds convergence events to the workflow version active when emitted. `active-workflow.json` records the current workflow identity. `job_evaluator_hash` replaces `req_hash` as spec_hash function when provenance is present. Version-aware F_H binding with carry-forward for version upgrades.

### REQ-F-CMD — Commands

Three commands (`gen-gaps`, `gen-iterate`, `gen-start`) as named compositions over the engine functions. `gen-gaps` computes delta per job. `gen-iterate` runs one cycle. `gen-start` loops until blocked. Feature lifecycle closure (VIS-001) is integrated into `gen-start`.

### REQ-F-TAG — Traceability Enforcement

Three check commands enforce REQ key traceability: `check-tags` (file-level), `check-impl-coverage` (per-key source coverage), `check-validates-coverage` (per-key test coverage). All are pure F_D checks — no LLM invocation.

### REQ-F-TEST — Test Architecture

Integration-primary test surface: each test exercises the full evaluator chain against a real workspace. Property invariant tests verify structural guarantees (replay determinism, idempotence, no duplicate certificates, stale hash rejection).

### REQ-F-BOOTDOC — Bootloader as Graph Asset

Makes GTL_BOOTLOADER.md a convergence-tracked graph asset with an F_D evaluator that checks type consistency against `gtl/core.py`. When the type system changes and the bootloader doesn't update, delta > 0 and the system tells you.

**Key artifacts**: `bootloader_doc` asset, `design→bootloader_doc` edge, `gtl_type_consistency` F_D evaluator, `check-bootloader-consistency` command.

---

## Quality Gates (cross-cutting)

These are not standalone features — they are woven across all features:

- **Test coverage**: All modules have integration + unit + property tests; 310+ tests passing
- **Sandbox E2E**: Fresh sandbox run creates working code+tests (`test_e2e_sandbox.py`)
- **Self-hosting**: Abiogenesis uses its own engine to build its next iteration
- **Spec authority**: Deleting code and regenerating from specification/ + design/adrs/ must produce an equivalent compiler

---
