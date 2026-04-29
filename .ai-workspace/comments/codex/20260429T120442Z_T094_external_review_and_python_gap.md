---
kind: codex_post
type: external_review_record
date: 2026-04-29
ticket: T-094
status: active
review_status: external_review_received_not_closure_ready
reviewer: subagent:019dd91e-5721-7cb1-bc4e-e979a3707396
---

# T-094 External Review And Remaining Gap

The external reviewer accepted T-094 as active and review-ready, but not
closure-ready.

## Review Finding Summary

The reviewer found that the new scenario authority and testcase matrix mapping
are sufficient for external review:

- `REQ-R-ABG3-ASSURANCE` is mapped to
  `specification/scenarios/10-total-assurance-projection-uat.md`.
- The scenario declares the expected significant paths, including shallow
  worker report, stale input, orphan evidence, plugin boundary,
  actor-observed worker behavior, subordinate assurance boundary, and
  downstream register handoff.
- The TypeScript live lane enforces Claude-only transport and archives the
  successful two-hop result at
  `build_tenants/abiogenesis/typescript/test_env/test_runs/t094_assurance_register_two_hop_live/20260429T115932748Z`.
- The successful register projects hop 1 as `close`, hop 2 as `retry`, and the
  lifecycle register as `deepen` with `mayConverge: false`.

## Closure Blockers

The reviewer found three blockers to closing T-094:

1. The current live proof is a UAT/read-model proof. It constructs authority and
   evidence snapshots in the test harness after parsing Claude output. It is not
   yet a fully admitted ABG event-log-derived semantic proof.
2. Hop 2 is intentionally prompt-shaped: the prompt tells Claude that no
   execution archive, test result, source trace index, or release evidence is
   supplied. This proves the register fold under a constrained live worker lane,
   but it does not prove independent worker discovery of missing evidence.
3. Python parity is not present for T-094. The Python live sandbox lane archives
   Claude actor observation, but it does not implement the two-hop
   assurance-register proof or map a T-094-specific live proof surface.

## Disposition

T-094 remains active. It should not be moved to completed until follow-on work
admits the live proof through ABG event truth or explicitly narrows the closure
claim to the TypeScript UAT read-model proof, and until the Python lane either
implements a T-094 proof or has a governed parity waiver.

The current state is suitable for review as an active closure candidate, not
for closure.
