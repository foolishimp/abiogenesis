# Reference frame traversal-task-f

Task: Judge causal claims, an event correction, a typed lineage edge and a precedence coordinate in an occurrence history, and give each stopped occurrence its stop kind, its core result value and what must survive beside that value.

Purpose: The owning sections for occurrence events, relation families, constraint, judgment, residual and stop kinds with their core mapping, occurrence identity, admission and correction, causality and precedence, effects, frontiers, authority, the calculus laws they import, and the core result algebra with its conjunction.

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

1. [AXIOMATIC_CALCULUS.md#ac-003-reference-closure](../AXIOMATIC_CALCULUS.md#ac-003-reference-closure)
2. [AXIOMATIC_CALCULUS.md#ac-004-relation-typing](../AXIOMATIC_CALCULUS.md#ac-004-relation-typing)
3. [AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal](../AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal)
4. [TRAVERSAL_OCCURRENCE.md#closed-event-kind-population](../TRAVERSAL_OCCURRENCE.md#closed-event-kind-population)
5. [TRAVERSAL_OCCURRENCE.md#closed-relation-families](../TRAVERSAL_OCCURRENCE.md#closed-relation-families)
6. [TRAVERSAL_OCCURRENCE.md#closed-constraint-judgment-residual-and-stop-kinds](../TRAVERSAL_OCCURRENCE.md#closed-constraint-judgment-residual-and-stop-kinds)
7. [TRAVERSAL_OCCURRENCE.md#occurrence-identity](../TRAVERSAL_OCCURRENCE.md#occurrence-identity)
8. [TRAVERSAL_OCCURRENCE.md#candidate-judgment-event-and-relation-separation](../TRAVERSAL_OCCURRENCE.md#candidate-judgment-event-and-relation-separation)
9. [TRAVERSAL_OCCURRENCE.md#causality-and-typed-lineage](../TRAVERSAL_OCCURRENCE.md#causality-and-typed-lineage)
10. [TRAVERSAL_OCCURRENCE.md#mutable-subject-effect-relation](../TRAVERSAL_OCCURRENCE.md#mutable-subject-effect-relation)
11. [TRAVERSAL_OCCURRENCE.md#event-frontier-and-projection](../TRAVERSAL_OCCURRENCE.md#event-frontier-and-projection)
12. [TRAVERSAL_OCCURRENCE.md#authority-and-adoption](../TRAVERSAL_OCCURRENCE.md#authority-and-adoption)
13. [ACTIVATION.md#effects](../ACTIVATION.md#effects)
14. [FOUNDATIONS.md#results](../FOUNDATIONS.md#results)
15. [FOUNDATIONS.md#conjunction-of-results](../FOUNDATIONS.md#conjunction-of-results)
16. [AXIOMATIC_CALCULUS.md#foundation-to-law](../AXIOMATIC_CALCULUS.md#foundation-to-law)
17. [TRAVERSAL_OCCURRENCE.md#foundation-to-law](../TRAVERSAL_OCCURRENCE.md#foundation-to-law)

Size of this frame: 105855 bytes.

Source: AXIOMATIC_CALCULUS.md#ac-003-reference-closure sha256=2b24d3679cac3dd7a383c9ef382232acc8e99055709dc1a330e6f18a7b4cebbf

### AC-003 Reference closure

Every referenced identity resolves exactly once in the applicable model or
through one explicit external relation. Resolution uses the exact
`RefDomain_Sigma(source_record_kind, field)` declaration across the
model's record populations. Dangling, duplicate, wrong-record-kind,
wrong-sort, wrong-basis, locally-and-externally ambiguous or
undeclared-field references refuse structural admission (P3, P5).


Source: AXIOMATIC_CALCULUS.md#ac-004-relation-typing sha256=2b24d3679cac3dd7a383c9ef382232acc8e99055709dc1a330e6f18a7b4cebbf

### AC-004 Relation typing

A relation is lawful only when its kind admits the exact source and target
sorts and all required qualifiers are present. Direction is material
unless the relation kind explicitly declares symmetry (P4a, P3).


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


Source: TRAVERSAL_OCCURRENCE.md#closed-event-kind-population sha256=f60c670ed5ed2b18e39f75fe4cf4004e8737b8d58526a6733fcaa10a5b660543

## Closed event-kind population

`FrameworkEvent.value.event_kind_ref` resolves exactly one member of this
closed population (P3):

```text
EventKind_occurrence = {
  urn:stdo:traversal-occurrence:event-kind:claim-admission,
  urn:stdo:traversal-occurrence:event-kind:occurrence-admission,
  urn:stdo:traversal-occurrence:event-kind:effect-disposition,
  urn:stdo:traversal-occurrence:event-kind:external-fact-admission
}
```

| Event kind | Required payload | Required scope and bindings |
|---|---|---|
| `claim-admission` | exact `RelationClaim` | exact claim and claim-judgment refs; source frontier equals the claim frontier; occurrence ref follows `scope_class` |
| `occurrence-admission` | exact `Occurrence` | `occurrence_scoped`; occurrence ref equals the payload ref; claim fields absent |
| `effect-disposition` | exact `EffectDisposition` | `occurrence_scoped`; occurrence ref equals the invocation's occurrence; claim fields absent |
| `external-fact-admission` | exact non-event `ProfileRecordRef` | `subject_scoped` or `authority_scoped`; occurrence and claim fields absent |

The short labels in the table denote the exact identities above. The
payload ref and digest bind the unchanged payload. An unknown event kind,
a wrong payload sort, a mismatched payload digest, an incompatible scope,
or a forbidden claim or occurrence field refuses `event_admission`. A
compatible extension declares a new event-kind population and its relation
to this signature; it cannot add an undeclared value to this population
(P3, P5).


Source: TRAVERSAL_OCCURRENCE.md#closed-relation-families sha256=f60c670ed5ed2b18e39f75fe4cf4004e8737b8d58526a6733fcaa10a5b660543

## Closed relation families

`Sigma_occurrence.RelationKind` contains these typed relation families
(P3, P4a):

| Relation kind | Source | Target | Core law |
|---|---|---|---|
| `application_of` | `Occurrence` | `TraversalApplication` | target equals the occurrence's exact application seed |
| `applies_traversal` | `TraversalApplication` | exact inherited `Traversal` | target equals the application's and occurrence's traversal ref |
| `bound_to_subject` | `Occurrence` | `SubjectBinding` | exactly one stable subject binding |
| `intends` | `Occurrence` | `IntendedOutcome` | resolves before occurrence identity is minted |
| `observes_before` | `Occurrence` | `Observation` | observation precedes any admitted effect for the occurrence |
| `observes_after` | `Occurrence` | `Observation` | observation follows the admitted effect disposition when an effect occurs |
| `invokes_effect` | `Occurrence` | `EffectInvocation` | optional; requires an exact operation grant |
| `operation_of_kind` | `EffectOperation` | `OperationKind` | exactly one operation kind per operation instance |
| `targets_subject` | `EffectOperation` | `SubjectBinding` | exactly one effect target binding |
| `authorized_by` | `EffectInvocation` | `OperationGrant` | exact grant checked against operation kind, target, and territory |
| `disposition_for` | `EffectDisposition` | `EffectInvocation` | required except for `no_effect`; never rewrites the invocation |
| `evidenced_by` | `EffectInvocation` | `EffectEvidence` | evidence does not become the mutable subject |
| `event_for` | `FrameworkEvent` | `Occurrence` | optional and permitted only by the event's declared scope law |
| `frontier_contains` | `EventFrontier` | `FrameworkEvent` | complete membership under one exact frontier basis |
| `projects_frontier` | `Projection` | `EventFrontier` | exactly one unchanged frontier per projection |
| `identity_depends_on` | `ProfileRecordRef` | `ProfileRecordRef` | earlier identity input; acyclic |
| `causally_precedes_occurrence` | `Occurrence` | `Occurrence` | admitted material cause; acyclic |
| `causally_precedes_event` | `FrameworkEvent` | `FrameworkEvent` | admitted material cause; acyclic |
| `supports_event` | `FrameworkEvent` | `FrameworkEvent` | typed evidential lineage; not cause by implication |
| `corrects_event` | `FrameworkEvent` | `FrameworkEvent` | typed correction lineage; does not erase its target |
| `component_of_occurrence` | `Occurrence` | `Occurrence` | child application belongs to one declared composite application |
| `admits_claim` | `FrameworkEvent` | `RelationClaim` | event binds one unchanged claim and its exact admission judgment |
| `materializes_relation` | `FrameworkEvent` | exact inherited `TypedRelation` | identity derives from claim, both judgments, event, and profile basis |
| `transition_for` | `TransitionSubject` | `Occurrence` | binds the exact transition subject judged |

`ProfileRecordRef` is the closed union of the profile semantic-object
records in `O` and the exact inherited `E`, `C`, `L`, `X`, `V`, `T` and `J`
populations in the same model; it introduces no ninth record kind. A ref
outside that union, resolved under a wrong population or sort, or absent
from the applicable declared external domain refuses (P3, P5).

Each relation is an exact `TypedRelation`. Its qualifiers close direction,
cardinality, basis, preservation, refusal and invalidation semantics; the
table is no permission to omit inherited relation fields. Every profile
relation uses exactly this qualifier record (P3):

```text
OccurrenceRelationQualifiers = {
  cardinality,
  authority_ref,
  evidence_refs,
  provenance_refs,
  invalidation_ref,
  inverse_kind_ref_or_none,
  preservation,
  loss,
  refusal
}
```

The qualifier value domains are closed (P3, P5):

```text
cardinality = exactly_one | zero_or_one | zero_or_more | one_or_more
preservation = identity_preserved | meaning_preserved | not_applicable
loss = none | declared_loss
refusal = refuse_missing | refuse_duplicate | refuse_wrong_type
        | refuse_invalid_basis | refuse_out_of_scope | not_applicable
```

The relation kind fixes the qualifier contract. For every core relation
`k` (P3):

```text
OccurrenceRelationQualifiers.cardinality = Cardinality_occurrence(k)
OccurrenceRelationQualifiers.preservation = meaning_preserved
OccurrenceRelationQualifiers.loss = none
OccurrenceRelationQualifiers.inverse_kind_ref_or_none = none
OccurrenceRelationQualifiers.refusal in {
  refuse_missing,
  refuse_duplicate,
  refuse_wrong_type,
  refuse_invalid_basis,
  refuse_out_of_scope
}
```

`not_applicable` is unavailable to a core profile relation, because every
core relation has an exact preservation and refusal law. The remaining
authority, evidence, provenance and invalidation refs are exact instance
coordinates. `Cardinality_occurrence` is this total function over the
closed core relation-kind population (P3, P5):

| Relation kind | Exact cardinality qualifier |
|---|---|
| `application_of` | `exactly_one` |
| `applies_traversal` | `exactly_one` |
| `bound_to_subject` | `exactly_one` |
| `intends` | `exactly_one` |
| `observes_before` | `zero_or_one` |
| `observes_after` | `zero_or_one` |
| `invokes_effect` | `zero_or_one` |
| `operation_of_kind` | `exactly_one` |
| `targets_subject` | `exactly_one` |
| `authorized_by` | `exactly_one` |
| `disposition_for` | `zero_or_one` |
| `evidenced_by` | `zero_or_more` |
| `event_for` | `zero_or_one` |
| `frontier_contains` | `zero_or_more` |
| `projects_frontier` | `exactly_one` |
| `identity_depends_on` | `zero_or_more` |
| `causally_precedes_occurrence` | `zero_or_more` |
| `causally_precedes_event` | `zero_or_more` |
| `supports_event` | `zero_or_more` |
| `corrects_event` | `zero_or_more` |
| `component_of_occurrence` | `zero_or_one` |
| `admits_claim` | `exactly_one` |
| `materializes_relation` | `exactly_one` |
| `transition_for` | `exactly_one` |

Every relation, and every `RelationClaim.value.relation_qualifiers`, has
exactly those nine fields and satisfies the contract its exact relation
kind selects. The five identity-bearing qualifier fields resolve through
the finite reference-domain table; the four enum fields use only the
values above. A missing or extra field, a duplicate ref, an unknown enum,
a kind and cardinality mismatch, an incompatible preservation, a declared
loss, a non-null inverse, an unavailable refusal, an unresolved authority,
evidence, provenance, invalidation or inverse-kind ref, or a qualifier
basis mismatch refuses structural admission. Materialisation copies the
accepted qualifier record byte for byte (P3, P5).

For every occurrence `o`, the value preimage and the typed relations are
exactly congruent (P3):

```text
target(application_of(o)) = o.value.application_ref
application_of(o).target.value.traversal_ref = o.value.traversal_ref
application_of(o).target.value.functor_kind_ref = o.value.functor_kind_ref
target(applies_traversal(application_of(o).target)) = o.value.traversal_ref
target(bound_to_subject(o)) = o.value.subject_binding_ref
target(intends(o)) = o.value.intended_outcome_ref
targets(identity_depends_on where source = o)
  = set(o.value.identity_dependency_refs)
sources(causally_precedes_occurrence where target = o)
  union sources(component_of_occurrence where target = o)
  = set(o.value.lineage_refs)
```

The equalities are set equalities only after list and relation-population
uniqueness is proved. Relation identities and exact `(kind, source,
target)` triples are each free of duplicates, and no conversion to a set
may erase a duplicate. Each singleton relation exists exactly once. A
duplicate, missing, extra, reversed or mismatched edge refuses
`occurrence_admission`, and a relation label cannot repair a different
identity preimage. `lineage_refs` contains only admitted occurrence-cause
predecessors and the component occurrences of an aggregate; support,
correction, timestamp, ordinal, adjacency and correlation edges never
enter occurrence lineage (P3, P5).

One occurrence has exactly one `application_of`, one `bound_to_subject`
and one `intends` relation. Every traversal application has exactly one
`applies_traversal`; every effect operation has exactly one
`operation_of_kind` and one `targets_subject`; every effect invocation has
exactly one `authorized_by`. One occurrence has zero or one
`invokes_effect`, and zero or one pre-observation and post-observation
relation of each declared observation kind. Every effect invocation has
zero or more `evidenced_by` relations. Every disposition other than
`no_effect` has exactly one `disposition_for`, and `no_effect` has none.
Every framework event has zero or one `event_for`. Every projection has
exactly one `projects_frontier`. Every claim-admission event has exactly
one `admits_claim` and exactly one `materializes_relation`. Identity,
causal, support, correction, component, frontier-membership and evidence
relations are finite and free of duplicates. `inverse_kind_ref_or_none`
is explicit; silence implies no inverse (P3, P4a).


Source: TRAVERSAL_OCCURRENCE.md#closed-constraint-judgment-residual-and-stop-kinds sha256=f60c670ed5ed2b18e39f75fe4cf4004e8737b8d58526a6733fcaa10a5b660543

## Closed constraint, judgment, residual and stop kinds

The core constraint kinds are (P3, P5):

```text
identity_dependency_acyclic
occurrence_causation_acyclic
event_causation_acyclic
occurrence_seed_complete
relation_claim_admissible
semantic_cut_complete
pre_effect_current
operation_grant_contains_effect
event_scope_compatible
frontier_complete
transition_subject_complete
```

The core judgment kinds are (P6):

```text
model_validation
occurrence_admission
event_admission
claim_admission
semantic_cut_admission
effect_readiness
transition_evaluation
frontier_projection
```

The core residual kinds are (P4b, P5):

```text
unobserved_subject_state
partial_effect
unresolved_cause
unresolved_scope
competing_lineage
stale_frontier
stale_currentness
unobserved_external_mutation
```

The core stop kinds are (P5):

```text
hold
gap
refusal
invalid_basis
out_of_scope
partial_effect
```

Every constraint predicate returns exactly one of `satisfied`,
`falsified`, `indeterminate` or `invalid_basis`. This value set refines
the constraint outcomes of
[AXIOMATIC_CALCULUS AC-007](../AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal)
by excluding `out_of_frame`. The reason: each constraint in the table
below is evaluated only on the record kind its row names and inside the
scope its row declares, so AC-007's out-of-scope case, a predicate asked
outside its `applies_to`, does not arise. An event whose declared scope
conflicts with the admitting authority falsifies `event_scope_compatible`;
the stop `out_of_scope` is that falsification, mapped below with the
difference from `out_of_frame` stated. `satisfied` maps to the
judgment's positive decision, the first decision listed below;
`invalid_basis` maps only to `invalid_basis`; the constraint table fixes
every other mapping. An implementation cannot turn an omitted result, a
residual or a stop into success (P5, P6).

The closed judgment domains are (P6, P5):

| Judgment kind | Unchanged subject | Decision domain | Required evidence | Stop, residual, and re-entry law |
|---|---|---|---|---|
| `model_validation` | `OccurrenceModelSubject` | `valid`, `hold`, `refused`, `invalid_basis` | exact model id/digest, profile basis, and typed graph populations | refusal or invalid basis; unresolved refs retain `gap` until repaired |
| `occurrence_admission` | `Occurrence` | `admitted`, `hold`, `refused`, `invalid_basis` | exact occurrence id/digest and resolved pre-existing seed inputs | missing seed retains `hold` plus `unresolved_cause`; re-enter with a new complete occurrence candidate |
| `event_admission` | `FrameworkEvent` | `admitted`, `hold`, `refused`, `invalid_basis`, `out_of_scope` | exact event id/digest, payload digest, scope authority, and source frontier | unresolved scope retains `hold` plus `unresolved_scope`; incompatible scope refuses |
| `claim_admission` | `RelationClaim` | `admitted`, `hold`, `refused`, `invalid_basis` | exact claim id/digest, endpoints, qualifiers, claimant authority, and current source frontier | unresolved cause or stale frontier retains `hold`; re-enter with a new claim over the current frontier |
| `semantic_cut_admission` | `SemanticAdmissionCut` | `admitted`, `hold`, `refused`, `invalid_basis` | exact seven-member cut and source/successor frontier equality | incomplete or inconsistent cut refuses; stale source frontier retains `hold` plus `stale_frontier` and requires reconstruction |
| `effect_readiness` | `EffectSubject` | `ready`, `stale`, `unauthorized`, `hold`, `invalid_basis` | exact pre-observation, invocation, operation, grant, territory, and invalidation state | stale yields `hold` plus `stale_currentness` and re-observation; unauthorized yields `refusal` and no dispatch |
| `transition_evaluation` | `TransitionSubject` | `satisfied`, `falsified`, `partial`, `indeterminate`, `refused`, `invalid_basis` | exact pre/post observations, intended outcome, disposition, and bounded effect evidence | partial yields `partial_effect`; indeterminate retains `hold` plus a declared residual; refused yields `refusal` |
| `frontier_projection` | `Projection` | `admitted`, `hold`, `gap`, `refused`, `invalid_basis` | exact projection/frontier ids and digests, complete members, basis, precedence law, boundary, and residuals | stale frontier retains `hold` plus `stale_frontier`; unresolved lineage retains `gap`; re-enter with a new projection |

Each is an inherited `Judgment` and so carries the unchanged subject id
and digest, evaluator, authority, evidence, provenance and decision
coordinate. The judgment kind defines the applicable stops and residuals;
none is inferred from prose (P6, P3).

The closed constraint domains are (P5):

| Constraint kind | Subject | Deciding judgment | `falsified` mapping | `indeterminate` mapping |
|---|---|---|---|---|
| `identity_dependency_acyclic` | `OccurrenceModelSubject` | `model_validation` | `refused` plus `refusal` | `hold` plus `unresolved_cause` |
| `occurrence_causation_acyclic` | `OccurrenceModelSubject` | `model_validation` | `refused` plus `refusal` | `hold` plus `unresolved_cause` |
| `event_causation_acyclic` | `OccurrenceModelSubject` | `model_validation` | `refused` plus `refusal` | `hold` plus `unresolved_cause` |
| `occurrence_seed_complete` | `Occurrence` | `occurrence_admission` | `refused` plus `refusal` | `hold` plus `unresolved_cause` |
| `relation_claim_admissible` | `RelationClaim` | `claim_admission` | `refused` plus `refusal` | `hold` plus `unresolved_cause` or `stale_frontier` |
| `semantic_cut_complete` | `SemanticAdmissionCut` | `semantic_cut_admission` | `refused` plus `refusal` | `hold` plus `stale_frontier` |
| `pre_effect_current` | `EffectSubject` | `effect_readiness` | `stale` plus `hold` and `stale_currentness` | `hold` plus `stale_currentness` |
| `operation_grant_contains_effect` | `EffectSubject` | `effect_readiness` | `unauthorized` plus `refusal` | `hold` plus `unobserved_subject_state` |
| `event_scope_compatible` | `FrameworkEvent` | `event_admission` | `out_of_scope` plus `refusal` | `hold` plus `unresolved_scope` |
| `frontier_complete` | `Projection` | `frontier_projection` | `refused` plus `refusal` | `hold` plus `stale_frontier` |
| `transition_subject_complete` | `TransitionSubject` | `transition_evaluation` | `refused` plus `refusal` | `indeterminate` plus `unobserved_subject_state` |

Each constraint declares zero latitude unless its exact record names a
`latitude_ref`; silence is not latitude. The residual kind fixes re-entry
(P5, P4b):

| Residual kind | Subject | Required re-entry |
|---|---|---|
| `unobserved_subject_state` | `SubjectBinding` | acquire a bounded observation or retain hold |
| `partial_effect` | `EffectInvocation` | acquire post-observation and explicit disposition |
| `unresolved_cause` | claim or event | acquire authority and evidence or retain unresolved |
| `unresolved_scope` | `FrameworkEvent` | declare lawful scope or refuse admission |
| `competing_lineage` | `EventFrontier` | apply an authorized `frontier_projection` judgment |
| `stale_frontier` | `Projection` | construct a new exact frontier and projection |
| `stale_currentness` | `EffectSubject` | re-observe and re-judge before effect |
| `unobserved_external_mutation` | `SubjectBinding` | observe or retain an explicit material unknown |

Mapping to the core result algebra. Purpose:
[FOUNDATIONS §4 Results](../FOUNDATIONS.md#results) states every outcome in
the core or in a refinement that maps each refined value to exactly one
core value, and
[AXIOMATIC_CALCULUS §5](../AXIOMATIC_CALCULUS.md#5-traversals-and-functor-kinds)
requires a traversal's stop algebra to map totally to that core (P5).
Material relation: a consumer that joins an occurrence's results with
other results reads each decision, stop and effect disposition as one
core value with its predicate, so a refusal, a held judgment or a partial
effect is neither read as success nor mistaken for another case (P5, P6).
The profile states three refinements, each with the predicate its mapping
is for:

| Refinement | Predicate of the mapping | Stated in |
|---|---|---|
| judgment decisions | the first decision the judgment kind lists holds for the unchanged subject on the exact basis | this section |
| stop kinds | the traversal application can reach its declared result on the exact basis | this section |
| effect dispositions | the intended effect occurred ([ACTIVATION §3 Effects](../ACTIVATION.md#effects)) | [Mutable-subject effect relation](../TRAVERSAL_OCCURRENCE.md#mutable-subject-effect-relation) |

A judgment decision is the evaluation's result and a stop is the step's.
Where values emitted together map to different core values, as `stale`
with `hold` does, each answers its own predicate. The stop's predicate is
not the predicate of
[construction availability](../ACTIVATION.md#construction-availability), "a
candidate is available", and no value counts toward another predicate
([FOUNDATIONS §4 Conjunction of results](../FOUNDATIONS.md#conjunction-of-results)).
Each value keeps its own vocabulary, residual and re-entry law beside its
core value (FOUNDATIONS §4 Results, Recording) (P5, P6).

Refined by cause. Where a stop or decision would map to one of two core
values according to its cause, the cause is part of the refined value,
written in parentheses as in `refusal(basis)`, and each refined value maps
once (FOUNDATIONS §4 Results, Refinements). The cause is read from what
the record already carries: for a refusal, the conditions it names; for a
`partial_effect` or `partial`, the effect evidence and the bounded
post-observation, read against the intended outcome under its outcome
contract and comparison basis (`IntendedOutcome`).
A refusal's cause is the one that the operation-outcome
rows `refusal(constraint)` and `refusal(basis)` of
[AXIOMATIC_CALCULUS AC-007](../AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal)
state for the conditions the refusal names: `constraint` where it names a
demonstrated violation by the record, model, carrier, transformation or
application under judgment, whatever condition of the basis it also names,
and `basis` where it names only conditions of the basis, a violation
inside an input that the operation acts on as its basis included. AC-007
gives each cause its core value and reports a basis condition named beside
a violation as its own invalid_basis result. Where a relation qualifier
records the cause, it records it and does not choose it, so this profile
and AC-007 give one refusal one value. The closed populations above are
unchanged; a refined value names a kind and its cause and adds no kind
(P5, P3). The causes are:

- `refusal(basis)`: the refusal names one or more conditions of the basis
  the operation acts on, as AC-007 lists for that value, and no
  demonstrated violation by what is under judgment; where a relation
  qualifier records its cause, it carries `refuse_invalid_basis`, which
  records a condition of the basis and no other cause. A basis mismatch
  inside the model or a record is the mixed bases that AC-007 lists for
  this value, a condition of the basis, so a refusal that names only such
  a mismatch has this cause: a coordinate and basis mismatch or a
  basis-relation mismatch refused at model validation
  ([Finite reference-domain table](../TRAVERSAL_OCCURRENCE.md#finite-reference-domain-table)), a
  qualifier basis mismatch refused at structural admission
  ([Closed relation families](../TRAVERSAL_OCCURRENCE.md#closed-relation-families)) and a
  cross-basis required edge that refuses a semantic admission cut
  ([Candidate, judgment, event and relation separation](../TRAVERSAL_OCCURRENCE.md#candidate-judgment-event-and-relation-separation)).
  None is the counterexample of a structural constraint. A refusal emitted
  with an `invalid_basis` decision, as `model_validation`'s "refusal or
  invalid basis" allows, has this cause where it names no demonstrated
  violation, because that decision names a condition of the basis and its
  repair. Where the refusal also names a demonstrated violation by what is
  under judgment, it has cause `constraint` below, as AC-007 rules, and
  the co-emitted `invalid_basis` decision is the basis condition's own
  result: it keeps invalid_basis for its own predicate, because the
  constraint rule above maps `invalid_basis` only to that core value and
  the judgment table keeps `refused` and `invalid_basis` distinct.
- `refusal(constraint)`: every other refusal, that is, every refusal that
  names a demonstrated violation by what is under judgment, whatever
  condition of the basis it also names, or names no condition that AC-007
  lists for `refusal(basis)`. The record, model, carrier, transformation
  or application under judgment violates a constraint of the occurrence
  signature, as AC-007 states for this value, and a basis condition the
  refusal also names is recorded with it and reported as its own
  invalid_basis result. It follows a falsified constraint, and the defect
  it names is the counterexample; where a relation qualifier records its
  cause, it carries `refuse_missing`, `refuse_duplicate`,
  `refuse_wrong_type` or `refuse_out_of_scope`. The falsified constraint
  is one of three: a row of the constraint table, which maps `falsified`
  to `refused` plus `refusal`; a structural constraint, named below; or
  the requirement that an admitted event carry a lawful declared scope. A
  refusal of admission under the `unresolved_scope` re-entry is a
  judgment-level refusal, which no relation qualifier records, and it takes
  this cause from the condition it names under AC-007, as every refusal
  does: `event_admission` requires the event's scope authority as evidence
  and the re-entry names the lawful scope declaration as what must be
  supplied, so the event candidate still lacking it when the re-entry
  closes is a demonstrated violation by the event under judgment and the
  counterexample. The `unresolved_scope` residual is retained, naming the
  undeclared scope, and re-entry is a new event
  candidate with a lawful declared scope. A seed that falsifies
  `occurrence_seed_complete`, an event scope missing when that re-entry
  closes or incompatible with the admitting authority, and a duplicate,
  missing, extra, reversed or mismatched edge are each a defect of the
  occurrence or event under judgment that violates a constraint of the
  signature. None is the seed set, scope or required-edge semantics of the
  basis the operation acts on, which AC-007 lists for `refusal(basis)`, so
  a refusal for any of them has this cause there. The same defect can bear
  on the predicate of another operation that acts on that record as its
  basis, as AC-007 rules (P5, P6).
- `refused(basis)` and `refused(constraint)`: decision `refused` of any
  judgment, by the cause of the refusal it yields, which the conditions
  that refusal names decide under AC-007 as above: `refused(basis)` when
  that refusal is `refusal(basis)`, otherwise `refused(constraint)`.
- `partial_effect(not_attained)`: the admitted evidence establishes that
  the intended outcome is not met and that no later completion of the
  effect can meet it. The effect evidence and the bounded
  post-observation, read under the outcome contract, show the intended
  outcome not met where nothing left of the effect can meet it, for
  example where the effect has ended short, or an interval that the
  outcome contract bounds has closed with only part reached, or the part
  already done has itself defeated the outcome, such as an effect that
  has already deleted a record the outcome requires, which no later
  completion of the effect restores. The evidence
  of non-attainment, such as the unreached part, is the counterexample.
  Whether the effect has ended is not part of this cause: where the
  evidence does not establish the end, the `partial_effect`
  residual records it beside the value, as
  [ACTIVATION §3 Effects](../ACTIVATION.md#effects) states.
- `partial_effect(undecided)`: every other `partial_effect`, that is,
  one whose admitted evidence does not establish non-attainment. The
  admitted evidence cannot decide whether the intended outcome is or will be met:
  the bounded post-observation that the
  [effect law](../TRAVERSAL_OCCURRENCE.md#mutable-subject-effect-relation) requires is not yet
  acquired, or it shows part reached while a later completion of the
  effect could still meet the outcome, or it shows the outcome met while
  the effect may still be acting, so whether the outcome is met once the
  effect settles is undecided, or a response was lost and no
  counterexample is observed. A lost response, an absent record or an
  actor's context holding no trace of the effect is no evidence about the
  subject, so it establishes neither non-attainment nor the end of the
  effect ([ACTIVATION §3 Effects](../ACTIVATION.md#effects)).
- `partial(not_attained)` and `partial(undecided)`: decision `partial` of
  `transition_evaluation`, by the cause of the stop `partial_effect` it
  yields.

| Value | Core value | Ground |
|---|---|---|
| stop `hold` | indeterminate | the step stops with the deciding evidence not yet admitted (missing seed, unresolved cause or scope, stale frontier or currentness, unobserved state), so the admissible evidence cannot decide whether the application can reach its declared result ([FOUNDATIONS §4 Results](../FOUNDATIONS.md#results); RF-012); its residual names the evidence that would decide |
| stop `gap` | invalid_basis | a reference or lineage member the judgment requires is unresolved, its resolution still open as AC-007 defines for `gap`, so the closure it rests on is undefined on this basis (AC-003, AC-010) and the basis cannot support the judgment until repaired |
| stop `refusal(constraint)` | falsified | the falsified constraint's defect is the counterexample, as construction availability maps `refused` to falsified (P5, P6) |
| stop `refusal(basis)` | invalid_basis | the basis cannot support the judgment; the constraint rule above maps `invalid_basis` only to that core value |
| stop `invalid_basis` | invalid_basis | the same core value; the constraint rule above maps `invalid_basis` only to it |
| stop `out_of_scope` | falsified | it is emitted only with `refusal`, when `event_scope_compatible` is falsified by a declared scope that conflicts with the admitting authority; an event scope not yet declared is `hold` plus `unresolved_scope` while the signature declares the scope relation, so the ground of out_of_frame, a missing declaration in the frame, is absent, and the spelling is not the core's out_of_frame; a refusal of admission once that re-entry closes without the declaration is stop `refusal(constraint)`, its cause taken from AC-007's condition as for every refusal, not this stop (P5, P6) |
| stop `partial_effect(not_attained)` | falsified | the unreached part of the intended outcome, which no later completion of the effect can reach, defeats the declared result; an end of the effect that the evidence does not establish takes no part in the value and is recorded in the `partial_effect` residual, which stays with the value with explicit re-entry before any further effect (P5, P6) |
| stop `partial_effect(undecided)` | indeterminate | an effect that has begun and whose evidence cannot decide whether the intended outcome is or will be met supplies no counterexample ([Mutable-subject effect relation](../TRAVERSAL_OCCURRENCE.md#mutable-subject-effect-relation)), so the admissible evidence cannot decide; the `partial_effect` residual names the post-observation and explicit disposition that would decide (P5, P6) |
| decision `partial(not_attained)` | falsified | the post-observation, read under the outcome contract, shows part of the intended outcome not reached and not reachable by any later completion of the effect, which defeats the transition's positive decision whether or not the effect has ended (P5, P6) |
| decision `partial(undecided)` | indeterminate | the admissible evidence cannot decide whether the transition reaches the intended outcome; the decision's required evidence includes the post-observation, and a missing one is `indeterminate` plus `unobserved_subject_state` under `transition_subject_complete`; the `partial_effect` residual names the explicit disposition that would decide (P5, P6) |
| decision `refused(constraint)` | falsified | the image of a falsified constraint under the constraint table, or of a falsified structural constraint named below (P5, P6) |
| decision `refused(basis)` | invalid_basis | as stop `refusal(basis)` (P5) |

The remaining judgment decisions follow the constraint rule above: the
first decision each judgment lists maps to satisfied; `out_of_scope`,
`unauthorized` and `stale`, which the constraint table makes the images
of a falsified constraint, map to falsified; `hold`, the image of an
indeterminate constraint, maps to indeterminate; `gap` maps to
invalid_basis on the ground of the stop so named; and `invalid_basis` and
the `falsified` and `indeterminate` of `transition_evaluation` map to the
core values so named (P5, P6).

This mapping holds for every traversal under this profile's signature; a
traversal does not re-map it. `hold`, `gap`, `refusal(constraint)` and
`refusal(basis)` have the meanings and core values that
[AXIOMATIC_CALCULUS AC-007](../AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal)
gives them, as the table above states. A traversal record's `stop_states`
may refine those four values by cause for that traversal, by a binding
declared in the shape of [PROFILES §1](../PROFILES.md#1-the-boundary): its
direction, preserved meaning, narrowed scope and invalidation. A refined
value adds no kind and takes its core value under the parent-value rule
of [AXIOMATIC_CALCULUS §5](../AXIOMATIC_CALCULUS.md#5-traversals-and-functor-kinds),
which this profile applies and does not restate. The other stops and
every judgment decision keep the mapping above unrefined, and a record
that declares no binding takes it unrefined (P5, P3, P1).

A structural refusal is one whose source is this profile's closed
structure rather than a row of the constraint table: an unknown or missing
required field under the closed value contract
([Closed semantic-object sorts](../TRAVERSAL_OCCURRENCE.md#closed-semantic-object-sorts)); a
missing population, hidden record, ambiguous ref, unknown record kind or
undeclared field domain
([Imported calculus boundary](../TRAVERSAL_OCCURRENCE.md#imported-calculus-boundary)); a missing
row, target outside its row, wrong population or sort, unresolved
external target, cardinality violation or nested coordinate or witness
defect refused at model validation
([Finite reference-domain table](../TRAVERSAL_OCCURRENCE.md#finite-reference-domain-table)); an
unknown event kind, wrong payload sort, mismatched payload digest or
forbidden claim or occurrence field refused at event admission
([Closed event-kind population](../TRAVERSAL_OCCURRENCE.md#closed-event-kind-population)); and a
qualifier-record defect refused at structural admission, a ref outside
the closed `ProfileRecordRef` union, resolved under a wrong population or
sort or absent from its declared external domain, and a duplicate,
missing, extra, reversed or mismatched edge refused at occurrence
admission ([Closed relation families](../TRAVERSAL_OCCURRENCE.md#closed-relation-families)). Each
is the refusal of a falsified structural constraint: the closed structure
is the declared predicate, and the unknown kind, unknown or missing
field, wrong type or mismatched edge is the counterexample that defeats
it (FOUNDATIONS §4 Results). A basis mismatch at any of these sources
is not among them: it is the mixed bases of AC-007, a condition of the
basis, so a refusal that names only such a mismatch takes
`refusal(basis)`, as stated for that value above. A stop `refusal` or
decision `refused` from such a source therefore takes
`refusal(constraint)` or `refused(constraint)`, and takes
`refusal(basis)` or `refused(basis)` only under the cause stated for
those values, as every refusal does: a source in the closed structure
does not make a refusal an invalid basis (P5, P6). A required reference
that `model_validation` leaves unresolved, its resolution still open as
AC-007 defines for `gap`, is not refused: it retains `gap` until repaired
and maps to invalid_basis by that stop's row. A reference evaluated to no
target, a local reference with no record in the closed populations
included, is dangling and refuses under
[AC-003](../AXIOMATIC_CALCULUS.md#ac-003-reference-closure) (P5). Where a
relation qualifier records the cause of a refusal, the qualifier, not
the core value, records whether the defect is a missing, duplicate,
wrong-typed or out-of-scope input or an invalid basis; the stop keeps it
in its own vocabulary, so the mapping drops none of the distinctions the
qualifier draws (P5, P4b).

Neither core value to which the `partial` and `partial_effect` values map
records that the subject changed or whether the effect has ended. The
`partial_effect` residual and its re-entry carry both facts and survive
every join
([FOUNDATIONS §4 Conjunction of results](../FOUNDATIONS.md#conjunction-of-results)).
Falsified never licenses treating the effect as absent; indeterminate
never licenses treating it as absent or as complete; neither licenses
treating it as ended where the evidence does not establish its end. Under
either value the explicit re-entry precedes any further effect, and an
effect whose end is not established is reconciled under
[ACTIVATION §5](../ACTIVATION.md#5-work-state-and-restart) before any
repetition (P5, P4b).

`Sigma_occurrence.FunctorKind` contains exact refs to `F_D`, `F_P` and
`F_H` from `b_ac` and no other functor kind. The profile changes none of
their laws, which are AXIOMATIC_CALCULUS §5 (P3, P6).


Source: TRAVERSAL_OCCURRENCE.md#occurrence-identity sha256=f60c670ed5ed2b18e39f75fe4cf4004e8737b8d58526a6733fcaa10a5b660543

## Occurrence identity

One occurrence identity binds only facts available before that occurrence
is admitted (P3):

```text
id(o_n) binds (
  exact traversal-occurrence-profile basis,
  application identity,
  traversal identity,
  functor-kind identity,
  subject-binding identity,
  intended-outcome identity,
  declared lineage inputs,
  declared identity-dependency inputs
)
```

Post-effect observations, effect evidence, judgments, admitted events,
timestamps, admission ordinals and projection results stay out of the
seed. They may point to the occurrence once their own identities exist
(P3, P4b).

`application identity` is the exact pre-existing `TraversalApplication`
identity, whose traversal and functor-kind fields equal the occurrence's.
`declared lineage inputs` and `declared identity-dependency inputs` are the
exact source and target populations that the relation-congruence law
states. The relation records are minted only after the occurrence identity
exists, so they do not enter the seed; their endpoints must reproduce it
exactly (P3).

Two applications of one traversal over one subject are two occurrences. A
retry or a continuation creates a fresh occurrence only when it reapplies
the traversal. A controller step, an observation, a wait or a correlation
record does not become an occurrence merely because it happens later (P3).

Under composition, every retained bracketed traversal application under
AC-016 has its own occurrence. A declared composite traversal that is
itself applied also has one aggregate occurrence. Each component
application relates to that aggregate through `component_of_occurrence`,
which is not material cause by implication. The intermediate results,
judgments, evidence, authority, provenance and stops that AC-016 requires
stay explicit (P4a, P4b).

### OP-001 Seed acyclicity

The directed graph formed by `identity_depends_on` is finite and acyclic.
Every dependency target exists before the dependent identity is minted. A
future result or event cannot be smuggled into its own occurrence seed
(P3).


Source: TRAVERSAL_OCCURRENCE.md#candidate-judgment-event-and-relation-separation sha256=f60c670ed5ed2b18e39f75fe4cf4004e8737b8d58526a6733fcaa10a5b660543

## Candidate, judgment, event and relation separation

The admission relation is (P6, P3):

```text
RelationClaim c
  -> Judgment j_c over unchanged c
  -> candidate FrameworkEvent e binding c, j_c, and source frontier F_k
  -> Judgment j_e over unchanged e
  -> deterministic TypedRelation r materialized from (c, j_c, e, j_e, basis)
  -> successor frontier F_k_plus_1
  -> SemanticAdmissionCut a = (c, j_c, e, j_e, r, F_k, F_k_plus_1)
  -> Judgment j_a over unchanged a
```

Only `j_c.decision = admitted`, `j_e.decision = admitted` and
`j_a.decision = admitted` together admit the complete semantic cut. `c`,
`j_c`, `e`, `j_e`, `r`, `a` and `j_a` have distinct identities and
authority. Constructing `c` does not admit it. A judgment does not rewrite
its subject. An event does not inherit the candidate's authority.
Materialisation cannot change the relation kind, endpoints, qualifiers or
basis that `j_c` accepted (P6, P3).

The three judgments are exact inherited `Judgment` records (P6):

```text
j_c.kind = claim_admission
j_c.subject = c.id
j_c.subject_digest = sha256(canonical bytes of c)

j_e.kind = event_admission
j_e.subject = e.id
j_e.subject_digest = sha256(canonical bytes of e)

j_a.kind = semantic_cut_admission
j_a.subject = a.id
j_a.subject_digest = sha256(canonical bytes of a)
```

Each judgment has the complete inherited context, owner, scope, basis,
evaluator, authority, decision, evidence, provenance and decision-time
fields. A missing cut judgment, a decision other than `admitted`, a wrong
subject or digest, or a judgment across bases refuses the semantic cut
(P6, P5).

An admission event's identity binds its event kind, payload digest,
scope, optional occurrence, exact claim, claim judgment, source frontier,
owner, scope and basis. The materialised relation's identity binds the
unchanged claim, claim judgment, event, event judgment and profile basis.
`frontier_contains(F, e)` holds exactly when `e` appears once in
`F.value.member_event_refs`; neither representation may hold an extra or a
missing event (P3).

For claim admission, `e.value.event_kind_ref` is exactly
`urn:stdo:traversal-occurrence:event-kind:claim-admission`, and these refs
are identical, not merely equivalent or adjacent (P3):

```text
c.value.source_frontier_ref
  = e.value.source_frontier_ref
  = a.value.source_frontier_ref
```

`a.value.successor_frontier_ref` resolves a frontier whose exact member
set is the source frontier's member set plus `e.id` once. The cut's claim,
claim judgment, event, event judgment, relation, source frontier and
successor frontier refs each resolve the unchanged record judged or
materialised (P3, P4b).

All seven cut subjects, all three judgments and the three required
relation records share the exact profile basis. The source and successor
frontiers also share `projection_basis_ref` and `precedence_law_ref`, and
the only permitted difference in frontier content is the addition of
`e.id` once. The cut includes exactly (P3, P4b):

```text
admits_claim(e, c)
materializes_relation(e, r)
frontier_contains(F_k_plus_1, e)
```

Each edge has the exact inherited relation shape and
`OccurrenceRelationQualifiers`. Missing, extra, reversed, duplicate or
cross-basis required edges refuse the cut. The source frontier must not
already contain `e`, and duplicate frontier members refuse before any set
comparison (P3, P5).

A first event needs no fictional predecessor. Re-admission of the same
claim, claim judgment, event judgment, source frontier, basis and
authority returns the existing byte-equal semantic cut. Any collision that
is not identical refuses with `refuse_duplicate` and never mints rival
facts (P3, P6).

The endpoints of a pre-admission `RelationClaim` already exist. The
generated `admits_claim` and `materializes_relation` records are
post-admission relations, not claims that contain their own future event
endpoint (P3).

### OP-002 Atomic semantic admission

For a relation claim, one admitted semantic cut contains the unchanged
claim, its admission judgment, the event and its scope and admission
judgment, the deterministic materialised relation, the exact source
frontier, and the unique successor frontier. The source frontier that the
claim, the event and the cut name is one identical frontier, and the
successor equals that frontier plus exactly the admitted event. Missing,
conflicting or inconsistent members refuse the cut. This atomicity is
semantic; the profile prescribes no storage or transaction mechanism (P3,
P4b, P6).

### OP-003 Correction without erasure

`corrects_event(new, existing)` keeps both immutable events. A correction
changes later projection through an explicit selection law; it does not
delete, rewrite or retrospectively re-identify the corrected fact (P3,
P4b).


Source: TRAVERSAL_OCCURRENCE.md#causality-and-typed-lineage sha256=f60c670ed5ed2b18e39f75fe4cf4004e8737b8d58526a6733fcaa10a5b660543

## Causality and typed lineage

Three graph families stay distinct (P3, P6):

```text
G_id          identity-dependency DAG
G_occ_cause   declared occurrence-causation DAG
G_evt_cause   declared event-causation DAG
```

Each is acyclic under its own typed relation. Cause is established only by
an admitted causal claim under competent authority and evidence.
Timestamp, ordinal, adjacency, containment, a common subject, a shared
actor, correlation and arrival order do not create cause (P6, P3).

The wider typed-lineage graph may lawfully contain opposing edges of
different kinds: one event may support another while the second corrects
the first. A cycle in the untyped union is not a causal cycle unless one
declared causal subgraph itself cycles (P3).

### OP-004 Precedence is not authority

A projection may use a declared precedence coordinate to select current
truth. The coordinate, its comparison law, its basis and its admitting
authority are explicit. The coordinate orders eligible facts; it gains no
semantic, admission, causal or decision authority (P6, P3).


Source: TRAVERSAL_OCCURRENCE.md#mutable-subject-effect-relation sha256=f60c670ed5ed2b18e39f75fe4cf4004e8737b8d58526a6733fcaa10a5b660543

## Mutable-subject effect relation

Let `W` be an externally mutable subject bound by the stable
`SubjectBinding b_W`. For occurrence `o_n` (P3, P6):

```text
observe(W_n, b_W) -> q_n

F_K[v_n] classifies one traversal application.
op_n is a separately identified domain operation.
g_n is the exact owner-issued grant for op_n over b_W.
inv_n = EffectInvocation(o_n, op_n, executor_n, actor_n, g_n, territory_n, inputs_n)
s_n = EffectSubject(o_n, b_W, q_n, inv_n, op_n, g_n, territory_n, invalidation_n)
j_ready = judge_effect_readiness(s_n)

j_ready.decision = ready
  -> dispatch(inv_n, W_n, b_W)
       -> (W_n_plus_1, disposition_n)

observe(W_n_plus_1, b_W) -> q_n_plus_1
judge(TransitionSubject(o_n, q_n, q_n_plus_1, disposition_n, ...)) -> Judgment
```

Functor kind, traversal, domain operation, executor, actor, grant and
effect invocation are different coordinates. An `F_P`, `F_D` or `F_H`
classification does not by itself identify, authorise or execute `op_n`
(P6, P3).

No operation is lawful without a matching grant that names the subject
binding, the operation kind and the effect territory. Profile construction
and occurrence admission mint no grant (P6).

For invocation `inv_n`, operation instance `op_n`, grant `g_n` and
occurrence `o_n`, every operation binding is exact (P6, P3):

```text
inv_n.value.operation_ref = op_n.id
target(operation_of_kind(op_n)) = op_n.value.operation_kind_ref
target(targets_subject(op_n)) = op_n.value.subject_binding_ref
target(authorized_by(inv_n)) = inv_n.value.operation_grant_ref = g_n.id
op_n.value.subject_binding_ref = g_n.value.subject_binding_ref
                             = o_n.value.subject_binding_ref
op_n.value.operation_kind_ref in g_n.value.allowed_operation_kind_refs
op_n.value.operation_contract_ref
  = object(op_n.value.operation_kind_ref).value.operation_contract_ref
op_n.value.effect_territory_ref = inv_n.value.effect_territory_ref
                               = g_n.value.allowed_effect_territory_ref
```

The exact `OperationKind` object therefore closes the grant over both kind
and contract. A grant cannot authorise an operation instance that carries
the same label with a different contract, target sort, invalidated kind or
unresolved kind ref (P6, P3).

An adopting Product may replace exact territory equality only through an
explicit, authority-owned containment relation in its compatible
signature. Nominal kind equality, a role label, executor access or broad
workspace access does not satisfy the grant (P6, P1).

The disposition law is closed (P5, P6):

- `no_effect` has no dispatched invocation and records that no domain
  effect was attempted;
- `completed_effect` binds one dispatched invocation, a bounded
  post-observation and sufficient effect evidence;
- `partial_effect` binds one dispatched invocation, a bounded
  post-observation, bounded evidence, the `partial_effect` residual and
  stop, and explicit re-entry before any further effect; and
- `refused_effect` binds the refused invocation attempt and the `refusal`
  stop, with evidence that no mutation began within the material effect
  boundary.

A refusal records a decision about authority; it does not by itself
establish the absence of a mutation. Where an unauthorised mutation
occurred or remains possible within the material effect boundary, retain
the actual invocation, observations and uncertainty. Such a case does not
satisfy the evidence condition for `refused_effect`; its effect result
and recovery follow [ACTIVATION §3 Effects](../ACTIVATION.md#effects) and
[ACTIVATION §5 Recovery](../ACTIVATION.md#5-work-state-and-restart). `not_effected` means that
the intended outcome was not attained, not that no effects occurred
(P5, P6).

`invokes_effect` exists if and only if a concrete invocation was
dispatched; `unauthorized` or `stale` readiness never dispatches it. The
immutable `EffectInvocation` contains no future disposition, and
`EffectDisposition` records the later outcome without rewriting the
invocation (P3, P6).

Mapping of the dispositions to the core. Purpose:
[FOUNDATIONS §4 Results](../FOUNDATIONS.md#results) places the results of
effects in the core. Material relation: whether an occurrence's effect
may be repeated or relied on, which is the material relation of
[ACTIVATION §3 Effects](../ACTIVATION.md#effects) (P5, P6). An occurrence
intends an effect when an `EffectInvocation` names it. For such an
occurrence the disposition refines ACTIVATION §3 Effects and maps for its
predicate, "the intended effect occurred"; the causes of the two
`partial_effect` values are those stated under
[Closed constraint, judgment, residual and stop kinds](../TRAVERSAL_OCCURRENCE.md#closed-constraint-judgment-residual-and-stop-kinds):

| Disposition | Effects value | Core value | Ground |
|---|---|---|---|
| `completed_effect` | `completed` | satisfied | the bounded post-observation and sufficient effect evidence establish that the intended effect occurred and that the effect has ended |
| `partial_effect(not_attained)` | `not_effected` | falsified | the admitted evidence establishes that the intended outcome is not attained and that no later completion of the effect can attain it; the part that did occur is named with the value, and an end of the effect that the evidence does not establish is recorded beside it, not in it |
| `partial_effect(undecided)` | `completion_unknown` | indeterminate | the evidence cannot decide whether the intended outcome is or will be reached |
| `refused_effect` | `not_effected` | falsified | the evidence shows that no mutation began within the material effect boundary |
| `no_effect` | `not_effected` | falsified | the admitted disposition records that no invocation was dispatched, and the record is exact because `invokes_effect` exists if and only if one was; so the occurrence effected nothing on the subject |

An occurrence that no `EffectInvocation` names intends no effect.
ACTIVATION §3 Effects poses no predicate for it, and its `no_effect`
records only that no domain effect was attempted: it is a record, not an
effect result (P5, P6).

`j_ready` judges the unchanged `EffectSubject` immediately before effect
dispatch under the application's declared currentness and invalidation
law. If the pre-observation or the grant has become stale, the effect does
not start; the application re-observes and issues a new readiness subject
and judgment, or stops. If an effect has begun and cannot establish a
complete disposition, `partial_effect` stays explicit and a bounded
post-effect observation is required. This law requires no lock or
transaction implementation (P5, P6).

### OP-005 Mutable reality conservation

`W` remains the carrier of mutable reality. Observation, evidence, result,
checkpoint, event, projection, cache or model content may describe `W`;
none replaces it. A later traversal application observes the then-current
`W` under the stable binding when authority is unchanged (P3, P0).

Snapshotting or rollback may be supplied by a separately authorised
application. This profile neither requires nor forbids it and does not
infer rollback from a new occurrence (P6).

### OP-006 Immutable iteration history

Iteration does not mutate an earlier occurrence. Each traversal
reapplication mints a fresh immutable occurrence over the evolving
subject, so the admitted occurrence and event history is append-only even
when the external subject changes repeatedly (P3, P4b).


Source: TRAVERSAL_OCCURRENCE.md#event-frontier-and-projection sha256=f60c670ed5ed2b18e39f75fe4cf4004e8737b8d58526a6733fcaa10a5b660543

## Event frontier and projection

An `EventFrontier` binds the complete member set of events evaluated, its
exact basis and its declared precedence law. A projection judgment points
to one unchanged `Projection` identity and digest, and that projection
binds exactly one unchanged frontier (P3).

For profile basis `b`, scope `s` and precedence law `p` there is one empty
frontier `F_0(b,s,p)`. Admitting event `e_k_plus_1` constructs a successor
whose member set is exactly `members(F_k) union {e_k_plus_1}`. Frontier
identity binds the profile basis, scope, precedence law, sorted event
identities and event content digests. Projection identity binds the exact
frontier, the projection rule, and the selected relation, boundary and
residual ids (P3, P4b).

New events create a new frontier, and a prior projection does not silently
advance. Latest-only summaries do not prove frontier completeness.
Competing corrections, unresolved scope, missing causal inputs or a stale
basis remain residuals or stops according to the selected projection law
(P3, P5).

### OP-007 Scope conservation

Every event carries its declared scope class. `event_for` is present only
when the scope law names one exact occurrence. Facts that are
subject-wide, publication-wide or otherwise independent of any occurrence
stay independent (P3).


Source: TRAVERSAL_OCCURRENCE.md#authority-and-adoption sha256=f60c670ed5ed2b18e39f75fe4cf4004e8737b8d58526a6733fcaa10a5b660543

## Authority and adoption

This profile owns only the application-neutral record, relation, identity,
causal, effect-boundary, frontier and refusal laws above. It grants no
semantic, operation, evaluation, admission, decision, correction,
continuation or closure authority. Every material operation and judgment
resolves an existing owner-issued grant. Copying a profile record or
adopting the profile transfers no authority (P6).

Only Product authority adopts the profile, as
[PRODUCT_DEFINITION §7](../PRODUCT_DEFINITION.md#7-collective-reference-frame-basis)
states for every available profile; this section adds no adopter. For
this profile, a Product adoption declares at least (P6, P1):

- the exact traversal-occurrence-profile basis;
- the exact subject and subject-binding interpretation;
- mappings from Product concepts to profile sorts and relation kinds;
- operation, actor, executor, admission, projection and decision
  authorities;
- event scope and frontier laws;
- invalidation and re-entry conditions; and
- qualification evidence proving that no Product distinction was lost.

An absent or incomplete adoption means the profile is available but
inactive for that Product (P6).


Source: ACTIVATION.md#effects sha256=7ad7b69b5ad8ec20678b3ef866a26fb328f2fa6f60c4d1d06ca0b926845b89bf

### Effects

An effectful step's intended external effect has one of three values,
mapped for the predicate "the intended effect occurred", that is, the
declared outcome of the effect is attained. The value turns on what the
admitted evidence establishes about that outcome (P5 with the open-world
premise, P6):

| Value | Core value | Ground |
|---|---|---|
| `completed` | satisfied | evidence about the subject establishes that the intended effect occurred in full and that the effect has ended |
| `not_effected` | falsified | evidence about the subject establishes that the declared outcome is not attained and that no later completion of the effect can attain it, for example where no effect began, the effect ended short, an interval that the declared outcome bounds has closed with part of it not done, or the part already done has itself made the declared outcome unattainable, as when it destroyed what the outcome needed; any part that did occur is named with the value |
| `completion_unknown` | indeterminate | neither of the other values is established: the evidence cannot decide whether the intended effect has occurred or will occur, as for a request whose response was lost with no counterexample observed; or the evidence shows the intended effect in full while the effect may still be acting, and the outcome stays undecided until what the effect leaves on the subject is settled; its residual names the observation that would decide |

`not_effected` requires evidence about the subject. A lost response, an
absent record, or an actor's context that holds no trace of the effect is
not that evidence, and the value stays `completion_unknown`.
`completion_unknown` never maps to `completed` or to `not_effected`.

Whether the effect has ended is a second question beside the predicate
above, and it enters the value only as a conjunct of `completed`. An
effect has ended where evidence about the subject establishes
that it no longer acts on the subject or that it never began. Where an
effect began and the evidence does not establish its end, the end is not
established, and that is recorded beside the value as a residual naming
the observation that would establish it. The end never decides a
`not_effected` value and is never folded into one: when an interval that
the declared outcome bounds has closed with part not done, the value is
`not_effected` while the effect may still be acting. The residual does
not weaken the counterexample, and the counterexample does not resolve
the residual. `completed` alone requires the end established, so a
counterexample stands without proof that the effect has ended, while
success is never claimed for an effect that may still be acting
([FOUNDATIONS §4 Results](../FOUNDATIONS.md#results), Standing).

An effect of uncertain completion is one whose value is
`completion_unknown`, or whose value is `not_effected` with its end not
established. §5 reconciles it, sufficiently for the next dependent
action, before any repetition or dependent action. A `not_effected`
value licenses neither treating the effect as absent nor repeating it
while its end is not established.

The refinement's material relation is whether an action whose
external effect may have occurred is repeated or relied on; §4 names a
lost post-effect response as a case that no added core value solves, and
this refinement records it in the existing core. Keeping the end of the
effect beside the value keeps two facts that one value would merge: a
counterexample already established for the declared outcome, and an
effect that may still be acting.


Source: FOUNDATIONS.md#results sha256=3e85b8d01360dfae6758566fd3aca309c977e7d9e15cdd2f9e8f2904f18f2545 rows=6/18 selected by the anchors this frame carries; the consumers paragraph of 18 items is omitted

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


Source: AXIOMATIC_CALCULUS.md#foundation-to-law sha256=2b24d3679cac3dd7a383c9ef382232acc8e99055709dc1a330e6f18a7b4cebbf rows=3/19 selected by the anchors this frame carries; the consumers paragraph of 19 items is omitted

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
| P5 (derived from P0 and P6), P6 (independent) | By P5 a value decides only what its evidence establishes, and by P6 a judgment is separate from its acceptance, so a constraint's judgment and every outcome of an operation of this member read as exactly one core value for a named predicate; no failed, missing or undecided result and no stop becomes success; a refusal's cause is part of its value, a demonstrated violation it names mapping to falsified and a condition of the basis the operation acts on to invalid_basis | [AC-007](../AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal); [§5](../AXIOMATIC_CALCULUS.md#5-traversals-and-functor-kinds), the stop algebra | the cause of a refusal that names both a demonstrated violation and a condition of the basis, `refusal(constraint)`, with the basis condition reported beside it as its own invalid_basis result: this member, in AC-007; the predicate language and judgment of each constraint kind: the owning signature; further stop values and their refinement: the signature's stop contract; the stop mapping of one traversal: its record, under §5 | 3, 9, 10 |

Purpose and material relation: an actor
started on this member sees which rules of the calculus follow from the
foundations and which are choices, with the owner of each choice, so no
choice is presented as derived (P6, P1).


Source: TRAVERSAL_OCCURRENCE.md#foundation-to-law sha256=f60c670ed5ed2b18e39f75fe4cf4004e8737b8d58526a6733fcaa10a5b660543 rows=8/9 selected by the anchors this frame carries; the consumers paragraph of 9 items is omitted

### Foundation to law

This member is material family F19, traversal occurrence. The table below
shows which of its rules follow from which premises, in the format of
[FOUNDATIONS §3 Foundation to law](../FOUNDATIONS.md#foundation-to-law),
which also states the standing of the consequences. The family imports
two families under [PROFILES §1](../PROFILES.md#1-the-boundary): F3, results
and their combination ([FOUNDATIONS §4 Results](../FOUNDATIONS.md#results)),
and F9, the `a_c` calculus ([AXIOMATIC_CALCULUS §1](../AXIOMATIC_CALCULUS.md#1-position)).
Its instance premises hold where a Product adopts the profile; they are
adopted with it and do not follow from the foundations (P1, P6):

- I1: a subject's reality changes outside the model, and a stable binding
  names that subject;
- I2: the adopting Product selects one exact `a_c` basis;
- I3: an effect on the subject is a separately identified operation under
  an owner-issued grant.

Standing of the commitments cited: P0 recovered; P1, P3 and P6
independent; P4b derived from P0 and P2, and P5 derived from P0 and P6
([FOUNDATIONS §3](../FOUNDATIONS.md#3-commitments)).

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|
| P3 (independent); F9 imported; I2 | By P3 a value binds one exact basis, and I2 selects one exact `a_c` basis, so an occurrence model is an ordinary `a_c` model on that basis. The profile adds sorts and value domains but no record kind, because a new record kind would be a second calculus beside F9. With closed populations, an unknown, missing or mistyped element is detected and refused, not read | [Imported calculus boundary](../TRAVERSAL_OCCURRENCE.md#imported-calculus-boundary); [Closed semantic-object sorts](../TRAVERSAL_OCCURRENCE.md#closed-semantic-object-sorts), [Finite reference-domain table](../TRAVERSAL_OCCURRENCE.md#finite-reference-domain-table), [Closed event-kind population](../TRAVERSAL_OCCURRENCE.md#closed-event-kind-population), [Closed relation families](../TRAVERSAL_OCCURRENCE.md#closed-relation-families); [Exact profile identity](../TRAVERSAL_OCCURRENCE.md#exact-profile-identity) | closing the sorts, reference domains, event kinds, relation families and qualifier domains, and their members: a policy of this member, chosen so that refusal of an unknown element is decidable | 2, 3, 10 |
| P3 (independent); P4b (derived from P0 and P2); I1 | By P3 an identity binds its exact inputs, so a traversal applied again to any changed input is a different occurrence; by P4b an established fact is not erased. So each application is one immutable occurrence, a reapplication mints a new one, and a correction appends without erasing | [Occurrence identity](../TRAVERSAL_OCCURRENCE.md#occurrence-identity), [OP-003](../TRAVERSAL_OCCURRENCE.md#op-003-correction-without-erasure), [OP-006](../TRAVERSAL_OCCURRENCE.md#op-006-immutable-iteration-history) | the identity inputs of an occurrence: this member | 2, 9 |
| P6 (independent); I3 | By P6 authority exists only through an admitted grant, and by I3 an effect is a separately identified operation under such a grant, so no operation is lawful without a matching grant, and functor kind, traversal, operation, executor, actor, grant and invocation stay distinct coordinates | [Mutable-subject effect relation](../TRAVERSAL_OCCURRENCE.md#mutable-subject-effect-relation) | a territory containment relation in place of exact equality: the adopting Product, in its compatible signature | 4, 8, 9 |
| P1 (independent); P6 (independent) | By P1 a representation does not carry its meaning, and by P6 evaluation, admission and decision are separate authorities, so a candidate, its judgment, its admitting event and the materialised relation stay distinct; precedence orders admitted facts and decides no authority | [Candidate, judgment, event and relation separation](../TRAVERSAL_OCCURRENCE.md#candidate-judgment-event-and-relation-separation), [OP-004](../TRAVERSAL_OCCURRENCE.md#op-004-precedence-is-not-authority) | the precedence law, evaluators and authorities of an application: the adopting Product | 2, 9 |
| P3 (independent); P6 (independent) | By P3 a relation holds only on its declared basis, and by P6 only an authority admits it, so cause is admitted typed lineage and is never inferred from time, order, adjacency, containment or correlation | [Causality and typed lineage](../TRAVERSAL_OCCURRENCE.md#causality-and-typed-lineage), [OP-001](../TRAVERSAL_OCCURRENCE.md#op-001-seed-acyclicity) | which causal claims an application admits: the adopting Product, under its authorities; that each identity or causal subgraph is acyclic: a policy of this member, chosen so that every lineage walk ends at a first cause | 2, 9 |
| P3 (independent); P4b (derived from P0 and P2); P5 (derived from P0 and P6) | By P3 a projection binds its exact inputs, and by P4b admitted events persist, so a projection binds one complete event frontier, and a new event makes a new frontier rather than advancing an old projection; for the same reason the members of one admitted semantic cut name one identical source frontier, its successor is that frontier plus exactly the admitted event, and a cut with missing or inconsistent members refuses; by P5 a projection is not read beyond the frontier it binds | [Event frontier and projection](../TRAVERSAL_OCCURRENCE.md#event-frontier-and-projection), [OP-002](../TRAVERSAL_OCCURRENCE.md#op-002-atomic-semantic-admission), [OP-007](../TRAVERSAL_OCCURRENCE.md#op-007-scope-conservation) | the event scope and frontier laws: the adopting Product | 2, 6, 9 |
| P5 (derived from P0 and P6); F3 and F9 imported | By P5 a value decides only what its evidence establishes, and F3 gives one core, so every judgment decision and stop, and every effect disposition of an occurrence that intends an effect, maps to exactly one core value for a named predicate; an effect whose outcome the evidence cannot decide stays indeterminate, an established non-attainment of its intended outcome is falsified whether or not its end is established, and no refusal maps to success | [Closed constraint, judgment, residual and stop kinds](../TRAVERSAL_OCCURRENCE.md#closed-constraint-judgment-residual-and-stop-kinds), [Mutable-subject effect relation](../TRAVERSAL_OCCURRENCE.md#mutable-subject-effect-relation) | the decision, stop and residual vocabularies and their mapping, and the exclusion of `out_of_frame` from the constraint value set: this member; the meanings and core values of `hold`, `gap` and the two `refusal` values, and the cause of each refusal: [AXIOMATIC_CALCULUS AC-007](../AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal); a refinement of those four values by cause for one traversal, each refined value keeping its parent's core value: that traversal record, under [AXIOMATIC_CALCULUS §5](../AXIOMATIC_CALCULUS.md#5-traversals-and-functor-kinds) | 3, 9, 10 |
| P6 (independent) | By P6 authority exists only through an admitted grant, and inclusion in a method cut is no grant, so availability is not adoption, and the profile grants no authority | [Authority and adoption](../TRAVERSAL_OCCURRENCE.md#authority-and-adoption) | who adopts: Product authority, under [PRODUCT_DEFINITION §7](../PRODUCT_DEFINITION.md#7-collective-reference-frame-basis); the subject interpretation, vocabulary mappings and authorities an adoption declares: the adopting Product | 1, 7, 9 |

The Scope, the Exclusions and the Conformance obligations apply these
consequences, and every clause names the principle that requires it
([FOUNDATIONS §1](../FOUNDATIONS.md#1-vocabulary-of-standing)). Purpose and material relation: an actor started on
this member sees which rules follow from the foundations and which are
choices, and who owns each choice, so no choice is presented as derived
(P6, P1).

