# Self-Review - T-278 Fourth Bounded Authority-Binding Repair

**Date**: 2026-07-15 19:26:25Z

**Reviewer**: Codex pen-holder `/root`

**Review class**: authority-first self-review; not independent acceptance

**Verdict**: repaired candidate ready for one focused reviewer-authored
authority review; runtime and constitutional propagation remain frozen

## Frozen Subject

| Surface | SHA-256 |
|---|---|
| `build_tenants/abiogenesis/typescript/design/ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md` | `72595fa1c1a4243e5590bc66864f9339075ef6175f7c9c58f2f5bb277028a18c` |
| `specification/GOALS.md` | `ec8179b84529264f05f5603f08951649b6c7c5b4fc6b45920e724d5a6c8648b2` |
| `.ai-workspace/tickets/active/T-278-derive-public-control-plane-ontology-and-reprice-operation-surface.md` | `0cde2c137323357de3c9557ed78b1e3ce535db14ea0214c2b8213027b7200e8f` |
| `.ai-workspace/tickets/backlog/T-247-own-self-conformance-and-qualification-claims.md` | `1d3900f82cbb9bd6d06c1d73c4a4653bfd9a93e5abfab465b5e9b4b78f5607bf` |
| `.ai-workspace/tickets/backlog/T-248-qualify-and-release-the-5-0-artifact.md` | `ff62360f2bc24d19337d92588aa08180d4c025e345c23df781973874850354b1` |
| `.ai-workspace/comments/codex/20260715T150050Z_PLAN_abiogenesis_5_0_repriced_end_to_end.md` | `19bfb4637da1ea722ef1b5eadab6b2573c812ab199fa9181b8d0430c1f4e2221` |

## Review Intake

The `/8-candidate` Prime review accepted the direct
`QualificationGateResultVector<K> -> C.of(AF-22)` algebra and independently
reproduced 27 atomic families, seven compositions, and 19 public operations.
The parallel release-authority review accepted the same repair and found two
remaining field-level authority omissions:

1. `ExactCandidateQualification<basis>` did not content-address the exact
   specification-method, rule-catalog, and source basis required by
   `REQ-P-SELF-CONFORMANCE-001/010` and `REQ-P-QUAL-060`; and
2. `final_tap_candidate` did not bind the distinct installed-RC qualification
   basis and green non-bypassed verdict required by `REQ-P-QUAL-068` and T-248
   to authorize prospective-final derivation.

Both are reachable release-truth defects. Neither requires another semantic
function, composition, public operation, or runtime mechanism.

## Bounded Repair

One subordinate `QualificationLawBasis` value now contains the exact method
version, applicable rule-catalog version, source refs, and content digests used
to decide a qualification run. Its ref and digest content-address the
`ExactCandidateQualification<basis>` and must match the result vector, the
`AF-22` argument, every admitted owning assessment, and the emitted verdict.
Any changed method, catalog, source ref, or content digest creates a new
qualification basis. The value has no independent evaluator, lifecycle,
registry, schema identity, or public operation.

A `final_tap_candidate` basis now additionally binds:

- the accepted RC ref and digest;
- the exact installed-RC qualification basis ref and digest;
- its same-basis green non-bypassed verdict ref and digest; and
- the permitted `FinalTapDelta`.

The installed-RC basis must identify the exact RC bytes and installed identity
named by the accepted lineage. `AF-25(tapped_release)` verifies this complete
chain before it may materialize the tapped cut. The final result vector still
contains only the final-basis, delta-affected owning results; accepted
installed-RC qualification is conserved by exact reference rather than rerun
or inferred from the earlier RC cut.

## Lawfulness, Prime, And Proportionality

- `QualificationLawBasis` is subordinate to the existing Prime qualification
  family; it cannot act, evaluate, schedule, or publish.
- Installed-RC authorization extends the existing final basis. It does not add
  an addendum controller or another release state authority.
- Owning gates retain their semantic contracts. Structural admission checks
  subject/law-basis equality, roster, order, identity, digest, disposition, and
  bypass truth only.
- The accepted direct `C.of(AF-22)` path remains unchanged. No `C.batch`, HOF
  bridge, dispatcher, filesystem scan, selector, or second checker returns.
- The trusted-developer-desktop boundary remains unchanged. The repair defends
  malformed, stale, cross-basis, or cross-RC release input, not hostile local
  tampering.
- The counts remain 27 atomic families, seven compositions, and 19 public
  operations because both additions are fields/subordinate values on the
  existing qualification and release composition.

## Mechanical Evidence

| Check | Result |
|---|---:|
| exact source-basis digests | 30/30 |
| discovered behavior rows | 38 |
| atomic families / authority rows | 27/27 unique and equal |
| higher-order compositions | 7 |
| public operation identities | 19 unique |
| retained feature rows | 17 unique |
| capability identities | 16 unique |
| Ontology Mermaid renders | 9/9 with Mermaid 11.3.0 |
| registered design Mermaid gate | pass |
| `git diff --check` | pass |

No runtime suite was run because this checkpoint changes design, plan, release
ticket, and commentary surfaces only. The provisional T-270/T-272 runtime wave
remains frozen.

## Focused Independent Gate

The next reviewer must bind the exact hashes above and verify only that:

1. the subject basis, result vector, `AF-22` argument, and verdict conserve one
   exact `QualificationLawBasis`;
2. prospective-final truth binds a green, non-bypassed installed-RC
   qualification over the exact accepted RC bytes and installed identity;
3. `AF-25(tapped_release)` verifies that lineage before publication;
4. no second evaluator, controller, registry, scheduler, or public identity was
   introduced; and
5. the 27/7/19 Prime counts remain unchanged.

Only reviewer-authored acceptance permits the explicit F_H target-shape
disposition. This self-review does not ratify the candidate.
