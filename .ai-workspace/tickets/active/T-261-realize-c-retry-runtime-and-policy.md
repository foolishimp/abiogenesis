# T-261 - Realize C.retry Runtime And Policy Join

- id: T-261
- status: active
- phase_status: three_view_design_required
- delivery_phase: DS-3
- change_class: design_reframe
- owner: abiogenesis
- priority: critical
- source_ticket: T-252
- dependency: T-260

## Boundary

Close `c_retry_runtime_and_policy_join`: one C.retry term repeats the same C
contract only for its declared positive budget and admitted retryable-failure
allowlist.

## T-252 Census Gap Ownership

- gap_family: c_retry_runtime_and_policy_join

## Entry And Exit

Accept a three-view generic design before code. The unchanged T-252 reviewer
term must retain budget 2 and exactly `transport_failure | no_output |
contract_failure`; semantic dispute never retries the C call. Prove a
non-Consensus correction/retry fixture.

## Non-Closure

Engine-attempt inference, retry on semantic disagreement, unbounded retry,
ambient allowlists, or Consensus-specific branches.
