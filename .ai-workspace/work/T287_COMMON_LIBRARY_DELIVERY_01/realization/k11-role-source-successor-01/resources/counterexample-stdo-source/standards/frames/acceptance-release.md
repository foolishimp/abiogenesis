# Reference frame acceptance-release

Task: Decide whether an assessed candidate or an exact release cut is accepted: read the review results, decide whether any finding blocks promotion, apply one disposition with its core value, check closure by condition, and check the acceptance criteria and successor dispositions of a release.

Purpose: The owning sections for review results and triage, acceptance and when a finding blocks promotion, the four dispositions, the core result algebra and its conjunction, condition-based closure, release acceptance criteria, and successor baseline conservation.

Binds:

- This task binds the construction relation: A is the exact subject and basis the activation binds, Z is the task's required outcome with the acceptance conditions the task states, and the actor's claims keep preservation, progress and outcome satisfaction distinct; a judgment its evidence cannot decide is `indeterminate`, and work it cannot finish is reported as unresolved work, not as a judgment ([../ACTIVATION.md#construction-relation](../ACTIVATION.md#construction-relation); member sha256=7ad7b69b5ad8ec20678b3ef866a26fb328f2fa6f60c4d1d06ca0b926845b89bf; section sha256=6b6c2ce91c5a7e4be765af2f8009252fa8918719e1d885af6b5810ba4eb699da)
- An evaluation this task returns binds the assurance relations: the source obligation, the claimed predicate and its scope, the observation basis, the exact subject and its material dependencies; a pass is an observation until the oracle's fidelity is established ([../FOUNDATIONS.md#assurance-relations](../FOUNDATIONS.md#assurance-relations); member sha256=3e85b8d01360dfae6758566fd3aca309c977e7d9e15cdd2f9e8f2904f18f2545; section sha256=a7d5fc5930338c3fb3959017f41935ce742fbb1bf189c2f527dde4e0ba12d064 spanning to #formal-representation)

A `Binds:` item names an obligation the activation of this frame binds, with
a link to the owning section, the digest of its member and the digest of that
section, or of the span of sections it names, where it names one; the item
copies no section and owns no determination, and where no route of this frame
carries the section the item is a paraphrase of it.

Each excerpt below copies one owning section of a member of this method
byte for byte, except a `rows=k/n` excerpt (see below) and except that
each relative link destination is rebased
to resolve from this directory to the same target. Fenced code, inline
code and absolute and `stdo://` links are unchanged. The `Source:` line
before an excerpt names the member and the section's anchor, and gives
the SHA-256 of the whole owning member. The section digest recorded in
FRAME_INPUTS.json is over the owner's bytes, not over this copy. The
owning section decides; this frame owns no determination. An excerpt
whose `Source:` line says `rows=k/n` is a family table of which only
the k rows that cite a section this frame carries are copied, with the
table's preamble, header and every non-family table; the other rows
stay in the owning member and are not copied. The frame's
qualification, not this selection, decides whether the frame is
sufficient for its task.

Routes, in order:

1. [EVALUATION.md#4-review-results](../EVALUATION.md#4-review-results)
2. [EVALUATION.md#5-acceptance](../EVALUATION.md#5-acceptance)
3. [ACTIVATION.md#disposition](../ACTIVATION.md#disposition)
4. [FOUNDATIONS.md#results](../FOUNDATIONS.md#results)
5. [FOUNDATIONS.md#conjunction-of-results](../FOUNDATIONS.md#conjunction-of-results)
6. [TICKETS.md#condition-based-closure-and-reuse](../TICKETS.md#condition-based-closure-and-reuse)
7. [RELEASE.md#8-acceptance](../RELEASE.md#8-acceptance)
8. [RELEASE.md#9-successor-baseline-conservation-stdo-up-015](../RELEASE.md#9-successor-baseline-conservation-stdo-up-015)
9. [EVALUATION.md#foundation-to-law-claims-evidence-assessment-and-acceptance](../EVALUATION.md#foundation-to-law-claims-evidence-assessment-and-acceptance)
10. [EVALUATION.md#foundation-to-law-conformance-equivalence-and-qualification](../EVALUATION.md#foundation-to-law-conformance-equivalence-and-qualification)
11. [RELEASE.md#foundation-to-law-release-and-successor-conservation](../RELEASE.md#foundation-to-law-release-and-successor-conservation)
12. [TICKETS.md#foundation-to-law-work-carriers](../TICKETS.md#foundation-to-law-work-carriers)

Size of this frame: 59504 bytes.

Source: EVALUATION.md#4-review-results sha256=4c87b1286d9c721b6e050b64adb8f6804327c0d8e3dad67f7c3973cbef389fd6

## 4. Review results

A review returns one core result
([FOUNDATIONS §4, Results](../FOUNDATIONS.md#results)) for each declared
predicate it evaluated, with: the exact subject and basis, the evidence
consulted, the findings ranked by consequence, each finding's evidence and
the smallest bounded correction, the residual uncertainty, and the
invalidation conditions. A declared predicate the review planned and did
not evaluate has no result (FOUNDATIONS §4, Results). The review names it
as not performed and reports no core value for it, neither
`indeterminate` nor `falsified`, so that conjunction keeps it apart from
an undecided predicate and from required coverage that no planned
assessment addresses
([FOUNDATIONS §4, Conjunction of results](../FOUNDATIONS.md#conjunction-of-results);
P5, P6). It may recommend a disposition
([ACTIVATION §3](../ACTIVATION.md#3-step-results-and-disposition)), which is
evidence only and never a disposition; it does not apply one. A finding
without evidence a consumer can chase is commentary.

### Result and triage projection

Where a review returns findings with technical triage, the triage is the
assessor's evidence-bound assessment of each finding against the exact
evaluated claim and basis. Severity, the assessor's grade of consequence,
is evaluation evidence. Priority, the effect on the current promotion
boundary and the disposition are the decision owner's (ACTIVATION §1,
Roles and delegation; when a finding can block is
[§5, When a finding blocks promotion](../EVALUATION.md#when-a-finding-blocks-promotion))
and stay distinct values even where a
Product-defined policy maps one to another. A recommended disposition
is evidence for the decision owner: it is not a disposition, a
priority or a boundary effect, and it is never adopted mechanically (P6,
RF-007). The fields of a triage are declared by the profile that adopts it, and
the scales it uses are bound by the adopting Product (P2, P6).

The projection of the finding-level triage payload is total over the core
values of [FOUNDATIONS §4, Results](../FOUNDATIONS.md#results). A predicate
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
assessor and decision owner; [EXECUTIVE_BASELINE](../EXECUTIVE_BASELINE.md)
binds its Reviewer and Executive instance (P6).


Source: EVALUATION.md#5-acceptance sha256=4c87b1286d9c721b6e050b64adb8f6804327c0d8e3dad67f7c3973cbef389fd6

## 5. Acceptance

Acceptance is the decision owner's disposition over an unchanged subject;
recording it cannot widen it, and it exhausts only the instance and interval
it names (P6, P2).
A work item closes by the condition it stated, not by a reviewer's approval;
a reviewer result is an input to closure, never the closure. Green labels,
document counts, review counts and historical outcomes are not acceptance.
A human decision may be exercised directly or through an explicitly admitted
bounded proxy. What a proxy grant names is
[IDENTITY §6](../IDENTITY.md#6-authority-identity-and-conservation-stdo-up-004)'s,
and what a proxy can never decide is
[FOUNDATIONS §2 Authority kinds](../FOUNDATIONS.md#authority-kinds)';
for acceptance, a change a proxy cannot make re-enters at its owning
relation ([ACTIVATION §1 Roles and delegation](../ACTIVATION.md#roles-and-delegation)).

Where the subject is a successor, its acceptance evidence includes the
successor disposition record of [RELEASE §9](../RELEASE.md#9-successor-baseline-conservation-stdo-up-015)
(STDO-UP-015), which states the law: the exact predecessor immutable cut
the successor evolves, and one semantic disposition for every predecessor
claim capable of affecting the successor. A claim whose disposition is
unresolved cannot be qualified and so cannot be accepted; how the record
is evaluated is [RELEASE §9](../RELEASE.md#9-successor-baseline-conservation-stdo-up-015).
An intentionally removed disposition is a decision of the current Product
authority, and its record is that decision (P6, P3, P4b).

### When a finding blocks promotion

A finding is a defect a review reports against the exact claim it
evaluated (§4). Blocking current promotion is the decision owner's act
over that finding (§4, Result and triage projection). This section is the
one statement of when a finding can block; profiles and work carriers
refer to it and add only their domain triggers.

A review verdict is bounded by the exact reviewed claim and its applicable
hard stops ([ACTIVATION §4](../ACTIVATION.md#4-totality-and-refinement)). A
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
| any other finding meeting one of the four conditions | the decision owner decides blocking from the exact affected claim, the governed outcome or decision the work serves ([ACTIVATION §1, Intake](../ACTIVATION.md#intake)), the applicable hard stops and the Product-owned cutoff policy; below that cutoff no block follows mechanically, and an accepted residual is retained explicitly |
| a finding meeting none of the four conditions | it does not block |
| an observation outside the exact reviewed claim | repricing or re-entry input, returned as §4 states: by itself it does not widen the reviewed subject, block its bounded claim, or require a new ticket, artifact, review round or implementation increment |

Severity selects neither priority nor a block mechanically, and priority
neither erases severity nor waives a hard stop. The decision cutoff is the
adopting Product's policy; this member sets no cutoff (P6, P2). This law
applies at any promotion boundary; [EXECUTIVE_BASELINE](../EXECUTIVE_BASELINE.md#promotion-constraint-projection)
binds the Executive instance. Purpose and material relation: one owner
gives every review consumer the same blocking condition. A bounded review
does not block on observations outside its claim, while a non-waivable hard
stop still blocks.


Source: ACTIVATION.md#disposition sha256=7ad7b69b5ad8ec20678b3ef866a26fb328f2fa6f60c4d1d06ca0b926845b89bf

### Disposition

The decision owner disposes an assessed candidate with one of four
semantic dispositions (§1, Roles and delegation; P6, P5). An assessor may recommend one; the
recommendation is evidence for the decision owner, never a disposition
([EVALUATION §4](../EVALUATION.md#4-review-results)). The disposition is the
acceptance result: it consumes the candidate's availability and assessment
results and stays separate from both (FOUNDATIONS §4 Results). Each maps
to the core for the predicate "the candidate is accepted at its declared
boundary":

| Disposition | Condition | Core value |
|---|---|---|
| `accept` | the candidate closes its declared cone and preserves every affected governing relation | satisfied |
| `local_repair` | implementation or proof is locally defective while the governing relation remains coherent | falsified |
| `re_enter` | the governing outcome, a requirement, an identity, a lifecycle, an authority, a public contract or the accepted design must change | invalid_basis |
| `reject` | the candidate violates a governing relation or leaves an undisposed competing truth path | falsified |

For `local_repair` the local defect, and for `reject` the violated relation
or the competing truth path, is the counterexample to accepting this
candidate; a repaired candidate is a new candidate with its own results.
For `re_enter` the governing basis the candidate was built and assessed on
must change, so that basis cannot support acceptance; the change re-enters
at its owning relation (§4). The core values place
acceptance in the one core, as FOUNDATIONS §4 Results requires, so that a
consumer combining results cannot take availability or assessment as
acceptance (P6).

Global correctness means conserving every global relation affected by the
bounded action; it does not require proving the whole product inside every
local action (P4b). Repeated rejection against one unchanged boundary
requires reassessment of the frame altitude, the causal cone, the common
components, the design-versus-code placement and the authority
sufficiency. The method sets no rejection-count threshold, mandatory
review-round count or review state machine; it prohibits repeating an
unchanged failed construction relation as if iteration alone could close
it (P2).


Source: FOUNDATIONS.md#results sha256=3e85b8d01360dfae6758566fd3aca309c977e7d9e15cdd2f9e8f2904f18f2545 rows=7/18 selected by the anchors this frame carries; the consumers paragraph of 18 items is omitted

### Results

Every performed evaluation returns one value of the core result algebra,
directly or as a refined value mapped into it (P5):

| Value | Meaning |
|---|---|
| `satisfied` | the declared predicate holds on the exact basis |
| `falsified` | a declared counterexample defeats it |
| `indeterminate` | the available admissible evidence cannot decide it |
| `out_of_frame` | the evaluation requires an undeclared material relation or capability |
| `invalid_basis` | the subject or basis cannot support the evaluation |

This core is the only one. Results of constraints, judgments, frame
evaluations, stops, work steps and effects are stated in it or in a
refinement mapped into it, so that results from any members combine under
one rule ([Conjunction of results](../FOUNDATIONS.md#conjunction-of-results)). Purpose and
material relation: no combination can report success while a failure, an
undecided question, an unperformed evaluation or an uncertain effect
remains, and none of these can be mistaken for another (P5, P6).

Recording. A result records its core value together with the predicate
evaluated and the original domain outcome, which is the refined value
where a refinement produced it. A mapping into the core never owns domain
meaning: the member, profile or adopting Product that defines the refined
value keeps it, and a consumer that needs the domain distinction reads the
domain outcome, never the core value alone (P1, P6).

Standing. The standing of a result is what it establishes about its
predicate; it is distinct from the standing of a commitment (§1). Only
`satisfied` establishes the predicate. `falsified` establishes that the
predicate fails and names the counterexample. `indeterminate`,
`out_of_frame` and `invalid_basis` establish neither, and each names what
would decide: the evidence, the missing relation or capability with its
owner where the subject gives one, or the basis repair. By support for the
predicate, `satisfied` stands above each other value, and the other four
are not ordered among themselves.

No refinement or mapping raises a result's standing (P5, P6):

- a falsified or failed result never maps to a satisfied or successful one;
- a result that admissible evidence cannot decide never maps to
  `satisfied`;
- an evaluation that was not performed stays distinct from one whose
  evidence cannot decide: it has no
  [closed result](../ACTIVATION.md#7-closed-result-and-reuse), and it is never mapped
  to `indeterminate` or to any other core value;
- an effect whose completion is unknown never maps to no effect or to
  completed.

Not performed. An evaluation that is required or planned and was not
performed has no closed result; an actor cannot report an evaluation it
did not perform (P6). Nothing is coerced to success: a failed,
indeterminate, out-of-frame, out-of-scope or invalid-basis result follows
the declared result algebra and returns its own value under it, never
`satisfied`, and a missing result, being no result, enters every
conjunction over it as a gap: a planned assessment without a closed result
where an assessment was planned, and uncovered coverage where none was.
[REFERENCE_FRAME §3](../REFERENCE_FRAME.md#rf-012-closed-results) states
RF-012 as a law over frames and
[AXIOMATIC_CALCULUS §4](../AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal)
states AC-007 as a law over constraints; each uses this core and neither
defines it again.

Refinements. A member, profile or adopting Product that needs finer
outcomes defines a refinement. The refinement names the question it
answers and the predicate its mapping is for, and maps every refined value
to exactly one core value. No outcome exists outside the core; a
refinement adds no core value and keeps the pressure of `indeterminate`,
`out_of_frame` and `invalid_basis` explicit. Where a refined value would
map to one of two core values according to its cause, the cause is part of
the refined value and each resulting value maps once (P5, P1). A further
refinement, by a member, profile, project or adopting Product, may split a
refined value by cause. The parent-value rule governs every such split:
each child value names its parent value and its cause and keeps its
parent's core value; a child that needs a different core value needs a
different parent value, which only the owner of the parent declares; and
no child takes `satisfied` from a parent that is not `satisfied`. No
further refinement raises a result's standing (P5, P6, P1). Purpose and
material relation: a consumer that reads a parent value reads the same
core value from each of its children, so a split by cause adds a domain
distinction and never changes what the parent establishes (P5, P6). The
refinements for admission, activation and steps are
[ACTIVATION §3](../ACTIVATION.md#3-step-results-and-disposition); each other
member, profile and adopting Product states its mapping where it defines
its values.

Availability, assessment and acceptance are separate results, each with its
own predicate: that a step produced a candidate; that the candidate meets
its declared criteria; and that the
[decision owner](../ACTIVATION.md#roles-and-delegation) accepts it at its
boundary. A step having produced a candidate never maps to the candidate's
fitness or acceptance, and acceptance is never inferred from a successful
step (P6; [ACTIVATION §3](../ACTIVATION.md#3-step-results-and-disposition),
[EVALUATION §4](../EVALUATION.md#4-review-results) and
[§5](../EVALUATION.md#5-acceptance)).

Out of frame or indeterminate. The boundary between these values is drawn
on what the activated frame declares and on what the step did with it (P5,
finite capacity and graceful total handling; the material relation drawn
is the three-way out_of_frame boundary: capability not declared, capability
declared and exercised, capability declared and not exercised). Three cases; the first two name core values, and
the third names none:

- `out_of_frame` when the claim requires a material relation or an
  evaluator capability that the activated frame does not declare. The
  result names the missing relation or capability, its owner where the
  subject gives one, and the reconfiguration pressure it creates
  ([ACTIVATION §4](../ACTIVATION.md#4-totality-and-refinement)). A term the claim depends on and the frame
  leaves undefined is an undeclared material relation: its meaning can
  alter the result and it enters through no declared input (RF-003; P1). Whether the step exercised anything is
  irrelevant to this value; the ground is the missing declaration.
- `indeterminate` when the available admissible evidence cannot decide the
  claim. The result names the evidence that would decide, as
  its residual uncertainty. Where the
  claim also depends on an undeclared relation or capability,
  `out_of_frame` and `indeterminate` each have a lawful ground; the result
  names the value it returns and that ground, and this boundary excludes
  neither (P5).
- no value of its own when the step did not exercise a declared capability
  the evaluation requires. A result is returned wherever a sufficient
  evaluation or an applicable judgment exists without that capability,
  identifying its evidence, verdict and residual uncertainty like any
  closed result:
  a counterexample found by what was exercised, as when source inspection
  falsifies A in a claim of A and B, returns `falsified`, and common
  agreement cannot discard it. Where none
  exists because the capability was not exercised, the evaluation was not
  performed and has no result: the step's stop state carries it,
  `incomplete` under
  [construction availability](../ACTIVATION.md#construction-availability), and
  its work state ([ACTIVATION §5](../ACTIVATION.md#5-work-state-and-restart))
  carries the unexercised capability as a residual (P6). In either case
  the unexercised part, B above, has no result: in every conjunction over
  it, it is a planned assessment without a closed result, and the known
  failure A survives with it ([Conjunction of results](../FOUNDATIONS.md#conjunction-of-results)).
  The evaluation's result and the step's stop state answer different
  questions, so the step's stop value never becomes the evaluation's
  result.

Foundation to law for results and their combination (family F3). The
table covers every rule of §4 and the result grounds of §2 Imports
between members, in the format of
[Foundation to law](../FOUNDATIONS.md#foundation-to-law), which states the standing of its
consequences. Purpose and material relation: a reader of §4 sees which
commitments each result rule rests on and which choices it adds, with their
owners (P6, P2). Instance premises, which the commitments do not supply:
(i) an evaluation declares its predicate, subject and basis; (ii) results
of several evaluations, steps or members are combined into one decision;
(iii) members, profiles and adopting Products need outcomes finer than the
core.

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|
| P6 (independent), P5 (derived from P0 and P6) | a result claims no more than it establishes: only `satisfied` establishes the predicate, and no refinement or mapping raises a result's standing | [Results](../FOUNDATIONS.md#results), Standing, and the rule that nothing raises standing; for the choice, [Conjunction of results](../FOUNDATIONS.md#conjunction-of-results), Reported value | the order among the four other values within one combination; owner: the member or profile that applies the conjunction, in its declared rule | 9 |
| P6 (independent), P0 (recovered, with its premise that a step's output is a candidate until evaluated) | that a candidate exists, that it meets its criteria and that its owner accepts it are three claims with three predicates, and producing a candidate establishes neither of the others | [Results](../FOUNDATIONS.md#results), availability, assessment and acceptance | the acceptance boundary and who accepts there; owner: the decision authority that [EVALUATION §5](../EVALUATION.md#5-acceptance) names | 9 |
| P4b (derived from P0 and P2), P5 (derived from P0 and P6), P6 (independent); (ii) | a combination keeps failures, unperformed assessments and uncovered obligations apart and carries each through every join; agreement among contributors discards no counterexample | [Conjunction of results](../FOUNDATIONS.md#conjunction-of-results): its three inputs, Gaps, Survival, Predicates travel | none | 3, 9 |
| P3 (independent), P5 (derived from P0 and P6), P6 (independent); (i), (ii) | a result supports its predicate only on the basis it binds, so a component held only on another basis has, on the basis the composite requires, no performed evaluation and is a gap, while an evaluation performed on a basis that cannot support it decides its own predicate as `invalid_basis`; one component is never answered both ways | [Conjunction of results](../FOUNDATIONS.md#conjunction-of-results), Stale results | none | 3, 9 |
| P5 (derived from P0 and P6), P6 (independent); (ii) | a composite with a gap or a non-satisfied mandatory result is never `satisfied`; where every mandatory result is `satisfied`, its own value is `invalid_basis` if the declared basis relations disagree, and otherwise `indeterminate` while a gap remains; with every mandatory result `satisfied`, agreeing bases and no gap, a material counterexample to a mandatory constraint falsifies it whichever contributor found it, and without one its value is the one its declared rule gives over the mandatory results; a `falsified` result that is not mandatory stays in its record | [Conjunction of results](../FOUNDATIONS.md#conjunction-of-results), Reported value | which non-satisfied value is reported; owner: the member or profile that applies the conjunction, in its declared rule | 3, 9 |
| P6 (independent), P4a (independent); (ii) | a conjunction decides only under a declared rule and transfers no contributor's semantic authority | [Conjunction of results](../FOUNDATIONS.md#conjunction-of-results), The declared rule | the mandatory results, the handling of conflict and indeterminacy, the basis relations that must agree, the decision authority that owns the conjunction, how results that are not mandatory count, and any veto or deferral; owner: the member or profile that applies the conjunction, in its declared rule | 3, 9 |
| P4a (independent), P4b (derived from P0 and P2) | composed steps exist only under typed composition; the composite carries both steps' step-produced facts, and its result for the outer predicate is the conjunction over the outer contract's obligations | [§4](../FOUNDATIONS.md#4-algebra) Composition; [Conjunction of results](../FOUNDATIONS.md#conjunction-of-results), Composition of results; [RF-010](../REFERENCE_FRAME.md#rf-010-composition-on-demand), outside this member | whether a composition law is needed, under the conditions RF-010 states; owner: the governing evaluation | 3, 4 |

RF-012 in [REFERENCE_FRAME §3](../REFERENCE_FRAME.md#rf-012-closed-results),
AC-007 in
[AXIOMATIC_CALCULUS §4](../AXIOMATIC_CALCULUS.md#ac-007-constraint-and-refusal)
and [EVALUATION §4](../EVALUATION.md#4-review-results) apply the first row's
algebra to frames, constraints and reviews and add no choice of their own
beyond any refinement they map under the fifth row;
[ACTIVATION §3](../ACTIVATION.md#3-step-results-and-disposition) holds the
step's refinements of the fifth row and the stop state of the seventh.


Source: FOUNDATIONS.md#conjunction-of-results sha256=3e85b8d01360dfae6758566fd3aca309c977e7d9e15cdd2f9e8f2904f18f2545

### Conjunction of results

Conjunction combines results into one result for a composite predicate: a
claim made of component claims, a decision over several evaluations, or
the outer contract of composed steps. It is defined here once, over the
core. A member or profile that combines results applies this rule and
declares only the choices it leaves open (P4a, P4b, P5, P6). Purpose and
material relation: failure, undecidability, non-performance and uncertain
effects stay distinct after combination, so a composite can neither report
success nor hide which kind of gap it has while one of them remains in
what it requires.

A conjunction takes three inputs and keeps them apart:

1. the closed results returned, each a core value with its predicate and
   domain outcome;
2. the planned assessments that have no closed result applicable to the
   composite: evaluations the composite requires that were not performed,
   or whose result is absent, stale, bound to another subject or basis, or
   incapable of establishing its claim;
3. the required coverage that no planned assessment addresses: for a
   required obligation set R and the coverage C that the planned
   assessments admit, the uncovered coverage R minus C.

Gaps. A conjunction with any item in the second or third input is never
`satisfied`. Its record names which kind of gap it has, not performed,
uncovered or both, and each item. An uncovered obligation is never
reported as satisfied or as an omitted planned assessment; a planned
assessment without a closed result is never reported as uncovered or as an
`indeterminate` component.

Stale results. A held result is stale for a composite when the basis it
binds is not the basis the composite requires of that component, because
a later state has superseded or advanced it or because it binds another
subject or basis (§2, Basis). Two questions stay apart, so that one
composite has one reported value (P3, P5, P6):

- an evaluation performed on a subject or basis that is stale, advanced,
  ambiguous or mismatched against the one it must bind returns
  `invalid_basis` for its own predicate, or is reactivated on the current
  basis; [RF-005](../REFERENCE_FRAME.md#rf-005-exact-basis-and-coordinates)
  states this law over frames, and a conjunction that receives that
  `invalid_basis` holds it as a returned result;
- a component whose only held result is stale has no closed result
  applicable to the composite: on the basis the composite requires, its
  evaluation was not performed. It is a planned assessment without a
  closed result, in the second input, and a gap. Its stale value is
  neither counted as a returned result nor relabelled `invalid_basis` for
  the composite, and it stays in the record with its own basis;
- the declared basis relations disagree (Reported value below) only among
  returned results, each bound to the basis the composite requires of it,
  whose bases the declared rule requires to agree or to join in a coherent
  composite basis, and which do not.

A stale `satisfied` never counts toward the composite. Purpose and
material relation: answering one stale component as a gap in one place and
as `invalid_basis` in another would give one composite two reported
values; keeping the evaluation's own value apart from the composite's gap
keeps the reported value unique and the stale result visible.

Survival. Every known failure (a `falsified` result with its
counterexample), every planned assessment without a closed result and
every uncovered obligation is carried with the composite and survives every
join: combining conjunctions takes the union of known failures and of
planned assessments without a closed result, and recomputes uncovered
coverage over the combined obligations. A known failure and a gap of
either kind survive every join. Common agreement among contributors
cannot discard a constraint or a material counterexample that only one
contributor found. A missing, wrong-subject, conflicted or indeterminate
mandatory result stays unresolved under the declared rule, and aggregate
satisfied status cannot replace it (P4b, P5).

Predicates travel. Each component keeps its predicate and domain outcome
through every join, so an uncertain effect stays distinct from a failure
and from an undecided claim, and a `satisfied` for one predicate never
counts toward another: a step's `satisfied` for "a candidate is available"
never counts toward the candidate's fitness or acceptance.

Reported value. The conjunction is `satisfied` only when every mandatory
result is `satisfied` with valid applicable evidence, the declared basis
relations agree, and the second and third inputs are empty. A composite
with a material counterexample to a mandatory constraint or an uncovered
required obligation cannot project success. Where a mandatory result is
not `satisfied`, the conjunction
reports a non-satisfied value chosen by its declared rule from those
returned; no universal order among the non-satisfied values exists, and
the member or profile that applies the conjunction declares its own in
its declared rule. Where every mandatory returned result is `satisfied`
and the declared basis relations disagree, the conjunction reports
`invalid_basis`, because no coherent composite basis supports the
composite predicate (§2, Basis); any gaps stay recorded by kind. Where
every mandatory returned result is `satisfied`, the declared basis
relations agree and a gap remains, the conjunction reports
`indeterminate`, because the results it holds cannot decide the composite
predicate; that value is the conjunction's own, and the gaps stay
recorded by kind. A `falsified` result that is not mandatory stays in the
conjunction's record with its predicate and is never discarded. Where
every mandatory result is `satisfied`, the declared basis relations agree
and no gap remains, a material counterexample to a mandatory constraint
falsifies the conjunction whichever contributor found it, and without one
the conjunction's value is the one its declared rule gives over the
mandatory results.

The declared rule. A conjunction declares which results are mandatory; how
conflict and indeterminacy are handled; which basis relations must agree,
results on different bases combining only under a declared coherent
composite basis (§2, Basis); which decision authority owns the
conjunction; how results that are not mandatory count; and whether any
result may veto or defer the decision.
Conjunction does not transfer the semantic authority of a contributing
evaluation (P6, P4a).

Composition of results. The result of composed steps for the outer
predicate is the conjunction of the steps' results, with the outer
contract's obligations as the required coverage. That each step returned
`satisfied` supports the outer predicate only where the refinement's
premises hold ([ACTIVATION §4](../ACTIVATION.md#4-totality-and-refinement),
Refinement).


Source: TICKETS.md#condition-based-closure-and-reuse sha256=5f7e4cb0785a27b9e6dda1fd91044e775183b6a0e6e80b33811e54665b144b57

### Condition-based closure and reuse

A work claim is complete only when every applicable declared obligation is
satisfied by valid evidence for its exact subject, basis and scope; every
required judgment and owner ruling is present and applicable; and no active
non-closure condition remains. A mandatory obligation whose applicability is
unknown, or whose evidence is insufficient, withholds the dependent claim;
evidence presence alone is not satisfaction. The existing owner decides any
reserved acceptance (P6, P5).
This condition is the
[conjunction of results](../FOUNDATIONS.md#conjunction-of-results) with the
declared obligations as required coverage. This section owns the
closure condition of a work claim;
[SPEC_METHOD §4 Consistency gate](../SPEC_METHOD.md#consistency-gate)
applies it as the gate over a declared change span.

Review evaluates these conditions; its occurrence is not the closing event.
Where applicable law requires no independent review or reserved
acceptance, a work claim is recorded as
[ACTIVATION §1 Roles and delegation](../ACTIVATION.md#roles-and-delegation)
states in Recording a result without review, with the ticket as the
existing carrier. The conditions that still apply include sprint-close
law (§3) and the design profile's law (P6, P2).

An unchanged obligation reuses valid applicable evidence and recorded J
and O under the reuse rule of
[ACTIVATION §7](../ACTIVATION.md#7-closed-result-and-reuse). For a work
claim, the changed material inputs and revising observations that rule
names include a material counterexample, changed evidence and a stated
revising observation of a recorded J; with a changed basis, each
invalidates the affected claim and its dependent results before further
reliance. An unrelated observation is retained as bounded repricing input;
it does not reopen a satisfied claim or expand the work automatically.
Closure recording preserves the exact evaluated scope, the satisfied
conditions, the evidence and the remaining residuals (P4b, P2).


Source: RELEASE.md#8-acceptance sha256=53f465d4d25b097c7da0df0e1f18805d273b032f6fe849b59a457b29b1349992

## 8. Acceptance

### Acceptance criteria

An RC may be accepted when (P6, P3):

- pre-RC qualification passed for the declared subject;
- independent exact-cut review passed where required;
- required operator review is complete;
- the intended release scope and successor relation are stable;
- release-scoped assets accurately describe the exact cut;
- all release-blocking gaps, including the findings that block promotion
  under [EVALUATION §5 When a finding blocks promotion](../EVALUATION.md#when-a-finding-blocks-promotion),
  are closed or the claimed scope is explicitly narrowed; and
- the human Product authority accepted the exact immutable RC identity.

Each criterion is a mandatory gate in the sense of
[FOUNDATIONS §4 Change impact and evidence reuse](../FOUNDATIONS.md#change-impact-and-evidence-reuse):
it applies irrespective of any selection of checks after a change, and
retained evidence satisfies it only under the validity conditions stated
there (P6).

Acceptance attaches to that immutable RC identity. It neither advances
nor rolls back the version-line selector. Consumer adoption separately
evaluates the exact latest target presented by the channel and mutates
only after its digest-bound plan is accepted (P6, P3; EVALUATION §5 is
the generic acceptance law).

### External qualification dependencies

Some claims depend on external backends, transports or operator-facing
services outside the local carrier. Such a dependency may remain out of
Product for carrier and migration classification while still blocking the
dependent release claim (P6, P5).

A clean skip caused by an unhealthy external dependency is an evaluation
not performed, which has no result
([FOUNDATIONS §4 Results](../FOUNDATIONS.md#results), Not performed). It may
preserve correct Product classification, but it cannot establish that the
dependent capability passed. The claim is either qualified against a
healthy dependency or narrowed before acceptance (P6, P5).


Source: RELEASE.md#9-successor-baseline-conservation-stdo-up-015 sha256=53f465d4d25b097c7da0df0e1f18805d273b032f6fe849b59a457b29b1349992

## 9. Successor baseline conservation (STDO-UP-015)

A successor identifies the exact predecessor immutable RC whose semantic
claims it evolves. That origin remains immutable for the candidate. Every
predecessor claim capable of affecting the successor receives one semantic
disposition (P4b, P3, P6):

- conserved: the successor retains the claim;
- superseded: an accepted successor relation replaces it;
- intentionally removed: current Product authority removes it; or
- not applicable: it has no successor effect, with a bounded reason.

Evidence for a disposition is retained or reassessed under
[FOUNDATIONS §4 Change impact and evidence reuse](../FOUNDATIONS.md#change-impact-and-evidence-reuse):
a `conserved` reading made on an earlier successor text applies to a later
one only where the owning text and the consumer bindings that carry it
are unchanged, or the change is shown not to affect the claim (P3, P6).

An unresolved disposition blocks qualification of the affected claim.
Conservation is semantic: patch absence does not prove loss when a
successor-native realisation preserves behaviour, and naming or code
similarity does not prove conservation without relevant evidence (P6,
P1). The comparison that decides `conserved` is made on the same material
case, scope and authority: what must happen, what may happen, what is
prohibited, and what follows when a trigger, exception or required
premise is absent, in the owning text and in the consumer bindings that
apply it, with the counterexamples that would expose a changed decision.
Modal wording is judged by that meaning: indicative wording can state a
binding law, and rewriting "must" or "shall" is neither conservation nor
supersession by itself; an obligation stays obligatory, a preference
stays a preference, and every permitted exception and scope condition
survives, or the claim is not conserved. A statement that a whole
package's wording is equivalent establishes none of this for any claim
(P6, P1). A `conserved` disposition recorded
before this test applied is re-evaluated under it before the affected
claim qualifies; until then its standing is `unresolved`.

Each disposition is a claim the successor makes about one predecessor
claim ([EVALUATION §1](../EVALUATION.md#1-claims)), not a result value; its
predicate is its value's wording above. It is distinct from the decision
owner's disposition of an assessed candidate
([ACTIVATION §3 Disposition](../ACTIVATION.md#disposition)), which is an
acceptance result. Qualification evaluates each
disposition on evidence and records a value of the core result algebra
([FOUNDATIONS §4 Results](../FOUNDATIONS.md#results)) with that predicate.
An unresolved disposition states no claim and so has no result: in the
qualification of the affected claim it is a planned assessment without a
closed result, which is why it blocks that qualification
([FOUNDATIONS §4 Conjunction of results](../FOUNDATIONS.md#conjunction-of-results),
Gaps). Purpose and material relation: a recorded disposition establishes
nothing until it is evaluated, so no disposition stands as a result (P6,
P5).

Where a maintenance or support line may affect retained claims, the
release basis identifies the watched source, observation boundary,
inclusion policy and successor candidate. Relevant changes receive
semantic disposition at material integration and exact-cut qualification.
The consumer owns its record, branch strategy, comparison and proof
mechanism (P4b, P6).

[EVALUATION §5](../EVALUATION.md#5-acceptance) states what acceptance
requires of the disposition record; it applies this section and is not
part of it (P4b, P6).


Source: EVALUATION.md#foundation-to-law-claims-evidence-assessment-and-acceptance sha256=4c87b1286d9c721b6e050b64adb8f6804327c0d8e3dad67f7c3973cbef389fd6 rows=4/17 selected by the anchors this frame carries; the consumers paragraph of 17 items is omitted

### Foundation to law: claims, evidence, assessment and acceptance

This family, claims, evidence, assessment and acceptance (F6 in the index
of [FOUNDATIONS §3 Foundation to law](../FOUNDATIONS.md#foundation-to-law)),
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
[FOUNDATIONS §3 Foundation to law](../FOUNDATIONS.md#foundation-to-law).

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|
| P6 (independent), P5 (derived from P0 and P6, with P0's open-world premise) | By P6 a result must let its consumer check and dispose it, and by P5 an unevaluated predicate has no result, so a review result carries, for each predicate it evaluated, the exact subject and basis, the evidence consulted, the findings ranked by consequence with each finding's evidence and smallest bounded correction, the residual uncertainty and the invalidation conditions. A recommended disposition is evidence only and never a disposition, and the review applies none; a finding without evidence a consumer can chase is commentary | [§4](../EVALUATION.md#4-review-results), first paragraph | none | 3, 9 |
| P6 (independent), P2 (independent), P0 (recovered, with its premise that a step's output is a candidate until evaluated); instance premise d | By P6 and (d) acceptance is the decision owner's act, and by P0 the subject accepted must be the evaluated one, so acceptance is the decision owner's disposition over an unchanged subject; recording it cannot widen it, and by P2 it exhausts only the instance and interval it names. A work item closes by the condition it stated, and a reviewer result is an input to closure, never the closure; green labels, document counts, review counts and historical outcomes are not acceptance | [§5](../EVALUATION.md#5-acceptance), first paragraph | the acceptance boundary, its interval and its decision owner: the governing basis that names them; the closing condition of a work item: that work item ([TICKETS](../TICKETS.md#7-authority-judgment-closure-and-state)) | 9 |
| P6 (independent), P3 (independent); instance premise d | By P6 and (d) a decision is the owner's, exercised directly or through a grant it admits, and by P3 a proxy's identity stays distinct from the human authority's, so a human decision may be exercised directly or through an explicitly admitted bounded proxy; a change a proxy cannot make, under FOUNDATIONS §2's proxy limit, re-enters at its owning relation | [§5](../EVALUATION.md#5-acceptance), the proxy sentences | what a proxy grant names: [IDENTITY §6](../IDENTITY.md#6-authority-identity-and-conservation-stdo-up-004); what a proxy can never decide: [FOUNDATIONS §2 Authority kinds](../FOUNDATIONS.md#authority-kinds); whether a proxy is admitted, with its scope and exclusions: the human authority that grants it | 9 |
| P6 (independent), P3 (independent), P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable); instance premise a | By P4b and P3 a successor's predecessor claims persist and bind exact identities, and by P6 and (a) acceptance relies on qualified claims, so where the subject is a successor its acceptance evidence includes the successor disposition record. A claim whose disposition is unresolved cannot be qualified and so cannot be accepted; an intentionally removed disposition is a decision of the current Product authority, and its record is that decision | [§5](../EVALUATION.md#5-acceptance), second paragraph | the disposition values and how the record is evaluated: [RELEASE §9](../RELEASE.md#9-successor-baseline-conservation-stdo-up-015) (family F15); each removal: the current Product authority | 1, 9 |

The core result a review returns for each evaluated predicate, the rule
that a planned predicate not evaluated has no result, and the projection of
the triage payload over the core values (§4) apply the core result algebra;
they are traced in family F3 at
[FOUNDATIONS §4 Results](../FOUNDATIONS.md#results), and the rows above trace
what §4 decides about the review record, triage and returns.


Source: EVALUATION.md#foundation-to-law-conformance-equivalence-and-qualification sha256=4c87b1286d9c721b6e050b64adb8f6804327c0d8e3dad67f7c3973cbef389fd6 rows=1/13 selected by the anchors this frame carries; the consumers paragraph of 13 items is omitted

### Foundation to law: conformance, equivalence and qualification

This family, conformance, equivalence and qualification (F7 in the index of
[FOUNDATIONS §3 Foundation to law](../FOUNDATIONS.md#foundation-to-law)),
decides when a realisation, a frame or the method itself is shown fit for
what it claims. It covers §6 and §7 of this member and the
[CONFORMANCE](../CONFORMANCE.md) member; a rule in CONFORMANCE is marked
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
[FOUNDATIONS §3 Foundation to law](../FOUNDATIONS.md#foundation-to-law).

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|
| P1 (independent), P6 (independent); instance premise b | By P1 moved text is not changed meaning and unchanged bytes are not conserved meaning, and by P6 each claim needs its own evidence, so a reconstruction return states semantic conservation, demonstrated reduction and mere relocation as separate claims with separate evidence, and no byte or size measure establishes any of them | [Return of a reconstruction](../EVALUATION.md#return-of-a-reconstruction) | the dispositions and the conservation reading: [RELEASE §9](../RELEASE.md#9-successor-baseline-conservation-stdo-up-015) (family F15); the reduction measure, its baselines and the traced paths: the candidate's design, declared before the trace | 1, 6, 9 |

CONFORMANCE §1 to §4 list the cases, which are the choices named in the
last two rows; its §5 maps the method discriminators to cases and
logical-review checks.


Source: RELEASE.md#foundation-to-law-release-and-successor-conservation sha256=53f465d4d25b097c7da0df0e1f18805d273b032f6fe849b59a457b29b1349992 rows=3/12 selected by the anchors this frame carries; the consumers paragraph of 12 items is omitted

### Foundation to law: release and successor conservation

This family (F15 in the index of
[FOUNDATIONS §3 Foundation to law](../FOUNDATIONS.md#foundation-to-law))
decides how a product's releases are identified, published, qualified,
accepted and selected, and how a successor conserves its predecessor's
claims. Its instance premises, which the commitments do not supply, are
named in the rows as follows: recursive products, a released product may
build other products and the next version of itself; published cuts, a
project publishes point-in-time cuts of its product for review, replay and
adoption by consumers it does not control; mutable carriers, the carrier
that holds a release has movable names and may hold several independently
released projects; derived assets, some products are released with
derived or distributed assets that must match their source; external
services, some claims depend on services outside the carrier; successor
lines, a product evolves from a predecessor release whose claims may
affect it. The index also assigns to this family
[FOUNDATIONS §2 Product lineage objects](../FOUNDATIONS.md#product-lineage-objects);
the table traces that section in its first two rows, whose rule column
names it, and owns none of it. Each commitment's standing is written as
the table of commitments in FOUNDATIONS §3 states it.

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|
| P6 (independent); P1 (independent); P3 (independent); instance: published cuts | By P3 and P6 a verdict holds for the exact subject and claim it binds, so qualification binds the exact cut, claims, basis, each claimed property with its observation boundary, evidence, verdicts, gaps and successor relation, and acceptance is the acceptance authority's verdict over the exact immutable cut. By P1 a weaker kind of evidence does not stand for a stronger claim. A verdict moves no selector, and a change to a qualifying byte leaves the verdict on the old cut. | [§3 Exact-cut qualification](../RELEASE.md#exact-cut-qualification); [§8 Acceptance criteria](../RELEASE.md#acceptance-criteria) | the seven acceptance criteria: domain choices of this member; the generic claim and acceptance law: [EVALUATION §1](../EVALUATION.md#1-claims) and [§5](../EVALUATION.md#5-acceptance) (family F6); acceptance of each cut: the human Product authority | 7, 9 |
| P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable); P3 (independent); P6 (independent); P1 (independent); P5 (derived from P0 and P6, with P0's open-world premise); instance: successor lines | By P4b and P3 a successor evolves one exact, immutable predecessor whose established claims persist, so it names that predecessor, and every predecessor claim that can affect it receives one disposition. By P6 and P1 a disposition is a claim evaluated on evidence, so naming or code similarity does not prove conservation, and a missing patch does not prove loss when a successor-native realisation preserves behaviour; by P5 an unresolved disposition leaves a gap, so the affected claim cannot be qualified. | [§9](../RELEASE.md#9-successor-baseline-conservation-stdo-up-015) | the four disposition values: this member, restating UP-015; each removal: the current Product authority; the record of a successor's dispositions: that successor's construction | 1, 9 |
| P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable); P6 (independent); instance: successor lines | By P4b a change on a support line persists into what the successor retains, and by P6 its effect needs a disposition by evidence, so where a maintenance or support line may affect retained claims, the release basis names its watched source, observation boundary, inclusion policy and successor candidate, and relevant changes receive a disposition at integration and at qualification. | [§9](../RELEASE.md#9-successor-baseline-conservation-stdo-up-015), the support-line paragraph | the record, branch strategy, comparison and proof mechanism: the consumer; a policy of this member: the four items the release basis names (watched source, observation boundary, inclusion policy, successor candidate) | 1, 9 |

The standing of these consequences is stated in
[FOUNDATIONS §3 Foundation to law](../FOUNDATIONS.md#foundation-to-law).
The table accounts for §1 to §9 and for FOUNDATIONS §2 Product lineage
objects. §10 records open questions and decides nothing.


Source: TICKETS.md#foundation-to-law-work-carriers sha256=5f7e4cb0785a27b9e6dda1fd91044e775183b6a0e6e80b33811e54665b144b57 rows=1/11 selected by the anchors this frame carries; the consumers paragraph of 11 items is omitted

### Foundation to law: work carriers

This family (F13 in the index of
[FOUNDATIONS §3 Foundation to law](../FOUNDATIONS.md#foundation-to-law))
decides which record carries a piece of work, what that record may claim
and when the work closes. Its instance premises, which the commitments do
not supply, are named in the rows as follows: lifetimes, work and its
obligations last one run, one bounded batch or longer; several surfaces,
goals, tickets, comments, boards and summaries can each appear to state
the same work state; several tenants, one work item may be realised in
more than one build tenant; migrations, some work replaces one
authoritative truth path with another across producers, consumers and
proofs; carriers vary, a project may keep its carriers in files, trackers
or services. Each commitment's standing is written as the table of
commitments in FOUNDATIONS §3 states it.

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|
| P6 (independent); P5 (derived from P0 and P6, with P0's open-world premise); P2 (independent); P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable) | By P5 a claim is satisfied only by valid evidence for each obligation, under the conjunction of FOUNDATIONS §4, so a work claim is complete only when every applicable obligation is satisfied and no non-closure condition remains. By P6 review evaluates and does not decide, so its occurrence is not the closing event; by P6 a test's expected result needs work authority, so it comes from admitted work authority, never from the implementation. | §7 [Condition-based closure and reuse](../TICKETS.md#condition-based-closure-and-reuse), [Test case authority](../TICKETS.md#test-case-authority) | the five-step reconciliation order: this member. The conjunction and the general test law are [FOUNDATIONS §4](../FOUNDATIONS.md#conjunction-of-results) and [ASSURANCE §3](../ASSURANCE.md#3-test-authority), not choices | 3, 9 |

The standing of these consequences is stated in
[FOUNDATIONS §3 Foundation to law](../FOUNDATIONS.md#foundation-to-law).
The table accounts for §1 to §9, and for POSTING_GUIDE §2, §7 and §9,
which have no family table of their own.

