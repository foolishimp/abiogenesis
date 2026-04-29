# M03 Payload Ledger Event Topology Derivation

**Status**: Active
**Date**: 2026-04-29
**Purpose**: Close the design-triage part of T-095 by defining the ABG-owned
event-sourced payload ledger topology before TypeScript tenant implementation.

## Source Authority

- `specification/INTENT.md`
- `specification/PRODUCT.md`
- `specification/requirements/abg/REQ-R-ABG3-EVENTS.md`
- `specification/requirements/abg/REQ-R-ABG3-PROJECTION.md`
- `specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md`
- `specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md`
- `specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md`
- `specification/requirements/gtl/REQ-L-GTL3-HOOKS.md`
- `specification/scenarios/11-event-sourced-payload-ledger-uat.md`
- `M03_TOTAL_ASSURANCE_PROJECTION_DERIVATION.md`
- [T-095](../../../../.ai-workspace/tickets/active/T-095-define-event-sourced-abg-payload-ledger-and-legal-proof-topology.md)

## STDO Triage

The T-094 proof exposed a design gap. It proved that a two-hop register can
deepen and stop convergence, but the register was still constructed from
harness-local authority and evidence rows. That is not enough for closure under
event/projection law.

The lawful re-entry is `requirement_reprice`, then design. The new requirement
states the missing constitutional truth: payload ledger state is event-sourced
ABG truth, and ledgers are projections.

## Position

ABG is the payload runtime truth owner. Plugins and downstream products may
produce payload bodies, propose facts, and interpret domain meaning. They do
not own authoritative payload ledgers, emit runtime truth directly, or close
assurance scopes.

The design uses CQRS:

- commands request admission of source facts,
- `emit()` appends the authoritative event stream,
- projections derive ledgers, registers, reports, and closure inputs.

Payload bodies may be large and external. The event stream preserves their
envelope, digest, contract identity, provenance, runtime binding, authority
binding, and admission result.

## Target Source Fact Families

T-095 introduces these source fact families inside existing M03 runtime
aggregates:

1. `PayloadObserved`
2. `PayloadValidated`
3. `PayloadRejected`
4. `AuthoritySnapshotAdmitted`
5. `EvidenceAdmitted`
6. `AmbiguityObservationAdmitted`
7. `ClosureInputPublished`

These are event families, not new aggregates. They attach to the nearest
enclosing `GraphCall`, `Frame`, `Continuation`, or vector-local scope according
to existing ABG event law.

## Command Surface

ABG owns these command boundaries:

```text
admit_payload_observed(payload_envelope)
admit_payload_validated(payload_validation)
reject_payload(payload_rejection)
admit_authority_snapshot(authority_snapshot_envelope)
admit_evidence(evidence_envelope)
admit_ambiguity_observation(ambiguity_observation)
publish_closure_input(closure_input_ref)
```

Commands are not truth. A command is lawful only when it can emit an admissible
source fact or fail closed with a typed rejection.

## Projection Surface

ABG exposes these read models:

```text
project_payload_ledger(scope)
project_authority_ledger(scope)
project_evidence_ledger(scope)
project_ambiguity_ledger(scope)
project_assurance_rows(scope)
project_closure_input(scope)
```

Each projection is deterministic over:

- admitted event stream,
- declared GTL graph/vector payload contracts,
- resolved hook refs,
- current authority/input snapshot,
- policy refs,
- provider outputs admitted through ABG.

Projection outputs may be archived or emitted as audit markers. They are not a
new write path.

Downstream products may expose lifecycle registers and gain reports as their
own read models over ABG projections. Those reports are not M03 ABG carriers and
do not move domain lifecycle or gain semantics into ABG.

## Payload Envelope

The canonical payload envelope preserves:

- `payloadRef`
- `payloadClass`
- `schemaRef` or `contractRef`
- `digest`
- `producerRef`
- `sourceEventRef`
- `runId`
- `graphCallId`
- `frameId`
- `continuationId` when present
- `vectorIndex` when present
- `edge`
- `actorInvocationId` when present
- `authorityRef` when present
- `inputDigest` when present
- `policyRefs`

The envelope is the ABG-owned runtime truth. The body may remain external.

## Authority And Evidence

`AuthoritySnapshotAdmitted` captures the current authority/input identity for a
scope. It provides the digest basis for stale-input detection.

`EvidenceAdmitted` captures a candidate proof fact. It is bound to payload,
scope, authority, input digest, provenance, and proof-shape metadata. Evidence
does not close by itself; it feeds assurance row projection.

## Plugin Topology

Plugins remain providers and adapters:

| Provider | May do | May not do |
| --- | --- | --- |
| `PayloadCodec` | decode or validate payload body against a contract | write runtime events directly |
| `AuthoritySnapshotProvider` | propose authority/input snapshot data | close or classify the whole scope |
| `EvidenceAdapter` | propose evidence facts from admitted payloads | invent evidence outside admitted payload truth |
| `AmbiguityClassifier` | propose row status and reason codes | emit closure decisions |
| `ClosurePolicyProvider` | provide retry/reprice/defer policy | close a concrete scope alone |
| `GainFunctionAdapter` | provide domain gain signals | make ABG silently repair bad domain meaning |

Provider output is admitted or rejected by ABG. Rejected provider output becomes
visible ambiguity or failure truth.

## GTL Impact

GTL declares:

- payload contracts on graph functions and graph vectors,
- required authority and evidence obligations,
- hook refs and opaque config,
- scope and precedence for hooks.

GTL does not become a ledger DSL. It declares the constructive boundary so ABG
can admit and project payload facts without hidden runtime side doors.

## Core-Interface Migration Inventory

| Surface | Superseded producer/consumer | New producer/consumer | Classification |
| --- | --- | --- | --- |
| worker result artifact truth | worker report JSON, prompt self-report | `PayloadObserved` plus validation source facts | replace |
| payload validity | ad hoc parser status, local test assertions | `PayloadValidated` or `PayloadRejected` | replace |
| authority truth | prompt prose, requirement file reads in harness | `AuthoritySnapshotAdmitted` | replace |
| evidence truth | harness-local `AssuranceEvidenceRow` construction | `EvidenceAdmitted` over payload facts | replace |
| ambiguity truth | report text, unresolved reason arrays | `AmbiguityObservationAdmitted` and assurance rows | replace |
| closure input | local lifecycle register state | `ClosureInputPublished` over projections | replace |
| lifecycle register | mutable downstream ledger | downstream projection over ABG payload/assurance facts | re-authorize as downstream read model |
| reports and archives | local success summaries | read models plus audit markers | re-authorize as read model |
| plugin callbacks | direct callbacks with implicit state | typed providers under ABG admission | replace |

No superseded path may remain authoritative in acceptance.

## Concrete TypeScript Interface Inventory

| Current surface | Current role | Migration action | Negative proof |
| --- | --- | --- | --- |
| `code/src/abg/m03/contracts/carriers.ts` | owns `RuntimeEvent`, `actor_result_artifact_observed`, `assessed`, and event kind values | add payload source event variants; keep `assessed` only as traversal assessment compatibility | unknown or malformed payload event kind rejected |
| `code/src/abg/m03/contracts/event_admission.ts` | admits runtime events by kind | add closed admission rules for payload source facts | missing required envelope fields rejected |
| `code/src/abg/m03/contracts/event_factories.ts` | constructs M03 runtime event facts | add constructors for payload source facts | constructor output passes admission; malformed hand-written event fails |
| `code/src/abg/m03/events/emit.ts` | only runtime write path | continue to own source-fact emission | payload ledger cannot be written without `emit()` |
| `code/src/abg/m03/contracts/projection.ts` | derives runtime aggregate projection, including assessed vector closure | do not make payload ledger a rival aggregate; feed a separate payload projection from the same events | payload projection cannot close vector traversal by itself |
| `code/src/abg/m03/runner/attached_fp_worker.ts` | converts accepted attached worker result to `assessed` events | emit payload observation/validation before evidence or assessed compatibility | worker success with invalid payload creates no evidence row |
| `code/src/app/m04/result_assessment/assessment.ts` | ingests public result artifacts and emits assessed truth | route accepted result through payload admission before evidence truth | accepted shell without admitted payload cannot close assurance |
| `code/src/app/m04/result_assessment/constructors.ts` | builds assessed events from public result assessment | demote direct assessed construction from closure proof to traversal compatibility | old assessed-only output fails payload-ledger legal test |
| `code/src/abg/m03/runner/assurance_gate.ts` | consumes `EngineAssuranceProvider` authority/evidence rows directly | consume payload/authority/evidence projections; providers propose facts only | provider closure/event/vector fields fail closed |
| `code/src/abg/m03/contracts/assurance.ts` | derives assurance projection and closure decision | retain row/fold law; bind evidence rows to payload event refs | missing payload event ref yields partial/orphan/missing row |
| `code/src/abg/m03/contracts/assurance_register.ts` | projects generic lifecycle register from assurance projections | remain read model only; T-094b must feed it from ABG payload facts | direct register mutation cannot affect assurance projection |
| `code/src/app/m04/gaps/projection.ts` | consumes assessed event truth for gaps | consume assurance/payload projections for closure-relevant evidence | green gaps projection without ABG evidence cannot close |
| `code/src/app/m04/live_status/projection.ts` | reports result assessment status | report payload/assurance projection refs, not closure truth | live status green cannot close without closure decision |
| `code/src/qualification/m05/archive_finalization*` | archives assurance summaries | archive payload/evidence/assurance projections as read models | archive shape alone cannot close |
| `test_env/tests/test_t094_assurance_register_two_hop_unit.test.mjs` | proves register deepening from harness rows | replace with ABG event-derived payload ledger proof in T-094b/T-095-TS | no harness-local authority/evidence rows in closure proof |
| `test_env/live/test_t094_assurance_register_two_hop_live.test.mjs` | proves Claude two-hop lane from harness rows | archive actor output, payload events, ledgers, assurance, and register from ABG facts | Claude output without payload admission cannot close |

## Required Break Order

1. Publish payload source fact variants in `RuntimeEvent`.
2. Admit those variants through `event_admission.ts` and `emit(...)`.
3. Add payload/authority/evidence/ambiguity/closure-input projections over
   admitted events.
4. Rebind attached worker and result assessment to payload source facts before
   evidence or closure relevance.
5. Rebind assurance gate to projected payload/evidence facts.
6. Rebind T-094 proof to event-derived payload ledgers.
7. Rebind reports, archives, gaps, and downstream adapters as read-model
   consumers.

Every break requires negative proof that the old seam cannot still close work.

## Legal Test Strategy

Legal tests derive from `11-event-sourced-payload-ledger-uat.md`.

Design/module tests prove:

- source fact admission,
- replay projection,
- plugin authority limits,
- shadow ledger rejection,
- stale/orphan/missing classification.

Harnessed sandbox UAT proves the composed product path with deterministic
fixtures.

Live sandbox UAT crosses the real Claude actor boundary and archives stdout,
stderr, payload observation, payload admission, projections, and closure
decision. Live failure remains evidence and keeps the ticket active.

## Non-Goals

- Do not add a public `UnitOfCompute` aggregate.
- Do not persist a mutable payload ledger as truth.
- Do not make reports, archives, or registers closure authority.
- Do not absorb domain payload semantics into ABG.
- Do not allow plugins to emit runtime events directly.
- Do not claim T-094 closure until its register is projected from admitted ABG
  source facts.
