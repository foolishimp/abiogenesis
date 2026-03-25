# HANDOFF: V2 Behavioral Test Suite

**Author**: Codex
**Date**: 2026-03-25T12:17:48+11:00
**Addresses**: `/Users/jim/src/apps/genesis_sdlc/.ai-workspace/comments/codex/20260324T165057_PRODUCT_SCENARIOS_abg-gtl-first-10.md`, `/Users/jim/src/apps/abiogenesis/specification/INTENT.md`, `/Users/jim/src/apps/abiogenesis/builds/claude_code/tests/test_product_scenarios.py`
**For**: claude

## Summary

The V2 suite should be rebuilt from the product-scenario source, not from the transitional topology tests. Product scenarios 1-10 already exist as V1-shaped tests; scenarios 11-14 are the direct V2 drivers and should become first-class behavioral tests in the new suite. The new V2 suite should author workflows with `Module` / `Graph` / `Node` / `GraphFunction`, assert `workflow_selected` rather than `zoomed`, and keep the scenario layer as the main proof of migration reality.

## Source of Truth

The primary behavioral source is:

- `/Users/jim/src/apps/genesis_sdlc/.ai-workspace/comments/codex/20260324T165057_PRODUCT_SCENARIOS_abg-gtl-first-10.md`

Current state:

- `builds/claude_code/tests/test_product_scenarios.py` ports scenarios 1-10 into executable tests
- those tests are still authored with `gtl.core` V1 types
- the memo itself continues through scenarios 11-16
- scenarios 11-14 are the V2 build-out drivers called out in `specification/INTENT.md`

## Suite Rules

- No new V2 test imports `gtl.core`
- No new V2 test uses `Package`, `Asset`, `Edge`, `Fragment`, or `Overlay`
- No new V2 test asserts shim identity or wrapper-module compatibility
- Behavioral tests execute through the real engine path, not through direct helper-only assertions
- Selection/application tests assert `workflow_selected`, not `zoomed`
- Scenario authorship uses `gtl.graph`, `gtl.operator_model`, `gtl.function_model`, `gtl.module_model`, and `gtl.algebra`

## Primary Files and Cases

### 1. `builds/claude_code/tests/test_v2_product_scenarios_core.py`

Port scenarios 1-7 from the product-scenario memo into V2-authored form:

- `test_s1_single_edge_happy_path`
- `test_s2_fd_gap_blocks_false_progress`
- `test_s3_fd_findings_escalate_to_fp`
- `test_s4_human_gate_blocks_then_approval_converges`
- `test_s5_two_work_lines_share_topology_but_converge_independently`
- `test_s6_workflow_upgrade_invalidates_stale_fp_without_erasing_history`
- `test_s7_scoped_reset_reopens_one_work_line_without_affecting_siblings`

Assertions:

- real command-path execution via `gen_iterate()` / `gen_gaps()`
- replayable event stream
- lawful convergence / non-convergence
- authored workflow objects are V2 shapes, not V1 compatibility shapes

### 2. `builds/claude_code/tests/test_v2_product_scenarios_refinement.py`

Port and rewrite scenarios 8-10:

- `test_s8_substitution_refines_coarse_contract_and_records_selection_provenance`
- `test_s9_parent_only_converges_when_all_children_converge`
- `test_s10_timeout_then_new_run_proceeds`
- `test_s10_supersession_records_but_stale_attempt_does_not_apply`
- `test_s10_attempt_identity_preserved_across_retries`

Scenario 8 is the key rewrite:

- replace V1 `zoom` / `Fragment` expectations
- use candidate selection + lawful substitution
- assert `workflow_selected`
- preserve outer contract
- show internal structure / lineage becomes visible without `Fragment`

### 3. `builds/claude_code/tests/test_v2_product_scenarios_graph_functions.py`

Add scenarios 11-14 as first-class V2 behavioral tests:

- `test_s11_named_graph_function_is_materializable_and_replayable`
- `test_s12_same_graph_function_can_be_applied_at_multiple_sites_with_distinct_lineage`
- `test_s13_graph_functions_compose_and_execute_as_one_lawful_outer_contract`
- `test_s14_multiple_compatible_candidates_are_enumerated_and_external_selection_is_recorded`

These are the direct V2 drivers:

- named reusable workflow program
- reuse at multiple sites / distinct work lineage
- lawful composition
- explicit candidate enumeration and replayable selection provenance

### 4. `builds/claude_code/tests/test_v2_contract_semantics.py`

Add minimal contract/semantic tests that the scenario layer depends on:

- `test_gtl_public_surface_is_v2_only`
- `test_module_is_frozen_and_metadata_is_immutable`
- `test_job_and_worker_live_in_binding_not_gtl`
- `test_compose_happy_path`
- `test_compose_interface_mismatch_raises`
- `test_compose_associativity_preserves_outer_contract`
- `test_identity_preserves_interface_under_composition`
- `test_substitute_happy_path`
- `test_substitute_vector_not_found_raises`
- `test_substitute_interface_mismatch_raises`
- `test_substitute_preserves_outer_contract`
- `test_interpret_emits_workflow_selected_not_zoomed`
- `test_selection_enumerates_candidates_and_validates_interface`

Keep this file small. The scenario layer is still the primary proof.

## Secondary Files

### 5. `builds/claude_code/tests/test_v2_domain_scenarios.py`

Port the current domain fixtures into V2-authored form:

- `test_intent_to_requirements_v2`
- `test_requirements_to_uat_v2`
- `test_design_to_schema_v2`
- `test_multi_input_to_code_v2`
- `test_brief_to_article_v2`

These are useful regressions. They are not the main V2 proof spine.

### 6. `builds/claude_code/tests/test_v2_kernel_safety.py`

Port kernel/install truth into explicit V2 expectations:

- `test_install_truth_v2`
- `test_reinstall_is_idempotent_v2`
- `test_runtime_contract_points_to_v2_module_surface`

## Deferred Cases

Scenarios 15-16 from the product-scenario memo should be captured now and implemented later:

- `test_s15_consensus_gate_before_promotion`
- `test_s16_fan_out_same_workflow_across_intent_vector`

These belong to the higher-order / later-wave surface. They should not block V1->V2 completion.

## Migration Guidance

- Keep the existing V1 product scenarios until the V2 suite is green
- Build the V2 suite in parallel rather than mutating every old scenario immediately
- Once the V2 suite is authoritative, retire shim-preserving topology tests
- Scenario 8 is the migration hinge: it should stop proving `zoom` and start proving substitution/application
- Scenario 11-14 should exist before calling the V2 migration behaviorally complete

## Recommended Action

1. Implement `test_v2_product_scenarios_core.py`, `test_v2_product_scenarios_refinement.py`, and `test_v2_product_scenarios_graph_functions.py` first.
2. Use the product-scenario memo as the behavioral source and `INTENT.md` as the V2-driver justification.
3. Keep contract tests thin and semantic; do not rebuild the current topology shim suite under new names.
4. Treat scenarios 11-14 as required for V2 completion.
5. Treat scenarios 15-16 as deferred higher-order follow-on work.
