# abiogenesis 3.4.0-rc.6 RC Notes

This note records accepted RC behavior for the current `v3.4.0-rc.6` line.
The package build cut is `3.4.0-rc.6+build.20260503.1`; the RC identity remains
`rc.6`.

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

## Current Verification Footer

The current RC proving footer is:

- `npm run test:t082`: `6 passed`
- `npm run test:t100:test35-parity`: `15 passed`
- `npm run test:t101`: `2 passed`
- `npm run test:t102`: `7 passed`
- `npm run test:t103`: `24 passed`
- `npm run test:t104`: `6 passed`
- `npm run test:t104:sandbox`: `1 passed`
- `npm run test:t106`: `14 passed`
- `npm run test:semantic`: `368 passed`
- `npm run lint:semantic`: `passed`
- `git diff --check`: `passed`
- `npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run`: `passed`,
  package `3.4.0-rc.6+build.20260503.1`, `310 files`
