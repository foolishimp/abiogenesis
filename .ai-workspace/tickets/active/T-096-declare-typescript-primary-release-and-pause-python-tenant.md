---
id: T-096
title: Declare TypeScript primary release and pause Python tenant work
type: feature
ticket_category: ordinary
status: active
review_status: awaiting_external_agent_review
goal: abg-total-assurance-calculus
goal_status: active
change_intent: Reprice the active release lane so TypeScript is the primary release realization and Python is retained only as paused released-reference evidence until explicitly reactivated.
change_class: product_reprice
re_entry_point: product
affected_boundary: tenant registry, product shape, release gate, qualification map, active ABG assurance/payload tickets, Python parity claims, TypeScript RC readiness
priority: high
triaged_at: 2026-04-30T00:50:46+10:00
created_at: 2026-04-30T00:50:46+10:00
dependencies:
  - T-086 active/awaiting_external_agent_review
  - T-090 active/awaiting_external_agent_review
  - T-091 active/external_review_blockers_resolved_pending_re_review
  - T-092-TS active/external_review_blockers_resolved_pending_re_review
  - T-093-TS active/external_review_blockers_resolved_pending_re_review
  - T-094 active/external_review_blockers_resolved_pending_re_review
  - T-095 active/external_review_blockers_resolved_pending_re_review
  - T-095-TS active/external_review_accepted_closure_ready
governing_library:
  - build_tenants/TENANT_REGISTRY.md
  - specification/PRODUCT.md
  - specification/GOALS.md
  - build_tenants/common/qualification/qualification_surface_map.md
governance_scope: STDO Method
intake_source: The active ABG assurance/payload tranche produced strong TypeScript deterministic and Claude-live proof, while Python parity work became a separate implementation/audit lane. The user directed that TypeScript is now the primary release line and Python work is suspended going forward.
target_truth: TypeScript is the active primary release realization for GTL + ABG. Python remains a paused released reference line whose historical tests, audits, and archives may inform review but do not block or close the TS-primary RC gate.
superseded_truth: Python remains the canonical released line, Python parity work remains an active RC gate, or TypeScript cannot proceed to RC readiness without opening further Python implementation work.
closure_law: Close only after another agent accepts that the tenant registry, product/readme surfaces, qualification map, and active tickets consistently state the TS-primary/Python-paused scope. This ticket must not close by claiming Python parity or by deleting Python evidence.
evaluation_criteria:
  - `build_tenants/TENANT_REGISTRY.md` marks `abiogenesis/typescript` as `Primary Release`.
  - `build_tenants/TENANT_REGISTRY.md` marks `abiogenesis/python` as `Paused`.
  - Product and README surfaces no longer describe Python as the active canonical released line.
  - Qualification surfaces identify TypeScript as the primary proof lane and Python as paused reference evidence.
  - T-092-PY, T-094-PY, and T-095-PY are paused rather than closed.
  - T-094 and T-095 do not claim Python parity, Python no-gap sufficiency, or Python tenant closure.
  - The ABG assurance/payload tranche remains active until external review accepts the TS-primary scope and the TypeScript proof evidence.
  - The external review tranche includes T-086, T-090, T-091, T-092-TS, T-093-TS, T-094, T-095, T-095-TS, and T-096.
proof_surface:
  - build_tenants/TENANT_REGISTRY.md
  - specification/PRODUCT.md
  - specification/GOALS.md
  - README.md
  - build_tenants/common/qualification/qualification_surface_map.md
  - build_tenants/abiogenesis/README.md
  - build_tenants/abiogenesis/typescript/README.md
  - build_tenants/abiogenesis/typescript/design/README.md
  - .ai-workspace/tickets/active/T-092-PY-realize-python-abg-total-assurance-projection-and-closure-fold.md
  - .ai-workspace/tickets/active/T-094-PY-audit-python-live-uat-parity-or-sufficiency-for-test35-assurance-proof.md
  - .ai-workspace/tickets/active/T-095-PY-audit-python-event-sourced-payload-ledger-parity-or-sufficiency.md
  - .ai-workspace/tickets/active/T-094-prove-requirement-derived-live-uat-reproduces-test35-effectiveness-through-abg-assurance.md
  - .ai-workspace/tickets/active/T-095-define-event-sourced-abg-payload-ledger-and-legal-proof-topology.md
  - .ai-workspace/comments/codex/20260430T005046AEST_TS_primary_release_python_paused_scope.md
non_closure_conditions:
  - Python parity is silently assumed from TypeScript proof.
  - Python evidence is deleted or rewritten as if the gap never existed.
  - A paused Python ticket is treated as active RC blocker after the tenant-scope review accepts the pause.
  - TypeScript RC readiness is claimed before another agent reviews the new tenant scope.
---

# T-096: TypeScript Primary Release Scope

This ticket records the release-lane reprice.

TypeScript is now the primary release realization for the current GTL + ABG cut.
Python is paused. Existing Python tests, audits, and archives remain reference
evidence, but they are not active release gates while the tenant registry keeps
Python paused.

## Disposition

| Surface | New disposition |
| --- | --- |
| `abiogenesis/typescript` | Primary release line and active RC gate |
| `abiogenesis/python` | Paused released reference line |
| `T-092-PY` | Paused, retained as assurance-projection reference evidence |
| `T-094-PY` | Paused, retained to prevent silent Python live-UAT parity claims |
| `T-095-PY` | Paused, retained with forensic conclusion that Python is not payload-ledger equivalent today |
| `T-094` | TypeScript-primary live proof; no Python parity claim |
| `T-095` | TypeScript-primary payload-ledger proof; no Python parity or no-gap claim |

## Review Ask

External STDO review should check that this is a lawful product reprice, not a
hidden implementation shortcut. The review should reject the scope if any active
surface still claims Python as canonical release truth, or if any ticket uses
the Python pause to imply Python sufficiency.
