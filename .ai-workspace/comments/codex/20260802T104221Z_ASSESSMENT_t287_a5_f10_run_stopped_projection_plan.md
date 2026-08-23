# T-287 A5-F10 Stopped-Run Projection Assessment And Coding Plan

Status: frozen worker assessment and coding-plan subject for independent
review. This post is commentary. It authorizes no implementation, test,
fixture, proof, GOALS, ticket, design, or schema edit.

Assessment time: `2026-08-02T10:42:21Z`

## Checkpoint Transition

The first A5-F10 Run-lifecycle `HoldsAt` slice was accepted and checkpointed
before this assessment.

```text
repository: /Users/jim/src/apps/abiogenesis-5-root-build
branch: codex/t287-wave1
checkpoint commit: 1f6a86074bf995763b4caff286422b5b1501374b
checkpoint tree: cc456acb1eadd74f58e250ceac467d76df30d52e
accepted final-correction transition blob: 0ae2fae846736fa928f05cdc7da1f727d844479e
```

The checkpoint contains the current Wave 1 authority, realization
constitution, exact accepted code/tests/generated proof, and current control
trail. Eight unrelated older July commentary files remain untracked and were
not included.

## Selected Frame And Re-entry

The selected Product feature is `A5-F10`. The selected entity remains the
already-registered Run. No new entity row or Product meaning is required.

The smallest lawful re-entry is `realization_refactor`: complete the existing
stopped-Run projection and migrate its one durable Public consumer. This does
not change the Run identity, state set, transition graph, admission owner,
durable event family, or terminal law.

The exact acceptance interval is:

```text
one admitted run_stopped event
  -> existing run_terminal(runId) Event Calculus truth
  -> exact typed replay state and provenance
  -> durable gap-reopen Public validation
```

The slice ends at that consumer. It does not close `A5-F10` or Phase 1/2.

## Governing Relation

The realization constitution Run row fixes:

```text
identity: exact admitted runId
states: not_open | active | closed | stopped | failed
admission: ABG runtime-event admission
durable stopped fact: run_stopped
projection: typed HoldsAt over one validated immutable prefix
terminal law: a terminal Run is not active
```

The current closed Event Calculus already implements the exact stopped effect:

```text
run_stopped(runId)
  -> initiates run_terminal(runId)
  -> terminates run_active(runId)
  -> terminates the declared subordinate active fluents
```

This slice does not rename `run_terminal`, add a second `run_stopped` fluent,
or change any effect. `run_terminal` is the existing stopped-state fluent;
`run_closed` remains distinct.

## Current-Code Assessment

### Retain

- `abg/event_store.ts` owns the closed `run_stopped` envelope and disposition
  contract, ordinal assignment, durable append, reopen, and snapshot.
- `abg/event_prefix.ts` selects the validated immutable run-local prefix.
- `abg/event_calculus.ts::eventCalculusEffect` already maps
  `run_stopped` to `run_terminal(runId)` and terminates `run_active(runId)`.
- `abg/replay.ts` already derives one Event Calculus projection from the same
  selected prefix and carries `runStoppedEventRef` and
  `runStoppedDisposition`.
- `abg/traversal_route.ts` remains the only current producer of
  `run_stopped`; it appends the stop after the exact admitted terminal route.
- the existing `PublicGapAuthority` remains the durable carrier. No carrier or
  schema change is required.

### Tighten

`abg/replay.ts` currently assigns stopped runtime status from
`events.find(kind === "run_stopped")`, while the same replay has already
derived the authoritative Event Calculus projection. It must instead require
`HoldsAt(run_terminal(runId))` and project one exact stop row only for its
event reference, disposition, and causal provenance.

Replay must fail closed if a selected Run contains more than one
`run_stopped` row or if its one stop row does not correspond to the held
`run_terminal(runId)` fluent and the exact replayed route named by its payload
and causation. This makes the replay carrier sufficient for its direct Public
consumer without creating a generic registry or alternate lifecycle fold.

### Delete

`public/operations.ts::reopenGapAuthority` reopens the store, calls replay,
and then independently executes `reopened.store.readAll().find(...)` to
rediscover the same stop event and decode its disposition and causation. That
second mutable-store scan is a competing stopped-Run projection. Delete it.
The function retains its exact Product, install, workspace, catalog, route,
gap, replay status, stop reference, and disposition checks.

## Donor Assessment

```text
immutable v4.6.0-rc.3 commit: f4f081f66ef8d3ce0c737ddb9d7530176711279a
immutable v4.6.0-rc.3 tree: 4df9f03adabc7bdaee211a145490768095d21e6c
rejected dual-Public donor: 935b11dd63721b8ba135045580fa5d6c38b85f03
rejected W1.1a donor: 96b131c1b38f62caac73199e6d6313afd4499b19
current 5.0 recovery evidence: 1b8b2b0a22ad5dc484e3db5c19fd562cd7935ff8
```

- Immutable 4.6 supplies the typed immutable Event Calculus carrier, fold,
  and `HoldsAt` algorithm already adopted by the accepted first slice. Its
  Product vocabulary does not contain the current 5.0 `run_terminal` relation.
- Current 5.0 and the rejected dual-Public donor contain the same accepted
  `run_stopped -> run_terminal(runId)` effect. Retain it unchanged.
- Current 5.0 and donor history contain the same `reopenGapAuthority` raw stop
  scan. It is evidence of the competing path, not transplantable code.
- Rejected W1.1a offers no superior stopped-Run adapter or replay projection.
- No external dependency is relevant. Native immutable values plus the
  accepted Event Calculus and replay blocks are sufficient.

Disposition: retain the accepted 5.0 effect and replay carrier, extend the
existing typed owner adapter, tighten replay, and delete the duplicated Public
scan. No donor file is transplanted.

## Authority And Composition Ledger

| Relation | Owner | Input authority | Output | Consumer | Prohibited substitute |
|---|---|---|---|---|---|
| stop proposal | HoG/traversal relation | admitted result, judgment, route basis | typed terminal route candidate | ABG traversal-route admission | Public or replay proposing a stop |
| stop admission | ABG | exact admitted route and basis | one durable `run_stopped` | prefix selection | caller-held stopped state |
| stopped truth | closed Event Calculus | validated immutable prefix | `HoldsAt(run_terminal(runId))` | replay | event-kind absence/presence as currentness |
| stopped replay | ABG replay | same prefix, held fluent, exact stop row and route | event ref, disposition, runtime status | Public gap reopen/outcome | second store scan |
| gap reopen validation | Public owner port | durable authority plus reopened replay | accepted/refused owner result | gap read/re-entry | direct raw-event projection |

## Exact Coding Plan

No production or test item below is authorized until independent assessment
is appended.

### 1. `code/src/abg/event_calculus.ts`

- Add `constructRunTerminalFluent(runId)` as the typed ABG Run adapter over
  the existing common fluent constructor.
- Preserve `ROOT_EVENT_CALCULUS.run_stopped` and
  `eventCalculusEffect("run_stopped")` byte-for-byte in meaning:
  `run_terminal(runId)` is initiated and `run_active(runId)` is terminated.
- Add no event, fluent name, axiom override, store access, or caller-selected
  law.

Catalog classification: `catalog_extension` of the accepted typed Event
Calculus adapter family. The common key/fold/query kernel is reused unchanged.

### 2. `code/src/abg/replay.ts`

- Import the stopped-Run constructor.
- From the already selected `events` value, require zero or one
  `run_stopped` row for the selected Run. More than one fails closed.
- Query the already-derived `eventCalculus` with
  `holdsAt(eventCalculus, constructRunTerminalFluent(runId))`.
- Require exact agreement between the held fluent and the one projected stop
  row. A stop row must name one replayed route by `payload.routeRef`, and its
  causation must contain that route's admission event reference.
- Retain `runStoppedEventRef` and `runStoppedDisposition` as the stable replay
  surface. Derive stopped/gap-stopped/blocked/failed status only when the
  stopped fluent holds and the exact stop row is valid.
- Preserve failure, closed, invocation-refused, held, active, and workspace
  precedence and shapes except that contradictory stopped provenance now
  fails closed instead of being silently selected by `find`.
- Add no store read, append, mutable registry, or second fold.

### 3. `code/src/abg/index.ts`

- Export `constructRunTerminalFluent` beside the accepted active and closed Run
  adapters.
- Export no mutable projection, generic lifecycle registry, or axiom authority.

### 4. `code/src/public/operations.ts`

- In `reopenGapAuthority`, delete the direct `reopened.store.readAll().find`
  stop lookup and local stop-payload decoding.
- Delete the resulting `stopEvent` and `stoppedDisposition` checks.
- Retain the exact route selection and all Product/install/workspace/catalog
  bindings.
- Require the reopened replay's exact `runStoppedEventRef`,
  `runStoppedDisposition`, and stopped runtime status to match the durable gap
  authority and replayed no-action route. Replay owns the route-to-stop causal
  validation.
- Change no Public operation, request, response, authority-carrier, or schema.

### 5. `test_env/tests/m5-event-calculus-runtime.test.mjs`

- Extend the existing `run_stopped` case to prove the exact Run holds
  `run_terminal(runId)` and no longer holds `run_active(runId)`.
- Reopen the durable log in a fresh context and prove equal stopped truth,
  replay stop reference/disposition, and runtime status.
- Add one malformed-history negative that supplies a second stopped event for
  the same Run and proves replay refuses rather than selecting one row.
- Preserve the existing throw-before-memory/durable-append runtime-failure
  assertion.

### 6. `test_env/tests/m5-installed-external-product.test.mjs`

- Use the existing installed fresh-context gap read/re-entry scenario as the
  direct composition proof.
- Add assertions that the durable source stop reference and disposition agree
  with the reopened status projection before re-entry.
- Retain the existing wrong-workspace, wrong-Program, non-gap-route,
  reduced-ProductSet, wrong-gap, duplicate-consumption, and stale-read
  negatives. Add no new fixture family.

### 7. Exact-candidate derived evidence

Because production package bytes change, regenerate only through repository
scripts/tests:

- `test_env/fixtures/abi5-root-candidate-basis.json` via
  `scripts/refresh-candidate-basis.mjs`;
- the tracked `test_env/proof/abi5-root-r10*` family via
  `r10-installed-cli-outcome.test.mjs`; and
- any directly derived governor digest that those deterministic commands
  rewrite.

No generated file is hand edited. `package.json` changes only if a required
existing script is absent; the current scripts are sufficient, so no package
edit is planned.

## Required Verification

```text
npm run build
npm run test:m5:event-calculus
npm run test:m5:external
npm run test:r10
node test_env/falsifiers/runtime-lanes.mjs
npm run test:m5
git diff --check
```

The worker records exact candidate artifact, Product-content, manifest, and
proof digests after deterministic regeneration. The full M5 gate must remain
green because replay status and its serialized digest are cross-cutting.

## Explicit Non-goals

- no Product, requirement, GOALS, ticket, or design change;
- no event kind, event contract, effect-table, fluent-name, or durable-carrier
  change;
- no catalog, artifact, invocation, continuation, retry, C-call, judgment,
  closure, actor, graph, frame, or locus entity work;
- no migration of `public/outcome.ts` transient-fluent prefix logic;
- no general registry, ledger, state-machine, controller, or framework;
- no Public operation, contract, schema, SDK, or CLI change;
- no external dependency; and
- no claim that this slice accepts `A5-F10`, Phase 1, Phase 2, or Wave 1.

## Worker Verdict

- Design: accepted authority is decision-complete for this stopped-Run seam.
- Constructability: accepted current blocks are sufficient; no donor or
  external addition is required.
- Plan: bounded to four production files, two test files, and deterministic
  exact-candidate evidence.
- Advancement: held pending independent assessor disposition.

## Assessor Disposition

Reviewed independently by `/root` against the frozen subject at blob
`07daf1c87b1f733b244afd23b106154ca86a8d3e`.

### Verdict

**PASS.** The exact stopped-Run projection plan is approved for implementation
and proportional proof.

### Binding implementation constraints

- Replay must use its already-selected validated prefix and Event Calculus
  projection.
- Zero stop rows is valid exactly when `run_terminal(runId)` is absent; one
  stop row is valid exactly when it is present.
- The one stop row must match the selected Run identity, exact `routeRef`,
  causation, and disposition. Duplicate or contradictory stop histories fail
  closed.
- `Public::reopenGapAuthority` consumes replay only and performs no raw store
  scan for stopped-Run truth.
- The duplicate-stop negative constructs deterministic invalid durable history
  without a production bypass or caller axiom.

The frozen scope and non-goals remain binding. Implementation may proceed.
