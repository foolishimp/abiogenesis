# UX

Tier 3. An optional profile for realising UX surfaces: the Elm process
model with typed State, Msg, Update, View, Cmd and Sub; the boundary
between UX messages and admitted product carriers; the state transition
law; the effect membrane; carrier binding; view continuation and the
Msg-replay proof; view shape; type sharing; the accessibility minimum;
realisation discretion; adoption with the scaffold and exemption law and
UX sprint compliance escrow; the failure patterns; the review questions;
and this profile's refinements of the core result algebra. It refines
[DESIGN_MODULE](DESIGN_MODULE.md) for modules that realise a UX surface
and imports [FOUNDATIONS](FOUNDATIONS.md), [ACTIVATION](ACTIVATION.md),
[EVALUATION](EVALUATION.md), [SPEC_METHOD](SPEC_METHOD.md) and
[TICKETS](TICKETS.md) by reference under
[PROFILES §1](PROFILES.md#1-the-boundary), defining none of their objects
again: the core result algebra is
[FOUNDATIONS §4 Results](FOUNDATIONS.md#results), and the step's
refinements of it, among them construction availability and the ambiguity
outcome, are [ACTIVATION §3](ACTIVATION.md#3-step-results-and-disposition);
ambiguity governance SPEC_METHOD §5; the sprint boundary SPEC_METHOD §4;
sprint mechanics, compliance escrow and close classification TICKETS §3;
functional bias without language mandate DESIGN_MODULE §4; the effect
edge and the other realisation rules DESIGN_MODULE §10. The
graph-execution profile is [ODD](ODD.md), indexed in
[PROFILES §2](PROFILES.md#2-graph-execution) (P6, P2).

This profile's own terms are UX surface, State, Msg, Update, View,
ViewTree, Cmd and Sub (§4), view-local ephemera (§5), effect membrane
(§6), product-truth-changing message and admitted product carrier (§3),
Msg-replay test and Msg-replay proof (§8), scaffold and exemption record
(§12), UX sprint (§12) and the refined result values of §15. Graph
function and ABG are the graph-execution profile's terms, used here as
that profile names them; AssetSurface and workorder name carriers that a
product's design publishes or admits (§3, §7), used here as that design
names them. Binding declared under PROFILES §1: where TICKETS §3 Compliance escrow names
"replay proof for product-meaningful user-interface interactions" and
"changed public published-function or public carrier contracts", a UX
surface governed by this profile binds them to the Msg-replay proof of §8
and to the AssetSurface contract or equivalent typed product contract of
§7. Direction: profile to tier 2; preserved meaning: the tier-2 escrow law
applies unchanged to the bound objects; narrowed scope: UX surfaces this
profile governs; invalidation: a change of this profile's definition of
the replay proof or of the bound contract re-evaluates the binding (P1,
P6).

Each clause names the principle that requires it (P0 to P6, FOUNDATIONS
§3), as [FOUNDATIONS §1](FOUNDATIONS.md#1-vocabulary-of-standing)
requires.

## 1. Position

This profile exists to make one instruction precise: "using the UX
profile, build this UI surface" (P2). It adopts the Elm
Architecture (TEA) as its constitutional process model: the view is a
pure projection of typed state; state transitions are pure reductions
over typed messages; side effects are values the reducer describes and a
declared effect membrane interprets; the runtime owns lifecycle and the
view does not own continuation (P0, P1). The view is not a state owner.
Stateful local mutation in views, two-way bindings without action
emission, and effect handlers used as controllers are violations of this
profile even when the surrounding ecosystem conventionally accepts them
(P6).

### Authority

When Product authority adopts this profile for a UX surface
([PRODUCT_DEFINITION §7](PRODUCT_DEFINITION.md#7-collective-reference-frame-basis)),
recording the adoption in a product definition, ticket, design module or
review, this profile is the sole UX realisation authority for that
surface (P6). Project-local ADRs
may choose the stack; they may not weaken the process model. Existing
code, component-library convention, screenshots, comments, design
history, prototype behaviour and generated artifacts are evidence only
and do not override this profile (P6). If this profile appears ambiguous
in a concrete case, the surface fails closed under SPEC_METHOD §5: the
work either satisfies the stricter interpretation, reprices through the
governing constitutional method, or records a scoped exemption in the
design module before implementation proceeds (P5, P6; §15 states the
result). Each exit is an outcome of
[ACTIVATION §3 Ambiguity outcome](ACTIVATION.md#ambiguity-outcome):
satisfying the stricter interpretation is `resolved`, under this
profile's fail-closed policy; repricing is `escalated` to the owner of the
governing surface; a scoped exemption is `carried`, the exemption being
its recorded residual; until one of them is taken, the ambiguity is
`blocked` and implementation does not proceed.

### Foundation to law

This member is material family F20, UX. The table below shows which of
its rules follow from which premises, in the format of
[FOUNDATIONS §3 Foundation to law](FOUNDATIONS.md#foundation-to-law),
which also states the standing of the consequences. The family imports
five families under [PROFILES §1](PROFILES.md#1-the-boundary): F2,
transitions, steps and configuration
([ACTIVATION §1](ACTIVATION.md#1-the-step)); F3, results and their
combination ([FOUNDATIONS §4 Results](FOUNDATIONS.md#results)); F4,
work state, resumption and reuse
([ACTIVATION §5](ACTIVATION.md#5-work-state-and-restart)); F11, change
management and ambiguity
([SPEC_METHOD §4](SPEC_METHOD.md#4-change-management)); and F13, work
carriers ([TICKETS §5](TICKETS.md#5-from-carrier-to-execution)). It
refines the software-design profile, family F17
([DESIGN_MODULE §1](DESIGN_MODULE.md#1-purpose-and-position)), for
modules that realise a UX surface (§2); where a row's rule refines a
DESIGN_MODULE rule, its choice column names that rule. Its instance
premises hold where a UX surface is realised under this profile; they are
adopted with it and do not follow from the foundations (P1, P6):

- I1: a product exposes UX surfaces, through which people and systems
  observe the product's admitted truth and request changes to it;
- I2: the product's design, outside the UX layer, declares the admitted
  truth and the carriers that change it;
- I3: UI stacks differ by project, and their ecosystems accept patterns
  that keep state, continuation or effects in the view;
- I4: data reaches a UX surface across seams that the surface does not
  control;
- I5: UX work iterates in short cycles, in which proof for each change
  can cost more than the expected correction.

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|
| P6 (independent), P1 (independent); F2 imported ([ACTIVATION §1](ACTIVATION.md#1-the-step)), F11 imported ([SPEC_METHOD §4](SPEC_METHOD.md#4-change-management)); I1, I2 | By P6 a change to product truth needs an admitted authority, and by I2 the product's design declares the carriers that change it, so a UX surface renders admitted truth and changes it only through an admitted carrier, and the UX layer never becomes the hidden constructive carrier; by P1 a control's appearance carries no authority, so where no carrier exists the surface is blocked and the work re-enters to author the carrier or reprice the requirement instead of inventing one | [§3](#3-product-truth-and-admitted-carriers); [§7](#7-carrier-binding) | the five carrier kinds and the five binding requirements: this profile; which carriers and contracts exist: the product's design | 4, 5, 9 |
| P0 (recovered), P1 (independent), P4a (independent); F2 imported ([ACTIVATION §1](ACTIVATION.md#1-the-step)); I3 | By P0 an actor holds only finite context, and by P4a separately declared parts compose only through declared relations, so product-meaningful state changes only through typed transitions over declared inputs, and a surface's behaviour follows from those inputs; I3 makes the choice of one process model a policy, because stacks differ | [§1](#1-position); [§4](#4-process-model); [§5](#5-state-transitions); [§9](#9-view-shape) | a policy of this profile: the Elm Architecture as the process model, with State, Msg, Update, View, Cmd and Sub, transitions computed without effects from the current state and a declared message, and a view that is a function of state alone; the unmount test for view-local ephemera: this profile | 3, 4 |
| P0 (recovered), P5 (derived from P0 and P6, with P0's open-world premise); F2 imported ([ACTIVATION §1](ACTIVATION.md#1-the-step)) | By P0 an effect not visible at a declared point cannot be found by a later actor, and by P5 an undeclared effect cannot be evaluated, so effects occur only at a declared boundary and none hides in rendering or in decision logic | [§6](#6-effect-membrane) | the effect membrane, a refinement of [DESIGN_MODULE §10 Effect edge](DESIGN_MODULE.md#effect-edge), which interprets declared Cmd values and returns their outcomes as typed messages, and the handler forms it names: this profile; the interpreter mechanism: the project | 4, 8 |
| P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable), P6 (independent); F4 imported ([ACTIVATION §5](ACTIVATION.md#5-work-state-and-restart)) | By P4b the record of a step is not re-acquirable from memory, so a surface's behaviour must be reproducible from its recorded inputs; continuation therefore never leaks into the view, and by P6 a closure claim needs its evidence, so a product surface claims closure only with an executable replay proof for each product-meaningful interaction family | [§8](#8-continuation-and-replay); [§8 Msg-replay proof](#msg-replay-proof) | the Msg-replay test, which replays messages against an empty state, and the six contents of a replay proof: this profile; the proof surface: the project's design module ([§12](#12-adoption), step 7) | 6, 8, 9 |
| P3 (independent), P1 (independent), P6 (independent); I4 | By P3 a value binds one exact basis, and by I4 data crosses seams the surface does not control, so UX-consumed types come from the contract shared by front end and back end, and by P6 data crossing an untrusted or out-of-process seam is validated at runtime before it enters state | [§10](#10-type-sharing) | the six seams, at which this profile makes the preference of [DESIGN_MODULE §4](DESIGN_MODULE.md#4-functional-bias-and-typing) for parsing foreign data once at ingress an obligation, and one typed schema yielding both compile-time types and runtime validators: this profile; the schema mechanism: the project | 2, 3, 4 |
| P2 (independent), P6 (independent); I1 | By P2 obligations follow the outcome, and by I1 a public surface is how people reach the product's capability, so a surface that is the public face of a product capability declares the accessibility minimum; by P6 an exemption needs an authority, so an internal debug surface is exempt only with its exemption recorded | [§11](#11-accessibility-minimum) | the five declarations, with WCAG AA as the recommended default for web: this profile; a stricter accessibility refinement: the project | 1, 9 |
| P2 (independent), P1 (independent); I3 | By P2 the method fixes only what the outcome needs, and by P1 a stack's name carries no meaning, so the stack is free while the process model is preserved, and realisations are tested against the model, never ranked | [§4 Process model without stack mandate](#process-model-without-stack-mandate); [§4 Realisation discretion](#realisation-discretion) | the process model without stack mandate, mirroring [DESIGN_MODULE §4 Functional bias without language mandate](DESIGN_MODULE.md#functional-bias-without-language-mandate): this profile; the two compliance tests, the test over §4 to §10 with no §13 failure pattern and the test over §4 to §8, differ in scope; §15 applies the stricter under the fail-closed rule of [§1 Authority](#authority), with the ambiguity retained for the governing authority; the language, framework, state container, effect interpreter, runtime validator and toolchain: the project, in its design module | 4, 8 |
| P6 (independent); F11 imported ([SPEC_METHOD §4](SPEC_METHOD.md#4-change-management)); I3 | By P6 authority exists only through an admitted grant, so an adopting surface has one UX realisation authority, and existing code, conventions and artifacts are evidence only; by F11 an ambiguity is resolved, carried, escalated or blocked, so an ambiguity fails closed through those outcomes instead of weakening the process model | [§1 Authority](#authority); [§2](#2-role-and-composition) | who adopts: Product authority, under [PRODUCT_DEFINITION §7](PRODUCT_DEFINITION.md#7-collective-reference-frame-basis); the adopted surfaces and scope, recorded in the adopting project's design modules ([§12](#12-adoption)); the stack: the project's ADRs, which may not weaken the process model; the map of the three exits to the ambiguity outcomes: this profile, under [ACTIVATION §3 Ambiguity outcome](ACTIVATION.md#ambiguity-outcome) | 1, 7, 9 |
| P6 (independent), P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable); F4 imported ([ACTIVATION §5](ACTIVATION.md#5-work-state-and-restart)), F11 imported ([SPEC_METHOD §4](SPEC_METHOD.md#4-change-management)), F13 imported ([TICKETS §5](TICKETS.md#5-from-carrier-to-execution)); I5 | By P6 an exemption needs an authority and by P4b a deferred obligation persists until paid, so a scaffold is exempt only with a recorded scope and retirement condition and never becomes production by accumulation; I5 makes per-change proof costly, so a UX sprint defers proof only as visible escrow that closure still pays, and closes only with every finding classified | [§12 Scaffold and exemption](#scaffold-and-exemption); [§12 UX sprint compliance escrow](#ux-sprint-compliance-escrow) | the five default-governance conditions, the escrowable and non-escrowable items and the close triggers: this profile; the generic escrow law and the six close classifications: [TICKETS §3](TICKETS.md#3-sprint-rules); the sprint boundary: [SPEC_METHOD §4](SPEC_METHOD.md#sprint-execution-boundary) | 1, 9 |
| P5 (derived from P0 and P6, with P0's open-world premise), P6 (independent); F3 imported ([FOUNDATIONS §4 Results](FOUNDATIONS.md#results)) | By P5 a value decides only what its evidence establishes, and F3 gives one core, so each verdict of this profile is a refined value mapped to exactly one core value for a named predicate, and a review, a replay proof, a closure claim and a carrier check combine with other results without one being read as another or coerced to success | [§15](#15-results-of-this-profile) | the four refinements and their values: this profile | 3, 9 |

No row cites the adoption steps and scope at the opening of §12, the
failure patterns (§13) or the review questions (§14); these sections
apply the consequences above, and every clause names the principle that
requires it ([FOUNDATIONS §1](FOUNDATIONS.md#1-vocabulary-of-standing)).
Purpose and material relation: an actor started on
this member sees which rules follow from the foundations and the imported
families, and which are choices of this profile, the product or the
project, with their owners, so no choice is presented as derived (P6,
P1).

Consumers of these rows, where an actor enters them (FOUNDATIONS §3
Foundation to law, Consumers), one list per row, each consumer linked to
its own locus:

- Row 1, product truth and carrier binding: [ACTIVATION §2](ACTIVATION.md#2-context-construction-under-an-envelope), which routes prompt construction for UX work to §7; [§2 Relationship to other members](#relationship-to-other-members), where a UX surface over world-model state still binds under §7; [§4 Process model without stack mandate](#process-model-without-stack-mandate) and [§4 Realisation discretion](#realisation-discretion), whose compliance tests require §7 to hold; [§12](#12-adoption), step 5; [§12 UX sprint compliance escrow](#ux-sprint-compliance-escrow), which escrows no product-truth-changing Msg variant that lacks an admitted carrier and keeps the UX layer from becoming the hidden constructive carrier under §3; [§13](#13-failure-patterns), patterns 7 and 13; [§14](#14-review-questions), questions 3 and 4; [§15](#15-results-of-this-profile), carrier admission and Blocked for want of a carrier.
- Row 2, the process model, state transitions and view shape: [§4 Process model without stack mandate](#process-model-without-stack-mandate) and [§4 Realisation discretion](#realisation-discretion), which test a realisation against the §4 process model, the first requiring §4 to §8 and the second §4 to §10 to hold; [§12](#12-adoption), steps 4 and 9; [§13](#13-failure-patterns), patterns 1, 2, 8 and 10; [§14](#14-review-questions), questions 1, 2, 6, 10 and 11; [§15](#15-results-of-this-profile), surface review.
- Row 3, the effect membrane: [§4 Realisation discretion](#realisation-discretion), whose choices are justified against the §6 effect-membrane rule; [§5](#5-state-transitions), which places effects at the effect membrane of §6; [§9](#9-view-shape), where an out-of-render mutation violates §6 unless it is part of the declared effect membrane; [§12](#12-adoption), steps 6 and 9; [§13](#13-failure-patterns), patterns 3, 5 and 11; [§14](#14-review-questions), questions 5 and 10; [§15](#15-results-of-this-profile), surface review.
- Row 4, continuation and the replay proof: [§12](#12-adoption), step 7; [§12 UX sprint compliance escrow](#ux-sprint-compliance-escrow), which may defer and cannot erase the §8 Msg-replay proof that closure requires; [§13](#13-failure-patterns), patterns 4 and 12; [§14](#14-review-questions), questions 7 and 12; [§15](#15-results-of-this-profile), replay proof and closure obligations.
- Row 5, type sharing: [§4 Realisation discretion](#realisation-discretion), whose compliance test requires §10 to hold; [§13](#13-failure-patterns), patterns 6 and 14; [§14](#14-review-questions), questions 8 and 9; [§15](#15-results-of-this-profile), surface review.
- Row 6, the accessibility minimum: [§12](#12-adoption), step 8; [§12 UX sprint compliance escrow](#ux-sprint-compliance-escrow), which may defer and cannot erase the §11 obligations that closure requires; [§13](#13-failure-patterns), pattern 9; [§14](#14-review-questions), question 10; [§15](#15-results-of-this-profile), closure obligations.
- Row 7, the process model without stack mandate and realisation discretion: [§12](#12-adoption), step 2; [§14](#14-review-questions), question 11; [§15](#15-results-of-this-profile), surface review, which applies the stricter of the two compliance tests under §1 Authority's fail-closed rule, with the ambiguity retained for the governing authority.
- Row 8, authority and composition: [§12](#12-adoption), where Product authority adopts the profile under §1 Authority and records the adoption per project; [§13](#13-failure-patterns), pattern 16; [§15](#15-results-of-this-profile), Fail closed, which returns the surface review's value under the stricter interpretation and leaves the other two exits of §1 Authority as a re-entry or a recorded scope.
- Row 9, scaffold exemption and sprint compliance escrow: [§2 Relationship to other members](#relationship-to-other-members), where UX work may use sprint compliance escrow under §12; [§13](#13-failure-patterns), patterns 15 and 17; [§14](#14-review-questions), questions 10 and 14; [§15](#15-results-of-this-profile), closure obligations, and its closing paragraph, where an exempt scaffold is a recorded scope and the six close classifications stay TICKETS §3's.
- Row 10, the results of this profile: [§1 Authority](#authority), [§3](#3-product-truth-and-admitted-carriers), [§4 Process model without stack mandate](#process-model-without-stack-mandate) and [§4 Realisation discretion](#realisation-discretion), each of which states its test or exit and leaves the result to §15; no section of another member returns these values, and the core they map to is [FOUNDATIONS §4 Results](FOUNDATIONS.md#results), which owns it and applies no rule of this section.

Each consumer applies the rule and decides nothing the owning section does
not (P2, P6).

## 2. Role and composition

SPEC_METHOD defines constitutional process and lawful re-entry; the
graph-execution profile defines graph-native constructive carrier law;
DESIGN_MODULE defines deterministic module-level realisation discipline
(P6). This profile refines DESIGN_MODULE with the
additional rules a module needs when it realises a UX surface (render
purity, state-transition algebra, effect-membrane discipline and
accessibility minimums) under the Elm process model. It does not
duplicate DESIGN_MODULE: where the parent already governs (immutability,
totality, effect-edge discipline, no semantic centre, coupling;
DESIGN_MODULE §10), this profile cites and extends it; where UX has
concerns the parent does not address (render lifecycle, browser events,
layout, accessibility), this profile is authoritative (P6, P4a).

This profile composes with the upstream members per surface (P4a, P0):

- when a module realises a UX surface, DESIGN_MODULE and this profile both
  apply, and its design module reads both;
- when a module realises a non-UX surface, only DESIGN_MODULE applies, and
  its design module ignores this profile;
- when a graph-execution product publishes a projection or query surface
  that includes UX, this profile governs that surface's realisation.

The composition rule: the graph-execution profile answers what
graph-native shape the product takes; DESIGN_MODULE what realisation
discipline the modules follow; this profile what additional discipline UX
surfaces follow (P6).

### Relationship to other members

SPEC_METHOD governs constitutional process, authority flow, repricing and
migration law. The graph-execution profile governs graph-native
constructive carrier law, and UX surfaces are projection and query
surfaces under it. DESIGN_MODULE governs deterministic realisation
discipline at module level, and this profile refines it for UX modules.
TICKETS governs ticket and sprint lifecycle; UX work may use sprint
compliance escrow under §12 when the sprint boundary makes deferred proof
visible, bounded and payable. The world-model profile
([WORLD_MODEL](WORLD_MODEL.md)) governs world-model semantic law for
products that have a world-model dimension; UX surfaces over world-model
state still bind through AssetSurface, or its equivalent, under §7 (P6).

### Non-goals

This profile is not a styling guide or design-system specification, a
component library, a brand or visual-identity surface, a wireframing or
prototyping process, a research method for user studies, or a stack
ranking or framework recommendation. Those are valid concerns; they
belong in product-local surfaces, not in this constitutional profile (P2).

## 3. Product truth and admitted carriers

UX surfaces are projection and control surfaces: they render admitted
truth and emit typed messages (P6, P0). A UX-local Msg
may govern view-local concerns such as expansion state, sort order,
filter text, focus movement or draft input. A Msg that changes product
truth is not merely a UX concern. Product-truth changes include:

- writing, creating, moving or deleting assets;
- changing Context, selection authority, pinning or global product state;
- spawning, attaching or resuming sessions;
- dispatching agents, jobs, workorders, graph calls or runtime commands;
- changing closure, approval, continuation, lineage, provenance or
  evidence;
- publishing, accepting, rejecting or superseding product records.

Such a message maps to one admitted product carrier (P6, P4a):

- an AssetSurface action;
- a published graph function or lawful graph-function composition;
- a workorder, job or runtime command admitted by the product's design;
- an ABG event or command boundary where ABG is the runtime authority;
- another typed product contract named by the design module.

The UX layer does not become the hidden constructive carrier. If no
admitted carrier exists for a product-truth-changing message, the UX
surface is blocked until the carrier is authored or the requirement is
repriced (P6, P5; §15 states the result).

## 4. Process model

The constitutional process model is the Elm Architecture (P0, P1):

- State: the typed state shape, held by the runtime, not by the view;
- Msg: the typed message algebra naming every action a user or system can
  emit;
- Update: the pure reducer of signature `(Msg, State) → (State, Cmd)`; it
  describes side effects as Cmd values and does not perform them;
- View: the pure function of signature `State → ViewTree`; given the same
  state, it produces the same output;
- Cmd and Sub: typed descriptions of side effects to schedule and of
  external sources to subscribe to, interpreted by the runtime at the
  effect membrane.

The runtime owns the loop (P0):

`current State → render View → user emits Msg → Update produces new State and Cmds → runtime interprets Cmds → repeat`

This loop is the Elm Architecture and the constitutional process model of
UX work under this profile (P1).

### Process model without stack mandate

The process model is the Elm Architecture; the implementation stack is
the project's choice, recorded in its design module. This mirrors
DESIGN_MODULE §4 Functional bias without language mandate: the process
model is constitutional and not negotiable; the stack is project-local
and free, provided it preserves the model (P1, P6). Any
realisation that preserves §4 to §8 is compliant with this profile. This
test differs from the test of §4 Realisation discretion; §15 states which
test applies under §1 Authority's fail-closed rule, with the ambiguity
retained for the governing authority.
Examples (non-normative):

- a language-integrated reducer runtime, which enables typed state,
  message, update, command and view relations as native runtime
  capabilities;
- a typed reducer with an effect interpreter, which enables a
  host-language UI stack to preserve pure update and an explicit effect
  membrane;
- a reactive-signal realisation behind a reducer, which enables reactive
  projection while forbidding signal mutation outside the reducer;
- a server-rendered hypermedia realisation, which enables server-side
  state derivation as the reducer and uses the request and response
  boundary as the effect membrane.

Constitutionally rejected: any realisation that lets the view own state
continuation, performs side effects in render code, mutates state outside
a typed reducer, or carries multi-step view-local state machines that
bypass Msg. Two-way binding without Msg emission, imperative DOM
manipulation in render code, and effect handlers used as controllers are
violations regardless of stack (P6). A project that selects a framework
records the choice in its design module with a short justification of how
the framework preserves the §4 process model. The profile does not rank
frameworks; it tests realisations against §4 to §8 (P1).

### Realisation discretion

The profile is opinionated about the process model and not about the
realisation stack (P1, P2). The project
chooses:

- the language;
- the framework or runtime;
- the state-container library, if any;
- the effect-interpreter mechanism;
- the runtime validator, if any;
- the build, bundling and deployment toolchain.

The project records its choices in the design module with a short
justification of how each choice preserves the §4 Elm process model and
the §6 effect-membrane rule. The profile does not rank stacks; it tests
realisations. A realisation is compliant with this profile when §4 to §10
hold under inspection and the §13 failure patterns are absent (P6, P1).
This test differs from the test of §4 Process model without stack
mandate; §15 states which test applies under §1 Authority's fail-closed
rule, with the ambiguity retained for the governing authority.

## 5. State transitions

State changes through typed messages applied by the pure reducer, the
Update of §4 (P4a, P1). A UX surface
declares:

- its State shape;
- its Msg algebra;
- its `Update : (Msg, State) → (State, Cmd)`;
- its Cmd algebra;
- its Sub algebra when the surface subscribes to external or runtime
  events.

Each Cmd declaration names (P5, P4b):

- the effect kind;
- the typed input payload;
- the admitted carrier or external boundary it targets;
- a typed outcome Msg family covering every materially possible observed
  or unresolved outcome of the effect, including success and failure;
- the evidence by which an outcome Msg is selected and the observations
  required to resolve an uncertain outcome;
- any deterministic correlation key required to connect the Cmd, its
  invocation, outcome messages and replay.

An outcome Msg represents the available effect evidence. For an intended
effect, its meaning uses the three effect values of
[ACTIVATION §3 Effects](ACTIVATION.md#effects): `completed`,
`not_effected` and `completion_unknown`. These are effect results for
the predicate "the intended effect occurred", not a replacement for the
product's typed message vocabulary. A lost or failed transport reply alone
establishes neither completion nor non-completion. Sufficient independent
observations may decide the outcome; otherwise the message and State
retain `completion_unknown`, its correlation and the missing observation
(P5, P4b).

The reducer is pure: it does not perform I/O, log to side channels or
mutate global state. Effects scheduled by Cmd are interpreted by the
runtime at the effect membrane (§6) (P0, P1).

View-local ephemera (open or closed flags, hover state, draft input) may
be held in implementation-local state cells where the framework provides
them, but only when the value is genuinely view-local: not observed by
other views, not part of the product's state surface, and not
consequential after the view unmounts. Product-meaningful state goes
through the reducer without exception (P6, P3). The discipline test for
whether state belongs in the reducer or in view-local ephemera: if losing
the value on unmount changes the product's behaviour or another part of
the UI's view, it belongs in the reducer (P3).

## 6. Effect membrane

Side effects are isolated to a declared effect membrane, which refines
DESIGN_MODULE §10 Effect edge for UX surfaces (P0, P5). The membrane interprets Cmd values
produced by the reducer and translates side-effect outcomes back into Msg
values delivered to the reducer. Inside the membrane, I/O, subscriptions
to external sources, and imperative interop with the host platform (DOM,
file system, native APIs) are allowed. Outside it, in render code, in
pure helpers consumed by render, and in the reducer, there is no I/O, no
subscription and no imperative platform manipulation (P0).

The membrane has one job: interpret declared Cmd values. It is not where
logic lives. Branching, conditional state derivation and multi-step
business decisions belong in the reducer; the membrane interprets a
single declared Cmd per effect (P6). An unresolved outcome returns through
the typed outcome Msg family; it is not converted into ordinary failure
or success merely to keep the UI moving. Before a repeat or dependent
effect whose safety depends on the outcome, the product observes the
owning state and follows [ACTIVATION §5 Recovery](ACTIVATION.md#5-work-state-and-restart),
with the current authority and effect territory retained. Recovery is an
explicit Cmd/Msg interaction, not hidden membrane continuation (P5, P6).
A platform-specific effect handler,
whatever name the chosen framework gives it (`useEffect`,
`createEffect`, `onMount`, `subscribe`, a server-action handler), is part
of the membrane only when it interprets a declared Cmd. A handler that
contains conditional logic deciding state transitions is a violation: the
logic moves to the reducer, and the handler interprets one Cmd (P6, P1).

## 7. Carrier binding

When the product publishes typed asset surfaces under the graph-execution
profile's carrier law and the local product's design, a UX surface binds
to one or more AssetSurface contracts as its data source and action
target (P6, P3). Binding requirements:

- the surface's State is derived from AssetSurface projections, not from
  a UX-local re-declaration of the asset shape;
- its product-truth-changing Msg variants map one to one to AssetSurface
  action-registry entries, or wrap them through a documented projection
  with no hidden semantic change;
- UX-local Msg variants are reserved for view-local concerns (open or
  closed, sort order, filter input);
- selection within the surface emits a Context update, or equivalent,
  consistent with the product's selection contract;
- writes from the surface go through the AssetSurface action registry,
  not through direct file or service calls.

This is the rule that produces strong functional consistency between
front end and back end: the same typed contract is the ground truth on
both sides (P1, P3). If the product does not publish AssetSurface
contracts, the design module names the equivalent typed contract and
applies the same binding law to that contract. Absence of an admitted
contract blocks product-truth-changing UX actions (P6, P5).

A prompt for UI or operator-surface work must carry the governing UX law
the task needs, acquired as
[ACTIVATION §2](ACTIVATION.md#2-context-construction-under-an-envelope)
Acquisition states: a current derived surface or projected frame of this
member where one serves the task, otherwise the deciding sections of this
member carried in the prompt, rather than require the worker to rediscover
it from the raw member. If a worker
changes product truth through UI behaviour, the prompt must name the
admitted carrier and action path. If the prompt cannot identify that
carrier and action path, the correct result is a block or re-entry, not
local UI invention (P6, P5; prompt construction is
[ACTIVATION §2](ACTIVATION.md#2-context-construction-under-an-envelope)).

## 8. Continuation and replay

In the graph-execution profile the runtime owns continuation (PROFILES
§2) and the product is a cooperative bounded-step subsystem. The UX
twin: the view does not own state continuation (P0, P6). State
transitions flow through declared Msg actions interpreted by the reducer.
A view does not:

- decide on its own what the next state will be after a user event;
- chain several state updates locally without emitting them as separate
  Msg values;
- carry hidden inter-event state in refs, closures or module-level
  variables.

If a view appears to need a multi-step local state machine, that machine
belongs in the reducer as part of State, with explicit Msg transitions
between phases; the view becomes a pure projection of which phase it is
in (P1). The discipline test is the Msg-replay test: can the view's
behaviour be replayed by replaying its Msg log against an empty State? If
the answer is no, continuation has leaked into the view (P4b).

### Msg-replay proof

Every product UX surface carries at least one executable Msg-replay proof
for each product-meaningful interaction family before claiming closure
under this profile (P4b, P6).
Purpose and material relation: the Msg log is the surface's recorded work
state, and replay is resumption from it
([ACTIVATION §5 The workspace and an actor's account](ACTIVATION.md#the-workspace-and-an-actors-account)).
A surface whose behaviour cannot be reproduced from its log holds state
that no later actor or session can recover or check, so the proof is the
evidence that the view owns no hidden continuation (P0, P4b). A
replay proof includes:

- an initial State fixture;
- an ordered Msg log;
- the expected final State;
- the expected ordered Cmd values;
- the typed outcome Msg values returned by interpreted Cmds, including
  every materially possible unresolved outcome and its recovery messages;
- injected deterministic values for time, randomness, generated ids and
  external payloads.

The proof fails if correctness depends on (P5, P4b):

- DOM state not represented in State;
- mutable refs, module variables, closures, timers or effect-handler
  memory;
- network or file results that bypass typed Msg;
- view-local state that changes product behaviour after unmount or
  replay.

For an interaction whose external effect can be unresolved, the proof
covers the correlated unresolved message, its retained State and the
recovery path, including the prohibition on an outcome-dependent repeat
before the required observation. Reproducing that State establishes the
replay predicate only. It does not establish that the external effect
completed; `replay_passes` can coexist with `completion_unknown` for the
effect predicate (P5, P4b).

For a pure projection-only surface, the replay proof may be a no-effect
proof: a Msg log plus the final State and an empty Cmd sequence (P2).

## 9. View shape

A view is a pure function from typed state to a view tree (P1). The view:

- accepts typed input (state, props, context);
- returns a typed view tree;
- declares its consumed inputs explicitly;
- does not capture mutable state in closures across renders;
- does not read from sources outside its declared input.

Whether the implementation expresses this as a function, a function
component, a template, a server-rendered handler, a signal-derived
expression or another framework-specific shape is a stack decision
recorded in the design module. The constitutional rule is the function
signature `State → ViewTree` and the absence of side effects in the body
(P1, P0). A view that depends on out-of-render mutation, for example a
ref written from inside an effect handler and read during render,
violates §6 unless the mutation is part of the declared effect membrane,
for example a platform handle for imperative interop already named in the
design module (P6).

## 10. Type sharing

UX-consumed types come from the shared front-end and back-end contract
(P3, P1). A UX surface does not re-declare
back-end record shapes; it imports them from the shared contract module,
typically the same package or a dedicated `contracts/` package.

Runtime validation is mandatory at every untrusted or out-of-process seam
(P6; it makes DESIGN_MODULE §4's preference for parsing and admitting
foreign data once at ingress an obligation at these seams):

- HTTP or RPC responses;
- MCP payloads;
- file-loaded records;
- websocket or event-stream messages;
- agent or worker outputs;
- URL, storage, clipboard or browser integration payloads.

The project uses a typed-schema mechanism so that the same type
definition is the source of both compile-time types and runtime
validators; the mechanism choice is project-local. Compile-time
TypeScript alone is not sufficient at these seams (P6, P1). UX-local types
are allowed for view-local concerns: form input draft state, sort order
enums, filter strings. UX-local types do not shadow back-end types (P3).

## 11. Accessibility minimum

A UX surface that is the public face of a product capability declares
(P2, P6):

- semantic structure (heading levels, landmarks, lists, or
  platform-equivalent affordances);
- keyboard or platform-equivalent navigability for every action that has
  a pointer interaction;
- focus management on dynamic content changes;
- accessibility annotations for any custom interactive element that lacks
  a native semantic equivalent;
- colour contrast at the project's declared accessibility standard (WCAG
  AA is the recommended default for web).

Accessibility is not optional for product capabilities. It is optional
for internal-only debug surfaces, and the design module records the
exemption (P2, P6). This section is intentionally minimal. Projects with
stricter accessibility obligations (regulated industry, public-sector
procurement) author a project-local accessibility refinement and cite it
from their design modules (P2).

## 12. Adoption

Product authority adopts this profile for a project (§1 Authority), and
the adoption is recorded by (P6, P4b):

1. naming the profile in the project's UX-related design modules;
2. recording the realisation stack choice (§4 Realisation discretion) and
   the justification;
3. declaring the irreducible architectural carrier set and the structural
   carrier diagram the design profile requires (DESIGN_MODULE §6 and §7);
4. declaring the State, Msg, Update, Cmd and Sub shapes for each UX
   surface in the design module before implementation;
5. declaring the AssetSurface or equivalent typed-contract bindings (§7)
   the surface consumes and emits to;
6. naming the effect-membrane mechanism (§6) and the Cmd algebra it
   interprets;
7. naming the executable Msg-replay proof surface required by §8;
8. naming any §11 accessibility refinement the project requires;
9. noting any §9 view-shape or §6 effect-membrane exemptions explicitly.

Adoption is per project. A project may adopt this profile only for some
UX surfaces, for example the production UI but not internal debug tools,
with the scope recorded in the design module (P2, P6).

### Scaffold and exemption

A UX surface is governed by this profile by default when any of these are
true (P6, P5):

- it is reachable from the product shell;
- it is used as proof for a ticket, requirement, design module, release or
  review;
- it can mutate product truth;
- it can spawn, attach, resume or dispatch work;
- it can change Context, selection authority, closure, continuation,
  evidence or provenance.

A scaffold, prototype, debug pane or temporary proof surface may be
exempt only when the design module or ticket records (P6, P4b):

- the exemption scope;
- the permitted operations;
- whether mutation is forbidden or explicitly bounded;
- a visible scaffold or debug label where user-facing;
- the authoritative surface that will supersede it;
- the retirement condition and owning ticket;
- the non-closure condition preventing release if the scaffold remains.

An exempt scaffold cannot become the production UX by accumulation. It is
retired, repriced into a governed UX surface, or kept outside product
closure (P4b, P6).

### UX sprint compliance escrow

UX is the primary governed use case for sprint compliance escrow. This
subsection is the profile's statement, which SPEC_METHOD §4 Sprint
execution boundary admits, of when that escrow is an appropriate cost
optimisation for UX; the generic escrow law and the close mechanics are
TICKETS §3 Compliance escrow and Close review (P2, P6). A UX sprint may defer local UX
compliance proof during a short iteration window when per-change proof
cost is higher than expected correction cost. This is a cost-optimisation
rule; it does not weaken the UX process model (P2).

A UX sprint may escrow (P2, P4b):

- screenshots or walkthrough capture;
- visual review;
- copy, spacing, density and layout cleanup;
- accessibility review and remediation;
- Msg-replay proof updates for product-meaningful interaction families;
- design-module wording cleanup;
- trace cleanup between changed UX states and governing authority.

A UX sprint may not escrow (P6):

- product-truth-changing Msg variants that lack an admitted carrier;
- new or changed AssetSurface contracts or equivalent typed product
  contracts;
- new navigation, information architecture or selection authority that
  changes product meaning;
- runtime, governance, closure, continuation, lineage, provenance or
  evidence semantics;
- release criteria or method law.

If one of those appears, the sprint records the finding and the work
exits the UX sprint path through standalone repricing or sprint
supersession. The UX layer still does not become the hidden constructive
carrier (P6; §3).

A UX sprint should close when continued iteration is more expensive or
less trustworthy than review. Valid close triggers include (P2, P6):

- the declared timebox ends;
- accumulated changed states are too numerous for casual review;
- screenshots or walkthrough evidence no longer explain the current
  surface;
- interaction behaviour changed beyond visual polish;
- reviewer uncertainty makes more iteration unsafe without
  reconciliation.

UX sprint close is a forensic walkthrough: it reviews each changed
screen, state and product-meaningful interaction against the cited
authority (P6). Each finding takes one of the six classifications of
TICKETS §3 Close review (`accepted`, `local_paydown`, `design_reframe`,
`requirement_reprice`, `product_reprice`, `remove`); for a UX finding,
`accepted` reads as compliant with this profile and the cited design,
and `local_paydown` as local UX debt captured by a paydown ticket (P6,
P5). The sprint may close with explicit local paydown tickets only where
the debt is local to UX realisation and the governing method allows
follow-up. It may not close while product-truth carrier gaps, hidden
state continuation or authority drift remain unclassified (P6, P4b).

Closure under this profile for a product UX surface still requires the
§8 Msg-replay proof and the §11 accessibility obligations unless an
explicit exemption is recorded. The sprint can defer those obligations
during iteration; it cannot erase them (P4b, P6).

## 13. Failure patterns

A UX surface violates this profile when any of these are true (P6, P5):

1. render code mutates state directly (assignments inside the render
   body, mutating a prop or context value);
2. view-local state cells carry product-meaningful state instead of
   view-local ephemera;
3. an effect handler contains conditional logic that decides state
   transitions;
4. multi-step state machines live in the view rather than in the reducer;
5. mutable refs are read during render outside the declared effect
   membrane;
6. UX-local types shadow or re-declare back-end types instead of
   importing from the shared contract;
7. selection or action emission writes to file or network without going
   through an AssetSurface action;
8. view-shape exemptions (§9) are taken without a recorded design-module
   entry;
9. accessibility is omitted on a public product capability without a
   recorded exemption;
10. two-way binding emits no typed Msg action and the reducer is
    bypassed;
11. logic that should be a Cmd is implemented imperatively inside an
    effect handler;
12. the view's behaviour cannot be replayed by replaying its Msg log
    against an empty State;
13. a product-truth-changing UX message has no admitted carrier, graph
    function, runtime command or typed product contract;
14. external data crosses into UX state without runtime validation;
15. a scaffold or debug surface is reachable, mutating or used as proof
    without the exemption record of §12 Scaffold and exemption;
16. a project-local ADR, component convention or existing code pattern is
    used to weaken this profile;
17. a UX sprint claims closure while deferred proof, accessibility,
    carrier, scaffold or authority debt remains unclassified or
    un-ticketed.

Any of these is a violation of this profile. Repeated violations are not
normalised by usage; they are repaired or the surface is repriced (P6,
P4b).

## 14. Review questions

A UX surface review under this profile should answer (P6, P2):

1. What is the surface's State, Msg and Update?
2. What is the surface's Cmd and Sub algebra?
3. Which AssetSurface or equivalent typed contracts does it bind to?
4. Which product-truth-changing messages map to admitted carriers?
5. Where is the effect membrane, and what Cmd values does it interpret?
6. Is `View = f(State)` provably pure for this surface?
7. Can the surface's behaviour be replayed from a Msg log (the Msg-replay
   proof of §8)?
8. Are all UX-consumed types imported from the shared contract?
9. Are all out-of-process payloads runtime-validated before entering UX
   state?
10. Are view-shape, effect-membrane, accessibility, scaffold or debug
    exemptions documented?
11. What realisation stack is chosen, and how does it preserve the §4 Elm
    process model?
12. Does the surface honour the §8 rule that the view does not own
    continuation under user replay?
13. Does the design module include the design profile's carrier set and
    structural carrier diagram required for closure (DESIGN_MODULE §6 and
    §7)?
14. If the work used a UX sprint, did close review classify every deferred
    proof, accessibility, carrier, scaffold and authority finding?

If any of these cannot be answered, the design module is incomplete (P6,
P5).

## 15. Results of this profile

This section owns this profile's refinements of the core result algebra
of [FOUNDATIONS §4 Results](FOUNDATIONS.md#results). Each refinement names
the question it answers and the predicate its mapping is for, and maps
each of its values to exactly one core value. The predicate travels with
the value, so a `satisfied` for one predicate never counts toward another
([FOUNDATIONS §4 Conjunction of results](FOUNDATIONS.md#conjunction-of-results)),
and no mapping raises a result's standing: nothing is coerced to
`satisfied` (P5, P6). Purpose and material relation: this profile's verdicts decide closure of a UX surface
and enter conjunctions with the results of other members, which combine
only in the core, so a review, a proof, a closure claim and a carrier
check are each read for their own predicate and none is read as another
(P5, P6).

| Refinement | Question | Predicate of the mapping |
|---|---|---|
| surface review | does the surface comply with this profile (§4 Realisation discretion, §13, §14) | the UX surface complies with this profile on the exact basis |
| replay proof | does a Msg-replay proof hold (§8 Msg-replay proof) | the Msg-replay proof reproduces its expected final State and ordered Cmd values, and its correctness depends on nothing that §8 Msg-replay proof lists |
| closure obligations | where closure of a product UX surface is claimed, are the obligations met that closure requires (§12 UX sprint compliance escrow) | each product-meaningful interaction family of the surface carries its Msg-replay proof and the surface carries its §11 declarations, unless a recorded exemption covers the obligation |
| carrier admission | does each product-truth-changing message have an admitted carrier (§3, §7) | every product-truth-changing message or action of the surface maps to an admitted product carrier or typed product contract |

| Refinement | Value | Core value | Ground |
|---|---|---|---|
| surface review | `compliant` | satisfied | §4 to §10 hold under inspection and no §13 failure pattern is present (§4 Realisation discretion), and every §14 review question is answered from the design module. The first part is the stricter of the two compliance tests of §4, which disagree: §4 Process model without stack mandate counts a realisation that preserves §4 to §8 as compliant. The tests differ in scope; this mapping applies the stricter under the fail-closed rule of §1 Authority and retains the ambiguity for the governing authority. The last part, every §14 review question answered from the design module, is in neither test: it is the basis condition that separates `compliant` from `design_module_incomplete` |
| surface review | `violation` | falsified | the test of `compliant` fails: a §13 failure pattern is present, a realisation that §4 Process model without stack mandate rejects is used, or a rule of §4 to §10 does not hold under inspection; the pattern, realisation or rule is the counterexample |
| surface review | `design_module_incomplete` | invalid_basis | no counterexample of `violation` is found, and a §14 review question cannot be answered from the design module, so the design module, on which the review rests, cannot support the evaluation; the value names the unanswered question |
| replay proof | `replay_passes` | satisfied | the proof reproduces its expected final State and ordered Cmd values on its injected deterministic values, and no dependency that §8 lists decides its correctness; reproducing an unresolved outcome proves replay only and does not establish external completion |
| replay proof | `replay_fails` | falsified | the proof diverges from its expected final State or Cmd values, or its correctness depends on something §8 lists; the divergence or the dependency is the counterexample |
| closure obligations | `closure_obligations_met` | satisfied | every product-meaningful interaction family carries its Msg-replay proof and the surface its accessibility declarations, or a recorded exemption covers the obligation |
| closure obligations | `closure_unproven` | falsified | an interaction family lacks its proof or the surface an accessibility declaration, with no recorded exemption; that family or obligation is the counterexample. Inside an open UX sprint closure is not claimed, and a deferred obligation is escrow under §12 |
| carrier admission | `carrier_admitted` | satisfied | each product-truth-changing message or action maps to an admitted carrier of §3 and binds under §7 to an AssetSurface contract where the product publishes one, otherwise to the equivalent typed contract its design module names |
| carrier admission | `carrier_missing` | falsified | a product-truth-changing message or action has no admitted carrier or typed contract (§13 pattern 13); that message or action is the counterexample |

Where none of these values applies, the evaluation returns a core value
directly under [FOUNDATIONS §4 Results](FOUNDATIONS.md#results):
`indeterminate` where the admissible evidence cannot decide its predicate,
naming the evidence that would decide; `out_of_frame` where its claim
needs a relation or capability that its frame does not declare; and
`invalid_basis` where its subject or basis cannot support it on a ground
other than `design_module_incomplete` (P5).

Fail closed (§1 Authority). Where this profile is ambiguous for a case,
the surface review applies the stricter interpretation and returns its
value under it; the ambiguity alone never yields `compliant`. Where the
ambiguity leaves a term the review depends on undefined, so that no
stricter interpretation is fixed, the review returns
`out_of_frame` and names the term and its owner
([FOUNDATIONS §4 Results](FOUNDATIONS.md#results), Out of frame or
indeterminate, first case). A reprice or a scoped exemption, the other
two exits of §1 Authority, is a re-entry or a scope recorded in the
design module, not a value of this section (P5, P6).

Blocked for want of a carrier (§3, §7). The surface's carrier admission
returns `carrier_missing`, and its review returns `violation` (§13 pattern
13), each for its own predicate. A construction step that needs the
missing carrier stops with `re_entry_requested(authority)`, which
[ACTIVATION §3 Construction availability](ACTIVATION.md#construction-availability)
maps; the stop names the missing carrier, its owner in the product's
design and the re-entry, which is to author the carrier or to reprice the
requirement (P5, P6).

Two collisions are resolved here (P1): "blocked" for want of a carrier is
not the ambiguity outcome `blocked` of
[ACTIVATION §3 Ambiguity outcome](ACTIVATION.md#ambiguity-outcome), and
`design_module_incomplete` is not the value `incomplete` of ACTIVATION §3
Construction availability. An exempt scaffold is a recorded scope (§12),
not a result; evaluations outside its recorded scope proceed under this
section. The six close classifications of §12 belong to TICKETS §3 and are
not mapped here (P6).
