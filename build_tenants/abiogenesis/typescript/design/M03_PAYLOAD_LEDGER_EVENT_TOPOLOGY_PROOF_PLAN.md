# M03 Payload Ledger Event Topology Proof Plan

**Status**: Active
**Date**: 2026-04-29
**Derived from**: [M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_DERIVATION.md](./M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_DERIVATION.md), [M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_FIRST_SLICE_IACS.md](./M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_FIRST_SLICE_IACS.md), `specification/scenarios/11-event-sourced-payload-ledger-uat.md`, [T-095](../../../../.ai-workspace/tickets/active/T-095-define-event-sourced-abg-payload-ledger-and-legal-proof-topology.md)

## Purpose

Define the legal tests for T-095 before implementation. The proof sequence
separates design/module conformance from harnessed sandbox UAT and live Claude
UAT, as required by SPEC_METHOD.

## Design/Module Conformance Tests

These tests prove the TypeScript M03 design boundary.

| Test family | Authority | Must prove |
| --- | --- | --- |
| event admission | IACS, REQ-R-ABG3-PAYLOAD-001..005 | payload source fact constructors and admission reject malformed events |
| payload ledger projection | IACS, REQ-R-ABG3-PAYLOAD-001, REQ-R-ABG3-PROJECTION-001..004 | replay derives deterministic payload rows |
| authority/evidence projection | IACS, REQ-R-ABG3-PAYLOAD-007..008 | admitted authority and evidence facts produce assurance inputs |
| shadow ledger negative | IACS, REQ-R-ABG3-PAYLOAD-009 | mutable local ledger cannot close |
| plugin authority negative | IACS, REQ-R-ABG3-PAYLOAD-010 | provider output cannot emit events or closure decisions directly |
| stale/orphan/missing classification | assurance and payload requirements | stale, orphan, missing, partial, and invalid states remain visible |

## Classification Proof Matrix

| Classification | Test authority | Required design/module proof |
| --- | --- | --- |
| missing payload | Scenario 11 classification matrix | projection emits missing/invalid row when required payload envelope is absent |
| empty payload | Scenario 11 classification matrix | admission rejects empty required payload body or marks it invalid |
| malformed payload | Scenario 11 classification matrix | parser failure becomes payload rejection |
| unreadable payload | Scenario 11 classification matrix | unreadable ref or missing digest becomes rejection or invalid-ledger row |
| schema-invalid payload | Scenario 11 classification matrix | schema violation becomes rejection |
| contract-invalid payload | Scenario 11 classification matrix | dispatch/result contract violation becomes rejection |
| stale payload/evidence | Scenario 11 classification matrix | digest mismatch emits `stale_input` |
| orphan evidence | Scenario 11 classification matrix | unbound evidence emits `orphan_evidence` |
| contradictory evidence | Scenario 11 classification matrix | conflicting evidence emits `contradictory_evidence` |
| accepted payload | Scenario 11 classification matrix | accepted validation is projected into payload ledger |
| fulfilled evidence | Scenario 11 classification matrix | current complete evidence emits `fulfilled` |
| partial evidence | Scenario 11 classification matrix | shallow or incomplete evidence emits `partial` |
| deferred evidence | Scenario 11 classification matrix | lawful deferral emits `deferred` and only qualified closure |
| invalid event ledger | Scenario 11 classification matrix | inadmissible source facts emit `event_ledger_invalid` or fail closed |

## Harnessed Sandbox UAT

Harnessed UAT derives from `11-event-sourced-payload-ledger-uat.md` and uses a
deterministic worker/result fixture through the composed product path.

Required archive files:

- `gtl_declarations.json`
- `event_log.json`
- `payload_ledger.json`
- `authority_ledger.json`
- `evidence_ledger.json`
- `assurance_projection.json`
- `closure_decision.json`
- `lifecycle_register.json`
- `shadow_ledger_negative.json`

Required assertions:

- payload observation and validation are admitted as ABG facts,
- authority and evidence facts are replay-visible,
- the lifecycle register is projected from ABG facts,
- a shadow ledger cannot close,
- hop 2 missing evidence deepens the register and stops convergence.

## Live Claude UAT

Live UAT uses the same scenario and crosses the real Claude actor boundary.
Under the current operator instruction, only Claude lanes are valid live proof.

Required archive files:

- `actor_stdout.txt`
- `actor_stderr.txt`
- `actor_invocation.json`
- `observed_payloads.json`
- `event_log.json`
- `payload_ledger.json`
- `authority_ledger.json`
- `evidence_ledger.json`
- `assurance_projection.json`
- `closure_decision.json`
- `lifecycle_register.json`
- `live_failure_class.json` when the actor fails or times out

Required assertions:

- worker output is only evidence after payload observation and admission,
- stdout/stderr are archived even on failure,
- invalid or missing actor payload fails closed,
- successful hop 1 may close only after admitted evidence,
- hop 2 missing evidence projects `retry` and register `deepen`.

## Reproducibility Bar

One hop proves payload admission. It does not prove register deepening.

Two hops are required to prove the test35-class quality we care about:

- hop 1 shows the ledger can admit evidence and close,
- hop 2 shows new downstream obligation introduces a new row,
- the new row blocks convergence until evidence exists,
- prior closure is not erased, but it no longer implies global convergence.

## Closure Bar

T-095 does not close on this proof plan alone. Closure requires:

- external STDO review of the requirement and design pack,
- tenant implementation tickets opened or explicitly deferred,
- TypeScript legal tests green after implementation,
- Python parity or sufficiency audit,
- T-094 rerun over admitted ABG payload facts.
