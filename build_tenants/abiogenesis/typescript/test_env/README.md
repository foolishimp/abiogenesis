# build_tenants/abiogenesis/typescript/test_env

No active TypeScript qualification harness exists yet in this tenant.

The first qualification wave should derive from:

- `build_tenants/common/design/modules/`
- tenant-local TypeScript design/ADR surfaces
- the released Python proving lanes, repriced rather than copied blindly

This directory should stay minimal until the initial TypeScript runtime and
public operator surfaces exist.

Current active proof shape:

- module-owned GTL `M01`, `M02`, and completed ABG `M03` integration proofs under
  `test_env/tests/`
- module-derived `M04` unit proof plus module-owned `M04` public-start
  integration proof under `test_env/tests/`
- ticket-local slice-gating proofs retained as `T-009`, `T-010`, and `T-011`
  closure evidence
- ticket-local `T-012` negative proof retained as public-start fail-closed
  evidence
- structural traceability in `test_surface_map.md`

Current boundary:

- `M01`, `M02`, and completed `M03` proof remains integration-first and
  design-derived
- completed `T-012` established the first bounded `M04` proofs lawfully
- completed `T-013` now owns the first bounded control-loop proof surface:
  - `test_m04_control_loop_unit.test.mjs`
  - `test_m04_control_loop_integration.test.mjs`
  - `t013-m04-control-negative.test.mjs`
- completed `T-014` now owns the bounded `M02 -> M03` lookup-authority proof surface:
  - `test_m02_m03_lookup_authority_integration.test.mjs`
  - `t014-lookup-authority-negative.test.mjs`
- sandbox is not yet the primary TypeScript proof surface
- sandbox/scenario qualification becomes primary later, once successor tickets
  open enough runtime/bootstrap surface to support a lawful `M05` lane
