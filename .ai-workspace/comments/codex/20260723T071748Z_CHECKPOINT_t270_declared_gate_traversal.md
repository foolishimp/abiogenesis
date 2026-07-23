# T-270 Declared Gate Traversal Checkpoint

## Status

Ready for bounded review at implementation commit
`c803dd65f947660def0568bcddc7e39d519d7eb9`.

## Delivered

- One Product-published GTL.TypeScript `GateApplication` binds an immutable
  Rule, one F_D Evaluator, and one named target GraphFunction.
- Whole-Program validation requires the evaluator locus to match the declared
  evaluator implementation, regime, composition identity, and gate input
  contract.
- HoG traverses the evaluator and named child through the existing direct fold.
  Public performs one invocation and owns no gate loop or selection state.
- ABG admits evaluator result, judgment, and caused route before the target
  GraphCall opens.
- The installed blocked path admits the valid evaluator result but stops before
  target traversal. A detached evaluator relation refuses during validation.

## Conservation Progress

The fixed forty-row matrix advances from `18/40` to `19/40`:

- `structural_form/adaptive_declared_selection`.

The remaining `21` rows stay explicit gaps. This checkpoint does not claim
runtime recursion, fan-out/fan-in, F_H continuation, or `ABG5-S02` closure.

## Exact Candidate Basis

- artifact SHA-256:
  `eca20ec46453b12796c6020ed093f5506e29f8f62c5fab64b434ed5519ef8994`
- Product content digest:
  `sha256:4ae202e9ad3359d676c48c122c36b67eaf541be0206dc839f25d916a21840d46`
- manifest digest:
  `sha256:88edca2f7fd9e3dce3feac5f07eb904912297c212d9dc776da3bd909d63360d4`

Two independent `npm pack --ignore-scripts` runs reproduced the exact artifact
digest.

## Verification

- `npm run test:m5`: `55/55`
- retained `npm run test:m4`: `26/26`
- conservation: `19/40` proven, `21/40` explicit `todo`
- `ABI5-ROOT-001`: `root_satisfied`, R1-R10 true, no failures
- `git diff --check`: green

## Boundary

No parser, lowering, semantic IR, compiled carrier, public traversal
controller, policy engine, or second runtime path was introduced. The gate is
one declared GTL relation over the existing HoG and ABG path. `ABG5-S02`
remains open.
