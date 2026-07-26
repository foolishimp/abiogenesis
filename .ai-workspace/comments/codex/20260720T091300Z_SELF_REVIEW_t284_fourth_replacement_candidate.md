# SELF REVIEW: T-284 Fourth Replacement Candidate

**Author**: codex
**Observed at**: 2026-07-20T09:13:00Z
**Ticket**: T-284
**Candidate**: `6f2d3415cf1b453ad37d098e5be66fdd658ffc00`
**Status**: bounded authority repair verified; independent review pending

## Scope

This candidate repairs the two constitutional authority defects found after
the independent acceptance of `e78bde9e` and corrects T-284's stale refreeze
state. Product, Intent, the correction vector, donor classification, migration
strategy, X partition, and implementation hold remain unchanged.

## Finding Replay

| Finding | Repair |
|---|---|
| `REQ-P-POLICY-054` assigned static membership and contract judgment to ABG | The non-lowering GTL validator now validates declared program membership and GraphFunction contract relations. ABG consumes that typed result and admits only the concrete input, current catalog eligibility, immutable binding, session policy/capability, and invocation authority. |
| `FPC-011` let F_D admit evidence | F_D emits candidate ambiguity evidence. ABG admits or rejects it before it becomes observation, pressure input, or runtime truth. |
| `FPC-011E` let `evaluateAction` create closure truth | `evaluateAction` emits candidate fulfillment and closure outputs. ABG admits or rejects them against intent, evidence, binding, GTL result/closure contracts, and policy before closure truth exists. |
| adjacent FPC wording retained the same authority leak | FPC-001/-008/-009/-011A/-011B/-011C now distinguish GTL-declared membership, candidate evidence/evaluation, ABG admission, and ABG-derived routing truth. |
| `constitutional_refreeze` remained stale | The falsified subject was marked invalid during repair and now identifies the new frozen candidate as independent-review pending. |

## Exact Checks

- candidate tree: `e0fcb69f6efcbaffb1593fd735ec2b14725128f4`;
- constitutional subject: 86 files, SHA-256
  `f2a4c6970f6240ef52bdb04693a38b8430fe29027a2f8f10ed5c9f70ba32b72a`;
- nine-requirement aggregate: SHA-256
  `c0dcdc264db854f5a4d4f429a35a96e8bd8b4f9481a05cdf532cdfee60722473`;
- `REQ-P-POLICY.md`: SHA-256
  `3b6dc0bad0b8a81f798ef3bc9438095b218dc30fa899e3c5b8138f1bd97766de`;
- `REQ-R-ABG3-FP-CONSCIOUSNESS.md`: SHA-256
  `397d9f838b7eeaac5c05f0e547897045aeb06beea6bd80f7a700432234ae29b7`;
- correction vector remains
  `048a9fbca17736a544b4f3af9aabdbdf00a13ce41dd003d8cb29a015556466f4`;
- X membership remains 1,935 paths across 49 inhabited families at
  `9516301aa51dc0a41f832847d17268106c046d93a8a9f4a78c56991ba5b929f1`;
- focused scans find no remaining ABG-owned static program-membership claim,
  F_D evidence-admission claim, or evaluator-created closure claim;
- requirement-definition duplicate scan is empty;
- `git diff --check` passes; and
- candidate `6f2d3415` changes no design, runtime, test, package, generated,
  qualification, release, or M3 path.

## Verdict

The confirmed authority defects are repaired at requirement altitude without
Product re-entry. Candidate `6f2d3415` is ready for independent exact-cut
review. It is not self-accepted; M2 and the implementation hold remain active.
