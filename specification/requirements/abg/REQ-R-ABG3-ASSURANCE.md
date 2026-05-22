# REQ-R-ABG3-ASSURANCE — Total Assurance Projection

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-04-29
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md), [REQ-R-ABG3-EVENTS.md](REQ-R-ABG3-EVENTS.md), [REQ-R-ABG3-PROJECTION.md](REQ-R-ABG3-PROJECTION.md), [REQ-R-ABG3-CONVERGENCE.md](REQ-R-ABG3-CONVERGENCE.md), [REQ-R-ABG3-CORRECTION.md](REQ-R-ABG3-CORRECTION.md)

---

## Purpose

Define ABG-owned assurance as a total replay-derived projection and closure
fold over current authority, current input state, and admitted runtime events.

This requirement prevents premature closure. A bounded compute scope may not
close merely because a worker succeeded, tests passed, a report was written, an
archive has the expected shape, or no closure-register row exists.

## Scope

Assurance scope is invocation-local runtime truth inside the existing GTL edge
traversal boundary. It is projected over existing ABG aggregates such as
`GraphCall`, `Frame`, and `Continuation`.

`UnitOfCompute` is not introduced as a public aggregate by this requirement. A
future stable carrier with that name requires explicit design authority and may
not widen the product compute boundary without product reprice.

## Acceptance Criteria

**REQ-R-ABG3-ASSURANCE-001**: ABG shall provide a total assurance projection for closure-capable bounded compute inside the existing GTL edge-traversal runtime boundary.

**REQ-R-ABG3-ASSURANCE-002**: Assurance scope shall be derived from replay-visible runtime truth over `GraphCall`, `Frame`, `Continuation`, and their causal event identities rather than hidden controller memory.

**REQ-R-ABG3-ASSURANCE-003**: Assurance shall be computed from the current authority/input snapshot and the admitted event ledger for the scoped runtime boundary.

**REQ-R-ABG3-ASSURANCE-004**: The authority/input snapshot used for assurance shall have a deterministic digest or equivalent identity sufficient to compare current authority with the authority a prior closure projection was computed against.

**REQ-R-ABG3-ASSURANCE-005**: The assurance projection shall emit explicit rows for every relevant authority/evidence state. Unknown, absent, unreadable, or unclassified state shall not be treated as success.

**REQ-R-ABG3-ASSURANCE-006**: Assurance row status shall include at minimum `fulfilled`, `partial`, `missing`, `stale_input`, `authority_missing`, `orphan_evidence`, `contradictory_authority`, `contradictory_evidence`, `deferred`, and `event_ledger_invalid`.

**REQ-R-ABG3-ASSURANCE-007**: `fulfilled` shall mean current evidence is bound to current authority and input digest, satisfies the required proof shape, and is admitted inside the scoped runtime boundary.

**REQ-R-ABG3-ASSURANCE-008**: `partial` shall mean evidence exists but is trace-only, planned, shallow, incomplete, unbound to required proof shape, or otherwise insufficient for closure.

**REQ-R-ABG3-ASSURANCE-009**: `missing` shall mean required authority-bound evidence is absent from the admitted event/evidence projection.

**REQ-R-ABG3-ASSURANCE-010**: `stale_input` shall mean current authority or input digest differs from the digest a prior closure projection was computed against. Stale input shall invalidate the prior closure projection without erasing event history.

**REQ-R-ABG3-ASSURANCE-011**: `authority_missing` shall mean the scoped runtime boundary is closure-capable or release-capable but lacks current authority sufficient to decide fulfillment.

**REQ-R-ABG3-ASSURANCE-012**: `orphan_evidence` shall mean evidence exists without matching current authority or without lawful binding to the scoped runtime boundary. Orphan evidence shall not satisfy authority by default.

**REQ-R-ABG3-ASSURANCE-013**: `contradictory_authority` shall mean current authority conflicts with itself in a way that prevents deterministic assurance classification.

**REQ-R-ABG3-ASSURANCE-014**: `contradictory_evidence` shall mean admitted evidence conflicts with current authority or with other admitted evidence in a way that prevents closure.

**REQ-R-ABG3-ASSURANCE-015**: `deferred` shall mean deferral is explicitly admitted as runtime truth and the resolved closure/release policy permits qualified deferral for the scoped boundary.

**REQ-R-ABG3-ASSURANCE-016**: `event_ledger_invalid` shall mean the admitted event ledger is unreadable, inadmissible, non-deterministic, or otherwise insufficient for replay-derived assurance projection.

**REQ-R-ABG3-ASSURANCE-017**: ABG shall fold assurance rows into exactly one lawful closure decision: `close`, `retry`, `reprice`, `block`, or `qualified_defer`.

**REQ-R-ABG3-ASSURANCE-018**: ABG may emit `close` only when every required assurance row is `fulfilled` or release-lawfully `deferred`.

**REQ-R-ABG3-ASSURANCE-019**: ABG shall not infer closure from worker success, transport success, passing tests, generated report shape, archive presence, prompt-side self-assessment, or absence of a closure-register entry.

**REQ-R-ABG3-ASSURANCE-020**: ABG shall derive assurance projections deterministically from current authority and admitted event truth. Reports, dashboards, closure ledgers, and release summaries are read models over that projection, not rival truth stores.

**REQ-R-ABG3-ASSURANCE-021**: Plugins may provide authority snapshots, evidence adapters, ambiguity classifiers, closure policy providers, and gain-function adapters through typed contracts, but plugins shall not emit authoritative runtime events, select next graph vectors, or close assurance scopes.

**REQ-R-ABG3-ASSURANCE-022**: Downstream products own domain gain functions, evidence semantics, and product release interpretation. ABG owns whether the declared authority and admitted evidence are totally projected and not prematurely closed.

**REQ-R-ABG3-ASSURANCE-023**: A bad or incomplete downstream gain function remains downstream or method responsibility. ABG shall surface the resulting declared ambiguity but shall not silently repair domain meaning.

**REQ-R-ABG3-ASSURANCE-024**: Same-edge retry, correction, reopen, or authority/input change shall preserve prior events as evidence while requiring a fresh assurance projection over the current authority/input snapshot.

**REQ-R-ABG3-ASSURANCE-025**: Assurance rows and closure decisions shall preserve enough provenance to explain which authority, event facts, plugin outputs, and policy refs produced the decision.

**REQ-R-ABG3-ASSURANCE-026**: Subordinate work, including bounded leaf tasks, shall either project assurance within the parent runtime boundary or publish a declared subordinate assurance boundary that remains causally bound to the parent.

**REQ-R-ABG3-ASSURANCE-027**: For a modulated traversal attempt, assurance shall consume `TraversalAttemptEnvelope`, admitted `TraversalAttemptProgressRow` rows, `TraversalForcedReviewGate` truth, and existing foldback/non-progress/reentry projections. File presence, worker narrative, elapsed time, or unstated worker intent shall not satisfy closure or continuation evidence.

**REQ-R-ABG3-ASSURANCE-028**: ABG shall resolve a declared edge assurance contract before automated probabilistic closure is lawful. Resolution shall preserve source precedence, selected contract refs, and config identity as replay-visible truth.

**REQ-R-ABG3-ASSURANCE-029**: If no edge assurance contract is declared, ABG shall project an F_H-required absentia disposition. In absentia mode a human may declare closure, continuation, reprice, block, defer, or directly transform the mutable worksite, but ABG shall still admit the scoped judgment or observed state change before projection or routing.

**REQ-R-ABG3-ASSURANCE-030**: F_P evaluate output under an edge assurance contract shall enter assurance only as an admitted finding attached to a recorded hook action. ABG shall reject evaluation findings that contain runtime events, ledger writes, projections, selected vector choices, transitions, or closure authority.

**REQ-R-ABG3-ASSURANCE-031**: When an assurance scope is governed by an `abg.fn_composition` contract, ABG assurance projection and closure fold shall preserve the selected composition ref and digest. Assurance evidence shall not close a scope when it was admitted under a different, missing, stale, or malformed composition identity.

**REQ-R-ABG3-ASSURANCE-032**: Edge assurance contracts may contribute gain, residual pressure, continuation, and proposed close disposition only under the selected composition identity. The actual close/retry/reprice/block/defer decision remains the ABG assurance fold over admitted evidence and deterministic closure law.

**REQ-R-ABG3-ASSURANCE-033**: Human-required assurance states shall be represented as external `F_H` callout boundaries. A human-facing system may perform and return the work, but ABG shall only consume an admitted response event or carrier; no external human response directly mutates assurance projection, traversal transition, replay truth, or closure.
