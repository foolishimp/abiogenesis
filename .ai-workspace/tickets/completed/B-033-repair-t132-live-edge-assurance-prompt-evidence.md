---
id: B-033
title: Repair T-132 live edge-assurance prompt evidence
type: bug
ticket_category: ordinary
status: completed
proof_status: passed
goal: make the T-132 installed live edge-assurance lane pass against Claude without asking the worker to attest closure from unresolved refs
change_class: realization_refactor
change_intent: Repair the live prompt fixture so each F_P edge-assurance worker call receives concrete evidence packet content and evaluator-boundary wording before returning a scoped close finding.
re_entry_point: realization
created_at: 2026-06-07
updated_at: 2026-06-07
completed_at: 2026-06-07
owning_repo: abiogenesis
governance_scope: STDO Method
priority: high
build_tenant: typescript
related_tickets:
  - T-132
  - T-130
  - T-131
affected_boundary:
  realization:
    - build_tenants/abiogenesis/typescript/test_env/tests/support/t132-edge-assurance-fixtures.mjs
  proof:
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t132_edge_assurance_installed_sandbox.test.mjs
    - build_tenants/abiogenesis/typescript/test_env/live/test_t132_edge_assurance_installed_live.test.mjs
target_truth: T-132 live F_P edge-assurance prompts carry concrete evidence packet content for each edge and clearly state that `closeDisposition` is an evaluator proposal over that packet, not runtime closure authority. The worker is not asked to rubber-stamp unresolved refs.
superseded_truth: The live prompt named stable refs and demanded a prefilled close JSON without supplying enough concrete evidence in the prompt, causing Claude to refuse with prose and the installed proof to fail JSON extraction.
closure_law: Close when deterministic proof guards all three live prompts against unresolved-ref attestation and the actual Claude installed live lane passes end to end.
---

# B-033: Repair T-132 Live Edge-Assurance Prompt Evidence

## Intake Triage

Smallest lawful re-entry point: `realization_refactor`.

Reason: T-132 requirements and design remain correct. The defect was in the
live proof fixture prompt: it treated refs as if they were enough evidence for
an external worker, then required `closeDisposition: "close"`.

## Fix

- Added a per-edge live evidence packet with selected contract details,
  authority snapshot, target artifact content, and explicit evaluation checks.
- Added stage-specific target artifacts for synthesized requirements, formal
  logical requirements, and disambiguated design syntax.
- Clarified in the prompt that `closeDisposition` is an F_P evaluator finding
  over the supplied evidence packet and not ABG runtime closure authority.
- Added deterministic sandbox assertions that all three live prompts carry
  concrete evidence packet content, unresolved-ref warnings, evaluator-boundary
  wording, and forbidden runtime-authority fields.

## Proof Log

Passed:

- `npm run test:t132`.
- `npx eslint --max-warnings=0 test_env/tests/support/t132-edge-assurance-fixtures.mjs test_env/tests/test_t132_edge_assurance_installed_sandbox.test.mjs test_env/live/test_t132_edge_assurance_installed_live.test.mjs`.
- `CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude npm run test:t132:live`.
- `npm run lint:test-harness`.
- `npm run test:semantic` - 691/691.
- `git diff --check`.

Passing live archive:

- `build_tenants/abiogenesis/typescript/test_env/test_runs/t132_edge_assurance_installed_live/20260606T180701418Z_pid89704`.
