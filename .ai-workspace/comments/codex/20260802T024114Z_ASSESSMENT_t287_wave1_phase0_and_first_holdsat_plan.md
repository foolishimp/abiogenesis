# T-287 Wave 1 Phase 0 Assessment And First HoldsAt Coding Plan

Status: commentary transition artifact for independent review. This post is not
specification, requirement, design, ticket authority, implementation, test
evidence, or implementation authorization.

Assessment time: `2026-08-02T02:41:14Z`

## Scope And Re-entry

The active reference frame is T-287 Wave 1. The selected Product features are,
in order, `A5-F10`, `A5-F02`, `A5-F03`, and `A5-F04`. The selected work was a
read-only Phase 0 assessment of immutable 4.6, the current 5.0 tree, accepted
5.0 donor cuts, and bounded established external options. It did not authorize
production, test, design, specification, GOALS, or ticket changes.

The smallest lawful re-entry point remains the accepted T-287
`implementation_migration` under the existing `goal_reprice`. The recommended
first slice is a realization change inside the selected TypeScript design. It
does not change Product meaning or design topology.

## Governing Basis

- Workspace method: `/Users/jim/src/apps/AGENTS.md` and upstream shared method
  under `specification_methodology/specification/standards/`.
- Selected installed method: immutable STDO `v2.2.2`, as fixed by
  `specification/GOALS.md` and T-287.
- Product law: `specification/PRODUCT.md`, especially `A5-F10` event-sourced
  runtime truth.
- Requirements: `REQ-R-ABG3-EVENTS`, `REQ-R-ABG3-PROJECTION`, and
  `REQ-R-ABG3-CONTINUATION`.
- Operative design selector:
  `build_tenants/abiogenesis/typescript/design/README.md`.
- Selected S03 design basis: accepted M03 and M05 Sections 1 through 12 at
  candidate `8865ccff`.
- Selected S05 design basis:
  `build_tenants/abiogenesis/typescript/design/M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN.md`,
  accepted design basis `283325aa` and realization basis `1ddc802d`.
- Immutable implementation reference: annotated tag `v4.6.0-rc.3`, peeled
  commit `f4f081f66ef8d3ce0c737ddb9d7530176711279a`, tree
  `4df9f03adabc7bdaee211a145490768095d21e6c`.

### Withdrawn authority blocker

The earlier assessment that Phase 0 was globally blocked by held common design
is withdrawn. That conclusion treated
`build_tenants/common/typescript/design/README.md` as the operative tenant
selector. It is not. The TypeScript ABIogenesis tenant index explicitly selects
the accepted S03 M03/M05 Sections 1 through 12 and the accepted S05 replacement
design. It also classifies other tenant and common design files as evidence
unless selected. The held common design therefore does not erase the accepted
tenant basis and does not block this bounded realization plan.

## Recursive Functional Composition

```text
Wave 1 runtime kernel
  -> A5-F10 event-sourced runtime truth
       -> event admission
       -> durable history
       -> Event Calculus
       -> replay
       -> typed runtime projections
       -> runtime consumers
  -> A5-F02 GTL authoring and validation
       -> raw Program admission
       -> whole-Program validation
       -> canonical Program and GraphFunction identity
       -> complete C algebra
  -> A5-F03 Graph, C, and direct HoG traversal
       -> admitted Program selection
       -> graph materialization
       -> structural traversal
       -> implementation and interaction resolution
       -> invocation, retry, and continuation composition
  -> A5-F04 probabilistic result integrity
       -> raw result admission
       -> contract, identity, evidence, and attribution validation
       -> retry classification
       -> consequential projection
```

The hierarchy names Product functions. The common-realization lattice below is
orthogonal: it names authority-neutral algorithms used through typed adapters.

## Adoption Table

| Common block | Immutable 4.6 source | Current 5.0 or donor evidence | Exact 5.0 delta | Disposition | Typed composition seam |
|---|---|---|---|---|---|
| canonical JSON, digest, and reference | 4.6 shared canonicalization and reference helpers | `code/src/shared/canonical_json.ts`, `digests.ts`, `references.ts` | 5.0 identities and payloads differ; canonical byte/digest law does not | retain current | every admitted carrier and content-addressed ref |
| immutable value and collection mechanics | 4.6 frozen carrier construction | `code/src/shared/immutable.ts` plus frozen arrays/maps at module boundaries | object identity must never become semantic admission | retain and tighten at typed boundaries | declaration, event, replay, and projection values |
| append-only event log | 4.6 `m03/events/event_log_sink.ts` and event admission | `code/src/abg/event_store.ts` lines 1296-1356 and 2023-2095 | 5.0 requires canonical envelopes, store-assigned gap-free ordinals, atomic durable batches, rollback, and one append owner | retain current | ABG event admission only |
| durable-prefix coordinate | 4.6 replay-attestation and sink mechanics | `event_store.ts` `EventStoreReopenAuthority`, `reopenEventStore`, exact device/inode/byte-length/digest checks | fresh operation contexts must reopen without restamping and append at max ordinal plus one | retain current | Public durable authority -> ABG reopen |
| Event Calculus carrier and fold | `m03/contracts/event_calculus.ts` typed fluent/pattern/effect/projection kernel | current `code/src/abg/event_calculus.ts` has the selected 5.0 event/effect table but uses anonymous string arrays; `replay.ts` duplicates a private Set fold | preserve M05 payload-parameterized effects, exact store scope, clipping/declipping, and typed `HoldsAt` without importing 4.6 Product vocabulary | transplant 4.6 algorithm into current 5.0 effect relation | ABG events -> one typed EC projection |
| replay | 4.6 replay-attestation and aggregate projections | `code/src/abg/replay.ts` plus `event_store.ts::selectRuntimeEvents` | causal scope closure, gap-free ordinals, exact-prefix equality, and all current M05 projection families | retain, replace local EC loop | EC projection -> `ReplayState` |
| immutable dictionary transition | 4.6 `runtime_graph_function_registry.ts`, `payload_ledger.ts`, and lever registries | current catalog, environment, invocation, execution-basis, and C-call admission modules contain repeated exact-key/equal-value/conflict shapes | each domain retains its own identity and refusal meaning; no generic store becomes semantic owner | contract later; no extraction in first slice | typed domain adapter over pure keyed transition |
| state transition | 4.6 iteration/retry/correction pure decisions | current HoG proposals and ABG admissions | Product or HoG proposes; ABG alone admits; the transition helper stays store-free | retain per owner; commonize only proven identical algorithms | proposal -> owner validation -> ABG event |
| typed contract and validation | 4.6 shared validation plus module validators | current `code/src/validator/*`, event contracts, Product verification, GTL contract families | closed 5.0 discriminants, no surplus fields, exact installed Product basis | retain current | raw candidate -> typed judgment/refusal |
| graph and exact selection | 4.6 GTL graph/selection structures | current `code/src/gtl/*`, `validator/graph.ts`, `product/exact_match.ts`, `hog/direct_fold.ts` | original admitted GTL remains constructive carrier; no compiled plan or caller-order fallback | retain current | GTL -> validator -> admitted basis -> direct HoG |
| ledger and registry projection | 4.6 `payload_ledger.ts` and `runtime_graph_function_registry.ts` | current replay subprojections plus catalog/invocation scans | all currentness must derive through events/EC; domain history and lookup remain typed downstream views | transplant only pure fold patterns when each adapter is selected | EC/replay -> domain ledger or registry |
| effect boundary | 4.6 event sink and implementation ports | current event-store ownership, leaf ports, worker transport, public durable authorities | process capability authorizes an effect but cannot prove semantic currentness | retain and tighten consumers | expected coordinate -> effect -> successor coordinate |
| installed proof | 4.6 packed/source-blind gates | current `test_env`, package manifest, M4/M5 installed lanes | prove one exact 5.0 candidate and fresh-process replay; do not treat source tests as installed proof | retain harness, extend proportionally | package bytes -> clean install -> public invocation/read |

The assessment selects no wholesale donor merge. It conserves current 5.0 code
where that code already contains accepted M05 deltas and transplants only
bounded 4.6 algorithms whose Product-specific vocabulary can be excluded.

## External Options

No new third-party dependency is selected for the first slice. The current
tenant has zero runtime package dependencies, already uses the Node standard
library, and contains the required native substrate.

| Candidate | Exact supplied function | Primary reference and license | Integration and determinism assessment | Disposition |
|---|---|---|---|---|
| Node `node:fs` | synchronous write, fsync, descriptor/stat, truncate, and close mechanics | <https://nodejs.org/api/fs.html>; Node license | already used by `event_store.ts`; packages with the declared Node runtime; exposes mechanics only and does not interpret ABG truth | retain existing external runtime substrate |
| Node `node:crypto` | SHA-256 hashing | <https://nodejs.org/api/crypto.html#cryptocreatehashalgorithm-options>; Node license | already wrapped by `shared/digests.ts`; deterministic for exact canonical bytes; no authority leak | retain existing external runtime substrate |
| SQLite | atomic transactions, WAL/rollback durability, single-file storage | <https://www.sqlite.org/atomiccommit.html>, <https://www.sqlite.org/wal.html>, <https://www.sqlite.org/copyright.html>; public domain | capable durability substrate, but adoption would replace a conforming JSONL exact-prefix contract, add native/runtime/package complexity, and require a new canonical byte/prefix law | reject for Wave 1 first slice; reconsider only after a durability requirement counterexample |
| Immutable.js | persistent `Map`, `Set`, `List`, ordered collections, structural sharing | <https://immutable-js.com/>, <https://github.com/immutable-js/immutable-js/blob/main/LICENSE>; MIT | useful for large persistent collections, but current bounded immutable values use native arrays/maps plus freezing and canonical JSON; its equality/serialization model would add an adapter and package surface | do not adopt now |
| XState 5 | state machines, statecharts, actor interpreter, snapshots | <https://stately.ai/docs>, <https://github.com/statelyai/xstate>; MIT | mature and deterministic for declared machines, but its actor/interpreter/current-snapshot authority would compete with direct HoG plus ABG events and Event Calculus | reject as core runtime or traversal substrate |
| Ajv 8 | compiled JSON Schema validation | <https://ajv.js.org/>, <https://github.com/ajv-validator/ajv>; MIT | appropriate for generated public serialized schemas, not for Product semantic validation, event admission, or EC projection; introduces code generation and a runtime dependency | defer to the later public-schema boundary; not an A5-F10 dependency |

External adoption is therefore unnecessary for constructability. Each rejected
candidate is rejected at this boundary, not declared globally unusable.

## Authority-Seam Ledger

| Fact | Sole author/proposer | Admission | Durable fact | Projection | Direct consumer | Competing path disposition |
|---|---|---|---|---|---|---|
| Product and GTL meaning | installed Product/GTL | Product verification and validator, then ABG basis admission | existing typed admission events | replay cites immutable declarations | HoG and Product projectors | reject store-authored or adapter-authored meaning |
| invocation and Run opening | Public transports request; ABG evaluates | `invocation_admission.ts`, `open_call.ts` | `invocation_admitted`, `basis_admitted`, `run_segment_opened` | Event Calculus and replay | HoG, continuation, closure | process-local uniqueness cannot answer current state |
| event order and durability | ABG event store | `admitRuntimeEvent`, batch, or transaction | canonical JSONL, assigned ordinal, fsync before visibility | exact-prefix validation and replay | every runtime projector | no alternate append ingress or restamping |
| run active/closed truth | ABG event kinds under selected M05 law | existing run-open and closure admission | `run_segment_opened`, `run_closed` | `HoldsAt(run_active(runId))`, `HoldsAt(run_closed(runId))` | replay status and bounded ABG admissions | delete replay's local Set fold and terminal-kind absence scan |
| runtime failure | HoG/operation supplies failure candidate; ABG evaluates | `runtime_failure.ts::admitRuntimeFailure` | `runtime_failure_observed` | EC terminates run/frame/graph active truth; replay reports failed | Public outcome and later reads | replace inferred active state with `HoldsAt` |
| continuation | Product/GTL declares interaction meaning; F_H supplies attributed response; ABG admits | `continuation.ts` | public-operation, opened, responded, and resumed events | replay continuation projection | `run.continue`, HoG resume, Public read | process registries and retained objects are evidence only |
| catalog/application | Product owns row/value meaning; ABG admits | `catalog_admission.ts` and installed Product verifier | existing catalog/runtime admission events where declared; catalog application remains scoped non-event admission by accepted S05 design | catalog/view replay projections | invocation construction | do not fold this distinct S05 authority into first run slice |
| result/judgment/closure | implementation proposes effect result; Product/GTL validates meaning; HoG proposes; ABG admits | `c_call.ts`, `traversal_route.ts`, `closure.ts` | canonical C-call, route, terminal, frame, graph-call, Run events | EC plus replay | Public result/status/replay | raw worker output and caller memory never close truth |

## Competing Paths And Bounded Disposition

Immediate first-slice removals:

1. `code/src/abg/replay.ts` lines 484-489: private `Set<string>` Event
   Calculus fold. Replace it with the one typed projection function.
2. `code/src/abg/runtime_failure.ts` lines 52-54: absence scan for only
   `runtime_failure_observed` or `run_closed`. Replace it with exact scoped
   `HoldsAt(run_active(runId))`. The current scan omits `run_stopped`, which the
   selected effect relation already declares as terminating run-active truth.
3. `test_env/tests/m5-installed-fan-out.test.mjs` and
   `m5-installed-recursion.test.mjs`: copied Set folds. Replace test helpers
   with the canonical projection/key exports so tests do not normalize a rival
   algorithm.

Deferred, explicitly not removed in this slice:

- `ReplayState.activeFluents` remains a serialized read model, but is derived
  from the single typed EC projection.
- `code/src/abg/fan_out.ts` exact availability checks and
  `code/src/public/outcome.ts` prefix-based open-lifecycle checks remain
  downstream consumers of replay and are migrated with their later typed
  adapters.
- Event-store `WeakMap` ownership is retained. It encapsulates descriptors and
  append capability, not semantic currentness.
- Catalog, validator, HoG, execution-basis, retry, and cursor WeakSet/WeakMap
  brands are not adjudicated by the first run-lifecycle slice.

## Separate Phase 0 Verdicts

### Design verdict

Accepted for the bounded first slice. The operative tenant design fixes one
ABG event authority, one Event Calculus effect relation, replay as downstream
truth, and the exact run-open/run-close effects. The common-design blocker is
withdrawn for the reasons stated above. No Product meaning, identity,
lifecycle, module direction, or new design decision is left to implementation
for this slice.

### Constructability verdict

Accepted. Current 5.0 already supplies canonical events, atomic durable append,
exact-prefix reopening, scoped event selection, payload-parameterized effects,
replay, run opening, runtime failure, and closure. Immutable 4.6 supplies the
bounded typed fluent/pattern/axiom/projection fold. No external library, new
store, new event family, or new controller is needed.

Phase 0 acceptance selects a coding-plan candidate only. It does not accept
`A5-F10`, Phase 1, Wave 1, any implementation, or any proof claim.

## Recommended First A5-F10 Slice

Implement one event-store-scoped `HoldsAt` projection for the existing
run-open/run-close lifecycle, prove it across exact durable reopen, route replay
and one ABG runtime consumer through it, and remove their corresponding raw
fold/scan paths.

The selected M05 relation is exact:

```text
run_segment_opened -> initiates run_active(runId)
run_closed         -> terminates run_active(runId)
                   -> initiates run_closed(runId)
```

`run_stopped` and `runtime_failure_observed` retain their already declared
termination of `run_active(runId)`. No new event semantics are introduced.

## CODING PLAN ONLY

No item in this section is authorized until independent review is appended.

### Exact files and functions

1. `build_tenants/abiogenesis/typescript/code/src/abg/event_calculus.ts`

   - Retain `ROOT_EVENT_CALCULUS` coverage and all payload-sensitive logic in
     `eventCalculusEffect`; this remains the singular event-to-effect relation.
   - Tighten the carrier to immutable discriminated `RuntimeFluent`,
     `RuntimeFluentPattern`, `RuntimeEventCalculusEffect`,
     `RuntimeEventCalculusEffectRow`, and `RuntimeEventCalculusProjection`
     values. Preserve the canonical string coordinate through
     `runtimeFluentKey`, so the current serialized replay vocabulary does not
     fork.
   - Add adapted `constructRuntimeFluent`, `constructRuntimeFluentPattern`,
     `runtimeFluentKey`, `runtimeFluentPatternKey`,
     `runtimeFluentMatchesPattern`, `completeEffect`, axiom admission/map
     validation, `deriveRuntimeEventCalculusProjection(store, scope?)`, and
     `holdsAt(projection, fluent)`.
   - Add only the selected 5.0 run adapters
     `constructRunActiveFluent(runId)` and `constructRunClosedFluent(runId)` in
     this slice.
   - The projection selects events with `store.readScope(scope)`, requires a
     gap-free admission-ordinal sequence, applies initial negative/positive
     truth and then terminate, clip, declip bookkeeping, and initiate in fixed
     order, and returns immutable key-sorted holds and effect rows. Missing,
     duplicate, contradictory, or malformed law fails closed.

2. `build_tenants/abiogenesis/typescript/code/src/abg/replay.ts`

   - Delete the local Set fold at current lines 484-489.
   - Derive one `RuntimeEventCalculusProjection` and populate retained
     `activeFluents` from `projection.holds.map(runtimeFluentKey).sort()`.
   - Change the active-status fallback at current lines 1038-1040 to require
     `holdsAt(projection, constructRunActiveFluent(runOpen.runId))`. Preserve
     the existing precedence of failed, closed, stopped, refused, and held
     projections.

3. `build_tenants/abiogenesis/typescript/code/src/abg/runtime_failure.ts`

   - Replace current lines 52-54 with an exact query over
     `deriveRuntimeEventCalculusProjection(store, {runId: scope.runId})` and
     `constructRunActiveFluent(scope.runId)`.
   - Retain execution-basis, opened-scope, diagnostic, payload, causation, and
     event-admission checks unchanged.

4. `build_tenants/abiogenesis/typescript/code/src/abg/index.ts`

   - Export the new carrier, projection, query, key, and two run-adapter
     functions. Export no store, controller, or mutable projection API.

5. `build_tenants/abiogenesis/typescript/test_env/tests/m5-event-calculus-runtime.test.mjs`
   and `package.json`

   - Add one focused module-owned lane `test:m5:event-calculus` and include it
     in `test:m5`. If review requires no new lane, place the same cases in
     `m5-event-store-reopen.test.mjs`; the focused lane is preferred because it
     proves one common block.
   - Use `setupInstalledRootExecutionBasis`, `openCall`, and the standard R9
     spine: `admitInitialTraversalCursor`, `openCCall`, `admitEvidence`,
     `admitResult`, `proposeJudgment`, `admitJudgment`,
     `proposeTerminalRoute`, `admitRoute`, and `admitClosure`. Do not fabricate
     semantically impossible close events.
   - Prove open `run_active=true` and `run_closed=false`; inertia across
     unrelated admitted events; identical truth after exact durable reopen;
     lawful closure yields active false and closed true; a second reopen yields
     equal projection and replay status/digest; and a different Run in the
     same store cannot satisfy the queried identity.
   - Prove removed axiom, duplicate axiom, initiate/terminate contradiction,
     malformed pattern, scope-local clipping, and declip bookkeeping fail or
     project exactly as declared.
   - Prove an admitted `run_stopped` makes `admitRuntimeFailure` refuse without
     append. This is the counterexample to the removed absence scan.
   - Migrate the copied folds in `m5-installed-fan-out.test.mjs` and
     `m5-installed-recursion.test.mjs` to the canonical projection/key exports.

### Retained and transplanted hunks

Retain current 5.0 `event_store.ts` unchanged: `RuntimeEvent`,
`RuntimeEventScope`, `selectRuntimeEvents`, exact durable append ownership,
fsync/rollback, `validateHistoricalEvents`, `reopenEventStore`, and
`admitRuntimeEvent`, batch, and transaction. Retain current event kinds,
payload contracts, M05 dynamic effects, replay result families, closure
functions, and public projection shape.

Transplant algorithmically from immutable 4.6
`build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/event_calculus.ts`:

- lines 73-168: fluent, pattern, effect-row, projection, and replay-input
  carrier shapes;
- lines 263-500: validation, construction, canonical keys, matching, and
  complete-effect checks;
- lines 1567-1635: axiom admission and unique map validation; and
- lines 1638-1807: immutable projection construction, ordered fold, and
  `holdsAt`.

Adapt those algorithms to current 5.0 `RuntimeEvent`, `RuntimeEventScope`, and
the selected M05 effect relation. Do not transplant the 4.6 fluent-name/scope
vocabulary, M03-specific axioms, basis model, retry/continuation derived rules,
or aggregate projector. Those carry 4.6 Product meaning and would compete with
the selected 5.0 design.

### Verification commands after approval

```text
cd build_tenants/abiogenesis/typescript
npm run build
npm run test:m5:event-calculus
npm run test:m5:reopen
npm run test:r9
npm run test:m5:fan-out
npm run test:m5:recursion
npm run test:m5
git diff --check
```

### Explicit non-changes

- No specification, GOALS, ticket, accepted design, schema, public operation,
  package identity, event kind, event contract, or envelope change.
- No event-store durability, transaction, ownership, or reopen change.
- No GTL, validator, HoG traversal, C-call, closure topology, Consensus,
  catalog/application, continuation, retry, fan-out, worker, SDK, CLI,
  install, qualification, or release behavior change.
- No generic public store, external dependency, state-machine interpreter,
  compiled plan, controller, second Event Calculus, second replay fold, or
  process-local semantic currentness.
- No claim that this slice accepts `A5-F10`, Phase 1, or Wave 1.

## Exact Repository State And No-Edits Boundary

Assessment subject before this post:

```text
repository: /Users/jim/src/apps/abiogenesis-5-root-build
branch: codex/t287-wave1
HEAD: c0859be7fb0c779bf8a95be5b5b3c19e06c046c9
v4.6.0-rc.3 peeled commit: f4f081f66ef8d3ce0c737ddb9d7530176711279a
v4.6.0-rc.3 tree: 4df9f03adabc7bdaee211a145490768095d21e6c
pre-existing tracked modifications:
  M .ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md
  M specification/GOALS.md
pre-existing untracked files:
  .ai-workspace/comments/claude/20260725T094500Z_REVIEW_t270_s03_exact_candidate_19f50c17.md
  .ai-workspace/comments/claude/20260726T004500Z_REVIEW_t270_s03_authority_repair_5956d533.md
  .ai-workspace/comments/claude/20260726T090000Z_REVIEW_t270_s05_exact_candidate_48103ed9.md
  .ai-workspace/comments/claude/20260727T030000Z_REVIEW_t270_s05_global_to_local_design.md
  .ai-workspace/comments/claude/20260727T040000Z_REVIEW_t270_s05_realization_candidate_3a10bd56.md
  .ai-workspace/comments/codex/20260726T042849Z_STRATEGY_consensus_reviewer_identity_and_historical_sessions.md
  .ai-workspace/comments/codex/20260727T010746Z_POSTMORTEM_abiogenesis_5_0_three_day_delivery_and_design_churn.md
  .ai-workspace/comments/codex/20260727T181950Z_STRATEGY_cpp_stl_lineage_for_gtl_standard_library.md
  .ai-workspace/comments/codex/20260801T053617Z_STRATEGY_f_h_proxy_worker_assurance_model.md
  .ai-workspace/comments/codex/20260801T172432Z_HANDOFF_wave_1_phase_0_worker_bootstrap.md
  .ai-workspace/comments/codex/20260802T010023Z_DRAFT1_abiogenesis_5_common_building_block_design_principles.md
```

The assessor made no edit to GOALS, ticket, design, production, tests, schema,
package, fixtures, generated evidence, or any pre-existing commentary. This
transition artifact is the only created file. Coding remains on hold until the
independent review is appended.

## Assessor Disposition

Reviewed independently by `/root` against the live TypeScript design selector,
selected M05 run law, and cited implementation functions.

### Verdict

- Phase 0 structural assessment: **ACCEPTED**.
- External-library disposition: **ACCEPTED**. No new dependency is justified
  for this slice.
- First-slice boundary: **ACCEPTED** as one run-lifecycle `HoldsAt` vertical.
- Coding plan: **REJECTED LOCALLY; one bounded correction required**.
- Phase 0 and the parent design remain closed. No Product decision or design
  re-entry is required.

### Blocking finding

`deriveRuntimeEventCalculusProjection(store, scope?)` lets a projection
function receive a mutable `AbgEventStore` and select its own current prefix.
That couples the pure fold to effect-owner state and makes the projector decide
which history is truth. It contradicts the accepted relation:

```text
explicit selected and validated event prefix
  -> pure Event Calculus fold
  -> immutable typed projection
```

The current `replay` function already snapshots the store and checks total
gap-free admission ordinals before selecting its scope. The corrected common
kernel must therefore accept an explicit immutable event sequence or a bounded
verified-prefix carrier; it must not import, call, or retain
`AbgEventStore`. Replay and the runtime-failure admission adapter may obtain a
snapshot from their owning store boundary, validate the applicable ordinal and
scope relation, and pass that exact value into the same pure kernel. Durable
reopen tests must prove that an independently reopened exact prefix produces an
equal projection.

### Required local corrections

1. Change the kernel boundary to a pure form such as
   `deriveRuntimeEventCalculusProjection(events)`; no internal `readAll`,
   `readScope`, current-tail selection, or store ownership.
2. Name one shared prefix-selection/validation relation used by replay and the
   runtime-failure adapter before the fold. Do not duplicate ordinal or scope
   validation.
3. Keep the selected 5.0 axiom table closed. Test-only malformed/duplicate-law
   probes must not require exporting a caller-configurable runtime axiom
   authority. If the 4.6 validator is retained, keep its law construction
   module-owned and test it below the public ABG surface.
4. State the runtime-failure negative using its actual contract: it throws
   before append unless a typed refusal is already accepted elsewhere. Do not
   introduce a new refusal family in this slice.
5. Keep clipping/declipping kernel tests only if the transplanted common kernel
   implements those accepted Event Calculus mechanics without inventing a new
   Product event or widening the first functional adapter.

### Explicit non-changes

Do not widen the slice, change the event store, add a durable carrier family,
add an external dependency, reopen catalog/Public/topology work, or revisit the
accepted run-open/run-close effects. Correct the function boundary and its
tests only, then return the revised coding-plan section for reassessment.

Implementation remains held pending that local plan correction.

## Worker Correction 1

This section supersedes only the rejected coding-plan seams above. The accepted
Phase 0 assessment, external disposition, first-slice boundary, selected
run-open/run-close law, and assessor disposition remain unchanged.

### 1. Pure explicit-prefix Event Calculus kernel

`event_calculus.ts` shall not import, receive, call, or retain
`AbgEventStore`. Its production kernel boundary is:

```text
deriveRuntimeEventCalculusProjection(
  events: readonly RuntimeEvent[]
): RuntimeEventCalculusProjection
```

The input is the caller-selected, already validated immutable event sequence.
The kernel validates event-to-axiom coverage and effect/fluent structure, folds
only that explicit sequence, and returns an immutable projection. It performs
no `readAll`, `readScope`, current-tail selection, durable-coordinate choice,
or store-ownership work. `holdsAt(projection, fluent)` remains a pure query.

### 2. One shared prefix-selection and validation relation

Add one authority-neutral relation in a bounded new module:

```text
code/src/abg/event_prefix.ts

selectValidatedRuntimeEventPrefix(
  admittedEvents: readonly RuntimeEvent[],
  scope?: RuntimeEventScope
): readonly RuntimeEvent[]
```

The store-owning caller first takes exactly one immutable snapshot with
`store.readAll()`. `selectValidatedRuntimeEventPrefix` then:

1. validates the complete snapshot's unique gap-free admission ordinals
   `1..n` before selection;
2. delegates causal scope closure to the existing pure
   `selectRuntimeEvents(admittedEvents, scope)` relation;
3. verifies that the selected sequence preserves original admission order and
   contains no unknown or cross-Run causal reference; and
4. returns a frozen copy of that exact sequence.

This relation chooses no mutable current tail: its complete candidate history
is an explicit value supplied by the effect-owning boundary. It adds no durable
carrier, event family, or authority object.

Both consumers use the same sequence:

```text
replay:
  snapshot = store.readAll()
  events = selectValidatedRuntimeEventPrefix(snapshot, scope)
  ec = deriveRuntimeEventCalculusProjection(events)

admitRuntimeFailure:
  snapshot = store.readAll()
  events = selectValidatedRuntimeEventPrefix(snapshot, { runId: scope.runId })
  ec = deriveRuntimeEventCalculusProjection(events)
  require holdsAt(ec, constructRunActiveFluent(scope.runId))
```

Delete replay's existing local ordinal loop together with its Set fold; the
shared relation replaces the former and the pure EC kernel replaces the latter.
Neither replay nor runtime failure duplicates ordinal or causal-scope checks.

### 3. Closed module-owned axiom authority

`ROOT_EVENT_CALCULUS` remains the complete selected 5.0 table and is checked
with `satisfies Readonly<Record<RootEventKind, ...>>`. Production
`deriveRuntimeEventCalculusProjection(events)` always uses that closed table.
It accepts no optional axioms, callback, override, undeclared-event mode, or
caller-selected law.

The adapted 4.6 duplicate/contradiction/completeness validator remains an
internal construction check in `event_calculus.ts`. If a callable validation
helper is required for tests, export it only from that implementation module
and do not re-export it from `code/src/abg/index.ts`; package consumers can
reach only the public `./abg` export map. The focused module test may import the
built implementation file by repository-relative path to falsify duplicate,
missing, malformed, and initiate-plus-terminate law. It cannot pass alternate
axioms to the production projector.

The public ABG index exports only the closed projection/query carriers,
`runtimeFluentKey`, and the two selected run-fluent constructors.

### 4. Actual runtime-failure failure contract

The consumer negative uses the current function contract. After a lawful
`run_stopped` has terminated `run_active(runId)`, call
`admitRuntimeFailure(...)` and assert:

```text
assert.throws(
  () => admitRuntimeFailure(...),
  /runtime failure requires one exact active admitted traversal scope/
)
store.readAll().length === countBeforeCall
durable bytes === bytesBeforeCall
```

No typed refusal, new error union, new event, or alternate non-admission family
is introduced. The `HoldsAt` check executes before `admitRuntimeEvent`, so the
failure is throw-before-append in both memory and the configured durable sink.

### 5. Proportional clipping and declipping proof

The production kernel retains the accepted common mechanics in the fixed fold
order `terminate -> clip -> declip bookkeeping -> initiate`. Because no event
or Product effect is added by this slice, clipping and declipping receive one
module-internal algebra test only: a constructed fluent set plus a constructed
pattern proves that clip removes matching identities without touching another
Run and that declip records the exact pattern key. The test exercises the
internal common-kernel helper below the public ABG surface; it does not inject
an axiom into the production projector or fabricate a runtime event.

If the implementation cannot retain those mechanics without exposing a
caller-configurable law or adding a Product event, clip/declip transplantation
and its test are deferred. That deferral does not alter the selected first
adapter, whose accepted run effects use initiation and termination only.

### Corrected exact file plan

1. `code/src/abg/event_calculus.ts`: pure explicit-event projection, closed
   module-owned axiom table, typed carrier/key/query, and two run constructors.
2. `code/src/abg/event_prefix.ts`: the sole explicit-snapshot ordinal and
   causal-scope selection/validation relation.
3. `code/src/abg/replay.ts`: snapshot once, call the shared prefix relation,
   call the pure kernel, derive `activeFluents` and active status; remove local
   ordinal and Set folds.
4. `code/src/abg/runtime_failure.ts`: snapshot once, call the same prefix
   relation and pure kernel, require scoped `run_active`; retain throw contract
   and existing admission unchanged.
5. `code/src/abg/index.ts`: re-export the shared prefix relation only if another
   package-level ABG consumer requires it; otherwise keep it module-local.
   Export no axiom override or validator.
6. `test_env/tests/m5-event-calculus-runtime.test.mjs`: explicit-prefix purity,
   durable reopen equality, lawful open/close identity, module-internal closed
   law falsifiers, proportional clip/declip algebra, and throw-before-append
   runtime-failure negative.
7. `m5-installed-fan-out.test.mjs` and `m5-installed-recursion.test.mjs`:
   replace copied folds with the closed projection/key API.

### Mandatory role-bound technology mapping

This matrix applies T-287 `Wave 1 Lawful Technology Stack` and the bootstrap
`Lawful Stack Is Role-Bound` rule to every planned production function and
every existing test helper whose implementation changes. File placement does
not enlarge a component's role. In particular, the existing pure
`selectRuntimeEvents(events, scope)` helper may remain a subordinate causal
selection algorithm, but no `AbgEventStore` method or mutable store instance is
passed into the prefix relation or Event Calculus kernel.

| Planned edited function | Functional owner | Selected stack component | Exact input authority | Exact output carrier | Prohibited calls or state | Consumer |
|---|---|---|---|---|---|---|
| `eventCalculusEffect(event)` | ABG 5.0 event/effect adapter | current typed ABG adapter plus native frozen records | one admitted `RuntimeEvent` already present in the explicit selected prefix; selected M05 closed effect table | immutable `RuntimeEventCalculusEffect` over typed fluents/patterns | `AbgEventStore`, prefix/tail selection, append, replay status, Product choice, caller axiom | pure EC fold |
| `constructRuntimeFluent(input)` | common Event Calculus value kernel | immutable 4.6 typed EC kernel plus native frozen record | typed module-owned fluent fields supplied by a selected 5.0 effect adapter | immutable validated `RuntimeFluent` | event/store lookup, semantic identity inference, object-identity branding, mutation | effect constructors and `holdsAt` callers |
| `constructRuntimeFluentPattern(input)` | common Event Calculus value kernel | immutable 4.6 typed EC kernel plus native frozen record | typed module-owned pattern fields | immutable validated `RuntimeFluentPattern` | store/prefix access, event invention, Product scope choice, mutable matcher state | clipping/declipping mechanics |
| `runtimeFluentKey(fluent)` | common Event Calculus canonical-key kernel | immutable 4.6 EC key algorithm plus current canonical JSON/digest helpers only if the retained key law requires canonical bytes | one already validated `RuntimeFluent` | canonical string key | selecting fluent meaning/preimage, hashing a different semantic value, store access, implicit object identity | projection map, deterministic sort, compatibility `activeFluents` |
| `runtimeFluentPatternKey(pattern)` | common Event Calculus canonical-key kernel | immutable 4.6 EC key algorithm | one already validated `RuntimeFluentPattern` | canonical string pattern key | store access, pattern mutation, Product identity choice | declip bookkeeping and module proof |
| `runtimeFluentMatchesPattern(fluent, pattern)` | common Event Calculus matching kernel | immutable 4.6 EC algorithm | one validated fluent and one validated pattern | boolean structural match | event lookup, current-state selection, effects, caller fallback | pure clip step |
| `completeEffect(effect)` | common Event Calculus effect validator | immutable 4.6 EC algorithm plus native `Map`/`Set` | one effect produced by the closed module-owned 5.0 axiom | immutable complete non-contradictory effect | store access, append, event-kind selection, alternate axiom registration, mutable retained state | `eventCalculusEffect` and pure fold |
| internal `admitRuntimeEventCalculusAxioms(...)` / closed axiom-map constructor | ABG 5.0 EC law module | immutable 4.6 axiom validation algorithm plus native `Map` | the module-owned `ROOT_EVENT_CALCULUS` declaration at module construction | closed immutable one-row-per-`RootEventKind` lookup | public re-export, runtime caller overrides, plugin registration, ignore-undeclared mode, Product law synthesis | `deriveRuntimeEventCalculusProjection` only |
| `constructRunActiveFluent(runId)` | ABG run-lifecycle typed adapter | current typed ABG adapter over immutable 4.6 fluent constructor | exact non-empty `runId` carried by selected run-scoped event/scope | immutable `run_active(runId)` fluent | store/event scans, alternate run selection, caller memory as truth | replay active status and runtime-failure guard |
| `constructRunClosedFluent(runId)` | ABG run-lifecycle typed adapter | current typed ABG adapter over immutable 4.6 fluent constructor | exact non-empty `runId` carried by selected `run_closed` event/scope | immutable `run_closed(runId)` fluent | store/event scans, closure inference from absence, alternate run selection | replay and focused lifecycle proof |
| `deriveRuntimeEventCalculusProjection(events)` | common Event Calculus projection kernel | immutable 4.6 typed Event Calculus kernel plus native frozen arrays/`Map`/`Set` | explicit immutable prefix returned by `selectValidatedRuntimeEventPrefix`; closed module-owned axiom map | immutable typed `RuntimeEventCalculusProjection` with canonically ordered holds/effect rows | import or receipt of `AbgEventStore`, `readAll`, `readScope`, prefix/current-tail choice, append, actor runtime, caller axioms, Product meaning | `replay`, `admitRuntimeFailure`, focused module tests |
| `holdsAt(projection, fluent)` | common Event Calculus query kernel | immutable 4.6 typed Event Calculus kernel | one immutable EC projection plus one typed owner-constructed fluent | boolean | store/event access, prefix selection, mutation, semantic fallback, append | replay status and bounded ABG admission guards |
| `selectValidatedRuntimeEventPrefix(admittedEvents, scope?)` | ABG replay-prefix adapter | current typed ABG adapter plus native frozen arrays/`Map`/`Set`; existing pure `selectRuntimeEvents` is subordinate | one immutable `store.readAll()` snapshot produced by the owning event-store boundary plus explicit caller scope | frozen, ordinal-validated, causally closed, original-order `readonly RuntimeEvent[]` | receipt/call/retention of `AbgEventStore`, `readAll`, `readScope`, current-tail discovery, append/fsync, EC fold, `HoldsAt`, Product identity | `replay` and `admitRuntimeFailure` |
| `replay(store, scope?)` | ABG replay projector | current typed ABG/replay adapter composed with current `AbgEventStore` snapshot production, shared prefix adapter, and pure 4.6 EC kernel | exact live or reopened ABG store capability and explicit optional `RuntimeEventScope` supplied by its caller | immutable `ReplayState` and retained canonical `activeFluents` read model | append, direct fs mechanics, duplicated ordinal/scope/EC fold, caller-selected axiom, Product semantic authorship, retained mutable currentness | HoG, ABG admission functions, Public projectors |
| `admitRuntimeFailure(store, executionBasis, scope, stage, subject, diagnosticRef, basis)` | ABG runtime-failure admission owner | current typed ABG adapter composed with current event-store snapshot/admission seams, shared prefix adapter, and pure EC query | exact admitted execution basis, opened traversal scope, explicit failure candidate/basis, and one immutable store snapshot | existing immutable `RuntimeFailureAdmission` after one `runtime_failure_observed`, or existing synchronous `TypeError` before append | raw terminal-kind/current-tail scan, new refusal family, store/object identity as semantic currentness, duplicate prefix validation, Product/HoG route choice | runtime-effect callers and replay/Public failure projection |
| test helper `activeFluents(events)` in `m5-installed-fan-out.test.mjs` | module-owned installed fan-out proof | public closed ABG EC projection/key API over native frozen event array | installed event log parsed from the exact test run | sorted fluent-key read model used only by assertions | copied `Set` fold, alternate axioms, store access, semantic admission | fan-out lifecycle assertions |
| test helper `activeLifecycleFluents(installedRoot, events, label)` in `m5-installed-recursion.test.mjs` | module-owned installed recursion proof | installed package's public closed ABG EC projection/key API | installed package root plus exact parsed event array | filtered sorted fluent-key assertion value | copied fold, source/private fallback, alternate axiom, event append | recursion/foldback lifecycle assertions |

### Mandatory common-library catalog classification

Every planned algorithmic function selects exactly one T-287 catalog
disposition. A function listed under an addition proposal remains unapproved
until `/root` accepts that proposal.

| Algorithmic function | Classification | Exact common-library relation and callable |
|---|---|---|
| `eventCalculusEffect(event)` | `catalog_addition_proposal` | `typed Event Calculus projection` / module-owned 5.0 effect callable `eventCalculusEffect` |
| `constructRuntimeFluent(input)` | `catalog_addition_proposal` | `typed Event Calculus projection` / transplanted-adapted `constructRuntimeFluent` |
| `constructRuntimeFluentPattern(input)` | `catalog_addition_proposal` | `typed Event Calculus projection` / transplanted-adapted `constructRuntimeFluentPattern` |
| `runtimeFluentKey(fluent)` | `catalog_addition_proposal` | `typed Event Calculus projection` / transplanted-adapted `runtimeFluentKey` |
| `runtimeFluentPatternKey(pattern)` | `catalog_addition_proposal` | `typed Event Calculus projection` / transplanted-adapted `runtimeFluentPatternKey` |
| `runtimeFluentMatchesPattern(fluent, pattern)` | `catalog_addition_proposal` | `typed Event Calculus projection` / transplanted-adapted `runtimeFluentMatchesPattern` |
| `completeEffect(effect)` | `catalog_addition_proposal` | `typed Event Calculus projection` / internal transplanted-adapted `completeEffect` |
| internal `admitRuntimeEventCalculusAxioms(...)` and closed axiom-map constructor | `catalog_addition_proposal` | `typed Event Calculus projection` / internal transplanted-adapted `admitRuntimeEventCalculusAxioms` and axiom-map construction |
| `constructRunActiveFluent(runId)` | `catalog_reuse` | `typed Event Calculus projection` / `constructRuntimeFluent`, used through the ABG run adapter |
| `constructRunClosedFluent(runId)` | `catalog_reuse` | `typed Event Calculus projection` / `constructRuntimeFluent`, used through the ABG run adapter |
| `deriveRuntimeEventCalculusProjection(events)` | `catalog_addition_proposal` | `typed Event Calculus projection` / transplanted-adapted `deriveRuntimeEventCalculusProjection` |
| `holdsAt(projection, fluent)` | `catalog_addition_proposal` | `typed Event Calculus projection` / transplanted-adapted `holdsAt` |
| `selectValidatedRuntimeEventPrefix(admittedEvents, scope?)` | `catalog_addition_proposal` | `validated immutable event-prefix selection` / proposed `selectValidatedRuntimeEventPrefix` |
| existing subordinate `selectRuntimeEvents(events, scope?)` | `catalog_reuse` | `validated immutable event-prefix selection` / current pure causal-closure callable `selectRuntimeEvents`, internalized beneath the proposed relation |
| `replay(store, scope?)` | `catalog_extension` | `replay projection composition` / existing `replay`, compatibly widened to compose the selected prefix and typed EC projection while deleting its local ordinal and fluent folds |
| `admitRuntimeFailure(...)` | `catalog_reuse` | `typed Event Calculus projection` / `deriveRuntimeEventCalculusProjection` plus `holdsAt`; its existing append remains reuse of `durable runtime-event admission` / `admitRuntimeEvent` rather than a new algorithm |
| test `activeFluents(events)` | `catalog_reuse` | `typed Event Calculus projection` / `deriveRuntimeEventCalculusProjection` plus `runtimeFluentKey` |
| test `activeLifecycleFluents(installedRoot, events, label)` | `catalog_reuse` | `typed Event Calculus projection` / installed `deriveRuntimeEventCalculusProjection` plus `runtimeFluentKey` |

The two pending catalog additions are bounded below. All other algorithmic
changes reuse or extend an existing registered relation.

#### Addition proposal: validated immutable event-prefix selection

1. **Recurrence or exact gap.** Current
   `event_store.ts::selectRuntimeEvents(events, scope)` performs pure causal
   scope closure, while `replay.ts` separately validates global gap-free
   ordinals and `runtime_failure.ts` has neither shared prefix validation nor
   selection. No catalog entry composes explicit snapshot validation and causal
   selection for both consumers without reading a store.
2. **Law and deterministic contract.** For an explicit immutable event snapshot
   `E=[e1..en]` and optional typed scope `S`, require
   `admissionOrdinal(ei)=i`, select every event directly matching `S` plus the
   transitive admitted causal predecessors, reject unknown or cross-Run causes,
   preserve original order, and return a frozen `readonly RuntimeEvent[]`.
   Equal `(E,S)` values produce canonically equal output or the same typed
   thrown validation class.
3. **Selected substrate.** Native frozen arrays, records, `Map`, and `Set` plus
   the current 5.0 typed `RuntimeEvent`/`RuntimeEventScope` adapter. The current
   pure `selectRuntimeEvents` algorithm is reused subordinate to the composed
   callable.
4. **Authority neutrality and prohibitions.** The relation knows ordering,
   scope coordinates, and event causation only. It cannot receive/read/retain
   `AbgEventStore`, choose a current tail, append/fsync, fold EC truth, determine
   Product meaning, or mint an authority carrier.
5. **Adapters and consumers.** `replay` and `admitRuntimeFailure` take one
   immutable store snapshot at their owning boundary and supply explicit scope;
   the pure EC kernel consumes the result.
6. **Why catalog extension violates cohesion.** `durable runtime-event
   admission` owns effects and snapshot production, so adding projector prefix
   selection would violate its no-projection role. `replay projection
   composition` is owner-specific and cannot supply the same neutral relation
   to an admission guard. `typed Event Calculus projection` must receive, not
   select, its prefix.
7. **Equivalent helper disposition.** Reuse and internalize current
   `event_store.ts::selectRuntimeEvents` as the subordinate causal selector;
   delete `replay.ts` lines 477-481 local ordinal validation; do not call
   `AbgEventStore.readScope` from replay or runtime failure; retain `readScope`
   only as an event-store convenience outside reconstructive authority. No
   second selector is added in either consumer.
8. **Proportional proof.** Module tests cover empty/full prefix, exact Run scope,
   original ordering, ordinal gap/duplicate, unknown cause, cross-Run cause,
   and frozen output. Composition proof shows retained and independently
   reopened equal snapshots select equal prefixes for replay and runtime
   failure.

#### Addition proposal: typed Event Calculus projection

1. **Recurrence or exact gap.** Immutable 4.6 supplies the complete pure typed
   EC algorithm in `m03/contracts/event_calculus.ts`, but current 5.0 retains
   only its selected effect meanings as string arrays and reconstructs them in
   a private `replay.ts` Set loop. Fan-out and recursion tests copy that loop.
   No current catalog callable yields a typed projection and `HoldsAt` from an
   explicit validated prefix.
2. **Law and deterministic contract.** Given only explicit immutable events and
   the closed module-owned one-row-per-`RootEventKind` 5.0 axiom map, apply
   initial negative/positive truth and each event's effects in fixed
   `terminate -> clip -> declip bookkeeping -> initiate` order. Reject missing,
   malformed, duplicate, or contradictory law. Return immutable canonically
   ordered holds/effect rows; `holdsAt` is exact fluent-key membership. Equal
   prefixes and fixed law produce equal projections.
3. **Selected substrate.** The immutable 4.6 typed Event Calculus carrier,
   validation, key, match, effect, projection, and `HoldsAt` algorithms adapted
   to current 5.0 effects, using native frozen arrays/records/`Map`/`Set`.
4. **Authority neutrality and prohibitions.** The common kernel owns temporal
   fold mechanics only. It cannot access a store, select scope/current tail,
   append, run actors, choose Product effects, accept caller axioms, or author
   replay/domain meaning.
5. **Adapters and consumers.** The ABG event/effect adapter supplies selected
   M05 effects; run adapters construct `run_active` and `run_closed`; `replay`,
   `admitRuntimeFailure`, and module-owned installed proof consume projection
   and query callables.
6. **Why catalog extension violates cohesion.** `replay projection
   composition` owns ABIogenesis read-model assembly, not reusable temporal
   algebra; embedding EC there created the current rival Set fold. `immutable
   carrier construction` cannot own temporal axioms or folds. The EC relation
   therefore remains one separately cohesive common catalog entry.
7. **Equivalent helper disposition.** Transplant and adapt 4.6
   `constructRuntimeFluent`, `constructRuntimeFluentPattern`, fluent/pattern
   keys and matching, effect validation, axiom-map validation,
   `deriveRuntimeEventCalculusProjection`, and `holdsAt`; internalize current
   5.0 `eventCalculusEffect` as the closed domain axiom adapter; delete
   `replay.ts` lines 484-489 and the copied Set folds in
   `m5-installed-fan-out.test.mjs` and `m5-installed-recursion.test.mjs`.
   Retain `ReplayState.activeFluents` only as a derived compatibility read
   model. Defer prefix-based consumers in `public/outcome.ts` and direct
   availability-key consumers in `fan_out.ts` to their selected typed adapters;
   they do not implement folds.
8. **Proportional proof.** Module tests prove run-open initiation, inertia,
   run-close/failure/stop termination, exact Run identity, closed law
   completeness/contradiction refusal below the public surface, and at most one
   internal clip/declip algebra case. Composition tests prove identical typed
   projection after durable reopen, replay parity, test-helper deletion, and
   runtime-failure throw-before-append.

`node:fs` remains confined to the unchanged `AbgEventStore` implementation for
descriptor, append, fsync, truncate, stat, and lock mechanics. `node:crypto`
and current canonical helpers remain confined to hashing already owner-selected
canonical values. No planned Event Calculus, prefix, replay, runtime-failure,
or test-helper function calls either technology to select semantic history or
meaning. No SQLite, LevelDB, EventStoreDB/Kurrent, XState, Immutable.js, Ajv,
new event framework, or generic registry/ledger/store enters this slice.

### Corrected non-changes and hold

No event-store implementation, durable carrier, event contract, selected
effect, Product surface, external dependency, catalog/Public/topology surface,
or other first-plan non-change is altered. The implementation and tests remain
unmodified. Coding remains held pending `/root` reassessment of this correction.

## Assessor Reassessment 1

Reviewed by `/root` against the appended correction, live
`selectRuntimeEvents` causal-closure law, T-287 lawful technology stack, T-287
common library catalog, and the selected TypeScript M03/M05 design basis.

### Verdict

- Worker Correction 1: **PASS**.
- `validated immutable event-prefix selection` catalog addition: **ACCEPTED**
  for the bounded callable and consumers stated here.
- `typed Event Calculus projection` catalog addition: **ACCEPTED** for the
  bounded closed-law pure kernel and two Run adapters stated here.
- Corrected coding plan: **APPROVED FOR IMPLEMENTATION**.

The shared prefix relation takes an explicit immutable snapshot, reuses the
existing `selectRuntimeEvents` causal-closure algorithm, validates total
ordinal and selected-prefix integrity once, and exposes no store or current-tail
authority. The common Event Calculus kernel consumes only that explicit value,
uses the closed module-owned 5.0 effect law, and returns an immutable typed
projection. The technology and common-library roles are therefore conserved.

Implementation authority is limited to the exact files, functions, tests,
deletions, commands, and non-changes in Worker Correction 1. The worker must
post the frozen implementation subject and self-review evidence to a new
transition post with an empty `Assessor Disposition`; implementation does not
self-accept A5-F10 or Wave 1.
