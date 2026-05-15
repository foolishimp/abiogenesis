# Abiogenesis — Product

**Product ID**: PROD-001
**Date**: 2026-04-03
**Status**: Draft
**Derives from**: INT-001, INT-005, INT-006, INT-007

---

## Purpose

This document defines the current product shape of abiogenesis as the GTL + ABG
product line.

It is a product-definition bridge surface. It exists to make the following
things explicit:

- what abiogenesis is releasing
- what GTL owns
- what ABG owns
- what belongs in mapping and product policy above them
- what a release is actually claiming
- where active product goals should live

It does not replace the live requirement surface. Requirements remain the
detailed constitutional law. This document stabilizes product identity, release
framing, and goal-setting above that requirement split.

---

## Product Statement

Abiogenesis is the reference product that ships:

- `GTL 3` as the declaration language for graph-native workflows
- `ABG 3` as the canonical interpreter, binding, traversal-control, and
  runtime-truth substrate for GTL
- mapping and provenance law that preserves the GTL to runtime boundary
- product-layer policy, qualification, and scenario surfaces that make the
  system operationally provable

The product is not a downstream domain workflow.
Downstream products are consumers and proving domains for GTL + ABG. They are
not the GTL + ABG product itself.

---

## LLM-First Product Identity

GTL is an LLM-first, graph-first algebraic language.

It is LLM-first because its product role is to give probabilistic constructors
a constrained program space rather than an unconstrained prompt surface. The
constructive surface is made from typed nodes, edge traversal contracts,
operators, evaluators, graph functions, modules, jobs, runtime policy hooks,
and proof obligations.

Abiogenesis relies on LLMs to construct GTL programs under specification
authority. It does not rely on hidden LLM reasoning as product truth.

The product split is:

- GTL declares the program algebra
- LLMs construct lawful GTL expressions within that algebra
- ABG admits, executes, records, projects, and proves traversals
- downstream domains own asset meaning, domain HOW, and acceptance
  interpretation

Graph functions are the primary published program form. A graph function is
product-real only when it is discoverable through a module or job surface,
materializable from declared inputs and policy-visible parameters, executable
through ABG, and replayable through event and provenance truth.

---

## Canonical GTL Topology Anchors

The canonical GTL topology-anchoring types are `Graph`, `Node`, `GraphVector`,
`GraphFunction`, `Job`, and `Module`.

These anchors do not exhaust the first-class GTL declaration surface. `Context`,
`Operator`, `Evaluator`, `Rule`, `RefinementBoundary`, `CandidateFamily`, and
`Role` remain first-class GTL declarations. They attach to, govern, refine, or
publish through the topology anchors without becoming rival public work
entrypoints. `ContractRef` is the job indirection to a published contract, not a
topology anchor or runtime execution target.

Downstream terms such as graph overlay, leaf, workflow lane, app surface, or
other product-local vocabulary are not canonical GTL type names. They must bind
back to a GTL topology anchor or first-class declaration surface before
declaring GTL or ABG behavior.

| Type | Product meaning | Boundary |
| --- | --- | --- |
| `Graph` | Named topology of nodes and graph vectors. | It is the structural materialization surface, not the public callable workflow carrier by itself. |
| `Node` | Typed local locus of graph meaning, invariant state, markov conditions, and optional asset-surface declaration. | It is not an executable workflow carrier, public work entrypoint, or graph function. |
| `GraphVector` | Invariant traversal boundary and internal adjacency record from source node set to target node. It carries transition-governance declarations including dispatch intent, evaluation policy, escalation policy, deterministic proof surfaces, closure contract, assurance hook refs, other hook refs, and opaque hook config. | It is not a rival public ontology, public callable carrier, or semantic job target. |
| `GraphFunction` | Primary published reusable workflow program. It has an explicit typed outer interface and cumulative environment contract, materializes a graph, and may realize one or more internal graph vectors. | It is not a node, not the materialized graph itself, not a runtime graph-call attempt, and not the downstream asset produced by an attempt. |
| `Job` | Durable semantic work contract over one or more published graph-function contracts. | It does not target bare graph vectors. |
| `Module` | Publication boundary for GTL declarations, including graphs, graph functions, refinement boundaries, candidate families, jobs, roles, operators, evaluators, rules, imports, metadata, and module-level policy hooks. | It is not runtime event truth and does not replace ABG projection. |

| First-class declaration | Product boundary |
| --- | --- |
| `Context` | Snapshot-bound constraint declaration carried by graph structure. It is language-owned declaration truth, not an engine-owned event or runtime fact. |
| `Operator` | Effectful work declaration with regime and binding. It is distinct from worker identity and concrete transport. |
| `Evaluator` | Convergence and attestation declaration. It checks or attests contract satisfaction; it does not perform work or emit runtime events by itself. |
| `Rule` | Passive declarative constraint over what must hold at a contract boundary. It is not enforcement strategy. |
| `RefinementBoundary` | Explicit lawful refinement or synthesis boundary that preserves an outer contract. It is not hidden selection strategy. |
| `CandidateFamily` | Published family of lawful alternatives over one outer contract. It exposes choices without deciding them in GTL. |
| `Role` | Semantic capability class for work, supervision, or approval. It is distinct from ABG `Worker` identity. |

A node may describe an asset surface that contains graph-function-related data,
such as a catalog, selector, or declaration file. That does not make the node a
`GraphFunction`. Public execution enters through published graph-function
carriers bound by jobs. ABG executes the call by advancing the realized internal
`GraphVector` boundaries beneath that carrier.

This boundary derives from `REQ-L-GTL3-GRAPH`, `REQ-L-GTL3-NODE`,
`REQ-L-GTL3-GRAPHVECTOR`, `REQ-L-GTL3-GRAPHFUNCTION`,
`REQ-L-GTL3-JOB`, `REQ-L-GTL3-MODULE`, `REQ-L-GTL3-CONTEXT`,
`REQ-L-GTL3-OPERATOR`, `REQ-L-GTL3-EVALUATOR`, `REQ-L-GTL3-RULE`,
`REQ-L-GTL3-ROLE`, `REQ-L-GTL3-SYNTHESIS`, `REQ-L-GTL3-LAWS`,
`REQ-L-GTL3-LANGUAGE`, and `REQ-R-ABG3-INTERPRET`.

---

## Probabilistic Compute Boundary

Abiogenesis treats one GTL edge traversal as the bounded unit of probabilistic
compute.

The edge declares the admissible external traversal space:

- input and output contract
- mandatory target carrier contract binding for the output surface
- required context
- role or capability expectation
- evaluator regime
- provenance obligation
- lawful stop, hold, gap, continuation, or completion states
- edge assurance contract when automated or probabilistic gain and closure are
  intended

GTL owns that lawful workflow structure.

Target carrier binding is mandatory at the effective graph-vector level. A
vector may declare a product-specific `gtl.target_carrier_contract`. If it does
not, the generic binding comes from visible GTL defaults config, not from code
constants, prompt prose, parser convention, or null. ABG consumes the selected
binding for payload admission, replay, projection, and closure preconditions.

ABG owns the governance and control truth around an invocation of that
traversal. It binds the traversal to a worker, tool, or agent; records events
and provenance; projects state; classifies outcomes; and advances only through
lawful next steps.

ABG is not the domain executor. The worker, tool, agent, or domain
implementation owns the internal HOW inside the declared traversal boundary.

For F_P work, any unconstrained space remains hidden internal traversal by the
probabilistic worker. GTL and ABG constrain the boundary and force the result
back through declared contracts, evaluator evidence, provenance, and control
state.

F_D is a deterministic evaluator or domain-owned optimization where the domain
can make part of the work precise. F_D does not move domain HOW into GTL or ABG.

If a GTL edge traversal does not declare an assurance function, the default
assurance regime is F_H by absentia. ABG must not infer automated closure from
worker output, file presence, runtime success, or absence of gaps. A human may
iterate over the open edge, perform direct worksite transformation, and declare
close or continuation. ABG owns the scoped observation, admission, replay, and
next lawful consequence of that human judgment.

### Outcome Compute Contract

ABG is the compact runtime motor for outcome compute.

Its primitive is one governed iteration over a current projection, cumulative
context, and evaluator set:

```text
iterate(
  current_surface_projection,
  cumulative_context,
  evaluators
) -> runtime_events
```

The current surface is a replay-derived projection over runtime truth. It is
not private mutable controller state.

The cumulative context is the declared constraint and history pressure
available to the traversal. It includes the edge contract, required context,
carried environment, prior edge evidence, intermediate ledgers, retry gap
dossiers, and current delta.

ABG does not certify a domain result merely because a worker produced an asset.
ABG admits lawful runtime events, projects the next current surface from those
events, and advances through declared evaluation, retry, continuation, hold,
gap, completion, or stop law.

Downstream products provide the graph function, domain contexts, evaluator
implementations, and worker bindings. ABG provides the replayable control loop
that makes outcome compute auditable and capable of lawful re-entry.

### Higher-Order F_P Construction Episodes

One edge traversal remains the bounded runtime unit of probabilistic compute.
ABG may also support a higher-order `F_P` construction episode that composes
those bounded invocations through event-sourced tail recursion:

```text
observe current linked asset state
-> evaluate admissible construction outcomes
-> admit one construction intent
-> invoke the selected graph function through ABG
-> project the runtime and asset delta
-> recur, yield progress, close, block, or escalate
```

The construction episode does not make ABG the domain strategy decider. The
product-owned `F_P` evaluator chooses the highest-value lawful outcome from the
declared graph/action catalog. ABG admits or rejects that evaluator intent,
binds it to graph-call, frame, continuation, lineage, event, ledger, and
projection truth, and exposes one public construction-progress projection.

F_D may optimize and reject mechanical defects under hard authority. When the
source authority has not disambiguated product meaning, F_D shall not force a
semantic failure or canonical output shape. It must surface ambiguity to the
`F_P` construction evaluator so the product layer can decide the next lawful
outcome.

---

## Product Layers

### 1. GTL

`GTL` is the language layer.

It owns the declaration-side truth for:

- graph structure and typed nodes
- vectors and outer contract boundaries
- operators, evaluators, and rules
- jobs and roles as semantic work declarations
- `GraphFunction` as the primary reusable workflow program
- edge traversal contracts as the admissible external space for probabilistic
  compute
- lawful composition, substitution, recursion, and higher-order graph operators
- module publication and engine-independence boundaries

GTL does not own runtime binding, transport policy, business-choice logic,
hidden worker reasoning, or product-layer release governance.

### 2. ABG

`ABG` is the canonical runtime governance and control layer.

It owns the runtime control truth for:

- lawful interpretation of GTL declarations
- graph-function materialization and selection application
- worker, binding, run, and lineage semantics
- event emission, projection, correction, and convergence
- outcome-compute iteration over current projections, cumulative context, and
  evaluator truth
- replayable provenance over traversal invocation and runtime identity
- transport invocation, result ingestion, and self-hosting control behavior

Runtime identity in ABG remains structured. Reporting projections such as
`build` must not overwrite canonical worker/backend/authority truth.

ABG does not own business policy, hidden domain logic, worker-internal HOW, or
the semantic definition of GTL itself.

### 3. Mapping

The mapping layer is the bridge between GTL constitutional truth and engine
realization.

It owns:

- preservation of GTL meaning into executable runtime surfaces
- capability-visible mapping boundaries
- graph-function and materialization provenance
- graph-derived bundle provenance where runtime traversal depends on derived
  structural surfaces

Mapping does not redefine GTL semantics and does not excuse ABG from lawful
runtime behavior.

### 4. Product Layer

The product layer sits above GTL, ABG, and mapping.

It owns:

- product policy
- qualification infrastructure
- installed substrate contracts
- scenario and proving surfaces
- release claims
- operator-facing product behavior above pure language/runtime law

This layer may consume GTL declarations and ABG runtime truth, but it must not
smuggle product policy down into the language or interpreter kernel.

## Installed Substrate Contract

Abiogenesis publishes an installer as product behavior.

The installer turns a released or source-bound ABG build into an installed
substrate inside an independent target workspace. That installed substrate is a
development product: downstream products may build over it, but it is not the
mutable abiogenesis source project.

The installed substrate must be inspectable from the target workspace. It must
publish:

- the `.abiogenesis/` substrate root
- install and installer manifests
- installed package identity and command bindings
- runtime identity, event roots, projection roots, and archive roots
- local method reference copies under `.abiogenesis/docs/standards/`
- a cold-agent-readable bootstrap surface

Installed standards are a tactical reference copy for the target workspace.
They make `workspace://.abiogenesis/docs/standards/...` references stable for
cold agents. They do not become the upstream source of shared method law when
the method itself is edited.

## Public Operator Contract

Abiogenesis publishes one public advancement and observation contract:

- `gen-start`
- `gen-gaps`

Those names are the public named-composition truth.

`gen-start` accepts one product-owned traversal request grammar:

- `scope`
- `target`
- `until`

The currently published target families are:

- `next`
- `graph_function:<published_handle>`
- `asset:<published_handle>` when the selected runtime publishes one operator
  asset registry and ownership surface

`graph_function:<published_handle>` must resolve through a published target
catalog to one canonical callable-carrier identity. It does not target raw
graph vectors, unpublished helpers, or implicit candidate-family choice.

`gen-gaps` is a read-only evaluator projection surface. It may expose
replay-derived open work, typed asset gaps, candidate completion or induction
recommendations, blocking reasons, the highest-ranked asset, the implicated
graph function, and ranking reasons from the same evaluator surface used for
construction action selection. It does not start traversal, append events, admit
construction intent, dispatch graph work, or own a retry loop.

`asset:<published_handle>` must resolve through one published operator asset
registry and ownership surface. That surface must publish the asset handle and
one governing traversal boundary. In the current ABG cut, the governing
boundary must resolve to one published graph-function carrier identity.
Unresolved, unowned, unsupported, or ambiguously owned asset handles fail
closed.

Their literal delivery spellings are adapter/build bindings, not rival product
law. Examples include:

- `python -m genesis start`
- `python -m genesis gaps`
- `genesis start`
- `genesis gaps`
- service or command wrappers such as `/gen-start`

Lower-level traversal and status hooks may still exist structurally where the
runtime or install line needs them, but they sit below the public operator
contract. They must not be taught as co-equal human commands beside
`gen-start` and `gen-gaps`.

Orthogonal control modes such as F_H proxying or root supervision are product
policy around `gen-start`. They are not members of the `scope + target + until`
request grammar.

The current public control-mode families are:

- `fh_mode`
- `root_mode`

Their current public values are:

- `fh_mode = direct | human-proxy`
- `root_mode = direct | supervised`

Both default to `direct`. Both are public control-mode truth above the adapter.
Literal bindings such as `--fh-mode` and `--root-mode` are delivery bindings
for those same mode families, not rival product law. In the current cut, both
mode families are lawful only when `gen-start` is operating with
`until = converged`.

The primary operator UX in the current product line is not a website.
Downstream products may present abiogenesis through a website, service, or
other shell, but the primary flexible operator surface is interactive work with
an agentic coder interface over the public contract.

In the current cut, that interactive operator surface is typically reached
through agentic coder CLIs such as:

- `claude`
- `codex`
- `gemini`

Those transports are delivery bindings over the same product truth. The core
operator loop is:

1. define or refine the current project assets and constraints
2. trigger `gen-start`
3. accept one truthful stop, hold, or gap signal from substrate truth
4. work interactively with the agent to remove one ambiguity, missing
   capability, or roadblock
5. run `gen-gaps` or inspect the current live/operator projection
6. trigger `gen-start` again

That loop is product truth. It must be projection over ABG truth rather than a
second controller or local runtime replacement in downstream wrappers.

---

## Product Boundary

Abiogenesis should be understood as a product with a clean boundary between its
constituent layers:

| Surface | Owns | Does not own |
| --- | --- | --- |
| `GTL` | language, graph law, reusable workflow structure, edge traversal contracts, outer contracts | runtime binding, transport, product policy |
| `ABG` | traversal governance, binding, runs, lineage, correction, provenance | business-choice logic, product policy, language semantics, worker-internal HOW |
| `Mapping` | faithful bridge from GTL to runtime realization | ad hoc semantic rewrite |
| `Product` | policy, qualification, scenarios, release shape, goals | hidden kernel semantics |

Within that boundary, ABG owns canonical run algebra, failure classification,
and event-emission law. Product policy, including CLI auto-loop behavior and
operator-facing summaries, must be projections over ABG truth rather than a
second semantic center.

The product boundary also separates abiogenesis from its downstream consumers:

- abiogenesis owns the GTL + ABG product
- downstream products own their domain truth and use abiogenesis as the
  language/runtime platform

---

## Current Product Shape

The current product should be read as:

- a graph-native workflow language, not a private configuration dialect
- a canonical traversal governance and runtime-truth substrate, not a
  domain-specific planner or executor
- a reference implementation and proving surface for graph-native product
  systems
- a platform that should support downstream products without leaking one
  downstream domain into the GTL or ABG core

Today that means:

- the primary release realization is `build_tenants/abiogenesis/typescript/`
- `build_tenants/abiogenesis/python/` is a paused released reference line
  retained for history, comparison, and compatibility evidence, not an active
  RC gate
- `build_tenants/abiogenesis/codex/` remains a paused alternate realization
- downstream proving domains are important evidence
  surfaces, but they are not the GTL + ABG product definition

## Research Product Lab Readiness

Abiogenesis may be used as a research product lab for downstream ODD-native
products when the downstream work starts from graph functions, typed assets,
ABG replay truth, and scenario proof rather than imperative framework
scaffolding.

The current TypeScript line is ready for SDLC.TS PoC entry under that boundary
after the T-072/T-074 engine-iteration correction:

- graph functions are the program surface
- ABG is the engine-owned traversal, event, projection, and proof substrate
- `start(...)` delegates to an M03-owned `start -> iterate` runner rather than
  to a downstream or harness-owned loop
- replayed F_P assessed-result truth advances re-entry without redispatching
  the already assessed edge
- gap observation remains read-only substrate truth
- gap triage and ticket creation remain downstream graph-function and product
  policy work
- extraction, synthesis, transform, fan-out, ambiguity, and gap-evaluation
  scenarios define the next proof obligations

This readiness is not a claim that SDLC.TS is already built, or that every
future ODD capability is complete. It is a claim that the substrate has enough
governed GTL/ABG truth to begin the PoC and expose remaining gaps through
requirements, design, tickets, and scenario evidence.

---

## Release Framing

A release of abiogenesis is not only a code cut.

A release claim should answer, at minimum:

1. What GTL language surface is current?
2. What ABG runtime surface is current?
3. What mapping/provenance surface preserves the GTL to runtime boundary?
4. Which realization is the released carrier?
5. What qualification and scenario evidence proves the claim?
6. Which downstream proving domains were in scope for the cut?

The purpose of this document in the release process is to define what the
release is releasing.

Release metadata, taps, and version identifiers remain separate release-process
surfaces. This document describes present product truth rather than release-line
history.

---

## Product Goals

Goals belong here because they are product-direction and release-focus
statements, not detailed requirement families.

Once a goal hardens into constitutional obligation, it should flow down into the
intent, requirement, design, code, and evidence surfaces.

### Active Goals

| Goal ID | Scope | Goal | Success Signal | Proving Surface | Status |
| --- | --- | --- | --- | --- | --- |
| `GOAL-001` | `GTL` + `ABG` + `Mapping` | Make cumulative environment an executable runtime law over real composed and recursive carriers, not only a static GTL contract. | ABG resolves per-boundary environment truth, late steps can read carried bindings from earlier steps, and missing internally produced bindings block dispatch rather than converging or silently running. | `test_m03_engine_kernel_integration.py`, `test_sandbox_usecases_fake.py`, `test_sandbox_usecases_live.py`, downstream `gsdlc_lite` proving routes | Active |
| `GOAL-002` | `GTL` + `ABG` + `Mapping` | Make typed asset surfaces operationally real at GTL boundaries and ABG bind time, so higher-order graph functions can consume returned assets by declared contract rather than by ad hoc path lore. | GTL nodes or graph-function boundaries can declare `asset_surface` truth for asset kind/schema, required carried contexts, and standards or output-contract refs; ABG resolves concrete bindings, specializes prompts and checks from that declaration, records source binding and producer provenance, and blocks dispatch when the declared asset contract is unresolved. | `test_m01_gtl_core_integration.py`, `test_m03_engine_kernel_integration.py`, `test_sandbox_usecases_fake.py`, downstream proving in `odd_method` and imported-workspace routes such as `data_mapper.*` | Active |

### Goal Template

Use the following shape for new goals:

| Goal ID | Scope | Goal | Success Signal | Proving Surface | Status |
| --- | --- | --- | --- | --- | --- |
| `GOAL-001` | `GTL` / `ABG` / `Mapping` / `Product` / mixed | Short statement of the product move | What would make it clearly true | Scenario, qualification lane, or downstream product that proves it | Proposed / Active / Closed |

### Goal Writing Rule

A product goal should say:

- which layer or layers it is trying to move
- why that move matters to the product as a whole
- what success looks like in observable terms
- what proving surface will show the goal is real

Goals should not be written as pseudo-requirements. They are directional product
statements that focus the next wave of requirement, design, implementation, and
qualification work.

---

## Product Consequence

With this definition in place, abiogenesis can be discussed more cleanly in
product terms:

- `INTENT.md` states why the product exists and what directional gaps matter
- `PRODUCT.md` states what the product currently is and what a release is
  claiming
- `requirements/` decomposes that product into constitutional obligations
- realization and qualification prove the product operationally

That is the intended role of this document.
