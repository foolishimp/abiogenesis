---
kind: authority_compression_asset
asset_ref: authority-compression://stdo/traversal-occurrence-profile/v1
source_ref: ../TRAVERSAL_OCCURRENCE_PROFILE.md
source_digest: 618bb7c8f9f1eab8283cf595ac9da3533f0f9cf80a684c6f42e09142da6590c1
compression_profile: prompt_authority_compact_v1
target_prompt_families:
  - transform
  - evaluate_design_depth
  - evaluate_review_grade
generated_by: codex
generated_at: 2026-08-29
stale_if_source_digest_changes: true
---

# Traversal Occurrence Profile Compressed Authority

## Identity And Boundary

`TRAVERSAL_OCCURRENCE_PROFILE.md` owns the application-neutral Traversal
Occurrence Profile in `urn:stdo:bounded-context:traversal-occurrence-profile`,
with stable concept identity `urn:stdo:concept:traversal-occurrence-profile`.

It imports one exact `a_c` basis through
`Sigma_occurrence = instantiate_signature(b_ac, OccurrenceSignatureDefinition)`.
The closed model-family signature instantiates inherited calculus record and
model law without changing the calculus. Availability does not adopt the
profile for a Product, and the profile imports no consumer vocabulary, runtime
topology, or operation authority.

The profile imports the exact eight-member `RecordKind_ac` set and total
`Population_M` law unchanged: semantic objects, typed relations, constraints,
latitude, residuals, traversals, transformations, and judgments occupy the
disjoint `O/E/C/L/X/V/T/J` populations. Profile sorts and value domains add no
ninth record family. Every identity-bearing field has one exact
`RefDomain_Sigma_occurrence(record_kind, qualified_field)` declaration.
`qualified_field` includes the source sort or kind and nested field path. The
finite table closes cardinality, local family and sort, external target kind,
and exact model, profile, calculus, or adoption basis relation for every ref;
missing rows, wrong targets, local/external ambiguity, and duplicate refs
refuse.

Inherited Transformation closure is explicit. For
`D_ext={external_preserved,external_introduced,external_removed}`,
`W_ext={external_resolution,domain_resolution,codomain_resolution}`, and the
seven-field `Q_ext=Resolution_M`, the signature defines every
`T.d[].q` and `T.external_resolution_witnesses[].w.q` reference domain, plus
the witness domain model, codomain model, and evidence domains. Resolution
target identity and basis are the exact dependent sibling coordinates; all
other nested refs bind their exact profile, calculus, adoption, model, or
evidence domain. The three delta lists and witness list are finite,
duplicate-free, exact-shape populations. Missing or extra nested fields,
unresolved refs, basis mismatch, duplicates, or a witness outside the preserved
population refuse.

## Record And Relation Closure

- Only profile semantic objects use `SemanticObject.value`. Typed relations,
  constraints, latitude, residuals, traversals, transformations, and judgments
  retain their inherited `a_c` record families and direct coordinates.
- Core object sorts cover occurrence model subject, traversal application,
  occurrence, stable subject binding, observation, intended outcome, operation
  kind, effect-operation instance, operation grant, effect invocation, later
  effect disposition, effect evidence, relation claim, framework event, event
  frontier, projection, semantic admission cut, effect subject, and transition
  subject.
- Core relations keep traversal application, subject binding, intent,
  observations, effects, evidence, event scope, frontier membership, identity
  dependency, occurrence cause, event cause, support, correction, admission,
  materialization, and transition identity distinct.
- A framework event has an optional occurrence ref. A fact with an
  occurrence-independent scope is not assigned a fictional occurrence.
- `EventKind_occurrence` is closed to claim admission, occurrence admission,
  effect disposition, and external-fact admission. Each kind fixes payload sort,
  scope, and permitted claim and occurrence bindings; unknown kinds or scope
  values refuse.
- Relation qualifiers use closed cardinality, preservation, loss, and refusal
  domains. Constraint predicates return only satisfied, falsified,
  indeterminate, or invalid basis. Every constraint maps to a type-matched
  judgment with exact evidence, stop, residual, and re-entry law.
- Every relation and claim qualifier has the exact nine-field
  `OccurrenceRelationQualifiers` shape. Relation ids and `(kind,source,target)`
  triples are duplicate-free before any set comparison.

`Cardinality_occurrence` is total over the 24 core relation kinds:

```text
exactly_one = {
  application_of, applies_traversal, bound_to_subject, intends,
  operation_of_kind, targets_subject, authorized_by, projects_frontier,
  admits_claim, materializes_relation, transition_for
}
zero_or_one = {
  observes_before, observes_after, invokes_effect, disposition_for,
  event_for, component_of_occurrence
}
zero_or_more = {
  evidenced_by, frontier_contains, identity_depends_on,
  causally_precedes_occurrence, causally_precedes_event,
  supports_event, corrects_event
}
one_or_more = {}
```

Every core relation qualifier uses that exact cardinality,
`preservation=meaning_preserved`, `loss=none`, no inverse kind, and one
applicable refusal value; `not_applicable`, enum-valid cardinality drift,
declared loss, or a nominal inverse refuses. Authority, evidence, provenance,
and invalidation remain exact instance coordinates.

## Identity, Admission, And Causality

Occurrence identity binds only pre-admission inputs: exact profile basis,
application, traversal, functor kind, subject binding, intended outcome,
lineage, and identity-dependency inputs. Post-effect observations, evidence,
judgments, events, timestamps, ordinals, and projections cannot enter the seed.

The exact `application_of`, `applies_traversal`, `bound_to_subject`, `intends`,
outgoing `identity_depends_on`, incoming occurrence-cause, and incoming
component edges reproduce those seed fields exactly. Missing, extra, reversed,
or mismatched edges refuse occurrence admission. Relation identities do not
enter the seed they later mirror.

Keep the admission identities and judgments separate:

```text
candidate RelationClaim
  -> claim Judgment over unchanged candidate
  -> candidate FrameworkEvent
  -> event Judgment over unchanged event
  -> deterministic materialized TypedRelation
  -> source/successor frontier-bound SemanticAdmissionCut
  -> cut Judgment over unchanged cut
```

Only admitted claim, event, and cut judgments admit the semantic cut. It
contains the unchanged claim and claim judgment,
candidate event and event judgment, deterministic relation, exact source
frontier, and unique successor frontier or refuses. Byte-equal duplicate
admission reuses that cut; any non-identical collision refuses. This atomicity
claim prescribes no storage transaction mechanism.

Each judgment binds the exact unchanged subject identity and digest and has its
declared claim-, event-, or semantic-cut-admission kind. The claim, event, and
cut name one identical source frontier; the successor is exactly that frontier
plus the admitted event once. A missing cut judgment or non-admitted decision
refuses.

The complete cut shares one profile basis and includes exactly
`admits_claim(event,claim)`, `materializes_relation(event,relation)`, and
`frontier_contains(successor,event)`, each with exact qualifiers. Source and
successor frontiers share projection basis and precedence law; duplicates,
missing, extra, reversed, or cross-basis edges and frontier members refuse.

Identity dependency, occurrence causation, and event causation are separate
acyclic graphs. Cause requires an admitted causal claim. Timestamp, ordinal,
adjacency, containment, correlation, and arrival order do not create cause.
The wider typed lineage may contain opposing support and correction edges;
their untyped union need not be acyclic.

## Mutable Subject And Effect Boundary

Mutable reality remains external under one stable `SubjectBinding`. A traversal
application is classified by exact `F_K[v]`; the effect operation, executor,
actor, owner-issued grant, and invocation are separate coordinates. No effect
is lawful outside the grant's subject, operation kind, and territory.

Every effect-operation instance resolves one exact `OperationKind`, target
subject binding, territory, and contract. The invocation's operation and grant
edges reproduce its value refs; the operation kind, subject target, and
territory match the grant exactly. The instance contract equals the contract
of its exact admitted kind, so a granted kind cannot authorize a same-labelled
instance carrying another contract. Only an explicit adopting signature may
supply authority-owned territory containment.

An effect-readiness judgment binds the unchanged current observation,
invocation, operation, territory, and grant. Stale or unauthorized readiness
never dispatches. Effect disposition is a later immutable record; partial
effect requires bounded post-observation and explicit residual disposition.

Observations, evidence, results, checkpoints, events, projections, caches, and
model content may describe the mutable subject; none replaces it. Reapplying a
traversal over the then-current subject creates a fresh immutable occurrence.
Observation, waiting, or correlation alone does not.

Every retained component traversal application has its own occurrence. A
declared composite application may also have an aggregate occurrence; typed
component membership does not imply material cause.

## Frontier, Authority, And Adoption

An `EventFrontier` binds the complete event set, exact basis, and precedence
law. A projection judgment targets one unchanged `Projection`, which binds one
unchanged frontier. New events create a new frontier; projection evaluation is
required only when that frontier is projected. A prior projection cannot
silently advance.

The profile grants no semantic, operation, evaluation, admission, decision,
correction, continuation, or closure authority. A Product adoption separately
binds exact profile basis, subject interpretation, vocabulary mappings,
authorities, scope and frontier laws, invalidation, and qualification evidence.
Absent or incomplete adoption leaves the optional profile inactive.

An exact `TraversalOccurrenceProfileBasis` embeds a canonical signature binding
the exact `AxiomaticCalculusBasis`, its Core Signature clause, the complete
sorted profile-signature clause refs, and the profile-member digest. It also
binds the immutable publication release, manifest, member URI, and member
digest. Its identity is the SHA-256 of the RFC 8785 canonical basis record.
Mutable source, commentary, implementation, and consumer mappings cannot
substitute for that basis.

The imported `AxiomaticCalculusBasis` is resolved from its exact JCS bytes, not
accepted as a shaped string. Its calculated identity, kind, schema, concept,
distinct predecessor and publication manifests, sorted principle refs,
publication member URI, exact calculus member bytes and digest, and
`#core-signature` address all match. Missing or rival basis, manifest, member,
or principle bytes refuse. The principle population is exactly the absolute
predecessor-cut expansion of every derivation address in the calculus member;
the bound candidate has fourteen. Every predecessor member has manifest-bound
bytes and every fragment resolves in those bytes. A subset, superset, invented
fragment, self-consistent rival JCS identity, or same-carrier derivation
refuses.

All kinds and schema versions are exact, all URIs are absolute and basis-bound,
all digests use lowercase `sha256:<64-hex>`, and both identities derive from
their exact RFC 8785 JCS preimages. The immutable publication manifest contains
the exact profile member path and digest once.

## Refusal Compression

Refuse or retain an explicit residual for:

- base-signature shadowing, unknown fields, or wrong record family;
- a future event, result, or observation in an occurrence seed;
- a cycle in identity dependency or either causal subgraph;
- a typed-lineage loop rejected as though it were a causal loop;
- fabricated occurrence scope for an independent event;
- functor kind, operation, executor, actor, grant, or invocation substitution;
- missing, stale, mismatched, or out-of-territory operation grant;
- evidence, snapshot, result, cache, or event history replacing mutable reality;
- stale or incomplete event frontier; or
- Product adoption, runtime meaning, or authority inferred from availability.
