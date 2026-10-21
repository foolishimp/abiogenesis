# Reference frame stale-summary

Task: Resume interrupted work as a new session from a retained summary that disagrees with the current workspace: keep or correct each summary line, give results for migration, review, batch completion and hand-off predicates, say which retained work survives a changed dependency, and give the next action within the grant and what waits.

Purpose: The owning sections for transitions, context construction with acquisition, construction availability, effects, work state, resumption and the workspace as truth surface against an actor's account, closed results and reuse, review-verdict traceability, recorded judgment continuity, condition-based closure and reuse, one-truth state projection, and the core result algebra with its conjunction.

Binds:

- This task binds the construction relation: A is the exact subject and basis the activation binds, Z is the task's required outcome with the acceptance conditions the task states, and the actor's claims keep preservation, progress and outcome satisfaction distinct; a judgment its evidence cannot decide is `indeterminate`, and work it cannot finish is reported as unresolved work, not as a judgment ([../ACTIVATION.md#construction-relation](../ACTIVATION.md#construction-relation); member sha256=7ad7b69b5ad8ec20678b3ef866a26fb328f2fa6f60c4d1d06ca0b926845b89bf; section sha256=6b6c2ce91c5a7e4be765af2f8009252fa8918719e1d885af6b5810ba4eb699da)
- An evaluation this task returns binds the assurance relations: the source obligation, the claimed predicate and its scope, the observation basis, the exact subject and its material dependencies; a pass is an observation until the oracle's fidelity is established ([../FOUNDATIONS.md#assurance-relations](../FOUNDATIONS.md#assurance-relations); member sha256=3e85b8d01360dfae6758566fd3aca309c977e7d9e15cdd2f9e8f2904f18f2545; section sha256=a7d5fc5930338c3fb3959017f41935ce742fbb1bf189c2f527dde4e0ba12d064 spanning to #formal-representation)
- A reuse decision in this task acquires the change and the evidence-validity conditions that support applicability: the impact cover of the change, the dependencies of each retained result and its retention conditions ([../FOUNDATIONS.md#change-impact-and-evidence-reuse](../FOUNDATIONS.md#change-impact-and-evidence-reuse); member sha256=3e85b8d01360dfae6758566fd3aca309c977e7d9e15cdd2f9e8f2904f18f2545; section sha256=e989bf4b8c0dd996e5545f18db94f8ba275d14485697c0b046429746ed3bfbc6)

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

1. [ACTIVATION.md#transitions](../ACTIVATION.md#transitions)
2. [ACTIVATION.md#2-context-construction-under-an-envelope](../ACTIVATION.md#2-context-construction-under-an-envelope)
3. [ACTIVATION.md#construction-availability](../ACTIVATION.md#construction-availability)
4. [ACTIVATION.md#effects](../ACTIVATION.md#effects)
5. [ACTIVATION.md#5-work-state-and-restart](../ACTIVATION.md#5-work-state-and-restart)
6. [ACTIVATION.md#7-closed-result-and-reuse](../ACTIVATION.md#7-closed-result-and-reuse)
7. [TICKETS.md#execution-and-verification-authority-separation-up-007](../TICKETS.md#execution-and-verification-authority-separation-up-007)
8. [TICKETS.md#recorded-judgment-and-owner-ruling-continuity](../TICKETS.md#recorded-judgment-and-owner-ruling-continuity)
9. [TICKETS.md#condition-based-closure-and-reuse](../TICKETS.md#condition-based-closure-and-reuse)
10. [TICKETS.md#one-truth-state-projection-and-drift-refusal-up-009](../TICKETS.md#one-truth-state-projection-and-drift-refusal-up-009)
11. [FOUNDATIONS.md#results](../FOUNDATIONS.md#results)
12. [FOUNDATIONS.md#conjunction-of-results](../FOUNDATIONS.md#conjunction-of-results)
13. [TICKETS.md#foundation-to-law-work-carriers](../TICKETS.md#foundation-to-law-work-carriers)

Size of this frame: 94394 bytes.

Source: ACTIVATION.md#transitions sha256=7ad7b69b5ad8ec20678b3ef866a26fb328f2fa6f60c4d1d06ca0b926845b89bf

### Transitions

Construction moves work from a current state towards a destination
(P0, P2). The current state is the material state of the workspace and
its authoritative inputs, together with what is justifiably known about
that state, with the unknowns explicit. The work state of §5 records it:
the workspace, the governing basis, and the closed results and judgments
that still apply, with the residuals and the uncertainty over external
effects as the explicit unknowns. An actor's context is an account of the
current state, not the state itself
([§5](../ACTIVATION.md#the-workspace-and-an-actors-account)) (P3, P5).

The destination is defined by constraints: the selected outcome with its
acceptance conditions (Outcome U, [FOUNDATIONS §2](../FOUNDATIONS.md#2-ontology))
and the governing obligations the work must keep. It names no single
state: its acceptance conditions admit several realised states. Its
owning authority defines it (P2, P6).

A transition is a bounded change from the current state to a next state,
carried out by one step. Where the work exceeds one activation's capacity,
the outer transformation towards the destination is refined into a series
of bounded transitions under §4 Refinement, each carried out by its own
step; work that fits one activation is a single transition. Each
transition binds the obligations it must preserve: the outer obligations
of the destination and of the governing relations it affects, as far as
they apply to it. A step's intake binds the current state, the
destination and the obligations: the governed outcome names the
destination, or the prerequisite towards it, that the step serves; the
exact subject and basis identify the current state it starts from; and
the affected relation set with its governing invariants holds the
obligations it preserves (Intake below; P0, P4a).
Transitions compose only as §4 Refinement permits.

Discovery. Construction, observation and evaluation change the current
state and what is known about it. A new observation may add obligations,
which join the known work, or invalidate a claim, which is re-established
or withdrawn before anything relies on it (§7). Discovery can enlarge the
known work while knowledge improves (P5, P4b).

Open work outside attention. An obligation outside a frame's current
attention stays open. A bounded view disposes of none of the work it
excludes, and the next decision keeps its material dependencies on that
work (P4b, P6).

Destination change. An authorised change may revise the destination. The
change follows its owning authority and re-enters at the owning relation
(§4). A revised destination does not establish that the previous
destination was reached, and a candidate that satisfies the revised
destination is no evidence that it satisfies the previous one (P2, P6).

Completion. Work is complete only when sufficient evidence shows that the
current state satisfies the applicable destination and its acceptance
conditions; accepting that claim is the decision owner's disposition
(§3 Disposition). An empty list of known work, a count of closed or
remaining items, or the absence of a recorded counterexample does not
establish completion (P6;
[RF-015](../REFERENCE_FRAME.md#rf-015-residual-uncertainty)).

Stops. Work that cannot continue ends in an explicit stop that names its
cause: a step that cannot deliver its output stops with a value of
construction availability other than `candidate_ready`, and a declared
ambiguity that halts the work or exceeds the step's authority stops it
with `blocked` or `escalated` (§3). A refused admission or activation
stops the work without creating a step (§3 Admission and activation).
The work state (§5) retains the unresolved outcome, the residuals and the
obligations still owed. A stop reaches no destination and discards none
of these (P4b, P5).

Progress. Progress is judged against the selected outcome and the
evidence for it, as §5 defines progress, not by the number of remaining
items alone: discovery
can raise that number while the work moves towards the destination (P2).

Purpose and material relation: finite context and attention (P0) mean
that an outcome beyond one activation is reached through bounded steps.
Binding the destination and the preserved obligations at each transition
keeps the outer contract through that decomposition. Keeping completion,
destination change and stops apart prevents a count, an exhausted list or
a revised destination from standing in for evidence that the applicable
destination is satisfied (P2, P6). The state, the destination and the
obligations are those that the intake and the work state already bind; no
further carrier is required. 


Source: ACTIVATION.md#2-context-construction-under-an-envelope sha256=7ad7b69b5ad8ec20678b3ef866a26fb328f2fa6f60c4d1d06ca0b926845b89bf

## 2. Context construction under an envelope

Given a seed set Z (the subject, outcome and affected relations named in the
intake), a relation family R (the dependency relations whose change can
alter the result, basis validity, evidence sufficiency or authority), and
the actor's envelope B:

1. Compute the material closure of Z under R (AC-010,
   [AXIOMATIC_CALCULUS §4](../AXIOMATIC_CALCULUS.md#ac-010-material-closure)).
   If Z, R, the required-edge semantics, the basis or the scope is not
   exact, or the closure is not finite and unique on the exact basis,
   activation returns `closure_unresolved` (§3, Admission and activation)
   and no step proceeds; it does not guess.
2. Project the closure to the selected context, recording its boundary: the
   excluded, external, unresolved, translated and invalidation-sensitive
   seams (AC-011,
   [AXIOMATIC_CALCULUS §4](../AXIOMATIC_CALCULUS.md#ac-011-projection)).
   If the projection returns a gap or refusal, activation returns
   `closure_unresolved` and no step proceeds.
   Material not in the closure stays out; adjacent material does not enter
   because it exists
   ([RF-004](../REFERENCE_FRAME.md#rf-004-irrelevance-exclusion)).
3. Test fit against B. This step owns the size measurement and the fit
   test for the context dimension. Where B declares a context capacity,
   the size of the selected context is measured before the actor reads it,
   in the unit the capacity is declared in (bytes or tokens) and over the
   boundary that the selected execution binding states for it (§6), and is
   compared with that capacity. The measurement, the capacity and the
   outcome of the comparison are recorded before the read. A fit holds
   only for the measured boundary: context outside it is recorded as not
   measured, and no fit claim covers it. The fit claim for a measured
   boundary and the step's fit judgment are distinct: the judgment is
   established from the recorded complete active inputs, or from a
   supported upper bound that includes any host-supplied context; where
   neither exists it is `indeterminate`, unless a counterexample, such as
   a measured excess, establishes `falsified`. A correct task result keeps
   its own bounded standing and does not satisfy a missing fit judgment
   (P0, P5). The measurement applies wherever B declares a
   context capacity, whatever question the step governs, because without
   it a fit claim against that capacity is an assertion, and a context
   that exceeds it would be cut without record
   ([RF-014](../REFERENCE_FRAME.md#rf-014-capability-fit)). It applies only
   there, because a resource control applies only through a selected frame
   and its owning scope
   ([REFERENCE_FRAME §4](../REFERENCE_FRAME.md#frame-set-selection)), and a
   declared capacity is such a control: the measurement tests that
   capacity, is no budget, and is not a universal measurement gate (P0,
   P2). Where B declares no context capacity, no measurement is
   required, and the other conditions of
   [RF-002](../REFERENCE_FRAME.md#rf-002-finite-attention) still apply. The size
   shows fit and nothing else: whether the actor attends adequately to a
   context that fits is decided by actual-use evidence under
   [EVALUATION §7](../EVALUATION.md#frame-qualification). The envelope's
   other dimensions are fitted as RF-014 states; time, spend and other
   resource limits follow [§6 Resource limits](../ACTIVATION.md#resource-limits), which
   this step refines for the context dimension.
   If the context fits, activate. If it does not, one or more of these, in
   combination: refine the outer contract into steps whose contexts fit
   (§4); sequence activations; apply a lawful compression that preserves the material
   distinctions and failure detections the evaluation needs
   ([RF-017](../REFERENCE_FRAME.md#rf-017-proportional-compression));
   select another actor whose envelope fits; or return `out_of_frame`
   ([§3 Admission and activation](../ACTIVATION.md#admission-and-activation)). Silent
   omission to fit is never one of them
   ([RF-014](../REFERENCE_FRAME.md#rf-014-capability-fit)).
   None of these options silently reduces the required predicate: the
   obligations the step preserves stay bound
   ([§1 Transitions](../ACTIVATION.md#transitions)), a narrowing of them is a destination
   change under its owning authority (§1, Destination change), and what
   the selected context leaves undecided stays an explicit unknown.
   Within its grant a step selects refinement, sequencing and compression
   itself; selecting another actor or enlarging the envelope re-enters the
   owner of the grant or envelope, who may delegate that choice in the grant
   (RF-014 vests the selection in human authority; a grant is that authority
   exercised in advance). Whether a compression preserved what the
   evaluation needs is a claim with the standing of any other (EVALUATION
   §1): the compressing step records the compression and its preservation
   argument, and the claim is assessed independently only where the
   promotion it serves needs independent assessment (EVALUATION §3).
4. Acquire declared inputs by their exact identity. A declared input absent
   from the actor's materialised view is neither licence to read elsewhere
   nor evidence that it is absent.

Acquisition. Acquisition is the read-only observation of the material a
step needs (its frame, its subject and its declared inputs) within the
inputs its intake permits it to acquire (§1 Intake). It is not an admission and not a further
actor stage; effectful work still needs its admitted contract (§1
Admission), and acquiring material grants no role, operation or decision
([FOUNDATIONS §2 Authority kinds](../FOUNDATIONS.md#authority-kinds), What
creates no authority). A derived surface is material derived from owning
sources by copying, projection or compression, such as a projected frame
for a task; it names its sources and owns no determination. Where a
current interpretation of the subject in `a_c` exists, the constraint
surface it yields for the task is such a derived surface, under the
conditions of
[AXIOMATIC_CALCULUS §9 Constraint surfaces](../AXIOMATIC_CALCULUS.md#constraint-surfaces).
Where a derived surface whose sources
are current serves the task, the actor acquires it. For another task, or
where the derived surface is stale ([Staleness of derived surfaces](../ACTIVATION.md#staleness-of-derived-surfaces)),
missing or insufficient for a named unresolved question, the actor acquires the deciding owner sections
directly: the owning sections that decide the task's questions, which are
declared inputs of the selected basis. Only material in the exact selected
basis is acquired: where that basis has no derived surface for the task,
its exact owner sections are used, and a candidate source, a version-line
selector or another basis is no substitute for it
([FOUNDATIONS §2 Product lineage objects](../FOUNDATIONS.md#product-lineage-objects)).
The actor reads the selected material and the actual subject, and follows
the material source and coupled-obligation references the task needs
(step 2; [RF-003](../REFERENCE_FRAME.md#rf-003-material-sufficiency));
presence of the corpus is no reason to read it (step 2;
[RF-004](../REFERENCE_FRAME.md#rf-004-irrelevance-exclusion)). No frame,
derived surface or acquisition carries a universal sufficiency claim:
sufficiency is decided for the named question against the task's
material relations, never for the corpus or the frame as a whole
([RF-003](../REFERENCE_FRAME.md#rf-003-material-sufficiency)). Before any dependent action, a missing binding is returned with
its outcome of [§3 Admission and activation](../ACTIVATION.md#admission-and-activation),
naming what is missing: where no available frame declares what the
evaluation needs, `out_of_frame`; where the basis the step requires is
absent, or cannot be verified as the exact basis named, the basis cannot
support the step, and the outcome is `admission_refused(basis)` at
admission or `activation_refusal(basis)` at activation. Coupled material that does not fit is handled under
step 3 (P0, P6, P3).

Activation. The actor or the assigning authority selects one frame or one
declared active frame configuration capable of the evaluation. Activation
binds each reusable frame declaration to the exact subject and basis and
loads the declared material relations and evidence sources, never an
undifferentiated workspace dump; what the actor receives is the packet of
REFERENCE_FRAME §11. When no available frame and actor pairing can lawfully
perform the evaluation, activation returns `out_of_frame` where no such
pairing declares a material relation or capability the evaluation needs,
and otherwise the `activation_refusal` whose cause holds
([REFERENCE_FRAME §5](../REFERENCE_FRAME.md#5-method-functions)); both are
outcomes of §3 Admission and activation. Work does not proceed through
implied context (P0, P5).

Evaluation. The evaluator applies the activated frame's declared
invariants, evidence rules and result algebra. It distinguishes semantic
law, observed evidence, inference and decision, and records every
assumption whose failure could change the result (P6).

Standalone scope. A derived surface or projected frame decides standalone
only the questions that its own source members own. It refuses to close a
question owned by another member, or one that joins the law of several
owners; the evaluation of that question returns `out_of_frame`
([FOUNDATIONS §4 Results](../FOUNDATIONS.md#results)) naming the owning
members, and
the question is decided from those members at their current digests or
from a derived surface whose declared sources include every owner of it
(P6, P1).

Prompt construction. A prompt is rendered contract over typed authority;
it is not source law. Prompt text must project the current authority
references, obligations, contracts, boundaries, proof expectations and
fallback conditions the step needs. A prompt body must not carry
historical workaround prose unless the current requirement, design,
runtime or test still needs that constraint. Construction starts from the
highest live authority surface the question needs. If the prompt needs an
upstream ambiguity resolved, it names the unresolved authority gap before
fallback context is read. The prompt projects the material that
Acquisition above selects, including the raw owning members where
Acquisition falls back to them (P6, P0, P5). The design, ODD, UX and ticket
specialisations are
[DESIGN_MODULE §11](../DESIGN_MODULE.md#11-review),
[ODD §11.5D](../ODD.md#115d-constructive-evaluation-and-yield-loop) A5 and
[§11.7A](../ODD.md#117a-conforming-agentic-development),
[UX §7](../UX.md#7-carrier-binding) and
[TICKETS §5](../TICKETS.md#5-from-carrier-to-execution) and
[§7](../TICKETS.md#7-authority-judgment-closure-and-state) (P6).

The operation that joins AC-010, AC-011 and RF-002, RF-003, RF-004,
RF-014 and RF-017 into one procedure is stated here (P0); each of
those laws is applied here from its owning section in
[AXIOMATIC_CALCULUS §4](../AXIOMATIC_CALCULUS.md#ac-010-material-closure) and
[REFERENCE_FRAME §3](../REFERENCE_FRAME.md#3-laws). The method does not require proving
that no undiscovered material relation exists
([RF-003](../REFERENCE_FRAME.md#rf-003-material-sufficiency)).
The size measurement of step 3 applies under its stated condition.
Purpose and material relation of that measurement and Acquisition:
finite context makes fit necessary (P0), so a fit against a declared
capacity is measured rather than asserted, while fit and attention stay
separate claims (P6); and an actor without a derived surface for its task
still reaches the sections that decide it, from the exact basis, without
reading the corpus or substituting a stale or mutable copy (P3, P6). The
material relation is whether a context larger than the declared capacity
is read as if it fit, a fit is taken as adequate attention, or a decision
rests on material other than its deciding owners at the selected basis.

### Staleness of derived surfaces

This subsection owns when a derived surface (Acquisition above) is current
and when it is stale, for any method and any carrier (P3, P5, P6):

- A derived surface names the exact identity, such as the path and
  digest, of each source it was derived from and of each source whose
  change can change its content.
- It is current for a selected basis only while every source identity it
  names equals the identity of that source in the selected basis. A change
  to any of them makes it stale.
- A stale derived surface is not used as current for any question. It
  becomes current again only by regeneration from the sources at the
  selected basis, or by an explicit re-acceptance that records the new
  source identities and the finding that its content still matches them;
  until then the actor acquires the deciding owner sections directly
  (Acquisition above).
- Matching source identities establish only that the surface was derived
  from those sources. They establish neither its fidelity to them nor its
  sufficiency for a question; a surface found insufficient for a named
  question is handled as Acquisition above states.
- The owning sections at the selected basis remain the deciding source.
  Whether a current surface is insufficient for a question, or decides
  beyond its own sources, is judged against them (Standalone scope above);
  a derived surface never decides that about itself.

A packaging or installation carrier refines this rule with its own
identities and re-acceptance procedure, and names this subsection as its
owner; [PRODUCT_DEFINITION §11](../PRODUCT_DEFINITION.md#11-one-constitutional-surface-and-version-boundary)
does so for the method's released carriers. Purpose and material relation: an actor that relies on a
derived surface after one of its sources has changed decides from material
that no longer matches its owners, and a matching digest read as fidelity
would let a faithful-looking but wrong surface decide; the material
relation is whether a decision rests on a surface whose sources are not
those of the selected basis. This rule applies to derived surfaces under every selected carrier.


Source: ACTIVATION.md#construction-availability sha256=7ad7b69b5ad8ec20678b3ef866a26fb328f2fa6f60c4d1d06ca0b926845b89bf

### Construction availability

A step's output is a candidate until evaluated (FOUNDATIONS §3, P0): the
constructed subject of a constructing step, or the closed results of an
assessing step. Construction availability records whether that output
exists (P5, P6):

| Value | Core value | Ground |
|---|---|---|
| `candidate_ready` | satisfied | an exact candidate and its transition evidence are available |
| `refused` | falsified | lawful activation occurred, and a governing prohibition or an owner-valid construction refusal defeats the requested construction; the prohibition or refusal is the counterexample |
| `incomplete` | falsified | the lawfully activated step stopped without its output, because an evaluation the output needs was not performed or could not be decided on the admissible evidence, or bounded execution ended first; the stop basis is the counterexample, and it and the residuals name which |
| `re_entry_requested(authority)` | out_of_frame | a material decision the step needs lies outside its grant; the value names the owner of that decision |
| `re_entry_requested(basis)` | invalid_basis | the activated basis can no longer support the work |

The mapping is total and exclusive after lawful activation: the cause of
the stop selects the value, and payload wording, stop timing or actor
preference cannot select another. A mismatch known during admission or
activation is no value of this refinement, because no step exists; it
takes its outcome under Admission and activation above.

`satisfied` here establishes availability only and never counts toward the
candidate's fitness or acceptance (FOUNDATIONS §4 Results).

`incomplete` maps to `falsified` only for "a candidate is available", never
to `indeterminate`. The step's evaluations keep their own results: each
evaluation it performed returns its core value, `indeterminate` where the
admissible evidence could not decide; each evaluation it planned and did
not perform has no result, and its work state (§5) carries it as a
residual with the capability or the execution left unfinished
(FOUNDATIONS §4 Results, the third case of the boundary). An evaluation
not performed thus stays distinct from one whose evidence cannot decide
(P5, P6).

An assessing step that ends `incomplete` leaves each criterion it did not
evaluate not performed: no result, never `falsified`. The `falsified` of its
availability concerns its own output, never the subject under assessment
(P6).

The cause of a re-entry request is part of its value, because a re-entry
request without its cause would map to `out_of_frame` or to
`invalid_basis` according to that cause, and a refined value maps to
exactly one core value (FOUNDATIONS §4 Results, Refinements). A stop
with both causes records both and takes `re_entry_requested(basis)`,
because a decision cannot be taken on a basis that cannot support it (P5,
P3).


Source: ACTIVATION.md#effects sha256=7ad7b69b5ad8ec20678b3ef866a26fb328f2fa6f60c4d1d06ca0b926845b89bf

### Effects

An effectful step's intended external effect has one of three values,
mapped for the predicate "the intended effect occurred", that is, the
declared outcome of the effect is attained. The value turns on what the
admitted evidence establishes about that outcome (P5 with the open-world
premise, P6):

| Value | Core value | Ground |
|---|---|---|
| `completed` | satisfied | evidence about the subject establishes that the intended effect occurred in full and that the effect has ended |
| `not_effected` | falsified | evidence about the subject establishes that the declared outcome is not attained and that no later completion of the effect can attain it, for example where no effect began, the effect ended short, an interval that the declared outcome bounds has closed with part of it not done, or the part already done has itself made the declared outcome unattainable, as when it destroyed what the outcome needed; any part that did occur is named with the value |
| `completion_unknown` | indeterminate | neither of the other values is established: the evidence cannot decide whether the intended effect has occurred or will occur, as for a request whose response was lost with no counterexample observed; or the evidence shows the intended effect in full while the effect may still be acting, and the outcome stays undecided until what the effect leaves on the subject is settled; its residual names the observation that would decide |

`not_effected` requires evidence about the subject. A lost response, an
absent record, or an actor's context that holds no trace of the effect is
not that evidence, and the value stays `completion_unknown`.
`completion_unknown` never maps to `completed` or to `not_effected`.

Whether the effect has ended is a second question beside the predicate
above, and it enters the value only as a conjunct of `completed`. An
effect has ended where evidence about the subject establishes
that it no longer acts on the subject or that it never began. Where an
effect began and the evidence does not establish its end, the end is not
established, and that is recorded beside the value as a residual naming
the observation that would establish it. The end never decides a
`not_effected` value and is never folded into one: when an interval that
the declared outcome bounds has closed with part not done, the value is
`not_effected` while the effect may still be acting. The residual does
not weaken the counterexample, and the counterexample does not resolve
the residual. `completed` alone requires the end established, so a
counterexample stands without proof that the effect has ended, while
success is never claimed for an effect that may still be acting
([FOUNDATIONS §4 Results](../FOUNDATIONS.md#results), Standing).

An effect of uncertain completion is one whose value is
`completion_unknown`, or whose value is `not_effected` with its end not
established. §5 reconciles it, sufficiently for the next dependent
action, before any repetition or dependent action. A `not_effected`
value licenses neither treating the effect as absent nor repeating it
while its end is not established.

The refinement's material relation is whether an action whose
external effect may have occurred is repeated or relied on; §4 names a
lost post-effect response as a case that no added core value solves, and
this refinement records it in the existing core. Keeping the end of the
effect beside the value keeps two facts that one value would merge: a
counterexample already established for the declared outcome, and an
effect that may still be acting.


Source: ACTIVATION.md#5-work-state-and-restart sha256=7ad7b69b5ad8ec20678b3ef866a26fb328f2fa6f60c4d1d06ca0b926845b89bf

## 5. Work state and restart

Work state is the tuple of: the current persistent workspace; the governing
basis; the applicable closed results and judgments with their invalidators;
the residuals; and the known uncertainty over external effects. It is an
object (P3); its carrier (files, an event stream, another admitted owner) is
a profile or realisation choice. Resumption, checkpointing and the
progress account of this section are generic procedures
([SPEC_METHOD §11](../SPEC_METHOD.md#11-build-tenant-binding)): they require
no particular carrier (P1, P6).

Resumption is re-entry of the same method over the current work state,
starting from the current material state, by a possibly different actor.
It recovers applicable progress, re-checks the invalidators of each reused
result (§7), reopens only affected support, and reconciles uncertain
external effects, sufficiently for the next dependent action, before any
repetition or dependent action. Resumption does not imply idempotence: an
action whose external effect may have occurred is not repeated blindly;
the lawful next moves are reconciliation, yield or stop.

Checkpoint. Acceptance binds one exact checkpoint. The next
already-authorised bounded action may begin without renewed human approval;
acceptance does not widen the selected outcome or the affected relation set
(P6, P2). A preservation checkpoint may retain unfinished or unaccepted
work under an existing exact operation grant; it identifies its parent or
predecessor, the included territory, the concurrent-writer disposition and
the durable evidence location, and it is neither acceptance, promotion nor
publication. A proposed restart, which reconstructs from less than the
retained work, identifies why repair of retained work is insufficient,
which obligations and evidence survive, and which causal assumptions
change; reconstructability alone does not select reconstruction. The work state and reconciliation
of uncertain effects preserve the retained progress and unresolved obligations
(P0, P5 with the open-world premise).

Progress is accepted material movement toward the selected outcome;
prerequisite work names the obligation it enables; preservation and
repeated proof are evidence, not new progress; rejected or superseded
construction is churn; discovering previously hidden distance revises the
forecast and is not negative progress. Paperwork, code volume, test count,
commit count and review count are not progress by themselves. These are
semantic categories, not a numeric progress algorithm; a consumer may
derive its own progress and churn projections from them (P2). A member,
profile or project that distinguishes finer categories for its own
outcome states them as a refinement of these, naming this paragraph and
mapping each of its categories to one of progress, prerequisite work,
evidence that is not new progress, churn or forecast revision; a category
it cannot map is a change to this owner, not a parallel category (P2, P6).

The execution protocol of §1, §3 and this section is false if execution
proceeds from unreconstructable context; if a constructor's report
substitutes for required independent live evidence; if a bounded proxy
changes a governing relation outside its delegation; if unrelated
incompleteness blocks a closed causal cone; if a same-process test is used
to prove materially cross-process authority (§7); or if rejected activity
is reported as accepted progress.

Foundation to law. This family, work state, resumption and reuse, covers
this section and §7. Its instance premises are: (a) a workspace that
persists across activations; (b) work that spans activations; (c) actors
that may change between activations; (d) external effects in an open
world. They are conditions of the work this family governs, not
commitments, and do not follow from finite capacity alone. The standing of
the consequences below is stated in
[FOUNDATIONS §3 Foundation to law](../FOUNDATIONS.md#foundation-to-law).

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|
| P3 (independent), P0 (recovered); instance premises a, b | By P3 work state binds an exact basis, and by P0 an actor holds only part of it at a time, so work state is an object: the workspace, the governing basis, the applicable closed results and judgments, the residuals and the uncertainty over external effects | [§5](../ACTIVATION.md#5-work-state-and-restart), first paragraph | its carrier (files, an event stream, another admitted owner): the profile or realisation | 2, 5 |
| P0 (recovered), P3 (independent), P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable), P6 (independent); instance premises a, c | By P0 an actor's context is bounded and disposable, by P3 the workspace binds the exact state, and by P4b recorded facts persist where the context does not, so the workspace is the truth surface and an actor's context a disposable account of it; current evidence corrects the account; discarding the account resets nothing | [The workspace and an actor's account](../ACTIVATION.md#the-workspace-and-an-actors-account) | the observations and reconciliations a resumption needs: the recovery contract, which is the resuming step's intake with the work state | 6, 9 |
| P5 (derived from P0 and P6, with P0's open-world premise), P6 (independent); instance premise d | By P5 an effect of uncertain completion is undecided, and by P6 repeating an effect needs evidence that it is safe, so an effect of uncertain completion is reconciled before any repetition or dependent action; resumption does not imply idempotence | [§5](../ACTIVATION.md#5-work-state-and-restart) Resumption; [§3 Effects](../ACTIVATION.md#effects) | none | 4, 5 |
| P2 (independent), P6 (independent); instance premise b | By P2 progress is movement toward the selected outcome, and by P6 acceptance binds what was evaluated, so acceptance binds one exact checkpoint; a restart states why repair of retained work is insufficient; progress is accepted movement towards the selected outcome, not a count; finer progress categories refine these with a map | [§5](../ACTIVATION.md#5-work-state-and-restart) Checkpoint and Progress | progress and churn projections: their consumer | 5 |
| P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable), P0 (recovered), P6 (independent); instance premise c | By P4b and P0 private working context does not survive the actor, and by P6 a reused judgment is not a new independent one, so handoff is by closed results without private working context; reuse checks exact applicability and three invalidators, a material input change (newly acquired material evidence included), a changed basis and a declared revising observation, and a domain trigger is an instance of one of them; a reused judgment does not satisfy a required independent judgment | [§7](../ACTIVATION.md#7-closed-result-and-reuse) | the revising observation a result declares, and its other invalidation conditions: the producer of that result | 7, 9 |
| P5 (derived from P0 and P6, with P0's open-world premise), P6 (independent); instance premise c | By P5 a transition's outcome is undecided without its evidence, and by P6 a proof establishes only the authority it was produced under, so a reviewable transition names its exact candidate, changes, proof and disposition; a same-process proof does not establish a reconstructable authority claim where the loss of process state is a counterexample | [Transition evidence](../ACTIVATION.md#transition-evidence) | the representation of transition evidence: its consumer | 9 |

Consumers of these rows, where an actor enters them (FOUNDATIONS §3
Foundation to law, Consumers), one list per row, each consumer linked to
its own locus:

- Row 1, work state as an object: [§1 Transitions](../ACTIVATION.md#transitions), where the current state is the work state this section records; [FOUNDATIONS §4 Results](../FOUNDATIONS.md#results), Not performed, and [Assertions and observation](../FOUNDATIONS.md#assertions-and-observation), where unresolved work and an unexercised capability are a state of the work, carried as a residual and not a result; [WORLD_MODEL §14](../WORLD_MODEL.md#14-results-of-this-profile), where a step's work state carries an unrun verification as a residual; [REFERENCE_FRAME §10 Revision actions](../REFERENCE_FRAME.md#revision-actions), where results reopened without a material revision are recorded in the work state; [UX §8 Msg-replay proof](../UX.md#msg-replay-proof), whose Msg log is the surface's recorded work state, and the [UX family table](../UX.md#foundation-to-law), whose row for continuation and replay imports F4; the [ODD family table](../ODD.md#foundation-to-law), whose rows for the immutable ledger and for yield import F4 for a replay-visible work state.
- Row 2, the workspace and an actor's account: [§1 Transitions](../ACTIVATION.md#transitions), where an actor's context is an account of the current state and not the state itself; [EXECUTIVE_BASELINE §20](../EXECUTIVE_BASELINE.md#20-failure-classification), where a compression, summary or prior result that replaces current source authority is evidence substitution and a retained account never overrules current evidence; [UX §8 Msg-replay proof](../UX.md#msg-replay-proof), where replay is resumption from the recorded work state; [CONFORMANCE §4](../CONFORMANCE.md#4-cases-for-method-discriminators), case CD-03, and [§5](../CONFORMANCE.md#5-discriminator-coverage), discriminators 38 and 39.
- Row 3, resumption and effects of uncertain completion: [§1 Construction relation](../ACTIVATION.md#construction-relation), Control, where resumption reacquires current reality and unknown effects are resolved before the next dependent action; [EXECUTIVE_BASELINE §12 step 4](../EXECUTIVE_BASELINE.md#4-executive-evaluates-the-work-result), [§7 The executive configuration](../EXECUTIVE_BASELINE.md#the-executive-configuration), failure assumptions, and [§13 Handoff projection](../EXECUTIVE_BASELINE.md#13-handoff-projection), whose work result names each intended effect with its value, and the [EXECUTIVE_BASELINE family table](../EXECUTIVE_BASELINE.md#foundation-to-law), whose row for the effect field imports F4 for the reconciliation; [PRODUCT_DEFINITION §4 Explicit complete consumer update](../PRODUCT_DEFINITION.md#explicit-complete-consumer-update), where an update of uncertain completion is reconciled from the presented preimages before any repetition; [SPEC_METHOD §4 Computed classification and treatment](../SPEC_METHOD.md#computed-classification-and-treatment), where a retry waits on that reconciliation; [TRAVERSAL_OCCURRENCE Closed constraint, judgment, residual and stop kinds](../TRAVERSAL_OCCURRENCE.md#closed-constraint-judgment-residual-and-stop-kinds) and [Mutable-subject effect relation](../TRAVERSAL_OCCURRENCE.md#mutable-subject-effect-relation), where an effect whose end is not established is reconciled before any repetition; [FOUNDATIONS §4 Change impact and evidence reuse](../FOUNDATIONS.md#change-impact-and-evidence-reuse), where recovery reacquires current reality and need not erase valid work; [CONFORMANCE §4](../CONFORMANCE.md#4-cases-for-method-discriminators), case CD-03, and [§5](../CONFORMANCE.md#5-discriminator-coverage), discriminators 38 and 39.
- Row 4, checkpoint and progress: [SPEC_METHOD §3](../SPEC_METHOD.md#3-outcome-conservation), whose four kinds of evidence refine the progress categories for a product outcome, and [§8](../SPEC_METHOD.md#8-bounded-execution-in-this-method), where construction ends at the exact accepted checkpoint and the next already-authorised bounded action; [EXECUTIVE_BASELINE §14](../EXECUTIVE_BASELINE.md#14-coverage-application), where checkpoint and continuation are the Executive's under existing authority; [CONFORMANCE §1](../CONFORMANCE.md#1-counterexample-cases), case C-03, where a restart proposal states why repair of retained work is insufficient.
- Row 5, closed result and reuse: [§6](../ACTIVATION.md#6-cost-and-proportionality), the method's own execution, where reuse stays subject to exact applicability and invalidation; [REFERENCE_FRAME §5 Method functions](../REFERENCE_FRAME.md#5-method-functions), [§8 Coverage basis](../REFERENCE_FRAME.md#coverage-basis) and [§10 Revision actions](../REFERENCE_FRAME.md#revision-actions), where whether a closed result or a coverage result stays valid is decided by the reuse rule; [EVALUATION §2](../EVALUATION.md#2-separation), [§3](../EVALUATION.md#3-independent-assessment), where shared mechanical evidence may be reused and judgment may not, and [§6](../EVALUATION.md#6-conformance-of-realisations), where an accepted relation is reused after checking applicability and invalidation; [SPEC_METHOD §4 Computed classification and treatment](../SPEC_METHOD.md#computed-classification-and-treatment), which applies the rule to computed classification, and [Consistency gate](../SPEC_METHOD.md#consistency-gate); [TICKETS §7 Recorded judgment and owner-ruling continuity](../TICKETS.md#recorded-judgment-and-owner-ruling-continuity) and [Condition-based closure and reuse](../TICKETS.md#condition-based-closure-and-reuse); [EXECUTIVE_BASELINE §3](../EXECUTIVE_BASELINE.md#3-engagement-applicability), [§5 Work result](../EXECUTIVE_BASELINE.md#work-result), [§6 Attention cycle](../EXECUTIVE_BASELINE.md#attention-cycle) and [§13 Handoff projection](../EXECUTIVE_BASELINE.md#13-handoff-projection), specialist result, and the [EXECUTIVE_BASELINE family table](../EXECUTIVE_BASELINE.md#foundation-to-law), whose row for the Product chain imports F4 for the repair that invalidates affected results; [DESIGN_MODULE §5](../DESIGN_MODULE.md#5-ontology-first-design), [Capability and foundation selection (UP-023)](../DESIGN_MODULE.md#capability-and-foundation-selection-up-023), [§7 Gate and retrospective work](../DESIGN_MODULE.md#gate-and-retrospective-work) and [§10 Post-ticket design review](../DESIGN_MODULE.md#post-ticket-design-review), and the [DESIGN_MODULE family table](../DESIGN_MODULE.md#foundation-to-law), whose row for that review imports F4; [ASSURANCE §7 The set](../ASSURANCE.md#the-set), whose invalidation rows name instances of this rule's invalidators, and [§13 Obligations](../ASSURANCE.md#obligations), item 4; [WORLD_MODEL §2 Builder Project specialisation](../WORLD_MODEL.md#builder-project-specialisation), whose invalidation conditions are instances of them; [CONFORMANCE §1](../CONFORMANCE.md#1-counterexample-cases), case C-04, and [§5](../CONFORMANCE.md#5-discriminator-coverage), discriminators 21 and 36.
- Row 6, transition evidence: [TICKETS §7 Execution and verification authority separation (UP-007)](../TICKETS.md#execution-and-verification-authority-separation-up-007), where the reviewable transition is carried by an existing surface and no new ceremony is required; [EXECUTIVE_BASELINE §5 Exact candidate](../EXECUTIVE_BASELINE.md#exact-candidate), [§8 Steel-thread delivery](../EXECUTIVE_BASELINE.md#steel-thread-delivery), for the proof cadence, [§9](../EXECUTIVE_BASELINE.md#9-derived-worker-frame), where `candidate_ready` binds the exact candidate and the transition evidence, [§12 step 5B](../EXECUTIVE_BASELINE.md#5b-candidate-requires-independent-review), [§13 Handoff projection](../EXECUTIVE_BASELINE.md#13-handoff-projection), work result, and [§14](../EXECUTIVE_BASELINE.md#14-coverage-application), where candidate and transition evidence are the Worker's.

Each consumer applies the rule and decides nothing the owning section does
not (P2, P6).

### The workspace and an actor's account

The workspace and its authoritative inputs persist across activations and
are the continuing truth surface of the work: the surface whose current
material state decides what the work has and has not done. An actor's
context is an account of that state. It is bounded, because it is a
projection of the state (§2); revisable, because an observation can
correct it; and disposable, because a step records its closed results and
step-produced facts before it returns (§1 Admission; P4b). An account is
never a second truth surface, and no later activation needs a prior
actor's context: its intake reconstructs the governing relations without
it (§1 Intake) (P0, P3, P6).

Acquisition ([§2](../ACTIVATION.md#2-context-construction-under-an-envelope)) observes the
current subject and its authoritative inputs. Where they materially
disagree with a cached belief, a retained summary or a prior result, the
actor reconciles the disagreement: current evidence corrects the account,
and what the evidence cannot decide stays an explicit unknown. A stored
belief, a summary or a successful prior result never overrules contrary
current evidence. A prior result is relied on only after its
applicability and invalidators are checked against the current subject
and inputs (§7). The actor corrects its account within its grant; where
resolving the disagreement needs an operation, a territory or a decision
outside the grant, the step stops with `re_entry_requested(authority)`,
naming the owner of what it needs (§3 Construction availability) (P5,
P6).

Discarding an actor's private context resets nothing: the workspace, the
applicable valid work and the outstanding obligations remain as the work
state records them. A missing trace in a context, a memory or a summary is
no evidence about the subject. It shows neither that work was not done
nor that an external effect did not occur, nor that it ended; an effect
of uncertain completion keeps the value `completion_unknown`, or its end
stays not established beside its `not_effected` value, until evidence
about the subject decides it (§3 Effects) (P5).

Work that an interruption left partly written is part of the current
material state from which resumption (above) starts, and is assessed as
it stands; an assessment that was not performed has no result and is
never recorded as performed
([FOUNDATIONS §4 Results](../FOUNDATIONS.md#results); §3 Construction
availability). The method imposes no universal reset and no obligation to
replay the complete history. The recovery contract that applies, which is
the resuming step's intake with the work state, determines which
observations and which effect reconciliations the next dependent action
needs. Handoff between actors is by closed results, which carry no private
working context and keep their validity and independence conditions (§7)
(P0, P4b).

Purpose and material relation: finite context (P0) means an actor's
context ends or is replaced while the work continues, and discarding it is
safe only because the step-produced facts the outer contract needs are
recorded (P4b). Treating the account as the truth surface would let a
stale account overrule the workspace; treating a discarded account as a
reset would erase progress or repeat an effect that occurred (P5, P6). The
material relation is whether a decision relies on an account that current
evidence contradicts, or reads a missing record as undone work or an
absent effect.  The workspace, the
work state and the closed results carry it, and no further carrier is
required.


Source: ACTIVATION.md#7-closed-result-and-reuse sha256=7ad7b69b5ad8ec20678b3ef866a26fb328f2fa6f60c4d1d06ca0b926845b89bf

## 7. Closed result and reuse

A closed result identifies the frame and its activation, the subject, the
basis, the evaluation, the actor, the evidence, the verdict, the residual
uncertainty and the invalidation conditions (the minimal shape is
REFERENCE_FRAME §13). The frame's internal working context need not be
transferred when the closed result and its provenance are sufficient for
the consuming decision; it may still be attached, for audit or otherwise,
without changing the result. Independent evaluations may share valid
mechanical evidence under the declared independence conditions of
[EVALUATION §3](../EVALUATION.md#3-independent-assessment), which owns that
permission (P4b, P0).

The selection of affected results after a change and the conditions for
retaining evidence on a new subject are
[FOUNDATIONS §4 Change impact and evidence reuse](../FOUNDATIONS.md#change-impact-and-evidence-reuse);
this section applies them to closed results and handoffs, and the three
invalidators below are kinds of change Δ, and a closed result is affected
when its dependencies `D*(t)` meet the impact cover `I(Δ)` (P3, P6).

A closed result is reused by an unchanged consumer that checks exact
applicability; a role, conversation or resumption change alone invalidates
nothing. An invalidator invalidates the affected result before reliance,
even where the subject's own bytes are unchanged, preserving its
predecessor/successor relation and any demonstrably independent surviving
results. Invalidation withdraws the result from direct reliance; whether
its evidence is retained on the new basis is decided by `retain_applicable`
of FOUNDATIONS §4 Change impact and evidence reuse, and the changed
coordinate alone establishes neither that the claim fails nor that it
holds. The invalidators are three:

- a material input change: a change to the result's subject or to an
  input it rests on, including the admissible evidence that bears on its
  predicate; newly acquired or changed admissible evidence is such a
  change when it is material to the result as
  [FOUNDATIONS §2](../FOUNDATIONS.md#2-ontology) defines material, that is,
  when it could change the result's value;
- a changed basis: a change to any coordinate of the basis the result
  binds (FOUNDATIONS §2, Basis);
- a declared revising observation: an observation that the result or
  judgment itself names as one that would revise it, once it occurs.

A changed source, task or actor condition is a changed basis where the
basis binds it, and otherwise a material input change; a role change that
alters a required actor condition is such a change, while a role,
conversation or resumption change that alters none of these invalidates
nothing (P3, P6).

Judgment continuity names the basis and the evidence; Return A Closed
Result names inputs and the observation. A member, profile or project
that names a trigger for its own domain, such as a changed projection,
rule or configuration, names it as an instance of one of these three and
states no parallel list (P3, P4b, P6). A reused judgment does not
satisfy a separately required independent judgment; the independent assessor
acquires its own evidence and supplies its own judgment. [TICKETS §7](../TICKETS.md#recorded-judgment-and-owner-ruling-continuity)
uses the same evidence invalidator. Naming these kinds once gives every
consumer the same triggers. The
material relation is whether a result is relied on after a change that
could alter it (P3, P6). Whether a revision of a frame needs a new
revision coordinate is
[REFERENCE_FRAME §10](../REFERENCE_FRAME.md#revision-actions)'s question;
whether a result it touches stays valid is this section's.

### Transition evidence

A reviewable transition identifies the exact candidate, the affected
relations, the changed realisation paths, the authority paths added or
removed, the retained and open seams, the focused proof, any required
integration proof, the explicit non-changes, and, where an assessor was
activated, the assessor's recommended disposition, with the decision
owner's disposition beside it once one is made (§3). Consumers
choose the representation. Transition evidence is a read
model; it does not become specification, design or admission authority
(P6, P4b).

Construction uses the cheapest focused proof capable of falsifying the
active relation. Expensive whole-candidate qualification occurs at a
declared candidate boundary rather than after every local edit, unless the
affected risk makes whole-candidate proof necessary (§6). A durable or
reconstructable authority claim is not established solely by a same-process
proof when loss of incidental process state is a material counterexample:
the proof destroys or excludes the incidental authority and compares the
reconstructed semantic outcomes (P5, P6).

Source: TICKETS.md#execution-and-verification-authority-separation-up-007 sha256=5f7e4cb0785a27b9e6dda1fd91044e775183b6a0e6e80b33811e54665b144b57

### Execution and verification authority separation (UP-007)

Authority to author or implement a change is not independent authority to
verify it. What counts as independent, including that the reviewer is
not the author of the reviewed subject, and the protocol an independent
assessment follows are
[EVALUATION §3](../EVALUATION.md#3-independent-assessment). Where
independent review is required, the reviewer identifies the exact
subject, basis, scope, exclusions, evidence, verdict and unresolved
findings (P6). Review
findings must cite current authority and the code or proof paths they
rest on, not only historical commentary (P6, P1).

Self-review remains useful authoring evidence and cannot be relabelled as
independent. Human authority may accept or reject the claim; it does not
make implementer self-review independent. The boundaries at which this
method requires independent assessment are this member's policy, which
EVALUATION §3 names; a governing basis may add others, as that section
states. Independent review is required at
product, qualification, release and explicitly risk-bearing boundaries that
claim it, not for every local implementation step (P6, P2).

A claimed independent review may support promotion or closure only when its
exact subject and verdict are durably traceable through an existing ticket,
commentary, qualification or release-evidence carrier. A statement that
review occurred, an unbound conversation summary or an unavailable draft is
not the review verdict. This rule requires no separate receipt, carrier or
review round (P6, P4b).

A ticket's review verdict is bounded by the exact reviewed claim and its
applicable hard stops. When a finding blocks current promotion, and what a
valid observation outside that boundary does, are stated once at
[EVALUATION §5 When a finding blocks promotion](../EVALUATION.md#when-a-finding-blocks-promotion);
this carrier applies that section to a ticket's review and adds no
trigger (P2, P6).

A direct or lawfully proxied human ruling receives a durable disposition
before the next affected acceptance boundary. Its source wording stays
distinct from agent interpretation. Opening a ticket records the
obligation and does not satisfy it, and an agent cannot widen the ruling
while recording it (P6, P4b).

Where the agentic construction relation applies (ACTIVATION §1, bound to
this method by [SPEC_METHOD §8](../SPEC_METHOD.md#8-bounded-execution-in-this-method)),
the active work item identifies the selected execution basis, the bounded
affected relation set, the delegated construction and assessment authority,
and the re-entry conditions. It may point to accepted design and existing
evidence carriers rather than restate them. Ticket state, ticket prose or
an admitted execution contract cannot widen that basis or substitute for
the live-surface assessment the relation requires (P6, P0).

The reviewable transition (ACTIVATION §7, Transition evidence) may be
carried by an existing ticket, commentary, commit, qualification or
release-evidence surface. No new ticket state, document type, review round
or approval ceremony is required. This member carries selection and
traceability; ACTIVATION §1 and SPEC_METHOD §8 own the execution semantics
(P2, P6).


Source: TICKETS.md#recorded-judgment-and-owner-ruling-continuity sha256=5f7e4cb0785a27b9e6dda1fd91044e775183b6a0e6e80b33811e54665b144b57

### Recorded judgment and owner-ruling continuity

A residual judgment that another activation needs is recorded once, with
its owning work, in the existing carrier selected under §5. The record
identifies the question; the exact subject and governing basis; the
supporting computed facts and evidence; the responsible actor and its
authority; the conclusion and its scope; the uncertainty; and a concrete
revising observation that lets a consumer determine whether the conclusion
still applies. A question settled by rule needs no invented J record (P4b,
P6; C, J and O are
the annotations of [SPEC_METHOD §4](../SPEC_METHOD.md#computed-classification-and-treatment)).

Later roles and resumed runs recover the result and check its
applicability rather than re-author unchanged judgment. Reuse and
invalidation are
[ACTIVATION §7](../ACTIVATION.md#7-closed-result-and-reuse): changed material
inputs, a declared revising observation or a changed basis invalidate
the affected result, preserving the original result and its successor
relation and keeping only demonstrably independent results, and a new
role or conversation alone invalidates nothing. For a recorded judgment
the material inputs include its supporting computed facts and evidence,
and its declared revising observation is the one the record states;
reassessment covers what the change affects. The result may reference
current C outputs; reuse cannot silently turn unknown facts into
established premises (P4b, P5). Required independent assessment may consume valid C, but
its assessor acquires sufficient exact evidence and supplies its own
judgment under the actual independence condition; reusing the author's J
cannot satisfy that condition (P6; EVALUATION §3).

A direct or lawfully proxied owner ruling is recorded in its original
wording, with its owner, exact subject and basis, permitted scope and
effects, conditions and source, separately from agent interpretation. Later
work consumes that same ruling while it applies; it neither widens the
ruling nor requests unchanged authority again. New ambiguity or a
materially changed decision returns only the affected question to its
owner. J is not O, and recording either cannot create admission,
acceptance, effects or continuation beyond the original grant (P6, P3).

These results follow the lifetime of the existing run, sprint or durable
ticket and its named result and evidence surface. They require no separate
judgment registry, no ticket per judgment and no additional approval
ceremony (P2).

Repricing gives each affected obligation a disposition in that same
carrier: retained, superseded, deferred or withdrawn, with its owning
authority and applicable evidence links. Surviving work is preserved and
changed dependencies are explained; unaffected history is not copied into
a parallel ledger. An owner decision is presented as the short consequence
delta needed to decide it, with the original ruling preserved separately.
A general instruction to continue does not accept an undisclosed
architectural or scope change (P4b, P6, P2).

The four repricing dispositions are lifecycle states of an obligation,
set by its owning authority. A state label is not an evaluation result and
has no automatic core mapping. A material repricing decision is the separate
owner decision that establishes one such state for an exact obligation,
subject and basis. Its record names the chosen disposition, the decision
owner and grant, the governing conditions, evidence, affected dependencies,
remaining obligations and any conditions for revisiting the decision (P3,
P4b, P6).

A performed evaluation of that decision answers the predicate: **the named
owner lawfully establishes the recorded disposition for this exact
obligation, subject and basis, with every applicable condition satisfied
and every surviving obligation preserved.** This is the repricing predicate
owned here; it is not candidate acceptance under
[ACTIVATION §3 Disposition](../ACTIVATION.md#disposition), and it does not claim
that the underlying work was delivered. The result retains the decision,
its chosen state and its evidence, and refines the core values of
[FOUNDATIONS §4 Results](../FOUNDATIONS.md#results) as follows:

| Repricing result | Core value | Meaning for the repricing predicate |
|---|---|---|
| `repricing_established` | satisfied | the exact applicable owner decision, authority, evidence and preservation of surviving obligations establish the predicate |
| `repricing_falsified` | falsified | a counterexample defeats the predicate, including a disposition outside the actor's grant or contrary to an applicable obligation |
| `repricing_indeterminate` | indeterminate | admissible evidence cannot decide whether the decision meets an applicable condition; the undecided condition and needed evidence remain explicit |
| `repricing_out_of_frame` | out_of_frame | a material relation or capability needed to evaluate the decision is undeclared in the frame; the missing relation or capability remains explicit |
| `repricing_invalid_basis` | invalid_basis | the decision is evaluated on an absent, stale, ambiguous or mismatched required basis that cannot support the predicate |

An evaluation that was not performed has no result. The evaluation records
all applicable failure grounds and supplies no decision authority; the
state changes only through the owner's authorised act. A lawful deferral
may therefore yield `repricing_established` while the delivery claim remains
failed or outstanding. An unauthorised `withdrawn` label cannot close an
obligation. Neither retention nor a satisfied repricing predicate establishes
delivery, and a superseded, deferred or withdrawn state cannot erase
unresolved obligations or evidence (P5, P1, P6).


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


Source: TICKETS.md#one-truth-state-projection-and-drift-refusal-up-009 sha256=5f7e4cb0785a27b9e6dda1fd91044e775183b6a0e6e80b33811e54665b144b57

### One-truth state projection and drift refusal (UP-009)

Work state has one authority chain: goals own the bounded work wave, the
ticket owns ticket state, milestone authority owns subordinate milestone
state (§1), and accepted design owns realisation decisions. Comments,
dashboards, registers, indexes and generated summaries are projections
(P6, P3).

Recency, visibility or repetition does not turn a projection into truth.
Contradiction between the owning ticket, its required milestones, the
current goals or the cited acceptance evidence blocks closure. Superseded
evidence remains history and cannot be projected as current acceptance
(P6, P4b).


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
| P5 (derived from P0 and P6), P0 (recovered), P6 (independent) | a claim that needs a relation or capability the frame does not declare cannot be decided in that frame; one the admissible evidence cannot decide is a different case; and a declared capability left unexercised leaves its part without a result, while a counterexample already found stands | [Results](../FOUNDATIONS.md#results), Out of frame or indeterminate | the stop state that carries an unexercised capability; owner: [ACTIVATION §3](../ACTIVATION.md#construction-availability), construction availability | 7, 9 |
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


Source: TICKETS.md#foundation-to-law-work-carriers sha256=5f7e4cb0785a27b9e6dda1fd91044e775183b6a0e6e80b33811e54665b144b57 rows=3/11 selected by the anchors this frame carries; the consumers paragraph of 11 items is omitted

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
| P6 (independent); P3 (independent); P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable); P2 (independent); P5 (derived from P0 and P6, with P0's open-world premise); P0 (recovered); instance: several surfaces, carriers vary | By P3 one state binds one authority and basis, and by P6 a projection is not authority, so work state has one authority chain: goals own the work wave, the ticket owns its state and milestone authority its milestones, and a board, comment, index or summary is a projection that answers one question. By P5 contradictory authorities cannot both be read as satisfied, so contradiction among them blocks closure; by P4b a milestone's acceptance establishes only its own claim. A comment is a post: provisional until its content is adopted into the owning surface, with its own discussion state. Another carrier is lawful only as an explicit rebinding with no rival left. | [One-truth state projection and drift refusal (UP-009)](../TICKETS.md#one-truth-state-projection-and-drift-refusal-up-009); §1 [Comments](../TICKETS.md#comments), [Milestones and phase-scoped truth (UP-006)](../TICKETS.md#milestones-and-phase-scoped-truth-up-006); §2 [Default layout](../TICKETS.md#default-layout), [Bindings and projections](../TICKETS.md#bindings-and-projections), [Carrier substitution](../TICKETS.md#carrier-substitution); §4 [Status](../TICKETS.md#status), [Lanes](../TICKETS.md#lanes); §9 [Relationship to other surfaces](../TICKETS.md#relationship-to-other-surfaces); [POSTING_GUIDE §2](../POSTING_GUIDE.md#2-boundary), [§7](../POSTING_GUIDE.md#7-discussion-state-and-mutability), [§9](../POSTING_GUIDE.md#9-ratification) | the default layout, the lanes and the minimum status sets: domain choices of this member, which a project may extend; a rebinding of ticket authority: the product definition; the post categories, structure and discussion states: [POSTING_GUIDE](../POSTING_GUIDE.md) | 1, 6, 9 |
| P6 (independent); P1 (independent); P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable); P5 (derived from P0 and P6, with P0's open-world premise); P0 (recovered); P2 (independent); P3 (independent) | By P6 authority to author is not independent authority to verify. By P1 and P3 a verdict means only the claim it binds, so a review verdict is bounded by its claim and traceable to it. By P0 and P4b a judgment or ruling must survive a change of actor, so it is recorded once, in its original terms, and reused while it applies; by P5 changed evidence invalidates what it affects. | §7 [Execution and verification authority separation (UP-007)](../TICKETS.md#execution-and-verification-authority-separation-up-007), [Recorded judgment and owner-ruling continuity](../TICKETS.md#recorded-judgment-and-owner-ruling-continuity) | the four repricing dispositions and the predicate and refinement for a material repricing decision: this member. The assessment protocol and the reuse law are [EVALUATION §3](../EVALUATION.md#3-independent-assessment) and [ACTIVATION §7](../ACTIVATION.md#7-closed-result-and-reuse), not choices | 7, 9 |
| P6 (independent); P5 (derived from P0 and P6, with P0's open-world premise); P2 (independent); P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable) | By P5 a claim is satisfied only by valid evidence for each obligation, under the conjunction of FOUNDATIONS §4, so a work claim is complete only when every applicable obligation is satisfied and no non-closure condition remains. By P6 review evaluates and does not decide, so its occurrence is not the closing event; by P6 a test's expected result needs work authority, so it comes from admitted work authority, never from the implementation. | §7 [Condition-based closure and reuse](../TICKETS.md#condition-based-closure-and-reuse), [Test case authority](../TICKETS.md#test-case-authority) | the five-step reconciliation order: this member. The conjunction and the general test law are [FOUNDATIONS §4](../FOUNDATIONS.md#conjunction-of-results) and [ASSURANCE §3](../ASSURANCE.md#3-test-authority), not choices | 3, 9 |

The standing of these consequences is stated in
[FOUNDATIONS §3 Foundation to law](../FOUNDATIONS.md#foundation-to-law).
The table accounts for §1 to §9, and for POSTING_GUIDE §2, §7 and §9,
which have no family table of their own.

