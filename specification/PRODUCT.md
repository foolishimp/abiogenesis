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

GTL reduces LLM drift by making lawful structure explicit, typed, and
axiomatic. The compiler/validator is expected to report typed law or typed
failure for graph, overlay, start, plugin, result-interface, catalog, and
carrier declarations rather than leaving agents or reviewers to infer
substrate legality from implementation files.

The product split is:

- GTL declares the program algebra
- LLMs construct lawful GTL expressions within that algebra
- ABG admits, executes, records, projects, and proves traversals
- downstream domains own asset meaning, domain HOW, and acceptance
  interpretation

Installed ABG owns the shared product toolchain contract for released GTL/ABG
products. A target workspace binds to immutable versioned product payloads,
command paths, reference docs, and standards through a selected product
manifest under the admitted toolchain root. The target workspace keeps observed
workspace assets, observer/control state, executor state, events, projections,
and archives as explicit mutable roots. The target `.abiogenesis/` surface is
the inspectable binding, provenance, runtime binding, and configuration
surface; it is not a product-library install root. `ABG_TOOLCHAIN_ROOT` is the
only environment selector. Legacy aliases, target-local full package copies,
top-level command shims, and implicit target-root product fallback are outside
the product contract.

Graph functions are reusable workflow library functions and callable work
contracts. A graph overlay or GTL program composition is the published program
surface that binds graph functions, node types, starts, roles, policies, proof
obligations, and plugin/result contracts. A graph function is product-real only
when it is discoverable through a module or job surface, materializable from
declared inputs and policy-visible parameters, callable through admitted
GTL/ABG program truth, and replayable through event and provenance truth.

ABG also owns the default recursive executive observer role for preserving
obligation pressure over admitted graph work. The observer is a graph function
over a declared target workspace and target work, expressed through existing
`GraphFunction.environment`, `Context` locator/digest, and asset-surface
required-context truth. It observes replay-derived ABG projections about the
target graph, admits `evaluate.C` findings as pressure facts, and feeds those
facts to ABG continuation, re-entry, reprice, block, or close-candidate
projection. It does not mutate the observed workspace, emit runtime events
directly, own closure, replace `consequence.C`, or create a second workspace,
observation, replay, continuation, or lifecycle ontology.

---

## GTL Contract-Law API Reload Anchor

`REQ-L-GTL3-CONTRACT-LAW-API` is the fast constitutional reload surface for GTL
capability and boundary review. It indexes the detailed GTL requirement
families rather than replacing them.

GTL is the product's contract-law API and graph algebra for graph-native
deterministic integrations. It owns graph algebra, typed graph program
declarations, graph-function interfaces, graph-vector identity and target law,
target-carrier contract definitions, hook and plugin boundary declarations,
prompt and typed asset-surface interfaces, module publication, and job or
public-start binding law.

GTL must be complete enough as a language to configure every product-visible
graph-program element that ABG admits or interprets. This includes graph
structure and interface law, `Operator`/`Evaluator`/`Rule` declarations,
selected `F_D`/`F_P`/`F_H` composition through `abg.fn_composition`, recursive
graph functions, higher-order graph algebra, selection and refinement
boundaries, prompt construction and typed assets, plugin/hook boundaries,
module/job/public-start bindings, and external tool gates.

ABG owns admission, interpretation, runtime events, payload ledgers, assurance
fold, traversal transition, continuation, correction, and replay. Downstream
products own domain meaning and product read models over admitted GTL/ABG
facts. They must not replace GTL contract law with product-local parsers,
prompt prose, plugin wrappers, or test-only inventories.

GTL `Operator` declarations are not the same category as ABG runtime
operations. Product-visible configuration for ABG runtime operations such as
start, graph call, frame opening, iteration, traversal selection, retry,
continuation, correction, replay, payload admission, worker binding, transport,
projection, assurance, and saga/frontier control must trace to GTL declarations
or ABG-admitted carriers over GTL declarations.

The programmatic ABG proof surface for downstream graph assets is
`typecheckGtlProgram(...)`, with raw input first admitted through
`admitGtlProgramConformanceInput(...)`. External tool surfaces, including MCP
endpoints, may be gated by GTL/ABG, but they are not the constitutional source
of GTL contract law.

`typecheckGtlProgram(...)` is also the normal inspection surface for traversal
law. A conforming downstream program publishes inventory; the validator projects
which graph functions, internal graph vectors, starts, overlays, plugin result
interfaces, and consequence catalogs can instantiate lawful traversal units and
typed bind options. Manual graph or overlay scanning is not the product's
normal substrate-validation mechanism.

This boundary derives from `REQ-L-GTL3-CONTRACT-LAW-API`,
`REQ-L-GTL3-LANGUAGE`, `REQ-L-GTL3-LAWS`, `REQ-L-GTL3-GRAPHVECTOR`,
`REQ-L-GTL3-GRAPHFUNCTION`, `REQ-L-GTL3-OPERATOR`,
`REQ-L-GTL3-EVALUATOR`, `REQ-L-GTL3-RULE`, `REQ-L-GTL3-RECURSE`,
`REQ-L-GTL3-HOF`, `REQ-L-GTL3-HOOKS`,
`REQ-L-GTL3-COMPUTE-NOTATION`, `REQ-L-GTL3-ASSET-SURFACE`,
`REQ-L-GTL3-MODULE`, `REQ-R-ABG3-FN-COMPOSITION`, and
`REQ-R-ABG3-INTERPRET`.

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

The programming abstraction boundary is: `GraphFunction` is a reusable
workflow library function and callable work contract; a graph overlay or GTL
program composition is the program that binds graph functions, vectors, node
types, roles, security, starts, policies, proof obligations, and plugin/result
contracts; a workspace is the mutable instance surface that supplies bootstrap
config, files, data, observed state, generated artifacts, and run archives.
ABG traversal runs over the admitted program plus admitted workspace binding.

| Type | Product meaning | Boundary |
| --- | --- | --- |
| `Graph` | Named topology of nodes and graph vectors. | It is the structural materialization surface, not the public callable workflow carrier by itself. |
| `Node` | Typed local locus of graph meaning, invariant state, markov conditions, and optional asset-surface declaration. | It is not an executable workflow carrier, public work entrypoint, or graph function. |
| `GraphVector` | Invariant traversal boundary and internal adjacency record from source node set to target node. It carries transition-governance declarations including dispatch intent, evaluation policy, escalation policy, deterministic proof surfaces, closure contract, assurance hook refs, other hook refs, and opaque hook config. | It is not a rival public ontology, public callable carrier, or semantic job target. |
| `GraphFunction` | Published reusable workflow library function and callable work contract. It has an explicit typed outer interface and cumulative environment contract, materializes a graph, and may realize one or more internal graph vectors. | It is not the whole product program, not a graph overlay/program composition, not a workspace, not a node, not the materialized graph itself, not a runtime graph-call attempt, and not the downstream asset produced by an attempt. |
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

`TraversalUnit<A, B>` names the closeable traversal atom over those existing
carriers. It is formal notation for a selected `GraphFunction` execution,
selected internal `GraphVector<A, B>`, selected `abg.fn_composition`, execution
and frame identity, admitted attempt/output/assurance/consequence truth, and
ABG replay disposition. It is not a new topology anchor, public callable
carrier, graph-vector rival, overlay, registry, runtime controller, or CLI
command.

This boundary derives from `REQ-L-GTL3-GRAPH`, `REQ-L-GTL3-NODE`,
`REQ-L-GTL3-GRAPHVECTOR`, `REQ-L-GTL3-GRAPHFUNCTION`,
`REQ-L-GTL3-JOB`, `REQ-L-GTL3-MODULE`, `REQ-L-GTL3-CONTEXT`,
`REQ-L-GTL3-OPERATOR`, `REQ-L-GTL3-EVALUATOR`, `REQ-L-GTL3-RULE`,
`REQ-L-GTL3-ROLE`, `REQ-L-GTL3-SYNTHESIS`, `REQ-L-GTL3-LAWS`,
`REQ-L-GTL3-LANGUAGE`, `REQ-L-GTL3-COMPUTE-NOTATION`, and
`REQ-R-ABG3-INTERPRET`.

---

## Ontology And Epistemology

Ontology names the lawful carriers. Epistemology names how facts are known,
admitted, projected, and authorized over those carriers.

The GTL ontology is the authored language surface: `Graph`, `Node`,
`GraphVector`, `Context`, `Operator`, `Evaluator`, `Rule`, `GraphFunction`,
`RefinementBoundary`, `CandidateFamily`, `ContractRef`, `Role`, `Job`, and
`Module`.

The ABG runtime ontology is the interpreter-owned truth surface: selected
`abg.fn_composition`, runtime events, `Run`, `GraphCall`, `Frame`,
`ExecutionBasis`, `AdvancementTransition`, `IterationAdvanceDecision`,
`Continuation`, payload admission, payload ledgers, assurance projection,
closure fold, traversal transition, and replay projection.

`TraversalUnit<A, B>` is the formal unit ABG opens, attempts, admits, closes,
and binds inside that runtime truth. It is a notation over the GTL/ABG carriers
above, not a separate runtime aggregate.

Downstream product ontology remains product-owned. A product may define pressure
maps, gain lenses, acceptance registers, lifecycle views, and domain read
models. Those are product projections over ABG-admitted facts, not new GTL or
ABG authority.

`C` is the GTL-facing notation for selected composition identity at the owning
boundary. It is shorthand over selected `abg.fn_composition`; it is not
`ComputeUnit`, not `ReliableCompute`, not a topology anchor, not a public
callable carrier, and not an ABG runtime carrier.

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
GTL composition. A purely deterministic event-sourced `F_D` run is a lawful
reduction of that model, not a separate execution surface.

The monadic unit is `TraversalUnit<A, B>`. Consequence bind is not the plugin
call alone. It is the combined boundary where `plugin.consequence.C` proposes
projection/action, ABG admits or rejects that consequence, derives traversal
transition, and replays continuation. That bind composes closed unit truth with
the next lawful unit, same-unit retry, re-entry, reprice, yield, block, or
terminal projection.

The function over the monad is intent-lineage preserving:
`traverse<A, B>(intent_lineage, context, A) -> (B, obligation_delta)`.
`intent_lineage` is admitted truth over intent refs, lineage refs, target-carrier
and materialization refs, carried obligations, residual pressure, staged
authority, and lawful basis refs. `obligation_delta` accounts for each carried
obligation as realized, refined, deferred to a named downstream traversal,
blocked, repriced, preserved as no-close pressure, or terminally projected.
ABG bind is therefore a conservation boundary: scalar edge close cannot erase
the obligation vector, and materializing traversal cannot dispatch until a
sufficient construction intent has been rehydrated from admitted lineage.

The obligation topology is discovered, not enumerated. Where a proof
surface's obligation instances depend on delivered artifacts — which
tests instantiate a depth class, which adversarial checks a delivered
map implies — the intermediate computation reveals the topology: each
admitted intermediate asset extends the obligation set, and
completeness is adjudicated against the extended set, never against the
startup enumeration. A proof surface whose obligation cardinality is
capped by initial declarations while admitted intermediate assets
lawfully extend it carries a typed gap, not implicit completeness.

Requirements are the product-level carrier for that conservation boundary.
A requirement is not only a prose row or a downstream-local obligation id. It is
an admitted algebraic term with stable identity, source provenance, typed
relations, traversal-span coverage, staged context bindings, evidence policy,
fold projection, residual pressure, and replay-visible query identity.

ABG/GTL core owns the generic requirement substrate. GTL exposes requirement
declarations through module, graph-function, graph-vector, context, role, job,
hook, and asset-surface law. ABG admits requirement event payloads, replays them
into `RequirementLedger` read models, builds edge-local requirement
environments, projects obligations and materialization or execution
expectations, binds evidence, maps requirement fold/residual states over the
existing assurance fold and continuation truth, and exposes query/read models.

`RequirementLedger` is a replay-derived projection over emitted requirement
events. It is not a writable side ledger, not a second event store, not a
product-local register, and not a rival closure surface. Product and downstream
ledgers may render requirement pressure as read models or retained
compatibility inputs, but they do not own ABG closure, retry, continuation,
re-entry, or event truth.

Destination topology is the HOW constraint framework through which a
requirement may need to be realized. A destination topology may describe tenant
family, technology stack, runtime model, packaging, deployment, proof topology,
regulatory frame, or another conformance surface. It is distinct from WHAT
requirement meaning and may constrain projection or materialization without
becoming the requirement itself.

The generic requirements algebra is intentionally closed-world for F_D. A
deterministic evaluator may validate admitted carrier shape, identity,
provenance, spans, relation refs, evidence policy, replay consistency, and
coverage gates. It must not infer product semantic satisfaction from unknown
syntax, file paths, worker prose, or local archive shape. Ambiguous or
ungrammatized content is routed to typed F_P pressure, and owner decisions or
explicit reprices are routed to F_H.

Composed `.C` stages share one stage-set shape. `transform.C`, `evaluate.C`,
and `consequence.C` may each plan ordered or parallel task sets under selected
composition. A scalar stage plugin is the one-task reduction of that shape, not
a second execution surface.

`plugin.transform.C` may produce candidates and evidence. `plugin.evaluate.C`
is an evaluation-set phase over read-only admitted facts. Its rules may
produce deterministic registers, semantic findings, gain, residual pressure,
continuation, evidence, authority, diagnostic, and proposed disposition refs.
The scalar F_P evaluator is only the one-rule reduction of that phase.
`plugin.consequence.C` may produce product read-model projection refs over
ABG-admitted state. Plugins do not write ledgers, emit runtime events, select
traversal, own replay, or close the boundary.

ABG admission is the boundary where proposed plugin payloads become runtime
facts. ABG.system owns graph call/frame opening, event emission, payload ledger
projection, assurance fold, traversal transition, continuation, closure,
correction, and replay truth. `F_H` is an external callout regime: ABG admits
or emits the callout boundary and later admits the response event/carrier; human
work itself is outside the ABG system.

This boundary derives from `REQ-L-GTL3-COMPUTE-NOTATION`,
`REQ-L-GTL3-HOOKS`, `REQ-L-GTL3-EVALUATOR`,
`REQ-R-ABG3-FN-COMPOSITION`, `REQ-R-ABG3-PAYLOAD`, and
`REQ-R-ABG3-ASSURANCE`.

---

## Probabilistic Compute Boundary

Abiogenesis treats `TraversalUnit<A, B>` as the bounded unit of probabilistic
compute: one closeable GTL edge traversal under a published graph-function
execution, selected internal graph vector, selected composition, admitted
attempt envelope, admitted outputs, assurance fold, consequence projection, and
ABG replay disposition.

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

ABG.Fn composition binding is mandatory wherever a graph function, graph
vector, evaluator, rule, or operator boundary combines deterministic,
probabilistic, or human/held-out regimes for traversal selection, evidence,
optimization, or closure. The selected composition identity binds the host GTL
surface, ordered regime roles, standards context, policy context, carrier
context, assurance context, and deterministic closure predicate. F_P and F_H
contributions are evidence or judgment states under that identity; they are not
closure law. F_P-to-F_D optimization is lawful only when an admitted equivalence
contract preserves the source composition identity through positive and negative
cases.

Execution-bearing edges default to the generic typed F_P traversal: the
edge declares, through typed input and output contracts, that the
probabilistic worker executes the built unit, test suite, data
generation, or other declared plan and returns a typed execution-result
asset. The worker's run-and-iterate path is hidden interior freedom;
the returned result is candidate material until deterministic
mechanical checks and admission make it truth. F_D-specific execution
interiors are optimizations: they enter a program only through the
reflective layer's ratified annealing proposals under the equivalence
contract above, never by preemptive design.

ABG owns the governance and control truth around an invocation of that
traversal. It binds the traversal to a worker, tool, or agent; records events
and provenance; projects state; classifies outcomes; and advances only through
lawful next steps.

Traversal-unit states are replay-derived, not controller memory. A unit may
close, retry, repair, re-enter, reprice, yield, block, or terminate only through
ABG-admitted runtime truth and catalog-bound consequence bind.

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

When a downstream product declares a steel thread or dependency fan-out from its
own content, that declaration is admitted product authority, not a runtime
concurrency command. ABG may realize the same declared work serially or as
bounded parallel branch execution. Product meaning is stable across both
realizations when dependency declarations, target/output/evidence expectations,
write territories, and fan-in meaning are unchanged. Parallel execution is an
ABG runtime admission consequence over replay, branch identity, idempotency,
leases, liveness, policy, and disjoint write territory.

System parallelism is an immutable semantic boundary over admitted carriers and
replay-derived projections. The shared mutable workspace remains an effect edge
guarded by observed-state, write-territory/output-allocation, staging,
publication, and admission truth.

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
- `GraphFunction` as the primary reusable workflow library function and
  callable work contract
- graph overlays or GTL program compositions as the program surface that binds
  graph functions, vectors, node types, roles, security, starts, policies,
  proof obligations, and plugin/result contracts
- edge traversal contracts as the admissible external space for probabilistic
  compute
- lawful composition, substitution, recursion, and higher-order graph operators
- module publication and engine-independence boundaries
- temporal-property law: GTL temporal properties as a Rule kind checked as
  total three-valued functions over finite replay traces, with safety
  gating on the composed evaluation path (per-vector online formulas
  arrive with the consciousness wave's tuner work), residual-routed
  liveness, vacuity rejection, and the standing audit gates as the
  first declared property set (REQ-L-GTL3-TEMPORAL-PROPERTIES);
- authoring-loop meta-law: ratified diagnostic identities with admissible
  repair affordances, canonical authored form and declarations-as-data,
  golden instance bindings, declared underdetermination, declaration
  authorship, and the language conformance corpus

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
- selected product manifest refs for method standards and reference docs
- a cold-agent-readable bootstrap surface

Installed standards are product reference payloads resolved through the
workspace binding and selected product manifest. They make cold-agent
references stable without copying a full standards tree into every target
workspace. They do not become the upstream source of shared method law when the
method itself is edited.

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

`fh_mode` defaults to `direct`; `root_mode` defaults to `supervised`. Both are
public control-mode truth above the adapter.
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

The ownership law across that boundary is strict. GTL provides
declarative syntax. ABG interprets it and provides the runtime kernel:
everything that executes, admits, derives, or gates is ABG-owned
mechanism. Downstream products own domain knowledge — types,
decomposition, vocabulary, policy data, calibration, and read-only
interpretation — and own no systems functionality. A downstream surface
that executes plans, runs processes, derives truth, or adjudicates
completeness is misallocated mechanism, not product realization.

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
  retained for history and comparison evidence, not an active RC gate
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

- graph overlays or GTL program compositions are the program surface
- graph functions are reusable workflow library functions and callable work
  contracts inside that surface
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

## Heart of Gold: The Compute Architecture

ABG is the code engine. GTL is the language. HoG.GTL is the
system-level composition written in GTL — HoG IS ABG running HoG.GTL.
The engine's substrate surface is: seven algebra primitives, five spine
event kinds, one judgment router, one census, and law. Everything
richer is admitted GTL configuration.

### The algebra

Traversal A→B carries compute C as a tuple over the fibres
{F_D, F_P, F_H}. Each edge runs its DECLARED program of C calls;
the canonical triple [transform, evaluate, consequence] is baked only
as bootstrap P0. The generator set: C.of (unit), C.id, C.compose
(Kleisli sequencing, associative, flat unless lifted), C.edge,
workflow.C (the named lift — the recursion functor), C.batch,
C.retry. Compose is closed; boundaries exist only via named lifts:
every spine level corresponds to an admitted program identity.
All-F_D degenerates to a workflow engine; all-F_H to a human process;
truth is shape-preserving under fibre substitution
(`REQ-R-ABG3-CCALL-001..-015`).

### The envelope

One locus-only spine per C call (opened → fibre-selected →
evidenced → result-admitted → judged); fibres are admitted interior
rows, never spine structure. The judgment vocabulary {advance, retry,
pending, blocked, escalated, no_declared_check} routes the monad;
no_declared_check is never gate-satisfying. External work sessions in
archives equal external-work-bearing spine invocations in replay — the
engine's cost and coverage are readable from its own truth.

### Programs are configuration

Workflow shape is product-declared data compiled through one isolated,
versioned syntax (`hog-syntax/*`), never engine code. Configurations
are LABELLED and coexist — a declared catalog of named programs with
per-edge selection by ref — so tuning is addressable per edge-class at
both the workflow level and the prompt level (per-stage instruction
categories, the inlined form under gate invariance). Stage
explicitness is capability-relative: cognitive stages reify as explicit
nodes for weaker workers or inline as instruction categories for
stronger ones — the regulator/process/checklist isomorphism — while
verification gates remain explicit at every compression level
(`-015`). Proportionality is the composable measure over C calls:
declared class reconciles against replay-observed cost, and sustained
divergence is a typed signal.

### The atom criterion

The product's deliverable is its ATOM SET, judged on exactly two
properties: ROBUST (fail-closed admission, gated advancement, replay
audit — an atom that can be misused silently is not done) and
COMPOSABLE (one algebra, declared boundaries, reference joins — an atom
that only works in one arrangement is not an atom). Higher-order
decision networks — tuners, intent observers, lifecycle overlays,
consensus panels — are FREE CONSTRUCTIONS over these atoms: unbounded
in number, each inheriting admission, gating, drift-witnessing, and
audit without new engine law. Every wave of work is accepted against
this criterion: does it strengthen atom robustness or composability;
feature count is not a measure.

### The reflective boundary

Allocation over scarcity (which calls earn effort, which anneal to
F_D, which few escalate to F_H — the scarcest resource) belongs to a
reflective layer that consumes replay and authors DECLARATIONS only:
solve loops write candidates, optimize loops write terms, and no
program does both in one judgment. ABG remains the sole truth
authority at every layer.

The workspace is the underlying reality: mutable, concurrent, forever
changing, and known only through telemetry. Telemetry is attributed
point-measurement of a region of reality at an instant; replay is the
append-only measurement record — epistemic truth, never reality
itself; every projection is a model over measurements. Drift between
model and reality is the default condition, bounded by attributed
measurement, single-writer mutation windows, and scheduled
re-measurement — never assumed away.

Regulation is a view, not a layer of command. Every actor operates
through a bounded, admitted view of the one record; a tier is a
coordinate choice over the same substrate — the same machinery and the
same worker class pointed at the system's own telemetry instead of the
worksite. Recursion is view restriction: narrower scope, finer
resolution, opened only through published refinement boundaries.
Defects concentrate at the transitions between views, where no local
evaluator can see them in principle; the reflective layer is the view
whose coordinates are those transitions.

The reflective layer holds an internal model of what is intended (the
constitutional surface), receives telemetry, and the gap between them
drives an intent process that covers solutioning up to — never into —
action: the TICKET is its only effector, behind F_H ratification, and
its drafts re-enter the system as ordinary admitted work. It has no
downward control path. Local-loop tightening (evaluator calibration,
F_D annealing under admitted equivalence contracts) arrives as the
reflective layer's OUTPUT derived from telemetry, never as hand-tuning.
A proving campaign's deliverable is always the builder, not the
scenario artifact; capability claims require frozen law — runs whose
declarations were amended mid-flight are diagnostic history, not
closure evidence.
