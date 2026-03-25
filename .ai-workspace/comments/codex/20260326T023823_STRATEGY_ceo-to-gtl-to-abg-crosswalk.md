# CEO -> GTL -> ABG Crosswalk

## Position

The Constraint-Emergence Ontology is upstream of the `GTL / ABG` model.

`GTL` is the semantic SDK projection of the ontology.

`ABG` is the canonical execution projection of the ontology.

This document is not live specification.

Its job is to expose:

- which ontology concepts are already surfaced cleanly
- which are only implicit
- which are missing

Primary source:

- [constraint_emergence_ontology_spec.md](/Users/jim/src/apps/constraint_emergence_ontology/constraint_emergence_ontology_spec.md)

Current ABIogenesis design sources:

- [GTL_2_CONSTITUTIONAL_DESIGN.md](/Users/jim/src/apps/abiogenesis/specification/GTL_2_CONSTITUTIONAL_DESIGN.md)
- [GTL_2_MODULE_DESIGN.md](/Users/jim/src/apps/abiogenesis/builds/claude_code/design/GTL_2_MODULE_DESIGN.md)
- [ADR-030-job-role-worker-run-binding.md](/Users/jim/src/apps/abiogenesis/builds/claude_code/design/adrs/ADR-030-job-role-worker-run-binding.md)

---

## Crosswalk

| CEO primitive | CEO meaning | GTL expression | ABG realization | Current gap |
| --- | --- | --- | --- | --- |
| Constraint | boundary of admissible transformation | `Rule`, interface contracts, evaluator criteria, graph contract boundaries | validation, convergence checks, binding failure, correction logic | split across many surfaces; no single first-class `Constraint` type |
| Gap | the admissible region carved by constraints | the open work contract between source and target, plus unresolved evaluator delta | executable delta, failing evaluator set, next lawful action | not first-class; mostly implicit in `delta()` and failing/passing evaluator partitions |
| Constraint network | substrate of allowed/forbidden transitions | `Graph`, `GraphVector`, `Module`, graph algebra | traversal, scheduling, projection, event emission | surfaced well; this is the strongest realized part of the ontology |
| Markov object | stable bounded pattern whose boundary preserves conditional independence | `Node` with `markov`, bounded graph contracts, explicit `Context` boundaries, later possibly `Job` / module boundaries | `ExecutableJob`, `WorkSurface`, artifact boundary, run/work boundary | no explicit Markov-boundary concept beyond node `markov`; object-boundary semantics remain diffuse |
| Emergent layer | a layer whose stable objects become constraints for the next layer | `GraphFunction`, composition, substitution, recursion, module publication boundary | child work, fold-back, promotion of context, provenance over refinement | no first-class `Layer` concept; emergence is expressed operationally, not named |
| Unit of change | discrete evolution step of the substrate | graph contract step, substitution step, evaluator step | `Run`, event append, work-surface stage transition | partially surfaced; no explicit law stating which ABG unit is the canonical change step |
| Self-bounding closure | recursive system whose gap-structure reproduces itself | self-hosting module, bootloader-visible GTL, module imports, graph recursion | self-hosting checks, drift detection, installer/bootstrap loop | self-hosting exists, but closure is not yet a named semantic invariant in GTL/ABG terms |
| Local preorder `D(x,c)` | preferred direction of change at each node under constraints | lawful next-step semantics, selection boundary, evaluator regimes, graph algebra legality | scheduling, selection, interpretation, convergence ordering, escalation | no explicit direction-function abstraction; it is distributed across services, selection, and convergence |
| Actualisation / resolution | one admissible potentiality becomes actual | `F_D`, `F_P`, `F_H` semantics, job declaration, gate combinators | `Run`, emitted events, assessed truth, convergence, `WorkSurface` | surfaced strongly, but the formal relationship between potential and actual remains implicit |
| Structural invariance across domains | physics, computation, biology share the same structural roles | graph-first language and regime model | ABG as graph-native runtime | mapping layer is still thin; cross-domain equivalence is argued more than encoded |
| Vocabulary bridge | malformed noun-language must be translated into structural language | graph/program/job/role vocabulary | event/run/binding/provenance vocabulary | no explicit translation layer for user-facing questions or design disputes |
| Cross-domain functor table | same structural role across different projections | `mapping.*` intent, engine independence, portable GTL | ABG capability profiles, engine mappings | placeholder only; this is not yet materially built |

---

## Strong Alignments

### 1. Constraint network -> graph-first GTL

This is the strongest alignment.

The ontology says the substrate is a constraint network with graph topology.

The ABIogenesis design says everything structural is graph.

That line is already strong and coherent.

### 2. Actualisation -> run/event truth

The ontology distinguishes potentiality from actualisation.

The ABIogenesis model distinguishes:

- declared work
- executable work
- realized run
- emitted event truth

This is a good computational realization of actualisation.

### 3. Emergence -> composed graph programs

The ontology says higher layers emerge when stable structures become constraints for the next layer.

The ABIogenesis design already has the right pieces:

- `compose`
- `substitute`
- recursion
- module publication boundaries
- fold-back of child work

The language already behaves like layered emergence, even if it does not name it directly.

### 4. Markov boundary intuition -> node `markov` and explicit context

The ontology is explicit about Markov objects and self-bounding patterns.

ABIogenesis already has:

- `Node.markov`
- explicit `Context`
- explicit contract boundaries on graph steps

This is directionally correct.

It is not yet a complete Markov-boundary model.

---

## Main Gaps

### 1. Constraint is not a first-class unified type

The ontology treats constraint as primitive.

ABIogenesis spreads constraint across:

- `Rule`
- interface legality
- evaluator criteria
- context binding
- role requirements

That may remain acceptable.

If it does, the model still needs a clearer statement that these are all constraint surfaces.

### 2. Gap is mostly implicit

The ontology says reality forms in gaps.

ABIogenesis has the computational equivalent:

- failing evaluators
- delta
- missing contexts
- lawful next action

Those are the operational gap surfaces.

They are not named as such.

A future unifying abstraction may be useful.

### 3. Emergent layer has no first-class language representation

The ontology is explicit about emergent layers.

ABIogenesis currently expresses layering through:

- graph composition
- substitution
- module boundaries
- fold-back and lineage

This works operationally.

It does not yet name the layer concept itself.

### 4. The local preorder is missing as a named concept

This is one of the clearest gaps.

The ontology has a direction function `D(x,c)`.

ABIogenesis currently distributes directionality across:

- selection
- scheduling
- convergence logic
- regime escalation

That works in code.

It leaves the directional law implicit.

This is a strong candidate for future formalization.

### 5. Markov object boundaries need sharper realization

`Node.markov` is a good start.

It does not yet define:

- the bounded object itself
- the boundary law
- the relation between boundary and conditional independence

Current candidates for the realized Markov object are:

- `Node`
- `ExecutableJob`
- `WorkSurface`
- artifact boundary
- module boundary

That ambiguity is still open.

### 6. Cross-domain mapping is still mostly aspirational

The ontology is explicit about structural invariance across domains.

The current ABIogenesis design has:

- engine independence
- mapping placeholders
- some comparative thinking against OS and workflow systems

It does not yet have a real mapping framework strong enough to claim the ontology is operationalized across domains.

### 7. Self-bounding closure is only partially expressed

The self-hosting surfaces are real.

Bootloader consistency and drift detection are real.

That is the beginning of self-bounding closure in computational form.

The design does not yet state closure in ontology-native terms.

### 8. Orchestration depth is thinner than the ontology wants

The ontology strongly suggests layered actualisation through stable structures and higher-order constraints.

ABIogenesis currently has:

- `Job`
- `ExecutableJob`
- `Run`

It is still thin on:

- deployment
- schedule
- trigger
- window
- KPI / SLA

This is the same orchestration gap surfaced by the OS and cloud comparison.

---

## Current Best Mapping

The current clean reading is:

- CEO `constraint network` -> GTL `graph/module/program surface`
- CEO `constraint` -> GTL legality surfaces and ABG validation/convergence
- CEO `Markov object` -> bounded contract/evidence structures with `markov` as the first explicit hook
- CEO `actualisation` -> ABG `Run` plus append-only event truth
- CEO `emergent layer` -> graph composition, substitution, recursion, module layering
- CEO `local preorder` -> implicit across ABG selection, scheduling, and convergence

That is coherent enough to justify the architecture.

It is not yet complete enough to claim a full computational realization of the ontology.

---

## Design Implications

### 1. GTL is not only a workflow DSL

It is the semantic SDK projection of the ontology.

That means it should be expected to surface:

- topology
- semantic work contracts
- capability classes
- eventually more of orchestration and layer semantics

### 2. ABG is not just a workflow engine

It is the canonical execution projection of the ontology.

That means it should be expected to own:

- actualisation
- event truth
- run governance
- lawful traversal
- projection of semantic structure into executable truth

### 3. Missing concepts should be added only when they become irreducible

The ontology can justify many more types than the runtime currently needs.

That does not mean all of them should be surfaced now.

The right rule is:

- surface what the execution model cannot remain coherent without
- keep the rest as design pressure until they become irreducible

---

## Highest-Value Follow-on Crosswalks

1. `CEO -> GTL` only

This would identify which ontology concepts belong in the language surface.

2. `CEO -> ABG` only

This would identify which ontology concepts are execution concerns rather than language concerns.

3. `CEO -> OS / cloud / GTL / ABG`

This would unify the philosophical and practical comparisons into one table.

4. `CEO Markov object -> ABIogenesis boundary model`

This is probably the highest-value focused gap analysis.

---

## Questions Worth Carrying Forward

1. What is the canonical ABIogenesis realization of a CEO Markov object?
2. Does the ABIogenesis model need an explicit boundary law, not just `markov` fields?
3. Should the local preorder become a named scheduling / selection abstraction?
4. Which ontology concepts belong in `GTL` now, and which should remain implicit until later?
5. What is the right first-class orchestration layer between semantic `Job` and realized `Run`?
6. How much of the cross-domain functor table should become real mapping infrastructure?

These are the main pressure points revealed by the crosswalk.
