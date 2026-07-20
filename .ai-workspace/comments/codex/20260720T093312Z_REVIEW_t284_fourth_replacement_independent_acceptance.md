# REVIEW: T-284 Fourth Replacement Independent Acceptance

**Date**: 2026-07-20 09:33:12 UTC
**Ticket**: T-284
**Review subject**: `6f2d3415cf1b453ad37d098e5be66fdd658ffc00`
**Freeze evidence**: `230aba95793599b03ac188799cacb09be90e59ab`
**Reviewer**: decorrelated read-only Codex review agent
**Verdict**: **ACCEPT**

## Findings

No P0, P1, or P2 findings remain in the exact review subject.

## Authority Review

1. `REQ-P-POLICY-054` assigns static declared-program membership and
   GraphFunction contract validation to the non-lowering GTL validator. ABG
   consumes the typed result and admits concrete runtime inputs, catalog
   eligibility, bindings, policy, capability, and invocation authority. It is
   explicitly prohibited from recomputing static GTL judgment.
2. `FPC-011` makes F_D ambiguity evidence candidate-only. `FPC-011A` through
   `FPC-011D` reserve evidence admission and derived routing or replay truth to
   ABG.
3. `FPC-011E` makes both `EdgeFulfillmentLedger` and
   `EdgeClosureDecision` candidate outputs of `evaluateAction`. Only ABG
   admission establishes runtime action-evaluation or closure truth.
4. No adjacent Product or requirement owner assignment contradicted those
   boundaries in the targeted authority census.
5. T-284 truthfully remained active, frozen, and review-pending. M2 remained
   open and M3 remained blocked throughout the review.

## Independent Reproduction

| Check | Reproduced result |
|---|---|
| candidate tree | `e0fcb69f6efcbaffb1593fd735ec2b14725128f4` |
| accepted T-283 subject | 80 files; `c85ca7ae34352b91d579fcfae035ca3aa3d9a27428b584ac81c425b0d837d260` |
| current constitutional subject | 86 files; `f2a4c6970f6240ef52bdb04693a38b8430fe29027a2f8f10ed5c9f70ba32b72a` |
| nine-requirement aggregate | `c0dcdc264db854f5a4d4f429a35a96e8bd8b4f9481a05cdf532cdfee60722473` |
| correction vector | `048a9fbca17736a544b4f3af9aabdbdf00a13ce41dd003d8cb29a015556466f4` |
| X partition | 1,935 paths; 49 inhabited families; `9516301aa51dc0a41f832847d17268106c046d93a8a9f4a78c56991ba5b929f1` |
| duplicate requirement IDs | none across 1,278 definitions |
| whitespace checks | pass |

The delta from invalidated candidate `e78bde9e` to `6f2d3415` is exactly seven
paths: four commentary records, T-284, and the two repaired requirement files.
No Product, Intent, Goal, scenario, M3 design, runtime, test, package,
generated, qualification, or release path entered the candidate or freeze cut.

## Residual Risk

This verdict accepts the constitutional exact cut only. M3 design and runtime
realization must still prove these ownership boundaries on the executable
path. The review reproduced the unchanged correction-vector and X-partition
identities but did not re-adjudicate every donor row's semantic disposition.
