# SELF REVIEW: T-285 Repaired Direct GTL Design Candidate

## Verdict

Ready for replacement independent exact-design review. This is not design
acceptance and does not open M4.

## Exact Subject

| Field | Value |
|---|---|
| candidate commit | `46098232e382b52e8d7bf903c3c66a6946fee44f` |
| candidate tree | `e04e499c56b4ca3ccb59689b76f1a2e1489fe74a` |
| design path | `build_tenants/abiogenesis/typescript/design/M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md` |
| Git blob | `2b592ce4b7704fa633e7d9db6b0875ebd3d0317d` |
| SHA-256 | `f05775332650a86d78a9559d396c935d3d11ed914d1a7dd1570b1c3eb5b93201` |
| lines | `953` |

The design file alone is the immutable review subject. Ticket, index, review,
and decision records remain mutable workflow evidence outside that subject.

## Finding Disposition

| Prior finding | Repair |
|---|---|
| uniform C-call spine missing | Added CCall ontology, lifecycle, cardinality, atomic functions, exact event order, sequence, state path, Event Calculus effects, R9 mapping, and proof. |
| host effect owner missing | Added LeafImplementation, the leaf-realization Prime/IACS family, and `src/implementation` as the effect-only module. |
| dependency graph unrealizable | Product now emits candidates without calling ABG; HoG receives validated values without calling the validator; `src/public` is a stateless fixed composition root over acyclic owner ports. |
| ProductSet mis-lifecycled | Added VerifiedProductArtifact; ProductInstall materializes one verified artifact; ProductSet is an ordered non-empty set of installed identities used by WorkspaceBinding. |
| rival mutations too weak | Added valid-GTL/stale-plan differential, disabled-HoG/rival-plan refusal, and renamed-controller causal-path mutation. |
| cross-view omissions | Added ProductSet and Run to IACS, TraversalStopRef lifecycle, ExecutionBasis-to-ProductSet and Graph relations, CCall, and LeafImplementation across views. |

No finding required Intent, Product, or requirement re-entry.

## Cross-Boundary Review

1. The C-call spine is exactly `opened -> fibre_selected -> evidenced(0..n)
   -> result_admitted -> judged`; the all-F_D root requires deterministic
   evidence.
2. Product, validator, HoG, implementation, ABG, and public composition retain
   separate owners and an acyclic dependency direction.
3. The operation composition root has no selector, fallback, state, event
   writer, continuation, or closure authority.
4. GraphFunction materialization and validation precede ExecutionBasis and
   direct HoG entry.
5. Implementation returns only evidence and result candidates; ABG separately
   admits evidence, result, judgment, transition, and closure.
6. The exact R1-R10 path remains the sole M4 governor.

## Mechanical Verification

- exact-file Mermaid render: pass, Mermaid `11.3.0`, `3/3` views;
- rendered source-set digest:
  `sha256:39bed9eeab67d81f8ce146fecb7e6ff1221e749e10b4c984c01c8881ca1c4360`;
- tenant `npm run check:design`: pass;
- `git diff --check`: pass;
- no runtime, test, package, generated, qualification, or release path changed.

## Replacement Review Focus

The reviewer should attempt to falsify each repair, with particular attention
to whether the stateless operation application is only dependency wiring and
whether the C-call spine is complete without moving traversal or judgment
authority into ABG.
