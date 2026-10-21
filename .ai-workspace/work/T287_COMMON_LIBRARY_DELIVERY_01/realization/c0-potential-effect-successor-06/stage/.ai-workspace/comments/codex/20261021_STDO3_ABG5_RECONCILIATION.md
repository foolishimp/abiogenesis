# STDO 3 reconciliation of ABIogenesis 5

Date: 2026-10-21. This commentary records the reconciliation; Product,
requirements, accepted design and T-287 retain their respective authority.
The exact document subject, independent assessment and disposition are recorded
in [the work record](../../work/T287_STDO3_RECONCILIATION_01/activation.md).
Runtime conformance and release remain open.

## Result and change in direction

ABIogenesis already defines the essential calculus: GTL's graph and seven C
constructors, HoG's direct traversal, ABG admission and Event Calculus, typed
Effect composition, current context, correction and continuation. STDO 3 makes
the complete binding between those relations and the Product obligations
explicit. It also requires design to expose material alternatives before
implementation makes a durable choice between them.

The new [computational binding](../../../build_tenants/abiogenesis/typescript/design/ABI5_STDO3_COMPUTATIONAL_BINDING.md)
joins the requirements calculus, computational calculus and concrete execution
environment. It accounts for legal inputs, composition, results, authority,
effects, currentness, reconstruction and resource behaviour. Its coverage
domains are the existing Product families, constructors, traversal relations
and affected producer-to-consumer paths.

The reconciliation changes the current documentation in four substantive ways:

1. The STDO runtime environment binds the exact released native source and
   declared access. A representation, index or access implementation is a
   dependency only when explicitly selected. Every required input still needs
   exact identity, permission, availability and sufficient evidence. This
   removes a compulsory dependency on a legacy cohort absent from standalone
   V3. It is a Product/requirement reprice; implementing and proving that
   destination remains separate.
2. The tenant declares its computational binding and finite completeness
   obligations through existing semantic owners. Stale design projections
   assigning runtime events to the pure catalog are corrected against Product.
3. Requirement indexes and classification are reconciled against the actual
   requirement families, so a design acquisition does not silently omit a live
   family.
4. T-287 has one current delivery plan based on the later installed evidence.
   Earlier method, test-attempt and downstream-delivery routing becomes
   historical. Accepted semantics and evidence retain their original subjects.

## Basis and authority

- Method: `stdo://releases/v3.0.0-rc.1/`, manifest
  `069285ad5a79d59ca2dd835e34a54b3e537b0eeef99c29994b18c339dbe62232`.
  [The Definition](../../../stdo_abiogenesis.json) owns this selection.
- Initial subject: HEAD `727f1dbcab3c198f7704735fdf91b994b7aac243` plus the
  explicitly inventoried worktree in [basis.json](../../work/T287_STDO3_RECONCILIATION_01/basis.json).
  A commit alone does not identify the current dirty candidate.
- Authority: [Goals](../../../specification/GOALS.md#current-selection),
  [Intent](../../../specification/INTENT.md),
  [Product](../../../specification/PRODUCT.md),
  [requirements](../../../specification/requirements/README.md), then design.
- Intake: `goal_reprice` for current work selection; bounded `product_reprice`
  and `requirement_reprice` for runtime method dependencies; `design_reframe`
  for their HOW, computational binding and conflicting projections.
- Scope remains ABIogenesis 5.0's fifteen selected families. No new language,
  compiler, controller, runtime truth path or feature family is selected.

The source-development method, a Program's admitted runtime environment,
an installed candidate and a qualification-law basis are separate coordinates.
Changing the first changes none of the others automatically. Old installed
subjects and Runs remain interpretable on their exact original bases.

## Application of the method

This is a law-to-owner applicability account, not a claim that every possible
method evaluation or every implementation clause has passed. Material
evaluations follow their affected Product claim; profiles are selected by
declared scope. Each method member below resolves under the exact basis above.

| Method member | Application to ABIogenesis |
|---|---|
| `FOUNDATIONS.md` | Keep meaning, representation, basis and authority distinct. Preserve algorithmic, informational and computational accounts. State the predicate behind each result and preserve failures and unknowns in conjunction. |
| `SPEC_METHOD.md` | Keep WHAT/HOW authority directional. Apply outcome conservation, smallest owning re-entry and §11's two-part tenant binding. Source development and current qualification use the selected exact basis. |
| `PRODUCT_DEFINITION.md` | The existing overlay locates constitution, local decisions, frames, WHAT, tenant HOW and work carriers. Empty companion composition is intentional. No supplemental map becomes selected through proximity. |
| `REFERENCE_FRAME.md` | Each material assessment binds its subject, basis, purpose, required relations, evidence, authority, invalidators and return. The project frame basis routes specialized views without duplicating law. |
| `ACTIVATION.md` | Bind current state A and outcome predicate Z. Give prerequisites finite bounds; preserve completed work and uncertain effects across restart. Declare transformations, composition, cost boundaries and valid reuse. |
| `EVALUATION.md` | Keep evidence, assessment and disposition distinct. Independent review evaluates the exact candidate. Design conformance, execution conformance, equivalence and categorical preservation are different claims. |
| `ASSURANCE.md` | Evaluate real producer/consumer joins and the whole computational path. Distinguish structural, integration, end-to-end and ordinary-user evidence. Derive tests from design obligations and actual risks. |
| `IDENTITY.md` | Preserve Product/Program/GraphFunction/catalog/lock/binding identities separately from observations, invocations and effects. Equal content does not imply equal authority or repeatable admission. |
| `RELEASE.md` | Preserve exact pre-RC, published RC, installed-RC qualification, actual human acceptance and post-publication installation boundaries. A changed qualifying subject needs its proper successor. |
| `TICKETS.md` | T-287 owns one current work selection, prerequisite order, evidence limits and exits. Historical active labels and successful repairs do not renew exhausted work authority. |
| `AXIOMATIC_CALCULUS.md` | Its typed representation and semantic/structural distinction govern any selected a_c model. Representation is optional for the ordinary tenant binding. Claimed categorical structure requires the additional demonstration specified by FOUNDATIONS. No map/tool is installed or inferred here. |
| `PROFILES.md` | Profile imports preserve their core owners; vocabulary similarity is not adoption. Explicit bindings determine what is applicable. |
| `ODD.md` | Applies to ABG's graph-native Product: declared graph work, typed compute regimes, cumulative environment, graph functions and existing runtime/Product ownership. Worker internal problem solving remains outside the framework lifecycle. |
| `DESIGN_MODULE.md` | Explicitly applied to the tenant: ontology, admitted domains, whole-family Prime, IACS, decision-complete material relations, three views, computational projection and recurrence. Existing accepted relations are reused; affected gaps receive bounded design work. |
| `EXECUTIVE_BASELINE.md` | The adopted project configuration allocates Executive/Writer/Reviewer responsibilities and specialist frames. Material coordination and independent assessment are used here; the profile supplies no runtime role hierarchy. |
| `TRAVERSAL_OCCURRENCE.md` | Optional and not adopted by this reconciliation. ABG's current runtime model is not silently renamed to this profile. Any future adoption needs an explicit interpretation and affected authority/proof analysis. |
| `WORLD_MODEL.md` | Its world-model publication model is outside this selected Product scope. Graphs, observations and contexts alone do not adopt it. |
| `UX.md` | No UX surface or Elm architecture is selected here. SDK/CLI remain subject to their existing public-contract and usability obligations. A future UI profile selection is explicit. |
| `CONFORMANCE.md` | Supplies discriminators for the claims to which its owners apply. Re-running the method's entire qualification campaign is not an ABG release prerequisite. |
| `GLOSSARY.md` | Routes terms to owning contexts; equal spelling never supplies cross-context equivalence. |
| `POSTING_GUIDE.md` | This report is commentary. Its recommendations become operative only through their named Product, requirement, design or ticket edits and disposition. |
| `WRITING_GUIDE.md` | Current surfaces state current rules; historical acceptance and failed attempts remain explicitly historical. |
| `README.md`, frames, schemas and templates | Entry routes, derived acquisitions and structural tools support the owning standards. The verified overlay is a structural result; using a template or passing a schema is not semantic acceptance. |

## What a more exhaustive design means

For an affected boundary B, the design must account for its complete material
relation set: entities and identities, cardinality, invariants, authority and
its transitions, functions and composition, topology, lifecycle, public
contracts, admitted domains, failure/refusal, effects, closure, projections,
module mappings and material algorithms. Two admissible implementations may
differ in local algorithms; they may not silently differ in these governing
relations.

Completeness is therefore checked in three ways:

1. **Coverage:** every selected Product obligation has an owning design
   relation and realization/proof route, or an explicit unresolved obligation.
   All seven C constructors and retained traversal dimensions are included.
2. **Closure:** compositions preserve types, authority, effect ordering,
   cardinality, provenance and outcome meaning. Failure after a physical
   effect has an explicit reconciliation path; unknown completion remains
   unknown. No helper or callback becomes an undeclared constructor.
3. **Correspondence:** domain, sequence, state and computational views describe
   one system, and the actual reachable path realizes that system.
   Independently specified observations can falsify the correspondence.

A finite model can be exhaustively checked over its declared population.
Compositional arguments can cover larger families when their premises and
laws are discharged. A few successful executions cannot establish every
program or probabilistic response. Formal categorical claims additionally
need objects, arrows, arrow equality, identities, associative composition and
the claimed preservation proof. The reconciliation makes these obligations
visible; it does not invent proofs.

STDO's `F_D`, `F_P` and `F_H` calculus terms and ABG's compute regimes require
an explicit interpretation. In particular, deterministic ABG construction
or physical work is not automatically the a_c evaluator's proof operation.
The role and authority of each actual operation decide the binding.

## Computational cleanup and retained evidence

Computational similarity identifies a reuse candidate. The design still
compares identity/key law, ownership, ordering, mutation, failure, lifetime,
consistency and authority before commonizing it. A shared map or byte reader
does not merge the semantic responsibilities it serves.

The current cleanup is assessed over the complete chain: establish a fact,
select current input, assemble actor material, perform work, admit the result,
persist it, project it and continue/reopen. Each shared fact declares its
validity basis and invalidators. Required full-history output remains complete;
ordinary narrow reads need not materialize unrelated bodies.

| Retained work | What carries forward | What remains open |
|---|---|---|
| 232 definition reuse and 234 shared preparation | Bounded owner reuse, changed-input refusals and canonical caller preparation | Neither alone establishes the complete installed lifecycle |
| 236 installed definition composition | Exact packaging/install/Public proof for its selected definition-reuse subject | It explicitly excludes the joint runtime/native-material claim |
| 233 runtime-state and 235 native-material work, through Source44 | Current-state/body selection and payload work; later source/package/install correspondence and authentic preparation | Whole-path correction/restart, genuine semantic lifecycle and representative capacity |
| 237 continuation16 and its transport triage | Installed Source44 setup and actual native Testing task; the responder's schema refusal is retained | No C2 helper execution or completed red/repair/green path occurred there |
| Fixture17 and continuation17 | The fixture acknowledgment correction; exact stopped resource and physical install facts | Newest stop is admission of an already-held install scope; lawful reuse/changed-pair handling is required before continuation |
| Earlier accepted S5/S6, retained-work and continuation proofs | Their exact producer, subject, basis, observations and bounded conclusions | Changed package and method claims require affected applicability/reproof |

The [delivery assessment](../../work/T287_STDO3_RECONCILIATION_01/delivery-assessment.md)
links the exact returns and preserves the distinction between Source44
preparation, controlled execution, genuine user outcomes and qualification.
The older capacity failure is retained evidence, not the current immediate
stop and not a claim that later cleanup has already solved supported growth.

Resource evidence distinguishes startup, framework work, external computation,
transport, assurance, retained memory and durable data. Measures state units
and boundaries. Workload dimensions and any acceptance limits are selected
before qualification; no universal heap, token or time quota is introduced.
An effect is not repeated solely to improve its measurement record.

## Remaining decisions and release route

[T-287](../../tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md#current-delivery-plan)
is the sole current delivery schedule. Its remaining work is:

- Close the affected computational and runtime-environment design decisions,
  including the complete install/reuse/continuation relation.
- Reconcile current dirty source with the accepted design and frozen installed
  evidence; implement and prove only the affected differences.
- Complete the controlled correction/restart discriminator, then the
  prospectively selected genuine native lifecycle with independent assessment.
- Close the remaining fifteen-family, traversal-conservation and negative
  obligations on one exact candidate; obtain actual F11 and sole AF22 results.
- Publish unchanged qualified bytes, qualify the installed RC, obtain actual
  human acceptance and prove a fresh post-publication install.

Full Data Mapper completion, new odd_glc delivery, dedicated Consensus,
observer/tuner, native human-response resumption, extra host parity and dynamic
graph generation do not enter the selected 5.0 scope. Correctness and authority
duplication remain blockers; optional further compression of equivalent pure
helpers keeps the Product's declared later-release allocation.

This reconciliation completes the requested design/planning application only
when its exact document delta passes independent assessment and receives the
recorded disposition. It does not claim complete implementation traceability,
whole-Product Prime proof, live capacity, native qualification or release.
