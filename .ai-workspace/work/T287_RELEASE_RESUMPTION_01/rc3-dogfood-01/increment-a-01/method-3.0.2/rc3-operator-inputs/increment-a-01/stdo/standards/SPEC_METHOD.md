# SPEC_METHOD

Tier 2. Owns the particular method: the position and identity of the
method, the constitutional chain and its surfaces, the manifesto and the
litmus tests, requirement and design law, trace closure, live-surface law,
outcome conservation, change management with intake triage and computed
classification, the consistency gate, the sprint boundary, ambiguity
governance, lifecycle sufficiency, lineage and the release version boundary,
migration law, the method's procedures, the design-record conventions and
the general law of build-tenant binding (§11). Its two families of rules
are laid out from premises to law at §2 and §4.
It is realised from [FOUNDATIONS](FOUNDATIONS.md),
[REFERENCE_FRAME](REFERENCE_FRAME.md), [ACTIVATION](ACTIVATION.md) and
[EVALUATION](EVALUATION.md): nothing here is foundational, every clause
names the principle that requires it (P0 to P6, FOUNDATIONS §3), and each
mechanism could be realised differently under the same principles. The
tier's other members carry what this one points to:
[PRODUCT_DEFINITION](PRODUCT_DEFINITION.md) (how one project binds to the
method), [ASSURANCE](ASSURANCE.md) (testing law),
[TICKETS](TICKETS.md) (work carriers) and [RELEASE](RELEASE.md) (release
mechanics).

## 1. Position and identity

### Position

Spec-driven development treats specification as constitutional source, not
as commentary on code after the fact. Its point is to make software
re-derivable, auditable and correctable under explicit authority. Its
overriding bias is declarative rather than imperative: the system should
primarily declare truths, structures, interfaces, constraints and evidence
surfaces, and let lawful processing derive and realise work from that
declared surface.
Imperative procedure still exists and is subordinate to declared authority
(P6, P1).

Constitutional examples use neutral capability and authority identities:
they demonstrate enabled capabilities rather than cite a consumer as
precedent, whose particulars cannot become method law
([PROFILES §1](PROFILES.md#1-the-boundary)) (P1, P6).

### Process constitution

This method is the process constitution for building projects by
spec-driven development, not a local operating note for one implementation.
Its role is meta-constitutional: it defines how goals, intent, product,
requirements, design, code, evidence and repricing relate; what counts as
specification sufficiency; what kinds of requirement truth exist; and how
authority flows during iterative delivery. If a project's implementation
disappears, the method should still be sufficient to bootstrap a new
spec-driven project process from scratch; the method plus the surviving domain specification
can reconstruct the project (P2, P0).

The boundary between surfaces is this: this member defines the process
constitution; a goals surface, conventionally `GOALS.md`, names the current
overriding concerns for the active body of work; an intent surface,
conventionally `INTENT.md`, names domain direction; a product-definition
surface, conventionally `PRODUCT.md`, names the current product definition
of the mutable source project; a requirement surface, conventionally
`specification/requirements/`, is the live requirement surface derived from
the product definition; a shared design surface plus any tenant-local design
surfaces choose the concrete mechanism. The product's definition binds the
actual authority locations
([PRODUCT_DEFINITION §1](PRODUCT_DEFINITION.md#1-overlay-and-layout-independence)); the conventional names
require no existing project to move or duplicate its files, and the
definition's tenant registry entries locate the project-owned realisations
beneath one shared specification
([PRODUCT_DEFINITION §8](PRODUCT_DEFINITION.md#8-what-how-and-work-carriers)).

The authoritative split is strict: the surfaces bound as WHAT define WHAT;
design and realisation surfaces define HOW; no build tenant, design, code,
definition overlay or derived surface becomes co-equal constitutional
authority with the bound WHAT (P6).

In the default scaffold `requirements/` is a folder under `specification/`.
Requirements may instead be stored at any location the product definition
binds, as individual files or grouped into requirement families. The default
shape exists to avoid collapsing the constitutional surface into one
monolithic requirements document, not to make folder placement
constitutional. This is one expression of the declarative bias: declaring
requirement structure and family boundaries is preferred over maintaining
one imperative catch-all document (P2).

### Method identity

This member owns the method-identity bounded context
`urn:stdo:bounded-context:method-identity` under the selected complete
basis (P3). Within that context STDO is the
shorthand for the method's four named areas. A named area is the body of
the method's law that one letter of STDO names and one member owns: S,
Specification, owned by this member; T, Ticketing, owned by
[TICKETS](TICKETS.md); D, Design, owned by the design profile member
[DESIGN_MODULE](DESIGN_MODULE.md); and O, Outcome-Driven Development, the
complete area whose identity and realisation meaning are owned by its
profile member [ODD](ODD.md). The expansion does not make the four owning
members independently selectable and does not reduce the released product
to four members: consumer authority remains one complete immutable released
cut with its exact member inventory ([RELEASE](RELEASE.md)).

### Canonical statement

The method in one statement, each clause owned by a section of this corpus
. Specification is constitutional source, not
commentary on code. The method defines the process constitution; intent,
product definition and requirements define the project constitution (§1).
Specification defines WHAT; design and realisation define HOW (§2). Every
product under this method publishes a layout-neutral definition that locates
its governing constitution, local constitutional decisions, collective
reference-frame bases, WHAT, independent build-tenant HOW realisations, work
surfaces and explicit product composition; the definition is a routing
overlay, not a rival truth surface
([PRODUCT_DEFINITION §1](PRODUCT_DEFINITION.md#1-overlay-and-layout-independence)). A material term
resolves only under its bounded-context identity, owning authority, selected
basis and governed scope; equal spelling creates no cross-context meaning or
authority; explicit imports, translations, equivalences and disambiguations
govern those seams, and zero or multiple applicable meanings fail closed
([PRODUCT_DEFINITION §5](PRODUCT_DEFINITION.md#5-bounded-context-semantic-resolution)). Requirements define the full constitutional what:
capabilities, guarantees, governance and verification obligations; design
defines the structural how, and ADRs are one durable form of that record
(§2, §10). The lifecycle is a governed disambiguation pipeline: each major
boundary reduces the space of lawful interpretations and surfaces major
ambiguity explicitly; detection is mandatory; blocking or escalation is
policy under declared risk appetite, except for hard-stop prerequisite
failures (§5; ACTIVATION §4). Products, applications, modules, functions,
build tenants and runtime surfaces are implementations of the constitutional
documents, not substitutes for them. Scenarios verify operational meaning
where capability claims need end-to-end proof ([ASSURANCE §4](ASSURANCE.md#4-scenario-bundle)). Code realises
decisions. Design is derivable from requirements, which are derivable from
goals, intent and product definition; code is derivable from requirements
and design (§2). Iteration is cumulative repricing, not waterfall. Events,
projection and delta reveal drift. Every live requirement family has design
ownership, explicit classification and downstream closure or explicit
deferment; every design record grounds itself in requirements; shipping
behaviour traces back to constitutional authority (§2). Live constitutional
surfaces are versioned history that change by supersession or withdrawal,
never by silent in-place mutation (§2). New intent emerges from real use
cases hitting the current model through explicit gap analysis, not from ad
hoc pressure (§2). Sprints are execution-control batches for pricing proof
cost and forcing close review; they are not authority layers and cannot hide
drift (§4).

## 2. The chain

### Foundation to law: chain, outcome and build-tenant binding

This family (F10 in the index of
[FOUNDATIONS §3 Foundation to law](FOUNDATIONS.md#foundation-to-law))
decides how a product's specification governs its realisations. Its
instance premises, which the commitments do not supply, are named in the
rows as follows: owned layers, a product has a selected outcome and an
owning authority for each layer of its specification; layered surfaces,
its specification is written as layered surfaces that actors interpret;
several realisations, one specification may have several realisations,
which change over time; immutable releases, a release is an immutable
identity. Standing of the commitments cited (FOUNDATIONS §3): P0
recovered; P1, P2, P3, P4a and P6 independent; P4b derived from P0 and
P2, with P0's premise that step-produced facts are not re-acquirable; P5
derived from P0 and P6, with P0's open-world premise.

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|
| P6 independent; P1 independent; instance: owned layers, several realisations | By P6 authority exists only where it is declared and admitted, and by P1 a realisation's form carries no meaning of its own, so the declared specification governs: a build tenant, a design, code, a definition overlay or a derived view realises, locates or projects it and never becomes co-equal authority. | [Process constitution](#process-constitution); [Manifesto](#manifesto); [Constitutional chain](#constitutional-chain) | the declarative bias and the neutral constitutional examples of [Position](#position): policy choices of this member | 1, 9 |
| P2 independent; P6 independent; instance: owned layers, layered surfaces | By P2 every obligation serves the selected outcome, so each live requirement has an owning design decision and downstream closure or explicit deferment. By P6 behaviour has authority only through what authorises it, so it traces back to the requirement and design that authorise it, and a break in that trace is drift. | [Trace closure and anti-drift](#trace-closure-and-anti-drift); [Spec-drivenness litmus](#spec-drivenness-litmus) items 6 to 8; [Requirement categories and classification](#requirement-categories-and-classification), the status axis; [§10](#10-design-records), `Implements:` | the four categories, the four statuses, the legacy classifications and the `Status` and `Category` fields; the ADR fields, ADRs per decision boundary, their storage defaults, their append-only lifecycle and the move of a narrowed shared ADR: domain choices of this member (§2, §10) | 1, 4, 9 |
| P1 independent; P2 independent; instance: layered surfaces, several realisations | By P2 a layer exists so that the next can be derived from it, so a layer is sufficient when a competent actor can derive a conformant next layer from it, and a failure to derive is a defect of the upper layer. By P1 one meaning admits several representations, so several conformant realisations may satisfy one layer; the generic law is [EVALUATION §6](EVALUATION.md#6-conformance-of-realisations), Layered sufficiency. A realisation choice that no upper layer constrains belongs to design. | [Reconstruction litmus](#reconstruction-litmus); [Spec-drivenness litmus](#spec-drivenness-litmus) items 1 to 5; [Specification surface rule](#specification-surface-rule); [Design rule](#design-rule); [Requirement categories and classification](#requirement-categories-and-classification), the category axis | the layers of the chain and their order, and the conventional surface names: domain choices of this member ([Constitutional chain](#constitutional-chain), [Process constitution](#process-constitution)); where each surface lives: the product definition ([PRODUCT_DEFINITION §1](PRODUCT_DEFINITION.md#1-overlay-and-layout-independence)) | 1, 4, 6 |
| P3 independent; instance: layered surfaces, immutable releases | By P3 a result binds the exact surface it read, so a live constitutional surface that changed in place would silently change what earlier results bound; it therefore changes by supersession or withdrawal, never in place, and is versioned history. For the same reason a version label binds an identity: an explicit one is reserved for an immutable release fact, a selector binding, or clearly historical or superseded material, never recency, and current truth is stated in the present tense. | [Live surface immutability](#live-surface-immutability); [Specification surface rule](#specification-surface-rule); [§6](#6-lineage-and-release), the release version boundary; [Spec-drivenness litmus](#spec-drivenness-litmus) item 9 | the exact tag `v<version>-rc.<n>` and the selector tag `v<version>`: a domain choice of this member, with release mechanics at [RELEASE](RELEASE.md#2-release-identities) | 1, 9 |
| P2 independent; P5 derived; instance: layered surfaces | By P2 the specification serves an outcome that use keeps testing, so use exposes conditions the current specification cannot express. By P5 an unexpressed condition is an open gap, not a satisfied one, so a constitutional gap reprices the surface that cannot express it, or is carried as recorded, governed debt, and an unanswered lifecycle phase is a recorded gap, never a silent absence. | [Renewal path](#renewal-path); [Operational lifecycle sufficiency](#operational-lifecycle-sufficiency); [Spec-drivenness litmus](#spec-drivenness-litmus) items 11 and 13 | the phases of the operational lifecycle and the `Gap:` and `Unanswered:` markers: domain choices of this member | 1, 5 |
| P2 independent; P6 independent; instance: owned layers | By P2 progress is movement toward one selected outcome, so product progress is judged against it. By P6 evidence evaluates and does not decide, so it never selects, enlarges or replaces the outcome, and growth authority comes from an admitted basis and ends with it. A regression or unresolved gap falsifies the claim of the path it affects, so it blocks further promotion only on that path. | [§3](#3-outcome-conservation) | one selected, directly verifiable outcome per work wave; the four kinds of evidence, refining the progress categories of [ACTIVATION §5](ACTIVATION.md#5-work-state-and-restart), with the promotion block added to regression; admission recorded in the existing goals or ticket authority: policy choices of this member, with the carriers at [TICKETS](TICKETS.md); deletion, archival, quarantine and salvage mechanics: consumers | 5, 9 |
| P6 independent; P4b derived; P5 derived; instance: owned layers | By P6 closure needs evidence, and by P4b and P5 what remains open stays recorded, so the evidence for closing a realisation claim includes its authority trace, its realisation proof, negative proof where drift is plausible and the open pressure that remains. | [§9](#9-evidence); [Spec-drivenness litmus](#spec-drivenness-litmus) item 10 | none here: the closure condition is [TICKETS §7](TICKETS.md#condition-based-closure-and-reuse), and the rules of evidence are EVALUATION §1 to §3, §6 and §7, and ASSURANCE | 9 |
| P3 independent; P6 independent; instance: immutable releases, several realisations | By P3 each lineage object binds its own identity, so lineage objects keep distinct identities, and a consumer selects one complete released version. By P6 a reusable method change has authority only through its relation to its evidence, so it keeps one authority relation from that evidence to the consumer that realises it. | [§6](#6-lineage-and-release); [Shared method adoption and propagation](#shared-method-adoption-and-propagation-stdo-up-012) | the eight-step adoption chain: a policy choice of this member; the lineage objects: [FOUNDATIONS §2](FOUNDATIONS.md#product-lineage-objects) | 1, 2 |
| P3 independent; P1 independent; instance: layered surfaces | By P1 a term's spelling carries no meaning, and by P3 it resolves under one declared context, so the method's own terms resolve within a declared bounded context. | [Method identity](#method-identity) | the context identity and the reading of STDO as four named areas with their owning members: domain choices of this member | 2, 6 |
| P1 independent; P4a independent; P6 independent; instance: several realisations | By P1 meaning lies in the declared semantics, not in the form of the code, and by P4a parts compose only through declared relations, so where a design profile governs a boundary, its semantic steps read as transforms over admitted truth with effects explicit at the edge, and a boundary that composes higher-order or effectful computation has an explicit composition and effect algebra. | [Realisation shape](#realisation-shape) | the "should" force of the core rule, its scope to boundaries the design profile governs, and the optional vocabulary: choices of this member, with the profile at [DESIGN_MODULE](DESIGN_MODULE.md) | 3, 4 |
| P2 independent; P1 independent; P6 independent; instance: several realisations | By P2 obligations follow the outcome, not the means, so the same obligations may be realised by different means, and the obligations decide fitness. By P6 executing an operation is not adjudicating it, so the kind of executor alone neither accepts nor rejects a realisation, a person performing an operation does not thereby adjudicate, and a convenient stack weakens no obligation; by P1 a representation that validates structurally is not thereby executed correctly. Only an obligation's owner can weaken it (P6), so a change that needs a weaker obligation is a change to the WHAT at its owning layer. | [§11](#11-build-tenant-binding), rules 1, 2, 4 and 6, and Application in this method | the division of a binding into requirements calculus, computational calculus and execution environment: a domain choice of this member; each tenant's calculus and environment: that tenant's design | 4, 8 |
| P0 recovered; P1 independent; P2 independent; P4a independent; P6 independent; P5 derived; instance: several realisations | By P0 and P5 a binding's results must be evaluable by a finite actor, so a binding identifies its operations, their outcome values mapped into the core, and resource measures with units and boundaries. By P4a a calculus composes by its declared laws, so it may serve wherever its laws hold, whoever executes it. By P6 a project's mechanics for developing several tenants are that project's own law. | [§11](#11-build-tenant-binding), rules 3 and 5, and Development of several tenants | which resources are measured, the limits on them, and their units and boundaries: each tenant's binding, as its obligations require, under the resource-limit law of [ACTIVATION §6 Resource limits](ACTIVATION.md#resource-limits); the development mechanics: the project's product definition or the tenant's design | 3, 8 |
| P1 independent; P0 recovered; P4a independent; P6 independent; instance: several realisations | By P1 and P4a the steps of a construction, what its data means and how it is carried out are separately declared, so they stay three separate accounts across the binding. A mapping from one account to another is a transformation, so it states and discharges its preservation under the law of [ACTIVATION §4 Refinement](ACTIVATION.md#refinement) and, where it is recorded in a_c, of [AC-013](AXIOMATIC_CALCULUS.md#ac-013-transformation). | [§11](#11-build-tenant-binding), rule 7 | which accounts a mapping joins, and the evidence that discharges its preservation in the environment: each tenant's binding; the three accounts of a construction: an added choice owned by [FOUNDATIONS §2 Accounts of a construction](FOUNDATIONS.md#accounts-of-a-construction) | 6, 8 |

The standing of these consequences is stated in
[FOUNDATIONS §3 Foundation to law](FOUNDATIONS.md#foundation-to-law).
The table accounts for §1 to §3, §6 and §9 to §11. §1 Canonical statement
decides nothing of its own: each clause names its owning section. §8
binds the step of ACTIVATION to this method's terms; its delivery
priority is accounted for by family F5 at ACTIVATION §6, and the rest of
it by family F2 at ACTIVATION §1, whose paragraph after its table names
the rows §8 applies and the families that trace its statement of the
step's results and its use of the tenant's binding.

Consumers of these rows, where an actor enters them (FOUNDATIONS §3
Foundation to law, Consumers), one list per row, each consumer linked to
its own locus:

- Row 1, the declared specification governs: [ASSURANCE §1](ASSURANCE.md#1-verification-layers), where each layer of the chain preserves a distinct kind of truth; [DESIGN_MODULE §5](DESIGN_MODULE.md#5-ontology-first-design), where implementation and tests substitute for no layer, and the [DESIGN_MODULE family table](DESIGN_MODULE.md#foundation-to-law), whose row for purpose, position and the core rule imports F10; the [ODD family table](ODD.md#foundation-to-law), whose row for method role and composition imports F10 for the chain that domain-correct work needs.
- Row 2, trace closure, requirement status and design records: [DESIGN_MODULE §5 Ontology projection](DESIGN_MODULE.md#ontology-projection), where every implementation branch and test expectation traces to requirements plus accepted design; [TICKETS §7 Recorded judgment and owner-ruling continuity](TICKETS.md#recorded-judgment-and-owner-ruling-continuity), whose repricing dispositions record standing as the lifecycle statuses record a requirement's; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), discriminator 48, where a lifecycle label or classification decides no admission, compliance or closure; [Fundamental migration](#fundamental-migration), where an adopted inherited requirement takes a lifecycle status of the live surface; [§11](#11-build-tenant-binding), rule 1, where a tenant's bindings are recorded as design decisions under §10.
- Row 3, layer sufficiency and several realisations: [§11](#11-build-tenant-binding), rule 1 and Application in this method, where the execution binding is chosen under the Design rule; [WRITING_GUIDE §7](WRITING_GUIDE.md#7-specification-artifact-practice), whose discipline, with the layer checks of its §8, keeps each sentence in its layer and asks whether the next layer can derive from the artifact.
- Row 4, live surface immutability and the version boundary: [RELEASE §6 Release-scoped assets](RELEASE.md#release-scoped-assets), where a live constitutional surface's use of version labels follows the surface rule; [WRITING_GUIDE §9](WRITING_GUIDE.md#9-current-surface-writing), which writes the current surface in the present tense and removes what is no longer live; [IDENTITY §9](IDENTITY.md#9-release-version-boundary), where an immutable release cut is the only exact operative release identifier and release version is not object identity; [Fundamental migration](#fundamental-migration), a supersession by a new constitutional surface and no in-place mutation.
- Row 5, the renewal path and lifecycle sufficiency: [ASSURANCE §16](ASSURANCE.md#16-module-lifecycle-confirmation), which applies the three answers to the design evidence of a governed boundary; [DESIGN_MODULE §11 Design review questions](DESIGN_MODULE.md#design-review-questions), question 32, and [Functional realisation checklist](DESIGN_MODULE.md#functional-realisation-checklist), whose lifecycle items are confirmed against the canonical chain.
- Row 6, outcome conservation: [TICKETS §5 Execution contract admission](TICKETS.md#execution-contract-admission), where a ticket's status, lane or contract is never the admission of a growth basis, and [§6 Closure of a migration ticket](TICKETS.md#closure-of-a-migration-ticket), where growth after an accepted slice needs another admitted basis; [ODD §11.5D](ODD.md#115d-constructive-evaluation-and-yield-loop), where the selected outcome is external authority for the loop, and the [ODD family table](ODD.md#foundation-to-law), whose row for the selected outcome imports F10; [CONFORMANCE §1](CONFORMANCE.md#1-counterexample-cases), case C-08; [§8](#8-bounded-execution-in-this-method), which binds a step's selected outcome to the product outcome, prerequisite or experiment of this section; [Constitutional migration options](#constitutional-migration-options), where ticket activity alone is no basis for further growth.
- Row 7, the evidence for closing a realisation claim: no separate consumer applies. The closure condition the evidence serves is [TICKETS §7 Condition-based closure and reuse](TICKETS.md#condition-based-closure-and-reuse)'s, which names this section nowhere, and the rules of evidence it points to are EVALUATION's and ASSURANCE's own, as the choice column states; the kinds of evidence are assembled where a claim closes, under that condition.
- Row 8, lineage objects and shared method adoption: [PRODUCT_DEFINITION §1](PRODUCT_DEFINITION.md#1-overlay-and-layout-independence), where changing a released Product does not repurpose the definition identity as release identity, and [§7](PRODUCT_DEFINITION.md#7-collective-reference-frame-basis), whose map keeps the lineage objects as distinct identities; [ASSURANCE §5](ASSURANCE.md#5-installed-dev-proof), which takes the install and development-product roles from §6; [POSTING_GUIDE §10](POSTING_GUIDE.md#10-shared-method-adoption), where a post that carries evidence or proposes a change adopts nothing.
- Row 9, method identity: [TICKETS](TICKETS.md#tickets), its preamble, which places that member as the T area of the method identity and makes nothing in it foundational.
- Row 10, realisation shape: [DESIGN_MODULE §1 Core rule](DESIGN_MODULE.md#core-rule), which every rule of that profile refines; [§5 Atomic functions and higher-order composition](DESIGN_MODULE.md#atomic-functions-and-higher-order-composition), where the explicit algebra needs no particular vocabulary; [§12 Non-goals](DESIGN_MODULE.md#non-goals).
- Row 11, the division of a binding and the kind of executor: [Constitutional chain](#constitutional-chain), where Code, Events and Projection are carried in the carrier the binding selects; [Design rule](#design-rule), where a tenant's choice of stack, human process or combination is its execution binding; [§5](#5-ambiguity-governance-and-lifecycle), where who performs an operation does not decide its kind; [ACTIVATION §1 Construction relation](ACTIVATION.md#construction-relation), Binding A and Z, where the tenant's declared calculi govern which transformations are lawful, and [§5](ACTIVATION.md#5-work-state-and-restart), whose resumption procedures bind to no particular carrier; [FOUNDATIONS §2 Accounts of a construction](FOUNDATIONS.md#accounts-of-a-construction), where a build tenant's execution environment is the one this section defines; [PRODUCT_DEFINITION §8](PRODUCT_DEFINITION.md#8-what-how-and-work-carriers), whose tenant registry locates each tenant's surfaces and leaves the binding they declare to this section; [CONFORMANCE §4](CONFORMANCE.md#4-cases-for-method-discriminators), case CD-02, and [§5](CONFORMANCE.md#5-discriminator-coverage), discriminators 42 to 45.
- Row 12, operations, outcome values, resource measures and several tenants: [ACTIVATION §6 Resource limits](ACTIVATION.md#resource-limits), whose values, units and boundaries are set by the binding this section defines; [§8](#8-bounded-execution-in-this-method), whose resource limits are those of the step's execution binding; [PRODUCT_DEFINITION §8](PRODUCT_DEFINITION.md#8-what-how-and-work-carriers), whose tenant registry identifies the tenants whose development the project's own law governs; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), discriminator 44.
- Row 13, the three accounts across the binding: no separate consumer applies. The accounts are defined at [FOUNDATIONS §2 Accounts of a construction](FOUNDATIONS.md#accounts-of-a-construction), which names this section for the execution environment and states no mapping rule; a mapping's preservation is discharged under [ACTIVATION §4 Refinement](ACTIVATION.md#refinement) and, where recorded in a_c, [AC-013](AXIOMATIC_CALCULUS.md#ac-013-transformation), which the row names and which name this rule nowhere; which accounts a mapping joins and the evidence that discharges it are each tenant's binding, as the choice column states.

Each consumer applies the rule and decides nothing the owning section does
not (P2, P6).

### Constitutional chain

```text
Goals → Intent → Product Definition → Requirements → Design → Code
  → Events → Projection → Delta → Scenarios → Gap analysis
  → Repricing at the layer its change class names
```

Goals define the current overriding concerns for the active body of work.
Intent defines purpose and direction. Product Definition defines the current
product realisation of the mutable source project, its key terms and its
end-state shape in terms that can be decomposed into requirements.
Requirements define invariant truths the system must satisfy. Design
defines the structural decisions, interfaces, carrier surfaces and delivery
topology that make those truths achievable; ADRs are one durable form of
design record, not a second constitutional layer above design. Code
realises those decisions where the selected execution environment is
software; a performed human procedure realises them where it is a human
process, and both where it is mixed (§11). Events are the retained
record of what happened, in the carrier the binding selects: an event
stream, a ledger, a signed record or an observation log. Projection
reconstructs current truth from that retained record where the record is
sufficient for the product's obligations; it need not replay a complete
event stream. Delta reveals drift
between intended truth and realised state. Scenarios test operational
meaning: whether the system can do what the words describe. Gap analysis
identifies where real use cases hit the current model and reveal
insufficiency. Repricing updates goals, intent, product, requirements,
design or code when the system no longer harmonises; when gap analysis
reveals constitutional insufficiency, repricing re-enters at the layer its
[change class](#change-classes) names and generates new goals or intent
where the work wave, direction or scope changes (P2, P1).

This is the homeostatic loop. Every link is load-bearing. A break at any
link, goals with no downstream repricing path, an unowned requirement, an
ungrounded design record, code without a design decision, creates
accidental law (P6). Load-bearing means owned, not software: the links
Code, Events and Projection name responsibilities every realisation
carries in the carrier its binding selects (§11), and no product owes a
code base or an event store that its binding does not select (P2, P6).

The goals surface is the bounded work-wave surface: it captures the current
overriding concerns for the next body of work, keeps temporary focus out of
deeper constitutional layers until it is intentionally repriced there, and
is more immediate than intent while remaining higher-level than product
definition and requirements. The product-definition surface is the bridge
between direction and obligation: it states the current product definition
of the mutable source project in present-tense terms, names the product
terms and boundaries that downstream layers rely on, and provides the
surface that requirements decompose. It is not the immutable release cut
and not the installed product; those are the lineage objects of FOUNDATIONS
§2 (P3).

Requirements are the constitutional what of the project. They are not
limited to user-visible features: the live requirement surface may include
capabilities, invariants, constraints, governance and verification
obligations; what matters is that each requirement states something the
project must make true. Design is the structural how: it chooses the
concrete realisation that satisfies requirement truth, interfaces, topology,
file placement, carrier documents, entry and control surfaces, runtime
wiring and lawful tenant boundaries. Requirements may require such surfaces
to exist and be delivered; design chooses where and how they are realised
unless the path itself is constitutional (P2, P1).

The relation between the WHAT and the build tenants that realise it is
[§11](#11-build-tenant-binding) (P2).

### Manifesto

The method commits to these (P2, P6). It defines the
current goals for the active body of work before repricing deeper
constitutional layers. It works from intent before implementation. It
defines the current product definition in explicit present-tense terms
before decomposing it into detailed requirements. It defines the full
constitutional what in requirements, not merely a feature list. It prefers
declaring desired truth and lawful boundaries over prescribing step-by-step
imperative procedure. It makes design the explicit structural bridge
between requirements and code. It requires code to be derivable from
requirements and design, not defended as accidental precedent. It treats
spec-driven development as a disambiguation pipeline: each major gate
reduces the space of lawful interpretations before downstream realisation
proceeds. It demands evidence for claims through scenarios, tests, events,
projection and delta. It treats repricing as part of correctness: when
reality exposes a constitutional gap, the specification changes. It keeps
authority directional while iterating: goals govern intent, intent governs
product definition, product definition governs requirements, requirements
govern design, and requirements plus design govern code. It keeps the live
operative surface in the present tense only: once a new current reality is
established, transitional paths are erased from the live product unless
explicitly retained as compatibility features. It treats derived artifacts,
indexes, trace matrices, reports, automation and generated views, as read
models, never as constitutional truth. If these claims do not hold, the
work is not spec-driven.

### Spec-drivenness litmus

The work is not spec-driven if any of these holds (P2, P6):

1. Given goals, a competent team cannot derive a conformant intent surface.
2. Given intent, a competent team cannot derive a conformant
   product-definition surface.
3. Given product definition, a competent team cannot derive conformant
   requirements.
4. Given requirements, a competent team cannot derive a conformant design.
5. Given requirements and design, a competent team cannot derive conformant
   code.
6. A live requirement has no explicit status, category or owning design
   decision.
7. A live requirement has no downstream realisation or explicit deferment
   surface.
8. Code behaviour exists without requirement and design authority.
9. A live domain artifact is rewritten in place after becoming part of the
   live constitutional surface.
10. A capability claim has no operational evidence.
11. Drift is discovered, [Universal intake triage](#universal-intake-triage)
    locates its cause in the constitutional source, and that source is not
    repriced.
12. A major ambiguity at a constitutional or realisation boundary is neither
    recorded nor explicitly governed.
13. A material product, module, function, application, runtime surface or
    capability has no declared operational lifecycle signal and no recorded
    gap for unanswered release, deployment, live-use, telemetry or
    retirement questions.

### Reconstruction litmus

The generic law, that a layered specification is sufficient when a competent
actor can derive each layer from the one above, that sufficiency is not
determinism, that a boundary crossed only by hiding a major ambiguity is not
sufficient, and that an accepted relation may be reused on its exact basis
after checking applicability and invalidation, is EVALUATION §6. Applied to
this chain (P2, P1), the method is
specification-driven only if the layers are reconstructable in order: given
goals, a competent team should be able to derive a conformant intent
surface; given
intent, a conformant product definition; given product, conformant
requirements; given requirements, a conformant design; given requirements
plus design, conformant code. Different designs may satisfy the same
requirements and different codebases the same design.

A failure at any boundary is a specification defect of the upper layer. If
intent cannot be derived from goals, the goals surface is unclear,
contradictory or not concrete enough to orient the next bounded wave of
work. If product cannot be derived from intent, the intent surface is too
vague, contradictory or not concrete enough to guide realisation. If
requirements cannot be derived from product, the product surface is
underspecified, contradictory or not decomposable enough to govern
implementation. If design cannot be derived from requirements, the
requirement surface is underspecified, contradictory or polluted with
accidental implementation detail. If code cannot be derived from
requirements plus design, the design surface is incomplete, ambiguous or
not operational enough. ADRs and design documents are therefore not
decorative explanation; they are the load-bearing bridge between
constitutional truth and executable realisation.

Reconstruction sufficiency depends on ambiguity governance (§5). The
hidden-ambiguity limit, reuse of an accepted relation's evidence, what
reconstructability requires and grants, and the reconstruction span are
stated once at
[EVALUATION §6 Layered sufficiency](EVALUATION.md#6-conformance-of-realisations);
this litmus applies them to the method's own chain, where the span of a
local selected function excludes recreating the whole product. The design
profile owns design-view coverage, its material-change gate and
unchanged-boundary reuse; this litmus neither waives that gate nor requires
recreating unchanged accepted views ([DESIGN_MODULE](DESIGN_MODULE.md)).

### Renewal path

Intent is not only top-down. The full homeostatic cycle includes a reverse
path, from real use cases back into the chain, that generates new goals or
intent where a use case changes the work wave, direction or scope (P2):

```text
current specification → real-world use case → gap analysis → re-entry at the layer its change class names
```

The generative rule: a real use case (scenario, deployment, external review)
hits the current model; gap analysis identifies what the constitution cannot
express; if the gap is constitutional, not merely a missing implementation,
it re-enters at the layer its [change class](#change-classes) names, and
new goals or intent are written where it changes the work wave, direction
or scope; the repriced surface then flows forward through the layers that
class lists. New intents emerge from repeated, real use-case pressure
against the current model, not from abstract speculation; a gap becomes
intent only once it is concrete. Ad hoc coding pressure does not generate
intent; explicit gap analysis does. This is how the system stays alive
instead of becoming a frozen constitution.

The flow is not a one-pass waterfall computation; it is cumulative
iteration: requirements and design are refined over time; code is
repeatedly re-derived against the current constitutional surface; gaps
discovered during implementation, testing, replay or scenario work feed
back into repricing. What stays stable is the full direction of authority:
goals govern intent, intent governs product, product governs requirements,
requirements govern design, and requirements plus design govern code,
through every iteration.

### Specification surface rule

The active specification layers have distinct constitutional roles (P2, P1). Goals orient the current bounded work
wave and are not a substitute requirement surface. Intent states why the
system exists and what directional change is in or out of scope; it carries
no optional realisation detail unless that detail is itself constitutional.
Product states the current concrete product definition and bridges intent
to requirements; it is not a release-note surface; it carries enough
operational lifecycle signal for downstream requirements and design to
understand intended use, release and install posture, live-use posture,
observability posture, and retirement or supersession posture where those
materially affect product meaning. Requirements state stable obligations
that must be true; they carry explicit acceptance criteria and remain
sufficient for downstream design derivation, including lifecycle
obligations or named lifecycle ambiguity gaps where build, assurance,
release, deployment, live usage, telemetry or retirement materially affect
the obligation. Design states how requirement truth is realised; it is
downstream of requirements and may choose structure, interfaces, carriers,
packaging and tenant boundaries. ADRs are durable design memory, not a
second requirement surface.

Constitutional specification is current-surface law and is written in the
present tense. Dead law does not remain in active constitutional artifacts
for historical comfort: what is no longer live is deleted, superseded or
moved to commentary, and a migration wave does not justify preserving stale
constitutional wording inside the live surface (P3). During a change wave
the live constitutional surface is written in terms of the current truth
and the declared affected boundary; version-line branding such as `2.0` or
`3.0` is not used merely to indicate recency, and explicit version labels
are reserved for immutable release facts, selector bindings, or clearly
historical or superseded material (§6).

Before a downstream specification artifact is treated as complete, the
whole affected span is checked: is the change class clear; is the re-entry
point lawful for that class; can each downstream layer still be derived
from the upstream layer; do the active intent, product, requirements,
design and qualification surfaces still say the same thing in the affected
scope. If not, the gate is not closed (§4, consistency gate).

### Design rule

Requirements state what control or delivery surfaces must exist; design
decides the concrete mechanism that realises them. If a technology stack,
carrier or runtime is not already constrained by an upstream constitutional
surface, choosing it is part of design, not a separate upstream authority
(P2, P1). A tenant's choice of stack, human process or
combination is its execution binding, declared in that design under §11.
The boundary matters especially for
agent-facing bootstrap and control surfaces: requirements may say that
authoritative bootstrap or control surfaces must be present, carry bare
axioms and route to the canonical method; design decides whether those
surfaces are entry documents, embedded blocks, standalone compiled
artifacts or another lawful topology (PRODUCT_DEFINITION §12). If
filenames and placement are hardcoded in requirements without
constitutional necessity, the requirement surface has absorbed design
detail and made re-derivation harder.

### Realisation shape

For a realisation boundary that the design profile governs (DESIGN_MODULE,
tier 3, adopted under its own adoption rule), the core rule is: semantic
steps should read as transforms over admitted truth; effects should be
explicit and pushed to the edge. If a reader has to inspect orchestration
code, mutable workspace state, service methods or fallback defaults to
determine what the system means, the design is too imperative and too
coupled (P1, P6).

Non-goals of that profile (P1, P4a): it does not require one specific programming language,
elimination of all imperative code, monadic or category-theory vocabulary,
or replacing every exception with a custom algebraic type. It does require
that the implementation shape remain readable, modular and honest about
where meaning lives and where effects happen. Where a boundary composes
higher-order functions or effectful computation, it does require an
explicit composition and effect algebra with its applicable identity,
closure, cardinality, effect and authority-conservation laws (FOUNDATIONS
§4 Composition). The vocabulary is optional; the law is not.

### Requirement categories and classification

Every live requirement family is categorised by the kind of truth it
asserts, so that the requirement surface is not treated as a feature list
(P1, P2):

| Category | Meaning | Typical question |
|---|---|---|
| Capability | a behaviour, function or surface the system must provide | what can the system do |
| Constraint / Guarantee | an invariant, law, safety property, portability rule or semantic guarantee that bounds how the system may behave | what must always remain true |
| Governance | a policy or control rule over lifecycle, authority, visibility, release or operator action | what governs use and change |
| Verification | a requirement on tests, evidence, traceability, qualification or forensic surfaces | how do we know the claim is true |

Requirements remain part of the constitutional layer in all four cases. A
category is not a priority label and not a claim that the requirement is
user-facing; it states what kind of project truth the requirement owns.
Requirements describe the full constitutional what; design describes the
structural how, with ADRs one durable design form; scenarios validate the
operational meaning of capability claims. Not every requirement should be
translated into a marketed feature; some are better expressed as
guarantees, constraints, governance rules or verification obligations.
Requirements should also avoid freezing concrete realisation choices
prematurely:
unless a path, filename or packaging rule is itself constitutional, it
belongs to design.

Every live requirement family is classified on two independent axes (P3,
P1): lifecycle status (Active,
Deferred, Superseded, Orphaned) and requirement category (the four above).
The axes answer different questions: status says whether the requirement
still belongs in the constitution and whether it is operative or explicitly
deferred; category says what kind of truth it asserts. A live requirement
is incomplete if either axis is missing. In project documents the
classification is explicit in the requirement's header metadata: `Status`
carries lifecycle status and `Category` carries the kind.

Every inherited or legacy requirement is classified as one of these, and
nothing live remains unclassified (P3):

| Classification | Meaning | Action |
|---|---|---|
| Deferred | retained in the live surface as an explicit not-yet-operative or not-yet-realised obligation | keep with an honest deferment surface; do not present as current closure |
| Superseded | ownership has moved to a newer constitutional surface or design decision | add Implements and Supersedes to the governing design record |
| Active | remains live constitutional law in the current surface | has an owning design decision; write or update one |
| Orphaned | no longer part of the intended system | remove or explicitly supersede |

The lifecycle statuses (Active, Deferred, Superseded, Orphaned), the
categories and the legacy classifications are declared states of a
requirement, not results, and map to no core value. So are the other
declared classes of this member: the kinds of evidence of §3 (material
advance, prerequisite readiness, preservation, regression), the old-path
classes of §7 Required migration protocol, the inherited-material
classes adopted, superseded, deferred and orphaned and the
implementation classifications `carry_across`, `redundant` and `rewrite`
of §7 Fundamental migration, and the ADR `Status:` values of §10; the change
classes are declared states under §4 Change classes. Each records
a declared classification of its subject, not the answer to a predicate
that an evaluation decides. An evaluation that reads them returns its own
core value with its predicate under
[FOUNDATIONS §4 Results](FOUNDATIONS.md#results). Purpose and material
relation: a declared state is never combined as an evaluation result, so
a requirement marked Active, or evidence classed as material advance,
cannot stand in for a `satisfied` result, and a requirement marked
Deferred or Orphaned cannot stand in for a `falsified` one (P5, P1).

The legacy classification answers one question: what standing an
inherited requirement holds in the project's own live requirement
surface. The disposition of a predecessor claim under
[RELEASE §9](RELEASE.md#9-successor-baseline-conservation-stdo-up-015)
answers another: what a successor release does with a claim of the
released predecessor it evolves, a claim that qualification evaluates.
Where a project's work is also such a successor, each predecessor claim
takes its RELEASE §9 disposition by that section's predicates, and no
lifecycle status or legacy classification supplies or replaces it: a
requirement marked Active may still be `superseded` where its meaning
changed, Superseded names no accepted successor relation, and Orphaned
is not an intentional removal. Purpose and material relation: two
vocabularies with overlapping words would otherwise let a project-level
record stand in for a successor disposition that its owner has not made
(P6, P3).

### Trace closure and anti-drift

Spec-driven development requires constitutional trace closure: the rule
that closes the constitution over realised behaviour, stricter than
documentation completeness (P6, P4b).

Ownership: every live requirement family maps to one or more owning design
decisions; every ADR or other design record grounds itself in requirements
through an explicit `Implements:` line.

Downstream closure: no live requirement remains a free-floating statement
of intent; if it is live it is realised through the downstream chain or
explicitly deferred with an honest surface that records the deferment, so
every live requirement family has downstream closure, realised in design,
code and tests or explicitly deferred. No shipping code or tests exist as
ungoverned behaviour: behaviour that exists traces back to live
requirements and the design decisions that authorise it. No hidden product
surface is allowed; behaviour without trace authority is accidental law
even if it works.

Drift signals: unowned requirements, ungrounded
design records, deferred requirements without explicit deferment, and code
without trace authority are design drift. An ADR or other design artifact
with no requirement grounding is design without constitutional authority.
Code behaviour with no design owner means the design has already drifted.
Shipping code or tests that cannot trace back out to live requirement and
design authority are ungoverned product surface. Tests that validate
implementation habit rather than requirement truth lock in drift. Events
and projection that reveal persistent delta signal drift whose cause
[Universal intake triage](#universal-intake-triage) diagnoses: the code, the
requirement and design stack, the predictive model or the observation. A
capability with requirements and design but no scenario has unverified
operational meaning.
A requirement treated as a product feature when it is a guarantee,
governance rule or verification obligation is misclassified. A live
constitutional artifact corrected by in-place mutation rather than
supersession or withdrawal has corrupted constitutional history. A real use
case that reveals a gap not expressible in current requirements needs
re-entry at the layer its [change class](#change-classes) names,
Requirements or upstream, not a code hack.

### Live surface immutability

A project may accumulate multiple live domain surfaces over time. A live
surface is versioned constitutional history, not scratch space (P3). Engine code, design documents, tests and
tooling may be refactored aggressively while they remain mutable
implementation surfaces. Live domain artifacts, once published as live
constitutional surfaces, are immutable in place; if one is wrong, the valid
actions are to supersede it with a new version or to withdraw or delete it
from the live surface. Transitional implementation paths, migration
scaffolds and fallback behaviours have no permanent authority in the live
surface: once superseded they are retired, and any retained responsibility
satisfies the retention relation of §7 (closure criterion). The past is
preserved by version control, operational event history where present and
superseded constitutional artifacts. The method does not require shipping
compatibility shims forever, and it does not allow silent mutation of live
constitutional history.

### Operational lifecycle sufficiency

Constitutional specification treats a designed thing as more than its build
shape (P2). Any material
product, application, module, function, runtime surface, plugin
surface, public interface, data surface or capability has an operational
lifecycle, whose canonical chain is intent, requirement, build, assurance,
release, deployment, live usage, observed telemetry, retirement. The
product definition and the requirement surface need not prescribe the
implementation mechanism for every phase; they provide enough
constitutional signal for downstream design to derive the intended
lifecycle, or explicitly record the unresolved ambiguity.

For product definition this means naming the current product boundary,
intended use context, release and install posture, live-use posture,
observability posture, and retirement or supersession posture where those
materially affect the product's meaning. For requirements it means stating
any invariant obligation that governs build, assurance, release,
deployment, live usage, telemetry, retirement, ownership, source truth,
authority boundary or downstream interpretation; a requirement may defer a
phase only by naming the deferment and the surface that will own its later
resolution.

The rule is an ambiguity detector, not a demand that every requirement
become a release plan. Each phase has one of three answers, and this
section owns them: the phase is answered by the surface; if a phase is
not applicable, the surface says why; if it is unknown, a named gap such
as `Gap:` or `Unanswered:` is recorded.
Silent absence is not a valid lifecycle answer.
[ASSURANCE §16](ASSURANCE.md#16-module-lifecycle-confirmation) applies
the three answers to the design evidence of a governed boundary. When the lifecycle signal is
missing, downstream design may not fill the gap by local convention,
implementation precedent, prompt prose or test fixture; it reprices the
appropriate constitutional surface or carries the ambiguity as explicit,
governed debt (§5).

A phase answered, a phase declared not applicable with its reason, and a
named `Gap:` or `Unanswered:` marker are declared states of the surface
for that phase, not results, and map to no core value. An evaluation that
reads them returns its own core value with its predicate under
[FOUNDATIONS §4 Results](FOUNDATIONS.md#results). Purpose and material
relation: a declared state is never combined as an evaluation result, so
a phase marked answered or not applicable cannot stand in for a
`satisfied` result (P5, P1).

## 3. Outcome conservation

Every product-outcome-bearing work wave identifies one explicitly selected,
unresolved, directly verifiable product-defined outcome and declares the
acceptance interval for that instance. Product-progress claims and
promotion onto the supported product path are judged against that same
outcome (P2; FOUNDATIONS §2
Outcome U is the generic object).

Evidence distinguishes material advance, prerequisite readiness,
preservation and regression. The four refine the progress
categories of [ACTIVATION §5](ACTIVATION.md#5-work-state-and-restart)
(Progress) for a product outcome: material advance is progress there,
accepted material movement toward the selected product outcome, and only
material advance projects product progress; prerequisite readiness is
its prerequisite work, which names the product obligation it enables and
here also remains bounded; preservation is its preservation and repeated
proof, useful evidence, not progress; regression maps to evidence that
is not new progress, and this member adds one need to it: the promotion
block in the last paragraph of this section. Churn and the revision of the forecast are
ACTIVATION §5's, unchanged here.

The exact bound outcome instance stops selecting later product-progress
work when the owning authority accepts it; its witnesses remain regression
and preservation evidence. Acceptance exhausts only that instance and its
declared acceptance interval; it does not discharge an enduring guarantee,
a recurring obligation or a broader product family beyond the accepted
instance. Further work against the accepted instance is preservation, a
named bounded prerequisite for another admitted outcome, or a new change
requiring lawful repricing; it is not additional progress against the
accepted instance (EVALUATION §5).

Selecting the next unresolved outcome already defined by the product is a
goals and work-sequencing decision. Changing an outcome's meaning or scope,
or introducing a new product outcome, requires lawful re-entry at the
product (§4).

Evidence evaluates and constrains its bound product claim. Completion of a
proof surface, matrix, coverage ledger, inventory, design-method artifact,
test suite or other evidence surface cannot by itself select, enlarge or
replace the product outcome. If an assurance capability is explicitly
defined as product behaviour, delivery of that capability is judged as
product progress; its evidence still does not author the claim. The same
artifact may be product output for one claim and evidence for another only
when those roles are declared separately (P6).

Within a product-outcome-bearing work wave, material realisation growth
derives its authority from the selected unresolved product outcome, an
admitted named bounded prerequisite to it, or an admitted named bounded
experiment whose stated observation discriminates a stated decision for it.
A prerequisite or experiment authorises only its declared provisional
bound; it does not select or enlarge the product outcome, authorise
downstream work, confer promotion or closure, or waive applicable design,
safety, authority or release law, including the prime law of a design
profile where one applies.

Admission or renewal of a prerequisite or experiment belongs to the
authority owning the selected work wave, or its explicitly bounded proxy,
and is recorded in the existing durable goals or ticket authority. The
admitted basis states its provisional bound and its exhaustion or
falsification condition. Satisfaction of an experiment's stated
decision-discriminating observation exhausts that experiment. Drafting or
validating a ticket or execution contract, retaining active status, or
holding a prior admission cannot create, extend or renew the basis
(ACTIVATION §1, Admission).

Acceptance of the selected outcome, discharge of an admitted prerequisite,
or resolution of an admitted experiment's stated decision exhausts that
basis. A basis or bound also ends when another admitted terminal condition
is reached or it is rejected, withdrawn, superseded, repriced away or
falsified by evidence. Ended authority cannot be renewed by repair,
continuation, evidence, active ticket or run state, or prior admission;
further material work requires a new admission by the owning authority or
its explicitly bounded proxy (P6).

Retention as supported product behaviour, required evidence, regression
protection or bounded donor material confers no further growth authority.
Consumers own deletion, archival, quarantine and salvage mechanics. Salvage
carries only the explicitly re-adopted semantics; it inherits neither the
enclosing work's authority, dependencies or completion claim nor its power
to select further work.

A regression or unresolved gap blocks further promotion on the affected
path until repaired, repriced or accepted by the owning authority. It does
not globally serialise independent work: parallel work may proceed under
its own admitted basis and cannot be laundered into the governed outcome's
progress claim. Outcome success is necessary delivery evidence, not
complete product or release closure (§6).

## 4. Change management

For an arriving report, start at [Universal intake triage](#universal-intake-triage).
[Change classes](#change-classes) locates the owning layer;
[Computed classification and treatment](#computed-classification-and-treatment)
separates what rules decide from judgment and owner decisions;
[Consistency gate](#consistency-gate) decides closure over the affected span.
The family table traces those rules and creates no second decision path.

Every substantive change begins with intake triage, an explicit declared
change intent and a lawful re-entry point into the constitutional chain
(P4b, P2).

### Foundation to law: change management and ambiguity

This family (F11 in the index of
[FOUNDATIONS §3 Foundation to law](FOUNDATIONS.md#foundation-to-law))
decides how a change enters the chain, how its classification is computed
and reused, how ambiguity is governed and how a shared interface is
migrated. Its instance premises, which the commitments do not supply, are
named in the rows as follows: changing specification, the specification
changes while work proceeds; one front door, reports of every kind arrive
at one product; shared interfaces, a shared interface has several
producers and consumers; reserved decisions, a decision may be taken
under declared policy or be reserved to a human authority. Standing of
the commitments cited (FOUNDATIONS §3): P0 recovered; P1, P2, P3, P4a and
P6 independent; P4b derived from P0 and P2, with P0's premise that
step-produced facts are not re-acquirable; P5 derived from P0 and P6,
with P0's open-world premise.

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|
| P6 independent; P2 independent; instance: changing specification, one front door | By P6 a governing relation is accepted only by its owner, so a change re-enters at the layer that owns what it changes and is accepted there. By P2 the work follows what changes, not what the report is called, so the label a report arrives under does not select its process, and a change that re-enters below Goals asserts that nothing above it changes. | [§4](#4-change-management); [Universal intake triage](#universal-intake-triage), the six determinations; [Change classes](#change-classes); [Procedures](#procedures) | the six change classes with their names, re-entry points and flows, and the four procedures: domain choices of this member; where the class is recorded: [TICKETS §4](TICKETS.md#change-class) | 1, 9 |
| P1 independent; P6 independent; P5 derived; instance: one front door | By P1 a frame's name carries no meaning, and by P5 a diagnosis holds only where evidence tests it, so a diagnosis is supported only by frames that test it against their own variables and evidence, and the same analysis under another frame name adds no evidence. The frame that exposes a failure need not contain its cause, and by P6 a diagnosis grants no repair. | [Universal intake triage](#universal-intake-triage), the triangulation | the smallest sufficient frame configuration for each case: chosen under [REFERENCE_FRAME §5](REFERENCE_FRAME.md#5-method-functions) and §6 | 7, 9 |
| P4b derived; P6 independent; P3 independent; instance: changing specification | By P4b a computed classification cannot be re-derived from memory, so it is recorded with its producer, inputs, unknowns and invalidators, and by P3 it is reused only after its applicability to the exact basis is checked. By P6 fact, judgment and ruling are distinct authorities, so they stay apart, and candidate behaviour cannot author its own target law. | [Computed classification and treatment](#computed-classification-and-treatment) | the C, J and O annotations, the order of the four steps and the material inputs of C named as instances of the reuse rule's: domain choices of this member; reuse and invalidation: [ACTIVATION §7](ACTIVATION.md#7-closed-result-and-reuse); continuity of recorded judgments and rulings: [TICKETS §7](TICKETS.md#recorded-judgment-and-owner-ruling-continuity) | 3, 9 |
| P5 derived; instance: changing specification | By P5 an unknown is not a value, so an unknown relation, delta or effect stays unknown: it withholds the reliance and promotion that depend on it, not unrelated authorised work, and an effect of uncertain completion is never treated as no effect. | [Computed classification and treatment](#computed-classification-and-treatment), its last paragraphs | none | 3, 9 |
| P6 independent; P4b derived; P5 derived; instance: changing specification | By P5 inconsistent surfaces cannot all be satisfied, so no gate closes while the affected surfaces are inconsistent. By P6 and P4b closure is decided only by recorded evidence for the declared obligations, so closure is their conjunction with valid evidence; an event, an aggregate or a status does not replace it, and implementation behaviour is evidence, not authority. | [Consistency gate](#consistency-gate) | none; the closure condition, which the gate applies to its change span: [TICKETS §7](TICKETS.md#condition-based-closure-and-reuse); reuse: [ACTIVATION §7](ACTIVATION.md#7-closed-result-and-reuse) | 3, 9 |
| P2 independent; P0 recovered; instance: changing specification | By P2 proof serves the outcome, and by P0 an actor can carry only bounded deferred work, so proof cost may be deferred inside a batch only while the deferred cost stays local, visible, bounded and repayable. A sprint batches work and admits none, so it is not an authority layer, and a carrier is chosen for the lifetime the work needs. | [Sprint execution boundary](#sprint-execution-boundary); [Carriers](#carriers) | the sprint with its required statements and close triggers: a policy choice of this member, its mechanics at [TICKETS §3](TICKETS.md#3-sprint-rules); whether escrow suits a domain: the profile that adopts it | 1, 5 |
| P5 derived; P6 independent; P2 independent; instance: reserved decisions | By P5 an ambiguity left unrecorded would be read as resolved, so major ambiguity at a boundary is detected and recorded with its outcome, and no dependent claim rests on an ambiguity that is carried, escalated or blocked as if it were resolved. By P2 whether it blocks depends on the risk the outcome bears, so it is policy, and by P6 a hard stop holds whatever the policy. | [§5](#5-ambiguity-governance-and-lifecycle); [Spec-drivenness litmus](#spec-drivenness-litmus) item 12 | the risk appetite, which sets the threshold between probabilistic decision and human adjudication: the project's declared policy; the order of narrowing, the major and micro split and the two concept identities: domain choices of this member; the hard-stop classes: [ACTIVATION §4](ACTIVATION.md#4-totality-and-refinement) | 6, 9 |
| P3 independent; P6 independent; instance: shared interfaces | By P3 each identity and state binds one authority, and by P6 two authorities on one acceptance path compete, so one authority governs each request, fact, identity, state and projection on an acceptance path. A migration therefore stays incomplete while old and new contracts both stay authoritative, a projection stays downstream of the authoritative carrier, and a promoted slice does not close its migration. | [Core interface migration](#core-interface-migration); [Constitutional migration options](#constitutional-migration-options); [What counts as a core interface](#what-counts-as-a-core-interface); [Required migration protocol](#required-migration-protocol); [Bridge prohibition](#bridge-prohibition); [Projection discipline](#projection-discipline); [Transformation wave](#transformation-wave) | the two strategies, the presumption for bounded evolution, and the old-path classes `remove`, `replace`, `re-authorize` and `temporary scaffolding`: policy and domain choices of this member; selecting fundamental re-adoption: the human authority owning the affected product boundary | 2, 4, 9 |
| P6 independent; P4a independent; P4b derived; instance: shared interfaces | By P4a producers and consumers compose only through a shared declared contract, so complete migration-closure proof is valid only once they share the new contract. By P6 and P4b a break is shown by evidence that persists, so each break shows that its severed seam is rejected, and a retained mechanism identifies its own supported obligation and owner. | [Inside-out first sequencing](#inside-out-first-sequencing); [Hard-break discipline](#hard-break-discipline); [Proof-last rule](#proof-last-rule); [Closure criterion](#closure-criterion) | the inside-out order, from the source carrier outward: a policy choice of this member | 4, 9 |
| P3 independent; P6 independent; instance: changing specification | By P6 inherited material has no authority in a new line unless that line adopts it, and by P3 adoption binds the new line's own surfaces, so in a fundamental migration nothing carries forward by default: inherited material has no authority in the new line until it is explicitly re-adopted and classified. | [Fundamental migration](#fundamental-migration) | the classes `carry_across`, `redundant` and `rewrite`: domain choices of this member | 1, 9 |

The standing of these consequences is stated in
[FOUNDATIONS §3 Foundation to law](FOUNDATIONS.md#foundation-to-law).
The table accounts for §4, §5 and §7.

Consumers of these rows, where an actor enters them (FOUNDATIONS §3
Foundation to law, Consumers), one list per row, each consumer linked to
its own locus:

- Row 1, re-entry at the owning layer and the change classes: [§2 Constitutional chain](#constitutional-chain) and [Renewal path](#renewal-path), where a constitutional gap re-enters at the layer its change class names; [Spec-drivenness litmus](#spec-drivenness-litmus), item 11, and [Trace closure and anti-drift](#trace-closure-and-anti-drift), its drift signals, where intake triage diagnoses the cause of drift; [§3](#3-outcome-conservation), where a change to an outcome's meaning or scope re-enters at the product; [§8](#8-bounded-execution-in-this-method), whose re-entry conditions are the change classes; [§11](#11-build-tenant-binding), Application in this method, where a change to a binding enters through intake triage and takes its class; [Requirement categories and classification](#requirement-categories-and-classification), where the change classes are declared states that map to no core value; [TICKETS §4 Change class](TICKETS.md#change-class), [Upward propagation check](TICKETS.md#upward-propagation-check), [Triage metadata](TICKETS.md#triage-metadata) and [Status](TICKETS.md#status), which record the class, the re-entry point and the walk that finds them; [TICKETS §3 Sprint admission](TICKETS.md#sprint-admission), which batches away no intake triage, and [Close review](TICKETS.md#close-review), whose layer-naming classification carries the class at which the work re-enters; [TICKETS §7 Test case authority](TICKETS.md#test-case-authority), whose derivation chain starts at the ticket's intake triage and re-entry point; [ACTIVATION §1 Construction relation](ACTIVATION.md#construction-relation), Feedback and diagnosis, where a bug enters the same intake; [RELEASE §1](RELEASE.md#1-context-and-position), where release handling is downstream of intake triage, and [§3 Mutable candidate construction](RELEASE.md#mutable-candidate-construction), where bounded fixes follow it; [ASSURANCE §2](ASSURANCE.md#2-testing-strategy-taxonomy), where tests derive from the ticket's lawful re-entry point, [§12](ASSURANCE.md#12-counterexample-localisation), where a resulting change follows the re-entry relation, and [§14](ASSURANCE.md#14-design-to-module-evidence-route), where an unchanged `realization_refactor` cites the accepted relation; [DESIGN_MODULE §5 Proportional design sequencing](DESIGN_MODULE.md#proportional-design-sequencing), [Native constructability](DESIGN_MODULE.md#native-constructability-up-002), [§10 Opportunistic optimisation](DESIGN_MODULE.md#opportunistic-optimisation) and [Post-ticket design review](DESIGN_MODULE.md#post-ticket-design-review), where a reframe or admitted follow-up enters at the smallest lawful re-entry point; [FOUNDATIONS §4 Preservation through construction](FOUNDATIONS.md#preservation-through-construction) and [Parallel derivation and mutual assurance](FOUNDATIONS.md#parallel-derivation-and-mutual-assurance), where a change to the governing outcome or a proposed correction follows the change authority; [ODD §11.7A](ODD.md#117a-conforming-agentic-development), where an agentic coder works through intake triage and the smallest lawful re-entry, and the [ODD family table](ODD.md#foundation-to-law), whose rows for the selected outcome and for method governance import F11; the [UX family table](UX.md#foundation-to-law), whose row for product truth and admitted carriers imports F11 for the re-entry that authors a missing carrier; [CONFORMANCE §1](CONFORMANCE.md#1-counterexample-cases), case C-10, and [§5](CONFORMANCE.md#5-discriminator-coverage), discriminator 41.
- Row 2, the triangulation: no separate consumer applies. The frames that test a diagnosis are selected under REFERENCE_FRAME §5 and §6, as the choice column states; the four causes a diagnosis distinguishes are [ACTIVATION §1 Construction relation](ACTIVATION.md#construction-relation)'s, Feedback and diagnosis, which names this section as its consumer; and localisation of a counterexample is [ASSURANCE §12](ASSURANCE.md#12-counterexample-localisation)'s, which this section applies.
- Row 3, the computed classification and its reuse: [TICKETS §4 Upward propagation check](TICKETS.md#upward-propagation-check), where triage consumes the classification and a new role repeats no unchanged walk; [TICKETS §7 Recorded judgment and owner-ruling continuity](TICKETS.md#recorded-judgment-and-owner-ruling-continuity), whose C, J and O are this section's annotations; [EXECUTIVE_BASELINE §5 Work result](EXECUTIVE_BASELINE.md#work-result), which references the current classification through its carriers and reconstructs no unchanged C, J or O.
- Row 4, an unknown stays unknown: [TICKETS §4 Upward propagation check](TICKETS.md#upward-propagation-check), where missing or ambiguous evidence leaves the affected treatment unknown and proves no absence of the governing layer.
- Row 5, the consistency gate: [Specification surface rule](#specification-surface-rule), whose span check leaves the gate open while the affected surfaces disagree; otherwise no separate consumer applies: the closure condition the gate applies is [TICKETS §7 Condition-based closure and reuse](TICKETS.md#condition-based-closure-and-reuse)'s, which names this gate as its consumer, and reuse of the gate's evidence is ACTIVATION §7's, as the choice column states.
- Row 6, the sprint boundary and carriers: [TICKETS §1 Sprints](TICKETS.md#sprints), where sprints operate under the boundary this section states, and [§3 Compliance escrow](TICKETS.md#compliance-escrow), where escrow satisfies no closure until paid down, accepted or repriced; [UX §12 UX sprint compliance escrow](UX.md#ux-sprint-compliance-escrow), the profile statement the boundary admits of when escrow suits UX, and the [UX family table](UX.md#foundation-to-law), whose row for scaffold, exemption and escrow imports F11; [PRODUCT_DEFINITION §8](PRODUCT_DEFINITION.md#8-what-how-and-work-carriers), which binds where each carrier kind lives and selects none.
- Row 7, ambiguity governance: [Reconstruction litmus](#reconstruction-litmus), whose sufficiency depends on this governance, and [Operational lifecycle sufficiency](#operational-lifecycle-sufficiency), which carries an unanswered phase as governed debt under it; [§11](#11-build-tenant-binding), rule 2, where this section's admission makes an operation human adjudication, and Application in this method, where a major ambiguity about stack or execution admissibility is recorded and governed here; [ACTIVATION §4](ACTIVATION.md#4-totality-and-refinement), which takes the default ambiguity policy and its risk appetite from this section and owns the hard stops; [ODD §5 Probabilistic compute](ODD.md#probabilistic-compute) and [§11.5B](ODD.md#115b-execution-authority-audit), which bind the F_P and F_H roles to this section's candidate-producer and human-adjudication concepts through declared specialisations; [UX §1 Authority](UX.md#authority), where an ambiguous case fails closed under this section, and the [UX family table](UX.md#foundation-to-law), whose row for UX realisation authority imports F11 for the ambiguity outcomes.
- Row 8, core interface migration: [TICKETS §5 Evaluation criteria and non-closure conditions](TICKETS.md#evaluation-criteria-and-non-closure-conditions), where a deferral follows the path-relative authority and disposition rules of Constitutional migration options, [§6 Declaration and checklist](TICKETS.md#declaration-and-checklist), the local enforcement surface of the migration law, and [Closure of a migration ticket](TICKETS.md#closure-of-a-migration-ticket), where an accepted slice closes no migration; [Requirement categories and classification](#requirement-categories-and-classification), where the old-path classes are declared states; [DESIGN_MODULE §5 Native constructability](DESIGN_MODULE.md#native-constructability-up-002) and [§10 Proxy interface prohibition](DESIGN_MODULE.md#proxy-interface-prohibition), under the Bridge prohibition, [§5 Capability and foundation selection](DESIGN_MODULE.md#capability-and-foundation-selection-up-023), which overrides no strategy presumption of Constitutional migration options, and [Transformation admission completeness](DESIGN_MODULE.md#transformation-admission-completeness-up-016), where a superseded responsibility stays subject to Core interface migration.
- Row 9, inside-out sequencing, hard breaks, proof last and the closure criterion: [TICKETS §4 Inside-out sequencing](TICKETS.md#inside-out-sequencing); [TICKETS §6 Break order and break-to-closure map](TICKETS.md#break-order-and-break-to-closure-map), under the Hard-break discipline, and [Declaration and checklist](TICKETS.md#declaration-and-checklist), the local enforcement surface of the inside-out law; [Live surface immutability](#live-surface-immutability), where a retained transitional responsibility satisfies the retention relation of the Closure criterion; [DESIGN_MODULE §10 Recurrence extraction](DESIGN_MODULE.md#recurrence-extraction), where a superseded responsibility is retired or satisfies that relation.
- Row 10, fundamental migration: [TICKETS §6 Strategy requirements](TICKETS.md#strategy-requirements), where inherited implementation is classified `carry_across`, `redundant` or `rewrite` and unclassified material blocks closure; [Requirement categories and classification](#requirement-categories-and-classification), where the inherited-material classes and the three implementation classifications are declared states; [DESIGN_MODULE §5 Capability and foundation selection](DESIGN_MODULE.md#capability-and-foundation-selection-up-023), which does not choose between bounded evolution and fundamental re-adoption.

Each consumer applies the rule and decides nothing the owning section does
not (P2, P6).

### Universal intake triage

There is one front door for substantive change. The intake label does not
determine the process class: a reported bug, feature request, issue,
regression, operator finding, release blocker or scenario failure all enter
through the same intake triage (P2, P6).

Intake triage determines six things: whether the report represents a
substantive change at all; the affected product boundary and intended
scope; the lawful change class; the lawful re-entry point into the
constitutional chain; the downstream surfaces and evidence that must be
repriced, re-derived or re-proved, a determination whose evidence part is
the selection `S_Δ` over the impact cover `I(Δ)` of the affected surfaces
([FOUNDATIONS §4 Change impact and evidence reuse](FOUNDATIONS.md#change-impact-and-evidence-reuse));
and whether the work remains within the
currently declared release scope or requires repricing of that release
plan. No bug, feature, issue or other intake bypasses this triage by going
straight to code, tests or release handling. The purpose is not a separate
tracking bureaucracy; it is to classify impact correctly so the change
enters the method at the right constitutional boundary.

Triage diagnoses among the four causes of
[ACTIVATION §1 Feedback and diagnosis](ACTIVATION.md#construction-relation),
a defective realisation, an inadequate governing requirement or design, an
inaccurate predictive model, and insufficient observation, and routes each
supported repair to the owner of its cause rather than inferring it from
the intake label; severity and priority follow the policies that
[TICKETS](TICKETS.md) owns; a bug list projects existing work state. This
paragraph applies ACTIVATION §1 Feedback and diagnosis and states no
second relation (P2, P6).

Triage triangulates a failure across the applicable reference frames over
the same subject and basis. Each frame tests candidate diagnoses against
its material workspace variables, governing relations and evidence; their
combined results constrain the supported cause, preserve unresolved
alternatives and uncertainty, and identify the smallest sufficient lawful
scope of repair. The frame that exposes a failure need not contain its
cause. Repeating the same analysis under different frame names supplies no
additional causal evidence. The smallest sufficient applicable frame
configuration is used, under frame applicability and frames in conjunction
(REFERENCE_FRAME §5 and §6). The frames' results combine under the one
[conjunction of results](FOUNDATIONS.md#conjunction-of-results): each
keeps the diagnosis it evaluated as its predicate, a counterexample that
one frame finds survives the join, and a frame planned and not applied
leaves its diagnosis open, never ruled out. Counterexample localisation
applies where required (ASSURANCE). This prescribes no reviewer count and no new
review round; required independence stays intact. A diagnosis grants no
repair effects and does not establish that governing meaning must change: a
candidate may instead need correction under sufficient existing law (P6).

### Change classes

The minimum lawful change classes, each with its re-entry point and the
layers its repricing flows through (P4b, P2):

| Class | Change | Re-enters at | Flows through |
|---|---|---|---|
| `goal_reprice` | current bounded work-wave focus changes | Goals | Intent, Product, Requirements, Design, Code and Evidence where that focus changes deeper constitutional truth |
| `intent_reprice` | directional or scope change | Intent | Product, Requirements, Design, Code, Evidence |
| `product_reprice` | current product realisation changes while directional intent stays stable | Product | Requirements, Design, Code, Evidence |
| `requirement_reprice` | constitutional truth changes while project direction stays stable | Requirements | Design, Code, Evidence |
| `design_reframe` | realisation structure changes while active intent and requirement truth stay stable | Design | Code, Evidence |
| `realization_refactor` | local code, configuration or attribute change with no intended constitutional or structural change | the realised surface only | nothing upstream; it must prove no upstream drift |

Smaller changes may re-enter below Goals only if they explicitly assert
that no upstream constitutional surface is changing. The absence of a
declared change class is process drift. A changed governing relation is
accepted only at its owner; accepting it inside the acting frame is a
violation whatever the size of the delta (ACTIVATION §1).
Triage records the change intent, the class, the re-entry point and when
triage occurred, wherever substantive work begins.
[TICKETS §4](TICKETS.md#change-class) records the class on the carrier.

The change classes are declared states of a change that intake triage
records, not results, and map to no core value. An evaluation that reads
a declared class returns its own core value with its predicate under
[FOUNDATIONS §4 Results](FOUNDATIONS.md#results). A close classification
of [TICKETS §3](TICKETS.md#close-review) that names a layer, such as
`design_reframe`, is a result for its own predicate, mapped there, and
carries the class at which the work re-enters as its domain outcome.
Purpose and material relation: a declared class is never combined as an
evaluation result, so a change classed `realization_refactor` cannot stand
in for a `satisfied` result that no upstream drift occurred (P5, P1).

### Computed classification and treatment

Intake supplies one reusable classification result rather than requiring
each role to reconstruct the same facts (P4b, P6, P1). Three annotations keep the kinds
of determination apart: C denotes reproducible facts and declared rule
application; J denotes residual semantic or materiality judgment; O denotes
a ruling reserved to its actual owner. The annotations grant no authority,
an instance of
[FOUNDATIONS §2 Authority kinds](FOUNDATIONS.md#authority-kinds), What
creates no authority, and introduce no calculus kind, runtime, classifier interface or mandatory
document.

The explicitly selected source, worksite or qualification capability
produces C over the exact request and desired outcome, the known targets
and effects, the operation grant and work lifetime, the product definition
and governing basis, the baseline and the available candidate, the declared
relations, the accepted design and trace bindings, the evidence and the
applicable rules. Its output identifies the producer and procedure
revision, the inputs, the result, the scope, the source routes, the
reproduction relation, the unknowns and the invalidators. A missing
candidate or missing evidence is an input state, not a claim that nothing
changed.

The computed result exposes four things, in this order:

1. Authority traversal. Follow the explicit source, ownership, dependency,
   composition and projection declarations from the affected targets and
   effects. Identify each reached layer and owner, its exact basis and its
   changed, unchanged or unknown relation, the traversed edges and the
   unresolved frontier. Include root, authority and grant changes even when
   public bytes are equal. An absent edge does not prove irrelevance;
   undeclared or semantically uncertain materiality remains J.
2. Public delta. Enumerate the complete relevant serialised member universe
   under its owning declaration and applicable projection, including helper
   and generated dependencies. Report added and removed identities and
   every retained member with changed typed value or bytes, with exact
   before and after values. A rename is removal plus addition unless its
   owner supplies an identity-preserving relation. A missing candidate,
   incomplete enumeration, ambiguous identity or unavailable projection
   leaves the affected delta unknown; membership equality alone proves no
   value equality (P3).
3. Accepted-design coverage. Join changed bytes and relations to explicit
   accepted scope, traces and acceptance evidence. Distinguish covered,
   missing, stale, ambiguous and outside-scope evidence. A filename, listed
   artifact or digest alone establishes no accepted coverage. Current trace
   coverage is a computed fact; residual semantic sufficiency remains J.
4. Rule-determined treatment. Apply only declared rules with sufficient
   input facts, recording their owners, matched predicates and
   consequences. Expose the smallest lawful re-entry, the next action, the
   applicable evidence or assessment, the reserved ruling and the carrier
   lifetime, with any conflict or missing premise still unresolved. A label
   or filename cannot select the route. When rules settle the question, no
   residual judgment is invented.

The values these steps assign, a relation changed, unchanged or unknown,
an identity added, removed or retained with a changed value, and evidence
covered, missing, stale, ambiguous or outside scope, are facts of the
computed result. They are not results of an evaluation and map to no core
value. An evaluation that consumes them returns its own core value with
its predicate under [FOUNDATIONS §4 Results](FOUNDATIONS.md#results), and
an unknown it consumes stays unknown. Purpose and material relation: a
classification fact is never combined as an evaluation result, so
evidence classified covered, or a relation classified unchanged, cannot
stand in for a `satisfied` result (P5, P1).

A public delta or other nonconformance does not itself require changing
the governing contract. If that contract remains sufficient for the
authorised outcome, the candidate is rejected or locally repaired within
its grant. The actual governing owner is re-entered when the explicitly
selected desired outcome requires changed meaning or an applicable
assessment establishes governing insufficiency. C determines that
consequence only from sufficient declared premises; unresolved intended
meaning or necessity is J, and any reserved decision remains O. Candidate
behaviour cannot author its own target law (P6).

Unknown treatment withholds dependent reliance or promotion, not unrelated
authorised work. An existing bounded construction or evidence grant may
permit the cheapest useful discriminator, including obtaining the first
candidate, without asserting that the candidate is conformant; it carries
its own exact subject, territory, operations and stop conditions. The
affected C result is updated before dependent effects or promotion rely on
newly available evidence. A mistaken route is corrected at its smallest
affected owner, preserving the original cause, the attempted subject, the
observed effect state and valid progress. Retry requires the applicable
outcome, authority and safe-recovery conditions; an effect of uncertain
completion (`completion_unknown`, or `not_effected` with its end not
established, under [ACTIVATION §3 Effects](ACTIVATION.md#effects)) cannot
be silently treated
as no effect, and is reconciled as ACTIVATION §5 states before any retry
or dependent action (P5).

A new role, conversation or resumption reuses valid C after checking exact
applicability; reuse and invalidation are
[ACTIVATION §7](ACTIVATION.md#7-closed-result-and-reuse), which this
paragraph applies to C. The material inputs of C, whose change is that
rule's material input change and invalidates the affected claims of C
before reliance, are by name: the request, the candidate, an owner or
root relation, a projection, a design trace or acceptance, a rule
applied, the configuration and the material evidence. A changed basis
and a declared revising observation, that rule's other two
invalidators, invalidate likewise. Predecessor and
successor identities, changed inputs, surviving facts and affected J
dependencies are preserved; the wider frontier is recomputed where
independence is unproved (ACTIVATION §7).
[TICKETS §7](TICKETS.md#recorded-judgment-and-owner-ruling-continuity) owns
the existing carrier and the recorded J and O continuity rules.

### Consistency gate

No gate closes while the affected active surfaces are internally
inconsistent (P6, P4b). For the declared
change span the framework proves that the upstream surface remains
sufficient for the downstream surface, that downstream artifacts do not
contradict active upstream truth, and that tests and qualification prove
the active intended behaviour rather than stale precedent. If that proof is
missing the change remains open even if one local artifact already looks
correct.

The gate closes only under the closure condition that
[TICKETS §7 Condition-based closure and reuse](TICKETS.md#condition-based-closure-and-reuse)
owns, applied here with the obligations declared for the change span as
its required coverage. A material counterexample
to a mandatory constraint, a required judgment or ruling without a closed
result, or an obligation that no evidence addresses keeps the gate from
closing, and each stays recorded by kind (P5, P6). Reuse of the gate's
evidence and results is
[ACTIVATION §7](ACTIVATION.md#7-closed-result-and-reuse); TICKETS §7
records the work state on its carrier. A
review event, a passing aggregate, a completed artifact or a status change
cannot substitute for that conjunction (EVALUATION §5).

When a code and test mismatch appears during ticketed work, implementation
behaviour is evidence but not authority. The mismatch is reconciled through
the admitted ticket, its intake triage, its lawful re-entry point and the
governing requirement, design, module, carrier or closure surface.
[TICKETS §7](TICKETS.md#test-case-authority) defines the ticket-local
test-case authority rule (ASSURANCE §3 states the test authority rule).

### Sprint execution boundary

A sprint is a bounded execution-control surface, not a new layer in the
constitutional chain (P6, P2). It may
batch work, coordinate tickets or iteration entries, price proof cost and
force close review under existing goals, intent, product definition,
requirements and design authority; it does not create, supersede, weaken
or override that authority.

A lawful sprint states at least: the goal or work wave it serves; the
upstream authority surfaces it depends on; the scope it admits; the
product, requirement, design, runtime, data-contract or governance
boundaries it excludes; the change classes it expects to contain; the
local proof or compliance debt, if any, that may be deferred during the
sprint; the closure trigger and closure law; and the paydown or repricing
path for debt discovered at close.

Sprints exist because proof cost is not uniform. For some work, especially
projection-surface and user-interface iteration, proving every micro-change
before the next change can cost more than making the bounded change visible
and correcting it at close. That optimisation is lawful only when the
deferred cost remains local, visible, bounded and repayable. Deferred
compliance inside a sprint is escrow, not acceptance: it satisfies no
method, release or product closure until it is paid down, explicitly
accepted under the governing method, or repriced into the appropriate
upstream surface.

A sprint may be recommended for close when its timebox expires, its
intended scope has been reached, accumulated changed surface area makes
continued iteration more expensive than review, review uncertainty makes
more work unsafe without reconciliation, or discovered gaps suggest the
sprint boundary is no longer the right container. Sprint close is a
forensic reconciliation event, not automatic approval: close review
compares the accumulated work and evidence against the governing
authority, classifies each gap, accepts compliant work, opens paydown work
for local debt, and escalates any authority drift through the lawful
change class. If a sprint discovers a goal, intent, product, requirement,
design, runtime, data-contract, governance or other product-truth change,
the sprint manifest does not authorise landing it; the work is split,
escalated, repriced or carried as explicit paydown.
[TICKETS §3](TICKETS.md#3-sprint-rules) defines the sprint mechanics,
including compliance escrow, and §4 the ticket mechanics; a profile may
define when sprint compliance escrow is an appropriate cost optimisation
for its domain (PROFILES).

### Carriers

The carrier of a work item is selected for its required lifetime: a
durable ticket where the work needs identity across sessions; a
sprint-local entry where its only value is traceability inside a batch; a
run or return record where the work lives and dies with one activation.
The triage fields are required wherever substantive work begins; a ticket
per change is not (P2, P4b; [TICKETS §1](TICKETS.md#1-work-carriers) owns
the carrier model and
[TICKETS §5](TICKETS.md#carrier-selection) the selection of the smallest
lawful carrier).

### Procedures

When any substantive intake arrives (P2, P4b): enter
[Universal intake triage](#universal-intake-triage), keeping classification
unresolved until the evidence supports a lawful class; determine the lawful
re-entry point into the constitutional chain when that class is established; identify the affected downstream span that must
remain consistent; only then treat the work as implementation, repricing or
release-bound change.

When a feature is introduced or changed: update goals if the current
bounded work wave or overriding concerns have changed; update intent if the
purpose or scope has changed; update product if the current product
realisation, terms, boundaries or end-state shape have changed; update
requirements so the invariant truths are explicit as a decomposition of the
product definition, including any lifecycle obligations or named lifecycle
ambiguity gaps, and classify each new or changed requirement by category;
establish or update design so it owns the governing structural HOW, where
under the design profile its decision-completeness rule applies (design,
implementation and tests may co-evolve only when its co-evolution predicate
holds, otherwise the smallest causally closed affected design set is
accepted before retained implementation establishes an unresolved,
contradictory or materially non-equivalent relation;
[DESIGN_MODULE](DESIGN_MODULE.md)), and
where that profile does not apply design, implementation and tests may
co-evolve when upstream truth leaves no unresolved material design
decision, and when such a decision remains the affected design is accepted
before retained implementation establishes it, ADRs being one valid design
form; write scenarios for capability claims that require operational proof
and define other evidence surfaces for non-capability requirements where
appropriate; prefer declarative expression of the problem and acceptance
surface before adding imperative mechanism; check the reconstruction
boundary, whether current goals support current intent, current intent the
current product, current product the intended requirements, current
requirements the intended design, and current design the intended
implementation; record any major ambiguity discovered at the active
boundary and govern it by declared risk appetite rather than silent
convenience; develop code under the selected design relation and reconcile
design, implementation and tests before promotion or closure; use events,
projection and delta to verify whether reality still satisfies the
requirements.

When bootstrapping a project or repricing a requirement surface: resolve
the applicable product definition, verify its exact installed basis, load
its declared bootstrap entrypoint (PRODUCT_DEFINITION §12), then load the
goals surface or the bound equivalent current work-wave carrier; perform
the goals-to-intent step and write or confirm the intent surface; perform
the intent-to-product step and write or confirm the product definition as
the current bridge; gather requirement source material from the relevant
constitutional inputs; perform the product-to-requirements step and write
the resulting live surface under the requirement surface; store
requirements as individual files or grouped families, whichever best
preserves clarity and avoids monolithic sprawl; make the requirement
surface the sole live requirement authority before proceeding to design and
code; prefer declarative structure over procedural workaround while shaping
the new surface; record any major ambiguity that remains at the current
boundary before downstream realisation proceeds; only after that surface
exists should downstream design and implementation be treated as
constitutionally grounded.

When a real use case reveals a gap: enter
[Universal intake triage](#universal-intake-triage) first and keep the
classification unresolved until the evidence supports a lawful change class;
then write the scenario as the first
substantive project artifact for the gap so the pressure becomes concrete
and testable; run gap analysis to locate its cause under
[Universal intake triage](#universal-intake-triage), which keeps open what
the evidence cannot yet separate; then re-enter at the layer the selected
[change class](#change-classes) names and flow forward from it, writing new
goals or intent only where the work wave, direction or scope changes.
The intake source does not change this rule: a bug report, feature request,
failed test case, release blocker or operator observation still enters
through intake triage first, then follows the lawful change class selected
there.

## 5. Ambiguity governance and lifecycle

This member owns the substrate-neutral ambiguity-governance bounded context
`urn:stdo:bounded-context:ambiguity-governance` under the selected complete
basis; a profile's runtime shorthands for its own frames stay in that
profile's context unless an explicit relation imports or translates them
(P3, P1).

Spec-driven development is not only a derivation pipeline; it is a governed
disambiguation pipeline. The upstream chain progressively reduces
ambiguity: goals narrow active priority and work-wave focus; intent narrows
direction and scope; product narrows current realisation shape and terms;
requirements narrow constitutional obligation; build-tenant or stack
choice, a tenant's binding under §11, narrows the executable realisation
class; design narrows structural
interpretation; implementation narrows local realisation detail (P2).

The narrowing is not uniform. Major ambiguity materially changes
architecture, stack, product boundary, execution or deployment
admissibility, public contract shape or other downstream realisation law;
micro ambiguity is a local implementation choice inside an already-governed
design boundary. Major ambiguity is always surfaced and governed; it may
not remain hidden inside informal operator judgment, ambient precedent or
silent model choice. At each major boundary the process detects and
records the major ambiguity that remains or is newly introduced; identifies
the affected invariant, asset or decision boundary; records the decision
taken if work proceeds; and records whether the ambiguity was resolved,
carried forward, escalated or blocked. Those outcomes are `resolved`,
`carried`, `escalated` and `blocked` of
[ACTIVATION §3 Ambiguity outcome](ACTIVATION.md#ambiguity-outcome), which
gives each its core value for the predicate "the declared ambiguity is
resolved on the exact basis". Only `resolved` is `satisfied`, so a later
boundary rests no dependent claim on an ambiguity that is carried,
escalated or blocked as if it were resolved. Ambiguity detection is
mandatory; blocking is policy (P6, P5).

Lawful probabilistic processing
(`urn:stdo:concept:ambiguity-governance:lawful-probabilistic-processing`)
is bounded non-human processing permitted by declared policy to carry or
resolve declared ambiguity. Human adjudication
(`urn:stdo:concept:ambiguity-governance:human-adjudication`) is explicit
human judgment admitted by authority to resolve declared ambiguity where
policy or risk appetite requires it. That admission makes an operation
human adjudication. A person who relays, records or carries out a step
does not adjudicate by doing so, and a person who carries or decides a
declared ambiguity where policy permits it, without that admission, acts
under the policy and recording that govern lawful probabilistic
processing; who performs an operation does not decide its kind (§11, rule
2). The default governance model: ambiguity
may be carried or decided by lawful probabilistic processing when project
policy allows it; it may be escalated to explicit human adjudication when
project policy requires it; the threshold between those actions is
determined by declared risk appetite, not by silent convenience. Projects
may therefore choose different ambiguity-handling policies: a lower risk
appetite escalates more major ambiguity to explicit human judgment; a
higher one permits more bounded probabilistic decision-making. In either
case the ambiguity and the decision are recorded.

The hard stops of [ACTIVATION §4](ACTIVATION.md#4-totality-and-refinement)
hold regardless of risk appetite. The method is therefore not "eliminate
all ambiguity before work"; it is "make ambiguity visible, govern it
explicitly, and reduce it progressively until downstream realisation is
sufficiently constrained".

The operational lifecycle sufficiency rule (§2) is this governance applied
to lifecycle phases: an unanswered phase is a recorded gap, never a silent
absence.

## 6. Lineage and release

Software is recursive and compositional. A released product may build the
next released version of itself, a dependent product, or downstream project
artifacts. The roles are distinct objects with distinct identities,
substrate, development product, source project, release cut, product,
install, artifact and product definition, defined once in FOUNDATIONS §2
(product lineage objects) with their governing rules and the compiler
analogy; the product definition is the source project's present-tense
surface, not the released artifact and not the builder that happens to be
running the build (P3).

The only exact operative release identifier is an immutable release-cut
tag under the selected [RELEASE profile](RELEASE.md#2-release-identities):
an RC cut or an explicit stable cut (P3). That cut is a
point-in-time release identity, a boundary over the feature set accepted
for that cut, and part of release metadata and release-process evaluation;
it is not part of the live project specification. On an RC line the mutable
`v<version>` tag is a discovery selector to the highest published ordinal; it is not an exact dependency, evidence or constitutional
basis and cannot silently change a consumer selection. How an active
constitutional surface uses version labels is the
[§2 Specification surface rule](#specification-surface-rule); shared
realisation surfaces should likewise describe current truth by role,
boundary and status rather than by release-line version labels. Release criteria, immutable
release-cut publication, selector advancement and the process for cutting a
release belong to [RELEASE §2 to §8](RELEASE.md#2-release-identities)
.

Successor baseline conservation is
[RELEASE §9](RELEASE.md#9-successor-baseline-conservation-stdo-up-015)
(P3, P6).

Layer and release separation holds
([AXIOMATIC_CALCULUS §7](AXIOMATIC_CALCULUS.md#ac-020-layer-and-release-separation)):
a calculus, its interpretation of a subject and its carrier encoding keep
independent content identities, judgments, supersession relations and
proof obligations, and none is automatically an independently released
product. One constitutional surface and its version boundary for a project
are
[PRODUCT_DEFINITION §11](PRODUCT_DEFINITION.md#11-one-constitutional-surface-and-version-boundary).

### Shared method adoption and propagation (STDO-UP-012)

A reusable change to this method keeps one authority relation from the
evidence that prompts it to the consumer that realises it (P6, P3):

```text
incident or review evidence
  -> shared-method intake
  -> one owning standard
  -> consistency and independent review
  -> human-authority acceptance
  -> one complete released STDO version
  -> explicit consumer selection
  -> consumer-owned realisation and evidence
```

The chain states authority causality. It prescribes no intake workflow and
no artifact set (P2). An executable tool, runtime, carrier schema or
assurance implementation cannot enter the method merely because it
accompanies a method lesson; it requires its own Product authorisation
(P6). Other standards consume admitted law by reference (P3, P6), and a
consumer selects a complete released version rather than mixing members from different cuts (P3;
the release version boundary above,
[PRODUCT_DEFINITION §4](PRODUCT_DEFINITION.md#4-shared-installed-release-basis-and-toolchain-manager)).

## 7. Migration

### Core interface migration

Core interface changes are not ordinary local patches. Where a change
alters a load-bearing contract, carrier, resolver, provider, projection
law, closure law or other shared interface that multiple surfaces depend
on, the work is handled as a constitutional migration, not as incremental
patching (P3, P6). The governing rule:
change the authoritative core contract first; ban bridge code for that
contract family as an authoritative surface; audit every producer and every
consumer of the impacted interface; migrate each producer and consumer to
the new contract; chase every downstream effect until no superseded closure
law remains; run complete migration-closure proof only after the migration
wave is complete, bounded product-slice proof remaining governed by the
path-relative promotion rule below.

The rule exists because partial interface migration creates recurring
drift: one producer writes the new contract while another still writes the
old; runtime reads one carrier while reporting or topology reads another;
compatibility aliases silently remain authoritative; projections become a
second truth surface; tests go green while the architecture remains split.
Declaring such a state complete is forbidden.

### Constitutional migration options

Core interface and major implementation replacement work has two lawful
constitutional strategies (P3, P6).
Inside-out hard-break migration applies when the project remains on the
same implementation line and the authoritative source truth is being
replaced in place; the work proceeds from the source carrier outward
through a sequence of deliberate breaks and repairs. Fundamental
re-adoption migration applies when the rewrite is major and the project is
intentionally re-deriving itself on a materially different implementation
basis, such as a new runtime model, carrier model, type system, execution
substrate or realisation tree; the prior implementation is moved sideways
and treated as reference material, not live authority.

Where bounded evolution and fundamental re-adoption are both lawful and
feasible, and a working predecessor can reach the admitted product outcome
without retaining competing or ambiguous authority, evolution on the
supported product path is the rebuttable selection presumption. This does
not require continuing an unsafe or constitutionally inadmissible
predecessor path; it conserves accepted predecessor semantics and product
feedback, and it does not require preserving an internal implementation or
public mechanism that product authority explicitly supersedes. When bounded
evolution includes a core-interface migration, it uses the inside-out
hard-break strategy; bounded evolution is a strategy-selection presumption,
not a third strategy.

Fundamental re-adoption requires explicit selection by the human authority
owning the affected product boundary. The selection compares re-adoption
with bounded evolution across product value, feedback latency, authority
risk, reversibility, total cost and retained predecessor semantics, and
states a bounded abort or re-entry condition. Implementation scale or
architectural preference alone does not select re-adoption (P6, P2).

Both strategies share these non-negotiable rules: no proxy interface
partial implementation stands in for the new contract in any acceptance
path; no bridge or fallback path remains silently authoritative; promotion
of an affected product outcome requires one unambiguous authoritative path
for that outcome; competing or ambiguous executable authority on the
promoted acceptance path blocks that outcome; residual material from the
superseded interface family outside the promoted path may be deferred only
when it is explicitly non-authoritative for the promoted outcome or governs
an explicitly specified, disjoint product or compatibility scope with
deterministic routing, cannot falsify current or retained product claims,
and retains a bounded migration, qualification or release disposition;
tests are leak detectors and proof surfaces, not the migration plan.

For this rule the affected acceptance path is the full causal closure of
the outcome: every admitted entrypoint, producer, consumer, resolver,
fallback, shared state surface, event, projection and proof surface capable
of changing, interpreting or closing the outcome. Singular authority means
one governing authority across that closure, not one selected successful
trace. If the same request, fact, identity, state or projection is
admissible to old and new authority, authority is competing and promotion
blocks (P3).

Product-slice promotion and complete migration closure are distinct claims.
An intermediate product outcome may be promoted while its enclosing
migration remains open only when the outcome's acceptance path has singular
authority and the residual implementation satisfies the deferment rule
above. That promotion neither closes the migration nor waives its final
retirement criteria. The slice's identity and acceptance criteria derive
from the product plus every causally applicable live requirement, accepted
design relation and retained predecessor claim; ticket or review wording
cannot narrow that authority away. Active migration status does not renew
an accepted slice's exhausted growth authority: work that only discharges
already admitted removal, demotion and migration-closure proof obligations
may continue within that existing bound without claiming further product
progress; further material producer or consumer growth requires another
still-live basis admitted under §3, and ticket activity alone is not that
basis.

### What counts as a core interface

A core interface is any shared contract or carrier that materially governs
runtime closure, reporting or status truth, topology or frame progression,
proof or qualification outcome, event or projection semantics, identity or
binding resolution, or provider or resolver behaviour. If changing the
interface can alter how multiple surfaces decide what is true now, it is a
core interface change (P3).

### Required migration protocol

Every core interface migration explicitly declares: the exact affected
migration scope; every explicitly excluded or disjoint product or
compatibility scope and its deterministic routing relation; the new
authoritative contract; the superseded contract or surface; the
authoritative closure law for the new contract; the full set of producers
of the old and new contract; the full set of consumers of the old and new
contract; and every projection, report, status surface and proof surface
that derives from it. Every old path is then classified as `remove`,
`replace`, `re-authorize` or `temporary scaffolding`. Temporary scaffolding
is lawful only if it is explicitly non-authoritative and scheduled for
removal before closure (P6, P4b).

### Bridge prohibition

For a core interface migration: no compatibility alias remains
authoritative; no fallback identity law remains as silent runtime
behaviour; no bridge path participates in acceptance as if it were the new
contract; no old reader or writer remains authoritative for the promoted
outcome once the new contract governs that outcome; no proxy or partial
implementation of the new interface stands between old and new truth as if
it were completion. The only lawful exception is an explicit compatibility
feature retained as part of the live product, whose compatibility path is
intentionally specified, explicitly bounded, and clearly identified as
compatibility rather than current native truth (P3, P6).

### Projection discipline

Projections, reports, status views and topology views may reflect the
authoritative carrier; they do not become a second closure surface (P6,
P1). If runtime, reporting, topology and proof
can disagree about closure because they consume different carriers or
different closure laws, the migration is incomplete; if a projection can
independently close while the authoritative carrier is still open, the
migration is incomplete; if the authoritative carrier can close while a
projection still depends on an older law, the migration is incomplete.

### Inside-out first sequencing

Inside-out hard-break migrations proceed from the new authoritative source
carrier outward (P4b, P6). The full
best-guess interface family is discovered before proof is used as closure
evidence, including producers, consumers, projections, prompts, reports,
wrappers, replay paths, ingest paths, bootstrap paths and proof surfaces.
Authoritative producer and source-carrier work comes before downstream
consumer, projection, prompt, dossier, report or review-surface hardening.
Downstream exploration may exist only as isolated non-authoritative work
and does not land in public runtime, projection, prompt, report or proof
entry points until the source carrier is published and admitted. A
downstream projection ticket does not close while the source-carrier
ticket it depends on is still open. Dependency direction reflects this
order explicitly so the ticket set exposes the migration wave from source
truth to downstream read models.

### Hard-break discipline

Inside-out migration is a hard-break sequence over one interface family.
The migration wave is the ordered set of those breaks; it is not a separate
mode that permits competing or ambiguous dual truth over the same request,
fact, identity, state or projection. Explicitly specified, deterministically
routed, non-overlapping product or compatibility scopes may coexist while
the enclosing migration remains open (P3).

For each break: publish or admit the new deepest authoritative source
carrier; deliberately sever one old authoritative seam; keep that seam
broken; repair outward from source truth to consumers, then projections,
then prompts and reports, then proof surfaces; run negative proof that the
severed seam is rejected rather than merely unused. During the sequence,
tests may discover missed interfaces but do not replace the required
interface inventory; newly discovered affected interfaces remain part of
the same migration wave unless the work is explicitly repriced upward;
re-enabling the old seam through wrappers, fallbacks, projections or prompt
paths is a migration defect.

### Proof-last rule

Complete migration-closure proof is not valid while producers and
consumers are split across old and new contracts. Bounded product-slice
proof may establish only the exact intermediate outcome permitted by the
path-relative promotion rule; it cannot establish migration closure (P6). Tests that pass only
because bridge-state semantics remain alive do not count as closure proof;
green local tests do not overrule a split architecture; migration-closure
proof belongs after migration, not during a partially migrated state;
per-break proof shows the severed old seam is rejected or fails closed
before downstream hardening can count as progress.

### Closure criterion

A core interface migration is complete across its declared affected scope
only when every authoritative producer writes the new contract; every
authoritative consumer reads the new contract; superseded authoritative
paths are retired unless justified for a distinct supported responsibility
under the retention relation below; projections are downstream of the same
authoritative truth rather than competing truth surfaces; runtime,
reporting, topology and proof share one closure law; and no temporary
scaffolding remains in the acceptance path. Until those conditions hold the
work remains an active migration wave, not a completed refactor (P3, P6).

Retention bears the burden. Each retained superseded mechanism identifies a
current supported obligation, owner, purpose, execution scope and material
cost. Temporary compatibility or comparison work has an expiry or removal
trigger; existing tests, an oracle label or nominal demotion do not justify
duplicate production responsibility. A required cold reconstruction route
or independent test oracle may serve an enduring distinct obligation
without an invented expiry. Where an obligation survives replacement, its
surviving owner is identified; where it has no governing basis, no
replacement guard is required. Retirement inside a closed affected cone
does not await unrelated whole-product closure (P2).

An accepted intermediate product slice within the wave names the slice it
closes and keeps the enclosing migration visibly open; it does not project
slice acceptance as migration, qualification or release closure.

### Fundamental migration

A fundamental migration is a constitutional reset, not an in-place
refactor. It applies when a project intentionally abandons a prior
constitutional shape and re-derives itself on a new branch, version line or
methodology basis (P3, P6). In that case:
inherited constitutional documents from the prior line become migration
source material, not live authority in the new line; it is lawful to zero
inherited constitutional surfaces on the migration line and rebuild them
from first principles; nothing carries forward by default, and every
retained statement, requirement, design choice or guide rule must be
explicitly re-adopted; every carry-forward is intentional and should land in the
correct layer, goals, intent, product, requirements, design, guide or template; old
design and code may be used as reference implementations but do not govern
the new constitutional surface unless explicitly re-derived and re-adopted;
absence from the new constitutional surface means not yet adopted and
carries no automatic authority from the prior line; the prior
implementation may be moved sideways as a reference line, and that sideways
line has no live implementation authority in the new line; every inherited
module, interface, carrier, projection and proof surface is explicitly
classified before reuse.

The required implementation classifications are `carry_across` (the module
remains materially the same and is intentionally re-adopted into the new
line), `redundant` (no longer needed in the new line) and `rewrite`
(still needed but rebuilt under the new requirements and design).
Unclassified inherited implementation is a defect. The purpose is to
prevent accidental law from leaking through migration by mere inheritance:
fundamental migration is controlled adoption, not passive preservation.

Performing a fundamental migration: declare the migration line and treat
the prior line as source material; establish fresh constitutional surfaces
for method, goals, intent, product, requirements and design; move the
prior implementation sideways if needed so it cannot continue as ambient
live authority; classify inherited constitutional material as adopted,
superseded, deferred or orphaned; classify inherited implementation
material as `carry_across`, `redundant` or `rewrite`; copy forward only
what is intentionally retained; re-derive downstream design and code from
the new constitutional surfaces, not from ambient precedent. In a
fundamental migration `carry_across` does not mean automatic copy-forward
but explicit re-adoption under the new line; direct runtime, projection,
prompt, proof or review dependence on the sideways implementation line is
bridge debt; proxy interfaces that partially imitate the target line while
still depending on the sideways line are not lawful closure. This is a
lawful form of supersession, not a violation of live surface immutability
(§2), because the new line creates a new constitutional surface rather than
silently mutating the old one.

The four classes of inherited constitutional material record the
adoption decision the new line takes on each inherited statement. For an
inherited requirement, the legacy classifications of
[§2 Requirement categories and classification](#requirement-categories-and-classification)
record a different thing: the standing of a requirement that is in the
live surface. The two relate as follows, and are not one classification:
- an adopted requirement enters the live surface as Active, or as Deferred
  when it is adopted as an explicitly not-yet-operative obligation;
- a requirement whose adoption is deferred is not in the live surface: it
  has no legacy classification and no authority until it is adopted,
  because absence from the new surface means "not yet adopted";
- a superseded or orphaned inherited requirement takes Superseded or
  Orphaned, with that table's meanings.

For other inherited
constitutional material the classes keep their names and the steps
above. They are declared states of the new line's surfaces and, as §2
states, none of them is or supplies the
[RELEASE §9](RELEASE.md#9-successor-baseline-conservation-stdo-up-015)
disposition of a predecessor claim (P3, P6). Purpose and material
relation: an inherited requirement in a migration falls under both this
step and the legacy classification rule, and stating how the two records
relate leaves no two records of one standing to reconcile (P3).

### Transformation wave

Refactor and migration should be understood as a transformation wave over
mutable
implementation surfaces (P3, P6). While
the wave is in flight: temporary mixed-state implementation may exist only
below the current break boundary and only as explicitly non-authoritative
plumbing; transitional adapters or scaffolds may exist only when they are
named, bounded and outside the acceptance path; refactor state may still
carry traces of the prior operative model, never as competing or ambiguous
dual authority over the same request, fact, identity, state or projection.
Explicitly specified, deterministically routed, non-overlapping product or
compatibility scopes are not competing authority under this rule; they may
coexist while the enclosing migration remains visibly open.

When the wave lands across its declared affected scope: only the new
current operative surface remains live for that scope; prior operative
paths for that scope are erased from the live product; the path taken to
get there survives only in version control, event history and superseded
records; mixed old and new operative models are not a stable end state. The
only lawful exception is an explicit compatibility feature, which is named
as current product behaviour, justified in the specification, bounded in
scope and tested as an intentional feature. Otherwise the correct action is
deletion, not passive preservation.

## 8. Bounded execution in this method

Construction delegated to a probabilistic or agentic worker is governed as
the step of ACTIVATION: the execution relation from accepted governing
basis through bounded affected relation set, selected computational
relations, delegated execution and decision authority, construction and
self-review, independent live-surface assessment where required, one of
accept, local repair, re-enter or reject, the exact accepted checkpoint,
and the next already-authorised bounded action (ACTIVATION §1, §3, §5 and
§7). The
construction relation that the step serves, from the bound current state
to the destination through a selected strategy, feedback and the distinct
claims of preservation, progress and completion, is
[ACTIVATION §1 Construction relation](ACTIVATION.md#construction-relation);
this member applies it to delivery and correction (§4) and states no
second relation (P6). The
step states its results in the core of
[FOUNDATIONS §4 Results](FOUNDATIONS.md#results) through the refinements
of [ACTIVATION §3](ACTIVATION.md#3-step-results-and-disposition): that a
candidate is available, how each assessment of it came out, and the
decision owner's disposition (`accept`, `local_repair`, `re_enter` or
`reject`) are separate results, so a candidate that is available or
assessed is not thereby accepted (P6). The selected computational relations
are drawn from the computational calculus of the tenant doing the work;
the actors, tools and processes that carry out the step belong to that
tenant's execution environment, and the step's time, spend and other
resource limits are those of its execution binding (§11). The
declared work boundary of a probabilistic unit is FOUNDATIONS §2 (work
boundary) and §3 (P0); the complete enclosing-relation admission of a
material transition and its standing structural qualification are
ACTIVATION §4; proportionality is ACTIVATION §6. This member binds the
generic terms to its own: the selected outcome of a step is the product
outcome, prerequisite or experiment of §3; the owning relations are the
chain's layers; the re-entry conditions are the change classes of §4.

Delivery priority applies the proportionality relation to the current
product outcome, likelihood, impact, reversibility, dependency and the cost
of delayed product feedback. Probability informs lawful priority; it does
not waive authority, integrity, safety, retained release claims or another
hard stop. A probability stated for priority is a quantified claim under
[FOUNDATIONS §4 Quantified assurance](FOUNDATIONS.md#quantified-assurance);
unsupported numeric confidence stays unresolved (P6). The default priority is work that exposes or advances the
smallest supported product path and its highest-value likely failures.
Defensive or prerequisite work that displaces that path identifies the
affected claim, evidence basis, bounded effort, return condition and
expected product consequence. This is a priority relation, not a fixed
global execution sequence or a scheduling runtime (P2, P0).

Which frames carry construction, assessment and disposition, and which
consumer receives a step's return, is set by the configuration that
[ACTIVATION §1 Configuration](ACTIVATION.md#configuration) derives from the
task's operations, dependencies, actor capabilities and required
assurance; this member adds no role inventory, coordinator or sequence. A
step's return goes to the consumer the configuration declares. Where the
configuration has a coordinator, the coordinator decides as
[ACTIVATION §1 Configuration](ACTIVATION.md#configuration), Coordination
across tasks, states, within its decision grant, and selects the next
authorised action. The executive configuration, with its Executive,
Worker and Reviewer frames, is one such configuration; the executive
baseline profile owns it, and it governs where it is selected
([EXECUTIVE_BASELINE](EXECUTIVE_BASELINE.md)) (P0, P6).

Delivery is sequenced around the smallest real path from a supported entry
to a material outcome, established early and widened by increments chosen
for consequential uncertainty, interface reach and failure impact; a
passing path establishes only the relations it exercised. This is a
sequencing heuristic for any realisation, not law; the baseline's
steel-thread delivery governs its profile unchanged (P2).

## 9. Evidence

The rules that govern how constitutional claims are proved in practice are
tier-1 law: proof target identity and adequacy (EVALUATION §1); semantic,
evidence and projection separation (EVALUATION §2); assurance-boundary
congruence and method qualification (EVALUATION §1, §3, §6 and §7).
Verification layers, the testing strategy taxonomy with fixture and proof
portability, test authority, scenario bundles, installed development proof
and significant path coverage are ASSURANCE §1 to §6 (P6).

For a realisation claim, the evidence that the closure condition of
[TICKETS §7 Condition-based closure and reuse](TICKETS.md#condition-based-closure-and-reuse)
requires includes an authority trace, realisation proof, negative proof
where drift is plausible, and a present-tense statement of the residual
open pressure; this section adds no second closure condition (P6, P4b,
P5).

## 10. Design records

Each ADR explicitly includes `Status:` (`active`, `superseded` or
`retired`); `Implements:` (the requirement identifiers the ADR makes true);
`Derives from:` (the intent identifier or strategy document that motivated
the decision); `Supersedes:` (the prior ADR or doctrine it replaces);
`Superseded by:` (the successor ADR when its status is superseded); and
`Retained special case:` (when earlier behaviour is intentionally retained
as a special case of the current surface) (P6, P4b).
ADRs are written per decision boundary, not per requirement file; the
boundary is the question "what design choice makes these acceptance
criteria true". If a requirement names an operational mechanism, the ADR
names that mechanism too. If a requirement expands the event taxonomy, the
event-contract ADR is repriced immediately; event semantics do not drift
into a second constitution.

ADRs are append-only history. When a later ADR supersedes one, the earlier
ADR stays in place with `Status: superseded` and `Superseded by:` naming
its successor; a superseded ADR is deleted only when it is explicitly
retired. When the scope of a shared or cross-tenant ADR narrows during
implementation to one tenant, the ADR moves to that tenant's design
surface and the move is recorded in the supersession chain (P4b, P3). This
section owns ADR lifecycle and location; templates project its rules.

ADRs are stored at the design surface that owns the decision; an `adrs/`
subdirectory is the default scaffold, not a mandatory location (P3). Tenant-local build-tenant ADRs go to the
applicable tenant design surface bound by the product definition, by
default `build_tenants/<tenant-path>/design/adrs/`; shared or cross-tenant
ADRs to the applicable common surface, by default
`build_tenants/common/design/adrs/`; non-tenanted or project-local ADRs to
`<governing-design-surface>/adrs/`. In the default scaffold `<tenant-path>`
is one or more path segments beneath `build_tenants/`; both
capability-oriented `<product-family>/<realization-variant>` paths and
single-label `<realization-variant>` paths are lawful, the former is the
recommended default, existing or alternative layouts remain conformant and
need no migration, and in every layout the product's tenant registry entry
records the tenant identity and locations used (PRODUCT_DEFINITION §1).
The governing design surface is the closest design surface whose authority
owns the decision. ADRs are not placed in comments, generated views,
runtime archives or requirement folders. The filename convention is
`ADR-<local-id>-short-slug.md`, the local identifier unique within the
owning `adrs/` directory; numeric identifiers such as `ADR-001-...` are the
default, and namespace-prefixed identifiers such as `ADR-GM-005-...` are
allowed when the owning design surface already uses them. A `REGISTRY.md`
index alongside the ADR files is recommended for tooling and review and is
not required: the constitutional source remains each ADR file, and a
registry is a read model that may drift unless tooling maintains it.

## 11. Build-tenant binding

This section owns the relation between a product's WHAT and the build
tenants that realise it: what a tenant binds, what stays fixed while it
chooses, and what its evidence shows. It applies to every product built
with this method (P2, P1, P6).

Terms used in this section:

- A build tenant is one independent, project-owned HOW realisation of a
  product's WHAT. The build-tenancy context of
  [PRODUCT_DEFINITION §8](PRODUCT_DEFINITION.md#8-what-how-and-work-carriers)
  names it, and the product definition's tenant registry locates each one.
- The requirements calculus of a product is the set of obligations its
  WHAT states, the outcomes it permits, and its rules for refining and
  composing the work that realises it.
- A computational calculus is a declared set of executable operations,
  with the laws by which they compose, the transformations they permit,
  and their effects and resource behaviour, as far as these are material
  to the obligations.
- An execution environment is the concrete means that performs those
  operations: a technology stack; a human process, made of people, roles,
  documents, communication channels and decision procedures; or a
  combination of the two.
- A tenant's build-tenant binding has two parts: its calculus binding,
  from the requirements calculus to its computational calculus, and its
  execution binding, from that computational calculus to its execution
  environment. A tenant's registry entry locates the tenant; it is not the
  binding.
- A generic procedure is a method procedure whose scope is independent of
  the selected execution environment. It and its projections preserve the
  bindings Rule 2 permits: code, an event stream or reconstruction from a
  complete history is required only where the governing obligations or
  the selected execution binding require it, and an adequate human
  process using current records and direct observation is a permitted
  execution binding of a generic procedure that requires none of them
  (P1, P6).
- Author identity and actor identity are as
  [EVALUATION §3](EVALUATION.md#3-independent-assessment) defines them:
  authorship is one condition of an assessment's independence there, and
  an actor's identity is not an authority.
  Operation kind is what an operation does, such as construct, assess,
  relay, record, measure or decide, together with the authority that kind
  of operation requires.

The common deterministic functor kind is a separate coordinate owned by
[AXIOMATIC_CALCULUS §5](AXIOMATIC_CALCULUS.md#5-traversals-and-functor-kinds).
A binding that claims F_D establishes the common kind's total-domain contract.
It retains the operation's subject, evidence and effect permissions. Human,
machine and mixed bindings preserve these same distinctions; no runtime,
event log or annotation carrier follows from the classification.

Rules:

1. Realisations of one WHAT. One WHAT is realised by one or more
   independent build tenants, whatever the physical layout. The WHAT is
   constitutional and each tenant's realisation is HOW; a tenant-local
   realisation stays derivative until its governing truth is ratified in
   specification (§2). Each tenant binds the product's requirements
   calculus to a declared computational calculus and binds that calculus
   to a concrete execution environment. Both bindings are that tenant's
   design and realisation: they are declared in its existing design and
   realisation surfaces, chosen under the Design rule (§2) and recorded as
   design decisions (§10), and the method requires no further carrier. The
   tenant owns its binding, its realisation and their evidence; the WHAT
   keeps its meaning (P2, P6).
2. Selection. The execution environment may be a technology stack, a
   human process or a combination. Its selection stays within the
   requirements calculus, including every human decision that calculus
   requires: no choice of environment removes a required human decision or
   a required independent assessment. Author identity, actor identity and
   operation kind stay distinct, and none determines another. Who authored
   a tenant does not select its environment; one actor may perform
   operations of several kinds, each under its own grant; and an actor's
   identity neither decides the kind of an operation nor grants authority
   for it. A person performing an operation does not by that make it human
   adjudication: §5 states the admission that makes an operation human
   adjudication and how a person who decides under policy without it is
   governed. The same holds for every decision the requirements reserve to
   a human: the person the governing authority admits for it takes it, and
   a person's part elsewhere in the process does not (P6, P1).
3. Material content. For the obligations it serves, the binding
   identifies:
   - the operations, each with its inputs, outputs, effects and outcome
     values; each outcome value maps to exactly one core value under
     [FOUNDATIONS §4 Results](FOUNDATIONS.md#results), and an intended
     external effect, one of uncertain completion included, is recorded as
     [ACTIVATION §3 Effects](ACTIVATION.md#effects) states;
   - the composition laws, and the transformations the calculus permits;
   - the resource measures;
   - the operational assumptions on which conformance depends, among them
     those about actors, tools, availability and failure.

   Human effort, elapsed time, communication and machine resources are
   measured where a selected obligation needs them. Each measure states its
   unit and its boundary: what is counted, and where measurement starts and
   stops. A resource claim without its unit or its boundary supports no
   conformance claim. The size of a selected context is measured as
   [ACTIVATION §2](ACTIVATION.md#2-context-construction-under-an-envelope)
   step 3 measures it, against the capacity the binding declares for the
   actor. The law for declaring, measuring and honouring resource limits
   is [ACTIVATION §6 Resource limits](ACTIVATION.md#resource-limits), and
   this rule binds it: the values of a step's time, spend and other
   resource limits, and the units and boundaries the environment can
   measure, are those of the execution binding, stated before the
   activation they limit. Where a configuration states its resource limits
   and its assumptions about failure
   ([ACTIVATION §1 Configuration](ACTIVATION.md#configuration)), it takes
   them from this binding (P0, P2, P5).
4. Conformance evidence. The obligations of the requirements calculus
   decide fitness; the kind of executor alone neither accepts nor rejects a
   realisation. Evidence establishes how the bound realisation satisfies
   the required meaning and constraints, including the applicable
   authority, independence, failure and recovery conditions. Conformance is
   judged under
   [EVALUATION §6](EVALUATION.md#6-conformance-of-realisations), and two
   conforming tenants need not behave identically outside the contract.
   Each assessment returns a core value for its predicate, and the tenant's
   conformance is their
   [conjunction](FOUNDATIONS.md#conjunction-of-results), with the
   obligations of the requirements calculus as its required coverage. A
   convenient stack never weakens an obligation. An execution plan that
   merges two required independent assessments, or substitutes an
   automated result for a required human decision, is a counterexample to
   the obligation it weakens, so the binding's conformance for that
   obligation is `falsified`; in any run under such a plan the lost
   assessment or decision has no applicable closed result. Matching
   outputs, lower cost or a faster run do not discharge the lost
   independence or authority. A claim that a binding preserves categorical
   structure is a further claim: it meets the Formal fragment of
   [FOUNDATIONS §4](FOUNDATIONS.md#4-algebra) and stays distinct from
   conformance on the equivalence ladder of EVALUATION §6 (P6, P1, P4b).
5. Reuse. A computational calculus may be reused across tenants and
   execution environments wherever each binding satisfies its laws, and
   each binding shows that it does. A different language, tool, team or
   person does not by itself require a different calculus: replacing the
   executor of an operation while the calculus's laws hold changes the
   execution binding, not the calculus (P1, P4a).
6. Representation. A representation of the requirements calculus or of a
   binding in a_c, the axiomatic calculus of
   [AXIOMATIC_CALCULUS](AXIOMATIC_CALCULUS.md), prescribes no executor and
   does not establish execution conformance by structural validation alone
   ([AC-018](AXIOMATIC_CALCULUS.md#ac-018-structural-and-semantic-separation)).
   An a_c model of a human process that passes structural validation
   neither selects an automated executor nor shows that the process meets
   its requirements; execution conformance needs its own evidence under
   rule 4 (P1, P6).
7. Three accounts. The algorithmic, informational and computational
   accounts of a construction, which
   [FOUNDATIONS §2 Accounts of a construction](FOUNDATIONS.md#accounts-of-a-construction)
   defines, apply across the binding, from the requirements calculus
   through the computational calculus to the execution environment. The
   binding keeps the three accounts apart. A mapping from one account to
   another is a transformation: what it preserves, the law that licenses
   it, and whether it is exact or approximate with its adequacy relation
   and end-to-end bound, are stated and discharged under
   [ACTIVATION §4 Refinement](ACTIVATION.md#refinement), and where it is
   recorded in a_c its record is
   [AC-013](AXIOMATIC_CALCULUS.md#ac-013-transformation). The binding adds
   only which accounts the mapping joins and the evidence, in its
   execution environment, that discharges the preservation (P1, P0, P4a,
   P6).

Application in this method. The relation governs realisation at four
points. The Design rule (§2) places the choice of stack, human process or
combination in design, and that choice is the execution binding.
Ambiguity governance (§5) treats the choice as the step that narrows the
executable realisation class, so a major ambiguity about stack or
execution admissibility is recorded and governed there. A change to a
binding enters through intake triage and takes its change class (§4); a
change that needs a weaker obligation is a change to the WHAT at its
owning layer, never a tenant's choice. The steps of construction (§8) are
carried out under the binding of the tenant doing the work (P2, P6).

Development of several tenants. How a source project keeps its tenants'
work apart and merges it, including branches, working copies, territories,
review points and the merge rule, is that project's own law, bound in its
product definition as local axioms
([PRODUCT_DEFINITION §6](PRODUCT_DEFINITION.md#6-local-constitutional-binding))
or chosen in a tenant's design. This method prescribes none of these
mechanics. What it does prescribe for several tenants, the independence
of each tenant's ticket lifecycle and the review of each tenant's
tickets, is
[TICKETS §4](TICKETS.md#multi-build-tenant-independence) and
[§6 Multi-build-tenant review](TICKETS.md#multi-build-tenant-review)
(P6, P0).

Purpose and material relation: the same obligations can be realised by
different means, software, people or both. The tenant owns its choice of
means and the evidence for it while the WHAT keeps its meaning, so a
particular stack never becomes method machinery and a human or mixed
process needs no parallel method. The material relation is whether the
kind of executor, a person's participation, a tool's convenience or a
structural validation can change what satisfies an obligation, or grant
authority (P2, P1, P6). The constitutional chain requires one WHAT
realised by one or more independent tenants whatever the layout, with
tenant-local realisation derivative until ratified (rule 1). Rule 4 applies
[EVALUATION §6](EVALUATION.md#6-conformance-of-realisations): conforming
tenants need not behave identically outside the contract.

