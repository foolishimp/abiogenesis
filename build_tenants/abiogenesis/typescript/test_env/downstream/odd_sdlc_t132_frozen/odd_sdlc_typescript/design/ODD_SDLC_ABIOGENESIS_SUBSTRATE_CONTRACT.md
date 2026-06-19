# odd_sdlc TypeScript ABIogenesis Substrate Contract

**Status**: Active
**Date**: 2026-05-08
**Authority**: T-028, T-129

## Claim

`odd_sdlc.TS` consumes ABIogenesis TypeScript as runtime substrate. It does not
own GTL carrier admission, ABG execution basis law, runtime event families,
replay projection, iteration selection, advancement transitions, or traversal
structure probes.

## Binding

| Surface | Binding |
| --- | --- |
| Package | `@abiogenesis/typescript-tenant` |
| Version | `4.1.0-rc.2` |
| Dependency form | release snapshot package dependency |
| odd_sdlc role | domain product over ABIogenesis substrate |
| ABIogenesis role | GTL/ABG carrier and runtime truth authority |

## Adapter Boundary

The TypeScript tenant may construct SDLC-owned graph functions and modules, then
admit them through ABIogenesis public carriers:

```text
SDLC graph function -> ABIogenesis Module -> ABIogenesis ExecutionBasis
ExecutionBasis + RuntimeEvent replay -> ABIogenesis projection and transition
```

The TypeScript tenant must not:

- define local runtime event families
- choose the next vector from local controller state
- treat local orchestration state as runtime truth
- copy ABG projection or iteration mechanics
- fork GTL carrier admission
- own framework-level agent process execution, Claude stream-json parsing, or
  PTY terminal execution semantics

## Initial Proof Basis

The first proof graph function is intentionally small:

```text
ODD_SDLC_SUBSTRATE_PROBE:
  SdlcWorksite -> SdlcWorkReport
```

It validates that SDLC-owned type names can be carried through GTL and admitted
into one ABI `ExecutionBasis`.

## Source Assumptions

The adapter relies on ABIogenesis TypeScript evidence:

- `T-060`: missing compute basis fails closed
- `T-065`: traversal structure probe exposes deterministic diagnostic evidence
- `T-066`: ABG internal control loop owns iteration sufficiency
- `T-156`: consequence traversal eligibility is catalog-admitted from GTL
  declarations and statically validated by `typecheckGtlProgram(...)`
- `T-158`: plugin result-interface declarations are statically validated by
  `typecheckGtlProgram(...)`; the compiler-admitted result-interface catalog
  is the runtime handoff, and runtime plugin result envelopes are admitted and
  replay-visible through ABIogenesis rather than reimplemented in SDLC
- `T-159`: `TraversalUnit<A, B>` is the closeable product traversal atom
  projected by `typecheckGtlProgram(...)`; consequence is the bind boundary and
  SDLC must not replace the projection with a local closure-state enum,
  replay-refresh loop, continuation transition, or next-action router

These assumptions are dependencies, not copied law.

## ABIogenesis Runtime, Temporal, Process Callout, Defaults, Evaluator, And Liveness Substrate

As of ABIogenesis `4.1.0-rc.2`, worker process execution remains substrate-owned, the
first ABG defaults bundle slice remains visible installed configuration, and
temporal/time-related runtime truth is ABG-owned event and replay projection
truth. ABIogenesis publishes the T-127 F_P construction evaluator substrate:
construction observation snapshots, action catalog rows, observation-to-action
binding, configured priority and affect adjustment, and the construction
priority projection. The runtime line adds the T-129 system probe observer liveness
substrate: declared runtime probes, typed external interruption events,
`RuntimeLivenessObserverProjection`, and replay-derived runtime invocation
disposition.

`odd_sdlc.TS` admits SDLC worker bindings such as `process://claude`, derives
SDLC handoff manifests and domain postflight projections, then lowers the
process call to ABG traced actor/worker callout semantics.

ABG owns:

- Event Calculus law over admitted runtime events and replay-derived `HoldsAt`
  truth
- F_P construction evaluator carrier admission and projection truth
- read-only public gaps evaluator ranking over typed asset gaps and lawful
  candidate graph actions
- consequence allowed traversal catalog derivation, runtime admission, and
  static GTL annotation validation for traversal-family declaration keys
- construction observation snapshots, action catalogs, binding projections,
  priority schemes, affect policies, and construction priority projections
- declared runtime system probe contracts and
  `runtime_activity_probe_observed` event truth
- `runtime_external_interruption_observed` event truth for host signals,
  harness safety caps, and typed interruption evidence
- `RuntimeLivenessObserverProjection` as the sole liveness, inactivity,
  timeout, continuation, retry, block, and interruption disposition projection
- GTL temporal syntax through
  `GraphVector.declarations["abg.temporal_constraint"]`
- timer intent, timer outcome, deadline breach, and scheduled continuation
  carriers and admitted runtime events
- replay-derived temporal projection rows for eligibility and deadline breach
  truth
- homeostatic temporal drift/deadline pressure over replay-derived temporal
  rows
- `runAgentActorWorkerCallout`
- `TracedProcessOutcome`
- `local-spawn` and `pty-terminal` executor profiles
- Claude stream-json parsing
- api-retry, tool-call, and structured-parse observations
- trace archive paths
- hard safety cap, inactivity lease, executor-unavailable, launch-failed, and
  lost-terminal process outcomes and liveness evidence
- successful PTY `terminalSessionId` on `actor_process_started` event and
  projection truth
- installed `.abiogenesis/config/abg.config.json` and the shipped ABG config
  bundle for plugin traversal observer defaults
- `plugin_traversal_prompt_materialized` event truth when ABG observer fallback
  or GTL observer bindings are explicitly activated

`odd_sdlc.TS` may preserve worker archive filenames as archive
read-models, but their process facts are projections over ABG trace truth.

`odd_sdlc.TS` must not collapse the hard safety cap and inactivity lease into a
single local timeout. The installed operator may pass a hard safety cap into the
ABG process actor, but liveness, reset, interruption, retry, continuation, and
block meaning must be read from ABG runtime activity/interruption events and the
ABG `RuntimeLivenessObserverProjection`. Worker summaries and postflight
details may relay that projection; they do not become a second liveness
interface.

`odd_sdlc.TS` may project SDLC domain gap dossiers, repair schedule rows,
assurance findings, and traversal strategy labels into ABG construction
observation/action/policy carriers. It must not use those read models to create
a second ranking authority. Where odd_sdlc renders a next asset, action, graph
function, graph vector, repair route, or bootstrap induction preview, that view
must either carry an ABG `ConstructionPriorityProjection` source reference or
explicitly declare that it is a narrower non-ranking preview.

`odd_sdlc.TS` does not own a local wall-clock, timer, schedule, deadline, or
temporal continuation controller. Provider receipts, queue callbacks, cron
payloads, or terminal-local timing facts do not authorize temporal truth until
ABG admits the corresponding runtime event and replay derives the projection.
Temporal eligibility or schedule pressure does not close vectors or advance
graph traversal by itself; only ABG traversal/runtime events and replay
projection can do that.

The consumed ABIogenesis substrate does not claim recurrence, window policy, cloud durable timer
provider semantics, sticky sessions, warm pools, or automatic session affinity.
odd_sdlc must not project any of those as product capability through this
migration.

The consumed ABIogenesis substrate does not claim automatic installed construction
runner. The evaluator projection can rank the next lawful construction action;
it does not itself start work, append runtime events, dispatch workers, or own
retry iteration. odd_sdlc installed runner bridges that remain before ABG T-128
must be treated as temporary invocation adapters, not ranking truth.

The consumed ABIogenesis substrate now admits runtime start traversal selections
through `StartIntent.runtimeTraversalSelections`. `odd_sdlc.TS` may derive a
steel-thread or bounded dependency window from SDLC requirement/module/test
dependency maps, but it must pass the selected schedule refs to ABG as
run-scoped start truth. It must not rebuild GTL module declarations, duplicate
edge-name lists, or hide a strategy switch inside the consequence plugin to
choose the runtime slice.

The static fallback plan remains a default declaration surface only. It is used
when no matching runtime start selection and no ABG edge directive exists. When
ABG supplies a runtime start envelope or edge strategy directive, that ABG
selection is authoritative over the odd_sdlc fallback. Targeted repair enters
as ABG-visible repair/reentry truth, not as an adapter-local override of an
explicit ABG selection.
