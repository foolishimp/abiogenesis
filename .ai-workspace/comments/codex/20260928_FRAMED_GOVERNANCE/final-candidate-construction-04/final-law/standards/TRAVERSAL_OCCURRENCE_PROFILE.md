# The `a_c` Traversal Occurrence Profile over Mutable Subjects

## Position

The **Traversal Occurrence Profile** defines an application-neutral
model-family signature for immutable application histories over an externally
mutable subject.

Its stable concept identity is:

```text
urn:stdo:concept:traversal-occurrence-profile
```

This standard owns that concept in bounded context:

```text
urn:stdo:bounded-context:traversal-occurrence-profile
```

Adoption of the profile is optional. The profile imports one exact `a_c` basis
and instantiates one closed model-family signature under its record and model
laws. It does not amend `a_c`, become part of every `a_c` model, or define a
universal execution theory.

Availability is not adoption. A Product that adopts the profile owns its
subject interpretation, concrete vocabulary, authorities, requirements,
design, implementation, and evidence. This standard imports none of those
consumer identities.

## Scope

The profile represents:

- one immutable occurrence for one exact traversal application;
- a stable binding to an external subject whose reality may change;
- bounded pre-effect and post-effect observations;
- intended typed outcomes;
- separately authorized effect operations and their evidence;
- immutable admitted framework-event facts;
- candidate claims, judgments, and materialized typed relations;
- explicit event frontiers and frontier-bound projections; and
- distinct identity dependency, causal subgraphs, and wider typed lineage.

It does not define a process scheduler, event-log carrier, state store,
workspace format, rollback mechanism, actor topology, or prospective Reference
Frame profile.

## Imported Calculus Boundary

For exact `AxiomaticCalculusBasis` identity `b_ac`, this profile declares:

```text
Sigma_occurrence = instantiate_signature(b_ac, OccurrenceSignatureDefinition)
```

`OccurrenceSignatureDefinition` imports the exact finite `RecordKind_ac` set
unchanged and declares the complete finite sets of closed sorts, relation
kinds, constraint kinds, judgment kinds, residual kinds, stop kinds, auxiliary
value domains, field reference domains, and exact inherited functor-kind refs
below. A conflicting calculus basis, inherited field meaning, record shape,
population, value domain, reference domain, relation domain, authority
coordinate, or refusal law makes instantiation invalid.

An occurrence model remains an ordinary `a_c` model:

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

Only profile semantic objects use `SemanticObject.value`. Relations,
constraints, latitude, residuals, traversals, transformations, and judgments
retain their exact inherited `a_c` record families and coordinates.

`Population_M_occ` is total over and exactly equal to `RecordKind_ac`. Every
fundamental record occurs in exactly one finite population, local identities
are unique across the disjoint union, and every other member of `I` resolves
once through a profile-declared external reference domain and basis relation.
The profile adds sorts and value domains, never another fundamental record
kind. Its `RefDomain_Sigma_occurrence(record_kind, qualified_field)` closes
every identity-bearing value field and inherited record field to an exact
local record kind and semantic-object sort or one declared external target
kind. `qualified_field` includes the source sort or kind and complete nested
field path; nominally equal field labels never merge their domains.
Missing populations, hidden records, locally-and-externally ambiguous refs,
unknown record kinds, and undeclared field domains refuse model validation.

## Closed Semantic-Object Sorts

`Sigma_occurrence.Sort` contains exactly these core sort identities:

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

Every row is a `SemanticObject` and therefore also carries exact `id`, `sort`,
`context`, `owner`, `scope`, and `basis`. The value contract is closed. An
unknown field or missing required field refuses structural admission.

`FrameworkEvent.value.occurrence_ref_or_none` is optional. An event whose
declared scope is independent of an occurrence is not assigned a fictional
occurrence to satisfy a total relation.

`claim_ref_or_none` and `claim_judgment_ref_or_none` are either both absent or
both exact. A claim-admission event requires both and a current
`source_frontier_ref`; another event kind refuses those fields unless its
compatible extension explicitly declares them.

The profile uses exact scoped identity refs, SHA-256 content digests, and
duplicate-free ordered identity-ref lists. `observation_kind` is one of
`pre_effect`, `post_effect`, or
`external_observation`. `EffectDisposition.value.disposition` is one of
`no_effect`, `completed_effect`, `partial_effect`, or `refused_effect`.
`scope_class` is one of `occurrence_scoped`, `subject_scoped`, or
`authority_scoped`. Another value requires a separately identified compatible
signature extension.
Every `_ref` resolves exactly once under AC-003. Every ref list is ordered by
the owning signature's declared order and rejects duplicates.

`TraversalApplication`, `OperationKind`, and `EffectOperation` are identity
records, not executors. An adopting Product declares its finite
`OperationKind` object population through its exact compatible signature and
mapping. The core profile declares the sort and closed record shape but no
consumer operation-kind instances. A model containing an `EffectOperation`
without an exact in-model `OperationKind` object or explicit compatible import
refuses.

### Finite Reference-Domain Table

This table is the complete specialization of
`RefDomain_Sigma_occurrence(record_kind, qualified_field)`. Source families use
the exact `O/E/C/L/X/V/T/J` populations. `O:S` means semantic-object sort `S`;
`AnyLocal` means the closed union `O union E union C union L union X union V
union T union J`; and `Sigma:K` means one exact member of the named closed
signature population. Empty cells mean no target in that class.

The basis codes are exact relations, not labels:

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

The inherited transformation's external-resolution coordinates are closed by
the following finite expansion rather than hidden inside the three local-delta
rows above:

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

`ResolutionRefDomain` is exact and dependent only where the resolution tuple
itself supplies the target coordinate:

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

Each member of `D_ext` is a duplicate-free finite `Resolution_M` value list.
`external_resolution_witnesses` is a duplicate-free finite inherited
`ExternalResolutionPreservationWitness` value list. Every coordinate has
exactly `Q_ext`; every witness has exactly `external_resolution`,
`domain_model`, `codomain_model`, `domain_resolution`,
`codomain_resolution`, `decision`, and `evidence`; and `decision` is exactly
`equal`. A missing or extra nested field, unresolved nested identity,
coordinate/basis mismatch, duplicate coordinate, or witness outside the exact
preserved population refuses model validation.

`id` fields own identities rather than reference them. Digests, closed enum
values, predicates, qualifiers other than the listed refs, uncertainty,
consequence, variation content, and refusal values are closed non-reference
content. A compatible extension changes this table by minting a new signature;
it cannot reinterpret an existing row. Every list is duplicate-free before
set comparison. A missing row, target outside its row, wrong local population
or sort, unresolved external target, cardinality violation, or basis-relation
mismatch refuses model validation.

## Closed Event-Kind Population

`FrameworkEvent.value.event_kind_ref` resolves exactly one member of this
closed population:

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

The short labels in the table denote the exact identities above. Payload ref
and digest bind the unchanged payload. An unknown event kind, wrong payload
sort, mismatched payload digest, incompatible scope, or forbidden claim or
occurrence field refuses `event_admission`. A compatible extension declares a
new EventKind population and relation to this signature; it cannot add an
undeclared value to this population.

## Closed Relation Families

`Sigma_occurrence.RelationKind` contains these typed relation families:

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

`ProfileRecordRef` is the closed union of the profile semantic-object records
in `O` and the exact inherited `E`, `C`, `L`, `X`, `V`, `T`, and `J`
populations in the same model. It introduces no ninth record kind. A ref
outside that union, resolved under a wrong population or sort, or absent from
the applicable declared external domain refuses.

Each relation is an exact `TypedRelation`. Its qualifiers close direction,
cardinality, basis, preservation, refusal, and invalidation semantics. The
table is not permission to omit inherited relation fields.

Every profile relation uses exactly this qualifier record:

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

The qualifier value domains are closed:

```text
cardinality = exactly_one | zero_or_one | zero_or_more | one_or_more
preservation = identity_preserved | meaning_preserved | not_applicable
loss = none | declared_loss
refusal = refuse_missing | refuse_duplicate | refuse_wrong_type
        | refuse_invalid_basis | refuse_out_of_scope | not_applicable
```

The relation kind fixes the qualifier contract. For every core relation `k`:

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

`not_applicable` is unavailable to a core profile relation because every core
relation has an exact preservation and refusal law. The remaining authority,
evidence, provenance, and invalidation refs are exact instance coordinates.

`Cardinality_occurrence` is the following total function over the closed core
relation-kind population:

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

Every relation and `RelationClaim.value.relation_qualifiers` has exactly those
nine fields and satisfies the contract selected by its exact relation kind.
The five identity-bearing qualifier fields resolve through the finite reference
table; the four enum fields use only the values above. A missing or extra
field, duplicate ref, unknown enum, kind/cardinality mismatch, incompatible
preservation, declared loss, non-null inverse, unavailable refusal,
unresolved authority, evidence, provenance, invalidation, or inverse-kind ref,
or qualifier basis mismatch refuses structural admission. Materialization
copies the accepted qualifier record byte-for-byte.

For every occurrence `o`, the value preimage and typed relations are exactly
congruent:

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

The equalities are set equality only after list and relation-population
uniqueness is proved. Relation identities and exact `(kind, source, target)`
triples are each duplicate-free; no conversion to a set may erase a duplicate.
Each singleton relation exists exactly once. A duplicate, missing, extra,
reversed, or mismatched edge refuses
`occurrence_admission`; a relation label cannot repair a different identity
preimage. `lineage_refs` contains only admitted occurrence-cause predecessors
and component occurrences of an aggregate. Support, correction, timestamp,
ordinal, adjacency, and correlation edges never enter occurrence lineage.

One occurrence has exactly one `application_of`, `bound_to_subject`, and
`intends` relation. Every traversal application has exactly one
`applies_traversal`; every effect operation has exactly one `operation_of_kind`
and one `targets_subject`; every effect invocation has exactly one
`authorized_by`. One occurrence has zero or one `invokes_effect`; and zero or one pre- and
post-observation relation of each declared observation kind. Every effect
invocation has zero or more `evidenced_by` relations. Every disposition except
`no_effect` has exactly one `disposition_for`; `no_effect` has none. Every
framework event has
zero or one `event_for`. Every projection has exactly one
`projects_frontier`. Every claim-admission event has exactly one `admits_claim`
and exactly one `materializes_relation`. Identity, causal, support, correction,
component, frontier-membership, and evidence relations are finite and
duplicate-free. `inverse_kind_ref_or_none` is explicit; silence does not imply
an inverse.

## Closed Constraint, Judgment, Residual, And Stop Kinds

The core constraint kinds are:

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

The core judgment kinds are:

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

The core residual kinds are:

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

The core stop kinds are:

```text
hold
gap
refusal
invalid_basis
out_of_scope
partial_effect
```

Every constraint predicate returns exactly one of `satisfied`, `falsified`,
`indeterminate`, or `invalid_basis`. `satisfied` maps to the judgment's positive
decision, which is the first decision listed below; `invalid_basis` maps only
to `invalid_basis`. The constraint table fixes every other mapping. An
implementation cannot turn an omitted result, residual, or stop into success.

The closed judgment domains are:

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

Each is an inherited `Judgment` and therefore carries unchanged subject id and
digest, evaluator, authority, evidence, provenance, and decision coordinate.
The judgment kind defines the applicable stops and residuals; none is inferred
from prose.

The closed constraint domains are:

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
`latitude_ref`. Silence is not latitude. The residual kind fixes re-entry:

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

`Sigma_occurrence.FunctorKind` contains exact refs to `F_D`, `F_P`, and `F_H`
from `b_ac` and no other functor kind. The profile changes none of their laws.

## Occurrence Identity

One occurrence identity binds only facts available before that occurrence is
admitted:

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
timestamps, admission ordinals, and projection results do not enter the seed.
They may point to the occurrence after their own identities exist.

`application identity` is the exact pre-existing `TraversalApplication`
identity. Its traversal and functor-kind fields equal the occurrence fields.
`declared lineage inputs` and `declared identity-dependency inputs` are the
exact source and target populations stated by the relation-congruence law.
The relation records are minted only after the occurrence identity exists and
therefore do not enter the seed; their endpoints must reproduce it exactly.

Two applications of one traversal over one subject are two occurrences. A
retry or continuation creates a fresh occurrence only when it reapplies the
traversal. A controller step, observation, wait, or correlation record does not
become an occurrence merely because it happens later.

For composition, every retained bracketed traversal application under AC-016
has its own occurrence. If a declared composite traversal is itself applied,
it also has one aggregate occurrence. Each component application relates to
that aggregate through `component_of_occurrence`; that relation is not material
cause by implication. Intermediate results, judgments, evidence, authority,
provenance, and stops required by AC-016 remain explicit.

### OP-001 Seed Acyclicity

The directed graph formed by `identity_depends_on` is finite and acyclic.
Every dependency target exists before the dependent identity is minted. A
future result or event cannot be smuggled into its own occurrence seed.

## Candidate, Judgment, Event, And Relation Separation

The admission relation is:

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

Only `j_c.decision = admitted`, `j_e.decision = admitted`, and
`j_a.decision = admitted` admit the complete semantic cut. `c`, `j_c`, `e`,
`j_e`, `r`, `a`, and `j_a` have distinct identities and authority.
Construction of `c` does not admit it. Judgment does not rewrite its subject.
An event does not inherit the candidate's authority. Materialization cannot
change the relation kind, endpoints, qualifiers, or basis accepted by `j_c`.

The three judgments are exact inherited `Judgment` records:

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
evaluator, authority, decision, evidence, provenance, and decision-time
fields. A missing cut judgment, non-`admitted` decision, wrong subject or
digest, or cross-basis judgment refuses the semantic cut.

An admission event identity binds its event kind, payload digest, scope,
optional occurrence, exact claim, claim judgment, source frontier, owner,
scope, and basis. The materialized relation identity binds the unchanged claim,
claim judgment, event, event judgment, and profile basis.
`frontier_contains(F, e)` holds exactly when `e` appears once in
`F.value.member_event_refs`; neither representation may contain an extra or
missing event.

For claim admission, `e.value.event_kind_ref` is exactly
`urn:stdo:traversal-occurrence:event-kind:claim-admission`. The following refs
are identical, not merely equivalent or adjacent:

```text
c.value.source_frontier_ref
  = e.value.source_frontier_ref
  = a.value.source_frontier_ref
```

`a.value.successor_frontier_ref` resolves a frontier whose exact member set is
the source frontier member set plus `e.id` once. The cut's claim, claim
judgment, event, event judgment, relation, source frontier, and successor
frontier refs each resolve the unchanged record judged or materialized.

All seven cut subjects, all three judgments, and the three required relation
records share the exact profile basis. The source and successor frontiers also
share `projection_basis_ref` and `precedence_law_ref`; the only permitted
frontier-content delta is addition of `e.id` once. The cut includes exactly:

```text
admits_claim(e, c)
materializes_relation(e, r)
frontier_contains(F_k_plus_1, e)
```

Each edge has the exact inherited relation shape and
`OccurrenceRelationQualifiers`. Missing, extra, reversed, duplicate, or
cross-basis required edges refuse the cut. The source frontier must not already
contain `e`; duplicate frontier members refuse before set comparison.

A first event needs no fictional predecessor. Re-admission of the same claim,
claim judgment, event judgment, source frontier, basis, and authority returns
the existing byte-equal semantic cut. Any non-identical collision refuses
`refuse_duplicate`; it never mints rival facts.

The endpoints of a pre-admission `RelationClaim` already exist. The generated
`admits_claim` and `materializes_relation` records are post-admission relations,
not claims that contain their own future event endpoint.

### OP-002 Atomic Semantic Admission

For a relation claim, one admitted semantic cut contains the unchanged claim,
its admission judgment, the event and its scope/admission judgment, the
deterministic materialized relation, the exact source frontier, and the unique
successor frontier. The source frontier named by the claim, event, and cut is
identical. The successor equals that frontier plus exactly the admitted event.
Missing, conflicting, or inconsistent members refuse the cut. This is semantic
atomicity; the profile does not prescribe a storage or transaction mechanism.

### OP-003 Correction Without Erasure

`corrects_event(new, existing)` retains both immutable events. Correction
changes later projection through an explicit selection law. It does not delete,
rewrite, or retrospectively re-identify the corrected fact.

## Causality And Typed Lineage

Three graph families remain distinct:

```text
G_id          identity-dependency DAG
G_occ_cause   declared occurrence-causation DAG
G_evt_cause   declared event-causation DAG
```

Each is acyclic under its own typed relation. Cause is established only by an
admitted causal claim under competent authority and evidence. Timestamp,
ordinal, adjacency, containment, common subject, shared actor, correlation,
and arrival order do not create cause.

The wider typed-lineage graph may lawfully contain opposing edges of different
kinds. For example, one event may support another while the second corrects
the first. A cycle in the untyped union is not a causal cycle unless one
declared causal subgraph itself cycles.

### OP-004 Precedence Is Not Authority

A projection may use a declared precedence coordinate to select current truth.
The coordinate, comparison law, basis, and admitting authority are explicit.
The coordinate orders eligible facts; it does not gain semantic, admission,
causal, or decision authority.

## Mutable-Subject Effect Relation

Let `W` be an externally mutable subject bound by stable `SubjectBinding b_W`.
For occurrence `o_n`:

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

Functor kind, traversal, domain operation, executor, actor, grant, and effect
invocation are different coordinates. `F_P`, `F_D`, or `F_H` classification
does not by itself identify, authorize, or execute `op_n`.

No operation is lawful without a matching grant naming the subject binding,
operation kind, and effect territory. Profile construction and occurrence
admission mint no grant.

For invocation `inv_n`, operation instance `op_n`, grant `g_n`, and occurrence
`o_n`, all operation bindings are exact:

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

The exact `OperationKind` object therefore closes the grant over both kind and
contract. A grant cannot authorize a same-labelled operation instance carrying
a different contract, target sort, invalidated kind, or unresolved kind ref.

An adopting Product may replace exact territory equality only through an
explicit, authority-owned containment relation in its compatible signature.
Nominal kind equality, a role label, executor access, or broad workspace access
does not satisfy the grant.

The disposition law is closed:

- `no_effect` has no dispatched invocation and records that no domain effect
  was attempted;
- `completed_effect` binds one dispatched invocation, bounded post-observation,
  and sufficient effect evidence;
- `partial_effect` binds one dispatched invocation, bounded post-observation,
  bounded evidence, the `partial_effect` residual and stop, and explicit
  re-entry before any further effect; and
- `refused_effect` binds the refused invocation attempt and `refusal` stop, with
  evidence that no authorized mutation began.

`invokes_effect` exists if and only if a concrete invocation was dispatched.
`unauthorized` or `stale` readiness never dispatches it. The immutable
`EffectInvocation` contains no future disposition; `EffectDisposition` records
the later outcome without rewriting the invocation.

`j_ready` judges the unchanged `EffectSubject` immediately before effect
dispatch under the application's declared currentness and invalidation law. If
the pre-observation or grant has become stale, the effect does not start; the
application re-observes and issues a new readiness subject and judgment or
stops. If an effect has begun and cannot establish complete disposition,
`partial_effect` remains explicit and bounded post-effect observation is
required. This law does not require a lock or transaction implementation.

### OP-005 Mutable Reality Conservation

`W` remains the mutable reality carrier. Observation, evidence, result,
checkpoint, event, projection, cache, or model content may describe `W`; none
replaces it. A later traversal application observes the then-current `W` under
the stable binding when authority is unchanged.

Snapshotting or rollback may be supplied by a separately authorized
application. This profile neither requires nor forbids it and does not infer
rollback from a new occurrence.

### OP-006 Immutable Iteration History

Iteration does not mutate an earlier occurrence. Each traversal reapplication
mints a fresh immutable occurrence over the evolving subject. The admitted
occurrence and event history is therefore append-only even when the external
subject changes repeatedly.

## Event Frontier And Projection

An `EventFrontier` binds the complete event member set evaluated, its exact
basis, and the declared precedence law. A projection judgment points to one
unchanged `Projection` identity and digest; that projection binds exactly one
unchanged frontier.

For profile basis `b`, scope `s`, and precedence law `p`, there is one empty
frontier `F_0(b,s,p)`. Admitting event `e_k_plus_1` constructs a successor whose
member set is exactly `members(F_k) union {e_k_plus_1}`. Frontier identity binds
the profile basis, scope, precedence law, sorted event identities, and event
content digests. Projection identity binds the exact frontier, projection
rule, selected relation ids, boundary ids, and residual ids.

New events create a new frontier. A prior projection does not silently advance.
Latest-only summaries do not prove frontier completeness. Competing
corrections, unresolved scope, missing causal inputs, or a stale basis remain
residuals or stops according to the selected projection law.

### OP-007 Scope Conservation

Every event carries its declared scope class. `event_for` is present only when
the scope law names one exact occurrence. Subject-wide, publication-wide, or
otherwise occurrence-independent facts remain independent.

## Authority And Adoption

This profile owns only the application-neutral record, relation, identity,
causal, effect-boundary, frontier, and refusal laws above.

It grants no semantic, operation, evaluation, admission, decision, correction,
continuation, or closure authority. Every material operation and judgment
resolves an existing owner-issued grant. Copying a profile record or adopting
the profile transfers no authority.

A Product adoption declares at least:

- the exact traversal-occurrence-profile basis;
- the exact subject and subject-binding interpretation;
- mappings from Product concepts to profile sorts and relation kinds;
- operation, actor, executor, admission, projection, and decision authorities;
- event scope and frontier laws;
- invalidation and re-entry conditions; and
- qualification evidence proving that no Product distinction was lost.

An absent or incomplete adoption means the profile is available but inactive
for that Product.

## Exact Profile Identity

The stable concept identity does not identify one immutable profile edition.
After publication bytes exist, the signature preimage is issued as:

### Closed Profile Signature

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

The record uses RFC 8785 JSON Canonicalization Scheme bytes. Its identity is:

```text
sha256(JCS(TraversalOccurrenceSignature))
```

`calculus_signature_schema_clause_ref` resolves the exact inherited signature
schema and record law. `occurrence_signature_clause_refs` resolves exactly
these fragments against the publication member URI:

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
relations, constraints, judgments, residuals, stops, and exact functor-kind
refs. The list is duplicate-free and sorted by ascending unsigned UTF-16 code
units. `profile_member_sha256` equals the publication member digest. This gives
`occurrence_signature_sha256` one reconstructable preimage rather than an
implementation-defined serialization.

Every clause ref is an absolute URI whose base is the exact publication
`member_uri`; only its fragment differs. The calculus clause ref is an absolute
URI inside the exact calculus publication basis. Relative paths, mutable source
URIs, missing fragments, duplicate refs, or a ref outside those two exact
publication members refuse the signature.

The exact profile basis is then issued as:

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
signature. The basis record also uses RFC 8785 JSON Canonicalization Scheme
bytes. Duplicate object names are rejected before canonicalization. Its
identity is:

```text
urn:stdo:traversal-occurrence-profile-basis:sha256:
  + sha256(JCS(TraversalOccurrenceProfileBasis))
```

The imported calculus basis resolves as exact RFC 8785 bytes of an
`AxiomaticCalculusBasis` record with the required kind, schema, concept,
derivation basis, and publication basis. Its calculated identity equals both
`calculus_basis_identity` fields. Its publication manifest digest resolves the
exact manifest bytes; that manifest contains the calculus member path and
digest once; the resolved calculus member bytes have that digest; and
`calculus_signature_schema_clause_ref` is that exact member URI plus
`#core-signature`. Its distinct predecessor manifest resolves every sorted,
duplicate-free `principle_ref` inside the declared predecessor release. The
principle-ref population is exactly the absolute predecessor-release expansion
of every derivation address declared by the resolved calculus member, neither a
selected subset nor an independently invented list. For the calculus edition
bound by this profile publication candidate, that population has fourteen
members. Each referenced predecessor member resolves as exact bytes whose
digest occurs once in the predecessor manifest, and each fragment resolves one
heading in those bytes under the publication's semantic-address rule. A string
with the right shape, an unresolved basis record, a mismatched manifest or
member, a missing or extra principle ref, an invented or absent fragment, an
unbound predecessor byte sequence, or a same-carrier derivation refuses.

The profile publication member resolves by the same manifest/member rule. A
mutable source path, strategy post, implementation, or consumer mapping cannot
substitute for either imported basis or publication identity.

`publication_basis.release_uri` is one absolute immutable
`stdo://releases/v<version>-rc.<positive-ordinal>/` URI.
`publication_basis.member_uri` is exactly that URI plus
`standards/TRAVERSAL_OCCURRENCE_PROFILE.md`. The installed release manifest
named by `manifest_sha256` contains exactly one standards member with that path
and `member_sha256`; the same digest appears in the embedded signature.
Kind and schema-version values are exact. Every digest uses lowercase
`sha256:<64-hex>`. The signature and basis preimages are their exact RFC 8785
JCS values; a newline, alternate object order, duplicate name, non-I-JSON
value, or implementation-specific serialization cannot acquire the declared
identity.

Any change to the calculus basis, signature refs, closed signature, or profile
member bytes mints a new profile basis. Supersession is an external Product and
release judgment; an earlier basis never silently advances.

## Exclusions

This profile is not:

- a change to pure `a_c` or pure Reference Frame law;
- a mandatory profile for every symbolic model;
- a concrete subject or workspace ontology;
- a process, traversal, retry, continuation, or closure engine;
- an event store, event-log schema, projection implementation, or state carrier;
- a mutation, admission, evaluation, or decision authority;
- a prospective-frame or sensor-population profile;
- a guarantee that every framework event belongs to an occurrence; or
- a claim that every typed lineage graph is acyclic.

## Conformance Obligations

Review and qualification cover at least:

1. instantiation under one exact `a_c` basis, the exact eight-member
   `RecordKind_ac` population function, and closed reference domains without
   inherited-field shadowing;
2. exact inherited record families, direct coordinates, and disjoint local and
   external identity populations;
3. complete occurrence seeds, exact congruence with every mirroring relation,
   and future-result and future-event refusal;
4. first-event admission without a fictional predecessor;
5. distinct candidate, judgment, event, materialized relation, cut, and cut-
   judgment identities with unchanged-subject digest binding;
6. idempotent or refused duplicate admission;
7. cycles in each identity or causal subgraph;
8. lawful opposing support and correction edges in wider typed lineage;
9. exact closed event-kind population, payload, digest, scope, and binding law,
   including scope-independent events with no fabricated `event_for` relation;
10. functor kind, traversal, operation kind, operation instance, executor,
    actor, grant, invocation, target, and territory separation;
11. missing, stale, mismatched, and out-of-territory operation grants;
12. no-effect, complete-effect, partial-effect, and refused-effect cases;
13. preservation of the external mutable subject as reality carrier;
14. fresh occurrence identity on traversal reapplication;
15. component and aggregate occurrence identities for retained composite
    applications;
16. stale pre-effect observation and grant-currentness refusal;
17. incomplete semantic-admission batch refusal, including missing or
    non-admitted cut judgment and unequal claim/event/cut source frontiers;
18. frontier completeness, staleness, and correction selection;
19. timestamp, ordinal, adjacency, containment, and correlation non-causation;
20. Product adoption absence and incomplete-mapping refusal; and
21. profile-basis reconstruction from exact JCS, kinds, schemas, immutable
    URIs, digests, calculus address, and unique publication membership.

Representative examples or checkers establish only the claims they actually
evaluate. They do not become an occurrence engine or semantic authority.
