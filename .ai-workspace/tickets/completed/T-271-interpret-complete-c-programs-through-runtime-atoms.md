# T-271 - Interpret Complete C Programs Through Runtime Atoms

- id: T-271
- title: Interpret complete C programs through the generic runtime atoms
- type: feature
- ticket_category: ordinary
- status: completed
- phase_status: closed_after_fh_remediation_acceptance
- implementation_status: repaired_checkpoint
- proof_status: verified
- review_status: fh_accepted_after_remediation_review
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
- remediation_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260714T075722Z_SELF_REVIEW_t271_post_review_remediation.md
- implementation_commit: f4ab3d4f
- repair_implementation_commit: 3e726aa1
- closure_decision_ref: >-
    .ai-workspace/comments/codex/
    20260714T082119Z_DECISION_fh_accept_and_close_t271_remediation.md
- closed_at: 2026-07-14
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

## Original Checkpoint Evidence

The following evidence described `f4ab3d4f`. The independent review rejected
that checkpoint; these counts are historical and do not admit closure.

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

## Closure Boundary

T-271 closes only the generic complete-program compiler/interpreter and replay
boundary. T-267 still owns whole-program conservation, T-270 owns public
routing, and T-268 owns capability admission. Closure does not permit public
effects or close those successor gaps.

## Review Re-Entry

The post-implementation review rejected checkpoint `f4ab3d4f`. In addition
to four realization defects, it proved that CCALL-002/-004's flat identity
tuple cannot distinguish serial same-role compiled loci or complete nested
retry paths. The bounded requirement reprice adds `programLocusRef` and
`retryPath` only for complete-program calls while preserving the retained flat
compatibility identity. Checkpoint `3e726aa1` received explicit F_H acceptance
after the remediation review; the former block is discharged for T-267 design
re-entry only.

## Remediation Evidence

Checkpoint `3e726aa1` repairs all five review findings without adding a public
router, Consensus branch, graph-recurse constructor, or second runtime:

1. complete and direct retry now share one policy/judgment coordinator;
2. canonical C-call identity includes the compiled node and full nested retry
   path while retaining the flat compatibility tuple;
3. explicit and terminal-workflow results cannot erase each other, and batch
   results derive from task result payloads rather than terminal outputs;
4. batch output/result projection is deterministic, receipt-sealed, and
   rederived on replay; and
5. compilation rederives the complete T-254 selected binding and program.

The remediation self-review also rejected forged shared retry policy evidence
and resealed but altered batch projections before effects. Final proof is
`1717/1717` semantic tests; `56/56` focused T-271 integration tests; `82/82`
GTL tests; packed API `1/1`; exact T-252 body/census check with two remaining
gap families; and green lint, publication, schema, governance, Mermaid, pack,
and diff checks. Explicit F_H acceptance closes T-271. T-267 remains a
separate design and implementation gate.
