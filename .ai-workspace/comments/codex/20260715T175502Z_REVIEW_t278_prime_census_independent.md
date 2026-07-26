# T-278 Prime And Census Independent Review

- reviewer_task_identity: `/root/t278_prime_census_independent_review`
- review_class: `independent_prime_census_and_projection_review`
- independence_basis: review-only; no candidate, authority, ticket, design, or realization file was edited
- reviewed_at: `2026-07-15T17:55:02Z`
- ontology_subject_sha256: `2c08d40c1ff12abbd8252913cefc610255ad9e9b52ac0d7ea66cca480eb383ec`
- goals_subject_sha256: `b19ea272722a1a0653d7d1b903fc2791e7e2caf3b63c16a78af5cb9fc01d9e6e`
- t278_subject_sha256: `055fa3e52e202fdafb6ae432de2a27f3935ea500c66c46084c971c18a8cb3d05`
- t247_subject_sha256: `ba0542d8edf4d04f914d8892033e8db546328f00ed1622539507bcfb742b6643`
- t248_subject_sha256: `f954ce032bae2dd4d3c7ff9e3491a4fbb8c33a2cacf617a59c96ea73927b6d8a`

## Findings

### P1 - Qualification-verdict reduction is not expressed by the closed algebra

The repaired release cycle introduces one necessary
`ExactCandidateQualification<K>` carrier family and correctly keeps basis and
verdict as separately addressable projections. The construction path is not
yet closed, however. The Ontology says the public control plane invents no
composition engine and uses the accepted GTL `C` family
(`ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md:1171-1183`), but the qualification
composition then uses an unqualified `fold` to turn mandatory-gate outcomes
into a same-basis `green | red | blocked` verdict
(`ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md:1074,1194,1371`). The closed GTL
generator set is exactly `C.of`, `C.id`, `C.compose`, `C.edge`, `workflow.C`,
`C.batch`, and `C.retry`; `C.batch` preserves each task judgment rather than
collapsing them (`REQ-L-GTL3-C-ALGEBRA.md:41-46,84-93`).

The verdict controls AF-25 admission, so this is semantic reduction, not only
serialization or digest projection. As written, its evaluator, verifier, and
admitter are absent from the 27 authority rows. Calling the reduction
subordinate does not remove that authority boundary.

Repair it without growing the census: make the reduction a declared
`AF-22 evaluateConformance(exact_candidate_qualification, ...)` application,
represented as a typed `C.of` leaf after the gate batch. It consumes the exact
basis and admitted owning outcomes, checks completeness, same-basis identity,
and the closed bypass rule, and emits the verdict without recomputing any
owning semantic result. This keeps one qualification carrier family, 27 atoms,
seven compositions, and 19 public operations.

### P1 - The tapped-release AF-25 variant omits the required final-delta gate

The pre-RC cycle is fixed: T-247 produces an exact basis and verdict without a
cut or snapshot, and T-248 uses those inputs to materialize an immutable RC.
The final-tap path is still underdeclared. T-248 allows a final
version/release-asset delta and then invokes AF-25/AF-26
(`T-248:67-76,105-113`), while `REQ-P-QUAL-070` requires every deterministic,
install, identity, and bounded-behavior gate affected by that delta to rerun
before publication (`REQ-P-QUAL.md:283-287`). The current AF-25 signature and
public operation projection bind only basis, verdict, and release identity
(`ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md:1146,1233,1436`). The later
source-blind installed-Product addendum cannot satisfy a pre-publication gate.

Repair this as a closed AF-25 input variant, not another atom or operation. The
`tapped_release` variant must bind the accepted RC, its installed-RC
qualification verdict, the allowed final delta, exact post-delta artifacts and
manifests, and the affected pre-publication gate outcomes. AF-26 must consume
those exact AF-25-bound artifacts. The `published_rc` variant remains the
current exact-basis plus same-basis-verdict path.

## Accepted Parts

- All 30 exact-basis digests match their current source files.
- The behavior census is exactly 38 unique rows.
- The atomic census is exactly 27 unique AF rows and 27 matching authority
  rows; the composition census is exactly seven.
- The public projection is exactly 19 unique operation identities; retained
  feature and capability coverage is exactly 17 and 16 rows respectively.
- `ExactCandidateQualification<K>` passes the carrier Promotion Test. Its exact
  content-addressed subject is reused across T-247, AF-25, and T-248, and its
  basis and verdict require stable addressable projections. It does not itself
  require another public operation or separately authored basis/verdict models.
- The workspace-binding repair is lawful. Aggregate `0..1` is only the
  projection of a discriminated invocation sum; every concrete definition
  variant closes binding cardinality to `forbidden | exactly_one`, pre-binding
  variants forbid it, and workspace/execution variants require it. Observation
  freshness neither creates a binding nor creates a basis fork.
- One Surface remains program-owned and ABG-interpreted. Public ingress only
  admits and transports; AF-11 through AF-17 remain distinct authorities.
- AF-03 preserves one closed source/projection relation; the 19-operation
  contraction does not turn projections into lifecycle or closure authority.
- The no-compatibility hard break is consistent with STDO core-interface
  migration law. Non-derived 36-roster identities are retired rather than kept
  as aliases or a second register.
- Both findings fit existing AF-22/AF-25 boundaries. They hold acceptance of the
  current subject but do not require changing the proposed 27/7/19 counts.

## Verification

I independently ran and inspected:

- SHA-256 verification of the Ontology's 30 exact-basis sources: `30/30`;
- table extraction and uniqueness checks: `38` behaviors, `27` AF rows, `27`
  authority rows, `7` compositions, `19` operations, `17` features, and `16`
  capabilities;
- `npm run check:design-mermaid`: passed, `30` files and `90` diagrams; the
  Ontology itself contains `8` Mermaid views;
- `npm run check:ds-governance`: passed, `19` tickets and `73` comment refs;
- `npm run check:prime-contraction`: passed for its earlier seven governed
  designs only and was not treated as evidence for T-278;
- Pandoc GFM parse of the Ontology: passed; and
- `git diff --check`: passed.

No runtime tests were run because this was a frozen design/authority review.
A second reviewer artifact became visible during this review and corroborates
both findings; it was treated as commentary, not as authority or a substitute
for the independent reproductions above.

## Verdict

`reject_pending_bounded_af22_verdict_and_af25_tapped_variant_repairs`

Do not ratify the frozen T-278 subject. Keep the 27-atom, seven-composition, and
19-operation target provisionally intact, apply the two bounded repairs above,
recompute the five subject digests, and independently review only that delta.
