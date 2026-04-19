# ADR-033 — Primary Public `gen-start` Execution-Chain Proof

**Series**: abiogenesis / claude_code build
**Status**: Accepted
**Date**: 2026-04-19
**Implements**: REQ-P-POLICY, REQ-P-QUAL, REQ-R-ABG3-BINDING, REQ-R-ABG3-EVENTS
**Scope**: installed non-live qualification, `test_sandbox_install.py`, `test_cli_adapter_auto.py`, public operator proof lanes

---

## Context

Abiogenesis has just raised the public operator surface materially:

- `gen-start`
- `scope + target + until`
- public target families:
  - `next`
  - `graph_function:<published_handle>`
  - `asset:<published_handle>` when the runtime publishes an operator asset registry
- public control-mode families outside `StartIntent`:
  - `fh_mode`
  - `root_mode`

Adapter-local tests are necessary but not sufficient for this cut.

The risk is not primarily parser breakage. The risk is hidden interface debt:

- target resolution that narrows differently in the installed line
- control-mode behavior that is adapter-local rather than product truth
- bridge assumptions that only appear when one operator input perturbs a deeper chain

The most valuable proof is therefore not a full Cartesian matrix. It is one visible execution chain for each primary public family, where a small operator input change causes a different downstream manifest, job, event, or projection path.

## Decision

### 1. Primary proof is execution-chain proof, not parser-local proof

For the public `gen-start` contract, the proving standard is:

- one operator input enters through the installed or consumed public seam
- request normalization preserves the intended distinction
- target or mode selection changes the lawful downstream route
- the changed route is visible in manifest, event, or projection truth

Pure parser-state assertions are supportive proof only.

### 2. Primary public target and control families each need one chain proof

This line requires at least one traceable proof chain for:

1. `graph_function:<published_handle>`
2. `asset:<published_handle>` through the published operator asset registry
3. `root_mode=supervised`
4. `proof_hold_policy.enabled=false`

The first three belong in installed non-live qualification.

The last belongs at the consumed policy seam if install-time runtime configuration cannot yet express the full policy mapping lawfully.

### 3. Proof should show a deeper runtime effect, not only acceptance at the boundary

For these chains, the required downstream evidence is one or more of:

- selected manifest edge
- narrowed semantic job set
- dispatched edge
- assessed edge
- converged edge
- projected hold or status surface

The tests should demonstrate that the operator input "wiggles" one of these deeper surfaces.

### 4. Exhaustive permutation testing is not the goal of this ADR

This ADR does not require a full cross-product over:

- every scope
- every target
- every until value
- every control mode

The purpose is primary execution-path traceability, not combinatorial coverage.

Broader permutation coverage may be added later if the public surface expands again or installed-line behavior starts to drift.

## Consequences

### Positive

- proof now matches the actual public capability increase
- installed qualification becomes a better detector of interface assumptions
- reviewers can trace operator input through deeper runtime consequences

### Negative

- installed qualification fixtures become more specialized
- some policy proof remains below the install seam until runtime config can express that policy lawfully

### Follow-on

- `B-026` is the execution ticket for this ADR
- installed-line proof should gradually move away from `iterate` as the primary qualification witness for new public `gen-start` behavior
