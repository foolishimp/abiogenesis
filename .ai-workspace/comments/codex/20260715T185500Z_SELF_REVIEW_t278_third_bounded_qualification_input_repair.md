# Self-Review - T-278 Third Bounded Qualification-Input Repair

**Date**: 2026-07-15 18:55:00Z

**Reviewer**: Codex pen-holder `/root`

**Review class**: authority-first self-review; not independent acceptance

**Verdict**: repaired candidate ready for reviewer-authored independent review;
runtime and constitutional propagation remain frozen

## Subject

| Surface | SHA-256 |
|---|---|
| `build_tenants/abiogenesis/typescript/design/ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md` | `c669e8d7f5c4591c90edd56a318989f4e9598461a8b2b0d14fe3a16b7108f4d0` |
| `specification/GOALS.md` | `3048889924574e3396226ed4d98788f7aad9f4296bd60766d9b46c9d06c326db` |
| `.ai-workspace/tickets/active/T-278-derive-public-control-plane-ontology-and-reprice-operation-surface.md` | `94820d345a520d7a67d2b190a8820c77a1414bb46b3e54896d0191dcba33bee0` |
| `.ai-workspace/tickets/backlog/T-247-own-self-conformance-and-qualification-claims.md` | `7a7b7b77e8ede5aa52f8bd7815e67b8365e41eea9795071d6fba3181a3761d96` |
| `.ai-workspace/tickets/backlog/T-248-qualify-and-release-the-5-0-artifact.md` | `25dd786b3692204060c8932f388f2903e9be33397429a58d6aef187de22bd7c4` |
| `.ai-workspace/comments/codex/20260715T150050Z_PLAN_abiogenesis_5_0_repriced_end_to_end.md` | `3f4c34ee1896571d9906305af6c4f85de5440c8c52ffb5972378bd2e2f9864ee` |

## Finding

The two independent reviews of the second repaired subject accepted the
release cycle, final-tap ordering, binding cardinality, identity law, and
27/7/19 viability. Both rejected one remaining carrier discontinuity:
qualification-specific `C.batch(mandatory gate programs)` declared neither the
common task input/output and per-task cardinality required by
`C-ALGEBRA-007` nor a lawful complete-vector boundary into `AF-22`.

The direct runtime path confirms this is not a prose-only omission:

- direct `C.batch` returns `CBatchCompletedResolution`, not an admitted HOF
  vector;
- existing typed `fan_in` consumes only a complete `HofVectorCarrier`;
- HOF `fan_out` applies one fixed child GraphFunction to every vector member;
  heterogeneous gate execution would therefore require a generic dispatcher
  or second selector; and
- the complete-program batch receipt contains opaque result refs, so adapting
  it into qualification truth would require a new runtime relation.

## Bounded Repair

Qualification no longer schedules heterogeneous owning gates through
`C.batch`, `fan_out`, `fan_in`, a release-local controller, or a filesystem
scan. Each owning gate executes under its existing contract and retains
semantic authority.

One subordinate `QualificationGateResultVector<K>` is the complete typed input
to `C.of(AF-22 evaluateConformance(exact_candidate_qualification, ...))`. It
contains:

- the exact `ExactCandidateQualification<basis>` projection and digest;
- frozen-inventory ref and digest;
- exact vector digest; and
- a non-empty ordered citation family whose members preserve contiguous
  zero-based ordinal, unique gate identity, same basis ref/digest, owning
  assessment ref/digest, typed `green | red | blocked` disposition, evidence
  refs/digests, and bypass refs.

Structural admission checks only exact inventory-roster completeness, basis
conservation, ordinals, uniqueness, type, resolvable digests, bypass truth, and
vector identity. It cannot rerun or reinterpret an owning gate. Missing,
duplicate, reordered, stale, malformed, conflicting, or cross-basis citations
refuse before reduction and emit no verdict. `C.of(AF-22)` consumes the
admitted carrier once and emits exactly one same-basis verdict. `AF-25` still
requires that verdict to be green and non-bypassed.

The final-tap path uses the same carrier over only the basis-bound affected
gate inventory after the prospective final bytes and permitted
`FinalTapDelta` exist. Publication remains after qualification.

## Prime And Proportionality Review

The rejected normalized-batch alternative would have added a batch-to-vector
runtime bridge or generic gate-dispatch authority solely for release
qualification. No current product or requirement demands ABG-scheduled
parallel qualification, and T-247 requires aggregation of owning proof truth
rather than a second release-wide harness.

The selected carrier reuses the existing arbitrary typed `C.of` input/output
relation and `AF-22` atom. It adds no C generator, HOF runtime, scheduler,
selector, semantic checker, composition, or public operation. The estimated
rabbit-hole probability was approximately 75 percent for the batch/HOF bridge
and 20 percent for the direct typed carrier; the remaining risk is bounded to
preventing structural admission from becoming a second semantic evaluator.

This is proportional to one trusted developer desktop. It defends the likely
failure boundary, malformed or inconsistent qualification input, without
adding hostile-workstation tamper, signing, remote-attestation, or concurrent
scheduling machinery.

## Mechanical Evidence

| Check | Result |
|---|---:|
| exact source-basis digests | 30/30 |
| discovered behavior rows | 38 |
| atomic families / authority rows | 27/27 unique |
| higher-order compositions | 7 |
| public operation identities | 19 unique |
| retained feature rows | 17 unique |
| capability identities | 16 unique |
| Ontology Mermaid renders | 9/9 with Mermaid 11.3.0 |
| registered design Mermaid gate | 30 files, 90 diagrams, pass |
| DS governance regression | 19 tickets, 73 refs, pass |
| existing Prime regression | pass; T-278 is not selected by this gate and the result is not evidence for its Prime target |
| GFM/Pandoc parse | pass for Ontology, GOALS, T-278, T-247, T-248, and plan |
| `git diff --check` | pass |

The structural census was recomputed from the exact subject. No runtime suite
was run because this checkpoint changes design, plan, release-ticket, and
commentary surfaces only. The provisional T-270/T-272 runtime wave remains
frozen.

## Next Gate

Fresh independent reviewers must bind the exact subject digests above and
verify:

1. `QualificationGateResultVector<K>` is one subordinate typed carrier rather
   than a second gate registry or evaluator;
2. `C.of(AF-22)` has a declared arbitrary input/output relation and result
   cardinality one;
3. owning proof semantics remain with their gates;
4. no hidden batch-to-vector, HOF, selector, scheduler, or filesystem mechanism
   remains;
5. pre-RC and final-tap ordering remain acyclic; and
6. 27 atoms, seven compositions, and 19 public operations remain Prime-valid.

Only accepting reviewer-authored evidence permits the explicit F_H
target-shape disposition.
