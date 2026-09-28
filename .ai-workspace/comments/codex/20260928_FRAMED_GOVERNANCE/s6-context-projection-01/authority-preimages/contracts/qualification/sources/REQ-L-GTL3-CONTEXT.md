# REQ-L-GTL3-CONTEXT — Externally Located Constraint Dimensions

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](stdo://releases/v2.5.0-rc.6/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ODD_METHOD.md](stdo://releases/v2.5.0-rc.6/standards/ODD_METHOD.md), [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define `Context` as the language-owned, snapshot-bound constraint surface of
GTL 3.

## Acceptance Criteria

**REQ-L-GTL3-CONTEXT-001**: `Context` shall be a first-class GTL declaration type.

**REQ-L-GTL3-CONTEXT-002**: A context shall bind at minimum `name`, `locator`, and `digest`.

**REQ-L-GTL3-CONTEXT-003**: `Context` shall represent an externally located, snapshot-bound constraint dimension carried by graph structure.

**REQ-L-GTL3-CONTEXT-004**: `Context` remains language-owned declaration truth, not an engine-owned event or runtime fact.

**REQ-L-GTL3-CONTEXT-005**: GTL publication and interpretation surfaces shall preserve context locator and digest truth without semantic loss.

**REQ-L-GTL3-CONTEXT-006**: Engines may load, validate, or project declared contexts, but they shall not invent or mutate the declared context contract.

**REQ-L-GTL3-CONTEXT-007**: A workspace observed by an ABG executive observer
shall be declared as context locator and digest truth. The observer may consume
that declared context through ABG projection, but it shall not replace it with
a product-local workspace handle, prompt-only locator, or mutable controller
state.

**REQ-L-GTL3-CONTEXT-008**: An STDO-governed Program shall explicitly select a
reusable GTL-declared environment and its snapshot-bound Context data. The
declaration shall identify the exact immutable STDO release and content basis,
matching axiomatic program and index, released corpus-access implementation,
required access selections, and role-specific frame and instruction-policy
references. Publication, raw admission and interpretation shall preserve these
relations. A mutable selector, ambient install or instruction text shall not
substitute for the declaration. Programs that do not adopt this environment
shall not acquire an STDO requirement implicitly. Environment declaration
truth grants neither access permission nor runtime admission.
