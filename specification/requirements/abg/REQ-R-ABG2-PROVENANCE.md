# REQ-R-ABG2-PROVENANCE — Provenance

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-03-24
**Derives from**: INT-GTL2-010
**Supersedes**: REQ-F-PROV (subsumed)
**Wave**: 1

---

## Purpose

ABG preserves spec, workflow, version, and selection provenance over graph interpretation.

## Acceptance Criteria

**REQ-R-ABG2-PROVENANCE-001**: Events shall carry provenance: spec_hash, workflow_version, selection rationale where applicable.

**REQ-R-ABG2-PROVENANCE-002**: Substitution provenance shall record which contract was refined, by which inner graph.

**REQ-R-ABG2-PROVENANCE-003**: Selection provenance shall record which candidate was chosen, by which mechanism (F_D/F_P/F_H/business), with rationale.

**REQ-R-ABG2-PROVENANCE-004**: Module/library provenance shall track imported graph functions to their source module.

**REQ-R-ABG2-PROVENANCE-005**: Evaluation provenance shall record per-evaluator identity, regime, and outcome when one evaluator or an evaluator set is applied to a contract boundary, plus any aggregate convergence or gate decision derived from that set.

**REQ-R-ABG2-PROVENANCE-006**: When evaluation or harvest occurs over explicit rounds, candidate sets, or worker/evaluator sets, provenance shall preserve the round identity and the relevant set references needed for replay and audit.

**REQ-R-ABG2-PROVENANCE-007**: When a named structural profile or harvest/merge alternative is selected for a contract boundary, provenance shall record the declared profile/alternative identity, the selecting mechanism, and any rationale supplied by the active evaluator or external selector.

**REQ-R-ABG2-PROVENANCE-008**: When execution or convergence operates on a graph materialized from a published graph function, provenance shall record the graph-function identity and the materialization identity or equivalent declared input/profile references needed for replay.

**REQ-R-ABG2-PROVENANCE-009**: When ABG executes or evaluates a graph-derived companion bundle such as a selected subgraph or evaluator bundle, provenance shall preserve the derivation chain back to the graph-function materialization that produced that bundle. For evaluator bundles, provenance shall also preserve the refined or realized boundary that justified the deterministic evaluator set.

**REQ-R-ABG2-PROVENANCE-010**: Runtime identity provenance shall preserve canonical structured runtime identity (`engine_id`, `worker_id`, `backend_id`, `authority_ref`, `assignment_source`, `resolved_runtime_ref`) independently of reporting metadata. `build_id` is optional declared reporting metadata and shall not be synthesized from `worker_id` or `engine_id`.
