# T-278 Release-Lifecycle Authority And Binding Review

- reviewer_task_identity: `/root/release_lifecycle_authority_review`
- review_class: `independent_authority_path_review`
- independence_basis: review-only; no candidate, authority, design, ticket, or realization file was edited
- reviewed_at: `2026-07-15T17:51:49Z`
- ontology_subject_sha256: `2c08d40c1ff12abbd8252913cefc610255ad9e9b52ac0d7ea66cca480eb383ec`
- goals_subject_sha256: `b19ea272722a1a0653d7d1b903fc2791e7e2caf3b63c16a78af5cb9fc01d9e6e`
- t278_subject_sha256: `055fa3e52e202fdafb6ae432de2a27f3935ea500c66c46084c971c18a8cb3d05`
- t247_subject_sha256: `ba0542d8edf4d04f914d8892033e8db546328f00ed1622539507bcfb742b6643`
- t248_subject_sha256: `f954ce032bae2dd4d3c7ff9e3491a4fbb8c33a2cacf617a59c96ea73927b6d8a`

## Findings

### P1 - The pre-RC cycle is removed, but the final-tap delta is not gated before publication

T-247 now lawfully produces an exact pre-RC basis and same-basis verdict without
creating its own release cut or snapshot (`T-247:72-94,130-140`). T-248 then
materializes the published RC from that verdict and qualifies the installed RC
without mutating either record (`T-248:41-55,93-113`). That closes the reported
snapshot-qualifies-itself cycle.

The tapped-release branch is still incomplete. T-248 sends the accepted RC,
its verdict, and an allowed final version/release-asset delta to AF-25 and then
publishes through AF-26 (`T-248:67-72,105-109`), but it no longer requires the
affected deterministic, install, identity, and bounded behavior gates to rerun
over the post-delta bytes before publication. Its only explicit final fresh
install is after remote Product publication (`T-248:73-76`). GOALS likewise
moves from installed-RC qualification to final-delta reconciliation and tap
without naming that pre-publication gate (`GOALS.md:163-167`). This conflicts
with `REQ-P-QUAL-070`, which requires every affected gate to rerun before
publication (`REQ-P-QUAL.md:283-287`).

The Ontology does not close the omission. AF-25 accepts only exact basis,
verdict, and release identity (`ONTOLOGY.md:1146,1233,1436`); neither its tapped
variant nor `ReleaseCut` binds the allowed delta, post-delta artifact basis, and
affected-gate results. AF-26 therefore cannot prove that the artifacts it
publishes are the verified final-only delta from the qualified RC.

Repair this inside the existing AF-25/public `release.snapshot` family. Its
closed `tapped_release` input must bind the accepted RC, installed-RC
same-basis verdict, allowed final delta, exact post-delta artifacts/manifests,
and pre-publication outcomes for every affected deterministic, install,
identity, and bounded behavior gate. AF-25 emits no tapped cut or snapshot
until that variant is green; AF-26 consumes exactly those bound artifacts.
This is an operation-variant and subordinate-input correction. It adds no atom,
composition, public operation, or new release identity.

### P2 - Qualification verdict folding is not mapped to the closed C algebra

The qualification composition says that a `fold` turns gate outcomes into the
same-basis verdict and calls the fold subordinate (`ONTOLOGY.md:1074,1194,
1371`). The constitutional C generator set contains no generic fold, and
`C.batch` explicitly preserves per-task judgments rather than collapsing them
(`REQ-L-GTL3-C-ALGEBRA.md:41-46,84-93`). The current wording therefore does not
yet prove that the verdict is derived without an uncounted semantic function.

The count need not grow. Bind the reduction explicitly to an existing typed
atom, for example the `exact_candidate_qualification` kind of parameterized
AF-22, composed after the batch as a `C.of` leaf. That evaluator must consume
the admitted owning outcomes and exact basis and emit the closed verdict; it
must not recompute their semantic truth. Remove the unqualified generic `fold`
wording or name its existing admitted constructor.

## Accepted Parts

- Source project, qualification basis/verdict, published RC cut, tapped cut,
  Product, artifact, and installed Product remain distinct identities.
- One `ExactCandidateQualification<K>` basis/verdict contract family is a
  justified Prime carrier. It does not itself require a public operation.
- Published-RC ordering through T-247 then AF-25 is acyclic and consistent with
  the RC-window method.
- AF-25 cut/snapshot materialization and AF-26 Product publication remain
  distinct authorities; their order is correct after the tapped variant binds
  the final-delta proof described above.
- Workspace binding cardinality is repaired coherently. Aggregate `0..1` is a
  discriminated sum; every concrete operation variant is `forbidden` or
  `exactly_one`, pre-binding functions forbid the carrier, and workspace or
  execution invocations require it (`ONTOLOGY.md:623-627,941-956,968-981`). No
  ordinary observation creates a new binding or basis fork.
- The candidate tables contain exactly 27 AF rows, seven product compositions,
  and 19 public-operation rows. Both repairs above fit existing AF-22/AF-25 and
  do not require a count change.

## Verification

I independently ran and inspected:

- SHA-256 verification for all 30 Ontology basis sources: 30/30 exact;
- atomic/composition/public-operation census: 27/7/19, unique;
- `npm run check:design-mermaid`: passed;
- `npm run check:ds-governance`: 19 tickets and 73 references, passed;
- `npm run check:prime-contraction`: passed for the earlier seven governed
  designs only; it does not validate T-278 and is not cited as T-278 evidence;
- Pandoc parse of the Ontology: passed; and
- `git diff --check`: passed.

No runtime tests were run because this is an authority/design review and the
runtime remains frozen.

## Verdict

`reject_pending_bounded_release_variant_and_verdict_derivation_repair`

The reported pre-RC cycle and workspace-binding contradiction are fixed. Do not
ratify the linked T-278 target yet. Apply the two bounded clarifications above,
recompute the exact subject digests, and re-review only that delta. The Prime
target can remain 27 atoms, seven compositions, and 19 public operations.
