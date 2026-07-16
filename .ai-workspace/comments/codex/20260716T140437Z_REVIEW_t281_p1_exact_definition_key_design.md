# Review - T-281 P1 Exact Definition-Key Design

**Date**: 2026-07-16
**Reviewed design**: `build_tenants/abiogenesis/typescript/design/M04_PUBLIC_OPERATION_DEFINITION_FAMILY_BEHAVIOR_DESIGN.md`
**Accepted digest**: `1bbf4bcb5fbe53f97e150ae743b798fb4c1fe0c5ea4d6fb4753bdc31f3b22d7a`
**Verdict**: accept P1 design; implementation remains blocked on named owner-contract gaps

## Findings

1. The 19 public identities are resolved through one private definition family.
   P1 introduces no handler, public catalog, SDK, CLI, runtime effect, or second
   semantic register.
2. The resolution key is exact: 35 non-read variants plus 27 closed
   `project.read` cases produce 62 `DefinitionKey` values. Request, result,
   refusal, and non-terminal slots resolve independently against owner-native
   authority and evidence.
3. Delivery ordering is acyclic. T-270/T-272 neutral contracts and T-274A's
   neutral Consensus coordinate precede P1; T-270/T-272 runtime integration and
   T-274B/T-275 publication follow P1; P2 closes only after semantic owners exist.
4. M03 consumes neutral admitted projections and does not import M04 public
   carriers.
5. `run.continue(selected_action)` retains its required closed variant but takes
   only the exact `NextActionProjection` coordinate and basis relation. AF-13's
   admitted projection owns the selected action; no caller-authored duplicate
   action coordinate remains.
6. The named owner-schema gaps are honest construction blockers. P1 must not
   synthesize substitute schemas or accept prose-only contract truth.

## Acceptance Boundary

This review accepts the P1 design only. It does not accept P1 implementation,
P2 publication, any operation handler, or the final same-basis 27/7/19 product
gate. Missing owner contracts remain typed gaps until their owners close them.
