# ABIogenesis 5.0 Realization Constitution

**Status**: Operative local realization authority

**Scope**: ABIogenesis 5.0 TypeScript design, coding, review, testing, and
delivery

**Selected method**: immutable STDO `v2.2.2`, commit
`0519129d63de10822ae6353fa0c5ce05d56f13e9`, member-set digest
`4cc6a10fca6b1a2c6991664d2a7ee19220401d95f3f1c0f4fa848c6a9ed81c21`

## 1. Authority And Purpose

This document is the sole ABIogenesis-local disambiguation of STDO `v2.2.2`
for AI-authored realization. It governs how accepted ABIogenesis Product,
requirement, and design truth becomes code without opening competing semantic,
algorithmic, technology, or review seams.

Authority flows:

```text
GOALS
  -> INTENT
  -> PRODUCT
  -> requirements
  -> accepted TypeScript functional design
  -> this realization constitution
  -> active ticket selection
  -> coding plan
  -> code
  -> events
  -> projections
  -> tests and installed proof
```

Specification remains constitutional `WHAT`. Accepted M03/M05 and other
selected TypeScript design remains functional `HOW`. STDO remains the selected
method. This constitution disambiguates local realization and review; it does
not reprice Product meaning, override requirements, amend STDO, or replace an
accepted functional design.

If this document conflicts with a higher authority, the higher authority wins
and work stops at the smallest lawful re-entry point. Tickets, bootstraps,
comments, code, tests, generated views, and precedent cannot override this
surface.

## 2. Provenance

This constitution compresses and ratifies the locally selected substance of:

- STDO `v2.2.2` installed method surfaces;
- T-287 recursive-frame and proportional-delivery refinement;
- immutable `v4.6.0-rc.3` conservation and donor assessment;
- Phase 0 structural assessment and lawful-stack review;
- the raw manifesto
  `.ai-workspace/comments/codex/20260802T032426Z_MANIFESTO_driving_ai_authored_coding_from_programming_basics.md`,
  object `e64e0327ff6be495758d601c96417e57f176eb69`; and
- the worker/assessor review trail
  `.ai-workspace/comments/codex/20260802T024114Z_ASSESSMENT_t287_wave1_phase0_and_first_holdsat_plan.md`.

Those posts retain rationale and evidence. This document alone carries their
ratified local realization rules.

## 3. Core Position

Start with programming basics:

1. identify the entities of the system;
2. define the lifecycle of each entity; and
3. select one allowable truth path for each entity transformation.

Do not begin from services, files, frameworks, controllers, APIs, tickets, or
test harnesses. Those are subordinate realization choices.

The governing relation is:

```text
candidate transformation
  -> one entity transition law
  -> one admission authority
  -> one admitted durable event
  -> one reconstructive projection
```

Two modules may not independently decide whether the same entity is created,
active, closed, replaced, failed, or invalid. Object identity, brands, caches,
registries, controllers, current store tails, caller state, and fixtures may
support mechanics; none may author entity lifecycle truth.

## 4. Programming Model

ABIogenesis realization is authority-conserving, entity-centric,
event-sourced functional reactive domain modeling.

It combines:

- Domain-Driven Design for entities, stable identity, semantic ownership, and
  bounded contexts;
- functional programming for immutable values and pure decisions;
- event sourcing for admitted transformations as durable facts;
- functional reactive programming for projections and reactions over admitted
  event streams;
- Event Calculus for initiation, termination, inertia, clipping, declipping,
  and `HoldsAt`;
- typestate reasoning for lawful lifecycle transitions;
- hexagonal boundaries for storage, transport, and effects; and
- a functional core with a narrow imperative shell.

An entity is:

```text
stable entity identity
+ immutable admitted history
+ pure transition and projection law
= reconstructable lifecycle state
```

The reactive cycle is:

```text
command
  -> pure transition decision
  -> authoritative admission
  -> durable event
  -> reactive projection
  -> consumer reaction
  -> optional new command
```

A reaction never mutates lifecycle truth directly. It returns through the
entity's sole command, transition, and admission path.

## 5. Recursive Reference Frames

Functional design decomposes recursively:

```text
Product
  -> subsystem
  -> module
  -> submodule
  -> function family
  -> algorithmic realization
```

`Global` and `local` are relative to the selected frame. Every active frame
declares:

- parent contract;
- purpose and functional entities;
- entity identity and lifecycle relations;
- semantic owners;
- direct sibling composition seams;
- applicable axioms; and
- prohibited competing paths.

A child frame opens only when a material child distinction is necessary to
close its parent. Reviews freeze the active frame and its direct dependency
cone; adjacent findings are classified rather than silently expanding scope.

## 6. Entity Lifecycle Register

Every entity row must name identity, states, candidates, transition law,
admission owner, durable facts, projection, consumers, terminal law, and
competing-path disposition. No implementation slice begins without its
applicable rows.

### 6.1 Run

| Field | Law |
|---|---|
| identity | exact `runId` admitted with its invocation and execution basis |
| states | `not_open`, `active`, `closed`, `stopped`, `failed` |
| candidates | admitted invocation/basis opening, lawful closure, attributed stop, runtime failure |
| transition | `not_open -> active`; `active -> closed | stopped | failed` |
| admission owner | ABG runtime-event admission |
| durable facts | `run_segment_opened`, `run_closed`, `run_stopped`, `runtime_failure_observed` |
| projection | typed Event Calculus `HoldsAt` over an explicit validated immutable event prefix |
| consumers | replay, bounded ABG admission guards, typed Public projections, HoG continuation/closure consumers |
| terminal law | no terminal Run may be treated as active or admit another active-only transformation |
| competing paths | raw terminal-kind absence scans, process-local brands, caller-held Run state, and private fluent folds are deleted or internalized |

### 6.2 Register-extension rule

Before a slice touches another entity, add or select its complete row here.
One row may reference an accepted functional design for detailed carrier
fields, but it may not leave identity, transition ownership, event truth, or
projection ownership implicit.

## 7. Functional Hierarchy And Common Lattice

Functional entities own ABIogenesis meaning. Cross-cutting common components
own reusable authority-neutral computation.

```text
recursive functional entity model
                x
cross-cutting common algorithm library
                ->
typed composed implementation
```

Functional cohesion is inward. Sibling coupling is contractual. Authority is
conserved upward. Generic reuse occurs only through typed owner adapters.

The realization hierarchy is:

```text
entity lifecycle law
  -> typed functional-owner adapter
  -> registered common library relation
  -> lawful technology
```

## 8. Immutable 4.6 And Donor Adoption

Immutable `v4.6.0-rc.3` is the presumptive implementation foundation:

```text
retain conforming 4.6 relation
  -> tighten for an exact 5.0 axiom delta
  -> transplant a bounded superior donor relation
  -> externally adopt an established authority-neutral implementation
  -> replace only on a demonstrated counterexample
  -> delete a competing or bypassing path
```

Promotability is assessed per modular relation, never by accepting or rejecting
a whole branch. Donor code carries no authority merely because it previously
worked or passed tests.

## 9. Lawful Technology Stack

Every technology has one bounded role.

| Technology | Lawful function | Prohibited authority or coupling |
|---|---|---|
| Node `node:fs` | file, descriptor, stat, fsync, truncate, and lock-file mechanics behind the event-store owner | event meaning, projection, lifecycle, or identity |
| Node `node:crypto` | SHA-256 over already selected canonical bytes | selecting semantic preimages or re-minting identity |
| current canonical JSON/digest helpers | canonical byte and digest mechanics for typed owner-selected values | domain identity ownership or downstream normalization |
| current `AbgEventStore` | sole runtime-event admission, ordered durable append, exact reopen, and immutable snapshot production | projection law, `HoldsAt`, domain lookup meaning, or semantic currentness |
| immutable 4.6 typed Event Calculus kernel | pure fold of an explicit immutable validated event prefix | store access, prefix/current-tail selection, append, actors, or caller-configurable Product axioms |
| native frozen records, arrays, `Map`, and `Set` | bounded internal immutable values and indexes with explicit canonical ordering | object identity as truth or implicit iteration order as semantic identity |
| typed Product/GTL/HoG/ABG adapters | domain identity, contract, transition, admission, lifecycle, refusal, event, and projection meaning at declared owner seams | rebuilding common algorithms or delegating semantic ownership to generic code |

No SQLite, LevelDB, EventStoreDB/Kurrent, XState, Immutable.js, Ajv, new event
framework, or new generic registry, ledger, or store enters Wave 1 without a
demonstrated requirement counterexample and lawful re-entry.

A lawful technology used outside its registered role is a design defect.

## 10. Common Library Catalog

The catalog prevents lawful technologies from supporting competing project
seams.

| Relation | Selected callable or location | Exact role | Prohibited role | Status |
|---|---|---|---|---|
| canonical value serialization | `shared/canonical_json.ts` | typed selected value to deterministic canonical bytes | selecting semantic fields or normalizing admitted identity | retained |
| canonical digest | `shared/digests.ts` | selected canonical value/bytes to SHA-256 | choosing preimage or downstream identity re-minting | retained |
| immutable carrier construction | `shared/immutable.ts` and typed constructors | detach, copy, freeze, and expose bounded values | branding/currentness or semantic admission | retained |
| exact-match cardinality | `product/exact_match.ts` | report `absent | one | many` for owner-supplied candidates/predicate | domain predicate, fallback, or first-match authority | retained |
| durable runtime-event admission | `abg/event_store.ts` | validate envelope, assign ordinal, durably append, reopen, snapshot | domain projection or lifecycle truth | retained |
| validated immutable event-prefix selection | `selectValidatedRuntimeEventPrefix` in selected ABG prefix module | explicit immutable snapshot/scope to validated ordered causal prefix | store access, current-tail selection, append, or semantic fold | accepted first-slice addition |
| typed Event Calculus projection | `deriveRuntimeEventCalculusProjection`, `holdsAt`, typed fluent/pattern helpers | validated immutable prefix plus closed module law to immutable projection/query | store access, prefix selection, admission, actors, or caller axioms | accepted first-slice addition |
| replay projection composition | `abg/replay.ts` | compose typed reconstructive read models from one selected prefix | events, effects, identity, or rival fluent folds | retained and incrementally tightened |

### 10.1 New algorithm rule

Every algorithmic function in a coding plan declares exactly one:

- `catalog_reuse`;
- `catalog_extension`; or
- `catalog_addition_proposal`.

An addition proposal states:

1. recurrence or exact gap proving no entry supplies the function;
2. deterministic computational law and input/output contract;
3. lawful technology substrate;
4. authority-neutral and prohibited semantic roles;
5. typed adapters and consumers;
6. why extension would violate cohesion;
7. equivalent helper/export reuse, deletion, or internalization; and
8. proportional module and composition proof.

No addition is coded before plan acceptance. Equivalent local folds,
selectors, canonicalizers, transition engines, registries, ledgers, and store
adapters are prohibited.

## 11. Mandatory Coding-Plan Trace

Every edited function traces through:

```text
entity
+ lifecycle transition or projection
+ functional owner
+ catalog reuse, extension, or addition
+ lawful technology
+ exact input authority
+ exact output carrier
+ prohibited calls and state
+ direct consumers
+ competing path disposition
+ proportional proof
```

A plan fails if any link is absent, ambiguous, duplicated, or assigns a
component a role outside Sections 9 and 10.

## 12. Design And Review Rules

### 12.1 One truth

- ABG-admitted durable events plus Event Calculus are the sole runtime truth.
- Projection, replay, and reads reconstruct; they never author truth.
- Effect capability permits effects, not semantic currentness.
- Concrete functional owners remain directly composed.
- One semantic fact has one admission and one projection path.

### 12.2 Proportional completeness

Design decides entity identity, lifecycle, authority, ownership, public
contract, and materially non-equivalent composition within the frozen frame.
Semantically equivalent callable placement and local mechanics belong in the
coding plan. Mutation, interleaving, restart, failure, and equality propositions
belong in tests.

Global correctness does not require proving the whole Product inside every
local design. Once the global relation is coherent, local choices progress
through code and tests.

### 12.3 Separate verdicts

Every review records independently:

| Verdict | Question |
|---|---|
| design | Is the target entity, lifecycle, authority, and composition coherent? |
| constructability | Can selected substrates realize it? |
| implementation | Is it realized without a competing path? |
| proof | Does the exact installed subject establish the behavior? |

### 12.4 Rejection convergence

After two rejected candidates on one frozen boundary, stop forward repair and
reassess frame altitude, overlooked common blocks, misplaced coding/test
questions, and whether method use is expanding rather than contracting
uncertainty. No third forward design repair proceeds without this reset.

## 13. AI Worker And Assessor Contract

The worker owns bounded construction and implementation. The F_H proxy owns
independent review and routine advancement.

At every reviewable transition:

1. the worker publishes one complete commentary post containing evidence,
   verdict, exact subject, findings, non-changes, and an empty
   `Assessor Disposition`;
2. the assessor independently checks live authority, code, and proof;
3. the assessor appends findings and advancement to that same post; and
4. the worker advances only within the appended authorization.

Chat is notification, not the durable review trail. Commentary is evidence,
not authority. This constitution and the active ticket select work.

The assessor reports findings to Product control when it sends them to the
worker. Routine locally determined advancement does not wait for human
approval. Only an actual Product choice, upstream constitutional conflict, or
material authority re-entry returns to direct human decision.

## 14. Delivery Cycle

```text
select entity and lifecycle row
  -> select common catalog relations and lawful technologies
  -> review 4.6, current, donor, and external implementations
  -> design only the exact material delta
  -> coding plan with mandatory trace
  -> assessor approval
  -> build
  -> worker self-review and transition post
  -> independent code review
  -> module and composition tests
  -> accept the slice
  -> next entity or lifecycle relation
```

Each slice delivers working installed behavior. Paperwork, code volume, test
count, commit count, review count, and repeated proof of an accepted witness
are not Product progress.

## 15. Active Wave 1 Application

Wave 1 delivers:

1. `A5-F10` event-sourced runtime truth;
2. `A5-F02` complete GTL authoring and validation;
3. `A5-F03` complete Graph, C, and direct HoG traversal; and
4. `A5-F04` probabilistic result integrity.

The first selected slice is the Run-lifecycle `HoldsAt` vertical:

```text
explicit immutable event-store snapshot
  -> validated immutable Run-causal prefix
  -> pure typed Event Calculus projection
  -> HoldsAt(run_active | run_closed)
  -> replay and one bounded ABG admission consumer
```

The selected coding plan and assessor authorization live in the transition
post cited in Section 2. That post selects exact files and commands; it cannot
change this constitution.

## 16. Amendment Rule

Change this constitution only by the smallest lawful re-entry:

- entity/lifecycle, authority, stack role, or catalog law: `design_reframe`;
- callable location or equivalent implementation mechanics:
  `realization_refactor`; and
- Product or requirement meaning: re-enter the owning upstream surface first.

An amendment records reason, upstream basis, superseded clause, affected
catalog/entity rows, and migration consequences. Do not create another local
method, stack list, lifecycle register, library catalog, or AI review protocol.
Amend this single surface.
