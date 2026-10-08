# REQ-M-GTL3-MAPPING — Engine Mapping Contract

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Updated**: 2026-09-28
**Derives from**: INT-006/INT-008, [Product calculus](../../PRODUCT.md#framed-evaluation-and-graph-consequence)
**Wave**: 3

---

## Purpose

Define how GTL programs map onto engine surfaces. ABG is canonical; other engines are alternate targets.

## Acceptance Criteria

**REQ-M-GTL3-MAPPING-001**: GTL programs shall be mappable onto ABG as the canonical target engine surface.

**REQ-M-GTL3-MAPPING-002**: Other engines (Temporal, Prefect, Step Functions) may serve as alternate mapping targets with full, partial, or capability-profile mappings.

**REQ-M-GTL3-MAPPING-003**: The mapping layer shall preserve GTL semantics — engine-specific behavior shall not alter language-level truth.

**REQ-M-GTL3-MAPPING-004**: When GTL programs publish graph functions, canonical engine mapping shall define how those graph functions are materialized into executable graph surfaces before execution or evaluation binding.

**REQ-M-GTL3-MAPPING-005**: The mapping layer may expose graph-derived companion bundles, such as selected subgraphs or evaluator bundles, so long as those bundles remain traceable to the published graph-function and do not replace graph as language-level truth.

**REQ-M-GTL3-MAPPING-006**: When a refined or realized graph-function boundary declares deterministic proof surfaces, canonical engine mapping shall support derivation of the corresponding evaluator bundle from the same materialization/refinement truth used to realize that boundary.

**REQ-M-GTL3-MAPPING-007**: Authoring, publication, serialization and execution
bindings shall preserve the Product graph/frame calculus. For the same bound
observations and admitted evaluator outputs, they shall conserve permitted
graph choices, effects, refusals and completion conditions, including nested
calls and parent obligations. Structural validity shall not establish semantic
adequacy or identical repeated F_P judgments. Reference-frame meaning shall
remain with its owning definition; encoding shall not add a runtime controller
or deterministic interpretation of undeclared semantic policy.
