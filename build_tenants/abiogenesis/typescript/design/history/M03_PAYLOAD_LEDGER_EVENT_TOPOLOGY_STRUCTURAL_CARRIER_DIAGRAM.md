# M03 Payload Ledger Event Topology Structural Carrier Diagram

**Status**: Active
**Date**: 2026-04-29
**Derived from**: [M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_DERIVATION.md](./M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_DERIVATION.md), [M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_FIRST_SLICE_IACS.md](./M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_FIRST_SLICE_IACS.md), [T-095](../../../../.ai-workspace/tickets/active/T-095-define-event-sourced-abg-payload-ledger-and-legal-proof-topology.md)

## Target Architecture

```mermaid
flowchart LR
  GTL[GTL graph function and vector declarations]
  Hooks[Payload contracts and assurance hook refs]
  Worker[Claude actor or worker boundary]
  Plugins[Typed plugins and providers]
  Commands[ABG admission commands]
  Emit[emit only write path]
  Events[(ABG event stream)]
  PayloadLedger[Payload ledger projection]
  AuthorityLedger[Authority ledger projection]
  EvidenceLedger[Evidence ledger projection]
  Assurance[Assurance projection and closure fold]
  Register[Downstream lifecycle register projection]
  Reports[Reports, archives, release views]

  GTL --> Hooks
  Hooks --> Commands
  Worker --> Commands
  Plugins --> Commands
  Commands --> Emit
  Emit --> Events
  Events --> PayloadLedger
  Events --> AuthorityLedger
  Events --> EvidenceLedger
  PayloadLedger --> Assurance
  AuthorityLedger --> Assurance
  EvidenceLedger --> Assurance
  Assurance --> Register
  Assurance --> Reports
  Register --> Reports
```

## Source Fact Flow

```mermaid
sequenceDiagram
  participant G as GTL declaration
  participant A as ABG runtime
  participant W as Claude actor
  participant P as Plugin provider
  participant E as Event stream
  participant Q as Projections
  participant C as Closure fold

  G->>A: declare payload contracts and hook refs
  A->>W: dispatch under actor invocation
  W-->>A: result artifact, stdout, stderr
  A->>E: PayloadObserved
  A->>P: request codec/evidence/authority proposal
  P-->>A: proposed facts
  A->>E: PayloadValidated or PayloadRejected
  A->>E: AuthoritySnapshotAdmitted
  A->>E: EvidenceAdmitted or AmbiguityObservationAdmitted
  E->>Q: replay
  Q->>C: assurance rows and closure inputs
  C-->>A: close, retry, reprice, block, or qualified_defer
```

## Closure Prohibition

```mermaid
flowchart TB
  WorkerSuccess[Worker success]
  ReportGreen[Report says green]
  ShadowLedger[Mutable plugin or product ledger]
  ABGAdmission[ABG payload/evidence admission]
  EventReplay[Replay-derived projection]
  Closure[Closure decision]

  WorkerSuccess -.not enough.-> Closure
  ReportGreen -.not enough.-> Closure
  ShadowLedger -.not enough.-> Closure
  WorkerSuccess --> ABGAdmission
  ReportGreen --> ABGAdmission
  ShadowLedger --> ABGAdmission
  ABGAdmission --> EventReplay
  EventReplay --> Closure
```

## Carrier Ownership

| Carrier | Owner | Writes truth? |
| --- | --- | --- |
| GTL payload contract declaration | GTL publication | no runtime writes |
| provider proposal | plugin | no |
| payload body | worker/product/archive | no runtime truth by itself |
| payload envelope | ABG | yes, through event admission |
| payload event | ABG | yes, through `emit()` |
| payload ledger | ABG projection | no |
| lifecycle register | downstream projection | no |
| report/archive | downstream projection | no |

## Target Test Flow

```mermaid
flowchart LR
  Scenario[Scenario 11 authority]
  Harness[Harnessed sandbox UAT]
  Live[Claude live UAT]
  Archive[Run archive]
  Review[External STDO review]

  Scenario --> Harness
  Scenario --> Live
  Harness --> Archive
  Live --> Archive
  Archive --> Review
```
