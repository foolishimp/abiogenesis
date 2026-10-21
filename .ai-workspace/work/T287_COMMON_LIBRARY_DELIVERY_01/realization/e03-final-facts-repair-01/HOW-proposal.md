# E03-L5-01: final physical facts before semantic Process terminality

Status: bounded HOW proposal for Executive selection. This cut changes records only. No implementation, execution or acceptance is claimed.

## Owning contract and causal correction

The Product remains the fixed fifteen families: GTL is the sole language, HoG traverses it, and ABG alone admits runtime truth. Product Execution/Admission (681–704), HANDLERS-002/003/006/008, TRANSPORT-002/003/010–019 and PROJECTION-002/025 govern this cut. Accepted L2 §4 separates direct exit, group/direct-child absence, no-child launch failure, close, disposal and first error. The accepted terminal-quiescence design binds four immutable posts; its final overlay `49ca598c…` explicitly makes `actor_process_exited` confirmed Process terminality. The prior `d3dabca8…` repair permits later genuine confirmation after uncertainty. Their exact bytes and the L2 contract verify in `input-pins.json`.

The current worker forwards direct exit to actor admission before shared cleanup finishes. If an asynchronous stream/observer error occurs, ordinary callbacks stop; `onUnconfirmed` can be suppressed and `runProcess` throws before its final facts reach the actor. The actor catch can then use the early confirmation flag to admit terminal failure. Independently, an intermediate prefix already projects the raw exit as confirmation. This is a physical-observation to ABG-admission handoff error; successful common cleanup tests did not prove that exception and intermediate-prefix relation. The old fixtures that call a semantic exited row a leader fact are part of the same error, not an oracle to preserve.

Reconcile the owning HOW explicitly: **raw child exit ends worker result capture; only final owned-scope absence plus direct exit can supply `actor_process_exited`.** No new event, event payload, runtime, cleanup algorithm or shadow physical state is required. Keep the accepted immutable posts unchanged; select a compact clarification on `T287_TERMINAL_QUIESCENCE_OWNER_NETWORK_ACCEPTED_DESIGN.md` referencing this exact proposal, L2 and the four-post composition.

## Canonical handoffs

| Source owner/carrier | Transformation | Destination owner/carrier |
|---|---|---|
| `shared/owned_process_lifetime.ts::completion: Promise<OwnedProcessFacts>` | Await exactly once; hand back the same frozen facts object through one internal `WorkerProcessObserver.onProcessFinalized(facts: OwnedProcessFacts)` callback, outside ordinary `lifetime.observe` | `actor_process.ts` receives the canonical imported type, not a duplicated interface or wrapped error |
| Raw lifetime `onExit(status, signal)` | Cancel capture leases, fix result-bearing stdout and close owner capture at direct exit; no semantic Process event | Existing private worker capture/`ProcessObservation` |
| Final facts with `scopeAbsence === "absent"`, non-null `directExit`, and one admitted start | Existing actor owner appends exactly one `actor_process_exited`, mapping only its existing status/signal payload | Existing admitted `RuntimeEvent` and its durable successor prefix |
| Final facts with `noChildEstablished` and non-null `launchFailure` | Existing actor owner appends `actor_process_spawn_failed`; this is distinct from exited/`terminationConfirmed` | Existing no-child Process terminal variant |
| Final facts with present/unknown scope, or absent scope without the required direct-exit/no-child relation | Retain facts; append existing `actor_process_termination_unconfirmed` where the existing actor/process relation permits; return the existing non-admitted/refusal route | No confirmed Process terminal, Actor terminal, retry or closure inferred |
| Exact pre-spawn preparation or synchronous spawn refusal, before any child is established | Existing `onSpawnFailed` is invoked only inside the transport's explicit pre-launch boundary, carrying its existing diagnostic; do not manufacture `OwnedProcessFacts` | Existing no-launch Process terminal, never inferred from a missing start callback |
| Confirmed admitted Process terminal | Existing actor owner may admit its existing terminal row; normal success/failure still consumes the actual artifact event | Existing actor lifecycle and ABG Event Calculus |
| Existing closed durable prefix/reopen authority + `installedPackageRoot` | Fresh proof consumer imports the exact installed shared lifetime for both sequential workers; optional retention affects only evidence writes | Existing fresh projection results and exact retained/fresh equality oracle |

`OwnedProcessFacts` is the canonical shared type. `WorkerTransportResult`, `ActorProcessObservation`, existing event contracts and fresh-worker input/result meanings remain unchanged. The observer change is an internal owning handoff, not a new Product API or persistent carrier. Both worker entry routes converge on the same implementation.

```mermaid
sequenceDiagram
  participant C as Child and streams
  participant L as Owned lifetime
  participant W as Worker transport
  participant A as Actor owner
  participant B as ABG and replay
  C->>L: direct exit; optional stream error
  L->>W: ordinary raw exit callback if still enabled
  Note over W: Close capture, no semantic exit admission
  L->>L: bounded cleanup, probe, drain, disposal
  L-->>W: canonical final OwnedProcessFacts
  W->>A: final facts handoff, even after firstError
  alt owned scope absent and direct exit
    A->>B: confirmed Process exited
  else proven no child
    A->>B: Process spawn failed
  else unconfirmed
    A->>B: existing termination unconfirmed
  end
  W-->>A: original firstError or existing transport result
  Note over A,B: Actor terminal requires admitted confirmed Process witness
```

## Error and admission order

1. Keep shared lifetime error collection, inert tail guards, timers, probe/escalation/drain bounds and ordinary-callback suppression unchanged. Final facts are an ownership handback after completion, not renewed ordinary stream callbacks or authority to restart work.
2. Worker calls the final observer once after `completion`, before any `firstError` throw or post-process parsing. If the observer throws, retain that error separately: the original non-null `facts.firstError` wins by object identity; otherwise propagate the final observer error. Never wrap, overwrite or attach invented outcome fields to the original Error.
3. Actor records the exact final facts before attempting admission. Replace early `processTerminalConfirmed` inference with the actual successfully admitted Process terminal witness. Record that witness only after append succeeds. A failing append cannot license an Actor terminal. The actor's terminal-error admission must not replace the first transport/owner failure if its own admission throws.
4. Retire actor catch synthesis from `!processStarted` and the post-result negative-status fallback. Missing start admission or missing completion is not proof of no child. In particular a start-observer failure after physical launch cannot become spawn failure. Explicit pre-launch preparation failures retain their existing no-launch route through the transport-owned boundary; errors after `runProcess` begins must never enter it.
5. If a child existed but its start admission failed, retain the original failure and final physical evidence without fabricating a start or no-child terminal. A failed/unknown semantic admission remains non-admitted even when cleanup was physically successful.
6. Normal artifact observation remains after successful physical handback. Its `terminationConfirmed` continues to be the owner projection of final facts; the actor terminal continues to consume the actual artifact event. Error paths create no Result, successful exchange or synthetic artifact. Post-process parse/archive errors may close the actor only when the already-admitted Process witness establishes actual absence.

## Retire the contradictory inference, retain history

`actor_process.ts::projectActorProcessLifecycle`, `replay.ts::projectRuntimeActorProcessFields`, `runtime_liveness.ts` and `event_calculus.ts` must agree on the existing confirmed-event meaning. Prior to that event, raw leader exit changes no ABG Process-live/confirmation fact. Unconfirmed scope keeps live/pending cleanup; Run failure alone never proves absence.

A later genuinely confirmed Process terminal discharges physical-live uncertainty and `actor_cleanup_live`, while `actor_cleanup_pending` remains until the lawful Actor cleanup terminal. Remove the incremental EC `unconfirmedProcesses`/`unconfirmedFacts` retention and fork side channel, and its special veto of confirmed exit. Remove the analogous replay/liveness “any historical unconfirmed row overrides confirmed exit” inference. Project current unresolved uncertainty only while confirmed terminality is absent. Preserve the unconfirmed historical row/fluent and all exact cardinality, prefix, causation, cleanup-token and cold/incremental laws.

**Physical cleanup never restores old worksite currentness.** An authenticated U1 unknown-effect cause still withdraws the exact prior C0 observations. Later absence/Process/Actor terminality does not remove that withdrawal. Only the existing lawful fresh observation/successor can establish new currentness. Reuse the existing targeted U1 scope/cold-prefix case to prove this invariant; do not start a new campaign.

No old event log is rewritten or reinterpreted by a compatibility branch. No historical Run or migration is selected. This proposal repairs the producer and the affected current computation on a new candidate; old frozen evidence keeps its original subject and limits.

## N3: one fresh-worker lifetime path

In `test_env/support/fresh-process-runtime-proof.mjs`, delete `runFreshWorker` (manual timer/direct SIGKILL/early rejection) and its conditional selector. Make the existing installed-common-lifetime runner the sole path. Keep `ownedProcessProof` as optional evidence retention only, preserving its existing caller shape and all twelve call sites without requiring new configuration. With retention absent, omit only directory/file writes. Import only from the caller's explicit installed package root; no ambient/main fallback.

Each worker retains the existing 30,000 ms deadline, 1,000 ms grace and bounded drain, detached POSIX group/direct-child Windows ownership, first error, and await-final-completion-before-return/reject rule. Unknown scope stops before the second worker. Add the already selected N2 equality between actual `child.pid` and decoded `result.processId` before accepting each result; keep different-parent/different-worker identity, digest and projection equality. The durable worker's own normal `finally` stays unchanged. No other parallel helper or timeout framework is selected.

## Proposed territory and finite proof

The exact file/expectation map and nine direct fresh-proof callers are in `retirement-and-proof.md`. Production proposal is five ABG owner files; shared lifetime and U1 task/currentness owner stay read-only. One owning design surface, one existing proof support and the named affected tests are proposed. No source mutation is admitted by this preparation.

Implementation preflight must bind these exact preimages, the HOW selection, emitted-source correspondence and a new isolated dependency/candidate basis. Reuse existing controlled clock/child and actor-owner fixtures. Controlled present/unknown results are labelled controlled; never create an unkillable physical process. Existing finite real EPIPE/no-child evidence supports the unchanged mechanism only, not the new ABG handoff. The affected actor/worker proofs and fresh closed read must establish the new relation; later installed P5 remains separately selected after its candidate and timeout disposition.

Stop at the first new failed prerequisite or unexpected relation; preserve inputs, original error, prefix and physical facts before any cleanup. Unknown real process scope stops dependent work. No blind retry, bound increase, paid provider, whole-suite alias, historical migration or self-acceptance. Return an exact source/evidence successor to Executive; independent review and L5 remain separate.
