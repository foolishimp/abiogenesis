# T-259 Self-Review: Generic workflow.C Runtime

Date: 2026-07-13
Reviewer: Codex
Disposition: implementation is ready for delegated F_H closure
Implementation checkpoint: `f1763de`

## Reviewed Boundary

T-259 realizes one direct `workflow.C(child)` program as one transparent
parent C call around one module-contained child GraphFunction traversal. The
compiler preserves the exact selected program, Module, execution subject,
composition owner, GraphVector, child, typed carrier pair, role, regime, and
composition. The runtime rederives that binding from the selected public
catalog entry before emitting an event.

The boundary does not publish the child as a public catalog entry, flatten the
child into handler stages, interpret mixed workflow expressions, admit
recursion, execute the canonical Consensus product, or remove the T-267
startup fence.

## Findings And Repairs

| Finding | Repair | Result |
|---|---|---|
| The first design treated execution subject and composition owner as one identity | The binding now carries and independently verifies both exact Module-contained GraphFunctions | repaired |
| A module-contained child could demand effects absent from its public parent | Binding rejects every child effect outside the parent effect set | repaired |
| A direct workflow could point back to its parent before recursion semantics exist | Self-workflow is rejected; T-262 retains recursion ownership | repaired |
| A supplied binding could retain a valid digest while drifting from the selected catalog Module | Runtime rederives program, composition, child, and binding from the one selected entry and requires byte equality | repaired |
| The existing flat HoG resolver could observe the empty workflow stage list as a no-op | Flat execution now rejects the workflow variant with `workflow_sub_traversal_required` | repaired |
| A child callback could return inherited, widened, or getter-backed truth | The result is detached once, decoded field by field against a closed key set, cross-checked against the request, and frozen before foldback | repaired |
| Held child truth was initially described as blocked | Held maps to parent `pending`; only blocked maps to `blocked` | repaired |
| The first implementation used a TypeScript assertion at the child admission seam | Explicit field decoders replaced the assertion and the semantic lint gate passes | repaired |
| The proof contract named malformed normalized programs and missing, ambiguous, and interface-drifted children without direct cases | Added focused negative paths through the real admission and binding compiler | repaired |

No additional closure blocker was found in the final changed-file review.

## Residual Boundaries

- Only a direct root `workflow.C(child)` is realized. A mixed expression that
  embeds workflow retains the typed successor diagnostic.
- Internal Node-interface continuity is proved. No public child wire contract
  is inferred; the binding records `childOuterContractRef: null` and
  `childWireContractCertified: false`.
- The child callback is an internal ABG traversal boundary. The focused
  resolver proof does not claim canonical product startup or effect admission.
- The canonical T-252 paths remain `startup_blocked_awaiting_t267`; no product
  effect executes in this slice.
- Typed HOF/batch, retry, and recursive workflow remain separately owned by
  T-260, T-261, and T-262.

## Observed Proof

| Gate | Observed result |
|---|---|
| `npm run test:t259` | 9 direct T-259 cases; 43/43 focused and inherited checks; packed public API proof 1/1; GTL law 82/82 |
| `npm run test:t252` | 11/11; body digest remains `sha256:e4555c21cdb4292b64f7f4d5a625c2a520195aa8d6e9c759498eed4bf28d0ea0` |
| T-252 generated census | manifest `sha256:9646183e920c70846b8c382cdbbbed633d74c43dc0be94a8105913fd67d34ff2`; seven observed successor gaps remain before ticket movement |
| `npm run test:semantic` | 1651/1651 |
| `npm run test:t223` | 70/70 source-blind package, SDK, CLI, and publication proofs |
| `npm run check:abg-product-publication` | 82 schemas; 40 generated assets over 1079 immutable payload files |
| `npm run lint:host` | pass |
| changed test and probe ESLint | pass with Node `structuredClone` declared for inherited fixtures |
| `npm run check:design-mermaid` | 30 diagrams across 10 files, pinned renderer 11.3.0 |
| `npm run test:design-mermaid` | 5/5 mutation proofs |
| `git diff --check` | pass |

## Exit Judgment

One direct workflow program now lowers to a closed normalized carrier, binds
one exact module-contained child, and folds completed, blocked, held, malformed,
and throwing child outcomes through one engine-owned parent C spine. Selected
catalog authority cannot be replaced by a sibling entry, child publication, or
caller-authored binding.

The unchanged T-252 body has five workflow handoffs that now compile to exact
static workflow bindings. They move to capability and T-267 startup blocking;
the retry handoff and all other successor gaps remain explicit. T-259 is
eligible for delegated F_H acceptance and closure.

After ticket movement, the ownership read model was regenerated with T-259 as
completed. The final closure manifest digest is
`sha256:f19a0615137536ceb4ff33161b0b6eea5679c9ec613d548f5e4ec546e47c9f99`;
the body digest and seven observed successor gap families are unchanged, with
zero active-owned-but-unobserved, duplicate-owner, or unowned gaps.
