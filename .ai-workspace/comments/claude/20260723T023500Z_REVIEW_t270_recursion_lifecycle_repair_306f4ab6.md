# Review: T-270 Graph Recursion Lifecycle Repair At 306f4ab6

- reviewer: claude (independent, direct F_H commission — the bounded
  re-review the checkpoint requests)
- date: 2026-07-23T02:35Z
- subject: span `bfc4cafc..306f4ab6` (four commits: `a4df6eeb` recursion
  feature, `7b9670fa` checkpoint, `0ed75e8f` lifecycle repair, `306f4ab6`
  repair checkpoint); head = origin
- verdict: **repair verified — recommend accepting the recursion slice and
  unpausing fan-out/fan-in**

## Claims Measured (all green, my reruns)

| Claim | Measurement |
|---|---|
| M5: 58/58 | `npm run test:m5`: 58/58, 0 fail (three recursion tests added) |
| M4 retained: 26/26 | `npm run test:m4`: 26/26, 0 fail |
| Conservation 20/40, 20 gaps | Solo run: 41 tests → 21 pass (binder + 20 proven rows), **20 todo**, 0 fail — the recursion row flipped open → proven |
| Reproducible package `e97df484…e975` | Exact match in the pinned candidate basis; R1 exact-byte verification passed on my independent build (checkpoint additionally records two independently packed archives agreeing) |
| Branch matches remote | HEAD = origin = `306f4ab6` |
| Four Claude review posts untouched | Verified — all four untracked files unchanged |

## The Defect And The Repair (both real)

The original `a4df6eeb` recursion path **inferred** closed child GraphCalls
from terminal routes (deriving closure instead of admitting it), collapsed
nested lifecycle fluents, and could not propagate an admitted blocked child —
genuine violations of the accepted design's lifecycle law and the
ABG-only-truth axiom. The repair closes all three:

1. Every successful child now admits its own exact
   `terminal_reached → frame_closed → graph_call_closed` chain — my event-log
   checks confirm 4 of each (three children + root) on the happy path.
2. Foldback is gated on that exact closure chain for `closed`, or the exact
   blocked route and reason for `blocked` (`childClosureRef: null` on a
   blocked foldback — asserted).
3. Lifecycle fluents are keyed by aggregate identity, and public success now
   requires **no remaining transient lifecycle fluent** (`run_active`,
   `graph_call_active`, `frame_active`, `locus_active`, `c_call_active`,
   `parent_waiting_on_child`, `child_foldback_available`,
   `terminal_route_available`) — a completeness condition on replay, verified
   in `public/outcome.ts`.

## Design Conformance (§6.1 recursion row)

The installed tests prove the accepted semantics precisely:

- **Foldback rebinds and re-evaluates the parent**: parent C-calls at
  attempts [1,2,3,4] under a single frame identity; three child GraphCalls,
  three foldbacks, three admitted `advance` application routes; exactly one
  `run_closed`, final event.
- **Blocked-child propagation**: child blocked route → foldback with null
  closure ref → parent blocked route → exactly one `run_stopped`, final
  event, no closure.
- **Positive bound**: attempt 4 blocks at the declared bound **without
  opening another child**; no `run_closed`; terminal `run_stopped`.

No parser, lowering, compiled carrier, public controller, second runtime,
design change, or new ticket entered the span (censuses in-suite; tickets
unchanged).

## Notes

- The `a4df6eeb` review that produced the findings has no durable post of its
  own; its findings are restated verbatim in the repair checkpoint, which is
  an acceptable disposition — a review post would have been slightly cleaner
  under UP-007.
- Process observation: the checkpoint states the review verbatim and holds
  fan-out/fan-in paused pending acceptance — the bounded-frontier discipline
  is being followed exactly.

## Recommendation

Accept the recursion slice at `0ed75e8f` / checkpoint `306f4ab6` (a DECISION
comment in the fp-authority pattern would keep the record consistent) and
unpause fan-out/fan-in. Residual for S02 after fan-out/fan-in: the remaining
20 open conservation rows (each typed), remaining RC5 dispositions, then S02
closure with its own F_H acceptance.
