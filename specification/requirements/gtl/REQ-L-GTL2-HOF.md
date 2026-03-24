# REQ-L-GTL2-HOF — Higher-Order Graph Operations

**Status**: Active
**Date**: 2026-03-24
**Derives from**: INT-GTL2-006
**Supersedes**: (new capability)
**Wave**: 2

---

## Purpose

GTL 2.x supports higher-order graph programming: fan-out, fan-in, gating, and promotion.

## Acceptance Criteria

**REQ-L-GTL2-HOF-001**: `fan_out(f)` shall apply a graph function across a collection/vector, materializing branching execution structure.

**REQ-L-GTL2-HOF-002**: `fan_in(r)` shall reduce branch outputs into one synthesized result.

**REQ-L-GTL2-HOF-003**: `gate(g)` shall require a gate before continuation or promotion. Consensus belongs here. Gate applies rules and/or evaluators to control flow.

**REQ-L-GTL2-HOF-004**: `promote(p)` shall lift one representation into another (event to vector, vector to branches, branch outputs to synthesized context).

**REQ-L-GTL2-HOF-005**: All higher-order operations shall preserve interface/type truth.
