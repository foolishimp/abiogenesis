---
id: T-130
title: Define recorded hook-action typing model for F_P evals
type: feature
ticket_category: implementation_migration
status: completed
review_status: completed_source_scope_residual_consolidated_to_T-132
goal: typed-hook-action-recording
change_intent: Strengthen ABG hook contracts so traversal, eval, transform, admission, and projection hook calls produce replay-visible hook action records and admitted findings before any ledger, projection, intent, or invocation truth is derived.
change_class: design_reframe
re_entry_point: design
affected_boundary:
  - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
  - specification/requirements/abg/
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/
  - build_tenants/abiogenesis/typescript/test_env/tests/
priority: high
build_tenant: typescript
release_scope: post-3.7.1 hook contract hardening
triaged_at: 2026-05-10T00:00:00+10:00
created_at: 2026-05-10T00:00:00+10:00
updated_at: 2026-05-13T20:22:13+10:00
closed_at: 2026-05-13T20:22:13+10:00
owning_repo: abiogenesis
governance_scope: STDO Method
parent_tickets:
  - .ai-workspace/tickets/completed/T-127-define-generic-fp-consciousness-loop-with-gtl-plugin-overrides.md
  - .ai-workspace/tickets/backlog/T-128-realize-fp-consciousness-runner-over-admitted-construction-intent.md
follow_up_tickets:
  - .ai-workspace/tickets/completed/T-132-prove-runner-consumed-edge-assurance-eval-replay.md
related_downstream:
  - odd_sdlc/.ai-workspace/tickets/completed/T-135-realize-evaluator-owned-runner-traversal-spine.md
current_evidence:
  - Current ABG has hook/plugin surfaces and construction-intent admission carriers, but hook calls are not yet represented by a unified hook-action record family across traversal, eval, transform, admission, and projection.
  - Downstream odd_sdlc is converging on a model where F_P eval findings must be admitted into deterministic ledger/register surfaces rather than written directly by the plugin or inferred only from event-log projection.
  - 2026-05-13 implementation added `hook_actions.ts` with `HookActionRecord`, `HookFindingAdmission`, typed hook classes, admission status, forbidden authority-field rejection, and replay-chain matching.
  - 2026-05-13 proof added `test:t130`, proving typed hook action records, admitted/rejected finding admission, replay chain matching, and rejection of direct event, ledger, intent, invocation, projection, and closure authority fields.
  - 2026-05-13 self-review repair tightened public constructor validation for hook class, admission status, and edge close disposition so JS callers cannot bypass the admitted parser path by using exported constructors directly.
  - 2026-05-13 T-131 crosswalk added `EdgeAssuranceEvaluationProjection` and `EdgeAssuranceEvaluationReadModel`, proving the F_P edge-eval subcase can move from hook action to admitted finding to owning projection/read model without plugin-written projection authority.
  - 2026-05-13 residual consolidation moved full predecessor-only replay and deep runtime proof obligations into T-132.
target_truth: ABG declares one recorded hook-action model. A hook call has a hook class, plugin ref, input basis refs, policy/config refs, returned finding refs, admission refs, and causal predecessor refs. Plugins return findings or contributions only. ABG records the hook action, admits or rejects findings, and then derives the owning event, ledger, projection, or intent truth.
closure_law: Close only when requirements/design and deterministic tests prove that no hook class can write ledger/projection/intent/traversal authority directly; every consequential hook contribution is recorded as a hook action, admitted under its hook contract, and replayable from predecessor refs.
non_closure_conditions:
  - A plugin can append ledger, projection, intent, invocation, or closure truth without a recorded hook action and admission.
  - The hook class is only a prompt convention or config label and is not represented in replay-visible contract truth.
  - Eval and traversal hooks share an untyped payload that lets evaluator findings become traversal authority without admission.
  - Existing transform hook evidence is migrated by compatibility alias while retaining old direct authority.
---

# T-130: Define Recorded Hook-Action Typing Model For F_P Evals

## Entry

Smallest lawful re-entry: `design_reframe`.

The current direction is not "add one more ledger." The target is an ABG-owned
hook-action contract:

```text
ABG calls plugin.<hook_class>.F_P with EvalBasis<role>
plugin returns Findings<role>
ABG records HookAction<role>
ABG admits or rejects Findings<role>
ABG derives the owning ledger, projection, event, or intent truth
```

Hook class is typed at the ABG contract level. Domain payloads may remain
domain-specific, but they must be bounded by the hook's admitted contract.

## Hook Classes

The first governed hook classes are:

- `traversal`
- `eval`
- `transform`
- `admission`
- `projection`

Each hook class must declare:

- accepted input basis shape
- returned finding shape
- admission policy
- allowed owning output surface
- forbidden authority effects
- predecessor refs required for replay

## Authority Rule

Plugins do not write ledgers, projections, closure decisions, construction
intents, or graph invocation events directly.

Plugins return findings. ABG records the hook call and admits findings. Only
admitted hook findings may feed the owning deterministic surface.

## Required Carrier Family

Design the smallest carrier family that can represent:

- `HookActionRecorded`
- `HookFindingReturned`
- `HookFindingAdmitted`
- `HookFindingRejected`
- `HookContributionProjected`

The names are provisional. The implementation may use event names or projection
carriers that better match the existing ABG M03 runtime vocabulary, but the
semantic roles must remain distinct.

## Evaluation Criteria

- [x] Requirements/design define hook action recording as an ABG runtime law.
- [x] Traversal, eval, transform, admission, and projection hooks have distinct
      hook-class contracts.
- [x] F_P eval findings can be admitted into an owning projection/read-model
      surface without the plugin writing that surface. The proved subcase is
      edge assurance eval through T-131's `EdgeAssuranceEvaluationProjection`.
- [x] Traversal hook findings cannot become selected intent without admission.
- [x] Transform hook evidence cannot close an edge without downstream admitted
      evaluation and closure projection.
- [x] Negative tests reject plugin output that includes direct ledger,
      projection, intent, invocation, or event payload authority outside the
      hook contract.
- [x] Residual full predecessor-only replay is not claimed by this carrier slice.
      It is consolidated into T-132 as the controlling runtime/replay proof.

## Implementation Evidence

Date: 2026-05-13

Changed surfaces:

- `build_tenants/abiogenesis/typescript/design/M03_EDGE_ASSURANCE_CONTRACT_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M03_EDGE_ASSURANCE_CONTRACT_FIRST_SLICE_IACS.md`
- `build_tenants/abiogenesis/typescript/design/M03_EDGE_ASSURANCE_CONTRACT_STRUCTURAL_CARRIER_DIAGRAM.md`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/hook_actions.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/edge_assurance_contract.ts`
- `build_tenants/abiogenesis/typescript/test_env/tests/test_t130_hook_action_typing_model.test.mjs`

Proof commands:

```bash
cd build_tenants/abiogenesis/typescript
npm run build:semantic
npm run lint:semantic
npx eslint --max-warnings=0 test_env/tests/test_t130_hook_action_typing_model.test.mjs test_env/tests/test_t131_edge_assurance_contract.test.mjs
npm run test:t130
npm run test:t130:t131
npm run test:semantic
```

Implementation boundary:

- This closes the T-130 carrier/admission model.
- T-131 closes the F_P edge-eval owning projection/read-model subcase.
- It does not make plugins authoritative. Hook output remains a finding until
  ABG admits it.
- Full predecessor-only replay for runner-consumed edge assurance eval is
  consolidated into T-132.

## Downstream Note

This ticket is the ABG-side counterpart to odd_sdlc's evaluator-owned runner
spine. odd_sdlc may define domain-specific findings and ledgers/registers, but
ABG must own the hook action recording and admission boundary.
