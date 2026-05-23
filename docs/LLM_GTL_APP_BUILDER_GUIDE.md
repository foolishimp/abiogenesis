# LLM GTL App Builder Guide

**Status**: Current compressed technical GTL 3 / ABG 3.8.0-rc.5 guide for LLMs
**Audience**: LLM agentic coders and agent bootstraps building GTL/ABG domain apps
**Purpose**: Compress the human GTL/ABG guide into the ontology, operating rules, fail-closed constraints, and language-specific syntax needed by LLM agents

## Position

This is the first GTL/ABG document to give an LLM that must build, modify, or
operate a GTL/ABG app.

The live guide model has two guides:

- `USER_GUIDE.md` is the single human guide.
- this guide is the compressed technical bootstrap for LLM agents.

This guide should be concise, action-oriented, and safe to load into an agent
context. It should state the ontology, authority split, operating rules, and
minimum syntax needed for correct construction.

This guide compresses:

- what GTL is
- what ABG is
- what a GTL/ABG app boundary contains
- what the builder authors
- what ABG owns
- how graph functions become the constructive carrier
- how runtime truth is emitted, replayed, projected, proved, and closed
- how to run the current public kernel loop

It does not replace the human guide.

This guide is secondary truth beneath `specification/PRODUCT.md` and the live
requirement surface. If this guide conflicts with product or requirement law,
repair this guide; do not reinterpret the product from the compressed guide.

It should not become a tutorial, narrative explainer, or complete language
reference.

This guide is not `ODD_METHOD.md`.

Use this guide first when priming an LLM for GTL/ABG ontology and operation.

Use `ODD_METHOD.md` next when the product must be authored as an ODD product.

Then read the local product authority surfaces.

For an ODD-shaped product such as `odd_sdlc`, the read order is:

1. this guide for compressed GTL/ABG substrate law
2. `ODD_METHOD.md` for ODD product-authoring law
3. local `GOALS.md`, `INTENT.md`, `PRODUCT.md`, requirements, and design
4. local code and tests as realization evidence

Do not treat this guide as domain semantics.

Do not treat `ODD_METHOD.md` as a replacement for local product authority.

Do not treat the appendices as exhaustive APIs. They are syntax anchors for
agents. When exact signatures matter, read the TypeScript or Python source.

## Axiomatic Substrate

GTL is the graph language.

ABG is the canonical runtime for GTL.

GTL declares constructive structure.

ABG executes declared structure and owns runtime truth.

The `Graph` through `Module` GTL rows are topology anchors. The remaining GTL
rows are first-class declaration or reference surfaces that attach to, govern,
refine, or publish through those anchors.

The governing split is:

| Surface | Owner | Rule |
| --- | --- | --- |
| `Graph` | GTL | Named topology of nodes and graph vectors; structural materialization surface, not the public callable workflow carrier by itself. |
| `Node` | GTL | Typed local locus of graph meaning, invariant state, markov conditions, and optional asset-surface declaration; not an executable workflow carrier, public work entrypoint, or graph function. |
| `GraphVector` | GTL | Internal invariant traversal boundary between source node set and target node; carries transition-governance declarations; not a public callable carrier or semantic job target. |
| `GraphFunction` | GTL | Public reusable workflow program with typed outer interface and cumulative environment; materializes a graph and may realize one or more internal vectors. |
| `Job` | GTL | Durable semantic work contract over published graph functions; does not target bare graph vectors. |
| `Module` | GTL | Publication boundary for graphs, graph functions, refinement boundaries, candidate families, jobs, roles, operators, evaluators, rules, imports, metadata, and module policy hooks; not runtime event truth. |
| `ContractRef` | GTL | Job-to-contract indirection; current semantic work targets published graph-function contracts, not bare vectors. |
| `Context` | GTL | Snapshot-bound constraint declaration carried by graph structure; not an engine-owned runtime fact. |
| `Operator` | GTL | Effectful work declaration with regime and binding; distinct from worker identity and transport. |
| `Evaluator` | GTL | Convergence and attestation declaration; checks or attests, but does not perform work. |
| `Rule` | GTL | Passive declaration of what must hold at a contract boundary; not enforcement strategy. |
| `RefinementBoundary` | GTL | Explicit lawful refinement or synthesis boundary preserving an outer contract. |
| `CandidateFamily` | GTL | Published lawful alternatives over one outer contract; exposes choices without selecting them. |
| `Role` | GTL | Semantic capability class for work, supervision, or approval; distinct from ABG worker identity. |
| `Policy Surface` | GTL/app declaration | Declarative law for dispatch, evaluation, escalation, proof, and closure. |
| `GraphCall` | ABG | Runtime realization of one published graph function. |
| `Frame` | ABG | Invocation-local runtime boundary for recursion or local execution. |
| `Continuation` | ABG | Open runtime obligation derived from emitted facts. |
| `Runtime Fact` | ABG | Event truth emitted through the runtime write boundary. |
| `Projection` | ABG/app read model | Replay-derived current state. |
| `Proof Lane` | app declaration plus ABG runtime facts | Declared proving path for capability or closure. |

The primary construction axiom is:

```text
constructive work = published graph functions over typed nodes and declared asset surfaces
```

The primary runtime axiom is:

```text
runtime truth = emitted events + replay-derived projection
```

The public execution chain is:

```text
Job
-> GraphFunction
-> GraphCall
-> materialized Graph
-> internal GraphVector traversal
-> ExecutionBasis
-> AdvancementTransition
-> events
-> projection
-> proof
-> closure
```

`GraphFunction` is the public callable carrier.

`GraphVector` remains internal realized structure.

Downstream terms such as graph overlay, leaf, workflow lane, app surface, or
other product-local vocabulary are not canonical GTL type names. Use them only
as local vocabulary, then bind them back to a GTL topology anchor or first-class
declaration surface before declaring GTL or ABG behavior.

`ExecutionBasis`, `AdvancementTransition`, `IterationAdvanceDecision`, and
`RegimeBindingSet` carry ABG 3.5 runtime law.

Do not rebuild those meanings from result dictionaries, controller state, prompt
text, or `runtime_config`.

## LLM Operating Rules

An LLM builder must preserve these rules:

- make graph functions the constructive carrier
- bind semantic jobs to published graph functions, not bare vectors
- publish live traversal truth through the module, not through hidden service methods
- make policy, proof, closure, escalation, and dispatch declarative
- let ABG own traversal, events, frames, continuations, replay, projection, and correction
- treat prompts and command output as transport or projection, not constitutional truth
- treat `runtime_config` as adapter/bootstrap ingress, not semantic runtime law
- fail closed when a target, helper ref, asset binding, carried environment, or policy surface is ambiguous
- reprice the declaration when the graph or policy shape is wrong

Do not add:

- imperative executive loops as shadow graph traversal
- product-specific orchestration scripts as second runtime law
- compatibility targets that keep old and new truth alive
- hidden prompt-only policy
- file-path lore where a typed asset surface or registry is required
- derived projections that outrank emitted runtime facts

## Relation To ODD Method

This guide gives the GTL/ABG substrate.

`ODD_METHOD.md` gives the product-authoring method for ODD products built over
that substrate.

When both are provided to an LLM:

- use this guide to know the ontology and runtime contract
- use `ODD_METHOD.md` to shape the product as an ODD product
- use local product specification and design to bind domain meaning

The composition is:

```text
GTL/ABG guide = language/runtime ontology
ODD_METHOD.md = product-authoring method
local authority = product meaning and current line
```

For an ODD-shaped app, the target product shape is:

```text
product
= typed asset/domain model
+ GTL-defined graph functions
+ GTL module publication
+ ABG runtime execution
+ projection/query surface
+ proof surface
```

Do not copy another product's local asset names as shared doctrine.

Do copy the structural law:

- typed assets or nodes bind domain meaning
- public graph functions carry construction
- semantic jobs bind durable work to graph functions
- ABG owns runtime facts and traversal
- projection/query surfaces read from constructive history
- proof surfaces determine closure authority

## Why GTL/ABG Exists

GTL/ABG exists to turn probabilistic LLM work into governed, eventually
deterministic, repeatable outcomes.

The system does not guarantee deterministic token output.

It guarantees explicit governance over:

- what was declared
- what callable carrier was invoked
- what runtime facts were emitted
- what proof was produced
- what closed
- what remained open
- what was corrected, superseded, or repriced

Build with GTL/ABG when process truth, audit, replay, and closure matter.

## What You Can Build

Build these classes of systems with GTL/ABG:

- workflow-native applications
- agentic build systems
- outcome-driven delivery systems
- governed internal tools
- evidence and proving pipelines
- approval and escalation systems
- recursive work systems where one callable may open more work

Examples:

- design-to-code delivery
- outcome-driven development
- compliance and attestation workflows
- operational runbooks with audit
- internal agent platforms with correction and replay

Do not use GTL/ABG for:

- static brochure sites
- simple CRUD products with no meaningful workflow law
- apps where audit, correction, replay, and proof do not matter

## What A GTL Domain App Is

A GTL domain app is a configured domain product over the GTL/ABG substrate.

It has these layers:

```text
App
= Bootstrap Surface
+ Initialization Surface
+ Domain Configuration
+ Typed Domain Assets / Nodes
+ GTL Function Catalog
+ GTL Module
+ Policy Hook Bindings
+ ABG Runtime
+ Projection / Query / Audit Surface
+ Proof Surface
```

The app is not identical to the runtime.

The app is not identical to the GTL module.

The app is the full configured product boundary.

## App Ontology

The app ontology has these primary objects:

- **Outcome**
  - a declared product or workflow state with explicit meaning and closure
    expectations
- **Transition**
  - one lawful move between outcomes
- **Graph Function**
  - the public named callable carrier for constructive work
- **Work Vector**
  - the product view over one public graph-function carrier and its realized
    internal vectors
- **Semantic Job**
  - the durable work contract over published graph functions
- **Policy Surface**
  - declarative config over dispatch, evaluation, escalation, proof, or closure
- **Runtime Fact**
  - event truth emitted by ABG
- **Graph Call**
  - one runtime realization of one published graph function
- **Frame**
  - one runtime invocation boundary for recursive or local execution
- **Continuation**
  - one open runtime obligation derived from emitted facts
- **Proof Lane**
  - the declared proving surface for one capability or closure claim

The core execution rule is:

```text
Job -> GraphFunction -> GraphCall -> ExecutionBasis -> AdvancementTransition -> events -> projection -> proof -> closure
```

`GraphFunction` is the public callable carrier.

`GraphVector` remains internal realized structure.

ABG materializes and traverses internal `GraphVector` structure under the public
`GraphFunction` carrier.

`GraphFunction.environment` is the cumulative typed environment contract.

## Ontology And Epistemology

Ontology names what exists. Epistemology names how facts become known and
authorized over what exists.

GTL ontology is the authored language surface:

- `Graph`
- `Node`
- `GraphVector`
- `Context`
- `Operator`
- `Evaluator`
- `Rule`
- `GraphFunction`
- `RefinementBoundary`
- `CandidateFamily`
- `ContractRef`
- `Role`
- `Job`
- `Module`

ABG runtime ontology is the interpreter-owned truth surface:

- selected `abg.fn_composition`
- runtime events
- `Run`
- `GraphCall`
- `Frame`
- `ExecutionBasis`
- `AdvancementTransition`
- `IterationAdvanceDecision`
- `Continuation`
- payload admission and payload ledgers
- assurance projection and closure fold
- traversal transition and replay projection

Product ontology is downstream-owned. Pressure maps, gain lenses, acceptance
registers, lifecycle views, and domain read models are product projections over
ABG-admitted facts.

`C` is selected-composition notation. It is shorthand over selected
`abg.fn_composition`, not a new `ComputeUnit`, not `ReliableCompute`, not a
topology anchor, not a public callable carrier, and not an ABG runtime carrier.

The epistemic flow is:

```text
ABG.start(fn<A, B>.C)
  .bind(system.openGraphCall)
  .bind(system.openFrame)
  .bind(plugin.transform.C)
  .bind(system.admitTransform)
  .bind(system.writeTransformEventsAndLedgers)
  .bind(system.planEvaluationSet)
  .bind(plugin.evaluate.C.rule[*])
  .bind(system.admitEvaluationRuleResult[*])
  .bind(system.writeEvaluationLedgers)
  .bind(system.collectEvaluationSet)
  .bind(system.assuranceFold)
  .bind(plugin.consequence.C)
  .bind(system.admitConsequenceProjection)
  .bind(system.traversalTransition)
  .bind(system.replayContinuation)
```

ABG is the opinionated probabilistic eventual-consistency monad over selected
composition. A fully deterministic `F_D` graph is the same event-sourced model
reduced to deterministic compute.

Composed `.C` stages share one stage-set law. Scalar stage plugins are one-task
reductions of `transform.C`, `evaluate.C`, or `consequence.C`, not separate
execution authorities.

`plugin.transform.C` produces candidates and evidence under the selected
composition. `plugin.evaluate.C` is an evaluation-set phase: rules may produce
deterministic registers and F_P semantic findings under the selected
composition, and the scalar F_P evaluator is only the one-rule reduction of
that phase. `plugin.consequence.C` produces product projection refs over
ABG-admitted state. Plugins do not directly close, write ledgers, emit events,
select traversal, own replay, or transition the runtime.

ABG admission is the epistemic authority boundary. Before admission, plugin and
evaluator returns are proposed evidence. After admission, ABG owns the events,
payload ledgers, assurance projection, traversal transition, continuation,
closure fold, correction, and replay truth. `F_H` is an external human-callout
regime: ABG admits the callout and later admits the response event/carrier.

## Cumulative Environment Law

Do not model GTL composition as "the last output feeds the next input".

That shape is too weak for real asset construction.

The builder-facing law is:

- each `GraphFunction` declares `environment.requires`
- each `GraphFunction` declares `environment.provides`
- each `GraphFunction` declares `environment.carries`
- later functions may require any typed binding available in the carried environment

The environment is immutable and cumulative.

Earlier bindings remain available unless you explicitly narrow the contract.

In practice, that means later SDLC steps can still read upstream truths such as:

- `input_set`
- `requirements`
- `design`

even after newer bindings have been added.

Use `GraphVector.contexts` for stable source context and use `GraphFunction.environment` for cumulative typed asset bindings.

See the appendices for the concrete Python and TypeScript syntax for the same
cumulative environment pattern.

The law is not:

- `f.outputs == g.inputs`

The law is:

- `g.environment.requires` must be satisfied by the cumulative environment carried so far

## Asset Surface Contract

Node typing is not only `Node.schema`.

When a boundary represents a real produced or consumed asset, declare its
`asset_surface`.

`asset_surface` is GTL declaration truth for:

- `kind`
- `required_contexts`
- `standards_refs`
- `output_contract_refs`

See the appendices for the concrete Python and TypeScript syntax for declaring
the same asset-surface contract.

Use this when you want downstream work to consume an asset by declared contract
rather than by ad hoc file-path lore.

This is the practical builder meaning:

- `Node.schema` says what typed locus this is
- `asset_surface.kind` says what operational asset role it serves
- `asset_surface.required_contexts` says what carried bindings must also be
  present when this asset is produced
- `asset_surface.standards_refs` and `output_contract_refs` give ABG enough
  declaration truth to surface specialized proof and output-contract context

Keep the boundary clean:

- `asset_surface` belongs to GTL
- workspace binding, transport choice, write territory, and provenance remain
  ABG-owned runtime concerns

## Runtime Environment Resolution

ABG does not dispatch a live vector from declaration shape alone.

At bind time, ABG resolves one executable runtime environment for the specific
live vector being dispatched.

Resolution law:

- `requires` comes from the live vector source boundary
- `provides` comes from the live vector target boundary
- the effective required boundary is the invocation-local merge of:
  - live vector source requirements
  - target `asset_surface.required_contexts`
- `carries` is the stable union of the published graph-function carries plus the
  live vector boundary
- each carried binding is projected from current runtime truth and labeled as
  either `external_entry` or `internal_carrier`
- internally produced required bindings must already be replay-visible before
  constructive dispatch
- conflicting carried bindings with the same name but incompatible contracts fail
  closed
- bind-time prompt and manifest surfaces include the target and carried
  `asset_surface` contracts
- unresolved runtime environment blocks `F_P` dispatch and leaves the route open

Builder consequence:

- declaring a binding in `environment.carries` is not enough
- declaring `asset_surface.required_contexts` is a real way to widen the live
  executable boundary for that invocation
- if a late step requires `requirements` or `design` from 2+ steps earlier, that
  binding must already be visible in replayed runtime truth before the late step
  runs
- ABG does not invent hidden parameter passing between internal vectors
- ABG may widen one invocation boundary from declared `asset_surface` truth, but
  that merge is invocation-local and does not rewrite published GTL topology

## Public Carrier Pattern

For one live executable vector, the canonical public carrier is a graph
function.

Use `graph_function_for_vector(...)` for that pattern.

Do not make bare vectors public job targets.

Do not publish helper leaf graph functions as extra module graph functions unless
they are:

- themselves bound by a semantic `Job`
- explicit `CandidateFamily` members
- helper graph functions required for lawful symbolic materialization and marked
  `selection_visible=False`

Otherwise they become hidden structural alternatives.

### Composed executive over cumulative environment

The real builder pattern for multi-step work is:

- author leaf or mid-level graph functions with explicit cumulative environments
- compose them into one public executive carrier
- materialize that executive once for module publication
- publish every live internal vector through `RefinementBoundary` or
  `CandidateFamily`
- bind the semantic `Job` to the public executive carrier, not to an internal
  vector

See the appendices for the concrete Python and TypeScript syntax for publishing
the same composed executive carrier.

That publication shape is important.

ABG binds the `Job` to `executive`, materializes the executive graph, and then
traverses the internal vectors against the cumulative environment carried by the
public carrier.

If the module publishes the public carrier but not its live vectors and
traversal targets, ABG will fail closed.

### Cold-start migration from imperative executive runners

If you are replacing an app-owned executive loop, do not keep the old loop as a
shadow orchestrator.

Migrate in this order:

- make each constructive step a `GraphFunction` with explicit `EnvRef`
- compose those steps into one public executive carrier
- materialize the executive once and publish that graph through `Module.graphs`
- publish each traversable internal vector through `RefinementBoundary` or
  `CandidateFamily`
- bind the semantic `Job` to the outer carrier
- let ABG own traversal, selection, recursive frame opening, and rebound
- inspect emitted runtime facts instead of hand-writing a driver loop

This is the right migration path for `odd_method`-class apps that currently have
an app-owned program catalog plus a custom iteration runner.

### Eager vs deferred composition

There are two lawful composition patterns.

#### Eager GTL composition

Use eager composition when your component functions already materialize inline:

- compose inline graph functions in GTL
- materialize once
- publish the resulting graph through `Module.graphs`

This is the simplest publication path for ordinary executives.

#### Deferred ABG materialization of symbolic carriers

Use deferred composition when you want a reusable higher-order public carrier
whose internals stay symbolic until runtime publication.

The law is:

- the public carrier may be symbolic
- ABG may materialize that symbolic carrier against helper graph functions
  published by the same module
- symbolic publication does not remove the requirement to publish lawful live
  traversal truth through `Module.graphs`
- helper refs must resolve uniquely against module-published graph-function truth
- the realized graph must preserve the carrier's declared outer interface exactly
- helpers that exist only to support symbolic materialization should be marked
  `selection_visible=False` so selection validation does not misread them as
  hidden public alternatives

This is the right pattern for higher-order harnesses where the caller should see
one stable outer contract while the runtime resolves injected helper steps
lawfully.

## Recursion And Composition

Recursion does not introduce a second environment model.

It reuses the same cumulative environment contract and opens more work against
the world already built so far.

The builder-facing law is:

- recurse over a public `GraphFunction`, not a bare vector
- the recursive carrier keeps the wrapped carrier's outer contract and
  cumulative environment
- recursive child work executes against the carried environment visible at that
  frame
- fold-back and continuation logic must preserve explicit lineage rather than
  mutating prior truth

See the appendices for the concrete Python and TypeScript syntax for the same
recursive composition pattern.

That is the important point: recursion preserves the cumulative carried world.
It does not collapse back to one-step output piping.

### Recursive structural choice

When recursive work is one selectable way to satisfy a coarse contract, do not
bind the semantic job directly to the recursive candidate.

Publish:

- one public outer carrier over the coarse contract vector
- one explicit `CandidateFamily` or `RefinementBoundary` for the selectable
  inner work
- one explicit `SelectionDecision` when candidate families are involved

See the appendices for the concrete Python and TypeScript syntax for publishing
the same recursive candidate family.

At runtime, selection is explicit. See the appendices for language-shaped
selection-decision examples.

That leads ABG to open a frame for the recursive candidate and execute child
steps over the carried environment of that frame.

Runtime shape after selection:

- ABG binds the semantic job to the coarse outer carrier
- explicit selection opens a child frame for the recursive candidate
- child steps execute against the cumulative environment visible at that frame
- fold-back rebinds to the outer contract rather than mutating parent truth in
  place
- parent resume can then dispatch late steps that require bindings produced 2+
  steps earlier in the child chain

That is the real composed-recursive route to use for SDLC zoom work.

## Higher-Order Harness Pattern

A higher-order harness is still an ordinary `GraphFunction`.

Do not ask ABG for a special "consensus engine", "discovery engine", or
"review engine".

Instead:

- keep the topology explicit in GTL
- inject custom helper graph functions
- keep the outer contract stable for callers
- let ABG materialize and traverse the carrier like any other published graph
  function

Consensus is the canonical example:

```text
subject_asset
-> review_assessment_vector
-> consensus_decision
-> reviewed_subject_asset
```

The caller cares about the outer contract only.

The harness may internally use:

- `compose(...)`
- `recurse(...)`
- `fan_out(...)`
- `fan_in(...)`
- `gate(...)`
- custom helper graph functions for review, reduction, and application

Builder rule:

- publish the reusable harness as one public graph function
- publish the injected helper graph functions if ABG must resolve them for
  symbolic materialization
- mark helper graph functions `selection_visible=False` when they are not meant
  to be callable public alternatives
- bind the job to the outer harness carrier, not to helper steps

This lets you build reusable library carriers such as:

- consensus harness
- discovery harness
- harvest harness
- repair loop harness

without expanding GTL ontology or adding hidden runtime controllers.

### Fail-closed rules for composition and recursion

These are the common builder errors that surfaced during real recursive and
composed SDLC implementation:

- do not model composition as `f.outputs == g.inputs`; downstream requirements
  are satisfied from `environment.carries`
- do not bind jobs to bare vectors
- do not publish a public graph function without publishing its live vectors
  through `Module.graphs`
- do not omit `RefinementBoundary` or `CandidateFamily` publication for live
  internal vectors
- do not publish helper leaf graph functions as extra public alternatives unless
  they are:
  - job-bound carriers
  - explicit candidate-family members
  - symbolic-materialization helpers marked `selection_visible=False`
- do not assume a symbolic carrier is executable by string ref alone; ABG can
  materialize symbolic composition lawfully only when helper refs resolve
  uniquely against module-published graph-function truth and the realized graph
  preserves the declared outer contract
- do not assume a declared carry is executable truth; ABG resolves the live
  vector runtime environment and blocks if an internally produced required
  binding is not yet replay-visible
- do not reuse one binding name for structurally different node contracts;
  conflicting carried contracts fail closed

## Parallelism And Write Territory

Parallelism is conservative.

The engine may batch work in parallel only when write territory is disjoint.

Use this rule:

- read overlap is fine
- write overlap is a conflict
- overlapping writers serialize

Do not design workflows that depend on implicit merging of overlapping writers.

## What The Builder Authors

The builder authors these surfaces:

- outcome and transition declarations
- graph-function catalog
- semantic jobs and roles
- hook refs and replay-safe config
- contexts
- domain configuration
- proof lanes and scenario authority
- correction and repricing surfaces where needed

The builder does not author:

- hidden runtime controller logic
- post-dispatch shadow runtime behavior
- ad hoc policy semantics outside declared hook surfaces
- opaque prompt choreography as constitutional law

## Bootstrap

Bootstrap creates the app boundary in a workspace.

Bootstrap should:

- install or copy the runtime substrate
- create the app-owned configuration skeleton
- register the domain package or module roots
- install the coder-facing bootloader or builder guide
- create the initial proof and audit surfaces
- make the app structurally runnable

Bootstrap answers:

- what roots exist
- what files exist
- what the default app shape is
- what config surfaces are expected

Bootstrap does not create hidden runtime truth.

It creates the declared product boundary.

## Initialization

Initialization creates a live configured app instance from the bootstrapped
boundary.

Initialization should:

- read domain configuration
- resolve GTL module or module set
- resolve the graph-function catalog
- resolve hook refs to executable implementations
- bind contexts
- bind runtime contract and policy defaults
- produce the effective callable and runtime surfaces for this app instance

Initialization answers:

- which graph functions are live
- which policy bundle is active
- which contexts are bound
- which jobs are callable
- which runtime defaults govern execution

Bootstrap creates the app structure.

Initialization activates one configured instance of that app.

## Domain Configuration

Domain configuration is the app-owned declarative config surface.

It should include:

- domain identity
- module import roots
- active GTL module or modules
- graph-function catalog publication points
- default policy bundle refs
- context locators
- proof and closure defaults
- operator and evaluator binding refs
- runtime defaults

Domain configuration is not a second runtime.

It configures the substrate and the domain declarations.

## GTL Program Surface

The GTL program surface is the domain declaration layer.

It includes:

- outcomes and nodes
- transitions and graph vectors
- graph functions
- candidate families
- refinement boundaries
- jobs
- roles
- module publication

This is where the app declares what work exists and what callable carriers are
available.

## Hook Model

The hook model should stay narrow and explicit.

The main hook concerns are:

- `dispatch`
- `traversal_modulation`
- `plugin_traversal_observer`
- `evaluation`
- `escalation`
- `proof`
- `closure`
- `assurance`

These concerns attach through GTL declaration surfaces:

- `GraphFunction.declarations`
- `GraphVector.declarations`
- `Role.policy_hooks`
- `CandidateFamily.policy_hints`

### `dispatch`

Dispatch governs how constructive work is routed.

Examples:

- default `F_P` dispatch
- deterministic-first dispatch
- worker or backend preference

### `traversal_modulation`

Traversal modulation governs how an agentic F_P attempt over one edge is
schedule-bounded and progress-gated.

The declaration surface is:

- `GraphVector.declarations["abg.traversal_modulation"]` — primary edge
  qualifier
- `GraphFunction.declarations["abg.default_traversal_modulation"]` — function
  default
- `Role.policyHooks["abg.traversal_modulation"]` — role-level
  default

Resolution order is edge → graph-function default → role default. Duplicate or
malformed qualifiers fail closed. An F_P vector with no qualifier at any layer
remains on the legacy unmodulated path.

Qualifier truth declares strategy primitives (`bounded_batch`,
`ordered_schedule_prefix`, etc.), target / max item counts, ordering refs, and
schedule item refs. ABG derives the typed `TraversalAttemptEnvelope` from the
qualifier and passes it to the F_P plugin. Prompt prose is not the scheduler
command surface.

### `plugin_traversal_observer`

Plugin traversal observers bind transform, evaluate, and consequence plugin traversal to a
declared observer prompt contract.

Declaration keys:

- `abg.plugin_traversal_observer.transform`
- `abg.plugin_traversal_observer.evaluate`
- `abg.plugin_traversal_observer.consequence`

Resolution order is:

1. `GraphVector.declarations`
2. `GraphFunction.declarations`
3. `Role.policyHooks`
4. explicit `abg_defaults` fallback when absence is lawful and the runtime
   context enables the fallback kind

The hook ref config carries:

- optional `traversal_kind`, which must match the declaration key when present
- `observer_prompt_ref`
- `prompt_template_ref`
- `prompt_input_contract_ref`
- `expected_output_contract_ref`
- `progress_signal_refs`
- `continuation_request_refs`
- optional `policy_refs`

Duplicate, malformed, or kind-mismatched declarations fail closed. Fallback
truth is not implicit: the runtime must load a visible fallback bundle and opt
in to the relevant fallback kind.

ABG emits `plugin_traversal_prompt_materialized` when it materializes the
observer prompt. The event carries selection source, hook ref, prompt refs,
config digest, materialization ref, prompt-input digest, default bundle
provenance when used, and causation/correlation. Transform, evaluate, and
consequence plugin inputs receive the selected
`pluginTraversalObserverBinding` when one is declared or enabled.

GTL declares the observer contract. ABG selects, materializes, proves
provenance, and passes the binding to the plugin. A concrete worker, backend,
or transport command does not belong in the GTL declaration.

### `gtl.target_carrier_contract`

Every `GraphVector` output has an effective target-carrier contract binding.

Declaration key:

- `GraphVector.declarations["gtl.target_carrier_contract"]`

Resolution order is:

1. vector-local `gtl.target_carrier_contract`
2. visible GTL defaults config

The default is not a code constant and not null. If the vector does not declare
a product-specific output carrier contract, the runtime reads the generic
target-carrier template from:

```text
config/gtl.target-carrier-defaults.json
```

Installed workspaces receive the editable copy at:

```text
.abiogenesis/config/gtl.target-carrier-defaults.json
```

Malformed vector declarations, missing defaults config, malformed defaults
config, or unresolved template fields fail closed.

The selected binding names the target node, output surface, carrier family and
kind, envelope contract, nested payload path, required fields, fixed protocol
fields, worker-fillable fields, literal/enum domains, schema/admission refs,
payload-ledger binding, edge-assurance binding, handoff projection,
construction template, replay digest policy, materialization policy, closure
precondition, and test-case generation ref. ABG payload-ledger projection
records the selected contract ref and digest; closure cannot rely on file
presence or worker prose without admitted target-carrier satisfaction.

### `evaluation`

Evaluation governs how convergence is checked.

Examples:

- evaluator ordering
- deterministic precheck policy
- retryable evaluation law

### `escalation`

Escalation governs how unresolved work moves across regimes.

Examples:

- `F_D -> F_P`
- `F_P -> F_H`
- fail-closed vs continue-open law

### `proof`

Proof governs what evidence is required before success can count.

Examples:

- deterministic proof checks
- artifact-attestation hooks
- post-run proof requirements

### `closure`

Closure governs what must hold for the boundary to close.

Examples:

- proof passed
- no open continuation of a required kind
- required approval present

Closure is not the same thing as "no remaining deterministic observation."

Post-transform deterministic findings may remain open as runtime fact truth and
feed correction, continuation, or downstream gap handling without automatically
failing closure.

Only declared blocker-class conditions should convert those findings into
closure failure.

### `assurance`

Assurance hooks connect domain-specific authority, evidence, ambiguity, closure
policy, and gain functions to the ABG assurance projection.

Use GTL declarations for the hook ref and replay-safe config. Bind executable
implementations through ABG plugin contracts.

The TypeScript RC plugin kinds are:

- `assurance_authority_snapshot_provider`
- `assurance_evidence_adapter`
- `assurance_ambiguity_classifier`
- `assurance_closure_policy_provider`
- `assurance_gain_function_adapter`

These plugins provide inputs to ABG. They do not emit runtime events, select the
next vector, close traversals, or own the iteration loop.

### `payload ledger`

Payloads that affect authority, evidence, ambiguity, traversal, or closure must
pass through ABG admission. Product-specific ledgers and lineage registers are
read models projected from admitted events.

Do not create a second payload framework in app services. Domain builders may
own payload codecs, authority providers, evidence adapters, ambiguity
classifiers, closure policies, and gain functions, but ABG owns payload
identity, event admission, projection, and closure relevance.

### `role hooks`

Role hooks govern authority, assignment, and approval constraints.

### `candidate-family hints`

Candidate-family hints influence selection policy.

They do not become a second execution runtime.

### F_P / F_D constitutional boundary

F_P owns semantic quality judgment of `A.req_i -> B.result_i` for each
obligation `i`. F_D owns deterministic mechanics only.

Authority anchors:

- `specification/PRODUCT.md:97` — F_P owns unconstrained constructive space;
  F_D is deterministic / domain-owned optimization and does not move domain
  HOW into ABG.
- `specification/PRODUCT.md:105` — F_D evidence does not let the framework
  absorb domain HOW as framework law.
- `specification/INTENT.md:92` — F_P owns hidden constructive traversal of the
  probabilistic worker.
- `specification/INTENT.md:96` — if the framework prescribes domain solution
  strategy beyond declared edge contract and control truth, it has crossed the
  GTL / ABG boundary.

Concrete split:

| Concern | Owner | Examples |
| --- | --- | --- |
| `did A.req_i -> B.result_i?` per obligation | F_P | worker self-assessment, downstream F_P evaluator plugin attesting per-obligation, behavioral or material observation, finding-class split |
| Artifact mechanics | F_D | file exists under allocated root, schema valid, digest matches, write-root respected, identity bound, admission envelope intact, target certification reference present |
| Foldback algebra | ABG runtime | aggregating F_P assessments into ledger, computing the five-term `edge_converged` predicate, latest-assessed-per-slice projection, retry allowlist gating, artifact salvage admission |

Subdivision is a feature, not the check. When one requirement is split into N
obligations, each per-obligation check is still F_P. Determinism of an
implementation does not make a check F_D. If a check reads disk content, parses
sections, evaluates substantive content, or counts items per obligation
expectation, it judges semantic fulfillment and is F_P-class regardless of how
deterministic it looks.

"Behavioral F_D" or "semantic F_D" is a code smell. Either the label is wrong
(rename to F_P) or the structure is wrong (split semantic judgment into a
separate F_P plugin and leave F_D doing mechanics).

Recurring bug pattern: B-003, B-013, B-014, B-016, B-017 are the same
conflation surfacing in different shapes. A check that lexically substring-matches
output content gets labelled F_D because it is "deterministic"; it is actually
F_P-class semantic quality judgment, and labelling it F_D allows the runtime
to admit material gaps as fulfilled. Finding-class taxonomies
(`semantic_fulfillment_gap`, `traceability_reference_gap`) come from F_P; F_D
does not classify.

## Eval Suite Projection And Worker Variance

T-102 admits typed eval-suite projection over event-sourced trial truth. F_P
workers are non-deterministic; capability claims that do not measure variance
are unsafe.

Carriers (`code/src/abg/m03/contracts/eval_suite.ts`):

- `EvalSuiteSpec` (`eval_suite.ts:17-29`) — suite identity, `suiteClass` of
  `capability` or `regression`, `repeatCount`, `passThreshold`,
  `saturationPolicy`, owner and source refs.
- `EvalTask` (`eval_suite.ts:31-42`) — task ref over a graph-function edge with
  declared output refs, reference solution refs, success criteria refs, grader
  refs.
- `EvalTrial` (`eval_suite.ts:44-57`) — one trial of one task by one
  `workerRef` under one `policyRef`, with `outputRootRef`, `eventStreamRef`,
  `transcriptRefs`.
- `EvalOutcome` (`eval_suite.ts:59-71`) — terminal decision plus admitted
  evidence, projection refs, and `failureClass` for the trial.
- `EvalGradeRow` and `EvalGradeVector` (`eval_suite.ts:73-93`) — per-subject
  grade rows folded into a vector verdict (`pass`, `fail`, `unknown`).
- `EvalAggregateProjection` (`eval_suite.ts:95-116`) — suite-level pass@k
  (`passAtK`), pass^k (`passAllK`), `passRate`, `passThreshold`, grade row
  counts, `failureClasses`, and `verdict` (`passed` or `failed`).

Capability vs regression discipline (`eval_suite.ts:13`,
`EvalAggregateProjection.suiteClass`):

- `capability` evals exercise hard domain work. Low pass rates are expected
  while the substrate is maturing. They lose signal as they saturate.
- `regression` evals protect existing carrier contracts. They should be at or
  near saturation and gate against degradation.

Mixing the two surfaces creates ambiguity: a CI failure cannot be classified as
expected capability gap versus regression without `suiteClass`. Keep them
separate at the suite-spec level.

Worker variance metrics (`deriveEvalAggregateProjection` in
`eval_suite.ts:336-457`):

- `passAtK` — at least one trial in the trial set passed.
- `passAllK` — every trial in the trial set passed.

For chained traversal of N edges, pass^k is the consistency metric that
matters. A 0.9 pass@1 per edge becomes ~0.12 pass^20 across the chain even
though each edge looks fine in isolation.

Anthropic vocabulary mapping
(`.ai-workspace/comments/claude/20260502T053000Z_DESIGN_eval-framework-from-anthropic-demystifying-evals.md`):

| Anthropic | ABG 3.5 RC carrier |
| --- | --- |
| Task | `EvalTask` over a graph-function edge or chain |
| Input | `EvalTask.inputRefs` resolving to admitted `WorkspaceAssetBinding`s |
| Output | `EvalOutcome.materializedOutputRefs` under T-082 allocation roots |
| Transcript / Trace | `EvalTrial.eventStreamRef` plus `transcriptRefs` |
| Outcome | `EvalOutcome` plus `EvalGradeVector` plus admitted ledger projection |
| Grader (semantic) | F_P evaluator plugin |
| Grader (mechanical) | F_D envelope plugin |
| Reference solution | `EvalTask.referenceSolutionRefs` |
| pass@k | `EvalAggregateProjection.passAtK` |
| pass^k | `EvalAggregateProjection.passAllK` |

Operator discipline (sandbox shape, `test_env/sandbox/mini_dm_redux/`):

- One `run.mjs` per sandbox dispatches the F_P worker (`fp_worker.mjs`) and the
  F_P evaluator (`fp_evaluator.mjs`) per edge.
- The F_D envelope (`fd_envelope.mjs`) checks artifact mechanics only.
- Each trial materializes under a fresh allocation root, so trials do not
  correlate across runs by construction.
- Transcripts and ledger fields are inspectable per trial.

Read transcripts. Graders that pass on lexical match alone will admit material
gaps as fulfilled. The recurring `behavioral F_D` bug class is a transcript-not-read
failure.

## What ABG Owns

ABG owns runtime truth and runtime progression.

ABG owns:

- typed advancement carriers
- typed regime-binding algebra
- graph-call execution
- frame progression
- continuation truth
- event emission
- proof and closure facts
- replay and projection
- correction and supersession fact emission
- payload identity and event-sourced payload-ledger projection
- total assurance projection and closure-fold gating
- attempt-envelope derivation from the GTL traversal-modulation qualifier
- one shared dispatch-attempt law across sync and async runner modes
- typed non-progress classification and continuation-action projection
- forced-review gating on backend ambiguity
- modulation exhaustion gating on retry-budget closure
- bounded-attempt terminal exit for modulated F_P attempts that must not
  silently continue into retry repair
- supervised actor/worker call-out identity, process facts, terminal session
  facts, and replay-derived process projection
- Transform/Eval plugin traversal observer binding selection,
  materialization, provenance, and plugin-input handoff
- visible `abg_defaults` fallback bundle admission and default-source
  provenance

ABG does not own domain semantics beyond declared law.

ABG interprets and enforces declared law.

### ABG 3.6.0 RC carrier law retained in 3.7

The live runtime boundary is carrier and event owned.

The builder should expect runtime decisions to flow through:

- `ExecutionBasis`
- `AdvancementTransition`
- `IterationAdvanceDecision`
- `RegimeBindingSet`

Do not rebuild these meanings from result dictionaries, controller state, or
`runtime_config` side channels.

`runtime_config` may provide adapter/bootstrap ingress. After admission,
runtime policy, asset-binding, proof-hold, dispatch, and convergence truth must
be carried by typed or resolved runtime surfaces.

### ABG 3.6.0-rc.1 carrier extensions retained in 3.7

The carrier surface covers output allocation, zoom-foldback, graph-span
foldback and reentry, cross-workspace allocation, eval-suite projection, typed
non-progress continuation, traversal modulation, bounded-attempt exit,
supervised actor/worker call-out projection, PTY terminal execution,
Transform/Eval plugin traversal observer materialization, and the visible
`abg_defaults` fallback bundle. These are not optional. A graph function that
takes inputs, produces typed outputs, runs per-edge zoom work, routes agentic
F_P work, invokes supervised agent actors/workers, or relies on observer
fallbacks must consume them.

### ABG 3.7.0-rc.1 construction evaluator extensions

The F_P construction evaluator is now the single ranking surface for typed
asset gaps and lawful candidate graph actions. Public gaps is a read-only view
over that evaluator projection.

The builder should expect construction recommendations to flow through:

- `ConstructionObservationSnapshot`
- `ConstructionActionCatalogProjection`
- `ObservationToActionBindingProjection`
- `ConstructionPriorityProjection`

Do not rebuild gap ordering, action ranking, bootstrap induction, or retry
pressure in public app adapters. M04 gaps may render typed asset gaps, blockers,
candidate actions, and ranking reasons. It must not append events, admit
intent, dispatch graph work, or own a retry loop.

Traversal modulation is declared through GTL hook/config truth on the
edge-qualifier surface. ABG derives the typed envelope, runs the same
dispatch-attempt law on sync and async runners, classifies non-progress, and
projects the typed continuation action. Prompt prose is not the scheduler
command surface.

#### T-082 output instance allocation

T-082 admits invocation-local output materialization roots. Builders that
produced outputs under caller-chosen paths must move to T-082 allocation.

Carriers (`code/src/abg/m03/contracts/output_allocation.ts`):

- `OutputInstanceAllocation` (`output_allocation.ts:97-115`) — one allocated
  output: `assetRef`, `assetType`, `materializationRoot`, `materializationUri`,
  `allowedWriteRoots`, plus run / work / basis / graph-function lineage.
- `WorkspaceAssetBinding` (`output_allocation.ts:32-42`) — admitted input or
  output asset bound to a workspace, with `allowedWriteRoots` and
  `bindingRole`.
- `OutputPluginHandoffManifest` (`output_allocation.ts:141-155`) — the manifest
  the F_P plugin receives: admitted input refs, allocated outputs, allowed
  write roots, proof obligation refs.
- `OutputAllocationProjection` (`output_allocation.ts:157-174`) — replay-derived
  view of allocations, bindings, observed materializations.

Event kinds (admitted through ABG, defined in
`code/src/abg/m03/contracts/event_admission.ts`):

- `output_instance_allocated` — ABG mints a write root for one declared output.
- `output_binding_admitted` — admitted asset binding for an allocated or
  caller-supplied input.
- `output_materialization_observed` — materialization observation under the
  allowed write roots; admission asserts the path is within allocation
  (`output_allocation.ts:454-476`).

Builder rules:

- F_P plugins emit artifacts under `OutputPluginHandoffManifest.allowedWriteRoots`.
  Writes outside that root fail closed in admission.
- Output identity comes from ABG, not from the worker. Workers do not invent
  asset refs.
- F_D mechanics (existence, schema, digest, write-root respected) attest the
  envelope; F_P attests semantic fulfillment.

#### T-100 zoom foldback and obligation schedule

T-100 admits per-edge zoom traversal where one outer edge unfolds into a
schedule of obligations and ABG runs `dispatch -> assess -> fold` until the
five-term `edge_converged` predicate holds.

Carriers (`code/src/abg/m03/contracts/workspace_zoom_foldback.ts`):

- `ObligationLedgerAsset` (`workspace_zoom_foldback.ts:89-97`) — typed
  obligation ledger admitted from the input asset and its authority digest.
- `ObligationScheduleAsset` (`workspace_zoom_foldback.ts:108-115`) — derived
  per-obligation schedule items.
- `ZoomFrame` (`workspace_zoom_foldback.ts:117-128`) — admitted invocation-local
  zoom over one edge with `inputAssetRef`, `outputAssetRef`, `ledgerRef`,
  `scheduleRef`.
- `ScheduledSliceDispatch` (`workspace_zoom_foldback.ts:130-139`) — one
  per-attempt dispatch of one schedule item to one plugin.
- `ScheduledSliceAssessment` (`workspace_zoom_foldback.ts:141-155`) — one
  attempt outcome with `status`, `assessmentRegime`, `findingClass`,
  `evidenceRefs`, `outputRefs`, `runtimeFailureClass`.
- `ZoomFoldbackEvaluation` (`workspace_zoom_foldback.ts:157-185`) — the foldback
  result with the five-term `edge_converged` predicate.
- `OuterTraversalEvaluation` (`workspace_zoom_foldback.ts:187-201`) — the next
  outer-traversal action: `close`, `retry_same_edge`, `carry_loopback_pressure`,
  `block`, `reprice`.

Five-term `edge_converged` predicate
(`workspace_zoom_foldback.ts:781-797`, fields on `ZoomFoldbackEvaluation`):

1. `carryConverged` — every schedule item has a current semantic assessment
   with no conflicting status.
2. `fulfillmentConverged` — every schedule item is `fulfilled` with finding
   class `fulfilled`; no open, blocked, runtime-failed, or conflicting items.
3. `admitted` — the foldback was admitted through ABG.
4. `targetCertificationPassed` — fulfillment converged at target certification.
5. `fdRecheckPassed` — F_D mechanical recheck passed at close.

Close fires only when all five terms hold. Any single failure routes to a
typed decision: `retry_scheduled_slice`, `carry_loopback_pressure`, `blocked`,
or `reprice_required`.

Retry allowlist (`workspace_zoom_foldback.ts:57-62`):

```text
RETRYABLE_RUNTIME_FAILURE_CLASSES = ["transport_failure", "no_output", "contract_failure"]
```

Only these three runtime failure classes are retry-eligible. Other failure
classes block the slice, even if a later attempt would otherwise look
fulfilled.

Artifact salvage (`workspace_zoom_foldback.ts:184`, `salvagedItemRefs`):

A schedule item where a runtime-failed attempt produced a usable artifact may
be admitted as `fulfilled` with the runtime failure class still recorded. The
foldback projects these into `salvagedItemRefs`. Salvage preserves valid F_P
outputs across transport timeouts; it does not relax F_P fulfillment evidence
requirements.

Finding-class taxonomy (`workspace_zoom_foldback.ts:46-49`):

- `fulfilled` — the obligation is satisfied with required output and evidence.
- `semantic_fulfillment_gap` — F_P attests that the result does not materially
  represent the requirement.
- `traceability_reference_gap` — references to authority are missing or
  malformed but the substantive content may still be partial.

The split allows reentry routing to distinguish "rewrite this slice" from
"add a missing reference".

Behavioral observation rule: assessments admitted with non-runtime status must
carry F_P regime (`workspace_zoom_foldback.ts:307-311`,
`defaultAssessmentRegimeForStatus`). Semantic judgment is F_P; only
`runtime_failed` admits at F_D regime.

Event kinds:

- `workspace_obligation_ledger_admitted`
- `workspace_obligation_schedule_derived`
- `zoom_frame_opened`
- `scheduled_slice_dispatched`
- `scheduled_slice_assessed`
- `zoom_foldback_evaluated`

#### T-104 cross-workspace output allocation

T-104 admits graph-function starts that read inputs from one workspace (W1) and
write outputs to a different declared workspace (W2). Output authority and
input lineage stay separate.

Carriers (`code/src/abg/m03/contracts/output_allocation.ts`):

- `OutputWorkspaceBinding` (`output_allocation.ts:44-50`) — admitted output
  workspace identity: `workspaceRef`, `workspaceRoot`, `authorityRef`, `source`.
- `admitOutputWorkspaceBinding` (`output_allocation.ts:337-363`) — admission
  with canonical-path failure-closed.
- `OutputInstanceAllocation` extended fields (`output_allocation.ts:106-109`):
  `inputWorkspaceRoot`, `outputWorkspaceRef`, `outputWorkspaceRoot`,
  `outputWorkspaceAuthorityRef`.
- `OutputPluginHandoffManifest` extended fields (`output_allocation.ts:148-153`):
  `inputWorkspaceRoots`, `outputWorkspaceRefs`, `outputWorkspaceRoots`.

Builder rule: when the start request supplies `outputWorkspaceBinding`,
allocation derives roots under W2; when it does not, allocation derives under
the basis workspace. W2 represented as a string path without an admitted
binding fails closed.

#### T-106 typed non-progress and continuation-action projection

T-106 admits typed non-progress derivation and a single typed continuation
action over agentic F_P attempts that produced no progress artifact. It
defends against the multiple-source-of-truth bug where one event projects
several contradictory action verdicts.

Carriers (`code/src/abg/m03/contracts/traversal_non_progress.ts`):

- `TraversalNonProgressCarrier` — typed carrier holding `classification`,
  `timeoutClass`, signal sequence, and replay-derivable basis lineage.
- `TraversalContinuationActionProjection` — typed projection over the carrier
  with `action` and `publicSummaryAction` fields.
- `TraversalContinuationSummary` — public summary view consumed by downstream
  agents.

Timeout class enum (`TRAVERSAL_NON_PROGRESS_TIMEOUT_CLASS_VALUES`):

- `inactivity_timeout`
- `hard_timeout`
- `transport_exit`

Continuation action enum (`TRAVERSAL_CONTINUATION_ACTION_VALUES`):

- `retry_same_edge`
- `yield_same_edge_continuation`
- `retry_exhausted`
- `inspect_runtime_archive`
- `reprice_runtime_policy`
- `blocked`

Multi-source-of-truth defense (`assertTraversalContinuationSummaryAgreement`):

When a downstream consumer derives or receives a continuation summary
independently of the projection, it must call
`assertTraversalContinuationSummaryAgreement` to verify the public summary
matches the carrier-derived projection. Drift on `action`,
`publicSummaryAction`, classification, or timeout class fails closed.

Composition with the T-100 retry allowlist:

- The T-100 allowlist (`{transport_failure, no_output, contract_failure}`) is
  the F_D-mechanical gate over which runtime failure classes admit retry at
  all.
- The T-106 continuation action is the typed semantic verdict over the
  non-progress carrier. `retry_same_edge` is lawful only when the failure
  class is allowlisted; otherwise the action projects to `blocked`,
  `inspect_runtime_archive`, or `reprice_runtime_policy`.

Builder rule: do not parse continuation intent from prompt prose, manifest
notes, or worker output. Read the typed projection. When emitting your own
candidate summary, validate against the projection before publishing.

#### T-107 agentic F_P traversal modulation

T-107 admits typed traversal modulation profiles for agentic F_P attempts.
ABG resolves a `TraversalStrategyDirective` from GTL declaration truth,
derives the `TraversalModulationProfile` and `TraversalAttemptEnvelope`, and
passes the envelope to the F_P plugin through one shared dispatch-attempt
law.

Carriers (`code/src/abg/m03/contracts/traversal_modulation.ts`):

- `TraversalStrategyDirective` — admitted directive with strategy primitives,
  schedule item refs, target / max item counts, ordering refs, and source
  classification.
- `TraversalModulationProfile` — derived profile binding the directive to
  policy refs, retry budget, progress contract, and continuation contract.
- `TraversalAttemptEnvelope` — typed envelope passed to the F_P plugin with
  `selectedScheduleItemRefs`, `targetItemCount`, `maxItemCount`,
  `orderingConstraintRefs`, and retry budget remaining.
- `TraversalAttemptProgressRow` — typed per-attempt progress observation
  admitted by ABG.
- `TraversalForcedReviewGate` — projection emitted when backend ambiguity
  blocks semantic closure.
- `AgenticBackendProgressProfile` — backend-classifier carrier feeding
  modulation profile derivation.
- `TraversalAffect` — typed affect classification (not emotional prose) used
  by modulation profile derivation.

Strategy primitives (`TRAVERSAL_SCHEDULING_PRIMITIVE_VALUES`): primitive
labels are operator-meaningful tokens such as `bounded_batch` and
`ordered_schedule_prefix`. ABG enforces the enum and schedule refs; it does
not interpret arbitrary strategy strings.

Resolution order (`tryResolveTraversalStrategyDirectiveFromGtl`):

1. `GraphVector.declarations["abg.traversal_modulation"]` — edge qualifier.
2. `GraphFunction.declarations["abg.default_traversal_modulation"]` —
   function default.
3. `Role.policyHooks["abg.traversal_modulation"]` — role
   default.

Duplicate or malformed qualifiers fail closed. An F_P vector unqualified at
all three layers returns `null`. Unqualified vectors stay byte-identical to
the legacy unmodulated path; this is the load-bearing opt-in safety property.

Single dispatch-attempt law:

- `deriveModulatedFpAttempt` — sole modulation derivation site.
- `deriveFpDispatchAttemptInput` — sole F_P plugin input construction site,
  consumed by both `runEngineIterate` (sync) and `runEngineIterateAsync`
  (async).
- `fpDispatchAttemptStartedEvents` — sole start-side event emitter, ordered
  `fp_dispatch_requested → traversal_modulation_resolved →
  traversal_attempt_envelope_derived → actor_invocation_started →
  traversal_attempt_dispatched`. Modulation events fire only when the
  qualifier resolves.
- `fpDispatchAttemptNonProgressEvents` — sole non-progress emitter; returns
  empty when modulation is null.

Drift between sync and async runner modes on the modulation surface is
structurally prevented; both routes pass through the same helper.

Event kinds (constructed in `traversal_modulation.ts`):

- `traversal_modulation_resolved`
- `traversal_attempt_envelope_derived`
- `traversal_attempt_dispatched`
- `traversal_attempt_progress_observed`
- `traversal_attempt_non_progress_classified`
- `traversal_forced_review_projected`
- `traversal_same_edge_continuation_planned`
- `traversal_modulation_exhausted`

Builder rules:

- Declare the `abg.traversal_modulation` qualifier on agentic F_P vectors
  that need bounded schedule control. Vectors that should remain unmodulated
  carry no qualifier.
- F_P plugins consume `TraversalAttemptEnvelope` from the engine plugin
  input. The envelope is null on unqualified vectors.
- F_P / F_D boundary holds: modulation derivation performs only mechanical
  ref / length checks. Semantic judgment of `A.req_i → B.result_i` remains
  F_P plugin truth.
- Strategy primitives are descriptive tokens; ABG does not hardcode strategy
  semantics. Downstream policy resolves primitives into runtime behavior.
- Affect is typed classification, not emotional prose. Free-text affect on
  the runtime surface fails closed.

#### T-113/T-115 supervised actor/worker call-out and PTY terminal truth

T-113 and T-115 close the supervised actor/worker process surface. Framework
call-outs use `runAgentActorWorkerCallout` / `runAgentTransport`, and ABG
adapts them through `invokeSupervisedProcessActor`. No framework-owned
`agent.actor` or `agent.worker` path may bypass the traced process substrate.

The default executor profile is `local-spawn`: one fresh subprocess per call.
The explicit `pty-terminal` profile runs the command through a GNU
`screen -L` terminal transcript. If `pty-terminal` is requested, ABG must not
silently fall back to `local-spawn`. Missing `screen`, a child shell that
cannot execute the capability probe, terminal loss, or launch failure is
runtime truth and must be emitted as such.

Actor invocation and process events carry the same runtime identity envelope:

- `basisId`
- `graphFunctionId`
- `runId`
- `workKey`
- `graphCallId`
- `frameId`
- `vectorIndex`
- `edge`
- `actorInvocationId`
- `workerId`
- `backendId`
- `causationEventRefs`
- `correlationId`

Process events include:

- `actor_process_started`
- `actor_process_start_failed`
- `actor_process_stream_observed`
- `actor_process_heartbeat`
- `actor_process_timeout`
- `actor_process_signal_sent`
- `actor_process_exited`

`actor_process_started` and `actor_process_start_failed` both carry
`terminalSessionId`. For `local-spawn` this is null. For `pty-terminal` it is
the screen-backed terminal session identity, and the replay projection exposes
it on `actorProcessRefs`. A start failure is not a fake start: ABG emits
`actor_process_start_failed`, then terminal closure/exited facts as available.

Transport traces preserve `agentCalloutKind`, `actorRef`, `workerRef`,
runtime `workerId`, parser facts, and terminal session metadata. Adapter agent
keys must not replace the runtime `workerRef`.

#### T-114 bounded exit for modulated F_P attempts

T-114 adds fail-closed terminal exit for a modulated F_P attempt whose envelope
sets `mustExitAfterBoundedAttempt: true`.

When that attempt blocks after its bounded schedule work, ABG returns terminal
`gap_stop` with:

```text
reason = bounded_traversal_attempt_exit:<reason>
```

ABG does not schedule `retry_repair_planned` for this exit. The same rule holds
on sync and async runner paths. Downstream callers receive the public terminal
envelope and must treat it as a bounded attempt exit, not as an open retry lane.

#### T-116 plugin traversal observer binding for transform, evaluate, and consequence

T-116 admits GTL-declared plugin traversal observer bindings for transform,
evaluate, and consequence traversal.

ABG resolves one binding per traversal kind from:

1. `GraphVector.declarations["abg.plugin_traversal_observer.<kind>"]`
2. `GraphFunction.declarations["abg.plugin_traversal_observer.<kind>"]`
3. `Role.policyHooks["abg.plugin_traversal_observer.<kind>"]`
4. loaded `abg_defaults` fallback when absence is lawful and enabled

The selected binding appears on `EnginePluginInput.pluginTraversalObserverBinding`
for the matching plugin stage. ABG emits
`plugin_traversal_prompt_materialized` for each materialization with a unique
`materializationRef`, `promptInputDigest`, `selectionRef`, source, hook ref,
prompt refs, config digest, actor/worker identity when present, and
causation/correlation.

The event, not a prompt string, is the replay-visible proof that the observer
binding was selected and materialized. When `abg_defaults` supplied the
binding, the event also carries `defaultsBundleRef`, `defaultsBundleDigest`,
`defaultsPath`, and `defaultKey`.

#### T-117 visible ABG defaults bundle first slice

T-117 adds the first visible `abg_defaults` bundle slice. The source reference
bundle is:

```text
build_tenants/abiogenesis/typescript/config/abg.reference-fallbacks.json
```

The TypeScript installer installs an editable copy at:

```text
.abiogenesis/config/abg.fallbacks.json
```

The installed CLI loads that config through the runtime binding field
`abgFallbackConfigPath`, defaulting to the installed path above. A missing file
means no loaded fallback bundle. A malformed, partial, wrong-family, or
wrong-kind bundle fails closed. Installer refresh copies the reference bundle
only when the installed file does not already exist, so local edits are
preserved.

The T-117 bundle currently covers only plugin traversal observer fallbacks for
`transform` and `eval`. Full ABG defaults expansion for transport executor,
PTY commands/probes, parser inference, worker binding, trace paths, retry
budgets, traversal modulation defaults, M04 request defaults, and broader
installer defaults is future T-118 work. Do not document those as current
runtime defaults.

#### T-133 visible GTL target carrier defaults

T-133 adds a separate GTL defaults config for mandatory graph-vector output
carrier bindings:

```text
build_tenants/abiogenesis/typescript/config/gtl.target-carrier-defaults.json
```

The TypeScript installer installs an editable copy at:

```text
.abiogenesis/config/gtl.target-carrier-defaults.json
```

This config supplies the generic target-carrier template used when a vector does
not declare a product-specific `gtl.target_carrier_contract`. The effective
binding is still mandatory: there is no null binding and no code-defined
generic fallback. Missing or malformed config fails closed.

#### T-120 declared event calculus runtime law

T-120 makes ABG's Event Calculus commitment explicit. The runtime now declares
event-to-fluent law as a typed axiom table instead of leaving it implicit in
projection-local switch statements. T-119 temporal carriers and any later
fluent layer compile against this substrate; they do not introduce new
controllers.

EC carriers (`code/src/abg/m03/contracts/event_calculus.ts`):

- `RuntimeFluent` (`event_calculus.ts:48-66`) — a replay-derived fact
  candidate, scoped to one of `basis | run | graph_call | frame | vector |
  continuation | temporal`, with fluent-name from the closed
  `RUNTIME_FLUENT_NAME_VALUES` set: `basis_admitted`, `graph_call_open`,
  `frame_open`, `vector_traversal_planned`, `vector_evaluated`,
  `vector_closed`, `retry_repair_planned`, `continuation_open`,
  `continuation_terminated`, `reset_scope_active`, `temporal_timer_pending`,
  `temporal_timer_fired`, `temporal_eligible`, `scheduled_continuation_open`,
  `temporal_deadline_breached`.
- `RuntimeFluentPattern` (`event_calculus.ts:68-86`) — pattern shape used by
  `clips`/`declips` matching; nullable fields act as wildcards on the matched
  scope.
- `RuntimeEventCalculusEffect` (`event_calculus.ts:88-93`) — `{ initiates,
  terminates, clips, declips }` produced by an axiom for one event.
- `RuntimeEventCalculusAxiom` (`event_calculus.ts:99-106`) — typed mapping
  from `RuntimeEvent.kind` to a pure `deriveEffects(event, context)` function.
  One axiom per event kind. Duplicate or contradictory axioms fail closed.
- `RuntimeDerivedFluentRule` (`event_calculus.ts:108-114`) — pure ramification
  hook taking the current `holds` set and emitting additional derived fluents.
- `RuntimeEventCalculusProjection` (`event_calculus.ts:125-132`) —
  `HoldsAt` read model: `{ holds, effectRows, clippedFluentRefs,
  declippedPatternRefs }` derived by one replay function.
- `RuntimeEventCalculusReplayInput` (`event_calculus.ts:134-142`) — replay
  input: events, optional axioms (defaults to the registered table),
  `initiallyP` / `initiallyN` initial conditions, derived rules, and
  `undeclaredEventBehavior: "reject" | "ignore"`. Default is `reject`:
  unknown event kinds fail closed.

Replay law (proven by `test_t120_event_calculus_runtime_law.test.mjs`):

- `Initiates` adds the named fluent to `holds` if it was not already present.
- `Terminates` removes the named fluent from `holds`.
- Inertia: a fluent persists across events that do not terminate or clip it.
- `Clips` removes every fluent in `holds` whose pattern matches; clipped refs
  appear in `clippedFluentRefs`.
- `Declips` undoes a prior clipping scope when a matching pattern arrives.
- Reset scope is admitted via `reset_scope_active` clipping rather than
  silent projection mutation; correction shadows truth, it does not erase
  history.
- Aggregate projection consumes EC effects for `graph_call_opened`,
  `frame_opened`, and `vector_closed` lifecycle facts. T-121 carries
  continuation, retry, reset/correction, declipping, and derived-fluent
  projection parity beyond this first lifecycle slice.

Authority rule: EC replay derives `HoldsAt` read-model truth from admitted
events. ABG iteration/projection still owns advancement, ordering,
duplicate-closure, range, and traversal integrity checks. The EC layer does
not choose graph advancement, retry, or closure directly.

Failure classes that fail closed:

- undeclared `RuntimeEvent.kind` when `undeclaredEventBehavior` is `reject`;
- malformed `RuntimeFluent` (unknown name, unknown scope, malformed scope
  fields);
- duplicate `RuntimeEventCalculusAxiom` for the same event kind;
- contradictory effect (the same fluent appearing in both `initiates` and
  `terminates` of one effect);
- reset clipping a scope it does not legally apply to.

Design references:

- `build_tenants/abiogenesis/typescript/design/ABG_EVENT_CALCULUS_RUNTIME_LAW_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/ABG_EVENT_CALCULUS_IACS.md`
- `build_tenants/abiogenesis/typescript/design/ABG_EVENT_CALCULUS_STRUCTURAL_CARRIER_DIAGRAM.md`
- `build_tenants/abiogenesis/typescript/design/ABG_EVENT_CALCULUS_PROJECTION_REFACTOR_PLAN.md`
- `build_tenants/abiogenesis/typescript/design/ABG_EVENT_CALCULUS_T119_TEMPORAL_EXTENSION_CONTRACT.md`

#### T-119 GTL temporal algebra and schedule domain module

T-119 adds the first temporal slice to GTL. Time is modeled as an eligibility
dimension over graph functions and graph vectors, not as a hidden scheduler.
The central law is:

```text
time changes eligibility;
ABG remains the iterator.
```

Eligibility composition:

```text
eligible(edge, replay) =
  dependency_truth_closed(edge, replay)
  AND temporal_truth_allows(edge, replay)
  AND policy_truth_allows(edge, replay)
```

Temporal carriers (`code/src/abg/m03/contracts/temporal_algebra.ts`):

- `TemporalContext` (`temporal_algebra.ts:58-64`) — `{ contextRef, clockRef,
  calendarRef, timezoneId }`. Carrier for snapshot-bound time-source
  assumptions; lives at the GTL/ABG boundary.
- `TemporalConstraint` (`temporal_algebra.ts:66-76`) — temporal law attached
  to a `graph_vector`, `graph_function`, or `job`. First slice supports
  `operator: "not_before"` only; it carries `notBeforeRef`,
  `schedulePolicyRef`, the constraint's vectorIndex, and edge identity.
- `SchedulePolicy` (`temporal_algebra.ts:78-88`) — domain policy:
  `{ schedulePolicyRef, deadlineBreachAction, timerProviderRef }`.
  `deadlineBreachAction` is policy-selected from
  `observe_drift | block | retry | human_gate | reprice`. ABG does not
  hard-code one breach response.
- `TimerIntent` (`temporal_algebra.ts:90-105`) — admitted timer obligation
  bound to `(basis, graphCall, frame, vector, edge, constraint, provider,
  schedulePolicy)`.
- `TimerOutcome` (`temporal_algebra.ts:107-116`) — admitted provider outcome
  with `outcome: "timer_fired" | "timer_cancelled" | "timer_missed"` and a
  `providerReceiptRef`. Provider receipts are effects; only the admitted
  outcome event becomes runtime truth.
- `ScheduledContinuation` (`temporal_algebra.ts:118-134`) — replay-owned
  continuation reopened after a `timer_fired` outcome. Recurrence defaults to
  `ScheduledContinuation` over the existing graph-function boundary; fresh
  graph-call instances would fragment provenance and require explicit design
  justification (T-122).
- `TemporalProjection` (`temporal_algebra.ts:136-144`) — replay-derived read
  model: `{ eligibleVectorIndexes, pendingTimerIntentRefs,
  firedTimerOutcomeRefs, scheduledContinuationRefs, eventCalculus }`. The
  embedded `eventCalculus` field is the T-120 EC projection — `HoldsAt` is
  the source of eligibility, not a parallel surface.
- `TemporalDriftObservation` (`temporal_algebra.ts:146-154`) and
  `TemporalHomeostaticProjection` (`temporal_algebra.ts:156-161`) —
  homeostatic read model. Drift is reported through F_H regime, separate
  from edge-completeness closure. Schedule/SLA drift never folds into
  traversal completion.
- `TemporalConstraintGtlResolution` (`temporal_algebra.ts:163-171`) —
  canonical resolution of the GTL declaration to runtime carriers.

GTL declaration syntax. The first-slice temporal constraint is declared on a
`GraphVector` via `GraphVector.declarations` with attribute key
`abg.temporal_constraint` and a `hook_ref` value carrying the policy config.
The required config keys (`temporal_algebra.ts:47-54`) are:

```text
constraint_ref           — opaque ref for the declared constraint
operator                 — "not_before" (only operator in the first slice)
not_before_ref           — instant ref the constraint blocks before
schedule_policy_ref      — SchedulePolicy this constraint binds to
timer_provider_ref       — provider that arms timers for this policy
deadline_breach_action   — observe_drift | block | retry | human_gate | reprice
```

Sketch (mirrors `test_t119_temporal_gtl_syntax.test.mjs`):

```text
GraphVector {
  ...
  declarations: {
    entries: [
      {
        key: "abg.temporal_constraint",
        value: {
          kind: "hook_ref",
          value: {
            ref: "temporal-constraint://my-app/edge0",
            config: {
              entries: [
                { key: "constraint_ref",
                  value: { kind: "scalar", value: "temporal-constraint://my-app/edge0" } },
                { key: "operator",
                  value: { kind: "scalar", value: "not_before" } },
                { key: "not_before_ref",
                  value: { kind: "scalar", value: "instant://2026-05-06T12:00:00Z" } },
                { key: "schedule_policy_ref",
                  value: { kind: "scalar", value: "schedule-policy://my-app/not-before" } },
                { key: "timer_provider_ref",
                  value: { kind: "scalar", value: "timer-provider://my-app/stub" } },
                { key: "deadline_breach_action",
                  value: { kind: "scalar", value: "observe_drift" } }
              ]
            }
          }
        }
      }
    ]
  }
}
```

Resolution functions:

- `tryDeriveTemporalConstraintFromGtl({ basis, vectorIndex, vector })` —
  returns a `TemporalConstraintGtlResolution` if the vector declares
  `abg.temporal_constraint`, or `null` if not present. Duplicate qualifiers
  on one vector fail closed.
- `deriveTemporalConstraintFromGtl(...)` — same, but throws if the
  qualifier is missing.
- `constructNotBeforeConstraint`, `constructSchedulePolicy`,
  `constructTimerIntent`, `constructTimerOutcome` — pure constructors. Use
  these instead of hand-building carriers.

Three new admitted runtime events (`carriers.ts:1408-1469`):

- `timer_intent_admitted` — opens pending-timer obligation truth.
- `timer_outcome_admitted` — closes pending-timer truth and, on
  `timer_fired`, initiates eligibility for the governed boundary when
  dependency and policy truth also hold. Required identity preserved through
  admission: `schedulePolicyRef`, `providerRef`, `providerReceiptRef`,
  `timerIntentRef`, `timerOutcomeRef`, `outcome`, `correlationId`.
- `scheduled_continuation_reopened` — opens `ScheduledContinuation` after a
  fired timer. Same policy/provider identity preservation.

Each event has a declared T-120 EC axiom; replay derives temporal eligibility
through the same `HoldsAt` projection that drives lifecycle fluents.

Provider authority. Cloud timers, EventBridge schedulers, Step Functions,
Temporal, cron, queues, and saga providers may arm timers, wait, invoke
external services, hold callback tokens, and report receipts. They must not
select the next graph vector, close a traversal, decide convergence, or emit
authoritative runtime truth without ABG admission. The strict path is:

```text
GTL temporal constraint
  -> ABG admits TimerIntent
  -> provider arms timer
  -> provider returns outcome
  -> ABG admits TimerOutcome
  -> ABG replays temporal projection
  -> ABG decides eligibility and continuation
```

Evaluation-set assurance. `plugin.evaluate.C` runs evaluation rules over
admitted transform truth and read-only ledgers. ABG admits those rule outcomes,
collects the evaluation-set projection, and the ABG assurance fold decides
traversal completeness over an edge.
Schedule/SLA drift, missed windows, recurrence debt, and deadline pressure
feed a separate homeostatic evaluation surface (`TemporalDriftObservation`
in F_H regime). A graph function can be locally complete and still create
homeostatic pressure; the homeostatic loop routes that pressure to lawful
re-entry, mitigation, or repricing without weakening ABG's authority over
traversal.

What T-119 does not yet cover (deferred to T-122): deadline breach truth,
recurrence coalescing, window open/close events, schedule-policy consequence
selection beyond declaration, broader drift proof. The first slice operators
are limited to `not_before`. Operators `window`, `deadline`, `not_after`,
`retry_after`, `cooldown`, `recurs`, and `until` are reserved by design but
not yet implemented; do not author against them until T-122 lands.

Non-goals (do not write code that violates these):

- no `Date.now()` / wall-clock read decides eligibility, closure, retry, or
  deadline truth; time enters only as admitted timer outcome events;
- no provider receipt becomes runtime truth without ABG admission;
- no scheduler (cron, Step Functions, EventBridge, Temporal, runner loop)
  selects the next graph vector;
- no temporal evaluator regime is added; temporal evaluation is F_D over
  replay-derived temporal fluents;
- recurrence does not fragment provenance by minting fresh graph-call
  instances when `ScheduledContinuation` over the existing boundary
  preserves closure and proof truth.

Design references:

- `build_tenants/abiogenesis/typescript/design/GTL_TIME_ALGEBRA_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/GTL_TIME_ALGEBRA_IACS.md`
- `build_tenants/abiogenesis/typescript/design/GTL_TIME_ALGEBRA_STRUCTURAL_CARRIER_DIAGRAM.md`
- `build_tenants/abiogenesis/typescript/design/GTL_TIME_ALGEBRA_FIRST_PROOF_PLAN.md`
- `build_tenants/abiogenesis/typescript/design/ABG_SCHEDULE_RUNTIME_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/HOMEOSTATIC_LOOP_AFTER_EVAL_EVENT_DERIVATION.md`

## Graph-Span Foldback And Constitutional Reentry

T-103 admits foldback over a contiguous run of graph vectors and routes
reentry to the earliest implicated vector or, when the gap exceeds the local
graph, to a constitutional reentry point.

Carriers (`code/src/abg/m03/contracts/graph_span_reentry.ts`):

- `GraphSpanRef` (`graph_span_reentry.ts:50-60`) — contiguous span over
  `[sourceVectorIndex, terminalVectorIndex]` with `coveredVectorIndexes`.
- `GraphSpanEvaluationSchedule` (`graph_span_reentry.ts:62-70`) — schedule of
  spans terminating at one vector with a `generation` counter.
- `GraphSpanAssessment` (`graph_span_reentry.ts:81-98`) — one assessment of one
  span carrying obligation rows, carry observations, optional constitutional
  reentry payload, and `assessmentRegime` (F_P for any non-fulfilled status,
  enforced at `graph_span_reentry.ts:654-659`).
- `GraphSpanFoldbackEvaluation` (`graph_span_reentry.ts:100-120`) — fold result
  with `decision`, fulfillment counts, `reentryCandidateVectorIndexes`,
  `earliestReentryVectorIndex`, accumulated constitutional reentries.
- `GraphReentryFrontierProjection` (`graph_span_reentry.ts:141-152`) —
  replay-derived active reentry frontier with `decision` of `advance`,
  `reenter`, `constitutional_reentry`, `reprice`, or `block`.
- `GraphReentryPlan` (`graph_span_reentry.ts:154-168`) — the planned reentry
  with `targetVectorIndex`, `changeClass`, `reEntryPoint`, `routeContractRefs`,
  `shadowedVectorIndexes`, `causingFrontierRowRefs`.
- `GraphConstitutionalReentry` (re-exported from
  `graph_span_reentry.ts:41-48`) — the constitutional payload with
  `changeClass`, `reEntryPoint`, `targetGraphFunctionRef`, `routeContractRefs`,
  `authorityRefs`, `rationale`.

Five new event kinds:

- `graph_span_evaluation_scheduled`
- `graph_span_assessed`
- `graph_span_foldback_evaluated`
- `graph_reentry_planned`
- `graph_reentry_applied`

Earliest-implicated-vector reentry rule (`graph_span_reentry.ts:680-703`,
`deriveFirstBadVector`): for each span obligation row that is not fulfilled
and not constitutional, ABG walks `carryObservations` in source-vector order
and returns the first observation whose status is not `carried`. The set of
first-bad vectors across rows yields the foldback's
`reentryCandidateVectorIndexes`; `earliestReentryVectorIndex` is the minimum.
Reentry routes to that vector, not to the terminal edge.

`change_class` taxonomy (`carriers.ts:GRAPH_CHANGE_CLASS_VALUES`):

- `goal_reprice` — current work-wave focus changes.
- `intent_reprice` — direction or scope changes.
- `product_reprice` — current product shape changes while intent stays stable.
- `requirement_reprice` — constitutional truth changes while direction stays
  stable.
- `design_reframe` — realization structure changes while requirements stay
  stable.
- `realization_refactor` — local realization changes with no intended upstream
  change.

`re_entry_point` taxonomy (`carriers.ts:GRAPH_REENTRY_POINT_VALUES`):

`goals`, `intent`, `product_definition`, `requirements`, `design_surface`,
`realization`, `proof`.

A constitutional gap on a graph-span row (status `constitutional_gap`) requires
a `GraphConstitutionalReentry` payload with `routeContractRefs`,
`authorityRefs`, and `rationale`. Without the payload, admission fails closed
(`graph_span_reentry.ts:376-408`).

Frontier and plan projection
(`graph_span_reentry.ts:1122-1255`):

- The frontier accumulates rows per foldback event and clears them on
  `decision === "close"` for the matching terminal vector or when a
  `graph_reentry_applied` event references the row.
- Row severity priority: `block` > `constitutional_reentry` > `reprice` >
  `retry`.
- `deriveAdvancementTransitionWithReentry` (`graph_span_reentry.ts:1329-1388`)
  yields the next runtime action: `reenter_graph_vector`,
  `reenter_constitutional_route`, `reprice_required`, `blocked`, or
  `default_iteration` (delegating to the standard `IterationAdvanceDecision`).

Intent loop / homeostatic loop mapping:

| Substrate signal | Constitutional route |
| --- | --- |
| local span gap, target inside graph | `reenter_graph_vector` (realization refactor) |
| stale input, contradictory evidence | `reprice_required` (requirement_reprice or product_reprice) |
| `constitutional_gap` row with reentry payload | `reenter_constitutional_route` (`change_class` per payload) |
| blocked or unrecoverable | `blocked` |

The runtime treats reentry as governed iteration over the same execution
basis. Constitutional reentry does not erase prior runtime truth; it shadows
the vectors at and after the target vector
(`graph_span_reentry.ts:533-544`, `shadowedVectorIndexes`).

## What The App Produces

A GTL/ABG app produces more than application behavior.

It produces:

- a declared app model
- a graph-function catalog
- semantic jobs and roles
- evented runtime truth
- admitted payload and assurance facts
- projected run, graph-call, frame, and continuation state
- projected lifecycle or lineage registers
- proof and closure facts
- correction and supersession paths
- written testcase authority and proof lanes

This is the real output:

- the application behavior
- the governance and observability around that behavior

## Build Lifecycle

The build lifecycle is:

1. bootstrap the app boundary
2. initialize the configured instance
3. declare outcomes and transitions
4. publish graph functions
5. attach hooks and policy config
6. publish semantic jobs
7. run one graph call
8. inspect emitted runtime facts
9. correct, supersede, or reprice
10. prove capability through scenarios

This is the shortest useful builder loop.

## LLM Builder Algorithm

When building a new GTL/ABG app, execute this algorithm:

1. Read this guide and identify the substrate primitives you need.
2. Read the governing method, such as `ODD_METHOD.md`, when the product is method-shaped.
3. Read local goals, intent, product definition, requirements, and ratified design.
4. Name the typed domain assets or nodes.
5. Name the outcome states and lawful transitions.
6. Publish graph functions as the constructive carriers.
7. Bind semantic jobs to public graph functions.
8. Publish the module surface: graphs, graph functions, jobs, roles, refinement boundaries, and candidate families.
9. Attach policy hooks for dispatch, traversal modulation, plugin traversal observers, evaluation, escalation, proof, and closure. Keep F_P plugins for semantic judgment and F_D plugins for mechanics; do not collapse the two.
10. For graph functions that produce typed outputs, consume T-082 output allocation. When the start request crosses workspaces, supply an admitted T-104 `OutputWorkspaceBinding` (W2).
11. For per-edge zoom work, derive an `ObligationLedgerAsset` from the input asset, derive the `ObligationScheduleAsset`, open a `ZoomFrame`, and let ABG run the dispatch/assess/fold loop until the five-term `edge_converged` predicate holds.
12. For agentic F_P vectors that need bounded schedule control, declare `GraphVector.declarations["abg.traversal_modulation"]` (or a graph-function / role default). ABG resolves the strategy directive, derives the `TraversalAttemptEnvelope`, and passes it to the F_P plugin through one shared dispatch-attempt law on both sync and async runners. Vectors that should remain unmodulated carry no qualifier.
13. For modulated attempts that must not continue into retry repair after one bounded schedule, set `mustExitAfterBoundedAttempt: true` and handle terminal `gap_stop` reason `bounded_traversal_attempt_exit:*`.
14. For plugin traversal observers, declare `abg.plugin_traversal_observer.transform`, `.evaluate`, or `.consequence` on the edge, function, or role. If absence is lawful, load a visible `abg_defaults` bundle and explicitly enable the fallback kind.
15. Consume `TraversalContinuationActionProjection` to decide retry vs yield-same-edge vs reprice vs inspect-runtime-archive vs blocked. Do not parse continuation intent from prompt prose. When publishing your own candidate summary, validate against the projection with `assertTraversalContinuationSummaryAgreement` before emitting downstream.
16. Install or initialize the runtime surface. Installed TypeScript workspaces carry editable `.abiogenesis/config/abg.fallbacks.json`; preserve local edits on refresh.
17. Run `gen-start` through the concrete CLI binding.
18. Inspect events, projection, proof, closure, gaps, the zoom foldback decision, the graph-span reentry frontier, the modulation profile, the attempt envelope, plugin traversal observer materializations, actor/process projections, terminal session refs, and the typed continuation action.
19. Consume the graph-span foldback decision: close, retry the same edge, reenter at the earliest implicated vector, route a constitutional reentry per `change_class` and `re_entry_point`, or stop and reprice.
20. For capability claims, emit `EvalSuiteSpec` / `EvalTask` / `EvalTrial` / `EvalOutcome` / `EvalGradeVector` and read `EvalAggregateProjection.passAtK` and `passAllK` before claiming a capability has landed.
21. Correct, supersede, or reprice from emitted runtime facts.

Stop and reprice when:

- the intended work cannot be expressed as typed assets and graph functions
- the public carrier is a bare vector or hidden service method
- a required environment binding is not replay-visible
- two surfaces claim authority over the same runtime truth
- the runtime needs a compatibility bridge to keep old and new truth alive
- proof or closure depends on prompt text instead of declared policy and emitted facts

## Operator UX

The GTL/ABG app UX is artifact-first.

The primary operator surfaces are:

- **Define**
  - outcomes, transitions, graph functions, jobs
- **Build**
  - graph-function authoring and refinement
- **Run**
  - graph calls and active execution
- **Audit**
  - event stream, projections, proof, closure
- **Correct**
  - continuation resolution, supersession, retry, repricing
- **Prove**
  - scenarios, qualification, installed-dev evidence

The main visible objects should be:

- outcomes
- graph functions
- runs
- graph calls
- continuations
- evidence
- proof status

The UX should expose lawful next moves from runtime facts.

## Running The Current Kernel

The live kernel in this repo is `abiogenesis`.

The current source version is `3.8.0-rc.5`.

### Run from source

See the appendices for source-run commands in Python and TypeScript.

Operator commands fall into a tenant-invariant core and a Python-tenant
extension surface.

Tenant-invariant core, implemented by every tenant:

- `start`
- `gaps`
- `assess-result`
- `install`

Python-tenant extension commands, not yet present in the TypeScript tenant:

- `emit-event`
- `check-tags`
- `check-req-coverage`
- `check-impl-coverage`
- `check-validates-coverage`
- `check-bootloader-consistency`

The command grammar is tenant-invariant for the core surface. Python,
TypeScript, or another tenant may use different executable prefixes, but the
subcommand and flags after the binary stay the same. Extension commands are
authored in Python and are not part of the TypeScript CLI surface in this
release line.

```bash
<runtime-binary> start --workspace . --scope workspace --target next --until first_traversal
<runtime-binary> gaps --workspace . --scope workspace
<runtime-binary> assess-result --workspace . --result .ai-workspace/fp_results/<manifest-id>.json
```

See the appendices for common source commands, package entry examples, and the
current TypeScript package/API binding.

The public `gen-start` traversal request is `scope + target + until`.
Targets are `next`, `graph_function:<handle>`, and `asset:<handle>`.
Control modes such as `--fh-mode` and `--root-mode` stay outside that request
grammar and are lawful only with `--until converged`.

### Public runtime contract

In a CLI binding, the concrete command is `start`.

In the TypeScript tenant, the current package surfaces expose the same public
operator contract through APIs such as `publicStart`, `publicControlLoop`, and
`publicCallableStart`, and through package binaries `abiogenesis-ts` and
`genesis-ts`. A TypeScript binary or downstream app wrapper must bind the same
command suffix and flags as the Python CLI; only the executable prefix may
differ.

`start(...)` is the TypeScript RC entry that delegates to the ABG-owned
`start -> iterate` runner. `publicStart(...)` is a compatibility adapter over
that path, not a separate one-step execution loop.

The public operator contract is `gen-start`.

`gen-start` admits exactly one traversal request:

| Field | Values | Rule |
| --- | --- | --- |
| `--scope` | `workspace`, `work_key:<id>` | Selects the work scope. |
| `--target` | `next`, `graph_function:<handle>`, `asset:<handle>` | Selects the public work target. |
| `--until` | `first_traversal`, `blocked`, `converged` | Selects the stop condition. |

When the graph function reads inputs from one workspace and writes outputs to a
different workspace, the start carrier admits an additional T-104
`OutputWorkspaceBinding` (W2) alongside the input scope (W1). Allocation roots
derive under W2; input lineage stays bound to W1. A W2 supplied as a string
path without admitted binding fails closed.

Target law:

- `next` advances the next open job in scope
- `graph_function:<handle>` selects one published graph-function carrier
- `asset:<handle>` resolves through the operator asset registry and then selects the governing graph-function carrier
- unresolved, unsupported, unowned, or ambiguous targets fail closed

Stop-condition law:

| `--until` | Meaning |
| --- | --- |
| `first_traversal` | Stop after one visible advancement, dispatch, gate, blocker, or no-op. |
| `blocked` | Continue until a blocking condition is visible. |
| `converged` | Continue until the scope closes or cannot lawfully continue. |

Control-mode law:

| Mode | Values | Rule |
| --- | --- | --- |
| `--fh-mode` | `direct`, `human-proxy` | Lawful only with `--until converged`. |
| `--root-mode` | `direct`, `supervised` | Lawful only with `--until converged`. |

### Public `gen-gaps`

`gen-gaps` is observation, not execution.

It reads admitted module/job truth plus replayed runtime events and projects
current work state. It must not emit runtime events.

TypeScript `gaps` returns:

- `jobs_considered`
- `total_delta`
- `open_frames`
- `converged`
- `gaps[]` with `edge`, `status`, `delta`, `failing`, `passing`, and
  `next_step`

Use `next_step` to decide whether to run `start`, wait for or ingest
`assess-result`, satisfy a human decision, or stop.

Do not treat product-specific labels such as `proof_hold` as TypeScript `M04`
substrate taxonomy. Downstream products may project those labels from
canonical truth when they own that product surface.

`asset:<handle>` requires an admitted `operator_asset_contract`.

The contract command returns registry JSON with an `assets` collection.

Each asset entry identifies the asset and its operator target:

```json
{
  "assets": [
    {
      "asset_id": "code_surface",
      "uri": "file://build/code",
      "operator_target": {
        "kind": "graph_function",
        "handle": "code-flow"
      }
    }
  ]
}
```

### Public runtime loop

The CLI `start` command writes one JSON object to stdout.

The TypeScript `start` and `publicStart` APIs return admitted outcome objects
and emit runtime facts through the supplied event sink. `publicStart` delegates
to `start`, so callers must not depend on old single-advance behavior.

Read these fields first (per `code/src/cli/command.ts:820-836`):

| Field | Meaning |
| --- | --- |
| `command` | Always `"start"`. |
| `status` | One of `blocked`, `converged`, `nothing_to_do`, `yielded`, `error`. Both `dispatch_required` and `human_gate_required` collapse into `blocked`; use `stopped_by` to distinguish. |
| `target` | Admitted target string from `--target`. |
| `resolved_target` | Always `graph_function:<handle>` after CLI resolution of `next` / `asset:<handle>`. |
| `graph_function_id` | Resolved graph-function identity. |
| `asset_id` | Resolved asset identity for `--target asset:<handle>`, otherwise null. |
| `edge` | Edge from the first emitted `vector_traversal_planned` event, otherwise null. |
| `stopped_by` | Underlying control-outcome kind: `converged`, `dispatch_required`, `human_gate_required`, `yielded`, `rejected`. |
| `fh_mode` | Admitted F_H control mode. |
| `root_mode` | Admitted root control mode. |
| `event_kinds` | Ordered kinds of events emitted during this call. |
| `events_path` | Event log location written for replay. |
| `stop_class` | Classification of the stop, when present. |
| `control_outcome` | Full control-outcome carrier projection. |
| `live_status` | Live run status projection. |

Act from `status` and `stopped_by`:

| Signal | Lawful next move |
| --- | --- |
| `stopped_by = dispatch_required` | Read the F_P manifest produced for this call (path appears in the dispatch event), perform the manifest contract, preserve the manifest `prompt_assembly` / `prompt_compactions` contract as runtime truth, write the result under `OutputPluginHandoffManifest.allowedWriteRoots`, then run `assess-result --result <path>`. When the vector is modulation-qualified, agents read the typed envelope from the engine plugin input and the `traversal_attempt_envelope_derived` event. Downstream-consumer projection of the envelope into the worker handoff manifest is governed by the downstream-consumption gate; until it closes, agents read events directly. |
| `stopped_by = human_gate_required` | Satisfy the human lane or use lawful `--fh-mode human-proxy --until converged` when policy allows it. |
| `stopped_by = yielded` | Constructive work produced handoff truth; inspect emitted events, then resume or correct. |
| `status = converged` | Inspect events, projection, proof, and closure before claiming completion. |
| `status = nothing_to_do` | Confirm the admitted scope and target. No lawful advancement was available. |
| `status = error` | Treat the output as failed runtime or command admission, not as product truth. |

The runtime loop also emits graph-span foldback and reentry events. Read them
to know whether convergence is real or constitutional reentry was routed:

| Event kind | Meaning |
| --- | --- |
| `output_instance_allocated` | ABG minted a write root for one declared output. |
| `output_binding_admitted` | Asset binding admitted for an allocated or supplied input. |
| `output_materialization_observed` | Materialization observed inside the allowed write root. |
| `workspace_obligation_ledger_admitted` | Obligation ledger admitted from the input asset. |
| `workspace_obligation_schedule_derived` | Schedule derived from the ledger. |
| `zoom_frame_opened` | Per-edge zoom traversal opened. |
| `scheduled_slice_dispatched` | One schedule item dispatched on one attempt. |
| `scheduled_slice_assessed` | One attempt assessed (F_P semantic, or F_D `runtime_failed`). |
| `zoom_foldback_evaluated` | Five-term `edge_converged` evaluation admitted. |
| `graph_span_evaluation_scheduled` | Span schedule admitted at terminal vector. |
| `graph_span_assessed` | One span assessment admitted; constitutional reentry payload optional. |
| `graph_span_foldback_evaluated` | Span foldback decision admitted. |
| `graph_reentry_planned` | Reentry plan admitted with target vector or constitutional route. |
| `graph_reentry_applied` | Reentry applied; shadowed vectors recorded for downstream replay. |
| `traversal_modulation_resolved` | Strategy directive resolved from the GTL qualifier. |
| `traversal_attempt_envelope_derived` | Typed envelope derived from the modulation profile and passed to the F_P plugin. |
| `plugin_traversal_prompt_materialized` | Transform/Eval observer prompt materialized from GTL declaration or visible `abg_defaults` fallback, with digest and provenance. |
| `traversal_attempt_dispatched` | Modulated F_P attempt dispatched under the envelope. |
| `traversal_attempt_progress_observed` | Typed per-attempt progress row admitted. |
| `traversal_attempt_non_progress_classified` | Non-progress carrier classified into a typed continuation action. |
| `traversal_forced_review_projected` | Backend ambiguity blocked semantic closure; forced-review gate admitted. |
| `traversal_same_edge_continuation_planned` | Typed remaining schedule truth planned as same-edge continuation. |
| `traversal_modulation_exhausted` | Retry budget closed; modulation exhausted on this edge. |
| `actor_process_start_failed` | Supervised actor/worker process failed before start; identity and terminal session fact still enter runtime truth. |
| `actor_process_started` | Supervised actor/worker process started; `terminalSessionId` carries PTY identity when present. |
| `actor_process_heartbeat` | Supervised call-out liveness fact emitted while in flight. |
| `actor_process_exited` | Supervised actor/worker process exit fact admitted. |
| `terminal_reached` | Terminal transition admitted. `reason = bounded_traversal_attempt_exit:*` is a bounded-attempt fail-closed stop, not retry repair. |

CLI process exit codes classify the same loop for scripts (per
`code/src/cli/command.ts:770-789`):

| Code | Meaning |
| --- | --- |
| `0` | Converged or nothing to do. |
| `1` | Error (rejected without `gap_stop`). |
| `2` | F_P dispatch pending. |
| `3` | F_H gate pending. |
| `4` | Rejected with `gap_stop`. |
| `6` | Constructive work yielded handoff truth. |

F_P dispatch loop:

See the appendices for Python CLI and TypeScript package/API dispatch loops.

### Install the kernel into another workspace

See the TypeScript appendix for package install and bootstrap API patterns. The
Python installer is retained as paused reference material only.

The TypeScript installer creates:

```text
/path/to/project/.abiogenesis/
├── config/
│   └── abg.fallbacks.json
├── docs/
├── cli-runtime.mjs
├── install-manifest.json
└── install-provenance.json
```

`config/abg.fallbacks.json` is the editable installed ABG fallback config. The
installer copies it from
`build_tenants/abiogenesis/typescript/config/abg.reference-fallbacks.json` only
when the target file does not already exist.

Then run through the installed language surface described in the relevant
appendix.

### Traced agent call-out substrate

Every framework-owned call-out whose purpose is invoking an `agent.actor` or
`agent.worker` enters one library interface:

```text
agent.actor / agent.worker call-out
  -> runAgentActorWorkerCallout(request)
    -> runTracedProcess(request)
      -> executor (local-spawn | pty-terminal)
      -> parser (generic-text | claude-stream-json)
      -> typed TracedProcessOutcome
      -> per-call trace archive
```

Surfaces:

- `runTracedProcess` — process execution substrate. Owns spawn/PTY, stream
  capture, timeout/signal mechanics, parser invocation, archive writing.
- `runAgentActorWorkerCallout` — typed framework call-out interface. Carries
  `agentCalloutKind: "agent_actor" | "agent_worker"`.
- `runAgentTransport` — adapter that prepares an agent worker call-out from a
  named transport contract (claude/codex/gemini) and delegates to
  `runAgentActorWorkerCallout`.
- `invokeSupervisedProcessActor` — ABG runtime adapter. Translates
  call-out observations into `actor_process_started`,
  `actor_process_start_failed`, `actor_process_stream_observed`,
  `actor_process_heartbeat`, `actor_process_timeout`,
  `actor_process_signal_sent`, and `actor_process_exited` runtime events.
- No framework agent call-out path uses local `spawn` or `spawnSync`. The
  semantic guard in `test_t109_agent_callout_guard.test.mjs` enforces this.

Every actor invocation and process event carries the replay identity envelope:
graph function, run/work key, graph call, frame, vector, edge,
actorInvocationId, workerId, backendId, causation refs, and correlation id.
The trace metadata also preserves `agentCalloutKind`, `actorRef`, and
`workerRef`.

Executor profiles (`TracedProcessExecutorProfile`):

- `local-spawn` — fresh subprocess per call. Default. Deterministic for unit
  tests. `streamModel = "stdio"`.
- `pty-terminal` — literal terminal session backed by GNU `screen -L`.
  Terminal transcript captured under `terminal_session/screenlog.0`.
  `streamModel = "terminal-transcript"`. The substrate probes shell execution
  capability, not just `screen -ls`; if the daemon's child shell cannot run,
  the call returns `outcome.kind = "executor_unavailable"` with reason
  `screen_missing` or `screen_shell_unavailable`. A requested `pty-terminal`
  call does not silently fall back to `local-spawn`.

Parser registry (`TracedProcessParser`):

- `generic-text` — raw stdout is the final output.
- `claude-stream-json` — the substrate parses NDJSON stream events from
  `claude -p --output-format stream-json --verbose`, accumulates
  `apiRetryEvents`, `toolCallEvents`, and a final result text. Result-event
  text is canonical; assistant text chunks are a fallback for older or
  degraded stream shapes. The accumulator is a pure parser state with no I/O,
  so whole-log replay and live streaming share one implementation.

Typed outcome (`TracedProcessOutcome`) replaces nullable
`(status, signal, error)`:

| Outcome | Meaning |
| --- | --- |
| `exited` | Process exited with `status: number`. Inspect status and stderr. |
| `signaled` | Killed by a signal (e.g. `SIGTERM`, `SIGKILL`). |
| `hard_timeout` | Per-call wall clock exceeded `timeoutMs`. |
| `inactivity_timeout` | No output for `inactivityTimeoutMs`. Often an upstream stall. |
| `executor_unavailable` | Requested executor backend missing or unrunnable. Repair it or choose a different executor profile explicitly. |
| `launch_failed` | Subprocess could not start. Check command/args/cwd. |
| `process_error` | Node-level child error (ENOENT, EACCES, etc.). |
| `lost_terminal` | PTY session ended before the exit sentinel was written. Inspect `terminal_session/screenlog.0`. |

Agent transport failure classification (`AgentTransportFailureClass`):

- `transport_failure` — agent process did not deliver. Retryable per the ABG
  allowlist. Triggers include any non-`exited` outcome, pre-init crash
  (`structuredEventCount === 0` for claude-stream-json), `apiRetryCount > 0`,
  empty text and empty stderr with non-zero status, and `API Error:` /
  `ETIMEDOUT` / `ECONNRESET` patterns in error text.
- `no_output` — exit 0 with empty text. Agent ran but produced nothing.
- `contract_failure` — non-zero exit with stderr explanation. Agent rejected
  the input or the request was semantically invalid.

Only `transport_failure`, `no_output`, and `contract_failure` are
retry-eligible per the runtime allowlist.

### Live transport readiness

For live qualification, "CLI installed" is not sufficient.

You need:

- the agent CLI on `PATH`
- the agent callable from the workspace
- an active authenticated session

If live qualification reports transport unavailability, repair the agent/session
first. Do not misclassify that as a GTL or ABG product failure. The substrate
classifies transport unavailability as `outcome.kind = "executor_unavailable"`
or `failureClass = "transport_failure"` and writes a per-call trace archive;
inspect that archive before assuming a substrate or product defect.

### What constructive dispatch exposes

When ABG dispatches `F_P`, the engine plugin input and prompt surface:

- deterministic findings and obligations already observed for the live edge
- the resolved runtime environment for the live edge
- whether each binding comes from `external_entry` or `internal_carrier`
- the output contract and mandatory acceptance contexts
- execution rules that require the artifact to be updated before assessment
- the typed `TraversalAttemptEnvelope` when the vector carries a
  traversal-modulation qualifier; the envelope projects the selected
  schedule item refs, target / max item counts, ordering refs, and retry
  budget remaining. Unqualified vectors expose `traversalAttemptEnvelope =
  null` and stay on the legacy unmodulated path.
- the selected `pluginTraversalObserverBinding` for transform, evaluate, or
  consequence traversal when one resolves from GTL declaration or loaded
  `abg_defaults` fallback truth. Absence remains null unless fallback
  activation is explicit.

Builders consume the typed plugin input and prompt as the authoritative
execution contract for one live edge. Schedule control comes from the typed
envelope, not from prompt prose.

Do not read this as "every deterministic finding must be cleared before the
graph call can close."

The prompt surfaces deterministic observer truth so the builder can act with the
full live context. Whether an unresolved finding blocks closure is a declared
policy question, not a blanket transformation-time rule.

## What To Inspect After A Run

Inspect these in order:

1. `.ai-workspace/events/events.jsonl`
2. projected run state
3. projected graph-call state
4. open continuations
5. proof and closure facts

Ask these questions:

- what graph function was called
- what runtime facts were emitted
- what failed or remained open
- whether proof passed
- whether closure passed
- whether the run completed, failed, or was superseded

It is lawful for proof to pass and closure to pass while deterministic findings
or corrective obligations are still emitted as runtime fact truth, unless the
declared policy marks them as blocker-class conditions.

The post-mortem audit is the decisive operational surface.

### Per-call trace archive

Every traced call-out produces a self-contained archive at the request's
`archiveRoot`:

```text
<archiveRoot>/
  meta.json              session id, label, parser, executorProfile, streamModel, terminalSessionKey
  command.json           command, args, cwd, timeoutMs, terminationGraceMs, inactivityTimeoutMs
  events.ndjson          append-only trace events (one JSON object per line)
  stdout.raw             raw stdout bytes captured from the agent
  stderr.raw             raw stderr bytes captured from the agent
  final_output.txt       parser-derived final artifact text
  result.json            full TracedProcessResult including typed outcome
  terminal_session/      pty-terminal only: GNU screen log + transcript
    screenlog.0
```

`result.json` carries the canonical `outcome` (typed union) plus legacy
nullable `status` / `signal` / `error` fields and `terminalSessionId` when the
executor opened a terminal. New diagnostic code reads `outcome.kind` first; the
nullable fields are preserved for legacy callers and will be deprecated.

Trace event kinds in `events.ndjson` (non-exhaustive):

- subprocess lifecycle: `process_starting`, `process_started`, `stdout_chunk`,
  `stderr_chunk`, `process_signal_sent`, `process_exited`, `process_error`
- timeout: `hard_timeout`, `timeout_escalated`, `idle`,
  `inactivity_timeout_escalated`
- terminal lifecycle (pty-terminal only):
  `terminal_session_starting`, `terminal_session_started`,
  `terminal_turn_started`, `terminal_input_written`,
  `terminal_exit_sentinel_observed`, `terminal_turn_completed`,
  `terminal_session_unhealthy`, `terminal_session_closed`
- claude-stream-json parser: `structured_event_observed`,
  `api_retry_observed`, `tool_call_observed`,
  `structured_event_parse_failed`

For `runAgentTransport` callers there is also a sibling `<label>-transport.json`
adjacent to the trace archive carrying the typed `failureClass`,
`apiRetryCount`, `toolCallCount`, `structuredEventCount`, and a pointer to the
trace via `traceRoot` and `traceResultPath`.

### Diagnostic playbook

Symptom → first place to look.

| Symptom | Diagnostic path |
| --- | --- |
| Agent call returned no output and timed out | `result.json` `outcome.kind`. `hard_timeout` means the wall budget was exceeded; raise `timeoutMs` or tighten the prompt. `inactivity_timeout` usually indicates an upstream API retry storm — see retry storm row. |
| Suspected API retry storm under `claude-stream-json` | `result.json` `apiRetryEvents.length`. Walk `events.ndjson` for `api_retry_observed` to see attempt sequence and backoff. If retries exhausted the budget, classify as `transport_failure` and let the ABG allowlist drive retry policy. Do not raise `timeoutMs` blindly. |
| Pre-init crash (process exited non-zero with no observable agent output) | `result.json` `structuredEventCount === 0` plus `outcome.kind === "exited"` with non-zero `status`, or `outcome.kind === "process_error"`. Inspect `stderr.raw`. With `claude-stream-json` parser the absence of `init` system events triggers `failureClass = "transport_failure"`. |
| Agent emits TUI noise but no parseable JSON | `result.json` `structuredParseFailureCount > 0`. Walk `events.ndjson` for `structured_event_parse_failed` lines. Verify the agent invocation enables `--output-format stream-json`. |
| Tool exploration is eating the budget | `result.json` `toolCallEvents.length` and per-event entries. Walk `events.ndjson` for `tool_call_observed`. Tighten the prompt or disable tool use for the call-out. |
| PTY executor reports unavailable | `result.json` `outcome.kind === "executor_unavailable"`, with `reason: "screen_missing"` (no `screen` binary) or `reason: "screen_shell_unavailable"` (screen runs but the child shell cannot write the capability marker). Install `screen`, choose `executorProfile = "local-spawn"` explicitly only when policy allows it, or fix the shell environment. A requested `pty-terminal` call does not silently fall back. |
| PTY session ended without producing a final answer | `result.json` `outcome.kind === "lost_terminal"`. Inspect `terminal_session/screenlog.0` for the last terminal output. The session was closed before the exit sentinel landed; possible causes are external `screen -X quit`, OS signal, or the inner agent crashing without flushing. |
| Agent killed by SIGTERM mid-output | `result.json` `outcome.kind === "signaled"` with `signal: "SIGTERM"`. The substrate sent `SIGTERM` for either `hard_timeout` or `inactivity_timeout`; the prior typed outcome (in nested `terminal_*` events) names which. SIGKILL means the termination grace window was exhausted. |
| Agent finished cleanly but produced no text | `result.json` `outcome.kind === "exited"`, `status: 0`, `failureClass: "no_output"`. Prompt/contract problem, not transport. |
| Agent exited with stderr explaining rejection | `failureClass: "contract_failure"`. Inspect `stderr.raw`. Not retryable as transport; reprice the request. |
| `runAgentTransport` succeeded but ABG retry classification disagrees | Cross-check `transport.json` `failureClass` against `traced.outcome.kind` in `result.json`. Only `transport_failure`, `no_output`, and `contract_failure` are retry-eligible per `RETRYABLE_RUNTIME_FAILURE_CLASSES`. |

For an ABG-supervised call (via `invokeSupervisedProcessActor`), the same
trace archive is written under `<processEventsPath>.trace/` and the ABG event
stream additionally carries `actor_process_started`,
`actor_process_start_failed`, `actor_process_stream_observed`,
`actor_process_heartbeat`, `actor_process_timeout`,
`actor_process_signal_sent`, and `actor_process_exited` events. Successful and
failed start events both carry `terminalSessionId`; replay projection surfaces
that terminal id on `actorProcessRefs` when present. Heartbeats are emitted at
`heartbeatMs` intervals while the call-out is in flight; their absence is
itself a signal that the supervising actor was killed or the runtime stalled.

Do not paraphrase `result.json` `outcome` from prompt prose. Always read the
typed field. Outcome ambiguity in narrative summaries is the single most
common diagnostic miscalibration.

## First Practical Slice

If you are starting from zero, do this:

1. bootstrap the workspace
2. initialize one configured instance
3. declare one small outcome graph
4. publish one named graph function
5. publish one semantic job over it
6. run one graph call
7. inspect the event log
8. add one proof lane

That is enough to prove whether the app should stay on GTL/ABG.

## Appendix: Python Examples And Commands

The examples in this appendix are Python-shaped. They describe the same GTL/ABG
law as the TypeScript examples in the next appendix.

### Cumulative environment and composition

```python
capture_requirements = graph_function_for_vector(
    GraphVector("input_set→requirements", input_set, requirements),
)

synthesize_design = GraphFunction.from_graph(
    name="requirements_to_design",
    graph=Graph(
        name="requirements_to_design",
        inputs=(input_set, requirements),
        outputs=(design,),
        nodes=(input_set, requirements, design),
        vectors=(GraphVector("requirements→design", (input_set, requirements), design),),
    ),
    environment=EnvRef.from_contract(
        requires=(input_set, requirements),
        provides=(design,),
    ),
)

implement_code = GraphFunction.from_graph(
    name="design_to_code",
    graph=Graph(
        name="design_to_code",
        inputs=(input_set, requirements, design),
        outputs=(code,),
        nodes=(input_set, requirements, design, code),
        vectors=(GraphVector("design→code", (input_set, requirements, design), code),),
    ),
    environment=EnvRef.from_contract(
        requires=(input_set, requirements, design),
        provides=(code,),
    ),
)

executive = compose(capture_requirements, synthesize_design, implement_code)
```

### Asset surface declaration

```python
schema = Node(
    name="schema_surface",
    schema="SchemaSurface",
    asset_surface={
        "kind": "schema_surface",
        "required_contexts": ("dataset_profile",),
        "standards_refs": ("REQ-DATA-012",),
        "output_contract_refs": ("schema_contract_v1",),
    },
)
```

### Composed executive publication

```python
executive = compose(capture_requirements, synthesize_design, implement_code)
materialized = executive.materialize()

boundaries = tuple(
    RefinementBoundary(
        name=vector.name,
        inputs=vector.source if isinstance(vector.source, tuple) else (vector.source,),
        outputs=(vector.target,),
    )
    for vector in materialized.vectors
)

module = Module(
    name="delivery",
    graphs=(materialized,),
    graph_functions=(executive,),
    refinement_boundaries=boundaries,
    jobs=(
        Job(
            name="bootstrap_release",
            contracts=(ContractRef(kind="graph_function", target_id=executive.id),),
        ),
    ),
)
```

### Recursion and selection

```python
recursive = recurse(
    compose(capture_requirements, synthesize_design, implement_code),
    termination_ready,
    foldback={
        "binding": "outer_contract",
        "mode": "rebind",
        "requires_parent_evaluation": True,
    },
)

outer = GraphVector("input_set→code", input_set, code)
recursive_candidate = recursive

family = CandidateFamily(
    name="input_set→code_profiles",
    inputs=(input_set,),
    outputs=(code,),
    candidates=(recursive_candidate,),
)

outer_profile = graph_function_for_vector(outer)

selection = SelectionDecision(
    contract_id=outer.id,
    work_key=outer.id,
    graph_function=recursive_candidate.name,
    selected_by="policy",
    selection_mode="explicit",
    rationale="select recursive cumulative profile",
)
```

### Source commands

```bash
git clone https://github.com/foolishimp/abiogenesis.git
cd abiogenesis/build_tenants/abiogenesis/typescript
npm install
npm run build:semantic
node build/semantic/code/src/bin/abiogenesis.js --help
node build/semantic/code/src/bin/abiogenesis.js gaps --workspace ../../.. --scope workspace
node build/semantic/code/src/bin/abiogenesis.js start --workspace ../../.. --scope workspace --target next --until first_traversal
```

### F_P dispatch loop

```bash
genesis-ts start --workspace . --scope workspace --target next --until first_traversal
python -m json.tool .ai-workspace/fp_manifests/<manifest-id>.json
genesis-ts assess-result --workspace . --result .ai-workspace/fp_results/<manifest-id>.json
genesis-ts gaps --workspace . --scope workspace
```

### Install into another workspace

```bash
cd build_tenants/abiogenesis/typescript
npm run build:semantic
node build/semantic/code/src/bin/abiogenesis.js install --target /path/to/project
cd /path/to/project
genesis-ts gaps --workspace . --scope workspace
genesis-ts start --workspace . --scope workspace --target next --until first_traversal
```

## Appendix: TypeScript Examples And Commands

The TypeScript tenant is package-first, but public command grammar parity still
holds. A TypeScript binary or downstream app wrapper changes only the
executable prefix; the command suffix remains the shared product grammar.

Current TypeScript bindings expose the public runtime through package binaries
`abiogenesis-ts` / `genesis-ts` and typed APIs such as `publicStart`,
`publicControlLoop`, `publicCallableStart`, `resultAssessment`, and
`installBootstrap`.

### Shared builder imports and nodes

```ts
import {
  compose,
  constructCandidateFamily,
  constructContractRef,
  constructEnvRef,
  constructGraph,
  constructGraphFunction,
  constructGraphVector,
  constructJob,
  constructModule,
  constructNode,
  constructRefinementBoundary,
  constructTemplateRef,
  emptySerializedAttrs,
  graphFunctionForVector,
  materializeGraphFunction,
  recurse,
  type Evaluator
} from "@abiogenesis/typescript-tenant";

const emptyAttrs = emptySerializedAttrs();

const node = (name: string) =>
  constructNode({
    name,
    schema: { kind: "symbolic", ref: name },
    markov: [],
    assetSurface: {
      kind: name,
      requiredContexts: [],
      standardsRefs: [],
      outputContractRefs: []
    },
    tags: []
  });

const inputSet = node("input_set");
const requirements = node("requirements");
const design = node("design");
const code = node("code");
```

### Cumulative environment and composition

```ts
const captureRequirements = graphFunctionForVector(
  constructGraphVector({
    name: "input_set→requirements",
    source: [inputSet],
    target: requirements,
    operators: [],
    evaluators: [],
    contexts: [],
    rule: null,
    allowsSubwork: true,
    declarations: emptyAttrs,
    tags: []
  })
);

const requirementsToDesignVector = constructGraphVector({
  name: "requirements→design",
  source: [inputSet, requirements],
  target: design,
  operators: [],
  evaluators: [],
  contexts: [],
  rule: null,
  allowsSubwork: true,
  declarations: emptyAttrs,
  tags: []
});

const requirementsToDesignGraph = constructGraph({
  name: "requirements_to_design",
  inputs: [inputSet, requirements],
  outputs: [design],
  nodes: [inputSet, requirements, design],
  vectors: [requirementsToDesignVector],
  contexts: [],
  rules: [],
  effects: [],
  tags: []
});

const synthesizeDesign = constructGraphFunction({
  name: "requirements_to_design",
  environment: constructEnvRef({
    requires: [inputSet, requirements],
    provides: [design],
    carries: [inputSet, requirements, design]
  }),
  inputs: [inputSet, requirements],
  outputs: [design],
  template: constructTemplateRef({
    kind: "inline_graph",
    ref: "inline:requirements_to_design",
    graph: requirementsToDesignGraph,
    version: null
  }),
  effects: [],
  declarations: emptyAttrs,
  tags: []
});

const designToCodeVector = constructGraphVector({
  name: "design→code",
  source: [inputSet, requirements, design],
  target: code,
  operators: [],
  evaluators: [],
  contexts: [],
  rule: null,
  allowsSubwork: true,
  declarations: emptyAttrs,
  tags: []
});

const designToCodeGraph = constructGraph({
  name: "design_to_code",
  inputs: [inputSet, requirements, design],
  outputs: [code],
  nodes: [inputSet, requirements, design, code],
  vectors: [designToCodeVector],
  contexts: [],
  rules: [],
  effects: [],
  tags: []
});

const implementCode = constructGraphFunction({
  name: "design_to_code",
  environment: constructEnvRef({
    requires: [inputSet, requirements, design],
    provides: [code],
    carries: [inputSet, requirements, design, code]
  }),
  inputs: [inputSet, requirements, design],
  outputs: [code],
  template: constructTemplateRef({
    kind: "inline_graph",
    ref: "inline:design_to_code",
    graph: designToCodeGraph,
    version: null
  }),
  effects: [],
  declarations: emptyAttrs,
  tags: []
});

const executive = compose(captureRequirements, synthesizeDesign, implementCode);
```

### Asset surface declaration

```ts
const schemaSurface = constructNode({
  name: "schema_surface",
  schema: { kind: "symbolic", ref: "SchemaSurface" },
  markov: [],
  assetSurface: {
    kind: "schema_surface",
    requiredContexts: ["dataset_profile"],
    standardsRefs: ["REQ-DATA-012"],
    outputContractRefs: ["schema_contract_v1"]
  },
  tags: []
});
```

### Composed executive publication

```ts
const materialized = materializeGraphFunction(executive);

const boundaries = materialized.vectors.map((vector) =>
  constructRefinementBoundary({
    name: vector.name,
    inputs: vector.source,
    outputs: [vector.target],
    hints: emptyAttrs,
    tags: []
  })
);

const module = constructModule({
  name: "delivery",
  graphs: [materialized],
  graphFunctions: [executive],
  refinementBoundaries: boundaries,
  candidateFamilies: [],
  jobs: [
    constructJob({
      name: "bootstrap_release",
      contracts: [
        constructContractRef({
          kind: "graph_function",
          targetId: executive.id
        })
      ],
      roles: [],
      tags: []
    })
  ],
  roles: [],
  operators: [],
  evaluators: [],
  rules: [],
  imports: [],
  metadata: emptyAttrs
});
```

### Recursion and selection

```ts
const terminationReady: Evaluator = {
  name: "termination_ready",
  regime: "F_D",
  description: "deterministic termination predicate",
  binding: "hook://termination-ready",
  tags: []
};

const recursiveCandidate = recurse(
  compose(captureRequirements, synthesizeDesign, implementCode),
  terminationReady,
  {
    binding: "outer_contract",
    mode: "rebind",
    requiresParentEvaluation: true
  }
);

const outer = constructGraphVector({
  name: "input_set→code",
  source: [inputSet],
  target: code,
  operators: [],
  evaluators: [],
  contexts: [],
  rule: null,
  allowsSubwork: true,
  declarations: emptyAttrs,
  tags: []
});

const family = constructCandidateFamily({
  name: "input_set→code_profiles",
  inputs: [inputSet],
  outputs: [code],
  candidates: [recursiveCandidate],
  policyHints: emptyAttrs,
  tags: []
});

const outerProfile = graphFunctionForVector(outer);

const selectionDecision = Object.freeze({
  contractId: outer.id,
  workKey: outer.id,
  graphFunction: recursiveCandidate.name,
  selectedBy: "policy",
  selectionMode: "explicit",
  rationale: "select recursive cumulative profile"
});
```

### Source commands

```bash
git clone https://github.com/foolishimp/abiogenesis.git
cd abiogenesis/build_tenants/abiogenesis/typescript
npm install
npm run build:semantic
npm run test:semantic
```

Useful tenant proof commands:

```bash
npm run lint:semantic
npm run lint:test-harness
npm run test:t044
npm run test:t045
npm run test:t013
npm run test:t031
npm run test:t036
npm run test:t087
npm run test:t111
npm run test:t115
npm run test:t116
npm run test:t117
npm run test:t113:live
npm run test:t116:live
CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude npm run test:live
CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude npm run test:live:uat
```

Required installed command grammar:

The TypeScript package exposes binary aliases and typed APIs. A TypeScript
binary or downstream installed app wrapper must use this grammar; it may not
invent a different public command language.

The TypeScript package binary aliases are `abiogenesis-ts` and `genesis-ts`.

```bash
<typescript-runtime-binary> gaps --workspace . --scope workspace
<typescript-runtime-binary> start --workspace . --scope workspace --target next --until first_traversal
<typescript-runtime-binary> start --workspace . --scope workspace --target graph_function:code-flow --until first_traversal
<typescript-runtime-binary> start --workspace . --scope workspace --target asset:code_surface --until first_traversal
<typescript-runtime-binary> start --workspace . --scope workspace --target next --until converged --root-mode supervised
<typescript-runtime-binary> start --workspace . --scope workspace --target next --until converged --fh-mode human-proxy
```

### Public start API

```ts
import { publicStart } from "@abiogenesis/typescript-tenant/app/m04";
import type { RuntimeEvent } from "@abiogenesis/typescript-tenant/abg/m03";

const events: RuntimeEvent[] = [];

const outcome = publicStart(
  {
    scope: {
      kind: "workspace",
      workspaceRoot: "/workspace/delivery",
      moduleName: "delivery"
    },
    target: {
      kind: "graph_function",
      handle: "bootstrap_release"
    },
    until: "first_traversal"
  },
  {
    module,
    runtimeIdentity: {
      workerId: "worker://typescript-public-start",
      backendId: "backend://node",
      buildId: "build://local",
      resolvedRuntimeRef: "runtime://typescript/node"
    },
    resolvedPolicy: {
      resolvedPolicyBundleRef: "policy://default",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://default-fp",
      approvalSubjectRef: null
    },
    runId: "run://bootstrap-release",
    workKey: "work://bootstrap-release"
  },
  (event) => {
    events.push(event);
  }
);

if (outcome.kind === "blocked" && outcome.stopPredicate === "dispatch_required") {
  // Read the dispatch request/projection produced by the app-specific transport
  // surface, execute the manifest contract, then assess the result.
}
```

### Supervised public loop API

```ts
import { publicControlLoop } from "@abiogenesis/typescript-tenant/app/m04/control";

const controlOutcome = publicControlLoop(
  {
    start_request: {
      scope: {
        kind: "workspace",
        workspaceRoot: "/workspace/delivery",
        moduleName: "delivery"
      },
      target: {
        kind: "graph_function",
        handle: "bootstrap_release"
      },
      until: "converged",
      root_mode: "supervised",
      fh_mode: "direct"
    }
  },
  {
    module,
    runtimeIdentity: {
      workerId: "worker://typescript-public-start",
      backendId: "backend://node",
      buildId: "build://local",
      resolvedRuntimeRef: "runtime://typescript/node"
    },
    resolvedPolicy: {
      resolvedPolicyBundleRef: "policy://default",
      defaultRegime: "F_D",
      dispatchRef: null,
      approvalSubjectRef: null
    },
    runId: "run://bootstrap-release",
    workKey: "work://bootstrap-release"
  },
  (event) => {
    events.push(event);
  }
);
```

### F_P dispatch loop

```ts
import { resultAssessment } from "@abiogenesis/typescript-tenant/app/m04/result-assessment";

const startOutcome = publicStart(startRequest, context, eventSink);

if (startOutcome.kind === "blocked" && startOutcome.stopPredicate === "dispatch_required") {
  const transportArtifact = await runDomainTransport(startOutcome);

  const assessment = resultAssessment(
    {
      kind: "fp_assessed",
      dispatchRequest: transportArtifact.dispatchRequest,
      artifact: transportArtifact.resultArtifact,
      manifestProvenance: transportArtifact.manifestProvenance,
      publishedLedgerRef: { ref: "ledger://bootstrap-release" },
      fulfillmentRefs: transportArtifact.fulfillmentRefs
    },
    eventSink
  );
}
```

### Package install shape

```bash
cd /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript
npm run build:semantic
npm pack
cd /path/to/project
npm install /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/abiogenesis-typescript-tenant-3.8.0-rc.5.tgz
```

For product-owned bootstrap, use the package API:

```ts
import { installBootstrap } from "@abiogenesis/typescript-tenant/app/m04/install-bootstrap";

const installOutcome = await installBootstrap(
  {
    targetRoot: { rootPath: "/path/to/project" },
    installedPackageName: "@example/delivery-app",
    runtimePackage: {
      packageName: "@abiogenesis/typescript-tenant",
      packageVersion: "3.8.0-rc.5",
      dependencyRef: "file:./abiogenesis-typescript-tenant-3.8.0-rc.5.tgz",
      appExportSubpath: "./app/m04",
      requiredExports: [".", "./app/m04"]
    }
  },
  deliveryWriter
);
```

## Reference Surfaces

Use these when you need more detail:

- [ODD_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/ODD_METHOD.md)
- [SPEC_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/SPEC_METHOD.md)
- [USER_GUIDE.md](./USER_GUIDE.md)
- [GTL requirement families](../specification/requirements/gtl/README.md)
- [ABG requirement families](../specification/requirements/abg/README.md)
- [GTL/ABG mapping requirements](../specification/requirements/mapping/README.md)
- [Python design surfaces](../build_tenants/abiogenesis/python/design/README.md)
- [TypeScript design surfaces](../build_tenants/abiogenesis/typescript/design/README.md)
