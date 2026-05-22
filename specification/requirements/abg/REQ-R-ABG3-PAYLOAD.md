# REQ-R-ABG3-PAYLOAD — Event-Sourced Payload Ledger

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-04-29
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md), [REQ-R-ABG3-EVENTS.md](REQ-R-ABG3-EVENTS.md), [REQ-R-ABG3-PROJECTION.md](REQ-R-ABG3-PROJECTION.md), [REQ-R-ABG3-ASSURANCE.md](REQ-R-ABG3-ASSURANCE.md), [REQ-R-ABG3-TRANSPORT.md](REQ-R-ABG3-TRANSPORT.md), [REQ-L-GTL3-HOOKS.md](../gtl/REQ-L-GTL3-HOOKS.md)

---

## Purpose

Define ABG's payload ledger as an event-sourced runtime truth surface.

Payloads that matter to traversal, authority, evidence, ambiguity, closure,
provenance, or downstream register projection shall pass through ABG admission.
Ledgers are deterministic projections over admitted ABG events and declared GTL
surfaces. They are not writable truth stores.

## Scope

This requirement governs payload envelopes and their runtime truth. Payload
bodies may live outside ABG as files, artifacts, object-store entries, archives,
or downstream product assets. ABG owns the authoritative envelope, reference,
digest, schema or contract identity, runtime binding, provenance, and admission
status when the payload participates in runtime or assurance truth.

This requirement does not make ABG own private worker reasoning, domain payload
meaning, product-specific gain functions, or downstream release interpretation.

## Acceptance Criteria

**REQ-R-ABG3-PAYLOAD-001**: ABG shall treat runtime-relevant payload ledger state as event-sourced truth. The event stream is the write side, and payload ledgers are replay-derived read models.

**REQ-R-ABG3-PAYLOAD-002**: A payload that participates in traversal, authority, evidence, ambiguity, closure, provenance, retry, correction, or downstream register projection shall have an ABG-admitted payload envelope.

**REQ-R-ABG3-PAYLOAD-003**: A payload envelope shall preserve at minimum payload reference, payload class, schema or contract reference, digest or equivalent identity, producer reference, source runtime event when present, aggregate scope, actor invocation when present, authority binding when present, input digest when present, and applicable policy references.

**REQ-R-ABG3-PAYLOAD-004**: ABG may store payload bodies outside the event stream, but the external body shall be referenced by envelope identity and digest. External body storage shall not become runtime truth without ABG admission.

**REQ-R-ABG3-PAYLOAD-005**: Payload observation, payload validation, payload rejection, authority snapshot admission, evidence admission, ambiguity observation, and closure-input publication shall be represented as ABG runtime source facts or deterministic projections over source facts.

**REQ-R-ABG3-PAYLOAD-006**: Payload validation shall classify missing, empty, malformed, unreadable, schema-invalid, contract-invalid, stale, orphaned, contradictory, and accepted payload states without parsing worker internals as domain truth.

**REQ-R-ABG3-PAYLOAD-007**: Authority snapshots used by assurance shall enter ABG as admitted payload or authority facts with deterministic authority/input identity sufficient for stale-input detection.

**REQ-R-ABG3-PAYLOAD-008**: Evidence used by assurance shall enter ABG as admitted evidence facts bound to scope, authority, input digest, payload identity, provenance, and proof-shape metadata sufficient to distinguish fulfilled, partial, missing, stale, orphan, contradictory, deferred, and invalid-ledger states.

**REQ-R-ABG3-PAYLOAD-009**: A report, dashboard, archive, release summary, lifecycle register, or product-specific ledger shall be a read model over ABG payload, authority, evidence, assurance, and closure projections. It shall not write rival payload truth.

**REQ-R-ABG3-PAYLOAD-010**: Plugins may provide payload codecs, authority providers, evidence adapters, ambiguity classifiers, closure policy providers, and gain-function adapters, but ABG shall own admission, event emission, projection, and closure relevance.

**REQ-R-ABG3-PAYLOAD-011**: GTL graph functions and graph vectors shall be able to declare payload contracts, evidence obligations, authority surfaces, and hook references needed for ABG payload admission without hidden side-door runtime configuration.

**REQ-R-ABG3-PAYLOAD-012**: Worker success, transport success, prompt-side self-assessment, `unresolvedReasons: []`, passing tests, and archive shape shall not become payload, evidence, or closure truth until represented through admitted ABG payload and evidence facts.

**REQ-R-ABG3-PAYLOAD-013**: Private chain-of-thought, hidden worker decomposition, and worker-internal tactic traces shall not be admitted as constitutional runtime truth. If such material appears in a payload channel, ABG shall treat it as payload-contract risk or exclude it from closure relevance.

**REQ-R-ABG3-PAYLOAD-014**: Projection result events, checkpoints, or snapshots may be emitted as audit or replay aids, but they shall not outrank replay from source payload, authority, evidence, ambiguity, and closure-input facts.

**REQ-R-ABG3-PAYLOAD-015**: Same-edge retry, correction, reopen, or authority/input change shall preserve prior payload facts while requiring fresh projection over current admitted authority/input truth.

**REQ-R-ABG3-PAYLOAD-016**: Downstream products may project domain-specific lifecycle registers from ABG payload facts, but missing domain semantics, bad gain functions, or adapter gaps shall surface as explicit ambiguity or gap rows rather than silent closure.

**REQ-R-ABG3-PAYLOAD-017**: Hook action records and hook finding admissions shall be ABG-owned payload/event inputs when plugin output participates in traversal, assurance, projection, intent, ledger, or closure truth. The plugin-returned payload is not owning truth until ABG admits it under the hook contract.

**REQ-R-ABG3-PAYLOAD-018**: Edge assurance evaluation findings shall preserve refs for the selected edge assurance contract, hook action, gain report, metrics, close disposition, residual pressure, continuation, evidence, authority, and composition contribution. Payload admission shall reject side-door engine authority fields.

**REQ-R-ABG3-PAYLOAD-019**: Payload ledger projections for graph-vector output payloads shall carry the selected GTL target carrier contract ref and digest. Target carrier satisfaction requires an admitted payload under that selected contract. Rejected, missing, wrong-contract, or malformed target carriers shall remain non-closing pressure and shall not be treated as edge completion by file presence, worker prose, or arbitrary payload existence.

**REQ-R-ABG3-PAYLOAD-020**: Payload and evidence facts that participate in an `abg.fn_composition`-governed traversal shall carry the selected composition ref and digest, or a causally linked composition selection ref. Payloads admitted under a different composition identity shall be projected as wrong-contract evidence, not as closure satisfaction.

**REQ-R-ABG3-PAYLOAD-021**: Payloads produced by `plugin.transform.C`, `plugin.evaluate.C`, `plugin.consequence.C`, or an external `F_H` response shall remain proposed payloads until ABG admits them. The admitted payload envelope shall preserve compute-stage category or causally linked category selection when that payload can affect ledgers, assurance, traversal, replay, or downstream read-model consequence.
