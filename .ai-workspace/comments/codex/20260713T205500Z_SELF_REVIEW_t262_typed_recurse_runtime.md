# T-262 Self-Review: Typed Recurse Policy And Runtime

Date: 2026-07-13
Reviewer: Codex
Disposition: implementation is ready for delegated F_H closure
Implementation checkpoint: `e09d3b65`

## Reviewed Boundary

T-262 realizes one direct typed recurse application as a generic,
selected-Module-bound runtime family. The structural compiler preserves the
exact wrapper, operand, input and output contracts, termination evaluator,
foldback relation, parent rebind, lineage, and one admitted positive budget.
The resolver derives each child application and continuation stage from replay,
admits child and foldback output before reuse, and records terminal truth before
returning a blocked outcome.

The boundary does not implement mutual recursion, nested or mixed recurse
expressions, a scheduler, graph-level traversal conservation, tenant
conformance, or a Consensus-specific controller. T-267 and T-268 retain those
authorities.

## Findings And Repairs

| Finding | Repair | Result |
|---|---|---|
| A malformed foldback initially returned a blocked result without persisted terminal truth | Added `typed_recurse_foldback_rejected` and made replay project the rejection without invoking the foldback adapter again | repaired and replay-tested |
| Event-derived causation initially included canonical envelope fields that are stamped after producer construction | Derived recurse event refs only from stable event content, excluding event id, time, admission ordinal, and their transport representation | repaired and tested with canonically stamped replay |
| Nullable event fields admitted empty strings and widened carriers could retain hidden properties | Closed the event, policy, binding, and plan key sets and rejected empty nullable values | repaired and negative-tested |
| A selected Module could resolve a policy that its selected catalog entry did not authorize | Required the exact selected registry entry to contain the admitted policy ref before any child effect | repaired and authority-drift-tested |
| The first T-252 observation risked turning an isolated runtime probe into a public-execution assurance claim | Derived `publicEffectsPermitted` from canonical handoff status and retained the probe as an isolated subordinate-adapter observation | repaired; startup remains blocked |
| The previous compiler treated every recurse expression as unrealized | Added only the direct one-lineage-step structural relation; nested and mixed recurse remain explicit gaps | repaired without widening the algebra |
| New public recurse carriers and events made generated inventories stale | Regenerated and checked the public schema, catalog, vocabulary, native inventories, and product publication | repaired |

No remaining closure blocker was found in structural lowering, selected catalog
authority, policy admission, event admission, replay projection, budget
enforcement, termination, foldback, parent rebind, package exports, or the
canonical T-252 observation.

## Residual Boundaries

- Only one direct recurse application with one structural lineage step is
  admitted. Nested, mixed, and mutual recursion remain typed gaps.
- Replay owns application ordinal, child identity, stage resumption, causation,
  budget, and terminal projection. Adapters receive stable identities and must
  preserve their external idempotency contract.
- A malformed child, termination result, foldback, or parent rebind is terminal
  typed truth. It is not silently retried as a new application.
- Prior-round evidence is carried into foldback and parent rebind; it is not
  replaced by the latest child result.
- T-267 still owns traversal/result-interface conservation and the startup
  effect fence. T-268 still owns the constitutional tenant-conformance manifest.
- The canonical Consensus body remains unchanged. No product-specific recurse
  branch, traversal loop, or runtime controller was introduced.

## Observed Proof

| Gate | Observed result |
|---|---|
| `npm run test:t262` | GTL law 82/82; focused and inherited lane 42/42; packed public API 1/1 |
| Generic recurse fixture | 10 focused cases covering authority, budget, termination, foldback, rebind, replay, dangling stages, stamped events, and malformed carriers |
| `npm run test:semantic` | 1679/1679 |
| `npm run test:t223` | 70/70 source-blind package, SDK, CLI, and publication proofs |
| `npm run test:t250` | 13/13 version-basis and documentation-drift proofs |
| `npm run check:t252-consensus-probe` | GTL law 82/82; body digest unchanged; exactly two successor gap families remain |
| `npm run check:abg-product-publication` | 82 schemas; 40 generated assets over 1109 immutable payload files |
| `npm run check:design-mermaid` | 39 diagrams across 13 files |
| strict TypeScript and semantic lint | passed |
| `git diff --check` | passed |

## Exit Judgment

T-262 is eligible for delegated F_H acceptance and closure. The unchanged
canonical body remains
`sha256:e4555c21cdb4292b64f7f4d5a625c2a520195aa8d6e9c759498eed4bf28d0ea0`.
The pre-closure probe manifest is
`sha256:f15d26726e48fe44511da6db4454441752faa12fc0525950201fa1043a596f0e`;
it reports only T-267 and T-268 as unresolved product gaps. The ownership
manifest must be regenerated after moving T-262 to the completed queue before
the final closure record is committed.
