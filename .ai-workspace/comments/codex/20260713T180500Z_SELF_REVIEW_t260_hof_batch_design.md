# T-260 Typed HOF And Batch Design Self-Review

**Date**: 2026-07-13
**Ticket**: `T-260`
**Disposition**: pass after bounded repair

## Reviewed Boundary

- `REQ-L-GTL3-HOF-009..-012`
- Scenario 09 fan-out transform authority
- `M03_TYPED_HOF_BATCH_RUNTIME_BEHAVIOR_DESIGN.md`
- registered three-view Mermaid gate

## Findings And Repairs

1. The first draft assigned every batch task a child GraphFunction ref. That
   was impossible for a direct authored `C.batch` of C stages. The accepted
   design now uses a closed task union: one direct `C.of` stage or one HOF
   child sub-traversal. Both use the same ordinal batch executor and one spine
   per invoking task.
2. The first draft asked `compileHofRelation` and
   `compileGraphFunctionApplication` to emit Module-bound runtime authority
   despite neither compiler receiving a Module. The accepted design separates
   structural relation carriers from selected-Module binding compilers for
   both fan-out and fan-in.
3. The first draft made fan-in consume only a vector produced by the same
   fan-out. The accepted design consumes any complete `AdmittedHofVector` with
   exact contract, basis, ordinals, attribution, producer, and application
   lineage; the T-260 output vector is one lawful producer.
4. The new requirement paragraphs initially used a non-canonical clause
   heading and the ticket cited a non-existent Markdown anchor. All four now
   use the existing `**ID**:` form and the ticket records the file plus clause
   range.
5. Scenario 09 previously proved structural fan-out only. Its existing
   fan-out-transform family now carries the batch, all-or-block, ordering, and
   exact fan-in proof obligations instead of creating a duplicate scenario.

## Proportionality Review

- Direct authored batch realization is limited to root `C.batch` with direct
  `C.of` tasks. Mixed and nested task programs remain typed gaps.
- Runtime execution is serial. No scheduler, lease, cancellation, or parallel
  policy was introduced.
- `batchRef` is grouping data only.
- Retry, recurse, traversal conservation, and tenant capability publication
  remain with T-261, T-262, T-267, and T-268.
- Canonical T-252 effects remain startup-blocked.

## Evidence

- requirement clause census: 1221 ids, 0 duplicate ids;
- Mermaid structural/render gate: 11 files, 33 diagrams, passed;
- Mermaid mutation suite: 5/5 passed;
- source-set digest:
  `sha256:1ebe1361b9d8683f768ca2ea6b982c5c3c607e87cc3d48b891a9e868bbd49bbb`;
- `git diff --check`: passed.

## Verdict

The repaired requirement and design boundary is internally coherent and
implementation-ready. No blocking finding remains in the accepted scope.
