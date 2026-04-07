# REQ-M-GTL3-PROVENANCE — Mapping Provenance

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-04-05
**Derives from**: INT-006
**Wave**: 3

---

## Purpose

When GTL programs are mapped onto an engine, provenance records which engine, version, and capability profile was used.

## Acceptance Criteria

**REQ-M-GTL3-PROVENANCE-001**: Engine mapping provenance shall record: engine identity, engine version, capability profile used, any capability gaps.

**REQ-M-GTL3-PROVENANCE-002**: Events emitted under a mapping shall carry engine provenance so replay can determine which engine surface produced which truth.

**REQ-M-GTL3-PROVENANCE-003**: When a published graph function is materialized for engine execution, mapping provenance shall record the graph-function identity plus the declared inputs, profiles, or capability-visible parameters used for that materialization.

**REQ-M-GTL3-PROVENANCE-004**: When a graph-derived companion bundle such as a selected subgraph or evaluator bundle is produced for engine execution, mapping provenance shall preserve its derivation back to the graph-function materialization that produced it.

**REQ-M-GTL3-PROVENANCE-005**: When GTL node declarations include `asset_surface`, mapping provenance shall preserve the declared target and carried asset-surface contracts surfaced into bind-time manifests or runtime execution packets so downstream replay can determine which typed asset contract governed production.

**REQ-M-GTL3-PROVENANCE-006**: When ABG merges vector-source required bindings with target `asset_surface.required_contexts` to form the effective executable boundary for one invocation, mapping provenance shall preserve that merge as invocation-local runtime truth, including enough distinction to tell which required bindings came from the vector source and which came from the asset-surface declaration.
