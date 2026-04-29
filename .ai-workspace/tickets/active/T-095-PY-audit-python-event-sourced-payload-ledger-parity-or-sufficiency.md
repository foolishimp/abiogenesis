---
id: T-095-PY
title: Audit Python event-sourced payload ledger parity or sufficiency
type: spike
ticket_category: ordinary
status: paused
review_status: suspended_by_tenant_registry
source_ticket: T-095
build_tenant: python
goal: abg-total-assurance-calculus
goal_status: active
change_intent: Determine whether the Python tenant needs a T-095-equivalent event-sourced payload ledger implementation, or whether existing Python assurance/event/run-archive surfaces already satisfy the new payload-ledger law without a no-gap defect.
change_class: design_reframe
re_entry_point: python_payload_ledger_parity
affected_boundary: Python ABG assurance, Python event/run archive surfaces, payload/evidence/authority source facts, T-095 upstream closure
priority: high
triaged_at: 2026-04-30T00:00:00Z
created_at: 2026-04-30T00:00:00Z
updated_at: 2026-04-30T00:50:46+10:00
dependencies:
  - T-095 active/external_review_blockers_resolved_pending_re_review
  - T-092-PY paused/suspended_by_tenant_registry
  - T-096 active/ts_primary_release_scope
  - REQ-R-ABG3-PAYLOAD active
  - REQ-R-ABG3-ASSURANCE active
library_usage: consume
governing_library:
  - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
  - specification/scenarios/11-event-sourced-payload-ledger-uat.md
  - build_tenants/abiogenesis/python/code/genesis/assurance.py
  - build_tenants/abiogenesis/python/test_env/tests/test_t092_total_assurance_projection.py
intake_source: T-095 closure_law required Python parity or sufficiency triage before upstream closure. The forensic audit found Python is not payload-ledger equivalent. T-096 and the tenant registry now pause Python for the TS-primary release cut rather than opening Python implementation work.
target_truth: Python's relationship to REQ-R-ABG3-PAYLOAD is explicitly governed as paused. The existing forensic audit remains reference evidence and no Python parity, no-gap, or payload-ledger sufficiency claim may be made while Python is paused.
superseded_truth: T-095-TS implementation evidence implicitly satisfies Python or lets upstream T-095 close without a Python parity decision.
closure_law: Do not close while paused. If Python is reactivated, close only after an audit table maps every REQ-R-ABG3-PAYLOAD and Scenario 11 obligation to Python coverage status `{covered | new acceptance criterion needed | new implementation ticket needed | out of scope with rationale}` and an external reviewer accepts the result.
evaluation_criteria:
  - Audit `PayloadObserved`, `PayloadValidated`, `PayloadRejected`, authority snapshot, evidence, ambiguity, and closure-input obligations against Python.
  - Identify whether Python has replay-derived payload/evidence projections or only assurance row projections.
  - Identify whether provider-only closure and assessed/read-model closure bypasses exist in Python.
  - If implementation is needed, name the follow-on Python tenant ticket and proof lanes.
  - If no implementation is needed, provide file/test references proving no-gap sufficiency.
non_closure_conditions:
  - T-095 closes before this audit is reviewed.
  - TypeScript payload-ledger proof is treated as Python proof.
  - Audit omits rejected/contradictory/stale/orphan payload cases.
  - Provider or report output can close without admitted Python evidence facts.
---

# T-095-PY: Python Payload-Ledger Parity/Sufficiency Audit

This ticket was the Python-side gate for upstream T-095 before the TS-primary
release reprice. It is an audit ticket, not an implementation claim. While
Python is paused, it remains retained evidence and reactivation authority.

## Tenant Pause Disposition

The tenant registry now marks `abiogenesis/typescript` as the primary release
line and `abiogenesis/python` as paused. This ticket is suspended for the
TS-primary RC cut.

The forensic audit below remains important because it prevents a silent Python
parity claim. Its current conclusion is not "Python sufficient"; it is "Python
not equivalent, and Python work paused."

## Forensic Audit Rule

This ticket exists to prevent a marker-only Python parity claim. Python cannot
claim a no-gap payload-ledger waiver until this audit is externally reviewed and
accepted. Each row below is a current disposition, not a closure claim.

Allowed coverage statuses:

- `covered`
- `new acceptance criterion needed`
- `new implementation ticket needed`
- `out of scope with rationale`

## Requirement Acceptance-Criterion Audit

| Obligation | Coverage status | Python evidence | Decision |
| --- | --- | --- | --- |
| `REQ-R-ABG3-PAYLOAD-001` | `new implementation ticket needed` | Python has `genesis.assurance` projection rows and `genesis.result_ingest` payload normalization, but no replay-derived payload ledger over admitted payload source events. | Open a Python implementation ticket unless external review scopes Python out. |
| `REQ-R-ABG3-PAYLOAD-002` | `new implementation ticket needed` | Python can ingest F_P result payloads, but it does not require every traversal/authority/evidence/closure payload to have an ABG-admitted envelope. | Add envelope admission or record a reviewed out-of-scope boundary. |
| `REQ-R-ABG3-PAYLOAD-003` | `new implementation ticket needed` | Existing Python payload/result surfaces do not preserve the full envelope minimum: source runtime event, aggregate scope, actor invocation, authority binding, input digest, and policy refs as one admitted carrier. | Define Python payload envelope carrier if Python remains in scope. |
| `REQ-R-ABG3-PAYLOAD-004` | `new implementation ticket needed` | Python archives bodies and results, but external body refs are not governed as payload envelopes with digest-backed runtime truth. | Add body-ref/digest envelope semantics. |
| `REQ-R-ABG3-PAYLOAD-005` | `new implementation ticket needed` | Python has assurance authority/evidence row inputs, but not payload observation, payload validation, payload rejection, authority snapshot admission, evidence admission, ambiguity observation, and closure-input publication as source fact families. | Implement or explicitly scope out Python payload source facts. |
| `REQ-R-ABG3-PAYLOAD-006` | `new acceptance criterion needed` | `genesis.result_ingest` validates malformed F_P result payloads, but does not cover the full missing/empty/malformed/unreadable/schema-invalid/contract-invalid/stale/orphaned/contradictory/accepted classification set as payload-ledger truth. | Add Python ACs for the full classification set before implementation review. |
| `REQ-R-ABG3-PAYLOAD-007` | `new implementation ticket needed` | Python `AssuranceAuthoritySnapshot` has authority/input digest fields, but authority snapshots are not admitted as payload or authority runtime facts. | Bind authority snapshots to admitted event or source-fact truth. |
| `REQ-R-ABG3-PAYLOAD-008` | `new implementation ticket needed` | Python `AssuranceEvidenceRow` can express scope, authority, input digest, provider, policy, shallow, contradictory, and deferred fields, but it is not derived from admitted payload/evidence facts. | Rebind evidence rows to payload-ledger projection or document Python scope-out. |
| `REQ-R-ABG3-PAYLOAD-009` | `new acceptance criterion needed` | Python reports and run archives act as read models in several lanes, but there is no explicit payload-ledger law preventing rival writable payload truth. | Add AC/test that reports/registers cannot write payload truth. |
| `REQ-R-ABG3-PAYLOAD-010` | `new acceptance criterion needed` | Python rejects assurance provider output that owns engine authority, but payload codec/authority/evidence/gain plugin boundaries are not separately enumerated. | Extend provider-boundary tests to payload-ledger plugin roles. |
| `REQ-R-ABG3-PAYLOAD-011` | `new acceptance criterion needed` | GTL hook surfaces exist, but Python does not yet prove graph functions declare payload contracts/evidence obligations/authority surfaces without hidden runtime config. | Add GTL payload declaration coverage if Python remains in scope. |
| `REQ-R-ABG3-PAYLOAD-012` | `new implementation ticket needed` | Python has result normalization and stale-analysis protections, but worker success, transport success, prompt self-assessment, and archive shape are not generally routed through admitted payload/evidence facts before closure relevance. | Implement the payload/evidence admission gate or scope Python out. |
| `REQ-R-ABG3-PAYLOAD-013` | `new acceptance criterion needed` | Python prompt and binding surfaces constrain result shape, but private worker reasoning exclusion is not a payload-ledger acceptance test. | Add payload-contract risk/exclusion AC if Python admits worker payload channels. |
| `REQ-R-ABG3-PAYLOAD-014` | `new acceptance criterion needed` | Python projection/report tests exist for assurance read models, but payload projection checkpoints/snapshots are not present. | Add explicit read-model precedence tests for payload projections. |
| `REQ-R-ABG3-PAYLOAD-015` | `new implementation ticket needed` | Python has stale-input assurance behavior, but no payload fact preservation/reprojection model across same-edge retry, correction, reopen, or authority/input changes. | Implement payload fact retention and current projection semantics. |
| `REQ-R-ABG3-PAYLOAD-016` | `new acceptance criterion needed` | Python has downstream qualification/read-model precedent, but no payload-derived lifecycle register proof equivalent to the TypeScript T-094/T-095 lane. | Add downstream register buildability ACs or record Python out-of-scope rationale. |

## Scenario 11 Case Audit

| Scenario 11 case | Coverage status | Python evidence | Decision |
| --- | --- | --- | --- |
| `observed payload` | `new implementation ticket needed` | No Python payload-observed source event or replay-derived payload ledger row. | Required for Python parity. |
| `validated payload` | `new implementation ticket needed` | `validate_fp_result_payload` validates result shape, but no payload validation source fact/projection row. | Required for Python parity. |
| `rejected payload` | `new implementation ticket needed` | Python can reject malformed result payloads, but not as admitted payload rejection facts with full classification. | Required for Python parity. |
| `authority snapshot` | `new implementation ticket needed` | Assurance snapshots exist as direct inputs, not admitted authority/payload facts. | Required for Python parity. |
| `evidence admission` | `new implementation ticket needed` | Assurance evidence rows exist, but not as payload-bound admitted evidence facts. | Required for Python parity. |
| `shadow ledger rejection` | `new acceptance criterion needed` | Provider authority tests exist for assurance, but no Python shadow payload ledger negative proof. | Add explicit negative proof. |
| `plugin authority limit` | `new acceptance criterion needed` | Assurance provider output cannot smuggle engine authority; payload/gain/plugin roles still need explicit inventory. | Extend provider-boundary audit. |
| `GTL declaration completeness` | `new acceptance criterion needed` | GTL hooks exist, but payload contract declaration completeness is not proved in Python. | Add GTL payload declaration proof or scope out. |
| `projection audit marker` | `new acceptance criterion needed` | Assurance reports are read models; payload projection markers do not exist. | Add read-model precedence proof if implemented. |
| `retry deepening` | `new implementation ticket needed` | Python lacks the TypeScript two-hop event-derived payload register proof; T-094-PY tracks live/sufficiency parity separately. | Required before Python can claim test35-class parity. |

## Current Forensic Conclusion

Python is not payload-ledger equivalent to the TypeScript T-095-TS implementation
today. It has useful assurance-projection and result-ingest precedent, but the
payload source-fact family and replay-derived payload ledger are absent. The
current lawful outcome after the TS-primary release reprice is:

1. keep this audit as retained reference evidence;
2. do not claim Python parity or no-gap sufficiency;
3. do not let this paused Python ticket block the TS-primary RC gate after
   external review accepts the tenant-scope decision;
4. if Python is reactivated, re-enter here before any Python payload-ledger
   claim can close.
