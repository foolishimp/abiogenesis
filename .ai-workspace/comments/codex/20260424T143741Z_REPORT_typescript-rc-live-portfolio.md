# Report: TypeScript RC Live Portfolio

**Run**: `2026-04-24T143741462Z`
**Command**: `CODEX_LIVE_FP=1 npm run test:live`
**Tenant**: `build_tenants/abiogenesis/typescript`
**Source lineage**: `python/test_env/tests/test_sandbox_usecases_live.py`
**Archive**:
`build_tenants/abiogenesis/typescript/test_env/test_runs/typescript_rc_live_portfolio/2026-04-24T143741462Z`
**Ticket**: `T-037`
**Verdict**: Passed.

## Finding

The TypeScript RC live gate now runs as a required live gate and covers all five
Python live scenario families through real external F_P transport at the current
TypeScript result-artifact boundary.

This passing run executed:

- `5` Python live scenario families
- `12` external-live TypeScript stages
- `1` Codex readiness probe
- `12` Codex dispatch invocations
- `12` result-artifact admissions
- `14` accepted assessment events across `12` accepted stage projections
- `12` final live-status projections to `assessed`

No skip path was used. Missing live configuration or failed backend readiness is
now a failing `npm run test:live` result, not a passing skip.

## Scenario Result

- `requirements_to_uat`: passed, `1` stage, edge `requirements→uat_tests`
- `intent_to_requirements`: passed, `1` stage, edge `intents→requirements`
- `gsdlc_lite_requirements_design_code`: passed, `2` stages, edges `requirements→design`, `design→code`
- `gsdlc_lite_design_review`: passed, `3` stages, edges `requirements→design`, `design→design_review`, `design_review→code`
- `gsdlc_lite_zoom_design`: passed, `5` stages, edges `requirements→decomposition`, `decomposition→dependency_chain`, `dependency_chain→sequencing`, `sequencing→design`, `requirements→design`

The scenario and stage catalog came from
`M05_REFERENCE_LIVE_SCENARIO_OBLIGATIONS`.

The portfolio qualifier returned:

```json
{
  "kind": "passed",
  "scenarioNames": [
    "requirements_to_uat",
    "intent_to_requirements",
    "gsdlc_lite_requirements_design_code",
    "gsdlc_lite_design_review",
    "gsdlc_lite_zoom_design"
  ]
}
```

## Runtime Evidence

The live backend evidence records:

- backend: `backend://codex`
- worker: `worker://rc-live-codex`
- Codex CLI: `0.124.0`
- model reported by Codex readiness: `gpt-5.5`
- installed package root:
  `/var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-ts-install-dCd65C/node_modules/@abiogenesis/typescript-tenant`
- package tarball:
  `/var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-ts-install-dCd65C/.abiogenesis/package-pack/pack-tLyX5P/abiogenesis-typescript-tenant-0.0.0-test.tgz`

Each stage archived:

- dispatch script status
- dispatch projection
- dispatch request
- prompt
- transport result
- raw worker response
- result artifact
- assessment script status
- assessment projection

Archive file count: `124`.

## Timing

The live portfolio command duration was:

- `179,526.780083 ms`
- about `2m 59.53s`

This includes package materialization, one readiness probe, and all twelve
stage dispatches.

## Boundary Note

This is not a clone of the Python file-writing harness.

Python asked the worker to mutate sandbox files and then ran Python
deterministic checks over those files. The current TypeScript RC live product
boundary asks the worker for governed result-artifact truth, admits that
artifact through the TypeScript transport/result protocol, assesses it through
`resultAssessment`, and projects final state through `projectLiveStatus`.

The port is complete at the current TypeScript product boundary: all five
Python live scenario families and all twelve live stages now cross real
external F_P transport, using one shared stage/edge/assessment obligation
catalog.
