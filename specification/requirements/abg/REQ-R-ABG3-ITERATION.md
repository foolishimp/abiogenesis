# REQ-R-ABG3-ITERATION — Iteration Outcome Algebra

**Status**: Active - accepted by T-283 F_H closure
**Category**: Constraint / Guarantee
**Date**: 2026-07-11
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define one ABG-owned replay-derived outcome algebra for an active iteration
boundary.

The iteration outcome algebra is the single runtime truth surface that chooses
whether the active boundary terminates, redispatches, or suspends. Requirement,
design, and realization must keep semantic satisfaction facts, runtime facts,
authority/evidence facts, and attempt lineage orthogonal until the total fold
selects the outcome.

## Acceptance Criteria

**REQ-R-ABG3-ITERATION-001**: ABG shall derive one active-boundary iteration outcome projection from admitted replay truth.

**REQ-R-ABG3-ITERATION-002**: Evaluator outputs shall contribute semantic satisfaction rows only. They shall not emit runtime, transport, liveness, or evidence-lifecycle authority.

**REQ-R-ABG3-ITERATION-003**: ABG shall derive evidence lifecycle as active, preserved/rebased, or superseded before evidence participates in a closure satisfaction fold. Orphan evidence shall be represented as a failed current-authority binding guard, not as a lifecycle or evaluator category.

**REQ-R-ABG3-ITERATION-004**: ABG shall derive the next iteration outcome from one total priority fold over typed rows. Terminal fallback shall not outrank typed row state and shall not redispatch an active boundary whose current active or preserved/rebased rows already converge or defer.

**REQ-R-ABG3-ITERATION-005**: Every non-close outcome projection shall expose the category, lifecycle, provenance, and failed binding facts needed for replay-visible diagnosis.

**REQ-R-ABG3-ITERATION-006**: Evaluator retry, when allowed by policy, shall be a first-class redispatch target of the same iteration algebra. It shall be distinct from product-worker same-edge redispatch and shall fold to terminate-blocked when its retry policy is exhausted or when the evaluator failure is non-retryable.

**REQ-R-ABG3-ITERATION-007**: Reports, summaries, pressure refs, terminal fallback refs, plugin outcomes, and runner branches may provide source facts or read models for iteration state, but they shall not become rival next-transition truth surfaces.

**REQ-R-ABG3-ITERATION-008**: The public iteration outcome carrier shall expose only primitive outcome constructors: terminate, redispatch, or suspend. Named cases such as close, block, defer, retry, evaluator retry, graph re-entry, and reprice shall be represented as dispositions, redispatch targets, lawful re-entry refs, or reasons over those constructors.

**REQ-R-ABG3-ITERATION-009**: Redispatch targets shall reuse existing `GraphReentryPoint` and target-vector identity. `GraphChangeClass` remains provenance/classification for why that surface was selected; it shall not become a parallel redispatch discriminator.

**REQ-R-ABG3-ITERATION-010**: The total fold shall declare an explicit precedence order for mixed rows. Convergence shall be selected only when no blocking, constitutional re-entry, redispatch, or suspend row remains.

**REQ-R-ABG3-ITERATION-011**: Preserved/rebased evidence shall remain eligible to satisfy current closure only when its authority binding is still current after re-entry. Evidence invalidated by the re-entry scope shall become superseded, and evidence with no lawful current binding shall surface through the binding guard.

**REQ-R-ABG3-ITERATION-012**: Suspend shall be derived from runtime rows such as progressing, awaiting observer, or handoff. Suspend shall not be inferred from semantic satisfaction rows.

**REQ-R-ABG3-ITERATION-013**: The iteration-boundary transition path shall carry exactly one outcome projection. Every consumer shall derive next-transition truth from the one outcome projection or from source-row projection; no adapter, wrapper, or intermediate outcome surface shall stand between them.

**REQ-R-ABG3-ITERATION-014**: A caller-provided close-eligible flag may only act as compact evidence that the current active or preserved/rebased satisfaction set is fully satisfied. It shall not converge a boundary when any current satisfaction row is unsatisfied, deferred, orphan-bound, or blocked by runtime facts.

**REQ-R-ABG3-ITERATION-015**: Iteration satisfaction, runtime, binding-guard, and redispatch target rows may carry an admitted evaluation scope ref subordinate to the current graph call, frame, graph function, graph vector, vector index, and selected composition. Scoped rows shall remain facts for the active graph-vector boundary; they shall not create a public GTL topology object or a second traversal target family.

**REQ-R-ABG3-ITERATION-016**: Scoped redispatch shall reuse the existing `redispatch` outcome constructor. Segment, dimension-cell, fold, or relation failures shall be represented as scope metadata on rows and redispatch targets, not as new iteration outcome constructors.

**REQ-R-ABG3-ITERATION-017**: A failed scoped row may redispatch only that admitted scope when the scope binding is current and sibling scoped evidence remains current. ABG shall preserve sibling scoped rows unless authority, input, correction, or re-entry lineage makes them stale, superseded, orphan-bound, or contradictory.

**REQ-R-ABG3-ITERATION-018**: Malformed, stale, mismatched, or topology-unbound evaluation scope refs shall fail closed as admission, binding-guard, stale-input, orphan, block, or re-entry truth. ABG shall not infer evaluation scope identity from prompt text, diagnostic strings, filenames, wall-clock completion order, or downstream product naming convention.

**REQ-R-ABG3-ITERATION-019**: The iteration outcome algebra shall recognize
executive-observer pressure facts as typed projection inputs for attenuation,
non-attenuating retry, local repair, nonlocal re-entry, reprice, block, or
close-candidate state. Exact same-pressure retry shall remain detectable as
`non_attenuating_retry` unless admitted evidence, scope narrowing, route
change, re-entry, reprice, block, or closure truth changes the pressure basis.
