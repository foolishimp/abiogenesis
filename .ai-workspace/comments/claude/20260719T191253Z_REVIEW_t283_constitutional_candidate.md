# REVIEW: T-283 Constitutional Candidate

**Reviewer**: Claude Fable 5 through Claude Code 2.1.215
**Review time**: 2026-07-19T19:12:53Z
**Mode**: independent read-only review, safe mode, plan permissions
**Candidate commit**: `f1256b6c9e11f9f0ac345e4e59a97cd482afcb86`
**Construction base**: `1b8b2b0a22ad5dc484e3db5c19fd562cd7935ff8`
**Verdict**: **ACCEPTABLE FOR FINAL F_H REVIEW**, conditional on operator-side
confirmation of the declared subject aggregate

## Independence And Scope

This review ran in a separate model session from the pen-holder. The reviewer
received read-only repository tools, inspected the candidate commit and shared
method, and made no file or Git changes.

The review treated T-283 as a pre-final-F_H constitutional closure gate. It did
not review implementation, derive the X-to-5 vector, or propose a replacement
design.

## Findings

### P0

None.

### P1 - Reviewer could not execute SHA-256 tooling

The review sandbox denied every available hashing utility. The reviewer could
not independently recompute the declared subject, semantic-basis, or Phase-1
decision SHA-256 values.

Git-native checks did establish:

- candidate `f1256b6c` is a clean child of `1b8b2b0a`;
- the diff contains 92 files: 90 modified subject files and two added Codex
  commentary files;
- there are no deleted or renamed files;
- both digest-bound construction inputs already exist in the base commit; and
- content review used the candidate's committed blobs.

Required bounded follow-up: the operator must run the manifest reproduction
with locale-stable sorting and confirm the exact aggregate before F_H closure.

### P2 - Non-blocking observations

1. Most tenant design files rely on the directory-level T-283 hold rather than
   per-file banners. Known incompatible designs are explicitly bannered. The
   blanket hold is lawful, but a cold reader can still encounter a historical
   `Accepted` status before reading the index.
2. Generated JSON projections remain unchanged and carry no in-file stale
   marker. Root and design authority surfaces make them held X evidence. The
   X-to-5 vector must disposition them explicitly.
3. `.ai-workspace/context/project_constraints.yml` is stale Python-era 1.0.0
   context. No reload path grants it authority; it is post-closure hygiene.
4. Some requirement status lines use `T-283 constitutional candidate` while
   others add `not operative until F_H closure`. Both remain unambiguous.
5. The reviewer's narrower requirement-ID regex counted 1,202 base and 1,226
   candidate IDs. The pen-holder's broader census counted 1,271 and 1,295.
   Both prove the same invariant: 24 additions and zero removals.

None of these observations requires candidate amendment before final F_H
review.

## Recomputed Gate Results

The reviewer independently confirmed:

1. `PRODUCT.md` is the only complete current 5.0 definition and no active
   rival destination remains.
2. RC5 is the exact semantic origin. The annotated tag, tagged commit, and
   snapshot manifest agree with the Product coordinates. The complete ledger
   remains an explicit post-closure obligation rather than a false completion
   claim.
3. GTL.TypeScript is the sole language, the validator is non-lowering, HoG
   traverses admitted GTL directly, and ABG owns runtime admission without
   becoming a second executor.
4. GraphFunction requires a replayable GTL template and has no
   implementation-only escape hatch.
5. `F_D`, `F_P`, and direct or proxied `F_H` retain distinct type and authority
   boundaries.
6. The candidate contains 17 feature rows, seven scenario headers, ten root
   obligations, all 40 traversal rows, and a separate fibre-substitution
   differential.
7. STDO 2.0 gates self-conformance, qualification, and release without blocking
   the initial installed root.
8. All ten active tickets are held, all 11 legacy scenario bundles are
   non-operative, common design is held, and known compiled-plan/controller
   designs are explicitly invalidated.
9. Requirement identity is conserved and all current `CompiledCProgramPlan`
   mentions in specification are prohibitions.
10. The subject contains only Markdown and YAML. No runtime, contract, test,
    generated-manifest, package, or release artifact entered the cut.

`git diff --check` passed. No behavioral proof is falsely claimed.

## Exact Verdict

> ACCEPTABLE FOR FINAL F_H REVIEW, conditional on the operator confirming the
> exact 90-file subject aggregate before the closure decision.

No candidate repair was requested. Final constitutional closure remains a
separate direct or lawfully proxied F_H decision.
