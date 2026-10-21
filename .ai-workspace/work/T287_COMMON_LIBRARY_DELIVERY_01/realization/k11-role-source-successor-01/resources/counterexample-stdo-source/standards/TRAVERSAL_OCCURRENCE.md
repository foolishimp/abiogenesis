# TRAVERSAL_OCCURRENCE

Tier 3. The `a_c` traversal occurrence profile over mutable subjects: an
optional model-family signature for immutable application histories. It
imports [AXIOMATIC_CALCULUS](AXIOMATIC_CALCULUS.md) by reference under
[PROFILES §1](PROFILES.md#1-the-boundary) and restates none of it: the
signature, `RecordKind_ac` and `Population_M` are
[AXIOMATIC_CALCULUS §2](AXIOMATIC_CALCULUS.md#2-signature); the typed
records are [§3](AXIOMATIC_CALCULUS.md#3-typed-records); reference closure
is [AC-003](AXIOMATIC_CALCULUS.md#ac-003-reference-closure); the traversal
record and the functor kinds F_D, F_P and F_H are
[§5](AXIOMATIC_CALCULUS.md#5-traversals-and-functor-kinds), with typed
composition at [AC-016](AXIOMATIC_CALCULUS.md#ac-016-typed-composition);
the calculus basis is [§8](AXIOMATIC_CALCULUS.md#8-calculus-identity). The
core result algebra is [FOUNDATIONS §4 Results](FOUNDATIONS.md#results),
and the effect refinement this profile refines is
[ACTIVATION §3 Effects](ACTIVATION.md#effects).
Here occurrence, lineage, frontier, cut and projection name only this
profile's sorts and relations: `Occurrence`, its `lineage_refs` and typed
lineage relations, `EventFrontier`, `SemanticAdmissionCut` and
`Projection`. They claim neither the core's release cut nor its product
lineage, nor any other member's frontier; a `frontier_projection`
judgment judges a `Projection` record and is not an
[AC-011](AXIOMATIC_CALCULUS.md#ac-011-projection) projection (P3, P1).

## Position

The traversal occurrence profile defines an application-neutral
model-family signature for immutable application histories over a subject
that changes outside the model. Its stable concept identity is (P3):

```text
urn:stdo:concept:traversal-occurrence-profile
```

This member owns that concept in the bounded context (P1, P3):

```text
urn:stdo:bounded-context:traversal-occurrence-profile
```

Adoption is optional. The profile imports one exact `a_c` basis and
instantiates one closed model-family signature under that basis's record
and model laws. It does not amend `a_c`, does not become part of every
`a_c` model and defines no universal execution theory (P1, P6).

Availability is not adoption. A Product that adopts the profile owns its
subject interpretation, concrete vocabulary, authorities, requirements,
design, implementation and evidence; this member imports none of those
consumer identities (P6, P1).

### Foundation to law

This member is material family F19, traversal occurrence. The table below
shows which of its rules follow from which premises, in the format of
[FOUNDATIONS §3 Foundation to law](FOUNDATIONS.md#foundation-to-law),
which also states the standing of the consequences. The family imports
two families under [PROFILES §1](PROFILES.md#1-the-boundary): F3, results
and their combination ([FOUNDATIONS §4 Results](FOUNDATIONS.md#results)),
and F9, the `a_c` calculus ([AXIOMATIC_CALCULUS §1](AXIOMATIC_CALCULUS.md#1-position)).
Its instance premises hold where a Product adopts the profile; they are
adopted with it and do not follow from the foundations (P1, P6):

- I1: a subject's reality changes outside the model, and a stable binding
  names that subject;
- I2: the adopting Product selects one exact `a_c` basis;
- I3: an effect on the subject is a separately identified operation under
  an owner-issued grant.

Standing of the commitments cited: P0 recovered; P1, P3 and P6
independent; P4b derived from P0 and P2, and P5 derived from P0 and P6
([FOUNDATIONS §3](FOUNDATIONS.md#3-commitments)).

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|
| P3 (independent); F9 imported; I2 | By P3 a value binds one exact basis, and I2 selects one exact `a_c` basis, so an occurrence model is an ordinary `a_c` model on that basis. The profile adds sorts and value domains but no record kind, because a new record kind would be a second calculus beside F9. With closed populations, an unknown, missing or mistyped element is detected and refused, not read | [Imported calculus boundary](#imported-calculus-boundary); [Closed semantic-object sorts](#closed-semantic-object-sorts), [Finite reference-domain table](#finite-reference-domain-table), [Closed event-kind population](#closed-event-kind-population), [Closed relation families](#closed-relation-families); [Exact profile identity](#exact-profile-identity) | closing the sorts, reference domains, event kinds, relation families and qualifier domains, and their members: a policy of this member, chosen so that refusal of an unknown element is decidable | 2, 3, 10 |
| P3 (independent); P4b (derived from P0 and P2); I1 | By P3 an identity binds its exact inputs, so a traversal applied again to any changed input is a different occurrence; by P4b an established fact is not erased. So each application is one immutable occurrence, a reapplication mints a new one, and a correction appends without erasing | [Occurrence identity](#occurrence-identity), [OP-003](#op-003-correction-without-erasure), [OP-006](#op-006-immutable-iteration-history) | the identity inputs of an occurrence: this member | 2, 9 |
| P0 (recovered); P3 (independent); I1 | By I1 the subject's reality changes outside the model, and by P0 an actor holds only finite observations of it, so an observation, event or projection describes the subject and replaces none of it; the external subject stays the carrier of its reality | [OP-005](#op-005-mutable-reality-conservation) | whether snapshot or rollback exists: a separately authorised application of the adopting Product | 2, 6 |
| P6 (independent); I3 | By P6 authority exists only through an admitted grant, and by I3 an effect is a separately identified operation under such a grant, so no operation is lawful without a matching grant, and functor kind, traversal, operation, executor, actor, grant and invocation stay distinct coordinates | [Mutable-subject effect relation](#mutable-subject-effect-relation) | a territory containment relation in place of exact equality: the adopting Product, in its compatible signature | 4, 8, 9 |
| P1 (independent); P6 (independent) | By P1 a representation does not carry its meaning, and by P6 evaluation, admission and decision are separate authorities, so a candidate, its judgment, its admitting event and the materialised relation stay distinct; precedence orders admitted facts and decides no authority | [Candidate, judgment, event and relation separation](#candidate-judgment-event-and-relation-separation), [OP-004](#op-004-precedence-is-not-authority) | the precedence law, evaluators and authorities of an application: the adopting Product | 2, 9 |
| P3 (independent); P6 (independent) | By P3 a relation holds only on its declared basis, and by P6 only an authority admits it, so cause is admitted typed lineage and is never inferred from time, order, adjacency, containment or correlation | [Causality and typed lineage](#causality-and-typed-lineage), [OP-001](#op-001-seed-acyclicity) | which causal claims an application admits: the adopting Product, under its authorities; that each identity or causal subgraph is acyclic: a policy of this member, chosen so that every lineage walk ends at a first cause | 2, 9 |
| P3 (independent); P4b (derived from P0 and P2); P5 (derived from P0 and P6) | By P3 a projection binds its exact inputs, and by P4b admitted events persist, so a projection binds one complete event frontier, and a new event makes a new frontier rather than advancing an old projection; for the same reason the members of one admitted semantic cut name one identical source frontier, its successor is that frontier plus exactly the admitted event, and a cut with missing or inconsistent members refuses; by P5 a projection is not read beyond the frontier it binds | [Event frontier and projection](#event-frontier-and-projection), [OP-002](#op-002-atomic-semantic-admission), [OP-007](#op-007-scope-conservation) | the event scope and frontier laws: the adopting Product | 2, 6, 9 |
| P5 (derived from P0 and P6); F3 and F9 imported | By P5 a value decides only what its evidence establishes, and F3 gives one core, so every judgment decision and stop, and every effect disposition of an occurrence that intends an effect, maps to exactly one core value for a named predicate; an effect whose outcome the evidence cannot decide stays indeterminate, an established non-attainment of its intended outcome is falsified whether or not its end is established, and no refusal maps to success | [Closed constraint, judgment, residual and stop kinds](#closed-constraint-judgment-residual-and-stop-kinds), [Mutable-subject effect relation](#mutable-subject-effect-relation) | the decision, stop and residual vocabularies and their mapping, and the exclusion of `out_of_frame` from the constraint value set: this member; the meanings and core values of `hold`, `gap` and the two `refusal` values, and the cause of each refusal: [AXIOMATIC_CALCULUS AC-007](AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal); a refinement of those four values by cause for one traversal, each refined value keeping its parent's core value: that traversal record, under [AXIOMATIC_CALCULUS §5](AXIOMATIC_CALCULUS.md#5-traversals-and-functor-kinds) | 3, 9, 10 |
| P6 (independent) | By P6 authority exists only through an admitted grant, and inclusion in a method cut is no grant, so availability is not adoption, and the profile grants no authority | [Authority and adoption](#authority-and-adoption) | who adopts: Product authority, under [PRODUCT_DEFINITION §7](PRODUCT_DEFINITION.md#7-collective-reference-frame-basis); the subject interpretation, vocabulary mappings and authorities an adoption declares: the adopting Product | 1, 7, 9 |

The Scope, the Exclusions and the Conformance obligations apply these
consequences, and every clause names the principle that requires it
([FOUNDATIONS §1](FOUNDATIONS.md#1-vocabulary-of-standing)). Purpose and material relation: an actor started on
this member sees which rules follow from the foundations and which are
choices, and who owns each choice, so no choice is presented as derived
(P6, P1).

Consumers of these rows, where an actor enters them (FOUNDATIONS §3
Foundation to law, Consumers), one list per row, each consumer linked to
its own locus:

- Row 1, the imported calculus boundary and the closed populations: [Closed constraint, judgment, residual and stop kinds](#closed-constraint-judgment-residual-and-stop-kinds), where a defect against any of the five closed populations refuses as a falsified structural constraint and a basis mismatch at model validation or structural admission carries `refuse_invalid_basis`; [Exclusions](#exclusions), under which the profile is no change to pure `a_c`; [Conformance obligations](#conformance-obligations), items 1, 2, 9 and 21.
- Row 2, occurrence identity, correction without erasure and immutable iteration history: [Closed relation families](#closed-relation-families), whose `application_of` target equals the exact application seed and whose `corrects_event` does not erase its target; [Closed constraint, judgment, residual and stop kinds](#closed-constraint-judgment-residual-and-stop-kinds), constraint `occurrence_seed_complete` and judgment `occurrence_admission`, where a missing seed retains `hold`; [Conformance obligations](#conformance-obligations), items 3, 14 and 15, and item 18 for correction selection.
- Row 3, mutable reality conservation: [Scope](#scope), whose closing paragraph defines no state store or rollback mechanism; [Conformance obligations](#conformance-obligations), item 13; otherwise no separate consumer applies, because whether snapshot or rollback exists is a separately authorised application of the adopting Product, as the choice column states.
- Row 4, the effect relation and its grant: [Closed relation families](#closed-relation-families), whose `invokes_effect` requires an exact operation grant and whose `authorized_by` checks the grant against operation kind, target and territory; [Closed constraint, judgment, residual and stop kinds](#closed-constraint-judgment-residual-and-stop-kinds), constraints `pre_effect_current` and `operation_grant_contains_effect` and judgment `effect_readiness`, whose `unauthorized` or `stale` value never dispatches an effect; [Conformance obligations](#conformance-obligations), items 10, 11 and 16.
- Row 5, candidate, judgment, event and relation separation, and precedence: [Closed constraint, judgment, residual and stop kinds](#closed-constraint-judgment-residual-and-stop-kinds), judgments `claim_admission`, `event_admission` and `semantic_cut_admission` with constraint `relation_claim_admissible`, and the refusal cause of a cross-basis required edge; [Exclusions](#exclusions), under which the profile is no admission, evaluation or decision authority; [Conformance obligations](#conformance-obligations), items 4, 5 and 6.
- Row 6, causality, typed lineage and seed acyclicity: [Closed relation families](#closed-relation-families), whose `identity_depends_on`, `causally_precedes_occurrence` and `causally_precedes_event` are acyclic and carry only admitted material cause; [Closed constraint, judgment, residual and stop kinds](#closed-constraint-judgment-residual-and-stop-kinds), constraints `identity_dependency_acyclic`, `occurrence_causation_acyclic` and `event_causation_acyclic` and residual `unresolved_cause`; [Exclusions](#exclusions), under which the profile claims no acyclicity for every typed lineage graph; [Conformance obligations](#conformance-obligations), items 3, 7, 8 and 19.
- Row 7, event frontier, projection, atomic semantic admission and scope conservation: [Closed relation families](#closed-relation-families), whose `event_for` is permitted only by the event's declared scope law, whose `frontier_contains` is complete membership under one exact frontier basis and whose `projects_frontier` binds exactly one unchanged frontier; [Closed constraint, judgment, residual and stop kinds](#closed-constraint-judgment-residual-and-stop-kinds), constraints `semantic_cut_complete`, `event_scope_compatible` and `frontier_complete`, judgment `frontier_projection` and residuals `unresolved_scope`, `competing_lineage` and `stale_frontier`; [Exclusions](#exclusions), under which the profile is no event store or projection implementation and no guarantee that every framework event belongs to an occurrence; [Conformance obligations](#conformance-obligations), items 9, 17 and 18.
- Row 8, the closed kinds and the effect dispositions in the core: [Conformance obligations](#conformance-obligations), item 12; otherwise no separate consumer applies. The mapped values are returned by the judgments, stops and dispositions that this row's sections close, and the core they map to is [FOUNDATIONS §4 Results](FOUNDATIONS.md#results), which owns it and applies no rule of this row.
- Row 9, authority and adoption: [Conformance obligations](#conformance-obligations), item 20, and its closing paragraph, under which a representative example or checker becomes no occurrence engine or semantic authority; [Exclusions](#exclusions), under which the profile is no mandatory profile and no mutation, admission, evaluation or decision authority. No section of another member applies a rule of this profile; an adopting Product does, under the declarations this section lists, and its adoption is Product authority's under [PRODUCT_DEFINITION §7](PRODUCT_DEFINITION.md#7-collective-reference-frame-basis), as the choice column states, which names every available profile and applies no rule of this section.

Each consumer applies the rule and decides nothing the owning section does
not (P2, P6).

## Scope

The profile represents (P3, P4b):

- one immutable occurrence for one exact traversal application;
- a stable binding to an external subject whose reality may change;
- bounded pre-effect and post-effect observations;
- intended typed outcomes;
- separately authorised effect operations and their evidence;
- immutable admitted framework-event facts;
- candidate claims, judgments and materialised typed relations;
- explicit event frontiers and projections bound to a frontier; and
- distinct identity dependency, causal subgraphs and wider typed lineage.

It defines no process scheduler, event-log carrier, state store, workspace
format, rollback mechanism, actor topology or prospective reference-frame
profile (P6, P0).

## Imported calculus boundary

For an exact `AxiomaticCalculusBasis` identity `b_ac`, the profile declares
(P3, P4a):

```text
Sigma_occurrence = instantiate_signature(b_ac, OccurrenceSignatureDefinition)
```

`instantiate_signature` and `OccurrenceSignatureDefinition` are this
profile's own notation; the calculus defines neither.
`OccurrenceSignatureDefinition` imports the exact finite `RecordKind_ac`
set unchanged and declares the complete finite sets of closed sorts,
relation kinds, constraint kinds, judgment kinds, residual kinds, stop
kinds, auxiliary value domains, field reference domains and exact
inherited functor-kind refs given below. Instantiation is invalid when the
calculus basis, an inherited field meaning, a record shape, a population, a
value domain, a reference domain, a relation domain, an authority
coordinate or a refusal law conflicts (P3, P5).

An occurrence model stays an ordinary `a_c` model (P3):

```text
M_occ,b = (b, I, O, E, C, L, X, V, T, J)
M_occ,b satisfies a_c[Sigma_occurrence]

Population_M_occ = {
  urn:stdo:concept:axiomatic-calculus:record-kind:semantic-object -> O,
  urn:stdo:concept:axiomatic-calculus:record-kind:typed-relation -> E,
  urn:stdo:concept:axiomatic-calculus:record-kind:constraint -> C,
  urn:stdo:concept:axiomatic-calculus:record-kind:latitude -> L,
  urn:stdo:concept:axiomatic-calculus:record-kind:residual -> X,
  urn:stdo:concept:axiomatic-calculus:record-kind:traversal -> V,
  urn:stdo:concept:axiomatic-calculus:record-kind:transformation -> T,
  urn:stdo:concept:axiomatic-calculus:record-kind:judgment -> J
}
```

Only the profile's semantic objects use `SemanticObject.value`. Relations,
constraints, latitude, residuals, traversals, transformations and
judgments keep their exact inherited `a_c` record families and coordinates
(P3).

`Population_M_occ` is total over `RecordKind_ac` and exactly equal to it.
Every fundamental record occurs in exactly one finite population, local
identities are unique across the disjoint union, and every other member of
`I` resolves once through a reference domain and basis relation that the
profile declares as external. The profile adds sorts and value domains and
never another fundamental record kind. Its
`RefDomain_Sigma_occurrence(record_kind, qualified_field)` closes every
identity-bearing value field and inherited record field either to one
exact local record kind and semantic-object sort or to one declared
external target kind. `qualified_field` includes the source sort or kind
and the complete nested field path, so field labels that are nominally
equal never merge their domains. Missing populations, hidden records, refs
ambiguous between local and external, unknown record kinds and undeclared
field domains refuse model validation (P3, P5).

## Closed semantic-object sorts

`Sigma_occurrence.Sort` contains exactly these core sort identities (P3):

| Sort | Required `value` contract |
|---|---|
| `OccurrenceModelSubject` | `model_identity`, `model_sha256`, `profile_basis_ref` |
| `TraversalApplication` | `traversal_ref`, `functor_kind_ref`, `input_refs`, `application_contract_ref` |
| `Occurrence` | `application_ref`, `traversal_ref`, `functor_kind_ref`, `subject_binding_ref`, `intended_outcome_ref`, `lineage_refs`, `identity_dependency_refs` |
| `SubjectBinding` | `subject_ref`, `authority_ref`, `invalidation_ref`; no mutable content digest |
| `Observation` | `subject_binding_ref`, `observation_kind`, `observer_ref`, `evidence_ref`, `evidence_sha256`, `observation_coordinate_ref` |
| `IntendedOutcome` | `outcome_ref`, `outcome_contract_ref`, `comparison_basis_ref` |
| `OperationKind` | `operation_contract_ref`, `target_sort_ref`, `invalidation_ref` |
| `EffectOperation` | `operation_kind_ref`, `subject_binding_ref`, `effect_territory_ref`, `operation_contract_ref`, `invalidation_ref` |
| `OperationGrant` | `issuer_ref`, `subject_binding_ref`, `allowed_operation_kind_refs`, `allowed_effect_territory_ref`, `invalidation_ref` |
| `EffectInvocation` | `occurrence_ref`, `operation_ref`, `executor_ref`, `actor_ref`, `operation_grant_ref`, `effect_territory_ref`, `input_refs` |
| `EffectDisposition` | `invocation_ref_or_none`, `disposition`, `post_observation_ref_or_none`, `effect_evidence_refs`, `residual_ref_or_none` |
| `EffectEvidence` | `invocation_ref`, `evidence_kind`, `evidence_refs`, `evidence_sha256_refs`, `observation_limit_ref` |
| `RelationClaim` | `relation_kind_ref`, `source_ref`, `target_ref`, `relation_qualifiers`, `claimant_ref`, `claim_basis_ref`, `source_frontier_ref` |
| `FrameworkEvent` | `event_kind_ref`, `payload_ref`, `payload_sha256`, `scope_class`, `occurrence_ref_or_none`, `claim_ref_or_none`, `claim_judgment_ref_or_none`, `source_frontier_ref` |
| `EventFrontier` | `event_set_identity`, `member_event_refs`, `projection_basis_ref`, `precedence_law_ref` |
| `Projection` | `frontier_ref`, `projection_rule_ref`, `selected_relation_refs`, `boundary_refs`, `residual_refs` |
| `SemanticAdmissionCut` | `claim_ref`, `claim_judgment_ref`, `event_ref`, `event_judgment_ref`, `materialized_relation_ref`, `source_frontier_ref`, `successor_frontier_ref` |
| `EffectSubject` | `occurrence_ref`, `subject_binding_ref`, `pre_observation_ref`, `invocation_ref`, `operation_ref`, `operation_grant_ref`, `effect_territory_ref`, `currentness_invalidation_ref` |
| `TransitionSubject` | `occurrence_ref`, `subject_binding_ref`, `pre_observation_ref`, `post_observation_ref_or_none`, `intended_outcome_ref`, `effect_disposition_ref`, `effect_evidence_refs` |

Every row is a `SemanticObject` and so also carries exact `id`, `sort`,
`context`, `owner`, `scope` and `basis`. The value contract is closed: an
unknown field or a missing required field refuses structural admission
(P3, P5).

`FrameworkEvent.value.occurrence_ref_or_none` is optional. An event whose
declared scope is independent of any occurrence is not assigned a
fictional occurrence to satisfy a total relation (P3, P6).

`claim_ref_or_none` and `claim_judgment_ref_or_none` are both absent or
both exact. A claim-admission event requires both, and a current
`source_frontier_ref`; any other event kind refuses those fields unless
its compatible extension declares them explicitly (P3, P5).

The profile uses exact scoped identity refs, SHA-256 content digests and
ordered identity-ref lists without duplicates. `observation_kind` is one
of `pre_effect`, `post_effect` or `external_observation`.
`EffectDisposition.value.disposition` is one of `no_effect`,
`completed_effect`, `partial_effect` or `refused_effect`. `scope_class` is
one of `occurrence_scoped`, `subject_scoped` or `authority_scoped`. Any
other value requires a separately identified compatible signature
extension. Every `_ref` resolves exactly once under AC-003, and every ref
list is ordered by the owning signature's declared order and rejects
duplicates (P3, P5).

`TraversalApplication`, `OperationKind` and `EffectOperation` are identity
records, not executors. An adopting Product declares its finite
`OperationKind` object population through its exact compatible signature
and mapping; the core profile declares the sort and its closed record
shape and no consumer operation-kind instances. A model that contains an
`EffectOperation` without an exact in-model `OperationKind` object or an
explicit compatible import refuses (P3, P6).

### Finite reference-domain table

This table is the complete specialisation of
`RefDomain_Sigma_occurrence(record_kind, qualified_field)`. Source families
use the exact `O/E/C/L/X/V/T/J` populations. `O:S` means semantic-object
sort `S`; `AnyLocal` means the closed union `O union E union C union L
union X union V union T union J`; `Sigma:K` means one exact member of the
named closed signature population; an empty cell means no target in that
class. `Sigma:ReferenceDomain`, `Sigma:ExternalTargetKind` and
`Sigma:BasisRelation` are populations of this profile's signature, named
here and not by the calculus (P3).

The basis codes are exact relations, not labels (P3):

```text
B_model     = same M_occ,b and record basis
B_profile   = exact TraversalOccurrenceProfileBasis resolution
B_calculus  = exact imported AxiomaticCalculusBasis resolution
B_adopted   = exact Product-adoption basis relation named for that external kind
```

| Source family and qualified field | Card. | Local family | Local sort | External target kind | Basis |
|---|---:|---|---|---|---|
| `O:*.context` | 1 |  |  | `Context` | `B_adopted` |
| `O:*.owner` | 1 |  |  | `Owner` | `B_adopted` |
| `O:*.scope` | 1 |  |  | `GovernedScope` | `B_adopted` |
| `O:*.basis` | 1 |  |  | `TraversalOccurrenceProfileBasis` | `B_profile` |
| `O:*.sort` | 1 |  |  | `Sigma:Sort` | `B_profile` |
| `E/C/L/X/V/T/J.context` | 1 |  |  | `Context` | `B_adopted` |
| `E/C/L/X/V/T/J.owner` | 1 |  |  | `Owner` | `B_adopted` |
| `E/C/L/X/V/T/J.scope` | 1 |  |  | `GovernedScope` | `B_adopted` |
| `E/C/L/X/V/T/J.basis` | 1 |  |  | `TraversalOccurrenceProfileBasis` | `B_profile` |
| `O:OccurrenceModelSubject.value.model_identity` | 1 |  |  | `ModelContentIdentity` | `B_adopted` |
| `O:OccurrenceModelSubject.value.profile_basis_ref` | 1 |  |  | `TraversalOccurrenceProfileBasis` | `B_profile` |
| `O:TraversalApplication.value.traversal_ref` | 1 | `V` |  |  | `B_model` |
| `O:TraversalApplication.value.functor_kind_ref` | 1 |  |  | `Sigma:FunctorKind` | `B_calculus` |
| `O:TraversalApplication.value.input_refs` | 0..* | `AnyLocal` |  | `TraversalInput` | `B_model or B_adopted` |
| `O:TraversalApplication.value.application_contract_ref` | 1 |  |  | `ApplicationContract` | `B_adopted` |
| `O:Occurrence.value.application_ref` | 1 | `O` | `TraversalApplication` |  | `B_model` |
| `O:Occurrence.value.traversal_ref` | 1 | `V` |  |  | `B_model` |
| `O:Occurrence.value.functor_kind_ref` | 1 |  |  | `Sigma:FunctorKind` | `B_calculus` |
| `O:Occurrence.value.subject_binding_ref` | 1 | `O` | `SubjectBinding` |  | `B_model` |
| `O:Occurrence.value.intended_outcome_ref` | 1 | `O` | `IntendedOutcome` |  | `B_model` |
| `O:Occurrence.value.lineage_refs` | 0..* | `O` | `Occurrence` |  | `B_model` |
| `O:Occurrence.value.identity_dependency_refs` | 0..* | `AnyLocal` |  |  | `B_model` |
| `O:SubjectBinding.value.subject_ref` | 1 |  |  | `MutableSubject` | `B_adopted` |
| `O:SubjectBinding.value.authority_ref` | 1 |  |  | `Authority` | `B_adopted` |
| `O:SubjectBinding.value.invalidation_ref` | 1 |  |  | `InvalidationContract` | `B_adopted` |
| `O:Observation.value.subject_binding_ref` | 1 | `O` | `SubjectBinding` |  | `B_model` |
| `O:Observation.value.observer_ref` | 1 |  |  | `Actor` | `B_adopted` |
| `O:Observation.value.evidence_ref` | 1 |  |  | `Evidence` | `B_adopted` |
| `O:Observation.value.observation_coordinate_ref` | 1 |  |  | `ObservationCoordinate` | `B_adopted` |
| `O:IntendedOutcome.value.outcome_ref` | 1 |  |  | `Outcome` | `B_adopted` |
| `O:IntendedOutcome.value.outcome_contract_ref` | 1 |  |  | `OutcomeContract` | `B_adopted` |
| `O:IntendedOutcome.value.comparison_basis_ref` | 1 |  |  | `ComparisonBasis` | `B_adopted` |
| `O:OperationKind.value.operation_contract_ref` | 1 |  |  | `OperationContract` | `B_adopted` |
| `O:OperationKind.value.target_sort_ref` | 1 |  |  | `TargetSort` | `B_adopted` |
| `O:OperationKind.value.invalidation_ref` | 1 |  |  | `InvalidationContract` | `B_adopted` |
| `O:EffectOperation.value.operation_kind_ref` | 1 | `O` | `OperationKind` |  | `B_model` |
| `O:EffectOperation.value.subject_binding_ref` | 1 | `O` | `SubjectBinding` |  | `B_model` |
| `O:EffectOperation.value.effect_territory_ref` | 1 |  |  | `EffectTerritory` | `B_adopted` |
| `O:EffectOperation.value.operation_contract_ref` | 1 |  |  | `OperationContract` | `B_adopted` |
| `O:EffectOperation.value.invalidation_ref` | 1 |  |  | `InvalidationContract` | `B_adopted` |
| `O:OperationGrant.value.issuer_ref` | 1 |  |  | `Authority` | `B_adopted` |
| `O:OperationGrant.value.subject_binding_ref` | 1 | `O` | `SubjectBinding` |  | `B_model` |
| `O:OperationGrant.value.allowed_operation_kind_refs` | 1..* | `O` | `OperationKind` |  | `B_model` |
| `O:OperationGrant.value.allowed_effect_territory_ref` | 1 |  |  | `EffectTerritory` | `B_adopted` |
| `O:OperationGrant.value.invalidation_ref` | 1 |  |  | `InvalidationContract` | `B_adopted` |
| `O:EffectInvocation.value.occurrence_ref` | 1 | `O` | `Occurrence` |  | `B_model` |
| `O:EffectInvocation.value.operation_ref` | 1 | `O` | `EffectOperation` |  | `B_model` |
| `O:EffectInvocation.value.executor_ref` | 1 |  |  | `Executor` | `B_adopted` |
| `O:EffectInvocation.value.actor_ref` | 1 |  |  | `Actor` | `B_adopted` |
| `O:EffectInvocation.value.operation_grant_ref` | 1 | `O` | `OperationGrant` |  | `B_model` |
| `O:EffectInvocation.value.effect_territory_ref` | 1 |  |  | `EffectTerritory` | `B_adopted` |
| `O:EffectInvocation.value.input_refs` | 0..* | `AnyLocal` |  | `EffectInput` | `B_model or B_adopted` |
| `O:EffectDisposition.value.invocation_ref_or_none` | 0..1 | `O` | `EffectInvocation` |  | `B_model` |
| `O:EffectDisposition.value.post_observation_ref_or_none` | 0..1 | `O` | `Observation` |  | `B_model` |
| `O:EffectDisposition.value.effect_evidence_refs` | 0..* | `O` | `EffectEvidence` |  | `B_model` |
| `O:EffectDisposition.value.residual_ref_or_none` | 0..1 | `X` |  |  | `B_model` |
| `O:EffectEvidence.value.invocation_ref` | 1 | `O` | `EffectInvocation` |  | `B_model` |
| `O:EffectEvidence.value.evidence_refs` | 1..* |  |  | `Evidence` | `B_adopted` |
| `O:EffectEvidence.value.observation_limit_ref` | 1 |  |  | `ObservationLimit` | `B_adopted` |
| `O:RelationClaim.value.relation_kind_ref` | 1 |  |  | `Sigma:RelationKind` | `B_profile` |
| `O:RelationClaim.value.source_ref` | 1 | `AnyLocal` |  | `DeclaredRelationEndpoint` | `B_model or B_adopted` |
| `O:RelationClaim.value.target_ref` | 1 | `AnyLocal` |  | `DeclaredRelationEndpoint` | `B_model or B_adopted` |
| `O:RelationClaim.value.claimant_ref` | 1 |  |  | `Claimant` | `B_adopted` |
| `O:RelationClaim.value.claim_basis_ref` | 1 |  |  | `ClaimBasis` | `B_adopted` |
| `O:RelationClaim.value.source_frontier_ref` | 1 | `O` | `EventFrontier` |  | `B_model` |
| `O:FrameworkEvent.value.event_kind_ref` | 1 |  |  | `Sigma:EventKind_occurrence` | `B_profile` |
| `O:FrameworkEvent.value.payload_ref` | 1 | `AnyLocal` |  |  | `B_model` |
| `O:FrameworkEvent.value.occurrence_ref_or_none` | 0..1 | `O` | `Occurrence` |  | `B_model` |
| `O:FrameworkEvent.value.claim_ref_or_none` | 0..1 | `O` | `RelationClaim` |  | `B_model` |
| `O:FrameworkEvent.value.claim_judgment_ref_or_none` | 0..1 | `J` |  |  | `B_model` |
| `O:FrameworkEvent.value.source_frontier_ref` | 1 | `O` | `EventFrontier` |  | `B_model` |
| `O:EventFrontier.value.event_set_identity` | 1 |  |  | `EventSetIdentity` | `B_model` |
| `O:EventFrontier.value.member_event_refs` | 0..* | `O` | `FrameworkEvent` |  | `B_model` |
| `O:EventFrontier.value.projection_basis_ref` | 1 |  |  | `ProjectionBasis` | `B_adopted` |
| `O:EventFrontier.value.precedence_law_ref` | 1 |  |  | `PrecedenceLaw` | `B_adopted` |
| `O:Projection.value.frontier_ref` | 1 | `O` | `EventFrontier` |  | `B_model` |
| `O:Projection.value.projection_rule_ref` | 1 |  |  | `ProjectionRule` | `B_adopted` |
| `O:Projection.value.selected_relation_refs` | 0..* | `E` |  |  | `B_model` |
| `O:Projection.value.boundary_refs` | 0..* | `AnyLocal` |  | `ProjectionBoundary` | `B_model or B_adopted` |
| `O:Projection.value.residual_refs` | 0..* | `X` |  |  | `B_model` |
| `O:SemanticAdmissionCut.value.claim_ref` | 1 | `O` | `RelationClaim` |  | `B_model` |
| `O:SemanticAdmissionCut.value.claim_judgment_ref` | 1 | `J` |  |  | `B_model` |
| `O:SemanticAdmissionCut.value.event_ref` | 1 | `O` | `FrameworkEvent` |  | `B_model` |
| `O:SemanticAdmissionCut.value.event_judgment_ref` | 1 | `J` |  |  | `B_model` |
| `O:SemanticAdmissionCut.value.materialized_relation_ref` | 1 | `E` |  |  | `B_model` |
| `O:SemanticAdmissionCut.value.source_frontier_ref` | 1 | `O` | `EventFrontier` |  | `B_model` |
| `O:SemanticAdmissionCut.value.successor_frontier_ref` | 1 | `O` | `EventFrontier` |  | `B_model` |
| `O:EffectSubject.value.occurrence_ref` | 1 | `O` | `Occurrence` |  | `B_model` |
| `O:EffectSubject.value.subject_binding_ref` | 1 | `O` | `SubjectBinding` |  | `B_model` |
| `O:EffectSubject.value.pre_observation_ref` | 1 | `O` | `Observation` |  | `B_model` |
| `O:EffectSubject.value.invocation_ref` | 1 | `O` | `EffectInvocation` |  | `B_model` |
| `O:EffectSubject.value.operation_ref` | 1 | `O` | `EffectOperation` |  | `B_model` |
| `O:EffectSubject.value.operation_grant_ref` | 1 | `O` | `OperationGrant` |  | `B_model` |
| `O:EffectSubject.value.effect_territory_ref` | 1 |  |  | `EffectTerritory` | `B_adopted` |
| `O:EffectSubject.value.currentness_invalidation_ref` | 1 |  |  | `InvalidationContract` | `B_adopted` |
| `O:TransitionSubject.value.occurrence_ref` | 1 | `O` | `Occurrence` |  | `B_model` |
| `O:TransitionSubject.value.subject_binding_ref` | 1 | `O` | `SubjectBinding` |  | `B_model` |
| `O:TransitionSubject.value.pre_observation_ref` | 1 | `O` | `Observation` |  | `B_model` |
| `O:TransitionSubject.value.post_observation_ref_or_none` | 0..1 | `O` | `Observation` |  | `B_model` |
| `O:TransitionSubject.value.intended_outcome_ref` | 1 | `O` | `IntendedOutcome` |  | `B_model` |
| `O:TransitionSubject.value.effect_disposition_ref` | 1 | `O` | `EffectDisposition` |  | `B_model` |
| `O:TransitionSubject.value.effect_evidence_refs` | 0..* | `O` | `EffectEvidence` |  | `B_model` |
| `E:<each RelationKind>.source/target` | 1 | exact family from relation table | exact sort from relation table | declared endpoint where table permits | `B_model or B_adopted` |
| `E:*.kind` | 1 |  |  | `Sigma:RelationKind` | `B_profile` |
| `E:*.qualifiers.authority_ref` | 1 |  |  | `Authority` | `B_adopted` |
| `E:*.qualifiers.evidence_refs` | 0..* |  |  | `Evidence` | `B_adopted` |
| `E:*.qualifiers.provenance_refs` | 0..* |  |  | `Provenance` | `B_adopted` |
| `E:*.qualifiers.invalidation_ref` | 1 |  |  | `InvalidationContract` | `B_adopted` |
| `E:*.qualifiers.inverse_kind_ref_or_none` | 0..1 |  |  | `Sigma:RelationKind` | `B_profile` |
| `C:*.kind` | 1 |  |  | `Sigma:ConstraintKind` | `B_profile` |
| `C:*.applies_to` | 1 | `AnyLocal` |  |  | `B_model` |
| `C:*.predicate` | 1 |  |  | `PredicateContract` | `B_adopted` |
| `C:*.judgment_kind` | 1 |  |  | `Sigma:JudgmentKind` | `B_profile` |
| `C:*.latitude_ref` | 0..1 | `L` |  |  | `B_model` |
| `L:*.applies_to` | 1 | `AnyLocal` |  |  | `B_model` |
| `L:*.invalidation` | 1 |  |  | `InvalidationContract` | `B_adopted` |
| `X:*.subject` | 1 | `AnyLocal` |  | `ResidualSubject` | `B_model or B_adopted` |
| `X:*.kind` | 1 |  |  | `Sigma:ResidualKind` | `B_profile` |
| `X:*.re_entry` | 1 | `V` |  | `ReEntryContract` | `B_model or B_adopted` |
| `X:*.invalidation` | 1 |  |  | `InvalidationContract` | `B_adopted` |
| `V:*.domain/codomain` | 1 |  |  | `TypeDomain` | `B_adopted` |
| `V:*.preconditions/postconditions` | 0..* | `C` |  |  | `B_model` |
| `V:*.authority` | 1 |  |  | `AuthorityGrant` | `B_adopted` |
| `V:*.evidence/provenance` | 0..* |  |  | `EvidenceOrProvenance` | `B_adopted` |
| `V:*.stop_states` | 1..* |  |  | `Sigma:StopKind` | `B_profile` |
| `T:*.traversal` | 1 | `V` |  |  | `B_model` |
| `T:*.domain_model/codomain_model` | 1 |  |  | `ModelContentIdentity` | `B_adopted` |
| `T:*.operation_authority` | 1 |  |  | `AuthorityGrant` | `B_adopted` |
| `T:*.preconditions` | 0..* | `C` |  |  | `B_model` |
| `T:*.preservation_relation` | 1 | `E` |  |  | `B_model` |
| `T:*.preserved/introduced/removed` | 0..* | `AnyLocal` |  | `ModelMemberIdentity` | `B_model or B_adopted` |
| `T:*.residuals` | 0..* | `X` |  |  | `B_model` |
| `T:*.evidence/provenance` | 0..* |  |  | `EvidenceOrProvenance` | `B_adopted` |
| `T:*.stop_states` | 1..* |  |  | `Sigma:StopKind` | `B_profile` |
| `T:*.invalidation` | 1 |  |  | `InvalidationContract` | `B_adopted` |
| `T:*.re_entry` | 1 | `V` |  | `ReEntryContract` | `B_model or B_adopted` |
| `J:*.kind` | 1 |  |  | `Sigma:JudgmentKind` | `B_profile` |
| `J:*.subject` | 1 | `AnyLocal` |  | `JudgmentSubject` | `B_model or B_adopted` |
| `J:*.evaluator` | 1 |  |  | `Evaluator` | `B_adopted` |
| `J:*.authority` | 1 |  |  | `AuthorityGrant` | `B_adopted` |
| `J:*.evidence/provenance` | 0..* |  |  | `EvidenceOrProvenance` | `B_adopted` |
| `J:*.decided_at` | 1 |  |  | `DecisionCoordinate` | `B_adopted` |

The external-resolution coordinates of the inherited transformation are
closed by this finite expansion and are not hidden inside the three
local-delta rows above (P3, P4b):

```text
D_ext = {
  external_preserved,
  external_introduced,
  external_removed
}

W_ext = {
  external_resolution,
  domain_resolution,
  codomain_resolution
}

Q_ext = {
  external_identity,
  reference_domain,
  external_target_kind,
  resolved_target_identity,
  basis_relation,
  resolution_basis,
  evidence_identity
}

for every d in D_ext and q in Q_ext:
  RefDomain_Sigma_occurrence(T, d[].q) = ResolutionRefDomain(q)

for every w in W_ext and q in Q_ext:
  RefDomain_Sigma_occurrence(
    T,
    external_resolution_witnesses[].w.q
  ) = ResolutionRefDomain(q)

RefDomain_Sigma_occurrence(
  T,
  external_resolution_witnesses[].domain_model
) = (1, empty, empty, {ModelContentIdentity}, B_adopted)

RefDomain_Sigma_occurrence(
  T,
  external_resolution_witnesses[].codomain_model
) = (1, empty, empty, {ModelContentIdentity}, B_adopted)

RefDomain_Sigma_occurrence(
  T,
  external_resolution_witnesses[].evidence
) = (1, empty, empty, {Evidence}, B_adopted)
```

`ResolutionRefDomain` is exact, and it is dependent only where the
resolution tuple itself supplies the target coordinate (P3):

```text
ResolutionRefDomain(external_identity)
  = (1, empty, empty,
     {sibling external_target_kind},
     sibling basis_relation over sibling resolution_basis)

ResolutionRefDomain(reference_domain)
  = (1, empty, empty, {Sigma:ReferenceDomain}, B_profile)

ResolutionRefDomain(external_target_kind)
  = (1, empty, empty, {Sigma:ExternalTargetKind}, B_profile or B_adopted)

ResolutionRefDomain(resolved_target_identity)
  = (1, empty, empty,
     {sibling external_target_kind},
     sibling basis_relation over sibling resolution_basis)

ResolutionRefDomain(basis_relation)
  = (1, empty, empty, {Sigma:BasisRelation}, B_profile)

ResolutionRefDomain(resolution_basis)
  = (1, empty, empty,
     {TraversalOccurrenceProfileBasis,
      AxiomaticCalculusBasis,
      ProductAdoptionBasis},
     B_profile or B_calculus or B_adopted)

ResolutionRefDomain(evidence_identity)
  = (1, empty, empty, {Evidence}, B_adopted)
```

Each member of `D_ext` is a finite `Resolution_M` value list without
duplicates. `external_resolution_witnesses` is a finite inherited
`ExternalResolutionPreservationWitness` value list without duplicates.
Every coordinate has exactly `Q_ext`; every witness has exactly
`external_resolution`, `domain_model`, `codomain_model`,
`domain_resolution`, `codomain_resolution`, `decision` and `evidence`;
and `decision` is exactly `equal`. A missing or extra nested field, an
unresolved nested identity, a coordinate and basis mismatch, a duplicate
coordinate, or a witness outside the exact preserved population refuses
model validation (P3, P5).

`id` fields own identities rather than reference them. Digests, closed
enum values, predicates, qualifiers other than the listed refs,
uncertainty, consequence, variation content and refusal values are closed
non-reference content. A compatible extension changes this table by
minting a new signature; it cannot reinterpret an existing row. Every list
is free of duplicates before any set comparison. A missing row, a target
outside its row, a wrong local population or sort, an unresolved external
target, a cardinality violation or a basis-relation mismatch refuses model
validation (P3, P5).

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
[AXIOMATIC_CALCULUS AC-007](AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal)
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
[FOUNDATIONS §4 Results](FOUNDATIONS.md#results) states every outcome in
the core or in a refinement that maps each refined value to exactly one
core value, and
[AXIOMATIC_CALCULUS §5](AXIOMATIC_CALCULUS.md#5-traversals-and-functor-kinds)
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
| effect dispositions | the intended effect occurred ([ACTIVATION §3 Effects](ACTIVATION.md#effects)) | [Mutable-subject effect relation](#mutable-subject-effect-relation) |

A judgment decision is the evaluation's result and a stop is the step's.
Where values emitted together map to different core values, as `stale`
with `hold` does, each answers its own predicate. The stop's predicate is
not the predicate of
[construction availability](ACTIVATION.md#construction-availability), "a
candidate is available", and no value counts toward another predicate
([FOUNDATIONS §4 Conjunction of results](FOUNDATIONS.md#conjunction-of-results)).
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
[AXIOMATIC_CALCULUS AC-007](AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal)
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
  ([Finite reference-domain table](#finite-reference-domain-table)), a
  qualifier basis mismatch refused at structural admission
  ([Closed relation families](#closed-relation-families)) and a
  cross-basis required edge that refuses a semantic admission cut
  ([Candidate, judgment, event and relation separation](#candidate-judgment-event-and-relation-separation)).
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
  [ACTIVATION §3 Effects](ACTIVATION.md#effects) states.
- `partial_effect(undecided)`: every other `partial_effect`, that is,
  one whose admitted evidence does not establish non-attainment. The
  admitted evidence cannot decide whether the intended outcome is or will be met:
  the bounded post-observation that the
  [effect law](#mutable-subject-effect-relation) requires is not yet
  acquired, or it shows part reached while a later completion of the
  effect could still meet the outcome, or it shows the outcome met while
  the effect may still be acting, so whether the outcome is met once the
  effect settles is undecided, or a response was lost and no
  counterexample is observed. A lost response, an absent record or an
  actor's context holding no trace of the effect is no evidence about the
  subject, so it establishes neither non-attainment nor the end of the
  effect ([ACTIVATION §3 Effects](ACTIVATION.md#effects)).
- `partial(not_attained)` and `partial(undecided)`: decision `partial` of
  `transition_evaluation`, by the cause of the stop `partial_effect` it
  yields.

| Value | Core value | Ground |
|---|---|---|
| stop `hold` | indeterminate | the step stops with the deciding evidence not yet admitted (missing seed, unresolved cause or scope, stale frontier or currentness, unobserved state), so the admissible evidence cannot decide whether the application can reach its declared result ([FOUNDATIONS §4 Results](FOUNDATIONS.md#results); RF-012); its residual names the evidence that would decide |
| stop `gap` | invalid_basis | a reference or lineage member the judgment requires is unresolved, its resolution still open as AC-007 defines for `gap`, so the closure it rests on is undefined on this basis (AC-003, AC-010) and the basis cannot support the judgment until repaired |
| stop `refusal(constraint)` | falsified | the falsified constraint's defect is the counterexample, as construction availability maps `refused` to falsified (P5, P6) |
| stop `refusal(basis)` | invalid_basis | the basis cannot support the judgment; the constraint rule above maps `invalid_basis` only to that core value |
| stop `invalid_basis` | invalid_basis | the same core value; the constraint rule above maps `invalid_basis` only to it |
| stop `out_of_scope` | falsified | it is emitted only with `refusal`, when `event_scope_compatible` is falsified by a declared scope that conflicts with the admitting authority; an event scope not yet declared is `hold` plus `unresolved_scope` while the signature declares the scope relation, so the ground of out_of_frame, a missing declaration in the frame, is absent, and the spelling is not the core's out_of_frame; a refusal of admission once that re-entry closes without the declaration is stop `refusal(constraint)`, its cause taken from AC-007's condition as for every refusal, not this stop (P5, P6) |
| stop `partial_effect(not_attained)` | falsified | the unreached part of the intended outcome, which no later completion of the effect can reach, defeats the declared result; an end of the effect that the evidence does not establish takes no part in the value and is recorded in the `partial_effect` residual, which stays with the value with explicit re-entry before any further effect (P5, P6) |
| stop `partial_effect(undecided)` | indeterminate | an effect that has begun and whose evidence cannot decide whether the intended outcome is or will be met supplies no counterexample ([Mutable-subject effect relation](#mutable-subject-effect-relation)), so the admissible evidence cannot decide; the `partial_effect` residual names the post-observation and explicit disposition that would decide (P5, P6) |
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
[AXIOMATIC_CALCULUS AC-007](AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal)
gives them, as the table above states. A traversal record's `stop_states`
may refine those four values by cause for that traversal, by a binding
declared in the shape of [PROFILES §1](PROFILES.md#1-the-boundary): its
direction, preserved meaning, narrowed scope and invalidation. A refined
value adds no kind and takes its core value under the parent-value rule
of [AXIOMATIC_CALCULUS §5](AXIOMATIC_CALCULUS.md#5-traversals-and-functor-kinds),
which this profile applies and does not restate. The other stops and
every judgment decision keep the mapping above unrefined, and a record
that declares no binding takes it unrefined (P5, P3, P1).

A structural refusal is one whose source is this profile's closed
structure rather than a row of the constraint table: an unknown or missing
required field under the closed value contract
([Closed semantic-object sorts](#closed-semantic-object-sorts)); a
missing population, hidden record, ambiguous ref, unknown record kind or
undeclared field domain
([Imported calculus boundary](#imported-calculus-boundary)); a missing
row, target outside its row, wrong population or sort, unresolved
external target, cardinality violation or nested coordinate or witness
defect refused at model validation
([Finite reference-domain table](#finite-reference-domain-table)); an
unknown event kind, wrong payload sort, mismatched payload digest or
forbidden claim or occurrence field refused at event admission
([Closed event-kind population](#closed-event-kind-population)); and a
qualifier-record defect refused at structural admission, a ref outside
the closed `ProfileRecordRef` union, resolved under a wrong population or
sort or absent from its declared external domain, and a duplicate,
missing, extra, reversed or mismatched edge refused at occurrence
admission ([Closed relation families](#closed-relation-families)). Each
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
[AC-003](AXIOMATIC_CALCULUS.md#ac-003-reference-closure) (P5). Where a
relation qualifier records the cause of a refusal, the qualifier, not
the core value, records whether the defect is a missing, duplicate,
wrong-typed or out-of-scope input or an invalid basis; the stop keeps it
in its own vocabulary, so the mapping drops none of the distinctions the
qualifier draws (P5, P4b).

Neither core value to which the `partial` and `partial_effect` values map
records that the subject changed or whether the effect has ended. The
`partial_effect` residual and its re-entry carry both facts and survive
every join
([FOUNDATIONS §4 Conjunction of results](FOUNDATIONS.md#conjunction-of-results)).
Falsified never licenses treating the effect as absent; indeterminate
never licenses treating it as absent or as complete; neither licenses
treating it as ended where the evidence does not establish its end. Under
either value the explicit re-entry precedes any further effect, and an
effect whose end is not established is reconciled under
[ACTIVATION §5](ACTIVATION.md#5-work-state-and-restart) before any
repetition (P5, P4b).

`Sigma_occurrence.FunctorKind` contains exact refs to `F_D`, `F_P` and
`F_H` from `b_ac` and no other functor kind. The profile changes none of
their laws, which are AXIOMATIC_CALCULUS §5 (P3, P6).

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
and recovery follow [ACTIVATION §3 Effects](ACTIVATION.md#effects) and
[ACTIVATION §5 Recovery](ACTIVATION.md#5-work-state-and-restart). `not_effected` means that
the intended outcome was not attained, not that no effects occurred
(P5, P6).

`invokes_effect` exists if and only if a concrete invocation was
dispatched; `unauthorized` or `stale` readiness never dispatches it. The
immutable `EffectInvocation` contains no future disposition, and
`EffectDisposition` records the later outcome without rewriting the
invocation (P3, P6).

Mapping of the dispositions to the core. Purpose:
[FOUNDATIONS §4 Results](FOUNDATIONS.md#results) places the results of
effects in the core. Material relation: whether an occurrence's effect
may be repeated or relied on, which is the material relation of
[ACTIVATION §3 Effects](ACTIVATION.md#effects) (P5, P6). An occurrence
intends an effect when an `EffectInvocation` names it. For such an
occurrence the disposition refines ACTIVATION §3 Effects and maps for its
predicate, "the intended effect occurred"; the causes of the two
`partial_effect` values are those stated under
[Closed constraint, judgment, residual and stop kinds](#closed-constraint-judgment-residual-and-stop-kinds):

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

## Authority and adoption

This profile owns only the application-neutral record, relation, identity,
causal, effect-boundary, frontier and refusal laws above. It grants no
semantic, operation, evaluation, admission, decision, correction,
continuation or closure authority. Every material operation and judgment
resolves an existing owner-issued grant. Copying a profile record or
adopting the profile transfers no authority (P6).

Only Product authority adopts the profile, as
[PRODUCT_DEFINITION §7](PRODUCT_DEFINITION.md#7-collective-reference-frame-basis)
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

## Exact profile identity

The stable concept identity does not identify one immutable profile
edition. Once publication bytes exist, the signature preimage is issued as
below (P3, P6).

### Closed profile signature

```text
TraversalOccurrenceSignature = {
  kind: "stdo.traversal-occurrence-signature",
  schema_version: 1,
  calculus_basis_identity: exact AxiomaticCalculusBasis identity,
  calculus_signature_schema_clause_ref:
    absolute semantic address of the Core Signature clause inside that basis,
  occurrence_signature_clause_refs:
    sorted non-empty absolute semantic-address URI[],
  profile_member_sha256: "sha256:" + 64 lowercase hexadecimal characters
}
```

The record uses RFC 8785 JSON Canonicalization Scheme bytes, and its
identity is (P3):

```text
sha256(JCS(TraversalOccurrenceSignature))
```

`calculus_signature_schema_clause_ref` resolves the exact inherited
signature schema and record law. `occurrence_signature_clause_refs`
resolves exactly these fragments against the publication member URI, each
a heading of this member (P3):

```text
#authority-and-adoption
#candidate-judgment-event-and-relation-separation
#causality-and-typed-lineage
#closed-constraint-judgment-residual-and-stop-kinds
#closed-event-kind-population
#closed-relation-families
#closed-semantic-object-sorts
#event-frontier-and-projection
#mutable-subject-effect-relation
#occurrence-identity
```

Together they define this profile's closed sorts, fields, value domains,
relations, constraints, judgments, residuals, stops and exact functor-kind
refs. The list is free of duplicates and sorted by ascending unsigned
UTF-16 code units. `profile_member_sha256` equals the publication member
digest. `occurrence_signature_sha256` thus has one reconstructable
preimage and no implementation-defined serialisation (P3).

Every clause ref is an absolute URI whose base is the exact publication
`member_uri`; only its fragment differs. The calculus clause ref is an
absolute URI inside the exact calculus publication basis. Relative paths,
mutable source URIs, missing fragments, duplicate refs or a ref outside
those two exact publication members refuse the signature (P3, P5).

The exact profile basis is then issued as (P3):

```text
TraversalOccurrenceProfileBasis = {
  kind: "stdo.traversal-occurrence-profile-basis",
  schema_version: 1,
  concept_identity: "urn:stdo:concept:traversal-occurrence-profile",
  calculus_basis_identity: exact AxiomaticCalculusBasis identity,
  occurrence_signature: TraversalOccurrenceSignature,
  occurrence_signature_sha256: "sha256:" + 64 lowercase hexadecimal characters,
  publication_basis: {
    release_uri: absolute immutable release URI,
    manifest_sha256: "sha256:" + 64 lowercase hexadecimal characters,
    member_uri: absolute URI for this member in that release,
    member_sha256: "sha256:" + 64 lowercase hexadecimal characters
  }
}
```

`occurrence_signature_sha256` equals the digest of the embedded canonical
signature. The basis record also uses RFC 8785 JSON Canonicalization
Scheme bytes, with duplicate object names rejected before
canonicalisation. Its identity is (P3):

```text
urn:stdo:traversal-occurrence-profile-basis:sha256:
  + sha256(JCS(TraversalOccurrenceProfileBasis))
```

The imported calculus basis resolves as the exact RFC 8785 bytes of an
`AxiomaticCalculusBasis` record and satisfies
[AXIOMATIC_CALCULUS §8](AXIOMATIC_CALCULUS.md#8-calculus-identity). Its
calculated identity equals both `calculus_basis_identity` fields. Its
publication manifest digest resolves the exact manifest bytes; that
manifest contains the calculus member path and digest once; the resolved
calculus member bytes have that digest; and
`calculus_signature_schema_clause_ref` is that exact member URI plus
`#2-signature` (P3, P5).

The calculus derivation and publication bases bind the same exact
immutable package. Their roles remain distinct: the derivation basis
names the normative premises and owners, and the publication basis names
the calculus member that states their application. The principle-ref
population is exactly the sorted, duplicate-free expansion of the local
derivation addresses that the resolved calculus member declares under
[AXIOMATIC_CALCULUS §8](AXIOMATIC_CALCULUS.md#8-calculus-identity): neither
a selected subset nor an independently invented list. Every
referenced member resolves to exact bytes whose digest occurs once in
the package manifest, and each fragment resolves one heading under the
publication's semantic-address rule. An unresolved basis record, a
mismatched manifest or member, a missing or extra principle ref, an
invented or absent fragment, or unbound member bytes refuse admission
(P3, P6, P5).

The profile publication member resolves by the same manifest and member
rule. A mutable source path, a strategy post, an implementation or a
consumer mapping cannot stand in for either imported basis or for the
publication identity (P3, P6).

`publication_basis.release_uri` is one absolute immutable
`stdo://releases/v<version>-rc.<positive-ordinal>/` URI under
[RELEASE §2](RELEASE.md#2-release-identities). Acceptance under
[RELEASE §8](RELEASE.md#acceptance-criteria) is a verdict over that exact
cut and creates no second release identity. Its spelling establishes
identity, not acceptance or release standing.
`publication_basis.member_uri` is exactly that URI plus
`standards/TRAVERSAL_OCCURRENCE.md`. The installed release manifest named
by `manifest_sha256` contains exactly one standards member with that path
and `member_sha256`, and the same digest appears in the embedded
signature. Kind and schema-version values are exact. Every digest uses
lowercase `sha256:<64-hex>`. The signature and basis preimages are their
exact RFC 8785 JCS values; a newline, another object order, a duplicate
name, a value outside I-JSON or an implementation-specific serialisation
cannot acquire the declared identity (P3).

Any change to the calculus basis, the signature refs, the closed signature
or the profile member bytes mints a new profile basis. Supersession is an
external Product and release judgment, and an earlier basis never silently
advances (P3, P6).

The instantiated signature and basis records are issued after their
member bytes are frozen. They are excluded from the member set whose
manifest digest they name; their schemas above do not embed an instance
or its digest in those members. This keeps the identity preimages
reconstructable without a digest depending on itself (P3).

## Exclusions

This profile is not (P2, P6):

- a change to pure `a_c` or to pure reference-frame law;
- a mandatory profile for every symbolic model;
- a concrete subject or workspace ontology;
- a process, traversal, retry, continuation or closure engine;
- an event store, event-log schema, projection implementation or state
  carrier;
- a mutation, admission, evaluation or decision authority;
- a prospective-frame or sensor-population profile;
- a guarantee that every framework event belongs to an occurrence; or
- a claim that every typed lineage graph is acyclic.

## Conformance obligations

Review and qualification cover at least (P6, P5):

1. instantiation under one exact `a_c` basis, the exact eight-member
   `RecordKind_ac` population function, and closed reference domains
   without shadowing an inherited field;
2. exact inherited record families, direct coordinates, and disjoint
   local and external identity populations;
3. complete occurrence seeds, exact congruence with every mirroring
   relation, and refusal of future results and future events;
4. first-event admission without a fictional predecessor;
5. distinct candidate, judgment, event, materialised relation, cut and
   cut-judgment identities with the unchanged subject's digest bound;
6. idempotent or refused duplicate admission;
7. cycles in each identity or causal subgraph;
8. lawful opposing support and correction edges in wider typed lineage;
9. the exact closed event-kind population, payload, digest, scope and
   binding law, including scope-independent events with no fabricated
   `event_for` relation;
10. separation of functor kind, traversal, operation kind, operation
    instance, executor, actor, grant, invocation, target and territory;
11. missing, stale, mismatched and out-of-territory operation grants;
12. no-effect, complete-effect, partial-effect and refused-effect cases;
13. preservation of the external mutable subject as the reality carrier;
14. fresh occurrence identity on traversal reapplication;
15. component and aggregate occurrence identities for retained composite
    applications;
16. refusal on a stale pre-effect observation and on grant currentness;
17. refusal of an incomplete semantic-admission batch, including a
    missing or non-admitted cut judgment and unequal claim, event and cut
    source frontiers;
18. frontier completeness, staleness and correction selection;
19. non-causation by timestamp, ordinal, adjacency, containment and
    correlation;
20. absent Product adoption and refusal of an incomplete mapping; and
21. profile-basis reconstruction from exact JCS, kinds, schemas,
    immutable URIs, digests, the calculus address and unique publication
    membership.

Representative examples or checkers establish only the claims they
actually evaluate. They do not become an occurrence engine or a semantic
authority (P6).
