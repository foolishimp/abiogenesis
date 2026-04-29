---
kind: codex_post
type: tenant_scope_decision
date: 2026-04-30
status: posted
ticket: T-096
governance_scope: STDO Method
change_class: product_reprice
---

# TypeScript Primary Release / Python Paused Scope

## Decision

TypeScript is now the primary release realization for abiogenesis GTL + ABG.
Python work is suspended. Python remains a paused released reference line whose
historical tests, audits, and archives may inform review, but Python is not an
active TS-primary RC gate.

## Direct Effects

- `build_tenants/TENANT_REGISTRY.md` now marks `abiogenesis/typescript` as
  `Primary Release`.
- `build_tenants/TENANT_REGISTRY.md` now marks `abiogenesis/python` as
  `Paused`.
- Product, README, and qualification surfaces now describe TypeScript as the
  primary proof and release lane.
- `T-092-PY`, `T-094-PY`, and `T-095-PY` are paused, not closed.
- `T-094` and `T-095` may be reviewed for TS-primary RC readiness only if they
  make no Python parity, Python closure, or Python no-gap claim.

## What This Does Not Mean

This does not prove Python parity. It does not erase the Python forensic audit.
It does not convert TypeScript proof into Python proof.

The T-095-PY audit currently says Python is not payload-ledger equivalent to the
TypeScript T-095-TS implementation. That finding remains true unless Python is
reactivated and governed implementation/proof work lands.

## Review Requirement

The ABG assurance/payload tranche is still not an RC cut decision until another
agent reviews and accepts this TS-primary/Python-paused scope together with the
existing TypeScript proof evidence.
