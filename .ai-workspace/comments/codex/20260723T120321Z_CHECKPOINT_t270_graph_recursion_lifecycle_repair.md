# T-270 Graph Recursion Lifecycle Repair

## Status

Ready for bounded review at implementation commit
`0ed75e8f27c551451cf6998d24ccce9f4ccfccab`.

## Review Disposition

The review of `a4df6eeb` was correct. The original recursion path inferred
closed child GraphCalls from terminal routes, collapsed nested lifecycle
fluents, and could not propagate an admitted blocked child. Fan-out remained
held while those defects were repaired.

## Delivered

- Each successful child admits its own exact
  `terminal_reached -> frame_closed -> graph_call_closed` chain.
- Child foldback requires that exact closure chain for `closed`, or the exact
  blocked route and reason for `blocked`.
- Event Calculus lifecycle fluents are keyed by aggregate identity. Parent
  waiting and child-foldback availability are terminated by their exact
  foldback and parent route.
- Replay projects root closure from root aggregate identities. Public success
  additionally requires no remaining transient lifecycle fluent.
- An installed declared child-stop input proves a blocked child folds back and
  causes exactly one parent `run_stopped`.

## Exact Evidence

- `npm run test:m5`: `58/58`
- retained `npm run test:m4`: `26/26`
- conservation: `20/40` proven, `20/40` explicit `todo`
- artifact SHA-256:
  `e97df484d3e310a1e1e6aebd26eab46474779f7657a40e8b9538654a6a07e975`
- Product content digest:
  `sha256:4e923e09dde9ba97512c08cbd86827681a75207f71f7101f0642faf29bca7a61`
- manifest digest:
  `sha256:e8472a350ff69e15105d6818d5e33a3099d77bdc154b3f28e4af78cfde40638f`
- two independently packed archives reproduce the artifact digest
- `git diff --check`: green

## Boundary

No fan-out/fan-in work, parser, lowering, compiled carrier, public controller,
second runtime, design change, or new ticket entered this repair. The
substantive conservation position is restored to `20/40`; fan-out/fan-in is
the next typed frontier and `ABG5-S02` remains open.
