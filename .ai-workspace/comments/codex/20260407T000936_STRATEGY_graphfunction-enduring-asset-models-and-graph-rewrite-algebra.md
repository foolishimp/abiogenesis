# STRATEGY: GraphFunction Enduring Asset Models And Graph-Rewrite Algebra

**Author**: codex
**Date**: 2026-04-07T00:09:36+1000
**Addresses**: cumulative-environment graph functions, recursive carrier publication, candidate-family selection, disjoint-write scheduling, provenance, and invalidation
**For**: all

## Summary

`GraphFunction` should be modeled as a lawful work package operating over an
enduring graph of dependent assets, not as a stateless pipeline stage passing
ephemeral outputs. The strongest real-world models are staged construction,
developmental biology, metabolic reaction systems, and incremental build
systems; the strongest mathematical model is typed graph rewriting layered with
fixed-point and worklist reasoning.

This matters because the algebra should encode the world these models imply:
cumulative environment closure, local revisitation, first-class alternative
continuations, conservative scheduling on writers, and provenance that preserves
causal structure. If those properties are real, they should be enforced in GTL
and ABG rather than left as author intuition.

## Position

The right mental model for `GraphFunction` is not:

- a stateless function in a pipeline
- "previous step output" piped into "next step input"
- one-shot DAG derivation with no lawful revisitation

The better model is:

- lawful work over an enduring world of dependent assets
- repeated local construction and refinement over a persistent graph
- cumulative world-state carried forward unless a contract explicitly narrows it

That gives the direct reading of `GraphFunction.environment`:

- `requires` — typed world-state that must already exist
- `provides` — typed world-state newly introduced or refined by the work
- `carries` — cumulative typed world-state available after lawful closure

This is not inventing an alien shape. It is a generalization of known natural,
engineered, and mathematical systems.

## Real-World And Evolved Models

### 1. Staged Construction

The most practical intuition is a building under construction.

The shared structure contains:

- foundations
- columns and cores
- floor plates
- services risers
- fit-out packages
- inspections
- punch lists

Each of those is an asset or asset family in one dependency graph. Each trade
package is a `GraphFunction`.

The package does not consume only "the previous output". It depends on the
whole lawful site state:

- what already exists structurally
- what interfaces are exposed
- what inspections already passed
- what design decisions remain active
- what local region is safe to modify

Mapping:

- building under construction -> enduring asset graph
- trade package -> `GraphFunction`
- trade prerequisites -> `environment.requires`
- newly completed work -> `environment.provides`
- usable site state after completion -> `environment.carries`

This also explains revisitation. Real construction is not one top-to-bottom
pass. Teams come back:

- to fit out the next level
- to connect later services into earlier infrastructure
- to remediate failed inspection items
- to extend the same lawful package over another region

That is why composition must be cumulative world-state composition rather than
immediate output piping.

### 2. Developmental Biology

The strongest natural analogy is developmental biology.

An organism is not assembled by a linear output chain. It develops through
local lawful transformations acting on a shared accumulating state.

Useful parallels:

- genome or regulatory program -> declared workflow law
- enzyme or developmental program -> `GraphFunction`
- tissue, organ, or differentiated structure -> asset
- local structural and chemical preconditions -> `environment.requires`
- newly expressed or built structure -> `environment.provides`
- viable organism state after the step -> `environment.carries`

This model captures:

- local work repeated across many regions
- earlier structure remaining part of the living world-state
- later work depending on bindings established much earlier
- recursive local growth as normal rather than exceptional
- coordination through declared dependencies and local conditions rather than
  one hidden central controller

### 3. Metabolic / Reaction Systems

Chemistry gives the cleanest intuition for scheduling.

In a reaction network:

- reactions fire when substrates are present
- products accumulate and change what can happen next
- many reactions may proceed concurrently when they do not conflict
- some reactions compete for scarce substrate or write territory

Mapping:

- substrate availability -> `environment.requires`
- products -> `environment.provides`
- cumulative chemical state -> `environment.carries`
- reaction dependency network -> asset graph
- lawful concurrency -> disjoint-write territory

This is the source of the conservative scheduling rule:

- read overlap is normal
- write overlap is dangerous
- implicit merge semantics should not be invented

### 4. Incremental Build Systems

Known build systems already capture a narrower special case of the same idea.

Useful precedents:

- `make` style dependency graphs
- incremental builders such as Bazel or Buck
- hermetic/content-addressed systems such as Nix
- compilers that revisit invalidated dependency regions

Their common pattern is:

- one enduring graph of artifacts and dependencies
- local build actions that become ready when prerequisites hold
- invalidation when upstream truth changes
- rebuilding only affected regions
- conservative scheduling around shared outputs

Mapping:

- artifact graph -> enduring asset graph
- build action -> `GraphFunction`
- declared prerequisites -> `environment.requires`
- produced artifact set -> `environment.provides`
- valid workspace after closure -> `environment.carries`

The difference is that classic build systems often flatten the world to an
acyclic artifact DAG and treat each action as one-shot derivation. The GTL/ABG
line wants the stronger form:

- assets richer than files
- recursive local revisitation
- the same lawful package reused over many regions
- partial convergence as normal
- multiple candidate continuations before explicit selection

So the claim is not that GTL/ABG is unlike build systems. The claim is that it
generalizes them from acyclic artifact derivation to typed recursive
construction over a persistent governed world-state.

## Mathematical Formalizations

No single mathematical formalism captures the whole system. The best match is a
stack.

### 1. Order Theory And Fixed Points

Treat the enduring asset world as a partially ordered state space.

One state is "greater" than another when it contains more lawful constructed
truth, more closure, or a more converged version of the same governed assets.

Then a `GraphFunction` is an operator over that state space, and repeated
application moves the world toward a lawful fixed point.

This also gives a cleaner model for gap analysis.

The gap is not merely "missing outputs".

It is an intent-governed gradient between:

- the current governed asset state
- the target asset state implied by intent, product law, and active
  requirements

That means gap analysis can be understood as ordered constructive distance, not
just set subtraction.

Intent determines which deltas count as real progress, which regressions reopen
constructive territory, and which alternate intermediate states are still
lawful on the path toward closure.

This explains:

- convergence
- gap analysis as a gradient over lawful progress
- revisitation
- correction followed by renewed progression
- repeated bounded application until no relevant delta remains

### 2. Worklist / Dataflow Solvers

This is the best operational analogy.

Facts live on a graph. Local transfer functions update the graph. A scheduler
revisits affected regions until the system stabilizes.

Mapping:

- assets as graph-resident facts or structures
- graph functions as transfer functions
- recursive or repeated execution as worklist reprocessing
- convergence as fixed-point stabilization

### 3. Typed Graph Rewriting

This is the strongest single mathematical analogue.

In a graph-rewrite system, the graph is the world. A rule does not merely
compute a value. It says:

- find a lawful local pattern in the current graph
- replace or refine that pattern with another lawful pattern
- preserve the declared interface to the surrounding graph

The classic components are:

- left-hand side pattern — what must already be present
- right-hand side pattern — what structure is introduced or refined
- interface or boundary map — what remains connected to the outside world

Direct mapping:

- match precondition -> `environment.requires`
- newly constructed subgraph -> `environment.provides`
- preserved and accumulated surrounding world -> `environment.carries`

This makes the enduring asset graph idea precise. The world is not a sequence
of transient outputs. It is a typed graph under repeated lawful local rewrite.

Graph rewriting explains several properties that otherwise look awkward in
pipeline language.

Local refinement:

- one coarse published carrier can refine into richer internal structure
- public `GraphFunction` carrier and internal `GraphVector` structure fit this
  naturally

Revisitation:

- earlier regions may be revisited after later structure changes the lawful
  next move

Parallelism with limits:

- two rewrites may proceed concurrently when they affect disjoint territory
- overlapping rewrites require stronger reasoning or must be serialized

Alternative futures:

- one graph may admit multiple lawful next rewrites
- that is the clean model for candidate families, explicit selection, and
  branch-local continuation

The main formal questions are the same ones the algebra should care about:

- matching — where does a rule lawfully apply?
- confluence — do different rewrite orders converge?
- termination — does rewriting close?
- critical pairs — where do two rules overlap or conflict?
- strategy — which lawful rewrite do we choose next?
- causal history — what rewrites made later rewrites possible?

Wolfram's popularization is useful for emphasizing that:

- simple local rewrite rules can generate rich global structure
- different rewrite orders may preserve the same deeper causal order
- the history of rewrites forms its own graph
- multiple possible futures can coexist until a path is selected

The useful import here is narrower:

- local lawful rules can build large durable structures
- provenance should preserve causal structure
- alternate candidate evolutions should be explicit rather than hidden

### 4. Petri Nets And Reaction Networks

Petri-net-like models capture:

- readiness
- blocking
- concurrency
- sequencing under shared dependencies

They are less expressive than the full asset model, but they strongly justify
fail-closed scheduling on overlapping writers.

### 5. Interface-Level Category Theory

Category theory is useful at the interface layer, not as the whole operational
model.

It helps express:

- composition over stable outer contracts
- lawful higher-order construction
- recursion and refinement while preserving declared boundaries

Its main value here is keeping the publication and composition algebra coherent.

## Algebraic Consequences

If the models above are real, the algebra should enforce them.

### 1. GraphFunction Is A Typed Local Rewrite Law

`GraphFunction` should be treated as a published lawful transformation over a
typed region of the world graph.

Its contract is not merely input/output naming. Its contract is:

- what local world-state must exist
- what new or refined structure it may introduce
- what cumulative world-state remains after closure

### 2. Composition Is World-State Composition

Do not define composition as:

- `f.outputs == g.inputs`

Define it as:

- `g.environment.requires` must be satisfied by `f.environment.carries`

That is the construction-site, developmental-biology, and graph-rewrite law.

### 3. Carry-Forward Is Immutable By Default

Earlier lawful bindings remain present in the carried environment unless the
contract explicitly narrows them.

This prevents hidden loss of world-state.

### 4. Completion Is Fixed-Point Closure

Some work is only complete when no further lawful productive rewrite remains
for the governed region or target outcome.

That is stronger than "the last function returned successfully".

It also means the system should be able to distinguish:

- raw difference between assets
- intent-relevant constructive gap
- lawful closure under the active governing surface

### 5. Conflicting Writes Fail Closed

Two graph functions that claim incompatible new truth over the same write
territory must not be silently merged.

This is the critical-pair law in graph-rewrite terms.

### 6. Public Carriers Name Work Packages, Not Internal Adjacencies

Public semantic entry belongs to `GraphFunction`. Internal execution structure
belongs to `GraphVector`.

`graph_function_for_vector(...)` is lawful only because it publishes one vector
as a public work package without making bare vectors the public carrier.

### 7. Recursion Is Local Reapplication Over A Shared World

Recursion is not a disguised imperative loop. It is lawful repeated work over a
persistent region of world-state with:

- explicit termination
- explicit fold-back or rebind law
- preserved lineage
- cumulative environment still in force

### 8. Candidate Families And Selection Are First-Class

When multiple rewrites are lawful, the system should make that explicit through:

- candidate families
- selection decisions
- branch-local continuation

This is preferable to hidden control flow that silently chooses one path.

### 9. Scheduling Is Conservative

Parallelism should be authorized by declared structure:

- read overlap is fine
- write overlap is a conflict
- disjoint writers may batch

### 10. Provenance Preserves Causal Structure

If later work depends on earlier rewrites, the lineage should preserve that
fact explicitly.

In graph-rewrite terms, the runtime should preserve a causal graph rather than
only a flat log of events.

### 11. Invalidation Reopens Affected Regions

When upstream truth changes, the right response is selective reopening of the
affected constructive region, not global reset.

That is how:

- build systems invalidate downstream artifacts
- organisms repair local tissue
- fixed-point solvers requeue affected regions

## Anti-Models

The wrong mental models for this line are:

- unix pipe of ephemeral outputs
- stateless function chaining
- one-shot DAG builder with no lawful revisitation
- hidden controller that knows the "real" world-state outside published
  surfaces
- optimistic parallel merge over overlapping writers
- recursion as imperative loop disguise

## Recommended Action

1. Treat this post as a review lens for GTL/ABG algebra and builder ergonomics, not as authority by itself.
2. Use typed graph rewriting plus fixed-point/worklist reasoning as the main explanatory frame for cumulative-environment graph functions.
3. Evaluate publication, recursion, scheduling, provenance, and invalidation changes against the algebraic consequences above.
4. Promote only the parts that survive code, req, ADR, and scenario review into constitutional or tenant design surfaces.
