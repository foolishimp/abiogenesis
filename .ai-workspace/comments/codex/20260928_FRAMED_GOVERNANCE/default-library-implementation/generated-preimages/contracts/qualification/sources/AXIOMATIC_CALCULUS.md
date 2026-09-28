# The STDO Axiomatic Calculus for Governed Symbolic Systems

## Position

The **STDO Axiomatic Calculus for Governed Symbolic Systems**, written `a_c`,
is STDO's domain-specific, carrier-neutral constitutional calculus for
representing and relating governed symbolic systems.

Its stable concept identity is:

```text
urn:stdo:concept:axiomatic-calculus:a-c
```

This standard owns that concept in bounded context:

```text
urn:stdo:bounded-context:axiomatic-calculus
```

`a_c` is a separately identifiable calculus derived from STDO principles. It
defines sorts, typed objects, relations, constraints, latitude, residual
uncertainty, traversals, functor kinds, judgments, closure, projections,
transformations, models, and validity laws. Those definitions do not depend on
a derivation-source record layout, a selected subject interpretation, a
particular carrier, a model provider, a runtime, or a repository topology.

`a_c` makes no claim of universal applicability, logical completeness,
consistency, decidability, soundness, or category-theoretic status except where
an exact, separately identified proof establishes that claim for a declared
fragment, model, or relation.

STDO principles are the derivation provenance of the calculus. Application of
the calculus to any exact subject is a separately owned downstream relation.
Those relations are distinct:

```text
exact predecessor STDO principles ──derive──> a_c
a_c + exact subject X              ──interpret──> a_c.X
a_c.X + exact accepted semantic judgment J_X
      + exact carrier C            ──encode─────> a_c.X.C
```

The calculus, an interpreted model, and an encoded carrier are distinct
governed layers with separate content identities and proof boundaries. A layer
becomes a released Product only through separately authorized Product
acceptance and release. Neither interpretation nor encoding can redefine the
calculus.

## Derivation Provenance

The calculus contracts recurring principles already established by STDO:

- scoped identity and authority conservation from
  [`IDENTITY_METHOD.md#core-law`](IDENTITY_METHOD.md#core-law) and
  [`IDENTITY_METHOD.md#authority-identity-and-conservation-stdo-up-004`](IDENTITY_METHOD.md#authority-identity-and-conservation-stdo-up-004);
- exact bounded-context meaning and explicit cross-context relations from
  [`SPEC_METHOD.md#bounded-context-semantic-resolution`](SPEC_METHOD.md#bounded-context-semantic-resolution);
- probabilistic construction as a bounded evaluation class from
  [`REFERENCE_FRAME_METHOD.md#position`](REFERENCE_FRAME_METHOD.md#position)
  and
  [`REFERENCE_FRAME_METHOD.md#evaluation`](REFERENCE_FRAME_METHOD.md#evaluation);
- delegated probabilistic construction, exact candidate production, and
  construction-versus-assessment separation from
  [`SPEC_METHOD.md#agentic-construction-execution-stdo-up-020`](SPEC_METHOD.md#agentic-construction-execution-stdo-up-020);
- governed ambiguity, bounded probabilistic processing, explicit human
  adjudication, and hard-stop separation from
  [`SPEC_METHOD.md#ambiguity-governance-rule`](SPEC_METHOD.md#ambiguity-governance-rule);
- exact-basis evaluation, evidence-and-verdict separation, authority
  conservation, and closed results from
  [`REFERENCE_FRAME_METHOD.md#rf-005-exact-basis-and-coordinates`](REFERENCE_FRAME_METHOD.md#rf-005-exact-basis-and-coordinates),
  [`REFERENCE_FRAME_METHOD.md#rf-006-authority-conservation`](REFERENCE_FRAME_METHOD.md#rf-006-authority-conservation),
  [`REFERENCE_FRAME_METHOD.md#rf-007-semantic-evidence-and-verdict-separation`](REFERENCE_FRAME_METHOD.md#rf-007-semantic-evidence-and-verdict-separation),
  and
  [`REFERENCE_FRAME_METHOD.md#rf-012-closed-results`](REFERENCE_FRAME_METHOD.md#rf-012-closed-results);
- constitutional derivation and re-entry from
  [`SPEC_METHOD.md#constitutional-chain`](SPEC_METHOD.md#constitutional-chain);
- finite material closure, projection, authority conservation, residual
  uncertainty, and capability fit from
  [`REFERENCE_FRAME_METHOD.md#reference-frame-laws`](REFERENCE_FRAME_METHOD.md#reference-frame-laws); and
- singular released authority from
  [`SPEC_METHOD.md#one-constitutional-surface-and-version-boundary-stdo-surface-001`](SPEC_METHOD.md#one-constitutional-surface-and-version-boundary-stdo-surface-001).

These references establish provenance. The definitions and laws below are the
sole normative authority for the meaning of `a_c` within the selected complete
STDO cut. A consumer does not need an implicit STDO representation, GTL
carrier, or downstream implementation to interpret the calculus.

This standard introduces the generic calculus identities `F_D`, `F_P`, and
`F_H`. It does not import those identities from an equal-spelled graph,
runtime, ODD, or application shorthand. The predecessor clauses establish the
substrate-neutral evaluation, probabilistic-processing, human-adjudication,
authority, evidence, and refusal principles from which the generic definitions
below are derived. Nominal equality with a predecessor or downstream shorthand
creates no concept-identity, import, or equivalence relation.

The relative links above identify derivation clause families in this authoring
source. Issuance of an exact `AxiomaticCalculusBasis` resolves and records their
absolute predecessor-cut semantic addresses under
`derivation_basis.release_uri`. The mutable authoring links are not themselves
the digest-bound derivation references.

The derivation direction is one-way. A model of STDO under `a_c`, an encoded
carrier, a proof tool, or a successful application cannot amend the source
principles or this calculus.

## Scope

`a_c` governs the form of a symbolic axiomatic model. It answers:

- what identities and typed objects exist;
- how relations bind exact endpoints;
- how constraints, latitude, and residuals remain explicit;
- how traversals and judgments are typed;
- how material closure, projection, overlay, and transformation behave;
- what a model must preserve from its subject; and
- which claims are structural, semantic, or authority decisions.

`a_c` does not choose the subject vocabulary, decide which source declarations
are material, supply semantic acceptance, select a carrier, execute a model, or
prove that one interpretation is uniquely correct.

## Core Signature

An `a_c` signature is:

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
signature specializes their fields, value domains, reference domains, and
admissible kinds; it does not remove, rename, shadow, or silently add a core
record family. Another fundamental record family requires an explicit
compatible calculus extension rather than an extra subject sort.

Every signature member is a finite, closed identity set for one model family.
The signature defines:

- the fields and value domains of every sort and record family;
- the reference domain and cardinality of every identity-bearing field;
- the allowed source and target sorts for every relation kind;
- the subject and predicate domains of every constraint kind;
- the subject, uncertainty, consequence, and re-entry domains of every
  residual kind;
- the input, output, evidence, and stop contract of every judgment kind; and
- the functor kinds permitted for each traversal.

Unknown kinds and fields are not extensions. They require a new signature or
an explicit compatible extension relation.

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

where:

- `I` is the closed identity universe;
- `O` is the finite set of typed semantic objects;
- `E` is the finite set of typed directed relations;
- `C` is the finite set of constitutional constraints;
- `L` is the finite set of declared latitude records; and
- `X` is the finite set of residual uncertainty records;
- `V` is the finite set of traversal records;
- `T` is the finite set of transformation records; and
- `J` is the finite set of judgment records.

`Population_M` is a total function over `RecordKind_ac`. Every population is
finite, every fundamental record belongs to exactly one population, and record
identities are unique across their disjoint union. Let `Local_M` be that union.
Then `I = Local_M disjoint_union External_M`, where every member of
`External_M` is admitted only through one signature-declared external reference
domain and exact resolution relation. A hidden record, an unpopulated extra
record family, an identity occurring in two populations, or an identity in `I`
with neither one local record nor one lawful external resolution refuses the
model. A population may be empty only when the selected signature does not
require a member of that record kind.

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
semantic object also satisfies the declared target sort. An external reference
resolves through exactly one declared external target kind and basis relation.
No reference may resolve both locally and externally. Missing field domains,
wrong-family targets, wrong-sort targets, ambiguous targets, and dangling
external identities refuse structural admission.

The tuple is abstract. A carrier may use records, tables, graphs, terms,
clauses, code, or another representation only when its encoding profile proves
that every tuple relation is preserved or explicitly refused.

## Typed Records

The following sections define the exact shapes of the eight core record
families. `SemanticObject`, `TypedRelation`, `Constraint`, `Latitude`, and
`Residual` populate `O`, `E`, `C`, `L`, and `X`. The traversal,
transformation, and judgment records defined below populate `V`, `T`, and `J`.
A traversal, transformation, or judgment is not placed in `O` merely by
reifying its name as a semantic object. A subject model may independently
represent the concept of a record kind, but that representation does not
satisfy the core population law.

### Semantic Object

Every semantic object has exactly:

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

`id`, `sort`, `context`, `owner`, and `basis` are identities. `scope` is the
closed governed domain. `value` is sort-defined carrier-neutral content or a
reference to exact content.

### Typed Relation

Every relation has exactly:

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

`source` and `target` resolve to members of `I`. `qualifiers` is the closed
kind-specific record declaring direction, cardinality, preservation, loss,
inverse, invalidation, or other relation semantics required by the signature.

### Constraint

Every constraint has exactly:

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

`kind` resolves one declared `ConstraintKind`; `judgment_kind` resolves one
declared `JudgmentKind`. The owning signature defines the predicate language
and how its result is judged. A predicate that is not deterministically
decidable states the required probabilistic or human judgment kind rather than
pretending to be a machine proof.

### Latitude

Latitude is an explicit permission set inside a constraint boundary:

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

Silence is not latitude. Latitude grants no authority beyond its owner, scope,
basis, and invalidation law.

### Residual

Residual uncertainty is first-class model content:

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

Projection, compression, interpretation, or encoding cannot erase a residual.
It remains represented, is explicitly dispositioned by competent authority, or
causes refusal.

`kind` resolves one declared `ResidualKind`. The owning signature defines its
lawful subject, uncertainty, consequence, re-entry, and invalidation domains.
An undeclared residual kind or value refuses structural admission.

## Fundamental Laws

### AC-001 Closed Signature

Every admitted object, relation, constraint, latitude, residual, traversal,
transformation specialization, and judgment belongs to one declared signature.
Every fundamental record also occurs exactly once in the total
`Population_M` function under its declared `RecordKind_ac`. Missing, duplicate,
shadowed, or unknown record kinds and populations fail closed.

### AC-002 Scoped Identity

An identity resolves one member under one type, context, owner, scope, and
basis. Equal spelling, payload equality, graph position, or carrier equality
does not establish semantic identity.

### AC-003 Reference Closure

Every referenced identity resolves exactly once in the applicable model or
through one explicit external relation. Resolution uses the exact
`RefDomain_Sigma(source_record_kind, field)` declaration across the model's
record populations. Dangling, duplicate, wrong-record-kind, wrong-sort,
wrong-basis, locally-and-externally ambiguous, or undeclared-field references
refuse structural admission.

### AC-004 Relation Typing

A relation is lawful only when its kind admits the exact source and target
sorts and all required qualifiers are present. Direction is material unless the
relation kind explicitly declares symmetry.

### AC-005 Authority Conservation

Objects, relations, constraints, latitude, residuals, traversals,
transformations, projections, and judgments retain their declared semantic,
operation, evaluation, and decision authority. Copying, interpreting, encoding,
evaluating, or transporting a record does not transfer authority.

### AC-006 Basis Coherence

Every fundamental record, model, and result binds an exact basis. Mixed bases
require an explicitly owned composite-basis relation. Individually valid
coordinates do not create a coherent composite basis by proximity.

### AC-007 Constraint And Refusal

Each constraint names its governed subject, predicate, judgment kind,
latitude, and refusal. A failed, missing, indeterminate, out-of-scope, or
invalid-basis result follows the declared result algebra rather than being
coerced to success.

### AC-008 Explicit Latitude

Two values may differ lawfully only through an applicable latitude or
transformation relation. An implementation preference, probabilistic choice,
or human presence is not implicit latitude.

### AC-009 Residual Conservation

Every material uncertainty, omission, translation loss, unresolved boundary,
or unproven relation remains in `X` until an authorized disposition creates an
exact successor model. Absence from a projection is not resolution.

### AC-010 Material Closure

For model `M`, seed set `Z`, and exact dependency relation family `R`, material
closure is the least fixed point:

```text
closure_R(M, Z) = lfp(lambda Q: Z union required_R(M, Q))
```

The result is defined only when `Z`, `R`, required-edge semantics, basis, and
scope are exact and the fixed point is finite and unique. Failure to establish
those conditions returns a gap or refusal. Least closure means least lawful
record closure under `R`; it does not claim globally minimal prose, bytes,
tokens, cost, or cognitive effort.

### AC-011 Projection

A projection selects a view of a model without changing selected meaning:

```text
project(M, Z, R) -> (M_Z, Boundary_Z) | gap | refusal
```

`M_Z` contains the material closure of `Z`. `Boundary_Z` records excluded,
external, unresolved, translated, and invalidation-sensitive seams. A
projection is not a new semantic owner and cannot silently trim a required
member to satisfy a carrier or capability budget.

### AC-012 Overlay

An overlay adds explicit records to one or more declared `Population_M`
families of a basis model. It does not mutate the basis. Override,
disambiguation, equivalence, specialization, or translation exists only as a
typed relation with exact authority, direction, scope, basis, preservation,
loss, refusal, and invalidation semantics.

### AC-013 Transformation

A transformation is an operation-bearing specialization of one exact traversal
record `v`:

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

`t.traversal` resolves one `v`; its context, owner, scope, basis, operation
authority, evidence, provenance, and stop contract must equal or lawfully
restrict the corresponding traversal coordinates. A broader or mismatched
coordinate refuses.

`domain_model` and `codomain_model` resolve exact content identities of the
complete input and proposed successor models. Each model identity commits to
its exact calculus basis, signature identity, complete finite `Population_M`,
complete `External_M`, exact external-resolution map, and selected
model-content identity under the owning identity law. A mutable locator,
model-family name, partial projection, or population digest without the exact
model identity refuses.

For each `x in External_M`, the model's exact resolution relation determines:

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
resolution tuple in one model; a missing, ambiguous, or extra tuple refuses.

For an ordinary same-basis transformation:

```text
basis(domain_model) = basis(codomain_model) = t.basis = basis(t.traversal)
signature(domain_model) = signature(codomain_model)
```

A cross-basis or cross-signature migration requires a separately identified
transformation specialization whose exact composite-basis and compatible
signature-extension relations name both sides. No identity whose basis or
record kind changes belongs to `preserved`; the source identity is removed and
the successor identity is introduced, with their continuity represented only
by the exact migration relation.

`preservation_relation` resolves one exact typed equality relation applicable
to the declared domain and codomain model identities and record kinds. It binds
both model identities, both exact bases, comparison domain, direction,
authority, scope, evidence, and equality law. Equivalence or
meaning-preservation may relate a removed identity to an introduced identity;
it cannot retain one identity in `preserved`.

Let `Local_b` be the complete input-model local-record identity set, `P_t` the
identities named by `preserved`, `R_t` those named by `removed`, and `N_t` the
identities of the complete records named by `introduced`. A lawful
transformation proves the closed local-record delta:

```text
Local_b       = P_t disjoint_union R_t
Local_b_prime = P_t disjoint_union N_t
N_t intersect Local_b = empty
R_t intersect Local_b_prime = empty
```

For every identity in `P_t`, the input and successor records have the same
record kind, identity, context, owner, scope, and basis. They are either:

1. byte-identical under one exact canonical record grammar selected for both
   models; or
2. equal under the exact `preservation_relation` when the abstract records do
   not share such a byte grammar.

Canonical-byte equality and typed record equality are alternative proofs of
identity preservation, not carrier selection by the calculus. A changed field,
changed basis, changed record kind, nominally equal identifier, equivalence,
or unbound assertion of preserved meaning refuses membership in `P_t`.

Every removed identity is absent from the successor. Every introduced identity
is absent from the input and carries a complete lawful record in exactly one
successor population. Every input local-record identity is classified exactly
once as preserved or removed; no local record may be silently dropped,
retained, or duplicated.

The external-resolution coordinates form a distinct closed delta. Let `E_b`
and `E_b_prime` be `ResolutionSet_M` for the domain and codomain models;
`EP_t`, `ER_t`, and `EN_t` are exactly the resolution coordinates named by
`external_preserved`, `external_removed`, and `external_introduced`:

```text
E_b       = EP_t disjoint_union ER_t
E_b_prime = EP_t disjoint_union EN_t
EN_t intersect E_b = empty
ER_t intersect E_b_prime = empty
```

For every `x in EP_t`, `external_resolution_witnesses` contains exactly one:

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

The two resolution tuples are exactly field-equal. A nominally equal external
identifier, equivalent target, changed target kind, changed resolved target,
changed reference domain, changed basis relation, changed resolution basis, or
missing witness cannot enter `EP_t`. Every member of `ER_t` has its complete
resolution only in the domain model; every member of `EN_t` has its complete
resolution only in the codomain model. A changed external resolution is a
removal followed by introduction of the new resolution coordinate and any
separately declared continuity relation; the referenced external identity may
remain unchanged, but the resolution is not preserved. Witnesses are total and
unique over `EP_t` and name no other resolution coordinate.

Material residuals remain in the successor residual set unless an exact
authorized disposition is included in the transformation evidence. Failure to
establish any model identity, basis, population, local or external partition,
equality, external-resolution witness, residual, or codomain equation refuses.

Application is:

```text
T[t](M_b, inputs) -> M_b_prime* | hold | gap | refusal
```

The exact transformation identity `t` declares every mutation it may perform.
The input model remains unchanged; `M_b_prime*` is a proposed successor. A
proposed successor does not accept or admit itself.

### AC-014 Judgment Separation

A judgment points to an unchanged subject:

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

Issuing a judgment does not transform, rewrite, reissue, or rename its subject.
Promotion is an explicit relation between the unchanged subject and its
admission or acceptance judgment.

## Traversals And Functor Kinds

A traversal is a typed contract:

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

`a_c` defines three fundamental functor-kind identities:

```text
F_D = urn:stdo:concept:axiomatic-calculus:f-d
F_P = urn:stdo:concept:axiomatic-calculus:f-p
F_H = urn:stdo:concept:axiomatic-calculus:f-h
```

Application notation is:

```text
F_K[v](X_v) -> Y_v | Omega_v
```

where `F_K` is one functor kind, `v` is one exact traversal identity, `X_v` and
`Y_v` are its typed input and result domains, and `Omega_v` is its closed stop
algebra.

- `F_D` classifies deterministic evaluation or proof over declared properties.
  It returns a judgment and does not perform the domain construction being
  judged.
- `F_P` classifies bounded probabilistic interpretation, construction, or
  proposal under an exact traversal contract. Its result has no semantic,
  admission, acceptance, or closure authority merely because it is useful or
  repeatable.
- `F_H` classifies explicit human adjudication under an exact identity,
  authority grant, subject, basis, and decision contract. Human presence grants
  no ambient authority.

The actor, executor, domain operation, and functor kind are different
coordinates. `Encode`, `Interpret`, `Serialize`, `Measure`, and other named
domain operations are not aliases for `F_D`, `F_P`, or `F_H`. Different
traversals may share one functor kind without sharing identity, semantics,
inputs, outputs, authority, or evidence.

`Functor Kind` is an `a_c` term for this traversal classification. It does not
by itself assert a category-theoretic functor. A model claiming categorical
functor laws additionally defines its source and target categories and proves
identity and composition preservation.

### AC-015 Functor Classification

Every functor application binds exactly one functor kind and one traversal
identity. Applying any `F_*` kind without bracketed traversal identity `[v]` is
incomplete.

### AC-016 Typed Composition

Two traversals compose only when the first result type and judgment satisfy the
second traversal's exact domain and preconditions:

```text
F_K2[w] compose F_K1[v]
```

Composition retains both traversal identities, intermediate results,
judgments, evidence, authority, provenance, and stop states. It cannot flatten
probabilistic proposal, deterministic evaluation, and human decision into one
undifferentiated operation. `a_c` prescribes no universal `F_P -> F_D -> F_H`
sequence; each application owns its lawful topology.

## Interpretation And Models

An interpretation applies `a_c` to an exact subject:

```text
Interpret_a_c(subject_basis, signature, interpretation_contract)
  -> M_subject* | hold | gap | refusal
```

The trailing `*` marks a proposed model that has not received the applicable
semantic acceptance judgment.

The interpretation contract declares:

- exact `a_c` basis;
- exact subject identity, inventory, and bytes or semantic addresses;
- selected signature and any compatible extension relation;
- mapping from subject declarations to every applicable model record population,
  including objects, relations, constraints, latitude, residuals, traversals,
  transformations, and judgments;
- interpreter identity, capability, provenance, and stop states;
- structural evaluation contract;
- semantic selection and acceptance authority; and
- source re-entry and invalidation rules.

The proposed model `M_subject*` does not become accepted through construction.
Structural evaluation can prove closed shape, reference typing, identity
derivation, and basis coherence. It cannot prove that probabilistic semantic
selection retained every material subject meaning. Semantic acceptance remains
a separately recorded authority judgment.

### AC-017 Interpretation Fidelity

Every admitted model record maps to exact subject provenance or is explicitly
identified as model-local content under competent authority. Every evaluated
subject declaration has a retained, omitted, residual, inapplicable, or refused
disposition. Interpretation cannot treat absence as immateriality without a
recorded basis and authority.

### AC-018 Structural And Semantic Separation

Structural conformance decides closed syntax, types, identities, references,
bases, and mechanically decidable predicates. Semantic fidelity decides the
meaning and materiality of the interpretation. Structural success is evidence
for semantic review, not a substitute for it.

### AC-019 Valid Model

A model `M_b` is a valid model of `a_c` under signature `Sigma`, written:

```text
M_b satisfies a_c[Sigma]
```

only when:

1. `Sigma` and the exact `a_c` basis resolve;
2. every record satisfies AC-001 through AC-009;
3. every claimed closure, projection, overlay, transformation, judgment, and
   composition satisfies its applicable law;
4. interpretation fidelity and residual dispositions bind the exact subject;
5. structural evaluation and semantic acceptance remain distinct and both
   required where claimed; and
6. all evidence, provenance, invalidation, and re-entry coordinates resolve.

A checker may decide the structural subset. No generic checker may claim the
semantic or authority subset unless the model supplies an exact lawful decision
contract for it.

## Subject And Carrier Boundaries

The three governed layers are:

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
Encoding requires `J_X.decision = accepted` and exact equality between the
judgment subject identity and digest and `M_X`; hold or refusal cannot be
encoded. `D_C` is a judgment over unchanged carrier bytes. It is not a
transformed carrier. The admitted encoding evidence relation is the exact
triple `(G_C, J_X, D_C)`; neither judgment enters the identity of its subject.

### AC-020 Layer And Release Separation

`a_c`, `a_c.X`, and `a_c.X.C` have independent content identities, judgments,
supersession relations, and proof obligations:

- `a_c` qualification evaluates internal coherence against its complete
  declared calculus-law set;
- `a_c.X` proves faithful interpretation of exact subject `X`; and
- `a_c.X.C` proves faithful, canonical encoding of the accepted model in
  carrier `C`.

An encoding failure does not change `a_c.X`. An interpretation failure does not
change `a_c`. A downstream success cannot ratify an upstream layer or basis.
None of these layers is automatically an independently released Product. The
external authority that selects and releases one owns that Product status.

## Exact Calculus Identity

The stable concept identity does not identify one immutable calculus edition.
An exact released calculus basis is an external record created after the
publication bytes exist. It keeps the predecessor authority from which the
edition was derived distinct from the successor carrier that publishes it:

```text
AxiomaticCalculusBasis = {
  kind: "stdo.axiomatic-calculus-basis",
  schema_version: 1,
  concept_identity: "urn:stdo:concept:axiomatic-calculus:a-c",
  derivation_basis: {
    release_uri: absolute immutable predecessor release URI,
    manifest_sha256: "sha256:" + 64 lowercase hexadecimal characters,
    principle_refs: non-empty absolute semantic-address URI[]
  },
  publication_basis: {
    release_uri: absolute immutable successor release URI,
    manifest_sha256: "sha256:" + 64 lowercase hexadecimal characters,
    member_uri: absolute URI for this member in that release,
    member_sha256: "sha256:" + 64 lowercase hexadecimal characters
  }
}
```

The record uses RFC 8785 JSON Canonicalization Scheme bytes. Duplicate object
names are rejected before canonicalization. `derivation_basis.principle_refs`
is duplicate-free and sorted by ascending unsigned UTF-16 code units. Its
identity is:

```text
urn:stdo:axiomatic-calculus-basis:sha256:
  + sha256(JCS(AxiomaticCalculusBasis))
```

`derivation_basis` binds one exact accepted predecessor cut and the complete
finite set of clauses from which this edition was derived. Every principle
reference is one clause identified under `Derivation Provenance`, resolves
inside that predecessor cut, and is retained without a hard-coded member count.
The set is recomputed when the derivation account changes. It cannot depend on
the publication carrier or calculus-basis identity being created.

`publication_basis` binds the distinct immutable successor carrier and this
standard's exact bytes. Its member URI resolves inside its release URI. The
record is external because this standard cannot contain its own final byte
digest. Same-release references that cite this calculus are publication or
cross-context relations, not derivation provenance.

An interpreted-subject identity binds at least:

```text
id(a_c.X) binds
  exact id(a_c)
  + exact subject basis id(X)
  + exact interpretation contract
  + selected model content identity
  + semantic-selection ledger identity and digest
```

An external semantic-acceptance judgment points to that unchanged identity and
content digest. It is not embedded in `id(a_c.X)`. The accepted interpretation
is the pair `(a_c.X, J_X)` where `J_X` is the applicable accepted judgment. This
one-way relation prevents the acceptance record and its subject from requiring
each other's final identity.

An encoded-carrier identity binds at least:

```text
id(a_c.X.C) binds
  exact id(a_c.X)
  + exact carrier Product or cut
  + exact encoding profile
  + canonical carrier content identity
```

The accepted semantic judgment remains external to both content identities.
Encoding mechanically verifies its subject identity and digest against the
unchanged interpreted model and retains it in the evidence relation. The
carrier-admission judgment points to the unchanged carrier identity and digest
and is not embedded in `id(a_c.X.C)`. The admitted encoding relation is the
triple `(a_c.X.C, J_X, D_C)`. Any Product acceptance and release likewise point
to the unchanged content-first layer identity rather than entering it.

The owning Product defines the canonical record grammar and issuance authority
for those downstream identities. It cannot omit the upstream identities or
replace them with mutable locators.

## Application Boundary

This standard defines the generic relations `a_c.X` and `a_c.X.C`. It selects,
constructs, accepts, or releases no concrete interpretation or carrier. A
downstream authority owns its exact subject population, interpretation,
carrier, judgments, and Product or release status. The downstream identity is
never embedded back into the calculus or its publication basis.

## External Imports And Specializations

An application may declare a typed import, translation, or specialization of
an `a_c` concept under that application's own exact authority, context, basis,
scope, preservation, loss, refusal, and invalidation law. Such a relation is
external to the calculus. It neither changes `a_c` nor enters this standard by
being useful to an application.

## Exclusions

`a_c` is not:

- a representation or compression of its derivation source;
- a selected semantic model of any subject;
- a carrier profile or carrier instance;
- an executable language, interpreter, compiler implementation, or runtime;
- a deterministic semantic assessor or theorem prover;
- a required graph storage topology;
- a world-model ontology;
- an authority registry; or
- a claim that all governed systems share one vocabulary or relation set.

## Conformance Obligations

Review and qualification of this fundamental standard cover at least:

1. closed signature, `RecordKind_ac`, population, field, value-domain, and
   reference-domain definitions;
2. well-typed positive and refusal examples for every fundamental law;
3. identity uniqueness and cross-context collision cases;
4. closure, projection, overlay, transformation, and composition laws,
   including exact model identities, population partitions, basis equality,
   and byte-or-typed-equality preservation refusal;
5. strict separation of domain operations, functor kinds, actors, and
   judgments;
6. residual and authority conservation through interpretation and encoding;
7. exact calculus-basis identity reconstruction;
8. direct-coordinate, cross-family reference, wrong-family, duplicate-family,
   and dangling-reference refusal cases for every fundamental record family;
9. derivation-basis and publication-basis reconstruction with cyclic and
   same-carrier counterexamples; and
10. one neutral toy model demonstrating that the calculus has no hidden
    derivation-source record, application-profile, or carrier dependency.

No example, checker, model, or carrier can qualify a law outside the exact
claim it evaluates.
