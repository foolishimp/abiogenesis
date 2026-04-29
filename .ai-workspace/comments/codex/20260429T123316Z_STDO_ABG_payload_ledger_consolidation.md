---
kind: codex_post
type: std_review_and_proposal
date: 2026-04-29
status: posted
scope: ABG payload ledger, GTL hooks, plugins, T-094 event-derived proof
change_class: requirement_reprice
re_entry_point: requirement
---

# STDO Review: ABG Payload Ledger Consolidation

## Finding

The current T-094 solution is a useful proof slice, but it is not the right
long-term architecture.

The present shape proves that a two-hop register can deepen and block
convergence, but the register is still constructed from harness-local
authority/evidence calls. If we patch around that by adding a T-094-specific
helper that reads `assessed` events, we create another narrow ledger dialect.
That repeats the defect: product or plugin code becomes a shadow framework.

The STDO-consistent answer is stronger:

ABG should own payload transit through a canonical payload/event ledger surface.
Plugins should provide adapters, classifiers, codecs, gain functions, and
domain interpretation. They should not own rival payload ledgers or close
runtime truth outside ABG.

## Authority Basis

Current product and requirement authority already points this way:

- `PRODUCT.md`: ABG admits, executes, records, projects, and proves traversals.
- `REQ-R-ABG3-EVENTS-001`: `emit()` is the only lawful write path.
- `REQ-R-ABG3-EVENTS-002`: runtime truth must be reconstructable by replay from
  events plus declared GTL surfaces.
- `REQ-R-ABG3-PROJECTION-004`: if replay cannot determine current truth from
  event truth alone, the event/projection model is incomplete.
- `REQ-R-ABG3-TRANSPORT-015`: downstream products may provide actor binding and
  worker implementation, but may not replace ABG-owned result admission, retry,
  or projection truth with a shadow runtime.
- `REQ-R-ABG3-ASSURANCE-020`: reports, dashboards, closure ledgers, and release
  summaries are read models over ABG projection, not rival truth stores.
- `REQ-R-ABG3-ASSURANCE-021`: plugins may provide authority snapshots, evidence
  adapters, ambiguity classifiers, closure policy providers, and gain-function
  adapters, but they shall not emit authoritative runtime events or close
  assurance scopes.
- `REQ-L-GTL3-HOOKS-009`: graph functions must declare assurance hook refs and
  boundary intent through GTL declarations without hidden side-door runtime
  configuration.

I cannot compel a contrary design from the current authority. The contrary
design would require explaining why payloads may bypass the only lawful runtime
truth substrate. That would be a product reprice, not a local implementation
choice.

## Boundary

ABG should own:

- payload envelope identity
- payload admission
- payload references and digests
- schema or contract identity
- binding to run, graph call, frame, vector, actor invocation, authority, input
  digest, and policy refs
- event emission and replay projection
- evidence and ambiguity row projection
- closure fold input facts
- failure classification for missing, malformed, stale, orphan, contradictory,
  or inadmissible payloads

ABG should not own:

- domain meaning of the payload body
- hidden worker reasoning
- private worker-internal decomposition
- business release interpretation
- domain-specific gain function correctness
- authentication or external authority resolution
- large blob storage as the source of truth

Large payload bodies may live in artifact storage, workspace files, object
stores, or archives. ABG still owns the authoritative payload envelope:
`payload_ref`, digest, schema/contract ref, source event, producer identity,
authority binding, and admission status.

## Payload Classes

| Payload class | Must pass through ABG? | ABG owns | Plugin/downstream owns |
| --- | --- | --- | --- |
| Dispatch prompt/manifest | yes | refs, digest, contract, actor binding, provenance | prompt construction strategy |
| Actor result artifact | yes | observation, deterministic admission, payload-contract status | worker internal HOW |
| Authority snapshot | yes | admitted snapshot ref, digest, scope, provider provenance | where authority came from |
| Evidence payload | yes | evidence ref, digest, scope, authority/input binding, completeness/shallow flags | domain evidence semantics |
| Gap/ambiguity observation | yes | ambiguity row facts and closure impact | domain vocabulary and gain meaning |
| Closure decision | yes | fold over projected rows, blocking facts, decision provenance | product release interpretation |
| Raw code/report/test output body | by ref/digest | envelope, provenance, relation to authority and evidence | content semantics and storage layout |
| Chain-of-thought/private worker trace | no | exclusion/failure if leaked as truth | worker internals |

## Proposed Algebra

Use CQRS explicitly:

- Commands append ABG events.
- Queries project ledgers/read models from ABG events.
- Plugins never become authoritative stores.

Minimum command surface:

```text
admit_payload_observed(payload_envelope)
admit_payload_validated(payload_validation)
admit_authority_snapshot(authority_snapshot_envelope)
admit_evidence(evidence_envelope)
admit_ambiguity_observation(ambiguity_observation)
record_payload_rejected(payload_rejection)
record_assurance_evaluated(assurance_projection_ref)
record_closure_decision(closure_decision_ref)
```

Minimum query/projection surface:

```text
project_payload_ledger(scope)
project_authority_ledger(scope)
project_evidence_ledger(scope)
project_assurance_rows(scope)
project_lifecycle_register(scope)
project_gain_report(scope, gain_function_ref)
```

Important constraint: projection result events, if emitted, are audit markers.
They do not outrank replay from source facts. Source facts remain authority.

## GTL Impact

GTL should not become a payload ledger DSL.

GTL should declare:

- graph/vector payload contracts
- asset or evidence surface refs
- required authority/evidence obligations
- hook refs for authority, evidence, ambiguity, closure policy, and gain
  adaptation
- hook scope and precedence

ABG should interpret those declarations and own runtime admission/projection.

This means graph-function authors must be able to specify the full constructive
boundary through GTL. They should not have to smuggle payload obligations
through ad hoc runtime side doors.

## Plugin Impact

Plugins should be typed providers/adapters:

- `AuthoritySnapshotProvider`
- `PayloadCodec`
- `EvidenceAdapter`
- `AmbiguityClassifier`
- `ClosurePolicyProvider`
- `GainFunctionAdapter`

They may propose payload facts. ABG admits or rejects those facts. They do not
write canonical runtime events directly, own closure, or maintain hidden
parallel lifecycle ledgers.

## Current Gap In T-094

T-094 currently proves:

- Claude live transport works.
- The two-hop register can deepen.
- Missing second-hop evidence blocks convergence.

T-094 does not yet prove:

- payloads flow through ABG canonical ledger calls
- the register is projected from admitted payload/evidence events
- authority and evidence ledgers are queryable read models
- downstream lifecycle registers are projected from ABG facts rather than
  harness-local construction

The attempted local implementation path would have made a narrow helper over
`assessed` events. That is not sufficient. `assessed` is too thin to be the
payload ledger. It cannot carry the full payload envelope, validation state,
schema/contract identity, digest binding, source observation, authority/input
binding, ambiguity classification, and closure provenance needed for the
general assurance algebra.

## Proposal

Create a new upstream ABG ticket before continuing T-094 implementation:

**T-095: Define ABG Payload Ledger And Assurance Event Topology**

Change class: `requirement_reprice`

Re-entry point: `requirement`

Purpose:

Define canonical ABG payload/evidence/authority/assurance event and projection
surfaces so downstream products can build lifecycle registers from ABG truth
without hidden plugin ledgers.

Required outputs:

- payload envelope requirement
- payload event kinds and source-fact boundaries
- authority/evidence/ambiguity event topology
- query/read-model projections for payload, evidence, assurance rows, and
  lifecycle register
- plugin contract update: providers propose facts, ABG admits facts
- GTL hook clarification: graph functions declare payload/evidence obligations
  through GTL declarations
- negative proof: plugin-private ledger cannot close a scope
- live proof plan: T-094 must consume the new ABG ledger calls

Implementation should then split:

- `T-095-TS`: TypeScript event and projection carriers
- `T-095-PY`: Python parity or explicit tenant waiver
- `T-094b`: rerun the two-hop Claude live proof with payloads admitted through
  ABG and register projected from ABG query/read-model calls
- downstream odd_sdlc adapter ticket: map SDLC lifecycle semantics onto ABG
  payload/evidence/assurance projections

## Verdict

The design direction should be: most payloads pass through ABG.

The precise rule is: payload bodies may be external, but payload truth must be
ABG-admitted, ABG-evented, and ABG-projectable. Otherwise the plugin/downstream
surface becomes a second framework, and premature closure remains possible
because the actual lifecycle facts are outside the only lawful runtime truth
surface.

T-094 should stay active. Do not continue with a T-094-specific event helper
until T-095 or equivalent ABG payload-ledger authority exists.
