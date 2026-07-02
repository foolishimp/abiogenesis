---
id: T-185
title: Ratify GTL program overlay and ABG traversal monad abstraction
type: requirements_design
ticket_category: program_traversal_abstraction
status: completed
goal: >-
  Make the library/program/workspace/runtime abstraction explicit in GTL/ABG:
  graph functions are reusable workflow library functions, graph overlays or
  GTL program compositions are programs, workspaces are mutable instance
  surfaces, and ABG traversal is the event-sourced runtime bind over admitted
  program and workspace truth.
change_intent: >-
  odd_glc parity work exposed a recurring abstraction inversion. Downstream
  work treated graph functions as the whole program and then added slot maps,
  scenario-specific shells, direct vector calls, and local traversal labels to
  recover missing program shape. The corrected abstraction is ordinary and
  stricter: graph functions are bindable library functions; graph overlays are
  programs; workspaces provide mutable data/config/state; ABG owns traversal.
change_class: requirement_reprice
re_entry_point: gtl_abg_program_traversal_mapping
owner: abiogenesis
priority: high
triaged_at: 2026-07-03
created_at: 2026-07-03
updated_at: 2026-07-03
governance_scope: STDO Method, SPEC_METHOD, DESIGN_MODULE_METHOD, ODD_METHOD, GTL, ABG Runtime, Mapping, Traversal
build_tenant: typescript
depends_on:
  - .ai-workspace/tickets/completed/T-177-design-live-abg-runtime-graph-function-registry-lookup.md
  - .ai-workspace/tickets/completed/T-180-ratify-reusable-gtl-node-types-and-type-composition.md
  - .ai-workspace/tickets/completed/T-183-design-and-realize-abg-instruction-assembly-semantic-compiler.md
  - .ai-workspace/tickets/completed/T-184-consolidate-canonical-installed-live-hello-world-proof.md
source_documents:
  - .ai-workspace/comments/codex/20260702T152228Z_STRATEGY_abg_traversal_monad_domain_state_model.md
  - specification/PRODUCT.md
  - specification/INTENT.md
  - specification/requirements/mapping/REQ-M-GTL3-PROGRAM-TRAVERSAL.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
  - specification/requirements/abg/REQ-R-ABG3-INTERPRET.md
review_status: self_reviewed
proof_status: passed
target_truth: >-
  The ABI constitutional surface no longer invites product-local slot maps or
  shell-based traversal by confusing graph functions with whole programs.
  Specifications and requirements state one abstraction: reusable graph
  functions live in system/product libraries; graph overlays or GTL program
  compositions are the program surface; workspaces provide mutable bootstrap
  config and data; ABG startup admits the program and workspace binding; ABG
  traversal owns selection, graph call, vector progression, effects,
  admission, fold, continuation, and replay.
superseded_truth: >-
  A graph function is casually treated as the whole product program, a
  workspace or slot map supplies the missing program shape, and proof harnesses
  call vectors or plugins directly while calling the result traversal.
closure_law: >-
  Close only when the strategy post, ticket, product/intent text, mapping
  requirement, and graph-function wording agree on the corrected abstraction,
  and when the proof commands show no live constitutional surface still makes a
  product-local slot map, workspace shell, direct vector call, or graph function
  stand in for admitted GTL program plus ABG traversal truth.
non_closure_conditions:
  - A live constitutional surface says a graph function is the whole product
    program without qualifying it as a reusable library function or callable
    work contract.
  - A graph overlay or GTL program composition is described only as metadata
    and not as the program surface that binds functions, vectors, node types,
    starts, roles, security, policies, proof obligations, and plugin/result
    contracts.
  - A workspace is allowed to select graph functions, call graph vectors, own
    traversal state, own closure truth, or replace ABG startup/admission.
  - A slot map, lifecycle map, catalog view, or parity matrix is treated as
    traversal source truth instead of a ratified GTL declaration or
    replay-derived index.
  - A test or proof harness can call a vector/plugin/worker directly and claim
    traversal parity without ABG startup or a documented ABG resume boundary.
required_work:
  - >-
    Phase 1 - Correct the strategy post into a single coherent narrative:
    traversal monad, graph functions as library functions, overlay/program as
    program, workspace as mutable instance surface, ABG as traversal runtime.
  - >-
    Phase 2 - Add the mapping requirement family that makes the abstraction
    constitutional and names the owner/source truth rows.
  - >-
    Phase 3 - Update PRODUCT and INTENT so the current product shape and
    direction no longer invert the programming abstractions.
  - >-
    Phase 4 - Update graph-function and language-capability wording so
    graph functions are reusable library-function carriers and callable work
    contracts, not whole product programs or program overlays.
  - >-
    Phase 5 - Run textual proof gates and record any remaining design/code
    follow-up as successor work rather than closing over ambiguity.
acceptance_criteria:
  - The post states the corrected abstraction and identifies execution as an
    effect inside traversal, not the traversal monad.
  - A live mapping requirement defines graph function, overlay/program,
    workspace, startup, traversal state, derived indexes, and test/proof
    boundaries.
  - PRODUCT and INTENT state graph functions as reusable workflow library
    functions and graph overlays/program compositions as program surfaces.
  - GTL graph-function law distinguishes graph functions from whole product
    programs when overlays/program compositions are present.
  - Requirement text forbids slot maps, workspace shells, direct vector calls,
    and local catalogs from masquerading as ABG traversal truth.
proof_commands:
  - git diff --check
  - rg -n "workflow library function|workflow-library|overlay.*program|program composition|workspace.*mutable|traversal monad" specification/PRODUCT.md specification/INTENT.md specification/requirements .ai-workspace/comments/codex/20260702T152228Z_STRATEGY_abg_traversal_monad_domain_state_model.md
  - rg -n "REQ-M-GTL3-PROGRAM-TRAVERSAL-00[1-9]|REQ-M-GTL3-PROGRAM-TRAVERSAL-01[0-2]" specification/requirements/mapping/REQ-M-GTL3-PROGRAM-TRAVERSAL.md
  - "! rg -n \"slot map.*source truth|workspace.*select graph functions|direct vector call.*traversal parity|overlay.*metadata only|primary published program form|graph functions are the program surface|primary reusable program carrier|reusable program carrier|workflow program abstraction|GraphFunction.*program carrier|graph-function program\" specification/PRODUCT.md specification/INTENT.md specification/requirements AGENTS.md CLAUDE.md build_tenants/abiogenesis/typescript/design"
notes:
  - This ticket is a constitutional clarity ticket. It does not implement a new
    traversal engine or rewrite runtime code.
---

# T-185: GTL Program Overlay And ABG Traversal Monad

The correction is intentionally ordinary:

```text
graph-function library -> overlay/program -> workspace binding -> ABG traversal -> replay interpretation
```

The ticket prevents future downstream work from filling a missing program model
with product-local slot maps or vector-call harnesses. If implementation gaps
remain after the constitutional correction, they should be opened as successor
runtime/design tickets against the admitted program/startup/traversal chain.

## Successor Design Work

The constitutional correction ratifies the WHAT. The remaining HOW follow-up is
a domain/state model in the TypeScript design pack that shows how admitted GTL
program composition and workspace binding become ABG startup state, registry
projection, selection, graph call, traversal basis, frame/span lineage,
instruction assembly, effect invocation, admission, assurance, continuation,
and replay. No closure claim may treat a workspace shell, direct vector harness,
or graph-function-only surface as that state model.

## Closure Record

Closed on 2026-07-03 as a constitutional clarity and requirement-reprice
ticket.

Changed surfaces:

- `.ai-workspace/comments/codex/20260702T152228Z_STRATEGY_abg_traversal_monad_domain_state_model.md`
- `specification/PRODUCT.md`
- `specification/INTENT.md`
- `specification/requirements/mapping/REQ-M-GTL3-PROGRAM-TRAVERSAL.md`
- `specification/requirements/mapping/README.md`
- `specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md`
- `specification/requirements/gtl/REQ-L-GTL3-GRAPH.md`
- `specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md`
- `specification/GOALS.md`

Proof commands:

- `git diff --check` - passed.
- `rg -n "workflow library function|workflow-library|overlay.*program|program composition|workspace.*mutable|traversal monad" specification/PRODUCT.md specification/INTENT.md specification/requirements .ai-workspace/comments/codex/20260702T152228Z_STRATEGY_abg_traversal_monad_domain_state_model.md` - passed.
- `rg -n "REQ-M-GTL3-PROGRAM-TRAVERSAL-00[1-9]|REQ-M-GTL3-PROGRAM-TRAVERSAL-01[0-2]" specification/requirements/mapping/REQ-M-GTL3-PROGRAM-TRAVERSAL.md` - passed.
- `rg -n "slot map.*source truth|workspace.*select graph functions|direct vector call.*traversal parity|overlay.*metadata only" specification/PRODUCT.md specification/INTENT.md specification/requirements` - no matches.

Resulting law:

```text
graph-function library -> overlay/program -> workspace binding -> ABG traversal -> replay interpretation
```

No runtime implementation was changed by this ticket.
