# Release Checkpoint: abiogenesis 3.4.0-rc.2

This post records the `v3.4.0-rc.2` checkpoint for the abiogenesis RC line.

## Scope

The checkpoint captures the current ABG TypeScript tenant wave after:

- GTL/ABG intent and product clarification around LLM-first graph algebra
- M03 generic single-hop investigation
- M03 minimum typed traversal investigation
- M03 traversal-structure probe
- M05 SDLC bootstrap-lineage proof
- M05 data-mapper real ingress sandbox proof
- deferred `T-060` bare-edge compute-basis taxonomy backlog item

## Qualification

Commands run from `build_tenants/abiogenesis/typescript` unless noted:

- `npm run test:semantic`: `214 passed`, `3263.36175 ms`
- `npm run test:t064`: `3 passed`, `144.970958 ms`
- `npm run lint:semantic`: passed
- `CODEX_LIVE_FP=1 npm run test:live`: `1 passed`, `130070.942583 ms`
- `CODEX_LIVE_FP=1 npm run test:live:uat`: `1 passed`, `15435.907 ms`
- `git diff --check` from repo root: passed

Live evidence:

- portfolio archive:
  `build_tenants/abiogenesis/typescript/test_env/test_runs/typescript_rc_live_portfolio/2026-04-25T184212471Z/portfolio_report.json`
- single-edge UAT archive:
  `build_tenants/abiogenesis/typescript/test_env/test_runs/typescript_rc_live/requirements_to_uat/2026-04-25T184432699Z`

## Release Identity

- branch: `rc/3.4.0`
- tag: `v3.4.0-rc.2`
- package: `@abiogenesis/typescript-tenant@3.4.0-rc.2`
