---
id: T-118
title: Complete ABG defaults bundle expansion after plugin observer slice
type: feature
ticket_category: default_policy_visibility
status: backlog
goal: rc-next-visible-abg-defaults
change_class: design_reframe
re_entry_point: design
created_at: 2026-05-06T02:14:45+10:00
updated_at: 2026-05-06T02:14:45+10:00
owning_repo: abiogenesis
governance_scope: STDO Method
priority: medium
build_tenant: typescript
depends_on:
  - T-117
related_tickets:
  - T-110
  - T-111
  - T-113
  - T-116
affected_boundary:
  - specification/requirements/abg/REQ-R-ABG3-POLICY.md
  - specification/requirements/abg/REQ-R-ABG3-PROVENANCE.md
  - specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md
  - build_tenants/abiogenesis/typescript/config/
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/
  - build_tenants/abiogenesis/typescript/code/src/app/m04/
  - build_tenants/abiogenesis/typescript/code/src/shared/
intake_source: External STDO review accepted the T-117 plugin traversal observer fallback slice but found that the ticket overclaimed complete default externalization.
target_truth: All product-affecting ABG defaults are classified as configurable defaults, internal code constants, or test-only defaults, and every configurable runtime default has visible config/provenance or an explicit non-configurability reason.
superseded_truth: Runtime defaults remain hidden as optional-field fallbacks, local constants, prompt prose, test harness convention, or installer behavior without a durable defaults-bundle decision.
---

# T-118 Complete ABG Defaults Bundle Expansion After Plugin Observer Slice

## STDO Triage

### First Missing Layer

Design.

T-117 externalized the plugin traversal observer fallback bundle and proved
runtime provenance for that first `abg_defaults` member. The remaining default
families still need a design slice that decides which values become
configurable defaults and which remain internal invariants or test-only
conventions.

### Lawful Re-Entry

`design_reframe`.

Do not move hidden defaults directly into code. First declare the defaults
family, classification, precedence, file/install surface, and replay-visible
provenance rule.

## Scope

Audit and close the remaining default families left visible by T-117:

- transport executor defaults such as `local-spawn`;
- PTY command, capability probe, polling, and terminal session defaults;
- actor timeout, heartbeat, termination grace, and inactivity defaults;
- parser inference such as Claude stream JSON versus generic text;
- worker binding fallbacks such as `workerRef ?? agentKey`;
- trace and archive path defaults;
- environment sanitation policy defaults;
- retry, continuation, and non-progress budget defaults;
- traversal modulation local defaults;
- M04 request defaults such as `until`, max-autonomy mode, asset-addressing
  keys, and timeout values;
- installer refresh defaults not already closed by T-117;
- live-test and harness defaults that must remain `test_only_default`.

## Acceptance Criteria

- Each family above is classified as `configurable_default`, `code_constant`, or
  `test_only_default`, with a reason when not configurable.
- Every `configurable_default` has a visible bundle/config path and schema
  admission rule.
- Runtime decisions that consume configurable defaults record bundle ref,
  digest, config path when file-backed, selected key, and override source.
- Installed workspaces preserve user-editable default config across refreshes
  for every installed config file added by this ticket.
- Malformed defaults config fails closed; missing optional config follows a
  declared absence law.
- Deterministic tests prove load, override, malformed, missing, refresh, and
  projection/provenance behavior for every closed family.
- Any live-lane defaults remain test-only and cannot become runtime authority.

## Non-Closure Conditions

- A runtime-affecting default remains as an unclassified `??`, local constant,
  prompt prose convention, or installer side effect.
- A configurable default can affect behavior without replay-visible
  provenance.
- A test harness default is copied into product runtime config without explicit
  policy authority.
- T-117 plugin traversal observer fallback behavior regresses while expanding
  the broader defaults bundle.
