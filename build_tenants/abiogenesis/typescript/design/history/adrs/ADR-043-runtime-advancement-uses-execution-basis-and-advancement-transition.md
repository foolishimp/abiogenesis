# ADR-043 — Runtime advancement uses `ExecutionBasis` and `AdvancementTransition`

**Series**: abiogenesis / typescript build
**Status**: Accepted
**Date**: 2026-04-23
**Implements**: REQ-R-ABG3-INTERPRET, REQ-R-ABG3-EVENTS, REQ-R-ABG3-CONVERGENCE, REQ-R-ABG3-RUN, REQ-R-ABG3-POLICY
**Scope**: future TypeScript engine kernel, runtime interpretation, dispatch runtime, policy resolution, proof hold, live status, `design/README.md`

## Context

ADR-041 established that runtime execution law is carrier-and-event owned.
ADR-042 established that deterministic handling must not structurally block
lawful governed `F_P`.

The remaining gap is the same one the Python line had to close:
those laws still need a named upstream runtime carrier that replaces controller
ownership.

Without that carrier, the TypeScript runtime will drift toward:

- package entrypoints as semantic centers
- open object payloads under interface shells
- policy and dispatch meaning recovered procedurally
- runtime choice leaking into kernel law

## Decision

### 1. One upstream runtime carrier family names advancement truth

ABG runtime advancement is centered on a closed typed carrier family:

- `ExecutionBasis`
- `AdvancementTransition`

These are the upstream runtime carriers for the TypeScript line.

### 2. `ExecutionBasis` is the immutable admitted basis for one advancement attempt

`ExecutionBasis` holds the run-scoped, already-resolved basis needed to
interpret one advancement step.

At the design level it owns explicit typed fields for:

- public request provenance (`StartIntent` or lower equivalent request ref)
- module / graph-function / executable-job identity
- workspace and run identity
- work-key and frame lineage identity where relevant
- resolved runtime identity
- resolved policy identity
- admitted runtime facts needed before regime evaluation

It does not act as:

- an open object bag
- a generic scratchpad
- transport config state
- a second controller memory surface

### 3. `AdvancementTransition` is a closed typed transition family

`AdvancementTransition` is the discriminated-union carrier that states what
kind of runtime step the engine is performing next.

The family is closed and regime-shaped. The minimum variants are:

- `FdAdvanceTransition`
- `FpDispatchTransition`
- `FhEscalationTransition`
- `TerminalTransition`

Equivalent concrete type names are acceptable only if the same law is
preserved:

- explicit discriminant
- explicit typed fields per variant
- exhaustive pattern matching
- no `.get()`-driven interpretation as the primary runtime-reading model

### 4. Public advancement binds through the carrier family

The intended shape for public advancement is:

1. adapter parses public operator input into `StartIntent`
2. runtime derives `ExecutionBasis`
3. runtime derives one `AdvancementTransition`
4. transition execution emits authoritative events through `emit()`
5. projections derive stop, status, proof-hold, and gap truth downstream

### 5. Regime law reads from the same family

F_D, F_P, and F_H are not separate doctrinal centers.

They are explicit regime-shaped variants over the same carrier family.

That means:

- deterministic transitions cannot smuggle agent-dispatch law
- probabilistic transitions cannot masquerade as deterministic closure
- human transitions cannot act as a hidden controller side channel

### 6. Runtime config stays outside the carrier family

Runtime config remains ingress and provider wiring only.

It may help derive policy or transport inputs, but it must not become part of
the authoritative runtime carrier family for advancement truth.

### 7. Transitional helpers may adapt into the carrier family, but are not authority

During migration, existing helpers may temporarily survive as adapters into or
out of `ExecutionBasis` and `AdvancementTransition`.

That does not make them lawful semantic centers.

## Consequences

### Positive

- the TypeScript line now has a named upstream runtime carrier family
- future code review can reject interface shells over open payload truth
- runtime portability can stay below the same carrier/event law

### Negative

- some natural “just pass an object through” TypeScript patterns are now
  explicitly illegal

### Follow-on

- the first TypeScript runtime code slice must build these carriers early
- `ABG_3_MODULE_DESIGN.md` and `design/README.md` should treat this ADR as the
  governing runtime-shape source for the current line
