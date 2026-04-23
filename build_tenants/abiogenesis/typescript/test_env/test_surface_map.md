# Abiogenesis TypeScript Test Surface Map

**Status**: Active
**Date**: 2026-04-24
**Derived from**: [REQ-P-QUAL.md](../../../../specification/requirements/product/REQ-P-QUAL.md), [REQ-P-SCENARIOS.md](../../../../specification/requirements/product/REQ-P-SCENARIOS.md), [GTL_3_MODULE_DESIGN.md](../design/GTL_3_MODULE_DESIGN.md), [GTL_3_INTERFACE_CONTRACTS.md](../design/GTL_3_INTERFACE_CONTRACTS.md), [GTL_3_FIRST_SLICE_IACS.md](../design/GTL_3_FIRST_SLICE_IACS.md), [GTL_3_M02_WORK_PUBLICATION_IACS.md](../design/GTL_3_M02_WORK_PUBLICATION_IACS.md), [ABG_3_MODULE_DESIGN.md](../design/ABG_3_MODULE_DESIGN.md), [ABG_3_FIRST_SLICE_IACS.md](../design/ABG_3_FIRST_SLICE_IACS.md), [M04_PUBLIC_START_DERIVATION.md](../design/M04_PUBLIC_START_DERIVATION.md), [M04_FIRST_SLICE_IACS.md](../design/M04_FIRST_SLICE_IACS.md), [M04_PUBLIC_START_STRUCTURAL_CARRIER_DIAGRAM.md](../design/M04_PUBLIC_START_STRUCTURAL_CARRIER_DIAGRAM.md), [M04_CONTROL_LOOP_DERIVATION.md](../design/M04_CONTROL_LOOP_DERIVATION.md), [M04_CONTROL_LOOP_FIRST_SLICE_IACS.md](../design/M04_CONTROL_LOOP_FIRST_SLICE_IACS.md), [M04_CONTROL_LOOP_STRUCTURAL_CARRIER_DIAGRAM.md](../design/M04_CONTROL_LOOP_STRUCTURAL_CARRIER_DIAGRAM.md), [M02_M03_LOOKUP_AUTHORITY_DERIVATION.md](../design/M02_M03_LOOKUP_AUTHORITY_DERIVATION.md), [M02_M03_LOOKUP_AUTHORITY_IACS.md](../design/M02_M03_LOOKUP_AUTHORITY_IACS.md), [M02_M03_LOOKUP_AUTHORITY_STRUCTURAL_CARRIER_DIAGRAM.md](../design/M02_M03_LOOKUP_AUTHORITY_STRUCTURAL_CARRIER_DIAGRAM.md), [TYPESCRIPT_STRICT_LANE.md](../design/TYPESCRIPT_STRICT_LANE.md), [T-009-build-the-typescript-tenant-first-slice-under-explicit-carrier-law.md](../../../.ai-workspace/tickets/completed/T-009-build-the-typescript-tenant-first-slice-under-explicit-carrier-law.md), [T-010-realize-typescript-gtl-m02-work-publication-under-explicit-publication-carrier-law.md](../../../.ai-workspace/tickets/completed/T-010-realize-typescript-gtl-m02-work-publication-under-explicit-publication-carrier-law.md), [T-011-realize-typescript-abg-first-runtime-slice-under-explicit-execution-event-carrier-law.md](../../../.ai-workspace/tickets/completed/T-011-realize-typescript-abg-first-runtime-slice-under-explicit-execution-event-carrier-law.md), [T-012-realize-typescript-m04-public-start-steel-thread-over-kernel-owned-runtime-law.md](../../../.ai-workspace/tickets/completed/T-012-realize-typescript-m04-public-start-steel-thread-over-kernel-owned-runtime-law.md), [T-013-realize-typescript-m04-control-modes-over-closed-public-start-outcome-law.md](../../../.ai-workspace/tickets/completed/T-013-realize-typescript-m04-control-modes-over-closed-public-start-outcome-law.md), [T-014-reprice-typescript-m02-publication-lookup-and-m03-execution-resolution-under-explicit-lookup-authority.md](../../../.ai-workspace/tickets/completed/T-014-reprice-typescript-m02-publication-lookup-and-m03-execution-resolution-under-explicit-lookup-authority.md)

## Purpose

Review and trace the active `abiogenesis/typescript` test surface from live
requirements through tenant-local design authority into executable tests.

This document is structural only.
It does not change what runs.

## Rule

Every `*.test.mjs` file under `build_tenants/abiogenesis/typescript/test_env/tests/`
shall appear here with:

- the live requirement families it validates
- the governing design surfaces it derives from
- whether it is a canonical module-owned lane or a transitional slice-gating
  proof

Canonical tests derive from module authority, not code shape.

That means the canonical test for an active boundary must be justified by:

- module ownership
- module design
- IACS or equivalent carrier inventory
- structural carrier diagram when one exists

It must not be justified primarily by:

- helper decomposition
- private method layout
- incidental branch shape
- mock convenience around one local function

## Current Reading

The active TypeScript tenant now has completed:

- GTL `M01-gtl-core`
- GTL `M02-work-publication`

The active TypeScript tenant now has a completed steel-thread runtime wave:

- ABG `M03-engine-kernel`

The active TypeScript tenant now has a completed bounded public-entry wave:

- `M04-app-bootstrap` first public-start steel thread

The active TypeScript tenant now has a completed bounded control-mode wave:

- `M04-app-bootstrap` control-mode slice over completed public-start truth

The active TypeScript tenant now has one completed cross-module cleanup wave:

- `M02-work-publication` to `M03-engine-kernel` lookup-authority repricing

Current proof shape:

- canonical module-owned lane to keep and build from:
  - `test_m01_gtl_core_integration.test.mjs`
  - `test_m02_work_publication_integration.test.mjs`
  - `test_m03_engine_kernel_integration.test.mjs`
  - `test_m04_app_bootstrap_unit.test.mjs`
  - `test_m04_app_bootstrap_integration.test.mjs`
- transitional slice-gating proofs retained from `T-009`:
  - `t009-m01-negative-ingress.test.mjs`
  - `t009-m01-roundtrip.test.mjs`
- transitional slice-gating proof retained from `T-010`:
  - `t010-m02-negative-ingress.test.mjs`
- transitional slice-gating proof retained from `T-011`:
  - `t011-abg-negative-ingress.test.mjs`
- transitional slice-gating proof retained from `T-012`:
  - `t012-m04-negative-ingress.test.mjs`

The TypeScript tenant does **not** yet have a sandbox qualification lane.
Per shared qualification law, sandbox becomes the primary tenant qualification
surface later as `M05-qualification-scenarios`, after enough runtime and
bootstrap surface exists to make sandbox proof meaningful.

Until enough runtime and bootstrap surface exists for sandbox:

- `M01` and `M02` remain module-owned and integration-first
- completed `M03` remains module-owned and integration-first
- completed `M04` now has declared module-derived proof lanes and remains bounded
  across the first public-start steel thread plus the first bounded control
  loop slice
- completed `T-013` now has executable control-loop tests derived from the
  declared module boundary
- completed `T-014` now has lookup-authority tests derived from the new
  `M02 -> M03` boundary rather than from helper layout
- ticket-local proofs may remain as shadow oracles
- later sandbox work must derive from successor tickets rather than widening
  `T-011`

## M02 To M03 Lookup-Authority Tests

The completed cross-boundary lookup wave is `T-014`.
Its canonical test lanes derive from:

- [M02_M03_LOOKUP_AUTHORITY_DERIVATION.md](../design/M02_M03_LOOKUP_AUTHORITY_DERIVATION.md)
- [M02_M03_LOOKUP_AUTHORITY_IACS.md](../design/M02_M03_LOOKUP_AUTHORITY_IACS.md)
- [M02_M03_LOOKUP_AUTHORITY_STRUCTURAL_CARRIER_DIAGRAM.md](../design/M02_M03_LOOKUP_AUTHORITY_STRUCTURAL_CARRIER_DIAGRAM.md)
- [GTL_3_M02_WORK_PUBLICATION_IACS.md](../design/GTL_3_M02_WORK_PUBLICATION_IACS.md)
- [ABG_3_FIRST_SLICE_IACS.md](../design/ABG_3_FIRST_SLICE_IACS.md)
- [T-014-reprice-typescript-m02-publication-lookup-and-m03-execution-resolution-under-explicit-lookup-authority.md](../../../.ai-workspace/tickets/completed/T-014-reprice-typescript-m02-publication-lookup-and-m03-execution-resolution-under-explicit-lookup-authority.md)

The canonical active files are:

- `test_m02_m03_lookup_authority_integration.test.mjs` — canonical module-owned
  integration lane
- `t014-lookup-authority-negative.test.mjs` — fail-closed negative-proof fixture

## M04 Public Start Tests

The completed public-start wave is `T-012`.
Its canonical test lanes derive from:

- [M04_PUBLIC_START_DERIVATION.md](../design/M04_PUBLIC_START_DERIVATION.md)
- [M04_FIRST_SLICE_IACS.md](../design/M04_FIRST_SLICE_IACS.md)
- [M04_PUBLIC_START_STRUCTURAL_CARRIER_DIAGRAM.md](../design/M04_PUBLIC_START_STRUCTURAL_CARRIER_DIAGRAM.md)
- [ABG_3_MODULE_DESIGN.md](../design/ABG_3_MODULE_DESIGN.md)
- [T-012-realize-typescript-m04-public-start-steel-thread-over-kernel-owned-runtime-law.md](../../../.ai-workspace/tickets/completed/T-012-realize-typescript-m04-public-start-steel-thread-over-kernel-owned-runtime-law.md)

The canonical active files are:

- `test_m04_app_bootstrap_unit.test.mjs` — canonical module-derived unit lane
- `test_m04_app_bootstrap_integration.test.mjs` — canonical module-owned
  integration lane
- `t012-m04-negative-ingress.test.mjs` — fail-closed negative-proof fixture

## M04 Control Loop Tests

The completed next `M04` wave is `T-013`.
Its canonical test lanes derive from:

- [M04_CONTROL_LOOP_DERIVATION.md](../design/M04_CONTROL_LOOP_DERIVATION.md)
- [M04_CONTROL_LOOP_FIRST_SLICE_IACS.md](../design/M04_CONTROL_LOOP_FIRST_SLICE_IACS.md)
- [M04_CONTROL_LOOP_STRUCTURAL_CARRIER_DIAGRAM.md](../design/M04_CONTROL_LOOP_STRUCTURAL_CARRIER_DIAGRAM.md)
- [ABG_3_MODULE_DESIGN.md](../design/ABG_3_MODULE_DESIGN.md)
- [T-013-realize-typescript-m04-control-modes-over-closed-public-start-outcome-law.md](../../../.ai-workspace/tickets/completed/T-013-realize-typescript-m04-control-modes-over-closed-public-start-outcome-law.md)

The canonical active files are:

- `test_m04_control_loop_unit.test.mjs` — canonical module-derived unit lane
- `test_m04_control_loop_integration.test.mjs` — canonical module-owned integration lane
- `t013-m04-control-negative.test.mjs` — fail-closed negative-proof fixture

## GTL Contract Tests

### test_m01_gtl_core_integration.test.mjs

- Status: canonical module-owned lane
- Module alignment: `M01-gtl-core`
- Requirements: `REQ-L-GTL3-ATTRS`, `REQ-L-GTL3-CONTEXT`, `REQ-L-GTL3-GRAPH`, `REQ-L-GTL3-NODE`, `REQ-L-GTL3-GRAPHVECTOR`, `REQ-L-GTL3-GRAPHFUNCTION`, `REQ-L-GTL3-HOOKS`, `REQ-L-GTL3-INTERFACE`, `REQ-L-GTL3-OPERATOR`, `REQ-L-GTL3-EVALUATOR`, `REQ-L-GTL3-RULE`, `REQ-L-GTL3-COMPOSE`, `REQ-L-GTL3-SUBSTITUTE`, `REQ-L-GTL3-HOF`, `REQ-L-GTL3-SELECTION-BOUNDARY`, `REQ-L-GTL3-SYNTHESIS`, `REQ-L-GTL3-IDENTITY`, `REQ-L-GTL3-LAWS`
- Design: [GTL_3_MODULE_DESIGN.md](../design/GTL_3_MODULE_DESIGN.md), [GTL_3_INTERFACE_CONTRACTS.md](../design/GTL_3_INTERFACE_CONTRACTS.md), [GTL_3_FIRST_SLICE_IACS.md](../design/GTL_3_FIRST_SLICE_IACS.md), [TYPESCRIPT_STRICT_LANE.md](../design/TYPESCRIPT_STRICT_LANE.md)
- Current focus inside this lane:
  immutable value semantics, stable equality behavior, composition/interface
  law, substitution law, higher-order operator legality, recursion law,
  explicit materialization law, package-first tenant entrypoint stability,
  replayable governance-hook visibility, and inspectable first-class
  declaration truth

### test_m02_work_publication_integration.test.mjs

- Status: canonical module-owned lane
- Module alignment: `M02-work-publication`
- Requirements: `REQ-L-GTL3-GRAPHFUNCTION`, `REQ-L-GTL3-JOB`, `REQ-L-GTL3-ROLE`, `REQ-L-GTL3-MODULE`, `REQ-L-GTL3-SELECTION-BOUNDARY`, `REQ-L-GTL3-HOOKS`, `REQ-L-GTL3-IDENTITY`
- Design: [GTL_3_MODULE_DESIGN.md](../design/GTL_3_MODULE_DESIGN.md), [GTL_3_INTERFACE_CONTRACTS.md](../design/GTL_3_INTERFACE_CONTRACTS.md), [GTL_3_M02_WORK_PUBLICATION_IACS.md](../design/GTL_3_M02_WORK_PUBLICATION_IACS.md), [TYPESCRIPT_STRICT_LANE.md](../design/TYPESCRIPT_STRICT_LANE.md)
- Current focus inside this lane:
  graph-function-first module publication, replayable discoverability,
  semantic job binding through `ContractRef(kind="graph_function", targetId)`,
  selection-boundary publication visibility, and stable package-first `M02`
  entrypoint exports

## ABG Runtime Tests

### test_m03_engine_kernel_integration.test.mjs

- Status: canonical module-owned lane
- Module alignment: `M03-engine-kernel`
- Requirements: `REQ-R-ABG3-INTERPRET`, `REQ-R-ABG3-EVENTS`, `REQ-R-ABG3-RUN`, `REQ-R-ABG3-CONVERGENCE`
- Design: [ABG_3_MODULE_DESIGN.md](../design/ABG_3_MODULE_DESIGN.md), [ABG_3_FIRST_SLICE_IACS.md](../design/ABG_3_FIRST_SLICE_IACS.md), [TYPESCRIPT_STRICT_LANE.md](../design/TYPESCRIPT_STRICT_LANE.md), [T-011-realize-typescript-abg-first-runtime-slice-under-explicit-execution-event-carrier-law.md](../../../.ai-workspace/tickets/completed/T-011-realize-typescript-abg-first-runtime-slice-under-explicit-execution-event-carrier-law.md)
- Current focus inside this lane:
  public runtime ingress through one admitted `StartIntent`, one admitted
  `ExecutionBasis` derived from published GTL/M02 truth, one closed
  `AdvancementTransition` family, one closed `RuntimeEvent` family, typed
  dispatch request derivation for `F_P`, typed event emission, and stable
  package-first `./abg/m03` exports

### test_m02_m03_lookup_authority_integration.test.mjs

- Status: canonical module-owned lane
- Module alignment: `M02-work-publication` -> `M03-engine-kernel`
- Requirements: `REQ-L-GTL3-MODULE`, `REQ-L-GTL3-JOB`, `REQ-L-GTL3-GRAPHFUNCTION`, `REQ-R-ABG3-INTERPRET`, `REQ-R-ABG3-RUN`
- Design: [M02_M03_LOOKUP_AUTHORITY_DERIVATION.md](../design/M02_M03_LOOKUP_AUTHORITY_DERIVATION.md), [M02_M03_LOOKUP_AUTHORITY_IACS.md](../design/M02_M03_LOOKUP_AUTHORITY_IACS.md), [M02_M03_LOOKUP_AUTHORITY_STRUCTURAL_CARRIER_DIAGRAM.md](../design/M02_M03_LOOKUP_AUTHORITY_STRUCTURAL_CARRIER_DIAGRAM.md), [GTL_3_M02_WORK_PUBLICATION_IACS.md](../design/GTL_3_M02_WORK_PUBLICATION_IACS.md), [ABG_3_FIRST_SLICE_IACS.md](../design/ABG_3_FIRST_SLICE_IACS.md), [TYPESCRIPT_STRICT_LANE.md](../design/TYPESCRIPT_STRICT_LANE.md), [T-014-reprice-typescript-m02-publication-lookup-and-m03-execution-resolution-under-explicit-lookup-authority.md](../../../.ai-workspace/tickets/completed/T-014-reprice-typescript-m02-publication-lookup-and-m03-execution-resolution-under-explicit-lookup-authority.md)
- Current focus inside this lane:
  explicit subordinate lookup authority derived from admitted `Module` truth,
  execution-basis resolution by published callable handle and semantic job
  binding, and preservation of the closed tenant package surface for internal
  lookup detail

### test_m04_app_bootstrap_unit.test.mjs

- Status: canonical module-derived unit lane
- Module alignment: `M04-app-bootstrap`
- Requirements: `REQ-P-POLICY`, `REQ-P-POLICY-009`, `REQ-P-POLICY-011`, `REQ-P-POLICY-012`, `REQ-P-POLICY-013`
- Design: [M04_PUBLIC_START_DERIVATION.md](../design/M04_PUBLIC_START_DERIVATION.md), [M04_FIRST_SLICE_IACS.md](../design/M04_FIRST_SLICE_IACS.md), [M04_PUBLIC_START_STRUCTURAL_CARRIER_DIAGRAM.md](../design/M04_PUBLIC_START_STRUCTURAL_CARRIER_DIAGRAM.md), [ABG_3_MODULE_DESIGN.md](../design/ABG_3_MODULE_DESIGN.md), [TYPESCRIPT_STRICT_LANE.md](../design/TYPESCRIPT_STRICT_LANE.md)
- Current focus inside this lane:
  public-start request grammar over `scope + target + until`, orthogonal
  control-mode admission, explicit configured runtime selector admission, and
  closed public outcome-family mapping over kernel-owned transition/event truth

### test_m04_app_bootstrap_integration.test.mjs

- Status: canonical module-owned lane
- Module alignment: `M04-app-bootstrap`
- Requirements: `REQ-P-POLICY`, `REQ-P-POLICY-004`, `REQ-P-POLICY-008`, `REQ-P-POLICY-009`, `REQ-P-POLICY-011`, `REQ-P-POLICY-012`, `REQ-P-POLICY-013`, `REQ-R-ABG3-BINDING`, `REQ-R-ABG3-BINDING-002`, `REQ-R-ABG3-BINDING-003`, `REQ-R-ABG3-EVENTS`, `REQ-R-ABG3-EVENTS-001`
- Design: [M04_PUBLIC_START_DERIVATION.md](../design/M04_PUBLIC_START_DERIVATION.md), [M04_FIRST_SLICE_IACS.md](../design/M04_FIRST_SLICE_IACS.md), [M04_PUBLIC_START_STRUCTURAL_CARRIER_DIAGRAM.md](../design/M04_PUBLIC_START_STRUCTURAL_CARRIER_DIAGRAM.md), [ABG_3_MODULE_DESIGN.md](../design/ABG_3_MODULE_DESIGN.md), [TYPESCRIPT_STRICT_LANE.md](../design/TYPESCRIPT_STRICT_LANE.md), [T-012-realize-typescript-m04-public-start-steel-thread-over-kernel-owned-runtime-law.md](../../../.ai-workspace/tickets/completed/T-012-realize-typescript-m04-public-start-steel-thread-over-kernel-owned-runtime-law.md)
- Current focus inside this lane:
  one admitted public start request over completed `M03` kernel truth,
  canonical `emit(...)` routing, explicit runtime identity projection, package
  export stability, and public blocked/advanced/rejected outcome truth

## Transitional Slice Gates

### t009-m01-negative-ingress.test.mjs

- Status: transitional slice-gating proof
- Module alignment: `M01-gtl-core`
- Requirements: `REQ-L-GTL3-ATTRS`, `REQ-L-GTL3-NODE`, `REQ-L-GTL3-GRAPHVECTOR`, `REQ-L-GTL3-GRAPHFUNCTION`, `REQ-L-GTL3-HOOKS`, `REQ-L-GTL3-INTERFACE`
- Design: [TYPESCRIPT_REALIZATION_GUARDRAILS.md](../design/TYPESCRIPT_REALIZATION_GUARDRAILS.md), [TYPESCRIPT_STRICT_LANE.md](../design/TYPESCRIPT_STRICT_LANE.md), [GTL_3_INTERFACE_CONTRACTS.md](../design/GTL_3_INTERFACE_CONTRACTS.md), [T-009-build-the-typescript-tenant-first-slice-under-explicit-carrier-law.md](../../../.ai-workspace/tickets/completed/T-009-build-the-typescript-tenant-first-slice-under-explicit-carrier-law.md)

### t009-m01-roundtrip.test.mjs

- Status: transitional slice-gating proof
- Module alignment: `M01-gtl-core`
- Requirements: `REQ-L-GTL3-ATTRS`, `REQ-L-GTL3-CONTEXT`, `REQ-L-GTL3-GRAPH`, `REQ-L-GTL3-NODE`, `REQ-L-GTL3-GRAPHVECTOR`, `REQ-L-GTL3-GRAPHFUNCTION`, `REQ-L-GTL3-HOOKS`, `REQ-L-GTL3-IDENTITY`
- Design: [GTL_3_INTERFACE_CONTRACTS.md](../design/GTL_3_INTERFACE_CONTRACTS.md), [GTL_3_FIRST_SLICE_IACS.md](../design/GTL_3_FIRST_SLICE_IACS.md), [TYPESCRIPT_STRICT_LANE.md](../design/TYPESCRIPT_STRICT_LANE.md), [T-009-build-the-typescript-tenant-first-slice-under-explicit-carrier-law.md](../../../.ai-workspace/tickets/completed/T-009-build-the-typescript-tenant-first-slice-under-explicit-carrier-law.md)

### t010-m02-negative-ingress.test.mjs

- Status: transitional slice-gating proof retained as `T-010` closure evidence
- Module alignment: `M02-work-publication`
- Requirements: `REQ-L-GTL3-JOB`, `REQ-L-GTL3-ROLE`, `REQ-L-GTL3-MODULE`, `REQ-L-GTL3-SELECTION-BOUNDARY`, `REQ-L-GTL3-HOOKS`
- Design: [TYPESCRIPT_REALIZATION_GUARDRAILS.md](../design/TYPESCRIPT_REALIZATION_GUARDRAILS.md), [GTL_3_INTERFACE_CONTRACTS.md](../design/GTL_3_INTERFACE_CONTRACTS.md), [GTL_3_M02_WORK_PUBLICATION_IACS.md](../design/GTL_3_M02_WORK_PUBLICATION_IACS.md), [TYPESCRIPT_STRICT_LANE.md](../design/TYPESCRIPT_STRICT_LANE.md), [T-010-realize-typescript-gtl-m02-work-publication-under-explicit-publication-carrier-law.md](../../../.ai-workspace/tickets/completed/T-010-realize-typescript-gtl-m02-work-publication-under-explicit-publication-carrier-law.md)

### t011-abg-negative-ingress.test.mjs

- Status: transitional slice-gating proof retained as `T-011` runtime fail-closed evidence
- Module alignment: `M03-engine-kernel`
- Requirements: `REQ-R-ABG3-INTERPRET`, `REQ-R-ABG3-EVENTS`, `REQ-R-ABG3-RUN`
- Design: [TYPESCRIPT_REALIZATION_GUARDRAILS.md](../design/TYPESCRIPT_REALIZATION_GUARDRAILS.md), [ABG_3_MODULE_DESIGN.md](../design/ABG_3_MODULE_DESIGN.md), [ABG_3_FIRST_SLICE_IACS.md](../design/ABG_3_FIRST_SLICE_IACS.md), [TYPESCRIPT_STRICT_LANE.md](../design/TYPESCRIPT_STRICT_LANE.md), [T-011-realize-typescript-abg-first-runtime-slice-under-explicit-execution-event-carrier-law.md](../../../.ai-workspace/tickets/completed/T-011-realize-typescript-abg-first-runtime-slice-under-explicit-execution-event-carrier-law.md)

### t012-m04-negative-ingress.test.mjs

- Status: transitional slice-gating proof retained as `T-012` public-start fail-closed evidence
- Module alignment: `M04-app-bootstrap`
- Requirements: `REQ-P-POLICY`, `REQ-P-POLICY-009`, `REQ-P-POLICY-011`, `REQ-P-POLICY-012`, `REQ-P-POLICY-013`
- Design: [TYPESCRIPT_REALIZATION_GUARDRAILS.md](../design/TYPESCRIPT_REALIZATION_GUARDRAILS.md), [M04_PUBLIC_START_DERIVATION.md](../design/M04_PUBLIC_START_DERIVATION.md), [M04_FIRST_SLICE_IACS.md](../design/M04_FIRST_SLICE_IACS.md), [M04_PUBLIC_START_STRUCTURAL_CARRIER_DIAGRAM.md](../design/M04_PUBLIC_START_STRUCTURAL_CARRIER_DIAGRAM.md), [TYPESCRIPT_STRICT_LANE.md](../design/TYPESCRIPT_STRICT_LANE.md), [T-012-realize-typescript-m04-public-start-steel-thread-over-kernel-owned-runtime-law.md](../../../.ai-workspace/tickets/completed/T-012-realize-typescript-m04-public-start-steel-thread-over-kernel-owned-runtime-law.md)

### test_m04_control_loop_unit.test.mjs

- Status: canonical module-derived unit lane
- Module alignment: `M04-app-bootstrap`
- Requirements: `REQ-P-POLICY`, `REQ-P-POLICY-004`, `REQ-P-POLICY-008`, `REQ-P-POLICY-009`, `REQ-P-POLICY-011`, `REQ-P-POLICY-012`, `REQ-P-POLICY-013`
- Design: [M04_CONTROL_LOOP_DERIVATION.md](../design/M04_CONTROL_LOOP_DERIVATION.md), [M04_CONTROL_LOOP_FIRST_SLICE_IACS.md](../design/M04_CONTROL_LOOP_FIRST_SLICE_IACS.md), [M04_CONTROL_LOOP_STRUCTURAL_CARRIER_DIAGRAM.md](../design/M04_CONTROL_LOOP_STRUCTURAL_CARRIER_DIAGRAM.md), [ABG_3_MODULE_DESIGN.md](../design/ABG_3_MODULE_DESIGN.md), [TYPESCRIPT_STRICT_LANE.md](../design/TYPESCRIPT_STRICT_LANE.md)
- Current focus inside this lane:
  nested control-loop request admission over completed public-start truth,
  bounded approval-hint derivation from explicit `approvalSubjectRef`, and
  explicit yielded re-entry truth over repeated advanced public-start outcomes

### test_m04_control_loop_integration.test.mjs

- Status: canonical module-owned lane
- Module alignment: `M04-app-bootstrap`
- Requirements: `REQ-P-POLICY`, `REQ-P-POLICY-004`, `REQ-P-POLICY-008`, `REQ-P-POLICY-009`, `REQ-P-POLICY-011`, `REQ-P-POLICY-012`, `REQ-P-POLICY-013`, `REQ-R-ABG3-BINDING`, `REQ-R-ABG3-BINDING-002`, `REQ-R-ABG3-BINDING-003`, `REQ-R-ABG3-EVENTS`, `REQ-R-ABG3-EVENTS-001`
- Design: [M04_CONTROL_LOOP_DERIVATION.md](../design/M04_CONTROL_LOOP_DERIVATION.md), [M04_CONTROL_LOOP_FIRST_SLICE_IACS.md](../design/M04_CONTROL_LOOP_FIRST_SLICE_IACS.md), [M04_CONTROL_LOOP_STRUCTURAL_CARRIER_DIAGRAM.md](../design/M04_CONTROL_LOOP_STRUCTURAL_CARRIER_DIAGRAM.md), [ABG_3_MODULE_DESIGN.md](../design/ABG_3_MODULE_DESIGN.md), [TYPESCRIPT_STRICT_LANE.md](../design/TYPESCRIPT_STRICT_LANE.md), [T-013-realize-typescript-m04-control-modes-over-closed-public-start-outcome-law.md](../../../.ai-workspace/tickets/completed/T-013-realize-typescript-m04-control-modes-over-closed-public-start-outcome-law.md)
- Current focus inside this lane:
  bounded repeated routing through canonical `publicStart(...)`, preserved
  dispatch-required and human-gate-required seams as explicit public control
  truth, package export stability, and no direct event append above completed
  public-start/runtime law

### t013-m04-control-negative.test.mjs

- Status: transitional slice-gating proof retained as `T-013` fail-closed evidence
- Module alignment: `M04-app-bootstrap`
- Requirements: `REQ-P-POLICY`, `REQ-P-POLICY-009`, `REQ-P-POLICY-011`, `REQ-P-POLICY-012`, `REQ-P-POLICY-013`
- Design: [TYPESCRIPT_REALIZATION_GUARDRAILS.md](../design/TYPESCRIPT_REALIZATION_GUARDRAILS.md), [M04_CONTROL_LOOP_DERIVATION.md](../design/M04_CONTROL_LOOP_DERIVATION.md), [M04_CONTROL_LOOP_FIRST_SLICE_IACS.md](../design/M04_CONTROL_LOOP_FIRST_SLICE_IACS.md), [M04_CONTROL_LOOP_STRUCTURAL_CARRIER_DIAGRAM.md](../design/M04_CONTROL_LOOP_STRUCTURAL_CARRIER_DIAGRAM.md), [TYPESCRIPT_STRICT_LANE.md](../design/TYPESCRIPT_STRICT_LANE.md), [T-013-realize-typescript-m04-control-modes-over-closed-public-start-outcome-law.md](../../../.ai-workspace/tickets/completed/T-013-realize-typescript-m04-control-modes-over-closed-public-start-outcome-law.md)

### t014-lookup-authority-negative.test.mjs

- Status: transitional slice-gating proof retained as completed `T-014` fail-closed evidence
- Module alignment: `M02-work-publication` -> `M03-engine-kernel`
- Requirements: `REQ-L-GTL3-MODULE`, `REQ-L-GTL3-JOB`, `REQ-L-GTL3-GRAPHFUNCTION`, `REQ-R-ABG3-INTERPRET`, `REQ-R-ABG3-RUN`
- Design: [TYPESCRIPT_REALIZATION_GUARDRAILS.md](../design/TYPESCRIPT_REALIZATION_GUARDRAILS.md), [M02_M03_LOOKUP_AUTHORITY_DERIVATION.md](../design/M02_M03_LOOKUP_AUTHORITY_DERIVATION.md), [M02_M03_LOOKUP_AUTHORITY_IACS.md](../design/M02_M03_LOOKUP_AUTHORITY_IACS.md), [M02_M03_LOOKUP_AUTHORITY_STRUCTURAL_CARRIER_DIAGRAM.md](../design/M02_M03_LOOKUP_AUTHORITY_STRUCTURAL_CARRIER_DIAGRAM.md), [TYPESCRIPT_STRICT_LANE.md](../design/TYPESCRIPT_STRICT_LANE.md), [T-014-reprice-typescript-m02-publication-lookup-and-m03-execution-resolution-under-explicit-lookup-authority.md](../../../.ai-workspace/tickets/completed/T-014-reprice-typescript-m02-publication-lookup-and-m03-execution-resolution-under-explicit-lookup-authority.md)
