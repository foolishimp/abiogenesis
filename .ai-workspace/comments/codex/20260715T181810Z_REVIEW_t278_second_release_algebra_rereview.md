# Review - T-278 Second Release And Algebra Re-Review

**Date**: 2026-07-15 18:18:10Z

**Reviewer task identity**: `/root/t278_second_release_algebra_rereview`

**Review class**: independent authority-path and release-algebra review

**Independence basis**: the reviewer made no change to the candidate Ontology,
GOALS, T-278, T-247, T-248, or plan. Conclusions and mechanical counts were
reproduced from the frozen subject. This post is the reviewer's only edit.

**Verdict**: reject the exact target pending one bounded `C.batch` type-contract
repair. The release-lifecycle and workspace-binding repairs are accepted in
substance. The 27/7/19 counts remain viable and need not grow.

## Frozen Subject

| Surface | SHA-256 |
|---|---|
| `build_tenants/abiogenesis/typescript/design/ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md` | `1f84580d5a79fa94f0c8ee7be9caf87afab8eeae34c067f92830abf32ae26fcd` |
| `specification/GOALS.md` | `b63011a99cfd08cfc6389bbc224456a9ae95d4735b119ebfa903282df176d059` |
| `.ai-workspace/tickets/active/T-278-derive-public-control-plane-ontology-and-reprice-operation-surface.md` | `797a0a27c07c453c4353cc5f8432c6f9a579f3aaf33011b961591146890f8c6d` |
| `.ai-workspace/tickets/backlog/T-247-own-self-conformance-and-qualification-claims.md` | `a2cba122e578d6535aa19ae2247e073c48c490a80e70dad08e97c3bfbdfc7236` |
| `.ai-workspace/tickets/backlog/T-248-qualify-and-release-the-5-0-artifact.md` | `e1c4f7a8f27a74d327a9bb29223b1f39757bb3bc1550e58d5a09554b27295dcc` |
| `.ai-workspace/comments/codex/20260715T150050Z_PLAN_abiogenesis_5_0_repriced_end_to_end.md` | `440905a26deaa5c9d1006d913d574f9b24383a784041090cd3de600433e754c3` |

Governing law was read directly from upstream `RELEASE_METHOD.md`,
`REQ-P-QUAL-050..070`, and `REQ-L-GTL3-C-ALGEBRA-001..007`.

## Findings

### 1. P1 - The qualification `C.batch` task family is not yet well typed

`REQ-L-GTL3-C-ALGEBRA-007` permits `C.batch` only for a non-empty ordered task
family whose members share one input carrier, one output carrier, and one
per-task result cardinality. It also states that batch preserves each task's
own C-call and judgment and never creates a synthetic aggregate call.

The repaired target correctly says that `C.batch` does not aggregate and that
the verdict is emitted only by the explicit
`C.of(AF-22 evaluateConformance(exact_candidate_qualification, ...))` leaf.
However, the target names only `C.batch(mandatory gate programs)`. It does not
declare the common input carrier, common output carrier, or one-result-per-task
cardinality for the heterogeneous build, lint, test, conformance, install,
identity, and bounded-behavior gates. Ordered results alone do not satisfy the
batch constructor's type law.

Evidence:

- `REQ-L-GTL3-C-ALGEBRA.md:84-93` defines the homogeneous task contract and
  non-aggregation law.
- `ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md:1098` and `:1219` use
  `C.batch(mandatory gate programs)` without declaring those three common type
  dimensions.
- `T-247:82-88` and `T-248:72-77` preserve the same underdeclared task family.

Bounded repair:

1. Declare one closed qualification-task relation with an exact common input,
   exact common output, and cardinality one per task, for example
   `C<ExactCandidateQualificationBasis, QualificationGateResult>`, where each
   result preserves its owning proof identity, gate kind, basis digest,
   disposition, and evidence refs; or
2. Remove `C.batch` from this composition and pass an already admitted ordered
   result family structurally into the declared `C.of(AF-22)` reducer.

The repair must not reinterpret owning gate verdicts or create a synthetic
qualification call. A normalized subordinate task/result carrier does not by
itself add an atomic semantic function, higher-order composition, or public
operation, so this finding does not require changing 27/7/19.

### 2. P2 - Residual `fold` wording can reintroduce the rejected reading

The authoritative function and composition rows explicitly bind verdict
reduction to `C.of(AF-22)`, so this is not a second blocking algebra defect.
Three read-model labels remain misleading:

- `ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md:770` says assessments are
  `folded_into` the verdict;
- the plan at `:162` says T-247 "binds and folds" a basis; and
- the plan at `:320` requests an owning-proof "fold".

At the bounded repair, rename the relationship to an AF-22-specific reduction
and make both plan rows say that ordered admitted results enter the declared
`C.of(AF-22)` total reducer. This prevents a future realization from treating
the former generic fold as still authorized.

## Accepted Parts

1. **The pre-RC cycle is absent.** T-247 creates a content-addressed
   qualification basis and same-basis verdict but no `ReleaseCut` or
   `ReleaseSnapshotManifest`. `AF-25(published_rc)` consumes that green,
   non-bypassed verdict and only then materializes the immutable RC cut and
   snapshot. This matches `RELEASE_METHOD`'s passed qualification bundle before
   RC publication and `REQ-P-QUAL-050..057`'s release-snapshot versus exact
   pre-RC-candidate distinction.
2. **The final-tap order is lawful.** The latest installed RC qualifies first;
   a closed subordinate `FinalTapDelta` permits only assigned final version and
   reconciled release assets; prospective final bytes receive a new exact basis;
   all affected deterministic, install, identity, and bounded-behavior gates
   run before `AF-25(tapped_release)` and `AF-26`. An invalid delta reopens the
   RC window. This satisfies `REQ-P-QUAL-068..070`.
3. **Release identities remain distinct.** Source project, qualification
   basis/verdict, published RC, release snapshot, tapped cut, Product, artifact,
   and installed Product are not relabeled into one another. Cut/snapshot output
   cannot qualify its own creation.
4. **Workspace-binding cardinality is coherent.** Aggregate `0..1` is the
   projection of a closed discriminated invocation sum. Each function variant
   fixes `workspaceBindingRequirement` to `forbidden` or `exactly_one`;
   pre-binding operations forbid it and workspace/execution operations require
   it. Mutable observation does not change the binding.
5. **Counts need not grow.** `ExactCandidateQualification<K>` is one Prime
   contract family with addressable basis/verdict projections. Basis joining
   and `FinalTapDelta` remain subordinate values, AF-22 remains the existing
   semantic evaluator, and AF-25 remains the existing release materializer.
   Subject to the typed batch repair, no new semantic atom, composition, or
   public operation is required.

## Mechanical Evidence

The following were reproduced against the exact subject:

| Check | Result |
|---|---:|
| exact Ontology source basis | 30/30 |
| atomic families / authority rows | 27/27 unique and identical sets |
| higher-order product compositions | 7 |
| public operation identities | 19/19 unique |
| retained feature rows | 17/17 unique |
| capability identities | 16/16 unique |
| registered design Mermaid gate | pass |
| GFM/Pandoc parse | 6/6 subject files pass |
| `git diff --check` | pass |

Commands included exact `sha256sum` over the six frozen subject files, an
independent Node census over the Ontology tables and basis rows,
`npm run check:design-mermaid`, six `pandoc --from=gfm --to=json` parses, and
`git diff --check`. Runtime tests were not run because this is a design,
qualification-contract, and release-authority review over a frozen runtime
wave.

## Disposition

Do not record F_H acceptance of the linked T-278 target yet. Repair the batch
task contract and the residual fold wording, freeze new digests, and run a
focused independent algebra re-review. This is a bounded correction inside the
accepted release path. It does not reopen One Surface, workspace binding, the
release lifecycle, or the 27/7/19 Prime target.
