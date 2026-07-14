# T-273 - Restore DS-1 Through DS-3 Governance Gate Coverage

- id: T-273
- title: Restore ticket, design, and public-contract governance coverage
- type: chore
- ticket_category: ordinary
- status: active
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- change_intent: >-
    Make the mechanical governance surfaces observe every current DS-1 through
    DS-3 ticket and accepted three-view design, and reconcile known claim and
    metadata drift before renewed closure.
- change_class: realization_refactor
- re_entry_point: >-
    build_tenants/abiogenesis/typescript/test_env/gates and current ticket
    metadata
- triaged_at: 2026-07-14
- created_at: 2026-07-14
- updated_at: 2026-07-14
- owner: abiogenesis
- build_tenant: typescript
- priority: high
- dependencies: []
- authority_refs:
  - specification_methodology/specification/standards/TICKET_METHOD.md
  - specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md

## Boundary

Backfill required intake fields on the DS-1 through DS-3 ticket wave; register
every accepted three-view design without a hard-coded file count; persist
external review references; narrow T-257's reassessment overclaim; align F_H
`i_json` null metadata with schema/runtime truth; and add a structural guard
that keeps the retained raw fan-in primitive outside package and production
imports.

## Exit

Ticket and design gates fail when a required field or accepted design is
missing. The Mermaid gate derives its expected set from the register rather
than a numeric constant. Public metadata, schema, and runtime agree on null.
No closure record cites a review artifact that does not exist.
