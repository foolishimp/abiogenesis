# Delegated F_H Decision: Accept T-261 Design

**Date**: 2026-07-13
**Ticket**: `T-261`
**Decision**: accepted; implementation authorized

The user delegated F_H authority to continue through bounded sections while
away, with self-review and proportional remediation between sections. Under
that authority, the T-261 three-view design is accepted after the review
recorded in
`20260713T192400Z_SELF_REVIEW_t261_c_retry_design.md`.

Implementation is authorized only for the accepted boundary:

- one direct root `C.retry` around one direct `C.of` leaf;
- the authored positive budget is maximum invoking attempts including the
  first;
- replay derives attempt ordinal, prior failure, and budget consumption at one
  exact C-call locus;
- `RETRYABLE_RUNTIME_FAILURE_CLASS_VALUES` remains the sole allowlist home;
- semantic disagreement, held work, nonallowlisted failure, exhausted budget,
  and stationary failure never retry;
- ABG prepares attempt identity before dispatch and event admission owns truth;
- graph-level workspace, prompt, manifest, and continuation repair remains in
  the existing retry-repair authority; and
- T-262, T-267, and T-268 remain separate, with canonical effects still
  startup-blocked.
