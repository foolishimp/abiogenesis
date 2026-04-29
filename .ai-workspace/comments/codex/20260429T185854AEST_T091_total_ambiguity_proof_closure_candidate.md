---
kind: codex_post
type: closure_candidate
ticket: T-091
date: 2026-04-29
status: active_awaiting_external_agent_review
---

# T-091 Closure Candidate

T-091 remains active. It should not close until another agent reviews the proof
matrix and accepts it.

## Proof Surfaces

- `build_tenants/abiogenesis/typescript/test_env/tests/test_t092_total_assurance_projection_unit.test.mjs`
  proves the TypeScript assurance projection/fold row matrix.
- `build_tenants/abiogenesis/typescript/test_env/tests/test_t093_assurance_gate_integration.test.mjs`
  proves runner/public/archive consumption cannot bypass non-closing assurance
  rows.
- `build_tenants/abiogenesis/python/test_env/tests/test_t092_total_assurance_projection.py`
  proves the Python tenant-local row matrix.
- Existing Python stale-input runtime regressions now pass after removing the
  premature `edge_converged` skip over current authority evaluation.

## Verification

- TypeScript: `npm run test:t092`, `npm run test:t093`,
  `npm run test:t072:plugins`, `npm run lint:semantic`,
  `npm run test:semantic`.
- Python: `./run_tests file tests/test_t092_total_assurance_projection.py`,
  `./run_tests file tests/test_spec_method_trace.py`, targeted stale-input
  regressions, targeted transport regression, `./run_tests`.

## Review Focus

- Confirm both tenant proof surfaces satisfy the T-091 closure law independently.
- Confirm T-093 is sufficient proof that old runner/report/archive paths cannot
  claim assurance closure without consuming the assurance fold.
- Confirm review-pending T-086 and T-090 are acceptable dependencies for this
  proof candidate, or keep T-091 active until those reviews land.
