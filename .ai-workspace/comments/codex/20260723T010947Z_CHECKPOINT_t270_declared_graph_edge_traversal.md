# T-270 Declared Graph-Edge Traversal Checkpoint

## Status

Ready for bounded review at implementation commit
`13d413905728a3d8464dec20ddf5de06dc11e6ec`.

## Delivered

- GTL.TypeScript constructs one canonical graph edge and all nine typed
  `GraphFunctionApplication` relation declarations.
- The validator rejects widened, forged, dangling, interface-incompatible,
  and malformed relation declarations without lowering them.
- One packed two-node F_D GraphFunction traverses an exact declared graph edge
  through the ordinary install, catalog, HoG, ABG, replay, and CLI path.
- HoG derives the target from original admitted GTL. ABG admits the exact route
  target. Public invokes the existing path and owns no traversal loop.

## Exact Candidate Basis

- artifact SHA-256:
  `3482f78488e63c17055f2d805683310a012de4bac58c66de222fae74adb4a3a1`
- Product content digest:
  `sha256:ed323d18c8bb9f058edd785c1eccd436c8da42ae77be93d853d61b9d3efb4a1a`
- manifest digest:
  `sha256:4eedc99ea2f2514e380c7d15fd355c4cfe79e57426af05e768983d41c5cbfaec`

## Verification

- `npm run test:m5`: 42/42
- `npm run test:m4`: 26/26
- `ABI5-ROOT-001`: `root_satisfied`, R1-R10 true, no failures
- repeated `npm pack`: exact artifact digest reproduced
- `git diff --cached --check`: green before commit

## Boundary

This does not claim runtime realization of all graph applications. Recursion,
fan-out, fan-in, gate, the remaining application relations, and the complete
conservation-row inventory remain open under T-270. No compiler, lowering,
compiled plan, scheduler, public controller, or second runtime path was added.
