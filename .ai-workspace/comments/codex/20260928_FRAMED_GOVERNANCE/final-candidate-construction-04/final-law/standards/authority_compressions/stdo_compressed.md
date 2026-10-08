---
kind: authority_compression_asset
asset_ref: authority-compression://stdo/core/v1
compression_profile: prompt_authority_compact_v1
target_prompt_families:
  - transform
  - evaluate_design_depth
  - evaluate_review_grade
source_refs:
  - ../AXIOMATIC_CALCULUS.md
  - ../TRAVERSAL_OCCURRENCE_PROFILE.md
  - ../REFERENCE_FRAME_METHOD.md
  - ../STDO_REFERENCE_FRAME_BASELINE.md
  - ../SPEC_METHOD.md
  - ../schemas/product-definition.schema.json
  - ../schemas/installed-release-manifest.schema.json
  - ../DESIGN_MODULE_METHOD.md
  - ../ODD_METHOD.md
  - ../WORLD_MODEL_METHOD.md
  - ../TICKET_METHOD.md
  - ../UX_METHOD.md
  - ../IDENTITY_METHOD.md
  - ../RELEASE_METHOD.md
  - ../POSTING_GUIDE.md
index_refs:
  - ../GLOSSARY_GUIDE.md
source_digests:
  AXIOMATIC_CALCULUS.md: cbe2edb928d3e75e23446f6d525baea664966e8d5920e6fa389cbaa4af8f1f8d
  TRAVERSAL_OCCURRENCE_PROFILE.md: 618bb7c8f9f1eab8283cf595ac9da3533f0f9cf80a684c6f42e09142da6590c1
  REFERENCE_FRAME_METHOD.md: 6e9148d7c8eff847abf172315b0e282e4477f3d40866b28f7fef21c41cb067e7
  STDO_REFERENCE_FRAME_BASELINE.md: 29ac1367a77bf686e621a3e1b88bb39a0ba8e6c44b40e2b29904a7eb5606571d
  SPEC_METHOD.md: 7f12d32ef4e5720d5d59ee5ace50de6c1a12cc56afa53dd67a8ee4c54f8fb8a4
  schemas/product-definition.schema.json: e0a3b544dae6c83bf941096b440700d02fa988fd2767f3b4ab297a1a03f67abf
  schemas/installed-release-manifest.schema.json: 711a2eea44b995a043d4d9e02c8427723fc830de1a9f0f3c8c66e8ddb7aee4c2
  DESIGN_MODULE_METHOD.md: 5cb69556bba1171ec347cac96811c50071f0648a367103aa215070239b93785e
  ODD_METHOD.md: b33dd5b868e66e27c583b3237e93421ab12d502b38368bf075973c1bf7faef2d
  WORLD_MODEL_METHOD.md: 123ddcd05130aa95508c9fcfa194bf083caae3657baedaba0ce9214009453762
  TICKET_METHOD.md: f031ce7fb3b5b366ffaee5996ae76e861697ad86897cc04c06b67da249fe0eca
  UX_METHOD.md: a7cca45d6064d7fc864edd86e3913c9462cfe2a52ae3d1519c6a031713dccae7
  IDENTITY_METHOD.md: e65b875464cc93a3f9186d915ad88603755de34bac6f27072562ed34c13f64cd
  RELEASE_METHOD.md: 582bc15451855670495e559db3ae6a89ba37edaa3656f33499d02220cbdb141c
  POSTING_GUIDE.md: 63ee8b6fde9803e38970e85fb2c4e0aa398632720b6a5f1cff8fb1291398c59a
index_digests:
  GLOSSARY_GUIDE.md: da6d81df61d61e685bcf1ef69187839a52d72af7f1d61af050244f856efe0cd0
generated_by: codex
generated_at: 2026-09-30
stale_if_source_digest_changes: true
stale_if_index_digest_changes: true
---

# STDO Compressed Authority

## Method Identity

`STDO` is shorthand for its four key method pillars:

- `S` — Specification (`SPEC_METHOD.md`);
- `T` — Ticketing (`TICKET_METHOD.md`);
- `D` — Design (`DESIGN_MODULE_METHOD.md`); and
- `O` — Outcome-Driven Development (`ODD_METHOD.md`).

`ODD` expands to Outcome-Driven Development. The `O` in `STDO` names that
complete ODD pillar.

This shorthand does not reduce the STDO Product to four files. Consumer
authority remains one complete immutable released STDO cut with its exact
member inventory.

## Governing Claim

Specification is constitutional source. Design and realization are subordinate
implementation surfaces. Code, prompts, tests, generated views, dashboards,
archives, and comments are projections or realization proof, not independent
truth.

Within its scope, derived guidance preserves source applicability, obligations,
permissions, exclusions, owners and invalidators. Correct digests cannot qualify
a projected prohibition's lost condition or lawful alternative. References must
be resolvable within the actor's access or the necessary content is supplied.
Changed native guidance needs source-derived ordinary-use qualification;
semantic agreement cannot prove mechanical or operational behavior.

Products, applications, modules, graph functions, build tenants, and runtime
surfaces implement constitutional documents; they do not replace them.

Method vocabulary names normative capabilities and construction relations.
Consumers bind concrete implementations and immutable identities under their
own Product authority. A downstream Product may prove or falsify conformance;
it cannot supply reusable method meaning. Constitutional examples use neutral
capability and authority identities.

This aggregate carries cross-source decisions that cannot be closed from one
source-specific compression, including the complete T-008 F1-F5 bundle and the
Reference Frame Method/STDO baseline application relation. Source-specific
compressions remain standalone only for decisions owned by their source and
refuse cross-law closure.

## Axiomatic Calculus

- `a_c` is the domain-specific, carrier-neutral constitutional calculus owned by
  `AXIOMATIC_CALCULUS.md` in
  `urn:stdo:bounded-context:axiomatic-calculus`.
- It makes no claim of universal applicability, logical completeness,
  consistency, decidability, soundness, or category-theoretic status except
  where separately proved for an exact scope.
- Keep `a_c`, an interpreted `a_c.X` model, and an encoded `a_c.X.C` carrier as
  distinct governed layers with separate content identities, judgments, and
  proof. Product status requires separate acceptance and release authority.
- One closed signature declares the fixed eight-member record-kind universe and
  every sort, relation kind, constraint kind, residual kind, functor kind,
  judgment kind, stop kind, field, value domain, and reference domain. The
  model tuple is `M_b = (b, I, O, E, C, L, X, V, T, J)`: exact basis,
  identities, objects, relations, constraints, latitude, residuals, traversals,
  transformations, and judgments.
  A total population map assigns every fundamental record to exactly one family.
  `RecordKind_ac` is exactly:

  ```text
  urn:stdo:concept:axiomatic-calculus:record-kind:semantic-object
  urn:stdo:concept:axiomatic-calculus:record-kind:typed-relation
  urn:stdo:concept:axiomatic-calculus:record-kind:constraint
  urn:stdo:concept:axiomatic-calculus:record-kind:latitude
  urn:stdo:concept:axiomatic-calculus:record-kind:residual
  urn:stdo:concept:axiomatic-calculus:record-kind:traversal
  urn:stdo:concept:axiomatic-calculus:record-kind:transformation
  urn:stdo:concept:axiomatic-calculus:record-kind:judgment
  ```
- Identity is scoped by type, context, owner, scope, and basis. The total
  `RefDomain_Sigma(record_kind, field)` function closes every identity-bearing
  field with exact cardinality, permitted local record families and sorts,
  external target kinds, and `required_basis_relation`. Relations
  are directed and typed. Authority, provenance, and residual uncertainty
  survive every projection, transformation, interpretation, and encoding.
- Transformation is an operation-bearing specialization of one exact
  traversal. It directly carries context, owner, scope, basis, operation
  authority, evidence, preservation, mutation, residual, and refusal
  coordinates plus one exact typed preservation relation; nominal preservation
  and broader or mismatched traversal coordinates refuse. Its local-record
  delta partitions every input local identity into preserved or removed and
  every successor local identity into preserved or introduced. Its separate
  `Resolution_M` delta partitions exact external-resolution coordinates into
  `external_preserved`, `external_removed`, and `external_introduced`, with one
  total equality witness for every preserved coordinate. Silent local or
  external retention, loss, duplication, reintroduction, or residual erasure
  refuses.
  Exact closure requires
  `Local_b = P_t disjoint_union R_t`,
  `Local_b_prime = P_t disjoint_union N_t`,
  `N_t intersect Local_b = empty`,
  `R_t intersect Local_b_prime = empty`,
  `E_b = EP_t disjoint_union ER_t`,
  `E_b_prime = EP_t disjoint_union EN_t`,
  `EN_t intersect E_b = empty`, and
  `ER_t intersect E_b_prime = empty`.
  `external_resolution_witnesses` contains exactly one
  `ExternalResolutionPreservationWitness` per preserved coordinate, with exact
  domain/codomain model and resolution tuples, `decision: equal`, and non-empty
  evidence; the tuples are field-equal. A cross-basis or cross-signature migration
  requires one separately identified specialization with exact composite-basis
  and compatible signature-extension relations; changed basis or record kind is
  removal plus introduction, never preservation.
- Material closure is the least finite unique lawful record closure under an
  exact dependency family. Projection returns that closure plus its explicit
  boundary; it cannot trim required members to meet a budget.
- `F_D`, `F_P`, and `F_H` are generic functor-kind identities. Apply them only
  as `F_K[v](X_v) -> Y_v | Omega_v`, with one exact traversal `v`. Actors and
  domain operations are separate coordinates.
- `F_D[v]` evaluates or proves declared properties and returns a judgment over
  an unchanged subject. `F_P[v]` performs bounded probabilistic interpretation,
  construction, or proposal without acceptance authority. `F_H[v]` performs
  explicit human adjudication under an exact grant.
- Equal spelling in another bounded context creates no import, specialization,
  or authority relation. Any external relation is separately owned and remains
  outside the calculus.
- Structural conformance proves closed shape, types, identities, references,
  and bases. It does not prove semantic fidelity or human acceptance.
- Model and carrier identities are content-first. Semantic acceptance and
  carrier admission are external judgments over unchanged subject identities;
  neither judgment enters the identity of its own subject.
- Carrier encoding requires an external accepted semantic judgment whose
  subject identity and digest exactly match the interpreted model. The judgment
  remains outside both content identities and is retained in the admitted
  encoding evidence relation.
- Concrete subject interpretations and carrier encodings remain downstream
  relations. Neither a selected interpretation nor a carrier is content of the
  calculus.
- `id(AxiomaticCalculusBasis)` is
  `urn:stdo:axiomatic-calculus-basis:sha256:` plus
  `sha256(JCS(AxiomaticCalculusBasis))`. Its exact kind is
  `stdo.axiomatic-calculus-basis`, schema version is `1`, and concept identity is
  the calculus. RFC 8785 JCS is mandatory and duplicate object names refuse. The
  record separates an absolute immutable accepted predecessor derivation basis
  from the distinct immutable successor publication basis. The predecessor
  manifest and every non-empty, duplicate-free, unsigned-UTF-16-sorted
  `principle_refs` member byte and heading fragment resolve exactly. The
  successor manifest, calculus `member_uri`, and `member_sha256` resolve exactly;
  same-carrier or cyclic derivation refuses.

## Traversal Occurrence Profile

- `TRAVERSAL_OCCURRENCE_PROFILE.md` owns one application-neutral `a_c`
  model-family profile. It instantiates one closed signature under an exact
  calculus basis without modifying the calculus; adoption remains optional and
  availability is not adoption.
- Only Traversal Occurrence Profile semantic objects use
  `SemanticObject.value`. Every relation, constraint, latitude, residual,
  traversal, transformation, and judgment retains its inherited `a_c` family
  and coordinates.
- The profile supplies a complete qualified
  `RefDomain_Sigma_occurrence(record_kind, field)` table and the exact inherited
  eight-family population. Relation and claim qualifiers use the declared
  nine-field contract; missing, unknown, duplicate, wrong-family, wrong-sort,
  or wrong-basis references refuse.
- `EventKind_occurrence` is closed to claim admission, occurrence admission,
  effect disposition, and external-fact admission, each with exact payload,
  scope, claim, and occurrence contracts.
- Occurrence identity binds only pre-admission application, traversal,
  functor-kind, subject-binding, intent, lineage, and identity-dependency
  inputs. Post-effect observations, evidence, judgments, events, ordinals, and
  projections cannot enter the seed.
- Candidate claim, claim judgment, framework event, event judgment, and
  materialized typed relation are distinct identities and authority surfaces.
  Their admitted semantic cut requires admitted claim, event, and cut judgments
  over unchanged subjects; exact `admits_claim`, `materializes_relation`, and
  successor `frontier_contains` edges; one basis; and identical source
  frontiers. It then contains its exact source and successor frontiers or
  refuses. Byte-equal duplicate admission reuses the cut; a collision refuses.
- Identity dependency, occurrence cause, and event cause are separate acyclic
  graphs. Wider typed lineage may contain opposing support and correction
  edges; temporal or carrier order does not create cause.
- Mutable reality remains external under one stable subject binding.
  Observation, result, evidence, checkpoint, event, projection, cache, or model
  content cannot replace it.
- Functor kind, traversal, effect operation, executor, actor, owner-issued
  grant, and invocation are distinct. Every effect-operation instance binds one
  operation kind, subject, territory, and contract. Its exact instance contract
  must equal the OperationKind contract, and the invocation and
  grant must reproduce the kind, subject, and territory coordinates. Reapplying
  the traversal over the then-current subject creates a fresh immutable
  occurrence.
- An effect-readiness judgment binds the current observation, invocation,
  operation, territory, and grant. Stale or unauthorized readiness never
  dispatches; later disposition is immutable and partial effect remains an
  explicit residual with bounded post-observation.
- Every retained component traversal application has its own occurrence. A
  declared composite application may also have an aggregate occurrence; typed
  component membership is not material cause.
- An event frontier binds the complete event set, exact basis, and precedence
  law. New events require a new frontier; a new projection judgment is required
  only when that frontier is projected or evaluated.
- A Product separately adopts and interprets the profile. The profile grants no
  operation, admission, evaluation, decision, correction, continuation, or
  closure authority and contains no consumer runtime mapping.

## Authority Flow

Use the smallest current authority surface that can decide the question:

`Goals -> Intent -> Product Definition -> Requirements -> Design -> Code -> Events -> Projection -> Delta -> Scenarios -> Gap Analysis -> Repricing`

When a lower layer needs a change in meaning, re-enter at the smallest upstream
layer that owns the missing truth.

## Product Definition Overlay

- Every STDO-defined product has one `stdo_<label>.json` definition per
  distinct current `WHAT`; `stdo_default.json` is the singleton default.
- `product.definition_id` identifies the mutable `WHAT` definition line, not
  any immutable Product or release produced from it. Product and release
  identities remain separate; a fork or independently governed definition
  receives another definition identity.
- The definition locates complete constitutional authorities and entrypoints,
  local axioms/overrides/disambiguations, collective reference-frame bases,
  Intent/Product/specification `WHAT`, common and tenant-local `HOW`,
  Goals/tickets/comments/optional sprints, and explicit product composition.
  It is a locator and relation authority, not a restatement of referenced
  truth.
- `constitution.stdo.source` and its `stdo://channels/<version>` selector are
  transport and mutable discovery inputs. The exact
  `stdo://releases/v<version>-rc.<n>/` URI and installed-manifest digest are the
  sole authored operative STDO selection. Additional constitutional sets and
  every reading entrypoint are basis-qualified.
- A constitutionally sufficient document set collectively makes axioms,
  ontology, epistemology, taxonomy, and semantics recoverable. These are
  coverage dimensions, not five assumed documents or directories.
- Each local disambiguation binds the exact term, target bounded context,
  complete material candidate set, one selected member of that set, owning
  carrier and authority, semantic bases, and governed scope. The overlay
  locates the resolution; it does not own or restate the candidate meanings.
- `reference_frame_bases` is non-empty and locates each durable shared project
  frame-basis declaration, its existing admitting authorities, and exact
  governed scope. A ticket or other authorized work instruction binds one
  agent's exact activation from an applicable basis. The Product Definition
  Overlay is neither an actor registry nor a store of temporary active
  configurations.
  A Product or runtime carrier named `Frame` remains `WHAT` or `HOW`; nominal
  overlap does not make it a collective evaluation frame.
- Existing projects bind their current carriers without restructuring. The
  default `specification/`, `build_tenants/`, and `.ai-workspace/` layout
  is scaffold only.
- One shared versioned store may carry many immutable cuts for many projects.
  Store paths and registry entries are derived; no project-local standards copy
  is required. Every managed store component is a physical directory or regular
  file; verification inventories all entry types and rejects redirection,
  special entries, and anything not derived from exact manifest paths. `sync`
  materializes only a definition's pinned cut. `adopt --dry-run` emits a digest
  binding current definition bytes to the exact cut, tag, commit, tree, and
  manifest; mutation requires and re-derives that accepted digest. Fleet
  adoption likewise requires its aggregate plan digest. Stable agent files only
  discover the definition, verify the exact installed basis, and route to its
  bootstrap entrypoint.
- Complete consumer updating is a separate explicit operation over one selected
  definition and the whole companion population of one exact declared cohort.
  The owner selects every native route and derived context for its scope;
  selecting none is not proving absence. Existing composition and release
  records own identity; a plan creates no registry or authority. Present and
  separately accept a digest binding cohort/member identities, destinations,
  preimages, replacement locators and source evidence, then re-derive it before
  effects. Stage/verify exact installs and recheck consumer preimages/sources.
  Change only selected basis/schema, existing composition locators/contracts and
  native/install links. Unknown or stale program/map/source evidence withholds
  the complete update before consumer effects; its owner supplies semantic
  re-authoring, and freshness alone proves no semantic conformance. Completion
  requires every selected resulting relation verified. Caught failure restores
  consumer preimages; unused staged immutable installs may remain. Exclusive
  write scope is required, with no multi-path crash-atomic claim; abrupt loss or
  failed rollback needs preimage-based recovery. Basis-only and fleet adoption
  retain their existing narrower contracts.
- Discover definitions recursively. Several definitions may share a monorepo
  root or appear at arbitrarily deep project roots. Folder nesting creates no
  implicit inheritance or composition; composition references other definition
  URIs explicitly. Each composition edge also binds the expected target
  definition identity, directed relation authority, and a non-empty governing
  contract set.
- Fleet discovery prunes the exact VCS, dependency, generated, cache, and
  managed-store names declared by `SPEC_METHOD.md` and refuses symlinked
  definitions. Bootstrap targets are relative to resolved
  `product.source_project`; parent traversal, redirection, and boundary escape
  fail closed. Fleet bootstrap confines source projects to its authorized root
  and preflights all targets. Exactly one ordered marker span is manager-owned;
  all prefix and suffix bytes remain project-owned and byte-identical.
- Portable Draft 2020-12 schema validation proves shape. URI formats remain
  annotations unless an assertion-capable validator is used, so conformance
  separately checks RFC 3986 syntax, resolution, target identity, immutable
  release identity, cross-file uniqueness, constitutional sufficiency,
  semantic-resolution completeness, and authority congruence. Every `stdo:`
  schema locator is parsed case-insensitively before loading and must select the
  same immutable cut as the operative basis.

## Work Carrier And Execution Contract

- Every governed execution uses one admitted run-scoped execution contract.
  After upstream work authority is established, select the first applicable
  source: reuse an exact admitted ticket; use a durable ticket only for state
  beyond the admitted sprint or, outside a sprint, beyond the current run; use
  a manifest-local entry for work ending inside its sprint; otherwise use an
  intake draft for one-run work. Without upstream authority, stop rather than
  creating a substitute ticket.
- `Ticket-shaped` names required execution-contract fields, not durable ticket
  identity. Absence of a durable ticket neither requires nor authorizes creating
  one. Create or update a ticket only when work or an obligation outlives the
  local carrier boundary: the admitted sprint when inside one, otherwise the
  current run, and only under ticket-state authority.
- Drafting and admission remain distinct relations; execution may occur in one
  invocation. Ticket existence, lane placement, `active` status, a generic
  work request, or the model's own draft cannot supply admission. Drafted or
  rejected work stops before execution; deterministic admission or exact human
  override of the bounded contract may continue without another ticket, turn,
  or approval ceremony. The admitted result names its Product-bound mechanism
  and authority, exact contract identity or digest, decision, and evidence.
- Every admitted contract names one Product-bound durable result/evidence
  surface. Record every result, withheld closure, and residual there before
  return; a conversation return alone is insufficient. Without that authorized
  surface, admission refuses.
- Without authority to persist a required durable carrier, retain the
  obligation in the contract's named durable result/evidence surface or an
  already-authorized enclosing carrier, withhold closure, and return re-entry
  pressure rather than manufacturing or losing a ticket.

## Treatment, Judgment, And Closure

- Spec Method owns reproducible classification: source-bound declared
  owner/layer traversal and unknown frontier, complete relevant Public
  membership and value comparison, accepted-design scope/trace evidence, and
  consequences of declared rules with sufficient premises. Bind producer,
  procedure, inputs, output, reproduction and invalidators. Missing data stays
  unknown; trace coverage is not residual semantic sufficiency. Computed C
  grants no effects; residual judgment J and reserved owner ruling O retain
  their actual owners and introduce no calculus kinds or runtime.
- Nonconforming candidate behavior does not author its target law. Repair or
  reject under sufficient unchanged law and the existing grant; selected
  changed meaning or established governing insufficiency re-enters its owner.
  A bounded authorized discriminator can resolve material unknowns without
  admitting the candidate as conformant.
- Ticket Method owns reusable J/O in the existing work/result carrier: question,
  exact subject/basis, supporting C/evidence, actor/authority, conclusion/scope,
  uncertainty and revising observation. Preserve original owner wording and
  conditions separately from interpretation. Consume applicable authority
  once; no new registry or owner ceremony is implied.
- Reuse current facts, judgments and reconstruction across roles or resumption.
  Material changed premises invalidate affected claims; preserve independent
  surviving support. Required independent assessment still acquires sufficient
  evidence and supplies its own judgment. Design Module Method retains complete
  Ontology and three-view coverage for new or materially changed boundaries;
  checked unchanged coverage is reusable.
- Repricing dispositions affected obligations as retained, superseded, deferred
  or withdrawn in the existing carrier with owner/evidence links. Preserve
  surviving work and changed dependencies; copy no unaffected history. Present
  a short consequence delta, retaining original owner wording separately.
  "Continue" accepts no undisclosed architectural or scope change.
- Closure is satisfied applicable obligations plus valid exact evidence and
  required J/O, with no active non-closure condition. Neither a review event nor
  evidence presence supplies that conjunction. The Writer may record a
  sufficient bounded result under its grant when no reserved condition applies.
  Qualification, publication and consumer adoption remain separate claims.

## Bounded-Context Semantic Isolation

- Term spelling is a label, not context-free concept identity. Resolve each
  material occurrence by term, bounded-context identity, owning authority,
  selected basis, and governed scope.
- An owning document, section, field, operation, or other surface may declare
  context once. Unqualified use is lawful when exactly one concept resolves.
  Zero or multiple applicable concepts fail closed; repository position,
  nominal match, actor familiarity, frequency, or recency cannot choose one.
- `GLOSSARY_GUIDE.md` is a non-deciding locator index, not a global default
  namespace. Each row points to a source clause that declares the context and
  owns the concept; the index declares neither. Another context receives a
  meaning only through an explicit relation.
- Cross-context import, disambiguation, directional translation, or equivalence
  identifies exact source and target concepts and contexts, relation kind and
  direction where material, preserved and changed meaning, loss, refusal,
  owners, bases, scope, provenance, lifecycle, and invalidation. It transfers
  no semantic or decision authority.
- The world-model context imports `Source Project`, `Product`, `Install`, and
  `Artifact` unchanged from the recursive taxonomy. `Builder Project` is a
  distinct exact target concept related to `Source Project` by a directional
  specialization that declares preserved and narrowed meaning, loss, refusal,
  owners, basis, scope, and invalidation. Glossary references remain indexes.
- Conformance covers positive unique-resolution and explicit-relation cases and
  negative collisions for `Frame`, `Owner`, `Product`, `Tenant`, and `User`.
  Correct output through an inferred or guessed meaning does not pass.

## Build-Tenancy Compression

- Build tenancy is STDO's `WHAT` once, independent `HOW` one-or-many
  realization model. The bound `what` remains singleton constitutional truth;
  `how.build_tenants` locates one or more project-owned realizations beneath
  it.
- Each build tenant may carry tenant-local design, tooling, code, proof,
  release, and lifecycle state. No tenant becomes a second constitution, and
  one tenant's evidence cannot close another tenant's claim.
- `how.build_tenants` canonically records tenant identities and locations.
  `how.common` carries only realization law explicitly adopted across more
  than one tenant. A Markdown tenant registry is a companion or projection, not
  a second authority.
- Tenant-local truth remains local. Similarity creates a commonization
  candidate, not shared law; promotion to `common/` requires the applicable
  design re-entry and preserves semantic ownership.
- An upstream-only work item needs no tenant ticket, and a single-tenant item
  needs no sibling. When one admitted upstream item has multiple tenant
  execution lines, retain the upstream ticket and create one suffixed ticket
  per tenant with `source_ticket`, `build_tenant`, independent status, proof,
  closure, reopening, and repricing.
- Build tenancy is not a synonym for hosted, runtime, customer, account, or
  data multitenancy. A downstream Product claiming those forms owns their
  separate identity, isolation, lifecycle, and proof law.

## Prime Operating Rules

- Do not create a second truth surface when a current authority surface exists.
- Keep active constitutional surfaces present-tense.
- Treat generated artifacts and summaries as read models unless admitted as
  source truth by the owning method.
- Missing traceability is a defect.
- Prefer one algebraic primitive plus projections over multiple local decision
  systems.
- When `DESIGN_MODULE_METHOD` is adopted for a new or materially changed
  semantic boundary, treat discovered functionality as input to design, not as
  pre-authorized operation identities. Derive a candidate Ontology, complete
  lifecycle and authority, run whole-family Prime, and then accept the Ontology
  before promoting IACS, public operations, schemas, or modules.
- The Ontology is semantic-design authority, not a replacement for target
  architecture or module design. Domain, sequence, state, authority, IACS, and
  public-contract surfaces preserve it; code and tests derive through
  requirements plus accepted design.
- Naming an admitter is not sufficient. State the complete admission relation
  for each consequential entity-transition domain — entity identity,
  predecessor basis, authority scope, candidate family, decision cardinality,
  admission predicate, durable result, supersession law. Singularity attaches to
  the relation, not one actor; quorum, multi-signature, step-up, and proxy are
  lawful when declared. A projection may produce a candidate but confers no
  admission authority, and reconstructed state is not self-authenticating.
- Disposition every equivalent competing path explicitly as a constituent, a
  replica, a replacement, or a deliberately independent realization of the
  admission law. Disposition does not mean deletion; an undisposed equivalent
  path is the defect, not the equivalence itself. Superseded responsibility
  remains subject to the retention relation below.
- For a material transition, each admission owner independently owns derivation
  and validation of the causally complete enclosing relation, including every
  relevant participant, equality join, and crossing seam, from one exact
  admission-valid basis.
  Basis continuity holds through admission: advancement after preflight causes
  a declared predecessor/currentness check or effect-free re-entry, and
  participating owners use an equal or design-declared coherent composite
  basis, never mixed independently valid bases. Every participant and join is
  validated before effect; the semantic commit is the complete transition,
  admitting all or none. Caller or owner assertions cannot establish this law.
- An owner may consume established facts whose exact subject, basis, scope,
  provenance and validity remain applicable, with recoverable production and
  invalidation. A function, component, role, conversation or status boundary
  alone requires no repeated derivation. Material mutation, rollback, changed
  authority/basis, expired validity or a real trust boundary triggers applicable
  validation. Reuse transfers no admission responsibility, omits no participant
  and supplies no separately required independent judgment.
- Direct and every supported composite or nested boundary preserve the same
  law; competing same-scope paths cannot bypass it, and fresh reconstruction or
  replay reproduces the exact relation, basis, and outcome or refusal. Qualify
  each owner and supported boundary for direct, supported composite/nested,
  forged, ambiguous enclosing relation, stale or preflight-advanced basis,
  incoherent multi-owner basis, competing same-scope authority,
  reconstructed/fresh-process, exact replay equality, and post-validation
  atomic failure. Exercise
  every materially distinct boundary capable of exposing a subset, unless a
  design-declared dominance/equivalence proof shows named observations cover
  the complete partial-failure surface, and follow each with fresh
  reconstruction. An indivisible unit is observed immediately on both sides;
  final-participant validation failure is not atomic-failure evidence.
  Case applicability follows the supported input/state and operating/threat
  model. An excluded threat alone creates no acceptance predicate or defensive
  work. Supported malformed inputs, stale state and effect checks remain;
  wider scope needs its owner's decision, not an existing test.
- For each material admission relation, accepted design compactly declares the
  owner and supported boundary; exact basis and continuity, including any
  coherent multi-owner basis; enclosing relation, participants, and joins;
  refusal/effect boundary; complete semantic commit unit and decomposability;
  every materially distinct post-validation partial-failure boundary, or a
  design-declared dominance/equivalence proof that named observations cover the
  complete surface; reconstruction; supported direct/composite/nested forms;
  and competing paths. Qualification is per owner and supported boundary;
  unsupported composite/nested forms require design-grounded `not_applicable`
  and no weaker or competing path. Missing or downstream-invented fields,
  inferred basis/boundary-coverage/reconstruction law, or helper-manufactured
  non-applicability falsifies the declaration.
- Declare the governing frames a material boundary derives from, its bounded
  affected relation set, and the seams crossing it. Frames form a constraint
  network; more than one governing frame is lawful. Every seam crossing the
  affected set must either include its causally relevant far-side relation or
  state why that relation cannot affect and cannot be affected by the action.
  A bounded local action conserves governing truth; changing a governing
  relation re-enters there.
- Design evidence is durable reasoning state for a bounded actor. The selected
  STDO basis plus accepted design must recover every governing relation in a
  proposed action's causally closed affected set and decide preserve, change,
  duplicate, or violate — without dialogue, commentary, prior-worker memory, or
  folklore. Design must not restate federal decision law to achieve this.
- The four decisions: `preserve` leaves the relation intact and operates inside
  it; `change` alters the relation and re-enters at it before acceptance;
  `duplicate` establishes an equivalent path explicitly disposed as constituent,
  replica, replacement, or deliberately independent realization; `violate`
  contradicts the relation or leaves an equivalent path undisposed. The
  change/violate boundary is the locus of acceptance, not the size of the delta.
  The duplicate/violate boundary is disposition, not equivalence.
- Declare a role set for every material realization component; capability is not
  authority. At a material boundary also project the domain design into data
  structures, algorithms, algebraic laws, and effect boundaries. That projection
  is subordinate: similarity yields a commonization candidate, never an
  adjudication. Materially non-equivalent identity, ownership, ordering,
  mutation, consistency, retention, failure, access, lifecycle, or authority law
  requires separation; a difference alone does not discharge Prime contraction.
- Project complete material producer-to-consumer paths: fact establishment,
  consumers, basis/invalidation, effects, alternatives and accumulated work,
  including material method/assurance operations. Local successes and different
  names cannot establish the complete-path claim. Declare the workload, growth
  and operational assumptions required by the outcome; bind Product-owned
  limits before qualification. Challenge representative supported paths and
  growth, observe work without repeating it to count it, and separate material
  startup, framework, external compute, transport and assurance costs. No
  universal resource quota, fixed complexity or accounting system follows.
- Dispose every material algorithmic obligation twice. Semantically it is an
  existing accepted relation, an extension of one, or a new candidate relation.
  In realization it is consume, implement locally, optimize, adapt, or
  deliberately duplicate under stated non-semantic constraints — isolation,
  substrate, performance, security, or dependency ownership. The rule is not
  that equivalent code is never rebuilt; it is that a local realization must not
  present an accepted semantic or authoritative relation as newly owned local
  truth.
- Before constructing a material generic capability, common mechanic, or
  algorithm, or selecting a material dependency, apply DMM `STDO-UP-023`
  proportionally. State the capability without Product, domain, module, vendor,
  file, or incumbent labels. Distinguish every irreducible semantic or authority-
  bearing relation and its owner, role kind, subject, scope, basis, lifecycle,
  and refusal invariants from generic mechanics and foundation capabilities.
  Compare credible project, native/standard, predecessor-lineage, maintained
  external, local, and mixed compositions across material total-lifecycle
  dimensions. Bound discovery by recording searched sources or categories,
  cutoff and version basis, applicability criteria, exclusions, predecessor or
  incumbent status, discovered candidates, and residual unknowns. A material
  discovery gap prevents selection; a later materially qualifying candidate
  invalidates the affected selection evidence. The comparison
  operates inside the Product boundary and any applicable migration strategy
  already admitted by their existing owners and does not displace SPEC's
  bounded-evolution versus fundamental-re-adoption decision. Hard authority,
  contract, safety, security, license, or constructability failure eliminates a
  candidate; unknowns remain unknown.
  One lawful composition dominates another only when every material dimension
  is comparable or evidenced as non-discriminating, it is no worse on every
  comparable dimension, and strictly better on at least one. A material unknown
  that could reverse the relation prevents dominance. A dominated candidate,
  including a local generic rebuild, cannot be selected unless new evidence or
  another material dimension invalidates the dominance relation.
  Select from the undominated frontier only through priorities and risk
  tolerances declared by the existing tradeoff owner for the exact Product and
  basis; if they do not resolve it, retain the gap. Reuse does not automatically
  confer or transfer authority. A foundation may realize an explicitly assigned
  authority-bearing role only while preserving the declared relation's owner,
  role kind, subject, scope, basis, lifecycle, and refusal invariants. Ownership
  follows the declared relation, not local authorship. A newly exposed material
  generic subproblem recursively re-enters selection. This prior pass is
  distinct from recurrence review.
- Apply the gate proportionally. An unchanged `realization_refactor` cites the
  accepted Ontology/design basis and proves no semantic delta. Re-evaluate only
  affected relations and projections, with no extra ticket or approval ceremony.
- Where `DESIGN_MODULE_METHOD` is adopted, co-evolution is admissible only when
  the complete material-relation set has no unresolved member, is jointly
  satisfiable, and admits no materially non-equivalent network under the
  governing Product, requirements, and accepted design relations. Neither mode
  is the global default. Design still owns structural `HOW`; otherwise the
  smallest causally closed affected set requires a prior design gate. Outside
  an adopted boundary, retain the generic no-unresolved-material-design-decision
  test. Design/implementation feedback carries evidence and falsification,
  never reverse semantic authority.
- Treat Ontology, Prime, IACS, views, modules, implementation, and tests as
  projections of that one decision-complete network. Headings, artifact
  presence, exact identity, and aggregate green labels cannot supply a missing
  semantic relation.
- IACS is not numerically frozen. Addition, removal, merge, or split proceeds
  through accepted Ontology/design re-entry. Re-derive and classify the complete
  set, rerun Promotion and Boundary Inflation over the full revised set, update
  every existing conformance/checker subject to the declared composite carrier
  relation, and reconcile implementation before closure.
  No concrete checker is required to exist. Prohibition without a lawful path,
  new-carriers-only gates, weaker assurance, or unreconciled implementation
  falsifies revision.
- Prime atoms are irreducible semantic-design relations. Apply contraction to
  the complete candidate semantic-atom family and all realization projections.
  Each accepted atom records its admitted domain and governs every admitted
  instance in it; every proposed realization projection maps explicitly to its
  accepted atom or atoms. Later cases compose or parameterize the atom rather
  than creating feature-local replacements.
- Method compression is a prompt input, not a replacement for the source method.
- Select one complete immutable STDO version; mutable source and mixed standard
  sets are not consumer authority.
- Proof identifies its exact property and nearest weaker excluded property.
  Semantic basis, evidence basis, and state projection remain distinct.
- Assurance supporting promotion or closure binds the exact subject and its
  authoritative composition relation. Per-file evidence cannot close a
  multi-file or carrier-set claim; cross-carrier satisfaction and conflict are
  decided at the declared composite boundary.
- Mechanical enforcement names an executable or reproducible predicate and a
  witness reachable through the declared ordinary assurance path. Planned or
  specification-only evidence is not observed verification. Absent that
  predicate or declared-path witness, the claim stays open or narrows to the
  planned property. Quantifier, population, and scope cannot outrun evaluated
  evidence; generalization requires a declared inference relation, comparable
  population, counterexample treatment, and governing evidence. Later
  counterevidence invalidates dependent verdicts until superseded, withdrawn,
  or requalified.
- Generic method sufficiency consumes the Probabilistic Work Boundary,
  `STDO-UP-020`, and Reconstruction Litmus. A fresh competent constructor works
  inside a declared capability/context/configuration envelope using only the
  declared ordinary method and authority surfaces. An independently authorized
  evaluator has a declared governing basis and comparison predicate. Where
  exposure compromises independence, material expected/reference outcomes,
  source exemplars/incumbents, author memory, and ad hoc rescue are withheld from
  the constructor until its result is frozen. After freeze, the evaluator
  compares that result against the mandatory governing semantic basis. Any
  separately held material expected/reference outcome, if one exists and is
  applicable, is optional evidence and explicitly non-authoritative; equivalence
  to it is required only where the governing basis requires it. A lawful
  alternative permitted by the basis passes, while subjective similarity to the
  basis or reference is insufficient to establish semantic conformance/
  equivalence. Byte/structural identity, unique derivation, determinism, and
  incumbent equality are not generic criteria. An out-of-envelope actor cannot
  indict the method. Post-exposure revision is a declared intervention and either
  a method constituent with its qualification boundary or a new qualification
  subject; it cannot retroactively pass the frozen run. Undeclared constructor
  competence, context, or configuration, undeclared supplemental method or
  authority input, undeclared evaluator authority, basis, or predicate, premature
  reference exposure, omission of the governing basis, constructor-authorized or
  self-adjusted comparison, reference-as-authority, reference equivalence required
  where the basis does not require it or omitted where the basis does,
  subjective-similarity proof, generic identity criteria, and unclassified
  revision falsify qualification. No fixed actor type/count, review round,
  engine, prompt, or orchestration follows.
- Product progress advances one explicitly selected unresolved Product-defined
  outcome instance with a declared acceptance interval. Acceptance ends that
  instance's progress authority while retaining prior witnesses as regression
  evidence; selecting the next already-defined outcome still requires explicit
  Goals/work sequencing. Evidence cannot select, enlarge, or replace its
  Product claim.
- An ODD constructive loop consumes that selected Product outcome as external
  authority. Models, gaps, assurance, ledgers, projections, edge closure, and
  next-action machinery cannot author, select, enlarge, or accept the outcome.
  Repricing requests re-entry; it does not perform re-entry or choose a
  successor outcome.
- Target binding and admitted construction intent preserve exact selected
  outcome and bounded-basis refs for causal replay. An unresolved
  `post_reprice` returns typed no-action until lawful re-entry separately admits
  a new basis.
- Within a Product-outcome-bearing wave, material realization growth requires
  the selected outcome, an admitted named bounded prerequisite to it, or an
  admitted named bounded experiment whose stated observation discriminates a
  stated decision for it. Admission or renewal belongs to the work-wave owner
  or explicitly bounded proxy and is durably recorded in existing Goals or
  ticket authority. Each prerequisite or experiment declares its provisional
  bound and terminal condition and cannot enlarge Product, authorize downstream
  work, confer promotion or closure, or waive applicable law. Acceptance of the
  outcome, discharge of the prerequisite, resolution of the experiment
  decision, another admitted terminal condition, exhaustion, rejection,
  withdrawal, supersession, repricing of the basis away, or falsification ends
  that authority. Evidence, active work state, prior admission, repair, or
  continuation cannot renew it;
  retained evidence, regression protection, or donor material does not inherit
  growth authority.
- Judge proportionality by semantic ambiguity removed versus effective
  reasoning complexity added, not by line or artifact count. Rival authority,
  failure classification, and evidence uncertainty count only as types or
  evidence of materially distinct admissible interpretations removed.
  Downstream implementation paths, runtime states, tests, reviews, and
  reconciliation joins are counterfactual evidence of that contraction, not an
  independent numerator. Do not prescribe internal agent procedure when its
  variation has no governed effect, and do not create per-clause rationale
  carriers.
- Apply proportionality to method execution itself. Repeated acquisition,
  hashing, context, activation, status, review and evidence work serves an
  identified change, decision or assurance need. Qualify its material
  operational assumptions through DMM; repetition does not establish validity
  or independence.
- For probabilistic or agentic construction, begin from a reconstruction-
  sufficient governing basis and execute the smallest coherent causal cone.
  Bind selected computational relations, construction and assessment authority,
  and re-entry conditions. Constructor self-review is not independent live-
  surface assessment.
- A bounded proxy may accept preservation, require local repair, reject a
  violation, and advance to the next already-authorized action. Product,
  requirement, governing-authority, or accepted-design changes re-enter at
  their owner. Routine advancement requires no renewed human ceremony when the
  delegation is already accepted.
- Disposition bounded candidates as `accept`, `local_repair`, `re_enter`, or
  `reject`. Conserve every governing relation affected by the local action;
  unrelated incompleteness is repricing input. Repeated failure against an
  unchanged boundary triggers reassessment without a numeric candidate or
  review-round threshold.
- Transition evidence binds the exact candidate, affected relations, changed
  and competing paths, proof, remaining seams, non-changes, and disposition.
  Use focused falsification during construction and whole-candidate proof at a
  declared boundary unless risk requires it earlier. A durable reconstruction
  claim needs loss or exclusion of incidental process state when same-process
  state is a material counterexample.
- Acceptance binds an exact checkpoint and permits the next already-authorized
  action without widening scope. Accepted material Product movement is
  progress; rejected or superseded work is churn; repeated proof is evidence;
  discovery of hidden distance revises forecast. No numeric progress algorithm
  is prescribed.
- One exact Writer grant may cover its declared construction/status/checkpoint
  sequence. Record actual role transitions and refresh changed bindings;
  unchanged status alone requires no new grant or rehash. Executive mutation
  restrictions remain. An unaccepted preservation checkpoint identifies its
  predecessor, territory, concurrent-writer disposition and durable evidence;
  it grants no acceptance or publication. A restart explains why retained
  repair is insufficient, surviving obligations/evidence and changed causal
  assumptions. Reconstructability does not select a restart or reconstruction
  at every use.
- Retire superseded production responsibility by default. Retention requires
  a supported obligation, owner, purpose, execution scope and material cost;
  temporary compatibility or comparison has an expiry/removal trigger. Test
  presence, oracle labels and nominal demotion do not justify duplication.
  Required cold reconstruction and independent test oracles may serve enduring
  distinct obligations. Identify the surviving obligation's owner, invent no
  replacement guard for an unsupported obligation, and defer no local retirement
  to unrelated whole-Product closure. Commonization must remove actual work
  from the selected path; names and deleted lines cannot prove contraction.
- When both strategies are lawful and feasible, bounded evolution is the
  rebuttable selection presumption when a working predecessor can reach the
  admitted outcome without competing or ambiguous authority. It never requires
  continuing an unsafe or inadmissible path. Fundamental re-adoption requires
  explicit human comparative selection and an abort or re-entry condition.
- Product-slice promotion requires singular authority across the full causal
  closure of its acceptance path but does not close an enclosing migration.
  Ticket and review wording cannot exclude causally applicable authority;
  competing authority, safety failures, retained-behavior regressions, and
  durable architectural decisions that foreclose an admitted Product outcome
  remain blocking. Other observations remain repricing input rather than
  automatic scope or ticket creation.
- Native constructability precedes design acceptance. Prime applies recursively
  and counts governance cost while conserving root authority.
- Apply an axiom family only where it is causally relevant to the selected
  outcome and affected published boundary. Cite unchanged accepted relations
  rather than reproving them; axioms do not authorize horizontal realization
  growth.
- Authority has identity and may be proxied only through an explicit bounded
  grant. Implementer self-review is not independent review.
- Exact-cut qualification declares the Product release subject, release-scoped
  claims, and excluded source state against one immutable annotated RC tag. A
  shared release source allocates one stable Project Release Namespace per
  independently released project and uses
  `refs/tags/<project>/v<version>-rc.<n>` for immutable cuts and
  `refs/tags/<project>/v<version>` for its mutable selector. The exact cut also
  binds the peeled commit and repository tree, Project Subtree root and tree,
  Product member inventory, and claim bytes; a monorepo tag does not make
  sibling subtrees Product members. Existing unqualified refs, tag objects,
  peels, links, and product-local public URIs remain unchanged. In particular,
  `stdo://releases/v<version>-rc.<n>/` never gains the Git project prefix.
  At publication, the qualified selector advances monotonically to the
  highest-ordinal published RC for that project and line; a lightweight,
  lagging, or backward selector is invalid. It is discovery, never exact
  authority. Consumer channel adoption refuses a same-line downgrade and is a
  separate two-invocation transition whose mutation requires the externally
  accepted exact plan digest. An intentionally older cut remains available
  through its exact immutable basis. Any qualifying-byte change requires a
  higher immutable RC; selector advancement adds no second final carrier or
  semantic review.
- An explicitly declared release-matched asset cohort may require one exact
  cohort version suffix across the STDO corpus, its distributed plugin, Axiom
  Indexer mechanics, STDO Representation, and the released `a_c.STDO` program
  and constraint map. Product cut names add `v`; embedded asset fields do not,
  and qualification requires exact suffix equality. Equal version text does
  not merge their Product identities or authorities. Any missing, differently versioned, stale, or
  source-digest-incongruent member blocks the cohort. Freeze STDO and plugin in
  commit A, create and install its annotated tag locally, derive and freeze the
  child Products and complete source-member/digest closure in commit B, qualify
  B before child tags, create the local tags and mutable refs, then re-run a
  mandatory local-ref-graph gate over every tag object, peel, target, version,
  and exact push ref. Fetch and bind expected remote OID or required absence for
  every destination: immutable tags are create-only, while every mutable ref
  uses an explicit per-ref compare-and-swap lease; then atomically publish that
  exact checked ref set in the same push.
  Remote drift or lease mismatch requires refetch and complete requalification;
  it never falls back to force or sequential publication. Unsupported atomic
  transport and any partial remote cohort refuse. Later bookkeeping cannot move immutable tags;
  historical backfill requires separately authorized recovery law, the exact
  historical source cut and same normalized version suffix, and complete
  remote verification. It cannot move the source tag, add Product bytes to its
  subject, pretend the original publication was atomic, or make this cohort law
  govern a cut older than the higher RC containing it.
- Agentic development conforms by following the constitutional process from
  declared authority, with produced artifacts passing deterministic admission. A
  walkthrough a competent agent using declared authority cannot complete is a
  method defect; agent error is not.
- Operational lifecycle signal is constitutional pressure. Product and
  requirements provide enough signal for downstream design, or name the gap.
  The canonical chain is: intent -> requirement -> build -> assurance ->
  release -> deployment -> live usage -> observed telemetry -> retirement.
- Design-module review confirms lifecycle signal at the realization boundary.
  Each phase is answered, declared not applicable with a reason, or recorded as
  `Gap:` / `Unanswered:`. Implementation precedent, prompt prose, local
  convention, and test fixtures cannot invent missing lifecycle authority.

## Reference Frame Engagement Compression

- Keep three owners distinct: `REFERENCE_FRAME_METHOD.md` supplies pure frame
  principles; `STDO_REFERENCE_FRAME_BASELINE.md` supplies an optional role and
  evaluation profile; each Product owns its concrete Project Reference-Frame
  Basis under `SPEC_METHOD.md`. Profile availability, Product adoption, and
  execution-scoped activation are distinct.
- A reference frame is one finite, capability-bounded evaluation context. It
  binds evaluation family, exact subject/basis, material relations, coordinates,
  invariants, semantic/evaluation/decision authority and operation authority
  where material, evidence, exclusions, closed results, invalidation, actor
  capability, and only the cross-frame relations actually used.
  Operationally it is an evaluation contract defining finite attention scope.
  A prompt, context packet, symbolic program, or other representation projects
  an activation; it does not become the frame or create its authority. The pure
  method supplies a complete prose activation binding and worked Product-chain
  drift example, so no representation Product is required.
- The optional baseline supplies twelve generic specialist-frame families:
  Product, Product Composition, Design, Design Component, Public Boundary,
  Entity, Operator, Owner, Effect, Reuse/Foundation, Install, and Proof. For the
  exact outcome, each family is instantiated where material, evidenced as
  non-material by capable authority, or retained as an explicit residual.
  These are evaluation families, not required actors, stages, components,
  files, services, runtime types, or new semantic owners. Product Composition
  evaluates directed Product roles and governing contracts; executable
  Integration remains a distinct Product-testing frame.
- Generic-frame coverage records the union of admissible observations, while a
  composite claim is satisfied only through a declared conjunction satisfying
  every applicable constraint. Material seams preserve or lawfully translate
  identity, coordinate/basis, value/evidence, lifecycle, authority, and
  provenance. Missing or non-commuting seams return closed pressure rather than
  selecting a dominant frame.
- The pure method imports no consumer profile, role mapping, Product binding,
  runtime topology, adoption relation, or discovery provenance. Applications
  may declare external profiles and bindings under their own authority;
  same-spelled carriers are not enrolled by label.
- Frame disjointness, separately activated evaluation, and claim-relative
  assurance independence are distinct. Frames may overlap, refine, restrict,
  translate, compose, or succeed one another. Hierarchy is optional. Shared
  entities or equal-looking values do not collapse coordinates, meaning,
  evidence, or authority.
- A state-value change preserves topology only when every material entity,
  relation, lifecycle, authority, capability, adjacency, and seam is preserved;
  otherwise the activation requires topology recharting.
- The baseline result family is `satisfied`, `falsified`, `indeterminate`,
  `out_of_frame`, or `invalid_basis`. Missing context, evidence, authority, or
  capability cannot be converted to satisfaction.
- Coverage is relative to an exact workspace, governed outcome, basis, known
  evaluation inventory, frame set, and time. It covers material interactions,
  semantic/operation/decision authority, failure, capability, separately
  activated overlap, assurance independence, or explicit residuals; file,
  artifact, test, review, or actor count is not coverage.
- Existing Goals, Product, requirements, or accepted-design authority owns the
  Project Reference-Frame Basis: method/profile basis, frames, actor-binding
  rules, capability/grant requirements, scopes, result and coverage relations,
  lifecycle triggers, and invalidation. The Product Definition only locates
  that binding.
- The practical STDO profile maps Executive, Worker, and Reviewer frames onto
  existing law: Executive uses existing project or bounded-proxy decision
  authority; Worker is the `STDO-UP-020` constructor; Reviewer supplies the
  independent live-surface evaluation governed by `STDO-UP-007` and
  `STDO-UP-022` where `STDO-UP-020` requires it. The profile creates no peer
  execution, review, disposition, checkpoint, or continuation law.
- The accepted frame configuration permits direct Writer entry when one
  capable context and exact grant suffice. Coordinate material dependencies,
  authority, context or capability boundaries and preserve applicable
  independence. Role names do not add a ticket, Executive or review gate.
  Executive may not mutate files or Git; the same actor first changes into a
  separately bound Writer activation. This creates no new authority or
  independence.
- Owning applicability predicates select required evaluations: true requires
  an exact valid result, false excludes only that obligation, unknown remains
  unresolved. A caller's frame list or family availability proves no coverage.
  Missing/wrong-subject mandatory results and conflicts cannot satisfy a
  conjunction; preserve every constraining observation. No universal budget,
  benchmark or measurement gate is introduced.
- Executive owns attention management, evaluation orchestration, and
  authorized-action selection inside its existing grant. It maintains the
  exact outcome/basis, Product-role map, evaluation inventory, smallest finite
  dependency-ready frontier, closed-result ledger, and residual boundary. It
  activates independent evaluations, consumes only closed results or declared
  translations, applies declared conjunctions, and selects only the next
  already-authorized action. It does not load every frame or inherit their
  undocumented working contexts.
- Executive attention is event-driven by default: decision-relevant closed
  results, material exceptions or changed basis, owner requests, and declared
  deadlines or checkpoints reopen attention. When no other authorized decision
  is ready, wait while Workers act within grants; do not replay unchanged
  judgments or inspect unfinished work without a decision need. Preserve drift
  locks, current-workspace/evidence validity, required independence, closed
  returns and closure duties. Bounded
  fallback observation serves unavailable/unreliable notification or an actual
  supervision obligation; declare its purpose, cadence/checkpoint, evidence
  target and stop/escalation condition. Silence proves neither progress nor
  failure. Handle genuine blockers and risks within grants; repeated no-progress
  without new evidence requires bounded reassessment and decision, not polling
  or unchanged repair loops. No lower assurance, reduced required capability
  or universal cost/accounting gate follows. See
  `STDO_REFERENCE_FRAME_BASELINE.md#event-driven-executive-attention`.
- Executive sequences delivery around an early real end-to-end steel thread,
  extending existing paths and selecting increments by consequential
  uncertainty, dependency/interface reach, and failure impact. Integration
  evidence prunes incompatible choices and settles exercised interfaces;
  unexercised paths retain their proof obligations. Use focused deterministic
  regression, module-law checks, and judgment probes during construction;
  schedule substantial UAT near release or for a bounded capability complete
  enough to qualify. Testing frames govern claims, scenarios, independence,
  and repetitions; reuse valid evidence and rerun affected assurance on
  material invalidation. See
  `STDO_REFERENCE_FRAME_BASELINE.md#steel-thread-delivery`.
- Intake triage triangulates candidate diagnoses through applicable frames over
  the same subject and basis. Their distinct material variables, governing
  relations and evidence constrain the supported cause and smallest lawful
  repair scope. Preserve unresolved alternatives; duplicated analysis under
  different frame names adds no evidence. Use the smallest sufficient frame
  configuration, preserve required independence, and infer neither a new review
  round nor repair authority. See `SPEC_METHOD.md#universal-intake-triage`.
- Reviewer owns evidence-bound technical triage for its exact finding: affected
  claim, severity, causal assessment and confidence, blast radius, workaround,
  repair complexity and regression risk, and residual uncertainty where
  supportable. It assigns no priority, promotion-boundary effect, disposition,
  repair, or continuation. Its payload projection is total: `satisfied` carries
  an explicit no-finding state; `falsified` carries findings and supported or
  explicitly indeterminate triage; `indeterminate` carries the evidence gap;
  `out_of_frame` carries an evaluated claim's missing material relation or
  capability with indeterminate triage and reconfiguration pressure; and
  `invalid_basis` carries basis-repair pressure with triage not applicable. An
  adjacent outside-claim observation is returned separately and does not
  replace the exact claim result.
- Findings and affected acceptance predicates bind a violated property,
  supported entry/state, governing operating/threat model and credible causal
  path. Excluded threats give no retention claim; hypothetical hostility and
  internal location alone establish neither applicability nor trust. A repair
  proposal acquires obligation only through its owner.
- Executive consumes that technical triage with the complete Product view and
  current MVP or release mandate. It assigns priority, determines the effect on
  the current promotion boundary, applies exactly one existing `STDO-UP-020`
  disposition, and selects only an already-authorized next action. Severity,
  priority, frame result, boundary effect, and disposition remain distinct.
  The Product-owned Project Reference-Frame Basis binds the scales, cutoff, and
  non-waivable hard stops; the profile imposes no universal numeric scale.
- Product-chain drift locks keep Source Project, Product Definition, candidate
  checkpoint, Release Cut, Product, Install, Artifact, dependent Product, and
  directed composition-edge identities and authorities distinct. A
  Development Product is a role binding over one exact Install of a released
  Product acting as builder substrate, not a new Product identity or a source
  of meaning for the Product being authored. Exact review checkpoints and
  Products remain immutable under their lifecycle law; that immutability does
  not make the mutable Source Project immutable. Changed outcome, basis,
  Product role, authority, coverage, or return topology refuses, invalidates,
  or re-enters rather than enlarging the Executive frame.
- For work requiring coordinated engagement, Executive attempts Worker activation; an
  activation refusal returns directly to Executive and creates no Worker result;
  after lawful activation, `satisfied`, `falsified`, `indeterminate`, and
  `out_of_frame | invalid_basis` map exclusively to `candidate_ready`,
  `refused`, `incomplete`, and `re_entry_requested`. Its Worker result returns
  to Executive. For a candidate, Executive either dispositions directly when
  independent review is not required or activates Reviewer, receives the closed
  review result, and then applies exactly one existing `STDO-UP-020`
  disposition.
- Worker supplies an exact candidate but never activates Reviewer. The Worker
  label grants no mutation authority. An effectful Worker may mutate only the
  exact subject and write territory named by its inherited owner grant;
  missing, ambiguous, or out-of-territory authority refuses. Self-review is not
  independent review. Reviewer returns one Reference Frame Method result with
  its evidence, findings or explicit no-finding state, technical triage where
  applicable, residuals, and invalidation conditions. It does not edit, direct
  repair, apply an STDO disposition, or authorize continuation. Executive
  cannot exceed its existing grant or become another semantic, operation, or
  implementation owner.
- Worker read scope follows the causal cone within its access grant, while
  effects remain confined to write territory. Inspect material producers,
  consumers and owners; return cross-territory repairs to their owners.
- Mechanical document checks protect declared structure and digest congruence;
  they do not supply semantic truth or replace a capable source-linked
  Reviewer result.
- The minimum activation packet carries frame identity/revision, evaluation and
  result algebra, exact subject/basis, material specialist frames and
  invariants, semantic/evaluation/decision authority and operation authority
  where material, actor capability, separate-activation and assurance-
  independence conditions, admissible evidence and acquisition path,
  exclusions, input and output relations, and invalidation/stop/re-entry
  conditions.
- Method qualification covers declaration, activation, every evaluation result,
  conjunction conflict and basis mismatch, translation preservation/loss/
  refusal, interaction and semantic/operation/decision-authority coverage,
  topology/capability/evidence revision, result consumption, material
  composition, activation refusal, and the closed Worker-result mapping. One
  valid frame set or coverage result cannot prove the unevaluated function
  population.

## Product Testing Frame Compression

- When a project adopts the optional STDO baseline for Product assurance,
  assign claims by fan-out rather than hierarchy: user outcome to UAT, runnable
  causal path to E2E, composition boundary to integration, and module-owned law
  to unit; then bind the distinct results through a declared conjunction to
  Product or release disposition.
- UAT and E2E evaluate an exact deployed, installed, or otherwise runnable
  Product form. UAT proves only that the declared user can obtain the claimed
  outcome through supported ordinary surfaces. E2E proves the complete
  authoritative causal path. Correct output through a forbidden path falsifies
  E2E, and harnessed substitutes cannot prove a boundary claimed as live.
- Integration proves one declared participant composition and interaction
  population. A substitute proves only its explicitly narrower equivalence
  claim.
- For material cross-interface outcomes, the derived composite at
  `STDO_REFERENCE_FRAME_BASELINE.md#derived-end-to-end-interface-integration-frame`
  separates contract sufficiency, boundary congruence, path realization and
  user usability. It refines existing families, not their counts or authority.
  Bind actual participant context, functional domains and temporal meaning,
  lawful translations, current workspace and callable path; retain candidate
  output distinct from admission, owner facts distinct from semantic judgment
  and reserved rulings, and cause-preserving diagnostics. Design-only evidence
  cannot claim runtime/UAT success, and validator-aware fixtures cannot prove
  ordinary LLM usability. Adequate candidate interfaces may lawfully refuse;
  the owning section sets claim-relative evidence, qualification and residuals
  without a universal gate or exhaustive-hardening prerequisite.
  Its computational whole-path refinement composes Operator, Owner,
  Reuse/Foundation and Proof for material composition/recurrence. Return an
  identifiable result over fact production/consumption, invalidation, effects,
  alternatives and total work; local green cannot replace it. Actual work
  claims need selected-path observations, and changed path/basis/workload
  reactivates affected assessment. No permanent actor, per-helper review or
  additional family follows.
- Every coded module retains its DMM-owned module-derived unit lane. Unit
  evidence proves module-owned laws, including public module contracts;
  internal combinatorial complexity determines evidence volume and strategy,
  not eligibility. Unit evidence cannot close Product, runnable-path,
  composition, user, or release claims.
- Coverage retains the exact claim, subject, path, population, oracle,
  interaction strength, residual combinations, and invalidation conditions.
  Test count, assertion count, source coverage, and aggregate green are not
  broader assurance.
- Technical-debt erasure evaluates two finite graphs. Production closure
  excludes obsolete, bypass, fallback, and rival paths from the exact runnable
  Product and configuration. Assurance/source closure prevents obsolete
  consumers, fixtures, proof scripts, generators, mutations, or tools from
  falsely supplying evidence or reintroducing the removed Product path. A
  declared test-only seam is lawful when isolated from Product distribution and
  ordinary-path evidence.
- Assurance subject acquisition and evaluation remain distinct. Acquire
  Product, runtime, lifecycle, admission, replay, and projection truth through
  the exact runnable owner surface. Then evaluate it with an independently
  law-derived oracle. Generic assurance may compare bytes, digests, order,
  equality, membership, completeness, and conjunction over owner-issued
  evidence; it may not reconstruct a rival owner state from raw payloads,
  events, logs, labels, or implementation fragments. A missing owner projection
  is a gap, not permission for proof code to become another semantic owner.
- Return a counterexample to its causally minimal supported frontier, not merely
  the first logged failure. Represent one unique locus, a jointly established
  incomparable set, unresolved alternative frontiers, or `indeterminate`
  evidence. Localization does not authorize wider testing, compatibility repair,
  another controller, or reinterpretation of unchanged upstream law.

## Prompt-Relevant Rules

- A prompt is rendered contract code over typed authority. It is not source law.
- Prompt text must project current authority refs, obligations, contracts,
  boundaries, proof expectations, and fallback conditions.
- Prompt bodies must not carry historical workaround prose unless the current
  requirement, design, runtime, or test still needs that constraint.
- Raw method documents are fallback inputs when this compressed authority is
  stale, missing, or insufficient for a named unresolved method question.

## Re-Entry Compression

- `goal_reprice`: current work-wave focus changes.
- `intent_reprice`: direction or scope changes.
- `product_reprice`: product shape changes while intent stays stable.
- `requirement_reprice`: constitutional requirement truth changes.
- `design_reframe`: realization structure changes while requirements stay stable.
- `realization_refactor`: local realization changes with no upstream change.

## Proof Compression

Closure requires authority trace, realization proof, negative proof where drift
is plausible, and a present-tense statement of residual open pressure.
