# T-106 Traversal Non-Progress Implementation Note

## Claim

T-106 is implemented for the ABIogenesis source-scope boundary.

The implementation does not patch `odd_sdlc` and does not patch the live
`data_mapper.test66.TS.cl` install. Those are downstream consumer work after
odd_sdlc takes the ABG projection.

## What Landed

Requirement authority:

- `specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md`
  - `REQ-R-ABG3-TRANSPORT-020`
  - `REQ-R-ABG3-TRANSPORT-021`
  - `REQ-R-ABG3-TRANSPORT-022`
- `specification/requirements/abg/REQ-R-ABG3-RETRY.md`
  - `REQ-R-ABG3-RETRY-007`
  - `REQ-R-ABG3-RETRY-008`
- `specification/requirements/abg/REQ-R-ABG3-PROJECTION.md`
  - `REQ-R-ABG3-PROJECTION-011`

Design/module authority:

- `build_tenants/abiogenesis/typescript/design/M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_FIRST_SLICE_IACS.md`
- design index entry in `build_tenants/abiogenesis/typescript/design/README.md`

Code:

- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/traversal_non_progress.ts`
- export additions in `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/index.ts`
- `test:t106` script in `build_tenants/abiogenesis/typescript/package.json`

Proof:

- `build_tenants/abiogenesis/typescript/test_env/tests/test_t106_traversal_non_progress_continuation.test.mjs`

## Semantics

ABG now has two pure derived surfaces:

- `TraversalNonProgressCarrier`: fact carrier over actor invocation, process,
  timeout, streams, artifact/report/progress observation, signal sequence, and
  evidence refs.
- `TraversalContinuationActionProjection`: one authoritative action:
  `retry_same_edge`, `yield_same_edge_continuation`, `retry_exhausted`,
  `inspect_runtime_archive`, `reprice_runtime_policy`, or `blocked`.

`deriveTraversalContinuationSummary(...)` renders from that projection.
`assertTraversalContinuationSummaryAgreement(...)` rejects downstream-style
summary action drift.

Artifact/report salvage wins before no-progress classification. Stream progress
does not become silent no-output retry. Missing process evidence becomes
`inspect_runtime_archive`, which is terminal until new admitted truth exists.

## Verification

Executed from `build_tenants/abiogenesis/typescript`:

- `npm run lint:semantic`: passed
- `npm run test:t087`: passed, 4/4
- `npm run test:t098`: passed, 2/2
- `npm run test:t100:unit`: passed, 8/8
- `npm run test:t103`: passed, 24/24
- `npm run test:t106`: passed, 7/7
- `npm run test:semantic`: passed, 361/361

## Review Fix Wave

Implemented after the STDO self-review and Claude review identified coverage
and reachability gaps.

Additional fixes:

- `engine_runner.ts` now consumes T-106 on blocked/no-artifact F_P dispatch
  outcomes.
- The runner derives the T-106 summary/action before choosing retry, yielded
  inspection, or terminal gap stop.
- `deriveTraversalContinuationActionProjection(...)` now re-derives the
  carrier from replay truth and rejects forged carrier drift.
- clean process exit with no output now maps to `runtimeFailureClass:
  "no_output"` with `timeoutClass: null`; abnormal exit remains
  `transport_exit`.

Additional tests:

- forged carrier drift rejection
- report-ref rejection
- progress-signal and stderr progress continuation
- inferred hard timeout
- inferred abnormal transport exit
- clean no-output exit
- `reprice_runtime_policy`
- `blocked`
- `stationary_retry`
- runner same-edge retry from silent process truth
- runner inspect-archive summary when process evidence is missing

Review-fix verification:

- `git diff --check`: passed
- `npm run lint:semantic`: passed
- `npm run test:t087`: passed, 4/4
- `npm run test:t098`: passed, 2/2
- `npm run test:t100:unit`: passed, 8/8
- `npm run test:t103`: passed, 24/24
- `npm run test:t106`: passed, 14/14
- `npm run test:semantic`: passed, 368/368

## Downstream Follow-Up

odd_sdlc should open or update a consumer ticket to:

1. depend on ABIogenesis RC containing T-106
2. consume `TraversalContinuationActionProjection`
3. remove local carrier/summary/gaps next-action disagreement
4. add odd_sdlc focused tests for silent worker non-progress summary agreement
5. patch `data_mapper.test66.TS.cl` in place and resume from the current vector
