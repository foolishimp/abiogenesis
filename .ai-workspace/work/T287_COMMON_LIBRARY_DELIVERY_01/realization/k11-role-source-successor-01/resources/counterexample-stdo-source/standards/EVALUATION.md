# EVALUATION

Tier 1. Owns how claims are justified and accepted: claims, evidence,
independent assessment, review results, acceptance, conformance of
realisations and the equivalence ladder, the qualification of frames and
of the method itself, and actual-use evidence of adequate attention.
Consumes [FOUNDATIONS](FOUNDATIONS.md), whose
[Results](FOUNDATIONS.md#results) own the core result values this member
uses; it defines no result values of its own.

## 1. Claims

A load-bearing claim names its exact subject, the property claimed, the
governing basis, the relation between witness and claim, the nearest weaker
property it excludes, and its falsifier, before a witness is selected.
Without these it is evidence discovery, not proof. Packaging, syntax,
compilation, presence, invocation or local behaviour never substitutes for a
semantic, authority-bearing, installed, release or end-to-end claim because
the weaker property is easier to measure (P6).

Where a claim about a construction concerns its recursive or repeated
work, it is one of the four kinds the construction relation keeps apart,
preservation, progress, termination and outcome satisfaction
([ACTIVATION §1](ACTIVATION.md#construction-relation)), and states which.
Its witness is an assertion whose predicate is the full obligation, a
necessary condition of it or part of a sufficient conjunction, and the
claim states which. Its expected result has assertion provenance and its
execution has execution provenance, as
[FOUNDATIONS §4 Assertions and observation](FOUNDATIONS.md#assertions-and-observation)
and [Parallel derivation and mutual assurance](FOUNDATIONS.md#parallel-derivation-and-mutual-assurance)
define them; a passing check of a necessary condition establishes that
condition and no more (P1, P6).

Boundary congruence. A checker, validator, harness, reviewer or other
assurance surface supporting promotion or closure binds the exact claimed
subject and its authoritative composition relation. Evidence over one file
or carrier proves only that boundary; it cannot establish a multi-file or
carrier-set claim. Cross-carrier satisfaction and conflict are decided at
the declared composite boundary (P3, P6). A claim of mechanical enforcement
names an executable or reproducible predicate and a witness reachable
through the declared ordinary assurance path; a planned or
specification-only harness is planned evidence, not observed verification,
and until both the predicate and such a witness are observed the claim
remains open or is explicitly downgraded to the planned property (P6).

A claim's quantifier, population and scope cannot exceed its evaluated
evidence. Generalising a local defect or observation needs a declared
inference relation, the relevant comparable population, explicit
counterexample treatment and governing evidence. Later counterevidence
invalidates every dependent verdict until the claim-evidence relation is
superseded, withdrawn or requalified (P6). The quantifier rule and the
boundary rule are false if assurance observes a weaker or different
subject, if per-carrier evidence closes an unevaluated composite claim, if
mechanical enforcement lacks its predicate or a reachable witness, if
planned evidence is reported as observed verification, if a verdict outruns
its evaluated population or declared inference relation, or if dependent
verdicts survive material counterevidence without requalification.

### Foundation to law: claims, evidence, assessment and acceptance

This family, claims, evidence, assessment and acceptance (F6 in the index
of [FOUNDATIONS §3 Foundation to law](FOUNDATIONS.md#foundation-to-law)),
decides when a claim is supported, how it is assessed and who accepts it.
It covers §1 to §5 of this member. Its instance premises are: (a) claims
about exact subjects are relied on for promotion, closure or release; (b)
the evidence available is finite, and may observe a weaker or different
subject, or another basis, than the one claimed; (c) a constructing actor
may be probabilistic or otherwise fallible; (d) each boundary at which a
claim is relied on has a decision owner. They are conditions of the work
this family governs, not commitments, and do not follow from finite
capacity alone.
P0's premise that a step's output is a candidate until evaluated is cited
by name. The standing of the consequences below is stated in
[FOUNDATIONS §3 Foundation to law](FOUNDATIONS.md#foundation-to-law).

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|
| P6 (independent); instance premises a, b | By P6 evidence supports only the claim it is evidence for, and by (a) and (b) claims are relied on while the evidence is finite and may observe a weaker subject, so a load-bearing claim names its exact subject, the property claimed, the governing basis, the relation between witness and claim, the nearest weaker property it excludes and its falsifier before a witness is selected; without these it is evidence discovery, not proof. Packaging, syntax, compilation, presence, invocation or local behaviour never substitutes for a semantic, authority-bearing, installed, release or end-to-end claim because the weaker property is easier to measure | [§1](#1-claims), first paragraph | none | 9 |
| P3 (independent), P6 (independent); instance premise b | By P3 a claim binds its exact subject, and by (b) evidence may observe another subject, so an assurance surface supporting promotion or closure binds the exact claimed subject and its authoritative composition relation; by P6 evidence over one file or carrier proves only that boundary and cannot establish a multi-file or carrier-set claim, so cross-carrier satisfaction and conflict are decided at the declared composite boundary | [§1](#1-claims), Boundary congruence | each claim's composite boundary: the authority that declares the claimed subject and its composition relation | 2, 9 |
| P6 (independent); instance premise b | By P6 a claim holds only on observed evidence, and by (b) a plan is not an observation, so a claim of mechanical enforcement names an executable or reproducible predicate and a witness reachable through the declared ordinary assurance path; a planned or specification-only harness is planned evidence, not observed verification, and until both are observed the claim stays open or is downgraded to the planned property | [§1](#1-claims), Boundary congruence, the sentences on mechanical enforcement | the ordinary assurance path: the project's assurance design under [ASSURANCE](ASSURANCE.md#1-verification-layers) | 8, 9 |
| P6 (independent); instance premise b | By P6 a claim holds only as far as its evidence, and by (b) the evidence is finite, so a claim's quantifier, population and scope cannot exceed its evaluated evidence. Generalising a local defect or observation needs a declared inference relation, the comparable population, explicit counterexample treatment and governing evidence; later counterevidence invalidates every dependent verdict until the claim-evidence relation is superseded, withdrawn or requalified. The rules of §1 are false under the falsifiers §1 lists | [§1](#1-claims), the quantifier rule and its falsifiers | the inference relation and the comparable population of a generalisation: the author of the claim, who declares them with it | 9 |
| P6 (independent), P1 (independent) | P1 keeps a representation apart from its meaning, and P6 makes a verdict a claim on evidence that a separate decision authority disposes. So the semantic basis, the evidence basis and the state projection stay distinct, as do semantic law, evidence, the evaluator's application and the disposition, and the record keeps them distinguishable where one actor performs several. It follows that an evidence change can invalidate a verdict without any change of law, a projection change can invalidate a view without changing semantic truth, and a semantic change invalidates affected downstream acceptance; a changed broad digest shows a changed representation, not that every semantic relation changed | [§2](#2-separation), first two paragraphs | when an evidence change invalidates a verdict, with mandatory force where it does: [ACTIVATION §7](ACTIVATION.md#7-closed-result-and-reuse) (family F4); when a derived view is stale: [ACTIVATION §2](ACTIVATION.md#staleness-of-derived-surfaces); the re-entry a semantic change takes: [SPEC_METHOD §4](SPEC_METHOD.md#4-change-management) (family F11); invalidating a review conservatively on a broad digest change: permitted by this section, required nowhere; the frame and a_c bindings of these separations: RF-007 and AC-018 | 6, 9 |
| P1 (independent), P6 (independent), P3 (independent) | Structural conformance decides closed syntax, types, identities, references, bases and mechanically decidable predicates; semantic fidelity decides meaning and materiality. A checker decides the structural subset and claims a semantic or authority subset only under an exact lawful decision contract. A valid parse, a valid map, a green test and a historical judgment each establish exactly their own claim, and evidence bound to another basis is excluded, not admitted with a narrower scope | [§2](#2-separation), second paragraph | each decision contract under which a checker decides a semantic subset: the model that supplies it ([AXIOMATIC_CALCULUS §6](AXIOMATIC_CALCULUS.md#6-interpretation-and-models)) | 6, 8, 9 |
| P6 (independent), P0 (recovered, with its premise that a step's output is a candidate until evaluated); instance premise c | By P6 assessment is a separate authority from construction, and by P0 and (c) a step's output is a fallible candidate until evaluated, so a constructor's self-review is construction output, not assessment; where promotion needs independent assessment, the assessor evaluates the exact live subject, authority paths, proof and installed state, not the constructor's summary | [§3](#3-independent-assessment), first paragraph | the boundaries at which this method requires independent assessment: the Spec Method policy at [TICKETS, UP-007](TICKETS.md#execution-and-verification-authority-separation-up-007); further boundaries: the governing basis of each promotion | 7, 9 |
| P6 (independent), P3 (independent); instance premise c | By P3 a judgment binds the exact subject it read, and by P6 and (c) the assessor's judgment must be its own, so assessment binds an exact subject: frozen by identity before material reference exposure where method qualification applies, and otherwise stabilised by an immutable identity or an equivalent exact-subject relation sufficient for the claim, never a mutable working tree; the assessor makes no repair and does not assess its own authorship. Shared mechanical evidence may be reused; the constructor's judgment may not. A revision after exposure is a declared intervention or a new qualification subject, and cannot make the original frozen construction pass retroactively | [§3](#3-independent-assessment), Protocol | recording the assessor's expectations from the governing source before it opens the candidate: a policy choice of this section; actor type and count, review rounds, engine, prompt and orchestration: the governing authority, through the configuration of [ACTIVATION §1](ACTIVATION.md#configuration); policies of this section: the assessor makes no repair, and a revision after exposure is a declared intervention or a new qualification subject; where the freeze applies: method qualification (§7) | 2, 7, 9 |
| P6 (independent); instance premise c | By P6 independence is a relation between the author and the assessor, and by (c) an author's judgment is fallible in a way that persists across its contexts, so independence rests on authorship and the evidence conditions, not on a new context, and the assessor may read the constructor's governing sources. An author that opens a fresh context to review its own candidate is still its author; its review stays self-review and cannot be relabelled as independent assessment. Independence across actor families is declared, not assumed | [§3](#3-independent-assessment), the last two paragraphs | whether two activations of one model family are independent for a semantic judgment: the governing basis of the claim; the default where it is silent, that they are not: this section | 7, 9 |
| P6 (independent), P3 (independent); instance premise c | Self-review is construction output (P6), and identities are scoped by kind (P3), so the party whose self-review is excluded must be identified apart from whoever performs an operation: author identity, the party responsible for the content of a realised subject, is distinct from actor identity, and independence is judged against the author | [§3](#3-independent-assessment), the author-identity paragraph | none | 2, 9 |
| P6 (independent), P5 (derived from P0 and P6, with P0's open-world premise) | By P6 a result must let its consumer check and dispose it, and by P5 an unevaluated predicate has no result, so a review result carries, for each predicate it evaluated, the exact subject and basis, the evidence consulted, the findings ranked by consequence with each finding's evidence and smallest bounded correction, the residual uncertainty and the invalidation conditions. A recommended disposition is evidence only and never a disposition, and the review applies none; a finding without evidence a consumer can chase is commentary | [§4](#4-review-results), first paragraph | none | 3, 9 |
| P6 (independent), P2 (independent), P1 (independent) | By P6 evaluation and decision are separate authorities, and by P1 a mapped value is not the value it maps, so severity, the assessor's grade of consequence, is evaluation evidence, while priority, the effect on the current promotion boundary and the disposition are the decision owner's and stay distinct values even where a policy maps one to another; a recommended disposition is never adopted mechanically. By P2 only a decided result serves the outcome, so the decision owner consumes no `indeterminate` or `out_of_frame` result as satisfaction or as a settled finding, and returns an `invalid_basis` result through the declared basis re-entry relation without consuming it. The payload classes `complete`, `indeterminate` and `not_applicable` classify the triage only and are not results, dispositions, priorities or lifecycle states | [Result and triage projection](#result-and-triage-projection), its first two paragraphs and the consumption column of its table | the triage fields: the profile that adopts the triage, such as [EXECUTIVE_BASELINE](EXECUTIVE_BASELINE.md#technical-triage-severity-priority-and-boundary-effect); the scales, and the priority and boundary policy: the adopting Product | 3, 9 |
| P6 (independent), P2 (independent) | By P6 a verdict is bounded by its claim, and by P2 work outside the claim needs its own route to an outcome, so an observation outside the evaluated claim does not replace the claim-relative result: the assessor returns it separately with its repricing or re-entry pressure, and the decision owner returns it to its owner without a claim-relative block or another review round from its severity alone. By P6 the assessor holds no construction authority, so it returns to the decision owner, not to the constructor, and does not edit the candidate, direct the repair or authorise continuation | [Result and triage projection](#result-and-triage-projection), the last two paragraphs | none | 9 |
| P6 (independent), P2 (independent), P0 (recovered, with its premise that a step's output is a candidate until evaluated); instance premise d | By P6 and (d) acceptance is the decision owner's act, and by P0 the subject accepted must be the evaluated one, so acceptance is the decision owner's disposition over an unchanged subject; recording it cannot widen it, and by P2 it exhausts only the instance and interval it names. A work item closes by the condition it stated, and a reviewer result is an input to closure, never the closure; green labels, document counts, review counts and historical outcomes are not acceptance | [§5](#5-acceptance), first paragraph | the acceptance boundary, its interval and its decision owner: the governing basis that names them; the closing condition of a work item: that work item ([TICKETS](TICKETS.md#7-authority-judgment-closure-and-state)) | 9 |
| P6 (independent), P3 (independent); instance premise d | By P6 and (d) a decision is the owner's, exercised directly or through a grant it admits, and by P3 a proxy's identity stays distinct from the human authority's, so a human decision may be exercised directly or through an explicitly admitted bounded proxy; a change a proxy cannot make, under FOUNDATIONS §2's proxy limit, re-enters at its owning relation | [§5](#5-acceptance), the proxy sentences | what a proxy grant names: [IDENTITY §6](IDENTITY.md#6-authority-identity-and-conservation-stdo-up-004); what a proxy can never decide: [FOUNDATIONS §2 Authority kinds](FOUNDATIONS.md#authority-kinds); whether a proxy is admitted, with its scope and exclusions: the human authority that grants it | 9 |
| P6 (independent); instance premise d | By P6 a verdict is bounded by the exact claim it evaluated, so a finding can block current promotion only through a condition that bears on that claim's acceptance at the current boundary, and an observation outside the claim blocks nothing by itself. By instance premise d blocking is the decision owner's act, so no block follows mechanically from a finding or its severity; a non-waivable hard stop is by definition one that no decision waives, so a valid falsification of a mandatory claim under it blocks whatever the priority or cutoff | [§5, When a finding blocks promotion](#when-a-finding-blocks-promotion) | the four blocking conditions (falsifies the claim; competing or ambiguous authority on its acceptance path; violated active authority, safety or retained accepted behaviour; a durable architectural decision foreclosing an admitted Product outcome): this section, conserving UP-007; the decision cutoff and the severity and priority scales: the adopting Product; the hard stops and which are non-waivable: [ACTIVATION §4](ACTIVATION.md#4-totality-and-refinement) and the owner of each stop; domain triggers, such as a design check's: the profile or work carrier that refers to §5 | 9 |
| P6 (independent), P3 (independent), P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable); instance premise a | By P4b and P3 a successor's predecessor claims persist and bind exact identities, and by P6 and (a) acceptance relies on qualified claims, so where the subject is a successor its acceptance evidence includes the successor disposition record. A claim whose disposition is unresolved cannot be qualified and so cannot be accepted; an intentionally removed disposition is a decision of the current Product authority, and its record is that decision | [§5](#5-acceptance), second paragraph | the disposition values and how the record is evaluated: [RELEASE §9](RELEASE.md#9-successor-baseline-conservation-stdo-up-015) (family F15); each removal: the current Product authority | 1, 9 |

The core result a review returns for each evaluated predicate, the rule
that a planned predicate not evaluated has no result, and the projection of
the triage payload over the core values (§4) apply the core result algebra;
they are traced in family F3 at
[FOUNDATIONS §4 Results](FOUNDATIONS.md#results), and the rows above trace
what §4 decides about the review record, triage and returns.

Consumers of these rows, where an actor enters them (FOUNDATIONS §3
Foundation to law, Consumers), one list per row, each consumer linked to
its own locus:

- Row 1, the claim and its exact subject: [RELEASE §3 Exact-cut qualification](RELEASE.md#exact-cut-qualification), where evidence matches the exact claim, and [§9](RELEASE.md#9-successor-baseline-conservation-stdo-up-015), where each successor disposition is a claim with its predicate; [ASSURANCE §2](ASSURANCE.md#2-testing-strategy-taxonomy), [§7 The set](ASSURANCE.md#the-set) and [Unit frame](ASSURANCE.md#unit-frame), where the weaker property never substitutes and unit green is no broader assurance; [ACTIVATION §4 Standing structural qualification](ACTIVATION.md#standing-structural-qualification), where a reconstruction compares the complete semantic result; [AXIOMATIC_CALCULUS §10](AXIOMATIC_CALCULUS.md#10-conformance-obligations), where nothing qualifies a law outside the exact claim it evaluates; [DESIGN_MODULE §5 Decision-complete symbolic design](DESIGN_MODULE.md#decision-complete-symbolic-design) and [§10 Post-ticket design review](DESIGN_MODULE.md#post-ticket-design-review); [EXECUTIVE_BASELINE §9](EXECUTIVE_BASELINE.md#9-derived-worker-frame) and [§10](EXECUTIVE_BASELINE.md#10-derived-reviewer-frame), where green tests are evidence only for the relations they exercise; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), discriminator 1.
- Row 2, boundary congruence: [DESIGN_MODULE §6 IACS revision](DESIGN_MODULE.md#iacs-revision), where a revision updates every conformance subject to the declared composite carrier relation under this law; [ASSURANCE §7 Integration frame](ASSURANCE.md#integration-frame), which binds the exact assurance boundary and establishes only the composition it exercised.
- Row 3, claims of mechanical enforcement: no separate consumer applies. The ordinary assurance path along which a witness is reachable is the project's assurance design under [ASSURANCE §1](ASSURANCE.md#1-verification-layers), as the choice column states, and whether an enforcement claim is observed or planned is assessed where the claim is relied on, under §3 and §4 of this member; no section of another member names these sentences.
- Row 4, the quantifier rule and its falsifiers: [Frame qualification](#frame-qualification), whose qualification binds the exact frame revision, actor envelope, evaluation family, basis class and evidence conditions evaluated, and [Method self-qualification](#method-self-qualification), where an unevaluated function or branch stays open; [ASSURANCE §6](ASSURANCE.md#6-significant-path-coverage), where a claim's scope cannot exceed its evaluated evidence; [EXECUTIVE_BASELINE §18](EXECUTIVE_BASELINE.md#18-profile-qualification), where the profile is qualified only for the revisions, envelopes, branches and populations evaluated.
- Row 5, the three bases and the four roles: [REFERENCE_FRAME §3 RF-007](REFERENCE_FRAME.md#rf-007-semantic-evidence-and-verdict-separation), which binds the separation to a frame declaration; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), discriminator 36.
- Row 6, structural conformance and semantic fidelity: [AXIOMATIC_CALCULUS §6 AC-018](AXIOMATIC_CALCULUS.md#ac-018-structural-and-semantic-separation), which binds the separation to a_c models, and [§9 Constraint surfaces](AXIOMATIC_CALCULUS.md#constraint-surfaces), Separate claims; [FOUNDATIONS §4](FOUNDATIONS.md#4-algebra), Formal fragment, for what a structural check of a representation establishes; [ASSURANCE §11](ASSURANCE.md#11-assurance-subject-acquisition-and-evaluation), whose evidence mechanics stay evidence evaluators; [EXECUTIVE_BASELINE §18](EXECUTIVE_BASELINE.md#18-profile-qualification), where mechanical document checks and a Reviewer evaluation are bound together and neither is claimed as the other; [PRODUCT_DEFINITION §9](PRODUCT_DEFINITION.md#9-recursive-discovery-and-explicit-composition), where the semantic subset of a check is a distinct claim; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), whose logical-review check no structural check establishes, discriminators 13, 14, 20, 24 and 40, and [§1](CONFORMANCE.md#1-counterexample-cases), case C-02.
- Row 7, self-review and the live subject: [TICKETS §7](TICKETS.md#7-authority-judgment-closure-and-state), [UP-007](TICKETS.md#execution-and-verification-authority-separation-up-007), which names the boundaries at which independent assessment is required, and [Recorded judgment and owner-ruling continuity](TICKETS.md#recorded-judgment-and-owner-ruling-continuity), where reusing the author's judgment satisfies no independence condition; [ACTIVATION §1 Roles and delegation](ACTIVATION.md#roles-and-delegation), where the assessor evaluates the subject and not the constructor's summary, and [§2](ACTIVATION.md#2-context-construction-under-an-envelope), step 3, for a compression claim whose promotion needs independent assessment; [EXECUTIVE_BASELINE §5 Reviewer](EXECUTIVE_BASELINE.md#reviewer), [§10](EXECUTIVE_BASELINE.md#10-derived-reviewer-frame), [§12 step 4](EXECUTIVE_BASELINE.md#4-executive-evaluates-the-work-result) and [§17](EXECUTIVE_BASELINE.md#17-actor-binding-and-independence); [IDENTITY §6](IDENTITY.md#6-authority-identity-and-conservation-stdo-up-004), where proxy authority makes no self-review independent; [CONFORMANCE](CONFORMANCE.md#conformance), its preamble, [§5](CONFORMANCE.md#5-discriminator-coverage), whose logical-review check is made by a reviewer who meets this section, discriminator 43, and [§4](CONFORMANCE.md#4-cases-for-method-discriminators), case CD-02.
- Row 8, the protocol: [ACTIVATION §7](ACTIVATION.md#7-closed-result-and-reuse), for the mechanical evidence independent evaluations may share; [TICKETS UP-007](TICKETS.md#execution-and-verification-authority-separation-up-007), where the reviewer identifies the exact subject, basis, scope, exclusions, evidence, verdict and unresolved findings; [EXECUTIVE_BASELINE §5 Exact candidate](EXECUTIVE_BASELINE.md#exact-candidate), [§12 step 5B](EXECUTIVE_BASELINE.md#5b-candidate-requires-independent-review), [§13 Handoff projection](EXECUTIVE_BASELINE.md#13-handoff-projection), Reviewer activation, and [§20](EXECUTIVE_BASELINE.md#20-failure-classification), for a review of a moving tree and a Reviewer that implements the fix; [ASSURANCE §13 Obligations](ASSURANCE.md#obligations), expectations before exposure; [DESIGN_MODULE §7 Invariant reconstruction sufficiency](DESIGN_MODULE.md#invariant-reconstruction-sufficiency-up-018), where a sufficiency test is evaluated with history and folklore withheld; [FOUNDATIONS §4 Parallel derivation and mutual assurance](FOUNDATIONS.md#parallel-derivation-and-mutual-assurance), which keeps the authentication of a returned assessment apart from provenance; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), discriminator 27.
- Row 9, independence by authorship, not by context: [ACTIVATION §1 Configuration](ACTIVATION.md#configuration), where a fresh context alone meets no independence requirement; [EXECUTIVE_BASELINE §17](EXECUTIVE_BASELINE.md#17-actor-binding-and-independence), where a fresh context of the author is still the author; [FOUNDATIONS §2 Disjointness and independence](FOUNDATIONS.md#disjointness-and-independence), for what a verdict needs to count as independent assurance; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), discriminator 28.
- Row 10, author identity and actor identity: [SPEC_METHOD §11](SPEC_METHOD.md#11-build-tenant-binding), where author identity and actor identity are as this section defines them; [EXECUTIVE_BASELINE §7 The executive configuration](EXECUTIVE_BASELINE.md#the-executive-configuration), where a coordinator that changed the subject is not independent of it, and [§17](EXECUTIVE_BASELINE.md#17-actor-binding-and-independence); [TICKETS UP-007](TICKETS.md#execution-and-verification-authority-separation-up-007), where the reviewer is not the author of the reviewed subject; [FOUNDATIONS §4 Parallel derivation and mutual assurance](FOUNDATIONS.md#parallel-derivation-and-mutual-assurance), where porting retains authorship; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), discriminator 28, for the authorship of a received contribution.
- Row 11, the review record: [ACTIVATION §3 Disposition](ACTIVATION.md#disposition), where a recommended disposition is evidence for the decision owner; [EXECUTIVE_BASELINE §12 step 6](EXECUTIVE_BASELINE.md#6-reviewer-returns-to-executive), where the Reviewer returns one closed evaluation in this section's shape, and [§13 Handoff projection](EXECUTIVE_BASELINE.md#13-handoff-projection), review result; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), whose logical-review check returns a review result under this section, and [§1](CONFORMANCE.md#1-counterexample-cases), case C-02.
- Row 12, severity, priority and the consumption of core values: [EXECUTIVE_BASELINE §5 Technical triage, severity, priority and boundary effect](EXECUTIVE_BASELINE.md#technical-triage-severity-priority-and-boundary-effect), whose per-result consumption this projection constrains, [§12 step 6](EXECUTIVE_BASELINE.md#6-reviewer-returns-to-executive), where the assessor is the Reviewer and the decision owner the Executive, and [Promotion constraint projection](EXECUTIVE_BASELINE.md#promotion-constraint-projection), which applies the `indeterminate` row of the consumption table.
- Row 13, observations outside the claim and the return to the decision owner: [EXECUTIVE_BASELINE §12 step 6](EXECUTIVE_BASELINE.md#6-reviewer-returns-to-executive), where the Reviewer returns to the Executive, not to the Worker, and neither edits the candidate nor directs the repair, and the [EXECUTIVE_BASELINE family table](EXECUTIVE_BASELINE.md#foundation-to-law), whose row for technical triage imports F6 for an observation outside the claim that opens no review round.
- Row 14, acceptance as the owner's disposition and closure by condition: [ACTIVATION §1 Construction relation](ACTIVATION.md#construction-relation), where producing a candidate, proving a property and accepting delivery are distinct acts; [FOUNDATIONS §4 Results](FOUNDATIONS.md#results), availability, assessment and acceptance; [EXECUTIVE_BASELINE §12 step 7](EXECUTIVE_BASELINE.md#7-executive-disposes-and-checkpoints), where acceptance widens nothing, and [§22 Closure](EXECUTIVE_BASELINE.md#22-closure), where a work item closes by its condition and not by a reviewer's approval; [TICKETS §7](TICKETS.md#7-authority-judgment-closure-and-state), whose closing condition is the work item's; [RELEASE §8 Acceptance criteria](RELEASE.md#acceptance-criteria), where acceptance attaches to the immutable identity and adoption is evaluated separately; [SPEC_METHOD §3](SPEC_METHOD.md#3-outcome-conservation), where acceptance exhausts only the accepted instance, and [§4 Consistency gate](SPEC_METHOD.md#consistency-gate), where no review event, passing aggregate or status change substitutes for the closing condition; [ASSURANCE §3](ASSURANCE.md#3-test-authority), where green labels are not acceptance, and [§7 User-acceptance frame](ASSURANCE.md#user-acceptance-frame), which assumes no acceptance authority; [CONFORMANCE §1](CONFORMANCE.md#1-counterexample-cases), case C-11.
- Row 15, proxies: [EXECUTIVE_BASELINE §5 Executive](EXECUTIVE_BASELINE.md#executive), a frame a bounded proxy may occupy under the proxy grant, and [§20](EXECUTIVE_BASELINE.md#20-failure-classification), where a decision outside the proxy grant re-enters; otherwise no separate consumer applies: what a proxy grant names is [IDENTITY §6](IDENTITY.md#6-authority-identity-and-conservation-stdo-up-004)'s, which this section applies to acceptance, and what a proxy can never decide is [FOUNDATIONS §2 Authority kinds](FOUNDATIONS.md#authority-kinds)', as the choice column states.
- Row 16, when a finding blocks promotion: [Result and triage projection](#result-and-triage-projection), for when a finding can block; [EXECUTIVE_BASELINE §5 Technical triage, severity, priority and boundary effect](EXECUTIVE_BASELINE.md#technical-triage-severity-priority-and-boundary-effect), [§12 step 7](EXECUTIVE_BASELINE.md#7-executive-disposes-and-checkpoints) and [Promotion constraint projection](EXECUTIVE_BASELINE.md#promotion-constraint-projection), read with the Executive as decision owner; [DESIGN_MODULE §10 Post-ticket design review](DESIGN_MODULE.md#post-ticket-design-review), whose determinations are domain triggers for the four conditions; [RELEASE §8 Acceptance criteria](RELEASE.md#acceptance-criteria), for the findings that block release; [TICKETS UP-007](TICKETS.md#execution-and-verification-authority-separation-up-007), which applies the section to a ticket's review.
- Row 17, the successor disposition record: [RELEASE §8 Acceptance criteria](RELEASE.md#acceptance-criteria), which requires a stable successor relation before acceptance, and the [RELEASE family table](RELEASE.md#foundation-to-law-release-and-successor-conservation), whose row for exact-cut qualification and acceptance imports F6 for a qualification that binds the successor relation; the disposition values and the evaluation of the record are [RELEASE §9](RELEASE.md#9-successor-baseline-conservation-stdo-up-015)'s, as the choice column states.

Each consumer applies the rule and decides nothing the owning section does
not (P2, P6).

## 2. Separation

Three bases stay distinct (P6, P1): the semantic basis, the constitutional
and accepted-design relations that define what a claim means; the evidence
basis, the exact artifacts, events, logs, tests and observations used to
evaluate it; and the state projection, a current view derived from admitted
semantic and evidence bases. Semantic law defines what an evaluation means;
evidence supplies observations; the evaluator applies the declared
relation; decision authority disposes. One actor may lawfully perform
several; the record keeps them distinguishable. This section owns these
separations. [RF-007](REFERENCE_FRAME.md#rf-007-semantic-evidence-and-verdict-separation)
binds them to a frame declaration and
[AC-018](AXIOMATIC_CALCULUS.md#ac-018-structural-and-semantic-separation)
to an a_c model; each adds only its domain binding.

An evidence change can invalidate a verdict without any change of law.
Whether a given change does so is decided by the reuse rule of
[ACTIVATION §7](ACTIVATION.md#7-closed-result-and-reuse), and where it
does, the invalidation is mandatory and takes effect before reliance. A
projection change can invalidate a view without changing semantic truth;
when a derived view is stale is decided by
[ACTIVATION §2, Staleness of derived surfaces](ACTIVATION.md#staleness-of-derived-surfaces).
A semantic change requires lawful re-entry and invalidates affected
downstream acceptance. A broad digest may conservatively
invalidate a review; it does not prove that every semantic relation
changed (P1, P6).

Structural conformance decides closed syntax, types, identities, references,
bases and mechanically decidable predicates. Semantic fidelity decides
meaning and materiality. Structural success is evidence for semantic
review, not a substitute for it. A checker decides the structural subset; it claims a
semantic or authority subset only under an exact lawful decision contract
supplied by the model. For a_c models,
[AC-018](AXIOMATIC_CALCULUS.md#ac-018-structural-and-semantic-separation)
and [AC-019](AXIOMATIC_CALCULUS.md#ac-019-valid-model) bind this rule to
the model's records and validity conditions (P1, P6).
A valid parse, a valid map, a green test and a historical judgment each
establish exactly their own claim. Evidence bound to a basis other than
the evaluated one is excluded by basis; it is not admitted with a narrower
scope (P3;
[RF-005](REFERENCE_FRAME.md#rf-005-exact-basis-and-coordinates)).

## 3. Independent assessment

A constructor's self-review is construction output, not assessment. Where
promotion needs independent assessment, the assessor evaluates the exact
live subject, authority paths, proof and installed state, not the
constructor's summary (P6, and P0 with its premise that a step's output is
a candidate until evaluated; instance premise (c) of §1 Foundation to law).
This section decides what counts as independent assessment. Which
boundaries require it is a policy choice of the Spec Method, owned by
[TICKETS §7 Execution and verification authority separation](TICKETS.md#execution-and-verification-authority-separation-up-007);
a governing basis may add boundaries.

Protocol: where method qualification applies
([§7 Method self-qualification](#method-self-qualification)), the subject is
frozen by identity before material reference exposure; elsewhere it is
stabilised by an immutable identity or an equivalent exact-subject relation
sufficient for the claimed assessment. The assessor records its
expectations from the governing source before opening the candidate; it
reads the subject at that identity or relation, never a mutable working
tree; it makes no repair; it does not assess its
own authorship. Reusing the constructor's judgment does not satisfy
independence; shared mechanical evidence may be reused, judgment may not
(ACTIVATION §7). Binding a returned assessment to its producer, subject,
basis and evidence authenticates the result; it establishes neither the
assertion provenance of its expected answer nor the execution provenance
of its run, which
[FOUNDATIONS §4 Parallel derivation and mutual assurance](FOUNDATIONS.md#parallel-derivation-and-mutual-assurance)
requires separately (P6, P3). Membership in a plan authenticates nothing,
an unauthenticated result satisfies no required assessment, and a result
bound to another subject satisfies no planned assessment
([FOUNDATIONS §4 Conjunction of results](FOUNDATIONS.md#conjunction-of-results));
no cryptographic or transport protocol is prescribed for the binding (P6). Any post-exposure revision is a declared intervention: it
is either a method constituent with its own qualification boundary or a new
qualification subject, and it cannot retroactively make the original
frozen construction pass. This law prescribes no actor type or count,
review-round count, engine, prompt or orchestration (P6).

Author identity is the party responsible for the content of a realised
subject. It is distinct from actor identity, whoever performs one
operation, which is an identity and not an authority
([FOUNDATIONS §2 Authority kinds](FOUNDATIONS.md#authority-kinds)).
Authorship is one of the conditions on
which the independence of an assessment rests; the evidence conditions are
the other (P6, P3).

Reporting a defect, supplying a counterexample or identifying behaviour
already required by governing law does not by itself author the realised
subject. Contributing wording, design or policy that is adopted into the
subject, including through directions for a particular repair, is authorship
of that contribution. A
reporter may assess a later repair only when the existing assessment grant,
authorship relation and evidence-independence conditions permit it; a
reporter gains no review authority from having found the defect. A person
who authored an adopted repair cannot supply its required independent
assessment by calling that authorship a finding (P6, P3).

Independence rests on authorship and on the evidence conditions above, not
on a new context. The assessor may read the same governing sources as the
constructor. A fresh context alone establishes no independence, and it
supplies no review authority the author lacks: an author that opens a
fresh context to review its own candidate is still its author, and its
review is self-review, which stays construction output and cannot be
relabelled as independent assessment (P6;
[TICKETS UP-007](TICKETS.md#execution-and-verification-authority-separation-up-007)). A contribution received from another author stays that
author's wherever it is carried, and that author's reading of it supplies
no independent acceptance of it (P6).

Independence across actor families is declared, not assumed. Whether two
activations of one model family are independent for a semantic judgment is a
policy the governing basis states for the claim; the default where it is not
stated is that they are not independent.

## 4. Review results

A review returns one core result
([FOUNDATIONS §4, Results](FOUNDATIONS.md#results)) for each declared
predicate it evaluated, with: the exact subject and basis, the evidence
consulted, the findings ranked by consequence, each finding's evidence and
the smallest bounded correction, the residual uncertainty, and the
invalidation conditions. A declared predicate the review planned and did
not evaluate has no result (FOUNDATIONS §4, Results). The review names it
as not performed and reports no core value for it, neither
`indeterminate` nor `falsified`, so that conjunction keeps it apart from
an undecided predicate and from required coverage that no planned
assessment addresses
([FOUNDATIONS §4, Conjunction of results](FOUNDATIONS.md#conjunction-of-results);
P5, P6). It may recommend a disposition
([ACTIVATION §3](ACTIVATION.md#3-step-results-and-disposition)), which is
evidence only and never a disposition; it does not apply one. A finding
without evidence a consumer can chase is commentary.

### Result and triage projection

Where a review returns findings with technical triage, the triage is the
assessor's evidence-bound assessment of each finding against the exact
evaluated claim and basis. Severity, the assessor's grade of consequence,
is evaluation evidence. Priority, the effect on the current promotion
boundary and the disposition are the decision owner's (ACTIVATION §1,
Roles and delegation; when a finding can block is
[§5, When a finding blocks promotion](#when-a-finding-blocks-promotion))
and stay distinct values even where a
Product-defined policy maps one to another. A recommended disposition
is evidence for the decision owner: it is not a disposition, a
priority or a boundary effect, and it is never adopted mechanically (P6,
RF-007). The fields of a triage are declared by the profile that adopts it, and
the scales it uses are bound by the adopting Product (P2, P6).

The projection of the finding-level triage payload is total over the core
values of [FOUNDATIONS §4, Results](FOUNDATIONS.md#results). A predicate
not performed has no result and so no triage payload; the payload class
`indeterminate` never stands for it. The payload classes `complete`,
`indeterminate` and `not_applicable` classify the triage only; they are
not new results, dispositions, priorities or lifecycle states (P5, P1).

| Core result | Finding and triage payload | Decision-owner consumption constraint |
|---|---|---|
| satisfied | an explicit no-finding state; triage `not_applicable`; evidence, residuals and invalidation stay present | priority and boundary effect are `not_applicable` to this result unless another exact consumed result supplies a finding |
| falsified | one or more exact findings; triage `complete` where supported, keeping `indeterminate` fields where evidence cannot close them | apply the Product-owned priority and boundary policy without mapping severity mechanically to a disposition |
| indeterminate | a partial finding or observation state; triage `indeterminate`; the exact evidence gaps and residual uncertainty | keep the uncertainty or reactivate a capable evaluation; do not consume it as satisfaction or as a closed finding |
| out_of_frame | the evaluated claim needs an undeclared material relation or evaluator capability; triage `indeterminate`; the missing relation or capability and the exact reconfiguration pressure are named | refine or reconfigure a capable activation and keep the claim unresolved; do not consume the result as satisfaction or falsification |
| invalid_basis | a basis failure; triage `not_applicable`; invalidation evidence and basis-repair pressure | refuse to consume the result and return through the declared basis re-entry relation |

An adjacent observation outside the evaluated claim does not replace the
claim-relative result. The assessor returns it separately, with triage
`not_applicable` to that claim and the exact repricing or re-entry
pressure; the decision owner returns it to its declared owner without
creating a claim-relative block, or another review round, from its
severity alone (P6, P2).

The assessor returns to the decision owner, not to the constructor. It does
not edit the candidate, direct the repair or authorise continuation (P6,
§3).

Purpose and material relation: every configuration keeps severity,
priority, boundary effect and disposition separate. The rule applies to any
assessor and decision owner; [EXECUTIVE_BASELINE](EXECUTIVE_BASELINE.md)
binds its Reviewer and Executive instance (P6).

## 5. Acceptance

Acceptance is the decision owner's disposition over an unchanged subject;
recording it cannot widen it, and it exhausts only the instance and interval
it names (P6, P2).
A work item closes by the condition it stated, not by a reviewer's approval;
a reviewer result is an input to closure, never the closure. Green labels,
document counts, review counts and historical outcomes are not acceptance.
A human decision may be exercised directly or through an explicitly admitted
bounded proxy. What a proxy grant names is
[IDENTITY §6](IDENTITY.md#6-authority-identity-and-conservation-stdo-up-004)'s,
and what a proxy can never decide is
[FOUNDATIONS §2 Authority kinds](FOUNDATIONS.md#authority-kinds)';
for acceptance, a change a proxy cannot make re-enters at its owning
relation ([ACTIVATION §1 Roles and delegation](ACTIVATION.md#roles-and-delegation)).

Where the subject is a successor, its acceptance evidence includes the
successor disposition record of [RELEASE §9](RELEASE.md#9-successor-baseline-conservation-stdo-up-015)
(STDO-UP-015), which states the law: the exact predecessor immutable cut
the successor evolves, and one semantic disposition for every predecessor
claim capable of affecting the successor. A claim whose disposition is
unresolved cannot be qualified and so cannot be accepted; how the record
is evaluated is [RELEASE §9](RELEASE.md#9-successor-baseline-conservation-stdo-up-015).
An intentionally removed disposition is a decision of the current Product
authority, and its record is that decision (P6, P3, P4b).

### When a finding blocks promotion

A finding is a defect a review reports against the exact claim it
evaluated (§4). Blocking current promotion is the decision owner's act
over that finding (§4, Result and triage projection). This section is the
one statement of when a finding can block; profiles and work carriers
refer to it and add only their domain triggers.

A review verdict is bounded by the exact reviewed claim and its applicable
hard stops ([ACTIVATION §4](ACTIVATION.md#4-totality-and-refinement)). A
finding can block current promotion only when it:

1. falsifies that claim;
2. exposes competing or ambiguous authority on the claim's acceptance
   path;
3. violates applicable active authority, safety or retained accepted
   behaviour; or
4. establishes a material architectural decision with durable
   consequences that forecloses an admitted Product outcome.

These conditions are necessary. Which of them suffice is decided as
follows:

| Consumed condition | Effect on the current promotion boundary |
|---|---|
| a valid falsification of a mandatory claim governed by a non-waivable hard stop | the boundary blocks, whatever the assigned priority or the decision cutoff |
| any other finding meeting one of the four conditions | the decision owner decides blocking from the exact affected claim, the governed outcome or decision the work serves ([ACTIVATION §1, Intake](ACTIVATION.md#intake)), the applicable hard stops and the Product-owned cutoff policy; below that cutoff no block follows mechanically, and an accepted residual is retained explicitly |
| a finding meeting none of the four conditions | it does not block |
| an observation outside the exact reviewed claim | repricing or re-entry input, returned as §4 states: by itself it does not widen the reviewed subject, block its bounded claim, or require a new ticket, artifact, review round or implementation increment |

Severity selects neither priority nor a block mechanically, and priority
neither erases severity nor waives a hard stop. The decision cutoff is the
adopting Product's policy; this member sets no cutoff (P6, P2). This law
applies at any promotion boundary; [EXECUTIVE_BASELINE](EXECUTIVE_BASELINE.md#promotion-constraint-projection)
binds the Executive instance. Purpose and material relation: one owner
gives every review consumer the same blocking condition. A bounded review
does not block on observations outside its claim, while a non-waivable hard
stop still blocks.

## 6. Conformance of realisations

A realisation aⱼ conforms to a specification Σ when its interpreted behaviour
satisfies Σ under a declared interpretation contract (P1) and an independent
judgment (P6). Several realisations may conform to one Σ; sufficiency does
not require unique derivation or equality with an incumbent. A weak Σ that
admits materially different behaviours either declares the latitude or is
repaired before a decision-complete design is claimed.

Equivalence ladder. The ladder is the list of the four claims named next,
each a rung; the rungs are listed, not ordered, and no rung implies
another. Conformance, semantic equivalence, computational equivalence and
categorical equivalence are separate claims with separate evidence (P1,
P6). Conformance establishes neither identical behaviour outside Σ nor
equal cost. Semantic equivalence of realisations claims that two
realisations, or a realisation and a declared reference outcome, have
identical interpreted behaviour on a stated domain, behaviour outside Σ
included. In this member semantic equivalence is always this equivalence
of realisations, not the equivalence of concepts across bounded contexts
that
[PRODUCT_DEFINITION §5](PRODUCT_DEFINITION.md#5-bounded-context-semantic-resolution)
governs, and semantic conformance, in the comparison rule below, is
conformance with the governing semantic basis as Σ. Computational
equivalence claims that two realisations compute the same function at
equal cost for declared workloads on a declared architecture H.
Categorical equivalence is a claim about categories and the maps between
them: FOUNDATIONS §4, Formal fragment, owns what a category or functor
claim must show and defines the symbols 𝒜, ℐ and 𝒞_H used here, and a
map's preservation of identities and composition is a further claim
distinct from every rung.
For a proposed span 𝒜 → ℐ and 𝒜 → 𝒞_H, conformance to Σ, semantic
equivalence and computational equivalence remain different claims.
A claim of categorical equivalence meets each item of the Formal fragment
that applies to it, as that section states them. This rung adds one
requirement of its own to those items: a quasi-inverse functor, and
natural isomorphisms between each composite of the functor with its
quasi-inverse and the identity functor, on a stated domain. An analogy or matching result
is insufficient. Evidence for one claim is not reported as a result for
another (§1). The ladder keeps a matching output, an analogy
or a passing conformance check from being read as equivalence or as
preserved structure (P1, P6).

Layered sufficiency. A specification arranged in layers is sufficient when
a competent actor can derive a conformant next layer from each layer; the
derivation need not be unique, since different realisations may satisfy the
same upper layer, and the test is sufficiency, not determinism. A failure
to derive at any boundary is a defect of the upper layer: unclear,
contradictory, underspecified, not concrete or decomposable enough, or
polluted with accidental lower-layer detail. A boundary that can be crossed
only by hiding a major unresolved ambiguity is not yet sufficient even if
some downstream artifact can be produced. For an already accepted relation,
reconstruction may reuse its exact current basis and sufficient evidence
after checking applicability and invalidation (ACTIVATION §7);
reconstructability requires a correct reconstruction route, not its
execution at every use, grants no restart authority and does not excuse
stale success. The claim determines the reconstruction span; a local
selected function does not require recreating the whole subject. New
material counterexamples still challenge the affected relation (P2, P1,
P0). [SPEC_METHOD §2 Reconstruction litmus](SPEC_METHOD.md#reconstruction-litmus)
applies this law to the method's own chain, with diagnosis per layer.

Comparison. After freeze the evaluator compares the frozen result against
the mandatory governing semantic basis for semantic conformance or
equivalence. A separately held expected or reference outcome, if one exists
and is applicable, is optional evidence and explicitly non-authoritative;
semantic equivalence to it is required only where the governing basis
requires it. A lawful alternative construction permitted by the basis
passes. Subjective similarity to the basis or the reference is insufficient
to establish conformance or equivalence. Byte or structural identity,
unique derivation, determinism and incumbent equality are not generic
comparison criteria. A construction outside the declared competence or
configuration envelope cannot indict generic method sufficiency (P6, P1).

### Return of a reconstruction

A reconstruction return is the return of a task that builds or assesses
one member of a successor against its predecessor. It states under three
separate heads what it claims and the evidence for each, and claims none of
them by a byte or size measure. Semantic conservation: a disposed claim of
the predecessor keeps its meaning in the successor text, judged by reading
both texts against the disposition
([RELEASE §9](RELEASE.md#9-successor-baseline-conservation-stdo-up-015)
owns the dispositions and their conservation reading). Demonstrated
reduction: a deciding path of the successor costs less than the same path
in the predecessor on a declared measure, shown by the trace of both paths
with the declared tradeoffs. Mere relocation: text moved from one owner or
carrier to another without a change in meaning and without a traced
change in any deciding path. Relocation reported as reduction, or
conservation claimed from unchanged bytes, misreports the claim (§1, P1,
P6). The three heads stay separate in the return as the rungs of the
ladder do above; a frame for a reconstruction task binds this
distinction.

### Foundation to law: conformance, equivalence and qualification

This family, conformance, equivalence and qualification (F7 in the index of
[FOUNDATIONS §3 Foundation to law](FOUNDATIONS.md#foundation-to-law)),
decides when a realisation, a frame or the method itself is shown fit for
what it claims. It covers §6 and §7 of this member and the
[CONFORMANCE](CONFORMANCE.md) member; a rule in CONFORMANCE is marked
"outside this member" in the third column. Its instance premises are: (a)
one specification may have several realisations; (b) realisations, frames
and the method are made by fallible constructors and relied on by actors
who did not make them; (c) qualification evidence comes from a finite set
of cases, run by actors inside declared envelopes. They are conditions of
the work this family governs, not commitments, and do not follow from
finite capacity alone. P0's actor-change premise, that the actor of one
step need not be the actor of the next and may re-acquire declared sources
but not private memory, is cited by name. The standing of the consequences
below is stated in
[FOUNDATIONS §3 Foundation to law](FOUNDATIONS.md#foundation-to-law).

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|
| P1 (independent), P6 (independent); instance premise a | By P1 behaviour has meaning only under an interpretation, and by P6 a judgment is separate from what it judges, so a realisation conforms to a specification when its interpreted behaviour satisfies it under a declared interpretation contract and an independent judgment. Several realisations may conform to one specification; sufficiency does not require unique derivation or equality with an incumbent. A specification that admits materially different behaviours either declares the latitude or is repaired before a decision-complete design is claimed | [§6](#6-conformance-of-realisations), first paragraph | the interpretation contract and any declared latitude: the owner of the specification ([FOUNDATIONS §4](FOUNDATIONS.md#4-algebra), Latitude) | 4, 6, 9 |
| P1 (independent), P6 (independent) | By P1 each kind of equivalence is a different relation between meanings and representations, and by P6 evidence supports only the claim it is for, so conformance, semantic equivalence, computational equivalence and categorical equivalence are separate claims with separate evidence, and no rung implies another. Conformance establishes neither identical behaviour outside the specification nor equal cost; a categorical equivalence claim meets the items of the Formal fragment that apply to it and adds a quasi-inverse functor and natural isomorphisms on a stated domain, and a map's preservation of identities and composition is a further claim. Evidence for one claim is never reported as a result for another | [§6](#6-conformance-of-realisations), Equivalence ladder | the four rungs and their definitions: this section; the stated domain, workloads and architecture H of an equivalence claim: the author of the claim; what a category or functor claim must show: [FOUNDATIONS §4](FOUNDATIONS.md#4-algebra), Formal fragment (family F3) | 3, 6, 9 |
| P2 (independent), P1 (independent), P0 (recovered); instance premises a, b | By P2 a layer exists so the next can be derived from it, by P1 one meaning admits several representations, and by P0 a reconstruction must fit a finite actor, so a layered specification is sufficient when a competent actor can derive a conformant next layer from each layer, not necessarily uniquely. A failure to derive is a defect of the upper layer, and a boundary that can be crossed only by hiding a major unresolved ambiguity is not sufficient. Reconstruction of an accepted relation may reuse its exact current basis and sufficient evidence after checking applicability and invalidation; reconstructability requires a correct route, not its execution at every use, grants no restart authority and does not excuse stale success; the claim determines the reconstruction span, and new material counterexamples still challenge the relation | [§6](#6-conformance-of-realisations), Layered sufficiency | the layers of the method's own chain and the diagnosis per layer: [SPEC_METHOD §2](SPEC_METHOD.md#reconstruction-litmus) (family F10) | 1, 4, 6 |
| P6 (independent), P1 (independent); instance premise b | By P6 the governing basis, not a reference outcome, decides, and by P1 equal representation is not equal meaning, so after freeze, the evaluator compares the frozen result with the mandatory governing semantic basis. A separately held expected or reference outcome is optional and non-authoritative evidence; a lawful alternative construction the basis permits passes. Subjective similarity is insufficient, and byte or structural identity, unique derivation, determinism and incumbent equality are not generic comparison criteria. A construction outside the declared competence or configuration envelope cannot indict generic method sufficiency | [§6](#6-conformance-of-realisations), Comparison | whether equivalence to a reference outcome is required: the governing basis | 6, 9 |
| P6 (independent), P2 (independent); instance premises b, c | By P6 a frame's claims hold only on evidence, and by P2 the evidence needed follows the claims made, so a candidate frame is qualified in proportion to its claims, by at least the decision, reconstruction, sensitivity, irrelevance, basis, authority, counterexample, capability and result-consumption tests. Qualification binds the exact frame revision, actor envelope, evaluation family, basis class and evidence conditions evaluated, and does not generalise to an unevaluated population by naming the frame generically | [Frame qualification](#frame-qualification), the tests and the paragraph after them | the nine minimum tests: this section; the representative cases for each claim: the qualification that evaluates it | 7, 9 |
| P0 (recovered), P6 (independent); instance premise c | By P0 fit is a property of the representation and the envelope, and by P6 attention is shown only by evidence of use, so fit and adequate attention are evaluated separately. Fit, for the context dimension, is the measured size of the selected representation against the declared capacity; adequate attention is established only by actual-use evidence, judged against expectations recorded from the governing sources before the results are opened. A size measurement or any byte or token threshold establishes fit and nothing about attention; actual-use evidence binds the frame revision, actor class, tasks and conditions evaluated and establishes no universal attention score | [Frame qualification](#frame-qualification), Adequate attention | the tasks and conditions evaluated: the qualification; the size measurement: [ACTIVATION §2](ACTIVATION.md#2-context-construction-under-an-envelope) step 3 (family F1); time, spend and other resource limits: the selected execution binding, under [ACTIVATION §6](ACTIVATION.md#6-cost-and-proportionality) (family F5) | 7, 8, 9 |
| P6 (independent), P0 (recovered, with its actor-change premise), P1 (independent); instance premises b, c | By P6 and P0's actor-change premise the method's claims need the same evidence as any other and must survive a change of actor, and by P1 a constructor's private material is not the method, so the method is qualified the way it qualifies anything else, with no second process. A fresh competent constructor inside a declared envelope uses only the declared ordinary method and authority surfaces and declared trial subjects; an independently authorised evaluator has a declared governing basis and comparison predicate; expected or reference outcomes, source exemplars, incumbent realisations, author memory and ad hoc rescue are withheld from the constructor until its result is frozen wherever earlier exposure would compromise reconstructive independence; comparison follows §6. The qualification law is false under the falsifiers §7 lists | [Method self-qualification](#method-self-qualification), first paragraph and the falsifiers | the constructor, freeze, assessor, acceptance and release protocols: the governing authority | 1, 9 |
| P6 (independent); instance premise c | By P6 each claimed relation is a separate claim that needs its own evidence, so the qualification population is every function and failure relation the method claims, each with its representative observations. One valid frame-set declaration and coverage result establishes only `declare` and the evaluated `audit_coverage`, and the other relations by no implication; each relation is exercised through positive, boundary and falsifying cases; every verdict states exactly what it evaluated, and an unevaluated function or branch stays open rather than inheriting a whole-method verdict. Prior exemplars are optional comparison evidence after freeze | [Method self-qualification](#method-self-qualification), the population table and the paragraph after it | the relations: [REFERENCE_FRAME §5](REFERENCE_FRAME.md#5-method-functions) (family F1); the representative observations listed: this section; staging: the governing authority | 3, 9 |
| P6 (independent), P1 (independent); instance premise b | By P6 and P1 a derived guide is a representation whose fidelity is a separate claim, so changed derived guidance, such as a compression, a frame packet or a skill, is qualified against source-derived expected behaviour, including the affected permissions, exclusions and invalidators; a native use claim is shown by an ordinary actor applying it through its declared entry. Digest integrity and index generation establish identity and structure, not semantic fidelity or usability, and mechanical and operational claims require their own executable observations | [Method self-qualification](#method-self-qualification), Derived guidance | the applicable workload and operational assumptions: [ACTIVATION §6](ACTIVATION.md#6-cost-and-proportionality) (family F5) | 6, 9 |
| P0 (recovered, with its actor-change premise), P6 (independent); instance premise b | By P0's actor-change premise a document set must work for an actor without prior memory, and by P6 fidelity is judged on evidence, so for a selected activation, a fresh actor given only the published documents recovers the governing relations with fidelity judged independently, at a measured reconstruction cost. The fidelity judgment is actual-use evidence, and the size measured is not evidence of it. A document set that requires private validator knowledge, whole-corpus loading or a prior actor's memory fails, whatever its content | [Method self-qualification](#method-self-qualification), Recoverability benchmark | the reported fidelity, reconstruction cost, completion and material errors: this section; the activation measured and any comparison baseline: the qualification that runs it; time and spend measurement: the selected execution binding | 6, 7, 9 |
| P6 (independent), P5 (derived from P0 and P6, with P0's open-world premise); instance premise c | By P6 a pass is an assessor's verdict on evidence, and by P5 an evaluation not performed has no result, so a conformance case names its subject, the mechanism under test, an independently specified expected distinction and its status, and a status names what exists. A run is not a pass: only an assessment by an independent assessor records one. A case passes when the expected distinction is observed and no coerced success appears anywhere in the result; a case that cannot be run with its declared subject is a planned evaluation that was not performed, which has no result under [FOUNDATIONS §4 Results](FOUNDATIONS.md#results), so it is recorded as not run, never hidden and never given a core value | [CONFORMANCE](CONFORMANCE.md), preamble, outside this member | the cases, with their subjects and expected distinctions: [CONFORMANCE §1–§5](CONFORMANCE.md#1-counterexample-cases) | 3, 9 |
| P0 (recovered), P6 (independent); instance premise c | By P0 an actor's context is bounded, and by P6 acceptance criteria must not come from the constructing actor, so a trial of bounded construction declares its per-actor context cap and total-work budget before each run, counts the context transferred across every delegated actor, and keeps its acceptance criteria independent of the constructing actor | [CONFORMANCE §2](CONFORMANCE.md#2-construction-trials), the paragraph after the trial table, outside this member | a required basis larger than the cap, and repetition of probabilistic trials with varied task order: CONFORMANCE §2; each cap and budget: the trial's declaration; a policy of CONFORMANCE §2: that a trial declares its cap and budget before each run and counts context across every delegated actor | 8, 9 |
| P1 (independent), P6 (independent); instance premise b | By P1 moved text is not changed meaning and unchanged bytes are not conserved meaning, and by P6 each claim needs its own evidence, so a reconstruction return states semantic conservation, demonstrated reduction and mere relocation as separate claims with separate evidence, and no byte or size measure establishes any of them | [Return of a reconstruction](#return-of-a-reconstruction) | the dispositions and the conservation reading: [RELEASE §9](RELEASE.md#9-successor-baseline-conservation-stdo-up-015) (family F15); the reduction measure, its baselines and the traced paths: the candidate's design, declared before the trace | 1, 6, 9 |

CONFORMANCE §1 to §4 list the cases, which are the choices named in the
last two rows; its §5 maps the method discriminators to cases and
logical-review checks.

Consumers of these rows, where an actor enters them (FOUNDATIONS §3
Foundation to law, Consumers), one list per row, each consumer linked to
its own locus:

- Row 1, conformance under an interpretation contract: [SPEC_METHOD §11](SPEC_METHOD.md#11-build-tenant-binding), where a tenant's conformance is judged under this section and conforming tenants need not behave identically outside the contract; [FOUNDATIONS §4 Formal representation](FOUNDATIONS.md#formal-representation), whose owners and consumers the member criteria assess under this section; [EXECUTIVE_BASELINE §16 Extension versus replacement](EXECUTIVE_BASELINE.md#extension-versus-replacement), where a departure from the execution law is a recorded non-conformance, never local frame selection.
- Row 2, the equivalence ladder: [FOUNDATIONS §4](FOUNDATIONS.md#4-algebra), Formal fragment, for whether a claim asserts conformance, an equivalence or a map's preservation of structure; [SPEC_METHOD §11](SPEC_METHOD.md#11-build-tenant-binding), rule 4, where a claim that a binding preserves categorical structure stays distinct from conformance; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), discriminators 20 and 51.
- Row 3, layered sufficiency: [SPEC_METHOD §2 Reconstruction litmus](SPEC_METHOD.md#reconstruction-litmus), which applies it to the method's own chain; [Method self-qualification](#method-self-qualification), which consumes it for generic method sufficiency.
- Row 4, comparison after freeze: [Method self-qualification](#method-self-qualification), where the evaluator compares the frozen result under the comparison rule and prior exemplars are target answers only where the governing basis requires equivalence.
- Row 5, the frame qualification tests: [ASSURANCE §13 Qualification](ASSURANCE.md#qualification), which qualifies the interface integration frame under this section; [ACTIVATION §1 Applicability](ACTIVATION.md#applicability), whose applicability rule is qualified against distinct expected outcomes; [EXECUTIVE_BASELINE §18](EXECUTIVE_BASELINE.md#18-profile-qualification), which applies frame qualification and creates no other protocol; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), discriminator 26.
- Row 6, fit and adequate attention: [ACTIVATION §2](ACTIVATION.md#2-context-construction-under-an-envelope), step 3, where the size shows fit and nothing else; [REFERENCE_FRAME §3 RF-002](REFERENCE_FRAME.md#rf-002-finite-attention); [AXIOMATIC_CALCULUS §9 Constraint surfaces](AXIOMATIC_CALCULUS.md#constraint-surfaces), Separate claims; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), whose logical-review check supplies no actual-use evidence and whose coverage paragraph counts no unassessed run as actual-use evidence for this revision, discriminators 26 and 27.
- Row 7, method self-qualification: [§3 Independent assessment](#3-independent-assessment), Protocol, where the subject is frozen by identity where method qualification applies; [EXECUTIVE_BASELINE §5 Exact candidate](EXECUTIVE_BASELINE.md#exact-candidate), [§10](EXECUTIVE_BASELINE.md#10-derived-reviewer-frame), [§12 step 4](EXECUTIVE_BASELINE.md#4-executive-evaluates-the-work-result) and [step 5B](EXECUTIVE_BASELINE.md#5b-candidate-requires-independent-review), [§17](EXECUTIVE_BASELINE.md#17-actor-binding-and-independence), which adds this section's declared envelope, and [§18](EXECUTIVE_BASELINE.md#18-profile-qualification), which creates no second qualification process; [CONFORMANCE](CONFORMANCE.md#conformance), its preamble, whose assessments are by an independent assessor under this section.
- Row 8, the qualification population: [REFERENCE_FRAME §5 Method functions](REFERENCE_FRAME.md#5-method-functions), each of whose relations this section qualifies and whose `conjoin` returns `invalid_basis` as this section names it; [EXECUTIVE_BASELINE §18](EXECUTIVE_BASELINE.md#18-profile-qualification), whose profile trial establishes its declared obligations the same way; the relations themselves are REFERENCE_FRAME §5's, as the choice column states.
- Row 9, derived guidance: [PRODUCT_DEFINITION §11](PRODUCT_DEFINITION.md#11-one-constitutional-surface-and-version-boundary), where a matching digest establishes identity and structure and the raw owning members remain the deciding authority; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), discriminators 18 and 40.
- Row 10, the recoverability benchmark: [CONFORMANCE §3 Recoverability](CONFORMANCE.md#3-recoverability), whose cases R-01 and R-02 measure current recoverability and any explicitly declared comparison; the reported measures are this section's, as the choice column states.
- Row 11, the conformance case rule: [CONFORMANCE §1](CONFORMANCE.md#1-counterexample-cases), [§2](CONFORMANCE.md#2-construction-trials), [§3](CONFORMANCE.md#3-recoverability) and [§4](CONFORMANCE.md#4-cases-for-method-discriminators), whose cases name their subject, mechanism, expected distinction and status under it, and [§5](CONFORMANCE.md#5-discriminator-coverage), Coverage, which records no pass for a case not run and assessed on this revision; [FOUNDATIONS §4 Formal representation](FOUNDATIONS.md#formal-representation), whose demonstration cases are CONFORMANCE's.
- Row 12, trial declarations: no separate consumer applies. The paragraph governs the eight trials of [CONFORMANCE §2](CONFORMANCE.md#2-construction-trials), declared under it in the qualification cases its status column links; the cap and budget it requires are measured under [ACTIVATION §2](ACTIVATION.md#2-context-construction-under-an-envelope) and [§6 Resource limits](ACTIVATION.md#resource-limits), which own their law, and no section of another member declares a trial.
- Row 13, the return of a reconstruction: [RELEASE §9](RELEASE.md#9-successor-baseline-conservation-stdo-up-015), whose conservation reading supplies the first head's evidence; [Method self-qualification](#method-self-qualification), where a candidate's claims against its predecessor are qualified on evidence of the kind each head names; the frame for the reconstruction task binds the distinction under [Return of a reconstruction](#return-of-a-reconstruction).

Each consumer applies the rule and decides nothing the owning section does
not (P2, P6).

## 7. Qualification of frames and of the method

### Frame qualification

A candidate frame ([REFERENCE_FRAME](REFERENCE_FRAME.md)) is qualified in
proportion to its claims (P6, P2).
The minimum evaluation asks:

1. Decision test: can a competent actor produce a result in the declared
   algebra for representative in-domain evaluations?
2. Reconstruction test: can a fresh competent actor activate the frame
   from the declared packet without hidden history (RF-013)?
3. Sensitivity test: do changes to declared material relations affect the
   result where expected?
4. Irrelevance test: do excluded unrelated changes leave the result stable
   where expected?
5. Basis test: does stale, mismatched or ambiguous basis information
   invalidate or refuse the evaluation?
6. Authority test: does frame selection preserve semantic and decision
   authority and the exact inherited operation authority for every
   material construction, transformation, admission, publication or
   mutation?
7. Counterexample test: does the frame detect the representative
   historical or constructed violations it claims to cover?
8. Capability test: can the declared actor class hold and operate the
   frame within its envelope?
9. Result-consumption test: can a declared consumer use the closed result
   without importing hidden frame context?

Qualification binds the exact frame revision, actor envelope, evaluation
family, basis class and evidence conditions evaluated. It does not
generalise to an unevaluated population by naming the frame generically
(§1, the quantifier rule).

Adequate attention. The capability test asks two questions, and they are
evaluated separately. Whether the declared actor class can hold the frame
is fit: for the context dimension, the size of the selected
representation, measured as ACTIVATION §2 step 3 measures it, against the
declared capacity; the envelope's other dimensions are fitted as RF-014
states. Whether the actor class
operates the frame adequately is adequate attention, and only actual-use
evidence establishes it: actors of the declared class apply the frame to
its declared tasks under its declared conditions, and the results are
judged against expectations recorded from the governing sources before the
results are opened, by an assessor under §3 where the claim needs
independent assessment. A size measurement, or any byte or token
threshold, establishes fit and nothing about attention; a frame that fits
is not thereby adequately attended. Actual-use evidence binds the frame
revision, actor class, tasks and conditions evaluated, like the
qualification above, and establishes no universal attention score (§1,
the quantifier rule). Time, spend and other resource limits are those of
the selected execution binding, under the resource-limit law of
[ACTIVATION §6](ACTIVATION.md#6-cost-and-proportionality), not of this
test. Finite attention makes fit necessary
(RF-002), and only use shows that a frame that fits is applied, so a frame
is never qualified for attention because it fits (P0, P6).

### Method self-qualification

The method is qualified the way it qualifies anything else. Qualification
of generic method sufficiency consumes the work boundary (FOUNDATIONS §2),
the construction and assessment relation of ACTIVATION §1 and the layered
sufficiency of §6; it creates no second process. A fresh competent
constructor operates inside a declared capability, context and
configuration envelope, using only the declared ordinary method and
authority surfaces and declared trial subjects. An independently
authorised evaluator has a declared governing basis and comparison
predicate. Material expected or reference outcomes, source exemplars or
incumbent realisations, author memory and ad hoc rescue are withheld from
the constructor until its construction result is frozen wherever earlier
exposure would compromise reconstructive independence; then the evaluator
compares the frozen result with the method's mandatory relation population
under the comparison rule of §6.
[REFERENCE_FRAME RF-013](REFERENCE_FRAME.md#rf-013-reconstructable-activation)
owns the reconstructability of the activation. The constructor, freeze,
assessor, acceptance and release protocols are supplied by the governing
authority; this member does not select a particular protocol for those
roles.

The qualification population is every function and failure relation the
method claims (REFERENCE_FRAME §5), each with its required representative
observations (P6):

| Relation under qualification | Required representative observations |
|---|---|
| `declare` | a frame set derived from a governed workspace, outcome, practices, capability envelopes, evaluation inventory, authority and residual boundary; missing authority or evaluation basis refuses |
| `activate` | activation with an exact subject and basis and a capable actor succeeds; stale, ambiguous, topology-mismatched, unauthorised and capability-incompatible activations refuse or return the applicable closed pressure |
| `evaluate` | representative `satisfied`, `falsified`, `indeterminate`, `out_of_frame` and `invalid_basis` results; sensitivity to material changes and stability under established irrelevance |
| `conjoin` | compatible closed results decide under the declared rule; a result conflict returns `conflict`, mandatory indeterminacy `indeterminate`, and a basis mismatch `invalid_basis` (Stale results, [FOUNDATIONS §4 Conjunction of results](FOUNDATIONS.md#conjunction-of-results)); under a veto or deferral the decision rule declares, `conjoin` returns the [REFERENCE_FRAME §5](REFERENCE_FRAME.md#5-method-functions) outcome whose cause holds; none flattens frame meaning |
| `translate` | preserved coordinates and provenance reach the target; declared loss stays explicit; identity, basis, authority or equality mismatch refuses |
| `audit_coverage` | evaluation, interaction, semantic, operation and decision authority, failure, capability and required independently activated or assurance-independent coverage map to capable frames or explicit residuals; artifact or actor count cannot close coverage |
| `revise` | historical failure, topology mutation, evidence change and capability change produce the declared frame-set delta and identify every prior activation, result, conjunction and coverage claim requiring reevaluation |
| result consumption | a declared consumer uses one closed result without importing hidden frame context or authority; insufficient output produces a reconstructability failure |
| material composition | a case requiring cross-frame execution declares composition, order where material, closure, failure and the conservation of semantic, operation and decision authority; a case not requiring composition stays uncomposed |

One valid frame-set declaration and coverage result establishes only the
`declare` and evaluated `audit_coverage` population; it proves activation,
evaluation, conjunction, translation, revision, result consumption and
material composition by no implication. Each relation is exercised through
representative positive, boundary and falsifying cases. Qualification may
be staged, and every verdict states the exact functions, frame revisions,
actor envelopes, basis classes, result branches and evidence populations
evaluated; an unevaluated function or branch stays open rather than
inheriting a whole-method verdict (P6; §1). Prior exemplar frame sets or
outcomes may serve as optional comparison evidence after freeze; they are
not mandatory target answers unless the governing basis explicitly requires
equivalence (§6).

Derived guidance. Changed derived guidance, a compression, a frame packet,
a skill or any other projection of the method, is qualified against
source-derived expected behaviour, including the affected permissions,
exclusions and invalidators. For a native use claim, an ordinary actor
applies that guidance through its declared entry and available context.
Digest integrity and index generation establish identity and structure,
not semantic fidelity or usability. Mechanical and operational claims
require their own executable observations, including the applicable
workload and operational assumptions of ACTIVATION §6; semantic agreement
cannot substitute for those observations (P6, P1).

The qualification law is false if constructor competence or its
capability, context or configuration envelope, or evaluator authority,
governing basis or comparison predicate, is undeclared, or an
out-of-envelope construction is used to indict the method; if the
constructor uses supplemental method or authority input that is not
declared; if a material expected or reference outcome, source exemplar or
incumbent realisation, author memory or ad hoc rescue is exposed to the
constructor before freeze where that exposure compromises reconstructive
independence; if comparison omits the mandatory governing semantic basis,
proceeds under constructor authority instead of independently authorised
evaluator authority, or is self-adjusted after seeing the result; if a
reference outcome is used as authority, reference equivalence is required
where the governing basis does not require it, basis-required reference
equivalence is omitted, subjective similarity is used as proof, or
identity, unique derivation, determinism or incumbent equality substitutes
for semantic conformance or equivalence; or if a post-exposure revision is
unclassified or is used to make the original frozen construction pass
retroactively (§3).

Recoverability benchmark (P0 with the actor-change premise). For a selected
activation, measure whether a fresh actor given only the published documents
recovers the governing relations with fidelity judged independently, and at
what reconstruction cost. The context transferred is measured as
[ACTIVATION §2](ACTIVATION.md#2-context-construction-under-an-envelope) step 3
measures size; time and spend are measured where measurable, under the
selected execution binding. The fidelity judgment is actual-use evidence
under Frame qualification above, and measured size is not evidence of it.
A document set that requires private validator knowledge, whole-corpus
loading or a prior actor's memory fails the benchmark regardless of its
content.

A comparative claim additionally declares its exact comparison baseline,
task population, actor envelope, evidence conditions and measures before
running the comparison. Material differences remain explicit and limit the
inference under §1; the baseline is evidence for that declared comparison,
not another source of method authority. No comparison baseline is required
to measure the package's own recoverability. Report fidelity, reconstruction
cost, task completion and material errors detected as separate observations;
one measure does not stand in for another (P3, P6).
