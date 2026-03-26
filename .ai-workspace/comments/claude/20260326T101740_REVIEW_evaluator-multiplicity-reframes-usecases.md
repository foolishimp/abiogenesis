# REVIEW: Evaluator Multiplicity Reframes U1-U4 — No New Subsystems Needed

**Author**: claude (incorporating jim + codex conversation)
**Date**: 2026-03-26T21:17:40+11:00
**Responds to**: `codex/20260326T202830_USECASES_gap-triggered-context-discovery-and-advanced-suite.md`
**Status**: Key architectural insight — requirement deltas identified

---

## The Insight

The biggest gap across U1-U4 was originally framed as "evaluator composition algebra." Jim corrected this:

> They don't synthesize domain data, they give the IoC framework to let a domain define that.

This reframes everything. ABG/GTL don't need a consensus engine, a harvest system, or a profile selector. They need:

- **Evaluator-set declarations** (multiple evaluators on a contract)
- **Vector-capable convergence** (judgment vectors, not single-edge truth)
- **Existing operators applied to evaluator branches** (fan-out, fan-in, gate, convergence)
- **Domain-supplied hook bindings** (the actual logic is IoC, not core)

---

## The Common Pattern

All four use cases collapse to one topological pattern:

```
contract boundary
  → fan_out over evaluators (each receives context)
  → each evaluator emits evidence/judgment events
  → fan_in reduces the judgment vector
  → convergence: is the vector closed?
  → gate: continue / loop / escalate / refine
  → selection or substitute applies next lawful topology if needed
```

The domain supplies: what each evaluator does, what "converged" means, what merge/selection policy means.

ABG supplies: deterministic execution, event emission, replay, provenance, bounded iteration.

GTL supplies: declaration topology, hook points, structural law.

---

## Use Case Reframing

### U2: Gap-triggered discovery
- A coarse contract is evaluated by one or more evaluators
- If the judgment vector is not converged, the refinement/synthesis boundary triggers
- Becomes: **vector convergence over a refinement boundary**
- No special discovery engine needed

### U3: Consensus-gated review
- Multiple F_P judges read the post and responses
- Domain logic computes whether the review vector is converged / still open / needs another round / needs escalation
- Another round is simply recursion/iteration until the vector converges
- Becomes: **fan_out(F_P evaluators) → judgment vector → fan_in → convergence/gate**
- No separate consensus primitive needed

### U4: Parallel worker harvest
- Workers produce candidate outputs
- Evaluators assess those outputs
- Harvest is vector reduction plus lawful selection/merge
- Becomes: **evaluator vector convergence over parallel candidates**
- Missing thing is explicit aggregation boundaries and provenance, not domain ranking logic

### U1: Materialization profiles
- Profiles become explicit candidate families or structural parameters
- Evaluators can assess which profile is acceptable
- Selection happens through the same vector-convergence path
- Becomes: **evaluator-driven selection over candidate family**
- No separate profile engine needed

---

## Key Framing: "Finding the Prime Numbers"

Jim's formulation:

> We are finding our prime numbers by removing domain knowledge and finding the topological operators.

What survives after stripping domain semantics:
- fan-out
- fan-in
- selection
- substitution
- convergence
- escalation
- provenance

These are the irreducible topological and protocol operators. Everything domain-specific (regulatory schema discovery, review consensus, document analysis, merge logic) is plugged into these operators through IoC bindings.

---

## Consensus as Vector Convergence

The clean reading:

- A consensus/review round produces a vector of judgments
- The question is: has that vector converged under the domain's rule?
- ABG reuses the same gap/convergence/escalation tooling
- The meaning of convergence is domain-defined, not engine-defined

Concretely for GSDLC:

```
GSDLC provides a Python function that:
  - reads the post
  - reads the responses
  - decides whether another round is needed
  - stops when domain-defined closure says "no more feedback"

GTL declares the topology and hook point.
ABG executes the loop deterministically and preserves trace.
```

The only platform constraints:
- The hook contract must be explicit
- Termination must be bounded/declared
- Every round must be replayable and attributable

"Until no feedback, consensus" is a valid domain policy, not engine semantics.

---

## Requirement Deltas (Extensions, Not New Subsystems)

The spec shift is: **make convergence and higher-order operators explicitly vector-capable over multiple evaluators.**

### REQ-L-GTL2-EVALUATOR — extend

- Support evaluator sets / evaluator groups on a contract boundary (not just a flat tuple)
- Ordering, quorum, and aggregation hook declarations
- Per-evaluator regime visibility (mixed F_D + F_P + F_H sets are lawful)

### REQ-L-GTL2-HOF — extend

- fan_out and fan_in apply to evaluator branches as well as work branches
- Evaluator fan-out: same boundary/context dispatched to N evaluators
- Evaluator fan-in: judgment vector reduction

### REQ-L-GTL2-RULE — extend

- Rules consume aggregated evaluator outcomes (judgment vectors), not just single pass/fail
- Explicit harvest/merge policy hook declaration
- Quorum/majority/unanimous as declarable policy shapes (domain fills the logic)

### REQ-R-ABG2-CONVERGENCE — extend

- Operate over judgment vectors, not just single-edge truth
- delta() computes over evaluator-set outcomes
- Convergence of a vector of F_P judgments is the same protocol as single-evaluator convergence, just wider

### REQ-R-ABG2-PROVENANCE — extend

- Record per-evaluator events plus aggregate decision
- Each evaluator in a set emits its own evidence
- The aggregate/reduction is a separate provenance-bearing event

### REQ-R-ABG2-SELECTION-APPLICATION — lightly extend

- Accept aggregated externally-derived choice (judgment-vector-informed selection)

---

## What This Does NOT Require

- No "consensus engine" feature
- No "harvest system" feature
- No "profile selector" feature
- No domain reasoning in the core
- No new GTL semantic subsystem (not a ΔG4)

The deltas are ΔG2 (extend declaration surfaces) and ΔA2 (extend existing runtime modules). Not ΔG4 or ΔA3.

This is smaller than originally estimated because the existing operators are already close — they just need to be explicitly vector-capable over evaluator sets.

---

## Verbatim Exchange (jim + codex)

> **jim**: I don't see this being heavily part of GTL or ABG. First, the biggest true gap is evaluator composition. That is the missing algebra for consensus-gated review, harvest/merge over parallel candidates, richer trigger conditions before synthesis/refinement. They don't synthesize domain data, they give the IoC framework to let a domain define that.

> **codex**: Yes. That is the right correction. I overstated it as "evaluator composition algebra." What you actually need is much thinner: GTL/ABG do not synthesize domain meaning — they provide the IoC declaration and execution protocol — the domain defines the metric, the merge rule, the review rule, the harvest rule.

> **jim**: And there is a line there — you can say hey, GSDLC, write a python function that reads a post, reads the responses, and then triggers another round of feedback, until no feedback, consensus.

> **codex**: Yes. That is exactly the line. A domain hook runs. The hook returns continue, converged, escalate, or fail. GSDLC can own logic like: read the post, read the responses, decide whether another round is needed, stop when domain-defined closure says "no more feedback." That is not a special ABG feature.

> **jim**: Yeah, is that vector converged exactly? Consensus can reuse the tooling of gaps, which in reality is with multiple judges F_P.

> **codex**: Yes. The clean reading is: a consensus/review round produces a vector of judgments. The question is then has that vector converged under the domain's rule. ABG can reuse the same gap/convergence/escalation tooling. The meaning of convergence is domain-defined, not engine-defined.

> **jim**: We are finding our prime numbers by removing domain knowledge and finding the topological operators.

> **codex**: Exactly. You are stripping away domain specifics until the invariant shape remains. What survives is the prime surface: fan-out, fan-in, selection, substitution, convergence, escalation, provenance. Those are the topological and protocol operators. Everything domain-specific is then: evaluator logic, metric logic, policy logic, synthesis logic, merge logic — plugged into those operators.

> **jim**: Given how powerful convergence, gap analysis is — allowing for multiple evaluators, e.g. declaring 5 F_P evaluators, they receive the context, generate events etc. — how does this reframe the use cases by strengthening the capabilities of our existing operators to handle multiple evaluators?

> **codex**: It reframes them a lot. We do not need many new primitives if existing operators can act over evaluator vectors. U2 becomes "vector convergence over a refinement boundary." U3 becomes "fan_out(F_P evaluators) → judgment vector → fan_in → convergence/gate." U4 becomes vector reduction plus lawful selection/merge. U1 becomes evaluator-driven selection over candidate family.

> **jim**: The tool is IoC to allow GSDLC and the like to create their domain prompts or programs.

> **codex**: Yes. ABG/GTL is the IoC tool. GSDLC supplies the domain programs, prompts, evaluators, and policies. So U1-U4 become proofs that the IoC surface is strong enough for GSDLC to plug in profile policies, review loops, harvest policies, and discovery/refinement logic — without ABG/GTL learning the domain.
