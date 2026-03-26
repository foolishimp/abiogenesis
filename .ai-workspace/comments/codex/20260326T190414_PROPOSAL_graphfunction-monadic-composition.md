# PROPOSAL: GraphFunction as Monadic Composition Over Lawful Workflow Effects

**Category**: PROPOSAL
**Date**: 2026-03-26T19:04:14+11:00
**Status**: Review first
**Intent**: sharpen the current `GraphFunction` surface into the algebra that makes composition, recursion, substitution, and trace coherent

---

## Position

`GraphFunction` should be treated as the primary GTL unit of reusable compute.

Its composition should be understood as **monadic composition over lawful workflow effects**.

In compact form:

```text
GraphFunction : A -> M[B]
```

Where `M[...]` is the GTL/ABG workflow effect context carrying:

- lawful interface / contract
- provenance and lineage potential
- traversal and event emission
- lawful refinement / substitution capability
- evaluation and gate consequences

This means:

```text
g1().g2().g3()
```

is not just chained syntax. It is:

```text
bind(bind(g1, g2), g3)
```

with lawful effect propagation.

---

## Why This Is The Right Center

If `GraphFunction` is monadic, most of the rest falls out naturally:

- legal sequential composition
- identity
- substitution / refinement
- recursion
- dynamic zoom
- provenance / trace
- consumer-pluggable synthesis inside lawful boundaries

This is not "sub-workflows" in generic workflow-tool language.

This is:

**first-class monadic graph-function composition with lawful refinement**

---

## Core Semantic Rule

A `GraphFunction` has an outer contract that must remain stable under composition.

So if:

```text
g3 : A -> X
```

then `g3` may lawfully refine internally into:

```text
A -> W -> X
```

for example by:

```text
g3() : X { g4().g5() }
```

but to the caller it is still:

```text
g3 : A -> X
```

This is **lawful substitution**, not arbitrary graph mutation.

The law is:

- `inputs(refined_g3) == inputs(g3)`
- `outputs(refined_g3) == outputs(g3)`

Internal structure may change. Outer contract may not.

---

## Minimal Algebra

The minimal surface is small.

```text
identity(interface) -> GraphFunction
compose(f, g) -> GraphFunction
substitute(contract, refinement) -> GraphFunction | Graph
recurse(f, termination) -> GraphFunction
```

Interpretation:

- `identity` preserves the interface under composition
- `compose` is lawful only when interfaces align
- `substitute` refines a coarse contract into a finer graph while preserving the boundary
- `recurse` expresses repeated lawful graph application under a termination condition

---

## Traversal Model

The runtime unit is not the graph function itself.

The runtime unit is **Traversal of a graph-function invocation**.

```text
Traversal(g():W, ctx) -> EventBatch
```

The important observed event inside that batch is:

```text
GapEvent
```

Then:

```text
InterpretGap(GapEvent) -> IntentVector
```

So the causal chain is:

```text
Traversal -> GapEvent -> IntentVector -> Gate / Evaluation -> Next lawful action
```

This preserves an important distinction:

- `GapEvent` is observed residual evidence
- `IntentVector` is interpreted directional state

Intent is not primary. Observation is.

---

## Runtime Refinement Example

Start with a coarse contract:

```text
a -> x
```

Traversal over that contract yields a `GapEvent` indicating the contract is too coarse to close directly.

A lawful refinement then produces:

```text
a -> discovery(C) -> w
w -> x
```

or more abstractly:

```text
a -> Gc -> x
```

where `Gc` is a synthesized subgraph.

This is lawful only if:

- the outer input remains `a`
- the outer output remains `x`

So runtime synthesis is not arbitrary graph mutation.
It is:

- synthesis
- followed by lawful substitution
- recorded as provenance-bearing runtime refinement

---

## GTL / ABG Boundary

### GTL owns

- `GraphFunction` as a first-class workflow program
- composition laws
- substitution laws
- recursion laws
- interface preservation
- the declaration surface for lawful refinement

### ABG owns

- traversal execution
- event emission
- provenance recording
- lineage preservation
- evaluator and gate realization
- binding and transport

This keeps business logic out of ABG while still letting consumers supply lawful synthesis and evaluation behavior.

---

## Consequence For The Missing 1.0 Capability

The missing capability is not merely "custom evaluators" or "sub-workflows."

It is:

**consumer-pluggable graph synthesis and lawful refinement over monadic graph-function composition**

That is the capability that makes:

- contract-specific GSDLC variants
- meaningful dynamic zoom
- recursive refinement
- evaluator-driven closure

all coherent.

---

## Relationship To Current Live GTL Surface

This proposal mostly sharpens and unifies current live GTL families rather than inventing a separate theory:

- `REQ-L-GTL2-GRAPHFUNCTION`
- `REQ-L-GTL2-COMPOSE`
- `REQ-L-GTL2-SUBSTITUTE`
- `REQ-L-GTL2-RECURSE`
- `REQ-L-GTL2-HOF`

The change is that these should be expressed as one algebraic center rather than a loose bundle of capabilities.

---

## Proposed Next Step

Do not jump straight to code.

First:

1. define the canonical `GraphFunction` algebra in English
2. reprice the requirement wording around the monadic center
3. update the GTL design surface to make `compose`, `substitute`, `recurse`, and higher-order operations obviously derived from that center

Only then should the implementation shape be chosen.
