# Abiogenesis — Intent

**Intent ID**: INT-001
**Date**: 2026-03-15
**Status**: Approved

---

## The Problem

AI-augmented software development requires a clean, formal engine. The earlier
AI SDLC engine lineage (`ai_sdlc_method` v3.1.0) is effective, but it is not
GTL-first and it cannot be re-derived from first principles. There is no
reference implementation that demonstrates the full AI SDLC asset graph from
intent through to code+tests using the GTL type system as the constitutional
language.

---

## What We Want

A clean, GTL-first implementation of abiogenesis as the reference GTL + ABG engine — an AI SDLC engine that:

1. Defines the SDLC as a typed workflow graph (6 nodes, 5 vectors) in a GTL Module
2. Implements the convergence engine: `iterate()` advances the current projected surface under cumulative context and evaluator truth, emitting runtime events that drive candidates toward stability via three evaluator types (F_D deterministic, F_P agent, F_H human)
3. Grounds runtime truth in Event Calculus over authoritative events, runtime aggregates (`Run`, `GraphCall`, `Frame`, `Continuation`), and replay-derived fluents and projections
4. Provides public named operator compositions `gen-start` and `gen-gaps` over the engine, with `gen-start` expressed through `scope + target + until` and lower-level traversal primitives such as `iterate()` remaining below that public operator surface
5. Enforces traceability from REQ keys through code to tests via tag enforcement
6. Binds convergence events to workflow provenance (version, spec_hash) to prevent stale assessment reuse
7. Is built by the abiogenesis engine using itself as bootstrap compiler (the GCC/C analogy)
8. Reaches a self-hosting gate: abiogenesis can build itself
9. Supports the primary operator workflow as interactive work with an agentic coder surface, where an operator defines initial assets, triggers `gen-start`, receives one lawful stop or gap signal, removes one ambiguity or roadblock with the agent, runs gap analysis, and starts again without replacing ABG with a second local controller

The authored domain surface is `build_tenants/abiogenesis/python/code/gtl_spec/packages/abiogenesis.py` — the GTL Module is the shipping domain declaration. `specification/` provides the constitutional intent, requirement, and design surfaces that govern it.

---

## GTL as an LLM-First Algebraic Language

GTL is an LLM-first language because its graph algebra constrains
probabilistic construction.

The language gives an LLM a bounded program-construction space:

- typed nodes and asset surfaces
- edge traversal contracts
- operators, evaluators, and rules
- graph functions
- modules, jobs, and roles
- runtime policy hooks
- proof, provenance, and projection obligations

An LLM may construct a lawful GTL expression under specification authority.
It may not invent hidden execution law.

GTL supplies the algebraic program surface.
ABG admits the program, binds it to runtime identity and policy, executes the
traversal, records events, projects state, and preserves proof.
The domain owns asset meaning, domain HOW, acceptance interpretation, and
domain-specific operator or evaluator implementations.

Robustness comes from admitted carriers, explicit regime law, graph-function
publication, replayable provenance, and evaluator evidence. It does not come
from trusting hidden LLM reasoning.

---

## GTL / ABG Control Boundary

GTL and ABG define governance and control around probabilistic work, not the
hidden internal execution strategy of the worker.

The unit of probabilistic compute is one edge traversal.

A GTL edge declares the admissible external traversal space for that work:

- input and output contract
- required context
- role or capability expectation
- evaluator regime
- provenance obligation
- lawful stop, hold, gap, continuation, or completion states

ABG governs one invocation of that traversal. It binds the traversal to an
eligible worker, tool, or agent; preserves runtime truth; emits events; projects
state; classifies outcomes; and advances only through lawful next control
steps.

The worker, tool, agent, or domain implementation owns the internal HOW inside
the declared traversal boundary.

For F_P work, any unconstrained space remains the hidden constructive traversal
of the probabilistic worker. GTL and ABG constrain the boundary around that
work; they do not claim to own the latent reasoning path.

F_D is a deterministic evaluator or domain-owned optimization where the domain
can make part of the work precise. F_D evidence does not let the framework
absorb domain HOW as framework law.

If the framework starts prescribing domain solution strategy beyond the declared
edge contract and control truth, it has crossed the GTL / ABG boundary.

## ABG Outcome Compute Primitive

ABG is the compact runtime motor for outcome compute.

The engine primitive is:

```text
iterate(
  current_surface_projection,
  cumulative_context,
  evaluators
) -> runtime_events
```

The current surface is a replay-derived projection, not private mutable engine
state. The cumulative context is the declared, snapshot-bound constraint and
history pressure available to the traversal: source and target contracts,
required context, carried environment, prior edge evidence, intermediate
ledgers, retry gap dossiers, and current delta. Evaluators decide whether the
candidate projection is converged, blocked, retryable, held, or escalated.

`iterate()` does not make domain meaning true by returning an asset directly.
It emits lawful runtime events. ABG appends those events, derives the next
surface by projection, and then advances only through declared graph,
evaluation, continuation, retry, hold, or stop law.

This primitive is domain-neutral. Downstream products supply the graph
function, contexts, domain evaluators, and worker bindings. ABG supplies the
event-sourced control loop that makes the traversal replayable, auditable, and
capable of lawful re-entry.

When a downstream product declares a steel thread or dependency fan-out, that
declaration supplies product-owned content authority for lawful work. It does
not force a runtime concurrency shape. ABG may realize the same admitted work
serially or through bounded parallel branch dispatch when replay-derived
frontier truth, observed-state freshness, idempotency, branch leases, write
territory, and visible runtime policy make that safe. The product meaning,
dependency expectations, target/output declarations, evidence expectations, and
fan-in meaning remain stable across those realizations.

System parallelism keeps immutable semantic carriers and projections at the
center. Shared workspace mutation is treated as an effect boundary observed
through admitted state and publication truth, not as scheduler authority.

---

## Business Value

- **Proof of concept for GTL**: demonstrates that a complex system (the abiogenesis engine itself) can be formally specified as a GTL Module and then built from that spec
- **Bootstrap independence**: once self-hosting, abiogenesis depends on its own constitutional surface and bootstrap compiler for further development
- **Reference implementation**: every future GTL + ABG build (Codex, Gemini, Bedrock, Java, Temporal) derives from this clean topology
- **GCC analogy materialised**: GTL is the language, ai_sdlc_method is the earlier compiler lineage, and abiogenesis is the self-hosting compiler/runtime line

---

## Success Criteria

1. Spec loadable: `python build_tenants/abiogenesis/python/code/gtl_spec/packages/abiogenesis.py` describes the Module correctly
2. Engine runs `gen-start` on a fresh project and produces intent → requirements output
3. Engine traverses all 5 edges for a test feature vector, producing code + passing tests
4. All engine modules have unit + integration tests; test suite green
5. Sandbox E2E: fresh sandbox run creates working code+tests
6. Self-hosting gate: abiogenesis uses abiogenesis to build its next iteration
7. Specification is authoritative: deleting `build_tenants/abiogenesis/python/code/` and regenerating from `specification/` + `build_tenants/abiogenesis/python/design/adrs/` produces an equivalent compiler
8. The primary operator loop is lawful and usable: an operator can define initial assets, run `gen-start`, receive a truthful stop or gap signal, work interactively with the agent to remove ambiguity or a roadblock, run `gen-gaps`, and run `gen-start` again without inventing a second runtime model

---

---

## Constitutional Consistency

Active requirements are present-tense constitutional truth. Overlap or conflict between active requirements is illegal and must be resolved in the corpus itself.

Current degenerate cases are explicit law:

| Declared degenerate case | Meaning |
|--------------------------|---------|
| `work_key` absent | Global traversal — single WorkInstance per job, no work-key scoping |
| No `work_spawned` events | Static authored graph — no zoom, no fragment refinement |
| No fragment imports | Monolithic Package — all edges authored directly |
| No leaf tasks | Direct F_P dispatch — no bounded sub-work |
| Events without `work_key` | Visible to global queries, invisible to work-key-scoped queries |

---

## INT-002 — Bootloader Documents as Graph Artifacts

**Date**: 2026-03-21
**Status**: Approved

### Problem

Bootloader documents such as GTL_BOOTLOADER.md and downstream domain
bootloader surfaces are hand-maintained markdown that reference graph types,
node names, vector chains, and evaluator semantics from the codebase, but no
F_D evaluator checks them for consistency. When the graph changes, the
bootloader can drift silently.

This is structurally identical to untested code: it works until it doesn't, and you find out too late. The bootloader is consumed by downstream assistant sessions — stale content means those sessions operate against wrong constraints.

### Value Proposition

Make bootloader documents proper graph artifacts with F_D evaluators that check consistency against source-of-truth code:

- **GTL_BOOTLOADER.md** checked against the live GTL 3 type surface (`Graph`, `Node`, `GraphVector`, `Module`, `Job`, `Role`, `Operator`, `Evaluator`, `Rule`, `F_D`, `F_P`, `F_H`)
- **Downstream bootloader surfaces** checked against their live node names, vector names, and refinement profiles

The bootloader becomes a convergence-tracked artifact: if the graph changes and the bootloader doesn't update, delta > 0 and the system tells you.

### Scope

**In abiogenesis (this project):**
- New node: `bootloader_doc`
- New vector: `design→bootloader_doc` with:
  - F_D evaluator `gtl_type_consistency`: parse type names from the live GTL 3 surface, check they appear correctly in GTL_BOOTLOADER.md
  - F_P evaluator `synthesize_bootloader`: agent renders specification content into bootloader markdown
- New context: `specification_dir` pointing to the specification/ directory
- Modified join: the bootloader must be consistent before any downstream gate that installs it (the `code↔unit_tests` edge context already references the bootloader — but now the bootloader itself is convergence-tracked)

**Pattern for downstream domain installers (not this project):**
- Same structure: `design→bootloader_doc` with F_D checking against the live downstream graph surface
- Join at `integration_tests`: sandbox install requires consistent bootloader when the downstream installer copies that bootloader into the target's `CLAUDE.md`

### Out of Scope

- Auto-generating bootloader content from code (F_P synthesizes, human approves)
- Changing the GTL_BOOTLOADER.md or downstream bootloader content in this intent (content is already correct post v0.5.0 fix)
- Modifying the install chain (bootloaders are still installed via marker-bounded blocks in CLAUDE.md)

### Success Criteria

1. `gen-gaps` reports `bootloader_doc` as a node with delta > 0 when GTL_BOOTLOADER.md references a type name not in the live GTL 3 surface
2. Changing an exported GTL 3 type without updating the bootloader causes the F_D evaluator to fail
3. After the bootloader is updated and F_P assesses it, delta returns to 0
4. The pattern is replicable: downstream products can add the same asset type for their own bootloader surfaces

---

## INT-003 — Spec-Build Boundary Cleanup for Multi-Worker

**Date**: 2026-03-21
**Status**: Approved

### Problem

The abiogenesis specification must not leak build-specific implementation detail into the constitutional layer. Worker-specific assumptions prevent conformant builds across different workers and runtimes.

Specific contradictions and defects:

1. **Tenant identity leak**: `Scope.build` defaults to `"claude_code"` in `domain_model.md` §2.3 and `commands.py`. The spec should be agent-neutral.
2. **Delta type contradiction**: `domain_model.md:198` defines `delta: int` (count), `convergence_model.md` defines `delta = failing / evaluators` (float). `schedule.py` implements float. The spec disagrees with itself.
3. **Evaluator safety rule too broad**: the evaluator boundary must forbid orchestration re-entry while still allowing deterministic `check-*` leaf predicates.
4. **Context resolution fail-open**: `core.py:262` returns sentinel string `"[directory {path} exists but contains no readable files]"` instead of failing. Missing constitutional context is silently swallowed. Stale locators in the package compound this.
5. **False OL claim in bootloader**: `GENESIS_BOOTLOADER.md:411` says event logger "enforces OL schema" — there is no OL schema. ADR-005 says "simple JSON." The bootloader text is aspirational language in a constitutional document.
6. **Feature decomposition hardcodes Python modules**: `feature_decomposition.md` names specific `.py` files and Python module layout. A Codex/Java/Temporal build can't use this.
7. **Requirements embed CLI syntax**: REQ keys reference `python -m genesis`, `pytest`, and other Claude-build-specific commands as acceptance criteria.

### Value Proposition

Remove these defects so the specification remains constitutional and any worker (Claude, Codex, Gemini, Bedrock) can build a conformant engine from the same specification. This is a prerequisite for multi-worker orchestration.

Three-layer architecture:
- **Layer 1 (Spec)**: GTL Package — assets, edges, evaluator predicates, contexts. Tech-neutral.
- **Layer 2 (Orchestrator)**: abiogenesis engine — iterate(), schedule(), emit(), event stream. Shared.
- **Layer 3 (Build)**: Worker bindings, F_D command mappings, build-specific context resolution. Per-supplier.

### Scope

**Fix 1 — Neutral Scope**: Remove `"claude_code"` default from `Scope.build` in domain_model.md and commands.py. Worker resolution moves to build layer.

**Fix 2 — Delta type**: Change `delta: int` to `delta: float` in domain_model.md §2.4. Add explicit `failing_count`, `passing_count`, `evaluator_count` fields.

**Fix 3 — Evaluator boundary**: Forbid orchestration re-entry (`start`, `iterate`, `gaps`, `emit-event`), allow deterministic `check-*` leaf predicates.

**Fix 4 — Context fail-closed**: Replace sentinel return in `core.py` ContextResolver with hard failure. Emit `found{kind: context_gap}` on missing required context. Fix stale locators in package.

**Fix 5 — Bootloader OL claim**: Change "enforces OL schema" to "enforces prime operator schema" in GENESIS_BOOTLOADER.md.

**Fix 6 — Abstract feature decomposition**: Replace Python-specific module references with abstract capability descriptions. Module mapping moves to build_tenants/.

**Fix 7 — Abstract requirements**: Replace CLI-specific acceptance criteria with behavior-level predicates. Concrete commands are build-specific bindings.

### Out of Scope

- OpenLineage adoption (deferred — add as projection layer when external lineage consumers exist)
- Multi-worker scheduling implementation (this intent makes it possible, doesn't implement it)
- AWS deployment (prove locally first)
- Delta normalization aggregation semantics (fix the type now, revisit `scope_delta` when multi-worker scheduling lands)

### Success Criteria

1. A second builder (Codex) can load the spec and build a conformant engine without encountering Claude-specific assumptions
2. `domain_model.md` and `convergence_model.md` agree on delta semantics
3. Evaluator law permits `check-*` diagnostics and forbids orchestration re-entry
4. Missing context causes hard failure, not silent substitution
5. GENESIS_BOOTLOADER.md contains no false claims about event substrate
6. `feature_decomposition.md` is tech-neutral — no Python module names
7. Requirements express behavior, not CLI syntax

---

## INT-004 — Recursive Work Identity and Compositional Graphs

**Date**: 2026-03-24
**Status**: Approved
**Derived from**: Codex strategy `20260324T023507_STRATEGY_recursion-not-feature-routing-prime-structured-design.md`

### Problem

The system requires work identity, recursive refinement, and compositional graph structure as first-class law.

Without that structure:
1. Convergence cannot be scoped to a durable work contract. New feature vectors can exist without producing delta on the specific work they require.
2. Coarse boundaries such as `design→code` cannot be lawfully refined into richer inner structure while preserving their outer contract.
3. Common workflow patterns such as `requirements→design` and `code→test_evidence` cannot be reused as compositional units.

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

The outer graph still sees input conforming to `design` and output conforming to `code`. The zoomed graph makes explicit additional stages, assets, and convergence surfaces. The kernel doesn't change — refinement is local.

### Scope

**In scope (ABG kernel):**
- `work_key` as immutable hierarchical identity on `iterate()` and all event emission
- `run_id` as attempt identity for transaction/retry/audit
- `Fragment` as a GTL type: reusable compositional subgraph with input/output contracts
- Named graph functions: reusable graph-valued functions with explicit input/output interfaces (e.g., `requirements_to_design()`, `code_to_test_evidence()`)
- Fragment libraries: ordinary reusable structural assets, catalogued and importable across Packages
- Composition validation: interface satisfaction, DAG acyclicity, and type conformance at spec-load time
- Zoom operation: expand an edge into a Fragment while preserving the outer contract
- Spawn/fold-back: create child work_keys, project descendant results into parent
- Event stream carries `work_key` and `run_id` on all events
- `project()` supports work_key-scoped projection
- `delta()` computable per work_key, not just per edge
- Scheduler creates work instances from (job, work_key) pairs, not just jobs

**Out of scope:**
- Strong intent engine (dynamic graph realisation from gap analysis)
- Multi-worker scheduling across work instances beyond the single-worker case
- Package distribution / registry
- Exotic named compositions (BROADCAST, FOLD, CONSENSUS, etc.); graph functions and Fragment libraries are in scope

### Success Criteria

1. `iterate(job, work_key, run_id, ...)` — the kernel accepts work identity without changing the transport primitive
2. Adding a new feature vector to a converged workspace produces delta > 0 on code-tier edges for that feature's work_key
3. A Fragment can be defined, composed into a Package, and traversed by the engine
4. Zooming an edge into a Fragment preserves the outer edge contract — delta on the outer edge reflects delta on the inner subgraph
5. Events carry `work_key` and `run_id`; `project(stream, asset_type, work_key)` returns work-scoped state
6. Fold-back: parent work_key convergence is a projection over descendant work_key convergence
7. The kernel remains small — `iterate()` gains two parameters, not imperative special cases

---

## INT-005 — Run Governance and Leaf Tasks

**Date**: 2026-03-24
**Status**: Approved
**Derived from**: Codex strategy `20260324T112920_STRATEGY_recursion-prime-structured-v2-roadmap.md`

### Problem

The runtime requires two additional capabilities to scale beyond single-shot F_P dispatch:

1. **Run governance still has more than one semantic center.** The runtime now contains pieces of a richer lifecycle model, but active intent, requirements, design, and implementation still teach overlapping doctrines. Successful certification, failed certification, substrate failure, and control-plane handling are not all projected from one canonical algebra. Event ownership is also split between the declared `emit()` boundary and traversal-local write behavior. As long as those parallel centers remain, the runtime can drift back toward partial or boolean semantics even after local refactors.

2. **Leaf-task and control-plane surfaces inherit the same split doctrine.** Bounded sub-work and auto-loop control already exist as surfaces, but they still depend on mixed caller-local taxonomy and summaries. Without one algebraic center, leaf dispatch and CLI policy can reintroduce the very compromise the core is trying to remove.

### Value Proposition

**Run governance** becomes a total algebraic core instead of a collection of partial conventions. When the system can project truthful run state from one canonical center, it can distinguish substrate failure, missing output, contract failure, and failed certification without forcing callers to reinterpret events locally. That makes retry, supersession, recursion, and operator reporting lawful instead of ad hoc.

**Leaf tasks** remain a disciplined bounded sub-work primitive, but they now inherit the same failure algebra and event-emission boundary as parent F_P dispatch. This keeps the kernel small while removing the semantic debt that previously let helper surfaces drift away from the core.

### Scope

**In scope:**
- Explicit total run lifecycle model with terminal states `completed`, `failed`, `timed_out`, `superseded` and non-terminal states `queued`, `started`, `dispatched`, `pending`
- Failure classification: `transport_failure`, `no_output`, `contract_failure`, `certification_failure`
- Live run status projection over engine event truth plus declared artifact surfaces
- Supervised probabilistic dispatch and supervised root control as published ABG capabilities for long-running constructive work
- Waiter deduplication: at most one pending dispatch per (work_key, edge)
- Retry with bounded backoff for transient transport failures
- Bounded leaf task primitive: schema-driven input/output, explicit timeout, toolless default
- Leaf task integration with the same run-governance failure algebra and emission boundary
- Event stream records all lifecycle transitions and evaluator facts without collapsing them into one undifferentiated success/failure state
- One lawful event-emission boundary: `emit()`; storage append remains internal to the event substrate
- CLI/control-plane outputs as product-policy projections over canonical run truth, not as independent boolean lifecycle stories
- Corrective operations: compensation (scoped revocation + corrective work) distinguished from administrative reset (scope-wide re-evaluation)
- Work-lineage-scoped correction — event log remains truthful

**Out of scope:**
- Distributed coordination (saga) beyond local run governance
- Dynamic graph realisation (intent engine)
- Transport implementation specifics (subprocess, API, MCP) — governed by existing ADR-022

### Success Criteria

1. Successful F_P certification projects to `run_completed` after assessment, proof, and closure, not generic `assessed`
2. Failed F_P certification projects to `failed(certification_failure)`, not successful terminal truth
3. Subprocess timeout, crash, or nonzero exit classify as `transport_failure` unless ABG can deterministically validate and ingest a preserved authoritative result artifact for the same boundary
4. Long-running constructive work is governed by a progress lease over observable runtime facts, not by wall-clock alone
5. Operators can inspect live state without tailing raw event logs
6. Duplicate dispatch on the same `(work_key, edge)` returns the pending `run_id`, not a new dispatch
7. A leaf task can be dispatched within `iterate()` with schema-validated input/output and the same failure algebra as parent dispatch
8. No handled failed dispatch can surface as "not handled" in the control plane
9. All lifecycle transitions are visible in the event stream — the history of any run is reconstructable
10. Compensation and reset remain semantically distinct operations in the event stream
11. No corrective operation destroys event history — the log remains append-only and truthful

---

## INT-006 — GraphFunction Composition, Lawful Refinement, and Higher-Order Graph Programs

**Date**: 2026-03-24
**Status**: Draft
**Derived from**: Product scenario gap analysis (20260324T165057_PRODUCT_SCENARIOS_abg-gtl-first-10.md, Scenarios 11–14), Codex proposal (20260324T184835_PROPOSAL_functional-composition-evaluator-selection.md)

### Problem

GTL requires one clear algebraic center for reusable workflow computation.

`GraphFunction`, `compose`, `substitute`, `recurse`, and the higher-order operators must all be understood as consequences of one reusable compute abstraction.

That gap shows up concretely in authoring:

1. `g1().g2().g3()` must be lawful workflow composition, not ad hoc structural assembly.
2. A graph function such as `g3 : A -> X` must be allowed to refine internally into `A -> W -> X` while preserving its outer contract to the caller.
3. Recursion, fan-out, fan-in, gating, and promotion should derive from the same graph-function algebra rather than be treated as unrelated features.
4. Consumer-specific synthesis and selection must remain outside ABG business logic while still being lawfully declared, applied, and replayed.

Without that center, GTL remains structurally expressive but underspecified as a functional programming language for workflows.

Published graph functions, lawful materialization, and runtime provenance are part of that center. A graph function is first-class only when it is discoverable, materializable from declared inputs and profiles, and preserved in runtime provenance together with any graph-derived companion bundles.

### Value Proposition

GTL becomes a functional, interpreted workflow language whose primary reusable compute unit is `GraphFunction`.

Semantically:

```text
GraphFunction : A -> Workflow[B]
```

This is an algebraic reading, not a mandatory runtime type. It means:

- `GraphFunction` is the reusable workflow program
- lawful composition is the primary means of building larger workflows
- lawful substitution/refinement preserves declared outer contracts
- recursion and higher-order operators are derived from the same center
- ABG remains the interpreter/runtime, not the owner of business logic

The model provides:

**1. GraphFunction as the primary reusable compute abstraction**

`GraphFunction` is not a helper wrapper around graph construction.

It is:
- the unit of reuse
- the unit of interface checking
- the unit of lawful composition
- the unit of lawful refinement

**2. Lawful composition**

`g1().g2().g3()` is the normal authoring shape when interfaces align.

Composition laws include:
- identity
- associativity as semantic equivalence of outer contract and lawful composition truth
- contract preservation
- replayability

**3. Lawful local refinement**

If:

```text
g3 : A -> X
```

then `g3` may lawfully refine internally into:

```text
A -> W -> X
```

for example through `g4().g5()`, so long as the caller still sees the same outer `A -> X` contract.

This is lawful substitution, not arbitrary graph mutation.

**4. Traversal remains an ABG runtime concern**

The runtime unit is traversal of an invocation, not the algebra itself.

The causal chain is:

```text
Traversal -> GapEvent -> IntentVector -> Gate / Evaluation -> Next lawful action
```

GTL declares structure and lawful boundaries.
ABG realizes traversal, event emission, lineage, and provenance.

ABG also owns the deterministic protocol of gap triggering, escalation, and replayable traceability.

What counts as a gap for a particular contract remains domain-defined through evaluator bindings and domain-specific logic supplied through the GTL declaration surface.

The same protocol must hold whether one evaluator or an explicit evaluator set observes the boundary. A vector of evaluator outcomes may itself be the convergence surface. GTL declares the topology, evaluator hooks, and policy-visible boundaries by which domains plug in their prompts or programs. ABG executes the rounds deterministically and records the trace without owning the domain semantics.

**5. Consumer-pluggable synthesis without business logic in ABG**

When a coarse contract is insufficient, GTL must be able to declare a lawful synthesis/refinement point where consumer logic can produce or select an interface-conformant inner graph.

ABG may host the callback and record provenance.
ABG must not contain hidden business-choice logic.

**6. First-class publication and materialization**

`GraphFunction` is first-class only when:

- modules publish graph functions as discoverable reusable surfaces
- graph functions materialize lawfully from declared authority inputs and profiles
- engines preserve graph-function and materialization provenance at runtime
- graph-derived companion bundles such as target subgraphs or evaluator bundles can be derived from the same published graph-function truth without displacing graph as the primary structural type

### Scope

**In scope (GTL + ABG boundary):**
- `GraphFunction` as the primary reusable compute abstraction
- lawful composition with explicit interface validation
- policy-visible structural parameterization, including named materialization profiles where a domain needs them
- first-class publication of graph functions from modules and imported libraries
- lawful graph-function materialization from declared inputs, profiles, and policy-visible structural parameters
- runtime-visible graph-function and materialization provenance
- graph-derived companion bundles, such as selected subgraphs or evaluator bundles, derived from published graph-function truth
- lawful substitution preserving outer contract
- bounded recursive graph-function application
- higher-order graph operators derived from the same graph-function algebra
- explicit vector/harvest boundaries over evaluator or candidate sets, with domain-defined merge semantics
- declarative synthesis/refinement points with explicit interface constraints
- replayable selection/application truth when externally supplied logic chooses or synthesizes a refinement

**Out of scope:**
- business-choice logic embedded in ABG
- one mandatory implementation shape for synthesis declarations
- target-engine mapping work beyond the current ABG runtime
- committing the public API to one representation before the design phase closes

### Success Criteria

1. `GraphFunction` is treated as the primary reusable GTL compute abstraction with explicit outer interface and declared effects
2. Sequential graph-function composition is lawful when interfaces align and invalid when they do not
3. Local refinement preserves the outer contract seen by the caller even when internal structure changes
4. Recursion is declarable, bounded, and traceable
5. Higher-order operators preserve interface/type truth and derive from the same compositional center
6. GTL can declare lawful synthesis/refinement points without embedding business-choice logic in ABG
7. Selection and refinement remain replayable through structural declarations plus event/provenance truth
8. One or more evaluators may observe the same contract boundary, producing a replayable convergence vector without moving domain semantics into ABG
9. Named materialization profiles and explicit harvest boundaries can be declared without moving profile or merge semantics into ABG
10. Published graph functions are discoverable and importable as first-class reusable surfaces
11. Graph-function materialization is replayable from declared inputs, profiles, and provenance truth rather than ambient interpreter state
12. Runtime provenance can answer which published graph function and which materialization produced the graph or graph-derived bundle that ABG executed

---

## INT-007 — Semantic Separation of Job, Role, Worker, and Run

**Date**: 2026-03-25
**Status**: Approved
**Derived from**: Product-owner gap analysis of job/role/worker/run semantics, Codex strategy `20260325T183500_STRATEGY_job-role-worker-requirement-cascade.md`

### Problem

The system requires a clean separation between semantic work contracts, semantic capability classes, concrete actor identities, and execution instances.

Without that separation:

1. A durable, semantically meaningful work contract still exists. "End of day liquidity calc" is not merely a queue item or one execution attempt. It is a named work contract that persists across time.

2. Capability class and concrete actor identity are not the same thing. "Code reviewer" or "liquidity calculator" is a semantic role. A specific agent, human approver, or service identity is the concrete worker.

3. Execution instance is distinct from both. One job may accumulate many runs over time. A run is where timing, outcome, retries, supersession, and execution truth live.

4. Authentication and authority resolution are outside the system boundary, but the semantic hooks are not. ABG must accept externally resolved identity/authority inputs and preserve them in provenance without turning GTL/ABG into an IAM system.

Without that separation, provenance loses semantic clarity and the language/engine boundary becomes unstable.

### Value Proposition

The model is:

- `Job` in GTL: durable semantic work contract
- `Role` in GTL: semantic capability class required by a job or graph contract
- `Worker` in ABG: concrete actor identity
- `Run` in ABG: one execution instance of a job
- `Binding` in ABG: `Worker` binds to `Role`; `Run` realizes `Job`

This yields a model that matches real workflow systems without collapsing the language into the engine:

- GTL remains the semantic declaration layer
- ABG remains the semantic realization and control layer
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

This intent defines the semantic separation itself, not a broader orchestration expansion.

### Success Criteria

1. The live intent and requirement surface distinguishes `Job`, `Role`, `Worker`, and `Run` without overlap or dual authority.
2. GTL can declare durable semantic jobs and required roles without importing runtime concepts.
3. ABG can bind concrete workers to roles and preserve that binding in run provenance.
4. A run is constitutionally defined as one execution instance associated to exactly one job.
5. Authentication is explicitly out of scope, while `worker_id` and `authority_ref` remain first-class hooks.
6. No active requirement remains that treats `Job` only as a runtime queue item or collapses `Role` into `Worker`.
