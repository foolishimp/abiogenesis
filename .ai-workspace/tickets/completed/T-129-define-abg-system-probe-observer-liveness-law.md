---
id: T-129
title: Define ABG system probe observer liveness law
type: feature
ticket_category: runtime_liveness_observer
status: completed
review_status: completed_abg_substrate_liveness_observer_proof
goal: make every ABG-known runtime system expose probe facts into one observer/liveness projection so watchdog and evaluator decisions are replay-derived rather than caller-local timeout policy
change_intent: Reprice ABG runtime liveness from per-call timeout handling into a system-wide probe -> observer -> evaluator law. Every runtime system ABG knows about must declare a probe surface. Probes publish raw activity evidence only. One ABG observer projection normalizes activity, inactivity, interruption, and evidence. Runtime watchdog/evaluator logic consumes that projection and emits typed continuation, retry, block, or escalation truth.
change_class: requirement_reprice
re_entry_point: requirement
affected_boundary:
  - ABG runtime liveness and progress lease law
  - supervised actor invocation
  - traced process substrate
  - agent actor/worker callout
  - graph-call/frame runner
  - runtime event admission and Event Calculus projection
  - traversal non-progress continuation
  - ABG public runtime projection/export surfaces
  - downstream product live harnesses consuming ABG runtime truth as a separate consumer adoption boundary
priority: critical
release_target: 3.7.1-rc.1
build_tenant: typescript
governance_scope: STDO Method
governance_scope_expansion:
  - S: SPEC_METHOD.md
  - T: TICKET_METHOD.md
  - D: DESIGN_MODULE_METHOD.md
  - O: ODD_METHOD.md
triaged_at: 2026-05-08T15:40:00+10:00
created_at: 2026-05-08T15:40:00+10:00
updated_at: 2026-05-08T19:11:04+10:00
owning_repo: abiogenesis
dependencies:
  - T-106 completed ABG typed traversal non-progress continuation and summary agreement
  - T-108 completed traced process substrate for worker shell-out observability
  - T-115 completed actor/worker call-out event and projection closure
  - T-127 completed generic F_P consciousness loop with GTL plugin overrides
related_tickets:
  - T-128 backlog F_P consciousness runner over admitted construction intent
  - odd_sdlc T-129 ABG 3.7 evaluator substrate migration
candidate_requirement_authority:
  - specification/INTENT.md
  - specification/requirements/abg/REQ-R-ABG3-INTERPRET.md
  - specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md
  - specification/requirements/abg/REQ-R-ABG3-RETRY.md
  - specification/requirements/abg/REQ-R-ABG3-FP-CONSCIOUSNESS.md
related_design:
  - build_tenants/abiogenesis/typescript/design/M03_SUPERVISED_ACTOR_INVOCATION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M03_FP_CONSCIOUSNESS_LOOP_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_FP_CONSCIOUSNESS_LOOP_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/ABG_EVENT_CALCULUS_RUNTIME_LAW_DERIVATION.md
implementation_candidates:
  - build_tenants/abiogenesis/typescript/code/src/shared/traced_process/index.ts
  - build_tenants/abiogenesis/typescript/code/src/shared/abg_library/agent_transport.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/transport/process_actor.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/carriers.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/event_admission.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/event_calculus.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/projection.ts
evidence_refs:
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/comments/codex/20260508T151718AEST_t109_codex53_live_vector_telemetry_root_cause.md
  - /var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/odd-sdlc-ts-live-test-runs/t109_live_installed_data_mapper_pty/20260508T034008771Z_pid71976/step-12-start-derive_aggregate_domain_model_surface.process.json
proof_commands:
  - npm run build:semantic
  - npm run lint:semantic
  - npm run test:t097
  - npm run test:t106
  - npm run test:t115
  - npm run test:t127
  - npm run test:t129
---

# T-129: ABG System Probe Observer Liveness Law

## STDO Triage

### S - Spec Method

First missing layer: requirement.

ABG already states that long-running constructive work is governed by a
progress lease over observable runtime facts, not wall-clock alone. Existing
requirements and designs also cover supervised actor invocation, traced process
observation, typed non-progress continuation, event admission, projection, and
the F_P consciousness evaluator.

The missing requirement is broader:

```text
Every runtime system ABG knows about must expose a declared probe surface.
Those probes feed one ABG observer/liveness projection.
Runtime watchdog and evaluator decisions consume that projection.
No caller, product harness, CLI adapter, or downstream loop owns a rival
timeout/liveness decision.
```

This is therefore a `requirement_reprice`, not a local harness refactor.

Triage update, 2026-05-08:

The clarified activity boundary is broader than transport output. A probe is
any admitted activity signal from ABG runtime systems or from ABG runtime asset
surfaces created by those systems. Event log append, ledger append/update,
manifest creation/update, artifact/report/projection/archive writes, PTY
capture output, stdout, stderr, heartbeat, structured stream activity, and
external interruption evidence all enter through the same liveness observer
law. This remains `requirement_reprice` because it changes the constitutional
meaning of liveness activity, then flows into design, TypeScript realization,
and downstream consumer adoption as separate product work.

### T - Ticket Method

This ticket is the durable work authority for the ABG-level fix exposed by the
odd_sdlc T109 live run. The downstream incident is evidence, not the owning
surface and not a closure dependency. This ticket closes when ABG requirement,
design, implementation, and deterministic/substrate proof agree. Downstream
products consume the published ABG liveness surface through their own tickets.

### D - Design Module Method

The design must preserve one semantic surface:

```text
many probes -> one observer/liveness projection -> one evaluator/watchdog disposition
```

Probe adapters are effect boundaries. They may observe stdout, stderr, PTY
transcript deltas, structured stream events, heartbeat events, event log append,
ledger append/update, manifest creation/update, archive writes,
projection/report writes, process lifecycle, graph-call/frame events, result
artifact writes, external signals, and scheduler state. They must not decide
retry, stop, recovery, escalation, or traversal movement.

The observer projection is a typed carrier and pure replay-derived surface. Any
watchdog action, continuation action, or ABG public runtime summary must derive
from that carrier. Downstream displays may relay this projection, but their
adoption is consumer work.

### O - ODD Method

ABG owns traversal governance, runtime facts, provenance, continuation, and
re-entry. A product command or live harness may provide a safety boundary for a
test runner, but it must not become the product/runtime liveness authority.

In ODD terms, liveness is runtime observation over a graph-function worksite.
It is not local process-manager business logic.

## Observed Incident

The odd_sdlc T109 Codex 5.3 live run advanced through vectors 0-10 and entered
vector 11, `derive_aggregate_domain_model_surface`.

The framework performed several same-edge repairs. The last aggregate attempt
was still producing worker activity when the outer Node live harness killed the
installed `odd-sdlc-ts start` command with `SIGTERM` after a flat 20-minute
`spawnSync` timeout.

The kill was not an admitted ABG runtime decision. It produced no final
postflight, no assurance fold, no liveness projection, and no typed evaluator
disposition. That is the defect.

## Target Truth

ABG publishes a system-wide runtime liveness model:

| Surface | Required truth |
| --- | --- |
| `RuntimeSystemProbeContract` | Declares what probe signals a known system can publish and which invocation/frame/work boundary it observes. |
| `RuntimeActivityProbeObserved` | Raw admitted probe event. It records activity evidence and identity. It does not decide. |
| `RuntimeLivenessObserverProjection` | Replay-derived liveness truth: last activity, active systems, inactive systems, probe coverage, evidence refs, interrupted systems, and current lease state. |
| `RuntimeWatchdogPolicy` | Declared policy over observer truth: inactivity lease, startup silence lease, termination grace, hard safety cap if retained, and terminal disposition rules. |
| `RuntimeInvocationDisposition` | Evaluator/watchdog output: continue waiting, controlled terminate, retry, yield continuation, block, inspect archive, escalate, or reprice policy. |

The default runtime rule is inactivity-based. Any admitted activity from any
declared probe for the active invocation resets the progress lease. Flat
wall-clock timeout may exist only as an explicit outer safety cap and must emit
`runtime_external_interruption_observed` or equivalent typed truth if it fires.

## Runtime Asset Activity Law

ABG liveness is not limited to child-process chatter. Runtime asset creation or
mutation is activity when it is attributable to the active invocation through a
declared probe contract or admitted event.

The minimum asset activity set is:

| Asset surface | Probe meaning |
| --- | --- |
| Event log append | Runtime truth advanced or an append attempt became durable evidence. |
| Ledger append/update | Traversal, retry, payload, obligation, or accounting state changed. |
| Manifest creation/update | Invocation, handoff, install, dispatch, or worksite identity materialized. |
| PTY capture output | Terminal-backed actor activity was observed. |
| Stdout/stderr capture | Local spawned process output was observed. |
| Result artifact creation | Worker produced inspectable output. |
| Projection/report/dossier creation | ABG produced a replay/read surface or closure/gap evidence. |
| Archive/sidecar write | Recovery, trace, transcript, or salvage evidence exists. |
| Heartbeat/status stream | Runtime component is alive without semantic payload output. |
| External interruption | Host, harness, operator, provider, or OS interruption became typed evidence. |

These observations are activity evidence. They are not automatically domain
truth or closure truth. Event admission, ledger law, artifact admission, and
projection law keep their own authority. The liveness observer only folds the
activity evidence into one lease/disposition surface.

## Probe Sources In Scope

ABG-known systems and asset surfaces that need probe contracts include at
minimum:

- local spawned process stdout/stderr
- PTY terminal transcript deltas
- structured agent stream events
- Claude/Codex/Gemini API retry/tool-call observations where available
- actor process lifecycle events
- worker process lifecycle events
- heartbeat events
- runtime event sink append activity
- runtime ledger append/update activity
- runtime manifest creation/update activity
- archive file writes for declared output, report, transcript, trace, or event files
- projection, report, dossier, and public read-model writes
- graph-call/frame/continuation progression events
- result artifact admission attempts
- evaluator/proof/closure fold activity
- scheduler or distributed executor status where present

This list is not a second truth surface. The implementation must consolidate
these into one probe contract registry or equivalent carrier.

## Required Behavior

1. A runtime invocation with ongoing stdout, stderr, terminal transcript, event
   log append, ledger update, manifest update, heartbeat, archive write,
   projection/report write, artifact write, or admitted progress activity must
   not be killed by a flat per-command timeout.
2. A runtime invocation with no activity past the declared inactivity lease must
   emit typed inactivity truth before retry, block, or escalation is chosen.
3. A process externally killed by a harness, host, operator, OS signal, or hard
   safety cap must become typed interruption truth with evidence refs.
4. ABG public runtime projection/export surfaces must expose the same
   liveness/evaluator disposition. Downstream product summaries may consume it,
   but are not closure authority for this ABG substrate ticket.
5. Downstream harnesses may enforce final safety limits only as external
   interruption evidence, not as ABG runtime authority.
6. Retry budget exhaustion must be evaluated before launching another expensive
   worker call.
7. A valid result artifact or report produced before transport failure must be
   deterministically admitted or rejected before non-progress classification.

## Non-Closure Conditions

This ticket is not closed if:

- `spawnSync(... timeout)` or equivalent flat timeout remains the effective
  liveness authority for an ABG-owned runtime invocation.
- A test harness can kill an active invocation without ABG admitting an external
  interruption event/projection.
- A product or CLI adapter recomputes liveness, retry, or timeout outcome from
  local process state instead of consuming the ABG observer projection.
- Probe signals remain scattered across call sites without one projection
  carrier.
- Hard timeout and inactivity timeout are still collapsed into one opaque
  transport failure.
- Activity from one declared probe source is ignored while another probe source
  is watched.
- Activity from ABG runtime assets is ignored while process streams are watched.
- Retry budget exhaustion is visible in a handoff/profile but the runner still
  launches another worker attempt.
- ABG-owned runtime paths still let parent-process timeout become retry, block,
  or failure without typed external interruption evidence.

## Acceptance Criteria

- AC-1: ABG requirements define system probe contracts, liveness observer
  projection, inactivity lease semantics, external interruption truth, and
  watchdog/evaluator disposition ownership.
- AC-2: Design surfaces update T-106/T-108/T-115/T-127 composition so
  per-attempt non-progress becomes one slice of the broader system probe
  observer model.
- AC-3: TypeScript carriers and event admission publish typed probe events and a
  replay-derived liveness observer projection.
- AC-4: Event Calculus or equivalent replay projection derives activity-recent,
  inactivity-exceeded, externally-interrupted, invocation-active, and
  invocation-blocked/continued truth from admitted events.
- AC-5: `traced_process`, `agent_transport`, and supervised actor callout paths
  feed probe events without owning retry or traversal decisions.
- AC-6: ABG contract exports, replay projection, and supervised actor/runtime
  projection surfaces expose liveness and continuation from the one ABG
  projection.
- AC-7: Deterministic tests cover stdout activity, stderr activity, PTY
  transcript activity, event-log append activity, ledger-write activity,
  manifest-write activity, projection/report-write activity, heartbeat
  activity, archive-write activity, structured stream activity, no-activity
  inactivity expiry, external SIGTERM, hard safety cap, artifact salvage, and
  retry-budget exhaustion before dispatch.
- AC-8: Downstream consumer adoption is explicitly out of closure scope for this
  ticket; products must consume or relay the ABG projection through their own
  migration tickets.
- AC-9: Observer projection identity includes enough event/policy/evidence basis
  to distinguish different activity streams with the same activity count and
  lease state.

## Exit Criteria

T-129 can close only when all of the following are true:

1. Requirement text declares runtime asset activity as probe activity and keeps
   the observer projection as the sole liveness/disposition source.
2. Design states the architecture:
   `ABG runtime systems + runtime assets -> probes -> one observer projection -> evaluator/watchdog disposition`.
3. TypeScript carriers admit explicit probe activity from streams, event log,
   ledger, manifest, projection/report, archive, heartbeat, graph-call/frame,
   artifact, and structured stream sources.
4. The observer projection resets inactivity on any admitted activity for the
   active invocation.
5. Flat wall-clock timeout is only an outer safety cap and cannot become retry,
   block, or failure without typed external interruption truth.
6. ABG watchdog/evaluator-facing exports and supervised actor runtime
   projection surfaces expose the observer projection instead of recomputing
   liveness from local process state, file polling, transcript text, or harness
   timers.
7. Focused T-129 tests and adjacent T-097/T-106/T-115/T-127 tests pass.
8. The ticket records downstream live-harness migration as consumer adoption,
   not as ABG substrate closure proof.

## Resolved Design Decisions

- Probe contracts live as one M03 runtime carrier family. Existing actor,
  process, graph-call, frame, and asset events may normalize into that carrier,
  but they do not form separate liveness authorities.
- Explicit `runtime_activity_probe_observed` events require a matching declared
  `RuntimeSystemProbeContract` before the liveness observer will consume them.
  Legacy actor/process events may still normalize into liveness rows for
  backwards replay, but they are not a substitute for explicit probe contracts
  on new probe activity.
- Archive-write, ledger-write, manifest-write, event-log append, and
  projection/report-write activity may be admitted as explicit probe events or
  normalized from already-admitted runtime events. Either route must produce the
  same observer row shape.
- Inactivity lease is the normal liveness policy. Hard safety cap is an outer
  interruption boundary. Without typed interruption evidence it can only project
  `controlled_terminate` with `requiresExternalInterruptionEvent`, not a final
  retry/block/failure disposition.
- The F_P consciousness evaluator may consume liveness disposition as
  construction pressure. It must not recompute liveness.

## Current Evidence

2026-05-08 focused deterministic proof:

- `npm run build:semantic`: passed.
- `npm run lint:semantic`: passed after removing stale assertion-form lint debt
  in T-127/M04 helper code.
- `npm run test:t097`: passed.
- `npm run test:t106`: passed.
- `npm run test:t115`: passed.
- `npm run test:t127`: passed.
- `npm run test:t129`: passed with focused coverage for runtime asset probes,
  probe-contract enforcement, admitted sensor activity resetting an otherwise
  expired inactivity lease, hard-cap controlled termination, legacy null-time
  activity expiry, typed interruption emission, artifact salvage, and projection
  identity.
- `npm run test:t058`: passed as M04 gaps regression after lint cleanup.
- `npm run test:semantic`: passed, 488/488 after the focused sensor-reset
  regression.
- `git diff --check`: passed.

Closure disposition:

- The ABG substrate closure surface is complete for this ticket.
- Downstream odd_sdlc T109 adoption remains related consumer work and must not
  be used as this ticket's closure authority.

## Consumer Adoption Follow-Up

- What is the migration sequence for downstream products that still have parent
  harness timeouts before they can consume ABG liveness truth directly?

## Executed Work Plan

1. Update ABG requirement text for system probes and observer-owned liveness.
2. Reconcile the M03 non-progress and traced-process designs into the broader
   probe observer model.
3. Add TypeScript carriers/admission/projection for probe events and liveness
   projection.
4. Wire existing traced process and actor/worker callout paths to publish probe
   truth.
5. Replace remaining flat timeout authority in ABG-owned live paths with
   inactivity lease projection.
6. Record downstream odd_sdlc migration as related consumer work, not an ABG
   substrate closure dependency.
