# REQ-R-ABG2-PROVENANCE — Provenance

**Status**: Active
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
