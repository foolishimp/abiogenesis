# GTL 3 / HoG / ABG User Guide

**Status**: Current human guide to the frozen ABIogenesis 5.0 GTL 3 language
boundary
**Projection basis**: Active ABIogenesis 5.0 Product and requirement law
accepted by T-283 `F_H` closure
**Audience**: People authoring, operating, or reviewing GTL programs and
ABIogenesis applications

This guide explains the stable language model. It does not claim that every
ABIogenesis 5.0 implementation feature is complete, and it does not replace the
constitutional source under `specification/`.

If this guide and constitutional law disagree, constitutional law wins and this
guide is stale.

## Start Here

GTL is the typed, graph-first language in which the complete program is
inspectable before execution. HoG directly traverses the admitted GTL program.
ABG surrounds that traversal with admitted, replayable runtime truth.

The stable path is:

```text
GTL.TypeScript source
  -> TypeScript checks locally decidable type law
  -> raw admission checks values after types are erased
  -> the GTL validator checks whole-Program law without lowering
  -> a Module and catalog publish and admit the Program and its callables
  -> public ingress starts the Program or calls a member GraphFunction
  -> HoG directly traverses the original admitted GTL value
  -> a declared F_D | F_P | F_H implementation seam performs leaf work
  -> ABG admits events, evidence, results, judgments, and transitions
  -> replay derives result | continuation | hold | gap | block | closure
```

There is no semantic compiler, lowered executable Program, generated HoG
Program, feature-specific controller, or competing ABG execution path in this
model.

## Authority And Reading Order

Read these surfaces in order when an exact answer matters:

1. [`PRODUCT.md`](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/PRODUCT.md)
   for the complete Product and the GTL language contract.
2. [`INTENT.md`](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/INTENT.md)
   for the stable owner boundaries.
3. [`REQ-L-GTL3-CONTRACT-LAW-API.md`](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md)
   for the fast GTL reload surface.
4. The indexed [GTL requirement families](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/gtl/README.md)
   for detailed language law.
5. [`REQ-M-GTL3-PROGRAM-TRAVERSAL.md`](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/mapping/REQ-M-GTL3-PROGRAM-TRAVERSAL.md)
   for the exact Program, GraphFunction, workspace, HoG, and ABG mapping.
6. Accepted design for the selected implementation slice.
7. Current package exports, code, and tests as realization evidence.

This guide is a read model over steps 1 through 5.

## HoG And ABG Scope

This guide covers HoG and ABG only where their boundary is necessary to use
GTL correctly.

HoG directly traverses the admitted Program and materialized GraphFunction
graphs. It owns execution progression and may use invocation-local cursors,
frames, queues, or caches subordinate to that admitted GTL. This guide does
not define HoG's internal scheduling structures, optimization strategy, or
implementation API.

ABG admits and replays runtime events, results, evidence, judgments,
transitions, continuation, correction, and closure around HoG traversal. This
guide does not define the complete ABG event schemas, persistence layout,
Event Calculus implementation, transports, or deployment topology.

The stable division is: GTL declares, HoG traverses, the exact implementation
owner performs a declared leaf, and ABG admits what lawfully occurred. HoG
does not author Program meaning or runtime truth; ABG does not interpret or
execute graph topology.

## Why GTL And ABG Exist

Use GTL and ABIogenesis when the declared program, its authority, and its proof
matter as much as the produced artifact. Typical uses include governed agentic
construction, evidence and approval pipelines, recursive work, replayable
delivery systems, and mixed deterministic, probabilistic, and human processes.

GTL makes these things explicit before execution:

- topology and starts;
- callable membership;
- input, output, effect, refusal, and closure contracts;
- compute composition and regime;
- policy, proof, evidence, and result obligations;
- recursion, foldback, fan-out, fan-in, and boundedness; and
- publication, compatibility, and implementation seams.

ABG makes the runtime episode inspectable after execution through admitted
events and replay-derived projections.

## The Identities That Must Not Collapse

| Identity | Stable meaning | It is not |
|---|---|---|
| `GTL.TypeScript` | The embedded typed graph programming language. Authored values are ordinary TypeScript data. | A free-form DSL, prompt language, or runtime plan. |
| GTL `Program` | An admitted graph composition owning topology, starts, callable membership, compute composition, policy, result contracts, and proof obligations. | A callable function, workspace, or runtime plan. |
| `GraphFunction` | The sole named callable work contract. It has a typed outer interface and a replayable GTL template that materializes a graph. | The whole Program or an implementation-only function. |
| `Graph` | Materialized or declared graph structure containing typed loci and relations. | A bare public execution target. |
| `GraphVector` | An internal typed transition boundary between graph loci. | A Program, public callable, job target, or independent runtime plan. |
| `Module` | The publication boundary for Programs, GraphFunctions, contracts, declarations, and compatible implementation bindings. | A runtime registry with selection authority. |
| Catalog | The admitted, discoverable projection of Module publications. | A rival Program or hidden selector. |
| Workspace | Mutable instance material: files, data, configuration, observations, outputs, and run archives. | Program meaning, traversal state, or closure authority. |
| GTL validator | The non-lowering whole-Program judge. | A compiler, executor, planner, or source of runtime truth. |
| HoG | The executor that directly traverses the original admitted Program and materialized GraphFunction graphs. | A language author, compiler, catalog, or second Program. |
| Implementation binding | The exact owner of one declared leaf-effect seam. | Topology, traversal, event, continuation, or closure authority. |
| ABG | The runtime-truth substrate around HoG traversal. | The GTL interpreter, graph executor, language, or topology owner. |
| SDK and CLI | Thin admission, invocation, response, continuation, and projection shells. | Controllers or hidden selection authorities. |

Equal names or convenient implementation shapes do not merge these identities.

## Program, Library, And Workspace

This three-way boundary is central:

```text
GraphFunctions = reusable named callable library contracts
Program        = graph composition that binds topology and callable membership
Workspace      = mutable instance material supplied to an admitted invocation
```

A Program may expose one or more declared starts. A start selects a published
GraphFunction that belongs to that Program. A direct GraphFunction call is also
lawful only when the function belongs to the selected admitted Program and
catalog view.

Moving a file, loading a workspace, discovering a package, or knowing a display
name cannot create Program membership or invocation authority.

## Core Declaration Surface

### Attributes And Context

`Attr` and `Attrs` carry immutable, ordered, serializable declaration metadata.
They are visible configuration, not an embedded policy language. Duplicate or
conflicting keys fail closed.

`Context` names an externally located, snapshot-bound constraint with a locator
and digest. An engine may load and validate it but cannot invent or mutate the
declared context contract.

### Nodes, Interfaces, Graphs, And Vectors

`Node` is a typed local locus. Its schema, Markov conditions, reusable node-type
reference, and subordinate asset surface are declaration truth.

`Interface` is the typed boundary through which graph structures and
GraphFunctions compose. Composition and substitution require compatible source
and target contracts.

`GraphVector` expresses an internal relation between loci, including local
operators, evaluators, rules, context, declarations, and bounded sub-work law.
It remains internal even when it is visible and inspectable.

`Graph` holds the declared or materialized node, edge, application, context,
rule, and effect structure that HoG traverses.

### Operators, Evaluators, And Rules

These roles are distinct:

- `Operator` performs declared work through an implementation binding.
- `Evaluator` checks, diagnoses, or attests a boundary.
- `Rule` passively declares what must hold.
- `gate(...)` is the graph relation that blocks or permits continuation under
  declared rule and evaluation truth.

None of them may silently acquire Program, event-write, traversal-selection, or
closure authority.

### Roles And Jobs

`Role` is a semantic capability class for performing, supervising, or approving
work. It is not a concrete worker identity.

`Job` is a durable semantic work contract over published GraphFunctions. It
does not replace the Program, its starts, or callable-membership law.

### Refinement, Candidate Families, And Synthesis

`RefinementBoundary` declares where a coarse contract may be lawfully refined
while preserving its outer interface.

`CandidateFamily` publishes explicit lawful alternatives over one outer
contract. Membership does not select a candidate.

Deferred synthesis may produce candidate graph structure only inside a declared
refinement boundary. The produced structure remains subject to validation,
admission, provenance, and outer-contract preservation.

### Asset Surfaces And Requirements

An `AssetSurface` is subordinate declaration truth attached to an existing GTL
carrier such as a Node. It may identify constructors, renderers, schemas,
authority slots, digests, and proof obligations. Rendered text is a view and
does not outrank the typed declaration.

Requirement declarations use existing Module, Program, GraphFunction,
GraphVector, Context, Job, Role, hook, and asset-surface law. They do not create
a second requirement-graph kernel or import ABG runtime state into GTL.

## Graph Algebra

The frozen graph algebra is:

```text
edge
compose
substitute
recurse
fan_out
fan_in
gate
promote
identity
same_object
```

These are language relations, not service calls or feature runners.

- `edge` relates typed graph loci.
- `compose` builds a new GraphFunction while preserving interface and cumulative
  environment law.
- `substitute` replaces a declared internal contract boundary with a conforming
  graph or GraphFunction while preserving the outer contract.
- `recurse` reapplies a GraphFunction under declared termination, foldback,
  lineage, and bounds.
- `fan_out` applies declared work across a typed collection; `fan_in` rejoins it
  under a declared reducer and result contract.
- `gate` binds continuation to declared rule and evaluation truth.
- `promote` lawfully widens or exposes an existing declared relation without
  inventing semantics.
- `identity` preserves a typed interface.
- `same_object` records identity equality only with an adequate witness.

Graph recursion is not retry. Recursion creates a declared child relation and
requires parent foldback and re-evaluation. Retry repeats one attempt at the
same declared locus under a bounded policy.

## Compute Algebra

The frozen C algebra has exactly seven constructors:

```text
C.of
C.id
C.compose
C.edge
workflow.C
C.batch
C.retry
```

- `C.of` lifts one declared leaf computation.
- `C.id` is typed identity.
- `C.compose` is associative typed sequencing.
- `C.edge` records the canonical transform, evaluate, and consequence shape.
- `workflow.C` crosses a named GraphFunction boundary.
- `C.batch` preserves a declared collection of child computations and their
  identities.
- `C.retry` repeats one bounded C interior without changing graph topology.

Host-language constructors may make illegal compositions unrepresentable.
Serialized carriers receive equivalent raw admission and semantic validation.
The validator does not translate the algebra into an executable intermediate
Program. HoG traverses the admitted terms directly.

## Compute Regimes And Authority

Every executable boundary declares one regime:

| Regime | Meaning | Authority boundary |
|---|---|---|
| `F_D` | A total mechanical function over a declared closed domain. | Deterministic implementation alone is insufficient; the domain and predicate must be closed. |
| `F_P` | Bounded semantic construction, synthesis, diagnosis, ranking, repair, or evaluation. | Output is candidate material until ABG admission. It cannot certify closure. |
| `F_H` | Attributed human approval, rejection, policy choice, or ambiguity resolution. | Human input crosses typed admission and cannot override deterministic invalidity. |

One regime may consume evidence admitted from another. It cannot impersonate
the other regime or inherit its authority.

## Selected Composition Notation

`C` may also appear in documentation as notation over a selected
`abg.fn_composition` contract. That contract records how `F_D`, `F_P`, and
`F_H` participate at a governed boundary. It is not a second GTL topology
object, public carrier, runtime plan, or executor.

The stage notation is:

- `transform.C`: candidate and evidence production;
- `evaluate.C`: an evaluation-set phase over read-only admitted facts; and
- `consequence.C`: a projection reference over admitted state and transition
  truth.

Plugin returns are proposals. ABG admission is the boundary at which a lawful
payload becomes runtime fact truth. A plugin does not emit events, write
ledgers, select traversal, or close work.

`TraversalUnit<A, B>` is notation for one closeable traversal atom under an
admitted Program, GraphFunction, internal vector, selected composition,
attempt, evidence, assurance fold, transition, and replay disposition. It is
not a new callable API or carrier.

## Validation

GTL has three validation depths:

1. TypeScript checks local types, generics, interfaces, discriminated unions,
   and constructor law.
2. Raw admission checks serialized or package-originated values after
   TypeScript types have been erased.
3. The GTL validator checks whole-Program relations that local types cannot
   decide.

Whole-Program validation includes at least:

- identity, version, digest, and canonical-reference coherence;
- uniqueness and reference resolution;
- Module, Program, catalog, start, and GraphFunction membership;
- interface compatibility and graph/C-algebra well-formedness;
- role, capability, implementation, and regime compatibility;
- recursion, termination, foldback, fan-out/fan-in, and boundedness;
- effect, result, failure, refusal, evidence, judgment, and closure contracts;
- required runtime-binding declarations; and
- conflicting selectors, hidden defaults, or parallel authority.

A validator result is typed validity, typed invalidity, or typed unresolved
semantics. Unresolved meaning remains explicit pressure. The validator may
produce diagnostics, canonical serialization, and subordinate indexes, but not
an executable plan or runtime truth.

Canonical serialization transports and identifies the same GTL value. It is
not a second language.

## Publication And Catalog Admission

A Module publishes Programs, GraphFunctions, contracts, types, policy-visible
declarations, and compatible implementation bindings. Catalog construction is
deterministic, pure, and eventless. A narrowed catalog view makes exact admitted
membership discoverable for one invocation.

Before execution, public admission binds the exact:

- Product and installation;
- workspace when required;
- Module and catalog view;
- Program and declared start or callable membership;
- GraphFunction, input, and output contracts;
- implementation and capability requirements; and
- invocation authority and execution basis.

Display names, package presence, workspace files, fixtures, or caller defaults
cannot substitute for those bindings.

## Direct Execution And Runtime Truth

A lawful start or call proceeds as follows:

1. Public ingress admits one typed request.
2. The selected Program and GraphFunction membership are resolved exactly.
3. The GraphFunction template materializes a graph under admitted inputs and
   declared structural parameters.
4. TypeScript, raw admission where applicable, and GTL validation have passed.
5. HoG enters and directly traverses the admitted Program and materialized
   graph.
6. An exact implementation owner realizes each declared leaf seam.
7. ABG admits invocation, graph-call, frame, attempt, effect, result, evidence,
   judgment, and transition facts.
8. Replay derives the current result, continuation, hold, gap, block, retry,
   re-entry, correction, or closure state.

HoG may derive invocation-local cursors, frames, queues, resolved bindings, and
caches. Those values remain subordinate to the admitted Program and invocation;
they cannot be published or resumed as a rival Program.

ABG owns runtime truth, but it does not redefine GTL meaning or execute graph
topology. HoG advances the declared traversal using the admitted Program and
ABG replay-derived state. ABG admits what occurred and the resulting lawful
runtime disposition. There is one causal episode.

## Events, Replay, And Correction

Runtime state is not controller memory. The stable rules are:

- ABG is the sole runtime event-admission authority.
- Events are append-only admitted facts.
- Replay reconstructs state from admitted facts; it does not author facts.
- Projections and dashboards are read models.
- A worker return, log line, file, or plugin payload is not runtime truth until
  admitted through its declared contract.
- Correction supersedes or shadows stale truth without erasing history.
- Continuation and closure are replay-derived under declared Program law.

An output that looks correct through a private call, fixture, bypass, or rival
path does not prove Product execution.

## Recursion, Fan-Out, And Sub-Work

Recursive GraphFunctions declare callable relation, termination, foldback,
parent re-evaluation, lineage, and bounds. Child completion does not certify the
parent. The admitted child result and evidence must rebind through the declared
foldback before the parent is evaluated again.

Fan-out preserves stable member identity, per-member evidence, and collection
contracts. Fan-in uses a declared reducer and cannot silently drop failed,
blocked, or unresolved members.

Bounded sub-work is GTL topology. HoG traverses it, an implementation binding
performs its leaf effect, and ABG admits its runtime lifecycle. A product-local
worker loop or private queue cannot become a shadow sub-work engine.

## A Stable Authoring Workflow

When starting a product or adding a Program:

1. Define the Product-owned outcome and contracts.
2. Declare typed loci, interfaces, contexts, and asset surfaces.
3. Declare operators, evaluators, rules, roles, and implementation seams.
4. Construct GraphFunction templates from the frozen graph and C algebra.
5. Compose those functions into a Program with explicit topology, starts,
   callable membership, policy, results, and proof obligations.
6. Publish the Program, GraphFunctions, contracts, and bindings through one
   Module.
7. Type-check, raw-admit serialized input, and validate whole-Program law.
8. Build and narrow the catalog without emitting runtime events.
9. Enter only through a public Program start or admitted GraphFunction call.
10. Inspect ABG replay for the result, evidence, continuation, and closure.

The following is structural notation, not executable TypeScript:

```text
Module delivery
  publishes Program delivery_program
  publishes GraphFunction design
  publishes GraphFunction implement
  publishes contracts and implementation bindings

Program delivery_program
  start deliver -> GraphFunction design_and_implement
  callable membership = {design, implement, design_and_implement}
  topology = compose(design, implement)
  result contract = delivery_result
  closure contract = delivery_closed

GraphFunction design_and_implement
  input = requirements
  output = artifact
  template = replayable GTL graph
```

Consult the selected TypeScript package exports for current constructor
spellings. Do not copy a historical `5.0.0-dev.*` example and infer language
law from it.

For a concrete steel thread, read the
[Hello World examples](./GTL_HELLO_WORLD_EXAMPLES.md). They begin with accepted
odd_glc publication bytes, then show how several GraphFunctions and root/child
overlay rows compose without moving topology into a host harness or runtime
state into GTL.

## Fail-Closed Review Checklist

Reject or return typed unresolved pressure when any of these are missing or
ambiguous:

- exact Program identity;
- declared start or GraphFunction membership;
- graph-template and interface coherence;
- Module and catalog publication;
- implementation seam and compute regime;
- recursion, retry, fan-out, foldback, or boundedness law;
- result, evidence, refusal, judgment, and closure contracts;
- exact workspace and invocation basis where required;
- validation before prohibited effects; or
- ABG admission and replay for a claimed runtime result.

Also reject these substitutions:

- GraphFunction as the whole Program;
- workspace or overlay as Program authority;
- ABG as graph interpreter or executor;
- validator output as an executable plan;
- worker, plugin, SDK, CLI, or adapter as controller;
- generated indexes or catalogs as authored language truth;
- logs or files as admitted runtime truth; and
- `F_P` or `F_H` output as deterministic closure.

## Current Implementation Details

The language above is frozen. ABIogenesis 5.0 realization remains active.
Therefore current package versions, exports, commands, install mechanics, and
feature readiness belong to the selected build tenant and accepted design, not
to this stable language guide.

For live TypeScript HOW, inspect the
[moving TypeScript build tenant](https://github.com/foolishimp/abiogenesis/tree/main/build_tenants/abiogenesis/typescript),
including its `package.json`, `code/src/gtl/`, `code/src/validator/`,
`code/src/hog/`, `code/src/abg/`, `code/src/public/`, and `design/` surfaces.

Do not describe an unfinished implementation surface as absent language, and do
not describe an implemented convenience as new language law.

## Reference Map

- [GTL requirement index](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/gtl/README.md)
- [Language identity](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/gtl/REQ-L-GTL3-LANGUAGE.md)
- [Language capability model](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md)
- [Contract-law reload](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md)
- [GraphFunction law](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md)
- [C algebra](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/gtl/REQ-L-GTL3-C-ALGEBRA.md)
- [Compute notation](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/gtl/REQ-L-GTL3-COMPUTE-NOTATION.md)
- [Program traversal mapping](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/mapping/REQ-M-GTL3-PROGRAM-TRAVERSAL.md)
- [HoG traversal and ABG admission](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/abg/REQ-R-ABG3-INTERPRET.md)
- [Accepted odd_glc Hello World publication](https://github.com/foolishimp/odd_glc/blob/dae8589b2784be4c101af70d891f85367fc13ebd/build_tenants/odd_glc/typescript/product/build/publication.json)
- [Hello World examples](./GTL_HELLO_WORLD_EXAMPLES.md)
- [Schematics](./ABG_GTL_SCHEMATICS.md)
- [LLM bootstrap guide](./LLM_GTL_APP_BUILDER_GUIDE.md)
