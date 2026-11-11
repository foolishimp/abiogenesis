# M03 Consequence Allowed Traversal Catalog Derivation

**Status**: active design
**Singular owner for**: T-156 consequence allowed traversal catalog
**Derived from**:
- `specification/PRODUCT.md`
- `specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md`
- `specification/requirements/abg/REQ-R-ABG3-FP-CONSCIOUSNESS.md`
- `specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md`
- `specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md`
- `specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md`
- `specification/requirements/gtl/REQ-L-GTL3-HOOKS.md`
- `.ai-workspace/tickets/completed/T-156-admit-consequence-allowed-traversal-catalog.md`
- `.ai-workspace/tickets/completed/T-159-formalize-traversal-unit-and-consequence-bind-boundary.md`

This is the single T-156 design surface. Existing M03 conformance, runtime
authorship, construction intent, and GTL zoom designs are dependency law for
this design; they are not parallel T-156 design owners.

## Problem

T-152 and T-155 provide the substrate for consequence-selected traversal
actions and graph-function zoom. Downstream SDLC depth and ticket-workflow proof
showed that consequence selection still needs one ABG-owned admission boundary:
the consequence plugin must choose from the traversal families declared for the
current GTL edge, not from an implicit product-local switch.

T-159 makes this catalog the post-unit bind-selection surface for
`TraversalUnit<A, B>`. The catalog is not the unit, and catalog rows are not
executable. They define the lawful family choices ABG may admit after a unit's
consequence phase proposes a next disposition.

The desired control shape is:

```text
TraversalUnit<A, B>
  -> typecheckGtlProgram validates allowed traversal declarations
  -> evaluation set and assurance fold
  -> plugin.consequence.C proposes one traversal selection
  -> ABG admits that selection against the edge's allowed traversal catalog
  -> ABG projects executable selections into construction action/intent
  -> ABG emits runtime events and replays continuation
```

## Irreducible Architectural Carrier Set

### `AllowedConsequenceTraversalCatalog`

Owner: ABG.

Purpose: replay-visible admission surface that binds one graph function, one
materialized graph vector, and one edge label to a finite set of allowed
consequence traversal families.

Under T-159, that tuple is the catalog surface for one selected traversal unit.
Every conforming GTL/ABG release has an admitted or explicitly empty catalog
surface for a unit. Missing rows are negative authority, not permission for a
product controller to choose a substitute route.

Inputs:

- `GraphVector.declarations`
- `GraphFunction.declarations`
- current graph-function identity
- current graph-vector identity
- current vector index and edge label

Non-closure signals:

- static conformance cannot parse or validate the declared catalog rows
- no catalog row exists for a consequence-selected family
- a row exists but does not allow the selected construction action kind
- a row requires authority refs not carried by the selected action
- ticket traversal points at ticket storage instead of a product-declared route
- depth traversal lacks graph-function zoom/refinement authority

### `AllowedConsequenceTraversalRow`

Owner: ABG.

Purpose: one admitted family option within the catalog.

The row names:

- traversal family
- allowed construction action kinds
- optional graph-function or published traversal target constraints
- required authority refs
- proportionality basis refs
- declaration source refs

Rows are subordinate to the catalog. They are not executable by themselves.

Empty `allowedGraphFunctionRefs` or `allowedTraversalTargetRefs` are explicit
wildcards scoped to this catalog row's graph function, graph vector, and edge.
They mean that row presence authorizes the family at the current edge without
a narrower target allow-list. They do not satisfy route authority. Hard route
authority is carried only by `requiredAuthorityRefs`; proportionality refs are
ranking/justification inputs and cannot satisfy required authority.

Target-specific nonlocal routes should declare non-empty target or graph
function allow-lists. The closure matrix must prove unavailable-target
rejection where such constraints are present.

### `ConsequenceTraversalAction.selectedTraversalFamily`

Owner: consequence plugin proposes; ABG admits.

Purpose: optional explicit family selection on the existing
`ConsequenceTraversalAction` carrier. When omitted, ABG may derive the family
from the construction action kind and selected authority shape. Ambiguous
families, such as graph-span reentry versus depth traversal, should be explicit
in downstream plugins.

The first slice keeps inference for compatibility and direct ABG use. Product
plugins that select nonlocal routes should set `selectedTraversalFamily`
explicitly. Full closure should decide whether nonlocal family inference remains
admissible or is narrowed to same-edge and terminal compatibility cases only.

The action remains a proposed plugin payload until admitted. It cannot carry
engine-authority fields, runtime events, ledgers, cursor movement, closure
flags, or replay mutation.

### `typecheckGtlProgram(...)` allowed traversal declaration check

Owner: ABG.

Purpose: static conformance validation for the same GTL annotations that build
the runtime catalog. The compiler gate materializes each published graph
function, derives the allowed traversal catalog for each graph vector through
`deriveAllowedConsequenceTraversalCatalogFromGtl`, and reports a
`gtl_program_conformance_issue` if a family or row declaration is malformed.

This check is not a second parser or a product-local rule. It reuses the
runtime catalog derivation so static validation and runtime admission share one
ABG truth.

## Allowed Families

Initial families:

- `same_edge_retry`
- `depth_traversal`
- `graph_span_reentry`
- `public_start_reentry`
- `ticket_traversal`
- `fh_input_required`
- `escalation_or_reprice`
- `gap_stop`
- `non_admit`

`depth_traversal` consumes T-155 graph-function zoom authority. `ticket_traversal`
routes through a product-declared graph function, public-start asset handle, or
published traversal target. ABG does not own downstream ticket storage or ticket
meaning.

## Structural Derivation

```text
GTL graph vector declarations
  + GTL graph function declarations
  + selected traversal-unit identity
  -> typecheckGtlProgram validates declarations through catalog derivation
  -> deriveAllowedConsequenceTraversalCatalogFromGtl
  -> EnginePluginInput.allowedConsequenceTraversalCatalog
  -> product consequence plugin proposes one family/action
  -> admitConsequenceTraversalActionForAllowedCatalog
  -> constructConstructionActionRowFromConsequenceTraversalAction
  -> constructConstructionIntentCandidateFromConsequenceTraversalAction
  -> ABG runner invokes or stops through runtime law
```

## Boundary Law

- GTL declares which traversal families are available for the current edge.
- ABG's static conformance gate rejects malformed traversal-family and row
  declarations before a downstream product treats the release as valid.
- A downstream product consequence plugin may select one declared family using
  domain pressure and policy.
- ABG admits or rejects the selected action against the catalog.
- ABG owns construction projection, traversal transition, runtime events,
  graph reentry, continuation, and replay.
- An annotation or declaration can permit, rank, or require a family. It cannot
  create tickets, invoke graph functions, move cursors, write ledgers, or close
  work by itself.
- The catalog is consumed by consequence bind. It does not replace
  `TraversalUnit<A, B>`, and it does not authorize overlay, CLI, or product
  controller route selection outside ABG admission/replay.

## Decommission Register

Rejected paths:

- product-local consequence switch that is not checked against GTL declaration
  truth
- separate static compiler parser that can drift from runtime catalog admission
- treating the allowed traversal catalog as the traversal unit itself
- treating missing catalog rows as implicit same-edge retry or product-local
  route authority
- annotation-only ticket creation
- downstream cursor movement or relative vector offsets
- bare graph-vector starts
- ABG writing downstream ticket files as substrate law
- silent same-edge retry fallback when a declared nonlocal route exists
- separate authority pipelines for depth traversal and ticket traversal

## Proof Expectations

Focused proof must show:

- catalog construction from GTL declarations
- static `typecheckGtlProgram(...)` validation that admits valid declarations
  and rejects unknown families or malformed row declaration shapes
- catalog-gated admission of a depth traversal action
- catalog-gated admission of a ticket traversal route
- rejection when the selected family is not declared
- rejection when a required route authority appears only as proportionality
  basis
- rejection of annotation-only ticket storage refs
- preservation of the existing T-152 construction bridge behavior after adding
  catalog admission

Full closure also requires semantic build, focused T-156 tests, and relevant
T-152/T-155 regression tests.
