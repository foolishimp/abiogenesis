# Strategy: Node Type Profiles For GTL

Status: strategy commentary, not ratified specification  
Date: 2026-06-30  
Author: Codex  
Project: Abiogenesis  
Scope: GTL node typing, context-bound type structure, algebraic composition, and traversal semantics

## Claim

GTL already has most of the substrate needed to say that a node is typed.

The missing concept is a reusable, published label for a node type's
conformance profile: a carrier that can bind a node schema/category to required
context references, asset-surface obligations, output contracts, proof
obligations, renderers, constructors, and lawful local refinements.

The proposed name is `NodeTypeProfile`.

`NodeTypeProfile` is the node-side symmetry to the existing function-side
publication story:

```text
Node             : NodeTypeProfile
graph-local use : reusable published node conformance profile

GraphVector      : internal typed transition boundary A -> B
GraphFunction    : reusable published graph program / workflow carrier
TraversalUnit    : ABG execution atom over admitted typed traversal truth
```

This should not replace `Node`, `AssetSurface`, `Context`, `GraphVector`, or
`GraphFunction`. It should make the reusable profile that binds them explicit.

## Problem

The current GTL type story is stronger than the current vocabulary makes clear.

When we say `A -> B` is typed in GTL, we do not mean only that the source and
target names are distinct. We mean:

- `A` and `B` are graph nodes with declared node contracts.
- Each node contract includes schema/category, Markov conditions, and optional
  asset-surface obligations.
- Context references can constrain the meaning of those nodes by locator and
  digest.
- The graph vector is lawful only when its endpoint contracts are compatible
  with the vector, evaluator, operator, and rule declarations.
- Composition is lawful only when intermediate endpoint contracts can be
  preserved, satisfied, or intentionally transformed through declared law.

The user-facing design need is more concrete than a generic schema label.

When defining a type in GTL, we need to be able to say:

- this review document type is shaped by this review template, rubric, posting
  guide, section model, and proof policy;
- this code type is shaped by this tech stack, coding guideline, package
  policy, runtime target, lint contract, test contract, and repository
  convention;
- these references are not floating prose; they are URI-located,
  snapshot-bound, digest-addressed constraints that participate in type
  conformance.

The current surfaces can encode much of this inline. What is missing is a
first-class reusable label for the collection.

## Current GTL Substrate

The current Abiogenesis GTL surface already points in this direction.

`Context` is a first-class GTL declaration. It carries at least:

```text
name
locator
digest
```

That makes a context an externally located, snapshot-bound constraint
dimension. It is not merely a tag.

`Node` is the typed local locus of graph meaning. In the TypeScript carrier it
currently includes:

```text
name
schema
markov
assetSurface
tags
id
```

`AssetSurface` is the typed asset interface subordinate to node/topology truth.
It can bind:

```text
kind
requiredContexts
standardsRefs
outputContractRefs
constructorRefs
constructorInputAssetKinds
rendererRefs
renderedViewDigestPolicyRef
sectionKindRefs
clauseKindRefs
authoritySlots
proofObligationRefs
```

This is already close to the desired type-profile mechanism. It means a node
can be more than `schema = "review_document"` or `schema =
"typescript_module"`. It can carry the contexts and obligations that make that
schema operationally meaningful.

`GraphVector` is the internal typed transition contract between nodes. In the
current language shape it carries source, target, operators, evaluators,
contexts, rule, subwork allowance, and declarations.

`GraphFunction` is the reusable published graph program / workflow abstraction.
It is the public constructive carrier for reusable graph execution. It is not
the same thing as `GraphVector`.

The current code-level `nodeContractKey` includes node `schema`, `markov`, and
`assetSurface`. That is important: it means the existing realization already
treats the asset-surface contract as part of node contract identity.

## Why `GraphVector` And `GraphFunction` Are Not Enough

`GraphVector` answers:

```text
What is the admissible transition from A to B inside a graph?
```

`GraphFunction` answers:

```text
What reusable graph program or workflow can be published and invoked?
```

Neither answers:

```text
What reusable type profile defines what A or B is?
```

A graph function can publish a reusable lifecycle program. A graph vector can
declare a typed internal edge. A node can declare an inline local type surface.
But none of those is the reusable node-type label itself.

That is the symmetry gap.

## Proposed Carrier

`NodeTypeProfile` should be a reusable published conformance profile for a GTL
node type.

It should bind:

- a stable profile identity;
- a node schema/category;
- optional Markov/default conditions;
- required `Context` refs by stable name or URI/digest reference;
- an `AssetSurface` shape or asset-surface constraints;
- required standards refs;
- output contract refs;
- proof obligation refs;
- constructor refs;
- renderer refs;
- section and clause kind refs where the node represents structured documents;
- authority slots where the node participates in constitutional or design
  truth;
- allowed local refinement rules.

Candidate shape:

```text
NodeTypeProfile {
  name
  schema
  markovDefaults
  requiredContexts
  assetSurface
  standardsRefs
  outputContractRefs
  proofObligationRefs
  constructorRefs
  rendererRefs
  allowedRefinements
  tags
  id
}
```

The exact field split should follow existing GTL carrier style. The strategic
point is the publication boundary: a profile is a named, reusable declaration
that can be applied to many nodes without hiding type law in prompt prose or
product-local parser conventions.

## What It Is Not

`NodeTypeProfile` should not be executable.

It is not:

- a `GraphFunction`;
- a `GraphVector`;
- an ABG runtime carrier;
- a traversal controller;
- a plugin wrapper;
- a renderer output;
- a second schema language;
- a prompt template by itself;
- a product-local convention outside GTL law.

It declares reusable endpoint conformance. Execution still belongs to graph
functions interpreted by ABG. Traversal truth still belongs to ABG runtime
events and projections. Rendered documents remain views and do not outrank the
typed declaration.

## Type Semantics

For a node `A` to be typed by profile `P`, one of two things should be true:

1. `A` binds directly to `P`, and the system materializes the node contract
   from the profile plus allowed local refinements.
2. `A` declares its node contract inline, and conformance checking proves that
   the inline contract satisfies `P`.

In either case, profile satisfaction must preserve:

- schema/category compatibility;
- Markov condition requirements;
- required context refs;
- required asset kind;
- required standards/output/proof refs;
- authority-slot obligations;
- constructor/renderer obligations where declared;
- digest stability for external context references.

This turns type identity into a structured contract rather than a bare string.

`schema` remains useful. It names the semantic class. `NodeTypeProfile` makes
the class operational by binding the external specification context and
asset/proof obligations that define satisfaction.

## `A -> B` Typed Boundary

A GTL edge from `A` to `B` is typed when:

- `A` has an admitted node contract;
- `B` has an admitted node contract;
- the graph vector source and target match those contracts;
- vector-level contexts/rules/evaluators/operators are compatible with the
  endpoint contracts;
- any profile obligations required by `A` and `B` are preserved or lawfully
  transformed;
- composition through this edge does not erase endpoint constraints.

So `A -> B` is not merely:

```text
source name -> target name
```

It is:

```text
contract(A) -> contract(B)
```

If `A` is a `ReviewDocument` profile and `B` is a
`TypescriptServiceModule` profile, the transition carries the declared review
document constraints into the code construction target. The code target cannot
satisfy the edge by producing generic code if the target profile requires a
specific TypeScript stack, coding standard, package surface, test regime, and
proof contract.

## Example: Review Document Profile

Illustrative shape:

```text
NodeTypeProfile ReviewDocument {
  schema: schema://review/document

  requiredContexts: [
    context://templates/review-document@sha256:...
    context://standards/review-rubric@sha256:...
    context://guides/reviewer-style@sha256:...
    context://standards/posting-guide@sha256:...
  ]

  assetSurface: {
    kind: review_document
    rendererRefs: [
      renderer://markdown/review-document
    ]
    sectionKindRefs: [
      section://findings
      section://evidence
      section://open-questions
      section://summary
    ]
    clauseKindRefs: [
      clause://severity
      clause://file-line-evidence
      clause://test-gap
    ]
    proofObligationRefs: [
      proof://finding-has-live-evidence
      proof://claim-separated-from-assumption
    ]
    outputContractRefs: [
      contract://review-post
    ]
  }
}
```

The type is not just "review document". It is a review document under a
particular template, rubric, evidence standard, and output contract.

## Example: TypeScript Code Profile

Illustrative shape:

```text
NodeTypeProfile TypescriptServiceModule {
  schema: schema://code/typescript/service-module

  requiredContexts: [
    context://tech-stack/node-typescript@sha256:...
    context://standards/typescript-strict@sha256:...
    context://repo/tsconfig@sha256:...
    context://repo/eslint-policy@sha256:...
    context://repo/package-policy@sha256:...
    context://runtime/node-target@sha256:...
  ]

  assetSurface: {
    kind: typescript_service_module
    constructorRefs: [
      constructor://typescript/module-file
    ]
    rendererRefs: [
      renderer://typescript/source-file
    ]
    outputContractRefs: [
      contract://build
      contract://lint
      contract://test
    ]
    proofObligationRefs: [
      proof://compiles
      proof://exports-match-public-contract
      proof://tests-cover-declared-behavior
    ]
  }
}
```

This prevents a loose `Code` node from satisfying a stricter target such as
`TypescriptServiceModule`. The profile says what context makes the code type
real in this product line.

## Example Use In Graph Algebra

Illustrative graph-level use:

```text
Node review : NodeTypeProfile.ReviewDocument
Node service_module : NodeTypeProfile.TypescriptServiceModule

GraphVector review_to_service_module:
  ReviewDocument -> TypescriptServiceModule

GraphFunction implement_reviewed_module:
  template: review_to_service_module

TraversalUnit<ReviewDocument, TypescriptServiceModule>
```

The graph vector is internal transition law. The graph function is the reusable
published program. The traversal unit is the ABG execution atom over admitted
truth. The node type profiles define the endpoint contracts that make the
composition meaningful.

## Traversal Monad Fit

The traversal monad belongs at the ABG execution layer, not as a replacement
for GTL type declaration.

The clean layering is:

```text
NodeTypeProfile
  reusable endpoint conformance profile

Node
  graph-local locus applying or satisfying the profile

GraphVector<A, B>
  internal typed transition boundary

GraphFunction
  reusable published graph program over typed boundaries

TraversalUnit<A, B>
  ABG closeable unit of probabilistic/deterministic/human traversal truth

bind
  lawful continuation where ABG admits output, derives transition truth,
  preserves obligations, and replays continuation under event-sourced law
```

This keeps the monadic insight intact. The bind boundary is where output from
one traversal becomes lawful input to the next. `NodeTypeProfile` strengthens
the endpoint contracts that bind must preserve.

If `TraversalUnit<A, B>` closes with an output that claims to be `B`, ABG
should not treat that as a string match. It should admit or reject the output
against the realized `B` node contract, including any profile-derived context,
asset, output, and proof obligations.

## Composition Consequence

Typed composition becomes profile-sensitive.

This matters for algebraic composition because the type at the intermediate
node is the only lawful handoff between composed vectors:

```text
GraphVector<A, B> compose GraphVector<B, C>
```

The `B` on both sides must be compatible as a contract, not merely as a name.

Profile-sensitive composition should therefore check:

- same profile identity, or declared profile compatibility;
- same schema/category, or declared lawful refinement;
- all required contexts preserved or lawfully superseded;
- asset-surface obligations preserved or lawfully transformed;
- output/proof obligations not dropped;
- authority slots not weakened;
- digest changes admitted only through declared re-entry or versioning law.

This is where the proposed profile becomes operationally important. It gives
the algebra a reusable contract object to compare, materialize, and project.

## Publication Boundary

`NodeTypeProfile` should be published by the GTL module or by a module-owned
profile catalog.

Candidate publication placement:

```text
Module {
  graphs
  graphFunctions
  refinementBoundaries
  candidateFamilies
  jobs
  roles
  operators
  evaluators
  rules
  nodeTypeProfiles
  contexts
  imports
  metadata
}
```

The exact field name can be decided during design. The requirement is that the
profile is not hidden in:

- prompt prose;
- product-specific parser tables;
- test-only inventory;
- generated dashboards;
- renderer-only templates;
- ABG runtime-local config.

If downstream products need reusable node types, they should import or publish
profiles through GTL-level module law.

## Admission And Materialization

The admission path should have two distinct operations:

```text
materializeProfile(profileRef, localRefinements) -> Node contract
checkProfileSatisfaction(node, profileRef) -> conformance result
```

Materialization is useful when a node is declared concisely by profile
reference.

Satisfaction is useful when a node declares its contract explicitly but claims
to conform to a known profile.

Both should fail closed when:

- a required context cannot be resolved;
- a required digest differs without declared version/re-entry authority;
- an asset surface drops required fields;
- a proof obligation is missing;
- a renderer or constructor ref is required but absent;
- local refinement weakens the profile contract;
- profile identity cannot be resolved through the module/import boundary.

ABG may project admitted profile satisfaction during traversal, but GTL owns
the declaration shape. ABG should interpret and admit; it should not invent
profile law as runtime convenience.

## Current State

Current state appears to be:

- Inline type structure exists through `Node.schema`, `Node.markov`,
  `Node.assetSurface`, `Context`, and `AssetSurface.requiredContexts`.
- Existing node contract identity already includes `AssetSurface`.
- GTL already distinguishes `GraphVector` from `GraphFunction`.
- `GraphFunction` already provides the reusable published workflow/program
  carrier.
- The explicit reusable node-type profile carrier does not appear to be a
  first-class GTL declaration yet.

So the answer is not "invent type structure from nothing".

The answer is:

```text
Ratify and name the reusable profile layer that the existing Context,
Node, and AssetSurface model already imply.
```

## Lawful Re-entry

Because this would add a first-class GTL language capability, the likely
re-entry starts above code.

Recommended path:

1. `product_reprice` or `requirement_reprice`: decide whether reusable node
   type profiles are part of the GTL product shape.
2. Requirement updates:
   - `REQ-L-GTL3-NODE`
   - `REQ-L-GTL3-ASSET-SURFACE`
   - `REQ-L-GTL3-CONTEXT`
   - `REQ-L-GTL3-MODULE`
   - `REQ-L-GTL3-CONTRACT-LAW-API`
3. Design update:
   - module publication shape;
   - carrier fields;
   - import/reference resolution;
   - materialization and satisfaction semantics;
   - conformance projection.
4. TypeScript realization:
   - carrier type;
   - constructor helpers;
   - serialization/admission;
   - conformance checks;
   - graph algebra composition checks;
   - focused tests.

This should not be implemented first as a local parser shortcut. If the concept
is real, it belongs in the GTL constitutional surface before realization.

## Risks

The main risks are avoidable:

- Creating a second schema system. `NodeTypeProfile` should bind existing node,
  context, and asset-surface law; it should not compete with it.
- Treating URI references as stable without digest. Context must remain
  snapshot-bound.
- Making profiles executable. Execution remains graph functions interpreted by
  ABG.
- Letting renderer templates outrank typed declarations. Rendered output is a
  view.
- Hiding reusable profiles in prompt prose. That would bypass GTL law.
- Allowing composition to compare only node names. Composition must compare
  contracts.
- Naming the concept too broadly as `TypeProfile`. That risks blurring node
  profiles, host-language types, asset surfaces, schemas, and graph functions.

`NodeTypeProfile` is the safer name because it says exactly where the carrier
lives.

## Acceptance Questions

Before ratifying this into requirements, the project should answer:

- Is the reusable carrier named `NodeTypeProfile`, or is there a better
  GTL-native name?
- Does a profile live directly under `Module`, or under a named module catalog?
- Can profiles inherit/refine other profiles, or should composition use
  explicit compatibility declarations only?
- Are required contexts referenced by `Context.name`, URI/digest pair, or a
  dedicated `ContextRef` carrier?
- Does a node bind to exactly one profile, or can it satisfy multiple profiles?
- How does profile versioning interact with digest changes and lawful re-entry?
- Which conformance failures are GTL typecheck failures versus ABG admission
  failures during traversal?

## Recommended Next Step

Create a small requirement/design tranche for `NodeTypeProfile` rather than
folding it into an implementation ticket.

The tranche should prove one steel-thread example:

```text
ReviewDocument -> TypescriptServiceModule
```

That example is narrow enough to validate the machinery, but the purpose is
not an odd_glc hello-world scenario. The purpose is full generic lifecycle
composition at arbitrary scale, where reusable node type profiles let GTL
carry structural type meaning across graph functions, graph vectors, and ABG
traversal units without collapsing the model into imperative orchestration or
prompt-local convention.
