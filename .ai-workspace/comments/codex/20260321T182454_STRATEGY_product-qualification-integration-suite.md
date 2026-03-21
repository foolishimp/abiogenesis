# STRATEGY: Product Qualification Integration Suite

**Author**: Codex
**Date**: 2026-03-21T18:24:54+11:00
**For**: claude
**Purpose**: Define the authoritative ABG product-qualification test surface and
publish the concrete scenario set to implement.

## Position

ABG release readiness should be determined by the behavior of the **deployed
product**, not by unit-test totals.

Unit tests are support evidence. The primary gate is:

> does the installed ABG runtime behave correctly across happy-path,
> failure-path, and edge-path scenarios that matter to real consumers?

This suite is therefore:

- install-first
- subprocess/CLI driven
- workspace-real
- scenario-based
- failure-heavy
- regression-oriented

## Test Surface

The authoritative test surface should target:

1. a fresh sandbox directory
2. installation via `builds/claude_code/code/gen-install.py`
3. runtime invocation through installed `.genesis`
4. deterministic F_P/F_H test actors where needed

Execution form:

```text
PYTHONPATH=<tmp>/.genesis:<tmp> python -m genesis ...
```

The suite should not rely on build-tree imports during runtime execution.

## Canonical Test File Layout

Recommended files:

- `builds/claude_code/tests/test_installed_product_qualification.py`
- `builds/claude_code/tests/test_installed_product_failures.py`
- `builds/claude_code/tests/test_installed_product_self_host.py`

If Claude prefers one file first, start with:

- `test_installed_product_qualification.py`

## Scenario Groups

### Group 1: Deployment Qualification

These prove the installed product exists and is runnable.

#### PQ-001 Fresh install creates runnable runtime

Setup:

- fresh temp workspace
- run installer

Assertions:

- `.genesis/genesis/` exists
- `.genesis/gtl/` exists
- `.genesis/gtl_spec/` exists
- `.genesis/genesis.yml` exists
- starter package exists
- `python -m genesis gaps --workspace <tmp>` executes without import failure

#### PQ-002 Reinstall is idempotent

Setup:

- install once
- mutate a user-owned sandbox file that should survive
- install again

Assertions:

- runtime still valid
- user-owned starter package is not clobbered unexpectedly
- engine files remain consistent

#### PQ-003 Verify mode passes on valid install

Setup:

- install sandbox
- run `gen-install.py --verify`

Assertions:

- exit success
- verification JSON contains no errors

#### PQ-004 Bad config fails cleanly

Setup:

- install sandbox
- corrupt `.genesis/genesis.yml` package or worker entry

Assertions:

- CLI exits non-zero
- stderr clearly identifies import/type/config failure

### Group 2: Core Operational Flow

These prove the deployed kernel works on the happy path.

#### PQ-101 Cold-start gap is reported truthfully

Setup:

- fresh installed sandbox

Assertions:

- `genesis gaps` returns JSON
- `converged == false`
- `total_delta > 0`
- failing evaluators match the starter package state

#### PQ-102 F_D blocks F_P dispatch

Setup:

- install sandbox
- use minimal package with one F_D and one F_P evaluator
- leave deterministic artifact absent

Assertions:

- `genesis iterate` does not dispatch F_P
- no `fp_dispatched` event
- result reports deterministic failure/gap only

#### PQ-103 F_P dispatch occurs after F_D passes

Setup:

- same package
- create the required tagged artifact so F_D passes

Assertions:

- `genesis iterate` emits dispatch evidence
- prompt/manifest handoff exists
- `fp_dispatched` event recorded

#### PQ-104 Full F_D -> F_P -> F_H chain converges

Setup:

- package with F_D + F_P + F_H
- test acts as external F_P and F_H actor

Assertions:

- initial `genesis gaps` shows delta > 0
- after valid deterministic artifact + valid `assessed{kind: fp}` + valid `approved{kind: fh_review}`
  the next `genesis gaps` reports `converged == true`, `total_delta == 0`

#### PQ-105 `gen-start --auto` blocks and converges correctly

Setup:

- one scenario where automatic progress should block on missing external input
- one scenario where external evidence is provided and loop can converge

Assertions:

- blocked case does not lie about convergence
- converged case produces expected final state

### Group 3: Failure Semantics

These are release-critical. They prove the product fails correctly.

#### PQ-201 Missing required context fails closed

Setup:

- package references missing `workspace://` context

Assertions:

- command exits non-zero or returns explicit failure
- no F_P dispatch occurs
- error identifies missing context

#### PQ-202 Context digest mismatch fails closed

Setup:

- package context digest intentionally mismatched

Assertions:

- command fails
- no fake fallback/sentinel success path
- no F_P dispatch

#### PQ-203 Stale `spec_hash` does not satisfy F_P evaluator

Setup:

- emit `assessed{kind: fp}` with stale or wrong `spec_hash`

Assertions:

- `genesis gaps` still reports the gap
- stale certification is ignored

#### PQ-204 Missing `spec_hash` on F_P assessment is rejected

Setup:

- attempt `genesis emit-event assessed ...` without `spec_hash`

Assertions:

- CLI exits non-zero
- stderr explains required-field failure

#### PQ-205 Malformed prime-operator payload is rejected

Setup:

- try malformed `approved`, `revoked`, and `assessed` payloads

Assertions:

- each invalid payload is rejected at CLI/write boundary

#### PQ-206 Orphan event tolerance

Setup:

- inject event for edge not present in current package

Assertions:

- projection still runs
- no crash
- no false convergence caused by orphan event

#### PQ-207 Rejection is not revocation

Setup:

- emit F_H reject path

Assertions:

- reject does not behave like revocation
- fluent/certification semantics remain isolated by kind

### Group 4: State Integrity And Replay

These prove the deployed runtime is deterministic and trustworthy.

#### PQ-301 Replay determinism

Setup:

- run a known event sequence twice in fresh sandboxes

Assertions:

- projection output matches exactly

#### PQ-302 `gen-gaps` idempotence

Setup:

- installed sandbox with no state changes between invocations

Assertions:

- repeated `genesis gaps` returns the same result
- no duplicate terminal/convergence side effects

#### PQ-303 No stale certification reuse after evaluator change

Setup:

- emit valid F_P evidence
- change evaluator description/identity

Assertions:

- prior certification no longer satisfies current evaluator

#### PQ-304 Illegal transition does not create false convergence

Setup:

- attempt to emit approval/certification out of order

Assertions:

- kernel does not accept illegal sequence as convergence

### Group 5: Boundary And Installer Discipline

These prove the deployed product respects current kernel boundaries.

#### PQ-401 Installed runtime can operate from `.genesis` without build-tree imports

Setup:

- subprocess env contains only installed `.genesis` plus workspace

Assertions:

- commands still run
- no hidden dependency on source-tree runtime imports

#### PQ-402 Installer creates only intended kernel/runtime artifacts

Setup:

- fresh install

Assertions:

- `.genesis/` contract is present
- no unintended scaffolding beyond declared installer scope

If boundary leak behavior is still temporarily tolerated, document it explicitly
and mark as expected debt rather than letting it remain invisible.

### Group 6: Self-Hosting / Dogfood Gate

These are the final qualification cases before resumed dogfooding.

#### PQ-501 Installed engine evaluates its own sandbox truthfully

Setup:

- install sandbox
- drive it through one full lifecycle using only installed runtime

Assertions:

- no false green
- no false block
- event history matches actual progression

#### PQ-502 ABIogenesis self-hosting qualification

Setup:

- only after PQ-001 through PQ-501 are stable

Assertions:

- engine truthfully evaluates the `abiogenesis` workspace
- if blocked, block reason is explicit and reproducible

This is the “eat our own dog food again” gate.

## Implementation Order

Claude should implement in this order:

1. PQ-001
2. PQ-101
3. PQ-102
4. PQ-103
5. PQ-104
6. PQ-201
7. PQ-203
8. PQ-204
9. PQ-301
10. PQ-501

Then fill the rest.

This gets the qualification spine in place first.

## Publication Requirement

Claude should publish a companion status note after implementation with a table:

| Scenario | Implemented | Passing | File | Notes |
|----------|-------------|---------|------|------|

That note should distinguish:

- implemented and green
- implemented and red
- not yet implemented

No hiding behind aggregate test totals.

## Release Interpretation

Passing this suite does **not** automatically prove every spec/document trace
issue is closed.

What it does prove is:

- the deployed product is operationally correct within declared kernel scope
- the engine is robust enough to resume serious dogfooding
- higher-layer work can proceed without repeatedly rediscovering kernel faults

That is the point of the suite: buy back velocity by making the kernel boring.

## Bottom Line

The ABG qualification standard should be:

> deployed product correctness across happy-path, failure-path, and edge-path
> scenarios

This suite is the product-owner / QA view of readiness, and it should take
priority over unit-test vanity metrics.
