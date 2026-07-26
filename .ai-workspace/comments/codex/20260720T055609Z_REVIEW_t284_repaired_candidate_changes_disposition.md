# REVIEW: T-284 Repaired-Candidate Changes Disposition

**Author**: codex
**Observed at**: 2026-07-20T05:56:09Z
**Ticket**: T-284
**Status**: bounded repair in progress; prior candidate invalidated; M3 blocked

## Review Set

Two independent reviews reproduced candidate `4ac6617c`, accepted the
zero-inherited successor direction, and found no blocking defect. A third
review reproduced the same identities but identified six concrete no-silence
and authority defects. The positive reviews establish that the migration
direction and candidate basis are real; they do not override falsifying
findings in the exact subject.

Candidate `4ac6617c` is therefore retained as superseded review evidence. It is
not accepted for M2 closure.

## Findings And Dispositions

| Finding | Evaluation | Bounded disposition |
|---|---|---|
| final-integration planning commit `d4db5a93` lacked a semantic disposition | Accepted | Add a dedicated archive-only final-integration row. Accepted T-283 Product/Goals and the current held T-282 disposition supersede it; no bytes enter the successor. |
| X catch-all was not reproducibly decidable and omitted saga-frontier source | Accepted | Bind ordered first-match predicates over all 1,935 frozen tenant paths, record counts and a membership digest, add saga-frontier as an explicit mixed-semantics carrier, and move the refusal catch-all to `XC41`. |
| `start` applied One Surface to direct root mode | Accepted | Apply One Surface only to the supervised standard-system program. Direct start traverses one admitted entry without `evaluateNext` or `ConstructionIntent`. |
| validator, HoG, implementation, and ABG verbs remained blurred | Accepted | Restore the exact owner chain: GTL declares topology and scope; validator checks static relations; HoG traverses; selected implementation bindings realize leaf effects; ABG admits runtime truth. |
| ABG or evaluator functions still appeared to select/admit scheduler and action truth | Accepted | Transition/evaluator outputs are candidates. ABG admits or rejects them; HoG applies admitted transitions. ABG does not choose routes, and `evalGap`/`evaluateNext` do not admit their own outputs. |
| ticket category, migration value, and RC5 admission order were not method-admissible | Accepted | Make T-284 an `ordinary` analysis/requirement-reprice ticket that selects `fundamental_re_adoption`; reserve `implementation_migration` for the later realization carrier. Add `change_intent`, exact donor basis, explicit D1-D6 stages, exact method classes, and per-row RC5 admission order. |

The accepting reviews' vocabulary concern is incorporated by replacing the
ambiguous leaf-effect use of `host` with `selected implementation binding`.
Their request to define D1-D6 is incorporated in the vector. Their note that
M2 acceptance contains the correction vector, zero-inherited construction
base, and requirement reprice remains correct and must be explicit in the
eventual F_H closure receipt.

## Boundary

These changes do not alter accepted Intent, Product semantics, the 17 Product
outcomes, seven scenarios, `ABI5-ROOT-001`, or the fresh zero-inherited
construction-base decision. They repair requirements and exact migration
evidence only.

No runtime, test, generated, package, qualification, release, or M3 design
change is authorized. The replacement subject must be refrozen and reviewed
independently before T-284 or M2 may close.
