# M03 System Probe Observer Liveness Derivation

**Status**: Active design surface for T-129 first slice  
**Governs**: M03 runtime liveness, actor/process supervision, retry/watchdog disposition  
**Requirement authority**:

- `REQ-R-ABG3-TRANSPORT-025` through `REQ-R-ABG3-TRANSPORT-030`
- `REQ-R-ABG3-EVENTS-022` and `REQ-R-ABG3-EVENTS-023`
- `REQ-R-ABG3-PROJECTION-016` and `REQ-R-ABG3-PROJECTION-017`
- `REQ-R-ABG3-CONTINUATION-009`
- `REQ-R-ABG3-RETRY-009`

## Problem

T-106, T-108, T-115, and T-127 left ABG with the right pieces but not one
liveness law. Actor/process events record process activity. Traversal
non-progress projects silent attempts. The F_P construction episode can rank
next work. The missing design layer is the shared observer that makes runtime
liveness and watchdog disposition replay-derived across all ABG-known runtime
systems.

The required shape is:

```text
ABG runtime systems + runtime assets -> probes -> one runtime liveness observer projection -> one disposition
```

Probe sources may observe stdout, stderr, terminal transcript deltas,
structured stream events, heartbeat events, event log append, ledger
append/update, manifest creation/update, archive/result writes,
projection/report writes, process lifecycle, graph-call/frame activity,
evaluator progress, and external safety interruption. They do not decide retry
or graph movement.

## Irreducible Architectural Carrier Set

| Carrier | Role | Prime or subordinate |
| --- | --- | --- |
| `RuntimeSystemProbeContract` | Declares a known system or runtime asset probe source, observed runtime boundary, and admissible evidence refs. | Prime |
| `RuntimeActivityProbeObservedEvent` | Admitted raw activity evidence for one runtime boundary. | Prime event |
| `RuntimeExternalInterruptionObservedEvent` | Admitted raw interruption evidence from a harness, host, operator, OS signal, or hard safety cap. | Prime event |
| `RuntimeLivenessObserverProjection` | Replay-derived normalized liveness truth across explicit probe events and existing actor/process events. | Prime projection |
| `RuntimeWatchdogPolicy` | Declared policy over observer truth: leases, safety cap, retry budget, and default terminal actions. | Prime policy carrier |
| `RuntimeInvocationDisposition` | Single action truth consumed by watchdog, retry, public status, and downstream summaries. | Prime read model |

Subordinate payloads include stream refs, archive refs, terminal session ids,
byte counts, elapsed observation time, and diagnostic detail. They do not own
runtime transition law.

## Composition

T-115 actor/process events remain authoritative process-boundary facts. T-129
does not replace them. It normalizes them into liveness rows alongside explicit
probe events.

T-106 traversal non-progress becomes one consumer of liveness observer
disposition. Silent timeout remains classifiable, but active probe evidence
prevents a flat elapsed-time kill from becoming runtime authority.

T-127 construction evaluation may consume the observer disposition as pressure
or blocker evidence. It does not get a second liveness calculation.

T-119/T-120 Event Calculus law applies to probe events. Activity observation
initiates `runtime_activity_recent` and `runtime_invocation_active`. External
interruption terminates active truth and initiates
`runtime_externally_interrupted` plus `runtime_invocation_blocked`.

## Decision Rules

1. If admitted external interruption exists, the disposition is terminal for the
   current invocation unless a later replay-derived policy explicitly reprices.
2. If artifact/report/progress activity exists before transport failure, the
   disposition is `inspect_archive` before retry or no-progress.
3. If no activity exists beyond startup silence, the lease state is
   `startup_silence_exceeded`.
4. If last activity is older than the inactivity lease, the lease state is
   `inactivity_exceeded`.
5. If inactivity is exceeded and retry budget is zero, the disposition is
   `block`.
6. If inactivity is exceeded and retry budget remains, the disposition is
   `retry`.
7. If a hard safety cap is exceeded without an admitted external interruption,
   the projection records `requires_external_interruption_event` and may project
   `controlled_terminate` so the effect boundary can emit typed interruption
   truth. It does not treat the hard cap as a final retry, block, or failure
   authority.
8. Otherwise the disposition is `continue_waiting`.

## One Surface Rule

Public start, gaps, live status, watchdog, retry, and downstream harness
surfaces may render or relay liveness truth. They shall not compute separate
liveness authority from elapsed time, child process state, transcript text, or
file polling, local mutable controller state, or an asset-specific sidecar.

## First Slice

The first TypeScript slice publishes the carriers, event admission, Event
Calculus effects, and pure replay projection. Existing actor/process events
feed the observer projection directly. Transport paths may still emit their
existing actor/process events while the projection normalizes them. Runtime
runner replacement of every flat timeout call site is follow-on closure work
under T-129 until public and downstream live proof agree.
