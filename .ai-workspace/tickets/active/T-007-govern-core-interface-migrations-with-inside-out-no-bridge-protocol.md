# T-007 Govern Core Interface Migrations With Inside-Out No-Bridge Protocol

- id: T-007
- title: Govern core interface migrations with an inside-out no-bridge protocol
- type: feature
- status: active
- goal: core-interface-migration-governance
- change_intent: Standardize ABIogenesis core interface refactors under an inside-out migration protocol so substrate changes migrate all producers, consumers, projections, and proof lanes to one authoritative contract before closure.
- change_class: design_reframe
- re_entry_point: design
- priority: high
- intake_source: operator correction on repeated bridge-state regressions 2026-04-18
- affected_boundary: all core ABG interface families including fulfillment truth, admission truth, convergence truth, identity foundations, resolver contracts, and IoC hook seams
- triaged_at: 2026-04-18
- created_at: 2026-04-18
- updated_at: 2026-04-18

## Context

Repeated ABIogenesis regressions have come from the same failure mode:

1. a core interface changes
2. not every producer and consumer changes with it
3. old and new semantics coexist
4. bridge logic is accepted as temporary
5. the old closure law keeps reasserting itself through consumers, projections,
   or tests

For core substrate changes, that pattern is not lawful enough.

The governing rule for ABIogenesis core interfaces is now stricter:

- refactor the core first
- ban bridge authority
- audit every producer and consumer
- migrate every dependent surface
- delete the old paths
- prove only after the migration wave is complete

## Scope

This protocol applies when a change affects a **core interface family**.

A core interface family is any shared contract that multiple ABIogenesis layers
consume, including:

- runtime
- reporting
- topology and projection
- proof and closure
- event publication
- binding and prompt contracts
- identity creation/detection/admission
- resolver or provider hooks

Initial families explicitly in scope:

- fulfillment truth
- admission truth
- convergence truth
- resolver/reference contracts
- identity foundations
- IoC hook seams

## Governing Rule

### Inside-Out Migration

For any core interface family:

1. Ratify the new authoritative contract first.
2. Ban the old contract from remaining authoritative anywhere.
3. Audit every producer, consumer, projection, resolver, and test touching that
   contract.
4. Migrate the core implementation first.
5. Migrate every dependent surface to the new contract.
6. Chase every downstream consequence until no old closure law remains.
7. Delete the old paths.
8. Run proof only after the migration wave is complete.

### No Bridge Authority

The following are banned as acceptance-state behavior for a migrated core
interface family:

- compatibility aliases
- dual readers
- fallback identity laws
- parallel truth surfaces
- projections acting as authority
- temporary bridge fields in acceptance paths
- raw event payloads acting as truth after a stronger carrier exists
- backing stores that disagree with the resolved authoritative carrier

### Single Truth Law

For a migrated core interface family:

- runtime
- reporting
- topology
- proof
- operator surfaces

must share one authoritative closure law.

If any of those surfaces can disagree after a lawful event sequence, the
migration is not complete.

## Required Ticket Fields For Core Migrations

Any ABIogenesis ticket that changes a core interface family should explicitly
carry:

- `authoritative_contract`
- `banned_legacy_surfaces`
- `producer_audit`
- `consumer_audit`
- `projection_audit`
- `migration_order`
- `proof_blockers`
- `close_condition`

Minimum close condition:

- zero legacy authority remaining for the migrated interface family

## Required Audit Shape

### Producer Audit

List every writer or publisher of the interface family, including:

- manifest builders
- ingest paths
- event emitters
- prompt/output contracts
- helper utilities

### Consumer Audit

List every reader or interpreter of the interface family, including:

- runtime certification
- admission checks
- live status
- CLI surfaces
- downstream domain entry points

### Projection Audit

List every projection or replay path that can restate closure truth, including:

- frame status
- generic asset projection
- convergence replay
- graph/run terminality

### Proof Audit

Tests must be classified as:

- migrated proof
- stale bridge-state proof
- out of scope

Stale bridge-state tests do not count as acceptance evidence.

## Application To Current ABIogenesis Work

This protocol governs ABIogenesis core-interface migrations, including recently
completed waves and any future active slices.

Recently completed governed waves:

- [B-012](/Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/B-012-align-abg-default-identity-creation-and-detection-with-identity-method.md)
- [B-013](/Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/B-013-publish-first-class-obligation-ledger-traversal-declarations-in-abg-gtl.md)
- [B-014](/Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/B-014-persist-and-promote-typed-fp-fulfillment-assessments-into-admitted-ledger-truth.md)
- [B-015](/Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/B-015-abstract-fulfillment-ledger-reference-and-resolution-beyond-local-files.md)

Related backlog tickets should also follow this protocol when activated:

- [B-016](/Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/backlog/B-016-standardize-abg-extension-hooks-under-a-consistent-ioc-contract-model.md)

## Acceptance

- ABIogenesis has an explicit governing migration protocol for core interfaces.
- Active ABIogenesis tickets that touch core interface families reference this
  protocol.
- Core-interface closures are blocked on:
  - full producer/consumer/projection audit
  - deletion of legacy authority
  - proof on the migrated model only
