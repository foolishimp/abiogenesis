# build_tenants/abiogenesis/typescript/test_env

The TypeScript tenant now has a completed bounded `M05` qualification line.

## Test Authority Categories

This test root follows `SPEC_METHOD.md` testing strategy taxonomy:

- design/module conformance tests prove implementation against module and
  design authority
- UAT/acceptance tests derive from requirements and scenarios
- only sandbox or equivalent composed-product proof lanes are UAT
- harnessed sandbox UAT uses deterministic, fake, recorded, or injected worker
  truth
- live sandbox UAT uses a real configured worker or transport boundary

Current TypeScript `test_env/tests/*.test.mjs` lanes are deterministic
design/module conformance or harnessed installed-surface proof. They are part
of `npm run test:semantic`.

The RC live sandbox UAT lane is separate:

- `test_env/live/test_m05_rc_live_portfolio.test.mjs`
- `npm run test:live`

That live lane is excluded from `npm run test:semantic`, but it is a required
RC gate. Set `ABG_TS_LIVE_PORTFOLIO=1` or `CODEX_LIVE_FP=1` to run it against a
configured real backend. It materializes `npm pack` output into the sandbox
package surface before importing `@abiogenesis/typescript-tenant`. If the live
environment or backend is not ready, the lane fails and archives diagnostic
evidence under `test_env/test_runs/`.

The previous single-edge RC live UAT lane remains directly runnable as:

- `test_env/live/test_m05_rc_live_uat.test.mjs`
- `npm run test:live:uat`

The latest completed waves are:

- `T-029` installed sandbox and live-lane equivalence audit against the Python
  reference tests
- `T-030` installed run-archive writer/finalizer and archive-finalization parity
- `T-031` installed live scenario portfolio parity against the Python live lane
- `T-036` installed package behavior portfolio over the full Python archived
  sandbox scenario corpus
- `T-037` RC external-live portfolio over all five Python live scenario
  families

That qualification line derives from:

- `build_tenants/common/design/modules/`
- tenant-local TypeScript design/ADR surfaces
- reusable requirement/scenario obligations discovered from the released Python
  proving lanes, repriced rather than copied blindly
- packaged TypeScript tenant materialization for installed acceptance lanes

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
  - `test_m05_installed_graph_function_target_integration.test.mjs`
  - `test_m05_run_archive_integration.test.mjs`
  - `t022-m05-installed-sandbox-negative.test.mjs`
  - these files prove install, installed live-lane, translated graph-function
    target selection, and archive shape over the completed delivery line
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
- completed `T-036` now owns the bounded Python sandbox behavior portfolio:
  - `test_m05_python_sandbox_behavior_portfolio_integration.test.mjs`
  - `test_m05_three_stage_graph_function_sandbox_integration.test.mjs`
  - `npm run test:t036`
  - this lane executes all 34 Python archived sandbox behavior obligations
    through the installed TypeScript package surface:
    - 15 install/runtime sandbox scenarios
    - 14 fake or harnessed sandbox scenarios
    - 5 live-lineage scenario obligations
  - it also proves a composed three-stage GTL graph-function target can be
    selected through the installed package and replayed through each
    materialized vector by the sandbox harness
  - this is cumulative harnessed behavior evidence, not five external-live
    worker executions
- completed `T-037` now owns the RC external-live portfolio proof surface:
  - `test_env/live/test_m05_rc_live_portfolio.test.mjs`
  - `npm run test:live`
  - this lane executes all five Python live scenario families through real
    configured F_P transport over the installed TypeScript package surface
  - the portfolio contains 12 external-live stage dispatches
  - the exact scenario/stage/assessment catalog is sourced from
    `M05_REFERENCE_LIVE_SCENARIO_OBLIGATIONS`
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
