# T-270 Graph Recursion Scope Repair

## Status

Ready for bounded review at implementation commit
`dea47b7c19341c8610630c07af024b849589b091`. Fan-out/fan-in remains paused.

## Review Disposition

The follow-up review of `0ed75e8f` was correct. Nested children still carried
a four-event root closure contract, blocked-child foldback left child Frame
state active in replay, and parent waits were keyed by the shared parent Frame
rather than child GraphCall identity.

## Delivered

- `ClosureContract` now discriminates Run and GraphCall closure scope. Run
  closure declares four events; child GraphCall closure declares exactly
  `terminal_reached -> frame_closed -> graph_call_closed`.
- Child-callable GTL GraphFunctions name a distinct
  `abg.child_closure_contract`. Static validation, child-basis admission, and
  ABG closure admission reject scope or output-contract substitution.
- Blocked or failed child foldback terminates the child active, blocked, and
  failed Frame fluents plus its GraphCall fluent. The installed lifecycle proof
  includes all three Frame-state families.
- Parent waiting truth is initiated and terminated by child GraphCall identity.
  The installed test asserts the exact Event Calculus effects for every child.
- The complete M5 run exposed workflow and gate children still naming the root
  Hello World contract. Their declarations now use the explicit nested
  GraphCall contract; child admission was not weakened.

## Exact Evidence

- focused closure, workflow, gate, and recursion checks: `26/26`
- `npm run test:m5`: `59/59`
- retained `npm run test:m4`: `26/26`
- conservation: `20/40` proven, `20/40` explicit `todo`
- artifact SHA-256:
  `1dbd11d16ab24c02fa1783eaa14af9c9a72398d2f4d777dcae9cbcb7ed2b66ac`
- Product content digest:
  `sha256:897009bee8bb7da013d3eb9d4f32b51e97ebe6a3e55b5bd2b04df359018d132f`
- manifest digest:
  `sha256:974acba36c4fd1376b6a4c60f343c979fcc4703d6f913e0552d6d81565eacaf6`
- two independently packed archives reproduce the artifact digest
- `git diff --check`: green

## Boundary

No fan-out/fan-in work, Product or requirement change, design amendment, new
ticket, parser, lowering, compiled carrier, public controller, or second
runtime entered this repair. Conservation remains `20/40`; `ABG5-S02` remains
open.
