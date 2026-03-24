# REQ-L-GTL2-COMPOSE — Lawful Composition

**Status**: Active
**Date**: 2026-03-24
**Derives from**: INT-GTL2-005
**Supersedes**: REQ-F-COMP (replaced)
**Wave**: 1

---

## Purpose

Composition is a native graph operation. Graph functions compose when interfaces align.

## Acceptance Criteria

**REQ-L-GTL2-COMPOSE-001**: `compose(f, g)` shall compose two graph functions when the outputs of `f` satisfy the inputs of `g`. The result is a new graph function with `inputs = f.inputs`, `outputs = g.outputs`.

**REQ-L-GTL2-COMPOSE-002**: Composition shall be associative — `compose(compose(f, g), h)` produces the same outer contract as `compose(f, compose(g, h))`.

**REQ-L-GTL2-COMPOSE-003**: An identity graph function shall exist that preserves the interface under composition.

**REQ-L-GTL2-COMPOSE-004**: Composed graphs shall be replayable — the composition structure and resulting truth must be reconstructable from graph declarations plus event history.
