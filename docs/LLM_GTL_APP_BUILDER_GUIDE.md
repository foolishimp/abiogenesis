# LLM GTL App Builder Guide

**Status**: Current GTL 3 / ABG 3.2.0 builder guide
**Audience**: LLM agentic coders building GTL/ABG domain apps
**Purpose**: Provide the LLM-facing axiomatic ontology and operating contract for building and running GTL/ABG apps

## Position

This is the first GTL/ABG document to give an LLM that must build or operate a
GTL/ABG app.

This guide defines the substrate ontology:

- what GTL is
- what ABG is
- what a GTL/ABG app boundary contains
- what the builder authors
- what ABG owns
- how graph functions become the constructive carrier
- how runtime truth is emitted, replayed, projected, proved, and closed
- how to run the current public kernel loop

This guide is not `ODD_METHOD.md`.

Use this guide first for GTL/ABG ontology and operation.

Use `ODD_METHOD.md` next when the product must be authored as an ODD product.

Then read the local product authority surfaces.

For an ODD-shaped product such as `odd_sdlc`, the read order is:

1. this guide for GTL/ABG substrate law
2. `ODD_METHOD.md` for ODD product-authoring law
3. local `GOALS.md`, `INTENT.md`, `PRODUCT.md`, requirements, and design
4. local code and tests as realization evidence

Do not treat this guide as domain semantics.

Do not treat `ODD_METHOD.md` as a replacement for local product authority.

## Axiomatic Substrate

GTL is the graph language.

ABG is the canonical runtime for GTL.

GTL declares constructive structure.

ABG executes declared structure and owns runtime truth.

The governing split is:

| Surface | Owner | Rule |
| --- | --- | --- |
| `Graph` | GTL | First-class structural type. |
| `Node` | GTL | Typed local locus of meaning. |
| `GraphVector` | GTL | Internal admissible transition contract between nodes. |
| `GraphFunction` | GTL | Public callable carrier for constructive work. |
| `Job` | GTL | Durable semantic work contract over published graph functions. |
| `Module` | GTL | Publication boundary for graphs, graph functions, jobs, roles, and selection surfaces. |
| `Policy Surface` | GTL/app declaration | Declarative law for dispatch, evaluation, escalation, proof, and closure. |
| `GraphCall` | ABG | Runtime realization of one published graph function. |
| `Frame` | ABG | Invocation-local runtime boundary for recursion or local execution. |
| `Continuation` | ABG | Open runtime obligation derived from emitted facts. |
| `Runtime Fact` | ABG | Event truth emitted through the runtime write boundary. |
| `Projection` | ABG/app read model | Replay-derived current state. |
| `Proof Lane` | app declaration plus ABG runtime facts | Declared proving path for capability or closure. |

The primary construction axiom is:

```text
constructive work = published graph functions over typed assets/nodes
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

`ExecutionBasis`, `AdvancementTransition`, `IterationAdvanceDecision`, and
`RegimeBindingSet` carry ABG 3.2 runtime law.

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

Minimal pattern:

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

Minimal pattern:

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

Concrete pattern:

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

There are now two lawful composition patterns.

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

Concrete recursive composition pattern:

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

assert recursive.inputs == (input_set,)
assert recursive.outputs == (code,)
assert tuple(node.name for node in recursive.environment.carries) == (
    "input_set",
    "requirements",
    "design",
    "code",
)
```

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

Concrete pattern:

```python
outer = GraphVector("input_set→code", input_set, code)

recursive_candidate = recurse(
    compose(capture_requirements, synthesize_design, implement_code),
    termination_ready,
    foldback={
        "binding": "outer_contract",
        "mode": "rebind",
        "requires_parent_evaluation": True,
    },
)

family = CandidateFamily(
    name="input_set→code_profiles",
    inputs=(input_set,),
    outputs=(code,),
    candidates=(recursive_candidate,),
)

outer_profile = graph_function_for_vector(outer)

module = Module(
    name="delivery",
    graphs=(
        Graph(
            name="delivery",
            inputs=(input_set,),
            outputs=(code,),
            nodes=(input_set, code),
            vectors=(outer,),
        ),
    ),
    graph_functions=(outer_profile, recursive_candidate),
    candidate_families=(family,),
    jobs=(
        Job(
            name=outer.name,
            contracts=(ContractRef(kind="graph_function", target_id=outer_profile.id),),
        ),
    ),
)
```

At runtime, selection is explicit:

```python
SelectionDecision(
    contract_id=outer.id,
    work_key=outer.id,
    graph_function=recursive_candidate.name,
    selected_by="policy",
    selection_mode="explicit",
    rationale="select recursive cumulative profile",
)
```

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
- `evaluation`
- `escalation`
- `proof`
- `closure`

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

### `role hooks`

Role hooks govern authority, assignment, and approval constraints.

### `candidate-family hints`

Candidate-family hints influence selection policy.

They do not become a second execution runtime.

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

ABG does not own domain semantics beyond declared law.

ABG interprets and enforces declared law.

### ABG 3.2.0 carrier law

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

## What The App Produces

A GTL/ABG app produces more than application behavior.

It produces:

- a declared app model
- a graph-function catalog
- semantic jobs and roles
- evented runtime truth
- projected run, graph-call, frame, and continuation state
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
9. Attach policy hooks for dispatch, evaluation, escalation, proof, and closure.
10. Install or initialize the runtime surface.
11. Run `gen-start` through the concrete CLI binding.
12. Inspect events, projection, proof, closure, and gaps.
13. Correct, supersede, or reprice from emitted runtime facts.

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

The current source version is `3.2.0`.

### Run from source

```bash
git clone https://github.com/foolishimp/abiogenesis.git
cd abiogenesis
PYTHONPATH=build_tenants/abiogenesis/python/code python -m genesis --help
```

Current commands:

- `start`
- `gaps`
- `emit-event`
- `assess-result`
- `check-tags`
- `check-req-coverage`
- `check-impl-coverage`
- `check-validates-coverage`
- `check-bootloader-consistency`

Common commands:

```bash
PYTHONPATH=build_tenants/abiogenesis/python/code python -m genesis gaps --workspace . --scope workspace
PYTHONPATH=build_tenants/abiogenesis/python/code python -m genesis start --workspace . --scope workspace --target next --until first_traversal
```

The public `gen-start` traversal request is `scope + target + until`.
Targets are `next`, `graph_function:<handle>`, and `asset:<handle>`.
Control modes such as `--fh-mode` and `--root-mode` stay outside that request
grammar and are lawful only with `--until converged`.

### Public runtime contract

The concrete CLI command is `start`.

The public operator contract is `gen-start`.

`gen-start` admits exactly one traversal request:

| Field | Values | Rule |
| --- | --- | --- |
| `--scope` | `workspace`, `work_key:<id>` | Selects the work scope. |
| `--target` | `next`, `graph_function:<handle>`, `asset:<handle>` | Selects the public work target. |
| `--until` | `first_traversal`, `blocked`, `converged` | Selects the stop condition. |

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

`start` writes one JSON object to stdout.

Read these fields first:

| Field | Meaning |
| --- | --- |
| `status` | Public result status. |
| `target` | Admitted target string. |
| `asset_id` | Resolved asset identity for `asset:<handle>`. |
| `edge` | Selected graph edge. |
| `stop_predicate` | Runtime stop reason projected from the typed advancement transition. |
| `fp_manifest_path` | F_P manifest path when constructive dispatch is pending. |
| `root_mode` | Admitted root control mode. |
| `root_supervision` | True when supervised root mode is active. |
| `live_status` | Live run status projection. |
| `proof_hold_active` | True when replay-derived proof-hold blocks public redispatch. |

Act from `stop_predicate` or `status`:

| Signal | Lawful next move |
| --- | --- |
| `dispatch_required` | Read `fp_manifest_path`, perform the manifest contract, write the result at manifest `result_path`, then run `assess-result --result <path>`. |
| `human_gate_required` | Satisfy the human lane or use lawful `--fh-mode human-proxy --until converged` when policy allows it. |
| `proof_hold` | Inspect `gaps --workspace . --scope workspace` and live status, then correct or reset the failed proof scope before rerunning. |
| `converged` | Inspect events, projection, proof, and closure before claiming completion. |
| `nothing_to_do` | Confirm the admitted scope and target. No lawful advancement was available. |
| `status = error` | Treat the output as failed runtime or command admission, not as product truth. |

Process exit codes classify the same loop for scripts:

| Code | Meaning |
| --- | --- |
| `0` | Converged or nothing to do. |
| `1` | Error. |
| `2` | F_P dispatch pending. |
| `3` | F_H gate pending. |
| `4` | Deterministic gap stopped advancement. |
| `5` | Iteration limit stopped convergence. |
| `6` | Constructive work yielded handoff truth. |
| `7` | Proof hold stopped redispatch. |

F_P dispatch loop:

```bash
PYTHONPATH=.genesis python -m genesis start --workspace . --scope workspace --target next --until first_traversal
python -m json.tool .ai-workspace/fp_manifests/<manifest-id>.json
PYTHONPATH=.genesis python -m genesis assess-result --workspace . --result .ai-workspace/fp_results/<manifest-id>.json
PYTHONPATH=.genesis python -m genesis gaps --workspace . --scope workspace
```

### Install the kernel into another workspace

```bash
python build_tenants/abiogenesis/python/code/gen-install.py --target /path/to/project
```

This installs:

```text
/path/to/project/.genesis/
├── genesis/
├── gtl/
└── genesis.yml
```

Then run:

```bash
cd /path/to/project
PYTHONPATH=.genesis python -m genesis gaps --workspace . --scope workspace
PYTHONPATH=.genesis python -m genesis start --workspace . --scope workspace --target next --until first_traversal
```

### Live transport readiness

For live qualification, "CLI installed" is not sufficient.

You need:

- the agent CLI on `PATH`
- the agent callable from the workspace
- an active authenticated session

If live qualification reports transport unavailability, repair the agent/session
first. Do not misclassify that as a GTL or ABG product failure.

### What constructive dispatch exposes

When ABG dispatches `F_P`, the prompt explicitly surfaces:

- deterministic findings and obligations already observed for the live edge
- the resolved runtime environment for the live edge
- whether each binding comes from `external_entry` or `internal_carrier`
- the output contract and mandatory acceptance contexts
- execution rules that require the artifact to be updated before assessment

Builders should expect this prompt shape and use it as the authoritative
execution contract for one live edge.

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

## Reference Surfaces

Use these when you need more detail:

- [ODD_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/ODD_METHOD.md)
- [SPEC_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/SPEC_METHOD.md)
- [GTL_Technical_Guide.md](./GTL_Technical_Guide.md)
- [GTL_3_CONSTITUTIONAL_DESIGN.md](https://github.com/foolishimp/abiogenesis/blob/main/specification/GTL_3_CONSTITUTIONAL_DESIGN.md)
- [ABG_3_CONSTITUTIONAL_DESIGN.md](https://github.com/foolishimp/abiogenesis/blob/main/specification/ABG_3_CONSTITUTIONAL_DESIGN.md)
