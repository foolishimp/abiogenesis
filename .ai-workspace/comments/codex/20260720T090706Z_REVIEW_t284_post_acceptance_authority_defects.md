# REVIEW: T-284 Post-Acceptance Authority Defects

**Source**: external review supplied by the Product owner
**Persisted by**: codex pen-holder
**Reviewed state**: candidate `e78bde9e`, evidence HEAD `5dbcc758`
**Review time**: 2026-07-20T09:07:06Z
**Verdict**: request changes; prior independent acceptance invalidated

## Confirmed Findings

1. `REQ-P-POLICY-054` assigns static program-membership and GraphFunction
   contract judgment to ABG. Product and GTL requirement authority assign those
   static relations to the non-lowering GTL validator. ABG may consume that
   judgment and admit concrete runtime input, catalog, binding, policy,
   capability, and invocation authority; it may not recompute static GTL law.
2. `REQ-R-ABG3-FPC-011` lets F_D admit ambiguity evidence. F_D may emit
   candidate evidence only; ABG owns evidence admission.
3. `REQ-R-ABG3-FPC-011E` lets `evaluateAction` emit an already-closed
   `EdgeClosureDecision`. `evaluateAction` is a semantic evaluator and must emit
   candidate ledger and closure outputs; ABG alone admits closure truth.
4. T-284's `constitutional_refreeze` field still says review is pending despite
   the candidate having been reviewed and then falsified. The field must mark
   the subject invalid and require a bounded requirement refreeze.

## Verified Unaffected Claims

The review reproduced exact hashes, the 1,935-path/49-family partition, donor
dispositions, S06 ordering, clean synchronized branch, and the absence of M3 or
runtime work. Those claims remain valid but cannot close M2 while the authority
defects remain.

## Disposition

This is a bounded requirement repair inside T-284. Product and Intent remain
stable. The affected constitutional subject must be refrozen, independently
reviewed, and separately accepted before M2 closes or M3 begins.
