# T-260 Self-Review: Typed HOF And C.batch Runtime

Date: 2026-07-13
Reviewer: Codex
Disposition: implementation is ready for delegated F_H closure
Implementation checkpoint: `398f254`

## Reviewed Boundary

T-260 realizes three generic runtime relations: typed `fan_out`, ordered
vector-to-`C.batch` projection, and typed `fan_in`. It also realizes a direct
root `C.batch` through the same serial task resolver. The runtime preserves the
selected public catalog entry, exact Module, structural HOF relation, selected
program, composition, member contracts, vector basis, ordinals, lineage,
result cardinality, and terminal evidence.

The boundary does not execute nested or mixed batch expressions, implement
retry or recursion, introduce concurrency or scheduling policy, or remove the
T-267 startup fence.

## Findings And Repairs

| Finding | Repair | Result |
|---|---|---|
| Initial digest helpers relied on TypeScript omission while runtime objects could retain seal fields | Replaced omission assertions with explicit canonical basis constructors for plans and HOF bindings | repaired |
| A supplied handoff could have been trusted after structural compilation | Binding compilation now rederives program selection, lowering, composition ownership, and exact Module containment | repaired and mutation-tested |
| Vector admission could observe widened or getter-backed input more than once | Admission detaches once, enforces closed top/member key sets, decodes fields, and verifies the sealed vector digest | repaired |
| Batch tasks initially lost declared result cardinality | `resultBearing` is preserved into requests and completed outcomes must carry exactly the declared result shape | repaired |
| HOF output uniqueness was incorrectly applied to direct batch results | Payload uniqueness is required only for HOF vector construction; direct batch may lawfully repeat a result payload | repaired |
| The first raw admission and seal implementation passed strict TypeScript but failed semantic lint | Removed unsafe array inference and type assertions; explicit decoders and basis constructors now pass lint | repaired |
| The shared selected-catalog resolver changed two inherited T-259 diagnostic strings | Updated only the stale negative assertions; T-259 remains 9/9 and fails before effects | repaired |
| Generated publication truth drifted after public exports and a packaged test changed | Regenerated the publication inventories and manifest from the final implementation payload | repaired |

No remaining closure blocker was found in the changed-source, event-spine,
public-surface, or package review.

## Residual Boundaries

- Only a direct root `C.batch` of direct `C.of` stages is admitted. Nested and
  mixed shapes remain typed gaps.
- HOF child traversal remains blocked by retry and startup authority on the
  canonical product path. T-261 and T-267 retain those claims.
- Recursive application remains unrealized and owned by T-262.
- Batch execution is deliberately serial. This ticket does not create a
  scheduler, lease, cancellation, or concurrency subsystem.
- Completed HOF members retain input lineage and exact order. Partial,
  blocked, held, malformed, or throwing work cannot mint aggregate vector
  truth.
- The canonical Consensus body remains unchanged and no Consensus-specific
  controller or runtime was introduced.

## Observed Proof

| Gate | Observed result |
|---|---|
| `npm run test:t260` | GTL law 82/82; focused and inherited lane 58/58; packed public API 1/1 |
| Scenario 09 | 9/9 runtime cases with dynamic cardinality, all-or-block, selected authority, strict admission, and fan-in closure |
| `npm run test:semantic` | 1660/1660 |
| T-259 inherited runtime | 9/9 after common catalog-authority compression |
| `npm run test:t223` | 70/70 source-blind package, SDK, CLI, and publication proofs |
| `npm run test:t250` | 13/13 version-basis and documentation-drift proofs |
| `npm run test:t252` | 11/11; body digest unchanged; four successor gap families remain |
| `npm run check:abg-product-publication` | 82 schemas; 40 generated assets over 1094 immutable payload files |
| `npm run check:design-mermaid` | 33 diagrams across 11 files with renderer 11.3.0 |
| Source and changed-test ESLint | passed |
| `git diff --check` | passed |

## Exit Judgment

Typed fan-out now projects runtime-cardinality input vectors into ordered
serial C tasks, closes every task through one engine-owned C-call spine, and
mints an output vector only after complete admitted success. Typed fan-in
consumes that exact vector basis and application lineage through one selected
reducer invocation. Direct root `C.batch` uses the same resolver without
claiming vector truth.

T-260 is eligible for delegated F_H acceptance and closure. After ticket
movement, the T-252 ownership read model was regenerated at
`sha256:72351e36de5d3a3bd425d5443d6f3ef7283ac0dc5e828ff2505a82c5c50e75ab`.
The canonical body remains
`sha256:e4555c21cdb4292b64f7f4d5a625c2a520195aa8d6e9c759498eed4bf28d0ea0`.
Four active successor gap families remain, with zero unowned, duplicate, or
active-owned-but-unobserved families.
