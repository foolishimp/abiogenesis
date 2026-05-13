# abiogenesis 3.7.1-rc.3 RC Notes

This note records accepted RC behavior for the current `v3.7.1-rc.3` line.
The package cut is `3.7.1-rc.3`.

## Accepted Framework Behavior

### TypeScript Is The Primary Package-First RC Carrier

The TypeScript tenant is the primary release realization for this RC line.
Public consumers should treat the package exports and binary aliases as delivery
bindings over the same GTL/ABG product grammar, not as a separate product law.
The Python tenant is paused as released-reference evidence and is not an active
release gate while the tenant registry keeps it paused.

Accepted public delivery bindings:

- package root: `@abiogenesis/typescript-tenant`
- public binary aliases:
  - `abiogenesis-ts`
  - `genesis-ts`
- supported command suffixes:
  - `start`
  - `gaps`
  - `assess-result`

### GTL Is The Constructive Program Surface

GTL is accepted as the LLM-first graph algebra. ABG is accepted as the runtime
that admits, executes, records, projects, and proves traversals.

Accepted behavior:

- graph functions are the primary published program form
- domains own asset meaning, domain HOW, and acceptance interpretation
- hidden LLM reasoning is not product truth
- hidden execution law is not admitted by GTL shape alone

### ABG Owns Start-To-Iterate Execution

The RC claim now requires the TypeScript line to prove an engine-owned
`start -> iterate` path.

Accepted behavior:

- `start(...)` is the public ignition/resume wrapper over the M03 runner
- `runEngineIterate(...)` owns repeated graph-function traversal in M03
- public-control wrappers project operator truth; they do not own graph
  traversal loops
- T-066 remains historical primitive/harness proof, not RC proof of engine
  ownership
- T-072 plus T-074 are the governing engine-owned iterate proof
- replayed F_P assessed-result truth advances re-entry without redispatching
  the already assessed edge
- runner-facing extension seams enter through admitted plugin contracts
- plugin outputs cannot own traversal, event, closure, graph-call, frame,
  transition, next-vector, or loop authority

### GTL Declares Assurance Hooks, ABG Owns Plugin Admission

Downstream ODD builders must declare policy and assurance hook refs through GTL
surfaces. They must not smuggle equivalent behavior through `runtime_config`,
transport prompts, controller-local payloads, or app-specific service loops.

Accepted hook declaration surfaces:

- `GraphFunction.declarations`
- `GraphVector.declarations`
- `Role.policy_hooks`
- `CandidateFamily.policy_hints`

Accepted assurance plugin concerns:

- `assurance_authority_snapshot_provider`
- `assurance_evidence_adapter`
- `assurance_ambiguity_classifier`
- `assurance_closure_policy_provider`
- `assurance_gain_function_adapter`

Accepted behavior:

- GTL carries stable hook refs and replay-safe config
- ABG resolves hook refs to admitted plugin contracts
- plugins provide candidate data, classification, policy, or gain inputs
- ABG emits the events, projects the ledgers, and applies closure law
- plugin output cannot directly close a run, graph call, frame, continuation,
  or release boundary

### Payload And Ledger Truth Is Event Sourced

Payloads that affect authority, evidence, traversal, projection, ambiguity, or
closure pass through ABG admission. Product-specific lifecycle registers are
read models over admitted ABG events, not second writable ledgers.

Accepted payload/ledger behavior:

- payload identity is digest-bound before it can participate in closure
- payload authority, evidence, and ambiguity facts are evented
- lifecycle registers project from the event log and can be replayed
- stale authority, orphan evidence, missing proof, and contradictory evidence
  remain named rows rather than disappearing into successful closure
- downstream domains own semantic gain functions, but ABG owns the carrier and
  event law that admits their outputs

### Assurance Projection Blocks Premature Closure

The RC line includes total assurance projection and closure-fold gating for the
TypeScript tenant.

Accepted behavior:

- assurance rows are projected from authority snapshots, evidence, payload
  facts, and runtime events
- unknowns become named ambiguity rows instead of nullable bypasses
- a second-hop register can deepen the evidence surface and stop convergence
  when new unresolved rows appear
- `fulfilled` is a projected state, not a worker self-report
- closure folds over the total projection and blocks on unresolved blocker rows

### Bare And Typed Edges Do Not Imply Compute Law

The M03 investigation lanes establish the current accepted substrate behavior:

- a bare structural edge is not a no-op by default
- a bare structural edge is not identity by default
- a bare structural edge is not an implicit `F_D` or `F_P` fallback
- a typed `A_1 -> A_2` interface exposes type authority without choosing a
  compute regime
- explicit runtime policy may bind `F_D`, `F_P`, or `F_H`
- missing runtime policy basis fails closed before execution-basis admission as
  `no_compute_basis`

The RC cut accepted the fail-closed behavior. The post-cut `T-060` cleanup
names that condition explicitly so downstream review can distinguish absent
compute basis from an invalid declared runtime regime.

### Traversal Structure Probe Is Diagnostic

The deterministic traversal-structure probe is an M03 diagnostic projection.
It reports traversal shape, typed loci, operator/evaluator surfaces, policy
regime, transition kind, event kinds, and explicit allowed/not-allowed claims.

Accepted behavior:

- the probe does not execute traversal
- the probe does not create a second runtime path
- the probe does not outrank admitted runtime events or replay projection

### M05 SDLC Bootstrap Lineage Is A Qualification Carrier

The SDLC bootstrap-lineage proof is accepted as an M05 qualification surface
over `BootstrapInputSet -> Project`.

Accepted behavior:

- admitted source inputs carry URI, digest, kind, detected schema, and authority
  marker truth
- project derivation produces `SdlcProject`
- `SdlcDerivationLedger` carries source-input and project-element lineage
- runtime provenance from ABG traversal remains visible but does not become
  semantic project authority by itself
- invalid weak ingress fails before semantic derivation

### Data Mapper Real Ingress Is A Sandbox Proof

The data-mapper real ingress lane is accepted as a sandbox qualification proof
over preserved external fixture truth.

Accepted behavior:

- the lane samples `data_mapper.template`
- the lane samples `data_mapper.test41`, `data_mapper.test42`, and
  `data_mapper.test43`
- Python SDLC normalization evidence is comparison evidence, not copied TS
  product behavior
- non-authority runtime/context surfaces remain ambiguity entries
- the lane stays outside default `test:semantic` because it depends on sibling
  workspace fixture state

### Public Gaps Is Replay-Derived Observation

`gaps` is a supported TypeScript operator command.

Accepted behavior:

- loads the installed runtime binding
- reads replayed runtime events
- projects open, partial, and converged work from module/job/vector truth
- remains read-only
- does not start traversal
- does not append runtime events
- does not reintroduce downstream product labels such as `proof_hold` as
  TypeScript `M04` substrate taxonomy

### Claude External-Live Qualification Is A Release Gate

The RC gate includes real F_P transport, not only deterministic source tests.

Accepted behavior:

- the RC live gates use the Claude live lane
- the RC live portfolio covers real external-live F_P stages through the
  TypeScript package surface
- each stage opens public dispatch truth and ingests a live worker artifact
- skipped live portfolio readiness is not a valid RC closure result
- the retained single-edge live UAT lane remains runnable as a direct command
- the live UAT lane now covers both transport/admission and nonce-bound
  semantic generation over challenge-specific requirements

### Deferred M06 Has No RC Obligation

`M06` trigger law is explicitly deferred. This RC does not claim executable
trigger semantics.

### ODD SDLC Source Induction Is Blocked

`B-010` is not part of this RC candidate.

Accepted behavior:

- ABG source development is not inducted under ODD SDLC governance in this RC
- no root `.genesis` source-workspace authority is claimed
- the ticket remains blocked until a stable ODD SDLC release candidate exists
  and is selected as the governing product for an ABG source-development wave

### Workspace Ledgers, Eval Suites, Graph-Span Reentry, And Cross-Workspace Outputs Are ABG Substrate

The rc.6 tranche accepts the T-082 through T-104 substrate as ABG-owned runtime
law, not downstream SDLC-local controller behavior.

Accepted behavior:

- input-only starts may allocate declared output asset instances and bounded
  materialization roots through ABG output allocation
- workspace-visible obligation ledgers and schedules are inspectable assets or
  projections under the ABG runtime surface
- F_D validates mechanical envelopes only; F_P owns requirement-by-requirement
  semantic quality judgment
- eval-suite artifacts are projection evidence over ABG run truth, not a rival
  controller
- T-100 foldback exposes the five test35 parity rules: named five-term
  closure predicate, latest-assessed-per-slice projection, retry allowlist,
  artifact salvage, and behavioral-vs-lexical finding-class split
- T-103 graph-span foldback can evaluate composed path endpoints such as
  C->D, B->D, and A->D, then route lawful reentry through replay-derived
  frontier truth
- the runner consumes admitted graph-span evidence and applies reentry; it does
  not fabricate F_P span assessments
- explicit `W1` input workspace to `W2` output workspace allocation is now an
  admitted start/allocation shape, not a downstream convention
- W2 output allocation preserves W1 input lineage and W2 output authority in
  output allocation, plugin handoff manifest, runtime events, and projection
- the mini data-mapper redux sandbox can run deterministic cross-workspace
  review streams and write forensic comparison artifacts under `test_runs`

### Typed Traversal Non-Progress Continuation Is ABG Runtime Truth

The rc.6 build 20260503.1 accepts T-106 as ABG substrate.

Accepted behavior:

- a blocked no-artifact F_P attempt is not summarized through downstream-local
  retry or triage convention
- ABG derives a replay-visible `TraversalNonProgressCarrier` from invocation,
  process, stream, timeout, artifact/report/progress, and evidence facts
- ABG projects one `TraversalContinuationActionProjection` as the public next
  action truth for that attempt
- public summaries must agree with the projected action and fail closed on
  drift
- retry eligibility composes with the T-100 retry taxonomy and T-103 graph-span
  reentry remains separate
- the runner consumes the projection at the blocked F_P no-artifact path; it
  does not inspect obligation rows, compute semantic fulfillment, or fabricate
  F_P graph-span assessment truth

### Traversal Modulation Is GTL-Qualified ABG Runtime Truth

The rc.7 cut accepts T-107 as ABG substrate.

Accepted behavior:

- traversal modulation is declared through GTL hook/config truth, with
  `GraphVector.declarations["abg.traversal_modulation"]` as the highest
  precedence edge qualifier and graph-function / role defaults below it
- ABG derives a `TraversalModulationProfile` and `TraversalAttemptEnvelope`
  only from admitted qualifier truth
- sync and async runner modes consume one shared F_P dispatch-attempt law for
  actor invocation derivation, envelope derivation, `EnginePluginInput`
  construction, and the replay-visible event spine
- unqualified F_P vectors keep the legacy null-envelope path
- malformed or duplicate present qualifiers fail closed
- prompt prose is not the scheduler command surface; the attempt envelope,
  progress rows, forced-review gates, and existing T-100/T-103/T-106
  projections are the replay authority
- ABG enforces generic scheduling primitives, schedule refs, ordering
  constraints, phase gates, progress artifact refs, retry budget, and
  non-progress classification without switching on downstream strategy labels

### Traced Agent Call-Outs And PTY Execution Are ABG Substrate

The 3.5.0-rc.1 cut accepted T-108, T-109, and T-111 as ABG substrate. The
3.5.0-rc.2 cut preserves that substrate and repairs successful PTY terminal
session identity at the ABG event/projection boundary.

Accepted behavior:

- `runAgentActorWorkerCallout` is the single framework-owned call-out interface
  for `agent.actor` and `agent.worker` execution
- agent transport and supervised actor invocation consume the same call-out
  interface rather than owning divergent shell-out paths
- framework call-out paths preserve trace archives with command metadata, raw
  stdout/stderr, final output, parser-derived structured events, timeout state,
  and result metadata
- Claude `stream-json` parsing preserves `api_retry` and tool-call observations
  when those events exist
- `local-spawn` remains the deterministic default executor profile
- `pty-terminal` is a Docker-compatible GNU `screen` backed per-call terminal
  executor profile
- PTY execution preserves the same per-call result/archive contract as
  `local-spawn`, with an additional terminal transcript available as evidence
- `ABG_TS_AGENT_EXECUTOR_PROFILE=pty-terminal` selects PTY execution across
  `runAgentTransport` and `invokeSupervisedProcessActor` when a request does
  not provide an explicit executor profile
- PTY hard timeout and inactivity timeout are distinct trace-observed terminal
  conditions
- successful PTY `actor_process_started` events and projections carry
  `terminalSessionId`, so runtime replay truth no longer depends on trace-local
  files for successful terminal session identity
- sticky session reuse, warm agent pools, and automatic session affinity remain
  future T-110 work, not 3.5.0-rc.2 behavior

### Plugin Traversal Observer Bindings Are Replay Visible

The 3.5.0-rc.2 cut accepts T-116 as the first GTL-declared plugin traversal
observer binding slice for Transform and Eval.

Accepted behavior:

- GTL observer bindings are declared through GraphVector, GraphFunction, or
  Role hook/config surfaces
- ABG resolves observer binding precedence as GraphVector, GraphFunction, Role,
  then opt-in `abg_defaults`
- prompt materialization emits replay-visible runtime events with selected
  prompt refs, contracts, config digest, causation, correlation, and source
  bundle metadata when applicable
- materialization identity is unique per materialization, not only per static
  selection
- fallback observer binding is opt-in by traversal kind; ordinary F_P runs do
  not implicitly activate it

### ABG Defaults Are Visible For The Plugin Observer Slice

The 3.5.0-rc.2 cut accepts T-117 only for the plugin traversal observer
fallback slice plus audit inventory.

Accepted behavior:

- `build_tenants/abiogenesis/typescript/config/abg.reference-fallbacks.json` is
  the shipped reference fallback bundle
- installed workspaces receive `.abiogenesis/config/abg.fallbacks.json`
- installer refresh preserves local edits to the installed fallback config
- public installed `genesis-ts`/`abiogenesis-ts` command paths load the installed
  fallback config and fail closed on malformed edited config
- runtime prompt materialization records fallback bundle ref, digest, path, and
  selected default key when a default participates

Non-claim:

- T-117 does not externalize every ABG default family. T-118 owns transport,
  PTY, timeout, parser, worker-binding, trace path, environment, retry,
  traversal-modulation, M04 request, installer, and live-harness defaults not
  closed by the plugin observer slice.

### Temporal GTL/ABG Capability Starts The 3.6.0 Line

The temporal slice moves the next release candidate from `3.5.0` to `3.6.0`
because it adds GTL syntax, ABG temporal events, Event Calculus extension, and
new replay-derived projection behavior.

Accepted behavior:

- temporal constraints attach through
  `GraphVector.declarations["abg.temporal_constraint"]`
- provider timer truth becomes ABG runtime truth only through admitted temporal
  events
- `timer_intent_admitted`, `timer_outcome_admitted`,
  `deadline_breach_admitted`, and `scheduled_continuation_reopened` map through
  declared Event Calculus effects
- temporal projection exposes eligibility rows and deadline-breach rows derived
  from admitted event truth
- homeostatic schedule/deadline pressure consumes temporal projection rows and
  does not close, fail, retry, or advance traversal directly
- non-temporal GTL graph functions remain admissible without temporal syntax

Non-claims:

- recurrence, window policy, and cloud durable provider integration remain
  future work
- T-126 owns local consolidation of repeated temporal runtime-scope construction
  after the release-candidate proof

### F_P Consciousness Evaluator Starts The 3.7.0 Line

The F_P consciousness slice moves the current release candidate from
`3.6.0-rc.1` to `3.7.0-rc.1` because it adds a generic construction evaluator
surface over linked asset truth and makes public gaps a read-only view over
that evaluator.

Accepted behavior:

- `ConstructionObservationSnapshot`,
  `ConstructionActionCatalogProjection`,
  `ObservationToActionBindingProjection`, and
  `ConstructionPriorityProjection` are the shared construction-evaluator
  carriers.
- public gaps renders typed asset gaps, candidate graph actions, blockers, and
  ranking reasons from the construction evaluator projection; it does not
  append events, admit intent, dispatch graph work, or own retry.
- configured construction priority and affect policies are admitted through
  typed M03 ingress before M04 renders them.
- bootstrap asset induction is represented as a lawful construction action over
  sparse typed assets, not as special CLI setup glue.

Non-claim:

- T-128 owns the installed runner-level loop that consumes admitted construction
  intent and invokes graph work recursively.

### System Probe Observer Liveness Starts The 3.7.1 Line

The T-129 liveness observer slice moves the current release candidate from
`3.7.0-rc.1` to `3.7.1-rc.1` because it adds one ABG-owned
probe -> observer -> disposition surface for runtime liveness.

Accepted behavior:

- every explicit runtime activity probe requires a declared
  `RuntimeSystemProbeContract`;
- runtime asset activity, including event-log, ledger, manifest, archive,
  projection/report, artifact, heartbeat, stream, and graph-call/frame activity,
  can reset the inactivity lease when admitted for the active invocation;
- `RuntimeLivenessObserverProjection` is the replay-derived source for active,
  inactive, externally interrupted, and controlled-termination truth;
- hard safety caps require typed external interruption evidence and cannot
  become final retry, block, or failure authority by themselves;
- supervised actor invocation emits generic probe facts for stdout, stderr, and
  heartbeat activity.

Non-claim:

- downstream product harnesses consume or relay ABG liveness truth through their
  own migration tickets; they are not closure authority for the ABG substrate
  ticket.

### Edge Assurance Contract Replay Completes RC2

The T-130/T-131/T-132 edge assurance wave moves the current release candidate
from `3.7.1-rc.1` to `3.7.1-rc.2` because it makes per-edge gain and close a
declared GTL/ABG contract consumed by the runner and replayed through admitted
runtime facts.

Accepted behavior:

- GTL edges can declare `abg.edge_assurance_contract` with target outcome,
  authority, evidence, gain, metric, close, residual, continuation,
  composition, structural check, and policy refs;
- absent edge assurance resolves to F_H by absentia, not inferred automated
  close;
- ABG passes the selected edge assurance contract to plugins through
  `EnginePluginInput.edgeAssuranceResolution`;
- F_P edge assurance findings are tied to recorded hook actions and admitted
  through `HookFindingAdmission`;
- plugin findings cannot own closure, ledger, event, projection, vector
  selection, or next-action authority;
- edge assurance read models expose replay-derived gain/close/residual and
  next-action basis;
- a compound traversal closes only when every required edge contributes admitted
  composition evidence;
- the installed T-132 proof runs a three-edge GTL graph over source
  information -> synthesized requirements -> formal logical requirements ->
  disambiguated design syntax;
- the terminal design-encoding edge emits a concrete
  `gtl_disambiguated_design_syntax` payload that is F_D-validated before F_P
  assurance admits semantic close.

Non-claim:

- downstream odd_sdlc test35 carry-across is not part of this ABG release cut.
  This RC gives downstream products enough substrate to bind their own
  requirement-authority closure, obligation/evidence ledger measurement,
  behavioral fulfillment, residual pressure, continuation, and A-to-Z
  composition proof.

### Canonical GTL Topology Anchors Complete RC3

The GTL type-boundary correction moves the current release candidate from
`3.7.1-rc.2` to `3.7.1-rc.3` because the product and LLM builder-guide surfaces
now state one consistent axiomatic model.

Accepted behavior:

- `Graph`, `Node`, `GraphVector`, `GraphFunction`, `Job`, and `Module` are the
  canonical topology anchors;
- those anchors do not exhaust the first-class GTL declaration surface;
- `Context`, `Operator`, `Evaluator`, `Rule`, `RefinementBoundary`,
  `CandidateFamily`, and `Role` remain first-class GTL declarations attached
  to, governing, refining, or publishing through the topology anchors;
- `ContractRef` is job indirection to a published contract, not a topology
  anchor or runtime execution target;
- downstream terms such as graph overlay, leaf, workflow lane, and app surface
  are local vocabulary until bound back to a GTL topology anchor or first-class
  declaration surface.

Non-claim:

- RC3 does not add new runtime behavior over RC2. It corrects the
  constitutional and agent-facing model so the existing runtime substrate is
  read through one consistent GTL ontology.

## Current Verification Footer

The current RC proving footer is:

- `npm run build:semantic`: `passed`
- `npm run lint:semantic`: `passed`
- `npm run lint:test-harness`: `passed`
- `npm run test:t087`: `4 passed`
- `npm run test:t097`: `5 passed`
- `npm run test:t106`: `14 passed`
- `npm run test:t111`: `4 passed`
- `npm run test:t115`: `6 passed`
- `npm run test:t116`: `5 passed`
- `npm run test:t117`: `8 passed`
- `npm run test:t119`: `17 passed`
- `npm run test:t120`: `4 passed`
- `npm run test:t121`: `4 passed`
- `npm run test:t122`: `5 passed`
- `npm run test:t123`: `6 passed`
- `npm run test:semantic`: `488 passed`
- `npm run test:t127`: `33 passed`
- `npm run test:t129`: `11 passed`
- `npm run test:t130:t131`: `20 passed`
- `npm run test:t132`: `1 passed`
- `ABG_TS_T132_LIVE=1 CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_LIVE_TIMEOUT_MS=120000 npm run test:t132:live`: `1 passed`
- `npm run test:t058`: `11 passed`
- `npm run test:t127:live`: `6 passed`
- `CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude npm run test:live`: `1 passed`
- `CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude npm run test:live:uat`: `2 passed`
- `npm run test:t119:live`: `3 passed`
- `npm run test:t125:live`: `2 passed`
- `npm run test:t116:live`: `1 passed`
- `git diff --check`: `passed`
- `npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run`: `passed`,
  package `3.7.1-rc.3`, `333 files`

Fresh 3.5.0-rc.2 live PTY plugin/actor matrix:

- `npm run test:t116:live`: `1 passed`
- summary:
  `build_tenants/abiogenesis/typescript/test_env/test_runs/t113_live_pty_claude_actor_worker/20260505T161759398Z/summary.json`
- rows: `defaultPluginActorEnabled`, `defaultPluginActorDisabled`,
  `customPluginActorEnabled`, `customPluginActorDisabled`
