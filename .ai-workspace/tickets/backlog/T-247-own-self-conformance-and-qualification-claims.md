# T-247 - Close ABIogenesis 5.0 Exact-Candidate Qualification And Self-Conformance

- id: T-247
- title: Close ABIogenesis 5.0 exact-candidate qualification and self-conformance
- type: qualification
- ticket_category: compliance_realization
- status: backlog
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- owner: abiogenesis
- priority: high
- governance_scope: SPEC_METHOD, REQ-P-INSTALL, REQ-P-SELF-CONFORMANCE, REQ-P-QUAL
- change_class: realization_refactor
- re_entry_point: exact-candidate qualification contract and proof surfaces
- created_at: 2026-07-12
- updated_at: 2026-07-27 (4.6 installed-sandbox capability bound to exact-candidate proof)
- source_ticket: T-242
- admission_condition: >-
    T-249 has retained and aligned the claims, T-244 identifies their exact
    built proof and remaining gaps, and each code-bearing boundary has an
    accepted three-view design and singular execution ticket
- dependencies:
  - T-244 exact 5.0 feature register
  - T-249 stable-baseline constitutional reprice
  - accepted design and realization evidence for every retained claim

## Purpose

Own the single `ExactCandidateQualification` contract family and the realized
pre-RC compliance gate for stable ABIogenesis 5.0. The family has two
addressable projections: an immutable `ExactCandidateQualificationBasis` and a
typed `ExactCandidateQualificationVerdict` over that exact basis. T-249 owns the
constitutional wording; this ticket prevents those claims from closing through
paper disposition, named ownership, campaign observation, or reviewer approval
without executable evidence.

Specification-method compliance is a 5.0 product property. Operational
self-use is not: the first required dogfood build is 5.0.1 under T-245/T-246.

## Retained 5.0 Claims

1. **Self-conformance** — apply the published method, contract, conformance,
   proof, ticket, public-seam, qualification, and release rules to the exact
   ABIogenesis source/candidate surfaces under exact method/rule/source bases.
   The product receives no exemption because it is the product being built.
   This is not a self-host or installed-builder claim.
2. **Executable-change witnessing** — the release gate covers every changed
   executable file in any supported language or location, not only `.ts`
   beneath one implementation directory. The T-239 owner pointer and legacy
   exemption wording are reconciled by T-249; the enforced set reaches zero
   unexplained exemptions before T-248.
3. **Packed/live proof and bypass posture** — each retained live qualification
   runs against the packed-and-installed candidate unless its declared proof
   class is explicitly static. One installed-sandbox conservation witness shall
   start from an empty target and use only the packed candidate's public
   composition: `workspace.create` -> `product.verify` -> `product.install` ->
   `workspace.bind` -> `catalog.admit` -> `catalog.view` -> `run.invoke` ->
   `project.read`. It shall populate the Workspace, invoke one bounded scenario
   through the installed runtime, and read its result and replay. The witness
   shall preserve the install, runtime, event, projection, and archive evidence
   required by `REQ-P-QUAL-018G..018I`; source-tree imports, private test
   helpers, or a separate sandbox runtime shall not satisfy it. This is a
   composition of existing Product operations, not a new sandbox identity,
   transport contract, dispatch law, or recovery model. A red mandatory result
   or release-grade bypass cannot produce a green qualification verdict or
   satisfy the admission contract later consumed by `AF-25`.
4. **Exact qualification basis and verdict** — one bounded qualification read
   model binds the exact source ref and commit, candidate artifact content and
   install digests, product toolchain manifest, installed-product and install
   manifests, workspace binding, tenant-conformance manifest, frozen
   qualification-inventory digest, and one exact qualification-law basis ref
   and digest covering specification-method version, applicable rule-catalog
   version, source refs, and content digests. Its verdict preserves that exact
   subject and law basis and cites exact build, lint, test, conformance,
   public-contract, installed behavior, identity, and retained feature evidence
   without recomputing the owning verdicts.

The current observer/tuner claim remains included where T-244 retains it: it
must prove truthful halt classification, grounded draft production,
attribution, ratification/rejection, replay-visible acts, and an injected
negative over the candidate's ordinary governed surfaces. It is not tied to a
self-build path.

## Qualification Contract And Lifecycle

`ExactCandidateQualificationBasis` is the stable, content-addressed subject of
pre-RC qualification. Every field above is required and belongs to the same
candidate and exact `QualificationLawBasis`; absent, stale, conflicting,
cross-candidate, cross-law-basis, or bypassed input is a typed refusal. A changed
source, artifact, install, binding, manifest, method version, rule-catalog
version, law-basis source ref/content digest, or inventory digest creates a new
basis rather than mutating or relabeling an old one.

`ExactCandidateQualificationVerdict` cites one exact subject-basis digest, the
matching qualification-law-basis ref/digest, the owning proof refs and digests,
typed dispositions, residuals, and mandatory-gate and bypass state. It is green
only when all retained mandatory rows are green over that subject and law basis.
Each mandatory gate executes under its existing owning contract and
emits its own typed assessment. One structurally admitted
`QualificationGateResultVector<K>` carries the exact subject-basis projection
and digest, matching qualification-law-basis ref/digest, frozen-inventory
ref/digest, vector digest, and a non-empty ordered family of result citations.
Each citation preserves a contiguous zero-based
ordinal, unique gate identity, same-basis ref/digest, owning assessment
ref/digest, `green | red | blocked` disposition, evidence refs/digests, and
bypass refs.

Vector admission checks only envelope identity, exact inventory-roster
completeness, subject- and law-basis conservation, ordinals, uniqueness, digest
resolution, typed disposition, bypass truth, and vector identity. The `AF-22`
law-basis argument must exactly match the basis-bound ref/digest. Admission
cannot rerun or
reinterpret an owning gate. The admitted vector is the single input carrier to
one declared
`C.of(AF-22 evaluateConformance(exact_candidate_qualification, ...))` stage,
whose result cardinality is exactly one. That existing parameterized evaluator
is the sole total typed reducer that emits the verdict projection. Missing,
duplicate, reordered, stale, malformed, conflicting, or cross-basis citations
refuse before reduction and emit no verdict.

Qualification does not schedule heterogeneous owning gates through `C.batch`,
`fan_out`, `fan_in`, a release-local controller, or a filesystem scan. The
contract family aggregates existing proof truth without becoming a second
conformance evaluator, semantic checker, algebra generator, scheduler, or
release-wide harness.

This ticket runs the contract family over the pre-RC candidate and produces the
first exact green or refused verdict. T-248 may reuse the same public contract
family to qualify an installed published RC, but it owns that release-window
execution and its state transitions.

T-247 creates no `ReleaseCut`, `ReleaseSnapshotManifest`, RC identity, final
version, or released `Product`. In particular, a release snapshot cannot be an
input to the verdict that authorizes its own creation. T-248 alone may invoke
`AF-25` after receiving a green verdict whose basis digest exactly matches the
candidate supplied to that invocation.

## Realization Discipline

- T-244 is the sole derived traceability and closure register for retained
  constitutional feature and compliance gates.
- This ticket is an umbrella qualification owner, not authorization for a
  compound code change. Each distinct design boundary enters a singular leaf
  when execution starts.
- Existing compiler, conformance, test, publication, install, and replay proof
  machinery is extended at its lawful boundary. No parallel checker or
  imperative compliance script may replace product behavior.
- Release-grade snapshot admission is proved fail-closed for every mandatory
  gate or exact-cut bypass required by `REQ-P-QUAL-050..056`, but this ticket
  does not materialize the snapshot. The negative contract is consumed when
  T-248 invokes `AF-25`.
- Every phase compares code and evidence against the accepted domain, sequence,
  and state diagrams before its checkpoint.

## Prime Contraction Input

On activation, consume T-277 `PC-009`. Measure the actual proof graph before
selecting a common harness. Preserve all 17 T-244 claim identities and their
row-specific closure gates while commonizing authority-neutral product setup,
evidence acquisition, and replay traversal. The current five-journey grouping
is a hypothesis, not an accepted count. One qualification read model may cite
owning proofs but may not recompute their semantic verdicts.

## Explicit Non-Scope

- Two-stage C1/C2 self-hosting, B5, R5, or exact-I4 bootstrap proof.
- odd_glc 1.0, a data-mapper campaign, or released-pair qualification.
- The 5.0.1 dogfood proof owned by T-245/T-246.
- Hostile-workstation tamper defense, signing, remote attestation, or a new
  qualification framework.

## Closure Condition

All four retained claim families have exact green evidence over the final
pre-RC `ExactCandidateQualificationBasis` and its bound exact
`QualificationLawBasis`; real-tree and
seeded-negative self-conformance pass; executable-change witnessing has no
unexplained gap; every required live proof uses its declared packed installed
substrate; one source-blind installed-sandbox witness proves the retained 4.6
workspace setup-and-run capability through existing public Product operations;
red, stale, cross-basis, missing, and bypass differentials fail closed; one
roster-complete, basis-conserving, digest-resolving
`QualificationGateResultVector<K>` is admitted; and one green
`ExactCandidateQualificationVerdict` cites the exact subject/law basis and owning
proofs without restating their semantics. T-248 consumes that exact basis and
same-subject-and-law-basis verdict as a
hard release dependency. No `ReleaseCut` or
`ReleaseSnapshotManifest` is required for, or created by, T-247 closure. A named
future owner without evidence cannot close this ticket.
