Cut from `build_tenants/abiogenesis/typescript/design/M03_SYSTEM_PROBE_OBSERVER_LIVENESS_DERIVATION.md` at commit `39d6cb975`, lines 95-103, verbatim.


## First Slice

The first TypeScript slice publishes the carriers, event admission, Event
Calculus effects, and pure replay projection. Existing actor/process events
feed the observer projection directly. Transport paths may still emit their
existing actor/process events while the projection normalizes them. Runtime
runner replacement of every flat timeout call site is follow-on closure work
under T-129 until public and downstream live proof agree.

---

Cut from `build_tenants/abiogenesis/typescript/design/M03_SYSTEM_PROBE_OBSERVER_LIVENESS_DERIVATION.md` at commit `a2769c3f7`, lines 17-22, 30-35, 42-43, 45-45, 72-89, verbatim.

T-106, T-108, T-115, and T-127 left ABG with the right pieces but not one
liveness law. Actor/process events record process activity. Traversal
non-progress projects silent attempts. The F_P construction episode can rank
next work. The missing design layer is the shared observer that makes runtime
liveness and watchdog disposition replay-derived across all ABG-known runtime
systems.

Probe sources may observe stdout, stderr, terminal transcript deltas,
structured stream events, heartbeat events, event log append, ledger
append/update, manifest creation/update, archive/result writes,
projection/report writes, process lifecycle, graph-call/frame activity,
evaluator progress, and external safety interruption. They do not decide retry
or graph movement.

| `RuntimeActivityProbeObservedEvent` | Admitted raw activity evidence for one runtime boundary. | Prime event |
| `RuntimeExternalInterruptionObservedEvent` | Admitted raw interruption evidence from a harness, host, operator, OS signal, or hard safety cap. | Prime event |

| `RuntimeWatchdogPolicy` | Declared policy over observer truth: leases, safety cap, retry budget, and default terminal actions. | Prime policy carrier |

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
