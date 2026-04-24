# build_tenants/abiogenesis/typescript/test_env

The TypeScript tenant now has a completed bounded `M05` qualification line.

The latest completed waves are:

- `T-029` installed sandbox and live-lane equivalence audit against the Python
  reference tests
- `T-030` installed run-archive writer/finalizer and archive-finalization parity
- `T-031` installed live scenario portfolio parity against the Python live lane

That qualification line derives from:

- `build_tenants/common/design/modules/`
- tenant-local TypeScript design/ADR surfaces
- the released Python proving lanes, repriced rather than copied blindly

Current proof shape:

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
- completed `T-015` now defines the forward proof ownership for the remaining
  tenant waves before code opens:
  - late `M03` transport/result protocol
  - remaining `M04` install/bootstrap, bootloader, and public asset-addressing
  - `M05` qualification foundation and installed sandbox/live/archive
- completed `T-026` now owns the live `M03` transport/result proof surface:
  - `test_m03_transport_protocol_unit.test.mjs`
  - `test_m03_transport_protocol_integration.test.mjs`
  - `t026-m03-transport-protocol-negative.test.mjs`
- completed `T-027` now owns the shared ABG library proof-helper extraction and
  the first landed shared-library proof lanes:
  - `code/src/shared/abg_library/**`
  - `test_abg_common_realization_library_unit.test.mjs`
  - `test_abg_common_realization_library_integration.test.mjs`
  - `t027-abg-common-realization-library-negative.test.mjs`
- completed `T-028` now owns the shared ABG delivery-library proof lanes:
  - `code/src/shared/abg_delivery_library/**`
  - `test_abg_common_delivery_library_unit.test.mjs`
  - `test_abg_common_delivery_library_integration.test.mjs`
  - `t028-abg-common-delivery-library-negative.test.mjs`
- completed `T-016` now owns the bounded `M04` event-ingress proof surface:
  - `test_m04_event_ingress_unit.test.mjs`
  - `test_m04_event_ingress_integration.test.mjs`
  - `t016-m04-event-ingress-negative.test.mjs`
  - these files are now landed and green on the bounded `T-016` lane
- completed `T-017` now owns the bounded `M04` result-assessment proof
  surface:
  - `test_m04_result_assessment_unit.test.mjs`
  - `test_m04_result_assessment_integration.test.mjs`
  - `t017-m04-result-assessment-negative.test.mjs`
  - these files are now landed and green on the bounded `T-017` lane
- completed `T-018` now owns the bounded `M04` live-status proof surface:
  - `test_m04_live_status_unit.test.mjs`
  - `test_m04_live_status_integration.test.mjs`
  - `t018-m04-live-status-negative.test.mjs`
  - these files are now landed and green on the bounded `T-018` lane
- completed `T-019` now owns the bounded `M04` install/bootstrap proof
  surface:
  - `test_m04_install_bootstrap_unit.test.mjs`
  - `test_m04_install_bootstrap_integration.test.mjs`
  - `t019-m04-install-bootstrap-negative.test.mjs`
  - these files are now landed and green on the bounded `T-019` lane
- completed `T-020` now owns the bounded `M04` bootloader proof surface:
  - `test_m04_bootloader_unit.test.mjs`
  - `test_m04_bootloader_integration.test.mjs`
  - `t020-m04-bootloader-negative.test.mjs`
  - these files are now landed and green on the bounded `T-020` lane
- completed `T-025` now owns the bounded `M04` public asset-addressing proof
  surface:
  - `test_m04_public_asset_addressing_unit.test.mjs`
  - `test_m04_public_asset_addressing_integration.test.mjs`
  - `t025-m04-public-asset-addressing-negative.test.mjs`
  - these files are now landed and green on the bounded `T-025` lane
- completed `T-021` now owns the first bounded `M05` qualification-foundation
  proof surface:
  - `test_m05_method_trace_unit.test.mjs`
  - `test_m05_fake_lane_integration.test.mjs`
  - `t021-m05-qualification-negative.test.mjs`
  - these files derive from the `M05` design pack and remain part of the
    completed qualification line
- completed `T-022` now owns the installed-line `M05` proof surface:
  - `test_m05_sandbox_install_integration.test.mjs`
  - `test_m05_sandbox_live_integration.test.mjs`
  - `test_m05_run_archive_integration.test.mjs`
  - `t022-m05-installed-sandbox-negative.test.mjs`
  - these files prove install, installed live-lane, and archive shape over the
    completed delivery line
- completed `T-029` now owns the parity audit over those completed proof lanes:
  - Python sandbox source assets are reconciled at the feature level against
    the current TypeScript `M05` installed proof surfaces
  - the durable audit baseline is
    `design/M05_PYTHON_SANDBOX_PROOF_EQUIVALENCE_AUDIT.md`
  - the follow-up parity tickets `T-030`, `T-031`, and `T-032` are now all
    completed
- completed `T-030` now owns the bounded archive-finalization proof surface:
  - `test_m05_archive_finalization_unit.test.mjs`
  - `test_m05_run_archive_integration.test.mjs`
  - `t030-m05-archive-finalization-negative.test.mjs`
  - these files now prove canonical archive materialization before archive
    qualification rather than shape-only fixture synthesis
- completed `T-031` now owns the bounded installed live-portfolio proof surface:
  - `test_m05_installed_live_portfolio_unit.test.mjs`
  - `test_m05_installed_live_portfolio_integration.test.mjs`
  - `t031-m05-live-portfolio-negative.test.mjs`
  - these files now prove the five Python live scenario families at equivalent
    installed feature breadth over the package surface
- completed `T-032` now owns the bounded installed reset-postmortem proof
  surface:
  - `test_m05_installed_reset_postmortem_unit.test.mjs`
  - `test_m05_installed_reset_postmortem_integration.test.mjs`
  - `t032-m05-reset-postmortem-negative.test.mjs`
  - these files now prove the remaining Python reset/postmortem parity family
    over accepted reset ingress plus repriced installed postmortem truth
- sandbox is not yet the primary TypeScript proof surface
- sandbox/scenario qualification becomes primary later, once successor tickets
  open enough runtime/bootstrap surface to support a lawful `M05` lane
