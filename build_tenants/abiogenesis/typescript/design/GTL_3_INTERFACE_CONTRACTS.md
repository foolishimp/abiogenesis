# GTL 3 Interface Contracts

**Status**: Active
**Date**: 2026-04-23
**Derived from**: [GTL_3_CONSTITUTIONAL_DESIGN.md](../../../../specification/GTL_3_CONSTITUTIONAL_DESIGN.md), [README.md](../../../../specification/requirements/gtl/README.md), [TESTCASE_AUTHORITY.md](../../../../specification/scenarios/TESTCASE_AUTHORITY.md), [GTL_3_MODULE_DESIGN.md](./GTL_3_MODULE_DESIGN.md)

## Purpose

Define the concrete interface and serialization contracts that the TypeScript
GTL 3 implementation shall realize.

This surface is specific enough to derive tests and code edits without
inventing semantics.

## Governing Requirement Surfaces

- `REQ-L-GTL3-ATTRS`
- `REQ-L-GTL3-CONTEXT`
- `REQ-L-GTL3-GRAPHVECTOR`
- `REQ-L-GTL3-GRAPHFUNCTION`
- `REQ-L-GTL3-HOOKS`
- `REQ-L-GTL3-OPERATOR`
- `REQ-L-GTL3-EVALUATOR`
- `REQ-L-GTL3-RULE`
- `REQ-L-GTL3-ROLE`
- `REQ-L-GTL3-JOB`
- `REQ-L-GTL3-MODULE`
- `REQ-L-GTL3-IDENTITY`
- `REQ-L-GTL3-LAWS`

## Concrete Contracts

### Serialized Attrs And Context

- `SerializedAttrs` is the immutable ordered serialized metadata/config payload
  surface for GTL declaration publication and replay
- `Context` is language-owned declaration truth with `name`, `locator`, and
  `digest`
- `SerializedAttrs` is not the admitted semantic carrier used by consumers
  below ingress; consumers must admit it once through a named parser before
  reading declaration payload detail

First-wave TypeScript shape:

```ts
export type SerializedScalar = string | number | boolean | null;

export type SerializedJsonValue =
  | SerializedScalar
  | { readonly kind: "array"; readonly items: readonly SerializedJsonValue[] }
  | {
      readonly kind: "object";
      readonly entries: readonly {
        readonly key: string;
        readonly value: SerializedJsonValue;
      }[];
    };

export interface HookRef {
  readonly ref: string;
  readonly config: SerializedAttrs;
}

export type SerializedAttrValue =
  | { readonly kind: "scalar"; readonly value: SerializedScalar }
  | { readonly kind: "string_list"; readonly value: readonly string[] }
  | { readonly kind: "hook_ref"; readonly value: HookRef }
  | { readonly kind: "json_blob"; readonly value: SerializedJsonValue };

export interface SerializedAttrEntry {
  readonly key: string;
  readonly value: SerializedAttrValue;
}

export interface SerializedAttrs {
  readonly entries: readonly SerializedAttrEntry[];
}

export interface Context {
  readonly name: string;
  readonly locator: string;
  readonly digest: string;
}
```

### Node

`Node` remains the typed local locus within a graph.
The TypeScript line keeps node meaning as closed declaration data and preserves
schema, markov, and asset-surface truth without inventing runtime-only
surfaces.

First-wave TypeScript shape:

```ts
export type SchemaRef =
  | { readonly kind: "symbolic"; readonly ref: string }
  | { readonly kind: "runtime_ref"; readonly ref: string };

export interface AssetSurface {
  readonly kind: string;
  readonly requiredContexts: readonly string[];
  readonly standardsRefs: readonly string[];
  readonly outputContractRefs: readonly string[];
}

export interface Node {
  readonly name: string;
  readonly schema: SchemaRef;
  readonly markov: readonly string[];
  readonly assetSurface: AssetSurface;
  readonly tags: readonly string[];
  readonly id: string;
}
```

Contract truths:

- `Node.schema` preserves both symbolic and runtime-reference shape without
  semantic loss
- `markov` remains GTL declaration truth, not engine-owned metadata
- `assetSurface` remains GTL declaration truth and is preserved across
  serialization and replay
- nodes remain stable identity-bearing declarations
- canonical ingress admits only the declared `SchemaRef` and `AssetSurface`
  object shapes; missing node declaration surfaces fail closed rather than
  being synthesized from absence

### GraphVector

The GTL 3 TypeScript shape is a readonly structural carrier with explicit
serialized fields.

First-wave TypeScript shape:

```ts
export type Regime = "F_D" | "F_P" | "F_H";

export interface Operator {
  readonly name: string;
  readonly regime: Regime;
  readonly binding: string;
  readonly tags: readonly string[];
}

export interface Evaluator {
  readonly name: string;
  readonly regime: Regime;
  readonly description: string;
  readonly binding: string;
  readonly tags: readonly string[];
}

export interface Rule {
  readonly name: string;
  readonly kind: string;
  readonly config: SerializedAttrs;
  readonly tags: readonly string[];
}

export interface GraphVector {
  readonly id: string;
  readonly name: string;
  readonly source: readonly Node[];
  readonly target: Node;
  readonly operators: readonly Operator[];
  readonly evaluators: readonly Evaluator[];
  readonly contexts: readonly Context[];
  readonly rule: Rule | null;
  readonly allowsSubwork: boolean;
  readonly declarations: SerializedAttrs;
  readonly tags: readonly string[];
}
```

Contract truths:

- `Operator`, `Evaluator`, and `Rule` remain first-class GTL declarations in
  the TypeScript line and preserve regime, binding, description, kind, config,
  and tags as inspectable publication truth
- `declarations` is the canonical transition-governance publication carrier for invariant
  transition description, dispatch, evaluation, escalation, proof, closure,
  hook refs, and opaque config
- `source` remains an ordered node boundary; single-source vectors use a
  one-element array rather than a singular/plural union
- `operators`, `evaluators`, `rule`, and `allowsSubwork` remain direct local
  surfaces and are not removed by the richer declaration model
- `GraphVector` remains internal realized graph structure rather than the
  public callable work-entry carrier
- serialization and frame publication shall preserve `declarations`
- semantic consumers must admit `declarations`, `rule`, and nested hook config
  once before using them as semantic truth

### Graph

`Graph` remains the one first-class structural type.

First-wave TypeScript shape:

```ts
export interface Graph {
  readonly name: string;
  readonly inputs: readonly Node[];
  readonly outputs: readonly Node[];
  readonly nodes: readonly Node[];
  readonly vectors: readonly GraphVector[];
  readonly contexts: readonly Context[];
  readonly rules: readonly Rule[];
  readonly effects: readonly string[];
  readonly tags: readonly string[];
  readonly id: string;
}
```

Contract truths:

- `Graph` declares boundary interface, internal structure, local constraints,
  and declared effects
- `Graph` remains the structural unit of substitution and composition
- publication/replay shall preserve graph ids, interfaces, nodes, vectors, and
  carried declaration surfaces without semantic loss

### GraphFunction

- `GraphFunction` is the sole public named callable carrier of GTL 3
- `GraphFunction.declarations` is the canonical graph-function governance and
  publication declaration surface and uses the same serialized/admitted split as
  `GraphVector.declarations`
- hook attachment remains a stable hook reference plus opaque config, not raw
  callable injection as language truth
- semantic jobs bind published graph functions by identity and do not target
  bare internal vectors

First-wave TypeScript shape:

```ts
export interface EnvRef {
  readonly requires: readonly Node[];
  readonly provides: readonly Node[];
  readonly carries: readonly Node[];
}

export type TemplateRef =
  | {
      readonly kind: "inline_graph";
      readonly ref: string;
      readonly graph: Graph;
      readonly version: null;
    }
  | {
      readonly kind: "symbolic";
      readonly ref: string;
      readonly graph: null;
      readonly version: string | null;
    };

export interface GraphFunction {
  readonly name: string;
  readonly environment: EnvRef;
  readonly inputs: readonly Node[];
  readonly outputs: readonly Node[];
  readonly template: TemplateRef;
  readonly effects: readonly string[];
  readonly declarations: SerializedAttrs;
  readonly tags: readonly string[];
  readonly id: string;
}
```

Additional graph-function truths:

- `environment` is required and explicit; it is not reconstructed from helper
  code or ambient runtime state
- `template` is replayable publication truth; raw executable callables are not
  the published contract
- inline templates must preserve the declared outer `inputs` and `outputs`
  contract
- graph-function publication preserves identity and declaration truth without
  collapsing into anonymous realized graphs
- canonical ingress admits only the declared `TemplateRef` union shape; helper
  callables or arbitrary graph objects are not lawful parser input in this wave

### Role, Job, And Module

- `Role.policyHooks` is an external policy input surface
- semantic `Job` contracts bind published graph functions through
  `ContractRef(kind="graph_function", targetId=...)`
- a published graph function bound by a semantic job is a callable work-entry
  carrier, not a hidden structural alternative in selection validation
- `Module` publishes graphs, graph functions, refinement boundaries, candidate
  families, jobs, roles, operators, evaluators, rules, imports, and metadata

`M02-work-publication` TypeScript shape:

```ts
export interface ContractRef {
  readonly kind: "graph_function";
  readonly targetId: string;
}

export interface Role {
  readonly name: string;
  readonly tags: readonly string[];
  readonly policyHooks: SerializedAttrs;
  readonly id: string;
}

export interface Job {
  readonly name: string;
  readonly contracts: readonly ContractRef[];
  readonly roles: readonly Role[];
  readonly tags: readonly string[];
  readonly id: string;
}

export interface RefinementBoundary {
  readonly name: string;
  readonly inputs: readonly Node[];
  readonly outputs: readonly Node[];
  readonly hints: SerializedAttrs;
  readonly tags: readonly string[];
  readonly id: string;
}

export interface CandidateFamily {
  readonly name: string;
  readonly inputs: readonly Node[];
  readonly outputs: readonly Node[];
  readonly candidates: readonly GraphFunction[];
  readonly policyHints: SerializedAttrs;
  readonly tags: readonly string[];
  readonly id: string;
}

export interface ModuleImport {
  readonly source: string;
  readonly names: readonly string[];
  readonly version: string;
}

export interface Module {
  readonly name: string;
  readonly graphs: readonly Graph[];
  readonly graphFunctions: readonly GraphFunction[];
  readonly refinementBoundaries: readonly RefinementBoundary[];
  readonly candidateFamilies: readonly CandidateFamily[];
  readonly jobs: readonly Job[];
  readonly roles: readonly Role[];
  readonly operators: readonly Operator[];
  readonly evaluators: readonly Evaluator[];
  readonly rules: readonly Rule[];
  readonly imports: readonly ModuleImport[];
  readonly metadata: SerializedAttrs;
}
```

Additional M02 contract truths:

- `ContractRef.kind` is fixed to `"graph_function"` in this GTL line
- `ContractRef.targetId` targets the opaque id of one published graph function
- `Role.policyHooks` is the inspectable, replayable hook/config surface for
  approval, assignment, and related external policy concerns
- `Job` is durable semantic work and remains distinct from any run, worker, or
  executable-job runtime wrapper
- `Job.contracts` must reference only published graph-function ids
- `RefinementBoundary` and `CandidateFamily` remain explicit structural
  selection carriers; they do not embed hidden strategy
- `CandidateFamily.candidates` are published graph functions and all candidates
  preserve one explicit outer contract
- `Module` is the publication carrier and the discoverability boundary for
  graphs, graph functions, selection boundaries, jobs, roles, operators,
  evaluators, rules, imports, and metadata
- `Module.metadata` remains immutable publication truth visible to replay,
  policy resolution, and consumers
- package manifests, npm exports, and runtime loaders are delivery bindings
  only and must not become constitutional or semantic publication carriers

## Hook Attachment Contract

GTL 3 does not define a policy semantic language.

The hook attachment contract is:

- stable hook reference
- opaque configuration
- inspectable location on a GTL declaration surface

Lawful hook-bearing surfaces:

- `GraphFunction.declarations`
- `GraphVector.declarations`
- `Role.policyHooks`
- `CandidateFamily.policyHints`

Lawful hook concerns:

- dispatch
- evaluation
- escalation
- deterministic proof
- closure

## Replay And Serialization Contract

- graph publication and graph-function publication remain replayable
- graph-vector and graph-function declarations remain inspectable after
  serialization
- identity-bearing GTL types preserve opaque ids across publication and replay
- JSON or plain-object serialization remains an interchange format, not a
  license to trust open payloads past ingress
- serialized declaration payloads are admitted once by named parser surfaces
  before semantic consumers may inspect them
