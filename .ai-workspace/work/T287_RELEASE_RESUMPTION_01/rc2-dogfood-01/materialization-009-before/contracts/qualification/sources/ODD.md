# ODD

Tier 3. The Outcome-Driven Development profile: graph-native product
authoring over a declared asset graph. It imports the families that
[§1 Foundation to law](#foundation-to-law) lists by reference under
[PROFILES §1](PROFILES.md#1-the-boundary) and restates none of them. Inside
its bounded context it uses its own terms freely: graph, node, asset,
vector, edge, graph function, traversal, worksite, ledger, event log, GTL,
ABG, F_P and F_H (P0, P1). `F_D` is the exact-edition common import below.

Two definitions are used here and owned elsewhere. The a_c traversal record
and the functor kinds are
[AXIOMATIC_CALCULUS §5](AXIOMATIC_CALCULUS.md#5-traversals-and-functor-kinds);
the core result algebra is [FOUNDATIONS §4 Results](FOUNDATIONS.md#results).
This profile's graph traversal and its F_P and F_H shorthands are its
own concepts and are not those records by spelling. Its F_D use imports
the common kind through [§5](#probabilistic-compute), without inheriting
any operation authority. The Executive, Worker
and Reviewer of [EXECUTIVE_BASELINE](EXECUTIVE_BASELINE.md) are roles, and roles
are relations over steps in which no role name confers an operation
([ACTIVATION §1](ACTIVATION.md#roles-and-delegation)); the actor, the
executor, the domain operation and the functor kind are different
coordinates (AXIOMATIC_CALCULUS §5) (P3, P6).

## 1. Position

This profile makes one instruction precise: `using ODD, build this
product`. The instruction should mean something stronger than writing
product documents, sketching a graph or adding a few helper scripts (P0,
P2). It means:

- build the product as a GTL/ABG domain product;
- define typed domain assets and nodes;
- publish named graph functions as the constructive carrier;
- bind them into a GTL module;
- let ABG own traversal governance, runtime facts and provenance;
- let ABG own continuation and re-entry after each publish boundary;
- keep product commands and services as cooperative bounded-step
  subsystems that publish assets or evidence and return control to ABG;
- expose visible current state as a projection over constructive history.

ODD is a programming paradigm, not only a documentation preference. Its form
is `product = typed asset/domain model + GTL-defined graph functions + ABG
traversal-control runtime + governed projection/query surfaces`. A product
whose constructive carrier stays hidden in imperative loops, local service
logic or product-specific orchestration scripts is not yet built with this
profile (P0, P6).

ODD, GTL and ABG name normative capability roles and a construction
algebra, not a required repository, package, vendor or concrete
implementation. ODD, Outcome-Driven Development, names the graph-native
product-authoring profile. GTL, Graph Transformation Language, names the
role of the typed declarative graph language. ABG names the role of the
singular traversal-governance and runtime-truth authority (P1, P6).

This profile owns those concepts in the graph-native bounded context
`urn:stdo:bounded-context:graph-native-odd` under the selected complete
STDO basis. The context covers the ODD product shape, the GTL language
role, the ABG method role, graph assets, vectors, functions, traversals and
the graph and runtime worker and evaluator shorthands defined here. It does
not absorb a consuming Product's domain semantics, nor a concrete runtime's
carriers that happen to share a spelling (P1, P3).

A consumer binds the roles to concrete conforming realisations in its own
Product, requirements, design and immutable dependency identity. A
consumer, a reference realisation or a historical product may prove or
falsify conformance; none of them supplies method authority (P6).

The profile has two core jobs: to describe the product as a declared asset
graph in graph-native terms, and to ensure that automation never outruns a
lawful manual traversal of the same graph. The graph is the process model,
not decoration around a process. GTL is the language expression of the
profile. ABG is the substrate of traversal governance, binding and runtime
truth that realises the GTL program without owning the domain's internal
HOW (P0, P6).

### Foundation to law

This member is material family F18, outcome-driven development. The table
below shows which of its rules follow from which premises, in the format
of [FOUNDATIONS §3 Foundation to law](FOUNDATIONS.md#foundation-to-law),
which also states the standing of the consequences. Under
[PROFILES §1](PROFILES.md#1-the-boundary) the family imports the families
its rows rest on; their rules and choices keep their owners:

- F1, frames and context
  ([REFERENCE_FRAME §1](REFERENCE_FRAME.md#1-the-frame-as-the-engagement-unit)),
  for acquisition under ACTIVATION §2;
- F2, transitions, steps and configuration ([ACTIVATION §1](ACTIVATION.md#1-the-step));
- F3, results and their combination ([FOUNDATIONS §4 Results](FOUNDATIONS.md#results));
- F4, work state, resumption and reuse ([ACTIVATION §5](ACTIVATION.md#5-work-state-and-restart));
- F6, claims, evidence, assessment and acceptance ([EVALUATION §1](EVALUATION.md#1-claims));
- F9, the `a_c` calculus ([AXIOMATIC_CALCULUS §1](AXIOMATIC_CALCULUS.md#1-position));
- F10, constitutional chain, outcome and build-tenant binding ([SPEC_METHOD §2](SPEC_METHOD.md#2-the-chain));
- F11, change management and ambiguity ([SPEC_METHOD §4](SPEC_METHOD.md#4-change-management));
- F12, binding a project to the method
  ([PRODUCT_DEFINITION §1](PRODUCT_DEFINITION.md#1-overlay-and-layout-independence));
- F13, work carriers ([TICKETS §5](TICKETS.md#5-from-carrier-to-execution));
- F15, release and successor conservation ([RELEASE §1](RELEASE.md#1-context-and-position)).

Its instance premises hold where a product is built with this profile;
they are adopted with it and do not follow from the foundations (P1, P6):

- I1: a selected Product outcome is admitted as external authority for
  the work;
- I2: the work changes a mutable workspace, beside which an immutable
  ledger and event log record the admitted work;
- I3: bounded probabilistic workers carry out the constructive actions,
  and their reports and artifacts are observations;
- I4: the product is built with an installed release of a method product,
  which may be an earlier release of the product itself.

Each commitment in the premise column carries its standing from
[FOUNDATIONS §3](FOUNDATIONS.md#3-commitments).

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|
| P3 (independent), P4a (independent), P0 (recovered); I2 | By P3 identity is declared, so each bounded state is a node over explicit typed assets with a declared identity, never one hidden workspace object (I2); by P4a steps compose only through declared result types and domains, so each admissible transition is a vector that declares its required upstream assets, target, evaluators and gates, and output contract; by P0 an actor holds only what it acquired in a bounded step, so the work is a traversal that takes one admissible vector at a time until the selected target closes | [§5](#5-graph-model), with [Nodes](#nodes), [Vectors](#vectors) and [Traversal](#traversal); [§11.1](#111-typed-assets-and-nodes-are-explicit) | the graph as the product's process model and traversal as its workflow, and `asset_surface` as the declaration of a produced or consumed boundary: this member; which nodes, vectors and assets a product declares: the product | 5, 2, 3 |
| P0 (recovered), P6 (independent); I3; F2 (imported) | within one bounded step the worker's internal path is its own and the traversal contract is its admissible external space; the worker cannot close the edge, emit runtime events, mutate ledgers or decide re-entry, because its output is a candidate until evaluated and its report is an observation, not authority | [§5 Probabilistic compute](#probabilistic-compute); A5 in [§11.5D](#115d-constructive-evaluation-and-yield-loop) | one vector or edge traversal as the bounded step, declared as a binding in §5 Probabilistic compute: this member | 5, 8, 9 |
| P1 (independent), P3 (independent); F9 (imported), F11 (imported) | By P1 equal spelling fixes no meaning and by P3 identity is declared, so this profile's traversal and its F_P and F_H shorthands are concepts of its own bounded context and not the `a_c` traversal record or functor kinds by equal spelling (F9); common F_D is imported by exact edition with total-domain evidence and separate operation authority, while F_P and F_H relate to the source concepts of SPEC_METHOD §5 only through declared specialisations that state direction, preserved meaning, narrowed scope and invalidation (F11) | this member's lead; [§1](#1-position), the bounded-context paragraph; [§5 Probabilistic compute](#probabilistic-compute) | the bounded context, F_P and F_H specialisations, and F_D import with operation bindings: this member, under PROFILES §1; the F_D definition remains AXIOMATIC_CALCULUS §5 | 5, 6 |
| P4a (independent), P4b (derived from P0 and P2); F2 (imported) | By P4a a step composes only through its declared contract, so a graph function realises an outer vector, which stays the callable contract; by P4b a later step needs step-produced facts recorded, so where the function refines that vector into inner steps the inner boundaries are published and a later step reads earlier outputs only through its declared environment; and F2 makes the loop govern each published inner boundary as it governs the outer one | [§5 Graph functions](#graph-functions); [§11.4](#114-the-gtl-module-is-the-operative-publication-surface), second paragraph; [§11.8](#118-cumulative-environment-law-is-mandatory); A14 in [§11.5D](#115d-constructive-evaluation-and-yield-loop) | the cumulative carried environment as the specialised contract for carrying earlier outputs, with its three declarations at "should": this member | 5, 3, 4 |
| P0 (recovered), P3 (independent), P6 (independent) | every operative constructive step has a named, typed and published carrier that a later actor and the runtime can re-acquire, because a later actor holds declared sources and not another actor's private memory, and no undeclared surface carries authority; no operative step, callable surface or capability stays only in prose, prompt memory, an orchestration loop or a service method, and a caller binds to the published outer carrier, never to a hidden inner vector | [§11.2](#112-graph-functions-are-the-primary-constructive-carrier); [§11.3](#113-the-function-catalogue-is-published); [§11.4](#114-the-gtl-module-is-the-operative-publication-surface), first paragraph; [§8](#8-responsibility-layers-and-local-binding), last paragraph | `GraphFunction` as the carrier; a machine-readable function catalogue whose retained functions should expose at minimum name, inputs, outputs, intent and public or helper role; the GTL module as the publication surface: this member; which functions, graphs and catalogue entries a product publishes: the product | 5, 4, 1 |
| P0 (recovered), P6 (independent); I3 | imperative code transports or persists facts and decides nothing that the declared carrier owns: domain meaning, semantic target movement, step selection, closure, lineage and constructive workflow truth, because what is decided only in imperative code is decided by no declared owner | [§11.2A](#112a-outcome-first-realisation-order); [§14](#14-dogfooding-rule) | the order outcome traversal, declarative carrier, minimal adapter code, with the outcome traversal's declarations; building the product's own framework behaviour through its graph functions: this member | 5, 4 |
| P6 (independent), P0 (recovered), P3 (independent); I3; F2 (imported) | By P6 authority exists only through a grant and by P3 an identity is one and declared, so each traversal has exactly one execution authority, which owns its selection and advance, actor invocation and supervision, retry, continuation and re-entry, runtime events and closure fold; by P0 and I3 a bounded step, product code, a plugin, a service or a query returns evidence, policy input and control and holds none of these (F2), so two controllers that can each claim one traversal leave the product not ODD-correct | [§10 ABG](#abg), [ODD product](#odd-product) and [Query and service layers](#query-and-service-layers); [§11.5A](#115a-abg-owns-continuation-and-re-entry); [§11.5B](#115b-execution-authority-audit); A15 in [§11.5D](#115d-constructive-evaluation-and-yield-loop) | ABG as the role of that single authority, with its ownership list and the product's; the five-surface audit inventory, the changes that require the audit and the conditions that prevent closure: this member; the concrete realisation of the ABG role: the consumer (§1) | 5, 8, 9 |
| P6 (independent), P1 (independent), P3 (independent), P5 (derived from P0 and P6) | By P6 authority is scoped, so model synthesis, gap discovery, next-action selection and action evaluation hold separate authorities and no command, report, query, service or summary becomes a rival source of traversal truth; by P5 a projection decides only what its evidence establishes, so visible state is a projection that reconciles to the admitted truth it reads or fails closed; by P1 and P3 equal names establish no identity | [§11.5](#115-current-state-is-a-projection-over-constructive-history); [§11.5C](#115c-projection-source-coherence); A0, A4a, A11, A12, A16 and the constitutional equation in [§11.5D](#115d-constructive-evaluation-and-yield-loop) | the four functions `synthesize_model`, `eval_gap`, `evaluate_next` and `evaluate_action`, and the duty of a design, ticket, module or proof to name the one it implements or consumes: this member; domain asset meaning, catalogue meaning and gap interpretation: the product (A15) | 5, 6, 9 |
| P6 (independent), P0 (recovered); I2, I3; F2 (imported), F6 (imported) | no edge closes from an artifact, a worker report, process success or liveness alone; closure is a fold over admitted evidence, the workspace counts only through the ledger, and an evaluator attends only to admitted ledger rows reachable through declared lineage, because a report or artifact is an observation, not authority, and a step's context is its declared material, never the workspace | A1, A1a, A1b, A6, A7 and A10 in [§11.5D](#115d-constructive-evaluation-and-yield-loop) | the governed work pair of workspace, ledger, event log and evaluator work, and the ledger's fields: this member; carrier names other than those of the loop: the implementation, which keeps the authority shape (§11.5D) | 5, 7, 9 |
| P4b (derived from P0 and P2), P3 (independent); I2; F4 (imported) | By P4b every closure-relevant callout is a step-produced fact the outer contract needs, so it is admitted to the immutable ledger and event log; by P3 a correction keeps the identity of what it corrects, so it appends or supersedes and never rewrites; under F4 and I2 every closure decision and next-action selection is reproducible by replay from carriers that each reference their causal predecessors | A1a, A13 and A13a in [§11.5D](#115d-constructive-evaluation-and-yield-loop); [§11.5](#115-current-state-is-a-projection-over-constructive-history) | the replay inputs listed in A13 and the predecessor chain of A13a: this member | 5, 2, 9 |
| P5 (derived from P0 and P6), P0 (recovered); F4 (imported) | By P5 work that is still lawful but not yet decided has no failure to classify, and by P0 the next actor holds only what is recorded, so such work returns control without failure classification, keeping the same edge and a replay-visible resume basis (F4) | A9, and A4 on `post_yield_resume`, in [§11.5D](#115d-constructive-evaluation-and-yield-loop) | `yield` as the lawful iteration boundary, distinct from retry, block and timeout: this member | 5 |
| P2 (independent), P6 (independent); I1; F10 (imported), F11 (imported) | By P2 only work with a route to the selected outcome is justified, so the selected outcome bounds the loop: every action binds the current gap to exact target assets and obligations before invocation, and only published lawful actions are ranked; by P6 no further material work is selected without another admitted basis once a terminal condition of the loop is reached, and a reprice requests constitutional re-entry (F10, F11) and selects nothing; by P6 edge closure is evidence toward Product acceptance, not acceptance | the selected-outcome paragraphs, the intent-lineage paragraph, A2, A3, A4 on `post_reprice` and A16 in [§11.5D](#115d-constructive-evaluation-and-yield-loop) | which outcome is selected and accepted: its owner under [SPEC_METHOD §3](SPEC_METHOD.md#3-outcome-conservation); the re-entry a reprice requests: its owning relation under SPEC_METHOD §4 | 5, 1 |
| P5 (derived from P0 and P6), P6 (independent); F3 (imported) | By F3 every result is stated in the core or in a refinement mapped into it, so the closure decision is a closed sum type, `evaluate_next` is total, and each closure decision and each audit outcome maps to exactly one core value for a named predicate, its cause being part of the value where the cause decides it (P5); by P6 a closure decision answers the edge predicate and is not a disposition of ACTIVATION §3, which answers the acceptance predicate, so neither counts toward the other; selection data decides no predicate, so it maps to no core value, while each typed no-action decides that no published lawful action can be selected and maps by its cause, and a closure decision it follows keeps its own value for the edge predicate | A4, A8 and its mapping in [§11.5D](#115d-constructive-evaluation-and-yield-loop); the audit mapping in [§9](#9-method-governance-and-audit) | the seven closure decisions, their causes, the two causes of a typed no-action and the default of graph following in A4: this member; the priority policy: the product (A15) | 5, 3, 9 |
| P6 (independent), P1 (independent), P3 (independent); F12 (imported) | By P6 each part of an ODD product has one owner: one WHAT surface, one HOW relation, runtime truth with the traversal authority and domain meaning with the product; by P1 and P3 the split binds by authority and not by directory names, and a runtime frame's name does not enrol it among the evaluation frames (F12), while an evaluation frame may take a runtime frame as its subject or coordinate without collapsing the two | [§10](#10-what-an-odd-product-is), with [Product specification](#product-specification-software-development-topology) and [Product realisation](#product-realisation-software-development-topology) | the ten-part application boundary and `specification/` and `build_tenants/` as the default software-development locations: this member; the actual locations: the product's definition under PRODUCT_DEFINITION | 5, 1, 7 |
| P1 (independent), P2 (independent), P6 (independent); F10 (imported) | By P6 this profile decides only what it owns, graph-native structure and product shape, and neither a product's domain semantics nor its current line; by P2 domain-correct work also needs the constitutional chain (F10), the domain method's semantic law and the product's local authority surfaces; by P1 where a product also adopts a domain profile, each governs its own questions and the two compose | [§2](#2-method-role); [§3](#3-method-composition) | the split between graph-native structure and product shape, owned here, and world-model semantics, publication and composition law, owned by [WORLD_MODEL](WORLD_MODEL.md#1-position); which domain method and local surfaces apply: the product | 5, 1, 2 |
| P0 (recovered), P2 (independent); F1 (imported) | an actor building an ODD product acquires the general method, the product's domain method where one exists, and its local authority surfaces before it acts, then identifies and declares the graph carrier and loop, and implements code last, because it holds only the declared sources it acquires and the selected outcome sets which obligations matter | [§17](#17-invocation-rule); [§18](#18-cold-start-reading-order) | the fourteen-step sequence and the two reading orders, with "usually" for the effect of skipping the order: this member | 5, 1, 7 |
| P6 (independent), P2 (independent); F11 (imported) | By P6 a structural pattern becomes shared law only when this profile is changed (F11), so usage and repetition approve nothing; by P2 a move the profile does not clearly cover is evaluated against it, and a move found worth incorporating is not fully approved until the profile is updated | [§9](#9-method-governance-and-audit) | the audit questions, at "should", and the three audit outcomes: this member; a change to this profile: the method's change management (SPEC_METHOD §4) | 5, 1, 9 |
| P1 (independent), P3 (independent) | By P1 a capability class is a layer idea whose meaning each product binds to its own typed assets, and by P3 identity is declared, so shared structural law and a product's local semantic bindings stay distinct, and copying another product's local names without semantic need is not reuse of the method | [§8](#8-responsibility-layers-and-local-binding); [§11.6](#116-product-specific-semantics-sit-above-the-shared-carrier) | the capability classes listed, as examples: this member; local asset names, asset meanings, proof lanes and query overlays: the product | 5, 6, 1 |
| P6 (independent); F6 (imported) | ODD, GTL and ABG name capability roles, not a required implementation; a consumer, a reference realisation or a historical product may prove or falsify conformance and supplies no method authority, because evidence never mints authority | [§1](#1-position), the paragraphs on roles and on consumer binding | the concrete realisations of the GTL and ABG roles: the consumer, in its own Product, requirements, design and immutable dependency identity | 9, 5, 8 |
| P0 (recovered), P6 (independent); I3; F13 (imported) | automation decides nothing that the declared surfaces do not: each automated move is one an actor holding only those surfaces could make, because a later actor re-acquires declared sources and not private memory, and authority comes only from declared owners; an agentic worker's artifacts take effect only through admission against deterministic criteria, and conformance evidence is not ratification | [§11.7](#117-manual-walkthrough-must-still-be-lawful); [§11.7A](#117a-conforming-agentic-development) | the manual walkthrough as the test of automation, and its agentic form as the conformance proof of the method: this member; the admission criteria for produced artifacts: [SPEC_METHOD](SPEC_METHOD.md) and [TICKETS](TICKETS.md) | 5, 9, 7 |
| P6 (independent), P5 (derived from P0 and P6); F6 (imported) | By P6 only the real authority-bearing input decides, so negative evidence for a boundary exercises the supported authority path with that input invalidated and shows refusal before the prohibited effect (F6); by P5 a manufactured refusal, blocked event, gap or verdict proves nothing about that path, and absence in source, package, installation and runtime are distinct claims | [§11.7B](#117b-real-authority-path-negative-proof-stdo-up-010) | the concrete test and evidence mechanism: the consumer | 9, 5 |
| P3 (independent), P6 (independent); I4; F15 (imported) | By P3 the installed builder and the product it builds, and the selected immutable release and mutable source, are distinct identities (F15), and by P6 they hold distinct authority: the selected release governs a consumer and mutable source governs none; a mismatch is repaired by installing one complete release (I4), a release version is no graph truth (P3), and where an installable development form exists, decisive proof runs against it (P6) | [§4](#4-method-library-classes); [§7](#7-self-host-boundary); [§13](#13-installed-dev-rule); [§15](#15-release-boundary) | which release a consumer selects: the consumer ([PRODUCT_DEFINITION §4](PRODUCT_DEFINITION.md#4-shared-installed-release-basis-and-toolchain-manager)); which members are method members: the [standards README](README.md#documents); the isolated environment and the proving lane of §13, at "should": this member | 1, 2, 9 |
| P6 (independent), P3 (independent); F12 (imported) | By P6 the installed product provides the method, runtime and carrier surfaces and assumes no knowledge of a target project's domain, over which it holds no grant; by P3 the target project owns its definition, constitutional surfaces, realisation roots and domain outputs as its own identity (F12) | [§6](#6-product-boundary) | the default scaffold names and `build_tenants/` as the default realisation root: this member, as defaults; the target project's domain, surfaces and outputs: the target project | 1, 5 |
| P4a (independent), P2 (independent); F3 (imported) | By P4a a refined inner chain closes the enclosing carrier only when the enclosing contract still holds after fold-back and zoomed and unzoomed views agree; by P2 and F3 a live requirement without a proof witness is a gap that keeps the enclosing carrier open until it is realised, deferred or repriced out of the active branch; that a scenario bundle should make clear the boundary, assets, vectors, paths and evidence that close it is this member's choice | [§11.9](#119-global-convergence-must-be-stable-under-zoom); [§12](#12-scenario-rule) | which scenarios a product keeps and which proof witness fits a requirement class: the product; deferring or repricing a requirement out of the active branch: the requirement's owner | 5, 3, 9 |
| P5 (derived from P0 and P6); F3 (imported) | By F3 results conjoin and by P5 an unestablished clause establishes nothing, so an ODD product is built correctly only when every clause of §11 holds: the clauses form a conjunction, and one failing or unestablished clause leaves the product not built correctly | [§11](#11-core-law), its lead | which clauses make up the core law: this member | 5, 3 |

Consumers of these rows, where an actor enters them (FOUNDATIONS §3
Foundation to law, Consumers), one list per row, each consumer linked to
its own locus:

- Row 1, nodes, vectors and typed assets: [DESIGN_MODULE §2](DESIGN_MODULE.md#2-graph-execution-alignment-and-escalation), which asks first whether a boundary moves a typed asset from one state to another, and [DESIGN_MODULE Relationship to other members](DESIGN_MODULE.md#relationship-to-other-members); [§11.7](#117-manual-walkthrough-must-still-be-lawful), steps 1 and 2; [§11.7A](#117a-conforming-agentic-development), where admission enforces an artifact as a constructor enforces a typed asset under §11.1; [§17](#17-invocation-rule), step 5; [§19](#19-ramp-up-checklist), question 2; [§16](#16-failure-pattern), pattern 1.
- Row 2, the bounded probabilistic step: [PROFILES §1](PROFILES.md#1-the-boundary), whose declared-binding rule takes its shape from the F_P and F_H specialisations §5 owns, and [PROFILES §2](PROFILES.md#2-graph-execution), which keeps the bounded-step binding and the worker's internal solution strategy outside the framework; [CONFORMANCE §1](CONFORMANCE.md#1-counterexample-cases), case C-09; [ACTIVATION §2](ACTIVATION.md#2-context-construction-under-an-envelope), which names A5 as the ODD specialisation of prompt construction; [DESIGN_MODULE §2](DESIGN_MODULE.md#2-graph-execution-alignment-and-escalation), which keeps probabilistic worker boundaries out of imperative prompt or dispatch code; [§11.5B](#115b-execution-authority-audit) and [§11.7A](#117a-conforming-agentic-development), which read F_P and F_D at the audit and at the method layer.
- Row 3, the bounded context: [PROFILES §1](PROFILES.md#1-the-boundary), which keeps the traversal record and the functor kinds as terms of AXIOMATIC_CALCULUS §5 apart from the profile's shorthands; [§11.5B](#115b-execution-authority-audit), which binds F_P and F_H to the source concepts of SPEC_METHOD §5 through §5 Probabilistic compute.
- Row 4, graph functions and refinement: [PROFILES §2](PROFILES.md#2-graph-execution), which keeps the refinement binding with §11.8 as its specialised contract; [DESIGN_MODULE Atomic functions and higher-order composition](DESIGN_MODULE.md#atomic-functions-and-higher-order-composition), where a product under this profile binds its composition and effect algebra to GTL composition and ABG interpretation; [§11.7](#117-manual-walkthrough-must-still-be-lawful), step 2; [§17](#17-invocation-rule), steps 6 and 8; [§19](#19-ramp-up-checklist), question 3; [§16](#16-failure-pattern), patterns 2 and 7.
- Row 5, published constructive carriers: [DESIGN_MODULE §2](DESIGN_MODULE.md#2-graph-execution-alignment-and-escalation), which is not used to hide graph functions inside service methods, and [DESIGN_MODULE §11 Design review questions](DESIGN_MODULE.md#design-review-questions) 29 to 31; [UX §3](UX.md#3-product-truth-and-admitted-carriers), where a published graph function or lawful composition is an admitted carrier; [§9](#9-method-governance-and-audit), which asks which public graph functions carry the transition; [§17](#17-invocation-rule), steps 6 to 8; [§19](#19-ramp-up-checklist), questions 3 to 5; [§16](#16-failure-pattern), patterns 9 and 10.
- Row 6, outcome-first realisation order: [DESIGN_MODULE §2](DESIGN_MODULE.md#2-graph-execution-alignment-and-escalation), which orders outcome traversal, declarative carrier structure and deterministic module realisation and reprices a module that owns next work or closure, with the graph-execution checks of the [DESIGN_MODULE Functional realisation checklist](DESIGN_MODULE.md#functional-realisation-checklist); [§17](#17-invocation-rule), step 14; [§16](#16-failure-pattern), patterns 10 and 11. §14 Dogfooding has no separate consumer; it binds only a product that provides this profile's framework behaviour, and a violation shows as §16 pattern 10.
- Row 7, one execution authority: [PROFILES §2](PROFILES.md#2-graph-execution), which indexes the ownership split of §10; [UX §3](UX.md#3-product-truth-and-admitted-carriers), where an ABG event or command boundary is an admitted carrier, [UX §8](UX.md#8-continuation-and-replay), whose view does not own continuation because the runtime does, and [UX Relationship to other members](UX.md#relationship-to-other-members), where UX surfaces are projection and query surfaces under this profile; [DESIGN_MODULE §2](DESIGN_MODULE.md#2-graph-execution-alignment-and-escalation), which keeps continuation and re-entry decisions out of deterministic controllers, and [DESIGN_MODULE Relationship to other members](DESIGN_MODULE.md#relationship-to-other-members); [§9](#9-method-governance-and-audit), which asks whether a command, service or query surface replaces ABG continuation and whether the §11.5B audit holds; [§11.7B](#117b-real-authority-path-negative-proof-stdo-up-010), whose supported relation leaves traversal, event, continuation and replay truth with ABG; [§17](#17-invocation-rule), step 10; [§19](#19-ramp-up-checklist), questions 6 and 9; [§16](#16-failure-pattern), patterns 11 and 12.
- Row 8, projection over constructive history and evaluation separation: [§9](#9-method-governance-and-audit), which asks which projected or query state is exposed without replacing ABG runtime truth; [§11.7B](#117b-real-authority-path-negative-proof-stdo-up-010), where no query or projection may become a rival traversal controller; [§17](#17-invocation-rule), step 13; [§19](#19-ramp-up-checklist), questions 7 and 8; [§16](#16-failure-pattern), pattern 14. No section of another member applies these rules; UX §3 binds a UX projection surface to admitted carriers under its own rule.
- Row 9, evidence before closure and the ledger: [§9](#9-method-governance-and-audit), which asks which proof or closure lane justifies a capability; [§11.5B](#115b-execution-authority-audit), where the closure fold stays with ABG and a worker self-report or product postflight closes nothing; [§17](#17-invocation-rule), step 11; [§19](#19-ramp-up-checklist), questions 10 and 12; [§16](#16-failure-pattern), pattern 6.
- Row 10, admitted facts, correction and replayability: [§11.5B](#115b-execution-authority-audit), where runtime event emission, append and replay stay with ABG and a direct append or side-ledger mutation is forbidden; [§11.5C](#115c-projection-source-coherence), where runtime status views derive from ABG runtime facts, events, replay or projection truth; [§17](#17-invocation-rule), step 11; [§19](#19-ramp-up-checklist), question 10.
- Row 11, yield: [§17](#17-invocation-rule), step 12; [§19](#19-ramp-up-checklist), question 11; [§16](#16-failure-pattern), pattern 13. No section of another member applies it: yield is a closure decision of this member's loop, read elsewhere only through its core value.
- Row 12, the selected outcome and lawful action selection: [§17](#17-invocation-rule), step 11, from intent lineage through target binding and lawful action selection; [§19](#19-ramp-up-checklist), question 10; [§16](#16-failure-pattern), pattern 14. No section of another member applies these rules; the selected outcome they bind to is SPEC_METHOD §3's, which this member applies and which applies nothing of it.
- Row 13, closure decisions and the core mapping: [§19](#19-ramp-up-checklist), question 11; [§16](#16-failure-pattern), pattern 13. No section of another member applies these rules; a consumer of a closure decision or audit outcome reads its core value under FOUNDATIONS §4 Results.
- Row 14, the ODD product and its ownership split: [PROFILES §2](PROFILES.md#2-graph-execution), which indexes §10 as the ownership split of graph execution; [DESIGN_MODULE Relationship to other members](DESIGN_MODULE.md#relationship-to-other-members), [UX §2](UX.md#2-role-and-composition) and [WORLD_MODEL §2](WORLD_MODEL.md#2-role-and-imports), which leave graph-native product shape to this profile; [§17](#17-invocation-rule), steps 4 to 9; [§18](#18-cold-start-reading-order); [§19](#19-ramp-up-checklist), questions 1 to 7.
- Row 15, method role and composition: [UX §2](UX.md#2-role-and-composition) and [UX Relationship to other members](UX.md#relationship-to-other-members), [WORLD_MODEL §2](WORLD_MODEL.md#2-role-and-imports) and [DESIGN_MODULE Relationship to other members](DESIGN_MODULE.md#relationship-to-other-members), each of which composes with this profile and leaves it what it owns; [§17](#17-invocation-rule), steps 1 to 3; [§18](#18-cold-start-reading-order), whose closing paragraph divides structural expectation, domain law and current line.
- Row 16, invocation and reading order: [§19](#19-ramp-up-checklist), whose questions test what the sequence and the reading order produce. No section of another member applies them: they bind the actor who enters this member, and the acquisition they require is F1's rule, imported in the premise column.
- Row 17, method governance and audit: [§11.7A](#117a-conforming-agentic-development), where shared method change still follows §9 and repeated agentic execution ratifies nothing. No section of another member applies it; the audit governs moves under this profile, and shared-law adoption across members is SPEC_METHOD §6's rule.
- Row 18, responsibility layers and local binding: [§9](#9-method-governance-and-audit), whose audit asks which layer or capability class is implemented and which local typed assets bind it, and distinguishes shared structural law from local semantic bindings; [§19](#19-ramp-up-checklist), questions 2 and 6. No section of another member applies these rules; they bind a product's binding of this profile's layers, which the product declares in its own authority surfaces.
- Row 19, capability roles and consumer binding: [DESIGN_MODULE Identity defaults from a bound runtime realisation](DESIGN_MODULE.md#identity-defaults-from-a-bound-runtime-realisation), where a consumer-bound realisation of the ABG role publishes defaults for its own runtime surfaces; [§11.5B](#115b-execution-authority-audit), where the execution authority is the one consumer-bound realisation of the ABG role; [§11.7B](#117b-real-authority-path-negative-proof-stdo-up-010), where the consumer owns the concrete test and evidence mechanism.
- Row 20, manual walkthrough and conforming agentic development: [ACTIVATION §2](ACTIVATION.md#2-context-construction-under-an-envelope), which names §11.7A as the ODD specialisation of prompt construction; [§11.7A](#117a-conforming-agentic-development), whose walkthrough is §11.7's conformance proof; [§19](#19-ramp-up-checklist), question 14; [§16](#16-failure-pattern), patterns 3 and 15.
- Row 21, real authority-path negative proof: no separate consumer applies. The property binds negative evidence for an ODD or graph-native boundary; the consumer owns the concrete test and evidence mechanism, as the section says, and the negative-proof rules of other members, TICKETS §6 Mixed-state negative proof and SPEC_METHOD §7 Hard-break discipline, are their own and name this section nowhere.
- Row 22, builder, release and source distinctions: [§11.7](#117-manual-walkthrough-must-still-be-lawful), where automation that collapses the installed builder and the product under development into one authority surface is unlawful, for §7; otherwise no separate consumer applies: the generic rules that §4, §13 and §15 specialise are PRODUCT_DEFINITION §4's, RELEASE §4's and ASSURANCE §5's, which name this member nowhere.
- Row 23, product boundary: [§11.7](#117-manual-walkthrough-must-still-be-lawful), where automation that depends on implementation-carrier knowledge the installed product should not have is unlawful; [§17](#17-invocation-rule), step 3; [§16](#16-failure-pattern), pattern 4.
- Row 24, convergence under zoom and scenarios: [§17](#17-invocation-rule), step 9; [§19](#19-ramp-up-checklist), questions 12 and 13; [§16](#16-failure-pattern), patterns 5, 6 and 8. No section of another member applies these rules; ASSURANCE §4 and §6 own the generic scenario-bundle and significant-path law and name this member nowhere.
- Row 25, the core-law conjunction: [§16](#16-failure-pattern), which declares the profile violated when any pattern holds; [§11.5B](#115b-execution-authority-audit), whose closure conditions leave the product not ODD-correct over GTL/ABG when any one is present; [§19](#19-ramp-up-checklist), whose closing sentence reads an unanswered question as a product not yet ODD-shaped.

Each consumer applies the rule and decides nothing the owning section does
not (P2, P6).

Sections that add no rule of their own (A0 to A16 are the axioms of
§11.5D):

- §1's first two paragraphs say what the instruction `using ODD, build
  this product` means by naming rules of §5, §10 and §11, which the rows
  trace.
- §16 lists fifteen failure patterns. Each is the violation of a rule a
  row traces: 1, §5 Nodes and Vectors; 2, §5 Graph functions; 3, §11.7;
  4, §6 and §11.7; 5, §12; 6, A6 and §11.9; 7, §11.8; 8, §11.9; 9, §11.2,
  §11.2A and §10 Query and service layers; 10, §11.2A; 11, §11.2A and
  §11.5A; 12, §11.5B; 13, A9; 14, A0, A12 and A16; 15, §11.7A.
- §19 asks fourteen questions, each for the surface that a traced rule
  requires: 1, §17 step 4; 2, §11.1; 3, §11.2; 4, §11.3; 5, §11.4; 6, §10
  and A15; 7, §11.5; 8, §11.5C; 9, §11.5B; 10, §11.5D; 11, A8 and A9; 12
  and 13, §11.9; 14, §11.7A. Its closing sentence is a diagnostic over
  those surfaces. Whether a product is built correctly is decided by §11,
  and whether a move complies by the audit of §9.
- §20 is a compression of this member and owns no determination (§20).

Purpose and material relation: an actor
started on this member sees which rules follow from the foundations and
which are choices, and who owns each choice, so no choice is presented as
derived (P6, P1).

## 2. Method role

[SPEC_METHOD](SPEC_METHOD.md) is the general constitutional method: the
baseline for goals, intent, product, requirements, design and lawful
re-entry. This profile is the graph-native ODD product-authoring method
whose primary constructive carrier is GTL-defined graph functions. It holds
two kinds of law: constitutional law for graph-native traversal governance
(assets, vectors, traversal, graph functions), and product-authoring law
for building an ODD product correctly over that substrate (P1, P6).

The profile does not replace a product-specific domain method such as the
world-model profile (WORLD_MODEL, tier 3). Where a product is both ODD and
world-model-driven, this profile governs graph-native structure and ODD
product shape and the world-model profile governs world-model semantics,
publication and composition law. The two compose (P1, P4a).

## 3. Method composition

This profile alone does not suffice for domain-correct product work. It
gives the structural law for how a graph-native ODD product should be
built. It does not give the product's domain semantics, its current intent
and product-definition line, its local capability and constraint
requirements, or its currently ratified design surfaces (P1, P2).

The composition rule: this profile says how to build the product as a
graph-native ODD product; domain methods say what semantic law the product
must honour; the local `INTENT.md`, `PRODUCT.md`, requirements and design say
what the currently ratified local line is. For a graph-native
software-development ODD product, this profile provides the substrate and
structural law and the product's local `INTENT.md`, `PRODUCT.md`,
requirements, design records and GTL surfaces provide the local line. For
a world-model product, this profile provides the substrate and structural
law, the world-model profile provides the semantic law, and the product's
local `INTENT.md`, `PRODUCT.md`, requirements and design provide the local
line (P1, P2).

An agent that reads only this profile should understand the paradigm.
To build one concrete product correctly it must then read the
product-specific method and the local authority surfaces (P1, P2).

## 4. Method library classes

The method library has two roles: mutable source authors a future release,
and consumers select one complete immutable release. The source library in
the methodology's source repository is the authoring library for the next
method cut; mutable source governs no consumer before publication and
explicit selection. The shared versioned STDO store holds each installed
distribution of one selected immutable release cut. A product definition
addresses that distribution by an exact logical release URI and
installed-manifest digest, independent of the machine-local store path; a
project-local copy is optional and is not the default (P6, P3;
[PRODUCT_DEFINITION §4](PRODUCT_DEFINITION.md#4-shared-installed-release-basis-and-toolchain-manager)).

The selected immutable cut is consumer authority. Installed bytes must
match that cut; mutable source and the moving version-line selector cannot
silently repair, replace or outrank it. A mismatch is an adoption defect,
resolved by selecting and installing one complete released cut and not
by mixing source and installed members. When an installed distribution
disagrees with its selected immutable release, the selected release wins
and the installation must be repaired. Mutable source authors a future
cut; it does not govern the installed consumer (P6, P3;
[RELEASE §4](RELEASE.md#4-selector-and-consumer-adoption)).

Both the authoring library and an installed distribution contain three
classes of document. Method members are the constitutional method
surfaces, the members that [README](README.md#documents) names as method
members: the tier 1 and tier 2 standards and, when a
project selects them, the tier 3 profiles. Guides (`*_GUIDE.md`) are operational guides and application standards
that refine application of the method. Templates (`*_TEMPLATE.md`) are
reusable starter forms and examples and are convenience artifacts only.
Only method members are constitutional method surfaces (P6, P3).

## 5. Graph model

The product is expressed as a declared asset graph over the state
transitions relevant to the product's work (P0, P3).

### Nodes

Nodes are durable truth surfaces or product assets; each names a bounded
state of truth. In one software-development ODD product the nodes include
`intent`, `product`, `requirements`, `design`, `module_decomp`, `code`,
`uat_testcases`, `integration_tests`, `bootloader` and build targets. Those
names are illustrative and product-local; the law is that nodes name
bounded states (P3).

### Vectors

Vectors are the lawful transitions between nodes and are the admissible
transitions of the product. Each vector declares its required upstream
assets, its target asset, its governing evaluators and gates, and its
output contract (P4a, P6).

### Probabilistic compute

Probabilistic compute in this profile is bounded constructive work over
one declared vector or edge traversal, where the graph or runtime does not
fully determine the worker's internal solution path. One vector or edge
traversal is the bounded unit of probabilistic compute (P0).

Binding of the bounded step. FOUNDATIONS P0 lets a
profile bind the bounded step to its own traversal unit and names
[PROFILES §2](PROFILES.md#2-graph-execution), which indexes this profile,
as the keeper of that binding. Direction: from the step of
FOUNDATIONS P0 to one declared ODD vector or edge traversal. Preserved
meaning: the step's selected context fits the actor's envelope, the
actor's internal path within the step is its own, and the traversal is
the admissible external space. Narrowed scope: one declared vector or edge
traversal of a published graph. Invalidation: a change to FOUNDATIONS P0,
to the vector's declaration or to the selected basis invalidates the
binding until it is evaluated again (P0, P1).

The vector declares the admissible external traversal space: required
upstream assets; target asset or output contract; required context; role
or capability expectation; governing evaluators and gates; provenance
obligation; and the lawful stop, hold, gap, continuation or completion
states. ABG may govern, invoke, observe and classify the traversal; it
does not own the worker's hidden constructive path. Whatever the traversal
boundary does not constrain remains worker-internal HOW: hidden LLM
reasoning, heuristic search, domain implementation strategy, tool-local
execution detail and product-specific business choice (P0, P6).

The classifications of work inside one traversal bind two profile
specialisations and one common import. Equal spelling alone establishes
none of those relations (P1, P3):

- `F_P` (`urn:stdo:concept:graph-native-odd:f-p`) is the shorthand for the
  bounded probabilistic worker turn. It specialises substrate-neutral
  lawful probabilistic processing: it keeps bounded non-human construction
  under declared policy and narrows that meaning to one graph traversal
  contract.
- `F_D` imports `urn:stdo:concept:axiomatic-calculus:f-d` from
  [AXIOMATIC_CALCULUS §5](AXIOMATIC_CALCULUS.md#5-traversals-and-functor-kinds)
  in the exact complete STDO release selected by the application, including
  its immutable calculus edition. It adds the graph traversal's operation
  contract, scope and authority, not another definition of the kind.
  Existing evaluation and proof operations retain the unchanged-subject
  evaluation profile; admission and construction operations retain their
  own evidence contracts and grants. Use of the common kind is conditional
  on the total-domain eligibility assessment in
  [RELEASE §9](RELEASE.md#deterministic-kind-migration). Domain-local
  optimization or validation moves no domain HOW into GTL, ABG or the
  framework and grants no broader consequences.
- `F_H` (`urn:stdo:concept:graph-native-odd:f-h`) is the shorthand for
  explicit human adjudication invoked under the traversal's declared
  authority and ambiguity policy. It specialises the substrate-neutral
  human-adjudication concept and grants a human no ambient traversal,
  semantic or closure authority.

F_P and F_H are the two declared specialisations that PROFILES §1 requires. The F_P
specialisation runs from
`urn:stdo:concept:ambiguity-governance:lawful-probabilistic-processing` to
`urn:stdo:concept:graph-native-odd:f-p`; the F_H specialisation runs from
`urn:stdo:concept:ambiguity-governance:human-adjudication` to
`urn:stdo:concept:graph-native-odd:f-h`. The source concepts and their
context are owned by
[SPEC_METHOD §5](SPEC_METHOD.md#5-ambiguity-governance-and-lifecycle); this
profile owns the targets in the graph-native ODD context (P1, P6).

Both relations preserve the source meaning and authority, narrow scope to
a declared ODD traversal, and add graph-contract and runtime-control
coordinates. They exclude processing or adjudication outside that
traversal, refuse ambient worker or human authority, and have no implied
inverse. Their source and target basis is the selected complete STDO
release, their governed scope is ODD traversal, and this clause is their
provenance carrier. A change to either concept or context, to the basis,
to the scope, to the preserved or narrowed meaning or to the control
contract invalidates the affected specialisation until it is evaluated
again (P1, P3, P6).

The F_D import runs from the common concept to its use under this profile,
preserves the common total deterministic contract, and narrows each use to
its declared ODD operation. Its source and target basis is the exact
selected complete release; a change to that edition, traversal contract,
material dependency, termination evidence or authority invalidates the
affected eligibility claim. The former
`urn:stdo:concept:graph-native-odd:f-d` remains a historical concept on its
legacy edition. It is not an unconditional alias: only the explicit
[migration mapping](RELEASE.md#deterministic-kind-migration) licenses a
successor use, preserving the original evidence, permissions and results.

The profile governs the traversal contract, its evidence, its provenance
and its control truth. It does not make the framework the executor of the
domain's internal solution strategy (P0, P6).

### Graph functions

Graph functions are named constructive programs that realise vectors. A
graph function may realise one outer vector directly, refine one outer
vector into a small inner workflow, or act as a reusable higher-order
library function. The outer vector remains the constitutional contract;
the graph function is the constructive realisation of that contract (P4a,
P0).

Binding of refinement.
[ACTIVATION §4](ACTIVATION.md#4-totality-and-refinement) generalises the
refinement of one outer vector into an inner workflow to any realisation,
lets a refinement carry an earlier output to a later step only through a
declared adapter or specialised contract whose declared domain names it,
and names [PROFILES §2](PROFILES.md#2-graph-execution), which indexes this
profile, as the keeper of the ODD binding. This profile declares the
cumulative carried environment of
[§11.8](#118-cumulative-environment-law-is-mandatory) as that specialised
contract; §11.8 is conserved as profile law and is not generalised into
the core. Direction: from the typed refinement of ACTIVATION §4 to a graph
function that refines one outer vector, with the §11.8 environment as its
specialised contract. Preserved meaning: the outer vector stays the
callable contract; the inner steps conserve it and every applicable
invariant; and each inner function's input satisfies its declared domain
and preconditions, as AC-016 requires. Narrowed scope: one published outer
vector and its declared inner workflow, whose retained functions should
declare `environment.requires`, `environment.provides` and
`environment.carries` (§11.8); a later function's declared domain is its
`environment.requires`, which may require any typed binding available in
the cumulative carried environment, not only the immediately previous
output. Invalidation: a change to ACTIVATION §4, to §11.8, to the outer
vector or to a function's environment declaration invalidates the binding
until it is evaluated again (P4a, P4b, P1).

### Traversal

The workflow is a traversal over the graph: bind the current target;
locate the next admissible vectors; traverse one vector; materialise the
next asset; prove the vector closed; continue until the selected target
closes. The graph is the declared program space of the product (P0, P5).

## 6. Product boundary

The graph-native product and the project built with it are distinct. The
installed product provides the method, the runtime and the carrier
surfaces; it does not provide the target project's business domain. The
installed product must not assume prior knowledge of the target project's
domain (P6, P3).

A clean install means: install the graph-native ODD product; author the
target project's intent, product definition, requirements and realisation
root; traverse the product graph to build the target project's domain
outputs (P0, P6).

The installed product owns the graph-native method and its
traversal-control substrate, the runtime and control surfaces, the command
surfaces, the release-managed methodology surfaces and the project
scaffold templates (P6).

The target project owns (P6, P3;
[PRODUCT_DEFINITION](PRODUCT_DEFINITION.md#1-overlay-and-layout-independence)):

- one `stdo_<label>.json` definition for each distinct product WHAT,
  locating its constitutional, local and collective reference-frame
  basis, realisation, work and composition surfaces;
- its constitutional surfaces under SPEC_METHOD, where `GOALS.md`,
  `INTENT.md`, `PRODUCT.md` and `requirements/` are the default
  software-development scaffold and not mandatory names;
- one or more realisation roots bound through `how.build_tenants`, where
  `build_tenants/` is the default root name for software-development ODD
  products and existing projects and other domain types may use their own
  locations;
- its domain outputs and evidence: design, code, tests, documents and
  proof surfaces for a software-development ODD product, and each other
  domain's own produced artifacts named accordingly.

## 7. Self-host boundary

Self-hosting is lawful only while the installed product in use stays
distinct from the product under development. A released installed product
may help build the next version of itself, but the two must not collapse
into one mixed authority surface. The distinction is between the installed
released builder and the in-development product being built, the same
boundary one compiler release keeps when it builds the next (P6, P3).

The framework must preserve distinct territories, authority surfaces,
runtime state, and project-owned specification and build-tenant surfaces. If
automation, runtime resolution or qualification silently merges those
surfaces, the framework violates this profile (P6, P3).

## 8. Responsibility layers and local binding

This profile governs structural responsibility layers and their required
publication shape. It does not freeze one product's local asset names as
universal ODD doctrine. A responsibility layer expresses one capability
class; the product binds that capability to its own local domain
semantics; the GTL carrier publishes the lawful transitions for that bound
capability (P1, P3).

Capability classes may include bootstrap or intake, design,
implementation, qualification, release, operational transition and
retrofit. They are responsibility-layer ideas, not mandatory universal
instance names (P1).

In one concrete product each active layer should bind explicitly to local
typed assets or typed nodes, public graph-function carriers, the required
carried environment, proof or closure surfaces, and projection or query
surfaces. An audit should therefore distinguish clearly between shared
ODD structural law and local product semantic bindings (P3, P6).

A product that copies another product's local asset names without
semantic need is not reusing the method; that is accidental doctrine
transfer. A product that declares a capability in prose but does not bind
it into typed assets, graph functions and proof lanes has under-built that
capability (P1, P2).

## 9. Method governance and audit

Products governed under this profile should be audited against it as the
shared constitutional surface. The audit should ask at minimum (P6):

- which responsibility layer or capability class is being implemented;
- which local typed assets or nodes bind that capability into the product;
- which public graph functions carry the constructive transition;
- which proof or closure lane justifies the capability;
- which projected or query state is exposed without replacing ABG runtime
  truth;
- whether any product command, service or query surface is trying to
  replace ABG continuation with tenant-local orchestration;
- whether the execution-authority audit (§11.5B) proves that traversal
  loops, actor invocation, process supervision, retry and continuation,
  runtime events and closure folds remain owned by ABG.

Approved shared-pattern work must update this profile when it changes or
clarifies the reusable structural law; product-local work may stay local
when it changes no shared structural law. Grey work must not be silently
absorbed into the line (P6, P2).

An implementation or design move that the current profile does not
clearly cover must be evaluated against this profile and resolved as one
of: compliant with the current profile; non-compliant with it; or valid
and worth incorporating into it. If the result is incorporation, the
implementation is not fully approved until this profile is updated. If the
result is non-compliance, the implementation should be repriced, repaired
or rejected, not normalised by repetition (P6).

Mapping of the audit outcome to the core result algebra. Purpose: [FOUNDATIONS §4 Results](FOUNDATIONS.md#results) states
the outcome of every evaluation in the core. Material relation: a design,
ticket or proof that consumes the audit reads incorporation as neither
compliance nor failure. Each outcome maps for the predicate "the move
complies with the current profile" (P5, P6):

| Outcome | Core value | Ground |
|---|---|---|
| compliant | satisfied | the move meets the law of the current profile |
| non-compliant | falsified | the law of this profile that the move violates is the counterexample |
| valid and worth incorporating | out_of_frame | the current profile does not declare the law the move needs; the outcome names that law, this profile as its owner and the update it requires, which is the reconfiguration pressure of out_of_frame ([FOUNDATIONS §4 Results](FOUNDATIONS.md#results), Out of frame or indeterminate) |

In practice no shared structural pattern becomes approved by usage; no
grey pattern becomes constitutional by drift; reusable structural law is
ratified in this profile; and local product law is ratified in the
product's own authority surfaces (P6, P3).

## 10. What an ODD product is

An ODD product is a configured GTL/ABG domain product whose constructive
work is carried by published graph functions over typed domain assets. Its
stable application boundary is (P6, P3):

```text
App
= Bootstrap Surface
+ Initialization Surface
+ Domain Configuration
+ Typed Domain Assets / Nodes
+ GTL Function Catalog
+ GTL Module
+ Policy Hook Bindings
+ ABG Runtime
+ Projection / Query Surface
+ Proof Surface
```

The ownership split is read strictly. The two topology subsections below
name the default topology of a software-development ODD product in this
ecosystem; the product's `stdo_<label>.json` definition under
[PRODUCT_DEFINITION](PRODUCT_DEFINITION.md) binds the actual locations. At
the universal layer this profile commits to the authority split (one WHAT
surface, one HOW relation, runtime owned by ABG, product owning domain
meaning) and not to directory names; existing projects and other ODD
product types may use another layout that keeps the split (P6, P1).

The product definition's `reference_frame_bases` bindings carry the
evaluation-frame meaning of [REFERENCE_FRAME](REFERENCE_FRAME.md). An ABG
runtime `Frame`, attention frame, zoom frame or overlay frame stays an
ABG-owned runtime contract in WHAT and HOW; its name does not enrol it in
the project's collective evaluation frame set. A declared evaluation frame
may inspect such a runtime frame as its exact subject or coordinate
without collapsing the two (P1, P3).

### Product specification (software-development topology)

The product definition's `what` bindings locate the authoritative WHAT;
`specification/` is the default software-development location. It defines
intent, product position, goals, requirements and scenarios (P6).

### Product realisation (software-development topology)

The product definition's `how` bindings locate the authoritative HOW;
`build_tenants/` is the default software-development location. It carries
design, GTL publications, code, tests and local proof surfaces (P6).

### ABG

ABG owns traversal; dispatch; actor invocation; process supervision;
graph-call realisation; runtime facts; runtime event emission and replay;
frames; continuations; retry and correction control; closure folds over
runtime truth; re-entry after publish boundaries; lineage and provenance
(P6).

### ODD product

The ODD product owns domain asset meaning, graph-function meaning, the
published function catalogue, policy overlays, domain query projections,
and closure and gap interpretation for its domain (P6, P1).

### Query and service layers

Service or query layers may own transport, sessions, routing,
browser-safe projection and API surfaces. They own neither runtime truth
nor continuation truth. The real constructive carrier is never hidden
behind the word service (P6).

## 11. Core law

An ODD product is built correctly only when every clause of this section
holds (P6).

### 11.1 Typed assets and nodes are explicit

The product works over explicit typed assets or typed nodes. It does not
work over one hidden project blob, one giant mutable workspace object or one
undocumented service payload. Concrete assets must bind explicitly into
typed domain boundaries. Where an asset is a real produced or consumed boundary,
its `asset_surface` is declared (P3).

### 11.2 Graph functions are the primary constructive carrier

Every operative constructive step is carried by one named `GraphFunction`
or one lawful graph-function composition. The real carrier is never left
inside orchestration loops, bespoke Python pipeline runners, controller
scripts, or service methods that only happen to call GTL-adjacent helpers
(P0, P4a).

### 11.2A Outcome-first realisation order

Because this profile makes an edge traversal the unit of compute, an ODD
product must use that unit of compute to build its own operative framework
behaviour. The required order is: declare the outcome
traversal over typed assets; publish the declarative GTL/ABG carrier
structure; implement only the minimal imperative adapter code that remains
necessary (P0, P6).

An outcome traversal declares the governed movement before
implementation: source asset type; target asset type; edge traversal or
graph-function name; closure or evaluation obligation; lineage obligation;
ambiguity or gap obligation; allowed `F_D`, `F_P` and `F_H` bindings. The
declarative carrier structure is GTL graph functions, typed nodes,
vectors, operator bindings, evaluator bindings, carrier schemas, policy
declarations, projection declarations and lineage ledger declarations
(P0, P3).

Imperative adapter code is lawful only where it transports or persists
facts: file or network IO; CLI or API transport; event persistence;
runtime invocation; projection rendering; tool execution already admitted
by a declared traversal. Imperative code must not own domain meaning,
semantic target movement, step selection, closure semantics, lineage truth
or constructive workflow truth. Framework behaviour implemented
imperatively first and only later described in GTL vocabulary is
ODD-shaped but not yet ODD-built (P6, P0).

### 11.3 The function catalogue is published

The live line must publish a machine-readable function catalogue. At
minimum each retained function should expose its name, inputs, outputs,
intent, and public or helper role. A callable surface that exists only in
prose or in prompt memory leaves the product under-built (P6, P3).

### 11.4 The GTL module is the operative publication surface

The product must publish the public graph-function carriers, the graph or
graphs those carriers traverse, typed node and vector surfaces, and the
semantic jobs or equivalent outer callable contracts bound to the public
carrier. Callers are never bound directly to hidden inner vectors (P4a,
P3).

Where a public carrier refines into inner executable structure, the live
traversal boundaries are published explicitly through lawful GTL boundary
surfaces such as `RefinementBoundary` or `CandidateFamily`. The outer
public carrier remains the callable contract (P4a, P3).

### 11.5 Current state is a projection over constructive history

Visible current state is a projection and does not replace runtime truth.
The ODD query lane may expose asset views, function catalogue views,
checkpoint overlays, provenance overlays and domain-specific
explainability overlays; it must not redefine ABG runtime facts (P3, P6).

### 11.5A ABG owns continuation and re-entry

An ODD application over GTL/ABG is a cooperative subsystem, not a
replacement runtime. ABG owns continuation authority, re-entry after
publish boundaries, the graph-call lifecycle, and step selection over the
declared graph (P6, P0).

The product may publish typed assets and evidence, execute one admitted
bounded constructive step, publish downstream read models or domain
overlays, and return control to ABG. The product must not own a hidden
continuation loop; carry multi-step controller memory across publish
boundaries; infer later steps locally instead of re-entering through ABG;
treat public `next` and explicit graph-function continuation as rival
authorities inside one controller; or build product-local orchestration
that in effect replaces ABG (P6).

An application that replaces ABG continuation with tenant-local control
flow no longer behaves as an ODD application over GTL/ABG. It has drifted
into a different architecture that only happens to publish some
ODD-shaped artifacts (P6).

### 11.5B Execution authority audit

An ODD product over GTL/ABG that changes runtime, `start` or `iterate`,
worker transport, actor invocation, process supervision, plugin dispatch,
event projection, closure, assurance, retry or continuation semantics
must include an execution-authority audit before activation and closure
(P6).

The audit must prove that exactly one execution authority exists for the
affected traversal. For a consumer using the GTL and ABG roles, that
authority is the one consumer-bound realisation of the ABG role, including
when the realisation under change itself implements that role. A
different realisation is lawful only under an explicitly ratified,
non-overlapping runtime scope (P6, P3).

The audit must inventory at least these surfaces (P6):

| Surface | Lawful owner | Product or plugin role | Forbidden local implementation |
| --- | --- | --- | --- |
| Traversal selection and vector advance | ABG | Declare graph functions, vectors, assets, and domain policy inputs | Product-local runner deciding the next traversal step |
| Actor invocation and process supervision | ABG | Provide actor bindings, prompts, payload adapters, and evidence adapters | Product-local worker `spawn`, `spawnSync`, `exec`, timeout, kill, or stdout/stderr supervision outside the ABG actor seam |
| Retry, correction, continuation, and re-entry | ABG | Publish bounded-step outputs and return control | Product-local retry loops, carry-over controller memory, or hidden `next` authority |
| Runtime event emission, append, replay, and projection | ABG | Map domain evidence into admitted event payloads | Direct event append, side ledger mutation, or projection reconstruction that bypasses ABG runtime truth |
| Closure fold and assurance gate | ABG, with product policy and gain inputs | Provide domain interpretation, evaluators, gap reasons, and policy weights | Worker self-report or product postflight directly closing the runtime unit |

Where these surfaces admit a consequential entity transformation, ABG's
admission authority is the graph-native specialisation of transformation
admission completeness, whose admission semantics
[ACTIVATION §4](ACTIVATION.md#complete-enclosing-relation-admission) owns;
the software-design profile applies that law in
[DESIGN_MODULE, Transformation admission completeness](DESIGN_MODULE.md#transformation-admission-completeness-up-016).
ABG's broader execution, supervision, retry and projection authority
continues to derive from this profile and is not thereby reclassified as
admission authority. `F_P` and `F_H` are the ODD projections of the
candidate-producer and human-adjudication roles, which this profile binds
to the source concepts of SPEC_METHOD §5 in
[§5 Probabilistic compute](#probabilistic-compute) (P6, P1).

Reviewing produced artifacts alone does not satisfy the audit. It must
include a code, call-graph or static-surface review appropriate to the
language and tenant, and it must name the evidence used to rule out hidden
execution authority (P6).

Any of these conditions prevents closure (P6):

- a downstream product contains its own `start` or `iterate` loop for an
  ABG traversal;
- product or plugin code supervises worker processes outside the ABG
  actor seam;
- product or plugin code constructs retry, continuation or re-entry state
  outside ABG;
- product or plugin code appends runtime events or mutates runtime ledgers
  without ABG admission;
- plugin output carries next-vector, closure, actor-invocation, process
  or runtime-event authority instead of evidence or policy input;
- two controllers can each claim authority for one traversal.

When any is present, the product may be useful but is not currently
ODD-correct over GTL/ABG (P6).

### 11.5C Projection-source coherence

Projection and query lanes are downstream read models over admitted
carrier, runtime, event or source truth. They may summarise, index,
filter or render that truth; they must not reconstruct an alternate
authority surface beside the admitted carrier (P3, P6).

For an ODD product: function catalogue views must reconcile to the
admitted GTL module or public carrier; asset ownership and start-target
views must be derived from, or structurally compared against, the admitted
carrier they expose; runtime status views must derive from ABG runtime
facts, events, replay or projection truth; domain query overlays must fail
closed when the carrier they describe is missing, stale or structurally
divergent (P3, P6).

Name equality is not enough. A same-named graph function, node, carrier,
policy or route with different inputs, outputs, vectors, declarations,
ownership or closure law is a different truth surface until reconciled.
Negative proof for a projection must include structural drift, not only
missing source truth (P3, P6).

### 11.5D Constructive evaluation and yield loop

Every ODD product over GTL/ABG must preserve one constructive evaluation
loop running from intent lineage and model synthesis through observation
to the next lawful action. This is the profile's homeostasis loop, and
its constitutional surface names the operative functions directly:
`synthesize_model`, `eval_gap`, `evaluate_next` and `evaluate_action`
(P2, P5, P6). The loop is this profile's binding of
[ACTIVATION §1 Feedback and diagnosis](ACTIVATION.md#construction-relation):
it corrects towards the required conditions as observations arrive,
guarantees neither convergence nor the adequacy of those conditions, and
its diagnoses distinguish the four causes named there (P2, P6).

The selected Product outcome under
[SPEC_METHOD §3 Outcome conservation](SPEC_METHOD.md#3-outcome-conservation) is external
authority for this loop. Product models, gaps, assurance, ledgers and
projections may interpret that outcome but cannot author, select or
enlarge it. `evaluate_next` may select material work only within that
outcome or within an admitted bounded prerequisite or experiment. Graph or
edge closure is evidence toward Product acceptance and is neither Product
nor release acceptance (P2, P6).

The loop selects no further material work without another admitted basis
once the selected outcome is accepted; an admitted prerequisite is
discharged; an admitted experiment's stated decision is resolved; another
admitted terminal condition is reached; or its governing basis or bound
is exhausted, rejected, withdrawn, superseded, repriced away or
falsified. A `reprice` disposition requests lawful constitutional
re-entry; it neither performs the reprice nor selects the successor
outcome (P2, P6).

The loop is framework-independent. Implementations may use other carrier
names but must keep this authority shape (P6, P4a):

```text
selected Product outcome and admitted bounded-basis refs
-> TargetObligationBinding

IntentLineage
-> ProductAssetModel
-> ObservationSnapshot
-> GapPressureRow
-> TargetObligationBinding
-> PriorityProjection
-> ConstructionIntent
-> AdmittedEvidence
-> EdgeFulfillmentLedger
-> EdgeClosureDecision
-> NextActionProjection
```

The objects have these meanings (P3, P6):

| Object | Definition | Authority |
| --- | --- | --- |
| `IntentLineage` | Admitted source intent and its lineage refs: human, imported source, prior product, intent engine, or prior synthesized construction intent. | ABG event-log truth over source intent. It seeds the product model and must not invent graph actions. |
| `ProductAssetModel` | Desired and known typed asset model synthesized from intent lineage, prior model, and admitted product truth. | Product-owned model truth whose publication basis is carried by admitted events and product-owned projection refs. It is not runtime fact or action authority. |
| `Worksite` | Current workspace, runtime archive, transform assets, product asset root, profile, and observed file or process state. | Observable substrate, not authority by itself. |
| `RuntimeEventLog` | Append-only admitted runtime facts. | ABG runtime truth. |
| `RuntimeProjection` | Replay-derived current runtime state over event log and execution basis. | ABG projection truth. |
| `ObservationSnapshot` | Read-only view of runtime truth plus worksite facts relevant to construction. | ABG evaluator carrier with product domain rows. |
| `GapPressureRow` | Typed pressure over missing, partial, blocked, waiting, or ambiguous assets and evidence. | Product domain meaning over admitted observation. |
| `TargetObligationBinding` | Exact binding from gap pressure to the selected Product outcome, any admitted prerequisite or experiment basis, target assets, required roles, evidence refs, and admissible graph outcomes. | Product domain binding over GTL/ABG action authority. |
| `ActionCatalog` | Published lawful graph actions: graph functions, vectors, targets, inputs, and eligible outcomes. | GTL/product publication consumed by ABG. |
| `NextActionBasis` | Sum type naming why `evaluate_next` is being called: `initial_selection`, `post_yield_resume`, `post_close_graph_continuation`, `post_retry`, `post_repair`, `post_reenter`, `post_reprice`, or `post_block`. `post_reprice` records a re-entry request and carries no action-selection authority. | Dispatch basis for next-action evaluation. It is not a separate controller. |
| `PriorityProjection` | Deterministic ranking over bound lawful actions under visible policy. | ABG evaluator kernel plus product policy. |
| `ConstructionIntent` | Admitted selected action for one bounded graph invocation, preserving the selected outcome or admitted bounded-basis refs carried by its target binding. | ABG admission and traversal authority. |
| `AdmittedEvidence` | Admitted worker, process, product, execution, materialization, liveness, and postflight evidence. | ABG/product admission, not worker self-closure. |
| `EdgeFulfillmentLedger` | Evidence and convergence carrier for one edge attempt or version. | Closure evidence truth. |
| `EdgeClosureDecision` | Sum type over the ledger: close, yield, retry, repair, re-enter, reprice, block. | Closure decision truth. |
| `NextActionProjection` | Read model that observes `NextActionBasis` plus current truth and selects a next graph action only when lawful. | ABG next-action evaluation projection with product policy. |

The loop has one model-synthesis function and three distinct evaluation
functions. They may share underlying libraries; they must not share
authority (P6):

| Function | Inputs | Output | Boundary |
| --- | --- | --- | --- |
| `synthesize_model` | `IntentLineage + prior ProductAssetModel + admitted product truth` | `ProductAssetModel` | Model synthesis. It may update desired and known typed asset truth. It must not observe the worksite, select work, invoke work, or close work. |
| `eval_gap` | `ProductAssetModel + RuntimeEventLog + RuntimeProjection + Worksite` | `ObservationSnapshot + GapPressureRow` | Read-only gap discovery. It compares desired model truth to observed reality and emits missing, partial, blocked, waiting, or ambiguous asset pressure. It does not choose work and does not close work. |
| `evaluate_next` | `NextActionBasis + fresh eval_gap + TargetObligationBinding + ActionCatalog + Policy` | `PriorityProjection + NextActionProjection + selected_action`; for a typed no-action, also its own core result (A4) | Next-action selection. `TargetObligationBinding` carries the exact selected Product outcome and any admitted bounded-basis refs. `NextActionBasis` is either `initial_selection(IntentLineage, ProductAssetModel)` or one explicit post-action basis derived from an `EdgeClosureDecision`: `post_yield_resume`, `post_close_graph_continuation`, `post_retry`, `post_repair`, `post_reenter`, `post_reprice`, or `post_block`. Except for unresolved `post_reprice`, which returns typed no-action pending separately admitted constitutional authority, it may select only published lawful graph actions that bind to the gap and governing basis. It does not admit construction intent and does not evaluate the result of an action. |
| `evaluate_action` | `ConstructionIntent + AdmittedEvidence + TargetObligationBinding + Policy` | `EdgeFulfillmentLedger + EdgeClosureDecision` | Action-result evaluation. It decides close, yield, retry, repair, re-enter, reprice, or block for the action just taken. It does not choose the next graph action. |

The word evaluator is not sufficient by itself. A design, ticket, code
module or proof must name which function it implements or consumes:
`synthesize_model`, `eval_gap`, `evaluate_next` or `evaluate_action`
(P6, P3).

Intent has lineage through the loop. Bootstrap or external intent may come
from a human, an imported source, a prior product or an intent engine;
that intent seeds the product asset model that `eval_gap` uses. Current
construction intent is synthesised against that model and the observed
gap, then admitted by a distinct admission step after `evaluate_next`
selects a published graph action. Intent does not invent unpublished
actions: gap-derived action selection supplies the selected action basis
for admitting current construction intent over an already-published graph
function or vector. `ConstructionIntent` must cite the lineage, the
selected action and the `TargetObligationBinding` that preserve the exact
selected Product outcome and any admitted bounded-basis refs (P4b, P6).

The loop is governed by the axioms A0 to A16, each a labelled paragraph
below (P6).

A0 One surface. There is one authoritative computational surface for
traversal consequence (P6, P3):

```text
IntentLineage
-> ProductAssetModel
-> ObservationSnapshot
-> GapPressureRow
-> TargetObligationBinding
-> PriorityProjection
-> ConstructionIntent
-> AdmittedEvidence
-> EdgeFulfillmentLedger
-> EdgeClosureDecision
-> NextActionProjection
```

No CLI branch, prompt prose, postflight string, gap-dossier action list,
query projection, service method or local operator summary may become a
rival source of traversal truth (P6).

A1 Worksite is observed, not trusted. The file system, process output,
screen logs, worker artifacts and product files are observations. They
become authority only after admission into typed evidence and their fold
into ledger and decision truth (P6, P3).

A1a Workspace-ledger governed work pair. The worksite or workspace and the
ledger form the governed work pair (P3, P4b):

```text
W = mutable workspace under construction
L = immutable governed ledger of work over W
E = immutable event log / replay spine
Ev = evaluator work over L
```

The workspace is where F_P construction happens. The ledger is the
immutable governed account of closure-relevant work over that workspace;
it is not a copy of the workspace but the admitted trace of callout basis,
observed deltas, file refs, digests, execution evidence, obligations
touched, claims made, evaluator inputs, evaluator outputs and admission
status. The loop is (P3, P6):

```text
F_P acts in W.
Admission records governed facts in L.
E orders and anchors L entries with predecessor refs.
Ev evaluates a declared L snapshot, not ambient W.
Ev output is itself F_P work and is admitted back into L/E.
L/E constrain the next lawful F_P action in W.
```

The consistency rule is (P3, P6):

```text
W can change without being true.
L can be true without being the whole W.
Closure can only use W through L.
Eval can only judge W through L.
Eval only affects traversal after its own L/E admission.
```

Every closure-relevant F_P callout that does work needs ledger admission.
Evaluator work is not outside F_P merely because it reads ledgers: it is
F_P work over governed ledger state, and its result must be admitted into
the immutable ledger and event spine before it can affect closure, routing
or traversal. Corrections append or supersede ledger and event facts; they
do not rewrite the governed history of work (P4b, P6, P3).

A1b Ledger is governed attention. A ledger is the system's governed
attention over construction history. This is a structural analogy and not
an implementation dependency on transformer attention: model attention
selects from context through learned weights, while ODD ledger attention
is typed, immutable, lineage-constrained, policy-bounded and replayable.
An evaluator may attend only to admitted ledger rows reachable through
declared lineage, predecessor refs, target binding, policy and the
relevant event-log cursor. Workspace facts, worker prose, archives,
summaries and controller memory outside that reachable ledger set lie
outside the evaluator's lawful attention surface. Lineage is therefore
not only provenance bookkeeping: it is the attention graph that decides
which evidence the evaluator may see, what it must ignore, and which
predecessor chain makes the judgment reproducible (P0, P6, P3).

A2 Exact target binding. Every constructive action must bind the current
gap to exact target assets and obligations before invocation (P2, P3):

```text
selected Product outcome ref
+ optional admitted prerequisite or experiment basis ref
+ gap pressure + target assets + required roles + evidence refs
-> TargetObligationBinding
```

A broad edge cannot satisfy a specific product or evidence gap unless the
binding proves that edge is the lawful action for those exact assets
(P2).

A3 Published action law. `evaluate_next` may rank only published lawful
actions from the action catalogue. If the desired action is unpublished,
the lawful result is a typed no-action disposition, not a fallback to a
broad executive graph or a local script (P6, P5).

A4 `evaluate_next` totality. `evaluate_next` must be total. On
`initial_selection` it selects from the current model, current gap, target
binding, catalogue and policy. On `post_yield_resume` it resumes or yields
the same edge from replay-visible resume truth without classifying the
action as failure. On `post_close_graph_continuation` it may select the
next graph edge after the current edge closed, or no action when the graph
is complete. On `post_retry`, `post_repair`, `post_reenter` and
`post_block` it follows this rule (P5, P6):

```text
if higher-priority lawful action exists:
  select it
else if current graph edge remains lawful:
  follow the graph
else if authority is missing:
  reprice or block
else:
  block with typed no-action disposition
```

On `post_reprice`, `evaluate_next` must return a typed no-action
disposition while constitutional re-entry stays unresolved. The reprice
decision cannot authorise a replacement action; work may be evaluated
again only after lawful re-entry separately admits an exact selected
Product outcome or bounded basis and supplies it through a new
`initial_selection` or a basis-bearing resume. Default graph following is
ordinary, but it is still an `evaluate_next` decision and not hidden
sequential control (P5, P2, P6).

Selection and its results. `evaluate_next`'s selection of what is
invoked next is invocational data (A11) and is not itself a value of the
core result algebra of
[FOUNDATIONS §4 Results](FOUNDATIONS.md#results). A typed no-action
disposition, however, records a material determination: that no
published lawful action can be selected. Each typed no-action returns its
own result for the predicate "a published lawful action can be selected
for the current gap on the exact basis", refined by cause as A8 refines
`block`, on `initial_selection` and after a closure decision alike. A
closure decision it follows (`post_retry`, `post_repair`, `post_reenter`,
`post_block`, `post_reprice`) keeps its own value for the edge predicate
under A8 below and is evidence for the selection, not its result; neither
value counts toward the other's predicate
([FOUNDATIONS §4 Conjunction of results](FOUNDATIONS.md#conjunction-of-results)).
An earlier result stands for a no-action only where it decided this same
predicate on the current basis. In the rule above, `reprice or block` and
`block with typed no-action disposition` name typed no-actions of
`evaluate_next`, not closure decisions, which only `evaluate_action` makes
(A4a); on `post_reprice` the no-action is `no_action(undeclared)`, naming
the outcome or bound the reprice found undeclared and the re-entry that
would declare it (P5, P6):

| Typed no-action | Core value | Ground |
|---|---|---|
| `no_action(undeclared)` | out_of_frame | the gap needs an action that the admitted catalogue does not publish, or a relation, capability or authority that no admitted basis declares (A3); the value names what is missing and its owner, as for `block(undeclared)` |
| `no_action(basis)` | invalid_basis | no published action is lawful on the current bound outcome, catalogue and policy, which cannot support the gap, as for `block(basis)` |

The typed no-action stays beside its core value as the domain outcome,
and producing the next-action projection establishes availability only
([ACTIVATION §3 Construction availability](ACTIVATION.md#construction-availability)).
Where the graph is complete and no action follows a closed edge, nothing
is refused and no selection determination is made: the empty selection is
invocational data, and `close` keeps its own value for the edge predicate
under A8.

A4a Evaluation function separation. `synthesize_model`, `eval_gap`,
`evaluate_next` and `evaluate_action` are separate authority functions.
`synthesize_model` may synthesise the current product asset model from
event-log-backed intent lineage, prior model and admitted product truth
only; it must not observe the worksite, admit construction intent, invoke
work, close work or select the next action. `eval_gap` may emit
observation and gap pressure only; it must not admit construction intent,
invoke work, close work or select the next action. `evaluate_action` may
fold admitted action evidence into ledger and closure decision only; it
must not select the next graph action. `evaluate_next` may bind target
obligations, rank lawful published actions and publish the next-action
projection; it must not admit construction intent or decide whether the
prior action closed, yielded, failed or needs repair except by consuming
the admitted `EdgeClosureDecision`. A module that lets one of these
functions exercise another's authority creates a rival control surface
and violates A0 (P6).

A5 Bounded construction and declared authority. F_P may inspect, discover, reason, draft,
transform and propose within the bounded action. F_P must not close the
edge, emit runtime events, mutate ledgers or decide re-entry. Product admission
owns admission of Product facts; ABG's declared admission mechanisms own
admission of typed evidence and evaluator outputs into L/E (A1/A1a).
Closure truth is ABG's admitted `evaluate_action` fold over admitted evidence,
recorded as `EdgeClosureDecision` under A4a, A6 and A8. F_P evaluator outputs
remain proposals until their own admission; merely declaring an evaluation
does not establish durable evidence, closure or permission.

These admission gates retain deterministic validation against their declared
criteria and their own grants; §11.7A applies that obligation to method
artifacts. A gate claiming common F_D additionally establishes §5's
total-domain eligibility. The kind's no-authority rule is
[AXIOMATIC_CALCULUS §5](AXIOMATIC_CALCULUS.md#5-traversals-and-functor-kinds)'s;
here it preserves the separate Product and ABG admission and closure owners.
Each operation names its admissible evidence and permitted consequences
(P0, P6). An F_P
worker must not be given an F_D-authored semantic extraction recipe when
the edge requires F_P judgment (P0, P6).

A6 Evidence before closure. No edge closes from raw artifact presence, a
raw worker report, raw process success or a CLI summary. Closure is a fold
over admitted evidence (P6):

```text
AdmittedEvidence
-> EdgeFulfillmentLedger
-> EdgeClosureDecision
```

A7 Ledger is evidence, not action selector. `EdgeFulfillmentLedger`
records evidence and convergence (P6, P3):

```text
counts
obligation rows
materialization refs
liveness refs
admission refs
edge_converged
```

It does not select the next action. Action selection belongs to
`evaluate_next` over `EdgeClosureDecision` plus fresh `eval_gap` truth
(P6).

A8 Closure decision is a sum type. The closure decision vocabulary is
closed (P5, P6):

```text
close
yield
retry
repair
re-enter
reprice
block
```

Each disposition is replay-visible and must carry basis and reason refs
sufficient to reproduce the decision (P5, P6).

Mapping of the closure decision to the core result algebra. Purpose: [FOUNDATIONS §4 Results](FOUNDATIONS.md#results) states
every outcome in the core or in a refinement that maps each refined value
to exactly one core value and adds no core value. Material relation: a
composite over the edge joins each closure decision as one core value, so
a failure, an undecided closure and a needed re-entry stay distinct (P5,
P6). The closure decision is `evaluate_action`'s result over admitted
evidence, mapped for the predicate "the edge's obligations are fulfilled
on the exact basis". The bounded action it judges has its own step result
under [ACTIVATION §3 Construction availability](ACTIVATION.md#construction-availability)
for "a candidate is available", and neither value counts toward the
other's predicate
([FOUNDATIONS §4 Conjunction of results](FOUNDATIONS.md#conjunction-of-results)).
Each decision keeps its own vocabulary and its basis and reason refs
beside its core value (P5, P6).

Refined by cause. Where a decision would map to one of two core values
according to its cause, the cause is part of the refined value, written
in parentheses as in `re-enter(basis)`, and each refined value maps once
(FOUNDATIONS §4 Results, Refinements). The cause is read from the
decision's basis and reason refs, which A8 requires to be sufficient to
reproduce it. The seven decisions of A8 stay the closed vocabulary; a
refined value names a decision and its cause and adds no decision (P5,
P6). The causes are:

- `retry(defeated)`: admissible evidence defeats the edge for this attempt
  while the same action stays lawful; `retry(undecided)`: every other
  retry, as after a liveness interruption, which alone never gives
  `retry(defeated)` (A10).
- `repair(implementation)` and `repair(proof)`: the edge's governing
  relation, basis and target binding stay coherent, and a local defect,
  in the implementation or in its proof, keeps the edge from closing, so
  a repair of the same edge is the lawful next action (A11).
  `repair(implementation)`: admitted evidence shows the implementation
  failing an edge obligation; `repair(proof)`: every other repair, the
  defect being in the proof.
- `re-enter(undeclared)` and `block(undeclared)`: the cause is a relation,
  capability or authority that no admitted basis declares;
  `re-enter(basis)` and `block(basis)`: every other cause, the current
  basis being unable to support the edge, as when it is stale, substituted
  or unrepairable. A decision with both causes records both and takes the
  `basis` value, as
  [ACTIVATION §3 Construction availability](ACTIVATION.md#construction-availability)
  decides for `re_entry_requested`.

| Decision | Core value | Ground |
|---|---|---|
| `close` | satisfied | the ledger's admitted evidence fulfils the edge's obligations on the exact basis |
| `yield` | indeterminate | the edge stays lawful and the admitted evidence, progress or a waiting state, does not yet decide its obligations; the replay-visible resume basis names what would decide; no failure is classified, as A9 requires |
| `retry(defeated)` | falsified | the evidence that defeats the edge for this attempt is the counterexample; A9 separates this failure-classified re-attempt from yield |
| `retry(undecided)` | indeterminate | the attempt ended without evidence that decides the edge's obligations; the decision's reason refs name the re-attempt that would decide |
| `repair(implementation)` | falsified | the failing obligation row is the counterexample (P5, P6) |
| `repair(proof)` | indeterminate | the defect is in the proof, so the admitted evidence cannot decide the obligation; the decision's reason refs name the repaired proof that would decide (P5, P6) |
| `re-enter(undeclared)` | out_of_frame | the edge cannot close on its current basis because an upstream asset or governing relation must change, and the change needs a relation, capability or authority that no admitted basis declares; the decision names it and its owner |
| `re-enter(basis)` | invalid_basis | the edge cannot close on its current basis because an upstream asset or governing relation must change, and that basis cannot support the edge |
| `reprice` | out_of_frame | further work needs a selected outcome or bound that no admitted basis declares; the decision names it, its owner and the constitutional re-entry it requests, which is the reconfiguration pressure of out_of_frame ([FOUNDATIONS §4 Results](FOUNDATIONS.md#results), Out of frame or indeterminate) |
| `block(undeclared)` | out_of_frame | `evaluate_action` decides that the action just taken leaves the edge unable to proceed, because it needs a relation, capability or authority that no admitted basis declares |
| `block(basis)` | invalid_basis | `evaluate_action` decides that the action just taken leaves the edge unable to proceed on its current basis, which cannot support it |

Closure decisions and dispositions. The closure decisions of A8 and their
refined values are this member's, and they answer the edge predicate
above. The dispositions `accept`, `local_repair`, `re_enter` and `reject`
are owned by [ACTIVATION §3 Disposition](ACTIVATION.md#disposition) and
answer another predicate, "the candidate is accepted at its declared
boundary". A closure decision is not a disposition and is never recorded
as one, and no disposition is a closure decision: `repair` is not
`local_repair`, and `re-enter` is not `re_enter`. Edge closure is
evidence toward acceptance and never acceptance itself (the
selected-outcome paragraphs above). Their core values differ because their
predicates differ. `repair(proof)` is `indeterminate`, because a
defective proof leaves the edge's obligations undecided, while
`local_repair` is `falsified`, because the local defect defeats
acceptance of the candidate. `re-enter(undeclared)` is `out_of_frame`,
because the change needs a relation, capability or authority that no
admitted basis declares, while `re_enter` is `invalid_basis`. Neither
value counts toward the other's predicate
([FOUNDATIONS §4 Conjunction of results](FOUNDATIONS.md#conjunction-of-results)).
In §11.5D, §16 and §19 "disposition" names a closure decision (the
selected-outcome paragraphs, A8, A11, the constitutional equation, §16
item 13 and §19 question 11) or, in "typed no-action disposition", a
selection of `evaluate_next` (A3, A4); there it never names a disposition
of ACTIVATION §3. Successor-claim dispositions are governed by
[RELEASE §9](RELEASE.md#9-successor-baseline-conservation-stdo-up-015)
(P1, P5, P6). Purpose and material relation:
a consumer that read an edge's `repair` as `local_repair`, or `re-enter`
as `re_enter`, would take an undecided edge for a defeated candidate, or a
missing declaration for an unsupporting basis; the material relation is
whether a closure decision is combined as an acceptance result.

A9 Yield is lawful iterate. `yield` is the lawful iteration boundary (P5):

```text
same edge or attempt remains lawful
progress or waiting state is admitted
resume basis is replay-visible
control returns without failure classification
```

Yield is not retry, not block, not timeout and not a local CLI loop. It is
the pressure-release state that lets long-running, bounded or partially
productive work return control without losing the current edge (P5, P0).

A10 Liveness does not close semantic truth. Liveness observes activity,
inactivity, process state and interruption. It can support yield or a
liveness interruption; it cannot by itself declare semantic failure,
semantic closure or requirement non-satisfaction (P6).

A11 Re-entry is graph law. Repair and re-entry are graph actions selected
by `evaluate_next` from admitted closure truth and published action
authority, not local retry branches over strings. `evaluate_action` may
emit `repair` or `re-enter` as a closure disposition; `evaluate_next`
selects which published graph action realises that repair or re-entry.
Disposition is conceptual; selection is invocational (P6, P5).

A12 Public query is a read-only evaluation view. A public query or gaps
view may render read-only outputs of `eval_gap`, `evaluate_action` and
`evaluate_next`: gap pressure, closure decision and next-action
projection. It must not append events, invoke workers, admit intent, run
`evaluate_action` or choose traversal by itself (P6, P3).

A13 Replayability. Every closure decision and next-action selection must
be reproducible from (P3, P6):

```text
RuntimeEventLog
+ execution basis
+ ABG event-log-backed IntentLineage
+ ProductAssetModel publication basis and its event refs
+ selected Product outcome identity and admitted bounded-basis refs
+ GapPressureRow
+ TargetObligationBinding
+ ActionCatalog
+ admitted evidence
+ EdgeFulfillmentLedger
+ EdgeClosureDecision
+ NextActionBasis
+ visible policy refs
```

If replay cannot reproduce the decision, the implementation has created
hidden state (P3).

A13a Causal chain integrity. Each governing admitted or replay-derived
carrier and projection in the loop must reference its causal predecessor
refs (P3, P4b):

```text
selected Product outcome and admitted bounded-basis refs
-> TargetObligationBinding

IntentLineage
-> ProductAssetModel
-> GapPressureRow
-> TargetObligationBinding
-> PriorityProjection
-> NextActionProjection (selected_action)
-> ConstructionIntent
-> AdmittedEvidence
-> EdgeFulfillmentLedger
-> EdgeClosureDecision
-> NextActionBasis
-> NextActionProjection (next)
```

The target binding must be reachable from the exact selected Product
outcome and any admitted bounded-basis refs. The first
`NextActionProjection` in the chain carries the selected action that
admits `ConstructionIntent`, which preserves those authority refs. The
second is the post-action projection produced from `NextActionBasis` plus
fresh `eval_gap` truth. Both must be reachable from their predecessor
refs. A13 requires that the decision be reproducible from the inputs;
A13a requires that each governing carrier or projection carry the predecessor refs
that make reproduction reachable without external joins. A broken
predecessor chain is non-replayable at the carrier level and therefore
fails A13 (P3, P4b).

A14 Recursive published refinement. The homeostasis loop recurses over
published refinement. If a graph function refines an outer vector into
published inner vectors, each inner vector boundary obeys
`synthesize_model`, `eval_gap`, `evaluate_next` and `evaluate_action` with
its own visible model, gap, binding, action, evidence, ledger, closure and
next-action projection. An intentionally opaque inner realisation is
ordinary implementation inside one bounded action: it may use local
control flow to compute the action's internal result, but it must not
publish, dispatch, retry, repair, re-enter or close graph work as a hidden
traversal controller. Once a refinement is published as graph structure,
the loop governs it recursively (P4a, P0, P6).

A15 Method ownership. ABG owns runtime truth, event replay, the graph-call
lifecycle, actor and process supervision, continuation, and re-entry
mechanics. The product owns domain asset meaning, graph-function
catalogue meaning, gap interpretation and priority policy. The
software-design profile (DESIGN_MODULE, tier 3; PROFILES §3) governs
realisation modules inside that split and must not fragment `eval_gap`,
`evaluate_next` or `evaluate_action` into module-local decision
authorities (P6).

A16 Constitutional override. For any ticket, design, code module or proof
that touches `synthesize_model`, `eval_gap`, `evaluate_next`,
`evaluate_action`, traversal, gap evaluation, action selection,
construction intent, worker invocation, evidence admission, fulfilment,
liveness, closure, re-entry, public query or live proof, the causally
applicable members of this axiom set and the constitutional equation below
are the controlling acceptance constraints for the selected Product
outcome and the affected published boundary. Unchanged accepted relations
cite their accepted basis and are not proved again. The axiom family
authorises no horizontal realisation growth, creates no Product work and
does not widen the selected outcome (P6, P2).

Ticket-local closure wording, test names, source-grep checks, compact CLI
summaries and implementation notes cannot weaken the constitutional loop.
A ticket that looks complete by its local checklist but leaves a rival
traversal-consequence path is not constitutionally complete; the lawful
result is to request lawful re-entry, keep the gap as a closure blocker,
or admit separately bounded paydown under an independently selected
Product outcome or prerequisite basis (P6, P2).

These artifacts may provide evidence, diagnostics or read-model context
only; they must not independently close an edge, select a next action, or
route retry, repair or re-entry (P6):

```text
gap dossier
postflight report
assurance report
materialization manifest
runtime liveness projection
run summary
worker prose
screen or PTY transcript
prompt package
harness target argument
source-grep test
CLI branch or compact output
public query or gaps view
service method output
```

If any of them conflicts with the admitted `EdgeFulfillmentLedger`,
`EdgeClosureDecision` or `NextActionProjection`, the ledger, decision and
projection chain wins. If that chain is absent, the edge has not
constitutionally closed and the next action has not been constitutionally
selected (P6).

The constitutional equation is (P6, P4a):

```text
let U = (selected_product_outcome_ref, optional_admitted_bounded_basis_ref)
let L = project_intent_lineage_from_event_log(source_intent_refs, prior_intent_refs)
let M0 = synthesize_model(L, prior_model, admitted_product_truth)
let G0 = eval_gap(M0, RuntimeEventLog, RuntimeProjection, Worksite)
let O = G0.observation
let B0 = bind(U, G0.pressures, ActionCatalog, target obligations)
let Q0 = initial_selection(L, M0)
let N0 = evaluate_next(Q0, G0, B0, ActionCatalog, Policy)
let I = admit_construction_intent(L, B0, N0.selected_action, N0.next_action_projection)
let E = admit_evidence(invoke(I))
let A = evaluate_action(I, E, B0, Policy)
let M1 = synthesize_model(L, M0, admitted_product_truth)
let G1 = eval_gap(M1, RuntimeEventLog, RuntimeProjection, Worksite)
let B1 = bind(U, G1.pressures, ActionCatalog, target obligations)
let Q1 = next_action_basis_from(A.decision)
let N1 = evaluate_next(Q1, G1, B1, ActionCatalog, Policy)

return N1
```

where (P5):

```text
A.ledger = EdgeFulfillmentLedger
A.decision = EdgeClosureDecision
A.decision.disposition in {close, yield, retry, repair, re-enter, reprice, block}
Q0.kind = initial_selection
Q1.kind in {
  post_yield_resume,
  post_close_graph_continuation,
  post_retry,
  post_repair,
  post_reenter,
  post_reprice,
  post_block
}
Q1.kind = post_reprice and no separately admitted constitutional basis
  => N1 = typed no-action pending re-entry
```

The implementation is correct only when the next work decision is derived
from that equation, `U` stays causally reachable through the target
binding and the construction intent, and no other path can decide what
work happens next (P6, P2).

### 11.6 Product-specific semantics sit above the shared carrier

This profile gives the product shape, not the domain semantics. The same
ODD structural law can build many different domain products, and each
product defines its own asset meanings, proof lanes and query overlays.
Structural GTL law and product-specific semantic law are never confused
(P1).

### 11.7 Manual walkthrough must still be lawful

Automation must stay true for a manual walkthrough. A human operator using
only the declared authority surfaces should be able to (P0, P6):

1. identify the current asset state, the current typed asset or node;
2. identify the next lawful vector and its public graph-function carrier,
   the vector being the constitutional transition contract and the graph
   function the published constructive program that realises it (§5
   Vectors and Graph functions);
3. determine the required inputs, evaluators, output contract and carried
   environment;
4. construct or assess the next asset, a produced asset or checkpoint;
5. repeat until target-relative closure is reached.

Automation may make this faster, safer or more repeatable; it may not
invent a different process. Automation is lawful when it renders prompts,
scaffolds artifacts, selects the next traversal step, runs workers,
collects evidence and assesses closure. Automation is unlawful when it
skips undeclared nodes; fabricates authority absent from the declared
surfaces; collapses several constitutional transitions into one opaque
step without declaring the refinement; depends on implementation-carrier
knowledge the installed product should not have; or collapses the
installed builder and the product under development into one authority
surface during self-host work (P0, P6).

If the team cannot explain the manual traversal, the automation is not yet
method-safe. Automation that cannot be explained in these terms is ahead
of the method (P0, P6).

### 11.7A Conforming agentic development

This profile is the premise for conforming agentic development over the
graph-native worksite. An agentic coder produces governed work by
following the constitutional process over a minimal declared authority
packet, and admission gates the artifacts it produces. SPEC_METHOD governs
the general constitutional process and [TICKETS](TICKETS.md) governs
artifact admission; this section names the ODD specialisation and composes
that law without declaring it again (P6, P0).

Conformance has two halves: an F_P walkthrough supplying evidence that the
process can be followed, and a declared admission gate assessing the produced
artifacts under its evidence contract and grant. A gate claiming F_D also
establishes the common kind's eligibility under §5; its kind is no authority
to admit (P6).

The walkthrough is the conformance proof. §11.7 requires automation to
stay true for a manual walkthrough; its agentic form is a conformance test
of the method itself. An agentic coder executes the constitutional process
end to end on real work, using only the declared authority surfaces:
intake triage, the smallest lawful re-entry, the specification,
requirement, design and ticket chain, the constructive evaluation loop of
§11.5D, and closure proof. The agentic coder is F_P over the
constitutional process (P0, P6).

The agent works from a minimal declared authority packet, not from memory
and not from wholesale hidden context. The general method already requires
declared context for any agentic work unit: input and output contract,
required context, role, evaluator regime and provenance (SPEC_METHOD;
[ACTIVATION §1](ACTIVATION.md#1-the-step)). The ODD addition is that the
packet carries only the smallest declared authority sufficient to decide
the step, with its source refs, and that conformance is enforced by
admitting the produced artifact rather than by enlarging what the agent
must hold. Compression is prompt input and never the deciding authority
(P0, P6). What a derived surface may decide is owned by
[ACTIVATION §2](ACTIVATION.md#2-context-construction-under-an-envelope),
Acquisition and Standalone scope; this section adds only the ODD limit
that follows. A derived surface or projected frame of the general method may
orient the agent to source precedence, lawful re-entry and traceability;
it must not be used to decide product-specific behaviour, which must come
from the current product authority packet (P6, P1).

The walkthrough proves at two levels. The work it produces must be lawful:
correct change class, traceable, admitted. A point where the walkthrough
cannot proceed is a method defect only when a competent agent, correctly
configured and using the declared authority, still cannot decide because
of ambiguity, a missing step, contradictory authority or an undecidable
change class in an owning surface. That defect is repriced into the owning
authority surface, as a failed manual traversal is a graph defect under
§11.7 (P6, P5).

An agent that ignored the declared authority, relied on stale memory or
reasoned badly has produced agent error, not a method defect. Admission
rejects the malformed artifact either way, so a bad agent turn neither
becomes law nor silently indicts the method (P6).

This proof is independent of any automated runtime. A live lane that
depends on external execution conditions, such as an overloaded model API
or a flaky transport, cannot prove the constitutional process sound,
because it conflates process validity with runtime availability. The
walkthrough proves the process; the runtime only executes it (P6, P5).

The validator is the conformance gate. The constitutional process is an
interface contract, and interface conformance is enforced by validating
artifacts against the contract, not by the conformer holding the contract.
This profile does not declare the artifact rules again: tickets,
change-class declarations, design-module derivations and execution
contracts are admitted under SPEC_METHOD and TICKETS, which already require
a drafted classification to be admitted or rejected against deterministic
criteria rather than taken as automatic truth. This profile requires only
that agentic development pass through that admission. The agentic coder
produces the artifact; the declared admission gates it deterministically,
fail-closed and naming the violated rule, exactly as a typed asset is
enforced by its constructor (§11.1) (P6, P3).

This keeps the F_P and F_D split at the method layer. The agentic coder is
F_P: it reasons, drafts and proposes within the declared packet. Admission
uses F_D only when the §5 total-domain contract is established, and its own
contract and authority determine what artifact-conformance decision it may
make. An unresolved eligibility assessment stays open under the migration
relation; an unchanged-subject evaluator still preserves that subject. The walkthrough
establishes that the process can be followed; admission establishes that
each act of following it conforms (P6, P0).

Conformance is not approval by usage. A passed admission and a completed
walkthrough are conformance evidence, not ratification. Shared method
change still follows §9: repeated agentic execution does not make grey
work constitutional. The agentic coder conforms to the method; it does not
amend the method by acting (P6).

### 11.7B Real authority-path negative proof (STDO-UP-010)

Negative proof for an ODD or graph-native boundary exercises the supported
Product authority path. It must not manufacture the refusal state, blocked
event, gap or verdict that the system is supposed to derive (P6, P5).

Closure-grade negative evidence identifies the supported entry and the
governing authority; invalidates the real authority-bearing input;
exercises the supported path; proves refusal before the prohibited
effect; and establishes that no legacy, fallback, reconstruction or
parallel path succeeds. Source, packaged, installed and runtime absence
are distinct claims (P6, P3).

Where these identities apply, the supported relation is (P6, P4a):

```text
public entry
  -> admitted GTL composition owns traversal topology
  -> named GraphFunction supplies the callable work contract
  -> implementation or plugin binding realizes only its admitted seam
  -> ABG owns traversal, event, continuation, and replay truth
  -> replay-derived projection
  -> typed Product outcome or continuation
```

No CLI, SDK, service, adapter, plugin, fixture, query or projection may
become a rival traversal controller. The consumer owns the concrete test
and evidence mechanism; this section owns the property that mechanism
must prove (P6).

### 11.8 Cumulative environment law is mandatory

Composition is not modelled as "the last output feeds the next input".
The ODD law is a cumulative typed environment (P4a, P4b).

Each retained `GraphFunction` should declare `environment.requires`,
`environment.provides` and `environment.carries`. A later function may
require any typed binding available in the cumulative carried
environment, not only the immediately previous output (P4a, P4b).

A product that publishes graph functions without this cumulative
environment law has a line that is graph-shaped but structurally wrong
(P4a, P6).

### 11.9 Global convergence must be stable under zoom

Local green arcs are not enough. When an outer public carrier is refined
into inner executable structure, the refined inner chain must close
lawfully; the enclosing coarse contract must also stay true after
fold-back; and zoomed and unzoomed views must agree on whether the
enclosing carrier is open or closed (P4a, P2).

For current product closure, live current requirements that lack an
executable proof witness keep the enclosing carrier open until they are
realised, explicitly deferred, or explicitly repriced out of the active
branch. For the active software line the immediate pressure is usually a
realised testcase or archived test evidence, but the governing law is
proof-lane aware: the witness must be a governed realised proof surface
appropriate to the requirement class (P2, P6).

## 12. Scenario rule

Scenarios are graph-native proving surfaces, not only test
documentation. A scenario bundle should make clear which feature or
use-case boundary is exercised; which assets are expected to exist before
the scenario starts; which vectors are expected to be traversed; which
significant paths are expected to be exercised; and what evidence closes
the scenario (P2, P6).

The best proving paths come from declared scenarios and use cases,
because they pressure both feature intent and design decisions. That makes
them the best source for selecting the significant code and control paths
the system must exercise (P2).

## 13. Installed-dev rule

Where the product has an installable development form, decisive proof
runs against that installed development form in an isolated environment.
For a graph-native ODD product the proving lane should exercise install,
project bootstrap, graph traversal, evidence collection and
target-relative closure. Direct source checks stay useful and do not
replace installed-dev proof (P6, P3). This rule is the profile's binding of
[ASSURANCE §5 Installed dev proof](ASSURANCE.md#5-installed-dev-proof), which
owns it.

## 14. Dogfooding rule

The product should be developed through the same graph-native method it
claims to provide. Where the product provides ODD framework behaviour, it
must build that behaviour through ODD graph functions and must not merely
publish ODD-shaped artifacts after imperative execution has already
decided the work. The project should therefore increasingly describe and
build itself through explicit assets, explicit vectors, explicit graph
functions, explicit scenario bundles and explicit target-relative closure.
The method is stronger when the product can walk itself (P0, P6).

## 15. Release boundary

A release version is not constitutional graph truth; it belongs to the
release process and release metadata. The graph-native method concerns
current assets, current vectors, current closures and current authority.
Immutable publication, applicable RC selector advancement and exact-cut
acceptance stay a separate process surface, [RELEASE](RELEASE.md) (P3,
P6).

## 16. Failure pattern

This profile is violated when any of these holds (P6):

1. a claimed product step has no corresponding node or vector;
2. a graph function exists with no clear outer contract;
3. automation performs work that cannot be described as a manual
   traversal;
4. the installed product depends on authoring-carrier knowledge that a
   clean target project should not contain;
5. scenarios cannot name the significant paths they intend to prove;
6. the project claims closure without target-relative evidence;
7. "last-output feeds next-input" wiring bypasses the cumulative
   environment law;
8. zoomed and unzoomed views disagree about whether a carrier is closed;
9. imperative service code owns an operative transition that has no
   published graph-function outcome contract;
10. framework behaviour is implemented as workspace orchestration first
    and described with GTL vocabulary only later;
11. imperative code decides closure, continuation, semantic target
    movement or lineage truth outside declared graph-function, ABG runtime
    or product-owned carrier truth;
12. a GTL/ABG product or plugin carries hidden execution authority for
    traversal loops, actor invocation, process supervision, retry,
    continuation, runtime events, projection or closure folds;
13. yield or lawful iteration is flattened into retry, block, timeout, a
    local waiting state or a hidden CLI loop instead of being represented
    as a replay-visible closure disposition;
14. a public query, gaps view, postflight string, service method or
    installed operator summary can decide next work outside the
    constructive evaluation loop;
15. a constitutional process cannot be followed end to end by an agentic
    coder from the declared authority, or a produced constitutional
    artifact is accepted without passing deterministic admission
    (§11.7A).

## 17. Invocation rule

When an agent or designer is told `using ODD, build this product`, the
expected sequence is (P2, P0):

1. read SPEC_METHOD and keep the constitutional chain intact;
2. read the product-specific method if one exists;
3. read the local product authority surfaces: `INTENT.md`, `PRODUCT.md`,
   the relevant requirement families and the active design surfaces;
4. identify the product's semantic chain from source to published outcome;
5. identify the domain-specific typed assets or nodes;
6. identify the public graph-function carriers;
7. define the machine-readable function catalogue;
8. define or update the GTL module, including the outer callable carriers
   and the live traversal boundaries;
9. define how coarse carriers, refined inner carriers and executable proof
   lanes close together without scale contradiction;
10. complete the execution-authority audit for the affected runtime,
    plugin, worker, event, projection, assurance, closure or continuation
    surfaces;
11. define the constructive evaluation loop from intent lineage and model
    synthesis through observation, target binding, lawful action
    selection, admitted evidence, fulfilment ledger, closure decision and
    next-action projection;
12. define the closure decision vocabulary, including `yield` as lawful
    iteration and not retry, block, timeout or a local waiting state;
13. define the projection and query lane as a projection over admitted
    constructive history, including the structural coherence rule between
    the read model and its source carrier;
14. only then implement code, policy and transport surfaces.

The instruction does not mean starting from imperative scripts and adding
GTL words later, treating graph functions as documentation wrappers, or
letting service code become the hidden real carrier (P0, P6).

## 18. Cold-start reading order

Starting cold in a concrete ODD product, read in the order below (P1, P2).

### General ODD product

1. SPEC_METHOD;
2. this profile;
3. the product's `stdo_<label>.json` definition;
4. the applicable bound project reference-frame basis and the authorised
   agent activation packet;
5. the bound product Intent;
6. the bound Product definition;
7. the relevant bound product requirements;
8. the active bound design surfaces;
9. the GTL module, function catalogue and query surfaces.

### World-model product

1. SPEC_METHOD;
2. this profile;
3. the world-model profile (WORLD_MODEL);
4. the product's `stdo_<label>.json` definition;
5. the applicable bound project reference-frame basis and the authorised
   agent activation packet;
6. the bound product Intent;
7. the bound Product definition;
8. the relevant bound requirement families;
9. the current bound design surfaces;
10. the GTL module, function catalogue, query surfaces and proof lane.

In practice this profile sets the structural expectation, the
product-specific method sets the domain law, and the local product
surfaces set the current build line. An LLM that skips the order will
usually either understand the paradigm but miss the domain, or understand
the domain but realise it through the wrong carrier (P1, P2).

## 19. Ramp-up checklist

An LLM ramping into an ODD product should quickly answer (P0, P2):

1. What is the product's semantic chain from source to published outcome?
2. What are the typed domain assets or nodes?
3. What are the public graph functions?
4. Where is the machine-readable function catalogue?
5. Where is the GTL module?
6. What belongs to ABG and what to the product?
7. What is the projection and query lane?
8. Which admitted carrier, runtime, event or source truth does each
   projection derive from, and how does it fail closed on structural
   drift?
9. What proves that execution authority has not escaped ABG into product
   or plugin code?
10. What is the product's constructive evaluation loop from observation to
    the next lawful action?
11. What are the closure decision dispositions, and how is `yield`
    represented as replay-visible lawful iteration?
12. Which proof surfaces close the current capabilities?
13. Which outer carrier stays open if a refined inner lane is green but
    live requirements still lack executable proof?
14. Can an agentic coder follow the constitutional process from the
    declared authority alone, and do the artifacts it produces pass
    deterministic admission?

If those questions cannot be answered quickly, the product is not yet
sufficiently ODD-shaped (P0, P2).

## 20. Canonical compression

This profile is the graph-native product-authoring method for building
GTL/ABG domain products. It requires typed domain assets, named graph
functions, a published function catalogue, a GTL module as the operative
carrier, ABG-owned execution authority, one constructive evaluation loop
from observation to the next lawful action, projection and query surfaces
that expose current state as a projection over constructive history, and
automation that stays explainable as a lawful manual traversal of the same
graph. Operative framework behaviour must be built outcome-first: outcome
traversals first, declarative GTL/ABG carrier structure second, minimal
imperative adapter code last. Yield is the lawful iteration boundary, not
retry, block, timeout or a hidden local loop. Agentic development conforms
by following the constitutional process from a minimal declared authority
packet, with produced artifacts passing deterministic admission: the
agentic walkthrough proves the process can be followed, and admission
proves each act conforms (P0, P6).

This section is a compression of this member, a derived surface in the
sense of [ACTIVATION §2](ACTIVATION.md#2-context-construction-under-an-envelope),
Acquisition. Its sources are §1, §2, §11.1 to §11.5D, §11.7 and §11.7A of
this member at the same digest, and it owns no determination. Where it and
a source section differ, the source section decides
([ACTIVATION §2 Staleness of derived surfaces](ACTIVATION.md#staleness-of-derived-surfaces))
(P1, P6).
