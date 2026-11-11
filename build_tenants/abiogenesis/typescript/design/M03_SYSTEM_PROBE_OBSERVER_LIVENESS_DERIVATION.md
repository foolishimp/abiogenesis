# M03 System Probe Observer Liveness Derivation

**Status**: Active design surface for T-129 first slice  
**Governs**: M03 runtime liveness, actor/process supervision, retry/watchdog disposition  
**Requirement authority**:

- `REQ-R-ABG3-TRANSPORT-025` through `REQ-R-ABG3-TRANSPORT-030`
- `REQ-R-ABG3-EVENTS-022` and `REQ-R-ABG3-EVENTS-023`
- `REQ-R-ABG3-PROJECTION-016` and `REQ-R-ABG3-PROJECTION-017`
- `REQ-R-ABG3-CONTINUATION-009`
- `REQ-R-ABG3-RETRY-009`

Retired sections: [history/M03_SYSTEM_PROBE_OBSERVER_LIVENESS_DERIVATION__RETIRED_SECTIONS.md](history/M03_SYSTEM_PROBE_OBSERVER_LIVENESS_DERIVATION__RETIRED_SECTIONS.md).

## Problem

ABG derives runtime liveness and watchdog disposition from replayed events
through one observer projection across the ABG-known runtime systems
(`RuntimeLivenessObserverProjection`, `abg/runtime_liveness_contracts.ts`;
`deriveRuntimeLivenessProjection`, `abg/calculus/liveness.ts`).

The required shape is:

```text
ABG runtime systems + runtime assets -> probes -> one runtime liveness observer projection -> one disposition
```

A probe declares one source from `RUNTIME_PROBE_SOURCE_VALUES`
(`abg/runtime_liveness_contracts.ts`): `stdout`, `stderr`, `pty`,
`structured_output`, `tool_progress`, `api_progress`, `process_lifecycle`,
`worker_heartbeat`, `graph_progress`, `frame_progress`, `evaluator_progress`,
`event_log`, `ledger`, `manifest`, `projection`, `report`, `dossier`, `archive`
and `result_artifact`. A probe observation's signal is `coverage`, `activity`,
`artifact_pending`, `artifact_admitted`, `artifact_rejected` or
`external_interruption` (`RuntimeProbeObservation`, `abg/runtime_liveness_contracts.ts`). Probes do not
decide retry or graph movement; the observer projection derives the disposition
(`deriveRuntimeLivenessSemantics`, `abg/calculus/liveness.ts`).

## Irreducible Architectural Carrier Set

| Carrier | Role | Prime or subordinate |
| --- | --- | --- |
| `RuntimeSystemProbeContract` | Declares a known system or runtime asset probe source, observed runtime boundary, and admissible evidence refs. | Prime |
| `runtime_activity_probe_observed` | Admitted raw activity evidence for one runtime boundary (`stageRuntimeActivityProbe`, `abg/runtime_liveness.ts`). | Prime event |
| `runtime_external_interruption_observed` | Admitted raw interruption evidence for one runtime boundary: a probe observation whose signal is `external_interruption` (`stageRuntimeActivityProbe`). | Prime event |
| `RuntimeLivenessObserverProjection` | Replay-derived normalized liveness truth across explicit probe events and existing actor/process events. | Prime projection |
| `RuntimeWatchdogPolicy` | Declared policy over observer truth: startup and inactivity leases, hard safety cap and termination grace (`constructRuntimeWatchdogPolicy`). The retry budget and terminal policy are separate budget facts (`projectRuntimeRetryBudgetFacts`, `abg/calculus/liveness.ts`). | Prime policy carrier |
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

The observer projection derives one disposition for an occurrence at a sample
(`deriveRuntimeLivenessSemantics`, `abg/calculus/liveness.ts`). It applies rule
7 first, then rule 2, then the policy and interruption conditions of rule 1,
then a preserved admitted artifact (`continue_waiting`, reason
`admitted_artifact_preserved`), then a closed attempt (rules 5 and 6), and then
the lease (rules 3 to 6):

1. An admitted external interruption makes the disposition the declared
   same-edge continuation (`yield_continuation`) when one exists, otherwise the
   retry budget's terminal policy (`terminalPolicy`), with reason
   `admitted_external_interruption`. This applies only when a watchdog policy is
   declared; without one the disposition is `continue_waiting` with reason
   `unknown_watchdog_policy`.
2. A pending artifact observation (`artifact_pending`) makes the disposition
   `inspect_archive`, with reason `artifact_requires_native_assessment`, before
   interruption, retry or no-progress.
3. With no admitted activity, the lease deadline is the startup lease
   (`startupMs`). The projection records the deadline and whether it has expired
   (`leaseDeadlineElapsedMs`, `leaseExpired`).
4. After admitted activity, the lease deadline is the last activity plus the
   inactivity lease (`inactivityMs`). An expired lease with a live actor process
   makes the disposition `controlled_terminate`, with reason `startup_expired` or
   `inactivity_expired`.
5. When the actor attempt has closed without a preserved admitted artifact, or
   the lease has expired with every required probe covered and no live process,
   a declared same-edge continuation makes the disposition `yield_continuation`;
   otherwise a remaining retry budget of zero makes it the budget's terminal
   policy, with reason `retry_budget_exhausted`.
6. In the same cases, a remaining budget with retry eligibility makes the
   disposition `retry`, with reason `native_frontier_and_budget`; otherwise the
   disposition is `block`.
7. A reached hard safety cap with a live actor process makes the disposition
   `controlled_terminate`, with reason `absolute_safety_cap`, ahead of every
   other rule. The effect boundary then admits typed threshold truth,
   `actor_process_timeout_observed` with timeout class `absolute`
   (`admitRuntimeThreshold`, `abg/runtime_liveness.ts`). The hard cap is not a
   retry, block or failure disposition.
8. Otherwise the disposition is `continue_waiting`.

## One Surface Rule

Public start, gaps, live status, watchdog, retry, and downstream harness
surfaces may render or relay liveness truth. They shall not compute separate
liveness authority from elapsed time, child process state, transcript text, or
file polling, local mutable controller state, or an asset-specific sidecar.
