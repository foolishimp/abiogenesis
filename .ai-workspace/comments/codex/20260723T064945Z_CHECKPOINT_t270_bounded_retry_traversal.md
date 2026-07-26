# T-270 Bounded Retry Traversal Checkpoint

## Status

Ready for bounded review at implementation commit `ff2636ef`.

## Delivered

- One Product-published GTL.TypeScript GraphFunction declares
  `C.retry(C.of(F_P), 2)` without a lowered or generated executable carrier.
- HoG retains the exact retry input, derives the same-edge cursor from the
  original GTL term, and performs the second attempt inside its existing
  one-call graph fold. Public does not acquire a retry loop.
- ABG admits immutable retry-attempt and retry-progress truth, requires the
  exact failed C-call and judgment, enforces the declared budget, and admits
  the retry route before the next attempt opens.
- Replay and public projection accept a closed retry chain only when the
  retried C-call has an exact admitted retry route and sequential successor
  call.
- Installed mutations prove that a semantic contradiction is not retryable and
  that repeated malformed output stops after exactly two dispatches.

## Conservation Progress

The fixed forty-row matrix advances from `15/40` to `18/40`:

- `structural_form/retry`;
- `consequence_route/same_edge_retry`; and
- `runtime_disposition/retry_same_edge`.

The remaining `22` rows stay explicit gaps. This checkpoint proves the
installed `contract_failure` retry path; it does not claim every declared
retryable failure class, recursion, gate, fan-out/fan-in, F_H continuation, or
`ABG5-S02` closure.

## Exact Candidate Basis

- artifact SHA-256:
  `b1360405472ec9f42ec56115176a5a6e480564dfff9a6170dc4836fd8a172362`
- Product content digest:
  `sha256:7e5bdcfc02225ff28d3e145e0d983f93eb2083329969aa7e9ea212dafa02f0c2`
- manifest digest:
  `sha256:18df25bbefb2b42ce848969827f848898fc0a9ca782a36df370cf39f3cc9be33`

Two independent `npm pack --ignore-scripts` runs reproduced the exact artifact
digest.

## Verification

- `npm run test:m5`: `53/53`
- retained `npm run test:m4`: `26/26`
- conservation: `18/40` proven, `22/40` explicit `todo`
- `ABI5-ROOT-001`: `root_satisfied`, R1-R10 true, no failures
- `git diff --check`: green

## Boundary

No parser, lowering, compiled carrier, public traversal controller, scheduler,
or second runtime path was introduced. `ABG5-S02` remains open. The next T-270
frontier remains the highest-value uncovered direct traversal relation selected
from the fixed matrix; F_H continuation stays owned by T-272.
