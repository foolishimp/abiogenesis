# REQ-L-GTL3-COMPOSE — Lawful Composition

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [/Users/jim/src/apps/genesis_sdlc/specification/standards/SPEC_METHOD.md](/Users/jim/src/apps/genesis_sdlc/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [GTL_3_CONSTITUTIONAL_DESIGN.md](../../GTL_3_CONSTITUTIONAL_DESIGN.md)

---

## Purpose

Define lawful graph-function composition in GTL 3.

## Acceptance Criteria

**REQ-L-GTL3-COMPOSE-001**: `compose(f, g)` shall compose two graph functions when the outputs of `f` satisfy the inputs of `g`. The result is a new graph function with `inputs = f.inputs` and `outputs = g.outputs`.

**REQ-L-GTL3-COMPOSE-002**: Composition shall be associative as a semantic law.

**REQ-L-GTL3-COMPOSE-003**: An identity graph function shall exist that preserves the interface under left and right composition.

**REQ-L-GTL3-COMPOSE-004**: Composed graph functions shall remain replayable. Composition structure and resulting truth shall be reconstructable from declarations plus runtime truth.

**REQ-L-GTL3-COMPOSE-005**: Composition shall propagate and deterministically merge composition-visible metadata such as `effects`, `tags`, and structured declarations.

**REQ-L-GTL3-COMPOSE-006**: Structured declaration merge shall fail closed on conflicting values rather than silently inventing composition semantics.
