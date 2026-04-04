# CHANGE INTENT — ABG Algebraic Cutover Spec Reprice

**Status**: Declared
**Date**: 2026-04-04
**Change Class**: `intent_reprice`
**Re-entry Point**: Intent -> Requirements -> Design -> Module ownership -> Code -> Tests
**Method Authority**: `genesis_sdlc/specification/standards/SPEC_METHOD.md`
**Cutover Gate Authority**: `20260404T191851Z_CHECKLIST_abg-cutover-evaluation-gates.md`

## Why This Is `intent_reprice`

This change does not merely refactor a local implementation detail.

The active project still teaches multiple semantic centers for:

- run governance
- failure classification
- event-emission ownership
- CLI/control-plane truth

That is constitutional drift, not only code debt.

The lawful re-entry point is therefore Intent, followed by Requirements and
Design, before any code cut.

## Declared Target

The cutover establishes one algebraic center for ABG:

- one run algebra
- one failure algebra
- one event-emission boundary
- one projection source for CLI/control-plane summaries

The chosen core doctrine is:

- `assessed` remains an evaluator fact event
- successful terminal run truth is `assessed_pass`
- failed certification projects to `failed(certification_failure)`
- substrate failure taxonomy is `transport_failure | no_output | contract_failure`
- `abg.events.emit()` is the only lawful event-emission boundary
- traversal, services, CLI, and subwork are consumers of that boundary, not alternate owners

## Immediate Scope

This tranche is limited to Stage 1 through Stage 4 of the cutover checklist:

1. intent
2. requirements
3. design
4. module ownership/design surfaces

No runtime code changes are lawful until those stages are internally consistent.
