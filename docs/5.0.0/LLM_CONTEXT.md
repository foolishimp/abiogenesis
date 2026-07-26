# ABIogenesis 5.0 LLM Context

## Status And Use

| Field | Value |
|---|---|
| Document status | Provisional first cut |
| Described Product target | ABIogenesis `5.0.0` |
| Described GTL contract version | `5.0.0` |
| Described ABG contract version | `5.0.0` |
| Current TypeScript package version | `5.0.0-dev.286` |
| Current package status | Private development package; not a registry release |
| Documentation source baseline | Git commit `22a1ea1fccf79d558e4ebe1bb5c07b2d8c7acac1` |
| Last frozen S05 implementation candidate in this source cut | `3a955d6938856d09a0d8ef19af0bb629e20cd8a3`; provisional pending exact-cut review and human acceptance |
| Method reference | Project-selected STDO `v2.2.0` |

Load the project's selected STDO compression before this document. This
document references that method by version only. It does not restate, copy, or
replace STDO.

This file is an LLM-oriented projection of ABIogenesis Product, requirements,
accepted design, and current public TypeScript contracts. It is not a new
truth surface. When this document disagrees with an owning source, the owning
source decides:

```text
Product and requirements
  -> accepted design
  -> exported typed contracts and schemas
  -> this documentation projection
```

Use this file to orient construction and review. Reload the owning source
before changing Product meaning, language law, authority, public contracts, or
runtime behavior.

## Exact Provenance

| Source | Status at this cut | SHA-256 |
|---|---|---|
| `specification/PRODUCT.md` | Accepted Product definition | `a3e27405d59a613a3933f3b3b9261e9ae895be72a7d289bca0e6d4662b49265c` |
| `build_tenants/abiogenesis/typescript/design/M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md` | Accepted direct-GTL base | `ccd8f79d333c4c681f5643acafac59458b661c7d1916eb929f9c7f065dd0cfaf` |
| `build_tenants/abiogenesis/typescript/design/M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md` | Sections 1-12 accepted through S03; Section 13 S05 candidate; Section 14 S06 provisional | `8eefe639bbec51e82206da0df7b3d42954d798c2289a96f506a4b0a3775284e9` |
| `build_tenants/abiogenesis/typescript/code/src/gtl/contracts.ts` | Current realized GTL carriers | `49e498d108f1f9906fe5aca9bfbb117454ae9b9f9edc6cfc13c4ff667425d1c5` |
| `build_tenants/abiogenesis/typescript/code/src/gtl/c_algebra.ts` | Current realized C constructors | `c641ea99bc9a72f51b37cce185d298f930028ac45446f5cf05e3318299249e88` |
| `build_tenants/abiogenesis/typescript/code/src/gtl/graph_applications.ts` | Current realized application constructors | `50b0d16327b5a4bd41d0e3ca7afd75d362b6bacbeb1e91b8de1cca9e665a6169` |
| `build_tenants/abiogenesis/typescript/code/src/gtl/consensus_schema.ts` | Current provisional S05 Product-owned schema source | `dafbc09ebfa5e63f112a1a8dbcd3830dfc0df2a5786ac021abb00d9d7f4e7751` |
| `build_tenants/abiogenesis/typescript/code/src/public/contracts.ts` | Current realized root public contract | `e1b287a00ba19b5f17ec5db0f692313ecc9427689b0354ad63d5be37c15e61f2` |

This document is stale if any recorded source digest changes, the package
version changes, an S05 or S06 status changes, or a release candidate is
selected. A later documentation edit must bind a new exact source baseline.

## Product Compression

ABIogenesis is an LLM-first graph programming product. Developers and LLMs
author ordinary TypeScript values in `GTL.TypeScript`. TypeScript checks local
type law. Raw admission checks erased input. One non-lowering GTL validator
checks whole-program semantic law. HoG traverses the original admitted GTL
Program and materialized GraphFunction graph. ABG admits runtime facts and
derives replay, continuation, correction, and closure. The public SDK and CLI
are thin typed invocation and projection shells.

The supported path is:

```text
GTL.TypeScript value
  -> TypeScript checking
  -> raw admission
  -> publication and Program validation
  -> module and catalog admission
  -> invocation admission
  -> GraphFunction materialization
  -> graph validation
  -> implementation resolution and ABG admission
  -> direct HoG traversal
  -> F_D | F_P | F_H seam
  -> ABG events and replay
  -> typed result | continuation | hold | gap | block | refusal
  -> public projection
```

There is no parser for another GTL language, executable intermediate
representation, compiled execution plan, generated HoG Program, or second
runtime.

## Authority Split

| Owner | Owns | Does not own |
|---|---|---|
| Product | Domain meaning, standard publications, Product-owned predicates and judgment relations | Traversal, runtime admission, events, replay, or closure |
| GTL | Program topology, starts, callable membership, GraphFunction templates, contracts, compute composition, graph applications, policies and proof obligations | Execution facts or runtime decisions |
| TypeScript | Locally decidable authoring constraints | Erased-input or whole-program semantic truth |
| Raw admission | Structural admission of serialized/package-originated values | Whole-program validity or runtime admission |
| GTL validator | Publication, Program, graph, membership, interface, cardinality and cross-reference judgments | Lowering, work selection, execution, events or closure |
| HoG | Direct traversal of the admitted Program and materialized graph | Program authorship, Product semantics, worker supervision, event truth or closure |
| ABG | Runtime admission, Run/GraphCall/Frame/CCall identity, worker supervision, events, evidence, results, judgments, replay, continuation, correction and closure | Domain meaning or program topology |
| Implementation binding | One declared `F_D` or `F_P` leaf seam | GraphFunction identity, topology, event emission, continuation or closure |
| Human actor | Attributed `F_H` response or decision under admitted authority | Direct runtime writes or deterministic-invalidity override |
| Public SDK and CLI | Parse, transport, invoke and render the typed public contract | Hidden defaults, topology selection, worker dispatch, event construction or control loops |

One causal episode crosses these owners. The split is not a set of competing
pipelines.

## GTL Core Identities

### References And Immutability

GTL values are immutable TypeScript data. Semantic identities use explicit
references such as:

```text
module://...
program://...
graph-function://...
graph://...
node://...
graph-vector://...
contract://...
implementation-binding://...
```

References, versions, digests, memberships and contract pairs are part of the
declaration. An implementation must not infer a missing identity from a name,
file location, JavaScript function, or ambient registry.

### Module Publication

`ModulePublication` is the constitutional module publication carrier. It is
transported by, and identity-bound to, an installed package; the package is
not a second constitutional carrier. Its current realized shape binds:

- module identity, version and owning Product;
- artifact, Product-content and Product-manifest digests;
- descriptor and contribution-manifest references;
- one Product-semantics binding;
- contracts, evaluators and rules;
- implementation bindings;
- closure contracts;
- Programs and GraphFunctions; and
- catalog contributions.

A publication may contain only non-callable declarations. It does not need to
publish a Program or GraphFunction unless its contribution requires one.

### Program

`GtlProgram` is the admitted graph composition and public-start carrier:

```ts
interface GtlProgram {
  readonly kind: "gtl_program";
  readonly programRef: string;
  readonly version: "5.0.0";
  readonly moduleRef: string;
  readonly starts: readonly ProgramStart[];
  readonly callableMembership: readonly string[];
  readonly closureContractRef: string;
  readonly policies: Readonly<Record<string, string>>;
  readonly publicAssetTargets?: readonly ProgramPublicAssetTarget[];
  readonly actionCatalog?: GtlActionCatalog;
  readonly constructionComposition?: GtlConstructionComposition;
}
```

A Program owns topology, entry points, callable membership, policy and closure
obligations. It is startable but is not a named library function or runtime
plan.

### GraphFunction

`GraphFunction` is the sole named callable work contract:

```ts
interface GraphFunction {
  readonly kind: "graph_function";
  readonly name: string;
  readonly version: "5.0.0";
  readonly environment: {
    readonly requires: readonly string[];
    readonly provides: readonly string[];
    readonly carries: readonly string[];
  };
  readonly inputs: readonly string[];
  readonly outputs: readonly string[];
  readonly template: GraphTemplate;
  readonly effects: readonly string[];
  readonly declarations: Readonly<Record<string, string>>;
  readonly tags: readonly string[];
}
```

The template contains one graph identity, one start node, one or more terminal
nodes, `c_locus` nodes, directed edges and declared graph-function
applications. Materialization binds admitted input identity and digest without
replacing the template with a host-language callable.

An implementation binding may realize an executable leaf inside the template.
It cannot replace the GraphFunction, its contracts, or its graph.

### Contracts, Rules, Evaluators And Bindings

- `ContractDeclaration` carries `contractRef`, version `5.0.0`, a contract
  kind, and a value kind.
- `EvaluatorDeclaration` carries a compute regime, description, binding,
  consumed field references and tags.
- `RuleDeclaration` carries a rule kind, canonical JSON configuration and
  tags.
- `ImplementationBinding` binds an exact package/module/symbol to one
  `F_D` or `F_P` leaf plus input, output, failure and refusal contracts.
- `ClosureContract` declares the closure predicate, evidence, result,
  judgment, refusal, transition and replay projection.

`F_H` is an admitted external interaction and therefore is not an
`ImplementationBinding`.

### Required 5.0 Language Breadth

Do not mistake the current exported carrier for the complete 5.0 language
obligation. Product requires:

- graphs, nodes, vectors, contexts, interfaces and attributes;
- GraphFunctions, modules, roles, jobs, operators, evaluators and rules;
- composition, substitution, recursion, fan-out, fan-in, gates, promotion,
  identity, same-object and bounded re-entry;
- compute composition and explicit `F_D`, `F_P` and `F_H` regimes;
- Program starts, callable membership, policy, effects, results, closure and
  proof obligations; and
- publication, compatibility and provenance declarations.

The current carrier explicitly exports graphs, nodes, edges, GraphFunctions,
Programs, modules, contracts, evaluators, rules, bindings, closure,
applications and C composition. Its final declaration families for vectors,
contexts, interfaces, attributes, jobs, operators and proof obligations are
not yet publicly reconciled. Preserve those as visible realization gaps. Do
not invent private types or infer that omission removed their Product meaning.

The nine required consequence-route meanings are:

```text
same_edge_retry
depth_traversal
graph_span_reentry
public_start_reentry
ticket_traversal
fh_input_required
escalation_or_reprice
gap_stop
non_admit
```

The thirteen Product-level runtime disposition meanings are:

```text
advance_vector
close
retry_same_edge
repair
re_enter
yield_continuation
inspect_runtime_archive
reprice
human_assurance_required
escalate
gap_stop
block
non_admit
```

These are required semantics, not a claim that every label is already an
exported TypeScript union or root public operation.

## GTL Graph Syntax

### Product Algebra

The Product graph algebra is:

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

These are semantic relations, not special runners.

The current serialized carrier projection makes an important distinction:

- `edge` is a `GtlEdge` joining two declared nodes;
- the `GraphFunctionApplication` union carries `compose`, `substitute`,
  `recurse`, `fan_out`, `fan_in`, `gate`, `re_enter`, `promote`, `identity`
  and `same_object`;
- `re_enter` is an explicit bounded traversal application in the realized
  carrier, while it is not an additional Product graph-algebra family.

Do not silently merge the Product algebra with its serialized carrier
projection.

| Relation | Required semantic constraint |
|---|---|
| `edge` | Exact source and target node references |
| `compose` | Left output contract equals right input contract |
| `substitute` | One inner GraphFunction replaces one declared outer vector while preserving the outer contract |
| `recurse` | Exact GraphFunction, termination rule/evaluators, JSON field path, foldback declaration and positive bound |
| `fan_out` | One vector input expands to identity-preserving member calls under one batch identity |
| `fan_in` | One complete vector enters one declared reducer |
| `gate` | One target is admitted or blocked by one Rule and declared Evaluators |
| `re_enter` | Distinct source and target Program loci plus a positive application bound |
| `promote` | Exact source and target contracts; changed meaning requires a distinct GraphFunction identity |
| `identity` | One exact interface is preserved |
| `same_object` | Two positions bind the same opaque identity and produce an identity witness |

Current native constructors include:

```text
graphEdge
composeApplication
substituteApplication
recurseApplication
fanOutApplication
fanInApplication
gateApplication
reenterApplication
promoteApplication
identityApplication
sameObjectApplication
```

Higher-level constructors currently include `composeGraphFunctions`,
`substituteGraphFunction`, `promoteGraphFunction` and
`identityGraphFunction`.

## GTL Compute Syntax

### The Seven Constructors

The complete C generator set is:

| Source spelling | Serialized kind | Meaning |
|---|---|---|
| `C.of(...)` | `c_of` | One atomic compute or interaction leaf |
| `C.id(carrier)` | `c_identity` | Identity over one exact carrier |
| `C.compose(left, right)` | `c_compose` | Associative typed sequencing; nested composition flattens |
| `C.edge({ transform, evaluate, consequence })` | `c_edge` | Canonical three-role edge record made from direct `C.of` leaves |
| `workflow.C(graphFunctionRef)` | `c_workflow` | Transparent child GraphFunction traversal |
| `C.batch(tasks, batchRef, outerCarriers?)` | `c_batch` | Non-empty pointwise task family with one carrier pair and result cardinality |
| `C.retry(term, budget)` | `c_retry` | Repeat the same bounded C interior under fresh attempt lineage |

`workflow.C` is deliberately separate from the `C` object. Graph recursion and
`C.retry` are not substitutes: recursion re-applies a GraphFunction with
termination and foldback; retry repeats one attempt without changing the graph
relation.

### C Carriers And Atomic Leaves

`cCarrier<T>(ref)` creates the typed carrier witness used by native
constructors. `C.of` requires:

```text
input and output carriers
program locus
stage role
compute fibre
arm identity
optional composition identity
vector index
judgment predicate
result-bearing flag
leaf requirement
```

An `F_D` or `F_P` leaf uses `ExecutableLeafRequirement`:

```text
implementation binding
input contract
output contract
evidence contract
failure contract
refusal contract
judgment contract
```

An `F_H` leaf uses `InteractionLeafRequirement`:

```text
interaction kind
actor capability
request contract
response contract
continuation contract
```

The requirement kind must match the compute regime.

### Compute Regimes

| Regime | Meaning | Admission boundary |
|---|---|---|
| `F_D` | A declared total mechanical function over a closed domain | Deterministic evidence and result admission; no semantic or human substitution |
| `F_P` | Bounded open semantic construction or evaluation | Attributed output remains candidate material until contract and Product admission |
| `F_H` | Attributed human approval, rejection, ambiguity resolution or policy choice | Typed request/response and capability admission before same-run continuation |

Implementation technology does not determine the fibre. A deterministic
implementation of open semantic judgment remains `F_P`.

### Algebra Laws

```text
C.compose(C.id, c) == c
C.compose(c, C.id) == c
C.compose(C.compose(a, b), c)
  == C.compose(a, C.compose(b, c))

workflow.C(ref<A, B>) preserves A -> B
C.retry(c, n) preserves the contract of c
C.batch preserves member identity, carrier pair and result cardinality
```

Replacing an `F_P` interior with an equivalent `F_D` interior must preserve
the surrounding graph shape, C-call locus, event spine and continuation law.

### Neutral Constructor Example

This example illustrates the current constructor relationships. It is not a
complete publication or an alternative contract definition.

```ts
import {
  C,
  cCarrier,
  cGraphFunctionRef,
  workflow,
} from "@abiogenesis/typescript-tenant/gtl";

type Input = Readonly<{ text: string }>;
type Candidate = Readonly<{ normalized: string }>;
type Assessment = Readonly<{ accepted: boolean }>;
type Output = Readonly<{ value: string }>;

const InputCarrier = cCarrier<Input>("contract://example/input@5");
const CandidateCarrier =
  cCarrier<Candidate>("contract://example/candidate@5");
const AssessmentCarrier =
  cCarrier<Assessment>("contract://example/assessment@5");
const OutputCarrier = cCarrier<Output>("contract://example/output@5");

const transform = C.of({
  input: InputCarrier,
  output: CandidateCarrier,
  programLocusRef: "program-locus://example/transform@5",
  stageRole: "transform",
  fibre: "F_D",
  armId: "arm://example/transform@5",
  compositionRef: "composition://example/edge@5",
  vectorIndex: 0,
  judgmentPredicateRef: "predicate://example/transform-valid@5",
  resultBearing: false,
  requirement: {
    kind: "executable_leaf_requirement",
    implementationBindingRef: "implementation-binding://example/transform@5",
    inputContractRef: InputCarrier.ref,
    outputContractRef: CandidateCarrier.ref,
    evidenceContractRef: "contract://example/evidence@5",
    failureContractRef: "contract://example/failure@5",
    refusalContractRef: "contract://example/refusal@5",
    judgmentContractRef: "contract://example/judgment@5",
  },
});

const evaluate = C.of({
  input: CandidateCarrier,
  output: AssessmentCarrier,
  programLocusRef: "program-locus://example/evaluate@5",
  stageRole: "evaluate",
  fibre: "F_P",
  armId: "arm://example/evaluate@5",
  compositionRef: "composition://example/edge@5",
  vectorIndex: 1,
  judgmentPredicateRef: "predicate://example/evaluation-admissible@5",
  resultBearing: false,
  requirement: {
    kind: "executable_leaf_requirement",
    implementationBindingRef: "implementation-binding://example/evaluate@5",
    inputContractRef: CandidateCarrier.ref,
    outputContractRef: AssessmentCarrier.ref,
    evidenceContractRef: "contract://example/evidence@5",
    failureContractRef: "contract://example/failure@5",
    refusalContractRef: "contract://example/refusal@5",
    judgmentContractRef: "contract://example/judgment@5",
  },
});

const consequence = C.of({
  input: AssessmentCarrier,
  output: OutputCarrier,
  programLocusRef: "program-locus://example/consequence@5",
  stageRole: "consequence",
  fibre: "F_D",
  armId: "arm://example/consequence@5",
  compositionRef: "composition://example/edge@5",
  vectorIndex: 2,
  judgmentPredicateRef: "predicate://example/output-admissible@5",
  resultBearing: true,
  requirement: {
    kind: "executable_leaf_requirement",
    implementationBindingRef:
      "implementation-binding://example/consequence@5",
    inputContractRef: AssessmentCarrier.ref,
    outputContractRef: OutputCarrier.ref,
    evidenceContractRef: "contract://example/evidence@5",
    failureContractRef: "contract://example/failure@5",
    refusalContractRef: "contract://example/refusal@5",
    judgmentContractRef: "contract://example/judgment@5",
  },
});

const edge = C.edge({ transform, evaluate, consequence });
const boundedEdge = C.retry(edge, 2);

const child = workflow.C(cGraphFunctionRef({
  graphFunctionRef: "graph-function://example/child@5",
  input: InputCarrier,
  output: OutputCarrier,
}));
```

Every reference in a real publication must resolve through the selected
Module, Program, contracts, implementation bindings and catalog. Constructor
success does not establish whole-Program or runtime admission.

## Validation And Admission

### Three Validation Depths

1. **TypeScript checking** decides local types, generics, interface matching
   and discriminated-union construction.
2. **Raw admission** checks serialized or package-originated values after
   TypeScript types are erased and binds their canonical identity and digest.
3. **GTL validation** checks cross-reference, membership, graph, C,
   interface, cardinality, recursion, policy, effect, result, refusal,
   closure and implementation-declaration relations.

Publication validation permits lawful non-callable publications. Program
validation precedes invocation admission. Graph validation follows
GraphFunction materialization. Their identities enter one ABG execution basis.

The validator returns diagnostics and identity-bearing views of the same GTL
value. It does not return an executable plan or runtime topology.

### Runtime Admission

Runtime admission binds facts static validation cannot create:

- exact installed Product set and dependency lock;
- workspace authority;
- admitted catalog and narrowed catalog view;
- selected Program and GraphFunction membership;
- exact input and context;
- implementation, worker, tool and capability identity;
- invocation, closure and execution basis; and
- event-store and continuation authority.

Missing, ambiguous, conflicting or stale identity fails closed at the earliest
owner that can decide it. An empty catalog view never activates a fallback.

## Module, Catalog And Public Surface

### Catalog Semantics

A module contributes rows of kind:

```text
graph_function
node_type
overlay
```

Only an admitted GraphFunction belonging to the selected Program is callable.
A Program is startable through one declared start. Node types and overlays are
inspectable and applicable but not callable. Catalog visibility alone grants
no execution authority.

An invocation binds one exact installed Product set, workspace, catalog view,
Program, callable or start, input, context, implementation/capability set and
ABG execution basis.

### Current Realized Root Operations

The current exported `RootPublicOperationId` union contains exactly:

| Operation | Current role |
|---|---|
| `abg.operation.product.verify` | Verify one supplied artifact basis |
| `abg.operation.product.install` | Install one verified artifact |
| `abg.operation.workspace.bind` | Bind a workspace to one exact Product set |
| `abg.operation.catalog.admit` | Admit a module publication/contribution family |
| `abg.operation.catalog.apply` | Apply one admitted non-callable declaration |
| `abg.operation.catalog.view` | Narrow an admitted catalog through an allowlist |
| `abg.operation.project.read` | Read replay-derived status, result, replay, gaps and related projections |
| `abg.operation.interaction.respond` | Admit a typed response at a pending `F_H` boundary |
| `abg.operation.run.continue` | Continue the same admitted Run under durable continuation authority |
| `abg.operation.run.invoke` | Invoke a callable GraphFunction directly or start a declared Program |

Active Product requirements describe a wider final public family. The
committed package currently exports only the package root plus `product`,
`abg`, `gtl`, `hog`, `public` and `validator`, and the current root public
contract exposes the ten operations above. That difference is an unreconciled
realization gap. Do not present retired `app/m04` exports or the wider
required operation list as already runnable 5.0 APIs.

Reconciling final public-contract parity is part of the unaccepted S06 and
release work. Product decides required meaning; current exports decide what a
provisional operation example may claim.

### Invocation And Outcome Envelopes

Every current root public invocation carries:

```text
kind = public_invocation
schemaVersion = 5.0.0
operationId
variant
invocationRef
eventTime
correlationId
payload
```

`PublicOutcome` repeats the operation and invocation identity and projects a
typed disposition, digest and result. When applicable it also carries Run,
GraphCall, Frame, CCall, result, judgment, replay, durable event-log and
continuation identities.

The current disposition union is:

```text
blocked
failed
gap_stop
held
inspect_runtime_archive
repair
reprice
reprice_required
escalate
refused
succeeded
```

Pure reads append no runtime events. Public outcomes project ABG truth; they do
not create it.

## Direct HoG And ABG Runtime

### One Invocation Path

```text
raw-admit request
  -> validate publication and Program
  -> admit exact invocation
  -> materialize GraphFunction graph
  -> validate graph
  -> Product proposes implementation resolution
  -> validator checks static compatibility
  -> ABG admits implementation and execution basis
  -> open Run, GraphCall and Frame
  -> HoG traverses the declared GTL locus
  -> ABG opens one CCall and admits the selected fibre
  -> declared leaf or interaction occurs
  -> ABG admits evidence, result and judgment
  -> replay derives the current state
  -> HoG applies only an admitted continuation
  -> ABG admits terminal or nonterminal truth
  -> Public renders the replay-derived outcome
```

HoG may use invocation-local cursors, queues, frames and caches. They remain
subordinate to the admitted Program and cannot be serialized or resumed as a
rival Program.

### CCall Spine

Every admitted C call follows one uniform spine:

```text
c_call_opened
  -> c_call_fibre_selected
  -> zero or more evidence admissions
  -> result admitted
  -> judged
```

Failure and refusal complete the applicable admitted spine under typed
contracts; they do not strand an opened CCall or fabricate success.

A successful terminal graph call closes in this order:

```text
terminal_reached
  -> frame_closed
  -> graph_call_closed
  -> run_closed
```

Output presence, worker completion or a log line is not closure.

### Replay, Continuation And Re-entry

ABG assigns event identity, causation and append ordinal. Durable replay
reconstructs current state from admitted events plus the admitted GTL basis.
Callers, fixtures and workers cannot supplement missing runtime truth.

Nonterminal outcomes include retry, repair, recursive child traversal,
foldback, re-entry, yield, typed human hold, escalation, gap, block and
non-admission. A public `F_H` response must bind the exact request, actor,
capability and continuation basis. `run.continue` reopens the same admitted
Run under durable continuation authority; process-local memory is not a
fallback.

## Standard Product Constructions

### One Surface

The accepted standard construction Program orders four Product-owned semantic
authorities:

```text
synthesizeModel
  -> evalGap
  -> evaluateNext
  -> evaluateAction
```

Intent admission, invocation, evidence admission and continuation remain
separate ABG boundaries. Fresh evidence requires a refreshed model, gap,
next-action and action-result basis before closure. Public code invokes and
projects this Program; it does not implement its loop.

### S05: Consensus

Status at this documentation cut: **provisional exact candidate, not accepted
S05 closure**.

Consensus is a Product-owned standard GraphFunction expressed as ordinary GTL
free construction. It uses the same Program, catalog, One Surface,
`run.invoke`, HoG, C, ABG event, replay, result and `F_H` continuation path as
any other admitted GraphFunction.

Its intended proof covers attributed reviewer tasks, fan-out, fan-in,
mechanical validation, probabilistic evaluation, bounded disagreement
recursion, unresolved human escalation, typed results and replay. It must not
introduce a Consensus command, controller, scheduler, event family, result
store, continuation model or closure path.

The candidate at `3a955d69` is pending independent exact-cut review and human
acceptance. Treat its schema, vocabulary and detailed Section 13 behavior as
candidate realization, not released API.

### S06: Native And Downstream Portability

Status at this documentation cut: **provisional design, unselected and not
implemented as a Product closure claim**.

The S06 target proves:

- native SDK and CLI agreement;
- one bounded host projection over the same public contract;
- one independently packed, generically named flavored Product using only
  installed public exports;
- source-independent module publication, declaration application and
  GraphFunction invocation.

Observer and tuner are later Product work, not part of S06. Their eventual
realization remains ordinary Product-owned GTL over replay truth, with
attributed proposals whose ratification stays outside the proposer.

Do not teach S06 design as currently available behavior. In particular, do
not invent missing public exports, portability guarantees, observer/tuner
operations or a registry installation command.

## Prohibited Rival Authorities

Do not introduce or infer:

- a second GTL source language or parser;
- an executable IR, bytecode, generated HoG Program or compiled execution
  plan;
- a hidden default Program, GraphFunction, implementation, route or topology;
- an SDK, CLI, installer, fixture, worker, plugin or feature controller;
- a feature-specific runner for recursion, Consensus or another construction;
- worker-authored events, results, judgments, continuation or closure;
- a second event stream, result ledger, retry loop or continuation store;
- direct implementation imports from Public;
- source-tree or private-runtime knowledge in an independent consumer;
- automatic ticket mutation or ABG-owned scheduling; or
- completion inferred from tests, artifacts or output presence rather than
  the admitted Product and replay predicate.

When a required capability is absent, record a typed gap or return to its
owning source. Do not reconstruct it in downstream glue.

## LLM Construction Checklist

Before proposing GTL:

1. Name the admitted Module and Program.
2. Name every callable GraphFunction and its Program membership.
3. Declare exact input, output, evidence, failure, refusal, judgment and
   closure contracts.
4. Express topology through GraphFunction templates, edges and applications.
5. Express compute through only the seven C constructors.
6. Classify every leaf as `F_D`, `F_P` or `F_H` from semantic totality and
   authority, not implementation technology.
7. Bind implementations only at declared `F_D` or `F_P` leaves.
8. Declare starts, policies, termination, foldback, retries, capabilities,
   effects and proof obligations.
9. Preserve exact references, versions, membership and digests.
10. Pass TypeScript, raw admission, publication validation, Program validation
    and materialized-graph validation.
11. Enter execution only through the admitted catalog and public invocation.
12. Read result, continuation and closure only from ABG replay projections.

Before reviewing an implementation:

1. Trace Product meaning to GTL declaration.
2. Trace the GTL declaration through non-lowering validation.
3. Prove HoG traverses the original admitted value.
4. Prove ABG owns every runtime admission and event.
5. Prove Public is a thin projection.
6. Search for hidden defaults, feature branches, controllers, second stores
   and implementation-only callables.
7. Distinguish accepted behavior from provisional S05/S06 material.
8. Refuse a documentation claim that is wider than the current exported
   contract or narrower than the Product target.

## Source Reload Map

| Question | Reload |
|---|---|
| What is ABIogenesis 5.0? | `specification/PRODUCT.md` |
| What is the current selected outcome? | `specification/GOALS.md` |
| What must GTL declare? | `specification/requirements/gtl/` |
| What must ABG own? | `specification/requirements/abg/` |
| How do GTL, HoG and ABG relate? | `specification/requirements/mapping/` |
| What must the installed catalog and public Product expose? | `specification/requirements/product/` |
| What direct runtime architecture is accepted? | `build_tenants/abiogenesis/typescript/design/M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md` |
| What traversal/S03/S05/S06 realization is accepted or provisional? | `build_tenants/abiogenesis/typescript/design/M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md` |
| What GTL syntax is currently exported? | `build_tenants/abiogenesis/typescript/code/src/gtl/index.ts` and its typed sources |
| What root operations are currently runnable? | `build_tenants/abiogenesis/typescript/code/src/public/contracts.ts` and `public/index.ts` |
