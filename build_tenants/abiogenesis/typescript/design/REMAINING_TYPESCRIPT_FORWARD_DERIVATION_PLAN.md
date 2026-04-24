# Remaining TypeScript Forward Derivation Plan

**Status**: Active
**Date**: 2026-04-24
**Purpose**: Front-run the remaining TypeScript tenant design and module
derivation chain after completed `T-014`, so later waves open from explicit
target assets rather than ad hoc Python code reading or ticket prose.

## 1. Position

The TypeScript tenant has completed:

- `M01-gtl-core`
- `M02-work-publication`
- `M03-engine-kernel` steel thread
- `M04` public-start
- `M04` bounded control loop
- `M02 -> M03` lookup-authority repricing

The remaining work is:

- late `M03` governed transport and result protocol
- the remaining `M04` app/bootstrap families
- `M05` qualification/scenario families
- deferred-only `M06` trigger law

These surfaces are now forward-derived here before implementation opens.

## 2. Source Inputs

The remaining-wave reference line is derived from:

- `build_tenants/common/design/modules/M04-app-bootstrap.yml`
- `build_tenants/common/design/modules/M05-qualification-scenarios.yml`
- `build_tenants/common/design/modules/M06-mapping-deferred.yml`
- `build_tenants/abiogenesis/python/design/ABG_3_MODULE_DESIGN.md`
- `build_tenants/abiogenesis/python/design/OPERATOR_ASSET_REGISTRY_AND_OWNERSHIP_SURFACE.md`
- `build_tenants/abiogenesis/python/design/GSDLC_LITE_QUALIFICATION_LADDER.md`
- `build_tenants/abiogenesis/python/design/SCENARIO_INTENT_TO_TAGGED_REQUIREMENTS.md`
- `build_tenants/abiogenesis/python/design/SCENARIO_REQUIREMENTS_TO_UAT.md`
- `build_tenants/abiogenesis/python/design/SCENARIO_GSDLC_LITE_REQUIREMENTS_DESIGN_CODE.md`
- `build_tenants/abiogenesis/python/design/adrs/ADR-022-subprocess-transport-with-env-sanitization.md`
- `build_tenants/abiogenesis/python/code/genesis/cli_adapter.py`
- `build_tenants/abiogenesis/python/code/genesis/binding.py`
- `build_tenants/abiogenesis/python/code/genesis/result_ingest.py`
- `build_tenants/abiogenesis/python/code/genesis/transport.py`
- `build_tenants/abiogenesis/python/code/genesis/live_status.py`
- `build_tenants/abiogenesis/python/code/gen-install.py`
- `build_tenants/abiogenesis/python/code/gtl_spec/GTL_BOOTLOADER.md`
- `build_tenants/abiogenesis/python/test_env/test_surface_map.md`

## 3. Forward Wave Matrix

| Wave | Module family | Python reference inputs | TypeScript target assets | Owning ticket |
| --- | --- | --- | --- | --- |
| Late `M03` transport/result protocol | governed dispatch/result carrier law | `ADR-022`, `python/code/genesis/transport.py`, `python/code/genesis/result_ingest.py` | `M03_TRANSPORT_PROTOCOL_DERIVATION.md`, `M03_TRANSPORT_PROTOCOL_FIRST_SLICE_IACS.md`, `M03_TRANSPORT_PROTOCOL_STRUCTURAL_CARRIER_DIAGRAM.md`, `test_m03_transport_protocol_unit.test.mjs`, `test_m03_transport_protocol_integration.test.mjs`, `t026-m03-transport-protocol-negative.test.mjs` | `T-026` |
| `M04` event ingress | app-owned ingress over canonical kernel emit | `python/design/ABG_3_MODULE_DESIGN.md`, `python/code/genesis/cli_adapter.py`, `python/code/genesis/events.py`, `python/code/genesis/interpret.py`, `test_cli_adapter_auto.py`, `test_m04_app_bootstrap_integration.py` | `M04_EVENT_INGRESS_DERIVATION.md`, `M04_EVENT_INGRESS_FIRST_SLICE_IACS.md`, `M04_EVENT_INGRESS_STRUCTURAL_CARRIER_DIAGRAM.md`, `test_m04_event_ingress_unit.test.mjs`, `test_m04_event_ingress_integration.test.mjs`, `t016-m04-event-ingress-negative.test.mjs` | `T-016` |
| `M04` result-assessment ingress | app-owned result/artifact intake over canonical ingest law | `python/code/genesis/result_ingest.py`, `python/code/genesis/transport.py`, `test_m04_app_bootstrap_integration.py` | `M04_RESULT_ASSESSMENT_DERIVATION.md`, `M04_RESULT_ASSESSMENT_FIRST_SLICE_IACS.md`, `M04_RESULT_ASSESSMENT_STRUCTURAL_CARRIER_DIAGRAM.md`, `test_m04_result_assessment_unit.test.mjs`, `test_m04_result_assessment_integration.test.mjs`, `t017-m04-result-assessment-negative.test.mjs` | `T-017` |
| `M04` live-status projection | projection over canonical runtime/app truth | `python/code/genesis/live_status.py`, `test_m04_app_bootstrap_integration.py` | `M04_LIVE_STATUS_DERIVATION.md`, `M04_LIVE_STATUS_FIRST_SLICE_IACS.md`, `M04_LIVE_STATUS_STRUCTURAL_CARRIER_DIAGRAM.md`, `test_m04_live_status_unit.test.mjs`, `test_m04_live_status_integration.test.mjs`, `t018-m04-live-status-negative.test.mjs` | `T-018` |
| `M04` install/bootstrap | installed-root and package-first bootstrap delivery | `python/code/gen-install.py`, shared `M04-app-bootstrap.yml`, `test_sandbox_install.py` | `M04_INSTALL_BOOTSTRAP_DERIVATION.md`, `M04_INSTALL_BOOTSTRAP_FIRST_SLICE_IACS.md`, `M04_INSTALL_BOOTSTRAP_STRUCTURAL_CARRIER_DIAGRAM.md`, `test_m04_install_bootstrap_unit.test.mjs`, `test_m04_install_bootstrap_integration.test.mjs`, `t019-m04-install-bootstrap-negative.test.mjs` | `T-019` |
| `M04` bootloader/project-facing delivery | delivery verification and project-facing bootloader truth | `python/code/gtl_spec/GTL_BOOTLOADER.md`, `python/code/gen-install.py` | `M04_BOOTLOADER_DERIVATION.md`, `M04_BOOTLOADER_FIRST_SLICE_IACS.md`, `M04_BOOTLOADER_STRUCTURAL_CARRIER_DIAGRAM.md`, `test_m04_bootloader_unit.test.mjs`, `test_m04_bootloader_integration.test.mjs`, `t020-m04-bootloader-negative.test.mjs` | `T-020` |
| `M04` public asset addressing | published operator asset registry and target law | `python/design/OPERATOR_ASSET_REGISTRY_AND_OWNERSHIP_SURFACE.md`, `ADR-033`, `python/code/genesis/binding.py` | `M04_PUBLIC_ASSET_ADDRESSING_DERIVATION.md`, `M04_PUBLIC_ASSET_ADDRESSING_FIRST_SLICE_IACS.md`, `M04_PUBLIC_ASSET_ADDRESSING_STRUCTURAL_CARRIER_DIAGRAM.md`, `test_m04_public_asset_addressing_unit.test.mjs`, `test_m04_public_asset_addressing_integration.test.mjs`, `t025-m04-public-asset-addressing-negative.test.mjs` | `T-025` |
| `M05` qualification foundation | method trace plus fake-lane qualification law | `python/design/GSDLC_LITE_QUALIFICATION_LADDER.md`, `python/design/SCENARIO_*`, `python/test_env/test_surface_map.md`, `test_spec_method_trace.py`, `test_sandbox_usecases_fake.py` | `M05_QUALIFICATION_DERIVATION.md`, `M05_QUALIFICATION_FIRST_SLICE_IACS.md`, `M05_QUALIFICATION_STRUCTURAL_CARRIER_DIAGRAM.md`, `test_m05_method_trace_unit.test.mjs`, `test_m05_fake_lane_integration.test.mjs`, `t021-m05-qualification-negative.test.mjs` | `T-021` |
| `M05` installed sandbox/live/archive | installed runtime qualification and durable archive proof | `python/test_env/test_surface_map.md`, `test_sandbox_install.py`, `test_sandbox_usecases_live.py`, `test_run_archive.py` | `M05_INSTALLED_SANDBOX_DERIVATION.md`, `M05_INSTALLED_SANDBOX_FIRST_SLICE_IACS.md`, `M05_INSTALLED_SANDBOX_STRUCTURAL_CARRIER_DIAGRAM.md`, `test_m05_sandbox_install_integration.test.mjs`, `test_m05_sandbox_live_integration.test.mjs`, `test_m05_run_archive_integration.test.mjs`, `t022-m05-installed-sandbox-negative.test.mjs` | `T-022` |
| Deferred `M06` trigger | alternate runtime-family mapping trigger only | shared `M06-mapping-deferred.yml` | `M06_MAPPING_DEFERRED_DERIVATION.md`, `M06_MAPPING_DEFERRED_TRIGGER_IACS.md`, `M06_MAPPING_DEFERRED_STRUCTURAL_CARRIER_DIAGRAM.md` | `T-023` |

## 4. Future Proof-Lane Consequence

Later canonical tests must derive from these future module assets, not from
eventual code layout. The expected future canonical lanes are:

- `M03`: transport protocol unit/integration plus fail-closed negative
- `M04`: one canonical unit lane, one canonical integration lane, and one
  fail-closed negative lane for each remaining bounded family
- `M05`: one method-trace or fake-lane unit/integration baseline before the
  installed sandbox/live/archive lane opens
- `M06`: no executable proof until the deferred trigger is intentionally
  activated

## 5. Deferred Trigger Rule

`M06` remains deferred-only.

No TypeScript mapping implementation may open until:

1. an alternate runtime family is intentionally activated
2. canonical ABG remains insufficient for the intended capability
3. the trigger boundary is ratified through `T-023`

## 6. Consequence

Later TypeScript work should now open in this order:

1. `T-026` if transport/result protocol is needed first by product-facing work
2. `T-016`
3. `T-017`
4. `T-018`
5. `T-019`
6. `T-020`
7. `T-025`
8. `T-021`
9. `T-022`
10. `T-023`

That sequence may be repriced by goal, but later waves should not need another
backlog-discovery pass.
