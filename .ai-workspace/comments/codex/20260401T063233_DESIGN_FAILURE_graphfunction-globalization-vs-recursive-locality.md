# Design Failure: GraphFunction Globalization vs Recursive Locality

Date: 2026-04-01
Author: Codex
Context: cross-project analysis from `genesis_sdlc 1.1.1` materialized-topology failure

## Claim

This is an ABG design failure, not just a `genesis_sdlc` implementation bug.

The failure is that `GraphFunction` materialization was treated as a global graph
rewrite, when the intended semantics are closer to scoped recursive execution.

In other words:

- local function expansion was globalized
- private inner vectors were promoted into module-global runtime space
- module law was then forced to retroactively absorb implementation detail

That design choice is what made the `gsdlc 1.1.1` materialized topology unstable.

## Core Observation

The current seam effectively says:

- select a `GraphFunction`
- substitute its inner graph into the live graph
- rebuild enough module projections to keep the engine moving

But if graphfunctions are meant to behave like recursive function calls, this is
the wrong semantic model.

The correct model is:

- the outer vector is the published contract
- selecting a graphfunction creates a scoped invocation frame
- the inner vectors live inside that frame
- only the boundary outputs re-enter the parent space

The inner vectors should not become peer live vectors in module-global space by
default.

## The Actual Hole

The hole is a mismatch between two algebras:

1. Graph algebra

- `GraphFunction` composition proves local interface compatibility
- substitution is valid at the level of graph structure

2. Published-module algebra

- runtime admission requires more than graph compatibility
- every live vector must have lawful publication/traversal surfaces
- jobs, worker capability, and other module-level witnesses must still close

`gsdlc 1.1.1` implicitly assumed:

- composable graphfunctions => lawful rewritten module

That implication is false.

What was actually true was:

- composable graphfunctions => lawful local substitution

Those are not equivalent.

## Why The Failure Happened

Under global rewrite semantics, materialization changes the live carrier set of
vectors. Once the inner vectors become live in module-global space, all module
surfaces indexed over live vectors must also be transformed:

- `RefinementBoundary`
- `CandidateFamily`
- `Job -> ContractRef`
- worker executable capability
- any edge-indexed publication or proof surface

If even one of those projections is not transported, the rewritten module is no
longer closed under runtime law.

That is exactly what happened in `genesis_sdlc 1.1.1`.

## Why This Is Not Just "Python Being Dynamic"

Python does make this easier to miss, because the type system will not prove
global invariants for a mutable graph-shaped declaration surface.

But the deeper issue is semantic, not linguistic.

Even in a stronger language, if the operation is modeled as:

- `module + selection -> substituted_graph + caller_cleanup`

then the invariant is externalized and closure is not guaranteed.

The problem is the codomain, not only the host language.

## Correct Semantic Model

If each vector effectively runs in its own local state space, then graphfunction
application should be modeled as recursive locality:

- module-level law applies only to published outer vectors
- graphfunction invocation creates a private runtime frame
- inner vectors are frame-local and namespaced by invocation identity
- execution proceeds inside the frame until declared outputs are discharged
- only the outer boundary is visible to the parent/module law surface

Under this model, materialization for inspectability is acceptable only as:

- a trace projection
- a debugging/inspection artifact
- a compiled explanatory view

It should not automatically become the runtime's new global traversal surface.

## Design Consequence

If ABG wants algebraic construction to actually enforce algebraic construction,
then one of the following must become true:

1. `GraphFunction` materialization returns a fully rebuilt, validated lawful
   module rather than a graph-level substitution artifact.
2. ABG introduces explicit call-frame semantics for graphfunction invocation,
   keeping inner vectors local instead of global.
3. "Materialized topology" is redefined as a non-operative inspection surface,
   distinct from the executable module law surface.

The least coherent design is the one that currently failed:

- recursive-local intuition
- macro-expansion runtime semantics
- retroactive module repair

## Recommended Kernel Position

The most principled ABG stance is:

- `GraphFunction` is a scoped recursive execution primitive
- global module topology is the published contract surface
- inner expansion is local unless explicitly exported

If ABG chooses instead to support globalized materialization as an operative
mode, then ABG must own a canonical closure operator that transports all
module-level witnesses together and fails before the rewritten module escapes.

## Short Form

The failure was not merely that a validation step was missing.

The failure was that ABG globalized what should have remained local.

`GraphFunction` was treated like graph rewrite when it should have been treated
like recursive scoped execution.
