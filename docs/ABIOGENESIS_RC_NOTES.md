# abiogenesis 3.4.0-rc.2 RC Notes

This note records accepted RC behavior for the current `v3.4.0-rc.2` cut.

## Accepted Framework Behavior

### TypeScript Is A Package-First RC Carrier

The TypeScript tenant is released as a package-first realization. Public
consumers should treat the package exports and binary aliases as delivery
bindings over the same GTL/ABG product grammar, not as a separate product law.

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
- B-016 remains open for broader hook-family runtime migration
- plugin outputs cannot own traversal, event, closure, graph-call, frame,
  transition, next-vector, or loop authority

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

### External-Live Qualification Is A Release Gate

The RC gate includes real F_P transport, not only deterministic source tests.

Accepted behavior:

- the RC live portfolio covers five Python live scenario families
- the RC live portfolio covers twelve external-live stages
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

## Current Verification Footer

The current RC proving footer is:

- `npm run test:b016`: `13 passed`
- `npm run test:t072`: `14 passed`
- `npm run test:t044`: `9 passed`
- `npm run test:t066`: `1 passed`
- `odd_sdlc npm run test:sandbox`: `5 passed`
- `npm run test:t012`: `9 passed`
- `npm run test:t013`: `10 passed`
- `npm run test:t072:plugins`: `7 passed`
- `npm run test:semantic`: `239 passed`
- `npm run test:t064`: `3 passed`
- `npm run lint:semantic`: `passed`
- `CODEX_LIVE_FP=1 npm run test:live`: `1 passed`, `0 skipped`,
  `153622.118375ms`
- `CODEX_LIVE_FP=1 npm run test:live:uat`: `2 passed`, `0 skipped`,
  `53448.786ms`
- `git diff --check`: `passed`
