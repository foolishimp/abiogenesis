# ABIogenesis 5.0 GTL And ABG User Guide

## Document identity

| Field | Value |
|---|---|
| Documentation status | Provisional first cut |
| ABIogenesis version described | `5.0.0` target |
| Current package used for contract and command examples | `@abiogenesis/typescript-tenant@5.0.0-dev.286` |
| GTL declaration and public-contract schema version | `5.0.0` |
| Source snapshot used for this cut | Git commit `22a1ea1fccf79d558e4ebe1bb5c07b2d8c7acac1` |
| Method reference | Project-selected STDO `v2.2.0` |
| Product status | Development candidate; no ABIogenesis `5.0.0` release exists |
| Scenario status | S03 accepted; S05 and S06 behavior described here remains provisional and unreleased |

This guide is a derived explanation of ABIogenesis. It is not specification,
design, release, or execution authority.

If this guide conflicts with the source project, the deciding order is:

1. `specification/PRODUCT.md`;
2. applicable files under `specification/requirements/`;
3. accepted design;
4. the exported TypeScript contracts for the exact package version;
5. this guide.

The project-level method bootstrap already selects and compresses the operative
STDO release. This guide references that version and does not reproduce or
reinterpret it.

The current source has an unresolved public-contract reconciliation boundary:
some target requirements name wider public groups and operations that the
`5.0.0-dev.286` package does not yet export. This guide separates the 5.0
Product meaning from the currently runnable package. Contract and command
examples use only the exports and ten public operations present in the package
at the source snapshot above.

## 1. What ABIogenesis is

ABIogenesis is an LLM-first graph programming product. It lets a developer
declare a complete typed program before execution, then preserve a causal,
replayable account of what happened during execution.

The product has four central layers:

| Layer | Owns | Does not own |
|---|---|---|
| GTL.TypeScript | Program meaning, GraphFunctions, graph topology, compute composition, contracts, policies, and publication | Runtime facts, event admission, worker supervision, or closure truth |
| GTL validator | Raw admission and static whole-program judgment without lowering | Work selection, runtime state, or an executable plan |
| HoG | Direct traversal of the admitted GTL Program and materialized GraphFunction graph | Program authorship, catalog authority, or runtime truth |
| ABG | Invocation admission, calls, frames, attempts, events, evidence, results, replay, continuation, correction, and closure | Product-domain meaning or an alternative program |

The public SDK and `abg.cli` are thin shells over the same installed Product
and ABG runtime. They carry explicit requests and render typed projections.
They do not decide topology, choose hidden work, invoke a worker directly,
write events, manufacture continuation authority, or decide closure.

The supported path is:

```text
GTL.TypeScript declaration
  -> TypeScript checking
  -> raw admission
  -> non-lowering publication and Program validation
  -> exact installed Product, workspace, catalog, and implementation basis
  -> GraphFunction materialization
  -> graph validation
  -> direct HoG traversal
  -> declared F_D | F_P | F_H boundary
  -> ABG event admission and replay
  -> result | hold | gap | block | refusal | failure
```

There is no GTL parser or separate GTL source file format. GTL is TypeScript.
There is no compiler from GTL into a second executable Program, intermediate
representation, bytecode, or HoG plan. Validation preserves the admitted GTL
identity; HoG traverses that value directly.

## 2. The programming model

### 2.1 The main declaration hierarchy

```text
ModulePublication
  ├── ContractDeclaration[]
  ├── EvaluatorDeclaration[]
  ├── RuleDeclaration[]
  ├── ImplementationBinding[]
  ├── ClosureContract[]
  ├── GtlProgram[]
  │     ├── ProgramStart[]
  │     ├── callable GraphFunction membership
  │     └── policies and optional Product construction declarations
  ├── GraphFunction[]
  │     └── GraphTemplate
  │           ├── GtlNode[]
  │           │     └── CProgramNode
  │           ├── GtlEdge[]
  │           └── GraphFunctionApplication[]
  └── CatalogContribution[]
```

A `ModulePublication` is the publication boundary. A `GtlProgram` is the
complete admitted graph composition that owns starts and callable membership.
A `GraphFunction` is the sole named callable work contract. Each
`GraphFunction` supplies a graph template; it is not an implementation-only
function pointer.

Only a GraphFunction may be invoked by name. A Program may be started at a
declared `ProgramStart`. Node types, overlays, assets, vectors, and contracts
can be inspected or applied where declared, but they are not callable.

### 2.2 Identity is part of the language

Most GTL entities use explicit URI-like references:

```text
module://example.local/text@5
program://example.local/text/render@5
start://example.local/text/render@5
graph-function://example.local/text/render@5
graph://example.local/text/render@5
node://example.local/text/render@5
locus://example.local/text/render@5
contract://example.local/text/input@5
implementation-binding://example.local/text/render@5
predicate://example.local/text/rendered@5
```

These strings are opaque identities, not paths to hidden behavior. References
must be non-empty, unique where required, and resolve through the publication
and selected catalog view. Content-bearing runtime values additionally carry
canonical SHA-256 identities.

Changing declaration content without changing or invalidating its identity is
not a supported form of mutation. Build a new immutable publication or
versioned declaration instead.

## 3. Installing the current provisional package

ABIogenesis 5.0 has not been published as a stable registry release. The
current installed proof uses a packed tarball, a CLI host that runs the public
operations, and a separate empty Product installation target.

From the TypeScript tenant:

```bash
cd build_tenants/abiogenesis/typescript
npm ci
npm run build
npm pack --ignore-scripts --json --pack-destination /absolute/path/to/artifacts
```

Create a clean ESM CLI host and install the produced tarball:

```bash
mkdir -p /absolute/path/to/cli-host
cd /absolute/path/to/cli-host
npm init -y
npm pkg set type=module
npm install --ignore-scripts --no-audit --no-fund \
  /absolute/path/to/artifacts/abiogenesis-typescript-tenant-5.0.0-dev.286.tgz
```

Do not use the CLI host as the `product.install` target. That operation
requires a different absent or empty directory such as
`/absolute/path/to/product-consumer`; it refuses a target that already
contains the CLI host package or any other entry.

The current package requires Node.js 20 or newer. Its supported package
exports are:

| Import | Purpose |
|---|---|
| `@abiogenesis/typescript-tenant` | Root export |
| `@abiogenesis/typescript-tenant/product` | Product verification, installation, environment, catalog, and Product-owned semantic boundaries |
| `@abiogenesis/typescript-tenant/gtl` | GTL types, constructors, graph applications, materialization, and current standard constructions |
| `@abiogenesis/typescript-tenant/validator` | Raw, publication, Program, Graph, and implementation-resolution validation |
| `@abiogenesis/typescript-tenant/hog` | Direct traversal APIs and types |
| `@abiogenesis/typescript-tenant/abg` | Runtime admission, event, replay, continuation, and closure APIs |
| `@abiogenesis/typescript-tenant/public` | Current public request envelope, operation application, and projections |

These are the only current subpath exports. Earlier paths such as
`./app/m04`, `./abg/m03`, or private source-tree module paths are not 5.0
public APIs.

The installed binaries are:

```text
abg.cli
abg.codex
```

Only native `abg.cli --jsonl <file>` is documented as the current
stable-shaped provisional transport. The bounded host projection belongs to
the unresolved S06 boundary.

## 4. GTL.TypeScript language reference

### 4.1 Contracts

A contract declaration gives a reference a version, role, and value kind:

```ts
interface ContractDeclaration {
  readonly contractRef: string;
  readonly contractVersion: "5.0.0";
  readonly contractKind:
    | "closure"
    | "evidence"
    | "failure"
    | "input"
    | "judgment"
    | "output"
    | "refusal"
    | "transition";
  readonly valueKind: string;
}
```

Contract declarations do not themselves validate arbitrary JSON. They bind
semantic identities used by the Product-owned validation and judgment
relations. A complete executable leaf normally references:

- input and output contracts;
- evidence contract;
- failure contract;
- refusal contract;
- judgment contract; and
- a judgment predicate.

A Program also names a closure contract. Open probabilistic and human
boundaries must declare malformed-output, contradiction, attribution,
continuation, and refusal shapes appropriate to the Product domain.

### 4.2 Typed carriers

The C algebra is typed by `CCarrier<Value>` values:

```ts
import { cCarrier } from "@abiogenesis/typescript-tenant/gtl";

interface TextInput {
  readonly kind: "text_input";
  readonly schemaVersion: "5.0.0";
  readonly text: string;
}

interface TextOutput {
  readonly kind: "text_output";
  readonly schemaVersion: "5.0.0";
  readonly normalized: string;
}

const input = cCarrier<TextInput>(
  "contract://example.local/text/input@5",
);
const output = cCarrier<TextOutput>(
  "contract://example.local/text/output@5",
);
```

Use `cCarrier`; do not forge a carrier-shaped object. Constructor identity is
checked in addition to its visible fields.

### 4.3 Compute regimes

Every executable leaf selects one compute regime:

| Regime | Meaning | Admission rule |
|---|---|---|
| `F_D` | Interface checks, envelope checks, total mechanical predicates, and declared total functions over a closed domain | Produces deterministic candidate evidence and result; ABG still admits runtime truth |
| `F_P` | Open semantic construction or evaluation, including synthesis, diagnosis, ranking, and repair | Output remains candidate material until contract, attribution, and contradiction admission succeeds |
| `F_H` | Attributed human approval, choice, ambiguity resolution, escalation, or reprice authority | Produces a typed hold and can resume only after exact response and capability admission |

`F_D` means total and closed, not merely “implemented in TypeScript” or
“usually reliable.” Open semantic judgment defaults to `F_P`. An `F_P` worker
cannot impersonate `F_H`, and a human response cannot override deterministic
invalidity.

`F_D` and `F_P` leaves use an executable requirement:

```ts
interface ExecutableLeafRequirement {
  readonly kind: "executable_leaf_requirement";
  readonly implementationBindingRef: string;
  readonly inputContractRef: string;
  readonly outputContractRef: string;
  readonly evidenceContractRef: string;
  readonly failureContractRef: string;
  readonly refusalContractRef: string;
  readonly judgmentContractRef: string;
}
```

`F_H` uses an interaction requirement and has no implementation binding:

```ts
interface InteractionLeafRequirement {
  readonly kind: "interaction_leaf_requirement";
  readonly interactionKind: string;
  readonly actorCapabilityRef: string;
  readonly requestContractRef: string;
  readonly responseContractRef: string;
  readonly continuationContractRef: string;
}
```

### 4.4 The seven C constructors

The exported constructor surface is:

```ts
import {
  C,
  cCarrier,
  cGraphFunctionRef,
  workflow,
} from "@abiogenesis/typescript-tenant/gtl";
```

| Authored form | Runtime kind | Purpose |
|---|---|---|
| `C.of({...})` | `c_of` | One declared `F_D`, `F_P`, or `F_H` leaf locus |
| `C.id(carrier)` | `c_identity` | Identity over one exact carrier |
| `C.compose(left, right)` | `c_compose` | Typed associative sequencing |
| `C.edge({ transform, evaluate, consequence })` | `c_edge` | Canonical transform/evaluate/consequence relation |
| `workflow.C(graphFunctionRef)` | `c_workflow` | Transparent child GraphFunction traversal |
| `C.batch(tasks, batchRef, outerCarriers?)` | `c_batch` | One declared ordered group of pointwise child computations |
| `C.retry(term, budget)` | `c_retry` | Bounded fresh attempts of the same C interior |

#### `C.of`

```ts
const render = C.of({
  input,
  output,
  programLocusRef: "locus://example.local/text/render@5",
  stageRole: "result",
  fibre: "F_D",
  armId: "arm://example.local/text/render@5",
  compositionRef: null,
  vectorIndex: 0,
  judgmentPredicateRef: "predicate://example.local/text/rendered@5",
  resultBearing: true,
  requirement: {
    kind: "executable_leaf_requirement",
    implementationBindingRef:
      "implementation-binding://example.local/text/render@5",
    inputContractRef: input.ref,
    outputContractRef: output.ref,
    evidenceContractRef:
      "contract://example.local/text/evidence@5",
    failureContractRef:
      "contract://example.local/text/failure@5",
    refusalContractRef:
      "contract://example.local/text/refusal@5",
    judgmentContractRef:
      "contract://example.local/text/judgment@5",
  },
});
```

`programLocusRef`, `stageRole`, `armId`, `vectorIndex`, the optional
`compositionRef`, and `judgmentPredicateRef` preserve the leaf's place and
meaning through traversal and replay. `resultBearing` controls result
cardinality; it is not inferred from implementation behavior.

An `F_H` leaf uses the same locus fields but selects `fibre: "F_H"` and an
`interaction_leaf_requirement`:

```ts
const approvalRequest = cCarrier<{
  readonly kind: "approval_request";
  readonly schemaVersion: "5.0.0";
  readonly question: string;
}>("contract://example.local/approval/request@5");

const approvalResponse = cCarrier<{
  readonly kind: "approval_response";
  readonly schemaVersion: "5.0.0";
  readonly accepted: boolean;
}>("contract://example.local/approval/response@5");

const approval = C.of({
  input: approvalRequest,
  output: approvalResponse,
  programLocusRef: "locus://example.local/approval/request@5",
  stageRole: "approval",
  fibre: "F_H",
  armId: "arm://example.local/approval/request@5",
  compositionRef: null,
  vectorIndex: 0,
  judgmentPredicateRef:
    "predicate://example.local/approval/response-admitted@5",
  resultBearing: true,
  requirement: {
    kind: "interaction_leaf_requirement",
    interactionKind: "approval",
    actorCapabilityRef:
      "capability://example.local/approval/respond@5",
    requestContractRef: approvalRequest.ref,
    responseContractRef: approvalResponse.ref,
    continuationContractRef:
      "contract://example.local/approval/continuation@5",
  },
});
```

#### `C.id`

```ts
const unchanged = C.id(input);
```

Identity requires the same exact carrier on both sides and contributes no
result-bearing leaf.

#### `C.compose`

```ts
const normalizeThenRender = C.compose(normalize, render);
```

The left output carrier must exactly equal the right input carrier.
Composition flattens nested composition and erases identity terms. It does not
create an anonymous runtime Program or hidden frame.

#### `C.edge`

```ts
const assessAndApply = C.edge({
  transform,
  evaluate,
  consequence,
});
```

Each member must be a `C.of` leaf whose `stageRole` is exactly `transform`,
`evaluate`, or `consequence`. Their adjacent carriers must agree. This
constructor is the canonical three-stage relation, not the only lawful Program
shape. An executable edge Program names exactly one result-bearing role.

#### `workflow.C`

```ts
const childInput = cCarrier<ChildInput>(
  "contract://example.local/child/input@5",
);
const childOutput = cCarrier<ChildOutput>(
  "contract://example.local/child/output@5",
);

const callChild = workflow.C(cGraphFunctionRef({
  graphFunctionRef:
    "graph-function://example.local/child/process@5",
  input: childInput,
  output: childOutput,
}));
```

This declares a transparent child traversal. The child GraphFunction must be
published and belong to the admitted Program. HoG enters a child graph call
and frame; ABG preserves parent/child lineage and admits foldback. A direct
implementation call is not a substitute.

#### `C.batch`

```ts
const batch = C.batch(
  [callChild],
  "batch://example.local/items/process@5",
  {
    input: itemVectorInput,
    output: itemVectorOutput,
  },
);
```

The seed tasks must be non-empty and share one input/output carrier pair and
result cardinality. With a declared `fan_out` application, materialization
expands one `workflow.C` seed to the admitted ordered input-member vector.
Member ordinal, identity, output cardinality, evidence, and partial-stop truth
remain explicit. The batch reference is a non-authoritative grouping identity;
it does not collapse the member results into one synthetic `many` result.

#### `C.retry`

```ts
const boundedRender = C.retry(renderCandidate, 3);
```

The budget is a positive safe integer. Retry repeats the same bounded C term
with fresh attempt identity. It does not change graph topology and is not
GraphFunction recursion.

### 4.5 Graph templates, nodes, and edges

A GraphFunction publishes an inline graph template:

```ts
interface GraphTemplate {
  readonly kind: "inline_graph";
  readonly graphRef: string;
  readonly startNodeRef: string;
  readonly terminalNodeRefs: readonly string[];
  readonly nodes: readonly GtlNode[];
  readonly edges: readonly GtlEdge[];
  readonly applications: readonly GraphFunctionApplication[];
}

interface GtlNode {
  readonly nodeRef: string;
  readonly nodeKind: "c_locus";
  readonly term: CProgramNode;
}
```

Every current node is a `c_locus` containing one of the seven C-term kinds.
`startNodeRef` must resolve exactly once. Every terminal reference must resolve
to a node. Edges must refer to published nodes and preserve valid topology.

Create a canonical edge with:

```ts
import { graphEdge } from "@abiogenesis/typescript-tenant/gtl";

const edge = graphEdge({
  fromNodeRef: "node://example.local/text/normalize@5",
  toNodeRef: "node://example.local/text/render@5",
});
```

The constructor derives `edgeRef` from the endpoints. Do not write an arbitrary
edge digest.

### 4.6 Graph applications

The Product graph algebra and its current serialized carrier projection are
related but not identical lists:

| Product-level relation | Current authored carrier |
|---|---|
| `edge` | `GtlEdge` in `GraphTemplate.edges`, normally created by `graphEdge` |
| `compose` | `ComposeApplication` |
| `substitute` | `SubstituteApplication` |
| `recurse` | `RecurseApplication` |
| `fan_out` | `FanOutApplication` |
| `fan_in` | `FanInApplication` |
| `gate` | `GateApplication` |
| `promote` | `PromoteApplication` |
| `identity` | `IdentityApplication` |
| `same_object` | `SameObjectApplication` |

The current `GraphFunctionApplication` union additionally carries
`ReenterApplication` with `relationKind: "re_enter"`. It is the typed carrier
for bounded graph-span re-entry in the retained traversal contract. It does
not turn `edge` into an application or silently add another Product graph
algebra family. Product meaning is decided by `PRODUCT.md`; this section
documents how that meaning is serialized by `5.0.0-dev.286`.

Graph applications declare relations between GraphFunctions, vectors,
contracts, policies, and graph loci. Constructors derive canonical
`applicationRef` identities.

| Constructor | `relationKind` | Required semantic fields |
|---|---|---|
| `composeApplication` | `compose` | left and right GraphFunction references |
| `substituteApplication` | `substitute` | outer GraphFunction, target vector, inner GraphFunction |
| `recurseApplication` | `recurse` | GraphFunction, termination rule and evaluators, Boolean field path, foldback, positive bound |
| `fanOutApplication` | `fan_out` | batch, element GraphFunction, input/output vectors, member contracts |
| `fanInApplication` | `fan_in` | reducer GraphFunction and input vector |
| `gateApplication` | `gate` | target, rule, and one or more evaluators |
| `reenterApplication` | `re_enter` | GraphFunction, distinct source and target loci, positive application bound |
| `promoteApplication` | `promote` | source and target contracts |
| `identityApplication` | `identity` | one target under equal input/output contracts |
| `sameObjectApplication` | `same_object` | the same opaque reference on both sides |

Every application also carries exact input and output contract references.

#### Composition

```ts
const composition = composeApplication({
  inputContractRef:
    "contract://example.local/text/raw@5",
  outputContractRef:
    "contract://example.local/text/rendered@5",
  leftGraphFunctionRef:
    "graph-function://example.local/text/normalize@5",
  rightGraphFunctionRef:
    "graph-function://example.local/text/render@5",
});
```

`composeGraphFunctions` is also exported to construct a new GraphFunction from
two compatible GraphFunctions. The application records the relation; the
resulting GraphFunction still owns a complete graph template.

#### Substitution

```ts
const substitution = substituteApplication({
  inputContractRef:
    "contract://example.local/document/input@5",
  outputContractRef:
    "contract://example.local/document/output@5",
  outerGraphFunctionRef:
    "graph-function://example.local/document/process@5",
  targetVectorRef:
    "vector://example.local/document/body@5",
  innerGraphFunctionRef:
    "graph-function://example.local/text/normalize@5",
});
```

Substitution replaces the declared interior at one vector coordinate while
preserving the outer GraphFunction contract and topology law.

#### Recursion

```ts
const recursion = recurseApplication({
  inputContractRef:
    "contract://example.local/count/state@5",
  outputContractRef:
    "contract://example.local/count/state@5",
  graphFunctionRef:
    "graph-function://example.local/count/down@5",
  terminationRuleRef:
    "rule://example.local/count/terminal@5",
  terminationEvaluatorRefs: [
    "evaluator://example.local/count/terminal@5",
  ],
  terminationFieldRef: "$.terminal",
  foldback: {
    mode: "rebind",
    binding: "binding://example.local/count/foldback@5",
    requiresParentEvaluation: true,
  },
  bound: 8,
});
```

The termination field is a declared JSON field path whose value must resolve
to Boolean. Recursion creates child GraphFunction applications with lineage,
foldback, and parent re-evaluation. Reaching an implementation result is not
by itself the termination decision.

#### Fan-out and fan-in

```ts
const fanOut = fanOutApplication({
  inputContractRef:
    "contract://example.local/items/input-vector@5",
  outputContractRef:
    "contract://example.local/items/output-vector@5",
  batchRef: "batch://example.local/items/process@5",
  elementGraphFunctionRef:
    "graph-function://example.local/item/process@5",
  inputVectorRef:
    "contract://example.local/items/input-vector@5",
  outputVectorRef:
    "contract://example.local/items/output-vector@5",
  inputMemberContractRef:
    "contract://example.local/item/input@5",
  outputMemberContractRef:
    "contract://example.local/item/output@5",
});

const fanIn = fanInApplication({
  inputContractRef:
    "contract://example.local/items/output-vector@5",
  outputContractRef:
    "contract://example.local/items/summary@5",
  reducerGraphFunctionRef:
    "graph-function://example.local/items/summarize@5",
  inputVectorRef:
    "contract://example.local/items/output-vector@5",
});
```

The outer fan-out contracts must be the declared vector contracts. Fan-in
consumes the exact output vector and must not reduce a partial or mismatched
vector as if it were complete.

#### Gate

```ts
const gate = gateApplication({
  inputContractRef:
    "contract://example.local/request/admitted@5",
  outputContractRef:
    "contract://example.local/result@5",
  targetRef:
    "graph-function://example.local/request/process@5",
  ruleRef: "rule://example.local/request/allowed@5",
  evaluatorRefs: [
    "evaluator://example.local/request/allowed@5",
  ],
});
```

A gate uses published rule data and evaluator declarations. The validator binds
the exact target, contracts, rule, and evaluator membership. A local
`if` statement outside the declared graph is not the same language relation.

#### Re-entry

```ts
const reentry = reenterApplication({
  inputContractRef:
    "contract://example.local/process/selection@5",
  outputContractRef:
    "contract://example.local/process/result@5",
  graphFunctionRef:
    "graph-function://example.local/process/run@5",
  sourceProgramLocusRef:
    "locus://example.local/process/select@5",
  targetProgramLocusRef:
    "locus://example.local/process/apply@5",
  maxApplications: 1,
});
```

Source and target loci must differ. ABG admits the selected route and preserves
the replay-derived basis; HoG applies the admitted re-entry to the original
Program.

#### Promotion, identity, and same-object

```ts
const promotion = promoteApplication({
  inputContractRef:
    "contract://example.local/candidate@5",
  outputContractRef:
    "contract://example.local/admitted@5",
  sourceRef:
    "contract://example.local/candidate@5",
  targetRef:
    "contract://example.local/admitted@5",
});

const identity = identityApplication({
  inputContractRef:
    "contract://example.local/value@5",
  outputContractRef:
    "contract://example.local/value@5",
  targetRef: "contract://example.local/value@5",
});

const sameObject = sameObjectApplication({
  inputContractRef:
    "contract://example.local/value@5",
  outputContractRef:
    "contract://example.local/value@5",
  leftRef: "object://example.local/exact-value",
  rightRef: "object://example.local/exact-value",
});
```

Promotion requires its source and target to equal the outer contracts.
Identity preserves one exact interface. Same-object requires identical opaque
references and derives a canonical witness.

### 4.7 GraphFunction

The callable declaration is:

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

`name` is the GraphFunction reference. Inputs, outputs, environment, effects,
declarations, and graph carriers must agree. Common `declarations` bind the
compute regime, closure, evidence, judgment, predicate, and transition
contracts:

```ts
const renderText: GraphFunction = {
  kind: "graph_function",
  name: "graph-function://example.local/text/render@5",
  version: "5.0.0",
  environment: {
    requires: [input.ref],
    provides: [output.ref],
    carries: [input.ref, output.ref],
  },
  inputs: [input.ref],
  outputs: [output.ref],
  template: {
    kind: "inline_graph",
    graphRef: "graph://example.local/text/render@5",
    startNodeRef: "node://example.local/text/render@5",
    terminalNodeRefs: [
      "node://example.local/text/render@5",
    ],
    nodes: [{
      nodeRef: "node://example.local/text/render@5",
      nodeKind: "c_locus",
      term: render,
    }],
    edges: [],
    applications: [],
  },
  effects: ["effect://example.local/text/emit-result@5"],
  declarations: {
    "abg.compute_regime": "F_D",
    "abg.closure_contract":
      "contract://example.local/text/closure@5",
    "abg.evidence_contract":
      "contract://example.local/text/evidence@5",
    "abg.judgment_contract":
      "contract://example.local/text/judgment@5",
    "abg.judgment_predicate":
      "predicate://example.local/text/rendered@5",
    "abg.transition_contract":
      "contract://example.local/text/transition@5",
  },
  tags: ["example", "text"],
};
```

The GraphFunction template remains constructive even when a leaf is realized
by packaged native code. An `implementationRef` without the GraphFunction and
graph is not callable.

### 4.8 Program

```ts
interface GtlProgram {
  readonly kind: "gtl_program";
  readonly programRef: string;
  readonly version: "5.0.0";
  readonly moduleRef: string;
  readonly starts: readonly {
    readonly startRef: string;
    readonly graphFunctionRef: string;
  }[];
  readonly callableMembership: readonly string[];
  readonly closureContractRef: string;
  readonly policies: Readonly<Record<string, string>>;
  readonly publicAssetTargets?: readonly ProgramPublicAssetTarget[];
  readonly actionCatalog?: GtlActionCatalog;
  readonly constructionComposition?: GtlConstructionComposition;
}
```

A minimal direct Program is:

```ts
const textProgram: GtlProgram = {
  kind: "gtl_program",
  programRef: "program://example.local/text/render@5",
  version: "5.0.0",
  moduleRef: "module://example.local/text@5",
  starts: [{
    startRef: "start://example.local/text/render@5",
    graphFunctionRef:
      "graph-function://example.local/text/render@5",
  }],
  callableMembership: [
    "graph-function://example.local/text/render@5",
  ],
  closureContractRef:
    "contract://example.local/text/closure@5",
  policies: {
    "abg.root_mode": "direct",
    "abg.compute_regime": "F_D",
    "abg.default_start_ref":
      "start://example.local/text/render@5",
  },
};
```

Program membership is execution authority: a published GraphFunction absent
from `callableMembership` cannot be invoked under that Program. A start must
resolve to a member GraphFunction. A public asset target maps a human-facing
handle to an asset and its owning start; the asset itself remains non-callable.

The optional public asset declaration is:

```ts
interface ProgramPublicAssetTarget {
  readonly kind: "program_public_asset_target";
  readonly handle: string;
  readonly assetRef: string;
  readonly startRef: string;
}
```

`actionCatalog` and `constructionComposition` are optional Product
declarations for a governed outcome-oriented Program. They bind named actions,
target loci, obligations, expected deltas, stop conditions, the four semantic
construction authorities, the interaction locus, and the evidence-refresh
closure policy. Public code reads these declarations; it does not recreate
their ordering.

Their current authored shapes are:

```ts
interface GtlActionCatalogRow {
  readonly kind: "action_catalog_row";
  readonly actionRef: string;
  readonly actionKind: string;
  readonly programRef: string;
  readonly graphFunctionRef: string;
  readonly targetProgramLocusRef: string;
  readonly targetObligationRefs: readonly string[];
  readonly inputAssetRefs: readonly string[];
  readonly outputAssetRefs: readonly string[];
  readonly expectedDeltaRef: string;
  readonly progressConditionRef: string;
  readonly stopConditionRef: string;
}

interface GtlActionCatalog {
  readonly kind: "action_catalog";
  readonly schemaVersion: "5.0.0";
  readonly catalogRef: string;
  readonly catalogDigest: `sha256:${string}`;
  readonly rows: readonly GtlActionCatalogRow[];
}

type GtlConstructionSemanticAuthority =
  | "synthesizeModel"
  | "evalGap"
  | "evaluateNext"
  | "evaluateAction";

interface GtlConstructionAuthorityBinding {
  readonly kind: "construction_authority_binding";
  readonly semanticAuthority:
    GtlConstructionSemanticAuthority;
  readonly authorityRef: string;
  readonly initialProgramLocusRef: string;
  readonly refreshProgramLocusRef: string | null;
}

interface GtlConstructionComposition {
  readonly kind: "construction_composition";
  readonly schemaVersion: "5.0.0";
  readonly compositionRef: string;
  readonly compositionDigest: `sha256:${string}`;
  readonly graphFunctionRef: string;
  readonly authorities: readonly [
    GtlConstructionAuthorityBinding,
    GtlConstructionAuthorityBinding,
    GtlConstructionAuthorityBinding,
    GtlConstructionAuthorityBinding,
  ];
  readonly interactionProgramLocusRef: string;
  readonly closurePolicy: {
    readonly kind: "construction_policy";
    readonly policyRef: string;
    readonly requireCompleteEvidence: boolean;
    readonly requirePostEvidenceRefresh: boolean;
  };
}
```

The action-catalog digest and construction-composition digest are canonical
content digests. The four authority rows must bind the four distinct semantic
authorities exactly; descriptive stage labels do not replace those bindings.

### 4.9 Evaluators and rules

Evaluators name a typed judging capability:

```ts
import {
  evaluatorDeclaration,
  ruleDeclaration,
} from "@abiogenesis/typescript-tenant/gtl";

const allowedEvaluator = evaluatorDeclaration({
  name: "evaluator://example.local/request/allowed@5",
  regime: "F_D",
  description: "Checks the declared closed admission condition.",
  binding: "implementation://example.local/request/allowed@5",
  consumedFieldRefs: ["$.category"],
  tags: ["gate", "admission"],
});

const allowedRule = ruleDeclaration({
  name: "rule://example.local/request/allowed@5",
  kind: "category_allowlist",
  config: { allowed: ["public"] },
  tags: ["gate", "admission"],
});
```

Rules are immutable JSON policy data. Evaluators declare regime, implementation
binding, consumed fields, and tags. A gate references both by exact identity.
Neither is an untyped callback hidden in Public or HoG.

### 4.10 Closure contracts

A closure contract names the deterministic closure predicate and the exact
event suffix required for the selected scope:

```ts
const closure: ClosureContract = {
  kind: "closure_contract",
  closureContractRef:
    "contract://example.local/text/closure@5",
  predicateRef:
    "predicate://example.local/text/rendered@5",
  evidenceContractRef:
    "contract://example.local/text/evidence@5",
  resultContractRef:
    "contract://example.local/text/output@5",
  refusalContractRef:
    "contract://example.local/text/refusal@5",
  refusalValueKind: "text_refusal",
  judgmentContractRef:
    "contract://example.local/text/judgment@5",
  rejectionContractRef:
    "contract://example.local/text/refusal@5",
  transitionContractRef:
    "contract://example.local/text/transition@5",
  replayProjectionRef:
    "projection://example.local/text/replay@5",
  terminalKind: "completed",
  closureScope: "run",
  eventKindRefs: [
    "terminal_reached",
    "frame_closed",
    "graph_call_closed",
    "run_closed",
  ],
};
```

A child GraphFunction can use `closureScope: "graph_call"` with:

```text
terminal_reached -> frame_closed -> graph_call_closed
```

A root run uses:

```text
terminal_reached -> frame_closed -> graph_call_closed -> run_closed
```

The order and payloads are runtime truth admitted by ABG. A leaf return, file,
worker message, or CLI exit cannot independently assert closure.

### 4.11 Implementation bindings

`F_D` and `F_P` leaves resolve through immutable declarations:

```ts
const renderBinding: ImplementationBinding = {
  kind: "implementation_binding",
  bindingRef:
    "implementation-binding://example.local/text/render@5",
  implementationRef:
    "implementation://example.local/text/render@5",
  packageName: "@example.local/text-product",
  packageVersion: "5.0.0",
  modulePath: "build/implementation/text.js",
  namedSymbol: "renderText",
  computeRegime: "F_D",
  inputContractRef:
    "contract://example.local/text/input@5",
  outputContractRef:
    "contract://example.local/text/output@5",
  failureContractRef:
    "contract://example.local/text/failure@5",
  refusalContractRef:
    "contract://example.local/text/refusal@5",
};
```

The installed package must actually export the named symbol and a compatible
descriptor. Resolution binds the exact package, version, module, symbol,
compute regime, and contracts. Ambiguity or absence refuses; the SDK cannot
pick a nearby implementation.

An implementation realizes only the admitted leaf seam. It returns a candidate
success or failure value. It does not receive an event-writing port, choose the
next graph term, author replay, or close the run.

`F_H` has no implementation binding. It binds an actor capability and typed
interaction contracts.

### 4.12 Module publication

```ts
interface ModulePublication {
  readonly kind: "module_publication";
  readonly moduleRef: string;
  readonly moduleVersion: "5.0.0";
  readonly owningProductId: string;
  readonly artifactDigest: `sha256:${string}`;
  readonly productContentDigest: `sha256:${string}`;
  readonly productManifestDigest: `sha256:${string}`;
  readonly descriptorRef: string;
  readonly contributionManifestRef: string;
  readonly productSemanticsBinding: ProductSemanticsBinding;
  readonly contracts: readonly ContractDeclaration[];
  readonly evaluators: readonly EvaluatorDeclaration[];
  readonly rules: readonly RuleDeclaration[];
  readonly implementationBindings:
    readonly ImplementationBinding[];
  readonly closureContracts: readonly ClosureContract[];
  readonly programs: readonly GtlProgram[];
  readonly graphFunctions: readonly GraphFunction[];
  readonly contributions: readonly CatalogContribution[];
}
```

Artifact, Product-content, and manifest digests bind the publication to the
exact installed Product. The `productSemanticsBinding` addresses the
Product-owned input, interaction-response, leaf-semantics, judgment, and
public-result relations carried by that installed package. It prevents the
generic kernel from hard-coding a consumer's domain contracts.

```ts
interface ProductSemanticsBinding {
  readonly kind: "product_semantics_binding";
  readonly bindingRef: string;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly modulePath: string;
  readonly namedSymbol: string;
}
```

Catalog contributions have one of three kinds:

```ts
type CatalogContributionKind =
  | "graph_function"
  | "node_type"
  | "overlay";

interface CatalogContribution {
  readonly handle: string;
  readonly kind: CatalogContributionKind;
  readonly declarationOrContractRef: string;
  readonly owningProductId: string;
  readonly programMembershipRefs: readonly string[];
  readonly compatibilityRefs: readonly string[];
  readonly provenanceRefs: readonly string[];
}
```

Only `graph_function` is callable. `node_type` and `overlay` are non-callable
declarations that may be admitted through `catalog.apply`. A non-callable-only
module may publish zero Programs, GraphFunctions, or implementation bindings.
A callable row must resolve through an admitted Program, GraphFunction,
contracts, and implementation/interaction requirements.

### 4.13 Required 5.0 language breadth

The interfaces above describe the current exported `5.0.0-dev.286` carrier.
They are not the whole final 5.0 language obligation. Product requires the
following language families; the unfinished rows must remain visible until
the public contract represents them without a private or feature-specific
substitute.

| Product-required family | Current first-cut status |
|---|---|
| Graphs, nodes, and edges | Exported through `GraphTemplate`, `GtlNode`, `GtlEdge`, and graph materialization |
| Vectors, contexts, interfaces, and attributes | Meaning participates in contracts, loci, graph application, and traversal, but the final explicit public declaration family is not reconciled |
| GraphFunctions and modules | Exported through `GraphFunction` and `ModulePublication` |
| Roles, jobs, and operators | Leaf roles are explicit; the complete Product-level job and operator declaration surface is not reconciled |
| Contracts, evaluators, and rules | Exported and publication-owned |
| Composition, substitution, recursion, fan-out, fan-in, gates, promotion, identity, same-object, and bounded re-entry | Exported through graph structure and `GraphFunctionApplication` carriers |
| Compute composition and `F_D` / `F_P` / `F_H` regime declarations | Exported through the seven native C constructors and admitted requirements |
| Program starts, callable membership, policy, effects, results, and closure | Exported through `GtlProgram`, `ClosureContract`, and related declarations |
| Proof obligations | Required by Product and partially expressed through validators, closure contracts, and proof lanes; the final public declaration surface is not reconciled |
| Publication, compatibility, and provenance | Present in `ModulePublication` and `CatalogContribution`; final public-contract parity remains open |

Product also preserves nine consequence-route meanings. They are semantic
routes admitted against the current Program, not nine hidden HoG runners:

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

The corresponding Product-level runtime disposition vocabulary is:

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

These lists state required 5.0 meaning. They do not claim that every name is
already an exported TypeScript union or public operation. Where the current
carrier lacks an exact representation, that is a realization gap; it is not
permission to improvise a controller, alternate syntax, or undocumented
runtime state.

## 5. Validation

### 5.1 The three depths

| Depth | Input | Decision |
|---|---|---|
| TypeScript | Authored TypeScript values | Local types, generics, interfaces, discriminated unions, and constructor compatibility |
| Raw admission | Serialized or package-originated unknown values | Exact broad kind, canonical JSON representability, contract reference, and content digest |
| GTL validator | Complete admitted publication, Program, functions, contracts, bindings, and graph | Membership, references, carrier compatibility, topology, constructors, fibres, result cardinality, and whole-program law |

Environmental facts such as the exact installed Product, workspace, catalog
view, actor, capability, worker, tool, and execution basis are runtime
admission, not static validation.

### 5.2 Raw admission

```ts
import {
  rawAdmitValue,
} from "@abiogenesis/typescript-tenant/validator";

const admittedPublication = rawAdmitValue<ModulePublication>(
  unknownPublication,
  "module_publication",
  "contract://abiogenesis/gtl/module-publication@5",
);

if (admittedPublication.kind === "raw_admission_refusal") {
  console.error(admittedPublication.code);
  console.error(admittedPublication.message);
}
```

Supported raw subject kinds are:

```text
module_publication
catalog_contribution
gtl_program
graph_function
gtl_graph
c_program_term
contract_declaration
implementation_binding
closure_contract
invocation_input
public_operation_request
```

Raw admission canonicalizes and freezes the value and records its digest. It
does not prove whole-program correctness.

### 5.3 Publication validation

```ts
import {
  rawAdmitValue,
  validatePublication,
} from "@abiogenesis/typescript-tenant/validator";

const publicationAdmission = rawAdmitValue<ModulePublication>(
  publication,
  "module_publication",
  "contract://abiogenesis/gtl/module-publication@5",
);

if (publicationAdmission.kind !== "raw_admitted_value") {
  throw new Error(publicationAdmission.message);
}

const contributionAdmissions = publication.contributions.map((row) => {
  const admitted = rawAdmitValue<CatalogContribution>(
    row,
    "catalog_contribution",
    "contract://abiogenesis/gtl/catalog-contribution@5",
  );
  if (admitted.kind !== "raw_admitted_value") {
    throw new Error(admitted.message);
  }
  return admitted;
});

const publicationValidation = validatePublication(
  publicationAdmission,
  contributionAdmissions,
);

if (publicationValidation.kind !== "publication_validation") {
  console.error(publicationValidation.diagnostics);
}
```

Publication validation covers the contribution manifest, declaration shapes,
Product-semantics binding, ownership, program membership, compatibility, and
provenance. It does not create a catalog or runtime event.

### 5.4 Program validation

`validateProgram` requires separately raw-admitted members:

```ts
const admittedProgram = rawAdmitValue<GtlProgram>(
  program,
  "gtl_program",
  "contract://abiogenesis/gtl/program@5",
);

const admittedFunctions = publication.graphFunctions.map((value) =>
  rawAdmitValue<GraphFunction>(
    value,
    "graph_function",
    "contract://abiogenesis/gtl/graph-function@5",
  ),
);

const admittedContracts = publication.contracts.map((value) =>
  rawAdmitValue<ContractDeclaration>(
    value,
    "contract_declaration",
    value.contractRef,
  ),
);

const admittedBindings = publication.implementationBindings.map((value) =>
  rawAdmitValue<ImplementationBinding>(
    value,
    "implementation_binding",
    "contract://abiogenesis/gtl/implementation-binding@5",
  ),
);

const admittedClosures = publication.closureContracts.map((value) =>
  rawAdmitValue<ClosureContract>(
    value,
    "closure_contract",
    value.closureContractRef,
  ),
);
```

After checking that each result is `raw_admitted_value`, call:

```ts
const programValidation = validateProgram({
  publication: publicationAdmission,
  program: admittedProgram,
  graphFunctions: admittedFunctions,
  contracts: admittedContracts,
  implementationBindings: admittedBindings,
  closureContracts: admittedClosures,
});
```

A successful `ProgramValidation` identifies the exact publication and Program
digests, reachable GraphFunctions, contracts, implementation bindings, closure
contracts, executable leaves, interaction leaves, and transitive requirement
keys. It contains no executable Program or lowered topology.

Static refusals report one or more diagnostics with these current codes:

```text
duplicate_identity
carrier_mismatch
identity_mismatch
invalid_application
invalid_constructor
invalid_contribution
invalid_fibre
invalid_leaf_requirement
invalid_reference
invalid_result_cardinality
missing_binding
missing_contract
missing_membership
raw_subject_mismatch
topology_mismatch
```

### 5.5 Materialization and graph validation

GraphFunction materialization binds the admitted invocation and input:

```ts
import {
  materializeGraph,
} from "@abiogenesis/typescript-tenant/gtl";
import {
  validateGraph,
} from "@abiogenesis/typescript-tenant/validator";

const graph = materializeGraph(graphFunction, {
  invocationAdmissionRef,
  admittedInputRef,
  admittedInputDigest,
  admittedInput,
});

const graphValidation = validateGraph(
  graph,
  programValidation,
  graphFunction,
  {
    invocationAdmissionRef,
    admittedInputRef,
    admittedInputDigest,
    admittedInput,
  },
);
```

For fan-out, materialization expands the declared batch seed from the admitted
ordered member vector. Otherwise it preserves the authored template exactly.
Graph validation reproduces that shape from the same input basis and refuses a
forged function, topology, input, or invocation identity.

Normal application code does not need to manually build the runtime admission
sequence. The public `catalog.admit` and `run.invoke` operations perform the
owning validation and admission stages against one exact installed basis.

## 6. Catalog and publication

Catalog operation follows this sequence:

```text
verify exact Product artifact
  -> install the verified artifact
  -> bind one workspace to an exact Product set
  -> admit a ModulePublication
  -> narrow a CatalogView with an explicit allowlist
  -> apply a non-callable declaration or invoke a callable GraphFunction
```

Catalog presence is discoverability, not execution authority. Invocation still
requires:

- exact Product installation;
- exact workspace binding and resolved Product lock;
- admitted module and Program;
- selected catalog view;
- callable GraphFunction membership;
- input and output contracts;
- implementation or interaction requirements;
- actor and capability authority; and
- ABG execution admission.

An allowlist may lawfully select no callable rows. Attempting to invoke a row
outside the selected view refuses.

`catalog.apply` accepts `node_type` and `overlay` rows. A GraphFunction remains
callable through `run.invoke` and refuses if passed to `catalog.apply`.

## 7. The current public SDK

### 7.1 Request and outcome envelopes

Every public operation uses:

```ts
interface RootPublicInvocation {
  readonly kind: "public_invocation";
  readonly schemaVersion: "5.0.0";
  readonly operationId: RootPublicOperationId;
  readonly variant: string;
  readonly invocationRef: string;
  readonly eventTime: string;
  readonly correlationId: string;
  readonly payload: Readonly<Record<string, JsonValue>>;
}
```

`invocationRef` must be explicit and unique within the relevant transcript.
`eventTime` must be an ISO-parsable timestamp. `correlationId` groups causal
work without replacing the admitted runtime identities.

The response is a `PublicOutcome` carrying:

- operation and variant;
- request and optional runtime invocation identity;
- typed disposition and result;
- run, graph-call, frame, and C-call references where applicable;
- result, judgment, and contract references;
- replay and durable event-log identity;
- continuation state and authority when held; and
- projection authority when a completed or stopped run can be read later.

Current public dispositions are:

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

Do not reduce them to a Boolean success flag.

### 7.2 Applying operations in process

```ts
import {
  applyRootPublicInvocation,
  closeRootOperationContext,
  createRootOperationContext,
} from "@abiogenesis/typescript-tenant/public";

const context = createRootOperationContext();

try {
  for (const request of transcript) {
    const outcome = await applyRootPublicInvocation(context, request);
    console.log(JSON.stringify(outcome));
  }
} finally {
  closeRootOperationContext(context);
}
```

Use one context for an ordinary verify/install/bind/catalog/invoke transcript.
Durable run reads and continuation operations carry opaque authorities returned
by the preceding outcome; those authorities allow a later process to reopen
the exact event prefix.

The SDK caller owns request transport and request ordering. It does not own the
runtime transitions that each admitted request causes.

### 7.3 The ten current operations

| Operation | Current variants | Purpose |
|---|---|---|
| `abg.operation.product.verify` | `artifact` | Verify artifact, Product content, manifest, package, and Product identities |
| `abg.operation.product.install` | `verified_artifact` | Materialize and admit an exact verified Product |
| `abg.operation.workspace.bind` | `exact_product_set` | Bind one workspace, Product set, dependency lock, roots, and trusted actor authority |
| `abg.operation.catalog.admit` | `module_publication` | Raw-admit, validate, and admit a module publication |
| `abg.operation.catalog.apply` | `declaration` | Apply one admitted non-callable declaration from a selected view |
| `abg.operation.catalog.view` | `allowlist` | Narrow an admitted catalog |
| `abg.operation.run.invoke` | `direct`, `start` | Call a member GraphFunction directly or resolve one Product-declared Program start |
| `abg.operation.project.read` | `status`, `result`, `replay`, `lawful-actions`, `gaps` | Pure replay-derived projection |
| `abg.operation.interaction.respond` | `approve`, `answer_escalation` | Admit an exact Product-valid response to an open `F_H` continuation |
| `abg.operation.run.continue` | `current_intent` | Resume the same responded continuation |

These are the implemented operations at `5.0.0-dev.286`, not a claim that
public-contract reconciliation or S06 has closed.

## 8. Using `abg.cli`

### 8.1 Transport contract

The current CLI accepts exactly:

```bash
/absolute/path/to/cli-host/node_modules/.bin/abg.cli \
  --jsonl /absolute/path/to/requests.jsonl
```

The file contains one `RootPublicInvocation` JSON object per non-empty line.
The CLI creates one operation context, applies requests in order, and writes
one canonical `PublicOutcome` JSON object per line.

It refuses:

- any argument shape other than `--jsonl <file>`;
- an empty transcript;
- malformed JSON;
- an invalid public request envelope; and
- the first outcome whose disposition is neither `succeeded` nor `held`.

Transport or non-sunny outcomes set exit status 2. Read the typed output; do not
infer the cause from exit status alone.

### 8.2 Verify, install, bind, admit, view, and invoke

The current minimal transcript shape has six requests. It is a schema example,
not a copy-paste runnable Product proof: replace every placeholder with values
from the exact packed candidate, a complete authored `ModulePublication`, and
local paths.

```jsonl
{"kind":"public_invocation","schemaVersion":"5.0.0","operationId":"abg.operation.product.verify","variant":"artifact","invocationRef":"invocation://example/product-verify","eventTime":"2026-07-26T00:00:00.000Z","correlationId":"correlation://example/run-1","payload":{"artifactPath":"/absolute/path/to/package.tgz","artifactRef":"package.tgz","expectedArtifactDigest":"sha256:<artifact>","expectedManifestDigest":"sha256:<manifest>","expectedPackageName":"@abiogenesis/typescript-tenant","expectedPackageVersion":"5.0.0-dev.286","expectedProductContentDigest":"sha256:<product-content>","expectedProductId":"<product-id>"}}
{"kind":"public_invocation","schemaVersion":"5.0.0","operationId":"abg.operation.product.install","variant":"verified_artifact","invocationRef":"invocation://example/product-install","eventTime":"2026-07-26T00:00:00.000Z","correlationId":"correlation://example/run-1","payload":{"artifactPath":"/absolute/path/to/package.tgz","targetRoot":"/absolute/path/to/product-consumer","verifiedInvocationRef":"invocation://example/product-verify"}}
{"kind":"public_invocation","schemaVersion":"5.0.0","operationId":"abg.operation.workspace.bind","variant":"exact_product_set","invocationRef":"invocation://example/workspace-bind","eventTime":"2026-07-26T00:00:00.000Z","correlationId":"correlation://example/run-1","payload":{"authorityManifestRef":"manifest://example/workspace-authority","authorizedActorRef":"actor://example/trusted-developer","canonicalRoot":"/absolute/path/to/workspace","installInvocationRef":"invocation://example/product-install","roots":{"archiveRoot":"/absolute/path/to/workspace/.ai-workspace/archive","eventLogRoot":"/absolute/path/to/workspace/.ai-workspace/events","productRoot":"/absolute/path/to/product-consumer/node_modules/@abiogenesis/typescript-tenant","projectionRoot":"/absolute/path/to/workspace/.ai-workspace/projections","runtimeStateRoot":"/absolute/path/to/workspace/.ai-workspace/runtime","toolchainRoot":"/absolute/path/to/product-consumer"},"workspaceId":"workspace://example/run-1"}}
{"kind":"public_invocation","schemaVersion":"5.0.0","operationId":"abg.operation.catalog.admit","variant":"module_publication","invocationRef":"invocation://example/catalog-admit","eventTime":"2026-07-26T00:00:00.000Z","correlationId":"correlation://example/run-1","payload":{"publication":{"kind":"module_publication","moduleRef":"<complete-publication-object>"},"verifiedInvocationRef":"invocation://example/product-verify","workspaceBindingInvocationRef":"invocation://example/workspace-bind"}}
{"kind":"public_invocation","schemaVersion":"5.0.0","operationId":"abg.operation.catalog.view","variant":"allowlist","invocationRef":"invocation://example/catalog-view","eventTime":"2026-07-26T00:00:00.000Z","correlationId":"correlation://example/run-1","payload":{"allowlist":["graph-function://example.local/text/render@5"],"catalogInvocationRef":"invocation://example/catalog-admit"}}
{"kind":"public_invocation","schemaVersion":"5.0.0","operationId":"abg.operation.run.invoke","variant":"direct","invocationRef":"invocation://example/run-invoke","eventTime":"2026-07-26T00:00:00.000Z","correlationId":"correlation://example/run-1","payload":{"actorRef":"actor://example/trusted-developer","catalogViewInvocationRef":"invocation://example/catalog-view","eventLogPath":"/absolute/path/to/workspace/.ai-workspace/events/run-1.events.jsonl","graphFunctionRef":"graph-function://example.local/text/render@5","input":{"kind":"text_input","schemaVersion":"5.0.0","text":"Example"},"installInvocationRef":"invocation://example/product-install","programRef":"program://example.local/text/render@5","workspaceBindingInvocationRef":"invocation://example/workspace-bind"}}
```

The `publication` placeholder must be replaced by the complete
`ModulePublication`; the abbreviated object above is intentionally not valid.
Generate the JSONL with code rather than hand-editing digests.

`/absolute/path/to/product-consumer` is the separate Product installation
target introduced in section 3. It must be absent or empty before this
transcript starts. `/absolute/path/to/cli-host` contains the already installed
command used to execute the transcript; the two roots are deliberately
different.

The Product manifest supplies the expected artifact and Product identities.
The publication must bind those same exact identities. A mismatch refuses
before catalog admission.

### 8.3 Direct invocation versus Program start

`direct` names both the admitted Program and member GraphFunction:

```json
{
  "operationId": "abg.operation.run.invoke",
  "variant": "direct",
  "payload": {
    "installInvocationRef": "invocation://example/product-install",
    "workspaceBindingInvocationRef": "invocation://example/workspace-bind",
    "catalogViewInvocationRef": "invocation://example/catalog-view",
    "programRef": "program://example.local/text/render@5",
    "graphFunctionRef":
      "graph-function://example.local/text/render@5",
    "actorRef": "actor://example/trusted-developer",
    "input": {
      "kind": "text_input",
      "schemaVersion": "5.0.0",
      "text": "Example"
    },
    "eventLogPath":
      "/absolute/path/to/workspace/events/run.events.jsonl"
  }
}
```

`start` asks the Product to resolve a Program-owned start:

```json
{
  "operationId": "abg.operation.run.invoke",
  "variant": "start",
  "payload": {
    "installInvocationRef": "invocation://example/product-install",
    "workspaceBindingInvocationRef": "invocation://example/workspace-bind",
    "catalogViewInvocationRef": "invocation://example/catalog-view",
    "programRef": "program://example.local/text/render@5",
    "actorRef": "actor://example/trusted-developer",
    "scope": "program",
    "target": "next",
    "until": "converged",
    "rootMode": "direct",
    "input": {
      "kind": "text_input",
      "schemaVersion": "5.0.0",
      "text": "Example"
    },
    "eventLogPath":
      "/absolute/path/to/workspace/events/run.events.jsonl"
  }
}
```

Current direct start law is:

- `scope` is `program`;
- `until` is `converged`;
- `rootMode` is `direct`;
- target is `next` or `asset:<published-handle>`;
- `startRef` is omitted; and
- the Program resolves the default or asset-owning start.

A supervised Program uses `rootMode: "supervised"`, names its exact
`startRef`, and sets `target` to that same reference. Its Program policy must
also declare supervised root mode.

Optional `sourceProjectionAuthority` plus `sourceResultRef` bind a new start to
an exact prior public result. Optional `reentryAuthority` is accepted only for
the `start` variant and must be the exact authority returned by a prior typed
gap.

### 8.4 Applying a non-callable catalog row

```json
{
  "kind": "public_invocation",
  "schemaVersion": "5.0.0",
  "operationId": "abg.operation.catalog.apply",
  "variant": "declaration",
  "invocationRef": "invocation://example/catalog-apply",
  "eventTime": "2026-07-26T00:00:00.000Z",
  "correlationId": "correlation://example/catalog",
  "payload": {
    "catalogViewInvocationRef":
      "invocation://example/catalog-view",
    "handle": "overlay://example.local/text/policy@5"
  }
}
```

The handle must select one admitted `node_type` or `overlay` row in the view.
Calling `catalog.apply` with a GraphFunction handle refuses.

## 9. Reading a run

### 9.1 Projection authority

A terminal, stopped, or held outcome returns an opaque authority object:

- `projectionAuthority` for a run projection;
- `continuationAuthority` for an open or responded `F_H` continuation; or
- `gapAuthority` inside a gap projection for bounded public re-entry.

Persist the whole returned object exactly. Do not reconstruct, edit, summarize,
or extract a path from it. Its digest binds the installed Product, workspace,
catalog, Program, graph, run, durable event prefix, and relevant continuation
or result identity.

### 9.2 Status, result, and replay

For a completed run:

```json
{
  "kind": "public_invocation",
  "schemaVersion": "5.0.0",
  "operationId": "abg.operation.project.read",
  "variant": "status",
  "invocationRef": "invocation://example/read-status",
  "eventTime": "2026-07-26T00:00:01.000Z",
  "correlationId": "correlation://example/run-1",
  "payload": {
    "projectionAuthority": "<exact object from prior outcome>",
    "targetRef": "run://abiogenesis/<exact-run>"
  }
}
```

Use variant:

- `status` with the run or graph-call reference;
- `result` with the run, graph-call, or subordinate admitted result reference;
  or
- `replay` with the run or graph-call reference.

`project.read` is pure. It reopens the exact durable prefix, folds replay,
checks the event-log digest, and returns a fresh opaque projection authority.
It must not append or change events.

The result projection is available only when replay proves a judged admitted
result and closed scope. Product-owned semantics project the admitted result
to its public value; a caller cannot substitute a nearby result object.

### 9.3 Reading a continuation

For a held `F_H` boundary, use `continuationAuthority` and
`continuationRef`:

```json
{
  "kind": "public_invocation",
  "schemaVersion": "5.0.0",
  "operationId": "abg.operation.project.read",
  "variant": "status",
  "invocationRef": "invocation://example/read-hold",
  "eventTime": "2026-07-26T00:00:01.000Z",
  "correlationId": "correlation://example/run-1",
  "payload": {
    "continuationAuthority":
      "<exact object from held outcome>",
    "continuationRef":
      "continuation://abiogenesis/<exact-continuation>"
  }
}
```

`lawful-actions` uses the same payload and projects admitted next-action
evidence. `result` becomes available only after the continuation is resolved
and the run closes. `replay` returns the continuation's causal event history.

### 9.4 Reading a gap

Variant `gaps` uses:

```json
{
  "operationId": "abg.operation.project.read",
  "variant": "gaps",
  "payload": {
    "gapAuthority": "<exact gap authority>",
    "gapRef": "gap://abiogenesis/<exact-gap>"
  }
}
```

The projection reports `construction_stalled` or `reprice_required` together
with its replay-derived next-action projection. It does not select new work.
A later `run.invoke` start may carry the updated `reentryAuthority` only when
the Product admits the same environment and start relation.

## 10. Human response and continuation

An `F_H` call does not return a fabricated success. It produces a typed `held`
outcome and an open continuation.

The lifecycle is:

```text
run.invoke
  -> held PublicOutcome
  -> project.read status or lawful-actions
  -> interaction.respond with exact actor, capability, and response
  -> responded continuation
  -> run.continue current_intent
  -> HoG resumes from the preserved cursor
  -> result, another hold, gap, block, or failure
```

### 10.1 Respond

```json
{
  "kind": "public_invocation",
  "schemaVersion": "5.0.0",
  "operationId": "abg.operation.interaction.respond",
  "variant": "approve",
  "invocationRef": "invocation://example/respond",
  "eventTime": "2026-07-26T00:00:02.000Z",
  "correlationId": "correlation://example/run-1",
  "payload": {
    "actorRef": "actor://example/approver",
    "capabilityRef":
      "capability://example.local/approval/respond@5",
    "continuationAuthority":
      "<exact object from the latest continuation outcome>",
    "continuationRef":
      "continuation://abiogenesis/<exact-continuation>",
    "response": {
      "kind": "approval_response",
      "schemaVersion": "5.0.0",
      "accepted": true
    }
  }
}
```

The response object is Product-specific. The pending interaction's declared
response contract, Product semantics, actor, and capability must all agree.
The current variants are `approve` and `answer_escalation`. An escalation
response may additionally select only its Product-declared correction
disposition.

An invalid, contradictory, forged, unattributed, or wrong-capability response
refuses and returns refreshed continuation authority over the unchanged or
failure-extended durable prefix.

### 10.2 Continue

Use the updated authority returned by `interaction.respond`:

```json
{
  "kind": "public_invocation",
  "schemaVersion": "5.0.0",
  "operationId": "abg.operation.run.continue",
  "variant": "current_intent",
  "invocationRef": "invocation://example/continue",
  "eventTime": "2026-07-26T00:00:03.000Z",
  "correlationId": "correlation://example/run-1",
  "payload": {
    "actorRef": "actor://example/approver",
    "capabilityRef":
      "capability://example.local/approval/respond@5",
    "continuationAuthority":
      "<exact object returned by interaction.respond>",
    "continuationRef":
      "continuation://abiogenesis/<exact-continuation>"
  }
}
```

Continuation rehydrates the exact invocation, execution basis, graph, held HoG
cursor, admitted response, and event-store prefix. It does not restart the
Program, invent a process-local fallback, or trust a caller-supplied next
cursor.

## 11. Probabilistic work

An `F_P` leaf is ordinary `C.of` syntax with:

- `fibre: "F_P"`;
- an executable requirement;
- an `F_P` implementation binding;
- declared instruction and result contracts;
- exact worker actor and binding identity;
- capability and transport-lane authority; and
- Product-owned result validation and judgment.

The worker receives a stateless projection of admitted instructions, contracts,
and context. Prompt text is not GTL source or runtime authority.

ABG owns process supervision and runtime facts. A worker response remains
candidate material until admission proves:

- valid transport and termination;
- exact attribution;
- exact result contract;
- complete required fields;
- no undeclared extra fields;
- no malformed JSON;
- no contradiction with the admitted basis; and
- the Product-owned judgment relation.

Malformed, contradictory, unattributed, or extra-field output becomes a typed
refusal or contract failure. It cannot emit a result event, select
continuation, or close the run.

Timeouts, retries, and worker process facts are ABG evidence. `C.retry` supplies
the declared attempt budget; a worker or SDK does not own an independent retry
loop.

## 12. Replay and event interpretation

### 12.1 Runtime truth

ABG events are admitted facts with:

- event identity and kind;
- admission ordinal;
- timestamp and correlation;
- causation references;
- run, graph-call, frame, attempt, C-call, and continuation scope as
  applicable;
- exact basis and payload digests; and
- Product, actor, worker, result, evidence, judgment, or route identity as
  applicable.

A process log, stdout line, file write, test assertion, or implementation return
is not automatically an ABG event.

### 12.2 The ordinary C-call spine

A successfully judged leaf normally contributes:

```text
c_call_opened
  -> c_call_fibre_selected
  -> c_call_evidenced
  -> c_call_result_admitted
  -> c_call_judged
  -> traversal_route_admitted
```

The exact spine can include typed refusal, failure, retry, child traversal,
hold, re-entry, gap, or correction facts instead. Closure follows only when
the declared closure predicate and evidence are admitted:

```text
terminal_reached
  -> frame_closed
  -> graph_call_closed
  -> run_closed
```

### 12.3 Replay

Replay folds admitted events in admission-ordinal order. Repeating replay over
the same exact event prefix must produce the same replay digest and state.

Public projections derive from replay:

- runtime status;
- result and contract;
- evidence and judgment;
- retries and attempts;
- parent/child traversal;
- selected route;
- open, responded, or resolved continuation;
- gap, block, correction, and escalation;
- closure; and
- next lawful action where the Product declares one.

Callers should treat event and projection references as opaque. Compare exact
identity and digest; do not parse business meaning from reference spelling.

### 12.4 Durable reopen

The current public path can persist an event log and return an opaque reopen
authority. A later read, response, or continuation:

1. validates that authority;
2. reopens the exact serialized history;
3. preserves ordinals and causation;
4. refuses a mismatched or altered prefix; and
5. returns a refreshed authority when it closes the local handle.

Append ownership is exclusive. An abandoned lock fails closed and requires
explicit operator recovery; the runtime does not silently steal it.

## 13. Failures, refusals, and stops

### 13.1 Public request refusal

A malformed public envelope produces `public_invocation_refusal` with:

```text
duplicate_invocation
invalid_request
missing_prerequisite
owner_refusal
target_mismatch
```

Examples include:

- duplicate `invocationRef`;
- wrong variant or undeclared payload field;
- missing prior verify/install/bind/catalog invocation;
- mismatched Product, workspace, catalog, or Program basis;
- absent callable membership;
- wrong continuation or result target; and
- failure of the owning validator, Product, HoG, or ABG boundary.

### 13.2 Static validation refusal

Static invalidity returns `static_validation_refusal`, its stage, subject
digest, and diagnostics. It has no runtime effect. Do not retry it as if it
were an `F_P` transport failure; repair the declaration or re-enter Product
meaning where necessary.

### 13.3 Runtime failure

Runtime failure is an admitted fact associated with the exact active scope.
Replay exposes it. A post-admission exception must not escape as an
unrecorded direct error while leaving the run falsely active.

### 13.4 Typed nonterminal outcomes

These are not interchangeable:

| Outcome | Meaning |
|---|---|
| `held` | An exact `F_H` response is required |
| `gap_stop` | The Program has declared unresolved pressure with no admitted current action |
| `blocked` | A declared hard condition prevents lawful advance |
| `repair` | The admitted route requires bounded repair |
| `inspect_runtime_archive` | The admitted next action is read-only runtime inspection |
| `reprice` / `reprice_required` | Current Product/work basis cannot lawfully continue without upstream authority |
| `escalate` | The admitted policy routes unresolved authority outward |
| `failed` | Runtime failure truth was admitted |
| `refused` | The proposed request, basis, result, transition, or closure was not admitted |

The nearest lower-priority retry must not overwrite a hold, block, gap,
reprice, escalation, or re-entry disposition.

## 14. Complete authored-language checklist

Before treating a GTL module as complete, check:

### Module and publication

- exact module, version, owning Product, artifact, content, and manifest
  identities;
- one installed Product-semantics binding;
- complete contracts, evaluators, rules, bindings, closures, Programs,
  GraphFunctions, and contributions;
- exact compatibility and provenance references; and
- no contribution referring to an undeclared member.

### Program

- at least one lawful declared start where the Program is executable;
- every start target belongs to `callableMembership`;
- every callable belongs to the same admitted publication;
- one closure contract;
- explicit policies with no conflicting or hidden default;
- explicit public asset ownership where asset targets are exposed; and
- action/construction declarations where the Product uses governed
  outcome-oriented traversal.

### GraphFunction and graph

- exact input, output, environment, effect, and declaration agreement;
- one replayable graph template;
- resolvable start and terminal nodes;
- unique node identities and canonical edges;
- valid carrier flow;
- declared applications with exact contracts and referenced functions;
- constructive graph body even when leaves use native implementation; and
- no implementation-only callable.

### C algebra

- only native `C` and `workflow.C` constructors;
- every `C.of` has a locus, role, fibre, arm, vector index, predicate, result
  cardinality, and regime-compatible requirement;
- `C.compose` adjacent carriers agree;
- `C.edge` roles and carriers agree;
- `workflow.C` names a Program-member GraphFunction;
- `C.batch` members share carrier pair and cardinality;
- `C.retry` has a positive bounded budget; and
- result-bearing cardinality is explicit.

### Compute and authority

- every closed total mechanical leaf is `F_D`;
- every open semantic machine leaf is `F_P`;
- every attributed human decision is `F_H`;
- worker, actor, capability, tool, and transport requirements are exact;
- malformed, contradiction, attribution, evidence, failure, and refusal
  contracts are complete;
- no regime impersonates another; and
- no SDK, CLI, worker, fixture, or implementation owns traversal or events.

### Validation and runtime

- TypeScript passes;
- serialized values pass raw admission;
- publication and every executable Program pass static validation;
- graph materialization is reproducible from invocation and input;
- graph validation binds the same Program validation;
- environment admission binds one Product/workspace/catalog basis;
- implementation resolution is exact and unambiguous;
- ABG replay agrees on repeated folds; and
- public result or continuation is derived from replay.

## 15. What is provisional

The following distinctions are important for this documentation cut:

| Surface | Current status |
|---|---|
| Product destination and GTL/validator/HoG/ABG authority split | Accepted Product meaning |
| Direct GTL traversal, installed deterministic root, `F_P`, and S03 continuation basis | Implemented on the accepted S03 base |
| Current S05 Consensus construction | Present in the development candidate but provisional pending exact acceptance |
| S06 native/host projection and independent portability closure | Unselected or provisional; not a released claim |
| Observer/tuner, complete 4.6 conservation, qualification, RC, and stable release | Later work; not complete |
| Ten-operation public surface documented above | Exact currently exported implementation, pending final public-contract reconciliation |
| Complete neutral end-to-end example | Pending; the six-request JSONL is a schema example and the repository proof lane remains the executable witness |
| ABIogenesis `5.0.0` package and documentation | Not released |

Consensus, where present, is an ordinary GTL construction over the same
Program, graph, C, HoG, ABG, public, and replay atoms described above. It has
no special runner, scheduler, command, event family, result store,
continuation, or closure authority. This statement describes the Product
boundary; it is not an S05 acceptance receipt.

Do not infer release readiness from this guide, package version, test count, or
presence of provisional exports.

## 16. Source map

This guide was constructed from these deciding and explanatory surfaces:

| Subject | Source |
|---|---|
| Product identity, language, runtime, catalog, public, feature, scenario, and release meaning | `specification/PRODUCT.md` |
| Current selected Product outcome | `specification/GOALS.md` |
| Direction and authority split | `specification/INTENT.md` |
| GTL language requirements | `specification/requirements/gtl/` |
| GTL-to-HoG/ABG mapping | `specification/requirements/mapping/` |
| ABG runtime requirements | `specification/requirements/abg/` |
| Installed Product and public requirements | `specification/requirements/product/` |
| Accepted direct-traversal realization | `build_tenants/abiogenesis/typescript/design/M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md` |
| S03 accepted and S05/S06 provisional realization | `build_tenants/abiogenesis/typescript/design/M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md` |
| Current package/version/exports | `build_tenants/abiogenesis/typescript/package.json` |
| Authored GTL types | `build_tenants/abiogenesis/typescript/code/src/gtl/contracts.ts` |
| C constructors | `build_tenants/abiogenesis/typescript/code/src/gtl/c_algebra.ts` |
| Graph applications | `build_tenants/abiogenesis/typescript/code/src/gtl/graph_applications.ts` |
| Raw and static validation | `build_tenants/abiogenesis/typescript/code/src/validator/` |
| Current public envelope and operations | `build_tenants/abiogenesis/typescript/code/src/public/contracts.ts` and `operations.ts` |
| Exact CLI transport | `build_tenants/abiogenesis/typescript/code/src/public/cli.ts` |
| Installed-path examples and negatives | `build_tenants/abiogenesis/typescript/test_env/` |

When any source above changes materially, this provisional document must be
re-derived and its source snapshot updated. The stable documentation must bind
the same exact release subject as the ABIogenesis version it describes.
