---
id: T-178
title: Design event-sourced registry entry retirement, revocation, and supersession
type: design
ticket_category: runtime_registry_lifecycle
status: backlog
goal: >-
  Define the event-sourced lifecycle path for registry entries after admission,
  including retirement, revocation, supersession, stale-entry exclusion, and
  historical replay visibility.
change_intent: >-
  T-177 records registry entry retirement/supersession as an operational
  lifecycle gap. This ticket owns the follow-on design so the live registry
  does not infer replacement or stale-entry behavior from mutable state,
  product-local config, or query-local projection.
change_class: design_reframe
re_entry_point: design
owner: abiogenesis
priority: medium
triaged_at: 2026-06-30
created_at: 2026-06-30
governance_scope: STDO Method, DESIGN_MODULE_METHOD, GTL, ABG Runtime, Registry
build_tenant: typescript
depends_on:
  - .ai-workspace/tickets/active/T-177-design-live-abg-runtime-graph-function-registry-lookup.md
source_documents:
  - specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md
  - specification/requirements/gtl/REQ-L-GTL3-SELECTION-BOUNDARY.md
  - build_tenants/abiogenesis/typescript/design/M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_API_EVENT_PROJECTION_PROOF_PLAN.md
target_truth: >-
  Registry retirement, revocation, and supersession are admitted ABG runtime
  facts, replay-derived into registry projection status, and visible as
  historical truth without allowing stale entries to remain eligible for new
  runtime selection.
superseded_truth: >-
  Registry entries become stale, replaced, retired, revoked, or superseded by
  mutable registry state, product config changes, local files, or query-local
  inference.
closure_law: >-
  Close only after the design defines event kinds, projection status rules,
  eligibility exclusion rules, startup/replay behavior, and negative proofs
  that stale or revoked entries cannot be selected while remaining visible in
  historical replay.
non_closure_conditions:
  - Retirement, revocation, or supersession is represented as mutable registry
    state instead of emitted ABG runtime truth.
  - Product startup config can retire, revoke, or supersede an entry without
    ABG admission.
  - A stale, revoked, or superseded entry remains eligible for runtime
    selection.
  - Projection hides historical admitted entries instead of preserving replay
    visibility with current eligibility status.
required_work:
  - Define `registry_entry_retired`, `registry_entry_revoked`, and
    `registry_entry_superseded` event semantics or a justified consolidated
    event family.
  - Define projection status rows for current, retired, revoked, superseded,
    and stale entries.
  - Define eligibility exclusion rules for non-current entries.
  - Define replay and startup behavior when historical lifecycle events are
    present.
  - Add positive and negative proofs for retirement, revocation, supersession,
    stale exclusion, and historical visibility.
proof_commands:
  - git diff --check
---

# T-178: Event-Sourced Registry Entry Lifecycle

Backlog follow-on from T-177. This ticket is not required to prove initial
registry startup/admission/lookup/selection, but it is required before the live
registry may claim active replacement, stale-entry exclusion, revocation, or
supersession semantics.
