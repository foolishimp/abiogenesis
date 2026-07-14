# T-271 - Interpret Complete C Programs Through Runtime Atoms

- id: T-271
- title: Interpret complete C programs through the generic runtime atoms
- type: feature
- ticket_category: ordinary
- status: active
- phase_status: implementation_complete_independent_review_pending
- implementation_status: complete
- proof_status: self_review_passed_independent_review_pending
- review_status: independent_post_implementation_review_pending
- delivery_phase: DS-3 integration
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- change_intent: >-
    Turn the verified direct-form atoms into one closed interpreter over
    admitted C program syntax without narrowing lawful composition to the
    canonical body shapes.
- change_class: requirement_reprice
- re_entry_point: >-
    specification/requirements/abg/REQ-R-ABG3-CCALL.md -002/-004 complete
    program locus identity, then the M03 C-program interpreter boundary
- triaged_at: 2026-07-14
- created_at: 2026-07-14
- updated_at: 2026-07-14
- owner: abiogenesis
- build_tenant: typescript
- source_ticket: T-259
- design_ref: >-
    build_tenants/abiogenesis/typescript/design/
    M03_COMPLETE_C_PROGRAM_INTERPRETER_BEHAVIOR_DESIGN.md
- design_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260714T040000Z_SELF_REVIEW_t271_complete_c_program_interpreter_design.md
- design_decision_ref: >-
    .ai-workspace/comments/codex/
    20260714T040100Z_DECISION_delegated_fh_accept_t271_design.md
- self_review_ref: >-
    .ai-workspace/comments/codex/
    20260714T065100Z_SELF_REVIEW_t271_complete_c_program_interpreter.md
- implementation_commit: f4ab3d4f
- priority: critical
- dependencies:
  - completed T-259 direct workflow.C atom
  - completed T-260 direct HOF and batch atoms
  - completed T-261 direct retry atom
  - completed T-262 recurse repair
  - completed T-269 declaration and bind-stage law
- authority_refs:
  - specification/PRODUCT.md atom criterion
  - specification/requirements/gtl/REQ-L-GTL3-C-ALGEBRA.md
  - specification/requirements/abg/REQ-R-ABG3-CCALL.md

## Boundary

Compile and interpret every admitted `C.of`, `C.id`, `C.compose`, `C.edge`,
`workflow.C`, `C.batch`, and `C.retry` term through the existing atom
resolvers. Preserve declared order, carriers, fibres, result-bearing role,
retry/recurse budgets, lineage, and replay. No Consensus vocabulary, service
controller, or second traversal loop enters the interpreter.

## T-252 Census Gap Ownership

- gap_family: complete_c_program_interpreter

## Exit

Mixed and nested positive fixtures exercise each lawful constructor family;
carrier mismatch, stale replay, undeclared role, and unsupported recursive
shape fail as typed compiler or runtime gaps before effects. The canonical
Consensus program is one consumer, not a special branch.

## Implementation Evidence

- `f4ab3d4f` compiles the closed seven-constructor C family into one sealed
  plan and interprets that plan through the retained workflow, batch, retry,
  and C-call atom boundaries.
- Native and canonical raw syntax produce the same plan digest; mixed
  sequence, nested batch, nested retry, identity, and edge fixtures execute
  without flattening authored structure.
- Replay admission rejects stale seals, non-contiguous future receipts,
  predecessor drift, invalid task/retry coordinates, caller-substituted
  catalog authority, and resealed plan-authority drift before effects.
- The T-252 probe derives exact plans for all 34 selected vectors and covers
  all 19 authored programs. Its body digest remains unchanged and only the
  T-267 conservation and T-268 capability-manifest gaps remain.
- Full semantic suite: 1710/1710.
- Focused T-271/T-260/T-261/T-255/T-252 lane: 49/49; GTL law: 82/82;
  packed installed proof: 1/1.
- Semantic lint, GTL authority guard, DS governance, 66 Mermaid diagrams,
  public schema/publication verification, T-252 manifest check, and
  `git diff --check` pass.

## Non-Closure

The implementation checkpoint is complete, but the ticket remains active
until independent post-implementation review accepts the compiler,
interpreter, replay, and proof surfaces. T-267 still owns whole-program
conservation, T-270 owns public routing, and T-268 owns capability admission;
this checkpoint does not permit public effects or close those gaps.

## Review Re-Entry

The post-implementation review rejected checkpoint `f4ab3d4f`. In addition
to four realization defects, it proved that CCALL-002/-004's flat identity
tuple cannot distinguish serial same-role compiled loci or complete nested
retry paths. The bounded requirement reprice adds `programLocusRef` and
`retryPath` only for complete-program calls while preserving the retained flat
compatibility identity. T-271 remains active and T-267 remains blocked until
the repaired implementation receives independent acceptance.
