# ADR-034 — Runtime execution law is carrier-and-event owned

**Series**: abiogenesis / python build
**Status**: Accepted
**Date**: 2026-04-20
**Implements**: REQ-R-ABG3-EVENTS, REQ-R-ABG3-INTERPRET, REQ-R-ABG3-JOB-WORKER, REQ-R-ABG3-RUN, REQ-P-POLICY
**Scope**: `genesis/services.py`, `genesis/binding.py`, `genesis/cli_adapter.py`, `genesis/live_status.py`, `app_bootstrap.py`, `gen-install.py`, `design/README.md`

---

## Context

ABG already has the right constitutional law:

- `emit()` is the only lawful write path
- hidden controller memory is illegal
- runtime truth must be replay-visible
- public operator behavior must be projection over ABG truth rather than a
  rival semantic center

But the current Python runtime line still spreads execution law across multiple
imperative seams:

- `gen_start()` and `gen_iterate()` act as controller-owned semantic centers
- regime binding is still expressed through procedural helpers
- `runtime_config` still carries more semantic authority than plain ingress
- CLI/bootstrap/install layers can still read like runtime owners rather than
  delivery bindings

The design surface also helped legitimize that drift by treating one-step
engine progression plus app-level orchestration as a stable design assumption.

That assumption is no longer acceptable for this line.

## Decision

### 1. Runtime execution law is carrier-and-event owned

ABG runtime meaning shall be centered in:

- published runtime carriers
- explicit graph-owned transitions
- authoritative events emitted through `emit()`
- projections derived from those events and carriers

Controller code is not a semantic center.

### 2. Controller and adapter layers are delivery bindings only

`genesis.cli_adapter`, `app_bootstrap.py`, and `gen-install.py` may:

- parse operator input
- normalize delivery bindings
- call the lawful runtime entry surface
- present projections and control-plane outputs

They shall not define a rival runtime doctrine.

### 3. `gen_start()` and `gen_iterate()` are not allowed to remain semantic centers

These functions may continue to exist as delivery or compatibility boundaries
during migration, but the runtime law must move out of controller sequencing and
into explicit carriers, transitions, and replay-derived projections.

Closure on later runtime refactors is blocked while these functions still serve
as the authoritative semantic center in normal execution.

### 4. Regime law must read as one runtime algebra

F_D, F_P, and F_H may still use distinct helper or provider implementations,
but the runtime must not force readers to reconstruct the runtime doctrine from
separate procedural helper functions.

The governing truth must be readable as one runtime algebra over the same
carrier/event family.

### 5. `runtime_config` is ingress, not a semantic center

`runtime_config` remains lawful as:

- adapter/bootstrap input
- provider wiring
- environment/config ingress

It is not lawful as a rival semantic authority for advancement, admission,
target meaning, or runtime closure.

### 6. Projections must remain downstream

Stop predicates, live status, proof hold, gap summaries, and related operator
surfaces are projections.

They must derive from runtime carriers and event truth rather than reconstruct
meaning from controller-local result shapes or hidden mutable state.

## Consequences

### Positive

- one explicit runtime-execution law now governs the Python design line
- later runtime refactors have a stable source to cite
- controller-oriented readings of the runtime boundary are demoted
- functional/declarative review has a concrete enforcement surface

### Negative

- some current design wording is now obsolete and must be rewritten
- some existing runtime helper boundaries are now explicitly transitional
  rather than stable design shape

### Follow-on

- `B-027` is the main runtime refactor ticket that will realize this law in
  code
- the design index must point to this ADR as the governing runtime-law source
  for the current line
