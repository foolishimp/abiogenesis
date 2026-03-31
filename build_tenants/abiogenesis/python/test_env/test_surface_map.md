# Abiogenesis Python Test Surface Map

**Status**: Active
**Date**: 2026-03-29
**Derived from**: [REQ-P-QUAL.md](../../../../specification/requirements/product/REQ-P-QUAL.md), [REQ-P-SCENARIOS.md](../../../../specification/requirements/product/REQ-P-SCENARIOS.md), [GTL_2_MODULE_DESIGN.md](../design/GTL_2_MODULE_DESIGN.md), [GTL_2_INTERFACE_CONTRACTS.md](../design/GTL_2_INTERFACE_CONTRACTS.md), [GSDLC_LITE_ABG_1_0_QUALIFICATION_LADDER.md](../design/GSDLC_LITE_ABG_1_0_QUALIFICATION_LADDER.md), [qualification_surface_map.md](../../../common/qualification/qualification_surface_map.md)

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
  - `test_v2_sandbox_install.py`
  - `test_v2_sandbox_usecases_fake.py`
  - `test_v2_sandbox_usecases_live.py`
  - `test_v2_usecases_u1_u4.py`
  - `test_spec_method_trace.py`
- no remaining legacy unit/property buckets in the canonical python suite after the current cutover

## GTL Contract Tests

### test_m01_gtl_core_integration.py

- Requirements: `REQ-L-GTL2-GRAPH`, `REQ-L-GTL2-NODE`, `REQ-L-GTL2-INTERFACE`, `REQ-L-GTL2-OPERATOR`, `REQ-L-GTL2-EVALUATOR`, `REQ-L-GTL2-RULE`, `REQ-L-GTL2-GRAPHFUNCTION`, `REQ-L-GTL2-COMPOSE`, `REQ-L-GTL2-SUBSTITUTE`, `REQ-L-GTL2-RECURSE`, `REQ-L-GTL2-HOF`, `REQ-L-GTL2-SYNTHESIS`, `REQ-L-GTL2-SELECTION-BOUNDARY`, `REQ-L-GTL2-IDENTITY`
- Design: [module_decomp.md](../../../common/design/module_decomp.md), [qualification_refactor_loop.md](../../../common/qualification/qualification_refactor_loop.md), [GTL_2_MODULE_DESIGN.md](../design/GTL_2_MODULE_DESIGN.md), [GTL_2_INTERFACE_CONTRACTS.md](../design/GTL_2_INTERFACE_CONTRACTS.md)

### test_m02_work_publication_integration.py

- Requirements: `REQ-L-GTL2-MODULE`, `REQ-L-GTL2-JOB`, `REQ-L-GTL2-ROLE`, `REQ-L-GTL2-IDENTITY`, `REQ-L-GTL2-SELECTION-BOUNDARY`, `REQ-L-GTL2-ENGINE-INDEPENDENCE`
- Design: [module_decomp.md](../../../common/design/module_decomp.md), [qualification_refactor_loop.md](../../../common/qualification/qualification_refactor_loop.md), [GTL_2_MODULE_DESIGN.md](../design/GTL_2_MODULE_DESIGN.md), [GTL_2_INTERFACE_CONTRACTS.md](../design/GTL_2_INTERFACE_CONTRACTS.md)

## ABG Kernel Integration Tests

### test_m03_engine_kernel_integration.py

- Requirements: `REQ-R-ABG2-INTERPRET`, `REQ-R-ABG2-CONVERGENCE`, `REQ-R-ABG2-SELECTION-APPLICATION`, `REQ-R-ABG2-PROVENANCE`, `REQ-R-ABG2-RUN`, `REQ-R-ABG2-PROJECTION`, `REQ-R-ABG2-SELFHOSTING`
- Design: [module_decomp.md](../../../common/design/module_decomp.md), [qualification_refactor_loop.md](../../../common/qualification/qualification_refactor_loop.md), [GTL_2_MODULE_DESIGN.md](../design/GTL_2_MODULE_DESIGN.md), [GTL_2_INTERFACE_CONTRACTS.md](../design/GTL_2_INTERFACE_CONTRACTS.md)

## Product and Qualification Tests

### test_cli_adapter_auto.py

- Requirements: `REQ-R-ABG2-EVENTS`, `REQ-R-ABG2-INTERPRET`, `REQ-R-ABG2-SELFHOSTING`, `REQ-R-ABG2-WORKER`, `REQ-P-POLICY-001`
- Design: [module_decomp.md](../../../common/design/module_decomp.md), [README.md](../design/README.md), [M04-app-bootstrap.yml](../../../common/design/modules/M04-app-bootstrap.yml), [ADR-031-runtime-identity-and-configured-worker.md](../design/adrs/ADR-031-runtime-identity-and-configured-worker.md)

### test_m04_app_bootstrap_integration.py

- Requirements: `REQ-P-QUAL-005`, `REQ-P-QUAL-006`, `REQ-P-QUAL-012`, `REQ-P-QUAL-023`, `REQ-P-QUAL-024`
- Design: [module_decomp.md](../../../common/design/module_decomp.md), [qualification_refactor_loop.md](../../../common/qualification/qualification_refactor_loop.md), [ADR-022-subprocess-transport-with-env-sanitization.md](../design/adrs/ADR-022-subprocess-transport-with-env-sanitization.md)

### test_provenance_integration.py

- Requirements: `REQ-F-PROV-001`, `REQ-F-PROV-002`, `REQ-F-PROV-003`, `REQ-F-PROV-004`, `REQ-F-PROV-005`
- Design: [GTL_2_MODULE_DESIGN.md](../design/GTL_2_MODULE_DESIGN.md), [module_decomp.md](../../../common/design/module_decomp.md)

### test_run_archive.py

- Requirements: `REQ-P-QUAL-018A`, `REQ-P-QUAL-018B`, `REQ-P-QUAL-018C`, `REQ-P-QUAL-018D`, `REQ-P-QUAL-018E`, `REQ-P-QUAL-018F`
- Design: [GSDLC_LITE_ABG_1_0_QUALIFICATION_LADDER.md](../design/GSDLC_LITE_ABG_1_0_QUALIFICATION_LADDER.md), [qualification_surface_map.md](../../../common/qualification/qualification_surface_map.md)

### test_spec_method_trace.py

- Requirements: `REQ-R-ABG2-SELFHOSTING-002`
- Design: [module_decomp.md](../../../common/design/module_decomp.md), [design_surface_map.md](../../../common/design/design_surface_map.md), [qualification_surface_map.md](../../../common/qualification/qualification_surface_map.md)

## Sandbox and Scenario Tests

### test_v2_sandbox_install.py

- Requirements: `REQ-R-ABG2-EVENTS`, `REQ-R-ABG2-INTERPRET`
- Design: [README.md](../design/README.md), [GSDLC_LITE_ABG_1_0_QUALIFICATION_LADDER.md](../design/GSDLC_LITE_ABG_1_0_QUALIFICATION_LADDER.md), [SCENARIO_V2_GSDLC_LITE_REQUIREMENTS_DESIGN_CODE.md](../design/SCENARIO_V2_GSDLC_LITE_REQUIREMENTS_DESIGN_CODE.md), [M04-app-bootstrap.yml](../../../common/design/modules/M04-app-bootstrap.yml)

### test_v2_sandbox_usecases_fake.py

- Requirements: `REQ-L-GTL2-SYNTHESIS`, `REQ-L-GTL2-SELECTION-BOUNDARY`, `REQ-L-GTL2-SUBWORK`, `REQ-R-ABG2-INTERPRET`, `REQ-R-ABG2-BINDING`, `REQ-R-ABG2-CORRECTION`, `REQ-R-ABG2-LEAFTASK`, `REQ-R-ABG2-LINEAGE`, `REQ-R-ABG2-SELECTION-APPLICATION`, `REQ-R-ABG2-CONVERGENCE`, `REQ-R-ABG2-WORKER`
- Design: [GSDLC_LITE_ABG_1_0_QUALIFICATION_LADDER.md](../design/GSDLC_LITE_ABG_1_0_QUALIFICATION_LADDER.md), [SCENARIO_V2_INTENT_TO_TAGGED_REQUIREMENTS.md](../design/SCENARIO_V2_INTENT_TO_TAGGED_REQUIREMENTS.md), [SCENARIO_V2_REQUIREMENTS_TO_UAT.md](../design/SCENARIO_V2_REQUIREMENTS_TO_UAT.md), [SCENARIO_V2_GSDLC_LITE_REQUIREMENTS_DESIGN_CODE.md](../design/SCENARIO_V2_GSDLC_LITE_REQUIREMENTS_DESIGN_CODE.md)

### test_v2_sandbox_usecases_live.py

- Requirements: `REQ-R-ABG2-TRANSPORT`, `REQ-R-ABG2-INTERPRET`
- Design: [GSDLC_LITE_ABG_1_0_QUALIFICATION_LADDER.md](../design/GSDLC_LITE_ABG_1_0_QUALIFICATION_LADDER.md), [SCENARIO_V2_GSDLC_LITE_REQUIREMENTS_DESIGN_CODE.md](../design/SCENARIO_V2_GSDLC_LITE_REQUIREMENTS_DESIGN_CODE.md)

### test_v2_usecases_u1_u4.py

- Requirements: `REQ-L-GTL2-GRAPHFUNCTION`, `REQ-L-GTL2-SYNTHESIS`, `REQ-L-GTL2-SELECTION-BOUNDARY`, `REQ-L-GTL2-HOF`, `REQ-R-ABG2-INTERPRET`, `REQ-R-ABG2-CONVERGENCE`, `REQ-R-ABG2-SELECTION-APPLICATION`
- Design: [GTL_2_INTERFACE_CONTRACTS.md](../design/GTL_2_INTERFACE_CONTRACTS.md), [GTL_2_MODULE_DESIGN.md](../design/GTL_2_MODULE_DESIGN.md)
