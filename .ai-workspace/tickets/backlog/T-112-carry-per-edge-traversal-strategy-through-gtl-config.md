---
id: T-112
title: Carry per-edge traversal strategy through GTL config and ABG runtime carriers
type: feature
ticket_category: traversal_strategy_config
status: backlog
goal: rc-next-gtl-qualified-traversal-strategy
change_intent: Make traversal strategy selection an explicit GTL edge/default configuration resolved and carried by ABG, so downstream products can choose full-breadth, steel-thread-like, or repair strategies per graph edge without hidden runtime heuristics or prompt-only policy.
change_class: design_reframe
re_entry_point: design
affected_boundary:
  - specification/requirements/gtl/
  - specification/requirements/abg/
  - build_tenants/abiogenesis/typescript/design/
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/
  - build_tenants/abiogenesis/typescript/test_env/tests/
priority: high
build_tenant: typescript
release_scope: post-3.5.0-rc.1
triaged_at: 2026-05-05
created_at: 2026-05-05
updated_at: 2026-05-05
governance_scope: STDO Method
governance_scope_expansion:
  - S: SPEC_METHOD.md
  - T: TICKET_METHOD.md
  - D: DESIGN_MODULE_METHOD.md
  - O: ODD_METHOD.md
dependencies:
  - T-107 completed ABG traversal modulation profiles for agentic F_P attempts
  - T-108 completed traced process substrate for live worker observability
  - T-111 completed literal PTY/xterm agent executor
downstream_consumers:
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/backlog/T-123-consume-per-edge-traversal-strategy-and-delay-steel-thread-scope.md
evidence_refs:
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-107-define-abg-traversal-modulation-profiles-for-agentic-fp-attempts.md
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/completed/T-121-adopt-steel-thread-delivery-strategy-by-default.md
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/backlog/T-122-add-feature-scope-carrier-for-steel-thread-closure.md
  - /Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test69.TS.cx/.ai-workspace/runtime/odd_sdlc/operator-runs/
proof_commands:
  - npm run build:semantic
  - npm run test:t112
  - npm run test:semantic
intake_source: During the data_mapper test69 Claude PTY live run, the operator observed that steel-thread scope was being applied from the first downstream edge. The corrected model is per-edge traversal strategy: early induction and requirement formation stay full-breadth, while later construction edges may select steel-thread or repair strategies.
target_truth: GTL configuration declares traversal strategy policy at the graph edge/default level. ABG resolves the selected strategy for the current vector through the existing T-107 traversal-modulation boundary, carries it in replay-visible runtime truth, and exposes it to downstream handoff/plugin consumers. ABG enforces generic scheduling primitives and admitted policy refs; it does not hard-code downstream strategy semantics such as "steel thread" or decide when odd_sdlc induction ends.
superseded_truth: A downstream product or prompt layer applies one workspace-wide traversal strategy to all edges, or infers strategy from edge names, CLI flags, env vars, or prose rather than from GTL-published edge/default policy resolved by ABG.
closure_law: Close only when ABG can resolve one selected traversal strategy per graph-vector attempt from GTL configuration, preserve it in runtime/event/handoff carriers, and prove precedence, absence, malformed config, and downstream-consumer projection behavior without embedding downstream product strategy names as ABG runtime law.
non_closure_conditions:
  - strategy selection exists only as prompt prose
  - strategy selection is inferred from edge names without GTL configuration
  - strategy selection is a CLI/env side channel with no replay-visible carrier
  - ABG switches on downstream labels such as steel_thread, waterfall, or feature_slice as semantic runtime law
  - GraphVector configuration, GraphFunction default, and Role/default policy precedence is undefined
  - malformed or duplicate strategy configuration silently falls back to a hidden default
  - downstream consumers cannot observe the selected strategy through the plugin/handoff/runtime projection surface
---

# T-112: Carry Per-Edge Traversal Strategy Through GTL Config

## STDO Triage

### First Missing Layer

Design.

T-107 already established the runtime-law boundary for traversal modulation:
GTL exposes hook/config refs, ABG resolves those refs, and downstream products
own strategy meaning. The remaining gap is a sharper design and realization
slice for one selected strategy per edge traversal.

The observed downstream problem is not that ABG should know when odd_sdlc wants
steel thread. The problem is that the selected traversal strategy must be
published and carried as typed runtime truth so downstream products do not
smuggle strategy through prompt text or workspace-wide defaults.

### Lawful Re-Entry

`design_reframe`.

This ticket composes with T-107. It should update requirement text only if
review finds that existing T-107 authority does not explicitly cover per-edge
selection and downstream projection.

## Target Shape

ABG shall support a resolved traversal strategy selection for every graph-vector
attempt where policy is present or where a declared default applies.

The configuration source is GTL, in precedence order:

```text
1. GraphVector.declarations["abg.traversal_strategy"]
2. GraphFunction.declarations["abg.default_traversal_strategy"]
3. Role.policyHooks["abg.traversal_strategy"]
4. explicit runtime policy default, only when the resolved runtime declares
   absence lawful for the edge
```

The selected strategy carrier should be generic:

```ts
interface TraversalStrategySelection {
  readonly kind: "traversal_strategy_selection";
  readonly selectionRef: string;
  readonly source: "graph_vector" | "graph_function" | "role_policy" | "runtime_default";
  readonly strategyOwnerRef: string;
  readonly strategyLabel: string;
  readonly directiveRef: string;
  readonly enforcementPrimitives: readonly TraversalSchedulingPrimitive[];
  readonly orderingConstraintRefs: readonly string[];
  readonly phaseGateRefs: readonly string[];
  readonly configDigest: string;
}
```

`strategyLabel` is descriptive and product-owned. ABG may persist it, project
it, and pass it to downstream consumers. ABG must not switch on it.

ABG may switch only on the generic primitives and admitted schedule/gate refs
already introduced by T-107.

## Required Refactoring Points

1. Define the per-edge selection carrier.

Add a small typed carrier for resolved traversal strategy selection. It must be
JSON-serializable, digestable, and replay-visible.

2. Resolve strategy before attempt envelope derivation.

The T-107 attempt envelope should consume the resolved selection, not raw
prompt or downstream local state.

3. Preserve GTL precedence.

Tests must prove GraphVector wins over GraphFunction default, GraphFunction
wins over Role/default policy, and explicit absence remains distinct from
malformed presence.

4. Fail closed on malformed strategy configuration.

Malformed attrs, duplicate same-level declarations, unresolved hook refs, and
unadmitted primitive refs must block with typed diagnostic truth. They must not
fall back to a hidden strategy.

5. Expose selected strategy to downstream plugin/handoff consumers.

`EnginePluginInput`, dispatch/handoff carriers, and trace/projection summaries
must expose the selected strategy so downstream products can derive prompt
pressure and assurance scope from the same ABG runtime truth.

6. Keep ABG strategy-neutral.

ABG must not contain odd_sdlc-specific edge phases or strategy labels. It can
carry and enforce generic scheduling primitives only.

## Example Downstream Use

odd_sdlc may publish:

```json
{
  "defaultStrategy": "full_breadth",
  "edges": [
    { "edge": "derive_intent_surface", "strategy": "full_breadth" },
    { "edge": "derive_product_surface", "strategy": "full_breadth" },
    { "edge": "derive_goal_surface", "strategy": "full_breadth" },
    { "edge": "derive_requirement_surface", "strategy": "full_breadth" },
    { "edge": "derive_feature_decomp_surface", "strategy": "steel_thread" },
    { "edge": "derive_uat_testcases_surface", "strategy": "steel_thread" },
    { "edge": "derive_design_surface", "strategy": "steel_thread" }
  ]
}
```

ABG does not interpret "steel_thread". It resolves the edge policy, admits the
generic primitives associated with the strategy directive, and carries the
selection through runtime truth.

## Closure Criteria

- Requirements/design explicitly preserve GTL declaration authority and ABG
  runtime neutrality.
- A typed `TraversalStrategySelection` or equivalent exists.
- Resolution happens before attempt envelope derivation.
- Runtime events or admitted carriers preserve the selected strategy and source.
- Downstream plugin/handoff input can observe the selected strategy.
- Deterministic tests cover precedence, malformed config, absence, and
  projection.
- Tests prove ABG does not branch on downstream strategy labels.

## Non-Closure Conditions

This ticket is not closed by:

- adding a string field to a prompt manifest without ABG resolution;
- using an env var or CLI flag as the strategy source of truth;
- making odd_sdlc edge names part of ABG runtime law;
- carrying strategy but not the resolution source/config digest;
- allowing malformed configuration to silently become full-breadth;
- passing tests only for one downstream product strategy label.
