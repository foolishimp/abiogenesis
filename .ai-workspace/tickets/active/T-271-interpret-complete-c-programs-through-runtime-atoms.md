# T-271 - Interpret Complete C Programs Through Runtime Atoms

- id: T-271
- title: Interpret complete C programs through the generic runtime atoms
- type: feature
- ticket_category: ordinary
- status: active
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- change_intent: >-
    Turn the verified direct-form atoms into one closed interpreter over
    admitted C program syntax without narrowing lawful composition to the
    canonical body shapes.
- change_class: design_reframe
- re_entry_point: >-
    build_tenants/abiogenesis/typescript/design M03 C-program interpreter
    boundary
- triaged_at: 2026-07-14
- created_at: 2026-07-14
- updated_at: 2026-07-14
- owner: abiogenesis
- build_tenant: typescript
- source_ticket: T-259
- priority: critical
- dependencies:
  - completed T-259 direct workflow.C atom
  - completed T-260 direct HOF and batch atoms
  - completed T-261 direct retry atom
  - active T-262 recurse repair
  - T-269
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
