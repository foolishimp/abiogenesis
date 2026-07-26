# T-270 Rule And Evaluator Declaration Checkpoint

## Status

Ready for bounded review at implementation commit
`25af35dbad0efb625eea7f00da131102294dcc1b`.

## Delivered

- GTL.TypeScript now carries first-class immutable `Rule` and `Evaluator`
  declarations in the published Module.
- Recurse binds one published termination Rule and one or more published
  termination Evaluators.
- Gate binds its Rule and Evaluators to the same admitted publication.
- Static validation rejects missing, ambient, duplicate, malformed, widened,
  and identity-forged declarations or application references.

`Rule` remains passive declaration data. `Evaluator` declares a convergence
check and its implementation binding; it owns no runtime event, traversal,
admission, or closure truth.

## Exact Candidate Basis

- artifact SHA-256:
  `6efcc659e8d4a81c5b50ec303fb5da0ea4c2e1a9493e4e79842b758a758a2908`
- Product content digest:
  `sha256:c9a752743350410acff7be39852aef8d2a15085dbaf40b1accb4b7968ea56482`
- manifest digest:
  `sha256:892dfa10e0115532d3a93d31c616e31d446431ca9ab971a42403e21d79d2e621`

## Verification

- `npm run test:m5`: 43/43
- `npm run test:m4`: 26/26
- `ABI5-ROOT-001`: `root_satisfied`, R1-R10 true, no failures
- repeated `npm pack`: exact artifact digest reproduced
- `git diff --cached --check`: green before implementation commit

## Boundary

This checkpoint does not execute a Rule or Evaluator and does not claim
runtime recursion or gate behavior. Fan-out, fan-in, recurse, gate, remaining
application relations, and the complete traversal-conservation inventory stay
open under T-270. No parser, compiler, lowering, executable plan, scheduler,
public controller, policy engine, or rival runtime was added.
