# Reference frame ac-task-a

Task: Write the transformation record for one step between two exact models, state which application outcome the record supports, write a judgment record over the successor, and state what promoting the successor would require and who holds it.

Purpose: The owning sections for the model signature and typed records, the laws a transformation and its application obey with their outcomes, judgment separation and promotion, traversals, authority kinds, and the core result algebra with its conjunction.

Binds:

- This task binds the construction relation: A is the exact subject and basis the activation binds, Z is the task's required outcome with the acceptance conditions the task states, and the actor's claims keep preservation, progress and outcome satisfaction distinct; a judgment its evidence cannot decide is `indeterminate`, and work it cannot finish is reported as unresolved work, not as a judgment ([../ACTIVATION.md#construction-relation](../ACTIVATION.md#construction-relation); member sha256=7ad7b69b5ad8ec20678b3ef866a26fb328f2fa6f60c4d1d06ca0b926845b89bf; section sha256=6b6c2ce91c5a7e4be765af2f8009252fa8918719e1d885af6b5810ba4eb699da)
- An evaluation this task returns binds the assurance relations: the source obligation, the claimed predicate and its scope, the observation basis, the exact subject and its material dependencies; a pass is an observation until the oracle's fidelity is established ([../FOUNDATIONS.md#assurance-relations](../FOUNDATIONS.md#assurance-relations); member sha256=3e85b8d01360dfae6758566fd3aca309c977e7d9e15cdd2f9e8f2904f18f2545; section sha256=a7d5fc5930338c3fb3959017f41935ce742fbb1bf189c2f527dde4e0ba12d064 spanning to #formal-representation)

A `Binds:` item names an obligation the activation of this frame binds, with
a link to the owning section, the digest of its member and the digest of that
section, or of the span of sections it names, where it names one; the item
copies no section and owns no determination, and where no route of this frame
carries the section the item is a paraphrase of it.

Each excerpt below copies one owning section of a member of this method
byte for byte, except a `rows=k/n` excerpt (see below) and except that
each relative link destination is rebased
to resolve from this directory to the same target. Fenced code, inline
code and absolute and `stdo://` links are unchanged. The `Source:` line
before an excerpt names the member and the section's anchor, and gives
the SHA-256 of the whole owning member. The section digest recorded in
FRAME_INPUTS.json is over the owner's bytes, not over this copy. The
owning section decides; this frame owns no determination. An excerpt
whose `Source:` line says `rows=k/n` is a family table of which only
the k rows that cite a section this frame carries are copied, with the
table's preamble, header and every non-family table; the other rows
stay in the owning member and are not copied. The frame's
qualification, not this selection, decides whether the frame is
sufficient for its task.

Routes, in order:

1. [FOUNDATIONS.md#authority-kinds](../FOUNDATIONS.md#authority-kinds)
2. [AXIOMATIC_CALCULUS.md#2-signature](../AXIOMATIC_CALCULUS.md#2-signature)
3. [AXIOMATIC_CALCULUS.md#3-typed-records](../AXIOMATIC_CALCULUS.md#3-typed-records)
4. [AXIOMATIC_CALCULUS.md#ac-002-scoped-identity](../AXIOMATIC_CALCULUS.md#ac-002-scoped-identity)
5. [AXIOMATIC_CALCULUS.md#ac-003-reference-closure](../AXIOMATIC_CALCULUS.md#ac-003-reference-closure)
6. [AXIOMATIC_CALCULUS.md#ac-005-authority-conservation](../AXIOMATIC_CALCULUS.md#ac-005-authority-conservation)
7. [AXIOMATIC_CALCULUS.md#ac-006-basis-coherence](../AXIOMATIC_CALCULUS.md#ac-006-basis-coherence)
8. [AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal](../AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal)
9. [AXIOMATIC_CALCULUS.md#ac-008-explicit-latitude](../AXIOMATIC_CALCULUS.md#ac-008-explicit-latitude)
10. [AXIOMATIC_CALCULUS.md#ac-009-residual-conservation](../AXIOMATIC_CALCULUS.md#ac-009-residual-conservation)
11. [AXIOMATIC_CALCULUS.md#ac-013-transformation](../AXIOMATIC_CALCULUS.md#ac-013-transformation)
12. [AXIOMATIC_CALCULUS.md#ac-014-judgment-separation](../AXIOMATIC_CALCULUS.md#ac-014-judgment-separation)
13. [AXIOMATIC_CALCULUS.md#5-traversals-and-functor-kinds](../AXIOMATIC_CALCULUS.md#5-traversals-and-functor-kinds)
14. [FOUNDATIONS.md#results](../FOUNDATIONS.md#results)
15. [FOUNDATIONS.md#conjunction-of-results](../FOUNDATIONS.md#conjunction-of-results)
16. [AXIOMATIC_CALCULUS.md#foundation-to-law](../AXIOMATIC_CALCULUS.md#foundation-to-law)

Size of this frame: 69466 bytes.

Source: FOUNDATIONS.md#authority-kinds sha256=3e85b8d01360dfae6758566fd3aca309c977e7d9e15cdd2f9e8f2904f18f2545

### Authority kinds

Authority takes these kinds (P6): frame-set authority, the human authority
that declares or accepts a project frame set; semantic authority, the
owner of meaning for a material relation; evaluation authority, the role
permitted to perform an evaluation; operation authority, the owner-issued
grant to construct, transform, admit, publish or mutate a material subject
where an evaluation performs such an operation; decision authority, the
role permitted to accept, reject or otherwise dispose a result; and actor
identity, the human, agent, tool or process performing the work, which is
an identity and not an authority. These may coincide in a lawful case and
never collapse by default. A read-only evaluation declares no operation
authority; an effectful evaluation inherits the exact operation grant from
its existing owner, and the frame does not create that grant (P6, P3).

What creates no authority. Authority of any kind exists only by an
admitted grant or an explicit authority decision of its owner, with an
identifiable basis. None of the following mints, widens, transfers or
reconstructs semantic, evaluation, operation or decision authority (P6,
P3):

- actor identity, an actor's capability, its tools or its access;
- a name, label, display label, status label, role name, capability
  string, locator, file name or path;
- declaring, naming, selecting, activating or executing a frame, or
  occupying a role;
- implementation reachability, a reachable code path or an available
  operation;
- the shape of evidence or of a payload, or the availability of evidence
  inside a frame;
- a passing check, a successful step, a completed review or a count of
  any of them;
- copying, interpreting, encoding, evaluating, transporting, projecting,
  compressing, importing or acquiring material;
- drafting, admitting or retaining a work contract, beyond what its owner
  has admitted;
- composition, delegation, adapters, wrappers and registries, which may
  restrict admitted authority or carry it faithfully, and never widen its
  scope, add a role, increase its cardinality or change its kind.

Elevation, transfer, split, merge, proxy grant, revocation and retirement
each need an explicit authority decision with an identifiable basis. A
member that names an instance of this list for its own domain cites this
paragraph and adds only the instance.

Proxy limit. Human authority may act directly, or through an explicitly
admitted bounded proxy where the governing identity and authority law
permits it; proxy identity and human-authority identity stay distinct
(P6, P3). A proxy acts only inside its existing grant. It cannot change
the governing outcome's meaning, the requirements, the governing authority
or the accepted design; such a change re-enters at its owning relation.
Proxy authority does not make a constructor's self-review independent,
confers no unrelated runtime or domain authority, and does not replace
direct human acceptance where the governing product or release law
requires it. The contents of a proxy grant are
[IDENTITY §6](../IDENTITY.md#6-authority-identity-and-conservation-stdo-up-004)'s,
and the decisions a proxy may take inside a step are
[ACTIVATION §1 Roles and delegation](../ACTIVATION.md#roles-and-delegation)'s.

Purpose and material relation of the list and the proxy limit: each
member that names what cannot create authority decides the same question,
so one list keeps the answer the same in every member, and a capability,
a label or a passing check can never be read as a permission (P6).


Source: AXIOMATIC_CALCULUS.md#2-signature sha256=2b24d3679cac3dd7a383c9ef382232acc8e99055709dc1a330e6f18a7b4cebbf

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


Source: AXIOMATIC_CALCULUS.md#3-typed-records sha256=2b24d3679cac3dd7a383c9ef382232acc8e99055709dc1a330e6f18a7b4cebbf

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
[FOUNDATIONS §2 Authority kinds](../FOUNDATIONS.md#authority-kinds), What
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


Source: AXIOMATIC_CALCULUS.md#ac-002-scoped-identity sha256=2b24d3679cac3dd7a383c9ef382232acc8e99055709dc1a330e6f18a7b4cebbf

### AC-002 Scoped identity

This law applies the scoped identity of
[IDENTITY §2](../IDENTITY.md#scoped-identity), the identity of an Object of
FOUNDATIONS §2, to every identity in `I`. Its coordinates map to that
identity as follows: the owner is the identity's authority, the type is
its kind, and the member it resolves is what its value denotes; context,
scope and basis are further coordinates, which IDENTITY §2 permits and
`a_c` requires. So an identity resolves one member under one type,
context, owner, scope and basis. That equal representations do not
establish equal meaning is FOUNDATIONS §2, Representation. The `a_c`
binding beside it: equal spelling, payload equality, position in any
structure and carrier equality do not establish semantic identity (P3).


Source: AXIOMATIC_CALCULUS.md#ac-003-reference-closure sha256=2b24d3679cac3dd7a383c9ef382232acc8e99055709dc1a330e6f18a7b4cebbf

### AC-003 Reference closure

Every referenced identity resolves exactly once in the applicable model or
through one explicit external relation. Resolution uses the exact
`RefDomain_Sigma(source_record_kind, field)` declaration across the
model's record populations. Dangling, duplicate, wrong-record-kind,
wrong-sort, wrong-basis, locally-and-externally ambiguous or
undeclared-field references refuse structural admission (P3, P5).


Source: AXIOMATIC_CALCULUS.md#ac-005-authority-conservation sha256=2b24d3679cac3dd7a383c9ef382232acc8e99055709dc1a330e6f18a7b4cebbf

### AC-005 Authority conservation

Objects, relations, constraints, latitude, residuals, traversals,
transformations, projections and judgments retain their declared semantic,
operation, evaluation and decision authority (the kinds of
[FOUNDATIONS §2 Authority kinds](../FOUNDATIONS.md#authority-kinds)). What
creates no authority is listed there; in `a_c` its instances are copying,
interpreting, encoding, evaluating and transporting a record, none of
which transfers authority (P6, P4b).


Source: AXIOMATIC_CALCULUS.md#ac-006-basis-coherence sha256=2b24d3679cac3dd7a383c9ef382232acc8e99055709dc1a330e6f18a7b4cebbf

### AC-006 Basis coherence

Every result binds its exact basis under
[RF-005](../REFERENCE_FRAME.md#rf-005-exact-basis-and-coordinates), which
owns the exact-basis rule for results; what a basis is, including that
mixed bases need an explicit composite relation, is FOUNDATIONS §2,
Basis. This law binds the same rule to every fundamental record and model
of `a_c`: each binds an exact basis, the composite-basis relation of a
mixed basis is an explicitly owned record, and individually valid
coordinates do not create a coherent composite basis by proximity (P6, P3).


Source: AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal sha256=2b24d3679cac3dd7a383c9ef382232acc8e99055709dc1a330e6f18a7b4cebbf

### AC-007 Constraint and refusal

Each constraint names its governed subject, predicate, judgment kind,
latitude and refusal (§3, Constraint). The judgment of a constraint
returns one value of the core result algebra of
[FOUNDATIONS §4 Results](../FOUNDATIONS.md#results), directly or through a
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
([FOUNDATIONS §4 Conjunction of results](../FOUNDATIONS.md#conjunction-of-results),
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
[FOUNDATIONS §4 Conjunction of results](../FOUNDATIONS.md#conjunction-of-results)
records as a gap. A signature's stop contract and a traversal record map
stops of their own under §5.

Purpose and material relation: a
constraint result or an operation's stop combines with results of other
members only through the one core, so a refusal, a hold or a gap is
neither read as success nor mistaken for another case; and a closure or
projection that is not established has the value invalid_basis here, as
the activation outcome `closure_unresolved` of
[ACTIVATION §3](../ACTIVATION.md#admission-and-activation) has for its own
predicate (P5, P6).


Source: AXIOMATIC_CALCULUS.md#ac-008-explicit-latitude sha256=2b24d3679cac3dd7a383c9ef382232acc8e99055709dc1a330e6f18a7b4cebbf

### AC-008 Explicit latitude

Two values may differ lawfully only through an applicable latitude record
or transformation relation. An implementation preference, a probabilistic
choice or a human presence is not implicit latitude. FOUNDATIONS §4 states
the same rule for any two values; this law is its form over `L` and `T`
(P6, P1).


Source: AXIOMATIC_CALCULUS.md#ac-009-residual-conservation sha256=2b24d3679cac3dd7a383c9ef382232acc8e99055709dc1a330e6f18a7b4cebbf

### AC-009 Residual conservation

Every material uncertainty, omission, translation loss, unresolved
boundary or unproven relation remains in `X` until an authorised
disposition creates an exact successor model. Absence from a projection is
not resolution (P4b).


Source: AXIOMATIC_CALCULUS.md#ac-013-transformation sha256=2b24d3679cac3dd7a383c9ef382232acc8e99055709dc1a330e6f18a7b4cebbf

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


Source: AXIOMATIC_CALCULUS.md#ac-014-judgment-separation sha256=2b24d3679cac3dd7a383c9ef382232acc8e99055709dc1a330e6f18a7b4cebbf

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


Source: AXIOMATIC_CALCULUS.md#5-traversals-and-functor-kinds sha256=2b24d3679cac3dd7a383c9ef382232acc8e99055709dc1a330e6f18a7b4cebbf

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
algebra of [FOUNDATIONS §4 Results](../FOUNDATIONS.md#results): it adds no
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

- `F_D` classifies deterministic evaluation or proof over declared
  properties. It returns a judgment and does not perform the domain
  construction being judged (P6).
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

"Functor kind" is an `a_c` term for this traversal classification. It does
not by itself assert a category-theoretic functor. A model that claims
categorical functor laws carries the demonstration that
[FOUNDATIONS §4](../FOUNDATIONS.md#4-algebra), Formal fragment, requires of
every categorical claim (P6, P1).

### AC-015 Functor classification

Every functor application binds exactly one functor kind and one traversal
identity. Applying any `F_*` kind without the bracketed traversal identity
`[v]` is incomplete (P3). Such an
application violates this law, and its outcome is `refusal(constraint)`
under AC-007; this sense of incomplete is not the construction-availability
value `incomplete` of a step
([ACTIVATION §3](../ACTIVATION.md#construction-availability)). Purpose and
material relation: an application without its traversal has one core
value, and the shared word does not let it be read as a step's stop (P5).

### AC-016 Typed composition

Two traversals compose only when the first result type and judgment
satisfy the second traversal's exact domain and preconditions (P4a):

```text
F_K2[w] compose F_K1[v]
```

Composition retains both traversal identities, intermediate results,
judgments, evidence, authority, provenance and stop states. It cannot
flatten probabilistic proposal, deterministic evaluation and human
decision into one undifferentiated operation. `a_c` prescribes no
universal `F_P -> F_D -> F_H` sequence; each application owns its lawful
topology (P4a, P4b, P6). FOUNDATIONS §3 P4a consumes this law.


Source: FOUNDATIONS.md#results sha256=3e85b8d01360dfae6758566fd3aca309c977e7d9e15cdd2f9e8f2904f18f2545 rows=7/18 selected by the anchors this frame carries; the consumers paragraph of 18 items is omitted

### Results

Every performed evaluation returns one value of the core result algebra,
directly or as a refined value mapped into it (P5):

| Value | Meaning |
|---|---|
| `satisfied` | the declared predicate holds on the exact basis |
| `falsified` | a declared counterexample defeats it |
| `indeterminate` | the available admissible evidence cannot decide it |
| `out_of_frame` | the evaluation requires an undeclared material relation or capability |
| `invalid_basis` | the subject or basis cannot support the evaluation |

This core is the only one. Results of constraints, judgments, frame
evaluations, stops, work steps and effects are stated in it or in a
refinement mapped into it, so that results from any members combine under
one rule ([Conjunction of results](../FOUNDATIONS.md#conjunction-of-results)). Purpose and
material relation: no combination can report success while a failure, an
undecided question, an unperformed evaluation or an uncertain effect
remains, and none of these can be mistaken for another (P5, P6).

Recording. A result records its core value together with the predicate
evaluated and the original domain outcome, which is the refined value
where a refinement produced it. A mapping into the core never owns domain
meaning: the member, profile or adopting Product that defines the refined
value keeps it, and a consumer that needs the domain distinction reads the
domain outcome, never the core value alone (P1, P6).

Standing. The standing of a result is what it establishes about its
predicate; it is distinct from the standing of a commitment (§1). Only
`satisfied` establishes the predicate. `falsified` establishes that the
predicate fails and names the counterexample. `indeterminate`,
`out_of_frame` and `invalid_basis` establish neither, and each names what
would decide: the evidence, the missing relation or capability with its
owner where the subject gives one, or the basis repair. By support for the
predicate, `satisfied` stands above each other value, and the other four
are not ordered among themselves.

No refinement or mapping raises a result's standing (P5, P6):

- a falsified or failed result never maps to a satisfied or successful one;
- a result that admissible evidence cannot decide never maps to
  `satisfied`;
- an evaluation that was not performed stays distinct from one whose
  evidence cannot decide: it has no
  [closed result](../ACTIVATION.md#7-closed-result-and-reuse), and it is never mapped
  to `indeterminate` or to any other core value;
- an effect whose completion is unknown never maps to no effect or to
  completed.

Not performed. An evaluation that is required or planned and was not
performed has no closed result; an actor cannot report an evaluation it
did not perform (P6). Nothing is coerced to success: a failed,
indeterminate, out-of-frame, out-of-scope or invalid-basis result follows
the declared result algebra and returns its own value under it, never
`satisfied`, and a missing result, being no result, enters every
conjunction over it as a gap: a planned assessment without a closed result
where an assessment was planned, and uncovered coverage where none was.
[REFERENCE_FRAME §3](../REFERENCE_FRAME.md#rf-012-closed-results) states
RF-012 as a law over frames and
[AXIOMATIC_CALCULUS §4](../AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal)
states AC-007 as a law over constraints; each uses this core and neither
defines it again.

Refinements. A member, profile or adopting Product that needs finer
outcomes defines a refinement. The refinement names the question it
answers and the predicate its mapping is for, and maps every refined value
to exactly one core value. No outcome exists outside the core; a
refinement adds no core value and keeps the pressure of `indeterminate`,
`out_of_frame` and `invalid_basis` explicit. Where a refined value would
map to one of two core values according to its cause, the cause is part of
the refined value and each resulting value maps once (P5, P1). A further
refinement, by a member, profile, project or adopting Product, may split a
refined value by cause. The parent-value rule governs every such split:
each child value names its parent value and its cause and keeps its
parent's core value; a child that needs a different core value needs a
different parent value, which only the owner of the parent declares; and
no child takes `satisfied` from a parent that is not `satisfied`. No
further refinement raises a result's standing (P5, P6, P1). Purpose and
material relation: a consumer that reads a parent value reads the same
core value from each of its children, so a split by cause adds a domain
distinction and never changes what the parent establishes (P5, P6). The
refinements for admission, activation and steps are
[ACTIVATION §3](../ACTIVATION.md#3-step-results-and-disposition); each other
member, profile and adopting Product states its mapping where it defines
its values.

Availability, assessment and acceptance are separate results, each with its
own predicate: that a step produced a candidate; that the candidate meets
its declared criteria; and that the
[decision owner](../ACTIVATION.md#roles-and-delegation) accepts it at its
boundary. A step having produced a candidate never maps to the candidate's
fitness or acceptance, and acceptance is never inferred from a successful
step (P6; [ACTIVATION §3](../ACTIVATION.md#3-step-results-and-disposition),
[EVALUATION §4](../EVALUATION.md#4-review-results) and
[§5](../EVALUATION.md#5-acceptance)).

Out of frame or indeterminate. The boundary between these values is drawn
on what the activated frame declares and on what the step did with it (P5,
finite capacity and graceful total handling; the material relation drawn
is the three-way out_of_frame boundary: capability not declared, capability
declared and exercised, capability declared and not exercised). Three cases; the first two name core values, and
the third names none:

- `out_of_frame` when the claim requires a material relation or an
  evaluator capability that the activated frame does not declare. The
  result names the missing relation or capability, its owner where the
  subject gives one, and the reconfiguration pressure it creates
  ([ACTIVATION §4](../ACTIVATION.md#4-totality-and-refinement)). A term the claim depends on and the frame
  leaves undefined is an undeclared material relation: its meaning can
  alter the result and it enters through no declared input (RF-003; P1). Whether the step exercised anything is
  irrelevant to this value; the ground is the missing declaration.
- `indeterminate` when the available admissible evidence cannot decide the
  claim. The result names the evidence that would decide, as
  its residual uncertainty. Where the
  claim also depends on an undeclared relation or capability,
  `out_of_frame` and `indeterminate` each have a lawful ground; the result
  names the value it returns and that ground, and this boundary excludes
  neither (P5).
- no value of its own when the step did not exercise a declared capability
  the evaluation requires. A result is returned wherever a sufficient
  evaluation or an applicable judgment exists without that capability,
  identifying its evidence, verdict and residual uncertainty like any
  closed result:
  a counterexample found by what was exercised, as when source inspection
  falsifies A in a claim of A and B, returns `falsified`, and common
  agreement cannot discard it. Where none
  exists because the capability was not exercised, the evaluation was not
  performed and has no result: the step's stop state carries it,
  `incomplete` under
  [construction availability](../ACTIVATION.md#construction-availability), and
  its work state ([ACTIVATION §5](../ACTIVATION.md#5-work-state-and-restart))
  carries the unexercised capability as a residual (P6). In either case
  the unexercised part, B above, has no result: in every conjunction over
  it, it is a planned assessment without a closed result, and the known
  failure A survives with it ([Conjunction of results](../FOUNDATIONS.md#conjunction-of-results)).
  The evaluation's result and the step's stop state answer different
  questions, so the step's stop value never becomes the evaluation's
  result.

Foundation to law for results and their combination (family F3). The
table covers every rule of §4 and the result grounds of §2 Imports
between members, in the format of
[Foundation to law](../FOUNDATIONS.md#foundation-to-law), which states the standing of its
consequences. Purpose and material relation: a reader of §4 sees which
commitments each result rule rests on and which choices it adds, with their
owners (P6, P2). Instance premises, which the commitments do not supply:
(i) an evaluation declares its predicate, subject and basis; (ii) results
of several evaluations, steps or members are combined into one decision;
(iii) members, profiles and adopting Products need outcomes finer than the
core.

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|
| P6 (independent), P5 (derived from P0 and P6) | a result claims no more than it establishes: only `satisfied` establishes the predicate, and no refinement or mapping raises a result's standing | [Results](../FOUNDATIONS.md#results), Standing, and the rule that nothing raises standing; for the choice, [Conjunction of results](../FOUNDATIONS.md#conjunction-of-results), Reported value | the order among the four other values within one combination; owner: the member or profile that applies the conjunction, in its declared rule | 9 |
| P4b (derived from P0 and P2), P5 (derived from P0 and P6), P6 (independent); (ii) | a combination keeps failures, unperformed assessments and uncovered obligations apart and carries each through every join; agreement among contributors discards no counterexample | [Conjunction of results](../FOUNDATIONS.md#conjunction-of-results): its three inputs, Gaps, Survival, Predicates travel | none | 3, 9 |
| P3 (independent), P5 (derived from P0 and P6), P6 (independent); (i), (ii) | a result supports its predicate only on the basis it binds, so a component held only on another basis has, on the basis the composite requires, no performed evaluation and is a gap, while an evaluation performed on a basis that cannot support it decides its own predicate as `invalid_basis`; one component is never answered both ways | [Conjunction of results](../FOUNDATIONS.md#conjunction-of-results), Stale results | none | 3, 9 |
| P5 (derived from P0 and P6), P6 (independent); (ii) | a composite with a gap or a non-satisfied mandatory result is never `satisfied`; where every mandatory result is `satisfied`, its own value is `invalid_basis` if the declared basis relations disagree, and otherwise `indeterminate` while a gap remains; with every mandatory result `satisfied`, agreeing bases and no gap, a material counterexample to a mandatory constraint falsifies it whichever contributor found it, and without one its value is the one its declared rule gives over the mandatory results; a `falsified` result that is not mandatory stays in its record | [Conjunction of results](../FOUNDATIONS.md#conjunction-of-results), Reported value | which non-satisfied value is reported; owner: the member or profile that applies the conjunction, in its declared rule | 3, 9 |
| P6 (independent), P4a (independent); (ii) | a conjunction decides only under a declared rule and transfers no contributor's semantic authority | [Conjunction of results](../FOUNDATIONS.md#conjunction-of-results), The declared rule | the mandatory results, the handling of conflict and indeterminacy, the basis relations that must agree, the decision authority that owns the conjunction, how results that are not mandatory count, and any veto or deferral; owner: the member or profile that applies the conjunction, in its declared rule | 3, 9 |
| P4a (independent), P4b (derived from P0 and P2) | composed steps exist only under typed composition; the composite carries both steps' step-produced facts, and its result for the outer predicate is the conjunction over the outer contract's obligations | [§4](../FOUNDATIONS.md#4-algebra) Composition; [Conjunction of results](../FOUNDATIONS.md#conjunction-of-results), Composition of results; [RF-010](../REFERENCE_FRAME.md#rf-010-composition-on-demand), outside this member | whether a composition law is needed, under the conditions RF-010 states; owner: the governing evaluation | 3, 4 |
| P4b (derived from P0 and P2), P3 (independent) | every transformation records what it preserved, introduced and removed, its external witnesses and its residuals, so no fact is lost unrecorded | [§4](../FOUNDATIONS.md#4-algebra) Conservation accounting | the record's fields; owner: [AC-013](../AXIOMATIC_CALCULUS.md#ac-013-transformation) | 3 |

RF-012 in [REFERENCE_FRAME §3](../REFERENCE_FRAME.md#rf-012-closed-results),
AC-007 in
[AXIOMATIC_CALCULUS §4](../AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal)
and [EVALUATION §4](../EVALUATION.md#4-review-results) apply the first row's
algebra to frames, constraints and reviews and add no choice of their own
beyond any refinement they map under the fifth row;
[ACTIVATION §3](../ACTIVATION.md#3-step-results-and-disposition) holds the
step's refinements of the fifth row and the stop state of the seventh.


Source: FOUNDATIONS.md#conjunction-of-results sha256=3e85b8d01360dfae6758566fd3aca309c977e7d9e15cdd2f9e8f2904f18f2545

### Conjunction of results

Conjunction combines results into one result for a composite predicate: a
claim made of component claims, a decision over several evaluations, or
the outer contract of composed steps. It is defined here once, over the
core. A member or profile that combines results applies this rule and
declares only the choices it leaves open (P4a, P4b, P5, P6). Purpose and
material relation: failure, undecidability, non-performance and uncertain
effects stay distinct after combination, so a composite can neither report
success nor hide which kind of gap it has while one of them remains in
what it requires.

A conjunction takes three inputs and keeps them apart:

1. the closed results returned, each a core value with its predicate and
   domain outcome;
2. the planned assessments that have no closed result applicable to the
   composite: evaluations the composite requires that were not performed,
   or whose result is absent, stale, bound to another subject or basis, or
   incapable of establishing its claim;
3. the required coverage that no planned assessment addresses: for a
   required obligation set R and the coverage C that the planned
   assessments admit, the uncovered coverage R minus C.

Gaps. A conjunction with any item in the second or third input is never
`satisfied`. Its record names which kind of gap it has, not performed,
uncovered or both, and each item. An uncovered obligation is never
reported as satisfied or as an omitted planned assessment; a planned
assessment without a closed result is never reported as uncovered or as an
`indeterminate` component.

Stale results. A held result is stale for a composite when the basis it
binds is not the basis the composite requires of that component, because
a later state has superseded or advanced it or because it binds another
subject or basis (§2, Basis). Two questions stay apart, so that one
composite has one reported value (P3, P5, P6):

- an evaluation performed on a subject or basis that is stale, advanced,
  ambiguous or mismatched against the one it must bind returns
  `invalid_basis` for its own predicate, or is reactivated on the current
  basis; [RF-005](../REFERENCE_FRAME.md#rf-005-exact-basis-and-coordinates)
  states this law over frames, and a conjunction that receives that
  `invalid_basis` holds it as a returned result;
- a component whose only held result is stale has no closed result
  applicable to the composite: on the basis the composite requires, its
  evaluation was not performed. It is a planned assessment without a
  closed result, in the second input, and a gap. Its stale value is
  neither counted as a returned result nor relabelled `invalid_basis` for
  the composite, and it stays in the record with its own basis;
- the declared basis relations disagree (Reported value below) only among
  returned results, each bound to the basis the composite requires of it,
  whose bases the declared rule requires to agree or to join in a coherent
  composite basis, and which do not.

A stale `satisfied` never counts toward the composite. Purpose and
material relation: answering one stale component as a gap in one place and
as `invalid_basis` in another would give one composite two reported
values; keeping the evaluation's own value apart from the composite's gap
keeps the reported value unique and the stale result visible.

Survival. Every known failure (a `falsified` result with its
counterexample), every planned assessment without a closed result and
every uncovered obligation is carried with the composite and survives every
join: combining conjunctions takes the union of known failures and of
planned assessments without a closed result, and recomputes uncovered
coverage over the combined obligations. A known failure and a gap of
either kind survive every join. Common agreement among contributors
cannot discard a constraint or a material counterexample that only one
contributor found. A missing, wrong-subject, conflicted or indeterminate
mandatory result stays unresolved under the declared rule, and aggregate
satisfied status cannot replace it (P4b, P5).

Predicates travel. Each component keeps its predicate and domain outcome
through every join, so an uncertain effect stays distinct from a failure
and from an undecided claim, and a `satisfied` for one predicate never
counts toward another: a step's `satisfied` for "a candidate is available"
never counts toward the candidate's fitness or acceptance.

Reported value. The conjunction is `satisfied` only when every mandatory
result is `satisfied` with valid applicable evidence, the declared basis
relations agree, and the second and third inputs are empty. A composite
with a material counterexample to a mandatory constraint or an uncovered
required obligation cannot project success. Where a mandatory result is
not `satisfied`, the conjunction
reports a non-satisfied value chosen by its declared rule from those
returned; no universal order among the non-satisfied values exists, and
the member or profile that applies the conjunction declares its own in
its declared rule. Where every mandatory returned result is `satisfied`
and the declared basis relations disagree, the conjunction reports
`invalid_basis`, because no coherent composite basis supports the
composite predicate (§2, Basis); any gaps stay recorded by kind. Where
every mandatory returned result is `satisfied`, the declared basis
relations agree and a gap remains, the conjunction reports
`indeterminate`, because the results it holds cannot decide the composite
predicate; that value is the conjunction's own, and the gaps stay
recorded by kind. A `falsified` result that is not mandatory stays in the
conjunction's record with its predicate and is never discarded. Where
every mandatory result is `satisfied`, the declared basis relations agree
and no gap remains, a material counterexample to a mandatory constraint
falsifies the conjunction whichever contributor found it, and without one
the conjunction's value is the one its declared rule gives over the
mandatory results.

The declared rule. A conjunction declares which results are mandatory; how
conflict and indeterminacy are handled; which basis relations must agree,
results on different bases combining only under a declared coherent
composite basis (§2, Basis); which decision authority owns the
conjunction; how results that are not mandatory count; and whether any
result may veto or defer the decision.
Conjunction does not transfer the semantic authority of a contributing
evaluation (P6, P4a).

Composition of results. The result of composed steps for the outer
predicate is the conjunction of the steps' results, with the outer
contract's obligations as the required coverage. That each step returned
`satisfied` supports the outer predicate only where the refinement's
premises hold ([ACTIVATION §4](../ACTIVATION.md#4-totality-and-refinement),
Refinement).


Source: AXIOMATIC_CALCULUS.md#foundation-to-law sha256=2b24d3679cac3dd7a383c9ef382232acc8e99055709dc1a330e6f18a7b4cebbf rows=9/19 selected by the anchors this frame carries; the consumers paragraph of 19 items is omitted

### Foundation to law

This member is material family F9, the `a_c` calculus. The table below
shows which of its rules follow from which premises, in the format of
[FOUNDATIONS §3 Foundation to law](../FOUNDATIONS.md#foundation-to-law),
which also states the standing of the consequences. Instance premises,
which the commitments do not supply:

- (i) a governed symbolic system is represented by a finite model whose
  records stand for its objects, relations, constraints, residuals,
  traversals, transformations and judgments;
- (ii) a model is interpreted from an exact subject and may be encoded in
  a carrier, and subject, model and carrier are separately identified;
- (iii) some predicates over a model are decided mechanically, and others
  need bounded probabilistic construction or explicit human adjudication.

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|
| P3 (independent), P5 (derived from P0 and P6); (i) | By P3 every element binds one identity and basis, by P5 an unclosed population would leave results undecided, and by (i) the model is finite, so every model belongs to one closed, finite signature; every record occurs once in one population of eight fixed record families, every identity resolves once, locally or through one declared external relation, and an unknown, hidden, duplicated or dangling element refuses | [§2](../AXIOMATIC_CALCULUS.md#2-signature), [§3](../AXIOMATIC_CALCULUS.md#3-typed-records), [AC-001](../AXIOMATIC_CALCULUS.md#ac-001-closed-signature), [AC-003](../AXIOMATIC_CALCULUS.md#ac-003-reference-closure) | the eight core record kinds and the fields of each record: this member; a model family's sorts, value domains, reference domains and admissible kinds: the owning signature | 3, 10 |
| P3 (independent), P4a (independent) | By P3 identity is declared and scoped, and by P4a relations compose only by the types they declare, so identity is scoped, so equal spelling, payload, position or carrier establishes none; a relation is lawful only between the sorts its kind admits, with its required qualifiers, and its direction is material unless declared symmetric | [AC-002](../AXIOMATIC_CALCULUS.md#ac-002-scoped-identity), [AC-004](../AXIOMATIC_CALCULUS.md#ac-004-relation-typing) | each relation kind's sorts, qualifiers and any declared symmetry: the owning signature | 2, 3, 10 |
| P6 (independent), P4b (derived from P0 and P2), P3 (independent) | By P6 authority is not transferred by handling a record, by P3 every record binds its basis, and by P4b recorded facts persist, so copying, interpreting, encoding, evaluating or transporting a record transfers no authority, and every record, model and result binds an exact basis, mixed bases only under an owned composite-basis relation | [AC-005](../AXIOMATIC_CALCULUS.md#ac-005-authority-conservation), [AC-006](../AXIOMATIC_CALCULUS.md#ac-006-basis-coherence) | each composite-basis relation: the owner it names | 9, 10 |
| P5 (derived from P0 and P6), P6 (independent) | By P5 a value decides only what its evidence establishes, and by P6 a judgment is separate from its acceptance, so a constraint's judgment and every outcome of an operation of this member read as exactly one core value for a named predicate; no failed, missing or undecided result and no stop becomes success; a refusal's cause is part of its value, a demonstrated violation it names mapping to falsified and a condition of the basis the operation acts on to invalid_basis | [AC-007](../AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal); [§5](../AXIOMATIC_CALCULUS.md#5-traversals-and-functor-kinds), the stop algebra | the cause of a refusal that names both a demonstrated violation and a condition of the basis, `refusal(constraint)`, with the basis condition reported beside it as its own invalid_basis result: this member, in AC-007; the predicate language and judgment of each constraint kind: the owning signature; further stop values and their refinement: the signature's stop contract; the stop mapping of one traversal: its record, under §5 | 3, 9, 10 |
| P1 (independent), P6 (independent) | By P1 a difference in representation is not a difference in meaning unless declared, and by P6 latitude is granted only by its owner, so two values differ only through a declared latitude or transformation relation; silence is not latitude, and latitude grants no authority beyond its owner, scope, basis and invalidation law | [Latitude](../AXIOMATIC_CALCULUS.md#latitude), [AC-008](../AXIOMATIC_CALCULUS.md#ac-008-explicit-latitude) | each latitude record: its owner | 6, 10 |
| P4b (derived from P0 and P2), P6 (independent) | By P4b an unresolved condition persists until disposed, and by P6 only an authority disposes it, so a material uncertainty stays in the model until an authorised disposition; no projection, compression, interpretation or encoding erases a residual, and absence from a projection is not resolution | [Residual](../AXIOMATIC_CALCULUS.md#residual), [AC-009](../AXIOMATIC_CALCULUS.md#ac-009-residual-conservation) | each residual kind's domains: the owning signature; each disposition: the competent authority | 9, 10 |
| P4b (derived from P0 and P2), P3 (independent), P6 (independent) | By P4b a transformation's effects are facts that persist, by P3 they bind exact records, and by P6 their classification is accountable, so a transformation proves a closed delta over local records and external resolutions, each classified once as preserved or removed, with preservation shown by byte or typed equality; its result is a proposed successor that admits nothing | [AC-013](../AXIOMATIC_CALCULUS.md#ac-013-transformation) | each transformation, with its operation authority and preservation relation: the owner of the transformation record | 3, 4, 10 |
| P6 (independent), P3 (independent) | By P6 judgment and promotion are separate authorities, and by P3 a judgment binds its exact subject, so a judgment points to an unchanged subject, and promotion is a separate relation between that subject and its admission or acceptance judgment | [AC-014](../AXIOMATIC_CALCULUS.md#ac-014-judgment-separation) | none | 9, 10 |
| P4a (independent), P3 (independent), P6 (independent); (iii) | By P4a a traversal composes only through its declared contract, by P3 it binds one functor kind, by P6 its authority is separate, and by (iii) some predicates are decided mechanically and others not, so a traversal is a typed contract applied under exactly one functor kind; deterministic evaluation, probabilistic construction and human adjudication are distinct kinds, each distinct from actor, executor and domain operation, and the name asserts no categorical functor; traversals compose only under typed composition, which keeps both identities and every intermediate fact | [§5](../AXIOMATIC_CALCULUS.md#5-traversals-and-functor-kinds), [AC-015](../AXIOMATIC_CALCULUS.md#ac-015-functor-classification), [AC-016](../AXIOMATIC_CALCULUS.md#ac-016-typed-composition) | the functor kinds permitted for each traversal: the owning signature; the order of kinds in an application: that application | 4, 8, 10 |

Purpose and material relation: an actor
started on this member sees which rules of the calculus follow from the
foundations and which are choices, with the owner of each choice, so no
choice is presented as derived (P6, P1).

