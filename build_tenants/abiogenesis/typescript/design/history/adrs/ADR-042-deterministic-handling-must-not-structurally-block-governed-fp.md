# ADR-042 — Deterministic handling must not structurally block governed F_P

**Series**: abiogenesis / typescript build
**Status**: Accepted
**Date**: 2026-04-23
**Implements**: REQ-R-ABG3-CONVERGENCE, REQ-R-ABG3-TRANSPORT, REQ-R-ABG3-POLICY
**Scope**: convergence law, regime fallback law, runtime closure/projection interpretation, package entrypoints, runtime adapters, `ABG_3_MODULE_DESIGN.md`, `design/README.md`

## Context

ABG already ratifies a broad F_P-biased default in constitutional surfaces:

- deterministic handling runs first
- if deterministic handling is absent or remains open, ABG falls forward to
  governed `F_P`
- invalid, contradictory, malformed, or engine-erroring deterministic paths
  fail closed
- unresolved deterministic observer findings after constructive work are
  emitted as runtime fact truth and do not by default regain traversal-stopping
  authority

The TypeScript line needs this stated explicitly because structural typing and
controller composition make it easy to turn deterministic helper structure into
an accidental hard gate.

## Decision

### 1. Broad default remains deterministic-first and F_P-biased

The default ABG runtime order remains:

1. run declared deterministic evaluation/proof first
2. run generic deterministic checks when available
3. if deterministic handling is absent or remains open, fall forward to
   governed `F_P`
4. after constructive work returns, re-run proof and blocker-class closure
5. escalate to `F_H` only when resolved policy still requires it

### 2. Deterministic dependency structure is not itself a hard stop

F_D surfaces may contribute:

- residual gap truth
- observer findings
- blocker-class proof inputs
- declared hard-stop policy inputs

But they must not become a structural dependency that blocks lawful governed
`F_P` dispatch merely because deterministic handling exists and has not yet
closed the boundary.

### 3. Fail-closed remains specific, not general

Deterministic handling fails closed only when it is:

- invalid
- contradictory
- malformed
- engine-erroring
- explicitly hard-stopped by resolved transition policy

Absence, openness, or unresolved non-blocking observer truth are not enough to
block governed `F_P`.

### 4. Post-transform observer truth stays downstream

When constructive work materially advances the boundary but deterministic
observer truth remains unresolved and non-blocking, ABG shall:

- emit runtime fact truth
- surface yielded or downstream-handled continuation truth
- avoid promoting that observer incompleteness back into default traversal-stop
  authority

### 5. Implementation consequence

Runtime refactors must preserve this distinction structurally.

That means:

- no F_D gate chain may become an implicit prerequisite edge for `F_P`
- no convergence refactor may encode “deterministic exists” as “F_P forbidden”
- no helper decomposition may turn open deterministic truth into accidental
  hard-stop semantics

## Consequences

### Positive

- the fall-forward rule now has one explicit ADR citation in the TypeScript
  design line
- convergence/runtime refactors have a concrete anti-regression source

### Negative

- TypeScript implementations that currently rely on helper structure as a de
  facto gate will need explicit redesign

### Follow-on

- the TypeScript runtime carrier design must preserve this ADR while refactoring
  the runtime kernel
