# Abiogenesis — Product

**Product ID**: PROD-001
**Date**: 2026-07-11
**Updated**: 2026-07-16
**Status**: Approved
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

## Current Product Contract

Abiogenesis is one source-independent installed GTL and ABG product for a
trusted developer desktop. It publishes immutable product identity, public
contracts, a native catalog, a public SDK, a thin native CLI, replay-citable
runtime truth, bounded Consensus, self-conformance, and exact release evidence.

### Installed And Catalog Product

An Abiogenesis release is an immutable product selected by exact identity,
version, digest, interface, dependency, and manifest truth. A source-blind
consumer can verify and install it from a Git release artifact or tarball
without importing the mutable source project.

The immutable Product manifest explicitly selects one base SYSTEM One Surface
GTL program basis and the published Module and GraphFunction declaration bases
shipped by the Product. These are installed defaults only in the sense of
explicit Product selection. A workspace-specific applied program is created
only by admitted `catalog.apply`; the Product manifest, installer, CLI, and
omitted input never precompute or mint that application authority.

Catalog products are independently versioned products. A workspace may bind an
exact ABG product and one or more exact compatible catalog products. Their
admitted contributions enter one ABG-owned catalog under one identity,
compatibility, conflict, provenance, and allowlist law. Catalog presence grants
no runtime authority.

`GraphFunction` is the sole named callable catalog contribution. Retained node
types and overlays are inspectable and may participate in admitted program
binding, but they are not independently callable. Workers are invoked only
through a selected published graph function. Catalog products do not dispatch
workers, emit ABG events, construct continuations, retry traversal, or decide
closure.

### Public Operator Product

Abiogenesis publishes one source-blind public SDK. The native `abg.cli` graph
shell is a thin adapter over that SDK and owns no separate runtime behavior.
The public product covers:

- source-blind workspace creation and opening;
- exact product resolution, verification, installation, binding, catalog
  admission, and inspection;
- admitted-program GraphFunction invocation, start, and continuation;
- status, result, evidence, and replay reads;
- gaps and replay-derived lawful-action reads;
- typed F_H selection, approval, rejection, assessment, escalation response,
  and continuation;
- assessed-result admission and witnessed operator acts;
- observer reports and tuner report, proposal, ratification, and rejection;
- GTL program conformance; and
- exact candidate qualification and release snapshot materialization.

Every operation is a derived projection of one public function-definition
family and publishes typed inputs, outputs, defaults, errors, actor attribution,
workspace-binding cardinality, and read-versus-write semantics. Read operations
project admitted truth and do not mutate it. Mutating operations enter through
the owning admission boundary and record attributed truth. The SDK, CLI, and
host projections cannot order One Surface, select private traversal state, or
become a second controller.

A host-neutral invocation descriptor may carry one public invoke/start request
between native, CLI, and host adapters. It binds the public operation-contract
version, admitted GTL program, exact workspace authority and binding when the
operation requires one, exact product and catalog identities, selected
GraphFunction membership and input contracts, session allowlist, capabilities,
and declared steering inputs. Mutable observation and replay truth remain
separate inputs. The descriptor is data for public admission, not a worker call,
continuation, or controller.

The primary operator workflow is an interactive application of the admitted GTL
One Surface program: invoke or start admitted work, receive one truthful stop,
hold, gap, or terminal result, inspect the lawful frontier, remove one ambiguity
or submit one typed F_H response, and continue. ABG interprets the program,
resolves continuation, and remains the sole owner of traversal and closure.

ABIogenesis 5.0 also publishes one bounded ABG SYSTEM-owned Consensus
GraphFunction. A calling agent invokes it through the existing
`run.invoke` operation and reads its typed decision, dissent, result, lineage,
and replay truth through the `project.read` operation. The graph function binds
declared reviewer profiles, admits attributed findings, and returns one declared
`closed_done`,
`recurse_next_round`, or `escalate_fh` outcome. It is a free construction over
the ordinary GTL and ABG atom set, not a new CLI verb, engine loop, scheduler,
ticket-status authority, or automatic ticket mutation.

### Conformance And Reflective Product

The released product publishes the GTL and ABG capability and contract surface
against which a build tenant, catalog product, or program claims conformance.
Native types own locally decidable authoring validity, raw admission owns
serialized validity, the semantic compiler owns whole-program relations, and
runtime admission owns environmental facts and probabilistic results.

ABIogenesis applies the same specification-method, contract, semantic, runtime,
proof, and release rules to its own frozen specification, design, realization,
ticket or execution-contract, public-contract, proof, qualification, and
release-candidate surfaces. Self-conformance and candidate qualification bind
the exact subject and explicit qualification-law basis. They return typed
findings and dispositions through the ordinary conformance path. The product
has no exemption and no second checker defines release truth.

The exact candidate binds two lineages without conflating them:
`QualificationLawBasis` owns authoritative STDO source law; the Product and
context manifest own the verified compressed projection used for cold-agent
context. ABIogenesis verifies the tapped release and mapping but does not
re-adjudicate STDO's release receipt.

The current observer and tuner are product capabilities over ABG replay truth.
The observer diagnoses pressure and may draft lawful re-entry work. The tuner
may draft policy or declaration changes. Drafts do not mutate effective truth;
attributed ratification and ordinary constitutional re-entry remain required.

### Stable Baseline And Successor Dogfood

ABIogenesis 5.0 is the stable, SPEC_METHOD-compliant full-product baseline. Its
mutable source project is authored and built through manual STDO governance,
accepted design gates, GTL admission, the ABG semantic compiler, and ordinary
in-tree implementation. Its release cut is qualified against the exact tapped
STDO 2.0 authoritative-source basis selected by this Product, together with
the same specification, design, public-contract, proof, and release law that
the installed product publishes. This qualification choice neither makes STDO an
ABG runtime dependency nor delays the installed runtime proof; it becomes
mandatory at the DS-6 exact-candidate join. The 5.0 release does not claim
self-hosting and does not require a prior installed ABG product, GLC product,
or odd_glc product to build or qualify it.

Recursive dogfooding begins after the stable 5.0 product is released. odd_glc
may first mature to 1.0 over exact installed 5.0. The installed 5.0 product and
odd_glc 1.0 may then act together as the development product used to author and
build the 5.0.1 source project through declared graph functions and public
contracts. That 5.0.1 successor run is the first dogfood proof. It is not
retroactive evidence for the 5.0 release and cannot block or redefine the 5.0
stable tap.

odd_glc remains an independently versioned downstream catalog product. It may
bind and consume released ABIogenesis contracts under the ordinary installed
catalog law, but it is not the ABIogenesis compiler, runtime substrate, builder,
or release dependency. Each product owns its own RC and final release process.

### Native And Release Boundary

Native ABG operation requires no Claude, Codex, or other marketplace host. The
selected Codex CLI or skill projection delegates to the same public SDK or native CLI
contract and contains no copied graph, worker, traversal, event, continuation,
or orchestration logic.

Public distribution means exact immutable Git release artifacts and tarballs
with coherent product identity, manifests, checksums, installed proof, and
qualification evidence. It does not require a hosted package registry,
storefront, signing service, license system, scheduler, multiple-host portfolio,
multi-user administration, or hostile-workstation tamper defense.

A generic Review product and homeostatic intent-refinement composition beyond
the bounded Consensus GraphFunction are not part of this product contract. The
current observer and tuner remain in scope; automatic wake, ABG-owned
scheduling, and direct ticket mutation do not.

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

The conformance surface has a published contract shape. It accepts a submitted
GTL program and returns typed conformance issues drawn from a published
diagnostic-id enum, together with typed repair-edit classes and a default
admissible-repair set. Target-carrier conformance rows and edge-closure
conformance rows are part of the published contract. The diagnostic-id enum and
the repair-edit classes are published versioned contracts of the released
package.

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

The product control-plane ontology joins installed product and operator
interaction to those two existing ontologies without recreating either. Its
prime carriers include immutable product, release, artifact, install, workspace,
workspace-binding, catalog, public-contract, capability, invocation-authority,
model, gap, intent, closure-decision, qualification, and public outcome truth.
Public command names, schemas, adapter metadata, and rendered projections derive
from those carriers; they are not additional semantic authorities.

`WorkspaceAuthorityBasis` contains stable workspace identity, canonical root,
authority mode, and authority-bearing manifest or configuration truth.
`WorkspaceBinding` immutably joins that basis to the exact installed product set,
lock, and declared roots. Mutable file, process, runtime, and replay observations
belong to replaceable `ObservationSnapshot` values. Ordinary worksite progress
may stale a model, gap, or next-action projection, but it does not mutate the
binding or create `basis_fork_detected`. A different authority basis requires a
separately admitted binding and, on an existing execution spine, an exact
covering reprice.

Whole-family Prime contracts the current 38 public behavior labels plus the
three required internal publication lifecycles to 27 atomic function families,
then composes them through the existing GTL algebra as seven product
applications:

1. prepare an installed workspace;
2. perform one One Surface constructive action;
3. converge a supervised root through published refinement;
4. admit and continue an interactive F_H hold;
5. project and transition tuning drafts through ordinary re-entry;
6. qualify and materialize an exact release cut; and
7. publish the immutable Product.

`ExactCandidateQualification<K>` is one of those Prime atomic families, with
closed basis and verdict projections. Its qualification-law basis, ordered
owning-gate result vector, and final-tap delta are subordinate typed values, not
additional functions or public operations. The 27/7 census and the derived
19-operation projection are conformance checks over the semantic relations,
not independent sources of authority. The current 17 retained feature families
and 16 capability identities remain no-silence projections over the same
product truth; contraction may not delete them or let them preserve a legacy
operation identity by count.

For a `pre_rc_candidate`, the qualification basis also binds the prospective
published-RC identity and version, and the exact candidate artifact bytes
already carrying that identity. Qualification therefore decides the bytes and
identity that may be published; release materialization may not relabel or
rebuild them.

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

Coverage-gated closure applies where an edge declares the requirement
proof-carry-through contract. ABIogenesis 5.0 does not claim that every legacy
edge has been migrated to that declaration. An edge with active obligations but
no declared carry-through contract retains the typed transitional semantics of
`REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-038`; it cannot be cited as proof of
universal coverage-gated closure. New ABIogenesis and downstream proof-bearing
paths declare the contract when they claim coverage-gated closure. Universal
legacy-edge migration re-enters only with an explicit universal product claim.

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

Exact wire and serialization schemas for carriers, event envelopes, payloads,
and public operations are published versioned contracts of the released
product. `product-toolchain-manifest.json` contains the addressable
`publicContractCatalog` governed by `REQ-P-PUBLIC-CONTRACTS`: stable contract
and capability identities, exact versions/digests, native package-export and
named-symbol locators, canonical schema/asset locators, the event and diagnostic
rosters, the language conformance corpus, and every public operation row. The
TypeScript product publishes the contract groups through `./gtl/m01`,
`./gtl/m02`, `./gtl/requirements`, `./abg/requirements`, `./abg/executive`,
`./abg/m03`, `./abg/m03/transport`, `./app/m04`, and
`./qualification/m05`; the root export may aggregate but does not replace those
identities. A tenant builder certifies exact shape against that catalog.
Unpublished implementation types, prompt prose, parser tolerance, local archive
shape, or source paths are not schema authority. Static schemas and corpus
assets do not imply a hosted `schema://` service.

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

Outcome compute is one admitted GTL One Surface composition interpreted by ABG.
Its four semantic authorities remain distinct:

```text
synthesizeModel(intentLineage, priorModel, admittedProductTruth)
  -> ProductAssetModel

evalGap(workspaceBinding, model, eventLog, runtimeProjection, worksite)
  -> ObservationSnapshot + GapPressureRow[]

evaluateNext(nextBasis, freshGap, targetObligations, actionCatalog,
             runtimeFrontier, policy)
  -> TargetObligationBinding[] + PriorityProjection + NextActionProjection

evaluateAction(intent, admittedEvidence, workspaceBinding, policy)
  -> EdgeFulfillmentLedger + EdgeClosureDecision
```

These authorities may share subordinate libraries, but none may perform or
author the result of another. Model synthesis owns desired and known product-
asset truth. Gap evaluation owns a fresh observation and typed pressure under a
stable workspace binding. Next-action evaluation owns current eligibility,
total lawful selection, and selected-or-no-action projection. Action evaluation
owns the complete evidence ledger and the closed
`close | yield | retry | repair | re-enter | reprice | block` disposition. A
worker result, F_P assessment, F_H response, liveness signal, or single evidence
row cannot create closure truth by itself.

The admitted program declares the composition:

```text
synthesize model
-> evaluate fresh gap
-> derive the admitted program's action catalog
-> evaluate next action
-> admit a new construction intent or cite the current intent
-> invoke or continue through ABG
-> admit evidence
-> evaluate the action
-> derive the exact next-action basis
-> refresh the model
-> evaluate a fresh gap
-> evaluate the next action
-> project result and lawful frontier
```

The next-action basis is one of `initial_selection`, `post_yield_resume`,
`post_close_graph_continuation`, `post_retry`, `post_repair`, `post_reenter`,
`post_reprice`, or `post_block`, with exact causal references. Newer observation
or replay truth under the same execution authority reruns the affected model,
gap, and selection functions. It does not create a workspace or execution-basis
fork. A changed authority basis requires a separately admitted binding where
applicable and an exact covering reprice.

Public ingress validates and admits a typed invocation, and public egress
transports the resulting projection. Neither orders this composition. ABG
interprets the admitted program, admits its facts, and owns graph calls, frames,
events, continuation, correction, replay, and closure. Downstream products own
their model, gap, selection, and action-evaluation meaning as declarations; they
do not replace the composition with a product-local service loop.

### Higher-Order F_P Construction Episodes

One edge traversal remains the bounded runtime unit of probabilistic compute.
A higher-order `F_P` construction episode is an admitted GTL application of One
Surface that composes those bounded invocations through ABG-interpreted,
event-sourced tail recursion:

```text
refresh the admitted product model
-> evaluate a fresh gap and lawful outcomes
-> admit one construction intent
-> invoke the selected graph function through ABG
-> admit evidence and evaluate the action
-> refresh model, gap, and next action
-> recur, yield progress, close, block, or escalate through typed truth
```

The construction episode does not make ABG the domain strategy decider and does
not make public ingress the controller. The product-owned evaluators construct
model, gap, selection, and action-evaluation truth through their distinct
contracts. ABG admits or rejects the resulting intent and evidence, binds them
to graph-call, frame, continuation, lineage, event, ledger, and projection
truth, and exposes the public result and lawful frontier. Every published inner
refinement receives the same visible One Surface chain; opaque worker-internal
HOW remains inside one bounded action.

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
- interpretation of the admitted One Surface composition while preserving its
  distinct model, gap, next-action, and action-evaluation authorities
- replayable provenance over traversal invocation and runtime identity
- ordinary graph-function transport, result ingestion, and runtime behavior
  when an installed product acts as a development product

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
- exact bound-product identities, versions, digests, dependencies, and
  compatibility results
- admitted catalog contributions and their provenance
- runtime identity, event roots, projection roots, and archive roots
- selected product manifest refs for method standards and reference docs
- a cold-agent-readable bootstrap surface

The released install path is source-independent. It resolves, verifies,
installs, and binds immutable product artifacts without a mutable source import
or private test harness. A workspace binding may name Abiogenesis and compatible
catalog products, but ABG remains the sole owner of catalog admission, runtime
eligibility, selection, graph calls, traversal, events, replay, and closure.

Installed standards are product reference payloads resolved through the
workspace binding and selected product manifest. They make cold-agent
references stable without copying a full standards tree into every target
workspace. They do not become the upstream source of shared method law when the
method itself is edited.

The four method standards that requirements derive from — `SPEC_METHOD`,
`ODD_METHOD`, `TICKET_METHOD`, and `DESIGN_MODULE_METHOD` — are constitutional
inputs sourced from the `specification_methodology` repository and
install-mirrored into the workspace standards root. A tenant builder requires
them as declared inputs.

For ABIogenesis 5.0 qualification, the selected method lineage is the exact
tapped STDO 2.0 release. `QualificationLawBasis` binds that release manifest
and its authoritative released method, rule-catalog, source identities, and
digests. `product.materialize(context_bootstrap)` separately consumes the
released `stdo_compressed.md` projection by exact identity and digest and
verifies every declared source reference against the corresponding released
source. The compression is a cold-agent read model, not constitutional source
law. Candidate, mixed-version, stale, missing, or digest-mismatched method
assets cannot project installed or qualification truth.

## Public Operator Contract

Abiogenesis publishes one public control plane derived from one versioned
`PublicFunctionDefinition<K>` family. That relation owns the operation identity,
closed variant, input, result, refusal, effect class, authority, operation-
variant-specific `workspaceBindingRequirement: forbidden | exactly_one`, and
adapter coordinates. SDK types, schemas, catalog rows, CLI paths, capability
claims, and tests project the same relation; none maintains an authored roster.

The derived external projection contains 19 public operation identities:

| Public operation identity | Semantic authority | Closed variation |
| --- | --- | --- |
| `abg.operation.workspace.create` | workspace construction | target plus explicit clean/import policy |
| `abg.operation.workspace.open` | workspace authority admission and readiness projection | expected stable workspace authority basis |
| `abg.operation.project.read` | typed projection over admitted source truth | closed source/projection relation |
| `abg.operation.product.verify` | artifact verification | artifact format and contract |
| `abg.operation.product.resolve` | exact dependency resolution | product requirements |
| `abg.operation.product.install` | immutable product installation | install target policy |
| `abg.operation.workspace.bind` | immutable workspace/product binding | exact product set, lock, and roots |
| `abg.operation.catalog.admit` | contribution admission | admitted contribution family |
| `abg.operation.catalog.view` | narrowing catalog view | allowlist |
| `abg.operation.catalog.apply` | typed declaration application | `node_type | overlay`; both non-callable |
| `abg.operation.run.invoke` | admitted GTL One Surface program interpreted by ABG | `invoke | start` |
| `abg.operation.run.continue` | replay-derived continuation interpreted by ABG | current-intent continuation or a newly admitted selected action |
| `abg.operation.interaction.respond` | typed F_H response admission | `select | approve | reject | assess | answer_escalation` |
| `abg.operation.result.assess` | assessed F_P result admission | declared result-assessment contract |
| `abg.operation.witness.admit` | witnessed-act event admission | `reprice | attest | hygiene-stamp | intake | run-resumed | run-stopped` |
| `abg.operation.tuning.transition` | tuning-draft lifecycle | `propose | ratify | reject` |
| `abg.operation.conformance.evaluate` | typed conformance evaluation | public `gtl_program`; self-conformance remains qualification-bound |
| `abg.operation.product.materialize` | content-addressed product-asset materialization | `context_bootstrap | configuration` |
| `abg.operation.release.snapshot` | qualified release-cut and snapshot materialization | `published_rc | tapped_release` |

The 19 identities are a derived projection, not axioms selected by count. The
contraction preserves every retained public behavior, feature family, and
capability definition. Those no-silence censuses verify the projection but do
not authorize a legacy identity, a second public definition register, or
separately authored adapter behavior.

`project.read` covers the closed read relations for catalog list and describe,
workspace or runtime status, result, evidence, replay, gaps, lawful actions,
observer reports and drafts, and tuning reports. It is not an untyped universal
query: each source/projection pair has one declared result and refusal contract.
Reads admit no events, select no action, and own no continuation or retry.
Lawful-action projection exposes only the replay-derived current frontier.

`catalog.apply` is the only public application relation for retained node-type
and overlay declarations. Both are non-callable. A GraphFunction is invoked only
through `run.invoke`, and the selected function must belong to the exact admitted
GTL program and narrowed catalog view. Raw graph vectors, unpublished helpers,
and implicit candidate-family choices are not public targets.

`run.invoke` has `invoke` and `start` variants over one admitted invocation
relation. `invoke` constrains one exact published GraphFunction. `start` carries
the traversal request grammar `scope + target + until`. Its current target
families are `next`, `graph_function:<published_handle>`, and
`asset:<published_handle>` when the admitted program publishes one operator-
asset ownership registry. An asset handle resolves to one governing published
GraphFunction; unresolved, unowned, unsupported, or ambiguous handles fail
closed.

The admitted GTL program, interpreted by ABG, owns the initial One Surface
composition through model synthesis, gap evaluation, next-action evaluation,
intent admission, invocation, evidence admission, and action evaluation. These
four semantic authorities do not become four public operations. Public ingress
admits invocation and authority; it does not select or order work.

`run.continue` consumes one replay-derived continuation and current admitted
intent after typed input or F_H response. When a post-action evaluation selects
a new action, that action crosses ordinary intent admission before invocation.
Newer observation or replay truth under the same execution basis reruns the
program's affected model, gap, and selection functions. A changed authority
basis requires a separately admitted workspace binding when applicable and an
exact covering reprice; otherwise continuation refuses as
`basis_fork_detected`. A caller cannot choose a private cursor, relabel the
current intent, or construct traversal state.

`interaction.respond` binds typed selection, approval, rejection, assessment,
or escalation response to the pending F_H interaction, actor, capability, and
run identity. Human input does not override deterministic failure and does not
emit events or decide closure outside ABG admission. `result.assess` separately
admits assessed F_P output; prose is never truth by itself.

`witness.admit` records an attributed external act in the append-only event
stream. `tuning.transition` keeps proposals as drafts; ratification or rejection
is attributed event truth. Ratification does not mutate effective configuration:
the draft re-enters as ordinary admitted work through the owning change class.

`conformance.evaluate(gtl_program)` is the public program-conformance binding.
ABIogenesis self-conformance uses the same evaluator atom under its own exact
qualification law and is not another public mode. Tenant-conformance manifest
publication and release qualification remain distinct publication and
qualification authorities, not hidden variants.

`product.materialize` owns context bootstrap and configuration generation.
Product verification, resolution, installation, workspace binding, catalog
admission, and narrowing remain distinct operations because their identities,
authority, effects, and failure law differ.

`release.snapshot` accepts an exact qualification basis, matching
qualification-law basis, same-basis green non-bypassed verdict, and requested RC
or final release identity. The published-RC variant requires that identity to
equal the prospective identity bound into the `pre_rc_candidate` basis and
publishes the exact qualified artifact bytes unchanged. The final variant
additionally requires the accepted RC, its exact installed-RC qualification
basis and green non-bypassed verdict, and a basis-bound `FinalTapDelta` whose
affected gates passed over the prospective final bytes. It returns the
immutable cut and authoritative snapshot manifest; its own output cannot
qualify its input.

Every multi-variant operation is a closed discriminated request/result/refusal
relation. One schema family may publish addressable definitions, but a
permissive optional-field mega-schema is not the product contract. Actor
attribution, capability definitions, per-basis capability grants, invocation
policy, catalog view, and transport steering remain separate inputs. Steering
has provenance and cannot widen authority.

`run.invoke(start)` retains the two current control-mode families outside the
`scope + target + until` grammar:

- `fh_mode = direct | human-proxy`, default `direct`
- `root_mode = direct | supervised`, default `supervised`

Both are lawful only when `until = converged`. A session allowlist narrows the
already admitted catalog; it cannot change published program law. Existing,
alternate explicit, and caller-created temporary workspaces are applications of
the same operations, not separate modes.

The native `abg.cli` graph shell and every host projection are adapters over this
one public relation. Literal command spellings may remain ergonomic, but each
binds exactly one operation and closed variant and owns no semantic defaults.
The primary interactive path is:

1. invoke or start an admitted GTL program;
2. read one truthful result, hold, gap, or lawful frontier projection;
3. remove one ambiguity or admit one typed human response; and
4. continue the admitted execution.

The hard break is mandatory: every non-derived legacy operation identity,
facade, alias, and parallel register is retired. Lower-level runtime hooks may
remain internal implementation, but they are not public compatibility surfaces
and cannot be taught or invoked as co-equal operator contracts.

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

This section states the current release realization of the source project as
product law.

The current product is:

- a graph-native workflow language, not a private configuration dialect
- a canonical traversal governance and runtime-truth substrate, not a
  domain-specific planner or executor
- a reference implementation and proving surface for graph-native product
  systems
- a platform that should support downstream products without leaking one
  downstream domain into the GTL or ABG core

Each release identifies one qualified tenant carrier and its exact public
contracts. Other tenant lines are reference or alternate realizations unless
separately qualified for that release. Downstream proving domains remain
evidence surfaces and independent catalog products; they are not the GTL and
ABG product definition.

## Downstream Product-Lab Boundary

Abiogenesis may be used as a product lab for downstream ODD-native products
when the downstream work starts from published graph functions, typed assets,
admitted programs, ABG replay truth, and scenario proof rather than imperative
framework scaffolding. Each downstream readiness claim requires its own
product authority and installed scenario evidence; ABIogenesis does not infer
readiness for a named downstream domain from substrate capability alone.

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

The 5.0 release claim identifies the exact immutable ABIogenesis product, its
complete public operator and bounded Consensus contracts, self-conformance,
native and Codex-projection results, and installed scenario evidence. Git ref,
tarball, manifest, checksums, product identity, and qualification evidence must
identify the same bytes. A rebuilt or source-importing approximation is not
release evidence for that cut. An odd_glc release, a self-host equivalence
result, and 5.0.1 dogfood evidence are not 5.0 release dependencies.

ABIogenesis follows `RELEASE_METHOD` through one acyclic exact-candidate
lifecycle:

1. Product-contract publication creates the exact toolchain manifest and public
   contract catalog; tenant-conformance publication separately states realized
   contract and capability support with evidence.
2. One content-addressed `ExactCandidateQualification<K>` basis binds the exact
   subject kind, source, artifact, toolchain manifest, installed-product and
   workspace-binding truth, tenant manifest, frozen gate inventory, and
   `QualificationLawBasis` containing the exact method, rule catalog, source
   refs, and content digests. A `pre_rc_candidate` basis additionally binds the
   prospective published-RC identity and version and the exact artifact bytes
   already carrying that identity.
3. Each owning gate retains its own execution and semantic authority. One
   subordinate ordered result vector conserves their same-subject and same-law-
   basis citations without reinterpreting them. The ordinary conformance
   evaluator reduces that vector to exactly one typed verdict.
4. Only a green verdict with an empty bypass set permits `AF-25` to verify the
   basis-bound prospective RC identity and materialize those exact qualified
   bytes unchanged as the immutable versioned RC cut and authoritative
   snapshot. The tag, checksums, release record, and snapshot are output
   evidence; they cannot qualify the cut that creates them.
5. The exact installed RC is qualified under its own content-addressed basis.
6. A prospective final basis binds the accepted RC, that exact installed-RC
   basis and green non-bypassed verdict, and a typed `FinalTapDelta` limited to
   final version assignment and release-scoped asset reconciliation. Every gate
   affected by that delta reruns against the prospective final bytes before the
   final cut and snapshot are materialized.
7. The immutable final cut, exact artifacts, and toolchain manifest publish the
   tapped Product; a later install remains a distinct product instance.

Any behavior, declaration, public-contract, dependency, or non-release-only
change after the accepted RC is not representable as `FinalTapDelta` and reopens
the RC window. Qualification basis, verdict, RC, snapshot, final cut, Product,
artifact, and install remain distinct identities; no surface may relabel one as
another or select its own authority.

The purpose of this document in the release process is to define what the
release is releasing.

Release metadata, taps, and version identifiers remain separate release-process
surfaces. This document describes present product truth rather than release-line
history.

---

## Goal Authority

The bounded current work wave lives only in [GOALS.md](GOALS.md). This product
definition does not maintain a rival active-goal table. When a goal changes
current product truth, that change enters this document and the owning
requirements through the declared constitutional re-entry path.

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
versioned typed GTL C-program contract, never engine code. Configurations
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

### Authored stages and runtime binds

The selected C program remains the complete ordered authored stage set. ABG
may compile call preparation, result admission, evidence binding, and
materialization boundaries around that set. Those are interpreter-owned bind
stages, not hidden C stages and not a canonical triple imposed on an open
program. A traversal contract is valid only when it preserves every authored
stage and separately identifies every ABG bind stage. Proving the bind stages
while omitting, renaming, or reordering authored stages proves a different
program and cannot authorize traversal.

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
