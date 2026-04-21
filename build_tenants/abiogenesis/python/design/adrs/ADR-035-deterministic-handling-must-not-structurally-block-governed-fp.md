# ADR-035 — Deterministic handling must not structurally block governed F_P

**Series**: abiogenesis / python build
**Status**: Accepted
**Date**: 2026-04-20
**Implements**: REQ-R-ABG3-CONVERGENCE, REQ-R-ABG3-TRANSPORT, REQ-R-ABG3-POLICY
**Scope**: convergence law, regime fallback law, runtime closure/projection interpretation, `genesis/binding.py`, `genesis/services.py`, `genesis/cli_adapter.py`, `ABG_3_MODULE_DESIGN.md`, `design/README.md`

---

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

That law is present in requirements and constitutional design, but it has not
been concentrated as one explicit Python-line design decision.

Without that concentration, refactors can drift into a common failure mode:

- F_D helper structure becomes a hard dependency graph
- unresolved deterministic handling blocks governed `F_P` structurally
- open observer truth is accidentally treated like a blocker again
- the implementation becomes more imperative while still appearing compliant

The problem is not “too much F_D”. The problem is allowing deterministic
structure to become a hidden hard-stop rather than a declared policy result.

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

- the fall-forward rule now has one explicit ADR citation in the Python design
  line
- convergence/runtime refactors have a concrete anti-regression source
- reviews can distinguish lawful fail-closed behavior from accidental
  deterministic overreach

### Negative

- runtime implementations that currently rely on helper structure as a de facto
  gate will need to be rewritten to express this law explicitly

### Follow-on

- `B-027` must preserve this ADR while refactoring the runtime carrier/algebra
- `ABG_3_MODULE_DESIGN.md` and the design index should cite this ADR as the
  focused design source for deterministic-first but F_P-biased fallback law
