# GLOSSARY

Guide. A non-deciding locator index from indexed spellings to the clauses
of this corpus that declare their bounded contexts and own their concepts.
It realises the glossary that
[PRODUCT_DEFINITION §5](PRODUCT_DEFINITION.md#5-bounded-context-semantic-resolution)
names and adds nothing to that law. Every clause names the principle that
requires it (P0 to P6, FOUNDATIONS §3).

## 1. Index contract

This member contains no semantic definition. It declares no bounded
context, concept, import, translation, equivalence, disambiguation or
authority. It is a non-deciding index into the clauses that own those
meanings in the selected complete STDO basis (P6, P1).

Each row records an indexed spelling, the bounded-context identity
declared by the cited owning clause, and the exact owning concept clause.
§17 uses a second row form for a label that several clauses use: the
label, a locator naming where that use occurs, and the owning clause. The
locator only says where to look; it defines nothing and declares no
context, which the owning clause supplies;
§2 states how a row records a concept that a context holds by import, and
a concept whose member declares no bounded context for it.
The owning clause together with the selected basis identifies the candidate meaning;
the occurrence being resolved still supplies its own governed scope (P1,
P3). A row whose context or owning clause does not resolve is invalid, and
this index cannot repair it (P5, P6).

Repeated spellings in different rows are intentional. Equal spelling,
nearness in this index, a heading, or inclusion in this member creates no
identity, inheritance, import, equivalence or authority (P1, P3, P6).
Resolution follows
[PRODUCT_DEFINITION §5](PRODUCT_DEFINITION.md#5-bounded-context-semantic-resolution);
this index supplies no fallback decision (P1, P5).

## 2. Locator law

Every locus is an owning clause within this corpus (P6, P3). Each
section names the clause that declares its context. A row's owning concept
clause is the section that defines the concept. Where that section's
member declares the row's context, the clause declares the row's
bounded-context identity and owns the concept, in its own text or through
the context-ownership statement of its own member (P6, P1). Where a
context holds a concept that another member defines, by an import
declaration or by an owner relation that the context's declaring member
states
([FOUNDATIONS §2 Imports between members](FOUNDATIONS.md#imports-between-members)),
the row cites the defining section as owning concept clause and names the
declaration or owner relation in its relation clause (P1, P3). Otherwise
the relation clause, where given, points to a clause that relates the
concept to another member or context; the index states no relation itself
(P1, P6).

A concept defined outside every bounded context its member declares has
that member as its source context
([FOUNDATIONS §2 Imports between members](FOUNDATIONS.md#imports-between-members)).
§16 indexes those concepts with the member in place of a bounded-context
identity. Such a row declares no context, and a context holds one of those
concepts only by its own import (P1, P3).

A term without such an owning clause is not a valid row under §1, and
this index carries no such row (P5, P6).

Index watch. A derived surface or projected frame that relies on this
index to locate meaning watches it through the index's path and digest,
recorded separately from the deciding sources it was derived from. Locator
drift in this index then makes that surface or frame stale
([PRODUCT_DEFINITION §11](PRODUCT_DEFINITION.md#11-one-constitutional-surface-and-version-boundary),
staleness binding), and the watch does not make this index an owner of
meaning (P3, P6).

## 3. Method identity

Context declared by
[SPEC_METHOD §1 Method identity](SPEC_METHOD.md#method-identity) (P3).

| Indexed term | Bounded-context identity | Owning concept clause | Relation clause |
|---|---|---|---|
| `STDO` | `urn:stdo:bounded-context:method-identity` | [`SPEC_METHOD.md#method-identity`](SPEC_METHOD.md#method-identity) | none |
| `O` pillar symbol | `urn:stdo:bounded-context:method-identity` | [`SPEC_METHOD.md#method-identity`](SPEC_METHOD.md#method-identity) | [`ODD.md#1-position`](ODD.md#1-position) |

## 4. Axiomatic calculus

Context declared by
[AXIOMATIC_CALCULUS §1](AXIOMATIC_CALCULUS.md#1-position) (P3).

| Indexed term | Bounded-context identity | Owning concept clause | Relation clause |
|---|---|---|---|
| `a_c`; `Axiomatic Calculus`; `STDO Axiomatic Calculus for Governed Symbolic Systems` | `urn:stdo:bounded-context:axiomatic-calculus` | [`AXIOMATIC_CALCULUS.md#1-position`](AXIOMATIC_CALCULUS.md#1-position) | none |
| `a_c Signature` | `urn:stdo:bounded-context:axiomatic-calculus` | [`AXIOMATIC_CALCULUS.md#2-signature`](AXIOMATIC_CALCULUS.md#2-signature) | none |
| `a_c Model` | `urn:stdo:bounded-context:axiomatic-calculus` | [`AXIOMATIC_CALCULUS.md#2-signature`](AXIOMATIC_CALCULUS.md#2-signature) | [`AXIOMATIC_CALCULUS.md#6-interpretation-and-models`](AXIOMATIC_CALCULUS.md#6-interpretation-and-models) |
| `Semantic Object` | `urn:stdo:bounded-context:axiomatic-calculus` | [`AXIOMATIC_CALCULUS.md#semantic-object`](AXIOMATIC_CALCULUS.md#semantic-object) | none |
| `Typed Relation` | `urn:stdo:bounded-context:axiomatic-calculus` | [`AXIOMATIC_CALCULUS.md#typed-relation`](AXIOMATIC_CALCULUS.md#typed-relation) | none |
| `Constraint` | `urn:stdo:bounded-context:axiomatic-calculus` | [`AXIOMATIC_CALCULUS.md#constraint`](AXIOMATIC_CALCULUS.md#constraint) | none |
| `Latitude` | `urn:stdo:bounded-context:axiomatic-calculus` | [`AXIOMATIC_CALCULUS.md#latitude`](AXIOMATIC_CALCULUS.md#latitude) | none |
| `Residual` | `urn:stdo:bounded-context:axiomatic-calculus` | [`AXIOMATIC_CALCULUS.md#residual`](AXIOMATIC_CALCULUS.md#residual) | none |
| `Judgment` | `urn:stdo:bounded-context:axiomatic-calculus` | [`AXIOMATIC_CALCULUS.md#ac-014-judgment-separation`](AXIOMATIC_CALCULUS.md#ac-014-judgment-separation) | none |
| `Functor Kind`; `F_D`; `F_P`; `F_H` | `urn:stdo:bounded-context:axiomatic-calculus` | [`AXIOMATIC_CALCULUS.md#5-traversals-and-functor-kinds`](AXIOMATIC_CALCULUS.md#5-traversals-and-functor-kinds) | none |
| `Material Closure` | `urn:stdo:bounded-context:axiomatic-calculus` | [`AXIOMATIC_CALCULUS.md#ac-010-material-closure`](AXIOMATIC_CALCULUS.md#ac-010-material-closure) | none |
| `Projection` | `urn:stdo:bounded-context:axiomatic-calculus` | [`AXIOMATIC_CALCULUS.md#ac-011-projection`](AXIOMATIC_CALCULUS.md#ac-011-projection) | none |
| `Interpretation` | `urn:stdo:bounded-context:axiomatic-calculus` | [`AXIOMATIC_CALCULUS.md#6-interpretation-and-models`](AXIOMATIC_CALCULUS.md#6-interpretation-and-models) | none |
| `Axiomatic Calculus Basis` | `urn:stdo:bounded-context:axiomatic-calculus` | [`AXIOMATIC_CALCULUS.md#8-calculus-identity`](AXIOMATIC_CALCULUS.md#8-calculus-identity) | none |
| operation outcome: declared result; `hold`; `gap`; `refusal(constraint)`; `refusal(basis)` | `urn:stdo:bounded-context:axiomatic-calculus` | [`AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal`](AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal) | [`AXIOMATIC_CALCULUS.md#5-traversals-and-functor-kinds`](AXIOMATIC_CALCULUS.md#5-traversals-and-functor-kinds); [`FOUNDATIONS.md#results`](FOUNDATIONS.md#results) |

## 5. Semantic resolution

Context declared by
[PRODUCT_DEFINITION §5](PRODUCT_DEFINITION.md#5-bounded-context-semantic-resolution)
(P3).

| Indexed term | Bounded-context identity | Owning concept clause | Relation clause |
|---|---|---|---|
| `Term` | `urn:stdo:bounded-context:semantic-resolution` | [`PRODUCT_DEFINITION.md#5-bounded-context-semantic-resolution`](PRODUCT_DEFINITION.md#5-bounded-context-semantic-resolution) | none |
| `Concept Reference` | `urn:stdo:bounded-context:semantic-resolution` | [`PRODUCT_DEFINITION.md#5-bounded-context-semantic-resolution`](PRODUCT_DEFINITION.md#5-bounded-context-semantic-resolution) | none |
| `Bounded Context` | `urn:stdo:bounded-context:semantic-resolution` | [`PRODUCT_DEFINITION.md#5-bounded-context-semantic-resolution`](PRODUCT_DEFINITION.md#5-bounded-context-semantic-resolution) | none |
| `Semantic Address` | `urn:stdo:bounded-context:semantic-resolution` | [`PRODUCT_DEFINITION.md#5-bounded-context-semantic-resolution`](PRODUCT_DEFINITION.md#5-bounded-context-semantic-resolution) | none |
| `Semantic Import` | `urn:stdo:bounded-context:semantic-resolution` | [`FOUNDATIONS.md#imports-between-members`](FOUNDATIONS.md#imports-between-members) | [`PRODUCT_DEFINITION.md#5-bounded-context-semantic-resolution`](PRODUCT_DEFINITION.md#5-bounded-context-semantic-resolution), which applies the import between bounded contexts |
| `Semantic Translation` | `urn:stdo:bounded-context:semantic-resolution` | [`PRODUCT_DEFINITION.md#5-bounded-context-semantic-resolution`](PRODUCT_DEFINITION.md#5-bounded-context-semantic-resolution) | none |
| `Semantic Equivalence` | `urn:stdo:bounded-context:semantic-resolution` | [`PRODUCT_DEFINITION.md#5-bounded-context-semantic-resolution`](PRODUCT_DEFINITION.md#5-bounded-context-semantic-resolution) | none |
| `Semantic Disambiguation` | `urn:stdo:bounded-context:semantic-resolution` | [`PRODUCT_DEFINITION.md#5-bounded-context-semantic-resolution`](PRODUCT_DEFINITION.md#5-bounded-context-semantic-resolution) | none |

## 6. Product-definition routing

Context declared by
[PRODUCT_DEFINITION §1](PRODUCT_DEFINITION.md#1-overlay-and-layout-independence)
(P3).

| Indexed term | Bounded-context identity | Owning concept clause | Relation clause |
|---|---|---|---|
| `STDO Product Definition Overlay` | `urn:stdo:bounded-context:product-definition-routing` | [`PRODUCT_DEFINITION.md#1-overlay-and-layout-independence`](PRODUCT_DEFINITION.md#1-overlay-and-layout-independence) | none |
| `Definition Root` | `urn:stdo:bounded-context:product-definition-routing` | [`PRODUCT_DEFINITION.md#1-overlay-and-layout-independence`](PRODUCT_DEFINITION.md#1-overlay-and-layout-independence) | none |
| `Definition Label` | `urn:stdo:bounded-context:product-definition-routing` | [`PRODUCT_DEFINITION.md#1-overlay-and-layout-independence`](PRODUCT_DEFINITION.md#1-overlay-and-layout-independence) | none |
| `Product-Definition Identity` | `urn:stdo:bounded-context:product-definition-routing` | [`PRODUCT_DEFINITION.md#1-overlay-and-layout-independence`](PRODUCT_DEFINITION.md#1-overlay-and-layout-independence) | none |
| `Constitutional Set` | `urn:stdo:bounded-context:product-definition-routing` | [`PRODUCT_DEFINITION.md#3-constitutional-set-sufficiency`](PRODUCT_DEFINITION.md#3-constitutional-set-sufficiency) | none |
| `Project Reference-Frame Basis` | `urn:stdo:bounded-context:product-definition-routing` | [`PRODUCT_DEFINITION.md#7-collective-reference-frame-basis`](PRODUCT_DEFINITION.md#7-collective-reference-frame-basis) | [`REFERENCE_FRAME.md#4-frame-set-declaration`](REFERENCE_FRAME.md#4-frame-set-declaration) |
| `Agent Frame Activation` | `urn:stdo:bounded-context:product-definition-routing` | [`PRODUCT_DEFINITION.md#7-collective-reference-frame-basis`](PRODUCT_DEFINITION.md#7-collective-reference-frame-basis) | [`REFERENCE_FRAME.md#11-the-activation-packet`](REFERENCE_FRAME.md#11-the-activation-packet) |
| `Installed Release Basis` | `urn:stdo:bounded-context:product-definition-routing` | [`PRODUCT_DEFINITION.md#4-shared-installed-release-basis-and-toolchain-manager`](PRODUCT_DEFINITION.md#4-shared-installed-release-basis-and-toolchain-manager) | none |
| `Adoption Plan` | `urn:stdo:bounded-context:product-definition-routing` | [`PRODUCT_DEFINITION.md#4-shared-installed-release-basis-and-toolchain-manager`](PRODUCT_DEFINITION.md#4-shared-installed-release-basis-and-toolchain-manager) | [`RELEASE.md#4-selector-and-consumer-adoption`](RELEASE.md#4-selector-and-consumer-adoption) |
| `Fleet Adoption Plan` | `urn:stdo:bounded-context:product-definition-routing` | [`PRODUCT_DEFINITION.md#4-shared-installed-release-basis-and-toolchain-manager`](PRODUCT_DEFINITION.md#4-shared-installed-release-basis-and-toolchain-manager) | none |
| `STDO Toolchain Manager` | `urn:stdo:bounded-context:product-definition-routing` | [`PRODUCT_DEFINITION.md#4-shared-installed-release-basis-and-toolchain-manager`](PRODUCT_DEFINITION.md#4-shared-installed-release-basis-and-toolchain-manager) | none |

## 7. Release publication

Context declared by
[RELEASE §1](RELEASE.md#1-context-and-position) (P3).

| Indexed term | Bounded-context identity | Owning concept clause | Relation clause |
|---|---|---|---|
| `Project Release Namespace` | `urn:stdo:bounded-context:release-publication` | [`RELEASE.md#2-release-identities`](RELEASE.md#2-release-identities) | none |
| `Project Subtree` | `urn:stdo:bounded-context:release-publication` | [`RELEASE.md#2-release-identities`](RELEASE.md#2-release-identities) | [`RELEASE.md#project-subtree-release-identity`](RELEASE.md#project-subtree-release-identity) |
| `Candidate Source` | `urn:stdo:bounded-context:release-publication` | [`RELEASE.md#2-release-identities`](RELEASE.md#2-release-identities) | [`FOUNDATIONS.md#product-lineage-objects`](FOUNDATIONS.md#product-lineage-objects) |
| `RC Branch` | `urn:stdo:bounded-context:release-publication` | [`RELEASE.md#2-release-identities`](RELEASE.md#2-release-identities) | none |
| `Immutable RC Cut` | `urn:stdo:bounded-context:release-publication` | [`RELEASE.md#2-release-identities`](RELEASE.md#2-release-identities) | [`FOUNDATIONS.md#product-lineage-objects`](FOUNDATIONS.md#product-lineage-objects) |
| `Version-Line Selector` | `urn:stdo:bounded-context:release-publication` | [`RELEASE.md#2-release-identities`](RELEASE.md#2-release-identities) | [`FOUNDATIONS.md#product-lineage-objects`](FOUNDATIONS.md#product-lineage-objects) |
| `Release Branch` | `urn:stdo:bounded-context:release-publication` | [`RELEASE.md#2-release-identities`](RELEASE.md#2-release-identities) | none |

## 8. Reference-frame evaluation

Context declared by
[REFERENCE_FRAME §1](REFERENCE_FRAME.md#1-the-frame-as-the-engagement-unit)
(P3). Its import declaration,
[Imports into this context](REFERENCE_FRAME.md#imports-into-this-context),
holds in the context the frame objects, ontology objects, authority kinds,
disjointness and frame tuple of FOUNDATIONS §2, the core results and their
conjunction of FOUNDATIONS §4, the step with its result refinements and
the closed result of ACTIVATION §1 to §3 and §7, and the qualification of
EVALUATION §7, each kept by its owner. A row for an imported concept cites
its owning section as owning concept clause and the import declaration as
relation clause (§2; P1, P6).

| Indexed term | Bounded-context identity | Owning concept clause | Relation clause |
|---|---|---|---|
| `Reference Frame`; `Frame` | `urn:stdo:bounded-context:reference-frame-evaluation` | [`FOUNDATIONS.md#frame-objects`](FOUNDATIONS.md#frame-objects) | [`REFERENCE_FRAME.md#imports-into-this-context`](REFERENCE_FRAME.md#imports-into-this-context); [`REFERENCE_FRAME.md#1-the-frame-as-the-engagement-unit`](REFERENCE_FRAME.md#1-the-frame-as-the-engagement-unit) |
| `Frame Tuple` | `urn:stdo:bounded-context:reference-frame-evaluation` | [`FOUNDATIONS.md#the-frame-tuple`](FOUNDATIONS.md#the-frame-tuple) | [`REFERENCE_FRAME.md#imports-into-this-context`](REFERENCE_FRAME.md#imports-into-this-context); [`REFERENCE_FRAME.md#minimal-frame-declaration`](REFERENCE_FRAME.md#minimal-frame-declaration) |
| `Frame Declaration` | `urn:stdo:bounded-context:reference-frame-evaluation` | [`REFERENCE_FRAME.md#minimal-frame-declaration`](REFERENCE_FRAME.md#minimal-frame-declaration) | none |
| `Frame-Set Declaration` | `urn:stdo:bounded-context:reference-frame-evaluation` | [`REFERENCE_FRAME.md#4-frame-set-declaration`](REFERENCE_FRAME.md#4-frame-set-declaration) | [`PRODUCT_DEFINITION.md#7-collective-reference-frame-basis`](PRODUCT_DEFINITION.md#7-collective-reference-frame-basis) |
| `Activated Frame` | `urn:stdo:bounded-context:reference-frame-evaluation` | [`FOUNDATIONS.md#frame-objects`](FOUNDATIONS.md#frame-objects) | [`REFERENCE_FRAME.md#imports-into-this-context`](REFERENCE_FRAME.md#imports-into-this-context); [`REFERENCE_FRAME.md#11-the-activation-packet`](REFERENCE_FRAME.md#11-the-activation-packet) |
| `Activation Packet` | `urn:stdo:bounded-context:reference-frame-evaluation` | [`REFERENCE_FRAME.md#11-the-activation-packet`](REFERENCE_FRAME.md#11-the-activation-packet) | [`ACTIVATION.md#1-the-step`](ACTIVATION.md#1-the-step) |
| `Evaluation` | `urn:stdo:bounded-context:reference-frame-evaluation` | [`FOUNDATIONS.md#frame-objects`](FOUNDATIONS.md#frame-objects) | [`REFERENCE_FRAME.md#imports-into-this-context`](REFERENCE_FRAME.md#imports-into-this-context) |
| `Evaluation Family`; `Workspace`; `Material-Relation Manifold`; `Coordinate`; `Topology`; `Capability Envelope`; `Frame Set`; `Active Frame Configuration`; `Lens`; `Role`, `Persona`, `Abstraction`, `Component` | `urn:stdo:bounded-context:reference-frame-evaluation` | [`FOUNDATIONS.md#frame-objects`](FOUNDATIONS.md#frame-objects) | [`REFERENCE_FRAME.md#imports-into-this-context`](REFERENCE_FRAME.md#imports-into-this-context) |
| `Actor Identity` | `urn:stdo:bounded-context:reference-frame-evaluation` | [`FOUNDATIONS.md#authority-kinds`](FOUNDATIONS.md#authority-kinds) | [`REFERENCE_FRAME.md#imports-into-this-context`](REFERENCE_FRAME.md#imports-into-this-context); [`SPEC_METHOD.md#11-build-tenant-binding`](SPEC_METHOD.md#11-build-tenant-binding) |
| `Engagement Atom`; `Semantic Atom` | `urn:stdo:bounded-context:reference-frame-evaluation` | [`REFERENCE_FRAME.md#engagement-atom-and-semantic-atom`](REFERENCE_FRAME.md#engagement-atom-and-semantic-atom) | none |
| `Communication` | `urn:stdo:bounded-context:reference-frame-evaluation` | [`REFERENCE_FRAME.md#rf-009-no-assumed-hierarchy`](REFERENCE_FRAME.md#rf-009-no-assumed-hierarchy) | [`ACTIVATION.md#configuration`](ACTIVATION.md#configuration) |
| `activate` outcome: `activated_frame`; `activation_refusal(capability)`; `activation_refusal(authority)`; `activation_refusal(basis)` | `urn:stdo:bounded-context:reference-frame-evaluation` | [`REFERENCE_FRAME.md#5-method-functions`](REFERENCE_FRAME.md#5-method-functions) | [`FOUNDATIONS.md#results`](FOUNDATIONS.md#results) |
| `conjoin` outcome: `decision(holds)`; `decision(fails)`; `conflict`; `indeterminate` | `urn:stdo:bounded-context:reference-frame-evaluation` | [`REFERENCE_FRAME.md#5-method-functions`](REFERENCE_FRAME.md#5-method-functions) | [`FOUNDATIONS.md#conjunction-of-results`](FOUNDATIONS.md#conjunction-of-results) |
| `translate` outcome: `translated_value`; `declared_loss`; `refusal(condition)`; `refusal(authority)`; `refusal(basis)` | `urn:stdo:bounded-context:reference-frame-evaluation` | [`REFERENCE_FRAME.md#5-method-functions`](REFERENCE_FRAME.md#5-method-functions) | [`REFERENCE_FRAME.md#evidence-or-coordinate-translation`](REFERENCE_FRAME.md#evidence-or-coordinate-translation) |
| `Coverage Ledger` | `urn:stdo:bounded-context:reference-frame-evaluation` | [`REFERENCE_FRAME.md#coverage-ledger`](REFERENCE_FRAME.md#coverage-ledger) | none |
| coverage status: `covered`; `separately_covered`; `excluded_by_authority`; `conditionally_covered`; `conflicted`; `uncovered`; `unknown` | `urn:stdo:bounded-context:reference-frame-evaluation` | [`REFERENCE_FRAME.md#coverage-ledger`](REFERENCE_FRAME.md#coverage-ledger) | [`FOUNDATIONS.md#results`](FOUNDATIONS.md#results) |
| `Result Algebra`; core result algebra | `urn:stdo:bounded-context:reference-frame-evaluation` | [`FOUNDATIONS.md#results`](FOUNDATIONS.md#results) | [`REFERENCE_FRAME.md#imports-into-this-context`](REFERENCE_FRAME.md#imports-into-this-context); [`REFERENCE_FRAME.md#rf-012-closed-results`](REFERENCE_FRAME.md#rf-012-closed-results); [`AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal`](AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal) |
| `satisfied`; `falsified`; `indeterminate`; `out_of_frame`; `invalid_basis` | `urn:stdo:bounded-context:reference-frame-evaluation` | [`FOUNDATIONS.md#results`](FOUNDATIONS.md#results) | [`REFERENCE_FRAME.md#imports-into-this-context`](REFERENCE_FRAME.md#imports-into-this-context); [`REFERENCE_FRAME.md#rf-012-closed-results`](REFERENCE_FRAME.md#rf-012-closed-results) |
| not performed, an evaluation with no closed result; refinement of the core | `urn:stdo:bounded-context:reference-frame-evaluation` | [`FOUNDATIONS.md#results`](FOUNDATIONS.md#results) | [`REFERENCE_FRAME.md#imports-into-this-context`](REFERENCE_FRAME.md#imports-into-this-context) |
| further refinement; parent value; child value; parent-value rule | `urn:stdo:bounded-context:reference-frame-evaluation` | [`FOUNDATIONS.md#results`](FOUNDATIONS.md#results) | [`REFERENCE_FRAME.md#imports-into-this-context`](REFERENCE_FRAME.md#imports-into-this-context) |
| conjunction of results; declared decision rule; composition of results | `urn:stdo:bounded-context:reference-frame-evaluation` | [`FOUNDATIONS.md#conjunction-of-results`](FOUNDATIONS.md#conjunction-of-results) | [`REFERENCE_FRAME.md#imports-into-this-context`](REFERENCE_FRAME.md#imports-into-this-context); [`REFERENCE_FRAME.md#result-conjunction`](REFERENCE_FRAME.md#result-conjunction) |
| size measurement | `urn:stdo:bounded-context:reference-frame-evaluation` | [`ACTIVATION.md#2-context-construction-under-an-envelope`](ACTIVATION.md#2-context-construction-under-an-envelope) | [`REFERENCE_FRAME.md#imports-into-this-context`](REFERENCE_FRAME.md#imports-into-this-context); [`REFERENCE_FRAME.md#rf-002-finite-attention`](REFERENCE_FRAME.md#rf-002-finite-attention) |
| admission and activation: `activated`; `admission_refused(authority)`; `admission_refused(basis)`; `closure_unresolved` | `urn:stdo:bounded-context:reference-frame-evaluation` | [`ACTIVATION.md#admission-and-activation`](ACTIVATION.md#admission-and-activation) | [`REFERENCE_FRAME.md#imports-into-this-context`](REFERENCE_FRAME.md#imports-into-this-context); [`REFERENCE_FRAME.md#5-method-functions`](REFERENCE_FRAME.md#5-method-functions) |
| construction availability: `candidate_ready`; `refused`; `incomplete`; `re_entry_requested(authority)`; `re_entry_requested(basis)` | `urn:stdo:bounded-context:reference-frame-evaluation` | [`ACTIVATION.md#construction-availability`](ACTIVATION.md#construction-availability) | [`REFERENCE_FRAME.md#imports-into-this-context`](REFERENCE_FRAME.md#imports-into-this-context) |
| disposition: `accept`; `local_repair`; `re_enter`; `reject` | `urn:stdo:bounded-context:reference-frame-evaluation` | [`ACTIVATION.md#disposition`](ACTIVATION.md#disposition) | [`REFERENCE_FRAME.md#imports-into-this-context`](REFERENCE_FRAME.md#imports-into-this-context) |
| ambiguity outcome: `resolved`; `carried`; `escalated`; `blocked` | `urn:stdo:bounded-context:reference-frame-evaluation` | [`ACTIVATION.md#ambiguity-outcome`](ACTIVATION.md#ambiguity-outcome) | [`REFERENCE_FRAME.md#imports-into-this-context`](REFERENCE_FRAME.md#imports-into-this-context); [`SPEC_METHOD.md#5-ambiguity-governance-and-lifecycle`](SPEC_METHOD.md#5-ambiguity-governance-and-lifecycle) |
| effects: `completed`; `not_effected`; `completion_unknown` | `urn:stdo:bounded-context:reference-frame-evaluation` | [`ACTIVATION.md#effects`](ACTIVATION.md#effects) | [`REFERENCE_FRAME.md#imports-into-this-context`](REFERENCE_FRAME.md#imports-into-this-context) |
| `Closed Result` | `urn:stdo:bounded-context:reference-frame-evaluation` | [`ACTIVATION.md#7-closed-result-and-reuse`](ACTIVATION.md#7-closed-result-and-reuse) | [`REFERENCE_FRAME.md#imports-into-this-context`](REFERENCE_FRAME.md#imports-into-this-context); [`REFERENCE_FRAME.md#rf-012-closed-results`](REFERENCE_FRAME.md#rf-012-closed-results) |
| `Product` specialist frame family | `urn:stdo:bounded-context:reference-frame-evaluation` | [`EXECUTIVE_BASELINE.md#11-derived-generic-specialist-frame-set`](EXECUTIVE_BASELINE.md#11-derived-generic-specialist-frame-set) | none |
| `Owner` specialist frame family | `urn:stdo:bounded-context:reference-frame-evaluation` | [`EXECUTIVE_BASELINE.md#11-derived-generic-specialist-frame-set`](EXECUTIVE_BASELINE.md#11-derived-generic-specialist-frame-set) | none |

## 9. Build tenancy

Context declared by
[PRODUCT_DEFINITION §8](PRODUCT_DEFINITION.md#8-what-how-and-work-carriers)
(P3). §8 names the build tenant, the realisation relation and the terms of
the build-tenant binding as concepts of the context owned in SPEC_METHOD
§11, and the multi-build-tenant work item as owned in TICKETS §4; their rows
cite those owners and name §8 as relation clause (§2; P1, P3).

| Indexed term | Bounded-context identity | Owning concept clause | Relation clause |
|---|---|---|---|
| `Build Tenant` | `urn:stdo:bounded-context:build-tenancy` | [`SPEC_METHOD.md#11-build-tenant-binding`](SPEC_METHOD.md#11-build-tenant-binding) | [`PRODUCT_DEFINITION.md#8-what-how-and-work-carriers`](PRODUCT_DEFINITION.md#8-what-how-and-work-carriers) |
| `Build-Tenant Binding`; `Calculus Binding`; `Execution Binding` | `urn:stdo:bounded-context:build-tenancy` | [`SPEC_METHOD.md#11-build-tenant-binding`](SPEC_METHOD.md#11-build-tenant-binding) | [`PRODUCT_DEFINITION.md#8-what-how-and-work-carriers`](PRODUCT_DEFINITION.md#8-what-how-and-work-carriers) |
| `Requirements Calculus`; `Computational Calculus`; `Execution Environment` | `urn:stdo:bounded-context:build-tenancy` | [`SPEC_METHOD.md#11-build-tenant-binding`](SPEC_METHOD.md#11-build-tenant-binding) | [`PRODUCT_DEFINITION.md#8-what-how-and-work-carriers`](PRODUCT_DEFINITION.md#8-what-how-and-work-carriers) |
| `Author Identity`; `Operation Kind` | `urn:stdo:bounded-context:build-tenancy` | [`SPEC_METHOD.md#11-build-tenant-binding`](SPEC_METHOD.md#11-build-tenant-binding) | [`PRODUCT_DEFINITION.md#8-what-how-and-work-carriers`](PRODUCT_DEFINITION.md#8-what-how-and-work-carriers); [`FOUNDATIONS.md#authority-kinds`](FOUNDATIONS.md#authority-kinds) |
| `Build Tenancy`; `Multi-Build-Tenancy` | `urn:stdo:bounded-context:build-tenancy` | [`PRODUCT_DEFINITION.md#8-what-how-and-work-carriers`](PRODUCT_DEFINITION.md#8-what-how-and-work-carriers) | none |
| `Tenant Registry` | `urn:stdo:bounded-context:build-tenancy` | [`PRODUCT_DEFINITION.md#8-what-how-and-work-carriers`](PRODUCT_DEFINITION.md#8-what-how-and-work-carriers) | none |
| `Common Build-Tenant Surface` | `urn:stdo:bounded-context:build-tenancy` | [`PRODUCT_DEFINITION.md#8-what-how-and-work-carriers`](PRODUCT_DEFINITION.md#8-what-how-and-work-carriers) | none |
| `Multi-Build-Tenant Work Item` | `urn:stdo:bounded-context:build-tenancy` | [`TICKETS.md#multi-build-tenant-independence`](TICKETS.md#multi-build-tenant-independence) | [`PRODUCT_DEFINITION.md#8-what-how-and-work-carriers`](PRODUCT_DEFINITION.md#8-what-how-and-work-carriers) |

## 10. Recursive product

Context declared by
[FOUNDATIONS §2 Product lineage objects](FOUNDATIONS.md#product-lineage-objects)
(P3).

| Indexed term | Bounded-context identity | Owning concept clause | Relation clause |
|---|---|---|---|
| `Substrate` | `urn:stdo:bounded-context:recursive-product-taxonomy` | [`FOUNDATIONS.md#product-lineage-objects`](FOUNDATIONS.md#product-lineage-objects) | none |
| `Development Product` | `urn:stdo:bounded-context:recursive-product-taxonomy` | [`FOUNDATIONS.md#product-lineage-objects`](FOUNDATIONS.md#product-lineage-objects) | none |
| `Source Project` | `urn:stdo:bounded-context:recursive-product-taxonomy` | [`FOUNDATIONS.md#product-lineage-objects`](FOUNDATIONS.md#product-lineage-objects) | [`WORLD_MODEL.md#builder-project-specialisation`](WORLD_MODEL.md#builder-project-specialisation) |
| `Release Cut` | `urn:stdo:bounded-context:recursive-product-taxonomy` | [`FOUNDATIONS.md#product-lineage-objects`](FOUNDATIONS.md#product-lineage-objects) | [`RELEASE.md#2-release-identities`](RELEASE.md#2-release-identities) |
| `Product` | `urn:stdo:bounded-context:recursive-product-taxonomy` | [`FOUNDATIONS.md#product-lineage-objects`](FOUNDATIONS.md#product-lineage-objects) | none |
| `Install` | `urn:stdo:bounded-context:recursive-product-taxonomy` | [`FOUNDATIONS.md#product-lineage-objects`](FOUNDATIONS.md#product-lineage-objects) | none |
| `Artifact` | `urn:stdo:bounded-context:recursive-product-taxonomy` | [`FOUNDATIONS.md#product-lineage-objects`](FOUNDATIONS.md#product-lineage-objects) | none |
| `Product Definition` | `urn:stdo:bounded-context:recursive-product-taxonomy` | [`FOUNDATIONS.md#product-lineage-objects`](FOUNDATIONS.md#product-lineage-objects) | [`PRODUCT_DEFINITION.md#1-overlay-and-layout-independence`](PRODUCT_DEFINITION.md#1-overlay-and-layout-independence) |

## 11. Product assurance

Context declared by
[ASSURANCE §2](ASSURANCE.md#2-testing-strategy-taxonomy) (P3).

| Indexed term | Bounded-context identity | Owning concept clause | Relation clause |
|---|---|---|---|
| `Design/Module Conformance Test` | `urn:stdo:bounded-context:product-assurance` | [`ASSURANCE.md#2-testing-strategy-taxonomy`](ASSURANCE.md#2-testing-strategy-taxonomy) | none |
| `Unit Test` | `urn:stdo:bounded-context:product-assurance` | [`ASSURANCE.md#15-module-derived-unit-tests`](ASSURANCE.md#15-module-derived-unit-tests) | [`DESIGN_MODULE.md#9-module-taxonomy`](DESIGN_MODULE.md#9-module-taxonomy) |
| `UAT`; `Acceptance Test` | `urn:stdo:bounded-context:product-assurance` | [`ASSURANCE.md#2-testing-strategy-taxonomy`](ASSURANCE.md#2-testing-strategy-taxonomy) | none |
| `Sandbox Test` | `urn:stdo:bounded-context:product-assurance` | [`ASSURANCE.md#2-testing-strategy-taxonomy`](ASSURANCE.md#2-testing-strategy-taxonomy) | none |
| `Harnessed Sandbox UAT` | `urn:stdo:bounded-context:product-assurance` | [`ASSURANCE.md#2-testing-strategy-taxonomy`](ASSURANCE.md#2-testing-strategy-taxonomy) | none |
| `Live Sandbox UAT` | `urn:stdo:bounded-context:product-assurance` | [`ASSURANCE.md#2-testing-strategy-taxonomy`](ASSURANCE.md#2-testing-strategy-taxonomy) | none |

## 12. Ambiguity governance

Context declared by
[SPEC_METHOD §5](SPEC_METHOD.md#5-ambiguity-governance-and-lifecycle)
(P3).

| Indexed term | Bounded-context identity | Owning concept clause | Relation clause |
|---|---|---|---|
| `Lawful Probabilistic Processing` | `urn:stdo:bounded-context:ambiguity-governance` | [`SPEC_METHOD.md#5-ambiguity-governance-and-lifecycle`](SPEC_METHOD.md#5-ambiguity-governance-and-lifecycle) | none |
| `Human Adjudication` | `urn:stdo:bounded-context:ambiguity-governance` | [`SPEC_METHOD.md#5-ambiguity-governance-and-lifecycle`](SPEC_METHOD.md#5-ambiguity-governance-and-lifecycle) | none |

## 13. World model

Context declared by
[WORLD_MODEL §2](WORLD_MODEL.md#2-role-and-imports) (P3).

| Indexed term | Bounded-context identity | Owning concept clause | Relation clause |
|---|---|---|---|
| `Builder Project` | `urn:stdo:bounded-context:world-model` | [`WORLD_MODEL.md#6-units`](WORLD_MODEL.md#6-units) | [`WORLD_MODEL.md#builder-project-specialisation`](WORLD_MODEL.md#builder-project-specialisation) |
| `Published Domain Artifact` | `urn:stdo:bounded-context:world-model` | [`WORLD_MODEL.md#6-units`](WORLD_MODEL.md#6-units) | none |
| `World Model Object` | `urn:stdo:bounded-context:world-model` | [`WORLD_MODEL.md#6-units`](WORLD_MODEL.md#6-units) | none |
| `Markov Object` | `urn:stdo:bounded-context:world-model` | [`WORLD_MODEL.md#6-units`](WORLD_MODEL.md#6-units) | [`WORLD_MODEL.md#4-the-markov-object-construct`](WORLD_MODEL.md#4-the-markov-object-construct) |
| `Treatment Surface` | `urn:stdo:bounded-context:world-model` | [`WORLD_MODEL.md#6-units`](WORLD_MODEL.md#6-units) | none |
| `Covariance Edge` | `urn:stdo:bounded-context:world-model` | [`WORLD_MODEL.md#6-units`](WORLD_MODEL.md#6-units) | none |
| `Adjoint Mapping` | `urn:stdo:bounded-context:world-model` | [`WORLD_MODEL.md#6-units`](WORLD_MODEL.md#6-units) | none |
| `Composed World Model` | `urn:stdo:bounded-context:world-model` | [`WORLD_MODEL.md#6-units`](WORLD_MODEL.md#6-units) | none |
| `Query Plane` | `urn:stdo:bounded-context:world-model` | [`WORLD_MODEL.md#6-units`](WORLD_MODEL.md#6-units) | none |
| cut admissibility: `cut_admissible`; `cut_inadmissible`; `discrimination_undecided` | `urn:stdo:bounded-context:world-model` | [`WORLD_MODEL.md#14-results-of-this-profile`](WORLD_MODEL.md#14-results-of-this-profile) | [`FOUNDATIONS.md#results`](FOUNDATIONS.md#results) |
| direction acceptance: `direction_verified`; `extraction_inadmissible`; `verification_failed`; `verification_inconclusive`; `representation_space_invalid` | `urn:stdo:bounded-context:world-model` | [`WORLD_MODEL.md#14-results-of-this-profile`](WORLD_MODEL.md#14-results-of-this-profile) | [`FOUNDATIONS.md#results`](FOUNDATIONS.md#results) |
| overlay publication: `published_verified`; `published_unverified` | `urn:stdo:bounded-context:world-model` | [`WORLD_MODEL.md#14-results-of-this-profile`](WORLD_MODEL.md#14-results-of-this-profile) | [`FOUNDATIONS.md#results`](FOUNDATIONS.md#results) |
| overlay storage: `storage_retained`; `storage_lossy` | `urn:stdo:bounded-context:world-model` | [`WORLD_MODEL.md#14-results-of-this-profile`](WORLD_MODEL.md#14-results-of-this-profile) | [`FOUNDATIONS.md#results`](FOUNDATIONS.md#results) |
| null-peer discrimination: `null_peer_discriminated`; `not_yet_lawful` | `urn:stdo:bounded-context:world-model` | [`WORLD_MODEL.md#14-results-of-this-profile`](WORLD_MODEL.md#14-results-of-this-profile) | [`FOUNDATIONS.md#results`](FOUNDATIONS.md#results) |
| promotion gate: `gate_met`; `gate_not_met` | `urn:stdo:bounded-context:world-model` | [`WORLD_MODEL.md#14-results-of-this-profile`](WORLD_MODEL.md#14-results-of-this-profile) | [`FOUNDATIONS.md#results`](FOUNDATIONS.md#results) |
| saturation: `saturated`; `not_saturated` | `urn:stdo:bounded-context:world-model` | [`WORLD_MODEL.md#14-results-of-this-profile`](WORLD_MODEL.md#14-results-of-this-profile) | [`FOUNDATIONS.md#results`](FOUNDATIONS.md#results) |

## 14. Graph-native ODD

Context declared by [ODD §1](ODD.md#1-position) (P3). `F_D`, `F_P` and
`F_H` are also indexed in the axiomatic-calculus context in §4; the two
rows create no identity between the contexts (P1).

| Indexed term | Bounded-context identity | Owning concept clause | Relation clause |
|---|---|---|---|
| `ODD`; `Outcome-Driven Development` | `urn:stdo:bounded-context:graph-native-odd` | [`ODD.md#1-position`](ODD.md#1-position) | none |
| `GTL`; `Graph Transformation Language` | `urn:stdo:bounded-context:graph-native-odd` | [`ODD.md#1-position`](ODD.md#1-position) | none |
| `ABG` | `urn:stdo:bounded-context:graph-native-odd` | [`ODD.md#1-position`](ODD.md#1-position) | [`ODD.md#abg`](ODD.md#abg) |
| `Edge Traversal`; `Traversal` | `urn:stdo:bounded-context:graph-native-odd` | [`ODD.md#traversal`](ODD.md#traversal) | none |
| `Probabilistic Compute` | `urn:stdo:bounded-context:graph-native-odd` | [`ODD.md#probabilistic-compute`](ODD.md#probabilistic-compute) | none |
| `F_D` | `urn:stdo:bounded-context:graph-native-odd` | [`ODD.md#probabilistic-compute`](ODD.md#probabilistic-compute) | none |
| `F_P` | `urn:stdo:bounded-context:graph-native-odd` | [`ODD.md#probabilistic-compute`](ODD.md#probabilistic-compute) | [`SPEC_METHOD.md#5-ambiguity-governance-and-lifecycle`](SPEC_METHOD.md#5-ambiguity-governance-and-lifecycle) |
| `F_H` | `urn:stdo:bounded-context:graph-native-odd` | [`ODD.md#probabilistic-compute`](ODD.md#probabilistic-compute) | [`SPEC_METHOD.md#5-ambiguity-governance-and-lifecycle`](SPEC_METHOD.md#5-ambiguity-governance-and-lifecycle) |
| closure decision: `close`; `yield`; `retry(defeated)`; `retry(undecided)`; `repair(implementation)`; `repair(proof)`; `re-enter(undeclared)`; `re-enter(basis)`; `reprice`; `block(undeclared)`; `block(basis)` | `urn:stdo:bounded-context:graph-native-odd` | [`ODD.md#115d-constructive-evaluation-and-yield-loop`](ODD.md#115d-constructive-evaluation-and-yield-loop) | [`FOUNDATIONS.md#results`](FOUNDATIONS.md#results) |
| audit outcome: compliant; non-compliant; valid and worth incorporating | `urn:stdo:bounded-context:graph-native-odd` | [`ODD.md#9-method-governance-and-audit`](ODD.md#9-method-governance-and-audit) | [`FOUNDATIONS.md#results`](FOUNDATIONS.md#results) |

## 15. Traversal occurrence

Context declared by
[TRAVERSAL_OCCURRENCE Position](TRAVERSAL_OCCURRENCE.md#position) (P3).

| Indexed term | Bounded-context identity | Owning concept clause | Relation clause |
|---|---|---|---|
| `Traversal Occurrence Profile`; `Sigma_occurrence` | `urn:stdo:bounded-context:traversal-occurrence-profile` | [`TRAVERSAL_OCCURRENCE.md#position`](TRAVERSAL_OCCURRENCE.md#position) | [`TRAVERSAL_OCCURRENCE.md#imported-calculus-boundary`](TRAVERSAL_OCCURRENCE.md#imported-calculus-boundary) |
| `Occurrence` | `urn:stdo:bounded-context:traversal-occurrence-profile` | [`TRAVERSAL_OCCURRENCE.md#occurrence-identity`](TRAVERSAL_OCCURRENCE.md#occurrence-identity) | none |
| `Framework Event` | `urn:stdo:bounded-context:traversal-occurrence-profile` | [`TRAVERSAL_OCCURRENCE.md#candidate-judgment-event-and-relation-separation`](TRAVERSAL_OCCURRENCE.md#candidate-judgment-event-and-relation-separation) | none |
| `Typed Lineage` | `urn:stdo:bounded-context:traversal-occurrence-profile` | [`TRAVERSAL_OCCURRENCE.md#causality-and-typed-lineage`](TRAVERSAL_OCCURRENCE.md#causality-and-typed-lineage) | none |
| `Mutable Subject` | `urn:stdo:bounded-context:traversal-occurrence-profile` | [`TRAVERSAL_OCCURRENCE.md#mutable-subject-effect-relation`](TRAVERSAL_OCCURRENCE.md#mutable-subject-effect-relation) | none |
| `Event Frontier` | `urn:stdo:bounded-context:traversal-occurrence-profile` | [`TRAVERSAL_OCCURRENCE.md#event-frontier-and-projection`](TRAVERSAL_OCCURRENCE.md#event-frontier-and-projection) | none |
| `Traversal Occurrence Profile Basis` | `urn:stdo:bounded-context:traversal-occurrence-profile` | [`TRAVERSAL_OCCURRENCE.md#exact-profile-identity`](TRAVERSAL_OCCURRENCE.md#exact-profile-identity) | none |
| stop and decision values split by cause: `refusal(constraint)`; `refusal(basis)`; `refused(constraint)`; `refused(basis)`; `partial_effect(not_attained)`; `partial_effect(undecided)`; `partial(not_attained)`; `partial(undecided)` | `urn:stdo:bounded-context:traversal-occurrence-profile` | [`TRAVERSAL_OCCURRENCE.md#closed-constraint-judgment-residual-and-stop-kinds`](TRAVERSAL_OCCURRENCE.md#closed-constraint-judgment-residual-and-stop-kinds) | [`AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal`](AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal); [`FOUNDATIONS.md#results`](FOUNDATIONS.md#results) |

## 16. Concepts of members without a declared context

This section indexes the concepts that a member defines outside every
bounded context it declares. The source context of each is its owning
member
([FOUNDATIONS §2 Imports between members](FOUNDATIONS.md#imports-between-members)),
which the second column names in place of a bounded-context identity. A
row here declares no context; a context holds one of these concepts only
by its own import, as §8 records for the concepts that REFERENCE_FRAME §1
imports (§2; P1, P3).

| Indexed term | Source context | Owning concept clause | Relation clause |
|---|---|---|---|
| `recovered`; `independent`; `derived`; `hypothesis` | FOUNDATIONS | [`FOUNDATIONS.md#1-vocabulary-of-standing`](FOUNDATIONS.md#1-vocabulary-of-standing) | [`FOUNDATIONS.md#3-commitments`](FOUNDATIONS.md#3-commitments) |
| accounts of a construction: algorithmic description; informational interpretation; computational realisation | FOUNDATIONS | [`FOUNDATIONS.md#accounts-of-a-construction`](FOUNDATIONS.md#accounts-of-a-construction) | [`SPEC_METHOD.md#11-build-tenant-binding`](SPEC_METHOD.md#11-build-tenant-binding) |
| `Import`; `Import Declaration`; `Adoption`; `Adoption Premise` | FOUNDATIONS | [`FOUNDATIONS.md#imports-between-members`](FOUNDATIONS.md#imports-between-members) | [`PRODUCT_DEFINITION.md#5-bounded-context-semantic-resolution`](PRODUCT_DEFINITION.md#5-bounded-context-semantic-resolution); [`PROFILES.md#1-the-boundary`](PROFILES.md#1-the-boundary); [`REFERENCE_FRAME.md#imports-into-this-context`](REFERENCE_FRAME.md#imports-into-this-context) |
| `Material Family`; `Family Table`; `Instance Premise`; `Added Choice` | FOUNDATIONS | [`FOUNDATIONS.md#foundation-to-law`](FOUNDATIONS.md#foundation-to-law) | none |
| `Adopting Product` | FOUNDATIONS | [`FOUNDATIONS.md#foundation-to-law`](FOUNDATIONS.md#foundation-to-law) | [`FOUNDATIONS.md#results`](FOUNDATIONS.md#results) |
| `Supporting Evidence` (of a categorical claim) | FOUNDATIONS | [`FOUNDATIONS.md#4-algebra`](FOUNDATIONS.md#4-algebra), Formal fragment | [`EVALUATION.md#6-conformance-of-realisations`](EVALUATION.md#6-conformance-of-realisations) |
| `Join` (four senses: categorical join; composition boundary; join of results; relation join) | FOUNDATIONS | [`FOUNDATIONS.md#1-vocabulary-of-standing`](FOUNDATIONS.md#1-vocabulary-of-standing) | [`CONFORMANCE.md#1-counterexample-cases`](CONFORMANCE.md#1-counterexample-cases) |
| `Assurance Relations`; `Assertion Provenance`; `Execution Provenance`; `Observation Sufficiency`; `Impact Cover`; `Validity Dependency`; `Mandatory Gate` | FOUNDATIONS | [`FOUNDATIONS.md#assurance-relations`](FOUNDATIONS.md#assurance-relations) | [`ACTIVATION.md#7-closed-result-and-reuse`](ACTIVATION.md#7-closed-result-and-reuse); [`EVALUATION.md#1-claims`](EVALUATION.md#1-claims); [`ASSURANCE.md#3-test-authority`](ASSURANCE.md#3-test-authority); [`RELEASE.md#8-acceptance`](RELEASE.md#8-acceptance) |
| `Current State`; `Destination`; `Transition` | ACTIVATION | [`ACTIVATION.md#transitions`](ACTIVATION.md#transitions) | [`ACTIVATION.md#5-work-state-and-restart`](ACTIVATION.md#5-work-state-and-restart) |
| `Construction Relation`; `Strategy`; `Composition Boundary`; `Feedback and Diagnosis`; the four causes | ACTIVATION | [`ACTIVATION.md#construction-relation`](ACTIVATION.md#construction-relation) | [`SPEC_METHOD.md#universal-intake-triage`](SPEC_METHOD.md#universal-intake-triage); [`EVALUATION.md#1-claims`](EVALUATION.md#1-claims); [`FOUNDATIONS.md#construction-synthesis`](FOUNDATIONS.md#construction-synthesis) |
| `Configuration` | ACTIVATION | [`ACTIVATION.md#configuration`](ACTIVATION.md#configuration) | [`FOUNDATIONS.md#frame-objects`](FOUNDATIONS.md#frame-objects); [`REFERENCE_FRAME.md#rf-009-no-assumed-hierarchy`](REFERENCE_FRAME.md#rf-009-no-assumed-hierarchy) |
| `Acquisition`; `Derived Surface`; deciding owner section | ACTIVATION | [`ACTIVATION.md#2-context-construction-under-an-envelope`](ACTIVATION.md#2-context-construction-under-an-envelope) | none |
| `Rewrite Step`; `Licensing Law`; `Exact Step`; `Approximate Step`; `Adequacy Relation`; `End-to-End Bound` | ACTIVATION | [`ACTIVATION.md#refinement`](ACTIVATION.md#refinement) | none |
| `Truth Surface`; actor's account | ACTIVATION | [`ACTIVATION.md#the-workspace-and-an-actors-account`](ACTIVATION.md#the-workspace-and-an-actors-account) | [`ACTIVATION.md#transitions`](ACTIVATION.md#transitions) |
| `Equivalence Ladder`; semantic equivalence of realisations; `Computational Equivalence`; `Categorical Equivalence` | EVALUATION | [`EVALUATION.md#6-conformance-of-realisations`](EVALUATION.md#6-conformance-of-realisations) | [`FOUNDATIONS.md#4-algebra`](FOUNDATIONS.md#4-algebra); `Semantic Equivalence` of concepts in §5 is another concept |
| `Adequate Attention`; `Actual-Use Evidence` | EVALUATION | [`EVALUATION.md#frame-qualification`](EVALUATION.md#frame-qualification) | [`ACTIVATION.md#2-context-construction-under-an-envelope`](ACTIVATION.md#2-context-construction-under-an-envelope) |
| `Discriminator`; `Common Discriminators` | CONFORMANCE | [`CONFORMANCE.md#conformance`](CONFORMANCE.md#conformance) | [`CONFORMANCE.md#5-discriminator-coverage`](CONFORMANCE.md#5-discriminator-coverage) |
| `Logical-Review Check` | CONFORMANCE | [`CONFORMANCE.md#5-discriminator-coverage`](CONFORMANCE.md#5-discriminator-coverage) | [`EVALUATION.md#4-review-results`](EVALUATION.md#4-review-results) |
| profile import rule | PROFILES | [`PROFILES.md#1-the-boundary`](PROFILES.md#1-the-boundary) | [`FOUNDATIONS.md#imports-between-members`](FOUNDATIONS.md#imports-between-members) |
| axiom verdict: `pass`; `fail`; `not_applicable` | DESIGN_MODULE | [`DESIGN_MODULE.md#cross-view-axiom-evaluation`](DESIGN_MODULE.md#cross-view-axiom-evaluation) | [`FOUNDATIONS.md#results`](FOUNDATIONS.md#results) |
| Ontology verdict and design verdict: `accepted` | DESIGN_MODULE | [`DESIGN_MODULE.md#gate-and-retrospective-work`](DESIGN_MODULE.md#gate-and-retrospective-work) | [`ACTIVATION.md#disposition`](ACTIVATION.md#disposition) |
| surface review: `compliant`; `violation`; `design_module_incomplete` | UX | [`UX.md#15-results-of-this-profile`](UX.md#15-results-of-this-profile) | [`FOUNDATIONS.md#results`](FOUNDATIONS.md#results) |
| replay proof: `replay_passes`; `replay_fails` | UX | [`UX.md#15-results-of-this-profile`](UX.md#15-results-of-this-profile) | [`FOUNDATIONS.md#results`](FOUNDATIONS.md#results) |
| closure obligations: `closure_obligations_met`; `closure_unproven` | UX | [`UX.md#15-results-of-this-profile`](UX.md#15-results-of-this-profile) | [`FOUNDATIONS.md#results`](FOUNDATIONS.md#results) |
| carrier admission: `carrier_admitted`; `carrier_missing` | UX | [`UX.md#15-results-of-this-profile`](UX.md#15-results-of-this-profile) | [`FOUNDATIONS.md#results`](FOUNDATIONS.md#results) |

## 17. Labels with several senses

Some labels name different things in different clauses. Each row below
locates one sense with the clause that owns it; the label's meaning at an
occurrence is the sense its owning clause gives, and the occurrence
qualifies the label or states its predicate where it is used. Equal
spelling across these rows establishes no equivalence (§1; P1, P3).
Purpose and material relation: an actor that read one sense into another
clause reconciled the two by itself; this index points each sense to its
owner.

| Label | Where this use occurs (locator, not a definition) | Owning clause |
|---|---|---|
| `indeterminate` | a core result value: admissible evidence cannot decide | [FOUNDATIONS §4 Results](FOUNDATIONS.md#results) |
| `indeterminate` | a triage payload class, not a result | [EVALUATION §4 Result and triage projection](EVALUATION.md#result-and-triage-projection) |
| `not_applicable` | a triage payload class, not a result | [EVALUATION §4 Result and triage projection](EVALUATION.md#result-and-triage-projection) |
| `not_applicable` | a successor disposition with a bounded reason | [RELEASE §9](RELEASE.md#9-successor-baseline-conservation-stdo-up-015) |
| `not_applicable` | a lifecycle phase declared not to apply, with its reason | [SPEC_METHOD §2 Operational lifecycle sufficiency](SPEC_METHOD.md#operational-lifecycle-sufficiency) |
| `not_applicable` | a design-grounded exclusion and an entity-lifecycle matrix entry | [DESIGN_MODULE](DESIGN_MODULE.md), the head and the state model; [ACTIVATION §4](ACTIVATION.md#4-totality-and-refinement) |
| `not_applicable` | a traversal judgment value | [TRAVERSAL_OCCURRENCE](TRAVERSAL_OCCURRENCE.md#closed-constraint-judgment-residual-and-stop-kinds) |
| `refusal`, `refused` | an activation or translation refusal of a method function | [REFERENCE_FRAME §5](REFERENCE_FRAME.md#5-method-functions) |
| `refusal`, `refused` | a constraint or basis refusal of an a_c operation | [AXIOMATIC_CALCULUS AC-007](AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal) |
| `refusal`, `refused` | a traversal judgment decision and stop | [TRAVERSAL_OCCURRENCE](TRAVERSAL_OCCURRENCE.md#closed-constraint-judgment-residual-and-stop-kinds) |
| `refusal`, `refused` | a refused admission of a work contract | [ACTIVATION §1 Admission](ACTIVATION.md#admission) |
| `gap` | an a_c stop, with a core value | [AXIOMATIC_CALCULUS AC-007](AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal) |
| `gap` | a conjunction gap, which has no value of its own | [FOUNDATIONS §4 Conjunction of results](FOUNDATIONS.md#conjunction-of-results) |
| disposition | an acceptance disposition at a boundary | [ACTIVATION §3 Disposition](ACTIVATION.md#disposition) |
| disposition | a successor disposition of a predecessor claim | [RELEASE §9](RELEASE.md#9-successor-baseline-conservation-stdo-up-015) |
| disposition | a repricing disposition of an obligation | [TICKETS §7 Recorded judgment and owner-ruling continuity](TICKETS.md#recorded-judgment-and-owner-ruling-continuity) |
| disposition | a planning choice for an evaluation in a basis inventory, not a coverage status | `templates/PROJECT_REFERENCE_FRAME_BASIS_TEMPLATE.md`, Coverage And Residuals |
| missing | the absence of a closed result | [FOUNDATIONS §4 Results](FOUNDATIONS.md#results), Not performed |
| adoption | Product adoption of an available profile | [PRODUCT_DEFINITION §7](PRODUCT_DEFINITION.md#7-collective-reference-frame-basis) |
| adoption | adoption of a shared method lesson | [SPEC_METHOD §6](SPEC_METHOD.md#shared-method-adoption-and-propagation-stdo-up-012) |
| adoption | a consumer's adoption of a release basis | [RELEASE §4](RELEASE.md#4-selector-and-consumer-adoption) |
| `Closed`, `closed` | a post's discussion state | [POSTING_GUIDE §7](POSTING_GUIDE.md#7-discussion-state-and-mutability) |
| `Closed`, `closed` | a ticket or sprint status | [TICKETS §4 Status](TICKETS.md#status) |
