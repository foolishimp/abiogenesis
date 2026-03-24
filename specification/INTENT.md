# genesis — Intent

**Intent ID**: INT-001
**Date**: 2026-03-15
**Status**: Approved

---

## The Problem

AI-augmented software development lacks a clean, formal engine. The existing genesis engine (ai_sdlc_method v3.1.0) evolved organically — it works, but it is not GTL-first, it carries accumulated legacy, and it cannot be re-derived from first principles. There is no reference implementation that demonstrates the full AI SDLC asset graph from intent through to code+tests using the GTL type system as the constitutional language.

---

## What We Want

A clean, GTL-first implementation of Genesis V1.0 — an AI SDLC engine that:

1. Defines the SDLC as a typed asset graph (6 assets, 5 edges) in a GTL Package
2. Implements the convergence engine: `iterate()` drives candidates toward stability via three evaluator types (F_D deterministic, F_P agent, F_H human)
3. Grounds convergence projection in Event Calculus: five prime operators (`found`, `approved`, `assessed`, `revoked`, `intent_raised`), two fluents (`operative`, `certified`), three convergence models
4. Provides commands (`gen-start`, `gen-iterate`, `gen-gaps`) as named compositions over the engine
5. Enforces traceability from REQ keys through code to tests via tag enforcement
6. Binds convergence events to workflow provenance (version, spec_hash) to prevent stale assessment reuse
7. Is built by the current genesis engine using itself as bootstrap compiler (the GCC/C analogy)
8. Reaches a self-hosting gate: abiogenesis can build itself

The spec is `builds/claude_code/code/gtl_spec/packages/abiogenesis.py` — the GTL Package IS the requirement registry. `specification/` provides human-readable requirement descriptions and acceptance criteria for each REQ key registered in the Package.

---

## Business Value

- **Proof of concept for GTL**: demonstrates that a complex system (the genesis engine itself) can be formally specified as a GTL Package and then built from that spec
- **Bootstrap independence**: once self-hosting, abiogenesis no longer depends on ai_sdlc_method for its own development
- **Reference implementation**: every future genesis build (Codex, Gemini, Bedrock, Java, Temporal) derives from this clean topology
- **GCC analogy materialised**: GTL = C, ai_sdlc_method = GCC 1.0, abiogenesis = GCC 1.1 — the language bootstraps its own compiler

---

## Success Criteria

1. Spec loadable: `python builds/claude_code/code/gtl_spec/packages/abiogenesis.py` describes the Package correctly
2. Engine runs `gen-start` on a fresh project and produces intent → requirements output
3. Engine traverses all 5 edges for a test feature vector, producing code + passing tests
4. All engine modules have unit + integration tests; test suite green
5. Sandbox E2E: fresh sandbox run creates working code+tests
6. Self-hosting gate: abiogenesis uses genesis to build its next iteration
7. Specification is authoritative: deleting `builds/claude_code/code/` and regenerating from `specification/` + `builds/claude_code/design/adrs/` produces an equivalent compiler

---

## INT-002 — Bootloader Documents as Graph Assets

**Date**: 2026-03-21
**Status**: Draft

### Problem

Bootloader documents (GTL_BOOTLOADER.md in abiogenesis, SDLC_BOOTLOADER.md in genesis_sdlc) are hand-maintained markdown that reference graph types, asset names, edge chains, and evaluator semantics from the codebase — but no F_D evaluator checks them for consistency. When the graph changes, the bootloader drifts silently. This just happened: SDLC_BOOTLOADER.md referenced phantom assets (`basis_projections`, `design_recommendations`, `cicd`, `telemetry`) that never existed in `sdlc_graph.py`. The drift was caught by a human reading diffs, not by the system.

This is structurally identical to untested code: it works until it doesn't, and you find out too late. The bootloader is installed into every dependent project's CLAUDE.md — stale content means every LLM session operates against wrong constraints.

### Value Proposition

Make bootloader documents proper graph assets with F_D evaluators that check consistency against source-of-truth code:

- **GTL_BOOTLOADER.md** checked against `gtl/core.py` type names (Asset, Edge, Evaluator, F_D/F_P/F_H, etc.)
- **SDLC_BOOTLOADER.md** checked against `sdlc_graph.py` asset names, edge names, and zoom profiles

The bootloader becomes a convergence-tracked artifact: if the graph changes and the bootloader doesn't update, delta > 0 and the system tells you.

### Scope

**In abiogenesis (this project):**
- New asset: `bootloader_doc` (BOOTDOC-{SEQ}), lineage=[design]
- New edge: `design→bootloader_doc` with:
  - F_D evaluator `gtl_type_consistency`: parse type names from `gtl/core.py`, check they appear correctly in GTL_BOOTLOADER.md
  - F_P evaluator `synthesize_bootloader`: agent renders specification content into bootloader markdown
- New context: `specification_dir` pointing to the specification/ directory
- Modified join: the bootloader must be consistent before any downstream gate that installs it (the `code↔unit_tests` edge context already references the bootloader — but now the bootloader itself is convergence-tracked)

**Pattern for genesis_sdlc (downstream — not this project):**
- Same structure: `design→bootloader_doc` with F_D checking against `sdlc_graph.py`
- Join at `integration_tests`: sandbox install requires consistent bootloader since `genesis_sdlc.install` copies the bootloader into the target's CLAUDE.md

### Out of Scope

- Auto-generating bootloader content from code (F_P synthesizes, human approves)
- Changing the GTL_BOOTLOADER.md or SDLC_BOOTLOADER.md content in this intent (content is already correct post v0.5.0 fix)
- Modifying the install chain (bootloaders are still installed via marker-bounded blocks in CLAUDE.md)

### Success Criteria

1. `gen-gaps` reports `bootloader_doc` as an asset with delta > 0 when GTL_BOOTLOADER.md references a type name not in `gtl/core.py`
2. Changing a type name in `gtl/core.py` without updating the bootloader causes the F_D evaluator to fail
3. After the bootloader is updated and F_P assesses it, delta returns to 0
4. The pattern is replicable: genesis_sdlc can add the same asset type for SDLC_BOOTLOADER.md

---

## INT-003 — Spec-Build Boundary Cleanup for Multi-Worker

**Date**: 2026-03-21
**Status**: Draft

### Problem

The abiogenesis specification leaks build-specific implementation detail into the constitutional layer. A Codex build from the same spec surfaced 5 material gaps — all stemming from the spec assuming it will be built by Claude Code with Python tooling. This blocks any non-Claude worker from building against the spec.

Specific contradictions and defects:

1. **Tenant identity leak**: `Scope.build` defaults to `"claude_code"` in `domain_model.md` §2.3 and `commands.py`. The spec should be agent-neutral.
2. **Delta type contradiction**: `domain_model.md:198` defines `delta: int` (count), `convergence_model.md` defines `delta = failing / evaluators` (float). `schedule.py` implements float. The spec disagrees with itself.
3. **Evaluator safety rule too broad**: REQ-F-EVAL-001 AC-2 says "must not invoke genesis subcommands" but the package already uses `genesis check-tags`, `genesis check-req-coverage`, `genesis check-impl-coverage`, `genesis check-validates-coverage`, `genesis check-bootloader-consistency`. Real invariant: no orchestration re-entry, leaf predicates are fine.
4. **Context resolution fail-open**: `core.py:262` returns sentinel string `"[directory {path} exists but contains no readable files]"` instead of failing. Missing constitutional context is silently swallowed. Stale locators in the package compound this.
5. **False OL claim in bootloader**: `GENESIS_BOOTLOADER.md:411` says event logger "enforces OL schema" — there is no OL schema. ADR-005 says "simple JSON." The bootloader text is aspirational language in a constitutional document.
6. **Feature decomposition hardcodes Python modules**: `feature_decomposition.md` names specific `.py` files and Python module layout. A Codex/Java/Temporal build can't use this.
7. **Requirements embed CLI syntax**: REQ keys reference `python -m genesis`, `pytest`, and other Claude-build-specific commands as acceptance criteria.

### Value Proposition

Fix all 7 defects so the spec becomes genuinely constitutional — any worker (Claude, Codex, Gemini, Bedrock) can build a conformant engine from the same specification. This is the prerequisite for multi-worker orchestration.

Three-layer architecture:
- **Layer 1 (Spec)**: GTL Package — assets, edges, evaluator predicates, contexts. Tech-neutral.
- **Layer 2 (Orchestrator)**: abiogenesis engine — iterate(), schedule(), emit(), event stream. Shared.
- **Layer 3 (Build)**: Worker bindings, F_D command mappings, build-specific context resolution. Per-supplier.

### Scope

**Fix 1 — Neutral Scope**: Remove `"claude_code"` default from `Scope.build` in domain_model.md and commands.py. Worker resolution moves to build layer.

**Fix 2 — Delta type**: Change `delta: int` to `delta: float` in domain_model.md §2.4. Add explicit `failing_count`, `passing_count`, `evaluator_count` fields.

**Fix 3 — Evaluator boundary**: Rewrite REQ-F-EVAL-001 AC-2: forbid orchestration re-entry (`start`, `iterate`, `gaps`, `emit-event`), allow deterministic `check-*` leaf predicates.

**Fix 4 — Context fail-closed**: Replace sentinel return in `core.py` ContextResolver with hard failure. Emit `found{kind: context_gap}` on missing required context. Fix stale locators in package.

**Fix 5 — Bootloader OL claim**: Change "enforces OL schema" to "enforces prime operator schema" in GENESIS_BOOTLOADER.md.

**Fix 6 — Abstract feature decomposition**: Replace Python-specific module references with abstract capability descriptions. Module mapping moves to builds/.

**Fix 7 — Abstract requirements**: Replace CLI-specific acceptance criteria with behavior-level predicates. Concrete commands are build-specific bindings.

### Out of Scope

- OpenLineage adoption (deferred — add as projection layer when external lineage consumers exist)
- Multi-worker scheduling implementation (this intent makes it possible, doesn't implement it)
- AWS deployment (prove locally first)
- Delta normalization aggregation semantics (fix the type now, revisit `scope_delta` when multi-worker scheduling lands)

### Success Criteria

1. A second builder (Codex) can load the spec and build a conformant engine without encountering Claude-specific assumptions
2. `domain_model.md` and `convergence_model.md` agree on delta semantics
3. REQ-F-EVAL-001 permits `check-*` diagnostics, forbids orchestration re-entry
4. Missing context causes hard failure, not silent substitution
5. GENESIS_BOOTLOADER.md contains no false claims about event substrate
6. `feature_decomposition.md` is tech-neutral — no Python module names
7. Requirements express behavior, not CLI syntax

---

## INT-004 — Recursive Work Identity and Compositional Graphs

**Date**: 2026-03-24
**Status**: Draft
**Derived from**: Codex strategy `20260324T023507_STRATEGY_recursion-not-feature-routing-prime-structured-design.md`

### Problem

The V1 engine simplified work scheduling to `Job = Edge`. The scheduler walks edges, runs global evaluators, and reports convergence per edge. Feature identity appears only as an event annotation — events carry `(edge, feature)`, convergence certificates are keyed on `(edge, feature)`, and `project()` supports feature-scoped projection. But the scheduler creates one job per edge and evaluates convergence globally.

This means:
1. Adding new feature vectors to a converged workspace produces no delta. The engine reports "converged" even though no code exists for the new features. The spec-tier evaluators (req_coverage, module_coverage) catch coverage gaps, but the code-tier evaluators (impl_tags, tests_pass) check global properties — they cannot distinguish "feature X has code" from "some code exists."
2. There is no mechanism for recursive refinement. When a coarse edge (`design→code`) needs more structure, the only option is to redesign the entire graph. Zoom — expanding an opaque step into a richer subgraph while preserving the outer contract — is not supported.
3. Graphs are monolithic. Common patterns (requirements→design, code→test_evidence) must be duplicated in every Package. There is no compositional unit smaller than a full Package.

The original monolith design addressed all three through category-theoretic structure: zoom morphism, spawn/fold-back, graph fragments, named compositions, and child lineage. The split dropped this structural layer, leaving the event model richer than the scheduling model. The events know about work identity; the scheduler doesn't.

### Value Proposition

Restore the missing structural layer without changing the kernel primitive. The transport (`iterate()`) stays small and lawful. The topology (`Job`, `Edge`, `Package`) stays stable. What gets added is:

**1. Routed work identity** — `work_key` and `run_id`

Every unit of work has an immutable identity expressible as a lawful chain:

```
INT-001 / REQ-042 / build.design / module.auth
```

The chain IS the identity — no surrogate IDs. `work_key` is stable across time (used for projection and current-state derivation). `run_id` identifies one attempt on that work (used for retries, transactions, audit). The iterate signature becomes:

```python
iterate(job, work_key, run_id, ...)
```

Recursion is key refinement: `INT-001/REQ-042/build.design` spawns `INT-001/REQ-042/build.design/module.auth`. Fold-back is projection over descendant keys.

**2. Compositional graph fragments** — `Fragment`

A reusable subgraph unit that introduces assets, edges, and convergence surfaces while preserving interface contracts:

```python
Fragment(
    name="code_to_evidence",
    inputs=[code],           # required input assets
    outputs=[test_evidence], # produced output assets
    assets=[...],            # internal assets
    edges=[...],             # internal edges
)
```

Graph functions (`requirements_to_design()`, `code_to_test_evidence()`) are graph-valued — they compose lawfully into larger structures. This is the basis for interface boundaries, delayed specialisation, and interchangeable refinements.

**3. Zoom as lawful local refinement**

A previously opaque edge can be expanded into a richer subgraph:

```
Coarse:  design → code
Zoomed:  design → module_decomp → code_units → code
```

The outer graph still sees input compatible with `design` and output compatible with `code`. The zoomed graph makes explicit additional stages, assets, and convergence surfaces. The kernel doesn't change — refinement is local.

### Scope

**In scope (ABG kernel):**
- `work_key` as immutable hierarchical identity on `iterate()` and all event emission
- `run_id` as attempt identity for transaction/retry/audit
- `Fragment` as a GTL type: reusable compositional subgraph with input/output contracts
- Named graph functions: reusable graph-valued functions with explicit input/output interfaces (e.g., `requirements_to_design()`, `code_to_test_evidence()`)
- Fragment libraries: ordinary reusable structural assets, catalogued and importable across Packages
- Composition validation: interface satisfaction, DAG acyclicity, and type compatibility at spec-load time
- Zoom operation: expand an edge into a Fragment while preserving the outer contract
- Spawn/fold-back: create child work_keys, project descendant results into parent
- Event stream carries `work_key` and `run_id` on all events
- `project()` supports work_key-scoped projection
- `delta()` computable per work_key, not just per edge
- Scheduler creates work instances from (job, work_key) pairs, not just jobs

**Out of scope:**
- Strong intent engine (dynamic graph realisation from gap analysis) — future; the engine supports the model but the current planner uses a static hand-crafted graph
- Multi-worker scheduling across work instances — V1 is single worker
- Package distribution / registry
- Exotic named compositions (BROADCAST, FOLD, CONSENSUS, etc. — future; graph functions and Fragment libraries are in scope)

### Success Criteria

1. `iterate(job, work_key, run_id, ...)` — the kernel accepts work identity without changing the transport primitive
2. Adding a new feature vector to a converged workspace produces delta > 0 on code-tier edges for that feature's work_key
3. A Fragment can be defined, composed into a Package, and traversed by the engine
4. Zooming an edge into a Fragment preserves the outer edge contract — delta on the outer edge reflects delta on the inner subgraph
5. Events carry `work_key` and `run_id`; `project(stream, asset_type, work_key)` returns work-scoped state
6. Fold-back: parent work_key convergence is a projection over descendant work_key convergence
7. The kernel remains small — `iterate()` gains two parameters, not imperative special cases

---

## INT-005 — V2 Kernel Evolution: Run Governance and Leaf Tasks

**Date**: 2026-03-24
**Status**: Draft
**Derived from**: Codex strategy `20260324T112920_STRATEGY_recursion-prime-structured-v2-roadmap.md`

### Problem

INT-004 established the structural primitives: work identity, compositional graphs, zoom, spawn, fold-back. But the runtime still lacks two capabilities needed for the system to scale beyond single-shot F_P dispatch:

1. **Run governance is primitive.** Each F_P attempt has only two states: dispatched and assessed. There is no explicit lifecycle model. Transport failures, bad output, and certification failures are not distinguished. No retry semantics. No timeout governance. No pending deduplication beyond a basic fluent check. This means every failure mode is handled ad hoc by the skill/caller rather than constitutionally by the kernel.

2. **No bounded sub-work primitive.** Complex iterate() calls sometimes need narrow helper tasks — structured queries, schema transforms, validation checks — that are smaller than a full F_P dispatch but need more structure than inline code. Without a disciplined leaf-task surface, the engine either over-dispatches (full F_P for trivial work) or under-governs (inline code with no provenance).

### Value Proposition

**Run governance** makes the transport substrate reliable enough for higher-level recursive work. When the system can confidently distinguish "actor crashed" from "actor produced bad code" from "code exists but tests fail," it can make better retry and escalation decisions. This is the foundation for distributed saga-style coordination.

**Leaf tasks** give iterate() a disciplined way to dispatch bounded sub-work without bypassing graph traversal. Schema-driven, toolless by default, explicitly timed, and integrated with run governance. OpenClaw's `llm-task` validates this pattern — structured leaf work within a larger orchestration context.

### Scope

**In scope:**
- Explicit run lifecycle model: queued → started → dispatched → pending → assessed → converged | failed | timed_out | superseded
- Failure classification: transport_failure, no_output, bad_output, certification_failure
- Waiter deduplication: at most one pending dispatch per (work_key, edge)
- Retry with bounded backoff for transient transport failures
- Bounded leaf task primitive: schema-driven input/output, explicit timeout, toolless default
- Leaf task integration with run governance lifecycle
- Event stream records all lifecycle transitions
- Corrective operations: compensation (scoped revocation + corrective work) distinguished from administrative reset (scope-wide re-evaluation)
- Wildcard revocation replaced with work-lineage-scoped correction — event log remains truthful

**Out of scope:**
- Distributed coordination (saga) — INT-005 makes local law complete; distribution is a separate intent
- Dynamic graph realisation (intent engine) — INT-004 Phase 6
- Transport implementation specifics (subprocess, API, MCP) — governed by existing ADR-022

### Success Criteria

1. Every F_P dispatch attempt has a classifiable outcome: success, transport_failure, no_output, bad_output, certification_failure
2. Transport failures retry automatically up to a configurable bound — no manual re-dispatch for transient errors
3. Duplicate dispatch on the same (work_key, edge) returns the pending run_id, not a new dispatch
4. Pending runs time out after a configurable duration — no indefinite wait
5. A leaf task can be dispatched within iterate() with schema-validated input/output
6. Leaf task execution is governed by the same run lifecycle as F_P dispatch
7. All lifecycle transitions are visible in the event stream — the history of any run is reconstructable
8. Compensation (revocation + corrective work) and reset (scope-wide re-evaluation) are semantically distinct operations in the event stream
9. No corrective operation destroys event history — the log remains append-only and truthful
