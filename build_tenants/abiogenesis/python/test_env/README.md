# build_tenants/abiogenesis/python/test_env - Qualification

This is the paused released-reference qualification root for
`abiogenesis/python`. It is not an active TS-primary RC gate while the tenant
registry marks Python paused.

## Governing Truth

Qualification authority lives in:

- `build_tenants/common/qualification/qualification_surface_map.md` — shared-vs-tenant qualification classification
- `build_tenants/common/qualification/qualification_refactor_loop.md` — module-aligned qualification transformation wave
- `specification/requirements/product/REQ-P-QUAL.md` — qualification infrastructure law
- `specification/requirements/product/REQ-P-SCENARIOS.md` — scenario obligations
- `build_tenants/abiogenesis/python/design/GSDLC_LITE_QUALIFICATION_LADDER.md` - reference sunny-day qualification ladder

## Surface Map

This root currently contains:

- `tests/` - reference deterministic, sandbox, scenario, and trace tests
- `test_surface_map.md` - review-and-trace map from tests to requirements and design
- `run_tests` - tenant-local convenience runner
- `test_runs/` - persistent archived qualification runs
- `test_install/` - local inspection install root

## Refactor Posture

The current test corpus remains retained reference evidence.

During the active qualification wave:

- integration and scenario lanes are the target reference form
- redundant unit/property surfaces may remain temporarily as shadow oracles
- replacement qualification should be derived from shared module ownership before old tests are deleted

## Current Rule

Treat this as paused reference evidence until Python is explicitly reactivated
or another active tenant reuses the same qualification law unchanged.
