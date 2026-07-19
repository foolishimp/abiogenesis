# 11 — Event-Sourced Payload Ledger UAT

> **T-283 disposition (2026-07-20):** Prior scenario evidence; held and
> non-operative for 5.0 acceptance. The exact current Product scenarios are
> `ABG5-S01` through `ABG5-S07` in `PRODUCT.md` and
> `REQ-P-SCENARIOS.md`. Reuse requires post-closure re-derivation.

**Validates**: REQ-R-ABG3-PAYLOAD, REQ-R-ABG3-EVENTS, REQ-R-ABG3-PROJECTION, REQ-R-ABG3-ASSURANCE, REQ-L-GTL3-HOOKS

**Derives from**: [SPEC_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/SPEC_METHOD.md), [INTENT.md](../INTENT.md) INT-001, [ODD_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/ODD_METHOD.md), [PRODUCT.md](../PRODUCT.md), [requirements/abg/REQ-R-ABG3-PAYLOAD.md](../requirements/abg/REQ-R-ABG3-PAYLOAD.md), [requirements/abg/REQ-R-ABG3-EVENTS.md](../requirements/abg/REQ-R-ABG3-EVENTS.md), [requirements/abg/REQ-R-ABG3-PROJECTION.md](../requirements/abg/REQ-R-ABG3-PROJECTION.md), [requirements/abg/REQ-R-ABG3-ASSURANCE.md](../requirements/abg/REQ-R-ABG3-ASSURANCE.md), [requirements/gtl/REQ-L-GTL3-HOOKS.md](../requirements/gtl/REQ-L-GTL3-HOOKS.md)

## Purpose

Prove that ABG owns payload truth through event admission and that ledgers,
registers, reports, and downstream lifecycle views are replay-derived read
models. This scenario is the legal proof authority for consolidating payload
and ledger technology under ABG's event-sourced model.

## Scenario Boundary

A graph function crosses an `F_P` worker boundary and receives payload-bearing
artifacts. Those artifacts may include a dispatch manifest, an actor result
artifact, authority snapshot data, evidence, ambiguity observations, and
downstream register inputs.

The worker, plugin, or downstream product may propose facts. ABG admits or
rejects them. Closure relevance starts only after admission.

## Required Actors

- GTL author declaring graph/vector payload contracts and assurance hook refs
- ABG runtime admitting source facts through `emit()`
- Claude live actor for live UAT lanes
- plugin providers proposing authority, evidence, ambiguity, closure policy,
  and gain facts
- downstream adapter projecting a lifecycle register from ABG read models

## Required Testcases

| Case | Source authority | Initial condition | Expected ABG behavior | Legal proof |
| --- | --- | --- | --- | --- |
| observed payload | REQ-R-ABG3-PAYLOAD-001..005 | actor result artifact exists outside the event stream | ABG admits a payload envelope with ref, digest, contract, producer, actor invocation, and scope | payload ledger projection contains the observed payload row |
| validated payload | REQ-R-ABG3-PAYLOAD-005..006 | observed payload satisfies schema/contract | ABG records accepted validation as source fact or deterministic projection over source fact | downstream ledgers consume accepted payload only through projection |
| rejected payload | REQ-R-ABG3-PAYLOAD-006, REQ-R-ABG3-PAYLOAD-012 | worker succeeds but artifact is missing, malformed, or contract-invalid | ABG records rejection and blocks closure relevance | worker success cannot close |
| authority snapshot | REQ-R-ABG3-PAYLOAD-007, REQ-R-ABG3-ASSURANCE-003..004 | current authority/input snapshot is available | ABG admits snapshot identity and digest | stale-input comparison can be projected later |
| evidence admission | REQ-R-ABG3-PAYLOAD-008, REQ-R-ABG3-ASSURANCE-007..012 | evidence is bound or unbound to authority/input | ABG classifies fulfilled, partial, missing, stale, or orphan rows | assurance projection rows preserve payload and authority refs |
| shadow ledger rejection | REQ-R-ABG3-PAYLOAD-009, REQ-R-ABG3-PROJECTION-002 | plugin or downstream register claims closure from local state | ABG treats the ledger as a read model only | closure cannot derive from rival writable store |
| plugin authority limit | REQ-R-ABG3-PAYLOAD-010, REQ-R-ABG3-ASSURANCE-021 | plugin proposes facts and a closure decision | ABG may admit fact proposals but rejects direct event emission or closure ownership | plugin cannot close |
| GTL declaration completeness | REQ-R-ABG3-PAYLOAD-011, REQ-L-GTL3-HOOKS-009 | graph function declares payload contracts and hook refs | ABG resolves declarations without hidden side-door runtime config | payload/evidence obligations are visible in published GTL surface |
| projection audit marker | REQ-R-ABG3-PAYLOAD-014 | projection emits a snapshot or report marker | marker remains audit/read-model aid | replay from source facts remains authoritative |
| retry deepening | REQ-R-ABG3-PAYLOAD-015..016, REQ-R-ABG3-ASSURANCE-024 | hop 1 closes, hop 2 introduces missing downstream evidence | prior payload facts remain, current projection blocks convergence and deepens register | two-hop register projects `mayConverge: false` from ABG facts |

## Classification Coverage Matrix

| Classification | Requirement authority | Required proof shape |
| --- | --- | --- |
| missing payload | REQ-R-ABG3-PAYLOAD-006 | no payload envelope exists for a required closure-relevant artifact |
| empty payload | REQ-R-ABG3-PAYLOAD-006 | observed payload body is empty where the contract requires content |
| malformed payload | REQ-R-ABG3-PAYLOAD-006 | payload cannot be parsed as its declared contract |
| unreadable payload | REQ-R-ABG3-PAYLOAD-006 | payload ref cannot be read or digest cannot be computed |
| schema-invalid payload | REQ-R-ABG3-PAYLOAD-006 | parsed payload violates schema |
| contract-invalid payload | REQ-R-ABG3-PAYLOAD-006 | payload shape is syntactically valid but violates dispatch/result contract |
| stale payload or evidence | REQ-R-ABG3-PAYLOAD-008, REQ-R-ABG3-PAYLOAD-015 | authority or input digest differs from the current snapshot |
| orphan evidence | REQ-R-ABG3-PAYLOAD-008 | evidence exists without matching current authority or scope |
| contradictory evidence | REQ-R-ABG3-PAYLOAD-008 | evidence conflicts with authority or another admitted evidence fact |
| accepted payload | REQ-R-ABG3-PAYLOAD-005..006 | payload satisfies schema/contract and is admitted |
| fulfilled evidence | REQ-R-ABG3-PAYLOAD-008 | admitted evidence is complete, non-shallow, current, scoped, and authority-bound |
| partial evidence | REQ-R-ABG3-PAYLOAD-008 | evidence is shallow, incomplete, trace-only, or proof-shape insufficient |
| deferred evidence | REQ-R-ABG3-PAYLOAD-008 | deferral is admitted and policy permits qualified defer |
| invalid event ledger | REQ-R-ABG3-PAYLOAD-014 | projection cannot derive from admissible source facts |

## Harnessed Sandbox UAT

Harnessed sandbox UAT shall run the scenario through the installed or composed
ABG product boundary with deterministic worker/result fixtures. It must archive:

- GTL declaration surface used for payload contracts and hook refs
- admitted event log
- payload ledger projection
- authority and evidence ledger projections
- assurance projection and closure decision
- downstream lifecycle register projection
- negative proof that a shadow ledger cannot close work

## Live Sandbox UAT

Live sandbox UAT shall run only Claude live lanes unless the operator
re-authorizes another live agent. It must archive:

- actor stdout and stderr
- actor invocation identity
- observed result artifact refs and digests
- admitted payload/evidence/authority events
- payload ledger projection
- assurance projection and closure decision
- downstream register projection
- failure class when the live actor fails, times out, or returns invalid payload

Live failure is evidence. It shall not be skipped and shall not close the
ticket.

## Non-Closure Conditions

- the test constructs register rows directly from harness state
- a worker result is treated as evidence before payload admission
- the event log lacks payload source facts
- the payload ledger is mutable state rather than replay projection
- GTL payload obligations require hidden runtime config
- plugin output closes work directly
- live Claude failure is skipped instead of archived
