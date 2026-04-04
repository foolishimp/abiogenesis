# Migration Plan — ABG Algebraic Core

**Status**: Proposed execution plan
**Date**: 2026-04-04
**Scope**: `build_tenants/abiogenesis/python/` and governing specification surfaces
**Driver**: replace partial/boolean run governance with a total, typed, algebraic ABG core

## Position

This is not a legacy-preserving compatibility exercise.

This migration reprices the live project truth so the canonical Python tenant has
an algebraic execution core and the specification stops encoding the old partial
model.

The operative rule is:

- update constitutional truth and core design to the intended algebra
- refactor the runtime to match
- remove compromise surfaces rather than preserving them as hidden precedent

## Target End State

ABG owns:

- command acceptance
- event emission
- run lifecycle
- transport and payload contract enforcement
- lawful routing

ABG does not own:

- domain/product truth
- business policy
- evaluator semantics beyond preserving their results faithfully

The canonical execution split is:

`Command -> Event* -> SubstrateEvaluation -> DomainEvaluation -> Route`

with these rules:

- `unsupported` is pre-run selection truth, not a run state
- once `fp_dispatched` exists for a run, `handled=false` is not a lawful summary
- `pending` is a lawful unresolved state, not a mandatory waypoint
- the event stream is the only source of run truth

## Canonical Algebra

Recommended canonical failure algebra:

- `transport_failure`
- `no_output`
- `contract_failure`
- `certification_failure`

`bad_output` should be retired as a core failure class. It is a symptom-level
diagnostic name, not a stable algebraic category. Invalid JSON, schema mismatch,
or malformed result artifacts become `contract_failure`.

Recommended canonical run-state algebra:

- `queued`
- `started`
- `dispatched`
- `pending`
- `assessed_pass`
- `failed(failure_class)`
- `timed_out`
- `superseded`

Recommended projection/control-plane outcome algebra:

- `unsupported`
- `pending(run_id)`
- `terminal(run_id, run_state)`

The CLI and auto-loop must project from this algebra. They must not invent
parallel boolean summaries.

## Event Model Decisions

The migration should preserve the distinction between evaluation fact and run
lifecycle truth.

- `assessed{kind: fp, result: pass}` remains the evaluator fact for successful certification
- `assessed{kind: fp, result: fail}` remains the evaluator fact that certification was attempted and failed
- run projection must map failed certification to `failed(certification_failure)`, not generic `assessed`
- transport, missing-output, contract, timeout, and supersession transitions must become explicit run-lifecycle truth

Two implementation patterns are acceptable:

1. Emit both evaluator fact and lifecycle event from one central transition function.
2. Emit evaluator fact and derive lifecycle failure centrally from that fact.

What is not acceptable is split logic where different layers reinterpret the same
event differently.

## Migration Principle

This work is a constitutional repricing plus code refactor.

Do not:

- preserve the old failure taxonomy in parallel
- keep direct event writes while claiming `emit()` is the only lawful path
- keep bool-return dispatch summaries after introducing typed run outcomes
- let tests remain the only place where lifecycle truth is richer than production

## Phase 0 — Reprice Project Truth

Update the live spec/design surfaces first so the project explicitly declares the
new algebra.

Primary files:

- `specification/requirements/abg/REQ-R-ABG2-RUN.md`
- `specification/requirements/abg/REQ-R-ABG2-EVENTS.md`
- `specification/requirements/abg/REQ-R-ABG2-TRANSPORT.md`
- `specification/requirements/product/REQ-P-QUAL.md`
- `specification/PRODUCT.md` if the ABG boundary wording needs tightening

Required changes:

- replace the flat successful terminal state `assessed` with explicit successful terminal truth or explicitly define `assessed_pass` as the successful projection
- replace the current core failure taxonomy with the selected algebra
- declare that canonical run truth is event-derived and centrally projected
- declare that event emission enters only through the canonical ABG surface
- declare that transport failure cannot be erased by artifact presence
- declare that CLI/product control surfaces project from typed run truth rather than inventing booleans

Acceptance gate:

- the live spec names one failure algebra and one run-state algebra
- no active requirement contradicts the intended typed core
- `bad_output` is either removed or explicitly demoted to a non-core diagnostic label

## Phase 1 — Centralize Core Types

Make one module the single owner of run algebra and projection rules.

Primary file:

- `build_tenants/abiogenesis/python/code/genesis/run.py`

Required changes:

- define canonical failure and run-state types
- define projection helpers from event stream to run truth
- define a structured control-plane outcome type for dispatch/auto-loop consumers
- define central transition helpers so lifecycle changes are emitted consistently

Acceptance gate:

- no other module defines competing lifecycle enums or ad hoc failure-class logic
- a single replay/projection function determines run truth for all callers

## Phase 2 — Re-Centralize Event Emission

Make the event contract true in code, not only in comments.

Primary files:

- `build_tenants/abiogenesis/python/code/genesis/events.py`
- `build_tenants/abiogenesis/python/code/genesis/interpret.py`
- `build_tenants/abiogenesis/python/code/genesis/cli_adapter.py`
- `build_tenants/abiogenesis/python/code/genesis/services.py`

Required changes:

- route all runtime writes through canonical emit helpers
- stop calling `EventStream.append()` directly from traversal and recursive-state helpers
- enforce common run/work provenance at the canonical event surface
- centralize lifecycle-event construction so traversal does not invent payloads ad hoc

Acceptance gate:

- `interpret.py` and related orchestration code no longer write directly to `EventStream.append()`
- event invariants are enforced at the lawful write boundary

## Phase 3 — Make Transport Classification Total

Refactor transport and result classification so substrate truth stays substrate truth.

Primary files:

- `build_tenants/abiogenesis/python/code/genesis/transport.py`
- `build_tenants/abiogenesis/python/code/genesis/subwork.py`

Required changes:

- nonzero exit and timeout remain transport failure even if an artifact exists
- missing artifact or empty artifact is `no_output`
- malformed artifact or schema-invalid artifact is `contract_failure`
- successful subprocess plus valid artifact is not enough by itself to claim certification success

Acceptance gate:

- each failure class has a unique classification path
- no artifact presence can mask subprocess failure

## Phase 4 — Make Lifecycle Emission Truthful

The runtime must emit the lifecycle it claims to govern.

Primary files:

- `build_tenants/abiogenesis/python/code/genesis/interpret.py`
- `build_tenants/abiogenesis/python/code/genesis/run.py`

Required changes:

- centralize emission of `run_bound`, `run_started`, `fp_dispatched`, `run_pending`, `run_failed`, `run_timed_out`, `run_superseded`
- ensure pending-run deduplication is based on projected run truth, not caller-local guesses
- ensure certification failure becomes explicit run-failure truth in projection or emission
- ensure supersession and retry semantics use the same central transition rules

Acceptance gate:

- production execution emits full lifecycle truth
- the run model is no longer richer than the live emitted event stream

## Phase 5 — Rebuild CLI and Auto-Loop as Projection

The CLI is a control plane, not a second semantics engine.

Primary file:

- `build_tenants/abiogenesis/python/code/genesis/cli_adapter.py`

Required changes:

- replace `bool(auto_fp_dispatch(...))` with typed outcome handling
- remove `auto_fp_dispatch_handled = false` as the summary of a failed handled dispatch
- make `assess-result` use the central run-algebra/lifecycle helpers
- make command exit/status reporting a projection of canonical run truth

Acceptance gate:

- CLI status summaries are derivable from central run projection
- no boolean control-plane field contradicts emitted lifecycle truth

## Phase 6 — Reprice Tests and Scenarios

Tests must validate the new algebra directly.

Primary surfaces:

- `build_tenants/abiogenesis/python/tests/`
- scenario/evidence surfaces that assert run/failure behavior

Required changes:

- replace assertions keyed to flat `assessed` success/failure semantics
- add unit tests for run projection, event invariants, and failure classification
- add integration tests for dispatch success, transport failure, no-output, contract failure, certification failure, timeout, and supersession
- update qualification diagnostics to use the selected failure algebra

Acceptance gate:

- every failure class has deterministic tests
- lifecycle replay tests prove the same event stream yields the same projected run truth

## Phase 7 — Remove Compromise Surfaces

After the new algebra is live, remove transitional ambiguity.

Required changes:

- remove old taxonomy references from spec, code, and tests
- remove direct-write helpers or make them private implementation details under canonical emit helpers
- remove ad hoc dict/boolean summaries that duplicate lifecycle meaning

Acceptance gate:

- there is one live run algebra
- there is one live failure algebra
- there is one lawful event-emission path

## Recommended File Order

Work in this order to avoid spreading incompatible semantics:

1. Spec repricing
2. `run.py`
3. `events.py`
4. `transport.py`
5. `interpret.py`
6. `cli_adapter.py`
7. tests

## Main Risks

- dual truth surfaces during migration if spec and code are changed in separate conceptual passes
- duplicate semantics if evaluator facts and lifecycle events are both emitted without one central transition function
- stale qualification/test language retaining `bad_output` after the core moves to `contract_failure`
- recursive/frame machinery continuing to bypass the lawful event surface

## Completion Criteria

The migration is complete only when all of the following are true:

- the active specification declares the algebraic core explicitly
- the canonical Python tenant implements that same algebra
- production events carry the full run truth needed for replay
- CLI/control-plane behavior is a projection of central run truth
- tests validate the new algebra directly
- no legacy semantic compromise remains as live project truth
