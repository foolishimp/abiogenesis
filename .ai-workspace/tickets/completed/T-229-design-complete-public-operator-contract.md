# T-229 - Design The Complete Public Operator Contract

- id: T-229
- title: Design the complete public operator contract
- type: feature
- ticket_category: ordinary
- status: superseded
- closed_at: 2026-07-12
- terminal_disposition: superseded_by_demand_driven_reentry
- disposition_authority: F_H course-correction ruling 2026-07-12, carried by T-242
- goal: abg-5-0-full-product-delivery
- phase: DS-3
- priority: high
- change_intent: >-
    Define one exact tenant-invariant SDK contract and thin CLI grammar for all
    current public ingress, reads, actions, F_H acts, observer/tuner operations,
    conformance operations, install operations, and lifecycle truth.
- change_class: design_reframe
- re_entry_point: build_tenants/abiogenesis/typescript/design
- triaged_at: 2026-07-11
- created_at: 2026-07-11
- updated_at: 2026-07-11
- source_ticket: T-218
- build_tenant: typescript
- affected_boundary: M04 versioned public SDK/CLI contract over M03-owned runtime admission and replay truth
- dependencies:
  - T-227
  - T-228
- authority_refs:
  - specification/PRODUCT.md
  - specification/requirements/product/REQ-P-POLICY.md
  - specification/requirements/product/REQ-P-CATALOG.md
  - specification/requirements/product/REQ-P-INSTALL.md
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md
  - specification/requirements/abg/REQ-R-ABG3-FP-CONSCIOUSNESS.md
  - specification/requirements/abg/REQ-R-ABG3-TUNER.md
  - specification/requirements/abg/REQ-R-ABG3-SUPERVISOR-WITNESS.md

## Target Truth

One public SDK owns the exact contract for the current public operation
families. `abg.cli` and the selected Codex projection are adapters over it.
Reads are replay-derived and non-mutating; actions are admitted, actor-
attributed mutations; ABG owns frontier, traversal, event, and closure truth.
The primary loop is start, truthful stop/hold/gap, inspect lawful actions,
remove one ambiguity or submit a typed F_H act, then resume or start again.

## Required Work

1. Census every realized operation and assign public, adapter-only, internal,
   superseded, or install-time status.
2. Define exact request, response, default, error, identity, actor, capability,
   and read/write semantics for start/resume, status/result/replay,
   gaps/lawful-actions, F_H selection/approval/rejection/assessment/escalation
   response, assess-result, witness, observe, tune, typecheck, catalog, and install.
   Bind every row to its exact `abg.operation.*` identity and contract-catalog locator.
3. Define public resume over run/continuation identity without exposing private frontier state.
4. Bind each F_H act to its pending interaction and capability provenance.
5. Define a host-neutral invocation descriptor and trivial Codex CLI/skill mapping.
6. Define structural prohibitions against adapter-owned orchestration.
7. Define cumulative public-contract-catalog rows, schema assets, native symbols,
   compatibility/version rules, and complete operation-catalog closure checks.
8. Publish design, IACS, carrier diagram, grammar table, and migration order.

## Closure Law

Close when every current PRODUCT operation has one exact public disposition
and T-230 can implement the complete SDK/CLI/operator loop without inventing
verbs, mutability, actor semantics, or runtime authority.

## Non-Closure Conditions

- An existing present-tense PRODUCT operation is omitted as inconvenient or late.
- A query mutates runtime state or an action bypasses event admission.
- Resume accepts caller-constructed private continuation/frontier state.
- CLI or Codex projection invokes workers or owns traversal/retry/closure.
- A scheduler, automatic wake, hosted marketplace, multi-user RBAC, or second host adapter enters scope.

## Proof Surface

- realized-operation census with terminal disposition
- per-operation contract table
- read/write and actor-attribution review
- adapter structural-boundary review
- phase-end independent review against T-218, PRODUCT, and requirements

## Course-Correction Closure Record (2026-07-12)

- Disposition: superseded_by_demand_driven_reentry
- Authority: F_H ruling 2026-07-12 ("run the course correction ... retire anything
  overblown"), carried by T-242; analysis: rev 3 of
  `.ai-workspace/comments/claude/20260711T151500Z_STRATEGY_5_0_course_correction_glc_over_abg_build_environment.md`.
- Reason: Designs the complete public operator contract (DS-3) ahead of any consumer demand; genesis-ts start/gaps/witness/tune already drives campaigns end-to-end.
- Re-entry: Demand-driven: pulled per-verb when the GTL-5 campaign surface needs an operation the current CLI/SDK lacks.
- No code, specification, design, or release surface changed by this closure.
