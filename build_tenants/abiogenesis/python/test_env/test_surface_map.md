# Abiogenesis Python Test Surface Map

**Status**: Active
**Date**: 2026-03-29
**Derived from**: [REQ-P-QUAL.md](../../../../specification/requirements/product/REQ-P-QUAL.md), [REQ-P-SCENARIOS.md](../../../../specification/requirements/product/REQ-P-SCENARIOS.md), [GTL_3_MODULE_DESIGN.md](../design/GTL_3_MODULE_DESIGN.md), [GTL_3_INTERFACE_CONTRACTS.md](../design/GTL_3_INTERFACE_CONTRACTS.md), [GSDLC_LITE_QUALIFICATION_LADDER.md](../design/GSDLC_LITE_QUALIFICATION_LADDER.md), [qualification_surface_map.md](../../../common/qualification/qualification_surface_map.md)

## Purpose

Review and trace the canonical `abiogenesis/python` test surface from live requirements through design authority into executable tests.

This document is structural only.
It does not change what runs.

## Rule

Every `test_*.py` file under `build_tenants/abiogenesis/python/test_env/tests/` shall appear here with:

- the live requirement families it validates
- the governing design surfaces it derives from

## Refactor Review

The current canonical python test corpus is being refactored toward module-aligned qualification lanes under [qualification_refactor_loop.md](../../../common/qualification/qualification_refactor_loop.md).

Current reading:

- integration/scenario anchors to keep and build from:
  - `test_cli_adapter_auto.py`
  - `test_m01_gtl_core_integration.py`
  - `test_m02_work_publication_integration.py`
  - `test_m03_engine_kernel_integration.py`
  - `test_m04_app_bootstrap_integration.py`
  - `test_provenance_integration.py`
  - `test_run_archive.py`
  - `test_sandbox_install.py`
  - `test_sandbox_usecases_fake.py`
  - `test_sandbox_usecases_live.py`
  - `test_usecases_u1_u4.py`
  - `test_spec_method_trace.py`
- no remaining redundant unit/property buckets in the canonical python suite after the current cutover

## GTL Contract Tests

### test_m01_gtl_core_integration.py

- Requirements: `REQ-L-GTL3-LANGUAGE`, `REQ-L-GTL3-ATTRS`, `REQ-L-GTL3-CONTEXT`, `REQ-L-GTL3-GRAPH`, `REQ-L-GTL3-NODE`, `REQ-L-GTL3-GRAPHVECTOR`, `REQ-L-GTL3-INTERFACE`, `REQ-L-GTL3-OPERATOR`, `REQ-L-GTL3-EVALUATOR`, `REQ-L-GTL3-RULE`, `REQ-L-GTL3-GRAPHFUNCTION`, `REQ-L-GTL3-COMPOSE`, `REQ-L-GTL3-SUBSTITUTE`, `REQ-L-GTL3-RECURSE`, `REQ-L-GTL3-HOF`, `REQ-L-GTL3-LAWS`, `REQ-L-GTL3-SYNTHESIS`, `REQ-L-GTL3-SELECTION-BOUNDARY`, `REQ-L-GTL3-IDENTITY`
- Design: [module_decomp.md](../../../common/design/module_decomp.md), [qualification_refactor_loop.md](../../../common/qualification/qualification_refactor_loop.md), [GTL_3_MODULE_DESIGN.md](../design/GTL_3_MODULE_DESIGN.md), [GTL_3_INTERFACE_CONTRACTS.md](../design/GTL_3_INTERFACE_CONTRACTS.md), [03-graph-function-algebra.md](../../../../specification/scenarios/03-graph-function-algebra.md)

### test_m02_work_publication_integration.py

- Requirements: `REQ-L-GTL3-MODULE`, `REQ-L-GTL3-JOB`, `REQ-L-GTL3-ROLE`, `REQ-L-GTL3-IDENTITY`, `REQ-L-GTL3-SELECTION-BOUNDARY`, `REQ-R-ABG2-JOB-WORKER`
- Design: [module_decomp.md](../../../common/design/module_decomp.md), [qualification_refactor_loop.md](../../../common/qualification/qualification_refactor_loop.md), [GTL_3_MODULE_DESIGN.md](../design/GTL_3_MODULE_DESIGN.md), [GTL_3_INTERFACE_CONTRACTS.md](../design/GTL_3_INTERFACE_CONTRACTS.md), [04-publication-and-semantic-work.md](../../../../specification/scenarios/04-publication-and-semantic-work.md)

## ABG Kernel Integration Tests

### test_m03_engine_kernel_integration.py

- Requirements: `REQ-R-ABG2-INTERPRET`, `REQ-R-ABG2-CONVERGENCE`, `REQ-R-ABG2-SELECTION-APPLICATION`, `REQ-R-ABG2-PROVENANCE`, `REQ-R-ABG2-RUN`, `REQ-R-ABG2-PROJECTION`, `REQ-R-ABG2-SELFHOSTING`, `REQ-M-GTL2-MAPPING`
- Design: [module_decomp.md](../../../common/design/module_decomp.md), [qualification_refactor_loop.md](../../../common/qualification/qualification_refactor_loop.md), [GTL_3_MODULE_DESIGN.md](../design/GTL_3_MODULE_DESIGN.md), [GTL_3_INTERFACE_CONTRACTS.md](../design/GTL_3_INTERFACE_CONTRACTS.md)

## Product and Qualification Tests

### test_cli_adapter_auto.py

- Requirements: `REQ-R-ABG2-EVENTS`, `REQ-R-ABG2-INTERPRET`, `REQ-R-ABG2-SELFHOSTING`, `REQ-R-ABG2-WORKER`, `REQ-P-POLICY-001`
- Design: [module_decomp.md](../../../common/design/module_decomp.md), [README.md](../design/README.md), [M04-app-bootstrap.yml](../../../common/design/modules/M04-app-bootstrap.yml), [ADR-031-runtime-identity-and-configured-worker.md](../design/adrs/ADR-031-runtime-identity-and-configured-worker.md)

### test_m04_app_bootstrap_integration.py

- Requirements: `REQ-P-QUAL-005`, `REQ-P-QUAL-006`, `REQ-P-QUAL-012`, `REQ-P-QUAL-023`, `REQ-P-QUAL-024`
- Design: [module_decomp.md](../../../common/design/module_decomp.md), [qualification_refactor_loop.md](../../../common/qualification/qualification_refactor_loop.md), [ADR-022-subprocess-transport-with-env-sanitization.md](../design/adrs/ADR-022-subprocess-transport-with-env-sanitization.md)

### test_provenance_integration.py

- Requirements: `REQ-R-ABG2-PROVENANCE`
- Design: [GTL_3_MODULE_DESIGN.md](../design/GTL_3_MODULE_DESIGN.md), [module_decomp.md](../../../common/design/module_decomp.md)

### test_run_archive.py

- Requirements: `REQ-P-QUAL-018A`, `REQ-P-QUAL-018B`, `REQ-P-QUAL-018C`, `REQ-P-QUAL-018D`, `REQ-P-QUAL-018E`, `REQ-P-QUAL-018F`
- Design: [GSDLC_LITE_QUALIFICATION_LADDER.md](../design/GSDLC_LITE_QUALIFICATION_LADDER.md), [qualification_surface_map.md](../../../common/qualification/qualification_surface_map.md)

### test_spec_method_trace.py

- Requirements: `REQ-R-ABG2-SELFHOSTING-002`
- Design: [module_decomp.md](../../../common/design/module_decomp.md), [design_surface_map.md](../../../common/design/design_surface_map.md), [qualification_surface_map.md](../../../common/qualification/qualification_surface_map.md)

## Sandbox and Scenario Tests

### test_sandbox_install.py

- Requirements: `REQ-R-ABG2-EVENTS`, `REQ-R-ABG2-INTERPRET`
- Design: [README.md](../design/README.md), [GSDLC_LITE_QUALIFICATION_LADDER.md](../design/GSDLC_LITE_QUALIFICATION_LADDER.md), [SCENARIO_GSDLC_LITE_REQUIREMENTS_DESIGN_CODE.md](../design/SCENARIO_GSDLC_LITE_REQUIREMENTS_DESIGN_CODE.md), [M04-app-bootstrap.yml](../../../common/design/modules/M04-app-bootstrap.yml)

### test_sandbox_usecases_fake.py

- Requirements: `REQ-L-GTL3-SYNTHESIS`, `REQ-L-GTL3-SELECTION-BOUNDARY`, `REQ-L-GTL3-SUBWORK`, `REQ-R-ABG2-INTERPRET`, `REQ-R-ABG2-BINDING`, `REQ-R-ABG2-CORRECTION`, `REQ-R-ABG2-LEAFTASK`, `REQ-R-ABG2-LINEAGE`, `REQ-R-ABG2-SELECTION-APPLICATION`, `REQ-R-ABG2-CONVERGENCE`, `REQ-R-ABG2-WORKER`
- Design: [GSDLC_LITE_QUALIFICATION_LADDER.md](../design/GSDLC_LITE_QUALIFICATION_LADDER.md), [SCENARIO_INTENT_TO_TAGGED_REQUIREMENTS.md](../design/SCENARIO_INTENT_TO_TAGGED_REQUIREMENTS.md), [SCENARIO_REQUIREMENTS_TO_UAT.md](../design/SCENARIO_REQUIREMENTS_TO_UAT.md), [SCENARIO_GSDLC_LITE_REQUIREMENTS_DESIGN_CODE.md](../design/SCENARIO_GSDLC_LITE_REQUIREMENTS_DESIGN_CODE.md)

### test_sandbox_usecases_live.py

- Requirements: `REQ-R-ABG2-TRANSPORT`, `REQ-R-ABG2-INTERPRET`
- Design: [GSDLC_LITE_QUALIFICATION_LADDER.md](../design/GSDLC_LITE_QUALIFICATION_LADDER.md), [SCENARIO_GSDLC_LITE_REQUIREMENTS_DESIGN_CODE.md](../design/SCENARIO_GSDLC_LITE_REQUIREMENTS_DESIGN_CODE.md)

### test_usecases_u1_u4.py

- Requirements: `REQ-L-GTL3-GRAPHFUNCTION`, `REQ-L-GTL3-SYNTHESIS`, `REQ-L-GTL3-SELECTION-BOUNDARY`, `REQ-L-GTL3-HOF`, `REQ-R-ABG2-INTERPRET`, `REQ-R-ABG2-CONVERGENCE`, `REQ-R-ABG2-SELECTION-APPLICATION`
- Design: [GTL_3_INTERFACE_CONTRACTS.md](../design/GTL_3_INTERFACE_CONTRACTS.md), [GTL_3_MODULE_DESIGN.md](../design/GTL_3_MODULE_DESIGN.md), [03-graph-function-algebra.md](../../../../specification/scenarios/03-graph-function-algebra.md)
