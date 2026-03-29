# build_tenants/abiogenesis/python/test_env — Qualification

This is the canonical released qualification root for `abiogenesis/python`.

## Governing Truth

Qualification authority lives in:

- `build_tenants/common/qualification/qualification_surface_map.md` — shared-vs-tenant qualification classification
- `specification/requirements/product/REQ-P-QUAL.md` — qualification infrastructure law
- `specification/requirements/product/REQ-P-SCENARIOS.md` — scenario obligations
- `build_tenants/abiogenesis/python/design/GSDLC_LITE_ABG_1_0_QUALIFICATION_LADDER.md` — canonical sunny-day qualification ladder

## Surface Map

This root currently contains:

- `tests/` — canonical deterministic, sandbox, scenario, and trace tests
- `test_surface_map.md` — canonical review-and-trace map from tests to requirements and design
- `run_tests` — tenant-local convenience runner
- `test_runs/` — persistent archived qualification runs
- `test_install/` — local inspection install root

## Current Rule

Treat this as the canonical executable qualification surface until another active tenant reuses the same qualification law unchanged.
