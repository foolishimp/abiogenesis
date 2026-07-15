# T-278 - Derive Public Control-Plane Ontology And Reprice Operation Surface

- id: T-278
- title: Derive the ABIogenesis public control-plane Ontology and reprice the operation surface
- type: feature
- ticket_category: ordinary
- status: active
- phase_status: fourth_bounded_authority_binding_repair_complete_independent_review_pending
- review_status: five_reviewer_authored_rejections_and_one_prime_acceptance_received
- proof_status: 27_7_19_census_reproduced_fourth_repair_pending_rereview
- delivery_phase: DS-0 consistency re-entry before DS-5 public-product completion
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- change_intent: >-
    Resolve the GTL-program/GraphFunction ambiguity, restore One Surface, and
    replace the prematurely fixed peer operation roster with one accepted
    public control-plane Ontology that derives entities, lifecycle, authority,
    parameterized atomic functions, higher-order composition, effects, and
    public projections while retaining every discovered 5.0 behavior as a
    no-silence input.
- change_class: intent_reprice
- re_entry_point: specification/INTENT.md What We Want item 3
- triaged_at: 2026-07-15
- created_at: 2026-07-15
- updated_at: 2026-07-16
- owner: abiogenesis
- build_tenant: typescript
- source_ticket: T-244
- priority: critical
- dependencies: []
- authority_refs:
  - specification/GOALS.md GOAL-035 and DS-5
  - specification/INTENT.md public operator workflow
  - specification/PRODUCT.md Ontology And Epistemology
  - specification/PRODUCT.md Public Operator Contract
  - specification/requirements/product/REQ-P-POLICY.md
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md
  - specification/requirements/product/REQ-P-CATALOG.md
  - specification/requirements/product/REQ-P-INSTALL.md
  - specification/requirements/product/REQ-P-CONSENSUS.md
  - specification/requirements/product/REQ-P-QUAL.md
  - specification/requirements/product/REQ-P-SELF-CONFORMANCE.md
  - specification/requirements/gtl/REQ-L-GTL3-C-ALGEBRA.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
  - specification/requirements/mapping/REQ-M-GTL3-CAPABILITY.md
  - specification/requirements/mapping/REQ-M-GTL3-PROGRAM-TRAVERSAL.md
  - specification/requirements/abg/REQ-R-ABG3-INTERPRET.md
  - specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - specification/requirements/abg/REQ-R-ABG3-FP-CONSCIOUSNESS.md
  - specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md
  - specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md section 4B
  - specification_methodology/specification/standards/ODD_METHOD.md section 11.5D
  - specification_methodology/specification/standards/RELEASE_METHOD.md
- ontology_ref: >-
    build_tenants/abiogenesis/typescript/design/
    ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md
- intake_decision_ref: >-
    .ai-workspace/comments/codex/
    20260715T080316Z_DECISION_t278_ontology_first_reentry.md
- earlier_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260715T082100Z_SELF_REVIEW_t278_public_control_plane_ontology.md
- superseded_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260715T141515Z_SELF_REVIEW_t278_one_surface_target_shape_candidate.md
- bounded_one_surface_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260715T164606Z_SELF_REVIEW_t278_bounded_one_surface_repair.md
- second_bounded_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260715T180720Z_SELF_REVIEW_t278_second_bounded_release_algebra_repair.md
- third_bounded_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260715T185500Z_SELF_REVIEW_t278_third_bounded_qualification_input_repair.md
- self_review_ref: >-
    .ai-workspace/comments/codex/
    20260715T192625Z_SELF_REVIEW_t278_fourth_bounded_authority_binding_repair.md
- independent_review_intake_ref: >-
    .ai-workspace/comments/codex/
    20260715T161505Z_REVIEW_INTAKE_t278_independent_one_surface_rejection.md
- pen_holder_delta_review_ref: >-
    .ai-workspace/comments/codex/
    20260715T165410Z_REVIEW_t278_bounded_one_surface_rereview.md
- latest_review_intake_ref: >-
    .ai-workspace/comments/codex/
    20260715T173440Z_REVIEW_INTAKE_t278_release_cycle_binding_audit_rejection.md
- release_authority_review_ref: >-
    .ai-workspace/comments/codex/
    20260715T175149Z_REVIEW_t278_release_lifecycle_authority_and_binding.md
- prime_census_review_ref: >-
    .ai-workspace/comments/codex/
    20260715T175502Z_REVIEW_t278_prime_census_independent.md
- second_release_algebra_review_ref: >-
    .ai-workspace/comments/codex/
    20260715T181810Z_REVIEW_t278_second_release_algebra_rereview.md
- second_prime_census_review_ref: >-
    .ai-workspace/comments/codex/
    20260715T182026Z_REVIEW_t278_second_prime_census_rereview.md
- third_release_authority_review_ref: >-
    .ai-workspace/comments/codex/
    20260715T190336Z_REVIEW_t278_third_release_authority_algebra_rereview.md
- third_prime_census_review_ref: >-
    .ai-workspace/comments/codex/
    20260715T190352Z_REVIEW_t278_v8_prime_census_ontology.md
- managed_delivery_plan_ref: specification/GOALS.md
- current_plan_read_model_ref: >-
    .ai-workspace/comments/codex/
    20260715T150050Z_PLAN_abiogenesis_5_0_repriced_end_to_end.md

## Intake Triage

1. The stable-first 5.0 direction remains sound: ABIogenesis must publish one
   complete, source-independent operator control plane over GTL and ABG truth.
2. The first defective layer is INTENT. It calls `GraphFunction` the sole named
   callable *program*, while PRODUCT and mapping requirements define the GTL
   overlay/composition as the program and `GraphFunction` as its callable
   library function/work contract.
3. PRODUCT then collapses the four One Surface authorities into a generic
   `iterate(...)` precursor and promotes a discovered verb roster directly into
   public named-composition truth before deriving the product entities,
   lifecycle, authority, atomic functions, and composition algebra.
4. The requirements then freeze that accidental shape as exactly 36 peer
   `abg.operation.*` identities. T-244 and T-277 treat completion of that roster
   as delivery and contraction work. Those are downstream consequences of the
   intent/product-definition defects.
5. The lawful class is therefore `intent_reprice`, contained in this existing
   carrier rather than spawning another planning ticket. This ticket does not
   begin as an implementation refactor and does not authorize a code migration.
6. The 36 named public operations plus the two required catalog-application
   behaviors remain coverage inputs until each is
   derived, deferred with an owner, excluded by product authority, or retained
   as an explicit gap. Repricing their architectural shape does not delete their
   product claim by silence.

## Current Review Disposition

The relayed external review accepts the program/GraphFunction correction and
the four distinct One Surface authorities in substance. It rejects the
27-atom/seven-composition claim pending repair of a cyclic release lifecycle,
holds the 19-operation projection until that repair is repriced, and identifies
an invocation/binding cardinality contradiction. The linked target therefore
remains rejected. Runtime remains frozen.

The prior `/5-candidate` applied two earlier bounded repairs:

1. `WorkspaceAuthorityBasis` and `WorkspaceBinding` carry stable authority and
   installed-product/root truth. Mutable worksite, runtime, and replay
   observation belongs only to `ObservationSnapshot`. Only a changed ABG
   `ExecutionBasis` on the same spine is a basis-fork question.
2. Public ingress admits and hands off a `PublicInvocation`. The admitted GTL
   One Surface program owns AF-11 through AF-17, and ABG interprets that
   declaration and owns runtime truth.

The repaired Ontology introduces one Prime `ExactCandidateQualification`
contract family with separately addressable basis and verdict projections.
T-247 binds and qualifies exact pre-RC truth. AF-25 creates a `ReleaseCut` and
`ReleaseSnapshotManifest` only from a same-basis green non-bypassed verdict.
This is a carrier correction inside the existing qualification composition,
not a new semantic atom or public operation. The target counts remain proposals
until the repaired whole-family census is rerun.

The repaired Ontology makes `WorkspaceBinding` cardinality a closed property
of each public function/variant: `forbidden | exactly_one`. The aggregate
`0..1` relation is a discriminated sum, not a freely optional binding.
Workspace/execution invocations require one binding; pre-binding variants
forbid one.

The prior `ontology_candidate_independently_reviewed` and
`bounded_repair_independently_accepted` statuses were unsupported. The durable
artifact was a pen-holder synthesis over unpersisted internal reviewer relays.
The latest external findings are preserved by `latest_review_intake_ref`, but
their reviewer identity was not supplied and that intake is not acceptance. A
reviewer-authored independent review over the exact repaired subject remains
mandatory before F_H can accept the linked target claims.

Two reviewer-authored independent reviews of the first repaired candidate both
reproduced the 30-source basis and 38/27/7/19/17/16 censuses, accepted the
binding-cardinality repair and One Surface/hard-break model, and rejected two
remaining release details:

1. an undeclared generic verdict `fold` was outside the closed seven-constructor
   GTL algebra; the second repair replaced it with the existing declared
   `C.of(AF-22 evaluateConformance(exact_candidate_qualification, ...))` leaf;
2. the tapped-release variant did not bind a prospective final candidate,
   allowed final-only delta, and affected deterministic/install/identity/bounded
   gates before publication; the repaired final basis now owns those inputs and
   AF-25 refuses until their same-basis verdict is green.

Two fresh reviewer-authored reviews accepted those release-cycle, final-tap,
binding-cardinality, identity, and 27/7/19 repairs, then found one remaining
carrier discontinuity: qualification-specific `C.batch` named neither the
common task carriers/cardinality required by `C-ALGEBRA-007` nor a lawful
complete-vector boundary into `AF-22`.

The third bounded repair removes that unnecessary realization assumption.
Heterogeneous owning gates execute under their existing contracts and retain
their assessment authority. One subordinate
`QualificationGateResultVector<K>` carries the exact basis, frozen inventory,
complete ordered owning-result citations, evidence, dispositions, bypass truth,
and vector digest. Structural admission verifies only exact roster, basis,
ordinal, identity, type, and digest conservation. One
`C.of(AF-22 evaluateConformance(exact_candidate_qualification, ...))` stage
consumes that carrier and emits exactly one verdict. No qualification-local
`C.batch`, HOF dispatcher, scheduler, selector, filesystem scan, or second
checker remains.

This is the smaller Prime repair: native `C.of` already accepts arbitrary
typed input/output carriers, while the current direct-batch runtime does not
produce the HOF vector required by `fan_in`. Adding that bridge would create
new runtime mechanism without product demand. The repair changes no atom,
composition, or public operation. The updated exact subject requires fresh
reviewer-authored review.

Fresh `/8-candidate` Prime review accepts that direct vector algebra and
reproduces the unchanged 27/7/19 target. The parallel release-authority review
also accepts the algebra and finds two remaining field-level omissions:

1. the qualification family did not content-address the exact method,
   rule-catalog, and source basis required by self-conformance law; and
2. the prospective-final basis cited the accepted RC and final delta but not
   the distinct installed-RC basis and green non-bypassed verdict that authorize
   final derivation.

The fourth bounded repair adds one subordinate `QualificationLawBasis` value
and binds its ref/digest through the exact basis, result vector, AF-22 argument,
and verdict. A `final_tap_candidate` basis now also binds the exact installed-RC
qualification basis and green-verdict refs/digests, and AF-25 verifies that they
identify the accepted RC bytes and installed identity. These are authority
fields on the existing contract family. They add no semantic atom, composition,
public operation, controller, scheduler, or proof framework. The updated exact
subject requires one focused reviewer-authored authority re-review.

The existing Prime regression gate proves only that the earlier T-277 governed
design set remains green. T-278's 27/7 target is supported by its explicit
whole-family matrices, Promotion Tests, and independently reproduced census;
the gate is not presented as proof of that target.

## Target Truth

ABIogenesis owns one public control-plane Ontology derived from the existing GTL
language Ontology, ABG runtime Ontology, installed-product contract, operator
workflow, and current product requirements.

The accepted Ontology shall define:

- identity-bearing product entities and subordinate value families;
- relationships, cardinalities, invariants, and lifecycle completeness;
- proposer, evaluator, verifier, admitter, executor, projector, and retirement
  authority for every boundary-crossing function;
- the smallest parameterized atomic function families;
- GTL and ABG higher-order composition and effect conservation;
- whole-family Prime contraction before public operation promotion;
- public SDK, CLI, schema, capability, and scenario projections; and
- the disposition of every currently named 5.0 function.

It shall also preserve the complete One Surface chain and keep
`synthesizeModel`, `evalGap`, `evaluateNext`, and `evaluateAction` as distinct
semantic authorities. They may share subordinate libraries but may not perform
one another's authority. They do not become four new public SDK/CLI operations.

Public operation identities, command paths, handlers, schemas, and tests are
projections of this accepted Ontology. They are not independent authoring
sources and their count is not a constitutional input.

## Superseded Truth Candidate

On F_H acceptance and constitutional propagation, the following current claim
is superseded:

> The 36 discovered verbs are exactly 36 tenant-invariant peer public operation
> identities and completing that exact roster is the DS-5 delivery criterion.

This ticket does not preserve an old operation solely for compatibility. A
currently published identity survives only if the accepted Ontology derives it
as a lawful public projection. Non-derived identities are retired in the same
hard-break migration; no legacy facade or parallel operation register remains.

## Execution Contract

### Target truth

One accepted Ontology is the design authority for the complete public control
plane.

### Closure law

This ticket closes only when:

1. the Ontology basis is exact and staleness-decidable;
2. every identity-bearing entity has a complete lifecycle row;
3. every boundary-crossing function has a complete authority row;
4. all 38 discovered public behaviors, all 17 retained feature families, and
   all 16 current capability identities have no-silence derivation
   dispositions;
5. the higher-order and effect algebra is explicit and uses GTL/ABG rather than
   controller flow;
6. whole-family Prime review justifies each retained atomic family and public
   projection family;
7. F_H accepts the target intent/product shape, One Surface authority model,
   Prime algebra, and public-operation projection;
8. INTENT, PRODUCT, requirements, and GOALS are reconciled to that accepted
   target;
9. closed T-244 is reopened only for the accepted reprice, regenerated once as
   the sole derived current feature/closure projection, and reclosed;
10. the Ontology basis is recomputed over those current constitutional sources
   and the final Ontology receives ratified design status;
11. active tickets and affected design carriers are reconciled to the accepted
   truth; and
12. no operation registry, schema generator, adapter, implementation function,
   or test remains an undeclared rival source.

### Non-closure conditions

- a class diagram or endpoint regrouping without lifecycle and authority;
- replacing 36 operations with another unexplained number;
- treating One Surface as four new public verbs or as one generic `iterate`
  controller;
- preserving existing identities merely to avoid migration;
- treating generic CRUD names as sufficient domain meaning;
- promoting the candidate Ontology without explicit F_H acceptance;
- changing runtime code before the accepted Ontology and repriced requirements;
- deleting a discovered function without a typed disposition; or
- using Prime to merge distinct authority, effect, identity, or lifecycle.

### Proof surface

- candidate Ontology and exact source-basis digests;
- entity lifecycle, relationship, authority, function-derivation, and Prime
  matrices;
- ontology-to-three-view and ontology-to-public-contract trace;
- exact 38-row behavior, 17-row retained-feature, and 16-row capability
  no-silence censuses;
- requirement and ticket consistency scan;
- generated operation/schema parity after accepted migration; and
- source-blind installed SDK/CLI scenarios over the resulting surface.

## Current Freeze

Until the bounded authority-binding repair passes auditable independent
review and F_H accepts the target shape:

- do not implement any of the 17 missing roster entries;
- do not claim DS-5 completion from operation-count parity;
- preserve the current dirty T-270/T-272 work as unaccepted realization
  evidence and do not checkpoint it as 5.0 closure;
- T-270 and T-272 may be reconciled as projections only after their public and
  runtime functions are mapped to the accepted Ontology; and
- T-274 through T-276 remain active but cannot use the current exact operation
  roster as architectural authority.

The singular integration line is `codex/t266-stage`. Its divergence from
`main` is a source-control reconciliation task, not permission to merge or
rebase this dirty design/runtime wave. The unrelated untracked manuscript using
T-267 in the sibling `abiogenesis` worktree must be renamed to T-279 before it
is ever committed; the committed runtime T-267 identity on this line remains
authoritative.

## Deliverables

- [x] triage and singular intent-reprice carrier
- [x] candidate intent/product terminology and public control-plane Ontology
- [x] complete One Surface entity, sequence, state, authority, and gap model
- [x] independent review received and rejection recorded
- [x] bounded workspace-authority/observation and One Surface orchestration-owner repair
- [x] pen-holder delta review of the earlier bounded repair, explicitly reclassified as non-independent
- [x] external release-cycle, binding-cardinality, and audit rejection recorded
- [x] bounded release-lifecycle and binding-cardinality repair
- [x] two reviewer-authored independent rejections of the first repaired subject recorded
- [x] bounded verdict-reducer and final-tap pre-publication repair
- [x] two reviewer-authored independent rejections of the second repaired subject recorded
- [x] bounded typed qualification-input repair with no qualification-local batch or HOF bridge
- [x] reviewer-authored Prime acceptance of the direct typed-vector algebra
- [x] reviewer-authored authority rejection of missing law-basis and installed-RC lineage fields
- [x] bounded qualification-law and installed-RC authorization binding repair
- [ ] focused reviewer-authored authority review over the exact repaired subject
- [ ] explicit F_H target-shape acceptance
- [ ] INTENT, PRODUCT, requirement, and GOALS propagation
- [ ] T-244 and active-ticket reconciliation
- [ ] exact basis recomputation and final Ontology ratification
- [ ] derived three-view and IACS acceptance for affected boundaries
- [ ] hard-break realization migration
- [ ] installed proof and closure review
