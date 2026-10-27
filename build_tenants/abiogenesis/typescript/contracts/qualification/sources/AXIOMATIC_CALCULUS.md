# AXIOMATIC_CALCULUS

Tier 1. Owns the a_c theory in full: position and scope, the signature,
the typed records, the laws AC-001 to AC-020, traversals and functor
kinds, interpretation and models, the three governed layers, the law of
calculus identity, the application boundary, external imports, exclusions
and the conformance obligations of this member. Consumes the ontology of
[FOUNDATIONS §2](FOUNDATIONS.md) (subject, representation, interpretation,
context, object, claim, evidence, judgment, authority, residual, basis,
material) and the core result algebra of
[FOUNDATIONS §4 Results](FOUNDATIONS.md#results); it states laws over
those objects and defines none of them a second time. Each clause names
the principle (P0 to P6) that requires it, as
[FOUNDATIONS §1](FOUNDATIONS.md#1-vocabulary-of-standing) requires.

## 1. Position

The STDO Axiomatic Calculus for Governed Symbolic Systems, written `a_c`,
is this method's domain-specific, carrier-neutral constitutional calculus
for representing and relating governed symbolic systems. Its stable
concept identity is `urn:stdo:concept:axiomatic-calculus:a-c`. This member
owns that concept in the bounded context
`urn:stdo:bounded-context:axiomatic-calculus`. Both identifiers are
declared identities and do not change with the carrier or the directory
that publishes them (P3).

`a_c` is a separately identifiable calculus derived from the method's
principles. It defines sorts, typed objects, relations, constraints,
latitude, residual uncertainty, traversals, functor kinds, judgments,
closure, projections, transformations, models and validity laws. Those
definitions depend on no derivation-source record layout, no selected
subject interpretation, no particular carrier, no model provider, no
runtime and no repository topology (P1, P2).

`a_c` claims no universal applicability, logical completeness,
consistency, decidability, soundness or category-theoretic status except
where an exact, separately identified proof establishes that claim for a
declared fragment, model or relation; for category-theoretic status that
proof is the demonstration of
[FOUNDATIONS §4](FOUNDATIONS.md#4-algebra), Formal fragment (P6).

The principles are the derivation provenance of the calculus. Application
of the calculus to any exact subject is a separately owned downstream
relation. The relations are distinct (P3, P6):

```text
exact local governing principles             -> derive    -> a_c
a_c + exact subject X                        -> interpret -> a_c.X
a_c.X + exact accepted semantic judgment J_X
      + exact carrier C                      -> encode    -> a_c.X.C
```

The calculus, an interpreted model and an encoded carrier are distinct
governed layers with separate content identities and proof boundaries
(§7). A layer becomes a released Product only through separately
authorised Product acceptance and release. Neither interpretation nor
encoding can redefine the calculus (P6).

### Derivation provenance

The calculus specialises the governing commitments declared in this
package. Its derivation basis is the following finite set of current local
owners, resolved to exact clauses by the identity record of §8 (P6):

- scoped identity and authority conservation:
  [FOUNDATIONS §2](FOUNDATIONS.md#2-ontology), including
  [Authority kinds](FOUNDATIONS.md#authority-kinds), under P3 and P6;
- exact bounded-context meaning and explicit cross-context relations:
  [FOUNDATIONS §2](FOUNDATIONS.md#2-ontology), Interpretation and Context,
  under P1;
- probabilistic construction as a bounded evaluation class: P0 in
  [FOUNDATIONS §3](FOUNDATIONS.md#3-commitments), with
  [Work boundary](FOUNDATIONS.md#work-boundary) and
  [ACTIVATION §1](ACTIVATION.md#1-the-step);
- delegated construction, exact candidate production and the separation of
  construction from assessment: [ACTIVATION §1](ACTIVATION.md#1-the-step),
  Output and Roles and delegation, and
  [EVALUATION §3](EVALUATION.md#3-independent-assessment);
- admission, output availability, assessment and effect outcomes:
  [ACTIVATION §3](ACTIVATION.md#3-step-results-and-disposition), under P5 and P6;
- governed ambiguity, bounded probabilistic processing, explicit human
  adjudication and hard-stop separation:
  [ACTIVATION §4](ACTIVATION.md#4-totality-and-refinement);
- exact-basis evaluation, evidence-and-verdict separation, authority
  conservation and closed results:
  [REFERENCE_FRAME RF-005](REFERENCE_FRAME.md#rf-005-exact-basis-and-coordinates),
  [RF-006](REFERENCE_FRAME.md#rf-006-authority-conservation),
  [RF-007](REFERENCE_FRAME.md#rf-007-semantic-evidence-and-verdict-separation),
  [FOUNDATIONS Results](FOUNDATIONS.md#results) and
  [Conjunction of results](FOUNDATIONS.md#conjunction-of-results);
- constitutional derivation and re-entry:
  [SPEC_METHOD §1](SPEC_METHOD.md#1-position-and-identity) and
  [§4](SPEC_METHOD.md#4-change-management);
- finite material closure, projection, authority conservation, residual
  uncertainty and capability fit: [REFERENCE_FRAME §3](REFERENCE_FRAME.md#3-laws),
  specialised by AC-010 and AC-011 below; and
- singular released authority: [SPEC_METHOD §6](SPEC_METHOD.md#6-lineage-and-release)
  and [PRODUCT_DEFINITION §4](PRODUCT_DEFINITION.md#4-shared-installed-release-basis-and-toolchain-manager).

This member owns the calculus-specific definitions and specialisations of
`a_c`. Its imported concepts keep their owners: in particular,
[FOUNDATIONS Results](FOUNDATIONS.md#results) and
[Conjunction of results](FOUNDATIONS.md#conjunction-of-results) own the result
values and combination law consumed by AC-007 and AC-019. No calculus model,
carrier or interpretation becomes another owner of those laws. A consumer
needs no implicit representation of the method, particular carrier or
downstream implementation to interpret the calculus (P1, P6).

This member introduces the generic calculus identities `F_D`, `F_P` and
`F_H` (§5). It does not import them from an equal-spelled shorthand owned
by a runtime, profile, realisation or application. The local clauses above
constrain substrate-neutral construction, evaluation, probabilistic
processing, human adjudication, authority, evidence and refusal. Within
those constraints §5 declares the processing purposes of F_D, its total-domain
qualification and its separate evaluation-operation profile as choices;
finite capacity or predicate evaluation alone does not derive those choices. Nominal equality with another
shorthand creates no concept-identity, import or equivalence relation (P3,
P1).

Issuance of an exact `AxiomaticCalculusBasis` (§8) resolves the local routes
above to absolute semantic addresses inside the selected immutable package
and records them under `derivation_basis.principle_refs`. Each address
identifies the actual clause it uses; a mutable authoring locator is not a
digest-bound derivation reference (P3).

The derivation direction is one-way. A model of the method under `a_c`,
an encoded carrier, a proof tool or a successful application cannot amend
the source principles or this calculus (P6).

### Scope

`a_c` governs the form of a symbolic axiomatic model (P2). It
answers:

- what identities and typed objects exist;
- how relations bind exact endpoints;
- how constraints, latitude and residuals remain explicit;
- how traversals and judgments are typed;
- how material closure, projection, overlay and transformation behave;
- what a model must preserve from its subject; and
- which claims are structural, semantic or authority decisions.

`a_c` does not choose the subject vocabulary, decide which source
declarations are material, supply semantic acceptance, select a carrier,
execute a model or prove that one interpretation is uniquely correct (P2,
P6).

### Foundation to law

This member is material family F9, the `a_c` calculus. The table below
shows which of its rules follow from which premises, in the format of
[FOUNDATIONS §3 Foundation to law](FOUNDATIONS.md#foundation-to-law),
which also states the standing of the consequences. Instance premises,
which the commitments do not supply:

- (i) a governed symbolic system is represented by a finite model whose
  records stand for its objects, relations, constraints, residuals,
  traversals, transformations and judgments;
- (ii) a model is interpreted from an exact subject and may be encoded in
  a carrier, and subject, model and carrier are separately identified;
- (iii) model applications may construct values or proposed successors as
  well as decide predicates; some operations are determined by closed
  computation, while others need bounded probabilistic processing or
  explicit human adjudication.

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|
| P1 (independent), P6 (independent); (i) | By P1 a model is a representation of its subject, by P6 encoding and interpreting are separate authorities, and by (i) a governed system is represented by a finite model, so the calculus is derived one way from the method's principles and is separate from its application: interpreting a subject and encoding a model are distinct relations, and no model, carrier, proof tool or successful application amends the calculus or the principles | [§1](#1-position), [Derivation provenance](#derivation-provenance) | the concept identity, its bounded context and the name `a_c`: this member | 6, 10 |
| P2 (independent), P6 (independent) | By P2 the calculus serves only the form a model needs, and by P6 a status needs its own proof, so the calculus governs the form of a symbolic model and claims no status that a separately identified proof has not established; it chooses no subject vocabulary or materiality, supplies no semantic acceptance, selects no carrier and executes nothing | [§1](#1-position), the claims it does not make; [Scope](#scope); [Exclusions](#exclusions) | none | 10 |
| P3 (independent), P5 (derived from P0 and P6); (i) | By P3 every element binds one identity and basis, by P5 an unclosed population would leave results undecided, and by (i) the model is finite, so every model belongs to one closed, finite signature; every record occurs once in one population of eight fixed record families, every identity resolves once, locally or through one declared external relation, and an unknown, hidden, duplicated or dangling element refuses | [§2](#2-signature), [§3](#3-typed-records), [AC-001](#ac-001-closed-signature), [AC-003](#ac-003-reference-closure) | the eight core record kinds and the fields of each record: this member; a model family's sorts, value domains, reference domains and admissible kinds: the owning signature | 3, 10 |
| P3 (independent), P4a (independent) | By P3 identity is declared and scoped, and by P4a relations compose only by the types they declare, so identity is scoped, so equal spelling, payload, position or carrier establishes none; a relation is lawful only between the sorts its kind admits, with its required qualifiers, and its direction is material unless declared symmetric | [AC-002](#ac-002-scoped-identity), [AC-004](#ac-004-relation-typing) | each relation kind's sorts, qualifiers and any declared symmetry: the owning signature | 2, 3, 10 |
| P6 (independent), P4b (derived from P0 and P2), P3 (independent) | By P6 authority is not transferred by handling a record, by P3 every record binds its basis, and by P4b recorded facts persist, so copying, interpreting, encoding, evaluating or transporting a record transfers no authority, and every record, model and result binds an exact basis, mixed bases only under an owned composite-basis relation | [AC-005](#ac-005-authority-conservation), [AC-006](#ac-006-basis-coherence) | each composite-basis relation: the owner it names | 9, 10 |
| P5 (derived from P0 and P6), P6 (independent) | By P5 a value decides only what its evidence establishes, and by P6 a judgment is separate from its acceptance, so a constraint's judgment and every outcome of an operation of this member read as exactly one core value for a named predicate; no failed, missing or undecided result and no stop becomes success; a refusal's cause is part of its value, a demonstrated violation it names mapping to falsified and a condition of the basis the operation acts on to invalid_basis | [AC-007](#ac-007-constraint-and-refusal); [§5](#5-traversals-and-functor-kinds), the stop algebra | the cause of a refusal that names both a demonstrated violation and a condition of the basis, `refusal(constraint)`, with the basis condition reported beside it as its own invalid_basis result: this member, in AC-007; the predicate language and judgment of each constraint kind: the owning signature; further stop values and their refinement: the signature's stop contract; the stop mapping of one traversal: its record, under §5 | 3, 9, 10 |
| P1 (independent), P6 (independent) | By P1 a difference in representation is not a difference in meaning unless declared, and by P6 latitude is granted only by its owner, so two values differ only through a declared latitude or transformation relation; silence is not latitude, and latitude grants no authority beyond its owner, scope, basis and invalidation law | [Latitude](#latitude), [AC-008](#ac-008-explicit-latitude) | each latitude record: its owner | 6, 10 |
| P4b (derived from P0 and P2), P6 (independent) | By P4b an unresolved condition persists until disposed, and by P6 only an authority disposes it, so a material uncertainty stays in the model until an authorised disposition; no projection, compression, interpretation or encoding erases a residual, and absence from a projection is not resolution | [Residual](#residual), [AC-009](#ac-009-residual-conservation) | each residual kind's domains: the owning signature; each disposition: the competent authority | 9, 10 |
| P0 (recovered), P2 (independent), P4b (derived from P0 and P2) | By P0 an actor holds a bounded set of records, by P2 it needs those its task requires, and by P4b established records persist, so material closure is the least lawful record closure, defined only on exact inputs and claiming no minimal size or cost; a projection contains the closure, records its seams and never silently trims a required member to fit a carrier or capability budget | [AC-010](#ac-010-material-closure), [AC-011](#ac-011-projection) | the seed set and the relation family: the evaluation that applies them, for a step [ACTIVATION §2](ACTIVATION.md#2-context-construction-under-an-envelope) | 7, 10 |
| P3 (independent), P6 (independent) | By P3 a basis is immutable once bound, and by P6 a change to its meaning needs an owned relation, so an overlay adds records without mutating its basis; override, disambiguation, equivalence, specialisation or translation exists only as a typed relation with its authority | [AC-012](#ac-012-overlay) | each overlay relation: its owner | 2, 10 |
| P4b (derived from P0 and P2), P3 (independent), P6 (independent) | By P4b a transformation's effects are facts that persist, by P3 they bind exact records, and by P6 their classification is accountable, so a transformation proves a closed delta over local records and external resolutions, each classified once as preserved or removed, with preservation shown by byte or typed equality; its result is a proposed successor that admits nothing | [AC-013](#ac-013-transformation) | each transformation, with its operation authority and preservation relation: the owner of the transformation record | 3, 4, 10 |
| P6 (independent), P3 (independent) | By P6 judgment and promotion are separate authorities, and by P3 a judgment binds its exact subject, so a judgment points to an unchanged subject, and promotion is a separate relation between that subject and its admission or acceptance judgment | [AC-014](#ac-014-judgment-separation) | none | 9, 10 |
| P4a (independent), P3 (independent), P6 (independent); (iii) | By P4a a traversal composes only through its declared contract, by P3 it binds one functor kind, by P6 its authority is separate, and by (iii) applications include construction and judgment under different processing conditions, so a traversal is a typed contract applied under exactly one functor kind; total deterministic processing, bounded probabilistic construction and human adjudication are distinct kinds, each distinct from actor, executor and domain operation, and the name asserts no categorical functor; traversals compose only under typed composition, which keeps both identities and every intermediate fact | [§5](#5-traversals-and-functor-kinds), [AC-015](#ac-015-functor-classification), [AC-016](#ac-016-typed-composition) | F_D purpose extending to deterministic construction, its total-domain requirement and the unchanged-subject evaluation profile: §5; the functor kinds permitted for each traversal: the owning signature; the order of kinds in an application: that application | 4, 8, 10 |
| P1 (independent), P6 (independent), P4b (derived from P0 and P2); (ii), (iii) | By P1 an interpretation is a proposal about meaning, by P6 its acceptance is separate, by P4b its provenance persists, and by (ii) and (iii) models are interpreted from exact subjects and partly checked mechanically, so an interpretation proposes a model that its construction does not accept; every admitted record has exact provenance or is identified as model-local, every evaluated subject declaration has a disposition, structural success is evidence for semantic review and never a substitute, and a valid model satisfies every applicable law | [§6](#6-interpretation-and-models), [AC-017](#ac-017-interpretation-fidelity), [AC-018](#ac-018-structural-and-semantic-separation), [AC-019](#ac-019-valid-model) | the interpretation contract and the semantic selection and acceptance authority: the downstream authority of the subject; a decision contract for a semantic subset: the model that supplies it | 6, 10 |
| P3 (independent), P6 (independent); (ii) | By P3 the calculus, a model and a carrier are distinct objects, by P6 each has its own proof obligation, and by (ii) a model may be encoded in several carriers, so the calculus, an interpreted model and an encoded carrier have separate identities, judgments and proof obligations; encoding needs an accepted judgment over the unchanged model, and a downstream success ratifies no upstream layer | [§7](#7-layers), [AC-020](#ac-020-layer-and-release-separation) | Product status of a layer: the external authority that selects and releases it | 6, 10 |
| P3 (independent), P6 (independent) | By P3 an edition binds its exact published bytes, and by P6 its identity record is a separate authority, so an edition's identity is an external record over its published bytes and its derivation clauses, created after the bytes exist; interpreted and encoded identities bind their upstream identities, and judgments stay outside the identities they judge | [§8](#8-calculus-identity) | the record shape, RFC 8785 canonicalisation, SHA-256 and the order of principle references: this member; the record grammar and issuance authority for interpreted and encoded identities: the owning Product; issuance of this edition's record: its release, under [RELEASE](RELEASE.md) | 2, 10 |
| P2 (independent), P6 (independent) | By P2 the calculus serves applications without choosing for them, and by P6 selection and release belong to their owners, so the calculus selects, constructs, accepts or releases no concrete interpretation or carrier, and an application's import, translation or specialisation stays external to it | [Application boundary](#application-boundary), [External imports and specialisations](#external-imports-and-specialisations) | each application's subject, interpretation, carrier and imports: the downstream authority that owns the application | 1, 10 |
| P0 (recovered), P2 (independent), P4b (derived from P0 and P2), P6 (independent); (i), (iii) | P0 bounds what an actor can hold and P2 fixes the task's destination, so an actor needs the constraints of one task, not the whole model, and the material closure and projection of AC-010 and AC-011 supply them as a constraint surface. P4b keeps every residual until an authorised disposition, so unresolved conditions travel with the surface and block the work that depends on them; P6 keeps authority, evidence and acceptance apart, so a surface grants no authority and its validity, fidelity and sufficiency for a task are separate claims | [Constraint surfaces](#constraint-surfaces) | the interpretation used and which one is current: the downstream authority of the subject; the seed set and relation family of a task: the activation that applies them, for a step [ACTIVATION §2](ACTIVATION.md#2-context-construction-under-an-envelope); a mechanical projection: a separately selected checking contract | 7, 10 |
| P6 (independent) | By P6 a claim about this member holds only on evidence that tests each law, so a review or qualification of this member covers each law with positive and refusal cases, and no example, checker, model or carrier qualifies a law beyond the claim it evaluates | [§10](#10-conformance-obligations) | the ten obligations as the minimum coverage: this member; a policy of this member: each law is covered by positive and refusal cases | 9, 10 |

Consumers of these rows, where an actor enters them (FOUNDATIONS §3
Foundation to law, Consumers), one list per row, each consumer linked to
its own locus:

- Row 1, position and derivation provenance: [§8 Calculus identity](#8-calculus-identity), whose `derivation_basis` names the governing clauses identified under Derivation provenance and keeps their premise role distinct from the published calculus member; the family tables of [ODD](ODD.md#foundation-to-law), [TRAVERSAL_OCCURRENCE](TRAVERSAL_OCCURRENCE.md#foundation-to-law) and [WORLD_MODEL](WORLD_MODEL.md#foundation-to-law), whose rows import F9.
- Row 2, scope and exclusions: [SPEC_METHOD §11 Build-tenant binding](SPEC_METHOD.md#11-build-tenant-binding), rule 6, where a representation in a_c prescribes no executor and establishes no execution conformance by itself; otherwise no separate consumer applies: the claims the calculus does not make are limits on this member's own rules, and what an application selects, accepts or executes is that application's under [Application boundary](#application-boundary), traced in row 17.
- Row 3, closed signature, typed records and reference closure: [TRAVERSAL_OCCURRENCE Imported calculus boundary](TRAVERSAL_OCCURRENCE.md#imported-calculus-boundary), which instantiates its signature over `RecordKind_ac` and `Population_M` unchanged and refuses hidden records and ambiguous references, [Closed semantic-object sorts](TRAVERSAL_OCCURRENCE.md#closed-semantic-object-sorts), where every `_ref` resolves exactly once under AC-003, and [Closed constraint, judgment, residual and stop kinds](TRAVERSAL_OCCURRENCE.md#closed-constraint-judgment-residual-and-stop-kinds), where a dangling reference refuses under AC-003; [AC-007](#ac-007-constraint-and-refusal), whose `refusal(constraint)` names a missing record family and a dangling reference; [AC-019](#ac-019-valid-model), clause 2.
- Row 4, scoped identity and relation typing: [Constraint surfaces](#constraint-surfaces), whose objects carry identity under AC-002 and whose predicates and dependencies include the typed relations of AC-004; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), discriminator 22. IDENTITY's lead records that AC-002 applies the scoped identity of IDENTITY §2 and applies nothing of AC-002.
- Row 5, authority conservation and basis coherence: [AC-007](#ac-007-constraint-and-refusal), whose `refusal(basis)` names mixed bases with no composite-basis relation; [Constraint surfaces](#constraint-surfaces), where the surface grants no authority and binds the calculus basis as a separate coordinate; [AC-019](#ac-019-valid-model), clause 2; [§5](#5-traversals-and-functor-kinds), the kind-specific no-authority application of AC-005. No section of another member applies them: the generic rules they bind to a_c records are FOUNDATIONS §2 Authority kinds', RF-005's and RF-006's, each applied by its own consumers.
- Row 6, constraint judgment and the stop algebra: [TRAVERSAL_OCCURRENCE Closed constraint, judgment, residual and stop kinds](TRAVERSAL_OCCURRENCE.md#closed-constraint-judgment-residual-and-stop-kinds), which maps its stops under AC-007 and refines them under the parent-value rule of §5; [AC-010](#ac-010-material-closure), [AC-011](#ac-011-projection), [AC-013](#ac-013-transformation), [AC-015](#ac-015-functor-classification), [§6 Interpretation and models](#6-interpretation-and-models) and [§7 Layers](#7-layers), each of which takes the core value of its stops or judgments under AC-007; [Constraint surfaces](#constraint-surfaces), required results and condition 2.
- Row 7, latitude: [Constraint surfaces](#constraint-surfaces), permitted freedom and condition 1; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), discriminators 17 and 18. The generic rule over any two values is FOUNDATIONS §4 Algebra, Latitude's, which cites AC-008 as provenance only.
- Row 8, residual conservation: [Constraint surfaces](#constraint-surfaces), unresolved conditions and condition 2; [AC-013](#ac-013-transformation), where material residuals remain in the successor unless an authorised disposition is in the transformation evidence; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), discriminator 16.
- Row 9, material closure and projection: [ACTIVATION §2](ACTIVATION.md#2-context-construction-under-an-envelope), steps 1 and 2, and [§3 Admission and activation](ACTIVATION.md#admission-and-activation), `closure_unresolved`; [Constraint surfaces](#constraint-surfaces), whose surface is the projection over the material closure of a task's seed set; [TRAVERSAL_OCCURRENCE](TRAVERSAL_OCCURRENCE.md#traversal_occurrence), its lead, which keeps its `Projection` record apart from an AC-011 projection. The rule that no reference trims a required member is FOUNDATIONS §4 Algebra, Reference versus body's, which AC-011 applies.
- Row 10, overlay: [PRODUCT_DEFINITION §5](PRODUCT_DEFINITION.md#5-bounded-context-semantic-resolution), which relates its four semantic-resolution kinds to the typed relations AC-012 names; [AC-019](#ac-019-valid-model), clause 3.
- Row 11, transformation: [FOUNDATIONS §4](FOUNDATIONS.md#4-algebra), Conservation accounting; [REFERENCE_FRAME §6 Evidence or coordinate translation](REFERENCE_FRAME.md#evidence-or-coordinate-translation), where a translation represented in a_c is recorded in the fields of AC-013; [SPEC_METHOD §11 Build-tenant binding](SPEC_METHOD.md#11-build-tenant-binding), rule 7; [Constraint surfaces](#constraint-surfaces), admissible operations.
- Row 12, judgment separation: [Constraint surfaces](#constraint-surfaces), evidence; [§7 Layers](#7-layers), where the acceptance judgment is over the unchanged model and neither judgment enters the identity of its subject; [§8 Calculus identity](#8-calculus-identity), where the semantic-acceptance and carrier-admission judgments point to unchanged identities and are embedded in neither. No section of another member applies it; EVALUATION §5 Acceptance states that a disposition is over an unchanged subject as its own rule and cites AC-014 as provenance only.
- Row 13, traversals, functor kinds and typed composition: [ACTIVATION §4 Refinement](ACTIVATION.md#refinement), where each output satisfies the next step's declared domain and preconditions as AC-016 requires; [TRAVERSAL_OCCURRENCE Closed constraint, judgment, residual and stop kinds](TRAVERSAL_OCCURRENCE.md#closed-constraint-judgment-residual-and-stop-kinds), whose functor-kind refs leave their laws with §5, and [Occurrence identity](TRAVERSAL_OCCURRENCE.md#occurrence-identity), where every retained application under AC-016 has its own occurrence; [ODD](ODD.md#odd), its lead, and [ODD §5 Probabilistic compute](ODD.md#probabilistic-compute), which imports common F_D by exact edition and retains the separately bound F_P and F_H specialisations, and [ODD §5 Graph functions](ODD.md#graph-functions), where each inner function's input satisfies its declared domain as AC-016 requires; [PROFILES §1](PROFILES.md#1-the-boundary), which keeps the traversal record and the functor kinds as this member's terms and binds them only by declaration; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), discriminators 22 and 51; [AC-013](#ac-013-transformation), as a specialisation of one traversal record, and [AC-007](#ac-007-constraint-and-refusal), whose `refusal(constraint)` names an application without its traversal. Additional common-kind consumers: [AC-019](#ac-019-valid-model), clause 3, which applies AC-015 and the bound kind contract to model validity; [§7](#7-layers), which applies the total-domain contract and evaluation profile to carrier admission; [EVALUATION §2](EVALUATION.md#2-separation), the unchanged-subject profile; [SPEC_METHOD §11](SPEC_METHOD.md#11-build-tenant-binding), operation versus kind; [DESIGN_MODULE §2](DESIGN_MODULE.md#2-graph-execution-alignment-and-escalation), independent governance scope and conditional eligibility; [RELEASE §9 Deterministic-kind migration](RELEASE.md#deterministic-kind-migration), legacy evidence and successor status; [ACTIVATION §4](ACTIVATION.md#4-totality-and-refinement), total handling versus termination; [ODD A5](ODD.md#115d-constructive-evaluation-and-yield-loop) and [§11.7A](ODD.md#117a-conforming-agentic-development), actual admission and closure owners; [CONFORMANCE D301](CONFORMANCE.md#deterministic-kind-and-continuation-discriminators), with [the finite examples](examples/DETERMINISTIC_CONTRACTS.md), the affected distinctions.
- Row 14, interpretation and models: [EVALUATION §2](EVALUATION.md#2-separation), which binds its separation to a_c models through AC-018 and AC-019; [SPEC_METHOD §11 Build-tenant binding](SPEC_METHOD.md#11-build-tenant-binding), rule 6; [TRAVERSAL_OCCURRENCE Imported calculus boundary](TRAVERSAL_OCCURRENCE.md#imported-calculus-boundary), where an occurrence model satisfies a_c under its signature; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), discriminators 13, 14, 20, 40 and 45; [§7 Layers](#7-layers) and [§8 Calculus identity](#8-calculus-identity), where an interpreted model awaits a separate acceptance judgment and its identity binds the interpretation contract; [Constraint surfaces](#constraint-surfaces), which an interpretation yields, conditions 5 and 6.
- Row 15, layers and release separation: [SPEC_METHOD §6 Lineage and release](SPEC_METHOD.md#6-lineage-and-release), where layer and release separation holds for release lineage; [FOUNDATIONS §4](FOUNDATIONS.md#4-algebra), Formal fragment, where the separate identities of a_c, its interpretations and their carriers are AC-020's; [§8 Calculus identity](#8-calculus-identity), which binds the identity of each layer and issues this edition's record under AC-020. RELEASE's lead imports §7 and §8 and applies no rule of them.
- Row 16, calculus identity: [TRAVERSAL_OCCURRENCE Closed profile signature](TRAVERSAL_OCCURRENCE.md#closed-profile-signature), whose calculus-basis identity resolves the record and the derivation account that §8 defines; otherwise no separate consumer applies: issuance of this edition's record is its release's act under RELEASE, whose lead imports §8 and applies no rule of it, and IDENTITY's lead leaves the identity of a calculus edition to §8 without restating it.
- Row 17, application boundary and external imports: [§5 Traversals and functor kinds](#5-traversals-and-functor-kinds), where a same-spelled term specialises the traversal record only through a declared binding under its owner's authority; [Constraint surfaces](#constraint-surfaces), which selects, constructs and accepts no interpretation under the Application boundary; [§8 Calculus identity](#8-calculus-identity), where the owning Product defines the record grammar and issuance authority of the downstream identities. No section of another member applies them: [PROFILES §1](PROFILES.md#1-the-boundary) states the declared-binding rule from the profile's side as its own, under which TRAVERSAL_OCCURRENCE imports this member, and ACTIVATION §4 Refinement states the declaration conditions of a specialised contract as its own.
- Row 18, constraint surfaces: [ACTIVATION §2](ACTIVATION.md#2-context-construction-under-an-envelope), Acquisition, where a step acquires a current surface as a derived surface under this section's conditions; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), discriminators 15 to 18.
- Row 19, conformance obligations: no separate consumer applies. The obligations bind a review or qualification of this member and are read where that claim is made; the conformance obligations of [TRAVERSAL_OCCURRENCE](TRAVERSAL_OCCURRENCE.md#conformance-obligations) are that profile's own, over its signature, and name this section nowhere.

Each consumer applies the rule and decides nothing the owning section does
not (P2, P6).

Purpose and material relation: an actor
started on this member sees which rules of the calculus follow from the
foundations and which are choices, with the owner of each choice, so no
choice is presented as derived (P6, P1).

## 2. Signature

An `a_c` signature is (P3, P1):

```text
Sigma = (
  RecordKind,
  Sort,
  RelationKind,
  ConstraintKind,
  ResidualKind,
  FunctorKind,
  JudgmentKind,
  StopKind
)
```

`a_c` fixes this finite core record-kind set:

```text
RecordKind_ac = {
  urn:stdo:concept:axiomatic-calculus:record-kind:semantic-object,
  urn:stdo:concept:axiomatic-calculus:record-kind:typed-relation,
  urn:stdo:concept:axiomatic-calculus:record-kind:constraint,
  urn:stdo:concept:axiomatic-calculus:record-kind:latitude,
  urn:stdo:concept:axiomatic-calculus:record-kind:residual,
  urn:stdo:concept:axiomatic-calculus:record-kind:traversal,
  urn:stdo:concept:axiomatic-calculus:record-kind:transformation,
  urn:stdo:concept:axiomatic-calculus:record-kind:judgment
}
```

Every `a_c` signature imports those identities unchanged. A model-family
signature specialises their fields, value domains, reference domains and
admissible kinds; it does not remove, rename, shadow or silently add a
core record family. Another fundamental record family requires an explicit
compatible calculus extension, never an extra subject sort (P3).

Every signature member is a finite, closed identity set for one model
family. The signature defines:

- the fields and value domains of every sort and record family;
- the reference domain and cardinality of every identity-bearing field;
- the allowed source and target sorts for every relation kind;
- the subject and predicate domains of every constraint kind;
- the subject, uncertainty, consequence and re-entry domains of every
  residual kind;
- the input, output, evidence and stop contract of every judgment kind;
  and
- the functor kinds permitted for each traversal.

Unknown kinds and fields are not extensions. They require a new signature
or an explicit compatible extension relation (P1, P6).

An `a_c` model over exact basis `b` is:

```text
M_b = (b, I, O, E, C, L, X, V, T, J)

Population_M = {
  urn:stdo:concept:axiomatic-calculus:record-kind:semantic-object  -> O,
  urn:stdo:concept:axiomatic-calculus:record-kind:typed-relation  -> E,
  urn:stdo:concept:axiomatic-calculus:record-kind:constraint      -> C,
  urn:stdo:concept:axiomatic-calculus:record-kind:latitude        -> L,
  urn:stdo:concept:axiomatic-calculus:record-kind:residual        -> X,
  urn:stdo:concept:axiomatic-calculus:record-kind:traversal       -> V,
  urn:stdo:concept:axiomatic-calculus:record-kind:transformation  -> T,
  urn:stdo:concept:axiomatic-calculus:record-kind:judgment        -> J
}
```

where `I` is the closed identity universe; `O` the finite set of typed
semantic objects; `E` the finite set of typed directed relations; `C` the
finite set of constitutional constraints; `L` the finite set of declared
latitude records; `X` the finite set of residual uncertainty records; `V`
the finite set of traversal records; `T` the finite set of transformation
records; and `J` the finite set of judgment records.

`Population_M` is a total function over `RecordKind_ac`. Every population
is finite, every fundamental record belongs to exactly one population, and
record identities are unique across their disjoint union. Let `Local_M` be
that union. Then `I = Local_M disjoint_union External_M`, where every
member of `External_M` is admitted only through one signature-declared
external reference domain and exact resolution relation. A hidden record,
an unpopulated extra record family, an identity occurring in two
populations, or an identity in `I` with neither one local record nor one
lawful external resolution refuses the model. A population may be empty
only when the selected signature does not require a member of that record
kind (P3, P5).

The signature declares a finite reference-domain function:

```text
RefDomain_Sigma(record_kind, field)
  -> (cardinality,
      allowed_local_record_kinds,
      allowed_semantic_object_sorts,
      allowed_external_target_kinds,
      required_basis_relation)
```

Every scalar or collection member that carries an identity reference is
checked through that function. A local reference resolves across the exact
`Population_M` family named by its target record kind; a reference to a
semantic object also satisfies the declared target sort. An external
reference resolves through exactly one declared external target kind and
basis relation. No reference may resolve both locally and externally.
Missing field domains, wrong-family targets, wrong-sort targets, ambiguous
targets and dangling external identities refuse structural admission (P3,
P6).

The tuple is abstract. A carrier may use records, tables, terms, clauses,
code or any other representation only when its encoding profile proves
that every tuple relation is preserved or explicitly refused (P1, P4b).

## 3. Typed records

The following subsections define the exact shapes of five of the eight
core record families. `SemanticObject`, `TypedRelation`, `Constraint`,
`Latitude` and `Residual` populate `O`, `E`, `C`, `L` and `X`. The
traversal record (§5), the transformation record (AC-013) and the judgment
record (AC-014) populate `V`, `T` and `J`. A traversal, transformation or
judgment is not placed in `O` merely by reifying its name as a semantic
object. A subject model may independently represent the concept of a
record kind, but that representation does not satisfy the core population
law (P3, P1).

### Semantic object

Every semantic object has exactly (P3):

```text
SemanticObject = {
  id,
  sort,
  context,
  owner,
  scope,
  basis,
  value
}
```

`id`, `sort`, `context`, `owner` and `basis` are identities. `scope` is
the closed governed domain. `value` is sort-defined carrier-neutral content
or a reference to exact content. A semantic object is an Object of
FOUNDATIONS §2 whose scoped identity is carried by `id`, `owner` and
`sort` and whose boundary is `scope`.

### Typed relation

Every relation has exactly (P3, P4a):

```text
TypedRelation = {
  id,
  kind,
  source,
  target,
  context,
  owner,
  scope,
  basis,
  qualifiers
}
```

`source` and `target` resolve to members of `I`. `qualifiers` is the
closed kind-specific record declaring direction, cardinality,
preservation, loss, inverse, invalidation or other relation semantics
required by the signature.

### Constraint

Every constraint has exactly (P6, P5):

```text
Constraint = {
  id,
  kind,
  applies_to,
  predicate,
  context,
  owner,
  scope,
  basis,
  judgment_kind,
  latitude_ref,
  refusal
}
```

`kind` resolves one declared `ConstraintKind`; `judgment_kind` resolves
one declared `JudgmentKind`. The owning signature defines the predicate
language and how its result is judged. A predicate that is not
deterministically decidable states the required probabilistic or human
judgment kind rather than pretending to be a machine proof (P6, P1).

### Latitude

Latitude is an explicit permission set inside a constraint boundary (P6):

```text
Latitude = {
  id,
  applies_to,
  allowed_variation,
  forbidden_variation,
  context,
  owner,
  scope,
  basis,
  invalidation
}
```

Silence is not latitude. Latitude grants no authority beyond its owner,
scope, basis and invalidation law, an instance of
[FOUNDATIONS §2 Authority kinds](FOUNDATIONS.md#authority-kinds), What
creates no authority (P6).

### Residual

Residual uncertainty is first-class model content; a residual record is
the Residual of FOUNDATIONS §2 carried inside a model (P4b):

```text
Residual = {
  id,
  subject,
  kind,
  uncertainty,
  consequence,
  context,
  owner,
  scope,
  basis,
  re_entry,
  invalidation
}
```

Projection, compression, interpretation or encoding cannot erase a
residual. It remains represented, is explicitly dispositioned by competent
authority, or causes refusal (P4b, P6).

`kind` resolves one declared `ResidualKind`. The owning signature defines
its lawful subject, uncertainty, consequence, re-entry and invalidation
domains. An undeclared residual kind or value refuses structural admission
(P3).

## 4. Fundamental laws

The objects these laws govern are the records of §2, §3 and §5 and the
ontology of FOUNDATIONS §2; where a law names identity, authority, basis
or residual, the definition is FOUNDATIONS' and the law is this member's.

### AC-001 Closed signature

Every admitted object, relation, constraint, latitude, residual,
traversal, transformation specialisation and judgment belongs to one
declared signature. Every fundamental record also occurs exactly once in
the total `Population_M` function under its declared `RecordKind_ac`.
Missing, duplicate, shadowed or unknown record kinds and populations fail
closed (P3, P5).

### AC-002 Scoped identity

This law applies the scoped identity of
[IDENTITY §2](IDENTITY.md#scoped-identity), the identity of an Object of
FOUNDATIONS §2, to every identity in `I`. Its coordinates map to that
identity as follows: the owner is the identity's authority, the type is
its kind, and the member it resolves is what its value denotes; context,
scope and basis are further coordinates, which IDENTITY §2 permits and
`a_c` requires. So an identity resolves one member under one type,
context, owner, scope and basis. That equal representations do not
establish equal meaning is FOUNDATIONS §2, Representation. The `a_c`
binding beside it: equal spelling, payload equality, position in any
structure and carrier equality do not establish semantic identity (P3).

### AC-003 Reference closure

Every referenced identity resolves exactly once in the applicable model or
through one explicit external relation. Resolution uses the exact
`RefDomain_Sigma(source_record_kind, field)` declaration across the
model's record populations. Dangling, duplicate, wrong-record-kind,
wrong-sort, wrong-basis, locally-and-externally ambiguous or
undeclared-field references refuse structural admission (P3, P5).

### AC-004 Relation typing

A relation is lawful only when its kind admits the exact source and target
sorts and all required qualifiers are present. Direction is material
unless the relation kind explicitly declares symmetry (P4a, P3).

### AC-005 Authority conservation

Objects, relations, constraints, latitude, residuals, traversals,
transformations, projections and judgments retain their declared semantic,
operation, evaluation and decision authority (the kinds of
[FOUNDATIONS §2 Authority kinds](FOUNDATIONS.md#authority-kinds)). What
creates no authority is listed there; in `a_c` its instances are copying,
interpreting, encoding, evaluating and transporting a record, none of
which transfers authority (P6, P4b).

### AC-006 Basis coherence

Every result binds its exact basis under
[RF-005](REFERENCE_FRAME.md#rf-005-exact-basis-and-coordinates), which
owns the exact-basis rule for results; what a basis is, including that
mixed bases need an explicit composite relation, is FOUNDATIONS §2,
Basis. This law binds the same rule to every fundamental record and model
of `a_c`: each binds an exact basis, the composite-basis relation of a
mixed basis is an explicitly owned record, and individually valid
coordinates do not create a coherent composite basis by proximity (P6, P3).

### AC-007 Constraint and refusal

Each constraint names its governed subject, predicate, judgment kind,
latitude and refusal (§3, Constraint). The judgment of a constraint
returns one value of the core result algebra of
[FOUNDATIONS §4 Results](FOUNDATIONS.md#results), directly or through a
refinement that the owning signature declares and that maps each of its
values to exactly one core value. Under the no-coercion rule of
FOUNDATIONS §4 Results, a failed, missing, indeterminate, out-of-scope or
invalid-basis result of a constraint follows that algebra and is never
coerced to satisfied (P5, P6). The
core values, the rule that no mapping raises a result's standing and the
boundary among out_of_frame, indeterminate and an evaluation that was not
performed are FOUNDATIONS §4 Results'. This law applies them to the
judgment of a constraint and to the outcomes of the operations of this
member, and adds no core value.

Constraint results. The outcomes of a constraint's judgment map for the
predicate "the constraint's predicate holds for its governed subject on
the exact basis" (P5, P6):

| Outcome | Core value | Ground |
|---|---|---|
| holds | satisfied | the judgment establishes the predicate on the exact basis |
| failed | falsified | a counterexample defeats the predicate; the judgment names it |
| indeterminate | indeterminate | the admissible evidence cannot decide the predicate; the judgment names the evidence that would decide |
| out of scope | out_of_frame | the predicate is asked of a subject or relation outside the constraint's declared `applies_to`, context or scope, so deciding it needs a relation the constraint does not declare; the judgment names that relation, with its owner where the subject gives one |
| invalid basis | invalid_basis | the subject or basis cannot support the judgment; the judgment names the basis repair |

A missing result is no value of this refinement: a judgment that was not
performed has no closed result, is never `indeterminate`, and enters every
conjunction over it as a planned assessment without a closed result
(FOUNDATIONS §4 Results, Not performed).

Operation outcomes. A closure (AC-010), a projection (AC-011), the
structural admission of a record, model or carrier, the application of a
transformation (AC-013) and an interpretation (§6) each end in their
declared result or in one of the stops `hold`, `gap` and `refusal` that
this member writes. Where this member says that a condition refuses, the
operation returns `refusal` naming the condition; the record, model or
carrier is not admitted, and nothing is dropped silently. Each outcome
maps for the predicate "the operation yields its declared result on the
exact basis" (P5, P6):

| Outcome | Core value | Ground |
|---|---|---|
| declared result | satisfied | the closure, the projection with its boundary, the admission, the proposed successor `M_b_prime*` or the proposed model `M_subject*` is returned on the exact basis; a proposed successor or model establishes that it is available, never its acceptance or admission (FOUNDATIONS §4 Results) |
| `hold` | indeterminate | the operation was applied and stops because evidence, an observation or a disposition it needs is not yet admitted, so the admissible evidence cannot decide whether it yields its result; its residual names what would decide |
| `gap` | invalid_basis | the result needs a member, reference, resolution or declaration whose resolution on the basis is still open: the declared relation that resolves it has not yet decided it, as for an external resolution not yet evaluated; the result is undefined on this basis until it is supplied. A reference evaluated to no target is dangling and refuses (AC-003): a local reference with no record in the model's closed population, and an external reference whose declared resolution has been evaluated and yields no target |
| `refusal(constraint)` | falsified | every refusal that is not `refusal(basis)`: the refusal names a demonstrated violation of a declared law of this member or a constraint of its signature by the record, model, carrier, transformation or application under judgment, including a missing record family (AC-001), a dangling reference (AC-003) and an application without its traversal (AC-015), or it names no condition of the basis; the violation or other defect it names is the counterexample |
| `refusal(basis)` | invalid_basis | the refusal names one or more conditions of the basis the operation acts on and no demonstrated violation of a declared law or constraint by the record, model, carrier, transformation or application under judgment: a seed set, relation family, required-edge semantics, basis or scope that is not exact; a fixed point that is not finite and unique; an input model, subject or carrier whose exact identity, basis or admission is not established; or mixed bases with no composite-basis relation (AC-006) |

The cause is part of a refusal's value, because a refusal would otherwise
map to falsified or to invalid_basis according to its cause, and a refined
value maps to exactly one core value (FOUNDATIONS §4 Results,
Refinements). A refusal that names a demonstrated violation of a declared
law or constraint by the record, model, carrier, transformation or
application under judgment is `refusal(constraint)`, whatever condition of
the basis it also names. The basis condition is recorded with the refusal
and reported beside it as its own `invalid_basis` result, which names the
basis repair and answers the predicate of the evaluation that the
condition leaves without a supporting basis, never the operation-outcome
predicate that the refusal answers
([FOUNDATIONS §4 Conjunction of results](FOUNDATIONS.md#conjunction-of-results),
Predicates travel). A refusal that names only conditions of the basis is
`refusal(basis)`. A violation inside an input that the operation acts on
as its basis is a condition of the basis for that operation, not a
violation by what it judges, as the projection below shows. Purpose and
material relation: a demonstrated violation is a known failure, which
survives every join only as a `falsified` result, so a basis condition
named beside it neither hides the failure nor discards its counterexample,
and the basis repair stays named (FOUNDATIONS §4 Conjunction of results,
Survival; P5, P6). A basis mismatch inside a model or a record, a
relation's qualifier record included, is mixed bases with no
composite-basis relation (AC-006): a coordinate of the model or record
binds, or a reference in it resolves on, a basis that the governing basis
relation does not admit, as a wrong-basis reference of AC-003 does. It is
a condition of the basis, in the structural admission that judges that
model or record as in every other operation, and never a violated
constraint of a signature, even where the signature declares the basis
relation; a refusal that names only such a mismatch is `refusal(basis)`.
One defect can bear on two predicates: a model that violates AC-001 is
`refusal(constraint)` in the structural admission that judges it and
`refusal(basis)` in a projection over it, and each outcome answers its own
predicate. An operation that was not applied has no outcome. A stop `gap`
is a closed result with the value invalid_basis; it is not the absence of
a result that
[FOUNDATIONS §4 Conjunction of results](FOUNDATIONS.md#conjunction-of-results)
records as a gap. A signature's stop contract and a traversal record map
stops of their own under §5.

Purpose and material relation: a
constraint result or an operation's stop combines with results of other
members only through the one core, so a refusal, a hold or a gap is
neither read as success nor mistaken for another case; and a closure or
projection that is not established has the value invalid_basis here, as
the activation outcome `closure_unresolved` of
[ACTIVATION §3](ACTIVATION.md#admission-and-activation) has for its own
predicate (P5, P6).

### AC-008 Explicit latitude

Two values may differ lawfully only through an applicable latitude record
or transformation relation. An implementation preference, a probabilistic
choice or a human presence is not implicit latitude. FOUNDATIONS §4 states
the same rule for any two values; this law is its form over `L` and `T`
(P6, P1).

### AC-009 Residual conservation

Every material uncertainty, omission, translation loss, unresolved
boundary or unproven relation remains in `X` until an authorised
disposition creates an exact successor model. Absence from a projection is
not resolution (P4b).

### AC-010 Material closure

For model `M`, seed set `Z` and exact dependency relation family `R`,
material closure is the least fixed point (P0, P2):

```text
closure_R(M, Z) = lfp(lambda Q: Z union required_R(M, Q))
```

The result is defined only when `Z`, `R`, required-edge semantics, basis
and scope are exact and the fixed point is finite and unique. Failure to
establish those conditions returns a gap or refusal: `gap` where a
condition is unresolved on the basis, otherwise `refusal(basis)`, because
each condition bears on the basis the closure acts on (AC-007). Least
closure means least lawful record closure under `R`; it does not claim
globally minimal prose, bytes, tokens, cost or cognitive effort.
ACTIVATION §2 applies this closure to the construction of a step's context
under an envelope.

### AC-011 Projection

A projection selects a view of a model without changing selected meaning
(P4b, P2):

```text
project(M, Z, R) -> (M_Z, Boundary_Z) | gap | refusal
```

`M_Z` contains the material closure of `Z`, so a projection's `gap` or
`refusal` is that of the closure it contains or of the model it acts on:
`gap` or `refusal(basis)` (AC-007). `Boundary_Z` records excluded,
external, unresolved, translated and invalidation-sensitive seams. A
projection is not a new semantic owner. It is a reference, so the rule
that no reference trims a required member to fit a carrier or budget,
stated at [FOUNDATIONS §4](FOUNDATIONS.md#4-algebra), Reference versus
body, applies to it: here the required members are those of the material
closure of `Z`, and a capability budget is one such budget. ACTIVATION §2
applies the projection to a step's context, and every projected frame of
this corpus is one.

Sufficiency for later decisions consumes
[FOUNDATIONS §4 Observation sufficiency](FOUNDATIONS.md#assertions-and-observation),
including the distinctions required by the bound consumer and continuation.
A projection by itself establishes neither a Markov property nor a
categorical-functor claim (P1, P6).

### AC-012 Overlay

An overlay adds explicit records to one or more declared `Population_M`
families of a basis model. It does not mutate the basis. Override,
disambiguation, equivalence, specialisation or translation exists only as
a typed relation with exact authority, direction, scope, basis,
preservation, loss, refusal and invalidation semantics (P3, P6).

### AC-013 Transformation

A transformation is an operation-bearing specialisation of one exact
traversal record `v` (§5). Its record is (P4b, P3):

```text
t = {
  id,
  traversal,
  domain_model,
  codomain_model,
  context,
  owner,
  scope,
  basis,
  operation_authority,
  preconditions,
  preservation_relation,
  preserved,
  introduced,
  removed,
  external_preserved,
  external_introduced,
  external_removed,
  external_resolution_witnesses,
  residuals,
  evidence,
  provenance,
  stop_states,
  invalidation,
  re_entry
}
```

`t.traversal` resolves one `v`; its context, owner, scope, basis,
operation authority, evidence, provenance and stop contract equal or
lawfully restrict the corresponding traversal coordinates. A broader or
mismatched coordinate refuses (P6).

`domain_model` and `codomain_model` resolve exact content identities of
the complete input and proposed successor models. Each model identity
commits to its exact calculus basis, signature identity, complete finite
`Population_M`, complete `External_M`, exact external-resolution map and
selected model-content identity under the owning identity law. A mutable
locator, a model-family name, a partial projection or a population digest
without the exact model identity refuses (P3).

For each `x in External_M`, the model's exact resolution relation
determines:

```text
Resolution_M(x) = {
  external_identity,
  reference_domain,
  external_target_kind,
  resolved_target_identity,
  basis_relation,
  resolution_basis,
  evidence_identity
}

ResolutionSet_M = { Resolution_M(x) | x in External_M }
```

`Resolution_M` is a model coordinate supplied by the signature-declared
external reference relation, not a ninth fundamental record family. Every
field is identity-bearing and exact. One external identity has exactly one
resolution tuple in one model; a missing, ambiguous or extra tuple refuses
(P3).

For an ordinary same-basis transformation:

```text
basis(domain_model) = basis(codomain_model) = t.basis = basis(t.traversal)
signature(domain_model) = signature(codomain_model)
```

A cross-basis or cross-signature migration requires a separately
identified transformation specialisation whose exact composite-basis and
compatible signature-extension relations name both sides. No identity
whose basis or record kind changes belongs to `preserved`; the source
identity is removed and the successor identity is introduced, with their
continuity represented only by the exact migration relation (P3, P6).

`preservation_relation` resolves one exact typed equality relation
applicable to the declared domain and codomain model identities and record
kinds. It binds both model identities, both exact bases, comparison
domain, direction, authority, scope, evidence and equality law.
Equivalence or meaning-preservation may relate a removed identity to an
introduced identity; it cannot retain one identity in `preserved` (P1,
P3).

Let `Local_b` be the complete input-model local-record identity set, `P_t`
the identities named by `preserved`, `R_t` those named by `removed`, and
`N_t` the identities of the complete records named by `introduced`. A
lawful transformation proves the closed local-record delta (P4b):

```text
Local_b       = P_t disjoint_union R_t
Local_b_prime = P_t disjoint_union N_t
N_t intersect Local_b = empty
R_t intersect Local_b_prime = empty
```

For every identity in `P_t`, the input and successor records have the
same record kind, identity, context, owner, scope and basis. They are
either:

1. byte-identical under one exact canonical record grammar selected for
   both models; or
2. equal under the exact `preservation_relation` when the abstract
   records do not share such a byte grammar.

Canonical-byte equality and typed record equality are alternative proofs
of identity preservation, not carrier selection by the calculus. A changed
field, changed basis, changed record kind, nominally equal identifier,
equivalence or unbound assertion of preserved meaning refuses membership
in `P_t` (P3, P1).

Every removed identity is absent from the successor. Every introduced
identity is absent from the input and carries a complete lawful record in
exactly one successor population. Every input local-record identity is
classified exactly once as preserved or removed; no local record may be
silently dropped, retained or duplicated (P4b).

The external-resolution coordinates form a distinct closed delta. Let
`E_b` and `E_b_prime` be `ResolutionSet_M` for the domain and codomain
models; `EP_t`, `ER_t` and `EN_t` are exactly the resolution coordinates
named by `external_preserved`, `external_removed` and
`external_introduced`:

```text
E_b       = EP_t disjoint_union ER_t
E_b_prime = EP_t disjoint_union EN_t
EN_t intersect E_b = empty
ER_t intersect E_b_prime = empty
```

For every `x in EP_t`, `external_resolution_witnesses` contains exactly
one:

```text
ExternalResolutionPreservationWitness = {
  external_resolution: x,
  domain_model,
  codomain_model,
  domain_resolution: Resolution_domain_model(x),
  codomain_resolution: Resolution_codomain_model(x),
  decision: equal,
  evidence
}
```

The two resolution tuples are exactly field-equal. A nominally equal
external identifier, an equivalent target, a changed target kind, a
changed resolved target, a changed reference domain, a changed basis
relation, a changed resolution basis or a missing witness cannot enter
`EP_t`. Every member of `ER_t` has its complete resolution only in the
domain model; every member of `EN_t` has its complete resolution only in
the codomain model. A changed external resolution is a removal followed by
introduction of the new resolution coordinate and any separately declared
continuity relation; the referenced external identity may remain
unchanged, but the resolution is not preserved. Witnesses are total and
unique over `EP_t` and name no other resolution coordinate (P4b, P3).

Material residuals remain in the successor residual set unless an exact
authorised disposition is included in the transformation evidence.
Failure to establish any model identity, basis, population, local or
external partition, equality, external-resolution witness, residual or
codomain equation refuses (P4b, P5).

Application is:

```text
T[t](M_b, inputs) -> M_b_prime* | hold | gap | refusal
```

The exact transformation identity `t` declares every mutation it may
perform. The input model remains unchanged; `M_b_prime*` is a proposed
successor. A proposed successor does not accept or admit itself (P6). The
stops `hold`, `gap` and `refusal` take their core values under AC-007 by
their causes.
FOUNDATIONS §4 consumes this law as the conservation accounting of every
step: what was preserved, introduced and removed, the external resolution
witnesses and the residuals.

### AC-014 Judgment separation

A judgment points to an unchanged subject; it is the Judgment of
FOUNDATIONS §2 carried as a model record (P6):

```text
Judgment = {
  id,
  kind,
  subject,
  subject_digest,
  context,
  owner,
  scope,
  basis,
  evaluator,
  authority,
  decision,
  evidence,
  provenance,
  decided_at
}
```

Issuing a judgment does not transform, rewrite, reissue or rename its
subject. Promotion is an explicit relation between the unchanged subject
and its admission or acceptance judgment (P6, P3).

## 5. Traversals and functor kinds

A traversal is a typed contract (P4a, P6):

```text
v = {
  id,
  domain,
  codomain,
  context,
  owner,
  scope,
  basis,
  preconditions,
  postconditions,
  authority,
  evidence,
  provenance,
  stop_states
}
```

The traversal record is this member's own concept. A same-spelled term
owned by a profile, a realisation or a runtime is not imported by nominal
equality and does not specialise this record except through a declared
binding under that owner's authority (§9; P3, P1).

`a_c` defines three fundamental functor-kind identities (P3):

```text
F_D = urn:stdo:concept:axiomatic-calculus:f-d
F_P = urn:stdo:concept:axiomatic-calculus:f-p
F_H = urn:stdo:concept:axiomatic-calculus:f-h
```

Application notation is:

```text
F_K[v](X_v) -> Y_v | Omega_v
```

where `F_K` is one functor kind, `v` is one exact traversal identity,
`X_v` and `Y_v` are its typed input and result domains, and `Omega_v` is
its closed stop algebra. `Omega_v` is a refinement of the core result
algebra of [FOUNDATIONS §4 Results](FOUNDATIONS.md#results): it adds no
core value, and each of its stop values maps to exactly one core value,
never to `satisfied`. A stop this member writes, `hold`, `gap`,
`refusal(constraint)` or `refusal(basis)`, has the meaning and the core
value that AC-007 gives it. The signature's stop contract declares any
further stop value with the one core value it maps to, and may refine a
stop value by cause. A traversal record's `stop_states` binds the stop
mapping of that traversal, exactly one core value for each stop value; it
may refine a value of the signature's stop contract further by cause for
that traversal. Each refined value, whether the stop contract or a
`stop_states` declares it, names its parent value and its cause and maps
to its parent's core value: a value refined from `hold` to indeterminate,
from `gap` or `refusal(basis)` to invalid_basis, and from
`refusal(constraint)` to falsified. No refined value takes `satisfied`. A
different core value needs a different parent value, which only the member
that owns the parent declares; for these four stops that member is this
one. Neither the stop contract nor a traversal's `stop_states` raises a
result's standing (P5, P6). Purpose and material relation: one stop of one
traversal has one core value, so its consumers cannot read it two ways,
and no refinement gives a stop another core value, so a violated
constraint never becomes a case that the evidence merely cannot decide.

- `F_D` classifies total deterministic processing under an exact traversal
  contract. An application declares `f_B:D_B->Outcome_B`, its closed logical
  domain, exact basis, all material computational state and dependencies,
  and its termination argument. For every domain input it terminates with
  exactly one declared outcome. Closed domains may be infinite when
  termination and outcome determination are established. Open-world
  semantic choice and undeclared clock, filesystem or global dependencies
  are outside this contract (P3, P4a, P6).

  Here B is the exact basis of v, D_B is its declared logical input domain
  X_v (including material state and resource inputs), and Outcome_B is the
  declared result-or-stop domain Y_v | Omega_v. The function f_B determines
  one such outcome, including a stop with its closed report where declared;
  that report and its stop are not two outcomes. An enclosing step's output
  availability remains a separate predicate.

  State-dependent processing declares input state and the meaning of its
  returned next state and value. Refusal and exhaustion retain their cause
  and evaluated predicate. The signature and traversal bind each stop to
  exactly one core value, never satisfied; an exhausted tag alone supplies
  no mapping. Construction availability and assessment retain their
  separate predicates and results, and an unperformed assessment has no
  result. A fuel-bounded operation is distinct from the potentially
  divergent operation it bounds. A deterministic decision or effect proposal
  establishes no physical completion, runtime admission, permission or
  quality (P5, P6; [ACTIVATION §3](ACTIVATION.md#3-step-results-and-disposition)).
- `F_P` classifies bounded probabilistic interpretation, construction or
  proposal under an exact traversal contract. Its result has no semantic,
  admission, acceptance or closure authority merely because it is useful
  or repeatable (P6, P0; instance premise (iii) of §1 Foundation to law).
- `F_H` classifies explicit human adjudication under an exact identity,
  authority grant, subject, basis and decision contract. Human presence
  grants no ambient authority (P6).

The actor, the executor, the domain operation and the functor kind are
different coordinates. `Encode`, `Interpret`, `Serialize`, `Measure` and
other named domain operations are not aliases for `F_D`, `F_P` or `F_H`.
Different traversals may share one functor kind without sharing identity,
semantics, inputs, outputs, authority or evidence (P3, P6).

Classifying an operation as F_D grants no semantic, evaluation, operation
or decision authority. This is the kind-specific application of
[AC-005](#ac-005-authority-conservation) and
[FOUNDATIONS Authority kinds](FOUNDATIONS.md#authority-kinds): the exact
operation contract and admitted grant determine its permissions and
consequences. Consumers apply this boundary to their own operations.

Evaluation-operation profile. An operation declared to evaluate an unchanged
subject identifies that subject, admissible reads, witness or log outputs,
permitted writes, stops and results, authority and invalidation conditions.
It preserves the judged subject and does not perform the domain construction
it judges. Separately authorized persistence of a witness does not perform
the judged domain construction. A construction or mutation needs its own
operation contract and grant; reporting a changed subject's property as the
original subject's property violates this evaluation contract (P6, P3).

Closedness concerns dependencies material to the computation, not complete
world knowledge. This kind's totality is stronger than total handling of
conditions in [ACTIVATION §4](ACTIVATION.md#4-totality-and-refinement).
Unbounded work is not automatically `F_P` when a totality argument is missing.
The calculus does not classify every executable process as one of its kinds.
A new non-total deterministic process is outside qualifying F_D. A route to
an F_D claim is a separately identified bounded successor with its own
domain, outcomes, dependency closure and termination argument; a fuel bound
is one possible construction. This proves nothing about the unbounded
original. Other work remains governed by its selected operation and execution
basis without being asserted to be a qualifying a_c application.
Existing operations enter this edition only through the evidence-sensitive
[migration relation](RELEASE.md#deterministic-kind-migration). The
[finite examples](examples/DETERMINISTIC_CONTRACTS.md) distinguish construction,
assessment, proposed effects and three predicate-specific exhaustion cases.

"Functor kind" is an `a_c` term for this traversal classification. It does
not by itself assert a category-theoretic functor. A model that claims
categorical functor laws carries the demonstration that
[FOUNDATIONS §4](FOUNDATIONS.md#4-algebra), Formal fragment, requires of
every categorical claim (P6, P1).

### AC-015 Functor classification

Every functor application binds exactly one functor kind and one traversal
identity. Applying any `F_*` kind without the bracketed traversal identity
`[v]` is incomplete (P3). Such an
application violates this law, and its outcome is `refusal(constraint)`
under AC-007; this sense of incomplete is not the construction-availability
value `incomplete` of a step
([ACTIVATION §3](ACTIVATION.md#construction-availability)). Purpose and
material relation: an application without its traversal has one core
value, and the shared word does not let it be read as a step's stop (P5).

A claimed application also meets its bound kind's contract in §5. A missing
required declaration (for example the F_D termination argument), a demonstrated
undeclared material dependency, a disallowed kind or a demonstrated
non-totality is a contract violation. A judgment of that violation is
`falsified` under AC-007; structural admission of the unlawful application
returns `refusal(constraint)`. This is not a judgment that every unproved
operation diverges. If a performed assessment on a valid basis cannot decide
the declared operation's totality, its totality judgment is `indeterminate`
under AC-007 and the F_D eligibility claim remains unestablished. An
unperformed assessment has no result.

No invocation is admitted as qualifying F_D by an unestablished claim.
Before a step exists, missing authority, unsupported basis or unresolved
closure follows the distinct admission/activation outcomes of
[ACTIVATION §3](ACTIVATION.md#admission-and-activation). If a lawful a_c
operation has been applied and awaits admissible evidence, its declared
`hold`/`gap`/`refusal` follows AC-007 by cause. These predicates and boundaries
are not interchangeable, and this clause creates no universal stop for all
unproved processes, no new kind and no automatic F_P classification.

### AC-016 Typed composition

Two traversals compose only when the first result type and judgment
satisfy the second traversal's exact domain and preconditions (P4a):

```text
F_K2[w] compose F_K1[v]
```

Composition retains both traversal identities, intermediate results,
judgments, evidence, authority, provenance and stop states. It cannot
flatten probabilistic proposal, deterministic construction or evaluation and human
decision into one undifferentiated operation. `a_c` prescribes no
universal `F_P -> F_D -> F_H` sequence; each application owns its lawful
topology (P4a, P4b, P6). FOUNDATIONS §3 P4a consumes this law.

A deterministic constructor feeding a deterministic evaluator still has
two exact traversal identities and retains both results and stops. A claimed
projection of their continuation follows the consumer-relative sufficiency
law in [FOUNDATIONS §4](FOUNDATIONS.md#assertions-and-observation); composition
alone establishes neither adequate observations nor a Markov property.

## 6. Interpretation and models

An interpretation applies `a_c` to an exact subject (P1):

```text
Interpret_a_c(subject_basis, signature, interpretation_contract)
  -> M_subject* | hold | gap | refusal
```

The stops `hold`, `gap` and `refusal` take their core values under AC-007
by their causes. The trailing `*` marks a proposed model that has not
received the
applicable semantic acceptance judgment. The interpretation contract is
the Interpretation of FOUNDATIONS §2 made exact for one subject and one
signature. It declares:

- the exact `a_c` basis;
- the exact subject identity, inventory, and bytes or semantic addresses;
- the selected signature and any compatible extension relation;
- the mapping from subject declarations to every applicable model record
  population, including objects, relations, constraints, latitude,
  residuals, traversals, transformations and judgments;
- the interpreter identity, capability, provenance and stop states;
- the structural evaluation contract;
- the semantic selection and acceptance authority; and
- the source re-entry and invalidation rules.

The proposed model `M_subject*` does not become accepted through
construction. Structural evaluation can prove closed shape, reference
typing, identity derivation and basis coherence. It cannot prove that
probabilistic semantic selection retained every material subject meaning.
Semantic acceptance remains a separately recorded authority judgment (P6,
P1).

### AC-017 Interpretation fidelity

Every admitted model record maps to exact subject provenance or is
explicitly identified as model-local content under competent authority.
Every evaluated subject declaration has a retained, omitted, residual,
inapplicable or refused disposition. Interpretation cannot treat absence
as immateriality without a recorded basis and authority (P1, P4b, P6).

### AC-018 Structural and semantic separation

The separation of structural conformance from semantic fidelity, and the
rule that structural success is evidence for semantic review and no
substitute for it, are [EVALUATION §2](EVALUATION.md#2-separation)'s,
which owns them for every review. This law binds them to `a_c`: the
structural conformance of a model covers its closed syntax, types,
identities, references, bases and mechanically decidable predicates, and
the semantic fidelity of an interpretation covers its meaning and
materiality (P1, P6).

### AC-019 Valid model

A model `M_b` is a valid model of `a_c` under signature `Sigma`, written
`M_b satisfies a_c[Sigma]`, only when (P6, P1):

1. `Sigma` and the exact `a_c` basis resolve;
2. every record satisfies AC-001 through AC-009;
3. every claimed closure, projection, overlay, transformation, judgment
   and composition satisfies its applicable law, and every claimed functor
   application satisfies AC-015 and its bound kind's §5 contract;
4. interpretation fidelity and residual dispositions bind the exact
   subject;
5. structural evaluation and semantic acceptance remain distinct and both
   required where claimed; and
6. all evidence, provenance, invalidation and re-entry coordinates
   resolve.

A checker may decide the structural subset. No generic checker may claim
the semantic or authority subset unless the model supplies an exact lawful
decision contract for it (P6, P1).

## 7. Layers

The three governed layers are (P3):

```text
a_c       = the pure calculus
a_c.X     = subject X interpreted as a model of a_c
a_c.X.C   = that accepted model encoded in carrier C
```

Their relations are:

```text
M_X = Interpret_a_c(X)
J_X = Accept_X(M_X) -> accepted | refuse
G_C = Encode_C(M_X, J_X) where J_X = accepted
D_C = F_D[v_carrier_admission](G_C, Profile_C, CarrierBasis_C)
      -> admitted | refuse
```

`J_X` is an external semantic-acceptance judgment over unchanged `M_X`.
The `F_D[v_carrier_admission]` notation requires §5's total-domain evidence
for the actual admission traversal and its unchanged-subject evaluation
profile. The diagram supplies neither that evidence nor admission authority;
an unresolved implementation retains its migration obligation under
[RELEASE §9](RELEASE.md#deterministic-kind-migration).
Encoding requires `J_X.decision = accepted` and exact equality between the
judgment subject identity and digest and `M_X`; hold or refusal cannot be
encoded. `D_C` is a judgment over unchanged carrier bytes; it is not a
transformed carrier. The admitted encoding evidence relation is the exact
triple `(G_C, J_X, D_C)`; neither judgment enters the identity of its
subject (P6, P3). Each judgment answers its own predicate, that `M_X` is
accepted and that the carrier bytes are admitted: `accepted` and
`admitted` map to satisfied, a hold maps as AC-007's `hold`, and `refuse`
is a `refusal` that takes its core value under AC-007 by its cause (P5,
P6). The mapping ensures that an acceptance or admission
judgment combines with other results only through the one core, so a
withheld or refused judgment is never read as accepted.

### AC-020 Layer and release separation

`a_c`, `a_c.X` and `a_c.X.C` have independent content identities,
judgments, supersession relations and proof obligations (P3, P6):

- `a_c` qualification evaluates internal coherence against its complete
  declared calculus-law set;
- `a_c.X` proves faithful interpretation of exact subject `X`; and
- `a_c.X.C` proves faithful, canonical encoding of the accepted model in
  carrier `C`.

An encoding failure does not change `a_c.X`. An interpretation failure
does not change `a_c`. A downstream success cannot ratify an upstream
layer or basis. None of these layers is automatically an independently
released Product. The external authority that selects and releases one
owns that Product status. SPEC_METHOD §6 applies this law to release
lineage.

## 8. Calculus identity

The stable concept identity does not identify one immutable calculus
edition. An exact released calculus basis is an external record created
after the publication bytes exist. It binds the governing premise clauses
and the published calculus member as distinct roles inside one exact
immutable package (P3, P6):

```text
AxiomaticCalculusBasis = {
  kind: "stdo.axiomatic-calculus-basis",
  schema_version: 1,
  concept_identity: "urn:stdo:concept:axiomatic-calculus:a-c",
  derivation_basis: {
    release_uri: absolute immutable package release URI,
    manifest_sha256: "sha256:" + 64 lowercase hexadecimal characters,
    principle_refs: non-empty absolute semantic-address URI[]
  },
  publication_basis: {
    release_uri: the same absolute immutable package release URI,
    manifest_sha256: "sha256:" + 64 lowercase hexadecimal characters,
    member_uri: absolute URI for this member in that release,
    member_sha256: "sha256:" + 64 lowercase hexadecimal characters
  }
}
```

The record uses RFC 8785 JSON Canonicalization Scheme bytes. Duplicate
object names are rejected before canonicalisation.
`derivation_basis.principle_refs` is duplicate-free and sorted by
ascending unsigned UTF-16 code units. The record's identity is:

```text
urn:stdo:axiomatic-calculus-basis:sha256:
  + sha256(JCS(AxiomaticCalculusBasis))
```

`derivation_basis` binds the complete finite set of governing clauses
identified under §1 Derivation provenance. Every principle reference resolves
inside the same exact immutable package named by `publication_basis`, and
the two `release_uri` and `manifest_sha256` values are equal. The set is
recomputed when those governing clauses change and is not inferred from a
hard-coded member count. Local premise ownership does not move to the
calculus member merely because both are published together (P3, P6).

`publication_basis` binds this member's exact bytes. Its member URI resolves
inside its release URI. Every release URI in this record has the immutable
`stdo://releases/v<version>-rc.<positive-ordinal>/` form defined by
[RELEASE §2](RELEASE.md#2-release-identities). Acceptance is a verdict over
that exact cut under [RELEASE §8](RELEASE.md#acceptance-criteria), not a
second release identity. The record grants no acceptance or release status
by its presence. A principle reference outside the bound package, a
missing or ambiguous clause, an extra undeclared premise reference, or a
manifest or member digest mismatch invalidates the record (P3, P6).

The identity record is external to the member bytes and to the manifest
member set whose digest it names. It is issued only after that set and its
manifest are frozen, and may accompany them as release metadata outside
that hashed member set. Neither the member nor that manifest embeds the
record's identity or final bytes. The dependency is one-way: the record
hashes already-fixed basis coordinates; those coordinates do not depend on
the record being created. This prevents a member or manifest from requiring
its own final digest through the identity record (P3).

An interpreted-subject identity binds at least:

```text
id(a_c.X) binds
  exact id(a_c)
  + exact subject basis id(X)
  + exact interpretation contract
  + selected model content identity
  + semantic-selection ledger identity and digest
```

An external semantic-acceptance judgment points to that unchanged identity
and content digest. It is not embedded in `id(a_c.X)`. The accepted
interpretation is the pair `(a_c.X, J_X)` where `J_X` is the applicable
accepted judgment. This one-way relation prevents the acceptance record
and its subject from requiring each other's final identity (P3, P6).

An encoded-carrier identity binds at least:

```text
id(a_c.X.C) binds
  exact id(a_c.X)
  + exact carrier Product or cut
  + exact encoding profile
  + canonical carrier content identity
```

The accepted semantic judgment remains external to both content
identities. Encoding mechanically verifies its subject identity and digest
against the unchanged interpreted model and retains it in the evidence
relation. The carrier-admission judgment points to the unchanged carrier
identity and digest and is not embedded in `id(a_c.X.C)`. The admitted
encoding relation is the triple `(a_c.X.C, J_X, D_C)`. Any Product
acceptance and release likewise point to the unchanged content-first layer
identity rather than entering it (P3, P6).

The owning Product defines the canonical record grammar and issuance
authority for those downstream identities. It cannot omit the upstream
identities or replace them with mutable locators (P3).

Publication binding. The `AxiomaticCalculusBasis` for this member is issued
under [RELEASE](RELEASE.md) and AC-020 after the exact package bytes exist.
Its `publication_basis` binds this member and its `derivation_basis` binds
the local governing clauses listed in §1, all under that same package
identity. A dependency on a released calculus binds that record's identity,
release, manifest digest and member digest. A mutable authoring copy or an
unissued record is never substituted for that exact basis (P3, P6).

## 9. Application boundary, imports and exclusions

### Application boundary

This member defines the generic relations `a_c.X` and `a_c.X.C`. It
selects, constructs, accepts or releases no concrete interpretation or
carrier. A downstream authority owns its exact subject population,
interpretation, carrier, judgments and Product or release status. The
downstream identity is never embedded back into the calculus or its
publication basis (P2, P6).

### External imports and specialisations

An application may declare a typed import, translation or specialisation
of an `a_c` concept under that application's own exact authority, context,
basis, scope, preservation, loss, refusal and invalidation law. Such a
relation is external to the calculus. It neither changes `a_c` nor enters
this member by being useful to an application (P6, P2). PROFILES §1 states the same
rule from the profile's side as the declared-binding rule.

### Constraint surfaces

A constraint surface states, for a declared subject and work boundary,
the obligations and the permitted freedom of the work: its objects and
their meanings, the predicates and dependencies that bear on it, the
admissible operations, the required results, the authority, the evidence
and the conditions still unresolved. It constrains the work without
prescribing the worker's internal solution strategy beyond those
obligations (P2, P6).

An interpretation of a subject in `a_c` (§6) yields the constraint surface
of a task by projection. The task's declared subject and work boundary
are the seed set `Z`, with the dependency relation family `R` the task
declares, and the surface is `project(M_subject, Z, R)` (AC-011) over the
material closure of AC-010. Its parts come from the records of this
member:

| Part of the surface | Records and laws that supply it |
|---|---|
| objects and meanings | the semantic objects of `M_Z` (§3), with identity under AC-002 and provenance under AC-017 |
| predicates and dependencies | the constraints (§3, AC-007) and typed relations (AC-004) in the closure; a premise shared by several constraints is one record, and the closure imposes no tree shape and no execution order |
| admissible operations | the traversals and transformations in the closure (§5, AC-013), each with its preconditions and operation authority |
| required results | each constraint's judgment kind and its outcomes, mapped to the core values of [FOUNDATIONS §4 Results](FOUNDATIONS.md#results) under AC-007 |
| permitted freedom | the latitude records (AC-008); what no obligation fixes and a latitude admits is the worker's choice |
| authority | the authority each record retains (AC-005); the surface grants none |
| evidence | the judgments (AC-014) and the evidence, provenance and basis coordinates of the records (AC-006) |
| unresolved conditions | the residuals in the closure (AC-009) and the seams recorded in `Boundary_Z` (AC-011) |

Conditions on its use:

1. **Standing kept.** Each element keeps the standing the interpretation
   records for it: premise, derived consequence, policy choice,
   observation or unresolved claim. A policy choice keeps its owner, and a
   preference is never read as an obligation. An element of the
   construction or assurance relations also keeps the kind of support
   the interpretation records for it, one of the five that
   [FOUNDATIONS §4 Formal representation](FOUNDATIONS.md#formal-representation)
   distinguishes: a stated formula is not read as discharged, and an
   externally assessed predicate keeps the source, scope and evidence
   that establish it.
2. **Unresolved blocks.** A residual, a `hold`, a `gap` or an external
   predicate not yet established keeps its source and its required
   acquisition, and it blocks every operation and result that depends on
   it until its premise is established. A missing premise or an omitted
   obligation never becomes permission or a satisfied result (AC-007,
   AC-009).
3. **Routes, not observations.** The surface carries the constraints and
   the acquisition routes of the material inputs the task needs. It
   supplies no observation, effect grant or task context: a step acquires
   those from the workspace and its selected authoritative inputs, at the
   acquisition step of
   [ACTIVATION §2](ACTIVATION.md#2-context-construction-under-an-envelope),
   which is where a step uses a surface. The workspace stays the basis for
   reacquisition.
4. **Exact subject and basis.** The surface binds the exact subject the
   interpretation represents and, as a separate coordinate, the calculus
   basis and signature used to represent it. A projection from an
   interpretation bound to other subject bytes, or whose basis is not
   established, returns `refusal(basis)`, which is `invalid_basis` (AC-006,
   AC-011).
5. **A derived view.** The surface is a derived view of the owning prose,
   not a second owner. A surface that changes the permitted or required
   work is a fidelity defect (AC-017), repaired at the source or the
   derivation that caused it. An approximate surface declares its
   adequacy relation and its end-to-end bound.
6. **Separate claims.** Structural validity of a surface is a structural
   claim that a checker may decide (AC-019); its fidelity is a semantic
   judgment ([EVALUATION §2](EVALUATION.md#2-separation), AC-018); its
   sufficiency for a task is shown only by actual use
   ([EVALUATION §7](EVALUATION.md#frame-qualification)). A mechanical
   projection runs only under a separately selected checking contract.
   None of these claims grants operation or acceptance authority.

This section states how any interpretation yields a surface; under the
Application boundary above it selects, constructs and accepts no
interpretation. The downstream authority of a subject owns its
interpretation and which interpretation is current. Ordinary entry
selects the current exact interpretation with its limits, and an earlier
interpretation is identified as historical. Purpose and material
relation: an actor has to recover the constraints of one task within
finite context and attention (P0, P2); the surface carries them from
their owners with their dependencies, freedom and open conditions, so
the actor neither loads the whole model nor loses an uncertainty (P4b,
P5, P6).

### Exclusions

`a_c` is not (P2):

- a representation or compression of its derivation source;
- a selected semantic model of any subject;
- a carrier profile or carrier instance;
- an executable language, interpreter, compiler implementation or
  runtime;
- a deterministic semantic assessor or theorem prover;
- a required storage topology of any shape;
- an ontology of any domain;
- an authority registry; or
- a claim that all governed systems share one vocabulary or relation set.

## 10. Conformance obligations

Review and qualification of this member cover at least (P6):

1. closed signature, `RecordKind_ac`, population, field, value-domain and
   reference-domain definitions;
2. well-typed positive and refusal examples for every fundamental law;
3. identity uniqueness and cross-context collision cases;
4. closure, projection, overlay, transformation and composition laws,
   including exact model identities, population partitions, basis
   equality, and byte-or-typed-equality preservation refusal;
5. strict separation of domain operations, functor kinds, actors and
   judgments;
6. residual and authority conservation through interpretation and
   encoding;
7. exact calculus-basis identity reconstruction;
8. direct-coordinate, cross-family reference, wrong-family,
   duplicate-family and dangling-reference refusal cases for every
   fundamental record family;
9. derivation-basis and publication-basis reconstruction with cyclic and
   same-carrier counterexamples; and
10. one neutral toy model demonstrating that the calculus has no hidden
    derivation-source record, application-profile or carrier dependency.

No example, checker, model or carrier can qualify a law outside the exact
claim it evaluates (P6; EVALUATION §1).
