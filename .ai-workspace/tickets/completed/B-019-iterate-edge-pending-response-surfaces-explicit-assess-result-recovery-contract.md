# B-019 `iterate --edge` Pending Response Surfaces An Explicit `assess-result` Recovery Contract

- id: B-019
- title: Preserve in-flight manifest detection and publish an explicit `assess-result` recovery contract in pending CLI responses
- type: bug
- status: completed
- goal: operator-recovery
- change_intent: Keep the current duplicate-dispatch prevention, but make pending operator responses self-recovering by publishing the exact `assess-result` next step instead of forcing the operator to infer it.
- change_class: realization_refactor
- re_entry_point: realized_surface
- priority: medium
- intake_source: `data_mapper.test35` forensic run 2026-04-19; operator called `iterate --edge qualify_testcase_authority` while a manifest was already in-flight and had to infer the recovery path manually
- dependencies: none
- affected_boundary: `cli_adapter.py` pending payload shape, operator recovery guidance, CLI JSON contract
- triaged_at: 2026-04-19
- created_at: 2026-04-19
- activated_at: 2026-04-19
- completed_at: 2026-04-19
- updated_at: 2026-04-19
- authoritative_contract:
  - pending CLI results now include a `recovery` block
  - the `recovery` block names `manifest_id`, `fp_manifest_path`, `fp_result_path`, `next_step`, and the exact `assess_result_command`
  - duplicate-dispatch prevention remains unchanged
- close_condition:
  - an operator can recover from an in-flight pending result without out-of-band knowledge

## Context

The engine behavior was already correct at the dispatch boundary.

When `iterate --edge` hit an in-flight manifest, ABIogenesis returned `pending`
instead of minting a duplicate manifest. The bug was purely operator-facing:
the CLI surfaced raw pending state, but not the concrete recovery contract.

`data_mapper.test35` exposed that gap on `qualify_testcase_authority`.

## Delivered Contract

[cli_adapter.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/cli_adapter.py)
now enriches pending CLI results through
`_attach_pending_recovery_contract(...)`.

The pending response now publishes:

- `manifest_id`
- `fp_manifest_path`
- `fp_result_path`
- `recovery.next_step = "assess-result"`
- `recovery.assess_result_command`

The current engine still prevents duplicate dispatch in
[interpret.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/interpret.py).
This ticket only closes the missing recovery contract at the CLI surface.

## Verification

- [test_cli_adapter_auto.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/test_env/tests/test_cli_adapter_auto.py)
  - `test_attach_pending_recovery_contract_surfaces_exact_assess_result_next_step`
- non-live verification passed on 2026-04-19:
  - `./run_tests`
  - `./run_tests e2e`

## Closeout

Pending in-flight F_P results are no longer a raw JSON dead end. The CLI now
publishes the lawful recovery command directly while preserving the existing
fail-closed duplicate-dispatch behavior.
