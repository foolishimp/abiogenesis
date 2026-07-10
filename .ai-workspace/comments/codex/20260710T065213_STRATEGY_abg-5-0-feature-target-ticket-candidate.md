# STRATEGY: ABG 5.0 Feature Target Ticket Candidate

**Author**: codex
**Date**: 2026-07-10T06:52:13Z
**Addresses**: T-217, T-218, ABG 5.0 feature scope, closure law, and promotion path
**Status**: Open
**Reality/Target**: current-state findings plus proposed target direction

## Summary

This post proposes an alternate ABG 5.0 feature target for review and eventual
promotion. It is ticket-shaped commentary, not ticket authority. It does not
change `GOALS.md`, `INTENT.md`, `PRODUCT.md`, requirements, design, ticket
status, or release scope.

The proposed 5.0 claim is:

> ABG 5.0 is the first publicly consumable GTL/ABG product whose constitutional
> specification and implementation-independent conformance corpus define the
> product contract, whose TypeScript tenant is the reference implementation,
> whose released GLC consumer runs over a released ABG install, and whose exact
> release candidate is produced and re-produced through an installed
> self-hosting bootstrap without source-tree authority.

This target keeps the core direction of T-218 while changing four load-bearing
parts:

1. 4.6 law and proof debt closes before the 5.0 wave opens.
2. Release-defining 5.0 truth is not debt-eligible.
3. Self-hosting is a two-stage bootstrap and equivalence proof, not one green
   campaign.
4. A separately tapped GLC release is a named dependency, not inferred from an
   `odd_glc` source checkout or package repin.

## Analysis

The detailed analysis below separates current reality, proposed constitutional
change, product capabilities, proof surfaces, release gates, and promotion
steps. The embedded promoted-ticket body is prospective only.

## Artifact Boundary

- This post is commentary under `POSTING_GUIDE.md`.
- It is an alternate to the feature target carried by active T-218.
- It is not a rival active ticket, sprint, specification, design, or release
  note.
- Promotion requires explicit F_H adjudication, constitutional edits at the
  lawful re-entry points, and independently closeable repo-local tickets.
- T-218 remains the current ticket authority unless it is amended, superseded,
  or replaced through the normal ticket process.

## Promotion Candidate Record

- candidate_ref: `proposal://abiogenesis/abg-5.0/alternate-target/v1`
- proposed_goal_ref: unassigned; next available goal identity at promotion
- proposed_role: goal-level feature target and leaf-ticket index
- proposed_type: feature wave, realized through independent tickets and sprints
- proposed_initial_change_class: `goal_reprice`
- proposed_initial_re_entry_point: `specification/GOALS.md`
- proposed_release_scope: ABG/GTL 5.0 product contract, TypeScript reference
  realization, public distribution, conformance product, self-hosting proof,
  and released GLC-over-ABG qualification
- prerequisite: T-217/4.6 final closure or an explicit F_H ruling that narrows
  the 4.6 claim and durably assigns each successor
- promotion_state: proposed, not admitted

## Proposed Promoted Ticket Body

The following is a promotion-ready replacement body for T-218 if F_H selects
this alternate. The `id` and `status` below are prospective and carry no ticket
authority while this file remains under comments.

- id: T-218
- title: ABG 5.0 feature target - self-hosting, conformance product, and public consumption
- type: feature
- ticket_category: ordinary
- status: backlog
- goal: proposed GOAL-034; final identity assigned at promotion
- change_intent: >-
    Establish the accepted ABG 5.0 product target and independently closeable
    work graph: specification plus an implementation-independent conformance
    corpus as product contract; TypeScript as the public reference
    implementation; a separately released GLC over released ABG; and a
    two-stage installed self-hosting bootstrap with exact-cut proof.
- change_class: goal_reprice
- re_entry_point: specification/GOALS.md
- triaged_at: 2026-07-10
- created_at: 2026-07-10
- updated_at: 2026-07-10
- priority: high
- activation_condition: >-
    A5-P0 and A5-P2 close, GOALS admits the wave, and every first-phase leaf
    ticket has a singular change class, re-entry point, owner, and dependency
    edge.
- intake_source: >-
    F_H 5.0 direction discussion; T-217 closure state; T-218 feature inventory;
    2026-07-10 dual-review residuals; current specification, design, code, test,
    installer, and odd_glc release-state review.
- affected_boundary: >-
    GOALS and PRODUCT; self-hosting and conformance requirements; TypeScript
    reference design and realization; public distribution, SDK, catalog, and
    ingress; installed proof; release qualification; odd_glc-owned release
    dependency.
- dependencies:
  - T-217 and the 4.6 final boundary close affirmatively
  - current 4.6 runtime-law residuals close or the 4.6 claim is narrowed with durable successors
  - F_H accepts the 5.0 target and mandatory/non-mandatory boundary
  - odd_glc accepts a repo-local GLC release ticket if released GLC remains in the headline
- links:
  - `.ai-workspace/tickets/active/T-217-consciousness-wave-higher-order-regulation.md`
  - `.ai-workspace/tickets/active/T-218-abg-5-0-self-hosting-release-wave.md`
  - `.ai-workspace/comments/claude/20260710T131500Z_ANALYSIS_5_0_forgotten_opportunities_mining_consolidated.md`
  - `.ai-workspace/comments/claude/20260710T150000Z_REVIEW_t217_dual_review_round2_consolidated.md`
  - `.ai-workspace/comments/claude/20260710T160000Z_ANALYSIS_5_0_feature_set_and_closure_conditions.md`
- target_truth: >-
    ABG 5.0 is publicly installable and source-independent; its constitutional
    corpus and conformance protocol define the product contract; its
    TypeScript tenant is the first conforming reference implementation; a
    separately released GLC consumes it through public interfaces; and its
    candidate is produced and re-produced by an installed two-stage
    self-hosting bootstrap with committed, exact-cut evidence.
- superseded_truth: >-
    A 5.0 claim may close through one prior-release campaign, source-tree
    imports, test counts, package repins, placeholder GLC identity, generic F_H
    debt, or one ticket claiming cross-repo realization closure.
- closure_law: >-
    Close only after every mandatory capability and exact-cut proof in this
    candidate closes under its owning authority; both bootstrap stages pass;
    static conformance and runtime certification remain distinct and green;
    released GLC-over-released-ABG is proven if retained; and all release
    identities and evidence agree. Definition-bearing truth is not
    debt-eligible.
- evaluation_criteria:
  - constitutional target and all downstream authority are current and traceable
  - each capability has one independently closeable owning ticket
  - public install, curated API, catalog, ingress, docs, and onboarding work without source access
  - conformance corpus and runtime campaign verdicts pass from installed-only contexts
  - two-stage self-hosting and candidate equivalence pass over frozen authority
  - exact RC build, lint, full suite, reviews, manifests, campaigns, and release assets agree
- proof_surface:
  - ratified GOALS, PRODUCT, requirement, and design changes
  - versioned conformance corpus, protocol, adapter results, and manifests
  - public package/registry metadata, snapshot lineage, and clean-machine install archive
  - C1/C2 bootstrap replays, artifact ledgers, equivalence report, and install manifests
  - released GLC and ABG manifests plus committed GLC campaign evidence
  - exact-cut snapshot, build, lint, full-suite, dual-review, onboarding, and runtime certification evidence
- non_closure_conditions:
  - any mandatory product truth is waived as generic F_H debt
  - any proof uses mutable source or authoring-only paths as installed authority
  - self-hosting lacks the second installed-candidate stage or equivalence proof
  - static conformance is reduced to test counts or runtime campaign citability
  - released GLC is claimed from a source checkout, placeholder version, or untapped artifact
  - a sibling repo dependency lacks its own accepted ticket and proof
  - release evidence does not bind one exact immutable RC identity

The detailed feature, proof, exclusion, and promotion sections below are part
of this proposed body when promoted.

## Current Reality

1. Self-hosting is already approved intent. `specification/INTENT.md:20-32`
   names the bootstrap-compiler and self-hosting gates, and
   `specification/requirements/abg/REQ-R-ABG3-SELFHOSTING.md` already governs
   derived-artifact and drift behavior. The 5.0 change is not the invention of
   self-hosting; it extends existing law with a build-next-release predicate,
   productization, conformance, and release proof.
2. T-217 remains active. Its live/adoption tails, Phase 5 campaign, release
   hygiene, Phase 6 artifact verification, and repin remain named at
   `.ai-workspace/tickets/active/T-217-consciousness-wave-higher-order-regulation.md:1349-1362,1455-1468`.
3. The dual-review residuals include current runtime-law and proof gaps. T-218
   places handler authority, EVENTS-025 scope semantics, and four residual
   runtime items in 5.0. Those items must first be adjudicated against the 4.6
   release claim.
4. T-142 did not ratify permanent no-npm product law. Its no-publish statement
   was a non-goal of one release-snapshot ticket. The immutable snapshot flow
   remains useful and should feed, not be replaced by, public publication.
5. GTL already requires an implementation-independent language conformance
   corpus at `specification/requirements/gtl/REQ-L-GTL3-LAWS.md:68-82`.
6. `PRODUCT.md` defines the installer and immutable installed substrate, but it
   does not yet define public registry distribution or specification-plus-suite
   as the product identity.
7. `specification/requirements/product/REQ-P-INSTALL.md` already governs the
   public installer and source/install separation. The 5.0 target extends that
   law into public registry distribution and source-blind consumption; it does
   not mint a second installer ontology.
8. `PRODUCT.md:646-698` still presents `gen-start` and `gen-gaps` as the public
   operator contract while T-217 realized witness, observe, draft, and tune
   grammar. The product contract must reconcile those surfaces before a public
   5.0 API claim.
9. `odd_glc` is currently a source project, not a tapped product release. Its
   TypeScript package remains version `0.0.0`. A repin proves consumption but
   not released-GLC-over-released-ABG.
10. `specification/INTENT.md:34,191-197` still names the Python carrier in
   shipping and self-reconstruction criteria while `PRODUCT.md:783-803`
   declares TypeScript primary and Python paused. Promotion must reconcile that
   constitutional contradiction without pretending T-142 created it.

## STDO Intake Triage

### S: Specification Method

**Substantive**: yes. The work changes the active wave, product identity,
public delivery contract, conformance contract, and release proof.

**First re-entry**: `goal_reprice`. The current work-wave focus is 4.6 under
GOAL-033. Promotion first establishes a bounded 5.0 goal. Downstream changes
then receive their own single smallest change classes:

- `product_reprice`: specification-plus-conformance as product, TypeScript as
  reference tenant, public distribution, released GLC qualification, and the
  reconciled operator/API contract
- `requirement_reprice`: self-hosting closure invariant, certification result
  law, public ingress obligations, and any missing handler/scope authority
- `design_reframe`: conformance packaging, public SDK/catalog surfaces,
  bootstrap equivalence, and source/install/materialization separation
- `realization_refactor` or `implementation_migration`: implementation and
  proof changes only where requirement and design authority already exist

No leaf ticket may carry a compound change class. The first missing authority
layer decides each leaf ticket's class and re-entry point.

**Constitutional flow required at promotion**:

`GOALS -> INTENT confirmation/reprice decision -> PRODUCT -> requirements -> design -> realization -> proof -> release`

`INTENT.md` is repriced only if F_H chooses to make public third-party
consumption a new directional commitment rather than a product-shape
realization of the existing self-hosting/reference-product intent. Historical
T-142 scope is not the authority for that decision.

### T: Ticket Method

This proposal is broader than one execution ticket. Promotion creates:

1. one goal row for the 5.0 wave;
2. one bounded feature-target/index ticket linking the admitted leaf work;
3. independently closeable tickets for each constitutional, design,
   realization, sibling-repo, and release dependency;
4. sprints only for bounded execution batches after authority and dependencies
   are admitted.

Cross-repo work retains repo-local ownership:

- `specification_methodology` owns any shared-method change;
- `odd_glc` owns its release cut, package identity, domain declarations, and
  product proof;
- `abiogenesis` owns ABG/GTL product law, the TypeScript reference realization,
  conformance interfaces, runtime truth, and its release acceptance dependency.

New product truth, contracts, runtime law, closure law, provenance law, and
repricing work are not eligible for generic F_H debt or sprint escrow. Optional
supporting features may leave the cut only through explicit F_H scope
adjudication before the RC scope freezes.

### D: Design Module Method

Promotion must derive one authority per concern:

- constitutional conformance corpus and expected diagnostics:
  `specification/`
- tenant-neutral conformance protocol and runner contracts: ratified common
  design, with implementation below `build_tenants/common/`
- TypeScript adapter and reference implementation:
  `build_tenants/abiogenesis/typescript/`
- public distribution and release snapshot integration: product qualification
  and release design
- public catalog, SDK, and runtime ingress: explicit modules with curated
  exports and no root-barrel leakage
- self-hosting scenario declarations: product/scenario authority
- bootstrap execution, events, replay, projection, and closure: ABG runtime
- released GLC domain meaning and bindings: `odd_glc`

Every module requires requirement trace, structural carrier definition,
effect-edge classification, lifecycle coverage, positive proof, and negative
proof where drift is plausible.

### O: ODD Method

The self-build must remain an ODD product traversal:

- the build subject is the mutable abiogenesis source project;
- constructive work is carried by published graph functions over typed assets;
- the released GLC supplies domain declarations and interpretation, not a
  hidden runtime;
- ABG owns dispatch, event emission, replay, continuation, admission,
  projection, and closure;
- no tenant-local loop, script, test harness, or worker prompt may own next-step
  selection, event truth, or closure;
- the function catalog is machine-readable from the installed product;
- the campaign is executable from a minimal declared authority packet;
- all produced constitutional and release artifacts pass deterministic
  admission.

## Product And Release Boundaries

The bootstrap proof must name these identities without collapsing them:

| Identity | Meaning |
|---|---|
| `S5` | mutable abiogenesis 5.0 source project under development |
| `P4` | immutable tapped ABG 4.6 product used as bootstrap substrate |
| `I4` | installed P4 product selected by manifest, not source checkout |
| `G` | separately tapped and installed GLC product used as the software-build domain product |
| `C1` | first 5.0 candidate artifact produced by G over I4 from frozen S5 |
| `I1` | installed C1 candidate, isolated from S5 authoring paths |
| `C2` | second candidate artifact produced by G over I1 from the same frozen S5 |
| `R5` | exact immutable 5.0 RC cut accepted only after C1/C2 equivalence and qualification |

The proof sequence is:

1. freeze the qualifying source and scenario authority;
2. run `G + I4 + S5 -> C1`;
3. install C1 as I1 without source-tree fallbacks;
4. run `G + I1 + same S5 -> C2`;
5. compare C1 and C2 under the ratified equivalence contract;
6. qualify the accepted candidate from an installed-only context;
7. publish one immutable RC identity and repeat any exact-cut proofs required by
   release law.

The GLC release must be independently tapped before the ABG 5.0 final tap and
must admit the 5.0 candidate version line. The full campaign runs against the
exact ABG RC artifact. Final ABG tapping must preserve the qualified bytes and
manifests; a post-tap identity/install verification then establishes the
final-over-final claim. If release policy requires executing the entire campaign
only after both final tags exist, the released-over-released claim moves to a
post-tap qualification addendum rather than being asserted at tap time.

Equivalence must cover at minimum package identity, declared exports, compiled
behavior, conformance results, install manifests, runtime bindings, and
release-significant artifact digests. Any intentionally nondeterministic
metadata must be declared, excluded narrowly, and proven irrelevant to product
behavior. Campaign convergence alone is insufficient.

## Alternate 5.0 Feature Target

### Prerequisites

| ID | Target | Mandatory closure | Source disposition |
|---|---|---|---|
| `A5-P0` | Close the 4.6/T-217 release boundary | Every affirmative T-217 phase exit; live/adoption tails; F_H campaign; C-2/C-6 hygiene; exact snapshot, installer repin, and release note; no non-closure condition | replaces T-218 G1 wording |
| `A5-P1` | Adjudicate current runtime-law residuals before 4.6 final | Handler authority, EVENTS-025 scope behavior, assembly fail-closed engine differential, cross-process pre-stamp rejection, ordinal tie behavior, and emitter-context adoption are fixed or 4.6 claims are explicitly narrowed with durable successor ownership | moves T-218 F14/F15/F24 before G1 |
| `A5-P2` | Ratify the 5.0 product target | Goal row accepted; PRODUCT updated for spec+suite, TS reference tenant, public distribution, operator/API contract, and released GLC dependency; requirement/design reprices opened | replaces T-218 G2 |

### Mandatory Capability Packages

| ID | Capability | Required deliverables | Hard closure | T-218 coverage |
|---|---|---|---|---|
| `A5-SH1` | Self-hosting law and maturity model | self-hosting closure invariant; staged maturity/enforcement model; F_D predicate; frozen `SCN-ABG-SOFTWARE-BUILD` authority | invariant ratified before scenario admission; predicate evaluates real replay; qualifying scenario remains unchanged during the proof window | F1, F25 |
| `A5-SH2` | Source/install/materialization safety | typed SourceTree/InstallRoot/TenantLane/Sandbox/BuilderSubstrate boundaries; job-bound write/delete/protected-root plan | cross-assignment and protected-sibling mutation fail closed before disk; no source/install/product collapse | F3, F4, F5 |
| `A5-SH3` | Two-stage bootstrap and equivalence | C1/C2 build protocol; equivalence contract; installed-only manifests and evidence ledger | both stages converge; C1/C2 equivalence passes; no source fallback, scenario patch, or mid-run law change | F2, corrected |
| `A5-SH4` | Observer/tuner supervisor over the self-build | observer triage, tuner proposals, F_H/policy ratification, replay-visible supervisor acts | zero false drafts; every actual halt correctly classified; every act replay-visible; every optimization grounded in admitted signals and lawfully ratified; injected negative proof exercises draft production without requiring a defect in the clean qualifier | F26, corrected |
| `A5-SP1` | Implementation-independent conformance product | constitutional corpus and diagnostic identities; tenant-neutral protocol; TypeScript adapter; versioned manifest | static conformance passes from installed-only context with exact expected identities; corpus imports no tenant realization | F7, F27 split |
| `A5-SP2` | Runtime campaign certification | citable verdict carrier over frozen-law, hygiene, attestation, replay, and exact release identity | runtime claim names replay evidence and every predicate; test counts alone are never certification | F27 runtime half |
| `A5-SP3` | Conformance enforcement hardening | behavioral-F_D-leak gate; causal predecessor law limited to causal/derived/transition/closure-bearing carriers | undeclared deterministic closure checks fail closed; applicable carrier families reject missing predecessor truth; root/declaration carriers are not falsely rejected | F11, narrowed F12 |
| `A5-EX1` | Public distribution | license; package metadata; de-private package and installer; registry publication; semver/stable-tag policy; snapshot-to-publication lineage | clean machine installs a version range from the public path; published bytes trace to the immutable snapshot; no `file:` hash-dir dependency | F16, F17 |
| `A5-EX2` | Curated public consumer API | explicit exports; read-only catalog query/composition API; public SDK entry; six named tenant runtime-transition ingress classes; sourcemap and compatibility policy | source-blind consumer enumerates and composes; consumer-visible exports equal the declared list; downstream tenant emits zero runtime events locally; all six ingress classes have positive and negative proof | F8, F18, corrected F21 |
| `A5-EX3` | Operator capability and consumer bootstrap | agent transports as injected capabilities; typed missing-capability result; portable docs; clean consumer gate; onboarding pack | no-CLI machine fails typed with setup contract; configured machine passes; fresh-context agent builds and runs a hello-world tenant skeleton from published artifacts only | F19, F20, F23 |
| `A5-EX4` | Released GLC over released ABG | odd_glc-owned release ticket; non-placeholder version; immutable GLC artifact; public install binding to released ABG; committed campaign | a tapped GLC product, not a source checkout, installs through the public path over the exact released ABG candidate and passes its declared campaign | missing from T-218 feature rows; required by its headline |
| `A5-R1` | Exact-cut qualification and release | self-certifying snapshot; build; zero-warning lint; full suite; static conformance; runtime campaigns; dual review; public install proof; reconciled release assets | every proof binds the exact immutable RC identity; branch, tag, manifest, package, notes, installs, and evidence agree | strengthens T-218 closure 4-6 |

### Proposed Public Runtime Ingress Catalog

F21's count is commentary until promoted into requirement authority. The
candidate closed catalog for requirement review is:

1. install and product-provenance admission;
2. replay cursor, continuation, correction, and re-entry admission;
3. conformance, vector-evaluation, assurance, and closure evidence admission;
4. F_D authority, handler, and traversal-selection admission;
5. graph-span, foldback, and constitutional-reentry admission;
6. process, result, archive, and external-evidence observation admission.

For every class, the tenant supplies declarations, candidate values, or
evidence refs. ABG validates, emits canonical runtime events, projects truth,
and owns closure. Promotion must confirm, split, merge, or reject these classes
in requirements before public API design begins.

### Supporting, Separately Adjudicable Features

| ID | Capability | Disposition rule | T-218 coverage |
|---|---|---|---|
| `A5-Q1` | pass@k / pass^k worker and backend characterization | supporting qualification evidence; not tenant conformance truth; may defer only by removing the claim before RC scope freeze | F9 |
| `A5-Q2` | reusable generic test-harness family | supporting adapter/harness capability; a non-JS workload does not prove an alternate ABG tenant | F10 |

### Separate Or Deferred Work

| T-218 row | Alternate disposition | Reason |
|---|---|---|
| F6 / B-010 | separate, blocked dependency | B-010 governs ABG development under a released `odd_sdlc` product. It is not ABG self-hosting or released GLC-over-ABG. |
| F13 | separate methodology proposal and ticket | shared method law belongs in `specification_methodology`; ABG may depend on an accepted cut but does not own the upstream change |
| F22 / T-178 | separate design then realization work | registry lifecycle is included only if a concrete 5.0 public claim requires mutable retirement/revocation/supersession semantics |
| F22 / T-179 | separate design then realization work | non-graph registry semantics are included only if a concrete 5.0 public API uses those entry kinds |

## T-218 Coverage Check

Nothing in T-218 is silently dropped:

- retained as mandatory: F1-F5, F7-F8, F11-F12 narrowed, F16-F21 corrected,
  F23, F25-F27 corrected;
- moved into the 4.6 prerequisite: F14, F15, F24;
- retained as supporting: F9, F10;
- separated or deferred with owner/trigger: F6, F13, F22;
- added because the T-218 headline requires it: a separately tapped GLC release
  and proof package.

The T-218 feature count should not be used as the release measure. F24-F27 are
primarily proof, scenario, or gate surfaces. Closure is measured by product
claims and admitted evidence, not by the number of rows.

## Mandatory Release Claims

The following are definition-bearing and cannot close as F_H-accepted debt
while the release remains named ABG 5.0 under this target:

1. the 5.0 constitutional product rebase;
2. implementation-independent conformance corpus and installed-only result;
3. public distribution and immutable snapshot lineage;
4. curated public API, read-only catalog, and ABG-owned runtime ingress;
5. source/install/materialization safety;
6. two-stage self-hosting and equivalence;
7. truthful observer/tuner supervision of the self-build;
8. separately released GLC over the exact released ABG candidate;
9. clean-machine consumer installation and onboarding;
10. exact-cut qualification and release coherence.

F_H may remove a claim from the 5.0 target before the RC scope freezes. F_H may
not keep the headline claim and waive its defining proof as debt.

## Proof And Closure Matrix

| Proof class | Required proof |
|---|---|
| Authority | accepted goal; PRODUCT reprice; requirement trace; ratified design; singular change class and re-entry on every leaf ticket |
| Static conformance | exact corpus diagnostics from installed-only TS reference adapter; tenant-independent corpus and protocol |
| Runtime law | positive and negative proof for handler authority, scope classes, ordinal ties, emitter contexts, public ingress, and closure gates |
| Bootstrap | C1/C2 two-stage evidence, source isolation, install manifests, equivalence report, replay, and admitted artifact ledger |
| ODD execution | published graph functions carry the self-build; no product-local continuation, event mint, or closure loop; 11.5B audit clean |
| Supervisor | all acts replay-visible; no false drafts; every halt triaged; grounded, ratified tuner proposals; zero out-of-framework interventions |
| Public consumer | license and metadata; public version install; curated exports; source-blind catalog; typed missing capability; fresh tenant bootstrap |
| Released-over-released | immutable GLC and ABG identities; public binding; committed GLC campaign evidence |
| Release | exact RC build, lint, full suite, conformance, campaigns, dual review, snapshot, notes, branch, tag, package, and install identity agree |

## Phases And Exit Order

### Phase 0: Close The Prior Boundary

- close T-217 affirmative exits;
- adjudicate and fix or narrow A5-P1 residuals;
- tap 4.6 final with exact release evidence.

**Exit**: G1 is actually true; no 4.6 law debt is silently relabeled as 5.0.

### Phase 1: Promote The Target

- F_H adjudicates this post against T-218;
- promote the accepted goal and PRODUCT changes;
- open requirement/design reprices and repo-local leaf tickets;
- freeze the admitted 5.0 feature boundary before RC work.

**Exit**: constitutional target and independently closeable work graph exist.

### Phase 2: Establish Law And Safety

- self-hosting invariant and maturity law;
- conformance corpus/protocol law;
- source/install/materialization safety;
- public ingress and certification-result requirements;
- design derivations and execution-authority audits.

**Exit**: every implementation package has upstream authority, carrier design,
and proof obligations.

### Phase 3: Build The Public Product

- conformance runner and TypeScript adapter;
- public distribution pipeline;
- curated exports, read-only catalog, SDK, and six ingress classes;
- transport capability contract, portable docs, and onboarding pack;
- GLC release work under its own repo-local owner.

**Exit**: a clean external consumer can install and exercise the product without
source-tree knowledge.

### Phase 4: Prove Self-Hosting

- admit and freeze the self-build scenario;
- run C1 bootstrap from installed 4.6;
- install C1 and run C2 from the same frozen source;
- prove equivalence;
- run the supervisor, conformance, and negative-proof portfolio.

**Exit**: the complete self-hosting and released-over-released claims are citable
from committed evidence.

### Phase 5: Qualify And Cut 5.0

- publish and qualify the exact RC identity;
- run public install, onboarding, conformance, GLC, and self-hosting proofs;
- perform dual review;
- reconcile all release-scoped assets;
- tap only after every mandatory claim closes.

**Exit**: release branch, tag, package, manifests, notes, installs, and evidence
identify one accepted immutable cut.

## Non-Closure Conditions

The proposed 5.0 target does not close when any of these is true:

1. T-217 or the 4.6 release boundary remains open without an explicit narrowed
   claim and durable successor ownership.
2. Any definition-bearing 5.0 capability is carried as generic F_H debt.
3. GOALS, PRODUCT, requirements, design, implementation, and release claims do
   not trace through one current chain.
4. The public operator/API contract remains contradictory across PRODUCT,
   witness/tuner requirements, implementation, and documentation.
5. The conformance corpus imports TypeScript realization or produces only a
   test count instead of exact constitutional results.
6. Runtime campaign certification is conflated with static language/runtime
   conformance.
7. Self-hosting is claimed from only one prior-release run, from a source-tree
   runtime, or without C1/C2 equivalence.
8. The qualifying scenario or law changes during the proof window.
9. A supervisor act is out of framework, an actual halt is untriaged, or a
   healthy run produces a false defect draft to satisfy a quota.
10. Installed commands, docs, conformance, or campaigns depend on mutable
    abiogenesis source paths or authoring-only knowledge.
11. Public installation still depends on `private: true`, `file:` hash paths,
    undeclared agent CLIs, or personalized `/Users/jim` instructions.
12. Tenant code emits ABG runtime events, owns continuation, or decides closure
    outside the public ingress and runtime carriers.
13. The GLC proof uses an `odd_glc` source checkout, placeholder `0.0.0`
    package, or untapped artifact while claiming a released GLC.
14. C1/C2 equivalence excludes undeclared differences or ignores public
    exports, install manifests, runtime bindings, conformance, or behavior.
15. Release evidence is not bound to the exact branch, tag, package, manifest,
    snapshot, and installed identity being tapped.
16. Cross-repo method or GLC work is closed by the abiogenesis ticket without
    its owning repo's accepted authority and proof.

## Explicitly Outside This 5.0 Target

- Python parity/reactivation tickets T-092-PY, T-094-PY, and T-095-PY;
- production Scala ABG and cloud-native ABG tenants;
- PnL-Explain and domain-builder product tenants;
- hosted multi-tenant RBAC/authentication;
- odd_service/odd_manager orchestration plane;
- F_H email/web approval infrastructure;
- BPMN, Airflow, Step Functions, ReqIF, DOORS, Jama, CrewAI, and OpenLineage
  integrations;
- promise-graph execution unless the measured self-build wall time makes it a
  release blocker and a new ticket reprices it;
- GTL4 subtype dispatch and general GTL4 ratification machinery;
- patents/IP disposition, which remains a separate F_H/legal decision;
- B-010 odd_sdlc governance induction unless its external dependency is
  separately selected and admitted;
- T-178/T-179 registry work absent a concrete 5.0 public claim requiring it.

These items are not rejected. They are outside the bounded release claim and
retain or require their own durable triggers.

## Promotion Plan

1. Review this post against T-218 and record each row as
   `accept | reject | modify | separate | defer`.
2. F_H chooses one target or a merged target and records the decision.
3. Add the accepted 5.0 goal to `specification/GOALS.md` under
   `goal_reprice`.
4. Confirm that existing INTENT remains directionally sufficient or perform an
   explicit intent reprice; in either case reconcile the stale Python-carrier
   statements with current product truth.
5. Reprice `PRODUCT.md` for the accepted product identity, public boundary,
   operator/API contract, and released GLC dependency.
6. Reprice or add requirement families for self-hosting, conformance,
   certification results, public ingress, and any unresolved authority law.
7. Ratify design modules before realization.
8. Create a feature-target/index ticket with canonical fields and one leaf
   ticket per independently closeable unit.
9. Create repo-local dependency tickets in `odd_glc` and, if accepted,
   `specification_methodology`.
10. Link, amend, supersede, or close T-218 so only one active feature-target
   authority remains.
11. Admit execution sprints only after the authority and dependency graph is
    current.

## F_H Review Queue

1. Accept or reject the one-sentence 5.0 claim.
2. Decide whether public third-party consumption is a product reprice under the
   existing intent or an explicit intent reprice.
3. Decide whether handler authority, EVENTS-025 scope semantics, and residual
   runtime items must close in 4.6 or narrow the 4.6 claim.
4. Require or remove the separately tapped GLC release from the 5.0 headline,
   and choose pre-tap RC qualification plus post-tap identity verification or a
   post-tap qualification addendum.
5. Choose the public registry/distribution contract and license.
6. Ratify the six-class public ingress catalog or its corrected replacement.
7. Ratify the C1/C2 equivalence fields and nondeterminism exclusions.
8. Decide whether pass@k and generic harness work remain supporting 5.0 scope or
   move to post-5.0 qualification.
9. Decide whether the shared comment-to-spec lifecycle is a separate upstream
   method change or a 5.0 dependency.
10. Confirm the explicit exclusions and deferred triggers.
11. Select promotion disposition for T-218: amend, supersede, or merge.

## Recommended Action

Open review on this post alongside T-218. Do not promote either feature list by
copying the table alone. Promote the accepted target through GOALS and PRODUCT,
then create the requirement/design surfaces and independently closeable tickets
that make the target executable.
