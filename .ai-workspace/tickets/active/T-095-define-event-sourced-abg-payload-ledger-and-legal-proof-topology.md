---
id: T-095
title: Define event-sourced ABG payload ledger and legal proof topology
type: feature
ticket_category: implementation_migration
status: active
review_status: external_review_blockers_resolved_pending_re_review
goal: abg-total-assurance-calculus
goal_status: active
activation_requires: T-094 remains active and the payload ledger design passes external STDO review before tenant closure claims
change_intent: Consolidate payload, event, ledger, authority, evidence, ambiguity, and closure-input truth under ABG's event-sourced runtime model so downstream lifecycle registers are projected read models rather than plugin-owned or product-owned rival ledgers.
change_class: requirement_reprice
re_entry_point: requirement
affected_boundary: ABG payload event source, event admission, payload ledger projection, authority ledger projection, evidence ledger projection, assurance row input facts, GTL hook declarations, IoC plugin provider limits, downstream register buildability, TypeScript proof lane, paused Python reference disposition
priority: high
triaged_at: 2026-04-29T12:41:26Z
created_at: 2026-04-29T12:41:26Z
updated_at: 2026-04-30T00:50:46+10:00
dependencies:
  - T-086 active/awaiting_external_agent_review
  - T-090 active/awaiting_external_agent_review
  - T-091 active/awaiting_external_agent_review
  - T-092-TS active/awaiting_external_agent_review
  - T-093-TS active/awaiting_external_agent_review
  - T-094 active/external_review_received_not_closure_ready
  - T-095-PY paused/suspended_by_tenant_registry
  - T-096 active/ts_primary_release_scope
  - REQ-R-ABG3-ASSURANCE active
  - REQ-R-ABG3-EVENTS active
  - REQ-R-ABG3-PROJECTION active
  - REQ-L-GTL3-HOOKS active
migration_strategy: inside_out_hard_break
library_usage: extend
governing_library:
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
  - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
  - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
  - build_tenants/abiogenesis/typescript/design/M03_TOTAL_ASSURANCE_PROJECTION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_DERIVATION.md
governance_scope: STDO Method
related_evidence:
  - .ai-workspace/comments/codex/20260429T123316Z_STDO_ABG_payload_ledger_consolidation.md
  - .ai-workspace/comments/codex/20260429T120442Z_T094_external_review_and_python_gap.md
  - .ai-workspace/comments/codex/20260430T002006AEST_ABG_assurance_payload_external_review_response.md
  - build_tenants/abiogenesis/typescript/test_env/test_runs/t094_assurance_register_two_hop_live/20260429T115932748Z
  - build_tenants/abiogenesis/typescript/test_env/test_runs/t094_assurance_register_two_hop_live/20260429T133349413Z
  - build_tenants/abiogenesis/typescript/test_env/test_runs/t094_assurance_register_two_hop_live/20260429T142205279Z
  - /Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test35
  - /Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test57.fp.cx
  - /Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test57.fp.cl
intake_source: T-094 proved that a two-hop register can deepen and stop convergence, but external review correctly identified that the proof still used harness-local authority/evidence construction. The STDO consolidation concluded that payload truth must pass through ABG event admission, with ledgers projected as read models, otherwise plugins and downstream products become a second framework.
target_truth: ABG is the event source for payload envelopes, payload admission, authority snapshots, evidence facts, ambiguity observations, and closure-input facts inside the existing graph-call/frame/continuation traversal boundary. Ledgers and lifecycle registers are deterministic projections over admitted ABG events plus declared GTL surfaces. Payload bodies and domain gain semantics may remain external, but their authoritative runtime envelope, provenance, digest, binding, and closure relevance pass through ABG.
superseded_truth: Product code, plugin code, local reports, worker result JSON, prompt-side self-assessment, harness helper state, or ad hoc lifecycle ledgers may independently own payload truth or closure-input truth after a traversal crosses an ABG runtime boundary.
non_goal:
  - Do not make GTL a payload ledger DSL.
  - Do not make ABG own domain payload meaning, business release interpretation, or private worker reasoning.
  - Do not introduce a public `UnitOfCompute` aggregate.
  - Do not hard-code odd_sdlc lifecycle semantics into ABG.
  - Do not claim tenant implementation closure from this upstream ticket.
  - Do not run Codex live lanes for proof while the current Claude-only live-lane instruction stands.
core_interface_migration_inventory_required:
  - new authoritative payload source facts
  - superseded writable ledgers and helper-register paths
  - old and new producers of payload, authority, evidence, ambiguity, and closure-input facts
  - old and new consumers including assurance projection, lifecycle register projection, reports, archives, and downstream adapters
  - projections and reports that must become read models
  - legal tests proving shadow ledger paths cannot close
  - live Claude lane proving actor/worker output is admitted through ABG facts before closure relevance
required_follow_on_before_closure:
  - T-095-TS TypeScript tenant payload event source and projection implementation ticket
  - T-095-PY Python pause disposition recorded under the tenant registry; no Python parity or no-gap claim is made for the TS-primary release cut
  - T-096 external review accepts TS-primary release scope and Python suspension before RC claims use this upstream ticket
  - T-094 event-derived two-hop live UAT rerun over admitted ABG payload facts
  - downstream odd_sdlc adapter tracking ticket mapping SDLC lifecycle registers to ABG payload/evidence/assurance projections, non-operative until ABG source-carrier proof lands
closure_law: This ticket may not close until the requirement family, scenario authority, TypeScript design derivation, IACS, structural carrier diagram, proof plan, and external STDO review all agree on the event-sourced payload ledger topology. No tenant implementation or local green test may close this ticket. If existing requirements are judged sufficient without REQ-R-ABG3-PAYLOAD, the review must record a row-by-row audit explaining which existing requirement owns every payload-ledger obligation.
evaluation_criteria:
  - Intake triage records `requirement_reprice` and explains why design/code alone is insufficient.
  - `REQ-R-ABG3-PAYLOAD` states event-sourced payload ledger law without widening the product compute boundary.
  - Scenario authority maps payload ledger proof to requirement-derived UAT cases.
  - Design derivation defines commands, source events, projections, plugin limits, GTL declarations, and downstream register read models.
  - IACS distinguishes prime carriers from subordinate payload bodies, reports, and ledgers.
  - Structural diagram shows GTL declarations, ABG command/admission, event log, projections, assurance fold, plugins, and downstream adapters.
  - Proof plan separates design/module tests from harnessed sandbox UAT and live Claude UAT.
  - Core-interface migration inventory names old producers/consumers and classifies each as remove, replace, re-authorize, or temporary non-authoritative scaffolding.
  - External STDO review accepts the design or records blocking concerns while the ticket remains active.
proof_surface:
  - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
  - specification/scenarios/11-event-sourced-payload-ledger-uat.md
  - specification/scenarios/TESTCASE_AUTHORITY.md
  - build_tenants/abiogenesis/typescript/design/M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_STRUCTURAL_CARRIER_DIAGRAM.md
  - build_tenants/abiogenesis/typescript/design/M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_PROOF_PLAN.md
  - .ai-workspace/comments/codex/20260429T124126Z_T095_STDO_design_triage.md
non_closure_conditions:
  - payload ledger is implemented before the source carrier and legal proof topology are triaged
  - a plugin writes authoritative runtime truth or closure truth
  - a ledger is mutable state rather than a projection over admitted ABG events
  - a report or archive can close work without replaying ABG source facts
  - worker success or `unresolvedReasons: []` is treated as admitted evidence without payload admission
  - GTL graph functions require hidden side-door runtime config for payload/evidence obligations
  - TypeScript closes while Python parity or sufficiency is claimed instead of explicitly paused by tenant registry disposition
  - T-094 closes using harness-local register construction instead of admitted ABG event facts
  - external STDO review has not accepted the design and proof surfaces
---

# T-095: Event-Sourced ABG Payload Ledger

This ticket turns the current payload/ledger discussion into a governed STDO
migration. The design target is explicit CQRS:

- ABG commands admit source facts.
- `emit()` appends the authoritative event stream.
- Ledgers, registers, reports, and release views are projections.

The event stream is the write side. Ledgers are read models. Any design that
lets plugins or downstream products maintain writable closure ledgers has
created a second framework.

## Triage Decision

The lawful re-entry point is `requirement`.

Existing event, projection, transport, and assurance requirements point toward
event sourcing, but they do not yet name the payload ledger obligation sharply
enough to govern implementation and legal tests. T-094 exposed that gap: the
register was useful, but it was still constructed from harness-local facts
rather than admitted ABG source events.

## Work Order

1. Ratify `REQ-R-ABG3-PAYLOAD`.
2. Publish the payload ledger design pack.
3. Source UAT/legal tests from the scenario bundle.
4. Send the ticket and design pack for external STDO review.
5. Only then open tenant implementation work against the admitted source
   carrier and projection contract.

## Migration Declaration

- old_truth_path: result artifacts, worker reports, prompt self-assessment,
  harness-local assurance rows, and product/plugin lifecycle ledgers can appear
  to supply closure-relevant payload truth without first passing through ABG
  payload source facts.
- new_truth_path: ABG `RuntimeEvent` source facts admit payload observation,
  payload validation or rejection, authority snapshot admission, evidence
  admission, ambiguity observation, and closure-input publication. Ledgers and
  registers are replay projections over those source facts.
- retained_compatibility: existing `assessed` event truth may remain a
  vector-local traversal assessment carrier only. It is not sufficient payload,
  evidence, assurance, lifecycle-register, or release-closure truth.
- producers_old:
  - `code/src/abg/m03/runner/attached_fp_worker.ts`
    `assessedEventsForAcceptedResult(...)`
  - `code/src/app/m04/result_assessment/constructors.ts`
    `constructRuntimeEventsForResultAssessment(...)`
  - `code/src/app/m04/result_assessment/assessment.ts`
    `resultAssessmentFromRequest(...)`
  - `code/src/abg/m03/runner/assurance_gate.ts`
    `EngineAssuranceProvider` direct authority/evidence row callbacks
  - `test_env/tests/test_t094_assurance_register_two_hop_unit.test.mjs`
    direct authority/evidence/register construction
  - `test_env/live/test_t094_assurance_register_two_hop_live.test.mjs`
    direct authority/evidence/register construction
- producers_new:
  - `code/src/abg/m03/contracts/carriers.ts` payload source event variants
  - `code/src/abg/m03/contracts/event_admission.ts` payload source event
    admission
  - `code/src/abg/m03/contracts/event_factories.ts` payload source event
    constructors
  - `code/src/abg/m03/events/emit.ts` only lawful write path
  - `code/src/abg/m03/contracts/payload_ledger.ts` replay projection
  - TS implementation ticket rebinds attached worker and result assessment to
    admit payload facts before evidence or closure relevance
- consumers_old:
  - `code/src/abg/m03/contracts/projection.ts` treats `assessed` as vector
    closure source
  - `code/src/abg/m03/runner/engine_runner.ts` consumes
    `attachedDecision.assessedEvents`
  - `code/src/abg/m03/runner/assurance_gate.ts` consumes provider rows directly
  - `code/src/app/m04/gaps/projection.ts` consumes assessed event rows
  - `code/src/app/m04/live_status/projection.ts` consumes result-assessment
    outcome rows
  - `code/src/qualification/m05/archive_finalization*` consumes assurance
    summaries as report payload
  - T-094 unit/live tests consume harness-local assurance rows
- consumers_new:
  - `PayloadLedgerProjection`
  - `AuthorityLedgerProjection`
  - `EvidenceLedgerProjection`
  - `AmbiguityLedgerProjection`
  - `ClosureInputProjection`
  - `EngineAssuranceGate` consuming ABG-admitted payload/evidence projections
  - T-094 register projection consuming ABG payload/evidence facts
  - downstream odd_sdlc adapter consuming ABG projections after ABG proof lands
- derived_surfaces:
  - M04 gaps and live status reports
  - M05 run archive and qualification summaries
  - T-094 live Claude archives
  - downstream lifecycle registers and gain reports as non-authoritative read
    models

## Required Break Order

1. Inventory every current source of result, assessment, assurance, report, and
   register truth in the TypeScript tenant.
   - old seam: unlisted writer/reader can survive by accident.
   - negative proof: implementation ticket must fail review if a discovered
     writer/reader is missing from the inventory.
2. Publish the new deepest source carrier family in `RuntimeEvent`, event
   admission, event factories, and `emit(...)`.
   - old seam: payload truth bypasses ABG source facts.
   - negative proof: malformed payload source events are rejected at admission.
3. Add deterministic payload, authority, evidence, ambiguity, and closure-input
   projections over admitted source facts.
   - old seam: projection depends on helper state or mutable ledger rows.
   - negative proof: changing helper state without events cannot change the
     projection.
4. Rebind attached F_P worker and M04 result assessment so observed worker
   output becomes payload source facts before it can become evidence.
   - old seam: accepted worker result emits only `assessed` truth.
   - negative proof: worker success with missing or invalid payload does not
     create evidence or closure-input rows.
5. Rebind assurance gate to consume admitted payload/evidence/authority
   projections, with provider output treated as proposals only.
   - old seam: provider callback directly supplies closure-ready rows.
   - negative proof: provider output containing event, vector, or closure
     authority fails closed.
6. Rebind T-094 so the two-hop register is projected from ABG
   payload facts.
   - old seam: register rows are hand-constructed in the test harness.
   - negative proof: removing hop 2 evidence creates a `missing` row and blocks
     convergence without editing register state.
7. Rebind reports, archives, gaps, and downstream adapters to read ABG
   projections.
   - old seam: report or archive shape closes work.
   - negative proof: green report text without admitted payload/evidence facts
     cannot close.

## Migration Checklist

- [ ] new truth path is named explicitly
- [ ] producer set for the new truth is listed
- [ ] consumer set for the new truth is listed
- [ ] projection/read-model surfaces are listed
- [ ] old truth path is removed or explicitly demoted from authority
- [ ] mixed-state behavior is no longer accepted as closure evidence
- [ ] tests proving mixed old/new behavior are removed or repriced
- [ ] recurring realization patterns are checked against existing library/commonization surfaces
- [ ] ticket declares library usage and names the governing library or rationale
- [ ] if the work exists in more than one build tenant, this upstream ticket carries no tenant closure claim and suffixed tenant tickets own tenant proof
- [ ] ticket wording, product wording, and proof claims are reconciled before closure

Unchecked items are intentional. T-095 is active design authority, not a closure
claim.

## External Review Response

External review found five concerns:

- invalid migration strategy name,
- insufficient concrete TS interface inventory,
- blurred ABG/downstream lifecycle and gain projection boundary,
- incomplete classification proof matrix,
- downstream odd_sdlc follow-on wording that could violate the ABG-first wave.

This revision addresses those blockers by using `inside_out_hard_break`, adding
the TS interface inventory and break order above, moving lifecycle/gain reports
back to downstream read-model responsibility, expanding Scenario 11/proof-plan
classification coverage, and marking odd_sdlc follow-on as tracking-only until
ABG source-carrier proof lands.

## TypeScript Tenant Progress

T-095-TS has produced an event-derived TypeScript proof archive at
`build_tenants/abiogenesis/typescript/test_env/test_runs/t094_assurance_register_two_hop_live/20260429T133349413Z`.
The tenant proof now routes attached F_P worker output and M04 result assessment
through ABG payload source facts before assurance evidence can close. Provider-
only fulfilled evidence blocks as `event_ledger_invalid`, and `assessed` replay
events are retained only as read-model facts, not vector-closure authority.

This does not close T-095. The upstream ticket still requires external STDO
review acceptance. Python parity is no longer an active implementation gate for
the TS-primary cut, but the Python pause disposition must be reviewed so no
Python parity or no-gap claim is implied.

Huygens externally reviewed the T-095-TS implementation and accepted it as
closure-ready for the TypeScript tenant. The acceptance is recorded at
`.ai-workspace/comments/codex/20260429T134500Z_T095_TS_external_review_acceptance.md`.
This acceptance is evidence for T-095 but not closure of T-095.

## 2026-04-30 External Review Blocker Response

The Codex external review at
`.ai-workspace/comments/codex/20260430T001042AEST_ABG_assurance_payload_external_review.md`
blocked acceptance on one TypeScript semantic-suite failure set and one Python
trace-suite failure set.

Applied response:

- repriced the four stale TypeScript tests to the event-sourced payload truth
  path;
- added `Derives from` authority to Scenario 11;
- added Python-side governance validation for the T-095-PY parity audit before
  Python was later paused by tenant registry disposition;
- linked Scenario 10 and Scenario 11 from the Python canonical test surface map.

Verification after the response:

- `npm run test:semantic` passed 291 tests.
- `./run_tests` passed 347 tests with 19 deselected from
  `build_tenants/abiogenesis/python/test_env`.
- `CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_LIVE_TIMEOUT_MS=180000 npm run test:t094:live`
  passed 1 Claude-only live test and archived
  `build_tenants/abiogenesis/typescript/test_env/test_runs/t094_assurance_register_two_hop_live/20260429T142205279Z`.

This resolves the review's reported red-suite blockers. It does not close this
upstream ticket: T-095 still needs external STDO re-review and the T-095-PY
pause disposition must be accepted before TS-primary RC claims proceed.

## 2026-04-30 Self-Review Depth Correction

Self-review found the first Python payload response was marker-complete but not
depth-complete. The correction added
`build_tenants/abiogenesis/python/test_env/tests/test_t095_payload_ledger_parity_audit.py`
and expanded T-095-PY with a forensic audit matrix over every
`REQ-R-ABG3-PAYLOAD-001..016` row plus every Scenario 11 required testcase.

Current Python finding: Python is not payload-ledger equivalent to the
TypeScript T-095-TS implementation. It has assurance and result-ingest
precedent, but no generic payload source-fact family or replay-derived payload
ledger. That finding is now a tested audit conclusion, not a marker assertion.

## 2026-04-30 TS-Primary Tenant Scope Update

T-096 and the tenant registry now make TypeScript the primary release line and
pause Python work. This does not erase the Python forensic audit. It changes the
release gate:

- T-095 may be reviewed for TS-primary RC readiness without opening Python
  implementation work.
- T-095 must not claim Python payload-ledger parity or Python no-gap
  sufficiency.
- If Python is reactivated, T-095-PY re-enters before any Python payload-ledger
  claim can close.

Verification after the correction:

- Python targeted forensic audit and trace tests passed 18 tests.
- TypeScript T-087 scoped payload-linkage proof passed 4 tests.
- `npm run test:semantic` passed 291 tests.
- `./run_tests` passed 349 tests with 19 deselected from
  `build_tenants/abiogenesis/python/test_env`.
