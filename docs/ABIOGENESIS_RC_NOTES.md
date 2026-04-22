# abiogenesis 3.3.0 RC Notes

This note records accepted RC behavior for the current `v3.3.0` line after the
B-029 continuation-yield projection fix.

## Accepted Framework Behavior

### Continuation-Owned Next Steps Project As Yield

The current RC treats continuation-owned retry, repair, and `fh_review`
outcomes as yielded public truth when a lawful next step already exists.

That means:

- `continuation_opened` is not enough on its own; the public boundary must also
  project yielded continuation truth
- the typed public carrier is `YieldedContinuationContract`
- the run/read-model carrier is `run_yielded`
- CLI/control-plane consumers must surface `yield`, not failure-shaped status,
  for those continuation-owned cases

### True No-Continuation Defects Stay Hard Failure

The current RC does not flatten all failure into yield.

That means:

- `policy_config_defect` with no lawful continuation remains `status="error"`
- `runtime_defect` with no lawful continuation remains `status="error"`
- those paths emit no `continuation_opened`
- those paths emit no `run_yielded`

### Retry Yield Is Narrowed By Failure Class

Retry continuation is now source-governed rather than branch-local.

That means retry yield is lawful only for:

- `transport_failure`
- `no_output`
- `contract_failure`

Other failure classes must remain terminal unless another explicit continuation
family owns the next step.

## Current Known Limitation

### Downstream Install Validation Follows The Published Cut

This RC closes the ABG source boundary for B-029, but it does not claim
downstream consumer proof inside the source ticket.

That means:

- installed consumers such as `odd_sdlc` must validate against the published RC
  cut
- if the installed consumer still exposes failure-shaped status where source now
  yields, that reopens B-029 as a release regression
- downstream validation is qualification over the release cut, not hidden source
  closure evidence

## Current Verification Footer

The current source proving footer for B-029 is:

- `3 passed`
- `7 passed`

from:

- the negative-proof bundle over true no-continuation failures
- the positive continuation-yield bundle over retry, repair, and `fh_review`
