# LLM GTL App Builder Guide

**Status**: Current compressed bootstrap for the frozen ABIogenesis 5.0 GTL 3
language boundary
**Projection basis**: Active Product and requirement law accepted by T-283
`F_H` closure
**Audience**: LLM agents constructing, reviewing, or operating GTL/ABIogenesis
products

This guide is a derived read model. It is deliberately independent of a moving
`5.0.0-dev.*` package, command spelling, or incomplete implementation wave.

## Prime Directive

Preserve this path and its owner boundaries:

```text
GTL.TypeScript declaration
  -> native TypeScript checking
  -> raw admission after type erasure
  -> non-lowering GTL whole-Program validation
  -> Module and catalog admission
  -> admitted Program start or admitted GraphFunction call
  -> direct HoG traversal of the original admitted GTL
  -> exact F_D | F_P | F_H implementation seam
  -> ABG admission, events, replay, continuation, correction, and closure
```

Do not lower GTL into an executable intermediate Program. Do not make a
GraphFunction, workspace, validator result, catalog, adapter, worker, plugin,
SDK, CLI, or ABG into a rival Program or executor.

## Load Contract

In the ABIogenesis source repository, read:

1. [Product](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/PRODUCT.md)
2. [Intent](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/INTENT.md)
3. [GTL contract-law reload](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md)
4. the applicable [GTL requirement families](https://github.com/foolishimp/abiogenesis/tree/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/gtl)
5. [Program traversal mapping](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/mapping/REQ-M-GTL3-PROGRAM-TRAVERSAL.md)
6. accepted design for the selected implementation slice; and
7. the [current package exports and code](https://github.com/foolishimp/abiogenesis/tree/main/build_tenants/abiogenesis/typescript).

In an installed downstream workspace, also read:

1. `workspace://AGENTS.md` and `workspace://CLAUDE.md`
2. `workspace://specification/INTENT.md`
3. `workspace://specification/PRODUCT.md`
4. `workspace://specification/requirements/`
5. the product-definition overlay and its exact installed ABIogenesis Product
   binding
6. `workspace://.genesis/docs/standards/SPEC_METHOD.md`

Local Product law owns downstream meaning. It may specialize GTL through
declared contracts; it may not redefine the frozen GTL language or create a
second executor/runtime authority.

## One-Sentence Model

A GTL Program is an admitted graph composition of named GraphFunction contracts;
HoG traverses that admitted value directly, exact owners perform declared leaf
work, and ABG admits and replays the resulting runtime truth.

## HoG And ABG Scope

Use HoG as the direct traversal owner for admitted GTL. Invocation-local
frames, cursors, queues, and caches may support that traversal but cannot
become Program authority. Do not infer HoG's internal scheduler or API from
this language guide.

Use ABG as the runtime admission and replay owner for events, results,
evidence, judgments, transitions, continuation, correction, and closure. Do
not infer ABG's complete schemas, persistence layout, Event Calculus
implementation, transport, or deployment topology from this guide. ABG does
not interpret or execute the graph.

## Non-Substitutable Identities

| Term | Meaning | Fail if treated as |
|---|---|---|
| `GTL.TypeScript` | Sole typed graph program language | prompt DSL, free-form parser language, runtime plan |
| `Program` | Admitted composition owning topology, starts, callable membership, compute composition, policy, result, and proof law | callable library function, workspace, generated plan |
| `GraphFunction` | Sole named callable work contract with typed interface and replayable graph template | whole Program, implementation-only function |
| `Graph` | Declared or materialized topology traversed by HoG | bare public start target |
| `GraphVector` | Internal typed transition boundary | Program, public callable, independent plan |
| `Module` | Publication boundary | runtime selector or event authority |
| Catalog | Admitted discoverability projection | authored Program or hidden selection policy |
| Workspace | Mutable files, data, config, observations, outputs, and run archives | Program meaning or traversal state |
| Validator | Non-lowering whole-Program judge | compiler, planner, executor |
| HoG | Direct GTL graph executor | author, compiler, runtime-truth store |
| Implementation binding | Exact leaf-effect owner | topology, traversal, continuation, closure owner |
| ABG | Runtime admission and replay substrate around HoG | language, graph interpreter, executor |
| Public/SDK/CLI | Thin typed shell | controller or authority owner |

Equal spelling, object proximity, or implementation convenience does not merge
these identities.

## Frozen GTL Surface

The core declaration families include:

- `Attr` and `Attrs` for immutable visible metadata;
- `Context` for located, digest-bound constraints;
- `Node`, `Interface`, `GraphVector`, and `Graph` for typed structure;
- `Program` for composition, starts, membership, policy, result, and proof law;
- `GraphFunction` for named callable work and replayable graph templates;
- `Operator`, `Evaluator`, and `Rule` for work, judgment, and passive law;
- `Role` and `Job` for semantic capability and durable work contracts;
- `RefinementBoundary` and `CandidateFamily` for explicit lawful variation;
- `AssetSurface` and requirement declarations as subordinate typed truth; and
- `Module`, catalog contributions, contracts, and implementation bindings for
  publication and realization.

Do not invent a new topology type when one of these carriers already owns the
relation. Do not put runtime state in declaration metadata.

## Graph Algebra

The closed frozen graph relation set is:

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

Required invariants:

- composition is typed and associative;
- cumulative environment and declared metadata merge without silent conflict;
- substitution and refinement preserve the exact outer interface;
- recursion declares callable relation, termination, foldback, lineage, parent
  re-evaluation, and bounds;
- fan-out preserves ordered member identity and fan-in has a declared reducer;
- gates consume declared rule/evaluation truth rather than hidden strategy;
- promotion does not invent semantics;
- identity preserves the interface; and
- `same_object` requires an identity witness.

## Compute Algebra

The closed frozen C constructor set is:

```text
C.of
C.id
C.compose
C.edge
workflow.C
C.batch
C.retry
```

Rules:

- `C.of` is one declared leaf computation.
- `C.id` is typed identity.
- `C.compose` is associative typed sequencing.
- `C.edge` records transform, evaluate, and consequence roles.
- `workflow.C` crosses a named GraphFunction boundary.
- `C.batch` preserves every child identity and result cardinality.
- `C.retry` repeats one bounded interior under attempt lineage; it is not graph
  recursion.
- Stage role and compute regime are orthogonal.
- Host types prevent locally impossible composition.
- Raw admission and the GTL validator apply equivalent law after type erasure.
- HoG traverses admitted C terms. No compiled C plan is executable authority.

## Compute Regimes

| Regime | Law | Denied authority |
|---|---|---|
| `F_D` | Total mechanical function or predicate over a declared closed domain | Open-world semantic judgment disguised as deterministic work |
| `F_P` | Bounded semantic construction, diagnosis, synthesis, ranking, repair, or evaluation | Runtime fact emission or closure certification |
| `F_H` | Attributed human approval, rejection, choice, escalation, or ambiguity resolution | Direct runtime mutation or override of deterministic invalidity |

Outputs cross typed admission before another regime can consume them. Regimes
do not inherit one another's authority.

## Composition Notation

When `C` is displayed over `abg.fn_composition`, it denotes a selected
composition contract. It is not a new carrier, topology object, executable
target, or runtime.

```text
transform.C   -> candidate and evidence proposal
evaluate.C    -> evaluation-set proposal over read-only admitted facts
consequence.C -> projection reference over admitted state and transition truth
```

ABG admission is the epistemic boundary. A plugin return is not an event,
ledger row, traversal choice, continuation, or closure fact.

`TraversalUnit<A, B>` is formal notation over existing Program, GraphFunction,
GraphVector, composition, attempt, evidence, transition, and replay carriers.
Never implement it as a second public API or runtime controller merely because
the notation is convenient.

## Validation Protocol

Before a prohibited effect:

1. run native TypeScript checking;
2. raw-admit serialized or package-originated values;
3. run whole-Program GTL validation; and
4. preserve typed invalid or unresolved diagnostics.

Whole-Program validation must cover:

- canonical identity, version, digest, uniqueness, and reference resolution;
- Module, Program, start, catalog, and GraphFunction membership;
- interface, graph, application, and C-algebra relations;
- role, capability, implementation, and regime compatibility;
- recursion, foldback, retry, batch, fan-out/fan-in, and bounds;
- input, output, effect, evidence, failure, refusal, judgment, result, and
  closure contracts;
- required runtime bindings; and
- hidden defaults, conflicting selectors, and parallel authorities.

The validator may return diagnostics, canonical bytes, and subordinate indexes.
It must not emit runtime events, select work, or return an executable plan.

## Construction Protocol

For any new GTL product or Program:

1. Bind the local Product outcome and exact authority sources.
2. Declare typed input, output, effect, evidence, refusal, judgment, and closure
   contracts.
3. Declare Nodes, Contexts, Interfaces, GraphVectors, GraphFunctions, and
   implementation seams.
4. Use only the frozen graph and C algebra to construct topology.
5. Declare Program identity, starts, callable membership, policies, result
   contracts, and proof obligations.
6. Publish Programs, GraphFunctions, contracts, types, and bindings through one
   Module.
7. Validate local types, erased input, and whole-Program relations.
8. Construct and narrow the catalog without runtime events.
9. Enter through a declared Program start or member GraphFunction call.
10. Require HoG traversal and ABG replay evidence for any execution claim.

Use structural notation until you inspect the exact selected package exports:

```text
Module M
  publishes Program P
  publishes GraphFunctions {f, g, composed}
  publishes contracts and implementation bindings

Program P
  start main -> composed
  callable membership = {f, g, composed}
  topology = compose(f, g)
  result = result_contract
  closure = closure_contract
```

Do not copy constructor names from an earlier development package. API spelling
is HOW; the relations above are frozen WHAT.

For a grounded construction, use the
[Hello World examples](./GTL_HELLO_WORLD_EXAMPLES.md): the first is projected
from accepted odd_glc publication bytes, while the composition and overlay
forms are explicitly language-level notation.

## Execution Protocol

Before HoG entry, bind exactly:

- Product and installation;
- workspace when required;
- Module and narrowed catalog view;
- Program and start or callable membership;
- GraphFunction and graph template;
- input/output and runtime contracts;
- implementation/capability seams; and
- invocation authority and execution basis.

Then:

1. materialize the GraphFunction template under admitted inputs and declared
   structural parameters;
2. validate the admitted Program and materialized graph;
3. let HoG traverse the original admitted GTL directly;
4. invoke only exact declared leaf owners;
5. admit results, evidence, judgments, and transitions through ABG; and
6. derive state only by replay.

HoG may hold invocation-local frames, cursors, queues, and caches. These are
subordinate implementation state, never resumable or publishable Program truth.

## Runtime Truth Protocol

- ABG alone admits runtime events.
- Events are append-only facts.
- Replay reconstructs and projects; it does not author.
- Worker returns, plugin payloads, logs, files, and terminal text are candidates
  or observations until admitted.
- Continuation, retry, human hold, block, re-entry, correction, and closure are
  replay-derived under declared Program law.
- Correction preserves history.
- Read models do not select or mutate runtime truth.

HoG advances declared topology. ABG admits what occurred and the lawful runtime
state. Do not describe ABG as the graph interpreter or executor.

## Proof Protocol

An execution claim requires one causally connected path:

```text
exact Product/install/workspace/catalog basis
  -> admitted Program and GraphFunction membership
  -> public start or call
  -> validated materialized graph
  -> direct HoG entry and progression
  -> exact implementation effect
  -> ABG-admitted result/evidence/judgment/transition events
  -> replay-derived outcome
```

The following are insufficient by themselves:

- compilation or type checking;
- schema validity;
- direct GraphFunction, vector, plugin, or worker calls;
- a passing unit test;
- event co-presence without causal binding;
- a fixture-authored result;
- terminal output or a log line; or
- a generated catalog, dashboard, or proof summary.

## Refusal Triggers

Stop before effect or return typed pressure when you encounter:

- no exact Program identity;
- GraphFunction presented as the whole Program;
- missing start or callable membership;
- workspace or overlay treated as topology authority;
- unresolved interface, contract, identity, or reference law;
- hidden selection, retry, recursion, foldback, or closure strategy;
- ABG described as executing graph topology;
- a validator, compiler, SDK, CLI, adapter, or worker producing an executable
  Program;
- a plugin writing events or selecting continuation;
- `F_P` or `F_H` claiming deterministic closure;
- a private event writer or rival catalog/runtime; or
- an implementation convenience asserted as new language law.

## Canonical Phrases

Use these formulations:

- "A GTL composition is a Program."
- "GraphFunction is the sole named callable work contract and graph-template
  carrier."
- "HoG directly traverses the original admitted GTL Program and materialized
  GraphFunction graphs."
- "ABG owns runtime admission, events, replay, lineage, continuation,
  correction, and closure around HoG traversal."
- "The GTL validator judges whole-Program law without lowering."
- "A workspace supplies mutable instance material; it is not Program
  authority."
- "An implementation binding realizes one declared leaf seam."

Avoid these formulations:

- "GraphFunction is the Program."
- "ABG interprets or executes GTL."
- "The workspace is the program."
- "The validator compiles an execution plan."
- "The SDK/controller chooses the next graph step."
- "The plugin emitted runtime truth."

## Moving Implementation Surface

The language is frozen; ABIogenesis 5.0 implementation remains active. For
exact current package identity, exports, CLI commands, install procedure, or
feature readiness, inspect the selected build tenant and accepted design at the
time of work.

In the source repository, inspect the
[moving TypeScript build tenant](https://github.com/foolishimp/abiogenesis/tree/main/build_tenants/abiogenesis/typescript),
including `package.json`, `code/src/gtl/`, `code/src/validator/`,
`code/src/hog/`, `code/src/abg/`, `code/src/public/`, and `design/`.

Never convert current implementation lag into a language omission. Never
convert current implementation presence into constitutional language.

## Source References

- [`PRODUCT.md`](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/PRODUCT.md)
- [`INTENT.md`](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/INTENT.md)
- [GTL requirement index](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/gtl/README.md)
- [Contract-law reload](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md)
- [Language capability model](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md)
- [C algebra](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/gtl/REQ-L-GTL3-C-ALGEBRA.md)
- [Compute notation](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/gtl/REQ-L-GTL3-COMPUTE-NOTATION.md)
- [Program traversal mapping](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/mapping/REQ-M-GTL3-PROGRAM-TRAVERSAL.md)
- [HoG traversal and ABG admission](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/abg/REQ-R-ABG3-INTERPRET.md)
- [Accepted odd_glc Hello World publication](https://github.com/foolishimp/odd_glc/blob/dae8589b2784be4c101af70d891f85367fc13ebd/build_tenants/odd_glc/typescript/product/build/publication.json)
- [Hello World examples](./GTL_HELLO_WORLD_EXAMPLES.md)
- [Human guide](./USER_GUIDE.md)
- [Schematics](./ABG_GTL_SCHEMATICS.md)
