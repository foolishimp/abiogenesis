# Review: Live F_P Response Quality Before And After T-074

## Compared Archives

Before T-074 correction:

- `build_tenants/abiogenesis/typescript/test_env/test_runs/typescript_rc_live_portfolio/2026-04-26T111338865Z`

After T-074 correction and assessed-event scope tightening:

- `build_tenants/abiogenesis/typescript/test_env/test_runs/typescript_rc_live_portfolio/2026-04-26T120918850Z`

## Result

The live F_P response content did not materially change. It is byte-for-byte
identical for every portfolio stage.

The runtime changed, not the model response quality. T-074 makes ABG consume
valid assessed-result truth correctly on re-entry instead of redispatching the
same edge.

## Quality Metrics

| Metric | Before | After |
| --- | ---: | ---: |
| portfolio outcome | passed | passed |
| scenarios | 5 | 5 |
| stages | 12 | 12 |
| transport failures | 0 | 0 |
| JSON parse failures | 0 | 0 |
| top-level shape failures | 0 | 0 |
| assessment-count mismatches | 0 | 0 |
| unfulfilled assessments | 0 | 0 |
| blocking reasons | 0 | 0 |
| evidence refs | 14 | 14 |
| raw response chars | 7682 | 7682 |
| unique response hashes | 12 | 12 |

Every after-stage response preserved the same edge, assessment ids, fulfillment
status, and evidence refs as the before-stage response.

## Interpretation

Contract compliance was already high before T-074:

- responses were JSON-only
- responses parsed cleanly
- each stage returned the required edge
- each stage returned exactly the required assessment ids
- every assessment was `fulfilled`
- every assessment carried evidence refs
- no blocking reasons were returned

The weakness before T-074 was not response quality. The weakness was replay
semantics: ABG recorded `assessed` truth but did not use it to close the
matching vector for resumed F_P traversal.

After T-074, the same quality response becomes stronger runtime evidence because
ABG can re-enter from the assessed event, close the matching vector, and advance
without redispatching the assessed edge.

## Residual Limit

These live responses are intentionally contract-shaped artifacts. They prove
transport, artifact admission, assessment truth, and replay consumption. They do
not prove rich semantic generation quality beyond the declared fulfillment
contract.
