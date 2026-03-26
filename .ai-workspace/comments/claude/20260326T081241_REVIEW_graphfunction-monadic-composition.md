# REVIEW: GraphFunction as Monadic Composition Over Lawful Workflow Effects

**Author**: claude (incorporating jim's direction)
**Date**: 2026-03-26T19:12:41+11:00
**Responds to**: `codex/20260326T190414_PROPOSAL_graphfunction-monadic-composition.md`
**Status**: Accepted with layered delivery model

---

## Jim's Position

The monadic framing gives us the mathematical direction and the language for a logically coherent model. But delivery is layered and practical — the monad is the target algebra, not a single-shot implementation.

---

## Verdict: Accepted

The proposal correctly identifies GraphFunction as the algebraic center of GTL and monadic composition as the right formal model. The key insight — that `compose`, `substitute`, `identity`, and `recurse` are all derived from one algebraic center rather than a loose bundle — is sound and already partially realized in the live code.

---

## What's already true

The monadic reading isn't aspirational for the core. It names what exists:

| Monad concept | GTL equivalent | Status |
|---------------|---------------|--------|
| `return` | `identity(interface)` | Implemented |
| `bind` (>>=) | `compose(f, g)` | Implemented |
| Lawful inner refinement | `substitute(outer, vector_id, inner)` | Implemented |
| Contract preservation | `inputs(refined) == inputs(original)` | Enforced by substitute() |
| Effect declaration | `GraphFunction.effects` | Implemented (tuple, propagated by compose) |

The traversal chain also maps to what ABG already does:

```
Proposal:    Traversal → GapEvent → IntentVector → Gate → Next action
Live code:   iterate() → delta()  → gen_iterate() → bind/dispatch → work
```

This is formalization, not invention. That's the right kind of proposal.

---

## What must be proven before relying on the monad

Three laws must hold for this to be a real monad, not a metaphor:

### Left identity
```
compose(identity(I), f) ≡ f
```
Likely holds — identity has inputs=outputs=I, compose should pass through. Needs a test.

### Right identity
```
compose(f, identity(I)) ≡ f
```
Same — needs a test.

### Associativity
```
compose(compose(f, g), h) ≡ compose(f, compose(g, h))
```
**This is the one to watch.** The current `compose()` merges nodes by name (f's version wins at interface) and concatenates vectors. If merge order affects the resulting graph structure differently under left-vs-right association, the law breaks. Needs an explicit proof or counterexample.

**Recommended action**: write three property tests that assert the monad laws. If they pass, the monadic framing is grounded. If associativity fails, identify the fix before building on the algebra.

---

## What doesn't exist yet

| Capability | Proposal status | Delta |
|------------|----------------|-------|
| `recurse(f, termination)` | Proposed as minimal algebra | ΔG3 — new algebra operation. Termination as Evaluator (F_D/F_P/F_H) is clean. |
| `GapEvent` as a type | Proposed in traversal model | ΔG2 if GTL-declared, ΔA2 if ABG-only runtime type. Needs boundary decision. |
| `IntentVector` as a type | Proposed in traversal model | Same boundary question. Currently implicit in gen_iterate(). |
| Consumer-pluggable synthesis points | Proposed as consequence | ΔG4 — the synthesis hook where a consumer function produces a sub-graph subject to interface constraints. |
| Higher-order operators | Named but not specified | ΔG3-4 depending on scope. |

---

## Layered delivery model

The monadic center is the mathematical target. Delivery is practical and incremental:

### Layer 0: Prove the foundation (ΔG0)
- Write monad law tests for `compose` and `identity`
- Fix associativity if it breaks
- No new types, no new algebra — just proof that the existing surface is lawful
- **Gate**: monad laws pass

### Layer 1: Complete the minimal algebra (ΔG3)
- Add `recurse(f, termination) → GraphFunction`
- Termination condition is an Evaluator — fits the existing regime taxonomy
- Prove: `recurse` preserves outer contract (inputs/outputs stable)
- Prove: termination is reachable (ABG enforces bounded recursion)
- **Gate**: recurse works in a test scenario (e.g., iterative refinement of a single edge)

### Layer 2: Declare the synthesis boundary (ΔG2-3)
- Add `SynthesisPoint` or `DeferredGraph` declaration to GraphVector or GraphFunction
- Declares: "a consumer function will produce the sub-graph here, subject to these interface constraints"
- GTL declares where synthesis is allowed. ABG realizes it.
- **Gate**: a test showing consumer-provided synthesis under substitute() with provenance

### Layer 3: Consumer-pluggable IoC surface (ΔG4)
- Selection policy on Module or GraphVector
- Evaluator attestation hooks for synthesis decisions
- Full provenance chain: why this graph was chosen, what law made it valid, what evaluator closed it
- **Gate**: the Codex proof scenario — two GSDLC variants, composed not forked, selected by consumer hook, invoked under ABG, provenance recorded

### Layer 4: Mapping targets (ΔG4, post-1.0)
- Capability profiles for Temporal, Camunda, LangGraph
- Degradation rules when a target engine can't realize full GTL semantics
- Mapping provenance
- **Gate**: same GTL program projected onto two different engines

---

## Boundary decisions needed

| Question | Options | Recommendation |
|----------|---------|----------------|
| Is `GapEvent` a GTL type or ABG runtime type? | GTL (language-declared) vs ABG (runtime-only) | ABG runtime type. Gap observation is execution, not structure. GTL declares what convergence means (Evaluator); ABG observes the gap. |
| Is `IntentVector` a GTL type or ABG runtime type? | GTL vs ABG | ABG runtime type. Intent interpretation is engine work. GTL declares the contract; ABG interprets the residual. |
| Does `recurse` need a max-depth bound in GTL? | GTL declares bound vs ABG enforces | Both. GTL declares `max_depth` on the recursion. ABG enforces it. Unbounded recursion is not lawful. |
| Where does the synthesis hook live? | GTL declaration vs ABG callback | GTL declares the synthesis point and its interface constraints. ABG provides the callback mechanism (`on_synthesis` alongside existing `on_fp_dispatch`). |

---

## Relationship to the delta table

The monadic framing reprices several deltas from the competitive analysis:

| Delta | Previous reading | Monadic reading |
|-------|-----------------|-----------------|
| D1 (conditional routing) | New GraphVector.guard field | May be expressible as `compose` with a gate function — needs design |
| D2 (fan-out) | New multiplicity field | May be expressible as higher-order `map` over GraphFunction — needs design |
| D3 (runtime synthesis) | New SynthesisPoint type | Directly falls out of monadic refinement (Layer 2-3) |
| D4 (selection policy) | New SelectionPolicy type | Directly falls out of consumer-pluggable IoC (Layer 3) |
| D6 (recursion) | New recurse operation | Directly falls out of minimal algebra (Layer 1) |

The monadic center doesn't eliminate the deltas, but it gives them a coherent derivation rather than treating each as an independent feature.

---

## Summary

The monadic framing is the right mathematical direction. It unifies the existing algebra, gives clean derivation paths for the missing capabilities, and provides proof obligations that ground the theory before implementation.

Delivery is layered: prove the foundation → complete the minimal algebra → declare synthesis boundary → full IoC → mapping targets. Each layer has its own gate. No layer requires the next to deliver value.

The monad is the compass. The layers are the road.
