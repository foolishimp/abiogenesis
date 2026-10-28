# EXECUTIVE_BASELINE

Tier 3. An optional operational profile. It describes the executive
configuration: one configuration in the sense of
[ACTIVATION §1 Configuration](ACTIVATION.md#configuration), with three
engagement frames (Executive, Worker, Reviewer) and a catalogue of
specialist frames, mapped onto the law of tiers 1 and 2. An operational
profile owns only its own bindings, the terms and choices it adds for its
operation. Here they are: the additions to direct entry (§3); the
empirical revision boundary (§4); the three frames with their grants, limits and
prohibitions, and the explanation of their allocation (§5 to §10); the
catalogue of specialist-frame families (§11); the Executive engagement
procedure (§6, §12 to §15); the reading of
each work-result value for the Worker (§5 Work result); and the records for
adoption, project configuration, qualification and closure (§16 to §22).

It imports [FOUNDATIONS](FOUNDATIONS.md),
[REFERENCE_FRAME](REFERENCE_FRAME.md), [ACTIVATION](ACTIVATION.md),
[EVALUATION](EVALUATION.md), [SPEC_METHOD](SPEC_METHOD.md),
[PRODUCT_DEFINITION](PRODUCT_DEFINITION.md) and
[ASSURANCE](ASSURANCE.md) by reference and defines none of their objects
again: the frame, frame set, activation packet and method functions, with
the outcomes of `activate`, are REFERENCE_FRAME's; the core result algebra
and the conjunction of results are
[FOUNDATIONS §4](FOUNDATIONS.md#results); intake, admission,
applicability, configuration, and roles and delegation are ACTIVATION §1,
and the refinements of the core for steps, with the four dispositions, are
[ACTIVATION §3](ACTIVATION.md#3-step-results-and-disposition); the
independent-assessment protocol and the review-result shape, including the
result and triage projection, are EVALUATION §3 and §4; the product
testing frames, testing value, path erasure, subject acquisition,
counterexample localisation and the interface integration frame are
ASSURANCE §7 to §13. Each clause names the principle that requires it (P0
to P6, FOUNDATIONS §3), as FOUNDATIONS §1 requires.

The frames take the responsibilities that
[ACTIVATION §1 Roles and delegation](ACTIVATION.md#roles-and-delegation)
names where a configuration's operations include construction, assessment
and disposition: the Worker frame carries the constructor's, the Reviewer
frame the assessor's, and the Executive frame is the configuration's
coordinator, which disposes as decision owner or its admitted proxy within
the grant existing authority admits. A frame name binds the responsibility
the configuration allocates to it, not a role imported by spelling, and
grants no authority by itself (P1, P6).

## 1. Canonical compression

REFERENCE_FRAME defines the finite engagement unit. The selected complete
method cut defines specification, design, construction, assessment,
disposition, checkpoint, continuation, identity and release law. This
profile maps three practical engagement frames onto those owners; it owns
only the bindings its lead names and no rule of those owners (P6, P0):

```text
existing project authority
  + selected complete method basis, REFERENCE_FRAME included
  + exact governed Product or Product-chain outcome and workspace basis
  + known evaluation inventory, dependencies and residuals
  -> a sufficient direct Worker activation, or coordination where material
  -> when coordinated: Executive locks outcome and basis, holds a finite ready frontier
  -> Worker and the applicable specialist evaluations; Reviewer only where required
  -> closed results, technical triage where applicable, declared conjunction
  -> existing bounded decision authority, result recording, next lawful action
  -> updated basis, coverage, residuals and frontier
  -> repeat or stop
```

The three frames are overlapping evaluation contexts. They are neither a
hierarchy nor an actor topology (P6; RF-009). The Worker supplies the
candidate and never activates the Reviewer. The Reviewer evaluates and does
not implement. The Executive applies only decision authority already
granted by Product, Goals, requirements, accepted design, a ticket, identity
law or release law. The Worker carries only the construction or
transformation authority of its admitted intake. No frame acquires
admission, publication, mutation or any other operation authority from its
label (P6).

The profile derives twelve generic specialist-frame families (§11):
Product, Product Composition, Design, Design Component, Public Boundary,
Entity, Operator, Owner, Effect, Reuse/Foundation, Install and Proof. They
keep apart recurring evaluation questions that otherwise collapse across
constitutional WHAT, structural HOW, identity, authority, effects,
foundations, installed subjects and evidence. They are available families,
not mandatory actors, stages, components, services, files or runtime types.
An activation selects only the families material to its exact evaluation
and keeps an explicit residual for any material family it cannot cover (P2,
P1).

The four product testing frames (user acceptance, end to end, integration,
unit) are tier-2 law in ASSURANCE §7. Under this profile they are activated
inside the same conditionally selected engagement relation; they add no
role, stage, authority or testing hierarchy. Their evidence topology, the
assignment of claims to congruent evidence frames, is ASSURANCE §7; a
broader frame cannot make a module-owned law true, and any number of
narrower green frames cannot establish an unevaluated Product composition
or user outcome (P6, P4a).

A project may adopt this profile or define another frame configuration
(§16). The executive configuration is selected where it fits the task; it
is not the method's default (§7 The executive configuration). Adopting the
profile is the Product authority's act (PRODUCT_DEFINITION §7), and each
decision a configuration makes is admitted by the existing authority that
owns it (ACTIVATION §1 Configuration, Admission of a configuration; §16).
A local axioms file may carry the decision; carrying it does not make the
file a new constitutional owner (P6).

## 2. Status and authority boundary

This member is an optional derived role and evaluation profile. It owns no
part of the execution protocol and no Product binding (P6). Three ownership layers stay distinct:
REFERENCE_FRAME owns the pure frame principles; this member owns the
optional Executive, Worker, Reviewer and specialist mappings; PRODUCT_DEFINITION
§7 owns the Product-binding relation, and each adopting Product's authority
owns its concrete Project Reference-Frame Basis. The testing-frame
mappings this profile uses are ASSURANCE's.

| Relation | Owner in this method | Use in this profile |
|---|---|---|
| frame declaration, activation and its outcomes, translation, coverage and revision | REFERENCE_FRAME | defines each engagement frame and the active configuration |
| core result algebra and conjunction of results | FOUNDATIONS §4 Results and Conjunction of results | supplies the one result every frame returns and the rule every declared conjunction applies |
| configuration of responsibilities over frames, and roles and delegation | ACTIVATION §1 Configuration and Roles and delegation | the executive configuration is one configuration under that law; this profile owns its frames, their grants, limits and prohibitions, and its explanation (§7) |
| bounded-frame conservation and execution intake | ACTIVATION §1 Intake, consuming the design profile's bounded-frame conservation laws ([DESIGN_MODULE](DESIGN_MODULE.md)) | supplies the Worker activation basis |
| construction, self-review, assessment, disposition, checkpoint and continuation | ACTIVATION §1, §3 and §5 | supplies the complete execution transition |
| constructor and independent-assessor separation | EVALUATION §3 for what counts as independent; [TICKETS UP-007](TICKETS.md#execution-and-verification-authority-separation-up-007) for when it is required and for traceability of the exact verdict | supplies Reviewer independence and traceability of the exact verdict |
| exact assurance subject, evidence population and freeze for generic method qualification | EVALUATION §1, §3 and §7 | supplies review-boundary and qualification constraints |
| module-derived unit proof | the design profile's design-to-module evidence route and module-derived unit-test law ([ASSURANCE §14](ASSURANCE.md#14-design-to-module-evidence-route) and [§15](ASSURANCE.md#15-module-derived-unit-tests)) | supplies the unit frame's module-ownership basis, while ASSURANCE §7 limits its claim and evidence altitude |
| capability and foundation selection before material generic construction | the design profile's capability-and-foundation selection law ([DESIGN_MODULE](DESIGN_MODULE.md)) | supplies the Worker's proportional reuse comparison; reuse is no authority transfer, and an assigned foundation role keeps its declared relation and owner |
| Product testing taxonomy, claim, ordinary user path and acceptance meaning | ASSURANCE §1 to §3 and §7; the current Product, requirements, accepted design and release authority where applicable | selects user outcomes, supported interfaces, material compositions, runnable Product subjects, harnessed or live mode and required testing populations |
| the twelve generic families | current Product and requirements; SPEC_METHOD composition law; accepted design; the design profile; identity and release law ([IDENTITY](IDENTITY.md), [RELEASE](RELEASE.md)); applicable domain, effect, interface, dependency and assurance owners | supplies recurring specialist evaluation families without moving their owners or requiring one architecture |
| work selection and growth authority | current Goals, Product, requirements and an admitted ticket or equivalent work authority | selects the governed outcome and admits the local frame configuration |
| design structure and local realisation frame decisions | accepted design under its governing Product and requirements | supplies specialist frames and material relations |
| human and proxy identity | identity law ([IDENTITY](IDENTITY.md)) with project authority; EVALUATION §5 for the proxy grant | binds the Executive actor and its decision envelope |
| Product and release acceptance | the current Product and release law ([RELEASE](RELEASE.md)); EVALUATION §5 | keeps direct acceptance where those owners require it |

Every requirement of this profile is one of two kinds: an exact
application of a cited owning relation, or a condition for claiming
adoption of this optional profile. Neither kind opens a second amendment
path for the owning law. Where this profile conflicts with an owning
clause, the owning clause controls and this profile requires revision (P6).

Inclusion in an exact released cut or another admitted method basis makes
the profile available; it does not adopt it. Adoption requires a separately
accepted Product-owned Project Reference-Frame Basis (PRODUCT_DEFINITION
§7). Mutable authoring source, the presence of an installed file, prompts,
summaries and commentary neither select nor adopt it (P6, P3).

## 3. Engagement applicability

Direct entry is
[ACTIVATION §1 Roles and delegation](ACTIVATION.md#roles-and-delegation).
The configuration that adds coordination where direct entry cannot cover
the material contexts, authority, capability or required independence is
selected under
[ACTIVATION §1 Configuration](ACTIVATION.md#configuration). Where the
executive configuration is selected, the directly entering frame is Worker
(Writer) and the coordinating frame Executive. A role or frame name alone
creates no review obligation either (P0, P6).

Direct entry keeps execution-contract admission distinct from drafting
and uses the smallest lawful carrier
([ACTIVATION §1 Admission](ACTIVATION.md#admission) and Roles and
delegation; the carrier is selected under [TICKETS](TICKETS.md)). Where no
independent assessment is required and no acceptance is reserved, a
sufficient local outcome may finish as Writer, recording its satisfied
conditions in that carrier; a required assessment or owner decision stays
required, and an insufficiency found during the work withholds the
dependent effect and returns the question to its owner, as
[ACTIVATION §1 Roles and delegation](ACTIVATION.md#roles-and-delegation),
Recording a result without review, states. This profile applies those
rules unchanged and adds two bindings (P2, P6):

- the direct route binds the same exact intake, operation territory,
  applicable obligations, evidence, stop conditions and declared result
  consumer as the coordinated route of §12; and
- a direct Worker (Writer) gains no review, ticket, diagram recreation or
  owner ceremony from using this profile.

The transition of §12 and the handoffs of §13 apply when the coordinated
branch is selected. Direct work returns its closed result to the declared
work authority or existing result carrier, with the same result algebra
(FOUNDATIONS §4 Results, refined for steps by ACTIVATION §3) and the same
separation of operation from decision. In
either branch, applicability is ACTIVATION §1 (Applicability), and valid
computed facts, judgments and owner rulings (C/J/O) are reused under
ACTIVATION §7. No route alters a Product's exact adopted basis or supplies
missing authority (P6, P4b).

### Foundation to law

This member is material family F16, Engagement baseline (operational
profile). The table below shows which of its rules follow from which
premises, in the format of
[FOUNDATIONS §3 Foundation to law](FOUNDATIONS.md#foundation-to-law),
which also states the standing of the consequences. An actor enters the
family here, at the choice between direct entry and coordination. The
family imports eight families under
[PROFILES §1](PROFILES.md#1-the-boundary): F1, frames and context
([REFERENCE_FRAME §1](REFERENCE_FRAME.md#1-the-frame-as-the-engagement-unit));
F2, transitions, steps and configuration
([ACTIVATION §1](ACTIVATION.md#1-the-step)); F3, results and their
combination ([FOUNDATIONS §4 Results](FOUNDATIONS.md#results)); F4, work
state, resumption and reuse
([ACTIVATION §5](ACTIVATION.md#5-work-state-and-restart)); F5,
proportionality and cost
([ACTIVATION §6](ACTIVATION.md#6-cost-and-proportionality)); F6, claims,
evidence, assessment and acceptance
([EVALUATION §1](EVALUATION.md#1-claims)); F15, product lineage objects ([FOUNDATIONS §2 Product lineage objects](FOUNDATIONS.md#product-lineage-objects)); and F13, work carriers
([TICKETS §5](TICKETS.md#5-from-carrier-to-execution)), for the
boundaries of independent review and the closure condition. A row that
cites an imported family uses that family's consequences as premises; the
rules that state them keep their owners, and the choice column names them
as imported, never as this profile's choices. Standing of the commitments
cited ([FOUNDATIONS §3](FOUNDATIONS.md#3-commitments)): P0 recovered; P1,
P2, P3, P4a and P6 independent; P4b derived from P0 and P2, with P0's
premise that step-produced facts are not re-acquirable; P5 derived from P0
and P6, with P0's open-world premise. Its instance premises hold where
the executive configuration is selected; they are adopted with it and do
not follow from the foundations (P1, P6):

- I1: the work is a series of bounded tasks under one governed outcome,
  and carrying out a bounded change and managing delivery across the tasks
  need separate attention;
- I2: existing project authority (Goals, Product, requirements, accepted
  design, a work item, identity or release law) holds every decision grant
  the configuration applies;
- I3: the actors are fallible and have finite context and attention, and a
  constructing actor may be probabilistic.

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|
| P6 (independent), P1 (independent); F2 imported | By P6 authority exists only through an admitted grant, and F2 makes the executive configuration one lawful configuration among others, so this profile cannot hold a decision an owning clause holds: it owns only the terms and choices it adds, and where it conflicts with an owning clause, that clause controls. Inclusion in a method cut is no grant (P6), so it makes the profile available and does not adopt it. By P1 a name carries no meaning by its spelling, so each frame name binds only the responsibility the configuration allocates to it | [the lead](#executive_baseline); [§1](#1-canonical-compression); [§2](#2-status-and-authority-boundary) | the bindings the lead lists: this profile; adoption of the profile: the adopting Product's authority, through its basis ([PRODUCT_DEFINITION §7](PRODUCT_DEFINITION.md#7-collective-reference-frame-basis)) | 1, 7, 9 |
| P0 (recovered), P2 (independent); F2 imported | F2 makes a one-frame configuration lawful and lets a sufficient task be entered directly, with its admission, carrier and recording of a result without review ([ACTIVATION §1](ACTIVATION.md#roles-and-delegation)). By P2 an obligation with no route to the outcome is unjustified, so using this profile adds no review, ticket, diagram recreation or owner ceremony to such a task. By P0 the direct step still realises the same outer contract, so the direct route binds the same intake, territory, obligations, evidence, stop conditions and result consumer as the coordinated route | [§3](#3-engagement-applicability), before this section | the name Worker (Writer) for the directly entering frame: this profile | 1, 7 |
| P6 (independent), P2 (independent), P1 (independent) | By P6 evidence supports a claim and creates no authority, so delivery practice and observed failure enter frame selection, qualification and revision as evidence, never as method authority. By P2 only material with a route to the generic outcome is imported, and this profile reads a consumer's architecture, names, actors or topology as serving that consumer's outcome (its choice, in the choice column), so none is imported. By P1 a precedent's form carries no meaning by itself, so it gives no semantic authority | [§4](#4-empirical-revision-boundary) | the six requirements of the engagement relation, as this profile's reading of its frames: this profile; the misfit signals: [REFERENCE_FRAME §10](REFERENCE_FRAME.md#missing-frame-signals), outside this member; the reading that consumer architecture, names, actors and topology have no route to the generic outcome: this profile | 7, 9 |
| P0 (recovered), P2 (independent), P5 (derived from P0 and P6, with P0's open-world premise), P6 (independent); F2, F5 imported; I1, I3 | Under I1 carrying out a bounded change and managing delivery across tasks need separate attention, and by P0 each frame's context fits a finite envelope, so the two go to different frames. Under I3 a constructor can be wrong about its own candidate, and by P6 its self-review is construction output, so required assessment goes to a frame other than the constructor's. F2 requires a configuration's allocation to be explained, with its resource limits (declared under F5) and failure assumptions, and evaluated against the task, so this configuration states its explanation and fits only where I1 holds. By P5 an activation can fail, so a refused activation returns with its cause. By P6 selecting a configuration waives no grant, limit or prohibition, so each holds wherever it is selected | [§7 The executive configuration](#the-executive-configuration); [the lead](#executive_baseline); [§5](#5-profile-terms) Engagement frame, Executive, Worker, Reviewer | the three frames, their names and the explanation of their allocation: this profile; the values of the resource limits: the selected execution binding, under [ACTIVATION §6 Resource limits](ACTIVATION.md#resource-limits); the selection for a project: the existing authority that [§16](#16-adoption-or-project-defined-configuration) binds | 5, 7, 8, 9 |
| P6 (independent), P3 (independent); F2 imported; I2, I3 | Under I2 existing project authority holds every decision grant the configuration applies, and by P6 a label mints none ([FOUNDATIONS §2](FOUNDATIONS.md#authority-kinds)), so the Executive applies only decision authority already granted and acquires no operation authority from its label; a mutation needs the exact operation grant of the frame that performs it. By P3 an actor and the frame it occupies are distinct identities, so a role transition is a separate fact, known only where recorded. Under I3 a coordinator that changed the subject would dispose of its own construction on its own evidence (P6); that is this profile's reason for the choice in the next column, which the premises do not force | [§6](#6-executive-attention-evaluation-and-action) The three duties, No mutation while Executive; [§8](#8-derived-executive-frame) | the prohibition of every Executive edit, small, test-only or reversible ones included, and recording a role transition in the work carrier before the effect: this profile | 7, 9 |
| P0 (recovered), P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable), P2 (independent), P3 (independent), P6 (independent); F2, F3, F4 imported; I1 | By P0 the Executive's envelope cannot hold every evaluator's working context, and by P4b the producing step records the facts the outer contract needs, so the Executive holds the frontier and the closed-result ledger and acquires more through its frame inputs or a further bounded evaluation, as F2's rule for a coordinator's bounded view requires. By P3 and P6 a result supports its claim only on the basis it binds, so the bases are revalidated before activation and before disposition, and a failed lock takes the value or move its owner gives (F2, F3). By P2 re-entering the cycle without a decision need has no route to the outcome, so attention waits for decision-relevant input, and by P6 waiting discharges no verification, evidence, assessment or authority duty | [§6](#6-executive-attention-evaluation-and-action) Attention cycle, Event-driven attention, Drift locks; [§7 The executive configuration](#the-executive-configuration), Coordination | the five locks, and event-driven attention as the default with bounded fallback observation: this profile | 5, 7, 9 |
| P3 (independent), P1 (independent), P6 (independent), P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable); F4 imported; F15 imported | By P3 identity is declared and survives admissible change, so the Source Project, Product Definition, candidate checkpoint, Release Cut, Product, Install, Artifact, Development Product and dependent Product of one chain are distinct declared identities, and a Development Product role binds one exact Install. By P1 a representation fixes no meaning, and by P6 nothing creates authority without a grant, so directory nesting, shared code or actors, source imports, tool reachability, matching labels or equal outputs create no identity, composition edge or authority transfer. A repair changes the subject, a material input change under F4, so it creates a new candidate and invalidates the affected results (P4b); a released identity's immutability does not pass to the Source Project, a distinct identity (P3) | [§6 Product-chain basis](#product-chain-basis) | the fields each composition edge names: this profile; the Product-role map in the basis: [PRODUCT_DEFINITION §7](PRODUCT_DEFINITION.md#7-collective-reference-frame-basis); the lineage objects: [FOUNDATIONS §2 Product lineage objects](FOUNDATIONS.md#product-lineage-objects) | 1, 2 |
| P1 (independent), P3 (independent), P6 (independent), P0 (recovered), P4a (independent), P2 (independent); F1, F2 imported | F1 keeps the relation structures RF-009 lists distinct and never one hierarchy, and lets frames overlap without collapsing identity (RF-008), so the structures this configuration uses are instances of RF-009's list, and the Executive, Worker and Reviewer may share basis, outcome, checkpoint, candidate, evidence and residuals while each evaluates its own question and holds only its own authority (P6). By P0 and P4a an activated evaluation is one engagement frame with its material specialist frames on an exact subject and basis with a capable actor; by P2 a product schema or a frame runtime with no route to the outcome is not required | [§7](#7-non-hierarchical-frame-configuration), its opening | naming three of RF-009's structures in this configuration's terms, and the notation of an activated evaluation: this profile; the list of structures and its rule: [RF-009](REFERENCE_FRAME.md#rf-009-no-assumed-hierarchy), outside this member | 7 |
| P6 (independent), P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable), P2 (independent) | By P6 evidence supports only the claim it bears on, so a passing thread establishes only the relations and conditions it exercised, and untested branches, combinations and refusal and recovery paths keep their proof obligations. By P4b a settled decision rests on its recorded basis, so material counterevidence reopens it. By P2 each increment is chosen for its route to the outcome | [§8 Steel-thread delivery](#steel-thread-delivery) | the three selection criteria, consequential uncertainty, dependency and interface reach, and failure impact: this profile; sequencing delivery around a steel thread as profile law, and scheduling substantial user-acceptance cycles near release: this profile; the generic sequencing heuristic: [SPEC_METHOD §8](SPEC_METHOD.md#8-bounded-execution-in-this-method), outside this member | 5, 9 |
| P5 (derived from P0 and P6, with P0's open-world premise), P6 (independent); F3 imported | By P5 a step's result algebra carries outcomes other than success, and F3 maps each refined value to exactly one core value with its predicate; ACTIVATION §3 Construction availability is that refinement for "a candidate is available", with its values, grounds and map. So a Worker returns one of those values, selected by the cause ACTIVATION §3 states, and this profile states no ground of its own. By P6, as F3 states, availability is neither assessment nor acceptance, so no value is read as either; a refused activation creates no step, so it creates no Worker result | [§5 Work result](#work-result); [§9](#9-derived-worker-frame); [§12](#12-complete-engagement-transition) steps 2 and 3 | what the Worker reports and what its consumer does with each value: this profile. The values, grounds and core values ([ACTIVATION §3](ACTIVATION.md#construction-availability)) and the outcomes of `activate` ([REFERENCE_FRAME §5](REFERENCE_FRAME.md#5-method-functions)) are imported, not chosen here | 3, 5, 9 |
| P5 (derived from P0 and P6, with P0's open-world premise), P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable); F4 imported; I3 | By P5 a step can stop with an external effect whose completion its evidence cannot decide, as where a response is lost under I3, and F4 requires such an effect to be reconciled before any repetition or dependent action (ACTIVATION §5). By P4b a step-produced fact is not re-acquirable, so the Executive cannot reconcile an effect it is not told of, and a work result names each intended external effect with its value, and the Executive has an effect of uncertain completion reconciled, sufficiently for the next dependent action, before reactivating work or taking that action | [§13](#13-handoff-projection), work result; [§12](#12-complete-engagement-transition) step 4; [§7 The executive configuration](#the-executive-configuration), failure assumptions | the effect field of the work-result projection: this profile. The effect values ([ACTIVATION §3 Effects](ACTIVATION.md#effects)) and the reconciliation rule ([ACTIVATION §5](ACTIVATION.md#5-work-state-and-restart)) are imported | 4, 5 |
| P6 (independent), P1 (independent), P5 (derived from P0 and P6, with P0's open-world premise); F6, F13 imported; I3 | Under I3 a constructor can be wrong about its candidate, and by P6 its self-review is construction output (F6), so self-review stays Worker evidence, and where independent assessment is required a separately activated Reviewer that is not the author evaluates the exact live subject (F6). By P6 a verdict is evidence for the decision owner, so the Reviewer returns evidence-bound triage and no disposition, priority or next activation. By P1 and P5 a cause or repair risk the evidence cannot support is returned as uncertainty, not given precision | [§10](#10-derived-reviewer-frame); [§12](#12-complete-engagement-transition) steps 4 to 6; [§17](#17-actor-binding-and-independence) | the triage fields: this profile; the severity scale: the adopting Product. When independent assessment is required ([TICKETS UP-007](TICKETS.md#execution-and-verification-authority-separation-up-007), with the boundaries a governing basis adds) and what counts as independent ([EVALUATION §3](EVALUATION.md#3-independent-assessment)) are imported | 9 |
| P3 (independent), P6 (independent); F4, F6 imported | By P3 a subject's identity holds only as declared, and by P6 a verdict holds only on its basis, so a review evaluates an exact candidate whose identity cannot move under it: F6 requires a freeze before material reference exposure where generic method qualification applies, and elsewhere the subject is stabilised to the exactness the claim needs, the identity that transition evidence (F4) and traceability (F6) name. Neither premise requires a lifecycle state, so none named `frozen` is created | [§5 Exact candidate](#exact-candidate); [§12](#12-complete-engagement-transition) step 5B | the stabilisation where no freeze applies, an immutable identity or an equivalent exact-subject relation: this profile; the freeze and when it applies: [EVALUATION §7](EVALUATION.md#7-qualification-of-frames-and-of-the-method), imported | 2, 9 |
| P6 (independent), P1 (independent), P2 (independent), P5 (derived from P0 and P6, with P0's open-world premise); F2, F3, F6 imported; I2 | By P6 evidence and decision are distinct, so severity, a grade of a finding's consequence, is evaluation evidence, while priority, the current-boundary effect and the disposition are decisions of the owner I2 names, and by P1 a policy that maps one to another does not make them one value (F6). F6 decides when a finding can block, so the current-boundary effect records the Executive's reading of a finding under that rule and decides nothing itself, and by F3 the decision returns through the core only through the one disposition applied. A hard stop holds whatever the priority (F2). By P2 an observation outside the claim has no route to that claim's outcome, so it opens no review round; by P5 an unsupported assessment is kept `indeterminate` or re-evaluated | [§5 Technical triage, severity, priority and boundary effect](#technical-triage-severity-priority-and-boundary-effect); [§12](#12-complete-engagement-transition) step 7 and Promotion constraint projection | the severity and priority scales, the decision cutoff, and which conditions of the outcome are hard stops: the adopting Product's basis ([§19](#19-baseline-specific-basis-and-activation-additions)); the three current-boundary effect states and the added row of the projection: this profile. When a finding can block ([EVALUATION §5](EVALUATION.md#when-a-finding-blocks-promotion)), what a hard stop is ([ACTIVATION §4](ACTIVATION.md#4-totality-and-refinement)) and the four dispositions ([ACTIVATION §3](ACTIVATION.md#disposition)) are imported | 5, 9 |
| P0 (recovered), P1 (independent), P2 (independent), P4a (independent), P5 (derived from P0 and P6, with P0's open-world premise); F1, F3 imported | By P1 a member, file, component or lens has no evaluation meaning until declared, so it becomes a specialist frame only through a complete frame declaration (F1). By P2 a family is instantiated only where material, and by P5 one that cannot be covered is an explicit residual, never dropped; by P0 no frame holds the whole workspace, so coverage is the union of what activated frames contribute, and visibility is not coverage. By P4a and F3 a composite claim is `satisfied` only through its declared conjunction; each seam case enters it as FOUNDATIONS §4 states, a seam without a result as a gap, and the composite is never `satisfied` while a gap or a non-satisfied mandatory seam remains | [§5](#5-profile-terms) Specialist frame, Generic specialist-frame family; [§11](#11-derived-generic-specialist-frame-set), with Refinement and conjunction; [§14](#14-coverage-application) | the twelve families, their questions and falsifiers, and the declared rule that every material seam is a mandatory result or required coverage, no frame dominant: this profile; each instance, and which non-satisfied value a composite reports where several are returned: the adopting project's declared conjunction rule ([§19](#19-baseline-specific-basis-and-activation-additions)) | 3, 7 |
| P4a (independent), P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable), P3 (independent), P6 (independent); F1, F2, F4 imported | By P4b a step's facts reach a later step only through what it records, and F4 hands work over by closed results without private working context, so every result returns through a declared relation with its closed result and source routes. By P6 and F2 a step begins only through admission and activation, so no handoff, completion, model response, tool output or shared actor activates another frame or authorises continuation. By P3 and P4a results of different candidates, bases or episodes keep their identities, so flattening projections establishes no relation among them; an equality or translation is declared (F1) | [§13](#13-handoff-projection); [§6](#6-executive-attention-evaluation-and-action) Attention cycle | the eight projections and their minimum content: this profile; their carriers: the existing project records | 5, 6, 7 |
| P5 (derived from P0 and P6, with P0's open-world premise), P2 (independent), P6 (independent); F1 imported | By P5 a frame that cannot decide returns a value other than success that names what would decide, so its closed result names the missing relation, coordinate, evidence, authority, capability or interaction. F1 orders diagnosis so that cheaper causes are checked before a frame is added (P2), and the Executive asks all eight questions of that order. By P6 an upstream change has an owner, so it re-enters there and the Executive does not repair it by enlarging its frame | [§15](#15-missing-frame-and-re-entry-application); [§20](#20-failure-classification); [§21](#21-anti-patterns) | the two readings of the diagnostic order (independence in question 3; specialist-frame inputs verified before question 5): this profile; which observations the failure table lists and which misapplications the anti-patterns name, as representative cases: this profile. Each entry applies a consequence traced in another row or an imported rule, and the failure table's first diagnosis routes evaluation and decides no verdict. The order itself ([REFERENCE_FRAME §10](REFERENCE_FRAME.md#diagnostic-order)) is imported | 7, 9 |
| P6 (independent), P3 (independent); F2 imported; I2 | Under I2 existing authority holds every decision grant, and by P6 position creates none, so existing authority selects the outcome and the work authority under its own owner, and F2 admits a configuration by the smallest authority owning each decision it makes. By P3 the basis and the mapping recorded in it are objects distinct from the authorities they cite, so the baseline-adoption projection records the profile mapping inside the Product-owned basis, defining no second basis and minting no authority. By P6 a local surface cannot amend its owner, so a departure from method law is a separate method basis or a non-conformance, never local frame selection | [§12](#12-complete-engagement-transition) step 1; [§5 Baseline-adoption projection](#baseline-adoption-projection); [§16](#16-adoption-or-project-defined-configuration); [§19](#19-baseline-specific-basis-and-activation-additions) | which authority owns which decision of this configuration (the list of §16), and the content of the adoption projection and of the basis additions: this profile; adoption and the content of the basis: the adopting Product ([PRODUCT_DEFINITION §7](PRODUCT_DEFINITION.md#7-collective-reference-frame-basis)) | 1, 9 |
| P6 (independent), P1 (independent), P5 (derived from P0 and P6, with P0's open-world premise); F6, F13 imported | By P6 a claim holds only on the evidence evaluated, so the profile is qualified only for the revisions, envelopes, branches and populations actually evaluated; by P1 a structural check establishes no semantic truth, so mechanical document checks and a source-linked Reviewer evaluation are bound together and neither is claimed as the other (F6). By P5 `indeterminate` never maps to `satisfied`, so a closed `indeterminate` result or a review event satisfies no unresolved obligation; the closure condition of a work item (F13) is applied to the selected branch only | [§18](#18-profile-qualification); [§22](#22-closure) | which cases a representative profile trial must establish (the twenty-six obligations), and which conditions record that this profile was applied to one outcome (the twenty-four conditions): this profile. Each obligation and condition applies a consequence traced in another row or an imported rule and adds no rule of its own. Frame and method qualification ([EVALUATION §7](EVALUATION.md#7-qualification-of-frames-and-of-the-method)) and the closure condition ([TICKETS §7](TICKETS.md#condition-based-closure-and-reuse)) are imported | 9 |

Consumers of these rows, where an actor enters them (FOUNDATIONS §3
Foundation to law, Consumers), one list per row, each consumer linked to
its own locus:

- Row 1, status, bindings and frame names: [ODD](ODD.md#odd), its lead, where the Executive, Worker and Reviewer are roles whose names confer no operation; [PROFILES §6](PROFILES.md#6-engagement-baseline), which indexes the profile as optional and its frame names as bindings of allocated responsibilities; [§16 Existing authority selects the configuration](#existing-authority-selects-the-configuration), where inclusion in a cut makes the profile available and only Product authority adopts it; [Extension versus replacement](#extension-versus-replacement), where neither choice amends the method's execution law; [§18](#18-profile-qualification), whose trial reproduces neither the profile nor its basis as a peer authority; [§21](#21-anti-patterns), items 1 and 14; [§22](#22-closure), conditions 3 and 11.
- Row 2, direct entry: [The executive configuration](#the-executive-configuration), fit, where one sufficient frame means direct entry; [§12](#12-complete-engagement-transition), its lead, where direct engagement keeps the same intake, algebra, closure conditions and owner boundaries without an Executive appointment or an unrequired review; [§13](#13-handoff-projection), its closing paragraph; [§18](#18-profile-qualification), obligation 6; [§22](#22-closure), condition 5.
- Row 3, the empirical revision boundary: [Refinement and conjunction](#refinement-and-conjunction), its closing paragraph, where the set imports no consumer-specific frame, role or topology; [§18](#18-profile-qualification), obligation 23; [§20](#20-failure-classification), "one actor receives every specialist concern as one global context and repeatedly misses known violations" and "long effort resets after local success", which read the signals of §4 as diagnosis and not as verdict; [§21](#21-anti-patterns), item 16; [§22](#22-closure), condition 24.
- Row 4, the executive configuration and its frames: [ACTIVATION §1 Configuration](ACTIVATION.md#configuration), Example, which names the executive configuration as one configuration for work in which a bounded change and delivery across tasks need separate attention and leaves its frames, prohibitions and explanation to this profile; [SPEC_METHOD §8](SPEC_METHOD.md#8-bounded-execution-in-this-method), where the configuration governs where it is selected; [PROFILES §6](PROFILES.md#6-engagement-baseline); [§1](#1-canonical-compression), where the configuration is selected where it fits and is not the method's default; [§3](#3-engagement-applicability), which names the entering and the coordinating frame where it is selected; [No mutation while Executive](#no-mutation-while-executive), which holds wherever it is selected; [§8](#8-derived-executive-frame), [§9](#9-derived-worker-frame) and [§10](#10-derived-reviewer-frame), the declarations of the three frames; [§12 step 2](#2-executive-activates-worker), where a refused activation returns to the Executive with its cause and no Worker result; [§18](#18-profile-qualification), obligations 1, 2 and 10; [§22](#22-closure), conditions 3 and 4.
- Row 5, Executive authority and the prohibition on mutation: [§1](#1-canonical-compression), where the Executive applies only decision authority already granted and no frame acquires operation authority from its label; [The executive configuration](#the-executive-configuration), where the prohibition is in force wherever the configuration is selected and no operation grant lifts it; [§14](#14-coverage-application), its closing paragraph, where visibility is not coverage and every mutation needs its existing owner's grant; [§17](#17-actor-binding-and-independence), its closing paragraph, where an Executive's inspection becomes no Reviewer result; [§18](#18-profile-qualification), obligations 4 and 10; [§20](#20-failure-classification), "the Executive rewrites semantics to close a local problem"; [§21](#21-anti-patterns), item 3; [§22](#22-closure), conditions 7 and 10.
- Row 6, the attention cycle and the drift locks: [Work result](#work-result), `re_entry_requested(basis)`, where the Executive revalidates the basis lock before any further activation; [§8](#8-derived-executive-frame), whose evaluation family asks whether a returned result is exact and current and whose invalidation row names the changes that reopen it; [§12 step 7](#7-executive-disposes-and-checkpoints), where every consumed result is verified against the current subject and basis before disposition; [Activation additions](#activation-additions), the Executive row; [§22](#22-closure), condition 7.
- Row 7, the Product-chain basis: [Drift locks](#drift-locks), the Product-role lock; [§11](#11-derived-generic-specialist-frame-set), the Product Composition family and its falsifier; [§12 step 7](#7-executive-disposes-and-checkpoints), where a repair creates a new candidate and an affected review is reactivated; [§18](#18-profile-qualification), obligation 9; [§20](#20-failure-classification), "a Development Product's structure becomes the authored Product's meaning" and "an authorised mutable Source Project is treated as one immutable review subject throughout construction"; [§21](#21-anti-patterns), item 11.
- Row 8, the non-hierarchical configuration: [§1](#1-canonical-compression), where the three frames are overlapping evaluation contexts and neither a hierarchy nor an actor topology; [§11](#11-derived-generic-specialist-frame-set), its closing paragraph, and [Refinement and conjunction](#refinement-and-conjunction), where refinement is a frame dependency and no hierarchy; [§14](#14-coverage-application), which organises finite evaluations over specialist frames; [§17](#17-actor-binding-and-independence), where frames and actors are separate identities; [§21](#21-anti-patterns), item 2; [§22](#22-closure), condition 3.
- Row 9, steel-thread delivery: no separate consumer applies. The sequence is the Executive's selected strategy under ACTIVATION §1 Strategy, as the section states; the generic sequencing heuristic is SPEC_METHOD §8's own rule and the testing frames it schedules are ASSURANCE §7's; none of them applies this section, and SPEC_METHOD §8 names it only to defer to it.
- Row 10, the work result: [§12 step 4](#4-executive-evaluates-the-work-result), where no variant is accepted progress because work occurred, and [step 7](#7-executive-disposes-and-checkpoints), where `candidate_ready` is not acceptance; [§13](#13-handoff-projection), the activation-refusal and work-result projections; [§18](#18-profile-qualification), obligations 2 and 5; [Project-basis additions](#project-basis-additions), the work-result to core-result mapping; [§21](#21-anti-patterns), items 5 to 7; [§22](#22-closure), condition 4.
- Row 11, intended effects and their reconciliation: no separate consumer applies. The effect values are ACTIVATION §3 Effects' and the reconciliation rule is ACTIVATION §5's, which other members apply directly; this profile's effect field binds the coordinated branch's work result and is read only at §12 step 4, which the row names.
- Row 12, the Reviewer and independence: [§12 step 5A](#5a-candidate-does-not-require-independent-review), where self-review stays Worker evidence and the disposition does not relabel it; [§13](#13-handoff-projection), the Reviewer-activation and review-result projections, which carry no priority and no disposition; [§14](#14-coverage-application), the independent-assessment row; [§15](#15-missing-frame-and-re-entry-application), the reading of question 3; [§18](#18-profile-qualification), obligations 7, 8 and 24; [§20](#20-failure-classification), "the Reviewer implements the fix while keeping its verdict" and "the Reviewer assigns priority, blocks promotion, directs repair or activates another frame"; [§21](#21-anti-patterns), items 8 to 10 and 31; [§22](#22-closure), conditions 5 and 6.
- Row 13, the exact candidate: [Product-chain basis](#product-chain-basis), where a Reviewer evaluates an exact candidate checkpoint and a repair creates a new candidate; [§9](#9-derived-worker-frame), where `candidate_ready` binds the exact candidate and its transition evidence; [§10](#10-derived-reviewer-frame), its subject and invalidation rows; [§13](#13-handoff-projection), the Reviewer-activation projection; [§18](#18-profile-qualification), obligations 8 and 9; [§20](#20-failure-classification), "review evaluates a moving tree or a rebuilt artifact"; [§22](#22-closure), condition 6.
- Row 14, technical triage, severity, priority and boundary effect: [Attention cycle](#attention-cycle), where severity is evaluation evidence and priority, current-boundary effect, disposition and the next action are distinct Executive decisions; [§8](#8-derived-executive-frame), its result row and the sentence that priority and current-boundary effect are decision projections; [§13](#13-handoff-projection), the disposition-and-checkpoint projection; [§18](#18-profile-qualification), obligations 25 and 26; [Project-basis additions](#project-basis-additions), the scales, cutoff, hard stops and triage relation; [§20](#20-failure-classification), "the Executive treats severity, priority, frame verdict and release blocking as one value"; [§21](#21-anti-patterns), item 32; [§22](#22-closure), condition 7.
- Row 15, specialist frames, the generic families and coverage: [§13](#13-handoff-projection), the specialist-activation and specialist-result projections; [§15](#15-missing-frame-and-re-entry-application), the reading of question 5; [Adopt this baseline](#adopt-this-baseline), where each of the twelve families has a declaration, an acquisition path or an authority-bound disposition; [§18](#18-profile-qualification), obligations 21 and 22; [Project-basis additions](#project-basis-additions), the twelve family declarations; [§21](#21-anti-patterns), items 29 and 30; [§22](#22-closure), conditions 8, 22 and 23.
- Row 16, handoff and return relations: [The executive configuration](#the-executive-configuration), Coordination, where the coordinator's view is the closed-result ledger with the projections of §13; [§12 step 3](#3-worker-returns-to-executive) and [step 6](#6-reviewer-returns-to-executive), where the Worker and the Reviewer return to the Executive and neither activates a frame or authorises continuation; [§18](#18-profile-qualification), obligations 5 and 7; [§20](#20-failure-classification), "a child result directly starts repair, review, publication or continuation" and "several episodes or stores are flattened into one apparent path"; [§21](#21-anti-patterns), items 4, 6 and 12; [§22](#22-closure), condition 4.
- Row 17, missing-frame diagnosis and re-entry: [Work result](#work-result), `re_entry_requested(authority)`, where the Executive returns the question to the decision owner the value names; [Drift locks](#drift-locks), whose closing sentence has the Executive repair no failed lock by making its own frame larger; [§14](#14-coverage-application), the missing-frame and topology-change row; [§18](#18-profile-qualification), obligation 11; [§22](#22-closure), condition 9.
- Row 18, adoption and project-defined configuration: [CONFORMANCE §4](CONFORMANCE.md#4-cases-for-method-discriminators), case CD-01, and [§5](CONFORMANCE.md#5-discriminator-coverage), discriminator 32, where a configuration with other names or no central Executive is evaluated against its task; [§1](#1-canonical-compression), its closing paragraph, where adoption is the Product authority's act and a local axioms file carrying the decision becomes no constitutional owner; [§2](#2-status-and-authority-boundary), where inclusion in a cut makes the profile available and adoption requires a separately accepted Product-owned basis; [The executive configuration](#the-executive-configuration), where existing authority selects it or another configuration under §16; [§18](#18-profile-qualification), obligations 1 and 20; [§21](#21-anti-patterns), items 13 and 15; [§22](#22-closure), conditions 1, 2 and 11 and its closing paragraph.
- Row 19, qualification and closure: [§2](#2-status-and-authority-boundary), which reads every requirement of this profile as an exact application of an owning relation or a condition for claiming adoption; [§3](#3-engagement-applicability), where a sufficient direct outcome records its satisfied conditions in its carrier; [Project-basis additions](#project-basis-additions), the profile-specific qualification evidence and residuals. No section of another member applies them: frame and method qualification is EVALUATION §7's and the closure condition is TICKETS §7's, each applied here and applying nothing of this profile.

Each consumer applies the rule and decides nothing the owning section does
not (P2, P6).

The table accounts for this whole member: the lead and §1 to §22, each
section traced by a row that names it or its parent section. Three parts add no
rule of their own: §5 Terms owned by ASSURANCE uses the tier-2 terms as
ASSURANCE §7 defines them, and this table is a trace. The rows name pillars 1 to 9. No row
names pillar 10, axiomatic calculus: this profile states no rule of the
a_c calculus and binds none.

Purpose and material
relation: a reader of this profile sees which of its rules rest on the
commitments and imported families, and which are choices this profile or
the adopting Product makes, so no profile choice is presented as following
from the foundations (P6, P2).

## 4. Empirical revision boundary

Accumulated delivery practice and observed failure may inform frame
selection, qualification and revision. That evidence does not become method
authority, and it imports none of the originating consumer's architecture,
names, actors, topology, runtime, artifacts or work stages into this
generic profile (P6, P2).

The engagement relation of this profile requires (P0, P6):

- one bounded authority selects the active work and the finite frames
  needed to evaluate it;
- a Worker constructs one exact candidate, self-reviews, reports and stops;
- where independent assessment is required, a separately activated
  Reviewer acquires sufficient exact live authority, subject and evidence,
  reusing valid computed facts while supplying its own judgment;
- an activated Reviewer returns evidence-bound severity and technical
  implications without becoming a second implementation loop;
- where coordination is required, the Executive assigns priority and
  adjudicates the current Product mandate under an existing bounded grant;
  and
- inability to perceive a known violation is evidence of a missing,
  misactivated, oversized or capability-incompatible frame (RF-014).

Repeated resets, long repair loops, moving review subjects, proof masking
and duplicated authority are generic signals that a frame declaration,
activation, capability match, basis or authority relation may be defective
(REFERENCE_FRAME §10, missing-frame signals). They justify re-evaluation;
they neither identify one universal architecture nor give a precedent
semantic authority (P6, P5).

Repeated Product drift is read the same way: a useful implementation,
specialisation, scenario, dependency, installed builder or downstream
Product does not become the Product being authored because it is visible to
the same actor or takes part in one delivery chain (P3, P2).

## 5. Profile terms

### Engagement frame

An engagement frame is a frame (REFERENCE_FRAME §1) whose evaluation family
concerns selecting, constructing, assessing or disposing governed work.
Executive, Worker and Reviewer are this profile's engagement frames (P1).

### Specialist frame

A specialist frame is an activated Product, requirement, design, identity,
release, domain, implementation, test, operational, historical or
capability frame that one engagement evaluation needs. A method member,
file, component or lens becomes a frame only when its evaluation, basis,
material manifold, authority, evidence, result algebra and capability
envelope are declared (REFERENCE_FRAME §13, minimal frame declaration; P1,
P6).

### Generic specialist-frame family

A generic specialist-frame family is a reusable evaluation-family archetype
of this profile (§11). It names a recurring distinction that a project
either instantiates where material, has capable authority establish as
non-material for the governed outcome, or keeps as an explicit coverage
residual (P2, P6).

A family selects no concrete carrier, component, actor, architecture, owner
or implementation. One project may instantiate several frames in one
family. One declared frame may cover several families only when its
evaluation and result relations preserve every material distinction instead
of flattening them behind one broad label (P1, RF-008).

### Terms owned by ASSURANCE

Testing frame, authoritative Product path and material combinatorial
complexity are tier-2 terms defined in ASSURANCE §7. This profile uses them
as defined there and adds nothing to them (P1).

### Executive

Executive is this profile's label for the frame that selects or confirms
the bounded activation configuration and consumes closed Worker and
Reviewer results under existing project decision authority. It holds the
complete Product view and the current MVP or release mandate needed to
assign priority, apply disposition and select the next authorised action
(P6, P2).

The frame may be occupied by direct human authority or by a bounded proxy
admitted under the proxy grant of EVALUATION §5, ACTIVATION §1 (Roles and
delegation), identity law and current project authority. It is not a
universal semantic owner, controller, manager service or runtime executive
observer (P6, RF-016).

### Worker

Worker is this profile's label for the constructor role of ACTIVATION §1
activated as a frame. It owns construction and self-review inside its exact
intake, through the operation authority inherited from the governing work
relation. It acquires no admission, publication, acceptance or continuation
authority (P6).

### Reviewer

Reviewer is this profile's label for the independent live-surface
evaluation that the assessment relation of ACTIVATION §1 consumes, governed
by EVALUATION §3 (independence and traceability) and EVALUATION §1 and §7
(assurance boundary and qualification freeze), activated as a frame. It
evaluates one exact subject and returns a closed result, with evidence-bound
technical triage when a finding exists. It does not implement the repair,
assign priority, apply disposition or activate the next frame (P6).

### Technical triage, severity, priority and boundary effect

Technical triage is the Reviewer's assessment of one finding against the
exact evaluated claim and basis. Where admissible evidence and the actor's
capability envelope support it, the triage records (P6, P5):

- the affected claim and the observed failure;
- severity on the Product-selected severity scale;
- causal assessment and confidence, the confidence being a quantified
  claim under [FOUNDATIONS §4 Quantified assurance](FOUNDATIONS.md#quantified-assurance);
- blast radius and the affected users, paths or relations;
- an available workaround or containment;
- repair complexity, regression risk and material dependencies; and
- residual uncertainty and the evidence that would reduce it.

Missing causal or repair evidence stays explicit. Where the missing
relation can change the evaluation, the Reviewer returns `indeterminate` or
`out_of_frame` pressure (FOUNDATIONS §4 Results); it does not invent precision and
does not send work sideways to the Worker (P5).

Severity grades the consequence if the finding manifests. Priority orders
the response relative to the complete Product outcome, likelihood and
exposure, the current MVP or release mandate, reversibility, dependencies,
cost of delay and available capacity. The Reviewer grades severity; the
Executive assigns priority (P6, P2).

The Product-owned Project Reference-Frame Basis binds the severity scale,
the priority scale and the current-boundary decision cutoff, and names
which conditions of the governed outcome are hard stops. What a hard stop
is, its classes, and that it holds whatever the priority, cutoff or risk
appetite, so that no decision waives it, are
[ACTIVATION §4](ACTIVATION.md#4-totality-and-refinement) Hard stops,
whose classes are typical, not closed; the basis names its own
non-waivable hard stops, each holding as that section states. "Non-waivable hard stop" in this
profile and in EVALUATION §5 means such a stop. This profile imposes no
universal numeric scale. Severity, priority, the frame result
(FOUNDATIONS §4 Results) and the current-boundary effect are four distinct
values. When a finding can block a promotion boundary is
[EVALUATION §5 When a finding blocks promotion](EVALUATION.md#when-a-finding-blocks-promotion),
and none of the four values alone decides it (P6, P1).

Current-boundary effect is the Executive's recorded determination of what
one finding does to the current promotion boundary: it blocks it, requires
narrowing it, or may remain an explicit residual. It is a decision
projection, a state this profile declares, not a result and not a
disposition (§8): it maps to no core value of its own and decides nothing
by itself. Where it is "blocks", a condition of EVALUATION §5 holds; the
decision it records returns through the core only through the one
existing disposition the Executive then applies (ACTIVATION §3,
Disposition). Purpose and material relation: the record keeps the
Executive's reading of each finding apart from severity, priority and the
disposition, so a consumer can see why a boundary was held, narrowed or
promoted with a residual, and no field other than the disposition decides
acceptance (P6, P2). A hard stop or a falsified mandatory claim cannot be
waived by lowering priority. An observation outside the exact claim
boundary cannot open another review round because it carries a severe
label (P6, P2). How each result member projects the triage payload and
constrains its consumption is EVALUATION §4 (Result and triage
projection).

### Work result

A work result is the Worker's closed output to its declared consumer; in
the coordinated branch that consumer is the Executive. It exists only after
a successful Worker activation. An `activation_refusal`, with the cause and
core value that
[REFERENCE_FRAME §5](REFERENCE_FRAME.md#5-method-functions) gives it,
returns to the assigning authority or declared result carrier and creates
neither a Worker activation nor a Worker result. This applies to the
Worker the rule that
[ACTIVATION §3 Admission and activation](ACTIVATION.md#admission-and-activation)
states for every step (P5, P6).

The work-result values are the five values of construction availability,
the refinement that
[ACTIVATION §3](ACTIVATION.md#construction-availability) defines for the
predicate "a candidate is available". ACTIVATION §3 owns their grounds,
maps each to exactly one core value, and states that the mapping is total
and exclusive after lawful activation. In this profile they are carriers,
not new semantic dispositions, and none of them is an assessment or an
acceptance of the candidate (FOUNDATIONS §4 Results). The cause that
selects each value is the ground ACTIVATION §3 states; this profile states
no ground of its own. It binds only what the Worker reports and what its
consumer does with each value; the core value shown with each is
ACTIVATION §3's (P5, P6):

- `candidate_ready` (`satisfied`): the consumer receives the exact
  candidate and its transition evidence and decides whether independent
  review is required (§12 step 4); the value is not `accept`;
- `refused` (`falsified`): the work result names the prohibition or
  refusal that is the value's counterexample; the Executive verifies the
  basis and applies the existing authority relation (§12 step 4);
- `incomplete` (`falsified`): the Worker's residuals and stop basis name
  each evaluation it did not perform, which has no result, each it
  performed that its evidence could not decide, which keeps its own
  `indeterminate`, and whether bounded execution ended first. The work
  result is never read as `indeterminate`, as ACTIVATION §3 states, and
  the Executive reactivates work only where current authority already
  permits it (§12 step 4);
- `re_entry_requested(authority)` (`out_of_frame`): the Executive returns
  the question to the decision owner the value names; and
- `re_entry_requested(basis)` (`invalid_basis`): the Executive revalidates
  the basis lock (§6 Drift locks) before any further activation.

A capability, authority, stale-basis, ambiguous-basis or topology mismatch
known during activation is an `activation_refusal` with its cause, never a
synthetic Worker result (P5, P6). Consumers choose the representation;
ACTIVATION §1 and §3 stay the owners of the execution relation, its
results and its dispositions.

The result references the current computed classification, supporting
evidence, residual judgments and original rulings through their existing
carriers. It does not reconstruct unchanged C/J/O at each handoff. The
consumer checks applicability and concrete invalidators; changed evidence
revises only the affected results, preserving originals and supported
surviving claims (ACTIVATION §7; P4b).

### Exact candidate

An exact candidate is the subject identity that the transition evidence of
ACTIVATION §7 and the traceability of EVALUATION §3 require. Where generic
method qualification applies (EVALUATION §7), its construction result is
frozen before material reference exposure as that clause requires.
Elsewhere this profile stabilises the review subject through an immutable
identity or an equivalent exact-subject relation sufficient for the claimed
assessment. The profile creates no new lifecycle state named `frozen` (P3,
P6).

### Baseline-adoption projection

A baseline-adoption projection consumes the Product-owned Project
Reference-Frame Basis of PRODUCT_DEFINITION §7. Where that basis adopts
this profile, the projection records the selected profile mapping, exact
outcome, actor envelopes, evidence coordinates and revision conditions
needed in addition to the Product binding (§16). It is not a second
frame-basis definition and mints none of the authority it projects (P6).

## 6. Executive attention, evaluation and action

### The three duties

The Executive is the frame for three inseparable duties over one governed
outcome (P0, P6, P2):

1. attention management: it keeps the exact outcome and basis, the
   Product-role map, the evaluation inventory, the dependency relation, the
   unresolved frontier, the actor envelopes, the current MVP or release
   mandate, the applicable triage policy and the residual boundary, and it
   selects the smallest dependency-ready activation set sufficient for the
   next decision within the finite actor envelopes;
2. evaluation orchestration: it activates capable Workers, Reviewers or
   specialists, keeps their exact subjects and bases, and consumes only
   closed results or declared translations; and
3. authorised action selection: it assigns priority, determines the effect
   on the current promotion boundary, applies an existing disposition, and
   issues only the next already-authorised activation or action.

The Executive does not contain the complete workspace and does not perform
every evaluation. It acquires no Product meaning, implementation, mutation,
acceptance, publication or other operation authority from the role. A
material effect stays owned by the actor that carries its exact operation
grant (P6, RF-002).

### No mutation while Executive

An actor occupying the Executive frame modifies no candidate, Product or
worktree bytes and performs no implementation effect. Filesystem or tool
access is no exception, and neither is an edit that is small, test-only,
reversible or apparently obvious. Mutation requires a separately activated
Worker or Writer relation carrying the exact operation grant, subject and
write territory. A same-actor role transition is explicit and is recorded in
the existing work carrier before the effect; for that effect the actor is no
longer acting as Executive. Recording or delegating after an Executive edit
cannot authorise the edit retroactively (P6, P3). This prohibition is this
profile's, and it applies wherever the executive configuration is selected
([ACTIVATION §1 Configuration](ACTIVATION.md#configuration), Example; §7);
an operation grant covering a construction, status and checkpoint sequence
does not lift it
([ACTIVATION §1 Roles and delegation](ACTIVATION.md#roles-and-delegation)).

### Attention cycle

`U` is the durable inventory of known material evaluations that do not have
a closed result applicable to the current basis. `M` is the finite,
dependency-ready part selected for the next activation. The frontier is the
inventory's readiness relation; the closed-result ledger records the
returned results, their predicates, subject, basis, evidence and residuals.
An applicable stop is a stop condition admitted for this work, including an
authority, capability or resource limit under
[ACTIVATION §1](ACTIVATION.md#1-the-step), Stops. A stop condition is not permission
to discard the obligations that remain open (P0, P4b, P6).

```text
U = every known material evaluation not closed on the current basis

while U is non-empty:
  if an applicable stop condition holds:
    preserve all open obligations, results and required re-entry in the durable work carrier
    end this attention cycle with the stop cause and its bounded result
  select a finite dependency-ready subset M that fits the assigned actors
  activate each member of M against the exact outcome and basis
  keep assurance-independent evaluations free of unclosed peer results
  when no other authorised decision is ready:
    await decision-relevant input (event-driven attention, below)
  record every closed result, technical triage, residual and invalidation condition
  apply only declared conjunctions or translations
  assign priority and boundary effect only under the current Product mandate
  withdraw affected reliance after a subject or basis change until applicability is established
  update U from coverage, dependencies, conflicts and discovered materiality

end this cycle when every mandatory evaluation is closed, governing authority
has retained every remaining residual consistently with the claim, or an
applicable stop condition holds; retain every unresolved obligation
```

The cycle needs no scheduler and no frame engine (RF-016). `M` may hold
parallel activations. Recursion follows declared evaluation dependencies and
bounded refinements; it does not nest or join undifferentiated copies of
every frame. The frontier and closed-result ledger are durable and
reconstructable. The Executive acquires the portion material to the next
selection or decision, with the exact owner routes and dependencies needed
to establish its sufficiency; it need not hold the whole ledger or every
evaluator's working context in active attention (P0, P4b, P2).

Ending the cycle establishes neither Product success nor acceptance. A
closed evaluation may be `falsified`; an applicable stop may leave required
evaluations without results. The return distinguishes closed results,
unperformed evaluations, retained residuals and the stop cause. Outcome
satisfaction still requires its own evidence and the applicable closure and
acceptance conditions. Changed subjects or bases preserve the historical
result while current reliance follows
[FOUNDATIONS Change impact and evidence reuse](FOUNDATIONS.md#change-impact-and-evidence-reuse)
and [ACTIVATION §7](ACTIVATION.md#7-closed-result-and-reuse) (P5, P6).

Severity supplied by the Reviewer is evaluation evidence. Priority,
current-boundary effect, disposition and the next action are Executive
decisions. They stay distinct ledger entries even where a Product-defined
policy maps one to another (P6, RF-007).

Every result returns to the Executive, to a declared conjunction or to
another frame through an explicit declared relation. That none of them
activates another frame or authorises continuation by itself is
[ACTIVATION §1 Admission](ACTIVATION.md#admission), applied here. A consumer receives the
closed result and its source routes, not the child's hidden reasoning
context (P6, P4a; ACTIVATION §7).

### Event-driven attention

Executive attention is event-driven by default. The Executive re-enters the
attention cycle for a decision-relevant closed result, a material exception
or changed basis, an owner request, or a declared deadline or checkpoint.
While Workers carry out their bounded grants and no other authorised
decision is ready, it waits. It does not repeatedly inspect unfinished work,
replay unchanged judgments or request status without a decision need (P0,
P2).

It keeps the frontier, the return conditions and the valid evidence and
judgments. It refreshes affected support when a material observation
changes its basis, and revalidates the drift locks (below) before activation
and before disposition. Waiting waives no current-workspace verification,
evidence validity, required independent assessment, closed-result
consumption, or authority or closure duty (P6, P4b).

Where notification is unavailable or unreliable, or an actual supervision
obligation requires observation, the Executive uses bounded fallback
observation with a declared purpose, cadence or checkpoint, evidence target,
and stop or escalation condition. Silence proves neither progress nor
failure. A genuine blocker or material risk is investigated, with
intervention where required, within existing grants; unknown status alone
does not establish a stalled Worker (P5, P6).

Repeated no-progress observations, or returns with no new decision-relevant
evidence, require a bounded reassessment of the frame, grant, dependency or
evidence gap and a decision under existing authority. The Executive does not
keep polling or repeat the same repair on an unchanged basis (ACTIVATION §3,
Disposition). Reduced reasoning churn is not a lower-assurance path and is
no permission to reduce required actor capability; it introduces no
universal cost, budget or accounting gate (P2, P0; ACTIVATION §6).

### Drift locks

Before activation and before disposition, the Executive revalidates five
locks (P3, P6, P2):

| Lock | Holds when |
|---|---|
| outcome lock | the selected Goal, Product outcome, boundary and lawful re-entry class, the current MVP or release mandate, and the triage policy are unchanged |
| basis lock | the subject, authority, dependency, configuration, topology, evidence, time and candidate coordinates are exact and current |
| Product-role lock | the mutable Source Project, Product Definition, Release Cut, Product, Install, Artifact and dependent Product identities stay distinct, and every Development Product role stays bound to its exact underlying Install |
| authority lock | the semantic, evaluation, operation, decision, acceptance and publication owners and grants are unchanged |
| coverage-and-return lock | every material evaluation and interaction is closed or an explicit residual, and every consumed result followed its declared return relation |

A failed lock takes the value or move its owner gives the case; this
profile adds none (P5, P6):

| Failed lock | Value or move, and its owner |
|---|---|
| changed Product meaning (outcome lock) | `re_enter` to the owning relation ([ACTIVATION §3 Disposition](ACTIVATION.md#disposition)) |
| stale or substituted basis, before activation (basis lock) | the activation refuses: `activation_refusal(basis)`, `invalid_basis` ([REFERENCE_FRAME §5](REFERENCE_FRAME.md#5-method-functions)) |
| stale or substituted basis of an evaluation performed on it | that evaluation's own result is `invalid_basis`, or it is reactivated on the current basis ([RF-005](REFERENCE_FRAME.md#rf-005-exact-basis-and-coordinates)) |
| stale basis of a held result, before disposition | for the disposition's conjunction the component has no applicable closed result: a gap, never relabelled `invalid_basis` and never counted as returned ([FOUNDATIONS §4 Conjunction of results](FOUNDATIONS.md#conjunction-of-results), Stale results) |
| missing material scope | `out_of_frame`: at activation, as [ACTIVATION §3 Admission and activation](ACTIVATION.md#admission-and-activation) states; for an evaluation, on the ground [FOUNDATIONS §4 Results](FOUNDATIONS.md#results) gives, an undeclared material relation or capability |
| missing operation authority (authority lock) | the activation refuses, `activation_refusal(authority)` (REFERENCE_FRAME §5), or the effect is refused |
| an unresolved mandatory conflict (coverage-and-return lock) | the conjunction is not `satisfied`; the conflict survives every join (FOUNDATIONS §4 Conjunction of results, Survival) |

The Executive repairs none of these by making its own frame larger (P5,
P6).

### Product-chain basis

Capability composition, including recursive and shared constituents, applies
[PRODUCT_DEFINITION §9](PRODUCT_DEFINITION.md#product-composition-contract).
Select the outcome-owning frame and the actual dependency-ready work; retain
path-specific authority and material far-side reliance. A cycle in Product
relations is not itself a work deadlock, and naming a lead supplies no missing
current prerequisite. An enclosing Product is not required for a constituent's
scoped standalone entry when its declared dependencies suffice (P3, P6).

A governed outcome may concern one Product or an explicit directed chain of
Products. Its basis records the distinct role of every mutable Source
Project, current Product Definition, exact candidate checkpoint, Release
Cut, Product, Install, Artifact, Development Product, dependent Product and
composition edge. Each Development Product role binds one exact underlying
Install identity. Each edge names its source and target roles, its governing
authority and contracts, its lifecycle, its evidence boundary, its refusal
and its invalidation (P3, P6; the Product-role
map in the basis is PRODUCT_DEFINITION §7, the lineage objects FOUNDATIONS
§2).

An installed Product may lawfully build its own successor or another
Product. That Development Product stays distinct from the mutable Source
Project and from the Product being authored. Directory nesting, shared code,
shared actors, source imports, tool reachability, matching labels or equal
outputs create no Product identity, composition edge or authority transfer
(P3, P1).

Exact basis does not make a Source Project immutable. A Worker may
cumulatively mutate the exact Source Project and write territory named by
its operation grant. A Reviewer evaluates an exact candidate checkpoint
produced from that workspace. A repair advances the workspace, creates a new
candidate and invalidates the affected results. A released Product, Release
Cut or exact Install stays immutable under its own lifecycle law and imposes
no immutability on the Source Project constructing a successor (P3, P4b).

## 7. Non-hierarchical frame configuration

[RF-009](REFERENCE_FRAME.md#rf-009-no-assumed-hierarchy) owns the list of
distinct relation structures and the rule that they may be aligned where
the subject warrants it but are never one hierarchy. This configuration
uses three of them, under its own names (P6, RF-009):

1. authority precedence, RF-009's structure of that name, decides which
   existing surface may select work, admit a frame configuration, dispose
   a result or require re-entry;
2. temporal and evidence flow, RF-009's communication, carries activation
   packets and closed results; and
3. frame topology records disjointness, overlap, conjunction, translation
   or composition among the evaluations actually used (REFERENCE_FRAME §7),
   while evaluation independence and Reviewer assurance independence stay
   separate activation relations.

The other structures RF-009 lists stay distinct as it states; this
section adds none and merges none.

Executive, Worker and Reviewer commonly overlap on the selected method
basis, the governed outcome, the workspace checkpoint, the affected relation
set, the candidate, the evidence and the residuals. The overlap collapses
neither evaluation nor authority (P1, P6, RF-008): the Executive evaluates
activation, priority, boundary effect and disposition; the Worker evaluates
and performs bounded construction; the Reviewer evaluates the exact
candidate claim and supplies technical triage where assessment is activated.

The active evaluation may be represented as (P0, P4a):

```text
engagement frame
  + material specialist frame set
  + exact subject and basis
  + capable actor
  -> one activated evaluation
```

The notation needs no Cartesian-product schema and no universal frame
runtime (P2, RF-016).

### The executive configuration

The executive configuration is the configuration this profile describes,
in the sense of [ACTIVATION §1 Configuration](ACTIVATION.md#configuration).
It allocates construction to the Worker frame, specialised as Writer for
documents and records; assessment, where it is required, to the Reviewer
frame; and coordination across tasks to the Executive frame, which disposes
within the decision grant existing authority admits (§5, §8 to §10). It is
one configuration, selected where it fits the task, not an inventory of
roles that all work needs. Existing authority selects it or another
configuration under §16, and a configuration with other frames, names or
topology is evaluated against its own task as ACTIVATION §1 Configuration
states, not by its distance from this one (P0, P2, P6).

Where it is selected, every grant, duty, limit and prohibition this
profile places on its frames is in force without exception: the
Executive's prohibition on mutation (§6 No mutation while Executive), its
duties under §6 The three duties, Attention cycle, Event-driven attention
and Drift locks, and the exclusions of the Worker and Reviewer frames (§9,
§10) among them.
Selecting the configuration makes none of them optional, and no operation
grant lifts them (P6).

Explanation of the allocation. ACTIVATION §1 Configuration requires the
design that selects a configuration to explain its allocation; for this
configuration the explanation is (P0, P5, P6):

- fit: task-based work in which carrying out a bounded change and managing
  delivery across successive tasks need separate attention; where one
  sufficient frame covers the task, direct entry applies instead (§3);
- resource limits assumed: every actor has a finite context and attention
  envelope, so no frame holds the whole workspace. The Worker's context
  holds one causal cone (§9), the Reviewer's one exact claim with its
  evidence (§10), and the Executive's the outcome, the frontier and the
  closed-result ledger (§6), never the working context of an evaluator.
  The adopting Product's basis records the concrete capability envelopes
  (§16 Adopt this baseline); time, spend and other resource limits are
  declared, measured and honoured as
  [ACTIVATION §6 Resource limits](ACTIVATION.md#resource-limits) states,
  with the values the selected execution binding sets;
- failure assumptions: a constructor can be wrong about its own candidate,
  so its self-review is construction output and required assessment is
  independent (EVALUATION §3); a coordinator that also changed the subject
  would decide on its own effects, so the Executive makes none (§6); a
  result can become stale or bound to another subject, so the Executive
  revalidates the drift locks before activation and disposition (§6); an
  activation can fail, so a refused activation returns with its cause and
  no Worker result (§5 Work result); an effectful activation can stop
  with an effect whose completion is unknown, as where a response was
  lost, so the work result names each intended effect with its
  [ACTIVATION §3 Effects](ACTIVATION.md#effects) value, and an effect of
  uncertain completion is reconciled under
  [ACTIVATION §5](ACTIVATION.md#5-work-state-and-restart), sufficiently
  for the next dependent action, before work is reactivated or that
  action is taken (§12 step 4, §13); and a
  bounded view can lack what a task frame knows, so results carry every
  blocker material to delivery (next paragraph).

Coordination. The Executive is this configuration's coordinator, and
[ACTIVATION §1 Configuration](ACTIVATION.md#configuration), Coordination
across tasks, owns the rule for a coordinator's bounded view. Here that
view is the closed-result ledger (§6 Attention cycle) with the
work-result, review-result and specialist-result projections of §13. The
Executive acquires what a decision needs beyond that view through its
frame inputs (§8) or by activating a further bounded evaluation (§6). A
compact result carries every blocker material to delivery, as that rule
requires, in the residuals, stop basis and effect values of a work
result, the findings, counterexamples and residuals of a review result,
and the residuals of a specialist result (P0, P4b, P6).

Purpose and material relation:
ACTIVATION §1 makes the executive configuration one example among lawful
configurations and leaves its frames, prohibitions and explanation to this
profile. Without the explanation the allocation could be applied where it
does not fit or read as the method's default; without the statement that
its prohibitions hold wherever it is selected, selection could be read as
relaxing them. The material relation is whether a task receives this
allocation only where it fits, and whether its prohibitions and its
reporting of blockers hold wherever it is used.

## 8. Derived Executive frame

The Executive frame, in the shape of a frame declaration (REFERENCE_FRAME
§13; P6, P0):

| Frame element | Executive |
|---|---|
| evaluation family | Is the bounded outcome and execution basis authorised? Which frames and actors are capable? Is a returned result exact and current? Which priority, current-boundary effect, disposition and next action follow from the current Product mandate? |
| subject and basis | the complete selected method cut; the exact Goals, Product, requirements, design and work authority; the current MVP or release mandate; the current workspace and checkpoint; open findings and their technical triage; the Product-selected triage policy; the proxy grant where one is used |
| material manifold | outcome, mandate, affected causal cone, evaluation inventory, frame configuration, actor envelopes, evidence obligations, returned results and technical triage, priority, boundary effect, re-entry owners and the boundary of already-authorised continuation |
| coordinates | exact method, project, outcome, mandate, authority, checkpoint, candidate, evidence, finding, triage-policy and actor identities |
| governing invariants | RF-001 to RF-017 (REFERENCE_FRAME §3); the execution relation and intake of ACTIVATION §1 with the design profile's bounded-frame conservation laws; applicable identity, carrier, assurance and release law |
| authority | the existing Product or work frame-set and decision authority, or its admitted bounded proxy; no operation or other authority arises from the label |
| evidence | live authority surfaces, frame results, Reviewer technical triage, exact candidate identity, transition evidence, coverage residuals and specialist results |
| capability envelope | enough method, Product, release or MVP, authority, workspace, triage and actor-selection competence to configure, prioritise and dispose the bounded evaluation; implementation expertise may be delegated to specialist frames |
| exclusions | candidate, Product or worktree byte mutation and implementation effects while occupying the frame; implementation ownership; silently rewriting Reviewer evidence or severity; claiming independent review without a qualifying activation; semantic reconstruction owned elsewhere; disposition outside the admitted grant |
| result | one core result (FOUNDATIONS §4 Results), the assigned priority and current-boundary effect, and one existing disposition (ACTIVATION §3 Disposition) where the basis is decidable |
| invalidation | a material change of method, authority, outcome, mandate, triage policy, checkpoint, candidate, evidence, finding, capability or topology |

The frame adds no `authorize` or `no_action` disposition. Activation is the
`activate` function of REFERENCE_FRAME §5; candidate disposition stays
exactly `accept`, `local_repair`, `re_enter` or `reject` (ACTIVATION §3,
Disposition). Priority and current-boundary effect are decision
projections, neither core results nor dispositions. If the Executive cannot
rely on a supplied severity or technical assessment, it reactivates a
capable evaluation or keeps the uncertainty; it never silently rewrites the
Reviewer result (P5, P6).

### Steel-thread delivery

The Executive sequences delivery around a steel thread: the smallest real,
runnable path from a supported Product entry to a material outcome through
the selected composition. The path is established early and widened in
bounded increments; where it already exists, the affected thread is extended
or revalidated. Increments are chosen for consequential uncertainty,
dependency and interface reach, and failure impact (P2; the generic sequencing heuristic is SPEC_METHOD §8).
The steel thread is this profile's selected strategy under the
construction relation ([ACTIVATION §1 Strategy](ACTIVATION.md#construction-relation)):
its rationale is early feedback on the end-to-end composition at the cost
of later widening; other strategies remain lawful for other
configurations; no superiority over them is claimed, and the rationale
states the objective the selection serves and its cost (P2, P6).

Early end-to-end and integration evidence prunes incompatible construction
choices before they spread; it settles the exercised interfaces, keeps
working composition, and concentrates construction on unresolved
obligations. Each passing thread establishes only the relations and
conditions actually exercised; untested branches, interaction combinations,
and refusal and recovery paths keep their material proof obligations.
Settled construction decisions are revisited when material counterevidence
invalidates their basis (P6, P4b).

During construction, focused deterministic regression and targeted
judgment probes resolve material uncertainty, and unit evidence covers
module-owned laws under the testing frames (ASSURANCE §7). Substantial,
resource-intensive user-acceptance cycles are scheduled near release or
when a bounded capability is complete enough to qualify; an early focused
user probe stays appropriate where it decides a material outcome
uncertainty (P2, ACTIVATION §7 proof cadence).

The product testing frames keep their distinct claims and govern the
necessary scenarios, independent assessments and repetitions. Qualified
results are reused while their exact subject and basis stay valid; affected
assurance is rerun when a material change invalidates it. The Executive
selects this sequence under the existing mandate and activates construction
only through the existing operation grants (P6, P4b).

## 9. Derived Worker frame

(P6, P0)

| Frame element | Worker |
|---|---|
| evaluation family | Can the exact authorised outcome be constructed through the smallest coherent causal cone while preserving every affected governing relation and disposing of competing paths? |
| subject and basis | the sufficient execution intake of ACTIVATION §1, with the accepted design-to-execution basis of the design profile where it applies |
| material manifold | affected entities, lifecycles, transformations, authorities, capabilities, algorithms, inputs, outputs, dependencies, interaction seams, failure boundaries and proof obligations |
| coordinates | exact activation, source checkpoint, workspace, inputs, dependencies, configuration, actor envelope, outputs, candidate and evidence identities |
| governing invariants | the complete selected method and project relations material to the affected cone; ACTIVATION §1 owns construction and self-review |
| authority | inherited bounded construction or transformation authority and self-review only; mutation only where the exact inherited owner grant names the subject and write territory; no admission, publication, independent acceptance, frame-set revision or inferred next action |
| evidence | live implementation, tests and test source, analysis, generated artifacts, installed or operational behaviour where claimed, reconstruction, mutations and exact transition evidence |
| capability envelope | the declared method, domain, implementation, tool, access and finite-context competence the causal cone requires |
| exclusions | upstream semantic change, unauthorised cone expansion, self-acceptance, hidden competing paths, and advancing after returning the work result |
| result | exactly one work-result value, which carries the one core value ACTIVATION §3 maps it to for "a candidate is available" (§5 Work result); each evaluation the Worker performed keeps its own core result (FOUNDATIONS §4 Results) |
| invalidation | a material change of intake, basis, checkpoint, dependency, configuration, capability or topology |

`candidate_ready` binds the exact candidate and the transition evidence of
ACTIVATION §7. It is not `accept`. Green tests are evidence only for the
relations their production and test semantics actually exercise (P6;
EVALUATION §1).

The Worker label grants no mutation authority. An effectful Worker may
mutate only the exact subject and write territory named by its inherited
construction or transformation grant; missing, ambiguous or out-of-territory
mutation authority refuses the effect (P6).

Read scope follows the complete causal cone and may exceed write territory
within the declared access grant. A narrow mutation grant does not justify
omitting a material producer, consumer or governing owner from inspection.
A repair needed outside the territory is returned to its owner;
understanding a relation grants no cross-boundary effect (P0, P6;
ACTIVATION §1, Execution unit).

## 10. Derived Reviewer frame

(P6, P5)

| Frame element | Reviewer |
|---|---|
| evaluation family | Is this the exact claimed subject and basis? Does it satisfy the applicable method and project relations without competing authority, proof masking or an unevaluated composition boundary? For each finding, which evidence-bound severity and technical implications follow? |
| subject and basis | exact candidate, claim, governing method and project authority, scope, exclusions, evidence population, Product-selected severity scale, review carrier and declared independence conditions |
| material manifold | claimed relations; causal producers and consumers; authority seams; competing paths; failure, recovery, installed and reconstruction surfaces where claimed; test and fixture semantics; historical counterexamples; a finding's cause, blast radius, workaround, repair complexity, regression risk and uncertainty where supportable |
| coordinates | exact candidate, source basis, authority revision, configuration, dependency, evidence population, severity scale, installed subject, review time and Reviewer identity |
| governing invariants | RF-001 to RF-017; the execution relation (ACTIVATION §1 and §3); independence and traceability (EVALUATION §3); assurance boundary and qualification freeze (EVALUATION §1, §3 and §7); applicable Product, design, identity and release law |
| authority | bounded evaluation only; review access yields no construction, transformation, admission, publication, mutation, decision, disposition or next-activation authority |
| evidence | independently acquired live authority, candidate implementation, tests, artifacts, history, operational evidence, mutations, replay or reconstruction, and reproduced observations material to the claim and the technical triage |
| capability envelope | declared method, domain, implementation, assurance, technical-triage, tool, access, context, counterexample-search and independence competence |
| exclusions | editing the candidate, implementing a repair, assigning priority, disposing the release or MVP boundary, selecting the next action, substituting the Worker's summary, assurance-owned semantic reconstruction, flattening unbound evidence, silent scope expansion |
| result | one core result with findings, counterexamples, evidence-bound technical triage and residuals sufficient for the Executive to assign priority and apply the existing disposition where the basis is decidable |
| invalidation | a material change of candidate, authority, basis, evidence population, severity scale, dependency, configuration, scope or independence |

When independent review is required, and what makes a claimed review
traceable, are
[TICKETS UP-007](TICKETS.md#execution-and-verification-authority-separation-up-007),
with the further boundaries a governing basis adds; what counts as
independent is [EVALUATION §3](EVALUATION.md#3-independent-assessment);
EVALUATION §1, §3 and §7 decide the exact assurance boundary and the
qualification freeze. This profile adds no universal review round and no
new independence test (P6).

ACTIVATION §1 and §3 stay the owners of assessment and disposition. This
profile uses an activated Reviewer result as independent live-surface
evaluation input and, in the coordinated branch, the Executive as the
authorised assessor or proxy that applies the one existing disposition. It
creates no second verdict or disposition family (P6, P5).

The Reviewer may assess likely repair complexity and regression risk
without becoming the repair owner. Where cause, blast radius, workaround or
repair risk cannot be supported inside the activation, the result records
that uncertainty instead of manufacturing a complete triage (P5).

Tests are inside the Reviewer's manifold when their code, fixtures,
mutations, environment or interpretation can change the proof claim; a
passing result is not relied on in place of reviewing those semantics (P6,
EVALUATION §1).

Each finding binds a violated property, a supported entry or state, the
governing operating or threat model and a credible causal path. The same
conditions apply to retained guards and acceptance predicates as to new
findings. An excluded threat alone gives no retention claim; a proposed
wider threat model re-enters its owner. Internal location alone does not
establish trust, and hypothetical hostility alone does not establish
applicability. The actual untrusted-input, mutable-state, authority and
effect checks the supported model requires are retained. A suggested repair
becomes an obligation only through its proper owner (P6, P2, P5).

## 11. Derived generic specialist frame set

The profile declares the following generic families for Product work. Each
row is an evaluation archetype, not a complete frame declaration
(REFERENCE_FRAME §13). An adopting project binds, for every activated
instance, the exact subject, basis, material manifold, coordinates,
invariants, authority, evidence, exclusions, result algebra, capability
envelope, dependencies and invalidation conditions (P2, P6).

The family labels resolve inside
`urn:stdo:bounded-context:reference-frame-evaluation`, owned by
REFERENCE_FRAME, under the selected basis. Under bounded-context semantic
resolution (PRODUCT_DEFINITION §5), `Product`, `Owner`, `Entity`,
`Operator`, `Install` and the other labels do not become equal to
same-spelled Product, authority, domain or runtime concepts; every material
cross-context seam needs an explicit relation (P1, P3).

| Family | Evaluation family and exact subject | Governing authority and permitted output | Immediate falsifier |
|---|---|---|---|
| Product | Does one exact current Product claim, outcome, boundary and lifecycle govern the claimed Product subject without downstream reinterpretation? The basis is the current Intent, Product, requirements, acceptance meaning and exact Product coordinates. | Product and requirement authority keep meaning and acceptance. The frame returns only a bounded evaluation result and evidence. | Design, code, tests, a predecessor's behaviour or a local convention changes Product meaning or substitutes another Product subject. |
| Product Composition | Does one exact directed relation between Products preserve the source and target roles, the Product Definition, Release Cut, Product and Install identities, each Development Product role binding, the governing contracts, authority, lifecycle, evidence boundary and invalidation law? A chain is evaluated through bounded edge activations and a declared conjunction. | Each Product keeps its own meaning. The authority and contracts the composition relation cites own the edge. The frame returns evaluation evidence only. | Directory nesting, shared implementation, a common actor, a source import, tool reachability, matching output or builder convenience creates or changes a composition relation; a Development Product is confused with the Product being authored; or one node silently redefines another. |
| Design | Does the accepted structural HOW satisfy the material constitutional WHAT, close the required design relations and keep their owners across the affected topology? | Accepted design under its governing Product and requirements owns structural decisions. The frame may identify satisfaction, contradiction or a design re-entry gap; it cannot invent Product truth. | Implementation precedent resolves an open material design decision, design creates Product meaning, or a material relation or competing structure stays undeclared. |
| Design Component | Does one bounded design component, with its direct causal dependency cone, preserve its parent contract, internal relations, sibling seams and required outputs? | The accepted design boundary owns only its bounded composition decision. Parent, sibling, Product, requirement and runtime owners keep their relations. | The component omits a material far-side seam, absorbs a sibling or parent decision, or reports local closure while its direct composition is unresolved. |
| Public Boundary | Does one supported public entry or exit perform exactly its assigned validation, selection, transport, refusal and projection relations while preserving the selected interior owners? | Product, interface, identity, security and accepted-design authority define the boundary. The frame evaluates the boundary result or refusal and returns only its closed evaluation; it does not recreate interior semantics. | The public surface interprets owner meaning, sequences hidden domain decisions, exposes an interior carrier as Product truth, or admits an unsupported path. |
| Entity | Is one semantic, artifact or runtime entity bound to its exact identity, kind, lifecycle, owner, representation and applicable effect regime? | Product, domain, identity, requirement and accepted-design authority define the entity. The frame returns an identity- and lifecycle-bound evaluation. | A filename, wrapper, ticket, object shape, cache or process instance stands in for stable entity identity, or distinct lifecycle coordinates are collapsed. |
| Operator | Is one material operation an irreducible declared relation over its admitted domain, inputs, outputs, refusals, algebra, effects and lawful compositions? | Product, requirements, the accepted ontology and design, and the named operation owner define the relation. The frame evaluates it without creating another executable plan. | An endpoint, function, class, command or file label is asserted to be the semantic atom; orchestration hides the real operator; or generic mechanics are rebuilt as domain law. |
| Owner | Does one semantic or authority-bearing relation preserve its owner, role kind, subject, scope, basis, lifecycle, refusal invariants and permitted delegation? | The existing Product, requirement, identity, accepted-design, release or other named authority owns the relation. The frame may evaluate authority congruence only. | Another surface recreates the judgment, source authorship is treated as authority transfer, or a proxy, foundation, frame or actor widens the grant. |
| Effect | Does one action obey its declared pure, observational, artifact or runtime effect regime, including commit, failure, retry, recovery, compensation, admission and projection law where material? | The applicable Product, requirement, design, artifact, runtime and admission owners keep their decisions. The frame returns an effect-bound result and evidence. | Distinct effect regimes are collapsed, a mutation bypasses its admitted owner, compensation is treated as semantic rollback, or a read becomes rival writable truth. |
| Reuse/Foundation | Has one material generic capability or dependency been normalised and compared against credible lawful foundations, with any irreducible local remainder and authority-bearing role preserved? | The design profile's capability-and-foundation selection law and the existing trade-off owner govern selection. The frame cannot move semantic authority to a foundation. | Incumbent or local code wins without a bounded comparison, a richer lawful foundation is reproduced, unknowns are scored favourably, or reuse acquires owner authority. |
| Install | Is the exact selected Product, release, artifact, dependency set, configuration and callable entry resolved and exercised through its admitted installed coordinate, independently of mutable source convenience? | Product, identity, release, dependency, packaging and accepted-design authority define the installed subject. The frame returns installed identity, reachability and refusal evidence. | Source-tree imports, ambient resolution, process registries, fixture bindings, rebuilt artifacts or a moving workspace stand in for the claimed installed subject. |
| Proof | Does one exact claim have a congruent subject, basis, path, population, oracle, evidence, falsifier, residual boundary and invalidation law? | The claim owner defines meaning; the applicable testing, assurance, review, Product and release owners define evaluation and acceptance. The frame returns evidence and a closed evaluation result, not Product meaning or disposition. | A harness recreates owner meaning, evidence targets another subject or path, a count or aggregate green stands in for the claim, or proof tooling mutates the subject undetectably. |

The families are non-hierarchical and may overlap (RF-008, RF-009).
Product does not outrank Design by frame topology; Product authority
already governs constitutional meaning. Owner gains no authority over
Entity or Operator by being a broader frame. Proof does not become Reviewer,
acceptance or disposition authority. The existing authority graph stays in
control (P6).

### Family dispositions

For each governed outcome the known evaluation inventory (REFERENCE_FRAME
§8) disposes every family as one of (P2, P6, P5):

- instantiated by one or more exact frame declarations or authoritative
  acquisition paths, because the family is material;
- evidenced as non-material to the exact outcome by the authority capable
  of that determination; or
- kept as an explicit uncovered, conditional, conflicted or `out_of_frame`
  residual.

The absence of a named file, component, runtime object or actor is no
evidence that a family is non-material. Conversely, adopting this profile
does not require a project to create twelve components or to activate
twelve frames for every task (P2, P1).

### Refinement and conjunction

When a generic frame is recursively refined, each child declaration records
its parent contract, purpose, material entities, identity and lifecycle
relations, semantic owners, direct sibling seams, applicable invariants and
prohibited competing paths. Refinement opens only for a material
distinction needed to close the parent evaluation. It is a frame dependency
relation, not an organisational or runtime hierarchy (P2, P4a; ACTIVATION
§4).

Coverage records the union of admissible observations the activated frames
contribute. A composite claim takes the value of its declared conjunction
under
[FOUNDATIONS §4 Conjunction of results](FOUNDATIONS.md#conjunction-of-results),
Reported value. This profile's declared rule makes each material
cross-frame seam a mandatory result or required coverage: the seam
preserves, or lawfully translates, exact identity, coordinate and basis,
carried value or evidence, lifecycle scope, authority and provenance
([REFERENCE_FRAME §6](REFERENCE_FRAME.md#evidence-or-coordinate-translation)
for translation). Each case of a seam enters the conjunction as that
section states (P4a, P5):

| Seam case | Input of the conjunction and value |
|---|---|
| no closed result applicable to the composite: not evaluated, or its only result is stale or bound to another subject or basis | a planned assessment without a closed result, a gap with no value of its own (FOUNDATIONS §4, the second input and Stale results) |
| a material seam that no planned assessment addresses | uncovered coverage, a gap with no value of its own (the third input) |
| evaluated and found not to preserve or lawfully translate what the rule requires | the seam's own result: `falsified`, or the outcome and core value that [REFERENCE_FRAME §5](REFERENCE_FRAME.md#5-method-functions) gives a refused translation by its cause |
| evaluated, with evidence that cannot decide it | `indeterminate` |
| its evaluation needs a translation or relation that no frame declares | `out_of_frame` |
| evaluated on a stale, advanced, ambiguous or mismatched basis | `invalid_basis` for its own predicate ([RF-005](REFERENCE_FRAME.md#rf-005-exact-basis-and-coordinates)), held as a returned result |

A composite with any of these cases is never `satisfied`; it reports the
non-satisfied value that FOUNDATIONS §4, Reported value, gives, with each
gap recorded by kind. Which non-satisfied value it reports where several
are returned is the conjunction rule the adopting project declares (§19
Project-basis additions). This profile's own declared choice is that no
frame is selected as dominant.

The set imports no consumer-specific frame, runtime role, architectural
topology or renamed local substitute. A consumer may declare such frames
under its own Product or accepted-design authority when they are material;
they are not part of this baseline (P2, P6).

### Relation to the testing and interface frames

Where this set is adopted, the product testing frames of ASSURANCE §7 supply
claim-congruent evidence to one or more Proof evaluations. Proof is not a
testing hierarchy or an aggregate-green frame: user-acceptance, end-to-end,
integration and unit results keep their distinct claims and coordinates (P6,
P4a).

The end-to-end interface integration frame (ASSURANCE §13) relates the
Public Boundary, Design, Operator, Owner and Proof families to the
integration, end-to-end and user-acceptance frames. Its computational
whole-path evaluation composes the selected interface claims with Operator,
Owner, Reuse/Foundation and Proof. Neither adds a thirteenth family, a fifth
testing type, a role or a universal activation gate (P2).

## 12. Complete engagement transition

The steps below describe the coordinated branch selected under §3. Direct
Worker engagement keeps the same sufficient intake, work-result algebra,
closure conditions and owner boundaries without inserting an Executive
appointment, or a review that no applicable condition requires (P0, P6).

### 1. Existing authority selects the basis

Goals, Product, requirements, accepted design, a ticket, release law or an
admitted bounded proxy selects the outcome and the work authority under its
existing owner. The Product-owned Project Reference-Frame Basis
(PRODUCT_DEFINITION §7) projects that decision (P6).

### 2. Executive activates Worker

In the coordinated branch the Executive applies `activate` (REFERENCE_FRAME
§5) to the sufficient execution intake of ACTIVATION §1. The packet is
REFERENCE_FRAME §11; for this step it identifies (P0, P6):

- the selected complete method and project authority;
- the exact governed outcome and checkpoint;
- the affected causal relation set and the governing invariants;
- the selected computational relations and specialist frames;
- where testing evidence is required: the testing claims, exact subjects,
  frame topology, material combination populations, ordinary paths,
  oracles and forbidden-path exclusions (ASSURANCE §7 to §9);
- the Worker's authority and capability envelope, and, where mutation is
  authorised, the exact inherited operation grant, subject and write
  territory;
- the evidence and qualification obligations;
- exclusions, prohibited competing paths, stop conditions and re-entry
  conditions; and
- the exact bounded action already authorised.

If activation detects a known capability, authority, subject, basis or
topology mismatch, it returns `activation_refusal` directly to the
Executive, with the cause and core value REFERENCE_FRAME §5 gives it. No
Worker frame is active, no Worker evaluation occurs, and the
Executive does not manufacture a Worker result to represent the failed
activation (P5, P6).

### 3. Worker returns to Executive

Every coordinated Worker activation ends in one closed work result sent to
the Executive; direct work uses its declared result consumer (P5, P6):

```text
WorkerResult
  = candidate_ready(exact_subject, transition_evidence, residuals)
  | refused(reason, authority, evidence)
  | incomplete(residuals, evidence, stop_basis)
  | re_entry_requested(owner, material_relation, evidence)
```

The notation explains and mandates no schema. The material relation of
`re_entry_requested` names its cause, authority or basis, which is part of
the value. Each value maps to exactly one core value for "a candidate is
available" under
[ACTIVATION §3 Construction availability](ACTIVATION.md#construction-availability),
read as in §5 Work result; the mapping applies only after lawful
activation. The Worker does not send a candidate directly into an
implicitly active Reviewer. It stops after returning the result (P5,
P6).

### 4. Executive evaluates the work result

For `refused`, `incomplete` or `re_entry_requested`, the Executive verifies
the exact basis and applies the existing authority relation. It records the
applicable disposition, or reactivates work only where current authority
already permits that action. None of these variants is accepted progress
because work occurred (P6, P5).

Whatever the variant, an effect of uncertain completion, one the work
result names `completion_unknown` or names `not_effected` with its end not
established ([ACTIVATION §3 Effects](ACTIVATION.md#effects)), is
reconciled under
[ACTIVATION §5](ACTIVATION.md#5-work-state-and-restart), sufficiently for
the next dependent action, before work is reactivated, the effect is
repeated or any action that depends on it is taken (P5, P6).

For `candidate_ready`, the Executive verifies the exact subject and decides
whether independent assessment is required. It applies the boundaries at
which this method requires it,
[TICKETS UP-007](TICKETS.md#execution-and-verification-authority-separation-up-007);
the execution relation's assessment where required (ACTIVATION §1); method
qualification ([EVALUATION §7](EVALUATION.md#7-qualification-of-frames-and-of-the-method));
and the further boundaries the governing basis adds, as
[EVALUATION §3](EVALUATION.md#3-independent-assessment) permits: Product,
release, risk or the admitted work contract. What counts as independent is
EVALUATION §3's. Green aggregate status cannot satisfy this step when a
required user-acceptance, end-to-end, integration, unit or negative-path
result is missing, bound to another subject, or contradicted by a material
frame result (P6; ASSURANCE §10).

### 5A. Candidate does not require independent review

In the coordinated branch, when independent review is not required, the
Executive consumes the exact candidate, the Worker's self-review, the
transition evidence and any mandatory specialist results, and applies the
disposition within its decision envelope. Self-review stays Worker
evidence; the disposition does not relabel it as independent (P6).

### 5B. Candidate requires independent review

When independent review is required, the Executive activates the Reviewer
with (P6, P3):

- the exact candidate and governing basis;
- the exact claim, composition boundary, population, scope and exclusions;
- the applicable method and project authority;
- the required evidence and the ordinary assurance path;
- the required user-acceptance, end-to-end, integration, unit,
  combinatorial and negative-path frame results, with their exact claims and
  populations;
- the Product-selected severity scale and the exact affected Product claims;
- the Reviewer's capability and independence envelope; and
- invalidation and stop conditions.

Where EVALUATION §7 requires it, the candidate is frozen before material
reference exposure. Otherwise the subject is stabilised to the exactness
that EVALUATION §3, ACTIVATION §7 and the claim require (P3, P6).

### 6. Reviewer returns to Executive

The Reviewer returns one closed evaluation in the shape of EVALUATION §4,
which here contains (P6, P5):

- frame and activation identity;
- the exact subject, basis, claim, scope, exclusions and evaluated
  population;
- the Reviewer actor and the independence conditions;
- the evidence and the ordinary assurance path acquired;
- the core result (FOUNDATIONS §4 Results);
- findings, counterexamples and adjacent observations;
- for each finding, where supportable: the affected claim, severity, causal
  assessment and confidence, blast radius, workaround, repair complexity,
  regression risk and residual uncertainty; and
- invalidation conditions and, where applicable, the re-entry owner.

The finding-level triage payload projects over the result algebra as
EVALUATION §4 (Result and triage projection) states; in this profile the
assessor there is the Reviewer and the decision owner is the Executive. The
Reviewer returns to the Executive, not to the Worker, and returns no
disposition; a recommendation is evidence only (EVALUATION §4). It does not
edit the candidate, direct the repair or authorise continuation (P6).

### 7. Executive disposes and checkpoints

The Executive verifies that every consumed result is still bound to the
current subject and basis, revalidates the complete Product view and the
current MVP or release mandate, applies any declared result conjunction
(FOUNDATIONS §4 Conjunction of results), assigns priority, records the
effect on the current promotion boundary, and acts on exactly one
disposition within its grant: `accept`, `local_repair`, `re_enter` or
`reject` (ACTIVATION §3; P6, P5).

ACTIVATION §3 and §5 stay the owners of each disposition, the exact accepted
checkpoint and the next already-authorised bounded action. The disposition
is the acceptance result; neither `candidate_ready` nor a satisfied review
result is acceptance (FOUNDATIONS §4 Results). A repair creates
a new candidate, and an affected review is reactivated against it.
Acceptance does not widen the Product outcome or authorise an unselected
successor (P4b, EVALUATION §5).

When a finding blocks the current promotion boundary, and that severity
selects neither priority nor a block and priority waives no hard stop, is
[EVALUATION §5 When a finding blocks promotion](EVALUATION.md#when-a-finding-blocks-promotion),
read with the Executive as the decision owner; this profile restates none
of it. The Executive records its determination as the current-boundary
effect (§5 Technical triage, severity, priority and boundary effect). An
unsupported technical assessment returns through a new or refined
activation rather than being silently rewritten (P6, P1).

### Promotion constraint projection

(P6, P5)

The projection is the table of
[EVALUATION §5 When a finding blocks promotion](EVALUATION.md#when-a-finding-blocks-promotion),
with the Executive as its decision owner, for the consumed conditions it
names: a valid falsification of a mandatory claim governed by a
non-waivable hard stop; any other finding meeting one of that section's
four conditions, a finding below the Product-owned decision cutoff
included; a finding meeting none of them; and an observation outside the
exact evaluated claim. For the Executive, the governed outcome or decision
that section names is read under the current Product mandate, so the Executive
determines blocking from the exact affected claim, the current mandate,
the applicable hard stops and the Product-owned cutoff policy. This
profile adds one row, its application of the
`indeterminate` row of
[EVALUATION §4 Result and triage projection](EVALUATION.md#result-and-triage-projection)
and of the Executive's exclusions (§8):

| Consumed condition | Required Executive constraint |
|---|---|
| an unsupported or materially incomplete technical assessment | a capable evaluation is reactivated, or `indeterminate` is kept; Reviewer evidence is not rewritten |

## 13. Handoff projection

The coordinated branch uses the following bounded projections. They may be
fields in existing Goals, tickets, design assets, commentary, qualification
or release evidence, or other admitted carriers; the profile requires no new
artifact type (P2, P6).

| Projection | Producer to consumer | Minimum material content | Owning law |
|---|---|---|---|
| Worker activation | Executive to Worker | exact intake, basis, affected cone, inherited operation grant, mutation subject and write territory where applicable, frames, evidence, exclusions, stop and re-entry conditions | REFERENCE_FRAME §11; ACTIVATION §1 |
| activation refusal | the activation relation to Executive | attempted frame, subject and basis, actor, the cause (capability, authority or basis) with its failed predicate, evidence and reconfiguration pressure; no Worker result | REFERENCE_FRAME §5; ACTIVATION §3 Admission and activation |
| work result | Worker to Executive | result variant, exact subject if any, transition evidence, non-changes, each intended external effect with its ACTIVATION §3 Effects value (`completed`, `not_effected` or `completion_unknown`), residuals, stop basis | ACTIVATION §3, §5 and §7 |
| Reviewer activation | Executive to Reviewer | exact subject, claim, composition boundary, evidence population, Product-selected severity scale, authority, independence, invalidation | REFERENCE_FRAME §11; EVALUATION §3 and §7 |
| review result | Reviewer to Executive | exact verdict basis, evidence, findings, counterexamples, technical triage, residuals, invalidation; no priority and no disposition, a recommendation being evidence only | EVALUATION §3 and §4; ACTIVATION §3 |
| specialist activation | Executive or a declared parent relation to a capable evaluator | exact evaluation, subject and basis, bounded map of material relations, actor envelope, evidence, authority, dependencies, exclusions, result consumer, invalidation | REFERENCE_FRAME §11; the exact specialist owner |
| specialist result | evaluator to Executive, a declared conjunction or the exact parent relation | closed result, exact activation and basis, evidence and source routes, residuals, invalidation, no implicit continuation | ACTIVATION §7; the exact specialist owner |
| disposition and checkpoint | Executive to the existing work authority and any next activation | the exact consumed results and technical triage, current Product and MVP or release mandate, priority, promotion-boundary effect, decision grant, disposition, checkpoint, residuals, next already-authorised action | ACTIVATION §3 and §5; the Product-owned triage policy |

Flattening these projections across candidates, processes, episodes,
configurations, evidence populations or bases establishes no relation among
them; equality or translation is declared under REFERENCE_FRAME §6 where
needed (P3, P4a).

Direct engagement carries the same material intake and result coordinates
in its existing work carrier. Where that branch has no Executive
activation, it substitutes the actual granting or result authority for the
Executive; it does not silently activate a Reviewer or acquire new decision
authority (P6).

## 14. Coverage application

The three engagement frames do not claim to contain the complete Product or
project workspace. They organise finite evaluations over specialist frames
(P0, P2).

| Known evaluation | Primary engagement frame | Authority or specialist input |
|---|---|---|
| exact method, project and work basis | Executive | the complete method cut; current Goals, Product, requirements, design and work authority |
| affected causal cone and frame configuration | Executive, challenged by Worker and Reviewer | ACTIVATION §1 intake and execution unit with the design profile's bounded-frame conservation laws; domain, identity, dependency, implementation and history frames |
| generic family coverage and cross-frame seam conservation | Executive for configuration; Worker and Reviewer for their exact evaluations | material declarations or authoritative acquisition paths for the twelve families of §11; explicit non-material and residual dispositions |
| bounded realisation and self-review | Worker | accepted design; the design profile's capability-and-foundation selection where material; capability and reuse, implementation, environment and proof frames |
| candidate and transition evidence | Worker | ACTIVATION §7 and the exact identity and evidence relations |
| a user can obtain the Product-defined outcome through supported surfaces | Worker for execution and self-review; Reviewer where independent assurance is required | the user-acceptance frame (ASSURANCE §7); Product, requirement, UX, identity, installed-subject and acceptance inputs |
| the complete authoritative installed path realises the outcome | Worker for execution and self-review; Reviewer where independently assessed | the end-to-end frame (ASSURANCE §7); composition, authority, lifecycle, persistence, recovery, replay and negative-reachability inputs |
| material interfaces compose across their interaction population | Worker and Reviewer according to the claim | integration frames (ASSURANCE §7); actual participant, carrier, state, configuration, failure and recovery inputs |
| module-owned laws hold | Worker and Reviewer according to the claim | unit frames (ASSURANCE §7); the design's ontology and carrier inventory, public module contract, algebra, calculation, state-machine, invariant and module-bounded combination inputs |
| obsolete and rival Product paths are absent, unreachable or refused | Worker for deletion evidence; Reviewer for exact-subject challenge where required | the distinct production-closure and assurance/source-closure graphs (ASSURANCE §9); package, consumer, mutation, sabotage, reconstruction and history frames |
| independent exact-subject assessment and technical triage where required | Reviewer | EVALUATION §3 and §7; ACTIVATION §1; the Product-selected severity scale; live implementation and assurance frames |
| result conjunction, priority, promotion-boundary effect and disposition | Executive | the exact closed Worker, Reviewer and mandatory specialist results; current Product and MVP or release mandate; the Product-owned triage policy |
| checkpoint and continuation | Executive under existing authority | ACTIVATION §5; the current Goals, Product and release boundary |
| missing-frame and topology-change response | Executive, with pressure from any frame | REFERENCE_FRAME §8 and §10 |

The Executive derives the complete known evaluation inventory from the
selected method members, the project domain, the outcome, history,
dependencies and the workspace. Operational full coverage keeps every
unknown, uncovered, conditional, conflicted or authority-excluded residual
REFERENCE_FRAME §8 requires (P4b, P5).

Executive visibility is not coverage. Every material evaluation still needs
a capable frame, admissible evidence and identified semantic and decision
owners; every material construction, transformation, admission, publication
or mutation also needs its existing operation owner and exact grant (P6;
REFERENCE_FRAME §8, authority coverage).

## 15. Missing-frame and re-entry application

Any active frame may return `out_of_frame`, `indeterminate` or
`invalid_basis` (FOUNDATIONS §4 Results). The closed result names the missing
relation, coordinate, evidence, authority, capability or interaction that
can change the evaluation (P5).

The Executive applies the eight questions of
[REFERENCE_FRAME §10 Diagnostic order](REFERENCE_FRAME.md#diagnostic-order)
in that order, all of them. This profile adds two readings and no question
(P2, P6):

| Question of REFERENCE_FRAME §10 | Reading in this profile |
|---|---|
| 1. correct declared frame activated | as stated there |
| 2. subject and basis exact | as stated there |
| 3. actor inside the capability envelope | covers independence as well as capability, because this configuration activates the Reviewer for an independence the claim requires (§10, §17) |
| 4. admissible evidence available | as stated there |
| 5. material variable or invariant missing from the frame | asked only after the Executive has verified that the required specialist-frame inputs were supplied (§11, §14) |
| 6. required conjunction or translation missing | as stated there |
| 7. evaluation family wrong or incomplete | as stated there |
| 8. another frame required | only when questions 1 to 7 do not close the gap, a frame is added or revised |

If the discovery changes Product, a requirement, identity, lifecycle,
authority, a public contract or the accepted design, the disposition is
`re_enter` to that existing owner (ACTIVATION §3). The Executive does not
repair an upstream authority gap by making its frame larger (P6).

## 16. Adoption or project-defined configuration

### Existing authority selects the configuration

Two relations stay apart here. Adopting this profile for a Product is
the Product authority's act, recorded in its Project Reference-Frame Basis:
inclusion in a method cut makes the profile available, and only Product
authority adopts it
([PRODUCT_DEFINITION §7](PRODUCT_DEFINITION.md#7-collective-reference-frame-basis)).
Admitting a frame configuration, this profile's executive configuration or
another, for the decisions it makes follows the rule of
[ACTIVATION §1 Configuration](ACTIVATION.md#configuration), Admission of a
configuration: the smallest existing authority that owns each material
decision admits it, and admission creates no new authority over it. That
rule leaves to the profile which authority owns which decision; this
section is that binding for the executive configuration (P6, P2):

- Goals or admitted work authority own bounded work selection;
- Product owns Product-wide capability or acceptance meaning;
- requirements own constitutional behaviour;
- accepted design owns realisation structure and specialist design frames;
- identity and release owners keep their declared decisions; and
- an explicitly bounded proxy acts only inside its existing grant
  ([FOUNDATIONS §2 Authority kinds](FOUNDATIONS.md#authority-kinds), Proxy
  limit).

The Product-owned Project Reference-Frame Basis (PRODUCT_DEFINITION §7)
cites every material source of the configuration and does not collapse
them into a new local-axiom authority (P6).

### Adopt this baseline

A baseline-adoption projection records inside that Product-owned basis
(P6, P3):

- the exact selected complete method, REFERENCE_FRAME and profile
  identities;
- the existing authority admitting adoption;
- the governed workspace, Product scope, outcome, basis and time;
- local Executive, Worker and Reviewer capability envelopes and
  actor-binding rules;
- generic family declarations or authoritative acquisition paths, with an
  authority-bound non-material or explicit residual disposition for each of
  the twelve families of §11;
- specialist-frame declarations or authoritative acquisition paths;
- where testing evidence is material: testing-frame declarations, exact
  Product and module claims, ordinary-path identities, combinatorial
  populations, the scenario matrix, oracles and the forbidden-path
  inventory (ASSURANCE §7 to §9);
- local subject, evidence, checkpoint and review-result coordinates;
- the coverage ledger and the accepted residual boundary; and
- invalidation and frame-set revision conditions.

### Define a project configuration

A project may define different frames, names, overlaps, sequences and actor
bindings. The defining Product, requirement, Goals or accepted-design
authority records (P6, P2;
REFERENCE_FRAME §4):

- the exact method and project basis;
- the known evaluation inventory;
- each frame declaration and capability envelope;
- semantic, evaluation, operation where material, and decision authority;
- intentional overlap, separately activated evaluations and required
  assurance independence;
- the conjunction, translation and composition actually used;
- the explanation of the allocation, with its material resource limits and
  failure assumptions, that ACTIVATION §1 Configuration requires of every
  configuration;
- the mapping to the applicable construction, assessment, disposition,
  identity and release obligations;
- coverage and residual uncertainty; and
- re-entry, invalidation and revision conditions.

A project configuration need not keep the labels Executive, Worker and
Reviewer or map one local frame to each. It keeps every applicable method
relation and identifies how its evaluations cover the claims it makes. It
is evaluated against its task, its dependencies, its actors' limits, the
authority it applies and the required assurance, as ACTIVATION §1
Configuration states, never by its labels, its topology or its difference
from this profile. A local axioms document may carry the accepted
configuration; its authority is the cited Goals, Product, requirement or
accepted-design decision, not the document's category (P6, P1).

### Extension versus replacement

Adding domain or specialist frames, additional separately activated or
assurance-independent coverage, or local evidence coordinates extends this
profile. Changing the material Executive, Worker, Reviewer, handoff,
independence or disposition configuration creates a project-defined
profile (P6).

Neither choice amends the method's execution law. A project that
intentionally departs from that law records a separate method basis or a
non-conformance; it does not describe the departure as local frame
selection (P6, EVALUATION §6).

## 17. Actor binding and independence

Frames and actors are separate identities: activation binds an actor to
a frame ([ACTIVATION §1 Configuration](ACTIVATION.md#configuration)). In
this configuration, as
[ACTIVATION §1 Roles and delegation](ACTIVATION.md#roles-and-delegation)
permits for any configuration, one actor may occupy several frames across
different activations where authority and any claimed independence are
preserved. Humans, agents, deterministic tools or mixed configurations may
occupy them. The profile prescribes no actor count (P3, P6, RF-016).

Where independent review is required, the activation records the exact
subject and verdict carrier, which
[TICKETS UP-007](TICKETS.md#execution-and-verification-authority-separation-up-007)
requires for a traceable verdict, and
[EVALUATION §3](EVALUATION.md#3-independent-assessment) decides what
counts as independent: the Reviewer is not the author of that subject,
and a fresh context of the author is still the author. For generic method
qualification,
EVALUATION §7 adds its declared capability, configuration, comparison
basis, reference-exposure and freeze conditions (P6).

An Executive may inspect a subject to adjudicate a result. That inspection
does not become an additional independent Reviewer result because the actor
used reviewer-like tools (P6, P1).

## 18. Profile qualification

Qualification of this profile applies frame qualification and method
self-qualification (EVALUATION §7); it creates no other qualification
protocol (P6).

A profile trial evaluates this profile and its declared composition with
the exact REFERENCE_FRAME basis without reproducing either as a peer
authority. A valid pure-method trial does not prove this profile, and a
valid profile trial does not prove the method's complete function
population (P6, P4a).

Mechanical document checks may protect exact table shape, result
cardinality, source-digest congruence and named refusal boundaries. They do
not establish semantic truth and do not replace a capable source-linked
Reviewer evaluation. Profile qualification binds both kinds of evidence
without claiming one as the other (P6, P1; EVALUATION §2).

A representative profile trial establishes at least that (P6, P5):

1. existing project authority selects and projects the frame
   configuration;
2. a known incapable or unauthorised actor produces an activation refusal
   and no Worker result;
3. a fresh capable Worker reconstructs its intake without hidden
   conversation history;
4. every effectful Worker activation carries its exact inherited operation
   grant, subject and write territory; an in-territory mutation succeeds
   only under that grant and an out-of-territory mutation refuses, without
   granting operation authority to another frame;
5. every work-result value is selected by its cause, maps to exactly one
   core value as ACTIVATION §3 states, and returns to its declared
   consumer, the Executive in the coordinated branch;
6. a sufficient direct local case starts and finishes as Writer in its
   existing carrier without Executive appointment or independent review,
   and a coordinated `candidate_ready` also reaches disposition without a
   Reviewer activation when independent review is not required;
7. a review-required `candidate_ready` causes the Executive, not the Worker,
   to activate the Reviewer;
8. the Reviewer reacquires the exact subject and the live production and
   assurance surfaces material to its claim;
9. a changed candidate or basis preserves the historical review result
   while withdrawing affected reliance until applicability is established
   under [ACTIVATION §7](ACTIVATION.md#7-closed-result-and-reuse);
10. Worker self-review, Reviewer evaluation, Executive decision authority
    and the disposition stay distinguishable;
11. missing-frame pressure triggers bounded diagnosis or lawful re-entry;
12. a supported-surface user scenario binds one exact user, one deployed,
    installed or otherwise runnable Product form, its configuration, the
    ordinary path and the Product outcome, without hidden capability or a
    test-only entry;
13. the corresponding end-to-end frame observes the authoritative runnable
    causal path and falsifies an equal output obtained through a forbidden
    path;
14. integration trials vary the material participant interaction
    dimensions and keep omitted higher-order combinations as residuals;
15. every coded module has a module-derived unit lane, and unit trials use
    evidence size and strategy proportional to the internal combinatorial
    complexity of the module-owned law while staying unable to establish an
    integration, runnable-Product, user or Product claim;
16. disabling the selected path or forcing a rival path produces the
    declared failure or refusal without undetectably mutating the assurance
    subject;
17. aggregate green status cannot hide a missing, conflicted, stale-subject
    or wrong-path testing-frame result;
18. owner-issued runtime truth is acquired through the exact owner surface
    and evaluated with a separately derived oracle, while generic assurance
    mechanics stay authority-neutral;
19. a counterexample returns a causally minimal supported frontier
    represented as one unique locus, a jointly established incomparable
    set, unresolved alternative frontiers, or `indeterminate`;
20. a project-defined configuration can replace the profile without
    changing the selected method law or inventing another authority layer;
21. every generic family is instantiated where material, evidenced as
    non-material by capable authority, or kept as an explicit residual,
    never omitted because an artifact or component is absent;
22. a representative multi-frame claim refuses, or returns
    non-satisfaction, when an identity, coordinate, value or evidence,
    lifecycle, authority or provenance seam is missing, stale, foreign or
    non-commuting;
23. the generic set can be instantiated without importing a
    consumer-specific architecture, runtime object or renamed local
    topology into the baseline;
24. the Reviewer returns evidence-bound severity and technical implications
    while staying unable to assign priority, block promotion, direct repair
    or activate another frame;
25. the Executive consumes the exact technical triage with the complete
    Product view and the current MVP or release mandate, keeps severity,
    priority, frame result and promotion-boundary effect distinct, and
    selects only an authorised disposition and action; and
26. a finding outside the exact claim boundary stays repricing input rather
    than creating a release block or another review round by its severity
    label.

The claim is limited to the frame revisions, actor envelopes, result
branches and evidence populations actually evaluated (P6; EVALUATION §1).

## 19. Baseline-specific basis and activation additions

### Project-basis additions

The items of the template below add to the adoption record that
[§16 Adopt this baseline](#adopt-this-baseline) owns; an adopting Product
records both lists as one record, and where an item appears in both, the
§16 statement decides it, so the two lists are one record and not rivals.

An adopting Product starts from the Project Reference-Frame Basis of
PRODUCT_DEFINITION §7 and its starter template. This profile adds only the
following profile-specific content; it is not a competing basis definition
or adoption authority (P6, P2):

```markdown
# Executive Baseline Adoption Additions

- exact Executive baseline profile identity:
- Executive, Worker and Reviewer declaration or acquisition references:
- role-specific actor capability, authority and independence bindings:
- Product-selected severity and priority scales, current-boundary cutoff,
  non-waivable hard stops, and the Reviewer-to-Executive triage relation:
- work-result to core-result mapping: ACTIVATION §3 construction
  availability, recorded by reference, with each project refinement of a
  work-result value mapped to its parent value's core value (ACTIVATION §3):
- the twelve generic family declarations, non-material evidence or
  explicit residuals:
- Product-testing claims, frame topology, material combination
  populations, scenario matrix, oracles, and required and forbidden
  authoritative paths:
- profile-specific activation refusal, closed-result, conjunction and
  return relations:
- profile-specific qualification evidence and residuals:
```

### Activation additions

Every activation first carries the generic binding of REFERENCE_FRAME §11
(minimal activation binding). This profile adds, by frame (P0, P6):

| Frame | Added to the generic binding |
|---|---|
| Worker | the binding is also the sufficient execution intake of ACTIVATION §1, and adds the exact inherited operation grant, mutation subject and write territory where applicable |
| Reviewer | the exact claim, composition boundary, evaluated population, oracle, ordinary or module path, falsification condition, the independence and assurance basis (EVALUATION §3 and §7), the Product-selected severity scale and the required technical-triage capability |
| Executive | the current Product-role map, the MVP or release mandate, the evaluation frontier, the closed-result and technical-triage ledger, the priority and boundary policy, the conjunction rule and the exact disposition grant |

## 20. Failure classification

The table routes evaluation; it does not predetermine a verdict (P5, P2; REFERENCE_FRAME §10).

| Observation | First diagnosis |
|---|---|
| implementation produces a coherent capability that is not the selected Product | Product-frame falsification; diagnosis under [ACTIVATION §1 Feedback and diagnosis](ACTIVATION.md#construction-relation) locates the cause, a deviating realisation or a requirement, design or Product definition that does not carry the selected Product, and re-entry follows that cause |
| a Development Product's structure becomes the authored Product's meaning | Product-role or composition-basis drift |
| an authorised mutable Source Project is treated as one immutable review subject throughout construction | collapse of the Source Project and candidate-checkpoint lifecycles |
| one actor receives every specialist concern as one global context and repeatedly misses known violations | attention-surface or capability mismatch; refine and independently activate frames |
| every local frame is green but an affected Product edge is unevaluated | missing Product Composition activation |
| a child result directly starts repair, review, publication or continuation | return-topology and decision-authority violation |
| a compression, summary, generated map or prior result replaces current source authority | invalid basis or evidence substitution; the current workspace and its authoritative inputs govern, and a retained account never overrules current evidence ([ACTIVATION §5](ACTIVATION.md#the-workspace-and-an-actors-account)) |
| the Worker cannot see a material violation visible from another evaluation | missing or misactivated specialist frame, capability mismatch, or oversized frame |
| the Reviewer asks assurance code to recreate Product or implementation meaning | Reviewer authority bleed, or a missing capability or reuse frame |
| a harness derives current owner state from raw events or payloads although an installed owner projection exists | rival semantic interpreter and invalid assurance subject |
| a downstream symptom is assigned to one upstream owner without causal-frontier evidence | unsupported counterexample localisation; determine whether the evidence supports one locus, a joint incomparable set, alternative frontiers or `indeterminate` (ASSURANCE §12) |
| passing tests mask malformed fixtures or a false proof relation | test semantics omitted from the Reviewer's manifold |
| hundreds of green unit tests coexist with a failed Product outcome | unit evidence flattened into an unevaluated user-acceptance, end-to-end or composition claim |
| the expected output is reached through an obsolete or bypass path | end-to-end path-conformance falsification despite equal output |
| a UAT scenario uses private APIs, injected state, hidden administrator capability or a test-only endpoint | invalid user-frame subject or unsupported ordinary path |
| one sunny end-to-end path is reported as combinatorial coverage | undeclared interaction population and residual higher-order combinations |
| pairwise coverage is used for authority, persistence, recovery, migration or historical multi-boundary failures without justification | insufficient interaction strength or invalid coverage basis |
| successor tests pass while obsolete exports, consumers, fallbacks or proof scripts remain | technical-debt deletion and forbidden-path exclusion unproved |
| a negative-path test overwrites the frozen install it is meant to qualify | assurance-subject invalidation and missing mutation isolation |
| review evaluates a moving tree or a rebuilt artifact | invalid exact-subject basis (EVALUATION §3 and §7) |
| several episodes or stores are flattened into one apparent path | missing coordinate translation or interaction binding |
| the Worker starts the next stage after self-review | violation of decision and continuation authority (ACTIVATION §1 and §5) |
| the Reviewer implements the fix while keeping its verdict | violation of independence and frame authority (EVALUATION §3) |
| the Reviewer assigns priority, blocks promotion, directs repair or activates another frame | Reviewer-to-Executive decision-authority bleed |
| the Executive treats severity, priority, frame verdict and release blocking as one value | triage-relation collapse; reapply the Product-owned policy to the exact claim and mandate |
| the Executive rewrites semantics to close a local problem | decision outside the proxy grant; re-entry required (ACTIVATION §3, EVALUATION §5) |
| repeated local repair creates another authority path | incomplete affected cone, or a missing owner or capability frame |
| long effort resets after local success | coverage, frame altitude, topology, evidence or capability diagnosis required |

## 21. Anti-patterns

The profile is misapplied when (P6, P2):

1. Executive, Worker or Reviewer is treated as a persona without a declared
   evaluation and authority relation;
2. the frames are treated as an organisational hierarchy;
3. the Executive is made a universal context, semantic interpreter or
   implementation controller;
4. the Worker sends a candidate directly into an implied Reviewer
   activation;
5. an activation refusal is relabelled as a Worker result, or a work-result
   variant is selected without its required core result;
6. refused, incomplete or re-entry work results have no route to the
   Executive;
7. the Worker accepts its own result, infers continuation, or treats its
   role label or broad workspace access as mutation authority;
8. the Reviewer relies on the Worker's narrative instead of acquiring the
   material live subject;
9. the Reviewer trusts tests without reviewing their semantics where they
   can change the proof;
10. the Reviewer authors adopted repair content or directs a particular
    repair while keeping independent-review status for that contribution;
    reporting a defect or already-required behaviour is distinguished from
    repair authorship by [EVALUATION §3](EVALUATION.md#3-independent-assessment);
11. a changed candidate or basis inherits reliance on a prior verdict
    without the applicability relation required by
    [ACTIVATION §7](ACTIVATION.md#7-closed-result-and-reuse);
12. results from different coordinates are flattened into one relation;
13. a local axioms file is treated as authority without an owning Goals,
    Product, requirement or design decision;
14. this profile restates the execution relation (ACTIVATION §1 and §3),
    independent assessment (EVALUATION §3) or the assurance-boundary law
    (EVALUATION §1 and §7) as peer constitutional law;
15. a project-defined configuration silently changes selected method law;
16. consumer-specific realisation machinery, or a renamed architectural
    equivalent, is presented as a universal requirement;
17. test labels or runner choice stand in for declaring the exact testing
    frame, subject, claim, population, oracle, path and falsification
    condition;
18. unit-test, assertion, snapshot, line, branch or function count is used
    as a Product-confidence or closure measure;
19. implementation-shaped unit tests are treated as independent design,
    architecture, integration, installed or user-outcome assurance;
20. interface, persistence, orchestration, authority, configuration or user
    complexity is mocked away and then counted as unit coverage;
21. helper-level tests become the canonical proof surface for a
    module-owned algebra or for a broader Product composition;
22. an expected output is accepted without proving the required
    authoritative path, or while a material rival path stays reachable;
23. one sunny end-to-end path stands in for a declared combinatorial
    population, an interaction-strength justification, failure coverage and
    a residual set;
24. UAT gains capabilities, information, setup paths or interfaces
    unavailable to the declared user;
25. a harness, fixture, proof script or expected-value builder
    reconstructs owner-issued runtime meaning and treats the reconstruction
    as the assurance subject;
26. a downstream symptom is assigned to one owner when the evidence
    establishes a joint causal frontier, unresolved alternatives or no
    bounded frontier, or localisation is used to authorise a wider repair;
27. a mutation, sabotage, fixture or proof capture changes the exact
    assurance subject without isolation, restoration and revalidation;
28. aggregate green status hides a missing or conflicting user-acceptance,
    end-to-end, integration, unit or negative-path result;
29. a generic family is treated as a required component, actor, service,
    file, runtime type, stage or new semantic owner;
30. a material generic family is omitted because no artifact shares its
    name, or several families are flattened into one broad frame without
    preserving their distinct evaluation and result relations;
31. the Reviewer assigns priority, decides promotion blocking, directs
    repair or starts another activation; or
32. the Executive collapses severity, priority, frame result,
    promotion-boundary effect and disposition into one status value.

## 22. Closure

Only the obligations applicable to the exact selected outcome and
engagement branch are evaluated. A listed frame or an available testing
family does not make its claim applicable (ACTIVATION §1, Applicability).
The closure condition is
[TICKETS §7 Condition-based closure and reuse](TICKETS.md#condition-based-closure-and-reuse),
which this profile applies to the selected branch and does not restate: a
work item closes by that condition, not by a reviewer's approval
([EVALUATION §5](EVALUATION.md#5-acceptance)). Applied here, a closed
`indeterminate` result or a review event does not satisfy an unresolved
obligation, because `indeterminate` never maps to `satisfied`
([FOUNDATIONS §4 Results](FOUNDATIONS.md#results)) and a review's
occurrence is not the closing event (P5, P6).

A project has applied this baseline to one outcome when (P6, P2):

1. existing project authority admits and projects the exact frame basis;
2. the complete selected method, REFERENCE_FRAME included, stays the
   governing source;
3. Executive, Worker and Reviewer are available finite evaluation frames,
   activated only where applicable, not a hierarchy or actor identities;
4. activation refusal stays distinct from Worker results, and every Worker
   result is one work-result value selected by its cause, maps to exactly
   one core value as ACTIVATION §3 states, and returns to its declared
   consumer, first to the Executive in the coordinated branch;
5. existing work authority decides whether an exact candidate requires
   independent review; the coordinated Executive activates the Reviewer
   where required, and the sufficient direct branch adds no such
   activation;
6. required Reviewer assessment binds the exact subject, evidence
   population, verdict, evidence-bound technical triage and independence
   conditions;
7. an activated Executive consumes closed results and technical triage
   against the complete Product view and the current MVP or release
   mandate, keeps severity, priority, frame result and boundary effect
   distinct, and applies only the existing disposition and continuation
   relation;
8. specialist frames and result relations cover every known material
   evaluation and interaction or keep an explicit residual;
9. frame, basis, capability, evidence and topology change can invalidate
   and rechart the configuration;
10. every material operation carries its existing owner's exact grant;
11. no new execution authority, local constitutional layer, actor topology,
    runtime or universal completeness claim is inferred from the profile;
12. every material Product testing claim is assigned to an exact
    user-acceptance, end-to-end, integration, unit or explicitly declared
    alternative frame rather than inferred from a suite label;
13. a user-outcome claim binds the declared user capability, the exact
    Product subject, the supported ordinary surface, the environment and
    the observable outcome;
14. an end-to-end claim binds the exact deployed, installed or otherwise
    runnable Product form and records the required authoritative causal
    path, rather than accepting equal output through an unknown or
    forbidden path;
15. material interface and Product factors have a declared combinatorial
    population, adequate interaction strength, an exercised scenario matrix
    and explicit residual combinations;
16. unit evidence proves module-owned laws, public module contracts
    included, with volume and strategy proportional to useful
    discrimination of the module-bounded population rather than to
    implementation size;
17. required paths have positive runnable-Product witnesses; the
    production closure excludes obsolete, rival, fallback and bypass paths;
    the assurance/source closure cannot falsely supply evidence or
    reintroduce a removed production path; and declared isolated test-only
    seams stay outside ordinary-path claims;
18. source or code coverage, test count and aggregate green status do not
    stand in for Product, installed, path, composition or user-frame proof;
19. test fixtures, mutations, sabotage, proof capture and assurance tooling
    preserve or revalidate the exact subject they claim to evaluate;
20. owner-issued Product and runtime truth is acquired through the exact
    owner surface and evaluated by a separately derived oracle, without a
    rival assurance-owned semantic interpreter;
21. counterexamples return a causally minimal supported frontier
    represented as one unique locus, a jointly established incomparable
    set, unresolved alternative frontiers, or `indeterminate`;
22. every one of the twelve families material to the outcome has an exact
    declaration or acquisition path, and every non-material or uncovered
    family has an authority-bound disposition;
23. every material cross-frame seam preserves or lawfully translates
    identity, coordinate and basis, carried value or evidence, lifecycle
    scope, authority and provenance; and
24. no consumer-specific architecture, renamed local topology, runtime
    object or component roster is inferred from the generic set.

A project-defined frame configuration closes against REFERENCE_FRAME, the
selected complete method cut and its cited existing project authorities. It
need not claim conformance to this optional profile (P6).
