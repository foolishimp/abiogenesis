# T-270 Native GraphFunction Substitution Checkpoint

## Status

Ready for bounded review at implementation commit `38a33ae6`.

## Delivered

- Pure GTL.TypeScript `substituteGraphFunction` replaces one exact canonical
  outer GraphVector with one interface-conformant inner GraphFunction.
- The resulting immutable GraphFunction preserves the outer input, output,
  start, and terminal boundary while exposing the inserted nodes and edges.
- The constructor rejects missing or forged target vectors, interface and
  environment mismatch, duplicate identities, and metadata conflicts.
- The non-lowering validator resolves the outer and inner functions from the
  exact publication and checks the visible typed replacement.
- The installed parent traverses the ordinary HoG/ABG path as three C-calls.
  Durable events retain the original compose relation on the outer leaves and
  the substitute relation on the inserted leaf.

## Exact Candidate Basis

- artifact SHA-256:
  `7159345de37858a486c62753d9fb0863ac447743d0ad8c0161790e26a0674d5f`
- Product content digest:
  `sha256:b19ebe0283639e07bff165634c34906c8fd38b5ff01bc823462ddfb61236a638`
- manifest digest:
  `sha256:0520a30a2246180be91d4419739e921ac47051108b906e56dcfdb3b5ecdeddd6`

## Verification

- `npm run test:m5`: 46/46
- retained `npm run test:m4`: 26/26
- `ABI5-ROOT-001`: `root_satisfied`, R1-R10 true, no failures
- repeated `npm pack`: exact artifact digest reproduced
- `git diff --check`: green

## Boundary

This proves one exact GraphVector substitution through the installed Product
path. It does not claim identity, promotion, same-object, runtime recursion,
fan-out, fan-in, gate, or complete traversal-row closure. `ABG5-S02` remains
open. No parser, lowering, semantic IR, compiled program, public controller,
scheduler, or second runtime path was introduced.
