# M03 Payload Ledger Event Topology Derivation

**Status**: Active
**Date**: 2026-04-29
**Purpose**: Close the design-triage part of T-095 by defining the ABG-owned
event-sourced payload ledger topology before TypeScript tenant implementation.

Retired sections: [history/M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_DERIVATION__RETIRED_SECTIONS.md](history/M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_DERIVATION__RETIRED_SECTIONS.md).

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

### Native definition material in durable event rows

The existing EventStore body codec may share one exact immutable definition
bundle from a native instruction assembly in an
`actor_transport_binding_admitted` event. The known slot is
`payload.instructionAssembly.envelope.nativeBasis`: its present `publication`,
`assessmentPublication`, `lifecyclePublication`, `sourcePublication`,
`declarationGraphFunctions`, and `graphFunction` fields. Per-call graph, execution
basis, cursor, input, plan, prompt and prefix coordinates remain outside that
bundle. The codec does not search arbitrary JSON paths.

Physical codec version 2 may omit those fields and reference an earlier exact,
physically inline native-definition bundle in the same authenticated stream.
The existing coordinate table separates this typed slot from input/Result
values; there is no additional ledger or cache authority. The extraction owner
serves encoding and durable selected-body acquisition. Decode restores every
present definition field before ordinary Event and native-assembly validation,
preserving complete logical values, envelope/payload/prompt/schema/plan digests,
source identity and inspectable material. Missing, forward, foreign-slot or
changed-source references refuse. Raw rows and existing codec version 1 retain
their exact meaning, including input/Result cross-slot sharing.
