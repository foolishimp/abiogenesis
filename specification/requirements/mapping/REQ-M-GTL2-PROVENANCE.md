# REQ-M-GTL2-PROVENANCE — Mapping Provenance

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-03-24
**Derives from**: INT-GTL2-010
**Supersedes**: (new layer)
**Wave**: 2

---

## Purpose

When GTL programs are mapped onto an engine, provenance records which engine, version, and capability profile was used.

## Acceptance Criteria

**REQ-M-GTL2-PROVENANCE-001**: Engine mapping provenance shall record: engine identity, engine version, capability profile used, any capability gaps.

**REQ-M-GTL2-PROVENANCE-002**: Events emitted under a mapping shall carry engine provenance so replay can determine which engine surface produced which truth.
