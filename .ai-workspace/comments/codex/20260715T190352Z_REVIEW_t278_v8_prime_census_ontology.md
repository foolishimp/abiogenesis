# Independent Prime, Census, And Ontology Review - T-278 `/8-candidate`

**Date**: 2026-07-15 19:03:52Z

**Reviewer task identity**: `/root/t278_second_prime_census_rereview`

**Review class**: independent adversarial design review

**Independence basis**: this reviewer received the frozen `/8-candidate` only
after its repair. It did not author or edit the candidate, plan, GOALS, ticket,
requirement, code, or test surfaces. This reviewer-authored post is its only
workspace edit.

**Verdict**: accept the `/8-candidate` for explicit F_H target-shape
disposition; no blocking design or Prime finding remains

## Frozen Subject

| Surface | SHA-256 |
|---|---|
| `build_tenants/abiogenesis/typescript/design/ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md` | `c669e8d7f5c4591c90edd56a318989f4e9598461a8b2b0d14fe3a16b7108f4d0` |
| `specification/GOALS.md` | `3048889924574e3396226ed4d98788f7aad9f4296bd60766d9b46c9d06c326db` |
| `.ai-workspace/tickets/active/T-278-derive-public-control-plane-ontology-and-reprice-operation-surface.md` | `94820d345a520d7a67d2b190a8820c77a1414bb46b3e54896d0191dcba33bee0` |
| `.ai-workspace/tickets/backlog/T-247-own-self-conformance-and-qualification-claims.md` | `7a7b7b77e8ede5aa52f8bd7815e67b8365e41eea9795071d6fba3181a3761d96` |
| `.ai-workspace/tickets/backlog/T-248-qualify-and-release-the-5-0-artifact.md` | `25dd786b3692204060c8932f388f2903e9be33397429a58d6aef187de22bd7c4` |
| `.ai-workspace/comments/codex/20260715T150050Z_PLAN_abiogenesis_5_0_repriced_end_to_end.md` | `3f4c34ee1896571d9906305af6c4f85de5440c8c52ffb5972378bd2e2f9864ee` |

## Findings

No blocking or residual product-shape finding was found.

The prior P1 is closed rather than renamed. The `/8-candidate` no longer uses
`C.batch`, `fan_out`, or `fan_in` to schedule or aggregate heterogeneous
qualification gates. Each owning gate executes under its existing contract and
retains its semantic result authority. The qualification path begins from
those already-admitted results, admits one closed input carrier, and invokes
one `C.of(AF-22 exact_candidate_qualification)` stage with result cardinality
exactly one.

### `QualificationGateResultVector<K>` Prime Disposition

The vector is lawfully subordinate to `ExactCandidateQualification<K>`, not a
new peer Prime authority:

- it has no public operation, capability, catalog identity, semantic evaluator,
  scheduler, effect, or independent retirement owner;
- its roster derives from the exact basis-bound frozen qualification inventory
  rather than from a vector-owned list or second registry;
- its rows cite the owning gate identities, assessment refs/digests, typed
  dispositions, evidence, bypass truth, stable ordinals, and exact basis
  without recomputing any result;
- its structural admission is the exact input-admission boundary of the one
  qualification family and checks only roster/envelope/basis/digest integrity;
  and
- its only semantic consumer is the existing `AF-22` qualification variant,
  which emits the family verdict once.

The `vectorDigest` makes the exact input set content-addressable; it does not
give the vector independent semantic authority. Pre-RC, installed-RC, and final
qualification reuse are closed subject variants of the same family, not
cross-module semantic reuse requiring promotion.

This classification has a sharp implementation guard. A separate vector
registry, independently published schema identity, filesystem-discovered gate
roster, local scheduler, gate-result reinterpretation, or second consumer would
fail the Promotion Test and reopen the Prime census. The candidate explicitly
forbids each of those paths.

### No Hidden Algebra Or Controller

The release owner in the sequence invokes or cites existing owning gate
contracts. It does not select graph work, dispatch a qualification-specific
task family, retry gates, create C-call spines, or synthesize a result vector
from filesystem observations. Structural admission verifies a proposed typed
carrier; `AF-22` alone decides the total qualification disposition. Therefore:

- no undeclared C generator exists;
- no direct-batch result is relabeled as a vector;
- no HOF relation or `fan_in` reducer is implied;
- no `batchRef` becomes result or closure authority; and
- no release-local runtime controller is introduced.

### Prior Repairs Remain Valid

- `WorkspaceBinding` cardinality remains definition- and variant-indexed as
  `forbidden | exactly_one`; aggregate `0..1` is only the discriminated-union
  projection.
- Stable workspace authority/binding and mutable observation remain distinct,
  so ordinary progress cannot manufacture `basis_fork_detected`.
- Public ingress admits and transports; the admitted GTL program owns One
  Surface composition and ABG interprets it.
- Pre-RC basis/verdict, immutable RC or tapped `ReleaseCut`,
  `ReleaseSnapshotManifest`, tapped `Product`, and installed-product addenda
  remain distinct and acyclic.
- `FinalTapDelta` remains subordinate and prospective final bytes pass the
  affected gates before `AF-25(tapped_release)`.
- The STDO hard break remains explicit; no exact-36 compatibility facade or
  parallel operation register survives.

## Reproduced Census

| Check | Result |
|---|---:|
| exact source-basis digests | 30/30 |
| discovered behavior rows | 38/38 unique |
| atomic function families | 27/27 unique |
| atomic authority rows | 27/27 unique |
| higher-order product compositions | 7/7 unique |
| candidate public operation identities | 19/19 unique |
| retained feature rows | 17/17 unique |
| capability identities | 16/16 unique |

`QualificationGateResultVector<K>` adds no semantic function. Its admission is
a subordinate typed join inside the existing qualify-release composition;
`AF-22` remains the only verdict reducer. The target therefore remains exactly
27 atomic families, seven compositions, and 19 public operations.

## Mechanical Evidence

The review ran from the frozen worktree:

- `shasum -a 256` over all six supplied subject surfaces: all exact digests
  matched;
- a Node SHA-256 resolver over every Ontology exact-basis row: `30/30` matched;
- a section-bounded structural census: `38/27/27/7/19/17/16`, all unique;
- repository search for `QualificationGateResultVector` outside commentary:
  only the Ontology, GOALS, T-247, and T-278 target surfaces contain it; no
  runtime, contract, generated asset, or test implementation has pre-empted
  the accepted design boundary;
- repository search for qualification-specific `C.batch`, `fan_out`, and
  `fan_in`: remaining mentions are historical rejection or explicit
  prohibition, not target composition;
- pinned `mmdc 11.3.0` rendering of all Ontology Mermaid blocks in a temporary
  directory: `9/9` rendered;
- Pandoc GFM parse of the Ontology, GOALS, T-278, T-247, T-248, and detailed
  plan: `6/6` passed;
- `npm run check:ds-governance`: 19 tickets and 73 references, passed;
- `node test_env/gates/prime_contraction_gate.mjs`: seven earlier accepted
  designs and 13 candidates, passed, with the stated caveat that this existing
  regression gate does not itself inspect T-278; and
- `git diff --check`: passed.

No runtime tests were run. This is a frozen design, authority-path, and Prime
review, and runtime remains intentionally fenced until F_H disposition.

## Disposition

The independent design gate is satisfied for this exact `/8-candidate`.
Proceed to the explicit F_H ruling on the four linked T-278 target claims. If
accepted, constitutional propagation must preserve this exact one-family,
one-subordinate-input, one-reducer relation; implementation remains prohibited
from adding a qualification-local scheduler, registry, HOF/batch path, second
evaluator, or public vector identity.
