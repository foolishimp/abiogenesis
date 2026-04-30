---
id: SPRINT-2026-04-30-abg-review-backlog
title: ABG review backlog cleanup for T-098 and T-099
status: closed
goal: GOAL-007
opened_at: 2026-04-30T23:44:00+10:00
updated_at: 2026-04-30T23:44:00+10:00
authority_refs:
  - specification/GOALS.md
  - specification/PRODUCT.md
  - specification/requirements/abg/
  - specification/requirements/gtl/
  - /Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/TICKET_METHOD.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/UX_METHOD.md
scope:
  - Resolve the external review blockers raised against T-098 and T-099.
  - Keep T-097 evidence accepted without reopening the process actor design.
  - Record sprint-style close review without using UX compliance escrow for runtime semantics.
excluded_boundaries:
  - No new product truth.
  - No new requirement authority.
  - No downstream odd_sdlc T-102 consumer migration.
  - No RC closure.
  - No deferred runtime, provenance, evidence, or carrier proof.
expected_change_classes:
  - design_reframe
included_tickets:
  - T-098
  - T-099
related_tickets:
  - T-097
closure_trigger: Review backlog blockers are implemented and focused ABG proof is green.
closure_law: |
  This sprint may close only if the review blockers are corrected at the ABG
  carrier/projection layer, focused semantic tests pass, lint passes, no runtime
  or carrier proof is deferred, and remaining downstream work is explicitly
  carried by odd_sdlc T-102 rather than hidden in this sprint.
proof_surface:
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/fp_stages.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/retry_frontier.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/attached_fp_worker.ts
  - build_tenants/abiogenesis/typescript/test_env/tests/test_t098_retry_frontier_projection.test.mjs
  - build_tenants/abiogenesis/typescript/test_env/tests/test_t099_fp_stage_carriers.test.mjs
  - .ai-workspace/comments/codex/20260430T234400AEST_abg_review_backlog_sprint_close.md
deferred_compliance: none
non_closure_conditions:
  - Any request/result mismatch can still be admitted into ABG transform evidence.
  - Any blocked, runtime-failed, or contract-failed F_P path bypasses typed transform status.
  - A spoofed latest-only object can satisfy full retry frontier validation.
  - Focused semantic tests or lint fail.
  - The sprint attempts to close downstream T-102 or RC release gates.
paydown_policy: |
  No local paydown is accepted for ABG runtime semantics. Remaining accepted
  debt is downstream consumer work in odd_sdlc T-102 and the already-declared
  live data_mapper proof gate.
---

# Sprint Close Review

This sprint uses sprint mechanics as bounded execution control, not UX
compliance escrow. `UX_METHOD.md` confirms UX may escrow visual and interaction
proof, but it explicitly cannot escrow runtime, governance, provenance, or
evidence semantics. T-098 and T-099 are runtime/evidence carrier work, so all
proof for this sprint is paid inside the sprint.

## Item Classification

| Item | Classification | Result |
| --- | --- | --- |
| T-098 full retry frontier guard | accepted | `assertFullRetryFrontierProjection` now validates row shape, `frontierRef`, vector/edge consistency, reason classes, source event kinds, attempt count, latest attempt, and covered attempts. |
| T-099 request-scoped transform result admission | accepted | `admitFpTransformResultForRequest` rejects mismatched `requestRef`, `actorInvocationId`, and `resultRef`; event emission checks the same binding. |
| T-099 non-returned transform outcomes | accepted | Blocked, runtime-failed, and contract-failed attached F_P outcomes now enter retry progress through typed `FpTransformResult` status. |
| T-097 process actor evidence | accepted unchanged | Prior T-097 deterministic and live Claude evidence remains sufficient for ABG-layer acceptance. |
| Downstream odd_sdlc T-102 consumer proof | local_paydown outside sprint | Not in this sprint. Remains the downstream migration and live data_mapper proof gate. |

## Verification

- `node --test test_env/tests/test_t098_retry_frontier_projection.test.mjs test_env/tests/test_t099_fp_stage_carriers.test.mjs test_env/tests/test_t097_supervised_process_actor.test.mjs` passed 13/13.
- `npm run lint:semantic` passed.
- `git diff --check` passed for the changed sprint surfaces.

## Close Decision

The ABG review backlog items are accepted at the ABG layer. This sprint is
closed with no deferred ABG runtime compliance. T-098 and T-099 should remain
active because downstream odd_sdlc T-102 consumption is still a declared
non-closure gate.
