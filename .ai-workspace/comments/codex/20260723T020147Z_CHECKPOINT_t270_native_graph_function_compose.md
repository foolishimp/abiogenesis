# T-270 Native GraphFunction Composition Checkpoint

## Status

Ready for bounded review at implementation commit `f65059a8`.

## Delivered

- Pure GTL.TypeScript `composeGraphFunctions` materializes a new immutable
  GraphFunction from two immutable source GraphFunctions.
- The constructed parent contains original GTL nodes, one canonical bridge
  edge, and one canonical compose application. It is not a lowered or compiled
  execution carrier.
- The validator admits exact published source references without adding those
  sources to the invoked parent Program membership.
- The installed parent traverses through the ordinary HoG/ABG path; both leaf
  fibres retain the same canonical composition reference in durable events.
- Mutations cover missing source authority, interface mismatch, metadata
  conflict, duplicate node identity, malformed topology, forged edge identity,
  and widened edge shape.

## Exact Candidate Basis

- artifact SHA-256:
  `d4cf72318e3a39250db060aadc1c991ff78e7c8e1b5ec995d5d7e07c184d0134`
- Product content digest:
  `sha256:95972c458987f698a342b1955516e2cd87b4cdbb6516e2a4a9af423c6a0b2afb`
- manifest digest:
  `sha256:aa3d6a662529f0eeaa0c6d63d784538705a78f2d5bba2b02b7b7c17fcd23ef67`

## Verification

- `npm run test:m5`: 44/44
- retained `npm run test:m4`: 26/26
- `ABI5-ROOT-001`: `root_satisfied`, R1-R10 true, no failures
- repeated `npm pack`: exact artifact digest reproduced
- `git diff --check`: green

## Boundary

This proves one exact GraphFunction composition join. It does not claim
associativity, identity, substitution, promotion, same-object, recursion,
fan-out, fan-in, gate execution, or complete traversal-row closure.
`ABG5-S02` remains open. No parser, lowering, semantic IR, compiled program,
public controller, scheduler, or second runtime path was introduced.
