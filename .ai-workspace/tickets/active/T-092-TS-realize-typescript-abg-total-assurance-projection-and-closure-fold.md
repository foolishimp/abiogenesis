---
id: T-092-TS
title: Realize TypeScript ABG total assurance projection and closure fold
type: feature
ticket_category: implementation_migration
status: active
review_status: external_review_blockers_resolved_pending_re_review
goal: abg-total-assurance-calculus
goal_status: active
build_tenant: typescript
activation_requires: T-089 completed, T-090 active/awaiting_external_agent_review, and T-091 proof plan accepted
change_intent: Implement the ratified ABG total assurance projection and closure fold in the TypeScript tenant, with tenant-local proof and no reliance on Python proof closure.
change_class: realization_refactor
re_entry_point: realized_surface
affected_boundary: TypeScript ABG event/projection/closure surfaces, stale-input invalidation, report projections, plugin contracts, installed sandbox/live qualification
priority: high
triaged_at: 2026-04-29T07:24:15Z
created_at: 2026-04-29T07:24:15Z
updated_at: 2026-04-30T00:20:06+10:00
closure_candidate_at: 2026-04-29T08:23:15Z
dependencies:
  - T-088 completed
  - T-089 completed
  - T-090 active/awaiting_external_agent_review
  - T-091 active/proof plan accepted
source_ticket: T-090
migration_strategy: inside_out_core_interface_migration
library_usage: consume
governing_library: build_tenants/abiogenesis/typescript/design/M03_TOTAL_ASSURANCE_PROJECTION_DERIVATION.md
proof_plan:
  - build_tenants/abiogenesis/typescript/design/M03_TOTAL_ASSURANCE_PROJECTION_PROOF_PLAN.md
governance_scope: STDO Method
intake_source: T-088 audit found total assurance requires tenant implementation once requirement/design/proof authority is ratified. TypeScript has strong event/projection, transport, retry, actor, and installed-lane surfaces, but it did not yet have generic total ambiguity projection and closure fold law.
target_truth: TypeScript ABG implements the accepted total assurance carriers, projection, closure fold, stale-input invalidation, plugin authority limits, and report read models under tenant-local proof.
superseded_truth: TypeScript traversal convergence, installed operator success, or downstream odd_sdlc assurance gates are enough to claim generic ABG assurance.
non_goal:
  - Do not use TypeScript proof as Python closure.
  - Do not hard-code odd_sdlc semantics into ABG.
  - Do not claim runner/release gate integration without explicit proof.
closure_law: Close only after external agent review accepts that the TypeScript implementation and TypeScript-local proof satisfy the accepted requirement/design/proof surfaces. Python is paused and independent, and no Python parity claim is made. Runner/release gate integration is explicitly deferred to T-093-TS.
evaluation_criteria:
  - TypeScript implementation consumes ratified ABG assurance requirement/design.
  - TypeScript tests cover every ambiguity status required by T-091.
  - TypeScript tests prove stale-input invalidation after prior closure.
  - TypeScript tests prove plugin output cannot close work or append runtime truth.
  - TypeScript reports are read models over event/projection truth.
  - Installed sandbox/live proof is explicit or explicitly deferred under a separate proof ticket.
proof_surface:
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/assurance.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/plugins.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/index.ts
  - build_tenants/abiogenesis/typescript/test_env/tests/test_t092_total_assurance_projection_unit.test.mjs
  - npm run test:t092
  - npm run test:t072:plugins
  - npm run test:semantic
  - T-093-TS backlog for runner/release gate integration
non_closure_conditions:
  - proof is only a downstream odd_sdlc scenario
  - traversal convergence is treated as assurance closure
  - Python proof is claimed by implication
---

# T-092-TS: TypeScript ABG Total Assurance

## Closure Candidate

T-092-TS is a closure candidate for the TypeScript projection/fold slice
pending external agent review.

The tenant now has:

- assurance scope refs over existing M03 runtime truth,
- authority snapshots and input digests,
- evidence rows,
- ambiguity rows for every T-091 status,
- closure decisions,
- stale-input invalidation,
- assurance provider authority rejection,
- report read models over projection truth.

## Implemented Surfaces

| Surface | Change |
|---|---|
| `code/src/abg/m03/contracts/assurance.ts` | Added TypeScript assurance carriers, projection, closure fold, report read model, and provider-output admission guard. |
| `code/src/abg/m03/contracts/plugins.ts` | Added five assurance provider plugin contract kinds and `assurance_consumed` binding status. |
| `code/src/abg/m03/contracts/index.ts` | Exported assurance carriers and functions. |
| `test_env/tests/test_t092_total_assurance_projection_unit.test.mjs` | Added row-totality, stale-input, provider negative, old closure path, deterministic replay, and report read-model proof. |
| `package.json` | Added `test:t092`. |

## Proof Result

Passed:

- `npm run test:t092`
- `npm run test:t072:plugins`
- `npm run test:semantic`

The full semantic suite passed 291 tests after stale event expectations outside
the focused T-092 proof were repriced to the event-sourced payload truth path.

## Explicit Defer

Runner/release gate integration is not claimed here. T-093-TS owns the next
step: consuming `AssuranceClosureDecision` in TypeScript runner/release
surfaces so traversal convergence, installed operator success, and archive
shape cannot masquerade as assurance closure.

Python is paused under T-092-PY and is not an active release gate for this
TypeScript ticket.
