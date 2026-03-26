# REQ-L-GTL2-COMPOSE — Lawful Composition

**Status**: Active
**Category**: Capability
**Date**: 2026-03-24
**Derives from**: INT-GTL2-005
**Supersedes**: REQ-F-COMP (replaced)
**Wave**: 1

---

## Purpose

Composition is a native graph-function operation. Graph functions compose lawfully when interfaces align.

## Acceptance Criteria

**REQ-L-GTL2-COMPOSE-001**: `compose(f, g)` shall compose two graph functions when the outputs of `f` satisfy the inputs of `g`. The result is a new graph function with `inputs = f.inputs`, `outputs = g.outputs`.

**REQ-L-GTL2-COMPOSE-002**: Composition shall be associative as a semantic law — `compose(compose(f, g), h)` and `compose(f, compose(g, h))` preserve the same outer contract and lawful composition truth.

**REQ-L-GTL2-COMPOSE-003**: An identity graph function shall exist that preserves the interface under left and right composition.

**REQ-L-GTL2-COMPOSE-004**: Composed graphs shall be replayable — the composition structure and resulting truth must be reconstructable from graph declarations plus event history.

**REQ-L-GTL2-COMPOSE-005**: Composition shall propagate declared effects and other composition-visible metadata in a deterministic, inspectable manner.
