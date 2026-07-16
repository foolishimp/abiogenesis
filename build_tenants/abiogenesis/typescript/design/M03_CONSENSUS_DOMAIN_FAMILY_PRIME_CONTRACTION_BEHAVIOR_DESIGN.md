# M03 Consensus Domain Admission And Ticket Projection Behavior Design

**Status**: Accepted - reconciled to ratified Ontology; implementation fenced on T-281, T-270, and T-274

**Date**: 2026-07-16

**Ticket**: `T-275`

**Change class**: `design_reframe`

**Governing design**: [ADR-044](./adrs/ADR-044-prime-contraction-is-a-cross-boundary-design-gate.md)

**Governing Ontology**: [ABIogenesis Public Control-Plane Ontology `/9`](./ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md), digest `f817a7e730bec935f053138e85cb09aa6e0f693e558eaf287be502803da20ee8`

**Ratified dependencies**:

- T-270 `run.invoke` design digest `71076f364d06a9725b5482ee0cdc84e64d29a4c18447a5ab4c41e1b62ba7f430`, accepted by `20260716T062747Z_DECISION_fh_accept_t270_reconciled_run_invoke_design.md`
- T-274 publication design digest `930c26a2fa5e144ebe0d0ba1aa639fd2aaf531b51e4b5921df434860718313e8`, accepted by `20260716T062342Z_DECISION_fh_accept_t274_reconciled_publication_design.md`
- completed T-256 declared execution-context admission
- completed T-257 declared F_P result admission
- completed T-267 whole-program conservation
- completed T-271 complete C-program interpretation

**Census rows**: `PC-001`, `PC-003`

## Boundary

This design consumes the one T-274 `ConsensusContractFamily`. It does not add a
domain author, public schema identity, vocabulary, public operation, event kind,
store, traversal authority, or ticket authority.

The first relation binds an admitted `ConsensusSubject` to one immutable
`WorkspaceBinding`, one admitted `GtlProgram`, one narrowing `CatalogView`, one
exact `ConsensusPanel`, and one exact `ConsensusRoundPolicy`. It derives ordered
private reviewer assignments from the panel's declared profile vector. T-275
validates that relation; it does not select a reviewer or worker. The generic
T-256 execution-context compiler remains the only path from an assignment to a
declared F_P request. ABG then opens the ordinary C-call and actor invocation.
T-257 admits the exact raw wire envelope; it does not validate domain fields.
One generic declared-schema bridge resolves the T-256-selected result contract,
admits the raw payload against that schema, and calls the same
`ConsensusContractFamily.review_findings` decoder used by the typed GTL node.
The bridge is contract-indexed and proves a non-Consensus fixture; it is not a
Consensus parser side path.

The second relation binds the canonical Consensus graph output to its existing
`AdmittedOutputAuthorityProjection`, execution basis, payload ledger, and
canonical replay. `AF-03 project` then derives a
`TicketConsensusProjection` through the `ticket_consensus` variant of
`abg.operation.project.read`. The projection is a pure read model over admitted
truth. It is not persisted and cannot mutate, close, create, split, or triage a
ticket.

The published Module and GraphFunction remain declarations. The admitted GTL
program owns the graph sequence. T-270 owns `run.invoke` authority admission.
T-272 owns response and continuation from a held F_H interaction. T-275 cannot
fabricate a final result from a held or incomplete state.

### Requirements

- `REQ-P-CONSENSUS-004..012`, `-015`, and `-019`
- `REQ-P-PUBLIC-CONTRACTS-006` and `-008..010`
- PRODUCT bounded Consensus and Public Operator Contract
- the ratified public control-plane Ontology, especially `AF-03`, `AF-15`,
  `RuntimeProjection<K>`, and the 19-operation hard break

### Explicit Exclusions

- a second Consensus type, schema, decoder, or publication family;
- `ticket.consensus` as an operation identity or handler;
- `catalog.invoke`, `read.result`, `read.replay`, or a compatibility alias;
- profile or worker selection owned by T-275;
- a domain result that bypasses the generic T-257 raw-envelope and declared-
  schema admission chain;
- a Consensus-specific runtime, reviewer loop, result store, event writer,
  retry controller, closure evaluator, or ticket writer;
- caller-authored result, replay, projection ref, or projection digest;
- completion-order attribution or adapter-position attribution; and
- projection of a held F_H interaction as a terminal `ConsensusResult`.

## Ontology Slice

### Irreducible Architectural Carrier Set

| Carrier | Authority | Lifecycle role |
|---|---|---|
| `ConsensusContractFamily` | one native domain authoring family | Owns the exact field and value-domain meaning of all nine public variants and the graph-private variants. |
| `ConsensusDomainAdmission` | one exact kind-directed native admission boundary | Converts unknown values to frozen family members; it cannot prove cross-carrier relations alone. |
| `TypedNode` and `TypedVectorNode` | existing GTL native witnesses | Preserve scalar type and ordered vector member type without becoming domain authors. |
| `PublicInvocation<run.invoke>` | accepted public invocation family | Carries the exact input basis and invocation identity that propose the subject. |
| `InvocationAuthority<run.invoke>` | accepted authority join | Binds submitting actor, grants, policy, catalog view, steering provenance, and stable authority basis. |
| `PublicFunctionDefinition<project.read>` | accepted public function-definition family | Defines one closed source/projection relation and its request, result, refusal, binding, and effect law. |
| `PublicInvocation<project.read>` | public query admission | Names the exact result source, projection kind, workspace binding, and authority basis. |
| `WorkspaceBinding` | stable workspace/product/catalog authority | Binds the same workspace and catalog basis used by `run.invoke`; ordinary observation does not change it. |
| `GtlProgram` | admitted constructive program | Publishes the canonical Consensus GraphFunction and owns the graph sequence; T-275 cannot rewrite it. |
| `CatalogView` | narrowing catalog authority | Proves the exact function and declared profile/policy inputs remain in the admitted view. |
| `DeclaredExecutionRequest` | existing T-256 locus authority | Carries the exact per-reviewer selection, configuration, instruction, result, and capability requirements. |
| `CCall` and `ActorInvocation` | existing ABG effect lineage | Bind one assignment-derived request to one graph/frame/vector attempt, worker dispatch, actor, and result identity. |
| `AdmittedFpResultContractEnvelope` | existing T-257 raw wire admission | Conserves the selected contract ref and raw payload digest under one exact wire profile; it makes no domain-schema claim. |
| `DeclaredDomainResultAdmission` | generic contract-indexed F_D bridge | Resolves the selected declared schema, validates the raw domain payload, and invokes the schema family's native decoder before target-carrier admission. |
| `AdmittedOutputAuthorityProjection` | existing payload-ledger result authority | Proves the output payload ref, digest, contract, producer, basis, validation, and evidence for the canonical result locus. |
| `RuntimeEventLog` | existing append-only replay authority | Supplies exact graph-call, basis, result, interaction, lineage, and replay truth. |
| `ConsensusResult` | admitted domain result | Carries one immutable subject/panel/policy/round/findings/rulings/outcome/evidence/lineage result. |

`ConsensusSubjectAdmissionBasis`, `ConsensusConfigurationBinding`,
`ReviewerAssignment`, `AssignmentInvocationBinding`, ordered assignment and
findings vectors, `ConsensusResultProjectionBasis`, and
`TicketConsensusProjection` are subordinate derived values. They own no
selection, mutation, execution, or retention lifecycle.

### Lifecycle Completeness

| Entity | Declare/create | Read/project | Update/transition | Delete/retire |
|---|---|---|---|---|
| `ConsensusReviewerProfile` | admitted from one declared program/profile source through the family decoder | projected through its profile ref and exact configuration basis | changed selection, configuration, instruction, result, or capability basis creates a new profile value and digest | prior profile remains evidence; no public retirement operation |
| `ConsensusPanel` | admitted as one non-empty ordered vector of exact profiles | resolved by the subject and admitted program/view | changed membership, order, or profile basis creates a new panel digest | prior panel remains evidence |
| `ConsensusRoundPolicy` | admitted from one declared policy source | resolved by the subject and program policy basis | changed budget, rule, escalation, or foldback basis creates a new policy digest | prior policy remains evidence |
| `ConsensusSubject` | admitted as immutable invocation input under `run.invoke`; a subordinate basis joins its exact contract/ref/digest, submitting actor, optional ticket ref/digest, invocation input basis, invocation authority, and workspace | read with its exact workspace, panel, policy, actor, source, and optional ticket identity | changed subject, digest, actor, panel, policy, workspace, ticket, input, or authority basis creates a new subject | prior subject remains causal input evidence |
| `ReviewerAssignment` | F_D derives one private row per ordered panel profile | consumed by T-256 and the canonical fan-out | never updated; changed profile/panel/round creates another assignment | invocation-local subordinate value expires with its execution basis but remains replay evidence |
| `AssignmentInvocationBinding` | ABG derives it when the interpreter opens the assignment's C-call and actor invocation | joins panel ordinal/request to actor invocation, result, and event refs | another attempt creates another immutable binding | retained as replay-derived effect lineage |
| `ReviewFindings` | the generic declared-schema bridge admits the T-257 raw envelope payload through the selected family schema, then verifies its assignment/invocation relation | consumed by canonical reduction and replay projection | correction or retry admits another attributed value; it never rewrites the prior value | retained under payload/event law |
| `ReviewRulings`, `ConsensusRoundOutcome`, `ConsensusResult` | canonical GTL stages produce and existing result admission validates them | runtime result and replay reads project them | another round or corrected evidence creates another immutable value | retained under runtime and payload law |
| `TicketConsensusProjection` | `AF-03` derives it only on an admitted query | returned through `project.read` | a different result/replay/ticket basis derives another projection ref/digest; no stored row changes | ephemeral read model; no retirement operation |

### Authority And Function Derivation

```text
PublicInvocation<run.invoke>
  -> InvocationAuthority + exact invocation input basis
  -> admitted GtlProgram + WorkspaceBinding + CatalogView
  -> exact subject source/actor/ticket + ConsensusPanel + ConsensusRoundPolicy relation
  -> F_D ordered ReviewerAssignment projection
  -> T-256 DeclaredExecutionRequest per assignment
  -> ABG interpreter opens CCall + ActorInvocation and dispatches ordinary F_P work
  -> T-257 admits the exact raw result envelope and selected contract identity
  -> generic declared-schema admission decodes ConsensusContractFamily.review_findings
  -> assignment/actor-invocation/replay-attributed ReviewFindings
  -> canonical GTL fan-in, reduction, bounded recurse, and F_H boundaries
  -> ConsensusResult target-carrier admission
  -> AdmittedOutputAuthorityProjection + RuntimeEventLog
  -> PublicInvocation<project.read>
  -> AF-03 ticket_consensus projection
  -> TicketConsensusProjection
```

The admitted program owns the constructive order. T-275 owns only the generic
declared-schema bridge, deterministic cross-carrier verification, and the pure
projection implementation. `AF-15`, T-256, T-257 raw-envelope admission, ABG
effect/event admission, T-272, and `AF-03` retain their existing authority.

Projection loss is deliberate. `TicketConsensusProjection` exposes the admitted
Consensus result and its ticket/result/replay basis. It omits private traversal,
worker transport, prompt, frame, retry, continuation, current-selection, and
ticket-mutation state. Omitted state cannot be reconstructed from profile labels,
payload shape, array order, or adapter data.

## Relational Admission Decisions

### D1. Local Shape Is Necessary But Not Sufficient

`ConsensusDomainAdmission` continues to reject unknown kinds, extra fields,
malformed digests, open enums, empty required arrays, and duplicate profile
identities. A separate relation verifier then checks that independently admitted
family members share the same authority and causal basis. Passing the local
decoder never proves panel membership, current configuration, invocation
attribution, result reachability, or projection eligibility.

### D2. Subject, Actor, Ticket, Panel, Policy, Program, And Workspace Bind Exactly

`ConsensusSubjectAdmissionBasis` is a subordinate deterministic join over the
admitted `PublicInvocation<run.invoke>`, its `InvocationAuthority`, its exact
input-basis ref/digest, and its immutable `WorkspaceBinding`. The subject's
`subjectContractRef`, `subjectRef`, and `subjectDigest` must identify the exact
admitted input source. `submittingActorRef` must equal the invocation's admitted
actor attribution. `ticketRef` and `ticketDigest` are jointly absent or resolve
to one exact ticket source under the same workspace/input basis; path presence
or caller prose is not authority.

The subject's workspace, panel, and round-policy refs must then resolve exactly
once inside the admitted program and narrowed catalog view under that same
binding. The panel digest binds its ordered profile vector. The policy digest
binds its declared positive budget and rule/foldback refs. A string-shaped ref or
digest with no exact admitted source is invalid.

Downstream profiles and policies enter through ordinary declared GTL/catalog
surfaces. T-275 adds no catalog kind, global registry, ambient profile directory,
or configuration file scan.

### D3. Reviewer Assignment Is A Projection, Not Selection

The canonical F_D `expand_panel` locus derives exactly one assignment for each
declared panel ordinal. The private assignment preserves:

- panel ref and declared ordinal;
- profile ref;
- role or worker-selection contract ref;
- configuration digest;
- instruction contract ref;
- result contract ref; and
- declared capability requirement refs.

The role/worker-selection value is projected into T-256's existing
`role_or_worker_selection_ref` slot. The profile configuration digest must equal
the value admitted from the same T-256 source closure. Profile capability refs
are requirements, not grants; generic capability admission remains authoritative.

T-256 validates and returns the declared request. It does not choose a worker,
open an invocation, dispatch transport, admit a domain result, or write an event.

### D4. Attribution Is Independent Of Completion Order

ABG's ordinary interpreter/effect path consumes one declared request and opens
one C-call plus one `ActorInvocation`. A subordinate
`AssignmentInvocationBinding` joins the assignment ref/digest and panel ordinal
to the declared request ref/digest, C-call ref, graph-call/frame/vector identity,
actor invocation id, actor result ref, and causal event refs. Neither the
assignment nor T-256 pre-authors an invocation identity.

T-257 next admits only the exact raw wire envelope, selected result-contract ref,
and raw payload digest. This slice realizes T-257's previously deferred generic
wire profile as the exact two-key envelope
`{ resultContractRef, payload }`. The envelope vocabulary is fixed; the selected
declared schema is the sole shape authority for `payload`. The generic declared-
schema bridge resolves that selected contract from the same admitted program and
contract-catalog basis, validates `payload`, and invokes the family decoder. It
cannot accept an echoed contract ref as schema success or merge schema fields
into the envelope vocabulary. A non-Consensus declared-schema fixture must use
the same profile and bridge.

Each admitted `ReviewFindings` value must then match one exact assignment and
invocation binding by profile ref, configuration digest, actor invocation id,
output digest, result contract, and reachable evidence. Every required profile
appears once for the round. Missing, duplicate, foreign, stale, or unattributed
output remains typed non-close truth. The deterministic vector order is panel
ordinal, never worker completion order.

`ReviewFindings.invocationRef` equals the bound `actorInvocationId`.
`ReviewFindings.outputDigest` equals the canonical digest of the admitted domain
`payload`, not the outer envelope or free-form transport text. Its evidence refs
must be reachable from the same actor-result, C-call, payload, and event chain.

### D5. Result Admission Conserves Runtime Truth

The canonical result target locus must have one admitted
`AdmittedOutputAuthorityProjection` whose payload ref, digest, target contract,
producer, execution basis, validation refs, and evidence refs match the
`ConsensusResult`. The result must preserve the exact subject, panel, policy,
ordered rounds, finding sets, ruling rows, classification, dissent, terminal
outcome, evidence, lineage, result ref, and replay ref reachable from the same
runtime log.

The terminal outcome must name the final represented round; its finding and
ruling refs must be reachable from the result's admitted round data. Contract
failure classification and failure ref remain paired. Agreement and dissent
cannot be inferred from prose or worker order.

### D6. F_H Hold Is Not A Final Result

`escalate_fh` may be observed as typed round/F_H replay truth. A held interaction
is still nonterminal runtime truth. T-275 exposes no `ConsensusResult` or ticket
projection until T-272 admits any required response/continuation and the canonical
graph produces a valid result under its declared output contract.

If the canonical body cannot produce the result required by the accepted product
after lawful continuation, implementation stops and routes the structural gap to
the owning GTL design. T-275 cannot synthesize a result in the projector.

### D7. Ticket Projection Is Pure AF-03

The one accepted relation is:

```text
source: admitted ConsensusResult + exact subject/output/replay basis
projection kind: ticket_consensus
operation: abg.operation.project.read
result: TicketConsensusProjection
```

The source subject must contain jointly present ticket ref and digest. The result
must preserve the same subject identity. `projectionRef` and `projectionDigest`
derive canonically from the exact ticket, result, output-authority, and replay
basis; callers cannot supply them as authority. The same inputs reproduce the
same projection. The projector emits no event, performs no write, and never
changes ticket status or content.

## Prime Contraction Review

```json prime-contraction
{
  "schemaVersion": 1,
  "iacs": [
    "ConsensusContractFamily",
    "ConsensusDomainAdmission",
    "TypedNode",
    "TypedVectorNode",
    "PublicInvocationRunInvoke",
    "InvocationAuthorityRunInvoke",
    "PublicFunctionDefinitionProjectRead",
    "PublicInvocationProjectRead",
    "WorkspaceBinding",
    "AdmittedGtlProgram",
    "CatalogView",
    "DeclaredExecutionRequest",
    "CCall",
    "ActorInvocation",
    "AdmittedFpResultContractEnvelope",
    "AdmittedOutputAuthorityProjection",
    "RuntimeEventLog",
    "ConsensusResult"
  ],
  "authoritativeCarriers": [
    "ConsensusContractFamily",
    "ConsensusDomainAdmission",
    "TypedNode",
    "TypedVectorNode",
    "PublicInvocationRunInvoke",
    "InvocationAuthorityRunInvoke",
    "PublicFunctionDefinitionProjectRead",
    "PublicInvocationProjectRead",
    "WorkspaceBinding",
    "AdmittedGtlProgram",
    "CatalogView",
    "DeclaredExecutionRequest",
    "CCall",
    "ActorInvocation",
    "AdmittedFpResultContractEnvelope",
    "AdmittedOutputAuthorityProjection",
    "RuntimeEventLog",
    "ConsensusResult"
  ],
  "subordinatePayloads": [
    "ConsensusSubjectAdmissionBasis",
    "ConsensusConfigurationBinding",
    "ReviewerAssignment",
    "ReviewerAssignmentVector",
    "AssignmentInvocationBinding",
    "DeclaredDomainResultAdmission",
    "AttributedFindingsVector",
    "ConsensusResultProjectionBasis",
    "TicketConsensusProjection"
  ],
  "promotionTests": [
    {"candidate":"ConsensusContractFamily","verdict":"promote","reason":"It remains the one independently authored source for every Consensus domain field and discriminant."},
    {"candidate":"ConsensusDomainAdmission","verdict":"promote","reason":"It is the one dynamic boundary that converts unknown values into exact frozen family members."},
    {"candidate":"TypedNode","verdict":"promote","reason":"The existing scalar witness independently binds admitted native values to exact GTL nodes."},
    {"candidate":"TypedVectorNode","verdict":"promote","reason":"The existing vector witness independently preserves member type and declared vector cardinality."},
    {"candidate":"PublicInvocationRunInvoke","verdict":"promote","reason":"The admitted public invocation independently owns request, input-basis, and function identity before domain admission."},
    {"candidate":"InvocationAuthorityRunInvoke","verdict":"promote","reason":"The operation-indexed authority join independently binds actor, grants, view, policy, steering provenance, and stable basis."},
    {"candidate":"PublicFunctionDefinitionProjectRead","verdict":"promote","reason":"The accepted public definition independently governs the closed query relation across schema SDK CLI and ingress."},
    {"candidate":"PublicInvocationProjectRead","verdict":"promote","reason":"The admitted query has an independent public request and refusal lifecycle before projection."},
    {"candidate":"WorkspaceBinding","verdict":"promote","reason":"The immutable binding independently governs exact workspace product root and catalog authority."},
    {"candidate":"AdmittedGtlProgram","verdict":"promote","reason":"The admitted program independently owns the canonical constructive sequence and function membership."},
    {"candidate":"CatalogView","verdict":"promote","reason":"The narrowing view independently constrains admitted callable and declaration inputs without widening authority."},
    {"candidate":"DeclaredExecutionRequest","verdict":"promote","reason":"T-256 independently admits the exact per-locus selection configuration instruction result and capability contract."},
    {"candidate":"CCall","verdict":"promote","reason":"The existing C-call independently identifies the program locus, frame, vector, task, regime, and attempt interpreted by ABG."},
    {"candidate":"ActorInvocation","verdict":"promote","reason":"The existing actor invocation independently owns one worker dispatch and result lifecycle under the C-call."},
    {"candidate":"AdmittedFpResultContractEnvelope","verdict":"promote","reason":"T-257 independently conserves exact wire-profile, selected-contract, and raw-payload identity before domain admission."},
    {"candidate":"AdmittedOutputAuthorityProjection","verdict":"promote","reason":"The existing payload-ledger projection independently proves the admitted result payload contract digest producer and evidence."},
    {"candidate":"RuntimeEventLog","verdict":"promote","reason":"The append-only event log independently owns canonical causal and replay truth."},
    {"candidate":"ConsensusResult","verdict":"promote","reason":"Public consumers pattern-match one independently admitted immutable result with its own result and replay identities."},
    {"candidate":"ConsensusSubjectAdmissionBasis","verdict":"remain_subordinate","reason":"It is the reproducible join of admitted invocation input, actor, workspace, subject, and optional ticket truth and owns no separate lifecycle."},
    {"candidate":"ReviewerAssignment","verdict":"remain_subordinate","reason":"It derives from one admitted panel profile and round ordinal and has no independent selection or lifecycle."},
    {"candidate":"AssignmentInvocationBinding","verdict":"remain_subordinate","reason":"It derives from one assignment, declared request, C-call, actor invocation, and replay event set without selecting or dispatching work."},
    {"candidate":"DeclaredDomainResultAdmission","verdict":"remain_subordinate","reason":"It applies the already-selected schema and family decoder to one T-257 envelope and cannot author contract or domain meaning."},
    {"candidate":"TicketConsensusProjection","verdict":"remain_subordinate","reason":"It is reproducibly derived by AF-03 from admitted result and replay truth and owns no mutation or retention authority."}
  ],
  "recurrenceReview": {
    "status": "consume_existing",
    "ref": "build_tenants/abiogenesis/typescript/design/A5_PRIME_CONTRACTION_CENSUS.md#pc-001---consensus-contract-family-authorship"
  },
  "authoritySourceCount": {"before":18,"after":18},
  "authoringSourceCount": {"before":1,"after":1},
  "disposition": "consume_existing",
  "ownerTicket": "T-275"
}
```

This feature adds zero public schema identities, zero operation identities, zero
event kinds, zero stores, zero runtime controllers, and zero domain authors. It
adds one closed source/projection variant to the existing `project.read`
definition and extends graph-private relational checks over the same family.

## Domain View

```mermaid
classDiagram
  direction LR
  class ConsensusContractFamily {
    <<prime author>>
    +nine public variants
    +graph private variants
  }
  class ConsensusSubject {
    +subjectContractRef
    +subjectRef
    +subjectDigest
    +submittingActorRef
    +panelRef
    +roundPolicyRef
    +workspaceRef
    +ticketRef
    +ticketDigest
  }
  class ConsensusPanel {
    +panelRef
    +panelDigest
    +ordered profiles
  }
  class ConsensusReviewerProfile {
    +profileRef
    +roleContractRef
    +configurationDigest
    +instructionContractRef
    +resultContractRef
    +capabilityRefs
  }
  class ConsensusRoundPolicy {
    +policyRef
    +policyDigest
    +roundBudget
    +rule refs
  }
  class WorkspaceBinding {
    <<prime authority>>
  }
  class PublicRunInvocation {
    <<prime ingress>>
    +invocationRef
    +inputBasisRef
    +inputBasisDigest
  }
  class InvocationAuthority {
    <<prime authority join>>
    +actorAttributionRef
    +authoritySetRef
    +authoritySetDigest
  }
  class SubjectAdmissionBasis {
    <<subordinate exact join>>
  }
  class AdmittedGtlProgram {
    <<prime constructive program>>
  }
  class CatalogView {
    <<prime narrowing view>>
  }
  class ReviewerAssignment {
    <<subordinate ordered projection>>
    +panelOrdinal
  }
  class DeclaredExecutionRequest {
    <<T256 prime>>
  }
  class CCall {
    <<ABG effect locus>>
    +cCallRef
  }
  class ActorInvocation {
    <<ABG dispatch lifecycle>>
    +actorInvocationId
    +resultRef
  }
  class AssignmentInvocationBinding {
    <<subordinate lineage join>>
    +panelOrdinal
    +requestRef
    +cCallRef
    +actorInvocationId
  }
  class RawFpResultEnvelope {
    <<T257 wire admission>>
    +declared_schema_result
    +resultContractRef
    +payloadDigest
  }
  class DeclaredDomainAdmission {
    <<subordinate schema application>>
    +selectedSchemaRef
    +payloadDigest
  }
  class ReviewFindings {
    +profileRef
    +configurationDigest
    +invocationRef
  }
  class ConsensusResult {
    <<admitted domain result>>
    +resultRef
    +replayRef
  }
  class AdmittedOutputAuthority {
    <<payload ledger authority>>
  }
  class RuntimeEventLog {
    <<replay authority>>
  }
  class ProjectReadDefinition {
    <<AF03 public definition>>
    +ticket_consensus
  }
  class TicketConsensusProjection {
    <<subordinate pure projection>>
    +projectionRef
    +projectionDigest
  }

  ConsensusContractFamily *-- ConsensusSubject
  ConsensusContractFamily *-- ConsensusPanel
  ConsensusContractFamily *-- ConsensusReviewerProfile
  ConsensusContractFamily *-- ConsensusRoundPolicy
  ConsensusContractFamily *-- ReviewFindings
  ConsensusContractFamily *-- ConsensusResult
  ConsensusPanel *-- ConsensusReviewerProfile : ordered membership
  PublicRunInvocation *-- InvocationAuthority : requires exact
  PublicRunInvocation --> SubjectAdmissionBasis : derives
  InvocationAuthority --> SubjectAdmissionBasis : binds actor and authority
  ConsensusSubject --> SubjectAdmissionBasis : exact subject and ticket source
  SubjectAdmissionBasis --> WorkspaceBinding : same stable basis
  ConsensusSubject --> ConsensusPanel : exact ref
  ConsensusSubject --> ConsensusRoundPolicy : exact ref
  ConsensusSubject --> WorkspaceBinding : same workspace basis
  AdmittedGtlProgram --> ConsensusPanel : binds declared input
  AdmittedGtlProgram --> ConsensusRoundPolicy : binds declared policy
  CatalogView --> AdmittedGtlProgram : narrows declarations
  ConsensusReviewerProfile --> ReviewerAssignment : F_D derives
  ReviewerAssignment --> DeclaredExecutionRequest : T256 admits
  DeclaredExecutionRequest --> CCall : interpreter opens for request
  CCall --> ActorInvocation : effect handler dispatches
  ReviewerAssignment --> AssignmentInvocationBinding : exact assignment
  DeclaredExecutionRequest --> AssignmentInvocationBinding : exact request
  CCall --> AssignmentInvocationBinding : exact effect locus
  ActorInvocation --> AssignmentInvocationBinding : exact attempt
  ActorInvocation --> RawFpResultEnvelope : T257 admits wire result
  RawFpResultEnvelope --> DeclaredDomainAdmission : selected schema validates payload
  DeclaredDomainAdmission --> ReviewFindings : family decoder admits
  AssignmentInvocationBinding --> ReviewFindings : verifies attribution
  RuntimeEventLog --> AssignmentInvocationBinding : replay derives
  ConsensusResult --> AdmittedOutputAuthority : requires exact
  ConsensusResult --> RuntimeEventLog : requires reachable replay
  ProjectReadDefinition --> ConsensusResult : closed source relation
  ProjectReadDefinition --> TicketConsensusProjection : AF03 derives
```

## Execution Sequence

```mermaid
sequenceDiagram
  actor Caller
  participant Ingress as run.invoke Ingress
  participant Program as Admitted GTL Program
  participant Relation as Consensus Domain Relation
  participant Expand as F_D expand_panel
  participant Context as T256 Execution Context
  participant ABG as ABG Interpreter and Effect Handler
  participant Call as CCall and ActorInvocation
  participant Worker as Ordinary F_P Worker
  participant Wire as T257 Raw Wire Admission
  participant Domain as Declared Schema and Family Admission
  participant Graph as Canonical Consensus Graph
  participant Events as ABG Event Admission
  participant Ledger as Payload Ledger and Replay
  participant Read as AF03 project.read

  Caller->>Ingress: PublicInvocation with ConsensusSubject input
  Ingress->>Ingress: admit InvocationAuthority and exact input basis
  Ingress-->>Program: hand off invocation program binding and view
  Program->>Relation: declared subject panel policy workspace relation
  Relation->>Relation: verify subject source actor ticket refs digests and ordered profiles
  Relation->>Expand: admitted round and panel basis
  Expand-->>Context: one ReviewerAssignment per declared ordinal
  Context->>Context: verify selection config instruction result and capabilities
  Context-->>ABG: admitted DeclaredExecutionRequest
  ABG->>Call: open CCall and ActorInvocation for assignment
  Call->>Worker: ordinary effect-handler dispatch
  Worker-->>Call: raw declared-schema result envelope
  Call->>Wire: raw object and selected result contract
  Wire-->>Domain: exact envelope contract ref payload and digest
  Domain->>Domain: resolve selected schema decode payload bind assignment and invocation
  Domain-->>ABG: admitted attributed ReviewFindings
  ABG->>Events: admit result and causal lineage events
  Events-->>Graph: target-carrier ReviewFindings truth
  Graph->>Graph: fan in reduce recurse or hold through declared atoms
  alt F_H interaction held
    Graph-->>ABG: declared held disposition
    ABG-->>Caller: truthful nonterminal interaction and replay
    Note over Graph,Caller: T272 must admit response and continuation before final result
  else canonical result admitted
    Graph-->>ABG: declared ConsensusResult candidate
    ABG->>Ledger: admit target output and causal events
    Caller->>Read: project.read ticket_consensus for exact result
    Read->>Ledger: verify output authority result and replay basis
    Ledger-->>Read: exact admitted source truth
    Read-->>Caller: derived TicketConsensusProjection without event or write
  end
```

## State View

```mermaid
stateDiagram-v2
  [*] --> RawFamilyValues
  RawFamilyValues --> Rejected: local exact decoder fails
  RawFamilyValues --> LocallyAdmitted: all family members are exact and frozen
  LocallyAdmitted --> Rejected: invocation input actor subject or ticket authority mismatches
  LocallyAdmitted --> SubjectAuthorityBound: exact invocation and subject basis admitted
  SubjectAuthorityBound --> Rejected: panel policy workspace program or view relation mismatches
  SubjectAuthorityBound --> ConfigurationBound: exact configuration relation admitted
  ConfigurationBound --> Rejected: empty duplicate stale or digest-divergent profile basis
  ConfigurationBound --> AssignmentsDerived: F_D preserves panel order
  AssignmentsDerived --> Rejected: T256 selection config instruction result or capability relation fails
  AssignmentsDerived --> RequestsAdmitted: T256 admits declared execution requests
  RequestsAdmitted --> InvocationsOpened: ABG opens one CCall and ActorInvocation per request
  InvocationsOpened --> Rejected: effect or actor lineage is foreign or incomplete
  InvocationsOpened --> RawResultsObserved: worker returns exact declared-schema wire envelope
  RawResultsObserved --> Rejected: T257 wire profile or selected contract fails
  RawResultsObserved --> WireEnvelopesAdmitted: T257 admits raw envelopes only
  WireEnvelopesAdmitted --> Rejected: selected schema family decode or assignment invocation relation fails
  WireEnvelopesAdmitted --> FindingsAdmitted: declared-schema bridge admits attributed findings
  FindingsAdmitted --> RuntimeHeld: canonical graph opens F_H interaction
  RuntimeHeld --> RuntimeHeld: no final result or ticket projection exists
  RuntimeHeld --> FindingsAdmitted: T272 admits response and continuation
  FindingsAdmitted --> ResultCandidate: canonical graph emits declared output
  ResultCandidate --> Rejected: output authority result relation or replay basis fails
  ResultCandidate --> ResultAdmitted: exact ConsensusResult is replay reachable
  ResultAdmitted --> GenericResultReadable: non ticket subject
  ResultAdmitted --> TicketProjectable: exact ticket ref and digest present
  TicketProjectable --> Rejected: project request source basis or canonical digest mismatches
  TicketProjectable --> TicketProjected: AF03 derives pure read model
  GenericResultReadable --> [*]
  TicketProjected --> [*]
  Rejected --> [*]
```

Transition ownership is explicit. Public ingress owns invocation and stable
authority admission. The family decoder owns local domain admission. The
admitted program and F_D loci own configuration and ordered-assignment
derivation. T-256 owns execution-context admission only. ABG owns C-call, actor,
effect, and event lineage. T-257 owns raw wire-envelope admission only. The
generic declared-schema bridge applies the selected domain schema and verifies
the assignment/invocation relation. The canonical graph owns reduction,
recursion, F_H routing, and result production; ABG owns target-output and replay
admission. `AF-03` alone owns the pure ticket projection.

## Ontology Cross-View Evaluation

| Axiom | Domain evidence | Sequence evidence | State evidence | Enforcement | Verdict |
|---|---|---|---|---|---|
| one Consensus domain author | all public and private values derive from `ConsensusContractFamily` | one family enters every relation | local admission precedes relational admission | one schema map and indexed decoder | pass |
| subject authority is exact | subject basis joins public invocation input, actor, optional ticket, workspace, and authority | ingress admits before program handoff | authority mismatch rejects before configuration | invocation/input/source digest equality and jointly-present ticket law | pass |
| no profile selector in T-275 | assignment is subordinate to ordered panel membership | F_D projects each declared ordinal before T-256 | no selection state exists | exact panel/profile relation and T-256 selector contract | pass |
| raw wire admission is not domain truth | T257 envelope and declared-domain admission are distinct | selected schema runs after exact envelope admission | wire-admitted can still reject at domain admission | exact two-key generic profile plus selected family decoder | pass |
| attribution is not completion order | findings bind assignment, request, C-call, actor invocation, profile, and config | ABG creates invocation identity after T256 then schema admission joins it | stale or foreign invocation binding rejects | replay-derived assignment-invocation join and order differential | pass |
| result is runtime truth | result requires output authority and replay | graph emits before `project.read` | candidate cannot become admitted without matching basis | payload-ledger and canonical-event verification | pass |
| projection is pure | ticket projection is subordinate | read follows completed result and emits no event | projected state has no mutation transition | event-count and write-surface negatives | pass |
| F_H remains truthful nonterminal | held interaction is not a result | continuation is explicitly T-272-owned | RuntimeHeld cannot enter TicketProjectable | no projection without admitted result target | pass |
| 19-operation hard break | only accepted `run.invoke` and `project.read` appear | no feature-specific adapter participates | legacy route has no state | operation-definition/catalog/SDK/CLI parity scan | pass |

## Migration

1. Retain the one `ConsensusContractFamily`, its nine public variants, and two
   native vocabulary rosters.
2. Extend only the graph-private reviewer-assignment projection with the exact
   T-256 selection, configuration, instruction, result, and capability fields.
3. Add one relational admission module that consumes family values and existing
   GTL/ABG authorities without copying field rosters.
4. Bind every subject field, submitting actor, and optional ticket to the exact
   `run.invoke` input, `InvocationAuthority`, source, and workspace basis before
   panel expansion.
5. Extend T-257 with one generic `declared_schema_result` wire profile whose
   exact envelope is `{ resultContractRef, payload }`; resolve the selected
   schema from the admitted contract catalog and prove the same bridge with a
   non-Consensus fixture.
6. Join each assignment and T-256 request to the ABG-created C-call, actor
   invocation, raw envelope, and replay events; admit `payload` through the
   selected family decoder before target-carrier use.
7. Reuse `AdmittedOutputAuthorityProjection` for terminal result authority; add
   no result writer or store.
8. Add `ticket_consensus` to the existing closed `project.read`
   source/projection relation and derive projection identity and digest.
9. Preserve the canonical Consensus Module topology and structural body digest;
   a changed static source-closure digest is evidence, not a second body.
10. Extend focused tests with two differently attributed profiles, serialized
   parity, order differentials, result/replay conservation, and pure-read proof.
11. Remove or refuse every legacy operation, feature-specific handler, raw
   projection constructor, or compatibility path.

## Negative Proof

- unknown, missing, extra, or cross-variant fields fail local admission;
- empty panels and duplicate profile identities fail;
- subject contract/ref/digest, submitting actor, invocation input, workspace, or
  jointly-present ticket ref/digest mismatch fails before panel expansion;
- panel digest, policy digest, or profile configuration drift fails;
- subject panel, policy, workspace, program, or catalog-view mismatch fails;
- an assignment missing a panel member, reusing an ordinal, or changing profile
  execution contracts fails;
- the generic wire profile rejects missing, extra, flattened, or alternate
  envelope keys and a selected-contract mismatch before domain decoding;
- the selected schema rejects malformed domain payload even when the raw
  envelope and echoed contract ref are valid;
- a non-Consensus declared-schema fixture crosses the same wire/profile/schema
  bridge without importing Consensus vocabulary;
- a finding without the exact assignment, request, C-call, actor invocation,
  result ref, and replay event chain fails attribution;
- findings with a foreign profile, stale configuration, foreign invocation,
  malformed output digest, wrong result contract, or unreachable evidence fail;
- reversing worker completion order preserves the same panel-ordinal attribution
  and deterministic reduction input;
- missing, rejected, ambiguous, foreign-basis, or digest-divergent output
  authority cannot produce a Consensus result;
- result subject, panel, policy, round, finding, ruling, terminal outcome,
  evidence, lineage, result, or replay mismatch fails;
- a held F_H interaction cannot be decoded or projected as a final result;
- a non-ticket subject cannot produce a ticket projection;
- a forged or caller-supplied ticket, projection ref, or projection digest fails;
- `project.read` leaves the event stream, ticket bytes, ticket status, and
  workspace mutation surfaces unchanged;
- no `ticket.consensus`, `catalog.invoke`, `read.result`, `read.replay`,
  Consensus-specific CLI verb, handler, store, or compatibility alias exists;
- native and serialized admission retain the same field and value-domain
  meaning; and
- the packed public API exposes typed public admission/projection only, not the
  graph-private domain dispatcher or assignment constructors.

## Stop Conditions

- stop if relational admission copies or independently authors a public field
  roster, enum roster, or schema;
- stop if reviewer assignment selects a worker instead of preserving a declared
  selection contract;
- stop if profile, panel, policy, or configuration truth comes from ambient
  files, labels, adapter position, or completion order;
- stop if a read path writes an event, stores a projection, or mutates a ticket;
- stop if result truth can bypass T-257, target-carrier admission, payload
  authority, or canonical replay;
- stop if T-257 claims domain validation, if the generic envelope admits dynamic
  top-level fields, or if echoed contract identity counts as schema success;
- stop if T-256 dispatches work or if an assignment pre-authors C-call or actor-
  invocation identity;
- stop if a held F_H state is relabeled as a terminal result;
- stop if implementation changes canonical graph topology merely to satisfy the
  projector; route that typed structural gap to the owning GTL design;
- stop if any operation beyond accepted `run.invoke` and `project.read` is
  required for this feature; and
- stop implementation until T-281, T-270, and T-274 are complete on the same
  target basis; and
- stop and reprice if the one-family contract cannot express a required public
  field without inventing product meaning.
