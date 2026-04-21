# ADR-036 — ABG runtime advancement uses `ExecutionBasis` and `AdvancementTransition`

**Series**: abiogenesis / python build
**Status**: Accepted
**Date**: 2026-04-20
**Implements**: REQ-R-ABG3-INTERPRET, REQ-R-ABG3-EVENTS, REQ-R-ABG3-CONVERGENCE, REQ-R-ABG3-RUN, REQ-R-ABG3-POLICY
**Scope**: `genesis/services.py`, `genesis/interpret.py`, `genesis/dispatch_runtime.py`, `genesis/binding.py`, `genesis/policy.py`, `genesis/proof_hold.py`, `genesis/live_status.py`, `design/README.md`, `B-027`

---

## Context

ADR-034 established that runtime execution law is carrier-and-event owned.
ADR-035 established that deterministic handling must not structurally block
lawful governed `F_P`.

`B-027` exposed the remaining gap: those laws still do not name the actual
upstream runtime carrier that replaces controller ownership.

Without that carrier, the runtime keeps falling back to imperative semantic
centers:

- `gen_start()` and `gen_iterate()`
- `_derive_state()` and `_close_completed_features()`
- `_iterated_outcome()` in `interpret.py`
- dynamic policy and dispatch selection in `dispatch_runtime.py`
- `runtime_config` as a side-channel for operator meaning, policy, and
  proof-hold semantics

The result is declarative constitutional language with imperative runtime
execution.

## Decision

### 1. One upstream runtime carrier family names advancement truth

ABG runtime advancement is centered on a closed typed carrier family:

- `ExecutionBasis`
- `AdvancementTransition`

These are the upstream runtime carriers for `B-027`.

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

- an open dict
- a generic scratchpad
- a transport config bag
- a second controller memory surface

`StartIntent` remains the public operator request contract. `ExecutionBasis` is
the internal admitted runtime basis derived beneath that public contract.

### 3. `AdvancementTransition` is a closed typed transition family

`AdvancementTransition` is the sealed-sum style carrier that states what kind
of runtime step the engine is performing next.

The family is closed and regime-shaped. The minimum variants are:

- `FdAdvanceTransition`
- `FpDispatchTransition`
- `FhEscalationTransition`
- `TerminalTransition`

Equivalent concrete type names are acceptable only if the same law is
preserved:

- explicit discriminant
- explicit typed fields per variant
- pattern-match style consumption
- no `.get()`-driven interpretation as the primary runtime-reading model

### 4. Public advancement binds through the carrier family

The intended shape for public advancement is:

1. adapter parses public operator input into `StartIntent`
2. runtime derives `ExecutionBasis`
3. runtime derives one `AdvancementTransition`
4. transition execution emits authoritative events through `emit()`
5. projections derive stop, status, proof-hold, and gap truth downstream

This keeps the public contract stable while moving semantic authority out of
controllers.

### 5. Regime law reads from the same family

F_D, F_P, and F_H are not separate doctrinal centers.

They are explicit regime-shaped variants over the same carrier family.

That means:

- deterministic transitions cannot smuggle agent-dispatch law
- probabilistic transitions cannot masquerade as deterministic closure
- human transitions cannot act as a hidden controller side channel
- open deterministic handling does not structurally forbid
  `FpDispatchTransition` where resolved runtime policy still requires
  constructive work

### 6. `runtime_config` stays outside the carrier family

`runtime_config` remains ingress and provider wiring only.

It may help derive policy or transport inputs, but it must not become part of
the authoritative runtime carrier family for advancement truth.

For this line, config-backed operator-asset and asset-binding contracts are
lawful only when they are admitted once at explicit boundaries such as
`Scope`, bootstrap/install bindings, or `admit_traversal_runtime(...)`, and
then carried forward as typed contracts. Raw config readers are not lawful
runtime authority inside the kernel.

### 7. Transitional helpers may adapt into the carrier family, but are not authority

During `B-027`, existing helpers may temporarily survive as adapters into or
out of `ExecutionBasis` and `AdvancementTransition`.

That does not make them lawful semantic centers.

Closure is blocked while any of these remain the authoritative owner of runtime
meaning in normal execution:

- `gen_start()`
- `gen_iterate()`
- `_derive_state()`
- `_close_completed_features()`
- `_iterated_outcome()`
- dynamic dispatch selection in `dispatch_runtime.py`

## Consequences

### Positive

- `B-027` now has a named upstream carrier family
- the Python line has one explicit answer to what replaces controller-owned
  runtime law
- the next code slice can be judged structurally, not by naming alone
- reviews can reject dict-shaped shims and partial imperative rewrites

### Negative

- some existing helper shapes will become obviously transitional
- the runtime may remain broken at the public controller seam until those
  helpers are rebound to the new family

### Follow-on

- `B-027` must rebuild from this carrier family, not around it
- `design/README.md` should list this ADR alongside ADR-034 and ADR-035 as the
  governing runtime-shape source
