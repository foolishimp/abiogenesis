# REQ-L-GTL3-GRAPHFUNCTION-REFINEMENT - Zoom, Foldback, And Type Wiring

**Status**: Active - accepted by T-283 F_H closure
**Category**: Capability / Constraint
**Date**: 2026-07-11
**Derives from**: [PRODUCT.md](../../PRODUCT.md), [REQ-L-GTL3-CONTRACT-LAW-API.md](./REQ-L-GTL3-CONTRACT-LAW-API.md), [REQ-L-GTL3-RECURSE.md](./REQ-L-GTL3-RECURSE.md), [REQ-L-GTL3-NODE.md](./REQ-L-GTL3-NODE.md)

---

## Purpose

Define the published GraphFunction refinement declarations that close the
language boundary for zoom, recursive foldback, and typed composition. These
are GTL program laws. HoG traverses their admitted structure and ABG admits
their runtime consequences; neither invents their structural meaning.

## Acceptance Criteria

**REQ-L-GTL3-GRAPHFUNCTION-REFINEMENT-001**: GraphFunction zoom shall be a
planned substitution of one admitted refinement GraphFunction into one exact
GraphVector of an admitted parent GraphFunction. The selected vector shall be
grounded by at least one declared `RefinementBoundary`, `CandidateFamily`, or
published traversal-target reference. Zero or multiple matches shall fail
admission or construction; names, ordinals, or ambient runtime state shall not
select the target.

**REQ-L-GTL3-GRAPHFUNCTION-REFINEMENT-002**: A zoom plan shall bind the parent
GraphFunction and graph identities, target GraphVector identity and interface,
refinement GraphFunction and graph identities, substituted graph identity, and
all selecting authority references. Application shall reject drift in any
bound identity. The resulting GraphFunction shall preserve the parent's
declared input and output interface and publish the plan as declaration data.

**REQ-L-GTL3-GRAPHFUNCTION-REFINEMENT-003**: Recursive GraphFunction foldback
shall declare `rebind` mode, one non-empty binding, and mandatory parent
re-evaluation. Child completion supplies rebind input; it shall not certify the
parent or bypass its evaluator. Additional foldback attributes are inert
declaration data unless admitted by an owning requirement.

**REQ-L-GTL3-GRAPHFUNCTION-REFINEMENT-004**: Typed GraphFunction composition
shall name a left provided/carry node, a right required node, and one published
node-type declaration reference for every wiring. Both nodes shall satisfy that
same node type without weakening schema, Markov, or asset-surface law. Missing
nodes, unknown or non-node-type declaration references, incompatible
contracts, or an empty wiring set shall fail before composition.

**REQ-L-GTL3-GRAPHFUNCTION-REFINEMENT-005**: Successful typed wiring shall
produce ordinary GraphFunction composition after replacing only the declared
right-side requirement with the satisfying left-side carried node. It shall
not introduce implicit coercion, a rival edge, a runtime router, or a second
type system.

**REQ-L-GTL3-GRAPHFUNCTION-REFINEMENT-006**: Published host tenants shall expose
typed interfaces for zoom plans, foldback declarations, and type wiring, plus
raw admission and semantic diagnostics for serialized declarations. Native
type matching shall carry all constraints it can express; malformed or
unresolved serialized GTL shall fail at admission or GTL validation before
HoG traversal.

## Boundary

GTL owns the structural declarations and pure construction result. HoG owns
direct traversal of the admitted GTL structure. ABG owns runtime frames,
lineage, foldback and parent-result admission, events, replay, and closure.
Product-local dispatch or vector classification is not part of this
capability.
