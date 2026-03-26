# genesis — Intent

**Intent ID**: INT-001
**Date**: 2026-03-15
**Status**: Approved

---

## The Problem

AI-augmented software development lacks a clean, formal engine. The existing genesis engine (ai_sdlc_method v3.1.0) evolved organically — it works, but it is not GTL-first, it carries accumulated legacy, and it cannot be re-derived from first principles. There is no reference implementation that demonstrates the full AI SDLC asset graph from intent through to code+tests using the GTL type system as the constitutional language.

---

## What We Want

A clean, GTL-first implementation of abiogenesis as a Genesis 2.x engine — an AI SDLC engine that:

1. Defines the SDLC as a typed workflow graph (6 nodes, 5 vectors) in a GTL Module
2. Implements the convergence engine: `iterate()` drives candidates toward stability via three evaluator types (F_D deterministic, F_P agent, F_H human)
3. Grounds convergence projection in Event Calculus: five prime operators (`found`, `approved`, `assessed`, `revoked`, `intent_raised`), two fluents (`operative`, `certified`), three convergence models
4. Provides commands (`gen-start`, `gen-iterate`, `gen-gaps`) as named compositions over the engine
5. Enforces traceability from REQ keys through code to tests via tag enforcement
6. Binds convergence events to workflow provenance (version, spec_hash) to prevent stale assessment reuse
7. Is built by the current genesis engine using itself as bootstrap compiler (the GCC/C analogy)
8. Reaches a self-hosting gate: abiogenesis can build itself

The authored domain surface is `builds/claude_code/code/gtl_spec/packages/abiogenesis.py` — the GTL Module is the shipping domain declaration. `specification/` provides the constitutional intent, requirement, and design surfaces that govern it.

---

## Business Value

- **Proof of concept for GTL**: demonstrates that a complex system (the genesis engine itself) can be formally specified as a GTL Module and then built from that spec
- **Bootstrap independence**: once self-hosting, abiogenesis no longer depends on ai_sdlc_method for its own development
- **Reference implementation**: every future genesis build (Codex, Gemini, Bedrock, Java, Temporal) derives from this clean topology
- **GCC analogy materialised**: GTL = C, ai_sdlc_method = GCC 1.0, abiogenesis = GCC 1.1 — the language bootstraps its own compiler

---

## Success Criteria

1. Spec loadable: `python builds/claude_code/code/gtl_spec/packages/abiogenesis.py` describes the Module correctly
2. Engine runs `gen-start` on a fresh project and produces intent → requirements output
3. Engine traverses all 5 edges for a test feature vector, producing code + passing tests
4. All engine modules have unit + integration tests; test suite green
5. Sandbox E2E: fresh sandbox run creates working code+tests
6. Self-hosting gate: abiogenesis uses genesis to build its next iteration
7. Specification is authoritative: deleting `builds/claude_code/code/` and regenerating from `specification/` + `builds/claude_code/design/adrs/` produces an equivalent compiler

---

---

## Constitutional Precedence

Requirements derived from INT-004 through INT-007 (V2) supersede overlapping V1 wording from INT-001. Where V1 and V2 requirements describe the same surface, V2 governs. V1 behaviour is retained **only** as explicitly labeled degenerate cases within V2 requirements:

| Retained degenerate case | Meaning |
|--------------------------|---------|
| `work_key` absent | Global traversal — single WorkInstance per job, no work-key scoping |
| No `work_spawned` events | Static authored graph — no zoom, no fragment refinement |
| No fragment imports | Monolithic Package — all edges authored directly |
| No leaf tasks | Direct F_P dispatch — no bounded sub-work |
| Unscoped V1 events | Visible to global queries, invisible to work-key-scoped queries |

Any V1-only doctrine not listed as a degenerate case is **superseded** and must not be taught as active law. Legacy compatibility shims (e.g., wildcard revocation) are retained for replay of existing event streams but are not available for new work.

---

## INT-002 — Bootloader Documents as Graph Artifacts

**Date**: 2026-03-21
**Status**: Draft

### Problem

Bootloader documents (GTL_BOOTLOADER.md in abiogenesis, SDLC_BOOTLOADER.md in genesis_sdlc) are hand-maintained markdown that reference graph types, node names, vector chains, and evaluator semantics from the codebase — but no F_D evaluator checks them for consistency. When the graph changes, the bootloader drifts silently. This just happened: SDLC_BOOTLOADER.md referenced phantom nodes (`basis_projections`, `design_recommendations`, `cicd`, `telemetry`) that never existed in `sdlc_graph.py`. The drift was caught by a human reading diffs, not by the system.

This is structurally identical to untested code: it works until it doesn't, and you find out too late. The bootloader is consumed by downstream assistant sessions — stale content means those sessions operate against wrong constraints.

### Value Proposition

Make bootloader documents proper graph artifacts with F_D evaluators that check consistency against source-of-truth code:

- **GTL_BOOTLOADER.md** checked against the live GTL 2.x type surface (`Graph`, `Node`, `GraphVector`, `Module`, `Job`, `Role`, `Operator`, `Evaluator`, `Rule`, `F_D`, `F_P`, `F_H`)
- **SDLC_BOOTLOADER.md** checked against `sdlc_graph.py` node names, vector names, and refinement profiles

The bootloader becomes a convergence-tracked artifact: if the graph changes and the bootloader doesn't update, delta > 0 and the system tells you.

### Scope

**In abiogenesis (this project):**
- New node: `bootloader_doc`
- New vector: `design→bootloader_doc` with:
  - F_D evaluator `gtl_type_consistency`: parse type names from the live GTL 2.x surface, check they appear correctly in GTL_BOOTLOADER.md
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

1. `gen-gaps` reports `bootloader_doc` as a node with delta > 0 when GTL_BOOTLOADER.md references a type name not in the live GTL 2.x surface
2. Changing an exported GTL 2.x type without updating the bootloader causes the F_D evaluator to fail
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
- Explicit run lifecycle model: queued → started → dispatched → pending → assessed | failed | timed_out | superseded (convergence is edge-level via delta, not a run state)
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

---

## INT-006 — Functional Composition and Higher-Order Graph Programs

**Date**: 2026-03-24
**Status**: Draft
**Derived from**: Product scenario gap analysis (20260324T165057_PRODUCT_SCENARIOS_abg-gtl-first-10.md, Scenarios 11–14), Codex proposal (20260324T184835_PROPOSAL_functional-composition-evaluator-selection.md)
**Renewal path**: Current spec → product-owner scenarios → gap analysis → this intent (per SPEC_METHOD.md §Renewal Path)

### Problem

INT-004 introduced Fragment, zoom, and spawn as structural primitives for compositional graphs. The category-theoretic framing — where graphs are objects and graph functions are morphisms — was always the intended foundation. But the current implementation stops at structural reuse: Fragments are inline data in Package, there is no named graph function concept, no composition operator, no interface equivalence, and no mechanism for evaluator-driven selection among alternatives.

Product-owner scenario analysis exposed this gap concretely:

1. **Scenario 11**: A named discovery workflow should be expressible as a first-class graph function, not just "a Python function that happens to return a Fragment." The system should know its name, interface, and effects.

2. **Scenario 12**: The same graph function should be applicable at multiple sites in the graph with distinct work lineages. Currently possible by accident of structural matching, but not constitutionally guaranteed.

3. **Scenario 13**: Two graph functions should compose when the output interface of one satisfies the input interface of the other. No composition operator exists. Manual fragment assembly is the only option.

4. **Scenario 14**: Multiple graph functions with the same interface should be visible as candidates for the same edge. The engine should enumerate candidates; selection belongs to evaluators (F_D rule, F_P analysis, F_H judgment) or to business/intent logic above the engine. The current `find_fragment_for_edge()` returns first-match — selection is implicit and non-replayable.

The missing capability is not a feature — it is the functional core that the category-theoretic framing requires. Without it, GTL is a structural description language but not a functional programming language for workflows.

### Value Proposition

GTL becomes a **functional, interpreted language for composing deterministic, probabilistic, and judgment-bearing programs**:

- `GraphFunction` is a typed, named, reusable workflow program with explicit interface
- `Fragment` is the structural realization (the "compiled" form)
- ABG is the interpreter / convergence engine
- Evaluators and business logic remain above the interpreter — they select, the engine composes and applies

The functional core provides:

**1. Named graph functions with typed interfaces**

```python
GraphFunction(
    name="discovery_workflow",
    inputs=(intent,),
    outputs=(synthesized_results,),
    build=...,              # pure: () → Fragment
    effects=("probabilistic",),
)
```

A graph function is not a convenience wrapper. It is the unit of reuse, the unit of interface checking, and the unit of selection.

**2. Lawful composition**

```
compose(discovery_workflow, context_synthesis) → larger_workflow
```

Composition law: `left.outputs` satisfies `right.inputs`. The result preserves `left.inputs` and `right.outputs`. Validation at composition time, not runtime.

Composition invariants:
- **Associativity**: `compose(compose(f, g), h) ≡ compose(f, compose(g, h))` — grouping doesn't change the outer contract
- **Identity**: an identity graph function leaves the interface unchanged
- **Substitutability**: graph functions with equivalent interfaces are interchangeable at the contract boundary
- **Contract preservation**: composition refines internals but preserves the declared outer interface
- **Replayability**: composed structure is reconstructable from package truth + emitted events

**3. Higher-order combinators**

Sequential composition alone is insufficient. Workflow programs need:

```
compose(f, g)    — sequential: output of f feeds input of g
fan_out(f)       — apply f across a collection/vector
fan_in(r)        — reduce branch outputs into a synthesized result
gate(g)          — require a gate/reducer before promotion or continuation
promote(p)       — lift scalar output into vector/branchable structure
```

These are structural program combinators, not separate planners. They let GTL express:

```
intent_event → gate(consensus) → intent_vector
intent_vector → fan_out(discovery_workflow)
branch_results → fan_in(synthesize_results)
synthesized_results → promote(new_context)
```

**4. Composition-aware, selection-blind kernel**

The engine:
- Knows which graph functions exist (Package catalog)
- Validates interface compatibility
- Composes graph functions lawfully
- Enumerates candidates for an edge (replaces first-match)
- Applies whichever graph function the evaluator layer selects

The engine does NOT:
- Decide which graph function to use
- Rank candidates by business priority
- Apply implicit heuristics

Selection belongs to evaluators:

| Regime | Evaluator | Example |
|--------|-----------|---------|
| Deterministic rule | F_D | "If work carries `complexity:low`, use `light_discovery_workflow`" |
| Context analysis | F_P | "Analyze context and choose best-fit workflow" |
| Stakeholder choice | F_H | "Choose between alternatives for high-risk change" |

The Package may declare metadata (tags, complexity hints, interface-equivalent families) that evaluators consume. The kernel treats this as opaque declarative input — visible for enumeration, ignored for choice.

**5. Selection provenance**

Selection is external but must be replayable:

```
workflow_selected{edge, work_key, graph_function, selected_by, selection_mode, rationale?}
zoomed{edge, work_key, graph_function, fragment, internal_edges}
```

Replay law: which candidates existed is structural truth, which was chosen is event truth, which topology was applied is zoom truth.

### Scope

**In scope (GTL + ABG kernel):**
- `GraphFunction` as a first-class GTL type: name, inputs, outputs, build, effects, tags
- `Package.graph_functions` catalog surface
- `find_graph_functions_for_edge()` — candidate enumeration (replaces first-match)
- `compose_graph_functions(left, right)` — sequential composition with interface validation
- Composition laws: associativity, identity, substitutability, contract preservation, replayability
- Higher-order combinators: `fan_out`, `fan_in`, `gate`, `promote`
- Interface equivalence: two graph functions with matching (inputs, outputs) are interchangeable
- `workflow_selected` Tier 2 control event for selection provenance
- Zoom/apply operates on selected graph function, not first-match fragment
- Declarative selection surface in Package (tags, hints) — opaque to kernel, consumed by evaluators

**Out of scope:**
- Selection logic in the kernel — selection is evaluator/business concern
- Dynamic graph realisation (intent engine) — future, uses this infrastructure
- Distributed coordination — INT-005 + INT-006 make local law complete
- Package distribution / registry — graph functions are declared in Package, not imported from external registries (yet)

### Success Criteria

1. `GraphFunction` is a GTL type with explicit name, interface (inputs/outputs), and effects declaration
2. A graph function can be applied at an edge via zoom — the system records which function was applied
3. The same graph function can be applied at two different sites with independent work lineages
4. Two graph functions can be composed when left.outputs satisfies right.inputs — the composed result is a valid graph function
5. Composition validation rejects interface mismatches at composition time, not runtime
6. `find_graph_functions_for_edge()` returns all compatible candidates, not first-match
7. Selection is external — the kernel enumerates and validates, evaluators choose
8. `workflow_selected` event makes selection replayable from the event stream
9. Higher-order combinators (`fan_out`, `fan_in`, `gate`, `promote`) can express branching, reducing, gating, and promotion patterns
10. The kernel remains composition-aware and selection-blind — no business priority logic in the engine

---

## INT-007 — V2 Semantic Correction: Job, Role, Worker, and Run

**Date**: 2026-03-25
**Status**: Draft
**Derived from**: Product-owner gap analysis of V2 semantic incompleteness, Codex strategy `20260325T183500_STRATEGY_job-role-worker-requirement-cascade.md`
**Renewal path**: Current V2 spec → gap analysis → this intent correction (per SPEC_METHOD.md §Renewal Path)

### Problem

The current V2 requirement surface compresses `Job` and `Worker` too aggressively into runtime scheduling vocabulary. That loses important semantic structure:

1. A durable, semantically meaningful work contract still exists. "End of day liquidity calc" is not merely a queue item or one execution attempt. It is a named work contract that persists across time.

2. Capability class and concrete actor identity are not the same thing. "Code reviewer" or "liquidity calculator" is a semantic role. A specific agent, human approver, or service identity is the concrete worker.

3. Execution instance is distinct from both. One job may accumulate many runs over time. A run is where timing, outcome, retries, supersession, and execution truth live.

4. Authentication and authority resolution are outside the system boundary, but the semantic hooks are not. ABG must accept externally resolved identity/authority inputs and preserve them in provenance without turning GTL/ABG into an IAM system.

The current `REQ-R-ABG2-JOB-WORKER` is therefore constitutionally incomplete. It treats `Job` as a runtime unit and leaves no first-class GTL home for semantic job contracts or capability roles.

### Value Proposition

This correction restores a clean, durable model:

- `Job` in GTL: durable semantic work contract
- `Role` in GTL: semantic capability class required by a job or graph contract
- `Worker` in ABG: concrete actor identity
- `Run` in ABG: one execution instance of a job
- `Binding` in ABG: `Worker` binds to `Role`; `Run` realizes `Job`

This yields a model that matches real workflow systems without collapsing the language into the engine:

- GTL remains the semantic declaration layer
- ABG remains the semantic realization/execution layer
- authentication remains external
- authority resolution remains external
- identity and authority hooks remain first-class in provenance

### Scope

**In scope:**
- GTL first-class declaration of `Role`
- GTL first-class declaration of `Job`
- ABG first-class definition of `Worker` as concrete actor identity
- ABG first-class definition of `Run` as execution instance associated to a job
- ABG binding semantics: `Worker -> Role`, `Run -> Job`
- Explicit external boundary for authentication and authority resolution
- Provenance hooks: `job_id`, `run_id`, `worker_id`, `role`, `authority_ref`
- Module ownership of jobs and roles alongside graphs and graph functions

**Out of scope:**
- IAM design
- authentication protocols
- session/token/credential handling
- a full orchestration family (triggers, schedules, KPIs, windows)

This is a V2 semantic correction, not a V2.1 orchestration expansion.

### Success Criteria

1. The live intent and requirement surface distinguishes `Job`, `Role`, `Worker`, and `Run` without overlap or dual authority.
2. GTL can declare durable semantic jobs and required roles without importing runtime concepts.
3. ABG can bind concrete workers to roles and preserve that binding in run provenance.
4. A run is constitutionally defined as one execution instance associated to exactly one job.
5. Authentication is explicitly out of scope, while `worker_id` and `authority_ref` remain first-class hooks.
6. No active requirement remains that treats `Job` only as a runtime queue item or collapses `Role` into `Worker`.
