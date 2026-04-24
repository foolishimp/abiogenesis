# Remaining TypeScript Optimization Ledger

**Status**: Active
**Date**: 2026-04-24
**Purpose**: Record the optimization reasoning discovered while front-running
the remaining TypeScript tenant waves, distinguishing local absorb-now cleanup
from cross-boundary repricing that requires explicit ticketed re-entry.

## 1. Rule

Optimization is lawful here only when it is:

- boundary-local
- behavior-preserving at the semantic boundary
- authority-neutral

If an opportunity crosses module boundaries, changes carrier ownership, widens
public truth, or reprices runtime doctrine, it must already have or receive its
own ticket.

## 2. Local Absorb-Now Opportunities

### `T-016` Event Ingress

- reuse admitted public-start and control-loop grammar where event-ingress
  payloads overlap existing request selectors or runtime identity projections
- keep app-owned ingress validation as one parse/admit step before canonical
  kernel emission
- avoid introducing a second event-append path in app code

### `T-017` Result Assessment

- share artifact/result parsing between result-assessment ingress and later
  transport/result protocol only through declared protocol carriers
- keep result assessment as projection/routing over canonical ingest truth,
  not a second ingestion authority

### `T-018` Live Status

- derive live-status entirely from admitted upstream runtime/app carriers
  rather than introducing a local mutable cache or second closure tracker
- prefer projection helpers over long-lived observer state

### `T-019` Install Bootstrap

- build install completeness checks over one explicit package/install manifest
  view instead of repeated filesystem convention scans
- keep installed-root verification reusable by later sandbox/install proof

### `T-020` Bootloader

- keep bootloader delivery verification over upstream install/bootstrap truth
  rather than duplicating install discovery logic
- share delivery-root projection with `T-019` where the boundary stays owned by
  install/bootstrap

### `T-021` Qualification Foundation

- derive method-trace and fake-lane harnesses from the forward module matrix
  instead of ad hoc per-test scenario inventories
- consolidate fixture construction at the module-boundary level, not helper
  shape

### `T-022` Installed Sandbox

- reuse installed-root and archive verification carriers already declared by
  `T-019` and future archive proof surfaces
- keep live and fake scenario harnesses on one interface contract

## 3. Cross-Boundary Repricing Already Ticketed

- `T-014`: `M02 -> M03` lookup-authority repricing
- `T-025`: `M04` public asset-addressing through a published operator asset
  registry
- `T-026`: late `M03` governed transport and result-artifact protocol

These are not opportunistic cleanup inside another wave.
They are already explicit cross-boundary changes and must stay isolated.

## 4. Do-Not-Smuggle Rules

Later waves must not silently absorb:

- `M03` carrier or event-family repricing under an `M04` ticket
- asset-registry ownership changes under event-ingress or result-assessment
- install/bootstrap delivery doctrine changes under `M05`
- scenario or qualification doctrine changes under bootloader or transport work

If one of those becomes necessary, create a new triage ticket.

## 5. Consequence

The remaining TypeScript waves should leave each opened area better than it was
found, but only inside the owning boundary.

The optimization baseline for the remaining chain is now:

- local cleanup: absorb within the owning future ticket
- cross-boundary repricing: isolate by explicit ticket and review
