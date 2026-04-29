---
id: T-089
title: Ratify ABG total assurance requirement authority
type: feature
ticket_category: ordinary
status: completed
goal: abg-total-assurance-calculus
goal_status: active
change_intent: Add constitutional requirement authority for ABG-owned total ambiguity projection and closure fold inside the existing GTL edge-traversal / GraphCall / Frame / Continuation boundary, and add the GTL hook acceptance criteria needed for LLM-authored graph functions to declare assurance boundaries through GTL declarations.
change_class: requirement_reprice
re_entry_point: requirement
affected_boundary: ABG assurance projection requirements, GTL governance hook concerns, event/replay closure law, stale-input invalidation, plugin authority boundaries
priority: high
triaged_at: 2026-04-29T07:24:15Z
created_at: 2026-04-29T07:24:15Z
updated_at: 2026-04-29T07:50:10Z
completed_at: 2026-04-29T07:50:10Z
dependencies:
  - T-088 completed
  - T-086 active/awaiting_external_agent_review
  - B-016 completed
governance_scope: STDO Method
product_authority:
  - specification/PRODUCT.md Probabilistic Compute Boundary
  - specification/PRODUCT.md Outcome Compute Contract
intent_authority:
  - specification/INTENT.md GTL / ABG control boundary
  - specification/INTENT.md ABG outcome compute primitive
candidate_requirement_authority:
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - specification/requirements/abg/REQ-R-ABG3-CONVERGENCE.md
  - specification/requirements/abg/REQ-R-ABG3-CORRECTION.md
  - specification/requirements/abg/REQ-R-ABG3-LINEAGE.md
  - specification/requirements/abg/REQ-R-ABG3-POLICY.md
  - specification/requirements/abg/REQ-R-ABG3-PROVENANCE.md
  - specification/requirements/abg/REQ-R-ABG3-RETRY.md
  - specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md
  - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md
related_evidence:
  - .ai-workspace/comments/codex/20260429T172415AEST_T088_requirement_audit.md
intake_source: T-088 requirement audit found that existing ABG/GTL requirements are enabling authority for event truth, replay, convergence, correction, policy, and hook declaration, but no requirement family currently defines total ambiguity rows or a closure fold that blocks premature closure.
target_truth: ABG has explicit requirement authority for total assurance projection over current authority/input snapshot and admitted event truth. The projection emits exhaustive ambiguity rows and the closure fold can close only when every row is fulfilled or release-lawfully deferred. GTL exposes assurance hook declaration authority without owning event calculus or ambiguity semantics.
superseded_truth: ABG can infer closure from worker success, local tests, archive reports, nullable closure registers, or generic proof/closure hooks without a named total ambiguity projection law.
non_goal:
  - Do not design or implement the runtime carriers in this ticket.
  - Do not create a new product-level compute boundary.
  - Do not make GTL a policy DSL, event calculus language, or ambiguity-calculus owner.
  - Do not move downstream SDLC requirement semantics or gain-function quality into ABG.
closure_law: Close only after the requirement layer ratifies either a new `REQ-R-ABG3-ASSURANCE.md` requirement family or equivalent explicit acceptance criteria, and after GTL hook requirements are amended or explicitly adjudicated to expose assurance hook declarations. No design, tenant implementation, or downstream odd_sdlc proof can close this ticket.
evaluation_criteria:
  - Requirement text defines total ambiguity projection over current authority/input snapshot and admitted event truth.
  - Requirement text enumerates at least `fulfilled`, `partial`, `missing`, `stale_input`, `authority_missing`, `orphan_evidence`, `contradictory_authority`, `contradictory_evidence`, `deferred`, and `event_ledger_invalid`.
  - Requirement text defines closure fold outcomes: close, retry, reprice, block, and qualified defer.
  - Requirement text states changed input/authority digest invalidates prior closure projection without erasing event history.
  - Requirement text states plugins may provide authority snapshots, evidence adapters, classifiers, policy providers, and gain adapters, but cannot emit runtime truth or close units.
  - GTL hook requirement text exposes assurance hook refs and opaque config through graph-function/vector declarations while keeping semantics ABG-resolved.
  - Requirement text preserves the product-boundary constraint: no new public `UnitOfCompute` aggregate or product compute boundary without product_reprice.
proof_surface:
  - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
  - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md
  - .ai-workspace/comments/codex/20260429T175010AEST_T089_requirement_closure.md
  - follow-on `T-090` and `T-091` remain open for design and proof
non_closure_conditions:
  - requirement text is replaced by design-only commentary
  - "assurance" is implemented as hidden runtime config rather than declared GTL hook authority plus ABG projection law
  - closure can still be inferred from worker/test/archive success without ambiguity row projection
  - requirement text authorizes a new compute product boundary without product_reprice
---

# T-089: ABG Total Assurance Requirement Authority

This ticket is the inside-out requirement child of T-088.

This ticket closed by adding a new ABG assurance requirement family,
`REQ-R-ABG3-ASSURANCE.md`, plus focused GTL hook amendments. The requirement is
narrow: ABG owns total projection and fold mechanics; downstream domains own
gain functions and evidence meaning behind typed plugin contracts.

## Closure Evidence

Closed at: 2026-04-29T07:50:10Z

Requirement surfaces:

- `specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md`
- `specification/requirements/gtl/REQ-L-GTL3-HOOKS.md`
- `specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md`
- `specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md`

Goal surface:

- `specification/GOALS.md` `GOAL-007`

Follow-on tickets remain open:

- `T-090`
- `T-091`
- `T-092-PY`
- `T-092-TS`
