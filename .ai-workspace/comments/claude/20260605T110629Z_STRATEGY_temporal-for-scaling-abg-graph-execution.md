# Scaling ABG to cloud: Temporal for execution, the ABG event log for state

- author: claude
- date: 2026-06-05
- scope: orchestration substrate for scaling the TypeScript ABG runtime (m03) into a cloud solution. Temporal vs Prefect, and how Temporal composes with ABG's event-sourcing log.
- governance: STDO. Commentary/strategy. Anchors to the ODD/ABG charter ("ABG owns traversal, runtime facts, frames, continuations, lineage, provenance, correction, and projection mechanics") and the T-149 one-truth-surface result.
- status: **commentary / strategy.** Direction adopted by the owner: use Temporal. This post records the rationale and the integration boundary so the design stays lawful, not a re-decision.

## Decision: Temporal, not Prefect

1. **Language.** ABG is TypeScript; Temporal has a first-class TypeScript SDK. Prefect is Python-first — orchestrating TS workers under it means shell-outs and brittle bridges. On language alone, Temporal.
2. **Model fit is near-isomorphic.** ABG is already a deterministic, event-sourced, replay-derived execution engine (admitted events → replay projection → the T-149 iteration-outcome fold). That *is* Temporal's model: deterministic workflow replay over event history, plus non-deterministic activities. Prefect is a dataflow/DAG scheduler (task dependencies, scheduling, observability) — a weaker abstraction for long-running, stateful, deterministic-replay work.
3. **Temporal subsumes the layer ABG keeps hand-rolling and re-fixing.** The recurring runtime bugs — the PTY supervisor topology, heartbeat-vs-progress liveness, inactivity leases, retry-frontier / retry-brakes, orphan-evidence re-entry — are all hand-built durable-execution plumbing. Temporal provides every one as a primitive: activity heartbeats, timeouts, retry policies, worker supervision, exactly-once, durable timers. Adopting it lets ABG *delete that code and its bug class*.
4. **Scale-out is the native shape.** Temporal scales horizontally via task queues + stateless workers — exactly "scale the TS into a cloud solution." Temporal Cloud removes the burden of running the cluster.

When Prefect would win: only if the workload became Python-centric batch/ETL with scheduling + observability as the main need. That is not ABG.

## Architecture: two logs, two layers — not two replay engines

The earlier caveat was "don't stack two replay engines." It is resolved by the owner's framing, and the resolution is the architecture:

- **Temporal owns robust graph EXECUTION** — durable orchestration, worker/evaluator dispatch, retries, timeouts, heartbeats, horizontal scale, crash recovery.
- **The ABG event log owns actual SYSTEM STATE** — the event-sourcing system-of-record: admitted facts, lineage, provenance, projections, the iteration outcome. This is the domain truth.

These are different *kinds* of log at different layers. Temporal's event history is **execution/orchestration bookkeeping** (which activity ran, what it returned, how it was retried) — an implementation detail of durability. The ABG event log is the **domain record**. They do not compete for the same truth, so there is no rival-truth-surface problem. (Contrast T-149, which was about two rival *next-action* deciders over the *same* domain truth — a different and real problem. Temporal-as-executor is not that.)

## The one constraint that keeps it lawful: the determinism / I-O boundary

Temporal replays workflow code, so workflow code must be deterministic and must not perform I/O directly. Map ABG onto that line and it stays clean:

- **Deterministic ABG decisions → Temporal workflow code.** The iteration-outcome fold, the projections, regime composition — pure functions over rows. These are exactly what Temporal wants in a workflow: replayable, side-effect-free.
- **All I/O → Temporal activities.** F_P/F_H worker dispatch and evaluator dispatch (the `claude -p` calls), and every read/append against the ABG event log, are non-deterministic side effects → activities. Activities are retried, heartbeated, and timed-out by Temporal.
- **The ABG event log remains the sole domain system-of-record.** Activities append admitted events to it and read projections from it; the workflow decides over the rows those activities return. Temporal history must never become a shadow source of domain truth — it records orchestration, not state.

Honor that boundary and the determinism contracts of both engines hold simultaneously: ABG's replay-derived projection truth is the domain state; Temporal's replay-derived orchestration is the durable execution over it.

## Concrete mapping

| ABG concern | Temporal placement |
| --- | --- |
| iteration-outcome fold, projections, regime composition (deterministic) | workflow code |
| F_P / F_H worker + evaluator dispatch (`claude -p`, side-effecting) | activity (retry policy + heartbeat + timeout) |
| event-log append (admit events) / projection read | activity (I/O) |
| per-attempt retry budget, re-entry, bounded-attempt exit | Temporal retry policy + the fold's redispatch outcome (NOT a second hand-rolled brake) |
| worker liveness / inactivity / supervision | Temporal activity heartbeat + start-to-close / heartbeat timeouts (delete the PTY supervisor + liveness observer) |
| horizontal scale | task queues + stateless workers (Temporal Cloud or self-hosted) |

## What ABG can retire by adopting this

The supervised-PTY topology, the runtime-liveness observer (heartbeat-vs-progress), inactivity leases, the retry-frontier/retry-brake machinery, and the no-artifact continuation supervision — all become Temporal primitives. That is the largest single reduction available to the runtime, and it removes the exact surfaces that have generated the recurring production defects.

## Alternative worth naming

ABG is itself a durable-execution engine, so a third path exists: scale it natively — event log + a queue (NATS/SQS) + stateless TS workers + Postgres event store — and skip an external engine. That keeps everything in one stack but means continuing to own the durability/supervision code (the bug class above). If the goal is to inherit battle-tested durability and shed that code, Temporal is the pragmatic, TS-native path. Prefect is the wrong tool for this particular engine either way.

## Net

Temporal for robust graph execution; the ABG event log for actual system state. The only discipline required is the determinism/I-O boundary — deterministic ABG decisions as workflow code, all I/O (including event-log read/append) as activities, and the ABG log as the single domain system-of-record. With that, Temporal is a durability/scale substrate, not a rival truth surface, and ABG sheds its most defect-prone hand-rolled layer.
