# F_H Decision - Accept T-255 Corrected Design

## Ruling

F_H explicitly accepted the corrected T-255 design on 2026-07-13 with:

> approved continue

This accepts the design reviewed at
`.ai-workspace/comments/codex/20260713T053506Z_SELF_REVIEW_t255_round2_authority_correction.md`
and admits bounded implementation. It does not accept the provisional prototype
or waive implementation proof.

## Accepted Boundary

- M04 admits the canonical `abg.schema.tenant-conformance-manifest` before M03.
- M03 receives only the admitted manifest carrier or explicit absence.
- M03 derives a basis-preserving, non-admittable capability-coverage projection.
- Missing or incompatible manifest coverage blocks effect-bearing publication.
- T-255 may publish an exact handoff but every published handoff remains
  startup-blocked before traversal or effects until T-267 closes the
  `TraversalUnit`.
- T-268 publishes ABG 5.0 tenant-conformance-manifest coverage including
  Consensus.

## Implementation Admission

Implementation may now replace the provisional T-255 files within the accepted
carrier and module boundaries. Closure still requires focused and clean full
proof, packed-surface verification, body immutability, and independent
self-review. T-267 and T-268 remain separate authorities.
