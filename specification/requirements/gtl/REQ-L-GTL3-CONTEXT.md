# REQ-L-GTL3-CONTEXT — Externally Located Constraint Dimensions

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Updated**: 2026-09-28
**Derives from**: [SPEC_METHOD.md](stdo://releases/v2.5.1-rc.1/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001/INT-008, [ODD_METHOD.md](stdo://releases/v2.5.1-rc.1/standards/ODD_METHOD.md), [Product calculus](../../PRODUCT.md#graph-composition-and-reference-frames)

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

**REQ-L-GTL3-CONTEXT-007**: Workspace evidence consumed by a governance graph
shall identify its declared workspace subject and immutable observation basis.
Context locator/digest truth binds the observed material, not a claim that the
mutable workspace is immutable. An admitted historical observation shall not
establish current workspace state without applicable support. A prompt-only
locator or private workspace handle shall not replace the declared relation.

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

**REQ-L-GTL3-CONTEXT-009**: A framed call shall explicitly bind a reusable
evaluation/work contract through existing Context, contract and policy
declarations selected by its graph composition. The binding shall preserve the
owning frame definition, exact subject/basis, required observations, criteria,
authority, evidence, result relation and invalidation conditions. A rendered
prompt shall remain a projection of that binding. A role name, overlay row or
runtime Frame identity alone shall not establish it.

**REQ-L-GTL3-CONTEXT-010**: Frame selection shall be declared or follow a prior
admitted selection under Program policy. Acquisition of missing observations
shall be declared work. Unknown applicability, missing required evidence,
out-of-frame material and invalid basis shall remain explicit dispositions;
context assembly shall not infer an evaluation pass or silently omit an
applicable required evaluation.

**REQ-L-GTL3-CONTEXT-011**: Multiple frames shall preserve their separate
definitions, evidence and authority. Any relied-upon refinement, translation,
conjunction or dependency shall be explicit. Graph nesting shall not establish
frame hierarchy, authority precedence or evaluation sufficiency by itself.

**REQ-L-GTL3-CONTEXT-012**: A material frame, subject or observation change
shall invalidate dependent evaluation support before reuse while preserving
unaffected support. Selection shall use sufficient bounded material and current
admitted projections under the Product reuse law; a role handoff alone shall
not require full-history reconstruction or full-workspace scanning.
