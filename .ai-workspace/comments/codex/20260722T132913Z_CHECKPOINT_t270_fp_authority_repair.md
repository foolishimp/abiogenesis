# T-270 F_P Authority Repair Checkpoint

## Claim

Commit `fef14403dad104277bf0bc06269c16d326db6db6` repairs the reviewed
authority and failure-lifecycle defects in the first M5 F_P slice. It is a
review checkpoint, not `ABG5-S02` closure.

## Authority Shape

The installed public path now has this relation:

```text
Public fixed preparation
  -> one HoG graph-traversal invocation
  -> exact admitted implementation port
  -> ABG-owned actor/process supervision for F_P
  -> candidate evidence and result
  -> ABG admission, judgment, route, and replay truth
```

Public no longer owns the cursor loop, implementation selection, symbol
loading, leaf invocation, cursor advancement, process environment, timeout,
or subprocess execution. HoG owns the graph fold. Implementation realizes
only its declared leaf interior. ABG mints actor/process identities, selects
and supervises transport, records process events, and verifies those events
before probabilistic evidence can be admitted.

## Failure Closure

Evidence, result, and judgment rejection now totalize the opened C-call,
admit a `blocked` traversal route, append `run_stopped`, and terminate Run,
GraphCall, and Frame activity. Replay derives `blocked` from `run_stopped`; a
blocked C-call judgment alone no longer projects a terminal run.

F_P success-result admission now refuses:

- missing attribution;
- wrong attribution;
- contradictory semantic output;
- malformed JSON; and
- undeclared result fields.

The worker timeout path sends `SIGTERM`, waits a bounded grace interval,
escalates to `SIGKILL`, destroys retained streams, and settles without waiting
indefinitely for process close.

## Verification

- `npm run test:m5`: `26/26` pass, serialized;
- `npm run test:m4`: `25/25` pass, serialized;
- retained root governor: `root_satisfied`, `R1` through `R10` true, frontier
  `null`, no failures;
- `git diff --check`: pass; and
- Public controller/ambient-process source census: zero matches.

The test named subprocess-backed F_P uses a deterministic Node worker fixture.
It proves the installed process, GTL, HoG, ABG, replay, and CLI path; it does
not claim a live model call. The five B-001 transport tests include one real
spawned worker process but are not represented as an installed live-F_P
proof.

## Open Frontier

`ABG5-S02` remains open. The next slice may begin only after review of this
authority repair. It must then add `workflow.C`, the same-path forty-row
traversal matrix and fibre differential, a genuinely live F_P call, and the
remaining RC5 semantic dispositions. No child traversal was added here.
