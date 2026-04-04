# HANDOVER: ABG Total-Function Refactor

**Status**: Active handover
**Repository**: `/Users/jim/src/apps/abiogenesis`
**Audience**: Codex session running inside `abiogenesis`
**Scope**: Tight ABG/GTL engine refactor only. Do not bleed into wider product noise.

## Mission

Refactor the current ABG substrate so its run-governance semantics are:

- total
- typed
- algebraic
- centrally owned
- decoupled from product/domain interpretation

This is **not** a full migration.

It is a refactoring of the current single-machine ABG engine so higher-order
systems can rely on it.

## Product Position

Current ABG is intentionally a single-machine engine for agentic coder(s).

That is acceptable.

The important requirement is not distributed scale first. It is that the engine
be logically sound enough that:

- GTL declarations preserve meaning under execution
- graph functions can rely on truthful execution semantics
- work vectors can rely on truthful closure semantics
- higher-order homeostatic/OODD loops can rely on truthful observation

Every real-world test has been pressuring ABG/GTL because missing use cases
reveal places where the live engine is less algebraic than the design intent.

## Settled Model

Treat ABG as the assembler layer of the stack.

It should not carry domain semantics.

It should carry only:

- typed command acceptance
- typed event truth
- typed run lifecycle
- contract enforcement
- lawful routing

The canonical loop is:

`Command -> Event* -> SubstrateEvaluation -> DomainEvaluation? -> Route`

with a hard split:

- `Command`
  - request to attempt a lawful transition
- `Event`
  - fact about what happened
- `SubstrateEvaluation`
  - ABG judgment about transport/contract state
- `DomainEvaluation`
  - evaluator judgment about domain/product truth
- `Route`
  - the next lawful continuation

Do not blur those surfaces.

## Strong Categories

Prefer strong broad categories with explicit tags over sprawling taxonomies.

### Selection

`SelectionOutcome`
- `UnsupportedEdge`
- `RunCreated RunIdentity`

### Run lifecycle

`RunState`
- `Queued`
- `Started`
- `Dispatched`
- `Pending`
- `AssessedPass`
- `Failed FailureClass`
- `TimedOut`
- `Superseded`

### Failure class

`FailureClass`
- `TransportFailure`
- `NoOutput`
- `ContractFailure`
- `CertificationFailure`

The key rule is:

- `unsupported` is pre-run truth
- once `fp_dispatched` happened, `handled=false` is illegal

`pending` is a lawful unresolved state, not a mandatory waypoint.
Immediate known failures may short-circuit it. Delayed failures may emerge from it.

## Existing vs Desired Truth

There is already a lot of the right ontology in the code:

- event sourcing
- replayed run state
- transport layer
- explicit binding
- separation between traversal and dispatch

The problem is that live behavior still collapses too much meaning through:

- partial event emission
- coarse booleans
- underspecified lifecycle projection
- distributed write semantics

## Highest-Signal Gaps To Fix

### 1. Run lifecycle is modeled richer than it is emitted

Current code:
- `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/run.py`
- `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/interpret.py`

Observed gap:
- `run.py` models `queued|started|dispatched|pending|assessed|failed|timed_out|superseded`
- live traversal mainly emits:
  - `run_bound`
  - `run_started`
  - `fp_dispatched`
- production emission of `run_pending`, `run_failed`, and `run_timed_out` is not actually centralized/live

Target:
- the run lifecycle must be real event truth, not mostly replay/test vocabulary

### 2. Certification failure is collapsed into generic assessed state

Current code:
- `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/cli_adapter.py`
- `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/run.py`

Observed gap:
- `assess-result` emits `assessed{kind: fp, result: pass|fail}`
- replay maps all `assessed` to state `assessed`
- `RunState` therefore loses the distinction between:
  - pass
  - certification failure

Target:
- preserve broad categories, but do not erase `CertificationFailure`
- likely projection target:
  - `AssessedPass`
  - `Failed CertificationFailure`

### 3. Transport failure classification is unsound

Current code:
- `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/transport.py`

Observed gap:
- a nonzero exit may be treated as non-failure if a result artifact exists and parses
- that allows transport truth to be masked by artifact presence

Target:
- transport/subprocess truth must remain transport truth
- artifact presence must not erase process failure

### 4. Auto loop collapses handled-failed into handled=false

Current code:
- `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/cli_adapter.py`

Observed gap:
- `auto_fp_dispatch()` is forced into `bool`
- falsey return becomes:
  - `auto_fp_dispatch_available: true`
  - `auto_fp_dispatch_handled: false`
- this is logically false if `fp_dispatched` already happened and the handled run then failed

Target:
- replace boolean dispatch result with a structured outcome
- CLI becomes a projection of typed run truth

### 5. Event purity rule is violated by direct appends

Current code:
- `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/events.py`
- `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/interpret.py`

Observed gap:
- `events.py` says `emit()` is the only admissible write path
- traversal writes directly to `EventStream.append()`

Target:
- centralize lawful event write semantics
- do not let traversal invent its own write path and invariants

## Major Modules To Review First

### Core lifecycle / replay
- `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/run.py`

### Traversal emission seam
- `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/interpret.py`
- `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/services.py`

### Auto-loop projection / control plane
- `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/cli_adapter.py`

### Event substrate
- `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/events.py`

### Transport contract
- `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/transport.py`
- `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/subwork.py`

### Supporting seams
- `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/binding.py`
- `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/selection.py`
- `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/projection.py`

## Design Constraints

### Keep this centralized

Do not smear lifecycle semantics across:

- `interpret.py`
- `cli_adapter.py`
- transport helpers
- tests

The refactor should centralize:

- lifecycle types
- failure classes
- dispatch outcome type
- projection rules

### Keep this decoupled

ABG must not decide domain truth.

ABG may only:

- enforce transport and payload contracts
- classify substrate failure
- preserve typed state
- route lawfully

Domain evaluators decide product truth.

### Keep this algebraic

Minimize:

- overloaded booleans
- generic dict status conventions
- caller-side reinterpretation
- duplicated state meaning

Prefer:

- sum types / tagged unions
- product types with explicit tags
- total transition functions
- faithful projection functions

## Immediate Refactor Shape

### Slice 1. Introduce a central typed run outcome

Likely concept:

- `DispatchOutcome`
  - `Unsupported`
  - `Pending`
  - `AssessedPass`
  - `Failed(FailureClass)`
  - `TimedOut`
  - `Superseded`

This replaces bool-return semantics at the projection seam.

### Slice 2. Make lifecycle emission truthful

Ensure live code emits the lifecycle it claims to model:

- `run_bound`
- `run_started`
- `fp_dispatched`
- `run_pending` when truly unresolved
- `run_failed{failure_class=*}` when terminal failed
- `run_timed_out`
- `run_superseded`

### Slice 3. Reprice assessed events

Do not let `assessed{result=fail}` collapse into generic `assessed` in replay.

The replay/projected run state must preserve:

- `AssessedPass`
- `Failed CertificationFailure`

### Slice 4. Fix transport classification

Nonzero exit should not be erasable by artifact presence.

Separate:

- transport truth
- artifact existence
- contract validity

### Slice 5. Re-centralize the lawful event write path

If `emit()` is the only lawful path, make that true.

If `EventStream.append()` must remain public, then stop claiming otherwise.

But pick one rule.

## Review Guidance

When reviewing or editing, ask:

1. Is this pre-run selection truth or run-lifecycle truth?
2. Is this a command, an event, an evaluation, or a route?
3. Is this substrate enforcement or domain interpretation?
4. Is this a strong category or a vague taxonomy?
5. Does this preserve event truth faithfully?
6. Is this logic centralized, or is it being smeared across layers?

## Reference Design Note

There is a parallel design note in `genesis_sdlc` that captures the same model:

- `/Users/jim/src/apps/genesis_sdlc/.ai-workspace/comments/codex/20260404T160546Z_POST_total_function_run_lifecycle_state_machine.md`

Use it as conceptual reference only.

The actual refactor should be driven from `abiogenesis` truth, not by copying ad hoc wording from elsewhere.

## Recommended Starting Order

1. Read:
   - `run.py`
   - `interpret.py`
   - `cli_adapter.py`
   - `transport.py`
   - `events.py`
2. Write a short local design note naming the intended `DispatchOutcome` / `RunState` projection.
3. Refactor the central types first.
4. Refactor the emission path second.
5. Refactor CLI projection third.
6. Tighten tests last around the centralized semantics.

## Final Warning

Do not drift into a broad migration.

Do not “improve” adjacent product features.

Do not pull domain semantics into ABG.

The goal is a bullet-proof, algebraic, truth-preserving execution core.
