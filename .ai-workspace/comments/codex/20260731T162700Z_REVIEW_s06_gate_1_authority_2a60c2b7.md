# Review — S06 Gate 1 Authority At 2a60c2b7

Date: 2026-07-31T16:27:00Z

Reviewer role: independent cold authority reviewer

Subject commit: `2a60c2b704ce431804f26238ea0dd0718a4c456a`

Subject tree: `fc19ebdf0766050e53b6bc673a4c761ff6ad77c4`

## Verdict

One bounded counterexample. The subject does not pass unchanged.

## Finding

High — AX-F09 omits the constitutionally required full retry frontier.

`REQ-R-ABG3-PROJECTION-009` requires retry projection to preserve every prior
attempt's identity, reason class, owner surface, source event kind, and attempt
coverage. The candidate selects one progress event and joins only its single
source attempt, C call, and judgment. Its exact `ExecutableRetryInput` contains
no prior-attempt frontier. Current `RetryProgressAdmission` carries only prior
attempt numbers, not their reason, owner, or event-kind truth. The two-attempt
AX-F09 oracle cannot expose the omission because only one failed attempt
precedes the resumed attempt.

This violates T-281 `CL-05`: scoped Event Calculus truth must determine retry
input without losing the admitted retry frontier.

Evidence:

- `specification/requirements/abg/REQ-R-ABG3-PROJECTION.md`, criterion `-009`;
- `build_tenants/abiogenesis/typescript/design/
  M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md`,
  Section 7.3 at the subject commit;
- `build_tenants/abiogenesis/typescript/code/src/abg/retry.ts`, current
  `RetryProgressAdmission` and `admitRetryProgress`; and
- the subject's AX-F09 two-attempt oracle.

The reviewer made no file, index, or commit change.
