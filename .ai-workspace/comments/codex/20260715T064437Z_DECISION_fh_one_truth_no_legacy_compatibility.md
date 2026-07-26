# F_H One-Truth Migration Decision

**Date**: 2026-07-15
**Authority**: F_H, direct product-owner ruling
**Ticket**: T-272

## Ruling

ABIogenesis 5.0 does not retain backward compatibility for the legacy
`fh_escalated` event or `fh_escalation` transition. The product owner ruled:

> I don't need backwards compatibility, explicitly don't want it.

> STDO defines one truth.

The only active F_H lifecycle is an engine-held C-program receipt opening
`fh_interaction_opened`, followed by admitted response, resume, successor
receipt, and ordinary interpreter continuation.

Historical logs containing the retired family require migration before ABG
5.0 admission. Runtime unions, producers, admission, projection, tests, and
public schemas must not retain a compatibility branch.

## Scope

This ruling authorizes the bounded T-272 hard migration and the corresponding
design correction. It does not authorize a second F_H controller or a new
receipt, continuation, execution-basis, or event family.
