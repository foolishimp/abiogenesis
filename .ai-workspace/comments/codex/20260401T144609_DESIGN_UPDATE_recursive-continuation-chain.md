# Recursive Continuation Requirement Chain

Date: 2026-04-01

## Intent

Capture the requirement/design/module chain for continuation-driven recursive
interpretation so the tail-loop recursive interpreter is declared law before it
is finished as runtime code.

## Requirement Layer

- `REQ-L-GTL2-RECURSE` now states that the published recursive declaration must
  expose enough termination and fold-back truth for a continuation-driven
  interpreter to suspend, resume, and enforce fold-back barriers without hidden
  recursion policy.
- `REQ-R-ABG2-INTERPRET` now states that recursive interpretation shall
  progress through explicit continuation and child-frontier state, and that
  serialized checkpoints are resumability aids rather than a second truth
  surface.

## Design Chain

- `GTL_2_INTERFACE_CONTRACTS.md` now anchors both `REQ-L-GTL2-RECURSE` and
  `REQ-R-ABG2-INTERPRET`, and the `recurse(...)` contract explicitly states
  continuation-driven interpreter sufficiency.
- The invocation-frame runtime note now states:
  - recursive control state is explicit continuation plus child frontier
  - suspend/resume checkpoints are cache aids only
  - the published module carrier remains stable

## Module Design

- `GTL_2_MODULE_DESIGN.md` now declares `abg.interpret` as owner of recursive
  continuation/frontier orchestration and suspend/resume.
- The runtime model now includes design-level records for:
  - `RecursiveContinuation`
  - `ChildFrontier`
  - `RecursiveInterpreterState`
- The design notes now state that tail recursion changes orchestration, not the
  compute substrate, so distributed child work may remain parallel.

## Review Focus

The primary module-design sections to review are:
- `build_tenants/abiogenesis/python/design/GTL_2_MODULE_DESIGN.md`
  - target module stack
  - recursive design notes
  - recursive control responsibility split
  - runtime model types
