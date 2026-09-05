# STRATEGY: Postmortem follow-up on reference frames, roles, and method tuning

- **Author**: Codex
- **Date**: 2026-09-05T03:23:03Z
- **Updated**: 2026-09-05T05:14:54Z
- **Addresses**: T-287 postmortem, STDO Product use scenarios, and the enhancements they justify
- **Status**: Open
- **Direction**: Logical lifecycle and proportionate use first; enhancements follow scenario and cost evidence
- **Authority**: Commentary only

The model starts with the user's lifecycle and intended outcome. Its headline
capability is choosing proportionate treatment of ordinary work, correcting a
mistaken choice cheaply, and satisfying the declared completion condition within
an explicit cost envelope. The scenarios below supply that candidate basis.
The ranked recommendations remain enhancement hypotheses whose implementation
must follow scenario-based gap analysis.

The highest-value change is to make each reference frame answer a bounded
question with decisive evidence, then make review and orchestration proportional
to that question. More mandatory frames, documents, or reviewers would likely
reproduce the delivery cycle this postmortem describes.

This follows the [canonical-root handover and its 24-hour postmortem](20260904T014553Z_HANDOFF_t287_canonical_root_stage1_to_stage2.md#postmortem-findings-from-the-24-hour-delivery-cycle).
It also uses the subsequent [RC4 development-context update account](20260905T030521Z_REPAIR_rc4_context_update_result.md)
as separate evidence of an ownership-routing failure. It converts the requested
analysis into one strategy post; it does not adopt the proposals, change current
work selection, or supply an acceptance verdict. The handover's recorded Stage 1
HOLD, Stage 2 block, and suspended campaign evidence remain historical observations
whose current disposition must be resolved from their owning authority.

The analysis uses Specification, Ticketing, Design, and Outcome-Driven Development
(STDO) `v2.5.0-rc.4`, selected by the [ABIogenesis Product Definition Overlay](../../../stdo_abiogenesis.json),
with manifest SHA-256
`4fa2556d0127bebce8f7184cc4a3cb708a175b2e40552c55cb211f2426d5049e`.
The [project reference-frame basis](../../../build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md)
and [agent instructions](../../../AGENTS.md) supply the local configuration being
assessed. Exact RC4 references below identify the evaluated method; proposed
revisions would enter successor authority through its owning standard.

The ranking weighs observed harm, recurrence likelihood, existing fail-closed
controls, repair cost, and the risk that a repair becomes another design or review
programme. It ranks expected improvement in accepted delivery, rather than ease
of implementation. The evidence is one delivery cycle plus the separate updater
incident. It does not support quantified savings or a controlled comparison of
model effort settings. Postmortem finding numbers are retained for traceability.

The revised model follows two inputs received on 2026-09-05: Claude's critique
of classification, computation, closure, owner interaction, and cost; and the
user's direction to derive common use cases from a logical functional lifecycle.
The critique is analysis input, not an owner ruling. Incident evidence motivates
qualification cases; it does not define the Product's logical vocabulary.

The headline capability is proportionate treatment of an ordinary request. The
practitioner arrives with an intended outcome and available context, not a correct
classification supplied by the fixture. STDO use should help the practitioner
find the smallest sufficient scope, evidence, and decision path, detect a mistaken
classification early, and finish within a declared operating-cost envelope.
This is a central user capability within STDO's broader Product boundary.

The Product interaction model has two related lifecycles:

| Lifecycle | Logical progression | User-visible continuity |
|---|---|---|
| Relationship with STDO | Understand applicability; establish usable context; use it; maintain or change that context; suspend or conclude participation. | What STDO provides, what is required to begin, what is currently selected, what will change, and what remains retained or outstanding. |
| Individual work engagement | Express an outcome; establish proportional treatment; perform authorized work; evaluate the completion condition; conclude or continue from an explicit unresolved condition. | What is being pursued, why this path is appropriate, what has happened, what may happen next, what needs a decision, and whether the result is complete. |

Observation, owner decisions, interruption, correction, and recovery may occur
where relevant in either lifecycle. They do not require a full restart. These
are logical user relationships, not prescribed screens, record schemas, runtime
states, or a fixed sequence of agents. Successful first use should require only
the information material to the selected outcome; further detail remains
available when needed. A returning user should be able to recognise current
state and continue without reconstructing the original setup experience.

The primary users are the practitioner pursuing work, the maintainer establishing
or changing its context, and the owner choosing outcomes or making reserved
rulings. An independent assessor participates when the selected claim requires
one. A practitioner can be human or an agent operating under an existing grant.
Executive, Worker, and Reviewer describe bounded responsibilities and evaluation
frames; they do not determine the number of actors or the interaction medium.

STDO supplies its normative standards and admitted auxiliary surfaces. The
consumer retains Product meaning, work selection, construction, and acceptance
authority. STDO Representation and Axiom Indexer remain separate selected
Development Products. This boundary was checked against the STDO Product
definition at source commit `7a25668a8fecfd26f895759af3bec4708727964a`, path
`specification_methodology/specification/PRODUCT.md`, particularly `Product`,
`Reference-Frame Engagement`, and `Exclusions`. The selected RC4 standards remain
the governing method; this is a proposed use model for subsequent owner intake.

Every functional step below identifies its evaluation responsibility:

- **C — computed:** a deterministic result over declared inputs, including
  integrity checks, exact comparisons, explicit dependency checks, accounting,
  and projections of authoritative records. Its input basis and limits are
  observable. Recording or changing state still requires the owning operation
  grant; computation itself supplies no permission.
- **J — judged:** contextual interpretation, materiality, proportionality,
  causal assessment, or semantic evidence sufficiency. The actor states its
  basis, uncertainty, and the observation that would change its conclusion.
- **O — owner ruling:** a decision reserved to the identified owner, or to a
  proxy within an exact delegation. It binds the question, subject, basis,
  scope, and permitted consequences. The original ruling remains distinct from
  an agent's interpretation.

C, J, and O are explanatory annotations for this model, not new STDO functor
kinds or a mandated processing pipeline. The split does not assert that semantic
classification or all closure can be computed. Axiomatically, a predicate that
is not deterministically decidable must retain its declared judgment kind. See
[Axiomatic Calculus](stdo://releases/v2.5.0-rc.4/standards/AXIOMATIC_CALCULUS.md),
`Constraint` and the generic functor-kind definitions.

The important boundaries inside mixed functions are:

| Function | Computed facts and operations (C) | Interpretation or decision (J / O) |
|---|---|---|
| Establish context | Resolve explicit identities and locations; verify selected inputs; report ambiguity and missing dependencies. | J determines material applicability where the context does not settle it. O selects or changes the governing basis when that choice is reserved. |
| Recover work state | Read owning records; capture selected preimages; compare identities; follow declared dependencies; recover recorded grants and conditions. | J interprets newly material changes and uncertain dependencies. O supplies a genuinely missing reserved decision. Conversation plausibility does not fill a missing record. |
| Check evidence | Verify subject binding, recorded results, explicit expiry or invalidation, and mechanically decidable predicates. | J assesses whether the evidence proves the intended semantic claim and whether an undeclared interaction matters. O gives a required acceptance or risk ruling. Byte equality alone cannot settle these questions. |
| Classify failure | Preserve original diagnostics, declared error categories, effect receipts, and known effect status. | J resolves an ambiguous cause or applicability of recovery. O authorizes a changed scope or reserved risk decision. Unknown effects remain unknown. |
| Explain progress | Project the selected outcome, recorded conditions, evidence, decisions, cost, and unresolved items. | J can explain implications or propose priorities, clearly marked as judgments. O selects changed priorities. A summary does not author work state. |
| Apply a ruling | Record the exact authorized ruling once; derive its status consequences under the owning contract; expose stale or failed projections. | J prepares the decision question and consequences. O decides. A materially changed interpretation returns to O rather than silently altering the ruling. |

The following scenarios retain their existing identities where their function
continues. USE-02 is expanded into the headline proportionality scenario;
USE-05 is narrowed to evidence assessment. USE-11, USE-12, and USE-13 supply the
previously missing owner, orientation, and conclusion experiences. Order in this
table expresses emphasis and lifecycle coverage, not a mandatory execution order.

| Scenario and user intention | Starting condition and logical interaction | Completion condition and decisive alternatives | Effort outcome |
|---|---|---|---|
| `STDO-USE-02` Obtain proportionate treatment | An ordinary outcome request has not been preclassified for the practitioner. C supplies the selected context, known effects, grants, and available evidence. J classifies the request as information-only, local realization, design-boundary change, Product/requirement-boundary change, operational treatment, or explicitly uncertain. J chooses the cheapest useful discriminator and revises the classification when evidence warrants it. O acts only on a genuinely reserved choice. | The selected path is sufficient for the affected relations and introduces no unnecessary obligation. A lawful local case completes without independent review when its governing condition does not require it. Material semantic or authority changes are detected before an effect or promotion relies on the wrong classification. A mistaken initial classification is corrected within the declared recovery allowance. | The route and its correction fit the case envelope. No repeated classification of the same unchanged facts merely because another role starts; no extra independent review, durable carrier, or owner interruption without an applicable need. |
| `STDO-USE-12` Understand applicability and readiness | A prospective or unfamiliar user wants to know whether and how STDO supports the intended work. C exposes the supported capabilities, available context, and known prerequisites. J explains applicability and the next useful step using the user's intended outcome. O chooses adoption where needed. | The user can identify the relevant capability, required inputs, material limits, and readiness state. Supported, unsupported, and undecidable applicability remain distinguishable. Understanding the method does not itself mutate or adopt a project. | Time and attention to a useful first answer are bounded. Only material prerequisites are requested; the user need not study the full method or answer questions already resolved by available context. |
| `STDO-USE-01` Establish usable context | A maintainer chooses to begin using STDO for a selected Product. C resolves and verifies the authorized selection, binds existing surfaces, and reports conflicts. J resolves contextual ambiguity. O makes any reserved selection; authorized effects establish the agreed context. | An ordinary first task can recover its governing basis and owners. Existing meanings and unrelated work survive. Ambiguous or incomplete context is reported accurately and is not presented as ready. | Setup fits its case envelope and leads to a useful first task. No duplicate configuration, repeated setup, or repeated owner selection for the same unchanged context. |
| `STDO-USE-03` Achieve and close a bounded outcome | USE-02 has established the current treatment, subject, grant, completion conditions, proof obligations, and cost envelope. C obtains mechanical facts and checks. J constructs and self-assesses the bounded change. USE-05 supplies specifically required assessment; USE-11 supplies a specifically required owner ruling. C evaluates computable condition parts and projects the resulting state through its owner. | The declared completion condition is met on the exact subject with valid evidence, and no applicable non-closure condition remains. Closure is not defined as holding a review or receiving a conversational GO. Unmet or undecidable conditions remain visible; a changed governing relation returns to USE-02/04. | The case meets its declared execution and method-overhead bounds. Where all required conditions are satisfied without independent assessment, there are zero additional review rounds solely to create a closing event. |
| `STDO-USE-04` Revise a governing outcome or relation | Classification identifies an actual insufficiency in the current governing basis. C identifies affected records and known dependents. J describes the desired outcome, exact insufficiency, options, and consequences. O selects the bounded change or declines it. C preserves the recorded predecessor/successor relation; J derives affected requirements and design. | Any retained construction relying on new meaning is supported by the appropriate owner's decision. Decline or uncertainty leaves the previous basis intact and the unresolved issue understandable. The affected scope remains bounded. | Decision preparation and re-entry fit the case envelope. Unaffected work is reused; no broader redesign follows merely from naming a boundary. |
| `STDO-USE-05` Establish evidence sufficiency | A claim has stated completion conditions and applicable assessment requirements. C verifies exact subject and evidence bindings and runs declared deterministic checks. J examines semantic sufficiency and counterexamples, independently when required. It returns evidence and findings, with uncertainty. | The assessment supports or challenges the stated condition on the exact subject. Required independence is real. Assessment does not redefine the condition, decide every owner question, or become the closing event. A new material counterexample invalidates the affected claim; an unrelated observation does not silently widen it. | Assessment stays within the declared envelope and affected relations. Repeated work requires changed evidence, subject, or a material counterexample. A no-finding case has no invented triage or repair round. |
| `STDO-USE-11` Understand and make an owner ruling | A genuine reserved choice is ready for the owner, with its question, exact subject, current condition, material uncertainty, options, consequences, and cost visible. C supplies authoritative facts and recorded status. J prepares a short truthful decision account. O rules, declines, or requests the specific missing evidence. C records the ruling once and projects its authorized consequences for consuming agents. | The owner can decide without reconstructing the work history. The recorded ruling preserves the original wording, scope, basis, and authority. A consuming agent recovers that same decision and applies only its permitted consequences. Ambiguous or stale questions are exposed before reliance. | Owner reading/interaction time fits its case envelope. One unchanged resolved question produces one ruling, zero manual repetition across projections, and zero renewed requests from later agents for the same authorization. |
| `STDO-USE-06` Continue after interruption | Work resumes without relying on hidden conversational context. C reconstructs selected state, records, preimages, grants, evidence, and explicit invalidation. J determines the significance of newly changed relations. O supplies only a genuinely missing reserved ruling. Authorized work continues from the last valid condition. | The intended work continues with preserved obligations and unrelated work. The user can distinguish reusable evidence, stale evidence, and unknown status. Missing or contradictory authority is surfaced rather than reconstructed from a persuasive narrative. | Resume time, context volume, and activations fit the case envelope. No re-authoring facts that C can recover, repeating unchanged decisions, or renewing evidence whose applicability survives. |
| `STDO-USE-07` Coordinate material work | The selected outcome spans material relationships or exceeds one useful attention context. C enumerates declared dependencies, exact inputs, subject changes, and evidence joins. J identifies additional material seams, selects bounded evaluations, and combines their conclusions. O resolves actual cross-owner choices within existing authority. | Every applicable obligation survives combination, including one found by only one evaluation. The composite outcome meets its declared condition; missing coverage is visible. Separate owners remain separate. | Coordination fits the declared envelope. Activations follow capability, independence, and work needs; a specialist label alone does not require an additional actor or review. |
| `STDO-USE-08` Recover valid progress | A refusal, failed check, interrupted dependency, or uncertain effect prevents the intended progression. C retains the original cause, known effect state, exact attempted subject, and declared retry conditions. J determines unresolved causality and proportionate recovery. O rules on any reserved change. C and the authorized performer execute only the admitted recovery. | Recovery addresses the actual failed relation and retains valid prior work. Uncertain effects prevent unsafe repetition. Unresolvable failure produces an intelligible bounded stop with the condition for resumption. | Recovery time, retries, activations, and discarded work fit their declared allowance. No repeated failed path without changed evidence or conditions, and no unrelated Product redesign to explain an operational failure. |
| `STDO-USE-09` Evolve the adopted context | A maintainer wants to change the selected development context. C determines the exact proposed delta, declared composition, compatibility inputs, and current dependent state. J interprets material consequences that are not decidable mechanically. O selects the exact scope. C performs authorized acquisition, verification, and projection. | The resulting context supports an ordinary task under the intended complete selection, or accurately reports why it cannot. Partial completion is not presented as readiness. Active work receives explicit invalidation or retained-basis treatment. Complete coordinated updating remains a target gap beyond RC4's basis-only adoption command. | Adoption and subsequent reorientation fit the case envelope. One accepted scope is consumed consistently; agents do not repeat selection or reconstruct the upgrade through unrelated local checks. |
| `STDO-USE-10` Improve STDO from observed use | A recurring shortfall is identified. C preserves observed outcomes, costs, inputs, and attributable differences. J separates incorrect use, poor projection, missing realization, and insufficient law; it proposes a bounded improvement. O selects any shared change. C retains exact release and adoption relations; J evaluates changed outcomes. | A reusable improvement has one owning authority and evidence against the affected use scenarios. Local circumstances remain local where appropriate. Publication and consumer adoption are separately established when claimed. | Improvement effort fits its declared envelope, and its claimed benefit is evaluated against comparable cases. More documentation or activity alone is not improvement. |
| `STDO-USE-13` Suspend or conclude participation | A user wants work or use of the selected context to end or pause. C inventories active effects, pending commitments, retained evidence, and known dependencies. J explains unresolved consequences. O selects the permitted end state. C performs authorized state changes and preserves the needed history. | The user can distinguish completed work, suspended work, and withdrawn work; what remains outstanding and what resumption would require are explicit. No silent loss of obligations, false completion, or inferred deletion follows. | Concluding or suspending fits its case envelope and requires no full historical reconstruction. Later status or resumption consumes the recorded condition without repeating the decision. |

All rows are logical functions of Product use. A row may contain C, J, and O
steps without implying that all three must run in every instance. Existing
sufficient inputs and rulings are reused. The user should see the outcome,
current condition, uncertainty, relevant choice, and cost implication; internal
role and tool mechanics need appear only when they help the user decide.

Closure is a condition over the exact work subject and governing basis:

`declared completion obligations satisfied + valid applicable evidence + no active non-closure condition`

A required judgment or reserved acceptance decision is an explicit input to that
condition where the governing law calls for it. A review event by itself is
neither sufficient nor universally necessary. C computes what is decidable and
checks bindings to any required J/O results; J and O supply only their declared
judgments. An unmet or indeterminate condition cannot be projected as closed.
An authorized state update records the consequence; it does not make unmet
conditions true. Reopening requires a material invalidation or counterexample,
not the mere availability of another reviewer. See [Ticket Method, Execution
Contracts](stdo://releases/v2.5.0-rc.4/standards/TICKET_METHOD.md#execution-contracts)
and [Execution And Verification Authority Separation](stdo://releases/v2.5.0-rc.4/standards/TICKET_METHOD.md#execution-and-verification-authority-separation-stdo-up-007).

Cost is part of every scenario outcome. Each qualification case declares an
operating envelope before candidate exposure: expected and maximum agent
activations, total and method-overhead elapsed time, input/cache/output usage
where the host exposes it, owner attention and interventions, and an allowance
for correction or recovery. The end-to-end total is retained so work cannot be
made to look cheaper merely by moving it between actors or labels. Case scope,
host conditions, required independence, and externally imposed waiting are
recorded to make comparisons interpretable.

A case succeeds only when its functional and authority conditions hold and its
declared cost bounds hold. If functionality succeeds but the cost bound is
exceeded, the efficiency claim fails without erasing the valid functional
result. Missing accounting leaves the cost claim unestablished. Reaching a bound
prompts an explicit bounded stop or repricing; it never authorizes skipping a
required condition or an unsafe interruption of an effect.

The structural cost targets in this logical model are explicit: zero independent
review rounds for the ordinary local case whose conditions require none; zero
repeated owner rulings for an unchanged resolved question; zero manual
re-authoring of facts available as valid C outputs; and zero repetition of
unchanged satisfied obligations without an invalidation. Expected activations
and numeric time/token ceilings must be instantiated for each selected case
before qualification. They are open calibration inputs, not fabricated measured
limits or universal method constants. Until they are supplied, a case is not
ready to prove a bounded-cost claim. Baseline observations can inform the target
but do not themselves determine what cost the Product owner should accept.

The nonclaim/debt relationship remains an explicit owner question. The earlier
blanket assertion is withdrawn. A scenario preserves the current applicable
policy and records what has and has not been ruled; it does not silently classify
an excluded guarantee as debt or erase a governed obligation. USE-11 must support
that decision from the exact scope, evidence, existing policy, and consequences.
This post adopts neither general outcome.

Qualification starts with ordinary user intentions and normal supported
capabilities. Expected classifications, condition oracles, meaningful alternate
paths, and cost envelopes are established independently before the candidate
acts. The practitioner receives the evidence needed to decide, not the correct
classification or intended method response. The headline bundle exercises a
minimal sufficient path, material re-entry, an operational path, uncertainty,
and correction of an initially wrong route. Other bundles establish orientation,
first useful action, owner decision consumption, continuity, evolution, and
conclusion. Concrete incidents can instantiate those functions later.

Evidence must show the user outcome and the complete declared path, including
which steps were computed, judged, or ruled upon and what they cost. Computed
outputs require deterministic checks; J/O boundaries require their declared
assurance. A real-agent use claim needs evidence from the supported real-agent
path. Correct prose or skill discovery alone cannot close it. See [Scenario
Bundle Rule](stdo://releases/v2.5.0-rc.4/standards/SPEC_METHOD.md#scenario-bundle-rule),
[Derived User-Acceptance Frame](stdo://releases/v2.5.0-rc.4/standards/STDO_REFERENCE_FRAME_BASELINE.md#derived-user-acceptance-frame),
and [Derived End-To-End Frame](stdo://releases/v2.5.0-rc.4/standards/STDO_REFERENCE_FRAME_BASELINE.md#derived-end-to-end-frame).

The six enhancement proposals remain possible realizations of this model:

| Enhancement candidate | Use-scenario basis | Required improvement |
|---|---|---|
| Applicable entry through shared skills | USE-12, USE-01, USE-02, USE-05 | Users reach the appropriate capability and proportionate path through ordinary requests, including read-only and uncertain cases, within the entry envelope. |
| Compact source-linked context | USE-02, USE-03, USE-06, USE-11 | C supplies current facts; J receives the material decision context; the user or owner receives a short truthful account. Completeness and cost are measured, not inferred from prompt length. |
| Applicable examples | USE-02, USE-04, USE-05, USE-08 | Classification and correction improve on independently selected cases without prescribing extra work for the ordinary path. |
| Shared mechanical checks | USE-01, USE-05, USE-06, USE-08, USE-09 | Computable facts and conditions become reproducible C outputs; semantic uncertainty and owner choices remain explicit. |
| Continuation and evidence reuse | USE-03, USE-06, USE-09, USE-11, USE-13 | State, decisions, and applicable evidence survive interruption and change without duplicate rulings or false closure. |
| Behavioural qualification | All selected cases and material combinations | Functional outcomes, lawful paths, correction behaviour, UX effort, and scenario cost limits hold together. |

The owning STDO intake selects the authoritative lifecycle and scenario surface
before implementation. These identifiers remain proposal locators in this post;
there is no current coverage claim or new normative catalog. Once adopted, the
post should refer to the owning model rather than maintain a competing accepted
copy. Gap analysis classifies deficiencies in capability, interaction, method,
projection, computation, judgment support, or evidence. Only then does a selected
enhancement acquire requirements, design, and an implementation owner. This model
does not select a UI framework, a prompt engine, or an agent orchestration system.

The original forced ranking follows. Its order is retained as a hypothesis about
delivery benefit, to be tested and repriced against the scenario model.

1. **Choose proportionate treatment and the cheapest decisive falsifier.**
   Postmortem findings: 3, 4, 7, 8, and 15.

   Apparently successful live evidence was obtained before establishing where
   authored effects belonged. The later package collision exposed the root
   error and invalidated the earlier basic acceptance. A model-free check could
   have challenged that relation before the live cost was incurred.

   Classification is part of the work, not a correct answer supplied at intake.
   Computed facts support a judgment about the smallest sufficient treatment,
   and a cheap discriminator must be able to overturn a mistaken classification.
   The activation binds the question, governing relation, affected effects and
   boundaries, evidence that could disprove the claim, and explicit exclusions. In canonical-root work, the relevant relation
   includes authored writes under `A.canonicalRoot`, preservation of the installed
   Product, and conservation of applicable Public contracts. Root-address and
   collision proofs should precede live calls that depend on them. Model-free
   proof does not substitute for the later installed or user-outcome claim.

   This is primarily an application failure: RC4 already requires the cheapest
   focused proof capable of falsifying the active relation. Use a small
   claim-to-evidence mapping in the existing work carrier. Do not require a new
   artifact or every possible refusal test for every activation. The frame covers
   known material relations and their selected acceptance/refusal branches.
   See [Spec Method, Transition Evidence And Proof Cadence](stdo://releases/v2.5.0-rc.4/standards/SPEC_METHOD.md#transition-evidence-and-proof-cadence)
   and [Reference Frame Laws](stdo://releases/v2.5.0-rc.4/standards/REFERENCE_FRAME_METHOD.md#reference-frame-laws).

2. **Bound Reviewer jurisdiction and make reopening depend on a material change or counterexample.**
   Postmortem findings: 5 and 6.

   Review repeatedly expanded into hostile-local guarantees beyond the selected
   trusted-developer-desktop boundary. Reviews also exposed real missing seams,
   including Public compatibility and owner unity. Both observations matter:
   independent review protected the claim, while unselected hardening consumed
   work without closing the admitted outcome.

   The proposed Reviewer return identifies whether a finding falsifies the
   selected claim, violates applicable authority, breaks retained behaviour, or
   forecloses an admitted outcome. It reports likelihood, harm, existing controls,
   uncertainty, and bounded repair implications. Executive assigns priority under
   its existing grant. The selected threat model remains operative throughout
   review; an excluded hostile-local guarantee cannot become a closure obligation
   through repeated scrutiny.

   The relationship between an accepted nonclaim and technical debt remains an
   owner ruling. The prior categorical recommendation is withdrawn. Preserve
   applicable policy and make any uncertainty explicit; neither create nor erase
   an obligation by agent interpretation. USE-11 should present the exact scope,
   evidence, existing policy, and consequences for a bounded decision. See
   [Evidence Ordering, Steel Threads, And Deferred Assurance](../../../AGENTS.md#evidence-ordering-steel-threads-and-deferred-assurance).

   Replace the handover's proposed "repair only exact returned findings" with
   bounded reassessment: repair the finding, reassess affected dependencies, and
   admit newly discovered counterexamples when they materially challenge the
   claim. Reuse accepted relations whose basis and applicability survive the
   change. A fixed review-count limit cannot substitute for those conditions.
   RC4 already bounds blocking findings and says observations outside the boundary
   do not themselves require another ticket, artifact, or review round. See
   [Ticket Method, Execution And Verification Authority Separation](stdo://releases/v2.5.0-rc.4/standards/TICKET_METHOD.md#execution-and-verification-authority-separation-stdo-up-007).

3. **Separate frame selection from agent allocation.**
   Postmortem findings: 6, with consequences for 1 and 16.

   The postmortem proposes three independent frames before implementation. That
   can be useful where independent evaluations resolve material uncertainty. As
   a universal procedure it adds three contexts and a synthesis step before
   construction has produced a reviewable candidate.

   RC4 describes specialist frames as available evaluation families, not
   mandatory actors or stages. ABI's instruction to split materially distinct
   frames across separate Workers or Reviewers is a stronger local constraint.
   The proposed revision makes separate actors conditional on a stated need for
   independence, capability, manageable context, or independently executable work.
   Several specialist questions can fit one bounded Worker or Reviewer activation.
   See the [RC4 baseline's Canonical Compression](stdo://releases/v2.5.0-rc.4/standards/STDO_REFERENCE_FRAME_BASELINE.md#canonical-compression)
   and ABI's [Map-First Reference Frames](../../../AGENTS.md#map-first-reference-frames).

   The handover's wording "synthesize only their intersection" should be
   corrected. An obligation discovered by only one frame must survive synthesis.
   RC4 specifies coverage as the union of admissible observations, with a
   conjunction satisfying every applicable constraint. Conflicts and residuals
   remain visible. Reviewer agreement is not an acceptance criterion. See
   [STDO Reference-Frame Baseline](stdo://releases/v2.5.0-rc.4/standards/STDO_REFERENCE_FRAME_BASELINE.md),
   the paragraph beginning "Coverage records the union of admissible observations".

4. **Author each decision once, derive its status projections, and route repairs to their owner.**
   Postmortem finding: 2. Additional evidence: the RC4 updater incident.

   A conversational GO with durable HOLD surfaces is a real delivery failure.
   Requiring several independently authored accounts to be manually reconciled
   after every gate creates another recurring failure mechanism.

   When a Reviewer verdict or Executive disposition is required, the proposed
   arrangement uses its existing owning carrier; each distinct decision is
   authored once. Otherwise the declared completion condition governs without
   adding a review event. Other status views resolve to, or
   are derived from, those records. Dependent activation consumes the relevant
   authoritative decision. A stale projection is visibly stale. This proposal
   does not introduce a new ledger or silently change the authority of Goals,
   tickets, reviews, or design.

   The updater incident exposes an upstream contract gap. RC4's `adopt` command
   explicitly changes only the selected basis and its basis-relative schema
   locator. Successful basis adoption therefore cannot establish complete
   updating of selected Development Products and their projections. That broader
   outcome needs an explicitly owned shared workflow. The existing gap is
   recorded in STDO backlog T-029, as linked by the [repair account](20260905T030521Z_REPAIR_rc4_context_update_result.md).
   See [Spec Method, Shared Installed Release Basis And Toolchain Manager](stdo://releases/v2.5.0-rc.4/standards/SPEC_METHOD.md#shared-installed-release-basis-and-toolchain-manager).

   The constructor's attempt to put updater verification mechanics into ABI
   `PRODUCT.md` was an ownership error. The user rejected it and the repair
   account records restoration of the affected authority surfaces. Generic
   updater semantics belong with the owning shared tooling contract; local
   consumer instructions should route to that authority and its released tools.

5. **Reduce mandatory documentation gates and place applicability conditions beside their rules.**
   Additional method findings arising from the postmortem analysis.

   Three RC4 wording problems deserve successor-method review:

   - The baseline's "Empirical Revision Boundary" says the engagement relation
     requires an independently activated Reviewer, while "5A. Candidate Does
     Not Require Independent Review" explicitly permits the conditional branch.
     The overview should state the condition directly so a short reading or
     compression does not prescribe a reviewer for every local step. Both
     passages are in the [STDO Reference-Frame Baseline](stdo://releases/v2.5.0-rc.4/standards/STDO_REFERENCE_FRAME_BASELINE.md).
   - The Design Method requires an accepted ontology and all three diagrams for
     every new or materially changed semantic or typed module boundary. The
     proposed revision makes required representations depend on the material
     uncertainty being resolved. Stateful, effectful boundaries can justify all
     three. A small stateless boundary should not need a lifecycle diagram solely
     for closure. Existing exemptions for unchanged boundaries help but do not
     resolve this breadth. See [Ontology And Three-View Behavioral Design Gate](stdo://releases/v2.5.0-rc.4/standards/DESIGN_MODULE_METHOD.md#5e-ontology-and-three-view-behavioral-design-gate).
   - The instruction to reconstruct the complete selected function at closure
     needs a clearer account of which accepted relations remain reusable after
     repair and what invalidates them. Otherwise each round can reconstruct the
     same chain despite the proportionality rules. This clarification must retain
     the duty to examine material live relations and new counterexamples. See
     [Post-Ticket Design Review Rule](stdo://releases/v2.5.0-rc.4/standards/DESIGN_MODULE_METHOD.md#11d-post-ticket-design-review-rule).

   The general editorial change is to colocate each obligation, applicability
   trigger, proportionality limit, and reuse condition in its owning rule.
   Summaries and compressions should consume that rule without making it broader.
   The existing [Boundary And Governance Cost rule](stdo://releases/v2.5.0-rc.4/standards/DESIGN_MODULE_METHOD.md#boundary-and-governance-cost-stdo-up-005)
   already rejects extra authority centres, manually reconciled projections, and
   review burden as evidence of successful contraction.

   These are method-revision proposals, not permission to bypass RC4 or the
   stronger current ABI selection. The handover establishes review churn but
   does not isolate how much time the three-view gate consumed. That specific
   cost attribution remains unmeasured.

6. **Use compact, derived activation context with exact source routes.**
   Postmortem findings: 1 and 14.

   Full-history forks and repeated raw logs, manifests, and inventories enlarged
   context while making the operative frame harder to distinguish. The proposed
   packet contains the selected claim, basis, exact subject, permitted effects,
   material source routes, current evidence, exclusions, and return condition.
   Detailed evidence is read when the evaluation needs it.

   STDO Representation should help select and navigate that material. Copying an
   entire representation and history into each activation defeats finite
   attention. The packet remains a derived read model, with exact authoritative
   sources reachable whenever ambiguity or materiality requires re-entry. It
   does not become another maintained statement of method or Product meaning.

   Capture exact preimages for the selected mutation territory, especially in
   this dirty workspace. Do not turn every read-only activation into a fresh
   inventory of the whole repository. Preserve existing work and never infer
   the correct donor from `HEAD` alone. RC4 already requires known material
   relations, excludes irrelevant relations, and does not require proof that no
   undiscovered material relation exists. See [Reference Frame Laws, RF-002
   through RF-004](stdo://releases/v2.5.0-rc.4/standards/REFERENCE_FRAME_METHOD.md#reference-frame-laws).

7. **Qualify the harness before long scenarios and reuse evidence only while its bindings remain valid.**
   Postmortem findings: 9 and 15.

   Selector and lineage mistakes consumed full Data Mapper runs. The proposed
   sequence proves those interpretations against retained logs or a short
   scenario before paying for the long campaign. Timeouts use observed duration
   with an appropriate cleanup margin.

   "Run once per frozen candidate" is a scheduling preference, not a sufficient
   law. A repaired harness may require another run; unchanged applicable evidence
   may justify reuse without one. Rerun when the candidate, harness, environment,
   or claimed relation invalidates the evidence.

   Keep source, executable, installed-subject, and evidence identities distinct.
   A matching package digest does not establish all four. Put those joins in the
   owning qualification workflow at its declared boundaries. They should not
   become repeated manual ceremony for unrelated local work. See [Spec Method,
   Transition Evidence And Proof Cadence](stdo://releases/v2.5.0-rc.4/standards/SPEC_METHOD.md#transition-evidence-and-proof-cadence).

8. **Classify operational failures before deciding that Product repair is needed.**
   Postmortem findings: 10, 11, 12, 13, and 16.

   A buffer limit looked like artifact corruption; a path refusal was obscured
   by a later contract diagnostic; backend dispatch failures consumed retries
   without producing work. The proposed handling preserves the first causal
   diagnostic and distinguishes authority refusal, implementation failure,
   contract failure, harness error, capacity failure, and service failure. Each
   category reaches its actual owner.

   Literal workdirs, verified dependency/output roots, and capacity-aware reads
   belong in execution and qualification tooling. Select isolation controls for
   the actual effects and trust boundary rather than requiring physical dependency
   copies for every activation.

   Replace the universal proposal to convert every live failure into a
   deterministic regression. Controllable Product defects should gain focused
   regressions. Dispatch outages require bounded operational handling. Retry
   permission depends on the failure category and whether effects may already
   have occurred; a retry count alone does not establish safe repetition.

9. **Tune model effort empirically after narrowing work and repeated context.**
   Postmortem finding: 17.

   The recorded attempts do not establish that one effort setting is generally
   superior. They were different attempts, and the cheaper behavioural success
   was subsequently suspended for incorrect root semantics. External live-call
   receipts also do not constitute the account's complete usage ledger.

   Use bounded routine work to establish a starting setting. Escalate for a named
   unresolved reasoning problem, then measure whether escalation improves accepted
   results. Executive work can include difficult authority and priority decisions;
   its role label alone does not justify low effort. A budget control must be
   enforced by an available mechanism before it is described as a hard cap.

   Compare cost and elapsed time per accepted checkpoint, review reopenings,
   invalidated evidence, and escaped defects. Record model, effort, input/cache/
   output usage where available, and agent count as explanatory variables. Raw
   token reductions or fewer reviews can appear efficient while reducing the
   value of the result. Missing usage data remains unknown.

The proposed role configuration preserves responsibility and independence while
making actor allocation conditional:

| Role or frame family | Bounded responsibility | Activation condition |
|---|---|---|
| Executive | Select the claim and material frames, allocate existing authority, judge priority where needed, and apply the declared conditions and reserved decisions. | Hold the selected outcome and unresolved frontier; use computed state and reacquire child detail only when material. A new review event is not a universal closure requirement. |
| Worker / Writer | Construct one coherent candidate within its operation grant, obtain focused evidence, self-review, return, and stop. | One bounded construction or transformation assignment. Writer is the Worker role with the relevant write grant. |
| Reviewer | Independently assess the exact candidate; report counterexamples, severity, uncertainty, and repair implications. | The applicable Product, qualification, release, risk, or admitted-work boundary requires independent assessment. Current stronger selections continue to govern until changed. |
| Specialist frames | Supply material evaluation questions inside the engagement. | Allocate a separate actor when independence, capability, context, or work separation warrants it. |

In canonical-root work, Product Composition, Owner, Effect, Install, Public
Boundary, and Proof questions are material. Their applicability establishes
coverage needs. The proposed configuration can cover them within bounded
construction and independent assessment without automatically allocating an
additional agent to each family. The current Writer activation updates this
commentary post under the user's direction to incorporate the critique through
a logical functional lifecycle and scenario model. Its write territory is this
post alone.

The recommended adoption sequence distinguishes existing law from proposed
changes and keeps each correction with its owner:

| Sequence | Proposed action | Owning surface and completion evidence |
|---|---|---|
| 1 | Select the logical Product lifecycle, user outcomes, completion conditions, C/J/O boundaries, and scenario cost envelopes before enhancement design. Resolve any reserved policy questions separately. | The owning STDO model and scenario surface, reached through ordinary intake. This post supplies the proposal and later refers to the adopted carrier. Numeric case limits and the nonclaim/debt ruling remain open inputs. |
| 2 | Establish ordinary-use baseline cases and classify the gaps, with proportional treatment, owner interaction, and first-use continuity explicitly exercised. | Exact outcomes, cost accounting, counterexamples, and recovery observations; distinguish method insufficiency, projection defects, missing computation, inadequate judgment support, and failure to follow adequate law. |
| 3 | Derive the bounded requirements and target design from each selected gap, then select implementation at its owning surface. | Generic rules in their owning standards; ABI-specific choices in its adopted basis; complete consumer updating through upstream T-029; interaction and mechanical improvements through their separately admitted Product owners. Each selected change cites its scenario and proving case. |
| 4 | Qualify the implemented outcome and cost against the declared conditions through ordinary Product use, then release and explicitly adopt when authorized. | Scenario-bound UAT and complete-path evidence for the exact subject, C/J/O results, and cost envelopes. Required review supplies evidence to the condition; review occurrence, skill discovery, or correct prose does not establish closure. |
| 5 | Compare accepted outcomes and operating cost before broadening the tuning. | Existing evidence and commentary carriers, recording claim complexity, elapsed time, usage where available, review reopenings, discarded evidence, and detected or escaped defects. Treat the result as observational evidence unless the comparison controls the relevant differences. |

This sequence proposes adoption work; it creates no new tickets or executable
selection. The shared-method route is defined by [Posting Guide, Shared Method
Adoption And Propagation](stdo://releases/v2.5.0-rc.4/standards/POSTING_GUIDE.md#shared-method-adoption-and-propagation-stdo-up-012).
One owning surface authors each rule or decision; other views resolve or derive
from it. No method revision is achieved by editing an immutable RC4 install or by
placing generic updater mechanics in ABI Product law.

The handover's [controls for every next activation](20260904T014553Z_HANDOFF_t287_canonical_root_stage1_to_stage2.md#postmortem-controls-for-every-next-activation)
should not be adopted wholesale. Each retained control needs a triggering claim,
an owner, and an invalidation condition. Root-effect checks belong before relevant
effects, qualification checks at qualification boundaries, and operational
controls in tooling. The finite frame must exclude inapplicable controls.

Retain what protected truth in this cycle: independent review at consequential
boundaries, exact evidence binding, fail-closed behaviour, preservation of dirty
work, and suspension of invalid acceptance. Evaluate the tuning by whether it
reduces repeated reconstruction and misplaced obligations while preserving those
protections and increasing accepted Product progress.
