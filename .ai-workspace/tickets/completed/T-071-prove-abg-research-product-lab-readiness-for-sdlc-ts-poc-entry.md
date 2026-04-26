# T-071 Prove ABG Research Product Lab Readiness For SDLC TS PoC Entry

- id: T-071
- title: Prove ABG research product lab readiness for SDLC TS PoC entry
- type: qualification
- ticket_category: product_readiness_gate
- status: completed
- build_tenant: typescript
- goal: research-product-lab-abg-sufficiency
- change_intent: Decide whether ABG/GTL is complete and functional enough to start the SDLC.TS PoC as an ODD-native downstream product, based on explicit evidence rather than confidence in the substrate.
- change_class: product_reprice
- re_entry_point: product_definition
- triaged_at: 2026-04-26
- governance_scope: STDO Method
- governance_scope_expansion:
  - S: `SPEC_METHOD.md`
  - T: `TICKET_METHOD.md`
  - D: `DESIGN_MODULE_METHOD.md`
  - O: `ODD_METHOD.md`
- priority: high
- created_at: 2026-04-26
- updated_at: 2026-04-26
- completed_at: 2026-04-26
- dependencies:
  - T-060 completed
  - T-065 completed
  - T-066 completed
  - T-067 completed
  - T-068 completed
  - T-069 completed
  - T-070 completed
- affected_boundary: `specification/PRODUCT.md`, `specification/requirements/**`, `build_tenants/abiogenesis/typescript/design/**`, `build_tenants/abiogenesis/typescript/test_env/**`, `.ai-workspace/comments/codex/**`
- intake_source: Operator framing that abiogenesis is the research product lab and must confirm completeness/functionality for the products intended to be built.
- library_usage: none
- library_rationale: this is a product-readiness gate over accumulated proof, not a reusable library change.
- governing_design:
  - `build_tenants/abiogenesis/typescript/design/README.md`
  - `build_tenants/abiogenesis/typescript/design/ABG_3_MODULE_DESIGN.md`
  - `build_tenants/abiogenesis/typescript/design/M05_QUALIFICATION_DERIVATION.md`
- target_truth: The ABG research product lab can state, with evidence, whether the TypeScript GTL/ABG substrate is ready to support SDLC.TS PoC construction through graph functions as the primary program surface.
- current_truth: `v3.4.0-rc.2` proves a strong TypeScript tenant line, but the operator's next-product readiness concerns are now broader than RC package qualification.
- closure_law: this ticket closes only when the readiness decision is published with a trace matrix from goals/intent/product/requirements to design, module, tests, live or sandbox evidence, open gaps, and a go/no-go recommendation for SDLC.TS PoC entry.
- evaluation_criteria:
  - evidence matrix covers forensic traversal, internal iterate loop, gap/triage boundary, scenario catalog, instance semantics, and zoom/fold decision
  - every non-green capability has an active or backlog ticket
  - no SDLC.TS start claim depends on hidden ABG assumptions
  - product definition states what ABG is ready for and what remains research-only
  - release or checkpoint recommendation is explicit
- non_closure_conditions:
  - readiness is declared from green unit tests alone
  - open conceptual gaps have no tickets
  - SDLC.TS begins by recreating Python imperative scaffolding
  - evidence is only in comments and not traceable to tickets/design/proof
- proof_surface:
  - readiness report in `.ai-workspace/comments/codex/`
  - trace matrix to tickets and proof lanes
  - `npm run test:semantic` or justified focused subset
  - live/sandbox proof decision appropriate to the readiness claim

## Closure Evidence

Completed on 2026-04-26.

Realization:

- `specification/PRODUCT.md`
- `.ai-workspace/comments/codex/20260426T051713Z_READINESS_abg_research_product_lab_sdlc_ts_entry.md`
- completed tickets T-060, T-065, T-066, T-067, T-068, T-069, and T-070

Readiness decision:

Go for SDLC.TS PoC entry under a narrow research-lab claim. The TypeScript
GTL/ABG substrate is ready to host ODD-native SDLC.TS PoC work through graph
functions, typed assets, replay truth, and scenario proof. It is not a claim
that SDLC.TS is already complete.

Observed verification:

```text
npm run test:semantic
tests 219
pass 219
fail 0

npm run test:t064
tests 3
pass 3
fail 0

npm run test:t060
npm run test:t062
npm run test:t065
npm run test:t066
npm run test:t069
```

Result:

Every non-green capability from the readiness gate has either landed evidence
or is now framed as the first SDLC.TS PoC scenario work rather than hidden ABG
assumption.

## T-073 Requalification Note

Repriced on 2026-04-26 by T-073.

The readiness decision remains green only after replacing the T-066
harness-loop evidence with T-072 engine-owned iteration evidence.

T-071 should no longer be read as depending on T-066 for RC-level proof that
ABG owns `start -> iterate`. The governing evidence is now:

- T-072 engine-owned runner and plugin-contract proof
- T-073 RC requalification over semantic, sandbox, live UAT, and live portfolio
  gates

The SDLC.TS PoC entry claim remains bounded: ABG is ready as a research product
lab substrate, not as proof that SDLC.TS is built or that future ODD capability
work has already closed.
