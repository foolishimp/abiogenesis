# Manifesto For Driving AI-Authored Coding From Programming Basics

Status: raw commentary. This is a statement of working principles, not
specification, requirement, design, ticket, or acceptance authority.

## The Starting Point

This is not rocket science. It is programming basics.

Start with:

1. What are the entities of the system?
2. What is the lifecycle of each entity?
3. What is the one allowable truth for each entity transformation?

Do not start with files, services, frameworks, APIs, tickets, test harnesses,
or abstractions. Those are realization choices below the entity and lifecycle
model.

## One Truth For Entity Transformation

For every entity, make the following exact:

- entity identity;
- lawful lifecycle states;
- candidate commands or proposed transformations;
- the one transition law that decides whether a candidate is lawful;
- the one owner allowed to admit the accepted transformation;
- the durable event that records the admitted transformation;
- the projection that reconstructs current lifecycle truth;
- the consumers permitted to read that projection; and
- terminal states and prohibited transitions.

The authoritative path is:

```text
candidate transformation
  -> one entity transition law
  -> one admission authority
  -> one admitted durable event
  -> one reconstructive projection
```

There cannot be two modules independently deciding whether the same entity is
created, active, closed, replaced, failed, or invalid. That is not redundancy;
it is competing truth.

Object instances, object brands, caches, registries, controllers, current
store tails, test fixtures, and caller-held state may support mechanics. They
cannot decide entity lifecycle truth.

## The Programming Model

The approach combines:

- Domain-Driven Design for entities, identities, semantic owners, aggregates,
  and bounded contexts;
- functional programming for immutable values and pure transition functions;
- event sourcing for admitted transformations as durable facts;
- functional reactive programming for pure projections and reactions over the
  admitted event stream;
- Event Calculus for initiation, termination, inertia, clipping, declipping,
  and `HoldsAt`;
- typestate and state-machine reasoning for lawful lifecycle transitions;
- hexagonal boundaries for isolating storage, transport, and effects; and
- a functional core with a narrow imperative shell.

A useful name is:

> Authority-conserving, entity-centric, event-sourced functional reactive
> domain modeling.

The entity is not primarily a mutable object containing current truth. It is:

```text
stable entity identity
+ immutable admitted history
+ pure transition and projection law
= reconstructable lifecycle state
```

## Functional Reactive Authority

The reactive path is:

```text
admitted event stream
  -> pure incremental transformations
  -> immutable lifecycle projections
  -> dependent reactions
```

The full cycle is:

```text
command
  -> pure entity transition decision
  -> authoritative admission
  -> durable event
  -> reactive projection
  -> consumer reaction
  -> optional new command
```

A reaction cannot mutate lifecycle truth directly. It may issue another
candidate command, which must return through the entity's sole transition and
admission path.

This is the authority distinction ordinary FRP often leaves implicit:

- signals and projections describe change;
- admitted history determines which changes are true;
- projections react to truth but do not author truth; and
- effects return through lawful commands and admission.

## Recursive Functional Decomposition

Design is recursive by reference frame:

```text
Product
  -> subsystem
  -> module
  -> submodule
  -> function family
  -> algorithmic realization
```

`Global` and `local` are relative to the active frame. At the Product frame,
global entities are the major functional components defining the Product. At
a module frame, its own functional entities and lifecycle relations are
global to its children.

Each frame identifies:

- its parent contract;
- its functional entities;
- entity identities and lifecycles;
- semantic owners;
- direct composition seams;
- applicable axioms; and
- prohibited competing paths.

Open a child frame only when its internal distinctions matter to closing the
parent contract. Do not recursively expand every possible detail before useful
code can be delivered.

## Common IT Building Blocks

Across recursive functional frames, look for recurring computational patterns:

- canonical serialization;
- hashing and identity mechanics;
- immutable value construction;
- exact-match selection;
- validation;
- graph algorithms;
- state transitions;
- append-only logs;
- immutable event-prefix selection;
- Event Calculus folds;
- dictionary, registry, and ledger projections;
- replay;
- effect boundaries; and
- deterministic ordering.

These are common IT building blocks. Computer science has spent decades
identifying these algorithms, structures, libraries, and design patterns.

Common building blocks own algorithms. They do not own Product meaning.
Entities retain their identities, lifecycle, authority, admission, refusal,
event, and projection semantics through typed adapters.

The composition is:

```text
recursive functional entity model
                x
cross-cutting common algorithm library
                ->
typed composed implementation
```

Prime law is modular building blocks and composition. Do not grow a new
controller, framework, registry, lifecycle system, or semantic service where a
small common algorithm and a typed owner adapter close the relation.

## Lawful Technology Stack

Once the technology stack is selected, every new algorithm must either:

1. select a technology already on the lawful stack; or
2. propose an explicit addition to the stack before coding.

Technology selection alone is not enough. Every technology has a bounded role.
For example:

- a filesystem library may provide descriptor and durability mechanics;
- a cryptographic library may hash already selected canonical bytes;
- an event store may admit, order, persist, and reopen events;
- an Event Calculus library may fold an explicit immutable event prefix; and
- typed domain adapters may supply entity and lifecycle meaning.

A lawful technology used in an unlawful role is still a design defect.

An event store must not select projection truth. An Event Calculus projector
must not receive a mutable store and choose its own current history. The lawful
relation is:

```text
explicit validated immutable prefix
  -> pure Event Calculus fold
  -> typed immutable projection
```

## Common Library Catalog

The libraries built above the technology stack also require one visible,
controlled list. Otherwise every AI coding pass can create another locally
reasonable helper and open a parallel seam.

The realization hierarchy is:

```text
entity lifecycle law
  -> typed functional-owner adapter
  -> registered common library function
  -> lawful technology
```

Or, from the substrate upward:

```text
lawful technology
  -> one registered authority-neutral common library function
  -> typed domain-owner adapter
  -> admitted event or reconstructive projection
```

Every algorithm in a coding plan must declare one of:

- reuse an existing catalog function;
- extend one catalog function without changing its cohesive law; or
- propose a new catalog function.

A proposed addition must establish:

- the exact computational gap;
- why no existing catalog entry supplies it;
- its deterministic input/output law;
- its selected technology substrate;
- its authority-neutral boundary;
- its prohibited semantic roles;
- its typed adapters and consumers;
- why extension of an existing function would violate cohesion;
- the competing helpers that will be reused, deleted, or internalized; and
- proportional module and composition proof.

No new algorithm is coded merely because it is easy to write. Equivalent local
folds, selectors, canonicalizers, transition engines, registries, ledgers, or
store adapters are competing seams.

## The AI Coding Contract

An AI coding plan must trace every edited function through:

```text
entity
+ lifecycle transition or projection
+ functional owner
+ registered common library relation
+ selected lawful technology
+ exact input authority
+ exact output carrier
+ prohibited calls and state
+ direct consumers
```

The AI may choose local mechanics only inside that boundary. It does not invent
a second lifecycle, identity, controller, projection, registry, transition
engine, or authority seam to make the code convenient.

Before proposing a new helper, the AI searches the affected dependency cone
for an equivalent registered or local implementation. Before proposing a new
dependency, it proves the lawful stack cannot supply the required function.

The review asks:

1. Is this the correct entity and lifecycle?
2. Is there exactly one transformation truth path?
3. Is the function using an approved common algorithm?
4. Is that algorithm using an approved technology in its approved role?
5. Has any parallel semantic or algorithmic seam been introduced?
6. Can the state be reconstructed from admitted history in a fresh process?
7. Is the design and proof proportional to the local change?

## Proportionality And Convergence

Global correctness does not require proving the entire system inside every
local design. Freeze the active reference frame and its direct dependency cone.

- Global entity, authority, identity, lifecycle, and composition decisions
  belong in design.
- Semantically equivalent callable placement and local mechanics belong in the
  coding plan.
- Mutation, interleaving, failure, restart, and equality propositions belong
  in tests.

Once the global relation is correct, iterate locally. Do not repeatedly reject
a correct global composition for narrow implementation choices that can be
resolved through code and tests.

After two rejected candidates at the same boundary, stop forward repair and
ask whether:

- the reference frame is wrong;
- a common block was overlooked;
- the issue belongs in coding or testing rather than design; or
- the process is expanding uncertainty instead of reducing it.

The purpose of governance is to make delivery reliable and fast. It must stop
drift, duplicate authority, and cancerous abstraction growth without turning
ordinary programming into an endless approval exercise.

## The Delivery Loop

```text
entity and lifecycle map
  -> common-block and technology selection
  -> donor and external implementation review
  -> proportional design delta
  -> coding plan
  -> code
  -> code review
  -> module and composition tests
  -> accept
  -> next slice
```

Each slice delivers working behavior. The codebase converges toward one
composed system because every entity has one lifecycle truth, every common
algorithm has one registered seam, and every technology has one lawful role.
