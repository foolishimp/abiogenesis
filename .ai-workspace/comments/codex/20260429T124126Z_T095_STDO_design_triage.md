---
kind: codex_post
type: triage
date: 2026-04-29
status: posted
ticket: T-095
change_class: requirement_reprice
re_entry_point: requirement
scope: ABG event-sourced payload ledger and legal proof topology
---

# T-095 STDO Design Triage

## Intake

The intake came from T-094 review and the payload ledger discussion. T-094
proved a two-hop register can deepen and stop convergence, but it still built
register rows from harness-local authority/evidence construction. That is a
useful proof slice, not a lawful source of closure under ABG event/projection
law.

The operator claim is correct: consolidating ledger and event tech makes the
ledger event-sourced. The event stream is the write side. Ledgers are read
models.

## Triage Walkthrough

1. Goals: current GOAL-007 already targets total assurance and premature
   closure prevention.
2. Intent/Product: no product-boundary expansion is needed. The compute boundary
   remains the existing GTL edge traversal over graph-call/frame/continuation.
3. Requirements: the first missing layer is explicit payload ledger law. Current
   event/projection/assurance requirements imply the direction, but they do not
   give enough direct authority for legal tests over payload envelopes, payload
   admission, and read-model ledgers.
4. Design: a core-interface migration is required because payload/event/ledger
   topology governs producers, consumers, projections, reports, proof, and
   closure.
5. Code: code must wait on the source carrier and proof topology. A T-094-only
   helper would create a narrow shadow ledger.
6. Tests: legal tests must derive from requirements and scenarios. Unit/module
   tests prove design conformance. Harnessed and live sandbox tests prove the
   composed product behavior.

## Decision

Classify T-095 as:

- `change_class: requirement_reprice`
- `re_entry_point: requirement`
- `ticket_category: implementation_migration`
- `migration_strategy: inside_out_hard_break`

The ticket stays active until external STDO review accepts the requirement,
design pack, and proof plan.

## Surfaces Added

- `specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md`
- `specification/scenarios/11-event-sourced-payload-ledger-uat.md`
- `build_tenants/abiogenesis/typescript/design/M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_FIRST_SLICE_IACS.md`
- `build_tenants/abiogenesis/typescript/design/M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_STRUCTURAL_CARRIER_DIAGRAM.md`
- `build_tenants/abiogenesis/typescript/design/M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_PROOF_PLAN.md`

## Legal Test Shape

The legal proof must show:

- payloads enter closure relevance only through ABG admission,
- ledgers are projections over admitted ABG events,
- plugins propose facts but cannot emit authoritative runtime events or close,
- GTL can declare payload/evidence obligations without side-door config,
- hop 1 can close from admitted evidence,
- hop 2 missing evidence deepens the register and stops convergence,
- Claude live stdout/stderr and artifact observation are archived even on
  failure.

## Non-Closure

T-095 is not closure-ready. The next lawful step is external STDO review of the
ticket and design pack, then tenant implementation tickets.
