# ADR-041 — Runtime execution law is carrier-and-event owned

**Series**: abiogenesis / typescript build
**Status**: Accepted
**Date**: 2026-04-23
**Implements**: REQ-R-ABG3-EVENTS, REQ-R-ABG3-INTERPRET, REQ-R-ABG3-JOB-WORKER, REQ-R-ABG3-RUN, REQ-P-POLICY
**Scope**: future TypeScript engine kernel, package entrypoints, runtime adapters, install/bind surfaces, operator projection surfaces, `design/README.md`

## Context

ABG already has the right constitutional law:

- `emit()` is the only lawful write path
- hidden controller memory is illegal
- runtime truth must be replay-visible
- public operator behavior must be projection over ABG truth rather than a
  rival semantic center

The TypeScript line is especially exposed to drift because TypeScript makes it
easy to:

- reconstruct meaning in entrypoint/controller code
- pass open JSON around under typed envelopes
- let runtime adapters or package glue act like runtime owners

That is not acceptable for this line.

## Decision

### 1. Runtime execution law is carrier-and-event owned

ABG runtime meaning shall be centered in:

- published runtime carriers
- explicit graph-owned transitions
- authoritative events emitted through `emit()`
- projections derived from those events and carriers

Controller code is not a semantic center.

### 2. Package entrypoints and adapters are delivery bindings only

Package entrypoints, runtime adapters, install/bind surfaces, and operator
presentation layers may:

- parse operator input
- normalize delivery bindings
- call the lawful runtime entry surface
- present projections and control-plane outputs

They shall not define a rival runtime doctrine.

### 3. Public advancement helpers are not allowed to remain semantic centers

Compatibility or delivery helpers may survive during migration, but the runtime
law must live in explicit carriers, transitions, and replay-derived
projections.

Closure on later TypeScript runtime refactors is blocked while controller or
entrypoint helpers still serve as the authoritative semantic center in normal
execution.

### 4. Regime law must read as one runtime algebra

F_D, F_P, and F_H may still use distinct helper or provider implementations,
but the runtime must not force readers to reconstruct the runtime doctrine from
separate procedural helpers.

The governing truth must be readable as one runtime algebra over the same
carrier/event family.

### 5. Runtime config is ingress, not a semantic center

Runtime config remains lawful as:

- adapter/bootstrap input
- provider wiring
- environment/config ingress

It is not lawful as a rival semantic authority for advancement, admission,
target meaning, or runtime closure.

### 6. Projections remain downstream

Stop predicates, live status, proof hold, gap summaries, and related operator
surfaces are projections.

They must derive from runtime carriers and event truth rather than reconstruct
meaning from controller-local result shapes or hidden mutable state.

## Consequences

### Positive

- one explicit runtime-execution law now governs the TypeScript design line
- later TypeScript runtime refactors have a stable source to cite
- entrypoint-oriented readings of the runtime boundary are demoted

### Negative

- some natural TypeScript helper patterns are now explicitly illegal at the
  semantic center

### Follow-on

- the TypeScript line must introduce explicit runtime carrier families before
  code migration can claim real progress
