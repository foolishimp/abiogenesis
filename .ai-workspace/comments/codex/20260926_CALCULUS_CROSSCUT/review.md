# Execution calculus: cross-cutting construction review

## Product frame and subject

2026-09-26; `T287_CALCULUS_CROSSCUT_01`. Fixed fifteen-family ABG5,
GOAL-035/T-287/LIFE-01, trusted single-developer desktop. GTL declares;
HoG traverses; effect owners execute; ABG admits; replay projects. ABI uses
immutable STDO `v2.5.1-rc.1`; odd_glc remains on RC4. Runtime implementation,
packaging and live execution remain held. No application-specific behavior,
second executor, authority ledger or hostile-machine hardening is selected.

Canonical code subject: `420336a50b8fbec42ab244521cfa4d8a0351c4af`.
The seven existing calculus document edits are part of the reviewed subject;
[Product](../../../../specification/PRODUCT.md#execution-and-context-calculus)
SHA256 is `0f59192237ae2c9c68a7aeea510550eafb49965f167fa732a98442f24def2755`.
Code and tests were unchanged throughout this review. This report is frozen
review evidence; [T-287](../../../tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md#cross-cutting-calculus-review)
owns current disposition and implementation selection.

Selected frame: `stdo://releases/v2.5.1-rc.1/standards/STDO_REFERENCE_FRAME_BASELINE.md#derived-end-to-end-interface-integration-frame`,
with its Computational Whole-Path refinement and project
`ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#f-end-to-end-interface-integration`.
Owner, Reuse/Foundation and Proof are applicable constituents. Supporting
clauses are DMM Whole-Family Prime Contraction (910), Boundary Inflation
(1179), Computational Realization Projection (1510), Recurrence Extraction
(2078), Functional Realization Review (2398), SPEC_METHOD UP-021 (1650),
and baseline Legitimate-Path And Technical-Debt Erasure (981). These clause
routes are not additional reference frames or new approval gates.

The selected Representation and Axiom inventories verify, nine and seven
members respectively. All 52 indexed standards-member bindings are fresh.
The released `ac.py project` computational-whole-path view succeeds against
the adopted source bindings. Exact sources, not the index, govern this review.

## Result

The review identifies two additional supported problems beyond the preceding
calculus review: ordinary batch value transport disagrees with its cursor, and
tentative F_H/retry/continuation projections discard existing prefix ownership.
It also identifies repeated binding projection and assembly construction within
the context family. Existing recovery, nested-batch, role-context and append
findings remain supported. No new live failure or performance attribution is
claimed.

The recurring construction error is treating an already established relation
as raw data again, or selecting its components independently. The bounded
correction is to preserve the relation through its existing owner and check
actual changes. Computational similarity alone does not justify merging
semantic authorities or deleting different input-transfer rules.

## State-model diagnosis

The owner's follow-up correctly identifies a state/transition modeling failure.
Immutability alone preserves whatever combination was constructed, including
an inconsistent one. HoG currently constructs a successor cursor and carried
value through different selections; both can be immutable while disagreeing.
Even a coherent reference/value pair can violate the operator's transfer law,
as the nested-batch case shows.

The Product calculus already requires current-input/producer conservation,
declared transfer, incremental advancement and recovery equivalence. CCALL-018
decomposes that guarantee. Existing HOW also names typestate and pure transition
law (`ABI5_REALIZATION_CONSTITUTION.md:158`), joint seam conservation (SP-03,
374), and established internal values (`T287_PUBLIC_DEFINITION_CALL_CONSTRUCTION.md:56`).
These findings do not establish a need for another Product extension. They
establish incomplete realization of an already-governing relation.

The bounded HOW correction should instantiate the existing law as a coherent
selected input (reference, digest, value and provenance) and explicit transfer
variants. A successful internal advance preserves a well-formed predecessor:

```text
nextInput = declaredTransfer(program, state, admittedOutcome)
nextState = advance(state, nextInput)
wellFormed(state) and lawfulAdvance => wellFormed(nextState)
```

This is a preservation obligation, not another whole-state validator on every
handoff. Raw ingress establishes facts; internal transitions retain applicable
facts and check their actual delta. A new universal state carrier, framework or
controller is unnecessary. The design must show how existing typed owner
interfaces prevent independent selection of incompatible components and how
real composed proofs distinguish compose, batch, foldback and recovery.

Unless qualified otherwise, code paths below are relative to
`build_tenants/abiogenesis/typescript/code/src/` in the reviewed commit.

## Input and causal provenance

**CALCULUS-INPUT-01 — S1/P1 for the blocked recovery; S2/P2 for both batch
defects.** This family must preserve the selected input's reference, digest,
value and producer together.

| Route | Actual members | Distinction to preserve |
|---|---|---|
| Structural entry, identity, compose, graph edge and batch | `gtl/source_path.ts`; `hog/traversal.ts:235`; `hog/structural_transition.ts:93`; `abg/traversal_route.ts:3700` | Compose consumes output; shared batch consumes its enclosing entry; fan-out consumes its selected member. |
| Executable value transfer | `hog/ccall_lifecycle.ts:355,667`; `hog/workflow_lifecycle.ts:785,935`; `hog/operator_support.ts:105`; `hog/graph_execute.ts:486` | A completing Result is not automatically the next input. Retained pairs and completed vectors have distinct transfer rules. |
| Child entry and foldback | `hog/workflow_lifecycle.ts:398`; `abg/worksite_input_provenance.ts:68` | Follow exact Result/foldback/child-terminal references and decreasing admission ordinals; preserve associated Run. |
| Explicit retained input | `abg/traversal_route.ts:4032`; `abg/retry.ts:5815`; `abg/worksite_input_provenance.ts:225` | Graph-entry-plus-source construction is intentionally declared here. Its entry-input use is lawful. |
| Current semantic input and historical producer | `abg/execution_basis.ts:198`; `abg/semantic_stage.ts:118,288`; `abg/semantic_job.ts:112`; `abg/semantic_revision.ts:466,689` | Current cursor provenance differs from embedded historical construction/evidence sources. Both need their exact selectors. |
| Retry, recursion, re-entry and continuation | `hog/retry_lifecycle.ts:192`; `abg/retry.ts:4717,5834`; `hog/recursion_lifecycle.ts:780`; `hog/route_proposal.ts:574`; `hog/interaction_resume.ts:96` | Attempt preimage, child foldback output, target projection and authorized response remain distinct variants. |
| Recovery | `abg/semantic_revision.ts:159,439`; `product/semantic_revision.ts:269` | Resolve a closed failed consumer's current input and pending producer; do not use a selected-no-evidence authenticator for a closed call. |

**Known recovery failure.** `semantic_revision.ts:169` compares the admitted
author output with the unchanged graph-entry `causeBasis.rawInputValue`.
Native39 consequently failed before any context or actor. The corresponding
author branch at 175 is also wrong when earlier composition has progressed its
input, but that conditional case is not another observed incident. The pending
native38 Design remains unassessed and must not be authored again merely to
recreate the assessor boundary.

**Previously demonstrated nested-batch failure.** `source_path.ts:568,923`
uses the completing leaf's input as the next shared-batch input. The earlier
pure-source probe used actual C constructors for
`batch([compose(A,B),compose(C,D)])`; after A changes x0 to x1, C incorrectly
receives cursor x1. That probe is reused; it was not rerun here.

**New ordinary-batch failure, source-traced.** For admitted
`batch([A,B])`, equal `I -> I` carrier/cardinality, no fan-out and
`A(x0)=x1 != x0`, GTL correctly selects cursor x0 for B. HoG's advanced
completion at `ccall_lifecycle.ts:355` contains x1. The resolver at
`operator_support.ts:105` changes values only for declared fan-out, and
`graph_execute.ts:500` retains x1 beside B's x0 cursor. The leaf invocation
at `ccall_lifecycle.ts:495` supplies that pair; `leaf_invocation_port.ts:545`
refuses its digest mismatch before B's implementation dispatch. This is a
supported fail-closed interruption, not an executed live counterexample or
wrong-effect claim. Fixing the nested cursor alone would not repair this path.

**Contraction.** Keep GTL transfer meaning and existing ABG cursor/provenance
owners. HoG consumes the value belonging to the admitted target input. Reuse
the exact input resolution already at `execution_basis.ts:198` and the
foldback provenance at `worksite_input_provenance.ts:112`; retain variant-specific
entry, result, retained, fan-out and recovery requirements. Remove independent
raw-entry/result reconstruction at `semantic_stage.ts:118` where the owner
already resolved the input. Replace equal-value discovery only where an exact
current-input reference is available. Embedded historical-source selectors
must not be replaced by the immediate cursor.

Five overlapping value-discovery helpers occur in semantic-stage predecessor
matching/selection, semantic-job `predecessor`, and both revision input
matchers. Repeated equal outputs are a credible risk, but their complete
supported failure premises were not established. This remains a candidate,
not an additional defect or permission to weaken uniqueness checks.

**Smallest proof:** run the same two value-changing deterministic leaves through
actual compose and shared batch; assert both the next admitted reference and
the value received by the implementation. Add the existing nested-batch case,
a batch after prior outer progress, and same-basis author-to-assessor recovery.
Preserve equal-valued wrong-producer refusal and pending assessment. No invented
basis per leaf and no LLM are needed to distinguish these relations.

## Established facts through internal transitions

**CALCULUS-PREFIX-01 — S2/P2 on affected transitions; new supported recurrence.**
The successful ordinary F_H hold path builds a plan and rederives it at
admission. In each plan, `abg/c_call.ts:5760` copies the owned prefix into
`projectedHistory`; lines 5830, 5833, 5894 and 5897 make four separate raw frozen
arrays for Result/J authority and Run projections. Admission repeats planning
at 5983: eight raw-prefix selections on that supported path. Each unowned array
re-enters recursive immutability, ordinal/profile and causal checks at
`event_prefix.ts:192,258`. This is in-memory loss of established proof, not
physical recovery. Counts are source-traced, not instrumented timings.

The same construction occurs in retry failure planning (`retry.ts:5361,5495,5550`),
completed retry progress (`6193,6257,6283`), and continuation operation/response/
resume planning (`continuation.ts:1322,1912,2171`). Existing prefix extension
and scoped projection at `event_prefix.ts:71,217` already express the common
mechanics. Keep those facts through tentative extension instead of making each
consumer rediscover them. Raw plan admission, current predecessor checks,
transition-specific capabilities, C/J and effect duties remain. Tentative
branches never become committed facts and must be discarded on rollback.

**CALCULUS-BASIS-01 — S2/P2 computational conformance; prior finding extended.**
Child preparation at `execution_basis.ts:2170` reconstructs parent basis and
root implementation/interaction sets and rehashes them against supplied values.
The family includes `invocation_execution_truth.ts:349` and
`execution_basis.ts:1102,1190,1235,1277,1338`; its consumers include child
preparation, scope classification, leaf authority, retry and continuation.
At least three complete-history filters occur on ordinary child preparation.
Retain exact established values within the existing prefix lifetime and use
its identity/membership selectors. New child joins, conflicting added facts,
changed cuts/source/basis and rollback still need applicable checks. This is
separate from the already-closed physical child-read repair.

**CALCULUS-APPEND-01 — S2/P2 computational conformance; prior finding retained.**
`runtime_derivation.ts:31` constructs `[...events,...suffix]`; individual
transaction appends at `event_store.ts:3694` repeatedly use it, with additional
candidate-prefix snapshots. H prior rows and k additions cause
Theta(kH+k^2) reference-copy work. Payload-copy or elapsed-time attribution
does not follow. A representation correction belongs inside the existing store
and derivation owners; preserve issued immutable cuts, exact ordering,
tentative/committed distinction, fsync and rollback. This needs an explicit
bounded HOW decision before replacing shared storage, not a quick mutable-array
patch or a second event store.

**Smallest proof:** an existing F_H or continuation path over two histories
differing only in irrelevant earlier rows. Events, Result/J/replay digests,
refusals, old snapshots and rollback must agree. Owner-created tentative views
must no longer enter raw prefix validation; raw/copied inputs still must.
Separate necessary whole-Run projection from avoidable reconstruction. No such
new execution was performed in this review.

## Context selection and representation

**CALCULUS-CONTEXT-01 — known CXR01-03, S2/P2; additional P3 construction debt.**
The job renderer at `instruction_assembly.ts:454` mixes assessor instructions
with unconditional author-only requirement/design imperatives. The stage
renderer at 315 already gates its author instructions by role, and the native
work task at `product/semantic_job.ts:865` separately owns writable author versus
read-only assessor behavior. Shared capability does not mean identical role.
The response schema at `semantic_job.ts:640` correctly distinguishes them.
Repair the declared role projection without assigning replacement authorship
to assessors or weakening criteria.

The closed CXR review also established repeated observed candidate text and
grounded-term bodies in the retained 994,022-byte component assessor context:
195,837 and 86,626 bytes of gross repeated representation respectively.
These are component bytes, not a live native39 prompt, tokens, net savings or
causal timeout evidence. Share exact bodies at known typed slots through the
existing presentation owner, preserving raw observations, ordered terms,
provenance and accepted/rejected versions. Keep unmatched text complete.

**New construction recurrence:** `constructJobInstructionAssembly` projects
active bindings at `instruction_assembly.ts:418`; actor-contract construction
at `semantic_job.ts:324` and actor-context construction at 361 each do it again.
Each call to `projectSemanticJobBindings` (252) validates and hashes the same
binding-version chain. Thus there are at least three projections within this
one assembly, apart from raw input validation. A scoped internal derivation can
supply all three consumers; raw/exported entry points must still establish
their input. No global cache or new public admitted type is required.

**Small maintenance contraction:** native-work, worksite, semantic-stage,
semantic-job and revision-selector branches repeat plan/envelope/manifest,
schema/prompt digest and immutable request construction at
`instruction_assembly.ts:110,175,375,515,733`. Four share ordered-section
rendering; native work has a distinct text renderer. Factor equivalent pure
bookkeeping under the existing assembly owner while keeping renderer choice,
section order, role, domains, byte bounds, refusal and wire fields unchanged.
This is a commonization candidate with unmeasured runtime benefit, not a new
prompt framework. Retiring the stage arm entirely would change supported
publication variants (`gtl/semantic_job.ts:55`) and is not authorized by similarity.

The prepared actor owner already preserves its assembly at
`actor_process.ts:700`; raw dispatch retains authentication. Keep this accepted
repair. `instruction_assembly.ts:776,804` reconstructs the saved assembly during
semantic Result matching: reuse of an exact admitted transport fact is a
further candidate, but actual-output/provenance and raw/cold obligations must
be shown equivalent before deleting reconstruction. `nativeInstructionRequestMatches`
at 752 has only test callers in the inspected source and is not an ordinary
runtime hotspot.

**Smallest proof:** compare expanded selected material, role/schema agreement,
raw and prepared request behavior and unchanged manifest/wire bytes for pure
bookkeeping extraction. Corrected role text intentionally changes prompt bytes;
exact body-sharing must preserve selected meaning, qualifications and order.
Do not make whole-prompt byte equality the oracle for those intentional changes.

## Body storage and cold reconstruction

**CALCULUS-BODY-01 — P3 opportunity, not another demonstrated blocker.**
T289 already shares identical complete basis-input/Result bodies. Cold decoding
at `event_body_encoding.ts:48` resolves a previously validated body, then
`event_store.ts:3175` feeds it through full JSON detachment at 2236. Preserve
that established immutable body while admitting the new event envelope;
identity/stamp/cause/ref correspondence and required logical digest checks stay.

An envelope with another asset (`product/semantic_job.ts:457,501`) is a different
whole value. Sharing unchanged substructure between these versions is a separate
persistence-design opportunity. Its contribution to the retained approximately
403 MB history is unmeasured. Neither history deletion nor removal of necessary
cold reconstruction follows. T288/T289 remain closed within their accepted scope.

## Assurance and specification consistency

**CALCULUS-PROOF-01 — S2/P2 where used to close composition.**
`t287-native-semantic-revision.test.mjs:87` creates a new basis per call;
399 sets the failed assessor basis entry to the author output. The substitutions
at 98 bypass the real joins. This masks the shared-basis recovery defect.
Keep useful component tests, but remove that fixture as evidence for real
composition. Native-job tests at 103 and 234 also supply owner facts; their
properly bounded component claims are not defects. The existing retained-input
test at 30 uses actual materialization/cursor progression/authentication and
provides a reusable pattern, within its historical-owner scope.

**CALCULUS-RUN-WORDING-01 — S2/P2 documentary correction.**
Product 600 says a child has its own Run. `open_call.ts:628` and
`worksite_input_provenance.ts:89` preserve the associated parent Run with distinct
child call/frame/basis. The earlier documentation-only acceptance is insufficient
at this join. Clarify the association in Product; do not redesign Run lifecycle
to satisfy accidental wording. This review leaves the wording unchanged.

## Executive repair order and closure

1. Clarify child Run wording and repair the current-input family together:
   recovery plus both batch faults, conserving all declared transfer variants.
   Replace the misleading proof with actual composed deterministic execution.
2. Repair assessor role/context selection under existing owners. Incorporate
   local binding-projection reuse when touching that path; packaging extraction
   is lower priority and must not become a new dependency of correctness.
3. Apply the existing-prefix contraction across the identified tentative
   F_H/retry/continuation family and basis/set consumers. Verify ordinary and
   raw/cold paths separately. Record required Run projection as retained work.
4. Reframe append/cut representation only at its bounded existing owner. Exact
   body reuse may follow with cold/warm equivalence; partial-envelope persistence
   remains a separately evaluated opportunity with no measured latency promise.
5. Resume the preserved steel thread only after its affected conformance and
   live-execution selection. Do not repeat the valid author to compensate for
   a lost assessor boundary. Native assessment and Public readback remain the
   delivery discriminator, not another broad unit-test campaign.

Current computational P2 findings limit conformance claims for their affected
paths; they do not require completing every P3 opportunity before the next
lawful steel thread. No timer/heap/model increase or universal read/time quota
is proposed. Bound repair size by these families, retained responsibilities and
their finite composition discriminators. Stop and re-enter if a correction
needs new Public meaning, authority or supported persistence behavior.

## Evidence and limits

Two existing max Reviewers closed input/provenance and computation-family
returns; Executive reused them and reviewed context/assurance. Their source
findings are conjoined here, not counted as independent proof of one another.
No new probe, test suite, build, native/provider call or journal acquisition
ran. The previously completed pure nested-batch probe and retained context
comparisons keep their original scope. No installed conformance, release
readiness or measured speedup is claimed.

Necessary cold history acquisition, incremental Event Calculus, same-prefix
reuse, exact raw admission, required independent judgment, effect checks and
declared Run projection digests remain. Body-size distribution and function-level
CPU/RSS attribution are unmeasured. This is a complete map of the selected
recurring families, not a claim to have reviewed every ABG5 capability.
