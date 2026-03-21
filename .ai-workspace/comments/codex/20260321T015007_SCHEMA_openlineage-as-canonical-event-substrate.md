# SCHEMA: OpenLineage As Canonical Event Substrate

**Author**: Codex
**Date**: 2026-03-21T01:50:07+11:00
**Addresses**: abiogenesis event model, ADR-005, downstream context/delta/governance proposals
**For**: all

## Summary
The forward architectural decision is now explicit: abiogenesis should use OpenLineage as its canonical event substrate. The current simple `{event_time, event_type, data}` JSONL shape in the Python engine is therefore legacy implementation state, not the normative target.

This means all new schema work should be OL-native, and [ADR-005-event-stream.md](/Users/jim/src/apps/abiogenesis/builds/claude_code/design/adrs/ADR-005-event-stream.md#L18) should be treated as stale until it is formally superseded. The question is no longer whether OL is desirable; it is how the repo ratifies and migrates to it without losing projection semantics.

## Decision
Going forward, the abiogenesis event log should be modeled as OpenLineage.

Implications:
- lineage inputs/outputs/facets are the normative event vocabulary
- bespoke engine-only event payloads are not the target architecture
- any future governance or context-audit design should be expressed in OL terms first
- the current Python emitter is an implementation lag, not the architectural source of truth

## Why This Matters
Several current design questions are blocked on event-substrate ambiguity:

- context inclusion vs missing vs ignored
- override attribution
- workflow-version provenance
- prompt-surface auditability
- cross-tenant replay and analysis

OpenLineage is the right substrate because these are lineage questions, not just local state-machine questions. If the event log is meant to explain what constraints were consumed, what was omitted, and who authorized exceptional progression, OL is a better constitutional fit than the current ad hoc event envelope.

## Consequences

### 1. ADR-005 is obsolete as a forward design source

The current accepted ADR says V1 events are simple JSON and not OpenLineage. That may describe historical implementation reality, but it is now the wrong target for new design work.

So from this point:
- use ADR-005 only as historical explanation of the current Python emitter
- do not use it as the normative source for future event-shape decisions

### 2. Downstream proposals should assume OL

This directly validates the OL-native direction of:
- [20260321T014430_SCHEMA_openlineage-context-resolution-and-override-facets.md](/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260321T014430_SCHEMA_openlineage-context-resolution-and-override-facets.md)

And it means future proposals on:
- human gates
- F_P dispatch
- convergence certification
- workflow provenance

should be written as OL event/facet design, not as bespoke `event_type` expansion unless a local compatibility shim is explicitly intended.

### 3. Projection must be re-specified, not assumed

The current `project()` semantics operate over the legacy simple-event schema. If OL is canonical going forward, the repo will need a clear answer to one of these:

- `project()` is rewritten directly over OL events/facets
- or an explicit derived projection layer maps OL events into engine state

That is a separate design decision, but it must now be treated as required work rather than deferred background cleanup.

### 4. Implementation lag should be named honestly

Current implementation reality:
- Python emitter writes simple JSON events
- current `project()` expects simple JSON events
- bootloader prose partially assumes OL

That is an implementation/spec drift state. It should be described that way, not smoothed over.

## Proposed Ratification Direction
The clean sequence is:

1. Ratify OpenLineage as canonical event substrate.
2. Supersede ADR-005 with a new event-model ADR that defines the OL contract.
3. Re-express context resolution, overrides, and provenance in OL terms.
4. Specify how projection works over OL.
5. Only then align tenant implementations.

This avoids continuing to draft precise behavioral rules on top of a disputed event envelope.

## Recommended Action
1. Treat OpenLineage as the authoritative forward event model for abiogenesis.
2. Draft the next proposal specifically as “supersede ADR-005 with OL-native event semantics.”
3. Use the OL-native context-resolution proposal as the active basis for further work, not the earlier engine-specific one.
4. Keep all current Python emitter references clearly labeled as legacy implementation state until the migration contract is written.

