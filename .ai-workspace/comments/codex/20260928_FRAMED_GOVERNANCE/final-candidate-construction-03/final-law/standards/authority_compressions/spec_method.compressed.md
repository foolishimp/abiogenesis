---
kind: authority_compression_asset
asset_ref: authority-compression://stdo/spec-method/v1
source_ref: ../SPEC_METHOD.md
source_digest: 7f12d32ef4e5720d5d59ee5ace50de6c1a12cc56afa53dd67a8ee4c54f8fb8a4
compression_profile: prompt_authority_compact_v1
target_prompt_families:
  - transform
  - evaluate_design_depth
  - evaluate_review_grade
generated_by: codex
generated_at: 2026-09-30
stale_if_source_digest_changes: true
---

# SPEC_METHOD Compressed Authority

## Governing Claim

Specification defines product truth. Downstream surfaces implement, prove, or
project that truth; they do not replace it.

Products, applications, modules, graph functions, build tenants, and runtime
surfaces are implementations of constitutional documents, not substitutes for
them.

Method vocabulary names normative capabilities and relations. It does not
select a downstream repository, package, vendor, Product, or concrete
implementation. Constitutional examples therefore demonstrate enabled
capabilities through neutral identities rather than consumer precedent.

This asset projects `SPEC_METHOD.md` only. It is standalone for SPEC-owned
decisions, including `STDO-UP-022`, but cannot close DMM-owned IACS revision.
For that decision, route to the digest-current DMM source or compression, or to
the aggregate STDO compression.

## Intake Triage Compression

- Intake triage triangulates candidate diagnoses through the smallest sufficient
  applicable frame configuration over the same subject and basis. Distinct
  material variables, governing relations and evidence constrain cause and lawful
  repair scope; duplicated analysis adds no evidence. Preserve uncertainty and
  required independence. Diagnosis neither grants effects nor requires changing
  sufficient law. See `SPEC_METHOD.md#universal-intake-triage`.

## Recursive Product Taxonomy Compression

- Source Project, Product Definition, candidate checkpoint, Release Cut,
  Product, Install, Artifact, and dependent Product retain distinct identities;
  Development Product is a role binding over one of those exact Installs.
- A Development Product is one exact Install of a released Product acting as
  builder substrate for a Source Project. The role creates no Product identity
  and transfers no meaning or authority to the Product being authored.
- Every directed Product-composition edge retains its source and target roles,
  authority, contracts, lifecycle, evidence boundary, refusal, and
  invalidation law. Repository nesting, shared actors, code, or outputs create
  no edge.

## Product Definition Overlay Compression

- Every STDO-defined product publishes one `stdo_<label>.json` definition per
  distinct current `WHAT`; `stdo_default.json` is the singleton default.
  Multiple build tenants realizing one `WHAT` stay in that definition.
- `product.definition_id` is the stable identity of the mutable `WHAT`
  definition line, not an immutable Product or release identity. Successive
  releases retain their own Product and release identities; a fork or
  independently governed definition receives another definition identity.
- The definition is a layout-neutral identity, locator, relation, discovery,
  collective-frame-basis, work-carrier, and composition overlay. It does not
  restate or replace the meaning owned by referenced authority.
- `constitution.stdo` separates transport source and mutable version-line
  latest-published discovery from the operative immutable release URI and
  installed-manifest digest. A lagging channel or same-line channel downgrade
  fails closed; an intentionally older exact basis remains lawful.
  `constitution.additional_authorities` locates every other
  constitutional set; each `constitution.entrypoints[]` route names its basis.
  The complete selected set makes axioms, ontology, epistemology, taxonomy, and
  semantics recoverable. Those are sufficiency dimensions, not five required
  files or folders.
- Local axioms, overrides, and disambiguations name their carrier, governing
  authority, target where applicable, selected basis, and exact scope. Each
  disambiguation also binds the exact term, target bounded context, complete
  material candidate set, and one selected member of that set. Listing a local
  file does not mint authority or supply meaning.
- `reference_frame_bases` is non-empty and locates Product-owned Project
  Reference-Frame Basis declarations, every admitting authority, and their
  exact scopes. The pure Reference Frame Method supplies principles and an
  optional profile supplies mappings; neither selects a Product binding.
  Profile availability, Product adoption, and execution-scoped activation are
  distinct. The durable basis binds actor-binding rules and capability/grant
  requirements; an authorized work instruction binds a particular actor to an
  applicable frame, evaluation, subject, capability envelope, and operation
  grant. The overlay neither contains the binding nor registers actors or
  temporary activations. Product or runtime types named `Frame` remain `WHAT`
  or `HOW`; a matching label does not enroll them in the collective evaluation
  frame set. A source-linked prose starter is provided by
  `templates/PROJECT_REFERENCE_FRAME_BASIS_TEMPLATE.md`; it projects this law
  but supplies no authority. When a governed outcome crosses a Product chain,
  the basis keeps Source Project, Product Definition, candidate checkpoint,
  Release Cut, Product, Install, Artifact, and dependent Product identities
  distinct, records Development Product as a role over an exact Install, and
  binds every directed composition edge to its source and target roles,
  authority, contracts, evidence, lifecycle, refusal, and invalidation.
- `what` locates Intent, Product, and specification. `how` locates shared
  realization law and one or more build tenants. `ticketing` locates Goals,
  ticket lanes, comments, and optional sprints. Each `composition` edge binds
  the target definition locator and expected `product.definition_id`, the
  directed relation authority, and a non-empty governing contract set.
- Discover `stdo_*.json` recursively inside the selected workspace while
  pruning the exact VCS, dependency, generated, cache, and managed-store names
  declared by the source method; refuse symlinked definitions. Directory
  nesting creates no inheritance, ownership, or composition.
- Install immutable cuts once in a shared versioned store. A logical
  `stdo://releases/...` URI plus deterministic installed-manifest digest is the
  Product Definition's exact basis; a machine-local store path and registry are
  derived resolution state. Managed entries must be physical and exact;
  redirections, special entries, and undeclared entries of any type fail closed.
  `sync` installs only that pinned basis. `adopt --dry-run` emits a digest over
  current definition bytes and the exact cut/tag/commit/tree/manifest target;
  the target must be the highest-ordinal published RC and cannot be a same-line
  downgrade. Mutation requires and re-derives that externally accepted digest.
  Fleet adoption requires its aggregate plan digest. Agent files contain only a
  marker-bounded discovery bootstrap whose relative targets are confined to
  resolved `product.source_project`; fleet bootstrap preflights all targets and
  additionally confines every source project to its authorized root. Exactly
  one ordered marker span is manager-owned, while prefix and suffix bytes remain
  exact project-owned bytes.
- A separate complete consumer update binds one selected definition and the
  complete companion population of one exact declared cohort. The owner selects
  every native route and derived context in its claimed scope; an empty list is
  a selection, not a discovered absence. Existing composition and upstream
  release records retain authority; the invocation plan is no new registry.
  Its separately accepted digest binds exact cohort/member identities, physical
  destinations, preimages, replacement locators and source observations.
  Possessing the digest grants no effects. Re-derive it before application,
  stage and verify immutable installs, and recheck consumer preimages/sources.
  Change only selected basis/schema, existing composition locators/contracts and
  native/install links. Missing, stale, ambiguous or unavailable derived-source
  evidence withholds the complete update before consumer effects and returns
  semantic re-authoring to its owner. Freshness is not semantic assurance.
  Verify every selected resulting relation before claiming completion. A caught
  failure restores affected consumer preimages; unused immutable installs may
  remain. Application needs exclusive consumer write scope and claims no
  multi-path crash atomicity; abrupt loss or unavailable rollback needs owner
  recovery from presented preimages. Narrow `adopt`, `sync` and fleet contracts
  remain distinct.
- Portable Draft 2020-12 JSON Schema proves structural shape. URI formats are
  annotations unless an assertion-capable validator is selected, so
  conformance separately asserts RFC 3986 syntax, resolution, target identity,
  selected-release identity, cross-file uniqueness, constitutional sufficiency,
  semantic-resolution completeness, and authority congruence. Parse every
  `stdo:` schema locator case-insensitively before loading and require its cut to
  equal the operative basis cut.

## Bounded-Context Semantic Isolation Compression

- A term is a lexical label, not a context-free concept identity. Resolve each
  material occurrence through `(term, bounded-context identity, owning
  authority, selected basis, governed scope)`.
- An enclosing owning surface may declare context once. Unqualified use is
  lawful when the coordinates resolve exactly one concept. Zero or multiple
  applicable concepts fail closed; nominal match, familiarity, recency, file
  proximity, or a glossary fallback cannot choose one.
- The glossary is a non-deciding locator index, not a global namespace. Each
  record points to an exact source clause that declares its context and owns
  its concept. A record applies only when selected by the occurrence's semantic
  address or explicitly imported into the target context.
- Cross-context use requires an owner-authorized import, disambiguation,
  directional translation, or equivalence relation identifying exact concepts
  and contexts, direction where material, preserved and changed meaning, loss,
  refusal, owners, bases, scope, provenance, lifecycle, and invalidation.
  Translation does not transfer authority; identical spelling does not prove
  equivalence.
- A specialization is a directional translation that preserves cited source
  meaning while narrowing admissible instances or adding target-context
  constraints. It declares the exact target, exclusions, and absence or law of
  an inverse; the label `specialization` alone establishes nothing.
- Conformance includes positive unique-resolution and explicit-relation cases
  plus collisions for `Frame`, `Owner`, `Product`, `Tenant`, and `User`.
  Correct behavior reached through guessed meaning is non-conformant.

## Build-Tenancy Compression

- Build tenancy is the STDO realization model: one bound constitutional `WHAT`
  has one or more independently bound `HOW` realizations. One tenant is the
  singleton case; multi-build-tenancy begins above one.
- A build tenant may own tenant-local design, tooling, code, proof, release, and
  lifecycle state. It remains derivative and cannot become a rival project
  constitution.
- `how.build_tenants` is the canonical Product-bound tenant identity and
  location registry. `how.common` carries only realization law explicitly
  adopted across more than one tenant. `build_tenants/`,
  `build_tenants/common/`, and tenant-local ADR paths are default scaffold
  locations only.
- A separate `TENANT_REGISTRY.md` may be a companion or generated projection,
  but cannot become a second tenant-identity or location authority.
- Build tenancy does not imply hosted, runtime, customer, account, or data
  multitenancy. A Product claiming those forms defines their identity,
  isolation, lifecycle, and proof obligations separately.

## Prompt-Relevant Rules

- Start with the highest live authority surface needed for the question.
- Do not use README, bootstrap, comments, tickets, or run history as product
  truth when Product, requirements, or design already decide the matter.
- If a prompt needs upstream ambiguity, name the unresolved authority gap before
  reading fallback context.
- Active specification should stay present-tense; historical comparisons belong
  in comments, design history, tickets, or release notes.
- Missing requirement, design, proof, or traceability is pressure, not success.
- Product and requirement surfaces must provide enough operational lifecycle
  signal for downstream design, or record a named gap. The canonical lifecycle
  chain is: intent -> requirement -> build -> assurance -> release ->
  deployment -> live usage -> observed telemetry -> retirement.
- Downstream design must not fill missing lifecycle truth from implementation
  precedent, prompt prose, local convention, or test fixtures.
- Select one complete immutable STDO version. Mutable source, partial standard
  sets, compressions, and installed mirrors do not create another constitution.
- Within their scope, derived instructions preserve source applicability,
  obligations, permissions, exclusions, owners and invalidators. A correct
  digest cannot qualify a projected prohibition's lost condition or lawful
  alternative. References must be resolvable by the declared actor or required
  content is supplied directly. Changed
  native guidance needs source-derived ordinary-use qualification; semantic
  agreement cannot establish mechanical or operational claims.
- Identify the exact proof target and its nearest weaker excluded property;
  never substitute packaging, presence, or local green for a stronger claim.
- Keep semantic basis, evidence basis, and state projection distinct.
- Assurance supporting promotion or closure binds the exact claimed subject
  and authoritative composition relation. Per-file or per-carrier evidence
  cannot close a multi-file or carrier-set claim; cross-carrier satisfaction
  and conflict are decided at the declared composite boundary.
- Mechanical enforcement names an executable or reproducible predicate and a
  witness reachable through the declared ordinary assurance path. Planned or
  specification-only evidence is not observed verification. Absent that
  predicate or declared-path witness, the claim stays open or narrows to the
  planned property. A verdict's quantifier, population, and scope cannot outrun
  evaluated evidence. Generalization requires a declared inference relation,
  comparable population, counterexample treatment, and governing evidence;
  later counterevidence invalidates dependent verdicts until supersession,
  withdrawal, or requalification.
- Qualify generic method sufficiency by consuming the Probabilistic Work
  Boundary, `STDO-UP-020`, and Reconstruction Litmus. A fresh competent
  constructor works inside a declared capability/context/configuration envelope
  using only the declared ordinary method and authority surfaces. An
  independently authorized evaluator has a declared governing basis and
  comparison predicate.
  Where exposure compromises independence, withhold material expected/reference
  outcomes, source exemplars/incumbents, author memory, and ad hoc rescue from the
  constructor until its result is frozen. After freeze, the evaluator compares
  that result against the mandatory governing semantic basis. Any separately held
  material expected/reference outcome, if one exists and is applicable, is
  optional evidence and explicitly non-authoritative; equivalence to it is
  required only where the governing basis requires it. A lawful alternative
  permitted by the basis passes, while subjective similarity to the basis or
  reference is insufficient to establish semantic conformance/equivalence.
  Byte/structural identity, unique derivation, determinism, and incumbent equality
  are not generic criteria. An out-of-envelope actor cannot indict the method.
  Post-exposure revision is a declared intervention and either a method
  constituent with its qualification boundary or a new qualification subject;
  it cannot retroactively pass the frozen run. Undeclared constructor competence,
  context, or configuration, undeclared supplemental method or authority input,
  undeclared evaluator authority, basis, or predicate, premature reference
  exposure, omission of the governing basis, constructor-authorized or
  self-adjusted comparison, reference-as-authority, reference equivalence required
  where the basis does not require it or omitted where the basis does,
  subjective-similarity proof, generic identity criteria, and unclassified
  revision falsify qualification. No fixed actor type/count, review round,
  engine, prompt, or orchestration follows.
- Product progress is measured against one explicitly selected unresolved
  Product-defined outcome instance with a declared acceptance interval.
  Acceptance ends that instance's authority to select later progress while its
  witnesses remain regression evidence and enduring or recurring obligations
  remain live. Selecting the next already-defined outcome is Goals/work
  sequencing, not Product reprice.
- Evidence evaluates its bound Product claim; completion of a proof surface,
  matrix, inventory, design artifact, or test suite cannot select, enlarge, or
  replace that outcome.
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
  further material work requires a new admission. Retained evidence,
  regression protection, or donor material does not inherit growth authority;
  consumers own disposal and salvage mechanics.
- Judge proportionality by semantic ambiguity removed versus effective
  reasoning complexity added, not by line or artifact count. Detail is lawful
  when it contracts rival interpretations; duplicate truth and reconciliation
  paths are not.
- STDO intentionally constrains admissible reasoning and realization, but each
  constraint identifies the semantic ambiguity it removes. Rival authority,
  failure classification, and evidence uncertainty count only as types or
  evidence of materially distinct admissible interpretations removed; they are
  not independent proportional benefits. Do not prescribe an internal search,
  decomposition, collaboration, tool, or synthesis procedure when its variation
  cannot affect a governed property. One owning law may justify a coherent
  constraint family; do not create a per-clause rationale carrier.
- For bounded symbolic design, materially divergent implementation paths,
  runtime states, tests, reviews, and reconciliation joins are counterfactual
  evidence of semantic alternatives contracted, not an independent numerator.
  Increased agent capability may enlarge the relation resolved; it does not
  grant authority, weaken invariants, or waive acceptance.
- Where `DESIGN_MODULE_METHOD.md` applies, co-evolution requires its complete
  decision-completeness predicate; otherwise accept the smallest causally
  closed affected design set before retained implementation establishes an
  unresolved, contradictory, or materially non-equivalent relation. Outside an
  adopted boundary, retain the generic no-unresolved-material-design-decision
  test.
- Prioritize fast Product feedback under that same relation; this is not a
  global scheduler or fixed execution sequence.
- For a material admission, each owner independently owns derivation and
  validation of the causally complete enclosing relation and binds one exact
  admission-valid basis through validation and admission. Basis advancement
  causes effect-free re-entry;
  participating owners use an equal or declared coherent composite basis. All
  participants and joins validate before effects, and the complete transition
  is one semantic commit: complete or none, never a subset. Caller assertions,
  mixed bases, partial results, and competing same-scope paths cannot establish
  truth.
- Consume established facts when exact subject, basis, scope, provenance and
  validity apply and their production/invalidation are recoverable. Function,
  component, role, conversation and status boundaries alone require no repeated
  derivation. Material mutation, rollback, changed authority/basis, expired
  validity or a real trust boundary triggers the applicable validation. Reuse
  transfers no admission responsibility and supplies no required independent
  judgment; unsupported prior-success assertions remain insufficient.
- Qualify every owner and supported boundary with direct, supported
  composite/nested, forged, ambiguous enclosing relation, stale or preflight-
  advanced basis, incoherent multi-owner basis, competing same-scope authority,
  fresh-process reconstruction, exact replay equality, and post-validation
  atomic-publication cases. Exercise every materially distinct boundary capable
  of exposing a subset, unless a design-declared dominance/equivalence proof
  shows named observations cover the complete partial-failure surface, and
  follow each observation with fresh reconstruction. An indivisible unit is
  observed immediately on both sides. Unsupported composite/nested forms
  require design-grounded non-applicability and no weaker path. Final-
  participant validation failure is not atomic-publication evidence.
  Case applicability follows the supported operating/threat model; an excluded
  threat creates no acceptance predicate. Supported malformed inputs, stale
  state and effect boundaries retain their checks; scope changes need their
  owner and cannot be inferred from a test.
- For probabilistic or agentic construction, execute one bounded causal cone
  from a reconstruction-sufficient governing basis supplied by `STDO-UP-016`
  through `STDO-UP-019`. Identify the affected relations, selected computational
  dispositions, delegated construction and assessment authority, and upstream
  re-entry conditions. Do not rely on dialogue, commentary, worker memory, or
  folklore as that basis.
- The constructor owns bounded implementation and self-review. Where
  independent assessment supports promotion, the assessor verifies the exact
  live code, authority paths, proof, and installed subject. A constructor
  summary is not independent evidence. This separates roles without prescribing
  actor count, model, prompt, tool, process topology, or orchestration runtime.
- A bounded proxy may accept preservation, require local repair, reject a
  violation, and advance to the next already-authorized action. Product,
  requirement, governing-authority, or accepted-design changes re-enter at
  their owner. Routine advancement needs no renewed human ceremony when the
  delegation and re-entry boundary are already accepted.
- Assess a bounded candidate as `accept`, `local_repair`, `re_enter`, or
  `reject`. Global correctness conserves every governing relation affected by
  the local action; unrelated incompleteness outside its causal cone is
  repricing input, not a blocker. Repeated rejection against one unchanged
  boundary triggers reassessment, not a candidate-count threshold or review
  state machine.
- Transition evidence binds the exact candidate, affected relations, changed
  paths, authority-path disposition, focused and required integration proof,
  remaining seams, non-changes, and assessor disposition. Use the cheapest proof
  that can falsify the active relation and reserve whole-candidate qualification
  for declared candidate boundaries unless risk requires it sooner.
- A materially durable or reconstructable authority claim is not proven by a
  same-process test when incidental process state is a plausible authority.
  Destroy or exclude that state and compare reconstructed semantic outcomes.
- Acceptance binds an exact checkpoint and permits the next already-authorized
  action without widening scope. Accepted material Product movement is
  progress; rejected or superseded construction is churn; preservation and
  repeated proof are evidence; hidden-distance discovery revises forecast.
  These are semantic categories, not a prescribed numeric algorithm.
- When both strategies are lawful and feasible, bounded evolution is the
  rebuttable selection presumption when a working predecessor can reach the
  admitted outcome without competing or ambiguous authority. It never requires
  continuing an unsafe or inadmissible path. Core-interface evolution uses
  Inside-Out Hard-Break. Fundamental re-adoption requires explicit human
  comparative selection and an abort or re-entry condition.
- Product-slice promotion requires singular authority across the full causal
  closure of its acceptance path but does not close an enclosing migration.
  Residual implementation must not falsify current or retained claims and must
  retain a bounded migration, qualification, or release disposition. Old
  execution may remain only outside that closure or under an explicitly
  specified, deterministically routed, non-overlapping Product or compatibility
  scope.
- Retire superseded production responsibility by default. Retention requires
  a current supported obligation, owner, purpose, execution scope and material
  cost; temporary compatibility/comparison work has an expiry or removal
  trigger. Existing tests, oracle labels and nominal demotion do not justify
  duplication. Distinct required cold reconstruction or independent oracles
  may be enduring. Preserve the surviving obligation's owner, but invent no
  replacement guard for an unsupported obligation. Local retirement need not
  await unrelated Product closure.

## Proportionate Treatment And Continuity

- `SPEC_METHOD.md#computed-classification-and-treatment` owns the reusable C
  walk: exact request/targets, producer and procedure, governing basis, declared
  owner/layer edges and unknown frontier, complete relevant Public membership
  and value delta, accepted scope/trace evidence, and rule-determined treatment.
  Missing candidate, projection or coverage stays unknown. C grants no effects
  and cannot establish residual semantic sufficiency or an owner ruling.
- Separate nonconformance from changed intent. Repair or reject a candidate
  under sufficient unchanged law and its existing grant; a selected changed
  outcome or established governing insufficiency re-enters its actual owner.
  A bounded authorized discriminator may resolve an unknown. Candidate behavior
  cannot select its governing contract or widen authority.
- A sufficient single-context grant permits direct constructor/Writer entry
  under the applicable frame basis. Material context, authority, capability or
  independence needs determine coordination. Preserve admission, required
  assessment and reserved decisions; role names create no ceremony or grant.
- Closure requires satisfied applicable obligations, valid exact evidence,
  required judgments/rulings and no active non-closure condition. A review
  event or completed artifact cannot substitute for that condition.
- Reuse exact current reconstruction and classification support; role or
  resumption changes alone do not invalidate it. Reassess affected dependencies
  on material change or counterexample. Ticket Method owns J/O recording;
  Design Module Method retains its complete applicable design-view gate.
- Apply proportionality to method work: repeated acquisition, hashing, context,
  activation, status, review and evidence work serves a change, decision or
  assurance need. Qualify material operational assumptions under DMM; no
  universal resource quota or additional accounting carrier follows.
- One exact Writer grant can cover its declared construction/status/checkpoint
  sequence; record actual role transitions and refresh changed bindings, not
  unchanged status alone. Executive mutation restrictions remain. Preservation
  may retain unaccepted work with predecessor, territory, concurrent-writer
  disposition and durable evidence, without acceptance or publication. A restart
  explains why retained repair is insufficient and which obligations, evidence
  and causal assumptions survive or change. Reconstructability alone selects
  neither reconstruction at every use nor a restart.

## Compression Use

Use this asset to orient a worker to source precedence, lawful re-entry, and
traceability. Do not use it to decide product-specific behavior; product
behavior must come from the current product authority packet.
