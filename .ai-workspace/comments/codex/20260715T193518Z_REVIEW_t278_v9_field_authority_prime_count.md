# Independent Field-Authority, Prime, And Count Review - T-278 `/9-candidate`

**Date**: 2026-07-15 19:35:18Z

**Reviewer task identity**: `/root/t278_second_prime_census_rereview`

**Review class**: focused independent authority-path, Prime, and census review

**Independence basis**: this reviewer did not author or edit the candidate
Ontology, GOALS, T-278, T-247, T-248, plan, runtime, contracts, or tests. The
six supplied hashes were verified before review. This reviewer-authored post is
the reviewer's only workspace edit.

**Verdict**: accept the exact `/9-candidate` for explicit F_H target-shape
disposition. The two field-level repairs close the prior authority omissions
without adding an atom, composition, public operation, authority, registry, or
controller. The Prime target remains 27 atomic families, seven compositions,
and 19 public operations.

## Frozen Subject

| Surface | SHA-256 |
|---|---|
| `build_tenants/abiogenesis/typescript/design/ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md` | `72595fa1c1a4243e5590bc66864f9339075ef6175f7c9c58f2f5bb277028a18c` |
| `specification/GOALS.md` | `ec8179b84529264f05f5603f08951649b6c7c5b4fc6b45920e724d5a6c8648b2` |
| `.ai-workspace/tickets/active/T-278-derive-public-control-plane-ontology-and-reprice-operation-surface.md` | `0cde2c137323357de3c9557ed78b1e3ce535db14ea0214c2b8213027b7200e8f` |
| `.ai-workspace/tickets/backlog/T-247-own-self-conformance-and-qualification-claims.md` | `1d3900f82cbb9bd6d06c1d73c4a4653bfd9a93e5abfab465b5e9b4b78f5607bf` |
| `.ai-workspace/tickets/backlog/T-248-qualify-and-release-the-5-0-artifact.md` | `ff62360f2bc24d19337d92588aa08180d4c025e345c23df781973874850354b1` |
| `.ai-workspace/comments/codex/20260715T150050Z_PLAN_abiogenesis_5_0_repriced_end_to_end.md` | `19bfb4637da1ea722ef1b5eadab6b2573c812ab199fa9181b8d0430c1f4e2221` |

## Findings

No blocking or residual target-shape finding was found.

### `QualificationLawBasis` Remains Subordinate

The new value closes an existing basis field; it does not create another
qualification authority:

- it contains only the exact method version, rule-catalog version, source refs,
  and content digests used by one qualification basis;
- its ref and digest are inputs to the existing
  `ExactCandidateQualification<basis>` identity and are conserved through the
  result vector, `AF-22` argument, and verdict;
- it has no family identity, public operation, capability, catalog entry,
  schema identity, executor, evaluator, effect, scheduler, registry, lifecycle,
  or retirement owner of its own;
- construction occurs as a subordinate typed join inside the existing qualify-
  release composition; `AF-22` only verifies exact equality and remains the
  sole verdict reducer; and
- a changed method, rule catalog, source ref, or digest creates a new owning
  qualification basis rather than a transition of `QualificationLawBasis`.

The diagrams name the value so its fields and equality path are unambiguous,
but consistently stereotype it as `<<subordinate closed value>>`. Naming the
payload does not promote it. Reuse of an identical immutable value across the
closed pre-RC, installed-RC, and final subject variants is parameter reuse
inside one qualification family, not independent semantic authority.

### Installed-RC Authorization Is Part Of The Existing Final Basis

The repaired `ExactCandidateBasis` adds only four conditional fields:

- installed-RC qualification-basis ref and digest; and
- installed-RC green-verdict ref and digest.

They accompany the existing accepted-RC ref/digest and `FinalTapDelta` only for
the closed `final_tap_candidate` variant. No `InstalledRcQualification` peer
carrier, operation, registry, transition family, addendum controller, or
second evaluator exists. The refs identify an earlier basis and verdict of the
same `ExactCandidateQualification<K>` family. `AF-25(tapped_release)` verifies
that this cited basis binds the accepted RC bytes and installed identity and
that its cited verdict is same-basis, green, and non-bypassed before publishing
the final cut.

This is referential conservation of already-admitted authorization, not reuse
of an RC cut as qualification truth and not mutation of the installed-RC
record. Delta-affected final gates still run over the prospective final basis
before publication.

### No Second Selector, Registry, Or Controller

The previous direct-vector algebra remains intact. Owning gates execute under
their existing contracts. Their complete result roster derives from the frozen
inventory bound by the exact basis, not from a qualification-owned registry or
filesystem scan. `QualificationGateResultVector<K>` structurally conserves
those results, and one declared `C.of(AF-22)` stage emits one verdict. The field
repair adds no task dispatch, batch/HOF bridge, retry loop, result
reinterpretation, release-local controller, or public callable surface.

## Reproduced Census

| Check | Result |
|---|---:|
| supplied frozen-subject hashes | 6/6 exact |
| exact Ontology source-basis digests | 30/30 exact |
| discovered behavior rows | 38/38 unique |
| atomic function families | 27/27 unique |
| atomic authority rows | 27/27 unique |
| higher-order product compositions | 7/7 unique |
| candidate public operation identities | 19/19 unique |
| retained feature rows | 17/17 unique |
| capability identities | 16/16 unique |

The atomic and authority sets remain exactly `AF-01..AF-27`. The seven
composition rows remain prepare-installed-workspace, One Surface, supervised
root convergence, interactive continuation, tune, qualify release, and publish
product. The 19-operation projection contains no qualification-law or
installed-RC-specific operation.

## Mechanical Evidence

The focused review ran from the frozen worktree:

- SHA-256 verification of all six supplied subject files passed;
- a separately authored resolver reproduced all 30 Ontology source-basis
  digests;
- section-bounded structural censuses reproduced
  `38/27/27/7/19/17/16`, all unique;
- focused searches found the installed-RC additions only as conditional fields
  on `ExactCandidateBasis` and found no peer installed-RC qualification class;
- pinned Mermaid rendering of all Ontology blocks passed `9/9`;
- GFM/Pandoc parsing of the six subject files passed `6/6`;
- DS governance passed with 19 tickets and 73 references;
- the existing Prime regression gate passed seven earlier accepted designs and
  13 candidates; as already disclosed, that gate does not inspect T-278 and is
  not used as evidence for the 27/7/19 target; and
- `git diff --check` passed.

No runtime suite was run. This is a frozen design, goal, plan, and release-
authority review; provisional runtime remains outside this acceptance.

## Implementation Guard

This acceptance depends on both additions remaining inside the existing
qualification family. Reopen the Prime census if realization gives
`QualificationLawBasis` or installed-RC authorization any independently
published schema identity, admission lifecycle, mutable current pointer,
registry, resolver, controller, semantic evaluator, public operation, or
second consumer with new semantics. Implementations must derive the gate roster
from the exact basis-bound frozen inventory and preserve the same-subject,
same-law-basis, accepted-RC, and installed-identity equality checks stated by
this candidate.

## Disposition

The focused independent review gate is satisfied for the exact `/9-candidate`.
Proceed to the explicit F_H target-shape ruling. Constitutional propagation may
then preserve this exact one-family, one-subordinate-result-vector, one-reducer,
and basis-bound installed-RC authorization relation.
