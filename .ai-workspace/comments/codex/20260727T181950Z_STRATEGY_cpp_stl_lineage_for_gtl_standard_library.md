# STRATEGY: C++ And STL Lineage For The GTL Standard Library

**Author**: Codex
**Date**: 2026-07-27T18:19:50Z
**Addresses**: ABIogenesis common higher-order functions, the Consensus precedent,
and the boundary between ABIogenesis, `odd_glc`, and downstream ODD products
**Status**: Open
**Updated**: 2026-07-27T18:21:57Z

## Summary

ABIogenesis has been personally influenced by the C++ and Standard Template
Library architecture, but that influence has not been stated strongly enough.
The resulting shape is not unique to C++. It participates in a broader
language tradition of small semantic cores, rich libraries, higher-order
composition, typed policy, and interactive evaluation over a loaded
environment.

The intended product shape is:

```text
small typed language and execution substrate
  -> common generic function library
  -> lifecycle framework
  -> domain products
```

For ABIogenesis:

```text
GTL + validator + HoG + ABG
  -> ABIogenesis common GTL function library
  -> odd_glc lifecycle compositions
  -> downstream ODD products
```

Consensus establishes the middle layer. It is an ordinary GTL GraphFunction
constructed from public language and runtime atoms. It is both proof that those
atoms compose and a reusable high-value function. It is not a HoG primitive,
ABG runtime service, or product-local controller.

The resulting ownership rule is:

> Requiring no new GTL, HoG, or ABG capability classifies a function as
> library-level rather than kernel-level. Domain neutrality and cross-product
> utility then determine whether it belongs in the ABIogenesis standard
> library. Lifecycle meaning belongs in `odd_glc`; business meaning belongs in
> the downstream domain product.

This post records architectural influence and proposed direction. It does not
amend `PRODUCT.md`, select implementation work, reopen S05, select S06 work, or
authorize S04 realization.

## The C++ And STL Influence Within A Broader Language Lineage

The relevant C++/STL idea is not syntax. It is the separation of a small
language and execution model from a rich generic library.

The STL does not add a compiler execution path for each useful algorithm. It
defines reusable algorithms over typed contracts. Containers, iterators,
comparators, allocators, execution policies, and applications remain distinct
participants.

Other language traditions contribute related parts of the shape:

| Language tradition | Relevant influence |
|---|---|
| C++ and the STL | generic algorithms over typed requirements, policy parameters, and independently owned values |
| Lisp | higher-order composition and programs represented as inspectable data |
| ML and Haskell | algebraic data types, total functions over closed domains, and composition determined by typed interfaces |
| Scala | a rich typed standard library and an interactive REPL over one loaded program environment |
| Python | a thin interactive shell over imported modules and runtime values |

The point is architectural convergence rather than ancestry exclusivity.
C++/STL supplied a strong personal model for the library boundary. GTL and
ABIogenesis combine that influence with graph-native programs, algebraic
composition, probabilistic and human compute regimes, and event-sourced
runtime truth.

The corresponding ABIogenesis relation is:

| C++ / STL concept | ABIogenesis analogue |
|---|---|
| language and type system | GTL.TypeScript declarations and contracts |
| concepts and type requirements | GTL interfaces, contract refs, validation, and admission predicates |
| program execution | direct HoG traversal |
| runtime facts | ABG events, replay, lineage, evidence, continuation, and closure |
| generic algorithms | common higher-order GraphFunctions |
| ranges and typed values | graph vectors, catalog assets, replay projections, and typed result vectors |
| comparators and policies | evaluator, objective, policy, and query overlays |
| standard library | ABIogenesis common GTL function library |
| application framework | `odd_glc` |
| application | a downstream ODD product |

The core form is:

```text
generic function
  × typed subject
  × declared policy
  × admitted implementation seams
  -> typed result
```

Examples are:

```text
Consensus × Subject × ReviewerPanel × DecisionPolicy
Observer  × ReplayBasis × EvaluationOverlay
Tuner     × Declaration × EvaluationSet × Objective
Selector  × CandidateFamily × SelectionPolicy
Reviewer  × ExactSubject × ReviewContract
```

The common function does not own the caller's domain, catalog mechanism,
worker transport, event store, runtime state, or final authority.

## Current Product Evidence

The current ABIogenesis Product already contains the elements of this shape:

- `specification/PRODUCT.md:145-147` says ABIogenesis packages the language,
  runtime, catalog, public contracts, and standard library.
- `specification/PRODUCT.md:155-163` assigns composition, recursion, fan-out,
  fan-in, gates, policies, results, and proof obligations to GTL program
  meaning.
- `specification/PRODUCT.md:174-186` defines GraphFunction as the sole named
  callable work contract and permits GraphFunctions to call other admitted
  GraphFunctions.
- `specification/PRODUCT.md:209-216` makes the catalog the discoverable
  projection of Product publications while preserving program and runtime
  authority elsewhere.
- `specification/PRODUCT.md:627-635` defines Consensus as a standard-library
  GraphFunction with no special runner, scheduler, command, event family,
  ticket authority, or closure path.
- `specification/PRODUCT.md:644-649` defines recursive LLM work as ordinary GTL
  recursion and ABG continuation rather than a new runtime or feature family.
- `specification/PRODUCT.md:570-602` defines the SDK as the typed projection of
  the loaded catalog/runtime and the CLI as a Python-shell or Scala-REPL-style
  invocation surface that owns no program selection, traversal, worker call,
  event, continuation, or closure semantics.

The accepted Consensus direction therefore carries two simultaneous claims:

1. Consensus proves that attributed fan-out, fan-in, disagreement, retry,
   recursion, probabilistic evaluation, human escalation, and replay are free
   constructions over existing atoms.
2. Consensus is useful Product content that downstream programs should be able
   to invoke and compose without reimplementing it.

The proof instance and the reusable library function may be the same artifact.

## S06 CLI As A Scala-REPL-Style Surface

The S06 CLI is not primarily a collection of application commands. It is an
interactive projection over one exact installed programming environment:

```text
installed Product set
  -> admitted modules and catalog
  -> typed SDK environment
  -> thin CLI / REPL projection
```

Like a Scala REPL over a loaded classpath and imported library, it lets a user:

- inspect available modules, Programs, GraphFunctions, contracts, and types;
- validate authored program values;
- publish or admit lawful modules;
- invoke a selected GraphFunction;
- start a selected Program;
- inspect replay-derived runtime values;
- answer a typed human hold; and
- continue the same admitted computation.

The CLI parses, serializes, invokes, and renders the same definitions exposed
by the SDK. It does not add command-specific program meaning. A Codex or other
host projection is another front end over the same environment, not another
runtime.

This is the S06 portability claim in
`specification/PRODUCT.md:739-746`: native SDK, CLI, and bounded host
projection must reach the same installed Product behavior, and an independent
flavored Product must be able to publish and invoke through that environment
without source-tree or private-runtime knowledge.

## Four Product Layers

### 1. GTL, HoG, And ABG Kernel

The kernel owns reusable system truth:

- typed declaration and whole-program validation;
- composition, substitution, recursion, fan-out, fan-in, gates, and promotion;
- direct traversal;
- implementation and interaction admission;
- runtime identity, events, lineage, evidence, replay, correction,
  continuation, and closure;
- exact catalog admission and lookup; and
- `F_D`, `F_P`, and `F_H` boundary integrity.

A function belongs here only when its implementation requires a new language
relation, traversal law, admission fact, replay relation, continuation rule, or
generic catalog mechanism.

### 2. ABIogenesis Common GTL Function Library

The common library owns domain-neutral algorithms and higher-order
GraphFunctions whose contracts are useful across independent products.

Candidate families include:

- Consensus;
- attributed review panels;
- observer and evaluator composition;
- immutable successor proposal under an objective;
- compare, rank, select, reduce, and arbitrate;
- policy-controlled routing;
- bounded research, planning, verification, and challenge loops;
- escalation and human-decision compositions; and
- reusable replay-grounded evaluation patterns.

These are Product-owned GTL content. They use the same public catalog, HoG
traversal, ABG event/replay truth, worker boundaries, and continuation law as
downstream content.

They do not acquire feature-specific runtime services.

### 3. `odd_glc`

`odd_glc` composes common functions into general lifecycle meaning:

- intake;
- observation of lifecycle pressure;
- triage and work selection;
- work-item and ticket meaning;
- repricing;
- lifecycle planning;
- promotion, demotion, release pressure, and re-entry;
- lifecycle proof interpretation; and
- nested or recursive lifecycle policy.

`odd_glc` may publish Programs, GraphFunctions, node types, and overlays into
the ABG-owned catalog. It owns their lifecycle semantics and composition. GTL
owns their declaration form; HoG owns traversal; ABG owns admitted runtime
truth.

Owning executable lifecycle meaning does not make `odd_glc` a runtime.

The current `odd_glc/specification/PRODUCT.md:69-97` rule that treats any
executing or cross-domain constructive function as upstream system
functionality requires reconsideration. It conflates semantic ownership with
runtime-authority ownership. The correction, if accepted, is a Product reprice
in `odd_glc`, not an ABIogenesis implementation shortcut.

### 4. Downstream ODD Products

A downstream product supplies:

- domain types and assets;
- domain-specific roles;
- business objectives;
- regulatory and evidence policy;
- catalog views;
- worker profiles;
- evaluation and query overlays; and
- domain proof interpretation.

For example:

```text
regulated claims product
  = odd_glc lifecycle composition
  + Claim and Evidence assets
  + ClaimsPolicy
  + ClaimsReviewerPanel
  + accountable human authority
```

The downstream product should not reconstruct Consensus, retry, replay,
continuation, event storage, or catalog admission.

## Standard-Library Admission Test

A higher-order function is a candidate for the ABIogenesis common library when
all of these conditions hold:

1. Its semantic contract is independent of lifecycle and business vocabulary.
2. At least two materially different ODD domains can use the same function
   without changing its authority or result meaning.
3. Its complete topology is expressible through admitted public GTL.
4. It requires no feature-specific HoG traversal, ABG event family, controller,
   registry, store, or public operation.
5. It is parameterized through typed contracts, catalog assets, and visible
   policies rather than hidden defaults.
6. Its result remains typed, attributable, replayable, and subordinate to
   ordinary Product or `F_H` authority.
7. It composes with other admitted GraphFunctions through the existing
   language.
8. One canonical publication can replace downstream copies.

Cross-domain use alone does not make a function a kernel primitive. It makes
the function a standard-library candidate.

## Contracts Corresponding To STL Guarantees

The STL exposes semantic and complexity expectations rather than controller
implementations. ABIogenesis common functions need analogous declared
properties:

- input and output contracts;
- participant and result cardinality;
- ordering and determinism;
- compute regime at each seam;
- recursion and retry bounds;
- worker-call and human-hold budgets;
- effect and mutation boundaries;
- admission and refusal conditions;
- authority owner;
- replay and attribution requirements;
- continuation and closure behavior; and
- comparison or equivalence law where substitution is permitted.

These declarations make a common function predictable without specifying its
host-language helper layout or transport implementation.

The corresponding ABIogenesis objective is semantic-cost transparency rather
than literal C++ zero-cost execution:

> Reusing a common function adds no rival program, controller, event system, or
> authority path beyond the GTL composition and ABG facts required by its
> declared behavior.

## Generic Functions And Lifecycle Specializations

Several names span the standard-library and GLC boundary. They should be split
by contract rather than assigned wholesale.

| Family | Common-library contract | GLC specialization |
|---|---|---|
| Observer | exact replay plus evaluation overlay to attributed findings | interpret findings as lifecycle pressure |
| Tuner | immutable `A` plus admitted evaluations and objective to `no_proposal` or immutable `A1` proposal | decide when lifecycle work selects tuning and how a proposal re-enters work |
| Classifier | typed evidence plus classification policy to typed classification | triage into defect, experiment, reprice, escalation, or no work |
| Materializer | admitted value plus target contract to candidate artifact | create a ticket or work-item candidate under lifecycle authority |
| Consensus | exact subject plus attributed panel and policy to admitted collective judgment | select Consensus as one lifecycle review or ratification basis |

This prevents the common library from acquiring ticket, phase, release, or
business meaning while preventing GLC from copying generic algorithms.

## Example Organizational Composition

An `odd_glc` lifecycle may compose the common library as:

```text
Execute selected Program
  -> ABG replay
  -> Common Observer
  -> GLC lifecycle-pressure interpretation
  -> GLC Triager
       -> no work
       -> escalation
       -> correction
       -> optimization
  -> Common Tuner when optimization is selected
  -> immutable A1 proposal
  -> Common Consensus
  -> admitted review result
  -> GLC policy or F_H disposition
  -> GLC Ticketer
  -> admitted lifecycle work
  -> downstream builder Program
  -> later execution and replay comparison
```

No step requires a feature-specific runner. Each higher-order function is a
published GraphFunction or declared GTL composition. ABG remains indifferent
to whether the program represents software work, trading research, claims
assessment, world-model construction, or another governed domain.

## Catalog Consequence

The standard library is valuable only when independently published products
can consume it without copying declarations.

The catalog therefore needs one exact dependency-publication composition
relation:

```text
installed Product dependency lock
  -> admitted dependency publications
  -> one exact dependency-aware CatalogView
  -> downstream Program membership
  -> workflow.C call to an exact library GraphFunction
```

This is generic catalog and dependency resolution. It is not a Consensus,
Observer, Tuner, or GLC feature.

The current S06 downstream-portability boundary is the appropriate proof
location. S06 should prove exact consumption from an independently installed
flavored Product rather than permit copied standard-library content.

## Consequences For S04

S04 should distinguish the generic functions from lifecycle application:

- replay-basis derivation remains ABG;
- overlay-relative observation may be a common Observer function;
- `A + evaluations + objective -> A1 proposal` may be a common Tuner function;
- Consensus may review the exact proposal;
- lifecycle triage, ticket creation, repricing, and work selection belong in
  GLC or another owning Product;
- ratification remains ordinary declared policy or `F_H`;
- publication of a ratified successor remains ordinary Product and catalog
  work.

Tuner-specific public operations, event systems, registries, controllers, or
draft stores require a separate generic-kernel justification. They cannot
enter ABG merely because a Tuner composition needs durable evidence.

The current S04 candidate should be reviewed against this library boundary
before realization. This post does not itself reject, repair, or accept that
candidate.

## Non-Features

This direction does not authorize:

- a second catalog for common functions;
- dynamic execution of an arbitrary function reference supplied as
  unvalidated data;
- a generic service locator;
- feature-specific HoG runners;
- function-owned event stores;
- lifecycle policy inside ABG;
- copied standard-library functions in every ODD product;
- inheritance-based framework authority;
- hidden policy defaults; or
- automatic mutation or publication by Observer, Tuner, or Consensus.

## Recommended Action

1. Record Consensus as the first canonical common higher-order GraphFunction.
2. Treat the common GTL function library as an explicit Product layer between
   the kernel and `odd_glc`.
3. Use one bounded classification pass over prospective functions to separate
   generic contracts from lifecycle specialization.
4. Make S06 prove exact dependency-library consumption through the installed
   public catalog.
5. Re-evaluate S04 against the Observer/Tuner split before implementation.
6. If the direction is accepted, amend ABIogenesis and `odd_glc` Product
   boundaries through explicit Product repricing. Do not infer constitutional
   change from this commentary post.
