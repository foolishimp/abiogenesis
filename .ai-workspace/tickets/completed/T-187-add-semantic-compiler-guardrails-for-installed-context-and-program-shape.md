---
id: T-187
title: Add semantic compiler guardrails for installed context and program shape
type: requirement_realization
ticket_category: semantic_compiler_guardrails
status: completed
goal: >-
  Make the semantic compiler/GTL program conformance surface catch the drift
  that T-185 and T-186 corrected: public starts bypassing overlays, context
  bootstrap masquerading as traversal runtime, and stale installed context
  compression reintroducing the old graph-function-as-program abstraction.
change_intent: >-
  The installer owns materialization and marker refresh. The semantic compiler
  owns conformance. It should fail closed or report when selected startup,
  runtime binding, or installed context surfaces violate the library/program/
  workspace/traversal split.
change_class: requirement_reprice
re_entry_point: gtl_program_conformance_semantic_compiler
owner: abiogenesis
priority: high
triaged_at: 2026-07-03
created_at: 2026-07-03
updated_at: 2026-07-03
governance_scope: STDO Method, SPEC_METHOD, GTL Program Conformance, Semantic Compiler, T-185, T-186
build_tenant: typescript
depends_on:
  - .ai-workspace/tickets/completed/T-185-ratify-gtl-program-overlay-and-abg-traversal-monad.md
  - .ai-workspace/tickets/completed/T-186-install-versioned-abg-gtl-context-bootstrap.md
source_documents:
  - specification/requirements/mapping/REQ-M-GTL3-PROGRAM-TRAVERSAL.md
  - specification/requirements/product/REQ-P-INSTALL.md
review_status: self_reviewed
proof_status: passed
target_truth: >-
  The compiler/conformance surface rejects graph-function-only public starts,
  rejects context bootstrap or product-local shells as traversal runtime, and
  validates installed context compression as selected-version context rather
  than downstream source truth.
closure_law: >-
  Close only when requirement law names the compiler guardrails and TypeScript
  conformance tests prove differential rejection for overlay bypass,
  context-bootstrap-as-runtime, and stale/mismatched installed context.
non_closure_conditions:
  - A public start can claim traversal parity with no overlay/program
    composition.
  - `abg.install` or another context bootstrap command can be admitted as the
    traversal runtime command.
  - Stale installed context text that says graph functions are the program
    surface passes conformance.
  - Installed context row metadata can claim the current ABI version while the
    embedded context body declares a different `Version:`.
  - Validated installed context rows can change without changing the
    conformance inventory digest.
  - The semantic compiler writes context files instead of reporting/rejecting
    drift.
required_work:
  - Extend program traversal mapping law with semantic compiler guardrails.
  - Add installed-context conformance rows.
  - Require public starts to be overlay/program-backed.
  - Require runtime bindings to use canonical ABG start for traversal runtime.
  - Add differential tests for stale context and context-bootstrap misuse.
  - Bind installed context body version and installed context row content into
    conformance identity.
acceptance_criteria:
  - Direct graph-function public starts without overlay/program composition are
    rejected.
  - Runtime bindings using `abg.install` are rejected as non-traversal context
    bootstrap.
  - Installed context rows are checked for selected product version and current
    abstraction text.
  - Installed context rows are checked against the embedded context `Version:`
    line, not only caller-supplied row metadata.
  - Installed context row content contributes to the inventory digest.
  - Current installed context rows pass.
  - Stale/mismatched installed context rows fail.
proof_commands:
  - git diff --check
  - cd build_tenants/abiogenesis/typescript && npm run test:t159
  - cd build_tenants/abiogenesis/typescript && npm run test:t076
  - cd build_tenants/abiogenesis/typescript && npm run test:t183
notes:
  - The semantic compiler does not materialize or edit context. It validates
    context and startup shape; the installer writes files.
---

# T-187: Semantic Compiler Guardrails

Closed on 2026-07-03.

The guardrails enforce the split:

```text
installer: materializes and refreshes context
semantic compiler: validates and rejects drift
ABG traversal: runs admitted program/workspace truth
```

Post-review hardening on 2026-07-03:

- Installed context validation now parses the embedded `Version:` line and
  rejects body/row version drift.
- Installed context rows now contribute to `inventoryDigests` and the aggregate
  `inventoryDigest`.
- Public docs were corrected to avoid re-seeding graph-function-as-program
  wording.
