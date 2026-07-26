# Independent Prime And Census Re-Review - T-278 Second Repair

**Date**: 2026-07-15 18:20:26Z

**Reviewer task identity**: `/root/t278_second_prime_census_rereview`

**Review class**: independent adversarial design review

**Independence basis**: this reviewer was spawned against the frozen subject
below after the candidate repair. It did not author or edit any candidate,
authority, ticket, plan, design, requirement, or runtime surface. The only
workspace edit made by this reviewer is this reviewer-authored post.

**Verdict**: reject the frozen T-278 target pending one bounded typed-batch and
fan-in repair; the reproduced 27-atom, seven-composition, and 19-operation
counts remain provisionally intact but are not accepted by this review

## Frozen Subject

| Surface | SHA-256 |
|---|---|
| `build_tenants/abiogenesis/typescript/design/ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md` | `1f84580d5a79fa94f0c8ee7be9caf87afab8eeae34c067f92830abf32ae26fcd` |
| `specification/GOALS.md` | `b63011a99cfd08cfc6389bbc224456a9ae95d4735b119ebfa903282df176d059` |
| `.ai-workspace/tickets/active/T-278-derive-public-control-plane-ontology-and-reprice-operation-surface.md` | `797a0a27c07c453c4353cc5f8432c6f9a579f3aaf33011b961591146890f8c6d` |
| `.ai-workspace/tickets/backlog/T-247-own-self-conformance-and-qualification-claims.md` | `a2cba122e578d6535aa19ae2247e073c48c490a80e70dad08e97c3bfbdfc7236` |
| `.ai-workspace/tickets/backlog/T-248-qualify-and-release-the-5-0-artifact.md` | `e1c4f7a8f27a74d327a9bb29223b1f39757bb3bc1550e58d5a09554b27295dcc` |
| `.ai-workspace/comments/codex/20260715T150050Z_PLAN_abiogenesis_5_0_repriced_end_to_end.md` | `440905a26deaa5c9d1006d913d574f9b24383a784041090cd3de600433e754c3` |

## Findings

### P1 - The qualification batch still has no lawful typed reduction boundary

The repaired composition says:

```text
C.batch(mandatory gate programs)
  -> C.of(AF-22 exact_candidate_qualification total reducer)
```

and correctly says that `C.batch` preserves every gate result and never
aggregates them. That preservation law makes the next arrow underdeclared.
`REQ-L-GTL3-C-ALGEBRA-007` requires every batch task to declare the same input
carrier, output carrier, and per-task result cardinality. The candidate names
none of those three facts for the mandatory gate family. It also names no
admitted complete-vector or `fan_in` relation that converts the independently
preserved task results into the single reducer input consumed by the exact-
candidate `AF-22` variant.

The defect appears in the governing composition at
`ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md:1219`, in the T-247 contract at
`T-247-own-self-conformance-and-qualification-claims.md:82`, and in the final-
delta path at `T-248-qualify-and-release-the-5-0-artifact.md:72`. The detailed
plan's unqualified "owning-proof fold" at
`20260715T150050Z_PLAN_abiogenesis_5_0_repriced_end_to_end.md:320` preserves the
same ambiguity.

As written, either:

- the batch is heterogeneous and violates the required common carrier and
  cardinality relation;
- the parent batch grouping is being treated as an aggregate result, which
  `C-ALGEBRA-007` forbids; or
- an unnamed aggregation step is supplying `AF-22`, recreating the undeclared
  fold under different prose.

This is a design/type discontinuity, not an implementation detail. It blocks
acceptance because the product is LLM-first and this exact relation must be
compiler-checkable rather than inferred by an implementer.

### Required Bounded Repair

The qualify-release composition must declare:

1. the exact shared input carrier, output carrier, and per-task cardinality for
   the non-empty ordered mandatory-gate task family;
2. stable ordinal and exact qualification-basis conservation on every result;
3. the admitted complete-result-vector boundary; and
4. the existing typed `fan_in` application, or another already-declared typed
   relation, by which the exact-candidate `AF-22` reducer consumes that complete
   vector once.

If the current algebra cannot express that path, the design must retain a
typed gap rather than infer an aggregate from `batchRef` or add a hidden fold.
The likely lawful repair uses the existing HOF and `AF-22` families and should
add no new C generator, semantic atom, product composition, or public
operation. That no-count-change conclusion must be rechecked after the exact
carrier relation is written; it cannot be assumed in advance.

## Accepted Parts

Subject to the blocking relation above, the remainder of the second repair is
internally coherent:

- `ExactCandidateQualification<K>` is one content-addressed Prime contract
  family with closed basis and verdict projections. Repository search found no
  separately authored implementation models for those projections.
- `FinalTapDelta` is a subordinate closed value owned by the final basis. It
  has no independent effect, public operation, or publication lifecycle.
- Pre-RC qualification basis/verdict, immutable RC or tapped `ReleaseCut`,
  `ReleaseSnapshotManifest`, tapped `Product`, and installed-product addenda
  remain distinct. Snapshot output no longer qualifies its own cut, and the
  prospective final bytes are gated before publication.
- Workspace-binding cardinality is a definition-indexed closed relation:
  `forbidden | exactly_one`. Aggregate `0..1` is only the discriminated-union
  projection; pre-binding variants cannot carry a binding and workspace- or
  execution-scoped variants cannot omit one.
- Public ingress admits and transports. The admitted GTL program owns One
  Surface composition and ABG interprets it. No ingress controller reappears.
- The hard break is explicit. The 36 discovered identities are behavior
  inputs, not compatibility authority, and no legacy facade is retained.

## Reproduced Census

The structural census over the exact frozen Ontology produced:

| Check | Result |
|---|---:|
| exact source-basis digests | 30/30 |
| discovered behavior rows | 38/38 unique |
| atomic families | 27/27 unique |
| authority rows | 27/27 unique |
| higher-order product compositions | 7/7 unique |
| candidate public operation identities | 19/19 unique |
| retained feature rows | 17/17 unique |
| capability identities | 16/16 unique |

These are exact table counts, not evidence that the missing carrier relation is
lawful. The 27/7/19 target therefore remains a plausible Prime result, not an
accepted result.

## Mechanical Evidence

The review ran the following checks from the repository root:

- `shasum -a 256` over all six frozen subject surfaces: all supplied subject
  digests matched;
- a Node SHA-256 check resolving all 30 Ontology exact-basis rows to their live
  source files: `30/30` matched;
- a section-bounded Node census over the atomic, authority, discovered-
  behavior, composition, public-operation, retained-feature, and capability
  tables: `27/27/38/7/19/17/16`, all unique;
- pinned `mmdc 11.3.0` render of every Ontology Mermaid block in a temporary
  directory: `8/8` rendered;
- Pandoc GFM parse of the Ontology, GOALS, T-278, T-247, T-248, and detailed
  plan: `6/6` passed;
- `npm run check:ds-governance`: 19 tickets and 73 references, passed;
- `node test_env/gates/prime_contraction_gate.mjs`: seven earlier accepted
  designs and 13 candidates, passed, with the existing stated caveat that this
  gate does not inspect T-278; and
- `git diff --check`: passed.

No runtime tests were run because this is an exact frozen design and authority-
path review. No candidate file was edited.

## Disposition

Do not record F_H acceptance of this frozen T-278 subject and do not resume
runtime or constitutional propagation. Apply only the bounded typed-batch and
result-vector/reducer repair, recompute the affected frozen digests and
censuses, and obtain fresh reviewer-authored acceptance over that exact
subject. If the repair uses only the already-declared HOF, `C.batch`, and
`AF-22` relations, the 27 atoms, seven compositions, and 19 public operations
can remain unchanged.
