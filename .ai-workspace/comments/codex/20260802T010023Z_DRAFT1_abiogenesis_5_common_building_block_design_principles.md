# Draft 1 — ABIogenesis 5.0 Common Building-Block Design Principles

Status: draft commentary for design review. This document is not ratified
specification, requirement, design, ticket authority, or implementation
authorization.

## 1. Purpose

ABIogenesis 5.0 is constructed by conserving the working ABIogenesis 4.6
runtime foundation, identifying its reusable modular structures, correcting
their authority seams to the 5.0 Product axioms, and composing those common
blocks into the selected feature waves.

The governing construction is:

```text
immutable 4.6 base
  -> modular composition inventory
  -> standards and axiom assessment
  -> selective 4.6 and donor adoption
  -> corrected common 5.0 building blocks
  -> typed domain adapters
  -> Wave 1 feature compositions
  -> installed Product composition
```

The work does not begin by designing a parallel 5.0 runtime, catalog, ledger,
registry, or authority system.

## 2. Governing Principles

### 2.1 The 4.6 Product is the implementation base

Immutable ABIogenesis 4.6 is working Product foundation, not merely historical
inspiration. Its modules are assessed as executable donor structures:

- retain when already conformant;
- tighten where a 5.0 axiom adds a missing constraint;
- transplant where a later branch contains a better bounded realization;
- replace only when the existing module cannot satisfy its assigned law; and
- delete when it competes with the selected authority path.

A review may not classify all 4.6 code as non-promotable merely because no
whole 5.0 feature exists in one donor cut. Promotability is evaluated per
modular relation.

### 2.2 Prime Law: modular building blocks and composition

Product behavior is constructed from complete atomic modules composed through
explicit contracts.

Each module has:

- one semantic or effect owner;
- one reason to change;
- a closed input contract;
- a closed success and refusal contract;
- one independently testable law; and
- an explicit place in the composition graph.

Composition connects immutable carriers. It does not merge authorities,
create a controller, or introduce shared mutable semantic state.

### 2.3 Common blocks are common

Generic algebra is implemented once in the common structural layer. Feature
modules compose it through typed domain adapters.

A feature does not create another dictionary, event log, Event Calculus,
registry engine, ledger engine, graph engine, selector, validator, replay
engine, or effect protocol when the common block already supplies that law.

The construction order is:

```text
common primitive
  -> typed domain adapter
  -> feature composition
  -> installed Product composition
```

### 2.4 Authority is singular across composition

For every semantic fact, the global composition identifies exactly:

| Seam | Required uniqueness |
|---|---|
| Author | one module constructs the meaning |
| Admission | one owner-controlled write seam admits it |
| Durable fact | one declared event representation records it |
| Projection | one Event Calculus law reconstructs it |
| Consumption | one typed projection contract exposes it |
| Alternatives | competing paths are deleted or internalized |

Two semantic authors, two folds, raw-scan fallback, process-local truth,
alternate append ingress, or parallel identity equations are global design
defects.

### 2.5 Durable facts and projections are distinct

The structural roles are:

```text
event log  = ordered durable source facts
dictionary = deterministic keyed fold over those facts
ledger     = typed ordered or historical projection
registry   = typed keyed lookup projection
catalog    = Product-owned typed composition over a registry projection
```

A ledger, registry, catalog, cache, retained object, or read model may project
the event log. It may not become a parallel truth author.

### 2.6 Process capability is not semantic truth

Descriptors, locks, append sinks, and process-local capabilities may authorize
effects. They do not prove that a semantic fact is admitted, current, ready,
callable, continued, retried, or closed.

Runtime truth is reconstructed from ABG-admitted durable events through Event
Calculus. Pure reads require an explicit durable coordinate, not a retained
effect owner.

### 2.7 Proportional design and Goedel restraint

The design must be globally consistent and constructable. It does not need to
prove every local implementation consequence or every property of the complete
composed system from within one design surface.

Classify unresolved questions:

| Question | Owning stage |
|---|---|
| global authority, identity, truth, lifecycle, or ownership contradiction | design correction |
| callable shape, edit order, error mapping, or migration mechanics | coding plan |
| race, failure injection, mutation, or runtime equality claim | test and falsifier |

A local uncertainty reopens design only when it produces a counterexample to a
global axiom. Design must not grow new controllers, lifecycle systems, or
recovery protocols merely to appear self-proving or exhaustive.

### 2.8 Recursive functional reference frames

Design is evaluated inside an explicitly selected reference frame. `Global`
and `local` are relative to that frame.

At the Product frame, the major functional entities define the Product:

```text
ABIogenesis 5.0
  -> event-sourced runtime truth
  -> GTL authoring and validation
  -> Graph, C, and direct HoG traversal
  -> probabilistic result integrity
```

Opening one entity creates a child reference frame. Within the runtime-truth
frame, event admission, durable history, Event Calculus, replay, typed
projections, and consumers are the major functional entities. Opening catalog
truth creates another child frame containing candidate construction, admission,
event representation, reconstruction, query, and invocation consumption.

This recursion is:

```text
Product
  -> subsystem
  -> module
  -> submodule
  -> function family
  -> algorithmic realization
```

At every frame:

- the frame declares one purpose and parent contract;
- its functional entities collectively realize that purpose;
- each entity has one cohesive responsibility and authority owner;
- sibling entities compose through explicit immutable contracts;
- internal decomposition is hidden from the parent frame; and
- a child cannot become an alternate authority for its parent or siblings.

A child frame opens only when the parent contract cannot become
decision-complete without selecting materially different child semantics.
Discovery of a local implementation question does not automatically enlarge
the active frame.

### 2.9 Functional hierarchy and generic realization are orthogonal

Functional decomposition and generic implementation are two different design
axes.

The functional hierarchy answers:

> Which functional entities compose the Product at this reference frame?

The common-realization lattice answers:

> Which recurring algorithms and patterns realize those entities?

```text
recursive functional decomposition
                x
cross-cutting generic realization
                ->
composed implementation
```

Functional entities are not generic merely because they are globally reused or
high in the hierarchy. Runtime truth, GTL validation, HoG traversal, catalog
truth, and probabilistic integrity retain ABIogenesis Product meaning.

Generic blocks are authority-neutral computer-science structures such as maps,
sets, graphs, folds, state transitions, append-only logs, selectors,
validators, transactions, parsers, serializers, strategies, and state
machines. They may realize several functional entities across several frames.
They do not acquire those entities' Product meaning or authority.

### 2.10 Recursive low coupling

Low coupling is evaluated at every reference frame:

```text
functional cohesion inward
contractual coupling sideways
authority conservation upward
generic reuse downward
```

- A child depends on its parent contract, not every ancestor implementation.
- Siblings do not inspect or mutate one another's internal state.
- Parent modules do not reach through a child's declared boundary.
- Effects cross named effect seams.
- Projections consume admitted truth rather than sibling internals.
- Common libraries contain no Product authority.
- Typed adapters bind generic algorithms to local domain meaning.

### 2.11 Cross-frame commonization

Recurring structures are assessed across functional reference frames. A
repeated shape becomes a common building block only when:

- its computational law is genuinely the same in each frame;
- it is authority-neutral;
- its admitted domain can be parameterized without semantic bleed;
- typed adapters retain local identity, authority, and refusal meaning;
- extraction removes duplicate computation without merging functional owners;
  and
- no accepted common 4.6 or donor block already supplies the law.

Similar syntax alone does not justify commonization. Conversely, a third local
implementation of a proven common law is prohibited unless a recorded design
decision explains why its domain or authority is different.

### 2.12 Reference-frame review protocol

Every design review first records:

```text
active reference frame
parent frame and parent contract
selected functional entity
direct sibling composition seams
child frame opened, if any
applicable Product axioms
prohibited competing paths
```

The review then asks:

1. Are the functional entities at this frame sufficient for its purpose?
2. Does each entity have one responsibility and authority owner?
3. Are sibling composition seams explicit and low coupled?
4. Which entities genuinely require a child reference frame?
5. Which recurring realization structures map to accepted common blocks?
6. Does any generic block contain leaked Product meaning or authority?
7. Does any child duplicate a parent or sibling authority?
8. Can a local uncertainty be deferred without admitting a materially
   different global network?

The review boundary is frozen to this frame and its direct material seams. It
does not recursively open every descendant or adjacent frame.

## 3. Common Structural Building Blocks

This section defines the candidate common-realization lattice. These blocks are
not a lower functional tier beneath Wave 1. They are cross-cutting algorithms
and patterns mapped into functional entities through typed adapters.

Common blocks own computational law only. Functional frames own Product
meaning, semantic identity, authority, lifecycle, admission choice, and typed
refusal interpretation.

### 3.1 Canonical identity

- governed URI namespace;
- canonical local key;
- canonical serializer;
- Unicode code-unit ordering;
- content digest;
- immutable reference; and
- exact-match selection.

URI namespaces identify authority domains. A typed domain adapter selects the
local semantic key. Evidence and enclosing projection scope do not silently
become additional semantic identity members.

### 3.2 Immutable collections

- typed set;
- typed dictionary;
- ordered sequence;
- multimap;
- graph adjacency map; and
- immutable snapshot.

These are values. They do not carry admission authority through object
identity, mutation, brand, or process reachability.

### 3.3 Event-sourced dictionary

The common immutable dictionary law is:

```text
namespace + missing key          -> initiate
namespace + equal key and value  -> idempotent
namespace + same key, new value  -> conflict
admitted events                  -> deterministic reconstruction
```

The block contains:

- governed namespace;
- canonical key;
- typed immutable value;
- value digest;
- transition result;
- conflict evidence;
- deterministic fold;
- immutable snapshot; and
- typed lookup.

It owns storage algebra only. A domain owner defines the key meaning, value
contract, admissible event, and typed projection.

For example:

```text
CatalogEntryDictionary<Handle, CatalogRow>
ArtifactTruthDictionary<AuthorityScope, ArtifactTruth>
InvocationDictionary<InvocationIdentity, InvocationAdmission>
```

may instantiate the same dictionary transition and fold while retaining three
different functional owners, identity domains, event adapters, and typed
projections.

### 3.4 Append-only event log

- canonical event envelope;
- event identity and admission ordinal;
- causation and correlation;
- event-contract validation;
- atomic durable append;
- canonical durable encoding;
- integrity verification; and
- exact successor coordinate.

The event log is semantic-blind durability infrastructure. It does not decide
catalog, artifact, invocation, result, continuation, retry, or closure meaning.

### 3.5 Durable-prefix coordinate

- event-log reference;
- prefix byte length;
- prefix digest;
- durable store identity;
- event-contract digest;
- exact-coordinate verification; and
- successor-coordinate construction.

The coordinate names one immutable prefix. A current store tail, retained
context, or remembered process object is not a substitute.

### 3.6 Event Calculus

- typed fluent;
- canonical fluent key;
- initiate transition;
- terminate transition;
- clip and declip transitions;
- derived-fluent rule;
- ordered fold;
- typed projection; and
- typed projection refusal.

Event Calculus is the sole runtime semantic reconstruction law. Domain-specific
registries and ledgers are typed projections or adapters over this common
folding authority, not independent raw-event interpreters.

### 3.7 State transition

- typed candidate;
- typed current projection;
- initiated result;
- idempotent result;
- conflict result;
- invalid-history result; and
- exact evidence.

The transition is pure and store-free. An effect owner may use its decision;
the Event Store may not recreate it.

### 3.8 Typed contract boundary

- closed request;
- closed success;
- closed refusal;
- structural validation;
- semantic validation; and
- contract identity.

Unknown variants, surplus fields, generic metadata, and free-form error
substitution fail closed.

### 3.9 Validation

- predicate;
- issue identity;
- issue path;
- issue accumulator;
- exact validation result; and
- fail-closed composition.

Validation is deterministic and precedes effects when invalid input must not
alter durable truth.

### 3.10 Graph

- node dictionary;
- edge set;
- adjacency index;
- start and terminal sets;
- reachability;
- structural step;
- frontier; and
- cursor.

Graph functions remain the primary constructive carrier. Imperative service
orchestration does not replace the published graph structure.

### 3.11 Selection

- candidate set;
- eligibility predicate;
- exact-match selector;
- absence;
- ambiguity; and
- typed refusal.

Selection never falls back to caller order, global latest state, adapter
preference, or process-local registration.

### 3.12 Ledger projection

- typed row;
- ordering coordinate;
- causation relation;
- history fold;
- current-state projection; and
- provenance projection.

A ledger is used where history and ordering are domain meaning. It derives from
events and does not admit them.

### 3.13 Registry projection

- governed namespace;
- typed entry contract;
- dictionary fold;
- typed lookup;
- eligibility filtering; and
- registry projection.

A registry is used where stable keyed lookup is domain meaning. It derives from
events and does not become another mutable catalog authority.

### 3.14 Effect boundary

- narrow capability;
- expected predecessor coordinate;
- effect request;
- effect result;
- successor coordinate; and
- typed effect refusal.

Effect capability authorizes only the declared effect. It does not authorize
semantic selection, read truth, or projection.

### 3.15 Replay

- exact-prefix reader;
- event decoder;
- historical validator;
- ordered replay iterator;
- projection constructor; and
- canonical equality comparator.

Equal durable prefixes under the same contracts produce equal canonical
projections in a fresh process.

## 4. Wave 1 Feature Composition

Wave 1 retains its accepted feature scope and order:

1. `A5-F10` — event-sourced runtime truth;
2. `A5-F02` — complete GTL authoring and validation;
3. `A5-F03` — complete Graph, C, and direct HoG traversal; and
4. `A5-F04` — probabilistic result integrity.

These are functional Product entities in the Wave 1 reference frame. The
common blocks listed under each feature are realization mappings, not child
Product capabilities or additional semantic owners.

### 4.0 Recursive functional hierarchy

```text
Wave 1 runtime kernel
  -> A5-F10 event-sourced runtime truth
       -> event admission
       -> durable history
       -> Event Calculus
       -> replay
       -> typed runtime projections
       -> runtime consumers
  -> A5-F02 GTL authoring and validation
       -> raw Program admission
       -> whole-Program validation
       -> Program normalization and identity
       -> GraphFunction publication
       -> complete C algebra
  -> A5-F03 Graph, C, and direct HoG traversal
       -> admitted Program selection
       -> graph materialization
       -> structural traversal
       -> implementation and interaction resolution
       -> invocation admission
       -> retry and continuation reconstruction
  -> A5-F04 probabilistic result integrity
       -> raw result admission
       -> contract and identity validation
       -> evidence and attribution validation
       -> retry classification
       -> consequential outcome projection
```

Each child may be opened as its own reference frame. Its internal decomposition
must not be pulled into the parent review unless a parent contract remains
materially ambiguous.

### 4.1 A5-F10 — Event-sourced runtime truth

Composes:

- append-only event log;
- durable-prefix coordinate;
- Event Calculus;
- event-sourced dictionary;
- ledger projection;
- registry projection;
- state transition;
- replay; and
- effect boundary.

Typed adapters provide:

- artifact truth;
- catalog truth;
- invocation truth;
- continuation truth;
- retry truth; and
- result, judgment, and closure truth.

### 4.2 A5-F02 — Complete GTL authoring and validation

Composes:

- canonical identity;
- immutable collections;
- typed contract boundary;
- validation;
- graph; and
- selection.

Typed adapters provide:

- raw Program admission;
- whole-Program validation;
- Program normalization;
- GraphFunction publication; and
- complete C algebra.

### 4.3 A5-F03 — Complete Graph, C, and direct HoG traversal

Composes:

- graph;
- state transition;
- selection;
- effect boundary;
- ledger projection; and
- replay.

Typed adapters provide:

- graph materialization;
- structural traversal;
- implementation resolution;
- interaction resolution;
- invocation admission; and
- retry and continuation reconstruction.

### 4.4 A5-F04 — Probabilistic result integrity

Composes:

- typed contract boundary;
- validation;
- canonical identity;
- state transition;
- event-sourced dictionary;
- ledger projection; and
- effect boundary.

Typed adapters provide:

- raw result admission;
- contract and identity validation;
- evidence validation;
- attribution validation;
- retry classification; and
- consequential outcome projection.

## 5. Installed Composition

Common transport adapters provide:

- installed SDK;
- installed CLI;
- JSONL codec;
- package resolver;
- manifest verifier; and
- source-independent consumer binding.

Common installed proof provides:

- clean installed package construction;
- exact-candidate identity;
- fresh-process replay;
- projection equality;
- authority-bypass negatives; and
- end-to-end composition proof.

Feature-specific transports, runtime engines, event stores, projection engines,
or proof frameworks are prohibited.

## 6. 4.6 And Donor Assessment

Each common block receives one evidence-backed disposition:

| Disposition | Meaning |
|---|---|
| retain | existing 4.6 block already satisfies the selected 5.0 law |
| tighten | retain implementation and add a bounded missing constraint |
| transplant | adopt a better conforming block from named donor code |
| replace | existing block cannot satisfy its assigned law without rival authority |
| delete | block duplicates or bypasses the selected composition path |

Assessment occurs per block and per seam. A whole branch is not promoted or
rejected as one unit.

The assessment records:

- exact source and export;
- current owner and consumers;
- contract and identity law;
- durable facts and projection path;
- 5.0 axiom conformance;
- competing implementations;
- selected disposition; and
- Wave 1 dependency.

## 7. Global Composition Review

The composed system is reviewed through one authority-seam ledger:

| Semantic fact | Sole author | Admission seam | Durable event | Projection | Consumer | Competing path disposition |
|---|---|---|---|---|---|---|
| Product candidate truth | Product owner | owning Product contract | none until runtime use | immutable Product carrier | ABG owner | reject inferred/store-authored Product truth |
| Catalog entry truth | Product catalog owner | ABG catalog admission | typed registry event | Event Calculus registry projection | catalog/read/invocation owners | delete raw scans and mutable registries |
| Artifact truth | owning Product operation | checked artifact admission | typed artifact event | Event Calculus artifact projection | Product/HoG/Public owners | delete store and WeakMap answers |
| Invocation truth | invocation owner | ABG invocation admission | invocation event | invocation projection | HoG/continuation/closure | delete process-local uniqueness |
| Durable currentness | ABG Event Store | expected-prefix effect seam | append-only bytes | durable coordinate | effect owner and replay | delete global-tail and remembered-currentness paths |

The final ledger is completed from live 4.6, current 5.0, and donor code. The
rows above state the required form, not a completed implementation finding.

Global review is performed relative to the active reference frame. At the Wave
1 frame it proves uniqueness and conservation across the four feature
compositions. At a child frame it proves uniqueness across that module's direct
functional entities. It does not require every parent review to restate every
descendant's internal authority ledger.

The composed design carries two linked mappings:

```text
functional entity
  -> child functional composition

functional entity or child seam
  -> common block
  -> typed adapter
  -> implementation module
```

The first preserves Product meaning. The second enables reuse without turning
the common library into a semantic center.

## 8. Review Stopping Rule

A design candidate is acceptable when:

- the active reference frame and parent contract are explicit;
- its direct functional decomposition is cohesive and low coupled;
- every common block has one owner and one law;
- every feature is an explicit composition of common blocks and typed adapters;
- the global authority-seam ledger has no competing truth path;
- the composition has no known Product or requirement counterexample;
- the construction is realizable from classified 4.6 and donor code; and
- unresolved local questions are correctly assigned to planning or tests.

An accepted child boundary is cited rather than reopened. A local implementation
finding reopens its smallest owning child frame only when it falsifies that
frame's accepted contract or produces a parent-level axiom counterexample.

Design review stops at that point. It does not continue iterating to eliminate
every local implementation choice.

Implementation does not begin from this Draft 1. The next design-meeting step
is to review and amend these principles, then perform a read-only 4.6 and donor
building-block assessment under the accepted version of this framework.
