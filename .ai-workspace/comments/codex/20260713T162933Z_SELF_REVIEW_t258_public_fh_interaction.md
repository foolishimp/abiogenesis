# T-258 Self-Review: Public F_H Interaction

Date: 2026-07-13
Reviewer: Codex
Disposition: implementation is ready for delegated F_H closure review
Implementation checkpoint: `8e71464`

## Reviewed Boundary

T-258 closes the public response and resume-admission boundary for one existing
F_H interaction. M03 owns the pending interaction, deterministic identities,
canonical events, replay projection, response admission, and nonterminal resume
admission. M04 owns the six published public operations, request admission, SDK
adaptation, and the thin CLI grammar.

The boundary does not consume the response as traversal truth, apply effects,
select a private frontier, decide closure, or run an automatic wake controller.
T-267 still owns traversal-result conservation and post-resume consumption.

## Findings And Repairs

| Finding | Repair | Result |
|---|---|---|
| The initial fixtures signed a legacy startup-block shape | F_H opening now requires the canonical T-267 startup block, digest, no-effect status, and authority refs | repaired |
| Source-carrier refs and digests could differ in cardinality | Opening and replay projection require exact positional cardinality and canonical digests | repaired |
| A JSON `null` response could look like no response | Status and response identity, not value nullability, determine pending versus responded truth | repaired |
| A GraphCall with multiple interactions could select by accident | The current one-interaction boundary fails closed as `ambiguous_interaction` | repaired |
| Shape-valid persisted response or resume events could bypass live semantic checks | Replay now revalidates graph-call and basis ownership, declared operation and choice, exact capabilities, evidence, provenance, exact causation, and lifecycle ordering | repaired |
| Opened-event replay could preserve a self-consistent but invalid source pairing | Replay revalidates request, continuation, carrier pairing, causation, and interaction identity | repaired |
| The proof contract did not directly exercise unknown interaction refusal | Added a focused negative path through the real response atom | repaired |
| T-223 repeated native, schema, operation, capability, export, and symbol rosters | Product verification now derives those projections from the canonical contract registries; source-blind packed proofs remain independent | repaired |

No additional closure blocker was found in the final changed-file review.

## Residual Boundaries

- T-258 intentionally supports one existing interaction per GraphCall. T-267
  must define sequential interaction consumption before that boundary widens.
- Resume admission remains nonterminal and does not apply a `TraversalUnit`.
- The response value is canonical I-JSON bound to the selected response-contract
  identity. Arbitrary tenant-schema execution is not claimed by this slice.
- Multi-process compare-and-append semantics are not introduced here; the slice
  preserves the existing trusted-workspace event-log boundary and exact replay
  behavior for admitted serial operations.

## Observed Proof

| Gate | Observed result |
|---|---|
| `npm run test:t258` | 13/13 focused behavioral tests, 82/82 GTL-law tests, packed public proof 1/1 |
| `npm run test:t252` | 11/11; body digest remains `sha256:e4555c21cdb4292b64f7f4d5a625c2a520195aa8d6e9c759498eed4bf28d0ea0` |
| T-252 generated census | implementation-checkpoint digest `sha256:e27e3e7404dffc813cfe9a6d0612cb848ea0d2480443228e0947404ecb68232f`; eight successor gap families remain |
| `npm run test:semantic` | 1642/1642 |
| `npm run test:t223` | 70/70 source-blind SDK, CLI, publication, and installed-product proofs |
| `npm run check:abg-product-publication` | 82 schemas; 40 generated assets over 1073 immutable payload files |
| `npm run lint:semantic` | pass, including GTL authority guard |
| changed-test ESLint | pass |
| `npm run check:design-mermaid` | 27 diagrams across 9 files, pinned renderer 11.3.0 |
| `npm run test:design-mermaid` | 5/5 mutation proofs |
| `git diff --check` | pass |

## Exit Judgment

All six public operations resolve through one admitted invocation contract and
one M03 interaction lifecycle. Accepted responses and resumes append
actor-attributed canonical events. Unknown, stale, undeclared, ungrounded,
conflicting, non-resumable, and replay-forged paths fail closed without
traversal or closure effects. The non-Consensus fixture exercises opening,
projection, response, resume, and exact replay through the public SDK and
CLI-equivalent construction path.

The unchanged T-252 body reaches the generic public F_H contract structurally;
its census no longer reports `fh_pending_runtime_hold` and retains eight honest
successor gaps. T-258 is eligible for delegated F_H acceptance and closure.

After ticket movement, the ownership read model was regenerated with T-258 as
completed. The final closure manifest digest is
`sha256:258651ab60ce8af9da725b8d6efc56605505bd5517d799d76691c6e9e3ac59e7`;
the body digest and eight remaining gap families are unchanged.
